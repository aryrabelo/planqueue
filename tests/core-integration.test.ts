import { expect, test } from "bun:test";
import {
	legacyNotePathsFor,
	notePathFor,
	parseTaskLine,
	renderWidgetLines,
	resolveLocation,
} from "@aryrabelo/planqueue-core";

test("core resolves through the package surface", () => {
	const loc = resolveLocation({
		cwd: "/x/repo",
		repoToplevel: "/x/repo",
		branch: "main",
		sessionId: "s1",
	});
	expect(notePathFor(loc, "/home/u")).toBe(
		"/home/u/.planqueue/repo/main/s1.md",
	);
	expect(legacyNotePathsFor(loc, "/home/u")).toEqual([
		"/home/u/.free-text/repo/main/s1.md",
		"/home/u/.omp-free-text/repo/main/s1.md",
	]);
	expect(parseTaskLine("- [ ] hi").state).toBe("pending");
	expect(renderWidgetLines("- [ ] hi").length).toBeGreaterThan(0);
});
