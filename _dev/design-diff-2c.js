/* DESIGN DIFF — HOME 2c (born 2026-08-14, David: "why don't you know? fix it so I don't have to tell you").
   THE FULL-SURFACE MACHINE DIFF: dumps a canonical JSON of every mapped element's computed paint + geometry from
   (a) the RUNNING design prototype (_design-sync/home-2026-08-14/design_handoff_home_screen/Home Screen.dc.html, frame 2c)
   (b) the live app's 2c home (idle face, parked).
   Diffing the two dumps replaces eyeballing: any drift on ANY mapped element surfaces as a line, whether or not a
   designAudit gate exists for it yet. Per-element gates still ship for the LOCKED numbers; this net catches the unnamed.

   USE (from the session's browser orchestrator, LAW 8 companion):
     1. In the PROTOTYPE tab:  paste this file, then run  __dd.dump("proto")
     2. In the APP tab (parked at home, idle face): paste, run  __dd.dump("app")
     3. Diff the two JSON objects key-by-key (orchestrator-side; tolerance ±1px geometry, exact for colors/radii).
   Elements whose app/proto structure differs legitimately are commented at their map row. Extend the MAP when the
   surface grows — an unmapped element is an unwatched element.

   THE FROZEN-CASCADE TRAP (learned the hard way, same day): the preview freezes animations while the pane is hidden,
   so a cascade-target element can report its keyframe's `from` transform (e.g. the prototype's shelf rows frozen at
   translateY(22px) scale(0.9), opacity 0) as if it were the design. A reading is AUTHORED only if the node carries
   layout + transform WITHOUT opacity/animation/transition resets; anything carrying those is a cascade state — read
   its authored value from the markup, or reveal the cascade first. The dump includes transform/translate/scale so the
   differ can apply this test; never treat a transformed+opacity-0 node's rect as design truth. */
(function () {
  var PROPS = ["fontSize", "fontWeight", "letterSpacing", "color", "backgroundColor", "borderRadius",
    "borderTopWidth", "boxShadow", "paddingTop", "paddingLeft", "paddingBottom", "paddingRight"];
  function grab(n, geom) {
    if (!n) return null;
    var cs = getComputedStyle(n), o = {};
    PROPS.forEach(function (p) { o[p] = cs[p]; });
    if (geom !== false) { var r = n.getBoundingClientRect(); o.w = +r.width.toFixed(1); o.h = +r.height.toFixed(1); o.top = +r.top.toFixed(1); o.left = +r.left.toFixed(1); o.cx = +((r.left + r.right) / 2).toFixed(1); } // POSITIONS TOO (2026-08-14 round 4, David: "the position of the buttons is off"): sizes alone missed the head zone riding ~25pt low — the frame is a 402x874 device drawing its own status bar, so the diff must run with the app AT 402x874 and compare rect.top/cx 1:1
    o.transform = cs.transform; o.translate = cs.translate; o.scale = cs.scale;
    return o;
  }
  function hud(root) { return [].slice.call(root.querySelectorAll("div")).filter(function (d) { return d.style.zIndex === "26"; })[0]; }
  var MAPS = {
    app: function () {
      var g = function (id) { return document.getElementById(id); };
      var grid = g("tbxGridTop"), bento = document.querySelector(".tbx-bento");
      return {
        hudLeft: g("tfHudSpark"), hudLeftIcon: g("tfHudSpark") && g("tfHudSpark").querySelector("i"),
        hudLeaf: g("tfHudGarden"), hudGems: g("tfHudGems"),
        stripBar: document.querySelector("#tfHomeBars .tf-hb-bar"), stripIcon: document.querySelector("#tfHomeBars .tf-hb i"),
        date: g("tfDateKick"), stone: g("tfRing"), stoneGlyph: document.querySelector("#tfTile i"),
        title: g("tfTitle"), sub: g("tfVerdict"),
        plannerWrap: document.querySelector(".tbx-planwrap"), planner: document.querySelector(".tbx-plan"),
        deckRow: g("tfHeroRow"), deckFace: document.querySelector(".tfh-tile .tfh-face") || document.querySelector(".tfh-tile span"),
        deckLabel: document.querySelector(".tfh-tile .tfh-name") || document.querySelector(".tfh-tile > span:last-child"),
        toolsHint: g("tfToolsHint"),
        gridFace: grid && grid.querySelector(".tbx-face"), gridGlyph: grid && grid.querySelector(".tbx-face i"),
        gridLabel: grid && grid.querySelector(".tbx-label"),
        heroCard: document.querySelector(".tbx-hero"), caption: document.querySelector(".tbx-intro"),
        folderBox: bento && bento.children[0], folderChip: bento && bento.querySelector(".tbx-sq-mini"),
        folderLabel: bento && bento.children[0] && bento.children[0].querySelector(".tbx-sq-name, span:last-child"),
        puck: g("guardPuck")
      };
    },
    proto: function () {
      var s = document.querySelector('[data-screen-label^="2c"]'); if (!s) return {};
      var sc = s.firstElementChild, H = hud(s);
      var q = function (x) { return sc.querySelector(x); };
      var row1 = q('[data-anchor="row1"]'), row2 = q('[data-anchor="row2"]'), fold = q('[data-anchor="folders"]');
      var hudBtns = H ? [].slice.call(H.querySelectorAll("button")) : [];
      return {
        hudLeft: hudBtns[0], hudLeftIcon: hudBtns[0] && hudBtns[0].querySelector("i"),
        hudLeaf: hudBtns[hudBtns.length - 1], hudGems: H && [].slice.call(H.children).pop(),
        stripBar: q('[data-hc="1"] span'), stripIcon: q('[data-hc="1"] i.ti-run') || q('[data-hc="1"] div:last-child i'),
        date: q('[data-hc="2"]'), stone: q('[data-hc="3"] button'), stoneGlyph: q('[data-hc="3"] button i'),
        title: q('[data-hc="4"]'), sub: q('[data-hc="5"]'),
        plannerWrap: q('[data-hc="6"]').parentElement, planner: q('[data-hc="6"]'),
        deckRow: row1, deckFace: row1 && row1.querySelector("button > span"),
        deckLabel: row1 && row1.querySelector("button > span:last-child"),
        toolsHint: (function () { var d = q('[data-z="home"]'); return d && d.lastElementChild; })(),
        gridFace: row2 && row2.children[0].querySelector("span > span:last-child"), gridGlyph: row2 && row2.children[0].querySelector("i"),
        gridLabel: row2 && row2.children[0].querySelector(":scope > span:last-child"),
        heroCard: sc.querySelector('[data-casc="1"]'), caption: sc.querySelector('[data-casc="3"]'),
        folderBox: fold && fold.children[0], folderChip: fold && fold.children[0].querySelector("span > span"),
        folderLabel: fold && fold.children[0].querySelector(":scope > span:last-child"),
        puck: (function () { var b = [].slice.call(s.querySelectorAll("button")).filter(function (x) { return x.style.zIndex === "28"; }); return b[0]; })()
      };
    }
  };
  window.__dd = { dump: function (which) {
    var m = MAPS[which](), out = {};
    Object.keys(m).forEach(function (k) { out[k] = grab(m[k]); });
    return out;
  } };
})();
