window.CBReverseMunicipio=async function(lat,lon){
 const timeoutFetch=async url=>{const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),7000);try{const r=await fetch(url,{signal:ctrl.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(timer)}};
 const urls=[
  'https://nominatim.openstreetmap.org/reverse?'+new URLSearchParams({lat,lon,format:'json',zoom:'10',addressdetails:'1',accept_language:'es'}),
  'https://api.bigdatacloud.net/data/reverse-geocode-client?'+new URLSearchParams({latitude:lat,longitude:lon,localityLanguage:'es'})
 ];
 for(let i=0;i<urls.length;i++)try{
  const d=await timeoutFetch(urls[i]);let name='';
  if(i===0){const a=d.address||{};name=a.municipality||a.city||a.town||a.village||a.city_district||'';}
  else {const admin=d.localityInfo?.administrative||[];name=admin.find(a=>a.adminLevel===8)?.name||d.city||d.locality||'';}
  if(name&&typeof name==='string'&&!/^ubicaci[oó]n/i.test(name))return name.trim();
 }catch(e){/* Try alternate service */}
 return null;
};