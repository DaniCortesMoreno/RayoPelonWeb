export type PlayerPosition = 'POR' | 'DEF' | 'MED' | 'DEL';

export type PlayerStatus = 'Apto' | 'En duda' | 'Baja' | 'Apercibido';

export interface PlayerStats {
  ritmo?: number;
  tiro?: number;
  pase?: number;
  regate?: number;
  defensa?: number;
  fisico?: number;
  // Atributos Portero
  reflejos?: number;
  estirada?: number;
  saque?: number;
}

export interface PlayerSeasonStats {
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets?: number;
  penaltiesSaved?: string;
  interceptionsPerMatch?: number;
  mvpCount?: number;
}

export interface Player {
  id: string;
  name: string;
  nickname: string;
  number: number;
  position: PlayerPosition;
  age: number;
  avatarInitials: string;
  avatarColorGradient?: string;
  photoUrl?: string;
  rating: number;
  roleDescription: string;
  attributes: PlayerStats;
  seasonStats: PlayerSeasonStats;
  status: PlayerStatus;
  statusDetail?: string;
  featured?: boolean;
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface Match {
  id: string;
  matchday: number;
  label: string;
  date: string;
  time: string;
  isLive?: boolean;
  isPlayed: boolean;
  homeTeam: string;
  awayTeam: string;
  score?: MatchScore;
  location: string;
  notes?: string;
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

export interface MatchCenterData {
  lastMatch: {
    matchday: number;
    homeTeam: string;
    awayTeam: string;
    score: string;
    notes?: string;
    statusText: string;
  };
  nextMatch: {
    matchday: number;
    homeTeam: string;
    awayTeam: string;
    location: string;
    dayTime: string;
    statusText: string;
    countdown?: string;
    fechaIso?: string;
    hora?: string;
    campo?: string;
    diaSemana?: string;
    fecha?: string;
  };
}

export interface StandingTeam {
  position: number;
  teamCode: string;
  teamName: string;
  isRayo: boolean;
  matchesPlayed: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('V' | 'E' | 'D')[];
  badgeUrl?: string;
}

export type NewsCategory = 'MEDICO' | 'CRONICA' | 'OFICIAL' | 'NOVEDAD';

export interface MedicalDetails {
  player: string;
  dorsal: number;
  injury: string;
  recoveryTime: string;
  currentStatus: 'Evolución favorable' | 'Baja confirmada' | 'Alta médica' | 'Duda hasta última hora';
}

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  categoryLabel: string;
  dateText: string;
  publishedAt?: string;
  readTime: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole?: string;
  imageUrl?: string;
  featured?: boolean;
  medicalDetails?: MedicalDetails;
}

export interface MediaItem {
  id: string;
  type: 'foto' | 'video';
  title: string;
  tag: string;
  category?: 'partidos' | 'celebraciones' | 'vestuario' | 'entrenos' | 'clips';
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  sourceType?: 'youtube' | 'upload' | 'url';
  duration?: string;
  match?: string;
  date?: string;
  views?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface SponsorshipTier {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  priceEstimate: string;
  highlighted?: boolean;
  benefits: string[];
  description: string;
}

export interface KitItem {
  id: string;
  type: 'home' | 'away';
  name: string;
  tag: string;
  badge: string;
  subtitle: string;
  imageUrl: string;
  sponsor: string;
  colors: { name: string; hex: string }[];
  description: string;
  details: string[];
}
