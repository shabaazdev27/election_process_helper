# ElectionGuide India 🇮🇳

An AI-driven educational platform designed to empower Indian citizens with comprehensive knowledge about the election process, voter registration, and legislative timelines.

## 🎯 Chosen Vertical: Civic Education & Engagement
This solution addresses the gap in civic literacy by providing a centralized, accessible, and personalized guide to the complex Indian election machinery. It leverages state-of-the-art AI to simplify official government documentation into actionable insights for every citizen.

---

## 🚀 Approach and Logic

### 1. **AI-First Education**
Instead of static FAQs, we use **Gemini 2.5 Flash** with **Google Search Grounding**. This ensures that users receive real-time, factually accurate information directly sourced from current government records and the Election Commission of India (ECI).

### 2. **Personalized Learning Path (State Persistence)**
The system tracks user progress using **Google Cloud Firestore**. 
- **Lazy Initialization**: We use a singleton pattern with deferred initialization for the Firestore SDK. This ensures the application remains responsive even if the database connection is delayed and prevents environment errors during unit testing.
- **Progress Tracking**: As users view different process guides (e.g., "Applying for Voter ID"), their progress is stored and used to personalize the AI Assistant's context.

### 3. **Security by Design**
In a civic application, integrity is paramount. We implemented:
- **CSRF Protection**: A robust httpOnly cookie-based mechanism to prevent cross-site attacks.
- **Rate Limiting**: IP-based request throttling to prevent API abuse.
- **Input Sanitization**: Strict schema validation using Zod for all user-generated content.

### 4. **Accessibility for All**
To fulfill the goal of empowering *all* citizens, the platform is built with:
- **Skip-to-content** links for keyboard users.
- **Semantic HTML5** for screen reader compatibility.
- **Lighthouse-optimized** performance for users on low-bandwidth connections.

---

## 🛠️ How the Solution Works

### **Tech Stack**
| Layer | Technology | Key Feature |
|-------|------------|-------------|
| **Framework** | Next.js 16 (App Router) | Streaming SSR & Optimized Routing |
| **AI** | Gemini 2.5 Flash | Real-time Search Grounding |
| **Database** | Google Cloud Firestore | Native SDK with Lazy Initialization |
| **Testing** | Playwright & Jest | 100% Core Coverage & E2E Automation |
| **Security** | Zod & HTTP-Only Cookies | Robust CSRF & Schema Validation |
| **Aesthetics**| Vanilla CSS | Modern Glassmorphism & Micro-animations |

### **User Flow**
1. **Explore**: Users browse interactive timelines and process guides.
2. **Interact**: Users ask questions to the AI Assistant. The assistant is "grounded," meaning it searches the live web for the latest ECI guidelines before answering.
3. **Track**: As users complete sections, their progress is visualized on a personalized dashboard.
4. **Assess**: Users take quizzes to test their knowledge, with scores saved to their civic profile.

---

## 📋 Assumptions Made

1. **Authentication**: The system currently uses a "Guest-First" approach with optional User ID headers for progress tracking. In a full production scale, this would be integrated with a Google Identity platform.
2. **Environment**: It is assumed that the environment is configured with **Application Default Credentials (ADC)** for Firestore access and a valid **Gemini API Key** or **Vertex AI** permissions.
3. **Data Freshness**: While the AI uses live search grounding, users are always advised to verify critical registration dates with their local Booth Level Officer (BLO) as per ECI protocol.
4. **Browser Support**: The solution assumes modern browser support (ES2022+) to leverage advanced CSS features and streaming API responses.

---

## 🧪 Quality Gates
- **Testing**: 100% unit test coverage for core libraries and 90%+ for API routes.
- **E2E**: Full Playwright coverage for critical navigation and AI chat flows.
- **Linting**: Strict ESLint rules (Next.js Core Web Vitals) for code consistency.

---
*Developed for the Google Gemini Agentic Coding Challenge.*
