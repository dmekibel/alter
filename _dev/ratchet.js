#!/usr/bin/env node
// ALTER structure ratchets (wave-1 restructure, 2026-07-05) — mechanical enforcement of the
// constitution rules that used to live only in CLAUDE.md. Run by _dev/preship.sh (step 1.5).
//   1. @SEC anchor definitions: all present, in @MAP order (the navigation contract).
//   2. innerHTML="" wipe count may never INCREASE (auto-lowers the baseline when it drops).
//   3. SCHEMA changed → a matching "MIG …→<new>" marker must exist in app.js (@SEC:STATE).
//   4. UNDECLARED CONSTANTS: a SCREAMING_SNAKE identifier read in app.js but declared nowhere
//      (app.js or index.html) is a ReferenceError waiting on a cold code path — the v1353 breath
//      crash (STORY_TOP & co., live and unnoticed for 180 versions) is why this check exists.
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
var ORDER = ["THEME", "ERRNET", "AUDIO", "TTS", "TIME", "JOURNEY-ENGINE", "LESSONS", "MOTION", "I18N-CORE", "CAROUSEL", "JOURNEY-TRAIL", "TIMELINE", "COCKPIT", "TOOLBOX2", "EDITOR", "PICKER", "TOUR", "ONBOARD", "STATE", "GAME", "RENDER", "I18N-DICT", "DEV", "BOOT"];
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

// 4. undeclared SCREAMING_SNAKE constants (the v1353 breathwork crash: eight names referenced, none defined)
var HTML = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
var GLOBAL_OK = ["NEGATIVE_INFINITY", "POSITIVE_INFINITY", "MAX_SAFE_INTEGER", "MIN_SAFE_INTEGER", "MAX_VALUE", "MIN_VALUE", "NODE_ENV"]; // genuine platform names; add here only when the name really is a browser/host global
function codeOnly(src) { // drop comments and string bodies so prose and CSS text can't look like a reference
  var out = "", i = 0, n = src.length;
  while (i < n) {
    var c = src[i];
    if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
    if (c === '"' || c === "'" || c === "`") { var q = c; i++; while (i < n) { if (src[i] === "\\") { i += 2; continue; } if (src[i] === q) { i++; break; } i++; } out += " "; continue; }
    out += c; i++;
  }
  return out;
}
var CODE = codeOnly(APP), seen = {}, cre = /(\.\s*)?\b([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)\b/g, cm, undeclared = [];
while ((cm = cre.exec(CODE))) { if (cm[1]) continue; seen[cm[2]] = 1; } // a leading dot = a property, never a free identifier
Object.keys(seen).forEach(function (nm) {
  if (GLOBAL_OK.indexOf(nm) !== -1) return;
  // the DECLARED test runs against the RAW sources on purpose: it is the permissive side of the check, so a
  // quirk of the stripper can only ever hide an offender, never invent one.
  var decl = new RegExp("(\\b(?:var|let|const|function|class)\\s+" + nm + "\\b)|(\\b" + nm + "\\s*=(?!=))|(\\b" + nm + "\\s*:)|(function\\s*\\([^)]*\\b" + nm + "\\b)");
  if (!decl.test(APP) && !decl.test(HTML) && HTML.indexOf(nm) === -1) undeclared.push(nm);
});
if (undeclared.length) fail("identifier(s) read in app.js but never declared: " + undeclared.join(", ") + ". Define them, or whitelist a genuine host global in GLOBAL_OK (_dev/ratchet.js check 4).");

if (write && !failed) fs.writeFileSync(BASE_FILE, JSON.stringify(base, null, 2) + "\n");
if (failed) process.exit(1);
console.log("✓ structure ratchets pass (anchors " + known.length + "/" + ORDER.length + " in order · wipes " + wipes + " ≤ " + base.innerHTMLWipes + " · SCHEMA " + schema + " · no undeclared constants)");
