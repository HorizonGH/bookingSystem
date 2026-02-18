'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  scheduleService,
  WorkerScheduleDto,
  DayOfWeek,
  CreateWorkerScheduleRequest,
  setupStandardWorkWeek,
  getDayOfWeekName,
  formatTimeToDisplay,
  formatDateToYYYYMMDD,
} from '../services/schedule';
import MessagePopup from './MessagePopup';
import { ApiError } from '../services/api';

interface WorkerScheduleManagementProps {
  tenantId: string;
  workerId: string;
  workerName?: string;
}

export default function WorkerScheduleManagement({
  tenantId,
  workerId,
  workerName,
}: WorkerScheduleManagementProps) {
  const [schedules, setSchedules] = useState<WorkerScheduleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkerScheduleDto | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [popup, setPopup] = useState<{
    type: 'error' | 'success' | 'info';
    message: string;
    title?: string;
  } | null>(null);

  const [formData, setFormData] = useState<CreateWorkerScheduleRequest>({
    dayOfWeek: DayOfWeek.Monday,
    startTime: '09:00:00',
    endTime: '17:00:00',
    isAvailable: true,
    specificDate: null,
  });

  const [viewMode, setViewMode] = useState<'recurring' | 'overrides'>('recurring');

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await scheduleService.getWorkerSchedules(tenantId, workerId);
      setSchedules(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: err.message, title: 'Error al cargar horarios' });
      } else {
        setPopup({ type: 'error', message: 'Error al cargar los horarios del trabajador' });
      }
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, workerId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSetupStandardWeek = async () => {
    if (!confirm('¿Crear horario estándar de Lunes-Viernes 9:00-17:00?')) return;

    try {
      setModalLoading(true);
      await setupStandardWorkWeek(tenantId, workerId);
      await fetchSchedules();
      setPopup({ type: 'success', message: 'Horario estándar creado exitosamente' });
    } catch (err) {
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: err.message, title: 'Error' });
      } else {
        setPopup({ type: 'error', message: 'Error al crear horario estándar' });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      dayOfWeek: DayOfWeek.Monday,
      startTime: '09:00:00',
      endTime: '17:00:00',
      isAvailable: true,
      specificDate: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (schedule: WorkerScheduleDto) => {
    setEditingSchedule(schedule);
    setFormData({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isAvailable: schedule.isAvailable,
      specificDate: schedule.specificDate,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setModalLoading(true);

      if (editingSchedule) {
        await scheduleService.updateSchedule(tenantId, workerId, editingSchedule.id, formData);
        setPopup({ type: 'success', message: 'Horario actualizado exitosamente' });
      } else {
        await scheduleService.createSchedule(tenantId, workerId, formData);
        setPopup({ type: 'success', message: 'Horario creado exitosamente' });
      }

      await fetchSchedules();
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: err.message, title: 'Error' });
      } else {
        setPopup({
          type: 'error',
          message: editingSchedule ? 'Error al actualizar horario' : 'Error al crear horario',
        });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return;

    try {
      await scheduleService.deleteSchedule(tenantId, workerId, scheduleId);
      await fetchSchedules();
      setPopup({ type: 'success', message: 'Horario eliminado exitosamente' });
    } catch (err) {
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: err.message, title: 'Error' });
      } else {
        setPopup({ type: 'error', message: 'Error al eliminar horario' });
      }
    }
  };

  const recurringSchedules = schedules.filter((s) => !s.specificDate);
  const overrideSchedules = schedules.filter((s) => s.specificDate);

  const displaySchedules = viewMode === 'recurring' ? recurringSchedules : overrideSchedules;

  return (
    <div className="space-y-6">
      {popup && (
        <MessagePopup
          visible={!!popup}
          type={popup.type}
          message={popup.message}
          title={popup.title}
          onClose={() => setPopup(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-dark dark:text-light">
            Horarios {workerName ? `de ${workerName}` : ''}
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
            Gestiona la disponibilidad del trabajador
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSetupStandardWeek}
            disabled={modalLoading}
            className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors disabled:opacity-50"
          >
            Horario Estándar
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            + Agregar Horario
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-secondary-200 dark:border-secondary-700">
        <button
          onClick={() => setViewMode('recurring')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'recurring'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-500'
          }`}
        >
          Horarios Recurrentes ({recurringSchedules.length})
        </button>
        <button
          onClick={() => setViewMode('overrides')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'overrides'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-500'
          }`}
        >
          Excepciones ({overrideSchedules.length})
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400">Cargando horarios...</p>
        </div>
      ) : displaySchedules.length === 0 ? (
        <div className="text-center py-12 bg-light-darker dark:bg-dark-light rounded-xl">
          <p className="text-secondary-600 dark:text-secondary-400">
            {viewMode === 'recurring'
              ? 'No hay horarios recurrentes configurados'
              : 'No hay excepciones de horario configuradas'}
          </p>
          <button
            onClick={viewMode === 'recurring' ? handleSetupStandardWeek : openAddModal}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            {viewMode === 'recurring' ? 'Crear Horario Estándar' : 'Agregar Excepción'}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {displaySchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-4 bg-white dark:bg-dark-light rounded-xl border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-dark dark:text-light">
                      {schedule.specificDate
                        ? new Date(schedule.specificDate).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : getDayOfWeekName(schedule.dayOfWeek)}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        schedule.isAvailable
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {schedule.isAvailable ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                    {formatTimeToDisplay(schedule.startTime)} -{' '}
                    {formatTimeToDisplay(schedule.endTime)}
                  </p>
                  {schedule.specificDate && (
                    <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                      Excepción específica
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(schedule)}
                    className="px-4 py-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-dark dark:text-light mb-6">
              {editingSchedule ? 'Editar Horario' : 'Agregar Horario'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Tipo de Horario
                </label>
                <select
                  value={formData.specificDate ? 'override' : 'recurring'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specificDate: e.target.value === 'override' ? formatDateToYYYYMMDD(new Date()) : null,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recurring">Recurrente (semanal)</option>
                  <option value="override">Excepción (fecha específica)</option>
                </select>
              </div>

              {formData.specificDate ? (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Fecha Específica
                  </label>
                  <input
                    type="date"
                    value={formData.specificDate}
                    onChange={(e) => setFormData({ ...formData, specificDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Día de la Semana
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) =>
                      setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) as DayOfWeek })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={DayOfWeek.Sunday}>Domingo</option>
                    <option value={DayOfWeek.Monday}>Lunes</option>
                    <option value={DayOfWeek.Tuesday}>Martes</option>
                    <option value={DayOfWeek.Wednesday}>Miércoles</option>
                    <option value={DayOfWeek.Thursday}>Jueves</option>
                    <option value={DayOfWeek.Friday}>Viernes</option>
                    <option value={DayOfWeek.Saturday}>Sábado</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.startTime.substring(0, 5)}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value + ':00' })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime.substring(0, 5)}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value + ':00' })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-5 h-5 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                />
                <label
                  htmlFor="isAvailable"
                  className="text-sm font-medium text-secondary-700 dark:text-secondary-300"
                >
                  Disponible para reservas
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {modalLoading ? 'Guardando...' : editingSchedule ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
