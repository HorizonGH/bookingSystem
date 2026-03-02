'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import {
  PaymentSession,
  PaymentMethodStr,
  Payment,
  paymentService,
} from '../../services/payment';
import { ApiError } from '../../services/api';

interface UploadProofStepProps {
  session: PaymentSession;
  tenantId: string;
  paymentMethod: PaymentMethodStr;
  onSuccess: (payment: Payment) => void;
  onBack: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function UploadProofStep({ session, tenantId, paymentMethod, onSuccess, onBack }: UploadProofStepProps) {
  // log session object for debugging field names
  useEffect(() => {
    console.log('[UploadProof] initial session object:', session);
    console.log('[UploadProof] session keys:', Object.keys(session));
  }, [session]);

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [transferTime, setTransferTime] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isZelle = paymentMethod === 'Zelle';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo no puede superar los 5 MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    setError('');
    setScreenshot(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setScreenshot(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isFormValid =
    screenshot !== null &&
    senderName.trim() !== '' &&
    transferTime !== '' &&
    (isZelle ? true : transactionNumber.trim() !== '');

  function extractGuid(obj: any): string {
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!obj || typeof obj !== 'object') return '';
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string' && guidRegex.test(val)) return val;
    }
    return '';
  }

  const handleSubmit = async () => {
    if (!isFormValid || !screenshot) return;

    setIsLoading(true);
    setError('');

    try {
      // Convert local datetime-local value to ISO 8601
      const isoTime = new Date(transferTime).toISOString();
      console.log('[UploadProof] Submitting:', {
        tenantId, sessionId: session.id, senderName, isoTime,
        transactionNumber: transactionNumber || undefined,
        confirmationNumber: confirmationNumber || undefined,
        screenshotName: screenshot?.name,
      });
      let derivedSessionId =
        session.id ||
        (session as any).Id ||
        (session as any).sessionId ||
        (session as any).SessionId ||
        (session as any).paymentSessionId ||
        (session as any).PaymentSessionId ||
        '';
      if (!derivedSessionId) {
        derivedSessionId = extractGuid(session) || '';
      }
      console.log('[UploadProof] derivedSessionId:', derivedSessionId, 'session keys', Object.keys(session));
      const payment = await paymentService.uploadPaymentProof({
        tenantId,
        sessionId: derivedSessionId,
        screenshot,
        senderName: senderName.trim(),
        transferTime: isoTime,
        transactionNumber: transactionNumber.trim() || undefined,
        confirmationNumber: confirmationNumber.trim() || undefined,
      });
      onSuccess(payment);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('[UploadProof] API Error:', { message: err.message, status: err.status, data: err.data });
        setError(err.message || 'Error al subir el comprobante');
      } else {
        console.error('[UploadProof] Unknown error:', err);
        setError('Error de red. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-light mb-2">
        Subir comprobante de pago
      </h2>
      <p className="text-secondary-600 dark:text-secondary-400 mb-6">
        Completa los datos de tu transferencia y sube una captura de pantalla.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Screenshot Upload */}
        <div>
          <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
            Captura de pantalla del pago *
          </label>
          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Vista previa"
                className="max-h-48 rounded-xl border border-light-darker dark:border-secondary-700 shadow-sm"
              />
              <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors shadow-md"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-light-darker dark:border-secondary-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center"
            >
              <svg className="w-10 h-10 mx-auto mb-2 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Haz clic para seleccionar una imagen
              </p>
              <p className="text-xs text-secondary-400 mt-1">Máximo 5 MB</p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Sender Name */}
        <div>
          <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
            Nombre completo del remitente *
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Nombre como aparece en la transferencia"
            className="w-full px-4 py-3 rounded-xl border border-light-darker dark:border-secondary-600 bg-white dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Confirmation Number (Zelle — optional) */}
        {isZelle ? (
          <div>
            <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
              Número de confirmación (Zelle) — opcional
            </label>
            <input
              type="text"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              placeholder="Ej: Z1234567890"
              className="w-full px-4 py-3 rounded-xl border border-light-darker dark:border-secondary-600 bg-white dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
              Número de transacción (Transfermóvil) *
            </label>
            <input
              type="text"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
              placeholder="Ej: TM20260226123456"
              className="w-full px-4 py-3 rounded-xl border border-light-darker dark:border-secondary-600 bg-white dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        )}

        {/* Transfer Time */}
        <div>
          <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
            Fecha y hora de la transferencia *
          </label>
          <input
            type="datetime-local"
            value={transferTime}
            onChange={(e) => setTransferTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-light-darker dark:border-secondary-600 bg-white dark:bg-dark text-dark dark:text-light focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-3 rounded-xl border border-light-darker dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 font-semibold hover:bg-light-darker dark:hover:bg-dark transition-colors disabled:opacity-50"
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isLoading ? 'Enviando...' : 'Enviar comprobante'}
        </button>
      </div>
    </div>
  );
}
