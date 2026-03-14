/**
 * Docs API Routes
 *
 * Serves markdown documentation files from a configurable directory:
 * - GET /api/docs/list?projectPath= - List all markdown files in the docs directory
 * - GET /api/docs/file?projectPath=&path= - Get raw markdown content for a specific file
 * - GET /api/docs/config?projectPath= - Get the current docs path configuration
 *
 * The docs directory is resolved from project settings (docsPath field).
 * Falls back to {projectRoot}/docs/ when not configured.
 * Returns 404 when the directory doesn't exist or docsPath is explicitly null (disabled).
 */

import { Router } from 'express';
import type { SettingsService } from '../services/settings-service.js';
import { createLogger } from '@protolabsai/utils';
import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import { join, basename, extname, resolve, isAbsolute, relative, sep } from 'node:path';

const logger = createLogger('DocsRoutes');

/**
 * Resolve the docs directory for a project.
 * Priority: projectSettings.docsPath > {projectPath}/docs/
 * Returns null if explicitly disabled (docsPath === null).
 */
async function resolveDocsDir(
  projectPath: string,
  settingsService: SettingsService
): Promise<string | null> {
  const projectSettings = await settingsService.getProjectSettings(projectPath);
  const docsPath = projectSettings?.docsPath;

  // Explicitly disabled
  if (docsPath === null) {
    return null;
  }

  // Configured path — resolve relative to project root or use as absolute
  if (docsPath) {
    return isAbsolute(docsPath) ? docsPath : join(projectPath, docsPath);
  }

  // Default: {projectPath}/docs/
  return join(projectPath, 'docs');
}

/**
 * Validate that the requested path is within the docs directory and is a .md file.
 * Uses realpath to resolve symlinks and prevent traversal attacks.
 */
async function isPathSafe(docsDir: string, requestedPath: string): Promise<boolean> {
  if (extname(requestedPath) !== '.md') {
    return false;
  }

  try {
    const resolvedDocsDir = await realpath(docsDir);
    const targetPath = join(docsDir, requestedPath);
    const resolvedTarget = await realpath(targetPath);
    return resolvedTarget.startsWith(resolvedDocsDir + '/') || resolvedTarget === resolvedDocsDir;
  } catch {
    const normalized = resolve(docsDir, requestedPath);
    const resolvedDocsDir = resolve(docsDir);
    return normalized.startsWith(resolvedDocsDir + '/');
  }
}

/**
 * Extract title from markdown content.
 * Looks for first H1 heading (# Title) or derives from filename.
 */
function extractTitle(content: string, filename: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  const nameWithoutExt = basename(filename, '.md');
  return nameWithoutExt
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate slug from filename: "brand.md" -> "brand"
 */
function generateSlug(filename: string): string {
  return basename(filename, '.md');
}

/**
 * Recursively collect all .md files from a directory tree.
 * Returns paths relative to the base docs directory.
 */
async function collectMarkdownFiles(dir: string, baseDir: string): Promise<string[]> {
  const results: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip hidden directories and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const nested = await collectMarkdownFiles(fullPath, baseDir);
        results.push(...nested);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relativePath = relative(baseDir, fullPath);
        results.push(relativePath);
      }
    }
  } catch {
    // Directory not readable, skip
  }

  return results;
}

/**
 * Infer a section label from a file's relative path.
 * Uses the directory name if the file is nested, otherwise infers from filename prefix.
 */
