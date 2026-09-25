import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { Database, User, UserRole, SeasonMatch, computeMatchCenter, INITIAL_MATCHES, NewsArticle, NewsCategory, MedicalDetails, createAuditLog, AuditAction, AuditModule, AuditLog } from './database/db.js';
import { fetchLiveStandings, checkScheduleWindow, SYNC_SCHEDULE_INFO } from './services/standingsSync.js';
import { authMiddleware, requireRole, generateToken, AuthenticatedRequest } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLAYERS_DIR = path.resolve(__dirname, '../../client/public/players');
const MEDIA_DIR = path.resolve(__dirname, '../../client/public/media');
const MEDIA_IMAGES_DIR = path.join(MEDIA_DIR, 'images');
const MEDIA_VIDEOS_DIR = path.join(MEDIA_DIR, 'videos');

// Helper para registrar acciones en la bitácora de auditoría
function logAudit(
  db: any,
  req: Request | AuthenticatedRequest,
  action: AuditAction,
  module: AuditModule,
  description: string,
  details?: any
) {
  const authUser = (req as AuthenticatedRequest).user;
  return createAuditLog(db, {
    username: authUser?.username || 'Sistema',
    userRole: authUser?.role || 'MODERADOR',
    action,
    module,
    description,
    details
  });
}

// Ensure upload directories exist
for (const dir of [PLAYERS_DIR, MEDIA_DIR, MEDIA_IMAGES_DIR, MEDIA_VIDEOS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use('/players', express.static(PLAYERS_DIR));
app.use('/media', express.static(MEDIA_DIR));

// 1. Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    club: 'Rayo Pelón F7',
    league: 'Liga Plata de Ibi',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// AUTENTICACIÓN Y CONTROL DE ACCESO
// ==========================================

// Login exclusivo para el panel de administración (NO HAY REGISTRO MANUAL)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Debes proporcionar usuario y contraseña' });
  }

  const db = Database.read();
  const cleanUsername = String(username).trim();
  const user = db.users?.find(
    (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas. Usuario no registrado.' });
  }

  const isValidPassword = bcrypt.compareSync(String(password), user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas. Contraseña incorrecta.' });
  }

  user.lastLogin = new Date().toISOString();
  createAuditLog(db, {
    username: user.username,
    userRole: user.role,
    action: 'LOGIN',
    module: 'USUARIOS',
    description: `Inicio de sesión exitoso en el panel backend (${user.role === 'ADMIN' ? 'Administrador' : 'Moderador'})`
  });
  Database.write(db);

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role
  });

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      lastLogin: user.lastLogin
    }
  });
});

// Comprobar sesión actual
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = Database.read();
  const user = db.users?.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      lastLogin: user.lastLogin
    }
  });
});

// ==========================================
// GESTIÓN DE USUARIOS Y ROLES (SOLO ADMIN)
// ==========================================

// Listar usuarios (ADMIN)
app.get('/api/users', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const db = Database.read();
  const sanitizedUsers = (db.users || []).map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  }));
  res.json(sanitizedUsers);
});

// Crear usuario con rol ADMIN o MODERADOR (ADMIN)
app.post('/api/users', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { username, password, role } = req.body;

  const cleanUsername = String(username || '').trim();
  if (!cleanUsername || cleanUsername.length < 3) {
    return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' });
  }

  const cleanPassword = String(password || '').trim();
  if (!cleanPassword || cleanPassword.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const userRole: UserRole = role === 'ADMIN' ? 'ADMIN' : 'MODERADOR';

  const db = Database.read();
  if (!db.users) db.users = [];

  const existing = db.users.find(
    (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: `El usuario "${cleanUsername}" ya existe en el sistema` });
  }

  const newUser: User = {
    id: `u_${Date.now()}`,
    username: cleanUsername,
    passwordHash: bcrypt.hashSync(cleanPassword, 10),
    role: userRole,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  logAudit(db, req, 'CREATE', 'USUARIOS', `Creó el usuario "${newUser.username}" con rol ${newUser.role}`);
  Database.write(db);

  res.status(201).json({
    success: true,
    message: `Usuario ${newUser.username} creado correctamente con rol ${newUser.role}`,
    user: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.createdAt
    }
  });
});

