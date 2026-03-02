'use client';

import { useState, useEffect } from 'react';
import {
  Payment,
  PaymentStatusStr,
  paymentService,
  paymentMethodLabel,
} from '../../services/payment';
import { ApiError } from '../../services/api';

const statusConfig: Record<string, { label: string; className: string }> = {
  Pending: {
    label: 'En revisión',
    className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  },
  Approved: {
    label: 'Aprobado',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  },
  Rejected: {
    label: 'Rechazado',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface PaymentHistoryProps {
  tenantId: string;
}

export default function PaymentHistory({ tenantId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await paymentService.getTenantPayments(tenantId);
        setPayments(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Error al cargar el historial de pagos');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [tenantId]);

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-light mb-6">
        Historial de Pagos
      </h2>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && payments.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-secondary-300 dark:text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-secondary-500 dark:text-secondary-400">No hay pagos registrados.</p>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-light-darker dark:border-secondary-700">
                  <th className="pb-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Fecha</th>
                  <th className="pb-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Monto</th>
                  <th className="pb-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Moneda</th>
                  <th className="pb-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Estado</th>
                  <th className="pb-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Notas Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-darker dark:divide-secondary-700/50">
                {payments.map((p) => {
                  const st = statusConfig[p.status] ?? statusConfig['Pending'];
                  return (
                    <tr key={p.id} className="hover:bg-light-darker/30 dark:hover:bg-dark/30 transition-colors">
                      <td className="py-3 text-sm text-dark dark:text-light">{formatDate(p.createdAt)}</td>
                      <td className="py-3 text-sm font-semibold text-dark dark:text-light">
                        {p.amount.toFixed(2)}
                      </td>
                      <td className="py-3 text-sm text-secondary-600 dark:text-secondary-400">
                        {p.currency}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.className}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-secondary-500 dark:text-secondary-400 max-w-[200px] truncate">
                        {p.adminNotes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {payments.map((p) => {
              const st = statusConfig[p.status] ?? statusConfig['Pending'];
              return (
                <div key={p.id} className="p-4 bg-light-darker/30 dark:bg-dark/30 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-semibold text-dark dark:text-light">
                      {p.amount.toFixed(2)} {p.currency}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.className}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="text-xs text-secondary-500 space-y-1">
                    <p>{formatDate(p.createdAt)}</p>
                    {p.adminNotes && <p className="italic">Nota: {p.adminNotes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
