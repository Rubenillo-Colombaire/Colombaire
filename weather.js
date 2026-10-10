/* COLOMBAIRE v0.9j — meteorología pública; sin claves ni almacenamiento de coordenadas */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const form=$('cb-weather-form');if(!form)return;
const msg=$('cb-weather-message'), result=$('cb-weather-result');
const compass=deg=>['N','NE','E','SE','S','SO','O','NO'][Math.round(deg/45)%8];
function description(code){
 if(code===0)return ['Despejado','☀️'];
 if(code<=3)return ['Nubes y claros','🌤️'];
 if(code===45||code===48)return ['Niebla','🌫️'];
 if(code>=51&&code<=67)return ['Lluvia o llovizna','🌧️'];
 if(code>=71&&code<=77)return ['Nieve','❄️'];
 if(code>=80&&code<=82)return ['Chubascos','🌦️'];
 if(code>=95)return ['Tormenta','⛈️'];
 return ['Variable','🌥️'];
}
async function weather(lat,lon,name){
 msg.textContent='Consultando la previsión…';result.hidden=true;
 try{
  const url=new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',lat);url.searchParams.set('longitude',lon);
  url.searchParams.set('current','temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation');
  url.searchParams.set('daily','precipitation_probability_max');
  url.searchParams.set('timezone','auto');url.searchParams.set('forecast_days','1');
  const response=await fetch(url.toString());if(!response.ok)throw Error('No se pudo consultar el servicio meteorológico');
  const data=await response.json(), c=data.current;
  if(!c||!Number.isFinite(c.temperature_2m))throw Error('No hay datos disponibles para esta ubicación');
  const [desc,emoji]=description(c.weather_code);
  $('cb-weather-location').textContent=name;
  $('cb-weather-temp').textContent=Math.round(c.temperature_2m)+' °C';
  $('cb-weather-condition').textContent=desc;
  $('cb-weather-emoji').textContent=emoji;
  $('cb-weather-wind').textContent=Math.round(c.wind_speed_10m)+' km/h';
  $('cb-weather-direction').textContent=compass(c.wind_direction_10m)+' · '+Math.round(c.wind_direction_10m)+'°';
  $('cb-weather-gust').textContent=Math.round(c.wind_gusts_10m)+' km/h';
  $('cb-weather-humidity').textContent=Math.round(c.relative_humidity_2m)+' %';
  $('cb-weather-rain').textContent=Number(c.precipitation).toFixed(1)+' mm';
  const probability=data.daily?.precipitation_probability_max?.[0];
  $('cb-weather-prob').textContent=Number.isFinite(probability)?Math.round(probability)+' %':'Sin datos';
  $('cb-weather-updated').textContent='Datos del modelo: '+c.time.replace('T',' ')+' · '+data.timezone_abbreviation+' · Fuente: Open-Meteo';
  msg.textContent='Previsión consultada correctamente.';result.hidden=false;
 }catch(err){msg.textContent='No se pudo obtener el tiempo: '+err.message+'. Comprueba la conexión e inténtalo de nuevo.';}
}
form.addEventListener('submit',async e=>{
 e.preventDefault();const city=$('cb-weather-place').value.trim();if(!city)return;
 msg.textContent='Buscando municipio…';result.hidden=true;
 try{
  const url=new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name',city);url.searchParams.set('count','10');url.searchParams.set('language','es');url.searchParams.set('format','json');
  const r=await fetch(url.toString());if(!r.ok)throw Error('Error en la búsqueda');
  const d=await r.json();if(!d.results?.length)throw Error('No se encontró el municipio');
  const choices=d.results;const best=choices.find(x=>x.country_code==='ES'&&((x.admin1||'').toLowerCase().includes('valencia')||(x.admin2||'').toLowerCase().includes('valencia')))||choices.find(x=>x.country_code==='ES')||choices[0];
  await weather(best.latitude,best.longitude,[best.name,best.admin1,best.country].filter(Boolean).join(', '));
 }catch(err){msg.textContent=err.message+'. Prueba con otro municipio.';}
});
$('cb-weather-gps').addEventListener('click',()=>{
 if(!navigator.geolocation){msg.textContent='Tu dispositivo no permite consultar la ubicación.';return;}
 msg.textContent='Solicitando permiso de ubicación…';
 navigator.geolocation.getCurrentPosition(p=>weather(p.coords.latitude,p.coords.longitude,'Mi ubicación actual'),()=>{msg.textContent='No se pudo obtener la ubicación. Puedes escribir tu municipio.';},{timeout:12000,maximumAge:60000,enableHighAccuracy:false});
});
})();
