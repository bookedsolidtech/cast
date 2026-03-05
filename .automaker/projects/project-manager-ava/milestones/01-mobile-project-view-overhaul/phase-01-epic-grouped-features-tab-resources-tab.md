# Phase 1: Epic-Grouped Features Tab + Resources Tab

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Restructure features-tab.tsx to nest child features inside their parent epic cards (accordion-style expand/collapse) rather than displaying epics and features in separate flat lists. Each epic card shows: epic title, status badge, epic color border, progress indicator (e.g. '3/5 done'), and an expandable list of its child features. Standalone features (no epicId) shown in a separate 'Standalone' section below epics. Create new resources-tab.tsx that combines Documents and Links into one component: two collapsible sections ('Documents' with inline editor, 'Links' with compact clickable list) plus an actions dropdown button with 'Add Document' and 'Add Link' options. Delete documents-tab.tsx and links-tab.tsx after migrating all functionality into resources-tab.tsx.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/components/views/projects-view/tabs/features-tab.tsx`
- [ ] `apps/ui/src/components/views/projects-view/tabs/resources-tab.tsx`
- [ ] `apps/ui/src/components/views/projects-view/tabs/documents-tab.tsx`
- [ ] `apps/ui/src/components/views/projects-view/tabs/links-tab.tsx`

### Verification
- [ ] Features tab shows epics as expandable accordion sections with child features nested inside
- [ ] Each epic shows progress indicator (N/M done) and colored left border from epicColor
- [ ] Standalone features (no epicId) shown in a separate section below epics
- [ ] ResourcesTab shows Documents and Links in separate collapsible sections
- [ ] Actions dropdown has 'Add Document' and 'Add Link' menu items
- [ ] documents-tab.tsx and links-tab.tsx deleted
- [ ] TypeScript compiles clean

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
