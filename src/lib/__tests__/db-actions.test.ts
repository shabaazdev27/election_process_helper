import {
  initUserProgressAction,
  saveQuizResultAction,
  saveUserPreferencesAction,
  markProcessViewedAction,
  markProcessCompletedAction,
} from '../db-actions';
import * as firestoreAdmin from '../firestore-admin';

// Mock the firestore-admin functions
jest.mock('../firestore-admin', () => ({
  getServerUserProgress: jest.fn(),
  upsertUserProgress: jest.fn(),
  markProcessViewed: jest.fn(),
  markProcessCompleted: jest.fn(),
  saveQuizResult: jest.fn(),
}));

describe('Server Actions Security & Quality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initUserProgressAction', () => {
    it('should return error when userId is empty', async () => {
      const result = await initUserProgressAction('');
      expect(result).toEqual({
        success: false,
        error: 'userId is required',
      });
    });

    it('should create new progress when user does not exist', async () => {
      const mockProgress = {
        userId: 'user-1',
        completedProcesses: [],
        viewedProcesses: [],
        quizScores: [],
        onboarded: false,
      };

      (firestoreAdmin.getServerUserProgress as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProgress);
      (firestoreAdmin.upsertUserProgress as jest.Mock).mockResolvedValue({ success: true });

      const result = await initUserProgressAction('user-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProgress);
    });

    it('should return existing progress when user exists', async () => {
      const mockProgress = {
        userId: 'user-1',
        completedProcesses: ['process-1'],
        viewedProcesses: ['process-1', 'process-2'],
        quizScores: [],
        onboarded: true,
      };

      (firestoreAdmin.getServerUserProgress as jest.Mock).mockResolvedValue(mockProgress);

      const result = await initUserProgressAction('user-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProgress);
    });
  });

  describe('saveQuizResultAction', () => {
    it('should validate inputs before calling Firestore', async () => {
      (firestoreAdmin.saveQuizResult as jest.Mock).mockResolvedValue({ success: true });

      const result = await saveQuizResultAction('user-1', 'quiz-1', 5, 10);
      expect(result).toEqual({ success: true });
      expect(firestoreAdmin.saveQuizResult).toHaveBeenCalledWith('user-1', 'quiz-1', 5, 10);
    });

    it('should return error for empty userId', async () => {
      const result = await saveQuizResultAction('', 'quiz-1', 5, 10);
      expect(result).toEqual({
        success: false,
        error: 'userId and quizId are required',
      });
    });

    it('should return error for invalid score', async () => {
      const result = await saveQuizResultAction('user-1', 'quiz-1', 11, 10);
      expect(result).toEqual({
        success: false,
        error: 'Invalid quiz scores: score=11, total=10',
      });
    });

    it('should return error for non-number score', async () => {
      const result = await saveQuizResultAction('user-1', 'quiz-1', 'invalid' as unknown as number, 10);
      expect(result).toEqual({
        success: false,
        error: 'score and total must be numbers',
      });
    });
  });

  describe('saveUserPreferencesAction', () => {
    it('should save valid user preferences', async () => {
      (firestoreAdmin.upsertUserProgress as jest.Mock).mockResolvedValue({ success: true });

      const result = await saveUserPreferencesAction('user-1', { state: 'Delhi' });
      expect(result).toEqual({ success: true });
    });

    it('should return error for empty userId', async () => {
      const result = await saveUserPreferencesAction('', { state: 'Delhi' });
      expect(result).toEqual({
        success: false,
        error: 'userId is required',
      });
    });

    it('should return error for invalid preferences', async () => {
      const result = await saveUserPreferencesAction('user-1', null as unknown as Record<string, unknown>);
      expect(result).toEqual({
        success: false,
        error: 'preferences must be a valid object',
      });
    });
  });

  describe('markProcessViewedAction', () => {
    it('should mark process as viewed', async () => {
      (firestoreAdmin.markProcessViewed as jest.Mock).mockResolvedValue({ success: true });

      const result = await markProcessViewedAction('user-1', 'process-1');
      expect(result).toEqual({ success: true });
    });

    it('should return error for empty parameters', async () => {
      const result = await markProcessViewedAction('', 'process-1');
      expect(result).toEqual({
        success: false,
        error: 'userId and processId are required',
      });
    });
  });

  describe('markProcessCompletedAction', () => {
    it('should mark process as completed', async () => {
      (firestoreAdmin.markProcessCompleted as jest.Mock).mockResolvedValue({ success: true });

      const result = await markProcessCompletedAction('user-1', 'process-1');
      expect(result).toEqual({ success: true });
    });

    it('should return error for empty parameters', async () => {
      const result = await markProcessCompletedAction('user-1', '');
      expect(result).toEqual({
        success: false,
        error: 'userId and processId are required',
      });
    });
  });
});
