import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description:
    'Registra tu negocio en Reserva Smart y empieza a recibir reservas online hoy mismo. Gratis para siempre en el plan Starter.',
  alternates: { canonical: '/signup' },
  openGraph: {
    title: 'Crear Cuenta – Reserva Smart',
    description:
      'Registra tu negocio y empieza a recibir reservas online. Gratis para siempre en el plan Starter.',
    url: '/signup',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
