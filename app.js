const seedPigeons=[
 {id:"p-toretto",name:"Toretto",ring:"ESP-2024-01587",owner:"Rubén Vila",color:"Rojo",sex:"Macho",birth:"2024-03-15",father:"TOR_OCONN",mother:"FUEGO",fatherId:"",motherId:"",status:"Activo"},
 {id:"p-bumblebee",name:"Bumblebee",ring:"ESP-2023-00842",owner:"Rubén Vila",color:"Mascarado Plomes",sex:"Macho",birth:"2023-04-08",father:"Desconocido",mother:"Desconocida",fatherId:"",motherId:"",status:"Activo"},
 {id:"p-brisa",name:"Brisa",ring:"ESP-2024-02111",owner:"Rubén Vila",color:"Azul",sex:"Hembra",birth:"2024-02-22",father:"Norte",mother:"Luna",fatherId:"",motherId:"",status:"Activo"}
];
const makeId=(prefix="x")=>prefix+"-"+Date.now()+"-"+Math.random().toString(36).slice(2,7);
const defaultTraits=["Perseguidor","Constante","Fuerte","Ágil","Inteligente","Buen cierre","Buen reproductor"];
let pigeons=JSON.parse(localStorage.getItem("colombaire_pigeons")||"null")||seedPigeons;
pigeons=pigeons.map(p=>({...p,id:p.id||makeId("p"),fatherId:p.fatherId||"",motherId:p.motherId||""}));
let pairs=JSON.parse(localStorage.getItem("colombaire_pairs")||"[]");
let currentId=null,currentPairId=null,currentClutchId=null,currentChickId=null;
let currentPage="inicio";
let navigationHistory=[];
const breedingSettings=JSON.parse(localStorage.getItem("colombaire_breeding_settings")||"null")||{ringStartDay:6,ringCriticalDay:10};
localStorage.setItem("colombaire_breeding_settings",JSON.stringify(breedingSettings));
const pages=[...document.querySelectorAll(".page")],$=s=>document.querySelector(s);
function save(){localStorage.setItem("colombaire_pigeons",JSON.stringify(pigeons));localStorage.setItem("colombaire_pairs",JSON.stringify(pairs))}
save();
function byId(id){return pigeons.find(p=>p.id===id)}
function pairById(id){return pairs.find(p=>p.id===id)}
function fmtDate(v){if(!v)return"Sin registrar";if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return v;const[y,m,d]=v.split("-");return`${d}/${m}/${y}`}
function addDays(v,n){const d=new Date(v+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function ageDays(v){if(!v)return null;return Math.floor((Date.now()-new Date(v+"T12:00:00"))/86400000)}
function parentName(p,type){const id=p[type+"Id"];if(id&&byId(id))return byId(id).name;return p[type]||(type==="father"?"Desconocido":"Desconocida")}
function showPage(id){
 pages.forEach(p=>p.classList.toggle("active",p.id===id));
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("selected",b.dataset.go===id));
 if(id==="cria")renderBreeding();
 currentPage=id;
 window.scrollTo(0,0);
}
function go(id,opts={}){
 if(!id||id===currentPage)return;
 if(!opts.replace&&!opts.fromBack)navigationHistory.push(currentPage);
 showPage(id);
}
function goBack(){
 const previous=navigationHistory.pop();
 if(previous)showPage(previous);
 else showPage("inicio");
}
document.addEventListener("click",e=>{
 const back=e.target.closest(".app-back");
 if(back){e.preventDefault();goBack();return;}
 const g=e.target.closest("[data-go]");
 if(g)go(g.dataset.go);
});
document.querySelectorAll("nav [data-go]").forEach(btn=>btn.addEventListener("click",()=>{navigationHistory=[];}));

// MI PALOMAR
function render(list=pigeons){const box=$("#pigeonList");$("#pigeonCount").textContent=`${pigeons.length} palomo${pigeons.length===1?"":"s"} registrado${pigeons.length===1?"":"s"}`;box.innerHTML=list.map(p=>{const sx=p.sex==="Macho"?"♂":p.sex==="Hembra"?"♀":"?";return`<div class="list-card" data-id="${p.id}"><div><b>${p.name||"Sin nombre"}</b><small>${p.ring||"Sin anilla"} · ${p.color||"Sin pelaje"}</small><small>Padre: ${parentName(p,"father")} · Madre: ${parentName(p,"mother")}</small><span class="status-pill">${p.status||"Activo"}</span></div><div class="sex">${sx}</div></div>`}).join("");box.querySelectorAll(".list-card").forEach(c=>c.onclick=()=>openPigeon(c.dataset.id))}
function openPigeon(id){currentId=id;const p=byId(id);if(!p)return;$("#f-name").textContent=p.name||"Sin nombre";$("#f-ring").textContent=p.ring||"Sin anilla";["ring","owner","color","sex"].forEach(k=>$("#d-"+k).textContent=p[k]||"Sin registrar");$("#d-birth").textContent=fmtDate(p.birth);$("#d-father").textContent=parentName(p,"father");$("#d-mother").textContent=parentName(p,"mother");go("ficha")}
function fillParentSelects(editId){const f=$("#p-father"),m=$("#p-mother");f.innerHTML='<option value="">Desconocido / no registrado</option>';m.innerHTML='<option value="">Desconocida / no registrada</option>';pigeons.filter(p=>p.id!==editId&&p.sex==="Macho").forEach(p=>f.add(new Option(`${p.name} · ${p.ring||"sin anilla"}`,p.id)));pigeons.filter(p=>p.id!==editId&&p.sex==="Hembra").forEach(p=>m.add(new Option(`${p.name} · ${p.ring||"sin anilla"}`,p.id)))}
function openForm(id=null){currentId=id;const p=id?byId(id):{name:"",ring:"",owner:"",color:"",sex:"",birth:"",father:"",mother:"",fatherId:"",motherId:"",status:"Activo"};$("#formTitle").textContent=id?"EDITAR PALOMO":"NUEVO PALOMO";$("#p-index").value=id||"";["name","ring","owner","color","sex","birth","status"].forEach(k=>$("#p-"+k).value=p[k]||"");fillParentSelects(id);$("#p-father").value=p.fatherId||"";$("#p-mother").value=p.motherId||"";$("#deletePigeon").style.display=id?"inline-block":"none";$(".primary").textContent=id?"Guardar cambios":"Guardar palomo";go("palomoForm")}
$("#addPigeon").onclick=()=>openForm();$("#editPigeon").onclick=()=>openForm(currentId);
$("#pigeonForm").addEventListener("submit",e=>{e.preventDefault();const id=$("#p-index").value,old=id?byId(id):{},p={...old,id:id||makeId("p")};["name","ring","owner","color","sex","birth","status"].forEach(k=>p[k]=$("#p-"+k).value.trim());p.fatherId=$("#p-father").value;p.motherId=$("#p-mother").value;p.father=p.fatherId&&byId(p.fatherId)?byId(p.fatherId).name:(old.father||"Desconocido");p.mother=p.motherId&&byId(p.motherId)?byId(p.motherId).name:(old.mother||"Desconocida");if(id)pigeons=pigeons.map(x=>x.id===id?p:x);else pigeons.unshift(p);save();render();openPigeon(p.id)});
$("#deletePigeon").onclick=()=>{const p=byId(currentId);if(!p)return;$("#deleteTitle").textContent=`¿Eliminar a ${p.name}?`;$("#deleteModal").classList.add("show")};$("#cancelDelete").onclick=closeModal;function closeModal(){$("#deleteModal").classList.remove("show")}$("#confirmDelete").onclick=()=>{const doomed=currentId;pigeons=pigeons.filter(p=>p.id!==doomed).map(p=>({...p,fatherId:p.fatherId===doomed?"":p.fatherId,motherId:p.motherId===doomed?"":p.motherId}));save();render();closeModal();go("palomar")};
$("#search").addEventListener("input",e=>{const q=e.target.value.toLowerCase();render(pigeons.filter(p=>Object.values(p).join(" ").toLowerCase().includes(q)))});
document.querySelectorAll(".filters button").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".filters button").forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");const t=btn.textContent;let list=pigeons;if(t==="Machos")list=pigeons.filter(p=>p.sex==="Macho");if(t==="Hembras")list=pigeons.filter(p=>p.sex==="Hembra");if(t==="Activos")list=pigeons.filter(p=>(p.status||"Activo")==="Activo");render(list)}));

