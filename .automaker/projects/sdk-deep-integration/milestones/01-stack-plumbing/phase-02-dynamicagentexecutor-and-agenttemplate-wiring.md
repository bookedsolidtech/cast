# Phase 2: DynamicAgentExecutor and AgentTemplate wiring

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add hooks, canUseTool, and mcpServers to DynamicAgentExecutor.ExecuteOptions (apps/server/src/services/dynamic-agent-executor.ts). Forward them to the simpleQuery/streamingQuery calls in the execute() method. Add an optional mcpServers field to AgentTemplateSchema in libs/types/src/agent-templates.ts using z.array(MCPServerConfigSchema).optional(). Add mcpServers to AgentConfig in agent-factory-service.ts and flow it through resolveConfig(). This enables per-template MCP server assignment for future use.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/server/src/services/dynamic-agent-executor.ts`
- [ ] `libs/types/src/agent-templates.ts`
- [ ] `apps/server/src/services/agent-factory-service.ts`

### Verification
- [ ] DynamicAgentExecutor.ExecuteOptions accepts optional hooks, canUseTool, mcpServers
- [ ] execute() forwards those fields to simpleQuery/streamingQuery
- [ ] AgentTemplateSchema has optional mcpServers field (Zod validated)
- [ ] AgentConfig has mcpServers field, set from template or empty array
- [ ] npm run typecheck passes

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
