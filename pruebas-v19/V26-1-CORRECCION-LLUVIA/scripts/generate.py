"""COLOMBOMETEO V26.1 - copia experimental, sin alterar V26.

Descarga ECMWF IFS 0.25 grados y representa precipitación acumulada
por intervalos reales de 3 horas (+15/+18, +18/+21, +21/+24).
No inventa valores horarios ni genera imágenes si falta un campo.
"""
import json
import math
import os
import tempfile
from datetime import timedelta, timezone
from pathlib import Path

import numpy as np
from PIL import Image
from eccodes import codes_grib_new_from_file, codes_get_array, codes_get, codes_release
from ecmwf.opendata import Client

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'grid'
OUT.mkdir(exist_ok=True)
WEST, EAST, SOUTH, NORTH = -12.0, 7.0, 34.0, 45.0
STEPS = [15, 18, 21, 24]
DISPLAY_STEPS = [18, 21, 24]
COLORS = {
    'temperature_2m': [(0,(68,103,176)),(10,(79,177,229)),(20,(235,215,94)),(30,(215,71,68))],
    'wind_speed_10m': [(0,(157,214,189)),(20,(240,219,109)),(40,(243,162,82)),(70,(158,56,112))],
    'precipitation': [(0,(199,241,255)),(0.5,(134,215,255)),(2,(22,123,229)),(5,(133,57,201)),(15,(255,72,169))],
}

def rgba(var, value):
    if not math.isfinite(value) or (var == 'precipitation' and value < 0.1):
        return (0,0,0,0)
    ramp = COLORS[var]
    if value <= ramp[0][0]:
        c = ramp[0][1]
    elif value >= ramp[-1][0]:
        c = ramp[-1][1]
    else:
        for (a,ca),(b,cb) in zip(ramp,ramp[1:]):
            if a <= value <= b:
                factor = (value-a)/(b-a)
                c = tuple(round(x+(y-x)*factor) for x,y in zip(ca,cb))
                break
    return (*c, 175 if var != 'precipitation' else 200)

def read_grib(path):
    fields = {}
    with open(path,'rb') as file:
        while (gid := codes_grib_new_from_file(file)) is not None:
            try:
                name = codes_get(gid,'shortName')
                if name in fields:
                    raise RuntimeError(f'Campo GRIB duplicado: {name}')
                lat = codes_get_array(gid,'latitudes')
                lon = codes_get_array(gid,'longitudes')
                vals = codes_get_array(gid,'values')
                lon = (lon+180)%360-180
                mask = (lat>=SOUTH)&(lat<=NORTH)&(lon>=WEST)&(lon<=EAST)
                fields[name] = (lat[mask],lon[mask],vals[mask])
            finally:
                codes_release(gid)
    return fields

def aligned(fields,names):
    lat,lon,_ = fields[names[0]]
    for name in names[1:]:
        other_lat,other_lon,_ = fields[name]
        if len(other_lat)!=len(lat) or not np.allclose(other_lat,lat) or not np.allclose(other_lon,lon):
            raise ValueError('Rejillas no alineadas: '+name)
    return lat,lon

def save_image(var,lat,lon,values,step):
    lats=np.unique(np.round(lat,5))[::-1]
    lons=np.unique(np.round(lon,5))
    dy=float(np.median(np.abs(np.diff(lats)))) if len(lats)>1 else 0.25
    dx=float(np.median(np.abs(np.diff(lons)))) if len(lons)>1 else 0.25
    rows={round(float(x),5):i for i,x in enumerate(lats)}
    cols={round(float(x),5):i for i,x in enumerate(lons)}
    arr=np.zeros((len(lats),len(lons),4),dtype=np.uint8)
    for a,b,v in zip(lat,lon,values):
        arr[rows[round(float(a),5)],cols[round(float(b),5)]]=rgba(var,float(v))
    name=f'{var}_{step:03d}.png'
    Image.fromarray(arr,'RGBA').save(OUT/name,optimize=True)
    return {'file':'grid/'+name,'bounds':[[float(lats[-1]-dy/2),float(lons[0]-dx/2)],[float(lats[0]+dy/2),float(lons[-1]+dx/2)]]}

def main():
    client=Client(source='ecmwf',model='ifs',resol='0p25')
    result={'source':'ECMWF IFS open data','resolution':'0.25°',
            'precipitation_note':'Milímetros acumulados en cada intervalo de 3 horas; no mm/h',
            'frames':{}}
    previous_tp=None
    previous_step=None
    run_utc=None
    with tempfile.TemporaryDirectory() as tmp:
        for step in STEPS:
            target=os.path.join(tmp,f'{step}.grib2')
            # +15 es un paso auxiliar necesario para el intervalo +15/+18.
            params=['tp'] if step==15 else ['2t','10u','10v','tp']
            meta=client.retrieve(type='fc',stream='oper',levtype='sfc',step=step,param=params,target=target)
            fields=read_grib(target)
            for key in params:
                if key not in fields:
                    raise RuntimeError(f'Falta {key} en +{step} h; recibido {list(fields)}')
            cycle=meta.datetime.replace(tzinfo=timezone.utc)
            if run_utc is None:
                run_utc=cycle
            elif cycle!=run_utc:
                raise RuntimeError('Los plazos proceden de ciclos ECMWF diferentes; no se pueden restar')
            if step==15:
                previous_tp=fields['tp']
                previous_step=15
                continue
            lat,lon=aligned(fields,['2t','10u','10v','tp'])
            p_lat,p_lon,p_total=previous_tp
            if len(p_total)!=len(lat) or not np.allclose(p_lat,lat) or not np.allclose(p_lon,lon):
                raise RuntimeError('La rejilla de precipitación anterior no coincide con la actual')
            if step-previous_step!=3:
                raise RuntimeError('Intervalo no válido: se esperaban 3 horas')
            total=fields['tp'][2]*1000
            previous=p_total*1000
            diff=total-previous
            if np.any(diff < -0.05):
                raise RuntimeError('Precipitación acumulada decreciente: comprobar semántica GRIB')
            rain=np.maximum(0,diff)
                        print(f'LLUVIA +{previous_step} a +{step} h | minimo={np.min(rain):.3f} mm | maximo={np.max(rain):.3f} mm | media={np.mean(rain):.3f} mm | puntos_con_lluvia={np.count_nonzero(rain >= 0.1)}/{rain.size}')
            temp=fields['2t'][2]-273.15
            wind=np.hypot(fields['10u'][2],fields['10v'][2])*3.6
            valid=(cycle+timedelta(hours=step)).isoformat().replace('+00:00','Z')
            frame={}
            for var,values in [('temperature_2m',temp),('wind_speed_10m',wind),('precipitation',rain)]:
                frame[var]=save_image(var,lat,lon,values,step)
            frame['precipitation_interval_hours']=[previous_step,step]
            frame['precipitation_unit']='mm/3h'
            result['frames'][valid]=frame
            previous_tp=fields['tp']
            previous_step=step
            print('Generado',valid,'lluvia desde +'+str(step-3)+' hasta +'+str(step)+' h')
    result['run_utc']=run_utc.isoformat().replace('+00:00','Z')
    (OUT/'manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print('HECHO: grid/manifest.json')

if __name__=='__main__':
    main()
