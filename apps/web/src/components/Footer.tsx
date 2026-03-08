import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-12 bg-light/50 dark:bg-dark/30 border-t border-light-darker dark:border-dark-light">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
                ReservaSmart
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm leading-relaxed">
                Gestión moderna de reservas para negocios modernos
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-dark dark:text-light">Producto</h4>
              <ul className="space-y-2.5 text-sm text-secondary-600 dark:text-secondary-400">
                <li><Link href="/#features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Características</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Precios</Link></li>
                <li><Link href="/search" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Buscar Negocios</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-dark dark:text-light">Empresa</h4>
              <ul className="space-y-2.5 text-sm text-secondary-600 dark:text-secondary-400">
                <li><Link href="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sobre Nosotros</Link></li>
                <li><Link href="/about#faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Preguntas Frecuentes</Link></li>
                <li><Link href="/about#contacto" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-dark dark:text-light">Soporte</h4>
              <ul className="space-y-2.5 text-sm text-secondary-600 dark:text-secondary-400">
                <li><Link href="/about#faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Centro de Ayuda</Link></li>
                <li><a href="https://www.instagram.com/_horizon.gh" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-light-darker dark:border-dark-light text-center text-sm text-secondary-600 dark:text-secondary-400">
            <p>&copy; 2026 ReservaSmart. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
