import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_PLAYERS } from '../../data/mockData';
import { SquadCarousel } from './SquadCarousel';
import { TopScorersSection } from './TopScorersSection';
import type { Player, PlayerPosition } from '../../types';
import { API_BASE } from '../../config/api';

export const SquadSection: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');

  useEffect(() => {
    fetch(`${API_BASE}/players`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('API offline');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlayers(data);
        }
      })
      .catch(() => {
        // Fallback already in state
      });
  }, []);

  // Show all players by default in the carousel or filter by position
  const filteredCards = useMemo(() => {
    if (selectedPos === 'ALL') {
      return players;
    }
    return players.filter((p) => p.position === selectedPos);
  }, [players, selectedPos]);

  const filteredTablePlayers = useMemo(() => {
    if (!tableSearch.trim()) return players;
    const query = tableSearch.toLowerCase();
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.nickname.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query) ||
        p.number.toString().includes(query)
    );
  }, [players, tableSearch]);

  const filterButtons: { label: string; value: string; count: number }[] = [
    { label: 'Todos', value: 'ALL', count: players.length },
    { label: 'Porteros', value: 'POR', count: players.filter((p) => p.position === 'POR').length },
    { label: 'Defensas', value: 'DEF', count: players.filter((p) => p.position === 'DEF').length },
    { label: 'Medios', value: 'MED', count: players.filter((p) => p.position === 'MED').length },
    { label: 'Delanteros', value: 'DEL', count: players.filter((p) => p.position === 'DEL').length },
  ];

  const getPositionBadgeClass = (pos: PlayerPosition) => {
    switch (pos) {
      case 'POR':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'DEF':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'MED':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'DEL':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  return (
    <section className="py-20 bg-rayo-carbon relative border-t border-white/[0.06]" id="plantilla">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================= */}
        {/* CABECERA: PLANTILLA OFICIAL 26/27         */}
        {/* ========================================= */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.18em] mb-1.5">
            <span className="material-symbols-outlined text-sm">badge</span>
            LOS GUERREROS DEL RAYO
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase text-white tracking-tight">
            PLANTILLA <span className="text-champagne-gradient">OFICIAL 26/27</span>
          </h2>
          <p className="text-xs sm:text-sm text-rayo-bone/60 mt-1 max-w-2xl">
            Pasa el ratón (o pulsa) sobre cada cromo coleccionable para ver sus estadísticas completas. El carrusel se desliza automáticamente y se detiene al situar el cursor encima.
          </p>
        </div>

        {/* ========================================= */}
        {/* CARRUSEL DE JUGADORES 26/27               */}
        {/* ========================================= */}
        <SquadCarousel
          players={filteredCards}
          selectedPos={selectedPos}
          onSelectPos={setSelectedPos}
          filterButtons={filterButtons}
        />

        {/* ========================================= */}
        {/* MÁXIMOS GOLEADORES (TOP 5 CON DESEMPATE)   */}
        {/* ========================================= */}
        <TopScorersSection players={players} />

        {/* ========================================= */}
        {/* TABLA GENERAL DE ESTADÍSTICAS             */}
        {/* ========================================= */}
        <div className="elite-card rounded-2xl p-5 sm:p-7 border border-white/[0.08] shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-rayo-gold text-[11px] font-semibold uppercase tracking-wider mb-1">
                <span className="material-symbols-outlined text-xs">analytics</span>
                TELEMETRÍA COMPLETA
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-white">
                Cuadro Estadístico de la Plantilla
              </h3>
              <p className="text-xs text-rayo-bone/60">
                Rendimiento acumulado de todos los futbolistas inscritos para la temporada 2026/27
              </p>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-rayo-bone/40 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar futbolista o dorsal..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:outline-none focus:border-rayo-gold/50 text-white placeholder-rayo-bone/40 w-full sm:w-64 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-display uppercase tracking-[0.16em] text-rayo-gold/90 border-b border-white/[0.06] bg-[#0A0A16]/50">
                  <th className="py-2.5 px-3 text-center font-normal">DOR</th>
                  <th className="py-2.5 px-4 font-normal">JUGADOR</th>
                  <th className="py-2.5 px-3 text-center font-normal">POS</th>
                  <th className="py-2.5 px-3 text-center font-normal">EDAD</th>
                  <th className="py-2.5 px-3 text-center font-normal">PJ</th>
                  <th className="py-2.5 px-3 text-center font-normal">GOLES</th>
                  <th className="py-2.5 px-3 text-center font-normal">ASIST</th>
                  <th className="py-2.5 px-3 text-center font-normal">MVP</th>
                  <th className="py-2.5 px-3 text-center font-normal">T. AMARILLA</th>
                  <th className="py-2.5 px-4 text-center font-normal">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs text-rayo-bone font-sans">
                {filteredTablePlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-center font-display font-bold text-rayo-gold">
                      #{player.number}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-white flex items-center gap-2">
                      <span>{player.name}</span>
                      {player.nickname !== player.name && (
                        <span className="text-[11px] text-rayo-bone/50">({player.nickname})</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${getPositionBadgeClass(player.position)}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-rayo-bone/70">{player.age}</td>
                    <td className="py-2.5 px-3 text-center font-medium">{player.seasonStats.matches}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-rayo-gold">
                      {player.seasonStats.goals}
                    </td>
                    <td className="py-2.5 px-3 text-center">{player.seasonStats.assists}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-rayo-gold">
                      {player.seasonStats.mvpCount ?? 0}
                    </td>
                    <td className="py-2.5 px-3 text-center text-rayo-bone/70">
                      {player.seasonStats.yellowCards}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-xs font-medium ${
                          player.status === 'Apto'
                            ? 'text-emerald-400'
                            : player.status === 'Apercibido'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        ● {player.status} {player.statusDetail ? `(${player.statusDetail})` : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
