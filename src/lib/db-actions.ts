"use server";

import * as firestoreAdmin from "./firestore-admin";
import type { FirestoreOperationResult } from "./firestore-admin";
import type { UserProgress } from "@/types";

/**
 * Server Action to initialize user progress.
 * Creates a new user progress document if one doesn't exist.
 *
 * @param userId - The unique identifier for the user
 * @returns Operation result with user progress data or error
 *
 * @example
 * ```typescript
 * const result = await initUserProgressAction('user-123');
 * if (result.success) {
 *   console.log('User initialized:', result.data);
 * }
 * ```
 */
export async function initUserProgressAction(
  userId: string
): Promise<FirestoreOperationResult<UserProgress>> {
  if (!userId) {
    return {
      success: false,
      error: 'userId is required',
    };
  }

  const progress = await firestoreAdmin.getServerUserProgress(userId);
  if (!progress) {
    const result = await firestoreAdmin.upsertUserProgress(userId, {
      userId,
      completedProcesses: [],
      viewedProcesses: [],
      quizScores: [],
      onboarded: false,
    });
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    // Fetch the newly created progress
    const newProgress = await firestoreAdmin.getServerUserProgress(userId);
    if (!newProgress) {
      return { success: false, error: 'Failed to fetch newly created progress' };
    }
    return { success: true, data: newProgress };
  }
  
  return { success: true, data: progress };
}

/**
 * Server Action to save user preferences during onboarding.
 * Updates user preferences and marks onboarding as complete.
 *
 * @param userId - The unique identifier for the user
 * @param prefs - User preferences object (state, language, etc.)
 * @returns Operation result with success status
 *
 * @example
 * ```typescript
 * await saveUserPreferencesAction('user-123', {
 *   state: 'Karnataka',
 *   language: 'en'
 * });
 * ```
 */
export async function saveUserPreferencesAction(
  userId: string,
  prefs: Record<string, unknown>
): Promise<FirestoreOperationResult<void>> {
  if (!userId) {
    return {
      success: false,
      error: 'userId is required',
    };
  }

  if (!prefs || typeof prefs !== 'object') {
    return {
      success: false,
      error: 'preferences must be a valid object',
    };
  }

  return await firestoreAdmin.upsertUserProgress(userId, {
    preferences: prefs as Record<string, string | number | boolean | null>,
    onboarded: true,
  });
}

/**
 * Server Action to mark a process as viewed.
 * Adds the process ID to the user's viewed processes array.
 *
 * @param userId - The unique identifier for the user
 * @param processId - The process guide identifier
 * @returns Operation result with success status
 */
export async function markProcessViewedAction(
  userId: string,
  processId: string
): Promise<FirestoreOperationResult<void>> {
  if (!userId || !processId) {
    return {
      success: false,
      error: 'userId and processId are required',
    };
  }

  return await firestoreAdmin.markProcessViewed(userId, processId);
}

/**
 * Server Action to mark a process as completed.
 * Adds the process ID to the user's completed processes array.
 *
 * @param userId - The unique identifier for the user
 * @param processId - The process guide identifier
 * @returns Operation result with success status
 */
export async function markProcessCompletedAction(
  userId: string,
  processId: string
): Promise<FirestoreOperationResult<void>> {
  if (!userId || !processId) {
    return {
      success: false,
      error: 'userId and processId are required',
    };
  }

  return await firestoreAdmin.markProcessCompleted(userId, processId);
}

/**
 * Server Action to save quiz result.
 * Records the user's quiz score with timestamp for analytics.
 *
 * @param userId - The unique identifier for the user
 * @param quizId - The quiz identifier
 * @param score - Score achieved by the user
 * @param total - Total possible score
 * @returns Operation result with success status
 *
 * @example
 * ```typescript
 * await saveQuizResultAction('user-123', 'voter-id-quiz', 8, 10);
 * ```
 */
export async function saveQuizResultAction(
  userId: string,
  quizId: string,
  score: number,
  total: number
): Promise<FirestoreOperationResult<void>> {
  if (!userId || !quizId) {
    return {
      success: false,
      error: 'userId and quizId are required',
    };
  }

  if (typeof score !== 'number' || typeof total !== 'number') {
    return {
      success: false,
      error: 'score and total must be numbers',
    };
  }

  if (score < 0 || score > total || total <= 0) {
    return {
      success: false,
      error: `Invalid quiz scores: score=${score}, total=${total}`,
    };
  }

  return await firestoreAdmin.saveQuizResult(userId, quizId, score, total);
}
