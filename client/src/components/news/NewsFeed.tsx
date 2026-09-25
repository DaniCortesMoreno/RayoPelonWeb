import React, { useState, useMemo } from 'react';
import type { NewsArticle, NewsCategory } from '../../types';

interface NewsFeedProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ articles, onSelectArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { label: 'Todas las Noticias', value: 'ALL', icon: 'feed' },
    { label: 'Partes Médicos', value: 'MEDICO', icon: 'medical_services' },
    { label: 'Crónicas', value: 'CRONICA', icon: 'sports_soccer' },
    { label: 'Comunicados Oficiales', value: 'OFICIAL', icon: 'verified' },
    { label: 'Novedades & Fichajes', value: 'NOVEDAD', icon: 'campaign' },
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCat =
        selectedCategory === 'ALL' || article.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  const getCategoryStyles = (category: NewsCategory) => {
    switch (category) {
      case 'MEDICO':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          hoverBorder: 'hover:border-rose-400/50',
          titleHover: 'group-hover:text-rose-300'
        };
      case 'CRONICA':
        return {
          badge: 'bg-rayo-gold/10 text-rayo-gold border-rayo-gold/30',
          hoverBorder: 'hover:border-rayo-gold/50',
          titleHover: 'group-hover:text-rayo-gold'
        };
      case 'OFICIAL':
        return {
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          hoverBorder: 'hover:border-cyan-400/50',
          titleHover: 'group-hover:text-cyan-300'
        };
      case 'NOVEDAD':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          hoverBorder: 'hover:border-emerald-400/50',
          titleHover: 'group-hover:text-emerald-300'
        };
    }
  };

  return (
    <div>
      {/* Controls: Category Pills and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.value
                  ? 'bg-rayo-gold text-rayo-carbon shadow-md shadow-rayo-gold/20'
                  : 'bg-white/[0.04] text-rayo-bone/70 hover:text-white border border-white/[0.08]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-rayo-bone/40 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar noticias o comunicados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:outline-none focus:border-rayo-gold/50 text-white placeholder-rayo-bone/40 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => {
            const styles = getCategoryStyles(article.category);
            return (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className={`elite-card rounded-2xl overflow-hidden border border-white/[0.08] p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group shadow-lg ${styles.hoverBorder}`}
              >
                <div>
                  {/* Thumbnail if provided */}
                  {article.imageUrl && (
                    <div className="relative aspect-[16/9] -mx-6 -mt-6 mb-5 overflow-hidden bg-black/40">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D1F] via-transparent to-transparent"></div>
                      <span className={`absolute bottom-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border backdrop-blur-md ${styles.badge}`}>
                        {article.categoryLabel}
                      </span>
                    </div>
                  )}

                  {/* Header without image */}
                  {!article.imageUrl && (
                    <div className="flex items-center justify-between mb-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${styles.badge}`}>
                        {article.categoryLabel}
                      </span>
                      <span className="text-[11px] text-rayo-bone/50">{article.dateText}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={`font-display text-xl font-bold text-white uppercase leading-snug transition-colors ${styles.titleHover}`}>
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-rayo-bone/70 mt-2.5 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Medical Chip preview if present */}
                  {article.medicalDetails && (
                    <div className="mt-3.5 p-2 rounded bg-rose-950/20 border border-rose-500/20 text-[11px] flex items-center justify-between">
                      <span className="text-rose-300 font-semibold">{article.medicalDetails.player}</span>
                      <span className="text-amber-400 font-medium">● {article.medicalDetails.currentStatus}</span>
                    </div>
                  )}
                </div>

                {/* Footer Byline & Action */}
                <div className="pt-5 border-t border-white/[0.06] mt-6 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-rayo-bone/80 font-medium block">{article.author}</span>
                    <span className="text-[10px] text-rayo-bone/40">{article.readTime} de lectura</span>
                  </div>

                  <span className="text-rayo-gold flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform">
                    Leer <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-rayo-bone/50 text-xs">
            No se han encontrado noticias o comunicados para el criterio de búsqueda seleccionado.
          </div>
        )}
      </div>
    </div>
  );
};
