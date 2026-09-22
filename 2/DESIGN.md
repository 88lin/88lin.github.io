---
name: "88lin /2/ — 个人网站与个人白板"
description: "保留明亮的个人网站身份，让 /2/system/ 以蓝色手写纸张构成可探索的本地白板。"
colors:
  site-brand: "#2B7FD8"
  site-brand-text: "#1E63B0"
  site-highlight: "#F4D758"
  site-cream: "#FFFCF8"
  site-cream-dark: "#F8F7FB"
  site-ink: "#1C1C1E"
  blue: "#4273B5"
  blue-soft: "#EAF1FB"
  blue-line: "#C2D2E9"
  paper: "#FFFDF7"
  yellow: "#FFE16B"
  ink: "#25334A"
  muted: "#607089"
  white: "#FFFFFF"
  create-paper: "#F0EAFE"
  sticky-yellow: "#FFE583"
  control-ink: "#575363"
  control-fill: "#F0EAFE"
  control-line: "#E4DFED"
  control-hover: "#F6F2FD"
  control-focus: "#6941B0"
  control-surface: "#FFFFFF"
  nav-surface: "#FFFFFF"
  nav-border: "#E4DFED"
  nav-text: "#575363"
  nav-ink: "#2F293D"
  nav-hover: "#F6F2FD"
  welcome-paper: "#FFF4D6"
  project-paper: "#EBF4FF"
  reading-paper: "#E0F6EF"
  tutorial-paper: "#2C3D50"
  tutorial-highlight: "#F7DF91"
  tutorial-text: "#FFFBEC"
  tutorial-muted: "#CED8E1"
  authored-line: "#DEE5EA"
  surface-pink: "#FFE3F1"
  surface-lilac: "#F0EAFE"
  surface-peach: "#FEEDE1"
  surface-aqua: "#DFF6F9"
  surface-line: "#E8E3EC"
  line-blue: "#D5E6FF"
  line-pink: "#FBC7E0"
  line-lilac: "#DCCEFC"
  line-mint: "#B7EAD9"
  line-peach: "#FDD5B9"
  line-aqua: "#B4E9F2"
  line-yellow: "#F0DEAA"
  text-blue: "#2455A4"
  text-pink: "#A82262"
  text-lilac: "#6941B0"
  text-mint: "#236952"
  text-peach: "#925025"
  text-aqua: "#226876"
  text-yellow: "#796020"
typography:
  site-display:
    fontFamily: "\"Fraunces\", \"Noto Serif SC\", \"Songti SC\", \"STSong\", serif"
    fontSize: "clamp(2.7rem, 7.2vw, 5.2rem)"
    fontWeight: 900
    lineHeight: 1.14
    letterSpacing: "0.01em"
  site-heading:
    fontFamily: "\"Fraunces\", \"Noto Serif SC\", \"Songti SC\", \"STSong\", serif"
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
    fontWeight: 900
    lineHeight: 1.3
    letterSpacing: "0"
  site-body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"HarmonyOS Sans SC\", \"Helvetica Neue\", \"Noto Sans SC\", sans-serif"
  headline:
    fontFamily: "\"LXGW WenKai\", \"KaiTi\", \"STKaiti\", cursive"
    fontSize: "27px"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "\"LXGW WenKai\", \"KaiTi\", \"STKaiti\", cursive"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "14px"
    lineHeight: 1.85
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "13px"
    fontWeight: 500
  field:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "16px"
    lineHeight: 1.7
  navigation:
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1
  caption:
    fontFamily: "\"Caveat\", cursive"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  paper-photo: "3px"
  field: "9px"
  tool: "12px"
  search: "13px"
  paper-card: "14px"
  palette: "16px"
  dialog: "20px"
  site-card: "20px"
  pill: "999px"
spacing:
  tool-gap: "6px"
  small: "8px"
  medium: "14px"
  paper-inset: "24px"
  section: "clamp(48px, 5vw, 72px)"
  section-heading-gap: "clamp(24px, 3vw, 32px)"
