#!/usr/bin/env python3
"""One-time, offline fan-group activation. This is not a live membership check."""

import argparse
import getpass
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import sys
import tempfile

if __package__:
    from .cli_utils import configure_stdio
else:
    from cli_utils import configure_stdio

ROOT = Path(__file__).resolve().parents[1]
POLICY_FILE = ROOT / 'references' / 'fan-access.json'
STATE_ENV = 'GZH_SKILL_ACTIVATION_FILE'
CODE_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ'
CODE_DIGITS = '23456789'
CODE_ALPHABET = CODE_LETTERS + CODE_DIGITS
CODE_PATTERN = re.compile(f'[{CODE_ALPHABET}]{{6}}')
MAX_INPUT = 4096


class FanAccessError(RuntimeError):
    """An actionable error that must not include the submitted activation code."""


class ActivationRequired(FanAccessError):
    pass


class AccessConfigurationError(FanAccessError):
    pass


def normalize_code(value):
    message = '请输入群内的 6 位字母数字激活码（不区分大小写）。'
    if not isinstance(value, str) or not value.strip().isascii():
        raise FanAccessError(message)
    code = value.strip().upper()
    if (not CODE_PATTERN.fullmatch(code)
            or not any(char in CODE_LETTERS for char in code)
            or not any(char in CODE_DIGITS for char in code)):
        raise FanAccessError(message)
    return code


def code_digest(value):
    return hashlib.sha256(normalize_code(value).encode('ascii')).hexdigest()


def _read_json(path):
    with path.open(encoding='utf-8') as handle:
        text = handle.read(MAX_INPUT + 1)
    if len(text) > MAX_INPUT:
        raise ValueError('file too large')
    return json.loads(text)


def load_policy():
    try:
        policy = _read_json(POLICY_FILE)
        valid = (isinstance(policy, dict)
                 and type(policy.get('version')) is int and policy['version'] == 1
                 and isinstance(policy.get('code_sha256'), str)
                 and re.fullmatch(r'[0-9a-f]{64}', policy['code_sha256'])
                 and isinstance(policy.get('group_name'), str) and policy['group_name'].strip()
                 and isinstance(policy.get('profile_url'), str)
                 and policy['profile_url'].startswith('https://'))
        if not valid:
            raise ValueError('invalid policy')
        return policy
    except (OSError, UnicodeError, ValueError) as exc:
        raise AccessConfigurationError('激活配置缺失或损坏，请重新安装官方版本。') from exc


def activation_path():
    override = os.environ.get(STATE_ENV)
    path = (Path(override).expanduser() if override is not None else
            Path.home() / '.gzh-skill-kit' / 'activation.json')
    resolved = path.resolve()
    if resolved == ROOT or ROOT in resolved.parents:
        raise FanAccessError('请将激活记录保存在技能目录之外，避免随仓库或更新包分发。')
    return resolved


def join_instructions(policy):
    return ('尚未激活。请关注小红书主页：\n'
            f"{policy['profile_url']}\n"
            f"加入群聊「{policy['group_name']}」领取激活码，再运行 fan_access.py activate。")


def _matches(code, policy):
    return hmac.compare_digest(code_digest(code), policy['code_sha256'])


def require_activation():
    """Revalidate the saved code; a user-editable `activated: true` is not proof."""
    policy = load_policy()
    try:
        state = _read_json(activation_path())
        if (not isinstance(state, dict) or type(state.get('version')) is not int
                or state['version'] != 1 or not _matches(state.get('activation_code'), policy)):
            raise ValueError('invalid state')
    except (OSError, UnicodeError, ValueError, FanAccessError) as exc:
        raise ActivationRequired(join_instructions(policy)) from exc


def activate(value):
    policy = load_policy()
    code = normalize_code(value)
    if not _matches(code, policy):
        raise FanAccessError('激活码不正确，请使用群内发布的完整激活码。')
    path = activation_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    # Write beside the destination, then replace atomically. Failed attempts leave
    # an existing valid activation untouched, including on Windows.
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent,
                                         prefix='.activation-', suffix='.tmp', delete=False) as handle:
            temporary = Path(handle.name)
            json.dump({'version': 1, 'activation_code': code}, handle)
            handle.write('\n')
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()
    return path


def main():
    configure_stdio()
    parser = argparse.ArgumentParser(description='粉丝群一次激活，全部主题长期使用（无需联网）')
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('status', help='检查本地激活状态，不显示激活码')
    activation = commands.add_parser('activate', help='输入群内激活码')
    inputs = activation.add_mutually_exclusive_group()
    inputs.add_argument('--stdin', action='store_true', help='从标准输入读取激活码，不放在命令行参数中')
    inputs.add_argument('--code-file', type=Path, help='从 UTF-8 文本文件读取激活码')
    args = parser.parse_args()
    try:
        if args.command == 'status':
            require_activation()
        else:
            if args.code_file:
                with args.code_file.open(encoding='utf-8-sig') as handle:
                    code = handle.read(MAX_INPUT + 1)
            elif args.stdin:
                code = sys.stdin.read(MAX_INPUT + 1)
            elif sys.stdin.isatty():
                code = getpass.getpass('请输入群内的 6 位字母数字激活码（不区分大小写）：')
            else:
                raise FanAccessError('非交互环境请使用 activate --stdin 或 --code-file。')
            activate(code)
        print('已激活，全部主题可长期用于个人非商业创作。')
        return 0
    except ActivationRequired as exc:
        print(str(exc), file=sys.stderr)
        return 2
    except AccessConfigurationError as exc:
        print(str(exc), file=sys.stderr)
        return 3
    except FanAccessError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    except (OSError, UnicodeError):
        print('无法读取激活码或保存激活记录，请检查文件路径和权限。', file=sys.stderr)
        return 1
    except (EOFError, KeyboardInterrupt):
        print('已取消激活。', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
