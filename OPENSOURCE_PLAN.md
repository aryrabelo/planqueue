# Open-source launch plan — PlanQueue

Created: 2026-07-01 · Rewritten: 2026-07-02 (full PlanQueue rebrand, fresh launch)
Local repo: `/Users/aryrabelo/Sites/omp-plan-queue`
Target public repo: <https://github.com/aryrabelo/planqueue>
Planning mode: **do not execute implementation or public launch actions from this file**.

## TL;DR

Launch **PlanQueue** as a brand-new project. One name everywhere: repo, npm package, storage paths, docs, marketing. The previous `omp-free-text` identity and its release history are ignored — this launch presents PlanQueue as the first public release.

The launch is blocked by the rebrand itself plus the known distribution gap:

1. **Rebrand everything**: repo → `aryrabelo/planqueue`, package → `@aryrabelo/planqueue`, core → `@aryrabelo/planqueue-core`, storage root → `~/.planqueue`, all docs/templates/CI.
2. **Fix the distribution story**: `package.json` depends on `@aryrabelo/free-text-core` via `file:../free-text-core`, which breaks any public install. Publish/rename the core, or vendor it, before marketing.
3. **Reset the release story**: cut PlanQueue `v0.1.0` as the first public release. Old `omp-free-text` tags/releases are not promoted anywhere.
4. Add a demo asset: GIF/video above the fold, OpenVid-polished 30–45s promo, banner/social preview.
5. Launch in a tight 24–48h window: GitHub repo + LinkedIn video + X thread + oh-my-pi Discord + optional dev.to/Show HN follow-up.

## Product identity — one name, everywhere

| Surface | Value |
|---|---|
| Product name | **PlanQueue** |
| GitHub repo | `aryrabelo/planqueue` |
| npm package | `@aryrabelo/planqueue` |
| Core package | `@aryrabelo/planqueue-core` (local dir `../planqueue-core`) |
| Install (git) | `omp plugin install github:aryrabelo/planqueue` |
| Install (npm) | `omp plugin install @aryrabelo/planqueue` |
| Storage root | `~/.planqueue/{repo}/{branch}/{session-id}.md` |
| Config | `~/.planqueue/config.json` |
| First release | `v0.1.0` — "PlanQueue first public release" |

There is no split between "public name" and "technical name". `omp-free-text` and `free-text-core` do not appear in any public-facing artifact after the rebrand.

### One-liner

> PlanQueue turns your free-text notes into a prompt queue for OMP coding agents.

### Longer description

PlanQueue is an open-source OMP extension that adds a persistent free-text note panel under the status line. The note doubles as a FIFO prompt queue: write tasks naturally, checkpoint with `---`, then drip-feed prompts to the agent manually or with auto-run.

### The hook to lead with

Do **not** lead with "notes plugin". Lead with:

> Stop pasting the next prompt manually. Write the plan once, then run it as a prompt queue.

## Current state (evidence, 2026-07-02)

- Local dir already renamed: `~/Sites/omp-plan-queue`.
- `package.json` still `@aryrabelo/omp-free-text@0.2.0`; remote still `git@github.com:aryrabelo/omp-free-text.git`.
- Dependency `@aryrabelo/free-text-core` is `file:../free-text-core` — **not publicly installable**.
- Local tags: `v0.1.0`, `pre-core-refactor`. These belong to the old identity; the PlanQueue launch does not reference them.
- Repo hygiene already strong (carries over after rename): MIT LICENSE, README, CI (`.github/workflows/ci.yml`), SECURITY, CONTRIBUTING, CHANGELOG, issue/PR templates, `docs/open-source-standard.md`, `docs/launch-checklist.md`.

### Repo mechanism: rename vs fresh repo

Recommended: **rename the existing GitHub repo** `omp-free-text` → `planqueue`. GitHub auto-redirects old URLs and git remotes, and stars/issues carry over — this *is* the new repo, with zero link rot.

Alternative (only if Ary wants a truly clean slate): create `aryrabelo/planqueue` from scratch with squashed history, then archive `omp-free-text` with a pointer README. Costs redirects; gains a pristine history.

