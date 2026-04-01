import { apiClient } from './api';

export type AnalyticsInterval = 'Day' | 'Week' | 'Month';

export interface AnalyticsOverviewResponse {
  startDate: string;
  endDate: string;
  totalReservations: number;
  totalCancellations: number;
  totalRevenue: number;
  activeWorkers: number;
  activeUsers: number;
  reservationsByInterval: Array<{ periodStart: string; count: number }>;
  revenueByInterval: Array<{ periodStart: string; amount: number }>;
}

export interface ReservationsAnalyticsResponse {
  totalReservations: number;
  totalCancellations: number;
  byStatus: Array<{ status: string; count: number }>;
  byWorker: Array<{ workerId: string; count: number }>;
  byService: Array<{ serviceId: string; count: number }>;
  byDay: Array<{ day: string; count: number }>;
}

export interface WorkerAnalyticsResponse {
  workerId: string;
  startDate: string;
  endDate: string;
  totalReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  noShowReservations: number;
  bookedHours: number;
  conversionRate: number;
  noShowRate: number;
}

export interface CustomersAnalyticsResponse {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  lifetimeRevenue: number;
  averageBookingIntervalDays: number;
}

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  interval?: AnalyticsInterval;
  workerId?: string;
  serviceId?: string;
  status?: string;
}

function toQuery(params?: AnalyticsQuery): string {
  const query = new URLSearchParams();
  if (!params) return '';

  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.interval) query.append('interval', params.interval);
  if (params.workerId) query.append('workerId', params.workerId);
  if (params.serviceId) query.append('serviceId', params.serviceId);
  if (params.status) query.append('status', params.status);

  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const analyticsService = {
  async getOverview(tenantId: string, params?: AnalyticsQuery): Promise<AnalyticsOverviewResponse> {
    const qs = toQuery(params);
    return apiClient.get<AnalyticsOverviewResponse>(`/tenants/${tenantId}/analytics/overview${qs}`);
  },

  async getReservations(tenantId: string, params?: AnalyticsQuery): Promise<ReservationsAnalyticsResponse> {
    const qs = toQuery(params);
    return apiClient.get<ReservationsAnalyticsResponse>(`/tenants/${tenantId}/analytics/reservations${qs}`);
  },

  async getWorker(tenantId: string, workerId: string, params?: AnalyticsQuery): Promise<WorkerAnalyticsResponse> {
    const qs = toQuery(params);
    return apiClient.get<WorkerAnalyticsResponse>(`/tenants/${tenantId}/analytics/workers/${workerId}${qs}`);
  },

  async getCustomers(tenantId: string, params?: AnalyticsQuery): Promise<CustomersAnalyticsResponse> {
    const qs = toQuery(params);
    return apiClient.get<CustomersAnalyticsResponse>(`/tenants/${tenantId}/analytics/customers${qs}`);
  },
};
