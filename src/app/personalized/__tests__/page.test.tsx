/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', displayName: 'Test User' },
  }),
}));

jest.mock('@/lib/db-actions', () => ({
  saveUserPreferencesAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

import PersonalizedPage from '../page';
import { saveUserPreferencesAction } from '@/lib/db-actions';

describe('Personalized Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location.href
    delete (window as unknown as { location: unknown }).location;
    window.location = { href: '' } as Location & string;
  });

  describe('Step 1: State Selection', () => {
    it('should render state selection step', () => {
      render(<PersonalizedPage />);
      
      expect(screen.getByText('Which state do you live in?')).toBeInTheDocument();
      expect(screen.getByText('Maharashtra')).toBeInTheDocument();
      expect(screen.getByText('Delhi')).toBeInTheDocument();
    });

    it('should allow selecting a state', () => {
      render(<PersonalizedPage />);
      
      const maharashtraBtn = screen.getByText('Maharashtra');
      fireEvent.click(maharashtraBtn);
      
      expect(maharashtraBtn).toHaveClass('bg-primary');
    });

    it('should disable continue button when no state selected', () => {
      render(<PersonalizedPage />);
      
      const continueBtn = screen.getByText('Continue');
      expect(continueBtn).toBeDisabled();
    });

    it('should enable continue button when state selected', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      
      const continueBtn = screen.getByText('Continue');
      expect(continueBtn).toBeEnabled();
    });

    it('should navigate to step 2 on continue', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      
      expect(screen.getByText('Preferred Language?')).toBeInTheDocument();
    });
  });

  describe('Step 2: Language Selection', () => {
    it('should render language selection step', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      
      expect(screen.getByText('Preferred Language?')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Hindi')).toBeInTheDocument();
    });

    it('should allow selecting a language', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      
      const englishBtn = screen.getByText('English');
      fireEvent.click(englishBtn);
      
      expect(englishBtn).toHaveClass('bg-primary');
    });

    it('should have back button in step 2', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      
      const backBtn = screen.getByText('Back');
      expect(backBtn).toBeEnabled();
    });

    it('should go back to step 1', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('Back'));
      
      expect(screen.getByText('Which state do you live in?')).toBeInTheDocument();
    });
  });

  describe('Step 3: Interests Selection', () => {
    it('should render interests selection step', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('English'));
      fireEvent.click(screen.getByText('Continue'));
      
      expect(screen.getByText('What are you looking for?')).toBeInTheDocument();
      expect(screen.getByText('New Registration')).toBeInTheDocument();
    });

    it('should allow selecting multiple interests', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('English'));
      fireEvent.click(screen.getByText('Continue'));
      
      fireEvent.click(screen.getByText('New Registration'));
      fireEvent.click(screen.getByText('Voter ID Correction'));
      
      expect(screen.getAllByText('New Registration')[0]).toHaveClass('bg-primary');
      expect(screen.getAllByText('Voter ID Correction')[0]).toHaveClass('bg-primary');
    });

    it('should disable continue without interests selected', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('English'));
      fireEvent.click(screen.getByText('Continue'));
      
      const continueBtn = screen.getByText('Continue');
      expect(continueBtn).toBeDisabled();
    });

    it('should enable continue with at least one interest', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('English'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('New Registration'));
      
      const continueBtn = screen.getByText('Continue');
      expect(continueBtn).toBeEnabled();
    });
  });

  describe('Step 4: Ready Screen', () => {
    it('should show ready screen on completion', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('English'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('New Registration'));
      fireEvent.click(screen.getByText('Continue'));
      
      expect(screen.getByText('Your Path is Ready!')).toBeInTheDocument();
      expect(screen.getByText(/customized your dashboard with guides and timelines specifically for Maharashtra/)).toBeInTheDocument();
    });

    it('should have dashboard button on ready screen', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('English'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('New Registration'));
      fireEvent.click(screen.getByText('Continue'));
      
      const dashboardBtn = screen.getByText('Go to My Dashboard');
      expect(dashboardBtn).toBeInTheDocument();
    });

    it('should save preferences and navigate on dashboard click', async () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('English'));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.click(screen.getByText('New Registration'));
      fireEvent.click(screen.getByText('Continue'));
      
      const dashboardBtn = screen.getByText('Go to My Dashboard');
      fireEvent.click(dashboardBtn);
      
      await waitFor(() => {
        expect(saveUserPreferencesAction).toHaveBeenCalledWith(
          'test-user-123',
          expect.objectContaining({
            state: 'Maharashtra',
            language: 'English',
            interests: expect.arrayContaining(['New Registration'])
          })
        );
      });
    });
  });

  describe('Progress Bar', () => {
    it('should show progress indicator', () => {
      render(<PersonalizedPage />);
      
      const steps = screen.getAllByText(/State|Language|Interests|Ready/);
      expect(steps.length).toBeGreaterThan(0);
    });

    it('should update progress on step change', () => {
      render(<PersonalizedPage />);
      
      fireEvent.click(screen.getByText('Maharashtra'));
      fireEvent.click(screen.getByText('Continue'));
      
      expect(screen.getByText('Preferred Language?')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading', () => {
      render(<PersonalizedPage />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create Your Voter Path');
    });

    it('should have accessible buttons', () => {
      render(<PersonalizedPage />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
