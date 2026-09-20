#!/usr/bin/env node
// bed-loudness — measure every background bed's PERCEIVED loudness and print the gain each one needs
// so they all land at ONE level under the voice. David on device 2026-09-20: "all the backdrop sounds
// are too loud compared to everything else... actually the nature ones are super loud while brown noise
// and the binaural ones are quiet."
//
// WHY NOT PLAIN RMS — and why not LUFS either. Both say the OPPOSITE of his ear on this file set:
//   flat RMS     birds -40.6 dB   ·  gamma33  -8.0 dB    (he hears birds LOUD, gamma33 quiet)
//   K-weighted   birds -38.8 LKFS ·  gamma33  -9.3 LKFS  (same inversion)
// The reason is in the spectra: the three binaural beds are PURE TONES (deep4 ~300 Hz, focus13/gamma33
// ~200 Hz; every other octave band is 40+ dB down), and a pure tone excites ONE critical band while
// broadband nature noise excites twenty. Equal energy, nothing like equal loudness. Neither RMS nor
// K-weighting models bandwidth at all, so the measure here is a Zwicker-style CRITICAL-BAND SUMMATION:
// K-weight the spectrum (the ear's frequency response), split it into Bark bands, raise each band to
// the 0.25 compression exponent, and sum. That is the number that agrees with what David reported.
// Flat RMS and LKFS are still printed beside it so the three are never confused again.
//
// No ffmpeg in this repo and no pure-JS m4a decoder in node_modules, so decoding goes through macOS's
// own `afconvert` (built in) into 48 kHz 16-bit PCM — 48 k because the published BS.1770 K-weighting
// coefficients are specified there.
//
// The TARGET is the brown-noise bed + 3 dB (David's own quiet reference), gains clamped to [0.25, 2.0].
//
//   node _dev/bed-loudness.js            # the table
//   node _dev/bed-loudness.js --json     # BED_GAIN object ready to paste into @SEC:AUDIO
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');

const BG_DIR = path.join(__dirname, '..', 'assets', 'bg');
const VOICE_DIR = path.join(__dirname, '..', 'assets', 'voice');
const SR = 48000, N = 8192;
const TARGET_OVER_FLOOR_DB = 3, FLOOR_KEY = 'brownnoise', CLAMP = [0.25, 2.0];

// ---- decode -------------------------------------------------------------------------------------
function decode(file) { // -> mono Float32 @48k
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bedl-')), tmp = path.join(dir, 'a.wav');
  execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@48000', file, tmp], { stdio: 'ignore' });
  const buf = fs.readFileSync(tmp);
  fs.unlinkSync(tmp); fs.rmdirSync(dir);
  let off = 12, dataOff = 44, dataLen = buf.length - 44, ch = 1;
  while (off + 8 <= buf.length) { // walk the RIFF chunks rather than assuming a 44-byte header
    const id = buf.toString('ascii', off, off + 4), sz = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') ch = buf.readUInt16LE(off + 10);
    if (id === 'data') { dataOff = off + 8; dataLen = Math.min(sz, buf.length - dataOff); break; }
    off += 8 + sz + (sz & 1);
  }
  const frames = Math.floor(dataLen / 2 / ch), out = new Float32Array(frames);
  for (let f = 0; f < frames; f++) { let s = 0; for (let c = 0; c < ch; c++) s += buf.readInt16LE(dataOff + (f * ch + c) * 2) / 32768; out[f] = s / ch; }
  return out;
}

// ---- flat RMS + BS.1770-4 K-weighted loudness (printed for comparison) --------------------------
const S1 = { b: [1.53512485958697, -2.69169618940638, 1.19839281085285], a: [1, -1.69065929318241, 0.73248077421585] };
const S2 = { b: [1.0, -2.0, 1.0], a: [1, -1.99004745483398, 0.99007225036621] };
function biquad(x, c) {
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = c.b[0] * x[i] + c.b[1] * x1 + c.b[2] * x2 - c.a[1] * y1 - c.a[2] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
}
const msDb = x => { let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i]; return 10 * Math.log10(Math.max(s / Math.max(1, x.length), 1e-18)); };

