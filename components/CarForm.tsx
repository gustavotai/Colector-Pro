
import React, { useState, useRef, useEffect } from 'react';
import { Car, CarCategory } from '../types';
import { Button } from './Button';
import { editCarImage } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { translations, Language } from '../translations';

interface CarFormProps {
  onSave: (car: Car) => void;
  onCancel: () => void;
  language: Language;
  initialCar?: Car;
}

export const CarForm: React.FC<CarFormProps> = ({ onSave, onCancel, language, initialCar }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<CarCategory>(CarCategory.MUSCLE);
  
  // Image State
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Initialize form if editing
  useEffect(() => {
    if (initialCar) {
      setName(initialCar.name);
      setBrand(initialCar.brand || '');
      setModel(initialCar.model || '');
      setCategory(initialCar.category as CarCategory);
      
      // Handle legacy data or new data
      if (initialCar.images && initialCar.images.length > 0) {
        setImages(initialCar.images);
      } else if (initialCar.imageUrl) {
        setImages([initialCar.imageUrl]);
      }
    }
  }, [initialCar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      let processedCount = 0;

      Array.from(files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          setError(t.errorFile);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          processedCount++;
          if (processedCount === files.length) {
            setImages(prev => [...prev, ...newImages]);
            setError(null);
            // Select the first of the newly added if none were selected
            if (images.length === 0) setSelectedImageIndex(0);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (selectedImageIndex >= newImages.length) {
      setSelectedImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handleAiEdit = async () => {
    const currentImage = images[selectedImageIndex];
    if (!currentImage || !aiPrompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const editedImage = await editCarImage(currentImage, aiPrompt);
      
      // Update the specific image in the array
      const newImages = [...images];
      newImages[selectedImageIndex] = editedImage;
      setImages(newImages);
      
      setAiPrompt(''); // Clear prompt on success
    } catch (err) {
      setError(t.errorGen);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || images.length === 0) {
      setError(t.errorReq);
      return;
    }

    const carData: Car = {
      id: initialCar ? initialCar.id : uuidv4(),
      name,
      brand: brand.trim(),
      model: model.trim(),
      category,
      imageUrl: images[0], // Main thumbnail is always first
      images: images,
      dateAdded: initialCar ? initialCar.dateAdded : Date.now()
    };

    onSave(carData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-neutral-800 scrollbar-hide">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {initialCar ? t.formTitleEdit : t.formTitle}
            </h2>
            <button onClick={onCancel} className="text-neutral-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Gallery Section */}
            <div className="space-y-4">
              
              {/* Main Preview */}
              <div className="flex flex-col items-center justify-center border border-neutral-700 rounded-lg p-2 bg-neutral-800/50 min-h-[250px] relative">
                {images.length > 0 ? (
                  <>
                     <img 
                      src={images[selectedImageIndex]} 
                      alt="Preview" 
                      className="max-h-[40vh] w-auto max-w-full object-contain rounded-lg shadow-lg" 
                     />
                     <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {selectedImageIndex === 0 ? t.mainPhoto : `${selectedImageIndex + 1} / ${images.length}`}
                     </div>
                  </>
                ) : (
                  <div className="text-center py-12 w-full cursor-pointer hover:bg-neutral-800 transition-colors rounded-lg" onClick={() => fileInputRef.current?.click()}>
                    <svg className="mx-auto h-12 w-12 text-neutral-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-neutral-400">{t.uploadText}</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-neutral-600 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 hover:text-orange-500 text-neutral-400 transition-colors bg-neutral-800"
                 >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[10px] font-bold">{t.addMorePhotos}</span>
                 </button>
                 
                 {images.map((img, idx) => (
                   <div 
                      key={idx} 
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${selectedImageIndex === idx ? 'border-orange-500' : 'border-transparent'}`}
                      onClick={() => setSelectedImageIndex(idx)}
                   >
                     <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                     <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl hover:bg-red-700"
                     >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                     {idx === 0 && (
                       <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] text-center py-0.5">MAIN</div>
                     )}
                   </div>
                 ))}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />

              {/* AI Edit Section */}
              {images.length > 0 && (
                <div className="bg-neutral-800 border border-orange-900/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-orange-500 font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t.aiEditorTitle}
                  </div>
                  <p className="text-sm text-neutral-400">
                    {t.aiEditorDesc}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={t.aiPlaceholder}
                      className="flex-1 bg-neutral-900 border-neutral-700 rounded-md focus:ring-orange-500 focus:border-orange-500 text-white placeholder-neutral-500 p-2 text-sm"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAiEdit} 
                      disabled={!aiPrompt || isGenerating}
                      isLoading={isGenerating}
                      className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
                    >
                      {t.generate}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">{t.nameLabel}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2.5"
                  placeholder="e.g., '67 Camaro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">{t.brandLabel}</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2.5"
                  placeholder="e.g., Hot Wheels"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">{t.modelLabel}</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2.5"
                  placeholder="e.g., Twin Mill"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">{t.categoryLabel}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CarCategory)}
                  className="block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2.5"
                >
                  {Object.values(CarCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-900 p-3 rounded flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
              <Button type="button" variant="secondary" onClick={onCancel}>{t.cancel}</Button>
              <Button type="submit">{initialCar ? t.update : t.save}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};