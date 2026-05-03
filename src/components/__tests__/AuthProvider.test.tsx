/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthProvider';

// Test component to consume the auth hook
const TestConsumer = () => {
  const { isGuest, user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="guest-status">{isGuest ? 'Guest' : 'Authenticated'}</div>
      <div data-testid="user-name">{user?.displayName || 'No User'}</div>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in loading state then defaults to guest mode', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Fast-forward the setTimeout(..., 0) in AuthProvider
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.getByTestId('guest-status')).toHaveTextContent('Guest');
  });

  it('loads user from localStorage if present', async () => {
    const mockUser = {
      uid: '123',
      displayName: 'Test User',
      email: 'test@example.com'
    };
    localStorage.setItem('voter_guide_user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.getByTestId('guest-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });

  it('clears user data on logout', async () => {
    const mockUser = { uid: '123', displayName: 'Test User' };
    localStorage.setItem('voter_guide_user', JSON.stringify(mockUser));

    const LogoutTrigger = () => {
      const { logout, isGuest } = useAuth();
      return (
        <button onClick={logout} data-testid="logout-btn">
          {isGuest ? 'Logged Out' : 'Logged In'}
        </button>
      );
    };

    render(
      <AuthProvider>
        <LogoutTrigger />
      </AuthProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.getByTestId('logout-btn')).toHaveTextContent('Logged In');

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(localStorage.getItem('voter_guide_user')).toBeNull();
    expect(screen.getByTestId('logout-btn')).toHaveTextContent('Logged Out');
  });
});
