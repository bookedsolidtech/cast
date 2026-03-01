import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsView } from '@/components/views/analytics-view';

export const Route = createFileRoute('/system-view')({
  component: AnalyticsView,
});
