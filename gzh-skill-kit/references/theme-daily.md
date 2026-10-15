# 公众号排版组件库 —— 珊瑚日报 Daily（粉彩卡片流版）

> **使用说明**：本组件库为「珊瑚日报」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：彻底告别报纸 masthead 套路。新版是「**粉彩周报卡片流**」——日期胶囊开场 + 居中衬线大标题 + 六色马卡龙圆角横卡（薄荷/奶油/粉/蓝/青/紫轮转）+ 双栏小卡 + 居中珊瑚红金句 + 细边框页脚卡。每张卡 = 「栏目色标签 → 大黑标题 → 正文 + 反差色高亮」，颜色即栏目语义。
>
> **配色规则**：卡片底色为低饱和粉彩，卡片内标签字用**同色系深一档**，正文近黑；高亮色必须与卡底**形成反差**（薄荷卡用蜜黄高亮、奶黄卡用薄荷高亮、粉卡用青高亮、紫卡用蜜黄高亮）。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class、`position`、`float`、`display:grid`
> - ✅ 支持内联 `style`、`display:flex`（双栏小卡用）
>
> **WeChat 兼容铁律**：
> - 装饰性空元素内部放 `<span leaf=""><br></span>`
> - 双栏 flex 内每栏是独立 section，文字各自 `<span leaf="">` 包裹
> - 标题不打在 `<strong>` 上；结构化区域没内容时整块删掉

---

## 设计变量速查表

```
页面底：        #FEFAF5（奶油白）
正文近黑：      #1F2226
次要文字：      #5F4446（暖玫瑰灰，禁用纯灰）
珊瑚红主色：    #C33D46（胶囊/金句/页脚标题）
薄荷卡：        底 #E0F6EF / 标签 #215044
奶油卡：        底 #FEF2D3 / 标签 #7A5000
粉卡：          底 #FFE3F1 / 标签 #8F2050
蓝卡：          底 #EBF4FF / 标签 #2C5A8F
青卡：          底 #DFF6F9 / 标签 #1F6B78
紫卡：          底 #F0EAFE / 标签 #6A4BA1
高亮：          #FBD97C（蜜黄）/ #A7E8CD（薄荷）/ #DCCBFA（淡紫）——与卡底反差使用
圆角：          卡 14px / 双栏小卡 12px / 胶囊 999px
正文字号：      15-16px，line-height:1.95
页面补充色：    #4A3D60
页面补充色：    #5A4A30
页面补充色：    #5C3A4A
中性/补充色：   #3A4440 / #3F5560 / #4A5568 / #E8B4B8 / #FFFDF9
```

三色比例：粉彩卡底 70%、近黑正文 20%、珊瑚红点缀 10%。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FEFAF5;padding:44px 24px 40px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#1F2226;font-size:16px;line-height:1.9;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 开场（日期胶囊 + 居中大标题 + 导语）

```html
<section style="text-align:center;margin-bottom:36px;">
  <span style="display:inline-block;background:#C33D46;color:#FFFDF9;font-size:12px;letter-spacing:2px;padding:6px 18px;border-radius:999px;"><span leaf="">AI 周报 · 十月十五日</span></span>
  <h2 style="margin:18px 0 0;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:30px;font-weight:900;color:#1F2226;line-height:1.5;"><span leaf="">本周 AI 圈，</span><br><span leaf="">值得记住的 6 件事</span></h2>
  <p style="margin:14px 0 0;font-size:15px;line-height:2;color:#5F4446;"><span leaf="">导语放这里，一到两句，交代本期基调。</span></p>
</section>
```

---

## 组件 3 粉彩横卡（单条新闻，轮换底色）

```html
<section style="border-radius:14px;background:#E0F6EF;padding:22px 20px 20px;margin-bottom:18px;">
  <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#215044;letter-spacing:1px;"><span leaf="">🫧 模型 · 01</span></p>
  <p style="margin:0 0 10px;font-size:18px;font-weight:900;color:#1F2226;line-height:1.6;"><span leaf="">条目标题放这里</span></p>
  <p style="margin:0;font-size:15px;line-height:1.95;color:#3A4440;text-align:justify;"><span leaf="">正文放这里。</span><span style="background:linear-gradient(transparent 60%, #FBD97C 60%);font-weight:bold;"><span leaf="">高亮句（与卡底反差色）。</span></span></p>
</section>
```

底色轮换：薄荷 `#E0F6EF` → 奶油 `#FEF2D3` → 粉 `#FFE3F1` → 蓝 `#EBF4FF` → 青 `#DFF6F9` → 紫 `#F0EAFE`。标签色用对应深一档（见速查表）。

