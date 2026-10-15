"""Offline regressions for real input/output contracts. No WeChat requests."""
import io
import json
import os
import shutil
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from component_lint import lint_file
from cli_utils import print_status
from extract_docx import extract, para_text, W, R, A
from minify_gzh_html import minify_html
from validate_gzh_html import validate
import wechat_draft as draft


class MinifierTests(unittest.TestCase):
    def test_inline_word_boundaries(self):
        for source, expected in [
            ('<p><span>Hello</span>\n<span>world</span></p>', '<p><span>Hello</span> <span>world</span></p>'),
            ('<p>Use\n<em>Python</em>\ntoday.</p>', '<p>Use <em>Python</em> today.</p>'),
            ('<p>First,\nsecond.</p>', '<p>First, second.</p>'),
            ('<section>\n  <p>文字</p>\n</section>', '<section><p>文字</p></section>'),
        ]:
            with self.subTest(source=source):
                self.assertEqual(minify_html(source), expected)

    def test_code_entities_and_fullwidth_spaces(self):
        source = '<p><span leaf="">　　print("first\\nsecond") &lt;b&gt;&nbsp;&#160;</span></p>'
        self.assertEqual(minify_html(source), source)

    def test_preformatted_text_is_not_rewritten(self):
        source = '<pre>  A\n    B</pre>'
        self.assertEqual(minify_html(source), source)

    def test_multiline_svg_remains_parseable(self):
        source = '<svg\n viewBox="0 0 20 20">\n<path\n d="M 0 0\n L 10 10"/>\n</svg>'
        result = minify_html(source)
        svg = ET.fromstring(result)
        self.assertEqual(svg.attrib['viewBox'], '0 0 20 20')
        self.assertEqual(svg[0].attrib['d'], 'M 0 0 L 10 10')
        self.assertEqual(minify_html(result), result)

    def test_comment_removal_does_not_invent_spaces(self):
        self.assertEqual(minify_html('<p>A<!-- hidden -->B</p>'), '<p>AB</p>')


class ValidationTests(unittest.TestCase):
    def both(self, source):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory) / 'component.md'
            p.write_text('```html\n' + source + '\n```', encoding='utf-8')
            return validate(source)[0], [m for level, m in lint_file(str(p))[1] if level == 'ERROR']

    def test_code_examples_are_text(self):
        for text in ['&lt;div class=&quot;card&quot;&gt;', '.box { position: absolute; display: grid; }',
                     r'escaped quote: \"', '@media (max-width: 600px) {}']:
            with self.subTest(text=text):
                source = '<p style="font-family:monospace"><span leaf="">' + text + '</span></p>'
                self.assertEqual(self.both(source), ([], []))

    def test_real_forbidden_markup_is_rejected_by_both(self):
        for source in ['<script>alert(1)</script>', '<section style="float:left"></section>',
                       '<section class="x"></section>', '<iframe></iframe>',
                       '<svg><animate attributeName="x"/></svg>', '<a href="https://example.com">link</a>']:
            with self.subTest(source=source):
                for errors in self.both(source):
                    self.assertTrue(errors)

    def test_bad_attribute_quotes_rejected_by_both(self):
        source = r'<section style=\"background: red; color: white;\"><span leaf="">正文</span></section>'
        for errors in self.both(source):
            self.assertTrue(any('引号' in error for error in errors))

    def test_quoted_attribute_text_does_not_trigger_quote_error(self):
        source = r'''<img alt='example style=\"background: red\"' src="image.png"><p><span leaf="">正文</span></p>'''
        self.assertEqual(self.both(source), ([], []))

    def test_static_svg_allowed(self):
        self.assertEqual(self.both('<svg><path d="M0 0 L1 1"/><text><tspan leaf="">图</tspan></text></svg>'), ([], []))

    def test_void_leaf_does_not_cover_following_text(self):
        self.assertTrue(validate('<section><img leaf="" src="x.png">裸文字</section>')[0])

    def test_background_must_cover_each_block(self):
        for style in ['', 'background:transparent', 'background-position:center',
                      'background:rgba(1,2,3,0)', 'background:hsla(0,0%,100%,0)',
                      'background:hsl(0 0% 100% / 50%)', 'background:#fffffff0',
                      'background:url(white.png) center / cover']:
            source = '<section style="background:#fff"><section style="background:#fff"><span leaf="">卡片</span></section>'
            source += f'<section style="{style}"><span leaf="">裸正文</span></section></section>'
            self.assertTrue(any('底色' in w for w in validate(source)[1]))

    def test_solid_colors_and_opaque_base_below_gradient_cover_text(self):
        for style in ['background:yellow', 'background:rebeccapurple',
                      'background:linear-gradient(to right,transparent,#000) #fff',
                      'background:hsl(60 100% 50% / 100%)']:
            source = f'<section><section style="{style}"><span leaf="">正文</span></section></section>'
            self.assertEqual(validate(source)[:2], ([], []), style)

    def test_independent_background_can_come_from_inner_ancestor(self):
        source = '<section><section style="background:#fff"><section><p><span leaf="">正文</span></p></section></section></section>'
        self.assertEqual(validate(source)[:2], ([], []))

    def test_empty_input_rejected(self):
        self.assertTrue(validate(' ')[0])


