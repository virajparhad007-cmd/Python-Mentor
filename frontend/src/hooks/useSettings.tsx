import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getSettings, saveSettings } from '../lib/api';
import type { UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  max_tokens: 4096,
  theme: 'dark',
  font_size: 'medium',
};

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      await saveSettings(next);
    } catch {
      // silently fail — in-memory state is still updated
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
