# Phase 2: Ceremony-to-calendar integration

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

ceremony-service.ts has no CalendarService integration despite 'ceremony' being a valid CalendarEventType. Add CalendarService as a dependency in ceremony-service.ts (or ceremony.module.ts). When a ceremony is created or scheduled, upsert a 'ceremony' type CalendarEvent via calendarService.upsertBySourceId() using the ceremony ID as sourceId. When a ceremony is cancelled or deleted, delete the corresponding calendar event. Wire the dependency in services.ts / ceremony.module.ts.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/services/ceremony-service.ts`
- [ ] `apps/server/src/services/ceremony.module.ts`

### Verification
- [ ] Creating a ceremony creates a 'ceremony' type CalendarEvent
- [ ] Cancelling/deleting a ceremony removes the corresponding CalendarEvent
- [ ] ceremony CalendarEvents are returned by list_calendar_events and appear in the UI
- [ ] sourceId is set to a stable ceremony identifier for deduplication
- [ ] No circular service dependencies introduced
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
