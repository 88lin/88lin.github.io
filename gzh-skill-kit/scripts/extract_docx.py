#!/usr/bin/env python3
"""Word .docx → Markdown 提取器（零外部依赖）。

格式归一化层的确定性组件：把 docx 的标题层级 / 粗体 / 列表 / 图片
转成本 skill 排版流程认识的 Markdown。

用法：
    extract_docx.py 文章.docx [-o 输出.md]
    # 内嵌图片解包到 images/输出文件名/ 下，md 里用相对路径引用

退出码：0 成功；1 失败（文件不存在 / 不是合法 docx）。
表格会转成标准 Markdown 表格（合并单元格按普通格处理）；
文本框 / 图文框等取不到的内容会被跳过。
"""

import argparse
import os
import re
import sys
import zipfile
import posixpath
from itertools import groupby
from urllib.parse import quote

import xml.etree.ElementTree as ET

if __package__:
    from .cli_utils import configure_stdio, print_status
else:
    from cli_utils import configure_stdio, print_status

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"


def load_styles(z):
    """styleId → 标题级别（1/2/3…）；非标题样式不入表。"""
    levels = {}
    try:
        root = ET.fromstring(z.read("word/styles.xml"))
    except KeyError:
        return levels
    for st in root.iter(f"{W}style"):
        sid = st.get(f"{W}styleId") or ""
        name_el = st.find(f"{W}name")
        name = (name_el.get(f"{W}val") if name_el is not None else "") or ""
        m = re.search(r"(?:heading|标题)\s*([1-6])", name, re.I) \
            or re.fullmatch(r"([1-6])", sid)
        if m:
            levels[sid] = int(m.group(1))
    return levels


def load_rels(z):
    """rId → 媒体文件路径（word/media/...）。"""
    rels = {}
    try:
        root = ET.fromstring(z.read("word/_rels/document.xml.rels"))
    except KeyError:
        return rels
    for rel in root:
        target = rel.get("Target") or ""
        if "media/" in target:
            rels[rel.get("Id")] = (target.lstrip("/") if target.startswith("/")
                                       else posixpath.normpath(posixpath.join("word", target)))
    return rels


def load_links(z):
    """rId → 外部超链接 URL。

    只收 TargetMode="External" 的关系，内部锚点（跳到文档某处）无法在
    Markdown 里表达，忽略。抽出来后超链接就能进入脚注流程（通用库 4a/4b），
    以前 docx 里的链接会被整段丢掉。
    """
    links = {}
    try:
        root = ET.fromstring(z.read("word/_rels/document.xml.rels"))
    except KeyError:
        return links
    for rel in root:
        if (rel.get("TargetMode") or "").lower() != "external":
            continue
        target = rel.get("Target") or ""
        if target.lower().startswith(("http://", "https://", "mailto:")):
            links[rel.get("Id")] = target
    return links


def _md_image_path(rel):
    """图片路径转 Markdown 安全形式。

    解包出来的文件名可能含空格/中文/括号，直接写进 ![](…) 会被截断，
    所以用尖括号包裹（CommonMark 允许），只编码空格和 %/#/? 等会改变
    URL 含义的字符，中文保持原样可读。
    """
    return "<" + re.sub(r"[\s%#?<>\\]", lambda m: quote(m.group()), rel) + ">"


def para_text(p, links_of=None, image_of=None):
    """Preserve run order, breaks, tabs, links and inline drawings, including cells."""
    def emit_run(run):
        rpr = run.find(f"{W}rPr")
        bold = rpr.find(f"{W}b") if rpr is not None else None
        underline = rpr.find(f"{W}u") if rpr is not None else None
        parts = []
        for child in run.iter():
            if child.tag == f"{W}t":
                parts.append(child.text or "")
            elif child.tag in {f"{W}br", f"{W}cr"}:
                parts.append("<br>")
            elif child.tag == f"{W}tab":
                parts.append("\t")
            elif child.tag == f"{A}blip" and image_of:
                parts.append(image_of(child.get(f"{R}embed")))
        text = "".join(parts)
        is_bold = bold is not None and (bold.get(f"{W}val") or "1").lower() not in {"0", "false", "off"}
        is_underlined = underline is not None and (underline.get(f"{W}val") or "single").lower() not in {"none", "0", "false"}
        return text, is_bold, is_underlined

    def render(runs):
        out = []
        # Merge formatting at actual run boundaries. A global **** replacement
        # cannot distinguish generated bold delimiters from the author's text.
        nonempty = (run for run in runs if run[0])
        for (bold, underline), group in groupby(nonempty, key=lambda run: run[1:]):
            text = ''.join(run[0] for run in group)
            if not text:
                continue
            if bold:
                text = f'**{text}**'
            if underline:
                text = f'<u>{text}</u>'
            out.append(text)
        return ''.join(out)

    def walk(node):
        for child in node:
            if child.tag == f"{W}hyperlink":
                target = (links_of or {}).get(child.get(f"{R}id"))
                if target:
                    label = render(walk(child))
                    yield (f"[{label}]({_safe_url(target)})" if label else '', False, False)
                else:
                    yield from walk(child)
            elif child.tag == f"{W}r":
                yield emit_run(child)
            else:
                yield from walk(child)

    return render(walk(p))


