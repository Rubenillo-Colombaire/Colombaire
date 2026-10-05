const pigeons=[
 {name:"Toretto",ring:"ESP-2024-01587",owner:"Rubén Vila",color:"Rojo",sex:"Macho",birth:"15 marzo 2024",father:"TOR_OCONN",mother:"FUEGO"},
 {name:"Bumblebee",ring:"ESP-2023-00842",owner:"Rubén Vila",color:"Mascarado Plomes",sex:"Macho",birth:"8 abril 2023",father:"Desconocido",mother:"Desconocida"},
 {name:"Brisa",ring:"ESP-2024-02111",owner:"Rubén Vila",color:"Azul",sex:"Hembra",birth:"22 febrero 2024",father:"Norte",mother:"Luna"}
];
const pages=[...document.querySelectorAll(".page")];
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
 box.innerHTML=list.map((p,i)=>`<div class="list-card" data-index="${pigeons.indexOf(p)}"><div><b>${p.name}</b><small>${p.ring} · ${p.color}</small><small>Padre: ${p.father} · Madre: ${p.mother}</small></div><div class="sex">${p.sex==="Macho"?"♂":"♀"}</div></div>`).join("");
 box.querySelectorAll(".list-card").forEach(c=>c.onclick=()=>openPigeon(+c.dataset.index));
}
function openPigeon(i){
 const p=pigeons[i];
 document.querySelector("#f-name").textContent=p.name;
 document.querySelector("#f-ring").textContent=p.ring;
 ["ring","owner","color","sex","birth","father","mother"].forEach(k=>document.querySelector("#d-"+k).textContent=p[k]);
 go("ficha");
}
document.querySelector("#search").addEventListener("input",e=>{
 const q=e.target.value.toLowerCase();
 render(pigeons.filter(p=>Object.values(p).join(" ").toLowerCase().includes(q)));
});
render();
