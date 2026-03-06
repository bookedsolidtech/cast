import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger } from '@protolabsai/utils';

const logger = createLogger('PromptLoader');

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Available prompt template names
 */
export type PromptName =
  | 'research-synthesis'
  | 'outline-planner'
  | 'section-writer'
  | 'technical-reviewer'
  | 'style-reviewer'
  | 'fact-checker'
  | 'assembler'
  | 'antagonistic-review';

/**
 * Variables for prompt interpolation
 */
export type PromptVariables = Record<string, string | number | boolean | null | undefined>;

/**
 * Options for compilePrompt
 */
export interface CompilePromptOptions {
  /**
   * Prompt template name
   */
  name: PromptName;

  /**
   * Variables to interpolate into the prompt template
   */
  variables?: PromptVariables;
}

/**
 * Compiled prompt result
 */
export interface CompiledPrompt {
  /**
   * The compiled prompt text with variables interpolated
   */
  prompt: string;

  /**
   * Source of the prompt
   */
  source: 'local';

  /**
   * Variables that were used for interpolation
   */
  variables: PromptVariables;
}

/**
 * Compile a prompt template with variable interpolation.
 *
 * Loads a local markdown prompt template and interpolates {{variable}} placeholders.
 *
 * @param options - Compilation options
 * @returns Compiled prompt with metadata
 *
 * @example
 * ```typescript
 * const prompt = await compilePrompt({
 *   name: 'research-synthesis',
 *   variables: {
 *     topic: 'AI Content Generation',
 *     target_audience: 'developers',
 *     scope: 'technical documentation'
 *   }
 * });
 * ```
 */
export async function compilePrompt(options: CompilePromptOptions): Promise<CompiledPrompt> {
  const { name, variables = {} } = options;

  const promptTemplate = await loadLocalPrompt(name);
  const interpolatedPrompt = interpolateVariables(promptTemplate, variables);

  return {
    prompt: interpolatedPrompt,
    source: 'local',
    variables,
  };
}

/**
 * Load a prompt template from local markdown file
 */
async function loadLocalPrompt(name: PromptName): Promise<string> {
  const promptPath = join(__dirname, 'prompts', `${name}.md`);

  try {
    const content = await readFile(promptPath, 'utf-8');
    logger.debug(`Loaded local prompt: ${name}`, { path: promptPath });
    return content;
  } catch (error) {
    logger.error(`Failed to load local prompt: ${name}`, error);
    throw new Error(`Failed to load prompt template: ${name}. Path: ${promptPath}`);
  }
}

/**
 * Interpolate {{variable}} placeholders in a prompt template
 */
function interpolateVariables(template: string, variables: PromptVariables): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    if (value === null || value === undefined) {
      continue;
    }

    const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(pattern, String(value));
  }

  // Log any remaining uninterpolated variables as warnings
  const remaining = result.match(/\{\{\s*\w+\s*\}\}/g);
  if (remaining) {
    logger.warn(`Uninterpolated variables in prompt: ${remaining.join(', ')}`);
  }

  return result;
}

/**
 * Load a prompt template without variable interpolation.
 * Useful for inspecting raw templates.
 *
 * @param name - Prompt template name
 * @returns Raw prompt template
 */
export async function loadPromptTemplate(
  name: PromptName
): Promise<{ template: string; source: 'local' }> {
  const template = await loadLocalPrompt(name);
  return { template, source: 'local' };
}

/**
 * Get list of available prompt template names
 */
export function getAvailablePrompts(): PromptName[] {
  return [
    'research-synthesis',
    'outline-planner',
    'section-writer',
    'technical-reviewer',
    'style-reviewer',
    'fact-checker',
    'assembler',
  ];
}
