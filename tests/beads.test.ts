import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
	beadDispatchPrompt,
	claimBead,
	closeBeadIfOpen,
	fetchReadyBeads,
	resolveBeadsRuntime,
} from "../src/beads";

const hasBd = Bun.which("bd") !== null;

/** Runs a CLI command to completion, throwing on non-zero exit. */
async function sh(cwd: string, cmd: string[]): Promise<string> {
	const proc = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
	const stdout = await new Response(proc.stdout).text();
	const stderr = await new Response(proc.stderr).text();
	const exitCode = await proc.exited;
	if (exitCode !== 0)
		throw new Error(stderr.trim() || `${cmd.join(" ")} failed`);
	return stdout;
}

if (!hasBd) {
	test.skip("bd binary not on PATH", () => {});
} else {
	let dir: string;

	beforeAll(async () => {
		dir = await mkdtemp(join(tmpdir(), "beads-test-"));
		await sh(dir, ["git", "init", "-q"]);
		await sh(dir, ["bd", "init", "--quiet"]);
	});

	afterAll(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	test("resolveBeadsRuntime detects a beads repo, not a plain dir", async () => {
		const plainDir = await mkdtemp(join(tmpdir(), "beads-test-plain-"));
		try {
			expect(resolveBeadsRuntime(plainDir)).toBeNull();
			const rt = resolveBeadsRuntime(dir);
			expect(rt).not.toBeNull();
			expect(rt?.cwd).toBe(resolve(dir));
			expect(typeof rt?.actor).toBe("string");
			expect(typeof rt?.bdPath).toBe("string");
		} finally {
			await rm(plainDir, { recursive: true, force: true });
		}
	});

	test("resolveBeadsRuntime walks up from a nested subdir to the repo root", async () => {
		const nested = join(dir, "a", "b", "c");
		await Bun.$`mkdir -p ${nested}`.quiet();
		const rt = resolveBeadsRuntime(nested);
		expect(rt).not.toBeNull();
		expect(rt?.cwd).toBe(resolve(dir));
	});

	test("fetchReadyBeads, claimBead, closeBeadIfOpen round-trip", async () => {
		const rt = resolveBeadsRuntime(dir);
		expect(rt).not.toBeNull();
		if (rt === null) throw new Error("unreachable");

		const firstId = (await sh(dir, ["bd", "q", "task one"])).trim();
		const secondId = (await sh(dir, ["bd", "q", "task two"])).trim();
		expect(firstId.length).toBeGreaterThan(0);
		expect(secondId.length).toBeGreaterThan(0);

		const ready = await fetchReadyBeads(rt);
		expect(ready.length).toBe(2);
		for (const bead of ready) {
			expect(typeof bead.id).toBe("string");
			expect(typeof bead.title).toBe("string");
		}

		await claimBead(rt, firstId);
		const afterClaim = await fetchReadyBeads(rt);
		expect(afterClaim.length).toBe(1);
		expect(afterClaim[0]?.id).toBe(secondId);

		await closeBeadIfOpen(rt, firstId, "done in test");
		// Idempotent: closing an already-closed issue must not throw.
		await closeBeadIfOpen(rt, firstId, "should not overwrite");
	});

	test("beadDispatchPrompt mentions the id and bd show", () => {
		const prompt = beadDispatchPrompt({
			id: "abc-123",
			title: "Fix the thing",
			priority: 2,
		});
		expect(prompt).toContain("abc-123");
		expect(prompt).toContain("bd show");
	});
}