// Actualizar usuario (rol, nombre o contraseña) (ADMIN)
app.put('/api/users/:id', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  const db = Database.read();
  if (!db.users) db.users = [];

  const user = db.users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // Prevenir que si es el único ADMIN se cambie a MODERADOR
  if (user.role === 'ADMIN' && role === 'MODERADOR') {
    const adminCount = db.users.filter((u) => u.role === 'ADMIN').length;
    if (adminCount <= 1) {
      return res.status(400).json({
        error: 'No puedes cambiar el rol del único Administrador activo del sistema.'
      });
    }
  }

  if (username && String(username).trim().length >= 3) {
    const cleanUsername = String(username).trim();
    const conflict = db.users.find(
      (u) => u.id !== id && u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (conflict) {
      return res.status(400).json({ error: `El nombre de usuario "${cleanUsername}" ya está en uso.` });
    }
    user.username = cleanUsername;
  }

  if (role && (role === 'ADMIN' || role === 'MODERADOR')) {
    user.role = role;
  }

  if (password && String(password).trim().length >= 6) {
    user.passwordHash = bcrypt.hashSync(String(password).trim(), 10);
  }

  logAudit(db, req, 'UPDATE', 'USUARIOS', `Modificó datos del usuario "${user.username}" (Rol: ${user.role})`);
  Database.write(db);

  res.json({
    success: true,
    message: 'Usuario actualizado correctamente',
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
});

// Eliminar usuario (ADMIN)
app.delete('/api/users/:id', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = Database.read();
  if (!db.users) db.users = [];

  const userIndex = db.users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const targetUser = db.users[userIndex];

  // No permitir eliminar al último admin
  if (targetUser.role === 'ADMIN') {
    const adminCount = db.users.filter((u) => u.role === 'ADMIN').length;
    if (adminCount <= 1) {
      return res.status(400).json({
        error: 'No se puede eliminar el único Administrador del sistema.'
      });
    }
  }

  if (req.user?.id === targetUser.id) {
    return res.status(400).json({
      error: 'Por seguridad, no puedes eliminar tu propia cuenta en sesión.'
    });
  }

  const deleted = db.users.splice(userIndex, 1)[0];
  logAudit(db, req, 'DELETE', 'USUARIOS', `Eliminó el usuario "${deleted.username}" (Rol previo: ${deleted.role})`);
  Database.write(db);

  res.json({
    success: true,
    message: `Usuario ${deleted.username} eliminado correctamente`,
    user: { id: deleted.id, username: deleted.username }
  });
});

// ==========================================
// REGISTRO DE AUDITORÍA Y LOGS (SOLO ADMIN)
// ==========================================

// Listar logs de auditoría con filtros opcionales (SOLO ADMIN)
app.get('/api/admin/logs', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const db = Database.read();
  const { module, action, search } = req.query;
  let logs = db.auditLogs || [];

  if (module && typeof module === 'string' && module !== 'TODOS') {
    logs = logs.filter((l) => l.module === module);
  }
  if (action && typeof action === 'string' && action !== 'TODAS') {
    logs = logs.filter((l) => l.action === action);
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    logs = logs.filter((l) =>
      l.description.toLowerCase().includes(q) ||
      l.username.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: logs.length,
    total: (db.auditLogs || []).length,
    logs
  });
});

// Limpiar historial de auditoría (SOLO ADMIN)
app.delete('/api/admin/logs', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const db = Database.read();
  const count = (db.auditLogs || []).length;
  db.auditLogs = [];

  createAuditLog(db, {
    username: req.user?.username || 'Admin',
    userRole: req.user?.role || 'ADMIN',
    action: 'DELETE',
    module: 'SISTEMA',
    description: `Registro de auditoría vaciado por el usuario (se eliminaron ${count} logs previos)`
  });

  Database.write(db);
  res.json({
    success: true,
    message: `Historial de logs vaciado (${count} registros eliminados)`
  });
});

// ==========================================
// CONTENIDO DEL CLUB
// ==========================================

// 2. Club Info
app.get('/api/club', (req: Request, res: Response) => {
  const db = Database.read();
  res.json(db.clubInfo);
});

// 3. Match Center
app.get('/api/matches/center', (req: Request, res: Response) => {
  const db = Database.read();
  if (db.matches && db.matches.length > 0) {
    db.matchCenter = computeMatchCenter(db.matches);
  }
  res.json(db.matchCenter);
});

app.put('/api/matches/center', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  db.matchCenter = { ...db.matchCenter, ...req.body };
  Database.write(db);
  res.json({ success: true, matchCenter: db.matchCenter });
});

// 3.1 Partidos & Marcadores (CRUD completo Temporada 26/27)
app.get('/api/matches', (req: Request, res: Response) => {
  const db = Database.read();
  const matches = (db.matches || INITIAL_MATCHES).sort((a, b) => a.jornada - b.jornada);
  const { jornada, filter } = req.query;

  if (jornada) {
    const jNum = Number(jornada);
    return res.json(matches.filter((m) => m.jornada === jNum));
  }

  if (filter === 'jugados') {
    return res.json(matches.filter((m) => m.jugado));
  }

  if (filter === 'pendientes') {
    return res.json(matches.filter((m) => !m.jugado));
  }

  res.json(matches);
});

app.get('/api/matches/:id', (req: Request, res: Response) => {
  const db = Database.read();
  const match = (db.matches || []).find((m) => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
  res.json(match);
});

app.post('/api/matches', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (!db.matches) db.matches = [...INITIAL_MATCHES];

  const body = req.body;
  const newMatch: SeasonMatch = {
    id: body.id || `m_${Date.now()}`,
    jornada: Number(body.jornada) || (db.matches.length + 1),
    local: String(body.local || 'Rayo Pelón FC').trim(),
    visitante: String(body.visitante || 'Rival FC').trim(),
    dia_semana: String(body.dia_semana || 'domingo').toLowerCase().trim(),
    fecha: String(body.fecha || '').trim(),
    fecha_iso: String(body.fecha_iso || '').trim(),
    hora: String(body.hora || '10:00').trim(),
    campo: String(body.campo || 'Climent B').trim(),
    jugado: Boolean(body.jugado),
    golesLocal: body.golesLocal !== undefined && body.golesLocal !== null && body.golesLocal !== '' ? Number(body.golesLocal) : null,
    golesVisitante: body.golesVisitante !== undefined && body.golesVisitante !== null && body.golesVisitante !== '' ? Number(body.golesVisitante) : null,
    notas: String(body.notas || '').trim()
  };

  db.matches.push(newMatch);
  db.matches.sort((a, b) => a.jornada - b.jornada);
  db.matchCenter = computeMatchCenter(db.matches);
  logAudit(db, req, 'CREATE', 'PARTIDOS', `Añadió partido de Jornada ${newMatch.jornada}: ${newMatch.local} vs ${newMatch.visitante} (${newMatch.fecha || 'Fecha pendiente'})`);
  Database.write(db);

  res.status(201).json({
    success: true,
    message: `Partido de Jornada ${newMatch.jornada} creado correctamente`,
    match: newMatch,
    matchCenter: db.matchCenter
  });
});

