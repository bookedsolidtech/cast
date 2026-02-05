# Authority System - Organization Chart & Permissions

## Overview

The authority system implements a trust-gated hierarchy where AI agents govern work through policy checks. Every agent action passes through `checkPolicy()` before execution.

The system has three layers:

1. **Types** (`libs/types/src/policy.ts`, `authority.ts`) - Pure type definitions
2. **Policy Engine** (`libs/policy-engine/`) - Stateless `checkPolicy()` function
3. **Authority Service** (`apps/server/src/services/authority-service.ts`) - Orchestrates agents, approval queue, events

## Organization Chart

```
CTO (Trust=3, Autonomous)
 |
 |-- Product Manager (Trust=1, Assisted)
 |    Owns: What & Why
 |    Actions: create_work, change_scope
 |    Sub-agents: Requirements Extractor, Scope Checker
 |
 |-- Project Manager (Trust=1, Assisted)
 |    Owns: When & How
 |    Actions: create_work, assign
 |    Sub-agents: Task Decomposer, Dependency Analyzer, Status Monitor
 |
 |-- Engineering Manager (Trust=1, Assisted)
 |    Owns: Who & Capacity
 |    Actions: assign, block_release
 |    Sub-agents: Frontend/Backend/DevOps/QA Engineers, Capacity Planner
 |
 |-- Principal Engineer (Trust=1, Assisted)
      Owns: Architecture & Quality
      Actions: modify_architecture, approve_work, block_release
      Sub-agents: Design Review, Security Review
```

## Roles

| Role                | Code    | Trust           | Owns                   | Description                                                                                      |
| ------------------- | ------- | --------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| CTO                 | `CTO`   | 3 (Autonomous)  | Strategy & direction   | Human-in-the-loop bridge. Full access to all actions and risk levels. Routes approvals to human. |
| Product Manager     | `PM`    | 1 (Assisted)    | What & Why             | Researches ideas, creates PRDs, defines scope. Creates work and manages scope changes.           |
| Project Manager     | `ProjM` | 1 (Assisted)    | When & How             | Decomposes epics into tasks, manages dependencies, assigns work.                                 |
| Engineering Manager | `EM`    | 1 (Assisted)    | Who & Capacity         | Assigns engineers, manages capacity/WIP limits, quality gates.                                   |
| Principal Engineer  | `PE`    | 2 (Conditional) | Architecture & Quality | Reviews architecture decisions, approves work, blocks releases for quality.                      |

## Trust Levels

| Level | Name        | Meaning                                                | Max Risk |
| ----- | ----------- | ------------------------------------------------------ | -------- |
| 0     | Manual      | Every action requires human approval                   | `low`    |
| 1     | Assisted    | Low-risk actions auto-approved, medium+ needs approval | `low`    |
| 2     | Conditional | Low and medium risk auto-approved, high needs approval | `medium` |
| 3     | Autonomous  | All actions auto-approved up to high risk              | `high`   |

Trust evolves over time based on performance:

- Successful actions increase trust score
- Escalations and failures decrease trust score
- Score crossing threshold promotes trust level (1->2, 2->3)
- CTO can manually set trust level via API

## Risk Levels

| Level      | Value | Description                             |
| ---------- | ----- | --------------------------------------- |
| `low`      | 0     | Minimal impact, easily reversible       |
| `medium`   | 1     | Moderate impact, some effort to reverse |
| `high`     | 2     | Significant impact, hard to reverse     |
| `critical` | 3     | CTO-only, potentially irreversible      |

## Permission Matrix

### Actions by Role

| Action                | CTO | PM  | ProjM | EM  | PE  |
| --------------------- | --- | --- | ----- | --- | --- |
| `create_work`         | Y   | Y   | Y     | -   | -   |
| `assign`              | Y   | -   | Y     | Y   | -   |
| `change_scope`        | Y   | Y   | -     | -   | -   |
| `block_release`       | Y   | -   | -     | Y   | Y   |
| `modify_architecture` | Y   | -   | -     | -   | Y   |
| `approve_work`        | Y   | -   | -     | -   | Y   |

### Max Risk Without Approval

| Role  | Max Risk               |
| ----- | ---------------------- |
| CTO   | `critical` (unlimited) |
| PM    | `medium`               |
| ProjM | `medium`               |
| EM    | `high`                 |
| PE    | `high`                 |

### Extended Actions (Authority Layer)

These actions exist in `PolicyActionType` for the authority service but are mapped to engine actions for policy checks:

| Authority Action      | Engine Mapping        | Description                          |
| --------------------- | --------------------- | ------------------------------------ |
| `create_work`         | `create_work`         | Create features, epics, tasks        |
| `assign_work`         | `assign`              | Assign work to agents/roles          |
| `change_scope`        | `change_scope`        | Modify feature scope or requirements |
| `change_estimate`     | `change_scope`        | Change effort estimates              |
| `block_release`       | `block_release`       | Block a release for quality/issues   |
| `escalate`            | `create_work`         | Escalate an issue up the chain       |
| `transition_status`   | `assign`              | Move feature between statuses        |
| `approve_work`        | `approve_work`        | Approve completed work               |
| `delegate`            | `assign`              | Delegate task to another agent       |
| `modify_architecture` | `modify_architecture` | Change system architecture           |
| `update_status`       | `assign`              | Update work item status              |
| `create_pr`           | `create_work`         | Create a pull request                |
| `merge_pr`            | `approve_work`        | Merge a pull request                 |

## Status Transitions

### Workflow States

```
backlog -> in_progress -> review -> done
             |    ^         |
             v    |         v
           blocked -------> backlog
```

