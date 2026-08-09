# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Optional Beads-backed queue source (spike): when the working directory contains a `.beads/` directory and `bd` is on PATH, the prompt queue runs on `bd ready` issues instead of note checkboxes — the widget lists ready beads, `Ctrl+↓` claims the head bead (`bd update --claim`) and dispatches it as a prompt, and settle closes it only if still open (an agent-written evidence reason is never overwritten). Note mode is unchanged when no `.beads/` exists; a failed `bd ready` degrades to note mode with a notification.

## [0.2.1] - 2026-08-09

### Added

- Version footer: the notes widget now shows a dimmed `v<version>` line (read from `package.json`) below the shortcut hint, so you can tell at a glance which build is loaded.
- Hide-key discoverability: the shortcut hint now lists the hide toggle — `(Ctrl+N · Ctrl+↓ queue · Ctrl+Shift+↓ auto) · Ctrl+H hide` — instead of leaving `Ctrl+H` undocumented.

## [0.2.0] - 2026-07-27

### Added

- Auto session-summary heading: on your first message in a session the note gains a `# <summary>` heading derived from that message (idempotent; skips slash-commands). Bootstrap now fires for empty *or* heading-only notes, and `make_note` never double-heads.
- Spent-note prompt: after the queue has run and drained, PlanQueue acts once — when all tasks are done (`- [x]`) it asks (confirm) whether to rebuild the note from the session (the `/rebuild-note` flow); otherwise (e.g. only a heading left) it just notifies you to run `/rebuild-note` or `/clear-note`. It never auto-runs the agent without your confirmation.
- Copy discoverability: the first time you open the notes editor each session, PlanQueue surfaces the `Alt+Shift+C` whole-buffer copy shortcut.
- Hide toggle: `Ctrl+H` collapses the widget to a single bare `PlanQueue` line and toggles back, for when you want the panel out of the way. The state sticks across session switches.
- Draft capture: pressing `Ctrl+N` while a prompt is typed but unsent asks whether to queue that draft at the top of the note instead of opening the editor. Accepting turns it into the first `- [ ]` task (extra lines become indented continuations sent with it) and clears the input; declining opens the notes editor as before.

### Changed

- Auto-run no longer clobbers in-progress typing: while auto-run is on it pauses instead of dispatching the next queue line whenever you have unsent text in the input, resuming once you send it.
- The below-editor notes widget is now hidden while the notes editor is open, removing the decorated duplicate ("sidebar") that made the note hard to copy.
- Taller panel: the notes widget now shows up to 20 lines instead of 10. OMP truncates a widget at 10 lines per key, so PlanQueue publishes the panel as consecutive keyed widgets that render back-to-back.

### Dependencies

- Requires `@aryrabelo/planqueue-core` `^0.3.0` (the 20-line `renderWidgetLines` budget, plus `deriveHeading`, `ensureHeadingFromMessage`, `hasHeading`, `hasDoneTask`, `isEmptyOrHeadingOnly`, `isQueueSpent`).

## [0.1.1] - 2026-07-03

### Added

- `/clear-note` command: empties the current note (appending the previous content to `.history.md` first) behind a confirmation prompt; a no-op on an already-empty note.
- `/rebuild-note` command: behind a confirmation prompt, clears the note and asks the agent to rebuild the plan from the whole session via `make_note`, keeping only the remaining work (skipping anything already done or marked `- [x]`); the old note is passed verbatim and saved to history. On an empty note it bootstraps a fresh plan (no confirmation).

### Changed

- Widget title changed from `PlanQueue` to `PlanQueue · Notes`.
- Extension display label (`pi.setLabel`) changed from `PlanQueue` to `PlanQueue · Notes` to match the widget branding.

## [0.1.0] - 2026-07-02

PlanQueue first public release: an OMP (Oh My Pi) extension that renders a
session-notes panel below the status line and turns that note into a
FIFO prompt queue for coding agents.

### Added

- Notes panel below the status line, editable with `Ctrl+N` or `/note`, persisted per repo/branch/session under `~/.planqueue/{repo}/{branch}/{session-id}.md`.
- Prompt queue over Markdown checkboxes — `- [ ]` pending, `- [>]` in-flight, `- [x]` done — rendered as panel glyphs `☐`/`▸`/`✓`. Plain lines and `-` bullets auto-normalize to `- [ ]` on save; `#` headings and `>` quotes stay prose.
- `Ctrl+↓` dispatches the head pending task via `pi.sendUserMessage`; indented continuation lines are sent with their task as one multi-line prompt.
- `---` human-in-the-loop barriers that pause the queue until you pass them.
- `Ctrl+Shift+↓` auto-run, which feeds one queued line per agent settle, pauses at barriers, and halts on a failed or aborted turn. Inside Herdr (`HERDR_ENV=1`) it pings `herdr notification show` at each barrier.
- `/planqueue` cross-session browser: a keyboard picker of notes from other sessions in the same repo/branch, opened in a read-only viewer.
- `note_add` LLM tool: the agent appends a `- [ ]` task to the current note on request. `/make-note <goal>` plus the `make_note` LLM tool decompose a goal into a full prompt queue in one shot. `/note <text>` appends a single `- [ ]` task.
- `Alt+Shift+C` copies the whole note buffer to the system clipboard via an OSC 52 escape (works locally and over SSH).
- Append-only `{session-id}.history.md` sibling recording every changed save (including discarded drafts).
- Configurable shortcuts via a global `~/.planqueue/config.json`; a missing or malformed entry falls back to its default and logs a warning.
- Read-only fallback for existing users: notes and config under the legacy `~/.free-text/` and `~/.omp-free-text/` roots are still read; all new writes go to `~/.planqueue/`.

### Prior history

- Internal iterations preceding the public PlanQueue identity are not tracked here; `0.1.0` is the first release under this name.

[0.2.1]: https://github.com/aryrabelo/planqueue/releases/tag/v0.2.1
[0.2.0]: https://github.com/aryrabelo/planqueue/releases/tag/v0.2.0
[0.1.1]: https://github.com/aryrabelo/planqueue/releases/tag/v0.1.1
[0.1.0]: https://github.com/aryrabelo/planqueue/releases/tag/v0.1.0
