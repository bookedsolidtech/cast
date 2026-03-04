# Phase 2: Gated approval WebSocket flow and inline UI

**Duration**: 2+ weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Wire the approval event loop through the server and client. Server: in apps/server/src/routes/chat/index.ts, after loading avaConfig, if subagentTrust is 'gated' call buildCanUseToolCallback and pass approvalEmitter (the events bus). Add a POST /api/chat/tool-approval endpoint that accepts { approvalId, approved: boolean } and emits subagent:tool-approval-response to resolve the waiting canUseTool promise. Client: in apps/ui/src/hooks/use-chat-session.ts, subscribe to the subagent:tool-approval-request WebSocket event and surface it as a pending approval in the chat state. Add a SubagentApprovalCard component in libs/ui/src/ai/ that renders inline in the chat with tool name, input details, Approve/Deny buttons. Wire button clicks to POST /api/chat/tool-approval.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/routes/chat/index.ts`
- [ ] `apps/server/src/routes/chat/ava-config.ts`
- [ ] `apps/ui/src/hooks/use-chat-session.ts`
- [ ] `libs/ui/src/ai/subagent-approval-card.tsx`
- [ ] `libs/ui/src/ai/chat-message-list.tsx`

### Verification
- [ ] POST /api/chat/tool-approval resolves the waiting canUseTool promise
- [ ] SubagentApprovalCard renders tool name, abbreviated input, Approve/Deny buttons
- [ ] Approving triggers the inner agent to continue with the tool
- [ ] Denying blocks the tool and sends denial reason to inner agent
- [ ] 5-minute timeout auto-denies and shows expired state in UI
- [ ] Full trust mode (default) shows no approval UI — behavior unchanged

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
