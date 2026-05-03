/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders the brand name', () => {
    render(<Footer />);
    expect(screen.getByText('ElectionGuide')).toBeInTheDocument();
  });

  it('renders the support email link', () => {
    render(<Footer />);
    const emailLink = screen.getByLabelText('Email Support');
    expect(emailLink).toHaveAttribute('href', 'mailto:khanshabaaz05@gmail.com');
  });

  it('contains links to resources', () => {
    render(<Footer />);
    expect(screen.getByText('Process Guides')).toBeInTheDocument();
    expect(screen.getByText('Election Timeline')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Assessment')).toBeInTheDocument();
  });

  it('renders the copyright notice with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it('is contained within a footer landmark', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
