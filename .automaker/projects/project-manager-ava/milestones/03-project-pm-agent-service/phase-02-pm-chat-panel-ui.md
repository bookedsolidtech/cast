# Phase 2: PM Chat Panel UI

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Create apps/ui/src/hooks/use-pm-chat.ts — wraps useChat() from ai/react pointed at /api/project-pm/chat, injecting projectPath and projectSlug. Create apps/ui/src/hooks/use-pm-sessions.ts — fetches GET /api/project-pm/sessions with SWR/react-query. Create apps/ui/src/components/views/projects-view/components/pm-chat-panel.tsx — a slide-out panel (fixed right side, w-96, translate-x transition) showing: header with project name + ceremony phase badge + close button, scrollable messages list (user messages right-aligned, assistant messages left-aligned, system messages centered in muted text), input bar at bottom. Add a 'PM' button to ProjectHeader that toggles the panel. Style follows existing Chat component patterns (check apps/ui/src/components/views/chat-view for reference).

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/hooks/use-pm-chat.ts`
- [ ] `apps/ui/src/hooks/use-pm-sessions.ts`
- [ ] `apps/ui/src/components/views/projects-view/components/pm-chat-panel.tsx`
- [ ] `apps/ui/src/components/views/projects-view/components/project-header.tsx`
- [ ] `apps/ui/src/components/views/projects-view/project-detail.tsx`

### Verification
- [ ] PM button in project header toggles slide-out panel
- [ ] Panel shows conversation history with user/assistant/system message styling
- [ ] Input bar sends messages and shows streaming response
- [ ] Ceremony phase badge shown in panel header
- [ ] Panel closes on X button or escape key
- [ ] No new npm dependencies (uses existing ai/react, existing UI components)
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
