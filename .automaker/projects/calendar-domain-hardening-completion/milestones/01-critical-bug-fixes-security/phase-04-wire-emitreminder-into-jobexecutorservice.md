# Phase 4: Wire emitReminder() into JobExecutorService

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

JobExecutorService.executeJob() currently updates job status but never calls calendarService.emitReminder(). Add CalendarService as a constructor dependency (it's already available in services.ts). After marking a job as 'running', emit a reminder with the job title and description. Also emit on completion and failure with appropriate descriptions. This activates the reminder→ReactiveSpawner pipeline that is already wired in services.ts:729.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/services/job-executor-service.ts`
- [ ] `apps/server/src/server/services.ts`

### Verification
- [ ] JobExecutorService accepts CalendarService in its constructor
- [ ] emitReminder() is called when a job starts executing
- [ ] services.ts passes calendarService to JobExecutorService constructor
- [ ] The calendar:reminder event fires and reaches the ReactiveSpawner onReminder subscription
- [ ] Build passes

---

## Deliverables

- [ ] Code implemented and working
- [ ] Tests passing
- [ ] Documentation updated

---

## Handoff Checklist

Before marking Phase 4 complete:

- [ ] All tasks complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] PR merged to main
- [ ] Team notified

**Next**: Phase 5
