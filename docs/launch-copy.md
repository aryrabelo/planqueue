# PlanQueue — launch copy

All copy below is draft. Nothing is posted until Ary approves (see the gate at the end).

Shared facts (do not drift):

- Product: **PlanQueue** — an OMP extension. It only runs inside OMP (`@oh-my-pi/pi-coding-agent`). It is not a standalone tool and not tied to any other agent.
- Repo: `https://github.com/aryrabelo/planqueue`
- Install (git): `omp plugin install github:aryrabelo/planqueue`
- Also on npm: `@aryrabelo/planqueue` (mention by name only; keep one runnable install command per channel).
- Storage: local markdown at `~/.planqueue/{repo}/{branch}/{session-id}.md`. No network calls, no telemetry. MIT.
- Media placeholders: `{{VIDEO_URL}}` (hosted video), `{{GIF_PATH}}` (repo/README GIF).

Rules honored here: install command appears exactly once per channel; first line of every post stands alone; one CTA per post; honest OMP-only scope; no hype words.

---

## 1. LinkedIn launch post

### Variant A — story-driven (English)

I got tired of manually pasting the next prompt into my coding agent.

Every session, the same loop: write a plan somewhere, then babysit it — copy the next step in, wait, copy the next one, remember where I was after a tangent. The plan was in my head or a scratch file; the agent never saw the shape of it.

So I built PlanQueue, an open-source extension for OMP (the terminal coding agent). It adds a note panel under the status line, and that note doubles as a prompt queue.

Write the plan once:
- each line becomes a queued prompt you send with a keystroke
- a `---` line becomes a human review checkpoint the queue stops at
- auto-run drains the queue until it hits a checkpoint or runs out
- the note persists per repo, branch, and session, so context survives restarts

It started as a scratchpad. The part that stuck was the queue — I can see the work, edit it mid-run, and stop it whenever I want.

It's OMP-only and deliberately small: local markdown files, no telemetry, no network calls, MIT licensed.

{{VIDEO_URL}}

If you drive a terminal coding agent, I'd like to hear one thing: where does your workflow lose the thread? Repo and install are in the first comment.

> First comment (LinkedIn): Repo: https://github.com/aryrabelo/planqueue — Install: `omp plugin install github:aryrabelo/planqueue`

### Variant B — technical (English)

PlanQueue is a FIFO prompt queue that lives inside your OMP coding-agent session.

The problem it solves is narrow: when you work with a terminal agent, the "next prompt" lives in your head or a side file, and the agent has no view of the plan. PlanQueue puts that plan in a note panel under the status line and treats each line as a queued step.

How it works:
- Plain lines are queued prompts. `Ctrl+↓` sends the next one to the agent.
- A `---` line is a hard human-in-the-loop barrier — auto-run will not cross it without you.
- `Ctrl+Shift+↓` toggles auto-run, which drains the queue step by step until a barrier or the end.
- Checkbox state tracks progress: `- [ ]` pending, `- [>]` in flight, `- [x]` done.
- Notes are stored as local markdown at `~/.planqueue/{repo}/{branch}/{session-id}.md`, scoped per repo/branch/session.

No telemetry, no network calls, MIT licensed, OMP-only.

{{VIDEO_URL}}

Install: `omp plugin install github:aryrabelo/planqueue` — if you try it, tell me what breaks. Repo: https://github.com/aryrabelo/planqueue

### Variant A (PT-BR translation) — optional

> Post this only if launching bilingual; otherwise skip. It mirrors Variant A.

Cansei de colar manualmente o próximo prompt no meu agente de código.

Toda sessão era o mesmo loop: escrever um plano em algum lugar e depois ficar de babá dele — colar o próximo passo, esperar, colar o próximo, lembrar onde eu tinha parado depois de um desvio. O plano estava na minha cabeça ou num arquivo de rascunho; o agente nunca via o formato dele.

Então construí o PlanQueue, uma extensão open-source para o OMP (o agente de código no terminal). Ele adiciona um painel de notas abaixo da status line, e essa nota funciona como uma fila de prompts.

Escreva o plano uma vez:
- cada linha vira um prompt enfileirado que você envia com um atalho
- uma linha `---` vira um checkpoint de revisão humana onde a fila para
- o auto-run esvazia a fila até bater num checkpoint ou acabar
- a nota persiste por repo, branch e sessão, então o contexto sobrevive a reinícios

Começou como rascunho. O que ficou foi a fila — eu vejo o trabalho, edito no meio da execução e paro quando quiser.

É só para OMP e propositalmente pequeno: arquivos markdown locais, sem telemetria, sem chamadas de rede, licença MIT.

{{VIDEO_URL}}

Se você usa um agente de código no terminal, quero saber de uma coisa: onde seu fluxo perde o fio da meada? Repositório e instalação no primeiro comentário.

---

## 2. X launch thread (6 tweets)

1/ I got tired of pasting the next prompt into my coding agent by hand, so I built PlanQueue: an open-source OMP extension that turns a plain note into a prompt queue.

Write the plan once. Drain it step by step. Stop at human checkpoints.

{{VIDEO_URL}}

2/ The note panel sits under the OMP status line.

Each line is a queued prompt.
A `---` line is a human-in-the-loop barrier.
Checkboxes track state: `- [ ]` → `- [>]` → `- [x]`.

You can see the whole plan and edit it mid-run.

3/ Install (OMP only):

`omp plugin install github:aryrabelo/planqueue`

Repo: https://github.com/aryrabelo/planqueue

4/ Why not just a TODO list?

A TODO list is passive — you still copy each step in.
A fully autonomous loop is too much rope.

PlanQueue is the middle: a queue you can watch, edit, and stop with one keystroke.

