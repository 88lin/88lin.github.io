// Validate the authored catalog and run its actual filtering/URL handlers in Node.
// No network, browser profile, or third-party packages are used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'assets/home/home.js'), 'utf8');
const attrs = value => Object.fromEntries([...value.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const text = value => value.replace(/<[^>]*>/g, '').trim();
function classList() {
  const values = new Set();
  return {
    toggle(name, enabled) { enabled ? values.add(name) : values.delete(name); },
    contains(name) { return values.has(name); }
  };
}
const filters = [...html.matchAll(/<button\b([^>]*\bdata-filter="[^"]+"[^>]*)>([\s\S]*?)<\/button>/g)].map(m => ({
  dataset: { filter: attrs(m[1])['data-filter'] }, textContent: text(m[2])
}));
const labels = new Map(filters.map(button => [button.dataset.filter, button.textContent]));
assert.equal(labels.size, filters.length, 'Category keys must be unique');
assert(labels.has('all'));
assert(!labels.has('web'), 'The retired web-development category must not return');
assert.equal(labels.size - 1, 10);
assert.deepEqual(filters.slice(0, 2).map(button => button.dataset.filter), ['all', 'portfolio'], 'My sites must be the first category after All');
assert.equal(labels.get('portfolio'), '我的站点');
const cards = [...html.matchAll(/<a\b(?=[^>]*\btool-card\b)([^>]+)>([\s\S]*?)<\/a>/g)].map(m => {
  const a = attrs(m[1]);
  const card = {
    href: a.href,
    dataset: { group: a['data-group'], relatedGroups: a['data-related-groups'], keywords: a['data-keywords'] },
    textContent: text(m[2]), classList: classList()
  };
  assert(labels.has(card.dataset.group) && card.dataset.group !== 'all', `Unknown primary category: ${a.href}`);
  assert.equal(text(m[2].match(/<span class="tool-category">(.*?)<\/span>/)[1]), labels.get(card.dataset.group), `Wrong visible label: ${a.href}`);
  const related = (card.dataset.relatedGroups || '').split(/\s+/).filter(Boolean);
  assert.equal(new Set(related).size, related.length);
  for (const category of related) assert(labels.has(category) && category !== 'all' && category !== card.dataset.group, `Invalid related category: ${a.href}`);
  return card;
});
assert.equal(cards.length, Number(html.match(/id="projectCount">(\d+)/)[1]));
assert.equal(cards.length, Number(html.match(/id="resultCount">(\d+)/)[1]));
assert.equal(new Set(cards.map(card => card.href)).size, cards.length, 'Do not duplicate cards for cross-listing');
for (const key of labels.keys()) if (key !== 'all') assert(cards.some(card => card.dataset.group === key), `Empty primary category: ${key}`);
for (const m of html.matchAll(/data-(?:browse|shortcut-category)="([^"]+)"/g)) assert(labels.has(m[1]), `Unknown shortcut category: ${m[1]}`);

const shortcuts = [...html.matchAll(/<button\b([^>]*\bdata-shortcut="[^"]+"[^>]*)>/g)].map(m => {
  const a = attrs(m[1]);
  return {
    dataset: { shortcut: a['data-shortcut'], shortcutCategory: a['data-shortcut-category'] },
    addEventListener(event, handler) { assert.equal(event, 'click'); this.click = handler; }
  };
});
const context = vm.createContext({
  links: cards, collectionFilters: filters, activeFilter: 'all', firstFilter: true,
  searchInput: { value: '' }, clearSearch: { classList: classList() },
  emptyState: { classList: classList() }, searchStatus: { textContent: '' },
  canAnimate: () => false, syncFilters: () => {}, showResults: () => {},
  URL, URLSearchParams, location: { href: 'https://go.88lin.eu.org/', search: '', protocol: 'https:' },
  document: {
    querySelector(selector) { assert.equal(selector, '.search-key'); return { classList: classList() }; },
    querySelectorAll(selector) { assert.equal(selector, '.shortcut-chip'); return shortcuts; }
  },
  history: {
    state: null,
    replaceState(state, title, url) {
      context.location.href = String(url);
      context.location.search = new URL(url).search;
    }
  }
});
// These top-level functions end at an unindented closing brace in home.js.
for (const name of ['matchesCategory', 'filterLinks', 'resolveCategory', 'chooseCategory', 'restoreFiltersFromUrl', 'updateSearchUrl']) {
  const match = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n\\}`));
  assert(match, `Missing handler: ${name}`);
  vm.runInContext(match[0], context);
}
const start = source.indexOf("document.querySelectorAll('.shortcut-chip').forEach");
const end = source.indexOf("document.getElementById('resetFilters')", start);
assert(start >= 0 && end > start);
vm.runInContext(source.slice(start, end), context);
const visible = () => cards.filter(card => !card.classList.contains('is-hidden')).map(card => card.href);
function run(category, query = '') {
  context.activeFilter = category;
  context.searchInput.value = query;
  context.filterLinks();
  return visible();
}
assert.equal(run('all').length, 58);
assert.deepEqual(run('focus').sort(), ['https://focustide.app', 'https://timepulse.ravelloh.top', 'https://lofi.88lin.eu.org', '/notion/2/', '/notion/3/', '/notion/8/'].sort());
assert.deepEqual(run('fun').sort(), ['/stop/', 'https://site.nocode.host', 'https://sri.88lin.eu.org/', 'https://test.88lin.eu.org/'].sort());
assert.deepEqual(run('utility').sort(), ['/Bookmarks/', '/gushi/dist/', '/Mortgage-Calculator/', '/xy/', 'https://88lin.github.io/gift-ledger', 'https://xiaozeroai.github.io/FangHong_wx'].sort());
assert.equal(run('portfolio').length, 8);
assert(visible().includes('https://dev.88lin.eu.org/'));
assert.equal(cards.find(card => card.href === 'https://dev.88lin.eu.org/').dataset.group, 'portfolio', 'The portfolio and freelance site belongs primarily to My sites');
for (const href of ['https://sri.88lin.eu.org/', 'https://test.88lin.eu.org/']) {
  assert(!visible().includes(href), `Test sites must not appear in My sites: ${href}`);
  assert.equal(cards.find(card => card.href === href).dataset.group, 'fun');
}
assert.deepEqual(run('all', 'sri'), ['https://sri.88lin.eu.org/']);
assert.deepEqual(run('fun', 'SBTI'), ['https://test.88lin.eu.org/']);
const celebrations = run('festival');
assert.equal(celebrations.length, 14);
for (const href of ['/birthday/', '/love1/', '/love2/', '/love3/']) assert(celebrations.includes(href));
assert(!celebrations.includes('/fireworks/1'), 'Support-author link is not a fireworks tool');
assert.equal(run('focus', 'Notion').length, 3);
assert.deepEqual(run('all', '外放干扰器'), ['/stop/'], 'Old names must remain searchable');
assert.deepEqual(run('all', 'no-such-catalog-entry'), []);
assert(context.emptyState.classList.contains('is-hidden') === false);
assert.equal(run('all').length, 58);
assert(context.emptyState.classList.contains('is-hidden'));

context.searchInput.value = 'unrelated previous search';
shortcuts.find(button => button.dataset.shortcut === 'AI').click();
assert.equal(context.activeFilter, 'ai');
assert.equal(context.searchInput.value, '');
assert.deepEqual(visible().sort(), ['/ai-model-checker', '/jiangchong/', 'https://research.88lin.eu.org'].sort());
assert.equal(new URL(context.location.href).searchParams.get('category'), 'ai');
shortcuts.find(button => button.dataset.shortcut === '专注').click();
assert.equal(visible().length, 6);
assert.equal(context.activeFilter, 'focus');
shortcuts.find(button => button.dataset.shortcut === '海报').click();
assert.deepEqual(visible(), ['/academic-poster-generator/']);
assert.equal(new URL(context.location.href).searchParams.get('q'), '海报');
assert.equal(new URL(context.location.href).searchParams.has('category'), false);

for (const [query, expectedCategory, count] of [['?category=focus&q=Notion', 'focus', 3], ['?category=other', 'utility', 6], ['?category=web', 'all', 58], ['?category=unknown', 'all', 58]]) {
  context.location.search = query;
  context.restoreFiltersFromUrl();
  assert.equal(context.activeFilter, expectedCategory);
  assert.equal(visible().length, count);
}
console.log(`PASS: ${cards.length} unique cards, ${labels.size - 1} categories; labels, cross-listing, search, shortcuts, empty-state recovery and URL restoration.`);
