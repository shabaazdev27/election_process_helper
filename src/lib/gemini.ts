import { GoogleGenAI } from "@google/genai";

/**
 * TypeScript interfaces for Gemini configuration and responses
 */
export interface GeminiConfig {
  projectId?: string;
  location?: string;
  apiKey?: string;
}

export interface ChatSessionConfig {
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export interface GroundedPromptOptions {
  includeUserContext?: boolean;
  prioritizeDomains?: string[];
}

/**
 * Initialize the unified Google AI SDK.
 * This SDK supports both Gemini Developer API (API Key) and Vertex AI.
 * We prioritize Vertex AI for better security and scalability, falling back to API Key if needed.
 *
 * @throws Error if neither VERTEX_PROJECT_ID nor GEMINI_API_KEY is defined (non-test environment)
 */
const projectId = process.env.VERTEX_PROJECT_ID;
const location = process.env.VERTEX_LOCATION || "us-central1";
const apiKey = process.env.GEMINI_API_KEY;

/**
 * The global Gemini AI client instance.
 * Supports both Vertex AI (preferred) and Gemini API (fallback).
 */
export const client = projectId
  ? new GoogleGenAI({ project: projectId, location: location })
  : new GoogleGenAI({ apiKey: apiKey });

if (!projectId && !apiKey && process.env.NODE_ENV !== "test") {
  throw new Error("Neither VERTEX_PROJECT_ID nor GEMINI_API_KEY is defined");
}

/**
 * System instruction for the ElectionGuide AI assistant.
 * Enforces educational tone, ECI source citation, and impartiality.
 *
 * This prompt ensures:
 * - Non-partisan, factual information
 * - Official source citations
 * - Accessibility guidance
 * - Next-step suggestions
 *
 * @const
 */
export const systemPrompt = `
You are ElectionGuide India, a premium AI assistant for election education.
Your goal is to provide accurate, up-to-date, and non-partisan information about Indian elections.

CORE DIRECTIVES:
1. **Impartiality**: Never support any political party or candidate. Focus entirely on the democratic process.
2. **Accuracy**: Only provide information from official sources (ECI, State Election Commissions).
3. **Language**: Respond in the language used by the user (primarily English and Hindi). Keep explanations simple.
4. **Citations**: Always cite specific official sources (e.g., "According to ECI Form 6 guidelines...", "As per the Electoral Roll 2024...").
5. **Search Grounding**: Use your web search tool to verify the latest dates, deadlines, and state-specific procedures.
6. **Next Steps**: Always suggest the next logical step in a process (e.g., "After checking your EPIC status, the next step is locating your polling booth.").
7. **Accessibility**: Mention facilities for Persons with Disabilities (PwD) and Senior Citizens when relevant.

SPECIALIZED TOPICS:
- Voter ID (EPIC) registration: Form 6, 6A, 6B, 7, 8, renewal procedures
- Electoral Roll: NVSP (National Voter Services Portal), state-wise portals, part search
- Election Schedule: Nomination dates, polling dates, results, state-specific elections
- Voting Day: ID requirements, booth procedures, VVPAT verification, postal voting
- Accessibility: Braille materials, large print ballots, tactile VVPAT for blind voters
- Common Issues: Duplicate entries, name corrections, address changes

PROHIBITED TOPICS:
- Political party support or candidate endorsement
- Sensitive personal data beyond civic participation
- Non-electoral government services

RESPONSE STYLE:
- Clear, step-by-step guidance
- Always provide official URLs or contact numbers
- If information cannot be verified from official sources, state this clearly
- Offer links to ECI helpdesk: https://www.eci.gov.in/contact-us/
`;

/**
 * The Gemini model version to use for ElectionGuide.
 * Using 2.5-flash for optimal balance of speed and accuracy.
 *
 * @const
 */
export const MODEL_NAME = "gemini-2.5-flash";

/**
 * Default Gemini chat configuration for ElectionGuide.
 * Lower temperature for factual accuracy (elections are sensitive).
 *
 * @const
 */
export const DEFAULT_CHAT_CONFIG: ChatSessionConfig = {
  temperature: 0.1,
  topP: 0.95,
  maxOutputTokens: 2048,
};

/**
 * Creates a search-grounded prompt for the user's message.
 * Ensures the model prioritizes official government domains and current data.
 *
 * @param userMessage - The user's query about election processes
 * @param options - Optional configuration for grounding behavior
 * @returns A formatted prompt that guides Gemini to search for official sources
 *
 * @example
 * ```typescript
 * const prompt = createGroundedPrompt("How do I register to vote?");
 * // Returns a prompt that instructs Gemini to search ECI sources
 * ```
 */
export function createGroundedPrompt(
  userMessage: string,
  options: GroundedPromptOptions = {}
): string {
  const { 
    prioritizeDomains = [
      "voters.eci.gov.in",
      "eci.gov.in",
      "elections.[state].gov.in",
      "nvsp.in"
    ]
  } = options;

  return `
SEARCH-GROUNDED TASK:
You are helping an Indian citizen understand election processes. 
Use Google Search to find CURRENT, OFFICIAL information.

PRIORITY SOURCES (cite these):
${prioritizeDomains.map((d) => `- ${d}`).join("\n")}

USER QUERY:
"${userMessage}"

INSTRUCTIONS FOR SEARCH AND RESPONSE:
1. Search for the most current official information related to this query
2. Verify any deadlines, dates, or procedures with official sources
3. Locate the exact URL or official contact for the requested information
4. Include citations in your response (e.g., "According to voters.eci.gov.in...")
5. If you find conflicting information, mention both sources and explain
6. Always provide a clear "Next Steps" section at the end
7. If the information is not available from official sources, state this clearly

RESPONSE FORMAT:
- Start with a direct answer to the query
- Include any relevant official URLs
- End with "Official Contact: [ECI link or number]"
`;
}

/**
 * Validates that Gemini credentials are properly configured.
 * Called during module initialization and can be used for runtime checks.
 *
 * @returns true if either Vertex AI or Gemini API credentials are available
 */
export function isGeminiConfigured(): boolean {
  return !!(
    (process.env.VERTEX_PROJECT_ID && process.env.VERTEX_LOCATION) ||
    process.env.GEMINI_API_KEY
  );
}

