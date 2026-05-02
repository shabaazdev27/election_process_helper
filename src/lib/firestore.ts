/**
 * Mock Firestore client for frontend.
 * Since we removed the Firebase client configuration, we handle data via API routes
 * or local session storage to avoid initialization errors.
 */
export const db = {} as unknown;
export const auth = {} as unknown;
export const app = {} as unknown;
export const analytics = null;
