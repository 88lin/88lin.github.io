"""Generate static JSON-LD and llms.txt from the visible homepage content.

Run after editing page content: python 2/scripts/build-seo.py --updated YYYY-MM-DD
Python standard library only. The published website has no build/runtime dependency.
"""

import argparse
import json
import re
from datetime import date
from html.parser import HTMLParser
from pathlib import Path


SITE_DIR = Path(__file__).resolve().parents[1]
SCRIPT_ID = "site-structured-data"
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Node:
    def __init__(self, tag, attrs=()):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []

    def all(self, tag=None, class_name=None, attribute=None):
        found = []
        for child in self.children:
            if not isinstance(child, Node):
                continue
            if ((tag is None or child.tag == tag)
                    and (class_name is None or class_name in child.attrs.get("class", "").split())
                    and (attribute is None or attribute in child.attrs)):
                found.append(child)
            found.extend(child.all(tag, class_name, attribute))
        return found

    def one(self, **kwargs):
        found = self.all(**kwargs)
        if not found:
            raise ValueError(f"Missing content: {kwargs}")
        return found[0]

    def text(self):
        return "".join(child.text() if isinstance(child, Node) else child for child in self.children)

    def plain(self):
        return " ".join(self.text().split())


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Node("document")
        self.stack = [self.root]
        self.feed(source)
        self.close()

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def metadata(document):
    head = document.one(tag="head")
    values = {node.attrs.get("name", node.attrs.get("property")): node.attrs.get("content")
              for node in head.all(tag="meta")}
    values["title"] = head.one(tag="title").plain()
    values["url"] = next(node.attrs["href"] for node in head.all(tag="link")
                         if node.attrs.get("rel") == "canonical")
    return values


def image_object(meta):
    return {"@type": "ImageObject", "url": meta["og:image"],
            "width": int(meta["og:image:width"]), "height": int(meta["og:image:height"])}


def item_list(identifier, name, items):
    return {"@type": "ItemList", "@id": identifier, "name": name,
            "itemListOrder": "https://schema.org/ItemListUnordered", "numberOfItems": len(items),
            "itemListElement": [{"@type": "ListItem", "position": index, "item": item}
                                for index, item in enumerate(items, 1)]}


def inject_schema(source, graph):
    payload = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)
    payload = payload.replace("<", "\\u003c")
    block = f'<script id="{SCRIPT_ID}" type="application/ld+json">\n{payload}\n</script>'
    pattern = re.compile(r'<script\b[^>]*\bid=["\']' + SCRIPT_ID + r'["\'][^>]*>.*?</script>', re.S)
    if pattern.search(source):
        return pattern.sub(lambda _: block, source)
    if "</head>" not in source:
        raise ValueError("Page has no closing head")
    return source.replace("</head>", block + "\n</head>", 1)


