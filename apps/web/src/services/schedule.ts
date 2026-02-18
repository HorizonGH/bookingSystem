import { apiClient } from './api';

/**
 * Day of week enumeration (0 = Sunday, 6 = Saturday)
 */
export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

/**
 * Schedule type (Recurring or Override)
 */
export type ScheduleType = 'Recurring' | 'Override';

/**
 * Worker schedule data transfer object
 */
export interface WorkerScheduleDto {
  id: string;
  workerId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm:ss format
  endTime: string; // HH:mm:ss format
  isAvailable: boolean;
  specificDate: string | null; // YYYY-MM-DD or null for recurring
  scheduleType: ScheduleType;
  created: string;
  lastModified: string | null;
}

/**
 * Request to create a worker schedule
 */
export interface CreateWorkerScheduleRequest {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm:ss format
  endTime: string; // HH:mm:ss format
  isAvailable: boolean;
  specificDate?: string | null; // YYYY-MM-DD format for specific date override
}

/**
 * Request to update a worker schedule
 */
export interface UpdateWorkerScheduleRequest {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm:ss format
  endTime: string; // HH:mm:ss format
  isAvailable: boolean;
  specificDate?: string | null;
}

/**
 * Request to batch create multiple schedules
 */
export interface BatchCreateSchedulesRequest {
  schedules: CreateWorkerScheduleRequest[];
}

/**
 * Time slot for availability
 */
export interface TimeSlotDto {
  startTime: string; // ISO 8601 DateTime
  endTime: string; // ISO 8601 DateTime
  isAvailable: boolean;
}

/**
 * Query parameters for getting schedules
 */
export interface GetSchedulesParams {
  date?: string; // YYYY-MM-DD
  includeInactive?: boolean;
}

/**
 * Query parameters for getting availability
 */
export interface GetAvailabilityParams {
  date: string; // YYYY-MM-DD (required)
  serviceId?: string;
  slotDurationMinutes?: number; // default: 60
}

/**
 * Worker Schedule Service
 * Manages worker availability and booking time slots
 */
