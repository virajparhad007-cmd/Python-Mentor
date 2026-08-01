// Shared TypeScript types for PyMentor AI

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationDetail {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface UserSettings {
  model: string;
  temperature: number;
  max_tokens: number;
  theme: string;
  font_size: string;
}

export interface ChatRequest {
  conversation_id?: string;
  message: string;
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

export type StreamStatus = 'idle' | 'streaming' | 'error';

export const AVAILABLE_MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
];

export const FONT_SIZES = [
  { id: 'small', label: 'Small', class: 'text-sm' },
  { id: 'medium', label: 'Medium', class: 'text-base' },
  { id: 'large', label: 'Large', class: 'text-lg' },
];
