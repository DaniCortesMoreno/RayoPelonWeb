import type { Player, StandingTeam, NewsArticle, MediaItem, Sponsor, FaqItem, SponsorshipTier, KitItem, SeasonMatch } from '../types';

export const CLUB_INFO = {
  name: 'Rayo Pelón F7',
  badgeUrl: '/escudo.png',
  heroBgUrl: '/hero-team.jpg',
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
  instagramHandle: '@rayopelonsv',
  slogan: 'Sentimiento, Garra y Rayo',
  description: 'La pasión del fútbol 7 sobre el césped de Ibi. Humildad en el vestuario, velocidad de rayo en el campo y orgullo en cada disputa de balón.'
};

export const MATCH_CENTER_DATA = {
  lastMatch: {
    matchday: 0,
    homeTeam: 'RAYO PELÓN',
    awayTeam: '',
    score: 'PRETEMPORADA',
    notes: '',
    statusText: 'ÚLTIMA JORNADA (J0)'
  },
  nextMatch: {
    matchday: 1,
    homeTeam: 'RAYO PELÓN FC',
    awayTeam: 'DECEROACIEN FC',
    location: 'Climent B',
    dayTime: 'Domingo 10:00h',
    statusText: 'PRÓXIMO COMPROMISO (J1)',
    countdown: '8d 21h',
    fechaIso: '2026-10-04',
    hora: '10:00',
    campo: 'Climent B',
    diaSemana: 'domingo',
    fecha: '4 oct'
  }
};

export const SEASON_MATCHES: SeasonMatch[] = [
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

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Albert Pons',
    nickname: 'Albert Pons',
    number: 5,
    position: 'DEF',
    age: 27,
    avatarInitials: 'AP',
    avatarColorGradient: 'from-amber-400 to-amber-200',
    photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-cyan-400 to-blue-400',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-amber-600 to-amber-400',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-emerald-500 to-emerald-300',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-blue-600 to-indigo-400',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-rose-500 to-orange-400',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-emerald-600 to-teal-400',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-slate-500 to-zinc-400',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-purple-500 to-pink-400',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-red-600 to-amber-500',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-indigo-600 to-violet-400',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-teal-600 to-cyan-400',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-blue-600 to-sky-400',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-orange-500 to-amber-400',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
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
    avatarColorGradient: 'from-yellow-500 to-amber-300',
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
    avatarColorGradient: 'from-emerald-500 to-lime-400',
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
    avatarColorGradient: 'from-rose-600 to-red-400',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    rating: 80,
    roleDescription: 'La locomotora de la zaga',
    attributes: { defensa: 80, fisico: 80, ritmo: 80 },
    seasonStats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvpCount: 0 },
    status: 'Apto',
    featured: false
  }
];

export const STANDINGS_DATA: StandingTeam[] = [
  {
    position: 1,
    teamCode: '13',
    teamName: '131 Town FC',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/241ef212-e851-4cd8-b555-00ae49244f75.webp'
  },
  {
    position: 2,
    teamCode: 'AB',
    teamName: 'Aston Birra FC',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/9431a3e0-6d49-4217-a008-052cfe3010ed.webp'
  },
  {
    position: 3,
    teamCode: 'BA',
    teamName: 'Bankales FC',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/77b47507-ecab-47e2-8de3-6dffe455c33d.webp'
  },
  {
    position: 4,
    teamCode: 'DE',
    teamName: 'Deceroacien FC',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/0973e847-5017-40bf-9cca-bc6a2dda77a8.webp'
  },
  {
    position: 5,
    teamCode: 'GL',
    teamName: 'Glorios',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/06f6a87b-baa2-4b10-a041-499f3ec2a3d6.webp'
  },
  {
    position: 6,
    teamCode: 'JM',
    teamName: 'JM.S FC',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/cbe3be5a-072b-4e00-bef7-f68adf39807f.webp'
  },
  {
    position: 7,
    teamCode: 'NP',
    teamName: 'Nottingham Por',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/d7e520cc-e154-42d6-a1eb-157f79c161d8.webp'
  },
  {
    position: 8,
    teamCode: 'RP',
    teamName: 'Rayo Pelón FC',
    isRayo: true,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'V'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/807d5522-2aa5-4264-b9eb-af286eac1055.webp'
  },
  {
    position: 9,
    teamCode: 'RA',
    teamName: 'Royal Academy',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/527e7e62-bdde-4607-9d9d-1c2ed45a8f09.webp'
  },
  {
    position: 10,
    teamCode: 'SE',
    teamName: 'Sera FC',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/a576807c-124e-4d64-afdd-ea825d12ec38.webp'
  },
  {
    position: 11,
    teamCode: 'UL',
    teamName: 'Ultimate',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/f8bd4e73-33c1-42af-a91b-6735bc094a88.webp'
  },
  {
    position: 12,
    teamCode: 'VI',
    teamName: 'Viejentus',
    isRayo: false,
    matchesPlayed: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: ['V', 'V', 'E'],
    badgeUrl: 'https://ligacomarcal.com/api/media/public/escudo/2026/c6452596-d6f5-4e4e-a552-6684522c033c.webp'
  }
];

