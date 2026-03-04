# Phase 1: Delete duplicate app-level stories

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Delete apps/ui/src/components/ui/badge.stories.tsx, button.stories.tsx, card.stories.tsx, dialog.stories.tsx, and tabs.stories.tsx — these are duplicates of libs/ui/src/atoms/ stories. Verify the libs/ui versions cover the same variants. Run Storybook build to confirm no broken imports.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/components/ui/badge.stories.tsx`
- [ ] `apps/ui/src/components/ui/button.stories.tsx`
- [ ] `apps/ui/src/components/ui/card.stories.tsx`
- [ ] `apps/ui/src/components/ui/dialog.stories.tsx`
- [ ] `apps/ui/src/components/ui/tabs.stories.tsx`

### Verification
- [ ] All 5 app-level story files deleted
- [ ] libs/ui Storybook builds without errors
- [ ] No missing story coverage for badge, button, card, dialog, tabs

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
