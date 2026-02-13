'use client';

import { useState } from 'react';
import Link from 'next/link';

type UserRole = 'customer' | 'business';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [isAuthenticated] = useState(true); // Simulated auth state

  if (!isOpen) return null;

  const customerData = {
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '+34 612 345 678',
    memberSince: 'Enero 2024',
    upcomingBookings: [
      {
        id: 1,
        business: 'Restaurante El Gourmet',
        date: '15 Feb 2026',
        time: '20:00',
        status: 'confirmed'
      },
      {
        id: 2,
        business: 'Salón Belleza Total',
        date: '18 Feb 2026',
        time: '16:30',
        status: 'pending'
      }
    ],
    stats: {
      totalBookings: 24,
      completedBookings: 22,
      cancelledBookings: 2
    }
  };

  const businessData = {
    businessName: 'Restaurante El Gourmet',
    ownerName: 'María García',
    email: 'maria@elgourmet.com',
    phone: '+34 912 345 678',
    address: 'Calle Gran Vía 28, Madrid',
    plan: 'Premium',
    memberSince: 'Marzo 2023',
    todayBookings: [
      {
        id: 1,
        customer: 'Ana López',
        time: '14:00',
        people: 4,
        status: 'confirmed'
      },
      {
        id: 2,
        customer: 'Carlos Ruiz',
        time: '20:30',
        people: 2,
        status: 'confirmed'
      }
    ],
    stats: {
      totalBookings: 1250,
      thisMonth: 89,
      rating: 4.8,
      reviews: 342
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-black/60 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-4xl mb-10 animate-slideUp">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-500 via-secondary-600 to-secondary-700 p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Mi Perfil</h2>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => setUserRole('customer')}
              className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all duration-200 ${
                userRole === 'customer'
                  ? 'bg-white text-secondary-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => setUserRole('business')}
              className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all duration-200 ${
                userRole === 'business'
                  ? 'bg-white text-secondary-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Negocio
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {userRole === 'customer' ? (
            // CUSTOMER VIEW
            <div className="space-y-8">
              {/* Personal Info */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-dark dark:text-light">Información Personal</h3>
                <div className="bg-light-darker dark:bg-dark rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {customerData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-dark dark:text-light">{customerData.name}</h4>
                      <p className="text-secondary-600 dark:text-secondary-400">Miembro desde {customerData.memberSince}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-light-darker dark:border-dark-light">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-secondary-700 dark:text-secondary-300">{customerData.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-secondary-700 dark:text-secondary-300">{customerData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-dark dark:text-light">Estadísticas</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold mb-1">{customerData.stats.totalBookings}</div>
                    <div className="text-sm opacity-90">Total Reservas</div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold mb-1">{customerData.stats.completedBookings}</div>
                    <div className="text-sm opacity-90">Completadas</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold mb-1">{customerData.stats.cancelledBookings}</div>
                    <div className="text-sm opacity-90">Canceladas</div>
                  </div>
                </div>
              </div>

              {/* Upcoming Bookings */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-dark dark:text-light">Próximas Reservas</h3>
                <div className="space-y-4">
                  {customerData.upcomingBookings.map(booking => (
                    <div key={booking.id} className="bg-light-darker dark:bg-dark rounded-xl p-6 flex items-center justify-between hover:bg-light-darkest dark:hover:bg-dark-lighter transition-colors">
                      <div>
                        <h4 className="font-bold text-lg text-dark dark:text-light mb-1">{booking.business}</h4>
                        <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {booking.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {booking.time}
                          </span>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // BUSINESS VIEW
            <div className="space-y-8">
              {/* Business Info */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-dark dark:text-light">Información del Negocio</h3>
                <div className="bg-light-darker dark:bg-dark rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {businessData.businessName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-dark dark:text-light">{businessData.businessName}</h4>
                      <p className="text-secondary-600 dark:text-secondary-400">Propietario: {businessData.ownerName}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-xs font-semibold rounded-full">
                        Plan {businessData.plan}
                      </span>
                    </div>
                    <Link
                      href="/pricing"
                      className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      Mejorar Plan
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-light-darker dark:border-dark-light">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-secondary-700 dark:text-secondary-300">{businessData.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-secondary-700 dark:text-secondary-300">{businessData.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2">
                      <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-secondary-700 dark:text-secondary-300">{businessData.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Stats */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-dark dark:text-light">Rendimiento</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold mb-1">{businessData.stats.totalBookings}</div>
                    <div className="text-sm opacity-90">Total Reservas</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold mb-1">{businessData.stats.thisMonth}</div>
                    <div className="text-sm opacity-90">Este Mes</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold mb-1">{businessData.stats.rating}</div>
                    <div className="text-sm opacity-90">Valoración</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold mb-1">{businessData.stats.reviews}</div>
                    <div className="text-sm opacity-90">Reseñas</div>
                  </div>
                </div>
              </div>

              {/* Today's Bookings */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-dark dark:text-light">Reservas de Hoy</h3>
                <div className="space-y-4">
                  {businessData.todayBookings.map(booking => (
                    <div key={booking.id} className="bg-light-darker dark:bg-dark rounded-xl p-6 flex items-center justify-between hover:bg-light-darkest dark:hover:bg-dark-lighter transition-colors">
                      <div>
                        <h4 className="font-bold text-lg text-dark dark:text-light mb-1">{booking.customer}</h4>
                        <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {booking.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {booking.people} personas
                          </span>
                        </div>
                      </div>
                      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Confirmada
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button className="px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105">
                  Ver Dashboard
                </button>
                <button className="px-6 py-4 border-2 border-light-darker dark:border-dark-light text-secondary-700 dark:text-secondary-300 font-semibold rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 hover:scale-105">
                  Configuración
                </button>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="pt-6 border-t border-light-darker dark:border-dark-light">
            <button className="w-full px-6 py-3 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
