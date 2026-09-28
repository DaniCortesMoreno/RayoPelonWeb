import React, { useState, useEffect } from 'react';
import { STANDINGS_DATA, SEASON_MATCHES } from '../../data/mockData';
import type { StandingTeam, SeasonMatch } from '../../types';
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

export const StandingsSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'standings' | 'matches'>('standings');
  const [standings, setStandings] = useState<StandingTeam[]>(STANDINGS_DATA);
  const [matches, setMatches] = useState<SeasonMatch[]>(SEASON_MATCHES);
  const [matchFilter, setMatchFilter] = useState<'all' | 'pendientes' | 'jugados'>('all');
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>('En tiempo real');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Carga inicial desde el backend si está activo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resStandings = await fetch(`${API_BASE}/standings`);
        if (resStandings.ok) {
          const data = await resStandings.json();
          if (data && Array.isArray(data.standings) && data.standings.length > 0) {
            setStandings(data.standings);
            if (data.lastSync?.timestamp) {
              const date = new Date(data.lastSync.timestamp);
              setLastSyncTime(date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
            }
          }
        }
      } catch {
        // Fallback local
      }

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

    fetchData();
  }, []);

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch(`${API_BASE}/standings/sync`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.standings && Array.isArray(data.standings)) {
          setStandings(data.standings);
          const date = new Date();
          setLastSyncTime(date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
          setSyncMessage(`✓ Sincronizados ${data.standings.length} equipos con ligacomarcal.com`);
          setTimeout(() => setSyncMessage(null), 4000);
        }
      } else {
        setSyncMessage('Aviso: Mostrando la última versión guardada.');
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } catch {
      setSyncMessage('Conectando en modo local.');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

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
                href="https://www.ligacomarcal.com/competicion/lc-futbol-7-ibi-plata-mtzfdn3f/clasificacion"
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

        {/* VIEW 1: CLASIFICACIÓN OFICIAL */}
        {viewMode === 'standings' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Zona Ascenso Oro (1º, 2º y 3º)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {syncMessage && (
                  <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-fadeIn">
                    {syncMessage}
                  </span>
                )}
                <button
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-display font-semibold uppercase tracking-wider text-rayo-bone hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Comprobar cambios y actualizar datos de ligacomarcal.com"
                >
                  <span className={`material-symbols-outlined text-sm text-rayo-gold ${syncing ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>{syncing ? 'Sincronizando...' : 'Sincronizar en Directo'}</span>
                </button>
              </div>
            </div>

            {/* Live Table */}
            <div className="elite-card rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0A0A16] text-[11px] font-display uppercase tracking-[0.14em] text-rayo-bone/60 border-b border-white/[0.08]">
                      <th className="py-3 px-4 text-center w-14">Pos</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-3 text-center w-12" title="Partidos Jugados">PJ</th>
                      <th className="py-3 px-3 text-center w-12" title="Partidos Ganados">PG</th>
                      <th className="py-3 px-3 text-center w-12" title="Partidos Empatados">PE</th>
                      <th className="py-3 px-3 text-center w-12" title="Partidos Perdidos">PP</th>
                      <th className="py-3 px-3 text-center w-14" title="Goles a Favor">GF</th>
                      <th className="py-3 px-3 text-center w-14" title="Goles en Contra">GC</th>
                      <th className="py-3 px-3 text-center w-14" title="Diferencia de Goles">DIF</th>
                      <th className="py-3 px-5 text-center w-16 text-rayo-gold font-bold" title="Puntos">PTS</th>
                      <th className="py-3 px-4 text-center w-28" title="Últimos Partidos">Racha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
                    {standings.map((team) => (
                      <tr
                        key={team.teamName}
                        className={`transition-colors ${
                          team.isRayo
                            ? 'bg-rayo-gold/[0.12] hover:bg-rayo-gold/[0.18] font-semibold border-l-4 border-l-rayo-gold'
                            : team.position <= 3
                            ? 'bg-emerald-500/[0.02] hover:bg-white/[0.03]'
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-display font-bold text-sm">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
                              team.position <= 3
                                ? 'bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30'
                                : 'text-rayo-bone/80'
                            }`}
                          >
                            {team.position}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/[0.08] flex items-center justify-center flex-shrink-0 p-1">
                              {team.isRayo ? (
                                <img
                                  src="/escudo.png"
                                  alt="Rayo Pelón"
                                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(197,160,89,0.4)]"
                                />
                              ) : team.badgeUrl ? (
                                <img
                                  src={team.badgeUrl}
                                  alt={team.teamName}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="font-display font-bold text-xs text-rayo-gold">
                                  {team.teamCode}
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="font-display font-bold text-sm text-white tracking-wide flex items-center gap-2">
                                <span>{team.teamName}</span>
                                {team.isRayo && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-rayo-gold text-black font-extrabold tracking-wider">
                                    NUESTRO CLUB
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-rayo-bone/50 font-mono">
                                {team.isRayo ? 'Sede: Polideportivo Ibi' : 'Liga Plata Ibi F7'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center text-rayo-bone/90">{team.matchesPlayed}</td>
                        <td className="py-3 px-3 text-center text-emerald-400 font-semibold">{team.won}</td>
                        <td className="py-3 px-3 text-center text-rayo-bone/70">{team.drawn}</td>
                        <td className="py-3 px-3 text-center text-rose-400">{team.lost}</td>
                        <td className="py-3 px-3 text-center text-rayo-bone/80">{team.goalsFor}</td>
                        <td className="py-3 px-3 text-center text-rayo-bone/80">{team.goalsAgainst}</td>
                        <td
                          className={`py-3 px-3 text-center font-semibold ${
                            team.goalDifference > 0
                              ? 'text-emerald-400'
                              : team.goalDifference < 0
                              ? 'text-rose-400'
                              : 'text-rayo-bone/60'
                          }`}
                        >
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </td>
                        <td className="py-3 px-5 text-center font-display font-bold text-base text-white">
                          {team.points}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex gap-1 text-[9px] font-bold justify-center">
                            {team.form && team.form.length > 0 ? (
                              team.form.map((f, i) => (
                                <span
                                  key={i}
                                  className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                                    f === 'V'
                                      ? 'bg-emerald-600'
                                      : f === 'E'
                                      ? 'bg-amber-500'
                                      : 'bg-rose-600'
                                  }`}
                                >
                                  {f}
                                </span>
                              ))
                            ) : (
                              <span className="text-rayo-bone/30">-</span>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Bar */}
              <div className="bg-[#0A0A16]/95 px-5 py-3.5 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center text-xs text-rayo-bone/60 gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>
                    Actualización automática post-partidos: <strong className="text-white">Viernes noche</strong> y{' '}
                    <strong className="text-white">Domingos mediodía</strong> (y en directo bajo demanda).
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-rayo-gold flex-shrink-0">
                  <span>Última comprobación: {lastSyncTime}</span>
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
