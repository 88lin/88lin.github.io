# Berry Letter preview fonts

These WOFF2 variable fonts are character subsets for `docs/designs/berry-letter.html`.
They are licensed under [SIL Open Font License 1.1](OFL.txt), separately from the repository code.

| File | Source family | Modified family |
|---|---|---|
| `journal-serif.woff2` | Noto Serif SC | Berry Letter Serif |
| `journal-sans.woff2` | Noto Sans SC | Berry Letter Sans |

Sources: locally installed `NotoSerifSC-VF.ttf` and `NotoSansSC-VF.ttf`.
Their name tables identify Adobe as the copyright holder and OFL 1.1 as the license.
Upstream projects: [Noto CJK](https://github.com/notofonts/noto-cjk),
[Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc),
[Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc).

Subsets were produced with fontTools: populate a Subsetter with the preview's text,
retain the source name records, subset glyphs and layout tables, rename family/full/
PostScript names to the modified names above, then save with WOFF2 flavor.
The variable weight axis is retained. Update the subsets when adding preview copy.

These files are used only by the design preview. The copyable article uses local
font fallbacks and does not load font files. STXingkai is a local-only fallback;
no proprietary handwriting font is distributed.
