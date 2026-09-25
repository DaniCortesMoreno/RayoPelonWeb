import React, { useState, useEffect } from 'react';
import type { NewsArticle, NewsCategory, MedicalDetails, Player } from '../../types';
import { NEWS_DATA, INITIAL_PLAYERS } from '../../data/mockData';
import { getAuthHeaders } from '../../context/AuthContext';
import { NewsArticleModal } from '../news/NewsArticleModal';

import { API_BASE } from '../../config/api';

const CATEGORIES_CONFIG: {
  key: NewsCategory;
  title: string;
  subtitle: string;
  icon: string;
  badgeClass: string;
  borderClass: string;
  accentClass: string;
  label: string;
}[] = [
  {
    key: 'MEDICO',
    title: 'Partes Médicos',
    subtitle: 'Informes de lesiones, ecografías y seguimiento médico',
    icon: 'medical_services',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    borderClass: 'border-rose-500/30 hover:border-rose-400',
    accentClass: 'text-rose-400',
    label: 'PARTE MÉDICO OFICIAL'
  },
  {
    key: 'CRONICA',
    title: 'Crónicas',
    subtitle: 'Análisis detallado post-partido y pretemporada',
    icon: 'sports_soccer',
    badgeClass: 'bg-rayo-gold/20 text-rayo-gold border-rayo-gold/40',
    borderClass: 'border-rayo-gold/30 hover:border-rayo-gold',
    accentClass: 'text-rayo-gold',
    label: 'CRÓNICA DE PARTIDO'
  },
  {
    key: 'OFICIAL',
    title: 'Comunicados Oficiales',
    subtitle: 'Resoluciones de la Junta Directiva e institucionales',
    icon: 'verified',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    borderClass: 'border-cyan-500/30 hover:border-cyan-400',
    accentClass: 'text-cyan-400',
    label: 'COMUNICADO OFICIAL'
  },
  {
    key: 'NOVEDAD',
    title: 'Novedades & Fichajes',
    subtitle: 'Nuevas incorporaciones, cuerpo técnico y eventos',
    icon: 'person_add',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderClass: 'border-emerald-500/30 hover:border-emerald-400',
    accentClass: 'text-emerald-400',
    label: 'NOVEDADES & FICHAJES'
  }
];

const PRESET_IMAGES: { label: string; url: string }[] = [
  {
    label: 'Césped & Balón Nocturno',
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80'
  },
  {
    label: 'Celebración y Partido F7',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80'
  },
  {
    label: 'Estadio y Luces de Foco',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80'
  },
  {
    label: 'Tácticas & Vestuario',
    url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80'
  },
  {
    label: 'Entrenamiento & Botas',
    url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1000&q=80'
  }
];

const MEDICAL_STATUS_OPTIONS: MedicalDetails['currentStatus'][] = [
  'Evolución favorable',
  'Baja confirmada',
  'Alta médica',
  'Duda hasta última hora'
];

