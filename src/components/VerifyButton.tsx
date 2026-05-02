'use client';

import { useState } from 'react';
import { ExternalLink, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VerifyButtonProps {
  /**
   * State abbreviation for portal routing (e.g., 'TN', 'MH', 'DL')
   * Determines which ECI portal URL to redirect to
   */
  state?: string;
  /**
   * Callback when verification button is clicked
   * Called before guidance modal is shown
   */
  onVerify?: () => void;
  /**
   * Custom label for the button
   * @default 'Verify on Official ECI Portal'
   */
  label?: string;
  /**
   * Whether button should be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ECI Portal URL mapping for different states
 * Links to official Election Commission of India state-specific portals
 */
const ECI_PORTAL_URLS: Record<string, string> = {
  TN: 'https://elections.tn.gov.in',
  MH: 'https://mahavotes.eci.gov.in',
  DL: 'https://voters.eci.gov.in',
  DEFAULT: 'https://voters.eci.gov.in', // National electoral roll portal
};

/**
 * VerifyButton - ECI portal redirect button with built-in guidance overlay
 *
 * Displays a button that, when clicked, shows a contextual guidance modal
 * explaining how to use the Part Number to search the electoral roll.
 * After acknowledging the guidance, redirects to the appropriate ECI state portal.
 *
 * @param {VerifyButtonProps} props - Component props
 * @returns {JSX.Element} The rendered button with modal
 *
 * @example
 * ```tsx
 * <VerifyButton state="TN" />
 * <VerifyButton state="MH" label="Check Electoral Roll" />
 * <VerifyButton state="DL" onVerify={() => console.log('Redirecting...')} />
 * ```
 */
const VerifyButton: React.FC<VerifyButtonProps> = ({
  state = 'DEFAULT',
  onVerify,
  label = 'Verify on Official ECI Portal',
  disabled = false,
  className = '',
}) => {
  const [showGuidance, setShowGuidance] = useState(false);

  const handleVerifyClick = () => {
    onVerify?.();
    setShowGuidance(true);
  };

  const handleRedirect = () => {
    const portalUrl = ECI_PORTAL_URLS[state] || ECI_PORTAL_URLS.DEFAULT;
    setShowGuidance(false);
    window.open(portalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setShowGuidance(false);
  };

  return (
    <>
      <button
        onClick={handleVerifyClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
        aria-label={label}
      >
        <span>{label}</span>
        <ExternalLink className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {showGuidance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-bold font-poppins text-foreground">
                    Before Redirecting
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-foreground/70 leading-relaxed">
                  You&apos;re about to be redirected to the official ECI portal. Please have the
                  following information ready:
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                        1
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-blue-900">Part Number</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Found in Step 2 of your voter registration process. It&apos;s your unique
                          identifier in the electoral system.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                        2
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-blue-900">Your State</p>
                        <p className="text-xs text-blue-700 mt-1">
                          The state where you are registered to vote.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-600 text-white text-xs">
                      ✓
                    </span>
                    Data Verification
                  </p>
                  <p className="text-xs text-emerald-800">
                    The ECI portal uses live, real-time data directly from official government
                    sources. Your verification there is the authoritative record.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-border bg-neutral-50">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedirect}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Continue to ECI Portal
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VerifyButton;
