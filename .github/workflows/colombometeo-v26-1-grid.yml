name: COLOMBOMETEO V26.1 - Rejilla ECMWF 7 dias

on:
  workflow_dispatch:
  schedule:
    - cron: '30 6,18 * * *'

permissions:
  contents: write

jobs:
  generar:
    runs-on: ubuntu-latest
    timeout-minutes: 120
    steps:
      - name: Descargar repositorio
        uses: actions/checkout@v4

      - name: Preparar Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: pip
          cache-dependency-path: pruebas-v19/V26-REJILLA-LAB/requirements.txt

      - name: Instalar dependencias
        run: pip install -r pruebas-v19/V26-REJILLA-LAB/requirements.txt

      - name: Generar rejilla ECMWF hasta 168 horas
        working-directory: pruebas-v19/V26-1-CORRECCION-LLUVIA
        run: python scripts/generate.py

      - name: Verificar rejillas y datos numericos
        run: |
          python - <<'PYVERIFY'
          import json
          from pathlib import Path
          from datetime import datetime, timezone, timedelta
          import zipfile

          base = Path('pruebas-v19/V26-1-CORRECCION-LLUVIA/grid')
          manifest = base / 'manifest.json'
          assert manifest.is_file(), 'Falta manifest.json'
          data = json.loads(manifest.read_text(encoding='utf-8'))
          frames = data.get('frames', {})
          expected_steps = list(range(3, 145, 3)) + list(range(150, 169, 6))
          assert len(expected_steps) == 52
          assert len(frames) == len(expected_steps), f'Se esperaban 52 fotogramas, hay {len(frames)}'
          run = datetime.fromisoformat(data['run_utc'].replace('Z', '+00:00'))
          for step in expected_steps:
              timestamp = (run + timedelta(hours=step)).isoformat().replace('+00:00', 'Z')
              assert timestamp in frames, f'Falta el plazo +{step} h ({timestamp})'
              frame = frames[timestamp]
              for variable in ('temperature_2m', 'wind_speed_10m', 'precipitation'):
                  assert variable in frame, f'Falta {variable} en +{step} h'
                  path = base.parent / frame[variable]['file']
                  assert path.is_file() and path.stat().st_size > 0, f'Falta imagen: {path}'
              numerical = frame.get('numerical_data')
              assert isinstance(numerical, str) and numerical.startswith('grid/data/'), f'Ruta numerica incorrecta en +{step} h'
              numerical_path = base.parent / numerical
              assert numerical_path.is_file() and numerical_path.stat().st_size > 0, f'Falta {numerical_path}'
              with zipfile.ZipFile(numerical_path) as archive:
                  required = {'latitudes.npy', 'longitudes.npy', 'temperature_2m.npy', 'wind_u_10m.npy', 'wind_v_10m.npy', 'precipitation.npy'}
                  assert required.issubset(archive.namelist()), f'Campos numericos incompletos: +{step} h'
              previous = step - (3 if step <= 144 else 6)
              assert frame.get('precipitation_interval_hours') == [previous, step], f'Intervalo de lluvia incorrecto en +{step} h'
              assert frame.get('precipitation_unit') == ('mm/3h' if step <= 144 else 'mm/6h'), f'Unidad de lluvia incorrecta en +{step} h'
          print('Verificacion correcta: 52 fotogramas, 156 PNG y 52 NPZ; hasta +168 h')
          PYVERIFY

      - name: Guardar rejilla V26.1
        run: |
          git config user.name 'github-actions[bot]'
          git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
          git add pruebas-v19/V26-1-CORRECCION-LLUVIA/grid/
          if ! git diff --cached --quiet; then
            git commit -m 'V26.1 LAB: rejilla ECMWF hasta 168 horas'
            git push
          else
            echo 'No hay cambios que publicar'
          fi
