# PlanQueue — launch brief

Source of truth: `OPENSOURCE_PLAN.md` (Phase 0, identity table, drafts) and `README.md` (feature truth). Every claim below traces to one of those files.

- Product: **PlanQueue**
- Repo: `aryrabelo/planqueue`
- Package: `@aryrabelo/planqueue` (core `@aryrabelo/planqueue-core`)
- First release: `v0.1.0` — PlanQueue first public release
- Status: strategy/docs only. No public actions.

## ICP — who this is for

OMP (Oh My Pi) and terminal coding-agent users who:

- Lose the next prompt while working — the plan lives in their head or a scratch buffer and evaporates between turns.
- Paste sequential prompts by hand — they already think in steps, but feed the agent one prompt at a time, manually, every turn.
- Run multiple sessions per repo/branch and want the plan to survive a session, a restart, or a context switch.

Not for: users who want an autonomous agent that runs unsupervised, or a general note-taking app. PlanQueue is a supervised prompt queue for people already driving an agent.

## Problem

Driving a coding agent is a sequence of prompts, but the tooling treats each prompt as a one-off. You write the plan somewhere, then re-type or re-paste the next step every turn. The plan and the execution live in different places, so the plan drifts, gets lost on a restart, or has to be reconstructed from memory.

## Promise

**Write the plan once, run it as a prompt queue.**

## One-liner

> PlanQueue turns your free-text notes into a prompt queue for OMP coding agents.

## Proof points (grounded in real features)

1. **FIFO prompt queue with checkbox states.** The note is a queue of markdown checkbox tasks. `Ctrl+↓` sends the head pending task and marks it in-flight (`- [>]`), then done (`- [x]`) when the turn settles. The panel renders the states as glyphs: `☐` pending, `▸` in-flight, `✓` done. Plain lines auto-normalize to `- [ ]` on save — you never type `[ ]` by hand. (README: Prompt queue.)

2. **`---` human-in-the-loop barrier + auto-run that halts.** A lone `---` line is a review checkpoint. `Ctrl+Shift+↓` toggles auto-run, feeding one queued line per agent settle — but it pauses at every `---` barrier, and halts if a turn ends in error or is aborted. The human stays in control by design. (README: Prompt queue.)

3. **Persistence per repo / branch / session, in local markdown.** Each session gets its own file at `~/.planqueue/{repo}/{branch}/{session-id}.md` — plain markdown you can read or edit directly. Config lives at `~/.planqueue/config.json`. Notes from other sessions are browsable with `/planqueue`. No network, no telemetry. (README: Storage; plan identity table. Legacy `~/.free-text` / `~/.omp-free-text` notes are still read back.)

## Launch CTA

One ask, three verbs:

> Star the repo, try the install, and reply with your OMP workflow pain.

Install commands (one per channel):

```sh
omp plugin install github:aryrabelo/planqueue   # git
omp plugin install @aryrabelo/planqueue         # npm
```

## Risks

- **Install path breaks.** The core dependency must be publicly installable (npm-published or vendored) before marketing sends anyone to it — a `file:` path breaks any public install. Verify a clean git and npm install before launch. (Plan Phase 2.)
- **Identity residue.** Any `omp-free-text` / `free-text-core` reference in a public artifact undercuts the single-name story. Only the legacy read-fallback code path and one migration note may mention old paths. (Plan Phase 1/6.)
- **Autonomy misread.** If copy oversells auto-run, users expect an unsupervised agent and are disappointed (or alarmed). The queue is supervised: barriers and error-halt are the point.
- **Continuation cap.** OMP caps continuation chains at 8, so a barrier-free run drains ~8 lines per chain before pausing. Frame `---` barriers as the intended way to checkpoint longer queues, not a workaround. (README: Known limit.)
- **Untested clean install.** Do not claim "works everywhere" — only claim what was tested on a clean OMP install outside the author's machine. (Plan guardrails.)

## Non-goals for this launch

Deliberately out of scope for the 24–48h launch window (boundaries, not promises):

- OMP marketplace listing / positioning as a marketplace plugin (marketplace extension loading is not verified).
- A full docs site.
- Paid ads.
- Project governance weight — councils, roadmaps, process — before there is community pull.
- Multiple feature promises. One promise, repeated everywhere.

## 48-hour metrics

Measure signal, not reach:

- **Meaningful feedback** — replies describing a real OMP workflow pain, install reports, first issues.
- **Installs** — git and/or npm.
- **Stars.**

Explicitly not the target: impressions, views, or vanity reach.

## Message map — 3 variants

**Technical**
> PlanQueue is an OMP extension: a session notes panel that doubles as a FIFO prompt queue. `Ctrl+↓` dispatches the head checkbox task and tracks its state (pending → in-flight → done); `---` lines are human-in-the-loop barriers where auto-run pauses. Notes persist per repo/branch/session as local markdown under `~/.planqueue`. Open source, MIT. Install: `omp plugin install github:aryrabelo/planqueue`.

**Story-driven**
> I kept losing the next prompt while working with coding agents — the plan was in my head, and I re-typed each step every turn. So I built PlanQueue for OMP: write the plan once, then run it as a prompt queue. It stops at `---` barriers so I stay in control. Open source. Star it, try it, and tell me what your agent workflow needs.

**Social-short**
> Stop pasting the next prompt manually. Write the plan once, run it as a prompt queue. PlanQueue for OMP — open source. ⭐ github.com/aryrabelo/planqueue

## Do not say

- No hype words: **"revolutionary"**, **"perfect"**, **"works everywhere"** (the last is also unverified until a clean external install is tested).
- No marketplace claim — do not call it an OMP marketplace plugin; marketplace loading is unverified.
- No autonomy overclaim — do not imply it runs unsupervised or "does the work for you". The queue is supervised: `---` barriers and error/abort halt are by design.
- No reference to `omp-free-text`, `free-text-core`, or old version numbers in any public artifact (sole exception: the migration note for old storage paths).
- No "AI launch fluff" generic copy — keep it channel-native and specific.
- More than one CTA per post.
