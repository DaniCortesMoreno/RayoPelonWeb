import React, { useState, useEffect } from 'react';
import type { SeasonMatch } from '../../types';
import { SEASON_MATCHES } from '../../data/mockData';
import { getAuthHeaders } from '../../context/AuthContext';

import { API_BASE } from '../../config/api';

const TEAM_BADGES: Record<string, string> = {
  'Rayo Pelón FC': '/escudo.png',
  'Rayo Pelón': '/escudo.png',
  '131 Town FC': 'https://ligacomarcal.com/api/media/public/escudo/2026/241ef212-e851-4cd8-b555-00ae49244f75.webp',
  'Aston Birra FC': 'https://ligacomarcal.com/api/media/public/escudo/2026/9431a3e0-6d49-4217-a008-052cfe3010ed.webp',
  'Bankales FC': 'https://ligacomarcal.com/api/media/public/escudo/2026/77b47507-ecab-47e2-8de3-6dffe455c33d.webp',
  'Deceroacien FC': 'https://ligacomarcal.com/api/media/public/escudo/2026/0973e847-5017-40bf-9cca-bc6a2dda77a8.webp',
  'Glorios': 'https://ligacomarcal.com/api/media/public/escudo/2026/06f6a87b-baa2-4b10-a041-499f3ec2a3d6.webp',
  'JM.S FC': 'https://ligacomarcal.com/api/media/public/escudo/2026/cbe3be5a-072b-4e00-bef7-f68adf39807f.webp',
  'Nottingham Por': 'https://ligacomarcal.com/api/media/public/escudo/2026/d7e520cc-e154-42d6-a1eb-157f79c161d8.webp',
  'Royal Academy': 'https://ligacomarcal.com/api/media/public/escudo/2026/527e7e62-bdde-4607-9d9d-1c2ed45a8f09.webp',
  'Sera FC': 'https://ligacomarcal.com/api/media/public/escudo/2026/a576807c-124e-4d64-afdd-ea825d12ec38.webp',
  'Ultimate': 'https://ligacomarcal.com/api/media/public/escudo/2026/f8bd4e73-33c1-42af-a91b-6735bc094a88.webp',
  'Viejentus': 'https://ligacomarcal.com/api/media/public/escudo/2026/c6452596-d6f5-4e4e-a552-6684522c033c.webp'
};

const COMMON_FIELDS = [
  'Climent A',
  'Climent B',
  'Fco Vilaplana Mariel A',
  'Fco Vilaplana Mariel B',
  'Polideportivo Municipal de Ibi'
];

const LEAGUE_TEAMS = [
  'Rayo Pelón FC',
  '131 Town FC',
  'Aston Birra FC',
  'Bankales FC',
  'Deceroacien FC',
  'Glorios',
  'JM.S FC',
  'Nottingham Por',
  'Royal Academy',
  'Sera FC',
  'Ultimate',
  'Viejentus'
];

