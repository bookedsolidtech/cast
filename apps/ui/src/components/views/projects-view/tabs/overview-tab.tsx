import { useState } from 'react';
import { Calendar, User, Users, Target, Flag } from 'lucide-react';
import { Badge } from '@protolabs-ai/ui/atoms';
import { Button } from '@protolabs-ai/ui/atoms';
import { cn } from '@/lib/utils';
import { HealthIndicator } from '../components/health-indicator';
import { useProjectUpdate } from '../hooks/use-project';
import type { Project, ProjectHealth, ProjectPriority } from '@protolabs-ai/types';
import { toast } from 'sonner';

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'text-red-400' },
  high: { label: 'High', color: 'text-orange-400' },
  medium: { label: 'Medium', color: 'text-yellow-400' },
  low: { label: 'Low', color: 'text-blue-400' },
  none: { label: 'None', color: 'text-muted-foreground' },
};

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function OverviewTab({ project }: { project: Project }) {
  const updateMutation = useProjectUpdate(project.slug);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const milestoneCount = project.milestones?.length ?? 0;
  const phaseCount =
    project.milestones?.reduce((sum, ms) => sum + (ms.phases?.length ?? 0), 0) ?? 0;
  const completedPhases =
    project.milestones?.reduce(
      (sum, ms) => sum + (ms.phases?.filter((p) => p.featureId).length ?? 0),
      0
    ) ?? 0;

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = (field: string) => {
    updateMutation.mutate(
      { [field]: editValue },
      {
        onSuccess: () => {
          setEditingField(null);
          toast.success('Updated');
        },
      }
    );
  };

  const handleHealthChange = (health: ProjectHealth) => {
    updateMutation.mutate({ health });
  };

  const handlePriorityChange = (priority: ProjectPriority) => {
    updateMutation.mutate({ priority });
  };

  return (
    <div className="space-y-6 py-4">
      {/* Goal */}
      {project.goal && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Goal
          </h3>
          <p className="text-sm text-foreground/90">{project.goal}</p>
        </div>
      )}

      {/* Properties Grid */}
      <div className="border border-border/30 rounded-lg divide-y divide-border/20 px-3">
        <PropertyRow label="Status">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {project.status}
          </Badge>
        </PropertyRow>

        <PropertyRow label="Health">
          <div className="flex items-center gap-2">
            {(['on-track', 'at-risk', 'off-track'] as ProjectHealth[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => handleHealthChange(h)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] border transition-colors',
                  project.health === h
                    ? 'border-foreground/30 bg-foreground/10'
                    : 'border-transparent hover:bg-muted/40'
                )}
              >
                <HealthIndicator health={h} size="sm" />
              </button>
            ))}
          </div>
        </PropertyRow>

        <PropertyRow label="Priority">
          <div className="flex items-center gap-1.5">
            {(['urgent', 'high', 'medium', 'low', 'none'] as ProjectPriority[]).map((p) => {
              const config = PRIORITY_LABELS[p];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePriorityChange(p)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] border transition-colors',
                    project.priority === p
                      ? 'border-foreground/30 bg-foreground/10'
                      : 'border-transparent hover:bg-muted/40',
                    config.color
                  )}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </PropertyRow>

        <PropertyRow label="Lead">
          {editingField === 'lead' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-sm bg-background border border-border/50 rounded px-2 py-0.5 w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit('lead');
                  if (e.key === 'Escape') setEditingField(null);
                }}
              />
              <Button size="sm" variant="ghost" onClick={() => saveEdit('lead')}>
                Save
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startEdit('lead', project.lead ?? '')}
              className="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground"
            >
              <User className="w-3.5 h-3.5" />
              {project.lead || 'Set lead...'}
            </button>
          )}
        </PropertyRow>

        <PropertyRow label="Members">
          <span className="flex items-center gap-1.5 text-sm text-foreground/80">
            <Users className="w-3.5 h-3.5" />
            {project.members?.length ? project.members.join(', ') : 'No members'}
          </span>
        </PropertyRow>

        <PropertyRow label="Start Date">
          <span className="flex items-center gap-1.5 text-sm text-foreground/80">
            <Calendar className="w-3.5 h-3.5" />
            {editingField === 'startDate' ? (
              <input
                type="date"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-sm bg-background border border-border/50 rounded px-2 py-0.5"
                autoFocus
                onBlur={() => saveEdit('startDate')}
              />
            ) : (
              <button
                type="button"
                onClick={() => startEdit('startDate', project.startDate ?? '')}
                className="hover:text-foreground"
              >
                {project.startDate || 'Set start date...'}
              </button>
            )}
          </span>
        </PropertyRow>

        <PropertyRow label="Target Date">
          <span className="flex items-center gap-1.5 text-sm text-foreground/80">
            <Target className="w-3.5 h-3.5" />
            {editingField === 'targetDate' ? (
              <input
                type="date"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-sm bg-background border border-border/50 rounded px-2 py-0.5"
                autoFocus
                onBlur={() => saveEdit('targetDate')}
              />
            ) : (
              <button
                type="button"
                onClick={() => startEdit('targetDate', project.targetDate ?? '')}
                className="hover:text-foreground"
              >
                {project.targetDate || 'Set target date...'}
              </button>
            )}
          </span>
        </PropertyRow>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-foreground">{milestoneCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Milestones
          </div>
        </div>
        <div className="border border-border/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-foreground">{phaseCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Phases</div>
        </div>
        <div className="border border-border/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-foreground">
            {phaseCount > 0 ? Math.round((completedPhases / phaseCount) * 100) : 0}%
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Complete</div>
        </div>
      </div>
    </div>
  );
}
