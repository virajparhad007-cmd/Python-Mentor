import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteConversation, renameConversation } from '../../lib/api';
import { MessageSquare, Pencil, Trash2, Check, X } from 'lucide-react';
import type { ConversationSummary } from '../../types';

interface ConversationItemProps {
  conv: ConversationSummary;
  isActive: boolean;
  onClick: () => void;
  onDeleted: (id: string) => void;
  onRenamed: (id: string, title: string) => void;
}

export function ConversationItem({
  conv,
  isActive,
  onClick,
  onDeleted,
  onRenamed,
}: ConversationItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(conv.title);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(conv.id);
    onDeleted(conv.id);
  };

  const handleRename = async () => {
    if (editValue.trim() && editValue !== conv.title) {
      await renameConversation(conv.id, editValue.trim());
      onRenamed(conv.id, editValue.trim());
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRename();
    if (e.key === 'Escape') {
      setEditValue(conv.title);
      setEditing(false);
    }
  };

  return (
    <div
      className={`conv-item ${isActive ? 'conv-item--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <MessageSquare size={14} className="conv-item-icon" />
      {editing ? (
        <div className="conv-edit-row" onClick={e => e.stopPropagation()}>
          <input
            autoFocus
            className="conv-edit-input"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="icon-btn" onClick={handleRename} title="Save">
            <Check size={13} />
          </button>
          <button
            className="icon-btn"
            onClick={() => { setEditValue(conv.title); setEditing(false); }}
            title="Cancel"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <>
          <span className="conv-title">{conv.title}</span>
          <div className="conv-actions">
            <button
              className="icon-btn"
              onClick={e => { e.stopPropagation(); setEditing(true); }}
              title="Rename"
            >
              <Pencil size={13} />
            </button>
            <button className="icon-btn icon-btn--danger" onClick={handleDelete} title="Delete">
              <Trash2 size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
