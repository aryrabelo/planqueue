# Launch readiness review — PlanQueue v0.1.0

Date: 2026-07-02
Scope: full rebrand + launch-artifact execution of `OPENSOURCE_PLAN.md` (Phases 0–8 artifacts, Phase 1 implementation).
Verification: implementer-run gates plus an independent maker-checker verifier subagent (different agent than the implementers).

## Verdict

**GO with caveats.** All local work is done and verified. The launch itself is blocked only by the HUMAN GATES below — chiefly: the public install path does not work until `@aryrabelo/planqueue-core` is published to npm and the app dependency is flipped off `file:../planqueue-core`.

## Verified locally (evidence in session transcript)

| Check | Result |
|---|---|
| App `bun install --frozen-lockfile` | OK |
| App `bun run lint` (biome) | clean |
| App `bun run typecheck` (tsc) | clean |
| App `bun test` | 1 pass / 0 fail |
| Core `bun install --frozen-lockfile` | OK |
| Core `bun run lint` / `bun run typecheck` | clean |
| Core `bun test` | 171 pass / 0 fail (244 expects) |
| Residue grep (`omp-free-text\|free-text-core`) both repos | only legacy-fallback code, labeled migration notes, and plan/RUN-LOG history |
| 8 launch artifacts in `docs/` | all present |
| Runbook ARY APPROVAL gates | 7 (≥4 required, all categories covered) |
| Launch copy approval checkbox | present, unchecked; install command once per channel |

## Independent verifier findings — all resolved

The maker-checker verifier initially returned **FAIL** on three deviations; each was fixed and re-verified green:

1. `src/main.ts` `pi.setLabel("Free Text Notes")` → now `pi.setLabel("PlanQueue")` (was the user-visible plugin label).
2. `export default freeTextExtension` → renamed `planQueueExtension`.
3. Core `CHANGELOG.md` 0.1.0 entry described the old identity → reset to a fresh `[0.1.0]` PlanQueue-core entry with prior history collapsed (core was never published, so no public history is lost).

## Launch blockers resolved during this execution

- `@oh-my-pi/pi-coding-agent@16.3.2` (what any fresh install resolves from `^16.0.0`) broke `tsc` with TS2589 on `pi.registerTool` inference. Fixed with explicit type arguments (`pi.registerTool<ZodType<…>>`); a fresh public install would have hit this.
- Both `bun.lock` files still carried old workspace names; regenerated.
- Storage root migrated to `~/.planqueue` with a two-root read-only legacy fallback chain, covered by unit tests (core suite grew 163 → 171).

## Accepted risks

- **Dependency resolutions floated** during lockfile regeneration (biome 2.5.2, pi packages 16.3.2). This mirrors what a fresh install gets; gates are green against these versions.
- **Clean-machine install untested.** `omp plugin install github:aryrabelo/planqueue` cannot succeed for the public until the core is on npm (the `file:` dep only resolves on this machine). Verification checklist lives in `docs/distribution-release-plan.md`.
- **GitHub repo rename mechanism** (rename vs fresh repo) is an open question for Ary; rename is recommended (redirects preserved).

## HUMAN GATES — nothing below is executed by automation

1. [ ] ARY: rename GitHub repos `omp-free-text` → `planqueue`, `free-text-core` → `planqueue-core` (or decide fresh-repo alternative).
2. [ ] ARY: `npm publish` `@aryrabelo/planqueue-core` (commands in `docs/distribution-release-plan.md`, HUMAN-RUN).
3. [ ] ARY: flip app dep `file:../planqueue-core` → `^0.1.0`, re-run gates, verify clean install per distribution plan.
4. [ ] ARY: tag + GitHub release `v0.1.0`.
5. [ ] ARY: approve demo asset (record per `docs/demo-script.md`).
6. [ ] ARY: approve and post LinkedIn / X / Discord copy (`docs/launch-copy.md`).

## Launch sequence if GO

Follow `docs/launch-day-runbook.md` (T-24h → T+7d). Gate order: publish core → dep flip + clean-install verification → repo rename → tag/release → posts.
