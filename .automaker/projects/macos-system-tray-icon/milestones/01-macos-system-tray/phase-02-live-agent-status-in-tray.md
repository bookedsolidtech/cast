# Phase 2: Live Agent Status in Tray

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add a polling loop in the main process (every 10 seconds) that fetches http://localhost:{serverPort}/api/agents/running using the existing serverPort module variable and AUTOMAKER_API_KEY for the X-API-Key header. Parse the response to get running agent count. Update the tray tooltip to show 'protoLabs Studio — N agents running' (or 'Idle' when 0). Rebuild the tray context menu dynamically to include a non-clickable status line (e.g. '● 2 agents running' or '○ Idle') above the separator. Clear the polling interval in the before-quit handler. Handle fetch errors gracefully (keep last known state, no crashes).

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/main.ts`

### Verification
- [ ] Tray tooltip updates every 10 seconds with agent count
- [ ] Context menu shows live agent status line
- [ ] Status shows 'Idle' when no agents running
- [ ] Status shows count when agents are active
- [ ] Polling stops cleanly when app quits
- [ ] Fetch errors are caught and logged without crashing
- [ ] npm run typecheck passes

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
