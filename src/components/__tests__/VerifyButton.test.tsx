/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import VerifyButton from '../VerifyButton';

describe('VerifyButton', () => {
  it('renders with the correct label', () => {
    render(<VerifyButton label="Test Verify" />);
    expect(screen.getByText('Test Verify')).toBeInTheDocument();
  });

  it('shows guidance modal when clicked', () => {
    render(<VerifyButton label="Verify" />);
    const button = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(button);
    expect(screen.getByText('Before Redirecting')).toBeInTheDocument();
    expect(screen.getByText(/Part Number/i)).toBeInTheDocument();
  });

  it('closes modal when cancel is clicked', () => {
    render(<VerifyButton label="Verify" />);
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Before Redirecting')).not.toBeInTheDocument();
  });

  it('calls window.open when continue is clicked', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    render(<VerifyButton label="Verify" state="TN" />);
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));
    fireEvent.click(screen.getByText('Continue to ECI Portal'));
    expect(openSpy).toHaveBeenCalledWith('https://elections.tn.gov.in', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });
});
