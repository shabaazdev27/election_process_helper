import { Firestore, FieldValue, Timestamp, DocumentSnapshot } from '@google-cloud/firestore';
import { UserProgress, QuizScore } from '@/types';

/**
 * Response interface for Firestore operations
 */
export interface FirestoreOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: unknown;
}

/**
 * Firestore collection names (constants to prevent typos)
 */
export const COLLECTIONS = {
  USERS: 'users',
  QUIZ_SCORES: 'quiz_scores',
  PROCESS_ANALYTICS: 'process_analytics',
} as const;

/**
 * Lazy-initialized Firestore instance.
 * Uses singleton pattern to ensure only one connection.
 * During testing, returns null gracefully.
 */
let _firestore: Firestore | null = null;

/**
 * Get or initialize the Firestore instance.
 * Uses lazy initialization to prevent connection issues during startup.
 *
 * @returns Firestore instance or throws error if not configured
 * @throws Error if Google Cloud credentials are not available
 */
export function getFirestore(): Firestore {
  if (!_firestore) {
    const projectId = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId && process.env.NODE_ENV !== 'test') {
      throw new Error(
        'Firestore initialization failed: VERTEX_PROJECT_ID or GOOGLE_CLOUD_PROJECT not set'
      );
    }
    _firestore = new Firestore(projectId ? { projectId } : {});
  }
  return _firestore;
}

/**
 * Fetch user progress from Firestore.
 * Used server-side to enrich AI context with user's learning history.
 *
 * @param userId - The user's unique identifier
 * @returns User progress data or null if not found
 *
 * @example
 * ```typescript
 * const progress = await getServerUserProgress('user-123');
 * console.log(progress?.completionPercentage); // 45
 * ```
 */
export async function getServerUserProgress(
  userId: string
): Promise<UserProgress | null> {
  if (!userId) {
    console.warn('[firestore-admin] getServerUserProgress called with empty userId');
    return null;
  }

  try {
    const doc: DocumentSnapshot = await getFirestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return data as UserProgress;
  } catch (error) {
    console.error(
      `[firestore-admin] Error fetching user progress for userId ${userId}:`,
      error
    );
    return null;
  }
}

/**
 * Create or update a user's progress document.
 * Merges with existing data to preserve other fields.
 *
 * @param userId - The user's unique identifier
 * @param data - Partial user progress to merge
 * @returns Operation result with success status
 */
export async function upsertUserProgress(
  userId: string,
  data: Partial<UserProgress>
): Promise<FirestoreOperationResult<void>> {
  if (!userId) {
    return {
      success: false,
      error: 'userId is required',
    };
  }

  try {
    const userRef = getFirestore().collection(COLLECTIONS.USERS).doc(userId);
    await userRef.set(
      {
        ...data,
        lastAccessed: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error(
      `[firestore-admin] Error upserting user progress for userId ${userId}:`,
      error
    );
    return { success: false, error };
  }
}

/**
 * Mark a process as viewed by the user.
 * This triggers progress tracking for the dashboard.
 *
 * @param userId - The user's unique identifier
 * @param processId - The process guide ID (e.g., "voter-id-registration")
 * @returns Operation result with success status
 */
export async function markProcessViewed(
  userId: string,
  processId: string
): Promise<FirestoreOperationResult<void>> {
  if (!userId || !processId) {
    return {
      success: false,
      error: 'userId and processId are required',
    };
  }

  try {
    const userRef = getFirestore().collection(COLLECTIONS.USERS).doc(userId);
    await userRef.update({
      viewedProcesses: FieldValue.arrayUnion(processId),
      lastAccessed: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error(
      `[firestore-admin] Error marking process viewed for userId ${userId}:`,
      error
    );
    return { success: false, error };
  }
}

/**
 * Mark a process as completed by the user.
 * Updates completion percentage based on total processes.
 *
 * @param userId - The user's unique identifier
 * @param processId - The process guide ID to mark complete
 * @returns Operation result with success status
 */
export async function markProcessCompleted(
  userId: string,
  processId: string
): Promise<FirestoreOperationResult<void>> {
  if (!userId || !processId) {
    return {
      success: false,
      error: 'userId and processId are required',
    };
  }

  try {
    const userRef = getFirestore().collection(COLLECTIONS.USERS).doc(userId);
    await userRef.update({
      completedProcesses: FieldValue.arrayUnion(processId),
      lastAccessed: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error(
      `[firestore-admin] Error marking process completed for userId ${userId}:`,
      error
    );
    return { success: false, error };
  }
}

/**
 * Save quiz result to user's progress.
 * Stores score, total, and timestamp for learning analytics.
 *
 * @param userId - The user's unique identifier
 * @param quizId - The quiz identifier
 * @param score - Score achieved (e.g., 8 out of 10)
 * @param total - Total possible score (e.g., 10)
 * @returns Operation result with success status
 *
 * @example
 * ```typescript
 * await saveQuizResult('user-123', 'voter-id-quiz', 8, 10);
 * // Saves quiz score to quizScores array with timestamp
 * ```
 */
export async function saveQuizResult(
  userId: string,
  quizId: string,
  score: number,
  total: number
): Promise<FirestoreOperationResult<void>> {
  if (!userId || !quizId || score == null || total == null) {
    return {
      success: false,
      error: 'userId, quizId, score, and total are required',
    };
  }

  if (score < 0 || score > total || total <= 0) {
    return {
      success: false,
      error: `Invalid quiz scores: score=${score}, total=${total}`,
    };
  }

  try {
    const quizScore: QuizScore = {
      quizId,
      score,
      total,
      timestamp: new Date().toISOString(),
    };

    const userRef = getFirestore().collection(COLLECTIONS.USERS).doc(userId);
    await userRef.update({
      quizScores: FieldValue.arrayUnion(quizScore),
      lastAccessed: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error(
      `[firestore-admin] Error saving quiz result for userId ${userId}:`,
      error
    );
    return { success: false, error };
  }
}

/**
 * Calculate user's overall completion percentage.
 * Based on completed processes out of total available.
 *
 * @param userId - The user's unique identifier
 * @param totalProcesses - Total number of available processes
 * @returns Completion percentage (0-100) or null if user not found
 */
export async function getCompletionPercentage(
  userId: string,
  totalProcesses: number = 5
): Promise<number | null> {
  if (!userId || totalProcesses <= 0) {
    return null;
  }

  const progress = await getServerUserProgress(userId);
  if (!progress || !progress.completedProcesses) {
    return 0;
  }

  const completed = (progress.completedProcesses as string[]).length;
  return Math.round((completed / totalProcesses) * 100);
}

/**
 * Delete user's progress document (for testing or data cleanup).
 * Only call during development or explicit user request.
 *
 * @param userId - The user's unique identifier
 * @returns Operation result with success status
 */
export async function deleteUserProgress(
  userId: string
): Promise<FirestoreOperationResult<void>> {
  if (!userId) {
    return {
      success: false,
      error: 'userId is required',
    };
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'deleteUserProgress should not be called in production',
    };
  }

  try {
    await getFirestore().collection(COLLECTIONS.USERS).doc(userId).delete();
    return { success: true };
  } catch (error) {
    console.error(
      `[firestore-admin] Error deleting user progress for userId ${userId}:`,
      error
    );
    return { success: false, error };
  }
}

// Legacy exports for backward compatibility
export const adminDb = null;
export const adminAuth = null;