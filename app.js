const seedPigeons=[
 {id:"p-toretto",name:"Toretto",ring:"ESP-2024-01587",owner:"Rubén Vila",color:"Rojo",sex:"Macho",birth:"2024-03-15",father:"TOR_OCONN",mother:"FUEGO",fatherId:"",motherId:"",status:"Activo"},
 {id:"p-bumblebee",name:"Bumblebee",ring:"ESP-2023-00842",owner:"Rubén Vila",color:"Mascarado Plomes",sex:"Macho",birth:"2023-04-08",father:"Desconocido",mother:"Desconocida",fatherId:"",motherId:"",status:"Activo"},
 {id:"p-brisa",name:"Brisa",ring:"ESP-2024-02111",owner:"Rubén Vila",color:"Azul",sex:"Hembra",birth:"2024-02-22",father:"Norte",mother:"Luna",fatherId:"",motherId:"",status:"Activo"}
];

function makeId(){return "p-"+Date.now()+"-"+Math.random().toString(36).slice(2,7)}
let pigeons=JSON.parse(localStorage.getItem("colombaire_pigeons")||"null") || seedPigeons;
// Migrate v0.2 records without IDs
pigeons=pigeons.map(p=>({...p,id:p.id||makeId(),fatherId:p.fatherId||"",motherId:p.motherId||""}));
localStorage.setItem("colombaire_pigeons",JSON.stringify(pigeons));

let currentId=null;
const pages=[...document.querySelectorAll(".page")];
const $=s=>document.querySelector(s);

function save(){localStorage.setItem("colombaire_pigeons",JSON.stringify(pigeons))}
function byId(id){return pigeons.find(p=>p.id===id)}
function fmtDate(v){if(!v)return"Sin registrar";if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return v;const[y,m,d]=v.split("-");return`${d}/${m}/${y}`}
function parentName(p,type){
 const id=p[type+"Id"]; if(id&&byId(id)) return byId(id).name;
 return p[type] || (type==="father"?"Desconocido":"Desconocida");
}
function go(id){
 pages.forEach(p=>p.classList.toggle("active",p.id===id));
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("selected",b.dataset.go===id));
 window.scrollTo(0,0);
}
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(g)go(g.dataset.go)});

function render(list=pigeons){
 const box=$("#pigeonList");
 $("#pigeonCount").textContent=`${pigeons.length} palomo${pigeons.length===1?"":"s"} registrado${pigeons.length===1?"":"s"}`;
 box.innerHTML=list.map(p=>{
  const sexIcon=p.sex==="Macho"?"♂":p.sex==="Hembra"?"♀":"?";
  return `<div class="list-card" data-id="${p.id}"><div><b>${p.name||"Sin nombre"}</b><small>${p.ring||"Sin anilla"} · ${p.color||"Sin pelaje"}</small><small>Padre: ${parentName(p,"father")} · Madre: ${parentName(p,"mother")}</small><span class="status-pill">${p.status||"Activo"}</span></div><div class="sex">${sexIcon}</div></div>`;
 }).join("");
 box.querySelectorAll(".list-card").forEach(c=>c.onclick=()=>openPigeon(c.dataset.id));
}
function openPigeon(id){
 currentId=id;const p=byId(id);if(!p)return;
 $("#f-name").textContent=p.name||"Sin nombre";$("#f-ring").textContent=p.ring||"Sin anilla";
 ["ring","owner","color","sex"].forEach(k=>$("#d-"+k).textContent=p[k]||"Sin registrar");
 $("#d-birth").textContent=fmtDate(p.birth);
 $("#d-father").textContent=parentName(p,"father");
 $("#d-mother").textContent=parentName(p,"mother");
 go("ficha");
}
function fillParentSelects(editId){
 const father=$("#p-father"),mother=$("#p-mother");
 father.innerHTML='<option value="">Desconocido / no registrado</option>';
 mother.innerHTML='<option value="">Desconocida / no registrada</option>';
 pigeons.filter(p=>p.id!==editId&&p.sex==="Macho").forEach(p=>father.add(new Option(`${p.name} · ${p.ring||"sin anilla"}`,p.id)));
 pigeons.filter(p=>p.id!==editId&&p.sex==="Hembra").forEach(p=>mother.add(new Option(`${p.name} · ${p.ring||"sin anilla"}`,p.id)));
}
function openForm(id=null){
 currentId=id;const p=id?byId(id):{name:"",ring:"",owner:"",color:"",sex:"",birth:"",father:"",mother:"",fatherId:"",motherId:"",status:"Activo"};
 $("#formTitle").textContent=id?"EDITAR PALOMO":"NUEVO PALOMO";
 $("#p-index").value=id||"";
 ["name","ring","owner","color","sex","birth","status"].forEach(k=>$("#p-"+k).value=p[k]||"");
 fillParentSelects(id);
 $("#p-father").value=p.fatherId||"";
 $("#p-mother").value=p.motherId||"";
 $("#deletePigeon").style.display=id?"inline-block":"none";
 $(".primary").textContent=id?"Guardar cambios":"Guardar palomo";
 go("palomoForm");
}
$("#addPigeon").onclick=()=>openForm();
$("#editPigeon").onclick=()=>openForm(currentId);

$("#pigeonForm").addEventListener("submit",e=>{
 e.preventDefault();
 const id=$("#p-index").value;
 const old=id?byId(id):{};
 const p={...old,id:id||makeId()};
 ["name","ring","owner","color","sex","birth","status"].forEach(k=>p[k]=$("#p-"+k).value.trim());
 p.fatherId=$("#p-father").value;p.motherId=$("#p-mother").value;
 p.father=p.fatherId&&byId(p.fatherId)?byId(p.fatherId).name:(old.father||"Desconocido");
 p.mother=p.motherId&&byId(p.motherId)?byId(p.motherId).name:(old.mother||"Desconocida");
 if(id){pigeons=pigeons.map(x=>x.id===id?p:x)}else{pigeons.unshift(p)}
 save();render();openPigeon(p.id);
});

$("#deletePigeon").onclick=()=>{
 const p=byId(currentId);if(!p)return;
 $("#deleteTitle").textContent=`¿Eliminar a ${p.name}?`;
 $("#deleteModal").classList.add("show");$("#deleteModal").setAttribute("aria-hidden","false");
};
$("#cancelDelete").onclick=closeModal;
function closeModal(){$("#deleteModal").classList.remove("show");$("#deleteModal").setAttribute("aria-hidden","true")}
$("#confirmDelete").onclick=()=>{
 const doomed=currentId;
 pigeons=pigeons.filter(p=>p.id!==doomed);
 // Preserve descendants but remove broken live links; keep parent's historical name
 pigeons=pigeons.map(p=>({
  ...p,
  fatherId:p.fatherId===doomed?"":p.fatherId,
  motherId:p.motherId===doomed?"":p.motherId
 }));
 save();render();closeModal();currentId=null;go("palomar");
};
$("#deleteModal").addEventListener("click",e=>{if(e.target.id==="deleteModal")closeModal()});

$("#search").addEventListener("input",e=>{const q=e.target.value.toLowerCase();render(pigeons.filter(p=>Object.values(p).join(" ").toLowerCase().includes(q)))});
document.querySelectorAll(".filters button").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".filters button").forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");
 const t=btn.textContent;let list=pigeons;
 if(t==="Machos")list=pigeons.filter(p=>p.sex==="Macho");
 if(t==="Hembras")list=pigeons.filter(p=>p.sex==="Hembra");
 if(t==="Activos")list=pigeons.filter(p=>(p.status||"Activo")==="Activo");
 render(list);
}));
render();
