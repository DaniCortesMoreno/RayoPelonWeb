import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORAGE_FILE = path.join(DATA_DIR, 'club_storage.json');
const STORAGE_BAK_FILE = path.join(DATA_DIR, 'club_storage.bak.json');
const LEGACY_DB_FILE = path.join(DATA_DIR, 'db.json');
export function createAuditLog(db, entry) {
    if (!db.auditLogs || !Array.isArray(db.auditLogs)) {
        db.auditLogs = [];
    }
    const newLog = {
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
export function getInitialUsers() {
    return [
        {
            id: 'u_dani',
            username: 'Dani',
            passwordHash: bcrypt.hashSync('LisaMiaLolo3', 10),
            role: 'ADMIN',
            createdAt: '2026-09-24T19:30:00.000Z'
        }
    ];
}
export function computeCountdown(fechaIso, hora) {
    if (!fechaIso)
        return 'Pronto';
    const target = new Date(`${fechaIso}T${hora || '00:00'}:00`);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) {
        if (diffMs > -3 * 3600 * 1000)
            return '¡Hoy!';
        return '0d 00h';
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${String(hours).padStart(2, '0')}h`;
}
export function computeMatchCenter(matches) {
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
    }
    else {
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
    }
    else {
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
export const INITIAL_MATCHES = [
    {
        id: 'm1',
        jornada: 1,
        local: 'Rayo Pelón FC',
        visitante: 'Deceroacien FC',
        dia_semana: 'domingo',
        fecha: '4 oct',
        fecha_iso: '2026-10-04',
        hora: '10:00',
        campo: 'Climent B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm2',
        jornada: 2,
        local: 'JM.S FC',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'domingo',
        fecha: '18 oct',
        fecha_iso: '2026-10-18',
        hora: '10:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm3',
        jornada: 3,
        local: 'Rayo Pelón FC',
        visitante: 'Aston Birra FC',
        dia_semana: 'domingo',
        fecha: '25 oct',
        fecha_iso: '2026-10-25',
        hora: '09:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm4',
        jornada: 4,
        local: 'Glorios',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'domingo',
        fecha: '8 nov',
        fecha_iso: '2026-11-08',
        hora: '10:00',
        campo: 'Climent B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm5',
        jornada: 5,
        local: 'Rayo Pelón FC',
        visitante: 'Bankales FC',
        dia_semana: 'domingo',
        fecha: '15 nov',
        fecha_iso: '2026-11-15',
        hora: '09:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm6',
        jornada: 6,
        local: 'Ultimate',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'domingo',
        fecha: '22 nov',
        fecha_iso: '2026-11-22',
        hora: '10:00',
        campo: 'Climent A',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm7',
        jornada: 7,
        local: 'Rayo Pelón FC',
        visitante: 'Royal Academy',
        dia_semana: 'viernes',
        fecha: '27 nov',
        fecha_iso: '2026-11-27',
        hora: '22:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm8',
        jornada: 8,
        local: 'Sera FC',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'domingo',
        fecha: '13 dic',
        fecha_iso: '2026-12-13',
        hora: '09:00',
        campo: 'Fco Vilaplana Mariel A',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm9',
        jornada: 9,
        local: 'Nottingham Por',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'domingo',
        fecha: '10 ene',
        fecha_iso: '2027-01-10',
        hora: '09:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm10',
        jornada: 10,
        local: 'Rayo Pelón FC',
        visitante: '131 Town FC',
        dia_semana: 'domingo',
        fecha: '17 ene',
        fecha_iso: '2027-01-17',
        hora: '10:00',
        campo: 'Climent B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm11',
        jornada: 11,
        local: 'Viejentus',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'domingo',
        fecha: '24 ene',
        fecha_iso: '2027-01-24',
        hora: '09:00',
        campo: 'Fco Vilaplana Mariel A',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm12',
        jornada: 12,
        local: 'Deceroacien FC',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'domingo',
        fecha: '31 ene',
        fecha_iso: '2027-01-31',
        hora: '09:00',
        campo: 'Climent B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm13',
        jornada: 13,
        local: 'Rayo Pelón FC',
        visitante: 'JM.S FC',
        dia_semana: 'domingo',
        fecha: '7 feb',
        fecha_iso: '2027-02-07',
        hora: '10:00',
        campo: 'Climent A',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm14',
        jornada: 14,
        local: 'Aston Birra FC',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'domingo',
        fecha: '21 feb',
        fecha_iso: '2027-02-21',
        hora: '10:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm15',
        jornada: 15,
        local: 'Rayo Pelón FC',
        visitante: 'Glorios',
        dia_semana: 'domingo',
        fecha: '28 feb',
        fecha_iso: '2027-02-28',
        hora: '10:00',
        campo: 'Climent A',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm16',
        jornada: 16,
        local: 'Bankales FC',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'viernes',
        fecha: '5 mar',
        fecha_iso: '2027-03-05',
        hora: '21:00',
        campo: 'Fco Vilaplana Mariel A',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm17',
        jornada: 17,
        local: 'Rayo Pelón FC',
        visitante: 'Ultimate',
        dia_semana: 'domingo',
        fecha: '14 mar',
        fecha_iso: '2027-03-14',
        hora: '09:00',
        campo: 'Climent A',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm18',
        jornada: 18,
        local: 'Royal Academy',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'viernes',
        fecha: '2 abr',
        fecha_iso: '2027-04-02',
        hora: '22:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm19',
        jornada: 19,
        local: 'Rayo Pelón FC',
        visitante: 'Sera FC',
        dia_semana: 'domingo',
        fecha: '11 abr',
        fecha_iso: '2027-04-11',
        hora: '09:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm20',
        jornada: 20,
        local: 'Rayo Pelón FC',
        visitante: 'Nottingham Por',
        dia_semana: 'domingo',
        fecha: '18 abr',
        fecha_iso: '2027-04-18',
        hora: '09:00',
        campo: 'Fco Vilaplana Mariel A',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm21',
        jornada: 21,
        local: '131 Town FC',
        visitante: 'Rayo Pelón FC',
        dia_semana: 'viernes',
        fecha: '30 abr',
        fecha_iso: '2027-04-30',
        hora: '21:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    },
    {
        id: 'm22',
        jornada: 22,
        local: 'Rayo Pelón FC',
        visitante: 'Viejentus',
        dia_semana: 'domingo',
        fecha: '16 may',
        fecha_iso: '2027-05-16',
        hora: '09:00',
        campo: 'Fco Vilaplana Mariel B',
        jugado: false,
        golesLocal: null,
        golesVisitante: null,
        notas: ''
    }
];
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
    mediaType: 'video', // 'video' | 'carousel'
    videoSourceType: 'url', // 'upload' | 'youtube' | 'url'
    videoUrl: '', // url or youtube link
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
    {
        id: 'fg1',
        type: 'foto',
        title: 'Euforia en la grada tras el gol de la victoria',
        tag: 'J13 vs Ibense',
        category: 'celebraciones',
        date: '18 Nov 2024',
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        description: 'La afición del Rayo Pelón se volcó bajo los focos de Ibi en el tramo final del encuentro.'
    },
    {
        id: 'fg2',
        type: 'foto',
        title: 'Disputa aérea en el corazón del área',
        tag: 'J13 vs Ibense',
        category: 'partidos',
        date: '18 Nov 2024',
        imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
        description: 'Samu "Káiser" imponiendo su ley aérea ante el delantero rival.'
    },
    {
        id: 'fg3',
        type: 'foto',
        title: 'Piña de equipo antes del pitido inicial',
        tag: 'Espíritu de Club',
        category: 'vestuario',
        date: '18 Nov 2024',
        imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80',
        description: 'Concentración absoluta y conjura de la plantilla para asegurar los tres puntos.'
    },
    {
        id: 'fg4',
        type: 'foto',
        title: 'Carlos "El Chino" ejecutando la falta magistral',
        tag: 'Momento Clave',
        category: 'partidos',
        date: '18 Nov 2024',
        imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
        description: 'Instante exacto del impacto del balón que acabó alojándose en la escuadra.'
    },
    {
        id: 'fg5',
        type: 'foto',
        title: 'Celebración del hat-trick con dedicatoria especial',
        tag: 'Dani Pérez #9',
        category: 'celebraciones',
        date: '18 Nov 2024',
        imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80',
        description: 'Dani señalando el escudo ante los seguidores congregados en el campo 1.'
    },
    {
        id: 'fg6',
        type: 'foto',
        title: 'Calentamiento de intensidad previa al partido',
        tag: 'Sesión Nocturna',
        category: 'entrenos',
        date: '15 Nov 2024',
        imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80',
        description: 'Activación muscular y rondos a alta velocidad en el Polideportivo de Ibi.'
    },
    {
        id: 'fg7',
        type: 'foto',
        title: 'Marc "El Gato" volando hacia la cruceta',
        tag: 'Zamora en Acción',
        category: 'partidos',
        date: '11 Nov 2024',
        imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
        description: 'Estirada fotogénica de nuestro portero titular salvando un disparo a bocajarro.'
    },
    {
        id: 'fg8',
        type: 'foto',
        title: 'Alegría en el vestuario tras la victoria',
        tag: 'Tercer Tiempo',
        category: 'vestuario',
        date: '18 Nov 2024',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
        description: 'Cánticos y piña de todo el equipo celebrando el 2º puesto en solitario.'
    }
];
export const DEFAULT_CLIPS = [
    {
        id: 'c1',
        type: 'video',
        title: 'Falta directa a la escuadra de "El Chino"',
        tag: 'GOLAZO DEL MES',
        description: 'Golazo elegido por la organización de la Liga Plata como el mejor gol de la Jornada 13.',
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        sourceType: 'youtube',
        duration: '00:45',
        match: 'J13 vs Ibense CF',
        views: '2.4K views'
    },
    {
        id: 'c2',
        type: 'video',
        title: 'Doble parada salvadora de Marc "El Gato"',
        tag: 'PARADÓN DE LA JORNADA',
        description: 'Mano a mano a quemarropa y reacción instantánea para despejar sobre la misma línea de gol.',
        imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
        videoUrl: '',
        sourceType: 'url',
        duration: '00:38',
        match: 'J13 vs Ibense CF',
        views: '1.9K views'
    },
    {
        id: 'c3',
        type: 'video',
        title: 'El Hat-trick de Dani Pérez con sus 3 definiciones',
        tag: 'RECITADO GOLEADOR',
        description: 'Los tres tantos de nuestro pichichi: disparo cruzado, testarazo y recorte de lujo.',
        imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80',
        videoUrl: '',
        sourceType: 'url',
        duration: '01:25',
        match: 'J13 vs Ibense CF',
        views: '3.1K views'
    },
    {
        id: 'c4',
        type: 'video',
        title: 'Sprint de 40 metros y vaselina de Álex "Galgo"',
        tag: 'VELOCIDAD PURA',
        description: 'Contragolpe letal conducido a más de 30 km/h finalizado con una sutil vaselina.',
        imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
        videoUrl: '',
        sourceType: 'url',
        duration: '00:52',
        match: 'J11 vs Penya La Foia',
        views: '1.6K views'
    },
    {
        id: 'c5',
        type: 'video',
        title: 'Recital de regates de Raúl "El Mago" en una baldosa',
        tag: 'CALIDAD F7',
        description: 'Ruleta marsellesa y caño en banda para habilitar el centro del gol.',
        imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
        videoUrl: '',
        sourceType: 'url',
        duration: '00:40',
        match: 'J12 vs Sporting Foia',
        views: '2.1K views'
    }
];
export const DEFAULT_NEWS = [
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
        content: `Tras las exploraciones ecográficas y pruebas diagnósticas realizadas en la mañana de ayer a nuestro jugador Álex López ("Galgo"), los servicios médicos del club emiten el siguiente informe oficial:

1. Diagnóstico Clínico: Esguince de grado 1 en el ligamento lateral externo del tobillo derecho, producido durante una disputa fortuita de balón en el último entrenamiento preparatorio.

2. Tratamiento y Readaptación: El futbolista ha comenzado sesiones intensivas de fisioterapia, crioterapia y readaptación funcional con el equipo médico del club. Se descarta cualquier tipo de afectación ósea o rotura ligamentosa de mayor gravedad.

3. Plazos de recuperación y Estado Competitivo: Se prevé un período de readaptación de 5 a 7 días. El cuerpo técnico y los servicios médicos valorarán su inclusión en la convocatoria en el entrenamiento previo al trascendental debut de la Jornada 1 frente a Deceroacien FC.

El club agradece el interés y las muestras de apoyo recibidas por la afición y desea a Álex una pronta y plena vuelta a los terrenos de juego.`,
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
        content: `El Rayo Pelón F7 ha puesto el punto final a su pretemporada 2026 con sensaciones inmejorables. Sobre el césped del Polideportivo Municipal de Ibi, el equipo dirigido por el cuerpo técnico mostró una intensidad asfixiante y un juego asociativo de muchos quilates.

Los ensayos tácticos han servido para acoplar a las nuevas incorporaciones con la columna vertebral del vestuario. El ritmo de balón en transiciones rápidas y la contundencia en los balones parados auguran una temporada ilusionante para toda la familia del Rayo.

El vestuario ya cuenta los días para el estreno oficial en la Jornada 1 frente a Deceroacien FC en el campo Climent B. ¡Que empiece a rodar el balón!`
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
        content: `La Junta Directiva del Rayo Pelón F7 hace pública la apertura oficial de la campaña de patrocinio comarcal para la temporada deportiva 2026/2027.

Bajo el lema "Sentimiento, Garra y Rayo", el club pone a disposición de las empresas y comercios de la Foia de Castalla diferentes modalidades de patrocinio: presencia en las equipaciones oficiales de juego, visibilidad preferente en el portal web y redes sociales del club, y menciones en las crónicas de cada jornada.

Las empresas interesadas pueden ponerse en contacto con la directiva a través del formulario de contacto oficial o vía correo electrónico en contacto@rayopelonf7.es.`
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
        content: `La dirección deportiva del Rayo Pelón F7 confirma que la plantilla para la temporada 2026/2027 queda cerrada con 17 futbolistas inscritos para disputar la Liga Plata de Ibi.

Un bloque equilibrado que combina experiencia, velocidad en bandas y contundencia defensiva. El cuerpo técnico ha destacado el compromiso absoluto de todos los integrantes durante las semanas de preparación estival.

La plantilla completa ya está disponible para su consulta interactiva con fichas de atributos y estadísticas individuales en la sección oficial de Plantilla.`
    }
];
export const INITIAL_NEWS = DEFAULT_NEWS;
const INITIAL_DATA = {
    clubInfo: {
        name: 'Rayo Pelón F7',
        league: 'Liga Plata Ibi F7 • Liga Comarcal',
        season: 'Temporada 2026/27',
        stadium: 'Complejo Deportivo Estadio Climent',
        address: 'Calle Jaén s/n, 03440 Ibi (Alicante)',
        email: 'danicortesmoreno@gmail.com',
        emailAlt: 'contacto@rayopelonf7.es',
        phone: '+34 601 43 84 41',
        schedule: 'Partidos: Viernes 21h/22h o Domingos 9h/10h • Sesión táctica: Miércoles 22h',
        mapsUrl: 'https://maps.app.goo.gl/YYMSsMhEYBnnL2wH9',
        instagram: 'https://www.instagram.com/rayopelonsv/',
        instagramHandle: '@rayopelonsv'
    },
    matchCenter: computeMatchCenter(INITIAL_MATCHES),
    players: [
        {
            id: 'p1',
            name: 'Albert Pons',
            nickname: 'Albert Pons',
            number: 5,
            position: 'DEF',
            age: 27,
            avatarInitials: 'AP',
            rating: 80,
            roleDescription: 'Seguridad atrás',
            attributes: { defensa: 80, fisico: 80, ritmo: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: true
        },
        {
            id: 'p2',
            name: 'Rafael Muñoz',
            nickname: 'Felo',
            number: 7,
            position: 'DEF',
            age: 23,
            avatarInitials: 'RM',
            rating: 80,
            roleDescription: '+80kg de puro musculo rovellao',
            attributes: { defensa: 80, fisico: 80, ritmo: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: true
        },
        {
            id: 'p3',
            name: 'Sergio Requena',
            nickname: 'El Mosquito',
            number: 8,
            position: 'DEL',
            age: 23,
            avatarInitials: 'SR',
            rating: 80,
            roleDescription: 'Que rico se mueve con esa zurdita',
            attributes: { ritmo: 80, regate: 80, tiro: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: true
        },
        {
            id: 'p4',
            name: 'Javier Campuzano',
            nickname: 'El Gabo',
            number: 9,
            position: 'DEL',
            age: 23,
            avatarInitials: 'JC',
            rating: 80,
            roleDescription: 'El Anti Nine',
            attributes: { ritmo: 80, regate: 80, tiro: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: true
        },
        {
            id: 'p5',
            name: 'Adrià Callado',
            nickname: 'Silenciao',
            number: 10,
            position: 'POR',
            age: 23,
            avatarInitials: 'AC',
            rating: 80,
            roleDescription: 'Nalgón pero ágil bajo palos',
            attributes: { reflejos: 80, estirada: 80, saque: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, penaltiesSaved: '0 / 0', mvpCount: 0 },
            status: 'Apto',
            featured: true
        },
        {
            id: 'p6',
            name: 'Pablo Martínez',
            nickname: 'Shiquitoo',
            number: 11,
            position: 'DEL',
            age: 22,
            avatarInitials: 'PM',
            rating: 80,
            roleDescription: 'No la suelta pero es medio bueno',
            attributes: { ritmo: 80, regate: 80, tiro: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'En duda',
            statusDetail: 'Tobillo',
            featured: true
        },
        {
            id: 'p7',
            name: 'Aarón Bravo',
            nickname: 'El Kaiser',
            number: 13,
            position: 'DEF',
            age: 25,
            avatarInitials: 'AB',
            rating: 80,
            roleDescription: 'El Kaiser',
            attributes: { defensa: 80, fisico: 80, ritmo: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p8',
            name: 'Julen Rosauro',
            nickname: 'Julen Rosauro',
            number: 14,
            position: 'DEL',
            age: 27,
            avatarInitials: 'JR',
            rating: 80,
            roleDescription: 'Veteranía en el gol',
            attributes: { ritmo: 80, regate: 80, tiro: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p9',
            name: 'Hamudí Hamudi',
            nickname: 'Hamudi',
            number: 15,
            position: 'MED',
            age: 25,
            avatarInitials: 'HH',
            rating: 80,
            roleDescription: 'Definición nativa de carrilero',
            attributes: { ritmo: 80, pase: 80, fisico: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p10',
            name: 'Mauro Amorós',
            nickname: 'Gordinbabuer',
            number: 17,
            position: 'DEF',
            age: 26,
            avatarInitials: 'MA',
            rating: 80,
            roleDescription: 'Polivalencia sobre el campo',
            attributes: { defensa: 80, fisico: 80, ritmo: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p11',
            name: 'Iven Vicens',
            nickname: 'Magician',
            number: 18,
            position: 'MED',
            age: 20,
            avatarInitials: 'IV',
            rating: 80,
            roleDescription: 'El cerebro del campo',
            attributes: { ritmo: 80, pase: 80, fisico: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p12',
            name: 'Jonathan Martínez',
            nickname: 'Jona',
            number: 22,
            position: 'MED',
            age: 22,
            avatarInitials: 'JM',
            rating: 80,
            roleDescription: 'Todoterreno nato',
            attributes: { ritmo: 80, pase: 80, fisico: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p13',
            name: 'Jorge Ríos',
            nickname: 'Ríos',
            number: 23,
            position: 'MED',
            age: 24,
            avatarInitials: 'JR',
            rating: 80,
            roleDescription: 'El pulmones de obsidiana',
            attributes: { ritmo: 80, pase: 80, fisico: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p14',
            name: 'Daniel Cortés',
            nickname: 'Dani',
            number: 29,
            position: 'DEF',
            age: 23,
            avatarInitials: 'DC',
            rating: 80,
            roleDescription: 'Llegada al área sin gol',
            attributes: { defensa: 80, fisico: 80, ritmo: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p15',
            name: 'Martín Escrivá',
            nickname: 'Martínx',
            number: 67,
            position: 'MED',
            age: 22,
            avatarInitials: 'ME',
            photoUrl: '/players/martin-escriva.png',
            rating: 80,
            roleDescription: 'No sabe ni de que juega pero juega de todo',
            attributes: { ritmo: 80, pase: 80, fisico: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p16',
            name: 'Sinuhé Moreno',
            nickname: 'Sinu',
            number: 69,
            position: 'MED',
            age: 21,
            avatarInitials: 'SM',
            photoUrl: '/players/sinuhe-moreno.png',
            rating: 80,
            roleDescription: 'El expresso de Jumilla',
            attributes: { ritmo: 80, pase: 80, fisico: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        },
        {
            id: 'p17',
            name: 'Adolfo Sebastián Saldaña',
            nickname: 'Cuntti',
            number: 69,
            position: 'DEF',
            age: 24,
            avatarInitials: 'AS',
            rating: 80,
            roleDescription: 'La locomotora de la zaga',
            attributes: { defensa: 80, fisico: 80, ritmo: 80 },
            seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
            status: 'Apto',
            featured: false
        }
    ],
    standings: [
        { position: 1, teamCode: 'SF', teamName: 'Sporting Foia de Castalla', isRayo: false, matchesPlayed: 13, won: 10, drawn: 2, lost: 1, goalsFor: 48, goalsAgainst: 19, goalDifference: 29, points: 32, form: ['V', 'V', 'E'] },
        { position: 2, teamCode: 'RP', teamName: 'RAYO PELÓN F7', isRayo: true, matchesPlayed: 13, won: 9, drawn: 2, lost: 2, goalsFor: 45, goalsAgainst: 21, goalDifference: 24, points: 29, form: ['V', 'V', 'V'] },
        { position: 3, teamCode: 'GI', teamName: 'Los Galácticos Ibi', isRayo: false, matchesPlayed: 13, won: 8, drawn: 2, lost: 3, goalsFor: 39, goalsAgainst: 24, goalDifference: 15, points: 26, form: ['D', 'V', 'E'] },
        { position: 4, teamCode: 'PF', teamName: 'Penya La Foia', isRayo: false, matchesPlayed: 13, won: 7, drawn: 3, lost: 3, goalsFor: 34, goalsAgainst: 22, goalDifference: 12, points: 24, form: ['V', 'E', 'V'] },
        { position: 5, teamCode: 'IB', teamName: 'Ibense CF Veteranos', isRayo: false, matchesPlayed: 13, won: 5, drawn: 1, lost: 7, goalsFor: 28, goalsAgainst: 33, goalDifference: -5, points: 16, form: ['D', 'D', 'V'] }
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
    static mysqlPool = null;
    static isMysqlConnected = false;
    static memoryCache = null;
    static ensureDataDir() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        // Si no existe club_storage.json, migrar desde db.json o inicializar con INITIAL_DATA
        if (!fs.existsSync(STORAGE_FILE)) {
            if (fs.existsSync(LEGACY_DB_FILE)) {
                try {
                    const legacyContent = fs.readFileSync(LEGACY_DB_FILE, 'utf-8');
                    fs.writeFileSync(STORAGE_FILE, legacyContent, 'utf-8');
                }
                catch {
                    fs.writeFileSync(STORAGE_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
                }
            }
            else {
                fs.writeFileSync(STORAGE_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
            }
        }
    }
    static validateAndEnrich(data) {
        let dirty = false;
        if (!data.matches || !Array.isArray(data.matches) || data.matches.length === 0) {
            data.matches = INITIAL_MATCHES;
            dirty = true;
        }
        data.matchCenter = computeMatchCenter(data.matches);
        if (!data.players || !Array.isArray(data.players) || data.players.length === 0) {
            data.players = INITIAL_DATA.players;
            dirty = true;
        }
        if (!data.featuredMatch) {
            data.featuredMatch = DEFAULT_FEATURED_MATCH;
            dirty = true;
        }
        if (!data.gallery || !Array.isArray(data.gallery)) {
            data.gallery = DEFAULT_GALLERY;
            dirty = true;
        }
        if (!data.clips || !Array.isArray(data.clips)) {
            data.clips = DEFAULT_CLIPS;
            dirty = true;
        }
        if (!data.news || !Array.isArray(data.news)) {
            data.news = DEFAULT_NEWS;
            dirty = true;
        }
        if (!data.auditLogs || !Array.isArray(data.auditLogs)) {
            data.auditLogs = [];
            dirty = true;
        }
        if (!data.users || !Array.isArray(data.users) || data.users.length === 0) {
            data.users = getInitialUsers();
            dirty = true;
        }
        else {
            const hasDani = data.users.some(u => u.username.toLowerCase() === 'dani');
            if (!hasDani) {
                data.users.unshift(getInitialUsers()[0]);
                dirty = true;
            }
        }
        return dirty;
    }
    static readFromDisk() {
        this.ensureDataDir();
        try {
            let content = '';
            if (fs.existsSync(STORAGE_FILE)) {
                content = fs.readFileSync(STORAGE_FILE, 'utf-8');
            }
            else if (fs.existsSync(STORAGE_BAK_FILE)) {
                content = fs.readFileSync(STORAGE_BAK_FILE, 'utf-8');
            }
            else if (fs.existsSync(LEGACY_DB_FILE)) {
                content = fs.readFileSync(LEGACY_DB_FILE, 'utf-8');
            }
            if (!content || !content.trim()) {
                throw new Error('Archivo de base de datos vacío');
            }
            const data = JSON.parse(content);
            const dirty = this.validateAndEnrich(data);
            if (dirty) {
                this.writeToDisk(data);
            }
            return data;
        }
        catch (err) {
            console.warn('[Database] Advertencia al leer datos en disco, buscando copia de seguridad:', err);
            if (fs.existsSync(STORAGE_BAK_FILE)) {
                try {
                    const bakContent = fs.readFileSync(STORAGE_BAK_FILE, 'utf-8');
                    const data = JSON.parse(bakContent);
                    this.validateAndEnrich(data);
                    return data;
                }
                catch { }
            }
            return INITIAL_DATA;
        }
    }
    static writeToDisk(data) {
        this.ensureDataDir();
        const serialized = JSON.stringify(data, null, 2);
        // 1. Guardar copia previa como respaldo
        if (fs.existsSync(STORAGE_FILE)) {
            try {
                fs.copyFileSync(STORAGE_FILE, STORAGE_BAK_FILE);
            }
            catch { }
        }
        // 2. Escritura atómica para evitar corrupción ante interrupciones
        const tempFile = `${STORAGE_FILE}.tmp_${Date.now()}`;
        fs.writeFileSync(tempFile, serialized, 'utf-8');
        fs.renameSync(tempFile, STORAGE_FILE);
    }
    static async init() {
        this.ensureDataDir();
        // 1. Cargar lo que tengamos en disco primero como base
        const diskData = this.readFromDisk();
        this.memoryCache = diskData;
        // 2. Extraer configuración de conexión MySQL
        const host = process.env.DB_HOST;
        const user = process.env.DB_USER;
        const password = process.env.DB_PASSWORD;
        const database = process.env.DB_NAME;
        const port = Number(process.env.DB_PORT) || 3306;
        if (!user || !database) {
            console.log('[Database] ℹ Sin credenciales MySQL configuradas (DB_USER o DB_NAME no detectadas). Operando en modo local (JSON).');
            return;
        }
        const effectiveHost = host === 'localhost' ? '127.0.0.1' : (host || '127.0.0.1');
        console.log(`[Database] 🔄 Conectando a MySQL Hostinger (${effectiveHost}:${port}, BD: ${database}, Usuario: ${user})...`);
        try {
            this.mysqlPool = mysql.createPool({
                host: effectiveHost,
                user,
                password: password || '',
                database,
                port,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                connectTimeout: 15000,
                enableKeepAlive: true,
                keepAliveInitialDelay: 10000
            });
            // Verificar conectividad inmediata
            const conn = await this.mysqlPool.getConnection();
            console.log('[Database] ✓ Conexión establecida con éxito con el servidor MySQL de Hostinger.');
            conn.release();
            // Crear tabla permanente si no existe
            await this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS club_storage (
          id VARCHAR(50) PRIMARY KEY,
          data LONGTEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
            // Consultar si ya hay datos previos persistidos en MySQL
            const [rows] = await this.mysqlPool.query('SELECT data FROM club_storage WHERE id = ?', ['main_club_data']);
            if (rows && rows.length > 0 && rows[0].data) {
                try {
                    const parsed = JSON.parse(rows[0].data);
                    this.validateAndEnrich(parsed);
                    this.memoryCache = parsed;
                    this.writeToDisk(parsed); // Mantener sincronizada copia local
                    this.isMysqlConnected = true;
                    console.log('[Database] ★ EXCELENTE: Datos del club recuperados íntegramente desde MySQL de Hostinger.');
                    console.log(`[Database] (Jugadores: ${parsed.players?.length || 0}, Noticias: ${parsed.news?.length || 0}, Usuarios: ${parsed.users?.length || 0})`);
                    return;
                }
                catch (parseErr) {
                    console.warn('[Database] Advertencia al parsear datos de MySQL, usando datos locales:', parseErr);
                }
            }
            // Si la tabla MySQL estaba vacía (primer arranque con la base de datos recién creada)
            console.log('[Database] Inicializando tabla MySQL con los datos actuales del club...');
            await this.mysqlPool.query('INSERT INTO club_storage (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)', ['main_club_data', JSON.stringify(diskData)]);
            this.isMysqlConnected = true;
            console.log('[Database] ✓ Base de datos MySQL guardada y sincronizada correctamente. Los datos ahora son 100% permanentes ante futuros git push.');
        }
        catch (err) {
            console.error('[Database] ⚠️ Error conectando a MySQL de Hostinger:', err?.message || err);
            // Reintento con localhost si 127.0.0.1 falló
            if (effectiveHost === '127.0.0.1') {
                try {
                    console.log('[Database] Probando alternativa con host "localhost"...');
                    this.mysqlPool = mysql.createPool({
                        host: 'localhost',
                        user,
                        password: password || '',
                        database,
                        port,
                        waitForConnections: true,
                        connectionLimit: 10,
                        connectTimeout: 15000
                    });
                    const conn = await this.mysqlPool.getConnection();
                    console.log('[Database] ✓ Conexión establecida con localhost.');
                    conn.release();
                    await this.mysqlPool.query(`
            CREATE TABLE IF NOT EXISTS club_storage (
              id VARCHAR(50) PRIMARY KEY,
              data LONGTEXT NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `);
                    const [rows] = await this.mysqlPool.query('SELECT data FROM club_storage WHERE id = ?', ['main_club_data']);
                    if (rows && rows.length > 0 && rows[0].data) {
                        const parsed = JSON.parse(rows[0].data);
                        this.validateAndEnrich(parsed);
                        this.memoryCache = parsed;
                        this.writeToDisk(parsed);
                        this.isMysqlConnected = true;
                        console.log('[Database] ★ EXCELENTE: Datos cargados desde MySQL (localhost).');
                        return;
                    }
                    else {
                        await this.mysqlPool.query('INSERT INTO club_storage (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)', ['main_club_data', JSON.stringify(diskData)]);
                        this.isMysqlConnected = true;
                        console.log('[Database] ✓ MySQL inicializado vía localhost.');
                        return;
                    }
                }
                catch { }
            }
            console.warn('[Database] Continuando en modo fallback local (JSON).');
            this.isMysqlConnected = false;
        }
    }
    static read() {
        if (this.memoryCache) {
            return this.memoryCache;
        }
        const data = this.readFromDisk();
        this.memoryCache = data;
        return data;
    }
    static write(data) {
        // 1. Actualizar memoria inmediatamente para lecturas síncronas
        this.memoryCache = data;
        // 2. Guardar copia local atómicamente
        try {
            this.writeToDisk(data);
        }
        catch (diskErr) {
            console.warn('[Database] Error guardando archivo local:', diskErr);
        }
        // 3. Persistir de forma asíncrona a MySQL si está conectado
        if (this.isMysqlConnected && this.mysqlPool) {
            const serialized = JSON.stringify(data);
            this.mysqlPool.query('INSERT INTO club_storage (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)', ['main_club_data', serialized]).catch((sqlErr) => {
                console.error('[Database] Error al persistir en MySQL:', sqlErr?.message || sqlErr);
            });
        }
    }
    static getStatus() {
        return {
            isMysql: this.isMysqlConnected,
            host: process.env.DB_HOST || '127.0.0.1',
            database: process.env.DB_NAME || 'local_json'
        };
    }
}
