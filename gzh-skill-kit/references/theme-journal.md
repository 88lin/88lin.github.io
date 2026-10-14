# 公众号排版组件库 —— 珊瑚手账 Journal

> **使用说明**：本组件库为「珊瑚手账」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：手账拼贴风——纸感底 `#FEFAF5`、赤陶红 `#C33D46`（主）、蜜杏 `#F5B8B3`（强调）、松绿 `#2F6B5B`（反衬）。核心元素：**手写批注框**（虚线边框 + 倾斜标签）、**胶带贴纸**（斜贴在标题上的半透明色条）、**书卡**（books 组件直系：左封面右信息）。适合读书笔记、随笔、收藏分享、好物记录。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class、`position`、`float`、`transform:rotate`（微信编辑器会剥掉 rotate，倾斜效果用预斜字体风格替代——所以"手写感"靠字体与不对称，不靠 transform）
> - ✅ 支持内联 `style`、`border-radius`、`dashed` 边框（仅限素材占位/批注框）
>
> **WeChat 兼容铁律**：
> - 装饰性空元素（胶带、圆点）内部放 `<span leaf=""><br></span>`
> - 虚线框只用于批注框/素材占位（lint 允许场景），正文强调不用虚线
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
纸感底：        #FEFAF5
墨色正文：      #1F2226
次要文字：      #4A4A52
辅助文字：      #8A8A92
赤陶主色：      #C33D46（深 #9E2E38，浅 #D46E74）
蜜杏强调：      #F5B8B3 / 蜜杏底 #FDF0E4
松绿反衬：      #2F6B5B / 松绿底 #E6F1ED
深面板：        #1F2226
虚线批注框：    1.5px dashed #D46E74
正文字号：      17px，line-height:2
书卡作者行：    #5F4449（书卡内「作者 / 出版社」行）
玫瑰点缀：      #A13060（手账完贴纸字）/ #E8B4B8 / #B98A90（胶带浅玫瑰变体）
暖褐辅助：      #4A3439 / #8A7A80（批注与次要字）
```

三色比例：墨色 80%、赤陶 12%（标题/胶带/批注）、蜜杏+松绿 8%（书卡与标签交替）。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FEFAF5;padding:40px 26px 36px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#1F2226;font-size:17px;line-height:2;overflow-x:hidden;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 顶部题头（日期式 + 胶带）

```html
<section style="text-align:center;margin-bottom:24px;">
  <span style="font-size:13px;letter-spacing:3px;color:#8A8A92;"><span leaf="">🗓 十月十五日 · 晴 · 手账第 42 页</span></span>
</section>
```

---

## 组件 3 大标题（左对齐 + 斜贴胶带条）

```html
<section style="margin-bottom:32px;">
  <section style="margin-bottom:14px;">
    <span style="display:inline-block;width:96px;height:14px;background:rgba(242,147,140,0.45);border-radius:2px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <p style="margin:0 0 8px;font-size:28px;font-weight:900;line-height:1.6;color:#1F2226;word-break:normal;overflow-wrap:normal;">
    <span leaf="">最近在重读的</span><br>
    <span leaf="">5 本旧书</span>
  </p>
  <p style="margin:0;font-size:15px;color:#4A4A52;line-height:1.9;"><span leaf="">书还是那些书，读书的人换了几茬想法</span></p>
</section>
```

胶带条位置在标题左上方（视觉上像贴纸斜贴，微信不支持 rotate，用不规则圆角 `border-radius:2px 10px 2px 10px` 模拟手撕胶带感）：

```html
<span style="display:inline-block;width:96px;height:14px;background:rgba(242,147,140,0.45);border-radius:2px 10px 2px 10px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
```

---

## 组件 4 手写批注框（虚线 + 「批注：」标签）

```html
<section style="margin:24px 0;padding:18px 18px 14px;border:1.5px dashed #D46E74;border-radius:6px;background:transparent;">
  <span style="display:inline-block;font-size:12px;font-weight:bold;letter-spacing:2px;color:#D46E74;margin-bottom:6px;"><span leaf="">✎ 批注</span></span>
  <p style="margin:0;font-size:15px;line-height:2;color:#9E2E38;"><span leaf="">手写感短批注，一两句话，像写在页边的铅笔字。</span></p>
</section>
```

---

## 组件 5 正文段（赤陶荧光笔）

```html
<p style="margin:0 0 18px;font-size:17px;line-height:2;color:#1F2226;text-align:justify;">
  <span leaf="">重读《置身事内》，第一次读是看热闹，这一次终于看懂了门道。</span>
  <span style="background:linear-gradient(transparent 60%, #F5B8B3 60%);font-weight:bold;padding:0 2px;"><span leaf="">书没变，是读者的处境变了。</span></span>
</p>
```

---

## 组件 6 书卡（左封面右信息）

```html
<section style="margin:22px 0;padding:18px;background:#FEFCFA;border:1px solid rgba(31,34,38,0.10);border-radius:14px;box-shadow:0 3px 10px rgba(31,34,38,0.06);">
  <section style="display:flex;align-items:stretch;">
    <section style="flex-shrink:0;width:86px;min-height:118px;border-radius:6px;margin-right:16px;overflow:hidden;"><span leaf=""><img src="{{封面URL}}" style="width:86px;height:118px;object-fit:cover;display:block;"></span></section>
    <section style="flex:1;">
      <p style="margin:2px 0 6px;font-size:17px;font-weight:900;color:#1F2226;"><span leaf="">《书名》</span></p>
      <p style="margin:0 0 4px;font-size:13px;color:#8A8A92;"><span leaf="">作者 / 出版社</span></p>
      <p style="margin:0;font-size:14px;line-height:1.9;color:#4A4A52;text-align:justify;"><span leaf="">一句话推荐语，控制在两行内。</span></p>
    </section>
  </section>
