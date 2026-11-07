#!/usr/bin/env python3
"""Check a small public version file; never install or update skill files."""

import argparse
from contextlib import contextmanager
from http.client import HTTPException
import json
import math
import os
from pathlib import Path
import re
import sys
import tempfile
import time
from urllib.error import URLError
from urllib.request import Request, urlopen

if __package__:
    from .cli_utils import configure_stdio
else:
    from cli_utils import configure_stdio

ROOT = Path(__file__).resolve().parents[1]
VERSION_FILE = ROOT / 'VERSION'
STATE_FILE = Path.home() / '.gzh-skill-kit' / 'update-check.json'
VERSION_URL = 'https://github.com/88lin/gzh-skill-kit/releases/latest/download/VERSION'
MIRROR_URL = 'https://ghfast.top/' + VERSION_URL
CHECK_INTERVAL = 7 * 24 * 60 * 60
NETWORK_TIMEOUT = 3
MAX_VERSION_BYTES = 64
MAX_STATE_BYTES = 65536
VERSION_PATTERN = re.compile(r'(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})')


def parse_version(value):
    if not isinstance(value, str) or not VERSION_PATTERN.fullmatch(value):
        raise ValueError('Invalid release version')
    return tuple(int(part) for part in value.split('.'))


def read_version(path):
    with Path(path).open('rb') as handle:
        data = handle.read(MAX_VERSION_BYTES + 1)
    if len(data) > MAX_VERSION_BYTES:
        raise ValueError('Version file is too large')
    version = data.decode('ascii').strip()
    parse_version(version)
    return version


def read_remote_version(url):
    request = Request(url, headers={'User-Agent': 'gzh-skill-kit-update-check'})
    with urlopen(request, timeout=NETWORK_TIMEOUT) as response:
        data = response.read(MAX_VERSION_BYTES + 1)
    if len(data) > MAX_VERSION_BYTES:
        raise ValueError('Version response is too large')
    version = data.decode('ascii').strip()
    parse_version(version)
    return version


def fetch_latest_version():
    for url in (VERSION_URL, MIRROR_URL):
        try:
            return read_remote_version(url)
        except (OSError, URLError, HTTPException, UnicodeError, ValueError):
            continue
    raise ValueError('Release version unavailable from both sources')


def read_state(path):
    try:
        with path.open(encoding='utf-8') as handle:
            data = handle.read(MAX_STATE_BYTES + 1)
        if len(data) > MAX_STATE_BYTES:
            raise ValueError('State is too large')
        state = json.loads(data)
        checked_at = state['checked_at']
        if (type(checked_at) not in (int, float) or not math.isfinite(checked_at)
                or checked_at < 0 or not isinstance(state['notified_versions'], list)):
            raise ValueError('Invalid state')
        if state['latest_version'] is not None:
            parse_version(state['latest_version'])
        for version in state['notified_versions']:
            parse_version(version)
        return state
    except (OSError, UnicodeError, ValueError, TypeError, KeyError, OverflowError):
        return {'checked_at': 0, 'latest_version': None, 'notified_versions': []}


def write_state(path, state):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent,
                                         prefix='.update-check-', suffix='.tmp', delete=False) as handle:
            temporary = Path(handle.name)
            json.dump(state, handle)
            handle.write('\n')
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


@contextmanager
def state_lock(path):
    """Concurrent clients share one reminder history; a busy check is skipped."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.with_name(path.name + '.lock').open('a+b') as handle:
        if handle.seek(0, os.SEEK_END) == 0:
            handle.write(b'\0')
            handle.flush()
        handle.seek(0)
        if os.name == 'nt':
            import msvcrt
            msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            yield
        finally:
            handle.seek(0)
            if os.name == 'nt':
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


def check_locked(current, path, now, force):
    state = read_state(path)
    changed = False
    age = now - state['checked_at']
    if force or state['checked_at'] == 0 or not 0 <= age < CHECK_INTERVAL:
        # Failed checks also wait a week before another automatic attempt.
        state['checked_at'] = now
        state['latest_version'] = None
        # Reserve the attempt before networking; an unwritable cache stays quiet.
        write_state(path, state)
        try:
            latest = fetch_latest_version()
            parse_version(latest)
            state['latest_version'] = latest
            changed = True
        except (OSError, URLError, HTTPException, UnicodeError, ValueError):
            pass
    latest = state['latest_version']
    reminder = ''
    if (latest is not None and parse_version(latest) > parse_version(current)
            and latest not in state['notified_versions']):
        state['notified_versions'].append(latest)
        changed = True
        reminder = f'公众号排版技能有新版 v{latest}；需要时对我说“更新公众号排版技能”即可。'
    if changed:
        # Persist before emitting; an unwritable cache must not repeat notices.
        write_state(path, state)
    return reminder


def check_update(*, force=False, version_file=None, state_file=None, now=None):
    """Return one optional reminder; failures must not interrupt article delivery."""
    try:
        current = read_version(version_file or VERSION_FILE)
        path = Path(state_file or STATE_FILE).expanduser().resolve()
        if path == ROOT or ROOT in path.parents:
            return ''
        now = time.time() if now is None else now
        with state_lock(path):
            return check_locked(current, path, now, force)
    except (OSError, UnicodeError, ValueError):
        return ''


def main():
    configure_stdio()
    parser = argparse.ArgumentParser(description='只检查新版并提醒，不安装或更新技能')
    parser.add_argument('--force', action='store_true', help='立即检查，已提醒的版本仍不会重复提醒')
    args = parser.parse_args()
    try:
        reminder = check_update(force=args.force)
    except (KeyboardInterrupt, EOFError):
        reminder = ''
    if reminder:
        print(reminder)
    return 0


if __name__ == '__main__':
    sys.exit(main())
