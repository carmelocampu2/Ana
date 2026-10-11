# Test Anatomía Patológica · Murcia — PWA 1.0

Aplicación web instalable desde Chrome en Android, sin Android Studio ni APK. Contiene 108 preguntas originales de práctica extraídas del prototipo 0.9, 20 por sesión, corrección al final, repaso de errores, marcadores, modo mixto, materias, entrenamiento adaptativo, puntuación opcional con penalización, historial y seguimiento diario.

## Publicación desde móvil, sin Termux
1. Descomprime el ZIP. Para facilitar la subida, los archivos web están todos en la raíz, sin subcarpetas.
2. En GitHub, abre tu repositorio, selecciona **Add file → Upload files**, y sube los ocho archivos de esta carpeta: `index.html`, `app.js`, `styles.css`, `questions.json`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`. Puedes seleccionar varios archivos de una vez desde Chrome; si no, hazlo en dos o más tandas. `README.md` es opcional.
3. Confirma los cambios. Ve a **Settings → Pages → Build and deployment**, selecciona **Deploy from a branch**, rama **main**, carpeta **/(root)**, y guarda.
4. Espera a que GitHub Pages publique la web. Abre `https://TU-USUARIO.github.io/AnatomiaPatologicaMurcia/` (respeta las mayúsculas del nombre del repositorio).
5. En Chrome para Android, abre el menú ⋮ y elige **Instalar aplicación** o **Añadir a pantalla de inicio**. El servicio offline se instala al cargar la web por primera vez.

Si el repositorio es privado, comprueba la disponibilidad de GitHub Pages según el plan de tu cuenta; en GitHub Free, normalmente la publicación de Pages requiere un repositorio público. Si lo haces público, los archivos y preguntas serán visibles para cualquiera. Puedes crear un repositorio público separado solo con estos archivos web; no contiene datos personales ni tu historial.

**Importante:** abrir `index.html` como archivo local (`file://`) no activa el modo instalable ni la carga de preguntas. Requiere alojamiento HTTPS, como GitHub Pages. El progreso se guarda solo en el navegador/dispositivo mediante localStorage; si borras los datos de Chrome, se pierde. No hay sincronización ni copias de seguridad.

**Calidad del contenido:** preguntas originales de práctica, no exámenes oficiales; algunas correspondencias de temario aún están pendientes de verificar y la legislación debe contrastarse con textos vigentes y bases de convocatoria. No se ha probado la instalación en un teléfono real.
