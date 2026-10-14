---
name: "茉灵导航"
description: "厚实中文、彩色工具卡与纸张式推荐牌组组成的明亮启动台"
colors:
  canvas: "#fffcff"
  surface: "#ffffff"
  ink: "#292338"
  muted: "#655b73"
  purple: "#7650c7"
  purple-dark: "#5f39b0"
  lime: "#decfff"
  line: "#e8dfef"
  lavender: "#eee5ff"
  blue: "#e7f0ff"
  cream: "#fff1dc"
  mint: "#e5f3ea"
  rose: "#ffe0ee"
  peach: "#ffe5df"
  deck: "#6941b0"
typography:
  display:
    fontFamily: "Moli Sans, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(44px,4.55vw,66px)"
    fontWeight: 900
    lineHeight: 1.23
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Moli Sans, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "30px"
    fontWeight: 900
    lineHeight: 1.75
    letterSpacing: "-.035em"
  title:
    fontFamily: "Moli Sans, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.5
    letterSpacing: "-.025em"
  card-title:
    fontFamily: "Moli Sans, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.5
    letterSpacing: "-.015em"
  body:
    fontFamily: "Moli Sans, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.75
  description:
    fontFamily: "Moli Sans, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.85
  label:
    fontFamily: "Moli Sans, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.75
  metadata:
    fontFamily: "Moli Sans, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.75
rounded:
  key: "8px"
  icon-mobile: "15px"
  icon: "17px"
  compact: "23px"
  featured: "24px"
  surface: "26px"
  deck: "24px"
  deck-sheet: "24px"
  pill: "999px"
  circle: "50%"
spacing:
  small: "8px"
  compact: "12px"
  standard: "16px"
  column: "20px"
  inset: "24px"
  card: "26px"
  wide: "28px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.purple-dark}"
  button-reset:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "13px 25px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "11px 21px"
  button-deck-nav:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.purple-dark}"
    rounded: "{rounded.circle}"
    padding: "0"
    width: "44px"
    height: "44px"
  button-discovery:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.purple-dark}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 8px 7px 24px"
    height: "72px"
  nav-header:
    backgroundColor: "#f1ebf7"
    rounded: "{rounded.pill}"
    padding: "6px"
  nav-category:
    backgroundColor: "#fffcff"
    textColor: "#665373"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 12px"
  nav-category-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "10px 12px"
  chip-shortcut:
    backgroundColor: "#f0e8f8"
    textColor: "#6b5287"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  card-tool:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "24px"
  card-featured:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.ink}"
    rounded: "{rounded.featured}"
    padding: "22px"
  panel-discovery:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.deck}"
    padding: "0 24px 0 54px"
  panel-welcome:
    backgroundColor: "#fffdf9"
    textColor: "{colors.ink}"
    rounded: "22px"
    padding: "16px 42px 18px 16px"
    width: "350px"
---

# Design System: 茉灵导航

## Overview

**Creative North Star: "有分量的彩色工具启动台"**

浅色画布、厚实中文标题和六组明亮浅色工具卡片构成亲近而清楚的浏览界面。纸张式推荐牌组形成明确视觉重点，深墨色选中控件稳定操作层级，随卡片色调变化的浅色胶囊按钮为推荐提供直接出口。

实心 m 字标、饱满圆角与柔和立体层次形成品牌轮廓。动效展示进入、切换和重排关系；真实工具链接始终可以直接打开，装饰不延迟使用。

**Key Characteristics:**

- 较大、较粗的中文层级与自托管字体。
- 浅色、六组彩色卡片、纸张式推荐牌组与粉紫色行动按钮。
- 实心 m 字标、胶囊控件和可感知的柔和立体层次。
- 默认开启且尊重减少动态效果偏好的入场、叠牌旋转切换、重排与悬停反馈。

范围仅为首页 index.html、css/main.css、assets/home/home.js 和 mark.svg；独立工具子站不继承此系统。此稿依据用户对细小文字、连环 Logo、平淡构图、缺少动效和左下欢迎提示的明确否定更新。前置 token 为桌面默认值，完整状态与预览见 .impeccable/design.json；当前页面合同见 .impeccable/surfaces/index-html.md。

