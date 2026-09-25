import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE } from '../../config/api';
import { getAuthHeaders } from '../../context/AuthContext';
import type { AuditLog, AuditAction, AuditModule } from '../../types';

const ACTION_CONFIG: Record<
  AuditAction,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  CREATE: {
    label: 'CREACIÓN',
    icon: 'add_circle',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30'
  },
  UPDATE: {
    label: 'EDICIÓN',
    icon: 'edit',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30'
  },
  DELETE: {
    label: 'ELIMINACIÓN',
    icon: 'delete',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30'
  },
  LOGIN: {
    label: 'ACCESO',
    icon: 'login',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30'
  },
  SYNC: {
    label: 'SINCRONIZACIÓN',
    icon: 'sync',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30'
  }
};

const MODULE_CONFIG: Record<AuditModule, { label: string; icon: string }> = {
  NOTICIAS: { label: 'Noticias & Crónicas', icon: 'newspaper' },
  PARTIDOS: { label: 'Partidos & Marcadores', icon: 'sports_soccer' },
  PLANTILLA: { label: 'Plantilla de Jugadores', icon: 'groups' },
  MULTIMEDIA: { label: 'Multimedia & Jornadas', icon: 'perm_media' },
  USUARIOS: { label: 'Usuarios & Roles', icon: 'admin_panel_settings' },
  CLASIFICACION: { label: 'Clasificación', icon: 'leaderboard' },
  SISTEMA: { label: 'Sistema & Auditoría', icon: 'settings' }
};

