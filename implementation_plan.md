# 🗳️ ElectionGuide India: Premium Quality & Live Data Plan

This plan outlines the steps to reach 100% compliance with user requirements for Security, Testing, Google Service integration, and "Live Data" transparency.

## 📐 Updated Architecture
- **Auth Strategy**: Dual-mode (Authenticated vs. Guest).
- **AI Strategy**: Gemini 1.5 Flash + Web Grounding (Search Retrieval).
- **Data Strategy**: Hybrid (Mock UI with dynamic "Live Link" metadata for ECI authorized portals).

---

## 🚀 Phase 1: Authentication & Guest Experience
### [MODIFY] [AuthProvider.tsx](file:///c:/Users/Engineer/Documents/election_process_helper/src/components/AuthProvider.tsx)
- Implement a `isGuest` state.
- If `user` is null, automatically treat as guest.
- Add "Premium" flags to the context to trigger upselling UI.

### [MODIFY] [Assistant UI](file:///c:/Users/Engineer/Documents/election_process_helper/src/app/assistant/page.tsx)
- **Guest Limitation**: Allow 3-5 messages for guests.
- **Upsell Trigger**: After the limit, show a premium modal: *"Sign in for unlimited history and personalized voting timelines."*

---

## 🌍 Phase 2: Live Data & Authorized Routing
### [MODIFY] [Dashboard](file:///c:/Users/Engineer/Documents/election_process_helper/src/app/dashboard/page.tsx) & [Process Guides](file:///c:/Users/Engineer/Documents/election_process_helper/src/app/process/[id]/page.tsx)
- Since ECI APIs are highly restricted for direct integration, we will implement a **"Live Data Bridge"**:
  - Each guide will have a "Verify on Official ECI Portal" button.
  - The UI will show a **"Live Status: External"** badge.
  - **Contextual Guide**: Before redirecting, show a overlay guide: *"You are moving to NVSP. Use your Part Number (found in Step 2) to search the electoral roll."*

---

## 🤖 Phase 3: AI Assistant Grounding (Search)
### [MODIFY] [Chat Route](file:///c:/Users/Engineer/Documents/election_process_helper/src/app/api/chat/route.ts)
- Integrate **Google Search Grounding** (if using Vertex) or a custom **RAG (Retrieval Augmented Generation)** using search tools.
- Ensure the assistant explicitly cites ECI URLs (`elections.tn.gov.in`, `voters.eci.gov.in`) in the response body.

---

## 🛡️ Phase 4: 100% Quality Assurance (QA)
### 🔒 Security
- Implement **Firebase Security Rules** (Validated).
- Add **Rate Limiting** to API routes using Vercel KV or simple middleware.
- **CSRF Protection**: Ensure all POST requests are validated.

### 🧪 Testing
- **Unit (Jest)**: Test `db.ts` logic and `gemini.ts` prompt construction.
- **Integration (Cypress)**: E2E flow from Landing -> Personalized -> Dashboard.
- **Performance**: Target 95+ on Lighthouse (Image optimization, font-display: swap).

### 📖 Readability & Code Quality
- **ESLint/Prettier**: Enforce strict "AirBnB" or "Next.js" standards.
- **Documentation**: Inline TSDoc for all `lib` functions.

---

## 📋 Verification Plan
- [ ] **Auth**: Verify Guest can use chat but not save progress.
- [ ] **Live Data**: Click "Verify" in Dashboard and ensure it routes to correct ECI state portal.
- [ ] **AI**: Ask "Who is the candidate for Mumbai North?" and verify it uses external knowledge.
- [ ] **Testing**: Run `npm test` and `cypress run`.
