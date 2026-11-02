# 公众号排版组件库 —— 奶油泡芙 Cream Puff

> **使用说明**：本组件库为「奶油泡芙」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：奶油纸 + 软卡片。页面底色是奶白 `#FFF8F4` 叠一层极淡点阵（`radial-gradient` 画点，像信纸纹理），主体是浅粉渐变封面卡 + 白底彩边卡片 + 五色章节编号。标题用衬线（Noto Serif / Songti），正文用系统黑体，整体是“温柔手账”而非“贴纸海报”。适合随笔、方法论、年度总结、读书笔记、温柔向长文。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position`、`float`、`@media`、`display:grid`
> - **外层底色会被剥离**：点阵底放在最外层容器上没问题，但每个正文区块仍要自带 `background`，否则外层被剥后会出现裸文字
> - ✅ 支持内联 `style`、`display:flex`、`border-radius`、`box-shadow`、`linear-gradient`、`radial-gradient`
>
> **WeChat 兼容铁律**：
> - **渐变卡片内部不要再放纯色条块**：封面是渐变底，任何带 `background-color` 的行内块都会显出一道色带
> - **文字强调用彩色加粗或彩色文字，不要用内联底色块**：换行时会被切成两段，第二行还会被 padding 顶出缩进
> - 卡片描边用**彩色**（粉 `#F5B3C8`），不要用白色
> - 装饰性空元素（细线、圆点）内部放 `<span leaf=""><br></span>`

---

## 设计变量速查表

```
页底：          #FFF8F4（奶白）+ 点阵 #F6DDE3（16px 网格）
正文墨：        #4A3B3C
次要文字：      #5A4548
辅助文字：      #7A6A60 / #6A575B
玫瑰主色：      #A83A57（强调）/ #B8325C（标题关键词）
卡片描边：      #F5B3C8（2px）
封面渐变：      linear-gradient(165deg,#FFE6EF 0%,#F9CFDF 100%)
引言卡渐变：    linear-gradient(180deg,#FFFFFF 0%,#FFF4F8 100%)
五色编号：      粉 #FFE2EC→#FBC9DA ｜ 紫 #F3E8FD→#E4D3F9 ｜ 蓝 #E7F3FC→#CBE0F6 ｜ 绿 #E3F6EC→#C4E6D4 ｜ 黄 #FFF4D9→#FFE6AE
编号文字：      粉 #A83A57 ｜ 紫 #6B4B9E ｜ 蓝 #2C6A9C ｜ 绿 #2F7050 ｜ 黄 #8A5A12
要点卡：        #FFF7E0→#FFEBC2，描边 #E8B45A，字 #8A5A12
正文字号：      17px，line-height:2.05
章节标题：      22px / 900（黑体）
封面标题：      24px / 900（衬线）
```

**用色比例**：奶白 70%、粉彩卡 25%、玫瑰 5%。编号五色按章节顺序轮转，**同一篇不要跳色**。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background-color:#FFF8F4;background-image:radial-gradient(#F6DDE3 1px, transparent 1px);background-size:16px 16px;padding:30px 24px 34px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#4A3B3C;font-size:17px;line-height:2;overflow-x:hidden;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 封面卡（页眉细线 + 衬线标题 + 副标题胶囊）

> 标题超过一行用 `<br>` 在语义边界断句；**375px 下封面标题最大 24px**，再大会折成三行。

