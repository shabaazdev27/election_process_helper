# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Non-Obvious Patterns

**Firestore Initialization (Lazy Singleton)**
- `src/lib/firestore-admin.ts` uses lazy initialization pattern - Firestore instance created on first use, not at module load
- Returns `null` gracefully in test environment without throwing
- MUST use `getFirestore()` function, never instantiate directly

**Test Environment Detection**
- Chat API rate limits bypass: `IS_TEST` checks `NODE_ENV === 'test'` OR `PLAYWRIGHT_TEST_REMOTE_URL` OR `CI === 'true'`
- Production: 5 req/min (guest), 20 req/min (auth); Test/Dev: 100-1000 req/min
- CSRF protection bypassed only when `IS_TEST` is true - never weaken for production

**Jest Environment Quirks**
- Default environment is Node (not jsdom) - component tests MUST explicitly declare jsdom environment
- Example: `src/components/__tests__/AuthProvider.test.tsx` has `@jest-environment jsdom` comment
- `jest.setup.js` globally mocks `@google/genai` and `framer-motion` - all tests inherit these mocks

**ESLint Strict Rules**
- `@typescript-eslint/no-explicit-any` is set to "error" - use `Record<string, unknown>` or proper types
- Unused vars allowed only with `_` prefix (e.g., `_unusedParam`)

**Mock Auth Architecture**
- Frontend uses mock `AuthProvider` context - NO Firebase client SDK initialization
- Backend Firestore access ONLY via `src/lib/firestore-admin.ts` server-side
- Do not introduce client-side Firebase auth; system is server-driven

**Running Single Test**
- Jest: `npm test -- path/to/test.test.ts` or `npm test -- -t "test name pattern"`
- Playwright: `npx playwright test path/to/test.spec.ts` or `npx playwright test -g "test name"`

**Type-Check Script Missing**
- README references `npm run type-check` but script doesn't exist in package.json
- Use `npx tsc --noEmit` directly for type checking

## Reference Docs

- [README.md](README.md) - Setup and architecture overview
- [implementation_plan.md](implementation_plan.md) - Implementation roadmap