app.put('/api/matches/:id', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (!db.matches) db.matches = [...INITIAL_MATCHES];

  const index = db.matches.findIndex((m) => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Partido no encontrado' });
  }

  const existing = db.matches[index];
  const body = req.body;

  const updatedMatch: SeasonMatch = {
    id: existing.id,
    jornada: body.jornada !== undefined ? Number(body.jornada) : existing.jornada,
    local: body.local !== undefined ? String(body.local).trim() : existing.local,
    visitante: body.visitante !== undefined ? String(body.visitante).trim() : existing.visitante,
    dia_semana: body.dia_semana !== undefined ? String(body.dia_semana).toLowerCase().trim() : existing.dia_semana,
    fecha: body.fecha !== undefined ? String(body.fecha).trim() : existing.fecha,
    fecha_iso: body.fecha_iso !== undefined ? String(body.fecha_iso).trim() : existing.fecha_iso,
    hora: body.hora !== undefined ? String(body.hora).trim() : existing.hora,
    campo: body.campo !== undefined ? String(body.campo).trim() : existing.campo,
    jugado: body.jugado !== undefined ? Boolean(body.jugado) : existing.jugado,
    golesLocal: body.golesLocal !== undefined ? (body.golesLocal !== null && body.golesLocal !== '' ? Number(body.golesLocal) : null) : existing.golesLocal,
    golesVisitante: body.golesVisitante !== undefined ? (body.golesVisitante !== null && body.golesVisitante !== '' ? Number(body.golesVisitante) : null) : existing.golesVisitante,
    notas: body.notas !== undefined ? String(body.notas).trim() : existing.notas
  };

  db.matches[index] = updatedMatch;
  db.matches.sort((a, b) => a.jornada - b.jornada);
  db.matchCenter = computeMatchCenter(db.matches);
  const scoreInfo = updatedMatch.jugado ? ` (Resultado: ${updatedMatch.golesLocal ?? 0} - ${updatedMatch.golesVisitante ?? 0})` : '';
  logAudit(db, req, 'UPDATE', 'PARTIDOS', `Actualizó partido de Jornada ${updatedMatch.jornada}: ${updatedMatch.local} vs ${updatedMatch.visitante}${scoreInfo}`);
  Database.write(db);

  res.json({
    success: true,
    message: `Partido de Jornada ${updatedMatch.jornada} actualizado`,
    match: updatedMatch,
    matchCenter: db.matchCenter
  });
});

app.delete('/api/matches/:id', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (!db.matches) db.matches = [...INITIAL_MATCHES];

  const index = db.matches.findIndex((m) => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Partido no encontrado' });
  }

  const deleted = db.matches.splice(index, 1)[0];
  db.matchCenter = computeMatchCenter(db.matches);
  logAudit(db, req, 'DELETE', 'PARTIDOS', `Eliminó partido de Jornada ${deleted.jornada}: ${deleted.local} vs ${deleted.visitante}`);
  Database.write(db);

  res.json({
    success: true,
    message: `Partido de Jornada ${deleted.jornada} eliminado`,
    match: deleted,
    matchCenter: db.matchCenter
  });
});

app.post('/api/matches/reset-default', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  db.matches = [...INITIAL_MATCHES];
  db.matchCenter = computeMatchCenter(db.matches);
  logAudit(db, req, 'SYNC', 'PARTIDOS', 'Restableció el calendario oficial a las 22 jornadas iniciales');
  Database.write(db);

  res.json({
    success: true,
    message: 'Calendario restablecido con las 22 jornadas oficiales de la temporada 26/27',
    matches: db.matches,
    matchCenter: db.matchCenter
  });
});

