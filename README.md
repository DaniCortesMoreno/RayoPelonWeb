# ⚡ Rayo Pelón F7 — Sitio Web Oficial & Sala de Máquinas

> **Portal web oficial del club Rayo Pelón F7** (Liga Plata de Ibi, Alicante) con sistema integral de gestión deportiva: plantilla interactiva, seguimiento de 22 jornadas, clasificaciones sincronizadas con la Liga Comarcal, sala de prensa con partes médicos y panel de administración privado.

---

## 🛠️ Stack Tecnológico

### Frontend (`client/`)
* **React 19** + **TypeScript** con arquitectura modular por componentes.
* **Vite 8** como empaquetador ultrarrápido con soporte Hot Module Replacement (HMR).
* **React Router DOM v7** para enrutamiento SPA sin recargas de página.
* **Tailwind CSS v3** con tokens de diseño exclusivos:
  * Paleta propia: Oro Rayo (`#F59E0B`), Fondo Carbón (`#07070F`), degradados Champagne y acento Burdeos.
  * Tarjetas de élite con efectos *glassmorphism* y tilt giroscópico 3D en cromos de jugadores.
* **Iconografía**: Google Material Symbols & Icons + Lucide React.
* **Tipografía**: Google Fonts (*Outfit*, *Montserrat* e *Inter*).

### Backend (`server/`)
* **Node.js** + **Express.js (v4)** en modo ES Modules (`"type": "module"`).
* **TypeScript** con compilación estricta y desarrollo en vivo mediante `tsx watch`.
* **Flat-File Database JSON** transaccional con persistencia en `server/data/db.json`:
  * Calendario completo de 22 jornadas de la temporada 2026/27.
  * Noticias, crónicas y partes médicos con fichas clínicas de seguimiento.
  * Plantilla completa con atributos, dorsales y estadísticas.
* **Seguridad & Autenticación**:
  * **JWT (JSON Web Tokens)** con expiración para sesiones del panel de control.
  * **Bcrypt.js** para cifrado seguro de contraseñas de administradores.
  * **CORS** y validación de tipos en todos los endpoints REST.
* **Servicios Automatizados**:
  * Sincronizador inteligente de la clasificación oficial de *ligacomarcal.com*.
  * Motor de cálculo automático de Match Center y cuenta regresiva a tiempo real.
  * Gestor de archivos multimedia (fotos de partidos, clips y fichas de jugadores).

---

## 📁 Estructura del Proyecto

```text
Rayo Pelon/
├── client/                     # Aplicación Frontend React
│   ├── public/                 # Archivos estáticos públicos (escudos, .htaccess)
│   │   ├── media/              # Galerías de fotos y clips
│   │   └── players/            # Cromos y fotos oficiales de la plantilla
│   ├── src/
│   │   ├── components/         # Componentes UI (admin, home, layout, media, news, squad, standings)
│   │   ├── config/             # Configuración dinámica de API (api.ts)
│   │   ├── context/            # Contexto global de autenticación (AuthContext.tsx)
│   │   ├── data/               # Datos iniciales y mocks tipados (mockData.ts)
│   │   ├── pages/              # Vistas principales (Inicio, Plantilla, Noticias, Admin, etc.)
│   │   └── types/              # Interfaces TypeScript compartidas
│   └── dist/                   # Build compilado y optimizado para producción
├── server/                     # Servidor Backend Node.js / Express
│   ├── data/
│   │   └── db.json             # Base de datos JSON con persistencia
│   ├── src/
│   │   ├── database/           # Controlador Database y datos por defecto (db.ts)
│   │   ├── services/           # Sincronizador de clasificación con Liga Comarcal
│   │   ├── auth.ts             # Middleware de autenticación JWT y roles
│   │   └── server.ts           # Endpoints de la API REST y servidor estático unificado
│   └── dist/                   # Backend compilado listo para producción
├── .gitignore                  # Reglas de exclusión de Git (node_modules, .env, etc.)
├── package.json                # Orquestador monorepo (concurrently)
└── README.md                   # Documentación oficial del proyecto
```

---

## 💻 Desarrollo Local

### 1. Requisitos Previos
* Node.js v18.x o superior instalado.
* npm v9.x o superior.

### 2. Instalación de dependencias
```bash
npm run install:all
```

### 3. Iniciar entorno de desarrollo
```bash
npm run dev
```
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`

---

## 🚀 Despliegue y Publicación en Hostinger (Business Web Hosting)

El proyecto está configurado para que al hacer `git push` a GitHub, se pueda desplegar automáticamente en Hostinger sin necesidad de compilar en el servidor de hosting.

### 1. Compilación de Producción
Antes de subir los cambios, genera los paquetes optimizados:
```bash
npm run build
```
Esto genera las carpetas `client/dist` y `server/dist`.

### 2. Subir a GitHub
```bash
git add .
git commit -m "feat: actualización de la web"
git push origin main
```

### 3. Conexión en Hostinger hPanel
1. Entra a tu **hPanel de Hostinger** -> Sección **Avanzado** -> **Git**.
2. Conecta el repositorio: `https://github.com/DaniCortesMoreno/RayoPelonWeb.git` en la rama `main`.
3. Copia el **Webhook URL** que te proporciona Hostinger y pégalo en tu repositorio de GitHub (**Settings -> Webhooks**).
4. En la sección **Node.js** de Hostinger:
   * **Versión de Node.js**: 20 LTS.
   * **Modo**: Producción.
   * **Archivo de inicio**: `server/dist/server.js`.
   * Pulsa **NPM Install** y luego **Iniciar aplicación**.

A partir de ese momento, cada `git push` desplegará la web de forma automática y permanecerá activa 24/7.

---

## 🔐 Panel de Administración
* Acceso: `/admin`
* Gestión en tiempo real de:
  * **Partidos & Marcadores**: Resultados, jornadas y cuenta atrás.
  * **Noticias & Crónicas**: Redacción con selector de categoría y fichas médicas completas.
  * **Comunicado Destacado**: Selección visual del comunicado que preside la portada.
  * **Plantilla**: Estadísticas, fotos y altas/bajas.
  * **Multimedia**: Galería fotográfica de partidos y vídeos destacados.
  * **Clasificación**: Sincronización a un clic con la Liga Comarcal de Ibi.

---

## 📄 Licencia
Proyecto exclusivo para el **Club Rayo Pelón F7**. Todos los derechos reservados © 2026.
