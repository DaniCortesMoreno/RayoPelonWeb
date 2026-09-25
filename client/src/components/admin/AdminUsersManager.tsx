import React, { useState, useEffect } from 'react';
import { useAuth, type UserRole } from '../../context/AuthContext';

interface UserItem {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

import { API_BASE } from '../../config/api';

export const AdminUsersManager: React.FC = () => {
  const { user: currentUser, isAdmin, authFetch } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Form fields for Create
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('MODERADOR');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form fields for Edit
  const [editRole, setEditRole] = useState<UserRole>('MODERADOR');
  const [editPassword, setEditPassword] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchUsers = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const errorData = await res.json();
        showToast('error', errorData.error || 'Error al cargar usuarios');
      }
    } catch {
      showToast('error', 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      showToast('error', 'El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await authFetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          role: newRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', `¡Usuario ${data.user.username} creado con rol ${data.user.role}!`);
        setIsCreateModalOpen(false);
        setNewUsername('');
        setNewPassword('');
        setNewRole('MODERADOR');
        fetchUsers();
      } else {
        showToast('error', data.error || 'Error al crear el usuario');
      }
    } catch {
      showToast('error', 'Error de conexión con el servidor');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editPassword && editPassword.length < 6) {
      showToast('error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload: any = { role: editRole };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const res = await authFetch(`${API_BASE}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', `Usuario ${editingUser.username} actualizado correctamente`);
        setEditingUser(null);
        setEditPassword('');
        fetchUsers();
      } else {
        showToast('error', data.error || 'No se pudo actualizar el usuario');
      }
    } catch {
      showToast('error', 'Error de conexión con el servidor');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      setFormSubmitting(true);
      const res = await authFetch(`${API_BASE}/users/${deletingUser.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', `Usuario ${deletingUser.username} eliminado correctamente`);
        setDeletingUser(null);
        fetchUsers();
      } else {
        showToast('error', data.error || 'No se pudo eliminar el usuario');
      }
    } catch {
      showToast('error', 'Error de conexión con el servidor');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Si no es ADMIN (es MODERADOR): Bloquear acceso con aviso amigable
  if (!isAdmin) {
    return (
      <div className="elite-card rounded-2xl p-8 sm:p-12 border border-white/[0.08] text-center max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-mono uppercase tracking-wider mb-3">
          Permisos de Moderador
        </div>
        <h2 className="font-display text-2xl font-bold uppercase text-white">
          Gestión de Usuarios Restringida
        </h2>
        <p className="text-sm text-rayo-bone/70 mt-3 leading-relaxed">
          Tu cuenta actual (<strong className="text-white">{currentUser?.username}</strong>) tiene asignado el rol de <span className="text-cyan-400 font-semibold">MODERADOR</span>.
        </p>
        <div className="bg-[#0b0b14] border border-white/[0.06] rounded-xl p-5 text-left mt-6 space-y-2 text-xs text-rayo-bone/80">
          <p className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2">
            Alcance de tus permisos:
          </p>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Control total de Plantilla, Estadísticas y Fichas de jugadores.</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Gestión completa de Multimedia, Galería fotográfica y Vídeos.</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Edición de Marcadores, Jornadas y Noticias oficiales.</span>
          </div>
          <div className="flex items-center gap-2 text-rose-400 pt-2 border-t border-white/[0.06]">
            <span className="material-symbols-outlined text-base">cancel</span>
            <span>No puedes crear, modificar ni eliminar otros Usuarios o Roles.</span>
          </div>
        </div>
        <p className="text-xs text-rayo-bone/50 mt-5">
          Si requieres permisos de Administrador Total, contacta con el administrador principal (Dani).
        </p>
      </div>
    );
  }

  // Vista para ADMIN
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const modCount = users.filter((u) => u.role === 'MODERADOR').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold uppercase tracking-wider shadow-2xl animate-bounce ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {feedback.message}
        </div>
      )}

      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-rayo-gold mb-1">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Control Total de Accesos
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white">
            Usuarios & Roles del Sistema
          </h2>
          <p className="text-xs text-rayo-bone/60 mt-1">
            Gestiona quién tiene acceso al panel y qué acciones puede realizar dentro del club.
          </p>
        </div>

        <button
          onClick={() => {
            setNewUsername('');
            setNewPassword('');
            setNewRole('MODERADOR');
            setIsCreateModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-rayo-gold/20 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Crear Nuevo Usuario
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="elite-card rounded-xl p-5 border border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase text-rayo-bone/60">Total Usuarios</span>
          <div className="font-display text-2xl font-bold text-white mt-1">{users.length}</div>
          <span className="text-[11px] text-rayo-gold mt-1 block">Cuentas con acceso</span>
        </div>
        <div className="elite-card rounded-xl p-5 border border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase text-rayo-bone/60">Administradores</span>
          <div className="font-display text-2xl font-bold text-amber-300 mt-1">{adminCount}</div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">Control absoluto + Usuarios</span>
        </div>
        <div className="elite-card rounded-xl p-5 border border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase text-rayo-bone/60">Moderadores</span>
          <div className="font-display text-2xl font-bold text-cyan-300 mt-1">{modCount}</div>
          <span className="text-[11px] text-cyan-400/80 mt-1 block">Gestión deportiva & Media</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="elite-card rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="font-display text-base font-bold uppercase text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-rayo-gold text-lg">manage_accounts</span>
            Cuentas Registradas ({users.length})
          </h3>
          <span className="text-[11px] text-rayo-bone/50 font-mono">
            Las contraseñas se almacenan cifradas con bcrypt (rounds: 10)
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-rayo-bone/60 font-mono text-xs">
            <div className="w-8 h-8 border-2 border-rayo-gold border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Cargando usuarios autorizados...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-rayo-bone/50 text-xs">
            No hay usuarios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0A0A16] text-[10px] font-display uppercase tracking-wider text-rayo-bone/50 border-b border-white/[0.08]">
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Rol Asignado</th>
                  <th className="py-3.5 px-4">Permisos</th>
                  <th className="py-3.5 px-4">Último Acceso</th>
                  <th className="py-3.5 px-4">Fecha de Alta</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isUserAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-xs uppercase shadow ${
                              isUserAdmin
                                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black'
                                : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                            }`}
                          >
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm flex items-center gap-1.5">
                              {u.username}
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded bg-rayo-gold/20 text-rayo-gold text-[9px] font-mono uppercase">
                                  Tú
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-rayo-bone/40 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isUserAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px] uppercase">
                            <span className="material-symbols-outlined text-xs">shield_person</span>
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-[10px] uppercase">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            MODERADOR
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-rayo-bone/70">
                        {isUserAdmin ? (
                          <span className="text-amber-200/90 text-[11px] font-medium">
                            Control total + Gestión de usuarios
                          </span>
                        ) : (
                          <span className="text-cyan-200/90 text-[11px] font-medium">
                            Control deportivo (Sin gestión usuarios)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-rayo-bone/60 font-mono text-[11px]">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Nunca'}
                      </td>

                      <td className="py-3.5 px-4 text-rayo-bone/40 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditRole(u.role);
                              setEditPassword('');
                            }}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-rayo-bone/80 hover:text-white transition-colors"
                            title="Editar usuario o cambiar contraseña"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>

                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isCurrent || (isUserAdmin && adminCount <= 1)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={
                              isCurrent
                                ? 'No puedes eliminarte a ti mismo'
                                : isUserAdmin && adminCount <= 1
                                ? 'No se puede eliminar el único administrador'
                                : 'Eliminar usuario'
                            }
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CREAR USUARIO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b0b14] border border-white/[0.12] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rayo-gold text-xl">person_add</span>
                <h3 className="font-display text-lg font-bold uppercase text-white">
                  Crear Nuevo Usuario
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-rayo-bone/40 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-rayo-bone/70 mb-1.5">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ej: MarcosEntrenador"
                  required
                  className="w-full bg-[#121222] border border-white/[0.1] focus:border-rayo-gold rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-rayo-bone/70 mb-1.5">
                  Rol Asignado
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRole('ADMIN')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newRole === 'ADMIN'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-[#121222] border-white/[0.08] text-rayo-bone/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase mb-1">
                      <span className="material-symbols-outlined text-sm">shield_person</span>
                      ADMIN
                    </div>
                    <p className="text-[10px] leading-tight text-rayo-bone/60">
                      Control total de todo + crear y borrar usuarios.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('MODERADOR')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newRole === 'MODERADOR'
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                        : 'bg-[#121222] border-white/[0.08] text-rayo-bone/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase mb-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      MODERADOR
                    </div>
                    <p className="text-[10px] leading-tight text-rayo-bone/60">
                      Control de plantilla, multimedia y partidos (Sin usuarios).
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-rayo-bone/70 mb-1.5">
                  Contraseña Inicial (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#121222] border border-white/[0.1] focus:border-rayo-gold rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-white/20 focus:outline-none"
                />
                <p className="text-[10px] text-rayo-bone/40 mt-1">
                  Se encriptará con algoritmo bcrypt antes de guardarse en el servidor.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold uppercase text-rayo-bone"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {formSubmitting ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR USUARIO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b0b14] border border-white/[0.12] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rayo-gold text-xl">edit</span>
                <h3 className="font-display text-lg font-bold uppercase text-white">
                  Editar Usuario: {editingUser.username}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-rayo-bone/40 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-rayo-bone/70 mb-1.5">
                  Rol del Usuario
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRole('ADMIN')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editRole === 'ADMIN'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-[#121222] border-white/[0.08] text-rayo-bone/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase mb-1">
                      <span className="material-symbols-outlined text-sm">shield_person</span>
                      ADMIN
                    </div>
                    <p className="text-[10px] leading-tight text-rayo-bone/60">
                      Control total
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole('MODERADOR')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editRole === 'MODERADOR'
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                        : 'bg-[#121222] border-white/[0.08] text-rayo-bone/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase mb-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      MODERADOR
                    </div>
                    <p className="text-[10px] leading-tight text-rayo-bone/60">
                      Sin acceso a usuarios
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-rayo-bone/70 mb-1.5">
                  Cambiar Contraseña (opcional)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Dejar vacío para mantener la actual"
                  className="w-full bg-[#121222] border border-white/[0.1] focus:border-rayo-gold rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-white/20 focus:outline-none"
                />
                <p className="text-[10px] text-rayo-bone/40 mt-1">
                  Si escribes una nueva contraseña, se cifrará con bcrypt al guardar.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold uppercase text-rayo-bone"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {formSubmitting ? 'Guardando...' : 'Actualizar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b0b14] border border-rose-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="font-display text-lg font-bold uppercase text-white">
              ¿Eliminar Usuario?
            </h3>
            <p className="text-xs text-rayo-bone/70 mt-2">
              Esta acción revocará el acceso de <strong className="text-white">{deletingUser.username}</strong> de forma permanente.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold uppercase text-rayo-bone"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={formSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-900/30 disabled:opacity-50"
              >
                {formSubmitting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
