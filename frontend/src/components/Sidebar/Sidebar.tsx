import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getHistory } from '../../lib/api';
import { ConversationItem } from './ConversationItem';
import { Plus, History, Settings, Info, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ConversationSummary } from '../../types';

interface SidebarProps {
  activeConvId: string | null;
  onNewChat: () => void;
  onSelectConv: (id: string) => void;
}

export function Sidebar({ activeConvId, onNewChat, onSelectConv }: SidebarProps) {
  const [convs, setConvs] = useState<ConversationSummary[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setConvs(data);
    } catch {
      // backend may not be up yet
    }
  };

  useEffect(() => {
    loadHistory();
  }, [activeConvId]);

  const handleDeleted = (id: string) => {
    setConvs(prev => prev.filter(c => c.id !== id));
    if (id === activeConvId) onNewChat();
  };

  const handleRenamed = (id: string, title: string) => {
    setConvs(prev => prev.map(c => (c.id === id ? { ...c, title } : c)));
  };

  const navItems = [
    { icon: <History size={18} />, label: 'History', path: '/history' },
    { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
    { icon: <Info size={18} />, label: 'About', path: '/about' },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <Bot size={22} className="brand-icon" />
            <span className="brand-name">PyMentor</span>
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New chat */}
      <button
        id="new-chat-btn"
        className="new-chat-btn"
        onClick={onNewChat}
        title="New chat"
      >
        <Plus size={18} />
        {!collapsed && <span>New Chat</span>}
      </button>

      {/* Conversations */}
      {!collapsed && (
        <div className="sidebar-section">
          <p className="sidebar-section-label">Recent Chats</p>
          <div className="conv-list">
            {convs.length === 0 ? (
              <p className="conv-empty">No conversations yet</p>
            ) : (
              convs.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConvId}
                  onClick={() => onSelectConv(conv.id)}
                  onDeleted={handleDeleted}
                  onRenamed={handleRenamed}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'nav-item--active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
