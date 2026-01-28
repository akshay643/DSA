export interface Question {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topInterview?: boolean;
  companies: string[];
  introduction: string;
  problemStatement: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  hints: string[];
  timeComplexity: string;
  spaceComplexity: string;
  tags: string[];
  testCases?: {
    input: any;
    output: any;
  }[];
  links?: {
    leetcode?: string;
    gfg?: string;
  };
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  tricks?: {
    [key: string]: any;
  };
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  tricks?: {
    [key: string]: any;
  };
}

export interface QuestionProgress {
  questionId: string;
  completed: boolean;
  attempts: number;
  lastAttempted: string;
  notes: string;
  code: {
    javascript: string;
    python: string;
    java: string;
  };
  timeSpent: number; // in seconds
}

export interface UserSettings {
  theme: 'light' | 'dark';
  preferredLanguage: 'javascript' | 'python' | 'java';
  fontSize: number;
  showHints: boolean;
}
