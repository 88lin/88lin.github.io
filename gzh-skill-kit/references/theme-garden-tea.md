# 公众号排版组件库 —— 花园茶会 Garden Tea

> **使用说明**：本组件库为「花园茶会（Garden Tea）」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：薰衣草紫 + 草莓粉 + 天蓝，杂志编号式的梦幻手账排版。按 **60/30/10** 组织三色：薰衣草紫 `#7C5CD6` 承担标题、装饰词、短条与编号（60%），草莓粉 `#EC7FA3` 承担荧光笔与浅底块（30%），天蓝色 `#7CC7EF` 只做小标签与关键句点睛（10%）。标题用衬线、正文用无衬线；每章以一枚 **68px 淡色斜体英文装饰词**开场，接衬线标题与一根粉色短条；正文 17px、行高 2；全篇用一块深紫面板与一条三色装饰条控制节奏。植物气质来自**线描插画**（叶芽、蝴蝶、茶壶），不是大面积绿块。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id/`<div>`、`position:fixed/absolute/sticky`、`float`、`@media`/`@keyframes`、`display:grid`、CSS 变量 `var(--x)`
> - ❌ 不使用任何渐变；高亮一律用纯色块（微信客户端渲染最稳）
> - **外层底色会被剥离**：每个正文区块（开场、章节、浅底卡、深色面板、签名区）都要各自带 `background`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、静态 SVG、`<section>/<p>/<span>/<img>`
>
> **WeChat 兼容铁律**：
> - 装饰性空元素内部放 `<span leaf=""><br></span>`；SVG 整体包在 `<span leaf="">` 内，插画内不写文字
> - 荧光笔样式挂在外层 `<span>`，同一 `<p>` 只用一个字号
> - **高亮 span 必须带 `white-space:nowrap`**：否则行尾的高亮会被浏览器切成两段
> - 主标题超过一行时用 `<br>` 在语义边界显式断行；英文装饰词加 `white-space:nowrap`
> - 深色面板上只用 `#FFFFFF` / `#D8CAE8`，浅色底只用墨色 `#2A1F3D`
> - 紫色只做线描与小块，不铺满整卡；一屏彩色元素 ≤4 处
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
页面底（奶油白）：   #FFF9FD
卡片底（暖白）：     #FFFFFF
次级底色：           #F3EDFC
主色（薰衣草紫）：   #7C5CD6（标题 / 装饰词 / 短条 / 编号）
主色深阶：           #5E3FB8
主色浅阶：           #B3A0E8
强调色（草莓粉）：   #EC7FA3（荧光笔 / 章节短条 / 引言底）
强调浅底：           #FCE6EE
点缀色（玫瑰）：     #7CC7EF（朱点 / 小标签 / 关键句）
点缀深阶：           #2A739C
点缀浅底：           #EAF5FD
墨色正文：           #2A1F3D
次要文字：           #4C3D5E
辅助文字：           #847494
深色面板：           #1F1730
深色面板次要字：     #D8CAE8
细线 / 描边：        rgba(47,35,64,0.11)
极细线：             rgba(47,35,64,0.06)
标题字体：           Georgia,'Songti SC','Noto Serif SC','STSong',serif
正文字体：           -apple-system,'PingFang SC','Helvetica Neue',sans-serif
正文字号：           17px，line-height:2
装饰词：             68px 斜体衬线，主色 14% 透明度
最大宽度：           677px
内容区边距：         44px 26px 40px
```

三色比例：**薰衣草紫 55% · 草莓粉 30% · 天蓝 15%**。玫瑰永远只做点缀，不做主色。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FFF9FD;padding:44px 26px 40px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#2A1F3D;font-size:17px;line-height:2;overflow-x:hidden;box-sizing:border-box;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 开场（kicker + 星芒插画 + 衬线标题 + 三色条）

```html
<section style="text-align:center;margin-bottom:16px;background:#FFF9FD;">
  <span style="font-size:13px;font-weight:bold;letter-spacing:6px;color:#7CC7EF;"><span leaf="">GARDEN NOTES</span></span>