## Colors

### Primary

- **Launch Purple / purple** 与 **Deep Purple / purple-dark**：标题重点、搜索动作、链接重点和键盘焦点。
- 推荐牌组采用白色至暖白纸面，浅色书脊与深色文字随当前卡片配色变化；deck 与 lime 为早期配色的兼容 token。
- 当前页与选中分类采用深墨色 ink，不把所有状态都涂成紫色。

### Secondary

**Lavender、Blue、Cream、Mint、Rose、Coral** 承载六组工具卡片；每组在源码中配有专用图标、说明、边框和阴影色。配色不是类别的唯一标识，工具标题统一使用 ink。薰衣草紫与玫瑰粉亦承载设计、专注两个紧凑入口。

### Neutral

**Canvas** 为浅色页面底色，**Surface** 为白色控件与高对比文字，**Ink** 为主要文字与深色选中状态，**Muted** 为辅助内容，**Line** 为浅分隔线。

**The Readable Color Rule.** 浅色负责表面识别，深色负责工具名称；选中状态同时提供文字与可访问状态，不只依赖颜色。

侧车色阶为派生展示，不新增实际 CSS token；特殊卡片的边框、阴影和状态色保留在实际组件片段中。

## Typography

**Display Font / Body Font:** Moli Sans 是项目对本地 Noto Sans SC 子集的 CSS 别名，后备为 PingFang SC、Microsoft YaHei 与 sans-serif。medium.woff2、bold.woff2、black.woff2 分别承载实际（500、700、900）字重；CSS 将请求区间（400–600、601–800、801–1000）映射到三个静态字重，不是完整连续可变字体。

### Hierarchy

- **Display**：主标题使用（900）字重；**Headline**：目录标题同为（900）。
- **Title**：紧凑精选入口；**Card-title**：桌面工具名称（20px、800），**Description**：用途说明（15px、500）。CSS 中的 800 请求由本地 700 静态字重承载。
- **Body**：基础正文（16px、500）；**Label**：分类（14px、700）；**Metadata**：短分类与辅助信息（12px、600）。
- 推荐名称桌面为（clamp(1.5rem,2.2vw,2rem)、800、1.3），平板和手机均为（24px）；页头字标为（28px、900、1.3）。
- 手机工具名称（17px、800），说明（14px、500）；380px 以下名称（16px），说明仍保持（14px）。

**The Weight Has Substance Rule.** 保持当前较大字号和本地中粗、粗黑字重；不要恢复细小辅助字占主导的工具卡片。

black.woff2 由可变源实例化，实际 OS/2 字重为 900；继承的 PostScript 名称含 Thin，不代表页面使用细字。当前字重判断以字体实际表和渲染检查为准。

## Layout

- 容器最大宽（1320px），桌面两侧各（56px）；页头高（116px），m 标志（56px）。
- 桌面为十二列不对称启动区：标题与搜索占八列，下方两个紧凑入口各占四列；右侧推荐牌组占四列并跨两行。启动区间距（20px）。
- 搜索最大宽（790px）、高（72px）。工具网格四列、间距（20px）；分类位于浅紫色圆角容器中，桌面圆角 28px、内距 12px、顶部粘附间距 12px，按钮为白色胶囊、深墨选中态。桌面空间不足时换行；700px 及以下圆角 25px、内距 9px、顶部间距 8px，保留横向滚动。
- 帮助区使用（1fr / 2fr）双列与（44px）间距，浅紫面板圆角（30px）、内距（32px 36px），页脚横向分组；页面最小宽（320px）。

