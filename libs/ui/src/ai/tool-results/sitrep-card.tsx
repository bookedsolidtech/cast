/**
 * SitrepCard — Compact dashboard card for get_sitrep tool results.
 *
 * Renders: board summary counts, auto-mode status, running agents,
 * blocked/review features, escalations, open PRs with CI status,
 * staging delta, recent commits, and server health.
 */

import {
  Loader2,
  Radio,
  Zap,
  ZapOff,
  GitPullRequest,
  AlertTriangle,
  Bot,
  Activity,
  GitCommit,
  Server,
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import type { ToolResultRendererProps } from '../tool-result-registry.js';

interface BoardCounts {
  backlog?: number;
  in_progress?: number;
  review?: number;
  done?: number;
  blocked?: number;
  [key: string]: number | undefined;
}

interface AgentInfo {
  id?: string;
  name?: string;
  status?: string;
  featureName?: string;
}

interface FeatureRef {
  id?: string;
  name?: string;
  title?: string;
  status?: string;
}

interface PRInfo {
  number?: number;
  title?: string;
  branch?: string;
  ciStatus?: string;
  state?: string;
  checks?: { passed?: number; failed?: number; pending?: number };
}

interface CommitInfo {
  sha?: string;
  message?: string;
  author?: string;
  timestamp?: string;
}

interface ServerHealth {
  status?: string;
  uptime?: number;
  memory?: number;
  memoryUsed?: number;
}

interface SitrepData {
  // Board
  board?: BoardCounts;
  boardCounts?: BoardCounts;
  counts?: BoardCounts;
  // Auto-mode
  autoMode?: boolean | { enabled?: boolean; running?: boolean; status?: string };
  autoModeEnabled?: boolean;
  autoModeRunning?: boolean;
  // Agents
  agents?: AgentInfo[];
  runningAgents?: AgentInfo[];
  // Features
  blockedFeatures?: FeatureRef[];
  reviewFeatures?: FeatureRef[];
  escalations?: Array<{ message?: string; feature?: string }>;
  // PRs
  openPRs?: PRInfo[];
  prs?: PRInfo[];
  // Staging
  stagingDelta?: { commits?: number; behind?: number; ahead?: number; summary?: string };
  // Commits
  recentCommits?: CommitInfo[];
  commits?: CommitInfo[];
  // Server
  serverHealth?: ServerHealth;
  health?: ServerHealth;
  // Meta
  generatedAt?: string;
  timestamp?: string;
}

function extractData(output: unknown): SitrepData | null {
  if (!output || typeof output !== 'object') return null;
  const o = output as Record<string, unknown>;
  if ('success' in o && 'data' in o && typeof o.data === 'object' && o.data !== null) {
    return o.data as SitrepData;
  }
  return o as SitrepData;
}

function getBoardCounts(data: SitrepData): BoardCounts {
  return data.board ?? data.boardCounts ?? data.counts ?? {};
}

function getAutoModeEnabled(data: SitrepData): boolean {
  if (typeof data.autoModeEnabled === 'boolean') return data.autoModeEnabled;
  if (typeof data.autoModeRunning === 'boolean') return data.autoModeRunning;
  const am = data.autoMode;
  if (typeof am === 'boolean') return am;
  if (am && typeof am === 'object') {
    if (typeof am.running === 'boolean') return am.running;
    if (typeof am.enabled === 'boolean') return am.enabled;
    if (typeof am.status === 'string') {
      return ['running', 'active', 'enabled', 'on'].includes(am.status.toLowerCase());
    }
  }
  return false;
}

function getRunningAgents(data: SitrepData): AgentInfo[] {
  return data.runningAgents ?? data.agents ?? [];
}

function getOpenPRs(data: SitrepData): PRInfo[] {
  return data.openPRs ?? data.prs ?? [];
}

function getRecentCommits(data: SitrepData): CommitInfo[] {
  return (data.recentCommits ?? data.commits ?? []).slice(0, 5);
}

function getServerHealth(data: SitrepData): ServerHealth | null {
  return data.serverHealth ?? data.health ?? null;
}

const BOARD_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  backlog: { label: 'Backlog', color: 'text-muted-foreground', bg: 'bg-muted/60' },
  in_progress: { label: 'In Progress', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  review: { label: 'Review', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  blocked: { label: 'Blocked', color: 'text-red-500', bg: 'bg-red-500/10' },
  done: { label: 'Done', color: 'text-green-500', bg: 'bg-green-500/10' },
};

const BOARD_STATUS_ORDER = ['backlog', 'in_progress', 'review', 'blocked', 'done'];

function CiStatusDot({ status }: { status?: string }) {
  const s = (status ?? '').toLowerCase();
  if (s === 'success' || s === 'passed') {
    return <span className="inline-block size-1.5 rounded-full bg-green-500" />;
  }
  if (s === 'failure' || s === 'failed' || s === 'error') {
    return <span className="inline-block size-1.5 rounded-full bg-red-500" />;
  }
  if (s === 'pending' || s === 'in_progress' || s === 'running') {
    return <span className="inline-block size-1.5 rounded-full bg-amber-500" />;
  }
  return <span className="inline-block size-1.5 rounded-full bg-muted-foreground/40" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}

export function SitrepCard({ output, state }: ToolResultRendererProps) {
  const isLoading =
    state === 'input-streaming' || state === 'input-available' || state === 'approval-responded';

  if (isLoading) {
    return (
      <div
        data-slot="sitrep-card"
        className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
      >
        <Loader2 className="size-3.5 animate-spin" />
        <span>Loading sitrep…</span>
      </div>
    );
  }

  const data = extractData(output);
  if (!data) {
    return (
      <div
        data-slot="sitrep-card"
        className="rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
      >
        Sitrep unavailable
      </div>
    );
  }

  const boardCounts = getBoardCounts(data);
  const autoModeEnabled = getAutoModeEnabled(data);
  const runningAgents = getRunningAgents(data);
  const openPRs = getOpenPRs(data);
  const recentCommits = getRecentCommits(data);
  const serverHealth = getServerHealth(data);
  const blockedFeatures = data.blockedFeatures ?? [];
  const reviewFeatures = data.reviewFeatures ?? [];
  const escalations = data.escalations ?? [];
  const stagingDelta = data.stagingDelta;

  const boardEntries = BOARD_STATUS_ORDER.filter((s) => (boardCounts[s] ?? 0) > 0).map((s) => ({
    status: s,
    count: boardCounts[s] ?? 0,
    config: BOARD_STATUS_CONFIG[s] ?? {
      label: s,
      color: 'text-foreground',
      bg: 'bg-muted/60',
    },
  }));

  return (
    <div data-slot="sitrep-card" className="rounded-md border border-border/50 bg-muted/30 text-xs">
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b border-border/50 px-3 py-1.5">
        <Radio className="size-3.5 text-muted-foreground" />
        <span className="font-medium text-foreground/80">Sitrep</span>
        {(data.generatedAt ?? data.timestamp) && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {new Date(data.generatedAt ?? data.timestamp!).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Board counts */}
      {boardEntries.length > 0 && (
        <div className="border-b border-border/50 px-3 py-2">
          <SectionLabel>Board</SectionLabel>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {boardEntries.map(({ status, count, config }) => (
              <span
                key={status}
                className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5', config.bg)}
              >
                <span className={cn('font-semibold tabular-nums', config.color)}>{count}</span>
                <span className="text-[10px] text-muted-foreground">{config.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Auto-mode + agents row */}
      <div className="flex items-start gap-3 border-b border-border/50 px-3 py-2">
        {/* Auto-mode */}
        <div className="shrink-0">
          <SectionLabel>Auto-Mode</SectionLabel>
          <div className="mt-1">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                autoModeEnabled
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-muted/80 text-muted-foreground'
              )}
            >
              {autoModeEnabled ? (
                <Zap className="size-3 fill-current" />
              ) : (
                <ZapOff className="size-3" />
              )}
              {autoModeEnabled ? 'On' : 'Off'}
            </span>
          </div>
        </div>

        {/* Running agents */}
        {runningAgents.length > 0 && (
          <div className="min-w-0 flex-1">
            <SectionLabel>Agents ({runningAgents.length})</SectionLabel>
            <div className="mt-1 space-y-0.5">
              {runningAgents.slice(0, 3).map((agent, i) => (
                <div
                  key={agent.id ?? i}
                  className="flex items-center gap-1 text-[11px] text-foreground/70"
                >
                  <Bot className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {agent.name ?? agent.featureName ?? agent.id ?? 'Agent'}
                  </span>
                </div>
              ))}
              {runningAgents.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{runningAgents.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Blocked + Review features */}
      {(blockedFeatures.length > 0 || reviewFeatures.length > 0 || escalations.length > 0) && (
        <div className="border-b border-border/50 px-3 py-2 space-y-2">
          {blockedFeatures.length > 0 && (
            <div>
              <SectionLabel>Blocked ({blockedFeatures.length})</SectionLabel>
              <div className="mt-0.5 space-y-0.5">
                {blockedFeatures.slice(0, 3).map((f, i) => (
                  <div key={f.id ?? i} className="flex items-center gap-1 text-[11px] text-red-500">
                    <AlertTriangle className="size-3 shrink-0" />
                    <span className="truncate">{f.name ?? f.title ?? f.id ?? 'Feature'}</span>
                  </div>
                ))}
                {blockedFeatures.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{blockedFeatures.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {reviewFeatures.length > 0 && (
            <div>
              <SectionLabel>Review ({reviewFeatures.length})</SectionLabel>
              <div className="mt-0.5 space-y-0.5">
                {reviewFeatures.slice(0, 3).map((f, i) => (
                  <div
                    key={f.id ?? i}
                    className="flex items-center gap-1 text-[11px] text-amber-500"
                  >
                    <span className="size-3 shrink-0 text-center leading-3">○</span>
                    <span className="truncate">{f.name ?? f.title ?? f.id ?? 'Feature'}</span>
                  </div>
                ))}
                {reviewFeatures.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{reviewFeatures.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {escalations.length > 0 && (
            <div>
              <SectionLabel>Escalations ({escalations.length})</SectionLabel>
              <div className="mt-0.5 space-y-0.5">
                {escalations.slice(0, 2).map((e, i) => (
                  <div key={i} className="flex items-start gap-1 text-[11px] text-orange-500">
                    <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                    <span className="line-clamp-1">{e.message ?? e.feature ?? 'Escalation'}</span>
                  </div>
                ))}
                {escalations.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{escalations.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Open PRs */}
      {openPRs.length > 0 && (
        <div className="border-b border-border/50 px-3 py-2">
          <SectionLabel>Open PRs ({openPRs.length})</SectionLabel>
          <div className="mt-1 space-y-0.5">
            {openPRs.slice(0, 4).map((pr, i) => (
              <div key={pr.number ?? i} className="flex items-center gap-1.5 text-[11px]">
                <GitPullRequest className="size-3 shrink-0 text-muted-foreground" />
                {pr.number && (
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    #{pr.number}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-foreground/70">
                  {pr.title ?? pr.branch ?? 'PR'}
                </span>
                <CiStatusDot
                  status={
                    (pr.ciStatus ?? pr.checks?.failed != null)
                      ? pr.checks!.failed! > 0
                        ? 'failure'
                        : pr.checks!.pending != null && pr.checks!.pending! > 0
                          ? 'pending'
                          : 'success'
                      : pr.ciStatus
                  }
                />
              </div>
            ))}
            {openPRs.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{openPRs.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* Staging delta */}
      {stagingDelta && (
        <div className="border-b border-border/50 px-3 py-2">
          <SectionLabel>Staging Delta</SectionLabel>
          <div className="mt-1 flex items-center gap-2 text-[11px]">
            <Activity className="size-3 text-muted-foreground" />
            {stagingDelta.summary ? (
              <span className="text-foreground/70">{stagingDelta.summary}</span>
            ) : (
              <span className="text-foreground/70">
                {stagingDelta.ahead != null && (
                  <span className="text-green-500">{stagingDelta.ahead} ahead</span>
                )}
                {stagingDelta.ahead != null && stagingDelta.behind != null && (
                  <span className="text-muted-foreground mx-1">/</span>
                )}
                {stagingDelta.behind != null && (
                  <span className="text-amber-500">{stagingDelta.behind} behind</span>
                )}
                {stagingDelta.commits != null &&
                  stagingDelta.ahead == null &&
                  stagingDelta.behind == null && <span>{stagingDelta.commits} commits</span>}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recent commits */}
      {recentCommits.length > 0 && (
        <div className="border-b border-border/50 px-3 py-2">
          <SectionLabel>Recent Commits</SectionLabel>
          <div className="mt-1 space-y-0.5">
            {recentCommits.map((commit, i) => (
              <div key={commit.sha ?? i} className="flex items-center gap-1.5 text-[11px]">
                <GitCommit className="size-3 shrink-0 text-muted-foreground" />
                {commit.sha && (
                  <code className="shrink-0 text-[10px] text-muted-foreground">
                    {commit.sha.slice(0, 7)}
                  </code>
                )}
                <span className="min-w-0 flex-1 truncate text-foreground/70">
                  {commit.message ?? 'Commit'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Server health */}
      {serverHealth && (
        <div className="px-3 py-2">
          <SectionLabel>Server</SectionLabel>
          <div className="mt-1 flex items-center gap-2 text-[11px]">
            <Server className="size-3 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                'rounded px-1.5 py-0.5 font-medium',
                serverHealth.status === 'healthy' || serverHealth.status === 'ok'
                  ? 'bg-green-500/10 text-green-500'
                  : serverHealth.status === 'degraded'
                    ? 'bg-amber-500/10 text-amber-500'
                    : serverHealth.status
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-muted/60 text-muted-foreground'
              )}
            >
              {serverHealth.status ?? 'Unknown'}
            </span>
            {serverHealth.uptime != null && (
              <span className="text-muted-foreground">
                up {Math.floor(serverHealth.uptime / 3600)}h
              </span>
            )}
            {(serverHealth.memory != null || serverHealth.memoryUsed != null) && (
              <span className="text-muted-foreground">
                {Math.round((serverHealth.memoryUsed ?? serverHealth.memory ?? 0) / 1024 / 1024)}MB
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
