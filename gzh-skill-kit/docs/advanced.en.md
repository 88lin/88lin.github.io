# 🛠 Advanced usage and development

[← Back to the homepage: start with an AI prompt](../README.en.md#quick-start)

[中文](advanced.md) / **English**

The default route is to send the homepage prompt to your AI. This guide covers manual installation, draft upload, and development. You can also give this page to your AI for help.

Theme assembly is performed by the AI agent; the repository does not provide a standalone Markdown-to-themed-HTML renderer CLI.

Run `scripts/...` commands from the skill installation directory or repository root. Replace input paths with your files, and use `python3` instead of `python` if needed.

## 🛠 Manual installation

| Requirement | Purpose |
| --- | --- |
| An AI agent with skill support | Read components, interpret the article, and generate HTML |
| Python 3 (3.13 recommended, matching CI) | Run validation, preview, and Word extraction scripts |
| Node.js LTS / npm | Needed for the `npx` installation below |
| A browser | Open the preview and copy rich text |

Run this in a terminal, then follow the installer prompts to select your client and installation scope:

```bash
npx skills add https://github.com/88lin/gzh-skill-kit
```

The repository is named `gzh-skill-kit`; the skill name in [SKILL.md](../SKILL.md) is **`gzh-skill`**. After installation, check that your client can discover it. Reload the client or start a new session if needed.

<details>
<summary>Other installation options: ask your agent, or install manually</summary>

Send your agent this prompt:

```text
Install the skill at https://github.com/88lin/gzh-skill-kit using this
client's skill directory conventions. Confirm that you can read SKILL.md
and run the validation scripts.
```

For a project-level Claude Code installation, run this from your project directory (Git required):

```bash
git clone https://github.com/88lin/gzh-skill-kit.git .claude/skills/gzh-skill
```

For other clients, use their supported skill directories. Check local changes before replacing an existing installation, especially custom themes.

</details>

<a id="tutorials"></a>

## Tutorials

### Choose how much control you want

| Goal | Tell your agent | Behavior |
| --- | --- | --- |
| Use a specific style | "Format article.md with red-white" | Uses the selected theme directly |
| Get a recommendation | "Format this article for WeChat" | Recommends a theme for confirmation |
| Finish in one pass | "Auto-format article.md; choose the theme without asking" | Infers structure and theme, then explains its choices |
| Review the emphasis first | "Annotate article.md first; do not generate HTML yet" | Delivers `_annotated.md` before rendering |
| Compare styles | "Make tech-cobalt and letter versions" | Produces a separate article and preview for each |

**Tech Cobalt** is the default recommendation when no theme is specified and the topic has no clear match. Use either a theme's Chinese name or its ID from the [theme index](../references/theme-index.md).

### Tutorial 1: Prepare Markdown with clear structure

Use `#` for the article title and `##` for sections. Explicit quotes, emphasis, images, and code blocks help the agent follow your intended structure.

````markdown
# Automate a repetitive task

> Start small and get one workflow running.

## Choose the first task

Pick a **frequent, predictable** operation. Record its ++inputs and outputs++.

- Define what triggers it
- Keep a manual review step

## Check the result

```python
print("Hello, workflow!")
```

Reference: [Project documentation](https://example.com/docs)
````

For an image, add `![Caption](images/demo.jpg)` and make sure the file exists. Code components offer dark/light backgrounds and syntax highlighting, with long lines wrapping according to the component rules. Regular links become numbered footnotes and a references section. `++text++` and `==text==` are skill-specific emphasis conventions; see the [workflow](../SKILL.md) for the mappings.

### Tutorial 2: Start with Word, PDF, or plain text

```text
Convert article.docx to Markdown and let me check its sections and images.
After confirmation, format it with letter. Preserve the substantive content;
do not write replacement paragraphs.
```

| Input | Handling and limitations |
| --- | --- |
| `.docx` | Extracts headings, bold text, lists, external links, tables, and embedded images; merged cells become ordinary cells |
| `.doc` | Save as `.docx` in Word or WPS first |
| `.pdf` | Requires your agent's PDF reading capability; removes headers, footers, and hard line breaks; figures become placeholders. Check scanned or multi-column documents separately |
| `.txt` / pasted text | Infers sections and headings; identifies newly proposed headings during structure review |

You can also extract Word content yourself. Run this and all later `scripts/...` commands from the **skill installation directory or repository root**. Replace input paths with your actual files; use `python3` instead of `python` if required by your system.

```bash
python scripts/extract_docx.py "/path/to/article.docx" -o "/path/to/article.md"
```

Images are saved under `images/article/` beside the output Markdown. Different output stems get separate image directories. Give the extracted Markdown to your agent for layout. See [input normalization](../references/format-normalize.md).

### Tutorial 3: Annotate, review, then render

Useful when wording, emphasis, or section order needs close review:

1. Ask: "Annotate article.md with tech-cobalt; do not generate HTML yet."
2. Open `article_annotated.md` and check numbering, `++underlines++`, `==highlights==`, the contents list, and author details.
3. After editing, ask: "Render article_annotated.md using its recorded decisions, then validate and create a preview."
4. To change themes, edit `gzh_theme` in the frontmatter and ask the agent to render again.

See the [annotation format](../references/annotated-format.md) for all fields. Annotation and rendering are agent workflow stages, not Python CLI subcommands.

### Tutorial 4: Create a reusable theme

```text
Create a theme for my reading newsletter: cream paper, dark green headings,
a little warm gold, generous spacing, and quotes that resemble book annotations.
Show me a component preview first. After confirmation, save and register it
in my local theme library so I can reuse it for future articles.
```

You can also supply a reference image. See the [theme generator](../references/theme-generator.md) or the [contribution guide](../CONTRIBUTING.md) for manual theme development.

<a id="wechat-api"></a>

## Optional: upload to the WeChat draft box

Manual copying does not need WeChat credentials. For automation, `wechat_draft.py` uploads inline images, a cover, and the article, creates a draft, and reads it back for verification. **It does not publish the article.** Review the draft in WeChat before publishing.

Prepare an Official Account with the required API permissions, its AppID / AppSecret, and a cover image. Check permissions and the IP allowlist in your account settings. In these examples, `article.html` means the **validated clean article fragment**; replace it with the actual file path.

### 1. Install dependencies and save the configuration

```bash
python -m pip install requests Pillow
```

Create `.wechat_config.json` in your home directory, save it as **UTF-8 without BOM**, and enter your actual credentials:

```json
{
  "WECHAT_APP_ID": "wx_your_appid",
  "WECHAT_APP_SECRET": "your_app_secret"
}
```

Default location: `%USERPROFILE%\.wechat_config.json` on Windows, or `~/.wechat_config.json` on macOS / Linux. Keep credentials and token caches outside the repository and out of Git.

The configuration must be a JSON object with both fields set to nonempty strings. The script checks this before reading the token cache or making requests. Missing fields produce a message naming the field and exit code `1`, without printing credential values.

<details>
<summary>Custom paths and multiple accounts (PowerShell / Bash)</summary>

These environment variables contain **file paths**, not the AppID / AppSecret values. Create the files and their parent directories first, then run the upload command in the same terminal.

Windows PowerShell:

```powershell
$env:WECHAT_CONFIG_FILE = "C:\wechat\account-a.json"
$env:WECHAT_TOKEN_FILE = "C:\wechat\account-a.token.json"
```

macOS / Linux:

```bash
export WECHAT_CONFIG_FILE="$HOME/.config/wechat/account-a.json"
export WECHAT_TOKEN_FILE="$HOME/.config/wechat/account-a.token.json"
```

The default token cache is `~/.wechat_access_token` and is bound to the configured AppID. Expiration, an account change, a corrupted cache, or a legacy cache without an AppID triggers a refresh. Use a separate `WECHAT_TOKEN_FILE` per account when switching between accounts. Set environment variables before launching the script or importing the module.

The CLI also accepts `WECHAT_COVER_PATH` as its default cover path, otherwise using `image_001.jpg` in the current directory. An explicit cover argument takes precedence.

</details>

### 2. Upload the article

```bash
python scripts/validate_gzh_html.py "/path/to/article.html"
python scripts/wechat_draft.py "/path/to/cover.jpg" "Article title" "Article summary" --html-file "/path/to/article.html"
```

Confirm **0 ERROR and 0 half-width punctuation WARN** before uploading. Covers support JPG / PNG; crop to 900 × 383 if suitable. The script generates a compressed thumbnail but does not compose or crop the cover for you.

- Local inline images resolve relative to the HTML file. They are checked, uploaded, and replaced with returned URLs; repeated references to the same file upload once.
- HTTP(S) image URLs remain unchanged. Check their availability in WeChat; local images can instead use the API upload flow.
- HTML is minified automatically before upload to reduce unwanted whitespace introduced from source indentation.
- Success returns the draft `media_id` and a body `nbsp` count. Readback checks the title, including Chinese characters and emoji.

<details>
<summary>Python integration and retrying a failed verification</summary>

Run from the repository root, or add the skill's absolute `scripts` path to `sys.path`:

```python
from pathlib import Path
import sys

sys.path.insert(0, "scripts")
from wechat_draft import DraftVerificationError, upload_and_cleanup

article = Path("article.html").resolve()
try:
    media_id, nbsp_count = upload_and_cleanup(
        cover_path="cover.jpg",
        title="Article title",
        digest="Article summary",
        html_content=article.read_text(encoding="utf-8"),
        base_dir=article.parent,
    )
    print(media_id, nbsp_count)
except DraftVerificationError as exc:
    print("Draft created; retry verification only:", exc.media_id)
    raise
```

`DraftVerificationError` means the draft was created but readback verification failed (CLI exit code `2`). Record the exception's `media_id` and retry verification of that existing draft:

```python
import sys
sys.path.insert(0, "scripts")
from wechat_draft import get_token, verify_draft

token = get_token()
media_id = "REPLACE_WITH_EXISTING_DRAFT_MEDIA_ID"
nbsp_count = verify_draft(token, media_id, "Article title")
print(nbsp_count)
```

Do not call the upload function again for the same article. `nbsp_count > 0` alone does not mean a layout error: a single nonbreaking space may be intentional. If you confirm unwanted runs of spaces, use:

```python
from wechat_draft import cleanup_draft_nbsp
cleanup_draft_nbsp(token, media_id)
```

Cleanup preserves individual spaces, author details, the original URL, and comment settings, then verifies the update by reading it back. Despite its name, `upload_and_cleanup()` handles pre-upload minification; cleanup of unwanted spaces after upload is a separate call.

</details>

<a id="development"></a>

## Scripts and maintenance

Each script has a specific job. Here, `article.html` represents an already generated article fragment:

```bash
# Check the theme component libraries
python scripts/component_lint.py .

# Validate the article, then create its copy preview
python scripts/validate_gzh_html.py article.html
python scripts/wrap_preview.py article.html

# Write minified HTML to a separate file, preserving the original
python scripts/minify_gzh_html.py article.html article.min.html

# Run regressions (requests and Pillow required)
python -m unittest discover -s tests -v
```

Component libraries must have **0 ERROR**; delivered articles must have **0 ERROR and 0 half-width punctuation WARN**. Validation covers known rules for forbidden markup/styles, text wrapping, independent block backgrounds, and Chinese punctuation. Inspect the actual preview as well.

CI uses Python 3.13 on Ubuntu and Windows for regressions, component checks, gallery validation, and PNG integrity. WeChat API tests use mocked responses. The mirror synchronization test requires a non-Windows platform with `rsync`; Ubuntu CI runs it, while Windows skips it.

```text
gzh-skill-kit/
├── SKILL.md                       # Agent workflow; skill name: gzh-skill
├── references/
│   ├── theme-index.md             # Theme registry
│   ├── theme-*.md                 # Theme libraries and generator
│   ├── common-components.md       # Code, images, footnotes, and shared components
│   ├── format-normalize.md        # Word / PDF / text normalization
│   └── annotated-format.md        # Two-stage annotation specification
├── scripts/                       # Extraction, checks, minification, preview, upload
├── tests/                         # Regression tests
├── assets/
│   ├── sample-article.md          # Sample input
│   └── preview-template.html      # Copy preview wrapper
└── docs/gallery/                  # Long-form samples in all 14 themes
```

For themes, fixes, or documentation contributions, read the [contribution guide](../CONTRIBUTING.md) and [evaluation cases](../references/eval-cases.md). Most workflow and reference documents are in Chinese. A useful layout bug report includes a sanitized input excerpt, theme ID, validator output, and a screenshot.
