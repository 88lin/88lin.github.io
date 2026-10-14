# 公众号排版组件库 —— 薄荷对话 Chat

> **使用说明**：本组件库为「薄荷对话」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：源自 mydesign-system components「Chat Bubbles 对话气泡」直系——全篇以「你问 / AI 答」左右气泡推进，正文藏在气泡之间。鼠尾草绿 `#41684F`（主）、蜜黄 `#F4D793`（强调）、绯红 `#B44761`（点缀）。左侧绿边白气泡是"提问"，右侧绿底白字气泡是"AI 回答"，气泡之间的浅色正文做补充叙述。适合 AI 访谈实录、问答式教程、案例复盘。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class、`position:fixed/absolute`、`float`、`display:grid`
> - ✅ 支持内联 `style`、`display:flex`、`border-radius`（含不对称圆角模拟气泡尾巴）
>
> **WeChat 兼容铁律**：
> - 装饰性空元素（圆点、短横线）内部放 `<span leaf=""><br></span>`
> - 气泡不对称圆角用四值 border-radius（微信支持），左气泡 `4px 18px 18px 18px`、右气泡 `18px 4px 18px 18px`
> - 绿底气泡内文字只用白色 / 浅绿 `#DCE8DF`，白气泡内用墨色 `#1F2A22`
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
页面底：        #FCFBF6（暖白）
墨色正文：      #1F2A22
次要文字：      #465249
辅助文字：      #5D6861
鼠尾草主色：    #41684F（深 #2E4E3A，浅 #6E9B7D）
浅绿底：        #EAF1EB
蜜黄强调：      #F4D793 / 蜜黄底 #FBF1DA
绯红点缀：      #B44761 / 绯红底 #F8E7EC
气泡白：        #FEFDFA
提问标签色：    #41684F；回答标签色：#B44761（问答区分靠左右+标签色双重编码）
正文字号：      17px，line-height:2
```

三色比例：墨色 75%、绿 20%（气泡+标签）、黄/红 5%。气泡一左一右交替，不允许连续两个同侧气泡。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FCFBF6;padding:40px 22px 36px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#1F2A22;font-size:17px;line-height:2;overflow-x:hidden;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 顶部对谈题头（绿点 + 栏目名）

```html
<section style="text-align:center;margin-bottom:16px;">
  <span style="font-size:13px;font-weight:bold;letter-spacing:4px;color:#41684F;"><span leaf="">● AI 对谈室</span></span>
</section>
```

---

## 组件 3 大标题区（中轴 + 绿色下划条）

```html
<section style="text-align:center;margin-bottom:34px;">
  <p style="margin:0 0 12px;font-size:30px;font-weight:900;line-height:1.5;color:#1F2A22;word-break:normal;overflow-wrap:normal;">
    <span leaf="">我把 AI 当同事的</span><br>
    <span leaf="">第 30 天</span>
  </p>
  <section style="margin-bottom:12px;">
    <span style="display:inline-block;width:64px;height:6px;background:#41684F;border-radius:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <p style="margin:0;font-size:16px;color:#465249;line-height:1.8;"><span leaf="">一场关于信任、边界和分工的真实对话</span></p>
</section>
```

---

## 组件 4 提问气泡（左：白底绿边，尾巴朝左上）

```html
<section style="margin-bottom:20px;">
  <section style="margin-bottom:6px;">
    <span style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#41684F;"><span leaf="">🙋 我</span></span>
  </section>
  <section style="display:inline-block;max-width:88%;padding:16px 18px;background:#FFFFFF;border:1.5px solid #C4ECDC;border-radius:4px 18px 18px 18px;box-shadow:0 2px 8px rgba(65,104,79,0.08);">
    <p style="margin:0;font-size:16px;line-height:2;color:#1F2A22;"><span leaf="">提问内容，口语化，一两句话。</span></p>
  </section>
</section>
```

---

## 组件 5 回答气泡（右：绿底白字，尾巴朝右上）

```html
<section style="margin-bottom:24px;text-align:right;">
  <section style="margin-bottom:6px;">
    <span style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#B44761;"><span leaf="">🤖 AI</span></span>
  </section>
  <section style="display:inline-block;max-width:88%;padding:16px 18px;background:#E0F6EF;border:1px solid #C4ECDC;border-radius:18px 4px 18px 18px;text-align:left;">
    <p style="margin:0;font-size:16px;line-height:2;color:#1F5C42;text-align:justify;"><span leaf="">回答内容。可以长一些，关键短语用浅绿强调。</span></p>
  </section>
