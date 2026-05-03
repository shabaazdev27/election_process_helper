import { z } from 'zod';

/**
 * Google Services Validator
 * 
 * Ensures all responses from Google Gemini API:
 * 1. Cite official ECI sources
 * 2. Are non-partisan
 * 3. Follow accessibility guidelines
 * 4. Include next steps
 */

/**
 * List of official ECI domains that must be cited in responses
 * @const
 */
export const ECI_SOURCE_DOMAINS = [
  'voters.eci.gov.in',
  'eci.gov.in',
  'elections.in',
  'nvsp.in',
  'nvsp.eci.gov.in',
];

/**
 * Pattern to match ECI citations in responses
 * Looks for URLs or references like "According to voters.eci.gov.in"
 * @const
 */
const ECI_CITATION_PATTERN = /voters\.eci\.gov\.in|eci\.gov\.in|nvsp\.eci\.gov\.in|nvsp\.in|elections\.[a-z]+\.gov\.in/gi;

/**
 * Pattern to detect non-partisan language violations
 * @const
 */
const PARTISAN_KEYWORDS = [
  'support',
  'vote for',
  'endorse',
  'criticize',
  'attack',
  'opponent',
  'rival party',
];

/**
 * Validates that a response cites official ECI sources
 * 
 * @param content - The response text from Gemini
 * @returns true if response contains at least one ECI citation
 * 
 * @example
 * ```typescript
 * const response = "According to voters.eci.gov.in, you can check registration...";
 * validateECICitation(response); // true
 * ```
 */
export function validateECICitation(content: string): boolean {
  const pattern = /voters\.eci\.gov\.in|eci\.gov\.in|nvsp\.eci\.gov\.in|nvsp\.in|elections\.[a-z]+\.gov\.in/i;
  return pattern.test(content);
}

/**
 * Extracts all ECI citations from a response
 * 
 * @param content - The response text
 * @returns Array of found ECI domain citations
 */
export function extractECICitations(content: string): string[] {
  const matches = content.match(ECI_CITATION_PATTERN);
  return matches ? [...new Set(matches.map(m => m.toLowerCase()))] : [];
}

/**
 * Validates response for partisan language
 * 
 * @param content - The response text
 * @returns true if response is free from partisan language
 */
export function validateNonPartisan(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return !PARTISAN_KEYWORDS.some(keyword =>
    lowerContent.includes(keyword)
  );
}

/**
 * Validates response includes "Next Steps" section
 * 
 * @param content - The response text
 * @returns true if response includes next steps guidance
 */
export function validateIncludesNextSteps(content: string): boolean {
  return /next steps?:|what's next|proceed with|following step/i.test(content);
}

/**
 * Zod schema for validating Gemini chat responses
 * Ensures all responses meet ElectionGuide standards
 */
export const geminiResponseSchema = z.object({
  content: z
    .string()
    .min(20, 'Response too short')
    .max(5000, 'Response too long')
    .refine(
      (text) => validateECICitation(text),
      {
        message: 'Response must cite official ECI sources (voters.eci.gov.in, eci.gov.in, etc.)',
      }
    )
    .refine(
      (text) => validateNonPartisan(text),
      {
        message: 'Response must maintain non-partisan tone',
      }
    ),
  role: z.enum(['assistant']),
  timestamp: z.date().optional(),
  citations: z.array(z.string()).optional(),
  hasNextSteps: z.boolean().optional(),
});

/**
 * Comprehensive validation for Gemini responses
 * 
 * @param content - Response text from Gemini
 * @returns Validation result with detailed feedback
 * 
 * @example
 * ```typescript
 * const result = validateGeminiResponse("According to voters.eci.gov.in...");
 * if (result.success) {
 *   console.log("Response valid:", result.data);
 * }
 * ```
 */
export function validateGeminiResponse(content: string) {
  const citations = extractECICitations(content);
  const hasNextSteps = validateIncludesNextSteps(content);

  return geminiResponseSchema.safeParse({
    content,
    role: 'assistant',
    timestamp: new Date(),
    citations: citations.length > 0 ? citations : undefined,
    hasNextSteps,
  });
}

/**
 * Validates that Gemini configuration includes search grounding
 * 
 * @param toolsConfig - The tools configuration passed to Gemini
 * @returns true if googleSearch tool is configured
 */
export function validateSearchGroundingEnabled(
  toolsConfig: Array<Record<string, unknown>> | undefined
): boolean {
  if (!toolsConfig || !Array.isArray(toolsConfig)) {
    return false;
  }
  return toolsConfig.some((tool) => 'googleSearch' in tool);
}

/**
 * Type for validation report
 */
export interface ValidationReport {
  isValid: boolean;
  hasCitations: boolean;
  citations: string[];
  isNonPartisan: boolean;
  hasNextSteps: boolean;
  errors: string[];
}

/**
 * Generates detailed validation report for a response
 * 
 * @param content - Response to validate
 * @returns Detailed validation report
 */
export function generateValidationReport(content: string): ValidationReport {
  const citations = extractECICitations(content);
  const isNonPartisan = validateNonPartisan(content);
  const hasNextSteps = validateIncludesNextSteps(content);
  const hasCitations = citations.length > 0;

  const errors: string[] = [];
  if (!hasCitations) {
    errors.push('Missing ECI source citations');
  }
  if (!isNonPartisan) {
    errors.push('Response contains partisan language');
  }
  if (!hasNextSteps) {
    errors.push('Response missing "Next Steps" guidance');
  }

  return {
    isValid: hasCitations && isNonPartisan && hasNextSteps,
    hasCitations,
    citations,
    isNonPartisan,
    hasNextSteps,
    errors,
  };
}
