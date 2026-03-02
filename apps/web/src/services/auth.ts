import { apiClient } from './api';
import { tokenStorage } from '../lib/tokenStorage';

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

export enum SubscriptionStatus {
  Trial,
  Active,
  Suspended,
  Cancelled,
  Expired,
  Pending,
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
  slug?: string;
  description: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phoneNumber?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  businessHours?: string;
  defaultScheduleStartTime?: string;
  defaultScheduleEndTime?: string;
  allowedScheduleDays?: string;
  primaryImageUrl?: string;
  planType: number;
  subscriptionStatus?: number; // SubscriptionStatus enum
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
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    // Save tokens securely
    tokenStorage.saveTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    // Save tokens securely
    tokenStorage.saveTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async registerTenant(tenantData: RegisterTenantRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register-tenant', tenantData);
    // Save tokens securely
    tokenStorage.saveTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async refreshToken(tokens: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', tokens);
    // Update tokens after refresh
    tokenStorage.saveTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/auth/logout', {});
    } catch (error) {
      console.warn('Logout API call failed, but clearing local tokens anyway:', error);
    }
    // Clear tokens securely
    tokenStorage.clearTokens();
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  async getTenant(tenantId: string): Promise<Tenant> {
    // The backend may return either a raw Tenant DTO or a wrapper { tenant: TenantDto, plan: TenantPlanInfoDto }
    const res = await apiClient.get<any>(`/tenants/${tenantId}`);
    const tenant = res?.tenant ?? res;

    // If plan info is returned separately, merge relevant fields into the tenant object
    if (res?.plan) {
      if (tenant.planType === undefined || tenant.planType === null) {
        tenant.planType = res.plan.planType;
      }
      if (tenant.subscriptionStatus === undefined || tenant.subscriptionStatus === null) {
        tenant.subscriptionStatus = res.plan.subscriptionStatus;
      }
    }

    return tenant as Tenant;
  },

  async updateTenant(tenantId: string, tenantData: Partial<Omit<Tenant, 'id' | 'created' | 'lastModified'>>): Promise<Tenant> {
    return apiClient.put<Tenant>(`/tenants/${tenantId}`, tenantData);
  },
};