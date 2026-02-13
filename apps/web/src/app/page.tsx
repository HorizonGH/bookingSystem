import { Hero } from '@/components/Hero';
import { Stats } from '@/components/Stats';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-primary-50/20 to-secondary-50/30 dark:from-dark dark:via-dark-light dark:to-dark">
      
      <main>
        <Hero />
      </main>
      
      <Footer />
    </div>
  );
}
