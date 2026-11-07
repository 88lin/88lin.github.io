"""Offline activation, persistence and real CLI access boundaries."""

from contextlib import redirect_stderr
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import create_fan_code as issuer
import fan_access as access
import wechat_draft as draft
from wrap_preview import render_preview
from fan_access_test_support import TEST_CODE, TEST_POLICY, isolated_skill


class ActivationTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.directory = Path(temporary.name)
        self.policy = self.directory / 'policy.json'
        self.policy.write_text(json.dumps(TEST_POLICY), encoding='utf-8')
        self.state = self.directory / 'private' / 'activation.json'
        for context in (patch.object(access, 'POLICY_FILE', self.policy),
                        patch.dict(os.environ, {access.STATE_ENV: str(self.state)})):
            context.start()
            self.addCleanup(context.stop)

    def test_absent_activation_gives_group_instructions(self):
        with self.assertRaises(access.ActivationRequired) as raised:
            access.require_activation()
        self.assertIn(TEST_POLICY['profile_url'], str(raised.exception))
        self.assertIn(TEST_POLICY['group_name'], str(raised.exception))
        self.assertFalse(self.state.exists())

    def test_alphanumeric_code_accepts_lowercase_and_surrounding_whitespace(self):
        with patch('socket.socket', side_effect=AssertionError('activation must be offline')):
            self.assertEqual(access.activate('  ' + TEST_CODE.lower() + '\n'), self.state.resolve())
            self.assertIsNone(access.require_activation())
        self.assertEqual(json.loads(self.state.read_text())['activation_code'], TEST_CODE)

    def test_wrong_code_does_not_replace_existing_activation(self):
        access.activate(TEST_CODE)
        before = self.state.read_bytes()
        for code in ('XY7ZW8', 'wrong-private-value', '', 'AB2C3', 'AB2CD34',
                     'ABCDEF', '234567', 'AB0CD3', 'AB1CD3', 'ABICD3', 'ABLCD3',
                     'ABOCD3', 'ＡＢ２ＣＤ３', 'AB٢CD٣', 'ſB2CD3', None, 123456, 'x' * 5000):
            with self.subTest(code_type=type(code).__name__):
                with self.assertRaises(access.FanAccessError) as raised:
                    access.activate(code)
                self.assertNotIn('wrong-private-value', str(raised.exception))
                self.assertEqual(self.state.read_bytes(), before)
        access.require_activation()

    def test_corrupt_and_forged_records_fail_closed(self):
        self.state.parent.mkdir()
        for value in ('{bad-json', '[]', 'null', 'x' * 5000,
                      json.dumps({'activated': True}),
                      json.dumps({'version': True, 'activation_code': TEST_CODE}),
                      json.dumps({'version': 1, 'activation_code': 'private-value'}),
                      json.dumps({'version': 1, 'activation_code': 'XY7ZW8'})):
            with self.subTest(value_type=value[:15]):
                self.state.write_text(value, encoding='utf-8')
                with self.assertRaises(access.ActivationRequired) as raised:
                    access.require_activation()
                self.assertNotIn('private-value', str(raised.exception))

    def test_invalid_policy_never_accepts_a_valid_saved_code(self):
        access.activate(TEST_CODE)
        values = [None, [], dict(TEST_POLICY, version=True),
                  dict(TEST_POLICY, code_sha256=''), dict(TEST_POLICY, profile_url=None)]
        for value in values:
            self.policy.write_text(json.dumps(value), encoding='utf-8')
            with self.subTest(value=value), self.assertRaises(access.AccessConfigurationError):
                access.require_activation()
        self.policy.unlink()
        with self.assertRaises(access.AccessConfigurationError):
            access.require_activation()

    def test_failed_write_preserves_activation_and_cleans_temporary_file(self):
        access.activate(TEST_CODE)
        before = self.state.read_bytes()
        with patch.object(access.os, 'replace', side_effect=PermissionError('denied')):
            with self.assertRaises(PermissionError):
                access.activate(TEST_CODE)
        self.assertEqual(self.state.read_bytes(), before)
        self.assertEqual(list(self.state.parent.glob('.activation-*.tmp')), [])

    def test_credentials_cannot_be_saved_in_the_skill_directory(self):
        with patch.dict(os.environ, {access.STATE_ENV: str(ROOT / '.gzh-skill-kit/activation.json')}):
            with self.assertRaisesRegex(access.FanAccessError, '技能目录之外'):
                access.activate(TEST_CODE)

    def test_upload_is_blocked_before_credentials_network_or_input(self):
        with patch.object(draft, 'get_token') as token:
            with self.assertRaises(access.ActivationRequired):
                draft.upload_and_cleanup('cover', 'title', '', '<p>content</p>')
            token.assert_not_called()
        with patch.object(sys, 'argv', ['wechat_draft.py']), patch('builtins.input') as prompt, \
                redirect_stderr(io.StringIO()):
            self.assertEqual(draft.main(), 3)
            prompt.assert_not_called()

    def test_gallery_maintenance_renderer_remains_available(self):
        self.assertIn('<section>sample</section>', render_preview('<section>sample</section>', 'sample'))


class ActivationCliTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.directory = Path(temporary.name)
        self.root, self.environment = isolated_skill(self.directory, activated=False)

    def run_cli(self, script, *arguments, input_text=None, root=None):
        return subprocess.run([sys.executable, '-X', 'utf8',
                               str((root or self.root) / 'scripts' / script), *arguments],
                              input=input_text, text=True, encoding='utf-8', capture_output=True,
                              env=dict(os.environ, **self.environment), timeout=15)

    def test_activate_once_survives_a_new_process_and_installation_update(self):
        self.assertEqual(self.run_cli('fan_access.py', 'status').returncode, 2)
        activated = self.run_cli('fan_access.py', 'activate', '--stdin', input_text=TEST_CODE + '\n')
        self.assertEqual(activated.returncode, 0, activated.stderr)
        self.assertNotIn(TEST_CODE, activated.stdout + activated.stderr)
        moved = self.directory / 'updated-installation'
        shutil.copytree(self.root, moved)
        status = self.run_cli('fan_access.py', 'status', root=moved)
        self.assertEqual(status.returncode, 0, status.stderr)
        self.assertNotIn(TEST_CODE, status.stdout + status.stderr)

    def test_private_code_file_and_invalid_input(self):
        code_file = self.directory / 'group.activation-code.txt'
        code_file.write_text(TEST_CODE, encoding='utf-8-sig')
        result = self.run_cli('fan_access.py', 'activate', '--code-file', str(code_file))
        self.assertEqual(result.returncode, 0, result.stderr)
        invalid = self.run_cli('fan_access.py', 'activate', '--stdin', input_text='private-invalid-code')
        self.assertEqual(invalid.returncode, 1)
        self.assertNotIn('private-invalid-code', invalid.stdout + invalid.stderr)
        self.assertEqual(self.run_cli('fan_access.py', 'status').returncode, 0)

    def test_preview_requires_activation_and_does_not_write_on_failure(self):
        source = self.directory / 'article.html'
        source.write_text('<section><span leaf="">个人文章</span></section>', encoding='utf-8')
        output = self.directory / 'preview.html'
        blocked = self.run_cli('wrap_preview.py', str(source), str(output))
        self.assertEqual(blocked.returncode, 3)
        self.assertFalse(output.exists())
        self.assertIn(TEST_POLICY['group_name'], blocked.stderr)
        self.run_cli('fan_access.py', 'activate', '--stdin', input_text=TEST_CODE)
        success = self.run_cli('wrap_preview.py', str(source), str(output))
        self.assertEqual(success.returncode, 0, success.stderr)
        self.assertIn(source.read_text(encoding='utf-8'), output.read_text(encoding='utf-8'))
        self.assertNotIn(TEST_CODE, output.read_text(encoding='utf-8'))

    def test_unactivated_upload_does_not_prompt_or_read_article(self):
        result = self.run_cli('wechat_draft.py', '--html-file', str(self.directory / 'missing.html'), input_text='')
        self.assertEqual(result.returncode, 3)
        self.assertIn(TEST_POLICY['group_name'], result.stderr)
        self.assertNotIn('Traceback', result.stderr)
        self.assertNotIn('标题:', result.stdout)


class PublisherSetupTests(unittest.TestCase):
    def test_private_code_and_public_digest_are_separate(self):
        with tempfile.TemporaryDirectory() as directory:
            private = Path(directory) / 'private' / 'group.activation-code.txt'
            policy = Path(directory) / 'public' / 'fan-access.json'
            self.assertEqual(issuer.initialize(private, policy), private.resolve())
            code = private.read_text(encoding='utf-8').strip()
            self.assertRegex(code, r'^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$')
            self.assertRegex(code, r'[A-Z]')
            self.assertRegex(code, r'[2-9]')
            data = json.loads(policy.read_text(encoding='utf-8'))
            self.assertEqual(data['code_sha256'], access.code_digest(code))
            self.assertNotIn(code, policy.read_text(encoding='utf-8'))
            before = private.read_bytes()
            with self.assertRaisesRegex(ValueError, '已配置'):
                issuer.initialize(private, policy)
            self.assertEqual(private.read_bytes(), before)

    def test_generation_requires_both_letters_and_digits(self):
        with tempfile.TemporaryDirectory() as directory:
            private = Path(directory) / 'group.activation-code.txt'
            policy = Path(directory) / 'policy.json'
            with patch.object(issuer.secrets, 'choice', side_effect=list('AAAAAA222222ABC234')):
                issuer.initialize(private, policy)
            self.assertEqual(private.read_text(encoding='utf-8').strip(), 'ABC234')

    def test_initializer_refuses_repository_and_existing_private_files(self):
        with tempfile.TemporaryDirectory() as directory:
            policy = Path(directory) / 'policy.json'
            with self.assertRaisesRegex(ValueError, '仓库之外'):
                issuer.initialize(ROOT / 'group.activation-code.txt', policy)
            private = Path(directory) / 'group.activation-code.txt'
            private.write_text('keep-me', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, '已存在'):
                issuer.initialize(private, policy)
            self.assertEqual(private.read_text(), 'keep-me')
            self.assertFalse(policy.exists())


if __name__ == '__main__':
    unittest.main()
