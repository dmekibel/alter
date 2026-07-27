/* @ds-bundle: {"format":4,"namespace":"AlterDesignSystem_202b03","components":[{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Chip","sourcePath":"components/forms/Chip.jsx"},{"name":"ChoiceRow","sourcePath":"components/forms/ChoiceRow.jsx"},{"name":"ChoiceTile","sourcePath":"components/forms/ChoiceTile.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"CollectionCard","sourcePath":"components/game/CollectionCard.jsx"},{"name":"DomainBubble","sourcePath":"components/game/DomainBubble.jsx"},{"name":"FireChip","sourcePath":"components/game/FireChip.jsx"},{"name":"Icon","sourcePath":"components/game/Icon.jsx"},{"name":"ProgressBar","sourcePath":"components/game/ProgressBar.jsx"},{"name":"SparkPill","sourcePath":"components/game/SparkPill.jsx"},{"name":"TrophyRow","sourcePath":"components/game/TrophyRow.jsx"},{"name":"ActivityRow","sourcePath":"components/surfaces/ActivityRow.jsx"},{"name":"Badge","sourcePath":"components/surfaces/Badge.jsx"},{"name":"Panel","sourcePath":"components/surfaces/Panel.jsx"},{"name":"TimeBlock","sourcePath":"components/surfaces/TimeBlock.jsx"}],"sourceHashes":{"components/forms/Button.jsx":"5a4b02d9ad4e","components/forms/Chip.jsx":"79a3fef89b49","components/forms/ChoiceRow.jsx":"06f6cfd90e5b","components/forms/ChoiceTile.jsx":"6afda8eea273","components/forms/SegmentedControl.jsx":"022adfcd4fa3","components/game/CollectionCard.jsx":"605fe7914345","components/game/DomainBubble.jsx":"3c8b2e665e53","components/game/FireChip.jsx":"a0f286f27ae2","components/game/Icon.jsx":"81f04dbfb762","components/game/ProgressBar.jsx":"eb609c918267","components/game/SparkPill.jsx":"66c2fcf00dd3","components/game/TrophyRow.jsx":"cc4825e628e2","components/surfaces/ActivityRow.jsx":"cb5120cbabc3","components/surfaces/Badge.jsx":"e7c9b26ea8f1","components/surfaces/Panel.jsx":"c931546715c3","components/surfaces/TimeBlock.jsx":"34d12fde8444","ui_kits/app/Collection.jsx":"21fdcd1844a8","ui_kits/app/DayJournal.jsx":"85ae0b0a4d65","ui_kits/app/HomeNow.jsx":"7842a2c11adb","ui_kits/app/IntroSpark.jsx":"5f9f9fb9e3f5","ui_kits/app/OnboardingQuestion.jsx":"a88572d8560a","ui_kits/app/YouScreen.jsx":"2e55d9d0bc14"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AlterDesignSystem_202b03 = window.AlterDesignSystem_202b03 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter candy button — flat fill, bold ink border (#160510), hard-offset "sticker"
 * shadow that the button presses INTO. Zero white. Jost 800.
 */
