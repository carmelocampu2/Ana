# Versión 3.8 — NO PUBLICAR

- El borrador incluye una huella del número, texto, orden y opciones de las preguntas.
- La recuperación rechaza borradores con huella distinta sin borrarlos.
- Los borradores antiguos, que no tienen huella, requieren confirmación expresa.
- Al comenzar otro examen se advierte si existe un borrador, incluso tras recargar la página.
- El historial incorpora la huella del examen sin romper entradas anteriores.
- Se toleran historiales corruptos o que no son arrays.

Comprobaciones: sintaxis JavaScript con `node --check`; cinco aserciones automatizadas de huella/guardado; 13 bloques y 1.182 registros; integridad del ZIP. No se ha probado en Chrome Android.
