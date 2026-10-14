# 公众号排版组件库 —— 粉彩便当盒 Bento

> **使用说明**：本组件库为「粉彩便当盒」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：源自 mydesign-system components「Tip Header / 卡片分区」与用户网站的 Bento 网格语言——马卡龙色块卡单列堆叠。紫藤紫 `#71519B`（主）、淡金 `#F6DC8E`（强调）、玫红 `#B54070`（点缀）三种色块卡按"同色系深浅配对"轮转；每张卡顶部是等宽字体眉标（`✦ 01 · section/`），卡内正文 17px/行高 2。适合清单、工具测评、多模块干货合集。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class、`position:fixed/absolute`、`float`、`display:grid`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、`box-shadow`
>
> **WeChat 兼容铁律**：
> - 装饰性空元素（色点、短横线）内部放 `<span leaf=""><br></span>`
> - 不在 `<strong>` 上打 font-size/border；同一 `<p>` 不混多个 font-size
> - 深色卡（紫底）内文字用白色/浅紫，白卡内用墨色 `#241E2E`
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
页面底：        #FDFBF7（米白）
墨色正文：      #241E2E
次要文字：      #4E4759
辅助文字：      #6B6675
紫藤主色：      #71519B（深 #523776，浅 #9276B7）
紫浅底：        #F0EBF6（brand 8% 透明度同感）
淡金强调：      #F6DC8E / 淡金底 #FCF3D9
玫红点缀：      #B54070 / 玫红底 #F9E7EF
深紫面板：      #1B1626（金句卡底）
等宽眉标字体：  'SF Mono',Consolas,Monaco,monospace
标题字体：      -apple-system,'PingFang SC',sans-serif（900 重）
正文字号：      17px，line-height:2
```

三色比例：墨色 80%、紫 15%（眉标+紫卡）、金/玫红 5%（点缀卡与标签）。一张卡只用一种底色，不叠渐变。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FDFBF7;padding:40px 24px 36px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#241E2E;font-size:17px;line-height:2;overflow-x:hidden;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 顶部眉头（等宽字体 + 紫点）

```html
<section style="text-align:center;margin-bottom:16px;">
  <span style="font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;letter-spacing:3px;color:#71519B;"><span leaf="">✦ MALIN STUDIO · WEEKLY</span></span>
</section>
```

---

## 组件 3 大标题区（左对齐 + 金色下划块）

```html
<section style="margin-bottom:32px;">
  <p style="margin:0 0 10px;font-size:30px;font-weight:900;line-height:1.5;color:#241E2E;word-break:normal;overflow-wrap:normal;">
    <span leaf="">这 5 个 AI 工具，</span><br>
    <span leaf="">我每天都在用</span>
  </p>
  <section style="margin-bottom:14px;">
    <span style="display:inline-block;width:72px;height:8px;background:#F6DC8E;border-radius:4px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <p style="margin:0;font-size:16px;color:#4E4759;line-height:1.8;"><span leaf="">亲测三个月后的真实评价，含踩坑记录</span></p>
</section>
```

---

## 组件 4 紫色眉标卡头（每张 Bento 卡的开头，等宽字体）

```html
<section style="margin-bottom:10px;">
  <span style="font-family:'SF Mono',Consolas,Monaco,monospace;font-size:12px;letter-spacing:2px;color:#71519B;"><span leaf="">✦ 01 · tool-review/</span></span>
</section>
```

编号递增（01/02/03…），斜杠后是板块英文小名（如 `tool-review/`、`workflow/`、`tips/`）。

---

## 组件 5 紫卡（主卡：紫底白字）

```html
<section style="margin-bottom:14px;padding:26px 22px;background:#71519B;border-radius:20px;">
  <p style="margin:0 0 12px;font-size:19px;font-weight:900;color:#FFFFFF;line-height:1.6;"><span leaf="">卡片标题</span></p>
  <p style="margin:0;font-size:16px;line-height:2;color:#E8E1F2;text-align:justify;"><span leaf="">卡片正文。紫底卡每篇 1–2 张，用来放最核心的结论或总述。</span></p>
</section>
```

---

## 组件 6 白卡（信息卡：白底 + 细边 + 紫左饰）

```html
<section style="margin-bottom:14px;padding:24px 22px;background:#FEFDFB;border:1px solid rgba(113,81,155,0.18);border-radius:20px;box-shadow:0 3px 12px rgba(113,81,155,0.06);">
  <p style="margin:0 0 10px;font-size:18px;font-weight:900;color:#241E2E;line-height:1.6;"><span leaf="">白卡标题</span></p>
  <p style="margin:0;font-size:16px;line-height:2;color:#4E4759;text-align:justify;"><span leaf="">白卡正文。清单类内容的主卡型，一个工具/要点一张卡。</span></p>
</section>
```

---

## 组件 7 淡金卡（强调卡）

```html
<section style="margin-bottom:14px;padding:24px 22px;background:#FCF3D9;border-radius:20px;">
  <p style="margin:0 0 10px;font-size:18px;font-weight:900;color:#241E2E;line-height:1.6;"><span leaf="">💡 划重点</span></p>
  <p style="margin:0;font-size:16px;line-height:2;color:#241E2E;text-align:justify;"><span leaf="">淡金卡放结论、提醒、避坑信息。每篇 2–3 张，与白卡交替。</span></p>
</section>
```

---

## 组件 8 玫红卡（点缀卡）

```html
<section style="margin-bottom:14px;padding:24px 22px;background:#F9E7EF;border-radius:20px;">
  <p style="margin:0 0 10px;font-size:18px;font-weight:900;color:#873352;line-height:1.6;"><span leaf="">🌸 小彩蛋</span></p>
  <p style="margin:0;font-size:16px;line-height:2;color:#873352;text-align:justify;"><span leaf="">玫红卡放轻松内容、福利、互动引导。每篇 1–2 张即可。</span></p>
