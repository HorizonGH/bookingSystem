'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService, PlanType } from '../../services/auth';
import { ApiError } from '../../services/api';

export default function SignupPage() {
  const [userType, setUserType] = useState<'client' | 'tenant'>('client');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Tenant specific fields
  const [tenantName, setTenantName] = useState('');
  const [tenantDescription, setTenantDescription] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [tenantCity, setTenantCity] = useState('');
  const [tenantCountry, setTenantCountry] = useState('');
  const [tenantPlanType, setTenantPlanType] = useState<PlanType>(PlanType.Basic);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (userType === 'client') {
        const response = await authService.register({
          firstName,
          lastName,
          email,
          password,
          phoneNumber: phoneNumber || undefined
        });
        // Store tokens in localStorage
        localStorage.setItem('authToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('expiresAt', response.expiresAt);
        console.log('Registration successful:', response.user);
        // Redirect to dashboard or home
        window.location.href = '/';
      } else {
        const response = await authService.registerTenant({
          userRequest: {
            firstName,
            lastName,
            email,
            password,
            phoneNumber
          },
          tenantRequest: {
            name: tenantName,
            description: tenantDescription,
            address: tenantAddress,
            city: tenantCity,
            country: tenantCountry,
            planType: tenantPlanType
          }
        });
        // Store tokens in localStorage
        localStorage.setItem('authToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('expiresAt', response.expiresAt);
        console.log('Tenant registration successful:', response.user);
        // Redirect to dashboard or home
        window.location.href = '/';
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center px-4 py-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 mb-3"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl overflow-hidden border border-light-darker dark:border-dark-light">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary-500 via-secondary-600 to-secondary-700 px-6 py-4 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-2xl font-bold mb-1">
                Crear Cuenta
              </h1>
              <p className="text-primary-50 text-sm">
                Crea tu cuenta y comienza a reservar
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* User Type Selection */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                Tipo de Usuario
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserType('client')}
                  className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                    userType === 'client'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-light-darker dark:border-secondary-700 hover:border-primary-500 text-secondary-700 dark:text-secondary-300'
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('tenant')}
                  className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                    userType === 'tenant'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-light-darker dark:border-secondary-700 hover:border-primary-500 text-secondary-700 dark:text-secondary-300'
                  }`}
                >
                  Negocio
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={`grid gap-3 ${userType === 'tenant' ? 'grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
                {/* Left Column - User Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Información Personal</h3>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      onChange={(e) => setLastName(e.target.value)}
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
                      onChange={(e) => setEmail(e.target.value)}
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
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-3 pr-10 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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
                      Número de Teléfono
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required={userType === 'tenant'}
                      className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Right Column - Tenant Info */}
                {userType === 'tenant' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                      Información del Negocio
                    </h3>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
                        Nombre del Negocio
                      </label>
                      <input
                        type="text"
                        value={tenantName}
                        onChange={(e) => setTenantName(e.target.value)}
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
                        onChange={(e) => setTenantDescription(e.target.value)}
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
                        onChange={(e) => setTenantAddress(e.target.value)}
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
                          onChange={(e) => setTenantCity(e.target.value)}
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
                          onChange={(e) => setTenantCountry(e.target.value)}
                          placeholder="España"
                          required
                          className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-secondary-700 dark:text-secondary-300">
                        Plan
                      </label>
                      <select
                        value={tenantPlanType}
                        onChange={(e) => setTenantPlanType(parseInt(e.target.value) as PlanType)}
                        required
                        className="w-full px-3 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light text-sm focus:border-primary-500 focus:outline-none transition-all duration-200"
                      >
                        <option value={PlanType.Free}>Gratis</option>
                        <option value={PlanType.Basic}>Básico</option>
                        <option value={PlanType.Professional}>Profesional</option>
                        <option value={PlanType.Enterprise}>Empresa</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Crear Cuenta</span>
                  )}
                </button>
              </div>
            </form>

            {/* Toggle mode */}
            <div className="text-center pt-3 mt-3 border-t border-light-darker dark:border-secondary-700">
              <p className="text-secondary-600 dark:text-secondary-400 text-xs">
                ¿Ya tienes cuenta?
                {' '}
                <Link
                  href="/login"
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}