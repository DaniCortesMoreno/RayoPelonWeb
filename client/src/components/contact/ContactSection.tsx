import React from 'react';
import { CLUB_INFO } from '../../data/mockData';
import { ContactForm } from './ContactForm';

export const ContactSection: React.FC = () => {
  return (
    <section className="py-20 bg-rayo-navy relative border-t border-white/[0.06]" id="contacto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Information & Values */}
          <div>
            <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.18em] mb-1.5">
              <span className="material-symbols-outlined text-sm">handshake</span>
              ÚNETE AL PROYECTO
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-white tracking-tight">
              PATROCINIOS Y <span className="text-champagne-gradient">COLABORACIONES</span>
            </h2>
            <p className="text-sm text-rayo-bone/70 mt-3 leading-relaxed">
              ¿Tu empresa quiere vincularse a los valores de esfuerzo, compañerismo y visibilidad en el fútbol comarcal? Buscamos marcas colaboradoras para la presente temporada y la fase de copa.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-rayo-gold flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">stadium</span>
                </div>
                <div>
                  <h4 className="font-display font-semibold uppercase text-white text-sm">
                    Sede y Campo Habitual
                  </h4>
                  <p className="text-xs text-rayo-bone/60 mt-0.5">
                    {CLUB_INFO.stadium}<br />
                    {CLUB_INFO.address}
                  </p>
                  <a
                    href={CLUB_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rayo-gold hover:underline inline-flex items-center gap-1 font-mono text-[11px] mt-1.5 font-bold"
                  >
                    <span>Ver en Google Maps</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-rayo-gold flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <div>
                  <h4 className="font-display font-semibold uppercase text-white text-sm">
                    Emails Oficiales
                  </h4>
                  <div className="text-xs text-rayo-bone/80 mt-0.5 space-y-0.5 font-mono">
                    <a href="mailto:danicortesmoreno@gmail.com" className="block hover:text-rayo-gold transition-colors">
                      danicortesmoreno@gmail.com
                    </a>
                    <a href="mailto:mycmagency10@gmail.com" className="block hover:text-rayo-gold transition-colors">
                      mycmagency10@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">chat</span>
                </div>
                <div>
                  <h4 className="font-display font-semibold uppercase text-white text-sm">
                    WhatsApp Directiva
                  </h4>
                  <p className="text-xs text-rayo-bone/70 mt-0.5">
                    <a
                      href={CLUB_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs"
                    >
                      <span>{CLUB_INFO.whatsapp}</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-rayo-gold flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                </div>
                <div>
                  <h4 className="font-display font-semibold uppercase text-white text-sm">
                    Días de Juego y Entrenamientos
                  </h4>
                  <p className="text-xs text-rayo-bone/70 mt-0.5 leading-relaxed">
                    Partidos: <span className="text-white font-medium">Viernes (21h o 22h) y Domingos (9h o 10h)</span><br />
                    Entrenamientos: <span className="text-white font-medium">Miércoles a las 22h</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center gap-3">
              <span className="text-xs uppercase font-medium text-rayo-bone/60 tracking-wider">
                Síguenos:
              </span>
              <a
                href="#"
                className="w-8 h-8 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rayo-bone hover:text-rayo-gold transition-colors"
              >
                <span className="font-display font-bold text-[10px]">IG</span>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rayo-bone hover:text-rayo-gold transition-colors"
              >
                <span className="font-display font-bold text-[10px]">TK</span>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rayo-bone hover:text-rayo-gold transition-colors"
              >
                <span className="font-display font-bold text-[10px]">YT</span>
              </a>
            </div>
          </div>

          {/* Right: Contact Form (Identical on both Home and Contact pages) */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};
