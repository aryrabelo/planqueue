# Security Policy

## Reporting a vulnerability

If you find a security issue in PlanQueue, please report it privately rather than
opening a public issue.

- Use GitHub's [private vulnerability reporting](https://github.com/aryrabelo/planqueue/security/advisories/new)
  for this repository, or
- Email the maintainer at **aryrabelo@gmail.com** with the details.

Please include:

- a description of the issue and its impact,
- steps to reproduce or a proof of concept,
- the version or commit you tested.

You can expect an initial response within a few days. Once a fix is available,
we'll coordinate disclosure with you.

## Scope

PlanQueue is an OMP (Oh My Pi) harness extension written in TypeScript and run on
Bun. It runs inside your OMP session on your local machine. The relevant security
surface is:

- **Local file I/O** — it writes plain Markdown notes only under `~/.planqueue/`
  (`~/.planqueue/{repo}/{branch}/`), plus the global `~/.planqueue/config.json`.
  It does not write outside that directory tree. For back-compat it *reads*
  (never writes) notes and config from the legacy roots `~/.free-text/` and
  `~/.omp-free-text/`.
- **The `note_add` and `make_note` LLM tools** — the extension registers tools
  the agent can call to append a `- [ ]` task (`note_add`) or write a decomposed
  prompt-queue plan (`make_note`) to the current note. They only mutate the note
  buffer; they cannot read or write arbitrary paths.
- **OSC 52 clipboard escapes** — copying the note writes the buffer to your
  terminal's clipboard via an OSC 52 terminal escape sequence.
- **The `herdr` notification subprocess** — when running inside Herdr
  (`HERDR_ENV=1`), the extension shells out to `herdr notification show` to
  surface queue alerts. No other commands are spawned.

The extension makes **no network calls** and collects **no telemetry**.

## Supported versions

The latest release is `0.1.0`. Security fixes target the latest release and
`main`. Older versions are not maintained.
