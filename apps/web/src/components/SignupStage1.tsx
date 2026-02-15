'use client';

interface SignupStage1Props {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  showPassword: boolean;
  wantsTenant: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onShowPasswordToggle: () => void;
  onWantsTenantChange: (value: boolean) => void;
  onNext: () => void;
  isLoading: boolean;
}

export default function SignupStage1({
  firstName,
  lastName,
  email,
  password,
  phoneNumber,
  showPassword,
  wantsTenant,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onPhoneNumberChange,
  onShowPasswordToggle,
  onWantsTenantChange,
  onNext,
  isLoading
}: SignupStage1Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
          Información Personal
        </h3>

        <div>
          <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
            Nombre
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="Juan"
            required
            className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
            Apellido
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Pérez"
            required
            className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-gray-900 dark:text-white text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-3 pr-10 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={onShowPasswordToggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
            Número de Teléfono (opcional)
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Tenant toggle */}
        <div className="pt-4 border-t border-light-darker dark:border-secondary-700">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
            <input
              type="checkbox"
              checked={wantsTenant}
              onChange={(e) => onWantsTenantChange(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-primary-500 text-primary-500 focus:ring-primary-500 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                ¿Quieres crear un negocio?
              </span>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                Administra tu negocio, trabajadores y reservas
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
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
          ) : wantsTenant ? (
            <span>Continuar al Plan</span>
          ) : (
            <span>Crear Cuenta</span>
          )}
        </button>
      </div>
    </form>
  );
}