def write_if_changed(path, text):
    if path.exists() and path.read_text(encoding="utf-8") == text:
        return
    path.write_text(text, encoding="utf-8", newline="\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--updated", required=True, type=date.fromisoformat,
                        help="Date the page content was actually reviewed or changed (YYYY-MM-DD)")
    args = parser.parse_args()
    updated = args.updated.isoformat()
    home_file, about_file = SITE_DIR / "index.html", SITE_DIR / "about/index.html"
    home_source, about_source = (p.read_text(encoding="utf-8") for p in (home_file, about_file))
    home, about = Document(home_source).root, Document(about_source).root
    hm, am = metadata(home), metadata(about)
    home_url, about_url = hm["url"], am["url"]
    person_id, website_id = about_url + "#person", home_url + "#website"

    projects = []
    for card in home.all(attribute="data-project"):
        name = card.one(class_name="b-name").plain()
        links = card.one(class_name="b-links").all(tag="a")
        repository = next(a.attrs["href"] for a in links if a.attrs["href"].startswith("https://github.com/88lin/"))
        slug = "project-" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        projects.append({"name": name, "description": card.one(class_name="b-desc").plain(),
                         "repository": repository, "anchor": slug,
                         "links": [(a.plain(), a.attrs["href"]) for a in links]})
    if not projects or len({p["anchor"] for p in projects}) != len(projects):
        raise ValueError("Project IDs must be present and unique")

    # Stable fragment URLs allow people and crawlers to link to a specific project.
    anchors = iter(project["anchor"] for project in projects)
    def add_anchor(match):
        tag, anchor = match.group(0), next(anchors)
        old_id = re.search(r'\bid=["\']([^"\']+)["\']', tag)
        if old_id:
            if old_id.group(1) != anchor:
                raise ValueError(f"Unexpected project ID: {old_id.group(1)}")
            return tag
        return tag[:-1] + f' id="{anchor}">'
    home_source = re.sub(r'<article\b[^>]*\bdata-project\b[^>]*>', add_anchor, home_source)

    sites = [{"name": card.one(tag="strong").plain(), "description": card.one(tag="p").plain(), "url": card.attrs["href"]}
             for card in home.all(class_name="site-cell")]
    posts = [{"name": card.one(class_name="post-title").plain(), "description": card.one(class_name="post-summary").plain(), "url": card.attrs["href"]}
             for card in home.all(class_name="post-row")]
    skills = [node.plain() for node in about.one(class_name="skills").all(tag="span")]
    person = {"@type": "Person", "@id": person_id, "name": "88lin", "url": about_url,
              "description": "AI 研究者与 Agent 工程实践者，茉灵智库主理人。",
              "image": home_url + "assets/avatar.webp", "knowsAbout": skills,
              "email": next(a.attrs["href"] for a in about.one(class_name="contact-links").all(tag="a") if a.attrs["href"].startswith("mailto:")),
              "sameAs": ["https://github.com/88lin", "https://space.bilibili.com/1412014683"]}
    website = {"@type": "WebSite", "@id": website_id, "url": home_url,
               "name": hm["og:site_name"], "inLanguage": "zh-CN", "publisher": {"@id": person_id}}
    project_list = item_list(home_url + "#projects-list", "精选开源项目", [
        {"@type": "SoftwareSourceCode", "@id": home_url + "#" + p["anchor"], "name": p["name"],
         "description": p["description"], "url": p["repository"], "codeRepository": p["repository"]}
        for p in projects])
    sites_list = item_list(home_url + "#sites-list", "站点入口", [{"@type": "WebPage", **item} for item in sites])
    posts_list = item_list(home_url + "#writing-list", "精选博客文章", [{"@type": "WebPage", **item} for item in posts])
    homepage = {"@type": "CollectionPage", "@id": home_url + "#webpage", "url": home_url,
                "name": hm["title"], "description": hm["description"], "inLanguage": "zh-CN",
                "dateModified": updated, "isPartOf": {"@id": website_id}, "about": {"@id": person_id},
                "author": {"@id": person_id}, "primaryImageOfPage": image_object(hm),
                "mainEntity": [{"@id": item["@id"]} for item in (project_list, sites_list, posts_list)]}
    profile = {"@type": "ProfilePage", "@id": about_url + "#webpage", "url": about_url,
               "name": am["title"], "description": am["description"], "inLanguage": "zh-CN",
               "dateModified": updated, "isPartOf": {"@id": website_id},
               "mainEntity": {"@id": person_id}, "primaryImageOfPage": image_object(am)}
    home_source = inject_schema(home_source, [website, person, homepage, project_list, sites_list, posts_list])
    about_source = inject_schema(about_source, [website, person, profile])

    lines = ["# " + hm["og:site_name"], "", "> " + hm["description"], "",
             f"内容更新：{updated}", "", "## 作者与页面", "",
             f"- [个人主页]({home_url})：AI Agent、MCP 工具链与开源项目目录。",
             f"- [关于 88lin]({about_url})：{person['description']}",
             "- [GitHub](https://github.com/88lin)：源码、README、Issue 与各仓库许可证。",
             "- [茉灵智库博客](https://blog.88lin.eu.org/)：实践记录与精选文章原文。",
             f"- [联系作者]({person['email']})", "",
             "实践方向与工具：" + "、".join(skills) + "。", "", "## 精选开源项目", ""]
    for project in projects:
        extra = "；".join(f"[{label}]({url})" for label, url in project["links"] if url != project["repository"])
        lines.append(f"- [{project['name']}]({project['repository']})：{project['description']} [主页简介]({home_url}#{project['anchor']})" + ("；" + extra if extra else ""))
    lines += ["", "项目能力、安装要求和许可证以各仓库当前说明为准；精选目录包含基于上游维护的项目，具体说明与页面一致。",
              "", "## 站点入口", ""]
    lines += [f"- [{item['name']}]({item['url']})：{item['description']}" for item in sites]
    lines += ["", "## 精选博客文章", ""]
    lines += [f"- [{item['name']}]({item['url']})：{item['description']}" for item in posts]
    lines += ["", "## 数据与更新", "", home.one(class_name="stats-source").plain() + "。",
              "GitHub 总 Stars 与项目总数统计公开仓库，包含 Fork；精选卡片数量与账户仓库总数不同。",
              "- [GitHub 仓库列表](https://github.com/88lin?tab=repositories)",
              "- [博客 RSS](https://blog.88lin.eu.org/rss/feed.xml)", ""]
    write_if_changed(home_file, home_source)
    write_if_changed(about_file, about_source)
    write_if_changed(SITE_DIR / "llms.txt", "\n".join(lines))
    print(f"Generated JSON-LD for 2 pages and llms.txt: {len(projects)} projects, {len(sites)} sites, {len(posts)} articles.")


if __name__ == "__main__":
    main()
