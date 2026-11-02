"""Browser regressions: python tests/browser_preview.py (requires Playwright Chromium)."""
from pathlib import Path
import re
import sys
import unittest

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from wrap_preview import render_preview


class PreviewBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_all_gallery_previews_use_the_phone_viewport(self):
        with self.browser.new_context(viewport={'width': 390, 'height': 844},
                                      is_mobile=True, has_touch=True, device_scale_factor=3) as context:
            # These tests only use repository files; external resources are unnecessary.
            context.route('http://**/*', lambda route: route.abort())
            context.route('https://**/*', lambda route: route.abort())
            page = context.new_page()
            previews = sorted((ROOT / 'docs/previews').glob('*.html'))
            self.assertTrue(previews)
            for preview in previews:
                with self.subTest(theme=preview.stem):
                    page.goto(preview.as_uri())
                    self.assertEqual(page.evaluate('document.documentElement.clientWidth'), 390)
                    self.assertAlmostEqual(page.evaluate('visualViewport.scale'), 1)
                    self.assertLessEqual(page.locator('.gzh-stage').bounding_box()['width'], 390)
                    self.assertTrue(page.locator('#gzh-content').inner_text().strip())

    def test_copy_failure_keeps_only_article_selected(self):
        for behavior in ['return false', 'throw new Error("copy blocked")']:
            with self.subTest(behavior=behavior), self.browser.new_context() as context:
                page = context.new_page()
                page.set_content(render_preview('<section><p><span leaf="">正文 ONLY</span></p></section>', '测试'))
                page.evaluate(f'() => {{ document.execCommand = () => {{ {behavior}; }}; }}')
                page.locator('#gzhCopyBtn').click()
                self.assertEqual(page.evaluate('getSelection().toString().trim()'), '正文 ONLY')
                self.assertTrue(page.evaluate('''() => document.getElementById('gzh-content').contains(
                    getSelection().getRangeAt(0).commonAncestorContainer)'''))
                hint = page.locator('#gzhToast').inner_text()
                self.assertIn('Ctrl/⌘+C', hint)
                self.assertNotIn('+A', hint)

    def test_copy_success_clears_selection_after_copying_article(self):
        with self.browser.new_context() as context:
            page = context.new_page()
            page.set_content(render_preview('<section><p><span leaf="">正文 ONLY</span></p></section>', '测试'))
            page.evaluate('''() => { document.execCommand = () => {
                window.selectedAtCopy = getSelection().toString().trim(); return true;
            }; }''')
            page.locator('#gzhCopyBtn').click()
            self.assertEqual(page.evaluate('window.selectedAtCopy'), '正文 ONLY')
            self.assertEqual(page.evaluate('getSelection().rangeCount'), 0)
            self.assertIn('已复制', page.locator('#gzhToast').inner_text())

    def test_copy_preserves_alignment_without_serializing_logical_defaults(self):
        article = ('<section><p><span leaf="">默认左对齐</span></p>'
                   '<p style="text-align:center"><span leaf="">居中标题</span></p>'
                   '<p style="text-align:right"><span leaf="">右侧署名</span></p>'
                   '<p style="text-align:justify"><span leaf="">两端对齐正文</span></p></section>')
        with self.browser.new_context(permissions=['clipboard-read', 'clipboard-write']) as context:
            # Use a secure local fixture and read the browser's real HTML clipboard.
            context.route('https://preview.test/', lambda route: route.fulfill(
                content_type='text/html', body=render_preview(article, '对齐测试')))
            page = context.new_page()
            page.goto('https://preview.test/')
            for preview_default, expected in [(False, 'start'), (True, 'left')]:
                with self.subTest(preview_default=preview_default):
                    page.set_content(render_preview(article, '对齐测试'))
                    if not preview_default:
                        # Control: remove the preview's stylesheet so the article
                        # uses the browser default. No inline start/end is added.
                        page.evaluate('''() => {
                            for (const sheet of document.styleSheets) sheet.disabled = true;
                        }''')
                    page.locator('#gzhCopyBtn').click()
                    copied = page.evaluate('''async () => {
                        for (const item of await navigator.clipboard.read()) {
                            if (item.types.includes('text/html')) {
                                return await (await item.getType('text/html')).text();
                            }
                        }
                        throw new Error('Missing HTML clipboard');
                    }''')
                    pattern = re.compile(r'text-align\s*:\s*(start|end)\b', re.I)
                    if preview_default:
                        self.assertNotRegex(copied, pattern)
                    else:
                        self.assertRegex(copied, pattern)
                    page.set_content(copied)
                    self.assertEqual(page.locator('p').evaluate_all(
                        'nodes => nodes.map(el => getComputedStyle(el).textAlign)'),
                        [expected, 'center', 'right', 'justify'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
