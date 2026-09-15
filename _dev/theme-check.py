#!/usr/bin/env python3
"""SHIP GATE — every color literal must be inside the theme engine (Round H, 2026-09-15).

A bare #rrggbb in index.html or app.js is a color that cannot follow the theme: it would stay
night-colored in Water Lilies and Warhol. This is the "lock what you fixed" law for the recolor —
without it the day worlds rot one new literal at a time. Fix by registering it:
    python3 _dev/theme-add.py '#rrggbb:bg'
then reference it as var(--c-rrggbb-bg) in CSS, or THC("#rrggbb","bg") in app.js.
A hex that is only QUOTED IN PROSE (a designAudit gate label) is exempt: write it as #rrggbb/*canon*/.
"""
import re, sys, json
ROLE = re.compile(r'","(bg|ink|accent|onaccent|highlight)"')
# NATIONAL FLAG COLORS are not palette — a French flag is blue-white-red in every world. They live in
# the language picker's inline SVGs and are listed in _dev/theme-fixed.json, which is the ONLY reason a
# bare hex is allowed to stand. Do not add UI colors to that file.
FIXED = set(json.load(open('_dev/theme-fixed.json')))
BAD = []
table = json.load(open('_dev/theme-map.json'))
for path in ('index.html', 'app.js'):
    src = open(path).read()
    body = src[src.index('/* ===== THEME ENGINE'):] if path == 'index.html' else src
    head = src[:src.index('/* ===== THEME ENGINE')] if path == 'index.html' else ''
    gen_end = body.index('}\n', body.index(':root[data-theme="warhol"]{')) if path == 'index.html' else 0
    scan = (head + body[gen_end:]) if path == 'index.html' else src
    for m in re.finditer(r'#[0-9a-fA-F]{6}\b', scan):
        # a literal is legal only as the argument of THC("...")
        if m.group(0).lower() in FIXED and re.search(r'(fill|stroke)="$', scan[max(0, m.start()-8):m.start()]):
            continue  # a flag's own national color, inside its inline SVG
        if scan[m.end():m.end()+9] == '/*canon*/':
            continue  # a night hex quoted inside REPORT PROSE (a designAudit gate label), never painted
        if scan[max(0, m.start()-5):m.start()] == 'THC("':
            name = '--c-%s-%s' % (m.group(0).lstrip('#').lower(), ROLE.match(scan[m.end():m.end()+14]).group(1) if ROLE.match(scan[m.end():m.end()+14]) else '?')
            if name in table: continue
        BAD.append((path, scan[:m.start()].count('\n') + 1, m.group(0)))
# SEMANTIC TOKEN COMPLETENESS. A var(--t-*) that no block defines makes its whole CSS declaration
# invalid at computed-value time, so the property silently falls back to `none` — which is how a
# dropped --t-halo-ring deleted the home stone's halo in every world without any error anywhere.
src = open('index.html').read()
used = set(re.findall(r'var\((--t-[a-z-]+)\)', src))
gs = src.index('/* ===== THEME ENGINE')
blocks = {}
for key, sel in (('night', ':root{'), ('lilies', ':root[data-theme="lilies"]{'), ('warhol', ':root[data-theme="warhol"]{')):
    i = src.index(sel, gs) + len(sel)
    blocks[key] = src[i:src.index('}', i)]
for tok in sorted(used):
    for key, body in blocks.items():
        if tok + ':' not in body:
            BAD.append(('index.html', 0, '%s is used but the %s block never defines it' % (tok, key)))

if BAD:
    print('THEME GATE: FAIL — %d unregistered color literal(s):' % len(BAD))
    for p, ln, h in BAD[:25]: print('  %s:%d  %s' % (p, ln, h))
    print(__doc__)
    sys.exit(1)
print('THEME GATE: PASS — every color literal is themed (%d registered).' % len(table))
