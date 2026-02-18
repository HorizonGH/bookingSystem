'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // UI model used by this page (keeps the existing card shape)
  type UIPlan = {
    id?: string;
    name: string;
    description?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    highlighted?: boolean;
    color?: string;
    badge?: string;
    planType?: number;
  };

  // fallback (used while API loads or if the API fails)
  const [plans, setPlans] = useState<UIPlan[]>([
    {
      name: 'Starter',
      description: 'Perfecto para negocios que están comenzando',
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        'Hasta 100 reservas/mes',
        'Calendario básico',
        'Notificaciones por email',
        '1 usuario',
        'Soporte por email',
        'Panel de control básico'
      ],
      highlighted: false,
      color: 'from-secondary-500 to-secondary-600',
      planType: 0
    },
    {
      name: 'Professional',
      description: 'Ideal para negocios en crecimiento',
      monthlyPrice: 79,
      yearlyPrice: 790,
      features: [
        'Reservas ilimitadas',
        'Calendario avanzado',
        'Notificaciones SMS + Email',
        'Hasta 5 usuarios',
        'Soporte prioritario 24/7',
        'Dashboard completo con analytics',
        'Integración con Google Calendar',
        'Recordatorios automáticos',
        'Personalización de marca'
      ],
      highlighted: true,
      color: 'from-primary-500 to-secondary-600',
      badge: 'Más Popular',
      planType: 2
    },
    {
      name: 'Enterprise',
      description: 'Para negocios grandes y cadenas',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: [
        'Todo en Professional',
        'Usuarios ilimitados',
        'Múltiples ubicaciones',
        'API completa',
        'Gerente de cuenta dedicado',
        'Capacitación personalizada',
        'White-label disponible',
        'SLA garantizado',
        'Integraciones personalizadas',
        'Reportes avanzados'
      ],
      highlighted: false,
      color: 'from-purple-500 to-pink-600',
      planType: 3
    }
  ]);

  // Load plans from API and map them into the UI shape. Supports APIs that
  // return separate entries per billingCycle (monthly/yearly) or a single
  // price per plan.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { planService } = await import('../../services/plan');
        const apiPlans = await planService.getPlans();

        const grouped = new Map<number, typeof apiPlans>();
        apiPlans.forEach((p) => {
          const pt = Number(p.planType ?? 0);
          if (!grouped.has(pt)) grouped.set(pt, [] as any);
          grouped.get(pt)!.push(p);
        });

        const mapped: UIPlan[] = Array.from(grouped.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([pt, entries]) => {
            const monthly = entries.find((e) => e.billingCycle && e.billingCycle.toLowerCase().includes('month'));
            const yearly = entries.find((e) => e.billingCycle && e.billingCycle.toLowerCase().includes('year'));
            const monthlyPrice = monthly ? monthly.price : entries[0].price ?? 0;
            const yearlyPrice = yearly ? yearly.price : monthlyPrice;

            const entry = entries[0];
            const name = entry.name || (pt === 0 ? 'Starter' : pt === 1 ? 'Basic' : pt === 2 ? 'Professional' : 'Enterprise');
            const description = entry.description || '';

            const features: string[] = [];
            const safeReservations = entry.maxReservationsPerMonth === -1 ? Infinity : entry.maxReservationsPerMonth;
            const safeWorkers = entry.maxWorkers === -1 ? Infinity : entry.maxWorkers;
            const safeServices = entry.maxServices === -1 ? Infinity : entry.maxServices;

            if (safeReservations !== undefined && safeReservations !== null) features.push(safeReservations === Infinity ? 'Reservas ilimitadas' : `${safeReservations} reservas/mes`);
            if (safeWorkers !== undefined && safeWorkers !== null) features.push(safeWorkers === Infinity ? 'Trabajadores ilimitados' : `${safeWorkers} trabajadores`);
            if (safeServices !== undefined && safeServices !== null) features.push(safeServices === Infinity ? 'Servicios ilimitados' : `${safeServices} servicios`);
            if (entry.hasCustomBranding) features.push('Personalización de marca');
            if (entry.hasAnalytics) features.push('Analytics');
            if (entry.hasApiAccess) features.push('Acceso a API');

            return {
              id: entry.id,
              name,
              description,
              monthlyPrice,
              yearlyPrice,
              features: features.length ? features : ['Funciones estándar'],
              highlighted: pt === 2,
              color: pt === 2 ? 'from-primary-500 to-secondary-600' : pt === 3 ? 'from-purple-500 to-pink-600' : 'from-secondary-500 to-secondary-600',
              badge: pt === 2 ? 'Más Popular' : undefined,
              planType: pt
            };
          });

        if (mounted && mapped.length > 0) setPlans(mapped);
      } catch (err) {
        console.warn('Could not load plans from API, using fallback.', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getPrice = (plan: UIPlan) => {
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const period = billingCycle === 'monthly' ? 'mes' : 'año';
    return { price, period };
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

       {/* Hero Content */}
      <div className="container mx-auto px-4 pt-10 pb-8 md:pt-20 md:pb-12 relative z-10 text-center">
         <Link 
            href="/"
            className="inline-flex items-center text-secondary-600 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 transition-colors duration-200 mb-8 font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
             Volver al inicio
          </Link>
      

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-dark dark:text-light mb-4 md:mb-6">
          Precios <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">simples y transparentes</span>
        </h1>
        <p className="text-base md:text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto mb-8 md:mb-12">
          Elige el plan perfecto para potenciar tu negocio hoy mismo. Actualiza, degrada o cancela en cualquier momento.
        </p>

        {/* Custom Toggle Switch */}
        <div className="flex justify-center mb-8 md:mb-16">
          <div className="bg-white/50 dark:bg-dark-light/50 backdrop-blur-md p-1.5 rounded-2xl border border-light-darker dark:border-secondary-700 shadow-lg inline-flex relative">
             <div className="absolute -top-3 -right-6 md:-right-10 rotate-12 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md z-20">
                Ahorra 17% 🔥
             </div>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-light-darker dark:hover:bg-secondary-800/50'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-light-darker dark:hover:bg-secondary-800/50'
              }`}
            >
              Facturación Anual
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
        <div className="container mx-auto px-4 pb-16 md:pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
          {plans.map((plan, index) => {
            const { price, period } = getPrice(plan);

            return (
              <div
                key={index}
                className={`group relative bg-white dark:bg-dark-light rounded-3xl transition-all duration-500 backdrop-blur-sm
                  ${plan.highlighted 
                    ? 'shadow-2xl shadow-primary-500/20 md:scale-105 border-2 border-primary-500 z-10' 
                    : 'shadow-xl border border-light-darker dark:border-secondary-700 hover:shadow-2xl hover:-translate-y-2'
                  }
                `}
              >
                 {plan.highlighted && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                )}
                
                <div className="p-8 sm:p-10">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-primary-600 dark:text-primary-400' : 'text-dark dark:text-light'}`}>
                        {plan.name}
                    </h3>
                    <p className="text-secondary-500 dark:text-secondary-400 text-sm leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8 flex items-baseline gap-1">
                    {price === 0 ? (
                      <span className="text-4xl md:text-5xl font-extrabold text-dark dark:text-light">Gratis</span>
                    ) : (
                      <span className="text-4xl md:text-5xl font-extrabold text-dark dark:text-light">€{price}</span>
                    )}
                    {price !== 0 && <span className="text-secondary-500 font-medium">/{period}</span>}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/signup?planType=${plan.planType ?? index}`}
                    className={`block w-full py-4 rounded-xl font-bold text-center transition-all duration-300 shadow-md transform active:scale-95
                      ${plan.highlighted 
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-primary-500/40 hover:-translate-y-1' 
                        : 'bg-light-darker dark:bg-secondary-800 text-dark dark:text-light hover:bg-secondary-200 dark:hover:bg-secondary-700'
                      }`}
                  >
                    Empezar Ahora
                  </Link>

                   {/* Divider */}
                   <div className="my-8 border-t border-light-darker dark:border-secondary-700/50"></div>

                  {/* Features */}
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-secondary-600 dark:text-secondary-300 font-medium text-sm">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 
                            ${plan.highlighted ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500'}
                        `}>
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
       {/* FAQ Section (Optional addition for professional look) */}
       <div className="container mx-auto px-4 pb-24 max-w-4xl relative z-10">
         <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark dark:text-light mb-4">Preguntas Frecuentes</h2>
            <p className="text-secondary-600 dark:text-secondary-400">¿Tienes dudas? Aquí tenemos las respuestas.</p>
         </div>
         
         <div className="grid gap-6">
            <div className="bg-white dark:bg-dark-light rounded-2xl p-6 shadow-lg border border-light-darker dark:border-secondary-700 hover:border-primary-500/30 transition-colors">
                <h3 className="text-lg font-bold text-dark dark:text-light mb-2">¿Puedo cambiar de plan después?</h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu panel de control. Los cambios de precio se prorratearán.</p>
            </div>
            <div className="bg-white dark:bg-dark-light rounded-2xl p-6 shadow-lg border border-light-darker dark:border-secondary-700 hover:border-primary-500/30 transition-colors">
                <h3 className="text-lg font-bold text-dark dark:text-light mb-2">¿Hay contratos a largo plazo?</h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">No, nuestros planes son mensuales o anuales y puedes cancelar en cualquier momento sin penalizaciones.</p>
            </div>
         </div>
       </div>

    </div>
  );
}