// CRÍA
function renderBreeding(){
 const active=pairs.filter(p=>p.status!=="Finalizada");
 $("#pairCount").textContent=active.length;
 const clutches=pairs.flatMap(p=>p.clutches||[]);
 $("#eggCount").textContent=clutches.reduce((a,c)=>a+(c.eggData?c.eggData.filter(e=>e.date).length:(+c.eggs||0)),0);
 const chicks=pigeons.filter(p=>p.source==="breeding");
 $("#chickCount").textContent=chicks.length;
 const due=chicks.filter(p=>{const a=ageDays(p.birth);return !p.ring&&a!==null&&a>=breedingSettings.ringStartDay});
 const soon=clutches.filter(c=>{const base=c.eggData?.find(e=>e.date)?.date||c.date;if(!base)return false;const diff=Math.ceil((new Date(addDays(base,18))-new Date())/86400000);return diff>=0&&diff<=3});
 let alerts="";
 if(due.length){const critical=due.filter(p=>ageDays(p.birth)>=breedingSettings.ringCriticalDay).length;alerts+=`<div class="alert urgent"><b>💍 ${due.length} pichón${due.length>1?"es":""} pendiente${due.length>1?"s":""} de anillar</b><small>${critical?`⚠️ ${critical} en día ${breedingSettings.ringCriticalDay} o superior · `:""}Aviso configurado desde día ${breedingSettings.ringStartDay}</small></div>`;}
 if(soon.length)alerts+=`<div class="alert"><b>🥚 ${soon.length} puesta${soon.length>1?"s":""} próxima${soon.length>1?"s":""} a eclosionar</b><small>Según fecha orientativa de incubación</small></div>`;
 $("#breedingAlerts").innerHTML=alerts||'<div class="alert-ok">Sin avisos pendientes de cría.</div>';
 $("#noPairs").style.display=active.length?"none":"block";
 $("#pairList").innerHTML=active.map(p=>{const m=byId(p.maleId),f=byId(p.femaleId);return`<div class="breeding-pair" data-pair="${p.id}"><div class="pair-head"><div><small>♂ MACHO</small><b>${m?.name||"No disponible"}</b><small>${m?.color||""}</small></div><strong>×</strong><div><small>♀ HEMBRA</small><b>${f?.name||"No disponible"}</b><small>${f?.color||""}</small></div></div><div class="pair-meta">${(p.clutches||[]).length} puesta(s) registrada(s) · ${p.status}</div></div>`}).join("");
 document.querySelectorAll("[data-pair]").forEach(x=>x.onclick=()=>openPair(x.dataset.pair));
}
function openPairForm(){
 const m=$("#pairMale"),f=$("#pairFemale");m.innerHTML='<option value="">Seleccionar macho</option>';f.innerHTML='<option value="">Seleccionar hembra</option>';
 pigeons.filter(p=>p.sex==="Macho"&&(p.status||"Activo")==="Activo").forEach(p=>m.add(new Option(`${p.name} · ${p.ring||"sin anilla"}`,p.id)));
 pigeons.filter(p=>p.sex==="Hembra"&&(p.status||"Activo")==="Activo").forEach(p=>f.add(new Option(`${p.name} · ${p.ring||"sin anilla"}`,p.id)));
 $("#pairDate").value=new Date().toISOString().slice(0,10);go("pairForm");
}
$("#addPair").onclick=openPairForm;
$("#newPairForm").addEventListener("submit",e=>{e.preventDefault();const maleId=$("#pairMale").value,femaleId=$("#pairFemale").value;if(!maleId||!femaleId)return;pairs.unshift({id:makeId("pair"),maleId,femaleId,date:$("#pairDate").value,status:$("#pairStatus").value,clutches:[]});save();renderBreeding();go("cria")});
function openPair(id){currentPairId=id;const p=pairById(id),m=byId(p.maleId),f=byId(p.femaleId);$("#pairTitle").textContent=`${m?.name||"Macho"} × ${f?.name||"Hembra"}`;$("#pairSubtitle").textContent=`Desde ${fmtDate(p.date)} · ${p.status}`;$("#pairParents").innerHTML=`<div><small>♂ MACHO</small><b>${m?.name||""}</b><small>${m?.ring||""} · ${m?.color||""}</small></div><strong>×</strong><div><small>♀ HEMBRA</small><b>${f?.name||""}</b><small>${f?.ring||""} · ${f?.color||""}</small></div>`;renderPairDetail();go("pairDetail")}
function renderPairDetail(){const p=pairById(currentPairId);$("#clutchList").innerHTML=(p.clutches||[]).map((c,i)=>{const eggs=c.eggData||Array.from({length:c.eggs||0},(_,j)=>({date:j===0?c.date:"",fert:"Pendiente"}));const present=eggs.filter(e=>e.date);const base=present[0]?.date||c.date;return`<div class="clutch-card" data-clutch="${c.id}"><b>Puesta ${i+1} · ${present.length} huevo(s)</b><small>${present.map((e,j)=>`H${j+1}: ${fmtDate(e.date)} · Fecundado: ${e.fert||"Pendiente"}`).join(" · ")}</small>${base?`<small>Eclosión orientativa: ${fmtDate(addDays(base,18))}</small>`:""}</div>`}).join("")||'<div class="alert-ok">Aún no hay puestas registradas.</div>';document.querySelectorAll("[data-clutch]").forEach(x=>x.onclick=()=>openClutch(x.dataset.clutch));const chicks=pigeons.filter(x=>x.sourcePairId===p.id);$("#pairChicks").innerHTML=chicks.map(c=>`<div class="chick-link" data-chick="${c.id}"><b>${c.name||"Pichón"} · ${c.ring||"Sin anilla"}</b><small>Nacido ${fmtDate(c.birth)} · ${c.sex}</small></div>`).join("")||'<div class="alert-ok">Aún no hay pichones registrados.</div>';document.querySelectorAll("[data-chick]").forEach(x=>x.onclick=()=>openChick(x.dataset.chick))}
function openClutchForm(){const p=pairById(currentPairId),m=byId(p.maleId),f=byId(p.femaleId);$("#clutchPairName").textContent=`${m?.name} × ${f?.name}`;$("#egg1Date").value=new Date().toISOString().slice(0,10);$("#egg2Date").value="";$("#egg1Fert").value="Pendiente";$("#egg2Fert").value="Pendiente";updatePrediction();go("clutchForm")}
$("#newClutchBtn").onclick=openClutchForm;$("#newClutchBtn2").onclick=openClutchForm;
function updatePrediction(){if($("#egg1Date").value)$("#hatchPrediction").innerHTML=`Eclosión orientativa alrededor del <b>${fmtDate(addDays($("#egg1Date").value,18))}</b>.`;else $("#hatchPrediction").textContent="La app calculará la fecha orientativa de eclosión."}
$("#egg1Date").addEventListener("change",updatePrediction);
$("#newClutchForm").addEventListener("submit",e=>{e.preventDefault();const p=pairById(currentPairId);p.clutches=p.clutches||[];const eggData=[{date:$("#egg1Date").value,fert:$("#egg1Fert").value},{date:$("#egg2Date").value,fert:$("#egg2Fert").value}];p.clutches.push({id:makeId("cl"),date:eggData[0].date,eggData,births:0});save();openPair(currentPairId)});
function openClutch(id){currentClutchId=id;const p=pairById(currentPairId),c=p.clutches.find(x=>x.id===id);const eggs=c.eggData||Array.from({length:c.eggs||0},(_,i)=>({date:i===0?c.date:"",fert:"Pendiente"}));const present=eggs.filter(e=>e.date);const base=present[0]?.date||c.date;$("#clutchDetailSub").textContent=`Primer huevo ${fmtDate(base)}`;$("#clutchInfo").innerHTML=`<h3>PUESTA</h3><div class="detail-grid"><div><small>Huevos registrados</small><b>${present.length}</b></div><div><small>Eclosión orientativa</small><b>${base?fmtDate(addDays(base,18)):"Sin calcular"}</b></div><div><small>Nacimientos registrados</small><b>${c.births||0}</b></div></div>`;$("#eggList").innerHTML=eggs.map((e,i)=>e.date?`<div class="egg-card"><b>🥚 Huevo ${i+1}</b><small>Fecha: ${fmtDate(e.date)}</small><small>Fecundado: <strong>${e.fert||"Pendiente"}</strong></small><div class="fert-actions"><button data-fert="${i}:Sí">Sí</button><button data-fert="${i}:No">No</button><button data-fert="${i}:Pendiente">Pendiente</button></div></div>`:"").join("")||'<div class="alert-ok">No hay huevos registrados.</div>';document.querySelectorAll("[data-fert]").forEach(b=>b.onclick=()=>{const [i,val]=b.dataset.fert.split(":");c.eggData=c.eggData||eggs;c.eggData[+i].fert=val;save();openClutch(id)});go("clutchDetail")}
$("#registerBirthBtn").onclick=()=>{$("#birthDate").value=new Date().toISOString().slice(0,10);$("#birthSex").value="Sin determinar";$("#birthName").value="";$("#birthColor").value="";$("#birthRing").value="";go("birthForm")};
$("#newBirthForm").addEventListener("submit",e=>{e.preventDefault();const pair=pairById(currentPairId),male=byId(pair.maleId),female=byId(pair.femaleId),c=pair.clutches.find(x=>x.id===currentClutchId);const chick={id:makeId("p"),name:$("#birthName").value.trim()||"Pichón",ring:$("#birthRing").value.trim(),owner:male?.owner||female?.owner||"",color:$("#birthColor").value.trim(),sex:$("#birthSex").value,birth:$("#birthDate").value,father:male?.name||"Desconocido",mother:female?.name||"Desconocida",fatherId:pair.maleId,motherId:pair.femaleId,status:"Activo",ringDate:"",breedingStage:$("#birthRing").value.trim()?"Anillado":"Pichón en nido",source:"breeding",sourcePairId:pair.id,sourceClutchId:c.id};pigeons.unshift(chick);c.births=(c.births||0)+1;save();render();renderBreeding();openChick(chick.id)});
$("#finishPairBtn").onclick=()=>{const p=pairById(currentPairId);if(confirm("¿Finalizar esta pareja de cría? Su historial se conservará.")){p.status="Finalizada";save();renderBreeding();go("cria")}};


