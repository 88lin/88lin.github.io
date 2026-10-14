"""Local scroll regressions. Run with Python and the Playwright Chromium runtime.

Uses a fresh headless browser and blocks external requests. No personal profile.
"""
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]


def block_external(page):
    page.route('http://**/*', lambda route: route.abort())
    page.route('https://**/*', lambda route: route.abort())


def next_layout(page):
    page.evaluate('''() => new Promise(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)))''')


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    try:
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        block_external(page)

        # A filter shrinks the page, then content grows during the glide.
        # The old, taller page's destination must never become reachable again.
        page.set_content('<style>body{margin:0;height:6000px}</style>')
        page.add_script_tag(path=str(ROOT / 'assets/home/vendor/lenis-1.3.26.min.js'))
        page.add_script_tag(path=str(ROOT / 'assets/home/scroll.js'))
        next_layout(page)
        assert page.evaluate('document.documentElement.dataset.scrollMode') == 'lenis'
        page.evaluate("document.body.style.height = '1300px'")
        next_layout(page)
        page.evaluate('''document.body.dispatchEvent(new WheelEvent('wheel', {
          deltaY:1500, bubbles:true, cancelable:true
        }))''')
        page.wait_for_timeout(110)
        page.evaluate("document.body.style.height = '6000px'")
        page.wait_for_timeout(1200)
        assert page.evaluate('scrollY') <= 400, 'Stale inertia resumed after a layout change'

        page.goto((ROOT / 'index.html').as_uri(), wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(850)
        assert page.evaluate('document.documentElement.dataset.scrollMode') == 'lenis'
        page.mouse.move(35, 480)
        page.evaluate("scrollTo({top:400, behavior:'instant'})")
        next_layout(page)
        page.mouse.wheel(0, 120)
        page.wait_for_timeout(1200)
        assert page.evaluate('scrollY') == 510, 'Wheel multiplier or distance changed'

        # A native navigation or click must take ownership from the glide.
        page.mouse.wheel(0, 240)
        page.wait_for_timeout(60)
        page.evaluate("scrollTo({top:100, behavior:'instant'})")
        page.wait_for_timeout(1200)
        assert page.evaluate('scrollY') == 100, 'Native scroll was overwritten'
        page.mouse.wheel(0, 240)
        page.wait_for_timeout(60)
        page.mouse.click(35, 480)
        stopped = page.evaluate('scrollY')
        page.wait_for_timeout(1200)
        assert page.evaluate('scrollY') == stopped, 'Click did not interrupt inertia'

        page.locator('[data-browse="design"]').click()
        assert page.locator('[data-filter="design"]').get_attribute('aria-pressed') == 'true'
        page.locator('#searchInput').fill('图')
        page.locator('#searchInput').press('Enter')
        page.wait_for_timeout(1200)
        assert page.locator('.resource-link:not(.is-hidden)').count() > 0
        page.locator('#backToTop').click()
        page.wait_for_function('scrollY === 0', timeout=3000)

        page.emulate_media(reduced_motion='reduce')
        page.wait_for_function('document.documentElement.dataset.scrollMode === "native"')
        assert not page.evaluate('document.documentElement.classList.contains("lenis")')
        page.wait_for_timeout(600)
        assert not page.evaluate('document.documentElement.classList.contains("lenis")'), 'Delayed native-scroll callback restored a destroyed controller class'
        page.emulate_media(reduced_motion='no-preference')
        page.wait_for_function('document.documentElement.dataset.scrollMode === "lenis"')
        page.locator('#searchInput').fill('')
        page.locator('[data-filter="all"]').click()
        page.wait_for_timeout(400)
        page.evaluate("scrollTo({top:400, behavior:'instant'})")
        next_layout(page)
        page.mouse.move(35, 480)
        page.mouse.wheel(0, 120)
        page.wait_for_timeout(1200)
        assert page.evaluate('scrollY') == 510, 'Duplicate wheel handler after re-enabling motion'

        mobile_context = browser.new_context(
            viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True
        )
        mobile = mobile_context.new_page()
        block_external(mobile)
        mobile.goto((ROOT / 'index.html').as_uri(), wait_until='networkidle')
        assert mobile.evaluate('document.documentElement.dataset.scrollMode') == 'native'
        assert not errors, errors
    finally:
        browser.close()

print('PASS: changing layout bounds, wheel response, native interruption, search, '
      'categories, back-to-top, reduced-motion lifecycle and touch mode.')
