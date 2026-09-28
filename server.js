// Punto de entrada raíz para Hostinger / Node.js
console.log('>>> [HOSTINGER ENTRYPOINT] server.js iniciado correctamente');
console.log('>>> [HOSTINGER] Entorno NODE_ENV:', process.env.NODE_ENV, '| PORT:', process.env.PORT);

try {
  await import('./server/dist/server.js');
  console.log('>>> [HOSTINGER] Servidor cargado con éxito');
} catch (err) {
  console.error('>>> [HOSTINGER CRASH] Error importando ./server/dist/server.js:', err);
  process.exit(1);
}
