# Phase 2: Wire @storybook/addon-a11y in Storybook preview

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Check apps/ui/.storybook/preview.tsx — if addon-a11y is installed but not registered in addons array or decorators, wire it. Ensure the a11y panel appears in Storybook UI. Verify that `npx storybook dev` starts without errors and the Accessibility tab is visible.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/.storybook/main.ts`
- [ ] `apps/ui/.storybook/preview.tsx`

### Verification
- [ ] @storybook/addon-a11y listed in main.ts addons array
- [ ] Accessibility panel visible when running Storybook dev server
- [ ] No TypeScript errors in Storybook config files

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
