# 公众号排版组件库 —— 草莓牛奶 Strawberry Milk

> **使用说明**：本组件库为「草莓牛奶（Strawberry Milk）」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：粉白纸面 + 草莓红 + 薰衣草紫 + 天蓝的糖果配色，杂志编号式布局。主色是明亮的**草莓红 `#E23E6B`**（标题、装饰词、短条、编号），辅色是**薰衣草紫 `#A78BFA`**与**天蓝 `#7CC7EF`**，底色保持干净的**粉白 `#FFF9FB`**——没有任何棕、黄褐或芥末色。标题用衬线、正文用无衬线；每章以一枚 **68px 淡粉斜体英文装饰词**开场，接衬线标题与一根粉色短条；关键句用粉色实色高亮块；全篇用一块深梅色面板与三色装饰条控制节奏。气质是明亮的少女感与编辑感，而不是糖果堆叠。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id/`<div>`、`position:fixed/absolute/sticky`、`float`、`@media`/`@keyframes`、`display:grid`、CSS 变量 `var(--x)`
> - ❌ 不使用渐变；高亮用**纯色块**（微信客户端渲染最稳）
> - **外层底色会被剥离**：每个正文区块（开场、章节、浅底卡、深色面板、签名区）都要各自带 `background`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`border-radius`、静态 SVG
>
> **WeChat 兼容铁律**：
> - 装饰性空元素内部放 `<span leaf=""><br></span>`；SVG 整体包在 `<span leaf="">` 内
> - **不要把 `font-size` / `border` 打在 `<strong>` 上**；高亮样式挂在外层 `<span>`，同一 `<p>` 只用一个字号
> - **高亮 span 必须带 `white-space:nowrap`**：否则行尾的高亮会被浏览器切成两段，视觉上像断掉的胶带
> - 主标题超过一行时用 `<br>` 在语义边界显式断行；英文单词以整词出现，加 `word-break:keep-all`
> - 深色面板上只用 `#FFFFFF` / `#E6CBD8`，浅色底只用墨色 `#2B1B33`
> - 一屏内彩色点缀 ≤4 处；装饰词、高亮、深色面板都是稀缺资源
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
页面底（粉白）：     #FFF9FB
卡片底（纯白）：     #FFFFFF
浅粉底：             #FFE6EF
浅紫底：             #F1EBFF
浅蓝底：             #E9F5FD
浅薄荷底：           #E8FBF5
主色（草莓红）：     #E23E6B（标题 / 装饰词 / 短条 / 编号装饰）
主色深阶（文字用）： #C12455（小标签 / 强调文字 / 链接）
主色浅阶：           #F7A8C4（浅装饰 / 引号）
辅色（薰衣草紫）：   #A78BFA（第二短条 / 步骤 2 / 便签）
辅色深阶：           #6D4AC4（紫底文字）
第三色（天蓝）：     #7CC7EF（第三短条 / 步骤 3）
第三色深阶：         #1E6F9E
点缀（薄荷）：       #6FD9BF（叶芽 / 小装饰）
墨色正文：           #2B1B33
次要文字：           #5C3B48
辅助文字：           #93798A
深色面板：           #221827（深梅，不是棕色）
深色面板次要字：     #E6CBD8
粉色描边：           #F6D2E0
紫色描边：           #E4D8FF
高亮块：             #FFD3E2（纯色，不用渐变）
标题字体：           Georgia,'Songti SC','Noto Serif SC','STSong',serif
正文字体：           -apple-system,'PingFang SC','Helvetica Neue',sans-serif
正文字号：           17px，line-height:2
装饰词：             68px 斜体衬线，草莓红 14% 透明度
最大宽度：           677px
内容区边距：         44px 26px 40px
```

三色比例：**草莓红 55% · 薰衣草紫 30% · 天蓝/薄荷 15%**。不使用任何棕、卡其、黄褐、芥末色。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FFF9FB;padding:44px 26px 40px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#2B1B33;font-size:17px;line-height:2;overflow-x:hidden;box-sizing:border-box;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 开场（kicker + 草莓插画 + 衬线大标题 + 三色条）

```html
<section style="text-align:center;margin-bottom:14px;background:#FFF9FB;">
  <span style="font-size:12px;font-weight:bold;letter-spacing:6px;color:#C12455;"><span leaf="">STRAWBERRY MILK · VOL.01</span></span>
