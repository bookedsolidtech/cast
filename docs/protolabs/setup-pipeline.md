# Setup Pipeline Technical Reference

## Overview

The `/setuplab` command is the entry point for onboarding any repository to protoLabs. It runs a 5-phase pipeline that scans, analyzes, initializes, proposes, and (on approval) executes alignment work.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   /setuplab Skill                        │
│              (Orchestration Layer)                        │
│    Chains MCP tools, presents results, asks for input    │
└────────────┬────────────┬────────────┬──────────────────┘
             │            │            │
    ┌────────▼──────┐ ┌──▼───────┐ ┌──▼──────────┐
    │ MCP Server    │ │ Discord  │ │ Existing    │
    │ (6 new tools) │ │ MCP      │ │ protoLabs   │
    │               │ │ Plugin   │ │ MCP Tools   │
    └────────┬──────┘ └──────────┘ └─────────────┘
             │
    ┌────────▼──────────────────────────────────┐
    │              protoLabs Server              │
    │                                            │
    │  POST /api/setup/research     → Phase 1   │
    │  POST /api/setup/gap-analysis → Phase 2   │
    │  POST /api/setup/project      → Phase 3   │
    │  POST /api/setup/propose      → Phase 4   │
    │                                            │
    │  Services:                                 │
    │  - RepoResearchService (heuristic scan)    │
    │  - GapAnalysisService (standard comparison)│
    │  - AlignmentProposalService (gap→features) │
    └────────────────────────────────────────────┘
```

## MCP Tools

| Tool                | Description                                 | Phase |
| ------------------- | ------------------------------------------- | ----- |
| `research_repo`     | Scan repo structure, detect tech stack      | 1     |
| `analyze_gaps`      | Compare against gold standard               | 2     |
| `setup_lab`         | Initialize .automaker/ (existing, enhanced) | 3     |
| `provision_discord` | Create Discord channels                     | 3     |
| `propose_alignment` | Convert gaps to board features              | 4     |
| `run_full_setup`    | Chain all phases (convenience)              | 1-4   |

## Types

All types are in `libs/types/src/setup.ts` and exported from `@protolabsai/types`.

### Key Types

- `RepoResearchResult` — Everything detected about a repo (git, monorepo, frontend, backend, agents, testing, CI, automation, python, structure)
- `GapAnalysisReport` — Gaps and compliance items with an alignment score
- `GapItem` — A single gap with severity, current state, target state, and effort estimate
- `AlignmentProposal` — Milestones with features ready for board creation
- `ProtolabConfig` — The `protolab.config` file schema (JSON format)

### `RepoResearchResult` Shape

```typescript
interface RepoResearchResult {
  projectPath: string;
  projectName: string;
  /** Raw scripts from root package.json */
  scripts?: Record<string, string>;

  git: {
    isRepo: boolean;
    remoteUrl?: string;
    defaultBranch?: string;
    provider?: 'github' | 'gitlab' | 'bitbucket';
  };

  monorepo: {
    isMonorepo: boolean;
    tool?: 'turbo' | 'nx' | 'lerna' | 'npm-workspaces' | 'pnpm-workspaces';
    packageManager: 'pnpm' | 'npm' | 'yarn' | 'bun' | 'unknown';
    workspaceGlobs?: string[];
    packages: { name: string; path: string; type: 'app' | 'package' }[];
  };

  frontend: {
    framework?: 'react' | 'vue' | 'svelte' | 'none';
    metaFramework?: 'nextjs' | 'remix' | 'vite' | 'none';
    hasShadcn: boolean;
    hasStorybook: boolean;
    hasTailwind: boolean;
    hasRadix: boolean;
    // ...version fields
  };

  backend: {
    hasPayload: boolean;
    database?: 'postgres' | 'neo4j' | 'sqlite' | 'mongodb' | 'none';
    hasExpress: boolean;
    hasFastAPI: boolean;
  };

  /** Agent/AI tooling detected in the repo */
  agents: {
    hasMCPServers: boolean;
    mcpPackages: string[];
    hasLangGraph: boolean;
    hasClaudeSDK: boolean;
    hasAgentFolder: boolean;
  };

