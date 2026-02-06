# Policy & Trust Authority System - Status Report

**Last Updated:** 2026-02-05
**Branch:** `main` (3d8cd435)
**Server Status:** Running (v0.13.0)
**Linear Project:** Policy & Trust Authority System (PRO-35 through PRO-51)

---

## Board Summary

| Status      | Count  | Details                  |
| ----------- | ------ | ------------------------ |
| Backlog     | 0      |                          |
| In Progress | 0      |                          |
| Review      | 0      |                          |
| Done        | 48     | All sprints + prior work |
| **Total**   | **48** | Clean board              |

---

## Active Project: Policy & Trust Authority System

### Goal

Build a trust-gated authority hierarchy where 4 first-class agents (CTO, PM, ProjM, EM) govern work through a policy engine. Every agent action passes through `policy.check()`.

### Walking Skeleton - COMPLETE

```
CTO injects idea → PM creates epic → ProjM decomposes → EM assigns → Engineers execute → Done
```

---

## Sprint Status - ALL COMPLETE

### Sprint 1: Policy Engine Foundation - DONE

- Policy & Trust Type Definitions (`libs/types/src/policy.ts`, `authority.ts`)
- Policy Engine Core with `checkPolicy()` (`libs/policy-engine/`)
- Policy Engine Tests (29 unit tests)

### Sprint 2: Authority Service & API - DONE

- Authority Service Core (registry + proposal processing + approval queue)
- Authority API Routes (`/api/authority/*`)
- Authority Events & Settings (6 new event types)

### Sprint 3: Policy-Gated Mutations - DONE

- Policy-Gated FeatureLoader (intercept status changes, route through policy)
- Auto-Mode Policy Integration (check proposals before starting features)

### Sprint 4: Walking Skeleton Part 1 (CTO -> PM) - DONE

- PM Authority Agent (idea research + PRD + epic creation pipeline)
- Inject Idea Endpoint (`POST /api/authority/inject-idea`)
- CTO Dashboard (`POST /api/authority/dashboard`)

### Sprint 5: Walking Skeleton Part 2 (ProjM -> EM) - DONE

- ProjM Authority Agent (epic decomposition + dependency setup)
- EM Authority Agent (role assignment + capacity/WIP limits + auto-mode trigger)

### Sprint 6: Status & Escalation - DONE

- Status & Blocker Monitor (30s scan for stale/failed/deadlocked features)
- Discord Approval Routing (formatted approval requests with curl commands)

### Sprint 7: Audit & Trust Evolution - DONE

- Audit Trail Service (append-only JSONL + query API)
- Trust Evolution Logic (score tracking + auto-promotion at thresholds)

---

## Architecture

```
CTO (The human user, trust=infinity)
 ├── Product Manager (trust=1, owns what/why)
 │    └── sub: Requirements Extractor, Scope Checker
 ├── Project Manager (trust=1, owns when/how)
 │    └── sub: Task Decomposer, Dependency Analyzer, Status Monitor
 ├── Engineering Manager (trust=1, owns who/capacity)
 │    └── sub: Frontend/Backend/DevOps/QA Engineers, Capacity Planner
 └── Principal Engineer (trust=1, owns architecture)
      └── sub: Design Review, Security Review
```

### Three Implementation Layers

1. **Types** (`libs/types/src/policy.ts`, `authority.ts`) - Pure type definitions
2. **Policy Engine** (`libs/policy-engine/`) - New package, stateless `checkPolicy()` function
3. **Authority Service** (`apps/server/src/services/authority-service.ts`) - Orchestrates agents, approval queue

### Authority Agent Files

| Agent   | File                                          | Role                                 |
| ------- | --------------------------------------------- | ------------------------------------ |
| PM      | `authority-agents/pm-agent.ts`                | Researches ideas, creates PRDs/epics |
| ProjM   | `authority-agents/projm-agent.ts`             | Decomposes epics, sets dependencies  |
| EM      | `authority-agents/em-agent.ts`                | Assigns work, manages capacity       |
| Status  | `authority-agents/status-agent.ts`            | Blocker detection, escalation        |
| Discord | `authority-agents/discord-approval-router.ts` | Approval notifications               |

