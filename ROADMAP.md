# ALTER — development roadmap

A pixel-art life sim where your real actions level a mirror-self and build its world.
First user: David. Architecture bias: **$0 marginal cost, privacy-first, manual-before-automate.**

---

## The one constraint that decides everything

A **GitHub Pages site is static** — no server. That means:
- It **cannot safely call a paid AI** (an API key in a static page is public to anyone).
- It **cannot touch Screen Time / block apps** — that's an iOS-only capability.

So the smart architecture is **not** "put AI in the website." It's:

> **The app is the body + scoreboard. Claude is the brain — riding David's existing
> Claude subscription via iOS Shortcuts, at $0 per use. The website stays dumb.**

AI "understanding" enters through Claude (sub, not metered API) until a native app justifies
real on-device models. We add intelligence where it's free first, and only pay for the ~10%
that genuinely needs a metered call.

---

## Phases (each one gates the next — don't skip)

### Phase 0 — v0 (DONE)
- Manual pixel life-sim. 6 domains, earn coins + XP, spend on furniture + appearance.
- Static web, `localStorage`, no accounts, no backend, $0.
- **Gate to Phase 1:** David actually uses it ~1–2 weeks. We keep what holds, cut what doesn't.

### Phase 1 — make it stick (web, still $0)
- Swap procedural sprites for a real CC0 pixel-art pack (LimeZu "Modern Interiors" is the Sims look; Kenney is CC0).
- PWA polish so **Add to Home Screen** feels like an app (icon, splash, offline cache).
- Move data from `localStorage` to a file in iCloud Drive so it survives across devices.
- Still **no AI.** Prove the habit first.
- **Gate:** it's a daily habit and the loop feels good.

### Phase 2 — Claude-as-brain (the $0 AI bridge)
- The "feed it data" features arrive here **without a token bill**, because they ride David's
  Claude.ai / Claude Code subscription, not a per-call API.
- Flow: photo of room / meal → **iOS Shortcut** → Claude judges it → returns a structured score
  (e.g. `{order: 62, note: "..."}`) → Shortcut writes it into the app's iCloud data → stats update.
- The **mirror line** becomes Alfred-generated instead of templated.
- **Gate:** the judgments are useful and trusted. (Calibrate against David's own read of the same photo.)

### Phase 3 — native iPhone app
- The only thing that unlocks what web + Shortcuts cannot:
  - **Screen Time blocking** of YouTube / Instagram with a clever earn-to-unblock economy.
    Tech: Swift + Apple **Family Controls / DeviceActivity / ManagedSettings** (needs Apple entitlement).
  - Live camera capture, background presence, real push notifications.
- AI: **on-device vision first** (Apple Vision framework / a small Core ML classifier) for instant,
  free, private reads. Escalate to a real multimodal model only for nuanced calls.
- **Gate:** the web app's loop is proven; blocking is the headline reason to go native.

### Phase 4 — auto-understanding ("health tracker, but for life")
- Vision judgments feed stats automatically: room tidiness → Order, meal photo → Fuel,
  (carefully) smoking → a kryptonite tracker.
- Cost control: on-device classifiers for routine reads; Claude for nuance; **batched, not real-time.**

---

## Token / AI integration cheat-sheet

| Want AI on... | Real options | Pick |
|---|---|---|
| Static GitHub site | (a) on-device model in browser (transformers.js / WebLLM, WebGPU) = $0 but small/slow; (b) thin serverless proxy (Cloudflare Workers / Vercel free tier) holding the key = small $ | **Neither at first — route through Claude sub via Shortcuts** |
| iPhone app | on-device Core ML / Vision = free + private; metered API for hard calls | **On-device first, API for the 10%** |

**Rule of thumb:** free path first (on-device or the Claude subscription), metered API only for
what truly needs it, and batch it instead of calling live on every action.

---

## Open design flags (decide when we reach them)
- **Smoking-from-photo is fuzzy AND the most intimate data in the app.** It's David's named
  kryptonite, so it matters most — which means it deserves the most careful, least-punitive design.
- **Privacy:** photos of room / meals / body are intimate. On-device or Claude-sub processing keeps
  them off third-party metered servers. Never ship intimate data to a paid API silently.
- **No shame mechanics, ever** (per the app's soul doc): misses are data, never punishment.