function ringingState(p){
 const a=ageDays(p.birth);
 if(p.ring)return{cls:"ring-ok",icon:"✓",title:"Anillado",text:`Anillado ${p.ringDate?fmtDate(p.ringDate):""}`};
 if(a===null)return{cls:"ring-normal",icon:"🐣",title:"Pichón en seguimiento",text:"Edad sin calcular"};
 if(a<breedingSettings.ringStartDay)return{cls:"ring-normal",icon:"🐣",title:"Pichón en nido",text:`${a} día${a===1?"":"s"} · aún no entra en aviso de anillado`};
 if(a===breedingSettings.ringStartDay)return{cls:"ring-soon",icon:"💍",title:"Próximo a anillar",text:`Día ${a} · comienza el periodo configurado de anillado`};
 if(a<breedingSettings.ringCriticalDay)return{cls:"ring-recommended",icon:"💍",title:"Anillado recomendado",text:`Día ${a} · pendiente de anillar`};
 if(a===breedingSettings.ringCriticalDay)return{cls:"ring-critical",icon:"⚠️",title:"ANILLADO URGENTE",text:`Día ${a} · el tamaño del pichón puede dificultar el anillado`};
 return{cls:"ring-critical",icon:"⚠️",title:"REVISAR ANILLADO",text:`Día ${a} · supera el límite crítico configurado (${breedingSettings.ringCriticalDay})`};
}
function openChick(id){
 currentChickId=id;const p=byId(id);if(!p)return;
 const st=ringingState(p),a=ageDays(p.birth);
 $("#chickDetailSub").textContent=`${parentName(p,"father")} × ${parentName(p,"mother")} · ${a===null?"Edad sin calcular":a+" días"}`;
 $("#chickStatusCard").innerHTML=`<h3>${p.name||"Pichón"}</h3><div class="detail-grid"><div><small>Nacimiento</small><b>${fmtDate(p.birth)}</b></div><div><small>Padre</small><b>${parentName(p,"father")}</b></div><div><small>Madre</small><b>${parentName(p,"mother")}</b></div><div><small>Anilla</small><b>${p.ring||"Pendiente"}</b></div></div>`;
 $("#ringingAlertBox").innerHTML=`<div class="ring-status ${st.cls}"><span>${st.icon}</span><div><b>${st.title}</b><small>${st.text}</small></div></div>`;
 $("#ringChickBtn").style.display=p.ring?"none":"inline-block";
 $("#openChickPigeonBtn").style.display=p.ring?"inline-block":"none";
 go("chickDetail");
}
$("#ringChickBtn").onclick=()=>{
 const p=byId(currentChickId);if(!p)return;
 $("#ringFormSub").textContent=`${parentName(p,"father")} × ${parentName(p,"mother")} · nacido ${fmtDate(p.birth)}`;
 $("#ringNumber").value=p.ring||"";$("#ringDate").value=new Date().toISOString().slice(0,10);$("#ringName").value=p.name==="Pichón"?"":(p.name||"");$("#ringColor").value=p.color||"";$("#ringSex").value=p.sex||"Sin determinar";go("ringForm");
};
$("#ringFormData").addEventListener("submit",e=>{
 e.preventDefault();const p=byId(currentChickId);if(!p)return;
 p.ring=$("#ringNumber").value.trim();p.ringDate=$("#ringDate").value;p.name=$("#ringName").value.trim()||p.name||"Pichón";p.color=$("#ringColor").value.trim();p.sex=$("#ringSex").value;p.breedingStage="Anillado";
 save();render();renderBreeding();openChick(p.id);
});
$("#openChickPigeonBtn").onclick=()=>openPigeon(currentChickId);

