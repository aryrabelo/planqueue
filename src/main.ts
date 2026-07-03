/**
 * @aryrabelo/planqueue
 *
 * OMP extension: a PlanQueue session-notes panel below the status line.
 * - Shows the latest note in a widget below the editor via
 *   `ctx.ui.setWidget(..., { placement: "belowEditor" })`.
 * - Opens a multi-line editor on `Ctrl+N` or `/note`.
 * - Runs the note as a prompt queue: `Ctrl+down` sends the next line, a `---`
 *   line is a human-in-the-loop barrier, and `Ctrl+shift+down` toggles auto-run.
 * - Persists to `~/.planqueue/{repo}/{branch}/{session-id}.md` (with a
 *   read-only fallback chain through the legacy `~/.free-text/...` then
 *   `~/.omp-free-text/...` roots for notes created before the root migration).
 */

import { homedir } from "node:os";
import {
	appendHistory,
	appendQueue,
	appendTask,
	configPathFor,
	createDebouncedSaver,
	type DebouncedSaver,
	historyPathFor,
	legacyConfigPathsFor,
	legacyNotePathsFor,
	legacySessionsDirsFor,
	listNotes,
	loadNote,
	loadNoteWithFallback,
	type NoteSummary,
	normalizeQueue,
	notePathFor,
	parseShortcutConfig,
	type QueueStep,
	queueHint,
	type ResolvedLocation,
	renderWidgetLines,
	resolveCloseAction,
	resolveLocation,
	type ShortcutConfig,
	saveNote,
	sessionsDirFor,
	type WidgetStyle,
} from "@aryrabelo/planqueue-core";
import type {
	AgentToolResult,
	AgentToolUpdateCallback,
	CustomEditor,
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionContext,
	KeybindingsManager,
	Theme,
} from "@oh-my-pi/pi-coding-agent";
import type { KeyId, TUI } from "@oh-my-pi/pi-tui";
import type { ZodType } from "zod";
import { createQueue } from "./queue-controller";

const WIDGET_KEY = "planqueue";

/** Outcome of the notes editor overlay: the buffer and how it was closed. */
interface EditorResult {
	text: string;
	submitted: boolean;
}

/** Copy text to the system clipboard via the OSC 52 escape (works locally and over SSH). */
function copyNoteToClipboard(text: string): void {
	if (text.length === 0 || !process.stdout.isTTY) return;
	const seq = `\x1b]52;c;${Buffer.from(text).toString("base64")}\x07`;
	try {
		process.stdout.write(seq);
	} catch {
		// OSC 52 is best-effort; never let a clipboard write break the session.
	}
}

/**
 * Build the prompt-style notes editor for `ctx.ui.custom`: Enter saves,
 * Shift+Enter inserts a newline, and Esc closes returning the current buffer
 * (so `openEditor` can offer to save instead of silently dropping the work).
 *
 * `sdk` is the injected `pi.pi` namespace — the running bundle's exports. We
 * MUST construct `CustomEditor` / read `getEditorTheme()` from it, not from a
 * static import: the static import resolves to a second, uninitialised copy of
 * the package (its theme singleton is undefined), which crashes on open.
 */
function makeNotesEditor(
	sdk: ExtensionAPI["pi"],
	tui: TUI,
	original: string,
	done: (result: EditorResult) => void,
): CustomEditor {
	const editor = new sdk.CustomEditor(sdk.getEditorTheme());
	editor.setText(original);
	editor.focused = true;
	editor.onChange = (): void => tui.requestComponentRender(editor);
	editor.onSubmit = (text: string): void => done({ text, submitted: true });
	editor.onEscape = (): void =>
		done({ text: editor.getText(), submitted: false });
	editor.onCopyPrompt = (): void => copyNoteToClipboard(editor.getText());
	return editor;
}

/**
 * Browse notes from OTHER sessions in the same repo/branch: a keyboard selector
 * (newest first) opens the picked note in a read-only viewer. The viewer reuses
 * the notes editor, but its result is ignored, so browsing never changes the
 * current session's note.
 *
 * Notes from the legacy roots (`~/.free-text` then `~/.omp-free-text`) are
 * merged in read-only for back-compat, so sessions created before the root
 * migration stay visible. A session present at more than one root keeps its
 * newest-root entry (new root wins, then newest legacy).
 */