</section>
```

绿底气泡内强调：

```html
<span style="color:#B45309;font-weight:bold;"><span leaf="">关键短语</span></span>
```

---

## 组件 6 叙述段（气泡之间的过场正文）

```html
<p style="margin:0 0 20px;font-size:17px;line-height:2;color:#1F2A22;text-align:justify;">
  <span leaf="">叙述正文，承上启下。这段是普通文章体，让长对话有呼吸感。</span>
  <span style="background:linear-gradient(transparent 60%, #F4D793 60%);font-weight:bold;padding:0 2px;"><span leaf="">蜜黄荧光笔标记关键句。</span></span>
</p>
```

---

## 组件 7 章节小标（绿字 + 细线）

```html
<section style="text-align:center;margin:40px 0 24px;">
  <span style="font-size:14px;font-weight:bold;letter-spacing:4px;color:#41684F;"><span leaf="">—— 第一轮 · 关于分工 ——</span></span>
</section>
```

---

## 组件 8 要点卡（蜜黄底，对话后收束要点用）

```html
<section style="margin:24px 0;padding:20px 20px;background:#FFF4D6;border:1px solid #F8E6B0;border-radius:16px;">
  <p style="margin:0 0 8px;font-size:16px;font-weight:900;color:#1F2A22;"><span leaf="">📌 这轮聊下来</span></p>
  <p style="margin:0;font-size:16px;line-height:2;color:#1F2A22;text-align:justify;"><span leaf="">把对话的结论压成两三句。每轮对话后配一张，读者可以只看要点卡。</span></p>
</section>
```

---

## 组件 9 图片（圆角 + 居中）

```html
<span leaf=""><img src="{{图片URL}}" style="width:100%;border-radius:14px;margin-bottom:8px;"></span>
<section style="text-align:center;margin-bottom:20px;">
  <span style="font-size:13px;color:#5D6861;"><span leaf="">△ {{图片说明}}</span></span>
</section>
```

---

## 组件 10 结尾金句（居中衬线感 + 绿条）

```html
<section style="text-align:center;margin:40px 0 28px;">
  <p style="margin:0 0 14px;font-size:20px;font-weight:900;line-height:1.8;color:#1F2A22;">
    <span leaf="">信任不是一次给够的，</span><br>
    <span leaf="">是</span><span style="color:#41684F;"><span leaf="">一次一次交付攒出来的</span></span><span leaf="">。</span>
  </p>
  <span style="display:inline-block;width:48px;height:5px;background:#41684F;border-radius:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
</section>
```

---

## 组件 11 签名档

```html
<section style="text-align:center;padding:20px 0 0;">
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#1F2A22;"><span leaf="">作者名</span></p>
  <p style="margin:0;font-size:13px;color:#5D6861;line-height:1.8;">
    <span leaf="">▪️{{签名第一行}}</span><br>
    <span leaf="">▪️{{签名第二行}}</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FCFBF6;padding:40px 22px 36px;...">
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

**节奏铁律**：气泡必须左右交替；连续问答超过 4 组就插一段叙述或要点卡；要点卡每轮对话后最多一张；深绿气泡全篇视觉主体，蜜黄只做强调。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **对话层** | 左白气泡 / 右绿气泡 | 核心内容载体 | 全篇主体 |
| **叙述层** | 普通正文段 + 蜜黄荧光笔 | 过场、补充、评价 | 每 3-4 组气泡一段 |
| **收束层** | 要点卡（蜜黄底）/ 金句 | 每轮结论 | 每轮 1 张 |

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
| `# 标题` | 组件 3 大标题区 | 中轴 + 绿条 |
| `## 章节` | 组件 7 章节小标 | 居中细线式 |
| 对话原文 | 组件 4/5 气泡交替 | 说话人标签区分 |
| 普通段落 | 组件 6 叙述段 | 蜜黄标记关键句 |
| `> 引用/小结` | 组件 8 要点卡 | |
| `**加粗**` | 蜜黄荧光笔（叙述内）/ 浅金字（绿气泡内） | |
| `![](图片)` | 组件 9 | |
| 行内 `` `code` `` | `background:#EAF1EB;color:#2E4E3A` 等宽胶囊 | |
| ` ``` 代码块 ``` ` | 通用库 1a/1b | |
| `[text](url)` | 通用库 4a/4b（角标绿 `#41684F`） | |
| 文末 | 组件 10 金句 + 11 签名档 | |
