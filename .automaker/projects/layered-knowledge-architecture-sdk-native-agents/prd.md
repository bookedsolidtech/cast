# SPARC PRD: Layered Knowledge Architecture & SDK-Native Agents

## Situation

protoLabs Studio runs a multi-agent system where Ava (CoS), PM, Lead Engineer, and specialist agents (Matt, Kai, Frank, etc.) collaborate on software projects. Currently:

1. **Agent execution uses custom infrastructure** (~1,175 lines): DynamicAgentExecutor, AgentFactoryService, RoleRegistryService, and built-in-templates.ts. This predates the Claude Agent SDK's native subagent and skill primitives, which now provide the same capabilities with less code and better integration.

2. **Knowledge is flat** -- all agents load the same root CLAUDE.md, the same `.automaker/context/` files, and the same `.automaker/memory/` files. There's no scoping: a Lead Engineer agent sees strategic brand docs, Ava sees raw engineering memory, and the PM has no structured project state layer.

3. **KnowledgeStoreService exists but is unused** -- a fully built SQLite + FTS5 + Xenova embeddings pipeline (hybrid BM25 + cosine + HyPE retrieval) with 6 REST endpoints. It was integrated into LeadEngineerService for reflection search and AutoModeService for learning dedup, but no MCP tools expose it and no agent actively queries it.

4. **World state is monolithic** -- LeadEngineerService owns a single `LeadWorldState` blob containing features, agents, PR status, and build state. There's no PM-level state (projects, milestones, ceremonies, timelines) or Ava-level state (strategic context, cross-project awareness, team health).

5. **Memory/context files are bloated** -- `.automaker/memory/` contains 10,567 lines across 24 files, with `architecture.md` alone at 4,877 lines. Duplicates exist (`gotcha.md`/`gotchas.md`, `pattern.md`/`patterns.md`). Context files have 95% redundancy between `.automaker/context/CLAUDE.md` and root `CLAUDE.md`.

## Problem

Three interrelated problems block the path to full autonomous operation:

**P1: Agent execution is over-engineered and fragile.** DynamicAgentExecutor handles system prompt assembly, tool resolution, query mode selection, error classification, and event emission in 330 lines of custom code. It has 8 integration points (REST API, MCP, AntagonisticReview, Headsdown, ReactiveSpawner, Ava chat, LE GTM review, service init). The Claude Agent SDK now provides subagents (context-isolated, parallelizable, resumable AgentDefinitions) and skills (SKILL.md filesystem artifacts auto-discovered by the model). Our custom infra duplicates what the SDK gives us for free.

**P2: Knowledge doesn't flow between layers.** Ava can't ask "what's the PM working on?" without reading raw project files. The PM can't ask "what did the Lead Engineer learn from the last failure?" without grepping memory files. The Lead Engineer loads strategic brand docs it doesn't need, bloating its context window and diluting engineering focus. There's no distillation pipeline -- each layer should own its domain, index its knowledge, and expose distilled summaries upward.

**P3: World state has no ownership model.** The LeadWorldState type conflates execution state (features, agents) with project state (milestones, timelines) and strategic state (cross-project, team health). When the PM needs to check ceremony status, it has nowhere to look. When Ava needs a cross-project summary, it must reconstruct it from raw data. Each layer should own and maintain its chunk of world state.

## Approach

A unified migration in 5 milestones that progressively replaces custom infrastructure with SDK primitives while building the layered knowledge architecture:

### Milestone 1: Types & Knowledge Store Activation

Define the three-layer world state types (AvaWorldState, PMWorldState, LEWorldState). Expose KnowledgeStoreService via MCP tools (search, ingest, rebuild, stats). Add domain tagging to knowledge chunks so each layer can index and query its own domain. Clean up bloated memory/context files.

### Milestone 2: SDK Agent Primitives

Replace DynamicAgentExecutor with SDK-native `query()` calls using the `agents` parameter. Convert AgentFactoryService to factory functions returning `AgentDefinition`. Convert built-in templates to either programmatic subagent definitions (Ava, PM, LE) or SKILL.md files (Matt, Kai, Frank, Cindi, Jon). Retire RoleRegistryService.

### Milestone 3: Layered World State

Split LeadWorldState into three scoped types. PM builds and maintains PMWorldState (projects, milestones, ceremonies, timelines). LE maintains LEWorldState (features, agents, PR status, build state). Ava maintains AvaWorldState (strategic context, cross-project rollup, team health). Each layer exposes a `getDistilledSummary()` that higher layers can query.

### Milestone 4: Knowledge Flow Pipeline

Each layer indexes its domain into KnowledgeStoreService with domain tags. PM indexes project state changes, ceremony outcomes, timeline updates. LE indexes engineering reflections, failure patterns, architecture decisions. Ava queries distilled summaries from both layers. Context injection pipeline (`loadContextFiles`) becomes role-aware -- only loads files tagged for the requesting role.

### Milestone 5: Integration & Wiring

Rewire all 8 DynamicAgentExecutor integration points to use SDK primitives. Wire PM<->LE status bridge (PM asks LE for execution status, LE asks PM for next assignment). Wire Ava<->PM briefing flow (Ava asks PM for project summaries). End-to-end test: user asks Ava -> Ava checks with PM -> PM checks with LE -> info distills back up.

## Results

**R1: ~1,175 lines of custom agent infrastructure deleted**, replaced by SDK-native subagents and skills. Fewer moving parts, better resumability, native tool isolation.

**R2: Role-scoped knowledge** -- each agent only loads what it needs. LE context windows shrink by ~40% (no strategic/brand docs). PM has structured project state. Ava gets distilled summaries instead of raw file reads.

**R3: KnowledgeStoreService activated** -- hybrid retrieval (BM25 + cosine + HyPE) available via MCP tools. Domain-tagged chunks enable cross-layer queries.

**R4: Three-layer world state** -- clear ownership model. AvaWorldState for strategic, PMWorldState for project management, LEWorldState for execution. Each maintained by its owner, queryable by layers above.

**R5: Ava -> PM -> LE information flow** -- user asks Ava a question, Ava delegates to PM subagent, PM queries LE status, answer distills back up. The "ask Ava" entry point works for everything.

**R6: Memory/context cleanup** -- `.automaker/memory/` reduced from 10,567 lines to <3,000. Duplicates merged. Context files de-duplicated. Each file tagged with its knowledge domain.

## Constraints

- Must not break existing auto-mode -- features in flight must continue executing during migration
- KnowledgeStoreService SQLite schema is frozen -- extend with new columns/tables, don't modify existing
- Claude Agent SDK subagents cannot spawn their own subagents (single level of nesting only)
- Skills require `settingSources: ['user', 'project']` in agent config -- verify this is set
- Memory/context files are git-tracked -- cleanup requires a deliberate commit, not silent deletion
- Hybrid approach required: some agents are better as programmatic subagents (Ava, PM, LE), others as SKILL.md files (Matt, Kai, Frank, Cindi, Jon)
- No backward compatibility shims -- update all consumers immediately per CLAUDE.md philosophy
- Max 2-3 concurrent agents during implementation to avoid resource contention
- Each phase must be independently testable -- build + tests must pass after each phase
