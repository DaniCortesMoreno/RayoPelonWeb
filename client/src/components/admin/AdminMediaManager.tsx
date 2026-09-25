import React, { useState, useEffect } from 'react';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '../../utils/mediaUtils';
import { getAuthHeaders } from '../../context/AuthContext';
import { API_BASE } from '../../config/api';

interface TimelineEvent {
  minute: string;
  player: string;
  type: string;
  team: 'rayo' | 'rival';
  text: string;
}

interface MatchStats {
  shots: { home: number; away: number };
  shotsOnTarget?: { home: number; away: number };
  possession: { home: string; away: string };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
}

interface FeaturedMatchData {
  id: string;
  matchday: number;
  competition: string;
  date: string;
  location: string;
  homeTeam: { name: string; badge: string; score: number };
  awayTeam: { name: string; badge: string; score: number };
  mediaType: 'video' | 'carousel';
  videoSourceType: 'upload' | 'youtube' | 'url';
  videoUrl: string;
  videoTitle: string;
  videoDuration: string;
  videoThumbnail: string;
  carouselImages: string[];
  views: string;
  mvp: string;
  timeline: TimelineEvent[];
  stats: MatchStats;
}

interface GalleryPhoto {
  id: string;
  type: 'foto';
  title: string;
  tag: string;
  category: 'partidos' | 'celebraciones' | 'vestuario' | 'entrenos';
  date: string;
  imageUrl: string;
  description: string;
}

interface HighlightClip {
  id: string;
  type: 'video';
  title: string;
  tag: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  sourceType?: 'youtube' | 'upload' | 'url';
  duration?: string;
  match?: string;
  views?: string;
}