export const AdminNewsManager: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>(NEWS_DATA);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<NewsArticle | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState<NewsCategory>('OFICIAL');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formPublishedAt, setFormPublishedAt] = useState<string>('');
  const [formDateText, setFormDateText] = useState<string>('Hoy');
  const [formReadTime, setFormReadTime] = useState<string>('3 min');
  const [formAuthor, setFormAuthor] = useState<string>('Gabinete de Prensa');
  const [formAuthorRole, setFormAuthorRole] = useState<string>('Comunicación Oficial');
  const [formImageUrl, setFormImageUrl] = useState<string>(PRESET_IMAGES[0].url);
  const [formExcerpt, setFormExcerpt] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formFeatured, setFormFeatured] = useState<boolean>(false);

  // Form State - Medical Details (Ficha Médica de Seguimiento)
  const [medPlayer, setMedPlayer] = useState<string>('');
  const [medDorsal, setMedDorsal] = useState<number>(0);
  const [medInjury, setMedInjury] = useState<string>('');
  const [medRecoveryTime, setMedRecoveryTime] = useState<string>('5 - 7 días');
  const [medCurrentStatus, setMedCurrentStatus] = useState<MedicalDetails['currentStatus']>('Duda hasta última hora');

  // Image Upload helper
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Load news and players
  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/news`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
        }
      }
    } catch {
      console.warn('Backend news no disponible, usando noticias locales.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${API_BASE}/players`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPlayers(data);
        }
      }
    } catch {
      // Keep default
    }
  };

  useEffect(() => {
    fetchNews();
    fetchPlayers();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Open modal for creation
  const handleOpenCreate = (preselectedCategory?: NewsCategory) => {
    setEditingArticle(null);
    const cat = preselectedCategory || 'OFICIAL';
    setFormCategory(cat);
    setFormTitle('');
    
    // Auto-fill dates
    const now = new Date();
    setFormPublishedAt(
      now.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    );
    setFormDateText('Hoy');
    setFormReadTime('3 min');
    
    // Author defaults based on category
    if (cat === 'MEDICO') {
      setFormAuthor('Servicios Médicos Rayo Pelón');
      setFormAuthorRole('Cuerpo Médico & Fisioterapia');
      setFormImageUrl(PRESET_IMAGES[0].url);
      setMedPlayer(players[0]?.name || 'Álex López ("Galgo")');
      setMedDorsal(players[0]?.number || 11);
      setMedInjury('Esguince leve en ligamento lateral del tobillo');
      setMedRecoveryTime('5 - 7 días');
      setMedCurrentStatus('Duda hasta última hora');
    } else if (cat === 'CRONICA') {
      setFormAuthor('Gabinete de Prensa');
      setFormAuthorRole('Comunicación y Redacción');
      setFormImageUrl(PRESET_IMAGES[1].url);
    } else if (cat === 'OFICIAL') {
      setFormAuthor('Junta Directiva');
      setFormAuthorRole('Dirección Institucional');
      setFormImageUrl(PRESET_IMAGES[3].url);
    } else {
      setFormAuthor('Secretaría Técnica');
      setFormAuthorRole('Área Deportiva');
      setFormImageUrl(PRESET_IMAGES[2].url);
    }

    setFormExcerpt('');
    setFormContent('');
    setFormFeatured(news.length === 0);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormCategory(article.category);
    setFormTitle(article.title);
    setFormPublishedAt(article.publishedAt || article.dateText || '');
    setFormDateText(article.dateText);
    setFormReadTime(article.readTime);
    setFormAuthor(article.author);
    setFormAuthorRole(article.authorRole || '');
    setFormImageUrl(article.imageUrl || PRESET_IMAGES[0].url);
    setFormExcerpt(article.excerpt);
    setFormContent(article.content);
    setFormFeatured(Boolean(article.featured));

    if (article.medicalDetails) {
      setMedPlayer(article.medicalDetails.player || '');
      setMedDorsal(article.medicalDetails.dorsal || 0);
      setMedInjury(article.medicalDetails.injury || '');
      setMedRecoveryTime(article.medicalDetails.recoveryTime || '5 - 7 días');
      setMedCurrentStatus(article.medicalDetails.currentStatus || 'Duda hasta última hora');
    } else {
      setMedPlayer(players[0]?.name || '');
      setMedDorsal(players[0]?.number || 0);
      setMedInjury('');
      setMedRecoveryTime('5 - 7 días');
      setMedCurrentStatus('Duda hasta última hora');
    }

    setIsModalOpen(true);
  };

  // Category switch in form
  const handleCategoryChange = (cat: NewsCategory) => {
    setFormCategory(cat);
    if (!editingArticle) {
      if (cat === 'MEDICO') {
        setFormAuthor('Servicios Médicos Rayo Pelón');
        setFormAuthorRole('Cuerpo Médico & Fisioterapia');
        if (!medPlayer && players.length > 0) {
          setMedPlayer(players[0].name);
          setMedDorsal(players[0].number);
        }
      } else if (cat === 'CRONICA') {
        setFormAuthor('Gabinete de Prensa');
        setFormAuthorRole('Comunicación y Redacción');
      } else if (cat === 'OFICIAL') {
        setFormAuthor('Junta Directiva');
        setFormAuthorRole('Dirección Institucional');
      } else {
        setFormAuthor('Secretaría Técnica');
        setFormAuthorRole('Área Deportiva');
      }
    }
  };

  // Auto calculate reading time based on words
  const calculateAutoReadTime = () => {
    const totalWords = (formContent || '').split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(totalWords / 160));
    setFormReadTime(`${minutes} min`);
    showFeedback('success', `Tiempo de lectura estimado: ${minutes} min (${totalWords} palabras)`);
  };

  // Handle player select for medical sheet
  const handlePlayerSelect = (playerName: string) => {
    setMedPlayer(playerName);
    const found = players.find(p => p.name === playerName);
    if (found) {
      setMedDorsal(found.number);
    }
  };

  // Handle image upload from computer
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP)');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch(`${API_BASE}/upload/media-file`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            data: base64,
            filename: file.name,
            type: 'image'
          })
        });

        if (res.ok) {
          const data = await res.json();
          setFormImageUrl(data.url);
          showFeedback('success', 'Imagen subida correctamente al servidor');
        } else {
          // Fallback to local base64 preview
          setFormImageUrl(base64);
          showFeedback('success', 'Imagen cargada en memoria');
        }
      } catch {
        setFormImageUrl(reader.result as string);
        showFeedback('success', 'Imagen cargada');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      showFeedback('error', 'El título de la noticia es obligatorio');
      return;
    }
    if (!formContent.trim()) {
      showFeedback('error', 'El contenido de la noticia es obligatorio');
      return;
    }

    const payload: Partial<NewsArticle> = {
      title: formTitle.trim(),
      category: formCategory,
      publishedAt: formPublishedAt.trim() || '25 de Septiembre, 2026',
      dateText: formDateText.trim() || 'Hoy',
      readTime: formReadTime.trim() || '3 min',
      excerpt: formExcerpt.trim() || formContent.trim().slice(0, 160) + '...',
      content: formContent.trim(),
      author: formAuthor.trim() || 'Rayo Pelón F7',
      authorRole: formAuthorRole.trim() || 'Prensa & Comunicación',
      imageUrl: formImageUrl.trim() || PRESET_IMAGES[0].url,
      featured: formFeatured
    };

    if (formCategory === 'MEDICO') {
      payload.medicalDetails = {
        player: medPlayer.trim() || 'Futbolista no especificado',
        dorsal: Number(medDorsal) || 0,
        injury: medInjury.trim() || 'Diagnóstico pendiente',
        recoveryTime: medRecoveryTime.trim() || 'Pendiente de evolución',
        currentStatus: medCurrentStatus
      };
    }

    try {
      if (editingArticle) {
        // PUT
        const res = await fetch(`${API_BASE}/news/${editingArticle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const updated = await res.json();
          setNews(prev =>
            prev.map(item => {
              if (item.id === updated.id) return updated;
              if (updated.featured) return { ...item, featured: false };
              return item;
            })
          );
          showFeedback('success', 'Noticia actualizada con éxito');
          setIsModalOpen(false);
        } else {
          showFeedback('error', 'Error del servidor al actualizar');
        }
      } else {
        // POST
        const res = await fetch(`${API_BASE}/news`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const created = await res.json();
          setNews(prev => {
            let next = [created, ...prev];
            if (created.featured) {
              next = next.map(n => (n.id === created.id ? n : { ...n, featured: false }));
            }
            return next;
          });
          showFeedback('success', 'Nueva noticia publicada correctamente');
          setIsModalOpen(false);
        } else {
          showFeedback('error', 'Error del servidor al publicar la noticia');
        }
      }
    } catch {
      showFeedback('error', 'Error de conexión con el backend');
    }
  };

  // Toggle Featured status directly
  const handleSetFeatured = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/news/${id}/feature`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        setNews(prev =>
          prev.map(item => ({
            ...item,
            featured: item.id === id
          }))
        );
        showFeedback('success', data.message || 'Artículo marcado como comunicado destacado en portada');
      } else {
        showFeedback('error', 'No se pudo marcar como destacado');
      }
    } catch {
      // Optimistic fallback
      setNews(prev =>
        prev.map(item => ({
          ...item,
          featured: item.id === id
        }))
      );
      showFeedback('success', 'Artículo marcado como comunicado destacado');
    }
  };

  // Delete article
  const handleDeleteConfirm = async () => {
    if (!deletingArticle) return;

    try {
      const res = await fetch(`${API_BASE}/news/${deletingArticle.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setNews(prev => {
          const remaining = prev.filter(n => n.id !== deletingArticle.id);
          if (deletingArticle.featured && remaining.length > 0) {
            remaining[0].featured = true;
          }
          return remaining;
        });
        showFeedback('success', 'Noticia eliminada correctamente');
      } else {
        showFeedback('error', 'Error al eliminar la noticia');
      }
    } catch {
      showFeedback('error', 'Error de red al intentar eliminar');
    } finally {
      setDeletingArticle(null);
    }
  };

  // Current featured article
  const currentFeatured = news.find(n => n.featured) || news[0];

  // Filtered news list
  const filteredList = news.filter(item => {
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      item.title.toLowerCase().includes(term) ||
      item.excerpt.toLowerCase().includes(term) ||
      item.content.toLowerCase().includes(term) ||
      (item.author && item.author.toLowerCase().includes(term)) ||
      (item.medicalDetails?.player && item.medicalDetails.player.toLowerCase().includes(term));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all duration-300 animate-slideUp ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="elite-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rayo-gold mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              SALA DE REDACCIÓN & GABINETE DE PRENSA
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white tracking-tight">
              NOTICIAS & <span className="text-champagne-gradient">CRÓNICAS</span>
            </h2>
            <p className="text-xs sm:text-sm text-rayo-bone/60 max-w-2xl mt-1">
              Redacta partes médicos con ficha de seguimiento clínico, crónicas de partidos, comunicados institucionales y novedades de plantilla. Selecciona cuál aparece como comunicado destacado en la portada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenCreate('MEDICO')}
              className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-rose-950/40"
            >
              <span className="material-symbols-outlined text-base">medical_services</span>
              + Nuevo Parte Médico
            </button>

            <button
              onClick={() => handleOpenCreate('OFICIAL')}
              className="px-4 py-2.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-950/30"
            >
              <span className="material-symbols-outlined text-base">post_add</span>
              + Redactar Noticia
            </button>
          </div>
        </div>

        {/* 4 CATEGORIES QUICK CREATION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          {CATEGORIES_CONFIG.map(cfg => {
            const count = news.filter(n => n.category === cfg.key).length;
            return (
              <div
                key={cfg.key}
                onClick={() => handleOpenCreate(cfg.key)}
                className={`p-3.5 rounded-xl bg-black/40 border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group flex items-start gap-3 relative overflow-hidden`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${cfg.badgeClass} flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <span className="material-symbols-outlined text-xl">{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-xs uppercase text-white group-hover:text-rayo-gold transition-colors truncate">
                      {cfg.title}
                    </h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-rayo-bone/60">
                      {count}
                    </span>
                  </div>
                  <p className="text-[11px] text-rayo-bone/50 truncate mt-0.5">{cfg.subtitle}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.accentClass} mt-1.5 inline-flex items-center gap-1 group-hover:underline`}>
                    + Redactar <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURED STORY SELECTOR BANNER */}
      {currentFeatured && (
        <div className="elite-gold-card rounded-2xl p-6 sm:p-8 border border-rayo-gold/40 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black border border-rayo-gold/50 flex-shrink-0 shadow-lg">
                <img
                  src={currentFeatured.imageUrl}
                  alt={currentFeatured.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-widest bg-rayo-gold text-rayo-carbon shadow-sm">
                    ⭐ COMUNICADO DESTACADO EN PORTADA
                  </span>
                  <span className="text-xs text-rayo-bone/60">• {currentFeatured.categoryLabel}</span>
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-white uppercase leading-snug">
                  {currentFeatured.title}
                </h3>
                <p className="text-xs text-rayo-bone/70 line-clamp-1 mt-1 max-w-2xl">
                  {currentFeatured.excerpt}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-rayo-bone/50">
                  <span>📅 {currentFeatured.publishedAt || currentFeatured.dateText}</span>
                  <span>⏱️ {currentFeatured.readTime}</span>
                  <span>✍️ {currentFeatured.author}</span>
                  {currentFeatured.medicalDetails && (
                    <span className="text-rose-300 font-semibold">
                      🏥 {currentFeatured.medicalDetails.player} ({currentFeatured.medicalDetails.injury})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct selector for changing featured article */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-black/60 p-3 rounded-xl border border-white/10 flex-shrink-0">
              <div className="text-xs text-rayo-bone/70 sm:text-right pr-2">
                <span className="block font-semibold text-white">Cambiar Destacado:</span>
                <span className="text-[10px] text-rayo-bone/50">Elige cuál poner en portada</span>
              </div>
              <select
                value={currentFeatured.id}
                onChange={(e) => handleSetFeatured(e.target.value)}
                className="bg-[#0e0e1a] border border-rayo-gold/40 text-white text-xs rounded-lg px-3 py-2 font-display uppercase tracking-wider focus:outline-none focus:border-rayo-gold max-w-xs"
              >
                {news.map(art => (
                  <option key={art.id} value={art.id}>
                    [{art.category}] {art.title.slice(0, 45)}...
                  </option>
                ))}
              </select>
              <button
                onClick={() => setPreviewArticle(currentFeatured)}
                className="px-3 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold uppercase flex items-center justify-center gap-1.5 transition-colors"
                title="Ver cómo se ve en la web"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                Previsualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0A0A16] p-1.5 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-rayo-gold text-rayo-carbon font-bold shadow'
                : 'text-rayo-bone/60 hover:text-white'
            }`}
          >
            Todas ({news.length})
          </button>
          {CATEGORIES_CONFIG.map(cfg => {
            const count = news.filter(n => n.category === cfg.key).length;
            return (
              <button
                key={cfg.key}
                onClick={() => setCategoryFilter(cfg.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  categoryFilter === cfg.key
                    ? 'bg-rayo-gold text-rayo-carbon font-bold shadow'
                    : 'text-rayo-bone/60 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                {cfg.title} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-rayo-bone/40 text-base">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, jugador, autor..."
            className="w-full bg-[#0A0A16] border border-white/[0.08] focus:border-rayo-gold/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-rayo-bone/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* NEWS LIST CARDS */}
      {loading ? (
        <div className="p-12 text-center text-xs text-rayo-bone/50">
          <span className="material-symbols-outlined text-3xl animate-spin text-rayo-gold mb-2 block">
            sync
          </span>
          Cargando sala de prensa...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center elite-card rounded-xl border border-white/[0.08]">
          <span className="material-symbols-outlined text-4xl text-rayo-bone/30 mb-2">
            newspaper
          </span>
          <h4 className="font-display font-bold text-base uppercase text-white">
            No se encontraron noticias
          </h4>
          <p className="text-xs text-rayo-bone/50 mt-1 max-w-sm mx-auto">
            No hay publicaciones que coincidan con los filtros aplicados.
          </p>
          <button
            onClick={() => handleOpenCreate()}
            className="mt-4 px-4 py-2 rounded-lg bg-rayo-gold text-rayo-carbon text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Crear Noticia Ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map((item) => {
            const isFeat = item.featured;
            const categoryConfig = CATEGORIES_CONFIG.find(c => c.key === item.category);

            return (
              <div
                key={item.id}
                className={`elite-card rounded-xl p-5 border transition-all duration-300 relative group ${
                  isFeat
                    ? 'border-rayo-gold/50 bg-gradient-to-r from-rayo-gold/5 via-transparent to-transparent shadow-lg shadow-amber-950/20'
                    : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 sm:w-28 sm:h-24 rounded-lg overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 relative group-hover:scale-102 transition-transform">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover filter brightness-90"
                      />
                      {isFeat && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rayo-gold text-rayo-carbon font-display text-[9px] font-bold uppercase tracking-wider shadow">
                          DESTACADA
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wider border ${
                            categoryConfig?.badgeClass || 'bg-white/10 text-white'
                          }`}
                        >
                          {item.categoryLabel}
                        </span>

                        <span className="text-[11px] text-rayo-bone/50">• {item.publishedAt || item.dateText}</span>
                        <span className="text-[11px] text-rayo-bone/50">• {item.readTime} de lectura</span>
                        <span className="text-[11px] text-rayo-bone/50">• Por {item.author}</span>
                      </div>

                      <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase leading-snug group-hover:text-rayo-gold transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-rayo-bone/70 line-clamp-2 mt-1 leading-relaxed">
                        {item.excerpt}
                      </p>

                      {/* If Medical, show the Medical Follow-up badge */}
                      {item.medicalDetails && (
                        <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs">
                          <span className="material-symbols-outlined text-rose-400 text-sm">
                            medical_services
                          </span>
                          <span className="font-bold text-white">
                            {item.medicalDetails.player} (#{item.medicalDetails.dorsal || '?'})
                          </span>
                          <span className="text-rose-300">• {item.medicalDetails.injury}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                            {item.medicalDetails.currentStatus}
                          </span>
                          <span className="text-rayo-bone/50 text-[11px]">
                            ({item.medicalDetails.recoveryTime})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/[0.08]">
                    {/* Feature button */}
                    <button
                      onClick={() => handleSetFeatured(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow ${
                        isFeat
                          ? 'bg-rayo-gold text-rayo-carbon font-extrabold ring-2 ring-rayo-gold/50'
                          : 'bg-white/[0.06] hover:bg-rayo-gold hover:text-rayo-carbon text-rayo-bone/80'
                      }`}
                      title={isFeat ? 'Actualmente en la portada' : 'Mostrar en la portada del club'}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isFeat ? 'star' : 'star_border'}
                      </span>
                      {isFeat ? 'Destacada' : 'Destacar'}
                    </button>

                    {/* Preview button */}
                    <button
                      onClick={() => setPreviewArticle(item)}
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-rayo-bone/70 hover:text-white transition-colors"
                      title="Vista Previa de lectura"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-rayo-gold transition-colors"
                      title="Editar contenido"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeletingArticle(item)}
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Eliminar publicación"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REDACCIÓN & EDICIÓN DE NOTICIA / PARTE MÉDICO       */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div
            className="relative max-w-4xl w-full elite-card rounded-2xl border border-white/[0.15] bg-[#0c0d1e] shadow-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-black/40 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rayo-gold/20 border border-rayo-gold/40 flex items-center justify-center text-rayo-gold">
                  <span className="material-symbols-outlined text-xl">
                    {formCategory === 'MEDICO' ? 'medical_services' : 'edit_note'}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl uppercase text-white">
                    {editingArticle ? 'Editar Publicación' : 'Redactar Nueva Publicación'}
                  </h3>
                  <p className="text-xs text-rayo-bone/60">
                    Gabinete de prensa oficial de Rayo Pelón F7
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-rayo-bone/70 hover:text-white flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
              
              {/* STEP 1: SELECTOR DE TIPO DE NOTICIA O COMUNICADO (OBLIGATORIO) */}
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-rayo-gold mb-2">
                  1. Selecciona el Tipo de Noticia / Comunicado *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORIES_CONFIG.map(cfg => {
                    const isSelected = formCategory === cfg.key;
                    return (
                      <button
                        type="button"
                        key={cfg.key}
                        onClick={() => handleCategoryChange(cfg.key)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? `${cfg.badgeClass} ring-2 ring-white/20 shadow-lg scale-[1.02]`
                            : 'bg-black/30 border-white/[0.08] hover:border-white/20 text-rayo-bone/70'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                          )}
                        </div>
                        <div>
                          <span className="font-display font-bold text-xs uppercase block text-white">
                            {cfg.title}
                          </span>
                          <span className="text-[10px] text-rayo-bone/50 block truncate">
                            {cfg.key === 'MEDICO' ? 'Con ficha médica' : cfg.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: SI ES PARTE MÉDICO -> FICHA MÉDICA DE SEGUIMIENTO (OBLIGATORIA) */}
              {formCategory === 'MEDICO' && (
                <div className="p-5 rounded-xl bg-gradient-to-r from-rose-950/40 via-[#180918] to-black/40 border border-rose-500/40 shadow-inner space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
                    <div className="flex items-center gap-2 text-rose-300 font-display font-bold text-xs uppercase tracking-widest">
                      <span className="material-symbols-outlined text-base">medical_services</span>
                      FICHA MÉDICA DE SEGUIMIENTO CLÍNICO
                    </div>
                    <span className="text-[10px] text-rose-300/70 font-mono">
                      Obligatorio para partes médicos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Futbolista Afectado */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-200 mb-1">
                        Futbolista Afectado: *
                      </label>
                      <div className="space-y-1.5">
                        <select
                          value={medPlayer}
                          onChange={(e) => handlePlayerSelect(e.target.value)}
                          className="w-full bg-[#0a060d] border border-rose-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                        >
                          <option value="">-- Seleccionar jugador de la plantilla --</option>
                          {players.map(p => (
                            <option key={p.id} value={p.name}>
                              #{p.number} - {p.name} {p.nickname ? `("${p.nickname}")` : ''} ({p.position})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={medPlayer}
                          onChange={(e) => setMedPlayer(e.target.value)}
                          placeholder="O escribe nombre personalizado..."
                          className="w-full bg-[#0a060d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-rayo-bone/40 focus:outline-none focus:border-rose-400"
                        />
                      </div>
                    </div>

                    {/* Dorsal del jugador */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-200 mb-1">
                        Dorsal del Jugador:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={medDorsal || ''}
                        onChange={(e) => setMedDorsal(Number(e.target.value))}
                        placeholder="Ej: 11"
                        className="w-full bg-[#0a060d] border border-rose-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                      />
                      <span className="text-[10px] text-rayo-bone/50 block mt-1">
                        Se asigna automáticamente al elegir jugador
                      </span>
                    </div>

                    {/* Diagnóstico Clínico */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-200 mb-1">
                        Diagnóstico Clínico: *
                      </label>
                      <input
                        type="text"
                        value={medInjury}
                        onChange={(e) => setMedInjury(e.target.value)}
                        placeholder="Ej: Esguince de tobillo derecho grado 1"
                        className="w-full bg-[#0a060d] border border-rose-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    {/* Tiempo Estimado */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-200 mb-1">
                        Tiempo Estimado de Recuperación: *
                      </label>
                      <input
                        type="text"
                        value={medRecoveryTime}
                        onChange={(e) => setMedRecoveryTime(e.target.value)}
                        placeholder="Ej: 5 - 7 días, 2 a 3 semanas..."
                        className="w-full bg-[#0a060d] border border-rose-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    {/* Estado Competitivo */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-200 mb-1">
                        Estado Competitivo: *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {MEDICAL_STATUS_OPTIONS.map(st => (
                          <button
                            type="button"
                            key={st}
                            onClick={() => setMedCurrentStatus(st)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                              medCurrentStatus === st
                                ? 'bg-amber-500/30 text-amber-200 border-amber-400 ring-1 ring-amber-400'
                                : 'bg-black/40 text-rayo-bone/60 border-white/10 hover:text-white'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DATOS GENERALES DE LA NOTICIA */}
              <div className="space-y-4">
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-rayo-gold">
                  2. Datos y Cabecera de la Noticia
                </label>

                {/* Título */}
                <div>
                  <label className="block text-xs text-rayo-bone/70 uppercase mb-1">
                    Título de la Noticia o Comunicado *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej: Parte médico oficial: Evolución de Álex 'Galgo'..."
                    required
                    className="w-full bg-[#080814] border border-white/10 focus:border-rayo-gold rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Grid: Fecha de publicación, Tiempo de lectura, Destacado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Fecha de Publicación */}
                  <div>
                    <label className="block text-xs text-rayo-bone/70 uppercase mb-1">
                      Fecha de Publicación *
                    </label>
                    <input
                      type="text"
                      value={formPublishedAt}
                      onChange={(e) => setFormPublishedAt(e.target.value)}
                      placeholder="Ej: 25 de Septiembre, 2026"
                      className="w-full bg-[#080814] border border-white/10 focus:border-rayo-gold rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Fecha Corta */}
                  <div>
                    <label className="block text-xs text-rayo-bone/70 uppercase mb-1">
                      Etiqueta Fecha Corta
                    </label>
                    <input
                      type="text"
                      value={formDateText}
                      onChange={(e) => setFormDateText(e.target.value)}
                      placeholder="Ej: Hoy, Hace 2 días..."
                      className="w-full bg-[#080814] border border-white/10 focus:border-rayo-gold rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Tiempo de Lectura */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-rayo-bone/70 uppercase">
                        Tiempo de Lectura
                      </label>
                      <button
                        type="button"
                        onClick={calculateAutoReadTime}
                        className="text-[10px] text-rayo-gold hover:underline"
                        title="Calcular según cantidad de palabras"
                      >
                        Auto-calcular
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formReadTime}
                      onChange={(e) => setFormReadTime(e.target.value)}
                      placeholder="Ej: 3 min"
                      className="w-full bg-[#080814] border border-white/10 focus:border-rayo-gold rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Grid: Autor y Cargo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-rayo-bone/70 uppercase mb-1">
                      Firma / Autor
                    </label>
                    <input
                      type="text"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="Ej: Servicios Médicos Rayo Pelón"
                      className="w-full bg-[#080814] border border-white/10 focus:border-rayo-gold rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-rayo-bone/70 uppercase mb-1">
                      Cargo o Área Responsable
                    </label>
                    <input
                      type="text"
                      value={formAuthorRole}
                      onChange={(e) => setFormAuthorRole(e.target.value)}
                      placeholder="Ej: Cuerpo Médico & Fisioterapia"
                      className="w-full bg-[#080814] border border-white/10 focus:border-rayo-gold rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* IMAGEN DE PORTADA */}
                <div>
                  <label className="block text-xs text-rayo-bone/70 uppercase mb-1.5">
                    Imagen de Portada (URL o Subir archivo del ordenador)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-[#080814] border border-white/10 focus:border-rayo-gold rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />

                    {/* Subir archivo */}
                    <label className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-sm">
                        {uploadingImage ? 'sync' : 'upload_file'}
                      </span>
                      {uploadingImage ? 'Subiendo...' : 'Subir desde PC'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {/* Preset Quick Images */}
                  <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
                    <span className="text-[10px] text-rayo-bone/40 uppercase whitespace-nowrap">Presets:</span>
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormImageUrl(preset.url)}
                        className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                          formImageUrl === preset.url
                            ? 'bg-rayo-gold text-rayo-carbon font-bold border-rayo-gold'
                            : 'bg-black/40 text-rayo-bone/60 border-white/10 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Thumbnail preview */}
                  {formImageUrl && (
                    <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-white/20 bg-black/60">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Resumen / Entradilla */}
                <div>
                  <label className="block text-xs text-rayo-bone/70 uppercase mb-1">
                    Resumen / Entradilla (Extracto que se muestra en tarjetas)
                  </label>
                  <textarea
                    rows={2}
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    placeholder="Breve resumen de 1 a 2 frases..."
                    className="w-full bg-[#080814] border border-white/10 focus:border-rayo-gold rounded-lg p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Contenido Completo */}
                <div>
                  <label className="block text-xs text-rayo-bone/70 uppercase mb-1">
                    Contenido Completo de la Noticia / Comunicado *
                  </label>
                  <textarea
                    rows={8}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Redacta aquí el texto íntegro del informe, crónica o comunicado..."
                    required
                    className="w-full bg-[#080814] border border-white/10 focus:border-rayo-gold rounded-lg p-3.5 text-xs text-white focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                {/* DESTACAR EN PORTADA TOGGLE */}
                <div className="p-4 rounded-xl bg-rayo-gold/10 border border-rayo-gold/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-rayo-gold text-2xl">star</span>
                    <div>
                      <span className="font-display font-bold text-xs uppercase text-white block">
                        Destacar como Comunicado Principal en Portada
                      </span>
                      <span className="text-[11px] text-rayo-bone/60">
                        Aparecerá en el bloque superior con foto panorámica en la sección de noticias.
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3 sticky bottom-0 bg-[#0c0d1e] py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold uppercase tracking-wider text-rayo-bone transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  {editingArticle ? 'Guardar Cambios' : 'Publicar Noticia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRMAR ELIMINACIÓN                               */}
      {/* ========================================================= */}
      {deletingArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="elite-card rounded-2xl max-w-md w-full p-6 border border-rose-500/40 bg-[#0d0714] shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <h3 className="font-display font-bold text-lg uppercase text-white mb-2">
              ¿Eliminar esta publicación?
            </h3>
            <p className="text-xs text-rayo-bone/70 mb-6 leading-relaxed">
              Estás a punto de borrar permanentemente:{' '}
              <strong className="text-white">"{deletingArticle.title}"</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingArticle(null)}
                className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold uppercase text-rayo-bone"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display text-xs font-bold uppercase tracking-wider shadow"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PREVIEW DE LECTURA (COMPONENTE PÚBLICO REAL)        */}
      {/* ========================================================= */}
      {previewArticle && (
        <NewsArticleModal
          article={previewArticle}
          onClose={() => setPreviewArticle(null)}
        />
      )}
    </div>
  );
};
