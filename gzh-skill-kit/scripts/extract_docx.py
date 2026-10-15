#!/usr/bin/env python3
"""Word .docx → Markdown 提取器（零外部依赖）。

格式归一化层的确定性组件：把 docx 的标题层级 / 粗体 / 列表 / 图片
转成本 skill 排版流程认识的 Markdown。

用法：
    extract_docx.py 文章.docx [-o 输出.md]
    # 内嵌图片解包到 输出.md 同目录的 images/ 下，md 里用相对路径引用

退出码：0 成功；1 失败（文件不存在 / 不是合法 docx）。
表格会转成标准 Markdown 表格（合并单元格按普通格处理）；
文本框 / 图文框等取不到的内容会被跳过。
"""

import argparse
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

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
            rels[rel.get("Id")] = "word/" + target.lstrip("/").replace("../", "")
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
    所以用尖括号包裹（CommonMark 允许），并对空格做 %20 转义。
    """
    return "<" + rel.replace(" ", "%20") + ">"


def para_text(p, links_of=None):
    """段内 run → 行内 Markdown（粗体→**、下划线→<u>、超链接→[text](url)）。

    按**文档顺序**递归遍历，而不是"先扫所有超链接再扫所有 run"——
    后者会把段落中间的链接整体挪到段首，打乱原文语序。
    """
    out = []
    consumed = set()  # 已作为链接锚文本输出的 run，避免重复输出纯文本

    def emit_run(r_el):
        rpr = r_el.find(f"{W}rPr")
        bold = rpr is not None and rpr.find(f"{W}b") is not None \
            and (rpr.find(f"{W}b").get(f"{W}val") or "1") not in ("0", "false")
        ul = rpr is not None and rpr.find(f"{W}u") is not None
        text = "".join(t.text or "" for t in r_el.iter(f"{W}t"))
        if not text:
            return
        if bold:
            text = f"**{text}**"
        if ul:
            text = f"<u>{text}</u>"
        out.append(text)

    def walk(node):
        for child in node:
            tag = child.tag
            if tag == f"{W}hyperlink":
                rid = child.get(f"{R}id")
                target = (links_of or {}).get(rid) if rid else None
                label = "".join(t.text or "" for t in child.iter(f"{W}t")).strip()
                if target and label:
                    for r_el in child.iter(f"{W}r"):
                        consumed.add(id(r_el))
                    out.append(f"[{label}]({_safe_url(target)})")
                    continue
                walk(child)  # 内部锚点取不到 URL：按普通文字继续，避免丢字
            elif tag == f"{W}r":
                if id(child) not in consumed:
                    emit_run(child)
            else:
                walk(child)  # smartTag / ins / sdt 等容器，继续往下找

    walk(p)
    s = "".join(out)
    return re.sub(r"\*\*\*\*", "", s)  # 相邻粗体 run 合并的空标记


def _safe_url(url):
    """URL 含空格/括号时用尖括号包裹，否则 Markdown 链接会被截断。"""
    if re.search(r"[\s()<>]", url):
        return "<" + url.replace(" ", "%20") + ">"
    return url


def extract(docx_path, out_md):
    try:
        z = zipfile.ZipFile(docx_path)
        doc = ET.fromstring(z.read("word/document.xml"))
    except (zipfile.BadZipFile, KeyError, ET.ParseError) as e:
        print(f"✗ 不是合法 docx：{e}", file=sys.stderr)
        return 1

    heading_of = load_styles(z)
    media_of = load_rels(z)
    links_of = load_links(z)
    out_dir = os.path.dirname(os.path.abspath(out_md)) or "."
    img_dir = os.path.join(out_dir, "images")
    lines, img_n, tables_n, link_n = [], 0, 0, 0

    body = doc.find(f"{W}body")
    if body is None:
        print("✗ document.xml 里找不到 <w:body>，无法提取", file=sys.stderr)
        return 1
    for el in body:
        tag = el.tag
        if tag == f"{W}tbl":
            # 表格 → Markdown 表格，保住行列结构（合并单元格按普通格处理）
            rows, ncols = [], 0
            for tr in el.findall(f"{W}tr"):
                cells = ["".join(t.text or "" for t in tc.iter(f"{W}t"))
                         .strip().replace("|", "\\|") or " "
                         for tc in tr.findall(f"{W}tc")]
                if not rows:
                    ncols = len(cells)
                rows.append("| " + " | ".join(cells) + " |")
            if rows:
                lines.append(rows[0])
                lines.append("|" + "---|" * ncols)
                lines.extend(rows[1:])
                lines.append("")
                tables_n += 1
            continue
        if tag != f"{W}p":
            continue
        p = el
        # 图片
        for blip in p.iter(f"{A}blip"):
            rid = blip.get(f"{R}embed")
            src = media_of.get(rid)
            if not src:
                continue
            os.makedirs(img_dir, exist_ok=True)
            img_n += 1
            fname = f"{img_n:02d}-" + os.path.basename(src)
            with open(os.path.join(img_dir, fname), "wb") as f:
                f.write(z.read(src))
            lines.append(f"![]({_md_image_path('images/' + fname)})")
            lines.append("")
        text = para_text(p, links_of).strip()
        if not text:
            continue
        link_n += text.count("](") - text.count("![](")  # 粗略统计转出的超链接数
        ppr = p.find(f"{W}pPr")
        style_el = ppr.find(f"{W}pStyle") if ppr is not None else None
        sid = style_el.get(f"{W}val") if style_el is not None else ""
        lvl = heading_of.get(sid)
        # 列表识别：直接编号(numPr) 或 列表类段落样式（List Bullet/Number/Paragraph/中文"列表"）
        is_list = (ppr is not None and ppr.find(f"{W}numPr") is not None) \
            or bool(re.search(r"list|列表", sid or "", re.I))
        if lvl:
            text_clean = re.sub(r"^\*\*(.*)\*\*$", r"\1", text)  # 标题不需要再加粗
            lines.append("#" * min(lvl, 6) + " " + text_clean)
        elif is_list:
            lines.append("- " + text)
        else:
            lines.append(text)
        lines.append("")

    md = "\n".join(lines).rstrip() + "\n"
    with open(out_md, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"✓ {os.path.basename(docx_path)} → {out_md}")
    print(f"  段落 {sum(1 for l in lines if l and not l.startswith(('#','-','![')))} · "
          f"标题 {sum(1 for l in lines if l.startswith('#'))} · "
          f"列表 {sum(1 for l in lines if l.startswith('- '))} · 图片 {img_n}"
          + (f" · 表格 {tables_n}（已转 Markdown 表格）" if tables_n else "")
          + (f" · 超链接 {link_n}" if link_n else ""))
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("docx")
    ap.add_argument("-o", "--out", help="输出 md 路径（默认同名 .md）")
    args = ap.parse_args()
    if not os.path.isfile(args.docx):
        print(f"✗ 文件不存在: {args.docx}", file=sys.stderr)
        sys.exit(1)
    out = args.out or re.sub(r"\.docx$", "", args.docx, flags=re.I) + ".md"
    sys.exit(extract(args.docx, out))


if __name__ == "__main__":
    main()
