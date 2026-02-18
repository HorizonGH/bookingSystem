'use client';

import { useEffect, useState } from 'react';
import { WorkerDto } from '../services/worker';
import { User } from '../services/auth';
import { scheduleService, WorkerScheduleDto, getDayOfWeekName, formatTimeToDisplay } from '../services/schedule';
import { reservationService, ReservationDto, ReservationStatus } from '../services/reservation';
import { ApiError } from '../services/api';

export default function ProfileWorkerWindow({ worker, user }: { worker: WorkerDto; user: User }) {
  const displayName = (worker.firstName || user.firstName || worker.jobTitle || 'Trabajador') + (worker.lastName ? ' ' + worker.lastName : '');
  const initial = (worker.firstName || user.firstName || worker.jobTitle || 'T')[0].toUpperCase();

  const [schedules, setSchedules] = useState<WorkerScheduleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      // Prefer worker.tenantId, fall back to user's tenantId
      const tenantId = worker.tenantId || user.tenantId;
      if (!tenantId) return;

      try {
        setIsLoading(true);
        setError(null);
        const res = await scheduleService.getWorkerSchedules(tenantId, worker.id);
        setSchedules(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Failed to load worker schedules', err);
        if (err instanceof ApiError) setError(err.message);
        else setError('Error al cargar horarios');
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchReservations = async () => {
      try {
        setIsLoadingReservations(true);
        setReservationsError(null);
        // fetch reservations for this worker (getAllReservations returns paginated response)
        const page = await reservationService.getAllReservations({ pageNumber: 1, pageSize: 50, filters: { workerId: worker.id } });
        const items = Array.isArray((page as any).items) ? (page as any).items as ReservationDto[] : [];

        // keep only upcoming and not-cancelled reservations
        const now = new Date();
        const upcoming = items
          .filter(r => r.reservationStatus !== ReservationStatus.Cancelled && new Date(r.startTime) >= now)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        setReservations(upcoming);
      } catch (err) {
        console.error('Failed to load reservations for worker', err);
        if (err instanceof ApiError) setReservationsError(err.message);
        else setReservationsError('Error al cargar reservas');
        setReservations([]);
      } finally {
        setIsLoadingReservations(false);
      }
    };

    fetchSchedules();
    fetchReservations();
  }, [worker.id, worker.tenantId, user.tenantId]);

  const recurring = schedules.filter(s => !s.specificDate);
  const overrides = schedules.filter(s => s.specificDate);

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 border border-light-darker dark:border-secondary-700 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-xl">
          {initial}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-dark dark:text-light truncate">{displayName}</h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">Trabajador</span>
          </div>
          {worker.jobTitle && <p className="text-sm text-secondary-500 mt-1">{worker.jobTitle}</p>}
          {worker.email && <p className="text-xs text-secondary-400 mt-2">{worker.email}</p>}
        </div>
      </div>

      {worker.bio && (
        <p className="text-sm text-secondary-500 mt-4 line-clamp-3">{worker.bio}</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${worker.isAvailableForBooking ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white dark:border-dark-light`} />
        <span className="text-sm text-secondary-500">{worker.isAvailableForBooking ? 'Disponible para reservas' : 'No disponible'}</span>
      </div>

      {/* Worker schedules (read-only view for the worker) */}
      <div className="mt-6 border-t border-light-darker dark:border-secondary-700 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-dark dark:text-light">Mis Turnos</h4>
          <p className="text-xs text-secondary-400">{isLoading ? 'Cargando...' : `${schedules.length} items`}</p>
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        {!isLoading && schedules.length === 0 && (
          <p className="text-sm text-secondary-500 mt-3">No hay turnos configurados.</p>
        )}

        {!isLoading && schedules.length > 0 && (
          <div className="mt-3 grid gap-3">
            {overrides.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-secondary-400 uppercase mb-2">Excepciones (fechas específicas)</div>
                <div className="grid gap-2">
                  {overrides.map(s => (
                    <div key={s.id} className="p-3 bg-light-darker dark:bg-dark rounded-xl border border-light-darker dark:border-secondary-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-dark dark:text-light">{new Date(s.specificDate!).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          <div className="text-xs text-secondary-500">{formatTimeToDisplay(s.startTime)} — {formatTimeToDisplay(s.endTime)}</div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${s.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {s.isAvailable ? 'Disponible' : 'Bloqueado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recurring.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-secondary-400 uppercase mb-2">Recurrentes (por semana)</div>
                <div className="grid gap-2">
                  {recurring.map(s => (
                    <div key={s.id} className="p-3 bg-light-darker dark:bg-dark rounded-xl border border-light-darker dark:border-secondary-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-dark dark:text-light">{getDayOfWeekName(s.dayOfWeek)}</div>
                          <div className="text-xs text-secondary-500">{formatTimeToDisplay(s.startTime)} — {formatTimeToDisplay(s.endTime)}</div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${s.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {s.isAvailable ? 'Disponible' : 'Bloqueado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming reservations for the worker */}
            <div className="pt-3 border-t border-light-darker dark:border-secondary-700">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-secondary-400 uppercase">Próximas Reservas</div>
                <div className="text-xs text-secondary-400">{isLoadingReservations ? 'Cargando...' : `${reservations.length}`}</div>
              </div>

              {reservationsError && <p className="text-sm text-red-500">{reservationsError}</p>}

              {isLoadingReservations && (
                <div className="flex items-center gap-3 text-secondary-500">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>Cargando reservas...</span>
                </div>
              )}

              {!isLoadingReservations && reservations.length === 0 && (
                <p className="text-sm text-secondary-500 mt-2">No hay reservas próximas asignadas.</p>
              )}

              {!isLoadingReservations && reservations.length > 0 && (
                <div className="grid gap-2">
                  {reservations.slice(0, 6).map(r => (
                    <div key={r.id} className="p-3 bg-white dark:bg-dark rounded-xl border border-light-darker dark:border-secondary-700 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-dark dark:text-light">{new Date(r.startTime).toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-xs text-secondary-500">{r.clientName} • {r.clientEmail}</div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${r.reservationStatus === 'confirmed' ? 'bg-green-100 text-green-700' : r.reservationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-secondary-100 text-secondary-700'}`}>
                          {r.reservationStatus}
                        </div>
                        <div className="text-xs text-secondary-400 mt-2">{r.price ? `${r.price} €` : 'Gratis'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
