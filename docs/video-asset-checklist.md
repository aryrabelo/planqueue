# PlanQueue — Video Asset Checklist

Per-asset requirements for the launch. All assets derive from the single raw recording and the OpenVid master in `demo-script.md`. Assets only — no publishing here; each social post is a human gate.

Shared rules:
- Product name is **PlanQueue** everywhere. No `omp-free-text` / `free-text-core` strings on screen.
- English only. No hype ("revolutionary", "perfect", "works everywhere").
- Pass the redaction checklist in `demo-script.md` section (e) before exporting any asset.
- One CTA per asset.

## README GIF

- [ ] Short **silent** loop: note → queue → done, then loops cleanly.
- [ ] ≤ ~10s, small file size (target well under a few MB) so the README stays light.
- [ ] Shows the panel under the status line, `Ctrl+↓` dispatch, and the glyph transition `- [ ]` → `- [>]` → `- [x]`.
- [ ] Readable at README render width; large terminal font.
- [ ] Stored at `docs/demo.gif` (matches the README insertion plan).
- **Alt text:** "PlanQueue: write a checklist note under the status line, then drip-feed it to your agent one prompt at a time — pending, in-flight, done, halting at a review barrier."

## LinkedIn native video

- [ ] **Mobile-first** framing — 9:16 vertical or 1:1 square for the feed.
- [ ] **Captions burned in** — many watch muted; subtitles must be on the pixels, not upload metadata.
- [ ] Strong content in the opening seconds: problem/result first, never install.
- [ ] Target **15–30s** for top-of-funnel awareness (under 2 min if a deeper cut is made later).
- [ ] Native upload (not a link) so it autoplays in-feed.
- [ ] One CTA at the end: star / try / reply with your workflow pain.
- **Alt text / caption:** "A notes panel under your coding agent's status line that doubles as a prompt queue — write tasks as a checklist and drip-feed them to the agent, stopping at review barriers. PlanQueue, open source for OMP."

## X video / GIF

- [ ] **UI/result in the first second** — open on the populated panel or a glyph advancing, not on a title card.
- [ ] Short (video or GIF), visual-first, plays inline.
- [ ] Shows the core workflow: note → queue → barrier → auto-run.
- [ ] Captions optional but recommended for muted autoplay.
- [ ] One-line promise + repo link live in the post text (not the asset).
- **Alt text:** "PlanQueue panel under a coding agent's status line showing a checklist of prompts advancing from pending to in-flight to done, with auto-run halting at a `---` review barrier."

## Social preview image (1200×630)

- [ ] Dimensions **1200×630** (Open Graph / link-card standard).
- [ ] PlanQueue wordmark + a clear tagline, e.g. **"Queue prompts for your coding agent."**
- [ ] Legible when scaled down to a small link card; high contrast, generous type.
- [ ] Optional single UI snippet (panel + one glyph), not a dense terminal screenshot.
- [ ] Stored at `docs/banner.png` (matches Phase 3/4 social-preview note).
- **Alt text:** "PlanQueue social card: the PlanQueue name with the tagline 'Queue prompts for your coding agent.'"

## Thumbnail

- [ ] **Readable at small size** — bold, few elements; not a dense terminal screenshot.
- [ ] One focal idea: the panel with an advancing glyph, or the wordmark + tagline.
- [ ] High contrast; text legible as a feed/preview thumbnail.
- **Alt text:** "PlanQueue thumbnail showing the prompt-queue panel with a task moving from pending to done."

## Alt text summary

Every asset above ships with its alt text. Keep the README GIF alt text identical to the README insertion plan in `demo-script.md` section (f). No asset publishes without an accessible text description.
