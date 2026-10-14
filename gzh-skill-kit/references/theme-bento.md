# 公众号排版组件库 —— 粉彩便当盒 Bento

> **使用说明**：本组件库为「粉彩便当盒」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：源自用户网站的 Bento 网格语言——**粉彩马卡龙浅底卡单列堆叠**。低饱和粉彩浅底（紫 `#F0EAFE`、蓝 `#EBF4FF`、薄荷 `#E0F6EF`、青 `#DFF6F9`、粉 `#FFE3F1`）+ 同色系深一档标题字 + 浅描边，奶油黄 `#FFF4D6` 做金句卡。每张卡顶部是等宽字体眉标（`✦ 01 · section/`，颜色随卡），卡内正文 16-17px/行高 2。**禁深色实底大块**。适合清单、工具测评、多模块干货合集。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class、`position:fixed/absolute`、`float`、`display:grid`
> - ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、`box-shadow`
>
> **WeChat 兼容铁律**：
> - 装饰性空元素（色点、短横线）内部放 `<span leaf=\"\"><br></span>`
> - 不在 `<strong>` 上打 font-size/border；同一 `<p>` 不混多个 font-size
> - 粉彩浅底卡内文字用同色系深字（见变量表），保证对比度 ≥4.5:1
> - 高亮 span 不跨行：荧光笔短语控制在 12 字以内，超长就只标核心词
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
页面底：        #FDFCF8（暖白）
墨色正文：      #2B2B33
卡内正文（通用）：#2B2B33（各卡用同色系深字变体，见下）
淡紫卡：        底 #F0EAFE / 描边 #E2D4FA / 标题字 #5B21B6 / 正文字 #3A2A58 / 眉标+圆点 #7C3AED
淡蓝卡：        底 #EBF4FF / 描边 #D6E6FC / 标题字 #1D4ED8 / 正文字 #283349 / 眉标+圆点 #2563EB
淡薄荷卡：      底 #E0F6EF / 描边 #C4ECDC / 标题字 #059669 / 正文字 #26413A / 眉标+圆点 #059669
淡青卡：        底 #DFF6F9 / 描边 #C2E9F0 / 标题字 #0E7490 / 正文字 #243E46 / 眉标+圆点 #0891B2
淡粉卡：        底 #FFE3F1 / 描边 #FBCFE0 / 标题字 #BE185D / 正文字 #542838 / 眉标+圆点 #DB2777
奶油黄金句卡：  底 #FFF4D6 / 描边 #F8E6B0 / 标题字 #92600A→#B45309 / 落款字 #A78A4E
荧光笔（白底区）：linear-gradient(transparent 60%, #FBD97C 60%)
次要文字：      #55506A
等宽眉标字体：  'SF Mono',Consolas,Monaco,monospace
标题字体：      -apple-system,'PingFang SC',sans-serif（900 重）
正文字号：      16-17px，line-height:2
```

色彩比例：暖白 75%、粉彩卡 20%（五色轮转）、奶油黄 5%（金句卡）。一张卡只用一种底色，不叠渐变；相邻两卡不同色。

---

## 组件 1 全局容器

```html
<section style=\"max-width:677px;margin:0 auto;background:#FDFCF8;padding:40px 24px 36px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#2B2B33;font-size:17px;line-height:2;overflow-x:hidden;\">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 顶部眉头（等宽字体）

```html
<section style=\"text-align:center;margin-bottom:16px;\">
  <span style=\"font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;font-weight:bold;letter-spacing:3px;color:#7C3AED;\"><span leaf=\"\">✦ MALIN STUDIO · WEEKLY</span></span>
</section>
```

---

## 组件 3 大标题区（左对齐）

```html
<section style=\"margin-bottom:32px;\">
  <p style=\"margin:0 0 10px;font-size:30px;font-weight:900;line-height:1.5;color:#2B2B33;word-break:normal;overflow-wrap:normal;\">
    <span leaf=\"\">这 5 个 AI 工具，</span><br>
    <span leaf=\"\">我每天都在用</span>
  </p>
  <p style=\"margin:0;font-size:16px;color:#55506A;line-height:1.8;\"><span leaf=\"\">副标题：一句说清这篇文章给什么人解决什么问题</span></p>
</section>
```

---

## 组件 4 眉标卡头（每张 Bento 卡的开头，颜色随卡）

```html
<section style=\"margin-bottom:10px;\">
  <span style=\"font-family:'SF Mono',Consolas,Monaco,monospace;font-size:12px;font-weight:bold;letter-spacing:2px;color:#2563EB;\"><span leaf=\"\">✦ 01 · tool-review/</span></span>
</section>
```

编号递增（00/01/02…），斜杠后是板块英文小名（如 `overview/`、`tool-review/`、`tips/`、`bonus/`）。眉标颜色用紧随其后的卡的主题色。

---

## 组件 5 淡紫卡（总述/结论卡）

```html
<section style=\"margin-bottom:14px;padding:26px 22px;background:#F0EAFE;border:1px solid #E2D4FA;border-radius:20px;\">
  <p style=\"margin:0 0 12px;font-size:19px;font-weight:900;color:#5B21B6;line-height:1.6;\"><span leaf=\"\">先说结论</span></p>
  <p style=\"margin:0;font-size:16px;line-height:2;color:#3A2A58;text-align:justify;\"><span leaf=\"\">总述正文。</span><span style=\"background:linear-gradient(transparent 60%, #F6DC8E 60%);font-weight:bold;padding:0 2px;\"><span leaf=\"\">核心短语用荧光笔</span></span><span leaf=\"\">，每卡 1 处。</span></p>
</section>
```

---

## 组件 6 淡蓝卡（内容主卡：一个工具/要点一张）

```html
<section style=\"margin-bottom:14px;padding:24px 22px;background:#EBF4FF;border:1px solid #D6E6FC;border-radius:20px;\">
  <p style=\"margin:0 0 10px;font-size:18px;font-weight:900;color:#1D4ED8;line-height:1.6;\"><span leaf=\"\">① 工具名 —— 一句话定位</span></p>
  <p style=\"margin:0 0 12px;font-size:16px;line-height:2;color:#283349;text-align:justify;\"><span leaf=\"\">正文：它解决什么问题，为什么值得用。</span><span style=\"background:linear-gradient(transparent 60%, #FBD97C 60%);font-weight:bold;padding:0 2px;\"><span leaf=\"\">关键短语</span></span><span leaf=\"\">。</span></p>
  <section style=\"margin-bottom:8px;\">
    <span style=\"display:inline-block;width:8px;height:8px;background:#2563EB;border-radius:50%;font-size:0;line-height:0;\"><span leaf=\"\"><br></span></span>
    <span style=\"font-size:16px;color:#2B2B33;\"><span leaf=\"\">适合：什么人/什么场景</span></span>
  </section>
  <section style=\"margin-bottom:0;\">
    <span style=\"display:inline-block;width:8px;height:8px;background:#2563EB;border-radius:50%;font-size:0;line-height:0;\"><span leaf=\"\"><br></span></span>
    <span style=\"font-size:16px;color:#2B2B33;\"><span leaf=\"\">坑：短板与不适用场景</span></span>
  </section>
</section>
```

把 `#EBF4FF/#D6E6FC/#1D4ED8/#283349/#2563EB` 整组替换成薄荷组（`#E0F6EF/#C4ECDC/#059669/#26413A/#059669`）或青组（`#DFF6F9/#C2E9F0/#0E7490/#243E46/#0891B2`）即得到同构的薄荷卡/青卡，**五色轮转用**。

---

## 组件 7 淡青提示卡（避坑/提示）

```html
<section style=\"margin-bottom:14px;padding:24px 22px;background:#DFF6F9;border:1px solid #C2E9F0;border-radius:20px;\">
  <p style=\"margin:0 0 10px;font-size:18px;font-weight:900;color:#0E7490;line-height:1.6;\"><span leaf=\"\">💡 一个共同的坑</span></p>
  <p style=\"margin:0;font-size:16px;line-height:2;color:#243E46;text-align:justify;\"><span leaf=\"\">提示正文，放跨工具的共性结论或避坑建议。</span></p>
</section>
```

---

## 组件 8 淡粉卡（彩蛋/福利/互动引导）

```html
<section style=\"margin-bottom:14px;padding:24px 22px;background:#FFE3F1;border:1px solid #FBCFE0;border-radius:20px;\">
  <p style=\"margin:0 0 10px;font-size:18px;font-weight:900;color:#BE185D;line-height:1.6;\"><span leaf=\"\">🌸 意外惊喜</span></p>
  <p style=\"margin:0;font-size:16px;line-height:2;color:#542838;text-align:justify;\"><span leaf=\"\">福利/彩蛋内容。每篇 1–2 张即可。</span></p>
</section>
```

---

## 组件 9 奶油黄金句卡（全宽压轴）

```html
<section style=\"margin:28px 0;padding:30px 24px;background:#FFF4D6;border:1px solid #F8E6B0;border-radius:20px;text-align:center;\">
  <p style=\"margin:0 0 10px;font-size:20px;font-weight:900;color:#92600A;line-height:1.8;\"><span leaf=\"\">金句第一行</span></p>
  <p style=\"margin:0 0 12px;font-size:20px;font-weight:900;color:#B45309;line-height:1.8;\"><span leaf=\"\">第二行深一档强调</span></p>
  <p style=\"margin:0;font-size:13px;color:#A78A4E;letter-spacing:2px;\"><span leaf=\"\">—— 出处 / 小注</span></p>
</section>
```

---

## 组件 10 卡内行内强调（荧光笔，不跨行）

```html
<span style=\"background:linear-gradient(transparent 60%, #FBD97C 60%);font-weight:bold;padding:0 2px;\"><span leaf=\"\">关键短语</span></span>
```

**铁律**：短语 ≤12 字、必须在同一行内（跨行会拖出空色条）。每卡 1 处，宁少勿多。

---

## 组件 11 卡内清单行（同色圆点）

```html
<section style=\"margin-bottom:8px;\">
  <span style=\"display:inline-block;width:8px;height:8px;background:#2563EB;border-radius:50%;font-size:0;line-height:0;\"><span leaf=\"\"><br></span></span>
  <span style=\"font-size:16px;color:#2B2B33;\"><span leaf=\"\">清单项内容</span></span>
</section>
```

圆点颜色随所在卡的主题色。

---

## 组件 12 图片卡（图 + 粉彩描边）

```html
<section style=\"margin-bottom:14px;padding:12px;background:#FDFCF8;border:1px solid #E2D4FA;border-radius:20px;\">
  <span leaf=\"\"><img src=\"{{图片URL}}\" style=\"width:100%;border-radius:12px;\"></span>
  <p style=\"margin:10px 0 0;text-align:center;font-size:13px;color:#55506A;\"><span leaf=\"\">△ {{图片说明}}</span></p>
</section>
```

---

## 组件 13 结尾互动卡（淡紫呼应开头）

```html
<section style=\"margin:24px 0 0;padding:24px 22px;background:#F0EAFE;border:1px solid #E2D4FA;border-radius:20px;text-align:center;\">
  <p style=\"margin:0 0 8px;font-size:17px;font-weight:900;color:#5B21B6;\"><span leaf=\"\">你怎么看？</span></p>
  <p style=\"margin:0;font-size:15px;line-height:2;color:#7C3AED;\"><span leaf=\"\">评论区聊聊，下期写一篇深度横评 🌸</span></p>
</section>
```

---

## 组件 14 签名档（双小卡 flex，便当格式）

```html
<section style=\"text-align:center;padding:24px 0 0;\">
  <p style=\"margin:0 0 4px;font-size:15px;font-weight:bold;color:#2B2B33;\"><span leaf=\"\">{{作者名/品牌名}}</span></p>
  <section style=\"display:flex;gap:10px;margin-top:10px;\">
    <section style=\"flex:1;background:#F0EAFE;border-radius:10px;padding:10px 8px;text-align:center;\">
      <p style=\"margin:0;font-size:12px;font-weight:bold;color:#5A3E8F;\"><span leaf=\"\">{{签名第一行，如：专注 AI 观察与知识干货}}</span></p>
    </section>
    <section style=\"flex:1;background:#FFE3F1;border-radius:10px;padding:10px 8px;text-align:center;\">
      <p style=\"margin:0;font-size:12px;font-weight:bold;color:#A13060;\"><span leaf=\"\">点赞 · 转发 · 推荐</span></p>
    </section>
  </section>
</section>
```

---

## 完整文章模板骨架

```html
<section style=\"max-width:677px;margin:0 auto;background:#FDFCF8;padding:40px 24px 36px;...\">
  <!-- 1. 顶部眉头（组件 2） -->
  <!-- 2. 大标题区（组件 3） -->
  <!-- 3. 淡紫总述卡（组件 4 眉标 + 组件 5） -->
  <!-- 4. 内容卡 ×N（组件 4 眉标 + 组件 6，五色轮转） -->
  <!-- 5. 淡青提示卡（组件 7）/ 图片卡（组件 12）穿插 -->
  <!-- 6. 奶油黄金句卡（组件 9，压轴） -->
  <!-- 7. 结尾互动卡（组件 13） -->
  <!-- 8. 签名档（组件 14） -->
</section>
```

**节奏铁律**：相邻两卡不同色；五色轮转但同一次出现的重复色间隔 ≥2 张卡；每张卡自带眉标（眉标在卡外、左对齐，颜色随卡）；奶油黄金句卡全篇唯一；荧光笔每卡 ≤1 处、不跨行。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **结构层** | 等宽眉标 `✦ 01 · xxx/`（随卡色） | 模块编号与节奏 | 每模块 1 个 |
| **内容层** | 粉彩浅底卡（五色轮转） | 每个工具/要点一卡 | 每卡一主题 |
| **强调层** | 蜜黄荧光笔 / 卡标题同色系深字 | 卡内关键短语 | 每卡 1 处 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组合 | 点缀 |
|---|---|---|
| 工具测评/清单 | 眉标 4 + 淡蓝/薄荷卡 6 ×N（五色轮转） | 淡青提示卡 7、图片卡 12 |
| 干货合集 | 淡紫卡 5 总述 + 内容卡 6 分述 | 奶油黄金句卡 9 |
| 教程 | 眉标 4 + 内容卡 6 + 清单行 11 | 淡青避坑卡 7 |
| 周报/栏目 | 眉头 2 + 内容卡 6 轮转 | 淡粉彩蛋卡 8 |

---

## Markdown → 粉彩便当盒 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 3 大标题区 | 左对齐 30px 900 重 |
| `## 章节标题` | 组件 4 眉标 + 卡标题 | 编号递增，斜杠英文板块名，眉标色随卡 |
| 每个工具/要点 | 一张卡（组件 6 五色轮转） | 相邻卡不同色 |
| `**加粗**` | 蜜黄荧光笔（组件 10） | 每卡 1 处、≤12 字、不跨行 |
| `- 列表项` | 组件 11 清单行 | 圆点随卡色 |
| `> 引用` | 组件 7 淡青提示卡 | |
| `![](图片)` | 组件 12 图片卡 | |
| 行内 `` `code` `` | `background:#F0EAFE;color:#5B21B6` 等宽胶囊 | |
| ` ``` 代码块 ``` ` | 通用库 1a/1b | |
| `[text](url)` | 通用库 4a/4b（角标紫 `#7C3AED`） | |
| 文末 | 组件 9 金句卡（可选）+ 13 互动卡 + 14 签名档 | |