// ---- radix-2 FFT --------------------------------------------------------------------------------
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      } }
  }
}
function welch(x) { // averaged power spectrum, hann window, 50% overlap, over the WHOLE file
  const p = new Float64Array(N / 2), hop = N / 2; let frames = 0;
  for (let st = 0; st + N <= x.length; st += hop) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = x[st + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)));
    fft(re, im);
    for (let k = 0; k < N / 2; k++) p[k] += (re[k] * re[k] + im[k] * im[k]);
    frames++;
  }
  const norm = Math.max(1, frames) * N * N * 0.375; // 0.375 = hann power correction
  for (let k = 0; k < N / 2; k++) p[k] /= norm;
  return p;
}
// K-weighting magnitude^2 at a frequency, straight from the two biquads' transfer functions
function kGain2(f) {
  const w = 2 * Math.PI * f / SR;
  function h2(c) {
    const cr = Math.cos(w), ci = -Math.sin(w), c2r = Math.cos(2 * w), c2i = -Math.sin(2 * w);
    const nr = c.b[0] + c.b[1] * cr + c.b[2] * c2r, ni = c.b[1] * ci + c.b[2] * c2i;
    const dr = c.a[0] + c.a[1] * cr + c.a[2] * c2r, di = c.a[1] * ci + c.a[2] * c2i;
    return (nr * nr + ni * ni) / Math.max(dr * dr + di * di, 1e-30);
  }
  return h2(S1) * h2(S2);
}
const BARK = [0, 100, 200, 300, 400, 510, 630, 770, 920, 1080, 1270, 1480, 1720, 2000, 2320, 2700, 3150, 3700, 4400, 5300, 6400, 7700, 9500, 12000, 15500, 20000];
const EXP = 0.25; // Stevens/Zwicker compression: specific loudness ~ E^0.25 per critical band
function measure(file) {
  const x = decode(file);
  const p = welch(x); let Nsum = 0;
  for (let b = 0; b < BARK.length - 1; b++) {
    let e = 0;
    const k0 = Math.max(1, Math.round(BARK[b] * N / SR)), k1 = Math.min(N / 2, Math.round(BARK[b + 1] * N / SR));
    for (let k = k0; k < k1; k++) e += p[k] * kGain2(k * SR / N);
    Nsum += Math.pow(Math.max(e, 1e-20), EXP);
  }
  // PERCEIVED is put in the dB domain deliberately: specific loudness goes as E^EXP and E as g^2, so
  // 20/(2*EXP) * log10(Nsum) moves by exactly 20*log10(g) when the bed is played at gain g. That is what
  // lets the gain below be solved in one line instead of iterated.
  return { rms: msDb(x), lk: -0.691 + msDb(biquad(biquad(x, S1), S2)), per: (20 / (2 * EXP)) * Math.log10(Math.max(Nsum, 1e-20)), secs: x.length / SR };
}

// ---- table --------------------------------------------------------------------------------------
const beds = fs.readdirSync(BG_DIR).filter(f => f.endsWith('.m4a')).map(f => f.replace(/\.m4a$/, '')).sort();
const rows = beds.map(k => ({ k, ...measure(path.join(BG_DIR, k + '.m4a')) }));
const floor = rows.find(r => r.k === FLOOR_KEY);
if (!floor) throw new Error('no ' + FLOOR_KEY + ' bed to anchor the target on');
const target = floor.per + TARGET_OVER_FLOOR_DB;
const clamp = g => Math.min(CLAMP[1], Math.max(CLAMP[0], g));
rows.forEach(r => { r.gain = Math.round(clamp(Math.pow(10, (target - r.per) / 20)) * 100) / 100; r.after = r.per + 20 * Math.log10(r.gain); });

const clips = fs.existsSync(VOICE_DIR) ? fs.readdirSync(VOICE_DIR).filter(f => /\.(mp3|m4a)$/.test(f)).sort() : [];
const picks = [clips[0], clips[Math.floor(clips.length / 2)], clips[clips.length - 1]].filter(Boolean);
const voice = picks.map(f => ({ f, ...measure(path.join(VOICE_DIR, f)) }));
const voicePer = voice.length ? voice.reduce((a, v) => a + v.per, 0) / voice.length : null;

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows.reduce((o, r) => (o[r.k] = r.gain, o), {})));
} else {
  console.log('bed'.padEnd(13) + 'secs'.padStart(6) + 'flatRMS'.padStart(10) + 'LKFS'.padStart(9) + 'PERCEIVED'.padStart(11) + 'gain'.padStart(7) + 'after'.padStart(10));
  rows.forEach(r => console.log(r.k.padEnd(13) + r.secs.toFixed(0).padStart(6) + r.rms.toFixed(1).padStart(10) + r.lk.toFixed(1).padStart(9) + r.per.toFixed(2).padStart(11) + r.gain.toFixed(2).padStart(7) + r.after.toFixed(2).padStart(10)));
  console.log('\ntarget  ' + target.toFixed(2) + '  (' + FLOOR_KEY + ' ' + floor.per.toFixed(2) + ' + ' + TARGET_OVER_FLOOR_DB + ' dB)   [PERCEIVED = critical-band loudness, dB domain]');
  voice.forEach(v => console.log('voice   ' + v.f.padEnd(16) + v.per.toFixed(2)));
  if (voicePer != null) console.log('voice mean ' + voicePer.toFixed(2) + '  ·  bed target sits ' + (voicePer - target).toFixed(1) + ' dB under the voice');
}
