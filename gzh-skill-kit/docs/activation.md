# 粉丝群激活

首次使用前，关注[茉灵智库的小红书主页](https://www.xiaohongshu.com/user/profile/6a9a3ba20000000013032c00)，进入主页群聊 **AI生产力实验室（仅粉丝）**，领取群内的 **6 位字母数字激活码**。不区分大小写，避开容易混淆的 `0/O`、`1/I/L`。

把激活码交给 AI 并说“帮我激活公众号排版技能”即可。所有主题共用一次激活，之后长期有效，不需要定期回群换码。使用范围仍为个人非商业用途。

手动激活时，在技能目录运行以下命令，按提示输入激活码：

```bash
python scripts/fan_access.py activate
python scripts/fan_access.py status
```

AI 或非交互终端可用 `activate --stdin` 从标准输入读取，也可用 `activate --code-file <UTF-8 文本文件>`。请勿将激活码放进命令行参数、提交到仓库或写入文章。

激活记录保存在用户目录的 `.gzh-skill-kit/activation.json`，更新技能时保留。换电脑后可用原码重新激活。只有特殊存储需求才设置 `GZH_SKILL_ACTIVATION_FILE`，路径必须位于技能目录之外。记录损坏时重新激活即可。

校验完全在本地完成，不读取社交账号密码，也不联网检查群成员身份。字母数字组合比同长度的纯数字码更难枚举，但仍可被枚举或转发，本地检查也能被修改绕过；这里提供的是简单的使用门槛。

## 维护者

本版已初始化共享码。公开文件 `references/fan-access.json` 仅保存摘要和群入口，私密码单独备份在仓库外，再由作者发到群公告；日常无需运行 `scripts/create_fan_code.py` 或更换摘要，否则会影响已有激活。

首次建立新发行配置时，维护者可运行 `python scripts/create_fan_code.py --output <仓库外的私密文件.activation-code.txt>`；已有配置或输出文件时会拒绝覆盖。普通用户只运行 `fan_access.py activate`。

测试使用独立的测试码与临时配置，不需要也不得在 CI 中配置真实群码。维护工具和公开画廊构建不依赖个人激活记录。
