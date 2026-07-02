# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-02

PlanQueue first public release: an OMP (Oh My Pi) extension that renders a
free-text session-notes panel below the status line and turns that note into a
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

[0.1.0]: https://github.com/aryrabelo/planqueue/releases/tag/v0.1.0
