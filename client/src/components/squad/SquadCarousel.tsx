import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { Player } from '../../types';
import { PlayerCard3D } from './PlayerCard3D';

interface SquadCarouselProps {
  players: Player[];
  selectedPos: string;
  onSelectPos: (pos: string) => void;
  filterButtons: { label: string; value: string; count: number }[];
}

export const SquadCarousel: React.FC<SquadCarouselProps> = ({
  players,
  selectedPos,
  onSelectPos,
  filterButtons
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Check scroll position to update progress bar
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const progress = maxScroll > 0 ? (el.scrollLeft / maxScroll) * 100 : 0;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  }, []);

  // Scroll by 1 card step
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const firstCard = el.firstElementChild as HTMLElement;
    const cardStep = firstCard ? firstCard.offsetWidth + 20 : 285;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (direction === 'right') {
      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 15) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -cardStep, behavior: 'smooth' });
      }
    }
  };

  // Auto-advance every 3.5s when NOT hovered
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      const el = scrollContainerRef.current;
      if (!el) return;

      const firstCard = el.firstElementChild as HTMLElement;
      const cardStep = firstCard ? firstCard.offsetWidth + 20 : 285;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (maxScroll <= 0) return;

      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered, players.length]);

  // Track scroll position changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    handleScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll, players]);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Header controls & Position Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-5">
        {/* Status indicator badge */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                isHovered ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="font-mono text-[11px] text-rayo-bone/80">
              {isHovered ? 'PAUSA (CURSOR DETECTADO)' : 'CARRUSEL ACTIVO (AVANCE AUTOMÁTICO)'}
            </span>
          </div>
          <span className="text-xs text-rayo-bone/50 hidden sm:inline">
            {players.length} jugadores en vitrina
          </span>
        </div>

        {/* Position Filter Buttons & Top Arrows */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => onSelectPos(btn.value)}
                className={`px-2.5 py-1 rounded text-xs font-display font-semibold uppercase tracking-wider transition-all ${
                  selectedPos === btn.value
                    ? 'bg-rayo-gold text-rayo-carbon shadow-sm'
                    : 'bg-white/[0.04] text-rayo-bone/80 hover:text-white border border-white/[0.08]'
                }`}
              >
                {btn.label} <span className="opacity-60 text-[10px]">({btn.count})</span>
              </button>
            ))}
          </div>

          {/* Top mini navigation arrows */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
            <button
              onClick={() => scroll('left')}
              aria-label="Anterior jugador"
              className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-rayo-gold hover:text-rayo-carbon text-rayo-bone border border-white/[0.1] flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Siguiente jugador"
              className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-rayo-gold hover:text-rayo-carbon text-rayo-bone border border-white/[0.1] flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Wrapper with dedicated Side Gutters for the Arrow Buttons */}
      <div className="relative px-0 sm:px-11">
        {/* Left Side Arrow Button (positioned in the gutter, outside the cards) */}
        <button
          onClick={() => scroll('left')}
          aria-label="Desplazar a la izquierda"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#0A0A16]/95 hover:bg-rayo-gold text-rayo-gold hover:text-rayo-carbon border border-rayo-gold/30 shadow-xl items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>

        {/* Scrollable Cards Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth py-4 px-2 no-scrollbar scrollbar-none snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {players.map((player) => (
            <div
              key={player.id}
              className="w-[235px] sm:w-[255px] md:w-[265px] flex-shrink-0 snap-start transition-transform duration-300"
            >
              <PlayerCard3D player={player} compact={true} />
            </div>
          ))}
        </div>

        {/* Right Side Arrow Button (positioned in the gutter, outside the cards) */}
        <button
          onClick={() => scroll('right')}
          aria-label="Desplazar a la derecha"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#0A0A16]/95 hover:bg-rayo-gold text-rayo-gold hover:text-rayo-carbon border border-rayo-gold/30 shadow-xl items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">chevron_right</span>
        </button>
      </div>

      {/* Progress & Pagination Bar */}
      <div className="flex items-center justify-between gap-4 mt-2 px-1">
        <div className="flex items-center gap-2 text-[11px] text-rayo-bone/60 font-mono">
          <span className="material-symbols-outlined text-xs text-rayo-gold">swipe</span>
          <span>Desliza o usa flechas para navegar • Pausa al situar el ratón</span>
        </div>

        {/* Mini progress bar */}
        <div className="w-32 sm:w-48 h-1 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rayo-goldDark via-rayo-gold to-rayo-goldLight transition-all duration-200 rounded-full"
            style={{ width: `${Math.max(8, scrollProgress)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
