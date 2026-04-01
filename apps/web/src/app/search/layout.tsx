import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buscar Negocios',
  description:
    'Encuentra restaurantes, peluquerías, clínicas, gimnasios y más en tu ciudad. Reservá tu turno online en segundos con Zita Smart.',
  alternates: { canonical: '/search' },
  openGraph: {
    title: 'Buscar Negocios – Zita Smart',
    description:
      'Explora negocios cercanos y reservá tu turno online de forma rápida y sencilla.',
    url: '/search',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
