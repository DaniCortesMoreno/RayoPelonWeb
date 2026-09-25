import React, { useState, useEffect } from 'react';
import { MATCH_CENTER_DATA } from '../../data/mockData';
import type { MatchCenterData } from '../../types';
import { API_BASE } from '../../config/api';

function computeLiveCountdown(fechaIso?: string, hora?: string, fallback = 'Pronto'): string {
  if (!fechaIso) return fallback;
  const target = new Date(`${fechaIso}T${hora || '00:00'}:00`);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    if (diffMs > -3 * 3600 * 1000) {
      return '¡Hoy!';
    }
    return '0d 00h';
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, '0')}h`;
  }

  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

export const MatchCenterBanner: React.FC = () => {
  const [data, setData] = useState<MatchCenterData>(MATCH_CENTER_DATA);
  const [countdown, setCountdown] = useState<string>(() =>
    computeLiveCountdown(MATCH_CENTER_DATA.nextMatch.fechaIso, MATCH_CENTER_DATA.nextMatch.hora, MATCH_CENTER_DATA.nextMatch.countdown)
  );

  // Load latest Match Center data from backend
  useEffect(() => {
    let isMounted = true;
    const fetchCenter = async () => {
      try {
        const res = await fetch(`${API_BASE}/matches/center`);
        if (res.ok) {
          const remoteData = await res.json();
          if (isMounted && remoteData?.lastMatch && remoteData?.nextMatch) {
            setData(remoteData);
            setCountdown(
              computeLiveCountdown(
                remoteData.nextMatch.fechaIso,
                remoteData.nextMatch.hora,
                remoteData.nextMatch.countdown
              )
            );
          }
        }
      } catch {
        // Fallback already in state
      }
    };

    fetchCenter();
    return () => {
      isMounted = false;
    };
  }, []);

  // Live countdown ticker
  useEffect(() => {
    const updateTicker = () => {
      if (data.nextMatch?.fechaIso) {
        setCountdown(
          computeLiveCountdown(
            data.nextMatch.fechaIso,
            data.nextMatch.hora,
            data.nextMatch.countdown
          )
        );
      }
    };

    updateTicker();
    const interval = setInterval(updateTicker, 30000);
    return () => clearInterval(interval);
  }, [data.nextMatch?.fechaIso, data.nextMatch?.hora, data.nextMatch?.countdown]);

  const { lastMatch, nextMatch } = data;
  const isPreseason = lastMatch.score === 'PRETEMPORADA' || lastMatch.matchday === 0;

  return (
    <div className="max-w-4xl mx-auto elite-card rounded-xl p-5 sm:p-6 shadow-2xl relative border border-white/[0.1]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Último Resultado / Pretemporada */}
        <div className="flex items-center gap-4 flex-1 text-left w-full md:w-auto">
          <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rayo-gold flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">sports_soccer</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-[0.15em] text-emerald-400 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {lastMatch.statusText}
            </span>

            {isPreseason ? (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-display font-bold text-lg text-white tracking-wide">
                  {lastMatch.homeTeam}
                </p>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-rayo-gold/20 text-rayo-gold border border-rayo-gold/40 tracking-wider">
                  PRETEMPORADA
                </span>
              </div>
            ) : (
              <p className="font-display font-bold text-lg text-white mt-0.5 tracking-wide">
                {lastMatch.homeTeam} <span className="text-rayo-gold mx-1">{lastMatch.score}</span> {lastMatch.awayTeam}
              </p>
            )}

            {lastMatch.notes ? (
              <p className="text-xs text-rayo-bone/60 mt-0.5">{lastMatch.notes}</p>
            ) : null}
          </div>
        </div>

        {/* Divisor Vertical */}
        <div className="hidden md:block w-px h-12 bg-white/[0.08]"></div>

        {/* Próximo Partido & Countdown */}
        <div className="flex items-center gap-4 flex-1 justify-between md:justify-end w-full md:w-auto">
          <div className="text-left md:text-right">
            <span className="text-[10px] font-semibold tracking-[0.15em] text-rayo-gold uppercase">
              {nextMatch.statusText}
            </span>
            <p className="font-display font-bold text-lg text-white mt-0.5 tracking-wide">
              {nextMatch.homeTeam} <span className="text-white/40 font-normal">vs</span> {nextMatch.awayTeam}
            </p>
            <p className="text-xs text-rayo-bone/60 flex items-center md:justify-end gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[13px] text-rayo-gold">location_on</span>
              {nextMatch.location} ({nextMatch.dayTime})
            </p>
          </div>

          <div className="px-3.5 py-2 rounded bg-rayo-burgundy/40 border border-rayo-burgundy/60 text-center flex-shrink-0 min-w-[76px]">
            <span className="block text-[9px] font-bold text-white/80 uppercase tracking-widest">
              Faltan
            </span>
            <span className="font-display text-base font-bold text-white tracking-wider">
              {countdown}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
