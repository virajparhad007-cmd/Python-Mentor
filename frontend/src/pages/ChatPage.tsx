import { useCallback, useEffect } from 'react';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { useChat } from '../hooks/useChat';
import { useSettings } from '../hooks/useSettings';
import { getConversation } from '../lib/api';

interface ChatPageProps {
  activeConvId: string | null;
  onConvCreated: (id: string) => void;
}

export function ChatPage({ activeConvId, onConvCreated }: ChatPageProps) {
  const { settings } = useSettings();
  const { messages, status, conversationId, sendMessage, stopStreaming, loadMessages } =
    useChat({
      conversationId: activeConvId ?? undefined,
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.max_tokens,
    });

  useEffect(() => {
    if (activeConvId) {
      getConversation(activeConvId)
        .then(conv => {
          if (conv) {
            loadMessages(conv.messages, conv.id);
          }
        })
        .catch(console.error);
    }
  }, [activeConvId, loadMessages]);

  // Notify parent when a new conversation is created
  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  // Track conversationId changes to bubble up to parent
  if (conversationId && conversationId !== activeConvId) {
    onConvCreated(conversationId);
  }

  return (
    <ChatWindow
      messages={messages}
      status={status}
      onSend={handleSend}
      onStop={stopStreaming}
    />
  );
}
