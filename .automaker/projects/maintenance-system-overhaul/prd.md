# Maintenance System Overhaul - PRD

## Situation

protoLabs Studio's maintenance system was built incrementally over time with hardcoded assumptions about git workflow and fixed operational parameters. The system includes 8 built-in maintenance tasks:

- **Data integrity check** (every 5 minutes): monitors feature directory count
- **Stale feature detection** (hourly): finds features stuck in running/in-progress
- **Worktree auto-cleanup** (daily): removes worktrees for merged branches
- **Branch auto-cleanup** (weekly): deletes local branches merged to main
- **Board health reconciliation** (every 6 hours): audits and fixes board state
- **Auto-merge eligible PRs** (every 5 minutes): merges PRs that pass checks
- **Auto-rebase stale PRs** (every 30 minutes): rebases PRs behind base branch
- **GitHub Actions runner health** (every 5 minutes): detects stuck builds

The team's workflow has evolved to use `dev` as the primary integration branch, but the maintenance system still assumes `main`/`master` for branch detection. This has created operational debt and the specific bug where 25 worktrees accumulate because they're merged to `dev` but cleanup only checks `main`/`master`.

## Problem

The maintenance system has four critical issues preventing effective operation:

### 1. Integration Branch Awareness Mismatch
- Worktree cleanup and branch cleanup hardcode `main`/`master` branch detection
- Team workflow uses `dev` as integration branch (gitWorkflow.prBaseBranch = 'dev')
- Result: 25 stale worktrees for features merged to dev but not detected by cleanup
- Impact: Disk space waste, developer confusion, manual cleanup required

### 2. Configuration Inflexibility
- All schedules hardcoded as cron expressions in maintenance-tasks.ts
- Thresholds scattered as magic numbers (2 hours, 5 minutes, etc.)
- No runtime configuration capability - requires code changes + deployment
- No per-project customization (different projects may need different maintenance cycles)

### 3. Code Duplication and Technical Debt
- Branch detection logic duplicated between worktree and branch cleanup functions
- Hardcoded fallback logic repeated (try main, then master)
- No shared utilities for common git operations
- Temporary fixes marked with TODO/FIXME never addressed

### 4. Limited Extensibility and Observability
- No framework for adding custom maintenance tasks
- Limited error reporting and performance metrics
- No health monitoring for maintenance task execution
- Plugin ecosystem impossible without standardized interfaces

## Approach

Implement a comprehensive four-phase overhaul to modernize the maintenance system:

### Phase 1: Fix Integration Branch Awareness
- **Update maintenance tasks** to read `gitWorkflow.prBaseBranch` from settings instead of hardcoded main/master
- **Add configuration validation** with graceful fallbacks and health checks
- **Fix the worktree cleanup bug** immediately to stop accumulation

### Phase 2: Standardize Configuration System
- **Create MaintenanceSettings schema** with configurable schedules, thresholds, and flags
- **Implement settings-driven behavior** throughout maintenance-tasks.ts
- **Build maintenance settings UI** for runtime configuration without deployments

### Phase 3: Remove Temporary Stop-gaps
- **Audit all temporary solutions** with TODO/FIXME markers in maintenance code
- **Replace hardcoded intervals** with settings-driven configuration
- **Consolidate duplicate logic** into shared git utilities

### Phase 4: Unified Maintenance Framework
- **Design task registry system** for plugin-style maintenance task registration
- **Add comprehensive observability** with OpenTelemetry tracing and metrics
- **Create plugin system** enabling external maintenance task development

## Results

After completion, the maintenance system will provide:

### Immediate Operational Fixes
- ✅ Worktree cleanup correctly detects branches merged to `dev`
- ✅ No more accumulation of stale worktrees (fixes 25-worktree backlog)
- ✅ Branch cleanup works with team's actual git workflow

### Configuration Flexibility
- 🎛️ UI controls for all maintenance schedules and thresholds
- 🏗️ Per-project maintenance setting overrides
- ⚡ Settings changes apply without server restart
- 📊 Real-time configuration validation and preview

### Technical Excellence
- 🧩 Unified git utilities eliminate code duplication
- 🏃‍♂️ All temporary stop-gaps replaced with proper implementations
- 📈 Comprehensive observability and health monitoring
- 🔌 Plugin system enables custom maintenance tasks

### Developer Experience
- 📱 Maintenance dashboard showing task performance
- 🚨 Health endpoints for monitoring and alerting
- 📚 Documentation and examples for maintenance task plugins
- 🛠️ MCP tools for managing maintenance configuration

## Constraints

### Backward Compatibility
- All existing maintenance tasks must continue running during migration
- Default behavior preserved for installations without custom settings
- Settings schema must support migration from current hardcoded values

### Performance Requirements
- Maintenance tasks are background processes - minimal performance impact
- Settings changes should apply without requiring server restart where possible
- Plugin system must provide proper isolation to prevent task failures from affecting core system

### Operational Continuity
- Zero downtime during the migration process
- Existing automation records in the database must remain functional
- Error boundaries must prevent plugin failures from breaking built-in tasks

### Integration Requirements
- Must work with existing AutomationService and SchedulerService architecture
- Settings must integrate with current GlobalSettings and ProjectSettings patterns
- UI must follow existing Settings view patterns and navigation structure

## Success Metrics

- **Bug Resolution**: Worktree count drops from 25 to expected baseline (< 5 active worktrees)
- **Configuration Adoption**: Settings UI used to customize at least 3 maintenance parameters
- **Technical Debt**: Zero TODO/FIXME markers in maintenance-related code
- **Observability**: 100% maintenance task execution traced with OpenTelemetry
- **Extensibility**: Framework supports registration of at least 1 custom maintenance task via plugin

## Dependencies

- ✅ GitWorkflowSettings already exists with `prBaseBranch: 'dev'` configuration
- ✅ Settings service infrastructure supports adding new setting categories
- ✅ OpenTelemetry infrastructure available for observability
- ⏳ MCP server plugin system provides pattern for maintenance task plugins