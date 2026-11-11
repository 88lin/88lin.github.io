(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const pad = (n) => String(n).padStart(2, '0');
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const STORE_SHORTLIST = 'attention-tax-shortlist';
  const STORE_AUTO = 'attention-tax-auto-next';
  const STORE_INTRO = 'sonic-intro-seen';

  const CATEGORIES = {
    mandarin: { label: '普通话', en: 'STANDARD MANDARIN', strong: '#f4512f', soft: '#ffe3d8' },
    taiwan: { label: '台湾', en: 'TAIWAN MANDARIN', strong: '#b47a00', soft: '#fff0c7' },
    dialect: { label: '方言', en: 'DIALECT', strong: '#0b8f67', soft: '#ddf3e8' },
    cantonese: { label: '粤语', en: 'CANTONESE', strong: '#3448ff', soft: '#e5e8ff' }
  };

  const MONOLOGUES = {
  "yunxi": {
    "title": "免费的东西，最贵。",
    "lang": "普通话",
    "pull": "注意力不会突然清零，它只是一笔一笔，被安静地花掉。",
    "script": "我们总以为，注意力是免费的。\n\n打开一个应用，滑过几条视频，一个下午就过去了。没有人收费，也没有人提醒。可到了夜里，你合上手机，会觉得脑子里好像被谁悄悄拿走了一块。\n\n真正昂贵的，从来不是那些内容，而是你愿意停下来的每一秒。它们被记在一张看不见的账单上，换成别人的流量、别人的报表，也换成你再也想不起来的一天。\n\n注意力不会突然清零，它只是一笔一笔，被安静地花掉。\n\n所以，下一次点亮屏幕之前，先问自己一句：这一分钟，我打算把它花在哪里？"
  },
  "xiaoxiao": {
    "title": "把光留一点给自己。",
    "lang": "普通话",
    "pull": "注意力不是一张需要填满的表格，它更像一束光。照在哪里，哪里就有了温度。",
    "script": "今天早上，你有没有听见水烧开的声音？\n\n水壶先是安静的，然后一点点响起来，像有人在小声提醒你：新的一天开始了。\n\n我们太习惯把注意力交给屏幕，却忘了它也可以留给一杯水、一阵风、一顿慢慢吃完的饭。试着把手机翻过去，五分钟就好。你会发现，世界没有停下来等你，但它也没有催你。\n\n注意力不是一张需要填满的表格，它更像一束光。照在哪里，哪里就有了温度。那些被你认真看见的小事，会在一天结束的时候，轻轻还给你。\n\n今天，愿你把光留一点给自己。"
  },
  "yunjian": {
    "title": "把选择权，拿回来。",
    "lang": "普通话",
    "pull": "注意力不是无限的资源，它是你生命里最昂贵的一小块时间。",
    "script": "先别划走。我想请你回答一个问题：过去一个小时，你主动选择的注意力，有多少？被动刷走的，又有多少？\n\n我们每天都在签一份看不见的合同。用几分钟的停留，换一个红包；用一次好奇，换一次更精准的推送。没有人逼你，但结果早就被设计好了。\n\n注意力不是无限的资源，它是你生命里最昂贵的一小块时间。你把它交给谁，谁就拥有了你的一小部分。\n\n这不是一场道德审判，而是一笔需要被看清的账。\n\n现在，关掉一个不需要的通知。把选择权，拿回来。"
  },
  "yunxia": {
    "title": "在通知声里长大。",
    "lang": "普通话",
    "pull": "也许注意力不是丢了，它只是被太多的声音拉住了。",
    "script": "我是在通知声里长大的。\n\n作业写到一半，群消息响了；饭刚端上来，短视频开始自动播放。我们这一代人，好像很难完整地做完一件事，也很难安安静静地吃完一顿饭。\n\n大人总说我们不够专注，可他们忘了，我们面对的世界，比他们小时候吵得多。\n\n我想试试看，把手机放到另一个房间，读完一本书，或者只是发一会儿呆。也许注意力不是丢了，它只是被太多的声音拉住了。松开手，它还会回来。\n\n如果你也试过，告诉我，你最想找回的是哪一段时间。"
  },
  "yunyang": {
    "title": "注意力余额，每天都在清零。",
    "lang": "普通话",
    "pull": "我们习惯查看银行卡余额，却很少查看注意力余额。",
    "script": "如果注意力有一张账单，它会怎么写？\n\n今天的支出：一次没有目的地的解锁，一次没有尽头的滑动，一段看完却想不起内容的视频。\n\n今天的收入：一封认真回复的邮件，一次完整的对话，一段真正属于自己的安静。\n\n我们习惯查看银行卡余额，却很少查看注意力余额。它每天自动到账，也每天悄悄清零，而且没有短信提醒。\n\n从明天开始，给自己记一笔注意力账。不是为了节省，而是为了知道，你把时间花在了哪里。\n\n今晚睡前，看一眼你的注意力余额。\n\n账单不会说谎，它只会安静地记录你的选择。"
  },
  "xiaoyi": {
    "title": "被理解，还是被预测？",
    "lang": "普通话",
    "pull": "当算法比你自己更清楚你的下一步，选择就变得像一个温柔的陷阱。",
    "script": "你有没有发现，广告越来越懂你了？\n\n你刚想买一双鞋，下一秒就刷到同款；你随口说了一句想去海边，首页就铺满了旅行攻略。它好像比你更早知道，你想要什么。\n\n这不是魔法，而是你每一次停留、每一次犹豫，被悄悄记住的结果。\n\n被理解当然很舒服，但被预测，不一定。因为当算法比你自己更清楚你的下一步，选择就变得像一个温柔的陷阱。\n\n偶尔，去做一件没有任何数据支撑的事吧。去一条没搜过的小路，听一首不在推荐里的歌。把一点不可预测，留给自己。"
  },
  "hsiaochen": {
    "title": "在台北的夜里，把手机放下。",
    "lang": "台湾普通话",
    "pull": "注意力回来的时候，世界其实没有变，只是我终于在场了。",
    "script": "台北的晚上，很容易就滑过去了。\n\n捷运上、床上、等一顿宵夜的时间里，我们低着头，把别人的生活一段一段看过去。其实也没有特别想看什么，只是不想让手停下来。\n\n有一天，我试着把手机放到床头的另一边，结果那个晚上变得很长。长到我听见空调的声音，听见楼下有人牵车，听见自己的呼吸。\n\n注意力回来的时候，世界其实没有变，只是我终于在场了。\n\n今晚，你要不要也试试看？不用很久，十分钟就好。把一点安静，还给自己。"
  },
  "hsiaoyu": {
    "title": "手机静音的第一天。",
    "lang": "台湾普通话",
    "pull": "静音不是消失，是把选择权拿回来。",
    "script": "把手机调成静音的第一天，我有点不习惯。\n\n总觉得错过了什么，每隔几分钟就要拿起来看一眼。后来发现，真正重要的事情，其实都会再找我一次；而那些没有找回来的，也没有那么重要。\n\n静音不是消失，是把选择权拿回来。我可以回消息，但不是在它响的那一刻；我可以看视频，但不是在我最累的时候。\n\n这一天结束，我完成了一件拖了很久的事，还认真地吃了一顿饭。\n\n原来专注不是一种天赋，它只是把门关小一点，让重要的东西进来。"
  },
  "xiaobei": {
    "title": "咱唠点实在的。",
    "lang": "辽宁方言",
    "pull": "注意力这玩意儿吧，就跟兜里的零钱似的，一块两块往外掏，不心疼。",
    "script": "哎呀妈呀，咱唠点实在的。\n\n你说现在这人，手机一响，立马就得瞅一眼，跟谁喊你似的。饭桌上、被窝里、上个厕所都得带着，生怕错过啥大新闻。结果一天下来，新闻没记住，腰倒先酸了。\n\n注意力这玩意儿吧，就跟兜里的零钱似的，一块两块往外掏，不心疼；到月底一摸，哎呀，空了。\n\n咱也不是说手机不能用，正事儿还得办。可你得给自己留点空儿，喝口茶，跟家里人唠两句，哪怕发会儿呆呢。\n\n把眼睛从屏幕上挪开，天没塌，日子照样过。你说，是不是这个理儿？"
  },
  "xiaoni": {
    "title": "日子是过出来的。",
    "lang": "陕西方言",
    "pull": "日子是过出来的，不是刷出来的。",
    "script": "咱陕西人说话直，今儿就直说。\n\n你一天到晚抱着手机，刷得昏天黑地，眼睛都花了，图个啥？人家让你看啥你就看啥，人家让你停哪儿你就停哪儿，咱自己的主意呢？\n\n注意力这东西，金贵得很。你把它给谁，就是给谁面子。给工作，给家里人，给一碗油泼面，都值；给那些划不完的短视频，划到半夜，啥也没落下，不值。\n\n咱也不是让你把手机扔了。该用就用，用完就放下。\n\n出去转转，看看天，吃碗面，跟人好好说句话。日子是过出来的，不是刷出来的。"
  },
  "hiugaai": {
    "title": "一餐飯嘅安靜。",
    "lang": "粤语",
    "pull": "最貴嘅從來唔係啲內容，而係你願意停低嘅每一秒。",
    "script": "你記唔記得，上一次真正專心食一餐飯，係幾時？\n\n唔係一邊食一邊睇電話，唔係一邊食一邊回訊息，而係坐低，望住眼前嗰碗飯，慢慢食。\n\n我哋每日都喺度交一種睇唔見嘅稅。用一次解鎖、一次滑動、一次「睇多一條先」，換走咗本來屬於自己嘅時間。\n\n最貴嘅從來唔係啲內容，而係你願意停低嘅每一秒。\n\n今晚試下，將電話放遠少少。食飯嘅時候就食飯，行路嘅時候就行路。唔使好耐，一餐飯嘅時間就夠。將注意力，還返俾自己。"
  },
  "hiumaan": {
    "title": "免費嘅嘢，最貴。",
    "lang": "粤语",
    "pull": "真正昂貴嘅，唔係嗰啲內容，而係你願意停低嘅每一秒。",
    "script": "我哋成日以為，注意力係免費嘅。\n\n打開一個 App，睇幾條片，時間就過咗。冇人收費，亦都冇人提醒。但係到咗夜晚，你合上電話，會覺得腦入面好似被人拎走咗一啲嘢。\n\n其實，真正昂貴嘅，唔係嗰啲內容，而係你願意停低嘅每一秒。佢哋被悄悄記落嚟，變成別人嘅流量、別人嘅報表，變成你再也想唔起嘅一日。\n\n所以，下一次著螢幕之前，問下自己：呢一分鐘，我打算將佢放喺邊度？\n\n注意力唔會突然清零，佢只會一筆一筆，安靜地花掉。"
  },
  "wanlung": {
    "title": "十分鐘，係你自己嘅。",
    "lang": "粤语",
    "pull": "注意力唔係用嚟填滿嘅，佢係用嚟選擇嘅。",
    "script": "今晚，試下將手機放低。\n\n唔使好耐，十分鐘就夠。你會發現，房間其實好靜，窗外面有車聲，雪櫃有壓縮機聲，你自己有呼吸聲。\n\n我哋成日話冇時間，但係啲時間，好多時就係喺一次一次解鎖之間漏走咗。\n\n注意力唔係用嚟填滿嘅，佢係用嚟選擇嘅。你揀咗睇乜嘢，就等於揀咗呢一刻點過。\n\n十分鐘之後，你鍾意再拿起電話都得。但係起碼嗰十分鐘，係你自己嘅。世界唔會因為你停低十分鐘而停頓，但你會記得，自己曾經喺度。"
  }
};

  const VOICES = [
    { slug: 'yunxi', name: 'Yunxi', zh: '云希', role: '冷静男声', category: 'mandarin', voiceId: 'zh-CN-YunxiNeural', file: 'audio/yunxi.mp3', recommended: true },
    { slug: 'xiaoxiao', name: 'Xiaoxiao', zh: '晓晓', role: '温暖女声', category: 'mandarin', voiceId: 'zh-CN-XiaoxiaoNeural', file: 'audio/xiaoxiao.mp3' },
    { slug: 'yunjian', name: 'Yunjian', zh: '云健', role: '宣讲男声', category: 'mandarin', voiceId: 'zh-CN-YunjianNeural', file: 'audio/yunjian.mp3' },
    { slug: 'yunxia', name: 'Yunxia', zh: '云夏', role: '少年男声', category: 'mandarin', voiceId: 'zh-CN-YunxiaNeural', file: 'audio/yunxia.mp3' },
    { slug: 'yunyang', name: 'Yunyang', zh: '云扬', role: '新闻男声', category: 'mandarin', voiceId: 'zh-CN-YunyangNeural', file: 'audio/yunyang.mp3' },
    { slug: 'xiaoyi', name: 'Xiaoyi', zh: '晓伊', role: '轻快女声', category: 'mandarin', voiceId: 'zh-CN-XiaoyiNeural', file: 'audio/xiaoyi.mp3' },
    { slug: 'hsiaochen', name: 'HsiaoChen', zh: '晓臻', role: '台湾女声', category: 'taiwan', voiceId: 'zh-TW-HsiaoChenNeural', file: 'audio/hsiaochen.mp3' },
    { slug: 'hsiaoyu', name: 'HsiaoYu', zh: '晓雨', role: '台湾女声', category: 'taiwan', voiceId: 'zh-TW-HsiaoYuNeural', file: 'audio/hsiaoyu.mp3' },
    { slug: 'xiaobei', name: 'Xiaobei', zh: '小北', role: '辽宁方言', category: 'dialect', voiceId: 'zh-CN-liaoning-XiaobeiNeural', file: 'audio/xiaobei.mp3' },
    { slug: 'xiaoni', name: 'Xiaoni', zh: '小妮', role: '陕西方言', category: 'dialect', voiceId: 'zh-CN-shaanxi-XiaoniNeural', file: 'audio/xiaoni.mp3' },
    { slug: 'hiugaai', name: 'HiuGaai', zh: '晓佳', role: '粤语女声', category: 'cantonese', voiceId: 'zh-HK-HiuGaaiNeural', file: 'audio/hiugaai.mp3' },
    { slug: 'hiumaan', name: 'HiuMaan', zh: '晓曼', role: '粤语女声', category: 'cantonese', voiceId: 'zh-HK-HiuMaanNeural', file: 'audio/hiumaan.mp3' },
    { slug: 'wanlung', name: 'WanLung', zh: '云龙', role: '粤语男声', category: 'cantonese', voiceId: 'zh-HK-WanLungNeural', file: 'audio/wanlung.mp3' }
  ];

  VOICES.forEach((voice) => { Object.assign(voice, MONOLOGUES[voice.slug] || {}); });


  const WAVE = window.WAVEFORMS || {};
  const peaksFor = (slug) => (WAVE[slug] && Array.isArray(WAVE[slug].peaks) ? WAVE[slug].peaks : []);
  const durationFor = (slug) => (WAVE[slug] && Number.isFinite(WAVE[slug].duration) ? WAVE[slug].duration : 0);

  const els = {
    intro: $('intro'),
    nav: document.querySelector('.nav'),
    navPages: $('navPages'),
    navPlay: $('navPlay'),
    navPlayLabel: $('navPlayLabel'),
    heroPlay: $('heroPlay'),
    heroVisual: $('heroVisual'),
    discScene: $('discScene'),
    disc: $('disc'),
    discCanvas: $('discCanvas'),
    discName: $('discName'),
    discZh: $('discZh'),
    discKicker: $('discKicker'),
    discTake: $('discTake'),
    discCategory: $('discCategory'),
    discCategoryDot: $('discCategoryDot'),
    discDuration: $('discDuration'),
    discStatus: $('discStatus'),
    discStatusDot: $('discStatusDot'),
    discRec: $('discRec'),
    discPlay: $('discPlay'),
    grid: $('voiceGrid'),
    filters: [...document.querySelectorAll('.filter-pill, .filter')],
    filterShortlist: document.querySelector('.filter-shortlist'),
    autoNext: $('autoNext'),
    shortlistStatus: $('shortlistStatus'),
    shortlistCount: $('shortlistCount'),
    shortlistFilterCount: $('shortlistFilterCount'),
    dock: $('dock'),
    dockTake: $('dockTake'),
    dockName: $('dockName'),
    dockCat: $('dockCat'),
    prev: $('prev'),
    play: $('play'),
    next: $('next'),
    mute: $('mute'),
    star: $('star'),
    copy: $('copy'),
    dockWave: $('dockWave'),
    cur: $('cur'),
    dur: $('dur'),
    dockProgress: $('dockProgress'),
    toast: $('toast'),
    copyScript: $('copyScript'),
    scriptMeta: $('scriptMeta'),
    scriptPull: $('scriptPull'),
    scriptVoiceTag: $('scriptVoiceTag'),
    scriptByline: $('scriptByline'),
    scriptLines: $('scriptLines'),
    finalePlay: $('finalePlay'),
    finaleCopy: $('finaleCopy'),
    finaleName: $('finaleName'),
    finaleCat: $('finaleCat'),
    finaleId: $('finaleId'),
    finaleDot: $('finaleDot'),
    listenCursor: $('listenCursor'),
    cursorGlow: $('cursorGlow'),
    miniEq: document.querySelector('.mini-eq'),
    siteHead: $('siteHead'),
    audio: $('audio')
  };

  const state = {
    current: -1,
    filter: 'all',
    shortlist: new Set(),
    autoNext: false,
    playing: false,
    ended: false,
    hasPlayed: false,
    muted: false,
    wantPlay: false,
    selecting: false,
    seeking: false,
    progress: 0,
    hoverRatio: null,
    rotation: 0,
    level: 0,
    accent: '#f4512f',
    nextTimer: 0,
    toastTimer: 0,
    swapTimer: 0
  };

  let dockCtx = null;
  let discCtx = null;
  let raf = 0;
  let lastTextAt = 0;
  let lastLevelAt = 0;
  let pointerRaf = 0;

  const voiceIndex = (voice) => VOICES.findIndex((v) => v.slug === voice.slug);
  const currentVoice = () => VOICES[state.current];
  const catFor = (voice) => CATEGORIES[voice.category];

  const fmtTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };

  const hexToRgb = (hex) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };

  const rgba = (hex, a) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const getDuration = () => {
    const d = els.audio.duration;
    if (Number.isFinite(d) && d > 0) return d;
    return durationFor(currentVoice()?.slug);
  };

  const loadShortlist = () => {
    try {
      const raw = localStorage.getItem(STORE_SHORTLIST);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) arr.forEach((slug) => {
        if (VOICES.some((v) => v.slug === slug)) state.shortlist.add(slug);
      });
    } catch {}
  };

  const saveShortlist = () => {
    try { localStorage.setItem(STORE_SHORTLIST, JSON.stringify([...state.shortlist])); } catch {}
  };

  const loadAutoNext = () => {
    try { state.autoNext = localStorage.getItem(STORE_AUTO) === '1'; } catch {}
  };

  const saveAutoNext = () => {
    try { localStorage.setItem(STORE_AUTO, state.autoNext ? '1' : '0'); } catch {}
  };

  const setStarIcon = (button, on) => {
    if (!button) return;
    const use = button.querySelector('use');
    if (use) use.setAttribute('href', on ? '#i-star-fill' : '#i-star');
    button.classList.toggle('is-on', on);
  };

  const waveSVG = (peaks, bars = 48, height = 44) => {
    const w = 400;
    const step = w / bars;
    let out = '';
    for (let i = 0; i < bars; i += 1) {
      const p = peaks.length ? peaks[Math.min(peaks.length - 1, Math.floor((i / bars) * peaks.length))] : 0.1;
      const bh = Math.max(1.6, p * (height - 4));
      out += `<rect x="${(i * step + step * 0.19).toFixed(2)}" y="${((height - bh) / 2).toFixed(2)}" width="${(step * 0.55).toFixed(2)}" height="${bh.toFixed(2)}" rx="${(step * 0.275).toFixed(2)}"/>`;
    }
    return `<svg viewBox="0 0 ${w} ${height}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${out}</svg>`;
  };

  const signatureSVG = (peaks, bars = 48) => {
    const inner = 22;
    let out = `<circle cx="0" cy="0" r="${inner - 4}" stroke="currentColor" stroke-opacity=".2" stroke-width="1"/>`;
    for (let i = 0; i < bars; i += 1) {
      const p = peaks.length ? peaks[Math.min(peaks.length - 1, Math.floor((i / bars) * peaks.length))] : 0.1;
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
      const len = 5 + p * 36;
      const x1 = Math.cos(angle) * inner;
      const y1 = Math.sin(angle) * inner;
      const x2 = Math.cos(angle) * (inner + len);
      const y2 = Math.sin(angle) * (inner + len);
      const opacity = 0.24 + p * 0.56;
      out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="currentColor" stroke-opacity="${opacity.toFixed(2)}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    out += '<circle cx="0" cy="0" r="3.4" fill="currentColor"/>';
    return `<svg viewBox="-68 -68 136 136" aria-hidden="true" focusable="false">${out}</svg>`;
  };

  const starButton = (voice, extra = '') => {
    const on = state.shortlist.has(voice.slug);
    return `<button class="card-star${on ? ' is-on' : ''}${extra ? ' ' + extra : ''}" type="button" data-star="${voice.slug}" aria-label="${on ? '移出备选' : '加入备选'}：${voice.name}" aria-pressed="${on}"><svg><use href="${on ? '#i-star-fill' : '#i-star'}"/></svg></button>`;
  };

  const normalCardHTML = (voice, order) => {
    const cat = catFor(voice);
    const duration = fmtTime(durationFor(voice.slug));
    return `<article class="voice-card" data-slug="${voice.slug}" data-category="${voice.category}" style="--cat-soft:${cat.soft};--cat-strong:${cat.strong};--i:${order}">
      <button class="card-hit" type="button" aria-label="试听 ${voice.name}，${voice.zh}，${voice.role}，${duration}"></button>
      <div class="card-main-content">
        <div class="card-top">
          <span class="card-take"><em>TAKE</em>${pad(voiceIndex(voice) + 1)}</span>
          <span class="cat-pill"><i></i>${cat.label}</span>
          ${starButton(voice)}
        </div>
        <div class="card-signature" aria-hidden="true">${signatureSVG(peaksFor(voice.slug))}</div>
        <div class="card-identity">
          <h3 class="card-name">${voice.name}</h3>
          <p class="card-sub">${voice.zh} · ${voice.role}</p>
        </div>
        <div class="card-bottom">
          <div class="card-wave">${waveSVG(peaksFor(voice.slug), 48)}</div>
          <span class="card-duration">${duration}</span>
          <button class="card-play" type="button" data-play="${voice.slug}" aria-label="播放 ${voice.name}">
            <span class="icon-play"><svg><use href="#i-play"/></svg></span>
            <span class="icon-pause"><svg><use href="#i-pause"/></svg></span>
          </button>
        </div>
      </div>
    </article>`;
  };

  const featureCardHTML = (voice, order) => {
    const cat = catFor(voice);
    const duration = fmtTime(durationFor(voice.slug));
    return `<article class="voice-card is-featured" data-slug="${voice.slug}" data-category="${voice.category}" style="--i:${order}">
      <button class="card-hit" type="button" aria-label="试听推荐音色 ${voice.name}，${voice.zh}，${voice.role}，${duration}"></button>
      <div class="card-main-content">
        <div class="feature-top">
          <span class="feature-tag"><svg><use href="#i-spark"/></svg>主推声线</span>
          <span class="feature-index">${pad(voiceIndex(voice) + 1)} <i>/ 13</i></span>
          ${starButton(voice)}
        </div>
        <div class="feature-disc" aria-hidden="true">
          <span class="feature-disc-label"><b>${pad(voiceIndex(voice) + 1)}</b><em>${voice.name.toUpperCase()}</em></span>
        </div>
        <div class="feature-main">
          <span class="feature-kicker">${cat.en} · ${cat.label}</span>
          <h3 class="feature-name">
            <span class="feature-zh">${voice.zh}</span>
            <em class="feature-en">${voice.name}</em>
          </h3>
          <p class="feature-copy">冷静、克制，句尾有分量。适合把一段关于注意力的独白，稳稳说到心里。</p>
        </div>
        <div class="feature-bottom">
          <div class="feature-wave">${waveSVG(peaksFor(voice.slug), 72, 46)}</div>
          <div class="feature-meta"><span>${duration}</span><span>${voice.role}</span></div>
          <button class="feature-play" type="button" data-play="${voice.slug}" aria-label="播放 ${voice.name}">
            <span class="feature-play-icon">
              <span class="icon-play"><svg><use href="#i-play"/></svg></span>
              <span class="icon-pause"><svg><use href="#i-pause"/></svg></span>
            </span>
            <span class="feature-play-label">试听云希</span>
          </button>
        </div>
      </div>
    </article>`;
  };

  const ctaHTML = (order) => {
    const voice = currentVoice() || VOICES[0];
    const cat = catFor(voice);
    return `<article class="cta-card" style="--i:${order}">
      <div class="cta-copy-block">
        <span class="cta-label">FINAL CALL · 你的选择</span>
        <h3 class="cta-title">选定后，<br>把 Voice ID 发给我。</h3>
        <p class="cta-sub">当前选择：<strong id="ctaName">${voice.name}</strong> · <span id="ctaCat">${voice.zh} / ${cat.label}</span></p>
      </div>
      <div class="cta-signature" style="--sig:${cat.strong}">
        <span class="cta-signature-label" id="ctaSignatureLabel">${voice.name} · VOICE SIGNATURE</span>
        <div class="cta-wave" id="ctaWave">${waveSVG(peaksFor(voice.slug), 86, 42)}</div>
      </div>
      <div class="cta-copy-actions">
        <code class="cta-id" id="ctaId">${voice.voiceId}</code>
        <button class="cta-copy" id="ctaCopy" type="button"><svg><use href="#i-copy"/></svg>复制 Voice ID</button>
      </div>
    </article>`;
  };

  const visibleVoices = () => {
    if (state.filter === 'all') return VOICES;
    if (state.filter === 'shortlist') return VOICES.filter((v) => state.shortlist.has(v.slug));
    return VOICES.filter((v) => v.category === state.filter);
  };

  const animateCards = (oldRects) => {
    if (!motionOK) return;
    const items = [...els.grid.children];
    items.forEach((el, index) => {
      if (typeof el.animate !== 'function') return;
      const key = el.dataset.slug || 'cta';
      const old = oldRects.get(key);
      if (old) {
        const rect = el.getBoundingClientRect();
        const dx = old.left - rect.left;
        const dy = old.top - rect.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          const anim = el.animate(
            [{ transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` }, { transform: 'translate(0, 0)' }],
            { duration: 620, easing: 'cubic-bezier(.19,1,.22,1)' }
          );
          anim.onfinish = () => anim.cancel();
        }
      } else {
        const anim = el.animate(
          [{ opacity: 0, translate: '0 26px' }, { opacity: 1, translate: '0 0' }],
          { duration: 760, delay: Math.min(index * 45, 260), easing: 'cubic-bezier(.19,1,.22,1)', fill: 'both' }
        );
        anim.onfinish = () => anim.cancel();
      }
    });
  };

  const capturePositions = () => {
    const map = new Map();
    [...els.grid.children].forEach((el) => {
      map.set(el.dataset.slug || 'cta', el.getBoundingClientRect());
    });
    return map;
  };

  const renderCards = ({ flip = false } = {}) => {
    const oldRects = flip ? capturePositions() : new Map();
    const visible = visibleVoices();
    const featured = visible.find((v) => v.recommended);
    const normal = visible.filter((v) => v !== featured);
    const parts = [];
    if (featured) parts.push(featureCardHTML(featured, 0));
    normal.forEach((v, i) => parts.push(normalCardHTML(v, i + (featured ? 1 : 0))));
    parts.push(ctaHTML(visible.length));
    els.grid.innerHTML = parts.join('');
    updateIdentity(currentVoice(), false);
    updateCardStates();
    syncShortlistUI();
    animateCards(oldRects);
  };

  const updateStarFor = (button, slug) => {
    const on = state.shortlist.has(slug);
    const voice = VOICES.find((v) => v.slug === slug);
    if (!button || !voice) return;
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', `${on ? '移出备选' : '加入备选'}：${voice.name}`);
    setStarIcon(button, on);
  };

  const syncShortlistUI = () => {
    const count = state.shortlist.size;
    if (els.shortlistCount) els.shortlistCount.textContent = pad(count);
    if (els.shortlistFilterCount) els.shortlistFilterCount.textContent = String(count);
    if (els.filterShortlist) els.filterShortlist.hidden = count === 0;
    if (els.shortlistStatus) {
      els.shortlistStatus.disabled = count === 0;
      els.shortlistStatus.classList.toggle('is-active', state.filter === 'shortlist');
    }
    els.grid.querySelectorAll('[data-star]').forEach((button) => updateStarFor(button, button.dataset.star));
    if (currentVoice()) updateStarFor(els.star, currentVoice().slug);
  };

  const updateCardStates = () => {
    const voice = currentVoice();
    els.grid.querySelectorAll('.voice-card[data-slug]').forEach((card) => {
      const active = !!voice && card.dataset.slug === voice.slug;
      const playing = active && state.playing;
      card.classList.toggle('is-active', active);
      card.classList.toggle('is-playing', playing);
      const entry = VOICES.find((v) => v.slug === card.dataset.slug);
      card.querySelectorAll('[data-play]').forEach((button) => {
        button.setAttribute('aria-label', `${playing ? '暂停' : '播放'} ${entry.name}`);
      });
      const featLabel = card.querySelector('.feature-play-label');
      if (featLabel) featLabel.textContent = playing ? '暂停播放' : `试听${entry.zh}`;
      const hit = card.querySelector('.card-hit');
      if (hit) hit.setAttribute('aria-label', `${playing ? '暂停' : '试听'} ${entry.name}，${entry.zh}，${entry.role}`);
      const star = card.querySelector('[data-star]');
      if (star) updateStarFor(star, card.dataset.slug);
    });
    updateListenCursorState();
  };

  const updateExtras = (voice) => {
    const cat = catFor(voice);
    const ctaName = $('ctaName');
    const ctaCat = $('ctaCat');
    const ctaId = $('ctaId');
    if (ctaName) ctaName.textContent = voice.name;
    if (ctaCat) ctaCat.textContent = `${voice.zh} / ${cat.label}`;
    if (ctaId) ctaId.textContent = voice.voiceId;
    const sig = document.querySelector('.cta-signature');
    if (sig) sig.style.setProperty('--sig', cat.strong);
    const sigLabel = $('ctaSignatureLabel');
    if (sigLabel) sigLabel.textContent = `${voice.name} · VOICE SIGNATURE`;
    const sigWave = $('ctaWave');
    if (sigWave) sigWave.innerHTML = waveSVG(peaksFor(voice.slug), 86, 42);
    els.finaleName.textContent = voice.name;
    els.finaleCat.textContent = `${voice.zh} · ${cat.label} / ${voice.role}`;
    els.finaleId.textContent = voice.voiceId;
    els.finaleDot.style.background = cat.strong;
    document.documentElement.style.setProperty('--accent', cat.strong);
    document.documentElement.style.setProperty('--accent-soft', cat.soft);
    state.accent = cat.strong;
  };

  const swapText = (element) => {
    if (!element) return;
    element.classList.remove('is-swapping');
    void element.offsetWidth;
    element.classList.add('is-swapping');
  };


  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  const splitMonologue = (text, maxlen = 42) => {
    const out = [];
    String(text).split(/\n\s*\n/).forEach((paragraph) => {
      const p = paragraph.trim();
      if (!p) return;
      const sentences = p.match(/[^。！？!?…]+[。！？!?…]*/g) || [p];
      let current = '';
      sentences.forEach((raw) => {
        const sentence = raw.trim();
        if (!sentence) return;
        if (!current) current = sentence;
        else if (current.length + sentence.length <= maxlen) current += sentence;
        else { out.push(current); current = sentence; }
      });
      if (current) out.push(current);
    });
    return out;
  };

  const renderScript = (voice, animate = false) => {
    if (!voice || !els.scriptLines) return;
    const lines = splitMonologue(voice.script || '');
    els.scriptPull.textContent = voice.pull || '';
    els.scriptVoiceTag.textContent = `${voice.zh} · ${voice.lang} / ${voice.role}`;
    els.scriptByline.textContent = `—— ${voice.zh} · ${voice.title}`;
    els.scriptMeta.textContent = `${voice.zh} / ${fmtTime(durationFor(voice.slug))}`;
    els.scriptLines.innerHTML = lines.map((line, index) =>
      `<li><span class="line-no">${pad(index + 1)}</span><p>${escapeHTML(line)}</p></li>`
    ).join('');
    if (animate && motionOK) {
      document.querySelectorAll('.script-quote, .script-sheet').forEach((el, index) => {
        el.animate([
          { opacity: 0.28, translate: '0 10px' },
          { opacity: 1, translate: '0 0' }
        ], { duration: 520, delay: index * 60, easing: 'cubic-bezier(.19,1,.22,1)' });
      });
    }
  };

  const updateIdentity = (voice, animate = true) => {
    if (!voice) return;
    const cat = catFor(voice);
    const index = voiceIndex(voice);
    els.discName.textContent = voice.name;
    els.discZh.textContent = `${voice.zh} / ${voice.role}`;
    els.discTake.textContent = `TAKE ${pad(index + 1)} / 13`;
    els.discCategory.textContent = cat.label;
    els.discCategoryDot.style.background = cat.strong;
    els.discDuration.textContent = fmtTime(durationFor(voice.slug));
    els.discKicker.innerHTML = voice.recommended
      ? '<svg class="kicker-star"><use href="#i-spark"/></svg>主推 · BEST PICK'
      : 'NOW AUDITIONING';
    els.discRec.hidden = !voice.recommended;
    els.dockTake.textContent = pad(index + 1);
    els.dockName.textContent = voice.name;
    els.dockCat.textContent = `${voice.zh} · ${cat.label} / ${voice.role}`;
    updateExtras(voice);
    renderScript(voice, animate);
    updateStarFor(els.star, voice.slug);
    updateCardStates();
    if (animate) {
      swapText(els.discName);
      swapText(els.dockName);
      clearTimeout(state.swapTimer);
      state.swapTimer = window.setTimeout(() => {
        els.discName.classList.remove('is-swapping');
        els.dockName.classList.remove('is-swapping');
      }, 480);
    }
  };

  const setStatus = (text, kind = 'idle') => {
    els.discStatus.textContent = text;
    els.discStatusDot.classList.toggle('is-live', kind === 'playing');
    els.discStatusDot.classList.toggle('is-loading', kind === 'loading');
    els.discStatusDot.classList.toggle('is-error', kind === 'error');
    els.miniEq.classList.toggle('is-live', kind === 'playing');
  };

  const setPlayingUI = (playing) => {
    state.playing = playing;
    els.dock.classList.toggle('is-playing', playing);
    els.disc.classList.toggle('is-playing', playing);
    els.navPlay.classList.toggle('is-playing', playing);
    els.discPlay.classList.toggle('is-playing', playing);
    els.play.classList.toggle('is-playing', playing);
    els.navPlayLabel.textContent = playing ? '暂停' : '试听';
    els.navPlay.setAttribute('aria-label', playing ? '暂停当前音色' : '播放当前音色');
    els.play.setAttribute('aria-label', playing ? '暂停' : '播放');
    const voice = currentVoice();
    els.discPlay.setAttribute('aria-label', `${playing ? '暂停' : '播放'} ${voice ? voice.name : ''}`);
    updateCardStates();
    if (playing) startVisualLoop();
    else stopVisualLoop();
  };

  const updateTimes = (time) => {
    const duration = getDuration();
    const ratio = duration > 0 ? clamp(time / duration) : 0;
    state.progress = ratio;
    const now = performance.now();
    if (now - lastTextAt > 80) {
      lastTextAt = now;
      els.cur.textContent = fmtTime(time);
      els.dur.textContent = fmtTime(duration);
      els.dockWave.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
      els.dockWave.setAttribute('aria-valuetext', `${fmtTime(time)} / ${fmtTime(duration)}`);
    }
    els.dockProgress.style.width = `${(ratio * 100).toFixed(2)}%`;
    if (!state.playing) {
      drawDock();
      drawDisc();
    }
  };

  const playAudio = () => {
    if (!currentVoice()) return;
    clearTimeout(state.nextTimer);
    if (state.ended) {
      els.audio.currentTime = 0;
      state.ended = false;
    }
    state.wantPlay = true;
    const promise = els.audio.play();
    if (promise && promise.catch) {
      promise.catch((error) => {
        if (error.name === 'AbortError') return;
        if (error.name === 'NotSupportedError' && els.audio.readyState === 0) return;
        state.wantPlay = false;
        setStatus('音频不可用', 'error');
        setPlayingUI(false);
        showToast('播放失败，请再点一次播放');
      });
    }
  };

  const togglePlay = () => {
    if (!currentVoice()) return;
    if (els.audio.paused) playAudio();
    else {
      state.wantPlay = false;
      els.audio.pause();
    }
  };

  const selectVoice = (target, { play = false, initial = false, restart = false } = {}) => {
    const index = typeof target === 'number' ? target : VOICES.findIndex((v) => v.slug === target);
    const voice = VOICES[index];
    if (!voice) return;
    const previous = state.current;
    const same = index === previous && els.audio.getAttribute('src');
    if (same && play) {
      if (restart) {
        els.audio.currentTime = 0;
        state.ended = false;
        updateTimes(0);
      }
      playAudio();
      return;
    }
    if (same && !play) return;
    const changed = index !== previous || !els.audio.getAttribute('src');

    clearTimeout(state.nextTimer);
    state.current = index;
    state.ended = false;
    state.selecting = true;
    state.progress = 0;
    state.rotation = 0;
    state.level = 0;
    els.audio.pause();
    els.audio.src = voice.file;
    els.audio.load();
    state.wantPlay = play;
    updateIdentity(voice, changed && !initial);
    updateTimes(0);
    drawDisc();
    drawDock();
    if (play) {
      setStatus('正在载入', 'loading');
      playAudio();
    } else {
      setStatus(initial ? '准备试听' : '已就绪');
    }
    window.setTimeout(() => { state.selecting = false; }, 180);
  };

  const stepVoice = (direction) => {
    const list = visibleVoices();
    if (!list.length) return;
    let index = list.findIndex((v) => v.slug === currentVoice()?.slug);
    if (index === -1) index = direction > 0 ? -1 : 0;
    const next = list[(index + direction + list.length) % list.length];
    selectVoice(next.slug, { play: true });
  };

  const activateVoice = (slug) => {
    const voice = VOICES.find((v) => v.slug === slug);
    if (!voice) return;
    if (slug === currentVoice()?.slug && !state.ended) {
      togglePlay();
      return;
    }
    selectVoice(slug, { play: true });
  };

  const replayCurrent = () => {
    if (!currentVoice()) return;
    els.audio.currentTime = 0;
    state.ended = false;
    if (els.audio.paused) playAudio();
    updateTimes(0);
  };

  const toggleMute = () => {
    state.muted = !state.muted;
    els.audio.muted = state.muted;
    els.mute.setAttribute('aria-pressed', String(state.muted));
    els.mute.setAttribute('aria-label', state.muted ? '取消静音' : '静音');
    const use = els.mute.querySelector('use');
    if (use) use.setAttribute('href', state.muted ? '#i-muted' : '#i-volume');
    showToast(state.muted ? '已静音' : '已恢复声音');
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch { return false; }
  };

  const copyCurrentId = async () => {
    const voice = currentVoice();
    if (!voice) return;
    const ok = await copyText(voice.voiceId);
    showToast(ok ? `已复制 ${voice.voiceId}` : '复制失败，请手动选择 Voice ID');
  };

  const copyScript = async () => {
    const voice = currentVoice();
    if (!voice) return;
    const ok = await copyText(voice.script);
    showToast(ok ? '独白全文已复制' : '复制失败，请手动选择文字');
  };

  const showToast = (message) => {
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => els.toast.classList.remove('is-visible'), 2400);
  };

  const toggleShortlist = (slug) => {
    const voice = VOICES.find((v) => v.slug === slug);
    if (!voice) return;
    const on = !state.shortlist.has(slug);
    if (on) state.shortlist.add(slug);
    else state.shortlist.delete(slug);
    saveShortlist();
    if (state.filter === 'shortlist') {
      if (state.shortlist.size === 0) setFilter('all');
      else renderCards({ flip: true });
    } else {
      syncShortlistUI();
      updateCardStates();
    }
    showToast(on ? `已加入备选：${voice.name}` : `已移出备选：${voice.name}`);
  };

  const setFilter = (filter) => {
    if (filter === 'shortlist' && state.shortlist.size === 0) return;
    state.filter = filter;
    els.filters.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    els.shortlistStatus.classList.toggle('is-active', filter === 'shortlist');
    renderCards({ flip: true });
  };

  const fitCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    if (!ctx || !rect.width || !rect.height) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  };

  const drawDock = () => {
    const fit = fitCanvas(els.dockWave);
    if (!fit) return;
    const { ctx, width, height } = fit;
    const peaks = peaksFor(currentVoice()?.slug);
    const bars = width < 420 ? 68 : 108;
    const step = width / bars;
    const mid = height / 2;
    const maxH = height * 0.78;
    const played = Math.round(state.progress * bars);
    const lineWidth = Math.max(1.15, step * 0.46);

    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = 'rgba(24,19,16,.19)';
    ctx.beginPath();
    for (let i = played; i < bars; i += 1) {
      const p = peaks.length ? peaks[Math.min(peaks.length - 1, Math.floor((i / bars) * peaks.length))] : 0.08;
      const bh = Math.max(1.2, p * maxH);
      const x = i * step + step / 2;
      ctx.moveTo(x, mid - bh / 2);
      ctx.lineTo(x, mid + bh / 2);
    }
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, state.accent);
    gradient.addColorStop(1, '#2438f0');
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    for (let i = 0; i < played; i += 1) {
      const p = peaks.length ? peaks[Math.min(peaks.length - 1, Math.floor((i / bars) * peaks.length))] : 0.08;
      const bh = Math.max(1.2, p * maxH);
      const x = i * step + step / 2;
      ctx.moveTo(x, mid - bh / 2);
      ctx.lineTo(x, mid + bh / 2);
    }
    ctx.stroke();

    if (state.hoverRatio !== null && !state.seeking) {
      const x = state.hoverRatio * width;
      ctx.strokeStyle = 'rgba(24,19,16,.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(x, 2);
      ctx.lineTo(x, height - 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(x, 2.5, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(24,19,16,.45)';
      ctx.fill();
    }
  };

  const drawDisc = () => {
    const fit = fitCanvas(els.discCanvas);
    if (!fit) return;
    const { ctx, width, height } = fit;
    const size = Math.min(width, height);
    const cx = width / 2;
    const cy = height / 2;
    const peaks = peaksFor(currentVoice()?.slug);
    const count = 132;
    const inner = size * 0.228;
    const max = size * 0.135;
    const baseRadius = size * 0.409;

    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(24,19,16,.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (state.progress > 0) {
      const end = -Math.PI / 2 + state.progress * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, -Math.PI / 2, end);
      ctx.strokeStyle = state.accent;
      ctx.lineWidth = Math.max(1.6, size * 0.005);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + Math.cos(end) * baseRadius, cy + Math.sin(end) * baseRadius, Math.max(2, size * 0.006), 0, Math.PI * 2);
      ctx.fillStyle = state.accent;
      ctx.fill();
    }

    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1, size * 0.0025);
    const boost = 1 + state.level * 0.25;
    for (let i = 0; i < count; i += 1) {
      const p = peaks.length ? peaks[Math.min(peaks.length - 1, Math.floor((i / count) * peaks.length))] : 0.08;
      const shaped = Math.pow(p, 1.55);
      const angle = (i / count) * Math.PI * 2 + state.rotation;
      const len = (size * 0.008 + shaped * max) * boost;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      ctx.strokeStyle = rgba(state.accent, 0.16 + p * 0.5);
      ctx.beginPath();
      ctx.moveTo(cx + ca * inner, cy + sa * inner);
      ctx.lineTo(cx + ca * (inner + len), cy + sa * (inner + len));
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, inner - size * 0.012, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(24,19,16,.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const visualLoop = () => {
    raf = 0;
    if (!state.playing) return;
    updateTimes(els.audio.currentTime);
    if (motionOK) state.rotation += 0.0052;
    // Direct <audio> output: a MediaElementSource would silence local file:// playback in Chromium.
    const peaks = peaksFor(currentVoice()?.slug);
    const peak = peaks.length
      ? peaks[Math.min(peaks.length - 1, Math.max(0, Math.floor(state.progress * peaks.length)))]
      : 0.2;
    const pulse = 0.78 + Math.sin(performance.now() * 0.0062) * 0.14 + Math.sin(performance.now() * 0.0131) * 0.08;
    state.level = clamp(peak * 1.5 * pulse, 0, 1);
    const now = performance.now();
    if (now - lastLevelAt > 60) {
      lastLevelAt = now;
      document.documentElement.style.setProperty('--audio-level', state.level.toFixed(3));
    }
    drawDisc();
    drawDock();
    raf = requestAnimationFrame(visualLoop);
  };

  const startVisualLoop = () => {
    if (raf || !state.playing) return;
    raf = requestAnimationFrame(visualLoop);
  };

  const stopVisualLoop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    updateTimes(els.audio.currentTime);
    drawDisc();
    drawDock();
    document.documentElement.style.setProperty('--audio-level', '0');
  };

  const seekTo = (ratio) => {
    const duration = getDuration();
    state.progress = clamp(ratio);
    if (duration > 0) els.audio.currentTime = state.progress * duration;
    updateTimes(els.audio.currentTime);
  };

  const seekFromEvent = (event) => {
    const rect = els.dockWave.getBoundingClientRect();
    seekTo((event.clientX - rect.left) / rect.width);
  };

  const bindDockWave = () => {
    const canvas = els.dockWave;
    canvas.addEventListener('pointerdown', (event) => {
      state.seeking = true;
      try { canvas.setPointerCapture(event.pointerId); } catch {}
      seekFromEvent(event);
    });
    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      state.hoverRatio = clamp((event.clientX - rect.left) / rect.width);
      if (state.seeking) seekFromEvent(event);
      else drawDock();
    });
    canvas.addEventListener('pointerup', (event) => {
      state.seeking = false;
      try { canvas.releasePointerCapture(event.pointerId); } catch {}
      drawDock();
    });
    canvas.addEventListener('pointercancel', () => {
      state.seeking = false;
      drawDock();
    });
    canvas.addEventListener('pointerleave', () => {
      if (!state.seeking) {
        state.hoverRatio = null;
        drawDock();
      }
    });
    canvas.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        const delta = event.key === 'ArrowLeft' ? -5 : 5;
        seekTo((els.audio.currentTime + delta) / Math.max(getDuration(), 0.001));
      }
      if (event.key === 'Home') { event.preventDefault(); seekTo(0); }
      if (event.key === 'End') { event.preventDefault(); seekTo(1); }
    });
  };

  const makeRipple = (card, event) => {
    if (!motionOK) return;
    const rect = card.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    ripple.style.background = card.style.getPropertyValue('--cat-strong') || state.accent;
    card.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 850);
  };

  const bindGrid = () => {
    els.grid.addEventListener('click', (event) => {
      const star = event.target.closest('[data-star]');
      if (star) {
        toggleShortlist(star.dataset.star);
        return;
      }
      const play = event.target.closest('[data-play]');
      if (play) {
        const slug = play.dataset.play;
        if (slug === currentVoice()?.slug && !state.ended) togglePlay();
        else activateVoice(slug);
        return;
      }
      const hit = event.target.closest('.card-hit');
      if (hit) {
        const card = hit.closest('.voice-card');
        if (card) {
          makeRipple(card, event);
          activateVoice(card.dataset.slug);
        }
        return;
      }
      if (event.target.closest('.cta-copy')) copyCurrentId();
    });

    if (!finePointer) return;

    els.grid.addEventListener('pointermove', (event) => {
      const card = event.target.closest('.voice-card');
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width);
        const y = clamp((event.clientY - rect.top) / rect.height);
        card.style.setProperty('--rx', `${((0.5 - y) * 2.6).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${((x - 0.5) * 2.6).toFixed(2)}deg`);
        card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      }

      const hit = event.target.closest('.card-hit');
      if (hit && finePointer) {
        setListenCursor(hit.closest('.voice-card'));
        pointerTarget.x = Math.min(window.innerWidth - 36, event.clientX + 18);
        pointerTarget.y = Math.min(window.innerHeight - 36, event.clientY + 20);
      } else {
        hideListenCursor();
      }
    });

    els.grid.addEventListener('pointerout', (event) => {
      const card = event.target.closest('.voice-card');
      if (!card) return;
      if (event.relatedTarget && card.contains(event.relatedTarget)) return;
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--mx', '72%');
      card.style.setProperty('--my', '8%');
    });

    els.grid.addEventListener('pointerleave', () => {
      hideListenCursor();
    });
  };

  const setListenCursor = (card) => {
    if (!els.listenCursor) return;
    els.listenCursor.classList.add('is-visible');
    const playing = state.playing && card?.dataset.slug === currentVoice()?.slug;
    els.listenCursor.classList.toggle('is-pause', !!playing);
    els.listenCursor.style.background = playing ? state.accent : '';
  };

  const hideListenCursor = () => {
    els.listenCursor?.classList.remove('is-visible');
  };

  const updateListenCursorState = () => {
    if (!els.listenCursor?.classList.contains('is-visible')) return;
    const playing = state.playing;
    els.listenCursor.classList.toggle('is-pause', playing);
    els.listenCursor.style.background = playing ? state.accent : '';
  };

  const pointerTarget = { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: 300 };
  const pointerCurrent = { x: pointerTarget.x, y: pointerTarget.y };
  const glowTarget = { x: pointerTarget.x, y: pointerTarget.y };
  const glowCurrent = { x: glowTarget.x, y: glowTarget.y };

  const startPointerLoop = () => {
    if (!finePointer || !motionOK || pointerRaf) return;
    const loop = () => {
      glowCurrent.x += (glowTarget.x - glowCurrent.x) * 0.07;
      glowCurrent.y += (glowTarget.y - glowCurrent.y) * 0.07;
      if (els.cursorGlow) {
        els.cursorGlow.style.transform = `translate3d(${glowCurrent.x.toFixed(1)}px, ${glowCurrent.y.toFixed(1)}px, 0)`;
      }
      if (els.listenCursor) {
        pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.24;
        pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.24;
        els.listenCursor.style.transform = `translate3d(${pointerCurrent.x.toFixed(1)}px, ${pointerCurrent.y.toFixed(1)}px, 0)`;
      }
      pointerRaf = requestAnimationFrame(loop);
    };
    pointerRaf = requestAnimationFrame(loop);
  };

  const bindPointer = () => {
    if (!finePointer || !motionOK) return;
    window.addEventListener('pointermove', (event) => {
      pointerTarget.x = event.clientX;
      pointerTarget.y = event.clientY;
      glowTarget.x = event.clientX;
      glowTarget.y = event.clientY;
    }, { passive: true });
    document.addEventListener('pointerleave', hideListenCursor);
  };

  const bindMagnetic = () => {
    if (!finePointer || !motionOK) return;
    document.querySelectorAll('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * 0.07;
        const y = (event.clientY - (rect.top + rect.height / 2)) * 0.1;
        button.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
      button.addEventListener('pointerleave', () => {
        button.style.translate = '0px 0px';
      });
    });
  };

  const bindDiscTilt = () => {
    if (!finePointer || !motionOK) return;
    els.discScene.addEventListener('pointermove', (event) => {
      const rect = els.discScene.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width);
      const y = clamp((event.clientY - rect.top) / rect.height);
      els.discScene.style.transform = `perspective(1100px) rotateX(${((0.5 - y) * 3.6).toFixed(2)}deg) rotateY(${((x - 0.5) * 4.2).toFixed(2)}deg)`;
    });
    els.discScene.addEventListener('pointerleave', () => {
      els.discScene.style.transform = '';
    });
  };

  const updateAutoNext = () => {
    els.autoNext.setAttribute('aria-checked', String(state.autoNext));
  };

  const bind = () => {
    bindGrid();
    bindDockWave();
    bindPointer();
    bindMagnetic();
    bindDiscTilt();

    els.play.addEventListener('click', togglePlay);
    els.discPlay.addEventListener('click', togglePlay);
    els.navPlay.addEventListener('click', togglePlay);
    els.heroPlay.addEventListener('click', () => selectVoice(0, { play: true, restart: true }));
    els.prev.addEventListener('click', () => stepVoice(-1));
    els.next.addEventListener('click', () => stepVoice(1));
    els.mute.addEventListener('click', toggleMute);
    els.star.addEventListener('click', () => { if (currentVoice()) toggleShortlist(currentVoice().slug); });
    els.copy.addEventListener('click', copyCurrentId);
    els.copyScript.addEventListener('click', copyScript);
    els.finaleCopy.addEventListener('click', copyCurrentId);
    els.finalePlay.addEventListener('click', replayCurrent);

    els.shortlistStatus.addEventListener('click', () => {
      if (state.shortlist.size === 0) return;
      setFilter(state.filter === 'shortlist' ? 'all' : 'shortlist');
    });
    els.filters.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.filter === 'shortlist' && state.shortlist.size === 0) return;
        setFilter(button.dataset.filter);
      });
    });
    els.autoNext.addEventListener('click', () => {
      state.autoNext = !state.autoNext;
      updateAutoNext();
      saveAutoNext();
      showToast(state.autoNext ? '已开启自动连播' : '已关闭自动连播');
    });

    els.audio.addEventListener('loadedmetadata', () => updateTimes(els.audio.currentTime));
    els.audio.addEventListener('durationchange', () => updateTimes(els.audio.currentTime));
    els.audio.addEventListener('canplay', () => {
      if (state.wantPlay && els.audio.paused) {
        const promise = els.audio.play();
        if (promise && promise.catch) promise.catch(() => {});
      } else if (!state.playing && !state.ended) {
        setStatus(state.hasPlayed ? '已暂停' : '准备试听');
      }
    });
    els.audio.addEventListener('waiting', () => {
      if (!els.audio.paused) setStatus('正在载入', 'loading');
    });
    els.audio.addEventListener('play', () => {
      state.wantPlay = false;
      state.selecting = false;
      state.hasPlayed = true;
      state.ended = false;
      setStatus('正在播放', 'playing');
      setPlayingUI(true);
    });
    els.audio.addEventListener('playing', () => {
      setStatus('正在播放', 'playing');
      setPlayingUI(true);
    });
    els.audio.addEventListener('pause', () => {
      setPlayingUI(false);
      if (!state.selecting && !state.ended) {
        setStatus(state.hasPlayed ? '已暂停' : '准备试听');
      }
    });
    els.audio.addEventListener('timeupdate', () => updateTimes(els.audio.currentTime));
    els.audio.addEventListener('ended', () => {
      state.ended = true;
      state.wantPlay = false;
      setStatus('播放完毕');
      setPlayingUI(false);
      if (state.autoNext) {
        clearTimeout(state.nextTimer);
        state.nextTimer = window.setTimeout(() => stepVoice(1), 620);
      }
    });
    els.audio.addEventListener('error', () => {
      state.wantPlay = false;
      setStatus('音频不可用', 'error');
      setPlayingUI(false);
      showToast('音频加载失败，请检查文件是否存在');
    });

    window.addEventListener('keydown', (event) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const onInteractive = target.closest('button, a, [role="button"]');
      if (event.code === 'Space') {
        if (onInteractive) return;
        event.preventDefault();
        togglePlay();
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (target === els.dockWave) return;
        event.preventDefault();
        const delta = event.key === 'ArrowLeft' ? -5 : 5;
        seekTo((els.audio.currentTime + delta) / Math.max(getDuration(), 0.001));
        return;
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        stepVoice(event.key === 'ArrowUp' ? -1 : 1);
        return;
      }
      if (event.key === 'm' || event.key === 'M') { event.preventDefault(); toggleMute(); return; }
      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        if (currentVoice()) toggleShortlist(currentVoice().slug);
        return;
      }
      if (event.key === 'Escape' && state.filter !== 'all') setFilter('all');
    });

    window.addEventListener('resize', () => { drawDock(); drawDisc(); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (state.playing) {
        startVisualLoop();
      }
    });

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => { drawDock(); drawDisc(); });
      observer.observe(els.dockWave);
      observer.observe(els.discCanvas);
    }
  };


  const setupMarquee = () => {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!motionOK) {
        track.style.transform = 'none';
        return;
      }
      const half = track.scrollWidth / 2;
      if (!half) return;
      const offset = (window.scrollY * 0.22) % half;
      track.style.transform = `translate3d(${-offset.toFixed(1)}px, 0, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  };

  const setupNav = () => {
    const links = [...els.navPages.querySelectorAll('a')];
    const onScroll = () => {
      els.siteHead.classList.toggle('is-scrolled', window.scrollY > 24);
      const y = window.scrollY + window.innerHeight * 0.34;
      const script = $('script');
      const roster = $('roster');
      let active = 'top';
      if (script && y >= script.offsetTop) active = 'script';
      else if (roster && y >= roster.offsetTop) active = 'roster';
      links.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === active));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  const setupReveal = () => {
    const items = [...document.querySelectorAll('.reveal')];
    if (!motionOK || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('in-view'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((item) => observer.observe(item));
  };

  const runIntro = () => {
    const body = document.body;
    const skip = document.documentElement.classList.contains('skip-intro') || !motionOK;
    let finished = false;
    let introTimer = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(introTimer);
      els.intro?.classList.add('is-done');
      body.classList.add('is-ready');
      const settle = () => {
        body.classList.remove('is-locked');
        if (els.intro) {
          els.intro.style.display = 'none';
          els.intro.setAttribute('aria-hidden', 'true');
        }
        els.dock.classList.add('is-visible');
      };
      if (skip || !els.intro) {
        settle();
      } else {
        window.setTimeout(settle, 680);
      }
    };

    if (skip || !els.intro) {
      if (els.intro) {
        els.intro.classList.add('is-done');
        els.intro.style.display = 'none';
      }
      finish();
      return;
    }

    body.classList.add('is-locked');
    try { sessionStorage.setItem(STORE_INTRO, '1'); } catch {}
    const cleanup = () => {
      window.removeEventListener('keydown', keyHandler);
      els.intro.removeEventListener('click', onSkip);
    };
    const onSkip = () => {
      cleanup();
      finish();
    };
    const keyHandler = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        cleanup();
        finish();
      }
    };
    window.addEventListener('keydown', keyHandler);
    els.intro.addEventListener('click', onSkip);
    introTimer = window.setTimeout(() => {
      cleanup();
      finish();
    }, 1180);
  };

  const init = () => {
    els.audio.volume = 1;
    els.audio.muted = false;
    dockCtx = els.dockWave.getContext('2d');
    discCtx = els.discCanvas.getContext('2d');
    loadShortlist();
    loadAutoNext();
    updateAutoNext();
    state.current = 0;
    renderCards();
    bind();
    setupNav();
    setupMarquee();
    setupReveal();
    selectVoice(0, { initial: true });
    setStatus('准备试听');
    requestAnimationFrame(() => {
      drawDock();
      drawDisc();
      startPointerLoop();
    });
    runIntro();
  };

  init();
})();
