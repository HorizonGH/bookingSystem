'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ServiceDto, 
  serviceService, 
  CreateServiceRequest, 
  UpdateServiceRequest,
  ServicesByTenantResponse,
  getMaxServicesForPlan,
  canAddService,
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
  
  // Service limits info
  const [currentServices, setCurrentServices] = useState(0);
  const [maxServices, setMaxServices] = useState(0);
  
  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDto | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Error / message popup
  const [popup, setPopup] = useState<{ type: 'error' | 'success' | 'info'; message: string; title?: string } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
    imageUrl: '',
    category: '',
    bufferTimeBefore: 0,
    bufferTimeAfter: 0,
    requiresApproval: false,
    advanceBookingHours: 24,
    minBookingHours: 1,
  });

  const canAdd = currentServices < maxServices;

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

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      durationMinutes: 30,
      price: 0,
      imageUrl: '',
      category: '',
      bufferTimeBefore: 0,
      bufferTimeAfter: 0,
      requiresApproval: false,
      advanceBookingHours: 24,
      minBookingHours: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceDto) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      durationMinutes: service.durationMinutes || 30,
      price: service.price || 0,
      imageUrl: service.imageUrl || '',
      category: service.category || '',
      bufferTimeBefore: service.bufferTimeBefore || 0,
      bufferTimeAfter: service.bufferTimeAfter || 0,
      requiresApproval: service.requiresApproval || false,
      advanceBookingHours: service.advanceBookingHours || 24,
      minBookingHours: service.minBookingHours || 1,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      durationMinutes: 30,
      price: 0,
      imageUrl: '',
      category: '',
      bufferTimeBefore: 0,
      bufferTimeAfter: 0,
      requiresApproval: false,
      advanceBookingHours: 24,
      minBookingHours: 1,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (editingService) {
        // Update existing service
        const updateData: UpdateServiceRequest = {
          id: editingService.id,
          name: formData.name || undefined,
          description: formData.description || undefined,
          durationMinutes: formData.durationMinutes,
          price: formData.price,
          imageUrl: formData.imageUrl || undefined,
          category: formData.category || undefined,
          bufferTimeBefore: formData.bufferTimeBefore || undefined,
          bufferTimeAfter: formData.bufferTimeAfter || undefined,
          requiresApproval: formData.requiresApproval,
          advanceBookingHours: formData.advanceBookingHours || undefined,
          minBookingHours: formData.minBookingHours || undefined,
        };
        await serviceService.updateService(updateData);
        setPopup({ type: 'success', message: 'Servicio actualizado exitosamente' });
      } else {
        // Create new service
        if (!formData.name.trim()) {
          setPopup({ type: 'error', message: 'El nombre del servicio es requerido' });
          setModalLoading(false);
          return;
        }

        const createData: CreateServiceRequest = {
          tenantId,
          name: formData.name,
          description: formData.description || undefined,
          durationMinutes: formData.durationMinutes,
          price: formData.price,
          imageUrl: formData.imageUrl || undefined,
          category: formData.category || undefined,
          bufferTimeBefore: formData.bufferTimeBefore || undefined,
          bufferTimeAfter: formData.bufferTimeAfter || undefined,
          requiresApproval: formData.requiresApproval,
          advanceBookingHours: formData.advanceBookingHours || undefined,
          minBookingHours: formData.minBookingHours || undefined,
        };

        await serviceService.createService(createData);
        setPopup({ type: 'success', message: 'Servicio agregado exitosamente' });
      }
      
      await fetchServices();
      closeModal();
    } catch (err) {
      console.error('Service save error:', err);
      if (err instanceof ApiError) {
        // Check for plan limit error
        if (err.message.includes('Service limit reached')) {
          setPopup({ 
            type: 'error', 
            title: 'Límite de servicios alcanzado',
            message: 'Has alcanzado el límite de servicios para tu plan. Actualiza tu plan para agregar más servicios.' 
          });
        } else {
          const details = (err as any).data ?? {};
          const detailMessage = details?.errors ? JSON.stringify(details.errors) : details?.message || undefined;
          setPopup({ type: 'error', message: `Error: ${err.message}${detailMessage ? ' — ' + detailMessage : ''}` });
        }
      } else {
        setPopup({ type: 'error', message: 'Error al guardar el servicio' });
      }
    } finally {
      setModalLoading(false);
    }
  };

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
          onClick={openAddModal}
          disabled={!canAdd}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            canAdd
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30'
              : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400 dark:text-secondary-600 cursor-not-allowed'
          }`}
          title={!canAdd ? 'Has alcanzado el límite de servicios para tu plan' : 'Agregar servicio'}
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
              {canAdd && (
                <button
                  onClick={openAddModal}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Agregar Primer Servicio
                </button>
              )}
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
                      className="w-16 h-16 rounded-lg object-cover ring-2 ring-light-darker dark:ring-secondary-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-xl">
                      {service.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-dark dark:text-light truncate">{service.name}</h3>
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
                    onClick={() => openEditModal(service)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-light-darker dark:border-secondary-700">
            <div className="sticky top-0 bg-white dark:bg-dark-light border-b border-light-darker dark:border-secondary-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-dark dark:text-light">
                {editingService ? 'Editar Servicio' : 'Agregar Servicio'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-dark dark:text-light">Información Básica</h4>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                    placeholder="Ej: Corte de cabello"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                    placeholder="Descripción del servicio"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                      Duración (minutos) *
                    </label>
                    <input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                      Precio ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                    placeholder="Ej: Peluquería, Spa, Consultoría"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4 pt-4 border-t border-light-darker dark:border-secondary-700">
                <h4 className="font-semibold text-dark dark:text-light">Configuración Avanzada</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                      Tiempo buffer antes (min)
                    </label>
                    <input
                      type="number"
                      value={formData.bufferTimeBefore}
                      onChange={(e) => setFormData({ ...formData, bufferTimeBefore: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                      Tiempo buffer después (min)
                    </label>
                    <input
                      type="number"
                      value={formData.bufferTimeAfter}
                      onChange={(e) => setFormData({ ...formData, bufferTimeAfter: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                      Reserva anticipada (horas)
                    </label>
                    <input
                      type="number"
                      value={formData.advanceBookingHours}
                      onChange={(e) => setFormData({ ...formData, advanceBookingHours: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                      Reserva mínima (horas)
                    </label>
                    <input
                      type="number"
                      value={formData.minBookingHours}
                      onChange={(e) => setFormData({ ...formData, minBookingHours: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-light-darker dark:border-secondary-700 text-primary-500 focus:ring-2 focus:ring-primary-500"
                  />
                  <label htmlFor="requiresApproval" className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 cursor-pointer">
                    Requiere aprobación manual
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-light-darker dark:border-secondary-700">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-lg border-2 border-light-darker dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {modalLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingService ? 'Actualizar' : 'Crear'} Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Popup */}
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
