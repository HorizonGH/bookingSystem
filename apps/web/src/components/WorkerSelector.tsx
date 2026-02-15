'use client';

import { useState, useEffect } from 'react';
import { WorkerDto, workerService } from '../services/worker';
import { PlanType } from '../services/auth';

interface WorkerSelectorProps {
  tenantId: string;
  planType: number; // 0: Free, 1: Basic, 2: Professional, 3: Enterprise
  selectedWorkerId: string;
  onWorkerSelect: (workerId: string) => void;
  className?: string;
}

export function WorkerSelector({
  tenantId,
  planType,
  selectedWorkerId,
  onWorkerSelect,
  className = '',
}: WorkerSelectorProps) {
  const [workers, setWorkers] = useState<WorkerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // For Free plan, we don't show selection - just display the single worker
  const isSingleWorkerPlan = planType === PlanType.Free;
  const hasMultipleWorkers = (workers || []).length > 1;
  const shouldShowSelector = !isSingleWorkerPlan && hasMultipleWorkers;

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setIsLoading(true);
        setError('');
        const availableWorkers = await workerService.getAvailableWorkersForBooking(tenantId);
        setWorkers(availableWorkers);
        
        // Auto-select first worker if none selected and there are workers
        if (availableWorkers.length > 0 && !selectedWorkerId) {
          onWorkerSelect(availableWorkers[0].id);
        }
        
        // If only one worker (Free plan), auto-select it
        if (availableWorkers.length === 1) {
          onWorkerSelect(availableWorkers[0].id);
        }
      } catch (err) {
        setError('Error al cargar los trabajadores disponibles');
        console.error('Error fetching workers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (tenantId) {
      fetchWorkers();
    }
  }, [tenantId, selectedWorkerId, onWorkerSelect]);

  const getWorkerDisplayName = (worker: WorkerDto): string => {
    if (worker.firstName && worker.lastName) {
      return `${worker.firstName} ${worker.lastName}`;
    }
    if (worker.firstName) {
      return worker.firstName;
    }
    return worker.jobTitle || 'Trabajador';
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-500 dark:text-secondary-400 ml-1">
          Profesional
        </label>
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-secondary-500">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-500 dark:text-secondary-400 ml-1">
          Profesional
        </label>
        <div className="text-sm text-red-500 py-2">{error}</div>
      </div>
    );
  }

  if ((workers || []).length === 0) {
    return (
      <div className={`${className}`}>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-500 dark:text-secondary-400 ml-1">
          Profesional
        </label>
        <div className="text-sm text-secondary-500 py-2">No hay trabajadores disponibles</div>
      </div>
    );
  }

  // Single worker display (Free plan or only one worker available)
  if (!shouldShowSelector) {
    const singleWorker = workers[0];
    return (
      <div className={`${className}`}>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-500 dark:text-secondary-400 ml-1">
          Profesional
        </label>
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20">
          {/* Worker Avatar */}
          <div className="relative">
            {singleWorker.profileImageUrl ? (
              <img
                src={singleWorker.profileImageUrl}
                alt={getWorkerDisplayName(singleWorker)}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                {getWorkerDisplayName(singleWorker).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-dark-light"></div>
          </div>
          
          <div className="flex-1">
            <p className="font-semibold text-dark dark:text-light">
              {getWorkerDisplayName(singleWorker)}
            </p>
            {singleWorker.jobTitle && (
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                {singleWorker.jobTitle}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <span className="px-3 py-1 text-xs font-bold bg-primary-500 text-white rounded-full">
              Asignado
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Multiple workers - Show scrollable list
  return (
    <div className={`${className}`}>
      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-500 dark:text-secondary-400 ml-1">
        Selecciona un Profesional
      </label>
      
      <div className="max-h-64 overflow-y-auto rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-light dark:bg-dark">
        {workers.map((worker) => {
          const isSelected = worker.id === selectedWorkerId;
          return (
            <button
              key={worker.id}
              type="button"
              onClick={() => onWorkerSelect(worker.id)}
              className={`w-full flex items-center gap-3 p-4 transition-all duration-200 border-b border-light-darker dark:border-secondary-700 last:border-b-0
                ${isSelected 
                  ? 'bg-primary-50 dark:bg-primary-900/20' 
                  : 'hover:bg-secondary-50 dark:hover:bg-secondary-900/20'
                }`}
            >
              {/* Worker Avatar */}
              <div className="relative flex-shrink-0">
                {worker.profileImageUrl ? (
                  <img
                    src={worker.profileImageUrl}
                    alt={getWorkerDisplayName(worker)}
                    className={`w-12 h-12 rounded-full object-cover ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                    ${isSelected 
                      ? 'bg-gradient-to-br from-primary-400 to-secondary-500' 
                      : 'bg-gradient-to-br from-secondary-400 to-secondary-600'
                    }`}>
                    {getWorkerDisplayName(worker).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-dark"></div>
              </div>
              
              {/* Worker Info */}
              <div className="flex-1 text-left">
                <p className={`font-semibold ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-dark dark:text-light'}`}>
                  {getWorkerDisplayName(worker)}
                </p>
                {worker.jobTitle && (
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {worker.jobTitle}
                  </p>
                )}
                {worker.bio && (
                  <p className="text-xs text-secondary-400 dark:text-secondary-500 line-clamp-1 mt-0.5">
                    {worker.bio}
                  </p>
                )}
              </div>
              
              {/* Selection Indicator */}
              <div className="flex-shrink-0">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-secondary-300 dark:border-secondary-600"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-secondary-400 mt-2 ml-1">
        {(workers || []).length} profesionales disponibles
      </p>
    </div>
  );
}
