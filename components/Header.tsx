'use client';

import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, Settings, Download, Upload, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onExport: () => void;
  onImport: (data: string) => void;
  onClearData: () => void;
}

export default function Header({ onExport, onImport, onClearData }: HeaderProps) {
  const { theme, toggleTheme, settings, updateSettings } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        onImport(data);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-lg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-7 h-7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="white"
                opacity="0.9"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
              DSA Practice Platform
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Master data structures and algorithms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={settings.preferredLanguage}
            onChange={(e) =>
              updateSettings({ preferredLanguage: e.target.value as 'javascript' | 'python' | 'java' })
            }
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <button
                  onClick={() => {
                    onExport();
                    setShowSettings(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750"
                >
                  <Download className="w-4 h-4" />
                  Export Progress
                </button>
                <label className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Progress
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
                      onClearData();
                      setShowSettings(false);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-750"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