Either way, the release history is reset: delete or ignore old releases, cut PlanQueue `v0.1.0` as the first release on the new identity.

### External references used

- Open Source Guides — Starting a Project: <https://opensource.guide/starting-a-project/>
- Open Source Guides — Best Practices for Maintainers: <https://opensource.guide/best-practices/>
- GitHub Docs — Community profiles: <https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories>
- GitHub Docs — Renaming a repository (redirects): <https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository>
- OpenSSF — Concise Guide for Developing More Secure Software: <https://best.openssf.org/Concise-Guide-for-Developing-More-Secure-Software.html>
- LinkedIn Business — B2B video tips: <https://www.linkedin.com/business/marketing/blog/content-marketing/13-top-tips-for-compelling-b2b-video-content-on-linkedin>
- RepoClip — Promoting open-source projects: <https://repoclip.io/blog/5-ways-to-promote-your-open-source-project>
- daily.dev Business — OSS promotion channels: <https://business.daily.dev/resources/promote-open-source-project-proven-channels>
- DEV — GitHub stars launch playbook: <https://dev.to/livecycle/the-detailed-creative-playbook-for-more-github-stars-5fo5>

## What must not be done

Hard guardrails for every phase:

- Do not publish, tag, npm-release, rename the GitHub repo, change repository visibility, or post publicly without Ary's explicit approval.
- Do not push secrets, local auth files, private `.env`, tokens, API keys, private OMP logs, `.claude/state`, or local agent transcripts.
- Do not ship a public package that depends on a local path like `file:../planqueue-core` — the core must be published to npm or vendored before any public release.
- Do not claim "works everywhere" unless tested on a clean OMP install outside Ary's machine.
- Do not reference `omp-free-text`, `free-text-core`, or old version numbers in any public-facing artifact after the rebrand (README, npm, posts, video, screenshots). The only exception: a migration note for existing users of the old storage paths.
- Do not use upstream oh-my-pi Issues as marketing. Use Discord/showcase/discussion only where appropriate.
- Do not ask for fake/coordinated upvotes. Asking friends and relevant peers to check/star is fine; gaming platform algorithms is not.
- Do not include screenshots/video showing tokens, private repo names, client names, internal paths, or private Telegram/Herdr context.
- Do not invent OMP APIs. Any code-phase prompt must inspect installed `@oh-my-pi/pi-coding-agent` types.
- Do not over-govern the project early. Avoid councils/roadmaps/process weight before there is community pull.
- Do not position this as an OMP marketplace plugin unless marketplace extension loading is verified.

## Hermes Kanban Orchestrator blueprint

Task graph to create if Ary later says "comanda no Kanban". For now, this file is only the plan.

```text
T0  pm/researcher    launch thesis + risk audit
T1  maintainer       full PlanQueue rebrand implementation          parents: T0
T2  maintainer       distribution/release fix (core publish)        parents: T1
T3  maintainer       docs consistency + community health pass       parents: T1
T4  video/producer   demo asset + OpenVid promo plan                parents: T0
T5  writer           LinkedIn + X launch copy                       parents: T4
T6  reviewer         launch readiness review / no-public-actions    parents: T2,T3,T4,T5
T7  human gate       Ary approves repo rename + launch sequence     parents: T6
T8  distributor      launch-day execution checklist                 parents: T7
T9  analyst          post-launch metrics + follow-up plan           parents: T8
```

Kanban status model:

- `todo`: phase defined, not started.
- `ready`: all parent phases done.
- `running`: one agent is actively working.
- `review`: artifact exists and needs Ary/Juno review.
- `blocked`: needs human approval, external credential, or public side effect.
- `done`: artifact verified locally, no public action unless approved.

## Phase 0 — Launch thesis and scope

Goal: make the launch focused enough that every doc, video, and post repeats the same promise.

### Checklist

