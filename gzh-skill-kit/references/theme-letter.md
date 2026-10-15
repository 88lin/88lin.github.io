# 公众号排版组件库 —— 奶咖信纸 Letter

> **使用说明**：本组件库为「奶咖信纸」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：源自 scene-wechat「杂志编号风」直系——奶白信纸底（`#fefcf6`）+ 经典蓝 `#2B7FD8` / 黄 `#F4D758` / 红 `#E84A5F` 三色。全篇**无卡片堆砌**：顶部红色 kicker 期号 → 中轴衬线大标题（荧光笔点睛）→ 三色装饰条 → 引言区块 → 章节头三件套（淡色斜体英文装饰词 + 衬线标题 + 黄短条）→ 三色分隔条分段。正文 18px / line-height 2.0，疏朗如一封长信。适合观点、叙事长文、方法论、年度总结。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class/id、`position:fixed/absolute`、`float`、`@media`/`@keyframes`、`display:grid`
> - **外层底色会被剥离**：公众号编辑器会剥掉最外层 `<section>` 的 `background`（纯色/渐变都可能丢）。页面底色不要只放顶层容器——每个正文区块（章节卡、分割装饰、签名区、互动区）都要各自带 `background` 或等价底色，确保外层被剥掉后任一区块都不是裸内容
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、`box-shadow`、`<section>/<p>/<span>/<strong>/<img>` 等基础标签
>
> **WeChat 兼容铁律**（本主题组件全部已按此写好，改动时必须遵守）：
> - 所有"装饰性空元素"（三色装饰条、黄短条、分隔条）**内部放 `<span leaf=""><br></span>` 占位**，否则微信会剥掉样式
> - **不要把 `font-size`/`border-bottom` 打在 `<strong>` 上**，也不要在同一个 `<p>` 里混多个不同 `font-size`——微信编辑器会自动"纠正"导致样式被重写
> - 荧光笔高亮统一用 `background:linear-gradient(transparent 60%, #F4D758 60%)` 挂在外层 `<span>` 上
> - 标题断行协议：中文标题超一行必须用 `<br>` 在语义边界显式断句；英文装饰词独占一行 `white-space:nowrap;word-break:keep-all;overflow-wrap:normal;`，10 字母以内 56–68px、11–14 字母 48–56px、15–18 字母 38–48px
> - 结构化区域没有内容时**整块删掉**，不留空 section

---

## 设计变量速查表

```
信纸底：       #fefcf6（奶白）
正文色：       #1A1A2E（墨色）
次要文字：     #4A4A5A
辅助文字：     #6E6258
主色蓝：       #2B7FD8（kicker 备选/装饰词/链接）
强调黄：       #F4D758（黄短条/荧光笔/装饰条中段）
点缀红：       #E84A5F（kicker/装饰条尾段）
引言区块底：   #FFF8E1（方案C黄渐变底）
衬线标题字体： Georgia,'Songti SC','Noto Serif SC',serif
正文无衬线：   -apple-system,'PingFang SC','Helvetica Neue',sans-serif
正文字号：     18px，line-height:2
页面补充色：    #F1F5F9
```

三色比例：墨色文字 90%，蓝黄红各作小剂量点缀（蓝=信息、黄=强调、红=警示/期号），一篇文章红色 kicker 只出现一次。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#fefcf6;padding:44px 26px 40px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#1A1A2E;font-size:18px;line-height:2;overflow-x:hidden;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 红色 kicker（顶部期号标签，每篇一次）

```html
<section style="text-align:center;margin-bottom:14px;">
  <span style="font-size:13px;font-weight:bold;letter-spacing:5px;color:#E84A5F;"><span leaf="">AI 工作流实录</span></span>
</section>
```

---

## 组件 3 大标题区（中轴衬线，荧光笔点睛）

> 主标题默认两行以内；换行必须用 `<br>` 在语义边界断句。

```html
<section style="text-align:center;margin-bottom:40px;padding:24px 0 40px;">
  <p style="margin:0 0 12px;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:32px;font-weight:900;color:#1A1A2E;line-height:1.5;word-break:normal;overflow-wrap:normal;">
    <span leaf="">我和 AI 搭档的第</span><span leaf="">100 天</span>
  </p>
  <p style="margin:0;font-size:17px;color:#4A4A5A;line-height:1.8;"><span leaf="">从怀疑到离不开，中间只隔了一个好问题</span></p>
</section>
```

带荧光笔的标题变体：

```html
<p style="margin:0 0 12px;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:32px;font-weight:900;color:#1A1A2E;line-height:1.5;">
  <span leaf="">把前沿 AI，</span><br>
  <span leaf="">做成</span><span style="background:linear-gradient(transparent 60%, #F4D758 60%);padding:0 2px;"><span leaf="">能交付的东西</span></span><span leaf="">。</span>
</p>
```

---

## 组件 4 引言金句（居中衬线 + 关键词变色）

