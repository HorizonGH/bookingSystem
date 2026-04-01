'use client';

import Link from 'next/link';

export function Hero() {

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Reservas Inteligentes',
      description: 'Gestión inteligente de citas con detección de conflictos y recordatorios automáticos.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Tiempo Real',
      description: 'Mantente sincronizado en todos los dispositivos con notificaciones instantáneas.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Seguro y Privado',
      description: 'Seguridad con cifrado de extremo a extremo para tus datos confidenciales.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Colaboración',
      description: 'Trabaja en conjunto con calendarios compartidos y herramientas de gestión.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Panel de Análisis',
      description: 'Obtén información clave con informes completos y métricas de rendimiento.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Rendimiento Rápido',
      description: 'Optimizado para una experiencia de usuario fluida en todos los dispositivos.',
    },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-12 md:pt-20 md:pb-20 lg:pt-32 lg:pb-28 bg-light dark:bg-dark">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide">
                Nuevo en v2.0
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-dark dark:text-light mb-4 md:mb-6 leading-[1.1]">
              Zita Smart: <br className="hidden lg:block"/>
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                reservas sin complicaciones
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-secondary-600 dark:text-secondary-400 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Potencia tu negocio con nuestra plataforma integral. Automatiza citas, gestiona pagos y fideliza clientes con herramientas de nivel empresarial.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
              <Link
                href="/search"
                className="w-full sm:w-auto px-8 py-4 bg-dark dark:bg-light text-white dark:text-dark font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-center"
              >
                Empezar Gratis
              </Link>
            </div>
            {/* Stats section removed as requested */}
          </div>

          {/* Visual Content - Hero Image */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/heroImage.png"
                alt="Interfaz de Zita Smart para gestionar reservas y citas en línea"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* Features List (Added) */}
        <div className="mt-12 md:mt-24 pt-10 border-t border-light-darker dark:border-secondary-800/50">
          <p className="text-center text-sm font-semibold text-secondary-400 uppercase tracking-widest mb-6 md:mb-12">
            Todo lo que necesitas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-light-darker dark:border-secondary-800/50 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 backdrop-blur-sm"
              >
                <div className="w-12 h-12 mb-4 rounded-xl bg-primary-100/50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-dark dark:text-light mb-2">{feature.title}</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}