# Phase 1: WebSocket broadcast for calendar mutations and job lifecycle

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Calendar CRUD operations and job state changes currently emit no WebSocket events. In the calendar routes (routes/calendar/index.ts), inject the EventEmitter and emit events after successful create/update/delete operations (e.g. 'calendar:event:created', 'calendar:event:updated', 'calendar:event:deleted'). In services.ts, subscribe to job:started/job:completed/job:failed and broadcast them to WebSocket clients. Define the event payload shapes. The frontend hook (use-calendar-events.ts) should subscribe to these WebSocket events and refetch or patch local state.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/routes/calendar/index.ts`
- [ ] `apps/server/src/server/services.ts`
- [ ] `apps/ui/src/components/views/calendar-view/use-calendar-events.ts`

### Verification
- [ ] Creating a calendar event emits 'calendar:event:created' WebSocket event
- [ ] Updating a calendar event emits 'calendar:event:updated' WebSocket event
- [ ] Deleting a calendar event emits 'calendar:event:deleted' WebSocket event
- [ ] job:started, job:completed, job:failed are broadcast to WebSocket clients
- [ ] Frontend hook subscribes to calendar WebSocket events and triggers refetch
- [ ] Build passes

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