- [ ] Confirm the single name: **PlanQueue** on every surface (repo, package, paths, docs, posts).
- [ ] Confirm target user: OMP / terminal coding-agent users who lose context or manually paste sequential prompts.
- [ ] Confirm primary promise: "write the plan once, run it as a prompt queue."
- [ ] Confirm primary metric for first 48h: meaningful feedback + installs + stars, not just impressions.
- [ ] Confirm launch CTA: "star the repo, try install, reply with your OMP workflow pain."
- [ ] Confirm out of scope for launch: marketplace listing, huge docs site, paid ads, governance, multiple feature promises.

### Done means

One launch brief exists with: name, one-liner, ICP, core demo, CTA, risks, metrics.

### Superprompt for Claude Code `/goal`

```text
/goal
You are working in /Users/aryrabelo/Sites/omp-plan-queue.

Objective: create a concise launch brief for the open-source launch of PlanQueue (repo aryrabelo/planqueue, package @aryrabelo/planqueue).

Context:
- PlanQueue turns free-text notes into prompt queues for OMP coding agents.
- One name everywhere: PlanQueue. Never reference omp-free-text or free-text-core in public-facing text.
- This phase is strategy/docs only. Do not implement features, tag releases, publish npm, push commits, or post publicly.

Tasks:
1. Read README.md, package.json, CHANGELOG.md, docs/launch-checklist.md, docs/open-source-standard.md, CONTRIBUTING.md, SECURITY.md, and OPENSOURCE_PLAN.md.
2. Draft docs/launch-brief.md with: ICP, problem, promise, one-liner, 3 proof points, launch CTA, risks, non-goals, 48h metrics.
3. Include a short "message map" with 3 variants: technical, story-driven, and social-short.
4. Include an explicit "do not say" list to prevent overclaiming.

Verification:
- No code changes.
- No public side effects.
- Markdown links are valid relative paths.
- Final answer lists changed files only.

Stop and ask Ary before any public action or naming change.
```

## Phase 1 — Full PlanQueue rebrand

Goal: make the codebase, docs, and metadata 100% PlanQueue before anything else. This is the new launch blocker #1.

### Scope

Code and metadata:

- [ ] `package.json`: name → `@aryrabelo/planqueue`, description, repository/homepage/bugs URLs → `aryrabelo/planqueue`, keywords (`planqueue`, `prompt-queue`, drop `free-text`/`scratchpad` or keep as discovery aliases).
- [ ] Core package: rename `@aryrabelo/free-text-core` → `@aryrabelo/planqueue-core` (its own repo/dir `../planqueue-core`), update dependency name here.
- [ ] Storage root: new writes to `~/.planqueue/{repo}/{branch}/{session-id}.md`; read-fallback chain for existing users: `~/.free-text` then `~/.omp-free-text`. Config at `~/.planqueue/config.json` with the same fallback.
- [ ] Version reset: `package.json` → `0.1.0` for the fresh launch.
- [ ] Internal strings: widget title stays `PlanQueue` (already correct), log prefixes, error messages.

Docs and repo:

- [ ] README rewritten under the PlanQueue name — hook, install, usage, storage paths, migration note for old paths.
- [ ] AGENTS.md / src/AGENTS.md: update package name, install command, storage paths, DOX pass.
- [ ] SECURITY, CONTRIBUTING, CHANGELOG (fresh `## 0.1.0` entry; old entries dropped or collapsed into a "prior internal history" line).
- [ ] Issue templates: version fields and config path → `~/.planqueue/config.json`.
- [ ] `docs/launch-checklist.md`, `docs/open-source-standard.md`: names and URLs.
- [ ] GitHub (HUMAN GATE): rename repo to `planqueue`, update description, topics (`planqueue`, `prompt-queue`, `oh-my-pi`, `omp`, `coding-agent`, `tui`, `bun`), homepage.
- [ ] Local git remote updated after the rename.

### Done means

`grep -ri "free-text\|omp-free-text" --include="*.md" --include="*.json" --include="*.ts"` returns only the legacy-fallback code path and the explicit migration note. CI, lint, typecheck, tests green under the new name.

### Superprompt for Claude Code `/goal`

