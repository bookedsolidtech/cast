// @ts-nocheck
import { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Lightbulb,
  Search,
  FileEdit,
  CheckCircle2,
  GitPullRequest,
  AlertCircle,
  Clock,
} from 'lucide-react';
import type { EventType } from '@automaker/types';

interface AuthorityEvent {
  id: string;
  type: EventType;
  timestamp: number;
  message: string;
  agent?: string;
  featureId?: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Get icon for authority event type
 */
function getEventIcon(type: EventType) {
  if (type.includes('idea')) return Lightbulb;
  if (type.includes('research')) return Search;
  if (type.includes('pm-review') || type.includes('pm-prd')) return FileEdit;
  if (type.includes('approved')) return CheckCircle2;
  if (type.includes('pr') || type.includes('feedback')) return GitPullRequest;
  if (type.includes('error') || type.includes('rejected')) return AlertCircle;
  return Clock;
}

/**
 * Get color classes for event severity
 */
function getSeverityClasses(severity: AuthorityEvent['severity']) {
  switch (severity) {
    case 'success':
      return 'text-green-400 border-green-500/30 bg-green-500/10';
    case 'warning':
      return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    case 'error':
      return 'text-red-400 border-red-500/30 bg-red-500/10';
    default:
      return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
  }
}

/**
 * Format relative time (e.g., "2m ago")
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

/**
 * Authority Event Feed - Shows real-time authority system activity
 *
 * Displays PM/ProjM/EM agent events, PRD reviews, epic decomposition,
 * PR feedback, and other authority system lifecycle events.
 */
export const AuthorityEventFeed = memo(function AuthorityEventFeed() {
  const [events, setEvents] = useState<AuthorityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // TODO: Connect to WebSocket and listen for authority events
    // For now, show placeholder message
    setIsConnected(false);

    // Cleanup on unmount
    return () => {
      // TODO: Disconnect WebSocket
    };
  }, []);

  return (
    <Card className="h-full border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Authority System</CardTitle>
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            )}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <ScrollArea className="h-[400px] pr-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No authority events yet</p>
              <p className="text-xs mt-1 opacity-70">PM/ProjM/EM agent activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => {
                const Icon = getEventIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-start gap-2 p-2 rounded-md border text-xs',
                      getSeverityClasses(event.severity)
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{event.message}</p>
                      {event.agent && <p className="text-xs opacity-70 mt-0.5">{event.agent}</p>}
                      <p className="text-xs opacity-50 mt-0.5">
                        {formatRelativeTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
