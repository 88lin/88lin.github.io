"""UTF-8 command-line I/O, including redirected streams on Windows."""

import sys


def configure_stdio():
    # Only CLI entrypoints call this; importing a library must not change its host.
    for stream in (sys.stdin, sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")


def print_status(message, *, file=None):
    """Library status output must never turn a successful write into an error."""
    stream = file or sys.stdout
    encoding = getattr(stream, 'encoding', None)
    if encoding:
        message = str(message).encode(encoding, errors='backslashreplace').decode(encoding)
    print(message, file=stream)
