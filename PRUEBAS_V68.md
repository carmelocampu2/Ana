# v6.8: copia y restauración de progreso

- Exportación de las cinco claves de almacenamiento conocidas a JSON local.
- Importación validada (formato, versión, claves permitidas, JSON, tamaño) con confirmación explícita.
- Restauración por clave y reversión en caso de fallo de escritura.
- No se borran claves ausentes del archivo importado.
- 13 exámenes y 1.204 preguntas conservadas.
- Sintaxis JS validada con Node.js; recursos de caché existentes; integridad ZIP comprobada.
- Pendiente: pruebas reales en Chrome Android y de restauración en otro dispositivo.
- NO PUBLICAR.
