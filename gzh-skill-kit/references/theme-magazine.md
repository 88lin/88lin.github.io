# 公众号排版组件库 —— 孔雀蓝超大衬线 Magazine

> **使用说明**：本组件库为「孔雀蓝超大衬线」主题，所有组件使用**内联样式**，可直接复制粘贴到微信公众号编辑器。
>
> **设计风格**：scene-wechat「叙事风」直系——超大斜体英文装饰词（60px 孔雀蓝 10% 透明）+ 26px 衬线粗标题 + 蜜桃色短条三件套开场；全文孔白底 `#FDFBF9`，孔雀蓝 `#15697C` 做 Info 强调、蜜桃 `#F5CDB4` 做荧光笔、赤陶红 `#B24935` 做标签。正文 18px/行高 2，段落间距用「呼吸空段」。适合深度长文、人物故事、行业观察。
>
> **与奶咖信纸（Letter）的区别**：Letter 是居中对称+三色条节奏，Magazine 是**左对齐编辑排版**——装饰词更大（60px vs 68px 但贯穿全篇每章）、标题衬线更收敛（26px）、章节用细线分隔而非色条、没有引言色块（引言直接做成首字下沉+斜体导语）。
>
> **公众号平台限制须知**：
> - ❌ 不支持 `<style>`/`<script>`、CSS class、`position:fixed/absolute`、`float`
> - ✅ 支持内联 `style`、`border-radius`、`linear-gradient`
>
> **WeChat 兼容铁律**：
> - 装饰性空元素（细线、短条）内部放 `<span leaf=""><br></span>`
> - 英文装饰词独占一行：`white-space:nowrap;word-break:keep-all;overflow-wrap:normal;`，10 字母以内 56–68px、11–14 字母 48–56px、15–18 字母 38–48px
> - 标题断行协议：中文标题超一行必须 `<br>` 显式断句
> - 结构化区域没有内容时整块删掉

---

## 设计变量速查表

```
页面底：        #FDFBF9（孔白）
墨色正文：      #1D2A2D
次要文字：      #2C4249
辅助文字：      #3A4E54
孔雀蓝主色：    #15697C（深 #0C4552，浅 #4EA2B5）
蜜桃强调：      #F5CDB4 / 蜜桃底 #FAE9DE
赤陶点缀：      #B24935 / 赤陶底 #F8E8E3
细线：          1px solid rgba(29,42,45,.15)
衬线标题：      Georgia,'Songti SC','Noto Serif SC',serif
正文字号：      18px，line-height:2
页面补充色：    #1D3A42
```

三色比例：墨色 85%、孔雀蓝 10%（装饰词+关键词+细线）、蜜桃/赤陶 5%。装饰词每章一个，全篇统一孔雀蓝 10% 透明。

---

## 组件 1 全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#FDFBF9;padding:44px 28px 40px;font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;color:#1D2A2D;font-size:18px;line-height:2;overflow-x:hidden;">
  <!-- 所有文章组件放在这里 -->
</section>
```

---

## 组件 2 顶部栏目标签（左对齐 + 细线延伸）

```html
<section style="margin-bottom:20px;">
  <span style="font-size:12px;font-weight:bold;letter-spacing:4px;color:#B24935;"><span leaf="">深度 · DEEP DIVE</span></span>
  <section style="margin-top:10px;border-bottom:1px solid rgba(29,42,45,.15);font-size:0;line-height:0;"><span leaf=""><br></span></section>
</section>
```

---

## 组件 3 特稿标题区（左对齐衬线大字）

```html
<section style="margin-bottom:36px;">
  <p style="margin:0 0 14px;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:31px;font-weight:900;color:#1D2A2D;line-height:1.55;word-break:normal;overflow-wrap:normal;">
    <span leaf="">一个县城女孩的</span><br>
    <span leaf="">AI 自学笔记</span>
  </p>
  <p style="margin:0 0 6px;font-size:16px;color:#2C4249;line-height:1.9;"><span leaf="">没有名校光环，没有大厂背景，她用 14 个月把自己变成了公司离不开的人</span></p>
  <p style="margin:0;font-size:13px;color:#3A4E54;letter-spacing:1px;"><span leaf="">文 / 茉灵智库 · 约 4200 字 · 阅读 11 分钟</span></p>