</section>
<section style="text-align:center;margin-bottom:38px;padding:16px 0 20px;background:#FFF9FB;">
  <section style="margin:0 auto 14px;width:68px;max-width:68px;font-size:0;line-height:0;"><span leaf=""><svg width="68" height="68" viewBox="0 0 68 68" fill="none" aria-hidden="true" style="display:block;margin:0 auto;max-width:100%;"><circle cx="34" cy="36" r="25" fill="#FFE6EF"/><path d="M34 18C24 14 14 19 14 30C14 42 22 51 34 58C46 51 54 42 54 30C54 19 44 14 34 18Z" fill="#E23E6B"/><ellipse cx="26" cy="30" rx="1.8" ry="2.4" fill="#FFD1E0"/><ellipse cx="34" cy="26" rx="1.6" ry="2.2" fill="#FFD1E0"/><ellipse cx="42" cy="32" rx="1.6" ry="2.2" fill="#FFD1E0"/><ellipse cx="29" cy="39" rx="1.6" ry="2.2" fill="#FFD1E0"/><ellipse cx="39" cy="44" rx="1.6" ry="2.2" fill="#FFD1E0"/><path d="M34 19L27 10L35 14L38 7L40 15L48 11L41 19Z" fill="#6FD9BF"/><circle cx="27" cy="29" r="1.8" fill="#FFFFFF"/><circle cx="41" cy="29" r="1.8" fill="#FFFFFF"/><path d="M30 35C32 38 36 38 38 35" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/><circle cx="22" cy="34" r="2.4" fill="#F7A8C4"/><circle cx="46" cy="34" r="2.4" fill="#F7A8C4"/></svg></span></section>
  <p style="margin:0 0 12px;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:34px;font-weight:900;line-height:1.55;color:#2B1B33;word-break:normal;overflow-wrap:normal;"><span leaf="">做了些爆款 Skills 以后，</span><br><span leaf="">我对 Skills 的看法</span></p>
  <p style="margin:0 0 24px;font-size:17px;line-height:1.8;color:#4E3A55;"><span leaf="">关于经验、判断与长期积累的一次思考</span></p>
  <section style="text-align:center;background:#FFF9FB;">
    <span style="display:inline-block;width:36px;height:4px;border-radius:2px;background:#E23E6B;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:18px;height:4px;border-radius:2px;background:#A78BFA;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:8px;height:4px;border-radius:2px;background:#7CC7EF;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
</section>
```

---

## 组件 3 标签胶囊行（可选，最多三枚）

```html
<section style="text-align:center;margin-bottom:28px;background:#FFF9FB;">
  <span style="display:inline-block;padding:4px 14px;background:#FFE6EF;border-radius:999px;font-size:12px;font-weight:bold;color:#C12455;"><span leaf="">AI 观察</span></span>
  <span style="display:inline-block;padding:4px 14px;background:#F1EBFF;border-radius:999px;font-size:12px;font-weight:bold;color:#6D4AC4;margin-left:8px;"><span leaf="">方法论</span></span>
  <span style="display:inline-block;padding:4px 14px;background:#E9F5FD;border-radius:999px;font-size:12px;font-weight:bold;color:#1E6F9E;margin-left:8px;"><span leaf="">8 分钟</span></span>
</section>
```

---

## 组件 4 引言金句（居中衬线 + 玫瑰关键词）

```html
<section style="text-align:center;margin-bottom:14px;background:#FFF9FB;">
  <p style="margin:0;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:22px;font-weight:900;line-height:1.9;color:#2B1B33;"><span leaf="">Agent 不是简单抹平能力差距，</span><br><span leaf="">而是</span><span style="color:#C12455;"><span leaf="">在放大能力差距</span></span><span leaf="">。</span></p>