| 最大视口宽度 | 实际覆盖 |
| --- | --- |
| 1200px | 两侧各 32px；主标题 clamp(42px,4.7vw,60px)；工具标题 19px、说明 14px，网格间距 17px。 |
| 960px | 两侧各 24px；页头 100px、标志 50px；主标题 clamp(34px,4.6vw,42px)；启动区采用十四列：标题和搜索占八列，下面两个竖向精选入口各占四列；推荐占六列并跨两行；搜索 66px；工具三列。 |
| 700px | 两侧各 18px；页头 87px、标志 48px；主标题 clamp(35px,7.7vw,48px)；搜索 62px。启动区纵向排列，两个精选入口并排，推荐独占下一行，避免两层横向滑动冲突；工具两列、间距 13px；帮助与页脚单列。 |
| 380px | 两侧各 14px；主标题 31px、标志 43px；工具名称 16px、说明 14px；网格间距 11px；目录标题和计数纵向排列。 |

手机精选入口采用等宽两列，标题按语义分成两行，说明平衡换行；推荐正面至少 214px 高，保留完整名称和说明，下方排列 44px 切换按钮与进度圆点。手机工具卡内距为 20px 17px 19px，380px 以下为 18px 14px。分类按钮最小高 44px，选中项移出横向可视区域时，仅滚动分类栏使其重新可见。

## Elevation & Depth

浅色卡片使用柔和阴影与位移反馈；推荐使用同一视口内的六张叠牌，前后卡片有独立偏移、缩放和旋转角度；视口保持正向；后排卡片依位置进行缩放和旋转，桌面留出右侧空间，避免牌边紧贴屏幕。切换时整张前牌沿左右方向旋转滑出，下一张从相反方向旋转滑入。局部径向高光跟随细指针，仅限被悬停卡片。

- **Search rest / focus**：0 10px 26px #6e45920a / 0 10px 30px #6945a51f。
- **Tool hover**：0 15px 25px -12px var(--card-shadow)，随配色变化；卡片抬升（6px）。
- **Discovery**：纸面内侧高光与 0 2px 8px、0 16px 40px 两层柔和阴影；后排卡片使用更轻的阴影。
- **Welcome overlay**：0 18px 60px #4432522b。

**The Motion Explains Change Rule.** 入场、推荐切换和筛选重排表达内容关系；动效默认开启，并保留减少动态效果降级，操作与链接不等待动画结束。

主要缓动为 cubic-bezier(.16,1,.3,1)。标题和牌组入场（720ms），搜索入场（600ms）；整张推荐卡位置与旋转过渡（520ms），拖动时前牌关闭过渡以跟手；筛选最多对十二张可见候选卡执行（360ms）位置连续动画。悬停通常（180–450ms）。当前可见纸牌不使用循环呼吸；减少动态效果关闭这些动画和平滑滚动。每张牌保留独立配色，底牌色调同步变化；没有绕 Y 轴翻面。

## Shapes

主工具卡采用（26px）圆角，桌面欢迎卡为（22px）；精选与手机工具卡（24px），手机精选（23px）、紧凑欢迎卡（21px）；推荐正面和底牌桌面为（24px），手机为（22px）；书脊及竖排名称在所有断点统一宽（30px）。输入与操作使用（999px）胶囊，图标托底桌面（17px）、手机（15px）。

新标志是深色圆角方块中的暖白小写 m，右上有浅紫点缀；使用实际 SVG，不再使用连环花形。图标继续使用内联 SVG，工具图标线宽（1.9），更适合当前字重。

## Components

### Buttons, Navigation and Chips

搜索使用紫底白字胶囊，悬停轻抬升并加深、按下缩至（0.97）。恢复按钮沿用紫色；联系作者为描边胶囊。推荐打开按钮采用对应的浅色填充和深色文字，桌面为 48px 高胶囊，手机为 44px 高胶囊；上一张和下一张在所有尺寸都位于牌组下方，触控目标为（44px）。手机保留两个切换按钮与双向滑动，焦点轮廓采用卡片强调色。

分类选中和页头当前页使用深墨底白字，分类同步 aria-pressed；快捷词使用浅紫胶囊。键盘焦点为（3px）紫色轮廓、（5px）偏移。推荐牌支持按钮、鼠标拖动、触摸左右滑动和方向键切换；减少动态效果偏好优先。

