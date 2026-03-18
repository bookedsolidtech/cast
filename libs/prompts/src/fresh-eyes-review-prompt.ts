/**
 * Fresh-Eyes Review Prompt
 *
 * Builds the prompt for the fresh-eyes Haiku review that runs after CI passes
 * but before auto-merge. Returns a structured PASS / CONCERN / BLOCK verdict.
 */

export interface FreshEyesReviewInput {
  prDiff: string;
  featureTitle: string;
  featureDescription: string;
  acceptanceCriteria?: string[];
}

export type FreshEyesVerdict = 'PASS' | 'CONCERN' | 'BLOCK';

export interface FreshEyesReviewResult {
  verdict: FreshEyesVerdict;
  reasoning: string;
  raw: string;
}

export const FRESH_EYES_REVIEW_SYSTEM_PROMPT =
  'You are a senior software engineer performing a rapid code review. Focus on correctness, completeness, and obvious bugs. Be brief and direct.';

/**
 * Build the user prompt for a fresh-eyes review.
 */
export function buildFreshEyesReviewPrompt(input: FreshEyesReviewInput): string {
  const criteria =
    input.acceptanceCriteria && input.acceptanceCriteria.length > 0
      ? input.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
      : 'No explicit criteria provided.';

  return `You are a senior engineer doing a fresh-eyes review of a PR diff.

## Feature
**Title:** ${input.featureTitle}
**Description:** ${input.featureDescription}

## Acceptance Criteria
${criteria}

## PR Diff
\`\`\`diff
${input.prDiff.slice(0, 20000)}
\`\`\`

Review the diff against the feature description and acceptance criteria. Respond with exactly one of:

PASS — The diff correctly implements the described feature with no obvious issues.
CONCERN: [reason] — The diff has minor issues worth noting but should still merge.
BLOCK: [reason] — The diff has critical issues: missing implementation, obvious logic bugs, unhandled error boundaries, or security vulnerabilities.

Respond with only the verdict line. One sentence of reasoning after the verdict keyword.`;
}

/**
 * Parse the LLM response text into a structured FreshEyesReviewResult.
 * Defaults to CONCERN if the response cannot be parsed cleanly.
 */
export function parseFreshEyesVerdict(responseText: string): FreshEyesReviewResult {
  const text = responseText.trim();

  if (text.startsWith('PASS')) {
    const reasoning = text.replace(/^PASS\s*[:\-—]?\s*/i, '').trim();
    return { verdict: 'PASS', reasoning: reasoning || 'No issues found.', raw: text };
  }

  if (text.startsWith('BLOCK')) {
    const reasoning = text.replace(/^BLOCK\s*[:\-—]?\s*/i, '').trim();
    return {
      verdict: 'BLOCK',
      reasoning: reasoning || 'Critical issues detected.',
      raw: text,
    };
  }

  if (text.startsWith('CONCERN')) {
    const reasoning = text.replace(/^CONCERN\s*[:\-—]?\s*/i, '').trim();
    return {
      verdict: 'CONCERN',
      reasoning: reasoning || 'Minor concerns noted.',
      raw: text,
    };
  }

  // Unparseable — treat as CONCERN so we note it but don't block
  return {
    verdict: 'CONCERN',
    reasoning: `Review response could not be parsed: ${text.slice(0, 200)}`,
    raw: text,
  };
}
