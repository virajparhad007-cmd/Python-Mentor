export function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-dot" style={{ animationDelay: '0ms' }} />
      <div className="typing-dot" style={{ animationDelay: '160ms' }} />
      <div className="typing-dot" style={{ animationDelay: '320ms' }} />
    </div>
  );
}