### Inputs / Fields

搜索具有隐藏关联标签、实时筛选、结果数量通报、清除与空结果恢复。关键词通过 q 参数保存，分类通过 category 参数保存；全部分类省略 category，未知分类回退到全部。输入、分类切换、清除、Escape、精选入口、快捷词和恢复操作同步 URL，提交滚动到结果；分享、重载及历史导航恢复相同筛选，纯锚点跳转不重置分类。斜杠与 Ctrl/Cmd+K 聚焦，Escape 清空；输入、可编辑内容和聊天室不被全局快捷键拦截。输入聚焦使用容器边框与柔光，内部不重复画轮廓。

工具卡的滚动避让距离根据分类栏实际高度、顶部间距和 12px 留白计算，随字体加载、换行和视口变化更新；键盘焦点进入工具卡时就近滚动，避免标题被吸顶栏遮挡。旧地址的 #finder 定位搜索入口，#featured 定位推荐牌组，保留书签和分享链接兼容。

### Cards and Discovery

每张工具卡都是保留真实目的地的完整链接，包含图标、名称、用途和分类；JavaScript 关闭仍可浏览。悬停抬升卡片，图标轻转、箭头反色，并出现局部高光；无悬停设备不显示高光且不抬升卡片。

推荐牌组更新真实工具名称、说明、链接、SVG 图标、位置圆点和色调，以独立的 polite live region 通报。六张牌在同一视口中叠放，槽位从前到后使用 6、5、4、3、2、1 的独立层级，避免最后两张牌因 DOM 顺序覆盖错误。拖动时仅更新前牌的位移和旋转，不反复改写整副牌的 ID 和可访问状态；松手后按距离和速度切换，短拖动或取消手势时回弹。卡片外松手同样结束跟踪；窗口失焦、页面隐藏、尺寸变化或启用减少动态效果会取消当前拖动，避免松手后误切换。连续按钮和方向键输入可以中断当前动画。切换后保持打开链接的键盘焦点，轮播名称始终关联当前标题。右上序号与正文分离，书脊从统一 30px 宽度排布。相邻预览卡没有重复 ID，使用 inert 和 aria-hidden 排除交互与读屏。拖动不会误触工具链接。手机推荐独占一行，保留说明和位置圆点，隐藏图标和次要类别行；仅显示前牌及两张后排纸卡，全部六项仍可切换。横向拖动达到 12px 且超过纵向位移的 1.25 倍后才开始跟手；纵向滑动交给浏览器滚页，支持双指缩放。拖动后的点击抑制仅作用于牌面，不阻止下方切换按钮。

### Welcome, Help and Integrations

欢迎卡固定右上：桌面 top（10px）、right（26px），宽至多（350px）；700px 及以下 top/right（12px），宽 calc(100% - 24px)、最大（410px），内距（13px 44px 15px 17px），采用（36px / 1fr）两列与（10px）间距。手机显示（36px）标志、（16px）粗标题和（13px）固定短句，隐藏较长的归属地与动态欢迎语；桌面保留完整问候。关闭目标始终为（44px）。

搜索聚焦或输入、分类/快捷词/精选/工具/推荐操作以及滚动超过（24px）立即关闭欢迎卡；访客查询结束前发生这些操作，也会阻止欢迎卡延迟出现。未操作时七秒自动关闭计时在悬停、焦点停留和页面隐藏时暂停，后台首次出现时同样暂停，进度条同步；键盘关闭后将焦点移至搜索框；紧凑卡片位于标题上方，不遮住手机搜索入口。

FAQ 使用原生 details / summary，触摸后不残留默认蓝色点击遮罩；聊天室的图片修复仅作用于其自身容器。桌面页脚保持品牌居左、联系入口居右，下方建站时间与备案信息两侧排列。手机品牌和标语保持左对齐，两按钮并排铺满；仅手机底部的建站时间、运行天数和备案文字居中，空间不足时按完整词组换行。品牌标志为 44px，联系作者使用紫色主按钮，个人主页使用浅紫辅助按钮，手机按钮最小高度 52px；备案链接最小点击高度 44px。删除节日特效和外部网站条件的页脚说明后，手机底部内边距收紧为 24px 加安全区；居中的备案链接与左下返回顶部按钮横向错开。

