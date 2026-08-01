import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatPage } from './pages/ChatPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { getConversation } from './lib/api';
import { useSettings, SettingsProvider } from './hooks/useSettings';

function AppInner() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Apply font size
  useEffect(() => {
    document.documentElement.setAttribute('data-font', settings.font_size);
  }, [settings.font_size]);

  // Handle navigation from HistoryPage (state.convId)
  useEffect(() => {
    const state = location.state as { convId?: string } | null;
    if (state?.convId && location.pathname === '/') {
      setActiveConvId(state.convId);
      setChatKey(k => k + 1);
    }
  }, [location]);

  const handleNewChat = useCallback(() => {
    setActiveConvId(null);
    setChatKey(k => k + 1);
    navigate('/');
  }, [navigate]);

  const handleSelectConv = useCallback(
    (id: string) => {
      setActiveConvId(id);
      setChatKey(k => k + 1);
      navigate('/');
    },
    [navigate]
  );

  const handleConvCreated = useCallback((id: string) => {
    setActiveConvId(id);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        activeConvId={activeConvId}
        onNewChat={handleNewChat}
        onSelectConv={handleSelectConv}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ChatPage
                key={chatKey}
                activeConvId={activeConvId}
                onConvCreated={handleConvCreated}
              />
            }
          />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </SettingsProvider>
  );
}
