# Phase 3: Integration tests for calendar API routes

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add Vitest integration tests for the calendar HTTP routes using supertest or the existing test infrastructure. Cover: POST /api/calendar/list with date range and type filters, POST /api/calendar/create validates required fields and job-specific fields, POST /api/calendar/update returns updated event, POST /api/calendar/delete removes the event, POST /api/calendar/run-job rejects non-pending jobs, POST /api/calendar/run-job starts execution for pending jobs.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/tests/unit/calendar-routes.test.ts`

### Verification
- [ ] All 6 calendar route endpoints have test coverage
- [ ] Validation error cases are tested (missing fields, wrong types, wrong job status)
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

Before marking Phase 3 complete:

- [ ] All tasks complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] PR merged to main
- [ ] Team notified

**Next**: Phase 4
