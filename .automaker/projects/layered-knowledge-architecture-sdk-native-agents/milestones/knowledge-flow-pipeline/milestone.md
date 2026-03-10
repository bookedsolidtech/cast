# Milestone 4: Knowledge Flow Pipeline

## Goal
Each layer indexes its domain into KnowledgeStoreService with domain tags, enabling cross-layer distilled queries.

## Phases

### Phase 1: LE Knowledge Indexing (medium)
On feature completion (state -> DONE), automatically index engineering reflections, failure patterns, and architecture decisions with domain='engineering'.

**Files:** `apps/server/src/services/lead-engineer-service.ts`, `apps/server/src/services/knowledge-ingestion-service.ts`

### Phase 2: PM Knowledge Indexing & Cross-Layer Queries (medium)
PM indexes project state changes with domain='project'. Ava queries both domains. Build the full distillation pipeline: raw data -> chunks -> distilled summaries -> briefing.

**Files:** `apps/server/src/services/pm-world-state-builder.ts`, `apps/server/src/services/knowledge-ingestion-service.ts`, `apps/server/src/services/ava-world-state-builder.ts`

## Dependencies
- Milestone 1 (knowledge store MCP tools + domain tagging)
- Milestone 3 (world state builders that produce indexable data)

## Success Criteria
- Feature completions auto-index to knowledge store
- PM state changes auto-index to knowledge store
- Ava can query distilled knowledge from both engineering and project domains
