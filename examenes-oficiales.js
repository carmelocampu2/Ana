"use strict";
const $=id=>document.getElementById(id),KEY="anatomia_murcia_oficiales_v23";let db=[],exam=null,answers=[],pos=0,history=[];try{history=JSON.parse(localStorage.getItem(KEY+"_history")||"[]");if(!Array.isArray(history))history=[]}catch{history=[]};
function examFingerprint(e){
  // Detecta cambios en el contenido y orden del examen sin depender de claves oficiales.
  const data=JSON.stringify(e.preguntas.map(q=>[q.numero,q.pregunta,q.opciones]));
  let h=2166136261;
  for(let i=0;i<data.length;i++){h^=data.charCodeAt(i);h=Math.imul(h,16777619)}
  return (h>>>0).toString(16).padStart(8,"0");
}
function readDraft(){try{return JSON.parse(localStorage.getItem(KEY+"_draft")||"null")}catch{return null}}
function save(){if(exam){try{localStorage.setItem(KEY+"_draft",JSON.stringify({id:exam.id,answers,pos,fingerprint:examFingerprint(exam)}));}catch(err){console.warn("No se pudo guardar la sesión",err);}}}
function isReserve(q){return q.tipo_pregunta==="reserva"||q.es_reserva===true;}
function isAnnulled(e,q){return (e.anuladas||[]).map(Number).includes(Number(q.numero))||String(q.estado_respuesta||"").toLowerCase().includes("anulada");}
function activeReserveNumbers(e){
  const active=new Set(),consumed=new Set();
  if(e.sustituciones_verificadas!==true)return active;
  const byNumber=new Map(e.preguntas.map(q=>[Number(q.numero),q]));
  for(const [original,replacement] of Object.entries(e.reservas_sustitucion||{})){
    const n=Number(replacement),q=byNumber.get(n),originalQ=byNumber.get(Number(original));
    if(originalQ&&!isReserve(originalQ)&&isAnnulled(e,originalQ)&&q&&isReserve(q)&&!consumed.has(n)){
      consumed.add(n);active.add(n);
    }
  }
  return active;
}
function pendingMain(e,arr){const active=activeReserveNumbers(e);return e.preguntas.filter((q,i)=>((!isReserve(q)&&!isAnnulled(e,q))||active.has(Number(q.numero)))&&!arr[i]).length;}
function updateNavigator(){let nav=$("navigator");nav.replaceChildren();if(!exam)return;exam.preguntas.forEach((q,i)=>{let b=document.createElement("button");b.type="button";b.className="jump";b.textContent=String(q.numero);b.title=`Pregunta ${q.numero}${answers[i]?" · contestada":" · pendiente"}${isReserve(q)?" · reserva":""}${isAnnulled(exam,q)?" · anulada":""}`;b.setAttribute("aria-label",b.title);if(i===pos)b.setAttribute("aria-current","step");if(answers[i])b.classList.add("answered");if(isReserve(q)||isAnnulled(exam,q))b.classList.add("excluded");b.onclick=()=>{pos=i;render()};nav.append(b)});}

