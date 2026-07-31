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
                showLabel: false, // 是否在横幅最左边显示「赞助」角标（横幅太窄，默认不显示）
                duration: 32,     // 三家轮完一遍的秒数，越大越慢。内容无缝首尾相接，不会滚出空白
                // 用户点 × 关闭后，多久才会再出现：
                //   'session'  当前标签页内不再出现，重新访问网站就恢复（默认）
                //   'reload'   刷新页面就恢复（最激进）
                //   数字        静默的天数，例如 7
                dismiss: 'session'
            },
            // ② 播放器下方轮播卡
            carousel: {
                enabled: true,
                interval: 6000,   // 自动切换间隔（毫秒），设 0 关闭自动切换
                pauseOnHover: true,
                // 'auto'：赞助商配了 banner 就渲染整张大图，没配就渲染信息卡，两种可混用
                // 'card'：全部走信息卡，忽略 banner 配置
                mode: 'auto',
                // 整图模式的默认约束，单个 banner 可以各自覆盖
                banner: {
                    ratio: '1200 / 160',    // 图片宽高比，必须和实际图一致，否则会裁切
                    ratioMobile: '',        // 手机端换图时填它，留空表示和 ratio 一样
                    maxHeight: 180,         // 桌面端最大高度(px)
                    maxHeightMobile: 120    // 手机端最大高度(px)
                }
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
                dismiss: 1,       // 勾选「今日不再提示」后静默几天（同样支持 'session'）
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
        //   banner                        可选。配了就在轮播卡里渲染整张大图，见下方示例
        //
        // logo 建议用「深色字 + 透明底 / 浅底」的横版图，会被放进 152×52 的白色托盘里；
        // 加载失败时自动退化成品牌名文字，不会留空白。
        //
        // 整图（纯图片轮播）示例 —— 把 banner 加进任意一家即可，可以只给部分赞助商配，
        // 整图和信息卡能混在同一个轮播里；三家都配了整图，卡片就自动进满幅模式（图顶到边框）。
        //   banner: {
        //       src:         'https://.../banner-1200x160.jpg',
        //       ratio:       '1200 / 160',   // 必须和 src 的实际像素比一致，否则会裁切
        //       srcMobile:   'https://.../banner-750x260.jpg',  // 可选，手机端换一张
        //       ratioMobile: '750 / 260',    // 配了 srcMobile 且比例不同就必须填
        //       maxHeight:       180,        // 可选，桌面端最大高度(px)
        //       maxHeightMobile: 120,        // 可选，手机端最大高度(px)
        //       alt:         '双十一大促 5 折起'  // 可选，默认用品牌名
        //   }
        // 尺寸建议：桌面 1200×160（约 7.5:1），手机另配一张 750×260（约 2.9:1）。
        // 直接把桌面横条塞到 390px 的手机屏上只有 ~46px 高，字会糊，务必配 srcMobile。
        // 图片加载失败会自动退回信息卡，不会留白块。
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

    function store(session) {
        try { return session ? window.sessionStorage : window.localStorage; } catch (e) { return null; }
    }

    function storeGet(key, session) {
        try { var s = store(session); return s ? s.getItem(key) : null; } catch (e) { return null; }
    }

    function storeSet(key, value, session) {
        try { var s = store(session); if (s) { s.setItem(key, value); } } catch (e) { /* 隐私模式忽略 */ }
    }

    /* 关闭后的静默策略，dismiss 取值见配置区注释：
         'reload'   完全不落盘，刷新就恢复
         'session'  写 sessionStorage，关掉标签页重新访问就恢复（广告场景的默认）
         数字        写 localStorage 存过期时间戳，静默指定天数
       返回 true 表示仍在静默期内。 */
    function muted(key, dismiss) {
        if (dismiss === 'reload') { return false; }
        if (dismiss === 'session') { return storeGet(key, true) === '1'; }
        var until = parseInt(storeGet(key) || '0', 10);
        return !!until && Date.now() < until;
    }

    function mute(key, dismiss) {
        if (dismiss === 'reload') { return; }
        if (dismiss === 'session') { storeSet(key, '1', true); return; }
        storeSet(key, String(Date.now() + Math.max(0, parseFloat(dismiss) || 0) * DAY));
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

    /* 解析整图配置。返回 null 表示这家没配 banner，走信息卡。
       用「最大高度 × 宽高比」反推出最大宽度，图片就能永远完整显示 ——
       既不会被裁掉边角，也不会出现黑边，只是在超宽屏上不铺满整行。 */
    function bannerSpec(sponsor, carouselConf) {
        var b = sponsor.banner;
        if (!b || !b.src) { return null; }
        var g = carouselConf.banner || {};

        function ar(ratio) {
            var parts = String(ratio).split('/');
            var w = parseFloat(parts[0]);
            var h = parseFloat(parts[1] || '1');
            return (w > 0 && h > 0) ? (w / h) : 7.5;
        }

        var ratio = b.ratio || g.ratio || '1200 / 160';
        // 手机端换了图往往也换了比例（横条 -> 方一点的图），所以比例要能单独配；
        // 没配就沿用桌面比例。
        var ratioM = b.ratioMobile || g.ratioMobile || ratio;
        return {
            src: b.src,
            srcMobile: b.srcMobile || '',
            alt: b.alt || sponsor.name,
            ratio: ratio,
            ratioMobile: ratioM,
            ar: ar(ratio),
            arMobile: ar(ratioM),
            maxHeight: b.maxHeight || g.maxHeight || 180,
            maxHeightMobile: b.maxHeightMobile || g.maxHeightMobile || 120
        };
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
        if (!conf.enabled || muted(KEY, conf.dismiss)) { return; }

        var strip = el('div', 'sp-strip');
        strip.id = 'sp-strip';
        strip.setAttribute('role', 'complementary');
        strip.setAttribute('aria-label', '赞助商');

        // 这里刻意不渲染页面原有的 .notice-icon 圆形图标：
        // 圆图标 + 「赞助」角标两个标识挨在一起既重复又占位置（桌面吃掉 51px、
        // 手机 38px），横幅本来就是最窄的一条。角标也默认关掉了，见 showLabel。
        // 广告披露靠链接上的 rel="sponsored" 与「赞助商」标签页承担。
        if (conf.showLabel) {
            var tag = tagBox();
            if (tag) { strip.appendChild(tag); }
        }

        var content = el('div', 'notice-content');
        var text = el('div', 'notice-text');

        /* 追加一份完整内容。每条后面都跟一个分隔符（而不是只在条目之间加），
           这样首尾相接处读起来是「…免费领取 · WorkBuddy…」，接缝看不出来。
           clone=true 的那几份纯粹为了填满视口，读屏和 Tab 键都要跳过，
           否则同一个链接会被念三遍、Tab 也要按三遍才能走完。 */
        function appendCopy(clone) {
            list.forEach(function (sponsor) {
                var item = el('span', 'sp-strip-item');

                var name = link(sponsor, 'sp-strip-name');
                name.textContent = sponsor.name;
                item.appendChild(name);

                item.appendChild(el('span', 'sp-strip-desc', sponsor.tagline));

                var go = link(sponsor, 'sp-strip-go');
                go.textContent = sponsor.cta || '了解更多';
                item.appendChild(go);

                if (clone) {
                    item.setAttribute('aria-hidden', 'true');
                    name.tabIndex = -1;
                    go.tabIndex = -1;
                }

                text.appendChild(item);
                text.appendChild(el('span', 'sp-strip-sep', '·'));
            });
        }

        appendCopy(false);
        // 不滚动时不需要副本，末尾那个分隔符也得去掉
        if (reduceMotion) { text.removeChild(text.lastChild); }

        content.appendChild(text);
        strip.appendChild(content);

        var close = el('button', 'notice-close');
        close.type = 'button';
        close.setAttribute('aria-label', '关闭赞助提示');
        close.appendChild(icon('fas fa-times'));
        close.addEventListener('click', function () {
            strip.style.display = 'none';
            mute(KEY, conf.dismiss);
        });
        strip.appendChild(close);

        container.insertBefore(strip, container.firstChild);

        /* ── 无缝循环 ──────────────────────────────────────────────────────
           页面原版是 `padding-left: 100%` 配 `translateX(-100%)`：内容先被推到
           视口右侧外面，再整体左移自身宽度。结果每一轮的开头和结尾都必然有一段
           空白（合计约两个视口宽），三条滚完就"掉进空白里"。
           无缝的做法是复制内容、去掉 padding，只位移「一份」的宽度：位移结束时
           第 2 份正好停在第 1 份的起始位置，视觉上完全连续。
           复制份数要保证「除第一份之外的部分」能盖满视口，否则位移到底时右边
           还是会露白 —— 所以按实测宽度算，而不是写死 2 份。 */
        if (!reduceMotion) {
            var copyW = text.getBoundingClientRect().width;
            var viewW = content.getBoundingClientRect().width;
            var copies = 2;
            if (copyW > 0) {
                copies = Math.max(2, Math.ceil(viewW / copyW) + 1);
            }
            for (var c = 1; c < copies; c++) { appendCopy(true); }
            text.style.setProperty('--sp-marquee-shift', (-100 / copies) + '%');
            // duration 的语义是「一份内容滚完」，和复制了几份无关，速度恒定
            if (conf.duration) { text.style.animationDuration = conf.duration + 's'; }

            /* 兜底：CSS 那边用 overflow: clip 挡掉了「Tab 到视口外的链接会把
               容器滚走」的问题，但 Safari 16 以前不认 clip。滚动一旦发生就把
               它按回去，否则跑马灯会被永久错位、露出空白。 */
            content.addEventListener('scroll', function () {
                if (content.scrollLeft) { content.scrollLeft = 0; }
            });
        }
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

        // 信息卡形态：logo + 品牌名 + 一句话 + 卖点徽章 + 按钮
        function fillAsCard(slide, sponsor) {
            slide.appendChild(logoBox(sponsor, 152, 52));
            var body = el('span', 'sp-body');
            body.appendChild(el('span', 'sp-name', sponsor.name));
            body.appendChild(el('span', 'sp-tagline', sponsor.tagline));
            var chip = chips(sponsor);
            if (chip) { body.appendChild(chip); }
            slide.appendChild(body);
            slide.appendChild(ctaBox(sponsor));
        }

        // 整图形态：一张 banner 铺满，点击整块跳转
        function fillAsBanner(slide, sponsor, spec, eager) {
            slide.classList.add('sp-slide--img');

            // 比例走 CSS 变量而不是内联 aspect-ratio：手机端要在媒体查询里换成
            // ratioMobile，内联样式没法响应媒体查询。
            var frame = el('span', 'sp-media');
            frame.style.setProperty('--sp-media-ratio', spec.ratio);
            frame.style.setProperty('--sp-media-ratio-m', spec.ratioMobile);
            frame.style.setProperty('--sp-media-ar', String(spec.ar));
            frame.style.setProperty('--sp-media-ar-m', String(spec.arMobile));
            frame.style.setProperty('--sp-media-max-h', spec.maxHeight + 'px');
            frame.style.setProperty('--sp-media-max-h-m', spec.maxHeightMobile + 'px');

            var img = document.createElement('img');
            img.src = spec.src;
            img.alt = spec.alt;
            img.loading = eager ? 'eager' : 'lazy';
            img.decoding = 'async';

            // 图挂了就退回信息卡，不留白块
            img.addEventListener('error', function () {
                slide.textContent = '';
                slide.classList.remove('sp-slide--img');
                fillAsCard(slide, sponsor);
                syncCardMode();
            });

            if (spec.srcMobile) {
                var pic = document.createElement('picture');
                var alt = document.createElement('source');
                alt.media = '(max-width: 768px)';
                alt.srcset = spec.srcMobile;
                pic.appendChild(alt);
                pic.appendChild(img);
                frame.appendChild(pic);
            } else {
                frame.appendChild(img);
            }
            slide.appendChild(frame);
        }

        // 三张图都是整图时，卡片进入满幅模式：去掉内边距和白色内衬，图片顶到边
        function syncCardMode() {
            var imgs = 0;
            slides.forEach(function (s) {
                if (s.classList.contains('sp-slide--img')) { imgs++; }
            });
            card.classList.toggle('sp-card--img', imgs > 0 && imgs === slides.length);
        }

        list.forEach(function (sponsor, i) {
            var slide = link(sponsor, 'sp-slide' + (i === 0 ? ' is-active' : ''));
            if (sponsor.accent) {
                var glow = rgba(sponsor.accent, 0.5);
                if (glow) { slide.style.setProperty('--sp-accent', glow); }
            }
            slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
            if (i !== 0) { slide.tabIndex = -1; }

            var spec = conf.mode === 'card' ? null : bannerSpec(sponsor, conf);
            if (spec) {
                fillAsBanner(slide, sponsor, spec, i === 0);
            } else {
                fillAsCard(slide, sponsor);
            }

            track.appendChild(slide);
            slides.push(slide);
        });

        syncCardMode();
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
        if (!conf.enabled || muted(KEY, conf.dismiss)) { return; }

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
                if (box.checked) { mute(KEY, conf.dismiss); }
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
            cta.addEventListener('click', function () { mute(KEY, conf.dismiss); });
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
        line.id = 'sp-line';          // 和 sp-strip / sp-card / sp-dialog 保持一致，方便外部定位
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
