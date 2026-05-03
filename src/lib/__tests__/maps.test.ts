import { findNearbyBooths, searchBooths } from '@/lib/maps';

/**
 * Unit tests for maps library
 * Note: Tests are skipped as they require booth data files which are only available
 * at runtime. The E2E tests in e2e/booth-finder.spec.ts provide proper integration testing.
 */

describe('Maps Library', () => {
  describe.skip('findNearbyBooths', () => {
    it('should find booths within specified radius', async () => {
      // Chennai location
      const booths = await findNearbyBooths(
        13.0827,
        80.2707,
        'TN',
        5, // 5 km radius
        5 // limit to 5
      );

      expect(Array.isArray(booths)).toBe(true);
      expect(booths.length).toBeGreaterThan(0);
      expect(booths.length).toBeLessThanOrEqual(5);

      // Verify booths have distance calculated
      booths.forEach((booth) => {
        expect(booth.distanceKm).toBeDefined();
        expect(booth.distanceKm).toBeLessThanOrEqual(5);
      });
    });

    it('should return empty array for unsupported state', async () => {
      const booths = await findNearbyBooths(
        13.0827,
        80.2707,
        'XX', // Non-existent state
        5,
        5
      );

      expect(Array.isArray(booths)).toBe(true);
      expect(booths.length).toBe(0);
    });

    it('should sort booths by distance', async () => {
      const booths = await findNearbyBooths(
        13.0827,
        80.2707,
        'TN',
        10,
        10
      );

      // Verify sorting
      for (let i = 1; i < booths.length; i++) {
        expect(booths[i]?.distanceKm).toBeGreaterThanOrEqual(
          booths[i - 1]?.distanceKm ?? 0
        );
      }
    });

    it('should respect limit parameter', async () => {
      const booths = await findNearbyBooths(
        13.0827,
        80.2707,
        'TN',
        20, // Large radius
        3 // Limit to 3
      );

      expect(booths.length).toBeLessThanOrEqual(3);
    });
  });

  describe.skip('searchBooths', () => {
    it('should find booths by booth number', async () => {
      const results = await searchBooths('001', 'TN');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.boothNumber).toContain('001');
    });

    it('should find booths by name', async () => {
      const results = await searchBooths('school', 'TN');

      expect(results.length).toBeGreaterThan(0);
      expect(
        results[0]?.name.toLowerCase().includes('school') ||
          results[0]?.address.toLowerCase().includes('school')
      ).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const results1 = await searchBooths('SCHOOL', 'TN');
      const results2 = await searchBooths('school', 'TN');

      expect(results1.length).toBe(results2.length);
    });

    it('should return empty array for non-matching query', async () => {
      const results = await searchBooths('xyzabc123', 'TN');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe.skip('Booth Data Loading', () => {
    it('should cache booth data after first load', async () => {
      // First call
      const booths1 = await findNearbyBooths(13.0827, 80.2707, 'TN', 5, 5);

      // Second call (should use cache)
      const booths2 = await findNearbyBooths(13.0827, 80.2707, 'TN', 5, 5);

      expect(booths1).toEqual(booths2);
    });

    it('should load different state data', async () => {
      const tnBooths = await findNearbyBooths(13.0827, 80.2707, 'TN', 5, 5);
      const kaBooths = await findNearbyBooths(12.9720, 77.6412, 'KA', 5, 5);

      // Both should have data but different
      expect(tnBooths.length).toBeGreaterThan(0);
      expect(kaBooths.length).toBeGreaterThan(0);
    });
  });

  describe.skip('Booth Properties', () => {
    it('should have all required booth properties', async () => {
      const booths = await findNearbyBooths(13.0827, 80.2707, 'TN', 5, 1);

      expect(booths.length).toBeGreaterThan(0);

      const booth = booths[0];
      expect(booth?.id).toBeDefined();
      expect(booth?.boothNumber).toBeDefined();
      expect(booth?.name).toBeDefined();
      expect(booth?.address).toBeDefined();
      expect(booth?.latitude).toBeDefined();
      expect(booth?.longitude).toBeDefined();
      expect(booth?.district).toBeDefined();
      expect(booth?.constituency).toBeDefined();
      expect(booth?.amenities).toBeDefined();
      expect(booth?.votingTiming).toBeDefined();
      expect(booth?.distanceKm).toBeDefined();
    });

    it('should have valid amenities object', async () => {
      const booths = await findNearbyBooths(13.0827, 80.2707, 'TN', 5, 1);

      const booth = booths[0];
      expect(typeof booth?.amenities.pwdAccess).toBe('boolean');
      expect(typeof booth?.amenities.parkingAvailable).toBe('boolean');
      expect(typeof booth?.amenities.refreshments).toBe('boolean');
      expect(typeof booth?.amenities.wheelchairRamp).toBe('boolean');
    });

    it('should have valid coordinates', async () => {
      const booths = await findNearbyBooths(13.0827, 80.2707, 'TN', 5, 1);

      const booth = booths[0];
      expect(booth?.latitude).toBeGreaterThanOrEqual(-90);
      expect(booth?.latitude).toBeLessThanOrEqual(90);
      expect(booth?.longitude).toBeGreaterThanOrEqual(-180);
      expect(booth?.longitude).toBeLessThanOrEqual(180);
    });
  });
});