</section>
```

---

## 组件 9 深紫金句卡（全宽压轴）

```html
<section style="margin:28px 0;padding:30px 24px;background:#1B1626;border-radius:20px;text-align:center;">
  <p style="margin:0 0 10px;font-size:20px;font-weight:900;color:#FFFFFF;line-height:1.8;"><span leaf="">金句正文第一行</span></p>
  <p style="margin:0 0 12px;font-size:20px;font-weight:900;color:#F6DC8E;line-height:1.8;"><span leaf="">第二行用淡金强调</span></p>
  <p style="margin:0;font-size:13px;color:#CBC5D2;letter-spacing:2px;"><span leaf="">—— 出处 / 小注</span></p>
</section>
```

---

## 组件 10 卡内行内强调

白卡内金色标记（模拟荧光笔）：

```html
<span style="background:linear-gradient(transparent 60%, #F6DC8E 60%);font-weight:bold;padding:0 2px;"><span leaf="">关键短语</span></span>
```

紫卡内（深底）浅金标记：

```html
<span style="color:#F6DC8E;font-weight:bold;"><span leaf="">关键短语</span></span>
```

---

## 组件 11 卡内清单行（白卡里用）

```html
<section style="margin-bottom:8px;">
  <span style="display:inline-block;width:8px;height:8px;background:#71519B;border-radius:50%;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  <span style="font-size:16px;color:#241E2E;"><span leaf="">清单项内容</span></span>
</section>
```

---

## 组件 12 图片卡（图 + 白卡边框）

```html
<section style="margin-bottom:14px;padding:12px;background:#FEFDFB;border:1px solid rgba(113,81,155,0.18);border-radius:20px;">
  <span leaf=""><img src="{{图片URL}}" style="width:100%;border-radius:12px;"></span>
  <p style="margin:10px 0 0;text-align:center;font-size:13px;color:#6B6675;"><span leaf="">△ {{图片说明}}</span></p>
</section>
```

---

## 组件 13 结尾互动卡（玫红卡变体）

```html
<section style="margin:24px 0 0;padding:24px 22px;background:#F9E7EF;border-radius:20px;text-align:center;">
  <p style="margin:0 0 8px;font-size:17px;font-weight:900;color:#873352;"><span leaf="">你最常用哪个工具？</span></p>
  <p style="margin:0;font-size:15px;line-height:2;color:#873352;"><span leaf="">评论区聊聊，下期写一篇深度横评 🌸</span></p>
</section>
```

---

## 组件 14 签名档

```html
<section style="text-align:center;padding:24px 0 0;">
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#241E2E;"><span leaf="">作者名</span></p>
  <p style="margin:0;font-size:13px;color:#6B6675;line-height:1.8;">
    <span leaf="">▪️{{签名第一行}}</span><br>
    <span leaf="">▪️{{签名第二行}}</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FDFBF7;padding:40px 24px 36px;...">
  <!-- 1. 顶部眉头（组件 2） -->
  <!-- 2. 大标题区（组件 3） -->
  <!-- 3. 紫色总述卡（组件 4 眉标 + 组件 5） -->
  <!-- 4. 白卡 ×N 交替淡金卡（组件 4 眉标 + 组件 6/7） -->
  <!-- 5. 图片卡穿插（组件 12） -->
  <!-- 6. 深紫金句卡（组件 9，压轴） -->
  <!-- 7. 结尾互动卡（组件 13） -->
  <!-- 8. 签名档（组件 14） -->
</section>
```

**节奏铁律**：紫卡 ≤2、玫红卡 ≤2、淡金卡 ≤3，其余白卡；相邻两卡不同色；每张卡自带眉标（眉标在卡外、左对齐）；深紫金句卡全篇唯一。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **结构层** | 等宽眉标 `✦ 01 · xxx/` | 模块编号与节奏 | 每模块 1 个 |
| **内容层** | 色块卡（紫/白/金/玫红轮转） | 每个工具/要点一卡 | 每卡一主题 |
| **强调层** | 金色荧光笔 / 浅金字 / 玫红标签 | 卡内关键短语 | 每卡 1–2 处 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组合 | 点缀 |
|---|---|---|
| 工具测评/清单 | 眉标 4 + 白卡 6 ×N + 淡金卡 7 | 图片卡 12、互动卡 13 |
| 干货合集 | 紫卡 5 总述 + 白卡 6 分述 | 深紫金句卡 9 |
| 教程 | 眉标 4 + 白卡 6 + 清单行 11 | 淡金避坑卡 7 |
| 周报/栏目 | 眉头 2 + 白卡 6 轮转 | 玫红彩蛋卡 8 |

---

## Markdown → 粉彩便当盒 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 3 大标题区 | 左对齐 + 金色下划块 |
| `## 章节标题` | 组件 4 眉标 + 卡标题 | 编号递增，斜杠英文板块名 |
| 每个工具/要点 | 一张卡（6/5/7/8 轮转） | 相邻卡不同色 |
| `**加粗**` | 金色荧光笔 span（白卡内）/ 浅金字（紫卡内） | 每卡 1–2 处 |
| `- 列表项` | 组件 11 清单行 | 紫色圆点 |
| `> 引用` | 组件 7 淡金卡 | |
| `![](图片)` | 组件 12 图片卡 | |
| 行内 `` `code` `` | `background:#F0EBF6;color:#523776` 等宽胶囊 | |
| ` ``` 代码块 ``` ` | 通用库 1a/1b | |
| `[text](url)` | 通用库 4a/4b（角标紫 `#71519B`） | |
| 文末 | 组件 9 金句卡（可选）+ 13 互动卡 + 14 签名档 | |