components:
  button-tool:
    backgroundColor: "{colors.control-surface}"
    textColor: "{colors.control-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.tool}"
    padding: "8px 14px"
  button-create:
    backgroundColor: "{colors.create-paper}"
    textColor: "{colors.control-focus}"
    typography: "{typography.label}"
    rounded: "{rounded.tool}"
    padding: "8px 14px"
  button-tool-active:
    backgroundColor: "{colors.control-fill}"
    textColor: "{colors.control-focus}"
    typography: "{typography.label}"
    rounded: "{rounded.tool}"
    padding: "8px 14px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
  search:
    backgroundColor: "{colors.control-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.search}"
    padding: "0 9px"
  navigation:
    backgroundColor: "{colors.nav-surface}"
    textColor: "{colors.nav-text}"
    typography: "{typography.navigation}"
    rounded: "{rounded.pill}"
    padding: "4px 6px"
  navigation-link:
    textColor: "{colors.nav-text}"
    typography: "{typography.navigation}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "44px"
  navigation-active:
    backgroundColor: "{colors.control-fill}"
    textColor: "{colors.control-focus}"
    rounded: "{rounded.pill}"
    height: "34px"
  pen-palette:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.palette}"
    padding: "8px 12px"
  tool-groups:
    textColor: "#354B66"
  paper-washi:
    backgroundColor: "{colors.welcome-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper-card}"
    padding: "30px 27px 24px"
  paper-project:
    backgroundColor: "{colors.project-paper}"
    textColor: "#304C70"
    rounded: "{rounded.paper-card}"
    padding: "27px 24px 19px"
  paper-reading:
    backgroundColor: "{colors.reading-paper}"
    textColor: "{colors.text-mint}"
    rounded: "{rounded.paper-card}"
    padding: "27px 25px 20px"
  paper-contact:
    backgroundColor: "{colors.surface-pink}"
    textColor: "{colors.text-pink}"
    rounded: "{rounded.paper-photo}"
    padding: "25px 23px 19px"
  paper-tutorial:
    backgroundColor: "{colors.tutorial-paper}"
    textColor: "{colors.tutorial-text}"
    rounded: "{rounded.paper-card}"
    padding: "27px 29px 23px"
  paper-polaroid:
    backgroundColor: "{colors.white}"
    textColor: "{colors.blue}"
    rounded: "{rounded.paper-photo}"
    padding: "14px 14px 17px"
  paper-checklist:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper-card}"
    padding: "27px"
  site-button:
    backgroundColor: "{colors.site-ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "14px 30px"
  site-tile-blue:
    backgroundColor: "{colors.project-paper}"
    textColor: "{colors.text-blue}"
    rounded: "{rounded.site-card}"
  site-tile-pink:
    backgroundColor: "{colors.surface-pink}"
    textColor: "{colors.text-pink}"
    rounded: "{rounded.site-card}"
  site-contact:
    backgroundColor: "{colors.surface-lilac}"
    textColor: "{colors.site-ink}"
    rounded: "30px"
    padding: "48px 36px"
---

# Design System: 88lin /2/ — 个人网站与个人白板

## Overview

**Creative North Star: "真实内容的个人白板"**

这份规范只约束 `/2/` 子站。它保留主页与关于页已经建立的明亮、亲切、粉彩气质：真实头像、中文衬线标题、黄色强调和悬浮胶囊导航。`site-` 前缀 token 记录这两页的既有语义；`surface-`、`line-`、`text-` 记录共享纸面及配套边线、文字色，既有 `welcome-paper`、`project-paper`、`reading-paper` 也从同一配色源取值。`nav-` 记录三页共享导航，`control-` 记录白板工具及与导航共用的淡紫选中、紫色焦点。页面布局和字体各守既有语境。

`/2/system/` 以可以探索和整理的个人白板展示实际项目、文章、阅读资源与常用工具：暖白点阵、蓝色笔迹、纸张、胶带、拍立得与贴纸形成自由拼贴。卡片名称直接说明内容或目的地，主页截图标为“个人主页”，博客文章与博客书单归为“博客精选”。用户明确选择了这种白板材料，并否定规整卡片页；这些材料不是待清除的装饰。白板的具体内容顺序与首屏摆放由 `system/index.html` 中的卡片顺序和坐标属性维护，本文提取已经实现的视觉规则。

