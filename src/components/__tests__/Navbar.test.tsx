/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Navbar', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('renders the brand logo and name', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('ElectionGuide India Home')).toBeInTheDocument();
    expect(screen.getByText('ElectionGuide India')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Process Guide')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
  });

  it('highlights the active link', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    render(<Navbar />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('text-primary');
  });

  it('has a "Main Navigation" aria-label', () => {
    render(<Navbar />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main Navigation');
  });
});
