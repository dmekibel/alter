#!/usr/bin/env python3
"""THEME ENGINE GENERATOR — Round H "Two Worlds" (2026-09-15).

Recolor ONLY. Composition, layout, type and shadow GEOMETRY are canon and are never touched.
Night theme is the identity mapping, so today's build renders byte-identical.

Reads   : index.html, app.js
Writes  : index.html (hex -> var(--c-<hex>-<role>)), app.js (hex -> TH("#hex","<role>")),
          _dev/theme-map.json (the audit trail: every literal, its role, its value per theme)
The remap is the design's own roundd-core.js logic, ported verbatim. Values are NOT eyedropped.
"""
import re, json, sys, os

# ---------- color math (verbatim port of roundd-core.js) ----------
def h2h(hx):
    n = hx.lstrip('#')
    r, g, b = (int(n[i:i+2], 16)/255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx+mn)/2; d = mx-mn; h = 0.0
    s = 0.0 if d == 0 else d/(1-abs(2*l-1))
    if d:
        if mx == r: h = ((g-b)/d) % 6
        elif mx == g: h = (b-r)/d+2
        else: h = (r-g)/d+4
        h *= 60
        if h < 0: h += 360
    return [h, s, l]

def hsl2hex(h, s, l):
    c = (1-abs(2*l-1))*s; x = c*(1-abs(((h/60) % 2)-1)); m = l-c/2
    r, g, b = ([c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x])[min(int(h//60), 5)]
    to = lambda v: format(max(0, min(255, int((v+m)*255 + 0.5))), '02x')
    return '#'+to(r)+to(g)+to(b)

def blend(a, b, t):
    """a*t + b*(1-t)"""
    pa, pb = a.lstrip('#'), b.lstrip('#')
    to = lambda i: format(int(int(pa[i:i+2],16)*t + int(pb[i:i+2],16)*(1-t) + 0.5), '02x')
    return '#'+to(0)+to(2)+to(4)

# ---------- the two worlds, exactly as build() returns them ----------
THEMES = {
    'lilies': dict(
        ground='#7285e2', surface='#5d72da', ink='#1c2050', accent='#d966c8', onAccent='#1c2050',
        highlight='#ca16af',   # the doc's hlGold for this world: hsl2hex(h(accent), .8, .44)
        mono=(h2h('#d966c8')[0], 0.55), flatten=True),        # coins=3 + it=5 (moonlit)
    'warhol': dict(
        ground='#df86d9', surface='#d476cc', ink='#2c1035', accent='#ffd062', onAccent='#3a2a05',
        highlight='#ffc41f',   # the doc's hlGold for Warhol, verbatim — the gold the intro emphasis words wear
        mono=(h2h('#df86d9')[0], 0.50), flatten=False),       # coins=4
}

def relL(c):
    """WCAG relative luminance."""
    def ch(v):
        v /= 255.0
        return v/12.92 if v <= 0.03928 else ((v+0.055)/1.055) ** 2.4
    n = c.lstrip('#')
    r, g, b = (ch(int(n[i:i+2], 16)) for i in (0, 2, 4))
    return 0.2126*r + 0.7152*g + 0.0722*b

def contrast(a, b):
    la, lb = relL(a), relL(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

def bodyInk(T):
    """THE FRAME'S OWN BODY INK (David 2026-09-15: "the intro text ... should not just be pure dark
    that's ugly"). He was reading my build, not his design. The frames draw body copy at
    blend(ink, ground, .78) — a soft plum that sits ON the world rather than punching a near-black hole
    in it. Verified byte-identical in BOTH: Warhol #532a59, Water Lilies #2f3670, read off each running
    prototype. My earlier blend(ink, surface, .88) was invented and landed colder and darker (#401c47)."""
    return blend(T['ink'], T['ground'], 0.78)

def inkSoft(T):
    """The design's inkSoft token, color-mix(ink 62%, ground), as a concrete hex."""
    return blend(T['ink'], T['ground'], 0.62)

def coin(c, T):
    """The design's M(): mono remap, then it=5's lightness flattening for lilies."""
    l = h2h(c)[2]
    out = hsl2hex(T['mono'][0], T['mono'][1], max(0.42, min(0.78, l)))
    if T['flatten']:
        h, s, _ = h2h(out)
        out = hsl2hex(h, min(s, 0.6), 0.60)
    return out

# ---------- classification ----------
# Night is a DARK theme; both day worlds are LIGHT. Structural colors must invert polarity,
# chromatic domain colors go through the design's coin function.
def band(c):
    """Night is a DARK theme, both day worlds are LIGHT, so structural colors must invert
    polarity while chromatic domain colors go through the design's coin function.
    Lightness decides, not saturation: HSL saturation blows up near white (#fff2f9 reads s=1.0)."""
    h, s, l = h2h(c)
    if l >= 0.80: return 'light'                      # near-white text / glyphs
    if l < 0.20 or (l < 0.45 and s < 0.60): return 'structural'   # grounds, panels, ink borders, lips
    return 'coin'                                     # domain hues

def remap(c, role, T):
    """role: bg = a fill, ink = text/border/shadow, accent = the ONE primary action color.

    THE ACCENT ROLE (added 2026-09-15 after David: "the Warhol color lacking the yellow entirely so
    the middle button ain't yellow"). The design's palette is NOT just a ground plus a coin family —
    build() returns a separate `accent`, and in Warhol FLIPPED that accent is the gold #ffd062 that
    the home stone and the primary button wear. Collapsing it into the mono coin set was the miss:
    it deleted the one color that makes Warhol read as Warhol. Accent sites are named per call site,
    never inferred from the hex, because the same pink is an ordinary coin nearly everywhere else.

    THE CONTRAST GUARD (same round, David: "the other light color being not very legible"). Night is
    light-on-dark, so a LIGHT SATURATED hex is almost always text or a glyph that was legible because
    its ground was near-black. Re-hued onto a light day ground it lands light-on-light and disappears
    (#ff8fc0 became #de9bd9 on a #df86d9 ground — 1.05:1, invisible). So every ink-role result is
    measured against the theme ground and anything under 3:1 falls back to the design's own inkSoft
    token. Measured, not taste: no color is changed that was already readable.
    """
    h, s, l = h2h(c)
    if role == 'accent': return T['accent']
    if role == 'onaccent': return T['onAccent']
    # HIGHLIGHT is the doc's own hlGold/hlPink/hlBlue — in BOTH day worlds all three collapse to one
    # emphasis color (Warhol #ffc41f, Water Lilies #ca16af). It is what makes the intro's key words and
    # the guardian mark read as the palette instead of as flat dark ink.
    if role == 'highlight': return T['highlight']
    # EDGE = a border, an outline, or a hard "lip" shadow. Night is a dark world, so its edges are the
    # near-black ink and they read as depth. On a light world that same ink is the darkest thing on the
    # screen and reads as a cheap black outline (David 2026-09-15: "I don't like the black outline").
    # His own deck law says it — "NO ink border and NO black outline ANYWHERE on the deck, a FLAT hue
    # face on a CHUNKY lip of its OWN hue" — and the Round H frame draws every element at border:0 with
    # a lip of mix(own hue 62%, ink). A stylesheet cannot mix against an element's own background, so
    # the day worlds get one shared edge a long way down from ink toward the ground: dark enough to
    # read as a lip, never a black line. Night keeps its own value, so it is untouched.
    if role == 'edge': return blend(T['ink'], T['ground'], 0.55)
    # HEAD = a display heading. The frame draws "What now?" at the FULL ink (#1c2050 in Water Lilies),
    # not at the softer body ink — headings are the one place the world wants maximum weight.
    if role == 'head': return T['ink']
    # ONPIECE = a label or glyph sitting ON a coin. The frame's Planner pill is a #d161c0 coin carrying
    # a #f3ecff label, and the tool tiles carry white glyphs: text on a mid-toned piece stays LIGHT,
    # the opposite of text on the ground. (Text on the bright ACCENT is dark — that is `onaccent`.)
    if role == 'onpiece': return '#f3ecff'
    # GEM = the spark currency. Gold in BOTH day frames (#ffc41f), so it is world-independent and must
    # NOT follow the highlight, which is magenta in Water Lilies.
    if role == 'gem': return '#ffc41f'
    if c == '#ffffff':
        # a white FILL is a specular highlight and stays white; white TEXT must flip on a light ground
        return c if role == 'bg' else bodyInk(T)  # white is PRIMARY text
    b = band(c)
    if b == 'light':
        if role == 'bg':
            return blend('#ffffff', T['ground'], min(1.0, (l-0.80)/0.20) * 0.72)
        out = bodyInk(T)
    elif b == 'structural':
        if role == 'bg':
            t = min(1.0, l/0.45)
            return blend(T['surface'], T['ground'], t)
        out = blend(T['ink'], T['surface'], 1 - min(1.0, l/0.45) * 0.26)
    else:
        out = coin(c, T)
        if role == 'bg':
            return out
    if contrast(out, T['ground']) < 3.0:
        # Keep the hierarchy the night build had: a MUTED source was secondary text, so it lands on the
        # design's inkSoft; a saturated one was primary text or a glyph and lands on full ink.
        out = inkSoft(T) if s < 0.45 else bodyInk(T)
    return out

# ---------- role detection ----------
BG_PROPS = re.compile(r'(background|fill|gradient)', re.I)
INK_PROPS = re.compile(r'(border|shadow|outline|color|stroke|text)', re.I)

def role_css(src, pos):
    """Walk back to the start of the declaration and read its property name."""
    start = max(0, pos-180)
    seg = src[start:pos]
    cut = max(seg.rfind(';'), seg.rfind('{'), seg.rfind('"'), seg.rfind("'"))
    decl = seg[cut+1:]
    prop = decl.split(':')[0] if ':' in decl else decl
    if BG_PROPS.search(prop): return 'bg'
    if INK_PROPS.search(prop): return 'ink'
    return 'bg' if BG_PROPS.search(decl) else 'ink'

def role_js(src, pos):
    seg = src[max(0, pos-90):pos]
    if re.search(r'(background|gradient|fillStyle|\bbg\b|paintDisc)', seg, re.I): return 'bg'
    if re.search(r'(border|shadow|strokeStyle|\bcolor\b|\bink\b)', seg, re.I): return 'ink'
    return 'ink'

HEX = re.compile(r'#[0-9a-fA-F]{6}\b')
used = {}

def vname(hx, role):
    return '--c-%s-%s' % (hx.lstrip('#'), role)

def rewrite(path, kind):
    """CSS value positions become var(--c-...). A hex that is a WHOLE JS string literal is a real
    JS value (it is passed to mixHex, to canvas fillStyle, or stored in data) and becomes TH(...),
    which returns a hex string, so every downstream consumer keeps working."""
    src = open(path).read()
    out = []; last = 0; n = 0; nth = 0
    for m in HEX.finditer(src):
        hx = m.group(0).lower()
        whole_string = (kind == 'js'
                        and m.start() > 0 and src[m.start()-1] in '"\''
                        and m.end() < len(src) and src[m.end()] == src[m.start()-1])
        role = (role_css if kind == 'css' else role_js)(src, m.start())
        used[(hx, role)] = True
        if whole_string:
            out.append(src[last:m.start()-1])
            out.append('TH("%s","%s")' % (hx, role))
            last = m.end() + 1
            nth += 1
        else:
            out.append(src[last:m.start()])
            out.append('var(%s)' % vname(hx, role))
            last = m.end()
        n += 1
    out.append(src[last:])
    return ''.join(out), n, nth
if __name__ == '__main__':
    apply = '--apply' in sys.argv
    html, n1, _ = rewrite('index.html', 'css')
    js,   n2, nth = rewrite('app.js', 'js')
    table = {}
    for (hx, role) in sorted(used):
        table[vname(hx, role)] = {'hex': hx, 'role': role, 'night': hx,
                                  'lilies': remap(hx, role, THEMES['lilies']),
                                  'warhol': remap(hx, role, THEMES['warhol'])}
    print('index.html literals: %d   app.js literals: %d (%d as TH() values, %d as css vars)   distinct (hex,role): %d' % (n1, n2, nth, n2-nth, len(table)))
    if apply:
        json.dump(table, open('_dev/theme-map.json', 'w'), indent=0)
        open('/tmp/theme-index.html', 'w').write(html)
        open('/tmp/theme-app.js', 'w').write(js)
        print('staged -> /tmp/theme-index.html, /tmp/theme-app.js, _dev/theme-map.json')
