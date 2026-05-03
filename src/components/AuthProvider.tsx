"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * Mock User type to match Firebase User structure for UI compatibility.
 * Used for guest mode and future authentication integration.
 */
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Authentication context type definition.
 * Provides user state, loading status, and authentication methods.
 */
interface AuthContextType {
  /** Current authenticated user or null for guest mode */
  user: MockUser | null;
  /** True while authentication state is being initialized */
  loading: boolean;
  /** Initiates Google OAuth sign-in flow */
  signInWithGoogle: () => Promise<void>;
  /** Signs out the current user and clears session */
  logout: () => Promise<void>;
  /** True when user is not authenticated (guest mode) */
  isGuest: boolean;
  /** True when user has premium subscription */
  isPremium: boolean;
}

/**
 * Default authentication context value.
 * Used as fallback when AuthProvider is not in component tree.
 */
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  signInWithGoogle: async () => {
    console.warn('signInWithGoogle called outside AuthProvider');
  },
  logout: async () => {
    console.warn('logout called outside AuthProvider');
  },
  isGuest: true,
  isPremium: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

/**
 * Authentication Provider Component
 *
 * Provides a simplified authentication context for the application.
 * Currently implements mock authentication with localStorage persistence.
 * Firebase Auth is intentionally excluded to avoid API key configuration issues.
 *
 * Features:
 * - Guest mode by default (no authentication required)
 * - Mock Google OAuth for testing
 * - localStorage persistence for user sessions
 * - Premium subscription status tracking
 *
 * @param props - Component props
 * @param props.children - Child components to wrap with auth context
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    /**
     * Initialize authentication state from localStorage.
     * Uses setTimeout to avoid cascading renders in strict mode.
     */
    const initAuth = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const savedUser = localStorage.getItem('voter_guide_user');
      
      // Defer state updates to avoid synchronous effect warnings
      setTimeout(() => {
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser) as MockUser;
            setUser(parsedUser);
          } catch (error) {
            console.error('Failed to parse saved user:', error);
            localStorage.removeItem('voter_guide_user');
          }
        }
        setLoading(false);
      }, 0);
    };

    initAuth();
  }, []);

  /**
   * Mock Google OAuth sign-in.
   * Creates a mock user and persists to localStorage.
   *
   * @throws Never throws - logs errors instead
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      console.log("Sign in with Google triggered (Mock implementation)");
      
      const mockUser: MockUser = {
        uid: `mock-google-user-${Date.now()}`,
        email: "voter@example.com",
        displayName: "Indian Voter",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=voter",
      };
      
      setUser(mockUser);
      localStorage.setItem('voter_guide_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }, []);

  /**
   * Sign out the current user.
   * Clears user state and removes from localStorage.
   */
  const logout = useCallback(async () => {
    try {
      setUser(null);
      setIsPremium(false);
      localStorage.removeItem('voter_guide_user');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const isGuest = user === null;

  const contextValue: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    logout,
    isGuest,
    isPremium,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider component tree.
 *
 * @returns Authentication context with user state and methods
 *
 * @example
 * ```tsx
 * const { user, isGuest, signInWithGoogle } = useAuth();
 *
 * if (isGuest) {
 *   return <button onClick={signInWithGoogle}>Sign In</button>;
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === defaultAuthContext) {
    console.warn('useAuth must be used within AuthProvider');
  }
  
  return context;
};

