# 贡献指南 · Contributing

欢迎为 gzh-skill 贡献新主题风格、修复排版问题或改进文档。

## 项目结构速览

- `SKILL.md` — 排版工作流主文档（Agent 入口）
- `references/` — 18 套主题组件库 + 通用增量库 + 主题索引 + 主题生成器 + 触发用例
- `scripts/` — 校验脚本（`component_lint.py` / `validate_gzh_html.py`）+ 预览包装（`wrap_preview.py`）+ docx 抽取（`extract_docx.py`）+ 可选的草稿上传脚本（`wechat_draft.py` / `minify_gzh_html.py`）
- `assets/` — 演示输入文章
- `docs/gallery/` — 主题风格的浏览器预览
- `docs/previews/` — 带手机 viewport 和复制按钮的在线预览页，由正文与共享模板生成

## 可验证循环（改动前后都要跑）

任何改动组件库或 SKILL 后，按这个双关卡闭环自检，两关全绿才提 PR：

```bash
python -m unittest discover -s tests -v

# 源头关：扫所有组件库的 HTML 块，查大空白 / 正文虚线框 / 平台禁用项 / 移动端死宽（≥150px 固定宽未配 max-width）
python3 scripts/component_lint.py .

# 产物关：用改动后的 skill 排版 assets/sample-article.md，再校验产物
python3 scripts/validate_gzh_html.py <生成的.html>
```

- `component_lint.py` 须 **0 ERROR**
- `validate_gzh_html.py` 须 **0 ERROR、半角标点 0 WARN**
- 两关的**文字背景渐变 WARN 须逐项评估**：优先使用视觉接近的非渐变实现，荧光笔保留底部半高亮、不能直接改成整块底色；必要效果说明保留理由与深色模式验证情况。遵循[微信规范 4.1.2](https://developers.weixin.qq.com/doc/service/guide/product/plugin_spec.html#_4-1-2)，同时对照改前效果，避免为告警清零而改变主题设计。
- **完整文章的顶层区块对齐须显式设置**：产物 CLI 和 `.html` 示例校验会提醒缺少 `text-align:left/right/center/justify`；可复用的 Markdown 组件片段允许继承装配容器。临时片段使用 `python scripts/validate_gzh_html.py --fragment <片段.html>` 或 `--stdin --fragment`，仅跳过顶层独立对齐要求，显式 `start/end`、文字背景渐变和禁用项等检查仍然执行。`--stdin` 只选择输入来源，不自动切换片段模式。无文字的装饰元素不报文字对齐警告。
- **内阴影半高亮的验证边界**：本轮已做本地浏览器前后显示、真实剪贴板 HTML 和回归检查，尚未完成微信 iOS / Android 真机的浅色、深色模式验证。不能据此声称“内阴影在微信深色模式安全”，也没有依据断言微信一定不识别 `box-shadow`。验收时用同一篇含标题高亮、正文半高亮和原有纯色标签的文章，在两端切换浅色 / 深色模式，记录微信版本、系统版本及文字和色带是否清晰；浏览器的 `prefers-color-scheme` 模拟不能代替这一步。

细节见 `references/eval-cases.md` 的「维护 · 可验证循环」一节。

## 新增一套主题风格

1. 照 `references/theme-red-white.md` 的结构，新建一份 `references/theme-{你的英文标识}.md`（如 `theme-ocean-breeze.md`；内含设计变量 + 各组件 HTML + 模板骨架 + 映射规则，标题里的风格显示名可用中文）。
2. 硬性约束：所有样式内联、文字用 `<span leaf="">` 包裹、禁 `div/class/id/style/grid/position/var/@media`、正文强调用左竖条或小标签而**非四周虚线框**、代码块用「每行一个 `<p>`」而**非 `white-space:pre`**。
3. 在 `references/theme-index.md` 登记（主色 + 适用场景 + 组件库文件 + 正文下划线 CSS）。
4. 跑可验证循环，两关全绿。
5. 提 PR，附上用 `assets/sample-article.md` 生成的预览 HTML。

## 提交规范

发布面向用户的新版时，递增根目录 `VERSION` 中的三段式版本号（如 `1.0.0` → `1.0.1`），与改动一起提交，并为该提交发布同名正式 Release（标签 `v1.0.1`）。发布工作流会校验标签与包内版本一致，并将 `VERSION` 附到 Release；也可手动上传该文件。确认附件上传成功后，新版提醒才能使用。草稿和预发布不触发提醒，普通提交不单独发版。

检查优先读取 `https://github.com/88lin/gzh-skill-kit/releases/latest/download/VERSION`，失败后尝试在地址前加 `https://ghfast.top/`，每个来源使用短超时，不依赖 GitHub API 的匿名额度。更新提醒缓存保存在用户目录的 `.gzh-skill-kit/update-check.json`，不随技能发布；脚本不拉取或替换技能文件。Git 安装和 ZIP 安装均使用随包附带的 `VERSION`。

- 一个 PR 只做一件事（一套新主题 / 一处修复 / 一处文档）。
- commit 信息说清「改了什么 + 为什么」。
- 不要提交本地排版产物（`.gitignore` 已忽略 `*_排版_*.html`）。

修改 `docs/gallery/` 正文或 `assets/preview-template.html` 后，运行 `python scripts/build_gallery_previews.py`，将生成的 `docs/previews/` 一并提交；回归测试会检查预览与源文件是否一致。主题详情的公开入口链接到 `docs/previews/`，公众号合规校验继续使用 `docs/gallery/` 的纯正文。

回归测试依赖 `requests`、`Pillow` 与 `markdown-it-py`，使用模拟微信响应，不会上传真实草稿。CI 在 Windows/Linux 上运行测试、组件校验、画廊校验和 PNG 完整性检查。

预览页的浏览器回归在独立的 Linux CI 任务中运行，覆盖手机视口以及复制成功/失败分支。本地运行方式：

```bash
python -m pip install playwright
python -m playwright install chromium
python tests/browser_preview.py
```
