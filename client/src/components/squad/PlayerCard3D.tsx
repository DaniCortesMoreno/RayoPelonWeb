import React, { useState } from 'react';
import type { Player } from '../../types';
import { CLUB_INFO } from '../../data/mockData';

interface PlayerCard3DProps {
  player: Player;
  compact?: boolean;
}

export const PlayerCard3D: React.FC<PlayerCard3DProps> = ({ player, compact = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getPositionBadge = (pos: string) => {
    switch (pos) {
      case 'POR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'DEF':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'MED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'DEL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div
      className={`player-card perspective-1000 ${
        compact ? 'h-[395px]' : 'h-[450px]'
      } cursor-pointer group select-none ${isFlipped ? 'is-flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="card-inner relative w-full h-full transform-style-3d transition-transform duration-700 shadow-2xl rounded-2xl">
        
        {/* ========================================= */}
        {/* ANVERSO: CARTA FUT DE ALTA COMPETICIÓN     */}
        {/* ========================================= */}
        <div
          className={`absolute inset-0 backface-hidden rounded-2xl ${
            compact ? 'p-3.5 sm:p-4' : 'p-5'
          } flex flex-col justify-between border-2 border-rayo-gold/40 bg-gradient-to-b from-[#181a38] via-[#0e1026] to-[#07070F] overflow-hidden shadow-[0_0_20px_rgba(197,160,89,0.15)] group-hover:border-rayo-gold group-hover:shadow-[0_0_30px_rgba(197,160,89,0.35)] transition-all`}
        >
          {/* Subtle Background Watermark Patterns */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 opacity-5 pointer-events-none">
            <img src={CLUB_INFO.badgeUrl} alt="" className="w-full h-full object-contain filter invert" />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-rayo-gold/10 to-transparent pointer-events-none"></div>

          {/* Top Header: Rating, Position, Number & Crest */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex flex-col items-center">
              <span
                className={`font-display font-bold ${
                  compact ? 'text-3xl' : 'text-4xl'
                } text-rayo-gold leading-none tracking-tight filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
              >
                {player.rating}
              </span>
              <span className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-display font-bold tracking-widest uppercase border ${getPositionBadge(player.position)}`}>
                {player.position}
              </span>
              <span className="text-[10px] font-mono text-rayo-bone/60 font-semibold mt-0.5">
                #{player.number}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <div
                className={`${
                  compact ? 'w-8 h-8' : 'w-10 h-10'
                } p-0.5 rounded-full bg-white/5 border border-rayo-gold/30 shadow-md`}
              >
                <img
                  src={CLUB_INFO.badgeUrl}
                  alt="Escudo"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <span className="mt-1 px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[9px] font-display uppercase tracking-wider text-rayo-bone/80">
                {player.age} AÑOS
              </span>
            </div>
          </div>

          {/* Player Photo Centerpiece */}
          <div className="relative z-10 my-auto flex flex-col items-center">
            <div
              className={`relative ${
                compact ? 'w-24 h-24' : 'w-28 h-28 sm:w-32 sm:h-32'
              } rounded-2xl p-1 bg-gradient-to-b from-rayo-gold via-rayo-gold/40 to-transparent shadow-xl`}
            >
              <div className="w-full h-full rounded-xl overflow-hidden bg-[#0a0c1a] flex items-center justify-center border border-white/10">
                {player.photoUrl && !imageError ? (
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover object-top filter brightness-105 contrast-105 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-tr ${player.avatarColorGradient || 'from-amber-400 to-amber-200'}`}>
                    <span className={`font-display font-bold ${compact ? 'text-2xl' : 'text-3xl'} text-rayo-carbon`}>
                      {player.avatarInitials}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Glow Dot */}
              <div
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#07070F] ${
                  player.status === 'Apto'
                    ? 'bg-emerald-400 animate-pulse'
                    : player.status === 'Apercibido'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                title={`Estado: ${player.status}`}
              ></div>
            </div>

            {/* Name & Nickname */}
            <div className={`text-center ${compact ? 'mt-2' : 'mt-3'}`}>
              <h3 className={`font-display font-bold ${compact ? 'text-lg' : 'text-xl'} uppercase tracking-wider text-white filter drop-shadow`}>
                {player.nickname}
              </h3>
              <p className="text-[10px] font-sans text-rayo-bone/60 font-medium tracking-wide">
                {player.name}
              </p>
            </div>
          </div>

          {/* Footer Attributes Bar */}
          <div className={`relative z-10 border-t border-white/[0.08] ${compact ? 'pt-1.5' : 'pt-2.5'}`}>
            <div className="grid grid-cols-3 gap-1 text-center text-xs">
              {player.position === 'POR' ? (
                <>
                  <div className="bg-white/[0.02] p-1 rounded border border-white/[0.04]">
                    <span className="block text-rayo-bone/50 text-[8px] uppercase font-mono">REF</span>
                    <span className={`font-display font-bold text-rayo-gold ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{player.attributes.reflejos}</span>
                  </div>
                  <div className="bg-white/[0.02] p-1 rounded border border-white/[0.04]">
                    <span className="block text-rayo-bone/50 text-[8px] uppercase font-mono">EST</span>
                    <span className={`font-display font-bold text-white ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{player.attributes.estirada}</span>
                  </div>
                  <div className="bg-white/[0.02] p-1 rounded border border-white/[0.04]">
                    <span className="block text-rayo-bone/50 text-[8px] uppercase font-mono">SAQ</span>
                    <span className={`font-display font-bold text-white ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{player.attributes.saque}</span>
                  </div>
                </>
              ) : player.position === 'DEF' ? (
                <>
                  <div className="bg-white/[0.02] p-1 rounded border border-white/[0.04]">
                    <span className="block text-rayo-bone/50 text-[8px] uppercase font-mono">DEF</span>
                    <span className={`font-display font-bold text-white ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{player.attributes.defensa ?? 80}</span>
                  </div>
                  <div className="bg-white/[0.02] p-1 rounded border border-white/[0.04]">
                    <span className="block text-rayo-bone/50 text-[8px] uppercase font-mono">FIS</span>
                    <span className={`font-display font-bold text-rayo-gold ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{player.attributes.fisico ?? 80}</span>
                  </div>
                  <div className="bg-white/[0.02] p-1 rounded border border-white/[0.04]">
                    <span className="block text-rayo-bone/50 text-[8px] uppercase font-mono">RIT</span>
                    <span className={`font-display font-bold text-white ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{player.attributes.ritmo ?? 80}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/[0.02] p-1 rounded border border-white/[0.04]">
                    <span className="block text-rayo-bone/50 text-[8px] uppercase font-mono">RIT</span>
                    <span className={`font-display font-bold text-white ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{player.attributes.ritmo ?? 80}</span>
                  </div>
                  <div className="bg-white/[0.02] p-1 rounded border border-white/[0.04]">
                    <span className="block text-rayo-bone/50 text-[8px] uppercase font-mono">REG</span>
                    <span className={`font-display font-bold text-rayo-gold ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{player.attributes.regate ?? 80}</span>
                  </div>
                  <div className="bg-white/[0.02] p-1 rounded border border-white/[0.04]">
                    <span className="block text-rayo-bone/50 text-[8px] uppercase font-mono">TIR</span>
                    <span className={`font-display font-bold text-white ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{player.attributes.tiro ?? 80}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-1 mt-1.5 text-[9px] text-rayo-gold/70 font-medium uppercase tracking-wider">
              <span className="material-symbols-outlined text-[11px] animate-bounce">sync</span>
              Pasa el ratón para ver estadísticas
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* REVERSO: ESTADÍSTICAS COMPLETAS (PJ, G, A) */}
        {/* ========================================= */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl ${
            compact ? 'p-4 sm:p-5' : 'p-6'
          } flex flex-col justify-between border-2 border-rayo-gold/60 bg-gradient-to-b from-[#141630] via-[#0E1022] to-[#07070F] text-left shadow-[0_0_30px_rgba(197,160,89,0.25)]`}
        >
          {/* Back Header */}
          <div>
            <div className={`flex items-center justify-between border-b border-white/[0.1] ${compact ? 'pb-2 mb-2 sm:mb-3' : 'pb-3 mb-4'}`}>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold uppercase text-[11px] text-rayo-gold tracking-wider">
                  ESTADÍSTICAS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rayo-burgundy text-white">
                  26/27
                </span>
              </div>
              <span className="font-display font-bold text-xs text-rayo-gold">
                #{player.number}
              </span>
            </div>

            <h4 className={`font-display font-bold ${compact ? 'text-xl' : 'text-2xl'} text-white uppercase tracking-wide leading-tight`}>
              {player.name}
            </h4>
            <p className="text-[11px] text-rayo-gold/90 font-medium mt-0.5 line-clamp-1">
              {player.roleDescription}
            </p>
            <p className="text-[10px] text-rayo-bone/60 mt-0.5">
              Posición: <strong className="text-white">{player.position}</strong> • Edad: <strong className="text-white">{player.age} años</strong>
            </p>

            {/* Core Stats Big Badges: PJ, G, A */}
            <div className={`grid grid-cols-3 gap-2 ${compact ? 'mt-3 sm:mt-4' : 'mt-5'}`}>
              {/* PJ */}
              <div className={`${compact ? 'p-2' : 'p-3'} rounded-xl bg-white/[0.04] border border-white/[0.08] text-center hover:border-rayo-gold/40 transition-colors`}>
                <span className="text-[9px] font-display font-semibold text-rayo-bone/60 uppercase tracking-wider block">
                  PJ
                </span>
                <span className="text-[7px] text-rayo-bone/40 block">PARTIDOS</span>
                <p className={`font-display ${compact ? 'text-xl' : 'text-2xl'} font-bold text-white mt-0.5`}>
                  {player.seasonStats.matches}
                </p>
              </div>

              {/* G (GOLES) */}
              <div className={`${compact ? 'p-2' : 'p-3'} rounded-xl bg-rayo-gold/[0.1] border border-rayo-gold/30 text-center hover:border-rayo-gold transition-colors`}>
                <span className="text-[9px] font-display font-bold text-rayo-gold uppercase tracking-wider block">
                  G
                </span>
                <span className="text-[7px] text-rayo-gold/70 block">GOLES</span>
                <p className={`font-display ${compact ? 'text-xl' : 'text-2xl'} font-bold text-rayo-gold mt-0.5`}>
                  {player.seasonStats.goals}
                </p>
              </div>

              {/* A (ASISTENCIAS) */}
              <div className={`${compact ? 'p-2' : 'p-3'} rounded-xl bg-white/[0.04] border border-white/[0.08] text-center hover:border-rayo-gold/40 transition-colors`}>
                <span className="text-[9px] font-display font-semibold text-white uppercase tracking-wider block">
                  A
                </span>
                <span className="text-[7px] text-rayo-bone/40 block">ASISTENCIAS</span>
                <p className={`font-display ${compact ? 'text-xl' : 'text-2xl'} font-bold text-white mt-0.5`}>
                  {player.seasonStats.assists}
                </p>
              </div>
            </div>

            {/* Additional Telemetry & Goalkeeper specials */}
            <div className={`grid grid-cols-2 gap-1.5 ${compact ? 'mt-2.5' : 'mt-3'}`}>
              <div className={`${compact ? 'p-1.5 sm:p-2' : 'p-2.5'} rounded-lg bg-[#07070F]/80 border border-white/[0.06] flex items-center justify-between`}>
                <span className="text-[9px] text-rayo-bone/60 uppercase">Tarjetas A/R:</span>
                <span className="font-display font-bold text-amber-400 text-xs">
                  {player.seasonStats.yellowCards} / {player.seasonStats.redCards}
                </span>
              </div>

              {player.position === 'POR' ? (
                <div className={`${compact ? 'p-1.5 sm:p-2' : 'p-2.5'} rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between`}>
                  <span className="text-[9px] text-emerald-400 uppercase">Porterías 0:</span>
                  <span className="font-display font-bold text-emerald-400 text-xs">
                    {player.seasonStats.cleanSheets ?? 0}
                  </span>
                </div>
              ) : (
                <div className={`${compact ? 'p-1.5 sm:p-2' : 'p-2.5'} rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between`}>
                  <span className="text-[9px] text-rayo-bone/60 uppercase">Minutos/G:</span>
                  <span className="font-display font-bold text-white text-xs">
                    {player.seasonStats.goals > 0 ? Math.round((player.seasonStats.matches * 50) / player.seasonStats.goals) : '-'}m
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card Bar: Availability & Honor */}
          <div className={`border-t border-white/[0.08] ${compact ? 'pt-2' : 'pt-3'} flex items-center justify-between text-xs`}>
            <span className="text-rayo-bone/60 text-[10px]">
              {player.seasonStats.mvpCount ? (
                <span>MVP: <strong className="text-rayo-gold">{player.seasonStats.mvpCount} veces</strong></span>
              ) : (
                <span>Rayo Pelón F7</span>
              )}
            </span>

            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
              player.status === 'Apto'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : player.status === 'Apercibido'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              ● {player.status}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
