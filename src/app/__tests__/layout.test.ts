/**
 * @jest-environment jsdom
 */
import { metadata, viewport } from '../layout';

describe('Root Layout', () => {
  describe('Metadata', () => {
    it('should have correct title', () => {
      expect(metadata.title).toBe('ElectionGuide India | Empowering Indian Voters');
    });

    it('should have descriptive metadata', () => {
      expect(metadata.description).toContain('Official guide for Indian election processes');
    });

    it('should have robots directive', () => {
      expect(metadata.robots).toBe('index, follow');
    });

    it('should have OpenGraph configuration', () => {
      expect(metadata.openGraph?.title).toBe('ElectionGuide India');
      // Type property exists in OpenGraph but TypeScript strict mode requires explicit check
      if (metadata.openGraph && 'type' in metadata.openGraph) {
        expect(metadata.openGraph.type).toBe('website');
      }
    });
  });

  describe('Viewport', () => {
    it('should configure responsive viewport', () => {
      expect(viewport.width).toBe('device-width');
      expect(viewport.initialScale).toBe(1);
      expect(viewport.maximumScale).toBe(5);
    });
  });
});
