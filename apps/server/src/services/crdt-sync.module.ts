// CRDT sync module — wires EventBus to CrdtSyncService for cross-instance event propagation.
// Startup handles the actual start() call after repoRoot is resolved.

import type { Feature } from '@protolabsai/types';
import { createLogger } from '@protolabsai/utils';
import type { ServiceContainer } from '../server/services.js';

const logger = createLogger('CrdtSyncModule');

export async function register(container: ServiceContainer): Promise<void> {
  // Bridge the local EventBus to the CRDT sync channel.
  // After this call, broadcast() publishes feature events to remote peers and
  // incoming remote feature events are re-emitted locally.
  container.crdtSyncService.attachEventBus(container.events);

  // Register capacity provider so each heartbeat includes fresh instance metrics.
  // The provider is synchronous and non-blocking; backlog count is refreshed
  // async in the background on each call.
  container.crdtSyncService.setCapacityProvider(() =>
    container.autoModeService.getCapacityMetrics()
  );

  // Persist remote feature events locally so the board stays in sync across instances.
  // This handler runs BEFORE the event is re-emitted on the local bus, so downstream
  // subscribers (UI WebSocket, IntegrationService, etc.) see already-persisted data.
  container.crdtSyncService.onRemoteFeatureEvent((eventType, payload) => {
    const projectPath = payload.projectPath as string | undefined;
    if (!projectPath) return;

    const featureLoader = container.featureLoader;

    switch (eventType) {
      case 'feature:created': {
        const feature = payload.feature as Feature | undefined;
        if (!feature?.id) {
          logger.warn('[CRDT] Received feature:created without feature data, skipping');
          break;
        }
        logger.info(`[CRDT] Persisting remote feature:created ${feature.id}`);
        featureLoader.create(projectPath, feature).catch((err) => {
          logger.error(`[CRDT] Failed to persist remote feature:created ${feature.id}: ${err}`);
        });
        break;
      }
      case 'feature:updated':
      case 'feature:status-changed': {
        const feature = payload.feature as Feature | undefined;
        const featureId = (payload.featureId as string) || feature?.id;
        if (!featureId || !feature) {
          logger.warn(`[CRDT] Received ${eventType} without feature data, skipping`);
          break;
        }
        logger.info(`[CRDT] Persisting remote ${eventType} ${featureId}`);
        // Write the full feature state to disk, skipping event emission to prevent loops.
        featureLoader
          .update(projectPath, featureId, feature, undefined, undefined, undefined, {
            skipEventEmission: true,
          })
          .catch((err) => {
            logger.error(`[CRDT] Failed to persist remote ${eventType} ${featureId}: ${err}`);
          });
        break;
      }
      case 'feature:deleted': {
        const featureId = payload.featureId as string | undefined;
        if (!featureId) {
          logger.warn('[CRDT] Received feature:deleted without featureId, skipping');
          break;
        }
        logger.info(`[CRDT] Persisting remote feature:deleted ${featureId}`);
        featureLoader.delete(projectPath, featureId).catch((err) => {
          logger.error(`[CRDT] Failed to persist remote feature:deleted ${featureId}: ${err}`);
        });
        break;
      }
    }
  });
}
