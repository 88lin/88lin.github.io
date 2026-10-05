// Homepage interactions; resource links remain usable without JavaScript.
const startDate = new Date('2021-07-12T00:00:00+08:00');
const runtimeElement = document.getElementById('siteRuntime');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const welcomeToast = document.getElementById('welcomeToast');
const welcomeToastEyebrow = document.getElementById('welcomeToastEyebrow');
const welcomeToastMessage = document.getElementById('welcomeToastMessage');
const links = Array.from(document.querySelectorAll('.resource-link'));
const collectionFilters = Array.from(document.querySelectorAll('.collection-filter'));
const collectionToolbar = document.querySelector('.collection-toolbar');
const toolGrid = document.getElementById('toolGrid');
const searchStatus = document.getElementById('searchStatus');
const emptyState = document.getElementById('emptyState');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let firstFilter = true;
const canAnimate = () => !reducedMotion.matches;

let activeFilter = 'all';
let welcomeToastTimer = null;
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour > 23 || hour <= 5) {
    return "你是夜猫子呀？这么晚还不睡觉，明天起的来嘛？";
  }
  if (hour <= 7) {
    return "早上好，新的一天已经开始了，来这里找点趁手工具吧。";
  }
  if (hour <= 11) {
    return "上午好，先把常用入口打开，今天会轻松很多。";
  }
  if (hour <= 14) {
    return "中午好，短暂休息时也可以顺手来这里找点灵感。";
  }
  if (hour <= 17) {
    return "下午容易犯困，试试用计时和专注工具帮自己提提神。";
  }
  if (hour <= 19) {
    return "傍晚好，适合慢慢逛逛这些有趣的小页面。";
  }
  if (hour <= 23) {
    return "晚上好，来这里找工具、找灵感，或者随便逛逛都可以。";
  }
  return "欢迎回来，看看今天想先打开哪一个入口。";
}

function getReferrerLabel() {
  if (!document.referrer) {
    return "直接来到这里的朋友";
  }

  try {
    const hostname = new URL(document.referrer).hostname;
    if (hostname.includes("bing")) return "从必应来的朋友";
    if (hostname.includes("baidu")) return "从百度来的朋友";
    if (hostname.includes("google")) return "从谷歌来的朋友";
    if (hostname.includes("sogou")) return "从搜狗来的朋友";
    if (hostname.includes("so.com")) return "从 360 搜索来的朋友";
    return "从 " + hostname + " 来的朋友";
  } catch (error) {
    return "来到这里的朋友";
  }
}

function getClientSummary() {
  const ua = navigator.userAgent;
  let browser = "浏览器";
  let os = navigator.platform || "设备";

  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Safari";

  if (/Windows/i.test(ua)) os = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";

  return { browser, os };
}

function cleanApiText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/* 归属地查询走自建中转服务，与 notion/hy.html 使用同一套数据源：
   第三方密钥保存在服务端，不暴露在前端；返回的是中文地名。 */
const IP_API_ENDPOINT = "https://nbr5n3s9.qwenwork.host/api/ip";

function getVisitorLocationLabel(data, fallbackLabel) {
  const country = cleanApiText(data.country);

  if (!country) {
    return fallbackLabel;
  }

  /* 国内显示到省市，境外只显示国家，避免中英文地名混排 */
  if (country === "中国") {
    const detail = [cleanApiText(data.province), cleanApiText(data.city)]
      .filter(Boolean)
      .filter((item, index, list) => list.indexOf(item) === index)
      .join(" ");
    return "来自 " + (detail || country) + " 的朋友";
  }

  return "来自 " + country + " 的朋友";
}

/* 先取访客出口 IP 再传给服务端，避免服务端只认代理头导致归属地偏差。
   取不到也没关系，服务端会按访客头自行识别。 */
async function fetchVisitorIp(signal) {
  try {
    const response = await fetch("https://api.ip.sb/ip", { cache: "no-store", signal });
    if (response.ok) {
      const text = (await response.text()).trim();
      if (/^[0-9A-Fa-f:.]{7,45}$/.test(text)) {
        return text;
      }
    }
  } catch (error) {
    /* 取不到就回退到服务端识别 */
  }
  return "";
}

