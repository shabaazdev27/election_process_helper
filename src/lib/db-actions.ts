"use server";

import * as firestoreAdmin from "./firestore-admin";

/**
 * Server Action to initialize user progress.
 */
export async function initUserProgressAction(userId: string) {
  const progress = await firestoreAdmin.getServerUserProgress(userId);
  if (!progress) {
    return await firestoreAdmin.upsertUserProgress(userId, {
      userId,
      completedProcesses: [],
      viewedProcesses: [],
      quizScores: [],
      onboarded: false,
    });
  }
  return { success: true, data: progress };
}

/**
 * Server Action to save user preferences during onboarding.
 */
export async function saveUserPreferencesAction(userId: string, prefs: Record<string, unknown>) {
  return await firestoreAdmin.upsertUserProgress(userId, {
    preferences: prefs as Record<string, string | number | boolean | null>,
    onboarded: true,
  });
}

/**
 * Server Action to mark a process as viewed.
 */
export async function markProcessViewedAction(userId: string, processId: string) {
  return await firestoreAdmin.markProcessViewed(userId, processId);
}

/**
 * Server Action to mark a process as completed.
 */
export async function markProcessCompletedAction(userId: string, processId: string) {
  return await firestoreAdmin.markProcessCompleted(userId, processId);
}

/**
 * Server Action to save quiz result.
 */
export async function saveQuizResultAction(userId: string, quizId: string, score: number, total: number) {
  return await firestoreAdmin.saveQuizResult(userId, quizId, score, total);
}
