# Phase 2: Extract TerminalSettingsPopover component

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Identify the terminal settings popover in terminal-panel.tsx (font size slider, theme selector, any other per-terminal settings). Extract into apps/ui/src/components/views/terminal-view/terminal-settings-popover.tsx. Accept config values and onChange callbacks as props. Update terminal-panel.tsx to use it.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/components/views/terminal-view/terminal-panel.tsx`
- [ ] `apps/ui/src/components/views/terminal-view/terminal-settings-popover.tsx`

### Verification
- [ ] terminal-settings-popover.tsx created with TerminalSettingsPopover export
- [ ] terminal-panel.tsx further reduced by at least 100 lines
- [ ] Settings popover renders and functions identically to before
- [ ] npm run typecheck passes

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
