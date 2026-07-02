# PlanQueue — Demo Script

Scripts and shot lists only. Recording, README edits, and video editing happen at the human gates.

The narrative follows the mandatory content spine from `OPENSOURCE_PLAN.md` Phase 4, in this exact order:

1. "I keep losing the next prompt while working with coding agents."
2. "So I built PlanQueue for OMP."
3. Show note panel under status line.
4. Type 3 tasks + a `---` barrier.
5. Press queue key; first prompt sends.
6. Show pending / in-flight / done glyphs.
7. Toggle auto-run; show it stops at the barrier.
8. CTA: "Open-source. Star it, try it, tell me what your agent workflow needs."

Lead with the outcome. The first 5 seconds show the problem and the result — never the install command.

## (a) 30–45s social script — per-second beats

Spoken narration below is **88 words** (fits comfortably under 45s aloud). One CTA only.

| Time | On screen | Spoken (voiceover or caption) |
|------|-----------|-------------------------------|
| 0–2s | Agent chat mid-task; a queued prompt sits unsent, highlighted | "Working with a coding agent, I kept losing the next prompt I wanted to run." |
| 2–5s | Cut to PlanQueue panel populated under the status line (the result) | (narration continues) |
| 5–9s | Zoom on panel below status line | "So I built PlanQueue — a note panel right under the status line." |
| 9–15s | `Ctrl+N` editor open; the 3 tasks + `---` barrier already typed | "I write my tasks as a checklist, drop a barrier where I want to review." |
| 15–19s | Save; press `Ctrl+↓`; head task flips `- [ ]` → `- [>]` | "One keypress sends the top task." |
| 19–24s | Panel glyphs: `☐` pending, `▸` in-flight, `✓` done; head reaches `- [x]` | "Pending, in-flight, done — you watch it move." |
| 24–33s | `Ctrl+Shift+↓` auto-run on (`▶` marker); tasks drip in order; motion halts at `---` | "Toggle auto-run and it drips each prompt in order, then halts at the barrier for me." |
| 33–37s | Barrier line held, cursor waiting at `---` | "It's open source for OMP." |
| 37–45s | Repo card / PlanQueue wordmark; star prompt | "Star it, try it, and tell me what your agent workflow needs." |

Editing note: if the cut needs to land at 30s, drop the 33–37s "open source for OMP" beat into the caption and end on the CTA at 30s.

## (b) 60–90s raw recording shot list

Record one clean pass. Slow, deliberate keystrokes — zooms are added later in OpenVid, so don't rush.

1. **0–8s — Problem framing.** Agent session open, one task finishing. A prompt you meant to run next is visible but unsent. Sit on it briefly so the "lost next prompt" pain reads.
2. **8–15s — Reveal panel.** Show the PlanQueue notes panel already under the status line with the dimmed hint `(Ctrl+N · Ctrl+↓ queue · Ctrl+Shift+↓ auto)`.
3. **15–20s — Open editor.** Press `Ctrl+N`. Empty multi-line editor opens.
4. **20–40s — Type the note.** Type the exact content from section (c), line by line, including the `---` barrier. Let each `- [ ]` line land visibly.
5. **40–45s — Save.** Press Enter (or Esc → confirm save). Panel now shows the checklist preview.
6. **45–52s — Dispatch head task.** Press `Ctrl+↓`. Head task glyph goes `☐` → `▸` (`- [ ]` → `- [>]`). Agent starts working it. When it completes, glyph goes `▸` → `✓` (`- [>]` → `- [x]`).
7. **52–70s — Auto-run.** Press `Ctrl+Shift+↓` (auto marker `▶` appears in hint). Remaining tasks dispatch in order without further keys; glyphs advance task by task.
8. **70–82s — Barrier halt.** Auto-run reaches the `---` line and stops. Show that nothing past the barrier fires — the review gate holds.
9. **82–90s — End card.** Cursor resting at the barrier, or cut to a plain PlanQueue title frame for the outro.

## (c) Exact demo note content to type

Generic, fake project. No private, client, or real repository data. Type this verbatim:

```md
- [ ] Refactor the pricing module into smaller pure functions
- [ ] Add unit tests for the discount edge cases
---
- [ ] Update the README usage section to match the new API
```

