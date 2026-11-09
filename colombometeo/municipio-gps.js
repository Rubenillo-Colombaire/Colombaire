/* COLOMBAIRE V7.7: resolución GPS compartida por portada y COLOMBOMETEO. */
window.CBReverseMunicipio=async function(lat,lon){
 if(!Number.isFinite(Number(lat))||!Number.isFinite(Number(lon)))return null;
 const query=new URLSearchParams({latitude:String(lat),longitude:String(lon),localityLanguage:'es'});
 const services=[
  {url:'https://api.bigdatacloud.net/data/reverse-geocode-client?'+query,parse:d=>{
   const a=d.localityInfo?.administrative||[];
   return a.find(x=>Number(x.adminLevel)===8)?.name||d.city||d.locality||a.find(x=>Number(x.adminLevel)===7)?.name||'';
  }},
  {url:'https://nominatim.openstreetmap.org/reverse?'+new URLSearchParams({lat:String(lat),lon:String(lon),format:'json',zoom:'10',addressdetails:'1',accept_language:'es'}),parse:d=>{
   const a=d.address||{};return a.municipality||a.city||a.town||a.village||a.city_district||'';
  }}
 ];
 for(const service of services){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
  try{
   const response=await fetch(service.url,{signal:controller.signal,cache:'no-store'});
   if(!response.ok)continue;
   const name=service.parse(await response.json());
   if(typeof name==='string'&&name.trim()&&!/^ubicaci[oó]n|^mi ubicaci[oó]n/i.test(name))return name.trim();
  }catch(_error){/* Try the next provider. */}
  finally{clearTimeout(timer)}
 }
 return null;
};
