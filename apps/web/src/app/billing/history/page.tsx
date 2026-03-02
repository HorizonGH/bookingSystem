'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authService, User } from '../../../services/auth';
import { tenantService, TenantDto } from '../../../services/tenant';
import { ApiError } from '../../../services/api';
import PaymentHistory from '../../../components/payments/PaymentHistory';
import SubscriptionBadge from '../../../components/payments/SubscriptionBadge';

export default function BillingHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<TenantDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const userData = await authService.getCurrentUser();
        const role = (userData.role || '').toLowerCase();
        if (!userData.tenantId && role !== 'superadmin') {
          setError('Solo los administradores de negocio pueden acceder a esta página.');
          setIsLoading(false);
          return;
        }
        setUser(userData);
        if (userData.tenantId) {
          try {
            const t = await tenantService.getTenantById(userData.tenantId);
            setTenant(t);
          } catch {
            // not critical — badge just won't render
          }
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = `/login?returnTo=${encodeURIComponent('/billing/history')}`;
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
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link href="/profile" className="text-primary-600 dark:text-primary-400 hover:underline">
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

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10 max-w-5xl">
        {/* Back Link */}
        <Link
          href="/profile"
          className="inline-flex items-center text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 transition-colors duration-200 mb-6 group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al perfil
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-light mb-8">
          Facturación
        </h1>

        {/* Subscription Badge */}
        {tenant && (
          <div className="mb-8">
            <SubscriptionBadge
              planType={tenant.planType ?? 0}
              planName={tenant.name}
              isActive={tenant.isActive}
            />
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl border border-light-darker dark:border-secondary-700 p-6 sm:p-8">
          <PaymentHistory tenantId={user!.tenantId!} />
        </div>
      </div>
    </div>
  );
}
