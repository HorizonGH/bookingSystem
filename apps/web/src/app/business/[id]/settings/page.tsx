'use client';

import { use, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import TenantManagement from '../../../../components/TenantManagement';
import WorkerManagement from '../../../../components/WorkerManagement';
import ServiceManagement from '../../../../components/ServiceManagement';
import { authService, Tenant, User } from '../../../../services/auth';
import { ApiError } from '../../../../services/api';

type Tab = 'basic' | 'workers' | 'services';

export default function BusinessSettingsPage() {
  const params = useParams() as { id: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const businessId = params?.id;

  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'basic');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Sincronizar tab con URL
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

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
    <div className="min-h-screen bg-light dark:bg-dark relative py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-dark dark:text-light">Configuración — {tenant.name}</h1>
          <p className="text-secondary-500 mt-2">Gestiona la información de tu negocio, equipo y servicios.</p>
        </div>

        {!isTenantAdmin && (
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow p-6 border border-light-darker dark:border-secondary-700">
            <p className="text-center text-secondary-600">No tienes permisos para administrar este negocio.</p>
          </div>
        )}

        {isTenantAdmin && (
          <div className="space-y-6">
            
            {/* Tabs Header */}
            <div className="border-b border-light-darker dark:border-secondary-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                <button
                  onClick={() => handleTabChange('basic')}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === 'basic'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 hover:border-secondary-300'}
                  `}
                >
                  Información Básica
                </button>
                <button
                  onClick={() => handleTabChange('workers')}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === 'workers'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 hover:border-secondary-300'}
                  `}
                >
                  Equipo de Trabajo
                </button>
                <button
                  onClick={() => handleTabChange('services')}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === 'services'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 hover:border-secondary-300'}
                  `}
                >
                  Servicios Ofrecidos
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6 animate-fadeIn">
              {activeTab === 'basic' && (
                <div className="w-full">
                  <TenantManagement tenant={tenant} tenantId={tenant.id} onUpdate={(t) => setTenant(t)} />
                </div>
              )}

              {activeTab === 'workers' && (
                <div className="w-full">
                  <WorkerManagement tenantId={tenant.id} planType={tenant.planType} currentUser={user!} />
                </div>
              )}

              {activeTab === 'services' && (
                <div className="w-full">
                  <ServiceManagement tenantId={tenant.id} planType={tenant.planType} />
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
