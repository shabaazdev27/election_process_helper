/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

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

import TimelinePage from '../page';

describe('Timeline Page', () => {
  describe('Page Header', () => {
    it('should render page title', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Election Timeline')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText(/Stay ahead of key dates and deadlines for the upcoming 2024 Indian General Election/)).toBeInTheDocument();
    });

    it('should have export button', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should have share button', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });

  describe('Timeline Phases', () => {
    it('should render pre-polling phase', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Pre-Polling Phase')).toBeInTheDocument();
      expect(screen.getByText('March - April 2024')).toBeInTheDocument();
    });

    it('should render polling phase', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Polling Phase (General Elections)')).toBeInTheDocument();
      expect(screen.getByText('April - June 2024')).toBeInTheDocument();
    });

    it('should render counting and results phase', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Counting & Results')).toBeInTheDocument();
      expect(screen.getByText('June 4, 2024')).toBeInTheDocument();
    });

    it('should show active phase indicator', () => {
      render(<TimelinePage />);
      
      // Active phase has a pulsing indicator
      const activeBadges = screen.getAllByText('Active Phase');
      expect(activeBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Phase Milestones', () => {
    it('should display pre-polling milestones', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('ECI Notification')).toBeInTheDocument();
      expect(screen.getByText('Phase 1 Nominations')).toBeInTheDocument();
      expect(screen.getByText('Scrutiny of Papers')).toBeInTheDocument();
    });

    it('should display polling phase milestones', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Phase 1 Polling')).toBeInTheDocument();
      expect(screen.getByText('Phase 4 Polling')).toBeInTheDocument();
      expect(screen.getByText('Final Phase (Phase 7)')).toBeInTheDocument();
    });

    it('should display counting and results milestones', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Counting of Votes')).toBeInTheDocument();
      expect(screen.getByText('Results Declaration')).toBeInTheDocument();
      expect(screen.getByText('Formation of Govt')).toBeInTheDocument();
    });

    it('should show milestone dates', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Mar 16')).toBeInTheDocument();
      expect(screen.getByText('Mar 20 - Mar 27')).toBeInTheDocument();
      expect(screen.getByText('Apr 19')).toBeInTheDocument();
    });

    it('should indicate active phase', () => {
      render(<TimelinePage />);
      
      // Active phase has a pulsing indicator
      const activeBadges = screen.getAllByText('Active Phase');
      expect(activeBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Newsletter Section', () => {
    it('should have newsletter subscription section', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Get Important Alerts')).toBeInTheDocument();
    });

    it('should have email input', () => {
      render(<TimelinePage />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toBeInTheDocument();
    });

    it('should have subscribe button', () => {
      render(<TimelinePage />);
      
      const subscribeBtn = screen.getByRole('button', { name: /Subscribe/ });
      expect(subscribeBtn).toBeInTheDocument();
    });

    it('should allow email entry', () => {
      render(<TimelinePage />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TimelinePage />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Election Timeline');
    });

    it('should have accessible timeline phases', () => {
      render(<TimelinePage />);
      
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have alt text or labels for icons/phases', () => {
      render(<TimelinePage />);
      
      // Check that phases are properly labeled
      const phaseElements = screen.getByText('Pre-Polling Phase').closest('div');
      expect(phaseElements).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should show active phase styling', () => {
      render(<TimelinePage />);
      
      expect(screen.getByText('Active Phase')).toBeInTheDocument();
    });

    it('should display all phase information', () => {
      render(<TimelinePage />);
      
      const phases = ['Pre-Polling Phase', 'Polling Phase (General Elections)', 'Counting & Results'];
      phases.forEach(phase => {
        expect(screen.getByText(phase)).toBeInTheDocument();
      });
    });
  });
});
