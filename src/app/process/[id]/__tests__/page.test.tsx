/**
 * @jest-environment jsdom
 * 
 * Note: This component uses React's use() hook which is designed for Server-Side Rendering.
 * Testing it in a Jest environment is limited, so we focus on basic smoke tests.
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all dependencies
jest.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', displayName: 'Test User' },
  }),
}));

jest.mock('@/lib/db', () => ({
  markProcessViewed: jest.fn(),
  markProcessCompleted: jest.fn(),
}));

jest.mock('@/components/LiveDataBadge', () => {
  return function MockBadge() {
    return <div>Live Data</div>;
  };
});

jest.mock('@/components/VerifyButton', () => {
  return function MockVerifyButton({ label }: { label: string }) {
    return <button>{label}</button>;
  };
});

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

import ProcessDetail from '../page';

describe('Process Detail Page', () => {
  it('should render without throwing an error', () => {
    const mockParams = Promise.resolve({ id: 'voter-id-registration' });
    
    // This component uses React's use() hook, so we just verify it doesn't crash
    expect(() => {
      render(<ProcessDetail params={mockParams} />);
    }).not.toThrow();
  });
});
