import React, { useState, useEffect } from 'react';
import { NEWS_DATA } from '../../data/mockData';
import type { NewsArticle, NewsCategory } from '../../types';
import { API_BASE } from '../../config/api';

export const NewsSection: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsArticle[]>(NEWS_DATA);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetch(`${API_BASE}/news`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setNewsList(data);
          }
        }
      } catch {
        // Fallback
      }
    };
    loadNews();
  }, []);

  const filteredNews = selectedCat === 'ALL'
    ? newsList
    : newsList.filter(n => n.category === selectedCat);

  const categories: { label: string; value: string }[] = [
    { label: 'Todas', value: 'ALL' },
    { label: 'Partes Médicos', value: 'MEDICO' },
    { label: 'Crónicas', value: 'CRONICA' },
    { label: 'Comunicados Oficiales', value: 'OFICIAL' },
    { label: 'Novedades & Fichajes', value: 'NOVEDAD' },
  ];

  const getCategoryStyles = (category: NewsCategory) => {
    switch (category) {
      case 'MEDICO':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          hoverBorder: 'hover:border-rose-400/40',
          titleHover: 'hover:text-rose-400'
        };
      case 'CRONICA':
        return {
          badge: 'bg-rayo-gold/10 text-rayo-gold border-rayo-gold/20',
          hoverBorder: 'hover:border-rayo-gold/40',
          titleHover: 'hover:text-rayo-gold'
        };
      case 'OFICIAL':
        return {
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          hoverBorder: 'hover:border-cyan-400/40',
          titleHover: 'hover:text-cyan-300'
        };
      case 'NOVEDAD':
      default:
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          hoverBorder: 'hover:border-emerald-400/40',
          titleHover: 'hover:text-emerald-300'
        };
    }
  };

  return (
    <section className="py-20 bg-rayo-carbon relative border-t border-white/[0.06]" id="noticias">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.18em] mb-1.5">
              <span className="material-symbols-outlined text-sm">newspaper</span>
              ACTUALIDAD & COMUNICADOS
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-white tracking-tight">
              BOLETÍN <span className="text-champagne-gradient">INFORMATIVO</span>
            </h2>
            <p className="text-xs text-rayo-bone/60 mt-0.5">
              Últimas crónicas, partes médicos oficiales y avisos del club.
            </p>
          </div>

          {/* News Category Filters */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCat(cat.value)}
                className={`px-3 py-1 rounded text-xs font-display font-semibold uppercase tracking-wider transition-all ${
                  selectedCat === cat.value
                    ? 'bg-rayo-gold text-rayo-carbon shadow-sm'
                    : 'bg-white/[0.04] text-rayo-bone/80 hover:text-white border border-white/[0.08]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredNews.map((article) => {
            const styles = getCategoryStyles(article.category);
            return (
              <article
                key={article.id}
                className={`news-card elite-card rounded-lg p-6 border border-white/[0.08] flex flex-col justify-between transition-colors ${styles.hoverBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${styles.badge}`}
                    >
                      {article.categoryLabel}
                    </span>
                    <span className="text-[11px] text-rayo-bone/50">
                      {article.dateText} • {article.readTime}
                    </span>
                  </div>
                  <h3
                    className={`font-display text-xl font-bold text-white uppercase leading-snug transition-colors cursor-pointer ${styles.titleHover}`}
                  >
                    {article.title}
                  </h3>
                  <p className="text-xs text-rayo-bone/70 mt-2.5 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-5 border-t border-white/[0.06] mt-5 flex items-center justify-between text-xs">
                  <span className="text-rayo-gold/90 text-xs font-medium">
                    {article.author}
                  </span>
                  <span className="material-symbols-outlined text-sm text-rayo-bone/40">
                    arrow_forward
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
