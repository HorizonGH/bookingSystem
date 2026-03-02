import { apiClient } from './api';

/* ------------------------------------------------------------------ */
/*  String-based enums matching the backend API                        */
/* ------------------------------------------------------------------ */

export type PaymentMethodStr = 'Transfermovil' | 'Zelle';
export type CurrencyStr = 'CUP' | 'USD';
export type PaymentSessionStatus = 'Active' | 'Completed' | 'Expired';
export type PaymentStatusStr = 'Pending' | 'Approved' | 'Rejected';

/* ------------------------------------------------------------------ */
/*  Interfaces                                                         */
/* ------------------------------------------------------------------ */

/** Returned inside CreateSessionResponse */
export interface PaymentSession {
  id: string;
  tenantId: string;
  planId: string;
  expectedAmount: number;
  currency: CurrencyStr;
  paymentMethod: PaymentMethodStr;
  referenceCode: string;
  status: PaymentSessionStatus;
  expiresAt: string;
  createdAt: string;
}

/** POST /tenants/{tenantId}/payments/sessions → response */
export interface CreateSessionResponse {
  session: PaymentSession;
  recipientInfo: string;
  instructions: string;
}

/** Represents a submitted payment proof / payment record (matches PaymentDto) */
export interface Payment {
  id: string;
  paymentSessionId: string;
  tenantId: string;
  tenantName?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  senderName: string;
  screenshotUrl?: string;
  transactionNumber?: string;
  confirmationNumber?: string;
  transferTime: string;
  adminNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  referenceCode?: string;
}

/** Body for POST /tenants/{tenantId}/payments/sessions */
export interface CreateSessionRequest {
  planId: string;
  currency: CurrencyStr;
  paymentMethod: PaymentMethodStr;
}

/** Body for POST /tenants/{tenantId}/payments/sessions/{sessionId}/proof */
export interface UploadProofRequest {
  tenantId: string;
  sessionId: string;
  senderName: string;
  transactionNumber?: string;
  confirmationNumber?: string;
  transferTime: string; // ISO-8601
  screenshot?: File;
}

