'use client';

import { Question } from '@/types';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  questions: Question[];
  onFilterChange: (filtered: Question[]) => void;
  allQuestions: Question[];
}

export default function FilterBar({ questions, onFilterChange, allQuestions }: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique companies
  const allCompanies = Array.from(
    new Set(allQuestions.flatMap((q) => q.companies))
  ).sort();

  const applyFilters = (
    search: string,
    difficulties: string[],
    companies: string[]
  ) => {
    let filtered = [...allQuestions];

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(search.toLowerCase()) ||
          q.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Difficulty filter
    if (difficulties.length > 0) {
      filtered = filtered.filter((q) => difficulties.includes(q.difficulty));
    }

    // Company filter
    if (companies.length > 0) {
      filtered = filtered.filter((q) =>
        q.companies.some((c) => companies.includes(c))
      );
    }

    onFilterChange(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, selectedDifficulty, selectedCompanies);
  };

  const toggleDifficulty = (difficulty: string) => {
    const newDifficulties = selectedDifficulty.includes(difficulty)
      ? selectedDifficulty.filter((d) => d !== difficulty)
      : [...selectedDifficulty, difficulty];
    setSelectedDifficulty(newDifficulties);
    applyFilters(searchTerm, newDifficulties, selectedCompanies);
  };

  const toggleCompany = (company: string) => {
    const newCompanies = selectedCompanies.includes(company)
      ? selectedCompanies.filter((c) => c !== company)
      : [...selectedCompanies, company];
    setSelectedCompanies(newCompanies);
    applyFilters(searchTerm, selectedDifficulty, newCompanies);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty([]);
    setSelectedCompanies([]);
    onFilterChange(allQuestions);
  };

  const hasActiveFilters =
    searchTerm || selectedDifficulty.length > 0 || selectedCompanies.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions or tags..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedDifficulty.length + selectedCompanies.length}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            title="Clear all filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-4 space-y-4">
          {/* Difficulty */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Difficulty
            </h3>
            <div className="flex flex-wrap gap-2">
              {['easy', 'medium', 'hard'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => toggleDifficulty(difficulty)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedDifficulty.includes(difficulty)
                      ? difficulty === 'easy'
                        ? 'bg-green-500 text-white'
                        : difficulty === 'medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Companies */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Companies
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {allCompanies.map((company) => (
                <button
                  key={company}
                  onClick={() => toggleCompany(company)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedCompanies.includes(company)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
