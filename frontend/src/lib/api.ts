import axios from 'axios';
import type { ConversationSummary, ConversationDetail, UserSettings, ChatRequest } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL: BASE_URL });

// ── History ───────────────────────────────────

export const getHistory = (): Promise<ConversationSummary[]> =>
  api.get('/api/history').then(r => r.data);

export const getConversation = (id: string): Promise<ConversationDetail> =>
  api.get(`/api/history/${id}`).then(r => r.data);

export const deleteConversation = (id: string): Promise<void> =>
  api.delete(`/api/history/${id}`).then(() => undefined);

export const renameConversation = (id: string, title: string): Promise<void> =>
  api.patch(`/api/history/${id}`, { title }).then(() => undefined);

// ── Settings ──────────────────────────────────

export const getSettings = (): Promise<UserSettings> =>
  api.get('/api/settings').then(r => r.data);

export const saveSettings = (settings: UserSettings): Promise<UserSettings> =>
  api.post('/api/settings', settings).then(r => r.data);

// ── Streaming Chat ────────────────────────────

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (conversationId: string) => void;
  onError: (error: string) => void;
}

export function streamChat(request: ChatRequest, callbacks: StreamCallbacks): () => void {
  const controller = new AbortController();

  const run = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        callbacks.onError(`HTTP ${response.status}: ${response.statusText}`);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.token !== undefined) {
                callbacks.onToken(json.token);
              } else if (json.done) {
                callbacks.onDone(json.conversation_id);
              } else if (json.error) {
                callbacks.onError(json.error);
              }
            } catch {
              // ignore malformed lines
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        callbacks.onError(err.message);
      }
    }
  };

  run();
  return () => controller.abort();
}
