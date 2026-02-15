'use client';

import { WorkerDto } from '../services/worker';
import { User } from '../services/auth';

export default function ProfileWorkerWindow({ worker, user }: { worker: WorkerDto; user: User }) {
  const displayName = (worker.firstName || user.firstName || worker.jobTitle || 'Trabajador') + (worker.lastName ? ' ' + worker.lastName : '');
  const initial = (worker.firstName || user.firstName || worker.jobTitle || 'T')[0].toUpperCase();

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 border border-light-darker dark:border-secondary-700 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-xl">
          {initial}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-dark dark:text-light truncate">{displayName}</h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">Trabajador</span>
          </div>
          {worker.jobTitle && <p className="text-sm text-secondary-500 mt-1">{worker.jobTitle}</p>}
          {worker.email && <p className="text-xs text-secondary-400 mt-2">{worker.email}</p>}
        </div>
      </div>

      {worker.bio && (
        <p className="text-sm text-secondary-500 mt-4 line-clamp-3">{worker.bio}</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${worker.isAvailableForBooking ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white dark:border-dark-light`} />
        <span className="text-sm text-secondary-500">{worker.isAvailableForBooking ? 'Disponible para reservas' : 'No disponible'}</span>
      </div>
    </div>
  );
}