```text
/goal
You are working in /Users/aryrabelo/Sites/omp-plan-queue.

Objective: implement the full PlanQueue rebrand described in OPENSOURCE_PLAN.md Phase 1.

Read first: AGENTS.md, src/AGENTS.md, OPENSOURCE_PLAN.md, package.json, README.md, SECURITY.md, CONTRIBUTING.md, CHANGELOG.md, .github/ISSUE_TEMPLATE/*.yml, src/paths.ts, src/config.ts.

Tasks:
1. Rename package to @aryrabelo/planqueue, version 0.1.0, update all repo URLs and keywords.
2. Point the core dependency at @aryrabelo/planqueue-core (coordinate with the core repo rename; do not leave a broken file: path).
3. Move the storage root to ~/.planqueue with read-fallback from ~/.free-text and ~/.omp-free-text; same for config.json. Cover the fallback in unit tests.
4. Rewrite all docs, templates, and AGENTS files under the PlanQueue name. Add one migration note for old storage paths.
5. Reset CHANGELOG to a fresh 0.1.0 entry.

Constraints:
- Do not rename the GitHub repo, tag, publish, or push — those are HUMAN GATES.
- Do not invent OMP APIs; check installed @oh-my-pi/pi-coding-agent types.
- Follow the DOX pass in AGENTS.md after edits.

Verification:
- bun run lint, bun run typecheck, bun test all pass.
- grep for free-text/omp-free-text: only legacy-fallback code and the migration note remain.
- Final answer lists changed files.
```

## Phase 2 — Distribution and release

Goal: make the install path trustworthy before marketing sends people to it.

### Current red flags

- Dependency on `@aryrabelo/planqueue-core` (née `free-text-core`) is a local `file:` path. Any public git or npm install fails.
- No release exists under the PlanQueue identity yet.

### Options to decide

Pick exactly one before `v0.1.0`:

1. **Publish `@aryrabelo/planqueue-core` to npm** and depend on a semver range. *(Recommended.)*
2. **Monorepo/workspace release** if both packages live in one repo and the install path is tested.
3. **Vendor/inline the core** temporarily if speed matters more than package architecture.

Strong recommendation: **publish `planqueue-core` first, then cut `v0.1.0`**. Do not launch a campaign pointing at an install path that can fail.

### Checklist

- [ ] Core package published (or vendored) and dependency is installable.
- [ ] Test fresh git install (`omp plugin install github:aryrabelo/planqueue`) in a clean temp directory.
- [ ] Test fresh npm install path in a clean temp directory.
- [ ] Confirm package tarball excludes `src/AGENTS.md`, `.claude`, local logs, internal state.
- [ ] Confirm no `file:` dependency remains.
- [ ] `bun install --frozen-lockfile`, `bun run lint`, `bun run typecheck`, `bun test` pass.
- [ ] `package.json` 0.1.0, `CHANGELOG.md`, git tag `v0.1.0`, and GitHub Release agree.
- [ ] Release notes lead with the prompt-queue hook; no old-identity references.

### Done means

A verified clean-install path exists and the `v0.1.0` release is staged (not published) awaiting Ary's gate.

### Superprompt for Claude Code `/goal`

```text
/goal
You are working in /Users/aryrabelo/Sites/omp-plan-queue.

Objective: verify and prepare the public distribution story for PlanQueue v0.1.0.

Critical context:
- The dependency @aryrabelo/planqueue-core must be installable from npm (or vendored). A file: path breaks public installs.
- This is the first release under the PlanQueue identity; old omp-free-text releases are not referenced.

Tasks:
1. Inspect package.json, bun.lock, README.md, CHANGELOG.md, and every reference to planqueue-core.
2. Determine whether v0.1.0 is publicly installable from GitHub and npm in a clean environment; if you run install/test commands, use a temp directory and report exact output.
3. Produce docs/distribution-release-plan.md with one recommended path (publish core / monorepo / vendor) and concrete verification commands.
4. Stage release notes for v0.1.0.

Constraints:
- Do not publish packages, push tags, create GitHub releases, or modify repo settings.

Verification:
- The plan must include a clean-install verification checklist for both git and npm paths.
- The plan must explain why local file dependencies break public installs.
```

## Phase 3 — Docs consistency and community health

Goal: eliminate trust-killers before traffic arrives.

### Checklist

