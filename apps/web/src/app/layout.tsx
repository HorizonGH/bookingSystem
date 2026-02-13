'use client';

import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Header } from "../components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>ReservaSmart - Plataforma de Reservas Online</title>
        <meta name="description" content="Plataforma profesional de gestión de reservas y citas" />
      </head>
      <body className="antialiased bg-light dark:bg-dark text-dark dark:text-light transition-colors duration-300">
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
