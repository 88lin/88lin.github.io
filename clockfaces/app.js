(function () {
  'use strict';

  const { faces: FACES, groups: GROUPS } = window.ClockFaces;
  const STORE = 'clockfaces:v1';
  const $ = (id) => document.getElementById(id);
  const body = document.body;
  const stage = $('stage');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- settings ----------

  function detect24() {
    try {
      const hc = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hourCycle;
      return hc === 'h23' || hc === 'h24';
    } catch (e) {
      return false;
    }
  }

  function zoneChoices() {
    let zones = [];
    try { zones = Intl.supportedValuesOf('timeZone'); } catch (e) { /* older browsers */ }
    let local = '';
    try { local = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { /* ignore */ }
    return [['local', local ? `本机时间（${local.replace(/_/g, ' ')}）` : '本机时间']]
      .concat(zones.map((z) => [z, z.replace(/_/g, ' ').replace(/\//g, ' / ')]));
  }

  const GLOBAL_OPTIONS = [
    { key: 'hour24', label: '24 小时制', type: 'toggle', default: detect24() },
    { key: 'showSeconds', label: '显示秒', type: 'toggle', default: true },
    { key: 'showDate', label: '显示日期', type: 'toggle', default: false },
    { key: 'timeZone', label: '时区', type: 'select', default: 'local', choices: zoneChoices() },
    { key: 'romanFour', label: '罗马数字四', type: 'select', default: 'IIII', choices: [['IIII', 'IIII（钟表传统写法）'], ['IV', 'IV']] },
    { key: 'brightness', label: '亮度', type: 'range', default: 100, min: 10, max: 100, step: 5 },
    { key: 'nightDim', label: '夜间自动调暗（22:00–7:00）', type: 'toggle', default: false },
    { key: 'nightBrightness', label: '夜间亮度', type: 'range', default: 30, min: 10, max: 100, step: 5 },
    { key: 'tickSound', label: '滴答声（仅整秒跳动的指针钟）', type: 'toggle', default: false },
    { key: 'autoHide', label: '空闲时隐藏控件', type: 'toggle', default: true },
  ];
  if ('wakeLock' in navigator) GLOBAL_OPTIONS.push({ key: 'wakeLock', label: '保持屏幕常亮', type: 'toggle', default: false });

  const defaultsOf = (opts) => Object.fromEntries(opts.map((o) => [o.key, o.default]));

  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  })();
  const state = {
    face: saved.face,
    global: Object.assign(defaultsOf(GLOBAL_OPTIONS), saved.global),
    faces: saved.faces || {},
    // All-clocks settings that a link has set for one clock only, by face id
    clockGlobals: saved.clockGlobals || {},
    // Clock ids, in the order they were added
    favourites: (saved.favourites || []).filter((id) => FACES.some((f) => f.id === id)),
    seenHint: !!saved.seenHint,
  };

  // Set when the page was opened from a link with settings in its URL
  let linkView = false;

  let saveTimer;
  function saveNow() {
    clearTimeout(saveTimer);
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 250);
  }

  const faceOpts = (face) => Object.assign(defaultsOf(face.options), state.faces[face.id]);
  const globalsFor = (face) => Object.assign({}, state.global, state.clockGlobals[face.id]);

  // ---------- time ----------

  // Returns a function that reads the current time in one zone. `.zone` is empty for local time.
  function zoneClock(zone) {
    let tz = zone === 'local' ? undefined : zone;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
    } catch (e) {
      tz = undefined;
    }
    const tzFmt = tz ? new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : null;
    const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz });
    const shortFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz });
    const dateCache = { date: '', dateShort: '', month: '' };
    let lastSecond = -1;

    const read = () => {
      const now = new Date();
      const t = { ms: now.getMilliseconds() };
      if (tzFmt) {
        for (const p of tzFmt.formatToParts(now)) {
          if (p.type === 'hour') t.h = +p.value % 24;
          else if (p.type === 'minute') t.m = +p.value;
          else if (p.type === 'second') t.s = +p.value;
        }
      } else {
        t.h = now.getHours();
        t.m = now.getMinutes();
        t.s = now.getSeconds();
      }
      t.sec = t.s + t.ms / 1000;
      const second = Math.floor(now.getTime() / 1000);
      if (second !== lastSecond) {
        lastSecond = second;
        dateCache.date = dateFmt.format(now);
        const parts = Object.fromEntries(shortFmt.formatToParts(now).map((p) => [p.type, p.value]));
        dateCache.dateShort = `${parts.weekday} ${parts.day}`.toUpperCase();
        dateCache.month = parts.month.toUpperCase();
      }
      t.date = dateCache.date;
      t.dateShort = dateCache.dateShort;
      t.month = dateCache.month;
      return t;
    };
    read.zone = tz;
    return read;
  }

  let getTime;

  function setupTimeZone(face) {
    const zone = face.ownZones ? 'local' : globalsFor(face).timeZone;
    getTime = zoneClock(zone);
    if (zone !== 'local' && !getTime.zone) state.global.timeZone = 'local';

    const label = $('tzLabel');
    label.hidden = !getTime.zone;
    if (getTime.zone) label.textContent = getTime.zone.split('/').pop().replace(/_/g, ' ');
  }

  // ---------- face lifecycle ----------

  const live = new Set();
  let current = null;

  function mountInto(layer, face) {
    layer.replaceChildren();
    layer.removeAttribute('style');
    layer.className = 'layer face-' + face.id;
    let inst;
    try {
      inst = face.mount(layer, faceOpts(face), globalsFor(face), { clockIn: zoneClock, optsFor: faceOpts }) || {};
    } catch (e) {
      console.error(e);
      inst = {};
    }
    if (typeof inst.tick !== 'function') inst.tick = () => {};
    inst.tick(getTime());
    // Let the page behind the stage match the face (visible when the sheet shrinks the stage)
    document.body.style.background = layer.style.background || '#000';
    return inst;
  }

  function drop(entry) {
    live.delete(entry.inst);
    entry.layer.remove();
  }

  function indexOf(id) {
    const i = FACES.findIndex((f) => f.id === id);
    return i < 0 ? 0 : i;
  }

  function showFace(i, dir = 0) {
    i = (i + FACES.length) % FACES.length;
    const face = FACES[i];
    setupTimeZone(face);
    const layer = document.createElement('div');
    stage.appendChild(layer);
    const inst = mountInto(layer, face);
    live.add(inst);

    const prev = current;
    current = { index: i, face, layer, inst };
    state.face = face.id;
    save();
    syncChrome();
    applyDim();

    if (!prev) return;
    if (dir && !reduceMotion) {
      const timing = { duration: 420, easing: 'cubic-bezier(.22,.8,.24,1)' };
      layer.animate([{ transform: `translateX(${dir * 22}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], timing);
      prev.layer.animate([{ opacity: 1 }, { transform: `translateX(${-dir * 22}%)`, opacity: 0 }], Object.assign({ fill: 'forwards' }, timing))
        .onfinish = () => drop(prev);
    } else {
      drop(prev);
    }
  }

  function remount() {
    live.delete(current.inst);
    current.inst = mountInto(current.layer, current.face);
    live.add(current.inst);
  }

  // Every clock in browsing order: favourites first, then the rest. Set once per visit, so
  // favouriting a clock doesn't send you back to the start of the list.
  const order = (() => {
    const favourites = state.favourites.map(indexOf);
    return favourites.concat(FACES.map((f, i) => i).filter((i) => !favourites.includes(i)));
  })();

  const step = (dir) => {
    showFace(order[(order.indexOf(current.index) + dir + order.length) % order.length], dir);
    flashCounter();
  };

  // ---------- brightness ----------

  // A black sheet over the stage, which is much cheaper than filtering an animating clock
  const dimmer = document.createElement('div');
  dimmer.className = 'dimmer';
  stage.appendChild(dimmer);
  let lastDimMinute = -1;

  function applyDim() {
    const g = globalsFor(current.face);
    // The device's own night, even when the clock is showing another time zone
    const hour = new Date().getHours();
    const night = g.nightDim && (hour >= 22 || hour < 7);
    const level = (night ? Math.min(g.brightness, g.nightBrightness) : g.brightness) / 100;
    dimmer.style.opacity = (1 - level).toFixed(2);
    $('tzLabel').style.filter = level < 1 ? `brightness(${level})` : '';
  }

  // ---------- tick sound ----------

  // Two neighbouring beats of a real clock: "Clock (tic tac).ogg" by Saaabaaato, Wikimedia
  // Commons, CC0. They're only downloaded once someone turns the sound on.
  let audio = null, clicks = null, loading = false, out = null, lastTick = -1;

  function loadClicks() {
    if (clicks || loading) return;
    loading = true;
    Promise.all(['tick', 'tock'].map((name) => fetch(`sounds/${name}.wav`)
      .then((r) => r.arrayBuffer())
      .then((data) => audio.decodeAudioData(data))))
      .then((buffers) => { clicks = buffers; })
      .catch(() => {}) // tried again on the next click or key press
      .finally(() => { loading = false; });
  }

  // Browsers only start audio from a click or key press, so this runs from those
  function startAudio() {
    if (!audio) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audio = new Ctx();
      out = audio.createGain();
      out.gain.value = 0.12;
      out.connect(audio.destination);
    }
    loadClicks();
    if (audio.state !== 'running') audio.resume().catch(() => {});
  }
  // Browsers differ on which of these counts, and Safari can suspend audio again later
  for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) {
    document.addEventListener(type, () => { if (state.global.tickSound) startAudio(); }, { passive: true });
  }

  function playTick(second) {
    if (!audio || !clicks || audio.state !== 'running') return;
    const src = audio.createBufferSource();
    src.buffer = clicks[second % 2];
    // Tiny differences each time, so it doesn't sound like a loop
    src.playbackRate.value = 0.99 + Math.random() * 0.02;
    const level = audio.createGain();
    level.gain.value = 0.9 + Math.random() * 0.1;
    src.connect(level);
    level.connect(out);
    src.start();
  }

  // A wall of clocks ticks if the style it's showing does
  const ticks = (face) => faceOpts(face.ownZones ? FACES[indexOf(faceOpts(face).style)] : face).sweep === 'tick';

  function frame() {
    const t = getTime();
    // Only clocks whose seconds jump make a sound: not smooth hands, and not digital clocks
    if (state.global.tickSound && t.s !== lastTick && current && ticks(current.face)) playTick(t.s);
    lastTick = t.s;
    if (t.m !== lastDimMinute) {
      lastDimMinute = t.m;
      applyDim();
    }
    for (const inst of live) {
      try { inst.tick(t); } catch (e) { console.error(e); }
    }
    requestAnimationFrame(frame);
  }

  // ---------- chrome ----------

  const select = $('faceSelect');
  function renderPicker() {
    select.replaceChildren();
    const addGroup = (label, indexes) => {
      if (!indexes.length) return;
      const og = document.createElement('optgroup');
      og.label = label;
      for (const i of indexes) og.appendChild(new Option(FACES[i].name, String(i)));
      select.appendChild(og);
    };
    addGroup('我的收藏', state.favourites.map(indexOf));
    for (const group of GROUPS) {
      addGroup(group, FACES.map((f, i) => i).filter((i) => FACES[i].group === group && !state.favourites.includes(FACES[i].id)));
    }
  }
  renderPicker();

  function toggleFavourite() {
    const { id } = current.face;
    const at = state.favourites.indexOf(id);
    if (at < 0) state.favourites.push(id);
    else state.favourites.splice(at, 1);
    saveNow();
    renderPicker();
    syncFavourite();
  }
  $('favBtn').addEventListener('click', toggleFavourite);

  function syncFavourite() {
    const { face, index } = current;
    const on = state.favourites.includes(face.id);
    const button = $('favBtn');
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? '取消收藏' : '加入收藏');
    select.value = String(index);
    $('counter').textContent = `${face.name}  ·  ${order.indexOf(index) + 1} / ${FACES.length}`;
    for (const a of document.querySelectorAll('.about-clocks a[data-face]')) {
      if (a.dataset.face === face.id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
  }

  // Once someone changes a setting, the link they arrived on is out of date, and a refresh
  // would put its old values back
  const forgetLink = () => { if (location.search) history.replaceState(null, '', location.pathname + location.hash); };

  // ---------- Apple app promo (iPhone, iPad, Mac) at the top of the sheet ----------

  // Our Apple apps, by the face they suit, else by the face's group.
  // Faces matching neither show no promo.
  const appStore = (name, icon, id) => ({ name, icon: `/apps/${icon}.jpg`, url: `https://apps.apple.com/app/id${id}` });
  const WORLD_APP = appStore('World Clock Widget - Timezones', 'world-clock', 912698955);
  const FLIP_APP = appStore('Flip Clock - Digital & Retro', 'flip-clock', 1498495124);
  const DIGITAL_APP = appStore('Digital Clock - Bedside Widget', 'digital-clock', 1505334122);
  const APPS_BY_FACE = { world: WORLD_APP, flip: FLIP_APP, splitflap: FLIP_APP };
  const APPS_BY_GROUP = { Digital: DIGITAL_APP };
  // 中文版不展示原站的 App Store 推广卡片
  const IS_APPLE = false;

  function syncAppPromo(face) {
    const app = IS_APPLE ? APPS_BY_FACE[face.id] || APPS_BY_GROUP[face.group] : null;
    const promo = $('appCard');
    promo.hidden = !app;
    if (!app) return;
    promo.href = app.url;
    $('appCardIcon').src = app.icon;
    $('appCardName').textContent = app.name;
  }

  function syncChrome() {
    const { face } = current;
    syncFavourite();
    syncAppPromo(face);
    route(face);
    $('faceHeading').textContent = face.name;
    renderControls($('faceControls'), face.options, faceOpts(face), (key, value) => {
      state.faces[face.id] = Object.assign({}, state.faces[face.id], { [key]: value });
      forgetLink();
      save();
      remount();
    });
    renderGlobalControls();
  }

  // ---------- routing: each face has its own page; switching swaps URL, title and article in place ----------

  const ROUTES = (() => {
    try { return JSON.parse($('routes').textContent); } catch (e) { return {}; }
  })();
  const pageCache = new Map();
  let routed = false;

  function route(face) {
    // 中文版用 #表盘 id 作为可分享地址，保持单页结构
    const hash = ROUTES[face.id] || ('#' + face.id);
    document.title = face.name + ' · 钟面集 · 免费全屏在线时钟';
    if (!routed) {
      routed = true;
      if (!document.body.dataset.face && !location.hash) return;
    }
    if (location.hash === hash) return;
    history.replaceState(null, '', location.pathname + hash);
  }

  function loadPage(path) {
    if (!pageCache.has(path)) {
      pageCache.set(path, fetch(path)
        .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
        .then((html) => new DOMParser().parseFromString(html, 'text/html'))
        .catch(() => (pageCache.delete(path), null)));
    }
    pageCache.get(path).then((doc) => {
      if (!doc || location.pathname !== path) return;
      document.title = doc.title;
      for (const sel of ['meta[name="description"]', 'link[rel="canonical"]']) {
        const from = doc.querySelector(sel), to = document.querySelector(sel);
        if (from && to) to.replaceWith(from.cloneNode());
      }
      const about = doc.getElementById('about');
      if (about) $('about').replaceWith(document.importNode(about, true));
    });
  }

  let counterTimer;
  function flashCounter() {
    const c = $('counter');
    c.classList.add('flash');
    clearTimeout(counterTimer);
    counterTimer = setTimeout(() => c.classList.remove('flash'), 1400);
  }

  let ctlId = 0;
  function renderControls(container, schema, values, onChange) {
    container.replaceChildren();
    for (const opt of schema) {
      const id = 'ctl-' + ++ctlId;
      const row = document.createElement('div');
      row.className = 'ctl ctl-' + opt.type;
      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = opt.label;
      row.appendChild(label);
      const value = values[opt.key];
      let input;

      if (opt.type === 'color') {
        input = document.createElement('input');
        input.type = 'color';
        input.value = value;
        input.addEventListener('input', () => onChange(opt.key, input.value));
        row.appendChild(input);
      } else if (opt.type === 'select') {
        const wrap = document.createElement('div');
        wrap.className = 'ctl-select';
        input = document.createElement('select');
        for (const [v, l] of opt.choices) input.appendChild(new Option(l, v, false, v === value));
        input.addEventListener('change', () => onChange(opt.key, input.value));
        wrap.appendChild(input);
        row.appendChild(wrap);
      } else if (opt.type === 'toggle') {
        const sw = document.createElement('span');
        sw.className = 'switch';
        input = document.createElement('input');
        input.type = 'checkbox';
        input.setAttribute('role', 'switch');
        input.checked = !!value;
        input.addEventListener('change', () => onChange(opt.key, input.checked));
        sw.appendChild(input);
        sw.appendChild(document.createElement('i'));
        row.appendChild(sw);
      } else if (opt.type === 'range') {
        const wrap = document.createElement('div');
        wrap.className = 'ctl-range';
        input = document.createElement('input');
        input.type = 'range';
        Object.assign(input, { min: opt.min, max: opt.max, step: opt.step, value });
        const out = document.createElement('output');
        out.textContent = value;
        input.addEventListener('input', () => {
          out.textContent = input.value;
          onChange(opt.key, +input.value);
        });
        wrap.appendChild(input);
        wrap.appendChild(out);
        row.appendChild(wrap);
      } else if (opt.type === 'zones') {
        renderZones(row, opt, value, onChange);
      }
      if (input) input.id = id;
      container.appendChild(row);
      if (opt.help) {
        const help = document.createElement('p');
        help.className = 'ctl-help';
        help.textContent = opt.help;
        container.appendChild(help);
      }
    }
  }

  // World clock names can't contain the characters that separate them when stored
  const cleanName = (name) => name.replace(/[,|]/g, ' ').trim().slice(0, 30);

  // A list of time zones with optional names, stored as one string: "Asia/Tokyo|Anna,local"
  function renderZones(row, opt, value, onChange) {
    const zones = value.split(',').map((entry) => {
      const [zone, name = ''] = entry.split('|');
      return { zone, name };
    });
    const list = document.createElement('div');
    list.className = 'zone-list';
    row.appendChild(list);

    let typing;
    const commit = () => {
      clearTimeout(typing);
      onChange(opt.key, zones.map((z) => (z.name ? `${z.zone}|${z.name}` : z.zone)).join(','));
    };

    const blank = document.createElement('select');
    for (const [v, l] of GLOBAL_OPTIONS.find((o) => o.key === 'timeZone').choices) blank.appendChild(new Option(l, v));

    const draw = () => {
      list.replaceChildren();
      zones.forEach((entry, i) => {
        const item = document.createElement('div');
        item.className = 'zone-item';
        const wrap = document.createElement('div');
        wrap.className = 'ctl-select';
        const input = blank.cloneNode(true);
        input.setAttribute('aria-label', `第 ${i + 1} 个时钟的时区`);
        // Browsers list some zones under another name, and links can use either
        if (![...input.options].some((o) => o.value === entry.zone)) input.appendChild(new Option(entry.zone.replace(/_/g, ' ').replace(/\//g, ' / '), entry.zone));
        input.value = entry.zone;
        wrap.appendChild(input);
        item.appendChild(wrap);

        const name = document.createElement('input');
        name.type = 'text';
        name.className = 'zone-name';
        name.maxLength = 30;
        name.value = entry.name;
        name.setAttribute('aria-label', `第 ${i + 1} 个时钟的名称`);
        const showPlaceholder = () => { name.placeholder = window.ClockFaces.cityOf(entry.zone); };
        showPlaceholder();
        name.addEventListener('input', () => {
          entry.name = cleanName(name.value);
          clearTimeout(typing);
          typing = setTimeout(commit, 300);
        });
        input.addEventListener('change', () => {
          entry.zone = input.value;
          showPlaceholder();
          commit();
        });

        if (zones.length > 1) {
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.className = 'icon-btn zone-remove';
          remove.setAttribute('aria-label', `移除第 ${i + 1} 个时钟`);
          remove.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
          remove.addEventListener('click', () => {
            zones.splice(i, 1);
            draw();
            commit();
          });
          item.appendChild(remove);
        }
        item.appendChild(name);
        list.appendChild(item);
      });
      if (zones.length < opt.max) {
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'text-btn';
        add.textContent = '添加一个时钟';
        add.addEventListener('click', () => {
          const here = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const unused = opt.picks.filter((z) => !zones.some((entry) => entry.zone === z));
          zones.push({ zone: unused.find((z) => z !== here) || unused[0], name: '' });
          draw();
          commit();
        });
        list.appendChild(add);
      }
    };
    draw();
  }

  const renderGlobalControls = () => renderControls($('globalControls'), GLOBAL_OPTIONS.filter((o) => !(current.face.ownZones && o.key === 'timeZone')), globalsFor(current.face), (key, value) => {
    state.global[key] = value;
    // Choosing an all-clocks value here replaces anything a link set for this clock
    delete (state.clockGlobals[current.face.id] || {})[key];
    forgetLink();
    save();
    if (key === 'timeZone') setupTimeZone(current.face);
    if (key === 'brightness' || key === 'nightDim' || key === 'nightBrightness') return applyDim();
    if (key === 'wakeLock') return applyWakeLock();
    if (key === 'autoHide') return armIdle();
    if (key === 'tickSound') {
      if (!value) return;
      startAudio();
      if (!ticks(current.face)) flashHint('滴答声只在「整秒跳动」的指针时钟上播放');
      return;
    }
    remount();
  });

  $('resetFace').addEventListener('click', () => {
    delete state.faces[current.face.id];
    delete state.clockGlobals[current.face.id];
    forgetLink();
    save();
    setupTimeZone(current.face);
    remount();
    syncChrome();
    applyDim();
  });

  // ---------- sheet ----------

  const sheet = $('sheet');
  const sheetOpen = () => body.classList.contains('sheet-open');
  function openSheet() {
    scrollTo(0, 0);
    body.classList.add('sheet-open');
    sheet.setAttribute('aria-hidden', 'false');
    $('settingsBtn').setAttribute('aria-expanded', 'true');
    showUI();
  }
  function closeSheet() {
    body.classList.remove('sheet-open');
    sheet.setAttribute('aria-hidden', 'true');
    $('settingsBtn').setAttribute('aria-expanded', 'false');
    armIdle();
  }
  $('settingsBtn').addEventListener('click', () => (sheetOpen() ? closeSheet() : openSheet()));
  $('closeSheet').addEventListener('click', closeSheet);

  // ---------- scrolling down to the article ----------

  const scrolled = () => body.classList.contains('scrolled');
  addEventListener('scroll', () => {
    const on = scrollY > 24;
    if (on === scrolled()) return;
    body.classList.toggle('scrolled', on);
    if (on) showUI();
    else armIdle();
  }, { passive: true });

  // ---------- idle hiding ----------

  let idleTimer;
  function showUI() {
    body.classList.remove('ui-hidden');
    armIdle();
  }
  function hideUI() {
    if (sheetOpen() || scrolled()) return;
    body.classList.add('ui-hidden');
  }
  function armIdle() {
    clearTimeout(idleTimer);
    if (state.global.autoHide && !sheetOpen()) idleTimer = setTimeout(hideUI, 3500);
  }
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') showUI();
  });
  $('bar').addEventListener('focusin', showUI);

  // ---------- navigation: buttons, select, keys, tap & swipe ----------

  $('prevBtn').addEventListener('click', () => step(-1));
  $('nextBtn').addEventListener('click', () => step(1));
  // Any face but the current one
  function random() {
    showFace(current.index + 1 + Math.floor(Math.random() * (FACES.length - 1)), 1);
    flashCounter();
  }
  $('randomBtn').addEventListener('click', random);
  $('edgePrev').addEventListener('click', () => step(-1));
  $('edgeNext').addEventListener('click', () => step(1));
  select.addEventListener('change', () => {
    const i = +select.value;
    showFace(i, i > current.index ? 1 : -1);
    select.blur();
  });

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target.tagName;
    const typing = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    if (e.key === 'Escape' && sheetOpen()) return closeSheet();
    if (typing) return;
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight' || (e.key === ' ' && !scrolled())) { e.preventDefault(); step(1); }
    else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    else if (e.key === 'r' || e.key === 'R') random();
    else if (e.key === 'h' || e.key === 'H') toggleFavourite();
    else if (e.key === 's' || e.key === 'S' || e.key === ',') sheetOpen() ? closeSheet() : openSheet();
    else return;
    if (finePointer) showUI();
  });

  let down = null;
  stage.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    down = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  stage.addEventListener('pointercancel', () => (down = null));
  stage.addEventListener('pointerup', (e) => {
    if (!down || down.id !== e.pointerId) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    down = null;
    if (sheetOpen()) return closeSheet();
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) return step(dx < 0 ? 1 : -1);
    if (Math.hypot(dx, dy) > 12) return;
    const x = e.clientX / innerWidth;
    if (x < 0.3) step(-1);
    else if (x > 0.7) step(1);
    else if (e.pointerType !== 'mouse') body.classList.contains('ui-hidden') ? showUI() : hideUI();
  });
  stage.addEventListener('dblclick', toggleFullscreen);

  addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (!id || !FACES.some((f) => f.id === id)) return;
    scrollTo(0, 0);
    if (id !== current.face.id) showFace(indexOf(id));
    else route(current.face);
  });

  // ---------- fullscreen & wake lock ----------

  const docEl = document.documentElement;
  const canFullscreen = !!(docEl.requestFullscreen || docEl.webkitRequestFullscreen);
  const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  function toggleFullscreen() {
    if (!canFullscreen) return;
    if (isFullscreen()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (docEl.requestFullscreen || docEl.webkitRequestFullscreen).call(docEl).catch?.(() => {});
  }
  $('fsBtn').hidden = !canFullscreen;
  $('fsBtn').addEventListener('click', toggleFullscreen);
  const onFsChange = () => {
    body.classList.toggle('is-fullscreen', isFullscreen());
    if (isFullscreen()) scrollTo(0, 0);
  };
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  let wakeLock = null;
  async function applyWakeLock() {
    if (!('wakeLock' in navigator)) return;
    if (state.global.wakeLock && document.visibilityState === 'visible') {
      if (wakeLock) return;
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => (wakeLock = null));
      } catch (e) { /* denied or unsupported */ }
    } else if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  }
  document.addEventListener('visibilitychange', applyWakeLock);

  // ---------- first-visit hint ----------

  function flashHint(text) {
    const hint = $('hint');
    hint.textContent = text;
    hint.hidden = false;
    requestAnimationFrame(() => hint.classList.add('show'));
    clearTimeout(flashHint.timer);
    flashHint.timer = setTimeout(() => {
      hint.classList.remove('show');
      setTimeout(() => (hint.hidden = true), 600);
    }, 4000);
  }

  function showHint() {
    if (state.seenHint || linkView) return;
    const hint = $('hint');
    hint.textContent = finePointer
      ? '用 ← → 或点击屏幕两侧切换表盘'
      : '轻触屏幕左侧或右侧切换表盘';
    hint.hidden = false;
    requestAnimationFrame(() => hint.classList.add('show'));
    setTimeout(() => {
      hint.classList.remove('show');
      setTimeout(() => (hint.hidden = true), 600);
    }, 4200);
    state.seenHint = true;
    save();
  }

  // ---------- settings in the URL ----------

  // Any of a clock's options, plus these all-clocks settings, can go in the query string by key,
  // e.g. /wall-clock/?bg=112233&tz=Asia/Tokyo. Opening a link saves them for that clock only.
  const LINK_GLOBALS = GLOBAL_OPTIONS.filter((o) => ['hour24', 'showSeconds', 'showDate', 'timeZone', 'romanFour', 'brightness'].includes(o.key));
  const linkGlobals = (face) => LINK_GLOBALS.filter((o) => !(face.ownZones && o.key === 'timeZone'));

  function validZone(zone) {
    try { new Intl.DateTimeFormat('en-US', { timeZone: zone }); return true; } catch (e) { return false; }
  }

  // Returns undefined for anything that isn't a valid value for that option.
  function parseOption(opt, raw) {
    if (opt.key === 'timeZone') return validZone(raw) ? raw : undefined;
    if (opt.type === 'zones') {
      const zones = raw.split(',').map((entry) => {
        const [zone, ...name] = entry.split('|');
        return { zone: zone.trim(), name: cleanName(name.join(' ')) };
      }).filter((z) => z.zone === 'local' || (z.zone && validZone(z.zone))).slice(0, opt.max);
      return zones.length ? zones.map((z) => (z.name ? `${z.zone}|${z.name}` : z.zone)).join(',') : undefined;
    }
    if (opt.type === 'color') {
      const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw);
      if (!hex) return undefined;
      const h = hex[1].toLowerCase();
      return '#' + (h.length === 3 ? h.replace(/./g, '$&$&') : h);
    }
    if (opt.type === 'select') return opt.choices.some(([v]) => v === raw) ? raw : undefined;
    if (opt.type === 'toggle') return { 1: true, true: true, on: true, 0: false, false: false, off: false }[raw.toLowerCase()];
    if (opt.type === 'range') {
      const n = Number(raw);
      return raw !== '' && Number.isFinite(n) ? Math.min(opt.max, Math.max(opt.min, n)) : undefined;
    }
    return undefined;
  }

  function applyLink(face) {
    const params = new URLSearchParams(location.search);
    if (params.has('tz') && !params.has('timeZone')) params.set('timeZone', params.get('tz'));
    const apply = (options, target) => {
      for (const opt of options) {
        const value = params.has(opt.key) ? parseOption(opt, params.get(opt.key)) : undefined;
        if (value === undefined) continue;
        target[opt.key] = value;
        linkView = true;
      }
    };
    const faceValues = {}, globalValues = {};
    apply(face.options, faceValues);
    apply(linkGlobals(face), globalValues);
    state.faces[face.id] = Object.assign({}, state.faces[face.id], faceValues);
    state.clockGlobals[face.id] = Object.assign({}, state.clockGlobals[face.id], globalValues);
  }

  // A link to the current clock with everything that differs from its defaults
  function shareUrl() {
    const params = new URLSearchParams();
    const add = (options, values) => {
      for (const opt of options) {
        const value = values[opt.key];
        // The default zones and 12/24-hour time depend on the device, so a link always spells them out
        if (value === undefined || (value === opt.default && opt.type !== 'zones' && opt.key !== 'hour24')) continue;
        if (opt.key === 'timeZone') params.set('tz', value);
        else if (opt.type === 'color') params.set(opt.key, String(value).replace('#', ''));
        else if (opt.type === 'toggle') params.set(opt.key, value ? '1' : '0');
        else params.set(opt.key, value);
      }
    };
    add(current.face.options, faceOpts(current.face));
    add(linkGlobals(current.face), globalsFor(current.face));
    const query = params.toString().replace(/%2F/g, '/').replace(/%2C/g, ',').replace(/%7C/g, '|');
    const hash = ROUTES[current.face.id] || ('#' + current.face.id);
    return location.origin + location.pathname + (query ? '?' + query : '') + hash;
  }

  $('copyLink').addEventListener('click', async (e) => {
    const button = e.currentTarget, label = '复制此表盘链接', url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      button.textContent = '已复制链接';
    } catch (err) {
      prompt('复制此链接：', url);
    }
    clearTimeout(button.timer);
    button.timer = setTimeout(() => (button.textContent = label), 1800);
  });

  // ---------- boot ----------

  const startId = location.hash.slice(1) || body.dataset.face || state.face;
  const startIndex = indexOf(startId);
  applyLink(FACES[startIndex]);
  showFace(startIndex);
  requestAnimationFrame(frame);
  // Once the page has settled, load the fonts and sun data the other clocks use
  const preload = () => (window.requestIdleCallback || setTimeout)(window.ClockFaces.preload);
  if (document.readyState === 'complete') preload();
  else addEventListener('load', preload, { once: true });
  armIdle();
  applyWakeLock();
  showHint();
})();
