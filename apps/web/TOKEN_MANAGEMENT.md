# Token Management & Refresh Token Implementation

This document explains the secure token management and automatic refresh token system implemented in the application.

## Overview

The system provides:
- **Secure token storage**: Access tokens and refresh tokens stored safely in localStorage
- **Automatic token refresh**: When an access token expires, the system automatically refreshes it using the refresh token
- **Request interception**: Failed requests due to expired tokens are automatically retried after refresh
- **Token expiration tracking**: Monitors token expiration and proactively refreshes when needed
- **Request queuing**: Multiple simultaneous requests will share a single refresh operation

## Architecture

### Components

#### 1. `src/lib/tokenStorage.ts`
Core utility for token storage and management.

**Key functions:**
- `saveTokens(accessToken, refreshToken)`: Save tokens after login/registration
- `getAccessToken()`: Get current access token
- `getRefreshToken()`: Get current refresh token
- `updateAccessToken(token)`: Update access token after refresh
- `clearTokens()`: Clear all tokens (on logout)
- `hasValidTokens()`: Check if user has valid tokens
- `shouldRefreshToken()`: Check if token needs refresh
- `getTokens()`: Get both tokens

```typescript
import { tokenStorage } from '@/lib/tokenStorage';

// Check if user is authenticated
if (tokenStorage.hasValidTokens()) {
  // User is authenticated
}

// Get current token
const token = tokenStorage.getAccessToken();

// Check if refresh is needed
if (tokenStorage.shouldRefreshToken()) {
  // Token is expiring soon, should refresh
}
```

#### 2. `src/lib/useAuth.ts`
React hooks for accessing authentication state in components.

**Key hooks:**
- `useAuth()`: Get full authentication state including token expiration info
- `useAccessToken()`: Get just the access token
- `isAuthenticated()`: Check if user is authenticated

```typescript
import { useAuth, useAccessToken } from '@/lib/useAuth';

// In a component:
function MyComponent() {
  const { isAuthenticated, isTokenExpiringSoon } = useAuth();
  const token = useAccessToken();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome!</div>;
}
```

#### 3. `src/services/api.ts` (Updated)
API client with automatic token refresh and request queuing.

**Features:**
- Includes Bearer token in all requests
- Intercepts 401 responses
- Automatically attempts to refresh token on 401
- Queues requests while refresh is in progress
- Retries failed requests with new token
- Redirects to login if refresh fails

#### 4. `src/services/auth.ts` (Updated)
Authentication service that uses secure token storage.

**Methods now handle token storage automatically:**
- `login()`: Saves tokens after login
- `register()`: Saves tokens after registration
- `registerTenant()`: Saves tokens after tenant registration
- `refreshToken()`: Updates tokens after refresh
- `logout()`: Clears all tokens

## Token Flow

### Login/Registration Flow
```
1. User submits login credentials
2. authService.login() is called
3. API returns accessToken, refreshToken, expiresAt
4. tokenStorage.saveTokens() stores both tokens
5. User is logged in with stored tokens
```

### API Request Flow
```
1. Component makes API call via apiClient
2. apiClient adds Authorization header with accessToken
3. Request is sent to server
4. IF response is 401 (unauthorized):
   a. apiClient checks if token refresh is needed
   b. If another request is already refreshing, queue this request
   c. Otherwise, call refreshToken API with accessToken + refreshToken
   d. If refresh succeeds: update token and retry original request
   e. If refresh fails: clear tokens and redirect to login
5. IF response is successful: return data to component
6. IF response is other error: throw ApiError
```

### Automatic Token Refresh Scenarios

**Scenario 1: Token expires during API call**
```typescript
// Token is valid when request starts
const response = await apiClient.get('/api/data');

// But token expires while waiting for response
// If response is 401, system automatically:
// 1. Refreshes the token using refreshToken
// 2. Retries the original request with new token
// 3. Returns data to component transparently
```

**Scenario 2: Multiple simultaneous requests with expired token**
```typescript
// Start 3 requests at the same time
const [result1, result2, result3] = await Promise.all([
  apiClient.get('/api/data1'),
  apiClient.get('/api/data2'),
  apiClient.get('/api/data3'),
]);

// All get 401 at the same time
// System:
// 1. Starts refresh with first request
// 2. Queues requests 2 and 3
// 3. Completes refresh once
// 4. Retries all 3 requests with new token
```

**Scenario 3: Proactive refresh**
```typescript
// Token expires in 5 minutes
const { isTokenExpiringSoon } = useAuth();

if (isTokenExpiringSoon) {
  // Optionally proactively refresh before making requests
  await authService.refreshToken({
    accessToken: tokenStorage.getAccessToken(),
    refreshToken: tokenStorage.getRefreshToken()
  });
}
```

