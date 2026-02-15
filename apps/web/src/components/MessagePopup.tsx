'use client';

import { MouseEvent } from 'react';

export type MessageType = 'error' | 'success' | 'info';

export default function MessagePopup({
  visible,
  type = 'info',
  title,
  message,
  onClose,
}: {
  visible: boolean;
  type?: MessageType;
  title?: string;
  message: string;
  onClose: () => void;
}) {
  if (!visible) return null;

  const bg = type === 'error' ? 'bg-red-50 dark:bg-red-900/30' : type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white/80 dark:bg-dark-light/80';
  const ring = type === 'error' ? 'ring-red-400' : type === 'success' ? 'ring-green-400' : 'ring-primary-300';

  const icon =
    type === 'error' ? (
      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : (
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );

  const handleBackdrop = (e: MouseEvent) => {
    // clicking backdrop closes popup
    if (e.target === e.currentTarget) onClose();
  };

  return (
    // keep the backdrop (modal feel) but position content at the TOP so it "drops in" like an alert
    <div className="fixed inset-0 z-60 flex items-start justify-center pt-6 px-4" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* popup content appears from top with an attention animation */}
      <div className={`relative z-10 max-w-xl w-full rounded-2xl p-6 ${bg} border border-light-darker dark:border-secondary-700 shadow-2xl ${ring} animate-alertAttention pointer-events-auto`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/40 dark:bg-black/20 flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1">
            {title && <h3 className="text-lg font-bold text-dark dark:text-light mb-1">{title}</h3>}
            <div className="text-sm text-secondary-600 dark:text-secondary-400 whitespace-pre-wrap">{message}</div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white dark:bg-dark text-secondary-700 dark:text-secondary-300 rounded-lg font-semibold hover:shadow transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
