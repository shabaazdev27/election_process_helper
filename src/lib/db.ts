import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  increment,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserProgress {
  userId: string;
  completedProcesses: string[];
  viewedProcesses: string[];
  quizScores: { quizId: string; score: number; total: number; timestamp: Timestamp }[];
  lastAccessed: Timestamp;
  completionPercentage: number;
}

export const initUserProgress = async (userId: string) => {
  const userDoc = doc(db, "users", userId);
  const docSnap = await getDoc(userDoc);

  if (!docSnap.exists()) {
    const initialProgress: UserProgress = {
      userId,
      completedProcesses: [],
      viewedProcesses: [],
      quizScores: [],
      lastAccessed: Timestamp.now(),
      completionPercentage: 0
    };
    await setDoc(userDoc, initialProgress);
    return initialProgress;
  }
  return docSnap.data() as UserProgress;
};

export const markProcessViewed = async (userId: string, processId: string) => {
  const userDoc = doc(db, "users", userId);
  await updateDoc(userDoc, {
    viewedProcesses: arrayUnion(processId),
    lastAccessed: Timestamp.now()
  });
};

export const markProcessCompleted = async (userId: string, processId: string) => {
  const userDoc = doc(db, "users", userId);
  await updateDoc(userDoc, {
    completedProcesses: arrayUnion(processId),
    lastAccessed: Timestamp.now()
  });
};

export const saveQuizResult = async (userId: string, quizId: string, score: number, total: number) => {
  const userDoc = doc(db, "users", userId);
  await updateDoc(userDoc, {
    quizScores: arrayUnion({
      quizId,
      score,
      total,
      timestamp: Timestamp.now()
    }),
    lastAccessed: Timestamp.now()
  });
};

export const getUserProgress = async (userId: string) => {
  const userDoc = doc(db, "users", userId);
  const docSnap = await getDoc(userDoc);
  return docSnap.exists() ? (docSnap.data() as UserProgress) : null;
};
