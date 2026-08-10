/**
 * Optional Beads (`bd`) backend for the PlanQueue queue source.
 *
 * Pure app-layer I/O: shells out to the `bd` CLI via `Bun.spawn`. Never
 * imports OMP/TUI modules — same tier as a hypothetical `backlog.ts`, kept
 * independent so the widget/controller decide how (or whether) to use it.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/** A ready-to-work beads issue, trimmed to what the queue widget needs. */
export interface Bead {
	id: string;
	title: string;
	priority: number;
}

/** Resolved beads context: repo root plus the actor recorded on writes. */
export interface BeadsRuntime {
	cwd: string;
	actor: string;
	bdPath: string;
}

/** `bd show --json` may return a bare object or a single-element array. */
interface BeadShowResult {
	status: string;
}

const BD_FALLBACK_PATHS = [
	"/opt/homebrew/bin/bd",
	"/usr/local/bin/bd",
	"/usr/bin/bd",
];

/**
 * Detects whether `cwd` (or an ancestor) is a beads-backed repo (`.beads/`
 * present) with the `bd` binary discoverable. Returns `null` when either
 * condition fails, so callers can fall back to the note-based queue without
 * special-casing. The returned `cwd` is the ancestor containing `.beads/`,
 * not the original `cwd`, so spawned `bd` commands run at the repo root.
 */
export function resolveBeadsRuntime(cwd: string): BeadsRuntime | null {
	let dir = cwd;
	for (;;) {
		if (existsSync(join(dir, ".beads"))) break;
		const parent = dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
	// `Bun.which` misses `bd` in GUI-launched processes whose PATH lacks Homebrew.
	const bdPath = Bun.which("bd") ?? BD_FALLBACK_PATHS.find(existsSync) ?? null;
	if (bdPath === null) return null;
	const actor = process.env.BEADS_ACTOR ?? process.env.USER ?? "planqueue";
	return { cwd: dir, actor, bdPath };
}

/** Runs `bd <args>` in `rt.cwd`, returning stdout. Throws on non-zero exit. */
async function run(rt: BeadsRuntime, args: string[]): Promise<string> {
	const proc = Bun.spawn([rt.bdPath, ...args], {
		cwd: rt.cwd,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		throw new Error(
			stderr.trim() || `bd ${args.join(" ")} failed (exit ${exitCode})`,
		);
	}
	return stdout;
}

/** Narrows an unknown JSON value to a plausible `Bead`, or `null` if malformed. */
function toBead(value: unknown): Bead | null {
	if (typeof value !== "object" || value === null) return null;
	const record = value as Record<string, unknown>;
	if (typeof record.id !== "string" || typeof record.title !== "string")
		return null;
	const priority = typeof record.priority === "number" ? record.priority : 2;
	return { id: record.id, title: record.title, priority };
}

/** Fetches issues currently ready to work (`bd ready`), skipping malformed entries. */
export async function fetchReadyBeads(rt: BeadsRuntime): Promise<Bead[]> {
	const stdout = await run(rt, ["ready", "--json"]);
	const parsed: unknown = JSON.parse(stdout);
	if (!Array.isArray(parsed))
		throw new Error("bd ready --json did not return an array");
	const beads: Bead[] = [];
	for (const entry of parsed) {
		const bead = toBead(entry);
		if (bead !== null) beads.push(bead);
	}
	return beads;
}

/** Atomically claims an issue (assignee + in_progress) as `rt.actor`. */
export async function claimBead(rt: BeadsRuntime, id: string): Promise<void> {
	await run(rt, ["update", id, "--claim", "--actor", rt.actor, "--json"]);
}

/**
 * Closes an issue with `reason`, unless it is already closed. `bd close`
 * unconditionally overwrites `close_reason` even on an already-closed issue,
 * so this guard protects an agent-written evidence reason from being wiped
 * by a later redundant close call.
 */
export async function closeBeadIfOpen(
	rt: BeadsRuntime,
	id: string,
	reason: string,
): Promise<void> {
	const stdout = await run(rt, ["show", id, "--json"]);
	const parsed: unknown = JSON.parse(stdout);
	const raw = Array.isArray(parsed) ? parsed[0] : parsed;
	if (typeof raw !== "object" || raw === null) {
		throw new Error(`bd show ${id} --json returned an unexpected shape`);
	}
	const { status } = raw as BeadShowResult;
	if (status === "closed") return;
	await run(rt, ["close", id, "--reason", reason, "--actor", rt.actor]);
}

/** Builds the dispatch prompt sent to an agent turn assigned to `bead`. */
export function beadDispatchPrompt(bead: Bead): string {
	return `[${bead.id}] ${bead.title}\n\nWork on this beads issue now. Start with \`bd show ${bead.id}\` for full details. When done, close it yourself with evidence: \`bd close ${bead.id} --reason "<what changed + proof>"\`. If the turn ends without you closing it, PlanQueue closes it on settle.`;
}
