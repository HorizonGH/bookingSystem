import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planes y Precios',
  description:
    'Conoce los planes de Reserva Smart: Starter, Professional y Enterprise. Elegí el que mejor se adapta a tu negocio y empieza a gestionar tus reservas hoy.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Planes y Precios – Reserva Smart',
    description:
      'Planes flexibles para cada tipo de negocio. Desde pequeños emprendimientos hasta grandes cadenas.',
    url: '/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
