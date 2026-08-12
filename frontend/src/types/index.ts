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
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash ⚡ (Fastest)' },
  { id: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B (Lightest)' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Most Capable)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash 🚀' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
];

export const FONT_SIZES = [
  { id: 'small', label: 'Small', class: 'text-sm' },
  { id: 'medium', label: 'Medium', class: 'text-base' },
  { id: 'large', label: 'Large', class: 'text-lg' },
];