function sanitizePlayerData(body: any, existingPlayer?: any) {
  const name = String(body.name || existingPlayer?.name || 'Nuevo Futbolista').trim();
  const nickname = String(body.nickname || existingPlayer?.nickname || name).trim();
  
  // Calculate initials
  let initials = existingPlayer?.avatarInitials || '';
  if (!initials || body.name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      initials = parts[0].slice(0, 2).toUpperCase();
    } else {
      initials = 'RP';
    }
  }

  const position = ['POR', 'DEF', 'MED', 'DEL'].includes(body.position)
    ? body.position
    : existingPlayer?.position || 'MED';

  const isGK = position === 'POR';

  const rawAttrs = body.attributes || existingPlayer?.attributes || {};
  const attributes: any = {};
  if (isGK) {
    attributes.reflejos = Number(rawAttrs.reflejos) || 80;
    attributes.estirada = Number(rawAttrs.estirada) || 80;
    attributes.saque = Number(rawAttrs.saque) || 80;
  } else {
    attributes.ritmo = Number(rawAttrs.ritmo) || 80;
    attributes.tiro = Number(rawAttrs.tiro) || 80;
    attributes.pase = Number(rawAttrs.pase) || 80;
    attributes.regate = Number(rawAttrs.regate) || 80;
    attributes.defensa = Number(rawAttrs.defensa) || 80;
    attributes.fisico = Number(rawAttrs.fisico) || 80;
  }

  const rawStats = body.seasonStats || existingPlayer?.seasonStats || {};
  const seasonStats: any = {
    matches: Number(rawStats.matches) || 0,
    goals: Number(rawStats.goals) || 0,
    assists: Number(rawStats.assists) || 0,
    yellowCards: Number(rawStats.yellowCards) || 0,
    redCards: Number(rawStats.redCards) || 0,
    mvpCount: Number(rawStats.mvpCount) || 0
  };
  if (isGK) {
    seasonStats.cleanSheets = Number(rawStats.cleanSheets) || 0;
    seasonStats.penaltiesSaved = String(rawStats.penaltiesSaved || '0 / 0');
  }

  const status = ['Apto', 'En duda', 'Baja', 'Apercibido'].includes(body.status)
    ? body.status
    : existingPlayer?.status || 'Apto';

  return {
    id: existingPlayer?.id || `p_${Date.now()}`,
    name,
    nickname,
    number: Number(body.number) || 0,
    position,
    age: Number(body.age) || 20,
    avatarInitials: initials,
    avatarColorGradient: body.avatarColorGradient || existingPlayer?.avatarColorGradient || 'from-amber-400 to-amber-200',
    photoUrl: body.photoUrl !== undefined ? String(body.photoUrl).trim() : (existingPlayer?.photoUrl || ''),
    rating: Number(body.rating) || 80,
    roleDescription: String(body.roleDescription || existingPlayer?.roleDescription || 'Guerrero del Rayo').trim(),
    attributes,
    seasonStats,
    status,
    statusDetail: body.statusDetail !== undefined ? String(body.statusDetail).trim() : (existingPlayer?.statusDetail || ''),
    featured: body.featured !== undefined ? Boolean(body.featured) : (existingPlayer?.featured ?? true)
  };
}

// 4. Players CRUD
app.get('/api/players', (req: Request, res: Response) => {
  const db = Database.read();
  const { pos } = req.query;
  if (pos && typeof pos === 'string' && pos !== 'ALL') {
    return res.json(db.players.filter(p => p.position === pos));
  }
  res.json(db.players);
});

app.get('/api/players/:id', (req: Request, res: Response) => {
  const db = Database.read();
  const player = db.players.find(p => p.id === req.params.id);
  if (!player) return res.status(404).json({ error: 'Jugador no encontrado' });
  res.json(player);
});

app.post('/api/players', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  const newPlayer = sanitizePlayerData(req.body);
  db.players.push(newPlayer);
  logAudit(db, req, 'CREATE', 'PLANTILLA', `Añadió al jugador ${newPlayer.name} ("${newPlayer.nickname}", #${newPlayer.number}, ${newPlayer.position})`);
  Database.write(db);
  res.status(201).json({ success: true, message: 'Jugador creado correctamente', player: newPlayer });
});

app.put('/api/players/:id', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  const index = db.players.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Jugador no encontrado' });
  const updatedPlayer = sanitizePlayerData(req.body, db.players[index]);
  db.players[index] = updatedPlayer;
  logAudit(db, req, 'UPDATE', 'PLANTILLA', `Modificó los datos del jugador ${updatedPlayer.name} ("${updatedPlayer.nickname}", #${updatedPlayer.number}, ${updatedPlayer.position})`);
  Database.write(db);
  res.json({ success: true, message: 'Jugador actualizado correctamente', player: updatedPlayer });
});

app.delete('/api/players/:id', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  const index = db.players.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Jugador no encontrado' });
  const deleted = db.players.splice(index, 1)[0];
  logAudit(db, req, 'DELETE', 'PLANTILLA', `Eliminó al jugador ${deleted.name} ("${deleted.nickname}", #${deleted.number}) de la plantilla`);
  Database.write(db);
  res.json({ success: true, message: 'Jugador eliminado correctamente', player: deleted });
});

