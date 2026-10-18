# 🛠 进阶使用与开发说明

[← 回到首页：一句话发给 AI](../README.md#quick-start)

**中文** / [English](advanced.en.md)

默认使用方式是把首页提示词发给 AI。这里供希望手动安装、配置草稿箱或参与开发的人查阅；也可以把本页交给 AI，让它协助操作。

主题装配由 Agent 完成，仓库没有独立的 Markdown → 主题 HTML 渲染 CLI。

下方 `scripts/...` 命令均从技能安装目录或仓库根目录执行，文章参数请换成实际路径；系统只有 `python3` 时，把 `python` 改为 `python3`。

## 🛠 手动安装

| 需要什么 | 用途 |
| --- | --- |
| 可加载 Skill 的 AI Agent | 阅读组件库、分析文章、生成 HTML |
| Python 3（建议 3.13，与 CI 一致） | 运行校验、预览和 Word 抽取脚本 |
| Node.js LTS / npm | 使用下面的 `npx` 安装方式时需要 |
| 浏览器 | 打开预览页、复制富文本 |

在终端运行，按安装器提示选择客户端和安装范围：

```bash
npx skills add https://github.com/88lin/gzh-skill-kit
```

仓库名是 `gzh-skill-kit`，技能在 [SKILL.md](../SKILL.md) 中的名称是 **`gzh-skill`**。安装完成后，确认客户端能找到该技能；必要时重新加载客户端或开启新会话。

<details>
<summary>其他安装方式：交给 Agent，或手动安装</summary>

把这段话发给 Agent：

```text
请帮我安装 https://github.com/88lin/gzh-skill-kit 这个 Skill，
按当前客户端的技能目录规范接入，并确认能读取 SKILL.md 和运行校验脚本。
```

以 Claude Code 的项目级安装为例，在你的项目目录执行（需要 Git）：

```bash
git clone https://github.com/88lin/gzh-skill-kit.git .claude/skills/gzh-skill
```

其他客户端请使用各自支持的技能目录。已有安装时先检查本地修改，避免直接覆盖自定义主题。

</details>

<a id="tutorials"></a>

## 使用教程

### 选一种适合自己的工作方式

| 你希望怎么做 | 对 Agent 说 | 工作方式 |
| --- | --- | --- |
| 自己选好风格 | 「用红白色系排版 article.md」 | 直接使用指定主题 |
| 让 Agent 推荐 | 「帮我排版这篇公众号文章」 | 按题材推荐主题，再确认 |
| 一次完成 | 「自动排版 article.md，不用问我主题」 | 自动判断结构和主题，交付时说明选择 |
| 先审核重点 | 「先标注 article.md，先不要生成 HTML」 | 先交付 `_annotated.md`，确认后再渲染 |
| 对比风格 | 「用科技钴蓝和奶咖信纸各排一版」 | 分别生成正文与预览，便于比较 |

未指定主题且题材没有明显倾向时，默认推荐 **科技钴蓝**。主题可以用中文名，也可以用 [主题索引](../references/theme-index.md) 中的英文标识指定。

### 教程一：准备一篇更好排版的 Markdown

用 `#` 写标题、`##` 分章节，明确标出引用、重点、图片和代码；Agent 更容易保留你的结构意图。

````markdown
# 把重复工作交给自动化

> 从一个小任务开始，先让流程跑通。

## 选择第一个任务

优先选择 **高频、规则清楚** 的操作。先记录 ++输入与输出++。

- 写下触发条件
- 保留一次人工检查

## 验证结果

```python
print("Hello, workflow!")
```

参考：[项目文档](https://example.com/docs)
````

需要配图时，添加 `![图片说明](images/demo.jpg)` 并确保文件存在。代码支持深浅底色与语法高亮，长行按组件规则换行；普通超链接会转成正文脚注编号和文末「参考资料」。`++文字++`、`==文字==` 等是本技能的强调约定，完整映射见 [排版工作流](../SKILL.md)。

### 教程二：Word、PDF 和纯文本

```text
把「文章.docx」整理成 Markdown，先让我确认章节结构和图片，
确认后用奶咖信纸排版。保留原文实质内容，不代写段落。
```

| 输入 | 处理方式与边界 |
| --- | --- |
| `.docx` | 脚本抽取标题、粗体、列表、外链、表格和内嵌图片；合并单元格按普通格处理 |
| `.doc` | 先在 Word / WPS 另存为 `.docx` |
| `.pdf` | 依赖 Agent 的 PDF 读取能力，先清理页眉页脚与断行；图表保留待补占位，双栏和扫描件需额外核对 |
| `.txt` / 粘贴文本 | 推断标题与章节；补拟的标题会在结构确认时说明 |

也可以手动抽取 Word。下面及后续 `scripts/...` 命令均在**技能安装目录或仓库根目录**执行；文章放在别处时，用实际路径替换参数。系统只有 `python3` 时，把 `python` 改为 `python3`。

```bash
python scripts/extract_docx.py "/path/to/文章.docx" -o "/path/to/文章.md"
```

图片写到 Markdown 所在目录下的 `images/文章/`，不同输出文件名使用各自的图片目录。抽取后将 Markdown 交给 Agent 排版。详见 [格式归一化](../references/format-normalize.md)。

### 教程三：先标注，再渲染

适合对措辞、重点和章节顺序有明确要求的文章：

1. 对 Agent 说：「先标注 article.md，主题用 tech-cobalt，先不要生成 HTML。」
2. 打开 `article_annotated.md`，检查章节编号、`++下划线++`、`==高亮==`、目录与署名。
3. 修改满意后说：「按 article_annotated.md 渲染，沿用标注中的决策，完成校验和预览。」
4. 想换主题时，修改 frontmatter 中的 `gzh_theme`，再让 Agent 渲染。

标注格式与字段见 [两阶段标注规范](../references/annotated-format.md)。这里的「标注／渲染」是 Agent 工作流，不是 Python CLI 子命令。

### 教程四：做一套自己的主题

```text
为我的读书公众号做一套新主题：奶油白底、墨绿标题、少量暖金点缀，
正文留白充足，引用像书页批注。先给我看组件预览，
确认后保存到本地主题库并登记，让后续文章可以复用。
```

也可以提供参考图。主题生成流程见 [主题生成器](../references/theme-generator.md)，手动新增主题见 [贡献指南](../CONTRIBUTING.md)。

<a id="wechat-api"></a>

## 可选：上传到公众号草稿箱

手动复制无需配置微信凭据。需要自动化时，`wechat_draft.py` 可以上传正文图片、封面和文章，创建草稿并回读验证。**它不会发布文章**，请到公众号后台检查草稿后再发布。

准备有对应 API 权限的公众号、AppID / AppSecret 和封面图；账号权限及 IP 白名单以公众号后台为准。示例中的 `article.html` 均指**校验通过的干净正文**，请换成实际文件路径。

### 1. 安装依赖，保存配置

```bash
python -m pip install requests Pillow
```

在用户主目录创建 `.wechat_config.json`，用 **UTF-8 无 BOM** 保存，并填入真实值：

```json
{
  "WECHAT_APP_ID": "wx_your_appid",
  "WECHAT_APP_SECRET": "your_app_secret"
}
```

默认位置：Windows 为 `%USERPROFILE%\.wechat_config.json`；macOS / Linux 为 `~/.wechat_config.json`。凭据和 token 缓存应放在仓库外，不要提交到 Git。

配置必须是 JSON 对象，两个字段都必须是非空字符串。脚本会在读取 token 缓存或发起请求前检查；缺项时提示具体字段名，以退出码 `1` 结束，不输出凭据值。

<details>
<summary>自定义配置路径与多账号设置（PowerShell / Bash）</summary>

环境变量指定的是**文件路径**，不是 AppID / AppSecret 的值。请先创建相应文件和父目录，再在同一终端运行上传命令。

Windows PowerShell：

```powershell
$env:WECHAT_CONFIG_FILE = "C:\wechat\account-a.json"
$env:WECHAT_TOKEN_FILE = "C:\wechat\account-a.token.json"
```

macOS / Linux：

```bash
export WECHAT_CONFIG_FILE="$HOME/.config/wechat/account-a.json"
export WECHAT_TOKEN_FILE="$HOME/.config/wechat/account-a.token.json"
```

默认 token 缓存为 `~/.wechat_access_token`，绑定配置中的 AppID；过期、切换账号、缓存损坏或遇到缺少 AppID 的旧缓存时会刷新。多账号交替使用时，建议各设独立的 `WECHAT_TOKEN_FILE`。环境变量需在启动脚本或导入模块前设置。

CLI 还可通过 `WECHAT_COVER_PATH` 设置默认封面路径，默认值为当前目录的 `image_001.jpg`；显式传入封面参数时，以参数为准。

</details>

### 2. 上传正文

```bash
python scripts/validate_gzh_html.py "/path/to/article.html"
python scripts/wechat_draft.py "/path/to/cover.jpg" "文章标题" "文章摘要" --html-file "/path/to/article.html"
```

先确认校验 **0 ERROR、半角标点 0 WARN**，再执行上传。封面支持 JPG / PNG，建议事先裁成 900 × 383；脚本会生成压缩缩略图，但不会替你构图。

- 本地正文图片按 HTML 文件所在目录解析，先检查，再上传并替换 URL；同一文件的重复引用只上传一次。
- HTTP(S) 图片 URL 保持原样，需要自行确认微信端可访问；本地图片更适合走 API 上传流程。
- HTML 在上传前自动压缩，减少源码缩进被微信转成多余空白的问题。
- 成功时返回草稿 `media_id` 和正文 `nbsp` 计数；回读会核对标题，包括中文和 emoji。

<details>
<summary>Python 集成，以及验证失败后的重试</summary>

在仓库根目录运行，或将技能目录下的 `scripts` 的绝对路径加入 `sys.path`：

```python
from pathlib import Path
import sys

sys.path.insert(0, "scripts")
from wechat_draft import DraftVerificationError, upload_and_cleanup

article = Path("article.html").resolve()
try:
    media_id, nbsp_count = upload_and_cleanup(
        cover_path="cover.jpg",
        title="文章标题",
        digest="文章摘要",
        html_content=article.read_text(encoding="utf-8"),
        base_dir=article.parent,
    )
    print(media_id, nbsp_count)
except DraftVerificationError as exc:
    print("草稿已创建，请只重试验证：", exc.media_id)
    raise
```

`DraftVerificationError` 表示草稿已创建，但回读验证失败（CLI 退出码 `2`）。记录异常携带的 `media_id`，只重试现有草稿的验证：

```python
import sys
sys.path.insert(0, "scripts")
from wechat_draft import get_token, verify_draft

token = get_token()
media_id = "替换为已创建草稿的 media_id"
nbsp_count = verify_draft(token, media_id, "文章标题")
print(nbsp_count)
```

不要再次调用上传函数创建同一篇草稿。`nbsp_count > 0` 本身不表示排版错误：单个不换行空格可能是有意留白。确认有异常连串空白后，再运行：

```python
from wechat_draft import cleanup_draft_nbsp
cleanup_draft_nbsp(token, media_id)
```

清理会保留单个空白及作者、原文链接、留言设置，并在更新后回读验证。函数名 `upload_and_cleanup()` 包含上传前压缩；上传后的异常空白清理仍需按上述步骤单独调用。

</details>

<a id="development"></a>

## 脚本与维护

常用脚本各司其职；下面以 `article.html` 代表已生成的正文文件：

```bash
# 检查主题组件库
python scripts/component_lint.py .

# 检查正文，再生成复制预览
python scripts/validate_gzh_html.py article.html
python scripts/wrap_preview.py article.html

# 单独压缩时显式指定新文件，保留原始正文
python scripts/minify_gzh_html.py article.html article.min.html

# 运行回归测试（需安装 requests、Pillow）
python -m unittest discover -s tests -v
```

组件库要求 **0 ERROR**；文章交付要求 **0 ERROR、半角标点 0 WARN**。校验覆盖禁用标签／样式、文字包裹、区块底色和中文标点等已知规则，仍需检查实际预览。

CI 使用 Python 3.13，在 Ubuntu 和 Windows 上运行回归、组件检查、画廊校验与 PNG 完整性检查。微信 API 测试使用模拟响应；镜像同步用例要求非 Windows 且安装了 `rsync`，CI 的 Ubuntu 执行该用例，Windows 跳过。

```text
gzh-skill-kit/
├── SKILL.md                       # Agent 工作流入口，技能名 gzh-skill
├── references/
│   ├── theme-index.md             # 主题注册表
│   ├── theme-*.md                 # 主题组件库与生成器
│   ├── common-components.md       # 代码、图片、脚注等通用组件
│   ├── format-normalize.md        # Word / PDF / 文本归一化
│   └── annotated-format.md        # 两阶段标注规范
├── scripts/                       # 抽取、校验、压缩、预览、草稿上传
├── tests/                         # 回归测试
├── assets/
│   ├── sample-article.md          # 试排文章
│   └── preview-template.html      # 复制预览外壳
└── docs/gallery/                  # 17 套主题长文示例
```

想贡献主题、修复问题或补充教程，请阅读 [贡献指南](../CONTRIBUTING.md) 和 [评估用例](../references/eval-cases.md)。反馈排版问题时，可提供脱敏的输入片段、主题名、校验输出和问题截图，便于复现。
