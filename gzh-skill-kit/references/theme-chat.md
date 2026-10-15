# 公众号排版组件库 —— 薄荷对话 Chat

> **使用说明**：本组件库为「薄荷对话」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：源自 mydesign-system components「Chat Bubbles 对话气泡」——全篇以「你问 / AI 答」左右气泡推进，正文藏在气泡之间。薄荷绿 `#059669`（主，标签/题头/金句强调）、暖白页面底 `#FDFCF8`、奶油黄 `#FFF4D6` 做要点卡。左侧浅绿底气泡（`#F3F8F5`）是"提问"，右侧薄荷底气泡（`#E0F6EF`）是"AI 回答"，气泡之间的墨绿正文做补充叙述。**AI 气泡内的强调用蜜橙 `#92400E` 加粗**（浅底上对比度达标），不用红。适合 AI 访谈实录、问答式教程、案例复盘。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class、`position:fixed/absolute`、`float`、`display:grid`
> - **外层底色会被剥离**：公众号编辑器会剥掉最外层 `<section>` 的 `background`（纯色/渐变都可能丢）。页面底色不要只放顶层容器——每个正文区块（章节卡、分割装饰、签名区、互动区）都要各自带 `background` 或等价底色，确保外层被剥掉后任一区块都不是裸内容
> - ✅ 支持内联 `style`、`display:flex`、`border-radius`（含不对称圆角模拟气泡尾巴）
>
> **WeChat 兼容铁律**：
> - 装饰性空元素（圆点、短横线）内部放 `<span leaf=""><br></span>`
> - 气泡不对称圆角用四值 border-radius（微信支持），左气泡 `4px 18px 18px 18px`、右气泡 `18px 4px 18px 18px`
> - 气泡 `max-width:78%`（88% 会在窄屏贴边），必须 `display:inline-block` + 外层 `text-align:right`（AI 侧）
> - 气泡内文字用对应深色（提问 `#2B2B33`、回答 `#1F5C42`），对比度 ≥4.5:1
> - 高亮 span 不跨行
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
页面底：        #FDFCF8（暖白）
墨色正文：      #2B2B33
叙述正文：      #1F2A22（墨绿，气泡间过场）
次要文字：      #465249
薄荷主色：      #059669（题头/标签/金句强调/装饰条）
提问气泡：      底 #F3F8F5 / 描边 #D9EBE0 / 文字 #2B2B33 / 标签 #059669
回答气泡：      底 #E0F6EF / 描边 #C4ECDC / 文字 #1F5C42 / 标签 #059669
气泡内强调：    #92400E（蜜橙加粗，浅底对比达标）
奶油黄要点卡：  底 #FFF4D6 / 描边 #F8E6B0 / 标题 #2B2B33 / 正文 #1F2A22
蜜黄荧光笔：    linear-gradient(transparent 60%, #F4D793 60%)（叙述段用）
正文字号：      16-17px，line-height:2
中性/补充色：   #2F6B4F
```

色彩比例：暖白 75%、薄荷系 20%（气泡+标签+装饰）、奶油黄 5%。气泡一左一右交替，不允许连续两个同侧气泡。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FDFCF8;padding:40px 22px 36px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#2B2B33;font-size:17px;line-height:2;overflow-x:hidden;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 顶部对谈题头（薄荷 + 栏目名）

```html
<section style="text-align:center;margin-bottom:16px;">
  <span style="font-size:13px;font-weight:bold;letter-spacing:4px;color:#059669;"><span leaf="">● AI 对谈室</span></span>
</section>
```

---

## 组件 3 大标题区（中轴 + 薄荷下划条）

```html
<section style="text-align:center;margin-bottom:34px;">
  <p style="margin:0 0 12px;font-size:30px;font-weight:900;line-height:1.5;color:#2B2B33;word-break:normal;overflow-wrap:normal;">
    <span leaf="">标题第一行</span><br>
    <span leaf="">标题第二行</span>
  </p>
  <section style="margin-bottom:12px;">
    <span style="display:inline-block;width:64px;height:6px;background:#059669;border-radius:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <p style="margin:0;font-size:16px;color:#465249;line-height:1.8;"><span leaf="">副标题：一场关于 XX 的真实对话</span></p>
</section>
```

---

## 组件 4 提问气泡（左：浅绿底细边，尾巴朝左上）

```html
<section style="margin-bottom:20px;">
  <section style="margin-bottom:6px;">
    <span style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#059669;"><span leaf="">🙋 我</span></span>
  </section>
  <section style="display:inline-block;max-width:78%;padding:16px 18px;background:#F3F8F5;border:1px solid #D9EBE0;border-radius:4px 18px 18px 18px;">
    <p style="margin:0;font-size:16px;line-height:2;color:#2B2B33;"><span leaf="">提问内容，口语化，一两句话。</span></p>
  </section>
</section>
```

---

## 组件 5 回答气泡（右：薄荷底，尾巴朝右上）

```html
<section style="margin-bottom:24px;text-align:right;">
  <section style="margin-bottom:6px;">
    <span style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#059669;"><span leaf="">🤖 AI</span></span>
  </section>
  <section style="display:inline-block;max-width:78%;padding:16px 18px;background:#E0F6EF;border:1px solid #C4ECDC;border-radius:18px 4px 18px 18px;text-align:left;">
    <p style="margin:0 0 10px;font-size:16px;line-height:2;color:#1F5C42;text-align:justify;"><span leaf="">回答第一段。</span><span style="color:#92400E;font-weight:bold;"><span leaf="">关键短语用蜜橙加粗</span></span><span leaf="">。</span></p>
    <p style="margin:0;font-size:16px;line-height:2;color:#1F5C42;text-align:justify;"><span leaf="">回答第二段（可省略）。</span></p>
  </section>
</section>
```

气泡内强调（每气泡 ≤1 处）：

```html
<span style="color:#92400E;font-weight:bold;"><span leaf="">关键短语</span></span>
```

---

## 组件 6 叙述段（气泡之间的过场正文）

```html
<p style="margin:0 0 24px;font-size:17px;line-height:2;color:#1F2A22;text-align:justify;">
  <span leaf="">叙述正文，承上启下。这段是普通文章体，让长对话有呼吸感。</span>
  <span leaf="">翻车不可怕，</span><span style="background:linear-gradient(transparent 60%, #F4D793 60%);font-weight:bold;padding:0 2px;"><span leaf="">关键句用蜜黄荧光笔</span></span><span leaf="">。</span>
</p>
```

荧光笔每段 ≤1 处、不跨行。

---

## 组件 7 章节小标（薄荷字 + 居中）

```html
<section style="text-align:center;margin:36px 0 24px;">
  <span style="font-size:14px;font-weight:bold;letter-spacing:4px;color:#059669;"><span leaf="">—— 第一轮 · 关于分工 ——</span></span>
</section>
```

---

## 组件 8 要点卡（奶油黄底，对话后收束要点用）

```html
<section style="margin:24px 0;padding:20px 20px;background:#FFF4D6;border:1px solid #F8E6B0;border-radius:16px;">
  <p style="margin:0 0 8px;font-size:16px;font-weight:900;color:#2B2B33;"><span leaf="">📌 这轮聊下来</span></p>
  <p style="margin:0;font-size:16px;line-height:2;color:#1F2A22;text-align:justify;"><span leaf="">把对话的结论压成两三句。</span><span style="font-weight:bold;"><span leaf="">核心结论加粗（不加色）。</span></span></p>
</section>
```

---

## 组件 9 图片（圆角 + 居中）

```html
<span leaf=""><img src="{{图片URL}}" style="width:100%;border-radius:14px;margin-bottom:8px;"></span>
<section style="text-align:center;margin-bottom:20px;">
  <span style="font-size:13px;color:#465249;"><span leaf="">△ {{图片说明}}</span></span>
</section>
```

---

## 组件 10 结尾金句（居中 + 薄荷强调 + 绿条）

```html
<section style="text-align:center;margin:40px 0 28px;">
  <p style="margin:0 0 14px;font-size:20px;font-weight:900;line-height:1.8;color:#1F2A22;">
    <span leaf="">金句第一行，</span><br>
    <span leaf="">是</span><span style="color:#059669;"><span leaf="">薄荷绿强调短语</span></span><span leaf="">。</span>
  </p>
  <span style="display:inline-block;width:48px;height:5px;background:#059669;border-radius:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
</section>
```

---

## 组件 11 签名档（气泡式页脚）

```html
<section style="text-align:center;padding:20px 0 0;">
  <section style="display:inline-block;background:#E0F6EF;border-radius:18px 18px 4px 18px;padding:14px 22px;text-align:left;margin-bottom:8px;">
    <p style="margin:0 0 4px;font-size:15px;font-weight:900;color:#1F5C42;"><span leaf="">{{作者名/品牌名}}</span></p>
    <p style="margin:0;font-size:13px;color:#2F6B4F;line-height:1.8;"><span leaf="">{{签名第一行}} · 觉得有收获，欢迎点赞、转发、推荐</span></p>
  </section>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FDFCF8;padding:40px 22px 36px;...">
  <!-- 1. 题头（组件 2） -->
  <!-- 2. 大标题（组件 3） -->
  <!-- 3. 开场叙述段（组件 6） -->
  <!-- 4. 章节小标（组件 7） -->
  <!-- 5. 提问气泡（组件 4）→ 回答气泡（组件 5）×N -->
  <!-- 6. 要点卡（组件 8） -->
  <!-- 7. 叙述段过渡（组件 6） -->
  <!-- 8. 下一轮对话…（重复 5-7） -->
  <!-- 9. 结尾金句（组件 10） -->
  <!-- 10. 签名档（组件 11） -->
</section>
```

**节奏铁律**：气泡必须左右交替；连续问答超过 4 组就插一段叙述或要点卡；要点卡每轮对话后最多一张；回答气泡内强调每气泡 ≤1 处；奶油黄要点卡不做正文容器，只做收束。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **对话层** | 左浅绿气泡 / 右薄荷气泡 | 核心内容载体 | 全篇主体 |
| **叙述层** | 普通正文段 + 蜜黄荧光笔 | 过场、补充、评价 | 每 3-4 组气泡一段 |
| **收束层** | 要点卡（奶油黄）/ 金句 | 每轮结论 | 每轮 1 张 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组合 | 点缀 |
|---|---|---|
| AI 访谈实录 | 气泡 4/5 为主 + 小标 7 分轮 | 要点卡 8、图 9 |
| 问答式教程 | 气泡 4/5 + 叙述段 6 补步骤 | 要点卡 8 |
| 案例复盘 | 叙述 6 铺垫 + 气泡还原现场 | 金句 10 |
| 提示词演示 | 提问气泡放 prompt（用等宽底纹）、回答放效果 | 要点卡 8 |

---

## Markdown → 薄荷对话 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 3 大标题区 | 中轴 + 薄荷条 |
| `## 章节` | 组件 7 章节小标 | 居中「—— XX ——」式 |
| 对话原文 | 组件 4/5 气泡交替 | 标签 🙋 我 / 🤖 AI |
| 普通段落 | 组件 6 叙述段 | 蜜黄标记关键句（≤1 处/段） |
| `> 引用/小结` | 组件 8 要点卡 | |
| `**加粗**` | 叙述内蜜黄荧光笔 / 气泡内 `#92400E` 加粗 | 每段/气泡 ≤1 处 |
| `![](图片)` | 组件 9 | |
| 行内 `` `code` `` | `background:#F3F8F5;color:#1F5C42` 等宽胶囊 | |
| ` ``` 代码块 ``` ` | 通用库 1a/1b | |
| `[text](url)` | 通用库 4a/4b（角标绿 `#059669`） | |
| 文末 | 组件 10 金句 + 11 签名档 | |
