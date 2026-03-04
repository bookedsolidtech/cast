# Phase 1: Migrate hitl-form to organisms

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Move the hitl-form directory (wizard, dialog, notification, step components) from apps/ui/src/components/shared/hitl-form/ to libs/ui/src/organisms/hitl-form/. Update the organisms index.ts to export these. Update all import paths in apps/ui that reference the old location. Ensure no circular dependencies are introduced (organisms can depend on atoms and molecules but not on app-level code).

---

## Tasks

### Files to Create/Modify
- [ ] `libs/ui/src/organisms/hitl-form/`
- [ ] `libs/ui/src/organisms/index.ts`
- [ ] `apps/ui/src/components/shared/hitl-form/`

### Verification
- [ ] hitl-form components moved to libs/ui/src/organisms/hitl-form/
- [ ] Old apps/ui/shared/hitl-form/ directory removed
- [ ] All import paths updated — no remaining references to old path
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
