# 个人主页 SEO / GEO 优化记录

核对日期：2026-09-20。范围是 `/2/` 个人主页、`/2/about/` 关于页和 `/2/404.html`，以及域名根目录中与这些页面有关的发现入口。

当前正式网址为 `https://go.88lin.eu.org/2/`。GitHub Pages 的同路径副本使用这一正式网址作为 canonical。本次修改已写入本地文件；发布后的抓取、收录和 AI 引用情况需要另行观察。

## 已处理的问题

| 优先级 | 核对发现 | 已实施的调整 |
| --- | --- | --- |
| 高 | 线上 `/2/index.html` 和 `/2/about/index.html` 均 308 跳转到目录网址，页面 canonical 却指回跳转前地址 | canonical、`og:url`、内部导航、根目录入口、sitemap 和内容索引统一使用 `/2/` 与 `/2/about/` |
| 中 | 两个页面在原始 HTML 和浏览器渲染后均没有 JSON-LD | 首页加入 WebSite、Person、CollectionPage 和三个 ItemList；关于页加入指向同一 Person 的 ProfilePage |
| 中 | 搜索摘要偏向个人口号，未充分说明可找到哪些项目和资料 | 更新独立标题、description、OG / Twitter 分享信息；首页介绍明确 AI Agent、MCP、源码与博客内容 |
| 中 | 项目没有稳定的片段地址，引用难以定位到具体卡片 | 为 14 个项目设置固定 ID；原生折叠区中的项目也能通过片段链接展开定位，并为固定导航预留滚动距离 |
| 中 | 根目录 `llms.txt` 中个人主页说明较少、地址仍含 `index.html` | 更新根索引，新增从页面生成的 `/2/llms.txt`，涵盖 14 个项目、6 个站点、6 篇文章及作者信息 |
| 低 | 分享图片已有 1200 × 630 JPEG，但未声明图片尺寸、格式和替代文本 | 补齐图片元数据，复用已有真实页面截图 |
| 低 | GitHub 统计有日期和统计口径，但缺少紧邻说明的来源链接 | 统计说明链接到作者的 GitHub 仓库列表，保留快照日期和包含 Fork 的口径 |

首页主要承接「88lin、茉灵智库、AI Agent 开源项目」及具体项目名称；关于页承接作者身份、MCP / RAG 实践方向与联系方式。原有大标题、粉彩风格和内容分区保留，没有批量添加关键词段落或重复文章。

## 抓取配置的实际含义

- 对当前 `/2/` 部署方式，只有域名根目录的 `/robots.txt` 控制抓取；`/2/robots.txt` 不会覆盖它，文件中已注明。
- 原来的通配规则已经允许抓取。新增 `OAI-SearchBot` 的明确允许项是声明搜索用途，并非修复一个原本存在的封锁。
- OpenAI 的 `OAI-SearchBot` 用于搜索发现，`GPTBot` 用于模型训练，二者独立。原有 GPTBot、ClaudeBot、Google-Extended 等规则未改变。
- Google-Extended 不控制 Google Search 收录或排名；Google Search 的 AI 功能仍遵循 Googlebot、索引和摘要预览规则。
- 首页与关于页允许索引和完整摘要预览；404 页面保留 `noindex, follow`，没有加入 sitemap。
- 线上随机不存在路径已实测返回 HTTP 404，HTTP 网址会 301 跳转到 HTTPS。这些是已有正确行为；本次没有修改部署平台规则，也没有验证真实爬虫 IP 的 CDN 放行情况。

## 结构化数据与内容来源

JSON-LD 直接位于静态 HTML 中，抓取不依赖 JavaScript。`Person` 使用页面已展示的身份、技能、邮箱、GitHub 与 B 站账号；两个页面引用同一作者 ID。

项目目录使用 `ItemList` 与 `SoftwareSourceCode`，包含卡片中实际存在的名称、说明和源码仓库。基于上游维护的项目保留原说明，没有把 GitHub Stars 写成评价分数，也没有推定商业许可或原作者身份。

