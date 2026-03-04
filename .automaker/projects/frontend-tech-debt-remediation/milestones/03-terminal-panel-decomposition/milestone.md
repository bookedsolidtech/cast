# M3: Terminal Panel Decomposition

**Status**: 🔴 Not started
**Duration**: 3-6 weeks (estimated)
**Dependencies**: None

---

## Overview

Break terminal-panel.tsx (2,251 lines) into focused sub-components: a toolbar, a settings popover, and a keyboard shortcut display. The parent component orchestrates but delegates rendering to these children.

---

## Phases

| Phase | File | Duration | Dependencies | Owner |
|-------|------|----------|--------------|-------|
| 1 | [phase-01-extract-terminaltoolbar-component.md](./phase-01-extract-terminaltoolbar-component.md) | 1 week | None | TBD |
| 2 | [phase-02-extract-terminalsettingspopover-component.md](./phase-02-extract-terminalsettingspopover-component.md) | 1 week | None | TBD |
| 3 | [phase-03-extract-terminalkeyboardmap-and-finalize.md](./phase-03-extract-terminalkeyboardmap-and-finalize.md) | 1 week | None | TBD |

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

**Next**: [Phase 1](./phase-01-extract-terminaltoolbar-component.md)