```html
<section style="background:linear-gradient(165deg,#FFE6EF 0%,#F9CFDF 100%);border-radius:32px;padding:30px 18px 22px;text-align:center;margin:0 0 24px;box-shadow:0 18px 30px -22px rgba(206,132,158,0.55);">
  <section style="display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
    <span style="display:inline-block;width:26px;height:1px;background:#E9B8C7;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="margin:0 10px;font-size:10px;font-weight:bold;letter-spacing:4px;color:#A83A57;"><span leaf="">CREAM PUFF</span></span>
    <span style="display:inline-block;width:26px;height:1px;background:#E9B8C7;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <p style="margin:0 0 18px;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:24px;font-weight:900;line-height:1.65;color:#4A3B3C;letter-spacing:0;">
    <span leaf="">标题第一行，</span><br>
    <span leaf="">标题第二行的</span><span style="color:#B8325C;"><span leaf="">关键词</span></span>
  </p>
  <section>
    <span style="display:inline-block;background:#FFFFFF;color:#A83A57;font-size:12px;letter-spacing:1.2px;line-height:1.7;padding:6px 16px;border-radius:999px;box-shadow:0 5px 10px -7px rgba(190,120,145,0.9);"><span leaf="">副标题一句话</span></span>
  </section>
</section>
```

---

## 组件 3 引言卡（白底粉边）

```html
<section style="background:linear-gradient(180deg,#FFFFFF 0%,#FFF4F8 100%);border:2px solid #F5B3C8;border-radius:28px;padding:24px 22px 20px;box-shadow:0 16px 30px -20px rgba(214,140,155,0.5),inset 0 2px 0 #FFFFFF;margin:0 0 30px;">
  <section style="margin:0 0 12px;background-color:#FFFFFF;"><span style="display:inline-block;background:#FFE3EA;color:#A83A57;font-size:11px;font-weight:bold;letter-spacing:1px;padding:4px 12px;border-radius:999px;"><span leaf="">✿ 写在前面</span></span></section>
  <p style="margin:0 0 14px;font-size:16px;line-height:2;color:#5A4548;text-align:justify;"><span leaf="">引言正文，两三句。强调用</span><span style="color:#A83A57;font-weight:bold;"><span leaf="">彩色加粗</span></span><span leaf="">。</span></p>
  <p style="margin:0;font-size:12px;color:#A83A57;text-align:right;letter-spacing:1px;"><span leaf="">—— {{作者名}}</span></p>
</section>
```

---

## 组件 4 正文段落

```html
<p style="background-color:#FFF8F4;margin:0 0 20px;font-size:17px;line-height:2.05;color:#4A3B3C;text-align:justify;">
  <span leaf="">正文段落。每段挑 1 处核心短语，用</span><span style="color:#A83A57;font-weight:bold;"><span leaf="">玫瑰色加粗</span></span><span leaf="">带过，不要整段上色。</span>
</p>
```

术语首次出现可用紫色标注：

```html
<span style="color:#6B4B9E;font-weight:bold;"><span leaf="">术语</span></span>
```

---

## 组件 5 目录卡（圆点 + 细线）

```html
<section style="margin:0 0 40px;background:linear-gradient(180deg,#FFFFFF 0%,#FFF6F9 100%);border-radius:28px;padding:20px 22px 12px;box-shadow:0 16px 30px -20px rgba(214,150,160,0.5),inset 0 2px 0 #FFFFFF;">
  <section style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
    <span style="font-size:10px;font-weight:bold;letter-spacing:3px;color:#A83A57;"><span leaf="">CONTENTS</span></span>
    <span style="font-size:10px;letter-spacing:1px;color:#6A575B;"><span leaf="">05 CHAPTERS</span></span>
  </section>
  <section style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid #FAF0EE;">
    <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#F4B9C7;margin-right:12px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="font-size:15px;color:#4A3B3C;"><span leaf="">第一章标题</span></span>
  </section>
  <section style="display:flex;align-items:center;padding:8px 0;">
    <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#C9B6E8;margin-right:12px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="font-size:15px;color:#4A3B3C;"><span leaf="">第二章标题</span></span>
  </section>
</section>
```

圆点颜色与后文章节编号同色系（粉 / 紫 / 蓝 / 绿 / 黄）。

---

## 组件 6 章节头（38px 编号 + 22px 标题 + 英文小标 + 细线）

> 编号底色是渐变，`line-height` 要等于高度（38px）才能垂直居中。五色对照见「设计变量速查表」。

