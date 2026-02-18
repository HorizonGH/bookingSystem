'use client';

import { PlanType } from '../services/auth';

interface PlanOption {
  type: PlanType;
  name: string;
  description: string;
  price: string;
  features: string[];
  maxWorkers: number;
}

interface SignupStage2Props {
  selectedPlan: PlanType;
  onPlanChange: (plan: PlanType) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  plans?: PlanOption[]; // optional — parent can provide API-driven plans
}

const PLANS: PlanOption[] = [
  {
    type: PlanType.Free,
    name: 'Gratis',
    description: 'Comienza gratis con funcionalidades básicas',
    price: 'Gratis',
    features: [
      '1 trabajador',
      'Hasta 5 reservas/mes',
      'Gestión de reservas básica'
    ],
    maxWorkers: 1
  },
  {
    type: PlanType.Basic,
    name: 'Básico',
    description: 'Perfecto para empezar',
    price: '9.99€',
    features: [
      'Hasta 3 trabajadores',
      '1 Servicio',
      'Gestión de reservas básica',
      'Soporte por email'
    ],
    maxWorkers: 3
  },
  {
    type: PlanType.Professional,
    name: 'Profesional',
    description: 'Para negocios en crecimiento',
    price: '29.99€',
    features: [
      'Hasta 10 trabajadores',
      'Servicios ilimitados',
      'Gestión avanzada',
      'Soporte prioritario',
      'Análisis y reportes'
    ],
    maxWorkers: 10
  },
  {
    type: PlanType.Enterprise,
    name: 'Empresa',
    description: 'Para grandes empresas',
    price: 'Personalizado',
    features: [
      'Trabajadores ilimitados',
      'Servicios ilimitados',
      'Gestión empresarial completa',
      'Soporte 24/7',
      'API personalizada',
      'Integraciones personalizadas'
    ],
    maxWorkers: Infinity
  }
];

export default function SignupStage2({
  selectedPlan,
  onPlanChange,
  onBack,
  onNext,
  isLoading,
  plans
}: SignupStage2Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
          Elige tu Plan
        </h3>

        <div className="grid gap-3 md:grid-cols-3">
          {(plans ?? PLANS).map((plan) => (
            <button
              key={plan.type}
              type="button"
              onClick={() => onPlanChange(plan.type)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left h-full ${
                selectedPlan === plan.type
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/20'
                  : 'border-light-darker dark:border-secondary-700 hover:border-primary-500 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-sm text-dark dark:text-light">
                    {plan.name}
                  </h4>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-0.5">
                    {plan.description}
                  </p>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-primary-500 flex items-center justify-center flex-shrink-0">
                  {selectedPlan === plan.type && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {plan.price}
                </span>
                {plan.price !== 'Personalizado' && plan.price !== 'Gratis' && (
                  <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-1">
                    /mes
                  </span>
                )}
              </div>

              <ul className="space-y-2 text-xs">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-secondary-700 dark:text-secondary-300">
                    <svg className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-3 bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 font-bold rounded-xl hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Procesando...</span>
            </>
          ) : (
            <span>Continuar a Negocio</span>
          )}
        </button>
      </div>
    </form>
  );
}
