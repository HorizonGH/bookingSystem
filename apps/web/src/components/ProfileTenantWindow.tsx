'use client';

import Link from 'next/link';
import TenantManagement from './TenantManagement';
import { Tenant } from '../services/auth';

export default function ProfileTenantWindow({ tenant, tenantId, onUpdate }: { tenant: Tenant; tenantId: string; onUpdate: (t: Tenant) => void }) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Link href={`/business/${tenantId}/settings`} className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-semibold text-sm">
          Ir a Configuración del Negocio
        </Link>
      </div>

      {/* Hide the inline edit button here — use the tenant settings page instead */}
      <TenantManagement tenant={tenant} tenantId={tenantId} onUpdate={onUpdate} showEditButton={false} />
    </div>
  );
}
