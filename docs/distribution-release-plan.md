# PlanQueue — distribution and release plan (v0.1.0)

Scope: how PlanQueue becomes trustworthy to install from a clean machine, and
how `v0.1.0` is staged for release. This covers OPENSOURCE_PLAN.md **Phase 2**
only. No package is published, no tag is cut, and no `package.json` is edited by
this document — every side-effecting command is marked **HUMAN GATE** and lives
in a `HUMAN-RUN` fenced block for a person to run and approve.

## The problem, stated once

The app (`@aryrabelo/planqueue`) declares its one runtime dependency as:

```json
"dependencies": {
  "@aryrabelo/planqueue-core": "file:../planqueue-core"
}
```

A `file:` specifier is an absolute/relative **path on the author's disk**. It
resolves only because `../planqueue-core` exists next to this repo on Ary's
machine. On any consumer machine that path does not exist, so:

- `omp plugin install github:aryrabelo/planqueue` clones the repo and runs an
  install — the install tries to resolve `file:../planqueue-core`, finds
  nothing, and fails. The plugin never loads.
- `omp plugin install @aryrabelo/planqueue` (npm) is worse: npm will not even
  publish a package that carries a `file:` dependency in a normal flow, and if
  one leaked through, the consumer install fails identically — there is no
  sibling `planqueue-core` directory in the npm cache.

So the core must be resolvable **from a registry** before any marketing points a
stranger at the install command. That is the entire release blocker.

## Recommendation — exactly one path

**Publish `@aryrabelo/planqueue-core` to npm, then switch the app dependency to a
semver range (`^0.1.0`).** Nothing else ships until that is done.

Rationale: the two packages already live in **separate git repos** and separate
directories (`../planqueue-core` is its own repo, already renamed on disk, its
`package.json` already `@aryrabelo/planqueue-core@0.1.0` with
`publishConfig.access: "public"`). A registry dependency is the only form that
resolves identically for the git-install path and the npm-install path, on a
machine that has never seen this filesystem. It also keeps the app's own tarball
small — the core is pulled from npm, not vendored into the app.

### Alternatives considered (and why not)

- **Monorepo / workspaces.** Move both packages into one repo and use a
  workspace protocol. Why not: they are already two repos with two histories;
  merging them now is churn on launch day, and OMP plugin install still needs the
  core resolvable at install time — a workspace protocol does not help a consumer
  who installs only the app.
- **Vendor / inline the core.** Copy `planqueue-core/src` into the app and drop
  the dependency. Why not: duplicates source across two repos, so every core fix
  needs a manual re-copy, and it contradicts the deliberate app/core split. Keep
  it only as an emergency lever if npm publish is blocked and launch cannot slip.
- **git dependency (`github:aryrabelo/planqueue-core`).** Depend on the core's
  git URL instead of npm. Why not: it makes the npm-install path pull from GitHub
  at install time (slower, needs git, no immutable version), and defeats the
  point of a clean `@aryrabelo/planqueue` npm package.

## Pre-publish checklist — `@aryrabelo/planqueue-core`

Do this in `/Users/aryrabelo/Sites/planqueue-core` before any publish.

1. **Inspect the exact tarball contents** (no publish, no network side effect):

   ```HUMAN-RUN
   cd /Users/aryrabelo/Sites/planqueue-core
   npm pack --dry-run
   ```

   Expected: a `Tarball Contents` listing that includes `src/*.ts` (widget,
   stats, index, store, paths, config, editor, queue), `README.md`,
   `CHANGELOG.md`, `LICENSE`, `package.json`. It MUST **exclude** everything
   under `tests/` and every `src/**/*.test.ts`, and exclude `OPEN-SOURCE-PLAN.md`,
   `tsconfig.json`, `biome.json`, `.github/`, `bun.lock`, `.gitignore`. If a test
   file or plan doc appears, fix the `files` field before continuing.

2. **Confirm the `files` field is tight.** Current field is
   `["src", "!src/**/*.test.ts", "README.md", "CHANGELOG.md", "LICENSE"]`.
   Because the package ships raw TypeScript (`exports: "./src/index.ts"`), the
   consumer's bundler compiles it — this is intended and matches the description
   ("bundler-compatible with Node.js"). Verify `type: "module"`,
   `sideEffects: false`, and `publishConfig.access: "public"` are all present
   (they are).

3. **README present and self-contained.** The core README must stand on its own
   on the npm page — describe what the package is (pure PlanQueue logic) and that
   the user-facing product is the `@aryrabelo/planqueue` OMP extension. No
   `free-text-core` / `omp-free-text` references.

4. **Version is `0.1.0`** and the CHANGELOG has a matching `## 0.1.0` entry.

5. **Dry-run the publish** to see the registry-side view without publishing:

   ```HUMAN-RUN
   cd /Users/aryrabelo/Sites/planqueue-core
   npm publish --dry-run --access public
   ```

   Expected: same file list as `npm pack --dry-run`, package name
   `@aryrabelo/planqueue-core@0.1.0`, access `public`, and no error about a
   private package or an already-taken version.

6. **HUMAN GATE — publish the core.** Only after 1–5 pass and Ary approves:

   ```HUMAN-RUN
   cd /Users/aryrabelo/Sites/planqueue-core
   npm publish --access public
   ```

   Expected: `+ @aryrabelo/planqueue-core@0.1.0`. Verify it is live:

   ```HUMAN-RUN
   npm view @aryrabelo/planqueue-core version
   ```

   Expected: `0.1.0`.

## App-side dependency flip

Only after the core is live on npm. These edits are staged by a human (this doc
does not edit `package.json`).

