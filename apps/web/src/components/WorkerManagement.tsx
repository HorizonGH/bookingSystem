'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  WorkerDto, 
  workerService, 
  getMaxWorkersForPlan,
  canAddWorker,
  getWorkerLimitDescription
} from '../services/worker';
import MessagePopup from './MessagePopup';
import { User, PlanType } from '../services/auth';
import { ApiError } from '../services/api';

interface WorkerManagementProps {
  tenantId: string;
  planType: number;
  currentUser: User;
}

export default function WorkerManagement({ tenantId, planType, currentUser }: WorkerManagementProps) {
  const [workers, setWorkers] = useState<WorkerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [popup, setPopup] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  const maxWorkers = getMaxWorkersForPlan(planType as PlanType);
  const canAdd = canAddWorker(planType as PlanType, (workers || []).length);
  const router = useRouter();

  const fetchWorkers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const workerList = await workerService.getWorkersByTenant(tenantId);
      setWorkers(Array.isArray(workerList) ? workerList : []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar los trabajadores');
      }
      setWorkers([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleDelete = async (workerId: string, workerName: string) => {
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
    if (worker.firstName) return worker.firstName;
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
          onClick={() => canAdd ? router.push('/business/' + tenantId + '/settings/worker/new') : router.push('/pricing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            canAdd
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30'
              : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400 dark:text-secondary-600 hover:brightness-95'
          }`}
          title={!canAdd ? 'Has alcanzado el límite de trabajadores para tu plan — Ir a Pricing' : 'Agregar trabajador'}
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
              <button
                onClick={() => canAdd ? router.push('/business/' + tenantId + '/settings/worker/new') : router.push('/pricing')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Agregar Primer Trabajador
              </button>
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
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-light-darker dark:ring-secondary-700"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-base sm:text-xl">
                      {getWorkerDisplayName(worker).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white dark:border-dark-light ${
                    worker.isAvailableForBooking ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>

                {/* Worker Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm sm:text-lg font-bold text-dark dark:text-light truncate">
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
                <div className="flex flex-row sm:flex-col gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => router.push('/business/' + tenantId + '/settings/worker/' + worker.id + '/schedule')}
                    className="px-2 sm:px-3 py-1.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    📅 Horarios
                  </button>
                  <button
                    onClick={() => router.push('/business/' + tenantId + '/settings/worker/' + worker.id)}
                    className="px-2 sm:px-3 py-1.5 text-xs font-medium bg-white dark:bg-dark border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                  >
                    Editar
                  </button>
                  {(workers || []).length > 1 && (
                    <button
                      onClick={() => handleDelete(worker.id, getWorkerDisplayName(worker))}
                      className="px-2 sm:px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
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

      {/* Message popup */}
      <MessagePopup
        visible={popup !== null}
        type={popup?.type}
        message={popup?.message || ''}
        onClose={() => setPopup(null)}
      />
    </div>
  );
}