export const NEWS_DATA: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Parte médico oficial: Evolución del tobillo de Álex "Galgo" para la Jornada 14',
    category: 'MEDICO',
    categoryLabel: 'PARTE MÉDICO OFICIAL',
    dateText: 'Hace 2 días',
    publishedAt: '20 de Noviembre, 2024',
    readTime: '3 min',
    featured: true,
    author: 'Servicios Médicos Rayo Pelón',
    authorRole: 'Cuerpo Médico & Fisioterapia',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'Tras las exploraciones ecográficas realizadas en la mañana de ayer, se descarta rotura ósea y se confirma un esguince leve de grado 1 en el ligamento lateral externo del tobillo derecho.',
    content: `Tras las exploraciones ecográficas y pruebas diagnósticas realizadas en la mañana de ayer a nuestro jugador Álex López ("Galgo"), los servicios médicos del club emiten el siguiente informe:

1. Diagnóstico: Esguince de grado 1 en el ligamento lateral externo del tobillo derecho, producido durante una disputa fortuita de balón en el minuto 41 del último encuentro liguero frente al Ibense CF.

2. Tratamiento: El futbolista ha comenzado sesiones intensivas de fisioterapia, crioterapia y readaptación funcional con el fisioterapeuta del club. Se descarta cualquier tipo de afectación ósea o rotura de mayor gravedad.

3. Plazos de recuperación: Se prevé un período de readaptación de 5 a 7 días. El cuerpo técnico y los servicios médicos valorarán su inclusión en la convocatoria en el entrenamiento del viernes previo al trascendental choque de la Jornada 14 frente a Los Galácticos de Ibi.

El club agradece el interés y las muestras de apoyo recibidas por la afición y desea a Álex una pronta vuelta a los terrenos de juego.`,
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
    title: 'Exhibición goleadora y remontada épica (4-2) ante el Ibense en el Polideportivo',
    category: 'CRONICA',
    categoryLabel: 'CRÓNICA DE PARTIDO',
    dateText: 'Hace 4 días',
    publishedAt: '18 de Noviembre, 2024',
    readTime: '4 min',
    featured: false,
    author: 'Gabinete de Prensa',
    authorRole: 'Crónicas y Comunicación Deportiva',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'Un segundo tiempo memorable liderado por el hat-trick del \'9\' Dani Pérez y un golazo de falta directa de Carlos "El Chino" desató la euforia en la grada del Polideportivo.',
    content: `Noche mágica de fútbol 7 en el Campo 1 del Polideportivo Municipal de Ibi. El Rayo Pelón F7 firmó una de sus actuaciones más completas y vibrantes de la temporada tras imponerse por 4-2 al siempre correoso Ibense CF Veteranos.

El choque arrancó con un ritmo electrizante. A los doce minutos, una triangulación rápida entre Raúl "El Mago" y Carlos "El Chino" habilitó a Dani Pérez, quien batió al guardameta rival con un zurdazo inapelable (1-0). Poco después, el propio Chino colocó una falta directa en la escuadra desde más de 20 metros para poner el 2-0.

A pesar de la reacción del Ibense antes del descanso, el Rayo mantuvo la cabeza fría y el rigor defensivo con un imperial Samu Moreno cortando todos los balones aéreos. En la segunda mitad, el recital de Dani Pérez certificó su hat-trick con dos goles de delantero puro: uno de cabeza a centro medido de Javi Verdú y otro tras una contra vertiginosa.

Con este triunfo, el Rayo Pelón F7 afianza la 2ª posición de la Liga Plata con 29 puntos, acechando a solo 3 del liderato antes de la decisiva Jornada 14.`
  },
  {
    id: 'n3',
    title: 'Apertura del plazo para patrocinadores comarcales y empresas colaboradoras 2027',
    category: 'OFICIAL',
    categoryLabel: 'COMUNICADO OFICIAL',
    dateText: 'Hace 1 semana',
    publishedAt: '14 de Noviembre, 2024',
    readTime: '3 min',
    featured: false,
    author: 'Junta Directiva',
    authorRole: 'Área de Relaciones Institucionales y Patrocinios',
    imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'La junta directiva de Rayo Pelón F7 abre el programa de esponsorización para empresas de Ibi, Castalla, Onil y comarca de cara a la segunda vuelta y la fase de copa.',
    content: `La Junta Directiva del club de fútbol 7 Rayo Pelón informa formalmente a todos los comercios, talleres, pymes y entidades empresariales de la Foia de Castalla de la apertura del programa de patrocinio deportivo para el segundo tramo de la temporada 2026/2027.

Modalidades de colaboración disponibles:
1. Patrocinio de Equipación Oficial: Presencia de marca en frontal, manga o dorsal de las dos equipaciones oficiales (Blanco Tiza y Azul Profundo).
2. Patrocinador Digital: Mención y banner destacado en la web oficial, resúmenes multimedia y publicaciones de redes sociales con alcance comarcal.
3. Colaborador Deportivo: Aportación de material deportivo, hidratación o servicios para el cuerpo técnico y plantilla.

Todas las propuestas interesadas pueden contactar directamente con el departamento de relaciones institucionales a través de contacto@rayopelonf7.es o rellenando el formulario oficial de patrocinios en la web.`
  },
  {
    id: 'n4',
    title: 'Modificación de horarios en los entrenamientos nocturnos en el Polideportivo',
    category: 'NOVEDAD',
    categoryLabel: 'NOVEDAD DEL CLUB',
    dateText: 'Hace 1 semana',
    publishedAt: '12 de Noviembre, 2024',
    readTime: '2 min',
    featured: false,
    author: 'Cuerpo Técnico',
    authorRole: 'Dirección Deportiva Rayo Pelón',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'A partir de este próximo lunes, las sesiones de preparación táctica y balón parado se adelantarán 15 minutos para optimizar los turnos de luz en el campo 1.',
    content: `La Dirección Deportiva y el cuerpo técnico del Rayo Pelón F7 comunican a toda la plantilla y miembros del club que, de común acuerdo con la concejalía de deportes de Ibi, el horario de las sesiones de entrenamiento experimentará un leve ajuste a partir de la próxima semana.

- Días de sesión: Lunes y Miércoles.
- Nuevo horario: De 20:30h a 22:00h (previamente 20:45h).
- Instalación: Campo 1 de césped artificial del Polideportivo Municipal de Ibi.

El objetivo de este adelanto es maximizar el tiempo efectivo de trabajo con balón y realizar ejercicios de estrategia y finalización antes de los compromisos oficiales de la Liga Plata.`
  },
  {
    id: 'n5',
    title: 'Parte médico: Javi Verdú supera su sobrecarga y recibe el alta competitiva',
    category: 'MEDICO',
    categoryLabel: 'PARTE MÉDICO',
    dateText: 'Hace 10 días',
    publishedAt: '10 de Noviembre, 2024',
    readTime: '2 min',
    featured: false,
    author: 'Servicios Médicos Rayo Pelón',
    authorRole: 'Cuerpo Médico & Fisioterapia',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'El lateral polivalente del Rayo Pelón completó la sesión con el grupo al 100% de intensidad y está disponible para la convocatoria.',
    content: `Los servicios médicos del club confirman el alta médica definitiva de nuestro defensa y lateral Javi Verdú tras superar favorablemente la sobrecarga en el bíceps femoral que le impidió disputar los últimos minutos del encuentro ante la Penya La Foia.

El jugador ha completado dos entrenamientos consecutivos con el resto de sus compañeros sin presentar molestias residuales y con excelentes sensaciones físicas, estando a plena disposición del entrenador para el próximo partido.`,
    medicalDetails: {
      player: 'Javi Verdú',
      dorsal: 5,
      injury: 'Sobrecarga muscular en bíceps femoral',
      recoveryTime: 'Recuperado',
      currentStatus: 'Alta médica'
    }
  },
  {
    id: 'n6',
    title: 'Fichaje confirmado: Cristian Ortiz "Tanque" se incorpora para la fase decisiva',
    category: 'NOVEDAD',
    categoryLabel: 'FICHAJES & PLANTILLA',
    dateText: 'Hace 2 semanas',
    publishedAt: '5 de Noviembre, 2024',
    readTime: '3 min',
    featured: false,
    author: 'Dirección Deportiva',
    authorRole: 'Gabinete de Fichajes',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
    excerpt: 'El delantero de 29 años llega para aportar potencia física, juego de espaldas y gol en los momentos cumbre de la temporada en la Foia.',
    content: `El Rayo Pelón F7 ha alcanzado un acuerdo para la incorporación del atacante Cristian Ortiz, conocido deportivamente como "El Tanque", como nuevo refuerzo de la plantilla para el presente campeonato.

Cristian (29 años, dorsal #7) destaca por su capacidad para fijar a los centrales contrarios, su poderoso juego de espaldas a portería y un demoledor remate con ambas piernas. Con experiencia contrastada en las ligas comarcales de fútbol 7 de Alcoy e Ibi, su llegada supone un salto de calidad indiscutible para afrontar las jornadas decisivas por el ascenso a la Liga Oro.`
  }
];

