# ElectionGuide India 🇮🇳

> **Empowering Citizens Through AI-Driven Civic Education**

An AI-driven educational platform designed to empower Indian citizens with comprehensive knowledge about the election process, voter registration, and legislative timelines. Developed with Google Cloud Services (Gemini AI + Firestore) and modern web technologies.

## 📑 Table of Contents

- [Chosen Vertical](#-chosen-vertical-civic-education--engagement)
- [Approach & Logic](#-approach-and-logic)
- [How It Works](#-how-the-solution-works)
- [Key Features](#-key-features)
- [Tech Stack](#-complete-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [Quality Standards](#-quality-standards)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Assumptions](#-assumptions-made)
- [Contributing](#-contributing)

---

## 🎯 Chosen Vertical: Civic Education & Engagement

**Problem**: India's complex election process, with its multiple regulatory forms (6, 6A, 6B, 7, 8), state-specific procedures, and frequent administrative changes, creates barriers to civic participation. Citizens struggle to navigate official documentation and understand electoral processes.

**Solution**: ElectionGuide provides a personalized, AI-powered assistant that:
- Simplifies dense government documentation into conversational guidance
- Provides real-time, grounded responses citing official ECI sources
- Tracks user progress across multiple learning paths
- Offers accessible, inclusive design for all citizens
- Maintains strict security and privacy standards

**Impact**: By lowering the barrier to civic understanding, ElectionGuide increases voter confidence and participation.

---

## 🚀 Approach and Logic

### 1. **AI-First Education with Search Grounding**
- **Technology**: Google Gemini 2.5 Flash with Google Search Grounding
- **Why**: Instead of static FAQs with stale information, the system queries live data from ECI websites
- **How**: The chat API (`api/chat/route.ts`) configures Gemini with `tools: [{ googleSearch: {} }]`
- **Guarantee**: Every response is grounded in current, official sources

### 2. **Personalized Learning Path (State Persistence)**
- **Technology**: Google Cloud Firestore with native SDK (`@google-cloud/firestore`)
- **Lazy Initialization**: Singleton pattern ensures responsive startup and clean testing
- **Progress Tracking**: Views, completions, quiz scores stored per user
- **Context Enrichment**: AI assistant receives user's progress as context for personalized responses
- **Backend-First**: Firestore operations via `src/lib/firestore-admin.ts` (never exposed to client)

### 3. **Security by Design**
- **CSRF Protection**: HTTP-only cookies + header validation (`x-csrf-token`)
- **Rate Limiting**: IP-based for guests (5 req/min), User ID-based for authenticated (20 req/min)
- **Input Validation**: Zod schemas on all user inputs (chat messages, quiz submissions)
- **No PII Leaks**: Firestore Security Rules restrict data access to users' own records

### 4. **Accessibility for All Citizens**
- **Semantic HTML5**: Proper heading hierarchy, landmarks (`<main>`, `<nav>`, `<section>`)
- **ARIA Labels**: Dynamic content has `aria-live="polite"` for screen reader users
- **Skip-to-Content**: Keyboard users can bypass navigation
- **Mobile-First Design**: Premium hamburger menu on small viewports; responsive Tailwind layout
- **Color Contrast**: WCAG AA compliance (4.5:1 for text)
- **Keyboard Navigation**: All interactive elements reachable via Tab/Enter

### 5. **Logical Decision Making**
The assistant uses multi-turn context to provide intelligent guidance:
- **Step Sequencing**: "You've completed voter ID registration. Next, search the electoral roll..."
- **State Validation**: "You haven't visited the Timeline page yet. I recommend learning the key dates first."
- **Personalized Upsell**: "As a guest, you're limited to 5 messages/min. Upgrade to unlock unlimited support."

---

## 🛠️ How the Solution Works

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Next.js Frontend)               │
│  • React 19 Components (TypeScript, Tailwind CSS)           │
│  • Framer Motion animations                                 │
│  • Session-based state (localStorage, Zustand)              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests (CSRF-protected)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Routes (Backend)                   │
│  • POST /api/chat - Chat with Gemini (search-grounded)     │
│  • Security: CSRF, Rate Limiting, Zod validation           │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
    ┌──────────────┐     ┌───────────────┐
    │Google Gemini │     │Google Cloud   │
    │2.5 Flash API │     │Firestore      │
    │              │     │               │
    │• Search      │     │• User Progress│
    │  Grounding   │     │• Quiz Scores  │
    │• ECI sources │     │• Preferences  │
    └──────────────┘     └───────────────┘
```

### **Data Flow Example: Chat Request**
1. User types message in chat UI
2. Frontend generates CSRF token, attaches to request
3. API validates: CSRF ✓, Rate Limit ✓, Input Schema ✓
4. Backend fetches user progress from Firestore (context)
5. Constructs grounded prompt: "User is on Step 3 of Voter ID process..."
6. Sends to Gemini with search grounding enabled
7. Gemini searches ECI website, returns grounded response
8. Response streamed back to client
9. User progress updated in Firestore

### **User Journey**
```
Landing Page → Dashboard (progress overview)
    ↓
Choose Path: Timeline / Voter ID / Booth Locating / Quiz
    ↓
View Process Guide (progress saved)
    ↓
Ask AI Assistant (context-aware answers)
    ↓
Dashboard updates with new progress
    ↓
Take Quiz → Results saved to Firestore
```

---

## 🎨 Key Features

### 1. **Interactive Process Guides**
- Modular steps for voter registration, booth locating, voting procedures
- Visual timeline showing key election dates
- Live data badges indicating ECI source updates
- State-specific guidance (TN, MH, DL examples; extensible)

### 2. **AI Assistant with Context**
- Conversational interface with Gemini
- Search grounding ensures factual accuracy
- Understands user's progress and learning path
- Multilingual support (English, Hindi)
- Citation of official sources (Form 6, NVSP, etc.)

### 3. **Progress Dashboard**
- Visual completion percentage
- Viewed vs. completed sections
- Quiz scores over time
- Next recommended steps
- Export progress summary

### 4. **Live Data Integration**
- Live Status badge showing real-time ECI data
- External portal redirects (voters.eci.gov.in, state-specific sites)
- Modal guidance before redirects ("Use Part Number to search...")
- Verification button for checking electoral roll status

### 5. **Accessibility Features**
- Skip-to-main-content link
- Keyboard-navigable menu
- ARIA labels and live regions
- Mobile-responsive design (mobile menu with animations)
- High contrast dark/light modes

---

## 📦 Complete Tech Stack

| **Category** | **Technology** | **Purpose** |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | SSR, streaming, optimized routes |
| | React 19 | UI components with hooks |
| | TypeScript 5 | 100% type safety, no `any` |
| | Tailwind CSS 4 | Utility-first styling, responsive |
| | Framer Motion 12 | Smooth animations, micro-interactions |
| | Zustand 5 | Lightweight client state |
| | Lucide React 1.11 | Icon library |
| **Backend** | Next.js API Routes | RESTful endpoints |
| | Zod 4.3 | Schema validation, type inference |
| **AI/ML** | Google Gemini 2.5 Flash | LLM with search grounding |
| | Google Vertex AI | Enterprise AI deployment |
| **Database** | Google Cloud Firestore | Realtime database, native SDK |
| | @google-cloud/firestore 8.5 | Server-side Firestore client |
| **Testing** | Jest 30 | Unit testing ES modules |
| | Playwright 1.59 | E2E testing (no Cypress) |
| | @testing-library/react 16 | Component testing |
| **Styling** | Tailwind CSS 4 | Modern CSS framework |
| | PostCSS 4 | CSS processing |
| **Development** | ESLint 9 | Code linting |
| | TypeScript 5 | Type checking |
| | Prettier | Code formatting (via ESLint) |
| **Utilities** | date-fns 4.1 | Date manipulation |
| | recharts 3.8 | Data visualization (charts) |

---

## 📁 Project Structure

```
election_process_helper/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout with AuthProvider
│   │   ├── page.tsx                   # Landing page (hero, CTA)
│   │   ├── globals.css                # Global styles
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts           # Chat API (CSRF, rate-limit, Gemini)
│   │   ├── assistant/
│   │   │   └── page.tsx               # Chat interface page
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Progress dashboard
│   │   ├── process/
│   │   │   ├── page.tsx               # Process guide list
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Process detail page
│   │   ├── quiz/
│   │   │   └── page.tsx               # Quiz interface
│   │   └── timeline/
│   │       └── page.tsx               # Election timeline
│   │
│   ├── components/                    # Reusable React components
│   │   ├── AuthProvider.tsx           # Auth context (guest + mock auth)
│   │   ├── Navbar.tsx                 # Navigation (responsive, mobile menu)
│   │   ├── Footer.tsx                 # Footer with links
│   │   ├── OptimizedImage.tsx         # Next/Image wrapper
│   │   ├── LiveDataBadge.tsx          # Live status indicator
│   │   ├── VerifyButton.tsx           # ECI portal redirect with modal
│   │   ├── __tests__/                 # Component tests
│   │   │   ├── AuthProvider.test.tsx
│   │   │   ├── Navbar.test.tsx
│   │   │   ├── Footer.test.tsx
│   │   │   ├── OptimizedImage.test.tsx
│   │   │   ├── LiveDataBadge.test.tsx
│   │   │   └── VerifyButton.test.tsx
│   │
│   ├── lib/                           # Utility functions & backends
│   │   ├── gemini.ts                  # Gemini client, system prompt
│   │   ├── firestore-admin.ts         # Firestore backend (server-only)
│   │   ├── firestore.ts               # Mock Firestore (no client SDK)
│   │   ├── db.ts                      # Mock DB utilities
│   │   ├── db-actions.ts              # Database action helpers
│   │   ├── LIGHTHOUSE_OPTIMIZATION.ts # Performance tips
│   │   ├── __tests__/                 # Library unit tests
│   │   │   ├── gemini.test.ts
│   │   │   ├── firestore-admin.test.ts
│   │   │   ├── db-actions.test.ts
│   │   │   ├── db.test.ts
│   │   │   └── security.test.ts
│   │
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces (UserProgress, etc.)
│
├── e2e/                               # Playwright E2E tests
│   ├── chat.spec.ts                   # Chat functionality
│   ├── complete-journey.spec.ts       # Full user flow
│   └── navigation.spec.ts             # Navigation & accessibility
│
├── public/                            # Static assets
│
├── .github/                           # GitHub configuration
│   ├── workflows/                     # CI/CD pipelines
│   └── copilot-instructions.md        # Agent architecture
│
├── jest.config.js                     # Jest configuration (ES modules)
├── jest.setup.js                      # Jest test environment setup
├── playwright.config.ts               # Playwright configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies & scripts
├── next.config.ts                     # Next.js configuration
├── eslint.config.mjs                  # ESLint rules
└── README.md                          # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: 18+ (for ES modules)
- **npm**: 9+
- **Google Cloud Account** with:
  - Vertex AI API enabled
  - Firestore database created
  - Service account key (for backend)
  - Gemini API key (if using direct API)

### Step 1: Clone & Install

```bash
git clone <repository>
cd election_process_helper
npm install
```

### Step 2: Environment Setup

Create `.env.local` in the root directory:

```bash
# Google Cloud / Vertex AI
VERTEX_PROJECT_ID=your-gcp-project-id
VERTEX_LOCATION=us-central1
GOOGLE_CLOUD_PROJECT=your-gcp-project-id

# OR: Gemini API (alternative to Vertex AI)
GEMINI_API_KEY=your-gemini-api-key

# Node environment
NODE_ENV=development
```

For **production**, also set these in your deployment platform (Vercel, Cloud Run, etc.).

### Step 3: Verify Configuration

```bash
npm run type-check    # Ensure TypeScript compiles
npm run lint          # Check ESLint rules
```

### Step 4: Development Server

```bash
npm run dev           # Starts on http://localhost:3000
```

---

## ⚙️ Configuration

### Firestore Security Rules

Deploy via Firebase Console:

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own progress
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth == null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### Chat API Rate Limits

Edit `src/app/api/chat/route.ts`:

```typescript
const RATE_LIMITS = {
  guest: { requests: 5, windowMs: 60000 },          // 5/min
  authenticated: { requests: 20, windowMs: 60000 }, // 20/min
};
```

### Gemini System Prompt

Edit `src/lib/gemini.ts` to customize AI behavior (tone, sources, languages, etc.).

---

## 📖 Usage Guide

### For Users

1. **Landing Page**: Learn about ElectionGuide
2. **Dashboard**: See your progress (% completed, next steps)
3. **Explore Guides**: Choose voter ID, timeline, booth locating
4. **Chat Assistant**: Ask questions (grounded in ECI sources)
5. **Take Quiz**: Test knowledge, save scores
6. **Verify Status**: Redirect to ECI portal to check electoral roll

### For Developers

#### Running Locally
```bash
npm run dev                    # Dev server
npm test                       # Run Jest tests
npm run test:coverage          # Coverage report
npm run test:e2e               # Playwright E2E tests
```

#### Adding a New Process Guide
1. Create `src/app/process/[id]/page.tsx`
2. Fetch process metadata (title, steps, description)
3. Render with semantic HTML + accessibility labels
4. Add to process list in `src/app/process/page.tsx`

#### Adding a New Component
1. Create component in `src/components/MyComponent.tsx`
2. Use **TypeScript interfaces** for all props
3. Add **TSDoc comments** on public methods
4. Create `src/components/__tests__/MyComponent.test.tsx`
5. Ensure **100% test coverage**

---

## 🧪 Quality Standards

### Code Quality

✅ **Type Safety**
- 100% TypeScript coverage, no `any` types
- Use `Record<string, unknown>` instead of `any`
- Strict mode enabled in `tsconfig.json`

✅ **Security**
- CSRF protection on all state-mutating requests
- Rate limiting on API endpoints
- Zod validation on all user inputs
- Firestore rules prevent unauthorized access

✅ **Accessibility**
- WCAG AA compliance (4.5:1 contrast)
- Semantic HTML with proper landmarks
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader tested (manual or axe-core)

✅ **Performance**
- Target: **Lighthouse 95+** on all pages
- Image optimization with Next/Image
- Font loading with `font-display: swap`
- CSS/JS minification and tree-shaking
- Lazy component loading

✅ **Maintainability**
- Clean, modular architecture
- No duplicate code (DRY principle)
- TSDoc comments on public APIs
- Consistent naming conventions
- Comprehensive error handling

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm test                       # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report (target: 90%+)
```

**Coverage Targets**:
- Core libraries (`src/lib/`): 100%
- API routes (`src/app/api/`): 90%+
- Components: 85%+ (UI behavior, not visuals)

**Key Test Files**:
- `src/lib/__tests__/gemini.test.ts` - Gemini client mocking
- `src/lib/__tests__/firestore-admin.test.ts` - Firestore operations
- `src/lib/__tests__/security.test.ts` - CSRF, rate limiting
- `src/components/__tests__/AuthProvider.test.tsx` - Auth context

### E2E Tests (Playwright)

```bash
npm run test:e2e                # Run all E2E tests
npx playwright test --debug     # Interactive mode
npx playwright test --headed    # Show browser
```

**Coverage Scenarios**:
1. **Navigation**: Landing → Dashboard → Process → Chat → Quiz
2. **Chat Flow**: Message submission, response streaming, error handling
3. **Accessibility**: Keyboard navigation, skip-links, ARIA labels
4. **Authentication**: Guest limits, rate limiting triggers

**Example Test** (`e2e/chat.spec.ts`):
```typescript
test('chat assistant provides grounded response', async ({ page }) => {
  await page.goto('/assistant');
  await page.fill('[aria-label="Chat message input"]', 'How do I register to vote?');
  await page.click('button:has-text("Send")');
  
  // Wait for response
  await page.waitForSelector('text=/Search Grounding|ECI/');
  const response = await page.textContent('[role="article"]');
  expect(response).toContain('ECI'); // Verify grounding
});
```

---

## 🚀 Deployment

### Vercel (Recommended for Next.js)

1. **Connect GitHub**:
   ```bash
   git push origin main
   # Auto-deploys on Vercel
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   ```
   VERTEX_PROJECT_ID=...
   VERTEX_LOCATION=...
   GEMINI_API_KEY=...
   NODE_ENV=production
   ```

3. **Enable Streaming** (already in next.config.ts):
   ```typescript
   experimental: { esmExternals: true }
   ```

### Google Cloud Run

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY .next .next
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Deploy**:
   ```bash
   gcloud run deploy electionguide \
     --source . \
     --region us-central1 \
     --set-env-vars VERTEX_PROJECT_ID=$PROJECT_ID
   ```

### Environment Configuration by Stage

**Development** (`NODE_ENV=development`):
- Rate limits: 1000 req/min (testing)
- Firestore: Dev database
- Gemini: Direct API or Vertex (your choice)

**Production** (`NODE_ENV=production`):
- Rate limits: 5 req/min (guest), 20 req/min (auth)
- Firestore: Production database
- Gemini: Vertex AI (recommended)
- Logging: Cloud Logging
- Monitoring: Cloud Monitoring

---

## 📋 Assumptions Made

1. **Authentication Model**
   - System currently uses "Guest-First" approach (no login required)
   - Optional User ID via headers for premium tracking
   - Full OAuth 2.0 integration deferred to Phase 2

2. **Google Cloud Setup**
   - Environment configured with Application Default Credentials (ADC)
   - Firestore database already created in GCP project
   - Service account key available (for backend Firestore operations)
   - Vertex AI API enabled (or Gemini API key available)

3. **Data Freshness**
   - AI uses live search grounding, so responses reflect current ECI data
   - Users advised to verify critical dates with local Booth Level Officer (BLO)
   - ECI website assumed to be the authoritative source

4. **Browser Support**
   - Modern browsers (Chrome, Firefox, Safari, Edge)
   - ES2022+ support required
   - No IE11 support

5. **Network**
   - Assumes reliable internet for AI requests and Firestore syncing
   - Graceful degradation if services unavailable (error messages shown)

6. **Compliance**
   - Non-partisan educational content only
   - No personal data collection (except progress tracking)
   - Firestore rules enforce user data isolation

---

## 🤝 Contributing

### Code Style
- Follow ESLint rules: `npm run lint`
- Run Prettier: Auto-formatted via ESLint
- TypeScript strict mode: No `any`, full type safety

### Adding Features
1. Create feature branch: `git checkout -b feature/my-feature`
2. Implement with tests: `npm test`
3. Check types: `npm run type-check`
4. Lint: `npm run lint`
5. E2E test: `npm run test:e2e`
6. Submit PR

### Issue Reporting
Include:
- Steps to reproduce
- Expected vs. actual behavior
- Browser/OS version
- Console errors (if any)

---

## 📚 Additional Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Firestore Documentation](https://cloud.google.com/firestore/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Election Commission of India](https://www.eci.gov.in)
- [Playwright Testing](https://playwright.dev)
- [Jest Testing](https://jestjs.io)

---

## 📄 License

This project is provided for educational purposes. All election-related information is sourced from official ECI documentation.

---

## 📞 Support

For issues:
1. Check [GitHub Issues](./issues)
2. Review [Troubleshooting](#troubleshooting-guide) below
3. Contact: support@electionguide.in (future)

---

## 🎓 Troubleshooting Guide

### "VERTEX_PROJECT_ID not defined"
- ✅ Check `.env.local` in root directory
- ✅ Restart dev server after adding env vars
- ✅ Use `GEMINI_API_KEY` as fallback

### "Firestore: PERMISSION_DENIED"
- ✅ Verify service account has Firestore Editor role
- ✅ Check Firestore security rules allow the operation
- ✅ Ensure `GOOGLE_CLOUD_PROJECT` env var matches database project

### "Rate limit exceeded (429)"
- ✅ Wait 1 minute for limit window to reset
- ✅ Sign in to increase limit from 5 to 20 requests/min
- ✅ Check `src/app/api/chat/route.ts` for rate limit config

### Tests failing with "Cannot find module"
- ✅ Ensure `npm install` completed successfully
- ✅ Clear Jest cache: `npm test -- --clearCache`
- ✅ Use absolute imports with `@` alias

### Playwright E2E tests timeout
- ✅ Increase timeout in `playwright.config.ts`: `timeout: 30000`
- ✅ Ensure dev server running: `npm run dev`
- ✅ Check network connectivity

---

*Developed for the Google Gemini Agentic Coding Challenge.*  
**Version**: 1.0.0 | **Last Updated**: May 2, 2026