export const scheduleService = {
  /**
   * Create a single schedule entry for a worker
   * @param tenantId Tenant ID
   * @param workerId Worker ID
   * @param data Schedule data
   * @returns Created schedule
   */
  async createSchedule(
    tenantId: string,
    workerId: string,
    data: CreateWorkerScheduleRequest
  ): Promise<WorkerScheduleDto> {
    return apiClient.post<WorkerScheduleDto>(
      `/tenants/${tenantId}/workers/${workerId}/schedules`,
      data
    );
  },

  /**
   * Batch create multiple schedule entries at once (max 50)
   * Useful for setting up a full week schedule
   * @param tenantId Tenant ID
   * @param workerId Worker ID
   * @param data Batch schedules data
   * @returns Array of created schedules
   */
  async batchCreateSchedules(
    tenantId: string,
    workerId: string,
    data: BatchCreateSchedulesRequest
  ): Promise<WorkerScheduleDto[]> {
    return apiClient.post<WorkerScheduleDto[]>(
      `/tenants/${tenantId}/workers/${workerId}/schedules/batch`,
      data
    );
  },

  /**
   * Update an existing schedule entry
   * @param tenantId Tenant ID
   * @param workerId Worker ID
   * @param scheduleId Schedule ID
   * @param data Updated schedule data
   * @returns Updated schedule
   */
  async updateSchedule(
    tenantId: string,
    workerId: string,
    scheduleId: string,
    data: UpdateWorkerScheduleRequest
  ): Promise<WorkerScheduleDto> {
    return apiClient.put<WorkerScheduleDto>(
      `/tenants/${tenantId}/workers/${workerId}/schedules/${scheduleId}`,
      data
    );
  },

  /**
   * Delete a schedule entry
   * @param tenantId Tenant ID
   * @param workerId Worker ID
   * @param scheduleId Schedule ID
   */
  async deleteSchedule(
    tenantId: string,
    workerId: string,
    scheduleId: string
  ): Promise<void> {
    return apiClient.delete<void>(
      `/tenants/${tenantId}/workers/${workerId}/schedules/${scheduleId}`
    );
  },

  /**
   * Get a specific schedule entry by ID
   * @param tenantId Tenant ID
   * @param workerId Worker ID
   * @param scheduleId Schedule ID
   * @returns Schedule data
   */
  async getScheduleById(
    tenantId: string,
    workerId: string,
    scheduleId: string
  ): Promise<WorkerScheduleDto> {
    return apiClient.get<WorkerScheduleDto>(
      `/tenants/${tenantId}/workers/${workerId}/schedules/${scheduleId}`
    );
  },

  /**
   * Get all schedule entries for a worker with optional filtering
   * @param tenantId Tenant ID
   * @param workerId Worker ID
   * @param params Optional query parameters
   * @returns Array of schedules
   */
  async getWorkerSchedules(
    tenantId: string,
    workerId: string,
    params?: GetSchedulesParams
  ): Promise<WorkerScheduleDto[]> {
    const queryParams = new URLSearchParams();

    if (params?.date) {
      queryParams.append('date', params.date);
    }
    if (params?.includeInactive !== undefined) {
      queryParams.append('includeInactive', params.includeInactive.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/tenants/${tenantId}/workers/${workerId}/schedules${
      queryString ? `?${queryString}` : ''
    }`;

    return apiClient.get<WorkerScheduleDto[]>(endpoint);
  },

  /**
   * Get available time slots for a worker on a specific date
   * This is a PUBLIC endpoint (no auth required) for booking calendars
   * @param tenantId Tenant ID
   * @param workerId Worker ID
   * @param params Availability parameters (date is required)
   * @returns Array of time slots
   */
  async getAvailableTimeSlots(
    tenantId: string,
    workerId: string,
    params: GetAvailabilityParams
  ): Promise<TimeSlotDto[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('date', params.date);

    if (params.serviceId) {
      queryParams.append('serviceId', params.serviceId);
    }
    if (params.slotDurationMinutes) {
      queryParams.append('slotDurationMinutes', params.slotDurationMinutes.toString());
    }

    return apiClient.get<TimeSlotDto[]>(
      `/tenants/${tenantId}/workers/${workerId}/availability?${queryParams.toString()}`
    );
  },
};

/**
 * Helper function to create a standard work week schedule (Monday-Friday 9-5)
 * @param tenantId Tenant ID
 * @param workerId Worker ID
 * @param startTime Start time (default: "09:00:00")
 * @param endTime End time (default: "17:00:00")
 * @returns Array of created schedules
 */
export async function setupStandardWorkWeek(
  tenantId: string,
  workerId: string,
  startTime: string = '09:00:00',
  endTime: string = '17:00:00'
): Promise<WorkerScheduleDto[]> {
  return scheduleService.batchCreateSchedules(tenantId, workerId, {
    schedules: [
      { dayOfWeek: DayOfWeek.Monday, startTime, endTime, isAvailable: true },
      { dayOfWeek: DayOfWeek.Tuesday, startTime, endTime, isAvailable: true },
      { dayOfWeek: DayOfWeek.Wednesday, startTime, endTime, isAvailable: true },
      { dayOfWeek: DayOfWeek.Thursday, startTime, endTime, isAvailable: true },
      { dayOfWeek: DayOfWeek.Friday, startTime, endTime, isAvailable: true },
    ],
  });
}

/**
 * Helper function to format time from Date to HH:mm:ss
 */
export function formatTimeToHHMMSS(date: Date): string {
  return date.toTimeString().split(' ')[0];
}

/**
 * Helper function to format date to YYYY-MM-DD
 */
export function formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to get day of week name
 */
export function getDayOfWeekName(dayOfWeek: DayOfWeek): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayOfWeek];
}

/**
 * Helper function to parse time string (HH:mm:ss or HH:mm) to display format
 */
export function formatTimeToDisplay(time: string): string {
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}
