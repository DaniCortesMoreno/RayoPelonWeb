import React from 'react';

export const StandingsSection: React.FC = () => {
  return (
    <section className="py-20 relative bg-rayo-carbon border-t border-white/[0.06] overflow-hidden" id="clasificacion">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rayo-gold/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="elite-card rounded-2xl p-8 sm:p-12 border border-white/[0.08] relative overflow-hidden bg-gradient-to-b from-[#101020]/90 to-[#0A0A16]/95 backdrop-blur-xl shadow-2xl text-center">
          {/* Subtle decorative badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Liga Comarcal F7 Ibi • Temporada 26/27
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-white tracking-tight mb-4">
            Clasificación <span className="text-champagne-gradient">Oficial</span>
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-rayo-bone/75 font-normal leading-relaxed mb-8">
            Consulta en directo la tabla completa de posiciones, puntos acumulados, resultados y estadísticas del torneo actualizada en tiempo real por la organización.
          </p>

          {/* Action button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.ligacomarcal.com/competicion/lc-futbol-7-ibi-plata-mtzfdn3f/clasificacion"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-display text-xs sm:text-sm font-bold uppercase tracking-[0.14em] bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon shadow-[0_4px_24px_rgba(197,160,89,0.35)] hover:shadow-[0_6px_32px_rgba(197,160,89,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 group"
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">leaderboard</span>
              <span>Ver Clasificación en la Liga Oficial</span>
              <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">open_in_new</span>
            </a>
          </div>

          {/* Trust badges footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-6 text-xs text-rayo-bone/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rayo-gold text-base">verified</span>
              <span>Web Oficial de la Competición</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-base">update</span>
              <span>Actualización en Tiempo Real</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-base">sports_soccer</span>
              <span>División Plata F7 Ibi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