```html
<section style="background-color:#FFF8F4;margin:0 0 20px;">
  <section style="display:flex;align-items:center;">
    <span style="display:inline-block;width:38px;height:38px;background:linear-gradient(180deg,#FFE2EC 0%,#FBC9DA 100%);border-radius:15px;color:#A83A57;box-shadow:0 5px 10px -6px rgba(206,126,150,0.9),inset 0 2px 0 #FFFFFF;font-family:Georgia,serif;font-size:14px;font-weight:900;text-align:center;line-height:38px;flex-shrink:0;"><span leaf="">01</span></span>
    <span style="margin-left:13px;font-size:22px;font-weight:900;color:#4A3B3C;letter-spacing:0.5px;"><span leaf="">章节标题</span></span>
  </section>
  <section style="margin-top:10px;"><span style="font-size:10px;letter-spacing:3px;color:#6A575B;"><span leaf="">CHAPTER 01 · CAPABILITY</span></span></section>
  <section style="height:1px;background:#E8CBC4;margin-top:14px;font-size:0;line-height:0;"><span leaf=""><br></span></section>
</section>
```

---

## 组件 7 编号清单

```html
<section style="display:flex;align-items:flex-start;padding:11px 0;background-color:#FFF8F4;">
  <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#FBD3E0;color:#A82A52;font-size:11px;font-weight:bold;text-align:center;line-height:24px;margin:4px 12px 0 0;flex-shrink:0;"><span leaf="">1</span></span>
  <span style="font-size:16px;line-height:1.9;color:#5A4B4D;"><span style="color:#4A3B3C;font-weight:bold;"><span leaf="">小标题</span></span><span leaf="">：说明文字</span></span>
</section>
```

---

## 组件 8 奶油要点卡

```html
<section style="margin:0 0 24px;background:linear-gradient(180deg,#FFF7E0 0%,#FFEBC2 100%);border:2px solid #E8B45A;border-radius:26px;padding:20px 20px 18px;box-shadow:0 16px 28px -20px rgba(214,170,96,0.5),inset 0 2px 0 #FFFFFF;">
  <section style="margin:0 0 8px;"><span style="display:inline-block;background:#FFFFFF;color:#8A5A12;font-size:11px;font-weight:bold;letter-spacing:1px;padding:4px 12px;border-radius:999px;"><span leaf="">✦ KEY POINT</span></span></section>
  <p style="margin:0;font-size:16px;line-height:1.95;color:#5A4B3A;text-align:justify;"><span leaf="">一句话结论。</span></p>
</section>
```

---

## 组件 9 步骤清单（圆点）

```html
<section style="margin:0 0 20px;background-color:#FFF8F4;">
  <section style="display:flex;align-items:flex-start;padding:9px 0;">
    <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#B6E0CE;margin:12px 14px 0 0;flex-shrink:0;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="font-size:16px;line-height:1.9;color:#5A4B4D;"><span leaf="">步骤文字</span></span>
  </section>
</section>
```

---

## 组件 10 落款（信笺式）

