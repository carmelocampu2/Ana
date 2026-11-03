'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const KEY='ana-sergas-2025-es-v1';
  let db=null, mode=null, at=0, answers={}, finished=false;
  const getSet=()=>mode==='especifica'?db.parte_especifica:db.parte_comun;
  const selected=()=>answers[mode]||{};
  const persist=()=>{try{localStorage.setItem(KEY, JSON.stringify({mode,at,answers,finished}));}catch(e){console.warn('No se pudo guardar el progreso',e);}};
  const readState=()=>{try{let x=JSON.parse(localStorage.getItem(KEY)||'{}');answers=x.answers&&typeof x.answers==='object'?x.answers:{};mode=x.mode==='especifica'||x.mode==='comun'?x.mode:null;at=Number.isInteger(x.at)?x.at:0;finished=x.finished===true;}catch(e){console.warn('Sesión anterior no recuperable',e);}};
  const isAnnulled=q=>mode==='especifica'&&db.anuladas_especifica.includes(q.numero);
  const isReserve=q=>q.es_reserva===true;
  function choose(which){
    if(mode===which&&!finished){$('exercise').hidden=false;$('results').hidden=true;render();return;}
    if(mode===which&&finished){if(!confirm('¿Repetir este ejercicio desde cero?'))return;answers[which]={};}
    if(mode&&!finished&&Object.keys(selected()).length&&!confirm('Cambiar de ejercicio guardará las respuestas actuales. ¿Continuar?'))return;
    mode=which;at=0;finished=false;persist();$('results').hidden=true;$('exercise').hidden=false;render();
  }
  function showQuestionOption(q,letter,txt){
    let label=document.createElement('label');label.className='exam-answer'+(selected()[q.referencia]===letter?' selected':'');
    const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.value=letter;radio.checked=selected()[q.referencia]===letter;
    radio.addEventListener('change',()=>{answers[mode]??={};answers[mode][q.referencia]=letter;persist();render();});
    label.append(radio,document.createTextNode(letter+') '+txt));return label;
  }
  function render(){
    if(!db||!mode)return;
    const set=getSet();at=Math.max(0,Math.min(at,set.length-1));let q=set[at],asked=Object.keys(selected()).filter(k=>set.some(x=>x.referencia===k)).length;
    $('progress').textContent='Pregunta '+(at+1)+' de '+set.length;
    $('answered').textContent=asked+' respondidas';$('progress-bar').style.width=(100*(at+1)/set.length)+'%';
    let root=$('question');root.replaceChildren();
    let title=document.createElement('h2');title.textContent=q.referencia+'. '+q.pregunta;root.append(title);
    if(isAnnulled(q)||isReserve(q)){
      let note=document.createElement('p');note.className='small-note';
      if(isAnnulled(q)) note.textContent='Pregunta anulada por la plantilla definitiva; no se puntúa.';
      else if(mode==='especifica'&&q.numero<=105)note.textContent='Pregunta de reserva E'+q.numero+': se utiliza para sustituir, por orden, una pregunta anulada.';
      else note.textContent='Pregunta de reserva no activada en este ejercicio; puede responderse para practicar.';
      root.append(note);
    }
    Object.entries(q.opciones).forEach(([key,txt])=>root.append(showQuestionOption(q,key,txt)));
    $('previous').disabled=at===0;$('next').disabled=at===set.length-1;
    let nav=$('navigator');nav.replaceChildren();
    set.forEach((item,i)=>{let btn=document.createElement('button');btn.type='button';btn.textContent=item.referencia;btn.title=(item.es_reserva?'Reserva · ':'')+(isAnnulled(item)?'Anulada · ':'')+(selected()[item.referencia]?'Respondida':'Pendiente');btn.className=(selected()[item.referencia]?'answered ':'')+(i===at?'active ':'')+((isReserve(item)||isAnnulled(item))?'special':'');btn.addEventListener('click',()=>{at=i;persist();render();window.scrollTo({top:0,behavior:'smooth'});});nav.append(btn);});
  }
  const substitute=()=>db.reservas_activadas_especifica||{};
  function count(){
    let rows=getSet(),main=rows.filter(q=>!q.es_reserva),included=[];
    for(let q of main){
      if(isAnnulled(q)){
        const n=substitute()[String(q.numero)],sq=rows.find(x=>x.numero===n&&x.es_reserva);
        if(sq)included.push({...sq,sustituye:q.numero});
      } else included.push(q);
    }
    let hit=0,fail=0,blank=0;
    included.forEach(q=>{let response=selected()[q.referencia];if(!response)blank++;else if(response===q.respuesta_correcta)hit++;else fail++;});
    return {hit,fail,blank,included};
  }
  function finish(){
    if(!mode)return;
    const total=mode==='especifica'?100:10;
    const {hit,fail,blank,included}=count();
    if(blank&&!confirm('Tienes '+blank+' preguntas computables sin responder de '+total+'. ¿Finalizar?'))return;
    finished=true;persist();$('exercise').hidden=true;let root=$('results');root.hidden=false;root.replaceChildren();
    const heading=document.createElement('h2');heading.textContent='Corrección · '+(mode==='especifica'?'Parte específica':'Parte común');root.append(heading);
    const p=document.createElement('p');p.textContent='Aciertos: '+hit+' · Errores: '+fail+' · Sin contestar: '+blank+' · Preguntas computables: '+included.length;root.append(p);
    const grade=document.createElement('p');grade.textContent='Puntuación orientativa: '+(hit*.5-fail*.125).toFixed(3).replace('.',',')+' puntos (0,50 por acierto; −0,125 por error).';root.append(grade);
    let note=document.createElement('p');note.className='small-note';note.textContent=mode==='especifica'?db.nota_reservas+' Es una simulación, no una certificación de la nota oficial.':'Las dos preguntas comunes de reserva (C11–C12) no se utilizan en el cómputo porque no hay preguntas comunes anuladas.';root.append(note);
    const section=document.createElement('section');section.className='exam-review';
    const h=document.createElement('h3');h.textContent='Revisión de las '+getSet().length+' preguntas';section.append(h);
    const includedRefs=new Set(included.map(q=>q.referencia));
    getSet().forEach(q=>{
      let val=selected()[q.referencia],scored=includedRefs.has(q.referencia),ans=q.respuesta_correcta;
      let details=document.createElement('details');const summary=document.createElement('summary');
      summary.textContent=q.referencia+' · '+(!scored?(isAnnulled(q)?'Anulada':'Reserva no utilizada'):(val?val===ans?'Correcta':'Incorrecta':'Sin responder'));
      details.append(summary);
      let question=document.createElement('p');question.textContent=q.pregunta;details.append(question);
      Object.entries(q.opciones).forEach(([letter,text])=>{let option=document.createElement('p');option.textContent=letter+') '+text;details.append(option);});
      let user=document.createElement('p');user.textContent='Tu respuesta: '+(val||'Sin responder')+'. Plantilla definitiva: '+(ans||'Anulada')+'.'+(!scored?' (Sin puntuación)':'');details.append(user);section.append(details);
    });
    root.append(section);let again=document.createElement('button');again.type='button';again.textContent='Repetir este ejercicio';again.addEventListener('click',()=>{if(!confirm('¿Reiniciar las respuestas de esta parte?'))return;answers[mode]={};at=0;finished=false;persist();root.hidden=true;$('exercise').hidden=false;render();});root.append(again);window.scrollTo({top:0,behavior:'smooth'});
  }
  $('choose-specific').addEventListener('click',()=>choose('especifica'));
  $('choose-common').addEventListener('click',()=>choose('comun'));
  $('previous').addEventListener('click',()=>{if(at>0){at--;persist();render();}});
  $('next').addEventListener('click',()=>{if(at<getSet().length-1){at++;persist();render();}});
  $('end').addEventListener('click',finish);
  fetch('galicia-2025.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('No se pudo descargar el banco de preguntas ('+r.status+')');return r.json();}).then(data=>{
    if(data.parte_especifica?.length!==110||data.parte_comun?.length!==12)throw Error('El banco de Galicia 2025 está incompleto.');
    db=data;$('loading').hidden=true;readState();if(mode&&!finished){$('exercise').hidden=false;render();}
    else if(mode&&finished){$('results').hidden=false;$('results').textContent='El último ejercicio ya fue corregido. Pulsa el botón de su parte para repetirlo desde cero o selecciona la otra parte.';}
  }).catch(err=>{$('loading').textContent='No se puede abrir el test: '+err.message+'. Comprueba que galicia-2025.json y galicia-2025.js estén en la misma carpeta que esta página.';});
})();
