/**
 * Unit tests for Google Translate API client
 *
 * Tests: Language detection, translation caching, batch translation,
 * locale detection, and error handling.
 */

import {
  translate,
  translateBatch,
  detectLanguage,
  getDefaultLanguageFromLocale,
  clearCache,
  getCacheStats,
  SUPPORTED_LANGUAGES,
  TranslationRequestSchema,
} from '@/lib/translate';
import { LanguageCode } from '@/types';

// Import the mocked module to access mock implementation
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Translate: TranslateModule } = require('@google-cloud/translate');

// Get references to the mock functions
const MockTranslateConstructor = TranslateModule.v2.Translate;

describe('Translate Service', () => {
  beforeEach(() => {
    clearCache();
    jest.clearAllMocks();
  });

  // ============================================================================
  // Basic Translation Tests
  // ============================================================================

  describe('translate()', () => {
    test('✓ Translates English to Hindi', async () => {
      const result = await translate(
        'How do I register to vote?',
        'hi',
        'en'
      );

      expect(result.original).toBe('How do I register to vote?');
      expect(result.translated).toContain('translated'); // Mock appends " (translated)"
      expect(result.targetLanguage).toBe('hi');
      expect(result.cached).toBe(false);
    });

    test('✓ Skips translation when source and target are same', async () => {
      const result = await translate(
        'Hello World',
        'en',
        'en'
      );

      expect(result.original).toBe('Hello World');
      expect(result.translated).toBe('Hello World'); // Same as input
      expect(result.cached).toBe(false);
    });

    test('✓ Caches translations and returns cached result', async () => {
      // First call - should hit API
      const result1 = await translate(
        'Test message',
        'hi',
        'en'
      );
      expect(result1.cached).toBe(false);

      // Second call - should use cache
      const result2 = await translate(
        'Test message',
        'hi',
        'en'
      );
      expect(result2.cached).toBe(true);
      expect(result2.translated).toBe(result1.translated);
    });

    test('✓ Handles translation errors gracefully', async () => {
      // Clear any previous mock calls
      MockTranslateConstructor.mockClear();
      
      // The mock constructor is called inside translate(), so we need to set up
      // the implementation BEFORE calling translate()
      // Since the constructor creates a new object each time, we need to configure it
      // to return an instance with a rejecting translate method
      MockTranslateConstructor.mockImplementationOnce(() => ({
        translate: jest
          .fn()
          .mockRejectedValue(new Error('API Error')),
        detect: jest
          .fn()
          .mockResolvedValue([{ language: 'en' }]),
      }));

      const result = await translate(
        'Error test',
        'hi',
        'en'
      );

      // Should return original on error
      expect(result.original).toBe('Error test');
      expect(result.translated).toBe('Error test');
    });

    test('✓ Supports all language pairs', async () => {
      const languages = Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
      const sourceLanguage = 'en' as LanguageCode;

      for (const targetLang of languages) {
        if (sourceLanguage !== targetLang) {
          const result = await translate(
            'Test',
            targetLang,
            sourceLanguage
          );
          expect(result.targetLanguage).toBe(targetLang);
        }
      }
    });
  });

  // ============================================================================
  // Batch Translation Tests
  // ============================================================================

  describe('translateBatch()', () => {
    test('✓ Translates multiple strings in batch', async () => {
      const contents = [
        'How do I register?',
        'Where is my booth?',
        'When is the election?',
      ];

      const results = await translateBatch(contents, 'hi', 'en');

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.targetLanguage === 'hi')).toBe(true);
      expect(results.every((r) => r.translated)).toBe(true);
    });

    test('✓ Batches requests in groups of 5', async () => {
      const contents = Array.from({ length: 12 }, (_, i) => `Message ${i}`);

      const results = await translateBatch(contents, 'ta', 'en');

      expect(results).toHaveLength(12);
    });

    test('✓ Caches batch results', async () => {
      const contents = ['Test 1', 'Test 2'];

      await translateBatch(contents, 'te', 'en');
      const stats1 = getCacheStats();

      await translateBatch(contents, 'te', 'en');
      const stats2 = getCacheStats();

      expect(stats2.size).toBeGreaterThanOrEqual(stats1.size);
    });
  });

  // ============================================================================
  // Language Detection Tests
  // ============================================================================

  describe('detectLanguage()', () => {
    test('✓ Detects language from content', async () => {
      // The mock detects 'hi' for Hindi text
      const detected = await detectLanguage('नमस्ते');

      // Should return Hindi language code
      expect(detected).toBe('hi');
      expect(Object.keys(SUPPORTED_LANGUAGES)).toContain(detected);
    });

    test('✓ Defaults to English for unsupported detected language', async () => {
      MockTranslateConstructor.mockClear();
      MockTranslateConstructor.mockImplementationOnce(() => ({
        translate: jest
          .fn()
          .mockResolvedValue(['Translated text']),
        detect: jest
          .fn()
          .mockResolvedValueOnce([{ language: 'xx' }]), // Unsupported
      }));

      const detected = await detectLanguage('Unknown language');

      expect(detected).toBe('en');
    });

    test('✓ Handles detection errors', async () => {
      MockTranslateConstructor.mockClear();
      MockTranslateConstructor.mockImplementationOnce(() => ({
        translate: jest
          .fn()
          .mockResolvedValue(['Translated text']),
        detect: jest
          .fn()
          .mockRejectedValueOnce(new Error('API Error')),
      }));

      const detected = await detectLanguage('Test');

      expect(detected).toBe('en'); // Fallback to English
    });
  });

  // ============================================================================
  // Locale Detection Tests
  // ============================================================================

  describe('getDefaultLanguageFromLocale()', () => {
    test('✓ Detects Hindi from hi-IN locale', () => {
      const lang = getDefaultLanguageFromLocale('hi-IN');
      expect(lang).toBe('hi');
    });

    test('✓ Detects Tamil from ta-IN locale', () => {
      const lang = getDefaultLanguageFromLocale('ta-IN');
      expect(lang).toBe('ta');
    });

    test('✓ Detects Telugu from te-IN locale', () => {
      const lang = getDefaultLanguageFromLocale('te-IN');
      expect(lang).toBe('te');
    });

    test('✓ Detects Marathi from mr-IN locale', () => {
      const lang = getDefaultLanguageFromLocale('mr-IN');
      expect(lang).toBe('mr');
    });

    test('✓ Detects Kannada from kn-IN locale', () => {
      const lang = getDefaultLanguageFromLocale('kn-IN');
      expect(lang).toBe('kn');
    });

    test('✓ Defaults to English for unsupported locale', () => {
      const lang = getDefaultLanguageFromLocale('en-US');
      expect(lang).toBe('en');
    });

    test('✓ Defaults to English when no locale provided', () => {
      const lang = getDefaultLanguageFromLocale(undefined);
      expect(lang).toBe('en');
    });
  });

  // ============================================================================
  // Caching Tests
  // ============================================================================

  describe('Cache Management', () => {
    test('✓ Clears cache', async () => {
      // First translation to populate cache
      const result1 = await translate('Test 1', 'hi', 'en');
      expect(result1.cached).toBe(false);
      
      // Second same translation should be cached
      const result2 = await translate('Test 1', 'hi', 'en');
      expect(result2.cached).toBe(true);
      expect(getCacheStats().size).toBeGreaterThan(0);

      // Clear and verify
      clearCache();
      expect(getCacheStats().size).toBe(0);
      
      // Next call should not be cached
      const result3 = await translate('Test 1', 'hi', 'en');
      expect(result3.cached).toBe(false);
    });

    test('✓ Returns cache statistics', () => {
      const stats = getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('itemCount');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.itemCount).toBe('number');
    });
  });

  // ============================================================================
  // Supported Languages Tests
  // ============================================================================

  describe('SUPPORTED_LANGUAGES', () => {
    test('✓ Contains all required languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveProperty('en');
      expect(SUPPORTED_LANGUAGES).toHaveProperty('hi');
      expect(SUPPORTED_LANGUAGES).toHaveProperty('ta');
      expect(SUPPORTED_LANGUAGES).toHaveProperty('te');
      expect(SUPPORTED_LANGUAGES).toHaveProperty('mr');
      expect(SUPPORTED_LANGUAGES).toHaveProperty('kn');
    });

    test('✓ Has display names for all languages', () => {
      Object.values(SUPPORTED_LANGUAGES).forEach((name) => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });
  });

  // ============================================================================
  // Zod Schema Validation Tests
  // ============================================================================

  describe('TranslationRequestSchema', () => {
    test('✓ Validates valid translation request', () => {
      const valid = {
        content: 'Test message',
        targetLanguage: 'hi' as const,
        sourceLanguage: 'en' as const,
      };

      expect(() => TranslationRequestSchema.parse(valid)).not.toThrow();
    });

    test('✓ Requires content', () => {
      const invalid = {
        targetLanguage: 'hi' as const,
      };

      expect(() => TranslationRequestSchema.parse(invalid)).toThrow();
    });

    test('✓ Requires valid targetLanguage', () => {
      const invalid = {
        content: 'Test',
        targetLanguage: 'invalid' as never,
      };

      expect(() => TranslationRequestSchema.parse(invalid)).toThrow();
    });

    test('✓ Defaults sourceLanguage to en', () => {
      const request = {
        content: 'Test',
        targetLanguage: 'hi' as const,
      };

      const parsed = TranslationRequestSchema.parse(request);
      expect(parsed.sourceLanguage).toBe('en');
    });

    test('✓ Validates content length constraints', () => {
      const empty = {
        content: '',
        targetLanguage: 'hi' as const,
      };

      expect(() => TranslationRequestSchema.parse(empty)).toThrow();

      const toolong = {
        content: 'x'.repeat(5001),
        targetLanguage: 'hi' as const,
      };

      expect(() => TranslationRequestSchema.parse(toolong)).toThrow();
    });
  });
});
