import React, { useState, useEffect } from 'react';
import { HIGHLIGHT_CLIPS } from '../../data/mockData';
import type { MediaItem } from '../../types';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../../utils/mediaUtils';
import { API_BASE } from '../../config/api';

export const HighlightClips: React.FC = () => {
  const [clips, setClips] = useState<MediaItem[]>(HIGHLIGHT_CLIPS);
  const [playingClip, setPlayingClip] = useState<MediaItem | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/media/clips`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setClips(data);
        }
      })
      .catch(err => {
        console.warn('Usando clips locales:', err);
      });
  }, []);

  const isYouTube = playingClip?.videoUrl && Boolean(extractYouTubeId(playingClip.videoUrl));

  return (
    <div className="mb-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.16em] mb-1">
            <span className="material-symbols-outlined text-sm">movie</span>
            INSTANTES DECISIVOS
          </div>
          <h2 className="font-display text-3xl font-bold uppercase text-white tracking-tight">
            Clips y Mejores Jugadas
          </h2>
          <p className="text-xs text-rayo-bone/60 mt-0.5">
            Golazos, paradas salvadoras, regates de fantasía y celebraciones capturadas al segundo.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-rayo-gold/80 font-medium">
          <span className="material-symbols-outlined text-base">video_library</span>
          {clips.length} Clips Disponibles
        </div>
      </div>

      {/* Grid of Clips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips.map((clip) => (
          <div
            key={clip.id}
            onClick={() => setPlayingClip(clip)}
            className="elite-card rounded-xl overflow-hidden border border-white/[0.08] hover:border-rayo-gold/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-xl"
          >
            {/* Thumbnail with Play Overlay */}
            <div className="relative aspect-video bg-black/40 overflow-hidden">
              <img
                src={clip.imageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'}
                alt={clip.title}
                className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-black/20 to-transparent"></div>

              {/* Tag and Views */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <span className="px-2 py-0.5 rounded bg-rayo-burgundy/90 text-white font-display text-[9px] font-bold uppercase tracking-wider border border-white/10 backdrop-blur-md">
                  {clip.tag}
                </span>
                {clip.views && (
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/80">
                    {clip.views}
                  </span>
                )}
              </div>

              {/* Centered Play Button Icon */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-12 h-12 rounded-full bg-rayo-gold group-hover:bg-rayo-goldLight text-[#07070F] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-2xl font-bold ml-0.5">
                    play_arrow
                  </span>
                </div>
              </div>

              {/* Duration Badge */}
              {clip.duration && (
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-[#07070F]/90 font-mono text-[10px] text-white border border-white/10">
                  {clip.duration}
                </span>
              )}

              {/* Match tag */}
              {clip.match && (
                <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold text-rayo-gold uppercase tracking-wider">
                  {clip.match}
                </span>
              )}
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display text-lg font-bold text-white uppercase leading-snug group-hover:text-rayo-gold transition-colors">
                  {clip.title}
                </h4>
                {clip.description && (
                  <p className="text-xs text-rayo-bone/70 mt-1.5 line-clamp-2 leading-relaxed">
                    {clip.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-xs text-rayo-bone/50">
                <span className="text-[11px] text-rayo-gold flex items-center gap-1 font-medium">
                  Ver jugada completa <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
                <span className="material-symbols-outlined text-sm text-white/40">smart_display</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================= */}
      {/* MODAL REPRODUCTOR DE CLIP                 */}
      {/* ========================================= */}
      {playingClip && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setPlayingClip(null)}
        >
          <div
            className="relative max-w-4xl w-full elite-card rounded-2xl overflow-hidden border border-rayo-gold/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPlayingClip(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-rayo-burgundy text-white flex items-center justify-center border border-white/20 transition-colors"
              aria-label="Cerrar reproductor"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Video Player or Embed */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {isYouTube ? (
                <iframe
                  src={getYouTubeEmbedUrl(playingClip.videoUrl!)}
                  title={playingClip.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : playingClip.videoUrl ? (
                <video
                  src={playingClip.videoUrl}
                  controls
                  autoPlay
                  poster={playingClip.imageUrl}
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <img
                    src={playingClip.imageUrl}
                    alt={playingClip.title}
                    className="w-full h-full object-cover filter brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

                  <div className="absolute z-10 text-center px-4">
                    <span className="material-symbols-outlined text-5xl text-rayo-gold animate-pulse mb-2">
                      play_circle
                    </span>
                    <p className="font-display font-bold text-xl uppercase text-white">
                      {playingClip.title}
                    </p>
                    <p className="text-xs text-rayo-bone/70 mt-1">
                      Reproduciendo en calidad Ultra HD 60 FPS
                    </p>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3 text-xs font-mono text-white">
                    <span>00:15</span>
                    <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rayo-gold h-full" style={{ width: '45%' }}></div>
                    </div>
                    <span>{playingClip.duration || '00:45'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Video Meta Info */}
            <div className="p-6 bg-[#0B0D1F] border-t border-white/[0.08]">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-rayo-burgundy text-white text-[10px] font-bold uppercase tracking-wider">
                  {playingClip.tag}
                </span>
                {playingClip.match && (
                  <span className="text-xs text-rayo-gold font-medium">{playingClip.match}</span>
                )}
                {playingClip.views && (
                  <span className="text-xs text-rayo-bone/50">• {playingClip.views}</span>
                )}
              </div>
              <h3 className="font-display font-bold text-2xl text-white uppercase mt-1">
                {playingClip.title}
              </h3>
              {playingClip.description && (
                <p className="text-sm text-rayo-bone/70 mt-1.5 leading-relaxed">
                  {playingClip.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
