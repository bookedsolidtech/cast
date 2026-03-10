# Phase 1: Fix MCP enum mismatch and ID prefix inconsistency

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

In calendar-tools.ts, replace 'feature_due_date' with 'feature' and add 'google' and 'ceremony' to the types enum. In calendar-service.ts, unify the ID prefix in upsertBySourceId() to use 'event-' consistently on both CRDT and filesystem paths (remove the 'google-' prefix on the filesystem fallback branch).

---

## Tasks

### Files to Create/Modify
- [ ] `packages/mcp-server/src/tools/calendar-tools.ts`
- [ ] `apps/server/src/services/calendar-service.ts`

### Verification
- [ ] MCP list_calendar_events accepts 'feature', 'google', 'ceremony' as valid type filter values
- [ ] 'feature_due_date' is removed from the enum
- [ ] upsertBySourceId() generates IDs with 'event-' prefix on both CRDT and filesystem paths
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