5/ It's intentionally small:

- local markdown files, one per repo/branch/session
- no telemetry, no network calls
- MIT licensed
- built specifically for OMP, not a general tool

6/ If you run a terminal coding agent, I'd like to know: where do your agent sessions lose context?

Try it and reply with your workflow pain.

---

## 3. Short standalone X post (with video)

PlanQueue turns a plain note into a prompt queue for your OMP coding agent — write the plan once, then drip it to the agent step by step and pause at `---` checkpoints.

{{VIDEO_URL}}

Repo (OMP only): https://github.com/aryrabelo/planqueue

---

## 4. Discord / showcase message (oh-my-pi community)

> Tone: humble, workflow-focused. Post in the showcase/community channel, not upstream Issues.

Sharing something small I built on top of OMP: **PlanQueue**.

It adds a note panel under the status line, and the note works as a prompt queue. I kept losing the "next prompt" mid-session — this lets me write the whole plan up front, send steps one at a time with a keystroke, and put a `---` line wherever I want the queue to stop for me. Auto-run drains the queue until it hits one of those barriers.

Notes are just local markdown per repo/branch/session, so context survives restarts. No telemetry, no network calls, MIT.

It's OMP-specific and still early (v0.1.0), so I'd genuinely value feedback from people who live in this workflow — especially where the queue model feels wrong.

Install: `omp plugin install github:aryrabelo/planqueue`
Repo: https://github.com/aryrabelo/planqueue

Happy to answer anything or take issues/PRs.

---

## 5. Reply macros

**Q: How is this different from a TODO list?**
A TODO list just records what to do — you still copy each step into the agent yourself. PlanQueue makes each line an actionable queued prompt: one keystroke sends the next step to the agent, `---` lines stop it for review, and checkbox state (`- [ ]` → `- [>]` → `- [x]`) tracks what's already run. It's the plan and the execution, in one panel.

**Q: Is it autonomous / does it run on its own?**
Not by default. You send steps one at a time (`Ctrl+↓`). There's an auto-run toggle (`Ctrl+Shift+↓`) that drains the queue for you, but it stops dead at any `---` barrier and you can toggle it off anytime. It's designed to be supervised, not a fire-and-forget loop.

**Q: Does it phone home / any telemetry?**
No. There are no network calls and no telemetry. Notes are plain markdown stored locally under `~/.planqueue/`. You can read, grep, and version them yourself.

**Q: Does it work with [non-OMP agent]?**
Not right now — PlanQueue is an OMP extension and hooks into OMP's status line and session model. It won't run on other agents. If there's real demand I'm open to hearing about it, but I'd rather do OMP well than half-support everything.

**Q: Install fails / plugin won't load.**
Sorry about that. Two quick checks: (1) confirm you're on a recent OMP that supports `omp plugin install`, and (2) run `omp plugin install github:aryrabelo/planqueue` again and paste the full error into a GitHub issue: https://github.com/aryrabelo/planqueue/issues — include your OMP version and OS and I'll take a look.

**Q: Can you add [feature]?**
Maybe — open an issue with the workflow you're trying to hit: https://github.com/aryrabelo/planqueue/issues. I'm keeping v0.1.0 small on purpose, so I'll weigh anything against "does this stay a simple, visible queue?" Concrete use cases help a lot.

---

## 6. Follow-up posts

### D+1 — technical: how queue state works

A day in, here's the part people asked about most: how PlanQueue actually tracks queue state.

There's no database. The queue *is* a markdown file at `~/.planqueue/{repo}/{branch}/{session-id}.md` — one per repo, branch, and session. Each line is a step; the checkbox in front encodes state:

- `- [ ]` queued, not sent yet
- `- [>]` sent to the agent, in flight
- `- [x]` completed

A `---` line is a barrier: auto-run advances through `[ ]` lines, flipping them to `[>]` then `[x]`, and refuses to cross a `---` without you. Because state lives in the file, you can edit the plan mid-run, close OMP, reopen, and the queue picks up exactly where it was. (Older notes are still read from the legacy `~/.free-text` / `~/.omp-free-text` paths if you had them.)

Repo: https://github.com/aryrabelo/planqueue

### D+3 — build in public

PlanQueue has been public for a few days, and I want to be honest about what it is and isn't.

It's not a framework or a grand agent platform. It's one panel that does one thing: turn a note into a supervised prompt queue for OMP. I built it because my own sessions kept losing the "next step," not because I set out to make a product.

What surprised me: the queue mattered more than the notes. I started with a scratchpad and the checkpoint/auto-run behavior is what I actually use now.

What's still rough: it's OMP-only, it's v0.1.0, and the ergonomics of editing long plans mid-run can be better. I'd rather ship that honestly than oversell it.

If you've tried it, the most useful thing you can do is tell me where the model breaks for your workflow: https://github.com/aryrabelo/planqueue/issues

### D+7 — what I learned from launching

One week of PlanQueue being public — a few things I learned launching a tiny open-source tool.

- Scope honesty pays. Saying "OMP-only, small on purpose" up front filtered for the people it actually helps and killed a lot of mismatched expectations.
- The demo did the explaining. A 30-second clip of note → queue → checkpoint landed better than any paragraph I wrote.
- The best feedback was workflow-shaped, not feature-shaped — "here's where I lose context," not "add X."
- Keeping it local (no telemetry, plain markdown) removed a whole class of "wait, what does it send?" questions.

Thanks to everyone who tried it and filed real feedback. If you haven't yet and you live in a terminal agent: https://github.com/aryrabelo/planqueue

---

- [ ] HUMAN APPROVAL REQUIRED before posting anything
