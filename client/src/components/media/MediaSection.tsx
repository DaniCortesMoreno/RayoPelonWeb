import React, { useState } from 'react';
import { MEDIA_DATA } from '../../data/mockData';

export const MediaSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fotos' | 'videos'>('fotos');

  const photos = MEDIA_DATA.filter(m => m.type === 'foto');
  const videos = MEDIA_DATA.filter(m => m.type === 'video');

  return (
    <section className="py-20 bg-rayo-navy relative border-t border-white/[0.06]" id="multimedia">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.18em] mb-1.5">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              GALERÍA DEL CLUB
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-white tracking-tight">
              CONTENIDO <span className="text-champagne-gradient">MULTIMEDIA</span>
            </h2>
            <p className="text-xs text-rayo-bone/60 mt-0.5">
              Imágenes de los partidos, celebraciones y clips de las mejores jugadas de la temporada.
            </p>
          </div>

          {/* Tabs Fotos / Videos */}
          <div className="inline-flex p-1 rounded bg-[#07070F] border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('fotos')}
              className={`px-4 py-1.5 rounded text-xs font-display font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'fotos'
                  ? 'bg-rayo-gold text-rayo-carbon shadow-sm'
                  : 'text-rayo-bone/70 hover:text-white'
              }`}
            >
              Fotografías ({photos.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-1.5 rounded text-xs font-display font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'videos'
                  ? 'bg-rayo-gold text-rayo-carbon shadow-sm'
                  : 'text-rayo-bone/70 hover:text-white'
              }`}
            >
              Vídeos & Clips ({videos.length})
            </button>
          </div>
        </div>

        {/* FOTOS CONTAINER */}
        {activeTab === 'fotos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {photos.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg overflow-hidden elite-card border border-white/[0.08] aspect-[16/10] cursor-pointer hover:border-rayo-gold/40 transition-colors"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rayo-carbon via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-3.5 left-4 right-4">
                  <span className="text-[9px] font-semibold text-rayo-gold uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <h4 className="font-display text-base font-bold text-white uppercase mt-0.5">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIDEOS CONTAINER */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {videos.map((item) => (
              <div
                key={item.id}
                className="elite-card rounded-lg overflow-hidden border border-white/[0.08] p-5 group hover:border-rayo-gold/30 transition-colors"
              >
                <div className="relative aspect-video rounded bg-black/40 flex items-center justify-center overflow-hidden mb-3 border border-white/[0.06]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute w-12 h-12 rounded-full bg-rayo-gold flex items-center justify-center text-rayo-carbon shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">play_arrow</span>
                  </div>
                  {item.duration && (
                    <span className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                      {item.duration}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-rayo-gold uppercase tracking-wider">
                  {item.tag}
                </span>
                <h4 className="font-display text-lg font-bold text-white uppercase mt-0.5">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-rayo-bone/60 mt-1">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