```html
<section style="text-align:center;margin-bottom:10px;">
  <p style="margin:0;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:21px;font-weight:900;line-height:1.9;">
    <span leaf="">不是 AI 变强了，</span><br>
    <span leaf="">是我学会了</span><span style="color:#2B7FD8;"><span leaf="">提问</span></span><span leaf="">。</span>
  </p>
</section>
```

---

## 组件 5 三色装饰条（标题后 + 章节间复用）

```html
<section style="text-align:center;margin-bottom:36px;">
  <span style="display:inline-block;width:36px;height:4px;background:#2B7FD8;border-radius:2px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  <span style="display:inline-block;width:18px;height:4px;background:#F4D758;border-radius:2px;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  <span style="display:inline-block;width:8px;height:4px;background:#E84A5F;border-radius:2px;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
</section>
```

章节间距更大的变体：`margin-bottom:56px`。

---

## 组件 6 引言区块（方案C 黄渐变底）

```html
<section style="margin-bottom:28px;padding:24px 22px;background:#FFF8E1;border-radius:16px;">
  <p style="margin:0 0 14px;font-size:16px;line-height:2;color:#1A1A2E;text-align:justify;"><span leaf="">三个月前我还在纠结"AI 到底能不能用"。直到有一天我决定认真试一次——不是随便问一句，而是把我的工作流完整交给它。</span></p>
  <p style="margin:0;font-size:16px;line-height:2;color:#1A1A2E;text-align:justify;"><span leaf="">结果发现，</span><span style="background:linear-gradient(transparent 60%, #F4D758 60%);font-weight:bold;padding:0 2px;"><span leaf="">真正的瓶颈从来不是工具，而是我不知道自己要什么。</span></span></p>
</section>
```

---

## 组件 7 章节头三件套（叙事类：装饰词 + 衬线标题 + 黄条）

> 每章配一个英文装饰词（Georgia italic 68px 淡蓝），词要短（1–2 个单词）且与章节主题相关。第一章 `margin-bottom:52px` 起始即可，无需额外 top；后续章节保持 52px。

```html
<section style="margin-bottom:52px;">
  <section style="margin-bottom:6px;overflow:visible;">
    <span style="display:inline-block;font-family:Georgia,'Songti SC',serif;font-style:italic;font-size:68px;font-weight:bold;color:rgba(43,127,216,0.14);line-height:1;white-space:nowrap;word-break:keep-all;overflow-wrap:normal;"><span leaf="">Start</span></span>
  </section>
  <section style="margin-bottom:10px;">
    <span style="font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:27px;font-weight:900;color:#1A1A2E;"><span leaf="">起点：一个很蠢的问题</span></span>
  </section>
  <section style="margin-bottom:22px;">
    <span style="display:inline-block;width:56px;height:6px;background:#F4D758;border-radius:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <!-- 本章正文 -->
</section>
```

---

## 组件 8 章节头四件套（教程/步骤类：STEP 标签）

```html
<section style="margin-bottom:52px;">
  <section style="margin-bottom:6px;overflow:visible;">
    <span style="display:inline-block;font-family:Georgia,'Songti SC',serif;font-style:italic;font-size:68px;font-weight:bold;color:rgba(43,127,216,0.14);line-height:1;white-space:nowrap;word-break:keep-all;overflow-wrap:normal;"><span leaf="">01</span></span>
  </section>
  <section style="margin-bottom:4px;">
    <span style="font-size:13px;font-weight:bold;letter-spacing:4px;color:#2B7FD8;"><span leaf="">STEP 1</span></span>
  </section>
  <section style="margin-bottom:10px;">
    <span style="font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:27px;font-weight:900;color:#1A1A2E;"><span leaf="">把上下文喂饱</span></span>
  </section>
  <section style="margin-bottom:22px;">
    <span style="display:inline-block;width:56px;height:6px;background:#F4D758;border-radius:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <!-- 本章正文 -->
</section>
```

---

## 组件 9 正文段落（18px / 行高 2，荧光笔标记）

```html
<p style="margin:0 0 18px;font-size:18px;line-height:2;color:#1A1A2E;text-align:justify;">
  <span leaf="">我问 AI 的第一个问题是"帮我写一篇文案"。结果可想而知——又空又泛。后来才明白，</span>
  <span style="background:linear-gradient(transparent 60%, #F4D758 60%);font-weight:bold;padding:0 2px;"><span leaf="">你给它什么质量的输入，它就还你什么质量的输出。</span></span>
</p>
```

标记原则：每节 1–3 处荧光笔，不贪多；对应 `**加粗**` 的文字。

---

## 组件 10 加粗强调（无荧光笔版）

```html
<strong style="color:#1A1A2E;"><span leaf="">普通加粗强调</span></strong>
```

蓝色关键词（小剂量）：

```html
<span style="color:#2B7FD8;font-weight:bold;"><span leaf="">蓝色关键词</span></span>
```

---

## 组件 11 图片

```html
<span leaf=""><img src="{{图片URL}}" style="width:100%;border-radius:14px;margin-bottom:8px;"></span>
```

图注（可选）：

```html
<section style="text-align:center;margin-bottom:20px;">
  <span style="font-size:13px;color:#6E6258;"><span leaf="">△ {{图片说明}}</span></span>
</section>
```

