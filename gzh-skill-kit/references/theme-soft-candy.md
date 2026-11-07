# 公众号排版组件库 —— 软糖 Soft Candy

> **使用说明**：本组件库为「软糖」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：白纸底 + 彩色贴纸。所有色块都遵循同一条规则——**粉彩填充 + 同色系深一档的 3–4px 描边 + 柔和落影**，看起来像贴在纸上的贴纸，而不是铺在页面里的色块。五色轮转：粉 `#FFD3E2`／紫 `#E0D5FA`／蓝 `#CDEAFB`／薄荷 `#C8F0E2`／奶黄 `#FFE6AE`，配少量 emoji 点缀（每屏不超过 2 个）。适合教程、清单、测评、日常分享、轻松向长文。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position`、`float`、`@media`、`display:grid`
> - **外层底色会被剥离**：页面底色不要只放最外层容器，每个正文区块都要自带 `background`
> - ✅ 支持内联 `style`、`display:flex`、`border-radius`、`box-shadow`、`linear-gradient`（文字背景需按必要性评估）
>
> **WeChat 兼容铁律**：
> - 装饰性空元素（彩条、圆点）内部放 `<span leaf=""><br></span>`
> - **短语强调用玫粉毛边笔刷，长句保留玫瑰色加粗**：笔刷限不超过 12 字且能在手机端容纳于一行的短语；长句不加笔刷、padding 或 `nowrap`，允许自然换行
> - 贴纸描边必须用**彩色**（白边在公众号里会显得像没设计过的方块）
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
纸面白：        #FFFFFF
正文墨：        #3A3236
次要文字：      #4A4145
辅助文字：      #7A6A70
玫瑰主色：      #B8325C（强调/文案）/ 描边 #F29BB9
短语笔刷：      封面柔粉 #F3A7C2 + 底部玫粉 #F277A6（.35）+ 浅色刷纹 #FFDDE9；正文浅粉 #FFDDE9 + 玫粉笔触 #F277A6（完整样式见组件 3 / 5）
粉彩填充：      粉 #FFD3E2 / 紫 #E0D5FA / 蓝 #CDEAFB / 薄荷 #C8F0E2 / 奶黄 #FFE6AE
粉彩描边：      粉 #F29BB9 / 紫 #B99BEA（浅 #C9B4F2）/ 蓝 #7EC4EC / 薄荷 #6FD2B0 / 奶黄 #EFC15C
深色文字（配彩底）：玫瑰 #A82A52 / 紫 #5B3E9C / 蓝 #18648F / 薄荷 #186B52 / 奶黄 #8A5A12
卡片描边：      3px（小卡）/ 4px（封面与结尾）
卡片圆角：      24px（小卡）/ 30px（封面与结尾）/ 16px（章节招牌）
正文字号：      17px，line-height:1.95
章节标题：      21px / 900
封面标题：      24px / 900
```

**用色比例**：白底 70%、粉彩卡片 25%、玫瑰文字与描边 5%。**同一篇文章只从五色里取 3 种为主**，不要五色全上。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FFFFFF;padding:20px 20px 34px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#3A3236;font-size:17px;line-height:1.95;overflow-x:hidden;text-align:left;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 顶部期号贴纸

```html
<section style="text-align:center;margin-bottom:14px;background-color:#FFFFFF;">
  <span style="display:inline-block;background:#FFE3EC;color:#B8325C;font-size:12px;font-weight:bold;letter-spacing:1px;padding:7px 18px;border-radius:999px;border:2px solid #F29BB9;box-shadow:0 6px 14px -10px rgba(230,110,150,0.9);"><span leaf="">🏷️ 软糖日报 · 第 016 期</span></span>
</section>
```

---

## 组件 3 封面贴纸卡（标题 + 副标题）

> 标题超过一行用 `<br>` 在语义边界断句；**移动端 375px 下标题最多 24px**，再大就会折成三行。

