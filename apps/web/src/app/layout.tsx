import type { Metadata } from 'next';
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Header } from "../components/Header";
import DialogRenderer from '../components/DialogRenderer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reserva-smart.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Reserva Smart – Plataforma de Reservas Online para Negocios',
    template: '%s | Reserva Smart',
  },
  description:
    'Reserva Smart (ReservaSmart) es la plataforma profesional para gestionar reservas y citas de tu negocio. Agenda inteligente, notificaciones automáticas y panel de control completo. ¡Prueba gratis!',
  keywords: [
    'reserva smart',
    'reserva-smart',
    'reservasmart',
    'reservas online',
    'sistema de reservas',
    'sistema de citas',
    'agenda digital',
    'gestión de turnos',
    'software de reservas',
    'reservar turno online',
    'plataforma de reservas',
    'booking online',
    'turnos online',
    'agenda online para negocios',
  ],
  authors: [{ name: 'Reserva Smart', url: SITE_URL }],
  creator: 'Reserva Smart',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'Reserva Smart',
    title: 'Reserva Smart – Plataforma de Reservas y Citas Online',
    description:
      'Gestiona las reservas y citas de tu negocio con Reserva Smart. Agenda inteligente, notificaciones automáticas y panel de control completo. ¡Empieza gratis!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Reserva Smart – Plataforma de Reservas Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reserva Smart – Plataforma de Reservas y Citas Online',
    description:
      'Gestiona las reservas y citas de tu negocio con Reserva Smart. ¡Empieza gratis!',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/icon.ico',
    shortcut: '/icon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-light dark:bg-dark text-dark dark:text-light transition-colors duration-300">
        <ThemeProvider>
          <Header />
          {children}
          {/* Global dialog renderer (replaces in-app alerts/confirms/prompts) */}
          <DialogRenderer />
        </ThemeProvider>
      </body>
    </html>
  );
}
