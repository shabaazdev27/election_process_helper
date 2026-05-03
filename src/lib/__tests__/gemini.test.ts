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

  describe('Google Services Requirements', () => {
    it('system prompt should enforce ECI citations', () => {
      expect(systemPrompt).toContain('Citations');
      expect(systemPrompt).toContain('official sources');
      expect(systemPrompt).toContain('ECI');
    });

    it('system prompt should enforce non-partisan tone', () => {
      expect(systemPrompt).toContain('Impartiality');
      expect(systemPrompt).toContain('Never support');
      expect(systemPrompt).toContain('political party');
    });

    it('system prompt should mention search grounding', () => {
      expect(systemPrompt).toContain('Search Grounding');
      expect(systemPrompt).toContain('web search');
    });

    it('createGroundedPrompt should include priority domains', () => {
      const prompt = createGroundedPrompt('test');
      expect(prompt).toContain('voters.eci.gov.in');
      expect(prompt).toContain('eci.gov.in');
      expect(prompt).toContain('nvsp.in');
    });

    it('createGroundedPrompt should instruct citation inclusion', () => {
      const prompt = createGroundedPrompt('test');
      expect(prompt).toContain('Include citations');
      expect(prompt).toContain('According to');
    });

    it('createGroundedPrompt should request next steps', () => {
      const prompt = createGroundedPrompt('test');
      expect(prompt).toContain('Next Steps');
    });

    it('model should be gemini-2.5-flash', () => {
      expect(MODEL_NAME).toBe('gemini-2.5-flash');
    });
  });
});
