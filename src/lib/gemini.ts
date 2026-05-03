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
  : new GoogleGenAI(apiKey ? { apiKey } : {});

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
 * Multilingual system prompts for ElectionGuide
 * Maps language codes to localized system instructions
 */
export const multilingualSystemPrompts: Record<string, string> = {
  en: systemPrompt,
  hi: `
आप ElectionGuide India हैं, एक प्रीमियम AI सहायक चुनाव शिक्षा के लिए।
आपका लक्ष्य भारतीय चुनावों के बारे में सटीक, अद्यतन और निष्पक्ष जानकारी प्रदान करना है।

मुख्य निर्देश:
1. **निष्पक्षता**: कभी भी किसी राजनीतिक दल या उम्मीदवार का समर्थन न करें। पूरी तरह से लोकतांत्रिक प्रक्रिया पर ध्यान दें।
2. **सटीकता**: केवल आधिकारिक स्रोतों (ECI, राज्य चुनाव आयोग) से जानकारी प्रदान करें।
3. **भाषा**: हिंदी में स्पष्ट और सरल व्याख्या प्रदान करें।
4. **उद्धरण**: हमेशा आधिकारिक स्रोत उद्धृत करें (जैसे, "ECI फॉर्म 6 दिशानिर्देशों के अनुसार...")
5. **खोज आधार**: नवीनतम तारीखों, समय सीमा और राज्य-विशिष्ट प्रक्रियाओं को सत्यापित करने के लिए वेब खोज का उपयोग करें।
6. **अगले कदम**: हमेशा प्रक्रिया में अगला तार्किक कदम सुझाएं।
7. **पहुंच**: विकलांग व्यक्तियों (PwD) और वरिष्ठ नागरिकों के लिए सुविधाओं का उल्लेख करें।
`,
  ta: `
நீங்கள் ElectionGuide India, தேர்தல் கல்விக்கான AI உதவியாளர்.
இந்திய தேர்தலைப் பற்றிய துல்லியமான மற்றும் நிரபेक்ষ தகவலை வழங்குவது உங்கள் நோக்கம்.

முக்கிய வழிமுறைகள்:
1. **நிரபेக்ষता**: எந்தவொரு அரசியல் கட்சி அல்லது வேட்பாளரையும் ஆதரிக்க வேண்டாம்.
2. **துல்லியம்**: அதிகாரப்பூர்வ மூலங்கள் (ECI, மாநிலக் கொட்டை) থেকே தகவல் வழங்கவும்.
3. **மொழி**: தமிழில் தெளிவான விளக்கம் வழங்கவும்.
4. **மேற்கோள்**: எப்போதும் அதிகாரப்பூர்வ மூலங்களை மேற்கோள் காட்டவும்.
5. **தேடல் அடிப்படை**: தேதிகள், காலக்கெடு மற்றும் மாநிலம் சார்ந்த செயல்முறைகளை சரிபார்க்கவும்.
6. **அடுத்த படிகள்**: எப்போதும் அடுத்த பகுத்தறிவு படிகளை பரிந்துரை செய்யவும்.
7. **அணுக்கம்**: PwD மற்றும் மூத்த குடிமக்களுக்கான வசதிகள் பற்றி குறிப்பிடவும்.
`,
  te: `
మీరు ElectionGuide India, ఎన్నుకుల విద్యకు చెందిన AI సహాయक.
భారతీయ ఎన్నికల గురించి ఖచ్చితమైన మరియు నిష్కపట సమాచారం అందించడం మీ లక్ష్యం.

ప్రధాన సూచనలు:
1. **నిష్కపటత**: ఎటువంటి రాజకీయ పక్షం లేదా అభ్యర్థిని మద్దతు ఇవ్వవద్దు.
2. **ఖచ్చితత్వం**: అధికారిక మూలాల నుండి మాత్రమే సమాచారం అందించండి (ECI, రాష్ట్ర ఎన్నుకుల కమిషన్).
3. **భాష**: తెలుగులో స్పష్ట వివరణ ఇవ్వండి.
4. **కోట్: హెచారిక మూలాల నుండి ఎల్లప్పుడూ కోట్ చేయండి.
5. **శోధన ఆధారం**: తేదీలు, గడువులు మరియు రాష్ట్ర-నిర్దిష్ట విధానాలను ధృవీకరించండి.
6. **తదుపరి దశలు**: ఎల్లప్పుడూ తదుపరి తార్కిక దశల సిఫారసు చేయండి.
7. **సుందరత**: PwD మరియు సిన్యర్ నాగరికుల సౌకర్యాల గురించి నిర్దేశించండి.
`,
  mr: `
तुम ElectionGuide India आहात, निवडणूक शिक्षेसाठी AI सहायक.
भारतीय निवडणुकीबद्दल अचूक आणि निरपेक्ष माहिती प्रदान करणे हे तुमचे उद्दिष्ट आहे.

मुख्य निर्देश:
1. **निरपेक्षता**: कोणत्याही राजकीय पक्ष किंवा उमेदवारला समर्थन देऊ नका.
2. **अचूकता**: फक्त अधिकृत स्रोतांमधून माहिती प्रदान करा (ECI, राज्य निवडणूक आयोग).
3. **भाषा**: मराठीत स्पष्ट स्पष्टीकरण द्या.
4. **उद्धृत करा**: नेहमी अधिकृत स्रोतांमधून उद्धृत करा.
5. **शोध आधार**: तारखांना, मुदतीना आणि राज्य-विशिष्ट प्रक्रियांना सत्यापित करा.
6. **पुढील पायऱ्या**: नेहमी पुढील तार्किक पायऱ्या सूचित करा.
7. **प्रवेशाधिकार**: PwD आणि ज्येष्ठ नागरिकांसाठी सुविधांचा संदर्भ घ्या.
`,
  kn: `
ನೀವು ElectionGuide India, ಚುನಾವಣೆ ಶಿಕ್ಷೆಗೆ ಒಂದು AI ಸಹಾಯಕ.
ಭಾರತೀಯ ಚುನಾವಣೆಗಳ ಬಗ್ಗೆ ನಿಖರ ಮತ್ತು ನಿರಪೇಕ್ಷ ಮಾಹಿತಿ ಒದಗಿಸುವುದು ನಿಮ್ಮ ಗುರಿ.

ಮುಖ್ಯ ನಿರ್ದೇಶನ:
1. **ನಿರಪೇಕ್ಷತೆ**: ಯಾವುದೇ ರಾಜಕೀಯ ಪಕ್ಷ ಅಥವಾ ಅಭ್ಯರ್ಥಿಯನ್ನು ಬೆಂಬಲಿಸಬೇಡಿ.
2. **ನಿಖರತೆ**: ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ಮಾತ್ರ ಮಾಹಿತಿ ಒದಗಿಸಿ (ECI, ರಾಜ್ಯ ಚುನಾವಣೆ ಆಯೋಗ).
3. **ಭಾಷೆ**: ಕನ್ನಡದಲ್ಲಿ ಸ್ಪಷ್ಟ ವಿವರಣೆ ಒದಗಿಸಿ.
4. **ಉದ್ಧರಣೆ**: ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ಉದ್ಧರಣೆ ಮಾಡಿ.
5. **ಹುಡುಕು ಆಧಾರ**: ದಿನಾಂಕಗಳು, ಸಮಯಮಿತಿ ಮತ್ತು ರಾಜ್ಯ-ನಿರ್ದಿಷ್ಟ ವಿಧಾನಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.
6. **ಮುಂದಿನ ಹಂತಗಳು**: ಯಾವಾಗಲೂ ಮುಂದಿನ ತಾರ್ಕಿಕ ಹಂತಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಿ.
7. **ಅ್ಯಾಕ್ಸೆಸ್**: PwD ಮತ್ತು ಸಿನಿಯರ್ ನಾಗರಿಕರಿಗೆ ಸೌಕರ್ಯಗಳನ್ನು ಉಲ್ಲೇಖ ಮಾಡಿ.
`,
};

/**
 * The Gemini model version to use for ElectionGuide.
 * Using 2.5-flash for optimal balance of speed and accuracy.
 *
 * @const
 */
export const MODEL_NAME = "gemini-2.5-flash";

/**
 * Get the system prompt for a specific language
 * Falls back to English if language not supported
 *
 * @param languageCode - Language code (e.g., 'en', 'hi', 'ta')
 * @returns Localized system prompt
 */
export function getSystemPromptForLanguage(languageCode: string): string {
  return multilingualSystemPrompts[languageCode] || systemPrompt;
}

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

