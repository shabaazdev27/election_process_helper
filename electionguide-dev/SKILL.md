---
name: electionguide-dev
description: "Comprehensive development assistant for ElectionGuide, an AI-powered election education platform. Use this skill whenever building features, fixing bugs, implementing security measures, or ensuring 100% code quality compliance. Specifically use when: writing React/Next.js components with TypeScript, implementing authentication and guest experiences, integrating Google Gemini and Firestore services, creating Jest unit tests or Playwright E2E tests, ensuring WCAG accessibility standards, optimizing Lighthouse performance scores (95+), or implementing security rules and rate limiting. Always apply quality standards: type safety, security validation, accessibility compliance, comprehensive testing, and performance optimization."
---

# ElectionGuide Development Assistant

A comprehensive skill for building and maintaining ElectionGuide, ensuring 100% compliance with code quality, security, efficiency, testing, and accessibility standards.

## Project Context

**ElectionGuide** is a premium, AI-powered platform for election education built with:
- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + Framer Motion 12
- **AI**: Google Gemini 2.5 Flash (Vertex AI) + Search Grounding
- **Backend**: Google Cloud Native (Firestore, Cloud Functions)
- **Quality**: Jest 30 (unit), Playwright 1.59 (E2E), Lighthouse (95+ target)
- **Architecture**: Modular components, API routes, type-safe state (Zustand)

## Core Principles

When working on ElectionGuide, always maintain:

1. **100% Type Safety** - Use TypeScript strictly. No `any` types. Validate all props with interfaces. Use `Record<string, unknown>` instead of `any`.
2. **Security First** - Validate inputs with Zod, implement CSRF protection (header + cookie), add IP-based rate limiting, ensure Firestore Security Rules.
3. **Accessibility** - Follow WCAG standards: semantic HTML, proper contrast (4.5:1), keyboard navigation (skip-links), ARIA labels.
4. **Comprehensive Testing** - Unit tests (Jest) for all logic, E2E tests (Playwright) for critical user flows. Target 100% coverage for core utilities.
5. **Performance** - Optimize images, use `font-display: swap`, lazy load components, target 95+ Lighthouse score.
6. **Google Services Integration** - Use Gemini with search grounding for answers citing ECI sources, Native Firestore SDK for backend operations.

## Feature Areas

### 1. Authentication & Guest Experience

**Context**: Users are treated as guests by default (limited to 5 messages/min). `AuthProvider.tsx` manages state.

**When implementing**:
- Use `isGuest` and `isPremium` states in AuthProvider
- Implement message limits and rate limiting in `api/chat/route.ts`
- Use Native Google Cloud SDKs (`@google-cloud/firestore`) instead of legacy Firebase Web SDKs.
- Type all auth context with TypeScript interfaces

### 2. AI Assistant with Search Grounding

**Context**: `api/chat/route.ts` handles Gemini integration. The assistant must cite ECI sources (voters.eci.gov.in, eci.gov.in).

**When implementing**:
- Use Google Gemini 2.5 Flash with search grounding enabled
- Configure `tools: [{ googleSearch: {} }]` in the chat session
- Explicitly cite ECI URLs and source names in responses
- Validate prompt construction with `createGroundedPrompt`
- **Security**: Implement CSRF protection using `x-csrf-token` headers and `csrf_token` cookies.

### 3. React Components & Pages

**When building components**:
- All components must be fully typed with TypeScript
- Use functional components with hooks
- Implement Framer Motion for premium animations
- Use semantic HTML (`<main>`, `<nav>`, `<section>`, `<h1>`-`<h6>`)
- Include ARIA labels and `aria-live` for dynamic content
- **Responsive Design**: Implement mobile-first layouts. Use a premium mobile menu (hamburger menu with animations) for navigation on smaller viewports (below `md` breakpoint). Ensure all interactive elements are reachable on mobile.

### 4. Testing Strategy

#### Unit Tests (Jest)

**Location**: `src/lib/__tests__/` or adjacent to file.

**Best Practices**:
- Use ES modules (`import`/`export`) for all code and tests.
- Mock external dependencies (`@google-cloud/firestore`, `@google/genai`).
- **CAUTION**: Avoid global mocks in `jest.setup.js` for core libraries if they are being unit-tested themselves. Use local mocks within test files for better isolation.

#### E2E Tests (Playwright)

**Location**: `e2e/`

**Flows to cover**:
1. **Complete Journey**: Landing → Process Guide → Assistant → Dashboard.
2. **Guest Limits**: Verify rate limiting and upsell prompts.
3. **Accessibility**: Verify skip-links, ARIA labels, and mobile responsiveness.
4. **Strict Mode**: Use specific locators (e.g., `getByRole('link', { name: 'Specific Text' })`) to avoid strict mode violations.

### 5. Backend & Database

**SDK**: Use `@google-cloud/firestore` (Native SDK).
**Modularity**: `src/lib/firestore-admin.ts` provides a unified interface.
**Types**: Export proper interfaces for all database documents.

## Workflow Checklist

### Before Coding
- [ ] Define TypeScript interfaces
- [ ] Plan accessibility (ARIA, Semantic HTML)
- [ ] Identify security requirements (CSRF, Rate Limiting)

### During Development
- [ ] Write logic as ES modules
- [ ] Use Zod for input validation
- [ ] Target Lighthouse 95+ performance

### Before Pushing
- [ ] Run `npm run lint`
- [ ] Run `npm test` (Jest)
- [ ] Run `npm run test:e2e` (Playwright)
- [ ] Verify accessibility with Axe or manual Tab navigation

## Quality Gates

- **Type Safety**: Zero TypeScript errors (`npm run type-check`)
- **Testing**: All Jest and Playwright tests pass
- **Security**: CSRF and Rate Limiting verified in API routes
- **Performance**: Lighthouse 95+ on all pages

---

## Summary

This skill enforces 100% compliance with:
- ✅ **Code Quality**: TypeScript 5, ES Modules, Modular Architecture
- ✅ **Security**: CSRF Protection, IP Rate Limiting, Zod Validation
- ✅ **Testing**: Jest 30 + Playwright 1.59 (No Cypress)
- ✅ **Accessibility**: WCAG AA, Semantic HTML, Skip-links
- ✅ **Google Services**: Gemini 2.5 Flash + Search Grounding, Native Firestore
