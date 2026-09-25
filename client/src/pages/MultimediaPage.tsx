import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FeaturedMatchVideo } from '../components/media/FeaturedMatchVideo';
import { MatchPhotoGallery } from '../components/media/MatchPhotoGallery';
import { HighlightClips } from '../components/media/HighlightClips';
import { CLUB_INFO } from '../data/mockData';

export const MultimediaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-rayo-carbon text-rayo-bone selection:bg-rayo-gold selection:text-black">
      <Navbar />

      <main className="pt-20">
        {/* ========================================= */}
        {/* HERO BANNER DE LA PÁGINA MULTIMEDIA       */}
        {/* ========================================= */}
        <section className="relative py-16 sm:py-24 overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#110e32] via-[#070518] to-rayo-carbon">
          {/* Ambient Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-rayo-gold/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] mb-5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-rayo-gold animate-pulse"></span>
              <span className="font-display uppercase tracking-[0.16em] text-xs font-semibold text-rayo-bone/90">
                PRODUCCIÓN AUDIOVISUAL • TEMPORADA 26/27
              </span>
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white leading-none mb-4">
              ZONA <span className="text-champagne-gradient">MULTIMEDIA</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-rayo-bone/70 leading-relaxed mb-8">
              Vive desde dentro la intensidad del {CLUB_INFO.name}. Resúmenes completos de cada jornada, las mejores fotos sobre el césped y los clips más espectaculares de la Liga.
            </p>

            {/* Quick anchors */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#resumen"
                className="px-4 py-2 rounded-lg bg-rayo-gold text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider hover:bg-rayo-goldLight transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">play_circle</span>
                Último Partido
              </a>
              <a
                href="#galeria"
                className="px-4 py-2 rounded-lg bg-white/[0.06] text-white border border-white/10 font-display text-xs font-bold uppercase tracking-wider hover:border-rayo-gold/50 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">photo_library</span>
                Galería de Fotos
              </a>
              <a
                href="#clips"
                className="px-4 py-2 rounded-lg bg-white/[0.06] text-white border border-white/10 font-display text-xs font-bold uppercase tracking-wider hover:border-rayo-gold/50 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">movie</span>
                Clips y Golazos
              </a>
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* CONTENIDO PRINCIPAL: 1. RESUMEN 2. FOTOS 3. CLIPS */}
        {/* ========================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* 1. ARRIBA: RESUMEN DEL ÚLTIMO PARTIDO */}
          <div id="resumen">
            <FeaturedMatchVideo />
          </div>

          {/* 2. LUEGO: GALERÍA DE IMÁGENES DE LOS PARTIDOS */}
          <div id="galeria">
            <MatchPhotoGallery />
          </div>

          {/* 3. LUEGO: CLIPS Y MEJORES JUGADAS */}
          <div id="clips">
            <HighlightClips />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