</section>
```

---

## 组件 4 斜体导语（衬线斜体 + 首行缩进感）

```html
<section style="margin-bottom:40px;">
  <p style="margin:0;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-style:italic;font-size:17px;line-height:2;color:#2C4249;text-align:justify;">
    <span leaf="">「这是我今年听过最野的一张成长路径：白天在县城超市理货，晚上跟着开源文档学 Agent。14 个月后，她给三家创业公司做自动化顾问。」</span>
  </p>
</section>
```

---

## 组件 5 章节头（超大装饰词 + 衬线标题 + 蜜桃短条）

```html
<section style="margin-bottom:48px;">
  <section style="margin-bottom:4px;overflow:visible;">
    <span style="display:inline-block;font-family:Georgia,'Songti SC',serif;font-style:italic;font-size:60px;font-weight:bold;color:rgba(21,105,124,0.10);line-height:1;white-space:nowrap;word-break:keep-all;overflow-wrap:normal;"><span leaf="">Origin</span></span>
  </section>
  <section style="margin-bottom:8px;">
    <span style="font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:26px;font-weight:900;color:#1D2A2D;"><span leaf="">起点：超市货架与开源文档</span></span>
  </section>
  <section style="margin-bottom:20px;">
    <span style="display:inline-block;width:52px;height:5px;background:#F5CDB4;border-radius:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
  </section>
  <!-- 本章正文 -->
</section>
```

---

## 组件 6 正文段（18px / 蜜桃荧光笔）

```html
<p style="margin:0 0 20px;font-size:18px;line-height:2;color:#1D2A2D;text-align:justify;">
  <span leaf="">她第一次听说 Agent 是在超市的夜班间隙。手机刷到一篇教程，看完只记住一句话：</span>
  <span style="background:linear-gradient(transparent 60%, #F5CDB4 60%);font-weight:bold;padding:0 2px;"><span leaf="">让 AI 替你做重复的事，把人留给判断。</span></span>
</p>
```

---

## 组件 7 人物引语卡（左细线 + 衬线斜体，不用色底）

```html
<section style="margin:26px 0;padding:6px 0 6px 20px;border-left:3px solid #15697C;">
  <p style="margin:0 0 6px;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-style:italic;font-size:17px;line-height:2;color:#0C4552;"><span leaf="">"别人问我怕不怕被 AI 取代。我说我是那个学会用 AI 的人，怕什么？"</span></p>
  <p style="margin:0;font-size:13px;color:#3A4E54;"><span leaf="">—— 受访者小鹿，自动化顾问</span></p>
</section>
```

---

## 组件 8 数据强调行（三个数字并排）

```html
<section style="margin:28px 0;text-align:center;">
  <section style="margin-bottom:8px;">
    <span style="font-family:Georgia,serif;font-size:34px;font-weight:900;color:#15697C;"><span leaf="">14</span></span>
    <span style="font-size:14px;color:#3A4E54;"><span leaf=""> 个月自学</span></span>
  </section>
  <section style="margin-bottom:8px;">
    <span style="font-family:Georgia,serif;font-size:34px;font-weight:900;color:#15697C;"><span leaf="">3</span></span>
    <span style="font-size:14px;color:#3A4E54;"><span leaf=""> 家付费客户</span></span>
  </section>
  <section>
    <span style="font-family:Georgia,serif;font-size:34px;font-weight:900;color:#15697C;"><span leaf="">0</span></span>
    <span style="font-size:14px;color:#3A4E54;"><span leaf=""> 元报班费用</span></span>
  </section>
</section>
```

纵向堆叠版（公众号 flex 不可靠，直接每行一组）。

---

## 组件 9 图片（直角压边 + 图注）

```html
<span leaf=""><img src="{{图片URL}}" style="width:100%;border-radius:10px;margin-bottom:8px;"></span>
<section style="text-align:center;margin-bottom:24px;">
  <span style="font-size:13px;color:#3A4E54;"><span leaf="">▲ {{图片说明}}</span></span>
</section>
```

---

## 组件 10 章节细线分隔（无色条版）

```html
<section style="margin:44px 0;border-bottom:1px solid rgba(29,42,45,.15);font-size:0;line-height:0;"><span leaf=""><br></span></section>
```

---

## 组件 11 赤陶标签卡（提醒/转折）

```html
<section style="margin:26px 0;padding:18px 20px;background:#F8E8E3;border-radius:12px;">
  <p style="margin:0;font-size:16px;line-height:2;color:#843426;text-align:justify;"><span leaf="">⚠️ 转折：她的第二条路并没有那么顺。第 5 个月，她接的第一单就翻车了——交付的东西客户完全用不起来。</span></p>