本次配色依据 `assets/palette.css`，以及 `assets/enhancements.css`、`assets/system.css` 的实际应用同步；共享纸面来自用户本人 Lofi Radio 站点的已采样卡片色。`index.html`、`about/index.html` 和 `system/index.html` 的内容与排字继续保留，导航与交互规则仍以 `assets/navigation.css`、`assets/system.js` 为准。身份与功能边界见 `PRODUCT.md`。真实头像与现有页面截图继续承担视觉身份；组件示例只复用这些资产，不添加虚构生活照片或成果。

**Key Characteristics:**

- 同一身份、分域表达：黄色衬线主页与蓝色手写白板各守自己的页面范围。
- 明亮的粉、紫、蓝、薄荷、杏桃、水青与浅黄纸面配同色细边，承托既有内容；导航和顶栏工具保留墨色、淡紫和圆润焦点。
- 手写标题有性格，正文与工具文字保留清晰的系统无衬线。
- 自由拼贴保留移动、缩放与层叠；顺序阅读始终有入口。
- 界面反馈说明当前工具、选中对象和保存结果，创作明确只留在本机。

**The Surface Boundary Rule.** 黄色衬线体系保留在主页与关于页；蓝色手写、点阵和纸张拼贴只适用于 `/2/system/`。共享作者身份，不共享所有页面构图。

## Colors

色值以前置 token 为准；共享卡片配色的代码源是 `assets/palette.css`。`site-cream` / `site-cream-dark` 保留旧语义名称，实际对应更浅的页面和区块底色。`nav-` 是三页共用导航，`control-` 是白板工具及共享状态色；它们继续使用已确认的白底与淡紫。彩色纸面、同色边线与深色文字用于区分内容容器。

### Primary

- **个人站点蓝**（`site-brand` / `site-brand-text`）：主页与关于页的链接、细节和焦点；黄色承担其主要视觉强调。
- **白板蓝墨**（`blue`）：手写标题、纸内链接、卡片选中描边和卡片焦点。**淡蓝纸面**（`blue-soft`）保留在菜单悬停等既有局部反馈，**淡蓝虚线**（`blue-line`）组织本地创作纸张、目录和工具栏分隔；作者内容卡片使用薄实线，导航与顶栏工具采用独立的暖色状态。

### Secondary

- **花园明黄**（`site-highlight`）：既有页的文字荧光笔与订阅按钮。
- **白板明黄**（`yellow`）：选区、创作按钮悬停与纸张链接反馈。
- **创作淡紫**（`create-paper`）：白板“贴一张”的静止状态，配紫色文字。
- **淡紫选中**（`control-fill`）：三页导航的当前项与白板激活工具，搭配紫色文字。
- **紫色焦点**（`control-focus`）：导航胶囊、顶栏工具、颜色选择、搜索与表单的键盘焦点。
- **教程暖黄**（`tutorial-highlight`）：深蓝教程卡的标题、箭头与链接焦点，使深纸面上的操作反馈保持清晰。
- **便签黄**（`sticky-yellow`）：便签默认纸色；本地便签、名片与待办还提供粉、蓝、绿、紫、白色选项。它们是用户选纸材料，不是新的全站品牌色。

### Neutral