站点与文章目录标记为指向外部页面的列表。主页只有文章摘要，没有把外部博客全文标记成本站撰写的 Article，也没有凭空添加文章作者、发布日期、评分或 FAQ。

`llms.txt` 是辅助内容索引，不能替代可见 HTML、robots.txt 或 sitemap；不能据此保证某个平台会读取、收录或引用。Google 官方明确说明，其 AI 功能不要求额外的 AI 文本文件或专门的 Schema。

## 验证记录

- 用 Schema.org 官方词汇表检查 JSON-LD 类型、属性及属性适用类型；检查图内引用、作者一致性和 JSON 语法，均通过。
- 逐项比对页面卡片与结构化目录：14 个项目、6 个站点、6 篇文章的名称、说明与目标地址一致。
- 检查唯一 canonical、独立标题和摘要、分享信息一致性、站点地图地址、robots 规则、本地资源、片段地址及内联 JavaScript 语法，均通过。
- Chromium 检查三个页面在 1440、768、390、320 px 下的显示，共 12 组；未发现横向溢出、内容裁切、页面脚本错误或 HTTP 资源错误。
- 在开启和关闭 JavaScript 两种情况下，验证折叠区项目的直达链接、自动展开与定位，以及首页 / 关于页导航。
- 生成脚本再次运行后输出逐字节一致；`git diff --check` 通过。

以上是本地校验结果，不等同于 Google Rich Results Test 的线上资格判定，也不是 Search Console 收录报告或真实用户 Core Web Vitals 数据。

另取了 [Is Agentic 的线上基线报告](https://is-agentic.com/scan/go.88lin.eu.org/2)，其当时分数为 57。该报告包含 OpenAPI、公共 API、JSON 错误响应等静态个人主页不适用的项目，并报告了与直接 HTTP 核对不一致的 soft-404；因此没有把该分数作为本次改动的验收标准。该工具扫描的是发布站点，不能反映尚未发布的本地文件。

## 后续维护

先编辑 HTML 中的真实内容，再在仓库根目录执行：

```powershell
python 2/scripts/build-seo.py --updated 2026-09-20
```

日期应替换为内容实际修改或核对日期。脚本只使用 Python 标准库，生成两个页面的 JSON-LD、项目片段 ID 和 `2/llms.txt`；访问者无需运行脚本，发布时直接使用生成后的静态文件。

作者固定身份与社交账号在脚本中维护；项目、文章、站点、技能、邮箱及页面元信息从 HTML 提取。不要手动改写生成的 JSON-LD。已有项目 ID 是外部引用地址，重命名项目或修改 ID 生成规则前应考虑旧链接的兼容性。

内容更新后同步根目录 `sitemap.xml` 中对应页面的真实 `lastmod`，必要时更新根目录 `llms.txt` 的简介。不要为了伪造新鲜度而自动每天改日期。

## 发布后核对

1. 检查 `/2/`、`/2/about/` 返回更新后的标题、canonical 和 JSON-LD；旧 `index.html` 地址继续正确跳转。
2. 确认根目录 `robots.txt`、`sitemap.xml`、`llms.txt` 与 `/2/llms.txt` 一并发布。
3. 在已有 Google Search Console / Bing Webmaster Tools 站点中检查两个正式网址。若根 sitemap 已提交，无需创建重复站点地图；可按需请求重新抓取。
4. 用 [Google Rich Results Test](https://search.google.com/test/rich-results) 检查已发布的关于页，用 [Schema.org Validator](https://validator.schema.org/) 检查通用结构化数据。
5. 观察品牌词、具体项目名称和 AI / MCP 实践相关查询的曝光、点击和引用来源；AI 答案有波动，同一查询应重复采样，不把一次回答当成稳定排名。

## 核对依据

- [Google Search：AI 功能与网站](https://developers.google.com/search/docs/appearance/ai-features)
- [OpenAI：搜索与训练爬虫](https://developers.openai.com/api/docs/bots)
- [Google：常见爬虫与 Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)
- [Google：ProfilePage 结构化数据](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Schema.org 官方词汇表](https://schema.org/version/latest/schemaorg-current-https.jsonld)
