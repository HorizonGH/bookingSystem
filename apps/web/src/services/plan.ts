import { apiClient } from './api';

export interface PlanDto {
  id: string;
  name: string;
  description?: string;
  planType: number; // 0: Free, 1: Basic, 2: Professional, 3: Enterprise
  price: number;
  billingCycle?: string; // e.g. 'monthly' | 'yearly'
  maxWorkers?: number;
  maxServices?: number;
  maxReservationsPerMonth?: number;
  hasCustomBranding?: boolean;
  hasAnalytics?: boolean;
  hasApiAccess?: boolean;
  created?: string;
  lastModified?: string;
}

export const planService = {
  /**
   * Returns available plans from the backend.
   */
  async getPlans(): Promise<PlanDto[]> {
    return apiClient.get<PlanDto[]>('/plans');
  }
};
