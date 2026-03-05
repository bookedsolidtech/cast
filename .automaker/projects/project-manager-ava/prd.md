# PRD: Project Manager Ava

## Situation
The project lifecycle system has all the primitives — ProjectService, ProjectLifecycleService, CeremonyService, event bus, agent templates, Vercel AI SDK chat route — but they're disconnected. Users create projects via MCP tools or CLI skills, not through natural conversation. CeremonyService fires LangGraph flows on raw milestone/project events with no cadence tracking or state machine. There's no persistent PM agent per project. The project detail UI has 6 tabs (PRD, Milestones, Features, Documents, Links, Updates) with desktop-first fixed-width layout and minimal mobile support. Features and epics are displayed in separate flat lists rather than nested by relationship.

## Problem
Four gaps prevent the project system from being a complete PM experience: (1) No persistent PM agent per project — ceremonies are fire-and-forget, no state tracking across the project lifecycle; (2) Ceremony cadence is event-reactive only (milestone:started fires standup) with no scheduled cadence and no state machine; (3) Project creation requires MCP tools or CLI skills — users cannot initiate via natural chat; (4) Project detail UI has 6 tabs that overlap (Milestones tab is redundant when Features shows epics), doesn't organize features under their epics, and breaks on mobile viewports.

## Approach
Four milestones in dependency order: UI overhaul first (independent, can ship immediately); ceremony state machine second (foundation for PM agent); PM agent service third (consumes ceremony state, exposes chat API); chat-initiated creation fourth (wires all three into Ava conversation). PM agents use Vercel AI SDK streamText() matching the existing /api/chat pattern. Ceremony state machine is a pure transition function persisted to .automaker/projects/{slug}/ceremony-state.json. PM agent tools are sandboxed — no bash, no file write, no code.

## Results
Users can say 'create a project for X' in Ava chat and get a full lifecycle: PRD generated, features created, auto-mode started, PM agent spawned. Each project has a persistent PM agent accessible via a slide-out chat panel in the project detail view. Ceremonies fire on cadence (not just events) with full audit trail. Project detail is usable on mobile with 4 focused tabs. Features are organized under their parent epics.

## Constraints
PM agents must be sandboxed — no bash, canModifyFiles: false, canCommit: false,Use Vercel AI SDK streamText() for PM chat (not Claude Agent SDK — that is for worktree execution),Ceremony state machine must be a pure function (no side effects in transition()),Each phase independently buildable with clean typecheck,No new npm dependencies unless strictly necessary,Do not break existing CeremonyService event subscriptions or CeremonyAuditLogService,Mobile overhaul must not break existing desktop layout — use Tailwind responsive prefixes
