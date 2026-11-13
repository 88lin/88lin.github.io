#!/usr/bin/env python3
"""把已校验的公众号正文片段（纯 <section>）包成带「复制」按钮的浏览器预览页。

用户打开预览页 → 点右上角「复制到公众号」→ 按钮选中并复制里面渲染后的富文本
（等价手动 Ctrl+A/Ctrl+C，样式全保留）→ 到公众号编辑器 Ctrl+V 粘贴即可。

按钮和 JS 只存在于预览外壳里，**不在被复制的 section 内**，所以粘进公众号的
仍是干净合规的正文，不含 <script>/<button>。校验请对原始 section 文件跑
validate_gzh_html.py（本预览页含 script/style，不参与校验）。

用法:
    wrap_preview.py <section.html> [output.html]
    默认输出 <section去扩展名>_预览.html
"""

import os
import sys
from html import escape
from pathlib import Path
from urllib.parse import quote

if __package__:
    from .cli_utils import configure_stdio
else:
    from cli_utils import configure_stdio


def render_preview(content, title, base_url='./'):
    """Render the shared preview shell for local articles and the online gallery."""
    template = Path(__file__).resolve().parents[1] / 'assets' / 'preview-template.html'
    tpl = template.read_text(encoding='utf-8')
    return (tpl.replace('{{BASE_URL}}', escape(base_url, quote=True))
            .replace('{{TITLE}}', escape(title)).replace('<!--GZH_CONTENT-->', content.strip()))


def main():
    configure_stdio()
    if len(sys.argv) < 2:
        print("用法: wrap_preview.py <section.html> [output.html]")
        sys.exit(1)
    src = sys.argv[1]
    if not os.path.isfile(src):
        print(f"✗ 找不到文件: {src}")
        sys.exit(1)

    try:
        content = Path(src).read_text(encoding="utf-8").strip()
    except (OSError, UnicodeError) as exc:
        print(f"✗ 读不到正文文件 {src}: {exc}")
        sys.exit(1)
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(src)[0] + "_预览.html"
    # Resolve every relative resource (img/srcset/CSS URLs) against the article.
    # A relative base keeps previews portable when their containing tree moves.
    source_dir, output_dir = Path(src).resolve().parent, Path(out).resolve().parent
    try:
        relative = os.path.relpath(source_dir, output_dir).replace(os.sep, '/')
        base_url = quote(relative, safe='/') + '/'
    except ValueError:  # Different Windows drives cannot have a relative path.
        base_url = source_dir.as_uri() + '/'
    title = os.path.splitext(os.path.basename(src))[0]
    try:
        out_html = render_preview(content, title, base_url)
    except (OSError, UnicodeError) as exc:
        print(f"✗ 读不到预览模板: {exc}")
        sys.exit(1)

    try:
        Path(out).write_text(out_html, encoding="utf-8")
    except OSError as exc:
        print(f"✗ 写不出预览页 {out}: {exc}")
        sys.exit(1)
    print(f"✓ 已生成带「复制」按钮的预览页: {out}")
    print("  用浏览器打开它，点右上角「复制到公众号」，再去公众号编辑器 Ctrl/⌘+V 粘贴。")


if __name__ == "__main__":
    main()
