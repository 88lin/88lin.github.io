"""Validate sitemap against real, indexable HTML; --write rebuilds it from canonicals.

Run from any directory: python scripts/check-seo.py [--write]
Uses only Python's standard library. It does not request or modify a live site.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.canonical = []
        self.noindex = False
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical.append(attrs.get('href', ''))
        if tag == 'meta' and attrs.get('name', '').lower() == 'robots':
            self.noindex = 'noindex' in attrs.get('content', '').lower()


def resolve_page(url):
    path = unquote(urlsplit(url).path).lstrip('/')
    target = ROOT / path
    candidates = [target, target / 'index.html', ROOT / (path + '.html')]
    for candidate in candidates:
        if candidate.is_file() and candidate.suffix == '.html':
            return candidate.resolve()
    return None


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument('--write', action='store_true')
    options = args.parse_args()
    tree = ET.parse(ROOT / 'sitemap.xml')
    entries = tree.getroot().findall(f'{{{NS}}}url')
    existing = {item.findtext(f'{{{NS}}}loc'): item for item in entries}
    hosts = {urlsplit(url).netloc for url in existing}
    names = subprocess.check_output(
        ['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.html'], cwd=ROOT
    ).decode('utf-8').split('\0')
    pages = {}
    errors = []
    for name in filter(None, names):
        path = ROOT / name
        if name.startswith(('.', 'artifacts/', 'docs/')):
            continue
        page = Page(path.read_text(encoding='utf-8-sig'))
        if page.noindex or not page.canonical:
            continue
        if len(page.canonical) != 1:
            errors.append(f'{name}: expected exactly one canonical')
            continue
        url = page.canonical[0]
        parsed = urlsplit(url)
        if parsed.netloc not in hosts:
            continue
        if parsed.scheme != 'https' or parsed.query or parsed.fragment:
            errors.append(f'{name}: invalid canonical {url}')
        elif resolve_page(url) == path.resolve():
            pages[url] = path
        # Intentional duplicate templates canonicalized to another file are excluded.
    if options.write and not errors:
        ET.register_namespace('', NS)
        result = ET.Element(f'{{{NS}}}urlset')
        for url in sorted(pages):
            if url in existing:
                result.append(existing[url])
            else:
                entry = ET.SubElement(result, f'{{{NS}}}url')
                ET.SubElement(entry, f'{{{NS}}}loc').text = url
        ET.indent(result, space='  ')
        ET.ElementTree(result).write(ROOT / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
        existing = dict.fromkeys(pages)
    for url in existing.keys() - pages.keys():
        errors.append(f'Sitemap URL has no canonical indexable local page: {url}')
    for url in pages.keys() - existing.keys():
        errors.append(f'Missing sitemap URL: {url}')
    if len(entries) != len({item.findtext(f'{{{NS}}}loc') for item in entries}):
        errors.append('Duplicate sitemap URLs')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(pages)} canonical indexable HTML pages match sitemap.xml')


if __name__ == '__main__':
    main()
