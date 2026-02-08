# World State Monitor Architecture

## Overview

The World State Monitor is a GOAP-inspired reactive system that periodically checks the actual state of the system against the desired state and triggers corrective actions when drift is detected.

## Philosophy

```
Event-driven systems are reactive but brittle.
State-driven systems are proactive and self-healing.
```

**Current Problem:**

- Events can be dropped silently
- No recovery mechanism for missed events
- Drift accumulates over time
- Manual intervention required to fix stuck states

**Solution:**

- Periodic tick (every 30s) checks world state
- Detects drift between actual and desired state
- Triggers appropriate agents to correct drift
- Self-healing without manual intervention

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           World State Monitor (Tick Loop)               │
│                                                         │
│  Every 30s:                                            │
│    1. Check Automaker State (features, agents)        │
│    2. Check GitHub State (PRs, reviews, CI)           │
│    3. Check Git State (branches, merges)              │
│    4. Detect Drift                                     │
│    5. Route to Reconciliation Service                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Reconciliation Service                     │
│                                                         │
│  For each drift:                                       │
│    • Determine appropriate action                      │
│    • Trigger authority agent or direct fix            │
│    • Log reconciliation action                        │
│    • Emit event for UI notification                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌─────────────┬─────────────┬──────────────┐
            ▼             ▼             ▼              ▼
        ┌──────┐    ┌─────────┐   ┌──────┐      ┌──────┐
        │ ProjM│    │   EM    │   │  PM  │      │Direct│
        │Agent │    │ Agent   │   │Agent │      │ Fix  │
        └──────┘    └─────────┘   └──────┘      └──────┘
```

## State Checks

### 1. Automaker Internal State

| Check                                                         | Drift Detected           | Action                                    |
| ------------------------------------------------------------- | ------------------------ | ----------------------------------------- |
| Epic with `workItemState: 'approved'` but no Project          | ProjM never processed    | Emit `authority:pm-review-approved` event |
| Project with milestone `status: 'stub'` but no child features | Decomposition incomplete | Trigger ProjM `planMilestone()`           |
| Feature `status: 'in-progress'` but no running agent          | Agent crashed/stopped    | Resume feature or mark as error           |
| Feature `status: 'in-progress'` > 2 hours                     | Agent stuck              | Check agent, escalate or retry            |
| Worktree exists but feature done                              | Orphaned worktree        | Delete worktree, cleanup branch           |

### 2. GitHub State (External)

| Check                                        | Drift Detected                   | Action                                   |
| -------------------------------------------- | -------------------------------- | ---------------------------------------- |
| PR merged but feature `status: 'review'`     | Status not synced                | Move feature to 'done'                   |
| PR open > 24h without review                 | Needs attention                  | Notify team, escalate                    |
| CI failure on PR                             | Build/test broken                | Notify agent via EM, create intervention |
| PR has 'changes requested'                   | Feedback needs addressing        | Trigger EM agent for rework              |
| PR approved but not merged                   | Ready to merge                   | Auto-merge (if enabled) or notify        |
| PR stale (> 7 days no activity)              | Forgotten PR                     | Ping author, close if abandoned          |
| Branch merged to main but feature not 'done' | Git state ahead of feature state | Sync feature status to 'done'            |

### 3. Git State (Local)

| Check                                             | Drift Detected            | Action                           |
| ------------------------------------------------- | ------------------------- | -------------------------------- |
| Branch merged to main but feature not 'done'      | Status out of sync        | Update feature to 'done'         |
| Feature has `branchName` but branch doesn't exist | Branch deleted externally | Mark feature as error or cleanup |
| Worktree path exists but branch deleted           | Orphaned worktree         | Delete worktree directory        |

## Implementation

### Core Services

#### `WorldStateMonitor`

```typescript
class WorldStateMonitor {
  private tickInterval: NodeJS.Timeout | null = null;
  private tickIntervalMs: number = 30000; // 30s default

  start(): void {
    this.tickInterval = setInterval(() => {
      void this.tick();
    }, this.tickIntervalMs);
  }

  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
  }

  private async tick(): Promise<void> {
    try {
      const drifts = await this.detectDrifts();

      for (const drift of drifts) {
        await this.reconciliationService.reconcile(drift);
      }
    } catch (error) {
      logger.error('WorldStateMonitor tick failed:', error);
    }
  }

  private async detectDrifts(): Promise<Drift[]> {
    const automakerDrifts = await this.checkAutomakerState();
    const githubDrifts = await this.checkGitHubState();
    const gitDrifts = await this.checkGitState();

    return [...automakerDrifts, ...githubDrifts, ...gitDrifts];
  }
}
```

#### `ReconciliationService`

```typescript
interface Drift {
  type: DriftType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  projectPath: string;
  featureId?: string;
  prNumber?: number;
  details: Record<string, unknown>;
}

type DriftType =
  | 'epic-not-decomposed'
  | 'feature-no-agent'
  | 'pr-merged-status-stale'
  | 'pr-ci-failure'
  | 'pr-needs-review'
  | 'pr-has-feedback'
  | 'branch-merged-status-stale'
  | 'orphaned-worktree';

