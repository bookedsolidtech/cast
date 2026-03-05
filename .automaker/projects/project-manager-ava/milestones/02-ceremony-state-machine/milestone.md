# M2: Ceremony State Machine

**Status**: 🔴 Not started
**Duration**: 2-4 weeks (estimated)
**Dependencies**: None

---

## Overview

Replace fire-and-forget ceremony events with a persistent state machine that tracks where each project is in its ceremony cadence. Each active project gets a ceremony-state.json file with full transition history. Standups fire on cron schedule (not just on milestone events) via SchedulerService integration.

---

## Phases

| Phase | File | Duration | Dependencies | Owner |
|-------|------|----------|--------------|-------|
| 1 | [phase-01-ceremonystate-types-pure-transition-function.md](./phase-01-ceremonystate-types-pure-transition-function.md) | 0.5 weeks | None | TBD |
| 2 | [phase-02-wire-state-machine-into-ceremonyservice-scheduler.md](./phase-02-wire-state-machine-into-ceremonyservice-scheduler.md) | 1 week | None | TBD |

---

## Success Criteria

M2 is **complete** when:

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

## Handoff to M3

Once M2 is complete, the following can begin:

- Next milestone phases that depend on this work
- Parallel work streams that were blocked

---

**Next**: [Phase 1](./phase-01-ceremonystate-types-pure-transition-function.md)
