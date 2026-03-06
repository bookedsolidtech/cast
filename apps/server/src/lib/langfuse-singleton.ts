/**
 * Langfuse Singleton
 *
 * Provides a single shared LangfuseClient instance for the entire server.
 * Lazy-initialized on first access. Gracefully degrades when credentials
 * are missing — callers should check isAvailable() before relying on tracing.
 */

import { LangfuseClient } from '@protolabsai/observability';
import { createLogger } from '@protolabsai/utils';

const logger = createLogger('LangfuseSingleton');

let instance: LangfuseClient | null = null;

/**
 * Get the shared LangfuseClient instance.
 * Creates one on first call using env vars. Returns a disabled client
 * if credentials are missing (isAvailable() will return false).
 */
export function getLangfuseInstance(): LangfuseClient {
  if (!instance) {
    instance = new LangfuseClient({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL,
      enabled: true,
    });

    if (instance.isAvailable()) {
      logger.info('Langfuse singleton initialized (tracing enabled)');
    } else {
      logger.warn(
        'Langfuse singleton initialized but DISABLED — missing LANGFUSE_PUBLIC_KEY or LANGFUSE_SECRET_KEY. Agent traces will NOT be recorded.'
      );
    }
  }
  return instance;
}

/**
 * Shutdown the Langfuse client and flush pending events.
 * Called during server graceful shutdown.
 */
export async function shutdownLangfuse(): Promise<void> {
  if (instance) {
    await instance.shutdown();
    instance = null;
    logger.info('Langfuse singleton shut down');
  }
}