```html
<section style="background:#FFDDE9;border:4px solid #F29BB9;border-radius:30px;padding:26px 14px 24px;text-align:center;box-shadow:0 16px 30px -18px rgba(233,99,140,0.45);margin-bottom:18px;">
  <p style="margin:0 0 14px;font-size:18px;letter-spacing:5px;"><span leaf="">🌸 ✨ 🍓</span></p>
  <p style="margin:0 0 16px;font-size:24px;font-weight:900;line-height:1.6;color:#3A3236;letter-spacing:0;">
    <span leaf="">标题第一行，</span><br>
    <span leaf="">标题第二行的</span><span style="background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%2040%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23F3A7C2%22%20d%3D%22M8%208C25%205%2042%207%2061%205L105%205L111%208L107%2010L117%2011L111%2014L118%2016L113%2019L117%2022L110%2024L114%2027L104%2030C77%2031%2050%2030%2029%2033L7%2031L12%2028L3%2027L8%2024L2%2021L7%2018L3%2015L10%2012L5%2011Z%22%2F%3E%3Cpath%20fill%3D%22%23F277A6%22%20opacity%3D%22.35%22%20d%3D%22M2%2021L29%2021L60%2019L85%2020L113%2019L117%2022L110%2024L114%2027L104%2030C77%2031%2050%2030%2029%2033L7%2031L12%2028L3%2027L8%2024Z%22%2F%3E%3Cpath%20d%3D%22M8%2012l15-2m-18%2011%2013-2m-8%209%2019%201m66-20%2013%201m-2%209%209%201m-16%208%2012-2%22%20fill%3D%22none%22%20stroke%3D%22%23FFDDE9%22%20stroke-width%3D%221.6%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E');background-size:100% 100%;background-repeat:no-repeat;padding:2px 7px;white-space:nowrap;"><span leaf="">关键词</span></span>
  </p>
  <span style="display:inline-block;background:#FFFFFF;color:#B8325C;font-size:12px;letter-spacing:1px;padding:6px 16px;border-radius:999px;border:2px solid #F7B8CE;"><span leaf="">副标题一句话</span></span>
</section>
```

**笔刷强调**（组件 3 里的 `关键词`）：标题使用柔粉色 `#F3A7C2` 的毛边笔刷，保留墨色标题、原有字号与字重。短词专用的笔触保留平缓的上下轮廓、两端毛边和浅色刷纹，用 `padding:2px 7px` 露出纹理；参照正文高亮，在笔刷下半部叠加玫粉色 `#F277A6`（透明度 `.35`）的笔触，加深区域约占笔刷着色高度的一半，形成类似较粗下划线的层次，上半部保留原色。笔刷只用于短关键词，封面与结尾卡继续保留柔和贴纸感。

封面笔触源文件为 [`assets/soft-candy-title-brush.svg`](../assets/soft-candy-title-brush.svg)，正文毛边笔刷源文件为 [`assets/soft-candy-brush.svg`](../assets/soft-candy-brush.svg)。组件将其编码为内联 `background-image` 的 data URL，不需要外部图片、定位或渐变。正文继续使用浅粉主色 `#FFDDE9`、玫粉笔触 `#F277A6`（透明度 `.55`），保留玫瑰色文字。文字仍用 `<span leaf="">`，与装饰背景分开；若编辑器过滤背景图，文字仍可阅读，正文仍保留玫瑰色加粗。背景图在微信 iOS / Android 及深色模式下的显示尚待真机验证，浏览器预览不能替代这一步。

---

## 组件 4 引言贴纸卡

```html
<section style="background:#FFFFFF;border:3px solid #F7B8CE;border-radius:24px;padding:20px 20px 18px;box-shadow:0 12px 24px -18px rgba(233,140,170,0.8);margin-bottom:24px;">
  <section style="margin:0 0 10px;background-color:#FFFFFF;"><span style="display:inline-block;background:#FFE3EC;color:#B8325C;font-size:11px;font-weight:bold;letter-spacing:1px;padding:4px 12px;border-radius:999px;"><span leaf="">🍬 写在前面</span></span></section>
  <p style="margin:0 0 12px;font-size:16px;line-height:1.9;color:#4A4145;text-align:justify;"><span leaf="">引言正文，两三句即可。强调用</span><span style="color:#B8325C;font-weight:bold;background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%204%20240%2036%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23FFDDE9%22%20d%3D%22M9%2015%2022%2011%2017%209%2062%208%20101%207%20151%208%20198%206%20224%209%20219%2012%20233%2012%20227%2017%20238%2019%20229%2023%20235%2026%20222%2030%20225%2034%20188%2035%20140%2037%2095%2036%2051%2038%2013%2035%2019%2032%204%2031%2010%2027%202%2024%2011%2020%205%2018Z%22%2F%3E%3Cpath%20fill%3D%22%23F277A6%22%20opacity%3D%22.55%22%20d%3D%22m8%2027%2041%202%2054-1%2043%201%2044-3%2041%201-9%204%203%203-37%201-48%202-45-1-44%202-38-3%206-3-15-1Z%22%2F%3E%3Cpath%20d%3D%22m13%2016%2028-3m-29%209%2019-2m-13%2011%2026%201m158-22%2019%201m-12%206%2020-1m-23%2016%2015-2%22%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%221.4%22%20stroke-linecap%3D%22round%22%20opacity%3D%22.7%22%2F%3E%3C%2Fsvg%3E');background-size:100% 100%;background-repeat:no-repeat;padding:3px 6px;white-space:nowrap;"><span leaf="">彩色加粗</span></span><span leaf="">。</span></p>
  <p style="margin:0;font-size:12px;color:#7A6A70;text-align:right;"><span leaf="">—— {{作者名}}</span></p>
</section>
```