1. In `/Users/aryrabelo/Sites/omp-plan-queue/package.json`, change the dependency
   from the `file:` path to a caret range on the published version:

   ```json
   "dependencies": {
     "@aryrabelo/planqueue-core": "^0.1.0"
   }
   ```

   `^0.1.0` accepts `0.1.x` patch updates but not `0.2.0` — correct for a `0.x`
   package where minor bumps may break. Bump the floor when depending on a new
   core feature.

2. Refresh the lockfile so `bun.lock` records the registry resolution instead of
   `@aryrabelo/planqueue-core@file:../planqueue-core`:

   ```HUMAN-RUN
   cd /Users/aryrabelo/Sites/omp-plan-queue
   bun install
   ```

   Expected: `bun.lock` now lists `@aryrabelo/planqueue-core@0.1.0` resolved from
   the registry (with an integrity hash), and no remaining `file:` specifier.

3. Confirm no `file:` dependency survives anywhere:

   ```HUMAN-RUN
   cd /Users/aryrabelo/Sites/omp-plan-queue
   grep -R "file:../planqueue-core" package.json bun.lock
   ```

   Expected: no matches (exit code 1).

4. Re-run the gates:

   ```HUMAN-RUN
   cd /Users/aryrabelo/Sites/omp-plan-queue
   bun install --frozen-lockfile
   bun run lint
   bun run typecheck
   bun test
   ```

   Expected: install resolves against the frozen lockfile, lint/typecheck clean,
   all tests pass.

## Clean-install verification — both paths

Run these from a throwaway `mktemp` directory so nothing touches Ary's real
config or the working repos. Both paths assume the core is already published and
the app dep is flipped to `^0.1.0`.

### Path A — git install

```HUMAN-RUN
WORK="$(mktemp -d)"
cd "$WORK"
omp plugin install github:aryrabelo/planqueue
```

Expected: the clone + install completes with no `file:` resolution error, the
core is pulled from npm as a transitive dependency, and OMP reports the PlanQueue
plugin installed. Then sanity-check the extension loads:

```HUMAN-RUN
omp plugin list
```

Expected: `@aryrabelo/planqueue` appears in the installed list. Clean up:

```HUMAN-RUN
omp plugin uninstall @aryrabelo/planqueue
rm -rf "$WORK"
```

### Path B — npm install

```HUMAN-RUN
WORK="$(mktemp -d)"
cd "$WORK"
omp plugin install @aryrabelo/planqueue
```

Expected: npm resolves `@aryrabelo/planqueue@0.1.0` and its
`@aryrabelo/planqueue-core@^0.1.0` dependency from the registry, install
succeeds, plugin loads. Confirm and clean up:

```HUMAN-RUN
omp plugin list
omp plugin uninstall @aryrabelo/planqueue
rm -rf "$WORK"
```

If either path errors on `@aryrabelo/planqueue-core`, the core publish or the
dependency flip is incomplete — stop and fix before release.

### Independent tarball check for the app (optional, no publish)

```HUMAN-RUN
cd /Users/aryrabelo/Sites/omp-plan-queue
npm pack --dry-run
```

Expected: `src` minus `src/AGENTS.md`, plus `README.md`, `CHANGELOG.md`,
`LICENSE`. No `.claude`, no local logs, no internal state, no `file:` artifacts.

## Staged release notes — v0.1.0

Staged only. Do not create the tag or GitHub Release until the install paths
above are green and Ary approves.

- **HUMAN GATE — tag `v0.1.0`:**

  ```HUMAN-RUN
  cd /Users/aryrabelo/Sites/omp-plan-queue
  git tag -a v0.1.0 -m "PlanQueue v0.1.0 — first public release"
  git push origin v0.1.0
  ```

- **HUMAN GATE — GitHub Release:** create the release from tag `v0.1.0` with the
  notes below.

---

### PlanQueue v0.1.0 — first public release

**Stop pasting the next prompt manually. Write the plan once, then run it as a
prompt queue.**

PlanQueue is an open-source OMP extension that adds a persistent free-text note
panel under the status line. The note doubles as a FIFO prompt queue: write your
tasks naturally, checkpoint with a `---` human-in-the-loop barrier, then
drip-feed prompts to the agent one step at a time — manually or with auto-run.

**Install**

```
omp plugin install github:aryrabelo/planqueue
```

or from npm:

```
omp plugin install @aryrabelo/planqueue
```

**What's in it**

- A note panel below the status line, persisted per repo / branch / session at
  `~/.planqueue/{repo}/{branch}/{session-id}.md`.
- Prompt queue: checkbox lines (`- [ ]` todo, `- [>]` running, `- [x]` done)
  feed to the agent in order; `---` marks a barrier where PlanQueue waits for you.
- Keyboard: `Ctrl+N` edit the note, `Ctrl+↓` queue the next step,
  `Ctrl+Shift+↓` toggle auto-run.
- Config at `~/.planqueue/config.json`.
- Existing notes are still read from the legacy roots `~/.free-text` then
  `~/.omp-free-text` (read-only fallback); all new writes go to `~/.planqueue`.

**Scope (honest)**

First public release. Local file I/O only — no network, no telemetry. Verified
on clean OMP installs via the git and npm install paths. Not a marketplace
listing. Feedback and issues welcome.

---

## Definition of done

A clean-install path exists and is verified for **both** git and npm, no `file:`
dependency remains anywhere, and the `v0.1.0` release is fully staged (tag +
notes drafted) awaiting Ary's gates on: (1) core npm publish, (2) app dep flip,
(3) tag/release. No publish, tag, or release is executed by this plan.
