#!/usr/bin/env python3
"""Register a NEW color literal with the theme engine (Round H, 2026-09-15).

The generator (_dev/theme-gen.py) ran ONCE over the whole codebase and is not idempotent, so any hex
added to index.html or app.js after that must come through here or it stays night-colored in the two
day worlds. _dev/theme-check.py fails the ship when an unregistered literal appears.

    python3 _dev/theme-add.py '#8a2f7a:bg' '#e06fd0:ink'     # then use var(--c-8a2f7a-bg) / THC("#e06fd0","ink")
"""
import json, re, sys
exec(open('_dev/theme-gen.py').read().split('# ---------- role detection ----------')[0])

if len(sys.argv) < 2:
    print(__doc__); sys.exit(1)
table = json.load(open('_dev/theme-map.json'))
html = open('index.html').read()
added = []
for arg in sys.argv[1:]:
    hx, _, role = arg.partition(':')
    hx = hx.lower(); role = role or 'ink'
    assert re.fullmatch(r'#[0-9a-f]{6}', hx), 'bad hex: ' + hx
    assert role in ('bg', 'ink'), 'role must be bg or ink'
    name = '--c-%s-%s' % (hx.lstrip('#'), role)
    if name in table:
        print('already registered:', name); continue
    row = {'hex': hx, 'role': role, 'night': hx,
           'lilies': remap(hx, role, THEMES['lilies']), 'warhol': remap(hx, role, THEMES['warhol'])}
    table[name] = row
    for sel, key in ((':root{', 'night'), (':root[data-theme="lilies"]{', 'lilies'), (':root[data-theme="warhol"]{', 'warhol')):
        i = html.index(sel, html.index('THEME ENGINE')) + len(sel)
        html = html[:i] + '%s:%s;' % (name, row[key]) + html[i:]
    added.append((name, row['lilies'], row['warhol']))
if added:
    json.dump(table, open('_dev/theme-map.json', 'w'), indent=0)
    open('index.html', 'w').write(html)
for name, l, w in added:
    print('registered %s  lilies %s  warhol %s' % (name, l, w))
