export interface UserProgress {
  userId: string;
  viewedProcesses: string[];
  completedProcesses: string[];
  quizScores: QuizScore[];
  lastAccessed: Date | string | { seconds: number; nanoseconds: number };
  completionPercentage?: number;
  onboarded?: boolean;
  preferences?: Record<string, string | number | boolean | null>;
}

export interface QuizScore {
  quizId: string;
  score: number;
  total: number;
  timestamp: Date | string | { seconds: number; nanoseconds: number };
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
