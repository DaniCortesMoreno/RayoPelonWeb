import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORAGE_FILE = path.join(DATA_DIR, 'club_storage.json');
const STORAGE_BAK_FILE = path.join(DATA_DIR, 'club_storage.bak.json');
const LEGACY_DB_FILE = path.join(DATA_DIR, 'db.json');

export type UserRole = 'ADMIN' | 'MODERADOR';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'SYNC';
export type AuditModule = 'NOTICIAS' | 'PARTIDOS' | 'PLANTILLA' | 'MULTIMEDIA' | 'USUARIOS' | 'CLASIFICACION' | 'SISTEMA';

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  userRole: UserRole;
  action: AuditAction;
  module: AuditModule;
  description: string;
  details?: any;
}

export function createAuditLog(
  db: ClubDatabase,
  entry: {
    username: string;
    userRole: UserRole;
    action: AuditAction;
    module: AuditModule;
    description: string;
    details?: any;
  }
): AuditLog {
  if (!db.auditLogs || !Array.isArray(db.auditLogs)) {
    db.auditLogs = [];
  }
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    username: entry.username || 'Sistema',
    userRole: entry.userRole || 'MODERADOR',
    action: entry.action,
    module: entry.module,
    description: entry.description,
    details: entry.details
  };

  db.auditLogs.unshift(newLog);

  // Mantener los 500 registros más recientes
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }

  return newLog;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

export function getInitialUsers(): User[] {
  return [
    {
      id: 'u_dani',
      username: 'Dani',
      passwordHash: '$2b$10$dqhEA4428k2xofhROAzBau3dbfrmS28Szg0QJnxK4YzxbAs76zQE2',
      role: 'ADMIN',
      createdAt: '2026-09-24T19:30:00.000Z',
      lastLogin: '2026-09-28T17:03:10.412Z'
    },
    {
      id: 'u_1790357031756',
      username: 'Pabloma',
      passwordHash: '$2b$10$j/mpy2oFWdSLkYt0F1Ywr.e8wUgg1ZoLYlTDNE3qny1I8TDkIKVUu',
      role: 'MODERADOR',
      createdAt: '2026-09-25T17:23:51.833Z',
      lastLogin: '2026-09-25T21:22:29.248Z'
    },
    {
      id: 'u_1790357137147',
      username: 'Adria',
      passwordHash: '$2b$10$CmEeywX/iL80mWI1q0XtdeveKHG6QlM8JubJnnLPbRa3Akjw5T2c6',
      role: 'MODERADOR',
      createdAt: '2026-09-25T17:25:37.224Z'
    },
    {
      id: 'u_1790357433426',
      username: 'Gabo',
      passwordHash: '$2b$10$RDk4nfabFPDYH8ARMPdWiecxNX48v1ptXsaEZEKzLDjBHp2QF.EFu',
      role: 'MODERADOR',
      createdAt: '2026-09-25T17:30:33.508Z'
    }
  ];
}

export interface SeasonMatch {
  id: string;
  jornada: number;
  local: string;
  visitante: string;
  dia_semana: string;
  fecha: string;
  fecha_iso: string;
  hora: string;
  campo: string;
  jugado: boolean;
  golesLocal?: number | null;
  golesVisitante?: number | null;
  notas?: string;
}

