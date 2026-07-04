import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BacklogStore } from "../src/backlog";

let dir: string;
let store: BacklogStore;

beforeEach(async () => {
	dir = await mkdtemp(join(tmpdir(), "backlog-"));
	store = new BacklogStore(join(dir, "backlog.db"));
});

afterEach(async () => {
	store.close();
	await rm(dir, { recursive: true, force: true });
});

test("ready returns leaf epics; a done dependency unblocks its dependent", () => {
	store.addEpic({ id: "a", title: "A", priority: "high" });
	store.addEpic({ id: "b", title: "B", priority: "high" });
	expect(store.addDep("b", "a").ok).toBe(true); // b depends on a
	expect(store.ready().map((e) => e.id)).toEqual(["a"]); // b blocked by a
	store.setStatus("a", "done");
	expect(store.ready().map((e) => e.id)).toEqual(["b"]);
});

test("ready orders by priority, and current-repo bias floats its epics first", () => {
	store.addEpic({ id: "hi", title: "hi", priority: "high", repo: "x" });
	store.addEpic({ id: "lo", title: "lo", priority: "low", repo: "y" });
	expect(store.ready().map((e) => e.id)).toEqual(["hi", "lo"]); // priority
	expect(store.ready("y").map((e) => e.id)).toEqual(["lo", "hi"]); // repo bias
});

test("blocked lists the unfinished epics each waits on", () => {
	store.addEpic({ id: "a", title: "A" });
	store.addEpic({ id: "b", title: "B" });
	store.addDep("b", "a");
	expect(store.blocked()).toEqual([{ id: "b", title: "B", waitingOn: ["a"] }]);
	store.setStatus("a", "done");
	expect(store.blocked()).toEqual([]); // a done -> b no longer blocked
});

test("addDep refuses self-loops, missing epics, and direct cycles", () => {
	store.addEpic({ id: "a", title: "A" });
	store.addEpic({ id: "b", title: "B" });
	expect(store.addDep("a", "a")).toEqual({ ok: false, reason: "self" });
	expect(store.addDep("a", "ghost")).toEqual({ ok: false, reason: "missing" });
	expect(store.addDep("b", "a").ok).toBe(true); // b -> a
	expect(store.addDep("a", "b")).toEqual({ ok: false, reason: "cycle" }); // closes a<->b
});

test("addDep detects transitive cycles", () => {
	for (const id of ["a", "b", "c"]) store.addEpic({ id, title: id });
	expect(store.addDep("b", "a").ok).toBe(true); // b -> a
	expect(store.addDep("c", "b").ok).toBe(true); // c -> b
	expect(store.addDep("a", "c")).toEqual({ ok: false, reason: "cycle" }); // a->c->b->a
});

test("setStatus reports whether a row changed", () => {
	store.addEpic({ id: "a", title: "A" });
	expect(store.setStatus("a", "done")).toBe(true);
	expect(store.setStatus("ghost", "done")).toBe(false);
});

test("addEpic is idempotent on id (INSERT OR IGNORE)", () => {
	expect(store.addEpic({ id: "a", title: "A" })).toBe(true);
	expect(store.addEpic({ id: "a", title: "A again" })).toBe(false);
});
