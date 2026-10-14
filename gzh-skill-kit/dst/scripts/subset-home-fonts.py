"""Build the homepage's WOFF2 subsets from full Noto Sans SC font files.

Requires fonttools[woff]. Pass a directory containing the original medium.woff2,
bold.woff2 and black.woff2. Re-run after adding homepage text; characters outside
the subset still render using the CSS system-font fallbacks.
"""

import argparse
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    output = root / 'assets/home'
    if args.source_dir.resolve() == output.resolve():
        parser.error('Use full source fonts in a separate directory to keep them intact.')
    text = '\n'.join((root / path).read_text(encoding='utf-8') for path in
                     ('index.html', 'assets/home/home.js', 'css/main.css'))
    characters = {ord(char) for char in text} | set(range(32, 256))
    for name in ('medium', 'bold', 'black'):
        source = args.source_dir / f'{name}.woff2'
        destination = output / source.name
        with TTFont(source) as font:
            options = subset.Options()
            options.flavor = 'woff2'
            options.recalc_timestamp = False
            subsetter = subset.Subsetter(options=options)
            subsetter.populate(unicodes=characters)
            subsetter.subset(font)
            font.save(destination)
        print(f'{source.name}: {source.stat().st_size:,} -> {destination.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
