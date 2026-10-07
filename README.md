# COLOMBAIRE v0.4

## Cría conectada con Mi Palomar
- Crear parejas seleccionando macho y hembra registrados
- Registrar fecha y estado de la pareja
- Registrar puestas y número de huevos
- Cálculo orientativo de eclosión a 18 días desde el primer huevo
- Registrar nacimientos
- Creación automática del pichón en Mi Palomar
- Padre y madre asignados automáticamente
- Avisos básicos de pichones sin anilla y puestas próximas a eclosionar
- Historial de puestas y pichones por pareja
- Finalizar una pareja sin borrar su historial

## Importante
v0.4 sigue siendo un prototipo local. Los datos se guardan en el navegador. Las fechas de eclosión son orientativas y no sustituyen el seguimiento real de incubación.


### Ajuste de navegación v0.4b
- Mi Palomar incorpora dos áreas hermanas: PALOMOS y CRÍA.
- Desde Mi Palomar se entra a Cría con un solo toque, sin abrir antes la ficha de un ejemplar.
- El botón + de Palomos sigue creando un palomo.
- El botón + de Cría crea directamente una nueva pareja seleccionando macho y hembra.
- La pestaña Cría dentro de la ficha individual queda conceptualmente reservada al historial reproductivo de ese ejemplar.

### Ajuste de puestas v0.4c
- Eliminado "Número de huevos".
- Huevo 1: fecha propia + estado de fecundación.
- Huevo 2: fecha propia + estado de fecundación; si no existe, se deja vacío.
- Fecundación registrada individualmente como Pendiente / Sí / No.
- El estado de fecundación puede actualizarse posteriormente desde el detalle de la puesta.

### Ciclo del pichón v0.4d
- El nacimiento crea un pichón en seguimiento vinculado a pareja, puesta, padre y madre.
- El contador de edad se calcula automáticamente desde la fecha de nacimiento.
- Parámetros internos configurables: aviso desde día 6 y límite crítico día 10.
- Día 6: próximo a anillar.
- Días 7–9: anillado recomendado.
- Día 10: anillado urgente.
- Más de 10 días: revisar anillado.
- Registrar anilla guarda número y fecha de anillado.
- Después del anillado se puede abrir la ficha completa en Mi Palomar.
- La configuración se guarda en `colombaire_breeding_settings`, preparada para una futura pantalla Ajustes.


### Navegación v0.4e
- Los botones ‹ ahora funcionan como Atrás real.
- COLOMBAIRE conserva el recorrido de pantallas realizado por el usuario.
- Ejemplo: Mi Palomar → Palomo → Cría → ‹ vuelve al Palomo; otro ‹ vuelve a Mi Palomar.
- El comportamiento se aplica de forma global para que los futuros módulos reutilicen la misma navegación.
- La navegación principal inferior reinicia el recorrido, evitando volver accidentalmente a una rama antigua.


## v0.5 — Observaciones
- Nueva pestaña Observaciones en la ficha individual.
- Características iniciales seleccionables: Perseguidor, Constante, Fuerte, Ágil, Inteligente, Buen cierre y Buen reproductor.
- Posibilidad de añadir características personalizadas.
- Campo libre de observaciones generales.
- Características y notas se guardan por ejemplar en localStorage.
- Concursos/Palmarés permanece separado para resultados deportivos estructurados.

## v0.5 — Salud
- Primera integración funcional del módulo Salud.
- 11 fichas: Coccidiosis, Tricomoniasis, Salmonelosis, E. coli, Micoplasmosis, Ornitosis/Clamidiosis, PMV-1, Viruela/Pigota, Circovirus, Rotavirus y Adenovirus.
- Buscador y filtros por tipo de agente.
- Ficha técnica uniforme preparada para alimentar la futura calculadora diferencial.


## v0.5c
Corrección de apertura de enfermedades. Se conserva el sistema funcional de v0.5 y se aplica únicamente el nuevo diseño de ficha sanitaria continua.


## v0.5d
Coccidiosis convertida en ficha madre experimental: color, jerarquía tipográfica, ilustración vectorial propia e iconografía sanitaria. Las demás enfermedades conservan temporalmente v0.5c.


## v0.5e
Coccidiosis reconstruida como infografía interactiva real inspirada en el concepto visual aprobado: cabecera, marca Colombaire, anatomía, bloques cromáticos e iconografía. El texto permanece HTML editable y adaptable a móvil.


## v0.5f
Coccidiosis: sustitución de varios dibujos provisionales por fotografía real. Se mantienen iconos funcionales; microscopía usa una micrografía científica real de Eimeria labbeana-like en Columba livia domestica (Frontiers in Veterinary Science, 2024).


## v0.5g
Coccidiosis: cabecera simplificada (sin fotografía derecha), nuevo emblema de palomo más natural y reencuadre individual de fotografías. La micrografía de ooquistes pasa a object-fit contain para no recortarla.
