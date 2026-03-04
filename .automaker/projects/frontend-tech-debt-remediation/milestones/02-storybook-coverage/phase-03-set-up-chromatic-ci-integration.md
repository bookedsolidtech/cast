# Phase 3: Set up Chromatic CI integration

**Duration**: 1-1.5 weeks
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add Chromatic to the CI pipeline. Install chromatic package. Add a chromatic.yml GitHub Actions workflow that runs on PRs targeting dev/staging: build Storybook, publish to Chromatic for visual diffing. Use CHROMATIC_PROJECT_TOKEN secret. Configure to run only when libs/ui or apps/ui files change (path filter). Do not block PRs on Chromatic — set as informational check only initially.

---

## Tasks

### Files to Create/Modify
- [ ] `package.json`
- [ ] `.github/workflows/chromatic.yml`

### Verification
- [ ] chromatic package installed in apps/ui or root
- [ ] .github/workflows/chromatic.yml created with correct path filters
- [ ] Workflow references CHROMATIC_PROJECT_TOKEN secret
- [ ] Workflow is non-blocking (continue-on-error: true or separate status check)

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
