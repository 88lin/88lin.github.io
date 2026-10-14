# SEO / GEO 优化与验证记录

日期：2026-09-28。目标站点：https://go.88lin.eu.org/ 。本次为本地代码修改与验证，未提交、推送或部署。

## 采用的方法与边界

阅读了 [geo-book-skill](https://github.com/88lin/geo-book-skill) 的 README、技能入口，以及 [AI 爬虫访问](https://github.com/88lin/geo-book-skill/blob/main/geo-playbook/references/capabilities/ai-crawler-access.md)、[可引用内容](https://github.com/88lin/geo-book-skill/blob/main/geo-playbook/references/capabilities/citable-content-spec.md) 两张能力卡。采用“访问 → 定向 → 理解 → 可引用”的修复顺序，补充可核验的功能、作者、联系方式与适用边界。源码相关说明按作者确认的口径写为“可联系作者索取”，不宣称公开仓库或开源许可。

结合本地 `seo-audit`、`ai-seo`、`schema` 进行复审，以 `web-access` 检查线上响应，以 `webapp-testing` 验证本地移动端。没有机械套用文章字数、问答数量、排名比例等经验阈值，没有将训练爬虫等同于搜索检索，也没有把 llms.txt 当作收录或引用保证。

## 主要发现与修复

| 优先级 | 证据与问题 | 修复与作用 |
| --- | --- | --- |
| 高 | 41 个 sitemap 地址中，37 个先 308 跳转；页面 canonical 却指回旧地址 | canonical、OG URL、相关 JSON-LD/hreflang、首页内链与 sitemap 统一到实测返回 200 的最终 URL，保留原路径大小写。旧地址仍由现有服务器跳转 |
| 高 | 首页 `.reveal` 默认为透明；无脚本时主体不可见 | 默认可见，脚本运行后继续原有入场动画；无脚本也可浏览分类与链接；初始入口数量由 HTML 生成，避免显示为 0 |
| 高 | 首页 JSON-LD 的 5 条 FAQ 没有对应正文，其中“API Key 不存储”等表述与本地凭据功能不符 | 改为 3 条实际可展开的使用与来源说明；逐字校验正文和 FAQPage 一致性；明确本地凭据与第三方费用条件 |
| 中 | 书单书名只在图表脚本中；纯 HTML 提取没有书单内容 | 从现有数据生成 67 本完整文字目录和 CollectionPage / ItemList；注明星级是个人评价，不伪造平均分；保留原图表 |
| 中 | AI 模型检测容易被理解为模型身份鉴定；闲鱼工具宣称未实现的同音替换、拼音混排和“一键过审” | AI 页标题与说明明确接口测试用途；闲鱼页保留作者选定的标题，摘要和短文案只说明实际字符转换功能；功能、参数与按钮逻辑不变 |
| 中 | 古诗起名、音乐、图片浏览、延迟回放的描述不够准确 | 分别明确典籍/随机候选、第三方歌单依赖、本地图片文件夹、麦克风延迟反馈的实际用法 |
| 低 | llms.txt 罗列大量同类特效，部分描述与页面功能不同步 | 保留 18 个页面入口与 sitemap 链接，按页面用途维护简要说明；明确只是部分入口，不代表全部内容或重要性排序，不将少数工具写成网站主线 |
| 低 | `love2/index.html` 存在不存在的 `index/images/favicon.ico` | 删除失效的重复 favicon 声明，保留原来的有效图标声明 |

`robots.txt` 已允许所有用户代理访问，保留原有规则与 sitemap 声明。没有杜撰“豆包 / 元宝 / Kimi / DeepSeek 专用 UA”，没有新增训练限制，也没有改动百度、Bing、Google 的现有验证代码。

## 文件与用途

- `index.html`：首页说明采用“实用站点、轻工具与趣味项目”的概括，同步搜索/分享摘要与 JSON-LD；保留当前标题和品牌，修正内链、静态入口计数，增加无脚本提示及 3 条可见 FAQ，其中一条说明如何联系作者或索取源码。
- `css/main.css`：仅增加使用说明的局部样式，以及 `.reveal` 的无脚本可见性修复；现有色彩、网格、字体与布局保留。
- `books.html`：增加原生折叠文字目录、局部样式和结构化数据；图表配置与数据不变。
- `ai-model-checker.html`：标题、搜索/分享描述及可见简介纠偏，同步原有 WebApplication 描述与内容修改日期。`xy/index.html`：保留“闲鱼敏感词加密工具 | 茉灵智库”标题，仅修正摘要、副标题、本地处理说明与输出占位文字中的功能夸大。
- `Music/index.html`、`stop/index.html`、`notion/hy.html`：逐页补清标题中的实际工具用途；音乐与延迟回放同步描述，延迟回放同步原有结构化描述。
- `bbl/index.html`、`gushi/dist/index.html`：基于实际代码与页面文字修正描述，保留原有标题。
- 37 个页面的 canonical 等 URL 字段：完整列表见下方；其他页面不因本次优化统一改标题。
- `gushi/src/index.html`：仅同步模板内的 canonical 目标；源文件原有 noindex 保留，生产页面仍为 `gushi/dist/index.html`。
- `love2/index.html`：除 URL 规范化外，清理失效 favicon。
- `sitemap.xml`：保持 41 个页面，使用最终 URL；仅首页、AI、音乐、延迟回放、访客欢迎、实体编码、图片浏览、古诗起名和书单这 9 页更新 lastmod，其余日期不变。
- `llms.txt`：18 个页面入口与 sitemap 链接；允许使用“免费影视”“关于 88lin”等简短导航名称，不要求逐字复制页面标题。
- `docs/seo-geo-audit.md`：本记录，包含全部标题判断与网址修复清单。

## 交互变化

1. 首页目录之后新增“使用与来源说明”，3 条原生折叠问答默认收起，可用鼠标、触屏、键盘展开；提供作者介绍、QQ 与博客链接。源码问答说明可直接联系作者索取，没有添加公开源码仓库链接。
2. 书单左下角新增“查看文字版”入口，默认收起。展开后在面板内滚动，支持键盘开关；移动端面板不超过视口，关闭后继续操作原旭日图。
3. 禁用 JavaScript 时，首页主体和书单目录可读，原生问答可操作。搜索明确提示需要脚本；正常启用脚本时保留原搜索、分类及动画行为。
4. 原有可执行内联脚本及外部脚本引用均与 HEAD 一致；没有增加追踪、弹窗推送或新的 API 调用。

## 实际验证结果

以下结果区分首轮留存证据与作者修改后的复核，避免把旧版本记录当成当前检查。

- 首轮线上请求记录：41 个原 sitemap 页面均最终返回 HTTP 200，其中 37 个经过 1 次 308；新的规范地址来自这些最终响应。本轮未重新测量线上响应。
- 首轮线上首页 UA 探测：`Baiduspider`、`bingbot`、`Sogou web spider`、`360Spider`、`Bytespider`、`OAI-SearchBot` 和普通浏览器共 7 次均返回 200，未发现 `X-Robots-Tag: noindex`。这是测试环境发出的 UA 探测，不等于真实爬虫访问日志。
- 当前本地复核：41 个唯一 sitemap URL 均有页面目标，canonical 与 sitemap 逐页一致，页面未被 noindex 阻止；14 个 JSON-LD 块可解析；3 条 FAQ 与正文逐字一致；上述 7 种 UA 对这 41 个 URL 的 robots 规则检查通过。
- 对本轮涉及的 39 个 HTML 文件检查脚本和引用：可执行内联脚本及外部脚本引用与 HEAD 相同，未发现缺失的本站链接或静态资源目标。原生折叠区通过 HTML 实现，不新增脚本。
- 当前 `llms.txt` 含 18 个页面入口及 sitemap 链接，均有本地目标。访客欢迎页使用作者当前的“访客欢迎组件｜茉灵智库”标题；闲鱼页摘要与代码实际功能同步。
- 当前 Chromium 本地复测覆盖 320、390、1440 px：首页搜索、清空、分类、空结果与 3 条问答展开/键盘关闭正常；新增 QQ 与博客链接地址正确；书单图表可渲染，67 本书的图表数据、文字目录和 JSON-LD 对应，目录可滚动及键盘开关；闲鱼页转换与清空正常，无横向溢出。
- 390 px 验证 `?q=起名` 深链接及 AI 页表单显示；未填写 API 凭据。禁用 JavaScript 后首页主体、52 个分类入口、源码问答和 67 本文字书单可读。
- 本轮浏览器复测无页面 JavaScript 异常，并检查新增问答与闲鱼页的手机截图。
- `git diff --check` 与 `git diff --cached --check` 均通过。补充修正保留在工作区，没有覆盖作者原有暂存快照。

本轮使用临时审计与浏览器测试脚本，未向仓库新增检查程序。原记录所提的 `scripts/check-seo.py` 当前不存在，不能作为后续维护命令使用。

以上检查验证本地改动和当前线上访问条件，没有运行搜索平台的外部结构化数据验证服务；不宣称已通过 Rich Results Test，也未测量真实用户 Core Web Vitals。没有登录站长平台或逐个 AI 产品采样，未验证当前收录量与引用率。

## 后续维护

更新书单数据时，同步旭日图、文字目录与 JSON-LD 的书名和数量；更新页面标题或描述时，核对分享摘要及 `llms.txt` 中的相关条目；更新 FAQ 时保持正文与 FAQPage 一致。提交前检查工作区和暂存区差异，运行 `git diff --check`、`git diff --cached --check`，涉及可见内容时再检查手机显示。真实正文发生变化时再维护对应 sitemap 的 lastmod，不随每次构建刷新全站日期。

发布后可在已有百度/Bing 站长账户确认 sitemap 抓取状态，并按搜狗/360 当时提供的渠道查看发现情况。GEO 观察应固定具体问题、记录日期与来源链接，分别记录“提及名称”和“引用本页”；少量多次观察，避免把一次回答或可抓取性当成收录与引用结果。

## 逐页标题判断

以 HEAD 与当前工作区对照，共审查 41 个可索引页面，5 个标题有差异、36 个保留，其中首页仅更换分隔符。5 个当前标题为 11–20 个字符；访客欢迎页和闲鱼页采用作者自行修改后的版本，不统一删除品牌。以下“保留”表示保留当前选择，不为凑关键词替换原表达。

| 文件 | 修改前 | 修改后 | 理由 |
| --- | --- | --- | --- |
| `2/about/index.html` | 关于 88lin｜AI Agent、MCP 与知识库实践 | 保留 | 主题已清楚，保留原有表达。 |
| `2/index.html` | 88lin · 茉灵智库｜AI Agent 与开源项目 | 保留 | 主题已清楚，保留原有表达。 |
| `2/system/index.html` | 88lin 的白板｜开源项目、博客与工具 | 保留 | 主题已清楚，保留原有表达。 |
| `Bookmarks/index.html` | 书签管理与导出工具 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `Christmas/index.html` | 3D 粒子圣诞树 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `Christmas1/index.html` | 圣诞音乐粒子树 · 版本一｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `Christmas2/index.html` | 圣诞表白粒子树 · 版本二｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `Christmas3/index.html` | 圣诞节特效 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `Mortgage-Calculator/index.html` | 深度房贷计算器｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `Music/index.html` | 茉灵智库Music - 用音乐感染人心 | 在线音乐播放器｜用音乐感染人心 | 保留“用音乐感染人心”和播放器用途，删除重复品牌与 Music。 |
| `academic-poster-generator/index.html` | 科研学习分享海报生成器｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `ai-model-checker.html` | AI模型检测工具 - 查询API可用模型列表 \| 茉灵智库 | AI 模型检测｜模型列表与对话测试 | 保留模型列表与对话测试，删除重复的工具、API 和品牌字样。 |
| `bbl/index.html` | 瀑布流图片浏览器 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `birthday/index.html` | 生日祝福特效｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `books.html` | 个人书单旭日图｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `christmas-tree/index.html` | 3D粒子圣诞树 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `duanju/index.html` | 免费短剧搜索与播放平台｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `fireworks/1.html` | 请我喝咖啡｜支持茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `fireworks/index.html` | 跨年烟花模拟特效｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `fireworks1/index.html` | 烟花模拟特效 · 版本一｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `fireworks2/index.html` | 烟花模拟特效 · 版本二｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `fireworks3/index.html` | 跨年烟花 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `fireworks4/index.html` | 新年快乐烟花特效｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `gushi/dist/index.html` | 你的名字 · 古诗文起名 | 保留 | 主题已清楚，保留原有表达。 |
| `gzh/index.html` | 关注「茉灵智库」微信公众号 | 保留 | 主题已清楚，保留原有表达。 |
| `index.html` | 免费在线工具导航-发现优质工具与趣味项目 | 免费在线工具导航｜发现优质工具与趣味项目 | 仅将半角连字符换为竖线分隔符，原有表达与长度保持不变。 |
| `jiangchong/index.html` | 论文降重工具 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `love1/index.html` | 520 表白特效 · 版本一｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `love2/index.html` | 520 表白特效 · 版本二｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `love3/index.html` | 520 表白特效 · 版本三｜茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `notion/1/index.html` | 植物生长动画组件｜Notion 小组件 | 保留 | 主题已清楚，保留原有表达。 |
| `notion/2/index.html` | 显示时间组件｜Notion 小组件 | 保留 | 主题已清楚，保留原有表达。 |
| `notion/3/index.html` | Notion倒计时组件 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `notion/6/index.html` | 音乐热歌榜组件｜Notion 小组件 | 保留 | 主题已清楚，保留原有表达。 |
| `notion/7/index.html` | 窗外动画组件 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `notion/8/index.html` | Notion简易计时器 \| 茉灵智库 | 保留 | 主题已清楚，保留原有表达。 |
| `notion/hy.html` | 欢迎页面 \| 茉灵智库 | 访客欢迎组件｜茉灵智库 | 采用作者修改后的标题，明确组件用途，保留品牌。 |
| `notion/shici/index.html` | 诗韵 · 每日诗词组件｜Notion 小组件 | 保留 | 主题已清楚，保留原有表达。 |
| `stop/index.html` | STFU外放干扰工具 \| 茉灵智库 | STFU 延迟回放工具 | 保留 STFU 与延迟回放用途，麦克风等细节留在描述中。 |
| `vip/index.html` | 全网 VIP 视频解析｜免费在线播放 | 保留 | 主题已清楚，保留原有表达。 |
| `xy/index.html` | 闲鱼敏感词加密工具 \| 茉灵智库 | 保留 | 保留作者选定的标题，将实际转换能力写入摘要和页面说明。 |

## 规范 URL 修复清单

下列 37 个原地址在线上均返回 308 后到达 HTTP 200。统一页面声明与 sitemap 后，旧外链继续由现有部署平台兼容。

| 页面文件 | 原路径 | 最终路径 |
| --- | --- | --- |
| `Bookmarks/index.html` | `/Bookmarks/index.html` | `/Bookmarks/` |
| `Christmas/index.html` | `/Christmas/index.html` | `/Christmas/` |
| `Christmas1/index.html` | `/Christmas1/index.html` | `/Christmas1/` |
| `Christmas2/index.html` | `/Christmas2/index.html` | `/Christmas2/` |
| `Christmas3/index.html` | `/Christmas3/index.html` | `/Christmas3/` |
| `Mortgage-Calculator/index.html` | `/Mortgage-Calculator/index.html` | `/Mortgage-Calculator/` |
| `Music/index.html` | `/Music/index.html` | `/Music/` |
| `academic-poster-generator/index.html` | `/academic-poster-generator/index.html` | `/academic-poster-generator/` |
| `ai-model-checker.html` | `/ai-model-checker.html` | `/ai-model-checker` |
| `bbl/index.html` | `/bbl/index.html` | `/bbl/` |
| `birthday/index.html` | `/birthday/index.html` | `/birthday/` |
| `books.html` | `/books.html` | `/books` |
| `christmas-tree/index.html` | `/christmas-tree/index.html` | `/christmas-tree/` |
| `duanju/index.html` | `/duanju/index.html` | `/duanju/` |
| `fireworks/1.html` | `/fireworks/1.html` | `/fireworks/1` |
| `fireworks/index.html` | `/fireworks/index.html` | `/fireworks/` |
| `fireworks1/index.html` | `/fireworks1/index.html` | `/fireworks1/` |
| `fireworks2/index.html` | `/fireworks2/index.html` | `/fireworks2/` |
| `fireworks3/index.html` | `/fireworks3/index.html` | `/fireworks3/` |
| `fireworks4/index.html` | `/fireworks4/index.html` | `/fireworks4/` |
| `gushi/dist/index.html` | `/gushi/dist/index.html` | `/gushi/dist/` |
| `gzh/index.html` | `/gzh/index.html` | `/gzh/` |
| `jiangchong/index.html` | `/jiangchong/index.html` | `/jiangchong/` |
| `love1/index.html` | `/love1/index.html` | `/love1/` |
| `love2/index.html` | `/love2/index.html` | `/love2/` |
| `love3/index.html` | `/love3/index.html` | `/love3/` |
| `notion/1/index.html` | `/notion/1/index.html` | `/notion/1/` |
| `notion/2/index.html` | `/notion/2/index.html` | `/notion/2/` |
| `notion/3/index.html` | `/notion/3/index.html` | `/notion/3/` |
| `notion/6/index.html` | `/notion/6/index.html` | `/notion/6/` |
| `notion/7/index.html` | `/notion/7/index.html` | `/notion/7/` |
| `notion/8/index.html` | `/notion/8/index.html` | `/notion/8/` |
| `notion/hy.html` | `/notion/hy.html` | `/notion/hy` |
| `notion/shici/index.html` | `/notion/shici/index.html` | `/notion/shici/` |
| `stop/index.html` | `/stop/index.html` | `/stop/` |
| `vip/index.html` | `/vip/index.html` | `/vip/` |
| `xy/index.html` | `/xy/index.html` | `/xy/` |
