import { apiClient } from './api';
import { PlanType } from './auth';

export interface WorkerDto {
  id: string;
  userId: string;
  tenantId: string;
  jobTitle?: string;
  bio?: string;
  profileImageUrl?: string;
  isAvailableForBooking: boolean;
  // User info (populated from related user)
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface CreateWorkerRequest {
  userId?: string; // optional: allow creating worker without linking a user
  tenantId?: string;
  email?: string;
  jobTitle?: string;
  bio?: string;
  profileImageUrl?: string;
  isAvailableForBooking?: boolean;
}

export interface UpdateWorkerRequest {
  userId?: string;
  tenantId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  jobTitle?: string;
  bio?: string;
  profileImageUrl?: string;
  isAvailableForBooking?: boolean;
}

// Plan worker limits
export const PLAN_WORKER_LIMITS: Record<PlanType, number> = {
  [PlanType.Free]: 1,
  [PlanType.Basic]: 3,
  [PlanType.Professional]: 20,
  [PlanType.Enterprise]: Infinity,
};

/**
 * Get the maximum number of workers allowed for a given plan
 */
export function getMaxWorkersForPlan(planType: PlanType | number): number {
  // Handle numeric plan type (from API)
  const plan = typeof planType === 'number' ? planType as PlanType : planType;
  return PLAN_WORKER_LIMITS[plan] ?? 1;
}

/**
 * Check if adding another worker is allowed for the given plan
 */
export function canAddWorker(planType: PlanType | number, currentWorkerCount: number): boolean {
  const maxWorkers = getMaxWorkersForPlan(planType);
  return currentWorkerCount < maxWorkers;
}

/**
 * Get a human-readable description of worker limits for each plan
 */
export function getWorkerLimitDescription(planType: PlanType | number): string {
  const maxWorkers = getMaxWorkersForPlan(planType);
  if (maxWorkers === Infinity) {
    return 'Trabajadores ilimitados';
  }
  if (maxWorkers === 1) {
    return '1 trabajador (tú mismo)';
  }
  return `Hasta ${maxWorkers} trabajadores`;
}

export const workerService = {
  /**
   * Create a new worker
   *
   * If `tenantId` is provided on the payload, prefer the tenant-scoped
   * endpoint `/tenants/:tenantId/workers`. This keeps compatibility with
   * backends that expect tenant in the URL.
   */
  async createWorker(data: CreateWorkerRequest): Promise<WorkerDto> {
    if (data && data.tenantId) {
      return apiClient.post<WorkerDto>(`/tenants/${data.tenantId}/workers`, data);
    }
    return apiClient.post<WorkerDto>('/workers', data);
  },

  /**
   * Get a worker by ID
   */
  async getWorkerById(workerId: string): Promise<WorkerDto> {
    return apiClient.get<WorkerDto>(`/workers/${workerId}`);
  },

  /**
   * Update a worker
   */
  async updateWorker(workerId: string, data: UpdateWorkerRequest): Promise<WorkerDto> {
    return apiClient.put<WorkerDto>(`/workers/${workerId}`, data);
  },

  /**
   * Delete a worker
   */
  async deleteWorker(workerId: string): Promise<boolean> {
    return apiClient.delete<boolean>(`/workers/${workerId}`);
  },

  /**
   * Get all workers for a tenant
   *
   * Normalize response shapes so callers always receive a WorkerDto[]:
   * - API may return WorkerDto[] directly
   * - or { items: WorkerDto[] } (paginated)
   * - or { data: WorkerDto[] }
   */
  async getWorkersByTenant(tenantId: string): Promise<WorkerDto[]> {
    const res = await apiClient.get<any>(`/tenants/${tenantId}/workers`);

    if (!res) return [];
    if (Array.isArray(res)) return res as WorkerDto[];
    // Backend returns { workers: [...] , ... } — handle explicitly
    if (Array.isArray(res.workers)) return res.workers as WorkerDto[];
    if (Array.isArray(res.items)) return res.items as WorkerDto[];
    if (Array.isArray(res.data)) return res.data as WorkerDto[];

    // As a last resort, find the first array anywhere in the response object
    const firstArray = Object.values(res).find((v) => Array.isArray(v)) as WorkerDto[] | undefined;
    return firstArray ?? [];
  },

  /**
   * Get available workers for booking (only those with isAvailableForBooking = true)
   */
  async getAvailableWorkersForBooking(tenantId: string): Promise<WorkerDto[]> {
    const workers = await this.getWorkersByTenant(tenantId);
    return workers.filter(worker => worker.isAvailableForBooking);
  },

  /**
   * Get a worker by the linked userId. Returns null when not found.
   * Tries common response shapes (`WorkerDto`, `WorkerDto[]`, `{ worker }`, `{ data }`).
   */
  async getWorkerByUserId(userId: string): Promise<WorkerDto | null> {
    if (!userId) return null;

    // Attempt a query endpoint; backend may support `/workers?userId=...`
    const res = await apiClient.get<any>(`/workers?userId=${encodeURIComponent(userId)}`);
    if (!res) return null;

    // If direct object with id -> assume it's a WorkerDto
    if (res && typeof res === 'object' && res.id && res.userId === userId) {
      return res as WorkerDto;
    }

    // If array, return first matching
    if (Array.isArray(res)) {
      return (res as WorkerDto[]).find(w => w.userId === userId) ?? null;
    }

    // If wrapped shapes
    if (res.worker && typeof res.worker === 'object') return res.worker as WorkerDto;
    if (Array.isArray(res.items)) return (res.items as WorkerDto[]).find(w => w.userId === userId) ?? null;
    if (Array.isArray(res.data)) return (res.data as WorkerDto[]).find(w => w.userId === userId) ?? null;
    if (Array.isArray(res.workers)) return (res.workers as WorkerDto[]).find(w => w.userId === userId) ?? null;

    // Find any array property that contains matching worker
    for (const val of Object.values(res)) {
      if (Array.isArray(val)) {
        const found = (val as any[]).find((w) => w && w.userId === userId);
        if (found) return found as WorkerDto;
      }
    }

    return null;
  },
};
