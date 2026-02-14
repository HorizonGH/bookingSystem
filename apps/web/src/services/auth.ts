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

export enum PlanType {
  Free,
  Basic,
  Professional,
  Enterprise
}

export interface RegisterTenantRequest {
  userRequest: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
  };
  tenantRequest: {
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    planType: PlanType | string; // can be enum or string
  };
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
  tenantId?: string;
  reservations: ReservationDto[];
}

export interface Tenant {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  planType: number;
  isActive: boolean;
  created: string;
  lastModified?: string;
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

  async registerTenant(tenantData: RegisterTenantRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register-tenant', tenantData);
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

  async getTenant(tenantId: string): Promise<Tenant> {
    return apiClient.get<Tenant>(`/tenants/${tenantId}`);
  },

  async updateTenant(tenantId: string, tenantData: Partial<Omit<Tenant, 'id' | 'created' | 'lastModified'>>): Promise<Tenant> {
    return apiClient.put<Tenant>(`/tenants/${tenantId}`, tenantData);
  },
};