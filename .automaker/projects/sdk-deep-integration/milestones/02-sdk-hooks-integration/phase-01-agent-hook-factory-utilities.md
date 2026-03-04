# Phase 1: Agent hook factory utilities

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Create apps/server/src/lib/agent-hooks.ts with factory functions for building standard hook sets. Implement: buildProgressHooks(emitter, toolCallId, agentLabel) — returns a PostToolUse HookCallbackMatcher that calls emitter.emitProgress() with native tool name, more reliable than onToolUse. buildNotificationHooks(logger, agentLabel) — returns a Notification HookCallbackMatcher that logs agent status messages (permission_prompt, idle_prompt, auth_success). buildLifecycleHooks(events, config) — returns SubagentStart/SubagentStop HookCallbackMatchers that emit authority:agent-registered events. All hooks return {} (no behavior modification) except when explicitly blocking. Export buildDefaultHooks(options) that assembles all three into a hooks Record.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/lib/agent-hooks.ts`

### Verification
- [ ] agent-hooks.ts exports buildProgressHooks, buildNotificationHooks, buildLifecycleHooks, buildDefaultHooks
- [ ] Each factory returns properly typed HookCallbackMatcher arrays
- [ ] PostToolUse hook correctly calls emitter.emitProgress() with tool name and label
- [ ] Notification hook logs to the provided logger without throwing
- [ ] SubagentStop hook emits authority:agent-registered event
- [ ] npm run build:packages passes

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
