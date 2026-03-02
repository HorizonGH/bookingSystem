'use client';

import { useEffect, useState, useRef } from 'react';
import { PaymentSession, PaymentMethodStr } from '../../services/payment';

interface PaymentInstructionsStepProps {
  session: PaymentSession;
  recipientInfo: string;
  instructions: string;
  paymentMethod: PaymentMethodStr;
  onContinue: () => void;
  onExpired: () => void;
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function PaymentInstructionsStep({
  session,
  recipientInfo,
  instructions,
  paymentMethod,
  onContinue,
  onExpired,
}: PaymentInstructionsStepProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const expiresAt = new Date(session.expiresAt).getTime();
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onExpired]);

  const isZelle = paymentMethod === 'Zelle';
  const isExpired = secondsLeft <= 0;
  const isUrgent = secondsLeft <= 300; // < 5 min

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">
          Instrucciones de pago
        </h2>
        <div
          className={`px-3 py-1.5 rounded-full text-sm font-bold ${
            isExpired
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : isUrgent
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 animate-pulse'
              : 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
          }`}
        >
          ⏱ {formatCountdown(secondsLeft)}
        </div>
      </div>

      {/* Instructions Card */}
      <div className="space-y-4 mb-8">
        {/* Mock account/email info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-secondary-700 dark:text-secondary-300">
            Para realizar la transferencia utiliza esta cuenta de prueba:
          </p>
          <p className="mt-1 font-mono font-semibold">
            {isZelle ? 'zelle-demo@example.com (Zelle)' : '0001-2345-6789-000 (Transfermóvil)'}
          </p>
        </div>

      {/* Amount */}
        <div className="flex items-center justify-between p-4 bg-light-darker/50 dark:bg-dark/50 rounded-xl">
          <span className="text-secondary-600 dark:text-secondary-400 font-medium">Monto</span>
          <span className="text-xl font-bold text-dark dark:text-light">
            {session.expectedAmount.toFixed(2)} {session.currency}
          </span>
        </div>

        {/* Recipient Info */}
        <div className="flex items-center justify-between p-4 bg-light-darker/50 dark:bg-dark/50 rounded-xl">
          <span className="text-secondary-600 dark:text-secondary-400 font-medium">Destinatario</span>
          <span className="font-semibold text-dark dark:text-light">{recipientInfo}</span>
        </div>

        {/* Reference Code (Zelle only) */}
        {isZelle && session.referenceCode && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-primary-700 dark:text-primary-300 font-medium">Código de referencia</span>
              <span className="font-mono text-lg font-bold text-primary-700 dark:text-primary-300">
                {session.referenceCode}
              </span>
            </div>
            <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
              Incluye este código en la nota/memo de tu transferencia Zelle.
            </p>
          </div>
        )}

        {/* General Instructions */}
        {instructions && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed whitespace-pre-line">
              {instructions}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onContinue}
        disabled={isExpired}
        className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Ya realicé el pago — Subir comprobante
      </button>
    </div>
  );
}
