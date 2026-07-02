# PlanQueue launch-day runbook

Self-contained. You do **not** need to read `OPENSOURCE_PLAN.md` to run this. Every public
side effect is an explicit `ARY APPROVAL` gate. Commands are fenced and labeled HUMAN-RUN — an
agent never runs them; a human does.

## Identity (paste-ready)

| Surface | Value |
|---|---|
| Product | PlanQueue |
| Repo | `aryrabelo/planqueue` (<https://github.com/aryrabelo/planqueue>) |
| npm (plugin) | `@aryrabelo/planqueue` |
| npm (core) | `@aryrabelo/planqueue-core` |
| First release | `v0.1.0` — "PlanQueue first public release" |
| Install (git) | `omp plugin install github:aryrabelo/planqueue` |
| Install (npm) | `omp plugin install @aryrabelo/planqueue` |
| Storage | `~/.planqueue/{repo}/{branch}/{session-id}.md`, config `~/.planqueue/config.json` |

One-liner to lead with: **Stop pasting the next prompt manually. Write the plan once, then run
it as a prompt queue.**

Links you will paste today (fill in before T-0):

- `REPO_URL` = <https://github.com/aryrabelo/planqueue>
- `LINKEDIN_URL` = _(after posting)_
- `X_THREAD_URL` = _(after posting)_
- `VIDEO_URL` / `GIF_PATH` = _(from demo assets)_

---

## T-24h — freeze and stage

- [ ] Final go/no-go review read; verdict is GO or GO-with-caveats.
- [ ] Launch branch frozen; no more feature edits.
- [ ] Video + copy approved (see the two approval gates below).
- [ ] Links, screenshots, alt text collected in one place.
- [ ] Core package build verified installable (no `file:` dependency remains).
- [ ] Dry-run the fresh install in a scratch dir (see HUMAN-RUN below) — must succeed.

```bash
# HUMAN-RUN — dry-run fresh install in a throwaway dir (no side effects)
cd "$(mktemp -d)" && omp plugin install github:aryrabelo/planqueue && echo OK
```

- [ ] **ARY APPROVAL — demo video/GIF and social copy are final.** No public step proceeds
      until Ary confirms the assets and copy are correct.

---

## T-0 — publish and post

Order matters: distribution first, then repo identity, then posts. Do not post before a fresh
install works.

### Distribution gates

- [ ] **ARY APPROVAL — npm publish of `@aryrabelo/planqueue-core`.** The plugin is uninstallable
      publicly until the core is on npm. Publish the core first.

```bash
# HUMAN-RUN — publish the core package (from the planqueue-core repo)
cd ~/Sites/planqueue-core && npm publish --access public
```

- [ ] **ARY APPROVAL — GitHub repo rename to `planqueue` (and core repo to `planqueue-core`).**
      GitHub auto-redirects old URLs. Do this in the GitHub UI (Settings → Repository name), then
      update the local remote:

```bash
# HUMAN-RUN — point the local remote at the renamed repo (run after the UI rename)
cd ~/Sites/omp-plan-queue && git remote set-url origin git@github.com:aryrabelo/planqueue.git && git remote -v
```

- [ ] **ARY APPROVAL — tag and release `v0.1.0`.** First public release under the PlanQueue
      identity; old `omp-free-text` tags are not promoted.

```bash
# HUMAN-RUN — tag and push v0.1.0, then cut the GitHub release
cd ~/Sites/omp-plan-queue && git tag -a v0.1.0 -m "PlanQueue first public release" && git push origin v0.1.0
gh release create v0.1.0 --title "PlanQueue v0.1.0" --notes-file docs/release-notes-v0.1.0.md
```

- [ ] Confirm install works from a fresh environment (repeat the T-24h dry-run against the tag).
- [ ] README + social preview image final on the default branch.

### Posting gates — one CTA per post, each its own approval

- [ ] **ARY APPROVAL — post LinkedIn native video.** Body carries the story + 3 bullets + one
      CTA (star/try/reply). Put `REPO_URL` **in the body** (discoverability) and the exact
      `Install:` command **in the first comment** (keeps the body clean).
- [ ] **ARY APPROVAL — post X video/thread.** Tweet 1: video/GIF + one-line promise + `REPO_URL`.
      Put the **git install command in tweet 2**, the **npm install command in tweet 3**. 5–7
      tweets max, one CTA in the final tweet.
- [ ] **ARY APPROVAL — share in oh-my-pi Discord showcase channel.** Post the **demo GIF/video +
      `REPO_URL` + one-line promise** in the showcase/community channel only. Never open upstream
      oh-my-pi Issues as marketing.

Link routing summary:

| Link / command | Destination |
|---|---|
| `REPO_URL` | LinkedIn **body**, X **tweet 1**, Discord showcase |
| Install (git) | LinkedIn **first comment**, X **tweet 2** |
| Install (npm) | X **tweet 3** |
| Demo video/GIF | LinkedIn native video, X tweet 1, Discord showcase |

---

## T+1h — reply and triage

- [ ] Reply to **every** real comment/question across LinkedIn, X, Discord. Real = a human
      asking, reacting substantively, or reporting a problem. Skip pure spam.
- [ ] Pin/save the best feedback for the follow-up posts.
- [ ] Reported bug? Open a GitHub issue. **Never fix bugs in comment threads** — the fix must be
      an issue → commit → release note, so it is discoverable and does not get lost in a reply.

```bash
# HUMAN-RUN — file a bug reported in a comment as a tracked issue
gh issue create --title "<short repro>" --body "Reported via <channel>. Steps: ...\nExpected: ...\nActual: ..."
```

Reply/triage protocol: acknowledge → reproduce or route → link the issue back to the commenter.
Categories and response macros live in `feedback-triage.md`.

---

## T+24h — technical follow-up

- [ ] Post the technical follow-up: how the prompt queue state works (queued / in-flight / done,
      the `---` barrier, auto-run). One CTA.
- [ ] Share the first concrete learning/feedback publicly (shows responsiveness).
- [ ] Decide dev.to / Show HN / Reddit based on T+1h signal — only if there is genuine pull.

---

## T+7d — consolidate

- [ ] Publish changelog/fixes shipped in the first week.
- [ ] Write "what I learned launching PlanQueue" (build-in-public).
- [ ] Update the roadmap / non-goals from real feedback, not speculation.

---

## Contingency plans

### If install breaks

1. **Pin users to a known-good tag immediately.** Post the exact known-good install command so
   nobody hits the broken path while you fix it.

   ```bash
   # HUMAN-RUN — hand out a pinned, known-good install (adjust tag to last-good)
   omp plugin install github:aryrabelo/planqueue#v0.1.0
   ```

2. Post a **pinned known-issue note** on the launch thread (X pinned reply, LinkedIn edit/comment,
   Discord message): one sentence on the symptom, the pinned install workaround, "fix incoming".
3. **Fix-forward within 24h**: open an issue, ship a patch release, update the pinned note to point
   at the fixed tag. Do not silently delete the broken release.

### If it gets traction

- Move the **technical follow-up earlier** (don't wait for T+24h) while attention is live.
- **Capture every substantive piece of feedback as a GitHub issue** the same day — traction is
  worthless if the signal evaporates. Batch-triage with `feedback-triage.md`.
- Keep replying; do not switch to broadcast mode. One CTA per new post, no reposting the same ask.

### If it flops

- **No repost spam.** Do not re-share the same launch post to the same audience.
- **D+3 build-in-public angle**: reframe as "I built this, here's the interesting technical bit"
  rather than "please look at my launch". Different post, different value, same repo.
- **Retry on a fresh channel**: a dev.to write-up and/or a Show HN, each once, with a genuinely
  different framing (the queue-state mechanics, the OMP-integration story). Let the content carry
  it; do not beg for stars.
