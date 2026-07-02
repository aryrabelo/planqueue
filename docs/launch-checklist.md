# Launch checklist — going public

Everything left before `@aryrabelo/planqueue` is public at
[Tapa-standard](./open-source-standard.md) parity, plus how to publicize it.

Source: the OPENSOURCE_PLAN.md rebrand plan, a review of the working tree, and
the OMP ecosystem.

**Bottom line:** the in-tree PlanQueue rebrand is done and the gate is green
(`bun run lint && bun run typecheck && bun test`). What remains before public
launch are the human gates — GitHub repo rename, npm publish of the core and the
plugin, and cutting the `v0.1.0` tag/release — plus a demo asset. No prior
release under the old identity is promoted; PlanQueue `v0.1.0` is the first
public release.

## Legend

- 🔴 blocker — must be done to launch
- 🟡 nice-to-have — improves launch, not required
- 🧑 human-run — needs GitHub UI / credentials the agent does not have
- ✅ agent-doable — in-tree, no special access

---

## 1. GitHub settings (🧑 human — none visible from the working tree)

These are HUMAN GATES — none are done yet; do them at launch after Ary approves.

- [ ] 🔴 🧑 **Rename the GitHub repo to `planqueue`** (and the core repo to
  `planqueue-core`). GitHub auto-redirects old URLs and remotes; stars/issues
  carry over. Update the local git remote afterward.
- [ ] 🔴 🧑 **Set repo description** to the package.json description.
- [ ] 🔴 🧑 **Add topics:** `planqueue`, `prompt-queue`, `oh-my-pi`, `omp`,
  `coding-agent`, `tui`, `bun`.
- [ ] 🔴 🧑 **Cut an annotated `v0.1.0` tag + GitHub Release** on the PlanQueue
  identity. Release notes lead with the prompt-queue hook; no old-identity
  references.
- [ ] 🟡 🧑 **Social-preview image** for clean cards on X / dev.to / Discord.
  Settings → Social preview. (Also closes the standard's banner gap — see §3.)
- [ ] 🟡 🧑 **Set homepage URL** — package.json has one; the repo `homepageUrl`
  should match.

## 2. Distribution (🧑 human — needs npm creds)

- [ ] 🔴 🧑 **Publish `@aryrabelo/planqueue-core` to npm**, then repoint the
  plugin dependency off the local `file:../planqueue-core` path. A `file:` path
  breaks any public install — see [`distribution-release-plan.md`](./distribution-release-plan.md).
- [ ] 🔴 🧑 **`npm publish --access public`** the plugin at `v0.1.0`, enabling the
  second install path `omp plugin install @aryrabelo/planqueue`. Confirm the
  tarball excludes `src/AGENTS.md`, `.claude`, and local state.
- [ ] ⚠️ **Do NOT pursue the OMP marketplace.** This plugin delivers behavior via
  `omp.extensions`, which marketplace catalog installs **do not load** (they only
  surface skills/commands/agents/hooks). A marketplace listing would let users
  "install" something that silently does nothing. The git/npm install path is the
  only correct distribution.

## 3. In-tree (✅ agent-doable)

- [x] ✅ **Fix `open-source-standard.md` factual errors** (done 2026-06-22). The
  doc misdescribed the `tapa-rs` reference: claimed Tapa ships no weekly build
  (it ships `weekly.yml`), omitted Tapa's size-budget gate, and framed
  `THIRD-PARTY-LICENSES.md` as conditional when Tapa ships it as baseline. The
  PlanQueue N/A verdicts stand; the justifications are corrected.
- [ ] 🟡 ✅ **Add a demo GIF/screenshot above the fold in README.** The panel +
  prompt-queue is the differentiated hook; a moving image sells it. (Needs a
  recorded asset first.)
- [ ] 🟡 ✅ **Banner/logo image** (`docs/banner.png` equivalent) — the standard's
  only open in-tree item. Pairs with the social-preview image (§1).
- [ ] 🟢 ✅ **lefthook pre-push hooks** (post-launch). CI already enforces the
  gate; hooks only shift it left. Worthwhile as contributors grow, not a blocker.

## 4. N/A for this project type (tracked, not blockers)

A source-installed extension with no compiled artifact. Confirmed by audit:

- THIRD-PARTY-LICENSES.md — no bundling step; ships only `src/`.
- Release/weekly build workflows — no artifact to build or attach.
- Artifact size-budget gate — no artifact.
- `dependabot.yml` — tiny dep tree; CI `bun audit` job already covers hygiene.
- `FUNDING.yml` — beyond the Tapa baseline (Tapa ships none).

---

## 5. Publicity plan

Channels ranked by audience fit.

| # | Channel | Why | How |
|---|---------|-----|-----|
| 1 | **GitHub repo** | Canonical install source + SEO surface | Settings tasks in §1 |
| 2 | **oh-my-pi Discord** (`discord.gg/4NMW9cdXZa`) | 100% product-audience fit; upstream is 14k★, very active | Showcase channel: GIF + value prop + install command |
| 3 | **npm publish** | Searchable listing + 2nd working install path | §2 |
| 4 | **oh-my-pi Discussions "Show and tell"** | Durable, Google-indexed | Only if upstream Discussions enabled (verify first); don't spam upstream Issues |
| 5 | **Aggregators** (`ifiokjr/oh-pi`, `hemmydev/oh-my-pi-agent`) + maybe create `awesome-oh-my-pi` | Cross-discovery; an awesome list is a first-mover land-grab | Open an issue/discussion proposing a listing (verify they accept third-party entries) |
| 6 | **X/Twitter** | Where terminal/dev-tool launches travel | GIF/video, tag `can1357`, lead with the prompt-queue hook |
| 7 | **dev.to** (+ cross-post) | Long-tail SEO + narrative for the prompt-queue idea | Walkthrough via `devto-publishing` + `ary-voice` skills |
| 8 | **Show HN / r/commandline** | High-variance reach | Optional, only with a crisp demo, after the above are live |

Messaging note: lead with the **prompt-queue** (drip-feed prompts, `---` HITL
barriers, auto-run), not the notepad — that is the differentiated feature.
