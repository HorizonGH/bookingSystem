'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authService, User } from '../../../../services/auth';
import { ApiError } from '../../../../services/api';
import PendingPaymentsDashboard from '../../../../components/payments/PendingPaymentsDashboard';

export default function AdminPendingPaymentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const userData = await authService.getCurrentUser();

        // Guard: must be SuperAdmin (case-insensitive)
        const role = (userData.role || '').toLowerCase();
        if (role !== 'superadmin') {
          setError('Acceso denegado. Solo los super administradores pueden ver esta página.');
          setIsLoading(false);
          return;
        }

        setUser(userData);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = `/login?returnTo=${encodeURIComponent('/admin/payments/pending')}`;
          return;
        }
        setError('Error al cargar. Inténtalo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4 font-semibold">{error}</p>
          <Link href="/profile" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Volver al perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10 max-w-6xl">
        {/* Back Link */}
        <Link
          href="/profile"
          className="inline-flex items-center text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 transition-colors duration-200 mb-6 group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Panel de administración
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
              <span className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
                Super Admin
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-light">
              Revisión de Pagos
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              Revisa y aprueba los comprobantes de pago de los tenants.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl border border-light-darker dark:border-secondary-700 p-6 sm:p-8">
          <PendingPaymentsDashboard />
        </div>
      </div>
    </div>
  );
}
