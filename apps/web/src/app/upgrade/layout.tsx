import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mejorar Plan',
  description: 'Actualizá el plan de tu negocio para desbloquear más funcionalidades en ZitaSmart.',
  alternates: { canonical: '/upgrade' },
  robots: { index: false, follow: false },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