class ReconciliationService {
  async reconcile(drift: Drift): Promise<void> {
    logger.info(`Reconciling drift: ${drift.type}`, drift);

    switch (drift.type) {
      case 'epic-not-decomposed':
        await this.reconcileEpic(drift);
        break;
      case 'pr-merged-status-stale':
        await this.reconcileMergedPR(drift);
        break;
      case 'pr-ci-failure':
        await this.reconcileCIFailure(drift);
        break;
      // ... other cases
    }

    // Emit event for UI notification
    this.events.emit('world-state:reconciliation', {
      type: drift.type,
      action: 'resolved',
      timestamp: Date.now(),
    });
  }
}
```

#### `GitHubStateChecker`

```typescript
class GitHubStateChecker {
  async checkPRs(projectPath: string): Promise<Drift[]> {
    const drifts: Drift[] = [];
    const features = await this.featureLoader.getAll(projectPath);

    for (const feature of features) {
      if (feature.status === 'review' && feature.branchName) {
        const pr = await this.findPRForBranch(feature.branchName);

        if (!pr) continue;

        // Check if merged
        if (pr.merged) {
          drifts.push({
            type: 'pr-merged-status-stale',
            severity: 'high',
            projectPath,
            featureId: feature.id,
            prNumber: pr.number,
            details: { mergedAt: pr.merged_at },
          });
        }

        // Check CI status
        if (pr.state === 'open') {
          const ciStatus = await this.getCIStatus(pr.number);
          if (ciStatus === 'failure') {
            drifts.push({
              type: 'pr-ci-failure',
              severity: 'high',
              projectPath,
              featureId: feature.id,
              prNumber: pr.number,
              details: { failedChecks: await this.getFailedChecks(pr.number) },
            });
          }
        }

        // Check for feedback
        const reviews = await this.getReviews(pr.number);
        const hasChangesRequested = reviews.some((r) => r.state === 'CHANGES_REQUESTED');
        if (hasChangesRequested) {
          drifts.push({
            type: 'pr-has-feedback',
            severity: 'medium',
            projectPath,
            featureId: feature.id,
            prNumber: pr.number,
            details: { reviews },
          });
        }
      }
    }

    return drifts;
  }
}
```

## Configuration

```typescript
interface WorldStateMonitorConfig {
  enabled: boolean;
  tickIntervalMs: number; // Default: 30000 (30s)
  checks: {
    automaker: boolean;
    github: boolean;
    git: boolean;
  };
  reconciliation: {
    autoMergeApprovedPRs: boolean;
    closeStaleAfterDays: number; // Default: 7
    ciFailureNotifyEM: boolean;
  };
}
```

## Metrics & Observability

```typescript
interface WorldStateMetrics {
  tickCount: number;
  driftsDetected: number;
  driftsReconciled: number;
  driftsByType: Record<DriftType, number>;
  averageTickDuration: number;
  lastTickTimestamp: number;
}
```

## Benefits

1. **Self-Healing**: System automatically recovers from missed events
2. **Visibility**: All drift detected and logged
3. **Reliability**: No more stuck states requiring manual intervention
4. **GitHub Sync**: PRs, CI, feedback automatically synced
5. **Proactive**: Catches issues before they become problems
6. **Observable**: Metrics show system health at a glance

## Rollout Plan

### Phase 1: Core Monitor (Week 1)

- [ ] Implement WorldStateMonitor service
- [ ] Implement ReconciliationService
- [ ] Add Automaker state checks
- [ ] Deploy with logging only (no actions)
- [ ] Validate drift detection accuracy

### Phase 2: Basic Reconciliation (Week 2)

- [ ] Enable epic-not-decomposed reconciliation
- [ ] Enable pr-merged-status-stale reconciliation
- [ ] Enable orphaned-worktree cleanup
- [ ] Monitor for false positives

### Phase 3: GitHub Integration (Week 3)

- [ ] Implement GitHubStateChecker
- [ ] Add CI failure detection
- [ ] Add PR feedback detection
- [ ] Add stale PR detection
- [ ] Enable EM agent triggering for feedback

### Phase 4: Advanced Features (Week 4)

- [ ] Auto-merge approved PRs (opt-in)
- [ ] Slack/Discord notifications for drift
- [ ] Metrics dashboard
- [ ] Performance optimization
- [ ] Configurable tick interval per project

## Testing Strategy

1. **Unit Tests**: Each state checker in isolation
2. **Integration Tests**: Full tick cycle with mocked GitHub API
3. **E2E Tests**: Create drift scenarios and verify reconciliation
4. **Canary Deploy**: Run on single project with logging only
5. **Gradual Rollout**: Enable reconciliation actions one type at a time

## Open Questions

1. Should we pause the monitor during auto-mode runs to avoid conflicts?
2. How do we handle rate limits for GitHub API calls?
3. Should reconciliation actions require approval from authority agents?
4. What's the right tick interval? (30s? 1min? configurable per check type?)
5. How do we prevent reconciliation loops (A fixes B, B fixes A)?
