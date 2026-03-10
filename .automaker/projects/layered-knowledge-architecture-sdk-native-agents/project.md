# Layered Knowledge Architecture & SDK-Native Agents

Replace the custom DynamicAgentExecutor/AgentFactory/RoleRegistry infrastructure with Claude Agent SDK-native subagents and skills, while simultaneously building a layered knowledge architecture where:

1. **Ava (CoS)** has root CLAUDE.md + tools to read distilled domain knowledge from all layers, monitors full world state
2. **PM Agent** owns project-level state, ceremonies, timelines, cross-project awareness — distills status up to Ava
3. **Lead Engineer** only sees assigned engineering work, manages scoped memory/context per project, reports execution state up to PM

The existing KnowledgeStoreService (SQLite + FTS5 + embeddings, fully built but unused) becomes the backbone for distilled knowledge reads across layers. Each layer indexes its domain into the knowledge store, and higher layers query it rather than loading raw files.

SDK migration replaces ~1,175 lines of custom agent infrastructure:
- DynamicAgentExecutor (330 lines) → SDK `query()` with `agents` parameter (subagents)
- AgentFactoryService (326 lines) → factory functions returning `AgentDefinition`
- RoleRegistryService (148 lines) → runtime agents dict
- built-in-templates.ts (371 lines) → `.claude/skills/` SKILL.md files + programmatic AgentDefinitions
- Hybrid: Ava/PM/LE as programmatic subagents, Matt/Kai/Frank/Cindi/Jon as skills

These are deeply interrelated — the agent execution model determines how knowledge flows between layers.

**Status:** active
**Created:** 2026-03-10T19:13:37.782Z
**Updated:** 2026-03-10T19:26:39.130Z

## Milestones