async function browseNotes(
	ctx: ExtensionContext,
	sdk: ExtensionAPI["pi"],
	sessionsDir: string,
	currentNotePath: string | undefined,
	legacySessionsDirs?: readonly string[],
): Promise<void> {
	const fresh = await listNotes(sessionsDir);
	const seen = new Set(fresh.map((n) => n.sessionId));
	const merged = [...fresh];
	for (const dir of legacySessionsDirs ?? []) {
		for (const n of await listNotes(dir)) {
			if (seen.has(n.sessionId)) continue;
			seen.add(n.sessionId);
			merged.push(n);
		}
	}
	merged.sort((a, b) => b.mtimeMs - a.mtimeMs);
	const others = merged.filter(
		(n) => n.path !== currentNotePath && n.preview.length > 0,
	);
	if (others.length === 0) {
		ctx.ui.notify("No PlanQueue entries from other sessions yet", "info");
		return;
	}
	const byLabel = new Map<string, NoteSummary>();
	const options = others.map((n): { label: string; description: string } => {
		const stamp = new Date(n.mtimeMs)
			.toISOString()
			.slice(0, 16)
			.replace("T", " ");
		const label = `${stamp}  ${n.preview}`;
		byLabel.set(label, n);
		return { label, description: n.sessionId };
	});
	const picked = await ctx.ui.select(
		"PlanQueue \u2014 other sessions",
		options,
	);
	const note = picked === undefined ? undefined : byLabel.get(picked);
	if (note === undefined) return;
	const text = await loadNote(note.path);
	await ctx.ui.custom<EditorResult>(
		(
			tui: TUI,
			_theme: Theme,
			_keybindings: KeybindingsManager,
			done: (r: EditorResult) => void,
		): CustomEditor => makeNotesEditor(sdk, tui, text, done),
	);
}

/** Run a git command in `cwd`, returning trimmed stdout or null on any failure. */
async function runGit(
	pi: ExtensionAPI,
	cwd: string,
	args: string[],
): Promise<string | null> {
	try {
		const res = await pi.exec("git", args, { cwd });
		return res.code === 0 ? res.stdout.trim() : null;
	} catch {
		return null;
	}
}

/** Flush pending note saves, swallowing write failures so lifecycle handlers still proceed. */
async function safeFlush(
	pi: ExtensionAPI,
	saver: DebouncedSaver | undefined,
): Promise<void> {
	try {
		await saver?.flush();
	} catch (err) {
		pi.logger.error(
			`[planqueue] note flush failed: ${err instanceof Error ? err.message : String(err)}`,
		);
	}
}

/** Build the themed widget styler mirroring OMP's HUD widgets (bold title, `└` tree hook, 2-space indent). */
function widgetStyle(theme: Theme): WidgetStyle {
	return {
		title: theme.bold(theme.fg("accent", "PlanQueue \u00b7 Notes")),
		hook: theme.tree.hook,
		indent: "  ",
		hint: (t: string): string => theme.fg("dim", t),
		body: (t: string): string => theme.fg("text", t),
		shortcut: (t: string): string => theme.fg("dim", t),
		taskPending: (t: string): string => theme.fg("warning", t),
		taskInflight: (t: string): string => theme.fg("accent", t),
		taskDone: (t: string): string => theme.fg("dim", t),
		strike: (t: string): string => theme.strikethrough(t),
		continuation: (t: string): string => theme.fg("dim", t),
	};
}

/**
 * Resolve how the notes editor closed and persist accordingly: submit/Enter saves,
 * an unchanged Esc discards silently, and an Esc with unsaved changes asks — a
 * discarded draft is still appended to history so typed work is never lost.
 */