- **极浅白底与淡紫灰底**（`site-cream` / `site-cream-dark`）：主页、关于页与 404 的页面底色，以及项目区、页脚等相邻层次；**花园墨色**（`site-ink`）继续承载正文。
- **白板暖白纸**（`paper`）：白板背景与弹窗。
- **白板墨色与次级墨色**（`ink` / `muted`）：白板正文与辅助解释；纸张变色时，已有纸张变体使用相应的深色文字。
- **照片白边**（`white`）：拍立得、输入框与部分卡片。不要把浅色边线当作文字颜色使用。
- **工具墨色、白色面与实线边界**（`control-ink` / `control-surface` / `control-line`）：顶栏工具的常态及画笔面板边界；**工具浅紫悬停**（`control-hover`）表达可点击反馈。
- **导航白底、细边与墨色**（`nav-surface` / `nav-border` / `nav-text` / `nav-ink`）：共享胶囊的白色面、淡紫灰边框、默认文字与加深文字；**导航浅紫悬停**（`nav-hover`）用于未激活项与头像入口。
- **浅黄、淡蓝与薄荷纸**（`welcome-paper` / `project-paper` / `reading-paper`）：对应共享源中的 `surface-yellow` / `surface-blue` / `surface-mint`。白板分别用于欢迎纸、项目纸与博客精选纸；主页也复用这些材料。
- **粉色、淡紫、杏桃与水青纸**（`surface-pink` / `surface-lilac` / `surface-peach` / `surface-aqua`）：用于首页项目和站点卡、关于页内容卡。白板联系纸使用粉色，工具窗口条使用淡紫；主页和关于页联系容器使用纯淡紫，404 提示也使用淡紫。
- **配套边线与文字**（`line-blue` 至 `line-yellow`、`text-blue` 至 `text-yellow`）：七组纸面各有同色细边和可读的深色文字。`surface-line` 提供普通容器的浅中性色边界；`authored-line` 继续作为白板普通作者卡的默认边界。
- **深蓝教程纸**（`tutorial-paper`）：实用教程卡的深色底；**教程浅色文字**（`tutorial-text` / `tutorial-muted`）分别承载文章名称和描述。

**The Lilac Controls Rule.** 站点导航、白板顶栏工具和颜色选择以白色底面、淡紫选中和紫色焦点表达状态；蓝色继续承担手写内容、纸内链接和卡片选择。分别沿用各自的状态色，控件状态与内容纸张分别使用各自的配色。

**The Paired Surface Rule.** 首页项目、站点和关于页 focus 卡采用同组纸面、边线与深色文字；悬停只加深同组边线并轻微上移，不增加阴影。导航继续使用自身的暖白淡紫状态。

## Typography

主页的显示标题与区块标题分别由 `site-display` / `site-heading` 记录；关于页保留自身的 Fraunces / Noto Serif SC / Songti SC 栈与标题尺寸，不能直接套用主页的大字尺寸。`site-body` 记录两页共用的正文栈。

白板中文手写标题使用 `headline` / `title`，分别记录欢迎卡与本地便签的层级；拉丁照片注释使用 `caption`，正文和工具标签使用 `body` / `label`。`field` 记录 16px 表单输入，搜索使用相同字号；`navigation` 记录三页均为 13px 的导航文字。前置层级记录的是已有角色，不要求所有卡片只有两种字号：作者内容卡标题保留 24–27px 的材料层级，项目和文章名称为 14–15px，说明多为 12–13px。

- **较长正文：**白板普通段落保持舒展行高；辅助说明多数为 12–13px，不用手写字体排长篇表单或操作说明。
- **题字与照片：**Caveat 用于简短拉丁文字和照片注释；主页截图的中文标题使用 LXGW WenKai（24px，行高 1.4）。缩放读数使用系统无衬线与等宽数字（12px）。
- **手机：**主页标题在窄屏使用现有的响应式覆盖；白板工具品牌与弹窗标题缩小，卡片正文通过画布缩放或列表阅读保持可达。导航仍为 13px，搜索与文字编辑字段保持 16px，搜索占位提示为 13px。
- **字体交付：**Fraunces、Noto Serif SC、LXGW WenKai 与 Caveat 当前由 Google Fonts 样式表加载并使用 `display=swap`。本地系统回退栈已经存在；当前实现没有自托管字体或离线字体保障。

**The Two Voices Rule.** 白板中文标题用 LXGW WenKai，拉丁手写题字与照片注释用 Caveat；较长内容、表单和工具标签回到系统无衬线。主页与关于页继续使用各自现有的 Fraunces / Noto Serif SC 标题栈。

## Layout

主页与关于页保留纵向内容流：主页容器上限为 1180px，关于页为 1120px；窄屏使用视口留白。`assets/enhancements.css` 定义共享的响应式区块间距与标题下间距，内容网格在 960px、800px、640px 附近按各自页面规则收拢。共享导航在 640px 与 360px 调整横向空间，始终保留画布入口。

白板使用全窗口工作区（100dvh）：顶部工具栏、可折叠左目录、可平移缩放的画布与底部胶囊导航。点阵以 26px 间距为基准，随视图缩放和平移同步变化。世界坐标初始区域为 1550 × 1300px；卡片自身的坐标、宽度、角度与缩放共同形成拼贴。九张内容卡和两张贴纸是当前种子内容，不是未来页面必须复制的组件数量。

