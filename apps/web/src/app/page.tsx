import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { Stats } from '@/components/Stats';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ReservaSmart – Gestión de Reservas y Citas Online',
  description:
    'Optimiza la agenda de tu negocio con ReservaSmart. Reservas inteligentes, calendario en tiempo real, notificaciones automáticas y panel de control completo. ¡Probá gratis!',
  alternates: { canonical: '/' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'ReservaSmart',
      url: 'https://reservasmart.app',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://reservasmart.app/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      name: 'ReservaSmart',
      url: 'https://reservasmart.app',
      logo: 'https://reservasmart.app/logo.png',
      sameAs: ['https://www.instagram.com/_horizon.gh'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: 'Spanish',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'ReservaSmart',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description:
        'Plataforma profesional para gestionar reservas y citas online. Agenda inteligente, notificaciones automáticas y panel de control completo.',
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-primary-50/20 to-secondary-50/30 dark:from-dark dark:via-dark-light dark:to-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <Hero />
      </main>
      
      <Footer />
    </div>
  );
}
