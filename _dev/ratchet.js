#!/usr/bin/env node
// ALTER structure ratchets (wave-1 restructure, 2026-07-05) — mechanical enforcement of the
// constitution rules that used to live only in CLAUDE.md. Run by _dev/preship.sh (step 1.5).
//   1. @SEC anchor definitions: all present, in @MAP order (the navigation contract).
//   2. innerHTML="" wipe count may never INCREASE (auto-lowers the baseline when it drops).
//   3. SCHEMA changed → a matching "MIG …→<new>" marker must exist in app.js (@SEC:STATE).
// Baseline lives in _dev/ratchet-baseline.json; --write persists improvements (never regressions).
var fs = require("fs"), path = require("path");
var ROOT = path.join(__dirname, "..");
var APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
var BASE_FILE = path.join(__dirname, "ratchet-baseline.json");
var base = JSON.parse(fs.readFileSync(BASE_FILE, "utf8"));
var write = process.argv.indexOf("--write") !== -1;
var failed = false;
function fail(m) { console.error("✗ RATCHET: " + m); failed = true; }

// 1. anchor DEFINITIONS (line-start "// @SEC:NAME — …"; mid-line mentions are cross-refs, ignored)
var ORDER = ["ERRNET", "AUDIO", "TTS", "TIME", "JOURNEY-ENGINE", "LESSONS", "MOTION", "I18N-CORE", "CAROUSEL", "JOURNEY-TRAIL", "TIMELINE", "COCKPIT", "ONBOARD", "STATE", "GAME", "RENDER", "I18N-DICT", "DEV", "BOOT"];
var defs = [], re = /^\s*\/\/ @SEC:([A-Z0-9-]+) — /gm, m;
while ((m = re.exec(APP))) defs.push(m[1]);
ORDER.forEach(function (n) { if (defs.indexOf(n) === -1) fail("missing anchor definition @SEC:" + n + " (see the @MAP header)"); });
var known = defs.filter(function (n) { return ORDER.indexOf(n) !== -1; });
var expected = ORDER.filter(function (n) { return known.indexOf(n) !== -1; });
if (known.join(",") !== expected.join(",")) fail("@SEC anchors out of @MAP order:\n    file: " + known.join(" → ") + "\n    map:  " + expected.join(" → "));
defs.forEach(function (n) { if (ORDER.indexOf(n) === -1) fail("anchor @SEC:" + n + " is not listed in the @MAP header (add it there AND to ORDER in _dev/ratchet.js)"); });

// 2. innerHTML wipe ratchet (CLAUDE.md landmine #1: no new wipe-and-rebuild surfaces)
var wipes = (APP.match(/innerHTML\s*=\s*""/g) || []).length;
if (wipes > base.innerHTMLWipes) fail('innerHTML="" wipes grew: ' + base.innerHTMLWipes + " → " + wipes + ". New code must use targeted node updates, not wipe-and-rebuild.");
else if (wipes < base.innerHTMLWipes && write) base.innerHTMLWipes = wipes;

// 3. SCHEMA ↔ MIG pairing (@SEC:STATE contract)
var sm = APP.match(/SCHEMA\s*=\s*(\d+)/), schema = sm ? +sm[1] : null;
if (schema == null) fail("couldn't find SCHEMA = N in app.js (@SEC:TIME)");
else if (schema !== base.schema) {
  var mig = new RegExp("MIG[^\\n]*(?:→|->)\\s*" + schema).test(APP);
  if (!mig) fail("SCHEMA changed " + base.schema + " → " + schema + ' without a "MIG …→' + schema + '" marker in load() (@SEC:STATE).');
  else if (write) base.schema = schema;
}

if (write && !failed) fs.writeFileSync(BASE_FILE, JSON.stringify(base, null, 2) + "\n");
if (failed) process.exit(1);
console.log("✓ structure ratchets pass (anchors " + known.length + "/" + ORDER.length + " in order · wipes " + wipes + " ≤ " + base.innerHTMLWipes + " · SCHEMA " + schema + ")");
