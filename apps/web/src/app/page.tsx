import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { Stats } from '@/components/Stats';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Zita Smart – Gestión de Reservas y Citas Online',
  description:
    'Zita Smart (zita-smart) es la plataforma para gestionar reservas y citas de tu negocio. Agenda inteligente, calendario en tiempo real, notificaciones automáticas y panel de control completo. ¡Empieza gratis!',
  alternates: { canonical: '/' },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zita-smart.vercel.app';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Zita Smart',
      alternateName: ['ZitaSmart', 'zita-smart'],
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      name: 'Zita Smart',
      alternateName: ['ZitaSmart', 'zita-smart'],
      url: SITE_URL,
      logo: `${SITE_URL}/og-image.png`,
      sameAs: ['https://www.instagram.com/_horizon.gh'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: 'Spanish',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Zita Smart',
      alternateName: 'ZitaSmart',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description:
        'Zita Smart: plataforma profesional para gestionar reservas y citas online. Agenda inteligente, notificaciones automáticas y panel de control completo.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: SITE_URL,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cómo empiezo con Zita Smart?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Regístrate en el sitio, configura tus servicios y comienza a aceptar reservas en minutos.',
          },
        },
        {
          '@type': 'Question',
          name: '¿La plataforma es segura?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, usamos cifrado y medidas de seguridad para proteger tus datos y los de tus clientes.',
          },
        },
      ],
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
