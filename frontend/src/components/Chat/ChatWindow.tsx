import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage, StreamStatus } from '../../types';
import { Bot, Sparkles, Code2, Bug, Lightbulb } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  status: StreamStatus;
  onSend: (text: string) => void;
  onStop: () => void;
}

const SUGGESTIONS = [
  { icon: <Code2 size={18} />, text: 'Explain Python decorators with examples' },
  { icon: <Bug size={18} />, text: 'Debug: Why does my list comprehension fail?' },
  { icon: <Sparkles size={18} />, text: 'Build a FastAPI REST API from scratch' },
  { icon: <Lightbulb size={18} />, text: 'What are Python generators and when to use them?' },
];

export function ChatWindow({ messages, status, onSend, onStop }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === 'streaming';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastMsg = messages[messages.length - 1];
  const showTyping = isStreaming && lastMsg?.role === 'assistant' && !lastMsg.content;

  return (
    <div className="chat-window">
      {/* Message area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-logo">
              <Bot size={48} />
            </div>
            <h1 className="welcome-title">PyMentor AI</h1>
            <p className="welcome-subtitle">
              Your expert Python tutor — powered by Grok
            </p>
            <div className="suggestions-grid">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-chip"
                  onClick={() => onSend(s.text)}
                >
                  <span className="suggestion-icon">{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id ?? i}
                  message={msg}
                  isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}
            </AnimatePresence>
            {showTyping && (
              <div className="typing-row">
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <InputBar onSend={onSend} onStop={onStop} status={status} />
    </div>
  );
}
