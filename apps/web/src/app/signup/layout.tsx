import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description:
    'Registrá tu negocio en ReservaSmart y empezá a recibir reservas online hoy mismo. Gratis para siempre en el plan Starter.',
  alternates: { canonical: '/signup' },
  openGraph: {
    title: 'Crear Cuenta – ReservaSmart',
    description:
      'Registrá tu negocio y empezá a recibir reservas online. Gratis para siempre en el plan Starter.',
    url: '/signup',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
