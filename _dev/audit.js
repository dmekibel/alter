#!/usr/bin/env node
// _dev/audit.js — ALTER self-audit guard
//
// Mirrors pure logic from app.js. Run before every ship: node _dev/audit.js
// --write flag updates GUARD.json with results and last-ship tag.
// Exits 1 if any logic invariant fails (preship.sh gate).
//
// KEEP IN SYNC: when chapterMastered / _appCap / _gated logic changes in app.js,
// update the mirror functions below and update the GUARD.json invariants if gates change.

'use strict';
var fs = require('fs');
var path = require('path');

var GUARD_PATH = path.join(__dirname, 'GUARD.json');
var guard = JSON.parse(fs.readFileSync(GUARD_PATH, 'utf8'));
var WRITE = process.argv.indexOf('--write') >= 0;

// ─── DATE HELPERS (mirror app.js) ─────────────────────────────────────────────

function todayK() {
  return new Date().toISOString().slice(0, 10);
}

function keyAdd(k, n) {
  var d = new Date(k + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function lastDays(n) {
  var k = todayK(), days = [];
  for (var i = n - 1; i >= 0; i--) days.push(keyAdd(k, -i));
  return days;
}

// ─── FIXTURE INFLATION ────────────────────────────────────────────────────────
// Converts _timeSeries descriptors into actual date-keyed entries relative to today.
// The last N days get the entry so the rolling-7-day windows are always current.

function inflateFixture(personaDef) {
  var S = JSON.parse(JSON.stringify(personaDef.state));
  var ts = personaDef._timeSeries || {};
  var days7 = lastDays(7);

  // Default habits when empty (mirrors load() behavior for the habits gate)
  if (!S.habits || !S.habits.length) {
    S.habits = [
      { id: 'move', e: 'ti-run',   l: 'Move',      type: 'build', per: 0, color: '#ff8a1e' },
      { id: 'deep', e: 'ti-brain', l: 'Deep work', type: 'build', per: 0, color: '#2a9fe0' }
    ];
  }

  // Log entries: last N of the 7 days
  S.log = S.log || {};
  days7.slice(7 - (ts.loggedDaysLast7 || 0)).forEach(function(k) {
    S.log[k] = S.log[k] || [{ type: 'free', text: 'audit entry' }];
  });

  // AM bookend done: last N of the 7 days
  S.bk = S.bk || {};
  days7.slice(7 - (ts.amDoneLast7 || 0)).forEach(function(k) {
    S.bk[k] = S.bk[k] || {};
    S.bk[k].am = { done: true, virtue: 'zest' };
  });

  // PM bookend done: last N of the 7 days
  days7.slice(7 - (ts.pmDoneLast7 || 0)).forEach(function(k) {
    S.bk[k] = S.bk[k] || {};
    S.bk[k].pm = { done: true, reflect: true };
  });

  // Habit build done: last N of the 7 days (uses the first build-type habit)
  var buildH = (S.habits || []).filter(function(h) { return h.type === 'build'; })[0];
  S.habitDone = S.habitDone || {};
  if (buildH) {
    days7.slice(7 - (ts.habitBuildDoneLast7 || 0)).forEach(function(k) {
      S.habitDone[k] = S.habitDone[k] || {};
      S.habitDone[k][buildH.id] = true;
    });
  }

  return S;
}

// ─── PURE LOGIC MIRRORS (keep in sync with app.js) ───────────────────────────

var S; // injected per test by runner

function logs(k)   { return (S.log    || {})[k] || []; }
function blocks(k) { return (S.blocks || {})[k] || []; }

function _daysWith7(fn) {
  var n = 0;
  lastDays(7).forEach(function(k) { try { if (fn(k)) n++; } catch(e) {} });
  return n;
}

function _daysConsec3(fn) {
  var d = lastDays(3);
  try { return d.every(function(k) { return fn(k); }); } catch(e) { return false; }
}

function _highApp() {
  return ((S.guide || {}).appetiteState || {}).level === 'high';
}

function _gated(fn, n) {
  return _highApp() ? _daysConsec3(fn) : _daysWith7(fn) >= n;
}

function _appCap(level) {
  return level === 'high' ? 3 : level === 'medium' ? 2 : level === 'low' ? 1 : level === 'dormant' ? 0 : 2;
}

// JOURNEY has 8 entries (landmarks 0–7); chapterUnlockCheck loops 0 to 6.
var JOURNEY_LEN = 8;

function chapterMastered(n) {
  switch (n) {
    case 0: return _gated(function(k) { return logs(k).length > 0 || blocks(k).some(function(b) { return b.done; }); }, 5);
    case 1: return !!(S.profile && (S.profile.todayVirtues || []).length);
    case 2: return (S.goals || []).some(function(g) { return g.woop || (g.subtasks && g.subtasks.length); });
    case 3: return _gated(function(k) { var e = (S.bk || {})[k] || {}; return e.am && e.am.done; }, 5);
    case 4: return _gated(function(k) { var e = (S.bk || {})[k] || {}; return (e.am && e.am.done) && (e.pm && e.pm.done); }, 3);
    case 5: return (S.habits || []).some(function(h) {
      return h.type === 'build' && _gated(function(k) { return ((S.habitDone || {})[k] || {})[h.id]; }, 5);
    });
    case 6: return !!(S.course && S.course.rx && S.course.rx.fundamental && Object.keys(S.course.rx.fundamental).length);
  }
  return false;
}

function chapterUnlockCheck() {
  var floor = 0;
  for (var n = 0; n < JOURNEY_LEN - 1; n++) {
    if (chapterMastered(n)) floor = n + 1;
    else break;
  }
  return floor;
}

// ─── VALIDATORS ───────────────────────────────────────────────────────────────

function guideValid() {
  var g = S.guide || {};
  return typeof g.mode === 'string' && Array.isArray(g.unlocked) && typeof g.seedTier === 'number';
}

function habitsNonEmpty() {
  return !!(S.habits && S.habits.length);
}

function habitsValid() {
  return (S.habits || []).every(function(h) { return h.id && h.l && h.type; });
}

function appetiteNodeCap() {
  return ((S.guide || {}).appetiteState || {}).nodeCap;
}

// ─── FUNCTION MAP ─────────────────────────────────────────────────────────────

var FN = {
  chapterMastered:   chapterMastered,
  chapterUnlockCheck: chapterUnlockCheck,
  _appCap:           _appCap,
  guideValid:        guideValid,
  habitsNonEmpty:    habitsNonEmpty,
  habitsValid:       habitsValid,
  appetiteNodeCap:   appetiteNodeCap
};

// ─── RUNNER ───────────────────────────────────────────────────────────────────

var G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', GR = '\x1b[90m', B = '\x1b[1m', X = '\x1b[0m';

function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

var passed = 0, failed = 0, skipped = 0;
var currentShip = guard.meta.lastShip;

guard.invariants.forEach(function(inv) {

  if (inv.method === 'device-only') {
    skipped++;
    var tag = inv.lastDeviceConfirmed ? (GR + ' confirmed ' + inv.lastDeviceConfirmed + X) : (Y + ' [NEVER CONFIRMED ON DEVICE]' + X);
    console.log(GR + '  [device-only] ' + inv.id + X + tag);
    return;
  }

  if (inv.method === 'preview') {
    skipped++;
    console.log(GR + '  [preview    ] ' + inv.id + X);
    return;
  }

  // audit.js method — inject persona state
  if (inv.persona) {
    var personaDef = guard.personas[inv.persona];
    if (!personaDef) {
      console.log(R + '  [ERROR      ] ' + inv.id + ' — unknown persona: ' + inv.persona + X);
      failed++; inv.lastResult = 'ERROR: unknown persona ' + inv.persona; inv.lastShip = currentShip;
      return;
    }
    S = inflateFixture(personaDef);
  } else {
    S = {};
  }

  var fn = FN[inv.fn];
  if (!fn) {
    console.log(R + '  [ERROR      ] ' + inv.id + ' — unknown fn: ' + inv.fn + X);
    failed++; inv.lastResult = 'ERROR: unknown fn ' + inv.fn; inv.lastShip = currentShip;
    return;
  }

  var result;
  try {
    result = fn.apply(null, inv.args || []);
  } catch(e) {
    console.log(R + '  [ERROR      ] ' + inv.id + ' — ' + e.message + X);
    failed++; inv.lastResult = 'ERROR: ' + e.message; inv.lastShip = currentShip;
    return;
  }

  if (eq(result, inv.expect)) {
    passed++;
    console.log(G + '  [PASS       ] ' + X + inv.id);
    inv.lastResult = 'PASS';
  } else {
    failed++;
    console.log(R + '  [FAIL       ] ' + inv.id + ' — expected ' + JSON.stringify(inv.expect) + ', got ' + JSON.stringify(result) + X);
    inv.lastResult = 'FAIL: expected ' + JSON.stringify(inv.expect) + ' got ' + JSON.stringify(result);
  }
  inv.lastShip = currentShip;
});

// ─── SUMMARY ──────────────────────────────────────────────────────────────────

console.log('');
console.log(B + '──────────────────────────────────────────────────────' + X);
console.log(B + 'ALTER AUDIT  ' + currentShip + X);
if (failed === 0) {
  console.log(G + B + '  ✓ All logic invariants PASS  (' + passed + ')' + X);
} else {
  console.log(R + B + '  ✗ ' + failed + ' FAILED' + X + '   ' + G + passed + ' passed' + X);
}
console.log(GR + '  ' + skipped + ' skipped (device-only + preview — confirm on phone)' + X);

// Warn on never-confirmed device-only invariants
var neverDone = guard.invariants.filter(function(i) { return i.method === 'device-only' && !i.lastDeviceConfirmed; });
if (neverDone.length) {
  console.log('');
  console.log(Y + B + '  ⚠  ' + neverDone.length + ' device-only invariants not yet confirmed on iPhone:' + X);
  neverDone.forEach(function(i) { console.log(Y + '     · ' + i.id + X); });
}
console.log('');

// Write results back to GUARD.json
if (WRITE) {
  fs.writeFileSync(GUARD_PATH, JSON.stringify(guard, null, 2) + '\n');
  console.log(GR + '  GUARD.json updated with results.' + X + '\n');
}

process.exit(failed > 0 ? 1 : 0);
