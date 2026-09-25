import React from 'react';
import type { NewsArticle } from '../../types';

interface NewsHeroFeaturedProps {
  article: NewsArticle;
  onReadMore: (article: NewsArticle) => void;
}

export const NewsHeroFeatured: React.FC<NewsHeroFeaturedProps> = ({ article, onReadMore }) => {
  return (
    <div
      onClick={() => onReadMore(article)}
      className="elite-card rounded-2xl overflow-hidden border border-rose-500/40 hover:border-rose-400 transition-all duration-300 shadow-2xl mb-14 cursor-pointer group relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        {/* Cover Image (7 Cols) */}
        <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] bg-black/60 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover filter brightness-85 group-hover:scale-105 group-hover:brightness-95 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-black/40 to-transparent"></div>

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white font-display text-[10px] font-bold uppercase tracking-widest border border-rose-400/40 shadow-lg backdrop-blur-md">
              COMUNICADO DESTACADO
            </span>
            <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-xs font-mono text-white/90">
              {article.dateText}
            </span>
          </div>

          {/* Medical Chip if medical */}
          {article.medicalDetails && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="p-3 rounded-xl bg-black/80 backdrop-blur-md border border-rose-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-400 text-lg">medical_services</span>
                  <div>
                    <span className="text-white font-bold block">{article.medicalDetails.player}</span>
                    <span className="text-[11px] text-rose-300">{article.medicalDetails.injury}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {article.medicalDetails.currentStatus}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Details (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0B0D1F] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                {article.categoryLabel}
              </span>
              <span className="text-xs text-rayo-bone/50">• {article.readTime} de lectura</span>
            </div>

            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase leading-tight group-hover:text-rose-300 transition-colors">
              {article.title}
            </h2>

            <p className="text-xs sm:text-sm text-rayo-bone/70 mt-3 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-6 border-t border-white/[0.08] mt-6 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-semibold text-white block">{article.author}</span>
              <span className="text-[11px] text-rayo-bone/50">{article.authorRole}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onReadMore(article);
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-rose-900/40"
            >
              Leer Parte Oficial <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
