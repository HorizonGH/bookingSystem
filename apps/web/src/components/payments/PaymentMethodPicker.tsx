'use client';

import { PaymentMethodStr } from '../../services/payment';

interface PaymentMethodPickerProps {
  planName: string;
  onSelect: (method: PaymentMethodStr) => void;
  isLoading?: boolean;
}

export default function PaymentMethodPicker({
  planName,
  onSelect,
  isLoading = false,
}: PaymentMethodPickerProps) {
  return (
    <div className="p-6 sm:p-8 text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-light mb-3">
        Método de pago para {planName}
      </h2>
      <p className="text-secondary-600 dark:text-secondary-400 mb-6">
        Selecciona la forma en la que tienes intención de pagar.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
        <button
          disabled={isLoading}
          onClick={() => onSelect('Transfermovil')}
          className="py-4 px-6 bg-white dark:bg-dark-light rounded-xl border border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors shadow-sm disabled:opacity-50"
        >
          Transfermóvil (CUP)
        </button>
        <button
          disabled={isLoading}
          onClick={() => onSelect('Zelle')}
          className="py-4 px-6 bg-white dark:bg-dark-light rounded-xl border border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors shadow-sm disabled:opacity-50"
        >
          Zelle (USD)
        </button>
      </div>
    </div>
  );
}