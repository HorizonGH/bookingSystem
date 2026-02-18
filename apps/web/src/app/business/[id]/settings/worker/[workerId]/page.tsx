'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { workerService, WorkerDto, UpdateWorkerRequest } from '../../../../../../services/worker';
import { ApiError } from '../../../../../../services/api';
import MessagePopup from '../../../../../../components/MessagePopup';

export default function EditWorkerPage() {
  const params = useParams() as { id: string; workerId: string };
  const businessId = params?.id;
  const workerId = params?.workerId;
  const router = useRouter();

  const [worker, setWorker] = useState<WorkerDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    bio: '',
    profileImageUrl: '',
    isAvailableForBooking: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const w = await workerService.getWorkerById(workerId);
        setWorker(w);
        setFormData({
          userId: w.userId || '',
          firstName: w.firstName || '',
          lastName: w.lastName || '',
          email: w.email || '',
          jobTitle: w.jobTitle || '',
          bio: w.bio || '',
          profileImageUrl: w.profileImageUrl || '',
          isAvailableForBooking: w.isAvailableForBooking,
        });
      } catch (e) {
        void e;
        setPopup({ type: 'error', message: 'No se pudo cargar el trabajador' });
      } finally {
        setIsLoading(false);
      }
    };
    if (workerId) load();
  }, [workerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData: UpdateWorkerRequest = {
        userId: formData.userId || undefined,
        tenantId: businessId,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
        jobTitle: formData.jobTitle || undefined,
        bio: formData.bio || undefined,
        profileImageUrl: formData.profileImageUrl || undefined,
        isAvailableForBooking: formData.isAvailableForBooking,
      };
      await workerService.updateWorker(workerId, updateData);
      router.push(`/business/${businessId}/settings`);
    } catch (err) {
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: `Error: ${(err as ApiError).message}` });
      } else {
        setPopup({ type: 'error', message: 'Error al actualizar el trabajador' });
      }
    } finally {
      setSaving(false);
    }
  };

  const workerName = worker
    ? [worker.firstName, worker.lastName].filter(Boolean).join(' ') || 'Trabajador'
    : '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
        <div className="text-center">
          <p className="text-secondary-500 mb-4">Trabajador no encontrado</p>
          <button onClick={() => router.back()} className="text-primary-500 hover:underline text-sm">Volver</button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-extrabold text-dark dark:text-light">Editar Trabajador</h1>
            <p className="text-xs text-secondary-500 truncate max-w-[200px]">{workerName}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-light rounded-2xl shadow border border-light-darker dark:border-secondary-700 divide-y divide-light-darker dark:divide-secondary-700">
          <div className="p-6 space-y-4">
            <h2 className="text-base font-bold text-dark dark:text-light">Información personal</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">Nombre</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Nombre"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">Apellidos</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Apellidos"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@ejemplo.com"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">Título del trabajo</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Ej: Barbero, Estilista"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">Biografía</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Breve descripción..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-secondary-700 dark:text-secondary-300">URL de imagen de perfil</label>
              <input
                type="url"
                value={formData.profileImageUrl}
                onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light focus:border-primary-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-base font-bold text-dark dark:text-light">Disponibilidad</h2>

            <label className="flex items-center gap-3 cursor-pointer p-4 bg-light-darker dark:bg-secondary-900/30 rounded-xl">
              <input
                type="checkbox"
                checked={formData.isAvailableForBooking}
                onChange={(e) => setFormData({ ...formData, isAvailableForBooking: e.target.checked })}
                className="w-5 h-5 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Disponible para recibir reservas
              </span>
            </label>
          </div>

          <div className="p-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Actualizar Trabajador
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
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