## Usage Examples

### Example 1: Protected Component
```typescript
'use client';

import { useAuth } from '@/lib/useAuth';

export function ProtectedComponent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in to view this content</div>;
  }

  return <div>Protected content</div>;
}
```

### Example 2: API Call with Auto-Refresh
```typescript
'use client';

import { apiClient } from '@/services/api';
import { useState } from 'react';

export function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      // If token is expired, system automatically refreshes and retries
      const result = await apiClient.get('/api/user-data');
      setData(result);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={loadData} disabled={loading}>
      {loading ? 'Loading...' : 'Load Data'}
    </button>
  );
}
```

### Example 3: Manual Login Handling
```typescript
'use client';

import { authService } from '@/services/auth';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Tokens are automatically saved by authService.login()
      const response = await authService.login({ email, password });
      console.log('Logged in as:', response.user);
      // Redirect or update UI
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Example 4: Check Authentication in Layout
```typescript
'use client';

import { useAuth } from '@/lib/useAuth';

export function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <html>
      <body>
        {isAuthenticated && <UserNav />}
        {children}
      </body>
    </html>
  );
}
```

## Security Considerations

### Token Storage
- **AccessToken**: Short-lived token (typically 15 minutes)
  - Stored in localStorage for client-side API requests
  - Included in Authorization header
- **RefreshToken**: Long-lived token (typically 7+ days)
  - Stored in localStorage
  - Only sent to `/auth/refresh` endpoint
  - Never sent as Authorization header to regular API endpoints

### Token Lifecycle
- Tokens are decoded locally to check expiration (JWT payload)
- Server-side validation happens on every request
- Local expiration checks are for optimization only
- Server is source of truth for token validation

### XSS Protection
- Store tokens in localStorage (not secure against XSS but acceptable with CSP)
- Alternatively, use httpOnly cookies for tokens (requires server-side cookie management)

### CSRF Protection
- Standard CSRF tokens should be used for POST requests in traditional forms
- API requests use Bearer token authentication (not subject to CSRF)

## Configuration

### Token Expiration Buffer
Default buffer for "token expiring soon" check:
```typescript
// In tokenStorage.ts
isTokenExpiringSoon(token: string): boolean {
  return isTokenExpired(token, 300); // 5 minutes buffer
}
```

Modify the buffer time as needed in `src/lib/tokenStorage.ts` line 44.

### Token Check Interval
Default interval for periodic token status updates:
```typescript
// In useAuth.ts
const tokenCheckInterval = setInterval(updateAuthState, 30000); // 30 seconds
```

Modify the interval in `src/lib/useAuth.ts` line 43.

### API Endpoint
Token refresh endpoint:
```
POST /auth/refresh
Body: { accessToken, refreshToken }
Response: { accessToken, refreshToken, expiresAt, user }
```

## Testing

### Test Token Refresh
```typescript
// Simulate token expiration
const { tokenStorage } = await import('@/lib/tokenStorage');

// Get current token
const token = tokenStorage.getAccessToken();

// Manually update to an expired token
localStorage.setItem('authToken', expiredTokenValue);

// Next API call will trigger refresh automatically
await apiClient.get('/api/test');
```

### Test 401 Response
```typescript
// Server can return 401 to test refresh flow
// System will:
// 1. Attempt to refresh token
// 2. Retry request
// 3. If refresh fails, redirect to login
```

## Troubleshooting

### Tokens not being saved
- Check browser console for localStorage errors
- Ensure `authService.login/register/registerTenant` is used, not direct API calls
- Verify tokens are returned from API in correct format

### Token refresh not working
- Check that `/auth/refresh` endpoint returns new accessToken
- Verify RefreshTokenRequest format: `{ accessToken, refreshToken }`
- Check server response format: `{ accessToken, refreshToken, expiresAt, user }`

### Redirect loop on login page
- Verify login API returns valid tokens
- Check that 401 handler excludes /login path
- Ensure returnTo parameter is valid

### Multiple token refreshes happening
- This is normal if multiple requests get 401 simultaneously
- System queues requests to use single refresh operation
- Check network tab to verify only one refresh request

## Future Enhancements

1. **HttpOnly Cookies**: Implement server-side cookie management for refresh tokens
2. **Token Rotation**: Implement automatic token rotation on each refresh
3. **Refresh Token Rotation**: Rotate refresh tokens on each use
4. **Token Analytics**: Track token usage and refresh patterns
5. **Mobile Support**: Handle background/foreground state changes
6. **Offline Support**: Cache tokens and implement offline-first sync
