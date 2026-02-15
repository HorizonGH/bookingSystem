'use client';

import Link from 'next/link';
import { User, authService } from '../services/auth';

export default function ProfileUserWindow({ user }: { user: User }) {
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />

      <div className="relative z-10 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/20 ring-4 ring-white dark:ring-dark-light">
          {initials}
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

        {/* Reservations (moved here from profile page) */}
        <div className="mt-8">
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
                <h3 className="text-lg font-semibold text-secondary-600 dark:text-secondary-400 mb-2">No tienes reservas aún</h3>
                <p className="text-secondary-500 dark:text-secondary-500 mb-4">¡Es hora de hacer tu primera reserva!</p>
                <Link href="/search" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">Explorar Servicios
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.reservations.map((reservation) => (
                  <div key={reservation.id} className="bg-white dark:bg-dark-light rounded-2xl shadow-md p-5 border border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-dark dark:text-light mb-1">Reserva #{reservation.id.slice(0, 8)}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                            <span className="flex items-center gap-1 bg-light-darker dark:bg-secondary-800/50 px-2 py-1 rounded-md">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {new Date(reservation.startTime).toLocaleDateString('es-ES')} {new Date(reservation.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1 bg-light-darker dark:bg-secondary-800/50 px-2 py-1 rounded-md">{'$' + reservation.price}</span>
                          </div>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">Estado: <span className={`font-medium ${reservation.reservationStatus === 0 ? 'text-green-600' : reservation.reservationStatus === 1 ? 'text-yellow-600' : reservation.reservationStatus === 2 ? 'text-red-600' : 'text-gray-600'}`}>{reservation.reservationStatus === 0 ? 'Confirmada' : reservation.reservationStatus === 1 ? 'Pendiente' : reservation.reservationStatus === 2 ? 'Cancelada' : 'Desconocido'}</span></p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-sm font-medium">Ver Detalles</button>
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
  );
}
