"""Disposable CLI installations: test codes never unlock the published policy."""

import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
TEST_CODE = 'AB2CD3'
TEST_POLICY = {
    'version': 1,
    'code_sha256': hashlib.sha256(TEST_CODE.encode('ascii')).hexdigest(),
    'profile_url': 'https://www.xiaohongshu.com/user/profile/test-account',
    'group_name': '测试粉丝群',
}


def isolated_skill(directory, *, activated=True):
    directory = Path(directory)
    root = directory / 'test-skill'
    scripts, references, assets = root / 'scripts', root / 'references', root / 'assets'
    for path in (scripts, references, assets):
        path.mkdir(parents=True, exist_ok=True)
    for source in (ROOT / 'scripts').glob('*.py'):
        shutil.copy2(source, scripts / source.name)
    shutil.copy2(ROOT / 'assets/preview-template.html', assets / 'preview-template.html')
    (references / 'fan-access.json').write_text(json.dumps(TEST_POLICY), encoding='utf-8')
    state = directory / 'private-state' / 'activation.json'
    if activated:
        state.parent.mkdir(parents=True, exist_ok=True)
        state.write_text(json.dumps({'version': 1, 'activation_code': TEST_CODE}), encoding='utf-8')
    return root, {'GZH_SKILL_ACTIVATION_FILE': str(state)}
