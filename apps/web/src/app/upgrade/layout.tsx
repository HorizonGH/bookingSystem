import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mejorar Plan',
  description: 'Actualizá el plan de tu negocio para desbloquear más funcionalidades en ReservaSmart.',
  alternates: { canonical: '/upgrade' },
  robots: { index: false, follow: false },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
