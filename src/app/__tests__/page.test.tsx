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

import Home from '../page';

describe('Home Page', () => {
  describe('Hero Section', () => {
    it('should render hero heading', () => {
      render(<Home />);
      
      expect(screen.getByRole('heading', { name: /Navigating the World's Largest Democracy/ })).toBeInTheDocument();
    });

    it('should render hero subtitle', () => {
      render(<Home />);
      
      expect(screen.getByText(/Simplified guides for Voter ID/)).toBeInTheDocument();
    });

    it('should display AI-Powered badge', () => {
      render(<Home />);
      
      expect(screen.getByText('AI-Powered ECI Guide')).toBeInTheDocument();
    });

    it('should have dashboard link button', () => {
      render(<Home />);
      
      const dashboardLink = screen.getByText('My Voter Dashboard');
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
    });

    it('should have assistant link button', () => {
      render(<Home />);
      
      const assistantLink = screen.getByText('Ask Election Assistant');
      expect(assistantLink).toBeInTheDocument();
      expect(assistantLink.closest('a')).toHaveAttribute('href', '/assistant');
    });

    it('should display trust badges', () => {
      render(<Home />);
      
      expect(screen.getByText('ECI Verified')).toBeInTheDocument();
      expect(screen.getByText('All 28 States')).toBeInTheDocument();
      expect(screen.getByText('NVSP Integrated')).toBeInTheDocument();
      expect(screen.getByText('Live Booth Data')).toBeInTheDocument();
    });
  });

  describe('Features Section', () => {
    it('should render features heading', () => {
      render(<Home />);
      
      expect(screen.getByRole('heading', { name: /Master the Indian Voting Process/ })).toBeInTheDocument();
    });

    it('should render feature cards', () => {
      render(<Home />);
      
      expect(screen.getByText('Voter ID Guide')).toBeInTheDocument();
      expect(screen.getByText('Election Timeline')).toBeInTheDocument();
      expect(screen.getByText('ECI AI Assistant')).toBeInTheDocument();
    });

    it('should display voter ID feature', () => {
      render(<Home />);
      
      const voterIdFeature = screen.getByText('Voter ID Guide');
      expect(voterIdFeature).toBeInTheDocument();
      expect(screen.getByText(/Complete walkthrough for new registrations/)).toBeInTheDocument();
    });

    it('should display election timeline feature', () => {
      render(<Home />);
      
      const timelineFeature = screen.getByText('Election Timeline');
      expect(timelineFeature).toBeInTheDocument();
      expect(screen.getByText(/Stay updated with notification dates/)).toBeInTheDocument();
    });

    it('should display AI assistant feature', () => {
      render(<Home />);
      
      const assistantFeature = screen.getByText('ECI AI Assistant');
      expect(assistantFeature).toBeInTheDocument();
      expect(screen.getByText(/Ask about your booth, your BLO details/)).toBeInTheDocument();
    });

    it('should have link to process guide from voter ID feature', () => {
      render(<Home />);
      
      const processLinks = screen.getAllByText('View Guide');
      const firstLink = processLinks[0].closest('a');
      expect(firstLink).toHaveAttribute('href', '/process');
    });

    it('should have link to timeline from timeline feature', () => {
      render(<Home />);
      
      const processLinks = screen.getAllByText('View Guide');
      const secondLink = processLinks[1].closest('a');
      expect(secondLink).toHaveAttribute('href', '/timeline');
    });

    it('should have link to assistant from AI assistant feature', () => {
      render(<Home />);
      
      const processLinks = screen.getAllByText('View Guide');
      const thirdLink = processLinks[2].closest('a');
      expect(thirdLink).toHaveAttribute('href', '/assistant');
    });
  });

  describe('CTA Section', () => {
    it('should render CTA heading', () => {
      render(<Home />);
      
      expect(screen.getByRole('heading', { name: /Ready to cast your vote?/ })).toBeInTheDocument();
    });

    it('should render CTA description', () => {
      render(<Home />);
      
      expect(screen.getByText(/Join millions of responsible citizens/)).toBeInTheDocument();
    });

    it('should have electoral roll check link', () => {
      render(<Home />);
      
      const checkLink = screen.getByText('Check Electoral Roll');
      expect(checkLink).toBeInTheDocument();
      expect(checkLink.closest('a')).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Navigation', () => {
    it('should have multiple navigation links', () => {
      render(<Home />);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should link to correct pages', () => {
      render(<Home />);
      
      const allLinks = screen.getAllByRole('link');
      const dashboardLinks = allLinks.filter(link => link.getAttribute('href') === '/dashboard');
      const processLinks = allLinks.filter(link => link.getAttribute('href') === '/process');
      const timelineLinks = allLinks.filter(link => link.getAttribute('href') === '/timeline');
      const assistantLinks = allLinks.filter(link => link.getAttribute('href') === '/assistant');
      
      expect(dashboardLinks.length).toBeGreaterThan(0);
      expect(processLinks.length).toBeGreaterThan(0);
      expect(timelineLinks.length).toBeGreaterThan(0);
      expect(assistantLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<Home />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent(/Largest Democracy/);
    });

    it('should have accessible buttons', () => {
      render(<Home />);
      
      const buttons = screen.getAllByRole('link');
      buttons.forEach(button => {
        expect(button.textContent).not.toBe('');
      });
    });
  });

  describe('Content Completeness', () => {
    it('should mention Form 6 for new voters', () => {
      render(<Home />);
      
      expect(screen.getByText(/Form 6 registration/)).toBeInTheDocument();
    });

    it('should mention Aadhaar linking', () => {
      render(<Home />);
      
      expect(screen.getByText(/Aadhar-Voter ID linking/)).toBeInTheDocument();
    });

    it('should mention Gemini AI integration', () => {
      render(<Home />);
      
      expect(screen.getByText(/Powered by Gemini/)).toBeInTheDocument();
    });

    it('should mention ECI official data', () => {
      render(<Home />);
      
      expect(screen.getByText(/official ECI data/)).toBeInTheDocument();
    });
  });

  describe('Visual Structure', () => {
    it('should render home page without crashing', () => {
      expect(() => render(<Home />)).not.toThrow();
    });

    it('should have proper container structure', () => {
      const { container } = render(<Home />);
      
      const mainContainer = container.querySelector('div[class*="relative"][class*="overflow-hidden"]');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have feature grid layout', () => {
      render(<Home />);
      
      // Verify all feature cards are present
      const features = [
        'Voter ID Guide',
        'Election Timeline',
        'ECI AI Assistant'
      ];
      
      features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });
  });
});
