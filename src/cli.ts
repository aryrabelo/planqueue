#!/usr/bin/env bun
/**
 * `planqueue backlog` CLI — the codified interface over `~/.planqueue/backlog.db`
 * that replaces the `pending-items` skill's hand-pasted SQL. stdout is JSON only
 * (agent-friendly); usage/errors go to stderr. Exit code doubles as a gate:
 * add-dep and set-status exit non-zero when they change nothing / are refused.
 *
 * Subcommands: ready | blocked | add-dep <A> <B> | set-status <id> <status> |
 * add <id> <title> [--priority p] [--status s] [--repo r].
 * The `backlog` prefix is optional (`planqueue ready` == `planqueue backlog ready`).
 */
import { homedir } from "node:os";
import { join } from "node:path";
import { resolveLocation } from "@aryrabelo/planqueue-core";
import { BacklogStore, type EpicPriority, type EpicStatus } from "./backlog";

const DEFAULT_DB = join(homedir(), ".planqueue", "backlog.db");
const STATUSES: readonly EpicStatus[] = ["pending", "in_progress", "done"];
const PRIORITIES: readonly EpicPriority[] = ["high", "medium", "low"];

function optValue(args: string[], key: string): string | undefined {
	const i = args.indexOf(key);
	return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
}

/** Derive the current repo slug by importing (not copying) resolveLocation. */
function deriveRepo(): string | null {
	try {
		const top = Bun.spawnSync(["git", "rev-parse", "--show-toplevel"])
			.stdout.toString()
			.trim();
		const branch = Bun.spawnSync(["git", "rev-parse", "--abbrev-ref", "HEAD"])
			.stdout.toString()
			.trim();
		return resolveLocation({
			cwd: process.cwd(),
			repoToplevel: top.length > 0 ? top : null,
			branch: branch.length > 0 ? branch : null,
			sessionId: "cli",
		}).repo;
	} catch {
		return null;
	}
}

function usage(): never {
	process.stderr.write(
		"usage: planqueue backlog <ready|blocked|add-dep <A> <B>|" +
			"set-status <id> <pending|in_progress|done>|add <id> <title> [--priority p] [--status s] [--repo r]> " +
			"[--db <path>] [--repo <r>]\n",
	);
	process.exit(2);
}

function write(value: unknown): void {
	process.stdout.write(`${JSON.stringify(value)}\n`);
}

function dispatch(store: BacklogStore, args: string[]): number {
	switch (args[0]) {
		case "ready": {
			const repo = optValue(args, "--repo") ?? deriveRepo();
			write(store.ready(repo));
			return 0;
		}
		case "blocked": {
			write(store.blocked());
			return 0;
		}
		case "add-dep": {
			const a = args[1];
			const b = args[2];
			if (
				a === undefined ||
				b === undefined ||
				a.startsWith("--") ||
				b.startsWith("--")
			)
				usage();
			const res = store.addDep(a, b);
			write(res);
			return res.ok ? 0 : 1;
		}
		case "set-status": {
			const id = args[1];
			const status = args[2];
			if (
				id === undefined ||
				status === undefined ||
				!STATUSES.includes(status as EpicStatus)
			) {
				usage();
			}
			const changed = store.setStatus(id, status as EpicStatus);
			write({ changed });
			return changed ? 0 : 1;
		}
		case "add": {
			const id = args[1];
			const title = args[2];
			if (
				id === undefined ||
				title === undefined ||
				id.startsWith("--") ||
				title.startsWith("--")
			) {
				usage();
			}
			const priority = optValue(args, "--priority");
			const status = optValue(args, "--status");
			if (
				priority !== undefined &&
				!PRIORITIES.includes(priority as EpicPriority)
			)
				usage();
			if (status !== undefined && !STATUSES.includes(status as EpicStatus))
				usage();
			const inserted = store.addEpic({
				id,
				title,
				priority: priority as EpicPriority | undefined,
				status: status as EpicStatus | undefined,
				repo: optValue(args, "--repo") ?? null,
			});
			write({ inserted });
			return inserted ? 0 : 1;
		}
		default:
			return usage();
	}
}

function main(argv: string[]): number {
	const args = argv[0] === "backlog" ? argv.slice(1) : argv;
	const dbPath = optValue(args, "--db") ?? DEFAULT_DB;
	const store = new BacklogStore(dbPath);
	try {
		return dispatch(store, args);
	} finally {
		store.close();
	}
}

process.exit(main(process.argv.slice(2)));
