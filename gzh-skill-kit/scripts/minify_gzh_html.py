#!/usr/bin/env python3
"""
微信公众号 HTML 压缩工具。

压缩规则：去掉标签之间的换行和缩进，防止手机端解析器
把 HTML 源码里的换行/空格误转成 &nbsp; 从而破坏排版。

用法：
    python3 minify_gzh_html.py <输入.html> [输出.html]

或作为模块导入：
    from minify_gzh_html import minify_html
    minified = minify_html(html_string)
"""
import os
import re
import sys


def minify_html(html):
    """
    压缩公众号 HTML：去掉标签之间的换行和缩进，
    以及文字内容里的多余换行。

    原理：手机端解析器会把 HTML 源码里标签之间的换行和缩进，
    误读成文字内容里的空白并转换成 &nbsp;，导致排版错乱。
    压缩后手机解析器找不到"原料"，问题根治。

    同时，文字节点内的换行（如标签属性后的文字中间换行）
    也会被微信编辑器当作文本换行处理，必须去掉。

    注意：
    - 不动 <span leaf=""> 包裹的文字内容里的正常空格
    - 行内软换行只在"两侧都是英数"时补一个空格，避免把
      "will\\nremove" 拼成 "willremove"；中文之间不补空格
    """
    # 移除 HTML 注释
    html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)

    # 只去掉"含换行"的标签间空白（即源码缩进/换行）。
    # 不能用 >\s+< —— 那会把 </span> <span> 之间渲染上真实存在的空格也吃掉
    # （"赞 转发" 会变成 "赞转发"）。
    html = re.sub(r'>[ \t]*\n[ \t]*<', '><', html)

    # 去掉文字节点里的软换行：逐行 strip 后拼回。
    # 拼回时若前一行末字符与下一行首字符都是英数，补一个空格再拼。
    lines = html.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue  # 纯空白行（标签间空行）直接丢掉
        if cleaned_lines and _needs_space(cleaned_lines[-1], stripped):
            cleaned_lines[-1] = cleaned_lines[-1] + ' '
        cleaned_lines.append(stripped)

    return ''.join(cleaned_lines).strip()


def _needs_space(prev, nxt):
    """判断拼接处是否要补空格：仅当"上一行末字符"和"下一行首字符"都是英数时补。

    中文之间不补（本来就没有词间空格），中英/英中之间也不补（避免多余空隙），
    只有 will⏎remove 这类纯英文软换行才需要补，否则会粘成 willremove。
    """
    return bool(re.match(r'[A-Za-z0-9]', prev[-1:])) and bool(re.match(r'[A-Za-z0-9]', nxt[:1]))


def minify_file(input_path, output_path=None):
    """压缩 HTML 文件"""
    with open(input_path, 'r', encoding='utf-8') as f:
        html = f.read()

    minified = minify_html(html)

    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(minified)
        print(f"压缩完成: {input_path} → {output_path}")
        print(f"  原始: {len(html)} 字符, 换行 {html.count(chr(10))} 个")
        print(f"  压缩: {len(minified)} 字符, 换行 {minified.count(chr(10))} 个")
    else:
        # 就地压缩。备份只在"还没备份过"时写——否则第二次运行会把
        # 已压缩的内容写进 .bak，真正的原始文件就再也找不回来了。
        backup = input_path + '.bak'
        if os.path.exists(backup):
            print(f"压缩完成（沿用已有备份: {backup}，未被覆盖）")
        else:
            with open(backup, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"压缩完成（原始备份: {backup}）")
        with open(input_path, 'w', encoding='utf-8') as f:
            f.write(minified)
        print(f"  原始: {len(html)} 字符, 换行 {html.count(chr(10))} 个")
        print(f"  压缩: {len(minified)} 字符, 换行 {minified.count(chr(10))} 个")

    return minified


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    minify_file(input_file, output_file)
