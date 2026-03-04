# M3: Ava Custom MCP Servers

**Status**: 🔴 Not started
**Duration**: 2-4 weeks (estimated)
**Dependencies**: None

---

## Overview

Separate MCP server configuration for Ava's chat surface vs dev agent surface. AvaConfig gets its own mcpServers field. Wire through the chat route so Ava and her delegated agents can use custom external tools.

---

## Phases

| Phase | File | Duration | Dependencies | Owner |
|-------|------|----------|--------------|-------|
| 1 | [phase-01-avaconfig-mcp-field-and-chat-route-wiring.md](./phase-01-avaconfig-mcp-field-and-chat-route-wiring.md) | 1 week | None | TBD |
| 2 | [phase-02-ava-settings-mcp-servers-ui.md](./phase-02-ava-settings-mcp-servers-ui.md) | 1 week | None | TBD |

---

## Success Criteria

M3 is **complete** when:

- [ ] All phases complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Team reviewed and approved

---

## Outputs

### For Next Milestone
- Foundation work ready for dependent features
- APIs stable and documented
- Types exported and usable

---

## Handoff to M4

Once M3 is complete, the following can begin:

- Next milestone phases that depend on this work
- Parallel work streams that were blocked

---

**Next**: [Phase 1](./phase-01-avaconfig-mcp-field-and-chat-route-wiring.md)
