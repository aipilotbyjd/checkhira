import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { AppSettings } from '../services/settingsService';

interface SettingsContextType {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  loadSettings: (forceRefresh?: boolean) => Promise<AppSettings>;
  clearSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settingsHook = useSettings();

  useEffect(() => {
    settingsHook.loadSettings();
  }, []);

  return <SettingsContext.Provider value={settingsHook}>{children}</SettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within a SettingsProvider');
  }
  return context;
}
