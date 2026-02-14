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
      // Store tokens in localStorage
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('expiresAt', response.expiresAt);
      console.log('Login successful:', response.user);
      // Redirect to dashboard or home
      window.location.href = '/';
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
          className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl overflow-hidden border border-light-darker dark:border-dark-light">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary-500 via-secondary-600 to-secondary-700 p-8 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                Bienvenido de Nuevo
              </h1>
              <p className="text-primary-50">
                Inicia sesión para gestionar tus reservas
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
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

              {/* Social login divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-300 dark:border-secondary-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-dark-light text-secondary-500 dark:text-secondary-400">
                    O continúa con
                  </span>
                </div>
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button type="button" className="flex items-center justify-center py-3 px-4 rounded-xl border-2 border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 hover:scale-105">
                  <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button type="button" className="flex items-center justify-center py-3 px-4 rounded-xl border-2 border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 hover:scale-105">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.26 9.47a7.5 7.5 0 0 0 0 5.06l-2.05 1.59a10.5 10.5 0 0 1 0-8.24l2.05 1.59z"/>
                    <path fill="#FBBC05" d="M12 4.97c1.47 0 2.79.51 3.82 1.35l2.87-2.87A10.5 10.5 0 0 0 3.21 7.88l2.05 1.59A6.47 6.47 0 0 1 12 4.97z"/>
                    <path fill="#34A853" d="M12 19.03c-2.34 0-4.32-1.24-5.44-3.09l-2.05 1.59a10.5 10.5 0 0 0 15.28-4.36h-7.79v-3.02h10.91c.13.68.19 1.38.19 2.1 0 5.8-4.2 10.5-10.5 10.5z"/>
                    <path fill="#4285F4" d="M22.91 12c0-.68-.06-1.38-.19-2.1H12v3.02h7.79a6.48 6.48 0 0 1-2.65 4.23l2.05 1.59A10.5 10.5 0 0 0 22.91 12z"/>
                  </svg>
                </button>
                <button type="button" className="flex items-center justify-center py-3 px-4 rounded-xl border-2 border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 hover:scale-105">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </button>
              </div>

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
