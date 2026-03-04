# Phase 2: Ava settings MCP servers UI

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add an MCP servers section to the Ava settings panel (apps/ui/src/components/views/chat-overlay/ava-settings-panel.tsx). Show the list of configured Ava MCP servers with name, description, tool count, and enabled/disabled toggle. Use the same compact chip style established for tool groups. The settings panel already has a save/update flow — wire MCP server enable/disable through the same avaConfig mutation. Read server list from avaConfig.mcpServers. This is display + toggle only; adding new servers is done via ava-config.json directly (CLI-first for now).

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/components/views/chat-overlay/ava-settings-panel.tsx`

### Verification
- [ ] MCP servers section visible in Ava settings when mcpServers is non-empty
- [ ] Each server shows name and enabled toggle
- [ ] Toggle changes save to ava-config.json
- [ ] Empty state shown gracefully when no servers configured
- [ ] Section hidden (not rendered) when mcpServers array is empty

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
