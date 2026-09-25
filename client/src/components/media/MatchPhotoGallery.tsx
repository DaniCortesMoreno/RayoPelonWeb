import React, { useState, useEffect, useMemo } from 'react';
import { PHOTO_GALLERY } from '../../data/mockData';
import type { MediaItem } from '../../types';
import { API_BASE } from '../../config/api';

export const MatchPhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<MediaItem[]>(PHOTO_GALLERY);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [lightboxPhoto, setLightboxPhoto] = useState<MediaItem | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/media/gallery`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPhotos(data);
        }
      })
      .catch(err => {
        console.warn('Usando fotos locales:', err);
      });
  }, []);

  const categories = [
    { label: 'Todas las Fotos', value: 'todos' },
    { label: 'En el Campo (Partidos)', value: 'partidos' },
    { label: 'Celebraciones', value: 'celebraciones' },
    { label: 'Vestuario & Piña', value: 'vestuario' },
    { label: 'Entrenamientos', value: 'entrenos' },
  ];

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'todos') return photos;
    return photos.filter((item) => item.category === selectedCategory);
  }, [photos, selectedCategory]);

  return (
    <div className="mb-20">
      {/* Section Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.16em] mb-1">
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            FOTOTECA DE ALTA RESOLUCIÓN
          </div>
          <h2 className="font-display text-3xl font-bold uppercase text-white tracking-tight">
            Galería de Imágenes de los Partidos
          </h2>
          <p className="text-xs text-rayo-bone/60 mt-0.5">
            Capturas exclusivas de nuestras disputas, celebraciones y momentos de vestuario ({photos.length} fotos).
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === cat.value
                  ? 'bg-rayo-gold text-rayo-carbon shadow-md shadow-rayo-gold/20'
                  : 'bg-white/[0.04] text-rayo-bone/70 hover:text-white border border-white/[0.08]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
        {filteredPhotos.map((item) => (
          <div
            key={item.id}
            onClick={() => setLightboxPhoto(item)}
            className="group relative rounded-xl overflow-hidden elite-card border border-white/[0.08] aspect-[4/3] cursor-pointer hover:border-rayo-gold/50 transition-all duration-300 shadow-lg"
          >
            {/* Image with zoom effect */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-transparent to-transparent opacity-90 group-hover:opacity-95 transition-opacity"></div>

            {/* Top Tag & Zoom Icon */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-bold text-rayo-gold uppercase tracking-wider border border-white/10">
                {item.tag}
              </span>
              <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 group-hover:text-rayo-gold group-hover:bg-rayo-gold/20 transition-all">
                <span className="material-symbols-outlined text-sm">zoom_in</span>
              </div>
            </div>

            {/* Caption Bottom */}
            <div className="absolute bottom-3 left-3.5 right-3.5 z-10">
              {item.date && (
                <span className="text-[10px] font-mono text-rayo-bone/50 block mb-0.5">
                  {item.date}
                </span>
              )}
              <h4 className="font-display text-sm font-bold text-white uppercase leading-snug group-hover:text-rayo-gold transition-colors truncate">
                {item.title}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12 elite-card rounded-xl border border-white/10">
          <p className="text-xs text-rayo-bone/60">No se encontraron fotografías en esta categoría.</p>
        </div>
      )}

      {/* ========================================= */}
      {/* LIGHTBOX MODAL PARA FOTO EN PANTALLA COMPLETA */}
      {/* ========================================= */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full elite-card rounded-2xl overflow-hidden border border-rayo-gold/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-rayo-burgundy text-white flex items-center justify-center border border-white/20 transition-colors"
              aria-label="Cerrar vista previa"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Photo Large Container */}
            <div className="relative aspect-[16/10] bg-black">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Photo Caption Bar */}
            <div className="p-6 bg-[#0B0D1F] border-t border-white/[0.08]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-rayo-gold/20 text-rayo-gold font-bold text-[10px] uppercase tracking-wider">
                  {lightboxPhoto.tag}
                </span>
                {lightboxPhoto.date && (
                  <span className="text-xs text-rayo-bone/50">{lightboxPhoto.date}</span>
                )}
              </div>
              <h3 className="font-display font-bold text-2xl text-white uppercase">
                {lightboxPhoto.title}
              </h3>
              {lightboxPhoto.description && (
                <p className="text-sm text-rayo-bone/70 mt-1.5 leading-relaxed">
                  {lightboxPhoto.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
