# Versión 6.6 — Actualización en línea y modo sin conexión

- Estrategia de lectura **red primero**, caché como respaldo cuando falla la red.
- Precarga de 28 recursos esenciales, comprobados presentes.
- 13 bloques de examen, 1204 preguntas; banco sin modificaciones.
- Claves de progreso de app.js conservadas.
- Comprobación sintáctica Node.js de todos los archivos JS: correcta.
- La actualización no borra localStorage; la limpieza afecta a cachés de esta PWA.
- Advertencia: requiere servir por HTTPS/GitHub Pages; no se ha probado en Chrome Android.
- La red primero no garantiza la detección inmediata de un nuevo service worker si el navegador no comprueba actualizaciones.
- NO PUBLICAR sin pruebas de usuario.
