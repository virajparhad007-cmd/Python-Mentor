import { useState, useCallback, useRef } from 'react';
import { streamChat } from '../lib/api';
import type { ChatMessage, StreamStatus } from '../types';

interface UseChatOptions {
  conversationId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  status: StreamStatus;
  conversationId: string | null;
  sendMessage: (text: string) => void;
  stopStreaming: () => void;
  clearMessages: () => void;
  loadMessages: (msgs: ChatMessage[], convId: string) => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [conversationId, setConversationId] = useState<string | null>(
    options.conversationId ?? null
  );
  const stopRef = useRef<(() => void) | null>(null);

  const sendMessage = useCallback(
    (text: string) => {
      if (status === 'streaming') return;

      const userMsg: ChatMessage = { role: 'user', content: text, id: crypto.randomUUID() };
      const assistantMsg: ChatMessage = { role: 'assistant', content: '', id: crypto.randomUUID() };

      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setStatus('streaming');

      const stop = streamChat(
        {
          conversation_id: conversationId ?? undefined,
          message: text,
          model: options.model,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
        },
        {
          onToken: (token) => {
            setMessages(prev => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === 'assistant') {
                next[next.length - 1] = { ...last, content: last.content + token };
              }
              return next;
            });
          },
          onDone: (convId) => {
            setConversationId(convId);
            setStatus('idle');
            stopRef.current = null;
          },
          onError: (err) => {
            setMessages(prev => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === 'assistant') {
                next[next.length - 1] = {
                  ...last,
                  content: last.content || `⚠️ Error: ${err}`,
                };
              }
              return next;
            });
            setStatus('error');
            stopRef.current = null;
          },
        }
      );

      stopRef.current = stop;
    },
    [status, conversationId, options]
  );

  const stopStreaming = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setStatus('idle');
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setStatus('idle');
  }, []);

  const loadMessages = useCallback((msgs: ChatMessage[], convId: string) => {
    setMessages(msgs);
    setConversationId(convId);
    setStatus('idle');
  }, []);

  return { messages, status, conversationId, sendMessage, stopStreaming, clearMessages, loadMessages };
}
