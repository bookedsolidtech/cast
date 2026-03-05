# Phase 1: Project Lifecycle Tools in Ava Chat

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add four tools to the Ava chat tool registry in apps/server/src/routes/chat/ava-tools.ts: (1) create_project_plan — calls ProjectLifecycleService.initiate() with title and description extracted from the conversation, returns slug and PRD summary for Ava to present; (2) approve_project — calls ProjectLifecycleService.approvePrd() which creates milestones, features, and epics, returns feature count; (3) launch_project — calls ProjectLifecycleService.launch() to start auto-mode AND calls projectPMService.getOrCreateSession() to spawn the PM agent, returns session info; (4) get_project_lifecycle_status — calls ProjectLifecycleService.getStatus() for a project slug, returns phase and next actions. Ensure these tools are included in the default toolGroups served by /api/chat. Inject projectPMService into the chat route handler so launch_project can access it.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/routes/chat/ava-tools.ts`
- [ ] `apps/server/src/routes/chat/index.ts`

### Verification
- [ ] create_project_plan tool calls ProjectLifecycleService.initiate() and returns PRD summary
- [ ] approve_project tool calls ProjectLifecycleService.approvePrd() and returns feature count
- [ ] launch_project tool starts auto-mode AND creates PM session, returns session info
- [ ] get_project_lifecycle_status returns current phase and next actions
- [ ] All 4 tools available in Ava chat by default (no toolGroup config needed)
- [ ] Ava can complete full project creation flow in one conversation
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
