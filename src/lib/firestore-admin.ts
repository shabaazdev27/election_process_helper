import { Firestore, FieldValue, Timestamp } from '@google-cloud/firestore';

/**
 * Initialize Firestore using Google Cloud Native SDK.
 */
let _firestore: Firestore | null = null;

function getFirestore(): Firestore {
  if (!_firestore) {
    _firestore = new Firestore({
      projectId: process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
    });
  }
  return _firestore;
}

const USERS_COLLECTION = 'users';

export async function getServerUserProgress(userId: string) {
  try {
    const doc = await getFirestore().collection(USERS_COLLECTION).doc(userId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('[firestore-admin] Error fetching user progress:', error);
    return null;
  }
}

export async function upsertUserProgress(userId: string, data: Record<string, unknown>) {
  try {
    const userRef = getFirestore().collection(USERS_COLLECTION).doc(userId);
    await userRef.set({
      ...data,
      lastAccessed: Timestamp.now(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('[firestore-admin] Error upserting user progress:', error);
    return { success: false, error };
  }
}

export async function markProcessViewed(userId: string, processId: string) {
  try {
    const userRef = getFirestore().collection(USERS_COLLECTION).doc(userId);
    await userRef.update({
      viewedProcesses: FieldValue.arrayUnion(processId),
      lastAccessed: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('[firestore-admin] Error marking process viewed:', error);
    return { success: false, error };
  }
}

export async function markProcessCompleted(userId: string, processId: string) {
  try {
    const userRef = getFirestore().collection(USERS_COLLECTION).doc(userId);
    await userRef.update({
      completedProcesses: FieldValue.arrayUnion(processId),
      lastAccessed: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('[firestore-admin] Error marking process completed:', error);
    return { success: false, error };
  }
}

export async function saveQuizResult(userId: string, quizId: string, score: number, total: number) {
  try {
    const userRef = getFirestore().collection(USERS_COLLECTION).doc(userId);
    await userRef.update({
      quizScores: FieldValue.arrayUnion({
        quizId,
        score,
        total,
        timestamp: Timestamp.now(),
      }),
      lastAccessed: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('[firestore-admin] Error saving quiz result:', error);
    return { success: false, error };
  }
}

export const adminDb = null;
export const adminAuth = null;

