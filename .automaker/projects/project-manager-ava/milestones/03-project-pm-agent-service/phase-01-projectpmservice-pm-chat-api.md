# Phase 1: ProjectPMService + PM Chat API

**Duration**: 2+ weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Create apps/server/src/services/project-pm-service.ts implementing ProjectPMService. Maintains Map<string, PMSession> keyed by '{projectPath}:{projectSlug}'. PMSession holds: projectSlug, messages (Vercel AI SDK Message[]), createdAt, lastActiveAt. Auto-creates session on project:lifecycle:launched event. Archives (moves to pm-session-archived.json) on project:completed. Exposes: getSession(), listSessions(), getOrCreateSession(), appendSystemMessage(). Create apps/server/src/routes/project-pm/index.ts with endpoints: POST /api/project-pm/chat (body: {projectPath, projectSlug, messages}) — streams response using Vercel AI SDK streamText() with PM system prompt built from project.json + ceremony state + recent feature statuses. GET /api/project-pm/sessions — returns all active sessions. GET /api/project-pm/session/:slug — returns session history + ceremony state. PM tools (defined inline in the route): get_project_status, get_ceremony_state, trigger_ceremony, list_features, create_status_update, add_link, add_document, notify_operator. PM agent config: model haiku, no bash, no file write. Wire into services.ts (instantiate), wiring.ts (event subscriptions), routes.ts (mount at /api/project-pm).

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/services/project-pm-service.ts`
- [ ] `apps/server/src/routes/project-pm/index.ts`
- [ ] `apps/server/src/server/services.ts`
- [ ] `apps/server/src/server/wiring.ts`
- [ ] `apps/server/src/server/routes.ts`

### Verification
- [ ] POST /api/project-pm/chat returns streaming response
- [ ] GET /api/project-pm/sessions returns active session list
- [ ] PM session auto-created when project launches
- [ ] PM system prompt includes project goal, PRD, and current ceremony phase
- [ ] PM tools: get_project_status, get_ceremony_state, trigger_ceremony, list_features, create_status_update, add_link, add_document work correctly
- [ ] PM agent cannot access bash or write files (canUseBash: false, canModifyFiles: false)
- [ ] Feature completion events append system messages to PM session history
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
