'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserSettings } from '@/types';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultSettings: UserSettings = {
  theme: 'dark',
  preferredLanguage: 'javascript',
  fontSize: 14,
  showHints: true,
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<UserSettings>('dsa-settings', defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(settings.theme);
    }
  }, [settings.theme, mounted]);

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme: settings.theme, toggleTheme, settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
