# Project: Project Manager Ava

## Goal
Promote the project lifecycle system from disconnected primitives into a unified PM experience: per-project PM agents that live for the lifetime of a project, accessible via chat, event-driven, managing ceremonies through a persistent state machine, and initiation via natural Ava conversation. Simultaneously overhaul the project detail UI for mobile usability by consolidating overlapping tabs and organizing features under epics.

## Milestones
1. Mobile Project View Overhaul - Consolidate 6 tabs to 4, organize features under their parent epics with nested accordion grouping, merge Documents and Links into a conditional Resources tab, and make the project detail layout responsive on mobile viewports. This milestone is UI-only with no server changes.
2. Ceremony State Machine - Replace fire-and-forget ceremony events with a persistent state machine that tracks where each project is in its ceremony cadence. Each active project gets a ceremony-state.json file with full transition history. Standups fire on cron schedule (not just on milestone events) via SchedulerService integration.
3. Project PM Agent Service - Build ProjectPMService that maintains a persistent, scoped PM agent session per project. PM agents are accessible via a new /api/project-pm/chat streaming endpoint and respond to lifecycle events. Expose PM chat as a slide-out panel in the project detail UI.
4. Chat-Initiated Project Creation - Wire project lifecycle tools into the main Ava chat so users can initiate, refine, and launch projects through natural conversation. Full flow: user describes idea → Ava generates PRD → user approves → features created → PM agent spawned.
