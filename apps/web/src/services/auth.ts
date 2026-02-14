import { apiClient } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ReservationDto {
  id: string;
  tenantId: string;
  serviceId: string;
  workerId: string;
  clientId: string;
  startTime: string;
  endTime: string;
  reservationStatus: number; // Assuming this is an enum number
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  price: number;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  reminderSent: boolean;
  confirmationSent: boolean;
  created: string;
  lastModified?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  reservations: ReservationDto[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', userData);
  },

  async refreshToken(tokens: RefreshTokenRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', tokens);
  },

  async logout(): Promise<void> {
  try {
        await apiClient.post<void>('/auth/logout', {});
    } catch (error) {
        console.warn('Logout API call failed, but clearing local tokens anyway:', error);
    }
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },
};