async function getVisitorMessage() {
  const greeting = getTimeGreeting();
  const referrer = getReferrerLabel();
  const fallbackClient = getClientSummary();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const visitorIp = await fetchVisitorIp(controller.signal);
    const url = new URL(IP_API_ENDPOINT);

    if (visitorIp) {
      url.searchParams.set("ip", visitorIp);
    }

    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error("bad response");
    }

    const payload = await response.json();

    if (!payload || payload.code !== 0 || !payload.data) {
      throw new Error("bad payload");
    }

    return {
      eyebrow: getVisitorLocationLabel(payload.data, referrer),
      message: "使用 " + fallbackClient.os + " · " + fallbackClient.browser + " 访问本站。" + greeting
    };
  } catch (error) {
    return {
      eyebrow: referrer,
      message: "使用 " + fallbackClient.os + " · " + fallbackClient.browser + " 访问本站。" + greeting
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

let welcomeProgress = null;
let welcomeRemaining = 7000;
let welcomeStarted = 0;
let welcomeVisible = false;
let visitorHasInteracted = false;
const welcomePauseReasons = new Set();
function dismissWelcomeToast(immediate = false) {
  const hadFocus = welcomeToast.contains(document.activeElement);
  clearTimeout(welcomeToastTimer);
  welcomeToastTimer = null;
  welcomeVisible = false;
  welcomeProgress?.cancel();
  welcomeToast.classList.remove('is-visible');
  if (immediate === true) welcomeToast.classList.add('is-hidden');
  else setTimeout(() => welcomeToast.classList.add('is-hidden'), 260);
  if (hadFocus) searchInput.focus({ preventScroll: true });
}
function resumeWelcomeTimer() {
  if (!welcomeVisible || welcomePauseReasons.size) return;
  clearTimeout(welcomeToastTimer);
  welcomeStarted = performance.now();
  welcomeToastTimer = setTimeout(dismissWelcomeToast, welcomeRemaining);
  welcomeProgress?.play();
}
function pauseWelcomeTimer(reason) {
  if (!welcomePauseReasons.size && welcomeVisible) {
    welcomeRemaining = Math.max(0, welcomeRemaining - (performance.now() - welcomeStarted));
    clearTimeout(welcomeToastTimer);
    welcomeProgress?.pause();
  }
  welcomePauseReasons.add(reason);
}
function unpauseWelcomeTimer(reason) {
  if (!welcomePauseReasons.has(reason)) return;
  welcomePauseReasons.delete(reason);
  resumeWelcomeTimer();
}
async function showWelcomeToast() {
  const content = await getVisitorMessage();
  if (visitorHasInteracted || window.scrollY > 24) return;
  welcomeToastEyebrow.textContent = content.eyebrow;
  welcomeToastMessage.textContent = content.message.replace(/^使用.*?访问本站。/, '');
  welcomeToast.classList.remove('is-hidden');
  welcomeRemaining = 7000;
  welcomeVisible = true;
  welcomePauseReasons.clear();
  if (document.hidden) welcomePauseReasons.add('hidden');
  if (welcomeToast.matches(':hover')) welcomePauseReasons.add('pointer');
  if (welcomeToast.contains(document.activeElement)) welcomePauseReasons.add('focus');
  requestAnimationFrame(() => welcomeToast.classList.add('is-visible'));
  if (canAnimate()) welcomeProgress = document.querySelector('.welcome-progress').animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 7000, fill: 'forwards' });
  welcomeProgress?.pause();
  resumeWelcomeTimer();
}
welcomeToast.addEventListener('pointerenter', () => pauseWelcomeTimer('pointer'));
welcomeToast.addEventListener('pointerleave', () => unpauseWelcomeTimer('pointer'));
welcomeToast.addEventListener('focusin', () => pauseWelcomeTimer('focus'));
welcomeToast.addEventListener('focusout', event => { if (!welcomeToast.contains(event.relatedTarget)) unpauseWelcomeTimer('focus'); });