---

## 组件 12 结尾金句（大装饰引号 + 三色条收束）

```html
<section style="text-align:center;margin:48px 0 36px;">
  <span style="font-family:Georgia,serif;font-style:italic;font-size:56px;color:rgba(43,127,216,0.18);line-height:1;"><span leaf="">“</span></span>
  <p style="margin:8px 0 6px;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:21px;font-weight:900;line-height:1.8;color:#1A1A2E;"><span leaf="">核心金句文字</span></p>
  <p style="margin:0 0 16px;font-size:14px;color:#6E6258;"><span leaf="">副句 / 补充</span></p>
  <section style="text-align:center;">
    <span style="display:inline-block;width:36px;height:4px;background:#2B7FD8;border-radius:2px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:18px;height:4px;background:#F4D758;border-radius:2px;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
    <span style="display:inline-block;width:8px;height:4px;background:#E84A5F;border-radius:2px;margin-left:5px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
</section>
```

---

## 组件 13 签名档（居中克制）

```html
<section style="text-align:center;padding:20px 0 0;">
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#1A1A2E;"><span leaf="">{{作者名}}</span></p>
  <p style="margin:0;font-size:13px;color:#6E6258;line-height:1.8;">
    <span leaf="">▪️{{签名第一行，如：在 AI 时代认真生活的女生}}</span><br>
    <span leaf="">▪️{{签名第二行，如：跟 Agent 搭档的第 1 年}}</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#fefcf6;padding:44px 26px 40px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#1A1A2E;font-size:18px;line-height:2;overflow-x:hidden;">

  <!-- 1. 红色 kicker（组件 2） -->
  <!-- 2. 大标题区（组件 3） -->
  <!-- 3. 引言金句（组件 4） -->
  <!-- 4. 三色装饰条（组件 5） -->
  <!-- 5. 引言区块（组件 6，可选） -->
  <!-- 6. 章节一：三件套/四件套（组件 7/8）+ 正文（组件 9）+ 图片（组件 11） -->
  <!-- 7. 三色分隔条（组件 5，margin-bottom:56px） -->
  <!-- 8. 章节二…第N章（同上） -->
  <!-- 9. 结尾金句（组件 12） -->
  <!-- 10. 签名档（组件 13） -->

</section>
```

**骨架铁律**：kicker 每篇一次；全篇无色块卡片堆砌（引言区块是唯一的底色块）；章节间只用三色分隔条；一个结尾金句 + 一个签名档；三色装饰条与分隔条样式完全一致，不发明第四种颜色。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **锚点层** | 衬线大标题 / 引言金句 / 蓝色关键词 | 章节结构、核心观点 | 每章 1 个标题 |
| **标记层** | 荧光笔高亮（黄） | 每节关键结论 | 每节 1–3 处 |
| **节奏层** | 三色装饰条 / 黄短条 / 淡色装饰词 | 分段与呼吸感 | 章节间 |

**克制原则**：红色只出现在 kicker 与装饰条尾段；蓝色装饰词每章一个；正文永远是 18px 墨色，荧光笔是唯一的大面积暖色。

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组件组合 | 点缀组件 |
|---|---|---|
| 叙事长文/年度总结 | kicker 2 + 大标题 3 + 三件套 7 + 正文 9 | 引言区块 6、图 11 |
| 方法论/观点 | kicker 2 + 金句 4 + 三件套 7 | 结尾金句 12 |
| 教程/工作流 | kicker 2 + 四件套 8 + 正文 9 | 图 11 + 图注 |
| 访谈/故事 | kicker 2 + 三件套 7 + 引言区块 6 | 金句 4 |

所有类型共用：三色装饰条分段 + 结尾金句 12 + 签名档 13。

---

## Markdown → 奶咖信纸 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 3 大标题区 | kicker 之下的中轴衬线大字 |
| 文章开头 `> 引言金句` | 组件 4 引言金句 | 居中衬线 + 蓝色关键词 |
| `## 章节标题` | 组件 7 三件套（叙事）/ 组件 8 四件套（教程） | 每章配英文装饰词 |
| `### 小标题` | `<strong>` 18px 段落 | 加粗成段 |
| 普通段落 | 组件 9 正文段落 | 18px/行高 2 |
| `**加粗文字**` | 荧光笔高亮 span | 每节 1–3 处 |
| `> 引用段落` | 组件 6 引言区块 | 黄渐变底 |
| `---` | 组件 5 三色分隔条 | 章节间 margin 56px |
| `![](图片)` | 组件 11 图片 + 图注 | width:100% 圆角 14px |
| `[text](url)` 超链接 | 通用库 4a 上标角标 + 4b 参考资料列表 | 角标套主色蓝 `#2B7FD8` |
| 行内 `` `code` `` | 通用库 1c 行内代码 | |
| ` ``` 多行代码块 ``` ` | 通用库 1a 深色 / 1b 浅色 | 每行一个 `<p style="margin:0">` |
| 文末 | 组件 12 结尾金句 + 组件 13 签名档 | |
