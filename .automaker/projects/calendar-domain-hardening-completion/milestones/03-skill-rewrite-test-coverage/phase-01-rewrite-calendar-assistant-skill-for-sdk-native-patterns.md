# Phase 1: Rewrite calendar-assistant skill for SDK-native patterns

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

The calendar-assistant.md skill references execute_dynamic_agent as the delegation mechanism for other agents to reach it. That pattern is being retired. Rewrite the skill to: (1) remove all execute_dynamic_agent references, (2) describe how it fits into the SDK-native subagent model where agents can directly use calendar tools if granted access, (3) update the allowed-tools list to reflect current tool names, (4) update the Core Mandate and Delegation Pattern sections to match the new model where agents invoke calendar tools directly rather than via a calendar-assistant intermediary.

---

## Tasks

### Files to Create/Modify
- [ ] `packages/mcp-server/plugins/automaker/commands/calendar-assistant.md`

### Verification
- [ ] No references to execute_dynamic_agent remain in calendar-assistant.md
- [ ] Skill accurately describes the SDK-native invocation pattern
- [ ] allowed-tools list is accurate and complete
- [ ] Delegation Pattern section is updated or removed if the exclusive-access model is retired

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
