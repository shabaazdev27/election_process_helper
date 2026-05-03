# AGENTS.md

This file helps coding agents work productively in this repository.

## Project Snapshot

- Stack: Next.js App Router, React 19, TypeScript strict mode, Tailwind CSS 4.
- Core feature: civic education flows plus AI chat grounded to official election sources.
- Backend/data: Next.js API routes and server actions with Firestore server SDK.

## Runbook Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Unit tests: `npm test`
- Coverage: `npm run test:coverage`
- E2E tests: `npm run test:e2e`
- Build: `npm run build`
- Start production build: `npm run start`

## Where To Change Things

- Routes/pages: `src/app/**`
- Chat API: `src/app/api/chat/route.ts`
- Shared UI components: `src/components/**`
- Data and AI libraries: `src/lib/**`
- Server actions: `src/lib/db-actions.ts`
- Types: `src/types/index.ts`
- Unit tests: `src/**/__tests__/**`
- E2E tests: `e2e/**`

## Architecture Rules To Preserve

- Keep Firestore access on the server side using `src/lib/firestore-admin.ts` and server actions.
- Do not introduce Firebase client initialization for app auth/data; frontend currently uses mock auth context and server-driven data paths.
- For chat changes, preserve request validation (Zod), CSRF protection, and rate limiting in `src/app/api/chat/route.ts`.
- Keep TypeScript strict and avoid `any` (ESLint enforces this).

## Testing Conventions

- Jest default environment is Node; component tests requiring DOM should declare jsdom explicitly (see `src/components/__tests__/AuthProvider.test.tsx`).
- `jest.setup.js` mocks `@google/genai` and `framer-motion`; keep this in mind when adding tests.
- Playwright runs against local `npm run dev` via `playwright.config.ts`.

## Known Pitfalls

- README mentions `npm run type-check`, but there is no `type-check` script in `package.json`.
- Chat endpoint CSRF checks are bypassed only in test/CI conditions; do not weaken this for production paths.
- Rate limit values differ by environment (high in non-production, strict in production).

## Preferred Workflow For Agents

1. Make minimal, scoped changes in the correct layer.
2. Run targeted tests first, then broader suite if needed.
3. Run lint before finalizing changes.
4. Update or add tests for behavior changes.

## Reference Docs (Link, Do Not Duplicate)

- Project overview and setup: [README.md](README.md)
- Implementation details and roadmap: [implementation_plan.md](implementation_plan.md)