// 4.1 Player Photo Upload (Base64 file from computer)
app.post('/api/upload/player-photo', authMiddleware, (req: Request, res: Response) => {
  try {
    const { filename, dataUrl } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
    }

    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    let ext = 'png';
    let base64Data = dataUrl;

    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      base64Data = matches[2];
    } else if (filename) {
      const parts = filename.split('.');
      if (parts.length > 1) ext = parts.pop().toLowerCase();
    }

    if (!['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
      ext = 'png';
    }

    const cleanBase = (filename ? filename.replace(/\.[^/.]+$/, '') : 'player')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30);
    const savedFileName = `${cleanBase || 'player'}_${Date.now()}.${ext}`;

    if (!fs.existsSync(PLAYERS_DIR)) {
      fs.mkdirSync(PLAYERS_DIR, { recursive: true });
    }

    const filePath = path.join(PLAYERS_DIR, savedFileName);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/players/${savedFileName}`;
    res.json({
      success: true,
      message: 'Foto subida y guardada en el servidor correctamente',
      url: publicUrl,
      filename: savedFileName
    });
  } catch (error: any) {
    console.error('Error al subir foto:', error);
    res.status(500).json({ error: 'Error al procesar y guardar la imagen' });
  }
});

let lastStandingsSync: { timestamp: string; source: string; success: boolean; count: number } | null = null;

// 5. Standings (Lectura con soporte de metadatos de sincronización)
app.get('/api/standings', (req: Request, res: Response) => {
  const db = Database.read();
  // Si el cliente pide formato simple o array, o el objeto completo
  res.json({
    success: true,
    standings: db.standings,
    lastSync: lastStandingsSync,
    schedule: SYNC_SCHEDULE_INFO,
    sourceUrl: 'https://www.ligacomarcal.com/competicion/lc-futbol-7-ibi-plata-mtzfdn3f/clasificacion'
  });
});

// 5.1 Sincronización Manual o Automática en Directo con ligacomarcal.com
app.post('/api/standings/sync', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await fetchLiveStandings();
    if (result.success && result.data.length > 0) {
      const db = Database.read();
      db.standings = result.data;
      logAudit(db, req, 'SYNC', 'CLASIFICACION', `Sincronizó en directo la clasificación con ligacomarcal.com (${result.teamsCount} equipos)`);
      Database.write(db);

      lastStandingsSync = {
        timestamp: result.timestamp,
        source: result.sourceUrl,
        success: true,
        count: result.teamsCount
      };

      return res.json({
        success: true,
        message: `¡Clasificación sincronizada con éxito! ${result.teamsCount} equipos y escudos oficiales actualizados.`,
        lastSync: lastStandingsSync,
        standings: result.data
      });
    }

    res.status(502).json({
      success: false,
      message: 'No se pudo parsear la tabla en ligacomarcal.com',
      error: result.error
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error interno en el proceso de sincronización',
      error: err?.message
    });
  }
});

// Permitir sync también por GET para llamadas directas
app.get('/api/standings/sync', async (req: Request, res: Response) => {
  const result = await fetchLiveStandings();
  if (result.success && result.data.length > 0) {
    const db = Database.read();
    db.standings = result.data;
    Database.write(db);
    lastStandingsSync = {
      timestamp: result.timestamp,
      source: result.sourceUrl,
      success: true,
      count: result.teamsCount
    };
    return res.json({
      success: true,
      lastSync: lastStandingsSync,
      standings: result.data
    });
  }
  res.status(502).json({ success: false, error: result.error });
});

app.put('/api/standings', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (Array.isArray(req.body)) {
    db.standings = req.body;
    logAudit(db, req, 'UPDATE', 'CLASIFICACION', `Actualizó manualmente la tabla de clasificación (${req.body.length} equipos)`);
    Database.write(db);
    return res.json({ success: true, standings: db.standings });
  }
  res.status(400).json({ error: 'El formato debe ser un array de equipos' });
});

// 6. News & Medical Reports API
const CATEGORY_LABELS: Record<NewsCategory, string> = {
  MEDICO: 'PARTE MÉDICO OFICIAL',
  CRONICA: 'CRÓNICA DE PARTIDO',
  OFICIAL: 'COMUNICADO OFICIAL',
  NOVEDAD: 'NOVEDADES & FICHAJES'
};

// GET /api/news (all news or filtered by ?category=)
app.get('/api/news', (req: Request, res: Response) => {
  const db = Database.read();
  let list = db.news || [];
  const categoryFilter = req.query.category as string;
  if (categoryFilter) {
    list = list.filter(item => item.category?.toUpperCase() === categoryFilter.toUpperCase());
  }
  res.json(list);
});

// GET /api/news/:id
app.get('/api/news/:id', (req: Request, res: Response) => {
  const db = Database.read();
  const article = db.news?.find(n => n.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Artículo de noticia no encontrado' });
  }
  res.json(article);
});

// POST /api/news (create news or medical report)
app.post('/api/news', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = Database.read();
    if (!db.news) db.news = [];

    const {
      title,
      category,
      publishedAt,
      dateText,
      readTime,
      excerpt,
      content,
      author,
      authorRole,
      imageUrl,
      featured,
      medicalDetails
    } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({ error: 'Título, categoría y contenido son campos obligatorios' });
    }

    const validCategory: NewsCategory = ['MEDICO', 'CRONICA', 'OFICIAL', 'NOVEDAD'].includes(category)
      ? (category as NewsCategory)
      : 'OFICIAL';

    const calculatedReadTime = readTime && String(readTime).trim().length > 0
      ? String(readTime).trim()
      : `${Math.max(1, Math.ceil((content || '').split(/\s+/).filter(Boolean).length / 180))} min`;

    const now = new Date();
    const formattedPublishedAt = publishedAt || now.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedDateText = dateText || 'Hoy';

    const isFeatured = Boolean(featured) || db.news.length === 0;

    if (isFeatured) {
      db.news.forEach(item => { item.featured = false; });
    }

    const article: NewsArticle = {
      id: `n_${Date.now()}`,
      title: String(title).trim(),
      category: validCategory,
      categoryLabel: CATEGORY_LABELS[validCategory] || 'COMUNICADO OFICIAL',
      dateText: formattedDateText,
      publishedAt: formattedPublishedAt,
      readTime: calculatedReadTime,
      excerpt: excerpt ? String(excerpt).trim() : String(content).trim().slice(0, 150) + '...',
      content: String(content).trim(),
      author: author ? String(author).trim() : 'Rayo Pelón F7',
      authorRole: authorRole ? String(authorRole).trim() : 'Prensa & Comunicación',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80',
      featured: isFeatured,
      ...(validCategory === 'MEDICO' && medicalDetails ? {
        medicalDetails: {
          player: String(medicalDetails.player || '').trim(),
          dorsal: medicalDetails.dorsal ? Number(medicalDetails.dorsal) : undefined,
          injury: String(medicalDetails.injury || '').trim(),
          recoveryTime: String(medicalDetails.recoveryTime || '').trim(),
          currentStatus: String(medicalDetails.currentStatus || 'Evolución favorable').trim()
        }
      } : {})
    };

    db.news.unshift(article);
    logAudit(db, req, 'CREATE', 'NOTICIAS', `Publicó ${article.categoryLabel}: "${article.title}"`);
    Database.write(db);
    res.status(201).json(article);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al crear la noticia o parte médico', details: err?.message });
  }
});

// PUT /api/news/:id (update news or medical report)
app.put('/api/news/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = Database.read();
    if (!db.news) db.news = [];

    const index = db.news.findIndex(n => n.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    const {
      title,
      category,
      publishedAt,
      dateText,
      readTime,
      excerpt,
      content,
      author,
      authorRole,
      imageUrl,
      featured,
      medicalDetails
    } = req.body;

    const current = db.news[index];
    const newCategory: NewsCategory = category || current.category;

    const isFeatured = typeof featured === 'boolean' ? featured : current.featured;
    if (isFeatured) {
      db.news.forEach(n => { n.featured = false; });
    }

    db.news[index] = {
      ...current,
      title: title !== undefined ? String(title).trim() : current.title,
      category: newCategory,
      categoryLabel: CATEGORY_LABELS[newCategory] || current.categoryLabel,
      publishedAt: publishedAt !== undefined ? String(publishedAt).trim() : current.publishedAt,
      dateText: dateText !== undefined ? String(dateText).trim() : current.dateText,
      readTime: readTime !== undefined ? String(readTime).trim() : current.readTime,
      excerpt: excerpt !== undefined ? String(excerpt).trim() : current.excerpt,
      content: content !== undefined ? String(content).trim() : current.content,
      author: author !== undefined ? String(author).trim() : current.author,
      authorRole: authorRole !== undefined ? String(authorRole).trim() : current.authorRole,
      imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : current.imageUrl,
      featured: isFeatured,
      ...(newCategory === 'MEDICO' ? {
        medicalDetails: medicalDetails ? {
          player: String(medicalDetails.player || '').trim(),
          dorsal: medicalDetails.dorsal ? Number(medicalDetails.dorsal) : undefined,
          injury: String(medicalDetails.injury || '').trim(),
          recoveryTime: String(medicalDetails.recoveryTime || '').trim(),
          currentStatus: String(medicalDetails.currentStatus || 'Evolución favorable').trim()
        } : current.medicalDetails
      } : { medicalDetails: undefined })
    };

    logAudit(db, req, 'UPDATE', 'NOTICIAS', `Modificó la publicación: "${db.news[index].title}" (${db.news[index].categoryLabel})`);
    Database.write(db);
    res.json(db.news[index]);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al actualizar la noticia', details: err?.message });
  }
});

// DELETE /api/news/:id
app.delete('/api/news/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = Database.read();
    if (!db.news) db.news = [];

    const index = db.news.findIndex(n => n.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    const deletedTitle = db.news[index].title;
    const wasFeatured = db.news[index].featured;
    db.news.splice(index, 1);

    if (wasFeatured && db.news.length > 0) {
      db.news[0].featured = true;
    }

    logAudit(db, req, 'DELETE', 'NOTICIAS', `Eliminó la noticia: "${deletedTitle}"`);
    Database.write(db);
    res.json({ success: true, message: 'Noticia eliminada correctamente', remaining: db.news.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al eliminar la noticia', details: err?.message });
  }
});

// PUT /api/news/:id/feature (Set as featured in frontend hero)
app.put('/api/news/:id/feature', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = Database.read();
    if (!db.news) db.news = [];

    const article = db.news.find(n => n.id === req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    db.news.forEach(n => {
      n.featured = (n.id === req.params.id);
    });

    logAudit(db, req, 'UPDATE', 'NOTICIAS', `Marcó como comunicado destacado en portada: "${article.title}"`);
    Database.write(db);
    res.json({
      success: true,
      message: `"${article.title}" marcada como comunicado destacado en portada`,
      featuredId: article.id,
      news: db.news
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al destacar la noticia', details: err?.message });
  }
});

// 7. Sponsors
app.get('/api/sponsors', (req: Request, res: Response) => {
  const db = Database.read();
  res.json(db.sponsors);
});

// 8. Contact Form
app.post('/api/contact', (req: Request, res: Response) => {
  const db = Database.read();
  const message = {
    id: `msg_${Date.now()}`,
    date: new Date().toISOString(),
    ...req.body
  };
  db.contactMessages.unshift(message);
  Database.write(db);
  res.status(201).json({ success: true, message: 'Mensaje recibido correctamente' });
});

// 9. Admin Metrics
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const db = Database.read();
  const rayoInStandings = db.standings.find(s => s.isRayo);
  res.json({
    totalPlayers: db.players.length,
    activePlayers: db.players.filter(p => p.status === 'Apto').length,
    leaguePosition: rayoInStandings ? rayoInStandings.position : 2,
    points: rayoInStandings ? rayoInStandings.points : 29,
    newsCount: db.news.length,
    messagesCount: db.contactMessages.length,
    nextMatch: db.matchCenter.nextMatch
  });
});

// 10. Multimedia Management Endpoints

// 10.1 Upload de Archivo Multimedia (Imágenes o Vídeos desde el ordenador)
app.post('/api/upload/media-file', authMiddleware, (req: Request, res: Response) => {
  try {
    const { data, filename, type } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'No se recibieron datos de archivo' });
    }

    // Identificar si es imagen o vídeo
    let isVideo = type === 'video';
    let mimeMatch = data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    let base64Data = data;

    if (mimeMatch) {
      base64Data = data.replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+;base64,/, '');
      if (mimeMatch[1].startsWith('video/')) {
        isVideo = true;
      }
    }

    const originalName = String(filename || (isVideo ? 'clip.mp4' : 'foto.jpg'));
    let ext = path.extname(originalName).toLowerCase().replace('.', '');
    if (!ext) {
      ext = isVideo ? 'mp4' : 'jpg';
    }

    const cleanBase = path.basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30);
    const savedFileName = `${cleanBase || (isVideo ? 'video' : 'img')}_${Date.now()}.${ext}`;

    const targetDir = isVideo ? MEDIA_VIDEOS_DIR : MEDIA_IMAGES_DIR;
    const subfolder = isVideo ? 'videos' : 'images';

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, savedFileName);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/media/${subfolder}/${savedFileName}`;
    res.json({
      success: true,
      message: `${isVideo ? 'Vídeo' : 'Imagen'} subido y guardado con éxito`,
      url: publicUrl,
      filename: savedFileName,
      type: isVideo ? 'video' : 'image'
    });
  } catch (error: any) {
    console.error('Error al subir archivo multimedia:', error);
    res.status(500).json({ error: 'Error al procesar y guardar el archivo multimedia' });
  }
});