</section>
<section style="text-align:center;margin-bottom:38px;padding:18px 0 20px;background:#FFF9FD;">
  <section style="margin:0 auto 14px;width:64px;max-width:64px;font-size:0;line-height:0;"><span leaf=""><svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" style="display:block;margin:0 auto;max-width:100%;"><circle cx="32" cy="32" r="30" fill="#FCE6EE"/><path d="M32 52C32 38 32 28 30 18" stroke="#7C5CD6" stroke-width="2.4" stroke-linecap="round"/><path d="M30 38C20 36 16 28 19 20C27 22 32 30 30 38Z" fill="#B3A0E8" stroke="#7C5CD6" stroke-width="1.8" stroke-linejoin="round"/><path d="M31 30C40 28 45 20 42 12C34 14 29 22 31 30Z" fill="#B3A0E8" stroke="#7C5CD6" stroke-width="1.8" stroke-linejoin="round"/><path d="M31 22C25 16 26 8 32 6C38 8 38 16 31 22Z" fill="#EAF5FD" stroke="#7CC7EF" stroke-width="1.8" stroke-linejoin="round"/><circle cx="32" cy="13" r="2" fill="#7CC7EF"/></svg></span></section>
  <p style="margin:0 0 12px;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:34px;font-weight:900;line-height:1.55;color:#2A1F3D;word-break:normal;overflow-wrap:normal;"><span leaf="">做了些爆款 Skills 以后，</span><br><span leaf="">我对 Skills 的看法</span></p>
  <p style="margin:0 0 24px;font-size:17px;line-height:1.8;color:#4C3D5E;"><span leaf="">关于经验、判断与长期积累的一次思考</span></p>
  <section style="text-align:center;background:#FFF9FD;">
    <span style="display:inline-block;width:36px;height:4px;border-radius:2px;background:#7C5CD6;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:18px;height:4px;border-radius:2px;background:#EC7FA3;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:8px;height:4px;border-radius:2px;background:#7CC7EF;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
</section>
```

---

## 组件 3 引言金句（居中衬线 + 玫瑰关键词）

```html
<section style="text-align:center;margin-bottom:12px;background:#FFF9FD;">
  <p style="margin:0;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:22px;font-weight:900;line-height:1.9;color:#2A1F3D;"><span leaf="">Agent 不是简单抹平能力差距，</span><br><span leaf="">而是</span><span style="color:#7CC7EF;"><span leaf="">在放大能力差距</span></span><span leaf="">。</span></p>
</section>
```

---

## 组件 4 引言区块（浅粉底）

```html
<section style="margin-bottom:28px;padding:24px 22px;background:#FCE6EE;border-radius:16px;">
  <p style="margin:0 0 14px;font-size:17px;line-height:2;color:#2A1F3D;"><span leaf="">引言正文第一段。把全文最核心的一句判断放这里，两到三行。</span></p>
  <p style="margin:0;font-size:17px;line-height:2;color:#2A1F3D;"><span leaf="">第二段可补一句背景，不要超过三行。</span></p>
</section>
```

---

## 组件 5 章节头三件套（装饰词 + 衬线标题 + 粉色短条）

```html
<section style="margin-bottom:52px;background:#FFF9FD;">
  <section style="margin-bottom:6px;background:#FFF9FD;">
    <span style="display:inline-block;font-family:Georgia,'Songti SC',serif;font-style:italic;font-size:68px;font-weight:bold;line-height:1;color:rgba(124,92,214,0.20);white-space:nowrap;word-break:keep-all;overflow-wrap:normal;"><span leaf="">Roots</span></span>
  </section>
  <section style="margin-bottom:4px;background:#FFF9FD;">
    <span style="font-size:13px;font-weight:bold;letter-spacing:4px;color:#7C5CD6;"><span leaf="">CHAPTER 01</span></span>
  </section>
  <section style="margin-bottom:10px;background:#FFF9FD;">
    <span style="font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:30px;font-weight:900;line-height:1.55;color:#2A1F3D;"><span leaf="">Skill 是能力商品</span></span>
  </section>
  <section style="margin-bottom:22px;background:#FFF9FD;">
    <span style="display:inline-block;width:56px;height:6px;border-radius:3px;background:#EC7FA3;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
