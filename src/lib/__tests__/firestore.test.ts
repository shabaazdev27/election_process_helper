import { db, auth, app, analytics } from '../firestore';

describe('Firestore Mock', () => {
  it('should export db object', () => {
    expect(db).toBeDefined();
  });

  it('should export auth object', () => {
    expect(auth).toBeDefined();
  });

  it('should export app object', () => {
    expect(app).toBeDefined();
  });

  it('should export null analytics', () => {
    expect(analytics).toBeNull();
  });
});