</section>
```

---

## 组件 12 结尾金句（居中衬线 + 孔雀蓝点睛）

```html
<section style="text-align:center;margin:44px 0 30px;">
  <p style="margin:0 0 14px;font-family:Georgia,'Songti SC','Noto Serif SC',serif;font-size:21px;font-weight:900;line-height:1.85;color:#1D2A2D;">
    <span leaf=""> gap 不吓人，</span><br>
    <span leaf="">吓人的是拿</span><span style="color:#15697C;"><span leaf="">"没准备好"</span></span><span leaf="">当借口。</span>
  </p>
  <span style="display:inline-block;width:44px;height:5px;background:#15697C;border-radius:3px;font-size:0;line-height:0;"><span leaf=""><br></span></span>
</section>
```

---

## 组件 13 签名档

```html
<section style="text-align:center;padding:20px 0 0;">
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#1D2A2D;"><span leaf="">作者名</span></p>
  <p style="margin:0;font-size:13px;color:#3A4E54;line-height:1.8;">
    <span leaf="">▪️{{签名第一行}}</span><br>
    <span leaf="">▪️{{签名第二行}}</span>
  </p>
</section>
```

---

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FDFBF9;padding:44px 28px 40px;...">
  <!-- 1. 栏目标签（组件 2） -->
  <!-- 2. 特稿标题（组件 3） -->
  <!-- 3. 斜体导语（组件 4） -->
  <!-- 4. 章节一（组件 5）+ 正文 6 + 引语 7 -->
  <!-- 5. 数据强调行（组件 8，可选） -->
  <!-- 6. 细线分隔（组件 10）→ 章节二…第N章（5-9 重复） -->
  <!-- 7. 赤陶标签卡（组件 11，转折处） -->
  <!-- 8. 结尾金句（组件 12） -->
  <!-- 9. 签名档（组件 13） -->
</section>
```

**节奏铁律**：每章一个装饰词（1-2 个单词，与主题相关）；引语卡 2-4 张穿插；细线分隔只在章节间（色条只出现在标题下）；金句/签名各一个。

---

## 视觉层级（3 层递进）

| 层级 | 样式 | 用途 | 频率 |
|------|------|------|------|
| **结构层** | 60px 装饰词 + 26px 衬线标题 | 章节骨架 | 每章 1 组 |
| **内容层** | 18px 正文 + 蜜桃荧光笔 | 叙事主体 | 每节 1-3 处标记 |
| **点缀层** | 引语卡 / 数据行 / 赤陶标签 | 现场感与节奏 | 每 2-3 节一个 |

---

## 文章类型 → 组件组合配方

| 文章类型 | 核心组合 | 点缀 |
|---|---|---|
| 人物故事 | 全套按模板骨架走 | 数据行 8 |
| 行业观察 | 标题 3 + 章节 5 + 正文 6 | 赤陶标签 11 |
| 深度复盘 | 导语 4 + 章节 5 | 引语卡 7 |
| 方法论长文 | 章节 5 + 数据行 8 | 金句 12 |

---

## Markdown → 孔雀蓝 Magazine 映射规则

| Markdown 元素 | 对应组件 | 说明 |
|---|---|---|
| `# 标题` | 组件 3 特稿标题区 | 左对齐衬线大字 |
| 文首引言 | 组件 4 斜体导语 | |
| `## 章节` | 组件 5 章节头 | 每章配英文装饰词 |
| 普通段落 | 组件 6 | 蜜桃荧光笔标记 |
| 人物原话/引用 | 组件 7 引语卡 | 左细线 |
| `> 提醒/转折` | 组件 11 赤陶标签卡 | |
| `---` | 组件 10 细线分隔 | |
| `![](图片)` | 组件 9 | |
| `**加粗**` | 蜜桃荧光笔 span | |
| 行内 `` `code` `` | `background:#FAE9DE;color:#0C4552` 等宽胶囊 | |
| ` ``` 代码块 ``` ` | 通用库 1a/1b | |
| `[text](url)` | 通用库 4a/4b（角标孔雀蓝 `#15697C`） | |
| 文末 | 组件 12 金句 + 13 签名档 | |
