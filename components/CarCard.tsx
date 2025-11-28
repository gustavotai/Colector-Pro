
import React from 'react';
import { Car } from '../types';
import { Language, translations } from '../translations';

interface CarCardProps {
  car: Car;
  viewMode: 'grid' | 'strip';
  onDelete: (id: string) => void;
  onEdit: (car: Car) => void;
  onView: (car: Car) => void;
  language: Language;
}

export const CarCard: React.FC<CarCardProps> = ({ car, viewMode, onDelete, onEdit, onView, language }) => {
  const t = translations[language];

  if (viewMode === 'strip') {
    return (
      <div 
        onClick={() => onView(car)}
        className="flex-none w-64 bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-700 group relative snap-center hover:border-orange-500/50 transition-colors cursor-pointer"
      >
        <div className="h-40 w-full bg-black/50 relative">
          <img src={car.imageUrl} alt={car.name} className="w-full h-full object-contain" />
           <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(car); }}
              className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(car.id); }}
              className="bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          {car.images && car.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {car.images.length}
            </div>
          )}
        </div>
        <div className="p-3">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-neutral-700 text-orange-400 mb-2 border border-neutral-600">
            {car.category}
          </span>
          <h3 className="text-base font-bold text-white truncate">{car.name}</h3>
          {(car.brand || car.model) && (
            <p className="text-xs text-neutral-400 truncate">
              {[car.brand, car.model].filter(Boolean).join(' - ')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Grid / Vertical View
  return (
    <div 
      onClick={() => onView(car)}
      className="bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-700 hover:shadow-xl hover:border-orange-500/50 transition-all duration-300 group flex flex-col cursor-pointer"
    >
      <div className="aspect-[4/3] w-full bg-black/50 relative overflow-hidden">
        <img src={car.imageUrl} alt={car.name} className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(car); }}
              className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(car.id); }}
              className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
        </div>
        {car.images && car.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {car.images.length}
            </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <div className="min-w-0 flex-1">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-neutral-700 text-orange-400 mb-1 border border-neutral-600">
              {car.category}
            </span>
            <h3 className="text-base font-bold text-white truncate pr-2" title={car.name}>{car.name}</h3>
          </div>
        </div>
        
        {(car.brand || car.model) ? (
          <p className="text-xs text-neutral-400 truncate mb-2">
             {[car.brand, car.model].filter(Boolean).join(' • ')}
          </p>
        ) : <div className="mb-2"></div>}
        
        <div className="mt-auto pt-2 border-t border-neutral-700">
           <p className="text-[10px] text-neutral-500">
            {t.added}: {new Date(car.dateAdded).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};