</section>
```

无封面图时用纯色封面占位（替换第一个子 section 的内容）：

```html
<section style="flex-shrink:0;width:86px;min-height:118px;background:#2F6B5B;border-radius:6px;margin-right:16px;color:#FFFFFF;display:flex;align-items:center;justify-content:center;text-align:center;font-size:15px;font-weight:bold;"><span leaf="">书名</span></section>
```

---

## 组件 7 摘录卡（深底 + 蜜杏字，书摘专用）

```html
<section style="margin:24px 0;padding:24px 22px;background:#FFE3F1;border:1px solid #FBCFE0;border-radius:14px;">
  <p style="margin:0 0 10px;font-size:16px;line-height:2;color:#83314E;text-align:justify;"><span leaf="">「摘录原文，可以长一些。」</span></p>
  <p style="margin:0;font-size:13px;color:#BE185D;text-align:right;"><span leaf="">——《书名》第 X 页</span></p>
</section>
```

---

## 组件 8 松绿小结框（与赤陶反衬）

```html
<section style="margin:24px 0;padding:18px 20px;background:#E6F1ED;border-radius:12px;">
  <p style="margin:0;font-size:15px;line-height:2;color:#215044;text-align:justify;"><span leaf="">🌿 小结：这一章的收获压成两句话。松绿框与赤陶主色形成冷暖反衬，全篇 2-3 张。</span></p>
</section>
```

---

## 组件 9 清单行（手账打勾风）

```html
<section style="margin-bottom:8px;">
  <span style="font-size:15px;color:#2F6B5B;font-weight:bold;"><span leaf="">☑</span></span>
  <span style="font-size:16px;color:#1F2226;"><span leaf="">清单项内容</span></span>
</section>
```

未完成项用 `☐` + 灰色字。

---

## 组件 10 图片（拍立得风：白框 + 大圆角）

```html
<section style="margin:24px 0;text-align:center;">
  <section style="display:inline-block;padding:10px 10px 30px;background:#FFFFFF;border:1px solid rgba(31,34,38,0.08);border-radius:4px;box-shadow:0 4px 14px rgba(31,34,38,0.10);">
    <span leaf=""><img src="{{图片URL}}" style="width:100%;max-width:280px;border-radius:2px;"></span>
    <p style="margin:8px 0 0;font-size:12px;color:#8A8A92;"><span leaf="">{{图片说明}}</span></p>
  </section>
</section>
```

---

## 组件 11 结尾（胶带 + 日期收尾）

```html
<section style="text-align:center;margin:40px 0 0;">
  <span style="display:inline-block;width:72px;height:12px;background:rgba(242,147,140,0.45);border-radius:2px 10px 2px 10px;font-size:0;line-height:0;margin-bottom:14px;"><span leaf=""><br></span></span>
  <p style="margin:0;font-size:16px;font-weight:900;color:#1F2226;line-height:1.8;"><span leaf="">今天先记到这里。</span></p>
  <p style="margin:6px 0 0;font-size:13px;color:#8A8A92;letter-spacing:2px;"><span leaf="">—— 手账第 42 页 · 完</span></p>
</section>
```

---

## 组件 12 签名档

```html
<section style="text-align:center;padding:20px 0 0;">
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#1F2226;"><span leaf="">作者名</span></p>
  <p style="margin:0;font-size:13px;color:#8A8A92;line-height:1.8;">
    <span leaf="">▪️{{签名第一行}}</span><br>
    <span leaf="">▪️{{签名第二行}}</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FEFAF5;padding:40px 26px 36px;...">
  <!-- 1. 题头日期（组件 2） -->
  <!-- 2. 大标题 + 胶带（组件 3） -->
  <!-- 3. 正文段（组件 5） -->
  <!-- 4. 批注框（组件 4，穿插 2-4 个） -->
  <!-- 5. 书卡（组件 6）+ 摘录卡（组件 7）交替 -->
  <!-- 6. 松绿小结框（组件 8，2-3 张） -->
  <!-- 7. 清单（组件 9，可选） -->
  <!-- 8. 拍立得图（组件 10，可选） -->
  <!-- 9. 结尾（组件 11） -->
  <!-- 10. 签名档（组件 12） -->
</section>
```

**节奏铁律**：批注框全篇 2-4 个；书卡与摘录卡成对出现（书卡→摘录卡）；松绿小结框 2-3 张分隔大段落；胶带只在标题与结尾各一次。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **主体层** | 书卡 / 摘录卡 | 每本书一个单元 | 主体 |
| **批注层** | 虚线批注框 / 赤陶荧光笔 | 随感、划线 | 每节 1-2 处 |
| **反衬层** | 松绿小结框 / 胶带 / 拍立得 | 分段呼吸 | 每 2-3 节 |

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
| 行内 `` `code` `` | `background:#FDF0E4;color:#9E2E38` 等宽胶囊 | |
| ` ``` 代码块 ``` ` | 通用库 1a/1b | |
| `[text](url)` | 通用库 4a/4b（角标赤陶 `#C33D46`） | |
| 文末 | 组件 11 结尾 + 12 签名档 | |
