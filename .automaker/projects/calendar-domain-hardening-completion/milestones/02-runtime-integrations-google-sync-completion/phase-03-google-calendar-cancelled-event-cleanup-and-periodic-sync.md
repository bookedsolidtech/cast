# Phase 3: Google Calendar cancelled event cleanup and periodic sync

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Two gaps in Google Calendar sync: (1) Cancelled events are skipped in syncFromGoogle() but previously synced events that get cancelled upstream persist locally forever. Fix by tracking which sourceIds were returned in the latest sync response and deleting local events whose sourceId is no longer present (within the sync window). (2) Sync is manual-only. Register a periodic scheduler task (e.g. every 6 hours) in scheduler.module.ts that calls syncFromGoogle() for each connected project.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/services/google-calendar-sync-service.ts`
- [ ] `apps/server/src/services/scheduler.module.ts`

### Verification
- [ ] syncFromGoogle() returns a 'deleted' count in addition to synced/created
- [ ] Events whose Google sourceId is absent from the latest sync window are deleted locally
- [ ] Cancelled Google events (status=cancelled) are deleted from local storage
- [ ] A scheduler task runs syncFromGoogle() every 6 hours for all projects with Google Calendar connected
- [ ] Scheduler task is registered in scheduler.module.ts
- [ ] Build passes

---

## Deliverables

- [ ] Code implemented and working
- [ ] Tests passing
- [ ] Documentation updated

---

## Handoff Checklist

Before marking Phase 3 complete:

- [ ] All tasks complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] PR merged to main
- [ ] Team notified

**Next**: Phase 4