function Button({
  variant = "primary",
  size = "md",
  domain,
  icon,
  iconRight,
  disabled = false,
  children,
  style,
  ...rest
}) {
  const fills = {
    primary: {
      bg: "var(--alter-pink-soft)",
      fg: "#4a1126"
    },
    go: {
      bg: "var(--alter-green)",
      fg: "#0a3a24"
    },
    focus: {
      bg: "var(--focus)",
      fg: "#0b2740"
    },
    warn: {
      bg: "var(--alter-yellow)",
      fg: "#4a3500"
    }
  };
  const sizes = {
    lg: {
      pad: "20px",
      fs: "20px",
      r: "22px"
    },
    md: {
      pad: "14px 18px",
      fs: "17px",
      r: "16px"
    },
    sm: {
      pad: "10px 14px",
      fs: "14px",
      r: "13px"
    }
  };
  const s = sizes[size] || sizes.md;

  // "bare" = secondary word-only button (no box), per the start-screen sub-actions
  if (variant === "bare") {
    return /*#__PURE__*/React.createElement("button", _extends({
      disabled: disabled,
      style: {
        background: "none",
        border: "none",
        boxShadow: "none",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: s.fs,
        color: "var(--text-dim)",
        cursor: disabled ? "default" : "pointer",
        padding: "8px 14px",
        opacity: disabled ? 0.45 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        ...style
      }
    }, rest), icon && /*#__PURE__*/React.createElement("i", {
      className: "ti " + icon
    }), children, iconRight && /*#__PURE__*/React.createElement("i", {
      className: "ti " + iconRight
    }));
  }
  const f = domain ? {
    bg: `var(--${domain})`,
    fg: "#160510"
  } : fills[variant] || fills.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    className: "alter-btn",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "9px",
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: s.fs,
      padding: s.pad,
      borderRadius: s.r,
      border: "3px solid var(--ink)",
      boxShadow: disabled ? "none" : "0 5px 0 var(--ink)",
      background: f.bg,
      color: f.fg,
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "transform .12s var(--ease-spring), box-shadow .12s var(--ease-spring)",
      WebkitTapHighlightColor: "transparent",
      ...style
    },
    onPointerDown: e => {
      if (!disabled) {
        e.currentTarget.style.transform = "translateY(3px)";
        e.currentTarget.style.boxShadow = "0 1px 0 var(--ink)";
      }
    },
    onPointerUp: e => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = disabled ? "none" : "0 5px 0 var(--ink)";
    },
    onPointerLeave: e => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = disabled ? "none" : "0 5px 0 var(--ink)";
    }
  }, rest), icon && /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon
  }), children, iconRight && /*#__PURE__*/React.createElement("i", {
    className: "ti " + iconRight
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter selectable chip / pill. Berry fill when idle, brand-pink (or domain) when selected.
 * Ink border + sticker shadow. Used all over the picker, planners, and filters.
 */
function Chip({
  selected = false,
  select = "fill",
  domain,
  icon,
  children,
  style,
  ...rest
}) {
  const onBg = domain ? `var(--${domain})` : "var(--alter-pink-soft)";
  const ring = select === "ring" && selected;
  return /*#__PURE__*/React.createElement("button", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "7px",
      fontFamily: "var(--font-display)",
      fontWeight: selected ? 800 : 700,
      fontSize: "14px",
      padding: "10px 15px",
      borderRadius: "12px",
      border: "2.5px solid var(--ink)",
      boxShadow: ring ? "0 0 0 2.5px #ff5fa8, 0 0 14px rgba(255,95,168,.38), 0 3px 0 var(--ink)" : "0 3px 0 var(--ink)",
      background: selected && !ring ? onBg : "#48122f",
      color: selected && !ring ? "#4a1126" : "var(--text)",
      cursor: "pointer",
      transition: "transform .16s var(--ease-spring), box-shadow .16s var(--ease-spring)",
      WebkitTapHighlightColor: "transparent",
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon
  }), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Chip.jsx", error: String((e && e.message) || e) }); }

// components/forms/ChoiceRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter choice row — the LOCKED "choice-row v3" grammar (onboarding, reflections, pickers).
 * Rest = dark tint + SOLID own-hue outline + bare colored icon.
 * Picked = IGNITION into its own hue's candy stripes + ink text + bare check + one-time sheen.
 * NO GOLD for selection — gold is earned only.
 */
function ChoiceRow({
  hue = "#ff5fa8",
  icon,
  label,
  sub,
  selected = false,
  style,
  ...rest
}) {
  const tint = `color-mix(in srgb, ${hue} 12%, #1a0c1e)`;
  const stripeB = `color-mix(in srgb, ${hue} 78%, #160510)`;
  const ink = "#160510";
  return /*#__PURE__*/React.createElement("button", _extends({
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 13,
      textAlign: "left",
      borderRadius: 15,
      border: `2.5px solid ${selected ? ink : hue}`,
      background: selected ? `repeating-linear-gradient(45deg, ${hue} 0 9px, ${stripeB} 9px 18px)` : tint,
      boxShadow: "0 5px 0 var(--ink)",
      padding: "15px 16px",
      cursor: "pointer",
      fontFamily: "var(--font-display)",
      position: "relative",
      overflow: "hidden",
      transform: selected ? "translateY(-2px)" : "none",
      transition: "transform .16s var(--ease-spring)",
      WebkitTapHighlightColor: "transparent",
      ...style
    },
    onPointerDown: e => {
      e.currentTarget.style.transform = "translateY(2px)";
      e.currentTarget.style.boxShadow = "0 1px 0 var(--ink)";
    },
    onPointerUp: e => {
      e.currentTarget.style.transform = selected ? "translateY(-2px)" : "";
      e.currentTarget.style.boxShadow = "0 5px 0 var(--ink)";
    },
    onPointerLeave: e => {
      e.currentTarget.style.transform = selected ? "translateY(-2px)" : "";
      e.currentTarget.style.boxShadow = "0 5px 0 var(--ink)";
    }
  }, rest), icon && /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon,
    style: {
      fontSize: 24,
      color: selected ? ink : hue,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontWeight: 800,
      fontSize: 16.5,
      lineHeight: 1.25,
      color: selected ? ink : "var(--text-bright)"
    }
  }, label), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontWeight: selected ? 700 : 600,
      fontSize: 14,
      marginTop: 2,
      color: selected ? ink : "var(--text-dim-2)",
      opacity: selected ? .78 : 1
    }
  }, sub)), selected && /*#__PURE__*/React.createElement("i", {
    className: "ti ti-check",
    style: {
      fontSize: 18,
      color: ink,
      flex: "none"
    }
  }), selected && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "-30%",
      bottom: "-30%",
      left: 0,
      width: "38%",
      background: "linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)",
      transform: "skewX(-14deg)",
      animation: "alterIgn .7s ease-out 1 forwards",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("style", null, `@keyframes alterIgn{from{transform:skewX(-14deg) translateX(-280%);}to{transform:skewX(-14deg) translateX(420%);}}`));
}
Object.assign(__ds_scope, { ChoiceRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ChoiceRow.jsx", error: String((e && e.message) || e) }); }

// components/forms/ChoiceTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter choice tile — the mood-jewel option tile (onboarding grids). Icon + label, own hue,
 * "+" chip that flips to a check when picked; picked = own-hue fill + ink + lift + sheen.
 */
function ChoiceTile({
  hue = "#ff5fa8",
  icon,
  label,
  selected = false,
  style,
  ...rest
}) {
  const ink = "#160510";
  return /*#__PURE__*/React.createElement("button", _extends({
    style: {
      flex: "1 1 40%",
      minWidth: 138,
      maxWidth: 184,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 9,
      background: selected ? hue : "#35142a",
      border: "2.5px solid var(--ink)",
      borderRadius: 17,
      boxShadow: selected ? "0 6px 0 var(--ink)" : "0 5px 0 var(--ink)",
      padding: "18px 12px 15px",
      cursor: "pointer",
      fontFamily: "var(--font-display)",
      position: "relative",
      overflow: "hidden",
      transform: selected ? "translateY(-3px)" : "none",
      transition: "transform .15s var(--ease-spring)",
      WebkitTapHighlightColor: "transparent",
      ...style
    },
    onPointerDown: e => {
      e.currentTarget.style.transform = "translateY(2px)";
      e.currentTarget.style.boxShadow = "0 1px 0 var(--ink)";
    },
    onPointerUp: e => {
      e.currentTarget.style.transform = selected ? "translateY(-3px)" : "";
      e.currentTarget.style.boxShadow = selected ? "0 6px 0 var(--ink)" : "0 5px 0 var(--ink)";
    },
    onPointerLeave: e => {
      e.currentTarget.style.transform = selected ? "translateY(-3px)" : "";
      e.currentTarget.style.boxShadow = selected ? "0 6px 0 var(--ink)" : "0 5px 0 var(--ink)";
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    className: "ti " + (icon || "ti-sparkles"),
    style: {
      fontSize: 30,
      color: selected ? ink : hue
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 16.5,
      color: selected ? ink : "var(--text-bright)",
      textAlign: "center",
      lineHeight: 1.2
    }
  }, label), selected ? /*#__PURE__*/React.createElement("i", {
    className: "ti ti-check",
    style: {
      position: "absolute",
      top: 8,
      right: 9,
      color: ink,
      fontSize: 15
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 8,
      right: 9,
      width: 22,
      height: 22,
      borderRadius: 8,
      background: "rgba(22,5,16,.6)",
      color: "var(--text-bright)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-plus"
  })), selected && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "-30%",
      bottom: "-30%",
      left: 0,
      width: "38%",
      background: "linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)",
      transform: "skewX(-14deg)",
      animation: "alterIgn .7s ease-out 1 forwards",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("style", null, `@keyframes alterIgn{from{transform:skewX(-14deg) translateX(-280%);}to{transform:skewX(-14deg) translateX(420%);}}`));
}
Object.assign(__ds_scope, { ChoiceTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ChoiceTile.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter segmented control — the D · W · M zoom toggle and similar peer switches.
 * Rounded track; the active segment is a brand-pink pill.
 */
function SegmentedControl({
  options = [],
  value,
  onChange,
  variant = "pill",
  style,
  ...rest
}) {
  if (variant === "binder") {
    // МЕТКИ/ТРОФЕИ grammar: chunky tab slabs; selected = pink candy stripes + ink text
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${options.length},1fr)`,
        gap: 12,
        ...style
      }
    }, rest), options.map(opt => {
      const val = typeof opt === "string" ? opt : opt.value;
      const label = typeof opt === "string" ? opt : opt.label;
      const on = val === value;
      return /*#__PURE__*/React.createElement("button", {
        key: val,
        onClick: () => onChange && onChange(val),
        style: {
          border: "2.5px solid var(--ink)",
          borderRadius: 15,
          padding: "14px 0",
          textAlign: "center",
          cursor: "pointer",
          boxShadow: "0 4px 0 var(--ink)",
          background: on ? "repeating-linear-gradient(115deg,#ff6fb0 0 12px,#ff8fc4 12px 24px)" : "#241328",
          color: on ? "#2a0d1c" : "var(--text-dim-2)",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: 2,
          textTransform: "uppercase",
          transition: "transform .1s",
          WebkitTapHighlightColor: "transparent"
        }
      }, label);
    }));
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "inline-flex",
      gap: "3px",
      padding: "4px",
      background: "var(--surface-0)",
      border: "2px solid var(--ink)",
      borderRadius: "14px",
      ...style
    }
  }, rest), options.map(opt => {
    const val = typeof opt === "string" ? opt : opt.value;
    const label = typeof opt === "string" ? opt : opt.label;
    const on = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      onClick: () => onChange && onChange(val),
      style: {
        minWidth: "40px",
        padding: "8px 14px",
        borderRadius: "11px",
        border: "none",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "14px",
        background: on ? "var(--alter-pink)" : "transparent",
        color: on ? "#4a1126" : "var(--text-dim)",
        cursor: "pointer",
        transition: "background .16s var(--ease-settle)",
        WebkitTapHighlightColor: "transparent"
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/game/CollectionCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter collection (binder) card — element-typed "wild pattern" finishes, CARD MOMENTS ONLY.
 * Earned = full-art pattern + colored border + icon disc + gold rank + evo pips.
 * Locked = matte aspiration (never a dimmed ghost): silhouette, next-mark line, pink progress.
 * Exact pattern CSS lifted from the app (.el-prism/.el-burst/.el-cosmos/.el-slash/.el-lattice/.el-bio).
 */
const EL = {
  prism: {
    bg: "repeating-linear-gradient(90deg,#c44a6e 0 4px,#c4884a 4px 8px,#b0b04e 8px 12px,#4eb072 12px 16px,#4a8ec4 16px 20px,#7a5ac4 20px 24px,#b04a9e 24px 28px)",
    border: "#8ac8e8"
  },
  burst: {
    bg: "repeating-conic-gradient(from 0deg at 50% 58%,#2a0e02 0deg 9deg,#7a4a10 9deg 18deg), radial-gradient(100% 90% at 50% 58%,#5a2a06 0%,#1c0500 80%)",
    border: "#ffb02e"
  },
  cosmos: {
    bg: "radial-gradient(1.5px 1.5px at 22% 18%,#fff 99%,transparent), radial-gradient(1px 1px at 68% 32%,#cfe6ff 99%,transparent), radial-gradient(1.5px 1.5px at 42% 66%,#fff 99%,transparent), radial-gradient(1px 1px at 82% 74%,#cfe6ff 99%,transparent), radial-gradient(100% 80% at 30% 20%,#1c2a7a 0%,#0e1450 45%,#04041a 100%)",
    border: "#8ac8e8"
  },
  slash: {
    bg: "repeating-linear-gradient(-55deg,#38060e 0 10px,#6e0e1e 10px 14px,#38060e 14px 26px,rgba(255,90,90,.13) 26px 28px), linear-gradient(160deg,#38060e,#1a0206 70%)",
    border: "#ff5a5a"
  },
  lattice: {
    bg: "repeating-linear-gradient(0deg,transparent 0 11px,rgba(255,210,74,.13) 11px 12px), repeating-linear-gradient(90deg,transparent 0 11px,rgba(255,210,74,.13) 11px 12px), linear-gradient(160deg,#2e2408,#171203 70%)",
    border: "#ffd24a"
  },
  bio: {
    bg: "repeating-linear-gradient(115deg,#062e1a 0 9px,#0a4a2a 9px 13px,#062e1a 13px 22px,rgba(70,226,164,.13) 22px 24px), linear-gradient(160deg,#062e1a,#02160c 70%)",
    border: "#46e2a4"
  }
};
function CollectionCard({
  element = "prism",
  icon = "ti-sparkles",
  name,
  sub,
  pips = 4,
  pipsOn = 0,
  locked = false,
  lockMsg,
  progress,
  sheen = false,
  style,
  ...rest
}) {
  const el = EL[element] || EL.prism;
  const z = {
    position: "relative",
    zIndex: 3
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "relative",
      borderRadius: 13,
      overflow: "hidden",
      textAlign: "center",
      padding: "14px 8px 12px",
      fontFamily: "var(--font-display)",
      border: locked ? "2.5px solid #3a2036" : `2.5px solid ${el.border}`,
      background: locked ? "#241328" : el.bg,
      ...style
    }
  }, rest), sheen && !locked && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 2,
      pointerEvents: "none",
      background: "linear-gradient(115deg,transparent 30%,rgba(120,255,220,.22) 42%,rgba(255,120,220,.26) 50%,rgba(120,180,255,.22) 58%,transparent 70%)",
      backgroundSize: "300% 100%",
      animation: "alterCardSheen 3.2s ease-in-out infinite"
    }
  }), /*#__PURE__*/React.createElement("style", null, `@keyframes alterCardSheen{0%{background-position:-180% 0;}55%{background-position:260% 0;}100%{background-position:260% 0;}}`), /*#__PURE__*/React.createElement("div", {
    style: {
      ...z,
      width: 52,
      height: 52,
      margin: "2px auto 6px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,.34)",
      border: `2.5px solid ${locked ? "#6a4a5c" : el.border}`,
      color: locked ? "#6a4a5c" : "#fff"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon,
    style: {
      fontSize: 24
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...z,
      color: locked ? "var(--text-dim-2)" : "var(--text)",
      fontWeight: 800,
      fontSize: 13.5
    }
  }, name), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      ...z,
      color: locked ? "#8a7898" : "#c78fbf",
      fontWeight: 800,
      fontSize: 10.5,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginTop: 1
    }
  }, sub), lockMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      ...z,
      color: "#8a7898",
      fontWeight: 600,
      fontSize: 11,
      lineHeight: 1.25,
      marginTop: 3
    }
  }, lockMsg), pips > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      ...z,
      display: "flex",
      gap: 5,
      justifyContent: "center",
      marginTop: 7
    }
  }, Array.from({
    length: pips
  }, (_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 11,
      height: 11,
      borderRadius: 3,
      border: "1.5px solid var(--ink)",
      background: i < pipsOn ? locked ? "var(--alter-pink-soft)" : "var(--alter-yellow)" : "rgba(0,0,0,.35)",
      boxShadow: i < pipsOn && !locked ? "0 0 6px rgba(255,210,74,.6)" : "none"
    }
  }))), typeof progress === "number" && /*#__PURE__*/React.createElement("div", {
    style: {
      ...z,
      height: 6,
      borderRadius: 4,
      background: "rgba(0,0,0,.4)",
      margin: "8px 10px 0",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      height: "100%",
      width: progress + "%",
      background: "var(--alter-pink-soft)",
      borderRadius: 4
    }
  })));
}
Object.assign(__ds_scope, { CollectionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/CollectionCard.jsx", error: String((e && e.message) || e) }); }

// components/game/DomainBubble.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter domain bubble — the signature circular activity node (the honeycomb/journey stone).
 * Flat domain fill, bold ink border, sticker shadow, spring press. States: default / current
 * (alive breathing glow) / done (green trophy ring) / locked (muted).
 */
function DomainBubble({
  domain = "connect",
  icon = "ti-sparkles",
  size = "md",
  state = "default",
  label,
  style,
  ...rest
}) {
  const sizes = {
    sm: 72,
    md: 96,
    lg: 120
  };
  const px = sizes[size] || sizes.md;
  const fs = Math.round(px * 0.42);
  const color = `var(--${domain})`;
  let bubble = {
    width: px,
    height: px,
    borderRadius: "50%",
    border: "3px solid var(--ink)",
    boxShadow: "0 6px 0 var(--ink)",
    background: color,
    color: "#fff",
    fontSize: fs
  };
  let extra = {};
  if (state === "done") {
    bubble = {
      ...bubble,
      border: "3px solid var(--alter-green)",
      boxShadow: "0 0 0 2.5px var(--alter-green), 0 0 14px rgba(40,207,134,.35), 0 3px 0 #0a4028"
    };
  } else if (state === "locked") {
    bubble = {
      ...bubble,
      background: "#2a1320",
      border: "3px solid #4a2238",
      color: "#6a4a5c",
      boxShadow: "0 5px 0 #2a0d1c"
    };
  } else if (state === "current") {
    extra = {
      animation: "alterBubbleAlive 2.8s var(--ease-settle) infinite"
    };
    bubble = {
      ...bubble,
      filter: `drop-shadow(0 4px 10px ${hexGlow(domain)})`
    };
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "9px",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("style", null, `@keyframes alterBubbleAlive{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-6px) scale(1.04);}}`), /*#__PURE__*/React.createElement("div", {
    className: "alter-bubble",
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "transform .12s",
      ...bubble,
      ...extra
    },
    onPointerDown: e => {
      const t = e.currentTarget;
      t.style.transform = "translateY(4px)";
      t.style.boxShadow = "0 1px 0 var(--ink)";
    },
    onPointerUp: e => {
      const t = e.currentTarget;
      t.style.transform = "";
      t.style.boxShadow = bubble.boxShadow;
    },
    onPointerLeave: e => {
      const t = e.currentTarget;
      t.style.transform = "";
      t.style.boxShadow = bubble.boxShadow;
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon,
    style: {
      filter: "drop-shadow(0 1.5px 0 rgba(0,0,0,.28))"
    }
  }), state === "done" && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -4,
      right: -4,
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: "var(--alter-green)",
      border: "3px solid var(--ink)",
      color: "#fff",
      fontSize: 15,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 8px rgba(40,207,134,.55)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-check"
  }))), label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "13.5px",
      color: state === "done" ? "#46e2a4" : state === "locked" ? "var(--text-faint)" : "var(--text-dim)",
      maxWidth: 150,
      textAlign: "center",
      lineHeight: 1.24
    }
  }, label));
}
function hexGlow(domain) {
  const m = {
    move: "rgba(255,138,58,.5)",
    nourish: "rgba(52,211,154,.5)",
    focus: "rgba(54,179,240,.5)",
    create: "rgba(176,122,255,.5)",
    connect: "rgba(255,95,160,.5)",
    play: "rgba(255,200,61,.5)",
    restore: "rgba(42,184,196,.5)",
    upkeep: "rgba(127,155,196,.5)"
  };
  return m[domain] || "rgba(255,95,160,.5)";
}
Object.assign(__ds_scope, { DomainBubble });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/DomainBubble.jsx", error: String((e && e.message) || e) }); }

// components/game/FireChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter fire chip — the streak flame with heat levels. Ember → gold glow → ICE-BLUE at 21+
 * (the hottest fire is blue). Flickers continuously.
 */
function FireChip({
  level = 1,
  value,
  style,
  ...rest
}) {
  const looks = {
    1: {
      c: "#ff8a3a",
      f: "none",
      d: "1.6s"
    },
    2: {
      c: "#ff8a3a",
      f: "none",
      d: "1.1s"
    },
    3: {
      c: "#ffb02e",
      f: "drop-shadow(0 0 6px rgba(255,150,40,.8))",
      d: ".9s"
    },
    4: {
      c: "#7ac8ff",
      f: "drop-shadow(0 0 7px rgba(120,200,255,.9))",
      d: ".8s"
    }
  };
  const k = looks[Math.max(1, Math.min(4, level))];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: 14,
      color: k.c,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    className: "ti ti-flame-filled",
    style: {
      color: k.c,
      filter: k.f,
      animation: `alterFireFlick ${k.d} infinite`
    }
  }), value, /*#__PURE__*/React.createElement("style", null, `@keyframes alterFireFlick{0%,100%{transform:scale(1) translateY(0);}30%{transform:scale(1.12,1.22) translateY(-1px);}60%{transform:scale(.94,1.05);}}`));
}
Object.assign(__ds_scope, { FireChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/FireChip.jsx", error: String((e && e.message) || e) }); }

// components/game/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter icon — thin wrapper over the Tabler icon webfont, tinted by domain or any color.
 * The app's whole icon language is Tabler (never emoji in the current direction, never hand-drawn SVG).
 */
function Icon({
  name,
  domain,
  color,
  size = 22,
  style,
  ...rest
}) {
  const c = domain ? `var(--${domain})` : color || "var(--text)";
  return /*#__PURE__*/React.createElement("i", _extends({
    className: "ti " + name,
    style: {
      fontSize: size,
      color: c,
      lineHeight: 1,
      display: "inline-block",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/Icon.jsx", error: String((e && e.message) || e) }); }

// components/game/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter progress / streak bar. Berry track with ink border; fill is the plan gradient
 * (pink→purple) or the continuous STREAK gradient (yellow→red→epic) that deepens with heat.
 */
function ProgressBar({
  value = 0,
  variant = "plan",
  height = 13,
  style,
  ...rest
}) {
  const fills = {
    plan: "linear-gradient(90deg,var(--alter-pink-soft),var(--create))",
    streak: "linear-gradient(90deg,var(--streak-lit),var(--streak-warm),var(--streak-hot),var(--streak-red),var(--streak-epic))",
    green: "linear-gradient(90deg,var(--alter-green),#7ce6b6)"
  };
  const v = Math.max(0, Math.min(100, value));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      height,
      borderRadius: "8px",
      background: "var(--surface-0)",
      border: "2px solid var(--surface-border)",
      overflow: "hidden",
      position: "relative",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: v + "%",
      borderRadius: "5px 0 0 5px",
      background: variant === "streak" ? fills.streak : fills[variant] || fills.plan,
      backgroundSize: variant === "streak" ? "260% 100%" : "auto",
      transition: "width .5s var(--ease-spring)"
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/game/SparkPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter HUD counter pill — the gem / spark / streak tokens in the top status strip.
 * Dark ink chip, gold glyph + Baloo number. Bumps when it earns.
 */
function SparkPill({
  icon = "ti-diamond-filled",
  value,
  color = "var(--alter-yellow)",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      background: "var(--ink)",
      border: "2px solid var(--surface-border-2)",
      borderRadius: "12px",
      padding: "6px 11px",
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: "14px",
      lineHeight: 1,
      color,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon,
    style: {
      fontSize: "16px",
      color
    }
  }), value);
}
Object.assign(__ds_scope, { SparkPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/SparkPill.jsx", error: String((e && e.message) || e) }); }

// components/game/TrophyRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter trophy row — gold-gradient framed achievement (quest completions).
 * Gold = EARNED only; the frame is a 3px gold gradient around a dark warm-gold inner.
 */
function TrophyRow({
  icon = "ti-trophy",
  name,
  meta,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      padding: 3,
      borderRadius: 16,
      background: "linear-gradient(120deg,#ffd24a,#c08a22)",
      boxShadow: "0 4px 0 var(--ink)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: "linear-gradient(160deg,#3a2a08,#241a04)",
      borderRadius: 13,
      padding: "13px 15px"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon,
    style: {
      fontSize: 30,
      color: "var(--alter-yellow)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: 16,
      color: "#fff4d6"
    }
  }, name), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 12.5,
      color: "#e0c98a",
      marginTop: 2
    }
  }, meta))));
}
Object.assign(__ds_scope, { TrophyRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/TrophyRow.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/ActivityRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter activity / settings row — the domain-tinted tappable tile (Profile, Sound, Data…).
 * Gradient fill in the domain color, icon coin left, title + sub, chevron right.
 */
function ActivityRow({
  domain = "connect",
  icon = "ti-user",
  title,
  sub,
  chevron = true,
  style,
  ...rest
}) {
  const c = `var(--${domain})`;
  return /*#__PURE__*/React.createElement("button", _extends({
    className: "alter-row",
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "15px 16px",
      borderRadius: "18px",
      border: "3px solid var(--ink)",
      background: `linear-gradient(120deg, color-mix(in srgb, ${c} 78%, #2a0d1c), color-mix(in srgb, ${c} 42%, #2a0d1c))`,
      boxShadow: "0 4px 0 var(--ink)",
      cursor: "pointer",
      textAlign: "left",
      transition: "transform .12s var(--ease-spring)",
      WebkitTapHighlightColor: "transparent",
      ...style
    },
    onPointerDown: e => {
      e.currentTarget.style.transform = "translateY(3px)";
      e.currentTarget.style.boxShadow = "0 1px 0 var(--ink)";
    },
    onPointerUp: e => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "0 4px 0 var(--ink)";
    },
    onPointerLeave: e => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "0 4px 0 var(--ink)";
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon,
    style: {
      fontSize: "26px",
      color: c,
      flex: "none",
      filter: "drop-shadow(0 1px 2px rgba(0,0,0,.35))"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: "18px",
      color: "var(--text-bright)",
      lineHeight: 1.1
    }
  }, title), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "13.5px",
      color: "rgba(255,240,248,.75)",
      marginTop: 3
    }
  }, sub)), chevron && /*#__PURE__*/React.createElement("i", {
    className: "ti ti-chevron-right",
    style: {
      fontSize: "20px",
      color: "rgba(255,240,248,.8)",
      flex: "none"
    }
  }));
}
Object.assign(__ds_scope, { ActivityRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/ActivityRow.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter badge / status pill — "Explorer", "NOW 2:32", "matched", "done", "Big 3".
 * Small, bold, ink-edged. The live/on-plan variants glow.
 */
function Badge({
  variant = "default",
  icon,
  children,
  style,
  ...rest
}) {
  const kinds = {
    default: {
      bg: "rgba(255,95,160,.16)",
      fg: "var(--alter-pink)",
      bd: "transparent"
    },
    live: {
      bg: "var(--alter-pink)",
      fg: "#4a1126",
      bd: "var(--ink)",
      glow: "0 0 14px rgba(255,79,160,.5)"
    },
    onplan: {
      bg: "var(--alter-yellow)",
      fg: "#4a3500",
      bd: "var(--ink)"
    },
    drift: {
      bg: "transparent",
      fg: "var(--drift-warn)",
      bd: "var(--drift-warn)",
      dashed: true
    },
    done: {
      bg: "var(--alter-green)",
      fg: "#0a3a24",
      bd: "var(--ink)"
    },
    ghost: {
      bg: "transparent",
      fg: "var(--text-dim)",
      bd: "var(--surface-border-2)"
    }
  };
  const k = kinds[variant] || kinds.default;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: "12px",
      letterSpacing: ".3px",
      padding: "4px 10px",
      borderRadius: "11px",
      background: k.bg,
      color: k.fg,
      border: `2px ${k.dashed ? "dashed" : "solid"} ${k.bd}`,
      boxShadow: k.glow || "none",
      lineHeight: 1,
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Badge.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Panel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter card / panel — the one panel skin used by every surface (sheet, bento, dialog).
 * Berry-night fill, bold ink border, hard sticker shadow. Optional domain tint.
 */
function Panel({
  domain,
  tint,
  children,
  style,
  ...rest
}) {
  const bg = domain ? `linear-gradient(135deg, color-mix(in srgb, var(--${domain}) 30%, var(--surface-2)), var(--surface-2))` : tint || "var(--surface-2)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: bg,
      border: "3px solid var(--ink)",
      borderRadius: "22px",
      boxShadow: "0 6px 0 var(--ink)",
      padding: "18px",
      color: "var(--text)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Panel.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/TimeBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alter calendar TimeBlock — the plan-vs-real bubble on the two-lane journal.
 * PLAN = hatched diagonal candy stripes (scheduled, not yet done). REAL = solid + sticker shadow
 * (it happened). NOW = live glowing block with a "NOW" tag. Gold ring = on-plan/matched.
 * BOTH keep the same bold dark outline — never a white/light one.
 */
function TimeBlock({
  domain = "focus",
  icon,
  title,
  meta,
  variant = "plan",
  matched = false,
  now,
  style,
  ...rest
}) {
  const c = `var(--${domain})`;
  const hatch = `repeating-linear-gradient(45deg, ${solid(domain, 0.9)} 0 9px, ${solid(domain, 0.62)} 9px 18px)`;
  let box = {};
  if (variant === "real" || variant === "now") {
    box = {
      background: c,
      boxShadow: "0 4px 0 var(--ink)"
    };
  } else if (variant === "ghost") {
    box = {
      background: "transparent",
      borderStyle: "dashed",
      borderColor: "var(--surface-border-2)"
    };
  } else {
    box = {
      background: hatch
    };
  }
  const ring = matched ? {
    boxShadow: "0 0 0 3px var(--alter-yellow), 0 4px 0 var(--ink)"
  } : {};
  const glow = variant === "now" ? {
    boxShadow: `0 0 22px ${solid(domain, 0.55)}, 0 0 0 3px ${solid(domain, 0.4)}, 0 4px 0 var(--ink)`
  } : {};
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "relative",
      borderRadius: "16px",
      border: "3px solid var(--ink)",
      padding: "13px 15px",
      color: variant === "ghost" ? "var(--text-dim)" : "#fff2f9",
      overflow: "visible",
      ...box,
      ...ring,
      ...glow,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "9px"
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: "ti " + icon,
    style: {
      fontSize: "18px",
      filter: "drop-shadow(0 1px 0 rgba(0,0,0,.3))"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: "17px",
      textShadow: variant === "ghost" ? "none" : "0 1px 0 rgba(10,3,8,.35)"
    }
  }, title)), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "12.5px",
      marginTop: "3px",
      opacity: .92
    }
  }, meta), now && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 10,
      bottom: -13,
      background: "var(--alter-pink)",
      color: "#4a1126",
      border: "2.5px solid var(--ink)",
      borderRadius: "10px",
      padding: "3px 9px",
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: "12px",
      boxShadow: "0 0 14px rgba(255,79,160,.5)"
    }
  }, "NOW ", now));
}

