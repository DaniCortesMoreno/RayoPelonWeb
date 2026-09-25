import React, { useState, useEffect } from 'react';
import { LAST_MATCH_RECAP } from '../../data/mockData';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../../utils/mediaUtils';
import { API_BASE } from '../../config/api';

export const FeaturedMatchVideo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'cronica' | 'goles' | 'estadisticas'>('goles');
  const [recap, setRecap] = useState<any>(LAST_MATCH_RECAP);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/media/featured-match`)
      .then(res => res.json())
      .then(data => {
        if (data && data.homeTeam) {
          setRecap(data);
        }
      })
      .catch(err => {
        console.warn('Usando datos locales para el partido destacado:', err);
      });
  }, []);

  const carouselImages: string[] = recap.carouselImages && recap.carouselImages.length > 0
    ? recap.carouselImages
    : [recap.videoThumbnail || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=675&q=80'];

  const isCarousel = recap.mediaType === 'carousel';
  const isYouTube = recap.videoUrl && Boolean(extractYouTubeId(recap.videoUrl));

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="elite-card rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl mb-16">
      {/* Match Header Badge */}
      <div className="bg-[#0A0A16] px-6 py-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-display font-semibold uppercase tracking-[0.16em] text-emerald-400">
            ÚLTIMO COMPROMISO DISPUTADO (J{recap.matchday || 13})
          </span>
          <span className="text-xs text-white/30">•</span>
          <span className="text-xs text-rayo-bone/60 font-medium">{recap.date}</span>
        </div>
        <div className="text-xs text-rayo-gold/80 flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {recap.location}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Big Media Player / Carousel (8 Cols) */}
        <div className="lg:col-span-8 relative bg-black/80 aspect-video flex items-center justify-center overflow-hidden group">
          {/* ========================================= */}
          {/* 1. MODO CARRUSEL DE FOTOS (SI NO HAY VÍDEO) */}
          {/* ========================================= */}
          {isCarousel ? (
            <div className="relative w-full h-full">
              <img
                src={carouselImages[currentSlide]}
                alt={`Foto de la jornada ${currentSlide + 1}`}
                className="w-full h-full object-cover filter brightness-90 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-transparent to-black/30"></div>

              {/* Carousel Top Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full bg-rayo-burgundy/90 text-white font-display text-[10px] font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-rayo-gold">photo_library</span>
                  CARRUSEL DE LA JORNADA
                </span>
                <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1 border border-white/10">
                  {currentSlide + 1} / {carouselImages.length}
                </span>
              </div>

              {/* Prev / Next Slide Controls */}
              {carouselImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    aria-label="Foto anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-rayo-gold hover:text-black text-white flex items-center justify-center transition-colors border border-white/10 backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Foto siguiente"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-rayo-gold hover:text-black text-white flex items-center justify-center transition-colors border border-white/10 backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_right</span>
                  </button>
                </>
              )}

              {/* Bottom Caption & Slide Dots */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold text-rayo-gold uppercase tracking-wider">
                    Galería Oficial del Partido
                  </p>
                  <h3 className="font-display text-xl font-bold text-white uppercase mt-0.5 filter drop-shadow">
                    Los mejores instantes de la Jornada {recap.matchday || 13}
                  </h3>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center gap-1.5">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === idx ? 'w-6 bg-rayo-gold' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Ir a foto ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================= */
            /* 2. MODO VÍDEO (YOUTUBE O ARCHIVO MP4)      */
            /* ========================================= */
            <>
              {!isPlaying ? (
                <>
                  <img
                    src={recap.videoThumbnail || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=675&q=80'}
                    alt={recap.videoTitle}
                    className="w-full h-full object-cover filter brightness-85 contrast-105 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-black/30 to-black/20"></div>

                  {/* Overlay Info Header */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-full bg-rayo-burgundy/90 text-white font-display text-[10px] font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md">
                      RESUMEN COMPLETO HD
                    </span>
                    <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1 border border-white/10">
                      <span className="material-symbols-outlined text-xs text-rayo-gold">visibility</span>
                      {recap.views || '1.8K visualizaciones'}
                    </span>
                  </div>

                  {/* Center Interactive Play Button */}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="relative z-10 w-20 h-20 rounded-full bg-rayo-gold hover:bg-rayo-goldLight text-[#07070F] flex items-center justify-center shadow-[0_0_40px_rgba(197,160,89,0.5)] transform group-hover:scale-110 transition-all duration-300"
                    aria-label="Reproducir resumen del partido"
                  >
                    <span className="material-symbols-outlined text-4xl font-bold ml-1">
                      play_arrow
                    </span>
                  </button>

                  {/* Bottom Title & Duration */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
                    <div>
                      {recap.mvp && (
                        <p className="text-xs font-semibold text-rayo-gold uppercase tracking-wider">
                          MVP: {recap.mvp}
                        </p>
                      )}
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-white uppercase mt-0.5 filter drop-shadow">
                        {recap.videoTitle}
                      </h3>
                    </div>
                    {recap.videoDuration && (
                      <span className="px-2.5 py-1 rounded bg-[#07070F]/90 font-mono text-xs text-white border border-white/15">
                        {recap.videoDuration}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                /* REPRODUCTOR ACTIVO: YOUTUBE IFRAME O VIDEO HTML5 */
                <div className="relative w-full h-full bg-black flex items-center justify-center animate-fadeIn">
                  {isYouTube ? (
                    <iframe
                      src={getYouTubeEmbedUrl(recap.videoUrl)}
                      title={recap.videoTitle}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : recap.videoUrl ? (
                    <video
                      src={recap.videoUrl}
                      controls
                      autoPlay
                      poster={recap.videoThumbnail}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="relative z-10 p-6 max-w-md mx-auto text-center bg-[#07070F]/90 backdrop-blur-md rounded-xl border border-rayo-gold/40">
                      <span className="material-symbols-outlined text-4xl text-rayo-gold mb-2">
                        movie
                      </span>
                      <h4 className="font-display font-bold text-lg text-white uppercase">
                        {recap.videoTitle}
                      </h4>
                      <p className="text-xs text-rayo-bone/70 mt-1">
                        Vídeo en proceso de codificación para la jornada {recap.matchday}.
                      </p>
                    </div>
                  )}

                  {/* Close Video Playback Button */}
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider border border-white/20 flex items-center gap-1 backdrop-blur-md"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                    Cerrar Reproductor
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Scoreline & Match Timeline (4 Cols) */}
        <div className="lg:col-span-4 p-6 bg-[#0B0D1F] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/[0.08]">
          {/* Score Box */}
          <div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-rayo-gold/[0.12] via-rayo-navy to-rayo-burgundy/[0.15] border border-rayo-gold/30 mb-5 text-center">
              <span className="text-[10px] font-display font-bold text-rayo-gold uppercase tracking-widest block mb-2">
                RESULTADO FINAL
              </span>
              <div className="flex items-center justify-center gap-4">
                <div className="text-right flex-1">
                  <span className="font-display font-bold text-sm sm:text-base text-white block">
                    {recap.homeTeam.name}
                  </span>
                  <span className="text-[10px] text-rayo-gold uppercase font-semibold">Local</span>
                </div>
                <div className="px-3.5 py-1 rounded-lg bg-[#07070F] border border-rayo-gold/40 shadow-inner">
                  <span className="font-display font-bold text-3xl text-rayo-gold">
                    {recap.homeTeam.score} - {recap.awayTeam.score}
                  </span>
                </div>
                <div className="text-left flex-1">
                  <span className="font-display font-bold text-sm sm:text-base text-white/90 block">
                    {recap.awayTeam.name}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase font-semibold">Visitante</span>
                </div>
              </div>
            </div>

            {/* Sub-tabs: Goles / Estadísticas */}
            <div className="flex border-b border-white/[0.08] mb-4">
              <button
                onClick={() => setActiveTab('goles')}
                className={`flex-1 pb-2.5 text-xs font-display font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'goles'
                    ? 'border-rayo-gold text-rayo-gold'
                    : 'border-transparent text-rayo-bone/60 hover:text-white'
                }`}
              >
                Cronología de Goles
              </button>
              <button
                onClick={() => setActiveTab('estadisticas')}
                className={`flex-1 pb-2.5 text-xs font-display font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'estadisticas'
                    ? 'border-rayo-gold text-rayo-gold'
                    : 'border-transparent text-rayo-bone/60 hover:text-white'
                }`}
              >
                Estadísticas
              </button>
            </div>

            {/* Timeline Events */}
            {activeTab === 'goles' ? (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {recap.timeline?.map((event: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${
                      event.team === 'rayo'
                        ? 'bg-white/[0.02] border-rayo-gold/30 hover:border-rayo-gold/60'
                        : 'bg-white/[0.01] border-white/[0.06] opacity-80'
                    }`}
                  >
                    <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-rayo-gold/20 text-rayo-gold">
                      {event.minute}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-medium truncate">{event.player}</strong>
                        <span
                          className={`text-[9px] font-bold px-1 rounded uppercase ${
                            String(event.type).includes('GOL')
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {event.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-rayo-bone/70 mt-0.5 leading-snug">{event.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Match Telemetry Stats */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rayo-gold">{recap.stats?.shots?.home ?? 16}</span>
                  <span className="text-[11px] text-rayo-bone/60 uppercase">Tiros Totales</span>
                  <span className="font-bold text-white/70">{recap.stats?.shots?.away ?? 8}</span>
                </div>
                <div className="w-full bg-[#07070F] h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-rayo-gold h-full" style={{ width: '66%' }}></div>
                  <div className="bg-white/20 h-full" style={{ width: '34%' }}></div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-rayo-gold">{recap.stats?.possession?.home ?? '58%'}</span>
                  <span className="text-[11px] text-rayo-bone/60 uppercase">Posesión Balón</span>
                  <span className="font-bold text-white/70">{recap.stats?.possession?.away ?? '42%'}</span>
                </div>
                <div className="w-full bg-[#07070F] h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-rayo-gold h-full" style={{ width: '58%' }}></div>
                  <div className="bg-white/20 h-full" style={{ width: '42%' }}></div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-rayo-gold">{recap.stats?.corners?.home ?? 7}</span>
                  <span className="text-[11px] text-rayo-bone/60 uppercase">Córners</span>
                  <span className="font-bold text-white/70">{recap.stats?.corners?.away ?? 3}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-rayo-gold">{recap.stats?.fouls?.home ?? 5}</span>
                  <span className="text-[11px] text-rayo-bone/60 uppercase">Faltas Cometidas</span>
                  <span className="font-bold text-white/70">{recap.stats?.fouls?.away ?? 9}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-rayo-bone/50">
            <span>Rayo Pelón F7 Official Broadcast</span>
            <span className="text-emerald-400 font-semibold">● 3 Puntos Asegurados</span>
          </div>
        </div>
      </div>
    </div>
  );
};
