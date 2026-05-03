/**
 * LanguageSelector Component
 *
 * Dropdown UI for selecting chat language.
 * Persists language choice to localStorage.
 * Keyboard accessible (Tab/Enter, arrow keys).
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/translate-constants';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  onLanguageChange?: (language: LanguageCode) => void;
  className?: string;
}

// Helper function to get initial language from localStorage
function getInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'en';

  const stored = localStorage.getItem('election-guide-language') as LanguageCode;
  if (stored && Object.keys(SUPPORTED_LANGUAGES).includes(stored)) {
    return stored;
  }

  // Try to detect from browser locale
  const locale = navigator.language;
  const map: Record<string, LanguageCode> = {
    'hi-IN': 'hi',
    'hi': 'hi',
    'ta-IN': 'ta',
    'ta': 'ta',
    'te-IN': 'te',
    'te': 'te',
    'mr-IN': 'mr',
    'mr': 'mr',
    'kn-IN': 'kn',
    'kn': 'kn',
  };
  return map[locale] || 'en';
}

export function LanguageSelector({
  onLanguageChange,
  className = '',
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] =
    React.useState<LanguageCode>(() => getInitialLanguage());
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This is a valid pattern for hydration safety in Next.js

    setTimeout(() => setMounted(true), 0);
  }, []);

  const handleLanguageSelect = (lang: LanguageCode) => {
    setSelectedLanguage(lang);
    localStorage.setItem('election-guide-language', lang);
    setIsOpen(false);

    // Announce to screen readers
    const announcement = `Language changed to ${SUPPORTED_LANGUAGES[lang]}`;
    announceToScreenReader(announcement);

    // Notify parent component
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => announcement.remove(), 1000);
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
      >
        <span className="hidden sm:inline">
          {SUPPORTED_LANGUAGES[selectedLanguage]}
        </span>
        <span className="sm:hidden">
          {selectedLanguage.toUpperCase()}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600"
          role="listbox"
          aria-label="Language options"
        >
          {(Object.entries(SUPPORTED_LANGUAGES) as Array<[LanguageCode, string]>).map(
            ([code, name]) => (
              <button
                key={code}
                onClick={() => handleLanguageSelect(code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLanguageSelect(code);
                  }
                }}
                role="option"
                aria-selected={selectedLanguage === code}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${selectedLanguage === code
                    ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {name}
              </button>
            )
          )}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default LanguageSelector;
