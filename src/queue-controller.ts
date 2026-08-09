/**
 * Queue controller for the PlanQueue prompt queue (OMP-coupled).
 *
 * The note IS the queue (lines read top-to-bottom; each task line carries its
 * state as a checkbox marker):
 * - the queue-step key sends the next `- [ ]` task (marking it `- [>]`), or deletes a `---` barrier.
 * - the toggle-auto key toggles auto-run (primes immediately when already idle).
 * - on each `session_stop` the in-flight `- [>]` task is marked done (`- [x]`); in
 *   auto-run the next task is then fed, until the queue drains or hits a `---` barrier.
 *
 * Pure queue parsing lives in `./queue`; this module owns the OMP wiring.
 */

import {
	completeInflight,
	findHead,
	humanizeKey,
	isQueueSpent,
	markInflight,
	removeBarrier,
	type ShortcutConfig,
} from "@aryrabelo/planqueue-core";
import type {
	ExtensionAPI,
	ExtensionContext,
	SessionStopEvent,
} from "@oh-my-pi/pi-coding-agent";
import type { KeyId } from "@oh-my-pi/pi-tui";
import { type Bead, beadDispatchPrompt } from "./beads";

/**
 * Whether a settling turn ended badly, so auto-run must halt instead of feeding
 * the next prompt into a broken session. `last_assistant_message` is an
 * `AgentMessage` union; only its assistant variant carries `stopReason`.
 */
function turnFailed(event: SessionStopEvent): boolean {
	const last = event.last_assistant_message;
	return (
		!!last &&
		"stopReason" in last &&
		(last.stopReason === "error" || last.stopReason === "aborted")
	);
}

/** Best-effort herdr HITL ping (no-op outside herdr); a missing/older herdr must never break the session. */
async function pingHerdr(pi: ExtensionAPI, label: string): Promise<void> {
	if (process.env.HERDR_ENV !== "1") return;
	try {
		await pi.exec(
			"herdr",
			[
				"notification",
				"show",
				"Queue paused - your turn",
				"--body",
				label,
				"--sound",
				"request",
			],
			{ timeout: 2000 },
		);
	} catch {
		// Best-effort: a missing/older herdr must never break the session.
	}
}

/** Hooks for the optional Beads-backed queue source (`bd ready`), used instead of note parsing when present. */
export interface BeadsQueueHooks {
	/** Next ready bead to dispatch, or undefined when none are ready. */
	next: () => Bead | undefined;
	/** Claim a bead in Beads and remove it from the local ready cache. */
	claim: (bead: Bead) => Promise<void>;
	/** Close the bead if it is still open (guards against overwriting an already-closed reason). */
	settle: (id: string) => Promise<void>;
	/** Re-fetch the ready-bead cache from `bd ready`. */
	refreshCache: () => Promise<void>;
}

/** Dependencies the queue controller needs from the extension factory. */
export interface QueueDeps {
	pi: ExtensionAPI;
	/** Current note text. */
	content: () => string;
	/** Persist a new note body (debounced save + history + widget refresh). */
	persist: (ctx: ExtensionContext, next: string) => Promise<void>;
	/** Re-render the widget (its hint reflects auto-mode). */
	refresh: (ctx: ExtensionContext) => void;
	/** `repo/branch` label for the herdr HITL ping. */
	label: () => string;
	/** Whether the notes editor is open — auto-run pauses so a save can't clobber task state. */
	editorOpen: () => boolean;
	/** Resolved, possibly user-overridden shortcut keys. */
	shortcuts: ShortcutConfig;
	/**
	 * Called once when the queue becomes spent (only done tasks and/or a summary heading remain)
	 * after it was actually used. The caller decides what to do (confirm+rebuild vs. a passive
	 * notice); this module only detects the drained state. Optional; skipped when absent.
	 */
	onDrained?: (ctx: ExtensionContext) => Promise<void>;
	/**
	 * Optional Beads-backed queue source. When present, the queue-step key and session_stop
	 * settle dispatch `bd ready` issues instead of parsing note checkbox lines.
	 */
	beads?: BeadsQueueHooks;
}

/** Public surface of the queue controller used by the factory. */
export interface QueueController {
	isAuto: () => boolean;
	isBlocked: () => boolean;
	reset: () => void;
	/** The bead currently in flight (claimed, awaiting settle), or null outside beads mode / when idle. */
	inflightBead: () => Bead | null;
}

