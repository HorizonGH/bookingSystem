'use client';

import { useEffect, useState } from 'react';
import { authService, User } from '../../services/auth';
import { planService, PlanDto } from '../../services/plan';
import { tenantService } from '../../services/tenant';
import { ApiError } from '../../services/api';
// PlanSelectWizard is reserved for future use when online payments are enabled

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
          <a href="/profile" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Volver al perfil
          </a>
        </div>
      </div>
    );
  }

  // Plan names mapping
  const planNameMap: Record<number, string> = { 1: 'Basic', 2: 'Professional', 3: 'Enterprise' };

  const getPlanFeatures = (plan: PlanDto): string[] => {
    const features: string[] = [];
    const safeReservations = plan.maxReservationsPerMonth === -1 ? Infinity : plan.maxReservationsPerMonth;
    const safeWorkers = plan.maxWorkers === -1 ? Infinity : plan.maxWorkers;
    const safeServices = plan.maxServices === -1 ? Infinity : plan.maxServices;

    if (safeReservations !== undefined && safeReservations !== null) {
      features.push(safeReservations === Infinity ? 'Reservas ilimitadas' : `${safeReservations} reservas/mes`);
    }
    if (safeWorkers !== undefined && safeWorkers !== null) {
      features.push(safeWorkers === Infinity ? 'Trabajadores ilimitados' : `${safeWorkers} trabajadores`);
    }
    if (safeServices !== undefined && safeServices !== null) {
      features.push(safeServices === Infinity ? 'Servicios ilimitados' : `${safeServices} servicios`);
    }
    if (plan.hasCustomBranding) {
      features.push('Personalización de marca');
    }
    if (plan.hasAnalytics) {
      features.push('Analytics avanzados');
    }
    if (plan.hasApiAccess) {
      features.push('Acceso a API');
    }

    if (features.length === 0) {
      features.push('Funciones estándar');
    }

    return features;
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10 max-w-4xl">
        {/* Back Link */}
        <a
          href="/profile"
          className="inline-flex items-center text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 transition-colors duration-200 mb-6 group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al perfil
        </a>

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
                  {getPlanFeatures(plan).map((feature, idx) => (
                    <p key={idx}>{feature}</p>
                  ))}
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

            {/* Contact via Instagram to acquire a premium plan */}
            <div className="flex flex-col items-center text-center gap-6 py-10 px-6 bg-white dark:bg-dark-light rounded-2xl border-2 border-primary-200 dark:border-primary-800 shadow-lg">
              {/* Instagram icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-md">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-dark dark:text-light mb-2">
                  ¿Quieres el plan{' '}
                  <span className="text-primary-600 dark:text-primary-400">
                    {selectedPlan.name || planNameMap[selectedPlan.planType]}
                  </span>
                  ?
                </h2>
                <p className="text-secondary-600 dark:text-secondary-400 max-w-sm mx-auto mb-4">
                  Por el momento los planes premium se gestionan de forma personalizada.
                  Escribinos por Instagram y te ayudamos a activar tu plan.
                </p>
                <div className="text-left max-w-md mx-auto">
                  <p className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Ventajas del plan</p>
                  <ul className="list-disc list-inside text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
                    {getPlanFeatures(selectedPlan).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <a
                href="https://www.instagram.com/_horizon.gh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Contactar en Instagram
              </a>

              <p className="text-sm text-secondary-400 dark:text-secondary-500">
                @_horizon.gh
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