function renderHistory(){$("history").replaceChildren();if(!history.length){$("history").textContent="Todavía no hay exámenes finalizados.";return}history.slice(0,20).forEach(h=>{let x=document.createElement("p");x.textContent=`${h.date} · ${h.id} · ${h.answered}/${h.total} contestadas${typeof h.correct==="number"?` · ${h.correct} aciertos · ${h.wrong} errores`:""}`;$("history").append(x)})}
function select(){let e=db.find(x=>x.id===$("model").value);if(!e)return;$("count").textContent=`${e.preguntas.length} preguntas extraídas para practicar (extracción provisional).`;let a=document.createElement("a");a.href=e.fuente_archivo||"#";a.hidden=!e.fuente_archivo;a.textContent="Abrir cuadernillo original completo (PDF)";a.target="_blank";$("pdf").replaceChildren(a);if(e.plantilla_archivo||e.plantilla_publicada_referencia?.fuente){let b=document.createElement("a");b.href=e.plantilla_archivo||e.plantilla_publicada_referencia.fuente;b.target="_blank";b.textContent=" · Ver plantilla de respuestas (PDF)";$("pdf").append(b)}$("start").disabled=!e.preguntas.length; if(e.nota){let note=document.createElement("p");note.textContent=e.nota;$("pdf").append(note)}}
function render(){if(!exam)return;$("exam").hidden=false;$("result").hidden=true;let q=exam.preguntas[pos];$("status").textContent=`${pos+1} de ${exam.preguntas.length} · Contestadas ${answers.filter(Boolean).length} · Computables pendientes ${pendingMain(exam,answers)}`;let root=$("question");root.replaceChildren();let h=document.createElement("h3");h.textContent=`${q.numero}. ${q.pregunta}`;if(isReserve(q)){let info=document.createElement("p");info.textContent="Pregunta de reserva: solo se puntúa si sustituye a una anulada y la correspondencia está verificada.";root.append(info)}if(isAnnulled(exam,q)){let info=document.createElement("p");info.textContent="Pregunta anulada: no puntúa.";root.append(info)}root.append(h);Object.entries(q.opciones).forEach(([letter,txt])=>{let l=document.createElement("label");l.style.cssText="display:block;padding:10px;margin:6px 0;border:1px solid #ccd7e0;border-radius:8px";let r=document.createElement("input");r.type="radio";r.name="answer";r.checked=answers[pos]===letter;r.onchange=()=>{answers[pos]=letter;save();render()};l.append(r,document.createTextNode(` ${letter}) ${txt}`));root.append(l)});$("prev").disabled=pos===0;$("next").disabled=pos===exam.preguntas.length-1;updateNavigator();save()}
function start(e){if(!e||!e.preguntas.length){alert("Este examen está disponible en PDF; práctica interactiva pendiente.");return}exam=e;answers=Array(e.preguntas.length).fill(null);pos=0;render()}
$("model").onchange=select;$("start").onclick=()=>{if(readDraft()&&!confirm("Hay una sesión guardada. Si empiezas otro examen se sustituirá ese progreso. ¿Continuar?"))return;start(db.find(x=>x.id===$("model").value))};$("resume").onclick=()=>{let d=readDraft();let e=d&&db.find(x=>x.id===d.id);if(!e){alert("No hay sesión guardada.");return}if(!Array.isArray(d.answers)||d.answers.length!==e.preguntas.length||!e.preguntas.length){alert("La sesión guardada no coincide con este examen. No se ha modificado el progreso.");return;}
if(d.fingerprint&&d.fingerprint!==examFingerprint(e)){alert("El cuadernillo ha cambiado desde que se guardó la sesión. Por seguridad no se recuperan respuestas sobre preguntas diferentes. El borrador original sigue guardado.");return;}
if(!d.fingerprint&&!confirm("Esta sesión se creó con una versión anterior y no permite comprobar si las preguntas han cambiado. ¿Quieres intentar recuperarla?"))return;exam=e;answers=d.answers.map((v,i)=>v!=null&&Object.hasOwn(e.preguntas[i].opciones,v)?v:null);pos=Number.isInteger(d.pos)?Math.max(0,Math.min(d.pos,e.preguntas.length-1)):0;$("model").value=e.id;select();render()};$("prev").onclick=()=>{pos--;render()};$("next").onclick=()=>{pos++;render()};function gradeExam(e, given){
  const annulled=new Set((e.anuladas||[]).map(Number));
  const byNumber=new Map(e.preguntas.map((q,i)=>[Number(q.numero),{q,i}]));
  const verified=e.sustituciones_verificadas===true;
  const replacement=e.reservas_sustitucion||{};
  const consumed=new Set();
  let correct=0,wrong=0,blank=0,pending=0,cancelled=0,reserves=0,replaced=0;
  function mark(q,i){
    const key=q.respuesta_correcta;
    if(!key||!q.opciones||!Object.prototype.hasOwnProperty.call(q.opciones,key)){pending++;return;}
    if(!given[i])blank++;else if(given[i]===key)correct++;else wrong++;
  }
  e.preguntas.forEach((q,i)=>{
    const n=Number(q.numero),state=String(q.estado_respuesta||"").toLowerCase();
    const reserve=q.tipo_pregunta==="reserva"||q.es_reserva===true;
    if(reserve){reserves++;return;}
    if(annulled.has(n)||state.includes("anulada")){
      cancelled++;
      if(verified&&replacement[n]!=null){
        const rn=Number(replacement[n]),entry=byNumber.get(rn);
        if(entry&&isReserve(entry.q)&&!consumed.has(rn)){
          consumed.add(rn);replaced++;mark(entry.q,entry.i);
        }else pending++;
      }
      return;
    }
    mark(q,i);
  });
  return {correct,wrong,blank,pending,cancelled,reserves,replaced,graded:correct+wrong+blank,verified};
}
$("finish").onclick=()=>{
  if(!exam)return;
  const answered=answers.filter(Boolean).length;
  const mainMissing=pendingMain(exam,answers);
  if(mainMissing&&!confirm(`Hay ${mainMissing} preguntas computables sin responder (incluidas las reservas sustitutas). ¿Finalizar?`))return;
  const g=gradeExam(exam,answers);
  history.unshift({id:exam.id,date:new Date().toLocaleString("es-ES"),answered,total:answers.length,correct:g.correct,wrong:g.wrong,blank:g.blank,pending:g.pending,fingerprint:examFingerprint(exam)});
  history=history.slice(0,100);
  try{localStorage.setItem(KEY+"_history",JSON.stringify(history));localStorage.removeItem(KEY+"_draft");}catch(err){console.warn("No se pudo guardar el historial",err);}
  $("exam").hidden=true;$("result").hidden=false;
  const porcentaje=g.graded?((100*g.correct)/g.graded).toFixed(2):"—";
  const details=`${g.correct} aciertos, ${g.wrong} errores y ${g.blank} sin contestar en ${g.graded} preguntas con clave disponible. ${g.cancelled} anuladas, ${g.reserves} de reserva, ${g.replaced} reservas sustituidas con correspondencia verificada y ${g.pending} sin clave.`;
  $("result").textContent=`Resultado orientativo (NO es nota oficial): ${details} Porcentaje de aciertos sobre preguntas computables: ${porcentaje} %. Las preguntas anuladas no se incluyen en el denominador. Solo se incluyen reservas con correspondencia verificada; el resultado no es una nota oficial.`;
  // Revisión pregunta a pregunta. Se construye con textContent para evitar HTML no fiable.
  const review=document.createElement("section");review.id="review-answers";
  const heading=document.createElement("h3");heading.textContent="Revisión de respuestas";review.append(heading);
  const annulled=new Set((exam.anuladas||[]).map(Number));
  const verified=exam.sustituciones_verificadas===true;
  const substitutions=exam.reservas_sustitucion||{};
  const activeReserves=new Map();
  if(verified){for(const [original,replacement] of Object.entries(substitutions)){
    if(exam.preguntas.some(q=>Number(q.numero)===Number(original)&&!isReserve(q)&&isAnnulled(exam,q))&&exam.preguntas.some(q=>Number(q.numero)===Number(replacement)&&isReserve(q))&&!activeReserves.has(Number(replacement)))activeReserves.set(Number(replacement),Number(original));
  }}
  exam.preguntas.forEach((q,i)=>{
    const n=Number(q.numero),state=String(q.estado_respuesta||"").toLowerCase();
    const cancelled=annulled.has(n)||state.includes("anulada");
    const reserve=isReserve(q),active=reserve&&activeReserves.has(n);
    const key=q.respuesta_correcta;
    const valid=key&&Object.prototype.hasOwnProperty.call(q.opciones||{},key);
    let status;
    if(cancelled)status="Anulada · no puntúa";
    else if(reserve&&!active)status="Reserva no activada · no puntúa";
    else if(!valid)status="Clave pendiente de verificar · sin calificar";
    else if(!answers[i])status="Sin responder";
    else status=answers[i]===key?"Correcta":"Incorrecta";
    const item=document.createElement("details");item.className="review-item";
    const summary=document.createElement("summary");
    summary.textContent=`Pregunta ${q.numero} · ${status}${active?` · sustituye a la ${activeReserves.get(n)}`:""}`;
    item.append(summary);
    const question=document.createElement("p");question.textContent=q.pregunta;item.append(question);
    for(const [letter,option] of Object.entries(q.opciones||{})){
      const line=document.createElement("p");line.textContent=`${letter}) ${option}`;item.append(line);
    }
    const response=document.createElement("p");
    response.textContent=`Tu respuesta: ${answers[i]||"Sin responder"}. ${cancelled?"Pregunta anulada; la clave no se utiliza.":reserve&&!active?"Reserva no activada; la clave no se utiliza.":valid?`Clave registrada: ${key}${String(q.estado_respuesta||"").includes("pendiente")?" (pendiente de verificación definitiva)":""}.`:"No existe una clave comprobable."}`;
    item.append(response);review.append(item);
  });
  $("result").append(review);
  exam=null;renderHistory();
};
fetch("examenes-oficiales.json").then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{db=d.examenes;let model=$("model");model.replaceChildren();db.forEach(e=>{let o=document.createElement("option");o.value=e.id;o.textContent=`${e.comunidad} · ${e.anio} · ${e.modelo||e.id}${!e.preguntas.length?" · PDF / pendiente":""}${e.tipo==="repertorio"?" · Banco oficial":""}`;model.append(o)});select();renderHistory()}).catch(()=>{$("count").textContent="No se pudo cargar el banco de exámenes."});

