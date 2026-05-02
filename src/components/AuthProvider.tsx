"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Mock User type to match Firebase User structure enough for the UI
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  /** True when user is not authenticated (guest mode) */
  isGuest: boolean;
  /** True when user has premium subscription */
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  isGuest: true,
  isPremium: false,
});

/**
 * Provides a simplified authentication context.
 * Firebase Auth is removed to avoid 'invalid-api-key' errors.
 * Currently supports a persistent guest mode.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Synchronize with external storage
    const initAuth = () => {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('voter_guide_user') : null;
      
      // Use requestAnimationFrame or setTimeout to move state updates out of the synchronous effect body
      // This avoids the 'cascading renders' warning in strict linting environments
      setTimeout(() => {
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setLoading(false);
      }, 0);
    };

    initAuth();
  }, []);

  const signInWithGoogle = async () => {
    console.log("Sign in with Google triggered (Native Auth implementation pending)");
    // Mock login for now
    const mockUser: MockUser = {
      uid: "mock-google-user-123",
      email: "voter@example.com",
      displayName: "Indian Voter",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=voter",
    };
    setUser(mockUser);
    localStorage.setItem('voter_guide_user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    setIsPremium(false);
    localStorage.removeItem('voter_guide_user');
  };

  const isGuest = user === null;

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, isGuest, isPremium }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

