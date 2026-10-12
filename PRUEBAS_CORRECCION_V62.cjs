const assert=require('node:assert/strict'); const fs=require('node:fs');
function gradeExam(e, given){
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
const db=JSON.parse(fs.readFileSync('examenes-oficiales.json','utf8'));
for(const e of db.examenes.filter(e=>e.id.startsWith('SMS-2019-'))){
  const correct=e.preguntas.map(q=>q.respuesta_correcta);
  const full=gradeExam(e,correct);
  assert.equal(full.correct,99); assert.equal(full.cancelled,1);assert.equal(full.graded,99);
  const empty=gradeExam(e,Array(e.preguntas.length).fill(null));
  assert.equal(empty.blank,99); assert.equal(empty.cancelled,1);assert.equal(empty.graded,99);
  const cancelledOnly=Array(e.preguntas.length).fill(null);cancelledOnly[30]='A';
  const check=gradeExam(e,cancelledOnly);assert.equal(check.blank,99);assert.equal(check.correct,0);
  const wrong=correct.map((x,i)=>i===30?x:({A:'B',B:'C',C:'D',D:'A'}[x]));
  const allWrong=gradeExam(e,wrong);assert.equal(allWrong.wrong,99);assert.equal(allWrong.cancelled,1);
  console.log(e.id, 'OK: 99 computables, 1 anulada; respuestas vacías/correctas/erróneas comprobadas');
}
