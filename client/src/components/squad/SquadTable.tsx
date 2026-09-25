import React, { useState, useMemo } from 'react';
import type { Player, PlayerPosition } from '../../types';

interface SquadTableProps {
  players: Player[];
}

export const SquadTable: React.FC<SquadTableProps> = ({ players }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesPos =
        selectedPosition === 'ALL' || player.position === selectedPosition;
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        player.name.toLowerCase().includes(query) ||
        player.nickname.toLowerCase().includes(query) ||
        player.number.toString().includes(query) ||
        player.position.toLowerCase().includes(query);
      return matchesPos && matchesSearch;
    });
  }, [players, selectedPosition, searchTerm]);

  const getPositionBadge = (pos: PlayerPosition) => {
    switch (pos) {
      case 'POR':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'DEF':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'MED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'DEL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="elite-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.16em] mb-1">
            <span className="material-symbols-outlined text-sm">analytics</span>
            TELEMETRÍA OFICIAL DEL PLANTEL
          </div>
          <h3 className="font-display text-2xl font-bold uppercase text-white tracking-wide">
            Cuadro Estadístico de la Plantilla
          </h3>
          <p className="text-xs text-rayo-bone/60 mt-0.5">
            Métricas acumuladas de la temporada 2026/27 • Liga Plata de Ibi
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Position Selector */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#07070F] border border-white/[0.08]">
            {['ALL', 'POR', 'DEF', 'MED', 'DEL'].map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-display font-semibold uppercase tracking-wider transition-all ${
                  selectedPosition === pos
                    ? 'bg-rayo-gold text-rayo-carbon shadow-sm'
                    : 'text-rayo-bone/60 hover:text-white'
                }`}
              >
                {pos === 'ALL' ? 'Todos' : pos}
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
              placeholder="Buscar futbolista o dorsal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:outline-none focus:border-rayo-gold/50 text-white placeholder-rayo-bone/40 w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-display uppercase tracking-[0.16em] text-rayo-gold/90 border-b border-white/[0.08] bg-[#0A0A16]/60">
              <th className="py-3 px-4 text-center font-normal">DOR</th>
              <th className="py-3 px-4 font-normal">FUTBOLISTA</th>
              <th className="py-3 px-3 text-center font-normal">POS</th>
              <th className="py-3 px-3 text-center font-normal">EDAD</th>
              <th className="py-3 px-3 text-center font-bold text-white bg-white/[0.02]">
                PJ <span className="text-[9px] text-rayo-bone/40 block font-normal">(Partidos)</span>
              </th>
              <th className="py-3 px-3 text-center font-bold text-rayo-gold bg-rayo-gold/[0.05]">
                G <span className="text-[9px] text-rayo-gold/60 block font-normal">(Goles)</span>
              </th>
              <th className="py-3 px-3 text-center font-bold text-white bg-white/[0.02]">
                A <span className="text-[9px] text-rayo-bone/40 block font-normal">(Asistencias)</span>
              </th>
              <th className="py-3 px-3 text-center font-bold text-rayo-gold bg-rayo-gold/[0.05]">
                MVP <span className="text-[9px] text-rayo-gold/60 block font-normal">(Partidos)</span>
              </th>
              <th className="py-3 px-3 text-center font-normal">T. AMARILLA / ROJA</th>
              <th className="py-3 px-4 text-center font-normal">ESTADO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-xs font-sans">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <tr
                  key={player.id}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  {/* DOR */}
                  <td className="py-3.5 px-4 text-center font-display font-bold text-rayo-gold text-sm">
                    #{player.number}
                  </td>

                  {/* JUGADOR */}
                  <td className="py-3.5 px-4 font-medium text-white flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-[#07070F] flex-shrink-0 flex items-center justify-center">
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
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white group-hover:text-rayo-gold transition-colors">
                          {player.name}
                        </span>
                        {player.nickname !== player.name && (
                          <span className="text-[11px] text-rayo-bone/50 italic">
                            "{player.nickname.replace(/"/g, '')}"
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-rayo-bone/50 block font-normal">
                        Rating OVR: <strong className="text-white">{player.rating}</strong>
                      </span>
                    </div>
                  </td>

                  {/* POS */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] tracking-wider uppercase border ${getPositionBadge(
                        player.position
                      )}`}
                    >
                      {player.position}
                    </span>
                  </td>

                  {/* EDAD */}
                  <td className="py-3.5 px-3 text-center text-rayo-bone/70 font-mono">
                    {player.age}
                  </td>

                  {/* PJ */}
                  <td className="py-3.5 px-3 text-center font-display font-bold text-white text-base bg-white/[0.02]">
                    {player.seasonStats.matches}
                  </td>

                  {/* G */}
                  <td className="py-3.5 px-3 text-center font-display font-bold text-rayo-gold text-base bg-rayo-gold/[0.05]">
                    {player.seasonStats.goals}
                  </td>

                  {/* A */}
                  <td className="py-3.5 px-3 text-center font-display font-bold text-white text-base bg-white/[0.02]">
                    {player.seasonStats.assists}
                  </td>

                  {/* MVP */}
                  <td className="py-3.5 px-3 text-center font-display font-bold text-rayo-gold text-base bg-rayo-gold/[0.05]">
                    {player.seasonStats.mvpCount ?? 0}
                  </td>

                  {/* TARJETAS */}
                  <td className="py-3.5 px-3 text-center font-mono text-amber-400/90 font-medium">
                    {player.seasonStats.yellowCards} <span className="text-white/30">/</span> {player.seasonStats.redCards}
                  </td>

                  {/* ESTADO */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        player.status === 'Apto'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : player.status === 'Apercibido'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          player.status === 'Apto'
                            ? 'bg-emerald-400 animate-pulse'
                            : player.status === 'Apercibido'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      ></span>
                      {player.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-rayo-bone/50 text-xs">
                  No se encontraron jugadores que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary note */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-rayo-bone/50 gap-2">
        <span>Mostrando {filteredPlayers.length} de {players.length} futbolistas inscritos</span>
        <span className="text-rayo-gold/80">PJ: Partidos Jugados • G: Goles • A: Asistencias</span>
      </div>
    </div>
  );
};
