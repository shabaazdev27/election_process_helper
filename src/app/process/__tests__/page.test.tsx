/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

import ProcessPage from '../page';

describe('Process List Page', () => {
  describe('Page Header', () => {
    it('should render page title', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText('Election Process Guides')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText(/Comprehensive, step-by-step instructions for every stage of the election process/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<ProcessPage />);
      
      const searchInput = screen.getByPlaceholderText('Search for a guide...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should have location selector', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText('India')).toBeInTheDocument();
    });

    it('should have change location button', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText('Change Location')).toBeInTheDocument();
    });
  });

  describe('Process Cards', () => {
    it('should render voter registration card', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText('New Voter (Form 6)')).toBeInTheDocument();
    });

    it('should render correction process card', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText('Correction (Form 8)')).toBeInTheDocument();
    });

    it('should render aadhaar linking card', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText('Aadhaar Linking (Form 6B)')).toBeInTheDocument();
    });

    it('should render booth locator card', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText('Find Your Polling Station')).toBeInTheDocument();
    });

    it('should display process descriptions', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText(/Learn how to apply for your first EPIC card online/)).toBeInTheDocument();
    });

    it('should show number of steps for each process', () => {
      render(<ProcessPage />);
      
      const stepIndicators = screen.getAllByText(/Steps/);
      expect(stepIndicators.length).toBeGreaterThan(0);
    });

    it('should show duration for each process', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText('15-20 mins')).toBeInTheDocument();
      expect(screen.getByText('10 mins')).toBeInTheDocument();
      expect(screen.getByText('5 mins')).toBeInTheDocument(); // Aadhaar linking has 5 mins
      expect(screen.getByText('2 mins')).toBeInTheDocument(); // Booth finder has 2 mins
    });

    it('should show category for each process', () => {
      render(<ProcessPage />);
      
      expect(screen.getByText('Registration')).toBeInTheDocument();
      expect(screen.getByText('Modification')).toBeInTheDocument();
      expect(screen.getByText('Verification')).toBeInTheDocument();
      expect(screen.getByText('Polling')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should link to voter registration detail page', () => {
      render(<ProcessPage />);
      
      const link = screen.getByText('New Voter (Form 6)').closest('a');
      expect(link).toHaveAttribute('href', '/process/voter-id-registration');
    });

    it('should link to correction detail page', () => {
      render(<ProcessPage />);
      
      const link = screen.getByText('Correction (Form 8)').closest('a');
      expect(link).toHaveAttribute('href', '/process/epic-correction');
    });

    it('should link to aadhaar linking detail page', () => {
      render(<ProcessPage />);
      
      const link = screen.getByText('Aadhaar Linking (Form 6B)').closest('a');
      expect(link).toHaveAttribute('href', '/process/aadhaar-linking');
    });

    it('should link to booth finder detail page', () => {
      render(<ProcessPage />);
      
      const link = screen.getByText('Find Your Polling Station').closest('a');
      expect(link).toHaveAttribute('href', '/process/booth-finder');
    });
  });

  describe('Card Layout', () => {
    it('should display cards in grid', () => {
      render(<ProcessPage />);
      
      const cards = screen.getAllByText(/Form 6|Form 8|Form 6B|Polling/);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should show arrow icon on cards', () => {
      render(<ProcessPage />);
      
      const cardLinks = screen.getAllByRole('link').filter(link => 
        link.textContent?.includes('Form 6') || 
        link.textContent?.includes('Form 8') ||
        link.textContent?.includes('Form 6B') ||
        link.textContent?.includes('Polling')
      );
      expect(cardLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Process Details', () => {
    it('should show correct steps for voter registration', () => {
      render(<ProcessPage />);
      
      const registrationCard = screen.getByText('New Voter (Form 6)').closest('a');
      const stepsText = registrationCard?.textContent || '';
      expect(stepsText).toContain('7');
    });

    it('should show correct duration for correction process', () => {
      render(<ProcessPage />);
      
      const correctionCard = screen.getByText('Correction (Form 8)').closest('a');
      const durationText = correctionCard?.textContent || '';
      expect(durationText).toContain('10 mins');
    });

    it('should show correct steps for aadhaar linking', () => {
      render(<ProcessPage />);
      
      const aadhaarCard = screen.getByText('Aadhaar Linking (Form 6B)').closest('a');
      const stepsText = aadhaarCard?.textContent || '';
      expect(stepsText).toContain('3');
    });

    it('should show correct duration for booth finder', () => {
      render(<ProcessPage />);
      
      const boothCard = screen.getByText('Find Your Polling Station').closest('a');
      const durationText = boothCard?.textContent || '';
      expect(durationText).toContain('2 mins');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ProcessPage />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Election Process Guides');
    });

    it('should have accessible navigation links', () => {
      render(<ProcessPage />);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should have proper input for search', () => {
      render(<ProcessPage />);
      
      const searchInput = screen.getByPlaceholderText('Search for a guide...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Visual Elements', () => {
    it('should display all process information', () => {
      render(<ProcessPage />);
      
      const processes = [
        'New Voter (Form 6)',
        'Correction (Form 8)',
        'Aadhaar Linking (Form 6B)',
        'Find Your Polling Station'
      ];
      
      processes.forEach(process => {
        expect(screen.getByText(process)).toBeInTheDocument();
      });
    });

    it('should render process cards with complete information', () => {
      render(<ProcessPage />);
      
      // Check for complete card information (title + description + duration + steps)
      const newVoterCard = screen.getByText('New Voter (Form 6)').closest('a');
      expect(newVoterCard?.textContent).toContain('Learn how to apply');
      expect(newVoterCard?.textContent).toContain('15-20 mins');
    });
  });
});
