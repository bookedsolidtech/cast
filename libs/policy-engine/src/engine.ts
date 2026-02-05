/**
 * Core policy engine implementation
 */

import type {
  EngineActionProposal,
  AgentTrustProfile,
  EnginePolicyConfig,
  EnginePolicyDecision,
  PermissionMatrixEntry,
  StatusTransitionGuard,
  RiskLevel,
} from '@automaker/types';
import { compareRiskLevels } from './defaults.js';

/**
 * Check if a role has permission to perform an action
 */
function checkPermission(
  trustProfile: AgentTrustProfile,
  proposal: EngineActionProposal,
  config: EnginePolicyConfig
): { hasPermission: boolean; permissionEntry?: PermissionMatrixEntry } {
  const permissionEntry = config.permissionMatrix[trustProfile.role];
  if (!permissionEntry) {
    return { hasPermission: false };
  }

  // Check custom permissions first
  if (trustProfile.customPermissions?.[proposal.action] !== undefined) {
    return {
      hasPermission: trustProfile.customPermissions[proposal.action] ?? false,
      permissionEntry,
    };
  }

  // Check if action is in allowed actions
  const hasPermission = permissionEntry.allowedActions.includes(proposal.action);
  return { hasPermission, permissionEntry };
}

/**
 * Check if a status transition is allowed
 */
function checkStatusTransition(
  trustProfile: AgentTrustProfile,
  proposal: EngineActionProposal,
  config: EnginePolicyConfig
): { allowed: boolean; guard?: StatusTransitionGuard } {
  // If no status transition is specified, allow it
  if (!proposal.currentStatus || !proposal.targetStatus) {
    return { allowed: true };
  }

  // If no transition guards configured, allow all
  if (!config.statusTransitions || config.statusTransitions.length === 0) {
    return { allowed: true };
  }

  // Find matching transition guard
  const guard = config.statusTransitions.find(
    (g) => g.from === proposal.currentStatus && g.to === proposal.targetStatus
  );

  // If no guard exists for this transition, deny by default
  if (!guard) {
    return { allowed: false };
  }

  // Check if role is allowed for this transition
  const allowed = guard.allowedRoles.includes(trustProfile.role);
  return { allowed, guard };
}

/**
 * Check risk gating rules
 */
function checkRiskGating(
  trustProfile: AgentTrustProfile,
  proposal: EngineActionProposal,
  permissionEntry: PermissionMatrixEntry,
  guard: StatusTransitionGuard | undefined
): {
  gateTriggered: boolean;
  reason?: string;
  details: {
    agentMaxRisk: RiskLevel;
    actionRisk: RiskLevel;
    permissionRiskLimit?: RiskLevel;
  };
} {
  const details = {
    agentMaxRisk: trustProfile.maxRiskLevel,
    actionRisk: proposal.actionRisk,
    permissionRiskLimit: permissionEntry.actionRiskLimits?.[proposal.action],
  };

  // Check if action risk exceeds agent's max risk level
  if (compareRiskLevels(proposal.actionRisk, trustProfile.maxRiskLevel) > 0) {
    return {
      gateTriggered: true,
      reason: `Action risk (${proposal.actionRisk}) exceeds agent max risk (${trustProfile.maxRiskLevel})`,
      details,
    };
  }

  // Check permission-level risk limits
  if (details.permissionRiskLimit) {
    if (compareRiskLevels(proposal.actionRisk, details.permissionRiskLimit) > 0) {
      return {
        gateTriggered: true,
        reason: `Action risk (${proposal.actionRisk}) exceeds permission risk limit (${details.permissionRiskLimit})`,
        details,
      };
    }
  }

  // Check transition-specific risk requirements
  if (guard?.requiresApprovalAbove) {
    if (compareRiskLevels(proposal.actionRisk, guard.requiresApprovalAbove) > 0) {
      return {
        gateTriggered: true,
        reason: `Action risk (${proposal.actionRisk}) requires approval above ${guard.requiresApprovalAbove}`,
        details,
      };
    }
  }

  return {
    gateTriggered: false,
    details,
  };
}

/**
 * Main policy checking function
 *
 * Evaluates an action proposal against policy configuration:
 * 1. Check permission matrix (does role have permission for action?)
 * 2. Check status transition guards (is transition allowed?)
 * 3. Check risk gating (does action risk exceed agent's limits?)
 *
 * @param proposal - The action being proposed
 * @param trustProfile - Agent's trust profile with role and risk limits
 * @param config - Policy configuration
 * @returns EnginePolicyDecision with allow/deny/require_approval and detailed reasoning
 */
export function checkPolicy(
  proposal: EngineActionProposal,
  trustProfile: AgentTrustProfile,
  config: EnginePolicyConfig
): EnginePolicyDecision {
  // Step 1: Check permission matrix
  const { hasPermission, permissionEntry } = checkPermission(trustProfile, proposal, config);

  if (!hasPermission) {
    return {
      decision: 'deny',
      reason: `Role ${trustProfile.role} does not have permission for action ${proposal.action}`,
      hasPermission: false,
      transitionAllowed: true, // Not relevant if no permission
      riskGateTriggered: false,
    };
  }

  // Step 2: Check status transition guards
  const { allowed: transitionAllowed, guard } = checkStatusTransition(
    trustProfile,
    proposal,
    config
  );

  if (!transitionAllowed) {
    return {
      decision: 'deny',
      reason: `Role ${trustProfile.role} cannot transition from ${proposal.currentStatus} to ${proposal.targetStatus}`,
      hasPermission: true,
      transitionAllowed: false,
      riskGateTriggered: false,
    };
  }

  // Step 3: Check risk gating
  const riskCheck = checkRiskGating(trustProfile, proposal, permissionEntry!, guard);

  if (riskCheck.gateTriggered) {
    return {
      decision: 'require_approval',
      reason: riskCheck.reason!,
      hasPermission: true,
      transitionAllowed: true,
      riskGateTriggered: true,
      details: riskCheck.details,
    };
  }

  // All checks passed
  return {
    decision: 'allow',
    reason: 'All policy checks passed',
    hasPermission: true,
    transitionAllowed: true,
    riskGateTriggered: false,
    details: riskCheck.details,
  };
}
