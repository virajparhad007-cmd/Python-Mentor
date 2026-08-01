import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteConversation } from '../lib/api';
import { Trash2, MessageSquare, Clock } from 'lucide-react';
import type { ConversationSummary } from '../types';

export function HistoryPage() {
  const [convs, setConvs] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getHistory()
      .then(setConvs)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(id);
    setConvs(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <Clock size={24} />
        <h2>Conversation History</h2>
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : convs.length === 0 ? (
        <div className="page-empty">
          <MessageSquare size={48} />
          <p>No conversations yet. Start chatting!</p>
        </div>
      ) : (
        <div className="history-list">
          {convs.map(conv => (
            <div
              key={conv.id}
              className="history-item"
              onClick={() => navigate('/', { state: { convId: conv.id } })}
              role="button"
              tabIndex={0}
            >
              <div className="history-item-body">
                <p className="history-item-title">{conv.title}</p>
                <p className="history-item-meta">
                  {conv.message_count} messages ·{' '}
                  {new Date(conv.updated_at).toLocaleDateString()}
                </p>
              </div>
              <button
                className="icon-btn icon-btn--danger"
                onClick={e => handleDelete(conv.id, e)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
