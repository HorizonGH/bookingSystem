'use client';

import Link from 'next/link';
import { use, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BusinessDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const businessId = resolvedParams.id;
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated business data
  const business = {
    id: businessId,
    name: 'Restaurante El Gourmet',
    category: 'Restaurante',
    rating: 4.8,
    reviews: 342,
    location: 'Madrid',
    address: 'Calle Gran Vía 28, Madrid, 28013',
    phone: '+34 912 345 678',
    email: 'info@elgourmet.com',
    description: 'Cocina mediterránea de alta calidad con ingredientes frescos y de temporada. Nuestro chef ejecutivo combina técnicas tradicionales con toques modernos para crear una experiencia gastronómica única.',
    price: '€€€',
    responseTime: '2 horas',
    openingHours: {
      'Lunes - Viernes': '13:00 - 16:00, 20:00 - 23:30',
      'Sábados': '13:00 - 16:30, 20:00 - 00:00',
      'Domingos': '13:00 - 16:30'
    },
    amenities: [
      'Wifi gratuito',
      'Terraza exterior',
      'Acceso para sillas de ruedas',
      'Música en vivo (viernes y sábados)',
      'Parking cercano',
      'Menú vegetariano',
      'Menú sin gluten'
    ],
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0']
  };

  const availableTimes = [
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Booking submitted:', {
      businessId,
      selectedDate,
      selectedTime,
      numberOfPeople,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests
    });

    alert('¡Reserva realizada con éxito! Recibirás un email de confirmación.');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative">
       {/* Abstract Background Shapes */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

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
                    {business.category}
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
                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-xl font-bold">{business.rating}</span>
                    <span className="opacity-75">({business.reviews} reseñas)</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <svg className="w-6 h-6 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    <span>{business.location}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <svg className="w-6 h-6 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{business.price}</span>
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
                        { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>, text: business.address },
                        { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, text: business.phone },
                        { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, text: business.email },
                        { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: `Responde en ${business.responseTime}` }
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

              {/* Amenities */}
              <div className="bg-white dark:bg-dark-light rounded-3xl shadow-xl p-8 border border-light-darker dark:border-secondary-700/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-dark dark:text-light mb-6">
                  Servicios e Instalaciones
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-light-darker dark:hover:bg-secondary-800/20 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-secondary-700 dark:text-secondary-300 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

               {/* Opening Hours */}
               <div className="bg-white dark:bg-dark-light rounded-3xl shadow-xl p-8 border border-light-darker dark:border-secondary-700/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-dark dark:text-light mb-6">
                  Horario de Apertura
                </h3>
                <div className="space-y-4">
                  {Object.entries(business.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-xl bg-light-darker dark:bg-secondary-800/20 border border-transparent hover:border-primary-500/20 transition-colors">
                      <span className="font-bold text-dark dark:text-light mb-1 sm:mb-0 flex items-center gap-2">
                         <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         {day}
                      </span>
                      <span className="text-secondary-600 dark:text-secondary-400 font-mono bg-white dark:bg-secondary-800 px-3 py-1 rounded-lg text-sm border border-light-darker dark:border-secondary-700">
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Form Sidebar */}
            <div className="lg:w-[400px] animate-slideUp" style={{animationDelay: '400ms'}}>
              <div className="bg-white dark:bg-dark-light rounded-3xl shadow-2xl p-8 sticky top-24 border border-light-darker dark:border-secondary-700/50">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-dark dark:text-light">
                    Hacer una Reserva
                    </h2>
                    <span className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </span>
                </div>
                

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-500 dark:text-secondary-400 ml-1">
                      Fecha
                    </label>
                    <div className="relative">
                        <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all duration-200 font-semibold"
                        />
                         <svg className="w-5 h-5 text-secondary-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>

                  {/* Time & People Row */}
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-500 dark:text-secondary-400 ml-1">
                        Hora
                        </label>
                        <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all duration-200 font-semibold"
                        >
                        <option value="">--:--</option>
                        {availableTimes.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-500 dark:text-secondary-400 ml-1">
                        Personas
                        </label>
                        <input
                        type="number"
                        value={numberOfPeople}
                        onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                        min="1"
                        max="20"
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all duration-200 font-semibold text-center"
                        />
                    </div>
                  </div>

                  {/* Personal Info Divider */}
                  <div className="relative py-2">
                       <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-light-darker dark:border-secondary-700"></div></div>
                       <span className="relative z-10 bg-white dark:bg-dark-light px-2 text-xs font-bold text-secondary-400 uppercase">Datos de contacto</span>
                  </div>

                  {/* Name */}
                  <div className="bg-light dark:bg-dark border border-light-darker dark:border-secondary-700 rounded-xl p-1">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nombre Completo"
                        required
                        className="w-full px-4 py-2 bg-transparent text-dark dark:text-light focus:outline-none placeholder-secondary-400 font-medium"
                      />
                  </div>
                  <div className="bg-light dark:bg-dark border border-light-darker dark:border-secondary-700 rounded-xl p-1">
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full px-4 py-2 bg-transparent text-dark dark:text-light focus:outline-none placeholder-secondary-400 font-medium"
                      />
                  </div>
                   <div className="bg-light dark:bg-dark border border-light-darker dark:border-secondary-700 rounded-xl p-1">
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Teléfono"
                        required
                        className="w-full px-4 py-2 bg-transparent text-dark dark:text-light focus:outline-none placeholder-secondary-400 font-medium"
                      />
                  </div>

                  {/* Special Requests */}
                   <div className="bg-light dark:bg-dark border border-light-darker dark:border-secondary-700 rounded-xl p-1">
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Peticiones Especiales (Opcional)"
                      rows={2}
                      className="w-full px-4 py-2 bg-transparent text-dark dark:text-light focus:outline-none placeholder-secondary-400 font-medium resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar Reserva</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-secondary-500 text-center leading-relaxed px-4">
                    Al confirmar, aceptas nuestros <a href="#" className="underline hover:text-primary-500">Términos de Servicio</a> y <a href="#" className="underline hover:text-primary-500">Política de Privacidad</a>.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}