</section>
```

装饰词取与章节相关的英文单词（Roots / Garden / Prune / Bloom / Season），整词出现不拆行。

---

## 组件 6 正文段落 + 粉色高亮块

```html
<section style="margin-bottom:18px;background:#FFF9FD;">
  <p style="margin:0;font-size:17px;line-height:2;color:#2A1F3D;text-align:justify;"><span leaf="">正文段落。每段三到四行，关键词用粉色高亮块标记，每段 1~3 处。</span></p>
</section>
```

```html
<span style="background:#FFD3E2;color:#9C2547;font-weight:bold;padding:1px 4px;border-radius:4px;"><span leaf="">高亮文字</span></span>
```

---

## 组件 7 小标题（`###`，紫色短竖条）

```html
<section style="margin:26px 0 14px;background:#FFF9FD;">
  <section style="display:flex;align-items:center;background:#FFF9FD;">
    <section style="width:3px;height:16px;background:#7C5CD6;margin-right:10px;font-size:0;line-height:0;"><span leaf=""><br></span></section>
    <span style="font-size:18px;font-weight:bold;line-height:1.6;color:#2A1F3D;"><span leaf="">小节标题</span></span>
  </section>
</section>
```

---

## 组件 8 深色面板（墨绿，全篇 1 处）

```html
<section style="margin:34px 0;padding:28px 24px;background:#1F1730;border-radius:18px;">
  <p style="margin:0 0 12px;font-size:12px;font-weight:bold;letter-spacing:3px;color:#EC7FA3;"><span leaf="">ONE THING</span></p>
  <p style="margin:0;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:20px;font-weight:bold;line-height:1.9;color:#FFFFFF;"><span leaf="">复杂 Skill 不怕有复杂内容，</span><br><span leaf="">怕的是一次性全塞给模型。</span></p>
  <p style="margin:12px 0 0;font-size:13px;line-height:1.8;color:#D8CAE8;"><span leaf="">—— 一条可以贴在显示器上的原则</span></p>
</section>
```

---

## 组件 9 提示卡（粉色左竖条）

```html
<section style="margin:26px 0;padding:20px 22px;background:#FCE6EE;border-left:3px solid #EC7FA3;border-radius:0 12px 12px 0;">
  <p style="margin:0 0 8px;font-size:13px;font-weight:bold;letter-spacing:2px;color:#7C5CD6;"><span leaf="">NOTE · 一点提醒</span></p>
  <p style="margin:0;font-size:16px;line-height:1.95;color:#2A1F3D;text-align:justify;"><span leaf="">提示正文。放避坑建议、适用边界或需要提前知道的前提。</span></p>
</section>
```

---

## 组件 10 叶片清单

```html
<section style="margin-bottom:10px;background:#FFF9FD;">
  <span style="display:inline-block;width:8px;height:8px;border-radius:50% 0 50% 50%;background:#B3A0E8;margin-right:12px;vertical-align:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  <span style="font-size:17px;line-height:2;color:#2A1F3D;"><span leaf="">清单项内容，一行说完。</span></span>
</section>
```

---

## 组件 11 编号步骤（实心主色圆）

```html
<section style="margin-bottom:14px;display:flex;align-items:flex-start;background:#FFF9FD;">
  <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:#7C5CD6;font-size:13px;font-weight:bold;color:#FFFFFF;flex-shrink:0;margin-right:14px;"><span leaf="">1</span></span>
  <span style="flex:1;font-size:17px;line-height:1.9;color:#2A1F3D;"><span leaf="">步骤说明。一步一句，动作放在最前面。</span></span>
</section>
```

---

## 组件 12 蝴蝶引语卡（线描插画 + 浅玫瑰底）

