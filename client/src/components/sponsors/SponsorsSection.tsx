import React from 'react';
import { SPONSORS_DATA } from '../../data/mockData';

export const SponsorsSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#07070F] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[10px] font-display font-semibold tracking-[0.2em] text-rayo-gold uppercase">
          OFFICIAL CLUB PARTNERS
        </span>
        <h3 className="font-display text-2xl font-bold text-white uppercase mt-1">
          EMPRESAS QUE IMPULSAN AL RAYO
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center mt-8">
          {SPONSORS_DATA.map((sponsor) => (
            <div
              key={sponsor.id}
              className="p-3.5 rounded bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center grayscale hover:grayscale-0 hover:border-rayo-gold/40 transition-all duration-300 group cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl text-rayo-bone/60 group-hover:text-rayo-gold">
                {sponsor.icon}
              </span>
              <span className="font-display font-semibold text-[11px] uppercase text-white/70 group-hover:text-white mt-1.5 tracking-wider">
                {sponsor.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
