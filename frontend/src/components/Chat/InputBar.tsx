import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import type { StreamStatus } from '../../types';

interface InputBarProps {
  onSend: (text: string) => void;
  onStop: () => void;
  status: StreamStatus;
}

export function InputBar({ onSend, onStop, status }: InputBarProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStreaming = status === 'streaming';

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Re-focus when streaming ends (after AI finishes responding)
  useEffect(() => {
    if (!isStreaming) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [isStreaming]);

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    // Defer focus so React finishes re-render first
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [value, isStreaming, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="input-bar-wrapper">
      <div className="input-bar">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          placeholder="Ask a Python question… (Shift+Enter for new line)"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isStreaming}
          rows={1}
          maxLength={32000}
          aria-label="Message input"
        />
        <button
          id="send-stop-btn"
          onClick={isStreaming ? onStop : handleSend}
          disabled={!isStreaming && !value.trim()}
          className={`send-btn ${isStreaming ? 'send-btn--stop' : ''}`}
          title={isStreaming ? 'Stop generation' : 'Send message'}
          aria-label={isStreaming ? 'Stop generation' : 'Send message'}
        >
          {isStreaming ? <Square size={18} fill="currentColor" /> : <Send size={18} />}
        </button>
      </div>
      <p className="input-hint">PyMentor AI only answers Python-related questions.</p>
    </div>
  );
}