</section>
```

---

## 组件 5 引言区块（浅粉圆角卡）

```html
<section style="margin-bottom:30px;padding:24px 22px;background:#FFE6EF;border-radius:20px;">
  <p style="margin:0 0 10px;font-size:11px;font-weight:bold;letter-spacing:3px;color:#C12455;"><span leaf="">PREFACE</span></p>
  <p style="margin:0 0 12px;font-size:17px;line-height:2;color:#2B1B33;text-align:justify;"><span leaf="">引言正文第一段。把全文最核心的一句判断放这里，两到三行。</span></p>
  <p style="margin:0;font-size:17px;line-height:2;color:#2B1B33;text-align:justify;"><span leaf="">第二段可补一句背景，不要超过三行。</span></p>
</section>
```

---

## 组件 6 章节头三件套（装饰词 + 衬线标题 + 粉色短条）

```html
<section style="margin-bottom:52px;background:#FFF9FB;">
  <section style="margin-bottom:6px;background:#FFF9FB;">
    <span style="display:inline-block;font-family:Georgia,'Songti SC',serif;font-style:italic;font-size:68px;font-weight:bold;line-height:1;color:rgba(226,62,107,0.20);white-space:nowrap;word-break:keep-all;overflow-wrap:normal;"><span leaf="">Craft</span></span>
  </section>
  <section style="margin-bottom:4px;background:#FFF9FB;">
    <span style="font-size:12px;font-weight:bold;letter-spacing:4px;color:#C12455;"><span leaf="">CHAPTER 01</span></span>
  </section>
  <section style="margin-bottom:10px;background:#FFF9FB;">
    <span style="font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:30px;font-weight:900;line-height:1.55;color:#2B1B33;"><span leaf="">Skill 是能力商品</span></span>
  </section>
  <section style="margin-bottom:22px;background:#FFF9FB;">
    <span style="display:inline-block;width:56px;height:6px;border-radius:3px;background:#E23E6B;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
</section>
```

短条三色轮换：草莓红 `#E23E6B` → 薰衣草 `#A78BFA` → 天蓝 `#7CC7EF`。装饰词取与章节相关的英文单词（Craft / People / System / Bloom / Flywheel），整词出现不拆行。

---

## 组件 7 正文段落 + 粉色高亮块

```html
<section style="margin-bottom:18px;background:#FFF9FB;">
  <p style="margin:0;font-size:17px;line-height:2;color:#2B1B33;text-align:justify;"><span leaf="">正文段落。每段三到四行，关键词用粉色高亮块标记，每段 1~3 处。</span></p>
</section>
```

```html
<span style="background:#FFD3E2;color:#8F1A3C;font-weight:bold;padding:1px 4px;border-radius:4px;"><span leaf="">高亮文字</span></span>
```

紫色高亮变体（每篇 ≤2 处）：`background:#E4D8FF;color:#4B2E9E;box-shadow:inset 0 -2px 0 #A78BFA;white-space:nowrap;`

---

## 组件 8 小标题（`###`，草莓红短竖条）

```html
<section style="margin:26px 0 14px;background:#FFF9FB;">
  <section style="display:flex;align-items:center;background:#FFF9FB;">
    <section style="width:3px;height:16px;background:#E23E6B;margin-right:10px;font-size:0;line-height:0;"><span leaf=""><br></span></section>
    <span style="font-size:18px;font-weight:bold;line-height:1.6;color:#2B1B33;"><span leaf="">小节标题</span></span>
  </section>
</section>
```

---

## 组件 9 深色面板（深梅，全篇 1 处）