function updateRuntime() {
  const now = new Date();
  const diff = now - startDate;
  const days = Math.floor(diff / 86400000);
  runtimeElement.textContent = "已相伴 " + days + " 天";
}

function syncFilters() {
  collectionFilters.forEach((button) => {
    const selected = button.dataset.filter === activeFilter;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const toolbar = document.querySelector('.collection-toolbar');
  const activeButton = collectionFilters.find(button => button.dataset.filter === activeFilter);
  if (toolbar.scrollWidth > toolbar.clientWidth && activeButton) {
    const bounds = toolbar.getBoundingClientRect();
    const selected = activeButton.getBoundingClientRect();
    const inset = parseFloat(getComputedStyle(toolbar).paddingLeft) + toolbar.clientLeft;
    const offset = selected.left < bounds.left + inset
      ? selected.left - bounds.left - inset
      : selected.right > bounds.right - inset ? selected.right - bounds.right + inset : 0;
    if (offset) toolbar.scrollTo({ left: toolbar.scrollLeft + offset, behavior: canAnimate() ? 'smooth' : 'instant' });
  }
}

function matchesCategory(link, category) {
  return category === 'all' || link.dataset.group === category ||
    (link.dataset.relatedGroups || '').split(/\s+/).includes(category);
}

function filterLinks() {
  const animateGrid = !firstFilter && canAnimate() && document.getElementById('toolGrid').getBoundingClientRect().top < innerHeight;
  const oldBoxes = new Map(animateGrid ? links.filter(link => !link.classList.contains('is-hidden')).map(link => [link, link.getBoundingClientRect()]) : []);
  const query = searchInput.value.trim().toLocaleLowerCase();
  clearSearch.classList.toggle('is-hidden', !query);
  document.querySelector('.search-key').classList.toggle('is-hidden', Boolean(query));
  let count = 0;
  links.forEach((link) => {
    const text = `${link.dataset.keywords} ${link.textContent}`.toLocaleLowerCase();
    const match = matchesCategory(link, activeFilter) && (!query || text.includes(query));
    link.classList.toggle('is-hidden', !match);
    if (match) count++;
  });
  emptyState.classList.toggle('is-hidden', count > 0);
  const groupName = collectionFilters.find((button) => button.dataset.filter === activeFilter).textContent.trim();
  searchStatus.textContent = query ? `找到 ${count} 个匹配入口` : `${activeFilter === 'all' ? '全部' : groupName} ${count} 个入口`;
  if (animateGrid) {
    links.filter(link => !link.classList.contains('is-hidden')).slice(0, 12).forEach((link, index) => {
      const before = oldBoxes.get(link), after = link.getBoundingClientRect();
      if (after.bottom < 0 || after.top > innerHeight) return;
      link.getAnimations().forEach(animation => animation.cancel());
      link.animate(before ? [{ transform: `translate(${before.left - after.left}px, ${before.top - after.top}px)` }, { transform: 'translate(0, 0)' }] : [{ opacity: .25, transform: 'translateY(14px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 360, delay: Math.min(index * 18, 90), easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  }
  firstFilter = false;
}

function showResults() {
  document.getElementById('collections').scrollIntoView({ block: 'start', behavior: canAnimate() ? 'smooth' : 'instant' });
}

// Native focus scrolling can leave a partially visible card behind the sticky
// toolbar. Account for its actual wrapped height, including after font loading.
function keepFocusedToolVisible() {
  const focusedTool = document.activeElement;
  if (links.includes(focusedTool) && focusedTool.matches(':focus-visible')) {
    focusedTool.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }
}

function syncCatalogScrollClearance() {
  const top = parseFloat(getComputedStyle(collectionToolbar).top) || 0;
  const clearance = Math.ceil(collectionToolbar.getBoundingClientRect().height + top + 12);
  toolGrid.style.setProperty('--catalog-scroll-clearance', `${clearance}px`);
  requestAnimationFrame(keepFocusedToolVisible);
}

toolGrid.addEventListener('focusin', () => requestAnimationFrame(keepFocusedToolVisible));
new ResizeObserver(syncCatalogScrollClearance).observe(collectionToolbar);
syncCatalogScrollClearance();

function resolveCategory(key) {
  const normalized = key === 'other' ? 'utility' : key;
  return collectionFilters.some(button => button.dataset.filter === normalized) ? normalized : 'all';
}

function chooseCategory(key) {
  activeFilter = resolveCategory(key);
  syncFilters();
  filterLinks();
}

searchInput.addEventListener('input', () => {
  filterLinks();
  updateSearchUrl();
});
document.getElementById('searchForm').addEventListener('submit', (event) => {
  event.preventDefault();
  filterLinks();
  // Keep the search link shareable on a static host.
  updateSearchUrl();
  showResults();
});
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  filterLinks();
  updateSearchUrl();
  searchInput.focus();
});
collectionFilters.forEach((button) => button.addEventListener('click', () => {
  const toolbar = document.querySelector('.collection-toolbar');
  const wasSticky = toolbar.getBoundingClientRect().top <= parseFloat(getComputedStyle(toolbar).top) + 1;
  chooseCategory(button.dataset.filter);
  updateSearchUrl();
  if (wasSticky) showResults();
}));
document.querySelectorAll('[data-browse]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  searchInput.value = '';
  chooseCategory(link.dataset.browse);
  updateSearchUrl();
  showResults();
}));
document.querySelectorAll('.shortcut-chip').forEach((button) => button.addEventListener('click', () => {
  const category = button.dataset.shortcutCategory;
  searchInput.value = category ? '' : button.dataset.shortcut;
  chooseCategory(category || 'all');
  updateSearchUrl();
  showResults();
}));
document.getElementById('resetFilters').addEventListener('click', () => {
  searchInput.value = '';
  chooseCategory('all');
  updateSearchUrl();
  collectionFilters[0].focus({ preventScroll: true });
});
document.addEventListener('keydown', (event) => {
  const target = event.target;
  const editing = target instanceof Element && (target.closest('input, textarea, select, [contenteditable], #ctrm_') || target.isContentEditable);
  if ((event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !editing) || (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey) && !editing)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === 'Escape' && target === searchInput) {
    searchInput.value = '';
    filterLinks();
    updateSearchUrl();
  }
});
function restoreFiltersFromUrl() {
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const category = resolveCategory(params.get('category'));
  // Fragment navigation also fires popstate; leave identical filters untouched.
  if (!firstFilter && searchInput.value.trim() === query.trim() && activeFilter === category) return;
  searchInput.value = query;
  chooseCategory(category);
}
window.addEventListener('popstate', restoreFiltersFromUrl);

const recommendations = [
  { name: '古诗起名', description: '从诗词意境里，遇见一个好名字', href: '/gushi/dist/', glyph: '诗', tone: 'violet', meta: '日常工具' },
  { name: '科研海报生成器', description: '把研究成果，整理成一张好海报', href: '/academic-poster-generator/', glyph: '图', tone: 'coral', meta: '图片设计' },
  { name: '番茄时钟', description: '留一点专注的时间，把眼前的事做好', href: 'https://focustide.app', glyph: '时', tone: 'blue', meta: '计时专注' },
  { name: 'Lofi 音乐', description: '给工作和放空，配上一点舒服的旋律', href: 'https://lofi.88lin.eu.org', glyph: '听', tone: 'indigo', meta: '影音放松' },
  { name: '个人书单旭日图', description: '换一种方式，发现书与书之间的联系', href: '/books', glyph: '书', tone: 'lavender', meta: '阅读学习' },
  { name: '跨年烟花', description: '给平常的一天，一点特别的仪式感', href: '/fireworks/', glyph: '花', tone: 'rose', meta: '节日祝福' }
];
let recommendationIndex = 0;
const discoveryStage = document.querySelector('.discovery-stage');
const discoveryViewport = document.querySelector('.discovery-viewport');
const discoveryTrack = document.querySelector('.discovery-track');
const discoveryTemplate = document.querySelector('.discovery-card');
let discoveryPointerStart = null;
let discoveryDragOffset = 0;
let suppressDiscoveryClickUntil = 0;
const discoveryCards = [discoveryTemplate];
const wrapRecommendation = index => (index + recommendations.length) % recommendations.length;

for (let index = 1; index < recommendations.length; index += 1) {
  const card = discoveryTemplate.cloneNode(true);
  card.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  card.setAttribute('aria-hidden', 'true');
  card.inert = true;
  discoveryTrack.append(card);
  discoveryCards.push(card);
}

function fillRecommendation(card, index) {
  const recommendation = recommendations[index];
  card.dataset.tone = recommendation.tone;
  card.setAttribute('aria-label', `第 ${index + 1} 张，共 ${recommendations.length} 张：${recommendation.name}`);
  card.querySelector('.discovery-ghost').textContent = String(index + 1).padStart(2, '0');
  card.querySelector('.discovery-spine').textContent = recommendation.name;
  card.querySelector('h3').textContent = recommendation.name;
  card.querySelector('.discovery-meta').innerHTML = `${recommendation.meta}<s></s>推荐入口`;
  card.querySelector('.discovery-description').textContent = recommendation.description;
  const source = links.find(link => link.getAttribute('href') === recommendation.href)?.querySelector('.tool-icon');
  card.querySelector('.discovery-symbol').innerHTML = source ? source.innerHTML : `<span class="discovery-glyph">${recommendation.glyph}</span>`;
}

function updateDiscoveryDeck() {
  const focusedCard = document.activeElement.closest('.discovery-card');
  if (focusedCard && focusedCard !== discoveryCards[recommendationIndex]) discoveryStage.focus({ preventScroll: true });
  // Remove shared IDs before assigning them to the new front card.
  discoveryCards.forEach(card => card.querySelectorAll('[id]').forEach(element => element.removeAttribute('id')));
  discoveryCards.forEach((card, index) => {
    const slot = wrapRecommendation(index - recommendationIndex);
    const front = slot === 0;
    const link = card.querySelector('.discovery-link');
    card.dataset.slot = String(slot);
    card.classList.toggle('is-current', front);
    card.setAttribute('aria-hidden', front ? 'false' : 'true');
    card.inert = !front;
    if (front) {
      card.querySelector('h2').id = 'discovery-heading';
      card.querySelector('h3').id = 'discoveryName';
      card.querySelector('.discovery-description').id = 'discoveryDescription';
      card.querySelector('.discovery-symbol').id = 'discoverySymbol';
      link.id = 'discoveryLink';
    }
    if (front) {
      link.href = recommendations[index].href;
      link.tabIndex = 0;
    } else {
      link.removeAttribute('href');
      link.tabIndex = -1;
    }
    card.style.setProperty('--dx', front ? `${discoveryDragOffset}px` : '0px');
    card.style.setProperty('--rot', front ? `${(discoveryDragOffset * 0.016).toFixed(3)}deg` : '0deg');
  });
  discoveryStage.dataset.tone = recommendations[recommendationIndex].tone;
  document.querySelectorAll('.deck-dots i').forEach((dot, index) => dot.classList.toggle('is-active', index === recommendationIndex));
  const current = discoveryCards.find(card => card.dataset.slot === '0');
  const status = document.getElementById('discoveryStatus');
  const label = current?.getAttribute('aria-label') || '';
  if (status.textContent !== label) status.textContent = label;
  if (focusedCard && focusedCard !== current) current.querySelector('.discovery-link').focus({ preventScroll: true });
}

function setRecommendation(index) {
  cancelDiscoveryDrag();
  recommendationIndex = wrapRecommendation(index);
  updateDiscoveryDeck();
}

function advanceRecommendation(step = 1) {
  setRecommendation(recommendationIndex + (step >= 0 ? 1 : -1));
}

function updateDiscoveryDrag(offset) {
  discoveryDragOffset = offset;
  const card = discoveryCards[recommendationIndex];
  card.style.setProperty('--dx', `${offset}px`);
  card.style.setProperty('--rot', `${(offset * 0.016).toFixed(3)}deg`);
}

function cancelDiscoveryDrag() {
  const pointer = discoveryPointerStart;
  discoveryPointerStart = null;
  discoveryStage.classList.remove('is-dragging');
  if (pointer?.dragging) suppressDiscoveryClickUntil = performance.now() + 400;
  if (pointer && discoveryViewport.hasPointerCapture(pointer.id)) discoveryViewport.releasePointerCapture(pointer.id);
  if (discoveryDragOffset) updateDiscoveryDrag(0);
}

function releaseDiscoveryPointer(event, cancelled = false) {
  if (!discoveryPointerStart || discoveryPointerStart.id !== event.pointerId) return;
  const pointer = discoveryPointerStart;
  discoveryPointerStart = null;
  discoveryStage.classList.remove('is-dragging');
  if (discoveryViewport.hasPointerCapture(event.pointerId)) discoveryViewport.releasePointerCapture(event.pointerId);
  if (!pointer.dragging) return;
  suppressDiscoveryClickUntil = performance.now() + 400;
  const distance = Math.abs(pointer.offset);
  const speed = distance / Math.max(1, performance.now() - pointer.time);
  const threshold = Math.min(56, discoveryViewport.clientWidth * 0.18);
  if (!cancelled && (distance >= threshold || (distance >= 24 && speed > 0.5))) {
    advanceRecommendation(pointer.offset < 0 ? 1 : -1);
  } else {
    updateDiscoveryDrag(0);
  }
}

recommendations.forEach((recommendation, index) => fillRecommendation(discoveryCards[index], index));
updateDiscoveryDeck();

discoveryViewport.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || event.target.closest('.deck-nav')) return;
  suppressDiscoveryClickUntil = 0;
  discoveryPointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId, time: performance.now(), offset: 0, dragging: false };
});

