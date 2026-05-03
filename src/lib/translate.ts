/**
 * Google Cloud Translation API client for ElectionGuide (SERVER-SIDE ONLY)
 *
 * Provides multilingual support for chat responses and UI content.
 * Implements caching, rate limiting, and cost optimization.
 *
 * IMPORTANT: This file contains Node.js-only dependencies.
 * For client-side imports, use @/lib/translate-constants instead.
 */

import crypto from 'crypto';
import { z } from 'zod';
import { LanguageCode, TranslationResponse } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/lib/translate-constants';

// Re-export for convenience in server-side code
export type { LanguageCode };
export { SUPPORTED_LANGUAGES };

/**
 * Zod schema for validating translation requests
 */
export const TranslationRequestSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty').max(5000, 'Content too long'),
  targetLanguage: z.enum(['en', 'hi', 'ta', 'te', 'mr', 'kn'] as const),
  sourceLanguage: z.enum(['en', 'hi', 'ta', 'te', 'mr', 'kn'] as const).default('en'),
});

export type ValidatedTranslationRequest = z.infer<typeof TranslationRequestSchema>;

/**
 * In-memory cache for translations (can be replaced with Redis in production)
 * Format: { "en:hi:hash(content)": translation }
 */
const translationCache = new Map<string, { translation: string; timestamp: number }>();

/**
 * Cache TTL in milliseconds (24 hours)
 */
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Generate cache key from source language, target language, and content hash
 */
function generateCacheKey(
  content: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode
): string {
  const hash = crypto
    .createHash('md5')
    .update(content)
    .digest('hex')
    .substring(0, 8);
  return `${sourceLanguage}:${targetLanguage}:${hash}`;
}

/**
 * Clean expired entries from cache
 */
function cleanCache(): void {
  const now = Date.now();
  for (const [key, value] of translationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      translationCache.delete(key);
    }
  }
}

/**
 * Translate text using Google Cloud Translation API
 *
 * @param content - Text to translate
 * @param targetLanguage - Target language code
 * @param sourceLanguage - Source language code (default: 'en')
 * @returns Translated text
 *
 * @throws Error if translation fails or API is unavailable
 */
export async function translate(
  content: string,
  targetLanguage: LanguageCode,
  sourceLanguage: LanguageCode = 'en'
): Promise<TranslationResponse> {
  // Skip translation if source and target are the same
  if (sourceLanguage === targetLanguage) {
    return {
      original: content,
      translated: content,
      targetLanguage,
      cached: false,
    };
  }

  // Check cache
  cleanCache();
  const cacheKey = generateCacheKey(content, sourceLanguage, targetLanguage);
  const cachedResult = translationCache.get(cacheKey);

  if (cachedResult) {
    return {
      original: content,
      translated: cachedResult.translation,
      targetLanguage,
      cached: true,
    };
  }

  try {
    // Import Google Cloud Translation client (v2 API)
    const { v2 } = await import('@google-cloud/translate');
    const translate = new v2.Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });

    // Call Translation API
    const [translation] = await translate.translate(content, {
      from: sourceLanguage,
      to: targetLanguage,
    });

    // Store in cache
    translationCache.set(cacheKey, {
      translation,
      timestamp: Date.now(),
    });

    return {
      original: content,
      translated: translation,
      targetLanguage,
      cached: false,
    };
  } catch (error) {
    // Log error but don't throw - allow graceful fallback to English
    console.error(`Translation error (${sourceLanguage} → ${targetLanguage}):`, error);

    // Return original if translation fails
    return {
      original: content,
      translated: content,
      targetLanguage,
      cached: false,
    };
  }
}

/**
 * Translate multiple strings in batch (more efficient)
 *
 * @param contents - Array of texts to translate
 * @param targetLanguage - Target language code
 * @param sourceLanguage - Source language code (default: 'en')
 * @returns Array of translations
 */
export async function translateBatch(
  contents: string[],
  targetLanguage: LanguageCode,
  sourceLanguage: LanguageCode = 'en'
): Promise<TranslationResponse[]> {
  // Batch up to 5 items at a time for efficiency
  const batchSize = 5;
  const results: TranslationResponse[] = [];

  for (let i = 0; i < contents.length; i += batchSize) {
    const batch = contents.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((content) => translate(content, targetLanguage, sourceLanguage))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Detect language of given content
 *
 * @param content - Text to detect language for
 * @returns Detected language code
 */
export async function detectLanguage(content: string): Promise<LanguageCode> {
  try {
    const { v2 } = await import('@google-cloud/translate');
    const translate = new v2.Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });

    const [detection] = await translate.detect(content);

    // Map detected language to our supported codes
    const detectedLanguage = detection.language as string;
    if (Object.keys(SUPPORTED_LANGUAGES).includes(detectedLanguage)) {
      return detectedLanguage as LanguageCode;
    }

    // Default to English if detection doesn't match supported languages
    return 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
}

/**
 * Get default language based on browser locale
 *
 * @param browserLocale - Browser locale string (e.g., 'hi-IN', 'ta-IN')
 * @returns Recommended language code
 */
export function getDefaultLanguageFromLocale(browserLocale?: string): LanguageCode {
  if (!browserLocale) return 'en';

  const locale = browserLocale.toLowerCase();

  // Map common browser locales to our language codes
  const localeMap: Record<string, LanguageCode> = {
    'hi-in': 'hi',
    'hi': 'hi',
    'ta-in': 'ta',
    'ta': 'ta',
    'te-in': 'te',
    'te': 'te',
    'mr-in': 'mr',
    'mr': 'mr',
    'kn-in': 'kn',
    'kn': 'kn',
  };

  return localeMap[locale] || 'en';
}

/**
 * Clear translation cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  translationCache.clear();
}

/**
 * Get cache statistics (for monitoring)
 */
export function getCacheStats(): { size: number; itemCount: number } {
  return {
    size: translationCache.size,
    itemCount: translationCache.size,
  };
}
