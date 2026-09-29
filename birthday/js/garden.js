/* ==========================================================================
   garden.js —— 花朵绽放引擎
   --------------------------------------------------------------------------
   一颗心由近千朵小花「生长」而成：每朵花由若干花瓣构成，花瓣以贝塞尔曲线
   逐帧向外延伸，配合 canvas 的 lighter 混合模式叠加出柔和的玫瑰金光泽。
   坐标系固定为 670 × 625 的设计空间，实际显示时按容器等比缩放，
   因此同一套坐标在手机与桌面上都能得到相同的形状。
   ========================================================================== */
(function (global) {
    'use strict';

    var TAU = Math.PI * 2;

    /* 设计稿尺寸：与心形坐标数据同一坐标系 */
    var DESIGN_W = 670;
    var DESIGN_H = 625;

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }

    Vector.prototype = {
        rotate: function (theta) {
            var x = this.x;
            var y = this.y;
            this.x = Math.cos(theta) * x - Math.sin(theta) * y;
            this.y = Math.sin(theta) * x + Math.cos(theta) * y;
            return this;
        },
        mult: function (f) {
            this.x *= f;
            this.y *= f;
            return this;
        },
        clone: function () {
            return new Vector(this.x, this.y);
        },
        length: function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        subtract: function (v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        },
        set: function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
    };

    /* ------------------------------------------------------------------ */
    /* 花瓣                                                               */
    /* ------------------------------------------------------------------ */
    function Petal(stretchA, stretchB, startAngle, angle, growFactor, bloom) {
        this.stretchA = stretchA;
        this.stretchB = stretchB;
        this.startAngle = startAngle;
        this.angle = angle;
        this.bloom = bloom;
        this.growFactor = growFactor;
        this.r = 1;
        this.isfinished = false;
    }

    Petal.prototype.draw = function () {
        var ctx = this.bloom.garden.ctx;
        var v1 = new Vector(0, this.r).rotate(Garden.degrad(this.startAngle));
        var v2 = v1.clone().rotate(Garden.degrad(this.angle));
        var v3 = v1.clone().mult(this.stretchA);
        var v4 = v2.clone().mult(this.stretchB);

        ctx.strokeStyle = this.bloom.c;
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y);
        ctx.stroke();
    };

    Petal.prototype.render = function () {
        if (this.r <= this.bloom.r) {
            this.r += this.growFactor;
            this.draw();
        } else {
            this.isfinished = true;
        }
    };

    /* ------------------------------------------------------------------ */
    /* 花朵                                                               */
    /* ------------------------------------------------------------------ */
    function Bloom(p, r, c, pc, garden) {
        this.p = p;
        this.r = r;
        this.c = c;
        this.pc = pc;
        this.petals = [];
        this.garden = garden;
        this.init();
        this.garden.addBloom(this);
    }

    Bloom.prototype = {
        draw: function () {
            var finished = true;
            var ctx = this.garden.ctx;
            ctx.save();
            ctx.translate(this.p.x, this.p.y);
            for (var i = 0; i < this.petals.length; i++) {
                var p = this.petals[i];
                p.render();
                if (!p.isfinished) {
                    finished = false;
                }
            }
            ctx.restore();
            if (finished) {
                this.garden.removeBloom(this);
            }
        },
        init: function () {
            var angle = 360 / this.pc;
            var startAngle = randInt(0, 90);
            for (var i = 0; i < this.pc; i++) {
                this.petals.push(new Petal(
                    rand(Garden.options.petalStretch.min, Garden.options.petalStretch.max),
                    rand(Garden.options.petalStretch.min, Garden.options.petalStretch.max),
                    startAngle + i * angle,
                    angle,
                    rand(Garden.options.growFactor.min, Garden.options.growFactor.max),
                    this
                ));
            }
        }
    };

    /* ------------------------------------------------------------------ */
    /* 花园（画布容器）                                                    */
    /* ------------------------------------------------------------------ */
    function Garden(ctx, element) {
        this.blooms = [];
        this.element = element;
        this.ctx = ctx;
        this.scale = 1;
        this.originX = 0;
        this.originY = 0;
        this.cssW = 0;
        this.cssH = 0;
        this.ready = false;
    }

    Garden.prototype = {
        render: function () {
            for (var i = 0; i < this.blooms.length; i++) {
                this.blooms[i].draw();
            }
        },
        addBloom: function (b) {
            this.blooms.push(b);
        },
        removeBloom: function (b) {
            for (var i = 0; i < this.blooms.length; i++) {
                if (this.blooms[i] === b) {
                    this.blooms.splice(i, 1);
                    return this;
                }
            }
        },
        /* 按容器尺寸重建画布，并把坐标系映射到 670 × 625 的设计空间。
           返回值表示尺寸是否真的发生了变化 —— 没变就不动画布，
           否则会把正在生长的花朵清掉、整幅重画，动画会「闪」一下。 */
        resize: function () {
            var rect = this.element.getBoundingClientRect();
            var dpr = Math.min(global.devicePixelRatio || 1, 2);
            var w = Math.max(1, rect.width);
            var h = Math.max(1, rect.height);

            if (this.ready && this.cssW === w && this.cssH === h) {
                return false;
            }
            this.cssW = w;
            this.cssH = h;
            this.ready = true;

            this.element.width = Math.round(w * dpr);
            this.element.height = Math.round(h * dpr);
            this.originX = 0;
            this.originY = 0;
            this.scale = Math.min(w / DESIGN_W, h / DESIGN_H);

            /* 居中留白 */
            this.originX = (w - DESIGN_W * this.scale) / 2;
            this.originY = (h - DESIGN_H * this.scale) / 2;

            var ctx = this.ctx;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, this.element.width, this.element.height);
            ctx.setTransform(
                dpr * this.scale, 0, 0, dpr * this.scale,
                dpr * this.originX, dpr * this.originY
            );
            /* 背景是浅粉底色，必须用 source-over 正常叠加。
               若用 lighter，通道相加会迅速饱和成白色，花朵会「消失」。 */
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineCap = 'round';
            ctx.lineWidth = 1;

            this.blooms = [];
            return true;
        },
        clear: function () {
            this.blooms = [];
            var ctx = this.ctx;
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, this.element.width, this.element.height);
            ctx.restore();
        },
        /* 把屏幕坐标换算回设计坐标，用于「点击处开花」 */
        toDesignPoint: function (clientX, clientY) {
            var rect = this.element.getBoundingClientRect();
            return new Vector(
                (clientX - rect.left - this.originX) / this.scale,
                (clientY - rect.top - this.originY) / this.scale
            );
        },
        createRandomBloom: function (x, y) {
            var o = Garden.options;
            this.createBloom(
                x, y,
                randInt(o.bloomRadius.min, o.bloomRadius.max),
                Garden.pickColor(),
                randInt(o.petalCount.min, o.petalCount.max)
            );
        },
        createBloom: function (x, y, r, c, pc) {
            new Bloom(new Vector(x, y), r, c, pc, this);
        }
    };

    /* ------------------------------------------------------------------ */
    /* 参数与调色                                                          */
    /* ------------------------------------------------------------------ */
    Garden.options = {
        petalCount: { min: 6, max: 12 },
        petalStretch: { min: 0.35, max: 2.7 },
        growFactor: { min: 0.26, max: 0.86 },
        bloomRadius: { min: 3.2, max: 5.6 },
        /* 每帧间隔（毫秒），越小越顺滑、开销越大 */
        growSpeed: 1000 / 45
    };

    Garden.DESIGN_W = DESIGN_W;
    Garden.DESIGN_H = DESIGN_H;

    /* 玫瑰金调色：以玫瑰粉为绝对主色（约 72%），少量香槟金与藕荷紫点缀，
       极少量薄荷色提亮。透明度偏中等，重叠处自然加深，形成水彩般的手绘质感。 */
    Garden.pickColor = function () {
        var h;
        var roll = Math.random();
        if (roll < 0.72) {
            h = rand(332, 356);          /* 玫瑰粉 */
        } else if (roll < 0.87) {
            h = rand(20, 42);            /* 香槟金 / 珊瑚 */
        } else if (roll < 0.97) {
            h = rand(288, 310);          /* 藕荷紫 */
        } else {
            h = rand(164, 178);          /* 薄荷，仅作提亮 */
        }
        var s = rand(74, 92);
        var l = rand(56, 74);
        var a = rand(0.32, 0.58);
        return 'hsla(' + h.toFixed(1) + ',' + s.toFixed(1) + '%,' + l.toFixed(1) + '%,' + a.toFixed(3) + ')';
    };

    Garden.circle = TAU;
    Garden.degrad = function (angle) {
        return TAU / 360 * angle;
    };
    Garden.raddeg = function (angle) {
        return angle / TAU * 360;
    };

    global.Garden = Garden;
})(window);
