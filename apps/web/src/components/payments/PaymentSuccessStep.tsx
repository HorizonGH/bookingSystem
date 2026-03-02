'use client';

import Link from 'next/link';
import { Payment } from '../../services/payment';

interface PaymentSuccessStepProps {
  payment: Payment;
  onNewPayment: () => void;
}

export default function PaymentSuccessStep({ payment, onNewPayment }: PaymentSuccessStepProps) {
  return (
    <div className="p-6 sm:p-8 text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-dark dark:text-light mb-3">
        ¡Comprobante enviado!
      </h2>
      <p className="text-secondary-600 dark:text-secondary-400 mb-2 max-w-md mx-auto">
        Tu comprobante de pago ha sido recibido y está en revisión.
      </p>
      <p className="text-secondary-500 dark:text-secondary-400 text-sm mb-8">
        Normalmente la revisión toma <span className="font-semibold text-dark dark:text-light">menos de 24 horas</span>. 
        Te notificaremos cuando tu suscripción esté activa.
      </p>

      {/* Payment Summary */}
      <div className="bg-light-darker/30 dark:bg-dark/50 rounded-xl p-4 mb-8 max-w-sm mx-auto text-left">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-secondary-500">Monto</span>
          <span className="font-semibold text-dark dark:text-light">
            {payment.amount.toFixed(2)} {payment.currency}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-secondary-500">Remitente</span>
          <span className="font-semibold text-dark dark:text-light">{payment.senderName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary-500">Estado</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
            {payment.status === 'Pending' ? 'En revisión' : payment.status}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/billing/history"
          className="px-6 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
        >
          Ver historial de pagos
        </Link>
        <Link
          href="/profile"
          className="px-6 py-3 border border-light-darker dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 font-semibold rounded-xl hover:bg-light-darker dark:hover:bg-dark transition-colors"
        >
          Volver al perfil
        </Link>
      </div>
    </div>
  );
}
