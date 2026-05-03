/**
 * Simplified DB utility that returns local/mock data.
 * Client-side Firestore is disabled to align with the removal of Firebase configuration.
 */

import { UserProgress } from '@/types';

const MOCK_PROGRESS: UserProgress = {
  userId: "guest",
  completedProcesses: ["voter-id-registration"],
  viewedProcesses: ["voter-id-registration"],
  quizScores: [],
  lastAccessed: new Date().toISOString(),
  completionPercentage: 25
};

export const initUserProgress = async (_userId: string) => {
  return MOCK_PROGRESS;
};

export const markProcessViewed = async (_userId: string, processId: string) => {
  console.log(`[Mock DB] Process viewed: ${processId}`);
};

export const markProcessCompleted = async (_userId: string, processId: string) => {
  console.log(`[Mock DB] Process completed: ${processId}`);
};

export const saveQuizResult = async (_userId: string, quizId: string, _score: number, _total: number) => {
  console.log(`[Mock DB] Quiz result saved: ${quizId}`);
};

export const getUserProgress = async (_userId: string) => {
  return MOCK_PROGRESS;
};
