'use client';

import React, { useMemo } from 'react';
import { PollingBooth } from '@/types';

interface BoothMapProps {
  booths: Array<PollingBooth & { distanceKm?: number }>;
  userLatitude?: number;
  userLongitude?: number;
}

/**
 * BoothMap: Simple map visualization of nearby polling booths
 * Uses a lightweight grid representation (no API key required)
 * In production, could integrate Leaflet or Mapbox for better visualization
 */
export const BoothMap: React.FC<BoothMapProps> = ({
  booths,
  userLatitude,
  userLongitude,
}) => {
  // Calculate bounds for all booths
  const bounds = useMemo(() => {
    if (booths.length === 0) return null;

    const lats = [
      userLatitude || booths[0]?.latitude || 0,
      ...booths.map((b) => b.latitude),
    ];
    const lons = [
      userLongitude || booths[0]?.longitude || 0,
      ...booths.map((b) => b.longitude),
    ];

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    };
  }, [booths, userLatitude, userLongitude]);

  if (!bounds) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No booths to display
        </p>
      </div>
    );
  }

  // Calculate SVG dimensions
  const aspect = (bounds.maxLon - bounds.minLon) / (bounds.maxLat - bounds.minLat);
  const svgHeight = 300;
  const svgWidth = svgHeight * aspect;

  const projectX = (lon: number) => {
    return ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * svgWidth;
  };

  const projectY = (lat: number) => {
    return (
      ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * svgHeight
    );
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
        Polling Booths Map
      </h3>

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="rounded border border-slate-200 bg-blue-50 dark:border-slate-600 dark:bg-slate-700/30"
      >
        {/* Grid */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

        {/* User location (if provided) */}
        {userLatitude && userLongitude && (
          <g>
            <circle
              cx={projectX(userLongitude)}
              cy={projectY(userLatitude)}
              r="6"
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="2"
            />
            <circle
              cx={projectX(userLongitude)}
              cy={projectY(userLatitude)}
              r="12"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
              opacity="0.3"
            />
          </g>
        )}

        {/* Booth markers */}
        {booths.map((booth, idx) => (
          <g key={booth.id}>
            <circle
              cx={projectX(booth.longitude)}
              cy={projectY(booth.latitude)}
              r="5"
              fill="#ef4444"
              stroke="#991b1b"
              strokeWidth="1.5"
            />
            <text
              x={projectX(booth.longitude)}
              y={projectY(booth.latitude) - 12}
              textAnchor="middle"
              fontSize="10"
              fill="#1f2937"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {idx + 1}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-slate-700 dark:text-slate-300">
            Your Location
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-slate-700 dark:text-slate-300">
            Polling Booths
          </span>
        </div>
      </div>

      {/* Info */}
      <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
        💡 Tap on a booth below for detailed information and directions.
      </p>
    </div>
  );
};
