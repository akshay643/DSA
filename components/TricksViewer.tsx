'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TricksViewerProps {
  data: any;
  title?: string;
}

export default function TricksViewer({ data, title }: TricksViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderValue = (value: any, keyPath: string): JSX.Element => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof value === 'string') {
      return (
        <p className="text-gray-700 dark:text-gray-300 text-sm break-words">
          {value}
        </p>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`text-sm font-medium ${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {String(value)}
        </span>
      );
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">{value}</span>;
    }

    if (Array.isArray(value)) {
      const isSimpleArray = value.every((item) => typeof item !== 'object' || item === null);

      if (isSimpleArray && value.length <= 3) {
        return (
          <div className="space-y-2">
            {value.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded px-3 py-2 border-l-2 border-blue-400 dark:border-blue-600 text-sm text-gray-700 dark:text-gray-300 font-mono">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="mt-2 space-y-1">
          <button
            onClick={() => toggleExpand(keyPath)}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {expanded[keyPath] ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span>{value.length} items</span>
          </button>

          {expanded[keyPath] && (
            <div className="ml-4 mt-2 space-y-2 border-l-2 border-blue-300 dark:border-blue-700 pl-3">
              {value.map((item, idx) => (
                <div key={idx}>
                  {typeof item === 'object' && item !== null ? (
                    <div className="bg-gray-50 dark:bg-gray-900/30 rounded p-2">
                      {renderValue(item, `${keyPath}-${idx}`)}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900/30 rounded px-3 py-2 border-l-2 border-blue-400 dark:border-blue-600 text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {typeof item === 'string' ? item : String(item)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);

      return (
        <div className="mt-2 space-y-2">
          <button
            onClick={() => toggleExpand(keyPath)}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {expanded[keyPath] ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="text-gray-600 dark:text-gray-400">{keys.length} properties</span>
          </button>

          {expanded[keyPath] && (
            <div className="ml-4 mt-2 space-y-3 bg-gray-50 dark:bg-gray-900/30 rounded p-3 border-l-2 border-blue-300 dark:border-blue-700">
              {keys.map((key) => (
                <div key={key}>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {key}
                  </div>
                  <div className="ml-2">
                    {renderValue(value[key], `${keyPath}-${key}`)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span className="text-gray-600 dark:text-gray-400 text-sm">{String(value)}</span>;
  };

  return (
    <div className="w-full max-h-[600px] overflow-y-auto">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}

      <div className="space-y-4">
        {typeof data === 'object' && data !== null
          ? Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <h4 className="font-bold text-gray-900 dark:text-white text-base mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <div className="text-sm">
                  {renderValue(value, key)}
                </div>
              </div>
            ))
          : renderValue(data, 'root')}
      </div>
    </div>
  );
}
