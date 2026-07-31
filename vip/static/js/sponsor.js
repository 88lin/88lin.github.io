/* ==========================================================================
 *  赞助商展示位  ——  /vip 页面
 * --------------------------------------------------------------------------
 *  五种形态，互相独立，各自一个开关：
 *    marquee   顶部滚动横幅（复用页面既有 .notice-banner 视觉）
 *    carousel  播放器下方轮播卡（主力位）
 *    tab       内容区新增「赞助商」标签页
 *    modal     延迟弹窗
 *    text      页脚上方纯文字位
 *
 *  日常维护只需要改下面 SPONSOR_CONFIG 里的 sponsors 数组和 layouts 开关。
 *
 * --------------------------------------------------------------------------
 *  两个必须注意的实现约束（改动前务必读）：
 *
 *  1) 本文件必须以【普通同步 script】的形式引在页面末尾那个内联 <script>
 *     的紧前面。内联脚本在 DOMContentLoaded 时会把 .tab / .tab-content 的
 *     NodeList 缓存下来；本文件注入的第 5 个标签页必须早于那次缓存，否则
 *     点击原有标签时不会关闭赞助商面板，会出现两个面板同时 active。
 *     不要改成 defer / async，也不要挪到内联脚本之后。
 *
 *  2) 所有 class / id 统一用 sp- 前缀，刻意避开 ad / ads / advert / banner
 *     等词根 —— EasyList 之类的过滤规则里有大量针对这些词根的通用隐藏规则，
 *     命中后整块内容会被浏览器插件隐藏。请勿重命名。
 * ========================================================================== */

