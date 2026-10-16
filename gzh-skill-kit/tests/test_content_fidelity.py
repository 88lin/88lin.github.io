"""Regression tests for Word text, camera covers and generated gallery previews."""
from html import escape
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
import zipfile
import sys

from markdown_it import MarkdownIt
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from extract_docx import W, extract, para_text
from wrap_preview import render_preview
import wechat_draft as draft


class HTMLText(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.text = ''
        self.tags = []
        self.feed(html)

    def handle_data(self, data):
        self.text += data

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


def paragraph(runs):
    return ET.fromstring(f'<w:p xmlns:w="{W[1:-1]}">{runs}</w:p>')


def run(text, properties=''):
    return f'<w:r>{properties}<w:t xml:space="preserve">{escape(text)}</w:t></w:r>'


class WordFidelityTests(unittest.TestCase):
    def test_literal_text_survives_markdown_rendering(self):
        parser = MarkdownIt().enable('strikethrough')
        for original in ['类型 List<T>，口令 **abc**，实体 &copy; 和 &amp;。',
                         r'C:\tools\_private_ [来源](https://example.com) `code`',
                         '# 普通文字', '1. 普通文字', '- 普通文字',
                         '++加号++ ==等号== ~~波浪线~~ | 竖线', '---']:
            with self.subTest(original=original):
                markdown = para_text(paragraph(run(original)))
                rendered = HTMLText(parser.render(markdown))
                self.assertEqual(rendered.text.rstrip('\n'), original)
                self.assertEqual([tag for tag, _ in rendered.tags], ['p'])

    def test_bold_spaces_stay_outside_delimiters(self):
        for word in ['Hello ', ' Hello', '\tHello \t', 'Hello', '   ']:
            with self.subTest(word=word):
                markdown = para_text(paragraph(run('before ') + run(word, '<w:rPr><w:b/></w:rPr>')
                                               + run(' after')))
                rendered = HTMLText(MarkdownIt().renderInline(markdown))
                self.assertEqual(rendered.text, 'before ' + word + ' after')
                self.assertEqual([tag for tag, _ in rendered.tags], ['strong'] if word.strip() else [])

    def test_literal_markup_does_not_escape_generated_links_breaks_or_tables(self):
        text = 'List<T> | **abc** &copy;'
        with tempfile.TemporaryDirectory() as directory:
            source, target = Path(directory) / 'article.docx', Path(directory) / 'article.md'
            body = ('<w:tbl><w:tr><w:tc><w:p>' + run(text) + '</w:p></w:tc><w:tc><w:p>'
                    '<w:hyperlink r:id="link">' + run('来源 [A] | B') + '</w:hyperlink>'
                    '<w:r><w:br/><w:drawing><a:blip r:embed="pic"/></w:drawing></w:r>'
                    '</w:p></w:tc></w:tr></w:tbl>')
            with zipfile.ZipFile(source, 'w') as archive:
                archive.writestr('word/document.xml',
                                f'<w:document xmlns:w="{W[1:-1]}" '
                                'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
                                'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
                                f'<w:body>{body}</w:body></w:document>')
                archive.writestr('word/_rels/document.xml.rels',
                                '<Relationships><Relationship Id="link" TargetMode="External" '
                                'Target="https://example.com/?q=a|b"/>'
                                '<Relationship Id="pic" Target="media/image.png"/></Relationships>')
                archive.writestr('word/media/image.png', b'image fixture')
            self.assertEqual(extract(str(source), str(target)), 0)
            rendered = HTMLText(MarkdownIt().enable('table').render(target.read_text(encoding='utf-8')))
            self.assertIn(text, rendered.text)
            self.assertIn('来源 [A] | B', rendered.text)
            self.assertEqual(sum(tag == 'th' for tag, _ in rendered.tags), 2)
            self.assertIn(('a', {'href': 'https://example.com/?q=a%7Cb'}), rendered.tags)
            self.assertIn(('img', {'src': 'images/article/01-image.png', 'alt': ''}), rendered.tags)
            self.assertIn(('br', {}), rendered.tags)


class CoverFidelityTests(unittest.TestCase):
    def test_camera_orientation_is_baked_into_uploaded_pixels(self):
        colors = {'r': (255, 0, 0), 'g': (0, 255, 0), 'b': (0, 0, 255), 'y': (255, 255, 0)}
        # Expected corners in clockwise order from top-left for EXIF orientations 1..8.
        corners = {1: 'rgyb', 2: 'grby', 3: 'ybrg', 4: 'bygr',
                   5: 'rbyg', 6: 'brgy', 7: 'ygrb', 8: 'gybr'}
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / 'camera.jpg'
            image = Image.new('RGB', (80, 60))
            for color, box in [('r', (0, 0, 40, 30)), ('g', (40, 0, 80, 30)),
                               ('b', (0, 30, 40, 60)), ('y', (40, 30, 80, 60))]:
                image.paste(colors[color], box)
            for orientation, expected in corners.items():
                with self.subTest(orientation=orientation):
                    exif = Image.Exif(); exif[274] = orientation
                    image.save(source, quality=95, exif=exif)
                    original = source.read_bytes()
                    uploaded = []

                    def post(*args, **kwargs):
                        uploaded.append(kwargs['files']['media'][1].read())
                        return type('Response', (), {'content': b'{"media_id":"mock-cover"}'})()

                    with patch('requests.post', side_effect=post):
                        self.assertEqual(draft.upload_cover('fake-token', str(source)), 'mock-cover')
                    self.assertEqual(source.read_bytes(), original)
                    self.assertLessEqual(len(uploaded[0]), 64000)
                    with Image.open(BytesIO(uploaded[0])) as thumbnail:
                        self.assertEqual(thumbnail.size, (60, 80) if orientation >= 5 else (80, 60))
                        self.assertIn(thumbnail.getexif().get(274), (None, 1))
                        width, height = thumbnail.size
                        points = [(10, 10), (width - 11, 10), (width - 11, height - 11), (10, height - 11)]
                        actual = ''.join(min(colors, key=lambda color: sum(abs(a - b) for a, b in
                                         zip(thumbnail.getpixel(point), colors[color]))) for point in points)
                        self.assertEqual(actual, expected)


class GalleryPreviewTests(unittest.TestCase):
    def test_generated_previews_match_articles_and_shared_template(self):
        articles = {path.name: path for path in (ROOT / 'docs/gallery').glob('*.html')
                    if path.name != 'index.html'}
        previews = {path.name: path for path in (ROOT / 'docs/previews').glob('*.html')}
        self.assertEqual(set(previews), set(articles))
        for name, article in articles.items():
            with self.subTest(theme=name):
                expected = render_preview(article.read_text(encoding='utf-8'), article.stem, '../gallery/')
                actual = previews[name].read_text(encoding='utf-8')
                self.assertEqual(actual, expected, 'Run python scripts/build_gallery_previews.py')
                self.assertIn(('meta', {'name': 'viewport', 'content': 'width=device-width, initial-scale=1'}),
                              HTMLText(actual).tags)


if __name__ == '__main__':
    unittest.main()