---

## 组件 4 双栏小卡（两条短讯并排）

```html
<section style="margin-bottom:18px;">
  <section style="display:flex;gap:12px;">
    <section style="flex:1;border-radius:12px;background:#EBF4FF;padding:18px 16px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#2C5A8F;letter-spacing:1px;"><span leaf="">⌨️ 工具 · 04</span></p>
      <p style="margin:0 0 6px;font-size:15px;font-weight:900;color:#1F2226;line-height:1.6;"><span leaf="">短讯标题</span></p>
      <p style="margin:0;font-size:13px;line-height:1.8;color:#4A5568;"><span leaf="">两行以内摘要，控制在 24~28 字。</span></p>
    </section>
    <section style="flex:1;border-radius:12px;background:#DFF6F9;padding:18px 16px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#1F6B78;letter-spacing:1px;"><span leaf="">📝 产品 · 05</span></p>
      <p style="margin:0 0 6px;font-size:15px;font-weight:900;color:#1F2226;line-height:1.6;"><span leaf="">短讯标题</span></p>
      <p style="margin:0;font-size:13px;line-height:1.8;color:#3F5560;"><span leaf="">两行以内摘要，保证左右等高。</span></p>
    </section>
  </section>
</section>
```

---

## 组件 5 收尾金句（珊瑚红衬线大字 + 短条）

```html
<section style="text-align:center;margin-bottom:30px;">
  <p style="margin:0 0 6px;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:20px;font-weight:900;color:#C33D46;line-height:1.7;"><span leaf="">每天 3 分钟</span><br><span leaf="">看懂 AI 圈</span></p>
  <section style="width:56px;height:4px;border-radius:2px;background:#C33D46;margin:14px auto 0;font-size:0;line-height:0;"><span leaf=""><br></span></section>
</section>
```

---

## 组件 6 页脚（珊瑚红细边框卡，禁用灰色小字）

```html
<section style="border:1.5px solid #E8B4B8;border-radius:14px;padding:22px 20px;text-align:center;background:#FFFDF9;">
  <p style="margin:0 0 6px;font-size:15px;font-weight:900;color:#C33D46;letter-spacing:2px;"><span leaf="">{{作者名/品牌名}}</span></p>
  <p style="margin:0 0 4px;font-size:13px;color:#5F4446;line-height:1.8;"><span leaf="">{{一句话简介}}</span></p>
  <p style="margin:0;font-size:13px;color:#8F2050;font-weight:bold;"><span leaf="">觉得有收获，欢迎点赞、转发、推荐</span></p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FEFAF5;padding:44px 24px 40px;...">
  <!-- 1. 开场胶囊 + 大标题（组件 2） -->
  <!-- 2. 粉彩横卡 ×3~4（组件 3，底色轮换） -->
  <!-- 3. 双栏小卡（组件 4，一组放两条短的） -->
  <!-- 4. 再来 1~2 张粉彩横卡（组件 3） -->
  <!-- 5. 收尾金句（组件 5） -->
  <!-- 6. 页脚卡（组件 6） -->
</section>
```

**节奏铁律**：开场只出现一次；横卡 5~6 张、双栏一组；每张卡只讲一件事；高亮每卡最多一处、只圈一句。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **开场层** | 红胶囊 + 衬线大标题 | 定调 | 全篇 1 次 |
| **卡片层** | 粉彩底 + 深色标签 + 大黑标题 | 信息主体 | 5~6 张 |
| **收束层** | 居中珊瑚红金句 + 边框页脚 | 品牌记忆 | 各 1 次 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组合 | 说明 |
|---|---|---|
| 周报盘点 | 开场 2 + 横卡 3 ×6 | 颜色按栏目固定映射 |
| 快讯合集 | 横卡 3 ×2 + 双栏 4 + 横卡 3 ×2 | 双栏放最短的两条 |
| 栏目型周刊 | 横卡 3 按栏目分组 | 组间可加空行 |

---

## Markdown → 珊瑚日报 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 2 开场 | 胶囊写日期/栏目 |
| `### 条目` | 组件 3 横卡 | 底色按栏目取色 |
| 短消息两条 | 组件 4 双栏 | 摘要 24~28 字 |
| `**加粗**` | 与卡底反差色高亮 span | 每卡限一处 |
| 行内 `` `code` `` | `background:#FEF2D3;color:#9E2E38` 等宽胶囊 | |
| ` ``` 代码块 ``` ` | 通用库 1a/1b | |
| `[text](url)` | 通用库 4a/4b（角标珊瑚红 `#C33D46`） | |
| 文末 | 组件 5 金句 + 6 页脚 | |
