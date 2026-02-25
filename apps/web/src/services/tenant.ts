import { apiClient } from './api';

export interface TenantDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  businessHours?: string;
  planType?: number; // 0: Free, 1: Basic, 2: Professional, 3: Enterprise
  isActive?: boolean;
  /** URL of the tenant's primary image (first image marked as primary) */
  primaryImageUrl?: string;
}

// DTO returned by the tenant images endpoints
export interface TenantImageDto {
  id: string;
  url: string;
  altText?: string;
  displayOrder?: number;
  isPrimary: boolean;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  businessHours?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  businessHours?: string;
}

export interface PaginationRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const tenantService = {
  /**
   * Create a new tenant
   */
  async createTenant(data: CreateTenantRequest): Promise<TenantDto> {
    return apiClient.post<TenantDto>('/tenants', data);
  },

  /**
   * Get a tenant by ID
   */
  async getTenantById(id: string): Promise<TenantDto> {
    // Support both legacy raw TenantDto response and the new wrapper { tenant: TenantDto, plan: TenantPlanInfoDto }
    const res = await apiClient.get<any>(`/tenants/${id}`);
    const tenant = res?.tenant ?? res;

    if (res?.plan && (tenant.planType === undefined || tenant.planType === null)) {
      tenant.planType = res.plan.planType;
    }

    return tenant as TenantDto;
  },

  /**
   * Get all tenants with pagination, filtering, and sorting
   */
  async getAllTenants(params?: PaginationRequest): Promise<PaginatedResponse<TenantDto>> {
    const queryParams = new URLSearchParams();

    if (params?.pageNumber) {
      queryParams.append('pageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params?.searchTerm) {
      queryParams.append('searchTerm', params.searchTerm);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params?.sortDescending !== undefined) {
      queryParams.append('sortDescending', params.sortDescending.toString());
    }
    // Send filters with 'filters.' prefix - backend auto-capitalizes and uses Contains for strings
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Use lowercase key - backend will auto-capitalize first letter
          const filterKey = key.charAt(0).toLowerCase() + key.slice(1);
          queryParams.append(`filters.${filterKey}`, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tenants?${queryString}` : '/tenants';

    return apiClient.get<PaginatedResponse<TenantDto>>(endpoint);
  },

  /**
   * Update a tenant
   */
  async updateTenant(id: string, data: UpdateTenantRequest): Promise<TenantDto> {
    return apiClient.put<TenantDto>(`/tenants/${id}`, data);
  },

  /**
   * Delete a tenant
   */
  async deleteTenant(id: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${id}`);
  },

  /**
   * Retrieve all images associated with a tenant.
   */
  async getTenantImages(tenantId: string): Promise<TenantImageDto[]> {
    return apiClient.get<TenantImageDto[]>(`/tenants/${tenantId}/images`);
  },

  /**
   * Upload a new image for the tenant. Accepts various optional metadata fields.
   * The caller is responsible for constructing a FormData instance; the client
   * library will not set Content-Type when FormData is detected.
   */
  async uploadTenantImage(
    tenantId: string,
    file: File,
    altText?: string,
    displayOrder?: number,
    isPrimary?: boolean
  ): Promise<TenantImageDto> {
    const form = new FormData();
    form.append('file', file);
    if (altText !== undefined) form.append('AltText', altText);
    if (displayOrder !== undefined && displayOrder !== null)
      form.append('DisplayOrder', displayOrder.toString());
    if (isPrimary !== undefined) form.append('IsPrimary', isPrimary.toString());

    return apiClient.post<TenantImageDto>(`/tenants/${tenantId}/images`, form as any);
  },

  /**
   * Remove an image from the tenant.
   */
  async deleteTenantImage(tenantId: string, imageId: string): Promise<void> {
    return apiClient.delete<void>(`/tenants/${tenantId}/images/${imageId}`);
  },
};
