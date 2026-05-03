/**
 * Translation constants and types
 * Safe for client-side imports
 */

import { LanguageCode } from '@/types';

// Re-export for convenience
export type { LanguageCode };

/**
 * Supported languages and their display names
 */
export const SUPPORTED_LANGUAGES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  mr: 'मराठी (Marathi)',
  kn: 'ಕನ್ನಡ (Kannada)',
};
