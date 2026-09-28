// Punto de entrada app.js para Hostinger (LiteSpeed lsnode.js compatible)
console.log('>>> [HOSTINGER ENTRYPOINT] app.js iniciado via LiteSpeed lsnode.js');

import('./server/dist/server.js')
  .then(() => {
    console.log('>>> [HOSTINGER] Servidor Express cargado y listo.');
  })
  .catch((err) => {
    console.error('>>> [HOSTINGER CRASH] Error importando ./server/dist/server.js:', err);
  });
