import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { CodeBlock } from '../UI/CodeBlock';
import { CopyButton } from '../UI/CopyButton';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`message-row ${isUser ? 'message-row--user' : 'message-row--assistant'}`}
    >
      {/* Avatar */}
      <div className={`avatar ${isUser ? 'avatar--user' : 'avatar--bot'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Bubble */}
      <div className={`bubble ${isUser ? 'bubble--user' : 'bubble--assistant'}`}>
        {isUser ? (
          <p className="bubble-text">{message.content}</p>
        ) : (
          <div className="prose-wrapper">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const lang = match?.[1] || 'python';
                  const isBlock = className?.includes('language-');
                  const codeStr = String(children).replace(/\n$/, '');

                  if (isBlock) {
                    return <CodeBlock code={codeStr} language={lang} />;
                  }
                  return (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="md-p">{children}</p>,
                h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
                ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                li: ({ children }) => <li className="md-li">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="md-blockquote">{children}</blockquote>
                ),
                strong: ({ children }) => <strong className="md-strong">{children}</strong>,
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noreferrer" className="md-link">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="cursor-blink" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Copy full message */}
        {!isUser && !isStreaming && message.content && (
          <div className="bubble-actions">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