---

## 组件 5 正文段落（短语笔刷 + 彩色加粗）

每段选 1 处短语，用浅粉底、玫粉毛边笔刷衬托玫瑰色加粗文字。`padding:3px 6px` 让笔触露出文字边缘，正文沿用本组件的完整毛边笔刷。不超过 12 字且能在手机端容纳于一行时，使用下方完整样式；更长的强调只用 `color:#B8325C;font-weight:bold;`，允许换行。不要给整句添加 `white-space:nowrap`。

```html
<p style="margin:0 0 20px;background-color:#FFFFFF;font-size:17px;line-height:2;color:#3A3236;text-align:justify;">
  <span leaf="">正文段落。每段挑 1 处最重要的短语，用</span><span style="color:#B8325C;font-weight:bold;background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%204%20240%2036%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23FFDDE9%22%20d%3D%22M9%2015%2022%2011%2017%209%2062%208%20101%207%20151%208%20198%206%20224%209%20219%2012%20233%2012%20227%2017%20238%2019%20229%2023%20235%2026%20222%2030%20225%2034%20188%2035%20140%2037%2095%2036%2051%2038%2013%2035%2019%2032%204%2031%2010%2027%202%2024%2011%2020%205%2018Z%22%2F%3E%3Cpath%20fill%3D%22%23F277A6%22%20opacity%3D%22.55%22%20d%3D%22m8%2027%2041%202%2054-1%2043%201%2044-3%2041%201-9%204%203%203-37%201-48%202-45-1-44%202-38-3%206-3-15-1Z%22%2F%3E%3Cpath%20d%3D%22m13%2016%2028-3m-29%209%2019-2m-13%2011%2026%201m158-22%2019%201m-12%206%2020-1m-23%2016%2015-2%22%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%221.4%22%20stroke-linecap%3D%22round%22%20opacity%3D%22.7%22%2F%3E%3C%2Fsvg%3E');background-size:100% 100%;background-repeat:no-repeat;padding:3px 6px;white-space:nowrap;"><span leaf="">玫瑰色加粗</span></span><span leaf="">带过，不要整段上色。</span>
</p>
```

术语标注（紫 / 蓝 / 薄荷），首次出现时用一次：

```html
<span style="color:#5B3E9C;font-weight:bold;"><span leaf="">术语</span></span>
```

---

## 组件 6 目录贴纸卡

```html
<section style="background:#FFFFFF;border:3px solid #C9B4F2;border-radius:24px;padding:18px 20px 10px;box-shadow:0 12px 24px -18px rgba(160,140,210,0.7);margin-bottom:32px;">
  <section style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
    <span style="display:inline-block;background:#F1EAFF;color:#5B3E9C;font-size:11px;font-weight:bold;letter-spacing:1px;padding:4px 12px;border-radius:999px;border:1px solid #D9C9F7;"><span leaf="">本期看点</span></span>
    <span style="font-size:11px;letter-spacing:1px;color:#7E6F91;"><span leaf="">05 CHAPTERS</span></span>
  </section>
  <section style="display:flex;align-items:center;padding:9px 0;border-bottom:1px solid #F2EEFA;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#FFD3E2;color:#A82A52;font-size:11px;font-weight:bold;text-align:center;line-height:1;margin-right:10px;flex-shrink:0;"><span leaf="" style="line-height:1;">1</span></span>
    <span style="font-size:15px;color:#3A3236;"><span leaf="">第一章标题</span></span>
  </section>
  <section style="display:flex;align-items:center;padding:9px 0;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#E0D5FA;color:#5B3E9C;font-size:11px;font-weight:bold;text-align:center;line-height:1;margin-right:10px;flex-shrink:0;"><span leaf="" style="line-height:1;">2</span></span>
    <span style="font-size:15px;color:#3A3236;"><span leaf="">第二章标题</span></span>
  </section>
</section>
```

序号圈的底色按粉 → 紫 → 蓝 → 薄荷 → 奶黄轮转，与后文章节招牌同色。

---

