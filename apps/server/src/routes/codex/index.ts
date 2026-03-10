/**
 * Codex routes — model listing for the UI model selector
 */

import { Router } from 'express';
import { CODEX_MODELS } from '../../providers/codex-models.js';

export function createCodexRoutes(): Router {
  const router = Router();

  /**
   * GET /api/codex/models
   *
   * Returns available Codex models for the UI model selector.
   * Query: ?refresh=true (ignored — models are static definitions)
   */
  router.get('/models', (_req, res) => {
    const models = CODEX_MODELS.map((m) => ({
      id: m.id,
      label: m.name,
      description: m.description,
      hasThinking: m.hasReasoning ?? false,
      supportsVision: m.supportsVision ?? false,
      tier: m.tier ?? 'standard',
      isDefault: m.default ?? false,
    }));

    res.json({
      success: true,
      models,
      cachedAt: Date.now(),
    });
  });

  return router;
}
