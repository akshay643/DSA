'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/Header';
import InterviewViewer from '@/components/InterviewViewer';
import { ArrowLeft, Share2 } from 'lucide-react';
import reactInterview from '@/data/interviews/react.json';
import jsFullstackInterview from '@/data/interviews/javascript-fullstack.json';

// Map of available interviews
const INTERVIEWS: Record<string, any> = {
  'react': reactInterview,
  'javascript-fullstack': jsFullstackInterview,
  // Add more interviews here as you create them
};

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const interviewId = params.interviewId as string;
  const interviewData = INTERVIEWS[interviewId];

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

  if (!interviewData) {
    return (
      <div className="min-h-screen bg-[#111827]">
        <Header onExport={() => {}} onImport={() => {}} onClearData={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white dark:text-white mb-4">
              Interview Guide Not Found
            </h1>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827]">
      <Header onExport={() => {}} onImport={() => {}} onClearData={() => {}} />
      
      {/* Header with Back and Share */}
      <div className="bg-[#111827] border-b border-gray-600 px-6 py-3 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-300 dark:text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400 dark:text-gray-400">
              <span className="font-semibold text-white dark:text-white">{interviewData.title}</span>
              {interviewData.difficulty && (
                <span className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                  {interviewData.difficulty}
                </span>
              )}
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      {/* Interview Content */}
      <InterviewViewer 
        data={interviewData}
        onBack={() => router.push('/')}
      />
    </div>
  );
}