- [ ] Canonical storage language everywhere: "PlanQueue stores notes in `~/.planqueue`; legacy notes in `~/.free-text` / `~/.omp-free-text` are still read."
- [ ] SECURITY describes the real file I/O surface accurately (paths, no network, no telemetry).
- [ ] Issue templates collect OMP version, PlanQueue version, OS/terminal, repro, and reference `~/.planqueue/config.json`.
- [ ] `docs/launch-checklist.md` reconciled with the new identity: repo URL, package name, `v0.1.0`.
- [ ] Standalone `CODE_OF_CONDUCT.md` only if Ary wants the community-profile checkmark; inline CONTRIBUTING is acceptable but less visible.
- [ ] `docs/banner.png` / social preview after Phase 4 visual direction.
- [ ] README top 30 seconds sells the prompt queue, not just notes.

### Done means

A user coming from LinkedIn/X can answer in 30 seconds:

1. What does this do?
2. Why should I care?
3. How do I install it?
4. Is it safe/local?
5. What should I star/try/report?

### Superprompt for Claude Code `/goal`

```text
/goal
You are working in /Users/aryrabelo/Sites/omp-plan-queue.

Objective: docs consistency pass for the PlanQueue launch. Trust and clarity, not new features.

Read: AGENTS.md, OPENSOURCE_PLAN.md, README.md, SECURITY.md, CONTRIBUTING.md, CHANGELOG.md, docs/launch-checklist.md, docs/open-source-standard.md, .github/ISSUE_TEMPLATE/*.yml.

Tasks:
1. Find every mention of ~/.planqueue, ~/.free-text, and ~/.omp-free-text; make each one either "new writes to ~/.planqueue" or "legacy read fallback".
2. Ensure README, SECURITY, issue templates, and launch docs do not contradict each other on names, paths, or install commands.
3. Improve README above-the-fold so the prompt-queue hook appears before secondary details.
4. Do not add a standalone CODE_OF_CONDUCT unless you first explain the trade-off and mark it optional.

Constraints:
- No release/tag/publish/posting actions.
- Do not hide limitations; document them clearly.

Verification:
- Text-search all three storage roots after editing.
- Final answer lists changed docs and says whether AGENTS.md was updated or intentionally left unchanged with reason.
```

## Phase 4 — Demo asset and OpenVid promo

Goal: make the repo understandable in one glance.

### Demo narrative

Use this exact content spine:

1. "I keep losing the next prompt while working with coding agents."
2. "So I built PlanQueue for OMP."
3. Show note panel under status line.
4. Type 3 tasks + a `---` barrier.
5. Press queue key; first prompt sends.
6. Show pending/in-flight/done glyphs.
7. Toggle auto-run; show it stops at the barrier.
8. CTA: "Open-source. Star it, try it, tell me what your agent workflow needs."

### Assets checklist

- [ ] Raw recording: 60–90s clean screen recording, no private data, no old-identity paths visible.
- [ ] OpenVid export: 30–45s polished social video.
- [ ] README GIF: short loop showing note → queue → done.
- [ ] Social preview image: 1200×630-ish card with PlanQueue tagline.
- [ ] LinkedIn vertical/native version: 9:16 or square if using mobile-first feed.
- [ ] X version: short video/GIF, starts with the UI/result in first second.
- [ ] Thumbnail: readable at small size, not a dense terminal screenshot.
- [ ] Alt text/caption for accessibility.

### OpenVid workflow

- Record raw once.
- Import into OpenVid: <https://github.com/CristianOlivera1/openvid> / <https://openvid.dev>.
- Add background, focus zooms, optional frame.
- Export short first; do not over-polish before testing.

### Done means

One demo asset suitable for README + social launch. Perfect is not required; clarity is.

### Superprompt for Claude Code `/goal`

