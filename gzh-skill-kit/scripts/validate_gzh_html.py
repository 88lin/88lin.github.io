#!/usr/bin/env python3
"""微信公众号 HTML 合规校验器。

把 SKILL.md 里"必须遵守的平台限制"从模型自觉变成确定性兜底。
排版生成后必跑：检查禁用标签/属性/样式，并核查文字节点是否用
<span leaf=""> 包裹（公众号编辑器粘贴后保持样式的关键）。

覆盖的致命项：禁用标签/属性（div/class/id/style/script/position/float/
grid/@media/CSS 变量/外部字体）、**可点击的 `<a href>`**、**SVG 动画/引用**、
**漏包 `<span leaf="">`**、**空输入**。半角标点（, . ; : ! ?）与英文直引号
报 WARNING，按 SKILL.md 要求同样要修到 0 再交付。

用法:
    validate_gzh_html.py <file.html>
    validate_gzh_html.py --stdin < file.html

退出码: 1 = 有 ERROR（会被公众号过滤或粘贴后样式丢失）; 0 = 通过。
"""

import argparse
import re
import sys
from html.parser import HTMLParser

if __package__:
    from .cli_utils import configure_stdio
    from .markup_checks import VOID_TAGS, inspect_markup
else:
    from cli_utils import configure_stdio
    from markup_checks import VOID_TAGS, inspect_markup

CJK = re.compile(r"[一-鿿㐀-䶿]")
ALNUM = re.compile(r"[A-Za-z0-9]")
SKIP_TAGS = {"head", "title", "style", "script"}  # 不参与公众号正文粘贴的区域
# 中文字后紧跟半角标点（应改全角）；只查"中文在前"避免中英混排误伤。
# 覆盖 , . ; : ! ? —— 早期版本漏了 . 和 :，是实际使用中最常见的漏网点。
# (?!\d) 放过「共 3.5 万」「时间:30」这类数字紧跟的场景。
HALF_PUNCT = re.compile(r"[一-鿿㐀-䶿][,.;:!?](?!\d)")
# 英文撇号（don't / it's）不是直引号误用，先整词排除再查
APOSTROPHE_WORD = re.compile(r"[A-Za-z]'[A-Za-z]")
ASCII_QUOTE = re.compile(r"[\"']")
# 代码区特征：等宽字体或 white-space:pre —— 其内半角符号是正常的
CODE_STYLE = re.compile(r"monospace|white-space\s*:\s*pre|courier|consolas|sf mono", re.I)


class LeafChecker(HTMLParser):
    """检查每个非空文本节点是否处于 <span leaf> 内。"""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []           # [(tag, is_leaf, is_code)]
        self.leaf_depth = 0       # 处于 span[leaf] 内的嵌套计数
        self.code_depth = 0       # 处于代码区（等宽/pre）内的嵌套计数
        self.span_leaf_count = 0  # 全文 span leaf 总数
        self.unwrapped = []       # (文本片段, 父标签) —— 未被 leaf 包裹的中文文本
        self.half_punct = []      # 正文里疑似半角标点的片段

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)
        # 任何带 leaf 属性的元素都算"已包裹"——不只是 <span>。
        # olive-journal 的流程图用 SVG <tspan leaf="">，此前被误判成未包裹文字。
        is_leaf = "leaf" in ad
        is_code = bool(CODE_STYLE.search(ad.get("style", "") or ""))
        if is_leaf:
            self.span_leaf_count += 1
            self.leaf_depth += 1
        if is_code:
            self.code_depth += 1
        if tag not in VOID_TAGS:
            self.stack.append((tag, is_leaf, is_code))
        else:
            self.leaf_depth -= int(is_leaf)
            self.code_depth -= int(is_code)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                for _, was_leaf, was_code in self.stack[i:]:
                    if was_leaf:
                        self.leaf_depth -= 1
                    if was_code:
                        self.code_depth -= 1
                del self.stack[i:]
                break

    def handle_data(self, data):
        text = data.strip()
        # 只要含中文或英数就当"有实质内容的文本节点"——早期版本只认中文，
        # 导致纯英文段落漏包 <span leaf> 时完全不告警。
        if not text or not (CJK.search(text) or ALNUM.search(text)):
            return
        if any(t in SKIP_TAGS for t, _, _ in self.stack):
            return  # <head>/<title>/<style>/<script> 内文字不进公众号正文
        if self.leaf_depth == 0:
            parent = self.stack[-1][0] if self.stack else "(root)"
            snippet = text[:24] + ("…" if len(text) > 24 else "")
            self.unwrapped.append((snippet, parent))
        if self.code_depth == 0 and (HALF_PUNCT.search(text)
                                     or self._has_straight_quote(text)):
            snippet = text[:24] + ("…" if len(text) > 24 else "")
            self.half_punct.append(snippet)

    @staticmethod
    def _has_straight_quote(text):
        """查英文直引号；先剔掉 don't / it's 这类撇号，避免误报。"""
        return bool(ASCII_QUOTE.search(APOSTROPHE_WORD.sub("", text)))