export const LAST_MATCH_RECAP = {
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
  videoTitle: 'Resumen Oficial: Remontada y Goleada del Rayo (4 - 2)',
  videoDuration: '06:45',
  videoThumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=675&q=80',
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

export const PHOTO_GALLERY: MediaItem[] = [
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

export const HIGHLIGHT_CLIPS: MediaItem[] = [
  {
    id: 'c1',
    type: 'video',
    title: 'Falta directa a la escuadra de "El Chino"',
    tag: 'GOLAZO DEL MES',
    description: 'Golazo elegido por la organización de la Liga Plata como el mejor gol de la Jornada 13.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
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
    duration: '00:40',
    match: 'J12 vs Sporting Foia',
    views: '2.1K views'
  },
  {
    id: 'c6',
    type: 'video',
    title: 'Cánticos y piña en el vestuario tras el triunfo',
    tag: 'PASIÓN RAYISTA',
    description: 'La celebración de todo el grupo cantando el himno improvisado del Rayo Pelón.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    duration: '01:10',
    match: 'Postpartido J13',
    views: '2.8K views'
  }
];

export const MEDIA_DATA: MediaItem[] = [
  ...PHOTO_GALLERY,
  ...HIGHLIGHT_CLIPS
];

export const SPONSORS_DATA: Sponsor[] = [
  { id: 's0', name: 'SILVIA VICEDO ABOGADO', category: 'Servicios Jurídicos • Frontal Camisetas', icon: 'gavel' },
  { id: 's1', name: 'IBI TOYS FACTORY', category: 'Industria', icon: 'sports_motorsports' },
  { id: 's2', name: 'CERVECERÍA LA PLAZA', category: 'Hostelería', icon: 'local_bar' },
  { id: 's3', name: 'GYM COMARCAL IBI', category: 'Fitness', icon: 'fitness_center' },
  { id: 's4', name: 'MATRICERÍA FOIA', category: 'Ingeniería', icon: 'precision_manufacturing' },
  { id: 's5', name: 'ASADOR EL TERCER TIEMPO', category: 'Gastronomía', icon: 'restaurant' },
  { id: 's6', name: 'MOTOR IBI SPORT', category: 'Automoción', icon: 'directions_car' }
];

export const SPONSORSHIP_TIERS: SponsorshipTier[] = [
  {
    id: 'tier-oro',
    name: 'Oro • Patrocinador Principal',
    tagline: 'Máxima visibilidad en el pecho del Rayo',
    badge: 'MÁXIMO IMPACTO',
    priceEstimate: 'Principal de Temporada',
    highlighted: true,
    description: 'El logotipo principal de tu empresa presidirá el frontal de la 1ª y 2ª equipación del Rayo Pelón en todos los partidos de Liga y Copa.',
    benefits: [
      'Logotipo exclusivo en el pecho de la 1ª y 2ª equipación oficial',
      'Pancarta corporativa en la barandilla de campo en cada partido local',
      'Aparición prioritaria en la web oficial y en todos los banners de redes',
      'Presencia en cabeceras de resúmenes en vídeo y clips de mejores jugadas',
      'Mención nominal en crónicas de prensa y entrevistas postpartido',
      'Camiseta oficial enmarcada y firmada para la sede de tu empresa'
    ]
  },
  {
    id: 'tier-plata',
    name: 'Plata • Manga y Dorsal',
    tagline: 'Soporte oficial en indumentaria y digital',
    badge: 'COLABORADOR OFICIAL',
    priceEstimate: 'Soporte de Temporada',
    highlighted: false,
    description: 'Espacio publicitario en la manga izquierda o parte inferior trasera de la camiseta, con difusión digital continua.',
    benefits: [
      'Logotipo impreso en la manga o pantalón de juego de las equipaciones',
      'Patrocinio del premio "MVP de la Jornada" con entrega de mención en redes',
      'Banner corporativo en la sección web oficial de patrocinadores',
      'Post mensual dedicado de agradecimiento y promoción en Instagram y TikTok',
      'Dos abonos simbólicos de honor y kit de bienvenida del club'
    ]
  },
  {
    id: 'tier-bronce',
    name: 'Bronce • Comercio Local Ibi',
    tagline: 'Impulso directo del tejido comercial de Ibi',
    badge: 'COMERCIO Y HOSTELERÍA',
    priceEstimate: 'Pack Simpatizante Local',
    highlighted: false,
    description: 'Diseñado específicamente para pequeños comercios, talleres y locales de hostelería de Ibi y la comarca de la Foia que quieren sumar su fuerza al club.',
    benefits: [
      'Logotipo en el Muro Oficial de Empresas Colaboradoras de la web',
      'Difusión de promociones y descuentos exclusivos entre jugadores y aficionados',
      'Pegatina oficial "Empresa Colaboradora con el Rayo Pelón F7" para tu escaparate',
      'Invitación para dos personas a la cena y entrega de trofeos de fin de temporada'
    ]
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Competición',
    question: '¿Dónde y a qué hora juega el Rayo Pelón sus partidos como local?',
    answer: 'Disputamos nuestros partidos habitualmente en el Complejo Deportivo Estadio Climent (campos de césped artificial), los viernes a las 21h o 22h o domingos a las 9h o 10h, con sesiones tácticas los miércoles a las 22h según el calendario de la Liga Plata Ibi Comarcal.'
  },
  {
    id: 'faq-2',
    category: 'Afición',
    question: '¿Hay que pagar entrada para ver los partidos en el Polideportivo de Ibi?',
    answer: '¡No, la entrada es 100% libre y gratuita! Cualquier aficionado o familia puede acudir al Estadio Climent a animar al Rayo Pelón. Además, al acabar solemos juntarnos para el tradicional tercer tiempo en locales colaboradores de la localidad.'
  },
  {
    id: 'faq-3',
    category: 'Patrocinios',
    question: '¿Cómo puede mi empresa sumarse como patrocinadora del equipo?',
    answer: 'Es muy sencillo: completa el formulario de contacto indicando "Patrocinio Principal" o "Colaboración", o escríbenos directamente a danicortesmoreno@gmail.com. Te enviaremos el dossier con todas las ventajas de imagen de marca y desgravación.'
  },
  {
    id: 'faq-4',
    category: 'Deportiva',
    question: '¿Se realizan pruebas para nuevos jugadores o porteros?',
    answer: 'El club mantiene una base sólida de vestuario, pero siempre evaluamos incorporaciones de calidad para reforzar posiciones clave o cubrir bajas médicas prolongadas. Puedes enviarnos tu perfil deportivo y experiencia a través del formulario seleccionando la opción "Interés en incorporarse a la Plantilla".'
  },
  {
    id: 'faq-5',
    category: 'Amistosos',
    question: '¿Podemos acordar un partido amistoso o torneo de pretemporada/parón?',
    answer: '¡Por supuesto! Estaremos encantados de jugar amistosos de preparación con otros clubes de Ibi, Castalla, Onil o comarcas cercanas. Recomendamos contactarnos con al menos una semana de margen para gestionar la reserva de campo con el Estadio Climent.'
  },
  {
    id: 'faq-6',
    category: 'Prensa & Medios',
    question: '¿Dónde puedo conseguir fotografías o resúmenes de los partidos en alta resolución?',
    answer: 'En nuestra sección de Multimedia dispones de la galería fotográfica de cada jornada y los clips en vídeo. Si requieres material fotográfico sin compresión para prensa comarcal o redes, solicita el acceso a través del formulario o vía email.'
  }
];

export const KITS_DATA: KitItem[] = [
  {
    id: 'kit-1',
    type: 'home',
    name: '1ª Equipación Oficial',
    tag: 'TITULAR 2026/27',
    badge: 'BLANCO MÁRMOL & ORO IMPERIAL',
    subtitle: 'La armadura titular del Rayo Pelón F7',
    imageUrl: '/equipaciones/equipacion-1.png',
    sponsor: 'Silvia Vicedo Abogado',
    colors: [
      { name: 'Blanco Puro', hex: '#FFFFFF' },
      { name: 'Mármol Dorado', hex: '#C5A059' },
      { name: 'Oro Volt', hex: '#E5C985' }
    ],
    description: 'Diseño exclusivo con textura orgánica marmoleada en vetas doradas sobre fondo blanco. Cuello elástico y remates en mangas en oro volt, con el escudo oficial del club en serigrafía dorada.',
    details: [
      'Patrocinador Principal: Silvia Vicedo Abogado',
      'Tejido técnico transpirable de secado rápido',
      'Escudo serigrafiado monocolor dorado',
      'Corte anatómico optimizado para Fútbol 7'
    ]
  },
  {
    id: 'kit-2',
    type: 'away',
    name: '2ª Equipación Oficial',
    tag: 'ALTERNATIVA 2026/27',
    badge: 'AZULGRANA & FRANJAS CHEVRON',
    subtitle: 'La armadura visitante para las grandes citas',
    imageUrl: '/equipaciones/equipacion-2.png',
    sponsor: 'Silvia Vicedo Abogado',
    colors: [
      { name: 'Azul Marino', hex: '#0B0C1A' },
      { name: 'Rojo Carmesí', hex: '#87141E' },
      { name: 'Blanco Puro', hex: '#FFFFFF' }
    ],
    description: 'Fusión de azul marino oscuro y rojo carmesí con franjas verticales y microtrama chevron en degradado. Sponsor oficial en blanco de alto contraste y escudo del Rayo Pelón a todo color.',
    details: [
      'Patrocinador Principal: Silvia Vicedo Abogado',
      'Franjas verticales sublimadas con patrón dinámico',
      'Escudo oficial del Rayo Pelón F7 a color completo',
      'Zonas de ventilación activa en costados y hombros'
    ]
  }
];
