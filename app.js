const seedPigeons=[
 {name:"Toretto",ring:"ESP-2024-01587",owner:"Rubén Vila",color:"Rojo",sex:"Macho",birth:"2024-03-15",father:"TOR_OCONN",mother:"FUEGO",status:"Activo"},
 {name:"Bumblebee",ring:"ESP-2023-00842",owner:"Rubén Vila",color:"Mascarado Plomes",sex:"Macho",birth:"2023-04-08",father:"Desconocido",mother:"Desconocida",status:"Activo"},
 {name:"Brisa",ring:"ESP-2024-02111",owner:"Rubén Vila",color:"Azul",sex:"Hembra",birth:"2024-02-22",father:"Norte",mother:"Luna",status:"Activo"}
];
let pigeons=JSON.parse(localStorage.getItem("colombaire_pigeons")||"null") || seedPigeons;
let currentIndex=null;
const pages=[...document.querySelectorAll(".page")];

function save(){ localStorage.setItem("colombaire_pigeons",JSON.stringify(pigeons)); }
function fmtDate(v){
 if(!v) return "Sin registrar";
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
 const [y,m,d]=v.split("-"); return `${d}/${m}/${y}`;
}
function go(id){
 pages.forEach(p=>p.classList.toggle("active",p.id===id));
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("selected",b.dataset.go===id));
 window.scrollTo(0,0);
}
document.addEventListener("click",e=>{
 const g=e.target.closest("[data-go]"); if(g) go(g.dataset.go);
});
function render(list=pigeons){
 const box=document.querySelector("#pigeonList");
 document.querySelector("#pigeonCount").textContent=`${pigeons.length} palomo${pigeons.length===1?"":"s"} registrado${pigeons.length===1?"":"s"}`;
 box.innerHTML=list.map(p=>{
   const i=pigeons.indexOf(p);
   const sexIcon=p.sex==="Macho"?"♂":p.sex==="Hembra"?"♀":"?";
   return `<div class="list-card" data-index="${i}"><div><b>${p.name||"Sin nombre"}</b><small>${p.ring||"Sin anilla"} · ${p.color||"Sin pelaje"}</small><small>Padre: ${p.father||"Desconocido"} · Madre: ${p.mother||"Desconocida"}</small><span class="status-pill">${p.status||"Activo"}</span></div><div class="sex">${sexIcon}</div></div>`;
 }).join("");
 box.querySelectorAll(".list-card").forEach(c=>c.onclick=()=>openPigeon(+c.dataset.index));
}
function openPigeon(i){
 currentIndex=i; const p=pigeons[i];
 document.querySelector("#f-name").textContent=p.name||"Sin nombre";
 document.querySelector("#f-ring").textContent=p.ring||"Sin anilla";
 ["ring","owner","color","sex","father","mother"].forEach(k=>document.querySelector("#d-"+k).textContent=p[k]||"Sin registrar");
 document.querySelector("#d-birth").textContent=fmtDate(p.birth);
 go("ficha");
}
function openForm(i=null){
 currentIndex=i;
 const p=i===null?{name:"",ring:"",owner:"",color:"",sex:"",birth:"",father:"",mother:"",status:"Activo"}:pigeons[i];
 document.querySelector("#formTitle").textContent=i===null?"NUEVO PALOMO":"EDITAR PALOMO";
 document.querySelector("#p-index").value=i===null?"":i;
 ["name","ring","owner","color","sex","birth","father","mother","status"].forEach(k=>{
   document.querySelector("#p-"+k).value=p[k]||"";
 });
 go("palomoForm");
}
document.querySelector("#addPigeon").onclick=()=>openForm();
document.querySelector("#editPigeon").onclick=()=>openForm(currentIndex);
document.querySelector("#pigeonForm").addEventListener("submit",e=>{
 e.preventDefault();
 const p={};
 ["name","ring","owner","color","sex","birth","father","mother","status"].forEach(k=>p[k]=document.querySelector("#p-"+k).value.trim());
 const idx=document.querySelector("#p-index").value;
 if(idx==="") pigeons.unshift(p); else pigeons[+idx]=p;
 save(); render(); currentIndex=idx===""?0:+idx; openPigeon(currentIndex);
});
document.querySelector("#search").addEventListener("input",e=>{
 const q=e.target.value.toLowerCase();
 render(pigeons.filter(p=>Object.values(p).join(" ").toLowerCase().includes(q)));
});
document.querySelectorAll(".filters button").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".filters button").forEach(b=>b.classList.remove("selected")); btn.classList.add("selected");
 const t=btn.textContent;
 let list=pigeons;
 if(t==="Machos") list=pigeons.filter(p=>p.sex==="Macho");
 if(t==="Hembras") list=pigeons.filter(p=>p.sex==="Hembra");
 if(t==="Activos") list=pigeons.filter(p=>(p.status||"Activo")==="Activo");
 render(list);
}));
render();