export const AdminMediaManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'featured' | 'gallery' | 'clips'>('featured');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 1. Featured Match State
  const [featuredMatch, setFeaturedMatch] = useState<FeaturedMatchData | null>(null);
  const [newCarouselImgUrl, setNewCarouselImgUrl] = useState('');
  const [isEditingTimelineEvent, setIsEditingTimelineEvent] = useState<number | null>(null);
  const [timelineForm, setTimelineForm] = useState<TimelineEvent>({
    minute: "15'",
    player: '',
    type: 'GOL',
    team: 'rayo',
    text: ''
  });
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  // 2. Gallery State
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('todos');
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [photoForm, setPhotoForm] = useState<{
    title: string;
    tag: string;
    category: 'partidos' | 'celebraciones' | 'vestuario' | 'entrenos';
    date: string;
    imageUrl: string;
    description: string;
  }>({
    title: '',
    tag: 'Rayo Pelón',
    category: 'partidos',
    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    imageUrl: '',
    description: ''
  });

  // 3. Clips State
  const [clips, setClips] = useState<HighlightClip[]>([]);
  const [clipsModalOpen, setClipsModalOpen] = useState(false);
  const [editingClip, setEditingClip] = useState<HighlightClip | null>(null);
  const [clipForm, setClipForm] = useState<{
    title: string;
    tag: string;
    description: string;
    imageUrl: string;
    videoUrl: string;
    sourceType: 'youtube' | 'upload' | 'url';
    duration: string;
    match: string;
    views: string;
  }>({
    title: '',
    tag: 'GOLAZO DEL MES',
    description: '',
    imageUrl: '',
    videoUrl: '',
    sourceType: 'youtube',
    duration: '00:45',
    match: 'J13 vs Ibense CF',
    views: '1.5K views'
  });

  // File Upload Helpers
  const [uploadingFile, setUploadingFile] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [featRes, galRes, clipRes] = await Promise.all([
        fetch(`${API_BASE}/media/featured-match`).then(r => r.json()),
        fetch(`${API_BASE}/media/gallery`).then(r => r.json()),
        fetch(`${API_BASE}/media/clips`).then(r => r.json())
      ]);
      setFeaturedMatch(featRes);
      setGallery(galRes || []);
      setClips(clipRes || []);
    } catch (err) {
      console.error('Error cargando multimedia:', err);
      showToast('Error conectando con la API multimedia', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generic File Upload Handler (Computer to backend /media/...)
  const handleUploadFromComputer = async (
    file: File,
    type: 'image' | 'video',
    onSuccess: (url: string) => void
  ) => {
    setUploadingFile(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await fetch(`${API_BASE}/upload/media-file`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            data: base64Data,
            filename: file.name,
            type
          })
        });
        const data = await res.json();
        if (data.success && data.url) {
          onSuccess(data.url);
          showToast(`¡${type === 'video' ? 'Vídeo' : 'Imagen'} subido correctamente desde tu ordenador!`);
        } else {
          showToast(data.error || 'Error al guardar archivo', 'error');
        }
        setUploadingFile(false);
      };
      reader.onerror = () => {
        showToast('Error al leer el archivo seleccionado', 'error');
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      showToast('Error en la subida del archivo', 'error');
      setUploadingFile(false);
    }
  };

  // ==========================================
  // 1. FEATURED MATCH ACTIONS
  // ==========================================
  const handleSaveFeaturedMatch = async () => {
    if (!featuredMatch) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/media/featured-match`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(featuredMatch)
      });
      const data = await res.json();
      if (data.success) {
        setFeaturedMatch(data.featuredMatch);
        showToast('¡Contenido destacado de la última jornada guardado con éxito!');
      } else {
        showToast('Error al guardar datos de la jornada', 'error');
      }
    } catch {
      showToast('Error de conexión al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarouselImage = (url: string) => {
    if (!url.trim() || !featuredMatch) return;
    const updatedImages = [...(featuredMatch.carouselImages || []), url.trim()];
    setFeaturedMatch({ ...featuredMatch, carouselImages: updatedImages });
    setNewCarouselImgUrl('');
  };

  const handleRemoveCarouselImage = (index: number) => {
    if (!featuredMatch) return;
    const updatedImages = featuredMatch.carouselImages.filter((_, idx) => idx !== index);
    setFeaturedMatch({ ...featuredMatch, carouselImages: updatedImages });
  };

  const handleSaveTimelineEvent = () => {
    if (!featuredMatch) return;
    const currentTimeline = [...(featuredMatch.timeline || [])];
    if (isEditingTimelineEvent !== null) {
      currentTimeline[isEditingTimelineEvent] = timelineForm;
    } else {
      currentTimeline.push(timelineForm);
    }
    setFeaturedMatch({ ...featuredMatch, timeline: currentTimeline });
    setShowTimelineModal(false);
    setIsEditingTimelineEvent(null);
    setTimelineForm({ minute: "15'", player: '', type: 'GOL', team: 'rayo', text: '' });
  };

  const handleDeleteTimelineEvent = (index: number) => {
    if (!featuredMatch) return;
    const currentTimeline = featuredMatch.timeline.filter((_, idx) => idx !== index);
    setFeaturedMatch({ ...featuredMatch, timeline: currentTimeline });
  };

  // ==========================================
  // 2. GALLERY ACTIONS
  // ==========================================
  const handleOpenPhotoModal = (photo?: GalleryPhoto) => {
    if (photo) {
      setEditingPhoto(photo);
      setPhotoForm({
        title: photo.title,
        tag: photo.tag,
        category: photo.category,
        date: photo.date,
        imageUrl: photo.imageUrl,
        description: photo.description
      });
    } else {
      setEditingPhoto(null);
      setPhotoForm({
        title: '',
        tag: 'J13 vs Ibense',
        category: 'partidos',
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        imageUrl: '',
        description: ''
      });
    }
    setGalleryModalOpen(true);
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.imageUrl.trim() || !photoForm.title.trim()) {
      showToast('Por favor incluye al menos título y URL o subida de imagen', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingPhoto) {
        // Update
        const res = await fetch(`${API_BASE}/media/gallery/${editingPhoto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(photoForm)
        });
        const data = await res.json();
        if (data.success) {
          setGallery(prev => prev.map(p => (p.id === editingPhoto.id ? data.item : p)));
          showToast('Foto actualizada correctamente');
          setGalleryModalOpen(false);
        }
      } else {
        // Create
        const res = await fetch(`${API_BASE}/media/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(photoForm)
        });
        const data = await res.json();
        if (data.success) {
          setGallery(prev => [data.item, ...prev]);
          showToast('Foto añadida a la galería');
          setGalleryModalOpen(false);
        }
      }
    } catch {
      showToast('Error al guardar la foto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta fotografía de la galería?')) return;
    try {
      const res = await fetch(`${API_BASE}/media/gallery/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() }
      });
      const data = await res.json();
      if (data.success) {
        setGallery(prev => prev.filter(p => p.id !== id));
        showToast('Foto eliminada');
      }
    } catch {
      showToast('Error al eliminar foto', 'error');
    }
  };

  // ==========================================
  // 3. CLIPS ACTIONS
  // ==========================================
  const handleOpenClipModal = (clip?: HighlightClip) => {
    if (clip) {
      setEditingClip(clip);
      setClipForm({
        title: clip.title,
        tag: clip.tag,
        description: clip.description,
        imageUrl: clip.imageUrl,
        videoUrl: clip.videoUrl || '',
        sourceType: clip.sourceType || 'youtube',
        duration: clip.duration || '00:45',
        match: clip.match || 'Liga Plata F7',
        views: clip.views || '1.5K views'
      });
    } else {
      setEditingClip(null);
      setClipForm({
        title: '',
        tag: 'GOLAZO DEL MES',
        description: '',
        imageUrl: '',
        videoUrl: '',
        sourceType: 'youtube',
        duration: '00:45',
        match: 'J13 vs Ibense CF',
        views: '1.5K views'
      });
    }
    setClipsModalOpen(true);
  };

  const handleSaveClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clipForm.title.trim()) {
      showToast('Por favor incluye un título para el clip', 'error');
      return;
    }

    // Auto thumbnail from youtube if empty
    let finalImageUrl = clipForm.imageUrl;
    if (!finalImageUrl && clipForm.videoUrl && clipForm.videoUrl.includes('youtu')) {
      const ytThumb = getYouTubeThumbnail(clipForm.videoUrl);
      if (ytThumb) finalImageUrl = ytThumb;
    }

    setLoading(true);
    try {
      if (editingClip) {
        // Update
        const res = await fetch(`${API_BASE}/media/clips/${editingClip.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ ...clipForm, imageUrl: finalImageUrl })
        });
        const data = await res.json();
        if (data.success) {
          setClips(prev => prev.map(c => (c.id === editingClip.id ? data.item : c)));
          showToast('Clip actualizado correctamente');
          setClipsModalOpen(false);
        }
      } else {
        // Create
        const res = await fetch(`${API_BASE}/media/clips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ ...clipForm, imageUrl: finalImageUrl })
        });
        const data = await res.json();
        if (data.success) {
          setClips(prev => [data.item, ...prev]);
          showToast('Nuevo clip publicado con éxito');
          setClipsModalOpen(false);
        }
      }
    } catch {
      showToast('Error al guardar el clip', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClip = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este clip?')) return;
    try {
      const res = await fetch(`${API_BASE}/media/clips/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() }
      });
      const data = await res.json();
      if (data.success) {
        setClips(prev => prev.filter(c => c.id !== id));
        showToast('Clip eliminado');
      }
    } catch {
      showToast('Error al eliminar clip', 'error');
    }
  };

  const filteredGallery = gallery.filter(item => {
    if (selectedGalleryCategory === 'todos') return true;
    return item.category === selectedGalleryCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold border backdrop-blur-md animate-slideUp ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toastMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toastMessage.text}
        </div>
      )}

      {/* Header with Sub-tabs navigation */}
      <div className="elite-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.16em]">
              <span className="material-symbols-outlined text-sm">video_library</span>
              PANEL MULTIMEDIA & AUDIOVISUAL
            </div>
            <h2 className="font-display text-2xl font-bold text-white uppercase tracking-tight mt-1">
              Gestor de Contenidos Multimedia
            </h2>
            <p className="text-xs text-rayo-bone/60 mt-0.5">
              Sube fotos y vídeos desde tu ordenador o mediante YouTube para las 3 secciones públicas.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold uppercase tracking-wider text-rayo-bone flex items-center gap-2 border border-white/10 self-start md:self-auto"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Recargar Datos
          </button>
        </div>

        {/* 3 Main Sections Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
          <button
            onClick={() => setActiveSubTab('featured')}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeSubTab === 'featured'
                ? 'bg-rayo-gold/10 border-rayo-gold text-white shadow-[0_0_20px_rgba(197,160,89,0.15)]'
                : 'bg-black/20 border-white/[0.06] text-rayo-bone/70 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-rayo-gold">
                1. ÚLTIMA JORNADA
              </span>
              <span className="material-symbols-outlined text-lg">featured_video</span>
            </div>
            <h4 className="font-bold text-sm text-white">Destacado & Marcador</h4>
            <p className="text-[11px] text-rayo-bone/50 mt-1">Vídeo o Carrusel de fotos + Cronología y Stats</p>
          </button>

          <button
            onClick={() => setActiveSubTab('gallery')}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeSubTab === 'gallery'
                ? 'bg-rayo-gold/10 border-rayo-gold text-white shadow-[0_0_20px_rgba(197,160,89,0.15)]'
                : 'bg-black/20 border-white/[0.06] text-rayo-bone/70 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-rayo-gold">
                2. FOTOTECA
              </span>
              <span className="material-symbols-outlined text-lg">photo_camera</span>
            </div>
            <h4 className="font-bold text-sm text-white">Galería de Imágenes ({gallery.length})</h4>
            <p className="text-[11px] text-rayo-bone/50 mt-1">Partidos, Celebraciones, Vestuario y Entrenos</p>
          </button>

          <button
            onClick={() => setActiveSubTab('clips')}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeSubTab === 'clips'
                ? 'bg-rayo-gold/10 border-rayo-gold text-white shadow-[0_0_20px_rgba(197,160,89,0.15)]'
                : 'bg-black/20 border-white/[0.06] text-rayo-bone/70 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-rayo-gold">
                3. VÍDEO CLIPS
              </span>
              <span className="material-symbols-outlined text-lg">movie</span>
            </div>
            <h4 className="font-bold text-sm text-white">Clips y Golazos ({clips.length})</h4>
            <p className="text-[11px] text-rayo-bone/50 mt-1">Subir desde PC o YouTube para jugadas épicas</p>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SECCIÓN DESTACADA: ÚLTIMA JORNADA (VÍDEO / CARRUSEL)   */}
      {/* ========================================================= */}
      {activeSubTab === 'featured' && featuredMatch && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Media Controller: Video vs Carousel */}
          <div className="elite-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-display font-bold text-rayo-gold uppercase tracking-widest">
                  SELECCIÓN DE FORMATO AUDIOVISUAL
                </span>
                <h3 className="font-display text-xl font-bold text-white uppercase mt-0.5">
                  Cabecera del Partido: {featuredMatch.mediaType === 'video' ? 'Vídeo Resumen' : 'Carrusel de Imágenes'}
                </h3>
              </div>

              {/* Mode Toggle Switch */}
              <div className="inline-flex p-1 rounded-xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => setFeaturedMatch({ ...featuredMatch, mediaType: 'video' })}
                  className={`px-4 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    featuredMatch.mediaType === 'video'
                      ? 'bg-rayo-gold text-rayo-carbon shadow-md'
                      : 'text-rayo-bone/70 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">play_circle</span>
                  Vídeo (Subido o YouTube)
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedMatch({ ...featuredMatch, mediaType: 'carousel' })}
                  className={`px-4 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    featuredMatch.mediaType === 'carousel'
                      ? 'bg-rayo-gold text-rayo-carbon shadow-md'
                      : 'text-rayo-bone/70 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">view_carousel</span>
                  Carrusel de Fotos (Sin vídeo)
                </button>
              </div>
            </div>

            {/* VIDEO CONFIGURATION */}
            {featuredMatch.mediaType === 'video' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-display font-bold text-rayo-gold uppercase tracking-wider mb-2">
                      Origen del Vídeo
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setFeaturedMatch({ ...featuredMatch, videoSourceType: 'youtube' })}
                        className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                          featuredMatch.videoSourceType === 'youtube'
                            ? 'bg-red-500/10 border-red-500/60 text-white'
                            : 'bg-black/30 border-white/10 text-rayo-bone/60'
                        }`}
                      >
                        <span className="material-symbols-outlined text-red-500 text-xl">smart_display</span>
                        <div>
                          <div className="text-xs font-bold uppercase">Enlace de YouTube</div>
                          <div className="text-[10px] text-rayo-bone/50">Pegar URL del vídeo oficial</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFeaturedMatch({ ...featuredMatch, videoSourceType: 'upload' })}
                        className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                          featuredMatch.videoSourceType === 'upload'
                            ? 'bg-rayo-gold/10 border-rayo-gold/60 text-white'
                            : 'bg-black/30 border-white/10 text-rayo-bone/60'
                        }`}
                      >
                        <span className="material-symbols-outlined text-rayo-gold text-xl">cloud_upload</span>
                        <div>
                          <div className="text-xs font-bold uppercase">Subir desde PC</div>
                          <div className="text-[10px] text-rayo-bone/50">Archivo MP4 / WebM</div>
                        </div>
                      </button>
                    </div>

                    {/* YouTube Input */}
                    {featuredMatch.videoSourceType === 'youtube' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                            URL de YouTube
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={featuredMatch.videoUrl}
                              onChange={e => {
                                const val = e.target.value;
                                const ytThumb = getYouTubeThumbnail(val);
                                setFeaturedMatch({
                                  ...featuredMatch,
                                  videoUrl: val,
                                  videoThumbnail: ytThumb || featuredMatch.videoThumbnail
                                });
                              }}
                              placeholder="Ej: https://www.youtube.com/watch?v=..."
                              className="flex-1 px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:border-rayo-gold focus:outline-none font-mono"
                            />
                          </div>
                          <p className="text-[10px] text-rayo-bone/50 mt-1">
                            Se extraerá automáticamente el thumbnail y el reproductor integrado para la web.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Local PC Upload Input */}
                    {featuredMatch.videoSourceType === 'upload' && (
                      <div className="space-y-3">
                        <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                          Seleccionar archivo de vídeo de tu ordenador
                        </label>
                        <div className="p-5 border-2 border-dashed border-white/15 rounded-xl text-center bg-black/20 hover:border-rayo-gold/50 transition-colors">
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg"
                            id="featured-video-file"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadFromComputer(file, 'video', url => {
                                  setFeaturedMatch({
                                    ...featuredMatch,
                                    videoUrl: url,
                                    videoSourceType: 'upload'
                                  });
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor="featured-video-file"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-3xl text-rayo-gold">
                              upload_file
                            </span>
                            <span className="text-xs font-semibold text-white">
                              {uploadingFile ? 'Subiendo vídeo...' : 'Haz clic para elegir vídeo (MP4 o WebM)'}
                            </span>
                            <span className="text-[10px] text-rayo-bone/50">
                              Se guardará directamente en el servidor local de Rayo Pelón
                            </span>
                          </label>
                        </div>
                        {featuredMatch.videoUrl && (
                          <div className="text-xs text-emerald-400 font-mono bg-emerald-950/40 p-2 rounded border border-emerald-500/30 flex items-center justify-between">
                            <span>Archivo cargado: {featuredMatch.videoUrl}</span>
                            <button
                              type="button"
                              onClick={() => setFeaturedMatch({ ...featuredMatch, videoUrl: '' })}
                              className="text-rose-400 hover:underline"
                            >
                              Quitar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Video Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                        Título del Resumen
                      </label>
                      <input
                        type="text"
                        value={featuredMatch.videoTitle}
                        onChange={e => setFeaturedMatch({ ...featuredMatch, videoTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:border-rayo-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                        Jugador MVP
                      </label>
                      <input
                        type="text"
                        value={featuredMatch.mvp}
                        onChange={e => setFeaturedMatch({ ...featuredMatch, mvp: e.target.value })}
                        placeholder="Ej: Dani Pérez (3 Goles)"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:border-rayo-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                        Duración del Vídeo
                      </label>
                      <input
                        type="text"
                        value={featuredMatch.videoDuration}
                        onChange={e => setFeaturedMatch({ ...featuredMatch, videoDuration: e.target.value })}
                        placeholder="Ej: 06:45"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:border-rayo-gold focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                        Contador de Visualizaciones
                      </label>
                      <input
                        type="text"
                        value={featuredMatch.views}
                        onChange={e => setFeaturedMatch({ ...featuredMatch, views: e.target.value })}
                        placeholder="Ej: 1.8K visualizaciones"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:border-rayo-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Thumbnail Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                      Miniatura de Portada (Carátula)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={featuredMatch.videoThumbnail}
                        onChange={e => setFeaturedMatch({ ...featuredMatch, videoThumbnail: e.target.value })}
                        placeholder="URL de la imagen o sube una desde tu PC"
                        className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:border-rayo-gold focus:outline-none font-mono"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        id="featured-thumb-file"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadFromComputer(file, 'image', url => {
                              setFeaturedMatch({ ...featuredMatch, videoThumbnail: url });
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor="featured-thumb-file"
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">upload</span> Subir PC
                      </label>
                    </div>
                  </div>
                </div>

                {/* Video Preview Box */}
                <div className="lg:col-span-5 bg-black/50 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] font-display font-bold text-rayo-gold uppercase tracking-widest block mb-2">
                    VISTA PREVIA DEL REPRODUCTOR
                  </span>

                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/80 flex items-center justify-center">
                    {featuredMatch.videoUrl && extractYouTubeId(featuredMatch.videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(featuredMatch.videoUrl)}
                        title="YouTube Preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : featuredMatch.videoUrl ? (
                      <video
                        src={featuredMatch.videoUrl}
                        controls
                        poster={featuredMatch.videoThumbnail}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <img
                          src={featuredMatch.videoThumbnail || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover brightness-75"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-rayo-gold text-black flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-2xl font-bold ml-0.5">play_arrow</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-rayo-bone/70">
                    <strong className="text-white block font-display uppercase">{featuredMatch.videoTitle}</strong>
                    <div className="flex items-center gap-3 text-[11px] text-rayo-bone/50 mt-1">
                      <span>{featuredMatch.videoDuration}</span>
                      <span>•</span>
                      <span>{featuredMatch.views}</span>
                      <span>•</span>
                      <span className="text-rayo-gold">{featuredMatch.mvp}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CAROUSEL CONFIGURATION (IF NO VIDEO) */}
            {featuredMatch.mediaType === 'carousel' && (
              <div className="pt-6 space-y-6">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-400 text-xl mt-0.5">info</span>
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong>Modo Carrusel Activo:</strong> Como no hay vídeo disponible para este partido, en la primera sección pública se mostrará una galería interactiva en carrusel con fotos de la jornada. Puedes añadir fotos desde tu ordenador o pegar enlaces directos.
                  </div>
                </div>

                {/* Add Photo to Carousel */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <span className="text-xs font-display font-bold text-white uppercase tracking-wider block">
                    Añadir Foto al Carrusel de la Jornada
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newCarouselImgUrl}
                      onChange={e => setNewCarouselImgUrl(e.target.value)}
                      placeholder="URL de la imagen (o sube una directamente desde tu ordenador ->)"
                      className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs focus:border-rayo-gold focus:outline-none font-mono"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      id="carousel-img-file"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadFromComputer(file, 'image', url => {
                            handleAddCarouselImage(url);
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor="carousel-img-file"
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      Subir Foto de PC
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddCarouselImage(newCarouselImgUrl)}
                      className="px-4 py-2 rounded-lg bg-rayo-gold text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider hover:bg-rayo-goldLight"
                    >
                      Añadir por URL
                    </button>
                  </div>
                </div>

                {/* Current Carousel Photos */}
                <div>
                  <span className="text-xs font-display font-bold text-rayo-gold uppercase tracking-wider block mb-3">
                    Fotos Actuales en el Carrusel ({featuredMatch.carouselImages?.length || 0})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {featuredMatch.carouselImages?.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-lg overflow-hidden aspect-video border border-white/10 bg-black/60 shadow-lg"
                      >
                        <img src={imgUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveCarouselImage(idx)}
                            className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md"
                            title="Eliminar del carrusel"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white/90">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* MARCADOR DEL PARTIDO, CRONOLOGÍA DE GOLES Y ESTADÍSTICAS  */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 6 cols: Marcador & Datos Generales */}
            <div className="lg:col-span-6 elite-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-display font-bold text-rayo-gold uppercase tracking-widest">
                    CONFIGURACIÓN DEL MARCADOR
                  </span>
                  <h3 className="font-display text-lg font-bold text-white uppercase mt-0.5">
                    Resultado & Datos de Jornada
                  </h3>
                </div>
                <span className="material-symbols-outlined text-rayo-gold text-2xl">scoreboard</span>
              </div>

              {/* Match Header info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Jornada</label>
                  <input
                    type="number"
                    value={featuredMatch.matchday}
                    onChange={e => setFeaturedMatch({ ...featuredMatch, matchday: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Competición</label>
                  <input
                    type="text"
                    value={featuredMatch.competition}
                    onChange={e => setFeaturedMatch({ ...featuredMatch, competition: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Fecha y Hora</label>
                  <input
                    type="text"
                    value={featuredMatch.date}
                    onChange={e => setFeaturedMatch({ ...featuredMatch, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Ubicación / Campo</label>
                  <input
                    type="text"
                    value={featuredMatch.location}
                    onChange={e => setFeaturedMatch({ ...featuredMatch, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Scoreline Editor */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-rayo-gold/[0.08] via-black/40 to-rayo-burgundy/[0.1] border border-rayo-gold/30">
                <span className="text-[10px] font-display font-bold text-rayo-gold uppercase tracking-widest block text-center mb-3">
                  MARCADOR OFICIAL
                </span>
                <div className="grid grid-cols-2 gap-4">
                  {/* Home Team */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white uppercase block">Equipo Local</label>
                    <input
                      type="text"
                      value={featuredMatch.homeTeam.name}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          homeTeam: { ...featuredMatch.homeTeam, name: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded bg-black/50 border border-white/10 text-white text-xs font-semibold"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rayo-bone/60">Goles:</span>
                      <input
                        type="number"
                        value={featuredMatch.homeTeam.score}
                        onChange={e =>
                          setFeaturedMatch({
                            ...featuredMatch,
                            homeTeam: { ...featuredMatch.homeTeam, score: Number(e.target.value) }
                          })
                        }
                        className="w-16 px-2 py-1 rounded bg-[#07070F] border border-rayo-gold/40 text-rayo-gold font-bold text-center text-lg font-mono"
                      />
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white uppercase block">Equipo Visitante</label>
                    <input
                      type="text"
                      value={featuredMatch.awayTeam.name}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          awayTeam: { ...featuredMatch.awayTeam, name: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded bg-black/50 border border-white/10 text-white text-xs font-semibold"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rayo-bone/60">Goles:</span>
                      <input
                        type="number"
                        value={featuredMatch.awayTeam.score}
                        onChange={e =>
                          setFeaturedMatch({
                            ...featuredMatch,
                            awayTeam: { ...featuredMatch.awayTeam, score: Number(e.target.value) }
                          })
                        }
                        className="w-16 px-2 py-1 rounded bg-[#07070F] border border-rayo-gold/40 text-rayo-gold font-bold text-center text-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Stats / Telemetry Editor */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-display font-bold text-rayo-gold uppercase tracking-wider block">
                  Estadísticas del Encuentro (Local / Visitante)
                </span>

                <div className="space-y-2 text-xs">
                  {/* Shots */}
                  <div className="flex items-center justify-between gap-3 p-2 rounded bg-black/30 border border-white/5">
                    <input
                      type="number"
                      value={featuredMatch.stats.shots.home}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          stats: {
                            ...featuredMatch.stats,
                            shots: { ...featuredMatch.stats.shots, home: Number(e.target.value) }
                          }
                        })
                      }
                      className="w-14 px-2 py-1 rounded bg-black/50 border border-white/10 text-rayo-gold font-bold text-center"
                    />
                    <span className="text-white/80 font-semibold uppercase text-[11px]">Tiros Totales</span>
                    <input
                      type="number"
                      value={featuredMatch.stats.shots.away}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          stats: {
                            ...featuredMatch.stats,
                            shots: { ...featuredMatch.stats.shots, away: Number(e.target.value) }
                          }
                        })
                      }
                      className="w-14 px-2 py-1 rounded bg-black/50 border border-white/10 text-white/80 font-bold text-center"
                    />
                  </div>

                  {/* Possession */}
                  <div className="flex items-center justify-between gap-3 p-2 rounded bg-black/30 border border-white/5">
                    <input
                      type="text"
                      value={featuredMatch.stats.possession.home}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          stats: {
                            ...featuredMatch.stats,
                            possession: { ...featuredMatch.stats.possession, home: e.target.value }
                          }
                        })
                      }
                      placeholder="58%"
                      className="w-14 px-2 py-1 rounded bg-black/50 border border-white/10 text-rayo-gold font-bold text-center"
                    />
                    <span className="text-white/80 font-semibold uppercase text-[11px]">Posesión Balón</span>
                    <input
                      type="text"
                      value={featuredMatch.stats.possession.away}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          stats: {
                            ...featuredMatch.stats,
                            possession: { ...featuredMatch.stats.possession, away: e.target.value }
                          }
                        })
                      }
                      placeholder="42%"
                      className="w-14 px-2 py-1 rounded bg-black/50 border border-white/10 text-white/80 font-bold text-center"
                    />
                  </div>

                  {/* Corners */}
                  <div className="flex items-center justify-between gap-3 p-2 rounded bg-black/30 border border-white/5">
                    <input
                      type="number"
                      value={featuredMatch.stats.corners.home}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          stats: {
                            ...featuredMatch.stats,
                            corners: { ...featuredMatch.stats.corners, home: Number(e.target.value) }
                          }
                        })
                      }
                      className="w-14 px-2 py-1 rounded bg-black/50 border border-white/10 text-rayo-gold font-bold text-center"
                    />
                    <span className="text-white/80 font-semibold uppercase text-[11px]">Córners</span>
                    <input
                      type="number"
                      value={featuredMatch.stats.corners.away}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          stats: {
                            ...featuredMatch.stats,
                            corners: { ...featuredMatch.stats.corners, away: Number(e.target.value) }
                          }
                        })
                      }
                      className="w-14 px-2 py-1 rounded bg-black/50 border border-white/10 text-white/80 font-bold text-center"
                    />
                  </div>

                  {/* Fouls */}
                  <div className="flex items-center justify-between gap-3 p-2 rounded bg-black/30 border border-white/5">
                    <input
                      type="number"
                      value={featuredMatch.stats.fouls.home}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          stats: {
                            ...featuredMatch.stats,
                            fouls: { ...featuredMatch.stats.fouls, home: Number(e.target.value) }
                          }
                        })
                      }
                      className="w-14 px-2 py-1 rounded bg-black/50 border border-white/10 text-rayo-gold font-bold text-center"
                    />
                    <span className="text-white/80 font-semibold uppercase text-[11px]">Faltas Cometidas</span>
                    <input
                      type="number"
                      value={featuredMatch.stats.fouls.away}
                      onChange={e =>
                        setFeaturedMatch({
                          ...featuredMatch,
                          stats: {
                            ...featuredMatch.stats,
                            fouls: { ...featuredMatch.stats.fouls, away: Number(e.target.value) }
                          }
                        })
                      }
                      className="w-14 px-2 py-1 rounded bg-black/50 border border-white/10 text-white/80 font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Cronología de Goles & Jugadas */}
            <div className="lg:col-span-6 elite-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                  <div>
                    <span className="text-[10px] font-display font-bold text-rayo-gold uppercase tracking-widest">
                      CRONOLOGÍA DE GOLES
                    </span>
                    <h3 className="font-display text-lg font-bold text-white uppercase mt-0.5">
                      Goles y Minutos del Partido ({featuredMatch.timeline?.length || 0})
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTimelineEvent(null);
                      setTimelineForm({ minute: "15'", player: '', type: 'GOL', team: 'rayo', text: '' });
                      setShowTimelineModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Añadir Gol/Evento
                  </button>
                </div>

                {/* Event List */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {featuredMatch.timeline?.map((ev, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                        ev.team === 'rayo'
                          ? 'bg-rayo-gold/[0.04] border-rayo-gold/30'
                          : 'bg-white/[0.02] border-white/10 opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rayo-gold/20 text-rayo-gold">
                          {ev.minute}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <strong className="text-white font-medium truncate">{ev.player}</strong>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                              {ev.type}
                            </span>
                            <span className="text-[10px] text-rayo-bone/40">({ev.team === 'rayo' ? 'Rayo' : 'Rival'})</span>
                          </div>
                          <p className="text-[11px] text-rayo-bone/70 truncate">{ev.text}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingTimelineEvent(idx);
                            setTimelineForm(ev);
                            setShowTimelineModal(true);
                          }}
                          className="p-1 rounded text-rayo-bone/60 hover:text-white"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTimelineEvent(idx)}
                          className="p-1 rounded text-rose-400 hover:text-rose-300"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Featured Match Button */}
              <div className="pt-6 border-t border-white/[0.08] mt-6">
                <button
                  type="button"
                  onClick={handleSaveFeaturedMatch}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(197,160,89,0.3)] transition-all"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  {loading ? 'Guardando en Servidor...' : 'Guardar Todo el Destacado de Última Jornada'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SECCIÓN FOTOTECA: GALERÍA DE IMÁGENES DE LOS PARTIDOS  */}
      {/* ========================================================= */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Todas', value: 'todos' },
                { label: 'En el Campo (Partidos)', value: 'partidos' },
                { label: 'Celebraciones', value: 'celebraciones' },
                { label: 'Vestuario & Piña', value: 'vestuario' },
                { label: 'Entrenamientos', value: 'entrenos' }
              ].map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedGalleryCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all ${
                    selectedGalleryCategory === cat.value
                      ? 'bg-rayo-gold text-rayo-carbon shadow-md'
                      : 'bg-white/[0.04] text-rayo-bone/70 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Add Photo Button */}
            <button
              type="button"
              onClick={() => handleOpenPhotoModal()}
              className="px-4 py-2.5 rounded-xl bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
            >
              <span className="material-symbols-outlined text-lg">add_a_photo</span>
              Subir Nueva Foto a la Galería
            </button>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGallery.map(photo => (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden elite-card border border-white/[0.08] aspect-[4/3] flex flex-col justify-between shadow-xl"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="absolute inset-0 w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-black/20 to-transparent"></div>

                {/* Top Badge & Actions */}
                <div className="relative z-10 p-3 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-rayo-gold uppercase tracking-wider border border-white/10">
                    {photo.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPhotoModal(photo)}
                      className="w-7 h-7 rounded-full bg-black/70 hover:bg-rayo-gold hover:text-black text-white flex items-center justify-center transition-colors"
                      title="Editar foto"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                      title="Eliminar foto"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Title & Tag */}
                <div className="relative z-10 p-3.5">
                  <span className="text-[10px] font-mono text-rayo-gold/80 block mb-0.5">{photo.tag}</span>
                  <h4 className="font-display text-sm font-bold text-white uppercase leading-snug truncate">
                    {photo.title}
                  </h4>
                  <span className="text-[10px] text-rayo-bone/50 block mt-0.5">{photo.date}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredGallery.length === 0 && (
            <div className="text-center py-16 elite-card rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-4xl text-rayo-bone/40 mb-2">no_photography</span>
              <p className="text-sm text-rayo-bone/60">No hay fotos en esta categoría.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SECCIÓN CLIPS: CLIPS Y MEJORES JUGADAS                 */}
      {/* ========================================================= */}
      {activeSubTab === 'clips' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <span className="text-xs text-rayo-gold font-semibold uppercase tracking-wider">
                {clips.length} Clips Registrados en la Web
              </span>
              <p className="text-xs text-rayo-bone/60 mt-0.5">
                Los aficionados pueden reproducir los clips directamente con el reproductor integrado o YouTube.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenClipModal()}
              className="px-4 py-2.5 rounded-xl bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
            >
              <span className="material-symbols-outlined text-lg">movie</span>
              Añadir Nuevo Clip
            </button>
          </div>

          {/* Clips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map(clip => (
              <div
                key={clip.id}
                className="elite-card rounded-xl overflow-hidden border border-white/[0.08] hover:border-rayo-gold/40 transition-all flex flex-col justify-between shadow-xl"
              >
                {/* Thumbnail with overlay */}
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  <img
                    src={clip.imageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'}
                    alt={clip.title}
                    className="w-full h-full object-cover filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070F] via-black/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded bg-rayo-burgundy/90 text-white font-display text-[9px] font-bold uppercase tracking-wider border border-white/10">
                      {clip.tag}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/80">
                      {clip.sourceType === 'youtube' ? 'YouTube' : 'Vídeo PC'}
                    </span>
                  </div>

                  {/* Center Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-rayo-gold/90 text-black flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-2xl font-bold ml-0.5">play_arrow</span>
                    </div>
                  </div>

                  {/* Duration */}
                  {clip.duration && (
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-[#07070F]/90 font-mono text-[10px] text-white border border-white/10">
                      {clip.duration}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-rayo-gold uppercase font-semibold block">{clip.match}</span>
                    <h4 className="font-display text-base font-bold text-white uppercase mt-0.5 leading-snug">
                      {clip.title}
                    </h4>
                    {clip.description && (
                      <p className="text-xs text-rayo-bone/60 mt-1 line-clamp-2">{clip.description}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-rayo-bone/50">{clip.views}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenClipModal(clip)}
                        className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/10 text-xs text-white font-semibold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClip(clip.id)}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-300 flex items-center"
                        title="Eliminar clip"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AÑADIR / EDITAR FOTO DE LA GALERÍA                 */}
      {/* ========================================================= */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B0D1F] border border-white/15 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="font-display text-lg font-bold text-white uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-rayo-gold">add_photo_alternate</span>
                {editingPhoto ? 'Editar Foto de la Galería' : 'Añadir Nueva Foto a la Galería'}
              </h3>
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4 text-xs">
              {/* Image Upload or URL */}
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                  Fotografía (Subir de PC o URL)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={photoForm.imageUrl}
                    onChange={e => setPhotoForm({ ...photoForm, imageUrl: e.target.value })}
                    placeholder="URL de la imagen o selecciona archivo de tu ordenador ->"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="photo-modal-file"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadFromComputer(file, 'image', url => {
                          setPhotoForm({ ...photoForm, imageUrl: url });
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="photo-modal-file"
                    className="px-3 py-2 rounded-lg bg-rayo-gold text-rayo-carbon font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span> Subir PC
                  </label>
                </div>

                {photoForm.imageUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/15 bg-black/40 max-h-40">
                    <img src={photoForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Título de la Foto</label>
                <input
                  type="text"
                  required
                  value={photoForm.title}
                  onChange={e => setPhotoForm({ ...photoForm, title: e.target.value })}
                  placeholder="Ej: Euforia en la grada tras el gol"
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                  Categoría de Clasificación
                </label>
                <select
                  value={photoForm.category}
                  onChange={e => setPhotoForm({ ...photoForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                >
                  <option value="partidos">EN EL CAMPO (PARTIDOS)</option>
                  <option value="celebraciones">CELEBRACIONES</option>
                  <option value="vestuario">VESTUARIO & PIÑA</option>
                  <option value="entrenos">ENTRENAMIENTOS</option>
                </select>
              </div>

              {/* Tag & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Etiqueta (Tag)</label>
                  <input
                    type="text"
                    value={photoForm.tag}
                    onChange={e => setPhotoForm({ ...photoForm, tag: e.target.value })}
                    placeholder="Ej: J13 vs Ibense"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Fecha</label>
                  <input
                    type="text"
                    value={photoForm.date}
                    onChange={e => setPhotoForm({ ...photoForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={photoForm.description}
                  onChange={e => setPhotoForm({ ...photoForm, description: e.target.value })}
                  placeholder="Detalles de la jugada, ambiente o momento capturado..."
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display font-bold uppercase tracking-wider"
                >
                  {loading ? 'Guardando...' : editingPhoto ? 'Actualizar Foto' : 'Publicar Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AÑADIR / EDITAR CLIP O VÍDEO DESTACADO             */}
      {/* ========================================================= */}
      {clipsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B0D1F] border border-white/15 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="font-display text-lg font-bold text-white uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-rayo-gold">movie</span>
                {editingClip ? 'Editar Clip de Jugada' : 'Añadir Nuevo Clip / Golazo'}
              </h3>
              <button
                type="button"
                onClick={() => setClipsModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveClip} className="space-y-4 text-xs">
              {/* Source Switcher */}
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-2">
                  Formato de Subida del Vídeo
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setClipForm({ ...clipForm, sourceType: 'youtube' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase flex items-center justify-center gap-1.5 ${
                      clipForm.sourceType === 'youtube'
                        ? 'bg-red-500/10 border-red-500/60 text-white'
                        : 'bg-black/40 border-white/10 text-rayo-bone/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-red-500 text-base">smart_display</span>
                    Enlace de YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setClipForm({ ...clipForm, sourceType: 'upload' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase flex items-center justify-center gap-1.5 ${
                      clipForm.sourceType === 'upload'
                        ? 'bg-rayo-gold/10 border-rayo-gold/60 text-white'
                        : 'bg-black/40 border-white/10 text-rayo-bone/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-rayo-gold text-base">upload_file</span>
                    Subir Vídeo de PC
                  </button>
                </div>

                {clipForm.sourceType === 'youtube' ? (
                  <div>
                    <input
                      type="text"
                      value={clipForm.videoUrl}
                      onChange={e => {
                        const url = e.target.value;
                        const ytThumb = getYouTubeThumbnail(url);
                        setClipForm({
                          ...clipForm,
                          videoUrl: url,
                          imageUrl: ytThumb || clipForm.imageUrl
                        });
                      }}
                      placeholder="URL de YouTube (ej: https://youtu.be/...)"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                    />
                    <p className="text-[10px] text-rayo-bone/50 mt-1">
                      La miniatura de YouTube se extraerá automáticamente.
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      id="clip-modal-video-file"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadFromComputer(file, 'video', url => {
                            setClipForm({ ...clipForm, videoUrl: url, sourceType: 'upload' });
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor="clip-modal-video-file"
                      className="w-full p-4 border border-dashed border-white/20 rounded-lg text-center cursor-pointer block hover:border-rayo-gold/50 bg-black/30"
                    >
                      <span className="material-symbols-outlined text-rayo-gold text-2xl">cloud_upload</span>
                      <div className="font-semibold text-white mt-1">
                        {uploadingFile ? 'Subiendo vídeo...' : 'Seleccionar vídeo desde tu ordenador'}
                      </div>
                      {clipForm.videoUrl && (
                        <div className="text-[10px] text-emerald-400 font-mono mt-1">{clipForm.videoUrl}</div>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Title & Tag */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Título del Clip</label>
                  <input
                    type="text"
                    required
                    value={clipForm.title}
                    onChange={e => setClipForm({ ...clipForm, title: e.target.value })}
                    placeholder="Ej: Falta directa a la escuadra"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Etiqueta / Badge</label>
                  <input
                    type="text"
                    value={clipForm.tag}
                    onChange={e => setClipForm({ ...clipForm, tag: e.target.value })}
                    placeholder="Ej: GOLAZO DEL MES"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              {/* Thumbnail image */}
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                  Miniatura / Carátula
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clipForm.imageUrl}
                    onChange={e => setClipForm({ ...clipForm, imageUrl: e.target.value })}
                    placeholder="URL de la imagen o miniatura"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="clip-thumb-file"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadFromComputer(file, 'image', url => {
                          setClipForm({ ...clipForm, imageUrl: url });
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="clip-thumb-file"
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer font-semibold"
                  >
                    Subir PC
                  </label>
                </div>
              </div>

              {/* Duration & Match */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Duración</label>
                  <input
                    type="text"
                    value={clipForm.duration}
                    onChange={e => setClipForm({ ...clipForm, duration: e.target.value })}
                    placeholder="00:45"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Partido / Ref</label>
                  <input
                    type="text"
                    value={clipForm.match}
                    onChange={e => setClipForm({ ...clipForm, match: e.target.value })}
                    placeholder="J13 vs Ibense"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Vistas</label>
                  <input
                    type="text"
                    value={clipForm.views}
                    onChange={e => setClipForm({ ...clipForm, views: e.target.value })}
                    placeholder="2.4K views"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={clipForm.description}
                  onChange={e => setClipForm({ ...clipForm, description: e.target.value })}
                  placeholder="Detalles de la jugada..."
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClipsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display font-bold uppercase tracking-wider"
                >
                  {loading ? 'Guardando...' : editingClip ? 'Actualizar Clip' : 'Publicar Clip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AÑADIR / EDITAR EVENTO DE LA CRONOLOGÍA            */}
      {/* ========================================================= */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0D1F] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-scaleUp text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-display text-base font-bold text-white uppercase">
                {isEditingTimelineEvent !== null ? 'Editar Evento de Cronología' : 'Añadir Gol o Evento'}
              </h3>
              <button
                type="button"
                onClick={() => setShowTimelineModal(false)}
                className="text-white/60 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Minuto</label>
                  <input
                    type="text"
                    value={timelineForm.minute}
                    onChange={e => setTimelineForm({ ...timelineForm, minute: e.target.value })}
                    placeholder="Ej: 24'"
                    className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Tipo de Evento</label>
                  <input
                    type="text"
                    value={timelineForm.type}
                    onChange={e => setTimelineForm({ ...timelineForm, type: e.target.value })}
                    placeholder="GOL, GOLAZO, PARADÓN, etc."
                    className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Equipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTimelineForm({ ...timelineForm, team: 'rayo' })}
                    className={`py-1.5 px-3 rounded text-center font-bold uppercase transition-colors ${
                      timelineForm.team === 'rayo'
                        ? 'bg-rayo-gold text-rayo-carbon'
                        : 'bg-black/30 border border-white/10 text-white/70'
                    }`}
                  >
                    Rayo Pelón
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineForm({ ...timelineForm, team: 'rival' })}
                    className={`py-1.5 px-3 rounded text-center font-bold uppercase transition-colors ${
                      timelineForm.team === 'rival'
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/30 border border-white/10 text-white/70'
                    }`}
                  >
                    Rival
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">
                  Jugador o Protagonista
                </label>
                <input
                  type="text"
                  value={timelineForm.player}
                  onChange={e => setTimelineForm({ ...timelineForm, player: e.target.value })}
                  placeholder="Ej: Dani Pérez"
                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/80 uppercase mb-1">Descripción del Gol</label>
                <textarea
                  rows={2}
                  value={timelineForm.text}
                  onChange={e => setTimelineForm({ ...timelineForm, text: e.target.value })}
                  placeholder="Zurdazo cruzado tras asistencia al espacio (1-0)..."
                  className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/10 text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowTimelineModal(false)}
                className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTimelineEvent}
                className="px-4 py-1.5 rounded bg-rayo-gold text-rayo-carbon font-bold uppercase tracking-wider hover:bg-rayo-goldLight"
              >
                Guardar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
