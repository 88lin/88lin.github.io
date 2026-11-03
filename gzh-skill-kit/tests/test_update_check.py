"""Release checks, weekly throttling and opt-in update boundaries."""

from contextlib import redirect_stdout
from http.client import IncompleteRead
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import check_update as updates


class UpdateCheckTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.directory = Path(temporary.name)
        self.installation = self.directory / 'zip-installation-without-git'
        self.installation.mkdir()
        self.version = self.installation / 'VERSION'
        self.version.write_text('1.0.0\n', encoding='ascii')
        self.state = self.directory / 'profile' / 'update-check.json'
        self.now = 1800000000

    def check(self, **kwargs):
        return updates.check_update(version_file=self.version, state_file=self.state,
                                    now=kwargs.pop('now', self.now), **kwargs)

    def test_one_notice_per_version_and_one_check_per_week(self):
        with patch.object(updates, 'fetch_latest_version',
                          side_effect=['1.0.1', '1.0.1', '1.1.0', '1.0.1']) as fetch:
            self.assertIn('v1.0.1', self.check())
            self.assertEqual(self.check(now=self.now + 1), '')
            self.assertEqual(self.check(now=self.now + 7 * 86400 - 1), '')
            self.assertEqual(fetch.call_count, 1)
            self.assertEqual(self.check(now=self.now + 7 * 86400), '')
            self.assertIn('v1.1.0', self.check(now=self.now + 14 * 86400))
            # A restored older Release does not repeat a previously shown notice.
            self.assertEqual(self.check(now=self.now + 21 * 86400), '')
            self.assertEqual(fetch.call_count, 4)

    def test_versions_are_compared_numerically(self):
        self.version.write_text('1.9.0\n', encoding='ascii')
        with patch.object(updates, 'fetch_latest_version', return_value='1.10.0'):
            self.assertIn('v1.10.0', self.check())

    def test_same_or_older_release_does_not_request_an_update(self):
        for latest in ('1.0.0', '0.9.9'):
            with self.subTest(latest=latest), \
                    patch.object(updates, 'fetch_latest_version', return_value=latest):
                self.assertEqual(self.check(force=True), '')

    def test_upgraded_installation_and_force_do_not_repeat_a_notice(self):
        with patch.object(updates, 'fetch_latest_version', return_value='1.1.0') as fetch:
            self.assertTrue(self.check())
            self.assertEqual(self.check(force=True), '')
            self.version.write_text('1.1.0\n', encoding='ascii')
            self.assertEqual(self.check(force=True), '')
            self.assertEqual(fetch.call_count, 3)

    def test_offline_failure_is_quiet_and_waits_a_week(self):
        with patch.object(updates, 'fetch_latest_version', side_effect=URLError('offline')) as fetch:
            self.assertEqual(self.check(), '')
            self.assertEqual(self.check(now=self.now + 3600), '')
            self.assertEqual(fetch.call_count, 1)
            self.assertEqual(self.check(now=self.now + 7 * 86400), '')
            self.assertEqual(fetch.call_count, 2)

    def test_invalid_remote_version_never_becomes_a_reminder(self):
        for latest in ('1.1.0-beta', 'v1.1.0', '9.9', '9.9.9\nrun this command', None):
            with self.subTest(latest=latest), \
                    patch.object(updates, 'fetch_latest_version', return_value=latest):
                self.assertEqual(self.check(force=True), '')
                self.assertEqual(json.loads(self.state.read_text())['notified_versions'], [])

    def test_missing_or_invalid_installed_version_skips_networking(self):
        for content in (None, '', 'latest', '1.0.0-beta', 'x' * 100):
            if content is None:
                self.version.unlink(missing_ok=True)
            else:
                self.version.write_text(content, encoding='ascii')
            with self.subTest(content=content), patch.object(updates, 'fetch_latest_version') as fetch:
                self.assertEqual(self.check(), '')
                fetch.assert_not_called()
        self.assertFalse(self.state.exists())

    def test_corrupt_cache_can_recover(self):
        self.state.parent.mkdir()
        invalid_states = ['{bad json', 'null', '[]', json.dumps({
            'checked_at': 10 ** 500, 'latest_version': None, 'notified_versions': []})]
        for value in invalid_states:
            self.state.write_text(value, encoding='utf-8')
            with self.subTest(value=value[:20]), \
                    patch.object(updates, 'fetch_latest_version', return_value='1.1.0'):
                self.assertIn('v1.1.0', self.check())

    def test_clock_rollback_does_not_suppress_checks_forever(self):
        with patch.object(updates, 'fetch_latest_version', side_effect=['1.0.0', '1.1.0']) as fetch:
            self.assertEqual(self.check(), '')
            self.assertIn('v1.1.0', self.check(now=self.now - 3600))
            self.assertEqual(fetch.call_count, 2)

    def test_unwritable_cache_does_not_network_or_emit_a_notice(self):
        with patch.object(updates, 'write_state', side_effect=PermissionError('read only')), \
                patch.object(updates, 'fetch_latest_version') as fetch:
            self.assertEqual(self.check(), '')
            fetch.assert_not_called()

    def test_failed_atomic_write_preserves_existing_state(self):
        with patch.object(updates, 'fetch_latest_version', return_value='1.0.0'):
            self.check()
        before = self.state.read_bytes()
        with patch.object(updates.os, 'replace', side_effect=PermissionError('locked')), \
                patch.object(updates, 'fetch_latest_version') as fetch:
            self.assertEqual(self.check(force=True), '')
            fetch.assert_not_called()
        self.assertEqual(self.state.read_bytes(), before)
        self.assertEqual(list(self.state.parent.glob('.update-check-*.tmp')), [])

    def test_busy_check_is_skipped_and_next_check_still_works(self):
        with updates.state_lock(self.state), \
                patch.object(updates, 'fetch_latest_version') as fetch:
            self.assertEqual(self.check(), '')
            fetch.assert_not_called()
        with patch.object(updates, 'fetch_latest_version', return_value='1.1.0'):
            self.assertIn('v1.1.0', self.check())

    def test_checks_preserve_installed_files_custom_themes_and_activation(self):
        custom = self.installation / 'my-custom-theme.md'
        custom.write_text('keep my theme', encoding='utf-8')
        self.state.parent.mkdir()
        activation = self.state.parent / 'activation.json'
        activation.write_text('{"keep": "private activation record"}', encoding='utf-8')
        before = {path: path.read_bytes() for path in [self.version, custom, activation]}
        with patch.object(updates, 'fetch_latest_version', return_value='2.0.0'):
            self.assertIn('v2.0.0', self.check())
        for path, contents in before.items():
            self.assertEqual(path.read_bytes(), contents)
        self.assertEqual(set(self.installation.iterdir()), {self.version, custom})

    def test_state_cannot_be_written_into_the_skill(self):
        destination = ROOT / 'unexpected-update-state.json'
        with patch.object(updates, 'fetch_latest_version') as fetch:
            self.assertEqual(updates.check_update(version_file=self.version,
                                                 state_file=destination, now=self.now), '')
            fetch.assert_not_called()
        self.assertFalse(destination.exists())