async function applyEditorResult(
	ctx: ExtensionContext,
	original: string,
	result: EditorResult,
	persist: (ctx: ExtensionContext, next: string) => Promise<void>,
	historyPath: string | undefined,
): Promise<void> {
	const action = resolveCloseAction(original, result.text, result.submitted);
	if (action === "discard") return;
	if (
		action === "ask" &&
		!(await ctx.ui.confirm("Unsaved notes", "Save your changes?"))
	) {
		// Keep the discarded draft in history so typed work is never truly lost.
		if (historyPath !== undefined)
			await appendHistory(historyPath, result.text, new Date(), "discarded");
		ctx.ui.notify("Notes discarded (kept in history)", "info");
		return;
	}
	await persist(ctx, normalizeQueue(result.text));
	ctx.ui.notify("Notes saved", "info");
}

/** Load global shortcut overrides (config is not per repo/branch); log any warnings. */
async function loadShortcuts(pi: ExtensionAPI): Promise<ShortcutConfig> {
	let raw = "";
	try {
		raw = await loadNoteWithFallback(
			configPathFor(homedir()),
			legacyConfigPathsFor(homedir()),
		);
	} catch (err) {
		pi.logger.warn(
			`[planqueue] could not read config.json: ${err instanceof Error ? err.message : String(err)}`,
		);
	}
	const { shortcuts, warnings } = parseShortcutConfig(raw);
	for (const w of warnings) pi.logger.warn(`[planqueue] ${w}`);
	return shortcuts;
}

/** Register the `note_add` tool so the agent can append a task to the bottom of the active note. */
function registerNoteAddTool(
	pi: ExtensionAPI,
	deps: {
		notePath: () => string | undefined;
		content: () => string;
		persist: (ctx: ExtensionContext, next: string) => Promise<void>;
	},
): void {
	const z = pi.zod;
	pi.registerTool<ZodType<{ text: string }>>({
		name: "note_add",
		label: "Add to note",
		description:
			'Append a task to the bottom of the current session\'s PlanQueue note (the prompt queue). Use when the user asks to put/add/remember something on the note or list for later (e.g. "coloca na nota", "add to the list", "remember to ..."). Each item becomes a "- [ ]" checkbox.',
		parameters: z.object({
			text: z.string().describe("The task text to append (one line)."),
		}),
		approval: "write",
		async execute(
			_toolCallId: string,
			params: { text: string },
			_signal: AbortSignal | undefined,
			_onUpdate: AgentToolUpdateCallback | undefined,
			ctx: ExtensionContext,
		): Promise<AgentToolResult> {
			if (deps.notePath() === undefined) {
				return {
					content: [
						{ type: "text", text: "No active note for this session yet." },
					],
				};
			}
			await deps.persist(ctx, appendTask(deps.content(), params.text));
			return {
				content: [
					{ type: "text", text: `Added to note: ${params.text.trim()}` },
				],
			};
		},
	});
}

/** Meta-prompt asking the agent to decompose a goal into a prompt-queue plan and write it via the make_note tool. */
function makeNotePrompt(goal: string): string {
	return (
		"Decompose this goal into a sequential prompt queue for my PlanQueue note, then call the make_note tool to write it. " +
		"Each step is ONE prompt I will dispatch in order; put supporting detail in `details` (sent together with the prompt as one message); " +
		"set `barrierAfter: true` only where you must pause for my review before the queue continues. " +
		"Keep prompts concrete and self-contained.\n\nGoal: " +
		goal
	);
}

/**
 * Meta-prompt asking the agent to populate an empty note from the session so far.
 * Shared by the empty-note bootstrap (fires once per session) and `/rebuild-note`
 * when the note is already empty.
 */
const BOOTSTRAP_NOTE_PROMPT =
	"The session note is empty. Based on the conversation so far, please call the make_note tool to create a note with:\n" +
	"1. A short `heading` summarizing what we are working on (becomes `# Heading` at the top of the note).\n" +
	"2. Two or more follow-up sub-tasks as `steps` that I can track and dispatch from the queue.\n" +
	"Keep the heading concise and the tasks actionable.";

/**
 * Meta-prompt for `/rebuild-note`: the note was just cleared for a rebuild, so ask
 * the agent to recreate the plan from the WHOLE conversation, keeping only the
 * remaining actionable work. The old note is included verbatim at the end.
 */
