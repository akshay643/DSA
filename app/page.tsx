'use client';

import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/context/ThemeContext';
import { Question, Category, QuestionProgress } from '@/types';
import questionsData from '@/data/loadQuestions';
import Header from '@/components/Header';
import QuestionCard from '@/components/QuestionCard';
import FilterBar from '@/components/FilterBar';
import TricksViewer from '@/components/TricksViewer';
import { ArrowLeft, Check, Circle, ChevronDown, ChevronUp, Lightbulb, Info } from 'lucide-react';

export default function Home() {
  const { settings } = useTheme();
  const [progress, setProgress] = useLocalStorage<Record<string, QuestionProgress>>('dsa-progress', {});
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(questionsData.questions as Question[]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'top'>('all');
  const [showInfoModal, setShowInfoModal] = useState<{ categoryId: string; name: string; description: string; tricks?: any } | null>(null);

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

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestion(questionId);
  };

  const updateProgress = (questionId: string, updates: Partial<QuestionProgress>) => {
    setProgress((prev) => {
      const existingProgress = prev[questionId] || {
        completed: false,
        attempts: 0,
        lastAttempted: new Date().toISOString(),
        notes: '',
        code: {
          javascript: '',
          python: '',
          java: '',
        },
        timeSpent: 0,
      };
      
      return {
        ...prev,
        [questionId]: {
          ...existingProgress,
          ...updates,
        },
      };
    });
  };

  const handleCodeChange = (questionId: string, code: string) => {
    const language = settings.preferredLanguage;
    updateProgress(questionId, {
      code: {
        ...progress[questionId]?.code,
        [language]: code,
      },
    });
  };

  const handleNotesChange = (questionId: string, notes: string) => {
    updateProgress(questionId, { notes });
  };

  const handleToggleComplete = (questionId: string) => {
    updateProgress(questionId, {
      completed: !progress[questionId]?.completed,
      attempts: (progress[questionId]?.attempts || 0) + 1,
    });
  };

  const handleTimeUpdate = (questionId: string, seconds: number) => {
    updateProgress(questionId, { timeSpent: seconds });
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

  const selectedQuestionData = selectedQuestion
    ? questions.find((q) => q.id === selectedQuestion)
    : null;

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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header onExport={handleExport} onImport={handleImport} onClearData={handleClearData} />
      
      {selectedQuestionData ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Problem Description */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800">
            <div className="max-w-3xl mx-auto px-8 py-6">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Questions
              </button>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedQuestionData.title}
                    </h1>
                    {selectedQuestionData.links && (
                      <div className="flex items-center gap-3">
                        {selectedQuestionData.links.leetcode && (
                          <a
                            href={selectedQuestionData.links.leetcode}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 transition-colors text-sm font-medium"
                            title="View on LeetCode"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
                            </svg>
                            LeetCode
                          </a>
                        )}
                        {selectedQuestionData.links.gfg && (
                          <a
                            href={selectedQuestionData.links.gfg}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 transition-colors text-sm font-medium"
                            title="View on GeeksforGeeks"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21.45 17.99c-1.2-1.2-2.7-1.8-4.5-1.8-1.8 0-3.3.6-4.5 1.8-1.2 1.2-1.8 2.7-1.8 4.5s.6 3.3 1.8 4.5c1.2 1.2 2.7 1.8 4.5 1.8 1.8 0 3.3-.6 4.5-1.8 1.2-1.2 1.8-2.7 1.8-4.5s-.6-3.3-1.8-4.5zm-4.5 7.8c-1.8 0-3.3-1.5-3.3-3.3s1.5-3.3 3.3-3.3 3.3 1.5 3.3 3.3-1.5 3.3-3.3 3.3zM11.55 3.6c-1.2-1.2-2.7-1.8-4.5-1.8C5.25 1.8 3.75 2.4 2.55 3.6 1.35 4.8.75 6.3.75 8.1s.6 3.3 1.8 4.5c1.2 1.2 2.7 1.8 4.5 1.8 1.8 0 3.3-.6 4.5-1.8 1.2-1.2 1.8-2.7 1.8-4.5s-.6-3.3-1.8-4.5zm-4.5 7.8c-1.8 0-3.3-1.5-3.3-3.3s1.5-3.3 3.3-3.3 3.3 1.5 3.3 3.3-1.5 3.3-3.3 3.3z"/>
                            </svg>
                            GFG
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedQuestionData.difficulty === 'easy' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : selectedQuestionData.difficulty === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {selectedQuestionData.difficulty.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                      {getCategoryName(selectedQuestionData.category)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedQuestionData.companies.map((company) => (
                      <span
                        key={company}
                        className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedQuestionData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Introduction</h2>
                  <p className="text-gray-700 dark:text-gray-300">{selectedQuestionData.introduction}</p>
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Problem Statement</h2>
                  <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                    {selectedQuestionData.problemStatement}
                  </pre>
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Examples</h2>
                  {selectedQuestionData.examples.map((example, idx) => (
                    <div key={idx} className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">Input: </span>
                        <code className="text-sm text-gray-700 dark:text-gray-300">{example.input}</code>
                      </div>
                      <div className="mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">Output: </span>
                        <code className="text-sm text-gray-700 dark:text-gray-300">{example.output}</code>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Explanation: </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{example.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-6">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Time: </span>
                    <code className="text-sm text-blue-600 dark:text-blue-400">{selectedQuestionData.timeComplexity}</code>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Space: </span>
                    <code className="text-sm text-blue-600 dark:text-blue-400">{selectedQuestionData.spaceComplexity}</code>
                  </div>
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Hints
                  </h2>
                  <details className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3">
                    <summary className="cursor-pointer text-gray-700 dark:text-gray-300 font-medium">
                      Click to reveal hints
                    </summary>
                    <div className="mt-2 space-y-2">
                      {selectedQuestionData.hints.map((hint, idx) => (
                        <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                          💡 {hint}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Code Editor */}
          <div className="w-1/2 flex flex-col bg-gray-900">
            <QuestionCard
              question={selectedQuestionData}
              isCompleted={completedQuestions.has(selectedQuestionData.id)}
              savedCode={progress[selectedQuestionData.id]?.code?.[settings.preferredLanguage] || ''}
              savedNotes={progress[selectedQuestionData.id]?.notes || ''}
              onCodeChange={(code) => handleCodeChange(selectedQuestionData.id, code)}
              onNotesChange={(notes) => handleNotesChange(selectedQuestionData.id, notes)}
              onToggleComplete={() => handleToggleComplete(selectedQuestionData.id)}
              language={settings.preferredLanguage}
              timeSpent={progress[selectedQuestionData.id]?.timeSpent || 0}
              onTimeUpdate={(seconds) => handleTimeUpdate(selectedQuestionData.id, seconds)}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <FilterBar
            questions={filteredQuestions}
            onFilterChange={setFilteredQuestions}
            allQuestions={questions}
          />

          <div className="flex-1 overflow-y-auto p-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-6 pb-8">
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
                              onClick={() => handleQuestionSelect(question.id)}
                              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border border-transparent group hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]"
                            >
                              {isCompleted ? (
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                              )}
                              <div className="flex-1 min-w-0">
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
