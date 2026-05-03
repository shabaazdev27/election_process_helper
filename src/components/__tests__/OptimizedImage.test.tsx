/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import OptimizedImage from '../OptimizedImage';

describe('OptimizedImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test Alt Text',
    width: 100,
    height: 100,
  };

  it('renders with correct alt text', () => {
    render(<OptimizedImage {...defaultProps} />);
    expect(screen.getByAltText('Test Alt Text')).toBeInTheDocument();
  });

  it('applies priority loading when specified', () => {
    render(<OptimizedImage {...defaultProps} priority={true} />);
    const img = screen.getByAltText('Test Alt Text');
    // Next.js Image with priority has specific data attributes or logic
    expect(img).toBeInTheDocument();
  });

  it('has lazy loading by default', () => {
    render(<OptimizedImage {...defaultProps} />);
    const img = screen.getByAltText('Test Alt Text');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('sets loading to eager when priority is true', () => {
    render(<OptimizedImage {...defaultProps} priority={true} />);
    const img = screen.getByAltText('Test Alt Text');
    expect(img).toHaveAttribute('loading', 'eager');
  });
});