- **宽屏：**目录常规宽度 210px；在 1150px 以下缩至 185px，独立撤销/重做组收进更多菜单。
- **手机：**760px 以下工具栏采用两行，主要操作有 44px 点击区；撤销、重做、帮助和全屏收进更多菜单。目录默认收起，展开宽度为 `min(290px, calc(100vw - 44px))`；画笔面板把颜色排在第一行，粗细与动作排在第二行。导航保留底部位置，状态提示抬到其上方；360px 以下进一步压缩品牌占用。
- **列表：**桌面采用自动列数、最小列宽 290px 的网格；手机转为单列，取消卡片旋转与绝对定位，工具栏成为紧凑的阅读页头。贴纸、笔迹与创作工具不占据阅读列表。
- **目录展开：**手机仅在显式 `sidebar-open` 状态隐藏底部导航，同时让画布不可交互。关闭或 Escape 恢复目录按钮焦点；选择目录项则把焦点交给目标卡片。
- **无 JavaScript：**HTML 初始即为列表阅读，显示真实正文、链接与站点导航；交互工具在脚本准备完成后出现。导航的隐藏条件必须依赖脚本设置的展开状态。

**The Readable Exit Rule.** 自由画布必须同时保留顺序阅读和目录定位。手机缩小工具占用空间时，不能同时丢掉这些浏览入口。

## Elevation & Depth

首页项目、站点卡及关于页 focus、belief 卡以纯色面和细边建立层次，静止时没有阴影。项目、站点与 focus 卡悬停保持无阴影，边线切到同组文字色，并上移 3px；无悬停能力的设备取消位移。主页与关于页的淡紫联系容器也没有阴影，内部链接使用半透明白面。

纸张保留低位、柔和、略带蓝灰或纸色的阴影，拍立得通过两层柔影突出纸面厚度。作者内容卡使用薄实线和略更清楚的悬停阴影；本地创作模板与工作区分隔保留原有虚线，工具按钮与画笔面板采用细实线。阴影表达纸张与画布底面的层次。共享导航使用轻柔的暖墨阴影，搜索和表单聚焦使用贴合轮廓的光圈。具体值由侧文件 `extensions.shadows` 记录，组件示例保留对应实现。

用户置顶改变持久卡片顺序；选中卡片临时处于其他卡片之上；笔迹层仍盖在卡片上。工具栏、目录、绘画面板与固定导航处于工作区界面层，不能随卡片拖动。弹窗使用浏览器 `dialog` 顶层和半透明背景保护编辑任务。

卡片响应拖动时改变阴影与光标，不做持续漂浮动画。目录定位和查看全貌使用短促的缓出居中；只有未请求减少动态效果时才应用该过渡。白板按钮仅对背景与边界做短过渡，避免让移动卡片产生额外缓动。

**The Paper Layer Rule.** 纸张的低位柔和阴影表达与画布底面的层次；选中、拖动和用户置顶表达交互层次。绘画覆盖卡片，不被卡片层叠顺序遮住。

## Shapes

主页项目、站点卡和关于页 focus、belief 卡采用细实线与 20px 圆角；联系容器保留 30px 圆角，手机为 24px，其他既有容器沿用自身轮廓。圆角按钮和胶囊导航继续保留。白板普通纸卡采用圆润纸边，便签和拍立得接近裁切直角；表单、工具按钮、弹窗各有较紧凑的角部层级。前置 `rounded` 只记录重复使用或明确命名的形状，不汇总所有单次角度。

作者内容卡采用薄实线纸边，拍立得以宽白边和柔影界定轮廓，深蓝教程纸以色面界定边界。本地创作模板和工作区分隔保留细虚线；顶栏工具与画笔面板使用细实线、圆润角部。欢迎纸上方保留略微倾斜的半透明胶带条；贴纸是透明背景上的独立内容对象。选中卡片的外侧描边、旋转工具与右下缩放柄必须能和纸边区分。