// 10.2 Featured Match (Última Jornada: Vídeo o Carrusel de Fotos + Marcador + Cronología + Stats)
app.get('/api/media/featured-match', (req: Request, res: Response) => {
  const db = Database.read();
  res.json(db.featuredMatch);
});

app.put('/api/media/featured-match', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  db.featuredMatch = {
    ...db.featuredMatch,
    ...req.body
  };
  logAudit(db, req, 'UPDATE', 'MULTIMEDIA', `Actualizó el partido destacado multimedia (Jornada ${db.featuredMatch.matchday || ''})`);
  Database.write(db);
  res.json({ success: true, featuredMatch: db.featuredMatch });
});

// 10.3 Galería de Imágenes de los Partidos
app.get('/api/media/gallery', (req: Request, res: Response) => {
  const db = Database.read();
  res.json(db.gallery || []);
});

app.post('/api/media/gallery', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (!db.gallery) db.gallery = [];

  const newPhoto = {
    id: `fg_${Date.now()}`,
    type: 'foto',
    title: String(req.body.title || 'Foto de Jornada').trim(),
    tag: String(req.body.tag || 'Rayo Pelón').trim(),
    category: ['partidos', 'celebraciones', 'vestuario', 'entrenos'].includes(req.body.category)
      ? req.body.category
      : 'partidos',
    date: String(req.body.date || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })).trim(),
    imageUrl: String(req.body.imageUrl || '').trim(),
    description: String(req.body.description || '').trim()
  };

  db.gallery.unshift(newPhoto);
  logAudit(db, req, 'CREATE', 'MULTIMEDIA', `Subió nueva fotografía a la galería: "${newPhoto.title}" (${newPhoto.category})`);
  Database.write(db);
  res.status(201).json({ success: true, item: newPhoto });
});