```text
/goal
You are working in /Users/aryrabelo/Sites/omp-plan-queue.

Objective: create a demo asset plan and recording script for PlanQueue. Scripts/checklists only; do not record or edit video unless Ary explicitly asks.

Context:
- Preferred promo workflow is OpenVid: record raw, add background/zooms/frames, export 30–45s.
- Lead with outcome, not installation.
- The recording must show the ~/.planqueue identity; no omp-free-text paths, no private data.

Deliverables:
1. docs/demo-script.md: 30–45s social script, 60–90s raw shot list, exact demo note content, keys/actions to show, redaction checklist.
2. docs/video-asset-checklist.md: README GIF, LinkedIn video, X video, social preview, thumbnail, alt text.
3. README insertion plan: where the GIF/video appears and its caption.

Constraints:
- Do not open external browsers, record screen, or edit README yet.
- No private project/client data in examples.

Verification:
- Demo script fits in 45 seconds read aloud.
- First 5 seconds show the problem/result, not install steps.
```

## Phase 5 — LinkedIn and X launch copy

Goal: channel-native posts, not generic AI launch fluff.

### LinkedIn strategy

Story + demo + practical value:

- Native video, 30–60s.
- First line hook: "I got tired of manually pasting the next prompt into coding agents."
- Short story: why this exists.
- 3 bullets: what it does.
- CTA: star/try/reply with workflow pain.
- Optional comment: install command and repo link; body should still include the repo if discoverability matters.

