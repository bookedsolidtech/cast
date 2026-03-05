# Phase 1: CeremonyState Types + Pure Transition Function

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add CeremonyPhase, CeremonyState, and CeremonyTransition types to libs/types/src/ceremony.ts (new file). CeremonyPhase values: awaiting_kickoff, milestone_active, standup_due, milestone_retro, project_retro, project_complete. CeremonyState holds: phase, projectPath, projectSlug, currentMilestone (optional), lastStandup (ISO), lastRetro (ISO), standupCadence (cron string, default '0 9 * * 1'), history (CeremonyTransition[]). Export all types from libs/types/src/index.ts. Create apps/server/src/services/ceremony-state-machine.ts with a pure transition() function: takes (state: CeremonyState, event: string, payload: unknown) => CeremonyState. Implement all transition rules: awaiting_kickoff+project:lifecycle:launched→milestone_active, milestone_active+milestone:completed→milestone_retro, milestone_retro+ceremony:fired(retro)→milestone_active or project_retro (based on remaining milestones), project_retro+ceremony:fired(project_retro)→project_complete. Each transition appends to state.history. Unknown event+phase combos return state unchanged.

---

## Tasks

### Files to Create/Modify
- [ ] `libs/types/src/ceremony.ts`
- [ ] `libs/types/src/index.ts`
- [ ] `apps/server/src/services/ceremony-state-machine.ts`

### Verification
- [ ] CeremonyPhase, CeremonyState, CeremonyTransition types exported from @protolabsai/types
- [ ] transition() is a pure function — no imports of services or EventEmitter
- [ ] All transition rules implemented and returning correct next phase
- [ ] Unknown event returns state unchanged (no throw)
- [ ] Transition appends to history array with from, to, trigger, timestamp
- [ ] npm run build:packages passes
- [ ] TypeScript compiles clean

---

## Deliverables

- [ ] Code implemented and working
- [ ] Tests passing
- [ ] Documentation updated

---

## Handoff Checklist

Before marking Phase 1 complete:

- [ ] All tasks complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] PR merged to main
- [ ] Team notified

**Next**: Phase 2
