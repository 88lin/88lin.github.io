# 公众号排版组件库 —— 莓果信笺

> 宋体标题、蝴蝶结线稿与行楷落款，在白纸与樱花粉之间留下舒展的阅读空间。以斜体大编号、圆角摘录与虚线便签构成一套完整的手账主题，适合读书笔记、观点长文和人文随笔。
>
> 预览：[手账版式总览](../docs/designs/berry-letter.html) · [复制阅读示例](../docs/examples/berry-letter-reading.html) · [标准试排文章](../docs/previews/berry-letter.html) · [全部组件](../assets/theme-previews/theme-berry-letter.html)。版式总览使用随附的开源子集字体；公众号正文仅使用本地字体回退。
>
> **设计约定**：这是既有公众号主题系统的一套新增手账主题，模式为 Read，延续已选定的宋体与蝴蝶结视觉方向。大编号、虚线框与大字引用保留 [mydesign-system](https://github.com/88lin/mydesign-system) 的结构启发；编号与标题分栏，卡片统一采用 12px 圆角。白底承载阅读，樱花粉用于卡片，莓果红用于标题和强调，正文使用深莓红，不引入黑、棕、灰、土黄。重点词只靠字重和颜色强调，不绘制行内色块和下划线。沿用项目的内联样式、leaf 包裹、独立底色、纯正文和预览分离协议。
>
> **使用边界**：封面使用 32px 宋体，这是已选定主题的封面专属例外；普通章节 23px、小节 19px、常规正文 16px / 2.1，大字摘录 23px。装饰编号与引号均为 70px，步骤页码 32px、原文数据 44px；这些组件的字级不扩展到普通段落。装饰编号和引号设置 aria-hidden，原文标题与引用完整保留。字体使用系统本地字体栈及回退，不加载额外字体文件。不使用布局表格、定位、class/id 或动态 SVG；蝴蝶结是自包含静态 SVG 线稿。桌面与手机均采用流式布局。

## 设计变量速查表

| 变量 | 值 | 用途 |
|---|---|---|
| 主色 | `#B9345A` | 莓果红标题与重点词 |
| 纸色 | `#FFFFFF` | 每个内容区块自带的清透白底 |
| 正文 | `#743449` | 主体阅读文字 |
| 次要文字 | `#A7546E` | 图注、署名、阅读线索 |
| 樱花粉 | `#F9E5EC` | 大字摘录、对照卡、图片外框与樱粉代码页，不能用于行内高亮 |
| 浅粉纸色 | `#FFF6F9` | 个人信纸与浅粉代码页，不能用于行内高亮 |
| 分隔色 | `#EBC3D1` | 封面、章节、书卡与页脚细线 |
| 深莓色 | `#A62C50` | 大字摘录、提醒标题、行内代码与深莓强调 |
| 樱粉线稿 | `#D76F8D` | 蝴蝶结装饰 |
| 装饰编号 | `#DC95AD` | 70px 浅粉斜体数字，与标题分列 |
| 装饰引号 | `#CA708C` | 70px 浅粉引号，独立排在引用正文上方 |
| 便签描边 | `#D68BA5` / `#E0A2B7` | 1px 粉色虚线，不用于行内文字 |
| 行楷落款 | `#B64B6C` | 原文短批注与手写落款 |
| 最大宽度 | `677px` | 公众号阅读容器 |
| 正文 | `16px / 2.1` | 33.6px 行距，长段落优先 |
| 标题 | `32px / 23px / 19px` | 封面专属字级、章节与小节的宋体层级 |
| 卡片圆角 | `12px` | 摘录、便签、书卡、对照、信纸、代码与图片外框 |
| 内容边距 | `26px` | 常规正文与章节左右留白；封面为 30px，摘录为 22px |

宋体字体栈：`'Noto Serif SC','Songti SC','STSong',SimSun,serif`，用于封面、章节、小节和摘录；行楷字体栈：`'STXingkai','STKaiti','KaiTi','Songti SC',serif`，用于手写落款、出处和个人信纸。正文使用苹果优先无衬线字体栈；装饰数字使用 Georgia。字体未安装时依次回退，正式正文不依赖设计预览中的额外字体文件。封面开放左对齐，章节以白底细线分隔；内容卡片统一为 12px 圆角。粉底摘录保留轻微阴影，其余组件以纸色、细边和留白区分。

**关键词强调唯一值**：`font-weight:700;color:#B9345A;`。主题索引沿用“正文下划线 CSS”这一列名，本主题将原稿的下划线标记转换为纯文字强调，不绘制线条。`**`、`++`、`<u>`、`==` 同样处理，避免一段出现多套强调样式；`~~` 使用深莓色加粗，不画删除线。

**手账组件层次**：大编号章节用于分章，大字摘录用于原文金句，樱粉便签用于独立批注或练习，藏书摘记用于书籍信息，粉白对照用于前后观点，行楷落款用于原有短批注。粉底与白底摘录、两种便签和代码页均是同一主题内的卡片内容样式。蝴蝶结只用于扉页和结尾。用不同内容角色带出版式变化，保留原文内容、顺序与图片。

**节奏**：常规正文与清单连续落在白色区块上，章节与正文相邻。大字摘录和白纸摘录合计最多两处；便签宜一至两处，行楷落款建议十二字以内，其余根据原文语义选择。正文中的照片用原图，不以装饰图替代用户内容。

**公众号实现**：大编号章节使用 flex 分栏，70px 斜体编号占用独立的 80px 宽列，与 23px 宋体标题间隔 11px，标题自然换行。70px 装饰引号、23px 宋体引用正文与 17px 行楷出处顺序排列；便签的 19px 宋体标题完整位于 1px 虚线框内。樱粉便签是本主题明确定义的四周虚线风格，适用项目 SKILL.md 中的主题例外，通用组件检查可出现 dashed WARN，但不得出现 ERROR。桌面和移动浏览器检查用于验证换行、间距与显示；这类检查不能证明真实微信粘贴后的效果，微信兼容性仍须以实际编辑器与客户端验证为准。

## 各组件完整 HTML

### 1. 全局书页（container）

整篇文章唯一外层容器。背景不承担内部区块的可读性。

```html
<section style="max-width:677px;margin:0 auto;background:#FFFFFF;color:#743449;font-family:-apple-system,BlinkMacSystemFont,&#x27;PingFang SC&#x27;,&#x27;Hiragino Sans GB&#x27;,&#x27;Microsoft YaHei&#x27;,sans-serif;font-size:16px;line-height:2.1;box-sizing:border-box;"><!-- 按下方骨架依次装入组件；各区块已有独立底色 --></section>
```

### 2. 蝴蝶结扉页（cover）

开放白底、左对齐宋体标题与静态蝴蝶结线稿，末尾用细粉线收束。32px、500 字重是已选定主题的封面专属例外，保留原文标题与自然换行。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding:37px 30px 24px;"><h1 style="margin:0;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:32px;font-weight:500;line-height:1.65;letter-spacing:-0.5px;text-wrap:balance;color:#B9345A;"><span leaf="">{{文章标题}}</span></h1><section style="display:flex;align-items:center;margin-top:25px;"><p style="margin:0;font-size:16px;line-height:2.1;font-size:13px;line-height:1.9;color:#A7546E;flex:1;min-width:0;"><span leaf="">{{副标题或一句导读}}</span></p><section style="width:82px;flex-shrink:0;margin-left:18px;"><svg width="82" height="57" viewBox="0 0 100 68" fill="none" aria-hidden="true" style="display:block;margin:0 auto;max-width:100%;"><path d="M49 31C32 4 8 8 10 25C12 42 34 37 49 31ZM51 31C64 3 91 7 90 23C89 41 66 37 51 31Z" stroke="#D76F8D" stroke-width="1.3"/><path d="M46 30C36 38 28 48 22 58L33 56L38 63C40 47 45 37 49 32M54 30C62 40 66 52 68 63L75 56L87 59C75 44 61 35 51 32" stroke="#D76F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="50" cy="31" rx="5" ry="4" stroke="#D76F8D" stroke-width="1.3"/></svg></section></section><p style="margin:0;font-size:16px;line-height:2.1;font-size:12px;color:#A7546E;margin-top:15px;"><span leaf="">{{作者名}}</span></p><section style="height:1px;background:#EBC3D1;margin:27px 0 0;font-size:0;line-height:0;"><span leaf=""></span><br></section></section>
```

### 3. 手记引言（intro）

20px 宋体与末尾细线，承接开场原文，不重复封面副标题。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:5px;padding-bottom:22px;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:20px;line-height:1.95;color:#B9345A;"><span leaf="">{{引言正文}}</span></p><section style="height:1px;background:#EBC3D1;margin:21px 0 0;font-size:0;line-height:0;"><span leaf=""></span><br></section></section>
```

### 4. 阅读线索（contents）

封面、引言之后；精选三个核心章节，保持原有先后顺序。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:14px;padding-bottom:20px;"><p style="margin:0;font-size:16px;line-height:2.1;font-size:13px;letter-spacing:1px;color:#A7546E;margin-bottom:10px;"><span leaf="">这一篇，一起读</span></p><section style="display:flex;padding:7px 0;"><span style="font-family:Georgia,serif;color:#B9345A;font-size:14px;width:28px;flex-shrink:0;"><span leaf="">01</span></span><p style="margin:0;font-size:16px;line-height:2.1;font-size:14px;color:#743449;line-height:1.65;"><span leaf="">{{精选章节一}}</span></p></section><section style="display:flex;padding:7px 0;"><span style="font-family:Georgia,serif;color:#B9345A;font-size:14px;width:28px;flex-shrink:0;"><span leaf="">02</span></span><p style="margin:0;font-size:16px;line-height:2.1;font-size:14px;color:#743449;line-height:1.65;"><span leaf="">{{精选章节二}}</span></p></section><section style="display:flex;padding:7px 0;"><span style="font-family:Georgia,serif;color:#B9345A;font-size:14px;width:28px;flex-shrink:0;"><span leaf="">03</span></span><p style="margin:0;font-size:16px;line-height:2.1;font-size:14px;color:#743449;line-height:1.65;"><span leaf="">{{精选章节三}}</span></p></section></section>
```

### 5. 大编号章节（chapter）

对应 ##；70px Georgia 斜体编号独占 80px 宽列，与 23px、600 字重宋体标题间隔 11px。为斜体边缘留出空间，白底与末尾细线建立层级。将示例 01 换为章节顺序；保留原文标题，装饰编号设置 aria-hidden。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding:31px 26px 20px;"><section style="display:flex;align-items:center;background:#FFFFFF;padding:0 0 23px;border-bottom:1px solid #EBC3D1;"><p style="margin:0 11px 0 0;width:80px;flex-shrink:0;font-family:Georgia,serif;font-size:70px;font-style:italic;font-weight:400;line-height:0.95;letter-spacing:-2px;color:#DC95AD;" aria-hidden="true"><span leaf="">01</span></p><h2 style="margin:0;flex:1;min-width:0;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:23px;line-height:1.65;font-weight:600;color:#B9345A;text-wrap:balance;"><span leaf="">{{章节标题}}</span></h2></section></section>
```

### 6. 宋体小节（subheading）

对应 ###；19px 宋体、600 字重，与正文共享左边线。带说明的独立小节可换为樱粉便签。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:16px;padding-bottom:8px;"><h3 style="margin:0;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:19px;line-height:1.8;color:#B9345A;font-weight:600;"><span leaf="">{{小节标题}}</span></h3></section>
```

### 7. 常规正文（paragraph）

16px 起，2.1 行高；独立白底，支持长段落。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:6px;padding-bottom:12px;"><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;text-align:justify;"><span leaf="">{{正文段落}}</span></p></section>
```

### 8. 主色加粗（strong）

行内组件；一篇最多五处强强调。

```html
<span style="color:#B9345A;font-weight:700;"><span leaf="">{{重点词}}</span></span>
```

### 9. 关键词强调（underline）

承接 ++ 或 u 标记，只用莓果红加粗；不画下划线，不加行内背景。

```html
<span style="font-weight:700;color:#B9345A;"><span leaf="">{{关键词}}</span></span>
```

### 10. 定义强调（highlight）

与关键词保持相同纯文字处理，不叠加高亮底色。

```html
<span style="font-weight:700;color:#B9345A;"><span leaf="">{{高亮词}}</span></span>
```

### 11. 深莓强调（marker）

对应 ~~ 标记，只换深莓色和字重，不加背景或删除线。

```html
<span style="font-weight:700;color:#A62C50;"><span leaf="">{{标记词}}</span></span>
```

### 12. 大字摘录（quote）

樱花粉底、12px 圆角与轻微阴影；70px 装饰引号、23px 宋体引用正文和 17px 行楷出处依次排列，引用字重为 500。摘录与正文按原文顺序衔接，一篇最多两处。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding:17px 22px 25px;"><section style="background:#F9E5EC;padding:22px 24px 26px;border-radius:12px;box-shadow:0 6px 16px rgba(156,59,94,0.045);"><p style="margin:3px 0 9px;font-family:Georgia,serif;font-size:70px;line-height:0.85;color:#CA708C;" aria-hidden="true"><span leaf="">“</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:23px;font-weight:500;line-height:1.9;color:#A62C50;"><span leaf="">{{引用正文}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;STXingkai&#x27;,&#x27;STKaiti&#x27;,&#x27;KaiTi&#x27;,&#x27;Songti SC&#x27;,serif;font-size:17px;color:#A34765;margin-top:20px;text-align:right;"><span leaf="">{{引用出处，可删}}</span></p></section></section>
```

### 13. 白纸摘录（quote-dark）

同一主题内的白底、细粉边与 12px 圆角摘录卡，字阶沿用大字摘录；两者合计最多两处，保留 quote-dark 标识以兼容组件分类。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding:17px 22px 25px;"><section style="background:#FFFFFF;padding:22px 24px 26px;border-radius:12px;border:1px solid #EBC3D1;"><p style="margin:3px 0 9px;font-family:Georgia,serif;font-size:70px;line-height:0.85;color:#CA708C;" aria-hidden="true"><span leaf="">“</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:23px;font-weight:500;line-height:1.9;color:#B9345A;"><span leaf="">{{核心金句}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;STXingkai&#x27;,&#x27;STKaiti&#x27;,&#x27;KaiTi&#x27;,&#x27;Songti SC&#x27;,serif;font-size:17px;color:#A34765;margin-top:20px;text-align:right;"><span leaf="">{{出处，可删}}</span></p></section></section>
```

### 14. 樱粉便签（note）

白底、四周 1px 粉色虚线与 12px 圆角；19px、600 字重宋体标题完整排在框内，用于练习、批注和案例说明。主题明确采用虚线风格，属于 SKILL.md 允许的主题例外；通用 lint 的 dashed WARN 可保留。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding:19px 24px 22px;"><section style="background:#FFFFFF;padding:22px 21px;border:1px dashed #D68BA5;border-radius:12px;"><h3 style="margin:0 0 12px;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:19px;font-weight:600;line-height:1.7;color:#B9345A;"><span leaf="">{{批注标题}}</span></h3><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;font-size:16px;line-height:1.95;"><span leaf="">{{补充说明}}</span></p></section></section>
```

### 15. 深莓提醒（notice）

樱粉便签的深莓色标题与浅粉描边样式，用于前提和提醒；标题排在框内，沿用 12px 圆角与四周虚线的主题例外。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding:19px 24px 22px;"><section style="background:#FFFFFF;padding:22px 21px;border:1px dashed #E0A2B7;border-radius:12px;"><h3 style="margin:0 0 12px;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:19px;font-weight:600;line-height:1.7;color:#A62C50;"><span leaf="">{{提醒标题}}</span></h3><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;font-size:16px;line-height:1.95;"><span leaf="">{{注意事项}}</span></p></section></section>
```

### 16. 条目清单（list）

无序列表；固定的小点列与流式文本列。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:8px;padding-bottom:4px;"><section style="display:flex;align-items:baseline;margin-bottom:11px;"><span style="width:23px;flex-shrink:0;color:#B9345A;font-size:22px;line-height:1.9;font-family:Georgia,serif;"><span leaf="">·</span></span><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;flex:1;min-width:0;"><span leaf="">{{条目一}}</span></p></section><section style="display:flex;align-items:baseline;margin-bottom:11px;"><span style="width:23px;flex-shrink:0;color:#B9345A;font-size:22px;line-height:1.9;font-family:Georgia,serif;"><span leaf="">·</span></span><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;flex:1;min-width:0;"><span leaf="">{{条目二}}</span></p></section><section style="display:flex;align-items:baseline;margin-bottom:11px;"><span style="width:23px;flex-shrink:0;color:#B9345A;font-size:22px;line-height:1.9;font-family:Georgia,serif;"><span leaf="">·</span></span><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;flex:1;min-width:0;"><span leaf="">{{条目三}}</span></p></section></section>
```

### 17. 顺序清单（ordered）

有序条目；保留原文顺序。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:8px;padding-bottom:4px;"><section style="display:flex;align-items:baseline;margin-bottom:11px;"><span style="width:23px;flex-shrink:0;color:#B9345A;font-size:15px;line-height:1.9;font-family:Georgia,serif;"><span leaf="">1</span></span><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;flex:1;min-width:0;"><span leaf="">{{第一项}}</span></p></section><section style="display:flex;align-items:baseline;margin-bottom:11px;"><span style="width:23px;flex-shrink:0;color:#B9345A;font-size:15px;line-height:1.9;font-family:Georgia,serif;"><span leaf="">2</span></span><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;flex:1;min-width:0;"><span leaf="">{{第二项}}</span></p></section><section style="display:flex;align-items:baseline;margin-bottom:11px;"><span style="width:23px;flex-shrink:0;color:#B9345A;font-size:15px;line-height:1.9;font-family:Georgia,serif;"><span leaf="">3</span></span><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;flex:1;min-width:0;"><span leaf="">{{第三项}}</span></p></section></section>
```

### 18. 待办页（checklist）

静态待办标记，不承诺点击交互。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:8px;padding-bottom:4px;"><section style="display:flex;align-items:baseline;margin-bottom:11px;"><span style="width:23px;flex-shrink:0;color:#B9345A;font-size:15px;line-height:1.9;font-family:Georgia,serif;"><span leaf="">□</span></span><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;flex:1;min-width:0;"><span leaf="">{{待办内容}}</span></p></section><section style="display:flex;align-items:baseline;margin-bottom:11px;"><span style="width:23px;flex-shrink:0;color:#B9345A;font-size:15px;line-height:1.9;font-family:Georgia,serif;"><span leaf="">□</span></span><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;flex:1;min-width:0;"><span leaf="">{{待办内容}}</span></p></section></section>
```

### 19. 页码步骤（steps）

32px 页码与正文并排，步骤在手机上纵向阅读；不是交互式时间线。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:0;padding-bottom:10px;"><section style="display:flex;padding:20px 0;border-bottom:1px solid #EBC3D1;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:Georgia,serif;font-size:32px;color:#B9345A;width:48px;flex-shrink:0;line-height:1.3;"><span leaf="">01</span></p><section style="flex:1;min-width:0;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;STXingkai&#x27;,&#x27;STKaiti&#x27;,&#x27;KaiTi&#x27;,&#x27;Songti SC&#x27;,serif;font-size:19px;font-weight:700;color:#B9345A;margin-bottom:7px;"><span leaf="">{{阶段一}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:16px;color:#743449;"><span leaf="">{{说明正文}}</span></p></section></section><section style="display:flex;padding:20px 0;border-bottom:1px solid #EBC3D1;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:Georgia,serif;font-size:32px;color:#B9345A;width:48px;flex-shrink:0;line-height:1.3;"><span leaf="">02</span></p><section style="flex:1;min-width:0;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;STXingkai&#x27;,&#x27;STKaiti&#x27;,&#x27;KaiTi&#x27;,&#x27;Songti SC&#x27;,serif;font-size:19px;font-weight:700;color:#B9345A;margin-bottom:7px;"><span leaf="">{{阶段二}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:16px;color:#743449;"><span leaf="">{{说明正文}}</span></p></section></section><section style="display:flex;padding:20px 0;border-bottom:1px solid #EBC3D1;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:Georgia,serif;font-size:32px;color:#B9345A;width:48px;flex-shrink:0;line-height:1.3;"><span leaf="">03</span></p><section style="flex:1;min-width:0;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;STXingkai&#x27;,&#x27;STKaiti&#x27;,&#x27;KaiTi&#x27;,&#x27;Songti SC&#x27;,serif;font-size:19px;font-weight:700;color:#B9345A;margin-bottom:7px;"><span leaf="">{{阶段三}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:16px;color:#743449;"><span leaf="">{{说明正文}}</span></p></section></section></section>
```

### 20. 粉白对照（compare）

樱花粉与白底两张纵向对照卡，采用宋体标题、细粉边与 12px 圆角；保留前后项原文，手机上不强行并排。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;"><section style="background:#F9E5EC;padding:22px;border:1px solid #EBC3D1;border-radius:12px;margin-bottom:14px;"><p style="margin:0;font-size:16px;line-height:2.1;font-size:19px;color:#B9345A;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-weight:600;margin-bottom:9px;"><span leaf="">{{前项标题}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:16px;color:#743449;"><span leaf="">{{前项正文}}</span></p></section><section style="background:#FFFFFF;padding:22px;border:1px solid #EBC3D1;border-radius:12px;margin-bottom:14px;"><p style="margin:0;font-size:16px;line-height:2.1;font-size:19px;color:#A62C50;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-weight:600;margin-bottom:9px;"><span leaf="">{{后项标题}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:16px;color:#743449;"><span leaf="">{{后项正文}}</span></p></section></section>
```

### 21. 藏书摘记（book-card）

白底细粉边、12px 圆角；23px 宋体书名、来源与读后感分层。只使用原文提供的真实书籍和观点，不补造评分。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding:14px 24px 20px;"><section style="background:#FFFFFF;border:1px solid #EBC3D1;border-radius:12px;padding:24px;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:23px;color:#B9345A;font-weight:600;"><span leaf="">{{书名}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:12px;color:#A7546E;margin-top:6px;"><span leaf="">{{作者或章节信息}}</span></p><section style="height:1px;background:#EBC3D1;margin:16px 0;font-size:0;line-height:0;"><span leaf=""></span><br></section><p style="margin:0;font-size:16px;line-height:2.1;font-size:16px;color:#743449;"><span leaf="">{{读后感或推荐理由}}</span></p></section></section>
```

### 22. 写给自己的信（letter-card）

浅粉底、12px 圆角与舒展行楷，用于作者原有的个人感想或结尾，不擅自补写文章。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding:15px 24px 22px;"><section style="background:#FFF6F9;padding:24px;border-radius:12px;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;STXingkai&#x27;,&#x27;STKaiti&#x27;,&#x27;KaiTi&#x27;,&#x27;Songti SC&#x27;,serif;font-size:21px;color:#A62C50;margin-bottom:12px;"><span leaf="">{{手记标题}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;STXingkai&#x27;,&#x27;STKaiti&#x27;,&#x27;KaiTi&#x27;,&#x27;Songti SC&#x27;,serif;font-size:19px;line-height:2;color:#743449;"><span leaf="">{{手记正文}}</span></p><section style="height:1px;background:#EBC3D1;margin:20px 0 0;font-size:0;line-height:0;"><span leaf=""></span><br></section></section></section>
```

### 23. 画页与题记（image）

与通用 2a 同源；图片外框采用樱花粉与 12px 圆角，相对路径按正文文件定位，图注独立。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;"><section style="background:#F9E5EC;padding:8px;border-radius:12px;"><img src="{{图片URL}}" alt="{{图片说明}}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></section><p style="margin:0;font-size:16px;line-height:2.1;font-size:12px;color:#A7546E;text-align:center;margin-top:10px;"><span leaf="">{{图片说明}}</span></p></section>
```

### 24. 待补画页（placeholder）

素材缺失时显示明确占位，不生成失效图片链接。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;"><section style="background:#F9E5EC;padding:36px 22px;text-align:center;border-radius:12px;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:20px;color:#B9345A;"><span leaf="">待补配图</span></p><section style="height:1px;background:#EBC3D1;margin:15px 30%;font-size:0;line-height:0;"><span leaf=""></span><br></section><p style="margin:0;font-size:16px;line-height:2.1;font-size:13px;color:#A34765;"><span leaf="">{{图片、录屏或视频说明}}</span></p></section></section>
```

### 25. 浅粉代码页（code-dark）

浅粉底、12px 圆角与深莓红代码文字；沿用通用代码块的每行一个 p 结构。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:12px;padding-bottom:18px;"><section style="background:#FFF6F9;padding:18px 17px;border-radius:12px;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;SF Mono&#x27;,Consolas,Monaco,monospace;font-size:13px;line-height:1.75;color:#743449;word-break:break-all;"><span leaf="">{{代码行一}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;SF Mono&#x27;,Consolas,Monaco,monospace;font-size:13px;line-height:1.75;color:#743449;word-break:break-all;"><span leaf="">　　{{代码行二}}</span></p></section></section>
```

### 26. 樱粉代码页（code-light）

樱花粉底、12px 圆角，适合短命令；等宽字体、全角缩进，语法高亮规则同通用库。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:12px;padding-bottom:18px;"><section style="background:#F9E5EC;padding:18px 17px;border-radius:12px;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;SF Mono&#x27;,Consolas,Monaco,monospace;font-size:13px;line-height:1.75;color:#743449;word-break:break-all;"><span leaf="">{{代码行一}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;SF Mono&#x27;,Consolas,Monaco,monospace;font-size:13px;line-height:1.75;color:#743449;word-break:break-all;"><span leaf="">　　{{代码行二}}</span></p></section></section>
```

### 27. 行内代码（inline-code）

只用于真实代码或文件名，不能用等宽字体装饰普通标题。

```html
<span style="color:#A62C50;font-family:&#x27;SF Mono&#x27;,Consolas,Monaco,monospace;font-size:14px;"><span leaf="">{{代码}}</span></span>
```

### 28. 资料表（table）

仅用于真实表格数据，不作为布局容器。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;"><table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr><th style="padding:12px 10px;border-bottom:1px solid #EBC3D1;font-size:14px;line-height:1.7;text-align:left;color:#B9345A;background:#F9E5EC;"><span leaf="">项目占位</span></th><th style="padding:12px 10px;border-bottom:1px solid #EBC3D1;font-size:14px;line-height:1.7;text-align:left;color:#B9345A;background:#F9E5EC;"><span leaf="">说明占位</span></th></tr><tr><td style="padding:12px 10px;border-bottom:1px solid #EBC3D1;font-size:14px;line-height:1.7;text-align:left;color:#743449;background:#FFFFFF;"><span leaf="">维度占位</span></td><td style="padding:12px 10px;border-bottom:1px solid #EBC3D1;font-size:14px;line-height:1.7;text-align:left;color:#743449;background:#FFFFFF;"><span leaf="">内容占位</span></td></tr><tr><td style="padding:12px 10px;border-bottom:1px solid #EBC3D1;font-size:14px;line-height:1.7;text-align:left;color:#743449;background:#FFFFFF;"><span leaf="">维度占位</span></td><td style="padding:12px 10px;border-bottom:1px solid #EBC3D1;font-size:14px;line-height:1.7;text-align:left;color:#743449;background:#FFFFFF;"><span leaf="">内容占位</span></td></tr></table></section>
```

### 29. 单项数据（metric）

数据需来自原文，未给数据时删除整个组件；不要编造指标。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;"><section style="padding:20px 0;border-top:1px solid #EBC3D1;border-bottom:1px solid #EBC3D1;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:Georgia,serif;font-size:44px;color:#B9345A;"><span leaf="">{{数字}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:14px;color:#743449;"><span leaf="">{{指标名称}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:12px;color:#A7546E;margin-top:7px;"><span leaf="">{{数据说明与来源}}</span></p></section></section>
```

### 30. 一问一答（faq）

连续问题间用普通正文组件衔接，避免无限嵌套卡片。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding:19px 24px 22px;"><section style="background:#FFFFFF;padding:22px 21px;border:1px dashed #D68BA5;border-radius:12px;"><h3 style="margin:0 0 12px;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:19px;font-weight:600;line-height:1.7;color:#B9345A;"><span leaf="">{{问题}}</span></h3><p style="margin:0;font-size:16px;line-height:2.1;color:#743449;font-size:16px;line-height:1.95;"><span leaf="">{{回答}}</span></p></section></section>
```

### 31. 资料页脚（references）

与通用 4b 同源；在正文后、作者前，不输出 a href。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;"><p style="margin:0;font-size:16px;line-height:2.1;font-size:15px;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-weight:700;color:#B9345A;margin-bottom:12px;"><span leaf="">参考资料</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:13px;color:#743449;"><span leaf="">[1] {{资料名称}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:12px;color:#A7546E;word-break:break-all;"><span leaf="">{{原始URL}}</span></p></section>
```

### 32. 作者落款（author）

只在末尾出现一次；原文已有署名则沿用。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:20px;padding-bottom:8px;"><section style="height:1px;background:#EBC3D1;margin:8px 0 20px;font-size:0;line-height:0;"><span leaf=""></span><br></section><p style="margin:0;font-size:16px;line-height:2.1;font-size:14px;color:#A7546E;line-height:1.9;"><span leaf="">我是 {{作者名}}，{{一句话简介}}</span></p></section>
```

### 33. 合卷收尾（ending）

23px 宋体结束语与静态蝴蝶结线稿；互动顺序固定为点赞、转发、推荐。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:20px;padding-bottom:36px;"><section style="height:1px;background:#EBC3D1;margin:4px 25% 26px;font-size:0;line-height:0;"><span leaf=""></span><br></section><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;Noto Serif SC&#x27;,&#x27;Songti SC&#x27;,&#x27;STSong&#x27;,SimSun,serif;font-size:23px;font-weight:400;color:#B9345A;text-align:center;"><span leaf="">{{结束语}}</span></p><p style="margin:0;font-size:16px;line-height:2.1;font-size:12px;letter-spacing:2px;color:#A7546E;text-align:center;margin-top:13px;"><span leaf="">点赞、转发、推荐</span></p><section style="margin-top:20px;"><svg width="82" height="57" viewBox="0 0 100 68" fill="none" aria-hidden="true" style="display:block;margin:0 auto;max-width:100%;"><path d="M49 31C32 4 8 8 10 25C12 42 34 37 49 31ZM51 31C64 3 91 7 90 23C89 41 66 37 51 31Z" stroke="#D76F8D" stroke-width="1.3"/><path d="M46 30C36 38 28 48 22 58L33 56L38 63C40 47 45 37 49 32M54 30C62 40 66 52 68 63L75 56L87 59C75 44 61 35 51 32" stroke="#D76F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="50" cy="31" rx="5" ry="4" stroke="#D76F8D" stroke-width="1.3"/></svg></section></section>
```

### 34. 独立重点句（statement）

需要强强调的完整句子单独成段；仍不加底色、边框或下划线。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:8px;padding-bottom:22px;"><p style="margin:0;font-size:16px;line-height:2.1;font-size:18px;line-height:1.9;font-weight:700;color:#B9345A;"><span leaf="">{{重点句}}</span></p></section>
```

### 35. 行楷落款（hand-note）

20px 行楷、右对齐的短批注或落款；建议十二字以内，保持自然换行，只使用原文内容，不凭空添加作者观点。

```html
<section style="background:#FFFFFF;padding:20px 26px;box-sizing:border-box;padding-top:8px;padding-bottom:24px;"><p style="margin:0;font-size:16px;line-height:2.1;font-family:&#x27;STXingkai&#x27;,&#x27;STKaiti&#x27;,&#x27;KaiTi&#x27;,&#x27;Songti SC&#x27;,serif;font-size:20px;line-height:1.7;color:#B64B6C;text-align:right;"><span leaf="">{{原有的手写旁注}}</span></p></section>
```

## 完整文章模板骨架

```html
<section style="max-width:677px;margin:0 auto;background:#FFFFFF;color:#743449;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;font-size:16px;line-height:2.1;">
  <!-- 蝴蝶结扉页 cover → 手记引言 intro（原文有引言时） -->
  <!-- 阅读线索 contents（可选）：置于引言后，只选三个核心看点 -->
  <!-- 开场正文 paragraph -->
  <!-- 按原文顺序：大编号章节 chapter → 正文 / 宋体小节 / 清单 -->
  <!-- 引用用 quote 或 quote-dark；练习和独立批注用 note 或 notice -->
  <!-- 真实书籍用 book-card；原有的个人感想可用 letter-card，短批注用 hand-note -->
  <!-- 图片、代码、表格按原文位置插入，不擅自追加 -->
  <!-- 有链接才生成 references；正文上标用通用库 4a，并换为主色 -->
  <!-- 作者 author → 合卷收尾 ending；已有结尾签名时不重复追加文案 -->
</section>
```

每个内容区块都自带背景。外层 section 的背景被剥离时，内部仍应保持相同层级和对比度。组件放入有色区域时按该区底色调整，不给行内词增加色块。装饰编号可删除，标题与阅读顺序不受影响。

## 文章类型 → 组件组合配方表

| 类型 | 核心组合 | 点缀与限制 |
|---|---|---|
| 读书笔记 | 蝴蝶结扉页 + 大编号章节 + 藏书摘记 + 大字摘录 | 樱粉便签放原有练习，写给自己的信放原有个人感想 |
| 观点长文 | 蝴蝶结扉页 + 手记引言 + 常规正文 + 大编号章节 | 论证引用用大字摘录，前后观点用粉白对照 |
| 人文随笔 | 蝴蝶结扉页 + 常规正文 + 宋体小节 + 画页与题记 | 没有章节时不强行加编号；原有短批注可用行楷落款 |
| 教程 / 方法论 | 蝴蝶结扉页 + 页码步骤 + 顺序清单 + 樱粉代码页 | 前提说明用深莓提醒，代码保持原文符号与缩进 |
| 清单 / 书单 | 蝴蝶结扉页 + 大编号章节 + 藏书摘记 + 条目清单 | 一项一本或一件事，沿用原文数量与顺序 |
| 数据复盘 | 蝴蝶结扉页 + 单项数据 + 资料表 + 粉白对照 | 指标注明原文来源，移动端优先纵向组织 |
| 访谈 / 案例 | 蝴蝶结扉页 + 一问一答 + 大字摘录 + 页码步骤 | 人物和事件来自原稿，不添加宣传式结论 |

## Markdown → 组件映射规则表

| 原文元素 | 对应组件 | 规则 |
|---|---|---|
| `# 标题` | 蝴蝶结扉页 | 标题保留，按语义分行；使用已选定主题的 32px 封面例外 |
| 开头 `>` | 手记引言 | 原文只出现一次，不再重复用作封面副标题 |
| `##` | 大编号章节 | 标题原文保留，装饰编号与章节顺序对应并独立分列；不把序号混入语义标题 |
| `###` | 宋体小节 / 樱粉便签 | 普通小节用宋体标题，独立案例说明可连同后续正文放入便签 |
| 普通段落 | 常规正文 | 不删字、不改观点，保留分段与顺序 |
| `**` | 主色加粗 | 仅改变字重和颜色 |
| `++` / `<u>` | 关键词强调 | 按主题索引取字重和颜色，不画下划线 |
| `==` / `~~` | 定义强调 / 深莓强调 | 保留文字，不画删除线或行内底色 |
| 非开头 `>` | 大字摘录 / 白纸摘录 | 装饰引号独立排在上方，强引用合计最多两处 |
| `-` / `1.` / `- [ ]` | 条目清单 / 顺序清单 / 待办页 | 待办为静态符号 |
| 图片 / GIF | 画页与题记 + 通用 2b 角标 | 保留路径，GIF 不转换为静态图 |
| 代码围栏 / 行内代码 | 浅粉代码页 / 樱粉代码页 / 行内代码 | 浅粉底与深莓红代码文字、每行一个 p；不把代码引号全角化 |
| 数据表格 | 资料表 | 只服务于表格语义 |
| `[text](url)` | 通用上标 + 资料页脚 | 主色上标，按首次出现顺序编号，不输出 a href |
| 作者与结尾 | 作者落款 / 合卷收尾 | 沿用原文署名；点赞、转发、推荐顺序固定 |
| 原有短批注或手写落款 | 行楷落款 | 20px 行楷、右对齐，保留原文，不新增观点 |

Word 抽取稿中的反斜杠转义按 Markdown 规则还原为字面量，不能把原文的星号、尖括号或实体重新解释为格式。