```html
<section style="margin:28px 0;padding:22px 22px 20px;background:#EAF5FD;border-radius:16px;text-align:center;">
  <section style="margin:0 auto 10px;width:58px;max-width:58px;font-size:0;line-height:0;"><span leaf=""><svg width="58" height="46" viewBox="0 0 58 46" fill="none" aria-hidden="true" style="display:block;margin:0 auto;max-width:100%;"><path d="M29 23C18 9 5 13 8 25C10 33 21 32 29 23Z" fill="#FFFFFF" stroke="#7CC7EF" stroke-width="1.8" stroke-linejoin="round"/><path d="M29 23C40 9 53 13 50 25C48 33 37 32 29 23Z" fill="#FCE6EE" stroke="#7CC7EF" stroke-width="1.8" stroke-linejoin="round"/><path d="M29 23C20 28 14 36 19 40C24 43 28 33 29 23Z" fill="#FCE6EE" stroke="#7CC7EF" stroke-width="1.8" stroke-linejoin="round"/><path d="M29 23C38 28 44 36 39 40C34 43 30 33 29 23Z" fill="#FFFFFF" stroke="#7CC7EF" stroke-width="1.8" stroke-linejoin="round"/><path d="M29 23C27 30 27 37 29 42" stroke="#2A1F3D" stroke-width="2" stroke-linecap="round"/><path d="M29 23L22 16M29 23L36 16" stroke="#2A1F3D" stroke-width="1.6" stroke-linecap="round"/><circle cx="21" cy="15" r="1.5" fill="#2A1F3D"/><circle cx="37" cy="15" r="1.5" fill="#2A1F3D"/></svg></span></section>
  <p style="margin:0 0 8px;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:19px;font-weight:900;line-height:1.9;color:#2A739C;"><span leaf="">引语第一行</span><br><span leaf="">引语第二行</span></p>
  <p style="margin:0;font-size:12px;line-height:1.8;color:#847494;"><span leaf="">—— 出处或小注</span></p>
</section>
```

---

## 组件 13 云朵便签（线描插画 + 浅粉底）

```html
<section style="margin:26px 0;padding:20px 20px 18px;background:#FCE6EE;border-radius:16px;">
  <section style="display:flex;align-items:center;margin-bottom:8px;">
    <section style="width:38px;max-width:38px;margin-right:10px;font-size:0;line-height:0;"><span leaf=""><svg width="38" height="30" viewBox="0 0 38 30" fill="none" aria-hidden="true" style="display:block;max-width:100%;"><path d="M8 13C8 8 30 8 30 13C30 21 22 25 19 25C16 25 8 21 8 13Z" fill="#FFFFFF" stroke="#7C5CD6" stroke-width="1.8"/><path d="M14 8C16 4 22 4 24 8" fill="#FFFFFF" stroke="#7C5CD6" stroke-width="1.8"/><circle cx="19" cy="4" r="2" fill="#EC7FA3" stroke="#7C5CD6" stroke-width="1.4"/><path d="M29 12C35 11 35 18 29 18" stroke="#7C5CD6" stroke-width="1.8" fill="none"/><path d="M8 13C2 12 2 19 8 19" stroke="#7C5CD6" stroke-width="1.8" fill="none"/><path d="M15 1C13-1 17-2 15-4" stroke="#B3A0E8" stroke-width="1.5" stroke-linecap="round"/><path d="M23 1C21-1 25-2 23-4" stroke="#B3A0E8" stroke-width="1.5" stroke-linecap="round"/></svg></span></section>
    <span style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#7C5CD6;"><span leaf="">TEA NOTE · 一点提醒</span></span>
  </section>
  <p style="margin:0;font-size:16px;line-height:1.95;color:#2A1F3D;text-align:justify;"><span leaf="">提醒正文。放避坑建议、适用边界或需要提前知道的前提。</span></p>
</section>
```

---

## 组件 14 双栏对比卡（浅粉 / 浅蓝）

```html
<section style="margin:24px 0;background:#FFF9FD;">
  <section style="display:flex;gap:12px;">
    <section style="flex:1;padding:18px 16px;background:#FCE6EE;border-radius:14px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:bold;letter-spacing:1px;color:#7C5CD6;"><span leaf="">BEFORE</span></p>
      <p style="margin:0;font-size:15px;line-height:1.9;color:#2A1F3D;"><span leaf="">两行以内的短内容。</span></p>
    </section>
    <section style="flex:1;padding:18px 16px;background:#EAF5FD;border-radius:14px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:bold;letter-spacing:1px;color:#2A739C;"><span leaf="">AFTER</span></p>
      <p style="margin:0;font-size:15px;line-height:1.9;color:#2A1F3D;"><span leaf="">两行以内的短内容。</span></p>
    </section>
  </section>
</section>
```

