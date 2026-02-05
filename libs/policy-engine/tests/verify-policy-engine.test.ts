/**
 * Verification test for policy engine
 */

import { describe, it, expect } from 'vitest';
import {
  checkPolicy,
  DEFAULT_POLICY_CONFIG,
  type EngineActionProposal,
  type AgentTrustProfile,
} from '../src/index.js';

describe('Policy Engine Verification', () => {
  it('should allow CTO to perform any action at any risk level', () => {
    const cto: AgentTrustProfile = {
      agentId: 'cto-1',
      role: 'CTO',
      maxRiskLevel: 'critical',
    };

    const proposal: EngineActionProposal = {
      action: 'modify_architecture',
      actionRisk: 'critical',
    };

    const decision = checkPolicy(proposal, cto, DEFAULT_POLICY_CONFIG);

    expect(decision.decision).toBe('allow');
    expect(decision.hasPermission).toBe(true);
    expect(decision.riskGateTriggered).toBe(false);
  });

  it('should deny PM from assigning work', () => {
    const pm: AgentTrustProfile = {
      agentId: 'pm-1',
      role: 'PM',
      maxRiskLevel: 'medium',
    };

    const proposal: EngineActionProposal = {
      action: 'assign',
      actionRisk: 'low',
    };

    const decision = checkPolicy(proposal, pm, DEFAULT_POLICY_CONFIG);

    expect(decision.decision).toBe('deny');
    expect(decision.hasPermission).toBe(false);
    expect(decision.reason).toContain('does not have permission');
  });

  it('should require approval when action risk exceeds agent max risk', () => {
    const pm: AgentTrustProfile = {
      agentId: 'pm-1',
      role: 'PM',
      maxRiskLevel: 'medium',
    };

    const proposal: EngineActionProposal = {
      action: 'create_work',
      actionRisk: 'high', // Exceeds PM's max risk of 'medium'
    };

    const decision = checkPolicy(proposal, pm, DEFAULT_POLICY_CONFIG);

    expect(decision.decision).toBe('require_approval');
    expect(decision.hasPermission).toBe(true);
    expect(decision.riskGateTriggered).toBe(true);
    expect(decision.reason).toContain('exceeds agent max risk');
  });

  it('should check status transitions correctly', () => {
    const projM: AgentTrustProfile = {
      agentId: 'projm-1',
      role: 'ProjM',
      maxRiskLevel: 'medium',
    };

    const proposal: EngineActionProposal = {
      action: 'assign',
      actionRisk: 'low',
      currentStatus: 'backlog',
      targetStatus: 'in_progress',
    };

    const decision = checkPolicy(proposal, projM, DEFAULT_POLICY_CONFIG);

    expect(decision.decision).toBe('allow');
    expect(decision.transitionAllowed).toBe(true);
  });

  it('should deny status transitions not allowed for role', () => {
    const pm: AgentTrustProfile = {
      agentId: 'pm-1',
      role: 'PM',
      maxRiskLevel: 'medium',
    };

    const proposal: EngineActionProposal = {
      action: 'create_work',
      actionRisk: 'low',
      currentStatus: 'review',
      targetStatus: 'done',
    };

    const decision = checkPolicy(proposal, pm, DEFAULT_POLICY_CONFIG);

    // PM can create_work but cannot transition review -> done
    expect(decision.decision).toBe('deny');
    expect(decision.transitionAllowed).toBe(false);
    expect(decision.reason).toContain('cannot transition');
  });

  it('should allow PE to modify architecture', () => {
    const pe: AgentTrustProfile = {
      agentId: 'pe-1',
      role: 'PE',
      maxRiskLevel: 'high',
    };

    const proposal: EngineActionProposal = {
      action: 'modify_architecture',
      actionRisk: 'high',
    };

    const decision = checkPolicy(proposal, pe, DEFAULT_POLICY_CONFIG);

    expect(decision.decision).toBe('allow');
    expect(decision.hasPermission).toBe(true);
  });

  it('should allow EM to block releases', () => {
    const em: AgentTrustProfile = {
      agentId: 'em-1',
      role: 'EM',
      maxRiskLevel: 'high',
    };

    const proposal: EngineActionProposal = {
      action: 'block_release',
      actionRisk: 'medium',
    };

    const decision = checkPolicy(proposal, em, DEFAULT_POLICY_CONFIG);

    expect(decision.decision).toBe('allow');
    expect(decision.hasPermission).toBe(true);
  });

  it('should respect custom permissions', () => {
    const pmWithCustom: AgentTrustProfile = {
      agentId: 'pm-special',
      role: 'PM',
      maxRiskLevel: 'medium',
      customPermissions: {
        assign: true, // PM normally cannot assign, but this one can
      },
    };

    const proposal: EngineActionProposal = {
      action: 'assign',
      actionRisk: 'low',
    };

    const decision = checkPolicy(proposal, pmWithCustom, DEFAULT_POLICY_CONFIG);

    expect(decision.decision).toBe('allow');
    expect(decision.hasPermission).toBe(true);
  });
});
