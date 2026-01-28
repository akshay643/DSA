'use client';

import { Category, Question } from '@/types';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Info } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  categories: Category[];
  questions: Question[];
  completedQuestions: Set<string>;
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  onQuestionSelect: (questionId: string) => void;
  selectedQuestion: string | null;
}

export default function Sidebar({
  categories,
  questions,
  completedQuestions,
  selectedCategory,
  onCategorySelect,
  onQuestionSelect,
  selectedQuestion,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['two-pointers']));
  const [showInfoModal, setShowInfoModal] = useState<{ categoryId: string; name: string; description: string } | null>(null);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getQuestionsByCategory = (categoryId: string) => {
    return questions.filter((q) => q.category === categoryId);
  };

  const getCategoryProgress = (categoryId: string) => {
    const categoryQuestions = getQuestionsByCategory(categoryId);
    const completed = categoryQuestions.filter((q) => completedQuestions.has(q.id)).length;
    return { completed, total: categoryQuestions.length };
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">DSA Patterns</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {completedQuestions.size} / {questions.length} completed
        </p>
      </div>

      <div className="p-2">
        {categories.map((category) => {
          const progress = getCategoryProgress(category.id);
          const isExpanded = expandedCategories.has(category.id);
          const categoryQuestions = getQuestionsByCategory(category.id);

          return (
            <div key={category.id} className="mb-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors ${
                  selectedCategory === category.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-2 flex-1 text-left">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {progress.completed}/{progress.total} solved
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInfoModal({ categoryId: category.id, name: category.name, description: category.description });
                    }}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors flex-shrink-0"
                    title={`Learn more about ${category.name}`}
                  >
                    <Info className="w-4 h-4 text-blue-500 hover:text-blue-600" />
                  </button>
                </div>
              </button>

              {isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {categoryQuestions.map((question) => {
                    const isCompleted = completedQuestions.has(question.id);
                    const isSelected = selectedQuestion === question.id;

                    return (
                      <button
                        key={question.id}
                        onClick={() => onQuestionSelect(question.id)}
                        className={`w-full flex items-start gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-750 text-left transition-colors ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 dark:text-white truncate">
                            {question.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
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
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
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
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {showInfoModal.description}
            </p>
            <button
              onClick={() => setShowInfoModal(null)}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
