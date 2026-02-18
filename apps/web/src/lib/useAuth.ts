/**
 * React hook for accessing authentication state and token information
 * Can be used in client components to check authentication status
 */

import { useEffect, useState } from 'react';
import { tokenStorage } from './tokenStorage';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isTokenExpiringSoon: boolean;
  isLoading: boolean;
}

/**
 * Hook to access and monitor authentication state
 * Updates when tokens change
 */
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    isTokenExpiringSoon: false,
    isLoading: true,
  }));

  useEffect(() => {
    // Initial load of token state
    const updateAuthState = () => {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();
      const hasValidTokens = tokenStorage.hasValidTokens();
      const shouldRefresh = tokenStorage.shouldRefreshToken();

      setAuthState({
        isAuthenticated: hasValidTokens,
        accessToken,
        refreshToken,
        isTokenExpiringSoon: shouldRefresh,
        isLoading: false,
      });
    };

    updateAuthState();

    // Set up an interval to periodically check token expiration
    // This helps proactively refresh tokens before they expire
    const tokenCheckInterval = setInterval(updateAuthState, 30000); // Check every 30 seconds

    // Listen for storage changes (tokens updated in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'refreshToken') {
        updateAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(tokenCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return authState;
}

/**
 * Hook to get just the access token
 * Simpler alternative when you only need the token
 */
export function useAccessToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(tokenStorage.getAccessToken());

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return token;
}

/**
 * Check if user is authenticated (returns false on server-side)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return tokenStorage.hasValidTokens();
}
