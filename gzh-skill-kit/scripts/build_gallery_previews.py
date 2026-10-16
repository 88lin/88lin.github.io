#!/usr/bin/env python3
"""Generate browser previews while retaining the gallery's clean article fragments.

Run from any directory: python scripts/build_gallery_previews.py
After changing a gallery article or the shared preview template, regenerate and
commit docs/previews/*.html together with the source change.
"""
from pathlib import Path

if __package__:
    from .cli_utils import configure_stdio
    from .wrap_preview import render_preview
else:
    from cli_utils import configure_stdio
    from wrap_preview import render_preview


def build_gallery_previews():
    root = Path(__file__).resolve().parents[1]
    destination = root / 'docs' / 'previews'
    destination.mkdir(exist_ok=True)
    articles = sorted(path for path in (root / 'docs' / 'gallery').glob('*.html')
                      if path.name != 'index.html')
    for article in articles:
        preview = render_preview(article.read_text(encoding='utf-8'),
                                 article.stem, '../gallery/')
        (destination / article.name).write_text(preview, encoding='utf-8')
    return len(articles)


if __name__ == '__main__':
    configure_stdio()
    print(f'✓ 已生成 {build_gallery_previews()} 份在线主题预览（docs/previews/）')