class WordTests(unittest.TestCase):
    def test_break_tab_and_disabled_underline(self):
        p = ET.fromstring(f'<w:p xmlns:w="{W[1:-1]}"><w:r><w:rPr><w:u w:val="none"/></w:rPr>'
                          '<w:t>第一行</w:t><w:br/><w:t>第二行</w:t><w:tab/><w:t>列二</w:t></w:r></w:p>')
        self.assertEqual(para_text(p), '第一行<br>第二行\t列二')

    def test_table_keeps_links_images_and_paragraphs(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            docx, output = folder / 'article.docx', folder / 'article.md'
            document = f'''<w:document xmlns:w="{W[1:-1]}" xmlns:r="{R[1:-1]}" xmlns:a="{A[1:-1]}"><w:body>
              <w:tbl><w:tr><w:tc><w:p><w:hyperlink r:id="link"><w:r><w:t>来源</w:t></w:r></w:hyperlink>
              <w:r><w:drawing><a:blip r:embed="image"/></w:drawing></w:r></w:p>
              <w:p><w:r><w:t>下一段</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:body></w:document>'''
            rels = '<Relationships><Relationship Id="link" TargetMode="External" Target="https://example.com/source"/>'
            rels += '<Relationship Id="image" Target="/word/media/image.png"/></Relationships>'
            with zipfile.ZipFile(docx, 'w') as z:
                z.writestr('word/document.xml', document)
                z.writestr('word/_rels/document.xml.rels', rels)
                z.writestr('word/media/image.png', b'image fixture')
            self.assertEqual(extract(str(docx), str(output)), 0)
            text = output.read_text(encoding='utf-8')
            self.assertIn('[来源](https://example.com/source)', text)
            self.assertIn('![](<images/01-image.png>)<br>下一段', text)
            self.assertEqual((folder / 'images/01-image.png').read_bytes(), b'image fixture')


def response(value):
    class Response:
        content = json.dumps(value, ensure_ascii=False).encode('utf-8')
    return Response()


class DraftTests(unittest.TestCase):
    def test_failed_readback_is_not_zero_problems(self):
        with patch('requests.post', return_value=response({'errcode': 45009})):
            with self.assertRaises(draft.DraftVerificationError) as raised:
                draft.verify_draft('fake-token', 'existing-draft', '标题')
        self.assertEqual(raised.exception.media_id, 'existing-draft')

    def test_title_and_emoji_checked(self):
        with patch('requests.post', return_value=response({'news_item': [{'title': '错误', 'content': '正文'}]})):
            with self.assertRaises(draft.DraftVerificationError):
                draft.verify_draft('fake-token', 'existing-draft', '标题😀')
        with patch('requests.post', return_value=response({'news_item': [{'title': '标题😀', 'content': '正文'}]})):
            self.assertEqual(draft.verify_draft('fake-token', 'existing-draft', '标题😀'), 0)

    def test_cleanup_preserves_metadata(self):
        article = {'title': '标题', 'author': '作者', 'digest': '摘要', 'thumb_media_id': 'cover',
                   'content': '<p>A&nbsp;&nbsp;B&nbsp;C</p>', 'content_source_url': 'https://example.com/source',
                   'need_open_comment': 0, 'only_fans_can_comment': 1}
        cleaned = dict(article, content='<p>AB&nbsp;C</p>')
        with patch('requests.post', side_effect=[response({'news_item': [article]}), response({'errcode': 0}),
                                               response({'news_item': [cleaned]})]) as post:
            draft.cleanup_draft_nbsp('fake-token', 'existing-draft')
        sent = json.loads(post.call_args_list[1].kwargs['data'])['articles']
        self.assertEqual(sent, cleaned)

    def test_missing_local_image_fails_before_any_api(self):
        with tempfile.TemporaryDirectory() as directory, patch('requests.post') as post:
            with self.assertRaises(FileNotFoundError):
                draft.upload_and_cleanup('cover', 'title', '', '<img src="missing.png">', base_dir=directory)
            post.assert_not_called()

    def test_local_images_uploaded_once_and_rewritten(self):
        with tempfile.TemporaryDirectory() as directory:
            from PIL import Image
            image = Path(directory) / '截图 image.png'
            Image.new('RGB', (2, 2), 'white').save(image)
            html = '<section><img data-src="keep" src="截图%20image.png"><img src="截图%20image.png"/></section>'
            with patch.object(draft, 'get_token', return_value='fake-token'), \
                    patch.object(draft, 'upload_cover', return_value='cover'), \
                    patch.object(draft, 'upload_inline_image', return_value='https://mmbiz.qpic.cn/example') as upload, \
                    patch.object(draft, 'create_draft', return_value='created') as create, \
                    patch.object(draft, 'verify_draft', return_value=0):
                self.assertEqual(draft.upload_and_cleanup('cover.png', 'title', '', html, base_dir=directory), ('created', 0))
            upload.assert_called_once_with('fake-token', image.resolve())
            sent = create.call_args.args[-1]
            self.assertEqual(sent.count('src="https://mmbiz.qpic.cn/example"'), 2)
            self.assertIn('data-src="keep"', sent)

    def test_image_replacement_ignores_attribute_text_and_preserves_offsets(self):
        with tempfile.TemporaryDirectory() as directory:
            from PIL import Image
            path = Path(directory) / 'image.png'
            Image.new('RGB', (2, 2), 'white').save(path)
            html = '文字\r竖线\v换行\n<img alt="example src=fake.png" src="image.png">'
            images = draft._Images(html, directory)
            with patch.object(draft, 'upload_inline_image', return_value='https://mmbiz.qpic.cn/real'):
                updated = draft._replace_images('fake-token', html, images)
            self.assertEqual(updated, html.replace('src="image.png"', 'src="https://mmbiz.qpic.cn/real"'))

    def test_upload_readback_failure_keeps_created_media_id(self):
        with patch.object(draft, 'get_token', return_value='fake-token'), \
                patch.object(draft, 'upload_cover', return_value='cover'), \
                patch.object(draft, 'create_draft', return_value='created') as create, \
                patch('requests.post', return_value=response({'news_item': []})):
            with self.assertRaises(draft.DraftVerificationError) as raised:
                draft.upload_and_cleanup('cover.png', '标题', '', '<p>正文</p>')
        self.assertEqual(raised.exception.media_id, 'created')
        create.assert_called_once()

    def test_bad_local_image_fails_before_token_or_api(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(draft, 'get_token') as token:
            path = Path(directory) / 'image.png'
            path.write_text('not an image', encoding='utf-8')
            with self.assertRaises(OSError):
                draft.upload_and_cleanup('cover', 'title', '', '<img src="image.png">', base_dir=directory)
            token.assert_not_called()

    def test_cli_preserves_literal_escapes(self):
        html = '<p><span leaf="">print("first\\nsecond")</span></p>'
        with patch.object(sys, 'argv', ['wechat_draft.py', 'cover.png', 'title', 'summary']), \
                patch.object(sys, 'stdin', io.StringIO(html)), patch.object(draft, 'upload_and_cleanup') as upload:
            self.assertEqual(draft.main(), 0)
        self.assertEqual(upload.call_args.args[3], html)

    def test_cli_file_sets_image_base_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory) / '文章.html'
            p.write_text('<p>中文😀</p>', encoding='utf-8')
            with patch.object(sys, 'argv', ['wechat_draft.py', 'cover', 'title', 'summary', '--html-file', str(p)]), \
                    patch.object(draft, 'upload_and_cleanup') as upload:
                self.assertEqual(draft.main(), 0)
            self.assertEqual(upload.call_args.args[3], '<p>中文😀</p>')
            # Windows runners may expose TEMP via an 8.3 alias such as RUNNER~1.
            self.assertTrue(upload.call_args.kwargs['base_dir'].samefile(p.parent))


class CLITests(unittest.TestCase):
    def test_public_modules_can_be_imported_without_changing_stdio(self):
        code = ('import sys; original = sys.stdout.encoding; '
                'from scripts import minify_gzh_html, extract_docx, validate_gzh_html, '
                'component_lint, wechat_draft, wrap_preview; '
                'assert sys.stdout.encoding == original')
        result = subprocess.run([sys.executable, '-c', code], cwd=ROOT, capture_output=True,
                                env=dict(os.environ, PYTHONIOENCODING='gbk'))
        self.assertEqual(result.returncode, 0, result.stderr.decode('utf-8', 'replace'))

    def test_library_status_keeps_host_encoding_and_does_not_raise(self):
        buffer = io.BytesIO()
        stream = io.TextIOWrapper(buffer, encoding='gbk')
        with patch.object(sys, 'stdout', stream):
            print_status('✅ 上传完成：标题😀')
        stream.flush()
        self.assertEqual(stream.encoding, 'gbk')
        self.assertIn('上传完成：标题', buffer.getvalue().decode('gbk'))

    def test_validator_works_under_gbk_redirected_stdio(self):
        env = dict(os.environ, PYTHONIOENCODING='gbk')
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/validate_gzh_html.py'), '--stdin'],
                                input='<p><span leaf="">正文</span></p>'.encode(), capture_output=True, env=env)
        self.assertEqual(result.returncode, 0, result.stderr.decode('utf-8', 'replace'))
        self.assertIn('完全合规', result.stdout.decode('utf-8'))

    def test_component_lint_works_under_gbk_redirected_stdio(self):
        env = dict(os.environ, PYTHONIOENCODING='gbk')
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/component_lint.py'), str(ROOT)],
                                capture_output=True, env=env)
        self.assertEqual(result.returncode, 0, result.stderr.decode('utf-8', 'replace'))
        self.assertIn('ERROR×0', result.stdout.decode('utf-8'))


