'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, Copy, Check, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [collapsedCodeBlocks, setCollapsedCodeBlocks] = useState<Set<number>>(new Set());

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

  const toggleCodeBlock = (blockIndex: number) => {
    setCollapsedCodeBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockIndex)) {
        newSet.delete(blockIndex);
      } else {
        newSet.add(blockIndex);
      }
      return newSet;
    });
  };

  const renderBlock = (block: Block, blockIndex: number) => {
    switch (block.type) {
      case 'title':
        const TitleTag = `h${block.level || 2}` as any;
        return (
          <TitleTag
            key={blockIndex}
            className={`font-bold text-white dark:text-white mb-4 ${
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
            className="text-gray-300 dark:text-gray-300 mb-4 leading-relaxed"
          >
            {block.content}
          </p>
        );

      case 'code':
        const isCollapsed = collapsedCodeBlocks.has(blockIndex);
        return (
          <div
            key={blockIndex}
            className="mb-6 rounded-lg overflow-hidden border-2 border-gray-700 dark:border-gray-600 shadow-lg"
          >
            {block.title && (
              <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 border-b border-gray-700 dark:border-gray-600 flex items-center justify-between">
                <p className="text-sm font-medium text-blue-400 dark:text-blue-300">{block.title}</p>
                <button
                  onClick={() => toggleCodeBlock(blockIndex)}
                  className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  title={isCollapsed ? "Expand code" : "Collapse code"}
                >
                  {isCollapsed ? (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show Code
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Code
                    </>
                  )}
                </button>
              </div>
            )}
            {!isCollapsed && (
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
            )}
          </div>
        );

      case 'interview-tip':
        return (
          <div
            key={blockIndex}
            className="mb-6 bg-blue-900 dark:bg-blue-900 border-l-4 border-l-blue-500 border border-blue-700 dark:border-blue-700 rounded p-4 shadow-md"
          >
            <h4 className="font-bold text-blue-100 dark:text-blue-100 mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span>
              {block.tip}
            </h4>
            <p className="text-blue-50 dark:text-blue-50 text-sm">
              {block.explanation}
            </p>
          </div>
        );

      case 'diagram':
        return (
          <div key={blockIndex} className="mb-6 bg-gray-900 dark:bg-gray-800 rounded-lg p-4 border border-gray-700 dark:border-gray-700">
            {block.description && (
              <p className="text-gray-300 dark:text-gray-300 mb-3 font-medium">
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
    <div className="min-h-screen bg-[#111827]">
      {/* Compact Header */}
      <div className="sticky top-16 border-b z-40 bg-[#111827] border-gray-600">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex items-center gap-3">
                {data.difficulty && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                    {data.difficulty}
                  </span>
                )}
                {data.estimatedTime && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                    ⏱️ {data.estimatedTime}
                  </span>
                )}
              </div>
            </div>
            
            {/* Table of Contents Toggle */}
            <button
              onClick={() => setShowTableOfContents(!showTableOfContents)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-100'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Sections
              {showTableOfContents ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Table of Contents */}
        {showTableOfContents && (
          <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="max-w-4xl mx-auto px-6 py-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      const element = document.getElementById(`section-${section.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setShowTableOfContents(false);
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      theme === 'dark'
                        ? 'bg-gray-600 hover:bg-blue-600 text-gray-100 hover:text-white'
                        : 'bg-gray-700 hover:bg-blue-500 text-gray-200 hover:text-white'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hero Section - Only shows at the top */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-6">
        <h1 className="text-4xl font-bold text-white dark:text-white mb-3">
          {data.title}
        </h1>
        <p className="text-lg text-gray-300 dark:text-gray-400">{data.description}</p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {data.sections.map((section, sectionIndex) => (
          <section key={section.id} id={`section-${section.id}`} className="mb-12">
            <h2 className="text-3xl font-bold text-white dark:text-white mb-8 pb-4 border-b border-gray-700 dark:border-gray-700">
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
      <div className="border-t mt-12 bg-[#111827] border-gray-600">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className={theme === 'dark' ? 'text-gray-100' : 'text-gray-300'}>
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
