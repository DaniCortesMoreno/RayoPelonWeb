import React, { useState, useEffect } from 'react';
import { SEASON_MATCHES } from '../../data/mockData';
import type { SeasonMatch } from '../../types';
import { API_BASE } from '../../config/api';

const OFFICIAL_STANDINGS_URL = 'https://www.ligacomarcal.com/competicion/lc-futbol-7-ibi-plata-mtzfdn3f/clasificacion';

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

export const StandingsSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'standings' | 'matches'>('standings');
  const [matches, setMatches] = useState<SeasonMatch[]>(SEASON_MATCHES);
  const [matchFilter, setMatchFilter] = useState<'all' | 'pendientes' | 'jugados'>('all');

  // Carga inicial del calendario desde el backend si está activo
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const resMatches = await fetch(`${API_BASE}/matches`);
        if (resMatches.ok) {
          const mData = await resMatches.json();
          if (Array.isArray(mData) && mData.length > 0) {
            setMatches(mData.sort((a, b) => a.jornada - b.jornada));
          }
        }
      } catch {
        // Fallback local
      }
    };

    fetchMatches();
  }, []);

  const getTeamBadge = (name: string) => {
    return TEAM_BADGES[name] || '';
  };

  const filteredMatches = matches.filter((m) => {
    if (matchFilter === 'jugados') return m.jugado;
    if (matchFilter === 'pendientes') return !m.jugado;
    return true;
  });

  return (
    <section className="py-20 relative bg-rayo-carbon border-t border-white/[0.06]" id="clasificacion">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.18em] mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIGA COMARCAL • TEMPORADA 26/27
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-white tracking-tight">
              LIGA PLATA <span className="text-champagne-gradient">IBI F7</span>
            </h2>
            <p className="text-xs text-rayo-bone/60 mt-0.5 flex flex-wrap items-center gap-2">
              <span>Temporada Regular • 12 Equipos Oficiales • 22 Jornadas</span>
              <span>•</span>
              <a
                href={OFFICIAL_STANDINGS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rayo-gold hover:underline inline-flex items-center gap-1 font-mono"
              >
                <span>ligacomarcal.com</span>
                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
              </a>
            </p>
          </div>

          {/* View Mode Toggle: Clasificación vs Calendario */}
          <div className="flex flex-wrap items-center gap-2 bg-[#0A0A16] p-1.5 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setViewMode('standings')}
              className={`px-4 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                viewMode === 'standings'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-base">leaderboard</span>
              Clasificación Oficial
            </button>

            <button
              onClick={() => setViewMode('matches')}
              className={`px-4 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                viewMode === 'matches'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-base">calendar_month</span>
              Calendario 26/27 (22 J)
            </button>
          </div>
        </div>

        {/* VIEW 1: CLASIFICACIÓN OFICIAL (BOTÓN Y ACCESO DIRECTO) */}
        {viewMode === 'standings' && (
          <div className="animate-fadeIn">
            <div className="elite-card rounded-2xl p-8 sm:p-12 lg:p-16 border border-rayo-gold/30 bg-gradient-to-b from-[#121224] via-[#0A0A16] to-[#06060D] shadow-2xl relative overflow-hidden text-center">
              {/* Decorative background glow & elements */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-rayo-gold/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[180px] text-rayo-gold">emoji_events</span>
              </div>

              <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                {/* Official League Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rayo-gold/15 border border-rayo-gold/30 text-rayo-gold text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Liga Comarcal de Fútbol 7 • Ibi (Liga Plata)
                </div>

                {/* Trophy Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rayo-gold/20 via-black/40 to-rayo-gold/5 border border-rayo-gold/40 flex items-center justify-center text-rayo-gold mb-6 shadow-xl shadow-rayo-gold/10">
                  <span className="material-symbols-outlined text-4xl">emoji_events</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase text-white tracking-tight mb-4">
                  Clasificación Oficial de la Temporada
                </h3>

                <p className="text-sm sm:text-base text-rayo-bone/80 leading-relaxed mb-8 max-w-xl">
                  Consulta las posiciones de los 12 equipos, puntos actualizados jornada a jornada, diferencia de goles y rachas directamente en el portal oficial de la Liga Comarcal.
                </p>

                {/* Main CTA Button */}
                <a
                  href={OFFICIAL_STANDINGS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-rayo-carbon font-display text-sm sm:text-base font-extrabold uppercase tracking-wider shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_35px_rgba(212,175,55,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group"
                >
                  <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">leaderboard</span>
                  <span>Ver Clasificación Oficial en Directo</span>
                  <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">open_in_new</span>
                </a>

                {/* Key league highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-10 pt-8 border-t border-white/[0.08] text-xs">
                  <div className="flex items-center justify-center gap-2 text-rayo-bone/80 bg-white/[0.03] py-2.5 px-3 rounded-lg border border-white/[0.05]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Zona Ascenso: 1º, 2º y 3º</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-rayo-bone/80 bg-white/[0.03] py-2.5 px-3 rounded-lg border border-white/[0.05]">
                    <span className="material-symbols-outlined text-sm text-rayo-gold">sports_soccer</span>
                    <span>12 Equipos Participantes</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-rayo-bone/80 bg-white/[0.03] py-2.5 px-3 rounded-lg border border-white/[0.05]">
                    <span className="material-symbols-outlined text-sm text-rayo-gold">verified</span>
                    <span>ligacomarcal.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CALENDARIO DE PARTIDOS 26/27 */}
        {viewMode === 'matches' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Match filter bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0A16] p-3 rounded-xl border border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-rayo-gold uppercase font-mono">Filtrar:</span>
                <button
                  onClick={() => setMatchFilter('all')}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                    matchFilter === 'all'
                      ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-sm'
                      : 'text-rayo-bone/60 hover:text-white'
                  }`}
                >
                  Todas las Jornadas ({matches.length})
                </button>
                <button
                  onClick={() => setMatchFilter('pendientes')}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                    matchFilter === 'pendientes'
                      ? 'bg-amber-400 text-black font-bold shadow-sm'
                      : 'text-rayo-bone/60 hover:text-white'
                  }`}
                >
                  Próximos ({matches.filter((m) => !m.jugado).length})
                </button>
                <button
                  onClick={() => setMatchFilter('jugados')}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                    matchFilter === 'jugados'
                      ? 'bg-emerald-400 text-black font-bold shadow-sm'
                      : 'text-rayo-bone/60 hover:text-white'
                  }`}
                >
                  Finalizados ({matches.filter((m) => m.jugado).length})
                </button>
              </div>

              <div className="text-[11px] font-mono text-rayo-bone/60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rayo-gold"></span>
                <span>Liga Comarcal de Fútbol 7 • Ibi</span>
              </div>
            </div>

            {/* Grid of Match Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.map((m) => {
                const isRayoLocal = m.local.toLowerCase().includes('rayo');
                const localBadge = getTeamBadge(m.local);
                const awayBadge = getTeamBadge(m.visitante);

                return (
                  <div
                    key={`cal_${m.id}`}
                    className={`elite-card rounded-xl p-5 border transition-all duration-300 relative overflow-hidden group ${
                      m.jugado
                        ? 'border-white/[0.08] hover:border-emerald-500/40'
                        : m.jornada === 1
                        ? 'border-rayo-gold/50 shadow-lg shadow-rayo-gold/5'
                        : 'border-white/[0.08] hover:border-rayo-gold/40'
                    }`}
                  >
                    {/* Top match header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#07070F] border border-white/[0.1] font-mono font-bold text-[10px] text-rayo-gold">
                          JORNADA {m.jornada}
                        </span>
                        <span className="text-rayo-bone/80 font-semibold">
                          {m.dia_semana.charAt(0).toUpperCase() + m.dia_semana.slice(1)} {m.fecha}
                        </span>
                        <span className="text-rayo-gold font-mono font-bold">• {m.hora}h</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          m.jugado
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : m.jornada === 1
                            ? 'bg-rayo-gold/20 text-rayo-gold border border-rayo-gold/40 animate-pulse'
                            : 'bg-white/[0.05] text-rayo-bone/70 border border-white/[0.08]'
                        }`}
                      >
                        {m.jugado ? 'Finalizado' : m.jornada === 1 ? 'Próximo Partido' : 'Por Jugar'}
                      </span>
                    </div>

                    {/* Face-off banner */}
                    <div className="py-4 flex items-center justify-between gap-3">
                      {/* Local */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/[0.08] flex items-center justify-center p-1 flex-shrink-0">
                          {localBadge ? (
                            <img src={localBadge} alt={m.local} className="w-full h-full object-contain" />
                          ) : (
                            <span className="font-bold text-xs">{m.local.slice(0, 2)}</span>
                          )}
                        </div>
                        <span
                          className={`font-display font-bold text-sm uppercase truncate ${
                            isRayoLocal ? 'text-rayo-gold' : 'text-white'
                          }`}
                        >
                          {m.local}
                        </span>
                      </div>

                      {/* Score or VS */}
                      <div className="flex-shrink-0 px-3 py-1 rounded bg-[#07070F] border border-white/[0.08] text-center min-w-[56px]">
                        {m.jugado ? (
                          <span className="font-display font-bold text-lg text-rayo-gold tracking-widest">
                            {m.golesLocal ?? 0} - {m.golesVisitante ?? 0}
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-rayo-bone/40">VS</span>
                        )}
                      </div>

                      {/* Visitante */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end text-right">
                        <span
                          className={`font-display font-bold text-sm uppercase truncate ${
                            !isRayoLocal ? 'text-rayo-gold' : 'text-white'
                          }`}
                        >
                          {m.visitante}
                        </span>
                        <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/[0.08] flex items-center justify-center p-1 flex-shrink-0">
                          {awayBadge ? (
                            <img src={awayBadge} alt={m.visitante} className="w-full h-full object-contain" />
                          ) : (
                            <span className="font-bold text-xs">{m.visitante.slice(0, 2)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom field info */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-rayo-bone/60">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-[14px] text-rayo-gold">location_on</span>
                        <span className="truncate">{m.campo}</span>
                      </div>
                      {m.notas ? (
                        <span className="text-[11px] text-emerald-400/90 font-medium truncate max-w-[200px]" title={m.notas}>
                          {m.notas}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase text-rayo-bone/40">Ibi F7</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
