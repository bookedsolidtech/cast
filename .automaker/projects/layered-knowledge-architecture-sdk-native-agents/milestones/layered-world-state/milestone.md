# Milestone 3: Layered World State

## Goal
Split the monolithic LeadWorldState into three scoped types with clear ownership, maintenance loops, and distilled summary endpoints.

## Phases

### Phase 1: PM World State Builder (medium)
Create PMWorldStateBuilder that constructs PMWorldState from project files, milestone status, ceremonies, timelines. Exposes getDistilledSummary(). 60s refresh interval.

**Files:** `apps/server/src/services/pm-world-state-builder.ts`, tests

### Phase 2: Ava World State Builder (medium)
Create AvaWorldStateBuilder that aggregates distilled summaries from PM and LE layers. Adds strategic context: team health, cross-project deps, brand status. Exposes getFullBriefing().

**Files:** `apps/server/src/services/ava-world-state-builder.ts`, tests

### Phase 3: Role-Scoped Context Injection (medium)
Update loadContextFiles() to accept a role parameter. Each role only loads domain-relevant files. LE context shrinks ~40%.

**Files:** `libs/utils/src/context-loader.ts`, `apps/server/src/services/lead-engineer-service.ts`, `apps/server/src/providers/claude-code-provider.ts`

## Dependencies
- Milestone 1 (world state types)
- Milestone 2 (agent definitions reference world state slices)

## Success Criteria
- Each layer maintains its own world state
- getDistilledSummary() works for PM and LE layers
- getFullBriefing() aggregates from all layers
- LE context window measurably smaller
