'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { reservationService, ReservationDto, ReservationStatus } from '../services/reservation';
import { ApiError } from '../services/api';
import { promptDialog } from '../lib/dialog';
import MessagePopup from './MessagePopup';

interface TenantReservationsDashboardProps {
  tenantId: string;
}

type PopupState = { type: 'success' | 'error' | 'info'; message: string } | null;

type StatusKey = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'unknown';

function normalizeStatus(status: ReservationDto['reservationStatus'] | string | number): StatusKey {
  if (typeof status === 'string') {
    const key = status.toLowerCase();
    if (key === 'pending') return 'pending';
    if (key === 'confirmed') return 'confirmed';
    if (key === 'cancelled' || key === 'canceled') return 'cancelled';
    if (key === 'completed') return 'completed';
    return 'unknown';
  }

  if (typeof status === 'number') {
    if (status === 0) return 'confirmed';
    if (status === 1) return 'pending';
    if (status === 2) return 'cancelled';
    if (status === 3) return 'completed';
  }

  return 'unknown';
}

function statusLabel(status: StatusKey): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'confirmed':
      return 'Confirmada';
    case 'cancelled':
      return 'Cancelada';
    case 'completed':
      return 'Completada';
    default:
      return 'Desconocido';
  }
}

function statusClass(status: StatusKey): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'confirmed':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'completed':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-secondary-100 text-secondary-700';
  }
}

export default function TenantReservationsDashboard({ tenantId }: TenantReservationsDashboardProps) {
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [popup, setPopup] = useState<PopupState>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const page = await reservationService.getAllReservations({
        pageNumber: 1,
        pageSize: 50,
        filters: { tenantId },
        sortBy: 'startTime',
        sortDescending: true,
      });
      setReservations(Array.isArray(page?.items) ? page.items : []);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Error al cargar reservas');
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const canCancelStatus = useCallback((status: StatusKey) => {
    return status === 'pending' || status === 'confirmed';
  }, []);

  const handleCancel = useCallback(async (reservation: ReservationDto) => {
    const status = normalizeStatus(reservation.reservationStatus);
    if (!canCancelStatus(status)) return;

    const reason = await promptDialog('Motivo de la cancelacion (opcional):', '', 'Cancelar reserva');
    if (reason === null) return;

    setIsCancelling(reservation.id);
    try {
      const trimmed = reason.trim();
      await reservationService.cancelReservation(tenantId, reservation.id, trimmed ? trimmed : undefined);

      setReservations((prev) => prev.map((r) => {
        if (r.id !== reservation.id) return r;
        return {
          ...r,
          reservationStatus: ReservationStatus.Cancelled,
          cancellationReason: trimmed || r.cancellationReason,
          cancelledAt: new Date().toISOString(),
        };
      }));

      setPopup({ type: 'success', message: 'Reserva cancelada correctamente.' });
    } catch (err) {
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: err.message || 'Error al cancelar la reserva.' });
      } else {
        setPopup({ type: 'error', message: 'Error al cancelar la reserva.' });
      }
    } finally {
      setIsCancelling(null);
    }
  }, [tenantId, canCancelStatus]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return reservations
      .slice()
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .filter((r) => new Date(r.startTime) >= now || normalizeStatus(r.reservationStatus) !== 'completed');
  }, [reservations]);

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 md:p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-dark dark:text-light">Reservas del negocio</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Gestiona cancelaciones y seguimiento.</p>
        </div>
        <button
          onClick={() => fetchReservations()}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && !isLoading && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 text-secondary-500">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          Cargando reservas...
        </div>
      )}

      {!isLoading && upcoming.length === 0 && !error && (
        <div className="text-center py-8 text-secondary-500">No hay reservas para mostrar.</div>
      )}

      {!isLoading && upcoming.length > 0 && (
        <div className="space-y-3">
          {upcoming.map((reservation) => {
            const status = normalizeStatus(reservation.reservationStatus);
            const canCancel = canCancelStatus(status);
            return (
              <div
                key={reservation.id}
                className="p-4 rounded-xl border border-light-darker dark:border-secondary-700 bg-light-darker/30 dark:bg-secondary-900/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-dark dark:text-light">Reserva #{reservation.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass(status)}`}>
                        {statusLabel(status)}
                      </span>
                    </div>
                    <div className="text-xs text-secondary-500">
                      {new Date(reservation.startTime).toLocaleString('es-ES')} • {reservation.clientName}
                    </div>
                    <div className="text-xs text-secondary-500">{reservation.clientEmail}</div>
                    {reservation.cancellationReason && status === 'cancelled' && (
                      <div className="text-xs text-red-500">Motivo: {reservation.cancellationReason}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      ${reservation.price}
                    </span>
                    <button
                      onClick={() => handleCancel(reservation)}
                      disabled={!canCancel || isCancelling === reservation.id}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        canCancel
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                      }`}
                    >
                      {isCancelling === reservation.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MessagePopup
        visible={popup !== null}
        type={popup?.type}
        message={popup?.message || ''}
        onClose={() => setPopup(null)}
      />
    </div>
  );
}
