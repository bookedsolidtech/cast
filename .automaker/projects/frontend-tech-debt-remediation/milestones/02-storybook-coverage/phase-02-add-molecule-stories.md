# Phase 2: Add molecule stories

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Create Storybook stories for the 6 molecule components in libs/ui/src/molecules/: autocomplete.tsx, confirm-dialog.tsx, error-state.tsx, hotkey-button.tsx, loading-state.tsx, and markdown.tsx. Follow the existing atom story pattern (default export with meta, named story exports for each variant). Each story must show at minimum a default state and one variant.

---

## Tasks

### Files to Create/Modify
- [ ] `libs/ui/src/molecules/autocomplete.stories.tsx`
- [ ] `libs/ui/src/molecules/confirm-dialog.stories.tsx`
- [ ] `libs/ui/src/molecules/error-state.stories.tsx`
- [ ] `libs/ui/src/molecules/hotkey-button.stories.tsx`
- [ ] `libs/ui/src/molecules/loading-state.stories.tsx`
- [ ] `libs/ui/src/molecules/markdown.stories.tsx`

### Verification
- [ ] 6 new story files created, one per molecule component
- [ ] Each story has at minimum a Default and one variant export
- [ ] npm run build:storybook passes without errors
- [ ] No TypeScript errors in story files

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
