'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock Data
interface Business {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  address: string;
  image: string;
  tags: string[];
  price: string;
  available: boolean;
}

const BUSINESSES: Business[] = [
  {
    id: 1,
    name: 'Restaurante El Gourmet',
    category: 'Restaurante',
    rating: 4.8,
    reviews: 342,
    location: 'Madrid',
    address: 'Calle Gran Vía 28, Madrid',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Cena', 'Romántico', 'Vino'],
    price: '€€€',
    available: true,
  },
  {
    id: 2,
    name: 'Salón Belleza Total',
    category: 'Belleza',
    rating: 4.9,
    reviews: 567,
    location: 'Barcelona',
    address: 'Paseo de Gracia 45, Barcelona',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Corte', 'Color', 'Spa'],
    price: '€€',
    available: true,
  },
  {
    id: 3,
    name: 'Clínica Dental Sonrisa',
    category: 'Salud',
    rating: 4.7,
    reviews: 289,
    location: 'Valencia',
    address: 'Avenida del Puerto 12, Valencia',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Dental', 'Urgencias'],
    price: '€€€',
    available: true,
  },
  {
    id: 4,
    name: 'FitZone Gym Premium',
    category: 'Fitness',
    rating: 4.6,
    reviews: 891,
    location: 'Madrid',
    address: 'Calle Alcalá 156, Madrid',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Gym', 'Yoga', 'Pilates'],
    price: '€€',
    available: true,
  },
  {
    id: 5,
    name: 'Zen Wellness Center',
    category: 'Spa',
    rating: 4.9,
    reviews: 124,
    location: 'Málaga',
    address: 'Calle Larios 8, Málaga',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Masaje', 'Relax', 'Sauna'],
    price: '€€€€',
    available: false,
  },
  {
    id: 6,
    name: 'AutoFix Taller',
    category: 'Automotriz',
    rating: 4.5,
    reviews: 76,
    location: 'Sevilla',
    address: 'Av. de la Constitución 10, Sevilla',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Mecánica', 'Revisión'],
    price: '€€',
    available: true,
  },
];

const CATEGORIES = ['Todos', 'Restaurante', 'Belleza', 'Salud', 'Fitness', 'Spa', 'Automotriz'];

export default function SearchPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredBusinesses = BUSINESSES.filter((b) => {
    const matchesCategory = activeCategory === 'Todos' || b.category === activeCategory;
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-light-darker dark:bg-dark text-secondary-700 dark:text-secondary-300">
      
      {/* Sticky Header with Search & Filters */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-dark-light/80 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-dark dark:text-light hidden md:block">
              Explorar
            </h1>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-light-darker dark:border-secondary-700 rounded-xl leading-5 bg-white dark:bg-dark text-dark dark:text-light placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 shadow-sm hover:shadow-md"
                placeholder="Buscar servicios, lugares..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Categories Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-lg shadow-primary-500/25 transform scale-105'
                    : 'bg-white dark:bg-dark-light text-secondary-600 dark:text-secondary-400 border border-light-darker dark:border-secondary-700 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBusinesses.map((business) => (
            <div
              key={business.id}
              className="group bg-white dark:bg-dark-light rounded-2xl overflow-hidden border border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 flex flex-col h-full animate-fadeIn"
            >
              {/* Image Area */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={business.image}
                  alt={business.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-dark/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-dark dark:text-light shadow-sm flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {business.rating} ({business.reviews})
                </div>
                {!business.available && (
                  <div className="absolute inset-0 bg-dark/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      No Disponible
                    </span>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-dark dark:text-light group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                    {business.name}
                  </h3>
                  <span className="text-secondary-500 text-sm font-medium">{business.price}</span>
                </div>
                
                <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{business.address}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {business.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-light-darker dark:bg-secondary-800 text-xs font-medium text-secondary-600 dark:text-secondary-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-light-darker dark:border-secondary-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md uppercase tracking-wider">
                    {business.category}
                  </span>
                  <Link
                    href={`/business/${business.id}`}
                    className="text-sm font-bold text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group/link"
                  >
                    Reservar
                    <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBusinesses.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-light-darker dark:bg-secondary-800 mb-4">
              <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark dark:text-light mb-2">No se encontraron resultados</h3>
            <p className="text-secondary-500">Intenta ajustar tu búsqueda o filtros.</p>
            <button 
              onClick={() => {setSearchTerm(''); setActiveCategory('Todos')}}
              className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>
    </div>
  );
}