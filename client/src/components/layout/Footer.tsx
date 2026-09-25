import React from 'react';
import { Link } from 'react-router-dom';
import { CLUB_INFO } from '../../data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05050B] border-t border-white/[0.08] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Crest & Info */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 flex-shrink-0 transition-transform group-hover:scale-105">
              <img
                src={CLUB_INFO.badgeUrl}
                alt="Escudo Rayo Pelón"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-white tracking-wider group-hover:text-rayo-gold transition-colors">
                RAYO PELÓN F7
              </p>
              <p className="text-[11px] text-rayo-bone/60">
                {CLUB_INFO.league} • Liga Comarcal de Fútbol 7
              </p>
            </div>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-5 text-xs text-rayo-bone/60 uppercase font-medium">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <Link to="/plantilla" className="hover:text-white transition-colors">Plantilla</Link>
            <Link to="/multimedia" className="hover:text-white transition-colors">Multimedia</Link>
            <Link to="/noticias" className="hover:text-white transition-colors">Noticias</Link>
            <Link to="/contacto" className="hover:text-white transition-colors text-rayo-gold font-semibold">Contacto</Link>
            <Link to="/admin" className="hover:text-rayo-gold transition-colors font-mono">Admin</Link>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center text-[11px] text-rayo-bone/40 gap-3">
          <p>© 2026/2027 RAYO PELÓN F7 • TODOS LOS DERECHOS RESERVADOS • POLIDEPORTIVO MUNICIPAL DE IBI</p>
          <p className="text-rayo-gold/80 font-medium">Diseño Deportivo de Alta Competición</p>
        </div>
      </div>
    </footer>
  );
};
