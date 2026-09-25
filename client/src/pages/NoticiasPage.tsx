import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { NewsHeroFeatured } from '../components/news/NewsHeroFeatured';
import { NewsFeed } from '../components/news/NewsFeed';
import { NewsArticleModal } from '../components/news/NewsArticleModal';
import { NEWS_DATA } from '../data/mockData';
import type { NewsArticle } from '../types';
import { API_BASE } from '../config/api';

export const NoticiasPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>(NEWS_DATA);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetch(`${API_BASE}/news`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setArticles(data);
          }
        }
      } catch {
        // Fallback to initial mock
      }
    };
    loadNews();
  }, []);

  // The featured story is the one explicitly flagged as featured, or fallback to first
  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const regularArticles = articles;

  return (
    <div className="min-h-screen bg-rayo-carbon text-rayo-bone selection:bg-rayo-gold selection:text-black">
      <Navbar />

      <main className="pt-20">
        {/* ========================================= */}
        {/* HERO BANNER DE LA SALA DE PRENSA          */}
        {/* ========================================= */}
        <section className="relative py-16 sm:py-24 overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#110e32] via-[#070518] to-rayo-carbon">
          {/* Ambient Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] mb-5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="font-display uppercase tracking-[0.16em] text-xs font-semibold text-rayo-bone/90">
                GABINETE DE PRENSA & COMUNICACIÓN OFICIAL
              </span>
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white leading-none mb-4">
              ACTUALIDAD & <span className="text-champagne-gradient">NOTICIAS</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-rayo-bone/70 leading-relaxed mb-8">
              Partes médicos de lesiones, crónicas completas de cada jornada, comunicados oficiales de la directiva y todas las novedades del Rayo Pelón F7.
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-rayo-bone/70">
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-rose-400 text-sm">medical_services</span>
                Partes Médicos Actualizados
              </span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-rayo-gold text-sm">sports_soccer</span>
                Crónicas Post-partido
              </span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-cyan-400 text-sm">verified</span>
                Resoluciones Oficiales
              </span>
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* CONTENIDO PRINCIPAL DE NOTICIAS           */}
        {/* ========================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* 1. COMUNICADO DESTACADO (PARTE MÉDICO OFICIAL) */}
          {featuredArticle && (
            <NewsHeroFeatured
              article={featuredArticle}
              onReadMore={(article) => setSelectedArticle(article)}
            />
          )}

          {/* 2. FEED GENERAL CON FILTROS Y BUSCADOR */}
          <NewsFeed
            articles={regularArticles}
            onSelectArticle={(article) => setSelectedArticle(article)}
          />

          {/* 3. CALLOUT: CANAL OFICIAL DE AVISOS */}
          <div className="mt-16 elite-gold-card rounded-2xl p-8 border border-rayo-gold/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rayo-gold/20 border border-rayo-gold/40 flex items-center justify-center text-rayo-gold flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">notifications_active</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl uppercase text-white">
                  Canal Oficial de Avisos y Convocatorias
                </h3>
                <p className="text-xs text-rayo-bone/70 mt-0.5">
                  Recibe al instante los partes médicos de última hora y la alineación oficial antes de cada partido.
                </p>
              </div>
            </div>

            <a
              href="/#contacto"
              className="px-6 py-2.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 shadow-md"
            >
              <span className="material-symbols-outlined text-sm">mail</span>
              Contactar con Prensa
            </a>
          </div>

        </div>
      </main>

      {/* MODAL DE LECTURA DE ARTÍCULO COMPLETO */}
      <NewsArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <Footer />
    </div>
  );
};
