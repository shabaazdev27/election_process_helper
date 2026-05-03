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
 * Supported language codes for ElectionGuide
 */
export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'kn';

/**
 * User preference settings stored alongside progress.
 */
export interface UserPreferences {
  /** Indian state or union territory selected by the user */
  state?: string;
  /** Preferred language code (e.g. "en", "hi") */
  language?: LanguageCode;
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

/**
 * Translation request/response for chat messages
 */
export interface TranslationRequest {
  /** Text to translate */
  content: string;
  /** Target language code */
  targetLanguage: LanguageCode;
  /** Source language code (default: 'en') */
  sourceLanguage?: LanguageCode;
}

export interface TranslationResponse {
  /** Original text */
  original: string;
  /** Translated text */
  translated: string;
  /** Target language */
  targetLanguage: LanguageCode;
  /** Whether result was from cache */
  cached: boolean;
}

/**
 * Real-time ECI update notification
 */
export interface Notification {
  /** Unique notification ID */
  id: string;
  /** Notification type: 'election_date', 'new_form', 'booth_change', etc. */
  type: 'election_date' | 'new_form' | 'booth_change' | 'general_update';
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Source URL (ECI website) */
  sourceUrl?: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Whether user has dismissed this notification */
  dismissed?: boolean;
}

export interface EciUpdate {
  /** What changed (e.g., 'election_schedule', 'new_form_released') */
  updateType: string;
  /** Previous value (if applicable) */
  previousValue?: string;
  /** New value */
  newValue: string;
  /** ECI source URL */
  sourceUrl: string;
  /** Timestamp of detection */
  detectedAt: string;
}

/**
 * Polling booth information
 */
/**
 * Polling booth information
 */
export interface PollingBooth {
  /** Unique booth ID (e.g., 'TN-CHENN-001') */
  id: string;
  /** Booth number */
  boothNumber: string;
  /** Booth name/location */
  name: string;
  /** Booth address */
  address: string;
  /** District */
  district: string;
  /** Assembly/Constituency */
  constituency: string;
  /** State code (e.g., 'TN', 'MH') */
  state?: string;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Voting time window */
  votingTiming: string;
  /** Amenities: accessibility, parking, refreshments, etc. */
  amenities: {
    pwdAccess: boolean;
    parkingAvailable: boolean;
    refreshments: boolean;
    wheelchairRamp: boolean;
  };
}

/**
 * Geolocation data with privacy anonymization
 */
export interface GeolocationData {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Accuracy in meters */
  accuracy: number;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Hash of (userId + lat + lon) for privacy audit trail */
  anonymousHash?: string;
}