function rebuildNotePrompt(oldNote: string): string {
	return (
		"I just cleared my PlanQueue note to rebuild it from scratch (the previous content is included below and is saved to history). " +
		"Analyze the WHOLE conversation so far and recreate the plan by calling the make_note tool: pass a concise `heading` and `steps` " +
		"that cover ONLY the REMAINING actionable work — skip anything already completed in this session or marked `- [x]` in the old note. " +
		"Put supporting detail in `details` (sent together with the prompt as one message) and set `barrierAfter: true` only where I must review before the queue continues. " +
		"Keep prompts concrete and self-contained.\n\nOld note:\n" +
		oldNote
	);
}

/** Register the `make_note` tool so the agent can write a whole decomposed prompt-queue plan to the note. */
function registerMakeNoteTool(
	pi: ExtensionAPI,
	deps: {
		notePath: () => string | undefined;
		content: () => string;
		persist: (ctx: ExtensionContext, next: string) => Promise<void>;
	},
): void {
	const z = pi.zod;
	pi.registerTool<ZodType<{ heading?: string; steps: QueueStep[] }>>({
		name: "make_note",
		label: "Make note plan",
		description:
			"Write a decomposed prompt-queue plan to the current session's PlanQueue note (the prompt queue). Use after the /make-note command or when the user asks to turn a goal into a queue of prompts. Each step is ONE prompt dispatched in order; put supporting detail in `details` (sent with the prompt as one multi-line message); set `barrierAfter: true` only where the human must review before the queue continues (renders a `---` barrier). Prefer concrete, self-contained prompts.",
		parameters: z.object({
			heading: z
				.string()
				.optional()
				.describe(
					"Optional heading for the note (rendered as `# heading` at the top). Use when bootstrapping an empty note to name the session's topic.",
				),
			steps: z
				.array(
					z.object({
						prompt: z
							.string()
							.describe(
								"One prompt to dispatch (becomes a `- [ ]` queue line).",
							),
						details: z
							.array(z.string())
							.optional()
							.describe("Indented continuation lines sent with the prompt."),
						barrierAfter: z
							.boolean()
							.optional()
							.describe(
								"Add a `---` human-in-the-loop barrier after this step.",
							),
					}),
				)
				.describe("Ordered prompts forming the queue."),
		}),
		approval: "write",
		async execute(
			_toolCallId: string,
			params: { heading?: string; steps: QueueStep[] },
			_signal: AbortSignal | undefined,
			_onUpdate: AgentToolUpdateCallback | undefined,
			ctx: ExtensionContext,
		): Promise<AgentToolResult> {
			if (deps.notePath() === undefined) {
				return {
					content: [
						{ type: "text", text: "No active note for this session yet." },
					],
				};
			}
			const count = params.steps.filter(
				(s) => s.prompt.trim().length > 0,
			).length;
			if (count === 0) {
				return {
					content: [
						{
							type: "text",
							text: "No prompts to write: every step was empty.",
						},
					],
				};
			}
			let base = deps.content();
			if (params.heading) {
				const h = `# ${params.heading}`;
				base = base.trim() === "" ? h : `${h}\n\n${base}`;
			}
			await deps.persist(ctx, appendQueue(base, params.steps));
			return {
				content: [
					{ type: "text", text: `Wrote ${count} prompt(s) to the note queue.` },
				],
			};
		},
	});
}

/** Deps the note slash-commands close over (getters keep them live across session switches). */
interface NoteCommandDeps {
	content: () => string;
	notePath: () => string | undefined;
	sessionsDir: () => string | undefined;
	legacySessionsDirs: () => readonly string[] | undefined;
	persist: (ctx: ExtensionContext, next: string) => Promise<void>;
	openEditor: (ctx: ExtensionContext) => Promise<void>;
	resetQueue: () => void;
}

