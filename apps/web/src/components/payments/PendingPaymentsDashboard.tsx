'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Payment,
  paymentService,
} from '../../services/payment';
import { ApiError } from '../../services/api';
import { alertDialog } from '../../lib/dialog';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PendingPaymentsDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await paymentService.getPendingPayments();
      setPayments(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Error al cargar pagos pendientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleReview = async (paymentId: string, approve: boolean) => {
    setIsReviewing(true);
    try {
      await paymentService.reviewPayment(paymentId, {
        approve,
        adminNotes: reviewNotes.trim() || undefined,
      });
      await alertDialog(
        approve
          ? 'Pago aprobado correctamente. La suscripción del tenant ha sido activada.'
          : 'Pago rechazado. El tenant ha sido notificado.',
        approve ? '✅ Aprobado' : '❌ Rechazado'
      );
      setExpandedId(null);
      setReviewNotes('');
      fetchPayments();
    } catch (err) {
      if (err instanceof ApiError) {
        await alertDialog(err.message, 'Error');
      } else {
        await alertDialog('Error de red al procesar la revisión.', 'Error');
      }
    } finally {
      setIsReviewing(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setReviewNotes('');
    } else {
      setExpandedId(id);
      setReviewNotes('');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">
          Pagos Pendientes
        </h2>
        <button
          onClick={() => fetchPayments()}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold bg-light-darker dark:bg-dark rounded-lg hover:bg-light-darkest dark:hover:bg-dark-lighter transition-colors text-secondary-700 dark:text-secondary-300 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Cargando...
            </span>
          ) : (
            'Actualizar'
          )}
        </button>
      </div>

      {error && !isLoading && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {isLoading && payments.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && payments.length === 0 && !error && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-green-300 dark:text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium">No hay pagos pendientes de revisión.</p>
        </div>
      )}

      {/* Payment Cards */}
      <div className="space-y-4">
        {payments.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-dark-light border border-light-darker dark:border-secondary-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Summary Row */}
            <div
              className="p-4 sm:p-5 cursor-pointer flex flex-wrap items-center gap-x-6 gap-y-2"
              onClick={() => toggleExpand(p.id)}
            >
              <div className="flex-1 min-w-[140px]">
                <p className="font-bold text-dark dark:text-light">{p.senderName}</p>
                <p className="text-xs text-secondary-500">{p.tenantId}</p>
              </div>
              <div>
                <span className="text-lg font-bold text-dark dark:text-light">
                  {p.amount.toFixed(2)} {p.currency}
                </span>
              </div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400">
                {formatDate(p.transferTime)}
              </div>
              <div>
                {p.transactionNumber && (
                  <span className="text-xs font-mono bg-light-darker dark:bg-dark px-2 py-1 rounded">
                    TX: {p.transactionNumber}
                  </span>
                )}
                {p.confirmationNumber && (
                  <span className="text-xs font-mono bg-light-darker dark:bg-dark px-2 py-1 rounded ml-1">
                    Conf: {p.confirmationNumber}
                  </span>
                )}
              </div>
              <div>
                <svg
                  className={`w-5 h-5 text-secondary-400 transition-transform ${expandedId === p.id ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded Review Area */}
            {expandedId === p.id && (
              <div className="border-t border-light-darker dark:border-secondary-700 p-4 sm:p-5 bg-light-darker/20 dark:bg-dark/30">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Remitente</p>
                    <p className="font-semibold text-dark dark:text-light">{p.senderName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Fecha de transferencia</p>
                    <p className="font-semibold text-dark dark:text-light">{formatDate(p.transferTime)}</p>
                  </div>
                  {p.transactionNumber && (
                    <div>
                      <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Nro. Transacción</p>
                      <p className="font-mono font-semibold text-dark dark:text-light">{p.transactionNumber}</p>
                    </div>
                  )}
                  {p.confirmationNumber && (
                    <div>
                      <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Nro. Confirmación</p>
                      <p className="font-mono font-semibold text-dark dark:text-light">{p.confirmationNumber}</p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">Captura de pantalla</p>
                    {p.screenshotUrl ? (
                      <a
                        href={p.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:underline"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ver captura
                      </a>
                    ) : (
                      <span className="text-secondary-400 text-sm">No disponible</span>
                    )}
                  </div>
                </div>

                {/* Notes + Actions */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-secondary-500 uppercase tracking-wider mb-1">
                      Notas del administrador
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={2}
                      placeholder="Notas opcionales..."
                      className="w-full px-3 py-2 rounded-lg border border-light-darker dark:border-secondary-600 bg-white dark:bg-dark text-dark dark:text-light text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(p.id, true)}
                      disabled={isReviewing}
                      className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isReviewing && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReview(p.id, false)}
                      disabled={isReviewing}
                      className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isReviewing && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