// domain hex with alpha for hatch/glow (avoids color-mix in repeating-gradient stops)
function solid(domain, a) {
  const hex = {
    move: "255,138,58",
    nourish: "52,211,154",
    focus: "54,179,240",
    create: "176,122,255",
    connect: "255,95,160",
    play: "255,200,61",
    restore: "42,184,196",
    upkeep: "127,155,196",
    drift: "138,96,118"
  };
  return `rgba(${hex[domain] || hex.focus},${a})`;
}
Object.assign(__ds_scope, { TimeBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/TimeBlock.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Collection.jsx
try { (() => {
// Alter app — the Collection binder (matches IMG_3582): gold count pill, striped tabs,
// element-typed cards, matte locked aspiration, gold trophy row.
const {
  SegmentedControl,
  CollectionCard,
  TrophyRow
} = window.AlterDesignSystem_202b03;
function Collection() {
  const [tab, setTab] = React.useState("Marks");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      padding: "54px 16px 26px",
      background: "radial-gradient(130% 70% at 50% 10%, #2c0f22 0%, #1d0a17 55%, #160610 100%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: 30,
      color: "var(--text-bright)"
    }
  }, "Collection"), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: "2px solid var(--surface-border-2)",
      background: "#2a0d1c",
      color: "var(--text-dim)",
      fontSize: 17,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-x"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      background: "var(--ink)",
      border: "2px solid var(--alter-yellow)",
      borderRadius: 13,
      padding: "7px 14px",
      color: "var(--alter-yellow)",
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: 14,
      letterSpacing: .4,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-cards",
    style: {
      fontSize: 16
    }
  }), " 12 / 24 COLLECTED"), /*#__PURE__*/React.createElement(SegmentedControl, {
    variant: "binder",
    options: ["Marks", "Trophies"],
    value: tab,
    onChange: setTab,
    style: {
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(CollectionCard, {
    element: "prism",
    icon: "ti-arrow-back-up",
    name: "Came back",
    sub: "prism \xB7 shining",
    pips: 4,
    pipsOn: 2,
    sheen: true
  }), /*#__PURE__*/React.createElement(CollectionCard, {
    element: "burst",
    icon: "ti-flame",
    name: "21 in a row",
    sub: "burst",
    pips: 4,
    pipsOn: 3
  }), /*#__PURE__*/React.createElement(CollectionCard, {
    element: "cosmos",
    icon: "ti-moon-stars",
    name: "Depth",
    sub: "cosmos",
    pips: 4,
    pipsOn: 2
  }), /*#__PURE__*/React.createElement(CollectionCard, {
    locked: true,
    icon: "ti-crown",
    name: "King of the week",
    lockMsg: "3 more perfect days",
    progress: 40,
    pips: 4
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: 14,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "var(--alter-yellow)",
      margin: "18px 2px 10px"
    }
  }, "Trophies"), /*#__PURE__*/React.createElement(TrophyRow, {
    name: "First goal",
    meta: "12 sessions \xB7 June 28"
  }));
}
window.Collection = Collection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Collection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/DayJournal.jsx
try { (() => {
// Alter app — the day journal: two-lane plan-vs-real timeline (matches IMG_3574 / IMG_3575)
const {
  SparkPill,
  SegmentedControl,
  TimeBlock,
  Badge
} = window.AlterDesignSystem_202b03;
function DayJournal() {
  const [zoom, setZoom] = React.useState("D");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      padding: "54px 16px 24px",
      background: "radial-gradient(130% 70% at 50% 40%, #2c0f22 0%, #1d0a17 60%, #160610 100%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: 26,
      color: "var(--text-bright)"
    }
  }, "Today"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ["D", "W", "M"],
    value: zoom,
    onChange: setZoom
  }), /*#__PURE__*/React.createElement(SparkPill, {
    icon: "ti-diamond-filled",
    value: "1,240"
  })), /*#__PURE__*/React.createElement(Lane, {
    hour: "12",
    label: "Morning"
  }, /*#__PURE__*/React.createElement(TimeBlock, {
    domain: "move",
    icon: "ti-run",
    title: "Gym",
    meta: "matched",
    variant: "real",
    matched: true
  })), /*#__PURE__*/React.createElement(Lane, {
    hour: "1",
    label: "Afternoon"
  }, /*#__PURE__*/React.createElement(TimeBlock, {
    domain: "nourish",
    icon: "ti-coffee",
    title: "Lunch",
    meta: "done",
    variant: "ghost"
  })), /*#__PURE__*/React.createElement(Lane, {
    hour: "2",
    nowline: true
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TimeBlock, {
    domain: "focus",
    icon: "ti-code",
    title: "Claude code",
    variant: "now",
    now: "2:32",
    style: {
      borderRadius: "16px 16px 0 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 58,
      border: "3px solid var(--ink)",
      borderTop: "none",
      borderRadius: "0 0 16px 16px",
      background: "rgba(22,5,16,.55)"
    }
  }))), /*#__PURE__*/React.createElement(Lane, {
    hour: "3"
  }, /*#__PURE__*/React.createElement(TimeBlock, {
    domain: "play",
    icon: "ti-book",
    title: "Read",
    meta: "4:00",
    variant: "plan"
  })));
}
function Lane({
  hour,
  label,
  nowline,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginBottom: 16,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      flex: "none",
      textAlign: "right",
      paddingTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: 15,
      color: "var(--text-faint)"
    }
  }, hour)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: "var(--text-dim)",
      margin: "0 0 8px"
    }
  }, label), nowline && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 30,
      right: 0,
      top: 8,
      height: 2,
      background: "var(--alter-pink)",
      boxShadow: "0 0 10px rgba(255,79,160,.7)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: -6,
      top: -4,
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "var(--alter-pink)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: nowline ? 10 : 0
    }
  }, children)));
}
window.DayJournal = DayJournal;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/DayJournal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/HomeNow.jsx
try { (() => {
// Alter app — the "What now?" home / tracker entry (matches IMG_3573 / IMG_3577)
const {
  SparkPill,
  DomainBubble
} = window.AlterDesignSystem_202b03;
function HomeNow({
  onPlay
}) {
  const streak = ["var(--focus)", "var(--alter-yellow)", "var(--connect)", "#3a2130", "#3a2130"];
  const rail = [["ti-run", "move", 0], ["ti-coffee", "nourish", 0], ["ti-code", "focus", 1], ["ti-book", "play", 0], ["ti-walk", "upkeep", 0]];
  const grid = [["ti-lungs", "focus"], ["ti-flower", "create"], ["ti-hand-love-you", "connect"], ["ti-run", "move"], ["ti-bulb", "play"], ["ti-moon", "restore"], ["ti-wave-square", "nourish"], ["ti-dots", "upkeep"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      padding: "50px 18px 24px",
      position: "relative",
      overflow: "hidden",
      background: "radial-gradient(120% 80% at 50% 42%, #3a0f24 0%, #240b18 55%, #170610 100%)",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes alterTwinkle{0%,100%{opacity:.25;}50%{opacity:.85;}}`), [["14%", "16%", 0], ["78%", "24%", 1.2], ["10%", "46%", 2.1]].map(([l, t, d], i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: "absolute",
      left: l,
      top: t,
      width: 3,
      height: 3,
      borderRadius: "50%",
      background: "#e8d8ea",
      animation: `alterTwinkle 3.4s ease-in-out ${d}s infinite`,
      pointerEvents: "none"
    }
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      position: "absolute",
      left: -10,
      top: "26%",
      width: 44,
      height: 88,
      borderRadius: 14,
      border: "2.5px solid var(--ink)",
      background: "#33203a",
      color: "#d6abc4",
      fontSize: 18,
      cursor: "pointer",
      paddingLeft: 12,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-calendar"
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      position: "absolute",
      right: -10,
      top: "26%",
      width: 44,
      height: 88,
      borderRadius: 14,
      border: "2.5px solid var(--ink)",
      background: "#1c4632",
      color: "#8fd7b8",
      fontSize: 18,
      cursor: "pointer",
      paddingRight: 12,
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-leaf"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: 19,
      color: "var(--text-bright)"
    }
  }, "2:41"), /*#__PURE__*/React.createElement(SparkPill, {
    icon: "ti-diamond-filled",
    value: "1,240"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 12
    }
  }, streak.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: 8,
      borderRadius: 5,
      background: c
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 6px 4px"
    }
  }, rail.map(([ic, d, on], i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    className: "ti " + ic,
    style: {
      fontSize: 22,
      color: on ? `var(--${d})` : "var(--text-faint)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onPlay,
    style: {
      width: 210,
      height: 210,
      borderRadius: "50%",
      border: "none",
      background: "var(--alter-pink)",
      color: "#2a0d1c",
      cursor: "pointer",
      boxShadow: "0 0 90px 20px rgba(255,79,160,.35), 0 0 34px rgba(255,79,160,.5), inset 0 0 0 8px rgba(0,0,0,.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-player-play-filled",
    style: {
      fontSize: 74,
      marginLeft: 8
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: 34,
      color: "var(--text-bright)",
      marginTop: 22
    }
  }, "What now?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 16,
      color: "var(--text-dim)"
    }
  }, "next: Deep work \xB7 5:30")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 12,
      marginTop: 8
    }
  }, grid.map(([ic, d], i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    style: {
      aspectRatio: "1",
      borderRadius: 18,
      border: "3px solid var(--ink)",
      background: `linear-gradient(135deg, color-mix(in srgb, var(--${d}) 60%, #2a0d1c), color-mix(in srgb, var(--${d}) 30%, #2a0d1c))`,
      color: "#fff",
      fontSize: 24,
      cursor: "pointer",
      boxShadow: "0 4px 0 var(--ink)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti " + ic,
    style: {
      color: `var(--${d})`,
      filter: "drop-shadow(0 1px 1px rgba(0,0,0,.4))"
    }
  })))));
}
window.HomeNow = HomeNow;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/HomeNow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/IntroSpark.jsx
try { (() => {
// Alter app — the cold-open "Spark" intro (matches IMG_3579)
const {
  Button
} = window.AlterDesignSystem_202b03;
function IntroSpark({
  onGo
}) {
  const hl = (t, c) => /*#__PURE__*/React.createElement("span", {
    style: {
      color: c
    }
  }, t);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(170deg,#2c1140 0%,#1e0b20 55%,#170611 100%)",
      padding: "40px 26px 30px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.png",
    alt: "",
    style: {
      width: 150,
      height: 150,
      marginBottom: 34,
      filter: "drop-shadow(0 6px 26px rgba(255,95,160,.4))",
      borderRadius: 30
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: 26,
      lineHeight: 1.45,
      color: "var(--text-bright)",
      textAlign: "center",
      textWrap: "balance"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 20px"
    }
  }, "Everyone is born with a ", hl("spark", "var(--alter-yellow)"), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 20px"
    }
  }, "Life buries it. Under noise, under screens, under Tuesdays."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 20px"
    }
  }, "It never goes out. It ", hl("waits", "var(--connect)"), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 20px"
    }
  }, "My whole job is keeping ", hl("yours", "var(--alter-yellow)"), " lit."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "I'm ", hl("Alter", "var(--connect)"), ", your guardian."))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: onGo,
    iconRight: "ti-player-play-filled",
    style: {
      width: "100%"
    }
  }, "Let's go"));
}
window.IntroSpark = IntroSpark;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/IntroSpark.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/OnboardingQuestion.jsx
try { (() => {
// Alter app — onboarding worksheet beat (matches IMG_3580/3581): colored segment bar,
// colored-keyword copy, multicolor duration slabs, pink Next.
const {
  Button
} = window.AlterDesignSystem_202b03;
function OnboardingQuestion({
  onNext
}) {
  const [dur, setDur] = React.useState("1 min");
  const segs = [["#4ab6f0", 1], ["#2a5a8a", 1], ["#2a7a52", 0], ["#2a7a52", 0], ["#8a6a1a", 0], ["#8a6a1a", 0], ["#6e2440", 0]];
  const durs = [["30s", "#4ab6f0", "#0b2740"], ["1 min", "#b07aff", "#2a1048"], ["2 min", "#e04a86", "#3a0a20"], ["3 min", "#d4a020", "#3a2a00"]];
  const hl = (t, c) => /*#__PURE__*/React.createElement("span", {
    style: {
      color: c,
      fontWeight: 800
    }
  }, t);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "radial-gradient(1.5px 1.5px at 20% 18%,rgba(255,255,255,.5) 99%,transparent), radial-gradient(1px 1px at 76% 30%,rgba(232,217,255,.4) 99%,transparent), linear-gradient(175deg,#241030 0%,#1a0916 60%,#160610 100%)",
      padding: "54px 20px 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, segs.map(([c, on], i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      background: c,
      opacity: on ? 1 : .55,
      boxShadow: on ? "0 0 8px rgba(120,190,255,.4)" : "none"
    }
  }))), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 40,
      height: 40,
      marginTop: 18,
      borderRadius: 12,
      border: "2px solid var(--ink)",
      background: "#3a1226",
      color: "var(--text-dim)",
      fontSize: 17,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-chevron-left"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: 24,
      lineHeight: 1.4,
      color: "var(--text-bright)",
      textAlign: "center",
      textWrap: "balance"
    }
  }, "Let me guide you through a slow ", hl("breath", "#4ab6f0"), " and a ", hl("muscle release", "#b07aff"), ". It is the fastest switch your ", hl("body", "#4ab6f0"), " has for calling off the ", hl("stress", "var(--connect)"), " response."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 15,
      color: "var(--text-dim)",
      textAlign: "center",
      margin: "30px 0 14px"
    }
  }, "How much time can you give it?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "center"
    }
  }, durs.map(([t, bg, fg]) => {
    const on = dur === t;
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: () => setDur(t),
      style: {
        flex: 1,
        maxWidth: 92,
        padding: "16px 0",
        borderRadius: 14,
        border: on ? "2.5px solid #ffc41f" : "2.5px solid var(--ink)",
        boxShadow: on ? "0 0 0 3px rgba(255,196,31,.25), 0 0 18px rgba(255,196,31,.35), 0 4px 0 var(--ink)" : "0 4px 0 var(--ink)",
        background: bg,
        color: fg,
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: 16,
        cursor: "pointer",
        transform: on ? "translateY(-2px)" : "none",
        transition: "transform .16s var(--ease-spring)"
      }
    }, t);
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: onNext,
    iconRight: "ti-player-play-filled",
    style: {
      width: "100%"
    }
  }, "Next"));
}
window.OnboardingQuestion = OnboardingQuestion;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/OnboardingQuestion.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/YouScreen.jsx
try { (() => {
// Alter app — the "You" character/settings screen (matches IMG_3576)
const {
  SparkPill,
  ActivityRow,
  Badge,
  ProgressBar,
  Panel
} = window.AlterDesignSystem_202b03;
function YouScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      padding: "50px 18px 24px",
      background: "radial-gradient(130% 70% at 50% 20%, #37142b 0%, #200b19 55%, #160610 100%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: 19,
      color: "var(--text-bright)"
    }
  }, "2:41"), /*#__PURE__*/React.createElement(SparkPill, {
    icon: "ti-diamond-filled",
    value: "1,240"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "16px 0 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: 40,
      color: "var(--text-bright)"
    }
  }, "You"), /*#__PURE__*/React.createElement(Badge, null, "Explorer")), /*#__PURE__*/React.createElement(Panel, {
    tint: "var(--surface-3)",
    style: {
      marginBottom: 16,
      borderRadius: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      height: 46,
      borderRadius: 13,
      background: "rgba(255,79,160,.14)",
      border: "2px solid var(--surface-border-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-compass",
    style: {
      fontSize: 24,
      color: "var(--connect)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-round)",
      fontWeight: 800,
      fontSize: 20,
      color: "var(--text-bright)"
    }
  }, "Pathfinder")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 13,
      color: "var(--text-dim)"
    }
  }, "260 to go")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 78,
    variant: "plan"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(ActivityRow, {
    domain: "connect",
    icon: "ti-user",
    title: "Profile",
    sub: "wake 7:30 \xB7 language"
  }), /*#__PURE__*/React.createElement(ActivityRow, {
    domain: "move",
    icon: "ti-volume",
    title: "Sound",
    sub: "voice \xB7 beds \xB7 rewards"
  }), /*#__PURE__*/React.createElement(ActivityRow, {
    domain: "nourish",
    icon: "ti-shield-check",
    title: "Data",
    sub: "snapshot \xB7 12d ago"
  }), /*#__PURE__*/React.createElement(ActivityRow, {
    domain: "focus",
    icon: "ti-compass",
    title: "Guidance",
    sub: "light"
  }), /*#__PURE__*/React.createElement(ActivityRow, {
    domain: "create",
    icon: "ti-moon",
    title: "Rest mode",
    sub: "streaks held"
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      width: "100%",
      marginTop: 14,
      padding: "16px",
      borderRadius: 16,
      border: "2px dashed var(--surface-border-2)",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: 15,
      color: "var(--create)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-flask"
  }), " Advanced ", /*#__PURE__*/React.createElement("i", {
    className: "ti ti-chevron-down",
    style: {
      marginLeft: "auto",
      color: "var(--text-dim)"
    }
  })));
}
window.YouScreen = YouScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/YouScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.ChoiceRow = __ds_scope.ChoiceRow;

__ds_ns.ChoiceTile = __ds_scope.ChoiceTile;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.CollectionCard = __ds_scope.CollectionCard;

__ds_ns.DomainBubble = __ds_scope.DomainBubble;

__ds_ns.FireChip = __ds_scope.FireChip;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.SparkPill = __ds_scope.SparkPill;

__ds_ns.TrophyRow = __ds_scope.TrophyRow;

__ds_ns.ActivityRow = __ds_scope.ActivityRow;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.TimeBlock = __ds_scope.TimeBlock;

})();
