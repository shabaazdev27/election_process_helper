import { PollingBooth, GeolocationData } from '@/types';

/**
 * Maps client for booth finder functionality.
 * Uses mock booth data and browser Geolocation API (no API key required).
 */

// Cache for loaded booth data
const boothDataCache = new Map<string, PollingBooth[]>();

/**
 * Load booth data for a given state from mock JSON files
 */
export async function loadBoothData(stateCode: string): Promise<PollingBooth[]> {
  // Check cache first
  if (boothDataCache.has(stateCode)) {
    return boothDataCache.get(stateCode)!;
  }

  try {
    const response = await fetch(`/booth-data/${stateCode}.json`);
    if (!response.ok) {
      console.warn(`Booth data not found for state: ${stateCode}`);
      return [];
    }
    const data = await response.json();
    const booths = data.booths as PollingBooth[];
    boothDataCache.set(stateCode, booths);
    return booths;
  } catch (error) {
    console.error(`Error loading booth data for ${stateCode}:`, error);
    return [];
  }
}

/**
 * Request user's current geolocation
 * Requires permission granted by user
 */
export function getUserGeolocation(): Promise<GeolocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation API not supported in this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = new Date().toISOString();
        resolve({ latitude, longitude, accuracy, timestamp });
      },
      (error) => {
        let message = 'Failed to get geolocation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable it in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearest polling booths for given coordinates
 */
export async function findNearbyBooths(
  latitude: number,
  longitude: number,
  stateCode: string,
  radiusKm: number = 5,
  limit: number = 5
): Promise<Array<PollingBooth & { distanceKm: number }>> {
  const booths = await loadBoothData(stateCode);

  if (booths.length === 0) {
    return [];
  }

  // Calculate distance for each booth
  const boothsWithDistance = booths
    .map((booth) => ({
      ...booth,
      distanceKm: calculateDistance(
        latitude,
        longitude,
        booth.latitude,
        booth.longitude
      ),
    }))
    .filter((booth) => booth.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  return boothsWithDistance;
}

/**
 * Search for booth by booth number or name
 */
export async function searchBooths(
  query: string,
  stateCode: string
): Promise<PollingBooth[]> {
  const booths = await loadBoothData(stateCode);
  const lowerQuery = query.toLowerCase();

  return booths.filter(
    (booth) =>
      booth.boothNumber.toLowerCase().includes(lowerQuery) ||
      booth.name.toLowerCase().includes(lowerQuery) ||
      booth.address.toLowerCase().includes(lowerQuery) ||
      booth.constituency.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get directions URL for a booth (using fallback format)
 * In production, would use Google Maps Directions API
 */
export function getDirectionsUrl(
  booth: PollingBooth,
  userLat: number,
  userLon: number
): string {
  // Fallback format for generic maps URL
  return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${booth.latitude},${booth.longitude}&travelmode=walking`;
}

/**
 * Get all available states for booth finder
 */
export async function getAvailableStates(): Promise<
  Array<{ code: string; name: string }>
> {
  // In production, this would query a database or API
  // For now, return common states with mock data
  return [
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'MH', name: 'Maharashtra' },
    // Add more states as mock data becomes available
  ];
}