- Three realistic, generic engineering tasks (refactor / test / docs) on an invented "pricing module".
- The `---` line is the human-in-the-loop barrier: auto-run halts there so the docs task is reviewed before it fires.
- Nothing here names a real company, client, repo, or file path.

## (d) Keys and actions to show

Show each of these on screen, in order, at a readable pace:

- `Ctrl+N` — open the note editor (or `/note`). Multi-line: Enter saves, Shift+Enter newline, Esc closes with save/discard confirm.
- **Typing** — enter the three `- [ ]` tasks and the `---` barrier from section (c).
- **Save** — Enter (or Esc → save). Panel preview updates to the checklist.
- `Ctrl+↓` — dispatch the head task. Show the glyph transition `- [ ]` (`☐` pending) → `- [>]` (`▸` in-flight) → `- [x]` (`✓` done).
- `Ctrl+Shift+↓` — toggle auto-run. Show the `▶` marker in the hint and tasks dispatching in order.
- **Halt at `---`** — auto-run reaches the barrier and stops; confirm nothing past it fires.

Default hint string to keep visible: `(Ctrl+N · Ctrl+↓ queue · Ctrl+Shift+↓ auto)`.

## (e) Redaction checklist

Before recording, and again before export, confirm:

- [ ] No API tokens, keys, or secrets visible anywhere (editor, status line, scrollback, env output).
- [ ] No private or client repository names on screen (use the generic pricing-module tasks only).
- [ ] No real filesystem paths beyond `~/.planqueue` — no home usernames, no client directories, no `omp-free-text` / `free-text-core` legacy paths.
- [ ] Storage path shown, if any, is `~/.planqueue/{repo}/{branch}/{session-id}.md`.
- [ ] Clean shell prompt — no custom prompt leaking machine name, user, or private git branch names; use a neutral repo/branch.
- [ ] No browser tabs, notifications, chat apps, or other windows in frame.
- [ ] Terminal font large enough to read on mobile; no dense unrelated scrollback.
- [ ] Product name reads **PlanQueue** everywhere on screen; no old-identity strings.

## (f) README insertion plan

> This is the plan only — the README is edited at the human gate, not now.

- **Placement:** insert the demo GIF immediately **after the hook paragraph** (current README line 7, the "An OMP extension that gives you **PlanQueue** …" sentence) and **before** the "If this is useful … ⭐" line and the Contents list.
- **Asset:** the README GIF from `video-asset-checklist.md` — a short silent loop showing note → queue → done. Store at `docs/demo.gif`.
- **Markdown to add:**

  ```md
  ![PlanQueue: write a checklist note under the status line, then drip-feed it to your agent one prompt at a time — pending, in-flight, done, halting at a review barrier.](docs/demo.gif)
  ```

- **Caption (rendered under the GIF, optional italic line):**

  ```md
  *Queue your prompts as a checklist; `Ctrl+↓` sends the next one, auto-run drips the rest and stops at each `---` barrier.*
  ```

- The alt text doubles as the accessibility description; keep it in sync with `video-asset-checklist.md`.
- Also update README line 1 title and badges to the PlanQueue identity at the same gate (out of scope for this script, noted so the GIF edit isn't done in isolation).

## (g) OpenVid workflow steps

Preferred promo tool: OpenVid (<https://github.com/CristianOlivera1/openvid> / <https://openvid.dev>). Do not open it now — this is the runbook for the recording session.

1. **Record raw once** — capture the single 60–90s clean pass from section (b). Don't re-shoot for polish; fix pacing in the editor.
2. **Import** the raw recording into OpenVid.
3. **Background** — add a neutral solid or subtle gradient background behind the terminal frame.
4. **Zooms** — add focus zooms on the key moments: the panel reveal, the glyph transitions (`- [ ]` → `- [>]` → `- [x]`), and the auto-run halt at `---`.
5. **Frame** — optional device/window frame; keep it minimal so text stays readable small.
6. **Export short first** — export the 30–45s social cut before any heavy polish. Test readability on mobile, then iterate only if needed.
7. Derive the README GIF and the per-platform cuts (LinkedIn 9:16, X first-second-UI) from the same master per `video-asset-checklist.md`.
