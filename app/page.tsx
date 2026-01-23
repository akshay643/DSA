'use client';

import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/context/ThemeContext';
import { Question, Category, QuestionProgress } from '@/types';
import questionsData from '@/data/questions.json';
import Header from '@/components/Header';
import QuestionCard from '@/components/QuestionCard';
import FilterBar from '@/components/FilterBar';
import { ArrowLeft, Check, Circle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

export default function Home() {
  const { settings } = useTheme();
  const [progress, setProgress] = useLocalStorage<Record<string, QuestionProgress>>('dsa-progress', {});
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(questionsData.questions as Question[]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'top'>('all');

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
    setProgress((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
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
        ...prev[questionId],
        ...updates,
      },
    }));
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {selectedQuestionData.title}
                  </h1>
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

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-6">
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
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  All Questions ({questions.length})
                </button>
                <button
                  onClick={() => setActiveTab('top')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'top'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
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
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-4 pt-2 space-y-2 border-t border-gray-200 dark:border-gray-700">
                        {categoryQuestions.map((question) => {
                          const isCompleted = completedQuestions.has(question.id);
                          return (
                            <div
                              key={question.id}
                              onClick={() => handleQuestionSelect(question.id)}
                              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 group"
                            >
                              {isCompleted ? (
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-gray-500" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
    </div>
  );
}
