'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Footer } from '../../components/Footer';

const FAQS = [
  {
    q: '¿Qué es ZitaSmart?',
    a: 'ZitaSmart es una plataforma que permite a negocios de cualquier rubro gestionar sus reservas y citas de forma digital. Los clientes pueden encontrar tu negocio, elegir un servicio y reservar su turno en segundos, sin llamadas ni mensajes de WhatsApp.',
  },
  {
    q: '¿Tengo que pagar para empezar?',
    a: 'No. El plan Starter es completamente gratuito y te permite empezar a recibir reservas de inmediato. Podés escalar a un plan premium cuando tu negocio lo necesite.',
  },
  {
    q: '¿Qué tipo de negocios pueden usar ZitaSmart?',
    a: 'Cualquier negocio que trabaje por turnos: peluquerías, barberías, centros de estética, clínicas, gimnasios, spas, talleres mecánicos, estudios de tatuajes y más.',
  },
  {
    q: '¿Cómo se gestionan los trabajadores y servicios?',
    a: 'Desde el panel de administración puedes agregar trabajadores, asignarles horarios personalizados por día de la semana y crear los servicios que ofrecen. Los clientes ven todo esto al reservar.',
  },
  {
    q: '¿Los clientes necesitan crear una cuenta para reservar?',
    a: 'Sí, los clientes crean una cuenta gratuita para gestionar sus reservas. Esto también les permite recibir recordatorios y ver su historial de turnos.',
  },
  {
    q: '¿Cómo activo un plan premium?',
    a: 'Por el momento los planes premium se gestionan de forma personalizada. Simplemente contactanos por Instagram (@_horizon.gh) y te activamos el plan en minutos.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Todos los datos se transmiten con cifrado HTTPS y nunca compartimos tu información con terceros. El acceso al panel de administración está protegido con autenticación segura.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, puedes bajar a un plan gratuito o cancelar tu cuenta cuando quieras, sin cargos ni penalidades.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-light-darker dark:border-secondary-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white dark:bg-dark-light hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors duration-200 group"
        aria-expanded={open}
      >
        <span className="font-semibold text-dark dark:text-light group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors pr-4">
          {q}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
        >
          <svg className="w-3 h-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 text-secondary-600 dark:text-secondary-400 text-sm leading-relaxed bg-white dark:bg-dark-light border-t border-light-darker dark:border-secondary-700">
          {a}
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] opacity-40 animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 md:py-20">

        {/* ── Hero ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30">
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide">
              Sobre Nosotros
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-dark dark:text-light mb-4 leading-tight">
            Simplificamos la forma en que{' '}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              gestionas tus turnos
            </span>
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto leading-relaxed">
            ZitaSmart nació con un objetivo claro: que cualquier negocio —sin importar su tamaño— pueda ofrecer
            una experiencia de reserva moderna y sin fricciones, tanto para el cliente como para el dueño.
          </p>
        </div>

        {/* ── Mission cards ── */}
        <div className="grid sm:grid-cols-3 gap-4 mb-20">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'Rápido de configurar',
              desc: 'Tu negocio online en menos de 10 minutos, sin conocimientos técnicos.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Disponible 24/7',
              desc: 'Tus clientes pueden reservar en cualquier momento, incluso cuando cierras.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: 'Pensado para todos',
              desc: 'Desde un profesional independiente hasta una cadena con múltiples sucursales.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="p-6 bg-white dark:bg-dark-light rounded-2xl border border-light-darker dark:border-secondary-700 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                {icon}
              </div>
              <h3 className="font-bold text-dark dark:text-light mb-1">{title}</h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── FAQ ── */}
        <section className="mb-20" id="faq">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-dark dark:text-light mb-2">
              Preguntas frecuentes
            </h2>
            <p className="text-secondary-500 dark:text-secondary-400">
              Todo lo que necesitás saber antes de empezar.
            </p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contacto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-600 p-8 sm:p-12 text-center text-white shadow-xl">
            {/* decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              {/* Instagram icon */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>

              <h2 className="text-3xl font-extrabold mb-3">¿Tienes alguna pregunta?</h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8 leading-relaxed">
                Estamos para ayudarte. Escribinos por Instagram y te respondemos a la brevedad.
                También podés contactarnos para activar un plan premium o para cualquier consulta sobre la plataforma.
              </p>

              <a
                href="https://www.instagram.com/_horizon.gh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-primary-600 font-bold text-lg hover:bg-white/90 hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Contactar en Instagram
              </a>

              <p className="mt-4 text-white/60 text-sm">@_horizon.gh</p>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
