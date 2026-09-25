// Configuración de URLs para la API y archivos multimedia
// En desarrollo local apunta a http://localhost:5000
// En producción (Hostinger) usa ruta relativa para usar el propio dominio
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || (import.meta.env.PROD ? '' : 'http://localhost:5000');
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
