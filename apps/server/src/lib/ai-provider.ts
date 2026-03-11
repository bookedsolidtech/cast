/**
 * AI Provider — shared Anthropic provider for @ai-sdk/anthropic routes.
 *
 * Resolves credentials using the same chain as the Claude Agent SDK:
 * 1. ANTHROPIC_API_KEY environment variable
 * 2. Claude CLI OAuth token (~/.claude/.credentials.json)
 * 3. In-memory stored API key (from settings UI)
 *
 * All routes that call the Anthropic API via @ai-sdk/anthropic should use
 * getAnthropicModel() instead of importing `anthropic` directly, so they
 * work with CLI OAuth auth (Claude Max/Pro plans) and not just API keys.
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { getClaudeCredentialPaths, systemPathReadFile } from '@protolabsai/platform';
import { createLogger } from '@protolabsai/utils';

const logger = createLogger('AIProvider');

/** Cached provider instance — created once, reused across requests. */
let cachedProvider: ReturnType<typeof createAnthropic> | null = null;

/**
 * Read the OAuth access token from Claude CLI credential files.
 * Supports:
 * - Claude Code format: { claudeAiOauth: { accessToken } }
 * - Legacy format: { oauth_token } or { access_token }
 */
async function readCliOAuthToken(): Promise<string | null> {
  const credentialPaths = getClaudeCredentialPaths();
  for (const credPath of credentialPaths) {
    try {
      const content = await systemPathReadFile(credPath);
      const creds = JSON.parse(content) as Record<string, unknown>;

      // Claude Code CLI format
      const claudeOauth = creds.claudeAiOauth as { accessToken?: string } | undefined;
      if (claudeOauth?.accessToken) {
        return claudeOauth.accessToken;
      }

      // Legacy formats
      if (typeof creds.oauth_token === 'string') return creds.oauth_token;
      if (typeof creds.access_token === 'string') return creds.access_token;
    } catch {
      // Continue to next credential path
    }
  }
  return null;
}

/**
 * Create or return the cached Anthropic provider with proper auth.
 * Checks env API key first, then falls back to CLI OAuth token.
 */
async function getOrCreateProvider(): Promise<ReturnType<typeof createAnthropic>> {
  if (cachedProvider) return cachedProvider;

  // 1. Check ANTHROPIC_API_KEY env var (highest priority)
  if (process.env.ANTHROPIC_API_KEY) {
    logger.info('Using ANTHROPIC_API_KEY from environment');
    cachedProvider = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return cachedProvider;
  }

  // 2. Check ANTHROPIC_AUTH_TOKEN env var
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    logger.info('Using ANTHROPIC_AUTH_TOKEN from environment');
    cachedProvider = createAnthropic({ authToken: process.env.ANTHROPIC_AUTH_TOKEN });
    return cachedProvider;
  }

  // 3. Read CLI OAuth token
  const oauthToken = await readCliOAuthToken();
  if (oauthToken) {
    logger.info('Using Claude CLI OAuth token for AI SDK provider');
    cachedProvider = createAnthropic({ authToken: oauthToken });
    return cachedProvider;
  }

  // 4. Fallback — let @ai-sdk/anthropic try its own defaults (will likely fail)
  logger.warn(
    'No API key or OAuth token found. AI SDK chat routes will fail. ' +
      'Set ANTHROPIC_API_KEY or authenticate via Claude CLI.'
  );
  cachedProvider = createAnthropic();
  return cachedProvider;
}

/**
 * Get an Anthropic model instance with proper authentication.
 * Drop-in replacement for `anthropic(modelId)` from @ai-sdk/anthropic.
 *
 * @param modelId - The model ID (e.g., 'claude-sonnet-4-6')
 * @returns A language model instance ready for streamText/generateText
 */
export async function getAnthropicModel(modelId: string) {
  const provider = await getOrCreateProvider();
  return provider(modelId);
}

/**
 * Invalidate the cached provider (e.g., after credentials change).
 */
export function resetAnthropicProvider(): void {
  cachedProvider = null;
}