```html
<section style="margin:34px 0;padding:28px 24px;background:#221827;border-radius:22px;">
  <p style="margin:0 0 12px;font-size:11px;font-weight:bold;letter-spacing:3px;color:#F7A8C4;"><span leaf="">ONE THING</span></p>
  <p style="margin:0;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:20px;font-weight:bold;line-height:1.9;color:#FFFFFF;"><span leaf="">把复杂内容一次性塞给模型，</span><br><span leaf="">是复杂 Skill 最常犯的错。</span></p>
  <p style="margin:12px 0 0;font-size:13px;line-height:1.8;color:#E6CBD8;"><span leaf="">—— 一条可以贴在显示器上的原则</span></p>
</section>
```

深梅面板是深莓紫色，不是棕色；全篇只出现一次。

---

## 组件 10 提示卡（浅紫左竖条）

```html
<section style="margin:26px 0;padding:20px 22px;background:#F1EBFF;border-left:3px solid #A78BFA;border-radius:0 14px 14px 0;">
  <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:2px;color:#6D4AC4;"><span leaf="">NOTE · 一点提醒</span></p>
  <p style="margin:0;font-size:16px;line-height:1.95;color:#2B1B33;text-align:justify;"><span leaf="">提示正文。放避坑建议、适用边界或需要提前知道的前提。</span></p>
</section>
```

---

## 组件 11 清单（草莓圆点）

```html
<section style="margin-bottom:10px;background:#FFF9FB;">
  <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#E23E6B;margin-right:12px;vertical-align:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  <span style="font-size:17px;line-height:2;color:#2B1B33;"><span leaf="">清单项内容，一行说完。</span></span>
</section>
```

---

## 组件 12 编号步骤（三色实心圆）

```html
<section style="margin-bottom:14px;display:flex;align-items:flex-start;background:#FFF9FB;">
  <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:#E23E6B;font-size:13px;font-weight:bold;color:#FFFFFF;flex-shrink:0;margin-right:14px;"><span leaf="">1</span></span>
  <span style="flex:1;font-size:17px;line-height:1.9;color:#2B1B33;"><span leaf="">步骤说明。一步一句，动作放在最前面。</span></span>
</section>
```

第 2 步换 `#A78BFA`，第 3 步换 `#7CC7EF`（数字用白色）。

---

## 组件 13 引语卡（白卡 + 大引号）

```html
<section style="margin:28px 0;padding:24px 24px 22px;background:#FFFFFF;border:1.5px solid #F6D2E0;border-radius:22px;text-align:center;">
  <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:44px;line-height:1;color:#F7A8C4;"><span leaf="">“</span></p>
  <p style="margin:0 0 10px;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:19px;font-weight:900;line-height:1.9;color:#C12455;"><span leaf="">引语第一行</span><br><span leaf="">引语第二行</span></p>
  <p style="margin:0;font-size:12px;line-height:1.8;color:#93798A;"><span leaf="">—— 出处或小注</span></p>
</section>
```

---

## 组件 14 双栏对比卡（浅粉 / 浅紫）

```html
<section style="margin:24px 0;background:#FFF9FB;">
  <section style="display:flex;gap:12px;">
    <section style="flex:1;padding:18px 16px;background:#FFE6EF;border-radius:16px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:bold;letter-spacing:1px;color:#C12455;"><span leaf="">BEFORE</span></p>
      <p style="margin:0;font-size:15px;line-height:1.9;color:#2B1B33;"><span leaf="">两行以内的短内容。</span></p>
    </section>
    <section style="flex:1;padding:18px 16px;background:#F1EBFF;border-radius:16px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:bold;letter-spacing:1px;color:#6D4AC4;"><span leaf="">AFTER</span></p>
      <p style="margin:0;font-size:15px;line-height:1.9;color:#2B1B33;"><span leaf="">两行以内的短内容。</span></p>
    </section>
  </section>
</section>
```

---

## 组件 15 图片

```html
<section style="margin:24px 0;background:#FFF9FB;">
  <span leaf=""><img src="{{图片URL}}" style="width:100%;display:block;border-radius:16px;"></span>
  <p style="margin:10px 0 0;text-align:center;font-size:12px;line-height:1.8;color:#93798A;"><span leaf="">△ 图片说明</span></p>
</section>
```

