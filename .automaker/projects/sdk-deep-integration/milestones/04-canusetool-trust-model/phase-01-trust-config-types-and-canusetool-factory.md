# Phase 1: Trust config types and canUseTool factory

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add subagentTrust: 'full' | 'gated' to AvaConfig in apps/server/src/routes/chat/ava-config.ts (default: 'full'). Create apps/server/src/lib/agent-trust.ts: export buildCanUseToolCallback(trust, approvalEmitter?) that returns undefined when trust is 'full' (preserving bypassPermissions), and a canUseTool async function when trust is 'gated'. The gated canUseTool: emits a subagent:tool-approval-request event via EventEmitter with { toolCallId, toolName, toolInput, approvalId }, then awaits a Promise that resolves when a corresponding subagent:tool-approval-response event fires with matching approvalId. Timeout after 5 minutes → auto-deny. Also update DynamicAgentExecutor to conditionally NOT set permissionMode bypassPermissions when canUseTool is provided (pass permissionMode: 'default' instead).

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/routes/chat/ava-config.ts`
- [ ] `apps/server/src/lib/agent-trust.ts`
- [ ] `apps/server/src/services/dynamic-agent-executor.ts`
- [ ] `apps/server/src/providers/simple-query-service.ts`
- [ ] `apps/server/src/providers/claude-provider.ts`

### Verification
- [ ] AvaConfig.subagentTrust defaults to 'full' in DEFAULT_AVA_CONFIG
- [ ] buildCanUseToolCallback returns undefined for 'full' trust
- [ ] buildCanUseToolCallback returns async function for 'gated' trust
- [ ] Gated callback emits approval request event with unique approvalId
- [ ] Gated callback awaits response event or auto-denies after 5 min timeout
- [ ] DynamicAgentExecutor passes permissionMode: 'default' when canUseTool is set
- [ ] permissionMode: 'bypassPermissions' preserved when no canUseTool (full trust)

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
