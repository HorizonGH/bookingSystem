'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { authService, User } from '../services/auth';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-light-darker dark:border-dark-light bg-light/70 dark:bg-dark-light/70 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/40 group-hover:scale-105 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-dark to-secondary-700 dark:from-light dark:to-light-darker bg-clip-text text-transparent">
              ReservaSmart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="px-4 py-2 text-secondary-700 dark:text-light-darker hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors duration-200 rounded-lg hover:bg-light-darker dark:hover:bg-dark"
            >
              Inicio
            </Link>
            <Link
              href="/search"
              className="px-4 py-2 text-secondary-700 dark:text-light-darker hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors duration-200 rounded-lg hover:bg-light-darker dark:hover:bg-dark"
            >
              Buscar Negocios
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 text-secondary-700 dark:text-light-darker hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors duration-200 rounded-lg hover:bg-light-darker dark:hover:bg-dark"
            >
              Precios
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 bg-light-darker dark:bg-dark rounded-xl hover:bg-light-darkest dark:hover:bg-dark-lighter transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-dark dark:text-light">
                  {user.firstName} {user.lastName}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/50 transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                Iniciar Sesión
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-light-darker dark:hover:bg-dark transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-light-darker dark:border-dark-light animate-slideDown">
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 text-secondary-700 dark:text-light-darker hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors duration-200 rounded-xl hover:bg-light-darker dark:hover:bg-dark"
              >
                Inicio
              </Link>
              <Link
                href="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 text-secondary-700 dark:text-light-darker hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors duration-200 rounded-xl hover:bg-light-darker dark:hover:bg-dark"
              >
                Buscar Negocios
              </Link>
              <Link
                href="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 text-secondary-700 dark:text-light-darker hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors duration-200 rounded-xl hover:bg-light-darker dark:hover:bg-dark"
              >
                Precios
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