## 组件 7 章节招牌（糖果编号 + 标题 + 彩条）

编号用 `display:inline-flex;align-items:center;justify-content:center;` 居中，编号及内部文字均设 `line-height:1`。目录、章节、清单沿用各自尺寸和描边，不共用固定像素行高，避免数字在不同大小的徽章内偏移。

> 编号底色的深色字：粉 `#A82A52`／紫 `#6B4B9E`／蓝 `#18648F`／薄荷 `#186B52`／奶黄 `#8A5A12`。彩条宽 30px、高 4px，与编号同色，`margin-left:52px` 对齐标题左边缘。

```html
<section style="background-color:#FFFFFF;margin:30px 0 22px;">
  <section style="display:flex;align-items:center;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:17px;background:#FFD3E2;border:3px solid #F29BB9;color:#A82A52;font-size:15px;font-weight:900;text-align:center;line-height:1;box-shadow:0 6px 12px -8px rgba(233,99,140,0.9);flex-shrink:0;"><span leaf="" style="line-height:1;">01</span></span>
    <span style="margin-left:13px;font-size:22px;font-weight:900;color:#3A3236;line-height:1.35;"><span leaf="">章节标题</span></span>
  </section>
  <section style="margin:12px 0 0 57px;background-color:#FFFFFF;font-size:0;line-height:0;"><span style="display:inline-block;width:36px;height:4px;border-radius:2px;background:#F29BB9;"><span leaf=""><br></span></span></section>
</section>
```

---

## 组件 8 引文贴纸卡（气泡尾巴）

```html
<section style="background:#D9F5EA;border:3px solid #6FD2B0;border-radius:24px 24px 24px 8px;padding:18px 20px;box-shadow:0 12px 22px -16px rgba(90,190,150,0.8);margin-bottom:28px;">
  <p style="margin:0 0 8px;font-size:12px;font-weight:bold;color:#186B52;"><span leaf="">💬 一句话</span></p>
  <p style="margin:0;font-size:16px;line-height:1.9;color:#245B48;text-align:justify;"><span leaf="">引用或金句正文。</span></p>
</section>
```

---

## 组件 9 糖果清单行

```html
<section style="display:flex;align-items:flex-start;background:#FFF7FA;border-radius:16px;padding:12px 14px;margin-bottom:8px;">
  <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#FFD3E2;color:#B8325C;font-size:11px;font-weight:bold;text-align:center;line-height:1;margin:3px 10px 0 0;flex-shrink:0;"><span leaf="" style="line-height:1;">1</span></span>
  <span style="font-size:16px;line-height:1.8;color:#4A4145;"><span style="color:#3A3236;font-weight:bold;"><span leaf="">小标题</span></span><span leaf="">：说明文字</span></span>
</section>
```

行底色用 `#FFF7FA`／`#F8F5FF`／`#F3FAFE`／`#F4FBF7`／`#FFFBEF` 轮转，与序号圈同色系。

---

## 组件 10 小标题胶囊

```html
<section style="margin:0 0 14px;background-color:#FFFFFF;">
  <span style="display:inline-block;background:#E8F5FE;color:#18648F;font-size:13px;font-weight:bold;padding:5px 14px;border-radius:999px;border:2px solid #7EC4EC;"><span leaf="">🧩 小标题</span></span>
</section>
```

---

## 组件 11 奶油要点卡

```html
<section style="background:#FFF0C9;border:3px solid #EFC15C;border-radius:24px;padding:18px 18px 16px;box-shadow:0 12px 22px -16px rgba(220,170,70,0.8);margin-bottom:22px;">
  <p style="margin:0 0 8px;font-size:12px;font-weight:bold;color:#8A5A12;"><span leaf="">✨ KEY POINT</span></p>
  <p style="margin:0;font-size:16px;line-height:1.9;color:#5A4A28;text-align:justify;"><span leaf="">一句话结论。</span></p>
</section>
```

---

## 组件 12 步骤清单（薄荷圆点）

```html
<section style="margin:0 0 20px;background-color:#FFFFFF;">
  <section style="display:flex;align-items:flex-start;padding:8px 0;">
    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#7EE0C0;margin:10px 12px 0 0;flex-shrink:0;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="font-size:16px;line-height:1.85;color:#4A4145;"><span leaf="">步骤文字</span></span>
  </section>
</section>
```

---

## 组件 13 结尾贴纸卡

