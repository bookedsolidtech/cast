/**
 * HealthCheckCard — Renders health_check tool results.
 *
 * Shows server version, uptime, memory stats, and connected services.
 */

import { Loader2, Server, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import type { ToolResultRendererProps } from '../tool-result-registry.js';

interface ServiceStatus {
  name?: string;
  status?: string;
  latency?: number;
  error?: string;
}

interface HealthCheckData {
  status?: string;
  version?: string;
  uptime?: number;
  uptimeSeconds?: number;
  // Memory fields (may be bytes or MB depending on server)
  memory?:
    | number
    | { used?: number; total?: number; rss?: number; heapUsed?: number; heapTotal?: number };
  memoryUsed?: number;
  memoryTotal?: number;
  memoryRss?: number;
  heapUsed?: number;
  heapTotal?: number;
  // Connected services
  services?: ServiceStatus[] | Record<string, string | ServiceStatus>;
  connections?: ServiceStatus[] | Record<string, string>;
  // Meta
  timestamp?: string;
  environment?: string;
}

function extractData(output: unknown): HealthCheckData | null {
  if (!output || typeof output !== 'object') return null;
  const o = output as Record<string, unknown>;
  if ('success' in o && 'data' in o && typeof o.data === 'object' && o.data !== null) {
    return o.data as HealthCheckData;
  }
  return o as HealthCheckData;
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${Math.round(bytes / 1024 / 1024)}MB`;
}

function getMemoryStats(data: HealthCheckData): {
  used?: number;
  total?: number;
  rss?: number;
  heap?: number;
  heapTotal?: number;
} | null {
  if (data.memory && typeof data.memory === 'object') {
    const m = data.memory;
    return {
      used: m.used,
      total: m.total,
      rss: m.rss,
      heap: m.heapUsed,
      heapTotal: m.heapTotal,
    };
  }
  if (
    data.memoryUsed != null ||
    data.memoryTotal != null ||
    data.memoryRss != null ||
    data.heapUsed != null
  ) {
    return {
      used: data.memoryUsed ?? (typeof data.memory === 'number' ? data.memory : undefined),
      total: data.memoryTotal,
      rss: data.memoryRss,
      heap: data.heapUsed,
      heapTotal: data.heapTotal,
    };
  }
  if (typeof data.memory === 'number') {
    return { used: data.memory };
  }
  return null;
}

function normalizeServices(
  raw: HealthCheckData['services'] | HealthCheckData['connections']
): ServiceStatus[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') {
    return Object.entries(raw).map(([name, value]) => {
      if (typeof value === 'string') return { name, status: value };
      if (typeof value === 'object' && value !== null) return { name, ...(value as ServiceStatus) };
      return { name, status: String(value) };
    });
  }
  return [];
}

function ServiceRow({ service }: { service: ServiceStatus }) {
  const s = (service.status ?? '').toLowerCase();
  const isOk = s === 'ok' || s === 'healthy' || s === 'connected' || s === 'up';
  const isError =
    s === 'error' || s === 'unhealthy' || s === 'disconnected' || s === 'down' || s === 'failed';
  const isDegraded = s === 'degraded' || s === 'slow' || s === 'warning';

  let Icon = AlertTriangle;
  let color = 'text-muted-foreground';
  if (isOk) {
    Icon = CheckCircle2;
    color = 'text-green-500';
  } else if (isError) {
    Icon = XCircle;
    color = 'text-red-500';
  } else if (isDegraded) {
    Icon = AlertTriangle;
    color = 'text-amber-500';
  }

  return (
    <div className="flex items-center gap-1.5 rounded px-1 py-0.5">
      <Icon className={cn('size-3 shrink-0', color)} />
      <span className="min-w-0 flex-1 truncate text-foreground/70">
        {service.name ?? 'Service'}
      </span>
      <span className={cn('text-[10px]', color)}>{service.status ?? '—'}</span>
      {service.latency != null && (
        <span className="text-[10px] text-muted-foreground">{service.latency}ms</span>
      )}
    </div>
  );
}

export function HealthCheckCard({ output, state }: ToolResultRendererProps) {
  const isLoading =
    state === 'input-streaming' || state === 'input-available' || state === 'approval-responded';

  if (isLoading) {
    return (
      <div
        data-slot="health-check-card"
        className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
      >
        <Loader2 className="size-3.5 animate-spin" />
        <span>Checking server health…</span>
      </div>
    );
  }

  const data = extractData(output);
  if (!data) {
    return (
      <div
        data-slot="health-check-card"
        className="rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
      >
        Health check data unavailable
      </div>
    );
  }

  const uptimeSeconds = data.uptimeSeconds ?? data.uptime;
  const memStats = getMemoryStats(data);
  const services = normalizeServices(data.services ?? data.connections);

  const overallOk =
    !data.status || data.status === 'ok' || data.status === 'healthy' || data.status === 'up';
  const overallDegraded = data.status === 'degraded';

  return (
    <div
      data-slot="health-check-card"
      className="rounded-md border border-border/50 bg-muted/30 text-xs"
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b border-border/50 px-3 py-1.5">
        <Server className="size-3.5 text-muted-foreground" />
        <span className="font-medium text-foreground/80">Health Check</span>
        {data.status && (
          <span
            className={cn(
              'ml-1 rounded px-1.5 py-0.5 font-medium',
              overallOk
                ? 'bg-green-500/10 text-green-500'
                : overallDegraded
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-red-500/10 text-red-500'
            )}
          >
            {data.status}
          </span>
        )}
        {data.version && (
          <code className="ml-auto rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            v{data.version}
          </code>
        )}
      </div>

      {/* Stats row: uptime + memory */}
      {(uptimeSeconds != null || memStats) && (
        <div className="flex flex-wrap gap-2 border-b border-border/50 px-3 py-2">
          {uptimeSeconds != null && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Uptime</span>
              <span className="font-medium text-foreground/80">{formatUptime(uptimeSeconds)}</span>
            </div>
          )}
          {memStats?.rss != null && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">RSS</span>
              <span className="font-medium text-foreground/80">{formatBytes(memStats.rss)}</span>
            </div>
          )}
          {memStats?.heap != null && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Heap</span>
              <span className="font-medium text-foreground/80">
                {formatBytes(memStats.heap)}
                {memStats.heapTotal != null && (
                  <span className="text-muted-foreground">/{formatBytes(memStats.heapTotal)}</span>
                )}
              </span>
            </div>
          )}
          {memStats?.used != null && memStats.rss == null && memStats.heap == null && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Memory</span>
              <span className="font-medium text-foreground/80">
                {formatBytes(memStats.used)}
                {memStats.total != null && (
                  <span className="text-muted-foreground">/{formatBytes(memStats.total)}</span>
                )}
              </span>
            </div>
          )}
          {data.environment && (
            <div className="ml-auto flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Env</span>
              <span className="font-medium text-foreground/80">{data.environment}</span>
            </div>
          )}
        </div>
      )}

      {/* Connected services */}
      {services.length > 0 && (
        <div className="p-2">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1">
            Services
          </span>
          <div className="space-y-0.5">
            {services.map((service, i) => (
              <ServiceRow key={service.name ?? i} service={service} />
            ))}
          </div>
        </div>
      )}

      {/* Timestamp footer */}
      {data.timestamp && (
        <div
          className={cn(
            'px-3 py-1 text-[10px] text-muted-foreground',
            services.length > 0 ? 'border-t border-border/50' : ''
          )}
        >
          {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