  testing: {
    hasVitest: boolean;
    hasPlaywright: boolean;
    hasJest: boolean;
    hasPytest: boolean;
    testDirs: string[];
  };

  codeQuality: {
    hasESLint: boolean;
    hasPrettier: boolean;
    hasTypeScript: boolean;
    tsStrict: boolean;
    hasCompositeConfig: boolean;
    hasHusky: boolean;
    hasLintStaged: boolean;
  };

  ci: {
    hasCI: boolean;
    provider?: 'github-actions' | 'gitlab-ci' | 'circleci';
    workflows: string[];
    hasBuildCheck: boolean;
    hasTestCheck: boolean;
    hasFormatCheck: boolean;
    hasSecurityAudit: boolean;
    hasCodeRabbit: boolean;
    /** True if branch protection rules or rulesets are configured */
    hasBranchProtection: boolean;
  };

  automation: {
    hasAutomaker: boolean;
    hasDiscordIntegration: boolean;
    hasProtolabConfig: boolean;
    hasAnalytics: boolean;
    analyticsProvider?: 'umami' | 'plausible' | 'google-analytics' | 'other';
  };

  python: {
    hasPythonServices: boolean;
    services: { name: string; path: string; framework?: string }[];
    hasRuff: boolean;
    hasBlack: boolean;
    hasPytest: boolean;
    hasPoetry: boolean;
    hasPyproject: boolean;
  };

  /** Top-level directory/file structure */
  structure: {
    topDirs: string[];
    configFiles: string[];
    entryPoints: string[];
  };
}
```

## Phase 1: Repo Research

`RepoResearchService` (`apps/server/src/services/repo-research-service.ts`) scans the target repo with pure heuristics — no AI calls. It is fast and deterministic.

### Detection Details

- **Package manager**: detected via lockfile presence (`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `package-lock.json`)
- **Monorepo**: detected via `turbo.json`, `nx.json`, `lerna.json`, `pnpm-workspace.yaml`, or `workspaces` in `package.json`
- **Framework/stack**: scanned across all workspace `package.json` files
- **Agents**: checks for `mcp`/`model-context-protocol` packages, `@langchain/langgraph`, `@anthropic-ai/sdk`, and `packages/mcp-server` or `agents/` directories
- **Branch protection**: checks GitHub branch protection rules via `gh` CLI; falls back to checking rulesets (modern GitHub protection)
- **Analytics**: detects Umami, Plausible, and Google Analytics via package deps, then env file variables (`.env`, `.env.example`, `.env.local`)
- **Scripts**: extracts root-level `package.json` scripts for `proto.config.yaml` generation

## Phase 3: Initialize

`POST /api/setup/project` (`apps/server/src/routes/setup/routes/project.ts`) initializes a repo with Automaker tooling. It accepts an optional `research` payload from Phase 1.

### Files Created

| File                                 | Condition                                               |
| ------------------------------------ | ------------------------------------------------------- |
| `.automaker/`                        | Always — base directory                                 |
| `.automaker/features/`               | Always                                                  |
| `.automaker/context/`                | Always                                                  |
| `.automaker/memory/`                 | Always                                                  |
| `.automaker/.backups/`               | Always                                                  |
| `protolab.config`                    | If not already present                                  |
| `.automaker/context/CLAUDE.md`       | If not already present                                  |
| `.automaker/context/coding-rules.md` | If research shows TypeScript, ESLint, Prettier, or Ruff |
| `proto.config.yaml`                  | If not already present                                  |

### Research-Aware Content Generation

When `research` is passed:

**CLAUDE.md** is generated with:

- Tech stack summary (TypeScript version, framework, metaframework, database)
- Monorepo structure and package list
- Common commands using the detected package manager
- Testing section (Vitest, Jest, Playwright)
- Import conventions for workspace packages

**coding-rules.md** is generated when any of these are detected:

- TypeScript (with strict mode and composite config notes)
- Prettier (formatting reminder)
- ESLint (version-aware — flat config for v9+)
- Husky + lint-staged (pre-commit hook note)
- Testing frameworks
- Python Ruff

**proto.config.yaml** is generated from research via `buildProtoConfig` → `writeProtoConfig`:

