import $ from 'jquery';
import '../styles/normalize.scss';
import '../styles/radio.scss';
import '../styles/style.scss';
import Namer from './namer';
import { log } from './debugTools';
import { debugMode, defaultBook, defaultFamilyName, nameAmount } from './config';

const sel = str => document.querySelector(str);

const BOOKS = [
  { value: 'shijing', name: '诗经', description: '先秦风雅，适合温润清朗的名字。' },
  { value: 'chuci', name: '楚辞', description: '瑰丽浪漫，适合大气华美的名字。' },
  { value: 'tangshi', name: '唐诗', description: '意象明朗，适合开阔俊逸的名字。' },
  { value: 'songci', name: '宋词', description: '婉约含蓄，适合柔和灵秀的名字。' },
  { value: 'yuefu', name: '乐府诗集', description: '语言生动，适合自然鲜活的名字。' },
  { value: 'gushi', name: '古诗三百首', description: '经典凝练，适合耐看沉静的名字。' },
  { value: 'cifu', name: '著名辞赋', description: '铺陈华采，适合丰沛典雅的名字。' },
];

const BOOK_MAP = BOOKS.reduce((acc, book) => {
  acc[book.value] = book;
  return acc;
}, {});

let timer = null;
let currentResults = [];
let bookReady = false;
let lastLoadFailed = false;
let isComposingFamilyName = false;

function getSelectedBookValue() {
  return $("input[name='book']:checked").val() || defaultBook;
}

function getSelectedBookMeta() {
  return BOOK_MAP[getSelectedBookValue()] || BOOK_MAP[defaultBook];
}

function normalizeFamilyName(value) {
  return String(value || '').replace(/\s+/g, '').slice(0, 4);
}

function getFamilyName() {
  const value = normalizeFamilyName($('input[name="family-name"]').val());
  return value || defaultFamilyName;
}

function syncFamilyNameInput() {
  const input = $('input[name="family-name"]');
  const normalized = normalizeFamilyName(input.val());
  if (input.val() !== normalized) {
    input.val(normalized);
  }
  return normalized;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function genRadio(books) {
  return books.map((book) => {
    const checked = book.value === defaultBook ? 'checked' : '';
    return `
      <div class="inputGroup">
        <input id="${book.value}" name="book" type="radio" value="${book.value}" ${checked} />
        <label for="${book.value}">
          <span class="option-name">${book.name}</span>
          <span class="option-desc">${book.description}</span>
        </label>
      </div>`;
  }).join('');
}

function getSequence(index) {
  return String(index + 1).padStart(2, '0');
}

function genNameHtml(obj, index) {
  if (!obj) {
    return '';
  }

  const fullName = `${getFamilyName()}${obj.name}`;
  const sentenceHtml = escapeHtml(obj.sentence).replace(
    new RegExp(`[${escapeRegExp(obj.name)}]`, 'g'),
    char => `<i>${char}</i>`,
  );

  return `
    <li class="name-box" style="--card-index:${index};">
      <div class="name-head">
        <div class="name-main">
          <p class="name-order">候选 ${getSequence(index)}</p>
          <h3 class="name-value">${escapeHtml(fullName)}</h3>
          <p class="name-source">${escapeHtml(`${obj.book} · ${obj.title}`)}</p>
        </div>
        <button class="copy-btn" type="button" data-copy="${escapeHtml(fullName)}">复制</button>
      </div>
      <p class="sentence">
        <span class="quote">「</span>
        ${sentenceHtml}
        <span class="quote">」</span>
      </p>
      <div class="source-row">
        <div class="book">出处：${escapeHtml(`${obj.book} · ${obj.title}`)}</div>
        <div class="author">作者：${escapeHtml(obj.author || '佚名')} · ${escapeHtml(obj.dynasty)}</div>
      </div>
    </li>`;
}

function setResultState(hasResults) {
  sel('.result').classList.toggle('has-results', hasResults);
}

function setResultSummary(text) {
  sel('.result-summary').textContent = text;
}

function setEmptyState(title, copy) {
  sel('.result-empty-title').textContent = title;
  sel('.result-empty-copy').textContent = copy;
}

function setCollectionNote(text) {
  sel('.collection-note').textContent = text;
}

function updateActionAvailability(loading) {
  const canGenerate = bookReady && !lastLoadFailed && !loading;
  sel('.btn-go').disabled = !canGenerate;
  sel('.btn-refresh').disabled = !canGenerate || !currentResults.length;
  sel('.btn-retry').hidden = !lastLoadFailed;
  sel('.btn-retry').disabled = loading;
}

function setButtonLoading(loading) {
  sel('.btn-go').textContent = loading ? '翻检诗卷中…' : `生成 ${nameAmount} 个名字`;
  updateActionAvailability(loading);
}

function setLoading(loading) {
  sel('.controls-panel').classList.toggle('is-loading', loading);
  if (loading) {
    setButtonLoading(true);
    return;
  }

  clearTimeout(timer);
  setButtonLoading(false);
}

function renderResults(results) {
  currentResults = results;
  updateActionAvailability(false);

  if (!results.length) {
    $('.result-container').html('');
    setResultState(false);
    setResultSummary('这次没有找到合适的组合，换一部典籍或再试一次。');
    setEmptyState('暂时没有生成可用名字。', '可以再点击一次生成，或切换典籍寻找新的灵感。');
    return;
  }

  $('.result-container').html(results.map((item, index) => genNameHtml(item, index)).join(''));
  setResultState(true);
  setResultSummary(`已从《${getSelectedBookMeta().name}》中，为“${getFamilyName()}”生成 ${results.length} 个名字候选。`);
}

function createRadioGroup() {
  const books = debugMode
    ? BOOKS.concat([{ value: 'test', name: '测试', description: '开发调试数据。' }])
    : BOOKS;
  sel('.book-selector').innerHTML = genRadio(books);
}

function collectNames(namer) {
  const results = [];
  const used = {};
  const maxAttempts = nameAmount * 30;
  let attempts = 0;

  while (results.length < nameAmount && attempts < maxAttempts) {
    const candidate = namer.genName();
    attempts += 1;

    if (!candidate) {
      continue;
    }

    const fullName = `${getFamilyName()}${candidate.name}`;
    if (used[fullName]) {
      continue;
    }

    used[fullName] = true;
    results.push(candidate);
  }

  return results;
}

function loadBook(namer) {
  const meta = getSelectedBookMeta();
  bookReady = false;
  lastLoadFailed = false;
  setLoading(true);
  setResultState(false);
  $('.result-container').html('');
  setResultSummary(`正在装载《${meta.name}》…`);
  setEmptyState(`已切换到《${meta.name}》。`, '点击下方按钮，即可从新的典籍中抽取名字灵感。');

  namer.loadBook(
    meta.value,
    (data) => {
      bookReady = true;
      setLoading(false);
      setCollectionNote(`当前典籍：${meta.name} · 已载入 ${data.length} 则诗文。`);
      setResultSummary(`《${meta.name}》已准备就绪，输入姓氏后即可生成名字。`);
      setEmptyState(`《${meta.name}》已准备好。`, `这一卷共收录 ${data.length} 则诗文，适合反复刷新寻找更顺眼的组合。`);
    },
    () => {
      lastLoadFailed = true;
      setLoading(false);
      setCollectionNote('典籍载入失败，请稍后重试。');
      setResultSummary('典籍暂时无法载入。');
      setEmptyState('暂时无法载入典籍。', '请检查当前页面路径是否正确，确认 json 数据文件可以被访问。');
    },
  );
}

function copyName(name) {
  const text = String(name || '').trim();
  if (!text) {
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      setCollectionNote(`已复制名字：${text}`);
    }).catch(() => {
      setCollectionNote(`复制失败，请手动复制：${text}`);
    });
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'readonly');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  setCollectionNote(copied ? `已复制名字：${text}` : `复制失败，请手动复制：${text}`);
}