/** Register the `note`, `planqueue`, `make-note`, `clear-note`, and `rebuild-note` slash commands. */
function registerNoteCommands(pi: ExtensionAPI, deps: NoteCommandDeps): void {
	pi.registerCommand("note", {
		description:
			"Edit PlanQueue notes; `/note <text>` appends a prompt-queue line",
		handler: (args: string, ctx: ExtensionCommandContext): Promise<void> =>
			args.trim().length > 0
				? deps.persist(ctx, appendTask(deps.content(), args))
				: deps.openEditor(ctx),
	});
	pi.registerCommand("planqueue", {
		description:
			"Browse PlanQueue entries from other sessions in this repo/branch",
		handler: (_args: string, ctx: ExtensionCommandContext): Promise<void> => {
			const dir = deps.sessionsDir();
			return ctx.hasUI && dir !== undefined
				? browseNotes(
						ctx,
						pi.pi,
						dir,
						deps.notePath(),
						deps.legacySessionsDirs(),
					)
				: Promise.resolve();
		},
	});
	pi.registerCommand("make-note", {
		description:
			"Turn a goal into a prompt-queue plan written to the note (`/make-note <goal>`)",
		handler: (args: string, _ctx: ExtensionCommandContext): Promise<void> => {
			const goal = args.trim();
			if (goal.length > 0) pi.sendUserMessage(makeNotePrompt(goal));
			return Promise.resolve();
		},
	});
	pi.registerCommand("clear-note", {
		description:
			"Clear the current PlanQueue note (previous version stays in history)",
		handler: async (
			_args: string,
			ctx: ExtensionCommandContext,
		): Promise<void> => {
			if (!ctx.hasUI) return;
			if (deps.content().trim() === "") {
				ctx.ui.notify("Note is already empty", "info");
				return;
			}
			const confirmed = await ctx.ui.confirm(
				"Clear note?",
				"The current note is saved to history and can't be auto-restored.",
			);
			if (!confirmed) return;
			await deps.persist(ctx, "");
			deps.resetQueue();
			ctx.ui.notify("Note cleared (previous version in history)", "info");
		},
	});
	pi.registerCommand("rebuild-note", {
		description:
			"Clear the note and ask the agent to rebuild the plan from the whole session",
		handler: async (
			_args: string,
			ctx: ExtensionCommandContext,
		): Promise<void> => {
			if (!ctx.hasUI) return;
			const old = deps.content();
			if (old.trim() === "") {
				pi.sendUserMessage(BOOTSTRAP_NOTE_PROMPT);
				return;
			}
			const confirmed = await ctx.ui.confirm(
				"Rebuild note?",
				"The current note is cleared (saved to history) and the agent recreates the plan from the whole session.",
			);
			if (!confirmed) return;
			await deps.persist(ctx, "");
			deps.resetQueue();
			pi.sendUserMessage(rebuildNotePrompt(old));
		},
	});
}

