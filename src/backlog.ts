/**
 * Plan-level backlog store: epics + cross-repo dependencies in one local SQLite
 * DB (`~/.planqueue/backlog.db`), the codified interface behind the
 * `pending-items` skill's hand-pasted SQL.
 *
 * This module OWNS the two invariants the prose SQL left to caller discipline:
 * (1) `PRAGMA foreign_keys = ON` on every connection (SQLite defaults it OFF,
 * and each connection is fresh), and (2) an atomic cycle-guard that runs inside
 * the same transaction as every edge insert, so a dependency can never close a
 * cycle (which the non-recursive `ready` query would otherwise turn into a
 * silent, undetectable deadlock).
 *
 * App-layer (I/O) by design — it lives here, not in the pure `planqueue-core`.
 */
import { Database } from "bun:sqlite";

export type EpicStatus = "pending" | "in_progress" | "done";
export type EpicPriority = "high" | "medium" | "low";

/** A pickable epic: pending/in_progress with every dependency already done. */
export interface ReadyEpic {
	id: string;
	title: string;
	priority: EpicPriority;
	repo: string | null;
}

/** A blocked epic and the unfinished epics it is waiting on. */
export interface BlockedEpic {
	id: string;
	title: string;
	waitingOn: string[];
}

/** Fields accepted when adding an epic; unset columns take schema defaults. */
export interface NewEpic {
	id: string;
	title: string;
	status?: EpicStatus;
	priority?: EpicPriority;
	body?: string;
	repo?: string | null;
	branch?: string | null;
}

/** Why an `addDep` was refused, when `ok` is false. */
export type AddDepReason = "self" | "missing" | "cycle";

export interface AddDepResult {
	ok: boolean;
	reason?: AddDepReason;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS epics (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  priority     TEXT NOT NULL DEFAULT 'medium',
  body         TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL,
  updated_at   TEXT,
  session_id   TEXT,
  note_path    TEXT,
  repo         TEXT,
  branch       TEXT,
  worktree     TEXT,
  issue_external_id          TEXT,
  issue_external_portal      TEXT,
  issue_external_last_status TEXT,
  pull_request TEXT
);
CREATE INDEX IF NOT EXISTS idx_epics_repo    ON epics(repo);
CREATE INDEX IF NOT EXISTS idx_epics_session ON epics(session_id);
CREATE INDEX IF NOT EXISTS idx_epics_status  ON epics(status);
CREATE TABLE IF NOT EXISTS epic_deps (
  epic_id       TEXT NOT NULL REFERENCES epics(id) ON DELETE CASCADE,
  depends_on_id TEXT NOT NULL REFERENCES epics(id) ON DELETE CASCADE,
  PRIMARY KEY (epic_id, depends_on_id)
);
`;

export class BacklogStore {
	private readonly db: Database;

	constructor(dbPath: string) {
		this.db = new Database(dbPath);
		// Own the FK invariant: SQLite defaults foreign_keys OFF, per connection.
		this.db.exec("PRAGMA foreign_keys = ON;");
		this.db.exec(SCHEMA);
	}

	close(): void {
		this.db.close();
	}

	addEpic(epic: NewEpic): boolean {
		const res = this.db
			.query(
				`INSERT OR IGNORE INTO epics (id, title, status, priority, body, created_at, repo, branch)
				 VALUES ($id, $title, $status, $priority, $body, datetime('now'), $repo, $branch)`,
			)
			.run({
				$id: epic.id,
				$title: epic.title,
				$status: epic.status ?? "pending",
				$priority: epic.priority ?? "medium",
				$body: epic.body ?? "",
				$repo: epic.repo ?? null,
				$branch: epic.branch ?? null,
			});
		return res.changes > 0;
	}

	/** Pickable epics. When `currentRepo` is set, its epics sort first (else
	 * global order: priority, then age) — matching the `pending-items` skill. */
	ready(currentRepo?: string | null): ReadyEpic[] {
		return this.db
			.query(
				`SELECT id, title, priority, repo FROM epics t
				 WHERE t.status IN ('pending','in_progress')
				   AND NOT EXISTS (
				     SELECT 1 FROM epic_deps d JOIN epics p ON p.id = d.depends_on_id
				     WHERE d.epic_id = t.id AND p.status <> 'done')
				 ORDER BY
				   CASE WHEN $repo IS NOT NULL AND repo = $repo THEN 0 ELSE 1 END,
				   CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
				   created_at`,
			)
			.all({ $repo: currentRepo ?? null }) as ReadyEpic[];
	}

	/** Blocked epics with the unfinished epics each is waiting on. */
	blocked(): BlockedEpic[] {
		const rows = this.db
			.query(
				`SELECT t.id AS id, t.title AS title, group_concat(p.id) AS waiting
				 FROM epics t
				 JOIN epic_deps d ON d.epic_id = t.id
				 JOIN epics p ON p.id = d.depends_on_id AND p.status <> 'done'
				 WHERE t.status IN ('pending','in_progress')
				 GROUP BY t.id ORDER BY t.id`,
			)
			.all() as Array<{ id: string; title: string; waiting: string | null }>;
		return rows.map((r) => ({
			id: r.id,
			title: r.title,
			waitingOn: r.waiting ? r.waiting.split(",") : [],
		}));
	}

	/** Add `epicId depends on dependsOnId`, refusing self-loops, missing epics,
	 * and any edge that would close a cycle. Check + insert are one transaction. */
	addDep(epicId: string, dependsOnId: string): AddDepResult {
		if (epicId === dependsOnId) return { ok: false, reason: "self" };
		const run = this.db.transaction((): AddDepResult => {
			const missing =
				this.db.query("SELECT 1 FROM epics WHERE id = ?").get(epicId) == null ||
				this.db.query("SELECT 1 FROM epics WHERE id = ?").get(dependsOnId) ==
					null;
			if (missing) return { ok: false, reason: "missing" };
			// Adding (epicId -> dependsOnId) closes a cycle iff epicId is already
			// reachable from dependsOnId along depends_on edges.
			const row = this.db
				.query(
					`WITH RECURSIVE reach(id) AS (
					   SELECT depends_on_id FROM epic_deps WHERE epic_id = $from
					   UNION
					   SELECT d.depends_on_id FROM epic_deps d JOIN reach r ON d.epic_id = r.id)
					 SELECT count(*) AS n FROM reach WHERE id = $target`,
				)
				.get({ $from: dependsOnId, $target: epicId }) as { n: number };
			if (row.n > 0) return { ok: false, reason: "cycle" };
			this.db
				.query(
					"INSERT OR IGNORE INTO epic_deps (epic_id, depends_on_id) VALUES (?, ?)",
				)
				.run(epicId, dependsOnId);
			return { ok: true };
		});
		return run();
	}

	/** Set an epic's status. Returns whether a row was updated. */
	setStatus(id: string, status: EpicStatus): boolean {
		const res = this.db
			.query(
				"UPDATE epics SET status = ?, updated_at = datetime('now') WHERE id = ?",
			)
			.run(status, id);
		return res.changes > 0;
	}
}
