'use client';

import Link from 'next/link';
import TenantManagement from './TenantManagement';
import SubscriptionBadge from './payments/SubscriptionBadge';
import ActiveSessionCard from './payments/ActiveSessionCard';
import { Tenant } from '../services/auth';

export default function ProfileTenantWindow({ tenant, tenantId, onUpdate }: { tenant: Tenant; tenantId: string; onUpdate: (t: Tenant) => void }) {
  return (
    <div>
      {/* Subscription Status */}
      <div className="mb-4">
        <SubscriptionBadge
          planType={tenant.planType}
          subscriptionStatus={tenant.subscriptionStatus}
          isActive={tenant.isActive}
        />
      </div>

      {/* Active payment session (if any) */}
      <div className="mb-4">
        <ActiveSessionCard tenantId={tenantId} />
      </div>

      <div className="flex flex-wrap gap-2 justify-end mb-4">
        <Link href="/upgrade" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold text-sm">
          Mejorar Plan
        </Link>
        <Link href="/billing/history" className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-semibold text-sm">
          Historial de Pagos
        </Link>
        <Link href={`/business/${tenantId}/settings`} className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-semibold text-sm">
          Ir a Configuración del Negocio
        </Link>
      </div>

      {/* Hide the inline edit button here — use the tenant settings page instead */}
      <TenantManagement tenant={tenant} tenantId={tenantId} onUpdate={onUpdate} showEditButton={false} />
    </div>
  );
}
