'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/context/ThemeContext';
import { Question, QuestionProgress } from '@/types';
import questionsData from '@/data/loadQuestions';
import Header from '@/components/Header';
import QuestionCard from '@/components/QuestionCard';
import { ArrowLeft, Clock, Code, CheckCircle2, Circle, Share2, ExternalLink, Lightbulb } from 'lucide-react';

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { settings } = useTheme();
  const [progress, setProgress] = useLocalStorage<Record<string, QuestionProgress>>('dsa-progress', {});
  const [copied, setCopied] = useState(false);
  
  const category = params.category as string;
  const questionId = params.questionId as string;
  
  // Find the question
  const question = questionsData.questions.find(
    (q: Question) => q.id === questionId && q.category === category
  ) as Question | undefined;

  const categoryData = questionsData.categories.find(c => c.id === category);

  const questionProgress = progress[questionId] || {
    completed: false,
    attempts: 0,
    lastAttempted: '',
    notes: '',
    code: {
      javascript: '',
      python: '',
      java: ''
    },
    timeSpent: 0
  };

  const updateProgress = (updates: Partial<QuestionProgress>) => {
    setProgress((prev) => ({
      ...prev,
      [questionId]: {
        ...questionProgress,
        ...updates,
        questionId
      }
    }));
  };

  const handleCodeChange = (code: string) => {
    const language = settings.preferredLanguage;
    updateProgress({
      code: {
        ...questionProgress.code,
        [language]: code,
      },
    });
  };

  const handleNotesChange = (notes: string) => {
    updateProgress({ notes });
  };

  const handleToggleComplete = () => {
    updateProgress({
      completed: !questionProgress.completed,
      attempts: (questionProgress.attempts || 0) + 1,
    });
  };

  const handleTimeUpdate = (seconds: number) => {
    updateProgress({ timeSpent: seconds });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onExport={() => {}} onImport={() => {}} onClearData={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Question Not Found
            </h1>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header onExport={() => {}} onImport={() => {}} onClearData={() => {}} />
      
      {/* Back Button and Share - Fixed Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Questions
          </button>
          
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share Link'}
          </button>
        </div>
      </div>

      {/* Split View: Problem Description + Code Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Problem Description */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-8 py-6">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {question.title}
                  </h1>
                  {question.links && (
                    <div className="flex items-center gap-3">
                      {question.links.leetcode && (
                        <a
                          href={question.links.leetcode}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 transition-colors text-sm font-medium"
                          title="View on LeetCode"
                        >
                          <ExternalLink className="w-4 h-4" />
                          LeetCode
                        </a>
                      )}
                      {question.links.gfg && (
                        <a
                          href={question.links.gfg}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 transition-colors text-sm font-medium"
                          title="View on GeeksforGeeks"
                        >
                          <ExternalLink className="w-4 h-4" />
                          GFG
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    question.difficulty === 'easy' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : question.difficulty === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {question.difficulty.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                    {categoryData?.name}
                  </span>
                  {questionProgress.completed && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.companies.map((company) => (
                    <span
                      key={company}
                      className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      {company}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Introduction */}
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Introduction</h2>
                <p className="text-gray-700 dark:text-gray-300">{question.introduction}</p>
              </div>

              {/* Problem Statement */}
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Problem Statement</h2>
                <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                  {question.problemStatement}
                </pre>
              </div>

              {/* Examples */}
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Examples</h2>
                {question.examples.map((example, idx) => (
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

              {/* Complexity */}
              <div className="flex gap-6">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Time: </span>
                  <code className="text-sm text-blue-600 dark:text-blue-400">{question.timeComplexity}</code>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Space: </span>
                  <code className="text-sm text-blue-600 dark:text-blue-400">{question.spaceComplexity}</code>
                </div>
              </div>

              {/* Hints */}
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
                    {question.hints.map((hint, idx) => (
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
            question={question}
            isCompleted={questionProgress.completed}
            savedCode={questionProgress.code?.[settings.preferredLanguage] || ''}
            savedNotes={questionProgress.notes || ''}
            onCodeChange={handleCodeChange}
            onNotesChange={handleNotesChange}
            onToggleComplete={handleToggleComplete}
            language={settings.preferredLanguage}
            timeSpent={questionProgress.timeSpent || 0}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      </div>
    </div>
  );
}
