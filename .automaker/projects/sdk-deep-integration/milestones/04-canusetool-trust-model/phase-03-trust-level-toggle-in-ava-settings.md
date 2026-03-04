# Phase 3: Trust level toggle in Ava settings

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add a trust level toggle to ava-settings-panel.tsx. Show a single row: 'Subagent Trust' with two options — 'Full (autonomous)' and 'Gated (review)'. Wire to avaConfig.subagentTrust via the existing save mechanism. Include a brief description of what each mode does. Show a warning badge on the panel header when gated mode is enabled.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/components/views/chat-overlay/ava-settings-panel.tsx`

### Verification
- [ ] Trust level row visible in Ava settings panel
- [ ] Toggle between Full and Gated saves correctly to ava-config.json
- [ ] Warning indicator visible on settings panel when gated mode is active
- [ ] Description text explains what each mode does

---

## Deliverables

- [ ] Code implemented and working
- [ ] Tests passing
- [ ] Documentation updated

---

## Handoff Checklist

Before marking Phase 3 complete:

- [ ] All tasks complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] PR merged to main
- [ ] Team notified

**Next**: Phase 4