export default async function planQueueExtension(
	pi: ExtensionAPI,
): Promise<void> {
	let notePath: string | undefined;
	let historyPath: string | undefined;
	let sessionsDir: string | undefined;
	let legacySessionsDirs: readonly string[] | undefined;
	let loc: ResolvedLocation | undefined;
	let saver: DebouncedSaver | undefined;
	let content = "";
	let editorOpen = false;
	/** Guards the empty-note bootstrap so it fires at most once per session. */
	let bootstrapped = false;
	const shortcuts = await loadShortcuts(pi);

	pi.setLabel("PlanQueue");

	function refreshWidget(ctx: ExtensionContext): void {
		if (!ctx.hasUI) return;
		const shortcut = queueHint(shortcuts, queue.isAuto(), queue.isBlocked());
		ctx.ui.setWidget(
			WIDGET_KEY,
			renderWidgetLines(content, {
				style: widgetStyle(ctx.ui.theme),
				shortcut,
			}),
			{
				placement: "belowEditor",
			},
		);
	}

	async function initSession(ctx: ExtensionContext): Promise<void> {
		saver?.dispose();
		queue.reset();
		bootstrapped = false;
		const [repoToplevel, branch] = await Promise.all([
			runGit(pi, ctx.cwd, ["rev-parse", "--show-toplevel"]),
			runGit(pi, ctx.cwd, ["rev-parse", "--abbrev-ref", "HEAD"]),
		]);
		loc = resolveLocation({
			cwd: ctx.cwd,
			repoToplevel,
			branch,
			sessionId: ctx.sessionManager.getSessionId(),
		});
		notePath = notePathFor(loc, homedir());
		historyPath = historyPathFor(loc, homedir());
		sessionsDir = sessionsDirFor(loc, homedir());
		legacySessionsDirs = legacySessionsDirsFor(loc, homedir());
		try {
			content = await loadNoteWithFallback(
				notePath,
				legacyNotePathsFor(loc, homedir()),
			);
		} catch (err) {
			pi.logger.error(
				`[planqueue] could not load note ${notePath}: ${err instanceof Error ? err.message : String(err)}`,
			);
			content = "";
		}
		const path = notePath;
		saver = createDebouncedSaver((c) => saveNote(path, c));
		refreshWidget(ctx);
	}

	async function persist(ctx: ExtensionContext, next: string): Promise<void> {
		if (notePath === undefined) return;
		const changed = next !== content;
		content = next;
		saver?.schedule(content);
		refreshWidget(ctx);
		if (changed && historyPath !== undefined) {
			try {
				await appendHistory(historyPath, content);
			} catch (err) {
				pi.logger.error(
					`[planqueue] history append failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		}
	}

	async function openEditor(ctx: ExtensionContext): Promise<void> {
		if (!ctx.hasUI || notePath === undefined) return;
		const original = content;
		// No `overlay` option: this mounts the editor in the main input slot (with
		// focus) instead of a hardcoded bottom-center overlay — a natural place to
		// write — and `showHookCustom` restores the prompt on close. While open,
		// auto-run pauses striking (see `editorOpen`) so a save can't clobber strikes.
		editorOpen = true;
		try {
			const result = await ctx.ui.custom<EditorResult>(
				(
					tui: TUI,
					_theme: Theme,
					_keybindings: KeybindingsManager,
					done: (r: EditorResult) => void,
				): CustomEditor => makeNotesEditor(pi.pi, tui, original, done),
			);
			await applyEditorResult(ctx, original, result, persist, historyPath);
		} finally {
			editorOpen = false;
		}
	}

	const queue = createQueue({
		pi,
		content: () => content,
		persist,
		refresh: refreshWidget,
		label: () => (loc ? `${loc.repo}/${loc.branch}` : "PlanQueue queue"),
		editorOpen: () => editorOpen,
		shortcuts,
	});

	pi.on("session_start", (_event, ctx) => initSession(ctx));

	pi.on("session_switch", async (_event, ctx) => {
		await safeFlush(pi, saver);
		await initSession(ctx);
	});

	pi.on("session_shutdown", async () => {
		await safeFlush(pi, saver);
	});

	// Bootstrap: when the first turn settles and the note is still empty, ask the
	// agent to populate it with a heading and suggested follow-up tasks.
	pi.on("session_stop", (_event, _ctx) => {
		if (bootstrapped || content.trim() !== "") return;
		bootstrapped = true;
		pi.sendUserMessage(BOOTSTRAP_NOTE_PROMPT, { deliverAs: "followUp" });
	});

	pi.registerShortcut(shortcuts.editNotes as KeyId, {
		description: "Edit PlanQueue session notes",
		handler: (ctx: ExtensionContext): Promise<void> =>
			openEditor(ctx).catch((err: unknown): void =>
				pi.logger.error(
					`[planqueue] edit-notes shortcut failed: ${err instanceof Error ? err.message : String(err)}`,
				),
			),
	});

	registerNoteCommands(pi, {
		content: () => content,
		notePath: () => notePath,
		sessionsDir: () => sessionsDir,
		legacySessionsDirs: () => legacySessionsDirs,
		persist,
		openEditor,
		resetQueue: () => queue.reset(),
	});
	registerNoteAddTool(pi, {
		notePath: () => notePath,
		content: () => content,
		persist,
	});
	registerMakeNoteTool(pi, {
		notePath: () => notePath,
		content: () => content,
		persist,
	});
}
