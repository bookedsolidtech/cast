/**
 * usePmChatSession — Project-scoped chat session for PM agents.
 *
 * Reuses the shared useChatStore for persistence (sessions + messages stored in
 * localStorage) but manages its own active session pointer to avoid conflicting
 * with Ask Ava's `currentSessionId`.
 *
 * Sessions are scoped by `pm:<projectSlug>` so each project has independent
 * chat history that persists through the project's lifespan.
 *
 * Points to `/api/project-pm/chat` endpoint with projectPath + projectSlug
 * injected into the transport body.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useChatStore, autoTitle, type ChatSession } from '@/store/chat-store';

interface UsePmChatSessionOptions {
  projectPath: string;
  projectSlug: string;
  defaultModel?: string;
}

export function usePmChatSession({
  projectPath,
  projectSlug,
  defaultModel = 'sonnet',
}: UsePmChatSessionOptions) {
  const {
    sessions: allSessions,
    createSession,
    deleteSession,
    saveMessages,
    updateModel,
  } = useChatStore();

  // PM sessions are scoped by a synthetic projectId: "pm:<slug>"
  const pmProjectId = `pm:${projectSlug}`;

  const pmSessions = useMemo(
    () => allSessions.filter((s) => s.projectId === pmProjectId),
    [allSessions, pmProjectId]
  );

  // Own active session pointer — independent from Ask Ava's currentSessionId
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return pmSessions[0]?.id ?? null;
  });

  const activeSession = useMemo(
    () => pmSessions.find((s) => s.id === activeSessionId) ?? null,
    [pmSessions, activeSessionId]
  );

  const modelAlias = activeSession?.modelAlias ?? defaultModel;
  const activeSessionRef = useRef(activeSessionId);

  // Transport for the PM chat endpoint
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/project-pm/chat',
        headers: { 'x-model-alias': modelAlias },
        body: { projectPath, projectSlug },
        credentials: 'include',
      }),
    [modelAlias, projectPath, projectSlug]
  );

  const { messages, sendMessage, stop, status, setMessages, error } = useChat({
    id: activeSessionId ?? undefined,
    transport,
    messages: activeSession?.messages,
    onError: (err) => {
      console.error('PM Chat error:', err);
    },
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Persist messages on change
  useEffect(() => {
    if (activeSessionId && activeSessionRef.current === activeSessionId && messages.length > 0) {
      saveMessages(activeSessionId, messages);
    }
  }, [messages, activeSessionId, saveMessages]);

  // Load messages when switching sessions
  useEffect(() => {
    if (activeSessionId !== activeSessionRef.current) {
      activeSessionRef.current = activeSessionId;
      const session = pmSessions.find((s) => s.id === activeSessionId);
      setMessages(session?.messages ?? []);
    }
  }, [activeSessionId, pmSessions, setMessages]);

  // Ensure there's always a session for this project
  useEffect(() => {
    if (pmSessions.length === 0) {
      const session = createSession(defaultModel, pmProjectId);
      setActiveSessionId(session.id);
      activeSessionRef.current = session.id;
    } else if (!activeSessionId || !pmSessions.find((s) => s.id === activeSessionId)) {
      setActiveSessionId(pmSessions[0].id);
      activeSessionRef.current = pmSessions[0].id;
    }
  }, [pmSessions, activeSessionId, createSession, defaultModel, pmProjectId]);

  const handleNewChat = useCallback(() => {
    const session = createSession(modelAlias, pmProjectId);
    setMessages([]);
    setActiveSessionId(session.id);
    activeSessionRef.current = session.id;
  }, [createSession, modelAlias, pmProjectId, setMessages]);

  const handleSwitchSession = useCallback(
    (id: string) => {
      if (activeSessionId && messages.length > 0) {
        saveMessages(activeSessionId, messages);
      }
      setActiveSessionId(id);
    },
    [activeSessionId, messages, saveMessages]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id);
      if (activeSessionId === id) {
        const remaining = pmSessions.filter((s) => s.id !== id);
        setActiveSessionId(remaining[0]?.id ?? null);
      }
    },
    [deleteSession, activeSessionId, pmSessions]
  );

  const handleModelChange = useCallback(
    (model: string) => {
      if (activeSessionId) {
        updateModel(activeSessionId, model);
      }
    },
    [activeSessionId, updateModel]
  );

  return {
    messages,
    sendMessage,
    stop,
    isStreaming,
    error,

    sessions: pmSessions,
    activeSessionId,
    activeSession,
    modelAlias,
    handleNewChat,
    handleSwitchSession,
    handleDeleteSession,
    handleModelChange,
  };
}