2026-10-05 本地验证：320、390、768、1024、1200、1440px 均无整页横向溢出；原有 55 个资源地址全部保留，连同开发服务共 56 个入口。分类圆角及全断点 30px 书脊、搜索/重载/清除、推荐切换、鼠标拖动、手机触摸、键盘焦点、FAQ、无脚本浏览、减少动态效果和欢迎卡暂停均通过；CDN 请求挂起时本地搜索仍可用。外部请求在本地测试中隔离，聊天室和访客后端的线上可用性不据此声明验证通过。

同日移动端适配验证：224 项检查通过，覆盖 320、360、390、430、700、768、844、1024、1440px 布局，以及 Chromium 合成触摸的左右切换、纵向滚页、短拖回弹、取消手势和滑动后按钮响应；Firefox 验证手机视口、分类可见性和推荐按钮。206 个正文及悬停配色样本最低对比度 5.03。页脚对齐范围修正后，另核对了 320、390px 的底部文字居中及品牌左对齐、844、1440px 的桌面两侧布局，以及溢出和点击尺寸。未执行真实 iOS / Android 设备测试。

推荐牌组复核：逐张对比六项推荐的桌面和手机截图，修复了最后两张底牌共享层级的遮盖错误；重跑 224 项首页回归检查，并通过 165 项层级、双向快速切换、边缘松手、拖动中断、焦点及设备名称检查。窗口隐藏和失焦使用浏览器事件模拟，触摸仍为 Chromium 合成输入。

## Do's and Don'ts

### Do:

- Do 保留较大中文名称、14px 以上的手机工具说明和真实粗字重。
- Do 使用新 m 字标、六组彩色卡片和有主次的纸张式推荐牌组。
- Do 让动效说明内容变化，默认开启，并保留离屏停止和减少动态效果支持。
- Do 保留真实链接、搜索分类和可见的键盘焦点。
- Do 将品牌欢迎卡放在右上，并保持可关闭、计时可暂停。

### Don't:

- Don't 恢复被否定的细小字体、连环 Logo、平淡居中堆叠或左下欢迎提示。
- Don't 让动画延迟工具可用性，或在系统要求减少动态效果后继续装饰动画。
- Don't 用浅色文字替代工具名称的深色正文。
- Don't 将本首页视觉规则或图片重置扩散到独立子站和聊天室。

未固化为规则：FAQ 加减字符和欢迎语内部 eyebrow 命名是局部实现，不作为全站图标或装饰标签规范。

## Font maintenance

三个 WOFF2 按首页 HTML、JavaScript、CSS 实际用字及 Latin-1 范围裁剪，总计 268,468 字节。原始 500 / 700 / 900 字重、元数据和 SIL OFL 许可证保留；动态地名或后续新增、未包含的字符使用系统字体后备。

修改首页文案后，可用完整的原始字体重新生成：`python scripts/subset-home-fonts.py --source-dir <完整字体目录>`，需要 `fonttools[woff]`。源目录需包含 medium.woff2、bold.woff2、black.woff2，且不能与输出目录 assets/home 相同。裁剪不是站点构建步骤；生成后的字体直接随静态站点发布。

## Visual polish

分类栏在正常与吸顶状态使用同一个完整圆角表面，不再以直角纯色背景遮住页面渐变。工具卡使用蓝、紫、奶油黄、薄荷绿、玫瑰粉和珊瑚色，说明和分类文字与卡片色调协调；分类文字配有小圆点。精选卡、推荐按钮和 FAQ 保持统一圆角与间距；页脚联系入口采用 16px 圆角与清楚的主次配色。推荐牌组和分类栏的历史重复样式已合并，书脊宽度只定义一次。
