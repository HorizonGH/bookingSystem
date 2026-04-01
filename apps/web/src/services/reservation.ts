import { apiClient } from './api';

export enum ReservationStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Completed = 'completed',
}

export interface ReservationDto {
  id: string;
  tenantId: string;
  serviceId: string;
  workerId: string;
  clientId: string;
  startTime: string;
  endTime: string;
  reservationStatus: ReservationStatus;
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

export interface CreateReservationRequest {
  tenantId: string;
  serviceId: string;
  workerId: string;
  startTime: string;
  endTime: string;
  reservationStatus: ReservationStatus;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  price: number;
  notes?: string;
}

export interface UpdateReservationRequest {
  tenantId?: string;
  serviceId?: string;
  workerId?: string;
  clientId?: string;
  startTime?: string;
  endTime?: string;
  reservationStatus?: ReservationStatus;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  price?: number;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  reminderSent?: boolean;
  confirmationSent?: boolean;
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

export const reservationService = {
  /**
   * Create a new reservation
   */
  async createReservation(data: CreateReservationRequest): Promise<ReservationDto> {
    return apiClient.post<ReservationDto>('/reservations', data);
  },

  /**
   * Get a reservation by ID
   */
  async getReservationById(id: string): Promise<ReservationDto> {
    return apiClient.get<ReservationDto>(`/reservations/${id}`);
  },

  /**
   * Get all reservations with pagination, filtering, and sorting
   */
  async getAllReservations(params?: PaginationRequest): Promise<PaginatedResponse<ReservationDto>> {
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
    const endpoint = queryString ? `/reservations?${queryString}` : '/reservations';

    return apiClient.get<PaginatedResponse<ReservationDto>>(endpoint);
  },

  /**
   * Update a reservation
   */
  async updateReservation(id: string, data: UpdateReservationRequest): Promise<ReservationDto> {
    return apiClient.put<ReservationDto>(`/reservations/${id}`, data);
  },

  /**
   * Delete a reservation
   */
  async deleteReservation(id: string): Promise<void> {
    return apiClient.delete<void>(`/reservations/${id}`);
  },

  /**
   * Cancel a reservation (tenant admin)
   */
  async cancelReservation(tenantId: string, reservationId: string, cancellationReason?: string): Promise<void> {
    const payload = cancellationReason ? { cancellationReason } : undefined;
    await apiClient.put<void>(`/tenants/${tenantId}/reservations/${reservationId}/cancel`, payload);
  },
};