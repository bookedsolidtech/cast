# M4: canUseTool Trust Model

**Status**: 🔴 Not started
**Duration**: 3-6 weeks (estimated)
**Dependencies**: None

---

## Overview

Add subagentTrust config (default: full) with opt-in gated mode that surfaces inner-agent tool approvals to the Ava chat via WebSocket. Full trust = bypassPermissions (current behavior). Gated = permissionMode default + canUseTool callback.

---

## Phases

| Phase | File | Duration | Dependencies | Owner |
|-------|------|----------|--------------|-------|
| 1 | [phase-01-trust-config-types-and-canusetool-factory.md](./phase-01-trust-config-types-and-canusetool-factory.md) | 1 week | None | TBD |
| 2 | [phase-02-gated-approval-websocket-flow-and-inline-ui.md](./phase-02-gated-approval-websocket-flow-and-inline-ui.md) | 2 weeks | None | TBD |
| 3 | [phase-03-trust-level-toggle-in-ava-settings.md](./phase-03-trust-level-toggle-in-ava-settings.md) | 0.5 weeks | None | TBD |

---

## Success Criteria

M4 is **complete** when:

- [ ] All phases complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Team reviewed and approved

---

## Outputs

### For Next Milestone
- Foundation work ready for dependent features
- APIs stable and documented
- Types exported and usable

---

## Handoff to M5

Once M4 is complete, the following can begin:

- Next milestone phases that depend on this work
- Parallel work streams that were blocked

---

**Next**: [Phase 1](./phase-01-trust-config-types-and-canusetool-factory.md)
