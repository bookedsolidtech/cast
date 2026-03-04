# PRD: SDK Deep Integration

## Situation
The Claude Agent SDK supports hooks (PreToolUse, PostToolUse, Notification, SubagentStop, etc.), per-agent canUseTool callbacks, and in-process custom MCP servers. Automaker uses the SDK for all agent execution but exposes only ~30% of its capabilities. Tool progress currently relies on fragile regex/callback output parsing via onText/onToolUse. There is no separation between Ava's external tool surface and dev agent tools. The architecture has no plumbing for hooks or canUseTool anywhere in the stack: ExecuteOptions, SimpleQueryOptions, DynamicAgentExecutor, and AgentConfig all lack these fields.

## Problem
1. Progress tracking uses onText/onToolUse regex parsing instead of SDK-native PostToolUse hooks — brittle and misses inner-agent tool calls. 2. No way to give Ava access to custom MCP tools (Slack, Calendar, GitHub Search) without polluting dev agent tool surfaces. 3. canUseTool is completely absent from the stack — no infrastructure exists to support per-subagent approval flows even for teams that want them. 4. The trust model is uninverted: full autonomy requires config; gated review is the accidental default for anything not explicitly bypassed.

## Approach
Four-milestone delivery: (1) Plumb hooks/canUseTool/disallowedTools through the full type chain from ExecuteOptions down through SimpleQueryOptions, ClaudeProvider, and DynamicAgentExecutor. (2) Build SDK hook factories (PostToolUse for progress, Notification for status, SubagentStop for lifecycle) and wire them into DynamicAgentExecutor replacing the fragile callback approach. (3) Add AvaConfig.mcpServers for Ava-specific external integrations and wire through the chat route — separate from dev agent MCP. (4) Add subagentTrust config (default: full) with gated mode that conditionally sets permissionMode and provides a WebSocket-based canUseTool approval flow.

## Results
SDK-native tool progress tracking that captures inner-agent events reliably. Ava can connect to Slack, Calendar, and other external services without those tools bleeding into dev agent context. The canUseTool infrastructure exists and can be enabled per-project. Trust defaults to full autonomy — no configuration needed for the common case.

## Constraints
canUseTool may be silently ignored when permissionMode is bypassPermissions — gated mode must conditionally omit bypassPermissions and set permissionMode to default,The approval WebSocket flow must be async-compatible: canUseTool is an async callback that resolves when the user responds,All changes must be backward-compatible — existing behavior is unchanged for default (full trust) config,SimpleQueryOptions is a subset of ExecuteOptions maintained in simple-query-service.ts — both must be updated together,AgentTemplate Zod schema is validated at runtime — new optional fields must use .optional() to avoid breaking existing templates,The agents option is already plumbed through ClaudeProvider (line 266) — use that exact pattern for hooks and canUseTool