export function computeCountdown(fechaIso: string, hora: string): string {
  if (!fechaIso) return 'Pronto';
  const target = new Date(`${fechaIso}T${hora || '00:00'}:00`);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    if (diffMs > -3 * 3600 * 1000) return '¡Hoy!';
    return '0d 00h';
  }
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${String(hours).padStart(2, '0')}h`;
}

export function computeMatchCenter(matches: SeasonMatch[]) {
  const sorted = [...matches].sort((a, b) => a.jornada - b.jornada);
  const played = sorted.filter(m => m.jugado);
  const pending = sorted.filter(m => !m.jugado);

  let lastMatch;
  if (played.length === 0) {
    lastMatch = {
      matchday: 0,
      homeTeam: 'RAYO PELÓN',
      awayTeam: '',
      score: 'PRETEMPORADA',
      notes: '',
      statusText: 'ÚLTIMA JORNADA (J0)'
    };
  } else {
    const last = played[played.length - 1];
    lastMatch = {
      matchday: last.jornada,
      homeTeam: last.local.toUpperCase(),
      awayTeam: last.visitante.toUpperCase(),
      score: `${last.golesLocal ?? 0} - ${last.golesVisitante ?? 0}`,
      notes: last.notas || '',
      statusText: `ÚLTIMA JORNADA (J${last.jornada})`
    };
  }

  let nextMatch;
  if (pending.length > 0) {
    const next = pending[0];
    const diaFormatted = next.dia_semana ? next.dia_semana.charAt(0).toUpperCase() + next.dia_semana.slice(1) : '';
    nextMatch = {
      matchday: next.jornada,
      homeTeam: next.local.toUpperCase(),
      awayTeam: next.visitante.toUpperCase(),
      location: next.campo,
      dayTime: `${diaFormatted} ${next.hora}h`,
      statusText: `PRÓXIMO COMPROMISO (J${next.jornada})`,
      countdown: computeCountdown(next.fecha_iso, next.hora),
      fechaIso: next.fecha_iso,
      hora: next.hora,
      campo: next.campo,
      diaSemana: next.dia_semana,
      fecha: next.fecha
    };
  } else {
    nextMatch = {
      matchday: 22,
      homeTeam: 'RAYO PELÓN',
      awayTeam: '',
      location: 'Polideportivo Municipal de Ibi',
      dayTime: 'Fin de temporada',
      statusText: 'TEMPORADA FINALIZADA',
      countdown: '0d 00h',
      fechaIso: '',
      hora: '',
      campo: '',
      diaSemana: '',
      fecha: ''
    };
  }

  return { lastMatch, nextMatch };
}

export const INITIAL_MATCHES: SeasonMatch[] = [
  { id: 'm1', jornada: 1, local: 'Rayo Pelón FC', visitante: 'Deceroacien FC', dia_semana: 'domingo', fecha: '4 oct', fecha_iso: '2026-10-04', hora: '10:00', campo: 'Climent B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm2', jornada: 2, local: 'JM.S FC', visitante: 'Rayo Pelón FC', dia_semana: 'domingo', fecha: '18 oct', fecha_iso: '2026-10-18', hora: '10:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm3', jornada: 3, local: 'Rayo Pelón FC', visitante: 'Aston Birra FC', dia_semana: 'domingo', fecha: '25 oct', fecha_iso: '2026-10-25', hora: '09:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm4', jornada: 4, local: 'Glorios', visitante: 'Rayo Pelón FC', dia_semana: 'domingo', fecha: '8 nov', fecha_iso: '2026-11-08', hora: '10:00', campo: 'Climent B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm5', jornada: 5, local: 'Rayo Pelón FC', visitante: 'Bankales FC', dia_semana: 'domingo', fecha: '15 nov', fecha_iso: '2026-11-15', hora: '09:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm6', jornada: 6, local: 'Ultimate', visitante: 'Rayo Pelón FC', dia_semana: 'domingo', fecha: '22 nov', fecha_iso: '2026-11-22', hora: '10:00', campo: 'Climent A', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm7', jornada: 7, local: 'Rayo Pelón FC', visitante: 'Royal Academy', dia_semana: 'viernes', fecha: '27 nov', fecha_iso: '2026-11-27', hora: '22:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm8', jornada: 8, local: 'Sera FC', visitante: 'Rayo Pelón FC', dia_semana: 'domingo', fecha: '13 dic', fecha_iso: '2026-12-13', hora: '09:00', campo: 'Fco Vilaplana Mariel A', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm9', jornada: 9, local: 'Nottingham Por', visitante: 'Rayo Pelón FC', dia_semana: 'domingo', fecha: '10 ene', fecha_iso: '2027-01-10', hora: '09:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm10', jornada: 10, local: 'Rayo Pelón FC', visitante: '131 Town FC', dia_semana: 'domingo', fecha: '17 ene', fecha_iso: '2027-01-17', hora: '10:00', campo: 'Climent B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm11', jornada: 11, local: 'Viejentus', visitante: 'Rayo Pelón FC', dia_semana: 'domingo', fecha: '24 ene', fecha_iso: '2027-01-24', hora: '09:00', campo: 'Fco Vilaplana Mariel A', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm12', jornada: 12, local: 'Deceroacien FC', visitante: 'Rayo Pelón FC', dia_semana: 'domingo', fecha: '31 ene', fecha_iso: '2027-01-31', hora: '09:00', campo: 'Climent B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm13', jornada: 13, local: 'Rayo Pelón FC', visitante: 'JM.S FC', dia_semana: 'domingo', fecha: '7 feb', fecha_iso: '2027-02-07', hora: '10:00', campo: 'Climent A', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm14', jornada: 14, local: 'Aston Birra FC', visitante: 'Rayo Pelón FC', dia_semana: 'domingo', fecha: '21 feb', fecha_iso: '2027-02-21', hora: '10:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm15', jornada: 15, local: 'Rayo Pelón FC', visitante: 'Glorios', dia_semana: 'domingo', fecha: '28 feb', fecha_iso: '2027-02-28', hora: '10:00', campo: 'Climent A', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm16', jornada: 16, local: 'Bankales FC', visitante: 'Rayo Pelón FC', dia_semana: 'viernes', fecha: '5 mar', fecha_iso: '2027-03-05', hora: '21:00', campo: 'Fco Vilaplana Mariel A', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm17', jornada: 17, local: 'Rayo Pelón FC', visitante: 'Ultimate', dia_semana: 'domingo', fecha: '14 mar', fecha_iso: '2027-03-14', hora: '09:00', campo: 'Climent A', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm18', jornada: 18, local: 'Royal Academy', visitante: 'Rayo Pelón FC', dia_semana: 'viernes', fecha: '2 abr', fecha_iso: '2027-04-02', hora: '22:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm19', jornada: 19, local: 'Rayo Pelón FC', visitante: 'Sera FC', dia_semana: 'domingo', fecha: '11 abr', fecha_iso: '2027-04-11', hora: '09:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm20', jornada: 20, local: 'Rayo Pelón FC', visitante: 'Nottingham Por', dia_semana: 'domingo', fecha: '18 abr', fecha_iso: '2027-04-18', hora: '09:00', campo: 'Fco Vilaplana Mariel A', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm21', jornada: 21, local: '131 Town FC', visitante: 'Rayo Pelón FC', dia_semana: 'viernes', fecha: '30 abr', fecha_iso: '2027-04-30', hora: '21:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' },
  { id: 'm22', jornada: 22, local: 'Rayo Pelón FC', visitante: 'Viejentus', dia_semana: 'domingo', fecha: '16 may', fecha_iso: '2027-05-16', hora: '09:00', campo: 'Fco Vilaplana Mariel B', jugado: false, golesLocal: null, golesVisitante: null, notas: '' }
];

export type NewsCategory = 'MEDICO' | 'CRONICA' | 'OFICIAL' | 'NOVEDAD';

export interface MedicalDetails {
  player: string;
  dorsal?: number;
  injury: string;
  recoveryTime: string;
  currentStatus: 'Evolución favorable' | 'Baja confirmada' | 'Alta médica' | 'Duda hasta última hora' | string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  categoryLabel: string;
  dateText: string;
  publishedAt: string;
  readTime: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole?: string;
  imageUrl?: string;
  featured?: boolean;
  medicalDetails?: MedicalDetails;
}

export interface ClubDatabase {
  clubInfo: any;
  matchCenter: any;
  players: any[];
  standings: any[];
  news: NewsArticle[];
  sponsors: any[];
  contactMessages: any[];
  featuredMatch?: any;
  gallery?: any[];
  clips?: any[];
  users: User[];
  matches?: SeasonMatch[];
  auditLogs?: AuditLog[];
}

export const DEFAULT_FEATURED_MATCH = {
  id: 'last-match-recap',
  matchday: 13,
  competition: 'Liga Plata de Ibi F7 • Temporada 26/27',
  date: 'Lunes 18 de Noviembre • 21:00h',
  location: 'Campo 1 • Polideportivo Municipal de Ibi',
  homeTeam: {
    name: 'RAYO PELÓN F7',
    badge: '/escudo.png',
    score: 4
  },
  awayTeam: {
    name: 'IBENSE CF VETERANOS',
    badge: '',
    score: 2
  },
  mediaType: 'video',
  videoSourceType: 'url',
  videoUrl: '',
  videoTitle: 'Resumen Oficial: Remontada y Goleada del Rayo (4 - 2)',
  videoDuration: '06:45',
  videoThumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=675&q=80',
  carouselImages: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&h=675&q=80',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&h=675&q=80'
  ],
  views: '1.8K visualizaciones',
  mvp: 'Dani Pérez (3 Goles)',
  timeline: [
    { minute: "12'", player: 'Dani Pérez', type: 'GOL', team: 'rayo', text: 'Zurdazo cruzado tras asistencia al espacio de El Chino (1-0)' },
    { minute: "25'", player: 'Carlos "El Chino"', type: 'GOLAZO', team: 'rayo', text: 'Falta directa teledirigida a la mismísima escuadra derecha (2-0)' },
    { minute: "31'", player: 'Ibense CF', type: 'GOL', team: 'rival', text: 'Aprovechan un rechace en el área pequeña (2-1)' },
    { minute: "38'", player: 'Dani Pérez', type: 'GOL', team: 'rayo', text: 'Remate de cabeza impecable a centro de Javi Verdú (3-1)' },
    { minute: "44'", player: 'Marc Alonso', type: 'PARADÓN', team: 'rayo', text: 'Mano a mano salvador estirando el pie derecho' },
    { minute: "49'", player: 'Dani Pérez', type: 'HAT-TRICK', team: 'rayo', text: 'Recorte seco ante el central y definición con clase (4-1)' },
    { minute: "52'", player: 'Ibense CF', type: 'GOL', team: 'rival', text: 'Disparo lejano ajustado al poste (4-2)' }
  ],
  stats: {
    shots: { home: 16, away: 8 },
    shotsOnTarget: { home: 11, away: 5 },
    possession: { home: '58%', away: '42%' },
    corners: { home: 7, away: 3 },
    fouls: { home: 5, away: 9 }
  }
};

export const DEFAULT_GALLERY = [
  { id: 'fg1', type: 'foto', title: 'Euforia en la grada tras el gol de la victoria', tag: 'J13 vs Ibense', category: 'celebraciones', date: '18 Nov 2024', imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', description: 'La afición del Rayo Pelón se volcó bajo los focos de Ibi en el tramo final del encuentro.' },
  { id: 'fg2', type: 'foto', title: 'Disputa aérea en el corazón del área', tag: 'J13 vs Ibense', category: 'partidos', date: '18 Nov 2024', imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80', description: 'Samu "Káiser" imponiendo su ley aérea ante el delantero rival.' },
  { id: 'fg3', type: 'foto', title: 'Piña de equipo antes del pitido inicial', tag: 'Espíritu de Club', category: 'vestuario', date: '18 Nov 2024', imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80', description: 'Concentración absoluta y conjura de la plantilla para asegurar los tres puntos.' },
  { id: 'fg4', type: 'foto', title: 'Carlos "El Chino" ejecutando la falta magistral', tag: 'Momento Clave', category: 'partidos', date: '18 Nov 2024', imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80', description: 'Instante exacto del impacto del balón que acabó alojándose en la escuadra.' },
  { id: 'fg5', type: 'foto', title: 'Celebración del hat-trick con dedicatoria especial', tag: 'Dani Pérez #9', category: 'celebraciones', date: '18 Nov 2024', imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80', description: 'Dani señalando el escudo ante los seguidores congregados en el campo 1.' },
  { id: 'fg6', type: 'foto', title: 'Calentamiento de intensidad previa al partido', tag: 'Sesión Nocturna', category: 'entrenos', date: '15 Nov 2024', imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80', description: 'Activación muscular y rondos a alta velocidad en el Polideportivo de Ibi.' },
  { id: 'fg7', type: 'foto', title: 'Marc "El Gato" volando hacia la cruceta', tag: 'Zamora en Acción', category: 'partidos', date: '11 Nov 2024', imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80', description: 'Estirada fotogénica de nuestro portero titular salvando un disparo a bocajarro.' },
  { id: 'fg8', type: 'foto', title: 'Alegría en el vestuario tras la victoria', tag: 'Tercer Tiempo', category: 'vestuario', date: '18 Nov 2024', imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80', description: 'Cánticos y piña de todo el equipo celebrando el 2º puesto en solitario.' }
];

export const DEFAULT_CLIPS = [
  { id: 'c1', type: 'video', title: 'Falta directa a la escuadra de "El Chino"', tag: 'GOLAZO DEL MES', description: 'Golazo elegido por la organización de la Liga Plata como el mejor gol de la Jornada 13.', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', sourceType: 'youtube', duration: '00:45', match: 'J13 vs Ibense CF', views: '2.4K views' },
  { id: 'c2', type: 'video', title: 'Doble parada salvadora de Marc "El Gato"', tag: 'PARADÓN DE LA JORNADA', description: 'Mano a mano a quemarropa y reacción instantánea para despejar sobre la misma línea de gol.', imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80', videoUrl: '', sourceType: 'url', duration: '00:38', match: 'J13 vs Ibense CF', views: '1.9K views' },
  { id: 'c3', type: 'video', title: 'El Hat-trick de Dani Pérez con sus 3 definiciones', tag: 'RECITADO GOLEADOR', description: 'Los tres tantos de nuestro pichichi: disparo cruzado, testarazo y recorte de lujo.', imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80', videoUrl: '', sourceType: 'url', duration: '01:25', match: 'J13 vs Ibense CF', views: '3.1K views' },
  { id: 'c4', type: 'video', title: 'Sprint de 40 metros y vaselina de Álex "Galgo"', tag: 'VELOCIDAD PURA', description: 'Contragolpe letal conducido a más de 30 km/h finalizado con una sutil vaselina.', imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80', videoUrl: '', sourceType: 'url', duration: '00:52', match: 'J11 vs Penya La Foia', views: '1.6K views' },
  { id: 'c5', type: 'video', title: 'Recital de regates de Raúl "El Mago" en una baldosa', tag: 'CALIDAD F7', description: 'Ruleta marsellesa y caño en banda para habilitar el centro del gol.', imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80', videoUrl: '', sourceType: 'url', duration: '00:40', match: 'J12 vs Sporting Foia', views: '2.1K views' }
];

export const DEFAULT_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Parte médico oficial: Evolución del tobillo de Álex "Galgo" para el debut liguero',
    category: 'MEDICO',
    categoryLabel: 'PARTE MÉDICO OFICIAL',
    dateText: 'Hace 2 días',
    publishedAt: '23 de Septiembre, 2026',
    readTime: '3 min',
    featured: true,
    author: 'Servicios Médicos Rayo Pelón',
    authorRole: 'Cuerpo Médico & Fisioterapia',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'Tras las exploraciones ecográficas realizadas en la mañana de ayer, se descarta rotura ósea y se confirma un esguince leve de grado 1 en el ligamento lateral externo del tobillo derecho.',
    content: `Tras las exploraciones ecográficas y pruebas diagnósticas realizadas en la mañana de ayer a nuestro jugador Álex López ("Galgo"), los servicios médicos del club emiten el siguiente informe oficial:\n\n1. Diagnóstico Clínico: Esguince de grado 1 en el ligamento lateral externo del tobillo derecho, producido durante una disputa fortuita de balón en el último entrenamiento preparatorio.\n\n2. Tratamiento y Readaptación: El futbolista ha comenzado sesiones intensivas de fisioterapia, crioterapia y readaptación funcional con el equipo médico del club. Se descarta cualquier tipo de afectación ósea o rotura ligamentosa de mayor gravedad.\n\n3. Plazos de recuperación y Estado Competitivo: Se prevé un período de readaptación de 5 a 7 días. El cuerpo técnico y los servicios médicos valorarán su inclusión en la convocatoria en el entrenamiento previo al trascendental debut de la Jornada 1 frente a Deceroacien FC.\n\nEl club agradece el interés y las muestras de apoyo recibidas por la afición y desea a Álex una pronta y plena vuelta a los terrenos de juego.`,
    medicalDetails: {
      player: 'Álex López ("Galgo")',
      dorsal: 11,
      injury: 'Esguince de grado 1 en tobillo derecho',
      recoveryTime: '5 - 7 días',
      currentStatus: 'Duda hasta última hora'
    }
  },
  {
    id: 'n2',
    title: 'Crónica de Pretemporada: Buenas sensaciones y pólvora afinada antes de la Jornada 1',
    category: 'CRONICA',
    categoryLabel: 'CRÓNICA DE PARTIDO',
    dateText: 'Hace 4 días',
    publishedAt: '21 de Septiembre, 2026',
    readTime: '4 min',
    featured: false,
    author: 'Gabinete de Prensa',
    authorRole: 'Comunicación y Redacción',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'El Rayo Pelón F7 cierra su fase de preparación veraniega con un balance impecable de solidez táctica y ritmo competitivo de cara al inicio de la Liga Plata.',
    content: `El Rayo Pelón F7 ha puesto el punto final a su pretemporada 2026 con sensaciones inmejorables. Sobre el césped del Polideportivo Municipal de Ibi, el equipo dirigido por el cuerpo técnico mostró una intensidad asfixiante y un juego asociativo de muchos quilates.\n\nLos ensayos tácticos han servido para acoplar a las nuevas incorporaciones con la columna vertebral del vestuario. El ritmo de balón en transiciones rápidas y la contundencia en los balones parados auguran una temporada ilusionante para toda la familia del Rayo.\n\nEl vestuario ya cuenta los días para el estreno oficial en la Jornada 1 frente a Deceroacien FC en el campo Climent B. ¡Que empiece a rodar el balón!`
  },
  {
    id: 'n3',
    title: 'Comunicado Oficial: Apertura del programa de patrocinadores comarcales 26/27',
    category: 'OFICIAL',
    categoryLabel: 'COMUNICADO OFICIAL',
    dateText: 'Hace 1 semana',
    publishedAt: '18 de Septiembre, 2026',
    readTime: '3 min',
    featured: false,
    author: 'Junta Directiva',
    authorRole: 'Dirección Institucional',
    imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'La junta directiva de Rayo Pelón F7 abre el programa de esponsorización para empresas de Ibi, Castalla, Onil y comarca para la nueva temporada regular 26/27.',
    content: `La Junta Directiva del Rayo Pelón F7 hace pública la apertura oficial de la campaña de patrocinio comarcal para la temporada deportiva 2026/2027.\n\nBajo el lema "Sentimiento, Garra y Rayo", el club pone a disposición de las empresas y comercios de la Foia de Castalla diferentes modalidades de patrocinio: presencia en las equipaciones oficiales de juego, visibilidad preferente en el portal web y redes sociales del club, y menciones en las crónicas de cada jornada.\n\nLas empresas interesadas pueden ponerse en contacto con la directiva a través del formulario de contacto oficial o vía correo electrónico en contacto@rayopelonf7.es.`
  },
  {
    id: 'n4',
    title: 'Novedades & Fichajes: Presentación de la plantilla definitiva para la Liga Plata',
    category: 'NOVEDAD',
    categoryLabel: 'NOVEDADES & FICHAJES',
    dateText: 'Hace 2 semanas',
    publishedAt: '11 de Septiembre, 2026',
    readTime: '3 min',
    featured: false,
    author: 'Secretaría Técnica',
    authorRole: 'Área Deportiva',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'El club confirma la inscripción de los 17 guerreros que defenderán la elástica del Rayo Pelón en los 22 compromisos ligueros de la temporada.',
    content: `La dirección deportiva del Rayo Pelón F7 confirma que la plantilla para la temporada 2026/2027 queda cerrada con 17 futbolistas inscritos para disputar la Liga Plata de Ibi.\n\nUn bloque equilibrado que combina experiencia, velocidad en bandas y contundencia defensiva. El cuerpo técnico ha destacado el compromiso absoluto de todos los integrantes durante las semanas de preparación estival.\n\nLa plantilla completa ya está disponible para su consulta interactiva con fichas de atributos y estadísticas individuales en la sección oficial de Plantilla.`
  }
];

export const INITIAL_NEWS = DEFAULT_NEWS;

export const INITIAL_DATA: ClubDatabase = {
  clubInfo: {
    name: 'Rayo Pelón F7',
    league: 'Liga Plata Ibi F7 • Liga Comarcal',
    season: 'Temporada 2026/27',
    stadium: 'Complejo Deportivo Estadio Climent',
    address: 'C. Vicente Aleixandre, 17, 03440 Ibi, Alicante',
    email: 'danicortesmoreno@gmail.com',
    emailAlt: 'contacto@rayopelonf7.es',
    phone: '+34 601 43 84 41',
    schedule: 'Partidos: Viernes 21h/22h o Domingos 9h/10h • Sesión táctica: Miércoles 22h',
    mapsUrl: 'https://maps.app.goo.gl/YYMSsMhEYBnnL2wH9',
    instagram: 'https://www.instagram.com/rayopelonsv/',
    instagramHandle: '@rayopelonsv'
  },
  matchCenter: {
    lastMatch: { matchday: 0, homeTeam: 'RAYO PELÓN', awayTeam: '', score: 'PRETEMPORADA', notes: '', statusText: 'ÚLTIMA JORNADA (J0)' },
    nextMatch: { matchday: 1, homeTeam: 'RAYO PELÓN FC', awayTeam: 'DECEROACIEN FC', location: 'Climent B', dayTime: 'Domingo 10:00h', statusText: 'PRÓXIMO COMPROMISO (J1)', countdown: '5d 16h', fechaIso: '2026-10-04', hora: '10:00', campo: 'Climent B', diaSemana: 'domingo', fecha: '4 oct' }
  },
  players: [
    { id: 'p1', name: 'Albert Pons', nickname: 'Albert Pons', number: 5, position: 'DEF', age: 27, avatarInitials: 'AP', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/albertcartaweb_1790358398217.png', rating: 80, roleDescription: 'Seguridad atrás', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: true },
    { id: 'p2', name: 'Rafael Muñoz', nickname: 'Felo', number: 7, position: 'DEF', age: 23, avatarInitials: 'RM', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/rafacartaweb_1790358406755.png', rating: 80, roleDescription: '+80kg de puro musculo rovellao', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: true },
    { id: 'p3', name: 'Sergio Requena', nickname: 'El Mosquito', number: 8, position: 'DEL', age: 23, avatarInitials: 'SR', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/sergiocartaweb_1790358422689.png', rating: 80, roleDescription: 'Que rico se mueve con esa zurdita', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: true },
    { id: 'p4', name: 'Javier Campuzano', nickname: 'El Gabo', number: 9, position: 'DEL', age: 23, avatarInitials: 'JC', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/javicartaweb_1790358430335.png', rating: 80, roleDescription: 'El Anti Nine', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: true },
    { id: 'p5', name: 'Adrià Callado', nickname: 'Silenciao', number: 10, position: 'POR', age: 23, avatarInitials: 'AC', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/adriawebcarta_1790358437263.png', rating: 80, roleDescription: 'Nalgón pero ágil bajo palos', attributes: { reflejos: 80, estirada: 80, saque: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0, cleanSheets: 0, penaltiesSaved: '0 / 0' }, status: 'Apto', statusDetail: '', featured: true },
    { id: 'p6', name: 'Pablo Martínez', nickname: 'Shiquitoo', number: 11, position: 'DEL', age: 22, avatarInitials: 'PM', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/pablocartaweb_1790358445344.png', rating: 80, roleDescription: 'No la suelta pero es medio bueno', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'En duda', statusDetail: 'Tobillo', featured: true },
    { id: 'p7', name: 'Aarón Bravo', nickname: 'El Kaiser', number: 13, position: 'DEF', age: 25, avatarInitials: 'AB', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/aaroncartaweb_1790358450476.png', rating: 80, roleDescription: 'El Kaiser', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p8', name: 'Julen Rosauro', nickname: 'Julen Rosauro', number: 14, position: 'DEL', age: 27, avatarInitials: 'JR', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/julencartaweb_1790358456124.png', rating: 80, roleDescription: 'Veteranía en el gol', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p9', name: 'Hamudí Hamudi', nickname: 'Hamudi', number: 15, position: 'MED', age: 25, avatarInitials: 'HH', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/hamudicartaweb_1790358463387.png', rating: 80, roleDescription: 'Definición nativa de carrilero', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p10', name: 'Mauro Amorós', nickname: 'Gordinbabuer', number: 17, position: 'DEF', age: 26, avatarInitials: 'MA', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/maurocartaweb_1790358474524.png', rating: 80, roleDescription: 'Polivalencia sobre el campo', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p11', name: 'Iven Vicens', nickname: 'Magician', number: 18, position: 'MED', age: 20, avatarInitials: 'IV', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/ivancartaweb_1790358486082.png', rating: 80, roleDescription: 'El cerebro del campo', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p12', name: 'Jonathan Martínez', nickname: 'Jona', number: 22, position: 'MED', age: 22, avatarInitials: 'JM', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/jonacartaweb_1790358493703.png', rating: 80, roleDescription: 'Todoterreno nato', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p13', name: 'Jorge Ríos', nickname: 'Ríos', number: 23, position: 'MED', age: 24, avatarInitials: 'JR', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/jorgecartaweb_1790358499267.png', rating: 80, roleDescription: 'El pulmones de obsidiana', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p14', name: 'Daniel Cortés', nickname: 'Dani', number: 29, position: 'DEF', age: 23, avatarInitials: 'DC', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/daniwebcarta_1790358506233.png', rating: 80, roleDescription: 'Llegada al área sin gol', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p15', name: 'Martín Escrivá', nickname: 'Martínx', number: 67, position: 'MED', age: 22, avatarInitials: 'ME', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/martinxcartaweb_1790358516694.png', rating: 80, roleDescription: 'No sabe ni de que juega pero juega de todo', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p16', name: 'Sinuhé Moreno', nickname: 'Sinu', number: 69, position: 'MED', age: 21, avatarInitials: 'SM', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/sinuwebcarta_1790358523140.png', rating: 80, roleDescription: 'El expresso de Jumilla', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false },
    { id: 'p17', name: 'Adolfo Sebastián Saldaña', nickname: 'Cuntti', number: 69, position: 'DEF', age: 24, avatarInitials: 'AS', avatarColorGradient: 'from-amber-400 to-amber-200', photoUrl: '/players/adolfowebcarta_1790358527927.png', rating: 80, roleDescription: 'La locomotora de la zaga', attributes: { ritmo: 80, tiro: 80, pase: 80, regate: 80, defensa: 80, fisico: 80 }, seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 }, status: 'Apto', statusDetail: '', featured: false }
  ],
  standings: [
    { position: 1, teamCode: '13', teamName: '131 Town FC', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/241ef212-e851-4cd8-b555-00ae49244f75.webp' },
    { position: 2, teamCode: 'AB', teamName: 'Aston Birra FC', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/9431a3e0-6d49-4217-a008-052cfe3010ed.webp' },
    { position: 3, teamCode: 'BA', teamName: 'Bankales FC', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/77b47507-ecab-47e2-8de3-6dffe455c33d.webp' },
    { position: 4, teamCode: 'DE', teamName: 'Deceroacien FC', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/0973e847-5017-40bf-9cca-bc6a2dda77a8.webp' },
    { position: 5, teamCode: 'GL', teamName: 'Glorios', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/06f6a87b-baa2-4b10-a041-499f3ec2a3d6.webp' },
    { position: 6, teamCode: 'JM', teamName: 'JM.S FC', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/cbe3be5a-072b-4e00-bef7-f68adf39807f.webp' },
    { position: 7, teamCode: 'NP', teamName: 'Nottingham Por', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/d7e520cc-e154-42d6-a1eb-157f79c161d8.webp' },
    { position: 8, teamCode: 'RP', teamName: 'Rayo Pelón FC', isRayo: true, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'V'], badgeUrl: '/escudo.png' },
    { position: 9, teamCode: 'RA', teamName: 'Royal Academy', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/527e7e62-bdde-4607-9d9d-1c2ed45a8f09.webp' },
    { position: 10, teamCode: 'SE', teamName: 'Sera FC', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/a576807c-124e-4d64-afdd-ea825d12ec38.webp' },
    { position: 11, teamCode: 'UL', teamName: 'Ultimate', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/f8bd4e73-33c1-42af-a91b-6735bc094a88.webp' },
    { position: 12, teamCode: 'VI', teamName: 'Viejentus', isRayo: false, matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: ['V', 'V', 'E'], badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/c6452596-d6f5-4e4e-a552-6684522c033c.webp' }
  ],
  news: DEFAULT_NEWS,
  sponsors: [
    { id: 's1', name: 'IBI TOYS FACTORY', category: 'Industria', icon: 'sports_motorsports' },
    { id: 's2', name: 'CERVECERÍA LA PLAZA', category: 'Hostelería', icon: 'local_bar' },
    { id: 's3', name: 'GYM COMARCAL IBI', category: 'Fitness', icon: 'fitness_center' },
    { id: 's4', name: 'MATRICERÍA FOIA', category: 'Ingeniería', icon: 'precision_manufacturing' },
    { id: 's5', name: 'ASADOR EL TERCER TIEMPO', category: 'Gastronomía', icon: 'restaurant' },
    { id: 's6', name: 'MOTOR IBI SPORT', category: 'Automoción', icon: 'directions_car' }
  ],
  contactMessages: [],
  featuredMatch: DEFAULT_FEATURED_MATCH,
  gallery: DEFAULT_GALLERY,
  clips: DEFAULT_CLIPS,
  users: getInitialUsers(),
  matches: INITIAL_MATCHES,
  auditLogs: []
};

export class Database {
  private static isMysqlActive: boolean = false;
  private static currentCache: ClubDatabase | null = null;
  private static lastCheckResult: { success: boolean; message: string; timestamp: string } | null = null;
  private static pool: mysql.Pool | null = null;

  public static getMysqlConfig() {
    const rawHost = process.env.DB_HOST || '127.0.0.1';
    const host = rawHost === 'localhost' ? '127.0.0.1' : rawHost;
    const user = process.env.DB_USER || 'u512145639_rayo_user';
    const password = process.env.DB_PASSWORD || '1Cb=tf7V@mG';
    const database = process.env.DB_NAME || 'u512145639_rayo_bd';
    const port = Number(process.env.DB_PORT) || 3306;
    return { host, user, password, database, port, connectTimeout: 10000 };
  }

  private static ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORAGE_FILE)) {
      if (fs.existsSync(LEGACY_DB_FILE)) {
        try {
          const legacyContent = fs.readFileSync(LEGACY_DB_FILE, 'utf-8');
          fs.writeFileSync(STORAGE_FILE, legacyContent, 'utf-8');
        } catch {
          fs.writeFileSync(STORAGE_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
        }
      } else {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      }
    }
  }

  public static getMysqlPool(): mysql.Pool {
    if (!this.pool) {
      const cfg = this.getMysqlConfig();
      this.pool = mysql.createPool({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: cfg.password,
        database: cfg.database,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 4,
        idleTimeout: 60000,
        queueLimit: 0,
        connectTimeout: 10000,
        charset: 'utf8mb4'
      });
    }
    return this.pool;
  }

  /**
   * Inicializa las tablas relacionales en MySQL y carga o migra los datos
   */
  public static async initMysql(): Promise<boolean> {
    const cfg = this.getMysqlConfig();
    try {
      const pool = this.getMysqlPool();
      const conn = await pool.getConnection();

      try {
        // 1. CREACIÓN DE TABLAS RELACIONALES PROFESIONALES EN MYSQL
        
        // 1.1 Información institucional del Club
        await conn.query(`
          CREATE TABLE IF NOT EXISTS club_info (
            id VARCHAR(32) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            league VARCHAR(128) NOT NULL,
            season VARCHAR(64) NOT NULL,
            stadium VARCHAR(128) NOT NULL,
            address VARCHAR(255) NOT NULL,
            email VARCHAR(128) NOT NULL,
            email_alt VARCHAR(128) NOT NULL,
            phone VARCHAR(64) NOT NULL,
            schedule TEXT NOT NULL,
            maps_url TEXT NOT NULL,
            instagram VARCHAR(255) NOT NULL,
            instagram_handle VARCHAR(64) NOT NULL,
            whatsapp VARCHAR(64) DEFAULT '',
            whatsapp_url TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.2 Centro de Partido (Match Center)
        await conn.query(`
          CREATE TABLE IF NOT EXISTS match_center (
            id VARCHAR(32) PRIMARY KEY,
            last_match JSON NOT NULL,
            next_match JSON NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.3 Plantilla de Jugadores
        await conn.query(`
          CREATE TABLE IF NOT EXISTS players (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            nickname VARCHAR(128) NOT NULL DEFAULT '',
            number INT NOT NULL,
            position VARCHAR(16) NOT NULL,
            age INT NOT NULL DEFAULT 20,
            avatar_initials VARCHAR(8) NOT NULL DEFAULT '',
            avatar_color_gradient VARCHAR(128) NOT NULL DEFAULT 'from-amber-400 to-amber-200',
            photo_url TEXT,
            rating INT NOT NULL DEFAULT 80,
            role_description TEXT,
            attributes JSON NOT NULL,
            season_stats JSON NOT NULL,
            status VARCHAR(32) NOT NULL DEFAULT 'Apto',
            status_detail VARCHAR(128) NOT NULL DEFAULT '',
            featured TINYINT(1) NOT NULL DEFAULT 0,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_position (position),
            INDEX idx_number (number),
            INDEX idx_featured (featured)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.4 Noticias, Partes Médicos y Crónicas
        await conn.query(`
          CREATE TABLE IF NOT EXISTS news (
            id VARCHAR(64) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(32) NOT NULL,
            category_label VARCHAR(64) NOT NULL,
            date_text VARCHAR(64) NOT NULL DEFAULT 'Hoy',
            published_at VARCHAR(64) NOT NULL DEFAULT '',
            read_time VARCHAR(32) NOT NULL DEFAULT '3 min',
            featured TINYINT(1) NOT NULL DEFAULT 0,
            author VARCHAR(128) NOT NULL DEFAULT 'Rayo Pelón F7',
            author_role VARCHAR(128) NOT NULL DEFAULT 'Prensa & Comunicación',
            image_url TEXT,
            excerpt TEXT,
            content LONGTEXT NOT NULL,
            medical_details JSON DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category),
            INDEX idx_featured (featured)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.5 Calendario y Jornadas de Liga
        await conn.query(`
          CREATE TABLE IF NOT EXISTS matches (
            id VARCHAR(64) PRIMARY KEY,
            jornada INT NOT NULL,
            local VARCHAR(128) NOT NULL,
            visitante VARCHAR(128) NOT NULL,
            dia_semana VARCHAR(32) NOT NULL DEFAULT '',
            fecha VARCHAR(32) NOT NULL DEFAULT '',
            fecha_iso VARCHAR(32) NOT NULL DEFAULT '',
            hora VARCHAR(16) NOT NULL DEFAULT '',
            campo VARCHAR(128) NOT NULL DEFAULT '',
            jugado TINYINT(1) NOT NULL DEFAULT 0,
            goles_local INT DEFAULT NULL,
            goles_visitante INT DEFAULT NULL,
            notas TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_jornada (jornada),
            INDEX idx_jugado (jugado)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.6 Clasificación de la Liga
        await conn.query(`
          CREATE TABLE IF NOT EXISTS standings (
            position INT PRIMARY KEY,
            team_code VARCHAR(16) NOT NULL,
            team_name VARCHAR(128) NOT NULL,
            is_rayo TINYINT(1) NOT NULL DEFAULT 0,
            matches_played INT NOT NULL DEFAULT 0,
            won INT NOT NULL DEFAULT 0,
            drawn INT NOT NULL DEFAULT 0,
            lost INT NOT NULL DEFAULT 0,
            goals_for INT NOT NULL DEFAULT 0,
            goals_against INT NOT NULL DEFAULT 0,
            goal_difference INT NOT NULL DEFAULT 0,
            points INT NOT NULL DEFAULT 0,
            form VARCHAR(64) NOT NULL DEFAULT 'V,V,E',
            badge_url TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.7 Resumen de Partido Destacado
        await conn.query(`
          CREATE TABLE IF NOT EXISTS featured_match (
            id VARCHAR(64) PRIMARY KEY,
            data JSON NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.8 Galería Multimedia (Fotos)
        await conn.query(`
          CREATE TABLE IF NOT EXISTS gallery (
            id VARCHAR(64) PRIMARY KEY,
            type VARCHAR(32) NOT NULL DEFAULT 'foto',
            title VARCHAR(255) NOT NULL,
            tag VARCHAR(64) NOT NULL DEFAULT '',
            category VARCHAR(64) NOT NULL DEFAULT '',
            date VARCHAR(64) NOT NULL DEFAULT '',
            image_url TEXT NOT NULL,
            description TEXT,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_category (category)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.9 Clips de Vídeo
        await conn.query(`
          CREATE TABLE IF NOT EXISTS clips (
            id VARCHAR(64) PRIMARY KEY,
            type VARCHAR(32) NOT NULL DEFAULT 'video',
            title VARCHAR(255) NOT NULL,
            tag VARCHAR(64) NOT NULL DEFAULT '',
            description TEXT,
            image_url TEXT,
            video_url TEXT,
            source_type VARCHAR(32) NOT NULL DEFAULT 'url',
            duration VARCHAR(32) NOT NULL DEFAULT '',
            match_name VARCHAR(128) NOT NULL DEFAULT '',
            views VARCHAR(32) NOT NULL DEFAULT '0 views',
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.10 Patrocinadores
        await conn.query(`
          CREATE TABLE IF NOT EXISTS sponsors (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            category VARCHAR(64) NOT NULL DEFAULT '',
            icon VARCHAR(64) NOT NULL DEFAULT '',
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.11 Usuarios del Panel de Administración
        await conn.query(`
          CREATE TABLE IF NOT EXISTS club_users (
            id VARCHAR(64) PRIMARY KEY,
            username VARCHAR(64) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(32) NOT NULL DEFAULT 'MODERADOR',
            created_at VARCHAR(64) NOT NULL,
            last_login VARCHAR(64) DEFAULT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.12 Mensajes de Contacto
        await conn.query(`
          CREATE TABLE IF NOT EXISTS contact_messages (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            email VARCHAR(128) NOT NULL,
            phone VARCHAR(64) DEFAULT '',
            subject VARCHAR(128) DEFAULT '',
            message TEXT NOT NULL,
            created_at VARCHAR(64) NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.13 Bitácora de Auditoría
        await conn.query(`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id VARCHAR(64) PRIMARY KEY,
            timestamp VARCHAR(64) NOT NULL,
            username VARCHAR(64) NOT NULL,
            user_role VARCHAR(32) NOT NULL,
            action VARCHAR(32) NOT NULL,
            module VARCHAR(32) NOT NULL,
            description TEXT NOT NULL,
            details JSON DEFAULT NULL,
            INDEX idx_timestamp (timestamp)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 1.14 Tabla de Snapshot / Backup de Seguridad (Redundancia de rescate)
        await conn.query(`
          CREATE TABLE IF NOT EXISTS club_storage (
            id VARCHAR(64) PRIMARY KEY,
            data LONGTEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 2. COMPROBACIÓN Y MIGRACIÓN DE DATOS
        const [playerCount]: any = await conn.query('SELECT COUNT(*) as cnt FROM players');
        const hasPlayers = playerCount[0]?.cnt > 0;

        if (!hasPlayers) {
          console.log('[Database] Tabla "players" vacía. Comprobando migración desde "club_storage" o datos de arranque...');
          let sourceData: ClubDatabase | null = null;

          // Intento A: Migrar desde club_storage existente
          try {
            const [storageRows]: any = await conn.query('SELECT data FROM club_storage WHERE id = ? LIMIT 1', ['main']);
            if (Array.isArray(storageRows) && storageRows.length > 0 && storageRows[0]?.data) {
              sourceData = JSON.parse(storageRows[0].data);
              console.log('[Database] Migrando datos existentes desde club_storage a las nuevas tablas relacionales...');
            }
          } catch (e: any) {
            console.warn('[Database] No se pudo leer club_storage:', e?.message);
          }

          // Intento B: Si no hay club_storage, usar INITIAL_DATA actualizado
          if (!sourceData) {
            sourceData = INITIAL_DATA;
            console.log('[Database] Inicializando tablas relacionales con la plantilla oficial actualizada.');
          }

          await this.populateRelationalTables(conn, sourceData);
        } else {
          console.log('[Database] ✓ Tablas relacionales activas en MySQL con datos existentes. Preservando integridad.');
        }

        // 3. CARGAR DATOS COMPLETOS DESDE LAS TABLAS RELACIONALES DE MYSQL
        const liveData = await this.loadFromMysql(conn);
        this.currentCache = liveData;
        this.writeLocalFile(liveData);

        this.isMysqlActive = true;
        this.lastCheckResult = {
          success: true,
          message: `Motor MySQL relacional activo y conectado (${cfg.host}:${cfg.port} - BD: ${cfg.database})`,
          timestamp: new Date().toISOString()
        };
        console.log(`[Database] ✓ Base de datos MySQL sincronizada (${liveData.players.length} jugadores, ${liveData.news.length} noticias, ${liveData.matches?.length || 0} jornadas)`);
        return true;
      } finally {
        conn.release();
      }
    } catch (err: any) {
      console.warn('[Database] Error en initMysql:', err?.message);
      this.isMysqlActive = false;
      this.lastCheckResult = {
        success: false,
        message: `No se pudo conectar a MySQL (${cfg.host}:${cfg.port} - BD: ${cfg.database}): ${err?.message}`,
        timestamp: new Date().toISOString()
      };
      return false;
    }
  }

  /**
   * Carga la base de datos completa leyendo directamente de las tablas relacionales de MySQL
   */
  public static async loadFromMysql(conn: mysql.PoolConnection | mysql.Pool): Promise<ClubDatabase> {
    // 1. Club Info
    const [infoRows]: any = await conn.query('SELECT * FROM club_info WHERE id = ? LIMIT 1', ['info']);
    let clubInfo = INITIAL_DATA.clubInfo;
    if (infoRows.length > 0) {
      const r = infoRows[0];
      clubInfo = {
        name: r.name,
        league: r.league,
        season: r.season,
        stadium: r.stadium,
        address: r.address,
        email: r.email,
        emailAlt: r.email_alt,
        phone: r.phone,
        schedule: r.schedule,
        mapsUrl: r.maps_url,
        instagram: r.instagram,
        instagramHandle: r.instagram_handle,
        whatsapp: r.whatsapp || '',
        whatsappUrl: r.whatsapp_url || ''
      };
    }

    // 2. Match Center
    const [mcRows]: any = await conn.query('SELECT * FROM match_center WHERE id = ? LIMIT 1', ['current']);
    let matchCenter = INITIAL_DATA.matchCenter;
    if (mcRows.length > 0) {
      matchCenter = {
        lastMatch: typeof mcRows[0].last_match === 'string' ? JSON.parse(mcRows[0].last_match) : mcRows[0].last_match,
        nextMatch: typeof mcRows[0].next_match === 'string' ? JSON.parse(mcRows[0].next_match) : mcRows[0].next_match
      };
    }

    // 3. Players
    const [playerRows]: any = await conn.query('SELECT * FROM players ORDER BY number ASC, sort_order ASC');
    const players = playerRows.map((r: any) => ({
      id: r.id,
      name: r.name,
      nickname: r.nickname || '',
      number: Number(r.number),
      position: r.position,
      age: Number(r.age),
      avatarInitials: r.avatar_initials || '',
      avatarColorGradient: r.avatar_color_gradient || 'from-amber-400 to-amber-200',
      photoUrl: r.photo_url || '',
      rating: Number(r.rating) || 80,
      roleDescription: r.role_description || '',
      attributes: typeof r.attributes === 'string' ? JSON.parse(r.attributes) : (r.attributes || {}),
      seasonStats: typeof r.season_stats === 'string' ? JSON.parse(r.season_stats) : (r.season_stats || {}),
      status: r.status || 'Apto',
      statusDetail: r.status_detail || '',
      featured: Boolean(r.featured)
    }));

    // 4. News
    const [newsRows]: any = await conn.query('SELECT * FROM news ORDER BY created_at DESC');
    const news: NewsArticle[] = newsRows.map((r: any) => {
      let medicalDetails: any = undefined;
      if (r.medical_details) {
        medicalDetails = typeof r.medical_details === 'string' ? JSON.parse(r.medical_details) : r.medical_details;
      }
      return {
        id: r.id,
        title: r.title,
        category: r.category as NewsCategory,
        categoryLabel: r.category_label,
        dateText: r.date_text || 'Hoy',
        publishedAt: r.published_at || '',
        readTime: r.read_time || '3 min',
        featured: Boolean(r.featured),
        author: r.author || 'Rayo Pelón F7',
        authorRole: r.author_role || 'Prensa & Comunicación',
        imageUrl: r.image_url || '',
        excerpt: r.excerpt || '',
        content: r.content || '',
        medicalDetails
      };
    });

    // 5. Matches
    const [matchRows]: any = await conn.query('SELECT * FROM matches ORDER BY jornada ASC');
    const matches: SeasonMatch[] = matchRows.map((r: any) => ({
      id: r.id,
      jornada: Number(r.jornada),
      local: r.local,
      visitante: r.visitante,
      dia_semana: r.dia_semana || '',
      fecha: r.fecha || '',
      fecha_iso: r.fecha_iso || '',
      hora: r.hora || '',
      campo: r.campo || '',
      jugado: Boolean(r.jugado),
      golesLocal: r.goles_local !== null ? Number(r.goles_local) : null,
      golesVisitante: r.goles_visitante !== null ? Number(r.goles_visitante) : null,
      notas: r.notas || ''
    }));

    // 6. Standings
    const [standingRows]: any = await conn.query('SELECT * FROM standings ORDER BY position ASC');
    const standings = standingRows.map((r: any) => ({
      position: Number(r.position),
      teamCode: r.team_code,
      teamName: r.team_name,
      isRayo: Boolean(r.is_rayo),
      matchesPlayed: Number(r.matches_played),
      won: Number(r.won),
      drawn: Number(r.drawn),
      lost: Number(r.lost),
      goalsFor: Number(r.goals_for),
      goalsAgainst: Number(r.goals_against),
      goalDifference: Number(r.goal_difference),
      points: Number(r.points),
      form: r.form ? r.form.split(',') : ['V', 'V', 'E'],
      badgeUrl: r.badge_url || ''
    }));

    // 7. Featured Match
    const [fmRows]: any = await conn.query('SELECT * FROM featured_match WHERE id = ? LIMIT 1', ['last-match-recap']);
    let featuredMatch = DEFAULT_FEATURED_MATCH;
    if (fmRows.length > 0 && fmRows[0].data) {
      featuredMatch = typeof fmRows[0].data === 'string' ? JSON.parse(fmRows[0].data) : fmRows[0].data;
    }

    // 8. Gallery
    const [galleryRows]: any = await conn.query('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC');
    const gallery = galleryRows.map((r: any) => ({
      id: r.id,
      type: r.type || 'foto',
      title: r.title,
      tag: r.tag || '',
      category: r.category || '',
      date: r.date || '',
      imageUrl: r.image_url,
      description: r.description || ''
    }));

    // 9. Clips
    const [clipRows]: any = await conn.query('SELECT * FROM clips ORDER BY sort_order ASC, created_at DESC');
    const clips = clipRows.map((r: any) => ({
      id: r.id,
      type: r.type || 'video',
      title: r.title,
      tag: r.tag || '',
      description: r.description || '',
      imageUrl: r.image_url || '',
      videoUrl: r.video_url || '',
      sourceType: r.source_type || 'url',
      duration: r.duration || '',
      match: r.match_name || '',
      views: r.views || '0 views'
    }));

    // 10. Sponsors
    const [sponsorRows]: any = await conn.query('SELECT * FROM sponsors ORDER BY sort_order ASC');
    const sponsors = sponsorRows.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category || '',
      icon: r.icon || ''
    }));

    // 11. Users
    const [userRows]: any = await conn.query('SELECT * FROM club_users ORDER BY username ASC');
    const users: User[] = userRows.map((r: any) => ({
      id: r.id,
      username: r.username,
      passwordHash: r.password_hash,
      role: r.role as UserRole,
      createdAt: r.created_at || new Date().toISOString(),
      lastLogin: r.last_login || undefined
    }));

    // 12. Contact Messages
    const [msgRows]: any = await conn.query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100');
    const contactMessages = msgRows.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone || '',
      subject: r.subject || '',
      message: r.message,
      createdAt: r.created_at
    }));

    // 13. Audit Logs
    const [logRows]: any = await conn.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 500');
    const auditLogs: AuditLog[] = logRows.map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp,
      username: r.username,
      userRole: r.user_role as UserRole,
      action: r.action as AuditAction,
      module: r.module as AuditModule,
      description: r.description,
      details: r.details ? (typeof r.details === 'string' ? JSON.parse(r.details) : r.details) : undefined
    }));

    return {
      clubInfo,
      matchCenter,
      players,
      standings,
      news,
      sponsors,
      contactMessages,
      featuredMatch,
      gallery,
      clips,
      users: users.length > 0 ? users : getInitialUsers(),
      matches: matches.length > 0 ? matches : INITIAL_MATCHES,
      auditLogs
    };
  }

  /**
   * Población inicial / migración desde JSON hacia tablas relacionales
   */
  private static async populateRelationalTables(conn: mysql.PoolConnection, data: ClubDatabase) {
    // 1. Club Info
    if (data.clubInfo) {
      await conn.query(
        `INSERT INTO club_info (id, name, league, season, stadium, address, email, email_alt, phone, schedule, maps_url, instagram, instagram_handle, whatsapp, whatsapp_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), league=VALUES(league), season=VALUES(season)`,
        [
          'info',
          data.clubInfo.name || 'Rayo Pelón F7',
          data.clubInfo.league || '',
          data.clubInfo.season || '',
          data.clubInfo.stadium || '',
          data.clubInfo.address || '',
          data.clubInfo.email || '',
          data.clubInfo.emailAlt || '',
          data.clubInfo.phone || '',
          data.clubInfo.schedule || '',
          data.clubInfo.mapsUrl || '',
          data.clubInfo.instagram || '',
          data.clubInfo.instagramHandle || '',
          data.clubInfo.whatsapp || '',
          data.clubInfo.whatsappUrl || ''
        ]
      );
    }

    // 2. Match Center
    if (data.matchCenter) {
      await conn.query(
        `INSERT INTO match_center (id, last_match, next_match) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE last_match=VALUES(last_match), next_match=VALUES(next_match)`,
        ['current', JSON.stringify(data.matchCenter.lastMatch), JSON.stringify(data.matchCenter.nextMatch)]
      );
    }

    // 3. Players
    if (Array.isArray(data.players)) {
      for (let i = 0; i < data.players.length; i++) {
        const p = data.players[i];
        await conn.query(
          `INSERT INTO players (id, name, nickname, number, position, age, avatar_initials, avatar_color_gradient, photo_url, rating, role_description, attributes, season_stats, status, status_detail, featured, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name), nickname=VALUES(nickname), number=VALUES(number), position=VALUES(position), photo_url=VALUES(photo_url), rating=VALUES(rating), attributes=VALUES(attributes), season_stats=VALUES(season_stats), status=VALUES(status), status_detail=VALUES(status_detail), featured=VALUES(featured)`,
          [
            p.id,
            p.name,
            p.nickname || '',
            Number(p.number) || 0,
            p.position || 'MED',
            Number(p.age) || 20,
            p.avatarInitials || '',
            p.avatarColorGradient || 'from-amber-400 to-amber-200',
            p.photoUrl || '',
            Number(p.rating) || 80,
            p.roleDescription || '',
            JSON.stringify(p.attributes || {}),
            JSON.stringify(p.seasonStats || {}),
            p.status || 'Apto',
            p.statusDetail || '',
            p.featured ? 1 : 0,
            i
          ]
        );
      }
    }

    // 4. News
    if (Array.isArray(data.news)) {
      for (const n of data.news) {
        await conn.query(
          `INSERT INTO news (id, title, category, category_label, date_text, published_at, read_time, featured, author, author_role, image_url, excerpt, content, medical_details)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), content=VALUES(content), image_url=VALUES(image_url), medical_details=VALUES(medical_details)`,
          [
            n.id,
            n.title,
            n.category,
            n.categoryLabel || n.category,
            n.dateText || 'Hoy',
            n.publishedAt || '',
            n.readTime || '3 min',
            n.featured ? 1 : 0,
            n.author || 'Rayo Pelón F7',
            n.authorRole || 'Prensa & Comunicación',
            n.imageUrl || '',
            n.excerpt || '',
            n.content,
            n.medicalDetails ? JSON.stringify(n.medicalDetails) : null
          ]
        );
      }
    }

    // 5. Matches
    const matchesList = Array.isArray(data.matches) && data.matches.length > 0 ? data.matches : INITIAL_MATCHES;
    for (const m of matchesList) {
      await conn.query(
        `INSERT INTO matches (id, jornada, local, visitante, dia_semana, fecha, fecha_iso, hora, campo, jugado, goles_local, goles_visitante, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE local=VALUES(local), visitante=VALUES(visitante), jugado=VALUES(jugado), goles_local=VALUES(goles_local), goles_visitante=VALUES(goles_visitante), notas=VALUES(notas)`,
        [
          m.id,
          Number(m.jornada),
          m.local,
          m.visitante,
          m.dia_semana || '',
          m.fecha || '',
          m.fecha_iso || '',
          m.hora || '',
          m.campo || '',
          m.jugado ? 1 : 0,
          m.golesLocal ?? null,
          m.golesVisitante ?? null,
          m.notas || ''
        ]
      );
    }

    // 6. Standings
    if (Array.isArray(data.standings)) {
      for (const st of data.standings) {
        const formStr = Array.isArray(st.form) ? st.form.join(',') : (st.form || 'V,V,E');
        await conn.query(
          `INSERT INTO standings (position, team_code, team_name, is_rayo, matches_played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form, badge_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE team_name=VALUES(team_name), matches_played=VALUES(matches_played), won=VALUES(won), drawn=VALUES(drawn), lost=VALUES(lost), points=VALUES(points)`,
          [
            Number(st.position),
            st.teamCode,
            st.teamName,
            st.isRayo ? 1 : 0,
            Number(st.matchesPlayed) || 0,
            Number(st.won) || 0,
            Number(st.drawn) || 0,
            Number(st.lost) || 0,
            Number(st.goalsFor) || 0,
            Number(st.goalsAgainst) || 0,
            Number(st.goalDifference) || 0,
            Number(st.points) || 0,
            formStr,
            st.badgeUrl || ''
          ]
        );
      }
    }

    // 7. Featured Match
    if (data.featuredMatch) {
      await conn.query(
        `INSERT INTO featured_match (id, data) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE data=VALUES(data)`,
        ['last-match-recap', JSON.stringify(data.featuredMatch)]
      );
    }

    // 8. Gallery
    if (Array.isArray(data.gallery)) {
      for (let i = 0; i < data.gallery.length; i++) {
        const g = data.gallery[i];
        await conn.query(
          `INSERT INTO gallery (id, type, title, tag, category, date, image_url, description, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title=VALUES(title), image_url=VALUES(image_url)`,
          [g.id, g.type || 'foto', g.title, g.tag || '', g.category || '', g.date || '', g.imageUrl, g.description || '', i]
        );
      }
    }

    // 9. Clips
    if (Array.isArray(data.clips)) {
      for (let i = 0; i < data.clips.length; i++) {
        const c = data.clips[i];
        await conn.query(
          `INSERT INTO clips (id, type, title, tag, description, image_url, video_url, source_type, duration, match_name, views, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title=VALUES(title), video_url=VALUES(video_url), image_url=VALUES(image_url)`,
          [c.id, c.type || 'video', c.title, c.tag || '', c.description || '', c.imageUrl || '', c.videoUrl || '', c.sourceType || 'url', c.duration || '', c.match || '', c.views || '0 views', i]
        );
      }
    }

    // 10. Sponsors
    if (Array.isArray(data.sponsors)) {
      for (let i = 0; i < data.sponsors.length; i++) {
        const sp = data.sponsors[i];
        await conn.query(
          `INSERT INTO sponsors (id, name, category, icon, sort_order)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), icon=VALUES(icon)`,
          [sp.id, sp.name, sp.category || '', sp.icon || '', i]
        );
      }
    }

    // 11. Users
    const usersList = Array.isArray(data.users) && data.users.length > 0 ? data.users : getInitialUsers();
    for (const u of usersList) {
      await conn.query(
        `INSERT INTO club_users (id, username, password_hash, role, created_at, last_login)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE username=VALUES(username), password_hash=VALUES(password_hash), role=VALUES(role)`,
        [u.id, u.username, u.passwordHash, u.role, u.createdAt || new Date().toISOString(), u.lastLogin || null]
      );
    }

    // 12. Backup Snapshot en club_storage
    await conn.query(
      `INSERT INTO club_storage (id, data) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE data=VALUES(data)`,
      ['main', JSON.stringify(data)]
    );
  }

  /**
   * Persiste cambios directamente en las tablas relacionales de MySQL
   */
  public static async saveToMysql(data: ClubDatabase): Promise<boolean> {
    try {
      const pool = this.getMysqlPool();

      // Guardar de inmediato en tablas relacionales principales
      if (Array.isArray(data.players)) {
        for (let i = 0; i < data.players.length; i++) {
          const p = data.players[i];
          await pool.query(
            `INSERT INTO players (id, name, nickname, number, position, age, avatar_initials, avatar_color_gradient, photo_url, rating, role_description, attributes, season_stats, status, status_detail, featured, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
               name=VALUES(name), nickname=VALUES(nickname), number=VALUES(number), position=VALUES(position),
               age=VALUES(age), photo_url=VALUES(photo_url), rating=VALUES(rating), role_description=VALUES(role_description),
               attributes=VALUES(attributes), season_stats=VALUES(season_stats), status=VALUES(status),
               status_detail=VALUES(status_detail), featured=VALUES(featured), sort_order=VALUES(sort_order)`,
            [
              p.id,
              p.name,
              p.nickname || '',
              Number(p.number) || 0,
              p.position || 'MED',
              Number(p.age) || 20,
              p.avatarInitials || '',
              p.avatarColorGradient || 'from-amber-400 to-amber-200',
              p.photoUrl || '',
              Number(p.rating) || 80,
              p.roleDescription || '',
              JSON.stringify(p.attributes || {}),
              JSON.stringify(p.seasonStats || {}),
              p.status || 'Apto',
              p.statusDetail || '',
              p.featured ? 1 : 0,
              i
            ]
          );
        }

        // Eliminar jugadores que ya no estén en la lista
        const playerIds = data.players.map(p => p.id);
        if (playerIds.length > 0) {
          await pool.query(`DELETE FROM players WHERE id NOT IN (?)`, [playerIds]);
        }
      }

      if (Array.isArray(data.news)) {
        for (const n of data.news) {
          await pool.query(
            `INSERT INTO news (id, title, category, category_label, date_text, published_at, read_time, featured, author, author_role, image_url, excerpt, content, medical_details)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
               title=VALUES(title), category=VALUES(category), category_label=VALUES(category_label),
               date_text=VALUES(date_text), published_at=VALUES(published_at), read_time=VALUES(read_time),
               featured=VALUES(featured), author=VALUES(author), author_role=VALUES(author_role),
               image_url=VALUES(image_url), excerpt=VALUES(excerpt), content=VALUES(content),
               medical_details=VALUES(medical_details)`,
            [
              n.id,
              n.title,
              n.category,
              n.categoryLabel || n.category,
              n.dateText || 'Hoy',
              n.publishedAt || '',
              n.readTime || '3 min',
              n.featured ? 1 : 0,
              n.author || 'Rayo Pelón F7',
              n.authorRole || 'Prensa & Comunicación',
              n.imageUrl || '',
              n.excerpt || '',
              n.content,
              n.medicalDetails ? JSON.stringify(n.medicalDetails) : null
            ]
          );
        }

        // Eliminar noticias que hayan sido borradas
        const newsIds = data.news.map(n => n.id);
        if (newsIds.length > 0) {
          await pool.query(`DELETE FROM news WHERE id NOT IN (?)`, [newsIds]);
        }
      }

      if (Array.isArray(data.matches)) {
        for (const m of data.matches) {
          await pool.query(
            `INSERT INTO matches (id, jornada, local, visitante, dia_semana, fecha, fecha_iso, hora, campo, jugado, goles_local, goles_visitante, notas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
               local=VALUES(local), visitante=VALUES(visitante), dia_semana=VALUES(dia_semana),
               fecha=VALUES(fecha), fecha_iso=VALUES(fecha_iso), hora=VALUES(hora), campo=VALUES(campo),
               jugado=VALUES(jugado), goles_local=VALUES(goles_local), goles_visitante=VALUES(goles_visitante),
               notas=VALUES(notas)`,
            [
              m.id,
              Number(m.jornada),
              m.local,
              m.visitante,
              m.dia_semana || '',
              m.fecha || '',
              m.fecha_iso || '',
              m.hora || '',
              m.campo || '',
              m.jugado ? 1 : 0,
              m.golesLocal ?? null,
              m.golesVisitante ?? null,
              m.notas || ''
            ]
          );
        }
      }

      if (data.matchCenter) {
        await pool.query(
          `INSERT INTO match_center (id, last_match, next_match) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE last_match=VALUES(last_match), next_match=VALUES(next_match)`,
          ['current', JSON.stringify(data.matchCenter.lastMatch), JSON.stringify(data.matchCenter.nextMatch)]
        );
      }

      if (data.clubInfo) {
        await pool.query(
          `INSERT INTO club_info (id, name, league, season, stadium, address, email, email_alt, phone, schedule, maps_url, instagram, instagram_handle, whatsapp, whatsapp_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             name=VALUES(name), league=VALUES(league), season=VALUES(season), stadium=VALUES(stadium),
             address=VALUES(address), email=VALUES(email), email_alt=VALUES(email_alt), phone=VALUES(phone),
             schedule=VALUES(schedule), maps_url=VALUES(maps_url), instagram=VALUES(instagram),
             instagram_handle=VALUES(instagram_handle), whatsapp=VALUES(whatsapp), whatsapp_url=VALUES(whatsapp_url)`,
          [
            'info',
            data.clubInfo.name || 'Rayo Pelón F7',
            data.clubInfo.league || '',
            data.clubInfo.season || '',
            data.clubInfo.stadium || '',
            data.clubInfo.address || '',
            data.clubInfo.email || '',
            data.clubInfo.emailAlt || '',
            data.clubInfo.phone || '',
            data.clubInfo.schedule || '',
            data.clubInfo.mapsUrl || '',
            data.clubInfo.instagram || '',
            data.clubInfo.instagramHandle || '',
            data.clubInfo.whatsapp || '',
            data.clubInfo.whatsappUrl || ''
          ]
        );
      }

      if (Array.isArray(data.standings)) {
        for (const st of data.standings) {
          const formStr = Array.isArray(st.form) ? st.form.join(',') : (st.form || 'V,V,E');
          await pool.query(
            `INSERT INTO standings (position, team_code, team_name, is_rayo, matches_played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form, badge_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
               team_name=VALUES(team_name), is_rayo=VALUES(is_rayo), matches_played=VALUES(matches_played),
               won=VALUES(won), drawn=VALUES(drawn), lost=VALUES(lost), goals_for=VALUES(goals_for),
               goals_against=VALUES(goals_against), goal_difference=VALUES(goal_difference), points=VALUES(points),
               form=VALUES(form), badge_url=VALUES(badge_url)`,
            [
              Number(st.position),
              st.teamCode,
              st.teamName,
              st.isRayo ? 1 : 0,
              Number(st.matchesPlayed) || 0,
              Number(st.won) || 0,
              Number(st.drawn) || 0,
              Number(st.lost) || 0,
              Number(st.goalsFor) || 0,
              Number(st.goalsAgainst) || 0,
              Number(st.goalDifference) || 0,
              Number(st.points) || 0,
              formStr,
              st.badgeUrl || ''
            ]
          );
        }
      }

      // Snapshot de rescate en club_storage
      await pool.query(
        'INSERT INTO club_storage (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
        ['main', JSON.stringify(data)]
      );

      this.isMysqlActive = true;

      // Tareas secundarias en background (usuarios, logs, mensajes)
      setImmediate(async () => {
        try {
          if (Array.isArray(data.users)) {
            for (const u of data.users) {
              await pool.query(
                `INSERT INTO club_users (id, username, password_hash, role, created_at, last_login)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                   username=VALUES(username), password_hash=VALUES(password_hash), role=VALUES(role),
                   last_login=VALUES(last_login)`,
                [u.id, u.username, u.passwordHash, u.role, u.createdAt || new Date().toISOString(), u.lastLogin || null]
              );
            }
          }

          if (Array.isArray(data.contactMessages) && data.contactMessages.length > 0) {
            for (const msg of data.contactMessages.slice(0, 10)) {
              await pool.query(
                `INSERT INTO contact_messages (id, name, email, phone, subject, message, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE name=VALUES(name)`,
                [msg.id, msg.name, msg.email, msg.phone || '', msg.subject || '', msg.message, msg.createdAt || new Date().toISOString()]
              );
            }
          }

          if (Array.isArray(data.auditLogs) && data.auditLogs.length > 0) {
            for (const log of data.auditLogs.slice(0, 20)) {
              await pool.query(
                `INSERT INTO audit_logs (id, timestamp, username, user_role, action, module, description, details)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE timestamp=VALUES(timestamp)`,
                [log.id, log.timestamp, log.username, log.userRole, log.action, log.module, log.description, log.details ? JSON.stringify(log.details) : null]
              );
            }
          }
        } catch (err: any) {
          console.warn('[Database] Sync secundario en background:', err?.message);
        }
      });

      return true;
    } catch (err: any) {
      console.warn('[Database] Error al persistir en MySQL:', err?.message);
      this.isMysqlActive = false;
      return false;
    }
  }

  public static async testMysqlConnection(): Promise<{ success: boolean; message: string }> {
    const ok = await this.initMysql();
    const cfg = this.getMysqlConfig();
    if (ok) {
      const res = {
        success: true,
        message: `Conexión exitosa a MySQL relacional (${cfg.host}:${cfg.port} - BD: ${cfg.database})`
      };
      this.lastCheckResult = { ...res, timestamp: new Date().toISOString() };
      return res;
    } else {
      const res = {
        success: false,
        message: `No se pudo conectar a MySQL (${cfg.host}:${cfg.port} - BD: ${cfg.database})`
      };
      this.lastCheckResult = { ...res, timestamp: new Date().toISOString() };
      return res;
    }
  }

  public static getStatus() {
    const cfg = this.getMysqlConfig();
    return {
      storageEngine: this.isMysqlActive ? 'MYSQL_RELATIONAL' : 'JSON_STORAGE',
      isMysql: this.isMysqlActive,
      tables: [
        'players', 'news', 'matches', 'standings', 'club_info', 
        'match_center', 'featured_match', 'gallery', 'clips', 
        'sponsors', 'club_users', 'contact_messages', 'audit_logs'
      ],
      storageFile: 'server/data/club_storage.json',
      sqlConfigured: true,
      host: cfg.host,
      database: cfg.database,
      user: cfg.user,
      port: cfg.port,
      lastCheck: this.lastCheckResult,
      storageType: this.isMysqlActive ? 'MySQL Relacional (Hostinger MariaDB)' : 'Almacenamiento Local (JSON)'
    };
  }

  public static read(): ClubDatabase {
    if (this.currentCache) {
      return this.currentCache;
    }
    const data = this.readLocalFile();
    this.currentCache = data;
    return data;
  }

  public static write(data: ClubDatabase): void {
    this.currentCache = data;
    this.writeLocalFile(data);
    this.saveToMysql(data).catch(() => {});
  }

  private static readLocalFile(): ClubDatabase {
    this.ensureDataDir();
    try {
      let content = '';
      if (fs.existsSync(STORAGE_FILE)) {
        content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      } else if (fs.existsSync(STORAGE_BAK_FILE)) {
        content = fs.readFileSync(STORAGE_BAK_FILE, 'utf-8');
      } else if (fs.existsSync(LEGACY_DB_FILE)) {
        content = fs.readFileSync(LEGACY_DB_FILE, 'utf-8');
      }

      if (!content || !content.trim()) {
        throw new Error('Archivo de base de datos vacío');
      }

      const data: ClubDatabase = JSON.parse(content);

      if (!data.matches || !Array.isArray(data.matches) || data.matches.length === 0) {
        data.matches = INITIAL_MATCHES;
      }
      data.matchCenter = computeMatchCenter(data.matches);

      if (!data.players || !Array.isArray(data.players) || data.players.length === 0) {
        data.players = INITIAL_DATA.players;
      }

      if (!data.featuredMatch) {
        data.featuredMatch = DEFAULT_FEATURED_MATCH;
      }
      if (!data.gallery || !Array.isArray(data.gallery)) {
        data.gallery = DEFAULT_GALLERY;
      }
      if (!data.clips || !Array.isArray(data.clips)) {
        data.clips = DEFAULT_CLIPS;
      }
      if (!data.news || !Array.isArray(data.news)) {
        data.news = DEFAULT_NEWS;
      }

      return data;
    } catch {
      return INITIAL_DATA;
    }
  }

  private static writeLocalFile(data: ClubDatabase): void {
    this.ensureDataDir();
    try {
      const json = JSON.stringify(data, null, 2);
      fs.writeFileSync(STORAGE_FILE, json, 'utf-8');
      fs.writeFileSync(STORAGE_BAK_FILE, json, 'utf-8');
    } catch (err) {
      console.warn('[Storage] Error al escribir en disco local:', err);
    }
  }
}
