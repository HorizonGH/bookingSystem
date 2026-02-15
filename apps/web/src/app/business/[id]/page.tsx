'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { tenantService, TenantDto } from '../../../services/tenant';
import { ApiError } from '../../../services/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BusinessDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const businessId = resolvedParams.id;
  
  const [business, setBusiness] = useState<TenantDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setIsLoading(true);
        setError('');
        const businessData = await tenantService.getTenantById(businessId);
        setBusiness(businessData);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Error al cargar la información del negocio');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative">
       {/* Abstract Background Shapes */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-600 dark:text-secondary-400">Cargando información del negocio...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark dark:text-light mb-2">Error al cargar</h3>
            <p className="text-secondary-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && business && (
        <>

      {/* Hero Image Section */}
      <div className="relative h-[500px]"> 
        {/* Placeholder Gradient instead of heavy image */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-dark to-dark-light"></div>
         {/* Decorative pattern/blob on top of hero */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-light dark:from-dark via-transparent to-transparent"></div> {/* Fade to bottom */}

        <div className="container mx-auto px-4 h-full relative z-10 pt-8 flex flex-col justify-between pb-32">
          {/* Nav */}
          <Link 
            href="/search"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors duration-200 group w-fit px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a búsqueda
          </Link>

          {/* Hero Content */}
          <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 mb-4 animate-slideUp">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-sm">
                    Negocio
                </span>
                <span className="px-4 py-1.5 bg-green-500/20 backdrop-blur-md text-green-300 border border-green-500/30 rounded-full font-bold text-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Disponible Ahora
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-xl animate-slideUp" style={{animationDelay: '100ms'}}>
                  {business.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium animate-slideUp" style={{animationDelay: '200ms'}}>
                 <div className="flex items-center gap-1.5">
                    <svg className="w-6 h-6 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    <span>{business.city || 'Ubicación no especificada'}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <svg className="w-6 h-6 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span>{business.email}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <svg className="w-6 h-6 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span>{business.phoneNumber}</span>
                 </div>
              </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 pb-20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="lg:flex lg:gap-8">
            
            {/* Main Content */}
            <div className="lg:flex-1 mb-8 lg:mb-0 space-y-8 animate-slideUp" style={{animationDelay: '300ms'}}>
              
              {/* Description & Contact Card */}
              <div className="bg-white dark:bg-dark-light rounded-3xl shadow-xl p-8 border border-light-darker dark:border-secondary-700/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-dark dark:text-light mb-4 flex items-center gap-2">
                    <span className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500"></span>
                    Sobre nosotros
                </h3>
                <p className="text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed mb-8">
                  {business.description}
                </p>

                {/* Contact Icons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                        { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>, text: business.address || 'Dirección no especificada' },
                        { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, text: business.phoneNumber },
                        { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, text: business.email },
                        { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: business.businessHours || 'Horarios no especificados' }
                     ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-light-darker dark:bg-secondary-800/30 border border-transparent hover:border-primary-500/30 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-secondary-800 flex items-center justify-center text-primary-500 shadow-sm">
                                {item.icon}
                            </div>
                            <span className="text-secondary-700 dark:text-secondary-300 font-medium text-sm">{item.text}</span>
                        </div>
                     ))}
                </div>
              </div>
            </div>

            {/* Reservation Card Sidebar */}
            <div className="lg:w-[400px] animate-slideUp" style={{animationDelay: '400ms'}}>
              <div className="bg-white dark:bg-dark-light rounded-3xl shadow-2xl p-8 sticky top-24 border border-light-darker dark:border-secondary-700/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-dark dark:text-light">
                    Hacer una Reserva
                    </h2>
                    <span className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </span>
                </div>

                <p className="text-secondary-600 dark:text-secondary-400 mb-8 leading-relaxed">
                  Consulta la disponibilidad en nuestro calendario y selecciona el mejor horario para tu reserva.
                </p>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {[
                    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Confirmación inmediata' },
                    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, text: 'Disponibilidad en tiempo real' },
                    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Cambios flexibles' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-primary-500 flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-secondary-700 dark:text-secondary-300 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                {/* Reservar Button */}
                <Link 
                  href={`/business/${businessId}/reservar`}
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Ver Disponibilidad</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <p className="text-xs text-secondary-500 text-center leading-relaxed px-4 mt-6">
                  Sin compromiso. Puedes cancelar en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}