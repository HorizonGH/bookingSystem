/**
 * Secure token storage and management utility
 * Handles access token and refresh token lifecycle
 */

const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

interface TokenPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode JWT payload without verification
 * Note: This is safe for expiration checks as we just read the payload,
 * the server validates the signature on refresh
 */
function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get token expiration time in seconds
 */
function getTokenExpiration(token: string): number | null {
  const payload = decodeToken(token);
  return payload?.exp ?? null;
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string, bufferSeconds: number = 0): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return now >= (expiration - bufferSeconds);
}

/**
 * Check if token is about to expire (within 5 minutes)
 */
function isTokenExpiringSoon(token: string): boolean {
  return isTokenExpired(token, 300); // 5 minutes buffer
}

export const tokenStorage = {
  /**
   * Save tokens after login
   */
  saveTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      // Also store expiry time for quick checks
      const expiry = getTokenExpiration(accessToken);
      if (expiry) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
      }
    } catch (error) {
      console.error('Failed to save tokens to localStorage:', error);
    }
  },

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Update access token (called after refresh)
   */
  updateAccessToken(accessToken: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      const expiry = getTokenExpiration(accessToken);
      if (expiry) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
      }
    } catch (error) {
      console.error('Failed to update access token:', error);
    }
  },

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },

  /**
   * Check if user has valid tokens
   */
  hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    return !!accessToken && !isTokenExpired(accessToken);
  },

  /**
   * Check if token needs refresh
   */
  shouldRefreshToken(): boolean {
    const refreshToken = this.getRefreshToken();
    const accessToken = this.getAccessToken();
    
    // Can refresh if we have both tokens
    if (!refreshToken || !accessToken) return false;
    
    // Refresh if access token is expired or expiring soon
    return isTokenExpired(accessToken) || isTokenExpiringSoon(accessToken);
  },

  /**
   * Get both tokens
   */
  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    };
  },
};
