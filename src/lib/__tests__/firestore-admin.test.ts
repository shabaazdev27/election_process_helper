
// Mock at the very top
const mockDoc = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
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

// Re-map for easier use in tests if needed, or just use firestoreAdmin.X
const { 
  getServerUserProgress, 
  upsertUserProgress, 
  markProcessViewed, 
  markProcessCompleted, 
  saveQuizResult 
} = firestoreAdmin;



describe('firestore-admin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getServerUserProgress returns data if document exists', async () => {
    const mockData = { userId: '123', viewedProcesses: [] };
    mockDoc.get.mockResolvedValueOnce({
      exists: true,
      data: () => mockData,
    });

    const result = await getServerUserProgress('123');
    expect(result).toEqual(mockData);
  });

  it('getServerUserProgress returns null if document does not exist', async () => {
    mockDoc.get.mockResolvedValueOnce({
      exists: false,
    });

    const result = await getServerUserProgress('123');
    expect(result).toBeNull();
  });

  it('upsertUserProgress sets data', async () => {
    mockDoc.set.mockResolvedValueOnce({});
    const result = await upsertUserProgress('123', { onboarded: true });
    expect(result.success).toBe(true);
  });

  it('markProcessViewed updates viewedProcesses', async () => {
    mockDoc.update.mockResolvedValueOnce({});
    const result = await markProcessViewed('123', 'p1');
    expect(result.success).toBe(true);
  });

  it('markProcessCompleted updates completedProcesses', async () => {
    mockDoc.update.mockResolvedValueOnce({});
    const result = await markProcessCompleted('123', 'p1');
    expect(result.success).toBe(true);
  });

  it('saveQuizResult updates quizScores', async () => {
    mockDoc.update.mockResolvedValueOnce({});
    const result = await saveQuizResult('123', 'q1', 8, 10);
    expect(result.success).toBe(true);
  });

  it('handles errors in getServerUserProgress', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    mockDoc.get.mockRejectedValueOnce(new Error('fail'));
    const result = await getServerUserProgress('123');
    expect(result).toBeNull();
    spy.mockRestore();
  });

  it('handles errors in upsertUserProgress', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    mockDoc.set.mockRejectedValueOnce(new Error('fail'));
    const result = await upsertUserProgress('123', {});
    expect(result.success).toBe(false);
    spy.mockRestore();
  });

  it('handles errors in markProcessViewed', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    mockDoc.update.mockRejectedValueOnce(new Error('fail'));
    const result = await markProcessViewed('123', 'p1');
    expect(result.success).toBe(false);
    spy.mockRestore();
  });

  it('handles errors in markProcessCompleted', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    mockDoc.update.mockRejectedValueOnce(new Error('fail'));
    const result = await markProcessCompleted('123', 'p1');
    expect(result.success).toBe(false);
    spy.mockRestore();
  });

  it('handles errors in saveQuizResult', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    mockDoc.update.mockRejectedValueOnce(new Error('fail'));
    const result = await saveQuizResult('123', 'q1', 8, 10);
    expect(result.success).toBe(false);
    spy.mockRestore();
  });
});
