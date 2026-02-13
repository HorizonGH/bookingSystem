'use client';

import { useState } from 'react';

interface Business {
  id: number;
  name: string;
  category: string;
  rating: number;
  location: string;
  image: string;
  description: string;
  available: boolean;
}

interface BusinessSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessSearch({ isOpen, onClose }: BusinessSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: '🏪' },
    { id: 'restaurant', name: 'Restaurantes', icon: '🍽️' },
    { id: 'salon', name: 'Salones de Belleza', icon: '💇' },
    { id: 'medical', name: 'Servicios Médicos', icon: '⚕️' },
    { id: 'fitness', name: 'Gimnasios', icon: '💪' },
    { id: 'spa', name: 'Spa & Bienestar', icon: '🧘' },
    { id: 'automotive', name: 'Automotriz', icon: '🚗' },
  ];

  const locations = [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga'
  ];

  // Sample businesses data
  const businesses: Business[] = [
    {
      id: 1,
      name: 'Restaurante El Gourmet',
      category: 'restaurant',
      rating: 4.8,
      location: 'Madrid',
      image: '🍽️',
      description: 'Cocina mediterránea con los mejores ingredientes frescos',
      available: true
    },
    {
      id: 2,
      name: 'Salón Belleza Total',
      category: 'salon',
      rating: 4.9,
      location: 'Barcelona',
      image: '💇',
      description: 'Corte, color y tratamientos especializados',
      available: true
    },
    {
      id: 3,
      name: 'Clínica Dental Sonrisa',
      category: 'medical',
      rating: 4.7,
      location: 'Valencia',
      image: '⚕️',
      description: 'Servicios dentales completos con tecnología avanzada',
      available: true
    },
    {
      id: 4,
      name: 'FitZone Gym',
      category: 'fitness',
      rating: 4.6,
      location: 'Madrid',
      image: '💪',
      description: 'Entrenamientos personalizados y clases grupales',
      available: true
    },
    {
      id: 5,
      name: 'Zen Spa Center',
      category: 'spa',
      rating: 4.9,
      location: 'Málaga',
      image: '🧘',
      description: 'Masajes, tratamientos faciales y relajación total',
      available: false
    },
    {
      id: 6,
      name: 'AutoCare Express',
      category: 'automotive',
      rating: 4.5,
      location: 'Sevilla',
      image: '🚗',
      description: 'Mantenimiento y reparación rápida de vehículos',
      available: true
    }
  ];

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || business.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-glow-500 to-cyan-glow-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span>🔍</span>
              <span>Buscar Negocios</span>
            </h2>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o servicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl text-dark dark:text-light bg-white/90 dark:bg-dark backdrop-blur-sm border-2 border-transparent focus:border-white focus:outline-none transition-all duration-200 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">🔎</span>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-light-darker dark:border-dark-light bg-light-darker dark:bg-dark/50">
          <div className="space-y-4">
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? 'bg-cyan-glow-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-dark text-secondary-700 dark:text-secondary-300 hover:bg-light-darker dark:hover:bg-dark-lighter'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-secondary-700 dark:text-secondary-300">
                Ubicación
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLocation('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedLocation === 'all'
                      ? 'bg-cyan-glow-500 text-white shadow-lg'
                      : 'bg-white dark:bg-dark text-secondary-700 dark:text-secondary-300 hover:bg-light-darker dark:hover:bg-dark-lighter'
                  }`}
                >
                  📍 Todas
                </button>
                {locations.map(loc => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedLocation === loc
                        ? 'bg-cyan-glow-500 text-white shadow-lg'
                        : 'bg-white dark:bg-dark text-secondary-700 dark:text-secondary-300 hover:bg-light-darker dark:hover:bg-dark-lighter'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-350px)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dark dark:text-light">
              {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'resultado' : 'resultados'}
            </h3>
            {filteredBusinesses.length > 0 && (
              <span className="text-sm text-secondary-500 dark:text-secondary-400">
                Haz clic en un negocio para reservar
              </span>
            )}
          </div>

          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-2">
                No se encontraron negocios
              </p>
              <p className="text-secondary-500 dark:text-secondary-500">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBusinesses.map((business, index) => (
                <div
                  key={business.id}
                  className="group bg-white dark:bg-dark rounded-xl p-5 border-2 border-light-darker dark:border-dark-light hover:border-cyan-glow-500 dark:hover:border-cyan-glow-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      {business.image}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-dark dark:text-light mb-1">
                        {business.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-yellow-500">
                          ⭐ {business.rating}
                        </span>
                        <span className="text-secondary-400">•</span>
                        <span className="text-secondary-600 dark:text-secondary-400">
                          📍 {business.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                    {business.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      business.available 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {business.available ? '✓ Disponible' : '⏰ No disponible'}
                    </span>
                    
                    <button 
                      disabled={!business.available}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        business.available
                          ? 'bg-cyan-glow-500 text-white hover:bg-cyan-glow-600 hover:scale-105'
                          : 'bg-secondary-300 text-secondary-500 cursor-not-allowed dark:bg-dark dark:text-secondary-600'
                      }`}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
