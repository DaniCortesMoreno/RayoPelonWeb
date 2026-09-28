import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ContactForm } from '../components/contact/ContactForm';
import { CLUB_INFO, SPONSORSHIP_TIERS, FAQ_ITEMS, SPONSORS_DATA } from '../data/mockData';

export const ContactoPage: React.FC = () => {
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({ 'faq-1': true, 'faq-3': true });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Contacto & Patrocinios | Rayo Pelón F7';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const scrollToForm = () => {
    const el = document.getElementById('formulario-contacto');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-rayo-carbon text-rayo-bone selection:bg-rayo-gold selection:text-black">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Page Header / Hero */}
        <section className="relative overflow-hidden py-12 lg:py-16 border-b border-white/[0.08] bg-gradient-to-b from-[#0E0A2F]/80 via-[#07070F] to-[#07070F]">
          {/* Subtle lightning ambient effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-rayo-gold/5 blur-[120px] pointer-events-none rounded-full"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rayo-bone/50 mb-4">
              <Link to="/" className="hover:text-rayo-gold transition-colors">Inicio</Link>
              <span>/</span>
              <span className="text-rayo-gold">Contacto & Sede</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold tracking-wider text-rayo-gold uppercase mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rayo-gold animate-pulse"></span>
                  Canal Oficial de Atención & Patrocinios
                </div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-none">
                  CONTACTO Y <span className="text-champagne-gradient">SEDE OFICIAL</span>
                </h1>
                <p className="text-sm sm:text-base text-rayo-bone/70 mt-3 max-w-2xl leading-relaxed">
                  Punto de encuentro para empresas patrocinadoras, aficionados, medios de comunicación y rivales comarcales. Responderemos en menos de 24 horas laborables.
                </p>
              </div>

              {/* Quick Trust Badges */}
              <div className="flex flex-wrap gap-2.5">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs">
                  <span className="material-symbols-outlined text-rayo-gold text-base">timer</span>
                  <span className="text-rayo-bone/80 font-medium">Respuesta &lt;24h</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs">
                  <span className="material-symbols-outlined text-rayo-gold text-base">stadium</span>
                  <span className="text-rayo-bone/80 font-medium">Campo 1 Ibi</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs">
                  <span className="material-symbols-outlined text-rayo-gold text-base">military_tech</span>
                  <span className="text-rayo-bone/80 font-medium">Liga Plata F7</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Content: Headquarters & Official Channels vs. Form */}
        <section className="py-14 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Sede, Horarios, Canales Directos (7 cols on large) */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.16em] mb-1.5">
                    <span className="material-symbols-outlined text-sm">location_city</span>
                    LOCALIZACIÓN Y HORARIOS
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
                    Sede Deportiva e Instalaciones
                  </h2>
                  <p className="text-xs sm:text-sm text-rayo-bone/70 mt-1 leading-relaxed">
                    El Rayo Pelón F7 disputa todos sus compromisos ligueros como local en las instalaciones municipales de Ibi.
                  </p>
                </div>

                {/* Sede Card with Stylized Map Preview */}
                <div className="elite-card rounded-2xl p-6 border border-white/[0.1] relative overflow-hidden group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-rayo-gold/10 border border-rayo-gold/30 flex items-center justify-center text-rayo-gold flex-shrink-0">
                      <span className="material-symbols-outlined text-2xl">stadium</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold uppercase text-white text-base">
                          {CLUB_INFO.stadium}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Activo
                        </span>
                      </div>
                      <p className="text-xs text-rayo-bone/70 mt-1">
                        {CLUB_INFO.address}
                      </p>
                    </div>
                  </div>

                  {/* Dark Mode Map Graphic */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0A0D18] flex items-center justify-center group-hover:border-rayo-gold/30 transition-colors">
                    {/* Stylized grid pattern representing pitch/streets */}
                    <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    
                    {/* Simulated football pitch outline in map */}
                    <div className="absolute w-40 h-24 border border-rayo-gold/40 rounded-sm flex items-center justify-center">
                      <div className="w-px h-full bg-rayo-gold/30"></div>
                      <div className="absolute w-10 h-10 border border-rayo-gold/30 rounded-full"></div>
                    </div>

                    {/* Glowing Pin Marker */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        <span className="w-8 h-8 rounded-full bg-rayo-gold/20 animate-ping absolute"></span>
                        <div className="w-10 h-10 rounded-full bg-rayo-gold flex items-center justify-center text-rayo-carbon shadow-lg shadow-rayo-gold/50">
                          <span className="material-symbols-outlined text-xl">sports_soccer</span>
                        </div>
                      </div>
                      <div className="mt-2 px-3 py-1 rounded-md bg-[#07070F]/90 border border-white/20 text-[11px] font-bold text-white tracking-wider uppercase backdrop-blur-md">
                        Campo 1 • Polideportivo Ibi
                      </div>
                    </div>

                    {/* Google Maps link button overlay */}
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Polideportivo+Municipal+de+Ibi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <span>Abrir en Google Maps</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </div>
                </div>

                {/* Grid of Direct Contact & Schedules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Box */}
                  <div className="elite-card rounded-xl p-5 border border-white/[0.08] hover:border-rayo-gold/30 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rayo-gold mb-3">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </div>
                    <h4 className="font-display font-semibold uppercase text-white text-xs tracking-wider">
                      Email Oficial & Prensa
                    </h4>
                    <p className="text-xs text-rayo-bone/80 font-mono mt-1 break-all">
                      {CLUB_INFO.email}
                    </p>
                    <p className="text-[11px] text-rayo-bone/50 font-mono mt-0.5 break-all">
                      {CLUB_INFO.emailAlt}
                    </p>
                    <button
                      onClick={() => copyToClipboard(CLUB_INFO.email, 'email')}
                      className="mt-3 text-[11px] font-semibold text-rayo-gold hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">content_copy</span>
                      {copiedField === 'email' ? '¡Copiado!' : 'Copiar email'}
                    </button>
                  </div>

                  {/* WhatsApp / Teléfono Box */}
                  <div className="elite-card rounded-xl p-5 border border-white/[0.08] hover:border-rayo-gold/30 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                      <span className="material-symbols-outlined text-lg">chat</span>
                    </div>
                    <h4 className="font-display font-semibold uppercase text-white text-xs tracking-wider">
                      WhatsApp Directiva
                    </h4>
                    <p className="text-xs text-rayo-bone/80 font-mono mt-1">
                      +34 622 841 902
                    </p>
                    <p className="text-[11px] text-rayo-bone/50 mt-0.5">
                      Atención para partidos y dudas rápidas
                    </p>
                    <a
                      href="https://wa.me/34622841902"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">send</span>
                      Abrir conversación
                    </a>
                  </div>

                  {/* Horarios Box */}
                  <div className="elite-card rounded-xl p-5 border border-white/[0.08] hover:border-rayo-gold/30 transition-all sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rayo-gold flex-shrink-0">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                      </div>
                      <div>
                        <h4 className="font-display font-semibold uppercase text-white text-xs tracking-wider">
                          Días de Juego y Sesiones
                        </h4>
                        <p className="text-xs text-rayo-bone/70 mt-0.5">
                          Partidos: <span className="text-white font-medium">Lunes noche (20:30h - 22:30h)</span> • Sesión táctica: <span className="text-white font-medium">Miércoles 21:00h</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Official Social Channels */}
                <div className="pt-2">
                  <p className="text-xs uppercase font-semibold text-rayo-bone/60 tracking-wider mb-3">
                    Canales Sociales y Comunidad
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-rayo-gold/40 hover:bg-white/[0.06] transition-all group"
                    >
                      <span className="w-7 h-7 rounded-md bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white text-[11px] font-bold">
                        IG
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-rayo-gold transition-colors">
                          Instagram
                        </div>
                        <div className="text-[10px] text-rayo-bone/50">@rayopelonf7</div>
                      </div>
                    </a>

                    <a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-rayo-gold/40 hover:bg-white/[0.06] transition-all group"
                    >
                      <span className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center text-[11px] font-bold">
                        TK
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-rayo-gold transition-colors">
                          TikTok
                        </div>
                        <div className="text-[10px] text-rayo-bone/50">@rayopelon</div>
                      </div>
                    </a>

                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-rayo-gold/40 hover:bg-white/[0.06] transition-all group"
                    >
                      <span className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white text-[11px] font-bold">
                        YT
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-rayo-gold transition-colors">
                          YouTube
                        </div>
                        <div className="text-[10px] text-rayo-bone/50">Resúmenes</div>
                      </div>
                    </a>

                    <a
                      href="https://whatsapp.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-rayo-gold/40 hover:bg-white/[0.06] transition-all group"
                    >
                      <span className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center text-white text-[11px] font-bold">
                        WA
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-rayo-gold transition-colors">
                          Comunidad
                        </div>
                        <div className="text-[10px] text-rayo-bone/50">Avisos Liga</div>
                      </div>
                    </a>
                  </div>
                </div>

              </div>

              {/* Right Column: Exact Form from Home Page (6 cols on large) */}
              <div className="lg:col-span-6" id="formulario-contacto">
                <ContactForm
                  className="sticky top-28"
                  onSuccessMessage="✓ ¡Mensaje oficial recibido! El responsable deportivo o de patrocinios del Rayo Pelón te responderá en menos de 24h."
                />
              </div>

            </div>
          </div>
        </section>

        {/* Sponsorship Tiers Section */}
        <section id="patrocinadores" className="py-16 bg-[#0B0C1A] border-y border-white/[0.08] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.2em] mb-2">
                <span className="material-symbols-outlined text-sm">handshake</span>
                DOSSIER DE PATROCINIOS 2026/27
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-white tracking-wide">
                Impulsa Tu Marca con el <span className="text-champagne-gradient">Rayo Pelón</span>
              </h2>
              <p className="text-xs sm:text-sm text-rayo-bone/70 mt-2 leading-relaxed">
                Asocia la imagen de tu empresa a la pasión, esfuerzo y deportividad en Ibi. Ofrecemos paquetes a medida con visibilidad física en campo, equipaciones y soporte digital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {SPONSORSHIP_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                    tier.highlighted
                      ? 'bg-gradient-to-b from-[#14122C] to-[#0A0918] border-2 border-rayo-gold shadow-2xl shadow-rayo-gold/10 -translate-y-1'
                      : 'elite-card border border-white/[0.1] hover:border-white/20'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-rayo-gold text-rayo-carbon font-display text-[11px] font-extrabold uppercase tracking-widest shadow-md">
                      MÁS DESTACADO
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-white/[0.06] text-rayo-gold border border-white/[0.08]">
                        {tier.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold uppercase text-white tracking-wide">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-rayo-gold font-medium mt-1">
                      {tier.tagline}
                    </p>
                    <p className="text-xs text-rayo-bone/70 mt-3 leading-relaxed">
                      {tier.description}
                    </p>

                    <div className="mt-6 pt-5 border-t border-white/[0.08]">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-rayo-bone/50 mb-3">
                        Qué incluye este paquete:
                      </p>
                      <ul className="space-y-2.5">
                        {tier.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-rayo-bone/80">
                            <span className="material-symbols-outlined text-rayo-gold text-sm flex-shrink-0 mt-0.5">
                              check_circle
                            </span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/[0.08]">
                    <button
                      onClick={scrollToForm}
                      className={`w-full py-3 rounded-lg font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        tier.highlighted
                          ? 'bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon shadow-lg shadow-rayo-gold/20'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] text-white'
                      }`}
                    >
                      <span>Solicitar Este Pack</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Current Sponsors Showcase */}
            <div className="mt-14 pt-10 border-t border-white/[0.08]">
              <div className="text-center mb-6">
                <span className="text-xs uppercase font-semibold text-rayo-bone/60 tracking-wider">
                  Empresas colaboradoras que ya respaldan al club:
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {SPONSORS_DATA.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-rayo-gold/30 flex flex-col items-center justify-center text-center transition-all group"
                  >
                    <span className="material-symbols-outlined text-2xl text-rayo-gold/70 group-hover:text-rayo-gold transition-colors mb-1.5">
                      {sponsor.icon}
                    </span>
                    <span className="text-[11px] font-bold text-white tracking-wide uppercase leading-tight">
                      {sponsor.name}
                    </span>
                    <span className="text-[9px] text-rayo-bone/40 uppercase mt-0.5">
                      {sponsor.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Accordion Section */}
        <section className="py-16 bg-[#07070F]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-rayo-gold text-xs font-semibold uppercase tracking-[0.16em] mb-2">
                <span className="material-symbols-outlined text-sm">quiz</span>
                RESOLUCIÓN DE DUDAS
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-white tracking-wide">
                Preguntas Frecuentes
              </h2>
              <p className="text-xs sm:text-sm text-rayo-bone/70 mt-2">
                Todo lo que necesitas saber para asistir a los partidos, probarte en el equipo o colaborar comercialmente.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((faq) => {
                const isOpen = !!openFaqs[faq.id];
                return (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-white/[0.08] bg-[#0B0C1A] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 pr-4">
                        {faq.category && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.05] text-rayo-gold border border-white/[0.08]">
                            {faq.category}
                          </span>
                        )}
                        <span className="font-display font-semibold text-sm sm:text-base text-white tracking-wide">
                          {faq.question}
                        </span>
                      </div>
                      <span className={`material-symbols-outlined text-rayo-gold text-xl transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-white/[0.04] text-xs sm:text-sm text-rayo-bone/75 leading-relaxed animate-fadeIn">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Still have questions? */}
            <div className="mt-10 p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h4 className="font-display font-bold uppercase text-white text-sm">
                  ¿Tienes alguna duda específica no resuelta aquí?
                </h4>
                <p className="text-xs text-rayo-bone/60 mt-0.5">
                  Escríbenos directamente o utiliza el formulario oficial.
                </p>
              </div>
              <button
                onClick={scrollToForm}
                className="px-5 py-2.5 rounded-lg bg-rayo-gold hover:bg-rayo-goldLight text-rayo-carbon font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span>
                Ir al Formulario
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
