import React, { useState, useMemo } from 'react';
import type { Player, PlayerPosition } from '../../types';

interface TopScorersSectionProps {
  players: Player[];
}

interface RankedPlayer {
  player: Player;
  rank: number;
  tieReason: string;
}

export const TopScorersSection: React.FC<TopScorersSectionProps> = ({ players }) => {
  const [showTieBreakerRules, setShowTieBreakerRules] = useState(false);

  // Position priority when 0 goals: DEL (1), MED (2), DEF (3), POR (4)
  const getPosPriority = (pos: PlayerPosition): number => {
    switch (pos) {
      case 'DEL':
        return 1;
      case 'MED':
        return 2;
      case 'DEF':
        return 3;
      case 'POR':
        return 4;
      default:
        return 5;
    }
  };

  // Compare tie-breakers when goals are identical
  const compareTieBreaker = (a: Player, b: Player): { result: number; reason: string } => {
    // 1. Más asistencias
    const aAssists = a.seasonStats.assists || 0;
    const bAssists = b.seasonStats.assists || 0;
    if (bAssists !== aAssists) {
      return {
        result: bAssists - aAssists,
        reason: `${bAssists > aAssists ? b.name : a.name} tiene más asistencias (${Math.max(aAssists, bAssists)})`,
      };
    }

    // 2. Menos tarjetas amarillas
    const aYellow = a.seasonStats.yellowCards || 0;
    const bYellow = b.seasonStats.yellowCards || 0;
    if (aYellow !== bYellow) {
      return {
        result: aYellow - bYellow,
        reason: `Desempate por menos amarillas (${Math.min(aYellow, bYellow)} vs ${Math.max(aYellow, bYellow)})`,
      };
    }

    // 3. Menos tarjetas rojas
    const aRed = a.seasonStats.redCards || 0;
    const bRed = b.seasonStats.redCards || 0;
    if (aRed !== bRed) {
      return {
        result: aRed - bRed,
        reason: `Desempate por menos rojas (${Math.min(aRed, bRed)} vs ${Math.max(aRed, bRed)})`,
      };
    }

    // 4. Menos partidos jugados
    const aMatches = a.seasonStats.matches || 0;
    const bMatches = b.seasonStats.matches || 0;
    if (aMatches !== bMatches) {
      return {
        result: aMatches - bMatches,
        reason: `Desempate por menos partidos jugados (${Math.min(aMatches, bMatches)} PJ)`,
      };
    }

    // 5. Orden alfabético del nombre
    const alphaComp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    return {
      result: alphaComp,
      reason: 'Desempate por orden alfabético del nombre (A-Z)',
    };
  };

  // Compute top 5 scorers following the exact rules
  const top5Scorers = useMemo<RankedPlayer[]>(() => {
    const sorted = [...players].sort((a, b) => {
      const aGoals = a.seasonStats.goals || 0;
      const bGoals = b.seasonStats.goals || 0;

      // Primary criteria: Goals
      if (bGoals !== aGoals) {
        return bGoals - aGoals;
      }

      // Default pre-season rule: if both have 0 goals, prioritize position (DEL up to 5, then MED)
      if (aGoals === 0 && bGoals === 0) {
        const pA = getPosPriority(a.position);
        const pB = getPosPriority(b.position);
        if (pA !== pB) {
          return pA - pB;
        }
      }

      // Standard tie-breaker
      return compareTieBreaker(a, b).result;
    });

    const top5 = sorted.slice(0, 5);

    return top5.map((player, idx) => {
      let tieReason = '';
      const goals = player.seasonStats.goals || 0;

      if (goals > 0) {
        tieReason = `${goals} ${goals === 1 ? 'gol marcado' : 'goles marcados'}`;
      } else {
        if (player.position === 'DEL') {
          tieReason = 'Rol Delantero (DEL) • Pretemporada';
        } else if (player.position === 'MED') {
          tieReason = 'Rol Mediocentro (MED) • Pretemporada';
        } else {
          tieReason = `Posición ${player.position} • Pretemporada`;
        }
      }

      return {
        player,
        rank: idx + 1,
        tieReason,
      };
    });
  }, [players]);

  const pichichi = top5Scorers[0];
  const challengers = top5Scorers.slice(1);

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

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-rayo-carbon font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 2:
        return 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-900 font-extrabold shadow-[0_0_12px_rgba(203,213,225,0.4)]';
      case 3:
        return 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-100 font-extrabold shadow-[0_0_12px_rgba(180,83,9,0.3)]';
      default:
        return 'bg-white/[0.08] text-rayo-bone/90 border border-white/10 font-bold';
    }
  };

  return (
    <div className="mt-16 mb-16 relative">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rayo-gold/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header of Máximos Goleadores */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rayo-gold/10 border border-rayo-gold/30 text-rayo-gold text-xs font-semibold uppercase tracking-[0.16em] mb-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">emoji_events</span>
            BOTA DE ORO • TEMPORADA 26/27
          </div>
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase text-white tracking-tight">
            MÁXIMOS <span className="text-champagne-gradient">GOLEADORES</span>
          </h3>
          <p className="text-xs sm:text-sm text-rayo-bone/70 mt-1 max-w-2xl">
            Los 5 artilleros del Rayo Pelón. En caso de empate a goles, el sistema aplica rigurosamente el reglamento de desempate federativo.
          </p>
        </div>

        {/* Toggle tie-breaker explanation */}
        <button
          onClick={() => setShowTieBreakerRules(!showTieBreakerRules)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-rayo-bone transition-all self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-sm text-rayo-gold">
            {showTieBreakerRules ? 'visibility_off' : 'help'}
          </span>
          <span>{showTieBreakerRules ? 'Ocultar Criterios de Desempate' : 'Ver Criterios de Desempate'}</span>
        </button>
      </div>

      {/* Tie-breaker Rules Info Card (Collapsible) */}
      {showTieBreakerRules && (
        <div className="mb-8 p-5 rounded-xl elite-card border border-rayo-gold/30 shadow-xl relative z-10 animate-fadeIn">
          <div className="flex items-center gap-2 text-rayo-gold font-display font-semibold text-sm uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-base">gavel</span>
            Reglamento Oficial de Desempate Rayo Pelón F7
          </div>
          <p className="text-xs text-rayo-bone/80 mb-3">
            Cuando 2 o más futbolistas igualan en número de goles anotados, las posiciones se determinan estrictamente en el siguiente orden:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-rayo-bone/90">
            <div className="p-2.5 rounded-lg bg-[#07070F] border border-white/[0.06] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rayo-gold text-rayo-carbon font-bold flex items-center justify-center text-[11px]">1</span>
              <span><strong>Más Asistencias</strong> (A)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#07070F] border border-white/[0.06] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rayo-gold text-rayo-carbon font-bold flex items-center justify-center text-[11px]">2</span>
              <span><strong>Menos Tarjetas Amarillas</strong> (🟨)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#07070F] border border-white/[0.06] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rayo-gold text-rayo-carbon font-bold flex items-center justify-center text-[11px]">3</span>
              <span><strong>Menos Tarjetas Rojas</strong> (🟥)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#07070F] border border-white/[0.06] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rayo-gold text-rayo-carbon font-bold flex items-center justify-center text-[11px]">4</span>
              <span><strong>Menos Partidos Jugados</strong> (PJ)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#07070F] border border-white/[0.06] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rayo-gold text-rayo-carbon font-bold flex items-center justify-center text-[11px]">5</span>
              <span><strong>Orden Alfabético</strong> (A - Z)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-rayo-gold/10 border border-rayo-gold/20 flex items-center gap-2 text-rayo-gold">
              <span className="material-symbols-outlined text-sm">info</span>
              <span className="text-[11px]"><strong>Pretemporada (0 goles)</strong>: Prioridad Delanteros (DEL) hasta 5, completando con Mediocentros (MED).</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Showcase Layout: 1 Hero Pichichi Card + 4 Challengers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* ========================================= */}
        {/* HERO CARD: #1 PICHICHI SPOTLIGHT (5 cols) */}
        {/* ========================================= */}
        {pichichi && (
          <div className="lg:col-span-5 relative group">
            <div className="h-full rounded-2xl p-6 sm:p-7 border-2 border-rayo-gold/50 bg-gradient-to-b from-[#1c183a] via-[#0f0c24] to-[#07070F] shadow-[0_0_35px_rgba(197,160,89,0.2)] hover:shadow-[0_0_50px_rgba(197,160,89,0.35)] transition-all flex flex-col justify-between overflow-hidden relative">
              
              {/* Golden corner ribbon / Pichichi badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-l from-rayo-gold via-amber-400 to-rayo-goldLight text-rayo-carbon font-display font-extrabold text-xs uppercase px-4 py-1.5 rounded-bl-xl shadow-lg flex items-center gap-1.5 tracking-wider">
                  <span className="material-symbols-outlined text-base">military_tech</span>
                  <span>LÍDER DEL GOL • #1</span>
                </div>
              </div>

              {/* Watermark dorsal */}
              <div className="absolute -bottom-8 -right-6 font-display font-black text-9xl text-white/[0.03] select-none pointer-events-none">
                #{pichichi.player.number}
              </div>

              <div>
                {/* Top badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-amber-400 text-rayo-carbon flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-sm">trophy</span>
                    PICHICHI
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-display font-bold tracking-wider uppercase border ${getPositionBadge(pichichi.player.position)}`}>
                    {pichichi.player.position}
                  </span>
                  <span className="text-xs font-mono text-rayo-bone/60">
                    Dorsal #{pichichi.player.number}
                  </span>
                </div>

                {/* Player Photo & Info */}
                <div className="flex items-center gap-4 sm:gap-5 mb-6">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-rayo-gold to-yellow-200 shadow-xl flex-shrink-0">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-[#0A0A16] flex items-center justify-center">
                      {pichichi.player.photoUrl ? (
                        <img
                          src={pichichi.player.photoUrl}
                          alt={pichichi.player.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="font-display font-bold text-3xl text-rayo-gold">
                          {pichichi.player.avatarInitials}
                        </span>
                      )}
                    </div>
                    {/* Crown badge */}
                    <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-amber-400 text-rayo-carbon flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-sm">crown</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight leading-none">
                      {pichichi.player.name}
                    </h4>
                    {pichichi.player.nickname && pichichi.player.nickname !== pichichi.player.name && (
                      <p className="text-sm font-sans text-rayo-gold font-medium mt-1">
                        "{pichichi.player.nickname}"
                      </p>
                    )}
                    <p className="text-xs text-rayo-bone/60 mt-1">
                      {pichichi.player.roleDescription}
                    </p>
                  </div>
                </div>

                {/* Big Stat Box: Goals */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-rayo-gold/15 to-transparent border border-rayo-gold/30 mb-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-rayo-gold block">
                      GOLES EN TEMPORADA
                    </span>
                    <span className="font-display font-bold text-4xl sm:text-5xl text-champagne-gradient leading-none">
                      {pichichi.player.seasonStats.goals}
                    </span>
                    <span className="text-xs text-rayo-bone/60 ml-2">goles</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-rayo-bone/60 block">
                      EFICACIA
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {pichichi.player.seasonStats.matches > 0
                        ? `${(pichichi.player.seasonStats.goals / pichichi.player.seasonStats.matches).toFixed(2)} G/P`
                        : '0.00 G/P'}
                    </span>
                  </div>
                </div>

                {/* Secondary Tie-breaker Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] uppercase font-mono text-rayo-bone/50 block">ASIST</span>
                    <span className="font-display font-bold text-lg text-white">
                      {pichichi.player.seasonStats.assists}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] uppercase font-mono text-amber-400/80 block">🟨 AMAR</span>
                    <span className="font-display font-bold text-lg text-amber-400">
                      {pichichi.player.seasonStats.yellowCards}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] uppercase font-mono text-rose-400/80 block">🟥 ROJAS</span>
                    <span className="font-display font-bold text-lg text-rose-400">
                      {pichichi.player.seasonStats.redCards}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] uppercase font-mono text-rayo-bone/50 block">PJ</span>
                    <span className="font-display font-bold text-lg text-white">
                      {pichichi.player.seasonStats.matches}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status footer with reason */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-rayo-bone/60 flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rayo-gold"></span>
                  {pichichi.tieReason}
                </span>
                <span className="font-mono text-[10px] text-rayo-gold font-semibold uppercase">
                  Puesto #1
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* CHALLENGERS: RANKS #2 TO #5 (7 cols)       */}
        {/* ========================================= */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3">
          {challengers.map((item) => (
            <div
              key={item.player.id}
              className="p-4 sm:p-5 rounded-xl elite-card border border-white/[0.08] hover:border-rayo-gold/40 hover:bg-white/[0.04] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              {/* Left info: Rank, Avatar, Name */}
              <div className="flex items-center gap-3.5 sm:gap-4">
                {/* Rank Badge */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-display text-base sm:text-lg flex-shrink-0 ${getRankBadgeStyle(
                    item.rank
                  )}`}
                >
                  #{item.rank}
                </div>

                {/* Player thumbnail */}
                <div className="relative w-12 h-12 rounded-xl p-0.5 bg-white/[0.1] flex-shrink-0 overflow-hidden">
                  {item.player.photoUrl ? (
                    <img
                      src={item.player.photoUrl}
                      alt={item.player.name}
                      className="w-full h-full object-cover object-top rounded-[10px]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[10px] bg-rayo-carbon flex items-center justify-center text-xs font-bold text-rayo-gold">
                      {item.player.avatarInitials}
                    </div>
                  )}
                </div>

                {/* Name & details */}
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-display font-bold text-base sm:text-lg text-white uppercase group-hover:text-rayo-gold transition-colors">
                      {item.player.name}
                    </h5>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-display font-bold uppercase border ${getPositionBadge(item.player.position)}`}>
                      {item.player.position}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-rayo-bone/60">
                    <span>Dorsal #{item.player.number}</span>
                    {item.player.nickname && item.player.nickname !== item.player.name && (
                      <>
                        <span>•</span>
                        <span className="text-rayo-bone/80">"{item.player.nickname}"</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-rayo-gold/70 block mt-0.5">
                    {item.tieReason}
                  </span>
                </div>
              </div>

              {/* Right metrics: Goals & Tie-break stats */}
              <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.05]">
                {/* Secondary stats mini table */}
                <div className="flex items-center gap-3 text-center">
                  <div className="px-2 py-1 rounded bg-[#07070F] border border-white/[0.05]">
                    <span className="text-[9px] uppercase font-mono text-rayo-bone/50 block">ASIST</span>
                    <span className="font-display font-bold text-xs text-white">
                      {item.player.seasonStats.assists}
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#07070F] border border-white/[0.05]">
                    <span className="text-[9px] uppercase font-mono text-amber-400/80 block">🟨 TA</span>
                    <span className="font-display font-bold text-xs text-amber-400">
                      {item.player.seasonStats.yellowCards}
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#07070F] border border-white/[0.05]">
                    <span className="text-[9px] uppercase font-mono text-rose-400/80 block">🟥 TR</span>
                    <span className="font-display font-bold text-xs text-rose-400">
                      {item.player.seasonStats.redCards}
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#07070F] border border-white/[0.05]">
                    <span className="text-[9px] uppercase font-mono text-rayo-bone/50 block">PJ</span>
                    <span className="font-display font-bold text-xs text-white">
                      {item.player.seasonStats.matches}
                    </span>
                  </div>
                </div>

                {/* Goal Counter Box */}
                <div className="min-w-[70px] text-right">
                  <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-rayo-gold block">
                    GOLES
                  </span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-white">
                    {item.player.seasonStats.goals}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
