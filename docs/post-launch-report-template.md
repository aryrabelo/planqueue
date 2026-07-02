# PlanQueue post-launch report — template

Fill one copy per launch window (e.g. `report-2026-07-DD.md`). Keep facts, interpretation, and
next actions strictly separated — do not let a metric silently become a conclusion.

Window: `T-0 = ____` → `report cutoff = ____`
Links: LinkedIn `____` · X `____` · Discord `____`

---

## 1. Metrics (facts only)

Numbers with source and timestamp. No commentary in this table.

| Metric | Value | Source | As of |
|---|---|---|---|
| GitHub stars | | repo header | |
| GitHub forks | | repo header | |
| Repo traffic — unique visitors | | Insights → Traffic | |
| Repo traffic — clones | | Insights → Traffic | |
| npm downloads (`@aryrabelo/planqueue`) | | npm / npmtrends | |
| npm downloads (`@aryrabelo/planqueue-core`) | | npm / npmtrends | |
| Install failures reported | | issues + comments | |
| Issues opened | | Issues | |
| PRs opened | | Pull requests | |
| LinkedIn impressions / reactions / comments | | LinkedIn analytics | |
| X impressions / reposts / replies | | X analytics | |

```bash
# HUMAN-RUN — snapshot the countable GitHub metrics
gh repo view aryrabelo/planqueue --json stargazerCount,forkCount
gh issue list --repo aryrabelo/planqueue --state all --json number,title,state | jq length
gh pr list --repo aryrabelo/planqueue --state all --json number,title,state | jq length
```

---

## 2. Qualitative feedback

### 2a. Facts — what people actually said

Verbatim or close-paraphrase quotes with attribution channel. No interpretation here.

- `[channel]` "…"
- `[channel]` "…"

### 2b. Interpretation — what it might mean

Clearly labeled as inference, not observation. Note confidence (low/med/high).

- [INFERENCE, conf: __] …
- [INFERENCE, conf: __] …

### 2c. Next actions — what we will do about it

Each action maps to exactly one of: a GitHub issue, a docs change, or an explicit no-action.

| Action | Type (issue / docs / no-action) | Link or reason |
|---|---|---|
| | | |

---

## 3. Decisions log

Dated, one line each. What was decided and why. Reversals noted.

- `YYYY-MM-DD` — decided … because …

---

## 4. Next release candidates

Ranked. Each with the evidence that justifies it and its routing.

| Candidate | Evidence (from §2a) | Effort (S/M/L) | Issue link |
|---|---|---|---|
| | | | |

---

## 5. One-paragraph summary

Honest read of the window: did the launch create a feedback loop or just impressions? What is the
single most important thing to do next?
