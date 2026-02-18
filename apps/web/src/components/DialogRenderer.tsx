'use client';

import { useEffect, useState } from 'react';
import MessagePopup from './MessagePopup';
import { subscribe, resolveCurrent, attachToWindow } from '../lib/dialog';

function ConfirmModal({ title, message, onConfirm, onCancel }: { title?: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 max-w-lg w-full rounded-2xl p-6 bg-white dark:bg-dark-light border border-light-darker dark:border-secondary-700 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/40 dark:bg-black/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div className="flex-1">
            {title && <h3 className="text-lg font-bold text-dark dark:text-light mb-1">{title}</h3>}
            <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">{message}</div>
            <div className="flex justify-end gap-3">
              <button onClick={onCancel} className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg">Cancelar</button>
              <button onClick={onConfirm} className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-lg font-semibold">Confirmar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromptModal({ title, message, defaultValue, onConfirm, onCancel }: { title?: string; message: string; defaultValue?: string; onConfirm: (value: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(defaultValue ?? '');
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 max-w-lg w-full rounded-2xl p-6 bg-white dark:bg-dark-light border border-light-darker dark:border-secondary-700 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/40 dark:bg-black/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3m-6 0c0 1.657-1.343 3-3 3s-3-1.343-3-3"/></svg>
          </div>
          <div className="flex-1">
            {title && <h3 className="text-lg font-bold text-dark dark:text-light mb-1">{title}</h3>}
            <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">{message}</div>
            <input value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-light-darker dark:border-secondary-700 bg-light dark:bg-dark text-dark dark:text-light mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={onCancel} className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg">Cancelar</button>
              <button onClick={() => onConfirm(value)} className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-lg font-semibold">Aceptar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DialogRenderer() {
  const [current, setCurrent] = useState<any | null>(null);

  useEffect(() => {
    attachToWindow();
    const unsub = subscribe((req) => setCurrent(req));
    return () => { unsub(); };
  }, []);

  if (!current) return null;

  if (current.type === 'alert') {
    return (
      <MessagePopup
        visible={true}
        type="info"
        title={current.title}
        message={current.message}
        onClose={() => resolveCurrent(undefined)}
      />
    );
  }

  if (current.type === 'confirm') {
    return (
      <ConfirmModal
        title={current.title}
        message={current.message}
        onConfirm={() => resolveCurrent(true)}
        onCancel={() => resolveCurrent(false)}
      />
    );
  }

  if (current.type === 'prompt') {
    return (
      <PromptModal
        title={current.title}
        message={current.message}
        defaultValue={current.defaultValue}
        onConfirm={(v) => resolveCurrent(v)}
        onCancel={() => resolveCurrent(null)}
      />
    );
  }

  return null;
}