导航文字有独立的 44px 高点击区，背景上下各内缩 5px，形成 34px 高的胶囊；焦点轮廓画在同一个背景上。常态、悬停、按下与当前项共享胶囊轮廓，不能因点击区变高而变成接近圆形或方形的色块。搜索把焦点画在圆角容器上，输入框自身不叠加方形外框。

**The Capsule State Rule.** 导航的点击区与可见背景分开，全部状态沿用同一胶囊形状；手机只压缩横向留白，保留 44px 点击高度与圆角焦点。

工具 SVG 以无填充、圆端点、圆连接和一致线宽（1.7）绘制。查看全貌使用“框内有画面”的图形；全屏使用向外展开的四角，保持两个动作的辨识度。

**The Material Boundary Rule.** 作者内容卡的薄实线、本地模板的虚线、和纸胶带、拍立得边框和 emoji 贴纸各有使用范围。工具图标使用统一线宽的 SVG；贴纸内容不承担工具图标体系的职责。

## Components

### Buttons

白板普通工具按钮使用白色面、墨色文字和细实线；创作按钮为淡紫纸面，激活工具为淡紫底配紫色文字。桌面工具最小高度为 42px，手机主要工具为 44px；工具圆角采用 `rounded.tool`。悬停与按下分别加深纸面，已激活工具按下时保持淡紫；禁用态降低透明度并保留真实 disabled 语义。键盘焦点为紫色轮廓（2px，外偏移 2px），不依赖悬停反馈。

主页与关于页保留自己的实色胶囊按钮和边线按钮。三页导航采用共享的白底、淡紫状态，白板工具样式只用于白板操作。

### Chips

身份标签是浅黄胶囊，不伪装成筛选按钮。常用工具改为“开发／协作”分组文字，用分组名与工具名的字号、颜色层级组织内容。画笔和纸色圆点有 40px 点击区，色面内缩 7px，选中态以紫色圆环标记；键盘焦点沿圆形点击区绘制，并有文字形式的无障碍名称。

### Cards / Containers

主页项目与站点卡按共享色组选择背景、边线和标题色；站点地址直接显示在纸面上，项目辅助标签使用半透明白面。关于页 focus 卡复用相同材料，“我相信的几件事”三张引用卡依次采用粉、淡紫、浅蓝纸与同组边线、深色文字和淡色引号；长句按语意换行，12px 辅助标签在同一行卡片内底部对齐。主页和关于页联系容器采用纯淡紫纸、淡紫边线与白色链接面；页面、区块和页脚的较浅底色承托这些彩色容器。

作者内容卡以清晰标题、短描述和完整链接行承载实际内容：淡蓝纸呈现具体开源项目，薄荷纸呈现仅含博客链接的“博客精选”，深蓝纸呈现实用教程；主页截图直接标为“个人主页”。浅黄欢迎纸提供项目与教程入口，粉色纸呈现博客与联系，常用工具按开发和协作分组并使用淡紫窗口条。布局使用各自的宽度和留白，不统一为等尺寸卡片。本地便签、照片、名片和待办继续使用原有模板。

项目和文章链接整行可点击，名称与描述分层排列；悬停时给名称加下划线。作者卡片内链接的键盘焦点使用当前文字色（2px，外偏移 4px），深蓝教程卡改用浅暖黄，避免焦点融入纸面。

**The Literal Destination Rule.** 卡片标题、图片说明和链接名称直接说明实际内容或目的地，并与目录名称一致；白板展示资源时不借用书桌或花园名称替代。

选中后显示旋转、置顶与缩放工具；本地对象另有编辑和删除。拖拽姿态与叠放顺序可保存，列表阅读取消这些画布姿态。卡片链接保持原有链接语义，选中卡片不阻止明确的链接访问。

### Inputs / Fields

表单使用白色输入面与淡蓝实线，标签在字段上方；输入文字为 16px，多行内容允许竖向调整。搜索使用暖白面和 13px 圆角容器，内层输入高 44px。搜索与表单聚焦时边框切为紫色，并出现贴合原有圆角的柔和光圈；不叠加输入框的方形描边。弹窗里的标题与说明先交代正在创建的对象，纸色与模板选项使用显式选中状态。

