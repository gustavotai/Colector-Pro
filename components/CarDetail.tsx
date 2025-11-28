
import React, { useState } from 'react';
import { Car } from '../types';
import { translations, Language } from '../translations';

interface CarDetailProps {
  car: Car;
  onClose: () => void;
  language: Language;
}

export const CarDetail: React.FC<CarDetailProps> = ({ car, onClose, language }) => {
  const t = translations[language];
  
  // Use images array or fallback to single imageUrl
  const images = car.images && car.images.length > 0 ? car.images : [car.imageUrl];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-neutral-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row border border-neutral-800 relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-neutral-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Image Section */}
        <div className="w-full md:w-2/3 bg-black flex flex-col justify-center relative group">
          <div className="flex-1 flex items-center justify-center p-4">
             <img 
               src={images[currentImageIndex]} 
               alt={`${car.name} view ${currentImageIndex}`} 
               className="max-h-[60vh] md:max-h-[80vh] w-full object-contain"
             />
          </div>
          
          {/* Navigation Arrows (if multiple) */}
          {images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 p-2 px-4 overflow-x-auto scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${currentImageIndex === idx ? 'border-orange-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/3 p-8 flex flex-col bg-neutral-900 border-l border-neutral-800">
           <div className="mb-6">
             <span className="inline-block px-2 py-1 rounded text-xs uppercase tracking-wider font-bold bg-neutral-800 text-orange-500 mb-3 border border-neutral-700">
                {car.category}
             </span>
             <h2 className="text-3xl font-bold text-white mb-2">{car.name}</h2>
             <div className="h-1 w-20 bg-orange-600 rounded"></div>
           </div>

           <div className="space-y-6 flex-1">
             <div className="flex flex-col">
                <span className="text-sm text-neutral-500 uppercase font-semibold">{t.brandLabel}</span>
                <span className="text-xl text-neutral-200">{car.brand || '-'}</span>
             </div>
             
             <div className="flex flex-col">
                <span className="text-sm text-neutral-500 uppercase font-semibold">{t.modelLabel}</span>
                <span className="text-xl text-neutral-200">{car.model || '-'}</span>
             </div>

             <div className="flex flex-col">
                <span className="text-sm text-neutral-500 uppercase font-semibold">{t.added}</span>
                <span className="text-lg text-neutral-400">{new Date(car.dateAdded).toLocaleDateString()}</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
