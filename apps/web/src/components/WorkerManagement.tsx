'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  WorkerDto, 
  workerService, 
  CreateWorkerRequest, 
  UpdateWorkerRequest,
  getMaxWorkersForPlan,
  canAddWorker,
  getWorkerLimitDescription
} from '../services/worker';
import MessagePopup from './MessagePopup';
import { User, PlanType } from '../services/auth';
import { ApiError } from '../services/api';
import WorkerScheduleManagement from './WorkerScheduleManagement';

interface WorkerManagementProps {
  tenantId: string;
  planType: number;
  currentUser: User;
}

export default function WorkerManagement({ tenantId, planType, currentUser }: WorkerManagementProps) {
  const [workers, setWorkers] = useState<WorkerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerDto | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Schedule management state
  const [scheduleWorker, setScheduleWorker] = useState<WorkerDto | null>(null);

  // Error / message popup
  const [popup, setPopup] = useState<{ type: 'error' | 'success' | 'info'; message: string; title?: string } | null>(null);
  
  // Form state
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

  const maxWorkers = getMaxWorkersForPlan(planType as PlanType);
  const canAdd = canAddWorker(planType as PlanType, (workers || []).length);

  const fetchWorkers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const workerList = await workerService.getWorkersByTenant(tenantId);
      // Ensure workerList is always an array
      setWorkers(Array.isArray(workerList) ? workerList : []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar los trabajadores');
      }
      // Ensure workers is set to empty array on error
      setWorkers([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const openAddModal = () => {
    setEditingWorker(null);
    setFormData({
      // default userId to current user to avoid backend validation failures
      userId: currentUser?.id || '',
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: '',
      bio: '',
      profileImageUrl: '',
      isAvailableForBooking: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (worker: WorkerDto) => {
    setEditingWorker(worker);
    setFormData({
      userId: worker.userId || '',
      firstName: worker.firstName || '',
      lastName: worker.lastName || '',
      email: worker.email || '',
      jobTitle: worker.jobTitle || '',
      bio: worker.bio || '',
      profileImageUrl: worker.profileImageUrl || '',
      isAvailableForBooking: worker.isAvailableForBooking,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWorker(null);
    setFormData({
      userId: '',
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: '',
      bio: '',
      profileImageUrl: '',
      isAvailableForBooking: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (editingWorker) {
        // Update existing worker
        const updateData: UpdateWorkerRequest = {
          userId: formData.userId || undefined,
          tenantId,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          email: formData.email || undefined,
          jobTitle: formData.jobTitle || undefined,
          bio: formData.bio || undefined,
          profileImageUrl: formData.profileImageUrl || undefined,
          isAvailableForBooking: formData.isAvailableForBooking,
        };
        await workerService.updateWorker(editingWorker.id, updateData);
        setPopup({ type: 'success', message: 'Trabajador actualizado exitosamente' });
      } else {
        // Create new worker - ensure we send a userId (fallback to current user)
        const userIdToSend = formData.userId?.trim() || currentUser.id;

        // Basic client-side validation
        if (!userIdToSend) {
          setPopup({ type: 'error', message: 'Se requiere userId para crear un trabajador. Vincula un usuario o usa tu propio userId.' });
          setModalLoading(false);
          return;
        }

        const createData: CreateWorkerRequest = {
          userId: userIdToSend,
          tenantId,
          email: formData.email || undefined,
          jobTitle: formData.jobTitle || undefined,
          bio: formData.bio || undefined,
          profileImageUrl: formData.profileImageUrl || undefined,
          isAvailableForBooking: formData.isAvailableForBooking,
        };

        await workerService.createWorker(createData);
        setPopup({ type: 'success', message: 'Trabajador agregado exitosamente' });
      }
      
      await fetchWorkers();
      closeModal();
    } catch (err) {
      console.error('Worker save error:', err);
      if (err instanceof ApiError) {
        // Prefer detailed API response when available
        const details = (err as any).data ?? {};
        const detailMessage = details?.errors ? JSON.stringify(details.errors) : details?.message || undefined;
        setPopup({ type: 'error', message: `Error: ${err.message}${detailMessage ? ' — ' + detailMessage : ''}` });
      } else {
        setPopup({ type: 'error', message: 'Error al guardar el trabajador' });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (workerId: string, workerName: string) => {
    // Use the app confirm dialog (async) instead of native confirm()
    const { confirmDialog } = await import('../lib/dialog');
    const ok = await confirmDialog(`¿Estás seguro de que deseas eliminar a ${workerName}?`);
    if (!ok) return;

    try {
      await workerService.deleteWorker(workerId);
      setPopup({ type: 'success', message: 'Trabajador eliminado exitosamente' });
      await fetchWorkers();
    } catch (err) {
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: `Error: ${err.message}` });
      } else {
        setPopup({ type: 'error', message: 'Error al eliminar el trabajador' });
      }
    }
  };

  const getWorkerDisplayName = (worker: WorkerDto): string => {
    if (worker.firstName && worker.lastName) {
      return `${worker.firstName} ${worker.lastName}`;
    }
    if (worker.firstName) {
      return worker.firstName;
    }
    return 'Trabajador';
  };

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 md:p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-dark dark:text-light flex items-center gap-2">
            <span className="w-2 h-8 rounded-full bg-gradient-to-b from-secondary-500 to-primary-500"></span>
            Equipo de Trabajo
          </h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            {getWorkerLimitDescription(planType as PlanType)} • {(workers || []).length} de {maxWorkers === Infinity ? '∞' : maxWorkers} en uso
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
          title={!canAdd ? 'Has alcanzado el límite de trabajadores para tu plan' : 'Agregar trabajador'}
        >
          + Agregar Trabajador
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

      {/* Workers List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {(workers || []).length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-50 dark:bg-secondary-900/20 mb-4">
                <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark dark:text-light mb-2">Sin trabajadores</h3>
              <p className="text-secondary-500 dark:text-secondary-400 mb-4">
                Agrega miembros de tu equipo para que puedan recibir reservas
              </p>
              {canAdd && (
                <button
                  onClick={openAddModal}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Agregar Primer Trabajador
                </button>
              )}
            </div>
          ) : (
            (workers || []).map((worker) => (
              <div
                key={worker.id}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-light-darker dark:border-secondary-700 hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all bg-light-darker/30 dark:bg-secondary-900/20"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {worker.profileImageUrl ? (
                    <img
                      src={worker.profileImageUrl}
                      alt={getWorkerDisplayName(worker)}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-light-darker dark:ring-secondary-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-xl">
                      {getWorkerDisplayName(worker).charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Availability indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-dark-light ${
                    worker.isAvailableForBooking ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>

                {/* Worker Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-dark dark:text-light truncate">
                      {getWorkerDisplayName(worker)}
                    </h3>
                    {worker.userId === currentUser.id && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                        Tú
                      </span>
                    )}
                  </div>
                  
                  {worker.jobTitle && (
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">
                      {worker.jobTitle}
                    </p>
                  )}
                  
                  {worker.bio && (
                    <p className="text-xs text-secondary-500 dark:text-secondary-500 line-clamp-2">
                      {worker.bio}
                    </p>
                  )}
                  
                  {worker.email && (
                    <p className="text-xs text-secondary-400 dark:text-secondary-600 mt-1">
                      {worker.email}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => setScheduleWorker(worker)}
                    className="px-3 py-1.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    📅 Horarios
                  </button>
                  <button
                    onClick={() => openEditModal(worker)}
                    className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-dark border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                  >
                    Editar
                  </button>
                  {(workers || []).length > 1 && (
                    <button
                      onClick={() => handleDelete(worker.id, getWorkerDisplayName(worker))}
                      className="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-light-darker dark:border-secondary-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-secondary-600 px-6 py-4 text-white rounded-t-2xl">
              <h3 className="text-xl font-bold">
                {editingWorker ? 'Editar Trabajador' : 'Agregar Trabajador'}
              </h3>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Nombre"
                    className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Apellidos"
                    className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@ejemplo.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                    Vincular a Usuario (userId)
                  </label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    placeholder="ID usuario (por defecto: tu userId)"
                    className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
                  />
                  <p className="text-xs text-secondary-400 mt-2">Si dejas vacío se usará tu userId por defecto. Para vincular a otro usuario, pega aquí su ID.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                  Título del Trabajo
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  placeholder="Ej: Barbero, Estilista, Masajista"
                  className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Breve descripción sobre el trabajador..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                  URL de Imagen de Perfil
                </label>
                <input
                  type="url"
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData({...formData, profileImageUrl: e.target.value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-light-darker dark:bg-secondary-900/30 rounded-xl">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailableForBooking}
                  onChange={(e) => setFormData({...formData, isAvailableForBooking: e.target.checked})}
                  className="w-5 h-5 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-secondary-700 dark:text-secondary-300 cursor-pointer">
                  Disponible para recibir reservas
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {modalLoading ? 'Guardando...' : editingWorker ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={modalLoading}
                  className="px-6 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Management Modal */}
      {scheduleWorker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-light-darker dark:border-secondary-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-secondary-600 px-6 py-4 text-white rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Gestionar Horarios - {getWorkerDisplayName(scheduleWorker)}
              </h3>
              <button
                onClick={() => setScheduleWorker(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <WorkerScheduleManagement
                tenantId={tenantId}
                workerId={scheduleWorker.id}
                workerName={getWorkerDisplayName(scheduleWorker)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Message popup (error / success) */}
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