discoveryViewport.addEventListener('pointermove', event => {
  if (!discoveryPointerStart || discoveryPointerStart.id !== event.pointerId) return;
  const pointer = discoveryPointerStart;
  const deltaX = event.clientX - pointer.x;
  const deltaY = event.clientY - pointer.y;
  if (!pointer.dragging) {
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 12) return;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      discoveryPointerStart = null;
      return;
    }
    if (Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    pointer.dragging = true;
    discoveryViewport.setPointerCapture(event.pointerId);
    discoveryStage.classList.add('is-dragging');
    dismissWelcomeForInteraction();
  }
  event.preventDefault();
  const limit = discoveryViewport.clientWidth * 0.9;
  pointer.offset = Math.max(-limit, Math.min(limit, deltaX));
  updateDiscoveryDrag(pointer.offset);
});

// Before horizontal intent is established there is no pointer capture, so a
// release just outside the viewport must still end the pending gesture.
window.addEventListener('pointerup', event => releaseDiscoveryPointer(event), { capture: true });
window.addEventListener('pointercancel', event => releaseDiscoveryPointer(event, true), { capture: true });
window.addEventListener('blur', cancelDiscoveryDrag);
window.addEventListener('resize', cancelDiscoveryDrag);
discoveryViewport.addEventListener('lostpointercapture', event => {
  if (event.target === discoveryViewport) releaseDiscoveryPointer(event, true);
});
discoveryViewport.addEventListener('dragstart', event => event.preventDefault());

