/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import LiveDataBadge from '../LiveDataBadge';

describe('LiveDataBadge', () => {
  it('renders the badge with default label', () => {
    render(<LiveDataBadge />);
    expect(screen.getByText('Live Status: External')).toBeInTheDocument();
  });

  it('has correct ARIA role and label for accessibility', () => {
    render(<LiveDataBadge />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Live status from external sources');
  });

  it('applies the correct styles for default variant', () => {
    render(<LiveDataBadge variant="default" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('bg-emerald-50');
  });

  it('applies the correct styles for outline variant', () => {
    render(<LiveDataBadge variant="outline" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('border-emerald-600');
  });
});
