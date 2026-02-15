type DialogType = 'alert' | 'confirm' | 'prompt';

interface DialogRequestBase {
  id: number;
  type: DialogType;
  title?: string;
  message: string;
}

interface AlertRequest extends DialogRequestBase {
  type: 'alert';
  resolve: () => void;
}

interface ConfirmRequest extends DialogRequestBase {
  type: 'confirm';
  resolve: (value: boolean) => void;
}

interface PromptRequest extends DialogRequestBase {
  type: 'prompt';
  defaultValue?: string;
  resolve: (value: string | null) => void;
}

export type DialogRequest = AlertRequest | ConfirmRequest | PromptRequest;

let idCounter = 1;
let queue: DialogRequest[] = [];
const listeners = new Set<(q: DialogRequest | null) => void>();

function emit() {
  listeners.forEach((l) => l(queue[0] ?? null));
}

export function subscribe(fn: (req: DialogRequest | null) => void) {
  listeners.add(fn);
  fn(queue[0] ?? null);
  return () => listeners.delete(fn);
}

export function alertDialog(message: string, title?: string): Promise<void> {
  return new Promise((resolve) => {
    const req: AlertRequest = { id: idCounter++, type: 'alert', message, title, resolve };
    queue.push(req);
    if (queue.length === 1) emit();
  });
}

export function confirmDialog(message: string, title?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req: ConfirmRequest = { id: idCounter++, type: 'confirm', message, title, resolve };
    queue.push(req);
    if (queue.length === 1) emit();
  });
}

export function promptDialog(message: string, defaultValue?: string, title?: string): Promise<string | null> {
  return new Promise((resolve) => {
    const req: PromptRequest = { id: idCounter++, type: 'prompt', message, title, defaultValue, resolve };
    queue.push(req);
    if (queue.length === 1) emit();
  });
}

// Called by the React renderer to resolve (and advance queue)
export function resolveCurrent(result: any) {
  const current = queue.shift();
  if (!current) return;
  // call the resolver according to type
  if (current.type === 'alert') {
    current.resolve();
  } else if (current.type === 'confirm') {
    (current as ConfirmRequest).resolve(Boolean(result));
  } else if (current.type === 'prompt') {
    (current as PromptRequest).resolve(result == null ? null : String(result));
  }

  emit();
}

// Expose a small convenience wrapper that binds to window for legacy calls (non-blocking)
export function attachToWindow() {
  if (typeof window === 'undefined') return;
  // do not override if already attached
  // attach under `window.appDialog` to avoid breaking external libs
  (window as any).appDialog = {
    alert: alertDialog,
    confirm: confirmDialog,
    prompt: promptDialog,
  };
}