// Copias de seguridad manuales. Nunca sobrescribir sin confirmación.
function validateBackup(b){
 if(!b||b.format!=="anatomia-murcia-oficiales-backup"||b.version!==1||!Array.isArray(b.history)||b.history.length>100)throw Error("Formato de copia no válido o historial demasiado largo.");
 if(!Object.prototype.hasOwnProperty.call(b,"draft"))throw Error("Falta la sesión en la copia.");
 if(b.history.some(h=>!h||typeof h.id!=="string"||!h.id||typeof h.date!=="string"||!h.date||!Number.isInteger(h.answered)||!Number.isInteger(h.total)||h.answered<0||h.total<0||h.answered>h.total||h.total>500))throw Error("El historial contiene registros no válidos.");
 if(b.draft!==null){
   const d=b.draft;
   if(!d||typeof d.id!=="string"||!d.id||!Array.isArray(d.answers)||d.answers.length<1||d.answers.length>500||!Number.isInteger(d.pos)||d.pos<0||d.pos>=d.answers.length||d.answers.some(v=>v!==null&&!(["A","B","C","D","E"].includes(v)))|| (d.fingerprint!==undefined&&!(typeof d.fingerprint==="string"&&/^[0-9a-f]{8}$/.test(d.fingerprint))))throw Error("La sesión de la copia no es válida.");
 }
 return b;
}
$("backup-export").onclick=()=>{
 try{const b={format:"anatomia-murcia-oficiales-backup",version:1,created:new Date().toISOString(),history,draft:readDraft()};
 validateBackup(b);const blob=new Blob([JSON.stringify(b,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="anatomia-murcia-progreso.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$("backup-message").textContent="Copia preparada. Comprueba que se ha guardado en Descargas.";
 }catch(err){$("backup-message").textContent="No se pudo exportar la copia: "+err.message;}
};
$("backup-import").onclick=()=>$("backup-file").click();
$("backup-file").onchange=async()=>{
 const f=$("backup-file").files[0];if(!f)return;
 try{if(f.size>2000000)throw Error("Archivo demasiado grande.");const b=validateBackup(JSON.parse(await f.text()));
 if(exam&&!confirm("Hay un examen abierto en esta pantalla. Importar una copia cerrará la sesión visible. ¿Continuar?"))return;
 if(!confirm(`La copia contiene ${b.history.length} resultados y ${b.draft?"una sesión pendiente":"ninguna sesión pendiente"}. Se sustituirá el historial y la sesión guardados en este navegador. ¿Continuar?`))return;
 // Validar todo antes de escribir; restaurar ambos valores si falla la escritura.
 const oldH=localStorage.getItem(KEY+"_history"),oldD=localStorage.getItem(KEY+"_draft");
 try{localStorage.setItem(KEY+"_history",JSON.stringify(b.history));if(b.draft)localStorage.setItem(KEY+"_draft",JSON.stringify(b.draft));else localStorage.removeItem(KEY+"_draft");}
 catch(err){if(oldH===null)localStorage.removeItem(KEY+"_history");else localStorage.setItem(KEY+"_history",oldH);if(oldD===null)localStorage.removeItem(KEY+"_draft");else localStorage.setItem(KEY+"_draft",oldD);throw err;}
 history=b.history;exam=null;answers=[];$("exam").hidden=true;$("result").hidden=true;renderHistory();$("backup-message").textContent="Progreso importado. Pulsa Recuperar sesión para continuar el borrador, si existe.";
 }catch(err){$("backup-message").textContent="No se importó la copia: "+err.message;}finally{$("backup-file").value="";}
};