def validate(html, name="<input>"):
    errors, warnings = [], []

    # 空输入必须拦住：早期版本对空字符串报"完全合规"，
    # 读取失败 / 生成失败 / 管道没接上时会被误判为通过。
    if not html or not html.strip():
        errors.append("输入为空——没有可校验的 HTML 内容"
                      "（检查文件路径是否正确、生成步骤是否真的产出了内容）")
        return errors, warnings, 0

    markup = inspect_markup(html)
    for level, message in markup.findings:
        (errors if level == "ERROR" else warnings).append(message)

    checker = LeafChecker()
    try:
        checker.feed(html)
    except Exception as e:  # 容错：解析失败不致命，只提示
        warnings.append(f"HTML 解析中断: {e}")

    has_cjk = bool(CJK.search(html))
    if has_cjk and checker.span_leaf_count == 0:
        errors.append("全文没有任何 <span leaf=\"\"> 包裹——"
                      "粘贴到公众号后样式会大面积丢失")
    elif checker.unwrapped:
        # 漏 <span leaf> 是"粘贴后样式整片丢失"的致命错，按 ERROR 处理——
        # 早期版本只报 WARNING（退出码 0），Agent 会误以为已通过。
        sample = "；".join(f"「{s}」(在 <{p}> 内)"
                           for s, p in checker.unwrapped[:5])
        errors.append(
            f"{len(checker.unwrapped)} 处文本未被 <span leaf=\"\"> 包裹，"
            f"粘贴到公众号后这些文字的样式会丢失。例：{sample}")

    if checker.half_punct:
        sample = "；".join(f"「{s}」" for s in checker.half_punct[:5])
        warnings.append(
            f"{len(checker.half_punct)} 处正文疑似半角标点/英文引号，应改中文全角"
            f"（代码块内不计）。例：{sample}")

    if markup.sections > 1 and markup.uncovered:
        sample = "；".join(dict.fromkeys(markup.uncovered[:5]))
        warnings.append(
            "正文区块依赖最外层背景，缺少独立的非透明底色：" + sample)

    return errors, warnings, checker.span_leaf_count


def main():
    configure_stdio()
    ap = argparse.ArgumentParser()
    ap.add_argument("file", nargs="?", help="HTML 文件路径")
    ap.add_argument("--stdin", action="store_true", help="从标准输入读取")
    args = ap.parse_args()

    if args.stdin or not args.file:
        html = sys.stdin.read()
        name = "<stdin>"
    else:
        try:
            with open(args.file, encoding="utf-8") as f:
                html = f.read()
        except (OSError, UnicodeError) as e:
            print(f"❌ 读取失败（请检查路径是否正确）: {e}")
            sys.exit(1)
        name = args.file

    errors, warnings, leaf_n = validate(html, name)

    print(f"📋 公众号 HTML 合规校验: {name}")
    print(f"   span leaf 包裹: {leaf_n} 处")
    if errors:
        print(f"\n❌ ERROR ×{len(errors)}（必须修复，否则粘贴后失效）:")
        for e in errors:
            print(f"   • {e}")
    if warnings:
        print(f"\n⚠️  WARNING ×{len(warnings)}（建议检查）:")
        for w in warnings:
            print(f"   • {w}")
    if not errors and not warnings:
        print("\n✅ 完全合规，可直接粘贴到公众号编辑器")
    elif not errors:
        print("\n✅ 无致命问题，可粘贴（warning 请人工确认）")

    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