### Transition Guards

| From          | To            | Allowed Roles  | Notes                                 |
| ------------- | ------------- | -------------- | ------------------------------------- |
| `backlog`     | `in_progress` | CTO, ProjM, EM | Starting work                         |
| `in_progress` | `review`      | CTO, PE, EM    | Submitting for review                 |
| `review`      | `done`        | CTO, PE        | Requires approval above `medium` risk |
| `in_progress` | `blocked`     | CTO, EM, PE    | Blocking work                         |
| `review`      | `blocked`     | CTO, EM, PE    | Blocking reviewed work                |
| `blocked`     | `in_progress` | CTO, EM, PE    | Unblocking work                       |
| `in_progress` | `backlog`     | All roles      | Moving back to backlog                |
| `review`      | `backlog`     | All roles      | Moving back to backlog                |

### Work Item States (Extended)

The authority system uses an extended set of work item states that map to feature statuses:

| Work State    | Description                     | Key Transitions    |
| ------------- | ------------------------------- | ------------------ |
| `idea`        | Raw idea, not yet researched    | PM picks up        |
| `research`    | Being researched by PM          | PM creates PRD     |
| `planned`     | PRD created, epic defined       | ProjM decomposes   |
| `ready`       | Tasks defined, dependencies set | EM assigns         |
| `in_progress` | Being implemented               | Auto-mode executes |
| `blocked`     | Blocked by issue/dependency     | ProjM/EM resolves  |
| `testing`     | Under testing/verification      | EM validates       |
| `done`        | Completed and verified          | -                  |

## Policy Check Flow

```
Agent proposes action
     |
     v
[1] Permission Matrix Check
     "Does this role have this action?"
     |
     No -> DENY
     |
     Yes
     v
[2] Status Transition Check
     "Can this role make this transition?"
     |
     No -> DENY
     |
     Yes
     v
[3] Risk Gating Check
     "Does action risk exceed agent's max risk?"
     |
     Yes -> REQUIRE_APPROVAL (queued for human/CTO)
     |
     No
     v
     "Does action risk exceed per-action limit?"
     |
     Yes -> REQUIRE_APPROVAL
     |
     No
     v
     "Does transition require approval above threshold?"
     |
     Yes -> REQUIRE_APPROVAL
     |
     No
     v
     ALLOW
```

## Delegation Rules

Agents can delegate work to others based on direction:

| Direction | Meaning                 | Example               |
| --------- | ----------------------- | --------------------- |
| `down`    | Delegate to subordinate | PM -> Task Decomposer |
| `up`      | Escalate to supervisor  | EM -> CTO             |
| `lateral` | Peer-to-peer handoff    | PM -> ProjM           |

## API Endpoints

All endpoints require authentication.

| Method | Path                       | Description                    |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/api/authority/status`    | Authority system status        |
| POST   | `/api/authority/register`  | Register new authority agent   |
| POST   | `/api/authority/propose`   | Submit action proposal         |
| POST   | `/api/authority/resolve`   | Approve/reject/modify proposal |
| POST   | `/api/authority/approvals` | List pending approvals         |
| POST   | `/api/authority/agents`    | List authority agents          |
| POST   | `/api/authority/trust`     | Get/set trust profiles         |

## Configuration

Authority system is configured per-project in `.automaker/settings.json`:

```json
{
  "authoritySystem": {
    "enabled": true,
    "policyConfig": {
      "permissions": [...],
      "transitions": [...],
      "defaultTrustLevel": 1,
      "defaultMaxRisk": "low",
      "escalationThreshold": "high"
    }
  }
}
```

When `authoritySystem.enabled` is `false` (default), all features work exactly as before with no policy checks.

## Events

The authority system emits these events via WebSocket:

| Event                          | Payload                                     | When                    |
| ------------------------------ | ------------------------------------------- | ----------------------- |
| `authority:proposal-submitted` | `{ proposalId, agentId, action, target }`   | Proposal received       |
| `authority:approved`           | `{ agentId, action, auto }`                 | Action approved         |
| `authority:rejected`           | `{ agentId, action, reason }`               | Action rejected         |
| `authority:awaiting-approval`  | `{ requestId, agentId, action, target }`    | Queued for human review |
| `authority:agent-registered`   | `{ agentId, role, trustLevel }`             | Agent registered        |
| `authority:trust-updated`      | `{ agentId, oldTrustLevel, newTrustLevel }` | Trust level changed     |

## File Locations

| File                                            | Purpose                                            |
| ----------------------------------------------- | -------------------------------------------------- |
| `libs/types/src/policy.ts`                      | All policy and trust type definitions              |
| `libs/types/src/authority.ts`                   | Authority agent and work item types                |
| `libs/policy-engine/src/engine.ts`              | Core `checkPolicy()` function                      |
| `libs/policy-engine/src/defaults.ts`            | Default permission matrix and transitions          |
| `libs/policy-engine/tests/engine.test.ts`       | 37 unit tests for policy engine                    |
| `apps/server/src/services/authority-service.ts` | Authority service (registry, proposals, approvals) |
| `apps/server/src/routes/authority/index.ts`     | REST API routes                                    |

## Persistence

Per-project authority data stored in `.automaker/authority/`:

| File                  | Contents                           |
| --------------------- | ---------------------------------- |
| `agents.json`         | Registered authority agents        |
| `trust-profiles.json` | Trust profiles with stats          |
| `approval-queue.json` | Pending and resolved approvals     |
| `audit.jsonl`         | Append-only audit trail (Sprint 7) |
