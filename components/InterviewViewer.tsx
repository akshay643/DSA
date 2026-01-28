'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, Copy, Check, ArrowUp } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface Block {
  type: 'title' | 'description' | 'code' | 'interview-tip' | 'diagram';
  level?: number;
  content?: string;
  code?: string;
  language?: string;
  title?: string;
  tip?: string;
  explanation?: string;
  description?: string;
  url?: string;
  ascii?: string;
}

interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

interface InterviewTopic {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
  estimatedTime?: string;
  sections: Section[];
}

interface InterviewViewerProps {
  data: InterviewTopic;
  onBack: () => void;
}

export default function InterviewViewer({ data, onBack }: InterviewViewerProps) {
  const { theme } = useTheme();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderBlock = (block: Block, blockIndex: number) => {
    switch (block.type) {
      case 'title':
        const TitleTag = `h${block.level || 2}` as any;
        return (
          <TitleTag
            key={blockIndex}
            className={`font-bold text-gray-900 dark:text-white mb-4 ${
              block.level === 2 ? 'text-2xl' : 'text-xl'
            }`}
          >
            {block.content}
          </TitleTag>
        );

      case 'description':
        return (
          <p
            key={blockIndex}
            className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
          >
            {block.content}
          </p>
        );

      case 'code':
        return (
          <div
            key={blockIndex}
            className="mb-6 rounded-lg overflow-hidden border-2 border-gray-700 dark:border-gray-600 shadow-lg"
          >
            {block.title && (
              <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 border-b border-gray-700 dark:border-gray-600">
                <p className="text-sm font-medium text-blue-400 dark:text-blue-300">{block.title}</p>
              </div>
            )}
            <div className="relative group">
              <button
                onClick={() => copyToClipboard(block.code || '')}
                className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors z-10 opacity-0 group-hover:opacity-100"
                title="Copy code"
              >
                {copiedCode === block.code ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-300 hover:text-white" />
                )}
              </button>
              <SyntaxHighlighter
                language={block.language || 'javascript'}
                style={theme === 'dark' ? atomOneDark : atomOneLight}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  backgroundColor: 'transparent',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
                showLineNumbers={true}
                wrapLines={true}
              >
                {block.code || ''}
              </SyntaxHighlighter>
            </div>
          </div>
        );

      case 'interview-tip':
        return (
          <div
            key={blockIndex}
            className="mb-6 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 border border-blue-300 dark:border-blue-700 rounded p-4 shadow-md"
          >
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span>
              {block.tip}
            </h4>
            <p className="text-blue-800 dark:text-blue-50 text-sm">
              {block.explanation}
            </p>
          </div>
        );

      case 'diagram':
        return (
          <div key={blockIndex} className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            {block.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
                {block.description}
              </p>
            )}
            {block.ascii && (
              <pre className="bg-gray-900 dark:bg-black p-4 rounded overflow-x-auto text-gray-300 font-mono text-xs">
                {block.ascii}
              </pre>
            )}
            {block.url && (
              <img src={block.url} alt={block.description} className="w-full rounded" />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-gray-700' : 'min-h-screen bg-white'}>
      {/* Header */}
      <div className={`sticky top-16 border-b z-40 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {data.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-3">{data.description}</p>
            <div className="flex flex-wrap gap-3">
              {data.difficulty && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {data.difficulty}
                </span>
              )}
              {data.estimatedTime && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  ⏱️ {data.estimatedTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Index/Table of Contents */}
        <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="max-w-4xl mx-auto px-6 py-4">
            <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Sections:
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    const element = document.getElementById(`section-${section.id}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-blue-600 text-gray-100 hover:text-white'
                      : 'bg-gray-200 hover:bg-blue-500 text-gray-800 hover:text-white'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {data.sections.map((section, sectionIndex) => (
          <section key={section.id} id={`section-${section.id}`} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
              {section.title}
            </h2>
            <div className="space-y-6">
              {section.blocks.map((block, blockIndex) =>
                renderBlock(block, `${sectionIndex}-${blockIndex}` as any)
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className={`border-t mt-12 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className={theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}>
            Keep practicing and revisit these concepts regularly for interview success! 🚀
          </p>
        </div>
      </div>

      {/* Go to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          title="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