---

## 组件 16 三色分隔条

```html
<section style="text-align:center;margin:38px 0;background:#FFF9FB;">
  <span style="display:inline-block;width:36px;height:4px;border-radius:2px;background:#E23E6B;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  <span style="display:inline-block;width:18px;height:4px;border-radius:2px;background:#A78BFA;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  <span style="display:inline-block;width:8px;height:4px;border-radius:2px;background:#7CC7EF;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
</section>
```

---

## 组件 17 结尾金句（淡粉大引号 + 衬线金句 + 三色条）

```html
<section style="text-align:center;margin:46px 0 34px;background:#FFF9FB;">
  <span style="font-family:Georgia,'Songti SC',serif;font-style:italic;font-size:56px;line-height:1;color:#F7A8C4;"><span leaf="">“</span></span>
  <p style="margin:8px 0 6px;font-family:Georgia,'Songti SC','Noto Serif SC','STSong',serif;font-size:21px;font-weight:900;line-height:1.8;color:#2B1B33;"><span leaf="">核心金句文字</span></p>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:#93798A;"><span leaf="">副句 / 补充</span></p>
  <section style="text-align:center;background:#FFF9FB;">
    <span style="display:inline-block;width:36px;height:4px;border-radius:2px;background:#E23E6B;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:18px;height:4px;border-radius:2px;background:#A78BFA;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:8px;height:4px;border-radius:2px;background:#7CC7EF;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
</section>
```

---

## 组件 18 签名档

```html
<section style="text-align:center;padding:24px 0 0;background:#FFF9FB;">
  <span style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:50%;background:#E23E6B;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#FFFFFF;margin-bottom:10px;"><span leaf="">茉</span></span>
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#2B1B33;"><span leaf="">{{作者名/品牌名}}</span></p>
  <p style="margin:0;font-size:13px;line-height:1.8;color:#93798A;"><span leaf="">{{签名行一}}</span><br><span leaf="">{{签名行二}}</span></p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FFF9FB;padding:44px 26px 40px;...">
  <!-- 1. kicker + 草莓插画 + 大标题 + 三色条（组件 2） -->
  <!-- 2. 标签胶囊行（组件 3，可选） -->
  <!-- 3. 居中引言金句（组件 4） -->
  <!-- 4. 引言区块（组件 5，浅粉圆角卡） -->
  <!-- 5. 第一章三件套（组件 6：装饰词 Craft / CHAPTER 01 / 衬线标题 / 粉色短条） -->
  <!--    章内：组件 7 正文 + 8 小标题 + 高亮 + 10 提示卡 + 11 清单 + 12 步骤 + 13 引语卡 + 14 对比 + 15 图片 -->
  <!-- 6. 三色分隔条（组件 16） -->
  <!-- 7. 第二章…第N章（组件 6，装饰词与序号递增） -->
  <!-- 8. 深色面板（组件 9，全篇 1 处） -->
  <!-- 9. 结尾金句（组件 17） + 签名档（组件 18） -->
</section>
```

**节奏铁律**：开场与结尾三色条首尾呼应；每章以装饰词开场、短条收束；**连续裸正文不超过两段**；深色面板全篇唯一；每个区块自带 `background`。

---

## 视觉层级（4 层）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **标题层** | 68px 淡粉装饰词 + 27px 衬线标题 + 56px 短条 | 章节节奏 | 每章 1 组 |
| **重块层** | 深梅面板 `#221827` | 全文情绪高点 | 1 次 |
| **强调层** | 粉色高亮块 / 玫瑰关键词 | 关键句 | 每段 1~3 处 |
| **底层** | 粉白底 + 17px 墨色正文 | 阅读主体 | 连续 ≤2 段 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组件组合 | 点缀组件 |
|---|---|---|
| 生活方式/随笔 | 开场 2 + 引言 5 + 章节 6 + 深色面板 9 | 图片 15、分隔条 16 |
| 女性成长/观点长文 | 开场 2 + 引言 5 + 章节 6 + 清单 11 | 提示卡 10、结尾金句 17 |
| 读书笔记/书评 | 开场 2 + 引语卡 13 + 章节 6 + 提示卡 10 | 图片 15、分隔条 16 |
| 好物清单/测评 | 开场 2 + 章节 6 + 对比 14 + 清单 11 | 图片 15、提示卡 10 |
| 教程/方法论 | 开场 2 + 章节 6 + 步骤 12 + 提示卡 10 | 清单 11、代码块（通用库 1b） |
| 品牌故事/人物 | 开场 2 + 引语卡 13 + 章节 6 + 深色面板 9 | 图片 15、签名 18 |

