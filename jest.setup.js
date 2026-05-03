// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

/**
 * Jest setup file for ElectionGuide
 * Initializes testing environment and global mocks
 */

// Fix for React 19 compatibility with testing-library
// React 19 moved act to react package instead of react-dom/test-utils
import { act as reactAct } from 'react';

// Patch react-dom/test-utils to use React's act
jest.mock('react-dom/test-utils', () => {
  const originalModule = jest.requireActual('react-dom/test-utils');
  return {
    ...originalModule,
    act: reactAct,
  };
});

// Also ensure React.act is available globally
if (typeof global.React === 'undefined') {
  global.React = {};
}
global.React.act = reactAct;

// Mock Google Cloud Pub/Sub
jest.mock('@google-cloud/pubsub', () => ({
  PubSub: jest.fn().mockImplementation(() => ({
    topic: jest.fn().mockReturnValue({
      publishMessage: jest.fn().mockResolvedValue('msg-123'),
      exists: jest.fn().mockResolvedValue([true]),
      create: jest.fn().mockResolvedValue([]),
      createSubscription: jest.fn().mockResolvedValue([]),
    }),
    subscription: jest.fn().mockReturnValue({
      exists: jest.fn().mockResolvedValue([true]),
      on: jest.fn(),
    }),
    getTopics: jest.fn().mockResolvedValue([[]]),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

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
