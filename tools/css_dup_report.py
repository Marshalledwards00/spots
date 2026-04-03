#!/usr/bin/env python3
"""
Simple CSS duplication scanner.
Scans CSS files under `blocks/` and `pages/` and reports selectors that appear in more than one file.
Usage: python3 tools/css_dup_report.py
"""
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
css_dirs = [root / 'blocks', root / 'pages']
files = []
for d in css_dirs:
    if d.exists():
        files.extend(sorted(d.glob('*.css')))

selector_map = {}  # selector -> set(files)

# primitive selector extractor: finds selectors before '{'
selector_re = re.compile(r'([^{}]+)\{')

for f in files:
    text = f.read_text(encoding='utf-8')
    # remove comments
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    for m in selector_re.finditer(text):
        raw = m.group(1).strip()
        # split grouped selectors by comma
        parts = [s.strip() for s in raw.split(',') if s.strip()]
        for p in parts:
            # restrict to simple class/id/element selectors (keep it permissive)
            key = p
            selector_map.setdefault(key, set()).add(str(f.relative_to(root)))

# now find duplicates
duplicates = {s: files for s, files in selector_map.items() if len(files) > 1}

print('Scanned files:')
for f in files:
    print(' -', f.relative_to(root))
print('\nFound %d duplicated selectors across files.\n' % len(duplicates))

# print a prioritized list (most duplicated first)
for s, fs in sorted(duplicates.items(), key=lambda kv: (-len(kv[1]), kv[0])):
    print('Selector:')
    print('  ', s)
    print('Appears in:')
    for f in sorted(fs):
        print('   -', f)
    print()

if not duplicates:
    print('No duplicated selectors found.')