---

## 组件 15 图片

```html
<section style="margin:24px 0;background:#FFF9FD;">
  <span leaf=""><img src="{{图片URL}}" style="width:100%;display:block;border-radius:14px;"></span>
  <p style="margin:10px 0 0;text-align:center;font-size:13px;line-height:1.8;color:#847494;"><span leaf="">△ 图片说明</span></p>
</section>
```

---

## 组件 16 三色分隔条

```html
<section style="text-align:center;margin:38px 0;background:#FFF9FD;">
  <span style="display:inline-block;width:36px;height:4px;border-radius:2px;background:#7C5CD6;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  <span style="display:inline-block;width:18px;height:4px;border-radius:2px;background:#EC7FA3;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  <span style="display:inline-block;width:8px;height:4px;border-radius:2px;background:#7CC7EF;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
</section>
```

---

## 组件 17 结尾金句（淡色大引号 + 三色条）

```html
<section style="text-align:center;margin:46px 0 34px;background:#FFF9FD;">
  <span style="font-family:Georgia,'Songti SC',serif;font-style:italic;font-size:56px;line-height:1;color:rgba(124,92,214,0.24);"><span leaf="">“</span></span>
  <p style="margin:8px 0 6px;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:21px;font-weight:900;line-height:1.8;color:#2A1F3D;"><span leaf="">核心金句文字</span></p>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:#847494;"><span leaf="">副句 / 补充</span></p>
  <section style="text-align:center;background:#FFF9FD;">
    <span style="display:inline-block;width:36px;height:4px;border-radius:2px;background:#7C5CD6;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:18px;height:4px;border-radius:2px;background:#EC7FA3;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:8px;height:4px;border-radius:2px;background:#7CC7EF;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
</section>
```

---

## 组件 18 签名档

```html
<section style="text-align:center;padding:24px 0 0;background:#FFF9FD;">
  <span style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:50%;background:#7C5CD6;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#FFFFFF;margin-bottom:10px;"><span leaf="">茉</span></span>
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#2A1F3D;"><span leaf="">{{作者名/品牌名}}</span></p>
  <p style="margin:0;font-size:13px;line-height:1.8;color:#847494;"><span leaf="">{{签名行一}}</span><br><span leaf="">{{签名行二}}</span></p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FFF9FD;padding:44px 26px 40px;...">
  <!-- 1. kicker + 星芒插画 + 大标题 + 三色条（组件 2） -->
  <!-- 2. 居中引言金句（组件 3） -->
  <!-- 3. 引言区块（组件 4，浅粉底） -->
  <!-- 4. 第一章三件套（组件 5：装饰词 Roots / CHAPTER 01 / 衬线标题 / 粉色短条） -->
  <!--    章内：组件 6 正文 + 7 小标题 + 高亮 + 9 提示卡 + 10 清单 + 11 步骤 + 12 蝴蝶引语 + 13 云朵便签 + 14 对比 + 15 图片 -->
  <!-- 5. 三色分隔条（组件 16） -->
  <!-- 6. 第二章…第N章（组件 5，装饰词与序号递增） -->
  <!-- 7. 深色面板（组件 8，全篇 1 处） -->
  <!-- 8. 结尾金句（组件 17） + 签名档（组件 18） -->
</section>
```

**节奏铁律**：开场与结尾的三色条首尾呼应；每章以装饰词开场、粉色短条收束；**连续裸正文不超过两段**；深色面板全篇唯一；每个区块自带 `background`。

---