LinkedIn video guardrails (from LinkedIn's own B2B guidance): strong content in the opening seconds; plan for mobile; captions/subtitles (many watch muted); 15–30s for top-of-funnel, under 2 min for deeper posts.

### X strategy

Compressed and visual-first:

- First post: video/GIF + one-line promise + repo link.
- Thread: 5–7 posts max.
- Install command in tweet 2 or 3.
- Show the key workflow: note → queue → barrier → auto-run.
- Tag upstream/people only if relevant and respectful. Do not spam.

### Content variants

- [ ] Launch post — broad dev audience.
- [ ] Technical thread — how prompt queue state works.
- [ ] "Build in public" post — why I made it.
- [ ] Short video caption — for OpenVid export.
- [ ] Reply macros — answer likely questions fast.
- [ ] Follow-up post — "what I learned from launching".

### Done means

All launch copy ready; nothing posted until Ary approves.

### Superprompt for Claude Code `/goal`

```text
/goal
You are working in /Users/aryrabelo/Sites/omp-plan-queue.

Objective: draft launch copy for LinkedIn and X for PlanQueue (@aryrabelo/planqueue). Do not post anything.

Read: OPENSOURCE_PLAN.md, README.md, docs/demo-script.md if present, docs/launch-checklist.md, CHANGELOG.md.

Messaging rules:
- One name: PlanQueue. Repo aryrabelo/planqueue. Never mention omp-free-text.
- Lead with prompt queue, not generic notes.
- Be honest about limitations and OMP scope.
- CTA: star, try install, reply with workflow pain.
- Avoid hype claims like "revolutionary", "perfect", "works everywhere".

Deliverables:
1. docs/launch-copy.md with:
   - LinkedIn launch post, 2 variants: story-driven and technical.
   - X launch thread, 5–7 tweets max.
   - Short standalone X post with video.
   - Discord/showcase message for the oh-my-pi community.
   - 6 reply macros for likely questions.
   - 3 follow-up posts for D+1/D+3/D+7.
2. Placeholders for repo URL, video URL, GIF path, install command.
3. Final "human approval required before posting" checkbox.

Constraints:
- Do not post. No external browser automation. Tags marked optional and respectful.

Verification:
- Install command exactly once per channel.
- First line of each post understandable without context.
- One CTA per post.
```

## Phase 6 — Launch readiness review

Goal: stop one step before public launch and force a hard review.

### Checklist

- [ ] Repo renamed/created as `aryrabelo/planqueue` (HUMAN GATE done).
- [ ] Fresh install from GitHub works.
- [ ] Fresh install from npm works, or npm path is intentionally not promoted.
- [ ] CI green after final changes.
- [ ] README demo visible above fold.
- [ ] SECURITY claims match actual behavior.
- [ ] LICENSE/package metadata consistent under the new name.
- [ ] No secret/private-data scan findings in tracked files.
- [ ] No `omp-free-text`/`free-text-core` residue outside legacy-fallback code + migration note.
- [ ] GitHub repo description/topics/homepage/social preview set.
- [ ] GitHub community profile reviewed; gaps accepted or fixed.
- [ ] `v0.1.0` release/tag staged.
- [ ] LinkedIn/X/Discord copy approved by Ary.
- [ ] Demo asset approved by Ary.
- [ ] Rollback plan: if install breaks, pin users to a known-good tag.

### Done means

A go/no-go memo says **GO**, **NO-GO**, or **GO with caveats**.

### Superprompt for Claude Code `/goal`

```text
/goal
You are working in /Users/aryrabelo/Sites/omp-plan-queue.

Objective: launch readiness review + go/no-go memo for PlanQueue v0.1.0. Read-only inspections and local verification only; do not publish/tag/post/rename.

Read: OPENSOURCE_PLAN.md, README.md, package.json, CHANGELOG.md, SECURITY.md, CONTRIBUTING.md, docs/*.md, .github/* templates/workflows.

Checks:
1. Git status, branch, and remote (should point at aryrabelo/planqueue after the rename gate).
2. Package metadata and dependency installability.
3. README/SECURITY consistency.
4. Community health files.
5. CI workflow coverage.
6. Secret/private-data risk in tracked files.
7. Old-identity residue scan (omp-free-text / free-text-core).
8. Fresh install verification plan/results if safe to run.
9. Release/version alignment (0.1.0 everywhere).
10. Launch copy/demo asset readiness.

Deliverable:
- docs/launch-readiness-review.md: verdict, blockers, accepted risks, exact commands run, outputs summarized, Ary approval gates, launch sequence if GO.

Constraints:
- No npm publish, no tags, no GitHub releases, no posting. Anything needing credentials or a public side effect is a HUMAN GATE.

Verification:
- Memo must be brutally honest. If install cannot be verified, verdict cannot be full GO.
```

## Phase 7 — Launch day sequence

Goal: concentrate attention without spamming.

### Recommended sequence

T-24h:

- [ ] Final go/no-go review.
- [ ] Freeze launch branch.
- [ ] Approve video/copy.
- [ ] Prepare links and screenshots.

T-0:

- [ ] Repo rename + `v0.1.0` release/tag published (HUMAN GATES).
- [ ] Confirm install command works from a fresh environment.
- [ ] README/social preview final.
- [ ] Post LinkedIn native video.
- [ ] Post X video/thread.
- [ ] Share in oh-my-pi Discord showcase/community channel.

T+1h:

- [ ] Reply to every real comment/question.
- [ ] Pin/save best feedback.
- [ ] Open issues for real bugs; do not fix in comments only.

T+24h:

- [ ] Post technical follow-up: how the queue works.
- [ ] Share first learnings/feedback.
- [ ] Decide whether to do dev.to / Show HN / Reddit.

T+7d:

- [ ] Publish changelog/fixes.
- [ ] Write "what I learned launching PlanQueue".
- [ ] Update roadmap from real feedback.

### Done means

Launch happened with replies handled and feedback converted into issues/notes.

### Superprompt for Claude Code `/goal`

```text
/goal
You are working in /Users/aryrabelo/Sites/omp-plan-queue.

Objective: prepare a launch-day runbook for PlanQueue. Do not execute public launch steps.

Read: OPENSOURCE_PLAN.md, docs/launch-readiness-review.md if present, docs/launch-copy.md if present, docs/demo-script.md if present, README.md, CHANGELOG.md.

Deliverable:
- docs/launch-day-runbook.md with:
  - T-24h, T-0, T+1h, T+24h, T+7d checklist.
  - Exact human gates (repo rename, tag, npm publish, each post).
  - Which link goes where.
  - Reply/triage protocol.
  - "If install breaks" emergency response.
  - "If post gets traction" response plan.
  - "If post flops" follow-up plan.

Constraints:
- Do not publish, post, tag, rename, or push. Copy-paste commands only as fenced snippets labeled HUMAN-RUN.

Verification:
- Every public side effect has an explicit Ary approval checkbox.
- The runbook is usable without reading this whole plan.
```

## Phase 8 — Post-launch learning loop

Goal: turn launch attention into product direction.

### Checklist

- [ ] Track stars, forks, repo traffic, npm downloads, comments, install failures, issues, PRs.
- [ ] Categorize feedback: install friction, UX confusion, feature request, bug, docs confusion, praise.
- [ ] Convert high-signal feedback into GitHub issues.
- [ ] Close/redirect out-of-scope requests politely using README non-goals.
- [ ] Ship one small fix fast if a real blocker appears.
- [ ] Publish follow-up showing responsiveness.
- [ ] Update OPENSOURCE_PLAN or launch docs with learnings.

### Done means

The launch created a feedback loop, not just a post.

### Superprompt for Claude Code `/goal`

```text
/goal
You are working in /Users/aryrabelo/Sites/omp-plan-queue.

Objective: create a post-launch learning report template and triage process for PlanQueue.

Inputs to ask Ary for if missing:
- LinkedIn post URL
- X post URL
- GitHub traffic screenshot/export
- npm download data if available
- Notable comments/replies

Deliverables:
1. docs/post-launch-report-template.md: metrics, qualitative feedback, issue links, decisions, next release candidates.
2. docs/feedback-triage.md: categories and response macros.
3. Optional GitHub issue labels proposal; do not create labels unless Ary approves.

Constraints:
- Do not scrape private accounts, post replies, or create issues unless Ary asks.
- Keep contributor/community tone respectful and clear.

Verification:
- Template distinguishes facts, interpretation, and next actions.
- Every proposed follow-up maps to a GitHub issue, docs change, or explicit no-action decision.
```

## Launch content drafts — starting point

### LinkedIn draft

```text
I got tired of manually pasting the next prompt into coding agents.

So I built PlanQueue: an open-source OMP extension that turns a free-text note into a prompt queue.

Write the plan once:
- tasks become queued prompts
- `---` becomes a human review checkpoint
- auto-run drains the queue until it needs you
- notes persist per repo / branch / session

It started as a scratchpad. The useful part became the queue.

Repo: https://github.com/aryrabelo/planqueue
Install: `omp plugin install github:aryrabelo/planqueue`

If you use terminal coding agents, I'd love feedback: where does your workflow lose context?
```

### X thread draft

```text
1/ I built PlanQueue: an open-source OMP extension that turns free-text notes into a prompt queue for coding agents.

Write the plan once. Drain it step by step. Pause at human checkpoints.

https://github.com/aryrabelo/planqueue

[attach demo video/GIF]

2/ The note panel lives under the OMP status line.

Plain lines become queued prompts.
`---` becomes a human-in-the-loop barrier.
Done prompts get marked off.

3/ Why I built it:

I kept losing the "next prompt" while working with agents.
A TODO list was too passive.
A fully autonomous loop was too risky.

I wanted a queue I could see, edit, and stop.

4/ Install:

`omp plugin install github:aryrabelo/planqueue`

or npm:

`omp plugin install @aryrabelo/planqueue`

5/ It is intentionally small:

- local markdown files
- no telemetry
- no network calls
- MIT licensed
- built for OMP workflows

6/ If you use OMP or terminal coding agents, try it and tell me:

Where do your agent sessions lose context?

Stars/issues/PRs welcome.
```

## Open questions for Ary

- [ ] Repo mechanism: rename `omp-free-text` → `planqueue` (keeps redirects/stars, recommended) or brand-new repo with fresh history?
- [ ] Repo spelling: `planqueue` (recommended) or `plan-queue`?
- [ ] Storage root: hard-cut to `~/.planqueue` with legacy read fallback, or migrate old files on first run?
- [ ] Launch language: English-only for global dev audience, or bilingual LinkedIn PT-BR + X English?
- [ ] Standalone `CODE_OF_CONDUCT.md` for the community-profile checkmark?
- [ ] First demo: real workflow or clean fake repo?

## Next action

Start with **Phase 1 (rebrand)**, then Phase 2 (publish `planqueue-core`) before any marketing.

Reason: no amount of LinkedIn/X polish saves a launch if the public identity is inconsistent or the install path breaks on `file:../planqueue-core`.
