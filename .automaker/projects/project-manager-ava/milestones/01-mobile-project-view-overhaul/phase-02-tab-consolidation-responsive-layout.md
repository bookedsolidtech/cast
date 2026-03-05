# Phase 2: Tab Consolidation + Responsive Layout

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Update project-detail.tsx to use 4 tabs: PRD, Features, Resources (conditional — only shown when project has docs or links), Updates. Remove Milestones tab entirely. Set default tab to 'features'. Update ProjectSidebar to be collapsible on mobile using hidden md:block with a toggle button in the project header for small screens. Apply responsive padding: px-3 sm:px-6 on content area. Make tab labels icon-only on mobile: wrap label text in span with hidden sm:inline. Ensure no horizontal scroll on 375px viewport width.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/components/views/projects-view/project-detail.tsx`
- [ ] `apps/ui/src/components/views/projects-view/components/project-sidebar.tsx`
- [ ] `apps/ui/src/components/views/projects-view/components/project-header.tsx`

### Verification
- [ ] Tabs reduced to PRD, Features, Resources (conditional), Updates — Milestones tab gone
- [ ] Resources tab only visible when project.docs.length > 0 or project.links.length > 0
- [ ] Default tab is 'features' not 'prd'
- [ ] Sidebar hidden on mobile (< md breakpoint) with toggle button in header
- [ ] Tab labels show icon only on mobile, icon+text on sm and above
- [ ] Content area uses px-3 sm:px-6 padding
- [ ] No horizontal scroll at 375px viewport
- [ ] TypeScript compiles clean

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