- `techStack`: language, framework, metaframework, database, packageManager, monorepoTool
- `commands`: build, test, dev, start, lint, format (from root package.json `scripts`)
- `git`: defaultBranch, provider, remoteUrl

## `proto.config.yaml` Schema

Defined in `libs/types/src/proto-config.ts` and exported from both `@protolabsai/types` and `@protolabsai/platform`.

```yaml
name: my-project
techStack:
  language: typescript
  framework: react
  metaFramework: nextjs
  packageManager: pnpm
  monorepoTool: turbo
  database: postgres
commands:
  build: pnpm build
  test: pnpm test
  dev: pnpm dev
  lint: pnpm lint
  format: pnpm format
git:
  defaultBranch: main
  provider: github
  remoteUrl: https://github.com/org/repo
```

Load/write via:

```typescript
import { loadProtoConfig, writeProtoConfig } from '@protolabsai/platform';
import type { ProtoConfig } from '@protolabsai/platform';
```

## Gap Checks

### Critical (agents can't work without)

- `.automaker/` exists
- TypeScript strict mode + composite configs
- Testing framework (Vitest)
- CI pipeline (GitHub Actions with build+test+format+audit)
- Branch protection (squash-only, required checks, `required_review_thread_resolution: true`, NO bypass actors — everyone must go through PRs)
- Package manager (pnpm)

### Recommended (full automation)

- Turborepo
- Prettier
- Storybook
- shadcn/ui
- Playwright E2E
- ESLint 9 flat config
- Pre-commit hooks (Husky + lint-staged)
- VitePress docs site (`docs/` directory with auto-generated sidebar)
- Discord channels
- CodeRabbit (strict profile — never use chill)
- Umami analytics (privacy-friendly traffic tracking)

### Optional

- Payload CMS
- MCP servers
- Agent SDK
- Python: Ruff, pytest

## File Manifest

### New Files

| File                                                       | Purpose                      |
| ---------------------------------------------------------- | ---------------------------- |
| `libs/types/src/setup.ts`                                  | All setup pipeline types     |
| `libs/types/src/proto-config.ts`                           | proto.config.yaml schema     |
| `apps/server/src/services/repo-research-service.ts`        | Heuristic repo scanning      |
| `apps/server/src/services/gap-analysis-service.ts`         | Gap comparison engine        |
| `apps/server/src/services/alignment-proposal-service.ts`   | Gap-to-feature conversion    |
| `apps/server/src/routes/setup/routes/research.ts`          | Research route handler       |
| `apps/server/src/routes/setup/routes/gap-analysis.ts`      | Gap analysis route handler   |
| `apps/server/src/routes/setup/routes/propose.ts`           | Proposal route handler       |
| `apps/server/src/routes/setup/routes/discord-provision.ts` | Discord provisioning handler |
| `apps/server/src/templates/cicd/**`                        | CI/CD workflow templates     |
| `apps/server/src/templates/context/**`                     | Context file templates       |
| `docs/protolabs/setup-pipeline.md`                         | This file                    |

### Modified Files

| File                                                         | Change                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| `libs/types/src/index.ts`                                    | Export setup types + ProtoConfig schema types          |
| `libs/platform/src/index.ts`                                 | Export writeProtoConfig, loadProtoConfig               |
| `libs/types/src/project.ts`                                  | Added DiscordChannelMapping interface                  |
| `apps/server/src/routes/setup/routes/project.ts`             | Generate CLAUDE.md, coding-rules.md, proto.config.yaml |
| `apps/server/src/routes/setup/index.ts`                      | Register 5 new routes                                  |
| `packages/mcp-server/src/index.ts`                           | Add 6 new MCP tools                                    |
| `packages/mcp-server/plugins/automaker/commands/setuplab.md` | Full rewrite                                           |

## Related Types

### `DiscordChannelMapping` (in `libs/types/src/project.ts`)

Tracks which Discord channels were created for a project:

```typescript
interface DiscordChannelMapping {
  projectSlug: string;
  categoryId?: string;
  categoryName?: string;
  channels: Array<{
    id: string;
    name: string;
    purpose?: string;
  }>;
  createdAt: string;
}
```
