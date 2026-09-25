import React, { useState, useEffect, useRef } from 'react';
import type { Player, PlayerPosition, PlayerStatus } from '../../types';
import { INITIAL_PLAYERS } from '../../data/mockData';
import { getAuthHeaders } from '../../context/AuthContext';

import { API_BASE } from '../../config/api';

export const AdminPlayersManager: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'info' | 'attributes' | 'stats'>('info');

  // Photo upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  // Form state
  const defaultFormData: Partial<Player> = {
    name: '',
    nickname: '',
    number: 1,
    position: 'DEL',
    age: 23,
    photoUrl: '',
    roleDescription: 'Guerrero del Rayo',
    rating: 80,
    status: 'Apto',
    statusDetail: '',
    featured: true,
    attributes: {
      ritmo: 80,
      tiro: 80,
      pase: 80,
      regate: 80,
      defensa: 80,
      fisico: 80,
      reflejos: 80,
      estirada: 80,
      saque: 80,
    },
    seasonStats: {
      matches: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      mvpCount: 0,
      cleanSheets: 0,
      penaltiesSaved: '0 / 0',
    },
  };

  const [formData, setFormData] = useState<Partial<Player>>(defaultFormData);

  // Fetch players from backend
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/players`);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
      } else {
        setPlayers(INITIAL_PLAYERS);
      }
    } catch {
      setPlayers(INITIAL_PLAYERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle local image file upload from computer
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Por favor selecciona un archivo de imagen válido (.png, .jpg, .webp)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast('error', 'La imagen es demasiado pesada (máximo 20MB)');
      return;
    }

    try {
      setUploadingPhoto(true);
      const reader = new FileReader();

      reader.onload = async () => {
        const dataUrl = reader.result as string;
        // Instant visual preview
        setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));

        try {
          const res = await fetch(`${API_BASE}/upload/player-photo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({
              filename: file.name,
              dataUrl,
            }),
          });

          const data = await res.json();
          if (res.ok && data.url) {
            setFormData((prev) => ({ ...prev, photoUrl: data.url }));
            showToast('success', '¡Foto guardada en el servidor con éxito!');
          } else {
            showToast('error', data.error || 'Error al guardar la foto en el servidor');
          }
        } catch {
          showToast('error', 'No se pudo conectar con el servidor para guardar la foto');
        } finally {
          setUploadingPhoto(false);
        }
      };

      reader.readAsDataURL(file);
    } catch {
      setUploadingPhoto(false);
      showToast('error', 'Error al procesar la foto');
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('success', 'Foto retirada');
  };

  // Open modal for creating new player
  const handleOpenCreate = () => {
    setEditingPlayer(null);
    setFormData(defaultFormData);
    setShowUrlInput(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveFormTab('info');
    setIsModalOpen(true);
  };

  // Open modal for editing player
  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setShowUrlInput(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormData({
      ...player,
      attributes: {
        ritmo: player.attributes.ritmo ?? 80,
        tiro: player.attributes.tiro ?? 80,
        pase: player.attributes.pase ?? 80,
        regate: player.attributes.regate ?? 80,
        defensa: player.attributes.defensa ?? 80,
        fisico: player.attributes.fisico ?? 80,
        reflejos: player.attributes.reflejos ?? 80,
        estirada: player.attributes.estirada ?? 80,
        saque: player.attributes.saque ?? 80,
      },
      seasonStats: {
        matches: player.seasonStats.matches ?? 0,
        goals: player.seasonStats.goals ?? 0,
        assists: player.seasonStats.assists ?? 0,
        yellowCards: player.seasonStats.yellowCards ?? 0,
        redCards: player.seasonStats.redCards ?? 0,
        mvpCount: player.seasonStats.mvpCount ?? 0,
        cleanSheets: player.seasonStats.cleanSheets ?? 0,
        penaltiesSaved: player.seasonStats.penaltiesSaved ?? '0 / 0',
      },
    });
    setActiveFormTab('info');
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('error', 'El nombre del jugador es obligatorio');
      return;
    }

    try {
      const url = editingPlayer
        ? `${API_BASE}/players/${editingPlayer.id}`
        : `${API_BASE}/players`;
      const method = editingPlayer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        showToast(
          'success',
          editingPlayer
            ? `¡${formData.name} actualizado correctamente!`
            : `¡${formData.name} añadido a la plantilla!`
        );
        setIsModalOpen(false);
        fetchPlayers();
      } else {
        showToast('error', result.error || 'Error al guardar los datos');
      }
    } catch {
      showToast('error', 'No se pudo conectar con el servidor backend (puerto 5000)');
    }
  };

  // Delete Player
  const handleDelete = async () => {
    if (!deletingPlayer) return;

    try {
      const res = await fetch(`${API_BASE}/players/${deletingPlayer.id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      const result = await res.json();

      if (res.ok) {
        showToast('success', `Jugador ${deletingPlayer.name} eliminado de la plantilla`);
        setDeletingPlayer(null);
        fetchPlayers();
      } else {
        showToast('error', result.error || 'No se pudo eliminar el jugador');
      }
    } catch {
      showToast('error', 'Error al conectar con el servidor backend');
    }
  };

  // Filter players
  const filteredPlayers = players.filter((p) => {
    const matchesPos = selectedPos === 'ALL' || p.position === selectedPos;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.nickname.toLowerCase().includes(query) ||
      p.number.toString().includes(query);
    return matchesPos && matchesSearch;
  });

  const getPositionBadge = (pos: PlayerPosition) => {
    switch (pos) {
      case 'DEL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'MED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'DEF':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'POR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getStatusBadge = (status: PlayerStatus) => {
    switch (status) {
      case 'Apto':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'En duda':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Baja':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Apercibido':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider animate-fadeIn shadow-2xl ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-mono uppercase mb-1">
            <span className="material-symbols-outlined text-sm">sports_soccer</span>
            ADMINISTRACIÓN DE VESTUARIO
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white tracking-tight">
            Gestión de Plantilla Oficial
          </h2>
          <p className="text-xs text-rayo-bone/60 mt-0.5">
            Alta, baja y edición completa de futbolistas, atributos FUT, media global y estadísticas de temporada
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg self-start sm:self-auto hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          Crear Nuevo Jugador
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Position filters */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Todos', value: 'ALL', count: players.length },
            { label: 'Porteros', value: 'POR', count: players.filter((p) => p.position === 'POR').length },
            { label: 'Defensas', value: 'DEF', count: players.filter((p) => p.position === 'DEF').length },
            { label: 'Medios', value: 'MED', count: players.filter((p) => p.position === 'MED').length },
            { label: 'Delanteros', value: 'DEL', count: players.filter((p) => p.position === 'DEL').length },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setSelectedPos(btn.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all ${
                selectedPos === btn.value
                  ? 'bg-rayo-gold text-rayo-carbon shadow-sm'
                  : 'bg-white/[0.04] text-rayo-bone/70 hover:text-white border border-white/[0.08]'
              }`}
            >
              {btn.label} <span className="opacity-60 text-[10px]">({btn.count})</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-rayo-bone/40 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, apodo o dorsal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-[#0A0A16] rounded-lg text-xs border border-white/[0.1] focus:outline-none focus:border-rayo-gold/50 text-white placeholder-rayo-bone/40 w-full sm:w-72 transition-all"
          />
        </div>
      </div>

      {/* Players List Table */}
      <div className="elite-card rounded-xl border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0A0A16] text-[10px] font-display uppercase tracking-wider text-rayo-gold border-b border-white/[0.08]">
                <th className="py-3 px-3 text-center">DOR</th>
                <th className="py-3 px-4">JUGADOR</th>
                <th className="py-3 px-3 text-center">POS</th>
                <th className="py-3 px-3 text-center">MEDIA</th>
                <th className="py-3 px-3 text-center">EDAD</th>
                <th className="py-3 px-3 text-center">PJ</th>
                <th className="py-3 px-3 text-center">GOLES</th>
                <th className="py-3 px-3 text-center">ASIST</th>
                <th className="py-3 px-3 text-center">TARJETAS</th>
                <th className="py-3 px-3 text-center">ESTADO</th>
                <th className="py-3 px-4 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-sans">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-rayo-bone/50 font-mono">
                    Cargando jugadores desde el servidor...
                  </td>
                </tr>
              ) : filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-rayo-bone/50">
                    No se encontraron jugadores que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 px-3 text-center font-display font-bold text-rayo-gold text-sm">
                      #{player.number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                          {player.photoUrl ? (
                            <img
                              src={player.photoUrl}
                              alt={player.name}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <span className="font-display font-bold text-xs text-rayo-gold">
                              {player.avatarInitials}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <span>{player.name}</span>
                            {player.nickname && player.nickname !== player.name && (
                              <span className="text-rayo-bone/50 text-[11px]">
                                "{player.nickname}"
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-rayo-bone/60 line-clamp-1">
                            {player.roleDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-display font-bold uppercase border ${getPositionBadge(player.position)}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-display font-bold text-sm text-rayo-gold bg-rayo-gold/10 px-2 py-0.5 rounded border border-rayo-gold/30">
                        {player.rating}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-rayo-bone/70">{player.age}</td>
                    <td className="py-3 px-3 text-center font-medium">{player.seasonStats.matches}</td>
                    <td className="py-3 px-3 text-center font-bold text-rayo-gold text-sm">
                      {player.seasonStats.goals}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{player.seasonStats.assists}</td>
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span className="text-amber-400 font-semibold">{player.seasonStats.yellowCards}🟨</span>{' '}
                      <span className="text-rose-400 font-semibold">{player.seasonStats.redCards}🟥</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadge(player.status)}`}>
                        ● {player.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(player)}
                          title="Editar jugador completo"
                          className="w-7 h-7 rounded bg-white/[0.06] hover:bg-rayo-gold hover:text-rayo-carbon text-rayo-bone border border-white/[0.1] flex items-center justify-center transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingPlayer(player)}
                          title="Eliminar jugador"
                          className="w-7 h-7 rounded bg-white/[0.06] hover:bg-rose-600 hover:text-white text-rose-400 border border-white/[0.1] flex items-center justify-center transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: CREAR / EDITAR JUGADOR COMPLETO                    */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0B0C1E] border border-rayo-gold/40 rounded-2xl shadow-2xl overflow-hidden my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-rayo-gold/10 via-transparent to-transparent">
              <div>
                <div className="inline-flex items-center gap-2 text-rayo-gold text-[10px] font-mono uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-xs">tune</span>
                  {editingPlayer ? `ID: ${editingPlayer.id}` : 'NUEVO REGISTRO'}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-white">
                  {editingPlayer ? `Editar: ${editingPlayer.name}` : 'Crear Nuevo Futbolista'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-rayo-bone flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/[0.08] bg-[#07070F] px-5 sm:px-6 pt-2 gap-2 text-xs font-display font-semibold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveFormTab('info')}
                className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeFormTab === 'info'
                    ? 'border-rayo-gold text-rayo-gold bg-white/[0.02]'
                    : 'border-transparent text-rayo-bone/60 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">badge</span>
                1. Datos Básicos
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('attributes')}
                className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeFormTab === 'attributes'
                    ? 'border-rayo-gold text-rayo-gold bg-white/[0.02]'
                    : 'border-transparent text-rayo-bone/60 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">sports_score</span>
                2. Media & Atributos FUT
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('stats')}
                className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeFormTab === 'stats'
                    ? 'border-rayo-gold text-rayo-gold bg-white/[0.02]'
                    : 'border-transparent text-rayo-bone/60 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">analytics</span>
                3. Estadísticas 26/27
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              
              {/* TAB 1: DATOS BÁSICOS */}
              {activeFormTab === 'info' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Sergio Requena"
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                        Apodo / Nombre Camiseta
                      </label>
                      <input
                        type="text"
                        value={formData.nickname || ''}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        placeholder="Ej: El Mosquito"
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                        Dorsal #
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        required
                        value={formData.number ?? 1}
                        onChange={(e) => setFormData({ ...formData, number: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                        Posición
                      </label>
                      <select
                        value={formData.position || 'DEL'}
                        onChange={(e) =>
                          setFormData({ ...formData, position: e.target.value as PlayerPosition })
                        }
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white"
                      >
                        <option value="POR">Portero (POR)</option>
                        <option value="DEF">Defensa (DEF)</option>
                        <option value="MED">Medio (MED)</option>
                        <option value="DEL">Delantero (DEL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                        Edad
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="60"
                        value={formData.age ?? 23}
                        onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                        Estado
                      </label>
                      <select
                        value={formData.status || 'Apto'}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value as PlayerStatus })
                        }
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white"
                      >
                        <option value="Apto">Apto</option>
                        <option value="En duda">En duda</option>
                        <option value="Baja">Baja</option>
                        <option value="Apercibido">Apercibido</option>
                      </select>
                    </div>
                  </div>

                  {/* FOTO DEL JUGADOR: SUBIDA DESDE ORDENADOR O URL */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-mono text-rayo-gold uppercase font-semibold">
                        Fotografía Oficial del Futbolista
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[10px] font-mono text-rayo-bone/60 hover:text-rayo-gold underline transition-colors"
                      >
                        {showUrlInput ? 'Ocultar entrada de URL' : 'O pegar enlace URL web'}
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Live Photo Preview Box */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-rayo-gold via-amber-400 to-yellow-200 shadow-lg flex-shrink-0">
                        <div className="w-full h-full rounded-xl overflow-hidden bg-[#07070F] flex items-center justify-center">
                          {formData.photoUrl ? (
                            <img
                              src={formData.photoUrl}
                              alt="Vista previa"
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-rayo-bone/40">
                              <span className="material-symbols-outlined text-3xl text-rayo-gold/60">
                                account_circle
                              </span>
                              <span className="text-[9px] uppercase font-mono mt-0.5">Sin foto</span>
                            </div>
                          )}
                        </div>
                        {uploadingPhoto && (
                          <div className="absolute inset-0 rounded-2xl bg-black/75 flex items-center justify-center backdrop-blur-xs">
                            <span className="material-symbols-outlined text-2xl text-rayo-gold animate-spin">
                              progress_activity
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Upload from Computer Controls */}
                      <div className="flex-1 w-full space-y-2">
                        {/* Hidden native file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={uploadingPhoto}
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-base">
                              {uploadingPhoto ? 'sync' : 'upload_file'}
                            </span>
                            <span>{uploadingPhoto ? 'Subiendo imagen...' : 'Subir Foto desde el Ordenador'}</span>
                          </button>

                          {formData.photoUrl && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-rose-400 border border-white/[0.1] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              <span>Quitar</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[10px] text-rayo-bone/60">
                          Formatos admitidos: <strong>PNG, JPG, JPEG, WEBP</strong>. El archivo se almacena en el servidor.
                        </p>

                        {/* Collapsible URL input */}
                        {showUrlInput && (
                          <div className="pt-2 animate-fadeIn">
                            <input
                              type="text"
                              value={formData.photoUrl || ''}
                              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                              placeholder="O pega una URL: https://... o /players/foto.png"
                              className="w-full px-3 py-1.5 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                      Frase / Rol Descriptivo
                    </label>
                    <input
                      type="text"
                      value={formData.roleDescription || ''}
                      onChange={(e) => setFormData({ ...formData, roleDescription: e.target.value })}
                      placeholder="Ej: Que rico se mueve con esa zurdita"
                      className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                        Detalle del Estado (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.statusDetail || ''}
                        onChange={(e) => setFormData({ ...formData, statusDetail: e.target.value })}
                        placeholder="Ej: Esguince de tobillo, 4 amarillas acumuladas..."
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-rayo-bone">
                        <input
                          type="checkbox"
                          checked={formData.featured ?? true}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-4 h-4 rounded bg-[#07070F] border-white/[0.2] text-rayo-gold focus:ring-0"
                        />
                        <span className="font-semibold">Jugador Titular / Destacado</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA Y ATRIBUTOS */}
              {activeFormTab === 'attributes' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Rating Media Global */}
                  <div className="p-4 rounded-xl bg-rayo-gold/10 border border-rayo-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <label className="text-xs font-display font-bold uppercase tracking-wider text-rayo-gold block">
                        Media Global (Rating FUT): {formData.rating}
                      </label>
                      <p className="text-[11px] text-rayo-bone/70">
                        Puntuación general visible en el cromo coleccionable (1 a 99)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="99"
                        value={formData.rating ?? 80}
                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                        className="w-36 accent-rayo-gold"
                      />
                      <input
                        type="number"
                        min="50"
                        max="99"
                        value={formData.rating ?? 80}
                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                        className="w-16 px-2 py-1.5 bg-[#07070F] rounded-lg text-xs border border-rayo-gold/40 text-center font-display font-bold text-rayo-gold"
                      />
                    </div>
                  </div>

                  {/* Atributos para Jugador de Campo */}
                  {formData.position !== 'POR' ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-display font-bold uppercase text-white tracking-wider">
                        Atributos de Jugador de Campo (1 - 99)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { key: 'ritmo', label: 'RIT (Ritmo)' },
                          { key: 'tiro', label: 'TIR (Tiro)' },
                          { key: 'pase', label: 'PAS (Pase)' },
                          { key: 'regate', label: 'REG (Regate)' },
                          { key: 'defensa', label: 'DEF (Defensa)' },
                          { key: 'fisico', label: 'FIS (Físico)' },
                        ].map((attr) => (
                          <div key={attr.key} className="p-3 rounded-lg bg-[#07070F] border border-white/[0.06]">
                            <label className="block text-[10px] font-mono text-rayo-bone/60 uppercase mb-1">
                              {attr.label}
                            </label>
                            <input
                              type="number"
                              min="30"
                              max="99"
                              value={(formData.attributes as any)?.[attr.key] ?? 80}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  attributes: {
                                    ...formData.attributes,
                                    [attr.key]: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-2 py-1.5 bg-white/[0.02] rounded text-xs border border-white/[0.1] text-center font-display font-bold text-white focus:border-rayo-gold/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Atributos para Portero */
                    <div className="space-y-3">
                      <h4 className="text-xs font-display font-bold uppercase text-emerald-400 tracking-wider">
                        Atributos de Portero (1 - 99)
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: 'reflejos', label: 'REF (Reflejos)' },
                          { key: 'estirada', label: 'EST (Estirada)' },
                          { key: 'saque', label: 'SAQ (Saque)' },
                        ].map((attr) => (
                          <div key={attr.key} className="p-3 rounded-lg bg-[#07070F] border border-emerald-500/20">
                            <label className="block text-[10px] font-mono text-emerald-400/80 uppercase mb-1">
                              {attr.label}
                            </label>
                            <input
                              type="number"
                              min="30"
                              max="99"
                              value={(formData.attributes as any)?.[attr.key] ?? 80}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  attributes: {
                                    ...formData.attributes,
                                    [attr.key]: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-2 py-1.5 bg-white/[0.02] rounded text-xs border border-white/[0.1] text-center font-display font-bold text-emerald-300 focus:border-emerald-400"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ESTADÍSTICAS 26/27 */}
              {activeFormTab === 'stats' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-rayo-bone/70">
                    Estas estadísticas alimentan en tiempo real la tabla general, las métricas del reverso de la carta y el ranking de <strong>MÁXIMOS GOLEADORES</strong> de la página de Inicio.
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                        Partidos Jugados (PJ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.seasonStats?.matches ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats!,
                              matches: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-rayo-gold uppercase mb-1 font-semibold">
                        Goles Anotados (G) ⚽
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.seasonStats?.goals ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats!,
                              goals: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-rayo-gold/40 focus:border-rayo-gold text-rayo-gold font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-rayo-bone/70 uppercase mb-1">
                        Asistencias (A) 🎯
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.seasonStats?.assists ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats!,
                              assists: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-amber-400 uppercase mb-1">
                        Tarjetas Amarillas 🟨
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.seasonStats?.yellowCards ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats!,
                              yellowCards: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-amber-500/30 text-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-rose-400 uppercase mb-1">
                        Tarjetas Rojas 🟥
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.seasonStats?.redCards ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats!,
                              redCards: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-rose-500/30 text-rose-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-rayo-gold uppercase mb-1">
                        Veces MVP 🏆
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.seasonStats?.mvpCount ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats!,
                              mvpCount: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:border-rayo-gold/50 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Extra POR Stats */}
                  {formData.position === 'POR' && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-mono text-emerald-400 uppercase mb-1">
                          Porterías a Cero (Clean Sheets)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.seasonStats?.cleanSheets ?? 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              seasonStats: {
                                ...formData.seasonStats!,
                                cleanSheets: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-emerald-500/30 text-emerald-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-emerald-400 uppercase mb-1">
                          Penaltis Parados (ej: "2 / 3")
                        </label>
                        <input
                          type="text"
                          value={formData.seasonStats?.penaltiesSaved ?? '0 / 0'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              seasonStats: {
                                ...formData.seasonStats!,
                                penaltiesSaved: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-[#07070F] rounded-lg text-xs border border-emerald-500/30 text-emerald-300 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  {activeFormTab !== 'info' && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFormTab(activeFormTab === 'stats' ? 'attributes' : 'info')
                      }
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-rayo-bone transition-colors"
                    >
                      ← Anterior
                    </button>
                  )}
                  {activeFormTab !== 'stats' && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFormTab(activeFormTab === 'info' ? 'attributes' : 'stats')
                      }
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-rayo-bone transition-colors"
                    >
                      Siguiente →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold uppercase tracking-wider text-rayo-bone transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    {editingPlayer ? 'Guardar Cambios' : 'Registrar Jugador'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRMAR ELIMINACIÓN                              */}
      {/* ========================================================= */}
      {deletingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0F0D24] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-display text-xl font-bold uppercase text-white">
                Eliminar Futbolista
              </h3>
            </div>
            <p className="text-xs text-rayo-bone/80 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente a{' '}
              <strong className="text-white">
                #{deletingPlayer.number} {deletingPlayer.name} ({deletingPlayer.nickname})
              </strong>{' '}
              de la plantilla oficial? Esta acción se guardará en la base de datos del servidor.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setDeletingPlayer(null)}
                className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold uppercase tracking-wider text-rayo-bone transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                Sí, Eliminar Jugador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
