/**
 * AuthorityService Unit Tests
 *
 * Tests for executeAction() enforcement:
 * - Action within trust tier → allowed
 * - Action above trust tier → blocked + approval request created
 * - Pre-approved action → auto-approved (bypasses risk threshold)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { AuthorityService } from '@/services/authority-service.js';
import type { ActionProposal } from '@protolabsai/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEventEmitter() {
  const emitted: Array<{ event: string; payload: unknown }> = [];
  return {
    emit(event: string, payload: unknown) {
      emitted.push({ event, payload });
    },
    emitted,
  };
}

function makeActionableItemService() {
  const created: unknown[] = [];
  return {
    async createActionableItem(input: unknown) {
      created.push(input);
      return { id: 'mock-actionable-id', ...input };
    },
    created,
  };
}

function makeProposal(overrides: Partial<ActionProposal> = {}): ActionProposal {
  return {
    who: 'AGENT_PLACEHOLDER', // replaced in tests
    what: 'create_work',
    target: 'Test Feature',
    justification: 'Testing enforcement',
    risk: 'low',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthorityService.executeAction()', () => {
  let testDir: string;
  let events: ReturnType<typeof makeEventEmitter>;
  let service: AuthorityService;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `authority-service-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    events = makeEventEmitter();
    service = new AuthorityService(events as any);

    const actionableItems = makeActionableItemService();
    service.setActionableItemService(actionableItems as any);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  // -------------------------------------------------------------------------
  // Enforcement disabled (default)
  // -------------------------------------------------------------------------

  describe('when authorityEnforcement is false (default)', () => {
    it('returns allowed without any enforcement checks', async () => {
      const result = await service.executeAction(makeProposal(), testDir, {
        authorityEnforcement: false,
      });

      expect(result.verdict).toBe('allowed');
      expect(result.reason).toMatch(/disabled/i);
    });

    it('returns allowed when no options are passed (backward compat)', async () => {
      // Old signature: executeAction(proposal) — no projectPath, no options
      const result = await service.executeAction(makeProposal());
      expect(result.verdict).toBe('allowed');
    });
  });

  // -------------------------------------------------------------------------
  // Enforcement enabled
  // -------------------------------------------------------------------------

  describe('when authorityEnforcement is true', () => {
    // Register an agent with trust level 1 (max risk: 'low') before each test
    let agentId: string;

    beforeEach(async () => {
      // Register a product-manager agent (trust level 1, max risk: low)
      const agent = await service.registerAgent('product-manager', testDir);
      agentId = agent.id;
    });

    // -----------------------------------------------------------------------
    // Path 1: action within trust → approved
    // -----------------------------------------------------------------------

    describe('action within trust tier', () => {
      it('allows a low-risk action for a trust-1 agent', async () => {
        const proposal = makeProposal({ who: agentId, risk: 'low' });

        const result = await service.executeAction(proposal, testDir, {
          authorityEnforcement: true,
        });

        expect(result.verdict).toBe('allowed');
        expect(result.requestId).toBeUndefined();
      });

      it('does not create an approval request for an allowed action', async () => {
        const actionableItems = makeActionableItemService();
        service.setActionableItemService(actionableItems as any);

        const proposal = makeProposal({ who: agentId, risk: 'low' });
        await service.executeAction(proposal, testDir, { authorityEnforcement: true });

        expect(actionableItems.created).toHaveLength(0);
      });

      it('emits authority:approved event', async () => {
        const proposal = makeProposal({ who: agentId, risk: 'low' });
        await service.executeAction(proposal, testDir, { authorityEnforcement: true });

        const approvedEvents = events.emitted.filter((e) => e.event === 'authority:approved');
        expect(approvedEvents).toHaveLength(1);
      });
    });

    // -----------------------------------------------------------------------
    // Path 2: action above trust → blocked + approval created
    // -----------------------------------------------------------------------

    describe('action above trust tier', () => {
      it('blocks a high-risk action for a trust-1 agent (max risk: low)', async () => {
        const proposal = makeProposal({ who: agentId, risk: 'high' });

        const result = await service.executeAction(proposal, testDir, {
          authorityEnforcement: true,
        });

        expect(result.verdict).toBe('blocked');
        expect(result.reason).toMatch(/high/);
        expect(result.reason).toMatch(/low/);
      });

      it('creates an approval request when blocked', async () => {
        const actionableItems = makeActionableItemService();
        service.setActionableItemService(actionableItems as any);

        const proposal = makeProposal({ who: agentId, risk: 'high' });
        const result = await service.executeAction(proposal, testDir, {
          authorityEnforcement: true,
        });

        expect(result.requestId).toBeDefined();
        expect(actionableItems.created).toHaveLength(1);
      });

      it('includes the approval request ID in the result', async () => {
        const proposal = makeProposal({ who: agentId, risk: 'medium' });

        const result = await service.executeAction(proposal, testDir, {
          authorityEnforcement: true,
        });

        // trust-1 max risk is 'low', so 'medium' should be blocked
        expect(result.verdict).toBe('blocked');
        expect(typeof result.requestId).toBe('string');
      });

      it('emits authority:rejected event when blocked', async () => {
        const proposal = makeProposal({ who: agentId, risk: 'critical' });
        await service.executeAction(proposal, testDir, { authorityEnforcement: true });

        const rejectedEvents = events.emitted.filter((e) => e.event === 'authority:rejected');
        expect(rejectedEvents).toHaveLength(1);
      });

      it('adds the blocked action to the pending approvals queue', async () => {
        const proposal = makeProposal({ who: agentId, risk: 'high' });
        await service.executeAction(proposal, testDir, { authorityEnforcement: true });

        const pending = await service.getPendingApprovals(testDir);
        expect(pending).toHaveLength(1);
        expect(pending[0].proposal.what).toBe(proposal.what);
      });
    });

    // -----------------------------------------------------------------------
    // Path 3: pre-approved action → auto-approved
    // -----------------------------------------------------------------------

    describe('pre-approved action', () => {
      it('auto-approves an action marked as preApproved even when risk exceeds trust tier', async () => {
        // trust-1 max risk is 'low', but preApproved skips threshold check
        const proposal = makeProposal({ who: agentId, risk: 'critical', preApproved: true });

        const result = await service.executeAction(proposal, testDir, {
          authorityEnforcement: true,
        });

        expect(result.verdict).toBe('allowed');
        expect(result.reason).toMatch(/pre-approved/i);
        expect(result.requestId).toBeUndefined();
      });

      it('does not create an approval request for pre-approved actions', async () => {
        const actionableItems = makeActionableItemService();
        service.setActionableItemService(actionableItems as any);

        const proposal = makeProposal({ who: agentId, risk: 'high', preApproved: true });
        await service.executeAction(proposal, testDir, { authorityEnforcement: true });

        expect(actionableItems.created).toHaveLength(0);
      });

      it('does not add pre-approved actions to the pending approvals queue', async () => {
        const proposal = makeProposal({ who: agentId, risk: 'high', preApproved: true });
        await service.executeAction(proposal, testDir, { authorityEnforcement: true });

        const pending = await service.getPendingApprovals(testDir);
        expect(pending).toHaveLength(0);
      });
    });

    // -----------------------------------------------------------------------
    // Unregistered agent
    // -----------------------------------------------------------------------

    describe('unregistered agent', () => {
      it('blocks the action when agent is not registered', async () => {
        const proposal = makeProposal({ who: 'unknown-agent-id', risk: 'low' });

        const result = await service.executeAction(proposal, testDir, {
          authorityEnforcement: true,
        });

        expect(result.verdict).toBe('blocked');
        expect(result.reason).toMatch(/not registered/i);
      });
    });

    // -----------------------------------------------------------------------
    // Higher trust tiers
    // -----------------------------------------------------------------------

    describe('higher trust tier agents', () => {
      it('allows a high-risk action for a CTO agent (trust level 3, max risk: high)', async () => {
        const ctoAgent = await service.registerAgent('cto', testDir);
        const proposal = makeProposal({ who: ctoAgent.id, risk: 'high' });

        const result = await service.executeAction(proposal, testDir, {
          authorityEnforcement: true,
        });

        expect(result.verdict).toBe('allowed');
      });

      it('blocks a critical-risk action even for a CTO agent (max risk: high)', async () => {
        const ctoAgent = await service.registerAgent('cto', testDir);
        const proposal = makeProposal({ who: ctoAgent.id, risk: 'critical' });

        const result = await service.executeAction(proposal, testDir, {
          authorityEnforcement: true,
        });

        expect(result.verdict).toBe('blocked');
      });
    });
  });
});
