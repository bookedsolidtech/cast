import { useAppStore } from '@/store/app-store';
import { EventFeed } from '../../dashboard-view/event-feed';
import { ProjectHealthCard } from '../../dashboard-view/project-health-card';
import { MetricsSection } from '../../dashboard-view/metrics/metrics-section';

export function StatsPanel() {
  const currentProject = useAppStore((s) => s.currentProject);

  if (!currentProject) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <ProjectHealthCard />
        <EventFeed projectPath={currentProject.path} />
        <MetricsSection projectPath={currentProject.path} />
      </div>
    </div>
  );
}
