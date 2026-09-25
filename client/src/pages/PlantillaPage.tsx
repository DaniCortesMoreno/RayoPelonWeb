import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PlayerCard3D } from '../components/squad/PlayerCard3D';
import { SquadTable } from '../components/squad/SquadTable';
import { INITIAL_PLAYERS, CLUB_INFO } from '../data/mockData';
import type { Player } from '../types';

import { API_BASE } from '../config/api';

export const PlantillaPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [selectedPos, setSelectedPos] = useState<string>('ALL');

  // Fetch players dynamically from backend API
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

  const filteredCards = useMemo(() => {
    if (selectedPos === 'ALL') return players;
    return players.filter((p) => p.position === selectedPos);
  }, [players, selectedPos]);

  const totalGoals = useMemo(
    () => players.reduce((acc, p) => acc + (p.seasonStats?.goals || 0), 0),
    [players]
  );

  const totalAssists = useMemo(
    () => players.reduce((acc, p) => acc + (p.seasonStats?.assists || 0), 0),
    [players]
  );

  const avgRating = useMemo(() => {
    if (players.length === 0) return '0.0';
    const sum = players.reduce((acc, p) => acc + (p.rating || 0), 0);
    return (sum / players.length).toFixed(1);
  }, [players]);

  const filterButtons: { label: string; value: string; count: number }[] = [
    { label: 'Todos los Guerreros', value: 'ALL', count: players.length },
    { label: 'Porteros', value: 'POR', count: players.filter((p) => p.position === 'POR').length },
    { label: 'Defensas', value: 'DEF', count: players.filter((p) => p.position === 'DEF').length },
    { label: 'Medios', value: 'MED', count: players.filter((p) => p.position === 'MED').length },
    { label: 'Delanteros', value: 'DEL', count: players.filter((p) => p.position === 'DEL').length },
  ];

  return (
    <div className="min-h-screen bg-rayo-carbon text-rayo-bone selection:bg-rayo-gold selection:text-black">
      <Navbar />

      <main className="pt-20">
        {/* ========================================= */}
        {/* HERO BANNER DE LA PÁGINA PLANTILLA        */}
        {/* ========================================= */}
        <section className="relative py-16 sm:py-24 overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#110e32] via-[#070518] to-rayo-carbon">
          {/* Subtle Ambient Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-rayo-gold/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] mb-5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-rayo-gold animate-pulse"></span>
              <span className="font-display uppercase tracking-[0.16em] text-xs font-semibold text-rayo-bone/90">
                TEMPORADA 2026/27 • LIGA PLATA DE IBI
              </span>
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white leading-none mb-4">
              PLANTILLA <span className="text-champagne-gradient">OFICIAL</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-rayo-bone/70 leading-relaxed mb-10">
              Conoce a los futbolistas que defienden el escudo de {CLUB_INFO.name}. Pasa el ratón por encima de cada cromo coleccionable para descubrir sus estadísticas individuales en tiempo real.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="elite-card rounded-xl p-4 border border-white/[0.08]">
                <span className="text-[10px] font-display font-semibold text-rayo-bone/60 uppercase tracking-widest block">
                  FUTBOLISTAS
                </span>
                <span className="font-display text-3xl font-bold text-white mt-1 block">
                  {players.length}
                </span>
                <span className="text-[10px] text-emerald-400">100% Comprometidos</span>
              </div>

              <div className="elite-card rounded-xl p-4 border border-rayo-gold/30 bg-gradient-to-b from-rayo-gold/[0.06] to-transparent">
                <span className="text-[10px] font-display font-semibold text-rayo-gold uppercase tracking-widest block">
                  GOLES TOTALES (G)
                </span>
                <span className="font-display text-3xl font-bold text-rayo-gold mt-1 block">
                  {totalGoals}
                </span>
                <span className="text-[10px] text-rayo-gold/80">3.46 goles / partido</span>
              </div>

              <div className="elite-card rounded-xl p-4 border border-white/[0.08]">
                <span className="text-[10px] font-display font-semibold text-white uppercase tracking-widest block">
                  ASISTENCIAS (A)
                </span>
                <span className="font-display text-3xl font-bold text-white mt-1 block">
                  {totalAssists}
                </span>
                <span className="text-[10px] text-rayo-bone/50">Juego asociativo</span>
              </div>

              <div className="elite-card rounded-xl p-4 border border-white/[0.08]">
                <span className="text-[10px] font-display font-semibold text-rose-400 uppercase tracking-widest block">
                  MEDIA RATING OVR
                </span>
                <span className="font-display text-3xl font-bold text-rose-300 mt-1 block">
                  {avgRating}
                </span>
                <span className="text-[10px] text-rose-300/70">Nivel Alta Competición</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* SECCIÓN DE CROMOS 3D INTERACTIVOS         */}
        {/* ========================================= */}
        <section className="py-16 sm:py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rayo-gold block mb-1">
                  COLECCIÓN DE CROMOS OFICIALES
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
                  Cartas Coleccionables 3D
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setSelectedPos(btn.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      selectedPos === btn.value
                        ? 'bg-rayo-gold text-rayo-carbon shadow-lg shadow-rayo-gold/20'
                        : 'bg-white/[0.04] text-rayo-bone/80 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    <span>{btn.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedPos === btn.value ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60'
                    }`}>
                      {btn.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of 3D Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-20">
              {filteredCards.map((player) => (
                <PlayerCard3D key={player.id} player={player} />
              ))}
            </div>

            {/* ========================================= */}
            {/* TABLA COMPLETA CON PJ, G, A               */}
            {/* ========================================= */}
            <SquadTable players={players} />

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
