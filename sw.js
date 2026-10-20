// v6.9: network-first para evitar servir versiones antiguas al recuperar conexion.
// Solo elimina caches de esta PWA; nunca modifica localStorage.
const CACHE='anatomia-murcia-v75-andalucia-definitiva';
const ASSETS=["./", "./index.html", "./app.js", "./styles.css", "./questions.json", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./simulacros.html", "./simulacros.js", "./examenes-oficiales.html", "./examenes-oficiales.js", "./examenes-oficiales.json", "./revision-preguntas-murcia.html", "./auditoria-claves-murcia.html", "./auditoria-directa-plantillas-v61.html", "./control-reservas-v63.html", "./trazabilidad-plantillas-v64.html", "./fuentes-oficiales.html", "./convocatorias.html", "./convocatorias.js", "./convocatorias-oficiales.json", "./plantillas.html", "./plantillas.js", "./repaso-revisado.html", "./repaso-revisado.js", "./repaso-revisado.json", "./temario-murcia-2026.html", "./diagnostico-v67.html", "./copia-progreso-v68.html", "./pruebas-v70.html", "./pruebas-v70.js", "./copia-progreso-v68.js"];
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('anatomia-murcia-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(request);
      if(response.ok && response.type!=='opaque'){
        const cache=await caches.open(CACHE);
        await cache.put(request,response.clone()).catch(()=>{});
      }
      return response;
    }catch(error){
      const cached=await caches.match(request);
      if(cached)return cached;
      if(request.mode==='navigate'){
        const home=await caches.match(new URL('./index.html',self.registration.scope).href);
        if(home)return home;
      }
      return Response.error();
    }
  })());
});
