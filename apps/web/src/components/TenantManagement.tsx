'use client';

import { useState } from 'react';
import { authService, Tenant, PlanType } from '../services/auth';
import { ApiError } from '../services/api';
import MessagePopup from './MessagePopup';

interface TenantManagementProps {
  tenant: Tenant;
  tenantId: string;
  onUpdate: (updatedTenant: Tenant) => void;
  /**
   * When false, hide the inline "Editar" button and editing controls. Useful
   * when TenantManagement is rendered inside another page that provides a
   * dedicated settings flow (e.g. Profile -> Tenant window).
   */
  showEditButton?: boolean;
}

export default function TenantManagement({ tenant, tenantId, onUpdate, showEditButton = true }: TenantManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: tenant.name,
    description: tenant.description,
    address: tenant.address,
    city: tenant.city,
    country: tenant.country,
    planType: tenant.planType,
    isActive: tenant.isActive
  });

  const [popup, setPopup] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedTenant = await authService.updateTenant(tenantId, formData);
      onUpdate(updatedTenant);
      setIsEditing(false);
      setPopup({ type: 'success', message: 'Negocio actualizado exitosamente' });
    } catch (err) {
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: `Error: ${err.message}` });
      } else {
        setPopup({ type: 'error', message: 'Error al actualizar el negocio' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanTypeName = (planType: number): string => {
    switch (planType) {
      case PlanType.Free: return 'Gratis';
      case PlanType.Basic: return 'Básico';
      case PlanType.Professional: return 'Profesional';
      case PlanType.Enterprise: return 'Empresa';
      default: return 'Desconocido';
    }
  };

  const resetForm = () => {
    setFormData({
      name: tenant.name,
      description: tenant.description,
      address: tenant.address,
      city: tenant.city,
      country: tenant.country,
      planType: tenant.planType,
      isActive: tenant.isActive
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 md:p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-dark dark:text-light flex items-center gap-2">
          <span className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500"></span>
          Mi Negocio
        </h2>
        {!isEditing && showEditButton && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-sm font-medium"
          >
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                Plan
              </label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({...formData, planType: parseInt(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
              >
                <option value={PlanType.Free}>Gratis</option>
                <option value={PlanType.Basic}>Básico</option>
                <option value={PlanType.Professional}>Profesional</option>
                <option value={PlanType.Enterprise}>Empresa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                País
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light focus:border-primary-500 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Negocio Activo</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-light-darker dark:bg-secondary-900/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 mb-1">NOMBRE</p>
              <p className="text-lg font-bold text-dark dark:text-light">{tenant.name}</p>
            </div>
            <div className="bg-light-darker dark:bg-secondary-900/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 mb-1">PLAN</p>
              <p className="text-lg font-bold text-dark dark:text-light">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  tenant.planType === PlanType.Free ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                  tenant.planType === PlanType.Basic ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                  tenant.planType === PlanType.Professional ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                  {getPlanTypeName(tenant.planType)}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-light-darker dark:bg-secondary-900/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 mb-2">DESCRIPCIÓN</p>
            <p className="text-sm text-secondary-700 dark:text-secondary-300">{tenant.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-light-darker dark:bg-secondary-900/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 mb-1">DIRECCIÓN</p>
              <p className="text-sm font-medium text-dark dark:text-light">{tenant.address}</p>
            </div>
            <div className="bg-light-darker dark:bg-secondary-900/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 mb-1">CIUDAD</p>
              <p className="text-sm font-medium text-dark dark:text-light">{tenant.city}</p>
            </div>
            <div className="bg-light-darker dark:bg-secondary-900/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 mb-1">PAÍS</p>
              <p className="text-sm font-medium text-dark dark:text-light">{tenant.country}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-light-darker dark:bg-secondary-900/30 rounded-xl p-4">
            <div className={`w-3 h-3 rounded-full ${tenant.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm font-semibold text-dark dark:text-light">
              Estado: {tenant.isActive ? 'Activo' : 'Inactivo'}
            </p>
          </div>

          <div className="text-xs text-secondary-500 dark:text-secondary-400 pt-4 border-t border-light-darker dark:border-secondary-800">
            <p>Creado: {new Date(tenant.created).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            {tenant.lastModified && (
              <p>Última modificación: {new Date(tenant.lastModified).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </div>
        </div>
      )}

      {/* Message popup */}
      {popup && (
        <MessagePopup
          visible={!!popup}
          type={popup.type}
          title={popup.type === 'error' ? 'Error' : popup.type === 'success' ? 'Éxito' : undefined}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