输入错误以深红文字说明问题；保存失败、导出失败或存储不可用时提供可执行的恢复提示。不要把空白错误区域常驻为占位装饰。

### Navigation

三页共同加载 `assets/navigation.css`：主页与关于页放在顶部，白板放在底部。白色导航面内，各项以墨色文字、浅紫悬停和淡紫当前状态区分；焦点沿内缩胶囊绘制紫色轮廓（2px，外偏移 2px）。文字保持 13px，链接最小宽度依次为桌面 62px、640px 以下 54px、360px 以下 50px；可见背景始终高 34px，点击区始终高 44px。手机隐藏头像旁文字与额外行动入口，保留首页、作品、关于、画布的路径。博客入口采用紫色底与白字，悬停加深紫色；主页深色区段保留深底与浅字变体。

左目录支持搜索，点击后定位具体卡片并转移键盘焦点；列表模式则滚动到该项。未找到结果时显示短句和换词建议。手机目录展开时由搜索接收焦点，画布设为 inert，底部导航仅在显式展开状态隐藏；Escape 或关闭按钮返回目录触发按钮。目录与顺序阅读为两条不同的访问路径。

### Whiteboard Tools

“贴一张”可创建便签、拍立得、贴纸、名片与待办。绘画工具提供颜色、粗细和橡皮擦；绘画时暂时关闭卡片指针命中，让笔迹经过纸面。撤销/重做覆盖可恢复的编辑动作，在窄屏更多菜单中仍可找到。

画笔面板采用暖白面、细实线和 16px 圆角；手机颜色选项占一行，粗细滑块与两枚 44px 动作控件占下一行。滚轮按输入单位换算后每帧累计量限制在 ±120，以 `exp(-delta × 0.00055)` 围绕指针缩放，单次常见滚轮档约改变 7%；缩放按钮与键盘使用 1.12 及其倒数的步进。平移、双指缩放与列表阅读继续并存。

卡片姿态、本地卡片、笔迹和顺序存入 `88lin.whiteboard.v2`；该键记录实现边界，不表达公共数据服务。JSON 导入/备份和 PNG 导出是不同动作，菜单文字必须区别可继续编辑的备份与静态图片。导入会替换当前本机状态并可撤销，因此保留确认提示。照片保存在本机数据中，不上传。

## Do's and Don'ts

### Do:

- Do 保留主页与关于页的真实头像、衬线标题、黄色强调、粉彩内容面与顶部胶囊导航。
- Do 在白板上使用暖白点阵、蓝色手写、分域纸边、胶带、拍立得和自由旋转；作者内容卡用薄实线，本地创作保留原模板。
- Do 用真实站点内容和现有资产构成作者展示，并让图片说明与可见内容一致。
- Do 为主页彩色卡片从共享配色源成组使用纸面、边线与文字色，并保留这些卡片和纯淡紫联系区的无阴影状态。
- Do 用实际目的地命名内容卡；在深色教程纸上保留浅色标题、描述和可辨认的键盘焦点。
- Do 让选中工具、选中卡片、键盘焦点和输入错误各有可辨认状态。
- Do 让三页导航在常态、悬停、点击、当前项与键盘焦点下保持胶囊，保留 44px 点击区和 13px 导航文字。
- Do 让搜索和编辑字段保持 16px 输入文字，并把焦点轮廓贴合容器圆角。
- Do 保留白板的目录、列表阅读、无 JavaScript 正文与手机上的工具入口。
- Do 在保存、备份、导入与照片流程中明确说明本机保存，并提供失败后的恢复动作。

### Don't:

- Don't 将 `/2/system/` 的白板构图、蓝色手写或底部工具导航当作主页与关于页的全站替换规范。
- Don't 把白板重新排成等尺寸营销卡片网格，或用普通首屏介绍替代可探索的画布。
- Don't 把用户指定的贴纸、纸边和胶带按泛化审美禁令删除。
- Don't 用 emoji 或 Unicode 字符扩充工具图标体系；贴纸仍可作为独立内容对象。
- Don't 把本机创作描述为公共留言、跨设备同步或已上传的照片。
- Don't 宣称 Google Fonts 已自托管或离线可用；保留现有回退栈，并准确说明实际加载方式。
