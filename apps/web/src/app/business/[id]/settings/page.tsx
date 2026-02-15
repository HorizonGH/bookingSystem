'use client';

import { use, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TenantManagement from '../../../../components/TenantManagement';
import WorkerManagement from '../../../../components/WorkerManagement';
import { authService, Tenant, User } from '../../../../services/auth';
import { ApiError } from '../../../../services/api';

export default function BusinessSettingsPage() {
  const params = useParams() as { id: string };
  const businessId = params?.id;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [u, t] = await Promise.all([
          authService.getCurrentUser(),
          authService.getTenant(businessId),
        ]);
        setUser(u);
        setTenant(t);
      } catch (err) {
        console.error(err);
        if (err instanceof ApiError) setError(err.message);
        else setError('Error al cargar la configuración del negocio');
      } finally {
        setIsLoading(false);
      }
    };

    if (businessId) load();
  }, [businessId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">{error || 'Negocio no encontrado'}</div>
      </div>
    );
  }

  // Show management UI only to tenant admins (simple check)
  const isTenantAdmin = user?.tenantId === tenant.id;

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-dark dark:text-light">Configuración — {tenant.name}</h1>
          <p className="text-secondary-500">Ajustes del negocio y gestión de equipo</p>
        </div>

        {!isTenantAdmin && (
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow p-6 border border-light-darker dark:border-secondary-700">
            <p className="text-center text-secondary-600">No tienes permisos para administrar este negocio.</p>
          </div>
        )}

        {isTenantAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <TenantManagement tenant={tenant} tenantId={tenant.id} onUpdate={(t) => setTenant(t)} />
            </div>
            <div>
              <WorkerManagement tenantId={tenant.id} planType={tenant.planType} currentUser={user!} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