def content_children(node):
    """Expose blocks/rows/cells inside transparent Word content controls."""
    for child in node:
        if child.tag == f'{W}sdt':
            content = child.find(f'{W}sdtContent')
            if content is not None:
                yield from content_children(content)
        elif child.tag == f'{W}customXml':
            yield from content_children(child)
        else:
            yield child


def _safe_url(url):
    """URL 含空格/括号时用尖括号包裹，否则 Markdown 链接会被截断。"""
    if re.search(r"[\s()<>]", url):
        return "<" + url.replace(" ", "%20") + ">"
    return url


def extract(docx_path, out_md):
    try:
        with zipfile.ZipFile(docx_path) as z:
            doc = ET.fromstring(z.read("word/document.xml"))
            body = doc.find(f"{W}body")
            if body is None:
                raise ValueError("document.xml 里找不到 w:body")
            heading_of, media_of, links_of = load_styles(z), load_rels(z), load_links(z)
            out_dir = os.path.dirname(os.path.abspath(out_md))
            image_rel_dir = 'images/' + os.path.splitext(os.path.basename(out_md))[0]
            img_dir = os.path.join(out_dir, image_rel_dir)
            images, lines, tables_n = {}, [], 0

            def image_of(rid):
                src = media_of.get(rid)
                if not src:
                    raise ValueError(f"内嵌图片缺少媒体关系：{rid}")
                if src not in images:
                    data = z.read(src)  # fail explicitly if an embedded image is missing
                    os.makedirs(img_dir, exist_ok=True)
                    name = f"{len(images) + 1:02d}-" + os.path.basename(src)
                    with open(os.path.join(img_dir, name), "wb") as f:
                        f.write(data)
                    images[src] = image_rel_dir + '/' + name
                return f"![]({_md_image_path(images[src])})"

            for element in content_children(body):
                if element.tag == f"{W}tbl":
                    rows = []
                    for row in (child for child in content_children(element) if child.tag == f'{W}tr'):
                        cells = []
                        for cell in (child for child in content_children(row) if child.tag == f'{W}tc'):
                            paragraphs = [para_text(p, links_of, image_of).strip()
                                          for p in cell.iter(f"{W}p")]
                            cells.append("<br>".join(paragraphs).replace("|", "\\|") or " ")
                        rows.append(cells)
                    if rows:
                        width = max(map(len, rows))
                        rendered = ["| " + " | ".join(row + [" "] * (width - len(row))) + " |"
                                    for row in rows]
                        lines.extend([rendered[0], "|" + "---|" * width, *rendered[1:], ""])
                        tables_n += 1
                    continue
                if element.tag != f"{W}p":
                    continue
                text = para_text(element, links_of, image_of).strip()
                if not text:
                    continue
                ppr = element.find(f"{W}pPr")
                style = ppr.find(f"{W}pStyle") if ppr is not None else None
                sid = style.get(f"{W}val") if style is not None else ""
                level = heading_of.get(sid)
                is_list = (ppr is not None and ppr.find(f"{W}numPr") is not None) or bool(
                    re.search(r"list|列表", sid or "", re.I))
                if level:
                    text = "#" * min(level, 6) + " " + re.sub(r"^\*\*(.*)\*\*$", r"\1", text)
                elif is_list:
                    text = "- " + text
                lines.extend([text, ""])
            with open(out_md, "w", encoding="utf-8") as f:
                f.write("\n".join(lines).rstrip() + "\n")
    except (OSError, zipfile.BadZipFile, KeyError, ET.ParseError, ValueError) as exc:
        print_status(f"✗ Word 提取失败：{exc}", file=sys.stderr)
        return 1
    print_status(f"✓ {os.path.basename(docx_path)} → {out_md}（图片 {len(images)} · 表格 {tables_n}）")
    return 0


def main():
    configure_stdio()
    ap = argparse.ArgumentParser()
    ap.add_argument("docx")
    ap.add_argument("-o", "--out", help="输出 md 路径（默认同名 .md）")
    args = ap.parse_args()
    if not os.path.isfile(args.docx):
        print_status(f"✗ 文件不存在: {args.docx}", file=sys.stderr)
        sys.exit(1)
    out = args.out or re.sub(r"\.docx$", "", args.docx, flags=re.I) + ".md"
    sys.exit(extract(args.docx, out))


if __name__ == "__main__":
    main()
