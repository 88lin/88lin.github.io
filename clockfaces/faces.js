/*
 * ClockFaces — face registry.
 * Each face: { id, name, group, options: [...], mount(root, opts, global) -> { tick(t) } }
 * `t` = { h, m, s, ms, sec (s + ms/1000), date, dateShort, month }
 * `global` = { hour24, showSeconds, showDate, ... }
 * `host` (4th mount argument) = { clockIn(zone) -> read(), optsFor(face) }, for clocks made of other clocks
 */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let uid = 0;

  // ---------- helpers ----------

  // Filters that paint only a shadow or glow. Safari draws anything that goes through a filter
  // at low resolution on Retina screens, so a live copy carries the filter underneath, and the
  // real shape stays sharp on top.
  const underlays = new Set();

  function s(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    const under = attrs && underlays.has(attrs.filter) ? attrs.filter : null;
    if (attrs) for (const k in attrs) if (attrs[k] != null && !(under && k === 'filter')) n.setAttribute(k, attrs[k]);
    if (under) {
      n.id = 'cf-u' + ++uid;
      const copy = s('use', { href: '#' + n.id }, parent);
      copy.setAttribute('filter', under);
    }
    if (parent) parent.appendChild(n);
    return n;
  }

  function el(tag, cls, parent, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  // Shows a number without the layout shifting as it changes, even in fonts with uneven digit
  // widths. Each slot stacks all ten digits and reveals one, so it's always as wide as the
  // font's widest digit, including after a web font loads. Returns a setter.
  function steadyDigits(parent) {
    let slots = [];
    return (text) => {
      if (slots.length !== text.length) {
        parent.replaceChildren();
        slots = Array.from(text, () => {
          const slot = el('span', 'digit-slot', parent);
          return Array.from('0123456789', (d) => el('span', null, slot, d));
        });
      }
      Array.from(text).forEach((c, i) => slots[i].forEach((n, d) => n.classList.toggle('on', String(d) === c)));
    };
  }

  const pad = (n) => String(n).padStart(2, '0');
  const h12 = (h) => h % 12 || 12;
  const ampm = (h) => (h < 12 ? 'AM' : 'PM');
  const hourText = (h, g, zero) => (g.hour24 ? pad(h) : zero ? pad(h12(h)) : String(h12(h)));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function polar(deg, r) {
    const a = ((deg - 90) * Math.PI) / 180;
    return [+(Math.cos(a) * r).toFixed(3), +(Math.sin(a) * r).toFixed(3)];
  }

  const rot = (node, deg) => node.setAttribute('transform', `rotate(${deg.toFixed(3)})`);

  // Returns a function that is true only when `key` differs from the last call.
  function gate() {
    let last;
    return (key) => (key === last ? false : ((last = key), true));
  }

  function hexToRgb(hex) {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function mix(a, b, p) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return '#' + A.map((c, i) => Math.round(c + (B[i] - c) * p).toString(16).padStart(2, '0')).join('');
  }

  // ---------- fonts (loaded lazily from Google Fonts) ----------

  const FONTS = {
    system: ['System', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'],
    inter: ['Inter', '"Inter", sans-serif', 'Inter:wght@100..900'],
    grotesk: ['Space Grotesk', '"Space Grotesk", sans-serif', 'Space+Grotesk:wght@300..700'],
    oswald: ['Oswald', '"Oswald", sans-serif', 'Oswald:wght@200..700'],
    bebas: ['Bebas Neue', '"Bebas Neue", sans-serif', 'Bebas+Neue'],
    nunito: ['Nunito', '"Nunito", sans-serif', 'Nunito:wght@200..1000'],
    playfair: ['Playfair Display', '"Playfair Display", serif', 'Playfair+Display:wght@400..900'],
    fraunces: ['Fraunces', '"Fraunces", serif', 'Fraunces:opsz,wght@9..144,100..900'],
    mono: ['JetBrains Mono', '"JetBrains Mono", monospace', 'JetBrains+Mono:wght@100..800'],
    orbitron: ['Orbitron', '"Orbitron", sans-serif', 'Orbitron:wght@400..900'],
    vt323: ['VT323', '"VT323", monospace', 'VT323'],
    pixel: ['Press Start 2P', '"Press Start 2P", monospace', 'Press+Start+2P'],
    tiltneon: ['Tilt Neon', '"Tilt Neon", sans-serif', 'Tilt+Neon'],
    monoton: ['Monoton', '"Monoton", sans-serif', 'Monoton'],
    nixie: ['Nixie One', '"Nixie One", serif', 'Nixie+One'],
    cinzel: ['Cinzel', '"Cinzel", serif', 'Cinzel:wght@400..900'],
    fredoka: ['Fredoka', '"Fredoka", sans-serif', 'Fredoka:wght@300..700'],
  };

  const loadedFonts = new Set();
  function font(key) {
    // 字体由本地 fonts.css 统一定义，不再请求 Google Fonts
    const f = FONTS[key] || FONTS.system;
    return f[1];
  }
  const fontChoices = (keys) => keys.map((k) => [k, FONTS[k][0]]);

  // 提前触发本地字体加载，切换表盘时不用等字体
  function preloadFonts() {
    Object.keys(FONTS).forEach((k) => {
      const f = FONTS[k];
      if (!f[2] || loadedFonts.has(k)) return;
      loadedFonts.add(k);
      const family = f[1].split(',')[0].trim();
      document.fonts.load('16px ' + family).catch(() => {});
    });
  }

  // ---------- option builders ----------

  const color = (key, label, def) => ({ key, label, type: 'color', default: def });
  const choice = (key, label, def, choices) => ({ key, label, type: 'select', default: def, choices });
  const toggle = (key, label, def) => ({ key, label, type: 'toggle', default: def });
  const motion = (def = 'smooth', label = 'Second hand motion') => choice('sweep', label, def, [['smooth', 'Smooth'], ['tick', 'Instant tick']]);
  const secOf = (t, o) => (o.sweep === 'smooth' ? t.sec : t.s);
  const range = (key, label, def, min, max, step = 1) => ({ key, label, type: 'range', default: def, min, max, step });

  // ---------- shared SVG pieces ----------

  // Filter regions are in user space, not relative to the element's bounding box: a straight
  // line's box has zero width or height, which would make a hand vanish at 12, 3, 6 and 9
  const FILTER_REGION = { filterUnits: 'userSpaceOnUse', x: -1000, y: -1000, width: 2000, height: 2000 };

  function shadowFilter(svg, opacity = 0.35) {
    const id = 'cf-sh' + ++uid;
    const f = s('filter', { id, ...FILTER_REGION }, s('defs', null, svg));
    s('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: 1.4 }, f);
    s('feOffset', { dy: 1.6 }, f);
    s('feFuncA', { type: 'linear', slope: opacity }, s('feComponentTransfer', null, f));
    underlays.add(`url(#${id})`);
    return `url(#${id})`;
  }

  function glowFilter(svg, amount = 2.5) {
    const id = 'cf-gl' + ++uid;
    const f = s('filter', { id, ...FILTER_REGION }, s('defs', null, svg));
    s('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: amount }, f);
    underlays.add(`url(#${id})`);
    return `url(#${id})`;
  }

  // A rotating group inside a non-rotating one, so drop shadows keep pointing down.
  function handGroup(parent, filter) {
    return s('g', null, s('g', filter ? { filter } : null, parent));
  }

  function hand(parent, d, fill, filter) {
    const g = handGroup(parent, filter);
    s('path', { d, fill }, g);
    return g;
  }

  const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  // Four follows the "Roman numeral four" setting under All clocks
  const romanHour = (i, g) => (i === 4 ? g.romanFour : ROMAN[i]);

  // =====================================================================
  // ANALOG
  // =====================================================================

  const classic = {
    id: 'classic', name: 'Classic', group: 'Analog',
    options: [
      color('bg', 'Background', '#1c1e23'),
      color('dial', 'Dial', '#f5f2ea'),
      color('rim', 'Rim', '#34373e'),
      color('ink', 'Markings', '#1f1f22'),
      color('hands', 'Hands', '#1f1f22'),
      color('second', 'Second hand', '#d63a2f'),
      choice('numerals', 'Numerals', 'arabic', [['arabic', 'Arabic (1–12)'], ['roman', 'Roman (I–XII)'], ['quarters', 'Quarters only'], ['none', 'None']]),
      choice('markers', 'Markers', 'minutes', [['minutes', 'Minute ticks'], ['hours', 'Hour ticks'], ['dots', 'Dots'], ['none', 'None']]),
      choice('font', 'Numeral font', 'system', fontChoices(['system', 'inter', 'playfair', 'fraunces', 'oswald', 'mono'])),
      motion(),
      range('rimWidth', 'Rim width', 6, 0, 14),
      toggle('shadow', 'Hand shadows', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const sh = o.shadow ? shadowFilter(v) : null;
      const rw = +o.rimWidth;
      s('circle', { r: 97 - rw / 2, fill: o.dial, stroke: o.rim, 'stroke-width': rw }, v);

      const R = 92 - rw;
      for (let i = 0; i < 60; i++) {
        const hr = i % 5 === 0;
        if (o.markers === 'minutes' || (o.markers === 'hours' && hr)) {
          const [x1, y1] = polar(i * 6, R), [x2, y2] = polar(i * 6, R - (hr ? 11 : 4));
          s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': hr ? 2.6 : 0.9 }, v);
        } else if (o.markers === 'dots') {
          const [cx, cy] = polar(i * 6, R - 3);
          s('circle', { cx, cy, r: hr ? 2.3 : 0.8, fill: o.ink }, v);
        }
      }

      const NR = o.markers === 'none' ? R - 11 : R - 25;
      if (o.numerals !== 'none') {
        const size = o.numerals === 'roman' ? 12 : o.numerals === 'quarters' ? 20 : 15;
        for (let i = 0; i < 12; i++) {
          if (o.numerals === 'quarters' && i % 3) continue;
          const [x, y] = polar(i * 30, NR);
          s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': size, 'font-family': font(o.font), 'font-weight': 500 }, v)
            .textContent = o.numerals === 'roman' ? romanHour(i, g) : String(i || 12);
        }
      }

      const dateText = g.showDate
        ? s('text', { y: 40, fill: o.ink, opacity: 0.7, 'text-anchor': 'middle', 'font-size': 7, 'letter-spacing': 1, 'font-family': font(o.font), 'font-weight': 600 }, v)
        : null;

      const hourH = hand(v, 'M-3.4 12 L-2.4 -46 L0 -50 L2.4 -46 L3.4 12Z', o.hands, sh);
      const minH = hand(v, `M-2.5 14 L-1.6 ${7 - R} L0 ${3 - R} L1.6 ${7 - R} L2.5 14Z`, o.hands, sh);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, sh);
        s('line', { y1: 22, y2: 1 - R, stroke: o.second, 'stroke-width': 1.2, 'stroke-linecap': 'round' }, secH);
        s('rect', { x: -2, y: 12, width: 4, height: 12, rx: 2, fill: o.second }, secH);
      }
      s('circle', { r: 4.2, fill: o.hands }, v);
      s('circle', { r: secH ? 2.2 : 1.4, fill: secH ? o.second : o.dial }, v);

      const dateGate = gate();
      return {
        tick(t) {
          const sec = secOf(t, o);
          const min = t.m + sec / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          if (secH) rot(secH, sec * 6);
          if (dateText && dateGate(t.dateShort)) dateText.textContent = t.dateShort;
        },
      };
    },
  };

  const minimal = {
    id: 'minimal', name: 'Minimal', group: 'Analog',
    options: [
      color('bg', 'Background', '#e8e4dc'),
      color('dial', 'Dial', '#f6f4ef'),
      color('hands', 'Hands', '#161616'),
      color('accent', 'Accent', '#ff5a1f'),
      choice('shape', 'Dial shape', 'circle', [['circle', 'Circle'], ['squircle', 'Rounded square'], ['none', 'No dial']]),
      choice('markers', 'Markers', 'quarters', [['none', 'None'], ['quarters', 'Quarters'], ['hours', 'Every hour']]),
      range('weight', 'Hand weight', 7, 2, 12),
      toggle('shadow', 'Soft shadow', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const sh = o.shadow ? shadowFilter(v, 0.18) : null;
      if (o.shape === 'circle') s('circle', { r: 92, fill: o.dial, filter: sh }, v);
      if (o.shape === 'squircle') s('rect', { x: -90, y: -90, width: 180, height: 180, rx: 48, fill: o.dial, filter: sh }, v);

      const w = +o.weight;
      if (o.markers !== 'none') {
        for (let i = 0; i < 12; i++) {
          const q = i % 3 === 0;
          if (o.markers === 'quarters' && !q) continue;
          const outer = o.shape === 'squircle' ? 80 / Math.max(Math.abs(Math.cos((i * Math.PI) / 6)), Math.abs(Math.sin((i * Math.PI) / 6))) * 0.94 : 80;
          const [x1, y1] = polar(i * 30, Math.min(outer, 84)), [x2, y2] = polar(i * 30, Math.min(outer, 84) - (q ? 12 : 6));
          s('line', { x1, y1, x2, y2, stroke: o.hands, 'stroke-width': q ? w * 0.55 : w * 0.35, 'stroke-linecap': 'round', opacity: q ? 1 : 0.55 }, v);
        }
      }

      const line = (len, width, colour, tail = 0) => {
        const grp = handGroup(v, sh);
        s('line', { y1: tail, y2: -len, stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round' }, grp);
        return grp;
      };
      const hourH = line(48, w, o.hands);
      const minH = line(78, w * 0.7, o.hands);
      const secH = g.showSeconds ? line(84, 1.6, o.accent, 16) : null;
      s('circle', { r: w * 0.62, fill: o.hands }, v);
      s('circle', { r: 2, fill: o.accent }, v);

      return {
        tick(t) {
          const sec = secOf(t, o);
          const min = t.m + sec / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          if (secH) rot(secH, sec * 6);
        },
      };
    },
  };

  const station = {
    id: 'station', name: 'Station', group: 'Analog',
    options: [
      color('bg', 'Background', '#d7d9dc'),
      color('dial', 'Dial', '#ffffff'),
      color('rim', 'Rim', '#8f939a'),
      color('ink', 'Markers & hands', '#111111'),
      color('second', 'Second hand', '#f05a28'),
      toggle('numerals', 'Numerals', true),
      toggle('stop', 'Pause at 12', true),
      toggle('shadow', 'Hand shadows', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const sh = o.shadow ? shadowFilter(v, 0.28) : null;
      s('circle', { r: 95, fill: o.dial, stroke: o.rim, 'stroke-width': 5 }, v);
      for (let i = 0; i < 60; i++) {
        // tapered wedges for hours, short dashes for minutes
        const d = i % 5 === 0 ? 'M-3.4 -89 L3.4 -89 L2.2 -73 L-2.2 -73Z' : 'M-0.9 -89 L0.9 -89 L0.9 -84 L-0.9 -84Z';
        s('path', { d, fill: o.ink, transform: `rotate(${i * 6})` }, v);
      }
      if (o.numerals) {
        for (let i = 0; i < 12; i++) {
          const [x, y] = polar(i * 30, 61);
          s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 11, 'font-weight': 600, 'font-family': font('inter') }, v)
            .textContent = String(i || 12);
        }
      }
      const hourH = hand(v, 'M-5 18 L-5 -47 L0 -55 L5 -47 L5 18Z', o.ink, sh);
      const minH = hand(v, 'M-3.6 20 L-3.6 -76 L0 -85 L3.6 -76 L3.6 20Z', o.ink, sh);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, sh);
        // A slim tapered needle with a small arrowhead tail
        s('path', { d: 'M-1.1 16 L-0.35 -86 L0.35 -86 L1.1 16Z', fill: o.second }, secH);
        s('path', { d: 'M0 14 L4 28 L0 25 L-4 28Z', fill: o.second }, secH);
        s('circle', { r: 2.6, fill: o.second }, secH);
      }
      return {
        tick(t) {
          const sec = o.sweep === 'tick' ? t.s : o.stop ? Math.min(t.sec / 58.5, 1) * 60 : t.sec;
          const min = o.stop ? t.m : t.m + t.sec / 60;
          rot(hourH, ((t.h % 12) + (t.m + t.sec / 60) / 60) * 30);
          rot(minH, min * 6);
          if (secH) rot(secH, sec * 6);
        },
      };
    },
  };

  const METALS = {
    gold: ['#6e4f17', '#d9b25c', '#fff0b5'],
    silver: ['#62666e', '#c4c9d1', '#ffffff'],
    rose: ['#74402c', '#d39a82', '#ffe2d4'],
    gunmetal: ['#16171a', '#44474e', '#8d919a'],
  };
  const DIALS = {
    cream: ['#f2e8cf', '#2b2418'],
    white: ['#fbfaf6', '#1b1b1b'],
    black: ['#151515', '#e9dfc4'],
    blue: ['#1b2b4e', '#efe6cc'],
    green: ['#1e3a2d', '#efe6cc'],
  };

  const pocket = {
    id: 'pocket', name: 'Pocket Watch', group: 'Analog',
    options: [
      color('bg', 'Background', '#1e1a16'),
      choice('metal', 'Case', 'gold', [['gold', 'Gold'], ['silver', 'Silver'], ['rose', 'Rose gold'], ['gunmetal', 'Gunmetal']]),
      choice('dial', 'Dial', 'cream', [['cream', 'Cream'], ['white', 'White'], ['black', 'Black'], ['blue', 'Navy'], ['green', 'Racing green']]),
      color('hands', 'Hands', '#1d2c6e'),
      choice('numerals', 'Numerals', 'roman', [['roman', 'Roman'], ['arabic', 'Arabic']]),
      choice('font', 'Numeral font', 'playfair', fontChoices(['playfair', 'fraunces', 'system', 'oswald'])),
      toggle('subSeconds', 'Small seconds dial', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = `radial-gradient(circle at 50% 45%, ${mix(o.bg, '#ffffff', 0.08)}, ${o.bg} 70%)`;
      const [dark, mid, light] = METALS[o.metal] || METALS.gold;
      const [dialC, ink] = DIALS[o.dial] || DIALS.cream;
      const v = s('svg', { viewBox: '-106 -134 212 242', class: 'cf-svg' }, root);
      const defs = s('defs', null, v);
      const gid = 'cf-metal' + ++uid;
      const grad = s('radialGradient', { id: gid, cx: '35%', cy: '30%', r: '80%' }, defs);
      s('stop', { offset: '0%', 'stop-color': light }, grad);
      s('stop', { offset: '45%', 'stop-color': mid }, grad);
      s('stop', { offset: '100%', 'stop-color': dark }, grad);
      const metal = `url(#${gid})`;
      const sh = shadowFilter(v, 0.3);

      // bow, crown, pendant
      s('circle', { cy: -119, r: 11, fill: 'none', stroke: metal, 'stroke-width': 4.5 }, v);
      s('rect', { x: -9, y: -111, width: 18, height: 13, rx: 3, fill: metal }, v);
      for (let x = -6; x <= 6; x += 3) s('line', { x1: x, y1: -110, x2: x, y2: -99, stroke: dark, 'stroke-width': 0.6, opacity: 0.6 }, v);
      s('rect', { x: -5, y: -100, width: 10, height: 6, fill: metal }, v);

      // case
      s('circle', { r: 99, fill: metal, filter: sh }, v);
      s('circle', { r: 92, fill: 'none', stroke: dark, 'stroke-width': 1, opacity: 0.5 }, v);
      s('circle', { r: 88, fill: dialC }, v);

      // chapter ring
      s('circle', { r: 81, fill: 'none', stroke: ink, 'stroke-width': 0.6 }, v);
      s('circle', { r: 75, fill: 'none', stroke: ink, 'stroke-width': 0.6 }, v);
      for (let i = 0; i < 60; i++) {
        const [x1, y1] = polar(i * 6, 81), [x2, y2] = polar(i * 6, 75);
        s('line', { x1, y1, x2, y2, stroke: ink, 'stroke-width': i % 5 ? 0.5 : 1.6 }, v);
      }
      for (let i = 0; i < 12; i++) {
        const [x, y] = polar(i * 30, 62);
        s('text', { x, y, fill: ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': o.numerals === 'roman' ? 13 : 16, 'font-family': font(o.font), 'font-weight': 500 }, v)
          .textContent = o.numerals === 'roman' ? romanHour(i, g) : String(i || 12);
      }

      const dateText = g.showDate
        ? s('text', { y: -30, fill: ink, opacity: 0.75, 'text-anchor': 'middle', 'font-size': 6.5, 'letter-spacing': 1.2, 'font-family': font(o.font) }, v)
        : null;

      let subH = null;
      if (o.subSeconds && g.showSeconds) {
        const sub = s('g', { transform: 'translate(0 38)' }, v);
        s('circle', { r: 16, fill: 'none', stroke: ink, 'stroke-width': 0.5 }, sub);
        for (let i = 0; i < 60; i++) {
          const [x1, y1] = polar(i * 6, 16), [x2, y2] = polar(i * 6, i % 5 ? 14.5 : 13);
          s('line', { x1, y1, x2, y2, stroke: ink, 'stroke-width': i % 5 ? 0.3 : 0.6 }, sub);
        }
        subH = s('g', null, sub);
        s('line', { y1: 3, y2: -14, stroke: o.hands, 'stroke-width': 0.9 }, subH);
        s('circle', { r: 1.4, fill: o.hands }, sub);
      }

      const breguet = (shaft, ringY, ringR, tip, w) => {
        const grp = handGroup(v, shadowFilter(v, 0.25));
        s('path', { d: `M${-w} 10 L${-w * 0.65} ${shaft} L${w * 0.65} ${shaft} L${w} 10Z`, fill: o.hands }, grp);
        s('circle', { cy: ringY, r: ringR, fill: 'none', stroke: o.hands, 'stroke-width': w * 0.9 }, grp);
        s('path', { d: `M${-w * 0.65} ${ringY - ringR} L0 ${tip} L${w * 0.65} ${ringY - ringR}Z`, fill: o.hands }, grp);
        return grp;
      };
      const hourH = breguet(-27, -32, 4.6, -47, 1.9);
      const minH = breguet(-52, -57, 3.6, -78, 1.5);
      s('circle', { r: 3.4, fill: o.hands }, v);
      s('circle', { r: 1.2, fill: mid }, v);

      const dateGate = gate();
      return {
        tick(t) {
          const min = t.m + t.s / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          // mechanical movements beat several times a second
          if (subH) rot(subH, (o.sweep === 'smooth' ? Math.floor(t.sec * 6) / 6 : t.s) * 6);
          if (dateText && dateGate(t.dateShort)) dateText.textContent = t.dateShort;
        },
      };
    },
  };

  const rings = {
    id: 'rings', name: 'Rings', group: 'Analog',
    options: [
      color('bg', 'Background', '#14110f'),
      color('c1', 'Hours ring', '#ff7a45'),
      color('c2', 'Minutes ring', '#ffc94d'),
      color('c3', 'Seconds ring', '#e9e3d6'),
      color('text', 'Text', '#f6f1e7'),
      range('thickness', 'Ring thickness', 10, 4, 16),
      range('track', 'Track visibility', 14, 0, 40),
      choice('ends', 'Ring ends', 'flat', [['flat', 'Flat'], ['round', 'Rounded']]),
      toggle('markers', 'Hour markers', true),
      toggle('labels', 'Ring labels (H · M · S)', true),
      choice('center', 'Centre', 'time', [['time', 'Digital time'], ['date', 'Date'], ['none', 'Nothing']]),
      choice('font', 'Font', 'grotesk', fontChoices(['grotesk', 'inter', 'system', 'mono', 'orbitron', 'nunito'])),
      motion('smooth', 'Seconds ring motion'),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const th = +o.thickness;
      if (o.markers) {
        for (let i = 0; i < 12; i++) {
          const q = i % 3 === 0;
          const [x1, y1] = polar(i * 30, 97), [x2, y2] = polar(i * 30, q ? 90 : 92.5);
          s('line', { x1, y1, x2, y2, stroke: o.text, 'stroke-width': q ? 1.8 : 1, 'stroke-opacity': q ? 0.7 : 0.4, 'stroke-linecap': 'round' }, v);
        }
      }
      const defs = [['h', o.c1, 'H'], ['m', o.c2, 'M']];
      if (g.showSeconds) defs.push(['s', o.c3, 'S']);
      let r = (o.markers ? 86 : 94) - th / 2;
      const arcs = {};
      for (const [k, c, label] of defs) {
        s('circle', { r, fill: 'none', stroke: c, 'stroke-width': th, 'stroke-opacity': o.track / 100 }, v);
        const C = 2 * Math.PI * r;
        arcs[k] = { C, node: s('circle', { r, fill: 'none', stroke: c, 'stroke-width': th, 'stroke-linecap': o.ends === 'round' ? 'round' : 'butt', transform: 'rotate(-90)', 'stroke-dasharray': `0 ${C}` }, v) };
        if (o.labels) {
          // sits on the track just left of 12, where each ring starts and ends
          const [x, y] = polar(-(th * 0.9 / r) * (180 / Math.PI), r);
          s('text', { x, y, fill: c, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': Math.max(4, th * 0.62), 'font-weight': 700, 'font-family': font(o.font), 'paint-order': 'stroke', stroke: o.bg, 'stroke-width': 2.5 }, v)
            .textContent = label;
        }
        r -= th * 1.4;
      }
      r += th * 1.4;
      const inner = r - th / 2;
      let main = null, sub = null;
      if (o.center !== 'none') {
        const ff = font(o.font);
        main = s('text', { y: o.center === 'time' ? -inner * 0.04 : 0, fill: o.text, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': inner * (o.center === 'time' ? 0.44 : 0.2), 'font-family': ff, 'font-weight': 600, style: 'font-variant-numeric: tabular-nums' }, v);
        if (o.center === 'time') sub = s('text', { y: inner * 0.38, fill: o.text, opacity: 0.55, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': inner * 0.14, 'font-family': ff, 'font-weight': 500, 'letter-spacing': 1 }, v);
      }
      const set = (k, p) => arcs[k] && arcs[k].node.setAttribute('stroke-dasharray', `${(p * arcs[k].C).toFixed(2)} ${arcs[k].C}`);
      const textGate = gate();
      return {
        tick(t) {
          // Always over 12 hours, to match the 12 marks on the dial, even with 24-hour digits
          set('h', ((t.h % 12) + t.m / 60) / 12);
          set('m', (t.m + t.sec / 60) / 60);
          set('s', secOf(t, o) / 60);
          if (main && textGate(t.s + t.date)) {
            if (o.center === 'date') main.textContent = t.date;
            else {
              main.textContent = `${hourText(t.h, g)}:${pad(t.m)}`;
              const bits = [];
              if (g.showSeconds) bits.push(pad(t.s));
              if (!g.hour24) bits.push(ampm(t.h));
              if (g.showDate) bits.push(t.dateShort);
              sub.textContent = bits.join(' · ');
            }
          }
        },
      };
    },
  };

  // =====================================================================
  // DIGITAL
  // =====================================================================

  const bigtype = {
    id: 'bigtype', name: 'Big Type', group: 'Digital',
    options: [
      color('bg', 'Background', '#0f0f11'),
      color('color', 'Time', '#f4f4f5'),
      color('accent', 'Seconds & date', '#7d7d86'),
      choice('font', 'Font', 'inter', fontChoices(['inter', 'grotesk', 'system', 'bebas', 'oswald', 'nunito', 'playfair', 'fraunces', 'mono', 'orbitron'])),
      range('weight', 'Weight', 600, 100, 900, 100),
      range('tracking', 'Letter spacing', -3, -10, 10),
      choice('layout', 'Layout', 'inline', [['inline', 'Side by side'], ['stacked', 'Stacked']]),
      toggle('blink', 'Blinking colon', false),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const wrap = el('div', `bt bt-${o.layout}`, root);
      Object.assign(wrap.style, { fontFamily: font(o.font), fontWeight: o.weight, color: o.color, letterSpacing: o.tracking / 100 + 'em' });
      wrap.style.setProperty('--accent', o.accent);
      const time = el('div', 'bt-time', wrap);
      const hh = steadyDigits(el('span', 'bt-h', time));
      const colon = el('span', 'bt-colon', time, ':');
      const mm = steadyDigits(el('span', 'bt-m', time));
      const side = el('span', 'bt-side', time);
      const ss = g.showSeconds ? steadyDigits(el('span', 'bt-s', side)) : null;
      const ap = !g.hour24 ? el('span', 'bt-ap', side) : null;
      if (!ss && !ap) side.remove();
      const date = g.showDate ? el('div', 'bt-date', wrap) : null;
      const sec = gate();
      return {
        tick(t) {
          if (o.blink) colon.style.opacity = t.ms < 500 ? 1 : 0.15;
          if (!sec(t.s)) return;
          hh(hourText(t.h, g, o.layout === 'stacked'));
          mm(pad(t.m));
          if (ss) ss(pad(t.s));
          if (ap) ap.textContent = ampm(t.h);
          if (date) date.textContent = t.date;
        },
      };
    },
  };

  const flip = {
    id: 'flip', name: 'Flip Clock', group: 'Digital',
    options: [
      color('bg', 'Background', '#050505'),
      color('card', 'Cards', '#1c1c1e'),
      color('digit', 'Digits', '#e9e9eb'),
      choice('font', 'Font', 'inter', fontChoices(['inter', 'grotesk', 'system', 'bebas', 'oswald', 'mono', 'playfair', 'orbitron'])),
      range('radius', 'Corner radius', 8, 0, 24),
      toggle('ampm', 'Show AM / PM', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const outer = el('div', 'flip-wrap', root);
      const wrap = el('div', 'flip', outer);
      const n = g.showSeconds ? 3 : 2;
      wrap.style.setProperty('--n', n);
      wrap.style.setProperty('--cardbg', o.card);
      wrap.style.setProperty('--digit', o.digit);
      wrap.style.setProperty('--bg', o.bg);
      wrap.style.setProperty('--r', `calc(var(--card) * ${o.radius / 100})`);
      wrap.style.fontFamily = font(o.font);

      const half = (parent, cls) => {
        const h = el('div', 'half ' + cls, parent);
        return { el: h, span: el('span', null, h) };
      };
      const card = () => {
        const c = el('div', 'fc', wrap);
        const top = half(c, 'top'), bottom = half(c, 'bottom');
        let val = null;
        return {
          el: c,
          set(v, animate) {
            if (v === val) return;
            const old = val;
            val = v;
            top.span.textContent = v;
            if (!animate || old == null || reduceMotion) { bottom.span.textContent = v; return; }
            const ft = half(c, 'top flap'), fb = half(c, 'bottom flap');
            ft.span.textContent = old;
            fb.span.textContent = v;
            fb.el.addEventListener('animationend', () => { bottom.span.textContent = v; ft.el.remove(); fb.el.remove(); }, { once: true });
          },
        };
      };
      const cards = Array.from({ length: n }, card);
      const ap = !g.hour24 && o.ampm ? el('span', 'fc-ampm', cards[0].el) : null;
      const date = g.showDate ? el('div', 'flip-date', outer) : null;
      if (date) Object.assign(date.style, { fontFamily: wrap.style.fontFamily, color: o.digit });
      const sec = gate();
      let first = true;
      return {
        tick(t) {
          if (!sec(t.s)) return;
          const vals = [hourText(t.h, g), pad(t.m), pad(t.s)];
          cards.forEach((c, i) => c.set(vals[i], !first));
          if (ap) ap.textContent = ampm(t.h);
          if (date) date.textContent = t.date;
          first = false;
        },
      };
    },
  };

  // Seven-segment geometry (digit box 56 × 100)
  const SEG = (() => {
    const W = 56, H = 100, T = 11, G = 1.8, h = T / 2;
    const hs = (y, x1, x2) => `${x1},${y} ${x1 + h},${y - h} ${x2 - h},${y - h} ${x2},${y} ${x2 - h},${y + h} ${x1 + h},${y + h}`;
    const vs = (x, y1, y2) => `${x},${y1} ${x + h},${y1 + h} ${x + h},${y2 - h} ${x},${y2} ${x - h},${y2 - h} ${x - h},${y1 + h}`;
    return {
      a: hs(h, h + G, W - h - G), g: hs(H / 2, h + G, W - h - G), d: hs(H - h, h + G, W - h - G),
      f: vs(h, h + G, H / 2 - G), b: vs(W - h, h + G, H / 2 - G),
      e: vs(h, H / 2 + G, H - h - G), c: vs(W - h, H / 2 + G, H - h - G),
    };
  })();
  const SEG_DIGITS = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];

  const lcd = {
    id: 'lcd', name: 'LED Segments', group: 'Digital',
    options: [
      color('bg', 'Background', '#0a0a0a'),
      color('on', 'Segments', '#ff2b2b'),
      range('ghost', 'Unlit segments', 7, 0, 30),
      range('slant', 'Slant', 7, 0, 15),
      toggle('glow', 'Glow', true),
      toggle('blink', 'Blinking colon', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { class: 'cf-svg cf-wide' }, root);
      const glow = o.glow ? glowFilter(v, 2.6) : null;
      const k = Math.tan((o.slant * Math.PI) / 180);
      const grp = s('g', { filter: glow }, v);
      const inner = s('g', { transform: `translate(${k * 100} 0) skewX(${-o.slant})` }, grp);
      const ghost = o.ghost / 100;
      const digits = [], colons = [];
      let x = 0;
      const addDigit = () => {
        const dg = s('g', { transform: `translate(${x} 0)` }, inner);
        const segs = {};
        for (const key in SEG) segs[key] = s('polygon', { points: SEG[key], fill: o.on, 'fill-opacity': ghost }, dg);
        digits.push(segs);
        x += 56 + 12;
      };
      const addColon = () => {
        const cg = s('g', null, inner);
        s('rect', { x: x + 1, y: 25, width: 11, height: 11, fill: o.on }, cg);
        s('rect', { x: x + 1, y: 64, width: 11, height: 11, fill: o.on }, cg);
        colons.push(cg);
        x += 13 + 12;
      };
      addDigit(); addDigit(); addColon(); addDigit(); addDigit();
      if (g.showSeconds) { addColon(); addDigit(); addDigit(); }
      let am = null, pm = null;
      if (!g.hour24) {
        const t = { 'font-size': 20, 'font-weight': 700, 'font-family': 'Arial, sans-serif', fill: o.on };
        am = s('text', Object.assign({ x: x + 2, y: 28 }, t), inner); am.textContent = 'AM';
        pm = s('text', Object.assign({ x: x + 2, y: 54 }, t), inner); pm.textContent = 'PM';
        x += 44;
      }
      let dateT = null;
      const height = g.showDate ? 140 : 100;
      if (g.showDate) dateT = s('text', { x: (x - 12) / 2 + k * 50, y: 132, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, 'letter-spacing': 6, 'font-family': 'Arial, sans-serif', fill: o.on, opacity: 0.85 }, grp);
      const width = x - 12 + k * 100;
      v.setAttribute('viewBox', `-12 -12 ${width + 24} ${height + 24}`);

      const setDigit = (segs, ch) => {
        const on = ch === ' ' ? '' : SEG_DIGITS[+ch];
        for (const key in segs) segs[key].setAttribute('fill-opacity', on.includes(key) ? 1 : ghost);
      };
      const sec = gate();
      return {
        tick(t) {
          const lit = !o.blink || t.ms < 500;
          colons.forEach((c) => c.setAttribute('fill-opacity', lit ? 1 : ghost));
          if (!sec(t.s)) return;
          const str = (g.hour24 ? pad(t.h) : String(h12(t.h)).padStart(2, ' ')) + pad(t.m) + pad(t.s);
          digits.forEach((d, i) => setDigit(d, str[i]));
          if (am) { am.setAttribute('fill-opacity', t.h < 12 ? 1 : ghost); pm.setAttribute('fill-opacity', t.h < 12 ? ghost : 1); }
          if (dateT) dateT.textContent = t.dateShort;
        },
      };
    },
  };

  // 5×7 dot-matrix font
  const DOT_FONT = {
    0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    3: ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
    4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
    ':': ['0', '0', '1', '0', '1', '0', '0'],
  };

  const dotmatrix = {
    id: 'dotmatrix', name: 'Dot Matrix', group: 'Digital',
    options: [
      color('bg', 'Background', '#060606'),
      color('on', 'Lit dots', '#ffb000'),
      range('off', 'Unlit dots', 9, 0, 30),
      choice('shape', 'Dot shape', 'round', [['round', 'Round'], ['square', 'Square']]),
      range('size', 'Dot size', 78, 40, 100),
      toggle('glow', 'Glow', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const layout = g.showSeconds ? 'dd:dd:dd' : 'dd:dd';
      const cols = [];
      [...layout].forEach((c, i) => {
        if (i) cols.push(null); // spacer column
        const w = c === ':' ? 1 : 5;
        for (let j = 0; j < w; j++) cols.push({ ch: i, col: j });
      });
      const v = s('svg', { class: 'cf-svg cf-wide', viewBox: `-6 -6 ${cols.length * 10 + 2} ${7 * 10 + 2}` }, root);
      const grp = s('g', { filter: o.glow ? glowFilter(v, 1.6) : null }, v);
      const d = (o.size / 100) * 9;
      const dots = cols.map((c, x) =>
        Array.from({ length: 7 }, (_, y) =>
          o.shape === 'round'
            ? s('circle', { cx: x * 10 + 5, cy: y * 10 + 5, r: d / 2, fill: o.on, 'fill-opacity': o.off / 100 }, grp)
            : s('rect', { x: x * 10 + 5 - d / 2, y: y * 10 + 5 - d / 2, width: d, height: d, fill: o.on, 'fill-opacity': o.off / 100 }, grp)
        )
      );
      const sec = gate();
      return {
        tick(t) {
          if (!sec(t.s)) return;
          const digits = (g.hour24 ? pad(t.h) : String(h12(t.h)).padStart(2, ' ')) + pad(t.m) + pad(t.s);
          let di = 0;
          const chars = [...layout].map((c) => (c === ':' ? ':' : digits[di++]));
          cols.forEach((c, x) => {
            for (let y = 0; y < 7; y++) {
              const on = c && DOT_FONT[chars[c.ch]][y][c.col] === '1';
              dots[x][y].setAttribute('fill-opacity', on ? 1 : o.off / 100);
            }
          });
        },
      };
    },
  };

  const nixie = {
    id: 'nixie', name: 'Nixie Tubes', group: 'Digital',
    options: [
      color('bg', 'Background', '#120e0b'),
      color('glow', 'Glow', '#ff7a1a'),
      toggle('ghost', 'Show unlit cathodes', true),
      toggle('mesh', 'Anode mesh', true),
      toggle('base', 'Show tube sockets', true),
    ],
    mount(root, o, g) {
      root.style.background = `radial-gradient(ellipse at 50% 60%, ${mix(o.bg, o.glow, 0.08)}, ${o.bg} 65%)`;
      const spec = g.showSeconds ? 'dd:dd:dd' : 'dd:dd';
      const wrap = el('div', 'nixie' + (o.mesh ? ' nixie-mesh' : '') + (o.base ? ' nixie-base' : ''), root);
      wrap.style.setProperty('--glow', o.glow);
      wrap.style.setProperty('--n', spec.replace(/:/g, '').length + (spec.split(':').length - 1) * 0.35);
      wrap.style.fontFamily = font('nixie');
      const lits = [];
      for (const c of spec) {
        if (c === ':') {
          const sep = el('div', 'nixie-sep', wrap);
          el('i', null, sep); el('i', null, sep);
          continue;
        }
        const tube = el('div', 'nixie-tube', wrap);
        if (o.ghost) {
          const gh = el('div', 'nixie-ghost', tube);
          for (let i = 0; i < 10; i++) el('span', null, gh, String(i));
        }
        lits.push(el('span', 'nixie-lit', tube));
      }
      const sec = gate();
      return {
        tick(t) {
          if (!sec(t.s)) return;
          const str = (g.hour24 ? pad(t.h) : String(h12(t.h)).padStart(2, ' ')) + pad(t.m) + pad(t.s);
          lits.forEach((l, i) => (l.textContent = str[i].trim()));
        },
      };
    },
  };

  const neon = {
    id: 'neon', name: 'Neon Sign', group: 'Digital',
    options: [
      color('bg', 'Background', '#0c0710'),
      color('color', 'Neon', '#ff3cac'),
      color('color2', 'Second neon', '#2ee6ff'),
      choice('font', 'Font', 'tiltneon', fontChoices(['tiltneon', 'monoton', 'nunito', 'playfair', 'grotesk'])),
      toggle('flicker', 'Flicker', true),
    ],
    mount(root, o, g) {
      root.style.background = `radial-gradient(ellipse at 50% 50%, ${mix(o.bg, o.color, 0.14)} 0%, ${o.bg} 62%)`;
      const wrap = el('div', 'neon' + (o.flicker && !reduceMotion ? ' neon-flicker' : ''), root);
      wrap.style.setProperty('--c', o.color);
      wrap.style.setProperty('--c2', o.color2);
      wrap.style.fontFamily = font(o.font);
      const time = el('div', 'neon-time', wrap);
      const cw = o.font === 'monoton' ? 1.05 : 0.62;
      const chars = 5 + (g.showSeconds || !g.hour24 ? 1.5 : 0);
      time.style.fontSize = `min(${(86 / (chars * cw)).toFixed(2)}cqw, 48cqh)`;
      const hh = steadyDigits(el('span', null, time));
      el('span', 'neon-colon', time, ':');
      const mm = steadyDigits(el('span', null, time));
      const side = el('span', 'neon-side', time);
      const ss = g.showSeconds ? steadyDigits(el('span', null, side)) : null;
      const ap = !g.hour24 ? el('span', null, side) : null;
      const date = g.showDate ? el('div', 'neon-date', wrap) : null;
      const sec = gate();
      return {
        tick(t) {
          if (!sec(t.s)) return;
          hh(hourText(t.h, g));
          mm(pad(t.m));
          if (ss) ss(pad(t.s));
          if (ap) ap.textContent = ampm(t.h);
          if (date) date.textContent = t.date;
        },
      };
    },
  };

  const terminal = {
    id: 'terminal', name: 'Terminal', group: 'Digital',
    options: [
      color('bg', 'Background', '#020a03'),
      color('color', 'Text', '#33ff66'),
      choice('font', 'Font', 'vt323', fontChoices(['vt323', 'mono', 'pixel'])),
      toggle('scan', 'Scanlines', true),
      toggle('glow', 'Phosphor glow', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      root.style.setProperty('--c', o.color);
      const term = el('div', 'term' + (o.glow ? ' term-glow' : ''), root);
      term.style.fontFamily = font(o.font);
      const fmt = (g.hour24 ? '%H:%M' : '%I:%M') + (g.showSeconds ? ':%S' : '') + (g.hour24 ? '' : ' %p');
      el('div', 'term-line term-dim', term, `guest@clockfaces:~$ date +"${fmt}"`);
      const big = el('div', 'term-big', term);
      const chars = 5 + (g.showSeconds ? 3 : 0) + (g.hour24 ? 0 : 3);
      const cw = { vt323: 0.44, mono: 0.6, pixel: 1 }[o.font] || 0.6;
      big.style.fontSize = `min(${(88 / (chars * cw)).toFixed(2)}cqw, 34cqh)`;
      const dateLn = g.showDate ? el('div', 'term-line', term) : null;
      const prompt = el('div', 'term-line', term, 'guest@clockfaces:~$ ');
      el('span', 'term-cursor', prompt, '█');
      if (o.scan) el('div', 'term-scan', root);
      const sec = gate();
      return {
        tick(t) {
          if (!sec(t.s)) return;
          big.textContent = (g.hour24 ? pad(t.h) : pad(h12(t.h))) + ':' + pad(t.m) + (g.showSeconds ? ':' + pad(t.s) : '') + (g.hour24 ? '' : ' ' + ampm(t.h));
          if (dateLn) dateLn.textContent = t.date;
        },
      };
    },
  };

  // =====================================================================
  // CREATIVE
  // =====================================================================

  const WC_ROWS = ['ITLISASAMPM', 'ACQUARTERDC', 'TWENTYFIVEX', 'HALFSTENFTO', 'PASTERUNINE', 'ONESIXTHREE', 'FOURFIVETWO', 'EIGHTELEVEN', 'SEVENTWELVE', 'TENSEOCLOCK'];
  const W = (r, c, len) => Array.from({ length: len }, (_, i) => r * 11 + c + i);
  const WC = { IT: W(0, 0, 2), IS: W(0, 3, 2), AM: W(0, 7, 2), PM: W(0, 9, 2), A: W(1, 0, 1), QUARTER: W(1, 2, 7), TWENTY: W(2, 0, 6), FIVE: W(2, 6, 4), HALF: W(3, 0, 4), TEN: W(3, 5, 3), TO: W(3, 9, 2), PAST: W(4, 0, 4), OCLOCK: W(9, 5, 6) };
  const WC_HOURS = [null, W(5, 0, 3), W(6, 8, 3), W(5, 6, 5), W(6, 0, 4), W(6, 4, 4), W(5, 3, 3), W(8, 0, 5), W(7, 0, 5), W(4, 7, 4), W(9, 0, 3), W(7, 5, 6), W(8, 5, 6)];
  const WC_MIN = { 5: ['FIVE'], 10: ['TEN'], 15: ['A', 'QUARTER'], 20: ['TWENTY'], 25: ['TWENTY', 'FIVE'], 30: ['HALF'] };

  const wordclock = {
    id: 'wordclock', name: 'Word Clock', group: 'Creative',
    options: [
      color('bg', 'Background', '#121212'),
      color('lit', 'Lit letters', '#ffffff'),
      range('dim', 'Unlit letters', 13, 3, 40),
      choice('font', 'Font', 'inter', fontChoices(['inter', 'grotesk', 'system', 'oswald', 'mono', 'playfair'])),
      range('weight', 'Weight', 500, 100, 900, 100),
      toggle('dots', 'Minute dots in corners', true),
      toggle('ampm', 'Light up AM / PM', false),
      toggle('glow', 'Glow', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const frame = el('div', 'wc' + (o.glow ? ' wc-glow' : ''), root);
      frame.style.setProperty('--lit', o.lit);
      frame.style.setProperty('--dim', o.dim / 100);
      Object.assign(frame.style, { fontFamily: font(o.font), fontWeight: o.weight });
      const grid = el('div', 'wc-grid', frame);
      const cells = [];
      for (const row of WC_ROWS) for (const ch of row) cells.push(el('span', null, grid, ch));
      const dots = o.dots ? [0, 1, 2, 3].map((i) => el('i', 'wc-dot wc-dot-' + i, frame)) : [];
      const min = gate();
      return {
        tick(t) {
          if (!min(t.h * 60 + t.m)) return;
          const m5 = Math.floor(t.m / 5) * 5;
          let hr = h12(t.h);
          const on = [...WC.IT, ...WC.IS];
          if (m5 === 0) on.push(...WC.OCLOCK);
          else if (m5 <= 30) { WC_MIN[m5].forEach((w) => on.push(...WC[w])); on.push(...WC.PAST); }
          else { WC_MIN[60 - m5].forEach((w) => on.push(...WC[w])); on.push(...WC.TO); hr = (hr % 12) + 1; }
          on.push(...WC_HOURS[hr]);
          if (o.ampm) on.push(...WC[t.h < 12 ? 'AM' : 'PM']);
          const set = new Set(on);
          cells.forEach((c, i) => c.classList.toggle('on', set.has(i)));
          dots.forEach((d, i) => d.classList.toggle('on', i < t.m % 5));
        },
      };
    },
  };

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];
  const words = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '\u2011' + ONES[n % 10] : ''));
  const FUZZY = { 5: 'five', 10: 'ten', 15: 'quarter', 20: 'twenty', 25: 'twenty\u2011five', 30: 'half' };
  const partOfDay = (h) => (h < 5 ? 'at night' : h < 12 ? 'in the morning' : h < 17 ? 'in the afternoon' : h < 21 ? 'in the evening' : 'at night');

  function phrase(t, g, mode) {
    if (mode === 'fuzzy') {
      const exact = t.m + t.s / 60;
      let r = Math.round(exact / 5) * 5;
      const diff = exact - r;
      const pre = diff < -0.5 ? 'almost ' : diff > 0.5 ? 'just after ' : '';
      let hh = t.h;
      if (r === 60) { r = 0; hh += 1; }
      const hw = (x) => ONES[h12(x % 24)];
      if (r === 0) return pre + hw(hh) + " o'clock";
      if (r <= 30) return `${pre}${FUZZY[r]} past ${hw(hh)}`;
      return `${pre}${FUZZY[60 - r]} to ${hw(hh + 1)}`;
    }
    if (!g.hour24 && t.m === 0 && (t.h === 0 || t.h === 12)) return t.h ? 'noon' : 'midnight';
    const hw = g.hour24 ? words(t.h) : ONES[h12(t.h)];
    if (t.m === 0) return g.hour24 ? `${hw} hundred` : `${hw} o'clock`;
    if (t.m < 10) return `${hw} oh ${ONES[t.m]}`;
    return `${hw} ${words(t.m)}`;
  }

  const textclock = {
    id: 'text', name: 'Text Clock', group: 'Creative',
    options: [
      color('bg', 'Background', '#f3efe6'),
      color('color', 'Text', '#1a1a1a'),
      color('accent', 'Accent', '#c2410c'),
      choice('mode', 'Wording', 'fuzzy', [['fuzzy', 'Relaxed (“almost half past ten”)'], ['precise', 'Precise (“ten twenty-eight”)']]),
      choice('font', 'Font', 'fraunces', fontChoices(['fraunces', 'playfair', 'inter', 'grotesk', 'system', 'nunito', 'mono'])),
      range('weight', 'Weight', 400, 100, 900, 100),
      choice('case', 'Case', 'sentence', [['sentence', 'Sentence case'], ['lower', 'lowercase'], ['upper', 'UPPERCASE']]),
      choice('align', 'Alignment', 'left', [['left', 'Left'], ['center', 'Centre']]),
      toggle('daypart', 'Show time of day', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const wrap = el('div', `tc tc-${o.align} tc-${o.case}`, root);
      Object.assign(wrap.style, { fontFamily: font(o.font), color: o.color, fontWeight: o.weight });
      wrap.style.setProperty('--accent', o.accent);
      el('div', 'tc-pre', wrap, "It's");
      const main = el('div', 'tc-main', wrap);
      const post = el('div', 'tc-post', wrap);
      const sec = gate();
      return {
        tick(t) {
          if (!sec(t.s)) return;
          main.textContent = phrase(t, g, o.mode);
          const bits = [];
          if (o.daypart) bits.push(partOfDay(t.h));
          if (o.mode === 'precise' && g.showSeconds) bits.push(`and ${words(t.s)} second${t.s === 1 ? '' : 's'}`);
          if (g.showDate) bits.push(`on ${t.date}`);
          post.textContent = bits.join(', ');
        },
      };
    },
  };

  const binary = {
    id: 'binary', name: 'Binary', group: 'Creative',
    options: [
      color('bg', 'Background', '#0d1117'),
      color('on', 'On', '#3fb950'),
      color('offc', 'Off', '#21262d'),
      choice('mode', 'Encoding', 'bcd', [['bcd', 'Binary-coded decimal'], ['pure', 'Pure binary']]),
      choice('shape', 'Shape', 'circle', [['circle', 'Circles'], ['rounded', 'Rounded squares'], ['square', 'Squares']]),
      toggle('labels', 'Show decimal digits', true),
      toggle('glow', 'Glow', false),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { class: 'cf-svg' }, root);
      const grp = s('g', { filter: o.glow ? glowFilter(v, 2) : null }, v);
      const C = 26, R = 10;
      const rx = { circle: R, rounded: 5, square: 1.5 }[o.shape];
      const dot = (x, y) => s('rect', { x: x - R, y: y - R, width: R * 2, height: R * 2, rx, fill: o.offc }, grp);
      const text = (x, y, anchor = 'middle') => s('text', { x, y, 'text-anchor': anchor, 'dominant-baseline': 'central', fill: o.on, opacity: 0.7, 'font-size': 13, 'font-family': font('mono'), 'font-weight': 600 }, v);
      const units = g.showSeconds ? 3 : 2;
      const cells = []; // { node, unit, digit (0 tens / 1 ones / -1 whole), bit }
      const labels = [];
      let w, h;
      if (o.mode === 'bcd') {
        const bitsFor = [[g.hour24 ? 2 : 1, 4], [3, 4], [3, 4]];
        let x = R;
        for (let u = 0; u < units; u++) {
          for (let d = 0; d < 2; d++) {
            for (let b = 0; b < 4; b++) {
              const bit = 3 - b;
              if (bit < bitsFor[u][d]) cells.push({ node: dot(x, R + b * C), unit: u, digit: d, bit });
            }
            if (o.labels) labels.push({ node: text(x, R + 4 * C), unit: u, digit: d });
            x += C;
          }
          x += 14;
        }
        w = x - 14 - C + R; h = 4 * C + (o.labels ? 10 : -C + R);
      } else {
        const x0 = 26;
        for (let u = 0; u < units; u++) {
          const y = R + u * C;
          text(4, y, 'start').textContent = 'HMS'[u];
          for (let b = 0; b < 6; b++) cells.push({ node: dot(x0 + R + b * C, y), unit: u, digit: -1, bit: 5 - b });
          if (o.labels) labels.push({ node: text(x0 + 6 * C + 14, y, 'start'), unit: u, digit: -1 });
        }
        w = x0 + 6 * C + (o.labels ? 40 : 0); h = units * C - C + 2 * R;
      }
      v.setAttribute('viewBox', `-14 -14 ${w + 28} ${h + 28}`);
      const sec = gate();
      return {
        tick(t) {
          if (!sec(t.s)) return;
          const vals = [g.hour24 ? t.h : h12(t.h), t.m, t.s];
          const part = (u, d) => (d < 0 ? vals[u] : d === 0 ? Math.floor(vals[u] / 10) : vals[u] % 10);
          for (const c of cells) c.node.setAttribute('fill', (part(c.unit, c.digit) >> c.bit) & 1 ? o.on : o.offc);
          for (const l of labels) l.node.textContent = l.digit < 0 ? pad(vals[l.unit]) : part(l.unit, l.digit);
        },
      };
    },
  };

  const tape = {
    id: 'tape', name: 'Tape Measure', group: 'Creative',
    options: [
      color('bg', 'Background', '#f1ede4'),
      color('ink', 'Ink', '#1b1b1b'),
      color('marker', 'Marker', '#e4002b'),
      choice('font', 'Font', 'mono', fontChoices(['mono', 'grotesk', 'inter', 'oswald', 'system'])),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const wrap = el('div', 'tape-wrap', root);
      wrap.style.setProperty('--ink', o.ink);
      wrap.style.setProperty('--marker', o.marker);
      wrap.style.setProperty('--bg', o.bg);
      wrap.style.fontFamily = font(o.font);
      const span = g.hour24 ? 24 : 12;
      const defs = [
        { label: 'HRS', count: span, w: 22, cls: 'tape-h', fmt: (v) => (g.hour24 ? pad(v) : String(v || 12)), value: (t) => (t.h % span) + t.m / 60 + t.sec / 3600 },
        { label: 'MIN', count: 60, w: 13, cls: 'tape-m', fmt: pad, value: (t) => t.m + t.sec / 60 },
      ];
      if (g.showSeconds) defs.push({ label: 'SEC', count: 60, w: 9, cls: 'tape-s', fmt: pad, value: (t) => t.sec });
      for (const d of defs) {
        const row = el('div', 'tape ' + d.cls, wrap);
        const track = el('div', 'tape-track', row);
        d.strip = el('div', 'tape-strip', track);
        for (let i = 0; i < d.count * 3; i++) {
          const item = el('div', 'tape-item', d.strip);
          item.style.width = d.w + 'cqw';
          el('span', 'tape-num', item, d.fmt(i % d.count));
        }
        el('span', 'tape-label', row, d.label);
      }
      el('div', 'tape-marker', wrap);
      return {
        tick(t) {
          for (const d of defs) d.strip.style.transform = `translateX(calc(50cqw - ${((d.count + d.value(t)) * d.w).toFixed(3)}cqw))`;
        },
      };
    },
  };

  const SKY = [
    [0, '#060a1d', '#141d3f'], [4.5, '#0b1233', '#2b2554'], [6, '#34437f', '#f0a07a'], [7.2, '#5d8fd6', '#ffd8ad'],
    [10, '#3d8ce0', '#b5dcff'], [15, '#3a87dc', '#c9e6ff'], [17.6, '#4a6bb8', '#ffb38a'], [18.8, '#2d3270', '#ef7a6e'],
    [20, '#141a40', '#463466'], [21.5, '#070b20', '#18204a'], [24, '#060a1d', '#141d3f'],
  ];
  function skyAt(hf) {
    for (let i = 1; i < SKY.length; i++) {
      if (hf <= SKY[i][0]) {
        const [a, a1, a2] = SKY[i - 1], [b, b1, b2] = SKY[i];
        const p = (hf - a) / (b - a);
        return [mix(a1, b1, p), mix(a2, b2, p)];
      }
    }
    return [SKY[0][1], SKY[0][2]];
  }

  // ---------- sunrise & sunset ----------

  const RAD = Math.PI / 180;

  // Solar noon, sunrise and sunset in minutes after midnight UTC (NOAA approximation).
  // `polar` is 'day' or 'night' when the sun never sets or never rises.
  function sunTimes(date, lat, lon) {
    const doy = Math.floor((date - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5);
    const y = ((2 * Math.PI) / 365) * (doy - 1);
    const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(y) - 0.032077 * Math.sin(y) - 0.014615 * Math.cos(2 * y) - 0.040849 * Math.sin(2 * y));
    const decl = 0.006918 - 0.399912 * Math.cos(y) + 0.070257 * Math.sin(y) - 0.006758 * Math.cos(2 * y)
      + 0.000907 * Math.sin(2 * y) - 0.002697 * Math.cos(3 * y) + 0.00148 * Math.sin(3 * y);
    const cosH = Math.cos(90.833 * RAD) / (Math.cos(lat * RAD) * Math.cos(decl)) - Math.tan(lat * RAD) * Math.tan(decl);
    const noon = 720 - 4 * lon - eqTime;
    if (cosH > 1) return { noon, polar: 'night' };
    if (cosH < -1) return { noon, polar: 'day' };
    const ha = Math.acos(cosH) / RAD;
    return { noon, rise: noon - 4 * ha, set: noon + 4 * ha };
  }

  const wrap24 = (h) => ((h % 24) + 24) % 24;

  // Maps clock hours onto the sky's built-in day, where the sun rises at 6 and sets at 18.
  function solarPhase(hf, sun) {
    if (!sun) return hf;
    const fromNoon = wrap24(hf - sun.noon + 12) - 12;
    if (sun.polar === 'day') return 12 + (fromNoon * 5) / 12;
    if (sun.polar === 'night') return 5 - (Math.abs(fromNoon) * 5) / 12;
    const dayLen = wrap24(sun.set - sun.rise), x = wrap24(hf - sun.rise);
    return x < dayLen ? 6 + (12 * x) / dayLen : wrap24(18 + (12 * (x - dayLen)) / (24 - dayLen));
  }

  let zonesReady = null;
  function loadZones() {
    if (!zonesReady) {
      zonesReady = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'zones.js';
        script.onload = () => resolve(window.ClockZones || {});
        script.onerror = () => resolve({});
        document.head.appendChild(script);
      });
    }
    return zonesReady;
  }

  const GEO_KEY = 'clockfaces:geo';
  function savedPosition() {
    try { return JSON.parse(localStorage.getItem(GEO_KEY)); } catch (e) { return null; }
  }
  function askPosition() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition((p) => {
        // Two decimals (about 1 km) is plenty for sun times
        const pos = [+p.coords.latitude.toFixed(2), +p.coords.longitude.toFixed(2)];
        try { localStorage.setItem(GEO_KEY, JSON.stringify(pos)); } catch (e) { /* private mode */ }
        resolve(pos);
      }, () => resolve(null), { maximumAge: 864e5, timeout: 15000 });
    });
  }

  // Returns tick(t) -> today's { rise, set, noon, polar } in the clock's own hours, or null
  // until a location is known. `where` is 'zone', 'here' or 'fixed' (always null).
  // The chosen clock time zone wins, then a saved or new exact position, then the device's zone.
  function sunTracker(g, where) {
    let coords = null;
    if (where !== 'fixed') {
      const zone = g.timeZone !== 'local' ? g.timeZone : Intl.DateTimeFormat().resolvedOptions().timeZone;
      const useZone = () => loadZones().then((zones) => { if (!coords) coords = zones[zone] || null; });
      if (where === 'here' && g.timeZone === 'local') {
        coords = savedPosition();
        if (!coords) askPosition().then((pos) => (pos ? (coords = pos) : useZone()));
      } else {
        useZone();
      }
    }
    let solar = null, key = '';
    return (t) => {
      if (!coords) return null;
      const now = new Date();
      // Minutes the displayed time zone is ahead of UTC (mod a day, which is all we need)
      const offset = t.h * 60 + t.m - (now.getUTCHours() * 60 + now.getUTCMinutes());
      const k = `${coords}|${now.getUTCDate()}|${offset}`;
      if (k !== key) {
        key = k;
        const st = sunTimes(now, coords[0], coords[1]);
        const local = (m) => wrap24((m + offset) / 60);
        solar = { polar: st.polar, noon: local(st.noon), rise: st.rise != null ? local(st.rise) : null, set: st.set != null ? local(st.set) : null };
      }
      return solar;
    };
  }

  const SUN_WHERE = [['zone', 'From your time zone (approximate)'], ['here', 'At your exact location'], ['fixed', 'Fixed at 6:00 and 18:00']];

  const daylight = {
    id: 'daylight', name: 'Daylight', group: 'Creative',
    options: [
      choice('font', 'Font', 'grotesk', fontChoices(['grotesk', 'inter', 'nunito', 'fraunces', 'playfair', 'system'])),
      range('weight', 'Weight', 500, 300, 800, 100),
      toggle('text', 'Show time', true),
      toggle('hills', 'Show hills', true),
      choice('where', 'Sunrise & sunset', 'zone', SUN_WHERE),
      toggle('demo', 'Fast-forward the sky (a day per minute)', false),
    ],
    mount(root, o, g) {
      const sky = el('div', 'dl-sky', root);
      const stars = el('div', 'dl-stars', root);
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 90; i++) {
        const st = el('i', null, stars);
        const sz = 1 + rnd() * 2;
        Object.assign(st.style, { left: rnd() * 100 + '%', top: rnd() * 70 + '%', width: sz + 'px', height: sz + 'px', animationDelay: -rnd() * 4 + 's' });
      }
      const sun = el('div', 'dl-sun', root);
      const moon = el('div', 'dl-moon', root);
      let back = null, front = null;
      if (o.hills) {
        const hills = s('svg', { class: 'dl-hills', viewBox: '0 0 1000 200', preserveAspectRatio: 'none' }, root);
        back = s('path', { d: 'M0 120 C 120 70 240 70 360 105 S 600 150 720 95 S 920 60 1000 90 V200 H0Z' }, hills);
        front = s('path', { d: 'M0 160 C 150 120 300 125 420 150 S 680 185 800 140 S 950 120 1000 135 V200 H0Z' }, hills);
      }
      let main = null, sub = null;
      if (o.text) {
        const txt = el('div', 'dl-text', root);
        Object.assign(txt.style, { fontFamily: font(o.font), fontWeight: o.weight });
        main = el('div', 'dl-time', txt);
        sub = el('div', 'dl-sub', txt);
      }
      const sunAt = sunTracker(g, o.where);
      const sec = gate();
      return {
        tick(t) {
          const solar = sunAt(t);
          const clockHours = o.demo ? (performance.now() / 2500) % 24 : t.h + t.m / 60 + t.sec / 3600;
          const hf = solarPhase(clockHours, solar);
          const [top, bottom] = skyAt(hf);
          sky.style.background = `linear-gradient(to bottom, ${top}, ${bottom})`;
          const elev = Math.sin((Math.PI * (hf - 6)) / 12);
          stars.style.opacity = clamp((0.12 - elev) * 3, 0, 1);
          const place = (node, p, e) => {
            node.style.left = 8 + 84 * p + '%';
            node.style.top = 74 - e * 56 + '%';
            node.style.opacity = clamp((e + 0.12) * 6, 0, 1);
          };
          place(sun, (hf - 6) / 12, elev);
          place(moon, (((hf + 6) % 24) / 12), -elev);
          if (back) {
            const L = clamp(elev * 2 + 0.35, 0, 1);
            back.setAttribute('fill', mix('#0c1022', '#4f7d5c', L));
            front.setAttribute('fill', mix('#060912', '#2e5a3c', L));
          }
          if (main && sec(t.s)) {
            main.textContent = `${hourText(t.h, g)}:${pad(t.m)}` + (g.showSeconds ? `:${pad(t.s)}` : '');
            const bits = [];
            if (!g.hour24) bits.push(ampm(t.h));
            if (g.showDate) bits.push(t.date);
            sub.textContent = bits.join(' · ');
          }
        },
      };
    },
  };

  // =====================================================================
  // MORE ANALOG
  // =====================================================================

  const roman = {
    id: 'roman', name: 'Roman Numerals', group: 'Analog',
    options: [
      color('bg', 'Background', '#15171c'),
      color('dial', 'Dial', '#f3ecdc'),
      color('rim', 'Rim', '#b08d4a'),
      color('ink', 'Numerals', '#20242c'),
      color('hands', 'Hands', '#1d2433'),
      color('second', 'Second hand', '#9b2c2c'),
      choice('font', 'Numeral font', 'cinzel', fontChoices(['cinzel', 'playfair', 'fraunces', 'system'])),
      choice('orient', 'Numerals', 'radial', [['radial', 'Radial (traditional)'], ['upright', 'Upright']]),
      toggle('track', 'Minute track', true),
      motion(),
      toggle('shadow', 'Hand shadows', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const sh = o.shadow ? shadowFilter(v, 0.3) : null;
      s('circle', { r: 95, fill: o.dial, stroke: o.rim, 'stroke-width': 5 }, v);

      if (o.track) {
        s('circle', { r: 88, fill: 'none', stroke: o.ink, 'stroke-width': 0.6 }, v);
        s('circle', { r: 81, fill: 'none', stroke: o.ink, 'stroke-width': 0.6 }, v);
        for (let i = 0; i < 60; i++) {
          const [x1, y1] = polar(i * 6, 88), [x2, y2] = polar(i * 6, 81);
          s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': i % 5 ? 0.6 : 1.8 }, v);
        }
      }

      const R = o.track ? 66 : 74;
      for (let i = 0; i < 12; i++) {
        const label = romanHour(i, g);
        const attrs = { fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 17, 'font-family': font(o.font), 'font-weight': 500 };
        if (o.orient === 'radial') Object.assign(attrs, { y: -R, transform: `rotate(${i * 30})` });
        else [attrs.x, attrs.y] = polar(i * 30, R);
        // Narrow the long numerals so VIII doesn't crowd its neighbours
        if (label.length > 3) Object.assign(attrs, { textLength: 26, lengthAdjust: 'spacingAndGlyphs' });
        s('text', attrs, v).textContent = label;
      }

      const dateText = g.showDate
        ? s('text', { y: 36, fill: o.ink, opacity: 0.75, 'text-anchor': 'middle', 'font-size': 7, 'letter-spacing': 1.2, 'font-family': font(o.font), 'font-weight': 600 }, v)
        : null;

      // Spade hands
      const hourH = hand(v, 'M-1.8 14 L-1.8 -28 C-8 -30 -8 -40 -1.1 -46 L0 -54 L1.1 -46 C8 -40 8 -30 1.8 -28 L1.8 14Z', o.hands, sh);
      const minH = hand(v, 'M-1.3 16 L-1.3 -60 C-5 -62 -5 -69 -0.9 -74 L0 -85 L0.9 -74 C5 -69 5 -62 1.3 -60 L1.3 16Z', o.hands, sh);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, sh);
        s('line', { y1: 20, y2: -87, stroke: o.second, 'stroke-width': 0.9, 'stroke-linecap': 'round' }, secH);
        s('circle', { cy: 16, r: 3, fill: o.second }, secH);
      }
      s('circle', { r: 4, fill: o.hands }, v);
      s('circle', { r: 1.6, fill: secH ? o.second : o.rim }, v);

      const dateGate = gate();
      return {
        tick(t) {
          const sec = secOf(t, o);
          const min = t.m + sec / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          if (secH) rot(secH, sec * 6);
          if (dateText && dateGate(t.dateShort)) dateText.textContent = t.dateShort;
        },
      };
    },
  };

  // The seconds hand is gone: the dial turns anticlockwise once a minute past a fixed pointer,
  // so the second under the pointer is the current second. The hour and minute hands are
  // drawn at their dial angle plus the spin, which keeps their shadows falling the same way.
  const spin = {
    id: 'spin', name: 'Spinning', group: 'Analog',
    options: [
      color('bg', 'Background', '#14161b'),
      color('dial', 'Dial', '#f4f0e6'),
      color('ring', 'Seconds ring', '#23262d'),
      color('ringInk', 'Seconds markings', '#f4f0e6'),
      color('ink', 'Numerals', '#1f2126'),
      color('hands', 'Hands', '#1f2126'),
      color('pointer', 'Pointer', '#e5482d'),
      choice('turns', 'What turns', 'face', [['face', 'Whole face'], ['ring', 'Seconds ring only']]),
      choice('numerals', 'Numerals', 'arabic', [['arabic', 'Arabic'], ['roman', 'Roman']]),
      choice('font', 'Numeral font', 'fraunces', fontChoices(['fraunces', 'playfair', 'inter', 'oswald', 'mono', 'system'])),
      choice('sweep', 'Motion', 'smooth', [['smooth', 'Smooth'], ['tick', 'Tick']]),
      toggle('shadow', 'Hand shadows', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const sh = o.shadow ? shadowFilter(v, 0.3) : null;
      const wholeFace = o.turns === 'face';
      // Seconds are shown by the spin alone, so without it the dial simply stays still
      const spins = g.showSeconds && !reduceMotion;

      const ring = s('g', null, v);
      s('circle', { r: 95, fill: o.ring }, ring);
      for (let i = 0; i < 60; i++) {
        const [x1, y1] = polar(i * 6, 93), [x2, y2] = polar(i * 6, i % 5 ? 90 : 88);
        s('line', { x1, y1, x2, y2, stroke: o.ringInk, 'stroke-width': i % 5 ? 0.5 : 1.1 }, ring);
      }
      for (let i = 0; i < 12; i++) {
        s('text', { y: -81.5, transform: `rotate(${i * 30})`, fill: o.ringInk, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 6.5, 'font-weight': 500, 'font-family': font(o.font) }, ring)
          .textContent = String(i * 5).padStart(2, '0');
      }

      const face = s('g', null, v);
      s('circle', { r: 75, fill: o.dial }, face);
      for (let i = 0; i < 12; i++) {
        const attrs = { fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': o.numerals === 'roman' ? 12 : 15, 'font-weight': 500, 'font-family': font(o.font) };
        if (wholeFace) Object.assign(attrs, { y: -63, transform: `rotate(${i * 30})` });
        else [attrs.x, attrs.y] = polar(i * 30, 63);
        s('text', attrs, face).textContent = o.numerals === 'roman' ? romanHour(i, g) : String(i || 12);
      }

      const dateText = g.showDate
        ? s('text', { y: 32, fill: o.ink, opacity: 0.75, 'text-anchor': 'middle', 'font-size': 6.5, 'letter-spacing': 1.2, 'font-family': font(o.font), 'font-weight': 600 }, v)
        : null;

      const hourH = hand(v, 'M-2.4 10 L-2.4 -39 L0 -45 L2.4 -39 L2.4 10Z', o.hands, sh);
      const minH = hand(v, 'M-1.6 12 L-1.6 -67 L0 -73 L1.6 -67 L1.6 12Z', o.hands, sh);
      s('circle', { r: 3.6, fill: o.hands }, v);
      s('circle', { r: 1.4, fill: o.pointer }, v);
      if (spins) s('path', { d: 'M0 -87 L-4.5 -98 L4.5 -98Z', fill: o.pointer, filter: sh }, v);

      const dateGate = gate();
      return {
        tick(t) {
          const sec = o.sweep === 'smooth' ? t.sec : t.s;
          const min = t.m + sec / 60;
          const turn = spins ? -sec * 6 : 0;
          const faceTurn = wholeFace ? turn : 0;
          rot(ring, turn);
          rot(face, faceTurn);
          rot(hourH, ((t.h % 12) + min / 60) * 30 + faceTurn);
          rot(minH, min * 6 + faceTurn);
          if (dateText && dateGate(t.dateShort)) dateText.textContent = t.dateShort;
        },
      };
    },
  };

  const clock24 = {
    id: 'clock24', name: '24-Hour', group: 'Analog',
    options: [
      color('bg', 'Background', '#101317'),
      color('dial', 'Day', '#f4f1ea'),
      color('night', 'Night', '#22304f'),
      color('ink', 'Markings', '#1d2129'),
      color('hands', 'Hands', '#1d2129'),
      color('second', 'Second hand', '#e0662d'),
      choice('top', 'At the top', 'midnight', [['midnight', 'Midnight (00)'], ['noon', 'Noon (12)']]),
      choice('numerals', 'Numerals', 'all', [['all', 'All 24'], ['even', 'Even hours'], ['quarters', '00 · 6 · 12 · 18']]),
      choice('font', 'Numeral font', 'inter', fontChoices(['inter', 'grotesk', 'system', 'oswald', 'mono'])),
      toggle('shade', 'Shade the night', true),
      choice('where', 'Sunrise & sunset', 'zone', SUN_WHERE),
      toggle('shadow', 'Hand shadows', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const sh = o.shadow ? shadowFilter(v, 0.3) : null;
      const off = o.top === 'noon' ? 180 : 0;
      const angle = (hours) => hours * 15 + off;
      const ticks = [], numerals = [];

      s('circle', { r: 95, fill: o.dial }, v);
      const shade = o.shade ? s('path', { fill: o.night }, v) : null;
      s('circle', { r: 95, fill: 'none', stroke: o.ink, 'stroke-opacity': 0.25, 'stroke-width': 1.5 }, v);

      for (let i = 0; i < 96; i++) {
        const hr = i / 4, major = i % 4 === 0;
        const [x1, y1] = polar(angle(hr), 90), [x2, y2] = polar(angle(hr), major ? 82 : 87);
        ticks.push([s('line', { x1, y1, x2, y2, 'stroke-width': major ? 1.8 : 0.7, opacity: major ? 1 : 0.7 }, v), hr]);
      }
      for (let hr = 1; hr <= 24; hr++) {
        if (o.numerals === 'even' && hr % 2) continue;
        if (o.numerals === 'quarters' && hr % 6) continue;
        const big = hr % 6 === 0;
        const [x, y] = polar(angle(hr), 72);
        const n = s('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': o.numerals === 'quarters' ? 15 : big ? 10.5 : 8.5, 'font-weight': big ? 700 : 500, 'font-family': font(o.font) }, v)
        n.textContent = hr === 24 ? '00' : String(hr); // midnight, as on a digital clock
        numerals.push([n, hr % 24]);
      }

      // A small sun at solar noon and a moon opposite it
      const sun = s('g', { fill: '#f2a93b', stroke: '#f2a93b', 'stroke-linecap': 'round' }, v);
      s('circle', { r: 4.2 }, sun);
      for (let i = 0; i < 8; i++) {
        const [a, b] = polar(i * 45, 6.5), [c, d] = polar(i * 45, 8.5);
        s('line', { x1: a, y1: b, x2: c, y2: d, 'stroke-width': 1.2 }, sun);
      }
      const moon = s('path', { d: 'M1.5 -5 A5.2 5.2 0 1 0 1.5 5 A4 4 0 1 1 1.5 -5Z', fill: o.shade ? o.dial : o.ink, opacity: 0.85 }, v);

      // Shade from sunset round through midnight to sunrise, and recolour markings to suit.
      const sunAt = sunTracker(g, o.where);
      const FIXED = { rise: 6, set: 18, noon: 12 };
      const move = (node, hours, r) => node.setAttribute('transform', `translate(${polar(angle(hours), r).join(' ')})`);
      let painted = null;
      function paint(sun24) {
        painted = sun24;
        const { rise, set, noon, polar: pole } = sun24;
        const isNight = (hr) => o.shade && (pole ? pole === 'night' : wrap24(hr - set) < wrap24(rise - set));
        if (shade) {
          let d = '';
          if (pole === 'night') d = 'M0 -95 A95 95 0 1 1 0 95 A95 95 0 1 1 0 -95Z';
          else if (!pole) {
            const [x1, y1] = polar(angle(set), 95), [x2, y2] = polar(angle(rise), 95);
            d = `M0 0 L${x1} ${y1} A95 95 0 ${wrap24(rise - set) > 12 ? 1 : 0} 1 ${x2} ${y2} Z`;
          }
          shade.setAttribute('d', d);
        }
        for (const [node, hr] of ticks) node.setAttribute('stroke', isNight(hr) ? o.dial : o.ink);
        for (const [node, hr] of numerals) node.setAttribute('fill', isNight(hr) ? o.dial : o.ink);
        move(sun, noon, 46);
        move(moon, noon + 12, 46);
      }

      const hourH = hand(v, 'M-3.2 12 L-2.2 -54 L0 -58 L2.2 -54 L3.2 12Z', o.hands, sh);
      const minH = hand(v, 'M-2.3 14 L-1.4 -83 L0 -87 L1.4 -83 L2.3 14Z', o.hands, sh);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, sh);
        s('line', { y1: 20, y2: -89, stroke: o.second, 'stroke-width': 1.1, 'stroke-linecap': 'round' }, secH);
      }
      s('circle', { r: 4, fill: o.hands, stroke: o.dial, 'stroke-width': 0.8 }, v);
      if (secH) s('circle', { r: 1.8, fill: o.second }, v);

      return {
        tick(t) {
          const sec = secOf(t, o);
          const sun24 = sunAt(t) || FIXED;
          if (sun24 !== painted) paint(sun24);
          const min = t.m + sec / 60;
          rot(hourH, angle(t.h + min / 60));
          rot(minH, min * 6);
          if (secH) rot(secH, sec * 6);
        },
      };
    },
  };

  const WOODS = {
    walnut: ['#3b2416', '#6b4429', '#24150c'],
    mahogany: ['#4a1a13', '#80362a', '#2c0e0a'],
    oak: ['#7a5430', '#b48a55', '#523820'],
    ebony: ['#121212', '#2e2e2e', '#050505'],
    white: ['#c9c5bc', '#f0eee9', '#a8a49b'],
  };

  const pendulum = {
    id: 'pendulum', name: 'Pendulum', group: 'Analog',
    options: [
      color('bg', 'Background', '#1b1714'),
      choice('wood', 'Case', 'walnut', [['walnut', 'Walnut'], ['mahogany', 'Mahogany'], ['oak', 'Oak'], ['ebony', 'Ebony'], ['white', 'Painted white']]),
      choice('bob', 'Pendulum', 'gold', [['gold', 'Brass'], ['silver', 'Silver'], ['gunmetal', 'Gunmetal']]),
      color('dial', 'Dial', '#f1e9d6'),
      color('ink', 'Numerals & hands', '#231d16'),
      choice('numerals', 'Numerals', 'roman', [['roman', 'Roman'], ['arabic', 'Arabic']]),
      choice('font', 'Numeral font', 'playfair', fontChoices(['playfair', 'cinzel', 'fraunces', 'system'])),
      range('swing', 'Swing', 7, 2, 12),
      toggle('shadow', 'Shadows', true),
      motion('tick'),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-80 -112 160 262', class: 'cf-svg cf-tall', style: '--zoom: 1.2' }, root);
      const defs = s('defs', null, v);
      const sh = o.shadow ? shadowFilter(v, 0.35) : null;
      const [dark, mid, deep] = WOODS[o.wood] || WOODS.walnut;
      const [m0, m1, m2] = METALS[o.bob] || METALS.gold;
      const id = 'pd' + ++uid;

      const wood = s('linearGradient', { id: id + 'w', x1: 0, x2: 1 }, defs);
      [[0, dark], [0.45, mid], [1, dark]].forEach(([offset, c]) => s('stop', { offset, 'stop-color': c }, wood));
      const metal = s('radialGradient', { id: id + 'm', cx: 0.35, cy: 0.35, r: 0.75 }, defs);
      [[0, m2], [0.45, m1], [1, m0]].forEach(([offset, c]) => s('stop', { offset, 'stop-color': c }, metal));
      const clip = s('clipPath', { id: id + 'c' }, defs);
      s('rect', { x: -42, y: 34, width: 84, height: 96, rx: 6 }, clip);

      // Case with an arched top
      s('path', { d: 'M-70 144 V-40 A70 70 0 0 1 70 -40 V144 Z', fill: `url(#${id}w)`, filter: sh }, v);
      s('path', { d: 'M-64 138 V-40 A64 64 0 0 1 64 -40 V138 Z', fill: 'none', stroke: deep, 'stroke-width': 1.2, opacity: 0.6 }, v);

      // Pendulum window
      s('rect', { x: -42, y: 34, width: 84, height: 96, rx: 6, fill: deep }, v);
      const swing = s('g', null, s('g', { 'clip-path': `url(#${id}c)` }, v));
      s('rect', { x: -1.4, y: 8, width: 2.8, height: 94, fill: m1 }, swing);
      s('circle', { cy: 106, r: 13, fill: `url(#${id}m)`, stroke: m0, 'stroke-width': 0.8 }, swing);
      s('rect', { x: -42, y: 34, width: 84, height: 96, rx: 6, fill: 'none', stroke: m1, 'stroke-width': 2 }, v);
      // Glass glare
      s('path', { d: 'M-34 40 L-18 40 L-38 104 L-38 64Z', fill: '#fff', opacity: 0.06 }, v);

      // Dial
      const C = -40;
      const dial = s('g', { transform: `translate(0 ${C}) scale(1.08)` }, v);
      s('circle', { r: 56, fill: `url(#${id}m)` }, dial);
      s('circle', { r: 51, fill: o.dial }, dial);
      for (let i = 0; i < 60; i++) {
        const [x1, y1] = polar(i * 6, 48), [x2, y2] = polar(i * 6, i % 5 ? 45.5 : 43);
        s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': i % 5 ? 0.5 : 1.3 }, dial);
      }
      for (let i = 0; i < 12; i++) {
        const [x, y] = polar(i * 30, 35);
        s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': o.numerals === 'roman' ? 8.5 : 10, 'font-weight': 500, 'font-family': font(o.font) }, dial)
          .textContent = o.numerals === 'roman' ? romanHour(i, g) : String(i || 12);
      }
      const hourH = hand(dial, 'M-2.2 8 L-1.6 -24 L0 -27 L1.6 -24 L2.2 8Z', o.ink, sh);
      const minH = hand(dial, 'M-1.6 10 L-1 -43 L0 -46.5 L1 -43 L1.6 10Z', o.ink, sh);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(dial, sh);
        s('line', { y1: 10, y2: -47.5, stroke: '#a3332a', 'stroke-width': 0.7, 'stroke-linecap': 'round' }, secH);
      }
      s('circle', { r: 2.6, fill: o.ink }, dial);

      const amp = reduceMotion ? 0 : +o.swing;
      return {
        tick(t) {
          // A seconds pendulum: one swing per second, at an extreme on each tick
          swing.setAttribute('transform', `rotate(${(amp * Math.cos(Math.PI * t.sec)).toFixed(3)} 0 8)`);
          const min = t.m + t.s / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          if (secH) rot(secH, secOf(t, o) * 6);
        },
      };
    },
  };

  // =====================================================================
  // MORE DIGITAL
  // =====================================================================

  const SF_CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:';
  const SF_STEP = 110; // average ms per flap

  const splitflap = {
    id: 'splitflap', name: 'Split-Flap', group: 'Digital',
    options: [
      color('bg', 'Background', '#0b0b0c'),
      color('cell', 'Flaps', '#1d1d20'),
      color('ink', 'Characters', '#f2efe6'),
      color('accent', 'Date', '#f5c518'),
      choice('font', 'Font', 'oswald', fontChoices(['oswald', 'inter', 'grotesk', 'mono', 'bebas'])),
      toggle('date', 'Show date row', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const COLS = 10;
      const showDate = o.date || g.showDate;
      const board = el('div', 'sf', root);
      board.style.setProperty('--cols', COLS);
      board.style.setProperty('--rows', showDate ? 2 : 1);
      board.style.setProperty('--cellbg', o.cell);
      board.style.setProperty('--bg', o.bg);
      board.style.fontFamily = font(o.font);

      const cell = (row, colour) => {
        const c = el('div', 'sf-c', row);
        c.style.color = colour;
        // Each half clips a full-height glyph box, showing its upper or lower part.
        const half = (cls) => {
          const h = el('span', 'sf-h ' + cls, c);
          const glyph = el('i', null, h);
          return { el: h, set text(v) { glyph.textContent = v; } };
        };
        const top = half('top'), bottom = half('bottom');
        let cur = ' ', target = ' ', timer = 0, filled = false, settled = false;
        // Each module runs at its own pace and flips a different number of times, like a real board.
        const step = SF_STEP * (0.7 + Math.random() * 0.7);
        const maxFlips = 4 + Math.floor(Math.random() * 8);
        const flip = (from, to) => {
          top.text = to;
          if (reduceMotion) { bottom.text = to; return; }
          const ft = half('top flap'), fb = half('bottom flap');
          ft.text = from;
          fb.text = to;
          fb.el.addEventListener('animationend', () => { bottom.text = to; ft.el.remove(); fb.el.remove(); }, { once: true });
        };
        const run = () => {
          if (cur === target || !c.isConnected) { timer = 0; settled = true; return; }
          // Real boards cycle through every character; cap the run so changes stay quick.
          const ti = SF_CHARS.indexOf(target), ci = SF_CHARS.indexOf(cur);
          const dist = (ti - ci + SF_CHARS.length) % SF_CHARS.length;
          // Long, varied runs when the board fills; short ones after so the seconds keep up.
          const cap = settled ? Math.min(maxFlips, 4) : maxFlips;
          const next = dist > cap ? SF_CHARS[(ti - cap + SF_CHARS.length) % SF_CHARS.length] : SF_CHARS[(ci + 1) % SF_CHARS.length];
          flip(cur, next);
          cur = next;
          timer = setTimeout(run, reduceMotion ? 0 : step * (0.85 + Math.random() * 0.3));
        };
        return (ch) => {
          target = SF_CHARS.includes(ch) ? ch : ' ';
          if (timer) return;
          if (reduceMotion) return run();
          // Stagger the start: widely when the board first fills, slightly on later changes.
          timer = setTimeout(run, Math.random() * (filled ? 160 : 500));
          filled = true;
        };
      };
      const row = (colour) => {
        const r = el('div', 'sf-row', board);
        return Array.from({ length: COLS }, () => cell(r, colour));
      };
      const timeRow = row(o.ink);
      const dateRow = showDate ? row(o.accent) : null;
      const write = (cells, text) => {
        const padded = text.padStart(Math.floor((COLS + text.length) / 2)).padEnd(COLS);
        cells.forEach((set, i) => set(padded[i]));
      };

      const sec = gate();
      return {
        tick(t) {
          if (!sec(t.s)) return;
          let time = `${hourText(t.h, g)}:${pad(t.m)}` + (g.showSeconds ? `:${pad(t.s)}` : '');
          if (!g.hour24) time += ' ' + ampm(t.h);
          write(timeRow, time);
          if (dateRow) write(dateRow, `${t.dateShort} ${t.month}`);
        },
      };
    },
  };

  // Shared wood gradient for cased clocks
  function woodFill(defs, wood) {
    const [dark, mid] = WOODS[wood] || WOODS.walnut;
    const id = 'wd' + ++uid;
    const grad = s('linearGradient', { id, x1: 0, x2: 1 }, defs);
    [[0, dark], [0.45, mid], [1, dark]].forEach(([offset, c]) => s('stop', { offset, 'stop-color': c }, grad));
    return `url(#${id})`;
  }

  function metalFill(defs, metal) {
    const [m0, m1, m2] = METALS[metal] || METALS.gold;
    const id = 'mt' + ++uid;
    const grad = s('radialGradient', { id, cx: 0.35, cy: 0.3, r: 0.8 }, defs);
    [[0, m2], [0.45, m1], [1, m0]].forEach(([offset, c]) => s('stop', { offset, 'stop-color': c }, grad));
    return `url(#${id})`;
  }

  // Days since the last new moon (mean synodic month, good to within about a day)
  const SYNODIC = 29.530588853;
  const moonAge = (date) => ((((date - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % SYNODIC) + SYNODIC) % SYNODIC;

  const cuckoo = {
    id: 'cuckoo', name: 'Cuckoo', group: 'Analog',
    options: [
      color('bg', 'Wall', '#e8dfcf'),
      choice('wood', 'Wood', 'walnut', [['walnut', 'Walnut'], ['oak', 'Oak'], ['mahogany', 'Mahogany'], ['ebony', 'Ebony']]),
      color('dial', 'Dial', '#f3ead6'),
      color('ink', 'Numerals & hands', '#2a1d12'),
      choice('numerals', 'Numerals', 'roman', [['roman', 'Roman'], ['arabic', 'Arabic']]),
      choice('call', 'Cuckoo', 'hour', [['hour', 'On the hour and half hour'], ['minute', 'Every minute'], ['off', 'Never']]),
      toggle('shadow', 'Shadows', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -150 200 325', class: 'cf-svg cf-tall', style: '--zoom: 1.15' }, root);
      const defs = s('defs', null, v);
      const sh = o.shadow ? shadowFilter(v, 0.35) : null;
      const wood = woodFill(defs, o.wood);
      const [dark, mid, deep] = WOODS[o.wood] || WOODS.walnut;
      const brass = metalFill(defs, 'gold');

      // Pine-cone weights on chains, and a leaf pendulum, hanging below the house
      const weight = (x) => {
        const chain = s('line', { x1: x, y1: 70, x2: x, stroke: '#b08a3e', 'stroke-width': 1.6, 'stroke-dasharray': '2.2 1.2' }, v);
        const cone = s('g', { filter: sh }, v);
        s('rect', { x: -2, y: -4, width: 4, height: 5, fill: '#b08a3e' }, cone);
        s('path', { d: 'M0 0 C10 4 11 27 0 42 C-11 27 -10 4 0 0Z', fill: '#4a2e18' }, cone);
        for (let i = 0; i < 6; i++) {
          const y = 6 + i * 5.5, w = 8 - Math.abs(i - 2) * 1.6;
          s('path', { d: `M${-w} ${y} L0 ${y + 4} L${w} ${y}`, fill: 'none', stroke: '#2b190c', 'stroke-width': 1.1 }, cone);
        }
        return (y) => { chain.setAttribute('y2', y); cone.setAttribute('transform', `translate(${x} ${y})`); };
      };
      const leftW = weight(-30), rightW = weight(30);
      const pend = s('g', null, v);
      s('rect', { x: -1.1, y: 70, width: 2.2, height: 40, fill: '#b08a3e' }, pend);
      s('path', { d: 'M0 100 C16 108 16 132 0 146 C-16 132 -16 108 0 100Z', fill: wood, stroke: deep, 'stroke-width': 1, filter: sh }, pend);
      s('path', { d: 'M0 104 V142 M0 116 L-7 110 M0 116 L7 110 M0 128 L-8 122 M0 128 L8 122', stroke: deep, 'stroke-width': 0.8, fill: 'none' }, pend);

      // House
      s('path', { d: 'M-60 -42 L0 -100 L60 -42 V70 H-60Z', fill: wood, filter: sh }, v);
      for (const x of [-40, -20, 20, 40]) s('line', { x1: x, y1: -40, x2: x, y2: 70, stroke: deep, 'stroke-width': 0.8, opacity: 0.35 }, v);
      s('rect', { x: -68, y: 66, width: 136, height: 7, rx: 2, fill: deep }, v);
      s('path', { d: 'M-92 -30 L0 -122 L92 -30 L80 -24 L0 -104 L-80 -24Z', fill: deep, filter: sh }, v);
      for (let i = -2; i <= 2; i++) {
        s('ellipse', { cx: 0, cy: -132, rx: 4.5, ry: 11, fill: mid, stroke: deep, 'stroke-width': 0.8, transform: `rotate(${i * 32} 0 -122)` }, v);
      }
      for (const sx of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          s('ellipse', { cx: sx * 46, cy: 56 - i * 9, rx: 3.5, ry: 7, fill: mid, stroke: deep, 'stroke-width': 0.7, transform: `rotate(${sx * (30 + i * 25)} ${sx * 46} ${62 - i * 9})` }, v);
        }
      }

      // Bird door
      const DOOR = 'M-11 -52 V-72 A11 11 0 0 1 11 -72 V-52Z';
      s('path', { d: DOOR, fill: '#120a04', stroke: deep, 'stroke-width': 2.5 }, v);
      const door = s('path', { d: DOOR, fill: mid, stroke: deep, 'stroke-width': 1 }, v);
      const bird = s('g', { visibility: 'hidden' }, v);
      s('path', { d: 'M-4 2 L-14 6 L-12 -1Z', fill: '#4a3420' }, bird);
      s('ellipse', { cx: 0, cy: 0, rx: 9, ry: 6.5, fill: '#7a5a3a' }, bird);
      s('ellipse', { cx: 2, cy: 2.5, rx: 5.5, ry: 3.5, fill: '#d8c3a0' }, bird);
      s('circle', { cx: 6, cy: -5, r: 4.6, fill: '#7a5a3a' }, bird);
      s('circle', { cx: 7.4, cy: -6, r: 0.9, fill: '#111' }, bird);
      const beak = s('path', { d: 'M10 -5.5 L15.5 -4.5 L10 -3.2Z', fill: '#e39a2d' }, bird);
      s('path', { d: 'M-5 -1 Q1 -6 6 0', fill: 'none', stroke: '#4a3420', 'stroke-width': 1.2 }, bird);

      // Dial
      const C = 14;
      const dial = s('g', { transform: `translate(0 ${C}) scale(1.15)` }, v);
      s('circle', { r: 41, fill: brass }, dial);
      s('circle', { r: 37.5, fill: o.dial }, dial);
      for (let i = 0; i < 60; i++) {
        const [x, y] = polar(i * 6, 34.5);
        s('circle', { cx: x, cy: y, r: i % 5 ? 0.5 : 1.1, fill: o.ink }, dial);
      }
      for (let i = 0; i < 12; i++) {
        const [x, y] = polar(i * 30, 27);
        s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': o.numerals === 'roman' ? 6.5 : 8, 'font-weight': 600, 'font-family': font('playfair') }, dial)
          .textContent = o.numerals === 'roman' ? romanHour(i, g) : String(i || 12);
      }
      const hourH = hand(dial, 'M-2.4 6 L-2 -14 C-7 -16 -7 -22 0 -24 C7 -22 7 -16 2 -14 L2.4 6Z', o.ink, sh);
      const minH = hand(dial, 'M-1.6 8 L-1.3 -25 C-4.5 -27 -4.5 -31 0 -34.5 C4.5 -31 4.5 -27 1.3 -25 L1.6 8Z', o.ink, sh);
      s('circle', { r: 2.6, fill: brass }, dial);

      const amp = reduceMotion ? 0 : 9;
      const CALL = 1.3; // seconds per "cu-ckoo"
      return {
        tick(t) {
          pend.setAttribute('transform', `rotate(${(amp * Math.cos(2 * Math.PI * t.sec)).toFixed(3)} 0 70)`);
          const day = (t.h + t.m / 60) / 24;
          leftW(84 + 30 * day);
          rightW(84 + 30 * ((day + 0.37) % 1));
          const min = t.m + t.sec / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);

          // Calls once per hour struck on the hour, once on the half hour
          let calls = 0, e = -1;
          if (o.call === 'minute') { calls = t.m === 0 ? h12(t.h) : 1; e = t.sec; }
          else if (o.call === 'hour') {
            if (t.m < 30) { calls = h12(t.h); e = t.m * 60 + t.sec; }
            else { calls = 1; e = (t.m - 30) * 60 + t.sec; }
          }
          const dur = calls * CALL;
          const open = e >= 0 && e < dur + 0.8 ? clamp(Math.min(e, dur + 0.8 - e) / 0.3, 0, 1) : 0;
          door.setAttribute('transform', `translate(-11 0) scale(${(1 - 0.85 * open).toFixed(3)} 1) translate(11 0)`);
          let out = 0;
          if (e >= 0.3 && e < dur + 0.3) out = Math.sin(Math.PI * Math.min(((e - 0.3) % CALL) / (CALL * 0.75), 1));
          bird.setAttribute('visibility', out > 0.02 ? 'visible' : 'hidden');
          bird.setAttribute('transform', `translate(0 ${(-60 + 8 * out).toFixed(2)}) scale(${(0.55 + 0.85 * out).toFixed(3)})`);
          beak.setAttribute('transform', `rotate(${(out > 0.6 ? 12 : 0)} 10 -4.5)`);
        },
      };
    },
  };

  const grandfather = {
    id: 'grandfather', name: 'Grandfather', group: 'Analog',
    options: [
      color('bg', 'Background', '#1b1714'),
      choice('wood', 'Case', 'mahogany', [['mahogany', 'Mahogany'], ['walnut', 'Walnut'], ['oak', 'Oak'], ['ebony', 'Ebony'], ['white', 'Painted white']]),
      choice('metal', 'Brass', 'gold', [['gold', 'Brass'], ['silver', 'Silver']]),
      color('dial', 'Dial', '#f3ead6'),
      color('ink', 'Numerals & hands', '#1f1a16'),
      toggle('moon', 'Moon phase', true),
      range('swing', 'Pendulum swing', 5, 0, 10),
      toggle('shadow', 'Shadows', true),
      motion('tick'),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-70 -152 140 302', class: 'cf-svg' }, root);
      const defs = s('defs', null, v);
      const sh = o.shadow ? shadowFilter(v, 0.4) : null;
      const wood = woodFill(defs, o.wood);
      const [, mid, deep] = WOODS[o.wood] || WOODS.walnut;
      const brass = metalFill(defs, o.metal);
      const [, brassMid] = METALS[o.metal] || METALS.gold;
      const id = 'gf' + ++uid;

      // Base and trunk
      s('rect', { x: -46, y: 138, width: 92, height: 8, rx: 2, fill: deep }, v);
      s('rect', { x: -42, y: 106, width: 84, height: 34, fill: wood, filter: sh }, v);
      s('rect', { x: -32, y: 113, width: 64, height: 19, rx: 3, fill: 'none', stroke: deep, 'stroke-width': 1.2, opacity: 0.6 }, v);
      s('rect', { x: -35, y: 14, width: 70, height: 96, fill: wood, filter: sh }, v);
      s('rect', { x: -39, y: 102, width: 78, height: 6, fill: deep }, v);

      // Trunk window with weights and the pendulum
      const WIN = 'M-24 98 V44 A24 18 0 0 1 24 44 V98Z';
      s('clipPath', { id: id + 'w' }, defs).appendChild(s('path', { d: WIN }));
      s('path', { d: WIN, fill: deep }, v);
      const inside = s('g', { 'clip-path': `url(#${id}w)` }, v);
      const weights = [-14, 0, 14].map((x, i) => {
        const cable = s('line', { x1: x, y1: 14, x2: x, stroke: brassMid, 'stroke-width': 0.6 }, inside);
        const w = s('rect', { x: x - 5, width: 10, height: 20, rx: 2, fill: brass }, inside);
        return (y) => { cable.setAttribute('y2', y); w.setAttribute('y', y); };
      });
      const pend = s('g', null, inside);
      s('rect', { x: -1, y: 10, width: 2, height: 74, fill: brassMid }, pend);
      s('circle', { cy: 84, r: 11, fill: brass, stroke: METALS[o.metal]?.[0] || '#6e4f17', 'stroke-width': 0.8 }, pend);
      s('path', { d: WIN, fill: 'none', stroke: brassMid, 'stroke-width': 1.6 }, v);
      s('path', { d: 'M-18 48 L-8 43 L-20 92 L-20 62Z', fill: '#fff', opacity: 0.06 }, v);

      // Hood with a swan-neck top and finials
      s('path', { d: 'M-52 16 V-104 Q-26 -150 0 -128 Q26 -150 52 -104 V16Z', fill: wood, filter: sh }, v);
      s('path', { d: 'M-52 -104 Q-26 -150 0 -128 Q26 -150 52 -104', fill: 'none', stroke: deep, 'stroke-width': 3 }, v);
      for (const [x, y, r] of [[0, -134, 5], [-48, -110, 3.8], [48, -110, 3.8]]) {
        s('circle', { cx: x, cy: y, r, fill: brass }, v);
        s('path', { d: `M${x - 1.2} ${y - r + 0.5} L${x} ${y - r - 6} L${x + 1.2} ${y - r + 0.5}Z`, fill: brass }, v);
      }
      for (const x of [-47, 44]) s('rect', { x, y: -100, width: 3, height: 112, fill: brass }, v);
      s('rect', { x: -54, y: 12, width: 108, height: 6, fill: deep }, v);

      // Break-arch dial: square chapter area plus a moon-phase arch
      const CY = -26, AY = -62;
      s('path', { d: `M-37 10 V${AY} A37 37 0 0 1 37 ${AY} V10Z`, fill: o.dial, stroke: brassMid, 'stroke-width': 1.2 }, v);
      if (o.moon) {
        s('clipPath', { id: id + 'm' }, defs).appendChild(s('path', { d: `M-33 ${AY} A33 33 0 0 1 33 ${AY}Z` }));
        const disc = s('g', null, s('g', { 'clip-path': `url(#${id}m)` }, v));
        s('circle', { cx: 0, cy: AY, r: 33, fill: '#1c2a55' }, disc);
        let seed = 3;
        const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        for (let i = 0; i < 26; i++) {
          const [x, y] = polar(rnd() * 360, 6 + rnd() * 26);
          s('circle', { cx: x, cy: AY + y, r: 0.35 + rnd() * 0.5, fill: '#f6e7b0' }, disc);
        }
        for (const y of [-21, 21]) {
          s('circle', { cx: 0, cy: AY + y, r: 9, fill: '#f1e1a6' }, disc);
          s('circle', { cx: -2.5, cy: AY + y - 2, r: 1.6, fill: '#d9c37f' }, disc);
          s('circle', { cx: 3, cy: AY + y + 2.5, r: 1.1, fill: '#d9c37f' }, disc);
        }
        // The two "hemisphere" humps hide the moon at new moon
        for (const x of [-16.5, 16.5]) s('path', { d: `M${x - 16.5} ${AY} A16.5 16.5 0 0 1 ${x + 16.5} ${AY}Z`, fill: o.dial, stroke: brassMid, 'stroke-width': 0.8 }, v);
        // The disc carries two moons, so it turns half a revolution per lunar month:
        // hidden behind a hump at new moon, upright at full moon.
        disc.setAttribute('transform', `rotate(${((moonAge(new Date()) / SYNODIC) * 180 - 90).toFixed(2)} 0 ${AY})`);
      } else {
        s('text', { y: AY - 16, fill: o.ink, 'text-anchor': 'middle', 'font-size': 7, 'letter-spacing': 1.5, 'font-family': font('playfair') }, v).textContent = 'TEMPUS FUGIT';
      }

      // Gilded spandrels in the corners
      for (const [x, y] of [[-30, 3], [30, 3], [-30, -55], [30, -55]]) {
        const sp = s('g', { transform: `translate(${x} ${y})`, fill: brass }, v);
        s('circle', { r: 2.4 }, sp);
        for (let i = 0; i < 4; i++) s('ellipse', { cy: -3.6, rx: 1.2, ry: 2.4, transform: `rotate(${i * 90 + 45})` }, sp);
      }

      const dial = s('g', { transform: `translate(0 ${CY})` }, v);
      s('circle', { r: 33, fill: 'none', stroke: o.ink, 'stroke-width': 0.5 }, dial);
      s('circle', { r: 30.5, fill: 'none', stroke: o.ink, 'stroke-width': 0.4 }, dial);
      s('circle', { r: 23, fill: 'none', stroke: o.ink, 'stroke-width': 0.4 }, dial);
      for (let i = 0; i < 60; i++) {
        const [x1, y1] = polar(i * 6, 33), [x2, y2] = polar(i * 6, 30.5);
        s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': i % 5 ? 0.35 : 0.9 }, dial);
      }
      for (let i = 0; i < 12; i++) {
        s('text', { y: -26.8, transform: `rotate(${i * 30})`, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 5.6, 'font-family': font('playfair'), 'font-weight': 600 }, dial)
          .textContent = romanHour(i, g);
      }
      // Seconds sub-dial
      const sub = s('g', { transform: 'translate(0 -11)' }, dial);
      s('circle', { r: 6.5, fill: 'none', stroke: o.ink, 'stroke-width': 0.4 }, sub);
      for (let i = 0; i < 12; i++) {
        const [x1, y1] = polar(i * 30, 6.5), [x2, y2] = polar(i * 30, 5.3);
        s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': 0.4 }, sub);
      }
      const secH = handGroup(sub, null);
      s('line', { y1: 1.5, y2: -6, stroke: o.ink, 'stroke-width': 0.5 }, secH);

      const hourH = hand(dial, 'M-1.4 4 L-1.2 -11 C-4.6 -12.5 -4.6 -17 -0.7 -18.5 L0 -20.5 L0.7 -18.5 C4.6 -17 4.6 -12.5 1.2 -11 L1.4 4Z', o.ink, sh);
      const minH = hand(dial, 'M-0.9 5 L-0.8 -21 C-3.2 -22.3 -3.2 -25.5 -0.6 -26.5 L0 -31.5 L0.6 -26.5 C3.2 -25.5 3.2 -22.3 0.8 -21 L0.9 5Z', o.ink, sh);
      s('circle', { r: 1.6, fill: brass }, dial);

      const amp = reduceMotion ? 0 : +o.swing;
      return {
        tick(t) {
          pend.setAttribute('transform', `rotate(${(amp * Math.cos(Math.PI * t.sec)).toFixed(3)} 0 10)`);
          // The weights sink over a week, as if wound every Sunday
          const week = (new Date().getDay() + (t.h + t.m / 60) / 24) / 7;
          weights.forEach((set, i) => set(30 + 40 * ((week + i * 0.06) % 1)));
          const min = t.m + t.s / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          rot(secH, secOf(t, o) * 6);
        },
      };
    },
  };

  const ALARMS = ['5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00', '12:00'];

  const alarm = {
    id: 'alarm', name: 'Twin Bell', group: 'Analog',
    options: [
      color('bg', 'Background', '#bfd8cf'),
      color('case', 'Case', '#d8463a'),
      toggle('chrome', 'Chrome bells', true),
      color('dial', 'Dial', '#f6f0e1'),
      color('ink', 'Numerals & hands', '#1b1b1b'),
      choice('alarm', 'Alarm', '7:00', [['off', 'Off'], ...ALARMS.map((a) => [a, a]), ['minute', 'Every minute (preview)']]),
      toggle('shadow', 'Shadows', true),
      motion('tick'),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-112 -134 224 248', class: 'cf-svg' }, root);
      const defs = s('defs', null, v);
      const sh = o.shadow ? shadowFilter(v, 0.3) : null;
      const chrome = metalFill(defs, 'silver');
      const body = s('g', null, v);
      const bellFill = o.chrome ? chrome : o.case;

      // Legs
      for (const sx of [-1, 1]) {
        s('path', { d: `M${sx * 48} 58 L${sx * 66} 98`, stroke: '#9aa0a8', 'stroke-width': 7, 'stroke-linecap': 'round' }, body);
        s('circle', { cx: sx * 67, cy: 100, r: 6, fill: chrome }, body);
      }
      // Bells, hammer and handle
      for (const sx of [-1, 1]) {
        const bell = s('g', { transform: `translate(${sx * 50} -76) rotate(${sx * 36})`, filter: sh }, body);
        s('rect', { x: -2, y: -6, width: 4, height: 18, fill: '#9aa0a8' }, bell);
        s('path', { d: 'M-30 2 A30 28 0 0 1 30 2 Z', fill: bellFill }, bell);
        s('rect', { x: -32, y: 0, width: 64, height: 4, rx: 2, fill: bellFill }, bell);
        s('circle', { cy: -27, r: 3.5, fill: chrome }, bell);
      }
      const hammer = s('g', null, body);
      s('rect', { x: -1.5, y: -112, width: 3, height: 26, fill: '#9aa0a8' }, hammer);
      s('circle', { cy: -114, r: 5, fill: chrome }, hammer);
      s('path', { d: 'M-24 -84 C-26 -128 26 -128 24 -84', fill: 'none', stroke: '#9aa0a8', 'stroke-width': 5, 'stroke-linecap': 'round' }, body);

      // Case and dial
      s('circle', { r: 86, fill: o.case, filter: sh }, body);
      s('circle', { r: 80, fill: chrome }, body);
      s('circle', { r: 73, fill: o.dial }, body);
      for (let i = 0; i < 60; i++) {
        const [x1, y1] = polar(i * 6, 70), [x2, y2] = polar(i * 6, i % 5 ? 67 : 64);
        s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': i % 5 ? 0.8 : 2 }, body);
      }
      for (let i = 0; i < 12; i++) {
        const [x, y] = polar(i * 30, 52);
        s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 17, 'font-weight': 700, 'font-family': font('oswald') }, body)
          .textContent = String(i || 12);
      }
      const [ah, am] = o.alarm.includes(':') ? o.alarm.split(':').map(Number) : [null, null];
      const hourH = hand(body, 'M-3.6 10 L-3 -30 C-9 -32 -9 -40 0 -44 C9 -40 9 -32 3 -30 L3.6 10Z', o.ink, sh);
      const minH = hand(body, 'M-2.6 12 L-2 -52 C-6.5 -54 -6.5 -60 0 -68 C6.5 -60 6.5 -54 2 -52 L2.6 12Z', o.ink, sh);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(body, sh);
        s('line', { y1: 14, y2: -69.5, stroke: '#c7372b', 'stroke-width': 1.1 }, secH);
      }
      s('circle', { r: 5, fill: chrome }, body);

      return {
        tick(t) {
          const sec = secOf(t, o);
          const min = t.m + sec / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          if (secH) rot(secH, sec * 6);
          // Ring for the first 30 seconds of the alarm minute (3 seconds in preview mode)
          const ringing = o.alarm === 'minute' ? t.s < 3 : ah != null && t.h % 12 === ah % 12 && t.m === am && t.s < 30;
          if (ringing && !reduceMotion) {
            const p = performance.now() / 1000;
            body.setAttribute('transform', `translate(${(Math.sin(p * 70) * 1.6).toFixed(2)} 0) rotate(${(Math.sin(p * 47) * 1.2).toFixed(2)})`);
            hammer.setAttribute('transform', `rotate(${Math.sin(p * 90) > 0 ? 18 : -18} 0 -86)`);
          } else {
            body.removeAttribute('transform');
            hammer.removeAttribute('transform');
          }
        },
      };
    },
  };

  // Involute-ish spur gear outline centred on 0,0, with a tooth pointing straight up.
  function gearPath(teeth, m) {
    const rp = (m * teeth) / 2, ro = rp + m, rr = rp - 1.25 * m, w = 360 / teeth;
    const pts = [];
    for (let i = 0; i < teeth; i++) {
      const a = i * w;
      pts.push(polar(a - w * 0.27, rr), polar(a - w * 0.13, ro), polar(a + w * 0.13, ro), polar(a + w * 0.27, rr));
    }
    const rim = rr - 3.2;
    return `M${pts.map((p) => p.join(' ')).join(' L')}Z M0 ${-rim} A${rim} ${rim} 0 1 0 0 ${rim} A${rim} ${rim} 0 1 0 0 ${-rim}Z`;
  }

  const GEAR_METALS = {
    mixed: ['#c9a04e', '#b8693d', '#a9aeb5'],
    brass: ['#c9a04e', '#b48a3c', '#d8b56a'],
    copper: ['#b8693d', '#9c5532', '#cf8657'],
    steel: ['#a9aeb5', '#8a9098', '#c4c8ce'],
  };

  const gears = {
    id: 'gears', name: 'Gears', group: 'Analog',
    options: [
      color('bg', 'Background', '#15120f'),
      choice('metal', 'Gears', 'mixed', [['mixed', 'Brass, copper & steel'], ['brass', 'Brass'], ['copper', 'Copper'], ['steel', 'Steel']]),
      color('ring', 'Chapter ring', '#efe3c4'),
      color('hands', 'Hands', '#1a1410'),
      toggle('shadow', 'Shadows', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const sh = o.shadow ? shadowFilter(v, 0.5) : null;
      const metals = GEAR_METALS[o.metal] || GEAR_METALS.mixed;
      const M = 2;
      // Gears only show through the open centre of the dial
      const clipId = 'gc' + ++uid;
      s('circle', { r: 76 }, s('clipPath', { id: clipId }, s('defs', null, v)));
      const train = s('g', { 'clip-path': `url(#${clipId})` }, v);
      // [teeth, parent index, direction from parent (deg)]; the first gear turns once a minute.
      const TRAIN = [[40], [16, 0, 45], [24, 1, 330], [20, 0, 200], [30, 0, 260], [14, 0, 130]];
      const placed = [];
      TRAIN.forEach(([n, parent, dir], i) => {
        let x = 0, y = 0;
        if (parent != null) {
          const p = placed[parent];
          [x, y] = polar(dir, (M * (n + p.n)) / 2).map((d, k) => d + [p.x, p.y][k]);
        }
        const outer = s('g', { transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`, filter: sh }, train);
        const turn = s('g', null, outer);
        const c = metals[i % metals.length];
        s('path', { d: gearPath(n, M), fill: c, 'fill-rule': 'evenodd', stroke: mix(c, '#000000', 0.35), 'stroke-width': 0.5 }, turn);
        const spokes = n > 24 ? 6 : n > 15 ? 5 : 4, rim = (M * n) / 2 - 1.25 * M - 3;
        for (let k = 0; k < spokes; k++) s('rect', { x: -1.6, y: -rim - 0.5, width: 3.2, height: rim, fill: c, transform: `rotate(${(k * 360) / spokes})` }, turn);
        s('circle', { r: Math.max(3.5, n / 6), fill: mix(c, '#ffffff', 0.15), stroke: mix(c, '#000000', 0.3), 'stroke-width': 0.5 }, turn);
        s('circle', { r: 1.4, fill: mix(c, '#000000', 0.5) }, turn);
        placed.push({ n, x, y, turn, parent, dir });
      });

      // Chapter ring with an open centre
      s('path', { d: 'M0 -92 A92 92 0 1 1 0 92 A92 92 0 1 1 0 -92Z M0 -74 A74 74 0 1 0 0 74 A74 74 0 1 0 0 -74Z', fill: o.ring, 'fill-rule': 'evenodd', opacity: 0.94, filter: sh }, v);
      s('circle', { r: 89.5, fill: 'none', stroke: o.hands, 'stroke-width': 0.6 }, v);
      s('circle', { r: 76.5, fill: 'none', stroke: o.hands, 'stroke-width': 0.6 }, v);
      for (let i = 0; i < 60; i++) {
        const [x1, y1] = polar(i * 6, 89.5), [x2, y2] = polar(i * 6, i % 5 ? 87 : 85);
        s('line', { x1, y1, x2, y2, stroke: o.hands, 'stroke-width': i % 5 ? 0.6 : 1.4 }, v);
      }
      for (let i = 0; i < 12; i++) {
        s('text', { y: -80.5, transform: `rotate(${i * 30})`, fill: o.hands, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 8.5, 'font-weight': 600, 'font-family': font('cinzel') }, v)
          .textContent = romanHour(i, g);
      }

      // Openwork hands
      const outline = { fill: o.hands, stroke: metals[0], 'stroke-width': 0.8 };
      const hourH = handGroup(v, sh);
      s('path', Object.assign({ d: 'M-3 8 L-2.4 -32 C-10 -34 -10 -46 0 -50 C10 -46 10 -34 2.4 -32 L3 8Z M0 -46 C-5 -44 -5 -37 0 -36 C5 -37 5 -44 0 -46Z', 'fill-rule': 'evenodd' }, outline), hourH);
      const minH = handGroup(v, sh);
      s('path', Object.assign({ d: 'M-2.2 10 L-1.8 -58 C-7 -60 -7 -68 -1.2 -72 L0 -87 L1.2 -72 C7 -68 7 -60 1.8 -58 L2.2 10Z M0 -69 C-3.5 -67 -3.5 -62 0 -61 C3.5 -62 3.5 -67 0 -69Z', 'fill-rule': 'evenodd' }, outline), minH);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, sh);
        s('line', { y1: 16, y2: -88, stroke: metals[1], 'stroke-width': 1.1 }, secH);
      }
      s('circle', { r: 4.5, fill: metals[0], stroke: o.hands, 'stroke-width': 0.6 }, v);

      return {
        tick(t) {
          const sec = secOf(t, o);
          // Each gear turns the other way to its parent, keeping its teeth meshed.
          placed.forEach((gr) => {
            if (gr.parent == null) gr.angle = sec * 6;
            else {
              const p = placed[gr.parent], ratio = p.n / gr.n;
              gr.angle = gr.dir + 180 - 180 / gr.n + ratio * (gr.dir - p.angle);
            }
            rot(gr.turn, gr.angle);
          });
          const min = t.m + sec / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          if (secH) rot(secH, sec * 6);
        },
      };
    },
  };

  // ---------- pets: a full-size round clock whose dial is the animal's face ----------

  // Cream dial with friendly numbers round the edge
  function petDial(v, o, fnt) {
    s('circle', { r: 85, fill: o.dial }, v);
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const [x, y] = polar(i * 6, 80);
      s('circle', { cx: x, cy: y, r: 0.9, fill: o.ink, opacity: 0.35 }, v);
    }
    for (let i = 0; i < 12; i++) {
      const [x, y] = polar(i * 30, 68);
      s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 17, 'font-weight': 600, 'font-family': fnt }, v)
        .textContent = String(i || 12);
    }
  }

  // Rounded hands on top of the face; returns tick(t)
  function petHands(v, o, g, sh) {
    const hourH = handGroup(v, sh);
    s('line', { y1: 5, y2: -44, stroke: o.ink, 'stroke-width': 6.5, 'stroke-linecap': 'round' }, hourH);
    const minH = handGroup(v, sh);
    s('line', { y1: 7, y2: -77, stroke: o.ink, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, minH);
    let secH = null;
    if (g.showSeconds) {
      secH = handGroup(v, sh);
      s('line', { y1: 12, y2: -80, stroke: o.accent, 'stroke-width': 1.5, 'stroke-linecap': 'round' }, secH);
    }
    s('circle', { r: 4.5, fill: o.ink }, v);
    s('circle', { r: 1.8, fill: o.accent }, v);
    return sweepHands(hourH, minH, secH, o.sweep === 'smooth');
  }

  // Eyes that glance around now and then (or sit still), with the odd blink.
  // pupils: [element, x range, y range]; eyes: [element, x, y]
  function petEyes(eyes, pupils, o) {
    const look = o.look && !reduceMotion;
    let cur = [0, 0], target = [0, 0], next = 0, last = 0, blinkUntil = 0;
    return () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - (last || now)) / 1000);
      last = now;
      if (now > next) {
        // Hold each glance for 0.6–3 s; a third of the time look straight ahead
        next = now + 600 + Math.random() * 2400;
        if (look) {
          const a = Math.random() * Math.PI * 2, r = Math.random() < 0.33 ? 0 : 0.6 + Math.random() * 0.4;
          target = [Math.cos(a) * r, Math.sin(a) * r];
        }
        if (Math.random() < 0.3) blinkUntil = now + 140;
      }
      // Quick, eased eye movement towards the new spot
      const k = 1 - Math.exp(-dt * 14);
      cur = [cur[0] + (target[0] - cur[0]) * k, cur[1] + (target[1] - cur[1]) * k];
      pupils.forEach(([p, rx, ry]) => p.setAttribute('transform', `translate(${(cur[0] * rx).toFixed(2)} ${(cur[1] * ry).toFixed(2)})`));
      const blink = now < blinkUntil;
      eyes.forEach(([e, x, y]) => e.setAttribute('transform', `translate(${x} ${y}) scale(1 ${blink ? 0.12 : 1})`));
    };
  }

  const cat = {
    id: 'cat', name: 'Cat', group: 'Creative',
    options: [
      color('bg', 'Background', '#f6d8e2'),
      color('fur', 'Fur', '#2a2a30'),
      color('dial', 'Face', '#fbf7f0'),
      color('ink', 'Numbers & hands', '#2a2a30'),
      color('eyes', 'Eyes', '#8fd16a'),
      color('accent', 'Nose & second hand', '#e2475b'),
      toggle('whiskers', 'Whiskers', true),
      toggle('look', 'Eyes look around', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -110 200 208', class: 'cf-svg' }, root);
      const sh = shadowFilter(v, 0.22);

      // Pointed ears behind the head
      for (const sx of [-1, 1]) {
        const pt = (a, r) => polar(sx * a, r).map((n) => n.toFixed(1)).join(' ');
        s('path', { d: `M${pt(8, 88)} L${pt(32, 116)} L${pt(58, 88)}Z`, fill: o.fur, stroke: o.fur, 'stroke-width': 8, 'stroke-linejoin': 'round' }, v);
        s('path', { d: `M${pt(17, 90)} L${pt(32, 107)} L${pt(48, 90)}Z`, fill: '#f4a7b9', stroke: '#f4a7b9', 'stroke-width': 4, 'stroke-linejoin': 'round' }, v);
      }
      s('circle', { r: 93, fill: o.fur, filter: sh }, v);
      petDial(v, o, font('fredoka'));

      // Face: slit-pupil eyes, blush, nose, mouth and whiskers
      const eyes = [], pupils = [];
      for (const sx of [-1, 1]) {
        s('ellipse', { cx: sx * 38, cy: 17, rx: 8, ry: 4.5, fill: '#f08aa0', opacity: 0.4 }, v);
        const eye = s('g', null, v);
        s('ellipse', { rx: 11, ry: 12.5, fill: o.eyes }, eye);
        const pupil = s('g', null, eye);
        s('ellipse', { rx: 3.4, ry: 8.5, fill: '#15151a' }, pupil);
        s('circle', { cx: 3.6, cy: -5, r: 2.4, fill: '#fff', opacity: 0.9 }, eye);
        eyes.push([eye, sx * 27, -22]);
        pupils.push([pupil, 5.5, 2.5]);
        if (o.whiskers) {
          for (const [y1, y2] of [[9, 3], [13, 13], [17, 23]]) {
            s('line', { x1: sx * 17, y1, x2: sx * 52, y2, stroke: o.ink, 'stroke-width': 1, 'stroke-linecap': 'round', opacity: 0.45 }, v);
          }
        }
      }
      s('path', { d: 'M-5 6 L5 6 L0 11.5Z', fill: o.accent, stroke: o.accent, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, v);
      s('path', { d: 'M-8 16 Q-4 21 0 15 Q4 21 8 16', fill: 'none', stroke: o.ink, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, v);

      const eyeTick = petEyes(eyes, pupils, o);
      const handTick = petHands(v, o, g, sh);
      return { tick(t) { eyeTick(t); handTick(t); } };
    },
  };

  const dog = {
    id: 'dog', name: 'Dog', group: 'Creative',
    options: [
      color('bg', 'Background', '#d4ebf5'),
      color('fur', 'Fur', '#d99a5b'),
      color('ears', 'Ears & patch', '#7d4f2c'),
      color('dial', 'Face', '#fffaf0'),
      color('ink', 'Numbers & hands', '#3a2a22'),
      color('accent', 'Tongue & second hand', '#ef5d7d'),
      toggle('patch', 'Eye patch', true),
      toggle('tongue', 'Panting tongue', true),
      toggle('look', 'Eyes look around', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-120 -100 240 200', class: 'cf-svg' }, root);
      const sh = shadowFilter(v, 0.22);

      s('circle', { r: 93, fill: o.fur, filter: sh }, v);
      petDial(v, o, font('fredoka'));

      // Eyes (one in a patch), muzzle, nose, mouth and tongue
      if (o.patch) s('ellipse', { cx: -27, cy: -23, rx: 17, ry: 16, fill: o.ears, opacity: 0.9, transform: 'rotate(-12 -27 -23)' }, v);
      const eyes = [], pupils = [];
      for (const sx of [-1, 1]) {
        const eye = s('g', null, v);
        s('ellipse', { rx: 9.5, ry: 10.5, fill: '#ffffff' }, eye);
        const pupil = s('g', null, eye);
        s('circle', { r: 6.5, fill: '#2a1d16' }, pupil);
        s('circle', { cx: 2.4, cy: -2.6, r: 2.2, fill: '#fff' }, pupil);
        eyes.push([eye, sx * 27, -23]);
        pupils.push([pupil, 2.6, 3.2]);
      }
      s('ellipse', { cy: 19, rx: 27, ry: 18, fill: mix(o.fur, '#ffffff', 0.55) }, v);
      let tongue = null;
      if (o.tongue) {
        tongue = s('g', null, v);
        s('path', { d: 'M-6.5 22 L-6.5 31 Q-6.5 37 0 37 Q6.5 37 6.5 31 L6.5 22Z', fill: o.accent }, tongue);
        s('line', { y1: 25, y2: 32, stroke: mix(o.accent, '#000000', 0.25), 'stroke-width': 1, 'stroke-linecap': 'round' }, tongue);
      }
      s('path', { d: 'M0 14 L0 20 M-10 19 Q-5 26 0 20 Q5 26 10 19', fill: 'none', stroke: o.ink, 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, v);
      s('ellipse', { cy: 9, rx: 10, ry: 7, fill: '#22201f' }, v);
      s('ellipse', { cx: -3, cy: 6.5, rx: 3, ry: 1.6, fill: '#fff', opacity: 0.5 }, v);

      // Floppy ears hanging over the sides
      for (const sx of [-1, 1]) {
        s('path', { d: 'M46 -79 C90 -106 124 -66 118 -16 C115 10 98 24 88 8 C82 -6 86 -46 46 -79Z', fill: o.ears, filter: sh, transform: `scale(${sx} 1)` }, v);
      }

      const eyeTick = petEyes(eyes, pupils, o);
      const handTick = petHands(v, o, g, sh);
      const pant = o.tongue && !reduceMotion;
      return {
        tick(t) {
          eyeTick(t);
          handTick(t);
          if (tongue && pant) tongue.setAttribute('transform', `translate(0 22) scale(1 ${(1 + 0.12 * Math.sin(t.sec * Math.PI * 4)).toFixed(3)}) translate(0 -22)`);
        },
      };
    },
  };

  // Squares of the golden rectangle: [value, x, y]
  const FIB = [[2, 0, 0], [1, 2, 0], [1, 2, 1], [3, 0, 2], [5, 3, 0]];
  const FIB_SUMS = (() => {
    const sums = Array.from({ length: 13 }, () => []);
    for (let mask = 0; mask < 32; mask++) {
      sums[FIB.reduce((a, [val], i) => a + (mask >> i & 1 ? val : 0), 0)].push(mask);
    }
    return sums;
  })();

  const fibonacci = {
    id: 'fibonacci', name: 'Fibonacci', group: 'Creative',
    options: [
      color('bg', 'Background', '#151515'),
      color('hours', 'Hours', '#e5484d'),
      color('minutes', 'Minutes', '#46a758'),
      color('both', 'Both', '#3e63dd'),
      color('off', 'Unused', '#ecebe6'),
      toggle('dots', 'Show leftover minutes', true),
      toggle('legend', 'Show legend', true),
      toggle('values', 'Show square values', false),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: `-0.2 -0.2 8.4 ${o.legend || o.dots ? 6.5 : 5.4}`, class: 'cf-svg' }, root);
      const cells = FIB.map(([val, x, y]) => {
        const r = s('rect', { x: x + 0.05, y: y + 0.05, width: val - 0.1, height: val - 0.1, rx: 0.08, fill: o.off }, v);
        if (o.values) s('text', { x: x + 0.22, y: y + 0.38, 'font-size': 0.28, fill: '#000', opacity: 0.35, 'font-weight': 700, 'font-family': font('inter') }, v).textContent = String(val);
        return r;
      });
      const dots = o.dots ? Array.from({ length: 4 }, (_, i) => s('circle', { cx: 0.2 + i * 0.42, cy: 5.75, r: 0.12, fill: o.off, opacity: 0.25 }, v)) : [];
      if (o.legend) {
        [['hours', 'hours', 2.1], ['minutes', 'minutes × 5', 3.75], ['both', 'both', 6.35]].forEach(([k, label, x]) => {
          s('rect', { x, y: 5.6, width: 0.3, height: 0.3, rx: 0.05, fill: o[k] }, v);
          s('text', { x: x + 0.42, y: 5.76, 'font-size': 0.28, fill: o.off, opacity: 0.75, 'dominant-baseline': 'central', 'font-family': font('inter') }, v).textContent = label;
        });
      }
      const pick = (list) => list[Math.floor(Math.random() * list.length)];
      const minute = gate();
      return {
        tick(t) {
          if (!minute(`${t.h}:${t.m}`)) return;
          // Any of the valid combinations will do; real Fibonacci clocks pick one at random.
          const hm = pick(FIB_SUMS[h12(t.h)]), mm = pick(FIB_SUMS[Math.floor(t.m / 5)]);
          cells.forEach((cell, i) => {
            const hb = hm >> i & 1, mb = mm >> i & 1;
            cell.setAttribute('fill', hb && mb ? o.both : hb ? o.hours : mb ? o.minutes : o.off);
          });
          dots.forEach((d, i) => d.setAttribute('opacity', i < t.m % 5 ? 0.9 : 0.25));
        },
      };
    },
  };

  // The time the way children learn to say it: "quarter past three", "ten to four"
  function kidsWords(h, m) {
    const hour = (x) => ONES[h12(x % 24)];
    if (m === 0) return `${hour(h)} o’clock`;
    if (m === 15) return `quarter past ${hour(h)}`;
    if (m === 30) return `half past ${hour(h)}`;
    if (m === 45) return `quarter to ${hour(h + 1)}`;
    const n = m < 30 ? m : 60 - m;
    const mins = `${words(n).replace('‑', '-')} ${n === 1 ? 'minute' : 'minutes'}`;
    return m < 30 ? `${mins} past ${hour(h)}` : `${mins} to ${hour(h + 1)}`;
  }

  const kids = {
    id: 'kids', name: 'Kids', group: 'Analog',
    options: [
      color('bg', 'Background', '#fff6dc'),
      color('dial', 'Dial', '#ffffff'),
      color('rim', 'Rim', '#ffb703'),
      color('hourc', 'Hour hand & numbers', '#e5484d'),
      color('minc', 'Minute hand & numbers', '#3e63dd'),
      toggle('minutes', 'Minute numbers (5, 10, 15…)', false),
      toggle('words', 'Time in words', true),
      toggle('digital', 'Digital time', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const below = o.words || o.digital;
      const v = s('svg', { viewBox: `-100 -100 200 ${below ? 236 : 200}`, class: 'cf-svg' }, root);
      const sh = shadowFilter(v, 0.25);
      const fnt = font('fredoka');

      s('circle', { r: 96, fill: o.rim, filter: sh }, v);
      s('circle', { r: 89, fill: o.dial }, v);
      // Minute ticks and numbers round the edge
      for (let i = 0; i < 60; i++) {
        const five = i % 5 === 0;
        const [x1, y1] = polar(i * 6, 88), [x2, y2] = polar(i * 6, five ? 80 : 84);
        s('line', { x1, y1, x2, y2, stroke: o.minutes ? o.minc : '#333', 'stroke-width': five ? 2 : 1, 'stroke-linecap': 'round', opacity: five ? 1 : 0.6 }, v);
      }
      if (o.minutes) {
        for (let i = 0; i < 12; i++) {
          const [x, y] = polar(i * 30, 74.5);
          s('text', { x, y, fill: o.minc, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 7.5, 'font-weight': 600, 'font-family': fnt }, v)
            .textContent = pad(i * 5);
        }
      }
      for (let i = 0; i < 12; i++) {
        const [x, y] = polar(i * 30, o.minutes ? 52 : 60);
        s('text', { x, y, fill: o.hourc, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': o.minutes ? 26 : 32, 'font-weight': 700, 'font-family': fnt }, v)
          .textContent = String(i || 12);
      }

      const line = (len, width, colour, tail) => {
        const grp = handGroup(v, sh);
        s('line', { y1: tail, y2: -len, stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round' }, grp);
        return grp;
      };
      const hourH = line(46, 9, o.hourc, 8);
      const minH = line(82, 6, o.minc, 10);
      const secH = g.showSeconds ? line(86, 1.6, '#f59f00', 14) : null;
      s('circle', { r: 7, fill: o.minc }, v);
      s('circle', { r: 3, fill: o.dial }, v);

      const say = o.words ? s('text', { y: 118, fill: '#333', 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, 'font-family': fnt }, v) : null;
      const digits = o.digital ? s('text', { y: o.words ? 133 : 120, 'text-anchor': 'middle', 'font-size': o.words ? 11 : 16, 'font-weight': 700, 'font-family': fnt }, v) : null;
      let hh, mm;
      if (digits) {
        hh = s('tspan', { fill: o.hourc }, digits);
        s('tspan', { fill: '#999' }, digits).textContent = ':';
        mm = s('tspan', { fill: o.minc }, digits);
      }
      const minute = gate();
      return {
        tick(t) {
          const sec = secOf(t, o);
          // Hands step with the minute so the position always matches the words
          const min = t.m + (g.showSeconds ? sec / 60 : 0);
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          if (secH) rot(secH, sec * 6);
          if (!minute(`${t.h}:${t.m}`)) return;
          if (say) say.textContent = kidsWords(t.h, t.m);
          if (digits) {
            hh.textContent = hourText(t.h, g);
            mm.textContent = pad(t.m) + (g.hour24 ? '' : ' ' + ampm(t.h));
          }
        },
      };
    },
  };

  const HEART = 'M0 3 C-6 -2 -6 -7 -3 -8 C-1.5 -8.6 0 -7.5 0 -6 C0 -7.5 1.5 -8.6 3 -8 C6 -7 6 -2 0 3Z';
  const CUTE_PINKS = ['#ff4d94', '#ff6fae', '#f7559b', '#ff7eb6'];
  const CUTE_RAINBOW = ['#ff6fae', '#ff9f68', '#f7c948', '#5cd3a1', '#56b4f5', '#a78bfa'];

  const cute = {
    id: 'cute', name: 'Cute', group: 'Creative',
    options: [
      color('bg', 'Background', '#ffc8dd'),
      color('dial', 'Dial', '#fff1f7'),
      color('rim', 'Rim', '#ff9cc4'),
      color('hands', 'Hands', '#d6336c'),
      choice('palette', 'Numbers', 'pink', [['pink', 'Pinks'], ['rainbow', 'Rainbow']]),
      toggle('face', 'Little face', true),
      toggle('hearts', 'Floating hearts', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      // Floating hearts across the whole background, so the clock itself stays full size
      const floaters = [];
      if (o.hearts) {
        const bg = s('svg', { class: 'cf-backdrop' }, root);
        [[8, 16, 1.6], [12, 68, 1.1], [5, 90, 0.8], [91, 12, 1.2], [95, 48, 0.9], [88, 82, 1.5], [26, 6, 0.7], [74, 94, 0.7]].forEach(([x, y, k], i) => {
          const at = s('svg', { x: `${x}%`, y: `${y}%`, overflow: 'visible' }, bg);
          const heart = s('path', { d: HEART, fill: i % 3 ? '#ffffff' : '#ff6fae', opacity: i % 3 ? 0.75 : 0.9 }, at);
          floaters.push([heart, k * 3, i]);
        });
      }
      const v = s('svg', { viewBox: '-102 -102 204 204', class: 'cf-svg' }, root);
      const sh = shadowFilter(v, 0.18);
      const fnt = font('fredoka');

      // Scalloped "cloud" rim
      for (let i = 0; i < 20; i++) {
        const [x, y] = polar(i * 18, 88);
        s('circle', { cx: x, cy: y, r: 13, fill: o.rim }, v);
      }
      s('circle', { r: 88, fill: o.rim, filter: sh }, v);
      s('circle', { r: 82, fill: o.dial }, v);
      for (let i = 0; i < 60; i++) {
        if (i % 5 === 0) continue;
        const [x, y] = polar(i * 6, 76);
        s('circle', { cx: x, cy: y, r: 1, fill: o.rim }, v);
      }
      const palette = o.palette === 'rainbow' ? CUTE_RAINBOW : CUTE_PINKS;
      for (let i = 0; i < 12; i++) {
        const [x, y] = polar(i * 30, 60);
        const n = s('text', { x, y: y + 1, fill: palette[i % palette.length], 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 23, 'font-weight': 700, 'font-family': fnt, stroke: '#ffffff', 'stroke-width': 3, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, v);
        n.textContent = String(i || 12);
      }

      // A little face under the centre
      const eyes = [];
      if (o.face) {
        for (const sx of [-1, 1]) {
          s('ellipse', { cx: sx * 26, cy: 30, rx: 7, ry: 4, fill: '#ff8fb8', opacity: 0.55 }, v);
          const eye = s('g', { transform: `translate(${sx * 15} 21)` }, v);
          s('ellipse', { rx: 3.6, ry: 4.6, fill: '#3a2a33' }, eye);
          s('circle', { cx: 1.2, cy: -1.6, r: 1.3, fill: '#fff' }, eye);
          eyes.push(eye);
        }
        s('path', { d: 'M-5 30 Q-2.5 34 0 30 Q2.5 34 5 30', fill: 'none', stroke: '#3a2a33', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, v);
      }

      const hourH = handGroup(v, sh);
      s('line', { y1: 4, y2: -42, stroke: o.hands, 'stroke-width': 8, 'stroke-linecap': 'round' }, hourH);
      const minH = handGroup(v, sh);
      s('line', { y1: 6, y2: -71, stroke: o.hands, 'stroke-width': 5.5, 'stroke-linecap': 'round' }, minH);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, null);
        s('line', { y1: 10, y2: -72, stroke: '#ff6fae', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, secH);
        s('circle', { cy: -73, r: 3.2, fill: '#ff6fae' }, secH);
      }
      // Flower centre
      for (let i = 0; i < 5; i++) {
        const [x, y] = polar(i * 72, 4.2);
        s('circle', { cx: x, cy: y, r: 3.4, fill: '#ffffff' }, v);
      }
      s('circle', { r: 3, fill: '#f7c948' }, v);

      return {
        tick(t) {
          const sec = secOf(t, o);
          const min = t.m + sec / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          if (secH) rot(secH, sec * 6);
          const blink = t.s % 6 === 2 && t.ms < 150;
          eyes.forEach((e, i) => e.setAttribute('transform', `translate(${i ? 15 : -15} 21) scale(1 ${blink ? 0.15 : 1})`));
          const p = performance.now() / 1000;
          for (const [heart, k, i] of floaters) {
            const bob = reduceMotion ? 0 : Math.sin(p * 0.9 + i * 1.7) * k * 4;
            heart.setAttribute('transform', `translate(0 ${bob.toFixed(2)}) scale(${k}) rotate(${((i % 2 ? 1 : -1) * 12)})`);
          }
        },
      };
    },
  };

  // =====================================================================
  // EVERYDAY ANALOG
  // =====================================================================

  // Standard hour/minute/second hands for the everyday faces; returns tick(t).
  function sweepHands(hourH, minH, secH, smooth = true) {
    return (t) => {
      const sec = smooth ? t.sec : t.s;
      const min = t.m + sec / 60;
      rot(hourH, ((t.h % 12) + min / 60) * 30);
      rot(minH, min * 6);
      if (secH) rot(secH, sec * 6);
    };
  }

  const wall = {
    id: 'wall', name: 'Wall Clock', group: 'Analog',
    options: [
      color('bg', 'Wall', '#e9e7e2'),
      color('frame', 'Frame', '#1b1b1b'),
      color('dial', 'Dial', '#ffffff'),
      color('ink', 'Numbers & hands', '#111111'),
      color('second', 'Second hand', '#d7261e'),
      choice('font', 'Font', 'inter', fontChoices(['inter', 'grotesk', 'oswald', 'system', 'fredoka'])),
      motion('tick'),
      toggle('shadow', 'Shadows', true),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const sh = o.shadow ? shadowFilter(v, 0.3) : null;
      s('circle', { r: 98, fill: o.frame, filter: sh }, v);
      s('circle', { r: 91, fill: mix(o.frame, '#ffffff', 0.12) }, v);
      s('circle', { r: 89, fill: o.dial }, v);
      for (let i = 0; i < 60; i++) {
        const hr = i % 5 === 0;
        const [x1, y1] = polar(i * 6, 85), [x2, y2] = polar(i * 6, hr ? 74 : 80.5);
        s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': hr ? 3.4 : 1.1 }, v);
      }
      for (let i = 0; i < 12; i++) {
        const [x, y] = polar(i * 30, 61);
        s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 19, 'font-weight': 700, 'font-family': font(o.font) }, v)
          .textContent = String(i || 12);
      }
      const hourH = hand(v, 'M-4.2 12 L-3.6 -48 L3.6 -48 L4.2 12Z', o.ink, sh);
      const minH = hand(v, 'M-3 15 L-2.4 -82 L2.4 -82 L3 15Z', o.ink, sh);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, sh);
        s('line', { y1: 24, y2: -84, stroke: o.second, 'stroke-width': 1.4, 'stroke-linecap': 'round' }, secH);
        s('circle', { cy: 17, r: 4.2, fill: o.second }, secH);
      }
      s('circle', { r: 4.6, fill: secH ? o.second : o.ink }, v);
      // Glass reflection
      s('path', { d: 'M-62 -50 A80 80 0 0 1 40 -76 A86 86 0 0 0 -62 -50Z', fill: '#ffffff', opacity: 0.25 }, v);
      return { tick: sweepHands(hourH, minH, secH, o.sweep === 'smooth') };
    },
  };

  const modern = {
    id: 'modern', name: 'Modern', group: 'Analog',
    options: [
      color('bg', 'Background', '#e6e3dc'),
      color('dial', 'Dial', '#f5f3ee'),
      color('ink', 'Numbers & hands', '#1d1d1d'),
      color('accent', 'Second hand', '#f2b705'),
      choice('markers', 'Markers', 'numbers', [['numbers', 'Numbers'], ['batons', 'Batons'], ['both', 'Numbers & batons']]),
      choice('font', 'Font', 'grotesk', fontChoices(['grotesk', 'inter', 'system', 'mono'])),
      toggle('shadow', 'Soft shadow', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const sh = o.shadow ? shadowFilter(v, 0.16) : null;
      s('circle', { r: 94, fill: o.dial, filter: sh }, v);
      for (let i = 0; i < 60; i++) {
        const hr = i % 5 === 0;
        if (hr && o.markers === 'numbers') continue;
        const [x1, y1] = polar(i * 6, 89), [x2, y2] = polar(i * 6, hr ? 80 : 86);
        s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': hr ? 2.2 : 0.7 }, v);
      }
      if (o.markers !== 'batons') {
        for (let i = 0; i < 12; i++) {
          const [x, y] = polar(i * 30, o.markers === 'both' ? 68 : 76);
          s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 12.5, 'font-weight': 400, 'font-family': font(o.font) }, v)
            .textContent = String(i || 12);
        }
      }
      const bar = (len, width, tail) => {
        const grp = handGroup(v, sh);
        s('rect', { x: -width / 2, y: -len, width, height: len + tail, fill: o.ink }, grp);
        return grp;
      };
      const hourH = bar(52, 5, 10);
      const minH = bar(86, 3.4, 12);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, sh);
        s('line', { y1: 20, y2: -88, stroke: o.accent, 'stroke-width': 1.3 }, secH);
        s('circle', { cy: 20, r: 3.2, fill: o.accent }, secH);
      }
      s('circle', { r: 4.2, fill: secH ? o.accent : o.ink }, v);
      return { tick: sweepHands(hourH, minH, secH, o.sweep === 'smooth') };
    },
  };

  const WOOD_TONES = {
    oak: ['#c79b68', '#8a5f34'],
    walnut: ['#6e4529', '#3a2213'],
    birch: ['#e7d2aa', '#b8976a'],
    cherry: ['#a14e2e', '#5e2716'],
  };

  // A new board each time the page loads. It stays the same until then, so changing a
  // setting or swiping back to this clock doesn't swap the wood.
  const WOOD_SEED = 1 + Math.floor(Math.random() * 2147483645);

  const wooden = {
    id: 'wooden', name: 'Wooden', group: 'Analog',
    options: [
      color('bg', 'Wall', '#f1ede6'),
      choice('wood', 'Wood', 'oak', [['oak', 'Oak'], ['walnut', 'Walnut'], ['birch', 'Birch'], ['cherry', 'Cherry']]),
      choice('markers', 'Markers', 'sticks', [['sticks', 'Sticks'], ['dots', 'Dots'], ['numbers', 'Numbers'], ['none', 'None']]),
      color('ink', 'Markers & hands', '#1e1a17'),
      color('second', 'Second hand', '#c8a24a'),
      toggle('shadow', 'Shadows', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const defs = s('defs', null, v);
      const sh = o.shadow ? shadowFilter(v, 0.3) : null;
      const [base, grain] = WOOD_TONES[o.wood] || WOOD_TONES.oak;
      let seed = WOOD_SEED;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 5; i++) rnd();

      const clipId = 'wc' + ++uid;
      s('circle', { r: 95 }, s('clipPath', { id: clipId }, defs));
      s('circle', { r: 95, fill: base, filter: sh }, v);
      const board = s('g', { 'clip-path': `url(#${clipId})` }, v);
      const grainG = s('g', { transform: `rotate(${(rnd() * 70 - 35).toFixed(1)})` }, board);

      // Broad bands of lighter and darker timber
      for (let i = 0; i < 9; i++) {
        s('rect', { x: -140, y: -130 + i * 30 + rnd() * 10, width: 280, height: 10 + rnd() * 22, fill: rnd() > 0.5 ? grain : '#ffffff', opacity: 0.05 + rnd() * 0.07 }, grainG);
      }
      // Long grain lines that flow around a couple of knots, like a planed board
      const KNOTS = Array.from({ length: Math.floor(rnd() * 4) }, () => {
        const a = rnd() * Math.PI * 2, d = 28 + rnd() * 48;
        return [Math.cos(a) * d, Math.sin(a) * d, 3.5 + rnd() * 5];
      });
      const wave = 0.6 + rnd() * 1.2, drift = rnd() * 6;
      for (let y0 = -132; y0 <= 132; y0 += 2.2 + rnd() * 1.6) {
        const pts = [];
        for (let x = -140; x <= 140; x += 5) {
          let y = y0 + 1.4 * wave * Math.sin(x * 0.02 + y0 * 0.37 + drift) + 2.6 * wave * Math.sin(x * 0.007 + y0 * 0.05 + drift);
          for (const [kx, ky, kr] of KNOTS) {
            const dx = (x - kx) / (kr * 3.2), dy = y - ky;
            // Smoothly part the lines around the knot (no seam where they cross its centre)
            y += (dy / Math.sqrt(dy * dy + kr * kr)) * kr * 2.4 * Math.exp(-(dx * dx) - (dy * dy) / (kr * kr * 9));
          }
          pts.push(`${x} ${y.toFixed(2)}`);
        }
        s('path', { d: 'M' + pts.join(' L'), fill: 'none', stroke: grain, 'stroke-width': (0.25 + rnd() * 0.9).toFixed(2), opacity: (0.18 + rnd() * 0.35).toFixed(2) }, grainG);
      }
      for (const [kx, ky, kr] of KNOTS) {
        for (let r = kr; r > 0.6; r -= 1.3) s('ellipse', { cx: kx, cy: ky, rx: r * 1.7, ry: r, fill: 'none', stroke: grain, 'stroke-width': 0.6, opacity: 0.55 }, grainG);
        s('ellipse', { cx: kx, cy: ky, rx: kr * 0.5, ry: kr * 0.3, fill: grain, opacity: 0.7 }, grainG);
      }
      // Soft sheen and a darker bevelled edge
      const sheen = 'ws' + ++uid;
      const rg = s('radialGradient', { id: sheen, cx: 0.35, cy: 0.3, r: 0.8 }, defs);
      s('stop', { offset: 0, 'stop-color': '#ffffff', 'stop-opacity': 0.16 }, rg);
      s('stop', { offset: 1, 'stop-color': '#000000', 'stop-opacity': 0.12 }, rg);
      s('circle', { r: 95, fill: `url(#${sheen})` }, board);
      s('circle', { r: 93.5, fill: 'none', stroke: grain, 'stroke-width': 3, opacity: 0.35 }, v);

      for (let i = 0; i < 12; i++) {
        const q = i % 3 === 0;
        if (o.markers === 'sticks') {
          const [x1, y1] = polar(i * 30, 84), [x2, y2] = polar(i * 30, q ? 66 : 72);
          s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': q ? 4 : 2.6, 'stroke-linecap': 'round' }, v);
        } else if (o.markers === 'dots') {
          const [x, y] = polar(i * 30, 78);
          s('circle', { cx: x, cy: y, r: q ? 4.4 : 2.8, fill: o.ink }, v);
        } else if (o.markers === 'numbers') {
          const [x, y] = polar(i * 30, 74);
          s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 17, 'font-weight': 500, 'font-family': font('fraunces') }, v)
            .textContent = String(i || 12);
        }
      }
      const line = (len, width, colour, tail) => {
        const grp = handGroup(v, sh);
        s('line', { y1: tail, y2: -len, stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round' }, grp);
        return grp;
      };
      const hourH = line(48, 5.5, o.ink, 8);
      const minH = line(78, 3.6, o.ink, 10);
      const secH = g.showSeconds ? line(84, 1.2, o.second, 18) : null;
      s('circle', { r: 4.5, fill: o.ink }, v);
      if (secH) s('circle', { r: 2, fill: o.second }, v);
      return { tick: sweepHands(hourH, minH, secH, o.sweep === 'smooth') };
    },
  };

  const shadowClock = {
    id: 'shadow', name: 'Shadow', group: 'Analog',
    options: [
      color('dial', 'Wall', '#ebe6de'),
      color('ink', 'Markers & hands', '#1d1e22'),
      color('second', 'Second hand', '#e0532c'),
      range('angle', 'Light direction', 315, 0, 355, 5),
      range('reach', 'Shadow length', 14, 4, 30),
      motion(),
    ],
    mount(root, o, g) {
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const id = 'sd' + ++uid;
      s('circle', { r: 92, fill: mix(o.dial, '#ffffff', 0.25) }, v);
      const marks = s('g', null, v);
      for (let i = 0; i < 12; i++) {
        const q = i % 3 === 0;
        s('rect', { x: q ? -4 : -3, y: -84, width: q ? 8 : 6, height: q ? 22 : 15, rx: 3, fill: o.ink, transform: `rotate(${i * 30})` }, marks);
      }
      const line = (parent, len, width, colour, tail) => {
        const grp = handGroup(parent);
        s('line', { y1: tail, y2: -len, stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round' }, grp);
        return grp;
      };
      const drawHands = (parent, ink, second) => [
        line(parent, 48, 8, ink, 8),
        line(parent, 78, 5.5, ink, 10),
        g.showSeconds ? line(parent, 83, 1.4, second, 16) : null,
      ];

      // The shadow is one hand-shaped layer repeated further and further from the hands, each
      // copy fainter than the last, so it starts dark behind each hand and fades out. Turning
      // that one layer turns every copy. Copies stay half a unit apart at any shadow length,
      // because wider gaps show up as stripes behind the thin second hand.
      const SHADOW = '#2e2418', STEP = 0.5, STEPS = Math.ceil(+o.reach / STEP);
      const shape = s('g', { id }, s('defs', null, v));
      const shadowHands = sweepHands(...drawHands(shape, SHADOW, SHADOW), o.sweep === 'smooth');
      s('circle', { r: 5, fill: SHADOW }, shape);
      const copies = Array.from({ length: STEPS }, () => s('use', { href: `#${id}` }, v));

      const hands = sweepHands(...drawHands(v, o.ink, o.second), o.sweep === 'smooth');
      s('circle', { r: 5, fill: o.ink }, v);
      if (g.showSeconds) s('circle', { r: 2.2, fill: o.second }, v);

      // `angle` is clockwise from the top of the screen; the shadow falls the opposite way
      const angle = (+o.angle * Math.PI) / 180;
      copies.forEach((copy, i) => {
        const k = i + 1;
        copy.setAttribute('transform', `translate(${(-Math.sin(angle) * STEP * k).toFixed(2)} ${(Math.cos(angle) * STEP * k).toFixed(2)})`);
        // Fades faster at first, so long shadows thin out gently instead of ending in a hard edge
        copy.setAttribute('opacity', (0.06 * (1 - i / STEPS) ** 2).toFixed(3));
      });
      root.style.background = o.dial;

      return { tick(t) { hands(t); shadowHands(t); } };
    },
  };

  // =====================================================================
  // WATCHES
  // =====================================================================

  const BEZELS = { black: '#15171b', blue: '#1b3a7a', green: '#1d5a3c', red: '#8f1d22' };

  const diver = {
    id: 'diver', name: 'Dive Watch', group: 'Analog',
    options: [
      color('bg', 'Background', '#0c0d10'),
      choice('bezel', 'Bezel', 'black', [['black', 'Black'], ['blue', 'Blue'], ['green', 'Green'], ['red', 'Red']]),
      color('dial', 'Dial', '#101215'),
      color('lume', 'Lume', '#e9f1d9'),
      color('second', 'Second hand', '#ff6a1a'),
      toggle('date', 'Date window', true),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const defs = s('defs', null, v);
      const sh = shadowFilter(v, 0.5);
      const steel = metalFill(defs, 'silver');
      const bezel = BEZELS[o.bezel] || BEZELS.black;

      s('circle', { r: 99, fill: steel, filter: sh }, v);
      s('circle', { r: 95, fill: bezel }, v);
      for (let i = 0; i < 60; i++) {
        if (i === 0) continue;
        const [x, y] = polar(i * 6, 88);
        if (i % 10 === 0) {
          s('text', { x: 0, y: -88, transform: `rotate(${i * 6})`, fill: '#e8e8e8', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 9, 'font-weight': 600, 'font-family': font('inter') }, v).textContent = String(i);
        } else if (i % 5 === 0) {
          s('rect', { x: -1.2, y: -93, width: 2.4, height: 9, fill: '#e8e8e8', transform: `rotate(${i * 6})` }, v);
        } else if (i < 15) {
          s('line', { x1: x, y1: y, x2: polar(i * 6, 92)[0], y2: polar(i * 6, 92)[1], stroke: '#e8e8e8', 'stroke-width': 0.8 }, v);
        } else {
          s('circle', { cx: x, cy: y, r: 0.9, fill: '#e8e8e8' }, v);
        }
      }
      s('path', { d: 'M-6 -94 L6 -94 L0 -84Z', fill: '#e8e8e8' }, v);
      s('circle', { cy: -90.5, r: 1.6, fill: o.lume }, v);

      s('circle', { r: 80, fill: o.dial }, v);
      s('circle', { r: 80, fill: 'none', stroke: steel, 'stroke-width': 1.6 }, v);
      for (let i = 0; i < 60; i++) {
        const [x1, y1] = polar(i * 6, 77), [x2, y2] = polar(i * 6, i % 5 ? 74.5 : 73);
        s('line', { x1, y1, x2, y2, stroke: '#cfd3d6', 'stroke-width': i % 5 ? 0.5 : 1 }, v);
      }
      const lumeStyle = { fill: o.lume, stroke: '#b8bec4', 'stroke-width': 1.2 };
      for (let i = 0; i < 12; i++) {
        if (i === 3 && o.date) continue;
        const grp = s('g', { transform: `rotate(${i * 30})` }, v);
        if (i === 0) s('path', Object.assign({ d: 'M-8 -71 L8 -71 L0 -56Z' }, lumeStyle), grp);
        else if (i % 3 === 0) s('rect', Object.assign({ x: -3.6, y: -71, width: 7.2, height: 18, rx: 1 }, lumeStyle), grp);
        else s('circle', Object.assign({ cy: -64, r: 5.4 }, lumeStyle), grp);
      }
      let dateText = null;
      if (o.date) {
        s('rect', { x: 52, y: -7.5, width: 18, height: 15, rx: 1.5, fill: '#f4f4f2', stroke: '#b8bec4', 'stroke-width': 1.2 }, v);
        dateText = s('text', { x: 61, y: 0.5, fill: '#111', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 10, 'font-weight': 700, 'font-family': font('inter') }, v);
      }
      s('text', { y: 30, fill: '#cfd3d6', 'text-anchor': 'middle', 'font-size': 6.5, 'letter-spacing': 1.5, 'font-weight': 600, 'font-family': font('inter') }, v).textContent = 'AUTOMATIC';
      s('text', { y: 40, fill: o.second, 'text-anchor': 'middle', 'font-size': 6.5, 'letter-spacing': 1, 'font-weight': 600, 'font-family': font('inter') }, v).textContent = '300 m';

      const sword = (d) => {
        const grp = handGroup(v, sh);
        s('path', { d, fill: '#d9dde1' }, grp);
        return grp;
      };
      const hourH = sword('M-4.5 8 L-6 -30 L0 -46 L6 -30 L4.5 8Z');
      s('path', { d: 'M-3.6 -8 L-4.6 -30 L0 -42 L4.6 -30 L3.6 -8Z', fill: o.lume }, hourH);
      const minH = sword('M-3.4 10 L-4.4 -50 L0 -74.5 L4.4 -50 L3.4 10Z');
      s('path', { d: 'M-2.4 -10 L-3.2 -50 L0 -69.5 L3.2 -50 L2.4 -10Z', fill: o.lume }, minH);
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, sh);
        s('line', { y1: 20, y2: -76, stroke: o.second, 'stroke-width': 1.2 }, secH);
        s('circle', { cy: -52, r: 4.6, fill: o.lume, stroke: o.second, 'stroke-width': 1.2 }, secH);
      }
      s('circle', { r: 3.6, fill: o.second }, v);

      const hands = sweepHands(hourH, minH, secH, o.sweep === 'smooth');
      const day = gate();
      return {
        tick(t) {
          hands(t);
          if (dateText && day(t.dateShort)) dateText.textContent = t.dateShort.split(' ')[1];
        },
      };
    },
  };

  const pilot = {
    id: 'pilot', name: 'Pilot Watch', group: 'Analog',
    options: [
      color('bg', 'Background', '#16181b'),
      color('dial', 'Dial', '#121314'),
      color('ink', 'Numerals', '#f1efe8'),
      color('lume', 'Hand lume', '#efe6c8'),
      choice('layout', 'Layout', 'a', [['a', 'Hours (type A)'], ['b', 'Minutes outside, hours inside (type B)']]),
      toggle('date', 'Date window', false),
      motion('tick'),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const defs = s('defs', null, v);
      const sh = shadowFilter(v, 0.5);
      s('circle', { r: 99, fill: metalFill(defs, 'silver'), filter: sh }, v);
      s('circle', { r: 94, fill: o.dial }, v);
      const fnt = font('inter');
      const num = (x, y, size, text) => s('text', { x, y, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': size, 'font-weight': 600, 'font-family': fnt }, v).textContent = text;
      for (let i = 0; i < 60; i++) {
        const five = i % 5 === 0;
        if (five && o.layout === 'b') continue;
        const [x1, y1] = polar(i * 6, 91), [x2, y2] = polar(i * 6, five ? 82 : 87);
        s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': five ? 2.2 : 0.9 }, v);
      }
      // The triangle-and-dots marker at 12
      s('path', { d: 'M-9 -90 L9 -90 L0 -74Z', fill: o.ink }, v);
      for (const x of [-12.5, 12.5]) s('circle', { cx: x, cy: -88, r: 2, fill: o.ink }, v);
      if (o.layout === 'b') {
        for (let i = 1; i < 12; i++) { const [x, y] = polar(i * 30, 76); num(x, y, 13, String(i * 5)); }
        s('circle', { r: 56, fill: 'none', stroke: o.ink, 'stroke-width': 0.6, opacity: 0.5 }, v);
        for (let i = 0; i < 12; i++) { const [x, y] = polar(i * 30, 47); num(x, y, 8.5, String(i || 12)); }
      } else {
        for (let i = 1; i < 12; i++) {
          if (i === 3 && o.date) continue;
          const [x, y] = polar(i * 30, 67);
          num(x, y, 21, String(i));
        }
      }
      let dateText = null;
      if (o.date) {
        s('rect', { x: o.layout === 'b' ? 30 : 54, y: -7, width: 16, height: 14, rx: 1, fill: o.dial, stroke: o.ink, 'stroke-width': 0.8 }, v);
        dateText = s('text', { x: (o.layout === 'b' ? 30 : 54) + 8, y: 0.5, fill: o.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 9, 'font-weight': 600, 'font-family': fnt }, v);
      }
      const sword = (outline, inner) => {
        const grp = handGroup(v, sh);
        s('path', { d: outline, fill: '#1b2a4a', stroke: '#2d4170', 'stroke-width': 0.6 }, grp);
        s('path', { d: inner, fill: o.lume }, grp);
        return grp;
      };
      const hourH = sword('M-3.2 10 L-6 -24 L0 -50 L6 -24 L3.2 10Z', 'M-2.2 -6 L-4.2 -24 L0 -44 L4.2 -24 L2.2 -6Z');
      const minH = sword('M-2.6 12 L-4.6 -44 L0 -87 L4.6 -44 L2.6 12Z', 'M-1.6 -8 L-3.2 -44 L0 -81 L3.2 -44 L1.6 -8Z');
      let secH = null;
      if (g.showSeconds) {
        secH = handGroup(v, sh);
        s('line', { y1: 20, y2: -89, stroke: '#f1efe8', 'stroke-width': 1 }, secH);
        s('circle', { cy: 14, r: 2.8, fill: '#f1efe8' }, secH);
      }
      s('circle', { r: 3.4, fill: '#d9dde1' }, v);
      const hands = sweepHands(hourH, minH, secH, o.sweep === 'smooth');
      const day = gate();
      return {
        tick(t) {
          hands(t);
          if (dateText && day(t.dateShort)) dateText.textContent = t.dateShort.split(' ')[1];
        },
      };
    },
  };

  const chrono = {
    id: 'chrono', name: 'Chronograph', group: 'Analog',
    options: [
      color('bg', 'Background', '#1a1b1e'),
      color('dial', 'Dial', '#f2f0ea'),
      color('subdials', 'Subdials', '#17181b'),
      color('ink', 'Markers & hands', '#1a1b1e'),
      color('accent', 'Chrono hand', '#d0342c'),
      motion(),
    ],
    mount(root, o, g) {
      root.style.background = o.bg;
      const v = s('svg', { viewBox: '-100 -100 200 200', class: 'cf-svg' }, root);
      const defs = s('defs', null, v);
      const sh = shadowFilter(v, 0.4);
      const fnt = font('inter');
      s('circle', { r: 99, fill: metalFill(defs, 'silver'), filter: sh }, v);
      const R = 94;
      s('circle', { r: R, fill: o.dial }, v);
      for (let i = 0; i < 240; i++) {
        const five = i % 20 === 0, one = i % 4 === 0;
        const [x1, y1] = polar(i * 1.5, R - 1.5), [x2, y2] = polar(i * 1.5, R - (five ? 9 : one ? 5.5 : 3.5));
        s('line', { x1, y1, x2, y2, stroke: o.ink, 'stroke-width': five ? 1.6 : one ? 0.6 : 0.3 }, v);
      }
      for (let i = 0; i < 12; i++) {
        if (i % 3 === 0 && i !== 0) continue;
        s('rect', { x: -2.2, y: -(R - 11), width: 4.4, height: 13, rx: 0.6, fill: o.ink, transform: `rotate(${i * 30})` }, v);
      }
      // Subdials: running seconds at 9, minutes (0–30) at 3, 24-hour at 6
      const subdial = (cx, cy, ticks, labels) => {
        const grp = s('g', { transform: `translate(${cx} ${cy})` }, v);
        s('circle', { r: 17, fill: o.subdials }, grp);
        s('circle', { r: 17, fill: 'none', stroke: mix(o.subdials, '#ffffff', 0.35), 'stroke-width': 0.6 }, grp);
        for (let i = 0; i < ticks; i++) {
          const [x1, y1] = polar((i * 360) / ticks, 15.5), [x2, y2] = polar((i * 360) / ticks, i % (ticks / labels.length) ? 14 : 12.5);
          s('line', { x1, y1, x2, y2, stroke: '#e8e8e8', 'stroke-width': 0.4 }, grp);
        }
        labels.forEach((l, i) => {
          const [x, y] = polar((i * 360) / labels.length, 9);
          s('text', { x, y, fill: '#e8e8e8', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 4, 'font-weight': 600, 'font-family': fnt }, grp).textContent = l;
        });
        const h = handGroup(grp, null);
        s('line', { y1: 3, y2: -14, stroke: '#ffffff', 'stroke-width': 0.9, 'stroke-linecap': 'round' }, h);
        s('circle', { r: 1.6, fill: '#ffffff' }, grp);
        return h;
      };
      const secSub = subdial(-38, 0, 60, ['60', '15', '30', '45']);
      const minSub = subdial(38, 0, 30, ['30', '10', '20']);
      const daySub = subdial(0, 38, 24, ['00', '6', '12', '18']);

      const hourH = hand(v, 'M-3 10 L-2.6 -48 L0 -52 L2.6 -48 L3 10Z', o.ink, sh);
      const minH = hand(v, 'M-2.2 12 L-1.8 -84 L0 -88 L1.8 -84 L2.2 12Z', o.ink, sh);
      // The chronograph seconds hand, shown running
      const chronoH = handGroup(v, sh);
      s('line', { y1: 20, y2: -(R - 2), stroke: o.accent, 'stroke-width': 0.9 }, chronoH);
      s('circle', { cy: 16, r: 2.6, fill: o.accent }, chronoH);
      s('circle', { r: 3, fill: o.accent }, v);

      return {
        tick(t) {
          const sec = secOf(t, o);
          const min = t.m + sec / 60;
          rot(hourH, ((t.h % 12) + min / 60) * 30);
          rot(minH, min * 6);
          rot(chronoH, sec * 6);
          rot(secSub, sec * 6);
          rot(minSub, (min % 30) * 12);
          rot(daySub, (t.h + min / 60) * 15);
        },
      };
    },
  };

  // =====================================================================
  // WORLD CLOCKS: any other clock, repeated in a grid, one per time zone
  // =====================================================================

  const deviceZone = () => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; }
  };
  const ZONE_PICKS = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'America/Los_Angeles', 'Asia/Dubai', 'Asia/Singapore', 'Europe/Paris', 'Asia/Hong_Kong'];
  const cityOf = (zone) => (zone === 'local' ? deviceZone() || 'Local' : zone).split('/').pop().replace(/_/g, ' ');

  // Hours ahead of the device right now, like "+9h" or "-3h 30m". Empty when it's the same.
  function offsetText(fmt) {
    const now = new Date();
    const p = Object.fromEntries(fmt.formatToParts(now).map((x) => [x.type, +x.value]));
    const utc = Math.floor(now.getTime() / 60000);
    const diff = Math.round(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) / 60000) - utc + now.getTimezoneOffset();
    if (!diff) return '';
    const a = Math.abs(diff), h = Math.floor(a / 60), m = a % 60;
    return (diff > 0 ? '+' : '-') + [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ');
  }

  // The most columns that still give each clock the largest square
  function fitGrid(grid, count, caption) {
    const w = grid.clientWidth, h = grid.clientHeight;
    let cols = 1, best = 0;
    for (let c = 1; c <= count; c++) {
      const size = Math.min(w / c, h / Math.ceil(count / c) - caption);
      if (size > best + 0.5) { best = size; cols = c; }
    }
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--rows', Math.ceil(count / cols));
  }

  // Where a clock is actually drawn inside its layer, as [top, bottom] in pixels. An SVG's box
  // is bigger than its drawing, so that comes from its shape. Full-screen scenes fill the layer.
  function drawnSpan(layer) {
    const box = layer.getBoundingClientRect();
    const svg = layer.querySelector(':scope > svg.cf-svg');
    if (svg) {
      const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      const height = Math.min(r.height, (r.width * vb.height) / vb.width);
      const middle = r.top + r.height / 2 - box.top;
      return [middle - height / 2, middle + height / 2];
    }
    const rects = [...layer.children].filter((n) => getComputedStyle(n).position !== 'absolute').map((n) => n.getBoundingClientRect());
    return rects.length ? [Math.min(...rects.map((r) => r.top)) - box.top, Math.max(...rects.map((r) => r.bottom)) - box.top] : [0, box.height];
  }

  // Puts each label just under its clock, and lifts the clock so the pair stays centred
  function placeLabels(grid) {
    grid.style.setProperty('--lift', '0px');
    const layer = grid.querySelector('.layer'), height = layer.clientHeight;
    const label = grid.querySelector('.world-cap').offsetHeight;
    const [top, bottom] = drawnSpan(layer);
    const gap = Math.max(6, height * 0.02);
    const lift = bottom >= height ? 0 : Math.min((label + gap) / 2, top);
    grid.style.setProperty('--lift', `${lift}px`);
    grid.style.setProperty('--label-top', `${Math.min(bottom - lift + gap, height - label - 6)}px`);
  }

  const world = {
    id: 'world', name: 'World Clock', group: 'Creative',
    // Each tile has its own time zone, so the all-clocks one doesn't apply
    ownZones: true,
    options: [
      { key: 'zones', label: 'Time zones', type: 'zones', max: 9, picks: ZONE_PICKS, default: ['local', ...ZONE_PICKS.filter((z) => z !== deviceZone()).slice(0, 3)].join(',') },
      { ...choice('style', 'Clock style', 'wall', []), help: 'Each clock uses the colours and options you’ve saved for that style.' },
      toggle('labels', 'Show labels', true),
      toggle('showDay', 'Show day', true),
      toggle('showTime', 'Show time (except digital clocks)', true),
      toggle('showDiff', 'Show time difference', true),
    ],
    mount(root, o, g, host) {
      const style = faces.find((f) => f.id === o.style && f !== world) || wall;
      const zones = o.zones.split(',');
      const grid = el('div', 'world-grid', root);

      const tiles = zones.map((entry) => {
        const [zone, name] = entry.split('|');
        const tile = el('div', 'world-tile', grid);
        const layer = el('div', 'layer face-' + style.id, el('div', 'world-clock', tile));
        const cap = el('div', 'world-cap', tile);
        cap.hidden = !o.labels;
        const pill = el('div', 'world-pill', cap);
        el('strong', null, pill, name || cityOf(zone));
        const meta = el('span', null, pill);
        const read = host.clockIn(zone);
        const inst = style.mount(layer, host.optsFor(style), Object.assign({}, g, { timeZone: zone })) || {};
        tile.style.background = layer.style.background;
        const fmt = zone === 'local' ? null : new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        return { read, inst, meta, fmt, minute: gate() };
      });
      root.style.background = grid.firstChild.style.background;

      const digital = style.group === 'Digital';
      const wall = {
        tick() {
          for (const tile of tiles) {
            const t = tile.read();
            if (tile.inst.tick) tile.inst.tick(t);
            if (!tile.minute(t.m)) continue;
            const day = t.dateShort.split(' ')[0];
            const time = g.hour24 ? `${pad(t.h)}:${pad(t.m)}` : `${h12(t.h)}:${pad(t.m)} ${ampm(t.h)}`;
            tile.meta.textContent = [
              o.showDay && day[0] + day.slice(1).toLowerCase(),
              o.showTime && !digital && time,
              o.showDiff && tile.fmt && offsetText(tile.fmt),
            ].filter(Boolean).join(' · ');
          }
        },
      };

      // Digital clocks only have a height once they've shown the time and their font has loaded
      wall.tick();
      const fit = () => {
        fitGrid(grid, zones.length, grid.querySelector('.world-cap').offsetHeight + 12);
        placeLabels(grid);
      };
      fit();
      new ResizeObserver(fit).observe(grid);
      document.fonts.ready.then(fit);
      return wall;
    },
  };

  // Finished but not shown on the site for now (no page, no sitemap entry, not in the picker)
  // 中文版按要求移除 7 款：经典指针、终端、点阵、辉光管、霓虹、文字时钟、昼夜时钟
  const HIDDEN = new Set(['binary', 'fibonacci', 'grandfather', 'cuckoo', 'classic', 'terminal', 'dotmatrix', 'nixie', 'neon', 'wordclock', 'daylight']);
  const faces = [classic, wall, modern, minimal, wooden, shadowClock, roman, clock24, kids, station, diver, pilot, chrono, pocket, pendulum, grandfather, cuckoo, alarm, gears, rings, spin, flip, splitflap, bigtype, lcd, dotmatrix, nixie, neon, terminal, world, wordclock, textclock, binary, fibonacci, tape, cute, cat, dog, daylight].filter((f) => !HIDDEN.has(f.id));

  world.options.find((opt) => opt.key === 'style').choices = faces.filter((f) => f !== world).map((f) => [f.id, f.name]);

  // Called once the first clock is up: warm up everything other clocks need
  function preload() {
    preloadFonts();
    loadZones();
  }

  window.ClockFaces = { faces, groups: ['Analog', 'Digital', 'Creative'], preload, cityOf };
})();
