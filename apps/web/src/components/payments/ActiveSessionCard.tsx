'use client';

import { useEffect, useState } from 'react';
import {
  PaymentSession,
  paymentService,
  paymentMethodLabel,
  normalizeSession,
} from '../../services/payment';
import { ApiError } from '../../services/api';

const STATUS_LABELS: Record<string, string> = {
  Active: 'Activa',
  Completed: 'Completada',
  Expired: 'Expirada',
};

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface ActiveSessionCardProps {
  tenantId: string;
}

export default function ActiveSessionCard({ tenantId }: ActiveSessionCardProps) {
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    paymentService
      .getActiveSession(tenantId)
      .then((raw) => setSession(raw ? normalizeSession(raw) : null))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [tenantId]);

  const handleCancel = async () => {
    if (!session) return;
    if (!window.confirm('¿Cancelar la sesión de pago activa? Esta acción no se puede deshacer.')) return;

    const s = session as any;
    const sessionId =
      s.id ?? s.Id ?? s.sessionId ?? s.SessionId ?? s.paymentSessionId ?? s.PaymentSessionId ?? '';
    console.log('[ActiveSessionCard] cancelling sessionId:', sessionId, 'raw session:', session);

    if (!sessionId) {
      setError('No se pudo determinar el ID de la sesión.');
      return;
    }

    setCancelling(true);
    setError(null);
    try {
      await paymentService.cancelSession(tenantId, sessionId);
      setSession(null);
    } catch (err) {
      console.error('[ActiveSessionCard] cancel error', err);
      if (err instanceof ApiError) {
        setError(err.message || 'Error al cancelar la sesión');
      } else {
        setError('Error al cancelar la sesión');
      }
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-secondary-500 py-2">
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Comprobando sesión de pago…
      </div>
    );
  }

  if (!session) return null;

  const statusLabel = STATUS_LABELS[session.status] ?? session.status;
  const statusColor = STATUS_COLORS[session.status] ?? '';
  const expiresAt = new Date(session.expiresAt).toLocaleString();

  return (
    <div className="rounded-xl border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-secondary-50 dark:bg-secondary-800/40 border-b border-light-darker dark:border-secondary-700">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-sm font-semibold text-dark dark:text-light">Sesión de pago pendiente</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Details */}
      <div className="divide-y divide-light-darker dark:divide-secondary-700 text-sm">
        <Row label="Método" value={paymentMethodLabel(session.paymentMethod)} />
        <Row label="Monto" value={`${session.expectedAmount} ${session.currency}`} />
        <Row label="Referencia" value={<span className="font-mono">{session.referenceCode}</span>} />
        <Row label="Expira" value={expiresAt} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 py-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-light-darker dark:border-secondary-700">
        {session.status === 'Active' && (
          <a
            href="/upgrade"
            className="flex-1 text-center py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Continuar pago
          </a>
        )}
        <button
          disabled={cancelling || session.status !== 'Active'}
          onClick={handleCancel}
          title={session.status === 'Active' ? 'Cancelar sesión' : 'Sólo se puede cancelar si la sesión está activa'}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50 shrink-0"
        >
          {cancelling ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-secondary-500 dark:text-secondary-400">{label}</span>
      <span className="text-dark dark:text-light font-medium">{value}</span>
    </div>
  );
}
