# Milestone 2: SDK Agent Primitives

## Goal
Replace the custom DynamicAgentExecutor/AgentFactory/RoleRegistry infrastructure (~1,175 lines) with Claude Agent SDK-native subagents and SKILL.md files.

## Phases

### Phase 1: Agent Definition Factory Functions (medium)
Create pure factory functions: createAvaAgent(), createPMAgent(), createLEAgent(). Each returns an AgentDefinition compatible with the SDK `agents` parameter.

**Files:** `apps/server/src/services/agent-definitions.ts`, `libs/types/src/agent.ts`

### Phase 2: SKILL.md Files for Specialist Agents (medium)
Convert Matt, Kai, Frank, Cindi, Jon, pr-maintainer, board-janitor, calendar-assistant from built-in-templates.ts to `.claude/skills/` SKILL.md files.

**Files:** `.claude/skills/*.md` (8 files)

### Phase 3: Replace DynamicAgentExecutor with SDK query() (large)
Delete DynamicAgentExecutor, AgentFactoryService, RoleRegistryService, built-in-templates.ts. Rewire all 8 integration points to use SDK query() with agents parameter.

**Files:** 10 files across services, routes, and MCP tools

## Dependencies
- Milestone 1 (types must exist for factory function signatures)

## Success Criteria
- ~1,175 lines of custom infrastructure deleted
- All agent invocations use SDK-native primitives
- No functional regression in any integration point