export const AdminMatchesManager: React.FC = () => {
  const [matches, setMatches] = useState<SeasonMatch[]>(SEASON_MATCHES);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'pendientes' | 'jugados'>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedJornada, setSelectedJornada] = useState<number | 'ALL'>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Full match modal (create / edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMatch, setEditingMatch] = useState<SeasonMatch | null>(null);

  // Quick Score modal
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [scoreMatch, setScoreMatch] = useState<SeasonMatch | null>(null);
  const [scoreHome, setScoreHome] = useState<number>(0);
  const [scoreAway, setScoreAway] = useState<number>(0);
  const [scoreNotes, setScoreNotes] = useState<string>('');
  const [scorePlayed, setScorePlayed] = useState<boolean>(true);

  // Delete modal
  const [deletingMatch, setDeletingMatch] = useState<SeasonMatch | null>(null);

  // Form State for Full Match
  const defaultFormData: Partial<SeasonMatch> = {
    jornada: 1,
    local: 'Rayo Pelón FC',
    visitante: '',
    dia_semana: 'domingo',
    fecha: '',
    fecha_iso: '',
    hora: '10:00',
    campo: 'Climent B',
    jugado: false,
    golesLocal: null,
    golesVisitante: null,
    notas: ''
  };
  const [formData, setFormData] = useState<Partial<SeasonMatch>>(defaultFormData);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/matches`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMatches(data.sort((a, b) => a.jornada - b.jornada));
        } else {
          setMatches(SEASON_MATCHES);
        }
      } else {
        setMatches(SEASON_MATCHES);
      }
    } catch {
      setMatches(SEASON_MATCHES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const openCreateModal = () => {
    setEditingMatch(null);
    const maxJornada = matches.length > 0 ? Math.max(...matches.map((m) => m.jornada)) : 0;
    setFormData({
      ...defaultFormData,
      jornada: maxJornada + 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (match: SeasonMatch) => {
    setEditingMatch(match);
    setFormData({ ...match });
    setIsModalOpen(true);
  };

  const openScoreModal = (match: SeasonMatch) => {
    setScoreMatch(match);
    setScoreHome(match.golesLocal ?? 0);
    setScoreAway(match.golesVisitante ?? 0);
    setScoreNotes(match.notas || '');
    setScorePlayed(match.jugado ?? false);
    setIsScoreModalOpen(true);
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.local || !formData.visitante) {
      showFeedback('error', 'Debes especificar el equipo local y el visitante.');
      return;
    }

    try {
      const isEdit = !!editingMatch;
      const url = isEdit ? `${API_BASE}/matches/${editingMatch.id}` : `${API_BASE}/matches`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar el partido');
      }

      await res.json();
      showFeedback('success', isEdit ? '✓ Partido actualizado correctamente' : '✓ Partido creado con éxito');
      setIsModalOpen(false);
      loadMatches();
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al conectar con el servidor.');
    }
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreMatch) return;

    try {
      const payload = {
        jugado: scorePlayed,
        golesLocal: scorePlayed ? scoreHome : null,
        golesVisitante: scorePlayed ? scoreAway : null,
        notas: scoreNotes
      };

      const res = await fetch(`${API_BASE}/matches/${scoreMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar el marcador');
      }

      showFeedback('success', `✓ Marcador de la J${scoreMatch.jornada} actualizado (${scoreHome} - ${scoreAway})`);
      setIsScoreModalOpen(false);
      loadMatches();
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al guardar el resultado.');
    }
  };

  const handleDeleteMatch = async () => {
    if (!deletingMatch) return;

    try {
      const res = await fetch(`${API_BASE}/matches/${deletingMatch.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar el partido');
      }

      showFeedback('success', `✓ Partido de Jornada ${deletingMatch.jornada} eliminado`);
      setDeletingMatch(null);
      loadMatches();
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al eliminar.');
    }
  };

  const handleResetCalendar = async () => {
    if (!window.confirm('¿Estás seguro de restablecer el calendario completo con las 22 jornadas oficiales de la temporada 26/27?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/matches/reset-default`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showFeedback('success', '✓ Calendario restablecido con las 22 jornadas oficiales');
        loadMatches();
      } else {
        showFeedback('error', 'No se pudo restablecer el calendario');
      }
    } catch {
      showFeedback('error', 'Error al conectar con el servidor.');
    }
  };

  // Filtered Matches
  const filteredMatches = matches.filter((m) => {
    if (filter === 'jugados' && !m.jugado) return false;
    if (filter === 'pendientes' && m.jugado) return false;
    if (selectedJornada !== 'ALL' && m.jornada !== selectedJornada) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchText = `${m.local} ${m.visitante} ${m.campo} ${m.fecha} ${m.dia_semana}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  const totalMatches = matches.length;
  const playedMatches = matches.filter((m) => m.jugado).length;
  const pendingMatches = totalMatches - playedMatches;
  const nextMatch = matches.find((m) => !m.jugado);

  const getTeamBadge = (teamName: string) => {
    return TEAM_BADGES[teamName] || '';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between shadow-lg animate-fadeIn border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
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

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="elite-card rounded-xl p-5 border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rayo-gold tracking-wider">Temporada 26/27</span>
            <span className="w-8 h-8 rounded-lg bg-rayo-gold/10 border border-rayo-gold/30 flex items-center justify-center text-rayo-gold">
              <span className="material-symbols-outlined text-base">calendar_month</span>
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-white mt-2">{totalMatches} Partidos</p>
          <span className="text-xs text-rayo-bone/60 mt-1 block">22 Jornadas Oficiales</span>
        </div>

        <div className="elite-card rounded-xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">Finalizados</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-base">sports_score</span>
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-white mt-2">{playedMatches} Jugados</p>
          <span className="text-xs text-emerald-400/80 mt-1 block">
            {playedMatches === 0 ? 'Pretemporada activa' : `${playedMatches} resultados anotados`}
          </span>
        </div>

        <div className="elite-card rounded-xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">Por Jugar</span>
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-base">schedule</span>
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-white mt-2">{pendingMatches} Pendientes</p>
          <span className="text-xs text-amber-300/80 mt-1 block">Compromisos de liga</span>
        </div>

        <div className="elite-gold-card rounded-xl p-5 border border-rayo-gold/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rayo-gold tracking-wider">Próxima Jornada</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          {nextMatch ? (
            <>
              <p className="font-display text-xl font-bold text-white mt-1.5 truncate">
                J{nextMatch.jornada}: {nextMatch.local.split(' ')[0]} vs {nextMatch.visitante.split(' ')[0]}
              </p>
              <span className="text-xs text-rayo-bone/80 mt-0.5 block truncate">
                {nextMatch.dia_semana.toUpperCase()} {nextMatch.fecha} • {nextMatch.hora}h ({nextMatch.campo})
              </span>
            </>
          ) : (
            <p className="text-xs text-rayo-bone/60 mt-2">Temporada finalizada</p>
          )}
        </div>
      </div>

      {/* Main Header & Controls */}
      <div className="elite-card rounded-xl p-6 border border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-rayo-gold mb-1">
              <span className="material-symbols-outlined text-sm">sports_soccer</span>
              CALENDARIO OFICIAL LIGA PLATA IBI
            </div>
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              Partidos & Marcadores 26/27
            </h2>
            <p className="text-xs text-rayo-bone/60 mt-0.5">
              Gestiona el calendario, anota resultados y actualiza en tiempo real el marcador público de la web.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetCalendar}
              title="Restablecer a las 22 jornadas originales del calendario"
              className="px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-rayo-bone text-xs font-semibold uppercase tracking-wider border border-white/[0.08] transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Reset Calendario
            </button>

            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Añadir Partido
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-[#07070F] p-1 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === 'all'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-sm'
                  : 'text-rayo-bone/60 hover:text-white'
              }`}
            >
              Todos ({totalMatches})
            </button>
            <button
              onClick={() => setFilter('pendientes')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === 'pendientes'
                  ? 'bg-amber-400 text-black font-bold shadow-sm'
                  : 'text-rayo-bone/60 hover:text-white'
              }`}
            >
              Pendientes ({pendingMatches})
            </button>
            <button
              onClick={() => setFilter('jugados')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === 'jugados'
                  ? 'bg-emerald-400 text-black font-bold shadow-sm'
                  : 'text-rayo-bone/60 hover:text-white'
              }`}
            >
              Jugados ({playedMatches})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined text-rayo-bone/40 absolute left-3 top-2.5 text-base">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar rival, campo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-rayo-bone/40 focus:outline-none focus:border-rayo-gold/60"
              />
            </div>

            {/* Jornada Selector Dropdown */}
            <select
              value={selectedJornada}
              onChange={(e) => setSelectedJornada(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold/60"
            >
              <option value="ALL">Todas las Jornadas</option>
              {matches.map((m) => (
                <option key={`j_opt_${m.id}`} value={m.jornada}>
                  Jornada {m.jornada}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matches List Grid */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs font-mono uppercase tracking-widest text-rayo-gold">
              <span className="material-symbols-outlined text-2xl animate-spin block mb-2">sync</span>
              Cargando calendario...
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="py-12 text-center text-rayo-bone/50 border border-dashed border-white/[0.08] rounded-xl">
              <span className="material-symbols-outlined text-3xl mb-1 text-rayo-gold/60">event_busy</span>
              <p className="text-xs uppercase font-semibold">No se encontraron partidos con los filtros aplicados</p>
            </div>
          ) : (
            filteredMatches.map((match) => {
              const isRayoLocal = match.local.toLowerCase().includes('rayo');
              const isRayoAway = match.visitante.toLowerCase().includes('rayo');
              const localBadge = getTeamBadge(match.local);
              const awayBadge = getTeamBadge(match.visitante);

              return (
                <div
                  key={match.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    match.jugado
                      ? 'bg-white/[0.02] border-white/[0.08] hover:border-emerald-500/40'
                      : 'bg-white/[0.03] border-white/[0.08] hover:border-rayo-gold/40'
                  }`}
                >
                  {/* Left Column: Jornada Badge & Date / Pitch Info */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-shrink-0">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#07070F] border border-white/[0.08] flex-shrink-0 text-center">
                      <span className="text-[9px] font-mono uppercase text-rayo-gold font-bold">JORNADA</span>
                      <span className="font-display font-bold text-lg text-white leading-none mt-0.5">
                        {match.jornada}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            match.jugado
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {match.jugado ? 'Finalizado' : 'Por Jugar'}
                        </span>
                        <span className="text-xs text-white font-semibold">
                          {match.dia_semana ? match.dia_semana.charAt(0).toUpperCase() + match.dia_semana.slice(1) : ''}{' '}
                          {match.fecha}
                        </span>
                        <span className="text-xs text-rayo-gold font-mono font-bold">• {match.hora}h</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-rayo-bone/60 mt-1">
                        <span className="material-symbols-outlined text-[14px] text-rayo-gold">location_on</span>
                        <span>{match.campo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Match Face-off and Score */}
                  <div className="flex-1 flex items-center justify-center px-2 sm:px-6">
                    <div className="flex items-center justify-between w-full max-w-lg gap-3">
                      {/* Local Team */}
                      <div className="flex items-center gap-2.5 flex-1 justify-end text-right">
                        <span
                          className={`text-xs sm:text-sm font-display font-bold uppercase tracking-wide truncate ${
                            isRayoLocal ? 'text-rayo-gold' : 'text-white'
                          }`}
                        >
                          {match.local}
                        </span>
                        {localBadge ? (
                          <img
                            src={localBadge}
                            alt={match.local}
                            className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                            {match.local.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Score Box / VS */}
                      <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#07070F] border border-white/[0.08] min-w-[70px] text-center">
                        {match.jugado ? (
                          <span className="font-display text-lg sm:text-xl font-bold text-rayo-gold tracking-widest">
                            {match.golesLocal ?? 0} - {match.golesVisitante ?? 0}
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
                            VS
                          </span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-2.5 flex-1 justify-start text-left">
                        {awayBadge ? (
                          <img
                            src={awayBadge}
                            alt={match.visitante}
                            className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                            {match.visitante.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span
                          className={`text-xs sm:text-sm font-display font-bold uppercase tracking-wide truncate ${
                            isRayoAway ? 'text-rayo-gold' : 'text-white'
                          }`}
                        >
                          {match.visitante}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06] flex-shrink-0">
                    <button
                      onClick={() => openScoreModal(match)}
                      title="Anotar / Modificar Marcador"
                      className="px-3 py-1.5 rounded bg-rayo-gold/15 hover:bg-rayo-gold/25 border border-rayo-gold/40 text-rayo-gold text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">scoreboard</span>
                      <span>Marcador</span>
                    </button>

                    <button
                      onClick={() => openEditModal(match)}
                      title="Editar Detalles del Partido"
                      className="p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-rayo-bone hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>

                    <button
                      onClick={() => setDeletingMatch(match)}
                      title="Eliminar Partido"
                      className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QUICK SCORE MODAL */}
      {isScoreModalOpen && scoreMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="elite-card rounded-2xl max-w-md w-full border border-rayo-gold/30 shadow-2xl p-6 sm:p-7 relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rayo-gold text-xl">scoreboard</span>
                <h3 className="font-display font-bold text-lg uppercase text-white">
                  Marcador • Jornada {scoreMatch.jornada}
                </h3>
              </div>
              <button
                onClick={() => setIsScoreModalOpen(false)}
                className="text-rayo-bone/60 hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="mt-6 space-y-6">
              {/* Teams & Score Input Controls */}
              <div className="grid grid-cols-2 gap-4 items-center bg-[#07070F] p-4 rounded-xl border border-white/[0.08]">
                {/* Local */}
                <div className="text-center">
                  <span className="text-[10px] font-mono uppercase text-rayo-gold font-bold block mb-1">LOCAL</span>
                  <p className="font-display font-bold text-xs uppercase text-white truncate px-1" title={scoreMatch.local}>
                    {scoreMatch.local}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setScoreHome(Math.max(0, scoreHome - 1))}
                      className="w-8 h-8 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center text-sm font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={scoreHome}
                      onChange={(e) => setScoreHome(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 h-10 text-center font-display text-2xl font-bold bg-[#0A0A16] border border-white/[0.1] rounded text-white focus:outline-none focus:border-rayo-gold"
                    />
                    <button
                      type="button"
                      onClick={() => setScoreHome(scoreHome + 1)}
                      className="w-8 h-8 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Visitante */}
                <div className="text-center">
                  <span className="text-[10px] font-mono uppercase text-rayo-gold font-bold block mb-1">VISITANTE</span>
                  <p className="font-display font-bold text-xs uppercase text-white truncate px-1" title={scoreMatch.visitante}>
                    {scoreMatch.visitante}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setScoreAway(Math.max(0, scoreAway - 1))}
                      className="w-8 h-8 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center text-sm font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={scoreAway}
                      onChange={(e) => setScoreAway(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 h-10 text-center font-display text-2xl font-bold bg-[#0A0A16] border border-white/[0.1] rounded text-white focus:outline-none focus:border-rayo-gold"
                    />
                    <button
                      type="button"
                      onClick={() => setScoreAway(scoreAway + 1)}
                      className="w-8 h-8 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Status toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <span className="text-xs font-semibold text-white block">Estado del Partido</span>
                  <span className="text-[11px] text-rayo-bone/60">
                    {scorePlayed ? 'Partido completado con resultado oficial' : 'Partido aún pendiente por disputarse'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scorePlayed}
                    onChange={(e) => setScorePlayed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Notes / Crónica */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-rayo-bone/70 mb-1.5">
                  Notas de Goleadores / Crónica (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Doblete de Sergio y golazo de falta de Felo"
                  value={scoreNotes}
                  onChange={(e) => setScoreNotes(e.target.value)}
                  className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-rayo-bone/40 focus:outline-none focus:border-rayo-gold"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScoreModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold uppercase tracking-wider text-rayo-bone"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  Guardar Marcador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL MATCH MODAL (CREATE / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="elite-card rounded-2xl max-w-xl w-full border border-white/[0.12] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rayo-gold text-2xl">
                  {editingMatch ? 'edit_calendar' : 'add_circle'}
                </span>
                <h3 className="font-display font-bold text-xl uppercase text-white">
                  {editingMatch ? `Editar Partido (Jornada ${formData.jornada})` : 'Añadir Nuevo Partido'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-rayo-bone/60 hover:text-white p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Jornada */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-rayo-bone/70 mb-1">Jornada</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formData.jornada || 1}
                    onChange={(e) => setFormData({ ...formData, jornada: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold"
                  />
                </div>

                {/* Día de la semana */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-rayo-bone/70 mb-1">Día Semana</label>
                  <select
                    value={formData.dia_semana || 'domingo'}
                    onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                    className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold"
                  >
                    <option value="domingo">Domingo</option>
                    <option value="viernes">Viernes</option>
                    <option value="sábado">Sábado</option>
                    <option value="lunes">Lunes</option>
                    <option value="miércoles">Miércoles</option>
                  </select>
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-rayo-bone/70 mb-1">Hora</label>
                  <input
                    type="text"
                    placeholder="10:00"
                    required
                    value={formData.hora || ''}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold"
                  />
                </div>
              </div>

              {/* Local & Visitante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-rayo-bone/70 mb-1">Equipo Local</label>
                  <input
                    type="text"
                    required
                    list="teams_list"
                    value={formData.local || ''}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-rayo-bone/70 mb-1">Equipo Visitante</label>
                  <input
                    type="text"
                    required
                    list="teams_list"
                    value={formData.visitante || ''}
                    onChange={(e) => setFormData({ ...formData, visitante: e.target.value })}
                    className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold"
                  />
                </div>
              </div>

              <datalist id="teams_list">
                {LEAGUE_TEAMS.map((t) => (
                  <option key={`tl_${t}`} value={t} />
                ))}
              </datalist>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-rayo-bone/70 mb-1">
                    Fecha Corta (Ej: 4 oct)
                  </label>
                  <input
                    type="text"
                    placeholder="4 oct"
                    value={formData.fecha || ''}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-rayo-bone/70 mb-1">
                    Fecha ISO (Para cuenta atrás)
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_iso || ''}
                    onChange={(e) => setFormData({ ...formData, fecha_iso: e.target.value })}
                    className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold"
                  />
                </div>
              </div>

              {/* Campo */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-rayo-bone/70 mb-1">Campo de Juego</label>
                <input
                  type="text"
                  list="fields_list"
                  placeholder="Climent B"
                  value={formData.campo || ''}
                  onChange={(e) => setFormData({ ...formData, campo: e.target.value })}
                  className="w-full bg-[#07070F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold"
                />
                <datalist id="fields_list">
                  {COMMON_FIELDS.map((f) => (
                    <option key={`fl_${f}`} value={f} />
                  ))}
                </datalist>
              </div>

              {/* Estado y resultado */}
              <div className="p-4 rounded-xl bg-[#07070F] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">¿Se ha jugado este partido?</span>
                    <span className="text-[10px] text-rayo-bone/60">Marca la casilla si ya ha finalizado</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.jugado || false}
                    onChange={(e) => setFormData({ ...formData, jugado: e.target.checked })}
                    className="w-4 h-4 rounded text-rayo-gold focus:ring-0 bg-white/10"
                  />
                </div>

                {formData.jugado && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-rayo-bone/70 mb-1">Goles Local</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.golesLocal ?? 0}
                        onChange={(e) => setFormData({ ...formData, golesLocal: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#0A0A16] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rayo-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-rayo-bone/70 mb-1">Goles Visitante</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.golesVisitante ?? 0}
                        onChange={(e) => setFormData({ ...formData, golesVisitante: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#0A0A16] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rayo-gold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold uppercase tracking-wider text-rayo-bone"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  {editingMatch ? 'Guardar Cambios' : 'Crear Partido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="elite-card rounded-2xl max-w-sm w-full border border-rose-500/30 shadow-2xl p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-rose-400 mb-2">warning</span>
            <h3 className="font-display font-bold text-lg uppercase text-white">¿Eliminar este Partido?</h3>
            <p className="text-xs text-rayo-bone/70 mt-2">
              Se eliminará el partido de la <strong className="text-white">Jornada {deletingMatch.jornada}</strong> (
              {deletingMatch.local} vs {deletingMatch.visitante}).
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingMatch(null)}
                className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold uppercase tracking-wider text-rayo-bone"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteMatch}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
