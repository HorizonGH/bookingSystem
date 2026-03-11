'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tenantService, TenantDto } from '../../../../services/tenant';
import { reservationService, CreateReservationRequest, ReservationStatus } from '../../../../services/reservation';
import { ApiError } from '../../../../services/api';
import { WorkerSelector } from '../../../../components/WorkerSelector';
import { PlanType } from '../../../../services/auth';
import MessagePopup from '../../../../components/MessagePopup';
import { scheduleService, TimeSlotDto, WorkerScheduleDto, formatDateToYYYYMMDD } from '../../../../services/schedule';
import { serviceService, ServiceDto } from '../../../../services/service';
import { useAuth } from '../../../../lib/useAuth';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReservarPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const businessId = resolvedParams.id;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [business, setBusiness] = useState<TenantDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [popup, setPopup] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  // Services (for booking) and selected service
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotDto[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // Schedules for the selected worker (fetched from API) — used to mark calendar availability
  const [workerSchedules, setWorkerSchedules] = useState<WorkerScheduleDto[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

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

  // Fetch services for this tenant (used in booking form)
  useEffect(() => {
    const fetchServices = async () => {
      if (!business) return;
      try {
        setIsLoadingServices(true);
        const res = await serviceService.getServicesByTenant(business.id);
        setServices(res.services || []);
        if ((res.services || []).length === 1) setSelectedServiceId(res.services![0].id);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, [business]);

  // Fetch available time slots when worker and date are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!business || !selectedDate || !selectedWorkerId) {
        setAvailableTimeSlots([]);
        return;
      }

      try {
        setIsLoadingTimeSlots(true);
        const dateStr = formatDateToYYYYMMDD(selectedDate);
        const selectedService = services.find(s => s.id === selectedServiceId);
        const slotDuration = selectedService ? selectedService.durationMinutes : 60;
        const slots = await scheduleService.getAvailableTimeSlots(
          business.id,
          selectedWorkerId,
          {
            date: dateStr,
            serviceId: selectedServiceId || undefined,
            slotDurationMinutes: slotDuration,
          }
        );
        setAvailableTimeSlots(slots);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setAvailableTimeSlots([]);
        if (err instanceof ApiError) {
          setPopup({ 
            type: 'error', 
            message: `Error al cargar horarios disponibles: ${err.message}` 
          });
        }
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [business, selectedDate, selectedWorkerId, selectedServiceId, services]);

  // Fetch worker schedules (recurring + overrides) when a worker is selected
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!business || !selectedWorkerId) {
        setWorkerSchedules([]);
        return;
      }

      try {
        setIsLoadingSchedules(true);
        const schedules = await scheduleService.getWorkerSchedules(business.id, selectedWorkerId);
        setWorkerSchedules(Array.isArray(schedules) ? schedules : []);
      } catch (err) {
        console.error('Error fetching worker schedules:', err);
        setWorkerSchedules([]);
        if (err instanceof ApiError) {
          setPopup({ type: 'error', message: `Error al cargar horarios: ${err.message}` });
        }
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, [business, selectedWorkerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !selectedDate) return;

    setIsSubmitting(true);

    try {
      // Build UTC ISO timestamps from selected local date + selected time so backend always receives UTC
      const [hStr, mStr] = selectedTime.split(':');
      const hour = parseInt(hStr, 10) || 0;
      const minute = parseInt(mStr, 10) || 0;
      const startUtc = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hour,
        minute,
        0
      )).toISOString();
      const endUtc = startUtc; // if you need a duration, compute and add minutes here

      // Create reservation request (timestamps in UTC ISO format)
      if (!selectedServiceId) {
        setPopup({ type: 'error', message: 'Selecciona un servicio antes de confirmar la reserva.' });
        setIsSubmitting(false);
        return;
      }

      const reservationData: CreateReservationRequest = {
        tenantId: business.id,
        serviceId: selectedServiceId,
        workerId: selectedWorkerId,
        startTime: startUtc,
        endTime: endUtc,
        reservationStatus: ReservationStatus.Pending,
        clientName: customerName,
        clientEmail: customerEmail,
        clientPhone: customerPhone,
        price: services.find(s => s.id === selectedServiceId)?.price ?? 0,
        notes: `Número de personas: ${numberOfPeople}\n${specialRequests}`.trim(),
      };

      await reservationService.createReservation(reservationData);
      
      setPopup({ type: 'success', message: '¡Reserva realizada con éxito! Recibirás un email de confirmación.' });
      
      // Reset form
      setSelectedDate(null);
      setSelectedTime('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setSpecialRequests('');
      setNumberOfPeople(2);
      setSelectedWorkerId('');
      setSelectedServiceId('');
      
    } catch (err) {
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: `Error al crear la reserva: ${err.message}` });
      } else {
        setPopup({ type: 'error', message: 'Error al crear la reserva. Por favor, inténtalo de nuevo.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateUnavailable = (date: Date) => {
    // Past dates are always disabled
    if (isDatePast(date)) return true;

    // If no worker selected, we don't disable dates based on schedules (no mock data used)
    if (!selectedWorkerId) return false;

    const dateStr = formatDateToYYYYMMDD(date);

    // 1) Specific-date overrides take precedence
    const overrides = workerSchedules.filter(s => s.specificDate === dateStr);
    if (overrides.length > 0) {
      // If any override marks availability for that date, treat as available
      const anyAvailable = overrides.some(s => s.isAvailable);
      return !anyAvailable;
    }

    // 2) Fallback to recurring schedules for that weekday
    const recurring = workerSchedules.filter(s => !s.specificDate && s.dayOfWeek === date.getDay());
    if (recurring.length > 0) {
      const anyAvailable = recurring.some(s => s.isAvailable);
      return !anyAvailable;
    }

    // 3) No schedule => unavailable
    return true;
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isUnavailable = isDateUnavailable(date);
      const isPast = isDatePast(date);
      const isSelected = isSameDay(selectedDate, date);
      const isDisabled = isUnavailable || isPast;
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && setSelectedDate(date)}
          disabled={isDisabled}
          className={`
            aspect-square rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-200
            ${isSelected 
              ? 'bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-lg scale-110 ring-4 ring-primary-500/30' 
              : isDisabled
                ? 'bg-secondary-100 dark:bg-secondary-900/20 text-secondary-300 dark:text-secondary-700 cursor-not-allowed'
                : 'bg-white dark:bg-dark-light text-dark dark:text-light hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:scale-105 border-2 border-light-darker dark:border-secondary-700 hover:border-primary-500'
            }
            ${!isDisabled && !isSelected ? 'hover:shadow-md' : ''}
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
            <p className="text-secondary-600 dark:text-secondary-400">Cargando disponibilidad...</p>
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
        <div className="container mx-auto px-4 py-6 md:py-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link 
                href={`/business/${businessId}`}
                className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-primary-500 transition-colors duration-200 group w-fit px-4 py-2 rounded-full bg-white dark:bg-dark-light border border-light-darker dark:border-secondary-700 mb-6"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </Link>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-dark dark:text-light mb-2 md:mb-3">
                Reservar en {business.name}
              </h1>
              <p className="text-sm md:text-lg text-secondary-600 dark:text-secondary-400">
                Selecciona una fecha disponible para tu reserva
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <div className="bg-white dark:bg-dark-light rounded-3xl shadow-xl p-4 md:p-8 border border-light-darker dark:border-secondary-700/50">
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-dark dark:text-light">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={previousMonth}
                        className="p-2 rounded-lg bg-light dark:bg-dark text-dark dark:text-light hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg bg-light dark:bg-dark text-dark dark:text-light hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Day names */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendar()}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-primary-500 to-secondary-600"></div>
                    <span className="text-secondary-600 dark:text-secondary-400">Seleccionado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white dark:bg-dark-light border-2 border-light-darker dark:border-secondary-700"></div>
                    <span className="text-secondary-600 dark:text-secondary-400">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary-100 dark:bg-secondary-900/20"></div>
                    <span className="text-secondary-600 dark:text-secondary-400">No disponible</span>
                  </div>
                </div>
              </div>

              {/* Booking Form Section */}
              <div className="bg-white dark:bg-dark-light rounded-3xl shadow-xl p-4 md:p-8 border border-light-darker dark:border-secondary-700/50">
                {selectedDate ? (
                  <>
                    <div className="mb-4 md:mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-dark dark:text-light mb-2">
                        Detalles de tu Reserva
                      </h2>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Service Selection */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-500 dark:text-secondary-400 ml-1">
                          Servicio
                        </label>
                        <select
                          value={selectedServiceId}
                          onChange={(e) => setSelectedServiceId(e.target.value)}
                          required
                          disabled={isLoadingServices || (services.length === 0)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">{isLoadingServices ? 'Cargando servicios...' : services.length === 0 ? 'Sin servicios' : 'Selecciona un servicio'}</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} — {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(s.price)}
                            </option>
                          ))}
                        </select>
                        {!selectedServiceId && services.length > 0 && (
                          <p className="text-xs text-secondary-500 mt-1 ml-1">Selecciona un servicio para continuar</p>
                        )}
                      </div>

                      {/* Worker Selection */}
                      <WorkerSelector
                        tenantId={business.id}
                        planType={business.planType ?? PlanType.Free}
                        selectedWorkerId={selectedWorkerId}
                        onWorkerSelect={setSelectedWorkerId}
                      />

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
                            disabled={!selectedWorkerId || isLoadingTimeSlots}
                            className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {isLoadingTimeSlots 
                                ? 'Cargando...' 
                                : !selectedWorkerId 
                                  ? 'Selecciona trabajador' 
                                  : availableTimeSlots.length === 0
                                    ? 'Sin horarios'
                                    : '--:--'}
                            </option>
                            {availableTimeSlots
                              .filter(slot => slot.isAvailable)
                              .map(slot => {
                                const startTime = new Date(slot.startTime);
                                const timeStr = startTime.toLocaleTimeString('es-ES', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                });
                                return (
                                  <option key={slot.startTime} value={timeStr}>
                                    {timeStr}
                                  </option>
                                );
                              })}
                          </select>
                          {!selectedWorkerId && (
                            <p className="text-xs text-secondary-500 mt-1 ml-1">
                              Primero selecciona un trabajador
                            </p>
                          )}
                          {selectedWorkerId && !isLoadingTimeSlots && availableTimeSlots.filter(s => s.isAvailable).length === 0 && (
                            <p className="text-xs text-red-500 mt-1 ml-1">
                              No hay horarios disponibles para esta fecha
                            </p>
                          )}
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
                          rows={3}
                          className="w-full px-4 py-2 bg-transparent text-dark dark:text-light focus:outline-none placeholder-secondary-400 font-medium resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      {!isAuthenticated ? (
                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <span>Inicia sesión para reservar</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <p className="text-xs text-secondary-500 text-center">
                            Necesitas estar autenticado para hacer una reserva
                          </p>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Procesando...</span>
                            </>
                          ) : (
                            <>
                              <span>Confirmar Reserva</span>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </>
                          )}
                        </button>
                      )}

                      <p className="text-xs text-secondary-500 text-center leading-relaxed px-4">
                        Al confirmar, aceptas nuestros <a href="#" className="underline hover:text-primary-500">Términos de Servicio</a> y <a href="#" className="underline hover:text-primary-500">Política de Privacidad</a>.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-dark dark:text-light mb-2">
                      Selecciona una fecha
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      Elige una fecha disponible en el calendario para continuar con tu reserva
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message popup for success / error */}
      {popup && (
        <MessagePopup
          visible={!!popup}
          type={popup.type}
          title={popup.type === 'error' ? 'Error' : popup.type === 'success' ? 'Éxito' : undefined}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
