# 公众号排版组件库 —— 珊瑚手账 Journal

> **使用说明**：本组件库为「珊瑚手账」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：柔粉手账风——纸感底 `#FFF8FB`、赤陶红 `#E0567C`（主）、蜜杏 `#FFD3E2`（强调）、松绿 `#3FA98C`（反衬）。核心元素：**手写批注框**（虚线边框 + 倾斜标签）、**胶带贴纸**（斜贴在标题上的半透明色条）、**书卡**（books 组件直系：左封面右信息）。适合读书笔记、随笔、收藏分享、好物记录。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class、`position`、`float`、`transform:rotate`（微信编辑器会剥掉 rotate，倾斜效果用预斜字体风格替代——所以"手写感"靠字体与不对称，不靠 transform）
> - **外层底色会被剥离**：公众号编辑器会剥掉最外层 `<section>` 的 `background`（纯色/渐变都可能丢）。页面底色不要只放顶层容器——每个正文区块（章节卡、分割装饰、签名区、互动区）都要各自带 `background` 或等价底色，确保外层被剥掉后任一区块都不是裸内容
> - ✅ 支持内联 `style`、`border-radius`、`dashed` 边框（仅限素材占位/批注框）
>
> **WeChat 兼容铁律**：
> - 装饰性空元素（胶带、圆点）内部放 `<span leaf=""><br></span>`
> - 虚线框只用于批注框/素材占位（lint 允许场景），正文强调不用虚线
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
纸感底：        #FFF8FB
墨色正文：      #2A2233
次要文字：      #554A63
辅助文字：      #9A8AA6
玫粉主色：      #E0567C（深 #A83A63，浅 #EE8FB0）
薰衣草强调：      #FFD3E2 / 薰衣草底 #FDEAF2
薄荷反衬：      #3FA98C / 松绿底 #E6FBF4
深面板：        #2A2233
虚线批注框：    1.5px dashed #EE8FB0
正文下划线（theme-index 权威值）：background:linear-gradient(transparent 60%, #FFD3E2 60%);font-weight:bold;
正文字号：      17px，line-height:2
书卡作者行：    #7A4A62（书卡内「作者 / 出版社」行）
薰衣草点缀：      #8B5FC9（手账完贴纸字）/ #E8B4B8 / #C0A6CF（胶带浅玫瑰变体）
紫色辅助：      #5B4A6B / #9A8AA6（批注与次要字）
浅粉摘录卡：    底 #FFEAF3 / 描边 #F8D4E2 / 正文 #7A3654 / 落款 #B23A72
薄荷小结框：    字 #1F6B57
卡片底（浅）：  #FFFFFF
中性/补充色：   #FFFFFF
```

三色比例：粉白 78%、玫粉 14%（标题/胶带/批注）、薰衣草+薄荷 8%（书卡与标签交替）。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FFF8FB;padding:40px 26px 36px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#2A2233;font-size:17px;line-height:2;overflow-x:hidden;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 顶部题头（日期式 + 胶带）

```html
<section style="text-align:center;margin-bottom:24px;background-color:#FFF8FB;">
  <span style="font-size:13px;letter-spacing:3px;color:#9A8AA6;"><span leaf="">🗓 十月十五日 · 晴 · 手账第 42 页</span></span>
</section>
```

---

## 组件 3 大标题（左对齐 + 斜贴胶带条）

```html
<section style="margin-bottom:32px;background-color:#FFF8FB;">
  <section style="margin-bottom:14px;">
    <span style="display:inline-block;width:96px;height:14px;background:rgba(224,86,124,0.30);border-radius:12px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <p style="margin:0 0 8px;font-size:28px;font-weight:900;line-height:1.6;color:#2A2233;word-break:normal;overflow-wrap:normal;">
    <span leaf="">最近在重读的</span><br>
    <span leaf="">5 本旧书</span>
  </p>
  <p style="margin:0;font-size:15px;color:#554A63;line-height:1.9;"><span leaf="">书还是那些书，读书的人换了几茬想法</span></p>
</section>
```

胶带条位置在标题左上方（视觉上像贴纸斜贴，微信不支持 rotate，用不规则圆角 `border-radius:18px 20px 12px 20px` 模拟手撕胶带感）：

```html
<span style="display:inline-block;width:96px;height:14px;background:rgba(224,86,124,0.30);border-radius:18px 20px 12px 20px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
```

---

## 组件 4 手写批注框（虚线 + 「批注：」标签）

```html
<section style="margin:24px 0;padding:18px 18px 14px;border:1.5px dashed #EE8FB0;border-radius:16px;background:transparent;background-color:#FFF8FB;">
  <span style="display:inline-block;font-size:12px;font-weight:bold;letter-spacing:2px;color:#EE8FB0;margin-bottom:6px;"><span leaf="">✎ 批注</span></span>
  <p style="margin:0;font-size:15px;line-height:2;color:#A83A63;"><span leaf="">手写感短批注，一两句话，像写在页边的铅笔字。</span></p>
</section>
```

---

## 组件 5 正文段（粉色贴纸高亮）

```html
<p style="margin:0 0 18px;font-size:17px;line-height:2;color:#2A2233;text-align:justify;background-color:#FFF8FB;">
  <span leaf="">重读《置身事内》，第一次读是看热闹，这一次终于看懂了门道。</span>
  <span style="background:linear-gradient(transparent 60%, #FFD3E2 60%);font-weight:bold;padding:0 2px;"><span leaf="">书没变，是读者的处境变了。</span></span>
</p>
```

---

## 组件 6 书卡（左封面右信息）

```html
<section style="margin:22px 0;padding:18px;background:#FFFFFF;border:1px solid rgba(31,34,38,0.10);border-radius:20px;box-shadow:0 3px 10px rgba(31,34,38,0.06);">
  <section style="display:flex;align-items:stretch;">
    <section style="flex-shrink:0;width:86px;min-height:118px;border-radius:16px;margin-right:16px;overflow:hidden;"><span leaf=""><img src="{{封面URL}}" style="width:86px;height:118px;object-fit:cover;display:block;"></span></section>
    <section style="flex:1;">
      <p style="margin:2px 0 6px;font-size:17px;font-weight:900;color:#2A2233;"><span leaf="">《书名》</span></p>
      <p style="margin:0 0 4px;font-size:13px;color:#9A8AA6;"><span leaf="">作者 / 出版社</span></p>
      <p style="margin:0;font-size:14px;line-height:1.9;color:#554A63;text-align:justify;"><span leaf="">一句话推荐语，控制在两行内。</span></p>
    </section>
  </section>
</section>
```

无封面图时用纯色封面占位（替换第一个子 section 的内容）：

```html
<section style="flex-shrink:0;width:86px;min-height:118px;background:#3FA98C;border-radius:16px;margin-right:16px;color:#FFFFFF;display:flex;align-items:center;justify-content:center;text-align:center;font-size:15px;font-weight:bold;"><span leaf="">书名</span></section>
```

---

## 组件 7 摘录卡（深底 + 蜜杏字，书摘专用）

```html
<section style="margin:24px 0;padding:24px 22px;background:#FFEAF3;border:1px solid #F8D4E2;border-radius:20px;">
  <p style="margin:0 0 10px;font-size:16px;line-height:2;color:#7A3654;text-align:justify;"><span leaf="">「摘录原文，可以长一些。」</span></p>
  <p style="margin:0;font-size:13px;color:#B23A72;text-align:right;"><span leaf="">——《书名》第 X 页</span></p>
</section>
```

---

## 组件 8 薄荷小结框（与玫粉反衬）

```html
<section style="margin:24px 0;padding:18px 20px;background:#E6FBF4;border-radius:18px;">
  <p style="margin:0;font-size:15px;line-height:2;color:#1F6B57;text-align:justify;"><span leaf="">🌿 小结：这一章的收获压成两句话。松绿框与玫粉主色形成冷暖反衬，全篇 2-3 张。</span></p>
</section>
```

---

## 组件 9 清单行（手账打勾风）

```html
<section style="margin-bottom:8px;background-color:#FFF8FB;">
  <span style="font-size:15px;color:#3FA98C;font-weight:bold;"><span leaf="">☑</span></span>
  <span style="font-size:16px;color:#2A2233;"><span leaf="">清单项内容</span></span>
</section>
```

未完成项用 `☐` + 灰色字。

---

## 组件 10 图片（拍立得风：白框 + 大圆角）

```html
<section style="margin:24px 0;text-align:center;background-color:#FFF8FB;">
  <section style="display:inline-block;padding:10px 10px 30px;background:#FFFFFF;border:1px solid rgba(31,34,38,0.08);border-radius:20px;box-shadow:0 4px 14px rgba(31,34,38,0.10);">
    <span leaf=""><img src="{{图片URL}}" style="width:100%;max-width:280px;border-radius:12px;"></span>
    <p style="margin:8px 0 0;font-size:12px;color:#9A8AA6;"><span leaf="">{{图片说明}}</span></p>
  </section>
</section>
```

---

## 组件 11 结尾（胶带 + 日期收尾）

```html
<section style="text-align:center;margin:40px 0 0;background-color:#FFF8FB;">
  <span style="display:inline-block;width:72px;height:12px;background:rgba(224,86,124,0.30);border-radius:18px 20px 12px 20px;font-size:0;line-height:0;margin-bottom:14px;"><span leaf=""><br></span></span>
  <p style="margin:0;font-size:16px;font-weight:900;color:#2A2233;line-height:1.8;"><span leaf="">今天先记到这里。</span></p>
  <p style="margin:6px 0 0;font-size:13px;color:#9A8AA6;letter-spacing:2px;"><span leaf="">—— 手账第 42 页 · 完</span></p>
</section>
```

---

## 组件 12 签名档

```html
<section style="text-align:center;padding:20px 0 0;background-color:#FFF8FB;">
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#2A2233;"><span leaf="">作者名</span></p>
  <p style="margin:0;font-size:13px;color:#9A8AA6;line-height:1.8;">
    <span leaf="">▪️{{签名第一行}}</span><br>
    <span leaf="">▪️{{签名第二行}}</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FFF8FB;padding:40px 26px 36px;...">
  <!-- 1. 题头日期（组件 2） -->
  <!-- 2. 大标题 + 胶带（组件 3） -->
  <!-- 3. 正文段（组件 5） -->
  <!-- 4. 批注框（组件 4，穿插 2-4 个） -->
  <!-- 5. 书卡（组件 6）+ 摘录卡（组件 7）交替 -->
  <!-- 6. 薄荷小结框（组件 8，2-3 张） -->
  <!-- 7. 清单（组件 9，可选） -->
  <!-- 8. 拍立得图（组件 10，可选） -->
  <!-- 9. 结尾（组件 11） -->
  <!-- 10. 签名档（组件 12） -->
</section>
```

**节奏铁律**：批注框全篇 2-4 个；书卡与摘录卡成对出现（书卡→摘录卡）；薄荷小结框 2-3 张分隔大段落；胶带只在标题与结尾各一次。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **主体层** | 书卡 / 摘录卡 | 每本书一个单元 | 主体 |
| **批注层** | 虚线批注框 / 粉色贴纸高亮 | 随感、划线 | 每节 1-2 处 |
| **反衬层** | 薄荷小结框 / 胶带 / 拍立得 | 分段呼吸 | 每 2-3 节 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组合 | 点缀 |
|---|---|---|
| 读书笔记 | 书卡 6 + 摘录卡 7 + 批注框 4 | 小结框 8 |
| 随笔 | 正文 5 + 批注框 4 | 拍立得 10、结尾 11 |
| 好物清单 | 清单 9 + 批注框 4 | 拍立得 10 |
| 收藏分享 | 书卡 6 变体卡 + 正文 5 | 小结框 8 |

---

## Markdown → 珊瑚手账 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 3 大标题 + 胶带 | |
| `## 章节` | 胶带色条 + 加粗小标 | 手账页感 |
| 每本书/物品 | 组件 6 书卡 | 左封面右信息 |
| 引用原文 | 组件 7 摘录卡 | 深底蜜杏字 |
| 随感/旁注 | 组件 4 批注框 | |
| `**加粗**` | 蜜杏荧光笔 span | |
| `- [x] 清单` | 组件 9 打勾清单 | |
| `![](图片)` | 组件 10 拍立得 | |
| 行内 `` `code` `` | `background:#FDEAF2;color:#A83A63` 等宽胶囊 | |
| ` ``` 代码块 ``` ` | 通用库 1a/1b | |
| `[text](url)` | 通用库 4a/4b（角标赤陶 `#E0567C`） | |
| 文末 | 组件 11 结尾 + 12 签名档 | |
