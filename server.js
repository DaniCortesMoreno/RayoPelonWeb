// Punto de entrada raíz para Hostinger (LiteSpeed lsnode.js compatible)
console.log('>>> [HOSTINGER ENTRYPOINT] server.js iniciado via LiteSpeed lsnode.js');
console.log('>>> [HOSTINGER] PORT:', process.env.PORT, '| NODE_ENV:', process.env.NODE_ENV);

// Usamos import dinámico sin top-level await para compatibilidad total con require() de lsnode.js
import('./server/dist/server.js')
  .then(() => {
    console.log('>>> [HOSTINGER] Servidor Express cargado y listo.');
  })
  .catch((err) => {
    console.error('>>> [HOSTINGER CRASH] Error importando ./server/dist/server.js:', err);
  });
