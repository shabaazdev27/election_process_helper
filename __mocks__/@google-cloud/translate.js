/**
 * Mock for @google-cloud/translate
 * Used for testing server-side translation functionality
 */

// Create jest mocks with more specific responses
const mockTranslate = jest.fn().mockImplementation((text) => {
  // Return translated text as array (matching Google API format)
  return Promise.resolve([`${text} (translated)`]);
});

const mockDetect = jest.fn().mockImplementation((text) => {
  // Detect language based on text content
  if (text.includes('नमस्ते') || text.includes('हिंदी')) {
    return Promise.resolve([{ language: 'hi' }]);
  }
  return Promise.resolve([{ language: 'en' }]);
});

const mockTranslateConstructor = jest.fn(function() {
  return {
    translate: mockTranslate,
    detect: mockDetect,
  };
});

module.exports = {
  __esModule: true,
  Translate: {
    v2: {
      Translate: mockTranslateConstructor,
    },
  },
  v2: {
    Translate: mockTranslateConstructor,
  },
};

