import { apiClient } from './api';
import { PlanType } from './auth';

export interface ServiceDto {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  imageUrl?: string;
  category?: string;
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  requiresApproval?: boolean;
  advanceBookingHours?: number;
  minBookingHours?: number;
  created: string;
  lastModified?: string;
}

export interface CreateServiceRequest {
  tenantId: string;
  name: string;
  durationMinutes: number;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  requiresApproval?: boolean;
  advanceBookingHours?: number;
  minBookingHours?: number;
}

export interface UpdateServiceRequest {
  id: string; // required
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  imageUrl?: string;
  category?: string;
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  requiresApproval?: boolean;
  advanceBookingHours?: number;
  minBookingHours?: number;
}

export interface DeleteServiceRequest {
  serviceId: string;
}

export interface GetServiceByIdRequest {
  id: string;
}

export interface GetServicesByTenantRequest {
  tenantId: string;
}

export interface ServicesByTenantResponse {
  services: ServiceDto[];
  planType: string; // "Free" | "Basic" | "Professional" | "Enterprise"
  maxServices: number;
  currentServices: number;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetAllServicesParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

// Plan service limits
export const PLAN_SERVICE_LIMITS: Record<PlanType, number> = {
  [PlanType.Free]: 5,
  [PlanType.Basic]: 20,
  [PlanType.Professional]: 100,
  [PlanType.Enterprise]: Infinity,
};

/**
 * Get the maximum number of services allowed for a given plan
 */
export function getMaxServicesForPlan(planType: PlanType | number): number {
  // Handle numeric plan type (from API)
  const plan = typeof planType === 'number' ? planType as PlanType : planType;
  return PLAN_SERVICE_LIMITS[plan] ?? 5;
}

/**
 * Check if adding another service is allowed for the given plan
 */
export function canAddService(planType: PlanType | number, currentServiceCount: number): boolean {
  const maxServices = getMaxServicesForPlan(planType);
  return currentServiceCount < maxServices;
}

/**
 * Get a human-readable description of service limits for each plan
 */
export function getServiceLimitDescription(planType: PlanType | number): string {
  const maxServices = getMaxServicesForPlan(planType);
  if (maxServices === Infinity) {
    return 'Servicios ilimitados';
  }
  return `Hasta ${maxServices} servicios`;
}

export const serviceService = {
  /**
   * Create a new service
   * Requires TenantAdmin role
   * @throws ApiError with status 400 if plan limit reached (message contains "Service limit reached")
   */
  async createService(data: CreateServiceRequest): Promise<ServiceDto> {
    return apiClient.post<ServiceDto>('/services', data);
  },

  /**
   * Update an existing service
   * Requires TenantAdmin role
   * ID must be included in the request body
   */
  async updateService(data: UpdateServiceRequest): Promise<ServiceDto> {
    return apiClient.put<ServiceDto>('/services', data);
  },

  /**
   * Delete a service
   * Requires TenantAdmin role
   * @throws ApiError with status 400 if service has existing reservations
   */
  async deleteService(serviceId: string): Promise<boolean> {
    return apiClient.delete<boolean>('/services', { serviceId });
  },

  /**
   * Get a service by ID
   * Public endpoint (AllowAnonymous)
   * Note: Uses POST with ID in body (not GET /{id})
   */
  async getServiceById(id: string): Promise<ServiceDto> {
    return apiClient.post<ServiceDto>('/services/get-by-id', { id });
  },

  /**
   * Get all services for a specific tenant
   * Public endpoint (AllowAnonymous)
   * Returns services along with plan limits information
   * Recommended to call before showing "Add service" button
   */
  async getServicesByTenant(tenantId: string): Promise<ServicesByTenantResponse> {
    return apiClient.post<ServicesByTenantResponse>('/services/by-tenant', { tenantId });
  },

  /**
   * Get all services (paginated)
   * Public endpoint (AllowAnonymous)
   */
  async getAllServices(params?: GetAllServicesParams): Promise<PagedResult<ServiceDto>> {
    const queryParams = new URLSearchParams();
    
    if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';
    
    return apiClient.get<PagedResult<ServiceDto>>(endpoint);
  },
};