---

## Markdown → 草莓牛奶 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 2 开场 | 32px 衬线 + 三色条 |
| 文章开头 `> 引言` | 组件 4 居中金句 / 组件 5 引言区块 | 金句在前，正文区块在后 |
| `## 章节标题` | 组件 6 三件套 | 装饰词 + CHAPTER 编号 + 衬线标题 + 短条 |
| `### 子标题` | 组件 8 草莓红短竖条 | 不编号 |
| 普通段落 | 组件 7 正文段落 | 17px / 行高 2 |
| `**加粗文字**` | 粉色贴纸胶囊（nowrap） | 每段 1~3 处、整块不跨行 |
| `==高亮文字==` | 粉色高亮块（或紫色变体） | 紫变体每篇 ≤2 处 |
| `<u>下划线</u>` | `border-bottom:2px solid #E23E6B;font-weight:bold` | 主色下划线 |
| `~~删除线~~` | `text-decoration:line-through;color:#93798A` | 被淘汰概念 |
| 行内 `` `code` `` | `background:#FFE6EF;color:#C12455;font-family:Consolas,Monaco,monospace;padding:1px 5px;border-radius:4px;font-size:15px` | 浅粉胶囊 |
| `> 引用`（金句） | 组件 13 引语卡 / 组件 4 居中金句 | |
| `> 引用`（提示） | 组件 10 提示卡 | |
| `- 列表项` | 组件 11 清单 | 草莓圆点 |
| `1. 2. 3.` 编号列表 | 组件 12 编号步骤 | 三色实心圆 |
| 对比/前后 | 组件 14 双栏对比卡 | 左粉右紫 |
| `![](图片)` | 组件 15 图片 | 16px 圆角 |
| ` ``` 代码块 ``` ` | 通用库 1b 浅色代码块（左竖条换 `#E23E6B`） | 每行一个 `<p>` |
| `[text](url)` | 通用库 4a/4b（角标草莓红 `#C12455`） | 参考资料放结尾金句之前 |
| `---` | 组件 16 三色分隔条 | 每章之间 |
| 文末 | 组件 17 结尾金句 + 18 签名档 | 各全篇唯一 |

---

## 常见错误（改主题时逐条核对）

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 使用棕 / 卡其 / 黄褐 / 芥末色 | 显脏、显旧，与女性化气质冲突 | 只用草莓红、薰衣草紫、天蓝、薄荷、粉白 |
| 粉紫蓝平均使用 | 没有主次 | 草莓红 55% / 紫 30% / 蓝绿 15% |
| 高亮用黄色 | 脸黄、显旧 | 高亮用粉色 `#FFD3E2` 或紫色 `#E4D8FF` |
| 装饰词太大且颜色太深 | 压过中文标题 | 68px + 草莓红 14% 透明度 |
| 每段都高亮 | 满屏色块 | 每段 1~3 处 |
| 高亮没有 `white-space:nowrap` | 行尾被切成两段，很难看 | 高亮 span 必须加 nowrap，整块换行 |
| 连续三段裸正文 | 失去节奏 | 每 2~3 段插入浅底卡、面板或图片 |
| 深色面板用棕黑 | 失去少女感 | 用深梅紫 `#221827` |
| 装饰空元素内部留空 | 微信剥掉样式 | 放 `<span leaf=""><br></span>` |
</content>