discoveryStage.addEventListener('click', event => {
  if (discoveryViewport.contains(event.target) && event.detail > 0 && performance.now() < suppressDiscoveryClickUntil) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const nav = event.target.closest('.deck-nav');
  if (nav) {
    event.preventDefault();
    advanceRecommendation(nav.getAttribute('aria-label')?.includes('上一个') ? -1 : 1);
  }
}, { capture: true });

discoveryStage.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || discoveryPointerStart) return;
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    dismissWelcomeForInteraction();
    advanceRecommendation(1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    dismissWelcomeForInteraction();
    advanceRecommendation(-1);
  }
});
const backToTop = document.getElementById('backToTop');
function updateScroll() { backToTop.classList.toggle('is-visible', window.scrollY > 360); }
window.addEventListener('scroll', updateScroll, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: canAnimate() ? 'smooth' : 'instant' }));
document.getElementById('dismissWelcome').addEventListener('click', dismissWelcomeToast);
updateRuntime();
setInterval(updateRuntime, 60000);
updateScroll();
document.getElementById('projectCount').textContent = links.length;
restoreFiltersFromUrl();
setTimeout(showWelcomeToast, 500);

function updateSearchUrl() {
  if (location.protocol === 'file:') return;
  const url = new URL(location.href);
  if (searchInput.value.trim()) url.searchParams.set('q', searchInput.value.trim());
  else url.searchParams.delete('q');
  if (activeFilter !== 'all') url.searchParams.set('category', activeFilter);
  else url.searchParams.delete('category');
  if (url.href !== location.href) history.replaceState(history.state, '', url);
}

