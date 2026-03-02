'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '../../services/api';
import {
  PaymentMethodStr,
  PaymentSession,
  CreateSessionResponse,
  Payment,
  currencyForMethod,
  paymentMethodLabel,
  paymentService,
  normalizeSession,
} from '../../services/payment';
import { alertDialog } from '../../lib/dialog';
import PaymentMethodPicker from './PaymentMethodPicker';
import PaymentInstructionsStep from './PaymentInstructionsStep';
import UploadProofStep from './UploadProofStep';
import PaymentSuccessStep from './PaymentSuccessStep';

type Step = 'loading' | 'active-session' | 'picker' | 'instructions' | 'upload' | 'success';

interface PlanSelectWizardProps {
  tenantId: string;
  planId: string;
  planName: string;
}

const STATUS_LABELS: Record<string, string> = {
  Active: 'Activa',
  Completed: 'Completada',
  Expired: 'Expirada',
};

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function PlanSelectWizard({
  tenantId,
  planId,
  planName,
}: PlanSelectWizardProps) {
  const [step, setStep] = useState<Step>('loading');
  const [activeSession, setActiveSession] = useState<PaymentSession | null>(null);
  const [sessionResponse, setSessionResponse] = useState<CreateSessionResponse | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Determine the session being used in the upload step
  const workingSession: PaymentSession | null =
    sessionResponse?.session ?? activeSession ?? null;

  // debug: log when upload step begins or the session changes
  useEffect(() => {
    if (step === 'upload') {
      console.log('[Payment] entering upload step; workingSession:', workingSession);
    }
  }, [step, workingSession]);

  // On mount — check if there is already an active payment session
  useEffect(() => {
    paymentService
      .getActiveSession(tenantId)
      .then((raw) => {
        if (raw) {
          setActiveSession(normalizeSession(raw));
          setStep('active-session');
        } else {
          setStep('picker');
        }
      })
      .catch((err) => {
        console.error('[Payment] Error loading active session:', err);
        setStep('picker');
      });
  }, [tenantId]);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                            */
  /* ------------------------------------------------------------------ */

  const handleSelectMethod = async (method: PaymentMethodStr) => {
    setIsCreating(true);
    const payload = { planId, currency: currencyForMethod(method), paymentMethod: method };
    console.log('[Payment] Creating session with:', payload);
    try {
      const resp = await paymentService.createPaymentSession(tenantId, payload);
      console.log('[Payment] Raw session response:', resp);

      const r = resp as any;
      const rawSession = r.session && typeof r.session === 'object' ? r.session : r;
      const session = normalizeSession(rawSession);
      if (!session.id) {
        console.warn('[Payment] normalized session has no id, rawSession was:', rawSession);
      }
      const recipientInfo: string = r.recipientInfo ?? rawSession.recipientInfo ?? '';
      const instructions: string  = r.instructions  ?? rawSession.instructions  ?? '';

      const normalized: CreateSessionResponse = { session, recipientInfo, instructions };
      console.log('[Payment] Session response (normalized):', normalized);
      setSessionResponse(normalized);
      setStep('instructions');
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('[Payment] API Error:', { message: err.message, status: err.status, data: err.data });
        await alertDialog(
          `Error: ${err.message}\nStatus: ${err.status}\n${err.data ? JSON.stringify(err.data) : ''}`,
          'Error',
        );
      } else {
        console.error('[Payment] Unknown error:', err);
        await alertDialog('Error creando sesión de pago', 'Error');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelActiveSession = async () => {
    if (!activeSession) return;
    const ok = window.confirm('¿Cancelar la sesión de pago activa? Esta acción no se puede deshacer.');
    if (!ok) return;
    setIsCancelling(true);
    try {
      await paymentService.cancelSession(tenantId, activeSession.id);
      setActiveSession(null);
      setStep('picker');
    } catch (err) {
      if (err instanceof ApiError) await alertDialog(err.message, 'Error');
      else await alertDialog('Error cancelando la sesión', 'Error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReset = () => {
    setSessionResponse(null);
    setActiveSession(null);
    setPayment(null);
    setStep('picker');
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                              */
  /* ------------------------------------------------------------------ */

  // Loading
  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  // There is already an active payment session
  if (step === 'active-session' && activeSession) {
    const statusLabel = STATUS_LABELS[activeSession.status] ?? activeSession.status;
    const statusColor = STATUS_COLORS[activeSession.status] ?? '';
    const expiresAt = new Date(activeSession.expiresAt).toLocaleString();

    return (
      <div className="p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-light mb-1">
          Sesión de pago existente
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6 text-sm">
          Ya tienes una sesión de pago en curso. Puedes continuar con ella o cancelarla.
        </p>

        <div className="rounded-xl border border-light-darker dark:border-secondary-700 bg-white dark:bg-dark-light divide-y divide-light-darker dark:divide-secondary-700">
          {/* Status row */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Estado</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          {/* Method row */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Método</span>
            <span className="text-sm font-semibold text-dark dark:text-light">
              {paymentMethodLabel(activeSession.paymentMethod)}
            </span>
          </div>

          {/* Amount row */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Monto</span>
            <span className="text-sm font-semibold text-dark dark:text-light">
              {activeSession.expectedAmount} {activeSession.currency}
            </span>
          </div>

          {/* Reference row */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Referencia</span>
            <span className="text-sm font-mono text-dark dark:text-light">{activeSession.referenceCode}</span>
          </div>

          {/* Expires row */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Expira</span>
            <span className="text-sm text-dark dark:text-light">{expiresAt}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {activeSession.status === 'Active' && (
            <button
              onClick={() => setStep('upload')}
              className="flex-1 py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
            >
              Continuar con esta sesión
            </button>
          )}
          <button
            disabled={isCancelling}
            onClick={handleCancelActiveSession}
            className="flex-1 py-3 px-6 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold rounded-xl border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
          >
            {isCancelling ? 'Cancelando…' : 'Cancelar sesión'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {step === 'picker' && (
        <PaymentMethodPicker
          planName={planName}
          onSelect={handleSelectMethod}
          isLoading={isCreating}
        />
      )}

      {step === 'instructions' && sessionResponse && (
        <PaymentInstructionsStep
          session={sessionResponse.session}
          recipientInfo={sessionResponse.recipientInfo}
          instructions={sessionResponse.instructions}
          paymentMethod={sessionResponse.session.paymentMethod}
          onContinue={() => setStep('upload')}
          onExpired={handleReset}
        />
      )}

      {step === 'upload' && workingSession && (
        <UploadProofStep
          tenantId={tenantId}
          paymentMethod={workingSession.paymentMethod}
          session={workingSession}
          onSuccess={(p) => {
            setPayment(p);
            setStep('success');
          }}
          onBack={() => {
            if (activeSession) setStep('active-session');
            else setStep('instructions');
          }}
        />
      )}

      {step === 'success' && payment && (
        <PaymentSuccessStep payment={payment} onNewPayment={handleReset} />
      )}
    </div>
  );
}