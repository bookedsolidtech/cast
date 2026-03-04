# Phase 2: Wire hooks into DynamicAgentExecutor and update progress tracking

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Update DynamicAgentExecutor.execute() to call buildDefaultHooks() and merge with any caller-provided hooks. Pass the merged hooks object to simpleQuery/streamingQuery. When hooks are active, the PostToolUse hook handles progress tracking — retain onText/onToolUse for backward compatibility but they become secondary. Update execute_dynamic_agent in apps/server/src/routes/chat/ava-tools.ts to let hook-based progress replace the manual emitter.emitProgress() in the onToolUse callback (the hook fires natively). The onText callback for 'Composing response' can remain as-is since PostToolUse does not cover text generation.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/services/dynamic-agent-executor.ts`
- [ ] `apps/server/src/routes/chat/ava-tools.ts`

### Verification
- [ ] DynamicAgentExecutor builds and passes hooks to the query
- [ ] PostToolUse hook fires for every tool call the inner agent makes
- [ ] Tool progress labels appear in Ava chat UI during inner agent execution
- [ ] SubagentStop lifecycle events are emitted
- [ ] Notification messages from inner agents are logged
- [ ] Backward-compatible: behavior unchanged when no hooks are provided by caller

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
