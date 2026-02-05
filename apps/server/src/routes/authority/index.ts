/**
 * Authority Routes - API endpoints for the Policy & Trust Authority System
 *
 * Provides endpoints for agent registration, action proposal submission,
 * approval resolution, and trust management.
 */

import { Router, Request, Response } from 'express';
import { createLogger } from '@automaker/utils';
import type { AuthorityService } from '../../services/authority-service.js';
import type { EventEmitter } from '../../lib/events.js';

const logger = createLogger('AuthorityRoutes');

export function createAuthorityRoutes(
  authorityService: AuthorityService,
  events: EventEmitter
): Router {
  const router = Router();

  /**
   * GET /api/authority/status
   * Health check for the authority system
   */
  router.get('/status', (_req: Request, res: Response) => {
    res.json({ enabled: true });
  });

  /**
   * POST /api/authority/register
   * Register a new agent with a given role
   */
  router.post('/register', async (req: Request, res: Response) => {
    try {
      const { role, projectPath } = req.body;

      if (!role || !projectPath) {
        res.status(400).json({ error: 'role and projectPath are required' });
        return;
      }

      const agent = await authorityService.registerAgent(role, projectPath);
      res.json({ agent });
    } catch (error) {
      logger.error('Failed to register agent:', error);
      res.status(500).json({ error: 'Failed to register agent' });
    }
  });

  /**
   * POST /api/authority/propose
   * Submit an action proposal for policy evaluation
   */
  router.post('/propose', async (req: Request, res: Response) => {
    try {
      const { proposal, projectPath } = req.body;

      if (!proposal || !projectPath) {
        res.status(400).json({ error: 'proposal and projectPath are required' });
        return;
      }

      if (!proposal.who || !proposal.what || !proposal.target || !proposal.risk) {
        res.status(400).json({
          error: 'proposal must include who, what, target, and risk fields',
        });
        return;
      }

      const decision = await authorityService.submitProposal(proposal, projectPath);
      res.json({ decision });
    } catch (error) {
      logger.error('Failed to submit proposal:', error);
      res.status(500).json({ error: 'Failed to submit proposal' });
    }
  });

  /**
   * POST /api/authority/resolve
   * Resolve a pending approval request
   */
  router.post('/resolve', async (req: Request, res: Response) => {
    try {
      const { requestId, resolution, resolvedBy, projectPath } = req.body;

      if (!requestId || !resolution || !resolvedBy || !projectPath) {
        res.status(400).json({
          error: 'requestId, resolution, resolvedBy, and projectPath are required',
        });
        return;
      }

      const validResolutions = ['approve', 'reject', 'modify'];
      if (!validResolutions.includes(resolution)) {
        res.status(400).json({
          error: `resolution must be one of: ${validResolutions.join(', ')}`,
        });
        return;
      }

      const request = await authorityService.resolveApproval(
        requestId,
        resolution,
        resolvedBy,
        projectPath
      );

      if (!request) {
        res.status(404).json({ error: 'Approval request not found' });
        return;
      }

      res.json({ request });
    } catch (error) {
      logger.error('Failed to resolve approval:', error);
      res.status(500).json({ error: 'Failed to resolve approval' });
    }
  });

  /**
   * POST /api/authority/approvals
   * Get all pending approval requests for a project
   */
  router.post('/approvals', async (req: Request, res: Response) => {
    try {
      const { projectPath } = req.body;

      if (!projectPath) {
        res.status(400).json({ error: 'projectPath is required' });
        return;
      }

      const approvals = await authorityService.getPendingApprovals(projectPath);
      res.json({ approvals });
    } catch (error) {
      logger.error('Failed to get pending approvals:', error);
      res.status(500).json({ error: 'Failed to get pending approvals' });
    }
  });

  /**
   * POST /api/authority/agents
   * List all registered agents for a project
   */
  router.post('/agents', async (req: Request, res: Response) => {
    try {
      const { projectPath } = req.body;

      if (!projectPath) {
        res.status(400).json({ error: 'projectPath is required' });
        return;
      }

      const agents = await authorityService.getAgents(projectPath);
      res.json({ agents });
    } catch (error) {
      logger.error('Failed to get agents:', error);
      res.status(500).json({ error: 'Failed to get agents' });
    }
  });

  /**
   * POST /api/authority/trust
   * Update an agent's trust level
   */
  router.post('/trust', async (req: Request, res: Response) => {
    try {
      const { agentId, trustLevel, projectPath } = req.body;

      if (!agentId || trustLevel === undefined || !projectPath) {
        res.status(400).json({ error: 'agentId, trustLevel, and projectPath are required' });
        return;
      }

      const validTrustLevels = [0, 1, 2, 3];
      if (!validTrustLevels.includes(trustLevel)) {
        res.status(400).json({
          error: `trustLevel must be one of: ${validTrustLevels.join(', ')}`,
        });
        return;
      }

      const agent = await authorityService.updateTrustLevel(agentId, trustLevel, projectPath);

      if (!agent) {
        res.status(404).json({ error: 'Agent not found' });
        return;
      }

      res.json({ agent });
    } catch (error) {
      logger.error('Failed to update trust level:', error);
      res.status(500).json({ error: 'Failed to update trust level' });
    }
  });

  return router;
}
