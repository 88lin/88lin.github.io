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
from html.parser import HTMLParser

if __package__:
    from .cli_utils import configure_stdio, print_status
    from .markup_checks import declarations
else:
    from cli_utils import configure_stdio, print_status
    from markup_checks import declarations


BLOCK_TAGS = {
    'address', 'article', 'aside', 'blockquote', 'div', 'dl', 'dt', 'dd',
    'figure', 'figcaption', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
    'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section',
    'table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th', 'ul', 'br',
}
VOID_TAGS = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
             'link', 'meta', 'param', 'source', 'track', 'wbr'}
BLOCK_DISPLAYS = {'block', 'list-item', 'flow-root', 'flex', 'grid', 'table'}
# inline-block and friends flow like words outside but lay out their content as a
# block, so whitespace just inside them is at a line edge; hidden content never renders.
INNER_EDGE_DISPLAYS = BLOCK_DISPLAYS | {'inline-block', 'inline-flex', 'inline-grid',
                                        'inline-table', 'none'}


def _display_edges(tag, style):
    """Return (outer, inner): whether spaces around / just inside the tag are line edges."""
    display, important = '', False
    for prop, value in declarations(style):
        if prop != 'display':
            continue
        priority = bool(re.search(r'!\s*important\s*$', value, re.I))
        if priority or not important:
            display = re.sub(r'!\s*important\s*$', '', value, flags=re.I).strip().lower()
            important = priority
    if tag == 'br':
        return True, True
    if not display:
        return tag in BLOCK_TAGS, tag in BLOCK_TAGS
    # Unknown/inherited display is treated conservatively: keeping a separator
    # is safer than joining words. Multi-keyword CSS uses its outer display type.
    keywords = set(display.split())
    return ('inline' not in keywords and bool(keywords & BLOCK_DISPLAYS),
            bool(keywords & INNER_EDGE_DISPLAYS))


class _Minifier(HTMLParser):
    """Keep token boundaries: indentation is not the same as inline whitespace."""

    def __init__(self, source):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.offsets = [0] + [match.end() for match in re.finditer('\n', source)]
        self.tokens = []  # (kind, edge_before, edge_after, source, preserve_whitespace)
        self.stack = []   # (tag, preserve_whitespace, inner_edge, outer_edge)

    def handle_starttag(self, tag, attrs, closed=False):
        inherited = self.stack[-1][1] if self.stack else False
        style = dict(attrs).get('style', '') or ''
        preserve = inherited or tag in {'pre', 'textarea', 'script', 'style'} or bool(
            re.search(r'white-space\s*:\s*(?:pre|break-spaces)', style, re.I))
        raw = self.get_starttag_text()
        # Whitespace in a multiline start tag separates attributes / SVG numbers.
        raw = re.sub(r'[\r\n]+[ \t]*', ' ', raw)
        outer, inner = _display_edges(tag, style)
        if tag in VOID_TAGS or closed:
            self.tokens.append(('start', outer, outer, raw, preserve))  # nothing inside
        else:
            self.tokens.append(('start', outer, inner, raw, preserve))
            self.stack.append((tag, preserve, inner, outer))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs, closed=True)

    def handle_endtag(self, tag):
        inner = outer = tag in BLOCK_TAGS
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                inner, outer = self.stack[i][2:]
                del self.stack[i:]
                break
        self.tokens.append(('end', inner, outer, f'</{tag}>', False))

    def handle_data(self, data):
        if self.tokens and self.tokens[-1][0] == 'text':
            # A dropped comment splits one whitespace run; edges must see it whole.
            data = self.tokens.pop()[3] + data
        self.tokens.append(('text', False, False, data, bool(self.stack and self.stack[-1][1])))

    def _reference(self, prefix):
        # HTMLParser also calls these handlers for AT&T and semicolonless
        # references. Slice the original spelling instead of inventing a ';'.
        row, column = self.getpos()
        start = self.offsets[row - 1] + column
        end = start + len(prefix)
        if self.source[end:end + 1] == ';':
            end += 1
        self.tokens.append(('entity', False, False, self.source[start:end], False))

    def handle_entityref(self, name):
        self._reference(f'&{name}')

    def handle_charref(self, name):
        self._reference(f'&#{name}')

    def handle_decl(self, decl):
        self.tokens.append(('decl', False, False, f'<!{decl}>', False))

    def result(self):
        output = []
        for i, (kind, _, _, raw, preserve) in enumerate(self.tokens):
            if kind == 'text' and not preserve:
                # HTML collapses ASCII whitespace, not NBSP or full-width spaces.
                raw = re.sub(r'[ \t\r\n\f]+', ' ', raw)
                prev = self.tokens[i - 1] if i else None
                nxt = self.tokens[i + 1] if i + 1 < len(self.tokens) else None
                if prev is None or prev[2]:
                    raw = raw.lstrip(' ')
                if nxt is None or nxt[1]:
                    raw = raw.rstrip(' ')
            output.append(raw)
        return ''.join(output).strip()


def minify_html(html):
    """移除注释和块间缩进，保留行内分词空格、实体和代码原文。

    pre / white-space:pre 内容保留原始空白；公众号代码块应使用每行一个 p，
    而不是靠压缩器改写有意义的代码缩进。
    """
    parser = _Minifier(html)
    parser.feed(html)
    parser.close()
    return parser.result()


def minify_file(input_path, output_path=None):
    """压缩 HTML 文件"""
    with open(input_path, 'r', encoding='utf-8') as f:
        html = f.read()

    minified = minify_html(html)

    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(minified)
        print_status(f"压缩完成: {input_path} → {output_path}")
        print_status(f"  原始: {len(html)} 字符, 换行 {html.count(chr(10))} 个")
        print_status(f"  压缩: {len(minified)} 字符, 换行 {minified.count(chr(10))} 个")
    else:
        # 就地压缩。备份只在"还没备份过"时写——否则第二次运行会把
        # 已压缩的内容写进 .bak，真正的原始文件就再也找不回来了。
        backup = input_path + '.bak'
        if os.path.exists(backup):
            print_status(f"压缩完成（沿用已有备份: {backup}，未被覆盖）")
        else:
            with open(backup, 'w', encoding='utf-8') as f:
                f.write(html)
            print_status(f"压缩完成（原始备份: {backup}）")
        with open(input_path, 'w', encoding='utf-8') as f:
            f.write(minified)
        print_status(f"  原始: {len(html)} 字符, 换行 {html.count(chr(10))} 个")
        print_status(f"  压缩: {len(minified)} 字符, 换行 {minified.count(chr(10))} 个")

    return minified


if __name__ == '__main__':
    configure_stdio()
    if len(sys.argv) < 2:
        print_status(__doc__)
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    minify_file(input_file, output_file)