app.put('/api/media/gallery/:id', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (!db.gallery) db.gallery = [];

  const index = db.gallery.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Foto no encontrada' });
  }

  db.gallery[index] = {
    ...db.gallery[index],
    ...req.body,
    id: req.params.id // asegurar que el id no se modifique
  };

  logAudit(db, req, 'UPDATE', 'MULTIMEDIA', `Editó los datos de la fotografía: "${db.gallery[index].title}"`);
  Database.write(db);
  res.json({ success: true, item: db.gallery[index] });
});

app.delete('/api/media/gallery/:id', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (!db.gallery) db.gallery = [];

  const targetPhoto = db.gallery.find((p: any) => p.id === req.params.id);
  if (!targetPhoto) {
    return res.status(404).json({ error: 'Foto no encontrada' });
  }

  db.gallery = db.gallery.filter((p: any) => p.id !== req.params.id);
  logAudit(db, req, 'DELETE', 'MULTIMEDIA', `Eliminó fotografía de la galería: "${targetPhoto.title || req.params.id}"`);
  Database.write(db);
  res.json({ success: true, message: 'Foto eliminada correctamente' });
});

// 10.4 Clips y Mejores Jugadas
app.get('/api/media/clips', (req: Request, res: Response) => {
  const db = Database.read();
  res.json(db.clips || []);
});

