#!/usr/bin/env python3
"""Recompute every theme value from the CURRENT remap and rewrite the three :root blocks.

theme-gen.py rewrote the source files ONCE and must never run again. This is how the MAPPING is
revised afterwards: the var names (and therefore every call site) stay exactly as they are, only
their day-world values are recomputed. Run after editing remap() in theme-gen.py.

    python3 _dev/theme-regen.py
"""
import json, re, sys
exec(open('_dev/theme-gen.py').read().split('# ---------- role detection ----------')[0])

table = json.load(open('_dev/theme-map.json'))
for name, row in table.items():
    row['night'] = row['hex']
    row['lilies'] = remap(row['hex'], row['role'], THEMES['lilies'])
    row['warhol'] = remap(row['hex'], row['role'], THEMES['warhol'])

# semantic vars that are NOT a remap of one literal: the accent halo keeps the frame's authored
# 11px/.09 + 64px/.28 recipe and only swaps its hue, so the night designAudit gate still matches
# its exact rgba string while the day worlds bloom in their own accent.
def rgba(hx, a):
    n = hx.lstrip('#')
    return 'rgba(%d,%d,%d,%s)' % (int(n[0:2],16), int(n[2:4],16), int(n[4:6],16), a)
SEM = {}
for key, T in (('night', None), ('lilies', THEMES['lilies']), ('warhol', THEMES['warhol'])):
    acc = '#ff5fa8' if T is None else T['accent']
    halo = '#ff4fa0' if T is None else T['accent']
    SEM[key] = {
        '--t-accent': acc,
        '--t-on-accent': '#ffffff' if T is None else T['onAccent'],
        '--t-ink-soft': '#b2a6d8' if T is None else inkSoft(T),
        '--t-halo-ring': rgba(halo, '.09'),
        '--t-halo-bloom': rgba(halo, '.28'),
    }

def block(sel, key):
    body = ''.join('%s:%s;' % (v, table[v][key]) for v in sorted(table))
    body += ''.join('%s:%s;' % (k, v) for k, v in sorted(SEM[key].items()))
    return sel + '{' + body + '}'

html = open('index.html').read()
start = html.index('/* ===== THEME ENGINE')
head = html[:start]
tail_from = html.index(':root{', start)
end = html.index('}\n', html.index(':root[data-theme="warhol"]{', start)) + 2
banner = html[start:tail_from]
new = banner + block(':root', 'night') + '\n' + block(':root[data-theme="lilies"]', 'lilies') + '\n' + block(':root[data-theme="warhol"]', 'warhol') + '\n'
open('index.html', 'w').write(head + new + html[end:])
json.dump(table, open('_dev/theme-map.json', 'w'), indent=0)
print('regenerated %d vars + %d semantic tokens x 3 worlds' % (len(table), len(SEM['night'])))
