'use client';

import Link from 'next/link';

// SubscriptionStatus: 0=Trial, 1=Active, 2=Suspended, 3=Cancelled, 4=Expired, 5=Pending
export enum SubscriptionStatus {
  Trial = 0,
  Active = 1,
  Suspended = 2,
  Cancelled = 3,
  Expired = 4,
  Pending = 5,
}

export interface SubscriptionBadgeProps {
  planType: number;           // 0=Free, 1=Basic, 2=Professional, 3=Enterprise
  planName?: string;
  subscriptionStatus?: number; // SubscriptionStatus enum value
  isActive?: boolean;          // legacy fallback
  expiresAt?: string;
  hasPendingPayment?: boolean;
}

const planNames: Record<number, string> = {
  0: 'Free',
  1: 'Basic',
  2: 'Professional',
  3: 'Enterprise',
};

const statusConfig: Record<number, { label: string; className: string }> = {
  [SubscriptionStatus.Trial]: {
    label: 'Prueba',
    className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  [SubscriptionStatus.Active]: {
    label: 'Activo',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  },
  [SubscriptionStatus.Suspended]: {
    label: 'Suspendido',
    className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  [SubscriptionStatus.Cancelled]: {
    label: 'Cancelado',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  },
  [SubscriptionStatus.Expired]: {
    label: 'Expirado',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  },
  [SubscriptionStatus.Pending]: {
    label: 'Pendiente',
    className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
};

function getStatusDisplay(props: SubscriptionBadgeProps): { label: string; className: string } {
  // Prefer subscriptionStatus if provided
  if (props.subscriptionStatus !== undefined && props.subscriptionStatus !== null) {
    return statusConfig[props.subscriptionStatus] ?? {
      label: 'Desconocido',
      className: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-700',
    };
  }
  // Legacy fallback: hasPendingPayment / isActive
  if (props.hasPendingPayment) {
    return statusConfig[SubscriptionStatus.Pending];
  }
  if (props.planType === 0) {
    return {
      label: 'Free',
      className: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-700',
    };
  }
  if (props.isActive !== false) {
    return statusConfig[SubscriptionStatus.Active];
  }
  return statusConfig[SubscriptionStatus.Expired];
}

const inactiveStatuses = new Set([
  SubscriptionStatus.Suspended,
  SubscriptionStatus.Cancelled,
  SubscriptionStatus.Expired,
]);

export default function SubscriptionBadge(props: SubscriptionBadgeProps) {
  const status = getStatusDisplay(props);
  const name = props.planName || planNames[props.planType] || 'Desconocido';
  const isInactive = props.subscriptionStatus !== undefined
    ? inactiveStatuses.has(props.subscriptionStatus)
    : props.isActive === false;
  const showRenew = isInactive && props.planType !== 0 && props.subscriptionStatus !== SubscriptionStatus.Pending && !props.hasPendingPayment;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${status.className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Plan:</span>
          <span className="font-bold">{name}</span>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/60 dark:bg-black/20">
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {props.expiresAt && !isInactive && (
          <span className="text-xs opacity-80">
            Expira: {new Date(props.expiresAt).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        )}
        {showRenew && (
          <Link
            href="/upgrade"
            className="px-4 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
          >
            Renovar
          </Link>
        )}
        {props.hasPendingPayment && (
          <Link
            href="/billing/history"
            className="text-xs font-semibold underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Ver estado
          </Link>
        )}
      </div>
    </div>
  );
}
