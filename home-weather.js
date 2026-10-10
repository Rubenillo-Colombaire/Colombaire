/* COLOMBAIRE v0.9k: panel de inicio, datos reales Open-Meteo */
(()=>{'use strict';
const $=id=>document.getElementById(id), root=$('hw-data');if(!root)return;
const code=c=>c===0?['Despejado','☀️']:c<=3?['Nubes y claros','🌤️']:c===45||c===48?['Niebla','🌫️']:c>=51&&c<=67?['Lluvia','🌧️']:c>=71&&c<=77?['Nieve','❄️']:c>=80&&c<=82?['Chubascos','🌦️']:c>=95?['Tormenta','⛈️']:['Variable','🌥️'];
const weekdays=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const STORE='colombaire_weather_place_v1';
let saved=null;try{saved=JSON.parse(localStorage.getItem(STORE)||'null')}catch(e){}
let last=0,loading=false,allDays=[],expanded=false,cityName=saved?.name||'Sollana',coords=saved?.lat!=null?[saved.lat,saved.lon]:null,forecast=null,selectedDate=null;
if($('cb-weather-place'))$('cb-weather-place').value=cityName;
txt('hw-city',cityName);
const txt=(id,val)=>{$(id).textContent=val};
function el(tag,cls,t){const node=document.createElement(tag);if(cls)node.className=cls;if(t!==undefined)node.textContent=t;return node;}
function renderHours(date){if(!forecast)return;
 const hours=$('hw-hours');hours.replaceChildren();const c=forecast.current,h=forecast.hourly;
 const today=forecast.daily.time[0],isToday=date===today;
 const matches=h.time.map((t,i)=>({t,i})).filter(x=>x.t.slice(0,10)===date && (!isToday||x.t.slice(0,13)>=c.time.slice(0,13)));
 const use=matches.length?matches:h.time.map((t,i)=>({t,i})).filter(x=>x.t.slice(0,10)===date);
 for(const {t,i} of use){const item=el('div','hw-hour');item.append(el('span','',isToday&&i===use[0]?.i?'Ahora':t.slice(11,16)),el('span','emoji',code(h.weather_code[i])[1]),el('b','',Math.round(h.temperature_2m[i])+'°'),el('small','', '💨 '+Math.round(h.wind_speed_10m[i])+' km/h'),el('small','', '🌪️ '+Math.round(h.wind_gusts_10m[i])+' km/h'),el('small','', '☔ '+(h.precipitation_probability[i]??'—')+'%'));hours.append(item)}
 $('hw-hour-title').textContent=(isToday?'HOY':new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z')).toUpperCase())+' · POR HORAS';
 const dailyIndex=forecast.daily.time.indexOf(date);const summary=$('hw-day-summary');
 if(dailyIndex>=0){summary.textContent='Previsión del día: '+code(forecast.daily.weather_code[dailyIndex])[0]+' · Mín. '+Math.round(forecast.daily.temperature_2m_min[dailyIndex])+'° · Máx. '+Math.round(forecast.daily.temperature_2m_max[dailyIndex])+'° · Lluvia '+(forecast.daily.precipitation_probability_max[dailyIndex]??'—')+'%';summary.hidden=false}
 hours.scrollLeft=0;
}
function renderDays(){const box=$('hw-days');box.replaceChildren();if(!allDays.length)return;const d=allDays.slice(0,expanded?16:7);const low=Math.min(...allDays.map(x=>x.lo)),high=Math.max(...allDays.map(x=>x.hi));
 d.forEach((x,i)=>{const row=el('button','hw-day'+(x.date===selectedDate?' hw-day-selected':''));row.type='button';row.setAttribute('aria-pressed',String(x.date===selectedDate));row.setAttribute('aria-label','Ver previsión por horas del '+x.date);row.append(el('b','',i===0?'Hoy':weekdays[new Date(x.date+'T12:00:00').getDay()]),el('span','ico',code(x.code)[1]),el('span','lo',Math.round(x.lo)+'°'));const bar=el('div','hw-tempbar'),fill=el('i');fill.style.marginLeft=(Math.max(0,x.lo-low)/Math.max(1,high-low)*100)+'%';fill.style.width=(Math.max(1,x.hi-x.lo)/Math.max(1,high-low)*100)+'%';bar.append(fill);row.append(bar,el('span','hi',Math.round(x.hi)+'°'));row.addEventListener('click',()=>{selectedDate=x.date;renderDays();renderHours(x.date);$('hw-hour-title').scrollIntoView({behavior:'smooth',block:'center'});});box.append(row)});
 $('hw-more').textContent=expanded?'Mostrar solo 7 días ▴':'Ver previsión de 16 días ▾';$('hw-more').setAttribute('aria-expanded',String(expanded));}
async function geocode(name){const url=new URL('https://geocoding-api.open-meteo.com/v1/search');url.searchParams.set('name',name);url.searchParams.set('count','10');url.searchParams.set('language','es');url.searchParams.set('format','json');const r=await fetch(url);if(!r.ok)throw Error('No se pudo localizar el municipio');const d=await r.json();if(!d.results?.length)throw Error('Municipio no encontrado');return d.results.find(x=>x.country_code==='ES'&&String(x.admin1||'').toLowerCase().includes('valencia'))||d.results.find(x=>x.country_code==='ES')||d.results[0];}
async function update(force=false){if(loading||(!force&&Date.now()-last<15*60*1000))return;loading=true;txt('hw-status','Actualizando datos meteorológicos…');
 try{if(!coords){const loc=await geocode(cityName);coords=[loc.latitude,loc.longitude];cityName=loc.name;txt('hw-city',cityName);}const url=new URL('https://api.open-meteo.com/v1/forecast');url.searchParams.set('latitude',coords[0]);url.searchParams.set('longitude',coords[1]);url.searchParams.set('timezone','auto');url.searchParams.set('forecast_days','16');url.searchParams.set('current','temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m');url.searchParams.set('hourly','temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,precipitation_probability');url.searchParams.set('daily','weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max');const r=await fetch(url);if(!r.ok)throw Error('Servicio meteorológico no disponible');const d=await r.json();if(!d.current||!d.daily||!d.hourly)throw Error('Datos incompletos');
 const c=d.current;txt('hw-temp',Math.round(c.temperature_2m)+'°');txt('hw-desc',code(c.weather_code)[0]);txt('hw-icon',code(c.weather_code)[1]);txt('hw-range','Máx. '+Math.round(d.daily.temperature_2m_max[0])+'° · Mín. '+Math.round(d.daily.temperature_2m_min[0])+'°');txt('hw-wind','💨 '+Math.round(c.wind_speed_10m)+' km/h');txt('hw-gust','🌪️ Rachas '+Math.round(c.wind_gusts_10m)+' km/h');txt('hw-rain','☔ Hoy '+(d.daily.precipitation_probability_max[0]??'—')+' %');
 forecast=d;allDays=d.daily.time.map((date,i)=>({date,lo:d.daily.temperature_2m_min[i],hi:d.daily.temperature_2m_max[i],code:d.daily.weather_code[i]}));if(!allDays.some(x=>x.date===selectedDate))selectedDate=allDays[0].date;renderDays();renderHours(selectedDate);root.hidden=false;txt('hw-updated','Actualizado: '+c.time.replace('T',' ')+' · '+d.timezone_abbreviation+' · Fuente: Open-Meteo');txt('hw-status','');last=Date.now();
 }catch(e){txt('hw-status','No se ha podido actualizar el tiempo: '+e.message+'. Pulsa ↻ para reintentar.');}finally{loading=false;}}
 $('hw-refresh').addEventListener('click',()=>update(true));$('hw-more').addEventListener('click',()=>{expanded=!expanded;renderDays()});
 window.addEventListener('colombaire:weather-location',e=>{const loc=e.detail;if(!loc||!Number.isFinite(loc.lat)||!Number.isFinite(loc.lon))return;coords=[loc.lat,loc.lon];cityName=loc.name||'Mi ubicación';txt('hw-city',cityName);selectedDate=null;last=0;update(true);});


 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});setInterval(()=>{if(!document.hidden)update()},15*60*1000);update();
})();
