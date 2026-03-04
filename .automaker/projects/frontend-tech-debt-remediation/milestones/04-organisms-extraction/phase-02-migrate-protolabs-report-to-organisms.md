# Phase 2: Migrate protolabs-report to organisms

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Move the protolabs-report directory (dialog, results, index components) from apps/ui/src/components/shared/protolabs-report/ to libs/ui/src/organisms/protolabs-report/. Export from organisms index. Update all import paths. Run typecheck to verify no broken imports.

---

## Tasks

### Files to Create/Modify
- [ ] `libs/ui/src/organisms/protolabs-report/`
- [ ] `libs/ui/src/organisms/index.ts`
- [ ] `apps/ui/src/components/shared/protolabs-report/`

### Verification
- [ ] protolabs-report components moved to libs/ui/src/organisms/protolabs-report/
- [ ] Old apps/ui/shared/protolabs-report/ directory removed
- [ ] All import paths updated
- [ ] npm run typecheck passes
- [ ] Tech debt table updated — UI package gaps marked complete

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
