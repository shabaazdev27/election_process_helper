'use client';

import React from 'react';
import {
  MapPin,
  Navigation,
  Accessibility,
  Droplets,
  Users,
  Coffee,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { PollingBooth } from '@/types';
import { getDirectionsUrl } from '@/lib/maps';

interface BoothCardProps {
  booth: PollingBooth & { distanceKm?: number };
  userLatitude: number | undefined;
  userLongitude: number | undefined;
}

/**
 * BoothCard: Display polling booth information with amenities and directions
 */
export const BoothCard: React.FC<BoothCardProps> = ({
  booth,
  userLatitude,
  userLongitude,
}) => {
  const directionsUrl =
    userLatitude && userLongitude
      ? getDirectionsUrl(booth, userLatitude, userLongitude)
      : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {booth.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Booth #{booth.boothNumber}
          </p>
        </div>
        {booth.distanceKm !== undefined && (
          <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {booth.distanceKm.toFixed(1)} km
          </div>
        )}
      </div>

      {/* Address */}
      <div className="mb-3 flex gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {booth.address}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {booth.district} • {booth.constituency}
          </p>
        </div>
      </div>

      {/* Voting Time */}
      <div className="mb-3 flex gap-2 rounded-md bg-slate-50 p-2 dark:bg-slate-700/50">
        <Clock className="h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {booth.votingTiming}
        </span>
      </div>

      {/* Amenities */}
      <div className="mb-4">
        <p className="mb-2 text-sm font-semibold uppercase text-slate-700 dark:text-slate-300">
          Amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {booth.amenities.pwdAccess && (
            <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
              <Accessibility className="h-3 w-3" />
              <span>PwD Access</span>
            </div>
          )}
          {booth.amenities.wheelchairRamp && (
            <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
              <Users className="h-3 w-3" />
              <span>Accessible</span>
            </div>
          )}
          {booth.amenities.parkingAvailable && (
            <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
              <Droplets className="h-3 w-3" />
              <span>Parking</span>
            </div>
          )}
          {booth.amenities.refreshments && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-sm text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
              <Coffee className="h-3 w-3" />
              <span>Refreshments</span>
            </div>
          )}
        </div>
      </div>

      {/* Directions Button */}
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <Navigation className="h-4 w-4" />
          Get Directions
          <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
