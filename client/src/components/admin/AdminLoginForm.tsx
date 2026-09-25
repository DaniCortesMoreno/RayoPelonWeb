import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CLUB_INFO } from '../../data/mockData';

export const AdminLoginForm: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Por favor introduce tu usuario y contraseña');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await login(username.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciales inválidas');
      }
    } catch {
      setErrorMessage('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060c] text-rayo-bone flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rayo-gold/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-rayo-burgundy/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Top Club Identity */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0e0e1a] border border-rayo-gold/30 p-2 shadow-2xl shadow-rayo-gold/10 flex items-center justify-center">
              <img
                src={CLUB_INFO.badgeUrl}
                alt="Escudo Rayo Pelón"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-rayo-gold text-rayo-carbon text-[9px] font-mono font-black uppercase tracking-wider shadow">
              Oficial
            </span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider">
            Panel de Control
          </h1>
          <p className="text-xs text-rayo-bone/60 mt-1 uppercase tracking-widest font-mono">
            Rayo Pelón F7 • Acceso Directivo
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0b0b14]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rayo-gold to-transparent"></div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rayo-gold/10 border border-rayo-gold/30 text-rayo-gold text-[10px] font-mono uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-xs">lock</span>
              Área Restringida
            </div>
            <h2 className="font-display text-lg font-bold text-white uppercase">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-rayo-bone/60 mt-0.5">
              Introduce tus credenciales autorizadas de Administrador o Moderador.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs animate-fadeIn">
              <span className="material-symbols-outlined text-lg flex-shrink-0 text-rose-400">error</span>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-rayo-bone/80 mb-2">
                Usuario
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-rayo-bone/40 text-lg">
                  account_circle
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: Dani"
                  required
                  autoFocus
                  className="w-full bg-[#121222] border border-white/[0.1] focus:border-rayo-gold rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-rayo-bone/80 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-rayo-bone/40 text-lg">
                  key
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#121222] border border-white/[0.1] focus:border-rayo-gold rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rayo-bone/40 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-rayo-gold/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-rayo-carbon border-t-transparent rounded-full animate-spin"></span>
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Entrar al Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy & Policy Notice - Sin opción de registro manual */}
          <div className="mt-7 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-[11px] text-rayo-bone/40 leading-relaxed">
              Sistema de gestión privada. El registro manual está deshabilitado. Las altas de usuarios son gestionadas exclusivamente por la Administración.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rayo-bone/60 hover:text-rayo-gold transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Volver a la Web Principal
          </a>
        </div>
      </div>
    </div>
  );
};
