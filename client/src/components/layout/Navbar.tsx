import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MATCH_CENTER_DATA } from '../../data/mockData';
import { API_BASE } from '../../config/api';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [nextMatch, setNextMatch] = useState(() => ({
    matchday: MATCH_CENTER_DATA.nextMatch.matchday,
    dayTime: MATCH_CENTER_DATA.nextMatch.dayTime
  }));

  useEffect(() => {
    fetch(`${API_BASE}/matches/center`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.nextMatch?.matchday) {
          setNextMatch({
            matchday: d.nextMatch.matchday,
            dayTime: d.nextMatch.dayTime
          });
        }
      })
      .catch(() => {});
  }, []);


  // Opciones del menú global depuradas según las instrucciones:
  // Se han retirado 'Clasificación' y 'Equipaciones' ya que están en la página de inicio.
  const navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Plantilla', path: '/plantilla' },
    { label: 'Multimedia', path: '/multimedia' },
    { label: 'Noticias', path: '/noticias' },
    { label: 'Contacto', path: '/contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#07070F]/90 backdrop-blur-md border-b border-white/[0.08] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand: Escudo Oficial PNG sin fondo (Clic lleva a Inicio) */}
        <Link
          to="/"
          className="flex items-center group py-1"
          title="Rayo Pelón - Volver al Inicio"
        >
          <div className="h-14 w-14 sm:h-16 sm:w-16 relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            <img
              src="/escudo.png"
              alt="Escudo Oficial Rayo Pelón"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(197,160,89,0.35)]"
            />
          </div>
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isRoute = link.path.startsWith('/') && !link.path.includes('#');
            const isActive = location.pathname === link.path;

            return isRoute ? (
              <Link
                key={link.label}
                to={link.path}
                className={`nav-link px-4 py-2 text-xs font-semibold tracking-wider transition-all rounded-lg uppercase ${
                  isActive
                    ? 'text-rayo-gold bg-white/[0.08] font-bold shadow-sm'
                    : 'text-rayo-bone/80 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.path}
                className="nav-link px-4 py-2 text-xs font-semibold tracking-wider text-rayo-bone/80 hover:text-white transition-all rounded-lg hover:bg-white/[0.04] uppercase"
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons & Match Status */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] uppercase tracking-wider text-rayo-bone/70">J{nextMatch.matchday}:</span>
            <span className="text-[11px] font-bold text-rayo-gold">{nextMatch.dayTime}</span>
          </div>

          <Link
            to="/contacto#patrocinadores"
            className="px-4 py-2 rounded font-display font-semibold uppercase tracking-[0.12em] text-xs bg-rayo-gold hover:bg-rayo-goldLight text-[#07070F] transition-all duration-200 flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm font-semibold">handshake</span>
            Patrocinadores
          </Link>

          <Link
            to="/admin"
            title="Panel de Control Deportivo"
            className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-rayo-gold/40 flex items-center justify-center text-rayo-bone/80 hover:text-rayo-gold transition-all"
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded text-rayo-bone hover:text-rayo-gold hover:bg-white/5 transition-colors"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0C1A] border-b border-white/[0.08] px-6 py-4 space-y-2 animate-fadeIn">
          {navLinks.map((link) => {
            const isRoute = link.path.startsWith('/') && !link.path.includes('#');
            return isRoute ? (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-semibold tracking-wider uppercase text-rayo-bone hover:text-rayo-gold"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-semibold tracking-wider uppercase text-rayo-bone hover:text-rayo-gold"
              >
                {link.label}
              </a>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <Link
              to="/contacto#patrocinadores"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded font-display font-semibold uppercase tracking-wider text-xs bg-rayo-gold text-rayo-carbon"
            >
              Hazte Patrocinador
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
