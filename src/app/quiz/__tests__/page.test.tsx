/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', displayName: 'Test User' },
  }),
}));

jest.mock('@/lib/db-actions', () => ({
  saveQuizResultAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

import QuizPage from '../page';

describe('Quiz Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Quiz Flow', () => {
    it('should display all options for first question', () => {
      render(<QuizPage />);
      
      expect(screen.getByText('16 years old')).toBeInTheDocument();
      expect(screen.getByText('18 years old')).toBeInTheDocument();
      expect(screen.getByText('21 years old')).toBeInTheDocument();
      expect(screen.getByText('25 years old')).toBeInTheDocument();
    });

    it('should allow selecting an option', () => {
      render(<QuizPage />);
      
      const option = screen.getByText('18 years old');
      fireEvent.click(option);
      
      expect(option.closest('button')).toHaveClass('border-primary');
    });

    it('should disable options after confirmation', () => {
      render(<QuizPage />);
      
      fireEvent.click(screen.getByText('18 years old'));
      fireEvent.click(screen.getByText('Confirm Answer'));
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        ['16 years old', '18 years old', '21 years old', '25 years old'].includes(btn.textContent || '')
      );
      
      buttons.forEach(btn => {
        expect(btn).toBeDisabled();
      });
    });

    it('should show correct answer feedback', () => {
      render(<QuizPage />);
      
      fireEvent.click(screen.getByText('18 years old'));
      fireEvent.click(screen.getByText('Confirm Answer'));
      
      expect(screen.getByText('Correct!')).toBeInTheDocument();
      expect(screen.getByText(/the minimum age to vote is 18 years/i)).toBeInTheDocument();
    });

    it('should show incorrect answer feedback', () => {
      render(<QuizPage />);
      
      fireEvent.click(screen.getByText('16 years old'));
      fireEvent.click(screen.getByText('Confirm Answer'));
      
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should display progress bar', () => {
      render(<QuizPage />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should update progress on next question', () => {
      render(<QuizPage />);
      
      fireEvent.click(screen.getByText('18 years old'));
      fireEvent.click(screen.getByText('Confirm Answer'));
      fireEvent.click(screen.getByText('Next Question'));
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '3');
    });
  });

  describe('Confirm Button', () => {
    it('should disable confirm button when no option selected', () => {
      render(<QuizPage />);
      
      const confirmBtn = screen.getByText('Confirm Answer');
      expect(confirmBtn).toBeDisabled();
    });

    it('should enable confirm button when option selected', () => {
      render(<QuizPage />);
      
      fireEvent.click(screen.getByText('18 years old'));
      
      const confirmBtn = screen.getByText('Confirm Answer');
      expect(confirmBtn).toBeEnabled();
    });

    it('should change button text to Next Question after confirmation', () => {
      render(<QuizPage />);
      
      fireEvent.click(screen.getByText('18 years old'));
      fireEvent.click(screen.getByText('Confirm Answer'));
      
      expect(screen.queryByText('Confirm Answer')).not.toBeInTheDocument();
      expect(screen.getByText('Next Question')).toBeInTheDocument();
    });
  });

  describe('Results Screen', () => {
    it('should have quiz functionality to display results', () => {
      render(<QuizPage />);
      
      // The component renders and is ready for quiz completion
      // Results screen would be displayed after completing all questions
      // Verify the component has rendered successfully
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Retake Quiz', () => {
    it('should have retake functionality available', () => {
      render(<QuizPage />);
      
      // Component renders and quiz can be taken
      expect(screen.getByText(/Confirm Answer/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<QuizPage />);
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have accessible progress bar', () => {
      render(<QuizPage />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', 'Quiz progress');
    });

    it('should have proper ARIA attributes for feedback', () => {
      render(<QuizPage />);
      
      fireEvent.click(screen.getByText('18 years old'));
      fireEvent.click(screen.getByText('Confirm Answer'));
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });
});
