#!/usr/bin/env python3
"""Publisher-only initial setup: write a private code and its public digest."""

import argparse
import json
import os
from pathlib import Path
import secrets
import sys

if __package__:
    from .cli_utils import configure_stdio
    from .fan_access import CODE_ALPHABET, CODE_DIGITS, CODE_LETTERS, POLICY_FILE, ROOT, code_digest
else:
    from cli_utils import configure_stdio
    from fan_access import CODE_ALPHABET, CODE_DIGITS, CODE_LETTERS, POLICY_FILE, ROOT, code_digest

PROFILE_URL = 'https://www.xiaohongshu.com/user/profile/6a9a3ba20000000013032c00'
GROUP_NAME = 'AI生产力实验室（仅粉丝）'


def generate_code():
    # Uniformly sample the allowed mixed codes; no predictable letter/digit positions.
    while True:
        code = ''.join(secrets.choice(CODE_ALPHABET) for _ in range(6))
        if (any(char in CODE_LETTERS for char in code)
                and any(char in CODE_DIGITS for char in code)):
            return code


def initialize(output, policy_file=POLICY_FILE):
    output = Path(output).expanduser().resolve()
    if output == ROOT or ROOT in output.parents:
        raise ValueError('群内激活码必须保存到仓库之外。')
    if policy_file.exists():
        raise ValueError('已配置激活校验，日常使用不需要重新生成；保留原码才能兼容已激活用户。')
    if output.exists():
        raise ValueError('输出文件已存在，不覆盖已有激活码。')
    code = generate_code()
    output.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, 'w', encoding='utf-8') as handle:
        handle.write(code + '\n')
    policy_file.parent.mkdir(parents=True, exist_ok=True)
    with policy_file.open('x', encoding='utf-8') as handle:
        json.dump({'version': 1, 'code_sha256': code_digest(code),
                   'profile_url': PROFILE_URL, 'group_name': GROUP_NAME},
                  handle, ensure_ascii=False, indent=2)
        handle.write('\n')
    return output


def main():
    configure_stdio()
    parser = argparse.ArgumentParser(description='维护者首次初始化群内激活码，不用于客户激活')
    parser.add_argument('--output', required=True, type=Path, help='仓库外的私密激活码文件')
    args = parser.parse_args()
    try:
        output = initialize(args.output)
    except (OSError, ValueError) as exc:
        print(f'初始化失败：{exc}', file=sys.stderr)
        return 1
    print(f'私密激活码已保存：{output}')
    print('请将该文件中的激活码发到粉丝群公告，并在仓库外备份；不要上传到公开仓库。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
