import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLoginForm } from '../components/admin/AdminLoginForm';
import { AdminUsersManager } from '../components/admin/AdminUsersManager';
import { AdminPlayersManager } from '../components/admin/AdminPlayersManager';
import { AdminMediaManager } from '../components/admin/AdminMediaManager';
import { AdminMatchesManager } from '../components/admin/AdminMatchesManager';
import { AdminNewsManager } from '../components/admin/AdminNewsManager';
import { AdminLogsManager } from '../components/admin/AdminLogsManager';
import { CLUB_INFO, INITIAL_PLAYERS, STANDINGS_DATA, NEWS_DATA } from '../data/mockData';
import type { StandingTeam } from '../types';
import { API_BASE } from '../config/api';

export const AdminPreviewPage: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'players' | 'matches' | 'standings' | 'news' | 'multimedia' | 'users' | 'logs'>('dashboard');

  // Clasificación oficial dinámica
  const [standings, setStandings] = useState<StandingTeam[]>(STANDINGS_DATA);
  const [syncingStandings, setSyncingStandings] = useState(false);
  const [lastSyncInfo, setLastSyncInfo] = useState<{ timestamp?: string; source?: string; count?: number } | null>(null);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');
  const [importingHtml, setImportingHtml] = useState(false);

  const loadStandings = async () => {
    try {
      const res = await fetch(`${API_BASE}/standings`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.standings) && data.standings.length > 0) {
          setStandings(data.standings);
        }
        if (data && data.lastSync) {
          setLastSyncInfo(data.lastSync);
        }
      }
    } catch (err) {
      console.warn('Error cargando clasificación:', err);
    }
  };

  useEffect(() => {
    loadStandings();
  }, []);

  const handleSyncStandings = async () => {
    setSyncingStandings(true);
    setSyncNotice(null);
    try {
      const token = localStorage.getItem('rayo_pelon_auth_token');
      const res = await fetch(`${API_BASE}/standings/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data && data.standings && Array.isArray(data.standings)) {
        setStandings(data.standings);
        if (data.lastSync) setLastSyncInfo(data.lastSync);
        setSyncNotice({
          type: 'success',
          message: data.message || `✓ Clasificación sincronizada con los 12 equipos oficiales.`
        });
      } else {
        setSyncNotice({
          type: 'error',
          message: data.error || data.message || 'No se pudo sincronizar automáticamente'
        });
      }
    } catch {
      setSyncNotice({
        type: 'error',
        message: 'Error al contactar con el servidor'
      });
    } finally {
      setSyncingStandings(false);
      setTimeout(() => setSyncNotice(null), 6000);
    }
  };

  const handleImportHtml = async () => {
    if (!htmlInput.trim()) return;
    setImportingHtml(true);
    try {
      const token = localStorage.getItem('rayo_pelon_auth_token');
      const res = await fetch(`${API_BASE}/standings/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ html: htmlInput })
      });
      const data = await res.json();
      if (data && data.standings && Array.isArray(data.standings) && data.standings.length > 0) {
        setStandings(data.standings);
        if (data.lastSync) setLastSyncInfo(data.lastSync);
        setShowHtmlModal(false);
        setHtmlInput('');
        setSyncNotice({
          type: 'success',
          message: `✓ ¡Tabla HTML procesada con éxito! ${data.standings.length} equipos cargados.`
        });
      } else {
        alert(data.error || 'No se pudieron detectar filas de la tabla en el texto pegado.');
      }
    } catch {
      alert('Error de conexión al importar el HTML.');
    } finally {
      setImportingHtml(false);
      setTimeout(() => setSyncNotice(null), 6000);
    }
  };

  const handleResetOfficial = async () => {
    if (!window.confirm('¿Deseas restablecer la tabla con los 12 equipos oficiales de la Liga Comarcal?')) return;
    setSyncingStandings(true);
    try {
      const token = localStorage.getItem('rayo_pelon_auth_token');
      const res = await fetch(`${API_BASE}/standings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(STANDINGS_DATA)
      });
      const data = await res.json();
      if (data && data.standings) {
        setStandings(data.standings);
        setSyncNotice({
          type: 'success',
          message: '✓ Clasificación restablecida con los 12 equipos oficiales de la Liga.'
        });
      }
    } catch {
      setSyncNotice({
        type: 'error',
        message: 'Error al restablecer los equipos'
      });
    } finally {
      setSyncingStandings(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

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
              Clasificación ({standings.length})
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

            {/* Pestaña de Auditoría & Logs - VISIBLE ÚNICAMENTE PARA ROL ADMIN */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'logs'
                    ? 'bg-rayo-gold text-rayo-carbon font-bold shadow-md'
                    : 'text-rayo-bone/70 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">policy</span>
                  <span>Auditoría & Logs</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-rayo-gold/20 text-rayo-gold text-[9px] font-bold">
                  ADMIN
                </span>
              </button>
            )}
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
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setActiveTab('users')}
                        className="px-4 py-2 rounded-lg bg-rayo-gold text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider hover:bg-rayo-goldLight transition-colors inline-flex items-center gap-2 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-base">manage_accounts</span>
                        Administrar Usuarios y Roles
                      </button>
                      <button
                        onClick={() => setActiveTab('logs')}
                        className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white font-display text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 border border-white/[0.1]"
                      >
                        <span className="material-symbols-outlined text-base text-rayo-gold">policy</span>
                        Ver Registro de Auditoría (Logs)
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
            {/* Sync Notice Alert */}
            {syncNotice && (
              <div
                className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-3 text-xs animate-fadeIn ${
                  syncNotice.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    {syncNotice.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span className="font-semibold">{syncNotice.message}</span>
                </div>
                <button onClick={() => setSyncNotice(null)} className="opacity-70 hover:opacity-100">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-rayo-gold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conexión Oficial con Liga Comarcal de Ibi
                </div>
                <h3 className="font-display text-2xl font-bold uppercase text-white">
                  Clasificación Oficial & Sincronización ({standings.length} Equipos)
                </h3>
                <div className="text-xs text-rayo-bone/60 mt-1 flex flex-wrap items-center gap-3">
                  <span>
                    Fuente:{' '}
                    <a
                      href="https://www.ligacomarcal.com/competicion/lc-futbol-7-ibi-plata-mtzfdn3f/clasificacion"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rayo-gold hover:underline inline-flex items-center gap-1"
                    >
                      <span>ligacomarcal.com</span>
                      <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                    </a>
                  </span>
                  <span>•</span>
                  <span>
                    Última sincronización:{' '}
                    <strong className="text-white">
                      {lastSyncInfo?.timestamp
                        ? new Date(lastSyncInfo.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                        : 'En tiempo real'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSyncStandings}
                  disabled={syncingStandings}
                  className="px-4 py-2.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  title="Sincronizar directamente con el servidor de la liga"
                >
                  <span className={`material-symbols-outlined text-base ${syncingStandings ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  {syncingStandings ? 'Sincronizando...' : 'Sincronizar con Liga Comarcal'}
                </button>

                <button
                  onClick={() => setShowHtmlModal(true)}
                  className="px-3.5 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1] font-display text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5"
                  title="Superar protecciones pegando el código HTML de la tabla de la liga"
                >
                  <span className="material-symbols-outlined text-base text-cyan-400">code</span>
                  Importar HTML
                </button>

                <button
                  onClick={handleResetOfficial}
                  className="px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-rayo-bone/60 hover:text-white border border-white/[0.06] font-display text-xs uppercase tracking-wider transition-all flex items-center gap-1"
                  title="Restablecer tabla con los 12 equipos oficiales verificados"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                  Restablecer
                </button>
              </div>
            </div>

            {/* Modal para Pegar HTML de ligacomarcal.com */}
            {showHtmlModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                <div className="bg-[#0D0D1A] border border-white/[0.12] rounded-2xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-rayo-gold">code</span>
                      <h4 className="font-display font-bold text-lg uppercase">
                        Sincronización Directa vía HTML
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowHtmlModal(false)}
                      className="text-rayo-bone/50 hover:text-white"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <p className="text-xs text-rayo-bone/70 mb-3 leading-relaxed">
                    Si el servidor de la liga activa protección anti-bots (Cloudflare), puedes sincronizar al instante: abre{' '}
                    <a
                      href="https://www.ligacomarcal.com/competicion/lc-futbol-7-ibi-plata-mtzfdn3f/clasificacion"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rayo-gold hover:underline font-semibold"
                    >
                      ligacomarcal.com
                    </a>{' '}
                    en tu navegador, haz clic derecho &gt; <em>Ver código fuente</em> (o copia el contenido de la tabla) y pégalo abajo:
                  </p>

                  <textarea
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    placeholder="Pega aquí el código HTML de ligacomarcal.com/competicion/lc-futbol-7-ibi-plata-mtzfdn3f/clasificacion..."
                    rows={8}
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.1] text-xs font-mono text-white/90 placeholder:text-rayo-bone/30 focus:border-rayo-gold focus:outline-none mb-4"
                  />

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowHtmlModal(false)}
                      className="px-4 py-2 rounded-lg text-xs font-display uppercase tracking-wider text-rayo-bone/70 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleImportHtml}
                      disabled={importingHtml || !htmlInput.trim()}
                      className="px-5 py-2.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md disabled:opacity-40"
                    >
                      <span className={`material-symbols-outlined text-base ${importingHtml ? 'animate-spin' : ''}`}>
                        cloud_upload
                      </span>
                      {importingHtml ? 'Procesando...' : 'Procesar & Actualizar Clasificación'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de Clasificación Oficial con 12 Equipos */}
            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0A0A16] text-[10px] font-display uppercase tracking-wider text-rayo-bone/50 border-b border-white/[0.08]">
                    <th className="py-3 px-3 text-center w-12">Pos</th>
                    <th className="py-3 px-3 w-14">Escudo</th>
                    <th className="py-3 px-3">Equipo</th>
                    <th className="py-3 px-2 text-center w-10">PJ</th>
                    <th className="py-3 px-2 text-center w-10">PG</th>
                    <th className="py-3 px-2 text-center w-10">PE</th>
                    <th className="py-3 px-2 text-center w-10">PP</th>
                    <th className="py-3 px-2 text-center w-10">GF</th>
                    <th className="py-3 px-2 text-center w-10">GC</th>
                    <th className="py-3 px-2 text-center w-10">DIF</th>
                    <th className="py-3 px-3 text-center w-12 font-bold text-rayo-gold">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {standings.map((t) => (
                    <tr
                      key={t.teamName}
                      className={`transition-colors hover:bg-white/[0.02] ${
                        t.isRayo ? 'bg-rayo-gold/10 border-l-2 border-l-rayo-gold font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
                            t.position <= 3
                              ? 'bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30'
                              : 'text-rayo-bone/80'
                          }`}
                        >
                          {t.position}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-7 h-7 rounded-md bg-black/40 border border-white/[0.08] flex items-center justify-center p-0.5">
                          {t.isRayo ? (
                            <img src="/escudo.png" alt="Rayo" className="w-full h-full object-contain" />
                          ) : t.badgeUrl ? (
                            <img src={t.badgeUrl} alt={t.teamName} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-rayo-gold">{t.teamCode}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{t.teamName}</span>
                          {t.isRayo && (
                            <span className="px-2 py-0.5 text-[9px] bg-rayo-gold text-black rounded font-bold uppercase tracking-wider">
                              NUESTRO CLUB
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-rayo-bone/80">{t.matchesPlayed}</td>
                      <td className="py-3 px-2 text-center text-emerald-400 font-bold">{t.won}</td>
                      <td className="py-3 px-2 text-center text-amber-400 font-medium">{t.drawn}</td>
                      <td className="py-3 px-2 text-center text-rose-400 font-medium">{t.lost}</td>
                      <td className="py-3 px-2 text-center text-rayo-bone/80">{t.goalsFor}</td>
                      <td className="py-3 px-2 text-center text-rayo-bone/80">{t.goalsAgainst}</td>
                      <td className="py-3 px-2 text-center font-mono text-rayo-bone/90">{t.goalDifference}</td>
                      <td className="py-3 px-3 text-center font-bold text-sm text-rayo-gold">{t.points}</td>
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

        {isAdmin && activeTab === 'logs' && (
          <div className="mt-8 animate-fadeIn">
            <AdminLogsManager />
          </div>
        )}
      </main>
    </div>
  );
};
