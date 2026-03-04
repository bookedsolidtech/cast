# Project: SDK Deep Integration

## Goal
Wire the full Claude Agent SDK surface — native hooks, per-surface custom MCP servers, and a configurable canUseTool trust model — through the entire agent execution stack. Default is full trust (bypassPermissions). Users opt into gated review mode.

## Milestones
1. Stack Plumbing - Add hooks, canUseTool, and disallowedTools to all type interfaces and wire them through ClaudeProvider. This is the foundational layer everything else depends on.
2. SDK Hooks Integration - Build SDK hook factories and wire PostToolUse, Notification, and SubagentStop hooks into DynamicAgentExecutor, replacing the fragile onText/onToolUse callback approach.
3. Ava Custom MCP Servers - Separate MCP server configuration for Ava's chat surface vs dev agent surface. AvaConfig gets its own mcpServers field. Wire through the chat route so Ava and her delegated agents can use custom external tools.
4. canUseTool Trust Model - Add subagentTrust config (default: full) with opt-in gated mode that surfaces inner-agent tool approvals to the Ava chat via WebSocket. Full trust = bypassPermissions (current behavior). Gated = permissionMode default + canUseTool callback.