## 视觉层级（4 层）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **标题层** | 68px 淡色装饰词 + 27px 衬线标题 + 56px 短条 | 章节节奏 | 每章 1 组 |
| **重块层** | 墨绿面板 `#1F1730` | 全文情绪高点 | 1 次 |
| **强调层** | 粉色高亮块 / 玫瑰关键词 | 关键句 | 每段 1~3 处 |
| **底层** | 粉白 + 17px 墨色正文 | 阅读主体 | 连续 ≤2 段 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组件组合 | 点缀组件 |
|---|---|---|
| 生活方式/花园随笔 | 开场 2 + 引言 3 + 章节 5 + 深色面板 8 | 图片 15、分隔条 16 |
| 女性成长/观点长文 | 开场 2 + 引言区块 4 + 章节 5 + 清单 10 | 提示卡 9、结尾金句 17 |
| 读书笔记/书评 | 开场 2 + 引言 3 + 章节 5 + 蝴蝶引语 12 | 图片 15、分隔条 16 |
| 好物清单/测评 | 开场 2 + 章节 5 + 对比 14 + 清单 10 | 图片 15、云朵便签 13 |
| 教程/方法论 | 开场 2 + 章节 5 + 步骤 11 + 提示卡 9 | 清单 10、代码块（通用库 1b） |
| 品牌故事/人物 | 开场 2 + 引言 3 + 章节 5 + 蝴蝶引语 12 | 图片 15、签名 18 |

---

## Markdown → 花园茶会 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 2 开场 | 32px 衬线 + 三色条 |
| 文章开头 `> 引言` | 组件 3 居中金句 / 组件 4 引言区块 | 金句在前，正文区块在后 |
| `## 章节标题` | 组件 5 三件套 | 装饰词 + CHAPTER 编号 + 衬线标题 + 短条 |
| `### 子标题` | 组件 7 紫色短竖条 | 不编号 |
| 普通段落 | 组件 6 正文段落 | 17px / 行高 2 |
| `**加粗文字**` | 粉色贴纸胶囊（nowrap） | 每段 1~3 处、整块不跨行 |
| `==高亮文字==` | 粉色高亮块 | 同 `**` |
| `<u>下划线</u>` | `border-bottom:2px solid #7C5CD6;font-weight:bold` | 主色下划线 |
| `~~删除线~~` | `text-decoration:line-through;color:#847494` | 被淘汰概念 |
| 行内 `` `code` `` | `background:#F3EDFC;color:#5E3FB8;font-family:Consolas,Monaco,monospace;padding:1px 5px;border-radius:4px;font-size:15px` | 浅底胶囊 |
| `> 引用`（金句） | 组件 12 蝴蝶引语卡 | |
| `> 引用`（提示） | 组件 13 云朵便签 / 组件 9 提示卡 | |
| `- 列表项` | 组件 10 叶片清单 | 叶形圆点 |
| `1. 2. 3.` 编号列表 | 组件 11 编号步骤 | 实心主色圆 |
| 对比/前后 | 组件 14 双栏对比卡 | 左黄右玫瑰 |
| `![](图片)` | 组件 15 图片 | 14px 圆角 |
| ` ``` 代码块 ``` ` | 通用库 1b 浅色代码块（左竖条换 `#7C5CD6`） | 每行一个 `<p>` |
| `[text](url)` | 通用库 4a/4b（角标紫色 `#7C5CD6`） | 参考资料放结尾金句之前 |
| `---` | 组件 16 三色分隔条 | 每章之间 |
| 文末 | 组件 17 结尾金句 + 18 签名档 | 各全篇唯一 |

---

## 常见错误（改主题时逐条核对）

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 三色平均使用 | 没有主次 | 60/30/10：紫色主、粉色次、蓝色点睛 |
| 绿色铺满整卡 | 像文档标注 | 绿色只做线描、短条、编号 |
| 装饰词颜色太深/太大 | 压过中文标题 | 68px + 主色 14% 透明度 |
| 每段都荧光笔 | 满屏高亮 | 每段 1~3 处且不跨行 |
| 连续三段裸正文 | 失去节奏 | 每 2~3 段插入浅底块、面板或图片 |
| 深色面板出现两次 | 节奏被稀释 | 全篇唯一 |
| 用渐变做卡片底或高亮 | 客户端渲染不一致、显旧 | 全部改纯色块 |
| 装饰空元素内部留空 | 微信剥掉样式 | 放 `<span leaf=""><br></span>` |
</content>
