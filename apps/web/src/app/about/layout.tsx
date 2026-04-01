import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nosotros y Contacto',
  description:
    'Conoce quiénes somos, nuestra misión y cómo contactarnos. Preguntas frecuentes sobre Zita Smart, la plataforma de reservas online para negocios.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Sobre Nosotros y Contacto – Zita Smart',
    description:
      'Conoce Zita Smart: misión, preguntas frecuentes y cómo contactarnos por Instagram.',
    url: '/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
