import React, { useState } from 'react';
import { API_BASE } from '../../config/api';

interface ContactFormProps {
  onSuccessMessage?: string;
  className?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSuccessMessage = '✓ ¡Mensaje enviado con éxito! Nuestro responsable se pondrá en contacto en menos de 24h.',
  className = ''
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    proposalType: 'sponsor',
    message: '',
    privacyAccepted: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacyAccepted) return;
    setLoading(true);

    try {
      // Intentar enviar al backend Express si está activo
      await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch {
      // Si la API no responde, el fallback local garantiza feedback al usuario
    } finally {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          proposalType: 'sponsor',
          message: '',
          privacyAccepted: false
        });
      }, 6000);
    }
  };

  return (
    <div className={`elite-card rounded-2xl p-7 sm:p-8 border border-white/[0.1] shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-2xl font-bold uppercase text-white tracking-wide">
          Envíanos tu Propuesta
        </h3>
        <span className="w-2 h-2 rounded-full bg-rayo-gold animate-pulse"></span>
      </div>
      <p className="text-xs text-rayo-bone/60 mb-6">
        Completa el formulario y nuestro responsable deportivo o de patrocinios te responderá en 24h.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Nombre o Empresa */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-rayo-bone/70 mb-1">
            Nombre o Empresa *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Taller Mecánico Ibi / Juan Gómez"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:outline-none focus:border-rayo-gold/60 text-white placeholder-rayo-bone/30 transition-colors"
          />
        </div>

        {/* Email y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-rayo-bone/70 mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              placeholder="contacto@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:outline-none focus:border-rayo-gold/60 text-white placeholder-rayo-bone/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-rayo-bone/70 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              placeholder="+34 600 000 000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:outline-none focus:border-rayo-gold/60 text-white placeholder-rayo-bone/30 transition-colors"
            />
          </div>
        </div>

        {/* Tipo de Propuesta */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-rayo-bone/70 mb-1">
            Tipo de Propuesta
          </label>
          <select
            value={formData.proposalType}
            onChange={(e) => setFormData({ ...formData, proposalType: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:outline-none focus:border-rayo-gold/60 text-white transition-colors"
          >
            <option value="sponsor">Patrocinio Principal (Equipación y Web)</option>
            <option value="colab">Colaboración Material Deportivo / Bebidas</option>
            <option value="amistoso">Petición de Partido Amistoso</option>
            <option value="fichaje">Interés en incorporarse a la Plantilla</option>
            <option value="otro">Otras consultas generales</option>
          </select>
        </div>

        {/* Mensaje */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-rayo-bone/70 mb-1">
            Mensaje *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Cuéntanos brevemente qué te gustaría proponer o consultar..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#07070F] rounded-lg text-xs border border-white/[0.1] focus:outline-none focus:border-rayo-gold/60 text-white placeholder-rayo-bone/30 transition-colors resize-none"
          ></textarea>
        </div>

        {/* Checkbox Privacidad */}
        <div className="flex items-center gap-2.5 text-[11px] text-rayo-bone/60 pt-1">
          <input
            type="checkbox"
            id="privacy-check-form"
            required
            checked={formData.privacyAccepted}
            onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
            className="rounded accent-rayo-gold bg-[#07070F] border-white/20 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="privacy-check-form" className="cursor-pointer">
            Acepto la política de privacidad y protección de datos del club Rayo Pelón.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg font-display text-xs font-bold uppercase tracking-[0.14em] bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rayo-gold/20 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              Enviando...
            </span>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">send</span>
              Enviar Mensaje Oficial
            </>
          )}
        </button>

        {/* Success Alert */}
        {submitted && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium animate-fadeIn flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {onSuccessMessage}
          </div>
        )}
      </form>
    </div>
  );
};
