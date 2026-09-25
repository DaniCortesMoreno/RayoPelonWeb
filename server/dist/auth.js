import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'rayo-pelon-secret-f7-2026-safe-key-ibi';
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Acceso no autorizado. Debes iniciar sesión para realizar esta operación.'
        });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({
            error: 'Sesión expirada o token inválido. Por favor vuelve a iniciar sesión.'
        });
    }
    req.user = decoded;
    next();
}
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Permisos insuficientes. Esta acción requiere rol [${allowedRoles.join(', ')}]. Tu rol actual es [${req.user.role}].`
            });
        }
        next();
    };
}
