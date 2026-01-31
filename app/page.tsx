'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/context/ThemeContext';
import { Question, Category, QuestionProgress } from '@/types';
import questionsData from '@/data/loadQuestions';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import TricksViewer from '@/components/TricksViewer';
import NotesViewer from '@/components/NotesViewer';
import { Check, Circle, ChevronDown, ChevronUp, Info, BookOpen, FileText, ExternalLink } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { settings } = useTheme();
  const [progress, setProgress] = useLocalStorage<Record<string, QuestionProgress>>('dsa-progress', {});
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(questionsData.questions as Question[]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'top'>('all');
  const [showInfoModal, setShowInfoModal] = useState<{ categoryId: string; name: string; description: string; tricks?: any } | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  const categories = questionsData.categories as Category[];
  const questions = questionsData.questions as Question[];
  
  // Filter questions based on active tab
  const displayQuestions = activeTab === 'top' 
    ? filteredQuestions.filter((q: any) => q.topInterview === true)
    : filteredQuestions;

  const completedQuestions = new Set(
    Object.entries(progress)
      .filter(([_, p]) => p.completed)
      .map(([id]) => id)
  );

  const handleQuestionSelect = (questionId: string, category: string) => {
    router.push(`/questions/${category}/${questionId}`);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(progress, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dsa-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (data: string) => {
    try {
      const imported = JSON.parse(data);
      setProgress(imported);
      alert('Progress imported successfully!');
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    }
  };

  const handleClearData = () => {
    setProgress({});
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryStats = (categoryQuestions: Question[]) => {
    const easy = categoryQuestions.filter(q => q.difficulty === 'easy');
    const medium = categoryQuestions.filter(q => q.difficulty === 'medium');
    const hard = categoryQuestions.filter(q => q.difficulty === 'hard');
    
    const easySolved = easy.filter(q => completedQuestions.has(q.id)).length;
    const mediumSolved = medium.filter(q => completedQuestions.has(q.id)).length;
    const hardSolved = hard.filter(q => completedQuestions.has(q.id)).length;

    return {
      easy: { solved: easySolved, total: easy.length },
      medium: { solved: mediumSolved, total: medium.length },
      hard: { solved: hardSolved, total: hard.length },
      total: { solved: easySolved + mediumSolved + hardSolved, total: categoryQuestions.length }
    };
  };

  return (
    <div className="h-screen flex flex-col bg-gray-800 dark:bg-gray-900">
      <Header onExport={handleExport} onImport={handleImport} onClearData={handleClearData} />
      
      {showNotes ? (
        <NotesViewer 
          onBack={() => setShowNotes(false)} 
          completedQuestions={questions
            .filter(q => completedQuestions.has(q.id))
            .map(q => ({ question: q, progress: progress[q.id] }))}
        />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <FilterBar
            questions={filteredQuestions}
            onFilterChange={setFilteredQuestions}
            allQuestions={questions}
          />

          <div className="flex-1 overflow-y-auto p-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-6 pb-8">
              {/* Notes Section */}
              <button
                onClick={() => setShowNotes(true)}
                className="group w-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-500 dark:hover:border-amber-500 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-8 h-8 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        My Notes
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Create and manage your personal notes separate from question notes
                    </p>
                  </div>
                  <span className="text-4xl group-hover:scale-110 transition-transform">📝</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 group-hover:gap-3 transition-all">
                  <span>Open Notes</span>
                  <span>→</span>
                </div>
              </button>

              {/* Interview Prep Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Interview Preparation
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Master key concepts through comprehensive guides with code examples and interview tips
                    </p>
                  </div>
                </div>

                {/* Interview Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* React Interview */}
                  <button
                    onClick={() => router.push('/interviews/react')}
                    className="group bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-xl transition-all duration-300 border border-indigo-200 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          React Interview
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Master React fundamentals and advanced patterns
                        </p>
                      </div>
                      <span className="text-3xl">⚛️</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 group-hover:gap-3 transition-all">
                      <span>Start Learning</span>
                      <span>→</span>
                    </div>
                  </button>

                  {/* JavaScript Full Stack Interview */}
                  <button
                    onClick={() => router.push('/interviews/javascript-fullstack')}
                    className="group bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-xl transition-all duration-300 border border-yellow-200 dark:border-yellow-700 hover:border-yellow-500 dark:hover:border-yellow-500 text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                          JavaScript Full Stack
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Complete technical Q&A covering JS, TypeScript, Angular, Node.js & more
                        </p>
                      </div>
                      <span className="text-3xl">💻</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 group-hover:gap-3 transition-all">
                      <span>Start Learning</span>
                      <span>→</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Hero Stats Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border border-blue-200 dark:border-gray-700 shadow-lg">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    DSA Practice Dashboard
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track your progress across {questions.length} carefully curated problems
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {/* Easy */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-green-200 dark:border-green-800 shadow-sm">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">
                        Easy
                      </div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {questions.filter(q => completedQuestions.has(q.id) && q.difficulty === 'easy').length}
                        <span className="text-2xl text-gray-400 dark:text-gray-500">
                          /{questions.filter(q => q.difficulty === 'easy').length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">solved</div>
                    </div>
                  </div>

                  {/* Medium */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-yellow-200 dark:border-yellow-800 shadow-sm">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-2">
                        Medium
                      </div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {questions.filter(q => completedQuestions.has(q.id) && q.difficulty === 'medium').length}
                        <span className="text-2xl text-gray-400 dark:text-gray-500">
                          /{questions.filter(q => q.difficulty === 'medium').length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">solved</div>
                    </div>
                  </div>

                  {/* Hard */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-red-200 dark:border-red-800 shadow-sm">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">
                        Hard
                      </div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {questions.filter(q => completedQuestions.has(q.id) && q.difficulty === 'hard').length}
                        <span className="text-2xl text-gray-400 dark:text-gray-500">
                          /{questions.filter(q => q.difficulty === 'hard').length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">solved</div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                        Total
                      </div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {completedQuestions.size}
                        <span className="text-2xl text-gray-400 dark:text-gray-500">
                          /{questions.length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">solved</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Overall Progress
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round((completedQuestions.size / questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(completedQuestions.size / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 p-1 rounded-xl w-fit shadow-xl border border-gray-700">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  All Questions ({questions.length})
                </button>
                <button
                  onClick={() => setActiveTab('top')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === 'top'
                      ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white shadow-lg shadow-orange-500/50 scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  🔥 Top Interview ({questions.filter((q: any) => q.topInterview === true).length})
                </button>
              </div>

              {/* Accordion Categories */}
              {categories.map((category) => {
                const categoryQuestions = displayQuestions.filter(q => q.category === category.id);
                if (categoryQuestions.length === 0) return null;

                const isExpanded = expandedCategories.has(category.id);
                const stats = getCategoryStats(categoryQuestions);

                return (
                  <div
                    key={category.id}
                    className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-500 ${
                      isExpanded
                        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800 shadow-2xl shadow-blue-500/20 border-2 border-blue-500/30'
                        : 'bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black hover:shadow-xl border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {/* Bookmark Indicator */}
                    {isExpanded && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
                    )}
                    
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-300 ${
                        isExpanded ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20' : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-blue-400 animate-bounce" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-1 transition-colors ${
                            isExpanded ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-white'
                          }`}>
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {category.description}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowInfoModal({ categoryId: category.id, name: category.name, description: category.description, tricks: category.tricks });
                          }}
                          className="ml-2 p-1.5 hover:bg-blue-500/20 rounded transition-colors flex-shrink-0"
                          title={`Learn more about ${category.name}`}
                        >
                          <Info className="w-5 h-5 text-blue-400 hover:text-blue-300" />
                        </button>
                      </div>
                      
                      {/* Stats Badge */}
                      <div className="flex items-center gap-3 ml-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-medium">
                            {stats.easy.solved}/{stats.easy.total}
                          </span>
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded font-medium">
                            {stats.medium.solved}/{stats.medium.total}
                          </span>
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded font-medium">
                            {stats.hard.solved}/{stats.hard.total}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {stats.total.solved}/{stats.total.total}
                        </div>
                      </div>
                    </button>

                    {/* Accordion Content */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-6 pt-2 space-y-2 border-t border-gray-700 bg-gradient-to-b from-gray-900/80 to-black/90">
                        {categoryQuestions.map((question) => {
                          const isCompleted = completedQuestions.has(question.id);
                          return (
                            <div
                              key={question.id}
                              className="flex items-center gap-3 p-3 rounded-lg transition-all border border-transparent group hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]"
                            >
                              {isCompleted ? (
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                              )}
                              <div 
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => handleQuestionSelect(question.id, question.category)}
                              >
                                <h4 className="font-medium text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400">
                                  {question.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {question.companies.slice(0, 3).map((company) => (
                                    <span
                                      key={company}
                                      className="text-xs text-gray-600 dark:text-gray-400"
                                    >
                                      {company}
                                    </span>
                                  ))}
                                  {question.companies.length > 3 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                      +{question.companies.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded text-xs font-medium flex-shrink-0 ${
                                  question.difficulty === 'easy'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : question.difficulty === 'medium'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                }`}
                              >
                                {question.difficulty}
                              </span>
                              <a
                                href={`/questions/${question.category}/${question.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{showInfoModal.name}</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6">
                {showInfoModal.description}
              </p>

              {/* Render tricks if available */}
              {showInfoModal.tricks && (
                <div>
                  <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4">Advanced Concepts & Tips</h4>
                  <TricksViewer data={showInfoModal.tricks} />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowInfoModal(null)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
