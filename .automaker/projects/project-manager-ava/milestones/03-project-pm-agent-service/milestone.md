# M3: Project PM Agent Service

**Status**: 🔴 Not started
**Duration**: 2-4 weeks (estimated)
**Dependencies**: None

---

## Overview

Build ProjectPMService that maintains a persistent, scoped PM agent session per project. PM agents are accessible via a new /api/project-pm/chat streaming endpoint and respond to lifecycle events. Expose PM chat as a slide-out panel in the project detail UI.

---

## Phases

| Phase | File | Duration | Dependencies | Owner |
|-------|------|----------|--------------|-------|
| 1 | [phase-01-projectpmservice-pm-chat-api.md](./phase-01-projectpmservice-pm-chat-api.md) | 2 weeks | None | TBD |
| 2 | [phase-02-pm-chat-panel-ui.md](./phase-02-pm-chat-panel-ui.md) | 1 week | None | TBD |

---

## Success Criteria

M3 is **complete** when:

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

## Handoff to M4

Once M3 is complete, the following can begin:

- Next milestone phases that depend on this work
- Parallel work streams that were blocked

---

**Next**: [Phase 1](./phase-01-projectpmservice-pm-chat-api.md)
