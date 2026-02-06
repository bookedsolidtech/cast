/**
 * Worktree Lifecycle Service - Automated cleanup of git worktrees and branches
 *
 * Listens for feature completion events and cleans up:
 * - Git worktrees created for feature execution
 * - Local feature branches that have been merged
 *
 * This prevents the accumulation of stale worktrees (previously 281 / 35GB).
 */

import path from 'path';
import { execSync } from 'child_process';
import { createLogger } from '@automaker/utils';
import type { EventEmitter } from '../lib/events.js';
import type { FeatureLoader } from './feature-loader.js';

const logger = createLogger('WorktreeLifecycle');

/** Delay after PR merge before cleanup (allow CI/webhooks to settle) */
const CLEANUP_DELAY_MS = 10_000;

export class WorktreeLifecycleService {
  private readonly events: EventEmitter;
  private readonly featureLoader: FeatureLoader;
  private initialized = false;

  constructor(events: EventEmitter, featureLoader: FeatureLoader) {
    this.events = events;
    this.featureLoader = featureLoader;
  }

  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.events.subscribe((type, payload) => {
      // Clean up worktree after PR is merged
      if (type === 'feature:pr-merged') {
        const data = payload as Record<string, unknown>;
        const projectPath = data.projectPath as string;
        const branchName = data.branchName as string;
        const featureId = data.featureId as string;

        if (projectPath && branchName) {
          setTimeout(() => {
            void this.cleanupWorktree(projectPath, branchName, featureId);
          }, CLEANUP_DELAY_MS);
        }
      }

      // Also clean up when a feature moves to 'done' status
      if (type === 'feature:completed') {
        const data = payload as Record<string, unknown>;
        const projectPath = data.projectPath as string;
        const featureId = data.featureId as string;

        if (projectPath && featureId) {
          // Delayed cleanup - feature might still need its worktree briefly
          setTimeout(() => {
            void this.cleanupFeatureWorktree(projectPath, featureId);
          }, CLEANUP_DELAY_MS * 3);
        }
      }
    });

    logger.info('Worktree lifecycle service initialized');
  }

  /**
   * Clean up a worktree and optionally its branch.
   */
  async cleanupWorktree(
    projectPath: string,
    branchName: string,
    featureId?: string
  ): Promise<void> {
    const worktreeName = branchName.replace(/\//g, '-');
    const worktreePath = path.join(projectPath, '.worktrees', worktreeName);

    try {
      // Check if worktree exists
      try {
        execSync(`git worktree list --porcelain`, {
          cwd: projectPath,
          encoding: 'utf-8',
          timeout: 10_000,
        });
      } catch {
        return; // git not available or not a repo
      }

      // Remove worktree
      try {
        execSync(`git worktree remove "${worktreePath}" --force`, {
          cwd: projectPath,
          timeout: 30_000,
          encoding: 'utf-8',
        });
        logger.info(`Removed worktree: ${worktreeName}`);
      } catch (error) {
        // Worktree might not exist - that's fine
        logger.debug(`Worktree ${worktreeName} not found or already removed: ${error}`);
      }

      // Check if branch is merged and can be deleted
      try {
        const merged = execSync(`git branch --merged main`, {
          cwd: projectPath,
          encoding: 'utf-8',
          timeout: 10_000,
        });

        if (merged.includes(branchName)) {
          execSync(`git branch -d "${branchName}"`, {
            cwd: projectPath,
            timeout: 10_000,
            encoding: 'utf-8',
          });
          logger.info(`Deleted merged branch: ${branchName}`);
        }
      } catch (error) {
        logger.debug(`Could not delete branch ${branchName}: ${error}`);
      }

      // Emit cleanup event
      this.events.emit('feature:worktree-cleaned', {
        projectPath,
        branchName,
        featureId,
        worktreePath,
      });
    } catch (error) {
      logger.error(`Failed to clean up worktree for ${branchName}:`, error);
    }
  }

  /**
   * Clean up worktree for a feature by looking up its branch name.
   */
  private async cleanupFeatureWorktree(projectPath: string, featureId: string): Promise<void> {
    try {
      const feature = await this.featureLoader.get(projectPath, featureId);
      if (!feature?.branchName) return;

      // Only clean up if feature is truly done
      if (feature.status !== 'done') return;

      await this.cleanupWorktree(projectPath, feature.branchName, featureId);
    } catch (error) {
      logger.error(`Failed to clean up worktree for feature ${featureId}:`, error);
    }
  }

  /**
   * Bulk cleanup: remove all worktrees for features that are in 'done' status.
   * Useful for periodic maintenance.
   */
  async cleanupAllDoneFeatures(projectPath: string): Promise<number> {
    let cleaned = 0;

    try {
      const features = await this.featureLoader.getAll(projectPath);
      const doneFeatures = features.filter((f) => f.status === 'done' && f.branchName);

      for (const feature of doneFeatures) {
        if (feature.branchName) {
          await this.cleanupWorktree(projectPath, feature.branchName, feature.id);
          cleaned++;
        }
      }

      logger.info(`Bulk cleanup: removed ${cleaned} worktrees for done features`);
    } catch (error) {
      logger.error('Failed bulk worktree cleanup:', error);
    }

    return cleaned;
  }
}
