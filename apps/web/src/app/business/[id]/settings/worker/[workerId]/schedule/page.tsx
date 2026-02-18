'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WorkerScheduleManagement from '../../../../../../../components/WorkerScheduleManagement';
import { workerService, WorkerDto } from '../../../../../../../services/worker';

export default function WorkerSchedulePage() {
  const params = useParams() as { id: string; workerId: string };
  const businessId = params?.id;
  const workerId = params?.workerId;
  const router = useRouter();

  const [worker, setWorker] = useState<WorkerDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const w = await workerService.getWorkerById(workerId);
        setWorker(w);
      } catch {
        // Worker not found – allow page to render without name
      } finally {
        setIsLoading(false);
      }
    };
    if (workerId) load();
  }, [workerId]);

  const workerName = worker
    ? [worker.firstName, worker.lastName].filter(Boolean).join(' ') || 'Trabajador'
    : 'Trabajador';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Header */}
      <div className="bg-white dark:bg-dark-light border-b border-light-darker dark:border-secondary-700 px-4 py-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-dark dark:text-light">Gestionar Horarios</h1>
            <p className="text-xs text-secondary-500">{workerName}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6">
        <WorkerScheduleManagement
          tenantId={businessId}
          workerId={workerId}
          workerName={workerName}
        />
      </div>
    </div>
  );
}
