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



// SALUD · GUÍA DE ENFERMEDADES
const diseases=[
 {id:"coccidiosis",name:"Coccidiosis",type:"Protozoos",agent:"Eimeria spp.",transmission:"Fecal-oral · ingestión de ooquistes esporulados",organ:"Intestino",susceptible:"Especialmente jóvenes; también adultos según carga e inmunidad",carriers:"Sí · pueden existir infecciones subclínicas",feces:"Orientan, pero no confirman",home:"Sí · flotación fecal / microscopía / McMaster",sample:"Heces frescas",method:"Flotación fecal y recuento; correlacionar con clínica",target:"Ooquistes de coccidios",quant:"Sí · ooquistes por gramo (OPG)",exact:"Morfología/esporulación y técnicas de laboratorio si se requiere especie",signs:"Diarrea o heces alteradas, pérdida de peso, apatía y caída de rendimiento. La presencia de ooquistes por sí sola no demuestra que sean la causa del cuadro.",diagnosis:"La microscopía fecal permite detectar ooquistes. La cantidad debe interpretarse junto con signos, edad, manejo y evolución.",warning:"No tratar una cifra aislada como diagnóstico clínico. Una infección subclínica puede coexistir con otra causa de bajo rendimiento."},
 {id:"tricomoniasis",name:"Tricomoniasis",type:"Protozoos",agent:"Trichomonas gallinae / T. stableri",transmission:"Contacto directo, leche de buche y agua/alimento contaminados",organ:"Boca · faringe · esófago · buche; ocasionalmente otros órganos",susceptible:"Pichones y aves expuestas a cepas virulentas",carriers:"Sí",feces:"No",home:"Sí · muestra fresca observada rápidamente al microscopio",sample:"Moco/material de garganta o lesión",method:"Preparación en fresco; PCR/cultivo para confirmación o tipado",target:"Tricomonas móviles",quant:"No de rutina",exact:"PCR permite caracterización genética",signs:"Pérdida de peso, dificultad para tragar, regurgitación y lesiones caseosas blanco-amarillentas; puede existir infección sin lesiones llamativas.",diagnosis:"La confirmación práctica se basa en visualizar tricomonas móviles en una muestra fresca. Las lesiones por sí solas no son patognomónicas.",warning:"La muestra debe ser fresca; un negativo mal tomado o examinado tarde no descarta por sí solo la infección."},
 {id:"salmonelosis",name:"Salmonelosis",type:"Bacterianas",agent:"Salmonella enterica (serovares diversos)",transmission:"Principalmente fecal-oral; contaminación ambiental, agua y alimento",organ:"Intestino · sistémico; articulaciones y otros órganos en cuadros invasivos",susceptible:"Jóvenes, debilitados y situaciones de estrés",carriers:"Sí",feces:"No · pueden orientar",home:"No para confirmación fiable",sample:"Heces/hisopos o tejidos según cuadro",method:"Cultivo bacteriano y/o PCR",target:"Salmonella spp.",quant:"No suele ser el objetivo principal",exact:"Cultivo + identificación/serotipado o PCR",signs:"Cuadro variable: apatía, adelgazamiento, alteraciones digestivas y, en formas sistémicas, signos articulares o neurológicos.",diagnosis:"La sospecha clínica debe confirmarse mediante laboratorio. La excreción puede ser intermitente, por lo que el diseño del muestreo importa.",warning:"Importante en colectividades y concursos. Evitar conclusiones únicamente por el aspecto de las heces."},
 {id:"ecoli",name:"E. coli / Colibacilosis",type:"Bacterianas",agent:"Escherichia coli · cepas oportunistas o patógenas",transmission:"Fecal-oral y contaminación ambiental",organ:"Intestino; puede hacerse sistémica",susceptible:"Especialmente jóvenes, inmunodeprimidos o con daño intestinal previo",carriers:"Sí · E. coli también forma parte de la microbiota",feces:"No",home:"No permite distinguir cepa comensal de patógena",sample:"Heces, contenido intestinal o tejidos según cuadro",method:"Cultivo + identificación; antibiograma; PCR de factores de virulencia cuando proceda",target:"E. coli y, si procede, marcadores de virulencia",quant:"Según objetivo",exact:"Requiere caracterización adicional",signs:"Diarrea, apatía, adelgazamiento y enfermedad sistémica en cuadros graves. Puede actuar como complicación secundaria de daño intestinal.",diagnosis:"Aislar E. coli no basta por sí solo para demostrar causalidad, porque puede estar presente en aves sanas. Hay que interpretar localización, carga, lesiones y contexto.",warning:"Este punto será importante para el futuro módulo Adeno-Coli: asociación no equivale automáticamente a causalidad primaria."},
 {id:"micoplasmosis",name:"Micoplasmosis",type:"Bacterianas",agent:"Mycoplasma spp.",transmission:"Contacto estrecho y secreciones respiratorias; posible transmisión vertical según especie",organ:"Aparato respiratorio",susceptible:"Aves sometidas a estrés, hacinamiento o coinfecciones",carriers:"Sí",feces:"No",home:"No",sample:"Hisopos respiratorios/choanales según protocolo",method:"PCR y técnicas de laboratorio",target:"ADN de Mycoplasma",quant:"Posible con qPCR",exact:"PCR específica/cultivo especializado",signs:"Estornudos, secreción, respiración ruidosa, menor tolerancia al esfuerzo y caída del rendimiento; puede complicarse con otros agentes.",diagnosis:"Los signos respiratorios son inespecíficos. La confirmación requiere pruebas dirigidas y valoración de coinfecciones.",warning:"No atribuir todo cuadro respiratorio a Mycoplasma sin diferenciar clamidiosis y otros procesos."},
 {id:"clamidiosis",name:"Ornitosis / Clamidiosis",type:"Bacterianas",agent:"Chlamydia psittaci (y otras Chlamydiaceae en el diferencial)",transmission:"Secreciones respiratorias y material fecal contaminado",organ:"Respiratorio · sistémico",susceptible:"Variable; pueden existir aves infectadas sin signos",carriers:"Sí",feces:"No",home:"No para confirmación",sample:"Hisopos conjuntival, coanal y cloacal combinados según caso",method:"PCR ± serología; cultivo en laboratorio especializado",target:"ADN de Chlamydiaceae/C. psittaci",quant:"Según ensayo",exact:"PCR específica y contexto diagnóstico",signs:"Desde ausencia de signos hasta anorexia, disnea, secreciones y heces verdosas. La presentación es variable.",diagnosis:"La PCR es una herramienta principal, pero debe interpretarse con clínica y muestreo adecuado; la serología aislada no demuestra necesariamente infección activa.",warning:"ZOONOSIS: C. psittaci puede infectar a personas. Ante sospecha, extremar precauciones y consultar a un veterinario/médico según corresponda.",zoonosis:true},
 {id:"pmv",name:"Paramixovirus (PMV-1)",type:"Víricas",agent:"Avian orthoavulavirus 1 (PMV-1 / APMV-1)",transmission:"Contacto con secreciones y excreciones contaminadas",organ:"Neurológico · digestivo · renal; variable según cepa",susceptible:"No vacunados y aves susceptibles",carriers:"La excreción y persistencia dependen del cuadro",feces:"No",home:"No",sample:"Hisopos orofaríngeos/cloacales o tejidos",method:"RT-PCR y aislamiento/confirmación de laboratorio",target:"ARN viral",quant:"Posible con RT-qPCR",exact:"Caracterización molecular en laboratorio",signs:"Poliuria/heces muy acuosas, alteraciones neurológicas, tortícolis, incoordinación y dificultad para comer o beber; la expresión clínica es variable.",diagnosis:"Los signos neurológicos orientan pero tienen diferenciales. La confirmación es laboratorial.",warning:"La vacunación y la bioseguridad son pilares preventivos. La ficha completa separará inmunidad, vacunación y recuperación clínica."},
 {id:"viruela",name:"Viruela (Pigota)",type:"Víricas",agent:"Avipoxvirus",transmission:"Contacto con lesiones/costras y vectores mecánicos como mosquitos",organ:"Piel y mucosas según forma",susceptible:"Aves sin inmunidad; riesgo ligado a exposición a vectores",carriers:"Persistencia ambiental en costras contaminadas",feces:"No",home:"Inspección orienta; no confirmación etiológica",sample:"Lesión/costra o biopsia",method:"Histopatología y/o PCR",target:"Lesiones compatibles / ADN viral",quant:"No de rutina",exact:"PCR/histopatología",signs:"Nódulos y costras en zonas sin pluma en la forma cutánea; la forma diftérica afecta mucosas y puede comprometer alimentación o respiración.",diagnosis:"Las lesiones pueden ser muy características, pero la confirmación etiológica se realiza con laboratorio cuando es necesaria.",warning:"No arrancar costras de forma traumática. Valorar infecciones secundarias y afectación de mucosas."},
 {id:"circovirus",name:"Circovirus",type:"Víricas",agent:"Pigeon circovirus (PiCV)",transmission:"Probable vía fecal-oral y exposición ambiental",organ:"Sistema inmunitario · tejidos linfoides",susceptible:"Principalmente jóvenes",carriers:"Sí / infecciones subclínicas posibles",feces:"No",home:"No",sample:"Tejidos, sangre o hisopos según protocolo",method:"PCR + histopatología cuando proceda",target:"ADN de PiCV",quant:"Posible mediante qPCR",exact:"PCR/secuenciación",signs:"Cuadros inespecíficos en jóvenes: pérdida de condición, apatía y mayor susceptibilidad a coinfecciones.",diagnosis:"Un PCR positivo debe interpretarse con lesiones, edad y clínica; detectar el virus no siempre explica por sí solo todos los signos.",warning:"Especialmente importante separar infección detectada de enfermedad atribuible al virus."},
 {id:"rotavirus",name:"Rotavirus",type:"Víricas",agent:"Rotavirus de palomas (incluidos rotavirus A según cepa)",transmission:"Fecal-oral",organ:"Digestivo · posible afectación sistémica según cepa/cuadro",susceptible:"Jóvenes especialmente; adultos también pueden afectarse",carriers:"Posible",feces:"No",home:"No",sample:"Heces/tejidos según fase",method:"RT-PCR/PCR específica y estudio de lesiones",target:"Genoma viral",quant:"Posible con técnicas cuantitativas",exact:"Tipado/secuenciación",signs:"Apatía, vómitos/regurgitación, pérdida de peso, plumaje erizado y heces verdes o acuosas; la gravedad es variable.",diagnosis:"Los signos se solapan con adenovirus y procesos bacterianos. La confirmación requiere laboratorio.",warning:"La velocidad de evolución puede orientar en el palomar, pero no debe usarse sola para distinguir Rota de Adeno."},
 {id:"adenovirus",name:"Adenovirus",type:"Víricas",agent:"Adenovirus aviares asociados a distintos síndromes",transmission:"Horizontal y, para algunos adenovirus, posible vertical",organ:"Digestivo · hígado y otros tejidos según virus/síndrome",susceptible:"Jóvenes con frecuencia; adultos no quedan excluidos",carriers:"Posible",feces:"No",home:"No",sample:"Heces, hisopos o tejidos según cuadro",method:"PCR + histopatología/necropsia según caso",target:"ADN viral y lesiones compatibles",quant:"Posible con qPCR",exact:"PCR/secuenciación",signs:"Apatía, vómitos, pérdida rápida de condición, plumaje erizado y heces verdes; pueden aparecer coinfecciones bacterianas.",diagnosis:"Debe diferenciarse de rotavirus, E. coli y otros procesos entéricos/sistémicos mediante laboratorio y contexto clínico.",warning:"La futura ficha Adeno-Coli distinguirá claramente virus primario, daño intestinal y posible sobrecrecimiento/invasión secundaria por E. coli."}
];
let currentDiseaseType="Todas";
function renderDiseases(){
 const q=(document.querySelector("#healthSearch")?.value||"").toLowerCase();
 const list=diseases.filter(d=>(currentDiseaseType==="Todas"||d.type===currentDiseaseType)&&Object.values(d).join(" ").toLowerCase().includes(q));
 $("#diseaseList").innerHTML=list.map(d=>`<div class="disease-card" data-disease="${d.id}"><div><b>${d.name}</b><small>${d.agent}</small><small>Órgano principal: ${d.organ}</small></div><span class="disease-type">${d.type}</span></div>`).join("")||'<div class="empty-state"><b>Sin resultados</b><small>Prueba con otro término.</small></div>';
 document.querySelectorAll("[data-disease]").forEach(c=>c.onclick=()=>openDisease(c.dataset.disease));
}
function healthIcon(kind){
 const icons={
  transmission:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 25c8-8 17-8 25 0M25 17l14 8-9 13"/><circle cx="15" cy="42" r="7"/><circle cx="48" cy="42" r="7"/></svg>`,
  young:`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="31" cy="25" r="12"/><path d="M22 38c-7 6-7 15 2 18h18c7-5 5-15-2-19M43 22l10 4-10 4"/></svg>`,
  carrier:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 42c8-19 30-24 40-7-4 15-20 20-40 7Z"/><circle cx="42" cy="31" r="2"/><path d="M49 34l8 3-8 3"/></svg>`,
  feces:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 48c0-7 7-9 11-9-2-7 3-12 8-12 6 0 10 5 8 11 7 1 10 5 9 10H18Z"/><path d="M24 54h26"/></svg>`,
  microscope:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M25 10h13v8H25zM29 18l-5 18M36 18l-5 19M19 38c1 10 8 15 18 15h13M38 45h12v8M14 56h42"/></svg>`,
  sample:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 9h20M26 9v13L17 49c-1 4 2 7 6 7h18c4 0 7-3 6-7L38 22V9"/><path d="M22 41h21"/></svg>`,
  quantify:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M11 52h44M16 47V31h8v16M29 47V21h8v26M42 47V12h8v35"/></svg>`,
  exact:`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="29" cy="29" r="17"/><path d="M42 42l12 12M21 29h16M29 21v16"/></svg>`,
  symptoms:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M13 43c7-20 30-26 40-7-4 15-21 20-40 7Z"/><circle cx="42" cy="32" r="2"/><path d="M50 35l7 3-7 3M23 48l-3 8M35 48l2 8"/></svg>`,
  diagnosis:`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="28" cy="27" r="16"/><path d="M40 39l14 14M20 27h16M28 19v16"/></svg>`
 };
 return icons[kind]||icons.exact;
}
function renderCoccidiosisMaster(d){
 const ico=(k)=>healthIcon(k);
 return `<article class="poster-health">
  <header class="poster-head">
   
   <div class="poster-title-row">
    <div class="poster-title"><h2>COCCIDIOSIS</h2><p>Eimeria spp.</p></div>
   </div>
  </header>
  <section class="poster-quick">
   <div><span class="poster-qicon">${ico("exact")}</span><p><b>TIPO</b>${d.type}</p></div>
   <div><span class="poster-qicon intestine">${ico("sample")}</span><p><b>ÓRGANO PRINCIPAL</b>${d.organ}</p></div>
   <div><span class="poster-qphoto"><img src="https://upload.wikimedia.org/wikipedia/commons/5/50/Piskl%C4%99_go%C5%82%C4%99bia_miejskiego_5_dni_po_wykluciu.jpg" alt="Pichón de palomo"></span><p><b>AFECTA MÁS A</b>${d.susceptible}</p></div>
  </section>
  <section class="poster-feature">
   <div class="poster-what">
    <h3><span>${ico("exact")}</span> ¿QUÉ ES?</h3>
    <p>Enfermedad intestinal causada por protozoos del género <i>Eimeria</i>. Los parásitos se multiplican en el intestino y, cuando la carga es elevada, pueden alterar la digestión, la absorción de nutrientes y la condición del palomo.</p>
   </div>
   <div class="poster-cocci-process">
  <h4>¿QUÉ OCURRE?</h4>
  <div class="process-step"><b>1</b><span>Ooquistes de <i>Eimeria</i></span></div>
  <i class="process-arrow">↓</i>
  <div class="process-step"><b>2</b><span>Invasión del epitelio intestinal</span></div>
  <i class="process-arrow">↓</i>
  <div class="process-step"><b>3</b><span>Multiplicación y lesión de vellosidades</span></div>
  <i class="process-arrow">↓</i>
  <div class="process-step final"><b>4</b><span>Inflamación y peor absorción</span></div>
</div>
   <div class="poster-organ-box real-intestine"><h3>INTESTINO</h3>
<img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/PigeonAnatomy_cropped_1.png" alt="Ilustración anatómica de las vísceras de una paloma, con su sistema digestivo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
<div class="intestine-fallback" style="display:none">Fotografía anatómica no disponible en este dispositivo. El intestino es donde <i>Eimeria</i> se multiplica y puede lesionar el epitelio intestinal.</div>
<small>ILUSTRACIÓN ANATÓMICA DE PALOMA · SHIPLEY (1901), DOMINIO PÚBLICO</small><b>Órgano principal</b><span>${d.organ}</span></div>
  </section>
  <section class="poster-three">
   <div class="poster-panel green"><h3>${ico("transmission")} TRANSMISIÓN</h3><p>${d.transmission}</p></div>
   <div class="poster-panel rust"><h3>${ico("symptoms")} SÍNTOMAS</h3><p>${d.signs}</p></div>
   <div class="poster-panel brown"><h3>${ico("feces")} HECES</h3><div class="feces-visual">${ico("feces")}</div><p>${d.feces}</p></div>
  </section>
  <section class="poster-two">
   <div class="poster-panel blue"><h3>${ico("diagnosis")} DIAGNÓSTICO</h3><img class="panel-photo microscope-photo" src="https://images.unsplash.com/photo-1727091506038-5451111dc2fb?auto=format&fit=crop&w=900&q=80" alt="Microscopio de laboratorio"><p>${d.diagnosis}</p></div>
   <div class="poster-panel teal"><h3>${ico("microscope")} MICROSCOPÍA</h3><img class="panel-photo micro-photo" src="https://www.frontiersin.org/files/Articles/1392238/xml-images/fvets-11-1392238-g001.webp" alt="Ooquiste de Eimeria labbeana-like al microscopio"><p>${d.target}. ${d.quant}</p></div>
  </section>
  <section class="poster-two lower">
   <div class="poster-panel green"><h3>${ico("sample")} DETECCIÓN / MUESTRA</h3><p><b>${d.sample}</b><br>${d.method}<br>${d.home}</p></div>
   <div class="poster-panel amber"><h3><span class="bang">!</span> IMPORTANTE</h3><p>${d.warning}</p></div>
  </section>
  <section class="poster-performance"><h3>${ico("quantify")} IMPACTO EN EL RENDIMIENTO</h3><p>Una carga elevada puede reducir el aprovechamiento del alimento, retrasar el crecimiento de los pichones y deteriorar la condición física. La importancia real depende de la carga parasitaria y del estado general del palomo.</p></section>
  <footer class="poster-note">FICHA ORIENTATIVA · COLOMBICULTURA DEPORTIVA · LA CONFIRMACIÓN PUEDE REQUERIR DIAGNÓSTICO VETERINARIO</footer>
 </article>`;
}
function renderDiseaseMaster(d){
 const ico=k=>healthIcon(k);
 const safe=s=>String(s??"No especificado");
 const fact=(title,value)=>`<div class="disease-master-fact"><b>${title}</b><p>${safe(value)}</p></div>`;
 return `<article class="poster-health disease-master">
 <header class="poster-head">
 <div class="poster-title-row"><div class="poster-title"><h2>${safe(d.name).toUpperCase()}</h2><p>${safe(d.agent)}</p></div></div></header>
 <section class="poster-quick">
 <div><span class="poster-qicon">${ico("exact")}</span><p><b>TIPO</b>${safe(d.type)}</p></div>
 <div><span class="poster-qicon">${ico("sample")}</span><p><b>ÓRGANO PRINCIPAL</b>${safe(d.organ)}</p></div>
 <div><span class="poster-qicon">${ico("young")}</span><p><b>AFECTA MÁS A</b>${safe(d.susceptible)}</p></div></section>
 ${d.zoonosis?'<div class="sheet-alert"><b>⚠ ZOONOSIS</b><span>Puede afectar a personas. Consultar a un veterinario y adoptar medidas de protección.</span></div>':''}
 <section class="disease-master-intro"><h3>¿QUÉ DEBEMOS SABER?</h3><p>${safe(d.signs)}</p></section>
 <section class="poster-three">
 <div class="poster-panel green"><h3>${ico("transmission")} TRANSMISIÓN</h3><p>${safe(d.transmission)}</p></div>
 <div class="poster-panel rust"><h3>${ico("symptoms")} SIGNOS Y SÍNTOMAS</h3><p>${safe(d.signs)}</p></div>
 <div class="poster-panel brown"><h3>${ico("feces")} HECES</h3><p>${safe(d.feces)}</p></div></section>
 <section class="poster-two">
 <div class="poster-panel blue"><h3>${ico("diagnosis")} DIAGNÓSTICO</h3><p>${safe(d.diagnosis)}</p></div>
 <div class="poster-panel teal"><h3>${ico("microscope")} DETECCIÓN</h3><p>${safe(d.method)}</p><p>${safe(d.target)}</p></div></section>
 <section class="poster-two lower">
 <div class="poster-panel green"><h3>${ico("sample")} MUESTRA Y CONFIRMACIÓN</h3><p><b>Muestra:</b> ${safe(d.sample)}</p><p><b>Detección doméstica:</b> ${safe(d.home)}</p><p><b>Identificación exacta:</b> ${safe(d.exact)}</p></div>
 <div class="poster-panel amber"><h3><span class="bang">!</span> IMPORTANTE</h3><p>${safe(d.warning)}</p></div></section>
 ${d.id==='trichomoniasis'?`<section class="disease-visual-section"><h3>IMAGEN REAL · MICROSCOPÍA</h3><figure><img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Scanning_electronmicrograph_of_Trichomonas_gallinae.jpg" loading="lazy" alt="Micrografía electrónica de Trichomonas gallinae" onerror="this.closest('figure').style.display='none';this.closest('section').querySelector('.visual-unavailable').hidden=false"><figcaption><i>Trichomonas gallinae</i>, micrografía electrónica de un aislado de ave silvestre (no de palomo). Fuente: Robinson y colaboradores, PLOS ONE (2010), CC BY-SA 4.0. Imagen del parásito, no diagnóstico por fotografía.</figcaption></figure><p class="visual-unavailable" hidden>La imagen no está disponible con esta conexión. Puedes consultar la fuente en Wikimedia Commons.</p></section>`:''}
 <section class="poster-two lower disease-carriers-quant"><div class="poster-panel teal disease-carriers-quant-panel"><h3>${ico("quantify")} PORTADORES ASINTOMÁTICOS Y CUANTIFICACIÓN</h3><div class="carriers-quant-content"><p><b>Portadores asintomáticos</b><span>${safe(d.carriers)}</span></p><p><b>Cuantificación</b><span>${safe(d.quant)}</span></p></div></div></section>
 <footer class="poster-note">FICHA ORIENTATIVA · COLOMBICULTURA DEPORTIVA · NO SUSTITUYE EL DIAGNÓSTICO VETERINARIO</footer>
 </article>`;
}
function openDisease(id){
 const d=diseases.find(x=>x.id===id);if(!d)return;
 $("#diseaseTitle").closest(".title-row")?.classList.remove("cocci-hide-generic");
 $("#diseaseTitle").textContent=d.name.toUpperCase();$("#diseaseSubtitle").textContent=d.agent;
 if(id==="coccidiosis"){
   $("#diseaseTitle").closest(".title-row")?.classList.add("cocci-hide-generic");
   $("#diseaseDetailBody").innerHTML=renderCoccidiosisMaster(d);
   go("diseaseDetail");return;
 }
 $("#diseaseTitle").closest(".title-row")?.classList.add("cocci-hide-generic");
 $("#diseaseDetailBody").innerHTML=renderDiseaseMaster(d);
 go("diseaseDetail");
}
$("#healthSearch").addEventListener("input",renderDiseases);
document.querySelectorAll(".health-actions button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".health-actions button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");currentDiseaseType=b.textContent;renderDiseases()});
renderDiseases();

render();renderBreeding();


// CONCURSOS v0.9: tabla demostrativa basada en captura facilitada por el usuario.
// No implica conexión automática ni acceso a información privada.
const cbContestRows = [[1, "VAMOS", "VAIO", "AL439456", "FRANCISCO VTE. ROSELLO LLACER", "VILLALONGA - LA AMISTAD", [240, 227, 231, 204, 238, 240], 1380], [2, "FACILET", "TOSCAT", "AK706929", "PEÑA VITALI", "LLUTXENT", [240, 225, 231, 194, 218, 240], 1348], [3, "TORMENTO", "ROIG", "AL359249", "ELISEO MASCARELL SIGNES", "PALMA DE GANDIA - LA MURTERA", [240, 146, 248, 212, 238, 240], 1324], [4, "FLORINATA", "FABAT", "AM145518", "OSCAR ESCRIVA MARTI", "VILLALONGA - LA AMISTAD", [240, 166, 231, 204, 238, 240], 1319], [5, "A MI MANERA", "MORATXO", "V071001", "PEÑA VITALI", "LLUTXENT", [240, 150, 231, 194, 238, 240], 1293], [6, "DOGMA DE FE", "ROIG", "AL735330", "PEÑA LA GOMA", "OLIVA", [240, 136, 231, 204, 238, 240], 1289], [7, "MAUI", "VAIO", "AL582599", "PEÑA PORRA Y TOLES", "ALMOINES", [240, 136, 231, 204, 238, 240], 1289], [8, "TORETTO", "VAIO", "AL467653", "PEÑA PORRA Y TOLES", "ALMOINES", [208, 159, 231, 204, 238, 240], 1280], [9, "GAMEIRO", "TOSCAT", "AL716588", "OSCAR ESCRIVA MARTI", "VILLALONGA - LA AMISTAD", [240, 88, 231, 204, 238, 240], 1241], [10, "PISTAXO", "TENAT", "AM301981", "PENYA COSTA CALIDA EL PLA", "VILLALONGA", [240, 72, 231, 204, 245, 240], 1232], [11, "AROMA CITRICO", "FUMAT", "AL582868", "PEÑA LA GOMA", "OLIVA", [240, 72, 236, 204, 238, 240], 1230], [12, "FULLERACA", "VAIO", "E870618", "VALENTIN GALERA HERNANDEZ", "ALQUERIA DE LA CONDESA - SANT PERE I SANT PAU", [240, 72, 231, 204, 238, 240], 1225], [13, "REY DEL CORTIJO", "TOSCAT", "AL325395", "PEÑA DEMA MES", "RAFELCOFER", [240, 72, 231, 204, 238, 240], 1225], [14, "EVAN", "VAIO", "AL532259", "PEDRO JAVIER VERDU PARDO", "ALQUERIA DE LA CONDESA - SANT PERE I SANT PAU", [240, 72, 231, 204, 238, 240], 1225]];
const cbStarStorageKey="colombaire_contest_starred_rings_v1";
let cbStarred;
try { cbStarred=JSON.parse(localStorage.getItem(cbStarStorageKey)||"[]"); if(!Array.isArray(cbStarred))cbStarred=[]; }
catch {cbStarred=[];}
function cbEscape(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function cbRenderContest(){
 const target=document.getElementById("cb-contest-rows");if(!target)return;
 target.innerHTML=cbContestRows.map(([pos,name,color,ring,owner,club,scores,total])=>{
 const starred=cbStarred.includes(ring);
 return `<tr class="${starred?"cb-starred":""}"><td class="cb-rank">${pos}º</td><td><button type="button" class="cb-star-button ${starred?"active":""}" data-ring="${cbEscape(ring)}" aria-label="${starred?"Quitar destacado de":"Destacar a"} ${cbEscape(name)}" aria-pressed="${starred}">${starred?"★":"☆"}</button></td><td class="cb-name">${cbEscape(name)}</td><td>${cbEscape(color)}</td><td>${cbEscape(ring)}</td><td>${cbEscape(owner)}</td><td>${cbEscape(club)}</td>${scores.map(v=>`<td class="cb-num">${v}</td>`).join("")}<td class="cb-total">${total}</td></tr>`;
 }).join("");
 document.getElementById("cb-visible-count").textContent=cbContestRows.length;
 document.getElementById("cb-star-count").textContent=cbStarred.length;
}
document.getElementById("cb-contest-rows")?.addEventListener("click",e=>{
 const btn=e.target.closest("button[data-ring]");if(!btn)return;
 const ring=btn.dataset.ring;
 cbStarred=cbStarred.includes(ring)?cbStarred.filter(r=>r!==ring):[...cbStarred,ring];
 localStorage.setItem(cbStarStorageKey,JSON.stringify(cbStarred));cbRenderContest();
});
document.getElementById("cb-reset-stars")?.addEventListener("click",()=>{
 cbStarred=[];localStorage.setItem(cbStarStorageKey,"[]");cbRenderContest();
});
cbRenderContest();


// Diagnóstico FCCV v0.9b. Consulta manual, sin recopilar datos personales ni alterar clasificaciones.
(()=>{
 const btn=document.getElementById('cb-test-fccv');
 const result=document.getElementById('cb-test-result');
 if(!btn||!result)return;
 btn.addEventListener('click',async()=>{
   btn.disabled=true;
   btn.textContent='Comprobando…';
   result.className='cb-test-result';
   result.textContent='Consultando la clasificación pública de la FCCV…';
   const endpoint='https://colombiculturacv.es/estaticas/competiciones/ajax/ajax_clasificacion.php?ano=2026&cam=90';
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),12000);
   try{
     const response=await fetch(endpoint,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal});
     if(!response.ok)throw new Error('El servidor ha respondido con HTTP '+response.status);
     const html=await response.text();
     const doc=new DOMParser().parseFromString(html,'text/html');
     const rows=[...doc.querySelectorAll('tr')];
     const names=rows.map(row=>row.textContent||'').filter(text=>/\b(?:VAMOS|TORETTO|MAUI)\b/i.test(text));
     if(rows.length<2)throw new Error('La respuesta llegó, pero no contiene una tabla reconocible.');
     result.className='cb-test-result cb-test-ok';
     result.textContent='✓ ¡Conexión correcta! HTTP '+response.status+'. Filas HTML encontradas: '+rows.length+'. '+(names.length?'Coincidencias de ejemplo: '+names.length+'. ':'')+'Podemos estudiar la importación directa.';
   }catch(error){
     result.className='cb-test-result cb-test-fail';
     const msg=error&&error.name==='AbortError'?'Tiempo de espera agotado (12 segundos).':String(error&&error.message||error);
     result.textContent='✕ No hemos podido leer los datos desde COLOMBAIRE. '+msg+'. Si el enlace oficial funciona por separado, podría tratarse de CORS; este resultado por sí solo no confirma la causa.';
   }finally{clearTimeout(timeout);btn.disabled=false;btn.textContent='Repetir comprobación';}
 });
})();