```html
<section style="background:#FFFFFF;border:2px solid #F5B3C8;border-radius:24px;padding:26px 22px 22px;text-align:center;box-shadow:0 14px 28px -22px rgba(214,140,155,0.55);">
  <section style="display:flex;align-items:center;justify-content:center;margin-bottom:18px;background-color:#FFFFFF;">
    <span style="display:inline-block;width:28px;height:1px;background:#F0D6DC;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="margin:0 10px;font-size:10px;letter-spacing:3px;color:#B8325C;"><span leaf="">T H E  E N D</span></span>
    <span style="display:inline-block;width:28px;height:1px;background:#F0D6DC;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <p style="margin:0;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:18px;font-weight:900;line-height:1.95;color:#4A3B3C;letter-spacing:0.5px;background-color:#FFFFFF;">
    <span leaf="">金句第一行，</span><br>
    <span leaf="">金句第二行</span><br>
    <span style="color:#A83A57;"><span leaf="">关键词</span></span><span leaf="">。</span>
  </p>
  <section style="height:1px;background:#F5E3E6;margin:20px 0 18px;font-size:0;line-height:0;"><span leaf=""><br></span></section>
  <section style="display:flex;align-items:center;justify-content:center;background-color:#FFFFFF;">
    <span style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#F7C6D2;color:#8E2440;font-family:Georgia,'Songti SC',serif;font-size:15px;font-weight:bold;text-align:center;line-height:36px;flex-shrink:0;"><span leaf="">{{首字}}</span></span>
    <section style="text-align:left;margin-left:12px;background-color:#FFFFFF;">
      <p style="margin:0 0 2px;font-size:14px;font-weight:bold;color:#4A3B3C;letter-spacing:1px;"><span leaf="">{{作者名}}</span></p>
      <p style="margin:0;font-size:11px;color:#7A6A60;line-height:1.7;"><span leaf="">{{一句话简介}}</span></p>
    </section>
  </section>
  <section style="margin-top:18px;background-color:#FFFFFF;">
    <span style="display:inline-block;background:#FFF8F4;color:#A83A57;font-size:12px;letter-spacing:0.5px;padding:7px 18px;border-radius:999px;border:1.5px solid #F0A9BD;"><span leaf="">觉得有收获，欢迎点赞、转发、推荐</span></span>
  </section>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;...点阵底...">
  <!-- 1. 封面卡（组件 2） -->
  <!-- 2. 引言卡（组件 3） -->
  <!-- 3. 正文（组件 4） -->
  <!-- 4. 目录卡（组件 5，可选） -->
  <!-- 5. 章节头（组件 6）+ 正文 + 清单（组件 7）/ 步骤（组件 9）-->
  <!-- 6. 要点卡（组件 8）按需穿插 -->
  <!-- 7. 落款（组件 10） -->
</section>
```

**节奏铁律**：封面卡全篇一次；目录卡一次；章节编号五色按粉→紫→蓝→绿→黄顺序，不跳色；要点卡全篇不超过 2 张；落款全篇一次。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **锚点层** | 封面卡 / 章节编号+标题 / 落款 | 结构锚点 | 每篇 1 + 每章 1 |
| **标记层** | 玫瑰色加粗 / 紫色术语 | 关键句、术语 | 每段 1 处 |
| **容器层** | 引言卡 / 目录卡 / 要点卡 | 收束与导览 | 每 2–3 屏 1 个 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组合 | 点缀 |
|---|---|---|
| 随笔 / 年度总结 | 封面 2 + 引言 3 + 正文 4 | 落款 10、要点卡 8 |
| 方法论 / 观点 | 封面 2 + 引言 3 + 章节 6 + 清单 7 | 要点卡 8 |
| 教程 / 步骤 | 封面 2 + 章节 6 + 步骤 9 | 目录 5、要点卡 8 |
| 读书笔记 | 封面 2 + 目录 5 + 正文 4 | 引言 3、落款 10 |

---

## Markdown → 奶油泡芙 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 2 封面卡 | 24px 衬线，关键词用玫瑰色 |
| 开头 `> 引言` | 组件 3 引言卡 | ✿ 写在前面 |
| `## 章节` | 组件 6 章节头 | 五色编号轮转 |
| `### 小标题` | `**加粗**` 段落 | 不单独做组件 |
| 普通段落 | 组件 4 正文段 | 17px / 2.05 |
| `**加粗**` | 玫瑰色加粗 span | 每段 1 处 |
| `> 引用` | 组件 8 要点卡 | 奶油黄 |
| `- 列表` | 组件 7 编号清单 | 圆序号 |
| `1. 步骤` | 组件 9 步骤清单 | 薄荷圆点 |
| `![](图片)` | 通用库 2a | 圆角 14px |
| 行内 `` `code` `` | 通用库 1c | 浅粉底 |
| ` ``` 代码块 ``` ` | 通用库 1b | 浅色版 |
| `[text](url)` | 通用库 4a/4b | 角标玫瑰色 |
| 文末 | 组件 10 落款 | THE END + 金句 + 署名 |
