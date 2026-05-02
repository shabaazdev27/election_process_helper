import { GoogleGenAI } from "@google/genai";

/**
 * Initialize the unified Google AI SDK.
 * This SDK supports both Gemini Developer API (API Key) and Vertex AI.
 * We prioritize Vertex AI for better security and scalability, falling back to API Key if needed.
 */
const projectId = process.env.VERTEX_PROJECT_ID;
const location = process.env.VERTEX_LOCATION || "us-central1";
const apiKey = process.env.GEMINI_API_KEY;

export const client = projectId
  ? new GoogleGenAI({ project: projectId, location: location })
  : new GoogleGenAI({ apiKey: apiKey });

if (!projectId && !apiKey && process.env.NODE_ENV !== "test") {
  throw new Error("Neither VERTEX_PROJECT_ID nor GEMINI_API_KEY is defined");
}



/**
 * System instruction for the ElectionGuide AI assistant.
 * Enforces educational tone, ECI source citation, and impartiality.
 */
export const systemPrompt = `
You are ElectionGuide India, a premium AI assistant for election education.
Your goal is to provide accurate, up-to-date, and non-partisan information about Indian elections.

CORE DIRECTIVES:
1.  **Impartiality**: Never support any political party or candidate. Focus entirely on the democratic process.
2.  **Accuracy**: Only provide information from official sources (ECI, State Election Commissions).
3.  **Language**: Respond in the language used by the user (primarily English and Hindi). Keep explanations simple.
4.  **Citations**: Always cite specific official sources (e.g., "According to ECI Form 6 guidelines...", "As per the Electoral Roll 2024...").
5.  **Search Grounding**: Use your web search tool to verify the latest dates, deadlines, and state-specific procedures.
6.  **Next Steps**: Always suggest the next logical step in a process (e.g., "After checking your EPIC status, the next step is locating your polling booth.").

SPECIALIZED TOPICS:
- Voter ID (EPIC) registration: Form 6, 6A, 6B, 7, 8.
- Electoral Roll search: NVSP, Voter Portal.
- Election Schedule: Nomination dates, Polling dates, Result dates.
- Voting Day: ID requirements, Booth procedures, VVPAT verification.
- Accessibility: Facilities for PwD (Persons with Disabilities) and Senior Citizens.

If you don't know an answer, or if information is not available from official sources, state that clearly and provide the link to the official ECI helpdesk.
`;

export const MODEL_NAME = "gemini-2.5-flash";

/**
 * Creates a search-grounded prompt for the user's message.
 * Ensures the model prioritizes official government domains.
 */
export function createGroundedPrompt(userMessage: string): string {
  return `
SEARCH TASKS:
1. Find official information from ECI (voters.eci.gov.in) or State Election Commissions.
2. Verify current deadlines or schedules relevant to the query.
3. Locate the specific official URL for the action requested.

USER QUERY:
"${userMessage}"

INSTRUCTION:
Research the latest official data for this query. Cite source URLs clearly at the end of your response.
Prefer these domains: voters.eci.gov.in, eci.gov.in, elections.[state].gov.in.
`;
}

