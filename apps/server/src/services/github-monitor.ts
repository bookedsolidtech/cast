/**
 * GitHub Monitor Service
 *
 * Monitors GitHub for pull requests needing review.
 * Used by QA Engineer agents to detect new PRs and provide quality reviews.
 */

import type { EventEmitter } from '../lib/events.js';
import type { GitHubMonitorConfig, WorkItem } from '@automaker/types';
import { createLogger } from '@automaker/utils';

const logger = createLogger('GitHubMonitor');

/**
 * GitHub PR with metadata
 */
export interface GitHubPRItem {
  number: number;
  title: string;
  description: string;
  author: string;
  branch: string;
  baseBranch: string;
  state: 'open' | 'closed' | 'merged';
  labels: string[];
  createdAt: string;
  updatedAt: string;
  url: string;
  isDraft: boolean;
}

/**
 * GitHubMonitor - Polls GitHub for new PRs
 *
 * Used by headsdown agents (especially QA Engineer) to detect:
 * - New PRs needing review
 * - PR updates (new commits, comments)
 * - PRs ready for merge
 */
export class GitHubMonitor {
  /** Last PR check timestamp */
  private lastCheckTime?: string;

  /** Active polling interval */
  private interval?: NodeJS.Timeout;

  constructor(private events: EventEmitter) {}

  /**
   * Start monitoring GitHub PRs
   */
  async startMonitoring(config: GitHubMonitorConfig): Promise<void> {
    const { pollInterval = 30000, labelFilter = [] } = config;

    // Start polling loop
    this.interval = setInterval(async () => {
      try {
        await this.pollPRs(labelFilter);
      } catch (error) {
        logger.error(`Error polling GitHub PRs:`, error);
      }
    }, pollInterval);

    logger.info(`Started monitoring GitHub PRs`);
  }

  /**
   * Stop monitoring
   */
  stopAll(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
      logger.info(`Stopped monitoring GitHub PRs`);
    }
  }

  /**
   * Poll for new or updated PRs
   */
  private async pollPRs(labelFilter: string[]): Promise<void> {
    const prs = await this.fetchPRs(labelFilter);

    for (const pr of prs) {
      // Check if PR is new or updated since last check
      if (!this.lastCheckTime || new Date(pr.updatedAt) > new Date(this.lastCheckTime)) {
        // Emit event for QA agents
        this.events.emit('github:pr:detected', {
          pr,
        });

        logger.info(`Detected PR needing review: #${pr.number} - ${pr.title}`);
      }
    }

    // Update last check time
    this.lastCheckTime = new Date().toISOString();
  }

  /**
   * Fetch open PRs from GitHub
   *
   * This is a placeholder - actual implementation would use gh CLI or GitHub API.
   */
  private async fetchPRs(labelFilter: string[]): Promise<GitHubPRItem[]> {
    // TODO: Implement actual GitHub PR fetching
    // Options:
    // 1. Use gh CLI: `gh pr list --json number,title,body,author,labels,createdAt,updatedAt`
    // 2. Use GitHub REST API
    // 3. Use Octokit library

    // For now, return empty array (will be implemented when GitHub integration is configured)
    return [];
  }

  /**
   * Convert GitHub PR to WorkItem for headsdown agents
   */
  static prToWorkItem(pr: GitHubPRItem): WorkItem {
    return {
      type: 'github_pr',
      id: `pr-${pr.number}`,
      priority: pr.isDraft ? 5 : 2, // Draft PRs lower priority
      description: `PR #${pr.number}: ${pr.title}`,
      url: pr.url,
      metadata: {
        prNumber: pr.number,
        author: pr.author,
        branch: pr.branch,
        baseBranch: pr.baseBranch,
        labels: pr.labels,
        isDraft: pr.isDraft,
      },
    };
  }

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.interval !== undefined;
  }
}
