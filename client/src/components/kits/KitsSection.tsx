import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KITS_DATA } from '../../data/mockData';
import type { KitItem } from '../../types';

export const KitsSection: React.FC = () => {
  const [selectedKit, setSelectedKit] = useState<KitItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'home' | 'away'>('all');

  const displayedKits = activeFilter === 'all'
    ? KITS_DATA
    : KITS_DATA.filter((k) => k.type === activeFilter);

  return (
    <section className="py-20 bg-rayo-navy relative overflow-hidden border-t border-white/[0.06]" id="equipaciones">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rayo-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            <span className="material-symbols-outlined text-sm">checkroom</span>
            DISEÑO EXCLUSIVO TEMPORADA 2026/2027
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase text-white tracking-tight">
            ARMADURAS <span className="text-champagne-gradient">OFICIALES</span>
          </h2>
          <p className="text-xs sm:text-sm text-rayo-bone/70 mt-2 max-w-2xl mx-auto leading-relaxed">
            Las dos equipaciones oficiales del Rayo Pelón F7 para competir en la Liga Plata de Ibi. Con el patrocinio oficial de <strong className="text-white">Silvia Vicedo Abogado</strong> en el pecho y el escudo de nuestro club.
          </p>

          {/* Filter Pills */}
          <div className="inline-flex p-1 rounded-xl bg-[#07070F] border border-white/[0.08] mt-6 gap-1 shadow-inner">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all ${
                activeFilter === 'all'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-rayo-bone/60 hover:text-white'
              }`}
            >
              Ver Ambas
            </button>
            <button
              onClick={() => setActiveFilter('home')}
              className={`px-4 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeFilter === 'home'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/60 hover:text-rayo-gold'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              1ª Equipación (Blanco & Oro)
            </button>
            <button
              onClick={() => setActiveFilter('away')}
              className={`px-4 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeFilter === 'away'
                  ? 'bg-rose-700 text-white font-bold shadow-md'
                  : 'text-rayo-bone/60 hover:text-rose-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              2ª Equipación (Azulgrana)
            </button>
          </div>
        </div>

        {/* Kits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {displayedKits.map((kit) => {
            const isHome = kit.type === 'home';

            return (
              <div
                key={kit.id}
                className={`elite-card rounded-2xl p-6 sm:p-8 border flex flex-col justify-between relative group transition-all duration-300 ${
                  isHome
                    ? 'border-rayo-gold/30 hover:border-rayo-gold/60 hover:shadow-[0_0_35px_rgba(197,160,89,0.2)]'
                    : 'border-rose-900/40 hover:border-rose-600/60 hover:shadow-[0_0_35px_rgba(135,20,30,0.25)]'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className={`text-[11px] font-mono font-bold uppercase tracking-[0.16em] ${isHome ? 'text-rayo-gold' : 'text-rose-400'}`}>
                        {kit.badge}
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase mt-0.5 tracking-wide">
                        {kit.name}
                      </h3>
                      <p className="text-xs text-rayo-bone/60 mt-0.5">
                        {kit.subtitle}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-display font-extrabold tracking-widest uppercase border ${
                      isHome
                        ? 'bg-rayo-gold/15 text-rayo-gold border-rayo-gold/30'
                        : 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {kit.tag}
                    </span>
                  </div>

                  {/* 3D Kit Render Showcase */}
                  <div className="relative my-6 py-4 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#07070F] to-[#0A0D1A] border border-white/[0.06] group-hover:border-white/[0.12] transition-colors">
                    {/* Radial glow background specific to jersey */}
                    <div className={`absolute w-72 h-72 rounded-full blur-[90px] opacity-25 pointer-events-none transition-opacity group-hover:opacity-40 ${
                      isHome ? 'bg-rayo-gold' : 'bg-rose-600'
                    }`}></div>

                    {/* Official 3D Render Image */}
                    <div className="relative z-10 cursor-pointer p-4" onClick={() => setSelectedKit(kit)}>
                      <img
                        src={kit.imageUrl}
                        alt={kit.name}
                        className="w-full max-w-[320px] sm:max-w-[360px] h-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>

                    {/* Zoom inspection badge */}
                    <button
                      onClick={() => setSelectedKit(kit)}
                      className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all opacity-80 group-hover:opacity-100"
                      title="Ver en alta resolución"
                    >
                      <span className="material-symbols-outlined text-sm">zoom_in</span>
                      <span>Ver 3D HD</span>
                    </button>
                  </div>

                  {/* Color Palette Swatches */}
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[11px] font-mono uppercase text-rayo-bone/50 tracking-wider">
                      Colores:
                    </span>
                    <div className="flex items-center gap-3">
                      {kit.colors.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                            style={{ backgroundColor: c.hex }}
                          ></span>
                          <span className="text-[11px] text-rayo-bone/80 font-medium">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-rayo-bone/70 leading-relaxed mb-5">
                    {kit.description}
                  </p>

                  {/* Technical Specs Checklist */}
                  <ul className="space-y-2 mb-6">
                    {kit.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-rayo-bone/80">
                        <span className={`material-symbols-outlined text-sm flex-shrink-0 mt-0.5 ${
                          isHome ? 'text-rayo-gold' : 'text-rose-400'
                        }`}>
                          verified
                        </span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-rayo-bone/50 text-[11px]">
                    <span className="material-symbols-outlined text-sm">shield</span>
                    <span>Patrocinio oficial: <strong className="text-white">{kit.sponsor}</strong></span>
                  </div>

                  <Link
                    to="/contacto"
                    className={`font-display text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm ${
                      isHome
                        ? 'bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon'
                        : 'bg-rose-700 hover:bg-rose-600 text-white'
                    }`}
                  >
                    <span>Consultar Réplica</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for High-Resolution View */}
      {selectedKit && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedKit(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#0B0C1A] border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedKit(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
              aria-label="Cerrar vista"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Modal Header */}
            <div className="mb-4">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${
                selectedKit.type === 'home' ? 'text-rayo-gold' : 'text-rose-400'
              }`}>
                {selectedKit.badge}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase mt-0.5">
                {selectedKit.name}
              </h3>
              <p className="text-xs text-rayo-bone/60">
                {selectedKit.subtitle} • Patrocinador Frontal: {selectedKit.sponsor}
              </p>
            </div>

            {/* High-Resolution 3D Image */}
            <div className="relative flex items-center justify-center py-6 bg-gradient-to-b from-[#07070F] to-[#0A0D1A] rounded-xl border border-white/[0.08] my-3">
              <img
                src={selectedKit.imageUrl}
                alt={selectedKit.name}
                className="max-h-[420px] w-auto object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Modal Description & CTA */}
            <p className="text-xs text-rayo-bone/80 mt-4 leading-relaxed">
              {selectedKit.description}
            </p>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs text-rayo-bone/60 font-mono">
                Temporada Oficial 2026/27 • Liga Plata Ibi
              </span>
              <Link
                to="/contacto"
                onClick={() => setSelectedKit(null)}
                className="px-5 py-2.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <span>Pedir o Consultar</span>
                <span className="material-symbols-outlined text-sm">mail</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
