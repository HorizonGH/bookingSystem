'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { serviceService, CreateServiceRequest } from '../../../../../../services/service';
import { ApiError } from '../../../../../../services/api';
import MessagePopup from '../../../../../../components/MessagePopup';

export default function NewServicePage() {
  const params = useParams() as { id: string };
  const businessId = params?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setPopup({ type: 'error', message: 'El nombre del servicio es requerido' });
      return;
    }
    setLoading(true);
    try {
      const createData: CreateServiceRequest = {
        tenantId: businessId,
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
      router.push(`/business/${businessId}/settings`);
    } catch (err) {
      if (err instanceof ApiError) {
        if ((err.message || '').includes('Service limit reached')) {
          router.push('/pricing');
          return;
        }
        setPopup({ type: 'error', message: `Error: ${err.message}` });
      } else {
        setPopup({ type: 'error', message: 'Error al crear el servicio' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Header */}
      <div className="bg-white dark:bg-dark-light border-b border-light-darker dark:border-secondary-700 px-4 py-4">
        <div className="container mx-auto max-w-2xl flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-dark dark:text-light">Agregar Servicio</h1>
            <p className="text-xs text-secondary-500">Completa la información del nuevo servicio</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-light rounded-2xl shadow border border-light-darker dark:border-secondary-700 divide-y divide-light-darker dark:divide-secondary-700">
          {/* Basic Information */}
          <div className="p-6 space-y-4">
            <h2 className="text-base font-bold text-dark dark:text-light">Información básica</h2>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                placeholder="Ej: Corte de cabello"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light resize-none"
                placeholder="Describe el servicio"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                  Duración (min) *
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                  Precio ($) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                Categoría
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                placeholder="Ej: Peluquería, Spa"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                URL de Imagen
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="p-6 space-y-4">
            <h2 className="text-base font-bold text-dark dark:text-light">Configuración avanzada</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                  Tiempo de preparación antes (min)
                </label>
                <p className="text-xs text-secondary-400 dark:text-secondary-500 mb-1.5">Minutos libres antes de que comience el turno</p>
                <input
                  type="number"
                  value={formData.bufferTimeBefore}
                  onChange={(e) => setFormData({ ...formData, bufferTimeBefore: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                  Tiempo de limpieza después (min)
                </label>
                <p className="text-xs text-secondary-400 dark:text-secondary-500 mb-1.5">Minutos libres después de que termina el turno</p>
                <input
                  type="number"
                  value={formData.bufferTimeAfter}
                  onChange={(e) => setFormData({ ...formData, bufferTimeAfter: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                  Reserva anticipada (h)
                </label>
                <input
                  type="number"
                  value={formData.advanceBookingHours}
                  onChange={(e) => setFormData({ ...formData, advanceBookingHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">
                  Reserva mínima (h)
                </label>
                <input
                  type="number"
                  value={formData.minBookingHours}
                  onChange={(e) => setFormData({ ...formData, minBookingHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-colors text-dark dark:text-light"
                  min="0"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-light-darker dark:border-secondary-700 text-primary-500 focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                Requiere aprobación manual
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="p-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Crear Servicio
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 sm:flex-none sm:px-6 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <MessagePopup
        visible={popup !== null}
        type={popup?.type}
        message={popup?.message || ''}
        onClose={() => setPopup(null)}
      />
    </div>
  );
}