/** Wire the note-as-prompt-queue and return its control surface. */
export function createQueue(deps: QueueDeps): QueueController {
	const { pi } = deps;
	let auto = false;
	// `blocked` drives the widget hint's unlock instruction and, inside herdr, mirrors
	// into the sidebar via a strictly-paired `herdr:blocked` event (one true <-> one false).
	let blocked = false;
	// A dispatch has run this queue at least once — gates the drained-note callback so a
	// fresh (never-run) note is bootstrapped, not flagged as drained.
	let usedQueue = false;
	// The drained callback has already fired for the current spent state (avoids re-nagging).
	let drainedHandled = false;
	// Auto-run is paused because the user has an unsent draft — notify only on the transition.
	let draftPaused = false;
	// The bead claimed by the current in-flight turn (beads mode only) — settled on session_stop.
	let inflightBead: Bead | null = null;
	function setBlocked(active: boolean, label?: string): void {
		if (active === blocked) return;
		blocked = active;
		if (process.env.HERDR_ENV !== "1") return;
		try {
			pi.events.emit(
				"herdr:blocked",
				active ? { active: true, label } : { active: false },
			);
		} catch {
			// Best-effort: the herdr integration may be absent or older.
		}
	}

	/** Whether the user has unsent text in the core input editor (never clobber their typing). */
	function hasDraft(ctx: ExtensionContext): boolean {
		return ctx.hasUI && ctx.ui.getEditorText().trim() !== "";
	}

	/** Pause auto-run for an unsent draft, notifying once per pause episode. */
	function pauseForDraft(ctx: ExtensionContext): void {
		if (draftPaused) return;
		draftPaused = true;
		ctx.ui.notify(
			"Auto-run paused while you're typing — send your message to resume the queue",
			"info",
		);
	}

	async function sendPrompt(
		ctx: ExtensionContext,
		line: number,
		text: string,
		deliverAs?: "followUp",
	): Promise<void> {
		// Send as a real user message so the dispatched prompt shows in the transcript exactly
		// as if the user typed it. From idle (manual step / priming) a plain send starts the turn;
		// from inside session_stop (auto-advance) "followUp" queues it for the post-settle drain
		// (a plain send would throw AgentBusyError while the settling turn is still streaming).
		// Any dispatch resumes the queue — clear a prior human-in-the-loop or draft pause, and mark
		// the queue as used so the drained-note callback can fire once it later empties.
		setBlocked(false);
		usedQueue = true;
		draftPaused = false;
		drainedHandled = false;
		pi.sendUserMessage(text, deliverAs ? { deliverAs } : undefined);
		await deps.persist(ctx, markInflight(deps.content(), line));
	}

	/**
	 * Claim and dispatch a bead (beads mode only): send its prompt as a real user message
	 * (mirrors `sendPrompt`'s idle-vs-followUp split) and track it as in-flight for settle.
	 */
	async function dispatchBead(
		ctx: ExtensionContext,
		beads: BeadsQueueHooks,
		bead: Bead,
		deliverAs?: "followUp",
	): Promise<void> {
		setBlocked(false);
		usedQueue = true;
		draftPaused = false;
		await beads.claim(bead);
		inflightBead = bead;
		pi.sendUserMessage(
			beadDispatchPrompt(bead),
			deliverAs ? { deliverAs } : undefined,
		);
		deps.refresh(ctx);
	}

	async function haltAtBarrier(ctx: ExtensionContext): Promise<void> {
		auto = false;
		setBlocked(true, deps.label());
		deps.refresh(ctx);
		ctx.ui.notify(
			`Queue paused at --- (human in the loop) — ${humanizeKey(deps.shortcuts.queueStep)} to pass`,
			"info",
		);
		await pingHerdr(pi, deps.label());
	}

	/** Feed the next line while the agent is idle (prompt -> send, barrier -> halt). */
	async function feedIdle(ctx: ExtensionContext): Promise<void> {
		const head = findHead(deps.content());
		if (head.kind === "prompt") {
			if (hasDraft(ctx)) return pauseForDraft(ctx);
			await sendPrompt(ctx, head.line, head.text);
		} else if (head.kind === "barrier") await haltAtBarrier(ctx);
	}

	async function step(ctx: ExtensionContext): Promise<void> {
		if (auto) {
			ctx.ui.notify(
				"Auto-run is on — toggle it off (Ctrl+shift+down) to step manually",
				"info",
			);
			return;
		}
		// A manual queue-step is the human engaging — clear any pause state.
		setBlocked(false);
		const beads = deps.beads;
		if (beads) {
			const bead = beads.next();
			if (!bead) {
				ctx.ui.notify("No ready beads — bd ready is empty", "info");
				return;
			}
			await dispatchBead(
				ctx,
				beads,
				bead,
				ctx.isIdle() ? undefined : "followUp",
			);
			return;
		}
		const head = findHead(deps.content());
		if (head.kind === "empty") {
			ctx.ui.notify("Note queue is empty", "info");
			return;
		}
		if (head.kind === "barrier") {
			await deps.persist(ctx, removeBarrier(deps.content(), head.line));
			ctx.ui.notify("Passed --- barrier", "info");
			return;
		}
		// Plain send from idle starts the turn; mid-turn (thinking) a plain send throws
		// AgentBusyError, so deliver as a follow-up that drains after the current turn settles.
		await sendPrompt(
			ctx,
			head.line,
			head.text,
			ctx.isIdle() ? undefined : "followUp",
		);
	}

	async function toggle(ctx: ExtensionContext): Promise<void> {
		auto = !auto;
		deps.refresh(ctx);
		ctx.ui.notify(auto ? "Queue auto-run ON" : "Queue auto-run OFF", "info");
		// Prime: session_stop won't fire while the agent is already idle.
		if (!auto || !ctx.isIdle()) return;
		const beads = deps.beads;
		if (beads) {
			if (hasDraft(ctx)) return pauseForDraft(ctx);
			const bead = beads.next();
			if (bead) await dispatchBead(ctx, beads, bead);
			return;
		}
		await feedIdle(ctx);
	}

	/** In auto-run, advance after a settle: halt on failure/barrier, else feed one task. */
	async function autoAdvance(
		event: SessionStopEvent,
		ctx: ExtensionContext,
	): Promise<void> {
		if (turnFailed(event)) {
			auto = false;
			deps.refresh(ctx);
			return;
		}
		if (deps.editorOpen()) return;
		const head = findHead(deps.content());
		if (head.kind === "empty") return;
		if (head.kind === "barrier") {
			await haltAtBarrier(ctx);
			return;
		}
		if (hasDraft(ctx)) return pauseForDraft(ctx);
		// Feed the next line as a follow-up user message (visible in the transcript) instead of an
		// invisible additionalContext continuation. After settle the agent auto-drains the follow-up
		// into a fresh turn whose session_stop re-enters here, draining one visible user turn per
		// line with no SESSION_STOP_CONTINUATION_CAP ceiling.
		await sendPrompt(ctx, head.line, head.text, "followUp");
	}

	/** In beads mode: same auto-run advance semantics as `autoAdvance`, dispatching a bead instead of a note line. */
	async function autoAdvanceBeads(
		event: SessionStopEvent,
		ctx: ExtensionContext,
		beads: BeadsQueueHooks,
	): Promise<void> {
		if (turnFailed(event)) {
			auto = false;
			deps.refresh(ctx);
			return;
		}
		if (deps.editorOpen()) return;
		const bead = beads.next();
		if (!bead) return;
		if (hasDraft(ctx)) return pauseForDraft(ctx);
		await dispatchBead(ctx, beads, bead, "followUp");
	}

	/**
	 * After a settle, invoke `deps.onDrained` once when the queue is spent (only done tasks
	 * and/or a summary heading remain) AND was actually used (`usedQueue`) — skipped while
	 * editing, while the user has a draft, or once already fired for this spent state. The
	 * callback decides the UX (confirm+rebuild vs. passive notice); this only detects drain.
	 */
	async function maybeOfferRefresh(ctx: ExtensionContext): Promise<void> {
		if (deps.onDrained === undefined || !ctx.hasUI) return;
		if (!usedQueue || !isQueueSpent(deps.content())) {
			drainedHandled = false;
			return;
		}
		if (drainedHandled || deps.editorOpen() || hasDraft(ctx)) return;
		drainedHandled = true;
		await deps.onDrained(ctx);
	}

	pi.on("session_stop", async (event, ctx) => {
		const beads = deps.beads;
		if (beads) {
			if (inflightBead !== null) {
				const finished = inflightBead;
				try {
					await beads.settle(finished.id);
				} catch (err) {
					ctx.ui.notify(
						`Failed to close bead ${finished.id}: ${err instanceof Error ? err.message : String(err)}`,
						"error",
					);
				}
				inflightBead = null;
			}
			// Always re-sync in beads mode: the agent may have run `bd` itself during the
			// turn (or another terminal between turns), and there is no watcher/polling.
			try {
				await beads.refreshCache();
			} catch (err) {
				ctx.ui.notify(
					`Failed to refresh bd ready: ${err instanceof Error ? err.message : String(err)}`,
					"error",
				);
			}
			deps.refresh(ctx);
			if (auto) await autoAdvanceBeads(event, ctx, beads);
			return;
		}
		// A settled turn means the in-flight task finished — mark it done (manual or auto).
		const completed = completeInflight(deps.content());
		if (completed !== deps.content()) await deps.persist(ctx, completed);
		if (auto) await autoAdvance(event, ctx);
		await maybeOfferRefresh(ctx);
	});

	pi.registerShortcut(deps.shortcuts.queueStep as KeyId, {
		description:
			"Queue: send the next note line (delete a --- barrier to pass it)",
		handler: (ctx: ExtensionContext): Promise<void> =>
			step(ctx).catch((err: unknown): void =>
				pi.logger.error(
					`[planqueue] queue-step failed: ${err instanceof Error ? err.message : String(err)}`,
				),
			),
	});
	pi.registerShortcut(deps.shortcuts.queueToggleAuto as KeyId, {
		description: "Queue: toggle auto-run of the note lines",
		handler: (ctx: ExtensionContext): Promise<void> =>
			toggle(ctx).catch((err: unknown): void =>
				pi.logger.error(
					`[planqueue] queue-toggle failed: ${err instanceof Error ? err.message : String(err)}`,
				),
			),
	});

	return {
		isAuto: (): boolean => auto,
		isBlocked: (): boolean => blocked,
		inflightBead: (): Bead | null => inflightBead,
		reset: (): void => {
			auto = false;
			setBlocked(false);
			usedQueue = false;
			drainedHandled = false;
			draftPaused = false;
			inflightBead = null;
		},
	};
}
