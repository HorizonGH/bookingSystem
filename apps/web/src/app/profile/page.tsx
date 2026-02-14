'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authService, User, ReservationDto, Tenant } from '../../services/auth';
import { ApiError } from '../../services/api';
import TenantManagement from '../../components/TenantManagement';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTenantLoading, setIsTenantLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Fetch tenant data if user is a tenant admin
        if (userData.tenantId) {
          setIsTenantLoading(true);
          try {
            const tenantData = await authService.getTenant(userData.tenantId);
            setTenant(tenantData);
          } catch (err) {
            console.error('Failed to load tenant data:', err);
          } finally {
            setIsTenantLoading(false);
          }
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link
            href="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">No user data found</p>
          <Link
            href="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative overflow-hidden">
       {/* Abstract Background Shapes (Matches Hero) */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10 max-w-6xl">
        
        {/* Header Section */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 transition-colors duration-200 mb-6 group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-light mb-2">
                Mi Perfil
              </h1>
              <p className="text-xl text-secondary-600 dark:text-secondary-400">
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-dark-light/50 backdrop-blur-md border border-light-darker dark:border-secondary-700 px-6 py-3 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-dark dark:text-light">
                  {user.reservations.length}
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">
                  Total Reservas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="animate-slideUp">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Personal Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>

                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/20 ring-4 ring-white dark:ring-dark-light">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>

                  <h2 className="text-2xl font-bold text-center text-dark dark:text-light mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-center text-secondary-500 mb-6 text-sm font-medium uppercase tracking-wide">
                    {user.role}
                  </p>

                  <div className="space-y-4 pt-6 border-t border-light-darker dark:border-secondary-800/50">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-light-darker dark:bg-secondary-900/30">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 truncate">{user.email}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-light-darker dark:bg-secondary-900/30">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{user.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-light-darker dark:border-secondary-800/50">
                    <button
                      onClick={() => {
                        authService.logout();
                        window.location.href = '/login';
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-semibold text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Reservations */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tenant Management - Only show if user is tenant admin */}
              {user.tenantId && tenant && (
                <TenantManagement 
                  tenant={tenant} 
                  tenantId={user.tenantId}
                  onUpdate={(updatedTenant) => setTenant(updatedTenant)}
                />
              )}
              
              {user.tenantId && isTenantLoading && (
                <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-8 border border-light-darker dark:border-secondary-700">
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-secondary-600 dark:text-secondary-400">Cargando información del negocio...</p>
                  </div>
                </div>
              )}

              {/* Reservations List */}
              <div className="bg-white/50 dark:bg-dark-light/30 rounded-3xl border border-light-darker dark:border-secondary-700/50 p-6 md:p-8 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-dark dark:text-light flex items-center gap-2">
                    <span className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500"></span>
                    Mis Reservas
                  </h2>
                  <Link href="/search" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    Nueva Reserva →
                  </Link>
                </div>

                {user.reservations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-secondary-600 dark:text-secondary-400 mb-2">
                      No tienes reservas aún
                    </h3>
                    <p className="text-secondary-500 dark:text-secondary-500 mb-4">
                      ¡Es hora de hacer tu primera reserva!
                    </p>
                    <Link
                      href="/search"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Explorar Servicios
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.reservations.map((reservation) => (
                      <div key={reservation.id} className="bg-white dark:bg-dark-light rounded-2xl shadow-md p-5 border border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-dark dark:text-light mb-1">
                                Reserva #{reservation.id.slice(0, 8)}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                                <span className="flex items-center gap-1 bg-light-darker dark:bg-secondary-800/50 px-2 py-1 rounded-md">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {new Date(reservation.startTime).toLocaleDateString('es-ES')} {new Date(reservation.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center gap-1 bg-light-darker dark:bg-secondary-800/50 px-2 py-1 rounded-md">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                  </svg>
                                  ${reservation.price}
                                </span>
                              </div>
                              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                Estado: <span className={`font-medium ${
                                  reservation.reservationStatus === 0 ? 'text-green-600' :
                                  reservation.reservationStatus === 1 ? 'text-yellow-600' :
                                  reservation.reservationStatus === 2 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {reservation.reservationStatus === 0 ? 'Confirmada' :
                                   reservation.reservationStatus === 1 ? 'Pendiente' :
                                   reservation.reservationStatus === 2 ? 'Cancelada' : 'Desconocido'}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-sm font-medium">
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}