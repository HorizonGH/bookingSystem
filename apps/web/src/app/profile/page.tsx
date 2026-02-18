'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authService, User, ReservationDto, Tenant } from '../../services/auth';
import { ApiError } from '../../services/api';
import TenantManagement from '../../components/TenantManagement';
import { workerService, WorkerDto } from '../../services/worker';
import StageWindows from '../../components/StageWindows';
import ProfileUserWindow from '../../components/ProfileUserWindow';
import ProfileWorkerWindow from '../../components/ProfileWorkerWindow';
import ProfileTenantWindow from '../../components/ProfileTenantWindow';


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [worker, setWorker] = useState<WorkerDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTenantLoading, setIsTenantLoading] = useState(false);
  const [isWorkerLoading, setIsWorkerLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);

        // Fetch worker info (if any) for this user
        setIsWorkerLoading(true);
        try {
          const w = await workerService.getWorkerByUserId(userData.id);
          setWorker(w);
        } catch (err) {
          console.error('Failed to load worker data:', err);
          setWorker(null);
        } finally {
          setIsWorkerLoading(false);
        }
        
        // Fetch tenant data if user is a tenant admin
        if (userData.tenantId) {
          setIsTenantLoading(true);
          try {
            const tenantData = await authService.getTenant(userData.tenantId);
            setTenant(tenantData);
          } catch (err) {
            console.error('Failed to load tenant data:', err);
            setTenant(null);
          } finally {
            setIsTenantLoading(false);
          }
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link
            href="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">No user data found</p>
          <Link
            href="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const userStage = { id: 'user', title: 'Usuario', content: <ProfileUserWindow user={user} /> };
  const workerStage = {
    id: 'worker',
    title: 'Trabajador',
    content: isWorkerLoading
      ? <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm flex items-center justify-center"><div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      : (worker ? <ProfileWorkerWindow worker={worker} user={user} /> : null),
  };
  const tenantStage = {
    id: 'tenant',
    title: 'Negocio',
    content: isTenantLoading
      ? <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-8 border border-light-darker dark:border-secondary-700"><div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-secondary-600 dark:text-secondary-400">Cargando información del negocio...</p></div></div>
      : (tenant ? <ProfileTenantWindow tenant={tenant} tenantId={user.tenantId!} onUpdate={(t) => setTenant(t)} /> : null),
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark relative overflow-hidden">
       {/* Abstract Background Shapes (Matches Hero) */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-12 relative z-10 max-w-6xl">
        
        {/* Header Section */}
        <div className="mb-6 md:mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 transition-colors duration-200 mb-6 group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-dark dark:text-light mb-2">
                Mi Perfil
              </h1>
              <p className="text-base md:text-xl text-secondary-600 dark:text-secondary-400">
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-dark-light/50 backdrop-blur-md border border-light-darker dark:border-secondary-700 px-6 py-3 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-dark dark:text-light">
                  {user.reservations.length}
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">
                  Total Reservas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="animate-slideUp">
          <StageWindows stages={[userStage, workerStage, tenantStage]} />





        </div>
      </div>
      </div>
  );
}