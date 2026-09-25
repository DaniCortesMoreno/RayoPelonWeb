import React from 'react';
import type { NewsArticle } from '../../types';

interface NewsArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({ article, onClose }) => {
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
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full elite-card rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl my-8 bg-[#0B0D1F]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover Banner if available */}
        {article.imageUrl && (
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-black/40">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover filter brightness-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D1F] via-[#0B0D1F]/50 to-transparent"></div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-rayo-burgundy text-white flex items-center justify-center border border-white/20 transition-colors shadow-lg"
          aria-label="Cerrar comunicado"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Category & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider border ${theme.badge}`}>
              {article.categoryLabel}
            </span>
            <div className="flex items-center gap-2 text-xs text-rayo-bone/60">
              <span>{article.publishedAt || article.dateText}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-xs">schedule</span>
                {article.readTime} de lectura
              </span>
            </div>
          </div>

          {/* Headline */}
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase leading-snug tracking-tight mb-4">
            {article.title}
          </h2>

          {/* Author Byline */}
          <div className="flex items-center gap-3 py-3 border-y border-white/[0.08] mb-6 text-xs text-rayo-bone/70">
            <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-rayo-gold flex-shrink-0">
              <span className="material-symbols-outlined text-base">verified</span>
            </div>
            <div>
              <p className="font-semibold text-white">{article.author}</p>
              <p className="text-[11px] text-rayo-bone/50">{article.authorRole || 'Rayo Pelón F7'}</p>
            </div>
          </div>

          {/* Medical Details Card for Injuries */}
          {article.medicalDetails && (
            <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-rose-950/40 via-[#120a1c] to-black/40 border border-rose-500/40 shadow-inner">
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

          {/* Article Full Paragraphs */}
          <div className="space-y-4 text-sm text-rayo-bone/80 leading-relaxed font-sans">
            {article.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Club Seal Stamp Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rayo-bone/50">
            <div className="flex items-center gap-3">
              <img src="/escudo.png" alt="Escudo" className="w-8 h-8 object-contain" />
              <span>Gabinete de Comunicación • Rayo Pelón F7</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white font-display text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cerrar Noticia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
