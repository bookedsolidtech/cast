# M1: Critical Bug Fixes & Security

**Status**: 🔴 Not started
**Duration**: 4-8 weeks (estimated)
**Dependencies**: None

---

## Overview

Fix the four P1 issues: MCP enum mismatch, shell injection vulnerability, CRDT project scoping collision, and dead reminder pipeline wiring. These are independent fixes that unblock correct behavior for everything downstream.

---

## Phases

| Phase | File | Duration | Dependencies | Owner |
|-------|------|----------|--------------|-------|
| 1 | [phase-01-fix-mcp-enum-mismatch-and-id-prefix-inconsistency.md](./phase-01-fix-mcp-enum-mismatch-and-id-prefix-inconsistency.md) | 0.5 weeks | None | TBD |
| 2 | [phase-02-fix-shell-injection-in-run-command-job-actions.md](./phase-02-fix-shell-injection-in-run-command-job-actions.md) | 0.5 weeks | None | TBD |
| 3 | [phase-03-fix-crdt-project-scoping-for-calendar-documents.md](./phase-03-fix-crdt-project-scoping-for-calendar-documents.md) | 1 week | None | TBD |
| 4 | [phase-04-wire-emitreminder-into-jobexecutorservice.md](./phase-04-wire-emitreminder-into-jobexecutorservice.md) | 0.5 weeks | None | TBD |

---

## Success Criteria

M1 is **complete** when:

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

## Handoff to M2

Once M1 is complete, the following can begin:

- Next milestone phases that depend on this work
- Parallel work streams that were blocked

---

**Next**: [Phase 1](./phase-01-fix-mcp-enum-mismatch-and-id-prefix-inconsistency.md)
