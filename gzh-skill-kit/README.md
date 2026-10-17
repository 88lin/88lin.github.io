<div align="center">

# gzh-skill-kit · 公众号排版技能

**把文章交给 AI，一键排成好看的公众号图文 ✨**

17 套精选主题 + 主题生成器 · 图片 / GIF / 代码块 · 自动整理章节与重点 · 一键复制到公众号

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE) [![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/code) [![Themes](https://img.shields.io/badge/themes-15%20+%20generator-059669)](references/theme-index.md) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md) [![Agents](https://img.shields.io/badge/Claude%20Code%20·%20Codex%20·%20Cursor-supported-8b5cf6.svg)](#quick-start)

[🚀 一句话开始](#quick-start) · [👀 看排版效果](#gallery) · [📖 跟着做一篇](#tutorials) · [🎨 挑选主题](#themes) · [❓ 常见问题](#faq)

[English](README.en.md) ｜ **中文**

</div>

---

写完一篇文章，还要花时间调字号、配颜色、改间距？**把稿子交给 AI，让它帮你排好。** 选一套喜欢的风格，标题、引言、重点、配图和署名一起整理，最后打开预览、复制到公众号就能继续编辑。

<a id="quick-start"></a>

## 🚀 最简单的用法：复制这段话，发给 AI

**推荐从这里开始，不用自己敲安装命令。** 点下面代码框右上角的复制按钮，把整段话发给 AI，再把文章发给它：

```text
请帮我安装这个公众号排版工具：
https://github.com/88lin/gzh-skill-kit

装好后，把我接下来提供的文章排成公众号图文。
自动选一套合适的主题，保留正文，不改写观点。
帮我检查排版，生成带复制按钮的预览页，
并告诉我怎么打开、怎么复制到公众号。
如果缺少运行环境，请协助我完成安装。
```

> [!TIP]
> **你负责提供文章，安装和排版交给 AI。** 可使用 Claude Code、Codex、Cursor 等能安装工具、处理文件的 AI 客户端。单纯的网页聊天窗口不一定支持，见下方 [常见问题](#faq)。

没有现成文章也可以先试试，接着对 AI 说：

> 先用工具自带的示例文章排一版，让我看看效果。

**📄 发文章 → 🎨 AI 排版 → 📋 打开预览并复制 → 📱 公众号里检查效果**

---

## ✨ 它能帮你做什么

- **🎨 选风格**：17 套现成主题，从清爽教程、杂志特稿到温暖手账；拿不准就让 AI 推荐。
- **🪄 整理版面**：自动安排章节编号、引言、目录、重点标记和作者署名。
- **📄 接住你的稿子**：直接粘贴文章，或提供 Markdown、Word、PDF；非 Markdown 稿件先整理结构再排版。
- **🖼️ 排好图文**：支持图片、GIF、引用、列表、表格和代码块，长文章也有清楚的阅读层次。
- **🧠 做你的专属主题**：描述喜欢的风格，或提供参考图，让 AI 做一套可以反复使用的主题。
- **📋 复制与检查**：生成带复制按钮的预览页，交付前检查常见排版问题，方便你在公众号里完成最后确认。

<a id="gallery"></a>

## 👀 先看看，文章可以排成什么样

**同一篇长文，17 种不同气质。** 点击缩略图就能查看对应主题的完整文章，手机和电脑都可以看。

<table>
<tr>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/tech-cobalt.html"><img src="assets/lf-tech-cobalt.thumb.png" alt="科技钴蓝（默认） 主题预览" width="250"></a><br><sub><b>科技钴蓝（默认）</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/letter.html"><img src="assets/lf-letter.thumb.png" alt="奶咖信纸 主题预览" width="250"></a><br><sub><b>奶咖信纸</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/bento.html"><img src="assets/lf-bento.thumb.png" alt="粉彩便当盒 主题预览" width="250"></a><br><sub><b>粉彩便当盒</b></sub></td>
</tr>
<tr>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/berry-letter.html"><img src="assets/lf-berry-letter.thumb.png" alt="莓果信笺 主题预览" width="250"></a><br><sub><b>莓果信笺</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/chat.html"><img src="assets/lf-chat.thumb.png" alt="薄荷对话 主题预览" width="250"></a><br><sub><b>薄荷对话</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/magazine.html"><img src="assets/lf-magazine.thumb.png" alt="孔雀蓝杂志 主题预览" width="250"></a><br><sub><b>孔雀蓝杂志</b></sub></td>
</tr>
<tr>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/journal.html"><img src="assets/lf-journal.thumb.png" alt="珊瑚手账 主题预览" width="250"></a><br><sub><b>珊瑚手账</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/daily.html"><img src="assets/lf-daily.thumb.png" alt="珊瑚日报 主题预览" width="250"></a><br><sub><b>珊瑚日报</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/moyu-green.html"><img src="assets/lf-moyu-green.thumb.png" alt="摸鱼绿 主题预览" width="250"></a><br><sub><b>摸鱼绿</b></sub></td>
</tr>
<tr>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/red-white.html"><img src="assets/lf-red-white.thumb.png" alt="红白色系 主题预览" width="250"></a><br><sub><b>红白色系</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/klein-blue.html"><img src="assets/lf-klein-blue.thumb.png" alt="克莱因蓝 主题预览" width="250"></a><br><sub><b>克莱因蓝</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/graphite-minimal.html"><img src="assets/lf-graphite-minimal.thumb.png" alt="石墨极简风 主题预览" width="250"></a><br><sub><b>石墨极简风</b></sub></td>
</tr>
<tr>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/zen-whitespace.html"><img src="assets/lf-zen-whitespace.thumb.png" alt="留白禅意风 主题预览" width="250"></a><br><sub><b>留白禅意风</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/moyu-ticket.html"><img src="assets/lf-moyu-ticket.thumb.png" alt="摸鱼票据风 主题预览" width="250"></a><br><sub><b>摸鱼票据风</b></sub></td>
<td width="33%" align="center"><a href="https://88lin.github.io/gzh-skill-kit/docs/previews/olive-journal.html"><img src="assets/lf-olive-journal.thumb.png" alt="橄榄手记 主题预览" width="250"></a><br><sub><b>橄榄手记</b></sub></td>
</tr>
</table>

> [!NOTE]
> **想放大看细节？** 打开 [🌈 在线主题画廊](https://88lin.github.io/gzh-skill-kit/docs/gallery/index.html)，看中哪套，就直接把主题名字告诉 AI。

<a id="tutorials"></a>

## 📖 跟着做：排好你的第一篇文章

### 📄 第一步：把文章发给 AI

已经安装好后，直接粘贴正文，或者把文件交给 AI。可以这样说：

```text
帮我把这篇文章排成公众号图文，风格你来选。
保留我的正文，署名用「你的名字」。排好后给我能打开的预览页。
```

用 Word 写稿也没关系：

> 帮我排版这个 Word 文档，先检查章节和图片有没有遗漏，再用奶咖信纸排版。

PDF 同样可以先整理再排版；扫描件、复杂表格和双栏内容可能需要你核对一下。没有标题的纯文本，AI 会帮你梳理章节。

### 🎨 第二步：选喜欢的风格，或者让 AI 决定

你可以直接指定主题，也可以先看两种效果再选：

> 用「珊瑚手账」排这篇读书笔记，保留我的引用和批注。

> 用「科技钴蓝」和「奶咖信纸」各排一版，我对比一下。

> 我不想挑主题，你根据文章内容直接选一套，排好就行。

不知道选什么时，可以从默认的 **科技钴蓝** 开始；更多搭配见下面的 [主题推荐](#themes)。

### 📋 第三步：打开预览，复制到公众号

1. **打开 AI 给你的预览页**：文件名末尾通常是 `_预览.html`。
2. **点右上角「复制到公众号」**：复制的是已经排好的图文。
3. **粘贴进公众号正文编辑区**：Windows 用 `Ctrl+V`，Mac 用 `⌘V`。
4. **用手机预览一次**：检查图片、标题和署名，再按自己的发布流程操作。

> [!TIP]
> 如果 AI 同时给了两份 HTML，先打开带「预览」二字的那份。另一份是它用来检查和上传的正文文件，你不需要手动处理里面的代码。

### ✏️ 第四步：不满意的地方，直接告诉 AI

不用从头再来，把想改的地方说清楚就行：

> 第二节的重点太多了，少标几处，留白再多一点。

> 保留正文和章节，把整篇换成「孔雀蓝杂志」。

> 先给我看你准备强调哪些句子，我确认后再排版。

想以后一直用自己的风格？可以这样说：

```text
给我的读书公众号做一套专属主题：奶油白底、墨绿标题，
引用像书页旁边的批注，整体温暖、清爽。
先让我看效果，确认后保存下来，以后的文章都能用。
```

<a id="themes"></a>

## 🎨 不知道怎么选？按内容找一套

| 配色 | 主题 | 适合的文章 |
| --- | --- | --- |
| ![#1D4ED8](https://placehold.co/12/1D4ED8/1D4ED8.png) | **科技钴蓝（默认）** | AI 工具、开发教程、工作流指南 |
| ![#2B7FD8](https://placehold.co/12/2B7FD8/2B7FD8.png) | **奶咖信纸** | 叙事长文、观点、方法论、年度总结 |
| ![#7C3AED](https://placehold.co/12/7C3AED/7C3AED.png) | **粉彩便当盒** | 工具测评、清单、干货合集 |
| ![#B9345A](https://placehold.co/12/B9345A/B9345A.png) | **莓果信笺** | 读书笔记、观点长文、人文随笔 |
| ![#059669](https://placehold.co/12/059669/059669.png) | **薄荷对话** | 访谈实录、问答教程、案例复盘 |
| ![#15697C](https://placehold.co/12/15697C/15697C.png) | **孔雀蓝杂志** | 人物故事、行业观察、深度特稿 |
| ![#C33D46](https://placehold.co/12/C33D46/C33D46.png) | **珊瑚手账** | 读书笔记、随笔、好物清单 |
| ![#C33D46](https://placehold.co/12/C33D46/C33D46.png) | **珊瑚日报** | 资讯日报、周报、快讯合集 |
| ![#059669](https://placehold.co/12/059669/059669.png) | **摸鱼绿** | 教程、测评、工具盘点 |
| ![#DC2626](https://placehold.co/12/DC2626/DC2626.png) | **红白色系** | 深度分析、观点文章 |
| ![#002FA7](https://placehold.co/12/002FA7/002FA7.png) | **克莱因蓝** | 艺术评论、品牌叙事、人物特稿 |
| ![#52525B](https://placehold.co/12/52525B/52525B.png) | **石墨极简风** | 设计、科技评论、专业观点 |
| ![#4A5D52](https://placehold.co/12/4A5D52/4A5D52.png) | **留白禅意风** | 极简生活、冥想、深度随笔 |
| ![#059669](https://placehold.co/12/059669/059669.png) | **摸鱼票据风** | 工具对比、创意评测 |
| ![#1e1f23](https://placehold.co/12/1e1f23/1e1f23.png) | **橄榄手记** | 内刊手记、深度评测、案例复盘 |

> 💡 选主题时直接说中文名就行；配色、组件和英文标识见 [完整主题索引](references/theme-index.md)。现有风格不够用，还可以 [让 AI 生成新主题](references/theme-generator.md)。

<a id="wechat-api"></a>

## 📮 想让文章直接进草稿箱？也可以

默认方式是 **预览 → 复制 → 粘贴**，不需要配置公众号接口。经常发文、希望减少手动操作时，也可以让 AI 帮你配置草稿箱上传：

```text
我想把排好的文章直接传到公众号草稿箱。
请先检查我的公众号是否具备所需接口权限，并指导我在本地配置。
配置完成后上传草稿，我会到公众号后台预览并确认发布。
```

这一步需要公众号的接口权限和凭据。**工具会创建草稿，正式发布仍由你确认。** 配置步骤可以直接交给 AI 参考：[📮 草稿箱上传指南](docs/advanced.md#wechat-api)。

<a id="faq"></a>

## ❓ 常见问题

**完全不会写代码，可以用吗？**

可以按上面的默认流程使用：复制提示词、把文章发给 AI、打开预览并复制。安装与排版中的技术操作由 AI 协助完成，你主要负责检查内容和最终效果。

**该把提示词发给哪个 AI？**

选择能安装技能、读取文件和运行工具的 AI 客户端，例如 Claude Code、Codex、Cursor。普通网页聊天未必有这些能力；拿不准时，把首页提示词发给它，让它先确认当前环境是否支持。

**必须先学 Markdown 吗？**

不用。可以直接粘贴文章，也可以提供 Word、PDF 或纯文本。旧版 `.doc` 文件先用 Word / WPS 另存为 `.docx`；PDF 中复杂图表和扫描内容需要额外核对。

**本地有图片，为什么粘到公众号后不见了？**

公众号无法直接读取你电脑里的图片。可以在公众号编辑器中补传，也可以使用上面的草稿箱上传功能，让工具处理正文里的本地图片。

**粘贴后会和预览完全一样吗？**

工具会按公众号的排版限制生成内容并做检查，但微信编辑器与不同手机的显示可能有差异。发布前用公众号的手机预览检查一次，有问题把截图和原稿发给 AI 继续调整。

**怎么更新？安装或排版出错怎么办？**

直接把问题交给 AI；更新时记得保留自己的主题。例如：

> 请帮我更新 gzh-skill-kit，保留我自己添加和修改的主题，再用示例文章检查一下是否正常。

仍然有问题，欢迎 [反馈给项目](https://github.com/88lin/gzh-skill-kit/issues/new?template=bug_report.md)，附上使用的 AI 工具、主题名称和问题截图。

## 🛠 进阶使用与参与贡献

需要手动安装、接入草稿箱或修改主题组件时，可以从这里继续：

- 📘 [进阶指南：安装命令、稿件处理、API 配置与脚本](docs/advanced.md)
- 🎨 [主题生成器](references/theme-generator.md) · [主题索引](references/theme-index.md)
- 🤝 [贡献指南](CONTRIBUTING.md) · [排版检查用例](references/eval-cases.md)
- 🔁 [自动检查状态](https://github.com/88lin/gzh-skill-kit/actions/workflows/validate.yml)

## 🗺 接下来

- [x] 17 套主题与在线画廊
- [x] 按描述或参考图生成自定义主题
- [ ] 更多精选主题（[告诉我们你想要的风格](https://github.com/88lin/gzh-skill-kit/issues/new?template=theme_request.md)）
- [ ] 将整篇文章与配图打包导出

## 💬 交流与反馈

想交流公众号排版和 AI 工具使用，或聊聊主题共创，可以添加微信 **`Piscesstar02`**，备注「gzh-skill」。也欢迎在 [Issues](https://github.com/88lin/gzh-skill-kit/issues) 留下建议。

---

<div align="center">

**👤 由 88lin（茉灵智库）创作与维护**

[⭐ Star 收藏，下次排版更好找](https://github.com/88lin/gzh-skill-kit) · [🎨 推荐新主题](https://github.com/88lin/gzh-skill-kit/issues/new?template=theme_request.md) · [🤝 一起完善](CONTRIBUTING.md)

**AGPL-3.0 © 2026 88lin（茉灵智库）** · [查看许可证](LICENSE)

</div>