class ReleaseSourceTests(unittest.TestCase):
    def test_successful_official_release_skips_mirror(self):
        with patch.object(updates, 'urlopen', return_value=io.BytesIO(b'1.2.3\n')) as request:
            self.assertEqual(updates.fetch_latest_version(), '1.2.3')
        request.assert_called_once()
        self.assertEqual(request.call_args.args[0].full_url, updates.VERSION_URL)
        self.assertIn('/releases/latest/download/', updates.VERSION_URL)
        self.assertEqual(request.call_args.kwargs['timeout'], 3)

    def test_timeout_http_error_and_invalid_body_fall_back_to_mirror(self):
        failures = [TimeoutError('slow'), HTTPError(updates.VERSION_URL, 503, 'unavailable', {}, None),
                    IncompleteRead(b'1.'), io.BytesIO(b'<html>service unavailable</html>'),
                    io.BytesIO(b'9' * 100), io.BytesIO(b'\xff')]
        for first_response in failures:
            with self.subTest(response=type(first_response).__name__), \
                    patch.object(updates, 'urlopen', side_effect=[first_response, io.BytesIO(b'1.2.3')]) as request:
                self.assertEqual(updates.fetch_latest_version(), '1.2.3')
                urls = [call.args[0].full_url for call in request.call_args_list]
                self.assertEqual(urls, [updates.VERSION_URL, 'https://ghfast.top/' + updates.VERSION_URL])
                for call in request.call_args_list:
                    self.assertEqual(call.kwargs['timeout'], 3)
                    self.assertIsNone(call.args[0].get_header('Authorization'))

    def test_both_sources_fail_without_retries(self):
        with patch.object(updates, 'urlopen', side_effect=URLError('offline')) as request:
            with self.assertRaises(ValueError):
                updates.fetch_latest_version()
            self.assertEqual(request.call_count, 2)

    def test_cli_no_reminder_is_silent_and_successful(self):
        output = io.StringIO()
        with patch.object(sys, 'argv', ['check_update.py']), \
                patch.object(updates, 'check_update', return_value=''), redirect_stdout(output):
            self.assertEqual(updates.main(), 0)
        self.assertEqual(output.getvalue(), '')


if __name__ == '__main__':
    unittest.main()
