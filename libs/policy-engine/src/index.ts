/**
 * @automaker/policy-engine
 *
 * Policy engine for trust-based authorization in AutoMaker
 */

// Core engine
export { checkPolicy } from './engine.js';

// Defaults and utilities
export {
  DEFAULT_PERMISSION_MATRIX,
  DEFAULT_STATUS_TRANSITIONS,
  DEFAULT_POLICY_CONFIG,
  RISK_LEVEL_ORDER,
  compareRiskLevels,
} from './defaults.js';

// Re-export engine-specific policy types for convenience
export type {
  AgentRoleName,
  PolicyAction,
  RiskLevel,
  PolicyDecisionType,
  WorkflowStatus,
  AgentTrustProfile,
  EngineActionProposal,
  PermissionMatrixEntry,
  PermissionMatrix,
  StatusTransitionGuard,
  EnginePolicyConfig,
  EnginePolicyDecision,
} from '@automaker/types';
