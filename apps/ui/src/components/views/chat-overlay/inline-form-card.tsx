/**
 * AskUserFormCard — Inline form card rendered inside the tool call block
 * when Ava calls request_user_input.
 *
 * Registered in the tool-result-registry as a full-card renderer so it
 * replaces the standard collapsible ToolInvocationPart chrome.
 *
 * States:
 *   - Running (input-streaming / input-available): shows a compact loading card
 *   - output-available: renders the RJSF form inline using InlineFormCard chrome
 *   - submitted (local state): shows the submitted summary
 *   - cancelled (local state): shows the cancelled summary
 */

import { useState, useCallback, useRef } from 'react';
import {
  InlineFormCard,
  toolResultRegistry,
  type ToolResultRendererProps,
} from '@protolabsai/ui/ai';
import { HITLFormStepRenderer } from '@protolabsai/ui/organisms';
import type { HITLFormStep } from '@protolabsai/types';
import { getHttpApiClient } from '@/lib/http-api-client';
import { toast } from 'sonner';
import { ClipboardList, Loader2 } from 'lucide-react';

interface RequestUserInputInput {
  title: string;
  description?: string;
  steps: Array<{
    schema: Record<string, unknown>;
    uiSchema?: Record<string, unknown>;
    title?: string;
    description?: string;
  }>;
}

function extractFormId(output: unknown): string | null {
  if (!output || typeof output !== 'object') return null;
  const o = output as Record<string, unknown>;
  // Direct formId
  if (typeof o.formId === 'string') return o.formId;
  // Wrapped in ToolResult envelope: { success: true, data: { formId: '...' } }
  if (o.success && o.data && typeof o.data === 'object') {
    const data = o.data as Record<string, unknown>;
    if (typeof data.formId === 'string') return data.formId;
  }
  return null;
}

function extractInput(input: unknown): RequestUserInputInput | null {
  if (!input || typeof input !== 'object') return null;
  const i = input as Record<string, unknown>;
  if (typeof i.title === 'string' && Array.isArray(i.steps)) {
    return i as unknown as RequestUserInputInput;
  }
  return null;
}

function AskUserFormCard({ output, input, state }: ToolResultRendererProps) {
  const [formState, setFormState] = useState<'pending' | 'submitted' | 'cancelled'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const submitRef = useRef<(() => void) | null>(null);

  const isRunning =
    state === 'input-streaming' || state === 'input-available' || state === 'approval-responded';

  const toolInput = extractInput(input);
  const formId = extractFormId(output);

  // Loading state — tool hasn't returned formId yet
  if (isRunning || !formId) {
    return (
      <div
        data-slot="ask-user-form-card"
        className="my-1 flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/5 px-3 py-2.5 text-xs text-muted-foreground"
      >
        <Loader2 className="size-3.5 shrink-0 animate-spin text-blue-500" />
        <span>{toolInput?.title ?? 'Preparing form…'}</span>
      </div>
    );
  }

  const title = toolInput?.title ?? 'Input requested';
  const description = toolInput?.description;
  const firstStep = toolInput?.steps?.[0];

  const handleSubmit = useCallback(() => {
    if (!formId) return;
    // Trigger RJSF form validation and submission via ref
    submitRef.current?.();
  }, [formId]);

  const handleFormSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!formId) return;
      setIsSubmitting(true);
      try {
        const api = getHttpApiClient();
        const result = await api.hitlForms.submit(formId, [data]);
        if (result.success) {
          setFormState('submitted');
          toast.success('Response submitted');
        } else {
          toast.error(result.error ?? 'Failed to submit form');
        }
      } catch {
        toast.error('Failed to submit form');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formId]
  );

  const handleCancel = useCallback(async () => {
    if (!formId) return;
    try {
      const api = getHttpApiClient();
      await api.hitlForms.cancel(formId);
    } catch {
      // best-effort
    }
    setFormState('cancelled');
  }, [formId]);

  return (
    <InlineFormCard
      title={title}
      description={description}
      state={formState}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    >
      {firstStep ? (
        <HITLFormStepRenderer
          step={firstStep as HITLFormStep}
          formData={formData}
          onSubmit={handleFormSubmit}
          onChange={setFormData}
          submitRef={submitRef}
        />
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClipboardList className="size-3.5" />
          <span>Form ID: {formId}</span>
        </div>
      )}
    </InlineFormCard>
  );
}

// Register as a full-card renderer so it replaces the collapsible ToolInvocationPart chrome
toolResultRegistry.registerFullCard('request_user_input', AskUserFormCard);

export { AskUserFormCard };