/** Body for POST /payments/{paymentId}/review */
export interface ReviewPaymentRequest {
  approve: boolean;
  adminNotes?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function paymentMethodLabel(m: PaymentMethodStr): string {
  return m === 'Zelle' ? 'Zelle (USD)' : 'Transfermóvil (CUP)';
}

export function currencyForMethod(m: PaymentMethodStr): CurrencyStr {
  return m === 'Zelle' ? 'USD' : 'CUP';
}

/** Normalize a raw backend session object (handles both camelCase and PascalCase keys) */
export function normalizeSession(r: any): PaymentSession {
  const idVal = r.id ?? r.Id ?? r.sessionId ?? r.SessionId ?? r.paymentSessionId ?? r.PaymentSessionId ?? '';
  return {
    id:             idVal,
    tenantId:       r.tenantId       ?? r.TenantId       ?? '',
    planId:         r.planId         ?? r.PlanId         ?? '',
    expectedAmount: r.expectedAmount ?? r.ExpectedAmount ?? r.amount ?? r.Amount ?? 0,
    currency:       r.currency       ?? r.Currency       ?? '',
    paymentMethod:  r.paymentMethod  ?? r.PaymentMethod  ?? r.method ?? r.Method ?? '',
    referenceCode:  r.referenceCode  ?? r.ReferenceCode  ?? r.reference ?? r.Reference ?? '',
    status:         r.status         ?? r.Status         ?? 'Active',
    expiresAt:      r.expiresAt      ?? r.ExpiresAt      ?? '',
    createdAt:      r.createdAt      ?? r.CreatedAt      ?? r.created ?? r.Created ?? '',
  };
}

/** Normalize a raw backend payment / PaymentDto (handles camelCase and PascalCase) */
export function normalizePayment(r: any): Payment {
  return {
    id:                  r.id                  ?? r.Id                  ?? '',
    paymentSessionId:    r.paymentSessionId    ?? r.PaymentSessionId    ?? '',
    tenantId:            r.tenantId            ?? r.TenantId            ?? '',
    tenantName:          r.tenantName          ?? r.TenantName,
    amount:              r.amount              ?? r.Amount              ?? 0,
    currency:            r.currency            ?? r.Currency            ?? '',
    paymentMethod:       r.paymentMethod       ?? r.PaymentMethod       ?? '',
    status:              r.status              ?? r.Status              ?? '',
    senderName:          r.senderName          ?? r.SenderName          ?? '',
    screenshotUrl:       r.screenshotUrl       ?? r.ScreenshotUrl,
    transactionNumber:   r.transactionNumber   ?? r.TransactionNumber,
    confirmationNumber:  r.confirmationNumber  ?? r.ConfirmationNumber,
    transferTime:        r.transferTime        ?? r.TransferTime        ?? '',
    adminNotes:          r.adminNotes          ?? r.AdminNotes,
    reviewedAt:          r.reviewedAt          ?? r.ReviewedAt,
    createdAt:           r.createdAt           ?? r.CreatedAt           ?? r.created ?? r.Created ?? '',
    referenceCode:       r.referenceCode       ?? r.ReferenceCode,
  };
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export const paymentService = {
  /** Create a payment session for a plan upgrade */
  async createPaymentSession(
    tenantId: string,
    data: CreateSessionRequest,
  ): Promise<CreateSessionResponse> {
    return apiClient.post<CreateSessionResponse>(
      `/tenants/${tenantId}/payments/sessions`,
      data,
    );
  },

  /** Upload proof of payment (screenshot + metadata) */
  async uploadPaymentProof(req: UploadProofRequest): Promise<Payment> {
    const form = new FormData();
    // Use PascalCase to match C# model property names exactly
    form.append('SenderName', req.senderName);
    // Ensure a valid ISO-8601 string that .NET's DateTime can parse
    const isoTime = req.transferTime.endsWith('Z')
      ? req.transferTime
      : new Date(req.transferTime).toISOString();
    form.append('TransferTime', isoTime);
    if (req.transactionNumber) form.append('TransactionNumber', req.transactionNumber);
    if (req.confirmationNumber) form.append('ConfirmationNumber', req.confirmationNumber);
    if (req.screenshot) form.append('Screenshot', req.screenshot, req.screenshot.name);

    const url = `/tenants/${req.tenantId}/payments/sessions/${req.sessionId}/proof`;
    console.log('[PaymentService] POST', url, 'with form keys', Array.from(form.keys()));
    const raw = await apiClient.post<any>(url, form);
    return normalizePayment(raw);
  },

  /**
   * Get the active (non-expired, non-completed) payment session for a tenant.
   * Returns null if none exists (204).
   */
  async getActiveSession(tenantId: string): Promise<PaymentSession | null> {
    const raw = await apiClient.get<any>(
      `/tenants/${tenantId}/payments/sessions/active`,
    );
    return raw ? normalizeSession(raw) : null;
  },

  /** Cancel (delete) a payment session */
  async cancelSession(tenantId: string, sessionId: string): Promise<void> {
    await apiClient.delete(`/tenants/${tenantId}/payments/sessions/${sessionId}`);
  },

  /** Get all payments for a tenant */
  async getTenantPayments(tenantId: string): Promise<Payment[]> {
    return apiClient.get<Payment[]>(`/tenants/${tenantId}/payments`);
  },

  /** Admin: get all pending payments */
  async getPendingPayments(): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments/pending');
  },

  /** Admin: approve or reject a payment */
  async reviewPayment(
    paymentId: string,
    data: ReviewPaymentRequest,
  ): Promise<void> {
    await apiClient.post(`/payments/${paymentId}/review`, data);
  },
};
