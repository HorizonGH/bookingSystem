'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TenantManagement from '../../../../components/TenantManagement';
import WorkerManagement from '../../../../components/WorkerManagement';
import ServiceManagement from '../../../../components/ServiceManagement';
import TenantImageManager from '../../../../components/TenantImageManager';
import { authService, Tenant, User } from '../../../../services/auth';
import { ApiError } from '../../../../services/api';

type SettingsTab = 'negocio' | 'servicios' | 'equipo' | 'imagenes';

export default function BusinessSettingsPage() {
  const params = useParams() as { id: string };
  const businessId = params?.id;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<SettingsTab>('negocio');

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
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
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

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'negocio', label: 'Negocio', icon: '🏢' },
    { key: 'servicios', label: 'Servicios', icon: '✂️' },
    { key: 'equipo', label: 'Equipo', icon: '👥' },
    { key: 'imagenes', label: 'Imágenes', icon: '🖼️' },
  ];

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative pb-8">
      {/* Page Header */}
      <div className="bg-white dark:bg-dark-light border-b border-light-darker dark:border-secondary-700 px-4 py-4 md:py-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-dark dark:text-light">
            Configuración — {tenant.name}
          </h1>
          <p className="text-sm text-secondary-500 mt-0.5">Ajustes del negocio y gestión de equipo</p>
        </div>
      </div>

      {!isTenantAdmin && (
        <div className="container mx-auto max-w-6xl px-4 mt-8">
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow p-6 border border-light-darker dark:border-secondary-700">
            <p className="text-center text-secondary-600">No tienes permisos para administrar este negocio.</p>
          </div>
        </div>
      )}

      {isTenantAdmin && (
        <>
          {/* ── Mobile Tab Bar (visible on < lg) ── */}
          <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-dark-light border-b border-light-darker dark:border-secondary-700">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Mobile: single visible section ── */}
          <div className="lg:hidden container mx-auto max-w-6xl px-4 py-4 space-y-4">
            {activeTab === 'negocio' && (
              <TenantManagement tenant={tenant} tenantId={tenant.id} onUpdate={(t) => setTenant(t)} />
            )}
            {activeTab === 'servicios' && (
              <ServiceManagement tenantId={tenant.id} planType={tenant.planType} />
            )}
            {activeTab === 'equipo' && (
              <WorkerManagement tenantId={tenant.id} planType={tenant.planType} currentUser={user!} />
            )}
            {activeTab === 'imagenes' && (
              <TenantImageManager tenantId={tenant.id} planType={tenant.planType} />
            )}
          </div>

          {/* ── Desktop: grid layout (visible on lg+) ── */}
          <div className="hidden lg:block container mx-auto max-w-6xl px-4 py-8">
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <TenantManagement tenant={tenant} tenantId={tenant.id} onUpdate={(t) => setTenant(t)} />
                <ServiceManagement tenantId={tenant.id} planType={tenant.planType} />
              </div>
              <TenantImageManager tenantId={tenant.id} planType={tenant.planType} />
              <WorkerManagement tenantId={tenant.id} planType={tenant.planType} currentUser={user!} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
