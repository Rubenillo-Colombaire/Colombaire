"""Download ECMWF IFS open GRIB and export genuine grid cells as transparent PNG overlays.
Requires ecmwf-opendata, eccodes, pillow, numpy. Run outside browser.
"""
import json, math, os, tempfile
from datetime import datetime, timezone, timedelta
from pathlib import Path
import numpy as np
from PIL import Image
from eccodes import codes_grib_new_from_file, codes_get_array, codes_get, codes_release
from ecmwf.opendata import Client

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'grid'; OUT.mkdir(exist_ok=True)
# Expanded bounding rectangle covering Comunitat Valenciana, with margins.
WEST, EAST, SOUTH, NORTH = -2.0, 1.3, 37.4, 41.3
STEPS = [18, 21, 24]  # Tres plazos posteriores, normalmente futuros para el ciclo ECMWF disponible
COLORS = {
 'temperature_2m': [(0,(68,103,176)),(10,(79,177,229)),(20,(235,215,94)),(30,(215,71,68))],
 'wind_speed_10m': [(0,(157,214,189)),(20,(240,219,109)),(40,(243,162,82)),(70,(158,56,112))],
 'precipitation': [(0,(199,241,255)),(0.5,(134,215,255)),(2,(22,123,229)),(5,(133,57,201)),(15,(255,72,169))]
}
def rgba(var, value):
 if not math.isfinite(value) or (var=='precipitation' and value<0.1):return (0,0,0,0)
 ramp=COLORS[var]
 if value<=ramp[0][0]:c=ramp[0][1]
 elif value>=ramp[-1][0]:c=ramp[-1][1]
 else:
  for (a,ca),(b,cb) in zip(ramp,ramp[1:]):
   if a<=value<=b:
    f=(value-a)/(b-a);c=tuple(round(x+(y-x)*f) for x,y in zip(ca,cb));break
 return (*c, 175 if var!='precipitation' else 200)

def read_grib(path):
 fields={}
 with open(path,'rb') as f:
  while (gid:=codes_grib_new_from_file(f)) is not None:
   try:
    name=codes_get(gid,'shortName')
    lat=codes_get_array(gid,'latitudes');lon=codes_get_array(gid,'longitudes');vals=codes_get_array(gid,'values')
    mask=(lat>=SOUTH)&(lat<=NORTH)&(((lon+180)%360-180)>=WEST)&(((lon+180)%360-180)<=EAST)
    fields[name]=(lat[mask],((lon[mask]+180)%360-180),vals[mask])
   finally:codes_release(gid)
 return fields

def aligned(fields, names):
 la,lo,v=fields[names[0]]
 for name in names[1:]:
  a,b,_=fields[name]
  if len(a)!=len(la) or not np.allclose(a,la) or not np.allclose(b,lo):raise ValueError('Grid mismatch '+name)
 return la,lo

def save_image(var,lat,lon,values,step):
 lats=np.unique(np.round(lat,5))[::-1];lons=np.unique(np.round(lon,5))
 # Exact original grid centres; image cells have half-cell extension.
 dy=float(np.median(np.abs(np.diff(lats)))) if len(lats)>1 else 0.25
 dx=float(np.median(np.abs(np.diff(lons)))) if len(lons)>1 else 0.25
 rows={round(float(x),5):i for i,x in enumerate(lats)};cols={round(float(x),5):i for i,x in enumerate(lons)}
 arr=np.zeros((len(lats),len(lons),4),dtype=np.uint8)
 for a,b,v in zip(lat,lon,values):arr[rows[round(float(a),5)],cols[round(float(b),5)]]=rgba(var,float(v))
 name=f'{var}_{step:03d}.png';Image.fromarray(arr,'RGBA').save(OUT/name,optimize=True)
 return {'file':'grid/'+name,'bounds':[[float(lats[-1]-dy/2),float(lons[0]-dx/2)],[float(lats[0]+dy/2),float(lons[-1]+dx/2)]]}

def main():
 client=Client(source='ecmwf',model='ifs',resol='0p25')
 # 0.25° is used for initial testing; 0.1° can be adopted once the pipeline is proven.
 result={'source':'ECMWF IFS open data','resolution':'0.25°','precipitation_note':'Acumulación por intervalos de 3 horas; NO mm/h','frames':{}}
 previous_tp=None
 with tempfile.TemporaryDirectory() as td:
  for step in STEPS:
   target=os.path.join(td,f'{step}.grib2')
   meta=client.retrieve(type='fc',stream='oper',levtype='sfc',step=step,param=['2t','10u','10v','tp'],target=target)
   fields=read_grib(target)
   for key in ['2t','10u','10v','tp']:
    if key not in fields:raise RuntimeError(f'Missing {key} at step {step}; found {list(fields)}')
   lat,lon=aligned(fields,['2t','10u','10v','tp'])
   temp=fields['2t'][2]-273.15
   wind=np.hypot(fields['10u'][2],fields['10v'][2])*3.6
   total=fields['tp'][2]*1000
   if previous_tp is None:rain=total # since forecast start; first step is 3h
   else:rain=np.maximum(0,total-previous_tp)
   previous_tp=total.copy()
   valid=(meta.datetime.replace(tzinfo=timezone.utc)+timedelta(hours=step)).isoformat().replace('+00:00','Z')
   result['frames'][valid]={}
   for var,values in [('temperature_2m',temp),('wind_speed_10m',wind),('precipitation',rain)]:
    result['frames'][valid][var]=save_image(var,lat,lon,values,step)
   result['run_utc']=meta.datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00','Z')
   print('Generated',valid)
 (ROOT/'grid'/'manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
 print('DONE: grid/manifest.json')
if __name__=='__main__':main()
