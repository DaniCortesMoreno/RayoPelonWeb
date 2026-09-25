import React from 'react';
import { CLUB_INFO } from '../../data/mockData';
import { MatchCenterBanner } from './MatchCenterBanner';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16" id="inicio">
      {/* Background Pitch Image with Premium Cinematic Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src={CLUB_INFO.heroBgUrl}
          alt="Plantilla Rayo Pelón F7 al Atardecer"
          className="w-full h-full object-cover object-center filter brightness-45 contrast-110 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rayo-carbon via-rayo-carbon/75 to-rayo-carbon/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-[#07070F]/60 to-rayo-carbon"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        {/* League Tag & Club Motto */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-rayo-gold"></span>
          <span className="font-display uppercase tracking-[0.16em] text-xs font-semibold text-rayo-bone/90">
            {CLUB_INFO.league.toUpperCase()} • {CLUB_INFO.season.toUpperCase()}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-rayo-burgundy text-[9px] font-bold uppercase text-white tracking-widest">
            OFICIAL
          </span>
        </div>

        {/* Big Impactful Headline */}
        <h1 className="font-display font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight uppercase leading-[0.95] mb-5">
          SENTIMIENTO, <br className="hidden sm:inline" />
          <span className="text-champagne-gradient">GARRA Y RAYO</span>
        </h1>

        {/* Slogan */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base font-normal text-rayo-bone/70 mb-10 leading-relaxed">
          {CLUB_INFO.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <a
            href="#plantilla"
            className="px-7 py-3 rounded font-display text-xs font-bold uppercase tracking-[0.14em] bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-base">groups</span>
            Conoce la Plantilla
          </a>
          <a
            href="#clasificacion"
            className="px-7 py-3 rounded font-display text-xs font-bold uppercase tracking-[0.14em] bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] hover:border-rayo-gold/40 transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-base">leaderboard</span>
            Ver Clasificación
          </a>
        </div>

        {/* Match Center Floating Card */}
        <MatchCenterBanner />
      </div>
    </section>
  );
};
