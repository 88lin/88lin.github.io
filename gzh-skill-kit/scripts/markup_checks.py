"""Checks shared by component and article validation (real markup only)."""

import re
from html.parser import HTMLParser

VOID_TAGS = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
             'link', 'meta', 'param', 'source', 'track', 'wbr'}
BLOCK_TAGS = {'section', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'blockquote', 'ul', 'ol', 'li', 'figure', 'figcaption', 'td', 'th'}
FORBIDDEN_TAGS = {'style', 'script', 'div', 'link', 'form', 'input', 'button',
                  'textarea', 'select', 'video', 'audio', 'canvas', 'iframe',
                  'foreignobject', 'animate', 'animatetransform', 'animatemotion', 'set'}
STYLE_RULES = [
    (r'position\s*:\s*(fixed|absolute|sticky)\b', 'position fixed/absolute/sticky 不被支持'),
    (r'float\s*:', 'float 不被支持'),
    (r'@(media|keyframes|import)\b', '@media/@keyframes/@import 不被支持'),
    (r'display\s*:\s*grid\b', 'display:grid 不被支持'),
    (r'var\s*\(\s*--', 'CSS 变量 var(--x) 不被支持'),
    (r'url\s*\(\s*[\'"]?https?://[^)]*\.(woff2?|ttf|otf|eot)', '外部字体不被支持'),
    (r'white-space\s*:\s*pre', 'white-space:pre 不适合公众号代码块，请改成每行一个 p'),
]
NAMED_COLORS = set('''aliceblue antiquewhite aqua aquamarine azure beige bisque black
blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral
cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen
darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon
darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink
deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro
ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo
ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen
lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen
magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream
mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum
powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown
seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen
steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'''.split())


def declarations(style):
    """Split declarations without splitting semicolons inside quotes / URLs."""
    parts, start, depth, quote, escaped = [], 0, 0, None, False
    for i, char in enumerate(style):
        if escaped:
            escaped = False
        elif char == '\\':
            escaped = True
        elif quote:
            if char == quote:
                quote = None
        elif char in '\'"':
            quote = char
        elif char == '(':
            depth += 1
        elif char == ')':
            depth = max(0, depth - 1)
        elif char == ';' and depth == 0:
            parts.append(style[start:i])
            start = i + 1
    parts.append(style[start:])
    return [(key.strip().lower(), val.strip()) for part in parts
            for key, sep, val in [part.partition(':')] if sep]


def has_background(style):
    """Whether a block has a self-contained base, not just transparent paint."""
    color, image = '', ''
    for prop, value in declarations(style):
        value = re.sub(r'\s*!important\s*$', '', value.lower())
        if prop == 'background':
            # Image function arguments (e.g. a URL named white.png) are not a base color.
            color = re.sub(r'(?:url|(?:repeating-)?(?:linear|radial|conic)-gradient)'
                           r'\((?:[^()]|\([^()]*\))*\)', '', value)
            image = value  # shorthand resets both longhands
        elif prop == 'background-color':
            color = value
        elif prop == 'background-image':
            image = value

    def opaque(value):
        if not value or value in {'none', 'transparent', 'inherit', 'initial',
                                  'unset', 'revert', 'currentcolor'}:
            return False
        if re.search(r'\btransparent\b|\bvar\(', value):
            return False
        # Alpha-bearing colors only cover the canvas if alpha is fully opaque.
        for args in re.findall(r'\b(?:rgb|hsl)a?\(([^)]*)\)', value):
            alpha = args.rsplit('/', 1)[-1].strip() if '/' in args else (
                args.rsplit(',', 1)[-1].strip() if args.count(',') == 3 else '1')
            if not re.fullmatch(r'[+-]?(?:\d+\.?\d*|\.\d+)%?', alpha):
                return False
            if float(alpha.rstrip('%')) < (100 if '%' in alpha else 1):
                return False
        for value_hex in re.findall(r'#([0-9a-f]+)\b', value):
            if len(value_hex) in (4, 8) and value_hex[-(1 if len(value_hex) == 4 else 2):] not in {'f', 'ff'}:
                return False
        return bool(re.search(r'#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b|\b(?:rgb|hsl)a?\(', value)
                    or NAMED_COLORS.intersection(re.findall(r'\b[a-z]+\b', value)))

    return opaque(color) or (opaque(image) and 'gradient(' in image)


class MarkupChecker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.findings = []
        self.styles = []
        self.stack = []  # (tag, covered_by_inner_block)
        self.sections = 0
        self.uncovered = []

    def add(self, level, message):
        if (level, message) not in self.findings:
            self.findings.append((level, message))

    def handle_starttag(self, tag, attrs):
        raw = self.get_starttag_text()
        tag_end = re.match(r'<[^\s/>]+', raw).end()
        attributes = re.finditer(r'''[^\s=/>]+(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?''', raw[tag_end:])
        if any((match.group(1) or '').startswith(('\\"', "\\'")) for match in attributes):
            self.add('ERROR', '属性引号被反斜杠转义，style 会被截断；请使用正常 HTML 引号')
        if tag in FORBIDDEN_TAGS:
            self.add('ERROR', f'<{tag}> 不被支持（SVG 仅允许静态图形）')
        if tag in {'figure', 'figcaption'}:
            self.add('WARN', f'<{tag}> 可能被微信改写，建议用 section/p')
        ad = dict(attrs)
        for key, value in attrs:
            if key in {'class', 'id'} or key.startswith('on'):
                self.add('ERROR', f'{key} 属性会被剥离，请使用静态内联样式')
            if key in {'fill', 'stroke', 'filter', 'clip-path', 'mask', 'style'} and re.search(
                    r'url\s*\(\s*[\'"]?\s*#', value or '', re.I):
                self.add('WARN', 'SVG url(#id) 引用可能被过滤，请使用自包含静态图形')
        if tag == 'a' and 'href' in ad:
            self.add('ERROR', '正文外链不可点击，请将 a href 转为上标角标和参考资料')
        style = ad.get('style', '') or ''
        self.styles.append(style)
        for pattern, message in STYLE_RULES:
            if re.search(pattern, style, re.I):
                self.add('ERROR', message)
        if tag == 'section':
            self.sections += 1
        covered = self.stack[-1][1] if self.stack else False
        # The first section in each fragment is the disposable outer wrapper.
        inner = any(t == 'section' for t, _ in self.stack)
        covered = covered or (inner and tag in BLOCK_TAGS and has_background(style))
        if tag not in VOID_TAGS:
            self.stack.append((tag, covered))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if not data.strip() or not re.search(r'[\w\u3400-\u9fff]', data):
            return
        if any(t in {'head', 'title', 'script', 'style', 'svg'} for t, _ in self.stack):
            return
        if self.stack and not self.stack[-1][1]:
            self.uncovered.append(data.strip()[:24])


def inspect_markup(html):
    checker = MarkupChecker()
    checker.feed(html)
    checker.close()
    return checker
