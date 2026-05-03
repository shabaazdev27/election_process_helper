'use client';

import React, { useState, useCallback, Suspense, lazy } from 'react';
import { MapPin, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import {
  getUserGeolocation,
  findNearbyBooths,
  searchBooths,
  getAvailableStates,
} from '@/lib/maps';
import type { PollingBooth, GeolocationData } from '@/types';

// Lazy load heavy components for better performance
const BoothMap = lazy(() => import('@/components/BoothMap').then(mod => ({ default: mod.BoothMap })));
const BoothCard = lazy(() => import('@/components/BoothCard').then(mod => ({ default: mod.BoothCard })));

/**
 * Booth Finder Page
 * - Request user's geolocation
 * - Find nearby polling booths
 * - Display map and booth cards
 * - Support manual search
 */
// Helper function for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
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

export default function BoothFinderPage() {
  const [userLocation, setUserLocation] = useState<GeolocationData | null>(null);
  const [booths, setBooths] = useState<
    Array<PollingBooth & { distanceKm: number }>
  >([]);
  const [filteredBooths, setFilteredBooths] = useState<
    Array<PollingBooth & { distanceKm: number }>
  >([]);
  const [selectedState, setSelectedState] = useState('TN');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableStates, setAvailableStates] = useState<
    Array<{ code: string; name: string }>
  >([]);

  // Load available states on mount
  React.useEffect(() => {
    getAvailableStates().then(setAvailableStates);
  }, []);

  // Request geolocation and find nearby booths
  const handleGetLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await getUserGeolocation();
      setUserLocation(location);

      const nearbyBooths = await findNearbyBooths(
        location.latitude,
        location.longitude,
        selectedState,
        5, // 5 km radius
        5 // limit to 5 booths
      );

      setBooths(nearbyBooths);
      setFilteredBooths(nearbyBooths);
      setSearchQuery('');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
      console.error('Geolocation error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedState]);

  // Handle search query changes
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setFilteredBooths(booths);
        return;
      }

      const results = await searchBooths(query, selectedState);
      setFilteredBooths(
        results.map((booth) => ({
          ...booth,
          distanceKm:
            userLocation && booth.latitude && booth.longitude
              ? calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  booth.latitude,
                  booth.longitude
                )
              : 0,
        }))
      );
    },
    [booths, selectedState, userLocation]
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Find Your Polling Booth
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Locate your assigned polling booth and get directions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            {/* State Selector */}
            <div>
              <label htmlFor="state-selector" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Select State
              </label>
              <select
                id="state-selector"
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setBooths([]);
                  setFilteredBooths([]);
                }}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {availableStates.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Button */}
            <div className="flex items-end">
              <button
                onClick={handleGetLocation}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-slate-400 dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-slate-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Use My Location
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex gap-3 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {error}
                </p>
                <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                  You can still search for a booth manually below.
                </p>
              </div>
            </div>
          )}

          {/* Search Box */}
          {booths.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Search Booths
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by booth number, name, or address&hellip;"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              />
            </div>
          )}
        </div>

        {/* Map (if location available) */}
        {userLocation && booths.length > 0 && (
          <div className="mb-8">
            <Suspense fallback={
              <div className="flex h-96 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            }>
              <BoothMap
                booths={filteredBooths}
                userLatitude={userLocation.latitude}
                userLongitude={userLocation.longitude}
              />
            </Suspense>
          </div>
        )}

        {/* Booths List */}
        <div className="space-y-4">
          {filteredBooths.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {searchQuery
                    ? `Search Results (${filteredBooths.length})`
                    : `Nearby Polling Booths (${filteredBooths.length})`}
                </h2>
                {userLocation && !searchQuery && (
                  <button
                    onClick={handleGetLocation}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                )}
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              }>
                {filteredBooths.map((booth) => (
                  <BoothCard
                    key={booth.id}
                    booth={booth}
                    userLatitude={userLocation?.latitude}
                    userLongitude={userLocation?.longitude}
                  />
                ))}
              </Suspense>
            </>
          ) : booths.length === 0 && userLocation ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">
                No polling booths found within 5 km. Try searching manually or
                enable location permission.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">
                Click &quot;Use My Location&quot; above to find nearby polling booths.
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <h2 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
            📋 What to Bring to Your Polling Booth
          </h2>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>✓ Valid photo ID (EPIC, Passport, Aadhar, etc.)</li>
            <li>✓ Know your polling booth number (from your voter ID)</li>
            <li>✓ Check booth amenities for accessibility requirements</li>
            <li>✓ Allow extra time for queues on election day</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
