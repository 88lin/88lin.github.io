# 主题索引与选择决策表

本表是主题信息的**单一来源**。工作流第 1 步据此向用户展示选项，第 2 步据"组件库文件"列读取对应库，下划线标记时据"正文下划线 CSS"列取值。

每个主题的**英文标识**（用于产物命名 `{中文名}({标识}).html`、Agent 引用）= "组件库文件"列去掉 `theme-` 前缀与 `.md` 后缀。展示给用户仍用中文名。

**所有主题共用的文字背景规则**：按[微信规范 4.1.2](https://developers.weixin.qq.com/doc/service/guide/product/plugin_spec.html#_4-1-2) 尽量减少文字背景渐变，同时保留原主题视觉。荧光笔保留底部半高亮，可用无模糊内阴影实现，不能换成整块底色；主题原有纯色标签、胶囊继续保留，内阴影替代也需微信真机深色模式验证。卡片用色应接近原有整体明度。无文字装饰可保留渐变，必要效果逐项评估并验证深色模式，不一刀切改风格。

## 已注册主题

| 主题 | 主色 | 适用场景 | 组件库文件 | 正文下划线 CSS |
|------|------|---------|-----------|---------------|
| 软糖 Soft Candy | `#FFD3E2` 奶粉（配 `#B8325C` 玫瑰字） | 教程、清单、测评、日常分享、轻松向长文（默认推荐；白纸底+彩色贴纸，粉彩五色轮转、同色系彩边、糖果编号、emoji 点缀） | `references/theme-soft-candy.md` | `color:#B8325C;font-weight:bold;background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%204%20240%2036%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23FFDDE9%22%20d%3D%22M9%2015%2022%2011%2017%209%2062%208%20101%207%20151%208%20198%206%20224%209%20219%2012%20233%2012%20227%2017%20238%2019%20229%2023%20235%2026%20222%2030%20225%2034%20188%2035%20140%2037%2095%2036%2051%2038%2013%2035%2019%2032%204%2031%2010%2027%202%2024%2011%2020%205%2018Z%22%2F%3E%3Cpath%20fill%3D%22%23F277A6%22%20opacity%3D%22.55%22%20d%3D%22m8%2027%2041%202%2054-1%2043%201%2044-3%2041%201-9%204%203%203-37%201-48%202-45-1-44%202-38-3%206-3-15-1Z%22%2F%3E%3Cpath%20d%3D%22m13%2016%2028-3m-29%209%2019-2m-13%2011%2026%201m158-22%2019%201m-12%206%2020-1m-23%2016%2015-2%22%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%221.4%22%20stroke-linecap%3D%22round%22%20opacity%3D%22.7%22%2F%3E%3C%2Fsvg%3E');background-size:100% 100%;background-repeat:no-repeat;padding:3px 6px;white-space:nowrap;` |
| 奶油泡芙 Cream Puff | `#A83A57` 玫瑰（配奶白 `#FFF8F4`） | 随笔、方法论、年度总结、读书笔记、温柔向长文（奶白点阵纸底、浅粉纯色封面、白底彩边卡、五色章节编号、信笺式落款） | `references/theme-cream-puff.md` | `color:#A83A57;font-weight:bold;` |
| 摸鱼绿 | `#059669` emerald | 教程、测评、清单、工具盘点（卡片丰富、信息密度高） | `references/theme-moyu-green.md` | `border-bottom:2px solid #A7F3D0;font-weight:600;` |
| 红白色系 | `#DC2626` 正红 | 深度分析、观点、力量感话题（经典编辑风，编号章节+引言卡+签名区，红色克制点睛） | `references/theme-red-white.md` | `border-bottom:2px solid #FECACA;font-weight:600;` |
| 克莱因蓝艺术展册 | `#002FA7` 克莱因蓝 | 艺术评论、品牌叙事、深度观点、人物特稿（浅蓝底圆角卡流、错位白卡标题、蓝点步骤卡、耳挂金句条） | `references/theme-klein-blue.md` | `border-bottom:2px solid #002FA7;font-weight:600;color:#111111;` |
| 石墨极简风 | `#52525B` 石墨灰 | 设计、科技评论、专业观点、高端品牌（极简克制、留白理性、全灰阶） | `references/theme-graphite-minimal.md` | `border-bottom:2px solid #52525B;font-weight:600;` |
| 留白禅意风 | `#4A5D52` 墨绿 | 禅意冥想、极简生活、深度随笔、艺术留白（呼吸感最强） | `references/theme-zen-whitespace.md` | `border-bottom:1.5px solid #B5C8BC;font-weight:500;` |
| 摸鱼票据风 | `#059669` emerald | 测评、工具对比、创意评测（票据/门票视觉隐喻，星级评分+编号+硬阴影卡片） | `references/theme-moyu-ticket.md` | `border-bottom:2px solid #A7F3D0;font-weight:600;` |
| 奶咖信纸 Letter | `#2B7FD8`/`#F4D758`/`#E84A5F` 三色 | 叙事长文、观点、方法论、年度总结（奶白信纸底、中轴衬线标题、荧光笔点睛、三色装饰条分段，无卡片堆砌） | `references/theme-letter.md` | `box-shadow:inset 0 -0.5em 0 #F4D758;font-weight:bold;` |
| 粉彩便当盒 Bento | `#7C3AED` 粉彩紫 | 工具测评、清单、干货合集（粉彩浅底马卡龙卡五色轮转、等宽眉标编号、奶油黄金句卡，无深色实底） | `references/theme-bento.md` | `box-shadow:inset 0 -0.5em 0 #FBD97C;font-weight:bold;` |
| 莓果信笺 | `#C43A6C` 莓果粉 | 读书笔记、观点长文、人文随笔（宋体与蝴蝶结手账；斜体大编号、圆角摘录与便签、行楷落款，纯文字强调） | `references/theme-berry-letter.md` | `font-weight:700;color:#C43A6C;` |
| 薄荷对话 Chat | `#10B981` 薄荷 | AI 访谈实录、问答教程、案例复盘（浅绿/薄荷气泡问答推进、不对称圆角、薰衣草要点卡收束） | `references/theme-chat.md` | `background:#FFD3E2;color:#8F1A3C;font-weight:bold;padding:1px 6px 2px;border-radius:8px;box-shadow:inset 0 -2px 0 #F089A8;white-space:nowrap;` |
| 科技钴蓝 | `#1D4ED8` cobalt | AI 工具、开发教程、产品说明、工作流指南（冷静清晰、信息密度高、黄蓝对比） | `references/theme-tech-cobalt.md` | `border-bottom:2px solid #93C5FD;font-weight:600;` |
| 孔雀蓝杂志 Magazine | `#15697C` 孔雀蓝 | 人物故事、行业观察、深度特稿（左对齐编辑排版、超大斜体装饰词、引语卡、数据强调行） | `references/theme-magazine.md` | `box-shadow:inset 0 -0.5em 0 #F5CDB4;font-weight:bold;` |
| 珊瑚手账 Journal | `#E0567C` 玫粉 | 读书笔记、随笔、好物清单（粉白纸感底、大圆角胶带贴纸、虚线批注框、书卡+浅粉摘录卡，玫粉+薰衣草+薄荷） | `references/theme-journal.md` | `box-shadow:inset 0 -0.5em 0 #FFD3E2;font-weight:bold;padding:0 2px;` |
| 珊瑚日报 Daily | `#C33D46` 珊瑚红 | 资讯日报、周报盘点、快讯合集（日期胶囊开场、六色马卡龙横卡流、双栏小卡、居中珊瑚红金句） | `references/theme-daily.md` | `box-shadow:inset 0 -0.5em 0 #FBD97C;font-weight:bold;` |
| 草莓牛奶 Strawberry Milk | `#E84D72` 草莓红（配薰衣草紫 `#B79CF0` / 天蓝 `#8FD0F5`） | 生活方式、女性成长、读书笔记、好物清单（杂志编号风：手绘草莓、68px 淡粉装饰词、衬线标题、粉色高亮块、三色装饰条、深梅面板与结尾金句） | `references/theme-strawberry-milk.md` | `background:#FFD9E6;color:#8E1836;font-weight:bold;padding:1px 4px;border-radius:4px;` |
| 花园茶会 Garden Tea | `#8B6FD6` 薰衣草紫（配草莓粉 `#F089A8` / 天蓝 `#7FC8E8`） | 花园随笔、女性成长、读书笔记、好物清单（杂志编号风：星芒与云朵线描插画、68px 装饰词、星点清单、蝴蝶引语、深紫面板） | `references/theme-garden-tea.md` | `background:#FFD9E6;color:#9C2547;font-weight:bold;padding:1px 4px;border-radius:4px;` |

## 选择建议

- **用户选择制**：用户没指定主题时，把本表全部主题列给用户选（中文名 + 适用场景），不替用户定；最贴合题材的主题可标"（推荐）"放第一位。
- 全自动模式（用户明说"直接排"）才自动选：默认第一行主题，题材明显契合其它主题时选契合项并在交付时说明理由。
- 同一篇文章只用一套主题，不混搭。

## 下划线色值的权威性

正文关键词下划线一律用上表"正文下划线 CSS"列的值。组件库里可能有浅色下划线变体，那是可选样式；**正文关键词标记以本表为单一权威来源**，避免双轨。

软糖的笔刷样式只用于不超过 12 字且能在手机端容纳于一行的短语；长句仅保留 `color:#B8325C;font-weight:bold;`，不加背景图、padding 或 `nowrap`。笔刷源文件与微信真机验证边界见该主题组件 3 / 5。

## 新主题登记流程

1. 把主题组件库写入 `references/theme-{英文标识}.md`（格式要求见 SKILL.md「添加新主题的规范」）。
2. 在上表登记一行；首个/最常用主题放第一行作为默认推荐。
3. 跑 `python3 scripts/component_lint.py .` 确认 0 ERROR。

> 用户想要全新风格时，可走 `references/theme-generator.md` 的自定义主题生成流程：按偏好/参考图生成区块库（预览存 `assets/theme-previews/`），确认后转标准主题库并按上面流程登记。
