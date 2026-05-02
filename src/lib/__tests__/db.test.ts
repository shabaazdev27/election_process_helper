/**
 * Unit tests for src/lib/db.ts (Mock Implementation)
 */
import {
  initUserProgress,
  markProcessViewed,
  markProcessCompleted,
  saveQuizResult,
  getUserProgress,
} from '@/lib/db'

describe('Database Operations (db.ts - Mock)', () => {
  const mockUserId = 'user-123'

  it('initUserProgress should return mock data', async () => {
    const result = await initUserProgress(mockUserId)
    expect(result.userId).toBe('guest')
    expect(result.completedProcesses).toContain('voter-id-registration')
  })

  it('markProcessViewed should log to console', async () => {
    const spy = jest.spyOn(console, 'log')
    await markProcessViewed(mockUserId, 'test-process')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Process viewed: test-process'))
    spy.mockRestore()
  })

  it('markProcessCompleted should log to console', async () => {
    const spy = jest.spyOn(console, 'log')
    await markProcessCompleted(mockUserId, 'test-process')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Process completed: test-process'))
    spy.mockRestore()
  })

  it('saveQuizResult should log to console', async () => {
    const spy = jest.spyOn(console, 'log')
    await saveQuizResult(mockUserId, 'test-quiz', 5, 10)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Quiz result saved: test-quiz'))
    spy.mockRestore()
  })

  it('getUserProgress should return mock data', async () => {
    const result = await getUserProgress(mockUserId)
    expect(result.userId).toBe('guest')
  })
})