// One authored sequence: the title opens, search arrives, and the discovery deck deals itself.
function syncMotion() {
  const enabled = canAnimate();
  document.documentElement.classList.toggle('motion-active', enabled);
  if (!enabled) {
    cancelDiscoveryDrag();
    document.getAnimations().forEach(animation => animation.cancel());
    updateDiscoveryDeck();
  }
}
reducedMotion.addEventListener('change', syncMotion);
syncMotion();
function dealLaunchpad() {
  if (!canAnimate()) return;
  const timing = { duration: 720, easing: 'cubic-bezier(.16,1,.3,1)' };
  document.querySelectorAll('.hero-line').forEach((line, index) => line.animate([{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(20px)' }, { clipPath: 'inset(0 0 0% 0)', transform: 'translateY(0)' }], { ...timing, delay: index * 90 }));
  document.querySelector('.search-form').animate([{ opacity: .4, transform: 'translateY(15px)' }, { opacity: 1, transform: 'translateY(0)' }], { ...timing, duration: 600, delay: 140 });
  discoveryViewport.animate([{ opacity: .2, transform: 'translate3d(30px,18px,0)' }, { opacity: 1, transform: 'translate3d(0,0,0)' }], { ...timing, delay: 170 });
  document.querySelectorAll('.palette-composition i').forEach((tile, index) => tile.animate([{ transform: 'rotate(0)' }, { transform: `rotate(${[-28,-5,22][index]}deg)` }], { ...timing, delay: 240 }));
}
document.fonts.ready.then(dealLaunchpad);

const launchpad = document.querySelector('.launchpad');
let heroOnscreen = true;
function syncAmbientMotion() {
  launchpad.classList.toggle('is-onstage', heroOnscreen && !document.hidden);
  document.documentElement.classList.toggle('page-hidden', document.hidden);
}
new IntersectionObserver(entries => { heroOnscreen = entries[0].isIntersecting; syncAmbientMotion(); }, { threshold: 0 }).observe(launchpad);
document.addEventListener('visibilitychange', () => {
  syncAmbientMotion();
  if (document.hidden) {
    cancelDiscoveryDrag();
    pauseWelcomeTimer('hidden');
  } else unpauseWelcomeTimer('hidden');
});
// The pointer light stays inside the hovered tool; no global cursor replacement.
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  links.forEach(link => {
    let frame = 0;
    link.addEventListener('pointermove', event => {
      if (!canAnimate() || frame) return;
      const x = event.clientX, y = event.clientY;
      frame = requestAnimationFrame(() => {
        const box = link.getBoundingClientRect();
        link.style.setProperty('--pointer-x', `${x - box.left}px`);
        link.style.setProperty('--pointer-y', `${y - box.top}px`);
        frame = 0;
      });
    }, { passive: true });
  });
}

// Welcome yields immediately when someone starts using the directory, including
// before a slow location request resolves. The greeting never interrupts browsing.
function dismissWelcomeForInteraction() {
  visitorHasInteracted = true;
  if (welcomeVisible) dismissWelcomeToast(true);
}
const activeControls = '#searchForm, .collection-filter, [data-browse], .shortcut-chip, .resource-link, #previousTool, #shuffleTool, #discoveryLink';
document.addEventListener('click', event => {
  if (event.target instanceof Element && event.target.closest(activeControls)) dismissWelcomeForInteraction();
}, { capture: true });
searchInput.addEventListener('focus', dismissWelcomeForInteraction);
searchInput.addEventListener('input', dismissWelcomeForInteraction);
window.addEventListener('scroll', () => {
  if (window.scrollY > 24) dismissWelcomeForInteraction();
}, { passive: true });
