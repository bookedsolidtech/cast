# Milestone 1: Types & Knowledge Store Activation

## Goal
Define the foundational three-layer world state types, activate the existing KnowledgeStoreService via MCP tools, and clean up bloated memory/context files.

## Phases

### Phase 1: Three-Layer World State Types (small)
Define AvaWorldState, PMWorldState, and LEWorldState in `libs/types/`. Add WorldStateDomain enum. Extend KnowledgeChunk with domain field. Keep LeadWorldState backward-compatible by extending LEWorldState.

**Files:** `libs/types/src/lead-engineer.ts`, `libs/types/src/knowledge.ts`, `libs/types/src/index.ts`

### Phase 2: Knowledge Store MCP Tools (medium)
Expose KnowledgeStoreService via 4 MCP tools: knowledge_search, knowledge_ingest, knowledge_rebuild, knowledge_stats. Add domain parameter to search/ingest. Wire through existing REST endpoints.

**Files:** `packages/mcp-server/plugins/automaker/tools/knowledge.ts`, `apps/server/src/routes/knowledge-routes.ts`, `apps/server/src/services/knowledge-store-service.ts`, `apps/server/src/services/knowledge-search-service.ts`

### Phase 3: Memory & Context Cleanup (medium)
Merge duplicates, consolidate architecture.md, delete unused files, de-duplicate context CLAUDE.md, tag remaining files with domain headers.

**Files:** `.automaker/memory/` (multiple), `.automaker/context/` (multiple)

## Dependencies
None -- this is the foundation milestone.

## Success Criteria
- Types compile and export correctly
- KnowledgeStoreService queryable via MCP tools with domain filtering
- Memory/context files reduced from 10,567 to <3,000 lines