function handleGenerate(namer) {
  const normalized = syncFamilyNameInput();

  if (!normalized) {
    setCollectionNote(`未填写姓氏，已默认使用“${defaultFamilyName}”。`);
  }

  if (!bookReady || lastLoadFailed) {
    loadBook(namer);
    return;
  }

  setLoading(true);
  window.requestAnimationFrame(() => {
    renderResults(collectNames(namer));
    setLoading(false);
  });
}

function handleFamilyNameChange() {
  if (isComposingFamilyName) {
    return;
  }

  syncFamilyNameInput();
  if (currentResults.length) {
    renderResults(currentResults);
  }
}

function initEvents(namer) {
  $('input[name="book"]').change(() => {
    currentResults = [];
    loadBook(namer);
  });

  $('input[name="family-name"]').on('compositionstart', () => {
    isComposingFamilyName = true;
  });

  $('input[name="family-name"]').on('compositionend', () => {
    isComposingFamilyName = false;
    handleFamilyNameChange();
  });

  $('input[name="family-name"]').on('input', () => {
    handleFamilyNameChange();
  });

  sel('.naming-form').addEventListener('submit', (event) => {
    event.preventDefault();
    handleGenerate(namer);
  }, false);

  sel('.btn-refresh').addEventListener('click', () => {
    handleGenerate(namer);
  }, false);

  sel('.btn-retry').addEventListener('click', () => {
    loadBook(namer);
  }, false);

  sel('.result-container').addEventListener('click', (event) => {
    const copyButton = event.target.closest('.copy-btn');
    if (!copyButton) {
      return;
    }
    copyName(copyButton.getAttribute('data-copy'));
  }, false);
}

function main() {
  const namer = new Namer();
  $('input[name="family-name"]').val(defaultFamilyName);
  createRadioGroup();
  updateActionAvailability(false);
  loadBook(namer);
  initEvents(namer);
}

function test() {
  const logStr = (str) => {
    log(`'${str}'`);
  };
  const n = new Namer();
  const inputs = [
    '<p>习习谷风，以阴以雨。黾勉同心，不宜有怒。采葑采菲，无以下体？德音莫违，及尔同死。</p>',
    ' 记得年时临上马看人眼泪汪汪',
    '惜诵。惜诵以致愍兮，发愤以抒情。所作忠而言之兮，指苍天以为正。',
  ];
  log(n.splitSentence(inputs[0]));
  logStr(n.formatStr(inputs[0]));
  logStr(n.formatStr(inputs[1]));
}

$(document).ready(main);

if (debugMode) {
  test();
}
