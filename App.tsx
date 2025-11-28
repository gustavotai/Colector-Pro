
import React, { useState, useEffect, useMemo } from 'react';
import { Car, ViewMode, CarCategory } from './types';
import { CarForm } from './components/CarForm';
import { CarCard } from './components/CarCard';
import { CarDetail } from './components/CarDetail';
import { Button } from './components/Button';
import { translations, Language } from './translations';
import { carService as dbService } from './services/db';
import { apiService } from './services/api';

type StorageMode = 'local' | 'server';

export default function App() {
  // Helper to load settings
  const getInitialState = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse localStorage item', key);
    }
    return fallback;
  };

  // Global States with Persistence
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | undefined>(undefined);
  const [viewingCar, setViewingCar] = useState<Car | undefined>(undefined);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Preferences
  const [viewMode, setViewMode] = useState<ViewMode>(() => getInitialState('viewMode', ViewMode.VERTICAL_GRID));
  const [language, setLanguage] = useState<Language>(() => getInitialState('language', 'pt'));
  
  // Storage Configuration
  const [storageMode, setStorageMode] = useState<StorageMode>(() => getInitialState('storageMode', 'local'));
  const [serverUrl, setServerUrl] = useState(() => getInitialState('serverUrl', 'http://localhost:3001'));
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CarCategory | 'All'>('All');

  const t = translations[language];

  // Save settings when changed
  useEffect(() => { localStorage.setItem('viewMode', JSON.stringify(viewMode)); }, [viewMode]);
  useEffect(() => { localStorage.setItem('language', JSON.stringify(language)); }, [language]);
  useEffect(() => { localStorage.setItem('storageMode', JSON.stringify(storageMode)); }, [storageMode]);
  useEffect(() => { localStorage.setItem('serverUrl', JSON.stringify(serverUrl)); }, [serverUrl]);

  // Helper to get correct service based on mode
  const currentService = useMemo(() => {
    if (storageMode === 'server') {
      apiService.setBaseUrl(serverUrl);
      return apiService;
    }
    return dbService;
  }, [storageMode, serverUrl]);

  // Load cars when mode or URL changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setConnectionError(null);
      try {
        const data = await currentService.initMockData();
        setCars(data);
      } catch (error) {
        console.error("Failed to load database:", error);
        if (storageMode === 'server') {
          setConnectionError(t.connectionError);
        }
        setCars([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentService, storageMode, serverUrl, t.connectionError]);

  const handleOpenForm = (car?: Car) => {
    setEditingCar(car);
    setIsFormOpen(true);
  };

  const handleSaveCar = async (carData: Car) => {
    // Determine if it is an update or a create
    const isUpdate = !!editingCar;

    // Optimistic UI update
    setCars(prev => {
      if (isUpdate) {
        return prev.map(c => c.id === carData.id ? carData : c);
      }
      return [carData, ...prev];
    });
    
    setIsFormOpen(false);
    setEditingCar(undefined);
    
    // Save to DB/API
    try {
      if (isUpdate) {
        await currentService.updateCar(carData);
      } else {
        await currentService.addCar(carData);
      }
    } catch (error) {
      console.error("Failed to save car:", error);
      if (storageMode === 'server') {
        alert(t.connectionError);
        // Revert optimistic update on failure could be implemented here
      }
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      // Optimistic UI update
      setCars(prev => prev.filter(c => c.id !== id));
      
      // Delete from DB/API
      try {
        await currentService.deleteCar(id);
      } catch (error) {
        console.error("Failed to delete car:", error);
        if (storageMode === 'server') {
          alert(t.connectionError);
        }
      }
    }
  };

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = (car.brand || '').toLowerCase().includes(brandFilter.toLowerCase());
      const matchesModel = (car.model || '').toLowerCase().includes(modelFilter.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || car.category === categoryFilter;
      return matchesSearch && matchesBrand && matchesModel && matchesCategory;
    });
  }, [cars, searchQuery, brandFilter, modelFilter, categoryFilter]);

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col text-gray-100">
      {/* Header */}
      <header className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsConfigOpen(true)}>
                <div className={`bg-gradient-to-br from-orange-500 to-red-600 text-white p-2 rounded-lg shadow-lg relative ${storageMode === 'server' ? 'ring-2 ring-green-500' : ''}`}>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                  {storageMode === 'server' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-neutral-800"></div>
                  )}
                </div>
                <div>
                   <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                    Colector
                  </h1>
                  <h1 className="text-xl font-bold text-orange-500 tracking-tight leading-none">
                    Pro
                  </h1>
                </div>
              </div>
              
              {/* Mobile Controls */}
              <div className="flex lg:hidden items-center gap-2">
                 <button onClick={() => setIsConfigOpen(true)} className="p-2 text-neutral-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </button>
                 <button
                  onClick={() => setLanguage(l => l === 'en' ? 'pt' : 'en')}
                  className="px-2 py-1 rounded text-xs font-bold bg-neutral-700 text-neutral-300 border border-neutral-600"
                 >
                   {language.toUpperCase()}
                 </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
               {/* View Toggles & Desktop Lang */}
              <div className="flex items-center gap-4 self-end md:self-auto">
                 <button onClick={() => setIsConfigOpen(true)} className="hidden lg:block p-2 text-neutral-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </button>
                 <button
                  onClick={() => setLanguage(l => l === 'en' ? 'pt' : 'en')}
                  className="hidden lg:block px-3 py-1.5 rounded-md text-sm font-bold bg-neutral-700 hover:bg-neutral-600 text-neutral-300 border border-neutral-600 transition-colors"
                 >
                   {language === 'en' ? '🇺🇸 EN' : '🇧🇷 PT'}
                 </button>

                 <div className="flex items-center gap-1 bg-neutral-700 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode(ViewMode.VERTICAL_GRID)}
                    className={`p-2 rounded-md transition-all ${viewMode === ViewMode.VERTICAL_GRID ? 'bg-neutral-600 shadow text-orange-400' : 'text-neutral-400 hover:text-neutral-200'}`}
                    title="Grid View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode(ViewMode.HORIZONTAL_SCROLL)}
                    className={`p-2 rounded-md transition-all ${viewMode === ViewMode.HORIZONTAL_SCROLL ? 'bg-neutral-600 shadow text-orange-400' : 'text-neutral-400 hover:text-neutral-200'}`}
                    title="Horizontal View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Name Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-lg leading-5 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
            
            {/* Brand Filter */}
            <input
              type="text"
              placeholder={t.brandPlaceholder}
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-neutral-700 rounded-lg leading-5 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            />

            {/* Model Filter */}
            <input
              type="text"
              placeholder={t.modelPlaceholder}
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-neutral-700 rounded-lg leading-5 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            />

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CarCategory | 'All')}
              className="block w-full pl-3 pr-10 py-2 text-base border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-lg"
            >
              <option value="All">{t.categoryAll}</option>
              {Object.values(CarCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        
        {connectionError && (
          <div className="mb-6 bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div>
                <p className="font-bold">{t.connectionError}</p>
                <p className="text-sm opacity-75">{t.serverUrl}: {serverUrl}</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setStorageMode('local')} className="bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors whitespace-nowrap border border-red-600">
                  {t.switchToLocal}
               </button>
               <button onClick={() => setIsConfigOpen(true)} className="text-sm underline hover:text-white px-2">Config</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-neutral-400">Carregando Garagem...</span>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">{t.noCarsTitle}</h3>
            <p className="mt-2 text-neutral-400">
              {cars.length === 0 ? t.noCarsSubtitle : t.noCarsFilter}
            </p>
          </div>
        ) : (
          <>
            {viewMode === ViewMode.VERTICAL_GRID ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in pb-20">
                {filteredCars.map(car => (
                  <CarCard 
                    key={car.id} 
                    car={car} 
                    viewMode="grid" 
                    onDelete={handleDeleteCar} 
                    onEdit={handleOpenForm}
                    onView={setViewingCar}
                    language={language}
                  />
                ))}
              </div>
            ) : (
              <div className="flex overflow-x-auto space-x-6 pb-8 horizontal-scroll snap-x snap-mandatory px-2">
                {filteredCars.map(car => (
                  <CarCard 
                    key={car.id} 
                    car={car} 
                    viewMode="strip" 
                    onDelete={handleDeleteCar}
                    onEdit={handleOpenForm}
                    onView={setViewingCar}
                    language={language}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-20">
        <button
          onClick={() => handleOpenForm(undefined)}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-xl flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-bold pr-1">{t.addCar}</span>
        </button>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <CarForm 
          onSave={handleSaveCar} 
          onCancel={() => {
            setIsFormOpen(false);
            setEditingCar(undefined);
          }} 
          language={language}
          initialCar={editingCar}
        />
      )}

      {/* Detail View Modal */}
      {viewingCar && (
        <CarDetail
          car={viewingCar}
          onClose={() => setViewingCar(undefined)}
          language={language}
        />
      )}

      {/* Config Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full border border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">{t.serverConfigTitle}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">{t.storageMode}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setStorageMode('local')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      storageMode === 'local' 
                        ? 'bg-orange-600 border-orange-500 text-white' 
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    {t.modeLocal}
                  </button>
                  <button 
                    onClick={() => setStorageMode('server')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      storageMode === 'server' 
                        ? 'bg-orange-600 border-orange-500 text-white' 
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    {t.modeServer}
                  </button>
                </div>
              </div>

              {storageMode === 'server' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-neutral-300 mb-1">{t.serverUrl}</label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder={t.serverUrlPlaceholder}
                    className="block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2.5"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Ex: http://192.168.0.10:3001</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
              <Button onClick={() => setIsConfigOpen(false)}>{t.saveConfig}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}