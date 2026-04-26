'use client';

import { Zap } from 'lucide-react';

interface LiveDataBadgeProps {
  /**
   * Variant style for the badge
   * @default 'default'
   */
  variant?: 'default' | 'outline';
  /**
   * Additional CSS classes to apply
   */
  className?: string;
}

/**
 * LiveDataBadge - Displays a badge indicating real-time external data integration
 *
 * Shows "Live Status: External" to indicate that election data is sourced from external
 * official ECI (Election Commission of India) portals and is updated in real-time.
 *
 * @param {LiveDataBadgeProps} props - Component props
 * @returns {JSX.Element} The rendered badge
 *
 * @example
 * ```tsx
 * <LiveDataBadge />
 * <LiveDataBadge variant="outline" />
 * ```
 */
const LiveDataBadge: React.FC<LiveDataBadgeProps> = ({
  variant = 'default',
  className = '',
}) => {
  const baseStyles =
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors';

  const variantStyles = {
    default:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
    outline:
      'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      role="status"
      aria-label="Live status from external sources"
    >
      <Zap className="h-3.5 w-3.5 animate-pulse" />
      <span>Live Status: External</span>
    </div>
  );
};

export default LiveDataBadge;
