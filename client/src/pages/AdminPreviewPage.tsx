import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLoginForm } from '../components/admin/AdminLoginForm';
import { AdminUsersManager } from '../components/admin/AdminUsersManager';
import { AdminPlayersManager } from '../components/admin/AdminPlayersManager';
import { AdminMediaManager } from '../components/admin/AdminMediaManager';
import { AdminMatchesManager } from '../components/admin/AdminMatchesManager';
import { AdminNewsManager } from '../components/admin/AdminNewsManager';
import { CLUB_INFO, INITIAL_PLAYERS, STANDINGS_DATA, NEWS_DATA } from '../data/mockData';
import { API_BASE } from '../config/api';

export const AdminPreviewPage: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'players' | 'matches' | 'standings' | 'news' | 'multimedia' | 'users'>('dashboard');

  // Si está verificando sesión en localStorage o backend
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070F] text-rayo-bone flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-3 border-rayo-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono uppercase tracking-widest text-rayo-gold animate-pulse">
          Comprobando autorización...
        </p>
      </div>
    );
  }

  // Si no está autenticado, renderizar la pantalla de Login (NO HAY REGISTRO MANUAL)
  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  return (
    <div className="min-h-screen bg-[#07070F] text-rayo-bone flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#0A0A16] border-r border-white/[0.08] p-5 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 pb-6 border-b border-white/[0.08]">
            <div className="w-10 h-10 flex-shrink-0">
              <img src={CLUB_INFO.badgeUrl} alt="Escudo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-base tracking-wider">PANEL ADMIN</h2>
              <span className="text-[10px] text-rayo-gold font-semibold uppercase tracking-widest">Rayo Pelón F7</span>
            </div>
          </div>

          {/* User Session Mini Card */}
          <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs uppercase flex-shrink-0 ${
                  isAdmin
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                    : 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                }`}
              >
                {user?.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{user?.username}</div>
                <div className="text-[9px] font-mono uppercase text-rayo-gold tracking-wider flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
                  {user?.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              Dashboard General
            </button>

            <button
              onClick={() => setActiveTab('players')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'players'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">groups</span>
              Gestión Plantilla ({INITIAL_PLAYERS.length})
            </button>

            <button
              onClick={() => setActiveTab('multimedia')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'multimedia'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">perm_media</span>
              Multimedia & Jornadas
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'matches'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">sports_soccer</span>
              Partidos & Marcadores (22)
            </button>

            <button
              onClick={() => setActiveTab('standings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'standings'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">leaderboard</span>
              Clasificación ({STANDINGS_DATA.length})
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'news'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">newspaper</span>
              Noticias & Crónicas ({NEWS_DATA.length})
            </button>

            {/* Pestaña de Usuarios & Roles */}
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'users'
                  ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                  : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                <span>Usuarios & Roles</span>
              </div>
              {!isAdmin && (
                <span className="material-symbols-outlined text-xs text-amber-400/80" title="Solo Administrador">
                  lock
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Back to Public Web & Logout */}
        <div className="pt-6 border-t border-white/[0.08] space-y-2">
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold uppercase tracking-wider text-rayo-bone transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Volver a la Web
          </a>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold uppercase tracking-wider text-rose-400 transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400'}`}></span>
              <span className="text-rayo-gold">
                Conectado como <strong className="text-white">{user?.username}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {isAdmin ? 'ADMINISTRADOR TOTAL' : 'MODERADOR'}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white uppercase mt-1">
              Panel de Control Deportivo
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded bg-rayo-burgundy/30 border border-rayo-burgundy/50 text-rose-300 text-xs font-semibold uppercase">
              Temporada 26/27 • Ibi
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded bg-white/[0.05] hover:bg-rose-500/20 hover:text-rose-300 text-rayo-bone text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Salir
            </button>
          </div>
        </header>

        {/* Dynamic Admin View */}
        {activeTab === 'dashboard' && (
          <div className="mt-8 space-y-8 animate-fadeIn">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="elite-card rounded-lg p-5 border border-white/[0.08]">
                <span className="text-[10px] font-semibold text-rayo-gold uppercase tracking-wider">Plantilla Registrada</span>
                <p className="font-display text-3xl font-bold text-white mt-1">{INITIAL_PLAYERS.length} Jugadores</p>
                <span className="text-xs text-emerald-400 mt-1 block">● 5 Aptos para Jornada 14</span>
              </div>
              <div className="elite-card rounded-lg p-5 border border-white/[0.08]">
                <span className="text-[10px] font-semibold text-rayo-gold uppercase tracking-wider">Posición en Liga</span>
                <p className="font-display text-3xl font-bold text-white mt-1">2º Puesto (29 pts)</p>
                <span className="text-xs text-rayo-gold mt-1 block">A 3 pts del liderato</span>
              </div>
              <div className="elite-card rounded-lg p-5 border border-white/[0.08]">
                <span className="text-[10px] font-semibold text-rayo-gold uppercase tracking-wider">Próximo Compromiso</span>
                <p className="font-display text-2xl font-bold text-white mt-1">vs Galácticos Ibi</p>
                <span className="text-xs text-rayo-bone/60 mt-1 block">Lunes 21:00h • Campo 1</span>
              </div>
              <div className="elite-card rounded-lg p-5 border border-white/[0.08]">
                <span className="text-[10px] font-semibold text-rayo-gold uppercase tracking-wider">Noticias Publicadas</span>
                <p className="font-display text-3xl font-bold text-white mt-1">{NEWS_DATA.length} Artículos</p>
                <span className="text-xs text-rayo-bone/60 mt-1 block">Última hace 2 días</span>
              </div>
            </div>

            {/* Quick Access Card */}
            <div className="elite-gold-card rounded-xl p-6 border border-rayo-gold/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-rayo-gold/20 border border-rayo-gold/40 flex items-center justify-center text-rayo-gold flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl">shield</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-white">
                    Permisos y Control de Sesión Activo
                  </h3>
                  <p className="text-xs text-rayo-bone/80 mt-1.5 leading-relaxed">
                    Has iniciado sesión correctamente con el usuario <strong className="text-white">{user?.username}</strong> ({user?.role}).
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-rayo-bone/70 list-disc list-inside">
                    <li><strong className="text-white">Sesión Segura</strong>: Conexión protegida con tokens cifrados y expiración controlada.</li>
                    <li><strong className="text-white">Roles Diferenciados</strong>: Los Administradores pueden gestionar plantilla, noticias, multimedia y usuarios. Los Moderadores gestionan contenido deportivo.</li>
                    <li><strong className="text-white">Sin Registro Manual</strong>: Ninguna persona externa puede crearse cuentas desde fuera del club.</li>
                  </ul>
                  {isAdmin && (
                    <div className="mt-4">
                      <button
                        onClick={() => setActiveTab('users')}
                        className="px-4 py-2 rounded-lg bg-rayo-gold text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider hover:bg-rayo-goldLight transition-colors inline-flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">manage_accounts</span>
                        Administrar Usuarios y Roles
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="mt-8 animate-fadeIn">
            <AdminPlayersManager />
          </div>
        )}

        {activeTab === 'multimedia' && (
          <div className="mt-8 animate-fadeIn">
            <AdminMediaManager />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="mt-8 animate-fadeIn">
            <AdminUsersManager />
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="mt-8 elite-card rounded-xl p-6 sm:p-8 border border-white/[0.08] animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-rayo-gold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conexión con Liga Comarcal de Ibi
                </div>
                <h3 className="font-display text-2xl font-bold uppercase text-white">
                  Clasificación Oficial & Sincronización
                </h3>
                <p className="text-xs text-rayo-bone/60 mt-1">
                  Fuente oficial:{' '}
                  <a
                    href="https://www.ligacomarcal.com/competicion/lc-futbol-7-ibi-plata-mtzfdn3f/clasificacion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rayo-gold hover:underline"
                  >
                    ligacomarcal.com
                  </a>
                </p>
              </div>

              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('rayo_pelon_auth_token');
                    const res = await fetch(`${API_BASE}/standings/sync`, {
                      method: 'POST',
                      headers: token ? { Authorization: `Bearer ${token}` } : {}
                    });
                    const data = await res.json();
                    alert(data.message || 'Clasificación sincronizada');
                    window.location.reload();
                  } catch {
                    alert('Error conectando con el servidor backend');
                  }
                }}
                className="px-5 py-2.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-base">sync</span>
                Sincronizar con Liga Comarcal Ahora
              </button>
            </div>

            {/* Preview of current 12 teams in DB */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0A0A16] text-[10px] font-display uppercase tracking-wider text-rayo-bone/50 border-b border-white/[0.08]">
                    <th className="py-2.5 px-3 text-center">Pos</th>
                    <th className="py-2.5 px-3">Escudo</th>
                    <th className="py-2.5 px-3">Equipo</th>
                    <th className="py-2.5 px-2 text-center">PJ</th>
                    <th className="py-2.5 px-2 text-center">PG</th>
                    <th className="py-2.5 px-2 text-center">PE</th>
                    <th className="py-2.5 px-2 text-center">PP</th>
                    <th className="py-2.5 px-2 text-center">GF</th>
                    <th className="py-2.5 px-2 text-center">GC</th>
                    <th className="py-2.5 px-2 text-center">DIF</th>
                    <th className="py-2.5 px-3 text-center font-bold text-white">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {STANDINGS_DATA.map((t) => (
                    <tr key={t.teamName} className={t.isRayo ? 'bg-rayo-gold/10' : ''}>
                      <td className="py-2.5 px-3 text-center font-bold">{t.position}</td>
                      <td className="py-2.5 px-3">
                        {t.isRayo ? (
                          <img src="/escudo.png" alt="Rayo" className="w-6 h-6 object-contain" />
                        ) : t.badgeUrl ? (
                          <img src={t.badgeUrl} alt={t.teamName} className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="text-[10px] font-mono">{t.teamCode}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {t.teamName}{' '}
                        {t.isRayo && (
                          <span className="ml-1.5 px-1.5 py-0.2 text-[9px] bg-rayo-gold text-black rounded font-bold">
                            Rayo
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">{t.matchesPlayed}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-400">{t.won}</td>
                      <td className="py-2.5 px-2 text-center">{t.drawn}</td>
                      <td className="py-2.5 px-2 text-center text-rose-400">{t.lost}</td>
                      <td className="py-2.5 px-2 text-center">{t.goalsFor}</td>
                      <td className="py-2.5 px-2 text-center">{t.goalsAgainst}</td>
                      <td className="py-2.5 px-2 text-center">{t.goalDifference}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-rayo-gold">{t.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="mt-8 animate-fadeIn">
            <AdminMatchesManager />
          </div>
        )}

        {activeTab === 'news' && (
          <div className="mt-8 animate-fadeIn">
            <AdminNewsManager />
          </div>
        )}
      </main>
    </div>
  );
};