export const AdminLogsManager: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedModule, setSelectedModule] = useState<string>('TODOS');
  const [selectedAction, setSelectedAction] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/logs`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Acceso denegado: Esta sección es exclusiva para el Administrador.');
        }
        throw new Error('Error al obtener los logs de auditoría.');
      }

      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Clear logs
  const handleClearLogs = async () => {
    if (
      !window.confirm(
        '¿Estás seguro de que deseas vaciar todo el registro de auditoría? Esta acción dejará constancia en un nuevo log de sistema.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/logs`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Historial vaciado');
        fetchLogs();
      } else {
        alert(data.error || 'Error al vaciar logs');
      }
    } catch {
      alert('Error de conexión con el servidor');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = ['ID', 'Fecha / Hora (ISO)', 'Usuario', 'Rol', 'Accion', 'Modulo', 'Descripcion'];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.username}"`,
      l.userRole,
      l.action,
      l.module,
      `"${(l.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rayo_pelon_auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (selectedModule !== 'TODOS' && l.module !== selectedModule) return false;
      if (selectedAction !== 'TODAS' && l.action !== selectedAction) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = (l.description || '').toLowerCase().includes(q);
        const matchUser = (l.username || '').toLowerCase().includes(q);
        const matchMod = (l.module || '').toLowerCase().includes(q);
        const matchAct = (l.action || '').toLowerCase().includes(q);
        if (!matchDesc && !matchUser && !matchMod && !matchAct) return false;
      }
      return true;
    });
  }, [logs, selectedModule, selectedAction, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const now = new Date().getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const past24h = logs.filter((l) => now - new Date(l.timestamp).getTime() <= oneDayMs).length;
    const uniqueUsers = new Set(logs.map((l) => l.username)).size;
    const creates = logs.filter((l) => l.action === 'CREATE').length;
    const updates = logs.filter((l) => l.action === 'UPDATE').length;
    const deletes = logs.filter((l) => l.action === 'DELETE').length;

    return { total, past24h, uniqueUsers, creates, updates, deletes };
  }, [logs]);

  // Format date helper
  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const day = d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const time = d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Relative calculation
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let relative = '';
      if (diffMins < 1) relative = 'Hace un momento';
      else if (diffMins < 60) relative = `Hace ${diffMins} min`;
      else {
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) relative = `Hace ${diffHours} h`;
        else {
          const diffDays = Math.floor(diffHours / 24);
          relative = `Hace ${diffDays} d`;
        }
      }

      return { day, time, relative };
    } catch {
      return { day: isoString, time: '', relative: '' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="elite-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rayo-gold/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rayo-gold/10 border border-rayo-gold/20 text-rayo-gold text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-sm">security</span>
              Exclusivo Rol Administrador
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
              Auditoría & Registro de Actividad
            </h2>
            <p className="text-xs sm:text-sm text-rayo-bone/60 mt-1 max-w-2xl">
              Trazabilidad integral en tiempo real: consulta con exactitud <strong>quién</strong>, <strong>cuándo</strong> y <strong>qué</strong> se ha creado, modificado o eliminado en cada sección del club.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-rayo-bone text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2"
              title="Recargar bitácora"
            >
              <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>Actualizar</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="px-3.5 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-rayo-bone text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-40"
              title="Descargar en formato CSV para Excel"
            >
              <span className="material-symbols-outlined text-base text-emerald-400">download</span>
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleClearLogs}
              disabled={logs.length === 0}
              className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-40"
              title="Vaciar historial de logs"
            >
              <span className="material-symbols-outlined text-base">delete_sweep</span>
              <span>Vaciar Logs</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/[0.06]">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] font-mono uppercase text-rayo-bone/50 tracking-wider">Total Registros</div>
            <div className="text-xl font-display font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] font-mono uppercase text-rayo-bone/50 tracking-wider">Últimas 24h</div>
            <div className="text-xl font-display font-bold text-cyan-400 mt-1">{stats.past24h}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] font-mono uppercase text-rayo-bone/50 tracking-wider">Usuarios Activos</div>
            <div className="text-xl font-display font-bold text-rayo-gold mt-1">{stats.uniqueUsers}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] font-mono uppercase text-rayo-bone/50 tracking-wider">Creaciones</div>
            <div className="text-xl font-display font-bold text-emerald-400 mt-1">{stats.creates}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] font-mono uppercase text-rayo-bone/50 tracking-wider">Modificaciones</div>
            <div className="text-xl font-display font-bold text-amber-400 mt-1">{stats.updates}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] font-mono uppercase text-rayo-bone/50 tracking-wider">Eliminaciones</div>
            <div className="text-xl font-display font-bold text-rose-400 mt-1">{stats.deletes}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="elite-card rounded-xl p-4 border border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario, acción o detalle (ej: Dani, Jornada 3, Parte médico)..."
            className="w-full bg-[#0E0E1F] border border-white/[0.08] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-rayo-gold transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Module Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-mono uppercase text-rayo-bone/50 whitespace-nowrap">
            Módulo:
          </label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-[#0E0E1F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold transition-colors font-medium"
          >
            <option value="TODOS">Todos los módulos</option>
            <option value="NOTICIAS">Noticias & Crónicas</option>
            <option value="PARTIDOS">Partidos & Marcadores</option>
            <option value="PLANTILLA">Plantilla de Jugadores</option>
            <option value="MULTIMEDIA">Multimedia & Jornadas</option>
            <option value="USUARIOS">Usuarios & Roles</option>
            <option value="CLASIFICACION">Clasificación</option>
            <option value="SISTEMA">Sistema</option>
          </select>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-mono uppercase text-rayo-bone/50 whitespace-nowrap">
            Acción:
          </label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-[#0E0E1F] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rayo-gold transition-colors font-medium"
          >
            <option value="TODAS">Todas las acciones</option>
            <option value="CREATE">Solo Creaciones</option>
            <option value="UPDATE">Solo Modificaciones</option>
            <option value="DELETE">Solo Eliminaciones</option>
            <option value="LOGIN">Solo Inicios de Sesión</option>
            <option value="SYNC">Solo Sincronizaciones</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="elite-card rounded-2xl p-12 text-center border border-white/[0.08]">
          <div className="w-10 h-10 border-2 border-rayo-gold border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-mono uppercase text-rayo-gold tracking-widest">
            Cargando bitácora de auditoría...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center">
          <span className="material-symbols-outlined text-3xl mb-2 text-rose-400">error</span>
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchLogs}
            className="mt-3 px-4 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold uppercase transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="elite-card rounded-2xl p-12 text-center border border-white/[0.08]">
          <span className="material-symbols-outlined text-4xl text-white/20 mb-2">policy</span>
          <h3 className="font-display text-base font-bold uppercase text-white">
            No hay registros con los filtros seleccionados
          </h3>
          <p className="text-xs text-rayo-bone/60 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedModule !== 'TODOS' || selectedAction !== 'TODAS'
              ? 'Prueba a restablecer los filtros o la barra de búsqueda para ver más resultados.'
              : 'Aún no se ha registrado ninguna actividad en el sistema.'}
          </p>
          {(searchQuery || selectedModule !== 'TODOS' || selectedAction !== 'TODAS') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedModule('TODOS');
                setSelectedAction('TODAS');
              }}
              className="mt-4 px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-rayo-gold uppercase tracking-wider transition-colors"
            >
              Restablecer Filtros
            </button>
          )}
        </div>
      ) : (
        /* Timeline Log Cards */
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-rayo-bone/50 px-2">
            <span>
              Mostrando {filteredLogs.length} de {logs.length} eventos registrados
            </span>
            <span className="text-rayo-gold font-bold">Orden: Más recientes primero</span>
          </div>

          <div className="divide-y divide-white/[0.04] elite-card rounded-2xl border border-white/[0.08] overflow-hidden">
            {filteredLogs.map((log) => {
              const actConfig = ACTION_CONFIG[log.action] || ACTION_CONFIG.UPDATE;
              const modConfig = MODULE_CONFIG[log.module] || { label: log.module, icon: 'circle' };
              const dateInfo = formatDateTime(log.timestamp);
              const isAdminUser = log.userRole === 'ADMIN';

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    {/* Action Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${actConfig.bg} ${actConfig.text} border ${actConfig.border}`}
                      title={`${actConfig.label} en ${modConfig.label}`}
                    >
                      <span className="material-symbols-outlined text-lg">{actConfig.icon}</span>
                    </div>

                    {/* Log Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {/* Action Tag */}
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${actConfig.bg} ${actConfig.text} border ${actConfig.border}`}
                        >
                          {actConfig.label}
                        </span>

                        {/* Module Tag */}
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-rayo-bone/80 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">{modConfig.icon}</span>
                          <span>{modConfig.label}</span>
                        </span>

                        {/* User Badge */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAdminUser ? 'bg-amber-400' : 'bg-cyan-400'
                            }`}
                          ></span>
                          <strong>{log.username}</strong>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                              isAdminUser
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                            }`}
                          >
                            {log.userRole}
                          </span>
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed break-words">
                        {log.description}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-left sm:text-right flex-shrink-0 sm:pl-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                    <div className="text-xs font-mono font-bold text-rayo-gold">
                      {dateInfo.time}
                    </div>
                    <div className="text-[10px] font-mono text-rayo-bone/60">
                      {dateInfo.day}
                    </div>
                    <div className="text-[9px] font-mono text-rayo-bone/40 italic mt-0.5">
                      {dateInfo.relative}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