(function () {
    'use strict';

    /* ======================================================================
     *  配置区  ——  改广告只动这里
     * ==================================================================== */
    var SPONSOR_CONFIG = {
        // 总开关：false 时页面完全不渲染任何赞助内容
        enabled: true,

        // 广告标识文字，置为 '' 则隐藏角标（建议保留，便于区分编辑内容与付费内容）
        label: '赞助',

        // 「想在这里投放广告」的联系入口
        contact: 'https://go.88lin.eu.org/gzh',
        contactText: '想在这里投放广告？联系我',

        layouts: {
            // ① 顶部滚动横幅
            marquee: {
                enabled: true,
                dismissDays: 7,   // 用户点关闭后，多少天内不再出现
                duration: 32      // 跑马灯滚动一轮的秒数，越大越慢
            },
            // ② 播放器下方轮播卡
            carousel: {
                enabled: true,
                interval: 6000,   // 自动切换间隔（毫秒），设 0 关闭自动切换
                pauseOnHover: true
            },
            // ③ 「赞助商」标签页
            tab: {
                enabled: true,
                title: '赞助商'
            },
            // ④ 延迟弹窗（默认关闭：对工具站体验伤害明显，按需临时开）
            modal: {
                enabled: false,
                delay: 10000,     // 打开页面后多久弹出（毫秒）
                dismissDays: 1,   // 勾选「今日不再提示」后的静默天数
                pick: 'random'    // 'random' 随机一家 | 'first' 固定第一家
            },
            // ⑤ 纯文字位（默认关闭：与轮播卡内容重复）
            text: {
                enabled: false
            }
        },

        // 顺序即展示顺序。每个赞助商字段：
        //   id / name / logo / url        必填
        //   tagline                       轮播卡与横幅用的一句话（建议 ≤ 24 字）
        //   desc                          标签页与弹窗用的完整介绍
        //   highlights[]                  卖点小徽章，建议 2~3 条
        //   cta / accent                  按钮文字 / 品牌色（用于光晕）
        // logo 建议用「深色字 + 透明底 / 浅底」的横版图，会被放进 152×52 的白色托盘里；
        // 加载失败时自动退化成品牌名文字，不会留空白。
        sponsors: [
            {
                id: 'workbuddy',
                name: 'WorkBuddy',
                logo: 'https://download.codebuddy.cn/web/workbuddy/0bebf86e38e7d71ff0c313d661e7753ff996c54e/assets/workbuddy-logo-WhgOvEF7.png',
                url: 'https://www.workbuddy.cn/events/invite?inviteCode=w0x2ic45z',
                tagline: '腾讯出品的全能 AI 工作台，说出要求即可交付完整成果',
                desc: '腾讯出品的全能 AI 工作台，是中国最受欢迎的效率 AI 智能体服务，说出要求、开始执行任务、交付完整成果。其中 Hy3 模型限时免费使用，注册即可获取 2000 积分，每月再赠送 500 积分，可用 Kimi-K3、GLM-5.2 等模型。',
                highlights: ['Hy3 限时免费', '注册送 2000 积分', '每月再送 500'],
                cta: '立即体验',
                accent: '#0052d9'
            },
            {
                id: 'gorouter',
                name: 'GoRouter',
                logo: 'https://cdn.jsdmirror.com/gh/88lin/picx-images-hosting@master/ScreenShot_2026-07-31_200922_732.webp',
                url: 'https://gorouter.app/sign-up?aff=hfcV',
                tagline: '免费公益大模型 API 平台，可用 Claude Opus 5',
                desc: '免费公益大模型 API 平台，可用 Claude Opus 5 模型，目前较稳定。注册送 $70，每日签到得 $10 左右，支持 GitHub 登录。',
                highlights: ['注册送 $70', '每日签到 $10', 'GitHub 登录'],
                cta: '免费领取',
                accent: '#1e88e5'
            },
            {
                id: 'agentrouter',
                name: 'Agent Router',
                logo: 'https://cdn.jsdmirror.com/gh/88lin/picx-images-hosting@master/90C5FAD072EA247822CB88BB32512A41.webp',
                url: 'https://agentrouter.org/register?aff=ugVO',
                tagline: '免费公益大模型 API 平台，国内直连不折腾',
                desc: '免费公益大模型 API 平台，支持 GPT-5.6、Claude Opus 5 等主流模型，国内直连。注册送 $125，每日签到得 $25，被邀得 $50，支持 GitHub / LinuxDo 登录。',
                highlights: ['注册送 $125', '每日签到 $25', '被邀得 $50'],
                cta: '免费领取',
                accent: '#7c4dff'
            }
        ]
    };

    /* ======================================================================
     *  工具函数
     * ==================================================================== */
    var LINK_REL = 'nofollow sponsored noopener noreferrer';
    var DAY = 86400000;

    var reduceMotion = false;
    try {
        reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { /* 老浏览器忽略 */ }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) { node.className = className; }
        if (text != null) { node.textContent = text; }
        return node;
    }

    function icon(name) {
        var i = document.createElement('i');
        i.className = name;
        i.setAttribute('aria-hidden', 'true');
        return i;
    }

    function storeGet(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }

    function storeSet(key, value) {
        try { window.localStorage.setItem(key, value); } catch (e) { /* 隐私模式忽略 */ }
    }

    // 返回 true 表示仍在静默期内
    function muted(key) {
        var until = parseInt(storeGet(key) || '0', 10);
        return !!until && Date.now() < until;
    }

    function mute(key, days) {
        storeSet(key, String(Date.now() + Math.max(0, days || 0) * DAY));
    }

    // #rrggbb -> rgba(r,g,b,a)，用于 logo 托盘的品牌色柔光
    function rgba(hex, alpha) {
        if (!hex || hex.charAt(0) !== '#' || (hex.length !== 7 && hex.length !== 4)) { return null; }
        var h = hex.length === 4
            ? '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
            : hex;
        var n = parseInt(h.slice(1), 16);
        return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
    }

    // 统一的对外链接：付费链接必须带 sponsored，避免被判为售卖权重
    function link(sponsor, className) {
        var a = el('a', className);
        a.href = sponsor.url;
        a.target = '_blank';
        a.rel = LINK_REL;
        return a;
    }

    // logo 托盘：白底 + 品牌色柔光，加载失败时降级成品牌名文字
    function logoBox(sponsor, width, height) {
        var box = el('span', 'sp-logo');
        var glow = rgba(sponsor.accent, 0.5);
        if (glow) { box.style.setProperty('--sp-accent', glow); }

        var img = document.createElement('img');
        img.src = sponsor.logo;
        img.alt = sponsor.name;
        img.width = width;
        img.height = height;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', function () {
            box.textContent = '';
            box.appendChild(el('span', 'sp-logo-fallback', sponsor.name));
        });
        box.appendChild(img);
        return box;
    }

    function chips(sponsor) {
        if (!sponsor.highlights || !sponsor.highlights.length) { return null; }
        var wrap = el('span', 'sp-chips');
        sponsor.highlights.forEach(function (text) {
            wrap.appendChild(el('em', null, text));
        });
        return wrap;
    }

    function ctaBox(sponsor, tag) {
        var node = el(tag || 'span', 'sp-cta');
        node.appendChild(document.createTextNode(sponsor.cta || '了解更多'));
        node.appendChild(icon('fas fa-arrow-right'));
        return node;
    }

    function tagBox(labelIcon) {
        if (!SPONSOR_CONFIG.label) { return null; }
        var tag = el('span', 'sp-tag');
        tag.appendChild(icon(labelIcon || 'fas fa-bullhorn'));
        tag.appendChild(document.createTextNode(SPONSOR_CONFIG.label));
        return tag;
    }

    /* ======================================================================
     *  ① 顶部滚动横幅
     * ==================================================================== */
    function renderMarquee(list, container) {
        var conf = SPONSOR_CONFIG.layouts.marquee;
        var KEY = 'vip_sp_marquee_until';
        if (!conf.enabled || muted(KEY)) { return; }

        var strip = el('div', 'notice-banner sp-strip');
        strip.id = 'sp-strip';
        strip.setAttribute('role', 'complementary');
        strip.setAttribute('aria-label', '赞助商');

        var round = el('div', 'notice-icon');
        round.appendChild(icon('fas fa-heart'));
        strip.appendChild(round);

        var tag = tagBox();
        if (tag) { strip.appendChild(tag); }

        var content = el('div', 'notice-content');
        var text = el('div', 'notice-text');
        if (!reduceMotion && conf.duration) {
            text.style.animationDuration = conf.duration + 's';
        }

        list.forEach(function (sponsor, i) {
            if (i > 0) {
                text.appendChild(el('span', 'sp-strip-sep', '·'));
            }
            var item = el('span', 'sp-strip-item');

            var name = link(sponsor, 'sp-strip-name');
            name.textContent = sponsor.name;
            item.appendChild(name);

            item.appendChild(el('span', 'sp-strip-desc', sponsor.tagline));

            var go = link(sponsor, 'sp-strip-go');
            go.textContent = sponsor.cta || '了解更多';
            item.appendChild(go);

            text.appendChild(item);
        });

        content.appendChild(text);
        strip.appendChild(content);

        var close = el('button', 'notice-close');
        close.type = 'button';
        close.setAttribute('aria-label', '关闭赞助提示');
        close.appendChild(icon('fas fa-times'));
        close.addEventListener('click', function () {
            strip.style.display = 'none';
            mute(KEY, conf.dismissDays);
        });
        strip.appendChild(close);

        container.insertBefore(strip, container.firstChild);
    }

    /* ======================================================================
     *  ② 播放器下方轮播卡
     * ==================================================================== */
    function renderCarousel(list, container) {
        var conf = SPONSOR_CONFIG.layouts.carousel;
        if (!conf.enabled) { return; }

        var anchor = container.querySelector('.player-container');
        if (!anchor) { return; }

        var card = el('section', 'sp-card');
        card.id = 'sp-card';
        card.setAttribute('role', 'complementary');
        card.setAttribute('aria-label', '赞助商');

        var tag = tagBox();
        if (tag) { card.appendChild(tag); }

        var inner = el('div', 'sp-card-inner');
        var track = el('div', 'sp-track');
        var slides = [];

        list.forEach(function (sponsor, i) {
            var slide = link(sponsor, 'sp-slide' + (i === 0 ? ' is-active' : ''));
            if (sponsor.accent) {
                var glow = rgba(sponsor.accent, 0.5);
                if (glow) { slide.style.setProperty('--sp-accent', glow); }
            }
            slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
            if (i !== 0) { slide.tabIndex = -1; }

            slide.appendChild(logoBox(sponsor, 152, 52));

            var body = el('span', 'sp-body');
            body.appendChild(el('span', 'sp-name', sponsor.name));
            body.appendChild(el('span', 'sp-tagline', sponsor.tagline));
            var chip = chips(sponsor);
            if (chip) { body.appendChild(chip); }
            slide.appendChild(body);

            slide.appendChild(ctaBox(sponsor));
            track.appendChild(slide);
            slides.push(slide);
        });

        inner.appendChild(track);
        card.appendChild(inner);

        var index = 0;
        var timer = null;
        var paused = false;
        var dots = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                var on = i === index;
                slide.classList.toggle('is-active', on);
                slide.setAttribute('aria-hidden', on ? 'false' : 'true');
                if (on) { slide.removeAttribute('tabindex'); } else { slide.tabIndex = -1; }
            });
            if (dots) {
                dots.forEach(function (dot, i) {
                    dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
                });
            }
        }

        function stop() {
            if (timer) { window.clearInterval(timer); timer = null; }
        }

        function start() {
            stop();
            if (reduceMotion || slides.length < 2 || !conf.interval) { return; }
            timer = window.setInterval(function () {
                if (!paused && !document.hidden) { show(index + 1); }
            }, conf.interval);
        }

        if (slides.length > 1) {
            // 控制条：[‹] ●●● [›]，统一放在卡片下缘，不与右侧 CTA 抢位置
            var controls = el('div', 'sp-controls');

            function navButton(className, label, step, iconName) {
                var btn = el('button', 'sp-nav ' + className);
                btn.type = 'button';
                btn.setAttribute('aria-label', label);
                btn.appendChild(icon(iconName));
                btn.addEventListener('click', function () {
                    show(index + step);
                    start();
                });
                return btn;
            }

            controls.appendChild(navButton('sp-prev', '上一个赞助商', -1, 'fas fa-chevron-left'));

            var dotWrap = el('div', 'sp-dots');
            dotWrap.setAttribute('role', 'tablist');
            dotWrap.setAttribute('aria-label', '赞助商切换');
            dots = list.map(function (sponsor, i) {
                var dot = el('button');
                dot.type = 'button';
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', '查看 ' + sponsor.name);
                dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                dot.addEventListener('click', function () {
                    show(i);
                    start();
                });
                dotWrap.appendChild(dot);
                return dot;
            });
            controls.appendChild(dotWrap);

            controls.appendChild(navButton('sp-next', '下一个赞助商', 1, 'fas fa-chevron-right'));
            card.appendChild(controls);

            // 悬停 / 聚焦时暂停
            if (conf.pauseOnHover) {
                card.addEventListener('mouseenter', function () { paused = true; });
                card.addEventListener('mouseleave', function () { paused = false; });
                card.addEventListener('focusin', function () { paused = true; });
                card.addEventListener('focusout', function () { paused = false; });
            }

            // 移动端左右滑动
            var startX = null;
            card.addEventListener('touchstart', function (e) {
                startX = e.touches && e.touches.length ? e.touches[0].clientX : null;
            }, { passive: true });
            card.addEventListener('touchend', function (e) {
                if (startX == null) { return; }
                var endX = e.changedTouches && e.changedTouches.length ? e.changedTouches[0].clientX : startX;
                var delta = endX - startX;
                if (Math.abs(delta) > 40) {
                    show(index + (delta < 0 ? 1 : -1));
                    start();
                }
                startX = null;
            }, { passive: true });

            document.addEventListener('visibilitychange', function () {
                if (document.hidden) { stop(); } else { start(); }
            });
        }

        anchor.insertAdjacentElement('afterend', card);
        show(0);
        start();
    }

    /* ======================================================================
     *  ③ 「赞助商」标签页
     * ==================================================================== */
    function renderTab(list, container) {
        var conf = SPONSOR_CONFIG.layouts.tab;
        if (!conf.enabled) { return; }

        var tabBar = container.querySelector('.content-tabs');
        var panels = container.querySelectorAll('.tab-content');
        if (!tabBar || !panels.length) { return; }

        // data-tab 值 partners 对应面板 id partners-content，
        // 与内联脚本的 `${tabId}-content` 约定保持一致。
        var tabButton = el('div', 'tab', conf.title);
        tabButton.setAttribute('data-tab', 'partners');
        tabBar.appendChild(tabButton);

        var panel = el('div', 'tab-content');
        panel.id = 'partners-content';

        var wrap = el('div', 'sp-list');

        var head = el('div', 'sp-list-head');
        var title = el('h3');
        title.appendChild(icon('fas fa-heart'));
        title.appendChild(document.createTextNode(conf.title));
        head.appendChild(title);
        head.appendChild(el('p', null, '本站免费运营，感谢以下赞助商支持'));
        wrap.appendChild(head);

        list.forEach(function (sponsor) {
            var row = link(sponsor, 'sp-row');
            if (sponsor.accent) { row.style.setProperty('--sp-accent', sponsor.accent); }

            row.appendChild(logoBox(sponsor, 152, 52));

            var body = el('div', 'sp-row-body');
            // 这里不再给每行加「赞助」角标：面板标题已经写明「赞助商」，
            // 逐行重复三次反而显得吵。轮播卡和弹窗仍保留角标。
            var name = el('div', 'sp-row-name', sponsor.name);
            body.appendChild(name);
            body.appendChild(el('div', 'sp-row-desc', sponsor.desc));
            var chip = chips(sponsor);
            if (chip) { body.appendChild(chip); }
            row.appendChild(body);

            row.appendChild(ctaBox(sponsor, 'div'));
            wrap.appendChild(row);
        });

        if (SPONSOR_CONFIG.contact) {
            var invite = el('a', 'sp-invite');
            invite.href = SPONSOR_CONFIG.contact;
            invite.target = '_blank';
            invite.rel = 'noopener noreferrer';
            invite.appendChild(icon('fas fa-bullhorn'));
            invite.appendChild(document.createTextNode(SPONSOR_CONFIG.contactText || '广告合作'));
            invite.appendChild(icon('fas fa-arrow-right'));
            wrap.appendChild(invite);
        }

        panel.appendChild(wrap);
        panels[panels.length - 1].insertAdjacentElement('afterend', panel);

        // 兜底的幂等切换逻辑。内联脚本正常工作时两者结果一致，互不干扰；
        // 万一内联脚本因反调试守卫抛错而未注册，这里仍能切换。
        tabButton.addEventListener('click', function () {
            var allTabs = document.querySelectorAll('.tab');
            var allPanels = document.querySelectorAll('.tab-content');
            var i;
            for (i = 0; i < allTabs.length; i++) { allTabs[i].classList.remove('active'); }
            for (i = 0; i < allPanels.length; i++) { allPanels[i].classList.remove('active'); }
            tabButton.classList.add('active');
            panel.classList.add('active');
        });
    }

    /* ======================================================================
     *  ④ 延迟弹窗
     * ==================================================================== */
    function renderModal(list) {
        var conf = SPONSOR_CONFIG.layouts.modal;
        var KEY = 'vip_sp_modal_until';
        if (!conf.enabled || muted(KEY)) { return; }

        var sponsor = conf.pick === 'first'
            ? list[0]
            : list[Math.floor(Math.random() * list.length)];

        window.setTimeout(function () {
            var overlay = el('div', 'sp-dialog');
            overlay.id = 'sp-dialog';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', (SPONSOR_CONFIG.label || '赞助') + '：' + sponsor.name);

            var card = el('div', 'sp-dialog-card');

            var close = el('button', 'sp-dialog-close');
            close.type = 'button';
            close.setAttribute('aria-label', '关闭');
            close.appendChild(icon('fas fa-times'));
            card.appendChild(close);

            var tag = tagBox();
            if (tag) { card.appendChild(tag); }

            card.appendChild(logoBox(sponsor, 190, 62));
            card.appendChild(el('div', 'sp-dialog-name', sponsor.name));
            card.appendChild(el('div', 'sp-dialog-desc', sponsor.desc));
            var chip = chips(sponsor);
            if (chip) { card.appendChild(chip); }

            var cta = link(sponsor, 'sp-cta');
            cta.appendChild(document.createTextNode(sponsor.cta || '了解更多'));
            cta.appendChild(icon('fas fa-arrow-right'));
            card.appendChild(cta);

            var mutedRow = el('label', 'sp-dialog-mute');
            var box = document.createElement('input');
            box.type = 'checkbox';
            mutedRow.appendChild(box);
            mutedRow.appendChild(document.createTextNode('今日不再提示'));
            card.appendChild(mutedRow);

            overlay.appendChild(card);

            function dismiss() {
                if (box.checked) { mute(KEY, conf.dismissDays); }
                overlay.classList.remove('is-open');
                window.setTimeout(function () {
                    if (overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
                }, 350);
                document.removeEventListener('keydown', onKey);
            }

            function onKey(e) {
                if (e.key === 'Escape' || e.keyCode === 27) { dismiss(); }
            }

            close.addEventListener('click', dismiss);
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) { dismiss(); }
            });
            cta.addEventListener('click', function () { mute(KEY, conf.dismissDays); });
            document.addEventListener('keydown', onKey);

            document.body.appendChild(overlay);
            window.requestAnimationFrame(function () {
                overlay.classList.add('is-open');
                close.focus();
            });
        }, Math.max(0, conf.delay || 0));
    }

    /* ======================================================================
     *  ⑤ 纯文字位
     * ==================================================================== */
    function renderText(list, container) {
        if (!SPONSOR_CONFIG.layouts.text.enabled) { return; }

        var anchor = container.querySelector('.footer');
        if (!anchor) { return; }

        var line = el('div', 'sp-line');
        line.setAttribute('role', 'complementary');
        line.setAttribute('aria-label', '赞助商');
        line.appendChild(el('span', 'sp-line-label', (SPONSOR_CONFIG.label || '赞助') + '商：'));

        list.forEach(function (sponsor, i) {
            if (i > 0) { line.appendChild(el('span', 'sp-line-sep', '·')); }
            var a = link(sponsor);
            a.textContent = sponsor.name;
            a.title = sponsor.tagline;
            line.appendChild(a);
        });

        container.insertBefore(line, anchor);
    }

    /* ======================================================================
     *  启动
     * ==================================================================== */
    function init() {
        if (!SPONSOR_CONFIG.enabled) { return; }

        var list = (SPONSOR_CONFIG.sponsors || []).filter(function (s) {
            return s && s.name && s.url;
        });
        if (!list.length) { return; }

        var container = document.querySelector('.container');
        if (!container) { return; }

        renderMarquee(list, container);
        renderCarousel(list, container);
        renderTab(list, container);
        renderText(list, container);
        renderModal(list);
    }

    // 正常情况下本文件已在 .container 之后同步执行，可以立即渲染；
    // 若被误挪到 <head>，退化为等 DOM 就绪后再渲染。
    if (document.querySelector('.container')) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
