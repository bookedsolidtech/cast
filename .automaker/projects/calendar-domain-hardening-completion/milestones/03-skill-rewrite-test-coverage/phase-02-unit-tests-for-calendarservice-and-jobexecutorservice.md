# Phase 2: Unit tests for CalendarService and JobExecutorService

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add Vitest unit tests covering the core calendar business logic. CalendarService tests: listEvents() aggregation (custom + feature events), createEvent() filesystem path, updateEvent() not-found error, deleteEvent() removes correct event, upsertBySourceId() create and update paths, getDueJobs() filters correctly by date+time+status, isDateInRange() edge cases. JobExecutorService tests: executeJob() dispatches start-agent/run-automation/run-command correctly, executeJob() marks job as failed on error, command sanitization rejects shell metacharacters, command sanitization allows valid commands.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/tests/unit/calendar-service.test.ts`
- [ ] `apps/server/tests/unit/job-executor-service.test.ts`

### Verification
- [ ] CalendarService unit tests cover all public methods
- [ ] JobExecutorService unit tests cover dispatch, status transitions, and command sanitization
- [ ] Tests run with npm run test:server
- [ ] All tests pass
- [ ] Build passes

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
