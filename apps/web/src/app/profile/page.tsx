'use client';

import { useState } from 'react';
import Link from 'next/link';

type UserRole = 'customer' | 'business';

export default function ProfilePage() {
  const [userRole, setUserRole] = useState<UserRole>('customer');

  const customerData = {
    name: 'Gabriel Rodriguez',
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
                  Cuenta Activa
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-light mb-2">
                Mi Perfil
              </h1>
              <p className="text-xl text-secondary-600 dark:text-secondary-400">
                Gestiona tu información y visualiza tus reservas
              </p>
            </div>

             {/* Role Toggle Glass Card */}
            <div className="bg-white/50 dark:bg-dark-light/50 backdrop-blur-md border border-light-darker dark:border-secondary-700 p-1.5 rounded-xl shadow-lg inline-flex">
              <button
                onClick={() => setUserRole('customer')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                  userRole === 'customer'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-light-darker dark:hover:bg-secondary-800/50'
                }`}
              >
                Cliente
              </button>
              <button
                onClick={() => setUserRole('business')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                  userRole === 'business'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-light-darker dark:hover:bg-secondary-800/50'
                }`}
              >
                Negocio
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="animate-slideUp">
          {userRole === 'customer' ? (
            /* ─── CUSTOMER VIEW ─── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Personal Info */}
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/20 ring-4 ring-white dark:ring-dark-light">
                      {customerData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-center text-dark dark:text-light mb-1">{customerData.name}</h2>
                    <p className="text-center text-secondary-500 mb-6 text-sm font-medium uppercase tracking-wide">Miembro desde {customerData.memberSince}</p>

                    <div className="space-y-4 pt-6 border-t border-light-darker dark:border-secondary-800/50">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-light-darker dark:bg-secondary-900/30">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 truncate">{customerData.email}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-light-darker dark:bg-secondary-900/30">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{customerData.phone}</span>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-light-darker dark:border-secondary-800/50"> 
                         <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full py-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-semibold text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar Sesión
                        </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Stats & Bookings */}
              <div className="lg:col-span-2 space-y-8">
                {/* Stats Grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Reservas', value: customerData.stats.totalBookings, color: 'text-primary-600 dark:text-primary-400' },
                        { label: 'Completadas', value: customerData.stats.completedBookings, color: 'text-secondary-600 dark:text-secondary-400' },
                        { label: 'Canceladas', value: customerData.stats.cancelledBookings, color: 'text-secondary-500 dark:text-secondary-500' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-6 text-center border border-light-darker dark:border-secondary-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 hover:-translate-y-1 transition-all duration-300">
                            <div className={`text-4xl font-extrabold mb-1 ${stat.color}`}>{stat.value}</div>
                            <div className="text-secondary-500 dark:text-secondary-400 font-medium text-sm uppercase tracking-wide">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Upcoming Bookings */}
                <div className="bg-white/50 dark:bg-dark-light/30 rounded-3xl border border-light-darker dark:border-secondary-700/50 p-6 md:p-8 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-dark dark:text-light flex items-center gap-2">
                           <span className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500"></span>
                           Próximas Reservas
                        </h2>
                        <Link href="/search" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                           Nueva Reserva →
                        </Link>
                    </div>
                  
                    <div className="space-y-4">
                        {customerData.upcomingBookings.map(booking => (
                        <div key={booking.id} className="bg-white dark:bg-dark-light rounded-2xl shadow-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                     </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-dark dark:text-light mb-1">{booking.business}</h4>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-secondary-600 dark:text-secondary-400">
                                        <span className="flex items-center gap-1 bg-light-darker dark:bg-secondary-800/50 px-2 py-1 rounded-md">
                                            {booking.date}
                                        </span>
                                        <span className="flex items-center gap-1 bg-light-darker dark:bg-secondary-800/50 px-2 py-1 rounded-md">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {booking.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                            booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                            }`}>
                            {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                            </span>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/search"
                    className="group relative px-6 py-4 bg-dark dark:bg-light text-white dark:text-dark font-bold rounded-xl overflow-hidden shadow-lg hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1"
                  >
                     <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity"></div>
                     <span className="relative flex items-center justify-center gap-2">
                        Buscar Negocios
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                     </span>
                  </Link>
                  <button className="px-6 py-4 border border-light-darker dark:border-secondary-700 text-dark dark:text-light font-bold rounded-xl hover:bg-light-darker dark:hover:bg-secondary-800/30 transition-all duration-300">
                    Configuración
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ─── BUSINESS VIEW ─── */
            <div className="space-y-8">
              {/* Business Info Card */}
              <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-8 border border-light-darker dark:border-secondary-700 w-full relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                 
                 <div className="flex flex-col md:flex-row items-center gap-8">
                     <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        {businessData.businessName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                     </div>
                     
                     <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                             <h2 className="text-3xl font-bold text-dark dark:text-light">{businessData.businessName}</h2>
                             <span className="inline-flex px-3 py-1 bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                                Plan {businessData.plan}
                            </span>
                        </div>
                        <p className="text-secondary-600 dark:text-secondary-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Propietario: {businessData.ownerName}
                        </p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 pt-4 border-t border-light-darker dark:border-secondary-800/50">
                             <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {businessData.email}
                             </div>
                             <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {businessData.phone}
                             </div>
                             <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                {businessData.address}
                             </div>
                        </div>
                     </div>

                     <div className="flex-shrink-0">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-primary-500/40 hover:-translate-y-1 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Mejorar Plan
                        </Link>
                     </div>
                 </div>
              </div>

              {/* Business Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Reservas', value: businessData.stats.totalBookings, sub: null },
                    { label: 'Este Mes', value: businessData.stats.thisMonth, sub: '+12%' },
                    { label: 'Valoración', value: businessData.stats.rating, sub: 'Excelente' },
                    { label: 'Reseñas', value: businessData.stats.reviews, sub: null }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 text-center border border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 group">
                        <div className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                            {stat.value}
                        </div>
                        <div className="text-sm font-bold text-dark dark:text-light">{stat.label}</div>
                        {stat.sub && <div className="text-xs text-green-500 font-medium mt-1">{stat.sub}</div>}
                    </div>
                ))}
            </div>

              {/* Today's Bookings & Quick Actions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white/50 dark:bg-dark-light/30 rounded-3xl border border-light-darker dark:border-secondary-700/50 p-6 md:p-8 backdrop-blur-sm">
                       <h2 className="text-xl font-bold text-dark dark:text-light mb-6 flex items-center gap-2">
                           <span className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500"></span>
                           Reservas de Hoy
                        </h2>
                      <div className="space-y-4">
                        {businessData.todayBookings.map(booking => (
                          <div key={booking.id} className="bg-white dark:bg-dark-light rounded-2xl shadow-md p-5 flex flex-col sm:flex-row sm:items-center justify-between border border-light-darker dark:border-secondary-700 hover:border-primary-500/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center font-bold text-secondary-600 dark:text-secondary-400">
                                    {booking.customer.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-dark dark:text-light">{booking.customer}</h4>
                                    <div className="flex items-center gap-3 text-xs text-secondary-500">
                                        <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {booking.time}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> {booking.people} pax</span>
                                    </div>
                                </div>
                            </div>
                            <button className="mt-3 sm:mt-0 px-4 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
                              Gestionar
                            </button>
                          </div>
                        ))}
                      </div>
                  </div>

                   <div className="space-y-4">
                      <button className="w-full p-6 bg-gradient-to-br from-primary-600 to-secondary-600 text-white rounded-2xl shadow-xl hover:shadow-primary-500/30 hover:-translate-y-1 transition-all duration-300 text-left group">
                         <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                         </div>
                         <h3 className="text-xl font-bold mb-1">Ver Dashboard</h3>
                         <p className="text-primary-100 text-sm">Analíticas completas y reportes</p>
                      </button>
                        
                      <button className="w-full p-6 bg-white dark:bg-dark-light border border-light-darker dark:border-secondary-700 rounded-2xl shadow-lg hover:border-primary-500 transition-all duration-300 text-left group">
                         <div className="w-12 h-12 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl flex items-center justify-center mb-4 text-secondary-600 dark:text-secondary-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </div>
                         <h3 className="text-xl font-bold text-dark dark:text-light mb-1 group-hover:text-primary-500 transition-colors">Configuración</h3>
                         <p className="text-secondary-500 text-sm">Ajustes de cuenta y negocio</p>
                      </button>
                   </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}