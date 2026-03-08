// Base API configuration and utilities
import { tokenStorage } from '../lib/tokenStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5017/api';

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshQueue: Array<() => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Queue requests while token is being refreshed
   * to avoid multiple simultaneous refresh requests
   */
  private onTokenRefresh(callback: () => void): void {
    this.refreshQueue.push(callback);
  }

  /**
   * Execute all queued requests after token refresh
   */
  private processQueue(): void {
    this.refreshQueue.forEach((callback) => callback());
    this.refreshQueue = [];
  }

  /**
   * Attempt to refresh the access token
   */
  private async attemptTokenRefresh(): Promise<boolean> {
    const refreshToken = tokenStorage.getRefreshToken();
    const accessToken = tokenStorage.getAccessToken();

    if (!refreshToken || !accessToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      });

      if (!response.ok) {
        // Refresh failed, tokens are invalid
        tokenStorage.clearTokens();
        return false;
      }

      const data = await response.json();
      
      if (data.accessToken) {
        // Save the new access token
        tokenStorage.updateAccessToken(data.accessToken);
        if (data.refreshToken) {
          tokenStorage.saveTokens(data.accessToken, data.refreshToken);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get the current access token
    const token = tokenStorage.getAccessToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };

    // Only set Content-Type for requests with a body (POST, PUT, PATCH, DELETE).
    // Do **not** override the header when the body is a FormData instance;
    // the browser will set the correct multipart boundary for us.
    if (
      options.method &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method) &&
      options.body &&
      !(options.body instanceof FormData)
    ) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      let response = await fetch(url, config);

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && typeof window !== 'undefined') {
        // If already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.onTokenRefresh(() => {
              // Retry the request with new token
              this.request<T>(endpoint, options)
                .then(resolve)
                .catch(reject);
            });
          });
        }

        this.isRefreshing = true;

        // Capture whether the user had tokens BEFORE the refresh attempt.
        // If they had none, they are simply an unauthenticated visitor on a
        // public page — we must NOT redirect them to /login automatically.
        const hadTokens = !!(tokenStorage.getRefreshToken() || tokenStorage.getAccessToken());

        // Attempt to refresh the token
        const refreshed = await this.attemptTokenRefresh();

        if (refreshed) {
          // Token refresh successful, retry the original request
          const newToken = tokenStorage.getAccessToken();
          if (newToken) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            };

            try {
              response = await fetch(url, config);

              // If still 401 after refresh, the session is truly invalid —
              // redirect only if the user was previously authenticated.
              if (response.status === 401) {
                tokenStorage.clearTokens();
                if (hadTokens && window.location.pathname !== '/login') {
                  const currentPath = window.location.pathname + window.location.search;
                  window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`;
                }
                throw new ApiError('Unauthorized', 401, {});
              }
            } finally {
              this.isRefreshing = false;
              this.processQueue();
            }
          } else {
            this.isRefreshing = false;
            this.processQueue();
            throw new ApiError('Invalid token after refresh', 401, {});
          }
        } else {
          // Token refresh failed — clean up and only redirect if the user had
          // an active session. Unauthenticated visitors on public pages must
          // not be bounced to /login.
          this.isRefreshing = false;
          this.processQueue();

          try {
            tokenStorage.clearTokens();
          } catch (e) {
            // ignore storage errors
          }

          if (hadTokens && window.location.pathname !== '/login') {
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`;
          }

          throw new ApiError('Token refresh failed', 401, {});
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new ApiError(
          errorData.message || errorData.title || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      // 204 No Content — return null without attempting to parse JSON
      if (response.status === 204) {
        return null as unknown as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error or unexpected issue', 0);
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  async delete<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { ApiError };