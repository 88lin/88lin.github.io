/* ==========================================================================
   functions.js —— 页面主逻辑（原生 JS，无 jQuery 依赖）
   --------------------------------------------------------------------------
   模块一览：
     CONFIG   可配置项（名字、在一起的日期、打字速度）
     FX       花瓣飘落 + 彩带 / 烟火 / 爱心粒子（两块 canvas，一个渲染循环）
     Heart    让 983 个采样点依次开出一朵花，长成一颗心
     Typer    情书逐字打字机
     Counter  在一起的天数计时
     Cake     吹蜡烛
     Music    背景音乐与播放状态
   ========================================================================== */
(function () {
    'use strict';

    /* ======================================================================
       0. 可配置项
       ====================================================================== */
    var CONFIG = {
        /* ⚙️ 她的名字（页面里所有 .js-name 都会被替换） */
        name: '小林',

        /* ⚙️ 你们在一起的日期，用来算「我们已经相伴 N 天」。
              留空字符串则隐藏这个模块。格式：YYYY-MM-DD 或 YYYY-MM-DDTHH:mm:ss */
        togetherSince: '2024-05-20T20:00:00',

        /* ⚙️ 首屏日期。留空则自动使用打开页面的当天日期 */
        dateOverride: '',

        /* ⚙️ 花朵绽放的轮廓：'cake' 生日蛋糕 / 'heart' 爱心 */
        shape: 'cake',

        /* 打字机速度（毫秒 / 字） */
        typeSpeed: 56
    };

    var doc = document;
    var root = doc.documentElement;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
    function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
    function rand(a, b) { return Math.random() * (b - a) + a; }
    function pad2(n) { return n < 10 ? '0' + n : '' + n; }
    function on(el, type, fn, opt) { el && el.addEventListener(type, fn, opt || false); }

    /* ======================================================================
       1. 轻提示
       ====================================================================== */
    var Toast = (function () {
        var el = $('#toast');
        var timer = null;
        return {
            show: function (text, ms) {
                if (!el) { return; }
                el.textContent = text;
                el.classList.add('is-on');
                clearTimeout(timer);
                timer = setTimeout(function () { el.classList.remove('is-on'); }, ms || 2800);
            }
        };
    })();

    /* ======================================================================
       2. FX —— 花瓣 / 彩带 / 烟火 / 爱心
       ====================================================================== */
    var FX = (function () {
        var petalCanvas = $('#petals');
        var burstCanvas = $('#burst');
        if (!petalCanvas || !burstCanvas || !petalCanvas.getContext) { return null; }

        var pctx = petalCanvas.getContext('2d');
        var bctx = burstCanvas.getContext('2d');
        var W = 0, H = 0, dpr = 1;
        var petals = [];
        var parts = [];
        var rafId = null;
        var lastTs = 0;
        var hasPath = typeof Path2D !== 'undefined';

        /* --- 形状 --- */
        var petalPath = null;
        var heartPath = null;
        if (hasPath) {
            petalPath = new Path2D();
            petalPath.moveTo(0, -0.5);
            petalPath.bezierCurveTo(0.44, -0.4, 0.5, 0.18, 0, 0.5);
            petalPath.bezierCurveTo(-0.5, 0.18, -0.44, -0.4, 0, -0.5);

            heartPath = new Path2D();
            heartPath.moveTo(0, 0.4);
            heartPath.bezierCurveTo(-0.68, -0.06, -0.48, -0.68, 0, -0.3);
            heartPath.bezierCurveTo(0.48, -0.68, 0.68, -0.06, 0, 0.4);
            heartPath.closePath();
        }

        /* --- 花瓣 --- */
        function petalHue() {
            var r = Math.random();
            if (r < 0.52) { return rand(330, 356); }   /* 玫瑰粉 */
            if (r < 0.72) { return rand(280, 312); }   /* 藕荷 */
            if (r < 0.88) { return rand(20, 42); }     /* 香槟金 */
            return rand(160, 185);                     /* 极少量薄荷，提亮画面 */
        }

        function makePetal(fromTop) {
            return {
                x: rand(-40, W + 40),
                y: fromTop ? rand(-H * 0.6, -20) : rand(-40, H),
                size: rand(6, 16),
                vy: rand(16, 46),
                sway: rand(10, 36),
                swaySpeed: rand(0.35, 1.05),
                phase: rand(0, Math.PI * 2),
                rot: rand(0, Math.PI * 2),
                vrot: rand(-1.3, 1.3),
                alpha: rand(0.34, 0.82),
                hue: petalHue(),
                light: rand(76, 92)
            };
        }

        function buildPetals() {
            petals.length = 0;
            if (reduceMotion) { return; }
            var count = Math.max(14, Math.min(30, Math.round(W / 46)));
            for (var i = 0; i < count; i++) {
                petals.push(makePetal(false));
            }
        }

        function drawPetals(dt) {
            for (var i = 0; i < petals.length; i++) {
                var p = petals[i];
                p.y += p.vy * dt;
                p.phase += p.swaySpeed * dt;
                p.rot += p.vrot * dt;
                if (p.y > H + 50) { petals[i] = makePetal(true); continue; }

                var x = p.x + Math.sin(p.phase) * p.sway;
                pctx.save();
                pctx.translate(x, p.y);
                pctx.rotate(p.rot + Math.sin(p.phase) * 0.45);
                pctx.scale(p.size, p.size * 1.28);
                pctx.globalAlpha = p.alpha;
                pctx.fillStyle = 'hsl(' + p.hue.toFixed(1) + ',92%,' + p.light.toFixed(1) + '%)';
                if (hasPath) { pctx.fill(petalPath); } else { pctx.fillRect(-0.5, -0.5, 1, 1); }
                pctx.restore();
            }
        }

        /* --- 粒子 --- */
        /* 彩带配色刻意收窄到玫瑰粉 / 香槟金 / 藕荷紫 / 珍珠白，
           避免出现马戏团式的杂色，整体仍保持柔和的女性气质。 */
        var CONF_HUES = [338, 348, 356, 10, 28, 42, 288, 304];
        function confHue() {
            var h = CONF_HUES[Math.floor(Math.random() * CONF_HUES.length)];
            return h + rand(-5, 5);
        }

        function push(p) {
            if (parts.length < 900) { parts.push(p); }
        }

        function confetti(x, y, n) {
            for (var i = 0; i < n; i++) {
                push({
                    kind: 'conf',
                    x: x + rand(-70, 70),
                    y: y + rand(-30, 30),
                    vx: rand(-210, 210),
                    vy: rand(-620, -120),
                    w: rand(4, 8),
                    h: rand(6, 13),
                    rot: rand(0, Math.PI * 2),
                    vrot: rand(-9, 9),
                    hue: confHue(),
                    sat: rand(72, 92),
                    light: rand(70, 88),
                    alpha: 1,
                    ttl: rand(2.0, 3.4),
                    age: 0
                });
            }
        }

        function hearts(x, y, n, gentle, band) {
            var spread = gentle ? 90 : 320;
            var half = Math.max(24, (band || 0) / 2);
            for (var i = 0; i < n; i++) {
                push({
                    kind: 'heart',
                    x: x + rand(-half, half),
                    y: y + rand(-40, 26),
                    vx: rand(-spread, spread),
                    vy: gentle ? rand(-260, -110) : rand(-430, -140),
                    size: rand(gentle ? 7 : 9, gentle ? 13 : 17),
                    rot: rand(-0.5, 0.5),
                    vrot: rand(-2.2, 2.2),
                    hue: rand(330, 352),
                    sat: rand(84, 94),
                    light: rand(68, 82),
                    alpha: 1,
                    ttl: rand(1.4, 2.6),
                    age: 0
                });
            }
        }

        function sparks(x, y, n, power) {
            for (var i = 0; i < n; i++) {
                var a = rand(0, Math.PI * 2);
                var s = rand(power * 0.25, power);
                push({
                    kind: 'spark',
                    x: x, y: y,
                    vx: Math.cos(a) * s,
                    vy: Math.sin(a) * s,
                    hue: confHue(),
                    sat: 92,
                    light: rand(72, 90),
                    alpha: 1,
                    w: rand(1.6, 3),
                    ttl: rand(0.6, 1.35),
                    age: 0
                });
            }
        }

        function firework(x, y) {
            sparks(x, y, 52, 430);
            setTimeout(function () { sparks(x + rand(-30, 30), y + rand(-24, 24), 26, 260); }, 140);
        }

        var GRAV = 1050;

        function step(dt) {
            pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            pctx.clearRect(0, 0, W, H);
            drawPetals(dt);

            bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            bctx.clearRect(0, 0, W, H);

            for (var i = parts.length - 1; i >= 0; i--) {
                var p = parts[i];
                p.age += dt;
                if (p.age >= p.ttl) { parts.splice(i, 1); continue; }
                p.vy += GRAV * dt * (p.kind === 'spark' ? 0.42 : 1);
                p.vx *= 0.992;
                p.vy *= 0.996;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.vrot) { p.rot += p.vrot * dt; }
                var k = 1 - p.age / p.ttl;

                if (p.kind === 'conf') {
                    bctx.save();
                    bctx.globalAlpha = k > 0.75 ? 1 : k / 0.75;
                    bctx.translate(p.x, p.y);
                    bctx.rotate(p.rot);
                    bctx.fillStyle = 'hsl(' + p.hue.toFixed(1) + ',' + p.sat + '%,' + p.light + '%)';
                    bctx.fillRect(-p.w / 2, -p.h / 2, p.w, Math.max(1.5, p.h * Math.abs(Math.cos(p.rot * 1.7))));
                    bctx.restore();
                } else if (p.kind === 'heart') {
                    bctx.save();
                    bctx.globalAlpha = Math.min(1, k * 1.6);
                    bctx.translate(p.x, p.y);
                    bctx.rotate(p.rot);
                    bctx.scale(p.size, p.size);
                    bctx.fillStyle = 'hsla(' + p.hue.toFixed(1) + ',' + p.sat + '%,' + p.light + '%,.94)';
                    if (hasPath) { bctx.fill(heartPath); } else { bctx.fillRect(-0.4, -0.4, 0.8, 0.8); }
                    bctx.restore();
                } else {
                    bctx.save();
                    bctx.globalCompositeOperation = 'lighter';
                    bctx.globalAlpha = k;
                    bctx.strokeStyle = 'hsl(' + p.hue.toFixed(1) + ',' + p.sat + '%,' + p.light + '%)';
                    bctx.lineWidth = p.w;
                    bctx.lineCap = 'round';
                    bctx.beginPath();
                    bctx.moveTo(p.x, p.y);
                    bctx.lineTo(p.x - p.vx * 0.026, p.y - p.vy * 0.026);
                    bctx.stroke();
                    bctx.restore();
                }
            }
        }

        function loop(ts) {
            rafId = requestAnimationFrame(loop);
            if (!lastTs) { lastTs = ts; return; }
            var dt = Math.min((ts - lastTs) / 1000, 0.05);
            lastTs = ts;
            step(dt);
        }

        function start() {
            if (rafId) { return; }
            lastTs = 0;
            rafId = requestAnimationFrame(loop);
        }

        function stop() {
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            petalCanvas.width = Math.round(W * dpr);
            petalCanvas.height = Math.round(H * dpr);
            burstCanvas.width = Math.round(W * dpr);
            burstCanvas.height = Math.round(H * dpr);
            buildPetals();
        }

        resize();
        start();

        on(doc, 'visibilitychange', function () {
            if (doc.hidden) { stop(); } else { start(); }
        });

        return {
            resize: resize,
            confetti: confetti,
            hearts: hearts,
            sparks: sparks,
            firework: firework,
            clear: function () { parts.length = 0; },
            /* 一次完整的庆祝：彩带 + 烟火 + 爱心 */
            celebrate: function (strong) {
                if (reduceMotion) { return; }
                var y = H * 0.62;
                confetti(W * 0.5, y, strong ? 74 : 54);
                setTimeout(function () { confetti(W * 0.16, H * 0.56, 42); }, 170);
                setTimeout(function () { confetti(W * 0.84, H * 0.56, 42); }, 320);
                setTimeout(function () { firework(W * 0.28, H * 0.3); }, 470);
                setTimeout(function () { firework(W * 0.74, H * 0.26); }, 760);
                setTimeout(function () { hearts(W * 0.5, H * 0.78, strong ? 22 : 14, false, W * 0.62); }, 980);
                if (strong) {
                    setTimeout(function () { firework(W * 0.5, H * 0.2); }, 1130);
                    setTimeout(function () { confetti(W * 0.5, H * 0.46, 48); }, 1380);
                }
            }
        };
    })();

    /* ======================================================================
       3. 背景音乐的加载
       ====================================================================== */
    var Music = (function () {
        var btn = $('#musicBtn');
        var audio = $('#bgm');
        if (!btn || !audio) { return null; }
        audio.volume = 0.72;

        function ui(on) {
            btn.classList.toggle('is-playing', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            btn.setAttribute('aria-label', on ? '暂停背景音乐' : '播放背景音乐');
        }

        function play() {
            var p = audio.play();
            if (p && typeof p.catch === 'function') {
                p.catch(function () {
                    ui(false);
                    Toast.show('音乐被浏览器拦下了，点一下右下角的唱片试试');
                });
            }
        }

        on(btn, 'click', function () {
            if (audio.paused) { play(); } else { audio.pause(); }
        });
        on(audio, 'playing', function () { ui(true); });
        on(audio, 'pause', function () { ui(false); });
        on(audio, 'error', function () {
            ui(false);
            btn.style.display = 'none';
        });

        return { play: play, pause: function () { audio.pause(); } };
    })();

    /* ======================================================================
       4. 名字与日期
       ====================================================================== */
    function applyName() {
        if (!CONFIG.name) { return; }
        $$('.js-name').forEach(function (el) { el.textContent = CONFIG.name; });
    }

    /* 兼容 "2024-05-20" / "2024-05-20T20:00:00" / "2024/05/20 20:00" 等写法 */
    function parseDate(value) {
        var s = String(value == null ? '' : value).trim();
        if (!s) { return null; }
        var d = new Date(s);
        if (isNaN(d.getTime())) { d = new Date(s.replace(/-/g, '/')); }
        return isNaN(d.getTime()) ? null : d;
    }

    function currentDate() {
        return parseDate(CONFIG.dateOverride) || new Date();
    }

    function applyDates() {
        var d = currentDate();
        var heroEl = $('#heroDate');
        if (heroEl) {
            heroEl.textContent = d.getFullYear() + ' · ' + pad2(d.getMonth() + 1) + ' · ' + pad2(d.getDate());
        }
        var letterEl = $('#letterDate');
        if (letterEl) {
            letterEl.textContent = d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate());
        }
        var yearEl = $('#year');
        if (yearEl) { yearEl.textContent = d.getFullYear(); }
    }

    /* ======================================================================
       5. 逐字拆分 + 玫瑰金渐变（每字独立裁剪，保证兼容性）
       ====================================================================== */
    var SPLIT_GRADIENT = 'linear-gradient(100deg,#ff9ec7 0%,#ffcf9a 26%,#f4739f 54%,#cba6ff 78%,#ff9ec7 100%)';

    function splitText(el) {
        var text = (el.textContent || '').trim();
        if (!text) { return; }
        var frag = doc.createDocumentFragment();
        for (var i = 0; i < text.length; i++) {
            var s = doc.createElement('span');
            s.className = 'ch';
            s.style.setProperty('--i', i);
            s.textContent = text.charAt(i);
            frag.appendChild(s);
        }
        el.textContent = '';
        el.appendChild(frag);
    }

    function paintGradient(el) {
        var spans = $$('.ch', el);
        if (!spans.length) { return; }
        var base = spans[0].offsetLeft;
        var lastSpan = spans[spans.length - 1];
        var total = (lastSpan.offsetLeft + lastSpan.offsetWidth) - base;
        if (total <= 0) { return; }
        for (var i = 0; i < spans.length; i++) {
            var s = spans[i];
            s.style.backgroundImage = SPLIT_GRADIENT;
            s.style.backgroundSize = total + 'px 100%';
            s.style.backgroundPosition = (base - s.offsetLeft) + 'px 0';
            s.style.webkitBackgroundClip = 'text';
            s.style.backgroundClip = 'text';
            s.style.color = 'transparent';
        }
    }

    function initSplit() {
        var els = $$('[data-split]');
        els.forEach(splitText);
        var paintAll = function () {
            els.forEach(paintGradient);
        };
        paintAll();
        /* 字体加载完成、窗口尺寸变化时重新计算渐变宽度 */
        if (doc.fonts && doc.fonts.ready) {
            doc.fonts.ready.then(function () { setTimeout(paintAll, 60); });
        }
        var t = null;
        on(window, 'resize', function () {
            clearTimeout(t);
            t = setTimeout(paintAll, 180);
        });
    }

    /* ======================================================================
       6. 花心
       ====================================================================== */
    var Heart = (function () {
        var canvas = $('#garden');
        var wrap = $('.heart-wrap');
        var words = $('.heart-words');
        var sparkleBox = $('#heartSparkle');
        if (!canvas || !wrap || !window.Garden || !window.BIRTHDAY_SHAPES) { return null; }

        var ctx = canvas.getContext('2d');
        var garden = new Garden(ctx, canvas);
        var shape = window.BIRTHDAY_SHAPES[CONFIG.shape] || window.BIRTHDAY_SHAPES.cake;
        var cx = Garden.DESIGN_W / 2;
        var cy = Garden.DESIGN_H / 2 - 55;
        var xs = shape.xs;
        var ys = shape.ys;
        var minGap = Garden.options.bloomRadius.max * 1.3;
        var drawn = [];
        var angle = 0;
        var timer = null;
        var finished = false;
        var started = false;

        function pointAt(i) {
            return [cx + xs[i], cy + ys[i]];
        }

        function sparkle(x, y) {
            ctx.fillStyle = 'rgba(255,255,255,' + rand(0.22, 0.6).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(x, y, rand(0.6, 1.5), 0, Math.PI * 2);
            ctx.fill();
        }

        function bloomAt(x, y) {
            garden.createRandomBloom(x, y);
            if (Math.random() < 0.09) { sparkle(x, y); }
        }

        function acceptable(x, y) {
            for (var i = 0; i < drawn.length; i++) {
                var dx = drawn[i][0] - x;
                var dy = drawn[i][1] - y;
                if (dx * dx + dy * dy < minGap * minGap) { return false; }
            }
            return true;
        }

        function paintInstant() {
            drawn = [];
            garden.clear();
            for (var i = 0; i < xs.length; i++) {
                var p = pointAt(i);
                if (acceptable(p[0], p[1])) {
                    drawn.push(p);
                    bloomAt(p[0], p[1]);
                }
            }
            onFinish();
        }

        /* 沿轮廓采样点撒一圈星光，光点因此正好落在花瓣上 */
        function buildSparkles() {
            if (!sparkleBox || sparkleBox.childNodes.length) { return; }
            var total = xs.length;
            var count = Math.min(26, Math.max(14, Math.round(total / 42)));
            var step = Math.floor(total / count);
            var frag = doc.createDocumentFragment();
            for (var i = 0; i < count; i++) {
                var idx = (i * step + Math.floor(step / 2)) % total;
                var dot = doc.createElement('i');
                dot.style.left = ((cx + xs[idx]) / Garden.DESIGN_W * 100).toFixed(2) + '%';
                dot.style.top = ((cy + ys[idx]) / Garden.DESIGN_H * 100).toFixed(2) + '%';
                /* 每颗星的节奏都错开，看上去才像真的在闪 */
                dot.style.animationDuration = rand(2.6, 5.4).toFixed(2) + 's';
                dot.style.animationDelay = rand(0, 5).toFixed(2) + 's';
                var s = rand(0.7, 1.35);
                dot.style.width = dot.style.height = (5 * s).toFixed(2) + 'px';
                dot.style.margin = (-2.5 * s).toFixed(2) + 'px 0 0 ' + (-2.5 * s).toFixed(2) + 'px';
                frag.appendChild(dot);
            }
            sparkleBox.appendChild(frag);
        }

        function onFinish() {
            if (finished) { return; }
            finished = true;
            buildSparkles();
            if (!reduceMotion && sparkleBox) {
                setTimeout(function () { sparkleBox.classList.add('is-on'); }, 300);
            }
            /* 长成之后整块蛋糕开始缓慢呼吸 */
            if (!reduceMotion && wrap) {
                setTimeout(function () { wrap.classList.add('is-alive'); }, 300);
            }
            if (words) {
                setTimeout(function () { words.classList.add('is-in'); }, 420);
            }
        }

        function tick() {
            var p = pointAt(angle);
            if (acceptable(p[0], p[1])) {
                drawn.push(p);
                bloomAt(p[0], p[1]);
            }
            if (angle >= xs.length - 1) {
                clearInterval(timer);
                timer = null;
                onFinish();
            } else {
                angle++;
            }
        }

        /* 用定时器而非 requestAnimationFrame 驱动花朵生长：
           rAF 在后台标签页或无合成器的环境里会被完全饿死（帧回调一次都不触发），
           那样整颗心就永远不会画出来。定时器虽然不与刷新同步，
           但对这种「逐渐生长」的动画来说完全够用，且任何环境都能稳定推进。 */
        var renderTimer = null;

        function renderLoop() {
            if (garden.blooms.length) { garden.render(); }
        }

        function teardownEffects() {
            if (words) { words.classList.remove('is-in'); }
            if (wrap) { wrap.classList.remove('is-alive'); }
            if (sparkleBox) {
                sparkleBox.classList.remove('is-on');
                sparkleBox.innerHTML = '';
            }
        }

        function start(instant) {
            started = true;
            finished = false;
            drawn = [];
            angle = 0;
            /* 必须先按容器尺寸重建画布并把坐标系映射到设计空间，
               否则 canvas 会停留在默认的 300×150，花朵会画到画布之外。 */
            garden.resize();
            teardownEffects();

            if (instant || reduceMotion) { paintInstant(); }
            else {
                clearInterval(timer);
                timer = setInterval(tick, 5);
            }
            clearInterval(renderTimer);
            renderTimer = setInterval(renderLoop, Garden.options.growSpeed);
        }

        function reset() {
            started = false;
            finished = false;
            drawn = [];
            angle = 0;
            clearInterval(timer);
            timer = null;
            clearInterval(renderTimer);
            renderTimer = null;
            garden.clear();
            teardownEffects();
        }

        /* 加载完成即按容器尺寸准备好画布；若字体加载后容器尺寸有变化，
           再校准一次并补画。尺寸没变时 resize() 返回 false，
           不会打断正在生长的动画。 */
        function calibrate() {
            if (garden.resize() && started) { paintInstant(); }
        }
        calibrate();
        on(window, 'load', calibrate);
        if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(calibrate); }

        function resize() {
            if (garden.resize() && started) {
                /* 尺寸变化会清空画布，直接把整幅图补画回来 */
                paintInstant();
            }
        }

        return {
            start: start,
            reset: reset,
            resize: resize,
            isStarted: function () { return started; }
        };
    })();

    /* ======================================================================
       7. 情书打字机
       ====================================================================== */
    var Typer = (function () {
        var body = $('#letterBody');
        if (!body) { return null; }
        var paras = $$('p', body);
        if (!paras.length) { return null; }

        var sources = paras.map(function (p) { return p.innerHTML; });
        var plains = paras.map(function (p) { return (p.textContent || '').replace(/\s+/g, ''); });
        var state = { running: false, done: false, skip: false, timers: [] };

        function clearTimers() {
            state.timers.forEach(clearTimeout);
            state.timers = [];
        }

        /* 打字开始前先把每段清空，避免一闪而过 */
        function hideAll() {
            paras.forEach(function (p) {
                p.innerHTML = sources[paras.indexOf(p)];
                p.classList.remove('is-shown');
            });
        }

        function typeParagraph(p, text, done) {
            var i = 0;
            p.classList.add('is-shown');
            p.textContent = '';
            var caret = doc.createElement('span');
            caret.className = 'caret';
            caret.textContent = '|';
            p.appendChild(caret);

            function stepOnce() {
                if (state.skip) { i = text.length; } else { i++; }
                p.textContent = text.slice(0, i);
                p.appendChild(caret);
                if (i >= text.length) {
                    caret.parentNode && caret.parentNode.removeChild(caret);
                    done();
                    return;
                }
                var wait = CONFIG.typeSpeed + rand(-14, 26);
                var ch = text.charAt(i - 1);
                if ('。！？'.indexOf(ch) >= 0) { wait += 240; }
                else if ('，、；：'.indexOf(ch) >= 0) { wait += 120; }
                state.timers.push(setTimeout(stepOnce, state.skip ? 8 : wait));
            }
            state.timers.push(setTimeout(stepOnce, CONFIG.typeSpeed));
        }

        function run() {
            if (state.running || state.done) { return; }
            state.running = true;
            state.skip = false;
            var hint = $('#paperHint');
            if (hint) { hint.classList.add('is-on'); }

            if (reduceMotion) {
                paras.forEach(function (p, i) { p.innerHTML = sources[i]; p.classList.add('is-shown'); });
                state.running = false;
                state.done = true;
                return;
            }

            var idx = 0;
            (function next() {
                if (idx >= paras.length) {
                    state.running = false;
                    state.done = true;
                    return;
                }
                var p = paras[idx];
                typeParagraph(p, plains[idx], function () {
                    idx++;
                    state.timers.push(setTimeout(next, state.skip ? 60 : 320));
                });
            })();
        }

        function arm() {
            whenVisible(body, 0.8, run);
        }

        function reset() {
            clearTimers();
            state.running = false;
            state.done = false;
            state.skip = false;
            hideAll();
            var hint = $('#paperHint');
            if (hint) { hint.classList.remove('is-on'); }
            arm();
        }

        /* 轻点信纸：立刻写完 */
        on($('#paper'), 'click', function () {
            if (state.running && !state.skip) {
                state.skip = true;
                Toast.show('剩下的悄悄话，一次说完啦');
            }
        });

        hideAll();
        return { arm: arm, reset: reset };
    })();

    /* ======================================================================
       8. 在一起的天数
       ====================================================================== */
    var Counter = (function () {
        var box = $('#counter');
        if (!box || !CONFIG.togetherSince) { return null; }
        var since = parseDate(CONFIG.togetherSince);
        if (!since || since.getTime() > Date.now() + 60000) { return null; }

        var dayEl = $('#cDay'), hourEl = $('#cHour'), minEl = $('#cMin'), secEl = $('#cSec');
        var last = {};

        function set(el, value) {
            if (!el || last[el.id] === value) { return; }
            last[el.id] = value;
            el.textContent = value;
            el.classList.add('is-tick');
            setTimeout(function () { el.classList.remove('is-tick'); }, 280);
        }

        function render() {
            var total = Math.floor((Date.now() - since.getTime()) / 1000);
            if (total < 0) { total = 0; }
            var s = total;
            var day = Math.floor(s / 86400); s -= day * 86400;
            var hour = Math.floor(s / 3600); s -= hour * 3600;
            var min = Math.floor(s / 60); s -= min * 60;
            set(dayEl, String(day));
            set(hourEl, pad2(hour));
            set(minEl, pad2(min));
            set(secEl, pad2(s));
        }

        box.hidden = false;
        render();
        setInterval(render, 1000);
        return {};
    })();

    /* ======================================================================
       9. 吹蜡烛
       ====================================================================== */
    var Cake = (function () {
        var stage = $('#cakeStage');
        if (!stage) { return null; }
        var candles = $$('[data-candle]', stage);
        var btn = $('#blowBtn');
        var blown = 0;
        var done = false;

        function finish() {
            if (done) { return; }
            done = true;
            stage.classList.add('is-done');
            if (FX) { FX.celebrate(true); }
            Toast.show('愿望已经许下，一定会实现的');
        }

        function blow(candle) {
            if (!candle || candle.classList.contains('is-out')) { return; }
            candle.classList.add('is-out');
            blown++;
            if (FX) {
                var r = candle.getBoundingClientRect();
                FX.sparks(r.left + r.width / 2, r.top + r.height * 0.15, 12, 150);
            }
            if (blown >= candles.length) { finish(); }
        }

        candles.forEach(function (c) {
            on(c, 'click', function () { blow(c); });
        });

        on(btn, 'click', function () {
            candles.forEach(function (c, i) {
                setTimeout(function () { blow(c); }, reduceMotion ? 0 : i * 190);
            });
        });

        return {
            reset: function () {
                candles.forEach(function (c) { c.classList.remove('is-out'); });
                blown = 0;
                done = false;
                stage.classList.remove('is-done');
            }
        };
    })();

    /* 元素进入视口时执行一次。刻意不用 IntersectionObserver：
       它的回调挂在渲染管线里，一旦渲染被节流（后台标签页、无合成器环境）
       就永远不送达，内容会停在 opacity:0 完全看不见。
       这里用「滚动位置判断 + 低频轮询兜底」，
       即使某些环境下连 scroll 事件都不派发，也一定能触发。 */
    function whenVisible(el, ratio, fn) {
        if (!el) { return; }
        var done = false;
        var poll = null;

        function stop() {
            window.removeEventListener('scroll', check);
            window.removeEventListener('resize', check);
            clearInterval(poll);
        }

        function check() {
            if (done) { return; }
            var vh = window.innerHeight || doc.documentElement.clientHeight;
            var r = el.getBoundingClientRect();
            /* 只要元素顶部越过这条线就算「出现过」，快速跳转也不会漏 */
            if (r.top < vh * (ratio || 0.82)) {
                done = true;
                stop();
                fn();
            }
        }

        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', check);
        poll = setInterval(check, 400);
        check();
    }

    /* ======================================================================
       10. 滚动渐入
       ====================================================================== */
    function initReveal() {
        var pending = $$('#page .reveal, #page [data-split]').filter(function (el) {
            return !el.closest('#hero');
        });

        /* 同组元素依次入场 */
        $$('.wish-grid .wish').forEach(function (el, i) { el.style.setProperty('--i', i); });
        $$('.sec-head').forEach(function (el, i) { el.style.setProperty('--i', i); });

        if (reduceMotion) {
            pending.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }

        var poll = null;

        function stop() {
            window.removeEventListener('scroll', check);
            window.removeEventListener('resize', check);
            clearInterval(poll);
        }

        function check() {
            var vh = window.innerHeight || doc.documentElement.clientHeight;
            for (var i = pending.length - 1; i >= 0; i--) {
                if (pending[i].getBoundingClientRect().top < vh * 0.9) {
                    pending[i].classList.add('is-in');
                    pending.splice(i, 1);
                }
            }
            if (!pending.length) { stop(); }
        }

        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', check);
        poll = setInterval(check, 400);
        check();
    }

    function heroIn() {
        $$('#hero .reveal').forEach(function (el, i) {
            el.style.setProperty('--i', i);
            el.classList.add('is-in');
        });
        $$('#hero [data-split]').forEach(function (el) { el.classList.add('is-in'); });
    }

    /* ======================================================================
       11. 阅读进度条
       ====================================================================== */
    (function initProgress() {
        var bar = $('#progress');
        if (!bar) { return; }
        var pending = false;

        function update() {
            pending = false;
            var max = doc.documentElement.scrollHeight - window.innerHeight;
            var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
            bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        }

        on(window, 'scroll', function () {
            if (pending) { return; }
            pending = true;
            setTimeout(update, 60);
        }, { passive: true });
        on(window, 'resize', update);
        update();
    })();

    /* ======================================================================
       12. 开屏
       ====================================================================== */
    (function initIntro() {
        var intro = $('#intro');
        var openBtn = $('#openBtn');
        var gift = $('#giftBtn');
        if (!intro) { heroIn(); return; }

        var opened = false;

        function open() {
            if (opened) { return; }
            opened = true;
            root.classList.add('is-open');
            doc.body.classList.remove('is-locked');
            intro.classList.add('is-gone');

            if (Music) { Music.play(); }
            heroIn();
            if (Heart) { Heart.start(false); }
            if (Typer) { Typer.arm(); }
            if (FX) { setTimeout(function () { FX.celebrate(true); }, 260); }
        }

        on(openBtn, 'click', open);
        on(gift, 'click', open);
        on(intro, 'keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { open(); }
        });

        /* 供页面内联兜底脚本调用 */
        window.__openIntro = open;
    })();

    /* ======================================================================
       13. 点击生花
       ====================================================================== */
    on(doc, 'pointerdown', function (e) {
        if (reduceMotion || !FX) { return; }
        var t = e.target;
        if (t && t.closest && t.closest('button, a, audio, .music')) { return; }
        if (!root.classList.contains('is-open')) { return; }
        FX.hearts(e.clientX, e.clientY, 4, true, 44);
        FX.sparks(e.clientX, e.clientY, 5, 120);
    });

    /* ======================================================================
       14. 再看一遍
       ====================================================================== */
    on($('#againBtn'), 'click', function () {
        if (FX) { FX.clear(); }
        if (Heart) { Heart.reset(); }
        if (Typer) { Typer.reset(); }
        if (Cake) { Cake.reset(); }
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        setTimeout(function () {
            if (Heart) { Heart.start(false); }
            if (FX) { FX.celebrate(false); }
        }, 620);
    });

    /* ======================================================================
       15. 启动
       ====================================================================== */
    applyName();
    applyDates();
    initSplit();
    initReveal();

    /* 通知页面：主脚本已就绪，内联兜底逻辑不必介入 */
    window.__birthdayReady = true;

    var rt = null;
    on(window, 'resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
            if (FX) { FX.resize(); }
            if (Heart) { Heart.resize(); }
        }, 220);
    });
})();