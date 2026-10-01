# `/2` 迁移检查（2026-10-01）

个人主页已迁移到 `https://88lin.eu.org/`，独立仓库为 `88lin/home`。本站继续作为工具导航。

本仓库修复：

- `_redirects` 为 `/2/about/index.html`、`/2/system/index.html` 添加精确 301，保留其他 `/2/*` 路径后缀。
- 三个 HTML 跳转页保留查询参数与 `#` 定位，脚本先于 meta refresh 执行；关闭 JavaScript 后仍可跳转或点击链接。
- 移除 `love1/index.html` 的重复 ID，保留现有动画。

`go.88lin.eu.org` 使用 Cloudflare Pages，会执行 `_redirects`；GitHub Pages 使用对应 HTML 跳转页。新站 `88lin.eu.org` 使用帽子云，不能假设它执行 `_redirects`。

**2026-10-01 复核纠正：** 上一版把 HEAD 响应误当成浏览器访问结果。帽子云对 `/about`、`/system` 的 HEAD 请求返回 404，但浏览器采用的 GET 请求会 302 到对应目录地址，随后正常加载 `index.html`。新站支持不带尾斜杠访问目录，不需要为此修复。不存在的目录仍返回 JSON 404，未展示仓库中的 404 HTML；这一项才依赖托管层支持。

Cloudflare 旧站的 `/vip`、`/vip/index.html` 均会 308 到 `/vip/`，可正常访问；不存在的路径返回 HTML 404。本轮 GET 复核确认 `/2/about/index.html`、`/2/system/index.html` 的精确迁移规则已在线上生效，分别跳转到新站对应子页并保留查询参数。

后续改动复核恢复关于页和白板入口为带尾斜杠的最终地址，避免不必要的 302。GET 实测发现帽子云补斜杠时还会丢弃查询参数；旧站 Cloudflare 的迁移 301 则保留查询参数。新站另外修复白板保存失败却被覆盖成“导入成功”的提示；当前创作仍保留在页面中，可导出备份。

本轮 GET 检查覆盖 53 个 URL，均成功响应，其中两个站点地图里的 41 页全部返回 200 HTML。本地 Chromium 102 项回归检查通过，包括 320 / 390 / 768 / 1440 px、搜索、项目展开、白板保存/拖动/导入导出、帮助弹窗、20 组跳转与无脚本阅读。另通过 11 项白板功能检查，以及路由检查、JavaScript 语法、sitemap 检查和 `git diff --check`。第三方工具的全部业务流程不在这组回归范围内。

详细证据、帽子云限制与发布检查记录在 `88lin/home` 的 `MIGRATION-AUDIT.md`。工作期间首页及 `love2` 的其他工作区改动保留，不归入本次修复。
