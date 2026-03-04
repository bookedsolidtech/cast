# Phase 1: Provider types and ClaudeProvider wiring

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add hooks, canUseTool, and disallowedTools to ExecuteOptions in libs/types/src/provider.ts. Add the same fields to SimpleQueryOptions and StreamingQueryOptions in apps/server/src/providers/simple-query-service.ts and wire them into the providerOptions object passed to ClaudeProvider. In apps/server/src/providers/claude-provider.ts, spread hooks, canUseTool, and disallowedTools into sdkOptions (following the existing pattern for agents at line 266). Import SDK types HookCallback, HookCallbackMatcher, and CanUseTool from @anthropic-ai/claude-agent-sdk for type safety. Do NOT add mcpServers here — it is already plumbed.

---

## Tasks

### Files to Create/Modify
- [ ] `libs/types/src/provider.ts`
- [ ] `apps/server/src/providers/simple-query-service.ts`
- [ ] `apps/server/src/providers/claude-provider.ts`

### Verification
- [ ] ExecuteOptions has optional hooks, canUseTool, and disallowedTools fields
- [ ] SimpleQueryOptions and StreamingQueryOptions have the same fields
- [ ] ClaudeProvider.executeQuery() passes hooks/canUseTool/disallowedTools to sdkOptions when provided
- [ ] npm run typecheck passes with zero errors
- [ ] Existing behavior unchanged when fields are omitted (undefined)

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
