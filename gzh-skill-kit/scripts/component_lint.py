#!/usr/bin/env python3
"""组件库源头检查器 —— 可验证循环的第一道关。

扫描 references/ 下所有组件库 .md 里的 ```html 代码块，检测会导致
排版问题的反模式。只看真实组件 HTML，不被说明文字干扰（grep 做不到）。

与 validate_gzh_html.py 配合构成闭环：
  改组件库 → component_lint.py 扫源头 → 生成产物 → validate_gzh_html.py 扫产物 → 修 → 重复

用法：
    component_lint.py [skill-dir]   # 默认当前目录
退出码：1 = 有 ERROR，0 = 通过。
"""

import glob
import os
import re
import sys
from pathlib import Path

# 复用产物关的 leaf 检测，两关同一判据；支持 CLI 和模块导入。
if __package__:
    from .validate_gzh_html import LeafChecker
    from .cli_utils import configure_stdio
    from .markup_checks import inspect_markup
else:
    from validate_gzh_html import LeafChecker
    from cli_utils import configure_stdio
    from markup_checks import inspect_markup

CJK = re.compile(r"[一-鿿㐀-䶿]")

# 四周虚线框：border: ... dashed（不含方向，如 border-left dashed 不算）
FOURSIDE_DASHED = re.compile(r"border\s*:\s*[^;{}]*dashed", re.I)
CENTERED = re.compile(r"text-align\s*:\s*center", re.I)


def lint_file(path):
    text = Path(path).read_text(encoding="utf-8")
    name = os.path.basename(path).replace("公众号排版组件库 —— ", "").replace(".md", "")
    found = []  # (level, msg)
    seen = set()

    def add(level, msg):
        if msg not in seen:
            seen.add(msg)
            found.append((level, msg))

    # .html 产物（docs/gallery 下的主题示例）整份当一个块扫；
    # .md 组件库只扫 ```html 围栏内的块，避免说明文字干扰。
    blocks = ([text] if path.lower().endswith(".html")
              else [m.group(1) for m in re.finditer(r"```html\s*\n(.*?)```", text, re.S)])

    for html in blocks:
        markup = inspect_markup(html)
        for level, message in markup.findings:
            add(level, message)
        # 漏 <span leaf=""> 包裹：粘贴后样式整片丢失，是最高频致命错。
        # 用真正的 HTML 解析器找"裸露的文本节点"，而不是正则匹配——
        # 否则注释里的中文、属性里的中文都会被误判。
        checker = LeafChecker()
        try:
            checker.feed(html)
        except Exception as e:  # 解析失败不致命，跳过该项
            add("WARN", f"组件块 HTML 解析中断，跳过 leaf 检查: {e}")
        if checker.unwrapped:
            sample = "；".join(f"「{s}」(在 <{p}> 内)"
                               for s, p in checker.unwrapped[:3])
            add("ERROR", f"有文本节点未被 <span leaf=\"\"> 包裹——"
                         f"粘贴后样式会丢失。例：{sample}")
        if checker.span_leaf_count == 0 and CJK.search(
                re.sub(r"<!--.*?-->", "", html, flags=re.S)):
            add("ERROR", "整个组件块没有任何 <span leaf=\"\"> 包裹——"
                         "所有文字节点都必须包一层")
        # 四周虚线框：正文强调勿用；居中块视为"占位/素材"组件，豁免
        if any(FOURSIDE_DASHED.search(style) for style in markup.styles) and not any(CENTERED.search(style) for style in markup.styles):
            add("WARN", "四周虚线框 border:…dashed（正文强调请用左竖条；"
                        "仅居中的素材占位块可用 dashed）")
        # 移动端守护：内容容器固定像素宽(≥150px)且未配 max-width —— 手机端易被压缩/溢出
        for style in markup.styles:
            has_maxw = re.search(r'max-width\s*:', style, re.I)
            for decl in style.split(';'):
                prop, _, val = decl.partition(':')
                if prop.strip().lower() != 'width':
                    continue
                m = re.match(r'\s*(\d+)\s*px', val)
                if m and int(m.group(1)) >= 150 and not has_maxw:
                    add("WARN", f"固定宽度 width:{m.group(1)}px（≥150px）未配 "
                                "max-width——手机端会被压缩或溢出，改用 "
                                "max-width / 百分比 / flex:1")
                    break
    return name, found


def main():
    configure_stdio()
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    refs = sorted(glob.glob(os.path.join(root, "references", "*.md")))
    if not refs:
        print(f"未找到 {root}/references/*.md")
        sys.exit(1)

    # 已交付的主题示例产物一并纳入源头关，防止"库改了但示例没跟上"。
    # 跳过 index.html（它是画廊外壳页，含 style/class/@media，本就不进公众号）。
    products = [p for p in sorted(glob.glob(os.path.join(root, "docs", "gallery", "*.html")))
                if os.path.basename(p) != "index.html"]

    targets = refs + products
    total_err = total_warn = clean = 0
    print(f"📐 组件库源头检查：{len(refs)} 个库 + {len(products)} 份示例产物\n")
    for path in targets:
        name, found = lint_file(path)
        if not found:
            clean += 1
            continue
        errs = [m for lv, m in found if lv == "ERROR"]
        warns = [m for lv, m in found if lv == "WARN"]
        total_err += len(errs)
        total_warn += len(warns)
        print(f"── {name} ──")
        for m in errs:
            print(f"   ❌ {m}")
        for m in warns:
            print(f"   ⚠️  {m}")

    print(f"\n汇总：{clean}/{len(targets)} 个检查对象干净，"
          f"ERROR×{total_err}，WARN×{total_warn}")
    if total_err == 0 and total_warn == 0:
        print("✅ 全部组件库源头无反模式")
    sys.exit(1 if total_err else 0)


if __name__ == "__main__":
    main()
