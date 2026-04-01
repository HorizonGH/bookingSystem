'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { analyticsService, AnalyticsInterval, AnalyticsOverviewResponse, ReservationsAnalyticsResponse, CustomersAnalyticsResponse } from '../services/analytics';
import { planService } from '../services/plan';
import { ApiError } from '../services/api';
import { workerService } from '../services/worker';
import { serviceService } from '../services/service';

interface ProfileAnalyticsWindowProps {
  tenantId: string;
  planType?: number | null;
}

type AccessState = 'loading' | 'enabled' | 'disabled' | 'unknown';

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    startDate: toISODate(start),
    endDate: toISODate(end),
    interval: 'Day' as AnalyticsInterval,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('es-ES').format(value ?? 0);
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function normalizeList<T extends { count?: number; amount?: number }>(items?: T[]): T[] {
  if (!Array.isArray(items)) return [] as T[];
  return items;
}

export default function ProfileAnalyticsWindow({ tenantId, planType }: ProfileAnalyticsWindowProps) {
  const [access, setAccess] = useState<AccessState>('loading');
  const [rangeDraft, setRangeDraft] = useState(defaultRange());
  const [range, setRange] = useState(defaultRange());
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [reservations, setReservations] = useState<ReservationsAnalyticsResponse | null>(null);
  const [customers, setCustomers] = useState<CustomersAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [workerNameById, setWorkerNameById] = useState<Record<string, string>>({});
  const [serviceNameById, setServiceNameById] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    if (planType === null || planType === undefined) {
      setAccess('unknown');
      return;
    }

    setAccess('loading');
    planService.getPlans()
      .then((plans) => {
        const hasAnalytics = plans.some((p) => Number(p.planType ?? 0) === Number(planType) && !!p.hasAnalytics);
        if (mounted) setAccess(hasAnalytics ? 'enabled' : 'disabled');
      })
      .catch(() => {
        if (mounted) setAccess('unknown');
      });

    return () => { mounted = false; };
  }, [planType]);

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      if (!tenantId) return;
      if (access === 'disabled') return;

      setIsLoading(true);
      setError('');

      try {
        const [ov, res, cust] = await Promise.all([
          analyticsService.getOverview(tenantId, range),
          analyticsService.getReservations(tenantId, range),
          analyticsService.getCustomers(tenantId, range),
        ]);

        if (!mounted) return;
        setOverview(ov);
        setReservations(res);
        setCustomers(cust);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiError && err.status === 403) {
          setAccess('disabled');
          setError('Tu plan actual no incluye Analytics.');
        } else if (err instanceof ApiError) {
          setError(err.message || 'Error al cargar Analytics');
        } else {
          setError('Error al cargar Analytics');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchAnalytics();
    return () => { mounted = false; };
  }, [tenantId, range, access]);

  const reservationsByInterval = useMemo(() => normalizeList(overview?.reservationsByInterval), [overview]);
  const revenueByInterval = useMemo(() => normalizeList(overview?.revenueByInterval), [overview]);

  const totalStatusCount = (reservations?.byStatus ?? []).reduce((sum, s) => sum + (s.count ?? 0), 0);
  const statusChartData = (reservations?.byStatus ?? []).map((s) => ({
    status: s.status,
    count: s.count ?? 0,
    share: totalStatusCount ? Math.round(((s.count ?? 0) / totalStatusCount) * 100) : 0,
  }));

  useEffect(() => {
    if (!tenantId) return;
    const selectedWorkerIds = (reservations?.byWorker ?? []).map((x) => x.workerId).filter(Boolean);
    const selectedServiceIds = (reservations?.byService ?? []).map((x) => x.serviceId).filter(Boolean);

    const loadNames = async () => {
      try {
        const [workers, servicesRes] = await Promise.all([
          workerService.getWorkersByTenant(tenantId),
          serviceService.getServicesByTenant(tenantId),
        ]);

        const workerMap: Record<string, string> = {};
        workers.forEach((w) => {
          if (w.id) workerMap[w.id] = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.id;
        });

        const serviceList = servicesRes.services ?? [];
        const serviceMap: Record<string, string> = {};
        serviceList.forEach((s) => {
          if (s.id) serviceMap[s.id] = s.name || s.id;
        });

        setWorkerNameById(workerMap);
        setServiceNameById(serviceMap);
      } catch {
        setWorkerNameById({});
        setServiceNameById({});
      }
    };

    // Only load when at least one worker/service ID is present.
    if (selectedWorkerIds.length || selectedServiceIds.length) {
      loadNames();
    }
  }, [tenantId, reservations]);

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 md:p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-dark dark:text-light">Analytics</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Resumen de rendimiento del negocio</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-secondary-500 block mb-1">Desde</label>
            <input
              type="date"
              value={rangeDraft.startDate}
              onChange={(e) => setRangeDraft((s) => ({ ...s, startDate: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-secondary-500 block mb-1">Hasta</label>
            <input
              type="date"
              value={rangeDraft.endDate}
              onChange={(e) => setRangeDraft((s) => ({ ...s, endDate: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-secondary-500 block mb-1">Intervalo</label>
            <select
              value={rangeDraft.interval}
              onChange={(e) => setRangeDraft((s) => ({ ...s, interval: e.target.value as AnalyticsInterval }))}
              className="px-3 py-2 rounded-lg border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark text-sm"
            >
              <option value="Day">Día</option>
              <option value="Week">Semana</option>
              <option value="Month">Mes</option>
            </select>
          </div>
          <button
            onClick={() => setRange({ ...rangeDraft })}
            className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>

      {access === 'disabled' && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 px-5 py-4">
          <h3 className="font-semibold mb-1">Analytics no disponible</h3>
          <p className="text-sm mb-3">Actualiza tu plan para desbloquear reportes avanzados.</p>
          <a href="/upgrade" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
            Mejorar Plan →
          </a>
        </div>
      )}

      {access !== 'disabled' && (
        <>
          {isLoading && (
            <div className="flex items-center gap-3 text-secondary-500">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Cargando métricas...
            </div>
          )}

          {error && !isLoading && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          {!isLoading && !error && overview && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-light-darker dark:bg-secondary-900/30">
                  <p className="text-xs text-secondary-500 mb-1">Reservas</p>
                  <p className="text-xl font-bold text-dark dark:text-light">{formatCount(overview.totalReservations)}</p>
                </div>
                <div className="p-4 rounded-xl bg-light-darker dark:bg-secondary-900/30">
                  <p className="text-xs text-secondary-500 mb-1">Cancelaciones</p>
                  <p className="text-xl font-bold text-dark dark:text-light">{formatCount(overview.totalCancellations)}</p>
                </div>
                <div className="p-4 rounded-xl bg-light-darker dark:bg-secondary-900/30">
                  <p className="text-xs text-secondary-500 mb-1">Ingresos</p>
                  <p className="text-xl font-bold text-dark dark:text-light">{formatCurrency(overview.totalRevenue)}</p>
                </div>
                <div className="p-4 rounded-xl bg-light-darker dark:bg-secondary-900/30">
                  <p className="text-xs text-secondary-500 mb-1">Trabajadores activos</p>
                  <p className="text-xl font-bold text-dark dark:text-light">{formatCount(overview.activeWorkers)}</p>
                </div>
                <div className="p-4 rounded-xl bg-light-darker dark:bg-secondary-900/30">
                  <p className="text-xs text-secondary-500 mb-1">Usuarios activos</p>
                  <p className="text-xl font-bold text-dark dark:text-light">{formatCount(overview.activeUsers)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-secondary-500">Reservas por intervalo</h3>
                    <span className="text-xs text-secondary-400">Líneas</span>
                  </div>
                  <div className="h-56 rounded-xl border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reservationsByInterval} margin={{ top: 12, right: 16, left: -12, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="periodStart" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => formatCount(Number(value))} />
                        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-secondary-500">Ingresos por intervalo</h3>
                    <span className="text-xs text-secondary-400">Líneas</span>
                  </div>
                  <div className="h-56 rounded-xl border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueByInterval} margin={{ top: 12, right: 16, left: -12, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="periodStart" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-secondary-500">Reservas por estado</h3>
                    <span className="text-xs text-secondary-400">Barras</span>
                  </div>
                  <div className="h-56 rounded-xl border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData} margin={{ top: 12, right: 16, left: -12, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => formatCount(Number(value))} />
                        <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-secondary-500 mb-3">Clientes</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-light-darker dark:bg-secondary-900/30">
                      <p className="text-xs text-secondary-500">Total</p>
                      <p className="text-lg font-bold text-dark dark:text-light">{formatCount(customers?.totalCustomers ?? 0)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-light-darker dark:bg-secondary-900/30">
                      <p className="text-xs text-secondary-500">Nuevos</p>
                      <p className="text-lg font-bold text-dark dark:text-light">{formatCount(customers?.newCustomers ?? 0)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-light-darker dark:bg-secondary-900/30">
                      <p className="text-xs text-secondary-500">Recurrentes</p>
                      <p className="text-lg font-bold text-dark dark:text-light">{formatCount(customers?.returningCustomers ?? 0)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-light-darker dark:bg-secondary-900/30">
                      <p className="text-xs text-secondary-500">Ingreso total</p>
                      <p className="text-lg font-bold text-dark dark:text-light">{formatCurrency(customers?.lifetimeRevenue ?? 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {(reservations?.byWorker?.length || reservations?.byService?.length || reservations?.byDay?.length) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="rounded-xl border border-light-darker dark:border-secondary-700 overflow-hidden">
                    <div className="bg-light-darker dark:bg-secondary-900/30 px-4 py-2 text-xs font-semibold text-secondary-500">
                      Reservas por trabajador
                    </div>
                    <div className="divide-y divide-light-darker dark:divide-secondary-700">
                      {(reservations?.byWorker ?? []).map((w) => (
                        <div key={`worker-${w.workerId}`} className="px-4 py-2 flex items-center justify-between text-sm">
                          <span className="text-secondary-600 dark:text-secondary-400">{workerNameById[w.workerId] ?? w.workerId}</span>
                          <span className="font-semibold text-dark dark:text-light">{formatCount(w.count)}</span>
                        </div>
                      ))}
                      {(reservations?.byWorker ?? []).length === 0 && (
                        <div className="px-4 py-3 text-sm text-secondary-500">Sin datos.</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-light-darker dark:border-secondary-700 overflow-hidden">
                    <div className="bg-light-darker dark:bg-secondary-900/30 px-4 py-2 text-xs font-semibold text-secondary-500">
                      Reservas por servicio
                    </div>
                    <div className="divide-y divide-light-darker dark:divide-secondary-700">
                      {(reservations?.byService ?? []).map((s) => (
                        <div key={`service-${s.serviceId}`} className="px-4 py-2 flex items-center justify-between text-sm">
                          <span className="text-secondary-600 dark:text-secondary-400">{serviceNameById[s.serviceId] ?? s.serviceId}</span>
                          <span className="font-semibold text-dark dark:text-light">{formatCount(s.count)}</span>
                        </div>
                      ))}
                      {(reservations?.byService ?? []).length === 0 && (
                        <div className="px-4 py-3 text-sm text-secondary-500">Sin datos.</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-light-darker dark:border-secondary-700 overflow-hidden">
                    <div className="bg-light-darker dark:bg-secondary-900/30 px-4 py-2 text-xs font-semibold text-secondary-500">
                      Reservas por día
                    </div>
                    <div className="divide-y divide-light-darker dark:divide-secondary-700">
                      {(reservations?.byDay ?? []).map((d) => (
                        <div key={`day-${d.day}`} className="px-4 py-2 flex items-center justify-between text-sm">
                          <span className="text-secondary-600 dark:text-secondary-400">{d.day}</span>
                          <span className="font-semibold text-dark dark:text-light">{formatCount(d.count)}</span>
                        </div>
                      ))}
                      {(reservations?.byDay ?? []).length === 0 && (
                        <div className="px-4 py-3 text-sm text-secondary-500">Sin datos.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
