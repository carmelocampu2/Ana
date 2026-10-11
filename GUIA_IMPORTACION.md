# Importación de exámenes oficiales en PWA 1.3

La app mantiene las 128 preguntas originales de práctica. La importación de preguntas oficiales requiere disponer del cuadernillo y plantilla definitiva, y verificar cada respuesta y las anulaciones.

1. Consulta `convocatorias.html` para localizar fuentes.
2. Descarga `plantilla-importacion.json` y sustituye el ejemplo por preguntas que tengas derecho a reutilizar.
3. Indica `correct` como índice empezando en 0; `verificada` debe ser `true` solo tras comprobar la plantilla definitiva.
4. En la portada, selecciona el JSON. La app lo guarda localmente y habilita "Examen oficial importado".

La importación reemplaza el conjunto oficial anterior y acepta entre 2 y 5 opciones. No se incluyen transcripciones no verificadas. Para cargar la PWA correctamente, publícala en HTTPS. La importación se guarda en localStorage y no se sincroniza entre dispositivos.