app.post('/api/media/clips', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (!db.clips) db.clips = [];

  const videoUrl = String(req.body.videoUrl || '').trim();
  const isYoutube = videoUrl.includes('youtu');

  const newClip = {
    id: `c_${Date.now()}`,
    type: 'video',
    title: String(req.body.title || 'Clip Destacado').trim(),
    tag: String(req.body.tag || 'JUGADA DESTACADA').trim(),
    description: String(req.body.description || '').trim(),
    imageUrl: String(req.body.imageUrl || '').trim(),
    videoUrl,
    sourceType: req.body.sourceType || (isYoutube ? 'youtube' : 'upload'),
    duration: String(req.body.duration || '00:30').trim(),
    match: String(req.body.match || 'Liga Plata F7').trim(),
    views: String(req.body.views || '1.0K views').trim()
  };

  db.clips.unshift(newClip);
  logAudit(db, req, 'CREATE', 'MULTIMEDIA', `Añadió nuevo clip de vídeo: "${newClip.title}"`);
  Database.write(db);
  res.status(201).json({ success: true, item: newClip });
});

app.put('/api/media/clips/:id', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (!db.clips) db.clips = [];

  const index = db.clips.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Clip no encontrado' });
  }

  db.clips[index] = {
    ...db.clips[index],
    ...req.body,
    id: req.params.id
  };

  logAudit(db, req, 'UPDATE', 'MULTIMEDIA', `Actualizó el clip de vídeo: "${db.clips[index].title}"`);
  Database.write(db);
  res.json({ success: true, item: db.clips[index] });
});

app.delete('/api/media/clips/:id', authMiddleware, (req: Request, res: Response) => {
  const db = Database.read();
  if (!db.clips) db.clips = [];

  const targetClip = db.clips.find((c: any) => c.id === req.params.id);
  if (!targetClip) {
    return res.status(404).json({ error: 'Clip no encontrado' });
  }

  db.clips = db.clips.filter((c: any) => c.id !== req.params.id);
  logAudit(db, req, 'DELETE', 'MULTIMEDIA', `Eliminó el clip de vídeo: "${targetClip.title || req.params.id}"`);
  Database.write(db);
  res.json({ success: true, message: 'Clip eliminado correctamente' });
});

// En producción, servir el frontend compilado (React/Vite)
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/media') && !req.path.startsWith('/players')) {
      res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    }
  });
}

app.listen(PORT, async () => {
  console.log(`[Rayo Pelón F7 API] Servidor activo en http://localhost:${PORT}`);
  
  // Sincronización inicial automática al arrancar el servidor
  try {
    console.log('[AutoSync] Iniciando sincronización de clasificación con ligacomarcal.com...');
    const result = await fetchLiveStandings();
    if (result.success && result.data.length > 0) {
      const db = Database.read();
      db.standings = result.data;
      Database.write(db);
      lastStandingsSync = {
        timestamp: result.timestamp,
        source: result.sourceUrl,
        success: true,
        count: result.teamsCount
      };
      console.log(`[AutoSync] Clasificación sincronizada con éxito: ${result.teamsCount} equipos y escudos cargados.`);
    }
  } catch (err: any) {
    console.warn('[AutoSync] No se pudo completar la sincronización inicial:', err?.message);
  }

  // Sincronizador inteligente adaptado a la jornada de fútbol:
  // - Viernes noche: partidos a las 22h -> comprobación a las 23:45h, 00:00h y 00:30h
  // - Domingo mañana: partidos a las 9h/10h -> comprobación a las 11:30h, 12:00h y 12:30h
  // - Lunes 10:00h: consolidación semanal
  // - 1 revisión diaria ligera a las 06:00h
  const executedSlots = new Set<string>();

  setInterval(async () => {
    try {
      const now = new Date();
      const check = checkScheduleWindow(now);

      if (check.shouldRun && !executedSlots.has(check.slotKey)) {
        executedSlots.add(check.slotKey);
        console.log(`[SmartScheduler] Ejecutando sincronización programada: ${check.reason}...`);
        
        const res = await fetchLiveStandings();
        if (res.success && res.data.length > 0) {
          const db = Database.read();
          db.standings = res.data;
          Database.write(db);
          lastStandingsSync = {
            timestamp: res.timestamp,
            source: res.sourceUrl,
            success: true,
            count: res.teamsCount
          };
          console.log(`[SmartScheduler] ✓ Clasificación actualizada con éxito (${res.teamsCount} equipos) en ventana ${check.reason}.`);
        }

        // Limpieza de claves antiguas para evitar acumulación en memoria
        if (executedSlots.size > 50) {
          executedSlots.clear();
        }
      }
    } catch (err: any) {
      console.warn('[SmartScheduler] Error en evaluación de horario:', err?.message);
    }
  }, 2 * 60 * 1000); // Comprobación en memoria cada 2 minutos (sin tráfico web salvo que coincida la ventana)
});
