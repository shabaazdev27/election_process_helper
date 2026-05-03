/**
 * Shared TypeScript types for ElectionGuide India
 *
 * These types are used across API routes, Firestore operations,
 * and client-side components to ensure consistent data structures.
 */

/**
 * Quiz score recorded after a user completes a quiz.
 */
export interface QuizScore {
  /** Unique identifier for the quiz */
  quizId: string;
  /** Score achieved by the user */
  score: number;
  /** Maximum possible score */
  total: number;
  /** ISO 8601 timestamp when the quiz was completed */
  timestamp: string;
}

/**
 * User preference settings stored alongside progress.
 */
export interface UserPreferences {
  /** Indian state or union territory selected by the user */
  state?: string;
  /** Preferred language code (e.g. "en", "hi") */
  language?: string;
}

/**
 * Tracks a user's learning progress through election process guides.
 * Persisted in Firestore under the `users` collection.
 */
export interface UserProgress {
  /** Firebase UID or anonymous guest ID */
  userId: string;
  /** List of process guide IDs the user has viewed */
  viewedProcesses: string[];
  /** List of process guide IDs the user has completed */
  completedProcesses: string[];
  /** Array of quiz results */
  quizScores: QuizScore[];
  /** ISO 8601 timestamp of last access */
  lastAccessed: string;
  /** Overall completion percentage (0–100) */
  completionPercentage?: number;
  /** Whether the user has completed the onboarding flow */
  onboarded?: boolean;
  /** User preferences (state, language, etc.) */
  preferences?: UserPreferences;
}

/**
 * A single chat message in the conversation history.
 */
export interface ChatMessage {
  /** Sender of the message */
  role: 'user' | 'assistant';
  /** Text content of the message */
  content: string;
  /** ISO 8601 timestamp when the message was created */
  timestamp: string;
}
