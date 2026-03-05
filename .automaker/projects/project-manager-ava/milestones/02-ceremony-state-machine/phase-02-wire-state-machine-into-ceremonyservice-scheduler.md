# Phase 2: Wire State Machine into CeremonyService + Scheduler

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Update CeremonyService to load and persist CeremonyState per project. On receiving milestone:started, milestone:completed, project:completed, or ceremony:fired events: load state from .automaker/projects/{slug}/ceremony-state.json (create with awaiting_kickoff if missing), call transition(), persist new state, then conditionally fire the LangGraph flow based on the new phase. Add getCeremonyState(projectPath, projectSlug) public method. Wire standup scheduling: on project:lifecycle:launched, register a SchedulerService task named pm-standup-{slug} using standupCadence from CeremonyState — task handler emits milestone:started to trigger standup flow. On project:completed, unregister the standup task. Pass schedulerService into CeremonyService via a new setSchedulerService() method, wired in apps/server/src/server/wiring.ts.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/services/ceremony-service.ts`
- [ ] `apps/server/src/server/wiring.ts`

### Verification
- [ ] ceremony-state.json created in .automaker/projects/{slug}/ on first event
- [ ] State transitions correctly through full lifecycle
- [ ] Full transition history in ceremony-state.json after multiple ceremonies
- [ ] pm-standup-{slug} registered in SchedulerService when project launches
- [ ] Standup task unregistered when project completes
- [ ] getCeremonyState() returns current state
- [ ] Existing CeremonyAuditLogService recording continues unchanged
- [ ] TypeScript compiles clean

---

## Deliverables

- [ ] Code implemented and working
- [ ] Tests passing
- [ ] Documentation updated

---

## Handoff Checklist

Before marking Phase 2 complete:

- [ ] All tasks complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] PR merged to main
- [ ] Team notified

**Next**: Phase 3
