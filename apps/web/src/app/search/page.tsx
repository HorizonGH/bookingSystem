'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tenantService, TenantDto, PaginationRequest } from '../../services/tenant';
import { ApiError } from '../../services/api';

const CATEGORIES = ['Todos', 'Restaurante', 'Belleza', 'Salud', 'Fitness', 'Spa', 'Automotriz'];

export default function SearchPage() {
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [cityFilter, setCityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch tenants from API - accepts optional overrides for filter values
  interface FetchOptions {
    category?: string;
    city?: string;
    country?: string;
    search?: string;
    page?: number;
  }
  
  const fetchTenants = async (options?: FetchOptions) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Use provided options or fall back to state
      const effectiveCategoryFilter = options?.category ?? categoryFilter;
      const effectiveActiveCategory = options?.category !== undefined ? '' : activeCategory;
      const effectiveCityFilter = options?.city ?? cityFilter;
      const effectiveCountryFilter = options?.country ?? countryFilter;
      const effectiveSearchTerm = options?.search ?? searchTerm;
      const effectivePage = options?.page ?? currentPage;
      
      // Build filters object - use lowercase keys, backend auto-capitalizes
      // Note: Backend uses "Contains" matching for strings
      const filters: Record<string, any> = {};
      
      // Category filtering - filter by Description (uses Contains matching)
      // This works since business descriptions typically mention their type
      const categoryValue = effectiveCategoryFilter || (effectiveActiveCategory !== 'Todos' ? effectiveActiveCategory : '');
      if (categoryValue) {
        filters.description = categoryValue;
      }
      
      if (effectiveCityFilter) {
        filters.city = effectiveCityFilter;
      }
      if (effectiveCountryFilter) {
        filters.country = effectiveCountryFilter;
      }
      
      const params: PaginationRequest = {
        pageNumber: effectivePage,
        pageSize: pageSize,
        searchTerm: effectiveSearchTerm || undefined,
        sortBy: 'name',
        sortDescending: false,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      };

      const response = await tenantService.getAllTenants(params);
      
      setTenants(response.items);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar los negocios');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tenants on mount and when category button changes
  useEffect(() => {
    if (currentPage === 1) {
      fetchTenants();
    } else {
      setCurrentPage(1); // Reset to page 1 when category changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);
  
  // Fetch tenants when page number changes
  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-12 py-3 border border-light-darker dark:border-secondary-700 rounded-xl leading-5 bg-white dark:bg-dark text-dark dark:text-light placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="Buscar servicios, lugares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                      fetchTenants({ search: searchTerm, page: 1 });
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchTenants({ search: searchTerm, page: 1 });
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-primary-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  showFilters || cityFilter || countryFilter
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-light text-secondary-600 dark:text-secondary-400 border border-light-darker dark:border-secondary-700 hover:border-primary-400'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </button>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mb-4 p-4 bg-white dark:bg-dark-light rounded-xl border border-light-darker dark:border-secondary-700 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                    Tipo de negocio
                  </label>
                  <input
                    type="text"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    placeholder="Ej: Restaurante, Spa..."
                    className="w-full px-4 py-2 border border-light-darker dark:border-secondary-700 rounded-lg bg-white dark:bg-dark text-dark dark:text-light placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    placeholder="Ej: Madrid, Barcelona..."
                    className="w-full px-4 py-2 border border-light-darker dark:border-secondary-700 rounded-lg bg-white dark:bg-dark text-dark dark:text-light placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-dark dark:text-light mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    placeholder="Ej: España, México..."
                    className="w-full px-4 py-2 border border-light-darker dark:border-secondary-700 rounded-lg bg-white dark:bg-dark text-dark dark:text-light placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  />
                </div>
                
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage(1);
                      fetchTenants({ page: 1 });
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-lg hover:from-primary-600 hover:to-secondary-700 transition-all font-medium shadow-lg"
                  >
                    Aplicar Filtros
                  </button>
                  
                  <button
                    onClick={() => {
                      setCategoryFilter('');
                      setCityFilter('');
                      setCountryFilter('');
                      setActiveCategory('Todos');
                      setSearchTerm('');
                      setCurrentPage(1);
                      // Pass empty values explicitly to avoid race condition
                      fetchTenants({ category: '', city: '', country: '', search: '', page: 1 });
                    }}
                    className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-medium"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setCategoryFilter(''); // Clear manual category filter when clicking category button
                }}
                className={`flex-shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
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
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary-600 dark:text-secondary-400">Cargando negocios...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark dark:text-light mb-2">Error al cargar</h3>
            <p className="text-secondary-500 mb-4">{error}</p>
            <button 
              onClick={() => fetchTenants()}
              className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <>
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Mostrando <span className="font-semibold">{tenants.length}</span> de <span className="font-semibold">{totalCount}</span> resultados
              </p>
            </div>

            {/* Tenant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="group bg-white dark:bg-dark-light rounded-2xl overflow-hidden border border-light-darker dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 flex flex-col h-full animate-fadeIn"
                >
                  {/* Image Area */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-500/10 to-secondary-500/10">
                    {tenant.logoUrl ? (
                      <img
                        src={tenant.logoUrl}
                        alt={tenant.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl font-bold text-primary-500/50">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-dark dark:text-light group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                        {tenant.name}
                      </h3>
                    </div>
                    
                    {tenant.description && (
                      <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3 line-clamp-2">
                        {tenant.description}
                      </p>
                    )}

                    {(tenant.address || tenant.city) && (
                      <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">
                          {tenant.address && tenant.city ? `${tenant.address}, ${tenant.city}` : tenant.address || tenant.city}
                        </span>
                      </div>
                    )}

                    {tenant.businessHours && (
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-4">
                        <strong>Horarios:</strong> {tenant.businessHours}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-light-darker dark:border-secondary-700 flex items-center justify-between">
                      {tenant.slug && (
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md uppercase tracking-wider">
                          {tenant.slug}
                        </span>
                      )}
                      <Link
                        href={`/business/${tenant.id}#reservation`}
                        className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-sm font-bold rounded-lg hover:from-primary-600 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-1 ml-auto"
                      >
                        Ver más
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-dark-light border border-light-darker dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 hover:border-primary-500 dark:hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-lg'
                            : 'bg-white dark:bg-dark-light border border-light-darker dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 hover:border-primary-500 dark:hover:border-primary-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-dark-light border border-light-darker dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 hover:border-primary-500 dark:hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && tenants.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-light-darker dark:bg-secondary-800 mb-4">
              <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark dark:text-light mb-2">No se encontraron resultados</h3>
            <p className="text-secondary-500">Intenta ajustar tu búsqueda o filtros.</p>
            <button 
              onClick={() => {
                setSearchTerm(''); 
                setActiveCategory('Todos');
                setCategoryFilter('');
                setCityFilter('');
                setCountryFilter('');
                setCurrentPage(1);
                fetchTenants({ category: '', city: '', country: '', search: '', page: 1 });
              }}
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