### API Endpoints

| Endpoint                           | Purpose                  |
| ---------------------------------- | ------------------------ |
| `POST /api/authority/register`     | Register authority agent |
| `POST /api/authority/propose`      | Submit action proposal   |
| `POST /api/authority/resolve`      | Approve/reject/modify    |
| `POST /api/authority/approvals`    | List pending approvals   |
| `POST /api/authority/agents`       | List authority agents    |
| `POST /api/authority/trust`        | Set trust level          |
| `POST /api/authority/inject-idea`  | CTO submits idea         |
| `POST /api/authority/dashboard`    | CTO system overview      |
| `POST /api/authority/audit`        | Query audit trail        |
| `POST /api/authority/trust-scores` | View trust scores        |

### Trust Levels

| Level | Name        | Description                    |
| ----- | ----------- | ------------------------------ |
| 0     | Manual      | CTO approves almost everything |
| 1     | Assisted    | Agents propose, CTO approves   |
| 2     | Conditional | Auto-approve low-risk actions  |
| 3     | Autonomous  | Escalate only on exceptions    |

### Permission Matrix (enforced at runtime)

| Role  | Create Work | Assign | Change Scope | Block Release | Escalate |
| ----- | ----------- | ------ | ------------ | ------------- | -------- |
| CTO   | yes         | yes    | yes          | yes           | --       |
| PM    | yes         | no     | yes          | no            | yes      |
| ProjM | yes         | yes    | no           | no            | yes      |
| EM    | no          | yes    | no           | yes (quality) | yes      |
| PE    | no          | no     | no           | yes           | yes      |

---

## Previously Completed (24 features, prior to authority system)

### Critical Fixes Epic (4/4)

- Enforce MaxConcurrency, Fix AbortController, Circuit Breaker, Worktree Key Mismatch Fix

### Workflow Health & Status Sync (6/6)

- Orphan Detection, Git Status Reconciliation, Board Reconciliation, Epic Auto-Completion, Bulk Status Update, Health Dashboard

### Foundation Types & Services (11)

- Agent Role Types, Headsdown Config, GOAP Goals, Feature Model Update, Export Types
- PM Prompt, PM Service, ProjM Prompt, EM Service, Orchestration Routes

### Epics (2)

- [Epic] Critical Fixes, [Epic] Linear Project & Feature Assignment

---

## Environment Setup

### Linear API

```bash
# Add to ~/.zshrc
export LINEAR_API_KEY="your_key_here"
# Get from: https://linear.app/settings/api
```

### Quick Reference

```bash
npm run dev:web              # Start server (localhost:3007)
npm run build:packages       # Build shared packages
npm run test:server          # Server unit tests

# Claude Code commands
/board                       # View Kanban board
/groom                       # Board health check
/auto-mode                   # Start autonomous processing
```

---

## Recent Changes (2026-02-05)

### Pipeline Rework (3d8cd435)

- Reworked idea-to-execution with AI review and milestone gating

### Discord Bot (caf4b9d3)

- Added Discord bot with `/idea` slash command for CTO idea injection

### EM Dev Lifecycle (f0e822fd)

- PR feedback service, reassignment flow, worktree cleanup

### Bug Fixes (uncommitted)

- Removed dead HTTP connection pooling code from claude-provider
- Fixed worktree key mismatch in auto-mode cooldown/resume
- Features now transition to `review` status after PR creation
- EM reassignment sets `in_progress` workItemState (not `ready`)
- PR escalation marks features as `blocked` instead of leaving them stuck

---

## Cleanup Notes (2026-02-05)

- Worktrees clean (0 stale)
- 3 total branches (main + 2 remote tracking)
- **3 pre-existing test failures** in `model-resolver.test.ts` (console spy mismatch, not related to recent changes)
- **13 npm audit vulnerabilities** (all in electron-builder/node-gyp toolchain, not runtime)
