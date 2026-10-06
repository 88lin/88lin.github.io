// Match website/src/lib/motion.ts: Lenis 1.3.26 and the same wheel response.
// Keep document scrolling native for layout, sticky controls and navigation.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  let lenis = null;
  let resizeObserver = null;
  let frame = 0;
  let lastWritten = window.scrollY;
  let touchUntil = 0;

  function interrupt() {
    // Reset the glide without locking the document or writing another position.
    lenis?.reset();
    lastWritten = window.scrollY;
  }

  function resize() {
    // Filtering can change the document height in one frame. Cancel the old
    // destination and refresh bounds before the next input uses the old limit.
    interrupt();
    lenis?.resize();
  }

  function needsNativeScroll(event) {
    // Chat, form controls and independently scrollable regions own their input.
    for (const element of event.composedPath()) {
      if (!(element instanceof Element) || element === root || element === document.body) continue;
      if (element.matches('input, textarea, select, [contenteditable], #ctrm_, dialog, [role="dialog"], [data-native-scroll]')) return true;
      const style = getComputedStyle(element);
      if (/(auto|scroll|overlay)/.test(style.overflowY) && element.scrollHeight > element.clientHeight) return true;
      if (/(auto|scroll|overlay)/.test(style.overflowX) && element.scrollWidth > element.clientWidth) return true;
    }
    return false;
  }

  function virtualScroll({ event, deltaX, deltaY }) {
    if (event.type !== 'wheel' || event.defaultPrevented || !event.cancelable
      || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey
      || !deltaY || Math.abs(deltaX) >= Math.abs(deltaY)
      || performance.now() < touchUntil || needsNativeScroll(event)) {
      interrupt();
      return false;
    }
    // External scrolls can happen between frames (focus, history, scrollbar).
    if (Math.abs(window.scrollY - lastWritten) > 2) interrupt();
    return true;
  }

  function animate(time) {
    if (!lenis) return;
    if (lenis.isScrolling === 'smooth' && Math.abs(window.scrollY - lastWritten) > 2) interrupt();
    lenis.raf(time);
    lastWritten = window.scrollY;
    frame = requestAnimationFrame(animate);
  }

  function dispose() {
    cancelAnimationFrame(frame);
    frame = 0;
    resizeObserver?.disconnect();
    resizeObserver = null;
    // Clear scrolling state before delayed native-scroll callbacks can run.
    lenis?.stop();
    lenis?.destroy();
    lenis = null;
    root.dataset.scrollMode = 'native';
  }

  function sync() {
    const enabled = finePointer.matches && !reducedMotion.matches && !document.hidden
      && typeof window.Lenis === 'function';
    if (!enabled) {
      dispose();
      return;
    }
    if (lenis) {
      interrupt();
      return;
    }
    lenis = new window.Lenis({
      duration: 1.05,
      easing: t => 1 - Math.pow(1 - t, 3.2),
      wheelMultiplier: 0.92,
      touchMultiplier: 1.4,
      // Observe layout directly instead of waiting for Lenis's resize debounce.
      autoResize: false,
      virtualScroll
    });
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    lastWritten = window.scrollY;
    root.dataset.scrollMode = 'lenis';
    frame = requestAnimationFrame(animate);
  }

  // Yield before the existing native anchor, search and back-to-top handlers.
  document.addEventListener('pointerdown', interrupt, { capture: true, passive: true });
  document.addEventListener('touchstart', () => {
    touchUntil = performance.now() + 800;
    interrupt();
  }, { capture: true, passive: true });
  document.addEventListener('keydown', interrupt, true);
  document.addEventListener('click', interrupt, true);
  document.addEventListener('focusin', interrupt, true);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pagehide', dispose);
  window.addEventListener('pageshow', sync);
  window.addEventListener('popstate', interrupt);
  window.addEventListener('hashchange', interrupt);
  reducedMotion.addEventListener('change', sync);
  finePointer.addEventListener('change', sync);
  sync();
})();
