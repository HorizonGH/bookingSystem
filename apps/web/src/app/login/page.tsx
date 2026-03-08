'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '../../services/auth';
import { ApiError } from '../../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo');

      console.log('Login successful:', response.user);

      // Redirect back to the page that caused the 401 (if safe), otherwise go home
      const target = returnTo && returnTo.startsWith('/') ? returnTo : '/';
      window.location.href = target;
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
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center px-4 py-16">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 mb-5 md:mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl overflow-hidden border border-light-darker dark:border-dark-light">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary-500 via-secondary-600 to-secondary-700 p-5 md:p-8 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Bienvenido de Nuevo
              </h1>
              <p className="text-primary-50">
                Inicia sesión para gestionar tus reservas
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-5 md:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                  Contraseña
                </label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-secondary-700 dark:text-secondary-300">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span>Recuérdame</span>
                  </label>
                  <button
                    type="button"
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>

              {/* Toggle mode */}
              <div className="text-center pt-4 border-t border-light-darker dark:border-secondary-700">
                <p className="text-secondary-600 dark:text-secondary-400">
                  ¿No tienes cuenta?
                  {' '}
                  <Link
                    href="/signup"
                    className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
