import React, { useEffect, useRef } from 'react';
import type { NewsArticle } from '../../types';
import { formatMediaUrl } from '../../config/api';
import { RichContentRenderer } from './RichContentRenderer';

interface NewsArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({ article, onClose }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll to top whenever article opens or changes
  useEffect(() => {
    if (article && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [article]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!article) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [article, onClose]);

  if (!article) return null;

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'MEDICO':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          accent: 'text-rose-400',
          border: 'border-rose-500/30'
        };
      case 'CRONICA':
        return {
          badge: 'bg-rayo-gold/20 text-rayo-gold border-rayo-gold/40',
          accent: 'text-rayo-gold',
          border: 'border-rayo-gold/30'
        };
      case 'OFICIAL':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          accent: 'text-cyan-400',
          border: 'border-cyan-500/30'
        };
      default:
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          accent: 'text-emerald-400',
          border: 'border-emerald-500/30'
        };
    }
  };

  const theme = getCategoryTheme(article.category);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col elite-card rounded-2xl overflow-hidden border border-white/[0.15] shadow-2xl bg-[#0B0D1F] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Bar with Badge, Meta & Always-Visible Close Button */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 bg-[#0B0D1F]/95 backdrop-blur-md border-b border-white/[0.08] z-20 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-display font-bold uppercase tracking-wider border shrink-0 ${theme.badge}`}>
              {article.categoryLabel}
            </span>
            <span className="text-xs text-rayo-bone/60 truncate font-sans hidden sm:inline">
              {article.publishedAt || article.dateText}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 text-xs text-rayo-bone/60 font-mono mr-2 hidden sm:flex">
              <span className="material-symbols-outlined text-xs">schedule</span>
              <span>{article.readTime} de lectura</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.08] hover:bg-rose-600 hover:text-white text-rayo-bone/80 flex items-center justify-center border border-white/10 transition-all shadow-sm"
              aria-label="Cerrar comunicado"
              title="Cerrar (Esc)"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body with Guaranteed Top Visibility */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto overscroll-contain flex-1 p-5 sm:p-8 space-y-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5A93C #0B0D1F' }}
        >
          {/* Header Cover Banner if available */}
          {article.imageUrl && (
            <div className="relative aspect-[21/9] sm:aspect-[2/1] w-full rounded-xl overflow-hidden bg-black/40 border border-white/[0.08] shadow-lg">
              <img
                src={formatMediaUrl(article.imageUrl)}
                alt={article.title}
                className="w-full h-full object-cover filter brightness-90"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D1F] via-[#0B0D1F]/20 to-transparent"></div>
            </div>
          )}

          {/* Headline */}
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase leading-snug tracking-tight">
            {article.title}
          </h2>

          {/* Author Byline */}
          <div className="flex items-center justify-between py-3 border-y border-white/[0.08] text-xs text-rayo-bone/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-rayo-gold flex-shrink-0">
                <span className="material-symbols-outlined text-base">verified</span>
              </div>
              <div>
                <p className="font-semibold text-white">{article.author}</p>
                <p className="text-[11px] text-rayo-bone/50">{article.authorRole || 'Rayo Pelón F7'}</p>
              </div>
            </div>
            <div className="text-[11px] text-rayo-bone/50 sm:hidden">
              {article.publishedAt || article.dateText}
            </div>
          </div>

          {/* Medical Details Card for Injuries */}
          {article.medicalDetails && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-rose-950/40 via-[#120a1c] to-black/40 border border-rose-500/40 shadow-inner">
              <div className="flex items-center gap-2 text-rose-300 font-display font-bold text-xs uppercase tracking-widest mb-3">
                <span className="material-symbols-outlined text-base">medical_services</span>
                FICHA MÉDICA DE SEGUIMIENTO
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-black/40 border border-white/5">
                  <span className="text-rayo-bone/50 uppercase text-[10px] block">Futbolista Afectado:</span>
                  <span className="font-display font-bold text-white text-sm">
                    {article.medicalDetails.player} (#{article.medicalDetails.dorsal})
                  </span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-white/5">
                  <span className="text-rayo-bone/50 uppercase text-[10px] block">Diagnóstico Clínico:</span>
                  <span className="font-semibold text-rose-300 text-sm">
                    {article.medicalDetails.injury}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-white/5">
                  <span className="text-rayo-bone/50 uppercase text-[10px] block">Tiempo Estimado:</span>
                  <span className="font-semibold text-white">
                    {article.medicalDetails.recoveryTime}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-white/5">
                  <span className="text-rayo-bone/50 uppercase text-[10px] block">Estado Competitivo:</span>
                  <span className="font-bold text-amber-400">
                    ● {article.medicalDetails.currentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Full Rich Article Content */}
          <div className="pt-2">
            <RichContentRenderer content={article.content} />
          </div>

          {/* Club Seal Stamp Footer */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rayo-bone/50">
            <div className="flex items-center gap-3">
              <img src="/escudo.png" alt="Escudo" className="w-8 h-8 object-contain" />
              <span>Gabinete de Comunicación • Rayo Pelón F7</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white font-display text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              Cerrar Noticia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