```html
<section style="background:#F3E1F5;border:4px solid #C3A6EC;border-radius:30px;padding:26px 22px 24px;text-align:center;box-shadow:0 16px 30px -18px rgba(190,150,190,0.5);">
  <p style="margin:0 0 12px;font-size:18px;letter-spacing:3px;"><span leaf="">🎀 🌟 🎀</span></p>
  <p style="margin:0 0 16px;font-size:19px;font-weight:900;line-height:1.85;color:#3A3236;">
    <span leaf="">金句第一行，</span><br>
    <span leaf="">金句第二行</span><br>
    <span style="color:#B8325C;"><span leaf="">关键词</span></span><span leaf="">。</span>
  </p>
  <span style="display:inline-block;background:#FFFFFF;color:#B8325C;font-size:12px;padding:7px 20px;border-radius:999px;border:2px solid #E6A9D6;box-shadow:0 6px 14px -10px rgba(190,120,150,0.9);"><span leaf="">觉得有收获，欢迎点赞、转发、推荐 ✿</span></span>
  <p style="margin:14px 0 0;font-size:13px;font-weight:bold;color:#3A3236;letter-spacing:1px;"><span leaf="">{{作者名}}</span></p>
  <p style="margin:4px 0 0;font-size:12px;color:#6A5A60;"><span leaf="">{{一句话简介}}</span></p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="text-align:left;max-width:677px;...">
  <!-- 1. 顶部期号贴纸（组件 2） -->
  <!-- 2. 封面卡（组件 3） -->
  <!-- 3. 引言贴纸卡（组件 4） -->
  <!-- 4. 正文（组件 5） -->
  <!-- 5. 目录卡（组件 6，可选） -->
  <!-- 6. 章节招牌（组件 7）+ 正文 + 引文卡（组件 8）/ 清单（组件 9） -->
  <!-- 7. 小标题胶囊（组件 10）/ 要点卡（组件 11）/ 步骤（组件 12）按需穿插 -->
  <!-- 8. 结尾贴纸卡（组件 13） -->
</section>
```

**节奏铁律**：封面卡全篇一次；目录卡一次；每个章节招牌颜色不重复，按粉→紫→蓝→薄荷→奶黄顺序轮转；要点卡与引文卡全篇各不超过 2 张；emoji 每屏不超过 2 个。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **锚点层** | 封面卡 / 章节招牌 / 结尾卡 | 结构锚点 | 每篇 1 + 每章 1 |
| **标记层** | 玫粉短语笔刷 + 玫瑰色加粗 / 紫色术语 | 关键短语、术语；长句仅加粗 | 每段 1 处 |
| **容器层** | 引文卡 / 要点卡 / 清单行 | 收束与并列 | 每 2–3 屏 1 个 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组合 | 点缀 |
|---|---|---|
| 教程 / 操作指南 | 封面 3 + 章节招牌 7 + 步骤 12 | 要点卡 11、小标题 10 |
| 清单 / 测评 | 封面 3 + 目录 6 + 糖果清单 9 | 引文卡 8 |
| 观点 / 随笔 | 封面 3 + 引言卡 4 + 正文 5 | 引文卡 8、结尾 13 |
| 案例复盘 | 封面 3 + 章节招牌 7 + 要点卡 11 | 清单 9、结尾 13 |

---

## Markdown → 软糖 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 3 封面卡 | 24px，短关键词用柔粉毛边笔刷，保留墨色字 |
| 开头 `> 引言` | 组件 4 引言贴纸卡 | 🍬 标签 |
| `## 章节` | 组件 7 章节招牌 | 编号按五色轮转 |
| `### 小标题` | 组件 10 小标题胶囊 | 蓝色胶囊 |
| 普通段落 | 组件 5 正文段 | 17px / 1.95 |
| `**加粗**` / `==高亮==` | 组件 5 短语笔刷 | 每段 1 处；长句仅玫瑰色加粗 |
| `<u>文字</u>` / `++文字++` / `~~文字~~` | 组件 5 短语笔刷 | 不超过 12 字且能在手机端容纳于一行；否则仅玫瑰色加粗 |
| `> 引用` | 组件 8 引文卡 | 薄荷气泡 |
| `- 列表` | 组件 9 糖果清单 | 圆序号 + 浅底行 |
| `1. 步骤` | 组件 12 步骤清单 | 薄荷圆点 |
| `![](图片)` | 通用库 2a | 图片卡描边用主色 |
| 行内 `` `code` `` | 通用库 1c | 蓝底胶囊 |
| ` ``` 代码块 ``` ` | 通用库 1b | 浅色版 |
| `[text](url)` | 通用库 4a/4b | 角标玫瑰色 |
| 文末 | 组件 13 结尾贴纸卡 | 🎀 + 点赞转发推荐 |