class RepositoryTests(unittest.TestCase):
    def test_gallery_and_minified_outputs(self):
        for path in sorted((ROOT / 'docs/gallery').glob('*.html')):
            if path.name == 'index.html':
                continue
            source = path.read_text(encoding='utf-8')
            with self.subTest(theme=path.stem):
                self.assertEqual(validate(source)[:2], ([], []))
                self.assertEqual(validate(minify_html(source))[:2], ([], []))

    def test_png_assets_are_complete(self):
        from PIL import Image
        for path in sorted((ROOT / 'assets').glob('lf-*.png')):
            with self.subTest(asset=path.name):
                with Image.open(path) as image:
                    image.verify()
                with Image.open(path) as image:
                    image.load()

    @unittest.skipUnless(os.name != 'nt' and shutil.which('rsync'), 'requires Linux rsync')
    def test_actual_mirror_script_replaces_only_the_mirror(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, target = root / 'source', root / 'target'
            source.mkdir(); target.mkdir()
            (source / 'README.md').write_text('new')
            (source / '.git').mkdir(); (source / '.github').mkdir()
            (source / '.git/config').write_text('private git metadata')
            (target / 'index.html').write_text('existing website')
            (target / 'gzh-skill-kit').mkdir()
            (target / 'gzh-skill-kit/stale.html').write_text('old')
            command = ['bash', str(ROOT / '.github/scripts/sync-mirror.sh')]
            subprocess.run([*command, str(source), str(target)], check=True)
            mirror = target / 'gzh-skill-kit'
            self.assertEqual(sorted(p.name for p in mirror.iterdir()), ['README.md'])
            self.assertEqual((target / 'index.html').read_text(), 'existing website')
            nested = source / 'dst'; nested.mkdir()
            rejected = subprocess.run([*command, str(source), str(nested)], capture_output=True)
            self.assertNotEqual(rejected.returncode, 0)


if __name__ == '__main__':
    unittest.main()
