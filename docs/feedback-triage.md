# PlanQueue feedback triage

How to sort and answer feedback fast during the launch window. Each category has a **response
macro** (edit the placeholders) and a **routing** decision: file a GitHub **issue**, make a
**docs change**, or take **explicit no-action**. Never fix a bug inside a comment thread — route
it to an issue so it survives.

Global tone: acknowledge, be concrete, one clear next step. No hype, no over-promising.

---

## Install friction

Symptom: install command fails, wrong node/bun, `file:` path error, plugin not loading.

- **Routing:** issue (bug in distribution) — unless it is a documented prerequisite, then docs.
- **Macro:**
  > Thanks for flagging — sorry it broke. Can you paste the exact command and the error? I'll
  > track it here: `<issue link>`. Meanwhile you can pin to a known-good tag:
  > `omp plugin install github:aryrabelo/planqueue#v0.1.0`.

## UX confusion

Symptom: "how do I queue?", "what does `---` do?", "which key runs the next prompt?".

- **Routing:** docs change if the README/usage is unclear; no-action if it was a one-off misread.
- **Macro:**
  > Good question. `Ctrl+N` edits the note, `Ctrl+↓` queues the next step, `Ctrl+Shift+↓`
  > toggles auto-run, and a `---` line is a human-in-the-loop barrier. If the README didn't make
  > that obvious, that's on me — I'll tighten it: `<docs issue link>`.

## Feature request

Symptom: "can it also do X?", "please add Y".

- **Routing:** issue if in-scope and evidenced; explicit no-action (polite redirect) if it is a
  listed non-goal.
- **Macro (in-scope):**
  > That's a reasonable ask. Filed it so it's tracked and others can +1: `<issue link>`. No
  > promises on timing, but this is exactly the feedback I wanted.
- **Macro (out-of-scope):** see the redirect wording at the bottom.

## Bug

Symptom: wrong behavior, crash, data not saved, queue mis-steps.

- **Routing:** issue, always. Reproduce or ask for repro. Never fix-in-comments.
- **Macro:**
  > Thanks — that sounds like a real bug. Filing it: `<issue link>`. Can you add your OMP version,
  > PlanQueue version, OS/terminal, and the steps? I'll fix-forward and note it in the changelog.

## Docs confusion

Symptom: docs contradict behavior, missing step, stale path (e.g. old storage root).

- **Routing:** docs change.
- **Macro:**
  > You're right, the docs are off there. New notes live in `~/.planqueue/{repo}/{branch}/…`
  > (legacy `~/.free-text` / `~/.omp-free-text` are still read). I'll correct the docs:
  > `<docs issue/PR link>`.

## Praise

Symptom: "nice", "starred", "using this daily".

- **Routing:** no-action (optionally pin/save for the follow-up post).
- **Macro:**
  > Appreciate it — thank you. If you hit any rough edge, tell me; that's what shapes the next
  > release.

---

## Out-of-scope redirect (use README non-goals)

For requests that fall under the deliberate non-goals, redirect politely and honestly. These are
boundaries, not promises:

- Inline editable panel (replacing the popup overlay)
- Per-session history-version browsing of the `.history.md` timeline
- Clickable widget (blocked on OMP SDK `onClick`)
- Optional Herdr companion pane sharing the note file

- **Macro:**
  > That's deliberately out of scope for now — it's listed under Non-goals in the README as a
  > boundary rather than a promise (`<repo>#non-goals--roadmap`). If enough people want it I'll
  > revisit, so I'll leave a note here for visibility, but I'm keeping v0.1.x small on purpose.
