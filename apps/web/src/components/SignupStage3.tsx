'use client';

import { PlanType } from '../services/auth';

interface SignupStage3Props {
  tenantName: string;
  tenantDescription: string;
  tenantAddress: string;
  tenantCity: string;
  tenantCountry: string;
  maxWorkers: number;
  onTenantNameChange: (value: string) => void;
  onTenantDescriptionChange: (value: string) => void;
  onTenantAddressChange: (value: string) => void;
  onTenantCityChange: (value: string) => void;
  onTenantCountryChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function SignupStage3({
  tenantName,
  tenantDescription,
  tenantAddress,
  tenantCity,
  tenantCountry,
  maxWorkers,
  onTenantNameChange,
  onTenantDescriptionChange,
  onTenantAddressChange,
  onTenantCityChange,
  onTenantCountryChange,
  onBack,
  onSubmit,
  isLoading
}: SignupStage3Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
            Información del Negocio
          </h3>
          <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">
            Máximo {maxWorkers === Infinity ? '∞' : maxWorkers} trabajadores
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
            Nombre del Negocio
          </label>
          <input
            type="text"
            value={tenantName}
            onChange={(e) => onTenantNameChange(e.target.value)}
            placeholder="Mi Spa"
            required
            className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
            Descripción
          </label>
          <textarea
            value={tenantDescription}
            onChange={(e) => onTenantDescriptionChange(e.target.value)}
            placeholder="Describe tu negocio..."
            rows={2}
            required
            className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
            Dirección
          </label>
          <input
            type="text"
            value={tenantAddress}
            onChange={(e) => onTenantAddressChange(e.target.value)}
            placeholder="Calle Principal 123"
            required
            className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
              Ciudad
            </label>
            <input
              type="text"
              value={tenantCity}
              onChange={(e) => onTenantCityChange(e.target.value)}
              placeholder="Madrid"
              required
              className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
              País
            </label>
            <input
              type="text"
              value={tenantCountry}
              onChange={(e) => onTenantCountryChange(e.target.value)}
              placeholder="España"
              required
              className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
            />
          </div>
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
            <span>Crear Cuenta y Negocio</span>
          )}
        </button>
      </div>
    </form>
  );
}
