export interface SyncedStandingTeam {
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
  badgeUrl: string;
}

export interface SyncResult {
  success: boolean;
  timestamp: string;
  sourceUrl: string;
  teamsCount: number;
  data: SyncedStandingTeam[];
  error?: string;
}

const LIGA_COMARCAL_URL = 'https://www.ligacomarcal.com/competicion/lc-futbol-7-ibi-plata-mtzfdn3f/clasificacion';

export async function fetchLiveStandings(): Promise<SyncResult> {
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(LIGA_COMARCAL_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status} al conectar con ligacomarcal.com`);
    }

    const html = await response.text();
    const teams: SyncedStandingTeam[] = [];

    // Regex para extraer cada fila de la tabla de escritorio
    // Estructura: <span class="lc-num"[^>]*>POS</span> ... <img src="BADGE" ... /><span>TEAM_NAME</span> ... PJ PG PE PP GF GC DIF ... PTS
    const desktopRowRegex = /<span class="lc-num"[^>]*>(\d+)<\/span>\s*<button[^>]*>\s*<img src="([^"]+)"[^>]*>\s*<span[^>]*>([^<]+)<\/span>\s*<\/button>\s*<span[^>]*>(\d+)<\/span>\s*<span[^>]*>(\d+)<\/span>\s*<span[^>]*>(\d+)<\/span>\s*<span[^>]*>(\d+)<\/span>\s*<span[^>]*>(\d+)<\/span>\s*<span[^>]*>(\d+)<\/span>\s*<span[^>]*>([^<]+)<\/span>\s*<span[^>]*>(.*?)<\/span>\s*<span class="lc-num text-center"[^>]*>(\d+)<\/span>/g;

    let match: RegExpExecArray | null;
    while ((match = desktopRowRegex.exec(html)) !== null) {
      const pos = parseInt(match[1], 10);
      const badgeUrl = match[2];
      const teamName = match[3].trim();
      const pj = parseInt(match[4], 10);
      const pg = parseInt(match[5], 10);
      const pe = parseInt(match[6], 10);
      const pp = parseInt(match[7], 10);
      const gf = parseInt(match[8], 10);
      const gc = parseInt(match[9], 10);
      const rawDg = match[10].trim();
      const rawForm = match[11];
      const pts = parseInt(match[12], 10);

      const isRayo = /rayo\s*pel[oó]n/i.test(teamName);

      // Calcular diferencia de goles
      const goalDiff = parseInt(rawDg, 10) || (gf - gc);

      // Generar código de equipo (2-3 iniciales)
      const teamCode = generateTeamCode(teamName, isRayo);

      // Extraer racha (forma) si está presente
      const form: ('V' | 'E' | 'D')[] = [];
      const formMatches = rawForm.match(/[VED]/g);
      if (formMatches) {
        for (const f of formMatches) {
          if (f === 'V' || f === 'E' || f === 'D') form.push(f);
        }
      }

      teams.push({
        position: pos,
        teamCode,
        teamName,
        isRayo,
        matchesPlayed: pj,
        won: pg,
        drawn: pe,
        lost: pp,
        goalsFor: gf,
        goalsAgainst: gc,
        goalDifference: goalDiff,
        points: pts,
        form: form.length > 0 ? form : ['V', 'V', 'E'],
        badgeUrl
      });
    }

    if (teams.length === 0) {
      throw new Error('No se han podido parsear filas de la tabla de ligacomarcal.com');
    }

    return {
      success: true,
      timestamp,
      sourceUrl: LIGA_COMARCAL_URL,
      teamsCount: teams.length,
      data: teams
    };
  } catch (error: any) {
    console.error('Error sincronizando clasificación en directo:', error?.message || error);
    return {
      success: false,
      timestamp,
      sourceUrl: LIGA_COMARCAL_URL,
      teamsCount: 0,
      data: [],
      error: error?.message || 'Error desconocido'
    };
  }
}

function generateTeamCode(name: string, isRayo: boolean): string {
  if (isRayo) return 'RP';
  const clean = name.replace(/\b(FC|C\.F\.|CD|C\.D\.|FS)\b/gi, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export const SYNC_SCHEDULE_INFO = {
  description: 'Programación optimizada según calendario de partidos de Ibi F7',
  windows: [
    { label: 'Jornada Viernes Noche', time: 'Viernes 23:45h, 00:00h y 00:30h (post-partidos 22:00h)' },
    { label: 'Jornada Domingo Mañana', time: 'Domingo 11:30h, 12:00h y 12:30h (post-partidos 9h-10h)' },
    { label: 'Consolidación Semanal', time: 'Lunes 10:00h' },
    { label: 'Mantenimiento Diario', time: 'Todos los días 06:00h' }
  ]
};

/**
 * Determina si en este momento corresponde ejecutar una sincronización automática programada.
 * Reduce el tráfico y no satura el servidor de la liga.
 */
export function checkScheduleWindow(now: Date = new Date()): { shouldRun: boolean; slotKey: string; reason?: string } {
  const parts = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(now);

  const weekday = parts.find(p => p.type === 'weekday')?.value.toLowerCase() || '';
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);

  const dateStr = now.toISOString().slice(0, 10);

  // 1. Viernes noche post-partido de las 22:00h
  if (weekday.startsWith('vie') && hour === 23 && minute >= 45 && minute <= 55) {
    return { shouldRun: true, slotKey: `${dateStr}-vie-2345`, reason: 'Post-partido Viernes 22h (23:45h)' };
  }

  // 2. Sábado madrugada tras partidos del viernes noche (00:00h y 00:30h)
  if (weekday.startsWith('sáb') || weekday.startsWith('sab')) {
    if (hour === 0 && minute >= 0 && minute <= 10) {
      return { shouldRun: true, slotKey: `${dateStr}-sab-0000`, reason: 'Cierre Viernes Noche (00:00h)' };
    }
    if (hour === 0 && minute >= 30 && minute <= 40) {
      return { shouldRun: true, slotKey: `${dateStr}-sab-0030`, reason: 'Revisión Viernes Noche (00:30h)' };
    }
  }

  // 3. Domingo mediodía tras partidos de las 9h/10h (11:30h, 12:00h y 12:30h)
  if (weekday.startsWith('dom')) {
    if (hour === 11 && minute >= 30 && minute <= 40) {
      return { shouldRun: true, slotKey: `${dateStr}-dom-1130`, reason: 'Post-partido Domingo Mañana (11:30h)' };
    }
    if (hour === 12 && minute >= 0 && minute <= 10) {
      return { shouldRun: true, slotKey: `${dateStr}-dom-1200`, reason: 'Cierre Domingo Mediodía (12:00h)' };
    }
    if (hour === 12 && minute >= 30 && minute <= 40) {
      return { shouldRun: true, slotKey: `${dateStr}-dom-1230`, reason: 'Revisión Domingo Mediodía (12:30h)' };
    }
  }

  // 4. Lunes mañana (revisión de cierre de jornada a las 10:00h)
  if (weekday.startsWith('lun') && hour === 10 && minute >= 0 && minute <= 10) {
    return { shouldRun: true, slotKey: `${dateStr}-lun-1000`, reason: 'Consolidación semanal Lunes (10:00h)' };
  }

  // 5. Comprobación diaria única de bajo impacto a las 06:00h
  if (hour === 6 && minute >= 0 && minute <= 10) {
    return { shouldRun: true, slotKey: `${dateStr}-daily-0600`, reason: 'Mantenimiento diario de bajo impacto (06:00h)' };
  }

  return { shouldRun: false, slotKey: '' };
}
