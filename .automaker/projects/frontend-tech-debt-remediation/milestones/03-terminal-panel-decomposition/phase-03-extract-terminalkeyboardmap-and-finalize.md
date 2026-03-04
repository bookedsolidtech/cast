# Phase 3: Extract TerminalKeyboardMap and finalize

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Extract the keyboard shortcut map display (if present in terminal-panel.tsx) into terminal-keyboard-map.tsx. After all extractions, terminal-panel.tsx should be under 800 lines. Update the technical debt table in docs/dev/frontend-philosophy.md to reflect completion.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/components/views/terminal-view/terminal-panel.tsx`
- [ ] `apps/ui/src/components/views/terminal-view/terminal-keyboard-map.tsx`
- [ ] `docs/dev/frontend-philosophy.md`

### Verification
- [ ] terminal-panel.tsx is under 800 lines
- [ ] All sub-components exported from terminal-view/index.ts or similar barrel
- [ ] npm run typecheck and npm run lint pass
- [ ] Tech debt table updated to reflect terminal decomposition complete

---

## Deliverables

- [ ] Code implemented and working
- [ ] Tests passing
- [ ] Documentation updated

---

## Handoff Checklist

Before marking Phase 3 complete:

- [ ] All tasks complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] PR merged to main
- [ ] Team notified

**Next**: Phase 4
