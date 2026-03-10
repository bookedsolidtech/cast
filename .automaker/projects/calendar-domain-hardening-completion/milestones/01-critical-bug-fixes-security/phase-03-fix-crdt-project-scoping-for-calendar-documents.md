# Phase 3: Fix CRDT project scoping for calendar documents

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

CalendarService.readCustomEvents() currently uses a single CRDT doc ('calendar', 'shared') for all projects. Change the document ID to be project-scoped: derive a stable slug from projectPath (e.g. replace '/' with '-', strip leading/trailing dashes) and use that as the CRDT doc ID. Update all CRDT methods (readCustomEvents, upsertEventToCrdt, deleteEventFromCrdt) to accept and use the project-scoped doc ID. Update crdt-store.module.ts if the calendar domain registration needs updating.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/services/calendar-service.ts`
- [ ] `apps/server/src/services/crdt-store.module.ts`

### Verification
- [ ] Each projectPath gets its own CRDT calendar document
- [ ] Events created for project A do not appear in project B's calendar
- [ ] Filesystem fallback is unaffected (still uses .automaker/calendar.json scoped by projectPath)
- [ ] Existing CRDT methods (upsertEventToCrdt, deleteEventFromCrdt) all pass the project-scoped doc ID
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