function inferSection(relativePath: string): string {
  // If the file is in a subdirectory, use that directory as the section
  const parts = relativePath.split(sep);
  if (parts.length > 1) {
    return parts[0]
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Top-level files: infer from filename prefix
  const slug = basename(relativePath, '.md');
  const prefixes: Record<string, string> = {
    brand: 'Brand',
    process: 'Process',
    workflow: 'Workflow',
    guide: 'Guides',
    guidelines: 'Guidelines',
    architecture: 'Architecture',
    setup: 'Setup',
    api: 'API',
    spec: 'Specs',
    dev: 'Development',
    development: 'Development',
    test: 'Testing',
    deploy: 'Deployment',
  };

  for (const [prefix, section] of Object.entries(prefixes)) {
    if (slug.startsWith(prefix + '-') || slug === prefix) {
      return section;
    }
  }

  return 'General';
}

export function createDocsRoutes(settingsService: SettingsService): Router {
  const router = Router();

  /**
   * GET /api/docs/config?projectPath=
   * Returns the resolved docs path and whether it exists.
   */
  router.get('/config', async (req, res) => {
    try {
      const { projectPath } = req.query;
      if (!projectPath || typeof projectPath !== 'string') {
        res.status(400).json({ error: 'projectPath parameter is required' });
        return;
      }

      const projectSettings = await settingsService.getProjectSettings(projectPath);
      const configuredPath = projectSettings?.docsPath;
      const docsDir = await resolveDocsDir(projectPath, settingsService);

      let exists = false;
      if (docsDir) {
        try {
          const stats = await stat(docsDir);
          exists = stats.isDirectory();
        } catch {
          exists = false;
        }
      }

      res.json({
        success: true,
        docsPath: configuredPath ?? undefined,
        resolvedPath: docsDir,
        exists,
        disabled: configuredPath === null,
      });
    } catch (error) {
      logger.error('Failed to get docs config:', error);
      res.status(500).json({
        error: 'Failed to get docs configuration',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  /**
   * GET /api/docs/list?projectPath=
   * Returns array of all .md files in the docs directory (recursive).
   */
  router.get('/list', async (req, res) => {
    try {
      const { projectPath } = req.query;
      if (!projectPath || typeof projectPath !== 'string') {
        res.status(400).json({ error: 'projectPath parameter is required' });
        return;
      }

      const docsDir = await resolveDocsDir(projectPath, settingsService);
      if (!docsDir) {
        res.json({ success: true, docs: [], disabled: true });
        return;
      }

      // Check if directory exists
      try {
        const stats = await stat(docsDir);
        if (!stats.isDirectory()) {
          res.json({ success: true, docs: [], dirNotFound: true });
          return;
        }
      } catch {
        res.json({ success: true, docs: [], dirNotFound: true });
        return;
      }

      const mdFiles = await collectMarkdownFiles(docsDir, docsDir);

      const docsData = await Promise.all(
        mdFiles.map(async (relativePath) => {
          try {
            const filePath = join(docsDir, relativePath);
            const content = await readFile(filePath, 'utf-8');
            const title = extractTitle(content, relativePath);
            const slug = generateSlug(relativePath);
            const section = inferSection(relativePath);
            return { path: relativePath, title, slug, section };
          } catch (error) {
            logger.error(`Failed to read file ${relativePath}:`, error);
            return {
              path: relativePath,
              title: generateSlug(relativePath)
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' '),
              slug: generateSlug(relativePath),
              section: inferSection(relativePath),
            };
          }
        })
      );

      res.json({ success: true, docs: docsData });
    } catch (error) {
      logger.error('Failed to list docs:', error);
      res.status(500).json({
        error: 'Failed to list documentation files',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  /**
   * PUT /api/docs/file
   * Save markdown content to a file. Body: { projectPath, path, content }
   */
  router.put('/file', async (req, res) => {
    try {
      const { projectPath, path, content } = req.body as {
        projectPath?: string;
        path?: string;
        content?: string;
      };

      if (!projectPath || typeof projectPath !== 'string') {
        res.status(400).json({ error: 'projectPath is required' });
        return;
      }
      if (!path || typeof path !== 'string') {
        res.status(400).json({ error: 'path is required' });
        return;
      }
      if (typeof content !== 'string') {
        res.status(400).json({ error: 'content is required' });
        return;
      }

      const docsDir = await resolveDocsDir(projectPath, settingsService);
      if (!docsDir) {
        res.status(404).json({ error: 'Docs viewer is disabled for this project' });
        return;
      }

      if (!(await isPathSafe(docsDir, path))) {
        res.status(400).json({
          error: 'Invalid path',
          message: 'Path must be a .md file within the docs directory',
        });
        return;
      }

      const filePath = join(docsDir, path);
      const { writeFile } = await import('node:fs/promises');
      await writeFile(filePath, content, 'utf-8');

      res.json({ success: true, path });
    } catch (error) {
      logger.error('Failed to save doc file:', error);
      res.status(500).json({
        error: 'Failed to save documentation file',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  /**
   * GET /api/docs/file?projectPath=&path=brand.md
   * Returns raw markdown content for the specified file
   */
  router.get('/file', async (req, res) => {
    try {
      const { projectPath, path } = req.query;

      if (!projectPath || typeof projectPath !== 'string') {
        res.status(400).json({ error: 'projectPath parameter is required' });
        return;
      }

      if (!path || typeof path !== 'string') {
        res.status(400).json({ error: 'path parameter is required' });
        return;
      }

      const docsDir = await resolveDocsDir(projectPath, settingsService);
      if (!docsDir) {
        res.status(404).json({ error: 'Docs viewer is disabled for this project' });
        return;
      }

      if (!(await isPathSafe(docsDir, path))) {
        res.status(400).json({
          error: 'Invalid path',
          message: 'Path must be a .md file within the docs directory',
        });
        return;
      }

      const filePath = join(docsDir, path);
      const content = await readFile(filePath, 'utf-8');
      const title = extractTitle(content, path);

      res.json({ success: true, path, title, content });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        res.status(404).json({
          error: 'File not found',
          message: `The requested file does not exist: ${req.query.path}`,
        });
        return;
      }

      logger.error('Failed to read doc file:', error);
      res.status(500).json({
        error: 'Failed to read documentation file',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  return router;
}
