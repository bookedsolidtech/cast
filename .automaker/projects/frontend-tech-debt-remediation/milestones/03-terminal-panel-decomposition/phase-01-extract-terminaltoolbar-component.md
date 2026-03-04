# Phase 1: Extract TerminalToolbar component

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Identify all toolbar-related JSX and handlers in terminal-panel.tsx (split buttons, navigation arrows, close/maximize buttons, font size controls). Extract them into apps/ui/src/components/views/terminal-view/terminal-toolbar.tsx. Props should accept callbacks and state values — no direct store access inside the component. Update terminal-panel.tsx to import and use TerminalToolbar.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/components/views/terminal-view/terminal-panel.tsx`
- [ ] `apps/ui/src/components/views/terminal-view/terminal-toolbar.tsx`

### Verification
- [ ] terminal-toolbar.tsx created with TerminalToolbar export
- [ ] All toolbar state and handlers moved out of terminal-panel.tsx
- [ ] terminal-panel.tsx reduced by at least 200 lines
- [ ] npm run typecheck passes

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
