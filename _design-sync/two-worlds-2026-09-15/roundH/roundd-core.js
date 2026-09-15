export function makeCore(inkGlyphs, shadowMode) {
const h2h = hex => {
      const n = hex.replace('#', '');
      const r = parseInt(n.slice(0, 2), 16) / 255, g = parseInt(n.slice(2, 4), 16) / 255, b = parseInt(n.slice(4, 6), 16) / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0;
      const l = (mx + mn) / 2, d = mx - mn;
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      if (d !== 0) {
        if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
        h *= 60; if (h < 0) h += 360;
      }
      return [h, s, l];
    };
    const hsl2hex = (h, s, l) => {
      const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
      let [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
      const to = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
      return '#' + to(r) + to(g) + to(b);
    };
    const lum = (hex, dl, ds) => { const [h, s, l] = h2h(hex); return hsl2hex(h, Math.max(0, Math.min(1, s + (ds || 0))), Math.max(0.05, Math.min(0.95, l + dl))); };
    const blend = (a, b, t) => {
      const pa = a.replace('#', ''), pb = b.replace('#', '');
      const to = i => Math.round(parseInt(pa.slice(i, i + 2), 16) * t + parseInt(pb.slice(i, i + 2), 16) * (1 - t)).toString(16).padStart(2, '0');
      return '#' + to(0) + to(2) + to(4);
    };
    const DEFS = [
      { name: 'Powerpuff Day', kind: 'Round A winner.', ground: '#f9dfe9', surface: '#f6c3d7', ink: '#2a1730', accent: '#ff4fa0', onAccent: 'ink' },
      { name: 'Hockney Pool', kind: 'Round A winner.', ground: '#cfeef0', surface: '#b5e8ec', ink: '#142a3a', accent: '#ff4fa0', onAccent: 'ink' },
      { name: 'Carnation, Lily, Lily, Rose', kind: 'Sargent’s twilight garden.', ground: '#d5d0e4', surface: '#c0bcda', ink: '#2b2342', accent: '#ffb43d', onAccent: 'ink' },
      { name: 'Almond Blossom', kind: 'Van Gogh celadon sky.', ground: '#d2e8e2', surface: '#bcded4', ink: '#1f3a33', accent: '#ff7ab0', onAccent: 'ink' },
      { name: 'Impression, Sunrise', kind: 'Pale sky, one orange sun.', ground: '#d4e3f2', surface: '#bad4ed', ink: '#23303a', accent: '#ff7a45', onAccent: 'ink' },
      { name: 'Dusty Rose Hour', kind: 'Colored rose ground, violet accent.', ground: '#ecc3d3', surface: '#e3aec4', ink: '#33121f', accent: '#7c5cff', onAccent: 'white' },
      { name: 'Lilac Hour', kind: 'Deep lavender, gold accent.', ground: '#cfc0ea', surface: '#beaae2', ink: '#251743', accent: '#ffc41f', onAccent: 'ink' },
      { name: 'Sea Glass', kind: 'Deep aqua, calm.', ground: '#abd9d5', surface: '#95d0ca', ink: '#11302d', accent: '#ff5f9d', onAccent: 'ink' },
      { name: 'Cornflower', kind: 'Periwinkle, orange accent.', ground: '#bac9ef', surface: '#a6b8e9', ink: '#1b2444', accent: '#ff8a3a', onAccent: 'ink' },
      { name: 'Peach Hour', kind: 'Warm peach, blue accent.', ground: '#f4cca9', surface: '#efbc90', ink: '#3a2113', accent: '#2a9fe0', onAccent: 'ink' },
      { name: 'Turner Sunset', kind: 'Apricot wash, violet accent.', ground: '#f2cdb4', wash: 'linear-gradient(180deg, #f6dcc0 0%, #f2cdb4 52%, #eebbae 100%)', surface: '#edbfa4', ink: '#38201a', accent: '#8a5cf0', onAccent: 'white' },
      { name: 'Hokusai Wave', kind: 'Foam blue-grey, wave blue.', ground: '#d8e6ea', surface: '#c3d9e1', ink: '#1b2e3a', accent: '#2a6fd0', onAccent: 'white' },
      { name: 'Pink Monochrome', kind: 'MINIMAL: one pink family.', ground: '#f6d7e4', surface: '#f0c4d8', ink: '#2a1225', accent: '#ff4fa0', onAccent: 'ink', mono: [333, 0.78] },
      { name: 'Blue Calm', kind: 'MINIMAL: one blue family.', ground: '#d8e5f4', surface: '#c4d8ee', ink: '#16283c', accent: '#2a9fe0', onAccent: 'ink', mono: [207, 0.72] },
      { name: 'Twilight Violet', kind: 'MINIMAL: violet family, gold note.', ground: '#d9d2e8', surface: '#c9c0e0', ink: '#241a3d', accent: '#ffc41f', onAccent: 'ink', mono: [262, 0.58] },
      { name: 'Clay & Teal', kind: 'MINIMAL: terracotta family, teal accent.', ground: '#efe0d6', surface: '#e8d2c2', ink: '#2e1f18', accent: '#1a9e94', onAccent: 'white', mono: [18, 0.62] },
      { name: 'Pink Panther ’76', kind: 'Sun-faded newsprint orange.', ground: '#f2b27c', surface: '#eda05c', ink: '#3a1c10', accent: '#ff4fa0', onAccent: 'ink' },
      { name: 'Cerulean Saturday', kind: 'Comic-cover cerulean sky.', ground: '#8ecbe8', surface: '#79bfe2', ink: '#16334a', accent: '#ff4fa0', onAccent: 'ink' },
      { name: 'Care Bears Print', kind: 'Sun-bleached rainbow cover.', ground: '#d2e2f2', wash: 'linear-gradient(180deg, #d6e5f5 0%, #d2e2f2 55%, #d5e7d6 100%)', surface: '#bed6ec', ink: '#2a3450', accent: '#ff6b9d', onAccent: 'ink' },
      { name: 'Mauve Tapestry', kind: 'Mural fabric, antique gold.', ground: '#d0c2cd', surface: '#c0aebd', ink: '#2d2233', accent: '#d9a441', onAccent: 'ink' },
      { name: 'Tapestry Green', kind: 'Mural sage, antique gold.', ground: '#b9cfc0', surface: '#a4c3ad', ink: '#20362a', accent: '#d9a441', onAccent: 'ink' },
      { name: 'Polka-Dot Lilac', kind: 'Embrace illustration, cranberry accent.', ground: '#c3b8e0', surface: '#b2a5d8', ink: '#2c2040', accent: '#d63d6b', onAccent: 'white' },
      { name: 'Firelight Dusk', kind: 'The dancer, ember accent.', ground: '#b58ac8', wash: 'linear-gradient(180deg, #bd93cf 0%, #b58ac8 55%, #a877be 100%)', surface: '#a577bc', ink: '#331b44', accent: '#ff7a3a', onAccent: 'ink' },
      { name: 'Mirror Night', kind: 'The boudoir, satin pink.', ground: '#9db1d8', surface: '#89a0d0', ink: '#1c2745', accent: '#ff7ab0', onAccent: 'ink' },
      { name: 'Cupcake Pebbles', kind: 'Cereal-box aqua, frosting pink.', ground: '#7cd4e4', surface: '#5fc8dc', ink: '#173a44', accent: '#ff6bb8', onAccent: 'ink' },
      { name: 'Strawberry Pops', kind: 'Strawberry-milk pink, red-orange burst.', ground: '#f4a8c4', surface: '#ef94b6', ink: '#3a1020', accent: '#ff5a3c', onAccent: 'ink' },
      { name: 'PPG Bedtime', kind: 'Powerpuff bubblegum room.', ground: '#f7bfd4', surface: '#f3aac6', ink: '#33101f', accent: '#5fc8dc', onAccent: 'ink' },
      { name: 'Drive-In Dusk', kind: 'Slate-blue evening, curtain rose.', ground: '#aab4c4', wash: 'linear-gradient(180deg, #b4bcca 0%, #aab4c4 55%, #9daabc 100%)', surface: '#98a5b8', ink: '#232a38', accent: '#e05a8c', onAccent: 'ink' },
      { name: 'Care Bears Moon', kind: 'Dusty mauve night, star gold.', ground: '#b598b8', surface: '#c9a3c4', ink: '#301d36', accent: '#ffc41f', onAccent: 'ink' },
      { name: 'Corsage', kind: 'Blush bouquet, jade-glove green.', ground: '#f6d3d8', wash: 'linear-gradient(180deg, #f8dcda 0%, #f6d3d8 55%, #f2c4d0 100%)', surface: '#f0bfc8', ink: '#33161e', accent: '#3aa88a', onAccent: 'ink' },
      { name: 'Richie Pink', kind: 'Pink cloud sky, red-orange pop.', ground: '#f3b8cc', surface: '#eba4bf', ink: '#33121c', accent: '#ff5a3c', onAccent: 'ink' },
      { name: 'Snow Business', kind: 'Winter sky, pink plow.', ground: '#a8dcec', surface: '#93d2e6', ink: '#1a303c', accent: '#ff6bb8', onAccent: 'ink' },
      { name: 'Hot Stuff', kind: 'Pale pink over swim-green.', ground: '#f5c6d2', surface: '#eeb0c2', ink: '#38141c', accent: '#e8402a', onAccent: 'white' },
      { name: 'Psychedelic Teal', kind: 'Saturated teal, hot pink.', ground: '#7ecacb', surface: '#66bfc2', ink: '#122c33', accent: '#ff3d8f', onAccent: 'ink' },
      { name: 'Tokyo Halftone', kind: 'Rose haze into butter.', ground: '#e8b4b4', wash: 'linear-gradient(180deg, #ecc0ba 0%, #e8b4b4 50%, #e6ca96 100%)', surface: '#e0a4a6', ink: '#2e2026', accent: '#ffcf3d', onAccent: 'ink' },
      { name: 'Spray Prism', kind: 'Airbrush rainbow ground.', ground: '#8cd4e4', wash: 'linear-gradient(180deg, #f4a7b4 0%, #a9d9b8 34%, #7cd4e8 64%, #c9a3ec 100%)', surface: '#9ecfe0', ink: '#232338', accent: '#ff4fa0', onAccent: 'ink' },
      { name: 'Swatch Tan', kind: 'Warm tan, its orange accent.', ground: '#e3d5b8', surface: '#d2af81', ink: '#2e2418', accent: '#fd7446', onAccent: 'ink' },
      { name: 'Springfield Bus', kind: 'Blue-violet dusk, Simpsons yellow.', ground: '#8e9ed0', surface: '#7a8cc6', ink: '#1c2148', accent: '#ffd23d', onAccent: 'ink' },
      { name: 'Springfield TV', kind: 'Sage green, violet accent.', ground: '#a9c9a4', surface: '#96bc90', ink: '#21301e', accent: '#6b5cb8', onAccent: 'white' },
      { name: 'Springfield Sunset', kind: 'Pink sunset street.', ground: '#f0a0cc', wash: 'linear-gradient(180deg, #f2aad2 0%, #eb98c8 55%, #bd74ae 100%)', surface: '#e88cc0', ink: '#3a1030', accent: '#ffb63d', onAccent: 'ink' },
      { name: 'Krusty Bedroom', kind: 'Pink walls, carpet green.', ground: '#f3b4bc', surface: '#eaa0aa', ink: '#351318', accent: '#2fa888', onAccent: 'ink' },
      { name: 'Candy Strip', kind: 'Butter ground, #FF6F91 pink.', ground: '#ffe27a', surface: '#f7d456', ink: '#33270d', accent: '#ff6f91', onAccent: 'ink' },
      { name: 'Warhol Pastel', kind: 'Lilac-white, coral accent.', ground: '#e3dfff', surface: '#cdc3f8', ink: '#2c2145', accent: '#f78154', onAccent: 'ink' },
      { name: 'Retro Stripe', kind: 'Cream, 70s poppy red.', ground: '#f6ecd8', surface: '#efe0c2', ink: '#26243a', accent: '#e0533f', onAccent: 'white' },
      { name: 'Marilyn', kind: 'Hot pink screenprint.', ground: '#ef9ec6', surface: '#e788ba', ink: '#341226', accent: '#ff8a1f', onAccent: 'ink' },
      { name: 'Tomato Soup', kind: 'Can orange, Campbell navy.', ground: '#f2b48c', surface: '#eca070', ink: '#38180e', accent: '#2a4fa8', onAccent: 'white' },
      { name: 'Water Lilies Vivid', kind: 'Periwinkle pond, lily pink.', ground: '#a9b4e8', surface: '#94a1e0', ink: '#1c2050', accent: '#d966c8', onAccent: 'ink' },
      { name: 'Lilac & Olive', kind: '#D3CDFB lilac, olive accent.', ground: '#d3cdfb', surface: '#b9a6ef', ink: '#2a2440', accent: '#5b764d', onAccent: 'white' },
      { name: 'Candy Strip TOTAL', kind: 'TOTAL: coins from the 5-strip.', ground: '#ffe27a', surface: '#f7d456', ink: '#33270d', accent: '#6a0572', onAccent: 'white', remap: { pink: '#ff6f91', orange: '#ff6b6b', teal: '#4ecdc4', blue: '#4ecdc4', slate: '#9a7ab0', purple: '#6a0572', green: '#45c4a8', yellow: '#ff9e5e' } },
      { name: 'Candy Strip FLIPPED', kind: 'FLIPPED: plum ground, butter button.', ground: '#6a0572', surface: '#7f1a86', ink: '#ffeef6', accent: '#ffe66d', onAccent: '#3a2a05', remap: { pink: '#ff6f91', orange: '#ff6b6b', teal: '#4ecdc4', blue: '#4ecdc4', slate: '#b88ac4', purple: '#c45ecc', green: '#45c4a8', yellow: '#ffe66d' } },
      { name: 'Warhol TOTAL', kind: 'TOTAL: the coolors-warhol six.', ground: '#e3dfff', surface: '#cdc3f8', ink: '#2c2145', accent: '#f78154', onAccent: 'ink', remap: { pink: '#df86d9', orange: '#f78154', teal: '#74deb9', blue: '#7ee8fa', slate: '#a8a2d8', purple: '#b49def', green: '#74deb9', yellow: '#ffd062' } },
      { name: 'Warhol FLIPPED', kind: 'FLIPPED: orchid ground, gold button.', ground: '#df86d9', surface: '#d476cc', ink: '#2c1035', accent: '#ffd062', onAccent: '#3a2a05', remap: { pink: '#f4b2ea', orange: '#f78154', teal: '#74deb9', blue: '#7ee8fa', slate: '#b088c8', purple: '#9a5cc8', green: '#74deb9', yellow: '#ffd062' } },
      { name: 'Water Lilies TOTAL', kind: 'TOTAL: the whole pond.', ground: '#a9b4e8', surface: '#94a1e0', ink: '#1c2050', accent: '#d966c8', onAccent: 'ink', remap: { pink: '#d966c8', orange: '#d09b66', teal: '#74c4b9', blue: '#5b6fd4', slate: '#8c96cc', purple: '#b49def', green: '#5b9c6d', yellow: '#d09b66' } },
      { name: 'Pond FLIPPED', kind: 'FLIPPED: ultramarine water, lily-pink button.', ground: '#3a4494', surface: '#4a55a8', ink: '#eef0ff', accent: '#ff8ad8', onAccent: 'ink', remap: { pink: '#ff8ad8', orange: '#e0a866', teal: '#74c4b9', blue: '#7c8ff0', slate: '#8c96cc', purple: '#b49def', green: '#6ab87e', yellow: '#e8c05e' } },
      { name: 'Marilyn TOTAL', kind: 'TOTAL: screenprint coins.', ground: '#ef9ec6', surface: '#e788ba', ink: '#341226', accent: '#ff8a1f', onAccent: 'ink', remap: { pink: '#ff4fa0', orange: '#ff8a1f', teal: '#2fb8a8', blue: '#3a7fd0', slate: '#8f9e80', purple: '#8a4fc0', green: '#9ccf3a', yellow: '#ffe15e' } },
      { name: 'Tapestry TOTAL', kind: 'TOTAL: the mural set.', ground: '#d0c2cd', surface: '#c0aebd', ink: '#2d2233', accent: '#d9a441', onAccent: 'ink', remap: { pink: '#c46a86', orange: '#c07a4e', teal: '#4a7a5e', blue: '#6b7fa8', slate: '#8a92a8', purple: '#8a5a78', green: '#5e8a6a', yellow: '#d9a441' } },
      { name: 'Springfield TOTAL', kind: 'TOTAL: bus dusk, one yellow.', ground: '#8e9ed0', surface: '#7a8cc6', ink: '#1c2148', accent: '#ffd23d', onAccent: '#3a2a05', remap: { pink: '#9a6ad0', orange: '#ffd23d', teal: '#4aa0c8', blue: '#4a6ad0', slate: '#7a86b8', purple: '#6a4fc0', green: '#5aa8c4', yellow: '#ffd23d' } },
      { name: 'Sage Monastery', kind: 'TOTAL: herb-garden coins, pine button.', ground: '#cfdcc8', surface: '#bccfb2', ink: '#22301f', accent: '#2e6a52', onAccent: 'white', remap: { pink: '#c4849a', orange: '#c9985e', teal: '#5da892', blue: '#6a94ac', slate: '#8aa08c', purple: '#9686b4', green: '#6aa876', yellow: '#c9ac5e' } },
      { name: 'Blush FLIPPED', kind: 'FLIPPED Powerpuff: pink IS the ground.', ground: '#e84d96', surface: '#d84389', ink: '#fff0f7', accent: '#ffe27a', onAccent: '#3a2a05', remap: { pink: '#b80f60', orange: '#ff7a2a', teal: '#1a8a94', blue: '#2a6ac0', slate: '#a83e78', purple: '#6a3ac0', green: '#1f9a68', yellow: '#ffc41f' } },
      { name: 'Lavender Lamplight', kind: 'TOTAL: dusk lavender, lamp-gold button.', ground: '#b9aed6', surface: '#a99cce', ink: '#241c3d', accent: '#ffb84a', onAccent: '#3a2a05', remap: { pink: '#c87a9a', orange: '#cfa070', teal: '#5aa8a0', blue: '#7a8ac8', slate: '#9090b8', purple: '#a878b8', green: '#6aa08a', yellow: '#d0b166' } },
    ];
    const SEC = {
      'Pink Panther ’76': ['#ff6bb0', '#e86a2a', '#3aa8a0', '#3a7fc0', '#9a8a70', '#8a5aa8', '#5a9a4a', '#ffc84a'],
      'Cerulean Saturday': ['#ff6bb0', '#ff8a4a', '#4ab8c8', '#2a6fd0', '#7a94b0', '#9a6ac8', '#5ab86a', '#ffd24a'],
      'Care Bears Print': ['#ff8ab8', '#ffaa5a', '#5ac8b8', '#6a9ae0', '#98a8c8', '#b08ad8', '#7ac878', '#ffe07a'],
      'Mauve Tapestry': ['#c46a86', '#c07a4e', '#4a7a5e', '#6b7fa8', '#8a92a8', '#8a5a78', '#5e8a6a', '#d9a441'],
      'Tapestry Green': ['#c46a86', '#c07a4e', '#4a7a5e', '#6b7fa8', '#8a92a8', '#8a5a78', '#5e8a6a', '#d9a441'],
      'Polka-Dot Lilac': ['#d63d6b', '#e08a5a', '#5aa8a0', '#6a7ad0', '#9a94c0', '#8a6ac8', '#6aa87a', '#e8c05a'],
      'Firelight Dusk': ['#ff5a8f', '#ff7a3a', '#4a9ab0', '#5a6ad0', '#9a80b8', '#8a4fc0', '#5a9a6a', '#ffb84a'],
      'Mirror Night': ['#ff7ab0', '#e8925a', '#5aa8b8', '#4a6fc0', '#8a9ac8', '#9a7ad0', '#6aa88a', '#e8c86a'],
      'Richie Pink': ['#ff5a8f', '#ff5a3c', '#4ab8b0', '#4a8ad0', '#a08aa0', '#a86ac0', '#6ab86a', '#ffd24a'],
      'Snow Business': ['#ff6bb8', '#ff8a4a', '#4ac8d0', '#3a8ad8', '#8aa0b8', '#9a7ad0', '#6ac88a', '#ffd86a'],
      'Hot Stuff': ['#f06a9a', '#e8402a', '#4ab8a0', '#4a8ac8', '#a89098', '#a05ab0', '#78c878', '#ffd05a'],
      'Psychedelic Teal': ['#ff3d8f', '#ff7a3a', '#2a9aa0', '#3a6ac8', '#7a9aa8', '#8a4ab8', '#4aa86a', '#ffd04a'],
      'Tokyo Halftone': ['#e87a9a', '#e89a5a', '#6aa89a', '#6a8ab8', '#a89a98', '#9a7aa8', '#8aa86a', '#ffcf3d'],
      'Spray Prism': ['#f48ab0', '#ffa06a', '#5ac8c0', '#5a9ae0', '#98a0c0', '#b08ae0', '#7ac888', '#ffe08a'],
      'Swatch Tan': ['#e88a9a', '#fd7446', '#5aa898', '#5a8ab0', '#a09884', '#a87a98', '#7aa06a', '#e8b85a'],
      'Springfield Bus': ['#c86aa8', '#ff9a4a', '#4aa0c8', '#4a6ad0', '#7a86b8', '#8a5ac8', '#5aa8a0', '#ffd23d'],
      'Springfield TV': ['#c87aa0', '#d0925a', '#5aa88a', '#5a8ab8', '#8aa098', '#6b5cb8', '#6aa860', '#e0c05a'],
      'Springfield Sunset': ['#ff6bb0', '#ff9a4a', '#5aa8b0', '#5a7ad0', '#a888b8', '#9a5ab8', '#6aa87a', '#ffb63d'],
      'Krusty Bedroom': ['#ff7a9a', '#e88a4a', '#2fa888', '#4a8ac8', '#a090a0', '#9a6ab8', '#5ab87a', '#ffd06a'],
      'Candy Strip': ['#ff6f91', '#ff6b6b', '#4ecdc4', '#45b8d8', '#9a8ab0', '#a83e9a', '#45c4a8', '#ffe66d'],
      'Candy Strip TOTAL': ['#ff6f91', '#ff6b6b', '#4ecdc4', '#45b8d8', '#9a8ab0', '#a83e9a', '#45c4a8', '#ffe66d'],
      'Candy Strip FLIPPED': ['#ff6f91', '#ff6b6b', '#4ecdc4', '#45b8d8', '#b88ac4', '#c45ecc', '#45c4a8', '#ffe66d'],
      'Warhol Pastel': ['#df86d9', '#f78154', '#74deb9', '#7ee8fa', '#a8a2d8', '#b49def', '#8ad4a0', '#ffd062'],
      'Warhol TOTAL': ['#df86d9', '#f78154', '#74deb9', '#7ee8fa', '#a8a2d8', '#b49def', '#8ad4a0', '#ffd062'],
      'Warhol FLIPPED': ['#f4b2ea', '#f78154', '#74deb9', '#7ee8fa', '#b088c8', '#9a5cc8', '#8ad4a0', '#ffd062'],
      'Marilyn': ['#ff4fa0', '#ff8a1f', '#2fb8a8', '#3a7fd0', '#8f9e80', '#8a4fc0', '#9ccf3a', '#ffe15e'],
      'Marilyn TOTAL': ['#ff4fa0', '#ff8a1f', '#2fb8a8', '#3a7fd0', '#8f9e80', '#8a4fc0', '#9ccf3a', '#ffe15e'],
      'Tomato Soup': ['#e86a8a', '#e8642a', '#4aa8a0', '#2a4fa8', '#a09888', '#8a5a98', '#6aa06a', '#e8b84a'],
      'Water Lilies Vivid': ['#d966c8', '#d09b66', '#74c4b9', '#5b6fd4', '#8c96cc', '#b49def', '#5b9c6d', '#e8c05e'],
      'Water Lilies TOTAL': ['#d966c8', '#d09b66', '#74c4b9', '#5b6fd4', '#8c96cc', '#b49def', '#5b9c6d', '#e8c05e'],
      'Pond FLIPPED': ['#ff8ad8', '#e0a866', '#74c4b9', '#7c8ff0', '#8c96cc', '#b49def', '#6ab87e', '#e8c05e'],
      'Lilac & Olive': ['#c88ab8', '#c89a6a', '#6aa898', '#6a7ac8', '#9a94b8', '#8a6ac8', '#5b764d', '#d8c06a'],
      'Tapestry TOTAL': ['#c46a86', '#c07a4e', '#4a7a5e', '#6b7fa8', '#8a92a8', '#8a5a78', '#5e8a6a', '#d9a441'],
      'Springfield TOTAL': ['#c86aa8', '#ff9a4a', '#4aa0c8', '#4a6ad0', '#7a86b8', '#8a5ac8', '#5aa8a0', '#ffd23d'],
      'Sage Monastery': ['#c4849a', '#c9985e', '#5da892', '#6a94ac', '#8aa08c', '#9686b4', '#6aa876', '#c9ac5e'],
      'Lavender Lamplight': ['#c87a9a', '#cfa070', '#5aa8a0', '#7a8ac8', '#9090b8', '#a878b8', '#6aa08a', '#d0b166'],
      'Blush FLIPPED': ['#b80f60', '#ff7a2a', '#1a8a94', '#2a6ac0', '#a83e78', '#6a3ac0', '#1f9a68', '#ffc41f'],
    };
    const CLSORDER = ['pink', 'orange', 'teal', 'blue', 'slate', 'purple', 'green', 'yellow'];
    const CLASS = { '#ff4fa0': 'pink', '#ff5fa0': 'pink', '#ff6bb8': 'pink', '#ff8a3a': 'orange', '#2ab8c4': 'teal', '#36b3f0': 'blue', '#4aa8e8': 'blue', '#3fa0d8': 'blue', '#7f9bc4': 'slate', '#b07aff': 'purple', '#8a5cf0': 'purple', '#34d39a': 'green', '#ffc83d': 'yellow', '#ffc41f': 'yellow' };
    const FAVS = [[50,0,0,0],[0,0,0,0],[1,2,3,0],[2,2,0,0],[8,0,0,0],[9,0,0,0],[9,1,5,0],[12,0,0,0],[13,0,0,0],[15,1,0,0],[17,0,3,0],[18,2,3,0],[21,2,3,0],[21,0,3,0],[22,0,4,3],[23,0,3,0],[23,2,3,0],[24,0,3,0],[25,0,4,0],[29,0,2,0],[30,0,0,0],[31,0,0,0],[31,0,3,0],[31,0,3,3],[32,2,4,0],[33,0,3,0],[35,0,3,0],[37,0,0,0],[38,0,1,0],[39,0,1,0],[39,0,4,0],[40,1,4,0],[41,0,0,0],[41,0,3,0],[42,2,3,0],[43,2,0,0],[44,0,4,0],[46,0,0,0],[46,0,0,1],[46,0,3,1],[46,0,1,1],[48,0,0,0],[50,1,3,0],[50,0,3,0],[51,0,3,0],[51,0,4,3],[52,0,3,1],[52,0,3,3],[53,0,3,0],[54,0,4,3],[55,2,4,3],[56,0,0,1],[57,2,1,3],[57,1,4,1],[59,0,2,3]];
    const SUGG = [
      { n: 'Morning Stack', i: 'ti-sunrise', c: '#ff8a3a' },
      { n: 'Before Deep Work', i: 'ti-target', c: '#36b3f0' },
      { n: 'Shake Off Sleep', i: 'ti-bolt', c: '#34d39a' },
    ];
    const FOLDERS = [
      { n: 'Stacks', i: 'ti-stack-2', c: '#ff4fa0' }, { n: 'Breathe', i: 'ti-lungs', c: '#2ab8c4' }, { n: 'Meditate', i: 'ti-moon', c: '#36b3f0' },
      { n: 'Body', i: 'ti-body-scan', c: '#7f9bc4' }, { n: 'Heart', i: 'ti-heart', c: '#ff5fa0' }, { n: 'Vision', i: 'ti-eye', c: '#b07aff' },
      { n: 'Catch', i: 'ti-hand-stop', c: '#34d39a' }, { n: 'Reset', i: 'ti-wind', c: '#2ab8c4' }, { n: 'Recover', i: 'ti-heart-handshake', c: '#ff5fa0' },
      { n: 'Begin', i: 'ti-target', c: '#36b3f0' }, { n: 'Night', i: 'ti-zzz', c: '#b07aff' }, { n: 'Wins', i: 'ti-trophy', c: '#ffc83d' },
    ];
    const ROW1 = [
      { n: 'Morning Stack', c: '#ff8a3a', i: 'ti-sunrise', s1: '#2ab8c4', s2: '#ff5fa0' },
      { n: 'Breathe', c: '#2ab8c4', i: 'ti-lungs', s1: '#ff8a3a', s2: '#8a5cf0' },
      { n: 'Meditate', c: '#4aa8e8', i: 'ti-moon', s1: '#ff8a3a', s2: '#ff5fa0' },
      { n: 'Night Stack', c: '#3fa0d8', i: 'ti-moon-stars', s1: '#ff5fa0', s2: '#2ab8c4' },
    ];
    const ITN = ['as saved', 'one-coin world', 'hush', 'candy pop', 'tritone', 'moonlit', 'quad bloom', 'afterglow'];
    const ITD = [
      'exactly what you favorited',
      'every coin wears the disc color — the calmest possible grid',
      'the ground drinks a little of the accent; coins soften a step',
      'coins sharpen, the surface warms toward the accent',
      'three hues from this palette take turns — accent, counter, bridge',
      'the ground deepens into dusk; coin brightness evens out',
      'four hues fanned around this accent — a tetrad tuned to its ground',
      'the ground melts into the accent at the horizon; coins glow brighter',
    ];
    const build = (fav, it, cm, bm, defOverride, am) => {
      const d = defOverride || DEFS[fav[0]];
      const st = { arr: fav[1], coins: fav[2], grad: fav[3] };
      const e = { ...d };
      if (st.arr === 1) {
        const [ha, , la] = h2h(d.accent); const [hg, sg] = h2h(d.ground);
        const inkL = h2h(d.ink)[2];
        const darkInk = inkL < 0.5 ? d.ink : hsl2hex(ha, 0.5, 0.13);
        e.ground = d.accent; e.wash = null;
        e.surface = lum(d.accent, la > 0.5 ? -0.07 : 0.07);
        e.accent = hsl2hex(hg, Math.max(sg, 0.55), 0.66);
        e.ink = la > 0.6 ? darkInk : hsl2hex(hg, 0.45, 0.93);
        e.onAccent = darkInk;
      } else if (st.arr === 2) {
        e.ground = lum(d.ground, -0.1, 0.08); e.surface = lum(d.surface, -0.1, 0.08); e.wash = null;
      }
      const autoSec = () => {
        const [ha] = h2h(d.accent), [hg] = h2h(d.ground);
        const mk = (h, l, s) => hsl2hex(((h % 360) + 360) % 360, s || 0.6, l);
        return [mk(ha, 0.62), mk(ha + 40, 0.6), mk(hg + 180, 0.56), mk(hg + 210, 0.56), mk(hg, 0.55, 0.28), mk(ha - 45, 0.58), mk(hg + 140, 0.52), mk(ha + 75, 0.64)];
      };
      if (st.coins === 1 || st.coins === 2) {
        const sec = SEC[d.name] || autoSec();
        const rot = st.coins === 2 ? 3 : 0;
        e.remap = {}; CLSORDER.forEach((k, i) => { e.remap[k] = sec[(i + rot) % sec.length]; });
        e.mono = null;
      }
      else if (st.coins === 3) { e.remap = null; e.mono = [h2h(d.accent)[0], 0.55]; }
      else if (st.coins === 4) { e.remap = null; e.mono = [h2h(e.ground)[0], 0.5]; }
      else if (st.coins === 5) { e.remap = null; e.mono = null; }
      const A0 = e.accent;
      if (it === 2) { e.ground = blend(A0, e.ground, 0.10); e.surface = blend(A0, e.surface, 0.08); e.wash = null; }
      else if (it === 3) { e.surface = blend(A0, e.surface, 0.16); }
      else if (it === 4) {
        const [hg] = h2h(e.ground), [ha, sa] = h2h(A0);
        const tri = [A0, hsl2hex((hg + 180) % 360, 0.5, 0.6), hsl2hex((ha + 120) % 360, Math.max(0.42, sa * 0.8), 0.58)];
        e.remap = {}; CLSORDER.forEach((k, i) => { e.remap[k] = tri[i % 3]; });
        e.mono = null;
      }
      else if (it === 5) { e.ground = lum(e.ground, -0.12, 0.08); e.surface = lum(e.surface, -0.12, 0.08); e.wash = null; }
      else if (it === 6) {
        const [ha, sa] = h2h(A0), [, , lg] = h2h(e.ground);
        const L = lg > 0.5 ? 0.58 : 0.64, S = Math.max(0.48, Math.min(0.72, sa));
        const quad = [A0, hsl2hex((ha + 90) % 360, S, L), hsl2hex((ha + 180) % 360, S, L), hsl2hex((ha + 270) % 360, S, L)];
        e.remap = {}; CLSORDER.forEach((k, i) => { e.remap[k] = quad[i % 4]; });
        e.mono = null;
        e.surface = blend(A0, e.surface, 0.10);
      }
      else if (it === 7) {
        e.forceBg = `linear-gradient(180deg, ${lum(e.ground, 0.05)} 0%, ${e.ground} 40%, ${blend(A0, e.ground, 0.30)} 100%)`;
        e.accent = lum(e.accent, 0.03, 0.05);
      }
      if (cm) {
        const [ha, sa] = h2h(A0), [hg] = h2h(e.ground);
        e.mono = null; e.remap = null;
        const set = arr => { e.remap = {}; CLSORDER.forEach((k, i) => { e.remap[k] = arr[i % arr.length]; }); };
        if (cm === 1) set([A0]);
        else if (cm === 2) set([A0, hsl2hex((ha + 35) % 360, Math.max(0.45, sa * 0.85), 0.62)]);
        else if (cm === 3) set([A0, hsl2hex((hg + 180) % 360, 0.42, 0.62), hsl2hex((ha + 335) % 360, 0.4, 0.66)]);
        else if (cm === 4) { const sec = SEC[d.name] || autoSec(); set(sec); }
        else if (cm === 5) e.mono = [hg, 0.45];
        else if (cm === 6) e.mono = [ha, 0.2];
      }
      if (bm) {
        if (bm === 5) { e.ground = lum(e.ground, -0.12, 0.06); e.surface = lum(e.surface, -0.12, 0.06); e.wash = null; e.forceBg = null; }
        else if (bm === 6) { e.ground = lum(e.ground, 0.07, -0.04); e.surface = lum(e.surface, 0.07, -0.04); e.wash = null; e.forceBg = null; }
        else if (bm === 7) { e.ground = blend(A0, e.ground, 0.10); e.surface = blend(A0, e.surface, 0.08); e.wash = null; e.forceBg = null; }
        else if (bm === 1) e.forceBg = e.ground;
        else if (bm === 2) e.forceBg = `linear-gradient(180deg, ${lum(e.ground, 0.05)} 0%, ${e.ground} 52%, ${lum(e.ground, -0.06)} 100%)`;
        else if (bm === 3) e.forceBg = `radial-gradient(130% 90% at 50% 0%, ${lum(e.ground, 0.08)} 0%, ${e.ground} 62%)`;
        else if (bm === 4) e.forceBg = `linear-gradient(180deg, ${e.ground} 0%, ${e.ground} 45%, ${blend(A0, e.ground, 0.24)} 100%)`;
      }
      const baseM = c => {
        if (e.remap) { const k = CLASS[c]; if (k && e.remap[k]) return e.remap[k]; }
        if (!e.mono) return c;
        const [, , l] = h2h(c);
        return hsl2hex(e.mono[0], e.mono[1], Math.max(0.42, Math.min(0.78, l)));
      };
      const M = c => {
        if (it === 1 && !cm) return A0;
        let out = baseM(c);
        if (it === 2) out = lum(out, 0.04, -0.16);
        else if (it === 3) out = lum(out, 0, 0.14);
        else if (it === 5) { const [h, s] = h2h(out); out = hsl2hex(h, Math.min(s, 0.6), 0.6); }
        else if (it === 7) out = lum(out, 0.05, 0.06);
        return out;
      };
      const ink = e.ink;
      const mix = (a, pa, b) => `color-mix(in srgb, ${a} ${pa}%, ${b})`;
      const bg = e.forceBg ? e.forceBg : st.grad === 1 ? `linear-gradient(180deg, ${lum(e.ground, 0.05)} 0%, ${e.ground} 52%, ${lum(e.ground, -0.06)} 100%)`
        : st.grad === 2 ? `radial-gradient(130% 90% at 50% 0%, ${lum(e.ground, 0.08)} 0%, ${e.ground} 62%)`
        : st.grad === 3 ? `linear-gradient(180deg, ${e.ground} 0%, ${e.ground} 45%, ${mix(e.accent, 24, e.ground)} 100%)`
        : (e.wash || e.ground);
      const inkSoft = mix(ink, 62, e.ground);
      const inkFaint = mix(ink, 30, e.ground);
      const cardOff = mix(ink, 14, 'transparent');
      const lip = (c, dpx) => {
        switch (shadowMode) {
          case 'Soft two-part (Round C preview)': return `0 3px 8px ${mix(ink, 30, 'transparent')}, 0 1px 2px ${mix(ink, 22, 'transparent')}`;
          case 'Soft, light': return `0 3px 8px ${mix(ink, 16, 'transparent')}, 0 1px 2px ${mix(ink, 10, 'transparent')}`;
          case 'Soft, barely there': return `0 2px 5px ${mix(ink, 9, 'transparent')}`;
          case 'Hard lip, lighter': return `0 ${dpx}px 0 ${mix(c, 62, ink)}`;
          case 'Hard lip, hue-tinted': return `0 ${dpx}px 0 ${mix(c, 55, e.ground)}`;
          case 'No shadow': return 'none';
          default: return `0 ${dpx}px 0 ${mix(c, 38, ink)}`;
        }
      };
      const glyph = () => inkGlyphs ? ink : '#fff2f9';
      const label = c => mix(c, 55, ink);
      const coin = (t, dpx) => { const c = M(t.c); return { ...t, c, lip: lip(c, dpx), label: label(c), glyph: glyph() }; };
      const sh = (c, dl) => it === 1 ? lum(A0, dl) : M(c);
      if (am) {
        const secA = SEC[d.name] || autoSec();
        e.accent = secA[(am - 1) % secA.length];
        e.onAccent = h2h(e.accent)[2] > 0.55 ? 'ink' : 'white';
      }
      return {
        name: d.name, kind: d.kind,
        bg,
        ink, inkSoft, surface: e.surface, accent: e.accent,
        onAccent: e.onAccent === 'ink' ? ink : (e.onAccent === 'white' ? '#fff2f9' : e.onAccent),
        discRing: mix(e.accent, 9, 'transparent'),
        discBloom: mix(e.accent, 16, 'transparent'),
        puckLip: lip(e.accent, 5),
        cardOff,
        plannerBg: M('#8a5cf0'),
        gold: mix('#ffc41f', 55, ink),
        leafIc: mix('#34d39a', 55, ink), leafBd: mix('#34d39a', 40, 'transparent'), leafBg: mix('#34d39a', 10, 'transparent'),
        legend: [{ k: 'GROUND', c: e.ground }, { k: 'SURFACE', c: e.surface }, { k: 'INK', c: e.ink }, { k: 'ACCENT', c: e.accent }],
        bars: [M('#36b3f0'), M('#ffc41f'), M('#ff4fa0'), e.surface, e.surface],
        streakIcons: [
          { i: 'ti-run', c: label(M('#ff8a3a')) }, { i: 'ti-coffee', c: label(M('#ffc41f')) }, { i: 'ti-code', c: label(M('#ff5fa0')) },
          { i: 'ti-book', c: inkFaint }, { i: 'ti-walk', c: inkFaint },
        ],
        row1: ROW1.map(t => ({ ...coin(t, 4), s1: sh(t.s1, 0.1), s2: sh(t.s2, -0.1) })),
        sugg: SUGG.map(t => ({ ...coin(t, 5), sh1: sh('#ff5fa0', 0.1), sh2: sh('#2ab8c4', -0.1) })),
        folders: FOLDERS.map(t => coin(t, 5)),
      };
    };
    
  return { build, FAVS, ITN, DEFS, SEC, CLSORDER, blend, lum, h2h, hsl2hex };
}
