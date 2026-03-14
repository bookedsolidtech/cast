/**
 * Quarantine Management Tools
 *
 * Tools for managing quarantine entries:
 * - list_quarantine_entries: List quarantine entries (with optional filtering)
 * - approve_quarantine_entry: Approve a pending entry
 * - reject_quarantine_entry: Reject with reason
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const quarantineTools: Tool[] = [
  {
    name: 'list_quarantine_entries',
    description:
      'List all quarantine entries in a project. Can filter by result (pending, passed, failed, bypassed). Returns entries with violation details and sanitization information.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to the project directory',
        },
        result: {
          type: 'string',
          enum: ['pending', 'passed', 'failed', 'bypassed'],
          description:
            'Filter by result (optional). "pending" means entries that failed validation and are awaiting manual review.',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'approve_quarantine_entry',
    description:
      'Approve a quarantine entry after manual review. This marks the entry as passed and allows the feature to be created from the sanitized input.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to the project directory',
        },
        quarantineId: {
          type: 'string',
          description: 'The quarantine entry ID (UUID)',
        },
        reviewedBy: {
          type: 'string',
          description: 'Username of the reviewer approving this entry',
        },
      },
      required: ['projectPath', 'quarantineId', 'reviewedBy'],
    },
  },
  {
    name: 'reject_quarantine_entry',
    description:
      'Reject a quarantine entry after manual review. This marks the entry as failed with a rejection reason.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to the project directory',
        },
        quarantineId: {
          type: 'string',
          description: 'The quarantine entry ID (UUID)',
        },
        reviewedBy: {
          type: 'string',
          description: 'Username of the reviewer rejecting this entry',
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection (e.g., "Contains malicious content")',
        },
      },
      required: ['projectPath', 'quarantineId', 'reviewedBy', 'reason'],
    },
  },
];
