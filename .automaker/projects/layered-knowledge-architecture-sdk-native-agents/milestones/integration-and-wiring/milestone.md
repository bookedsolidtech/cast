# Milestone 5: Integration & Wiring

## Goal
Wire the full Ava -> PM -> LE information flow and validate the entire architecture end-to-end.

## Phases

### Phase 1: PM-LE Status Bridge (medium)
Bidirectional service methods: PM queries LE for execution status, LE queries PM for next assignment. No circular deps (interfaces/injection).

**Files:** `apps/server/src/services/pm-world-state-builder.ts`, `apps/server/src/services/lead-engineer-service.ts`

### Phase 2: Ava Entry Point & End-to-End Flow (large)
Wire the full flow: user asks Ava -> PM subagent checks project status -> PM queries LE via service calls -> answer distills back. Update /briefing MCP tool. Integration test covering full flow.

**Files:** `apps/server/src/services/ava-tools.ts`, `apps/server/src/services/ava-world-state-builder.ts`, `packages/mcp-server/plugins/automaker/tools/briefing.ts`, integration test

## Dependencies
- All previous milestones

## Success Criteria
- End-to-end: user asks Ava -> info flows through PM -> LE -> distills back
- /briefing returns layered world state from all three layers
- No regression in existing Ava chat
- All tests pass
