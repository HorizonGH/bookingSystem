'use client';

import { useState, useEffect } from 'react';
import { TenantImageDto, tenantService } from '../services/tenant';
import { ApiError } from '../services/api';
import { PlanType } from '../services/auth';
import MessagePopup from './MessagePopup';

interface TenantImageManagerProps {
  tenantId: string;
  planType: number;
}

export default function TenantImageManager({ tenantId, planType }: TenantImageManagerProps) {
  const [images, setImages] = useState<TenantImageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [popup, setPopup] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number | ''>('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const loadImages = async () => {
    setIsLoading(true);
    setError('');
    try {
      const imgs = await tenantService.getTenantImages(tenantId);
      setImages(imgs);
      setLimitReached(false);
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) setError(err.message);
      else setError('Error al cargar las imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const resetForm = () => {
    setFile(null);
    setAltText('');
    setDisplayOrder('');
    setIsPrimary(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setPopup({ type: 'error', message: 'Selecciona un archivo primero.' });
      return;
    }

    setUploading(true);
    setError('');
    try {
      const result = await tenantService.uploadTenantImage(
        tenantId,
        file,
        altText || undefined,
        displayOrder === '' ? undefined : Number(displayOrder),
        isPrimary
      );
      setImages((prev) => [...prev, result]);
      resetForm();
      setPopup({ type: 'success', message: 'Imagen subida correctamente.' });
      setLimitReached(false);
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: `Error: ${err.message}` });
        if (err.status === 400 && err.message.toLowerCase().includes('limit')) {
          setLimitReached(true);
        }
      } else {
        setPopup({ type: 'error', message: 'Error al subir la imagen.' });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    const { confirmDialog } = await import('../lib/dialog');
    const ok = await confirmDialog('¿Eliminar esta imagen?');
    if (!ok) return;

    try {
      await tenantService.deleteTenantImage(tenantId, imageId);
      setImages((imgs) => imgs.filter((i) => i.id !== imageId));
      setPopup({ type: 'success', message: 'Imagen eliminada correctamente.' });
      setLimitReached(false);
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        setPopup({ type: 'error', message: err.message });
      } else {
        setPopup({ type: 'error', message: 'Error al eliminar la imagen.' });
      }
    }
  };


  const getPlanName = (pt: number): string => {
    switch (pt) {
      case PlanType.Free:
        return 'Gratis';
      case PlanType.Basic:
        return 'Básico';
      case PlanType.Professional:
        return 'Profesional';
      case PlanType.Enterprise:
        return 'Empresa';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 md:p-8 border border-light-darker dark:border-secondary-700 backdrop-blur-sm">
      {/* header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-dark dark:text-light flex items-center gap-2">
            <span className="w-2 h-8 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500" />
            Imágenes
          </h2>
          <p className="text-sm text-secondary-500 mt-1">
            Plan actual: {getPlanName(planType)}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-8">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {images.length > 0 ? (
              images.map((img) => (
                <div
                  key={img.id}
                  className="relative group overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow"
                >
                  <img
                    src={img.url}
                    alt={img.altText || ''}
                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {img.isPrimary && (
                    <div className="absolute top-0 left-0 bg-primary-500 text-white text-xs px-2 py-1 rounded-br-lg">
                      Primaria
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      title="Eliminar imagen"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-secondary-500">
                <svg className="h-16 w-16 mb-2 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a5 5 0 005 5h8a5 5 0 005-5V7M16 3h-1.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293H10a1 1 0 00-1 1v1m0 4h4" />
                </svg>
                No hay imágenes cargadas.
              </div>
            )}
          </div>

          {/* upload form */}
          {!limitReached && (
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Archivo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setFile(e.target.files ? e.target.files[0] : null);
                  }}
                  required
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4 file:rounded-full
                    file:border-0 file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Texto alternativo
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Orden de visualización (opcional)
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light text-dark dark:text-light"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm">Marcar como primaria</span>
                </label>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Subiendo...' : 'Subir imagen'}
                </button>
              </div>
            </form>
          )}
          {limitReached && (
            <p className="text-sm text-secondary-500">
              Has alcanzado el límite de imágenes para tu plan.
            </p>
          )}
        </>
      )}

      <MessagePopup
        visible={popup !== null}
        type={popup?.type}
        message={popup?.message || ''}
        onClose={() => setPopup(null)}
      />
    </div>
  );
}