// OBSERVACIONES
function openObservations(){
 const p=byId(currentId); if(!p)return;
 $("#obsPigeonName").textContent=`OBSERVACIONES · ${p.name||"Sin nombre"}`;
 $("#observationText").value=p.observations||"";
 renderTraitChips(); go("observations");
}
function renderTraitChips(){
 const p=byId(currentId); if(!p)return;
 const traits=[...new Set([...defaultTraits,...(p.customTraits||[]),...(p.traits||[])])];
 const selected=new Set(p.traits||[]);
 $("#traitChips").innerHTML=traits.map((t,i)=>`<button type="button" class="trait-chip ${selected.has(t)?"selected":""}" data-trait-index="${i}">${t}</button>`).join("");
 [...document.querySelectorAll("#traitChips .trait-chip")].forEach((b,i)=>b.onclick=()=>b.classList.toggle("selected"));
}
$("#observationsTab").onclick=openObservations;
$("#addTraitBtn").onclick=()=>{
 const value=$("#customTrait").value.trim(),p=byId(currentId); if(!value||!p)return;
 p.customTraits=[...new Set([...(p.customTraits||[]),value])];
 p.traits=[...new Set([...(p.traits||[]),value])];
 $("#customTrait").value=""; save(); renderTraitChips();
};
$("#saveObservations").onclick=()=>{
 const p=byId(currentId); if(!p)return;
 const all=[...new Set([...defaultTraits,...(p.customTraits||[]),...(p.traits||[])])];
 p.observations=$("#observationText").value.trim();
 p.traits=[...document.querySelectorAll("#traitChips .trait-chip.selected")].map(b=>all[Number(b.dataset.traitIndex)]);
 save(); openPigeon(currentId);
};

render();renderBreeding();
