# RUN-LOG — OPENSOURCE_PLAN.md execution

State file for the goal loop. Re-read at the start of each round; write at the end.

## Status

- Turn: 2
- Current: fixing TS2589 in src/main.ts (verified fix in hand), then verifier + readiness memo + commits.

## Done

- [x] Risk gate: only consumer of free-text-core in ~/Sites/*/package.json is this repo. Safe to rename dir.
- [x] User WIP preserved as commit 59a7d95 (`feat: rename /notes command to /planqueue and harden lifecycle error paths`).
- [x] Core dir renamed: `~/Sites/free-text-core` → `~/Sites/planqueue-core`; package renamed `@aryrabelo/planqueue-core`; app dep + imports updated.
- [x] Wave 1 (7 subagents) complete:
  - StorageRebrand: `.planqueue` root + `LEGACY_ROOT_DIR_NAMES` chain (`.free-text`, `.omp-free-text`), new `legacyNotePathsFor`/`legacySessionsDirsFor`/`legacyConfigPathsFor`, `loadNoteWithFallback(newPath, legacyPaths[])`; app wiring migrated; core 171 pass.
  - AppDocsRebrand: package.json `@aryrabelo/planqueue@0.1.0`, README/SECURITY/CONTRIBUTING/CHANGELOG(0.1.0 reset)/templates/AGENTS/launch-checklist/open-source-standard rebranded; migration note canonical in README Storage.
  - LaunchBrief / DistributionPlan / DemoAssets / LaunchCopy / RunbookPostLaunch: all 8 launch artifacts written under docs/.
- [x] Stale core `OPEN-SOURCE-PLAN.md` deleted (app repo never had one).
- [x] Lockfiles regenerated (both repos) — workspace names now `@aryrabelo/planqueue` / `@aryrabelo/planqueue-core`; `bun install --frozen-lockfile` OK both.
- [x] Core tempdir test prefix `omp-free-text-` → `planqueue-`.
- [x] Residue grep both repos: only legacy-fallback code, labeled migration notes, and plan/RUN-LOG evidence remain.
- [x] Core gates green: lint/typecheck clean, 171 pass / 0 fail.

## In flight

- [ ] TS2589 in app `src/main.ts:268` — caused by lockfile regen bumping `@oh-my-pi/pi-coding-agent` to 16.3.2, whose `Static<TParams>` conditional type explodes on reverse inference from annotated `execute` params. Real launch blocker: any fresh public install resolves `^16.0.0` → 16.3.2. Verified fix (scratch experiment): explicit type argument `pi.registerTool<ZodType<{...}>>(...)` compiles clean. Applying to both callsites (note_add line 268, make_note line 322) + type-only `import type { ZodType } from "zod"` + zod devDep.

## Pending

- [ ] App gates green after fix (lint/typecheck/test).
- [ ] Maker-checker verifier subagent (PASS/FAIL in transcript).
- [ ] docs/launch-readiness-review.md (GO/NO-GO memo, ≥4 HUMAN GATEs).
- [ ] Commits (Conventional Commits, explicit staging) both repos; final report.

## HUMAN GATES (never executed by the loop)

1. GitHub repo rename `omp-free-text` → `planqueue` and `free-text-core` → `planqueue-core`
2. npm publish `@aryrabelo/planqueue-core`
3. Tag/release `v0.1.0`
4. Every social post (LinkedIn/X/Discord)
5. App dep flip `file:../planqueue-core` → `^0.1.0` (after core publish)

## NOTES (opportunistic extras — never committed without approval)

- Lockfile regen bumped in-range resolutions (biome 2.5.2, pi-coding-agent 16.3.2, pi-tui 16.3.2). This is what a fresh install gets; keeping them is the honest launch posture.
