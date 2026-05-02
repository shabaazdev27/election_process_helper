// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

/**
 * Jest setup file for ElectionGuide
 * Initializes testing environment and global mocks
 */



// Mock Google GenAI SDK
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    chats: {
      create: jest.fn().mockReturnValue({
        sendMessage: jest.fn(),
        sendMessageStream: jest.fn(),
      }),
    },
  })),
}))


import React from 'react';

// Mock Framer Motion to skip animations in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: (props) => React.createElement('div', props),
    section: (props) => React.createElement('section', props),
  },
  AnimatePresence: (props) => props.children,
}))

// Suppress console errors during tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
