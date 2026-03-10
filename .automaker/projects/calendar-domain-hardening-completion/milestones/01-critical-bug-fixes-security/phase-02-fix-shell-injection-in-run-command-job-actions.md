# Phase 2: Fix shell injection in run-command job actions

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

In JobExecutorService.executeCommand(), replace the raw exec() call with a safe execution strategy. Validate and sanitize the command before execution: reject commands containing shell metacharacters (;, &&, ||, |, >, <, $, `, backtick) unless explicitly escaped. Add a maximum command length limit. Log the sanitized command before execution. Update the CalendarEvent type docs to clarify the allowed command format.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/services/job-executor-service.ts`
- [ ] `libs/types/src/calendar.ts`

### Verification
- [ ] Commands with unescaped shell metacharacters are rejected with a clear error
- [ ] Legitimate single commands (e.g. 'npm run build') continue to work
- [ ] Maximum command length enforced (e.g. 1024 chars)
- [ ] Command sanitization is unit-testable as a pure function
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
