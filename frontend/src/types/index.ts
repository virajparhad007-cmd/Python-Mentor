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
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash ⚡ (Recommended)' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Fastest)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro 🌟 (Best Quality)' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash 🚀' },
];

export const FONT_SIZES = [
  { id: 'small', label: 'Small', class: 'text-sm' },
  { id: 'medium', label: 'Medium', class: 'text-base' },
  { id: 'large', label: 'Large', class: 'text-lg' },
];
