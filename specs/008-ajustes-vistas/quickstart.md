# Quickstart: validación de Ajustes de vistas

Guion de QA manual. Prerrequisitos y condiciones iguales a los del [quickstart de la 004](../004-iniciativas/quickstart.md): `npm ci`, workbench local con mocks o hospedado del sitio de desarrollo, escritura solo en las listas de desarrollo y con autorización.

## Preparación

1. `npm run build` termina sin errores.
2. Datos de prueba mínimos: dos palancas activas y una inactiva; objetivos de la VP RRII de dos departamentos, en distintos estados; uno marcado como objetivo de la VP RRII; uno Anual 2026, uno Plurianual 2026–2028 y uno Permanente iniciado en 2026; al menos un objetivo de otra VP; más de 10 objetivos en total.

## Escenarios

| # | Historia | Pasos | Resultado esperado |
|---|----------|-------|--------------------|
| 1 | US1 | Vista de palancas > Filtros | Se abre el panel "Filtros" con Palanca, Departamento, Gerencia, Estado y Año, en ese orden, con "Todas"/"Todos" por defecto. No hay "Responsable". |
| 2 | US1 | Abrir los desplegables | Palanca: solo activas. Departamento: los del maestro. Gerencia: las del maestro, o solo las del departamento si hay uno elegido. Estado: los cuatro del objetivo. Año: los años de los objetivos, ascendente. |
| 3 | US1 | Elegir un departamento > Aplicar | El panel se cierra. En "Todas las palancas" cada palanca muestra solo sus objetivos de ese departamento y se ocultan las que quedan sin objetivos. |
| 3b | US1 | Elegir una gerencia > Aplicar | Igual que el departamento: cada palanca muestra solo los objetivos de esa gerencia. |
| 4 | US1 | Elegir una palanca > Aplicar | "Todas las palancas" muestra solo esa palanca, con todos sus objetivos. |
| 5 | US1 | Elegir un estado > Aplicar y pasar por las cuatro solapas | La solapa elegida filtra por estado. Los filtros y la búsqueda siguen aplicados al cambiar de solapa. |
| 6 | US1 | Año 2027 | Aparecen el Plurianual 2026–2028 y el Permanente iniciado en 2026; no el Anual 2026. Año 2025: ninguno de los Permanentes iniciados en 2026. |
| 7 | US1 | Escribir una búsqueda y aplicar un filtro | Se cumplen ambos a la vez. |
| 8 | US1 | Elegir filtros y cerrar con la X | No se aplican; los filtros anteriores no cambian. |
| 9 | US1 | "Limpiar" | El panel se cierra y se quitan todos los filtros. |
| 9b | US1 | Bandeja de iniciativas > Filtros | El botón de limpiar dice "Limpiar" (antes "Limpiar filtros") y se comporta igual que antes. |
| 10 | US1 | Aplicar filtros que no dejan nada | Se lee "No hay palancas ni objetivos con estos filtros." en una línea. |
| 11 | US2 | Abrir "Todos los objetivos" | Cuarta solapa, con el total entre paréntesis (no cambia con búsqueda ni filtros). Columnas: ID, Objetivo, VP, Palanca, Departamento, Gerencia, Peso, Avance, Estado, Ver. |
| 12 | US2 | Observar un objetivo de otra VP | Palanca "—", Peso "—", Avance "No aplica". |
| 13 | US2 | Palanca = una palanca, o Año = 2027, en "Todos los objetivos" | Los de otras VP desaparecen (no tienen palanca ni fechas). Con Departamento, Gerencia o Estado se filtran normalmente. "Objetivos de otras VP" con Palanca o Año elegidos queda vacía con "No hay palancas ni objetivos con estos filtros.". |
| 14 | US2 | Con más de 10 objetivos | Se pagina de a 10. Lo mismo en "Objetivos de la VP RRII" y "Objetivos de otras VP". Al aplicar filtros o buscar vuelve a la página 1. |
| 15 | US2 | Sin objetivos cargados | "No hay objetivos cargados.". |
| 16 | US2 | Ver en una fila | Navega al detalle del objetivo. |
| 17 | US3 | Leer la línea sobre las solapas | "N palancas activas · N objetivos", sin avance de la VP. Los porcentajes y colores de las grillas no cambiaron. |
| 18 | US4 | Con filtros, búsqueda y solapa elegidos, usar Actualizar | Aparece "La vista se ha actualizado correctamente." y todo se mantiene. |
| 19 | US4 | Repetir con la carga fallando (red cortada) | No aparece el mensaje de éxito; se ve el error de una línea de la vista. |
| 19b | US4 | Bandeja de iniciativas > Actualizar, con vista "Todas", búsqueda, filtros y página 2 elegidos | Aparece "La vista se ha actualizado correctamente." y la vista, la búsqueda, los filtros y la página se mantienen. |
| 19c | US4 | Repetir 19b con la carga fallando | No aparece el mensaje de éxito; se ve "No se pudieron cargar las iniciativas.". |
| 19d | US4 | Con la red cortada, abrir el detalle de una iniciativa, el de un objetivo, el de una palanca y el formulario de iniciativa | Cada pantalla sale de "cargando" y muestra su error de una línea (no queda cargando); sin errores sin atender en la consola. |
| 20 | US5 | Palanca: guardar con el nombre vacío | Error en el campo; no se abre el modal. |
| 21 | US5 | Alta de palanca válida > Guardar | Modal "Nueva palanca" con el texto de FR-020. Cancelar: no guarda y el formulario conserva lo ingresado. Aceptar: guarda y muestra el mensaje de éxito. |
| 22 | US5 | Editar una palanca > Guardar | Modal "Guardar cambios" con el texto de FR-020. |
| 23 | US5 | Alta de objetivo válido > Guardar | Modal "Cargar objetivo" con el texto de FR-021. |
| 24 | US5 | Editar un objetivo desde su detalle > Guardar | Modal "Guardar cambios del objetivo" con el texto de FR-021. |
| 25 | US5 | Repetir 21 y 23 desde el detalle de la palanca | Mismo modal. |
| 26 | US5 | Aceptar con doble clic | Se guarda una sola vez. |
