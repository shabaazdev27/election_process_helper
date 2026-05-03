import {
  client,
  systemPrompt,
  MODEL_NAME,
  createGroundedPrompt,
} from '../gemini';

describe('Gemini AI Integration (gemini.ts)', () => {
  describe('systemPrompt', () => {
    it('should contain core guidelines', () => {
      expect(systemPrompt).toContain('ElectionGuide India');
    });
  });

  describe('MODEL_NAME', () => {
    it('should be a gemini model', () => {
      expect(MODEL_NAME).toContain('gemini');
    });
  });

  describe('client', () => {
    it('should be defined', () => {
      expect(client).toBeDefined();
    });
  });

  describe('createGroundedPrompt', () => {
    it('should include user message', () => {
      const msg = 'test message';
      expect(createGroundedPrompt(msg)).toContain(msg);
    });
  });

  describe('Initialization Error', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('throws when no credentials', () => {
      delete process.env.VERTEX_PROJECT_ID;
      delete process.env.GEMINI_API_KEY;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../gemini');
      }).toThrow('Neither VERTEX_PROJECT_ID nor GEMINI_API_KEY is defined');
    });
  });
});
