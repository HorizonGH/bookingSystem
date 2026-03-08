import type { Metadata } from 'next';
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Header } from "../components/Header";
import DialogRenderer from '../components/DialogRenderer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reservasmart.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ReservaSmart – Plataforma de Reservas Online',
    template: '%s | ReservaSmart',
  },
  description:
    'ReservaSmart es la plataforma profesional para gestionar reservas y citas de tu negocio. Agenda inteligente, notificaciones automáticas y más.',
  keywords: [
    'reservas online',
    'sistema de citas',
    'agenda digital',
    'gestión de turnos',
    'software de reservas',
    'booking',
  ],
  authors: [{ name: 'ReservaSmart', url: SITE_URL }],
  creator: 'ReservaSmart',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'ReservaSmart',
    title: 'ReservaSmart – Plataforma de Reservas Online',
    description:
      'Gestiona las reservas y citas de tu negocio con ReservaSmart. Agenda inteligente, notificaciones automáticas y panel de control completo.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ReservaSmart – Plataforma de Reservas Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReservaSmart – Plataforma de Reservas Online',
    description:
      'Gestiona las reservas y citas de tu negocio con ReservaSmart.',
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
