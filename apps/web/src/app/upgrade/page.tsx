'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authService, User } from '../../services/auth';
import { planService, PlanDto } from '../../services/plan';
import { tenantService } from '../../services/tenant';
import { ApiError } from '../../services/api';
import PlanSelectWizard from '../../components/payments/PlanSelectWizard';

export default function UpgradePage() {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanDto | null>(null);
  const [currentPlanType, setCurrentPlanType] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [userData, planData] = await Promise.all([
          authService.getCurrentUser(),
          planService.getPlans().catch(() => [] as PlanDto[]),
        ]);

        // Guard: must be a TenantAdmin (check tenantId + role case-insensitive)
        const role = (userData.role || '').toLowerCase();
        if (!userData.tenantId && role !== 'superadmin') {
          setError('Solo los administradores de negocio pueden acceder a esta página.');
          setIsLoading(false);
          return;
        }

        setUser(userData);
        // Fetch tenant to know the current plan
        if (userData.tenantId) {
          try {
            const tenant = await tenantService.getTenantById(userData.tenantId);
            setCurrentPlanType(tenant.planType ?? 0);
          } catch {
            // non-critical
          }
        }
        // Show all paid plans — user can switch even if they already have an active plan
        const filtered = planData.filter((p) => p.planType > 0);
        setPlans(filtered);
        // if query param indicates a plan, preselect it
        try {
          const params = new URLSearchParams(window.location.search);
          const q = params.get('planType');
          if (q) {
            const n = parseInt(q, 10);
            if (!Number.isNaN(n)) {
              const found = filtered.find((pl) => pl.planType === n);
              if (found) setSelectedPlan(found);
            }
          }
        } catch {
          /* ignore outside browser */
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = `/login?returnTo=${encodeURIComponent('/upgrade')}`;
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
          <p className="text-secondary-600 dark:text-secondary-400">Cargando planes...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link href="/profile" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Volver al perfil
          </Link>
        </div>
      </div>
    );
  }

  // Plan names mapping
  const planNameMap: Record<number, string> = { 1: 'Basic', 2: 'Professional', 3: 'Enterprise' };

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10 max-w-4xl">
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

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-light mb-2">
            Cambiar Plan
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Selecciona un plan y completa el pago para activar tu suscripción.
          </p>
        </div>

        {/* Plan Selection or Wizard */}
        {!selectedPlan ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {plans.map((plan) => {
              const isCurrent = plan.planType === currentPlanType;
              return (
              <button
                key={plan.id || plan.planType}
                onClick={() => setSelectedPlan(plan)}
                className={`group p-6 bg-white dark:bg-dark-light rounded-2xl border-2 transition-all text-left hover:shadow-xl ${
                  isCurrent
                    ? 'border-green-400 dark:border-green-600'
                    : 'border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500'
                }`}
              >
                {isCurrent && (
                  <span className="inline-block mb-2 text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    Plan actual
                  </span>
                )}
                <h3 className="text-lg font-bold text-dark dark:text-light mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {plan.name || planNameMap[plan.planType] || `Plan ${plan.planType}`}
                </h3>
                {plan.description && (
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                    {plan.description}
                  </p>
                )}
                <div className="text-2xl font-extrabold text-dark dark:text-light mb-1">
                  ${plan.price}
                  <span className="text-sm font-normal text-secondary-500">/{plan.billingCycle || 'mes'}</span>
                </div>
                <div className="mt-3 text-xs text-secondary-500 space-y-1">
                  {plan.maxWorkers && <p>Hasta {plan.maxWorkers} trabajadores</p>}
                  {plan.maxServices && <p>Hasta {plan.maxServices} servicios</p>}
                  {plan.maxReservationsPerMonth && <p>Hasta {plan.maxReservationsPerMonth} reservas/mes</p>}
                </div>
                <div className="mt-4 text-center">
                  <span className="inline-block px-4 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg group-hover:bg-primary-500 group-hover:text-white transition-all">
                    Seleccionar
                  </span>
                </div>
              </button>
              );
            })}

            {plans.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-8">
                <p className="text-secondary-500">No hay planes disponibles en este momento.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Selected plan header */}
            <div className="flex items-center justify-between mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
              <div>
                <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">Plan seleccionado:</span>
                <span className="ml-2 font-bold text-dark dark:text-light">
                  {selectedPlan.name || planNameMap[selectedPlan.planType]}
                </span>
                <span className="ml-2 text-primary-700 dark:text-primary-300 font-bold">
                  ${selectedPlan.price}/{selectedPlan.billingCycle || 'mes'}
                </span>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-sm font-semibold text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Cambiar plan
              </button>
            </div>

            <PlanSelectWizard
              tenantId={user!.tenantId!}
              planId={selectedPlan.id}
              planName={selectedPlan.name || planNameMap[selectedPlan.planType] || `Plan ${selectedPlan.planType}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
