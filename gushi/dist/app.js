const defaultBook = 'shijing';
const defaultFamilyName = '李';
const nameAmount = 6;

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

const badChars = '胸鬼懒禽鸟鸡我邪罪凶丑仇鼠蟋蟀淫秽妹狐鸡鸭蝇悔鱼肉苦犬吠窥血丧饥女搔父母昏狗蟊疾病痛死潦哀痒害蛇牲妇狸鹅穴畜烂兽靡爪氓劫鬣螽毛婚姻匪婆羞辱'.split('');

let timer = null;
let currentResults = [];
let bookReady = false;
let lastLoadFailed = false;
let isComposingFamilyName = false;

const sel = (str) => document.querySelector(str);

function getSelectedBookValue() {
  const checked = document.querySelector("input[name='book']:checked");
  return checked ? checked.value : defaultBook;
}

function getSelectedBookMeta() {
  return BOOK_MAP[getSelectedBookValue()] || BOOK_MAP[defaultBook];
}

function normalizeFamilyName(value) {
  return String(value || '').replace(/\s+/g, '').slice(0, 4);
}

function getFamilyName() {
  const value = normalizeFamilyName(sel("input[name='family-name']").value);
  return value || defaultFamilyName;
}

function syncFamilyNameInput() {
  const input = sel("input[name='family-name']");
  const normalized = normalizeFamilyName(input.value);
  if (input.value !== normalized) {
    input.value = normalized;
  }
  return normalized;
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

class Namer {
  constructor() {
    this.book = null;
  }

  splitByDelimiters(content, delimiters) {
    let str = content;
    delimiters.forEach((delimiter) => {
      const reg = new RegExp(delimiter, 'g');
      str = str.replace(reg, (match) => `${match}|`);
    });
    str = str.replace(/\|+/g, '|').replace(/^\||\|$/g, '');
    return str.split('|').map(item => item.trim()).filter(Boolean);
  }

  formatStr(str) {
    return String(str || '')
      .replace(/(\s|　|”|“)+|<br>|<p>|<\/p>/g, '')
      .replace(/\(.+\)/g, '');
  }

  splitSentence(content) {
    const str = this.formatStr(content);
    const primary = this.splitByDelimiters(str, ['，', '。', '！', '？', '；', '：']);
    let arr = [];

    primary.forEach((item) => {
      if (item.length > 18 && item.indexOf('兮') > -1) {
        arr = arr.concat(this.splitByDelimiters(item, ['兮', '、']));
        return;
      }
      if (item.length > 22 && item.indexOf('、') > -1) {
        arr = arr.concat(this.splitByDelimiters(item, ['、']));
        return;
      }
      arr.push(item);
    });

    const normalized = arr
      .map(item => item.replace(/^[，。！？；：、]+|[，。！？；：、]+$/g, ''))
      .filter((item) => {
        const clean = this.cleanBadChar(this.cleanPunctuation(item));
        return clean.length >= 3 && clean.length <= 14;
      });

    if (normalized.length) {
      return normalized;
    }

    return primary.filter((item) => {
      const clean = this.cleanBadChar(this.cleanPunctuation(item));
      return clean.length >= 3 && clean.length <= 18;
    });
  }

  cleanPunctuation(str) {
    return str.replace(/[<>《》！*\(\^\)\$%~!@#…&%￥—\+=、。，？；‘’“”：·`]/g, '');
  }

  cleanBadChar(str) {
    return str.split('').filter(char => badChars.indexOf(char) === -1).join('');
  }

  getTwoChar(arr) {
    const len = arr.length;
    const first = Math.floor(Math.random() * len);
    let second = Math.floor(Math.random() * len);
    let guard = 0;

    while (second === first && guard < 100) {
      second = Math.floor(Math.random() * len);
      guard += 1;
    }

    return first <= second ? `${arr[first]}${arr[second]}` : `${arr[second]}${arr[first]}`;
  }

  genName() {
    if (!this.book || !this.book.length) {
      return null;
    }

    const passage = choose(this.book);
    if (!passage || !passage.content) {
      return null;
    }

    const sentenceArr = this.splitSentence(passage.content);
    if (!sentenceArr.length) {
      return null;
    }

    const sentence = choose(sentenceArr);
    const cleanSentence = this.cleanBadChar(this.cleanPunctuation(sentence));
    if (cleanSentence.length <= 2) {
      return null;
    }

    return {
      name: this.getTwoChar(cleanSentence.split('')),
      sentence,
      content: passage.content,
      title: passage.title,
      author: passage.author,
      book: passage.book,
      dynasty: passage.dynasty,
    };
  }

  async loadBook(book) {
    const response = await fetch(`./json/${book}.json`);
    if (!response.ok) {
      throw new Error(`load failed: ${book}`);
    }
    this.book = await response.json();
    return this.book;
  }
}

function getSequence(index) {
  return String(index + 1).padStart(2, '0');
}

function genRadio(books) {
  return books.map((book) => {
    const checked = book.value === defaultBook ? 'checked' : '';
    return `
      <div class="inputGroup">
        <input id="${book.value}" name="book" type="radio" value="${book.value}" ${checked}>
        <label for="${book.value}">
          <span class="option-name">${book.name}</span>
          <span class="option-desc">${book.description}</span>
        </label>
      </div>`;
  }).join('');
}

function genNameHtml(obj, index) {
  const fullName = `${getFamilyName()}${obj.name}`;
  const sentenceHtml = escapeHTML(obj.sentence).replace(
    new RegExp(`[${escapeRegExp(obj.name)}]`, 'g'),
    (char) => `<i>${char}</i>`,
  );

  return `
    <li class="name-box" style="--card-index:${index};">
      <div class="name-head">
        <div class="name-main">
          <p class="name-order">候选 ${getSequence(index)}</p>
          <h3 class="name-value">${escapeHTML(fullName)}</h3>
          <p class="name-source">${escapeHTML(`${obj.book} · ${obj.title}`)}</p>
        </div>
        <button class="copy-btn" type="button" data-copy="${escapeHTML(fullName)}">复制</button>
      </div>
      <p class="sentence">
        <span class="quote">「</span>
        ${sentenceHtml}
        <span class="quote">」</span>
      </p>
      <div class="source-row">
        <div class="book">出处：${escapeHTML(`${obj.book} · ${obj.title}`)}</div>
        <div class="author">作者：${escapeHTML(obj.author || '佚名')} · ${escapeHTML(obj.dynasty)}</div>
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
    sel('.result-container').innerHTML = '';
    setResultState(false);
    setResultSummary('这次没有找到合适的组合，换一部典籍或再试一次。');
    setEmptyState('暂时没有生成可用名字。', '可以再点击一次生成，或切换典籍寻找新的灵感。');
    return;
  }

  sel('.result-container').innerHTML = results.map((item, index) => genNameHtml(item, index)).join('');
  setResultState(true);
  setResultSummary(`已从《${getSelectedBookMeta().name}》中，为“${getFamilyName()}”生成 ${results.length} 个名字候选。`);
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

async function loadBook(namer) {
  const meta = getSelectedBookMeta();
  bookReady = false;
  lastLoadFailed = false;
  setLoading(true);
  setResultState(false);
  sel('.result-container').innerHTML = '';
  setResultSummary(`正在装载《${meta.name}》…`);
  setEmptyState(`已切换到《${meta.name}》。`, '点击下方按钮，即可从新的典籍中抽取名字灵感。');

  try {
    const data = await namer.loadBook(meta.value);
    bookReady = true;
    setCollectionNote(`当前典籍：${meta.name} · 已载入 ${data.length} 则诗文。`);
    setResultSummary(`《${meta.name}》已准备就绪，输入姓氏后即可生成名字。`);
    setEmptyState(`《${meta.name}》已准备好。`, `这一卷共收录 ${data.length} 则诗文，适合反复刷新寻找更顺眼的组合。`);
  } catch (error) {
    lastLoadFailed = true;
    setCollectionNote('典籍载入失败，请稍后重试。');
    setResultSummary('典籍暂时无法载入。');
    setEmptyState('暂时无法载入典籍。', '请检查当前页面路径是否正确，确认 json 数据文件可以被访问。');
    console.error(error);
  } finally {
    setLoading(false);
  }
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
  requestAnimationFrame(() => {
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

function init() {
  const namer = new Namer();
  sel('.book-selector').innerHTML = genRadio(BOOKS);
  sel("input[name='family-name']").value = defaultFamilyName;
  updateActionAvailability(false);

  sel('.book-selector').addEventListener('change', () => {
    currentResults = [];
    loadBook(namer);
  });

  sel("input[name='family-name']").addEventListener('compositionstart', () => {
    isComposingFamilyName = true;
  });

  sel("input[name='family-name']").addEventListener('compositionend', () => {
    isComposingFamilyName = false;
    handleFamilyNameChange();
  });

  sel("input[name='family-name']").addEventListener('input', () => {
    handleFamilyNameChange();
  });

  sel('.naming-form').addEventListener('submit', (event) => {
    event.preventDefault();
    handleGenerate(namer);
  });

  sel('.btn-refresh').addEventListener('click', () => {
    handleGenerate(namer);
  });

  sel('.btn-retry').addEventListener('click', () => {
    loadBook(namer);
  });

  sel('.result-container').addEventListener('click', (event) => {
    const copyButton = event.target.closest('.copy-btn');
    if (!copyButton) {
      return;
    }
    copyName(copyButton.getAttribute('data-copy'));
  });

  loadBook(namer);
}

document.addEventListener('DOMContentLoaded', init);
