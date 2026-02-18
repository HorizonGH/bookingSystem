'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ServiceDto, 
  serviceService, 
  ServicesByTenantResponse,
  getMaxServicesForPlan,
  getServiceLimitDescription
} from '../services/service';
import MessagePopup from './MessagePopup';
import { PlanType } from '../services/auth';
import { ApiError } from '../services/api';

interface ServiceManagementProps {
  tenantId: string;
  planType: number;
}

export default function ServiceManagement({ tenantId, planType }: ServiceManagementProps) {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentServices, setCurrentServices] = useState(0);
  const [maxServices, setMaxServices] = useState(0);
  const [popup, setPopup] = useState<{ type: 'error' | 'success' | 'info'; message: string; title?: string } | null>(null);

  const canAdd = currentServices < maxServices;
  const router = useRouter();

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response: ServicesByTenantResponse = await serviceService.getServicesByTenant(tenantId);
      setServices(response.services || []);
      setCurrentServices(response.currentServices);
      setMaxServices(response.maxServices);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar los servicios');
      }
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (serviceId: string, serviceName: string) => {
    // Use the app confirm dialog (async) instead of native confirm()
    const { confirmDialog } = await import('../lib/dialog');
    const ok = await confirmDialog(`¿Estás seguro de que deseas eliminar "${serviceName}"?`);
    if (!ok) return;

    try {
      await serviceService.deleteService(serviceId);
      setPopup({ type: 'success', message: 'Servicio eliminado exitosamente' });
      await fetchServices();
    } catch (err) {
      if (err instanceof ApiError) {
        // Check for reservations blocking deletion
        if (err.message.includes('Cannot delete service with existing reservations')) {
          setPopup({ 
            type: 'error', 
            title: 'No se puede eliminar',
            message: 'Este servicio tiene reservas existentes. Por favor, reasigna o cancela las reservas antes de eliminar el servicio.' 
          });
        } else {
          setPopup({ type: 'error', message: `Error: ${err.message}` });
        }
      } else {
        setPopup({ type: 'error', message: 'Error al eliminar el servicio' });
      }
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 md:p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-dark dark:text-light flex items-center gap-2">
            <span className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500"></span>
            Servicios
          </h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            {getServiceLimitDescription(planType as PlanType)} • {currentServices} de {maxServices === Infinity ? '∞' : maxServices} en uso
          </p>
        </div>
        
        <button
          onClick={() => canAdd ? router.push('/business/' + tenantId + '/settings/service/new') : router.push('/pricing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            canAdd
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30'
              : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400 dark:text-secondary-600 hover:brightness-95'
          }`}
          title={!canAdd ? 'Has alcanzado el límite de servicios para tu plan — Ir a Pricing' : 'Agregar servicio'}
        >
          + Agregar Servicio
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Services List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-50 dark:bg-secondary-900/20 mb-4">
                <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark dark:text-light mb-2">Sin servicios</h3>
              <p className="text-secondary-500 dark:text-secondary-400 mb-4">
                Agrega los servicios que ofreces para que los clientes puedan reservarlos
              </p>
              <button
                onClick={() => canAdd ? router.push('/business/' + tenantId + '/settings/service/new') : router.push('/pricing')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Agregar Primer Servicio
              </button>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-light-darker dark:border-secondary-700 hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all bg-light-darker/30 dark:bg-secondary-900/20"
              >
                {/* Service Icon/Image */}
                <div className="relative flex-shrink-0">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover ring-2 ring-light-darker dark:ring-secondary-700"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-base sm:text-xl">
                      {service.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <h3 className="font-bold text-dark dark:text-light text-sm sm:text-base truncate">{service.name}</h3>
                    {service.category && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                        {service.category}
                      </span>
                    )}
                    {service.requiresApproval && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                        Requiere aprobación
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-secondary-600 dark:text-secondary-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(service.durationMinutes)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/business/${tenantId}/settings/service/${service.id}`)}
                    className="p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    title="Editar servicio"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.name)}
                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Eliminar servicio"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <MessagePopup
        visible={popup !== null}
        type={popup?.type}
        title={popup?.title}
        message={popup?.message || ''}
        onClose={() => setPopup(null)}
      />
    </div>
  );
}
