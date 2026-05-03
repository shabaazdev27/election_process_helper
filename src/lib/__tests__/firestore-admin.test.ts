/**
 * Comprehensive tests for Firestore Admin Module
 * Coverage: All database operations, error handling, input validation
 */

// Mock at the very top
const mockDoc = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockCollection = {
  doc: jest.fn(() => mockDoc),
};

jest.mock('@google-cloud/firestore', () => {
  return {
    Firestore: jest.fn().mockImplementation(() => ({
      collection: jest.fn(() => mockCollection),
    })),
    FieldValue: {
      arrayUnion: jest.fn((val) => val),
    },
    Timestamp: {
      now: jest.fn(() => ({ seconds: 12345, nanoseconds: 0 })),
    },
  };
});

import * as firestoreAdmin from '../firestore-admin';
import { UserProgress } from '@/types';

describe('Firestore Admin Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VERTEX_PROJECT_ID = 'test-project';
  });

  describe('getServerUserProgress', () => {
    it('should return user progress when document exists', async () => {
      const mockData: UserProgress = {
        userId: 'test-user',
        viewedProcesses: ['voter-id'],
        completedProcesses: [],
        quizScores: [],
        lastAccessed: '2026-05-02T00:00:00Z',
        completionPercentage: 20,
      };

      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => mockData,
      });

      const result = await firestoreAdmin.getServerUserProgress('test-user');
      expect(result).toEqual(mockData);
    });

    it('should return null when document does not exist', async () => {
      mockDoc.get.mockResolvedValueOnce({
        exists: false,
      });

      const result = await firestoreAdmin.getServerUserProgress('test-user');
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      mockDoc.get.mockRejectedValueOnce(new Error('Firestore error'));

      const result = await firestoreAdmin.getServerUserProgress('test-user');
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('should return null for empty userId', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await firestoreAdmin.getServerUserProgress('');
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });

  describe('upsertUserProgress', () => {
    it('should successfully upsert user progress', async () => {
      mockDoc.set.mockResolvedValueOnce(undefined);

      const data: Partial<UserProgress> = {
        viewedProcesses: ['process-1'],
        onboarded: true,
      };

      const result = await firestoreAdmin.upsertUserProgress('test-user', data);
      expect(result.success).toBe(true);
      expect(mockDoc.set).toHaveBeenCalled();
    });

    it('should handle errors in upsertUserProgress', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      mockDoc.set.mockRejectedValueOnce(new Error('Set failed'));

      const result = await firestoreAdmin.upsertUserProgress('test-user', {});
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      spy.mockRestore();
    });

    it('should reject empty userId', async () => {
      const result = await firestoreAdmin.upsertUserProgress('', { onboarded: true });
      expect(result.success).toBe(false);
      expect(result.error).toContain('userId');
    });
  });

  describe('markProcessViewed', () => {
    it('should mark process as viewed', async () => {
      mockDoc.update.mockResolvedValueOnce(undefined);

      const result = await firestoreAdmin.markProcessViewed('user-1', 'process-1');
      expect(result.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalled();
    });

    it('should handle errors when marking process viewed', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      mockDoc.update.mockRejectedValueOnce(new Error('Update failed'));

      const result = await firestoreAdmin.markProcessViewed('user-1', 'process-1');
      expect(result.success).toBe(false);

      spy.mockRestore();
    });

    it('should reject missing parameters', async () => {
      const result = await firestoreAdmin.markProcessViewed('', 'process-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('markProcessCompleted', () => {
    it('should mark process as completed', async () => {
      mockDoc.update.mockResolvedValueOnce(undefined);

      const result = await firestoreAdmin.markProcessCompleted('user-1', 'process-1');
      expect(result.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalled();
    });

    it('should handle errors when marking process completed', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      mockDoc.update.mockRejectedValueOnce(new Error('Update failed'));

      const result = await firestoreAdmin.markProcessCompleted('user-1', 'process-1');
      expect(result.success).toBe(false);

      spy.mockRestore();
    });

    it('should reject missing processId', async () => {
      const result = await firestoreAdmin.markProcessCompleted('user-1', '');
      expect(result.success).toBe(false);
    });
  });

  describe('saveQuizResult', () => {
    it('should save quiz result with valid scores', async () => {
      mockDoc.update.mockResolvedValueOnce(undefined);

      const result = await firestoreAdmin.saveQuizResult('user-1', 'quiz-1', 8, 10);
      expect(result.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalled();

      const callArgs = mockDoc.update.mock.calls[0][0];
      expect(callArgs.quizScores).toEqual({
        quizId: 'quiz-1',
        score: 8,
        total: 10,
        timestamp: expect.any(String),
      });
    });

    it('should handle errors when saving quiz result', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      mockDoc.update.mockRejectedValueOnce(new Error('Update failed'));

      const result = await firestoreAdmin.saveQuizResult('user-1', 'quiz-1', 8, 10);
      expect(result.success).toBe(false);

      spy.mockRestore();
    });

    it('should reject invalid score ranges', async () => {
      const result = await firestoreAdmin.saveQuizResult('user-1', 'quiz-1', 15, 10);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should reject negative scores', async () => {
      const result = await firestoreAdmin.saveQuizResult('user-1', 'quiz-1', -1, 10);
      expect(result.success).toBe(false);
    });

    it('should reject zero total score', async () => {
      const result = await firestoreAdmin.saveQuizResult('user-1', 'quiz-1', 0, 0);
      expect(result.success).toBe(false);
    });

    it('should reject missing parameters', async () => {
      const result = await firestoreAdmin.saveQuizResult('', 'quiz-1', 8, 10);
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('getCompletionPercentage', () => {
    it('should calculate completion percentage', async () => {
      const mockData: UserProgress = {
        userId: 'test-user',
        completedProcesses: ['p1', 'p2'],
        viewedProcesses: [],
        quizScores: [],
        lastAccessed: '2026-05-02T00:00:00Z',
      };

      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => mockData,
      });

      const result = await firestoreAdmin.getCompletionPercentage('test-user', 5);
      expect(result).toBe(40); // 2 out of 5
    });

    it('should return 0 for no completed processes', async () => {
      mockDoc.get.mockResolvedValueOnce({
        exists: false,
      });

      const result = await firestoreAdmin.getCompletionPercentage('test-user', 5);
      expect(result).toBe(0);
    });

    it('should return null for invalid parameters', async () => {
      const result = await firestoreAdmin.getCompletionPercentage('', 5);
      expect(result).toBeNull();
    });
  });

  describe('deleteUserProgress', () => {
    it('should delete user progress in test environment', async () => {
      mockDoc.delete.mockResolvedValueOnce(undefined);

      const result = await firestoreAdmin.deleteUserProgress('test-user');
      expect(result.success).toBe(true);
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    it('should reject deletion in production', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      const result = await firestoreAdmin.deleteUserProgress('test-user');
      expect(result.success).toBe(false);
      expect(result.error).toContain('production');

      // Restore to test environment
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'test',
        writable: true,
        configurable: true,
      });
    });

    it('should handle deletion errors', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();
      mockDoc.delete.mockRejectedValueOnce(new Error('Delete failed'));

      const result = await firestoreAdmin.deleteUserProgress('test-user');
      expect(result.success).toBe(false);

      spy.mockRestore();
    });

    it('should reject empty userId', async () => {

      const result = await firestoreAdmin.deleteUserProgress('');
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('COLLECTIONS constant', () => {
    it('should define collection names', () => {
      expect(firestoreAdmin.COLLECTIONS).toHaveProperty('USERS');
      expect(firestoreAdmin.COLLECTIONS).toHaveProperty('QUIZ_SCORES');
      expect(firestoreAdmin.COLLECTIONS).toHaveProperty('PROCESS_ANALYTICS');
    });
  });
});
