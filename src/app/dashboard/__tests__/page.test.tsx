/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../page';

// Mock components and modules
jest.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-123',
      displayName: 'Test User',
    },
  }),
}));

jest.mock('@/lib/db', () => ({
  getUserProgress: jest.fn(() =>
    Promise.resolve({
      userId: 'test-user-123',
      viewedProcesses: ['voter-id-registration'],
      completedProcesses: ['voter-id-registration', 'electoral-roll-check'],
      quizScores: [{ quizId: '1', score: 85, total: 100, timestamp: '2024-01-01T00:00:00Z' }],
      completionPercentage: 50,
      onboarded: true,
      preferences: { state: 'Maharashtra', language: 'English' },
    })
  ),
}));

jest.mock('@/components/LiveDataBadge', () => {
  return function MockBadge() {
    return <div data-testid="live-data-badge">Live Data Badge</div>;
  };
});

jest.mock('@/components/VerifyButton', () => {
  return function MockVerifyButton({ label, state }: { label: string; state: string }) {
    return (
      <button data-testid={`verify-button-${state}`} onClick={() => console.log('Verify clicked')}>
        {label}
      </button>
    );
  };
});

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <section {...props}>{children}</section>,
  },
}));

describe('Dashboard Page', () => {
  describe('Component Rendering', () => {
    it('should render the dashboard title', async () => {
      render(<Dashboard />);

      expect(screen.getByText('Voter Dashboard')).toBeInTheDocument();
    });

    it('should display welcome message for authenticated user', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Test User!/i)).toBeInTheDocument();
      });
    });

    it('should display search control', () => {
      render(<Dashboard />);

      const searchInput = screen.getByPlaceholderText(/Search elections/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Progress Section', () => {
    it('should display progress overview section', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Current Progress')).toBeInTheDocument();
      });
    });

    it('should display progress cards', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('EPIC Registration')).toBeInTheDocument();
        expect(screen.getByText('Electoral Roll Check')).toBeInTheDocument();
      });
    });
  });

  describe('Election Section', () => {
    it('should display election guides section', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Election Guides')).toBeInTheDocument();
      });
    });

    it('should display election list', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('General Elections (Lok Sabha)')).toBeInTheDocument();
        expect(screen.getByText('Maharashtra Assembly')).toBeInTheDocument();
      });
    });
  });

  describe('Verification', () => {
    it('should display verify voter status section', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Verify Your Voter Status')).toBeInTheDocument();
      });
    });
  });

  describe('User Profile', () => {
    it('should display profile card', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Your Profile')).toBeInTheDocument();
      });
    });

    it('should display completion rate', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Completion Rate')).toBeInTheDocument();
      });
    });
  });

  describe('AI Help', () => {
    it('should display need help section', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Need Help?')).toBeInTheDocument();
      });
    });

    it('should have link to chat', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        const chatLink = screen.getByRole('link', { name: /Start Chat/i });
        expect(chatLink).toHaveAttribute('href', '/assistant');
      });
    });
  });

  describe('Upcoming Deadlines', () => {
    it('should display upcoming deadlines section', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
      });
    });
  });
});
