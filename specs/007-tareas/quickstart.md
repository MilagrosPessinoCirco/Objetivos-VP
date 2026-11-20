# Quickstart: validación de Tareas

Guion de QA manual. Prerrequisitos y condiciones iguales a los del [quickstart de la 004](../004-iniciativas/quickstart.md): `npm ci`, workbench hospedado del sitio de desarrollo, escritura solo en las listas de desarrollo y con autorización. Datos en [data-model.md](./data-model.md); decisiones en el [plan](./plan.md).

## Preparación

1. `npm run build` termina sin errores (corre `eslint` y `heft build`).
2. Con mocks (`npm start`, workbench local): los escenarios se pueden recorrer sin SharePoint. Los datos de prueba cubren (data-model, "Datos de los mocks"):
   - iniciativa 1 con 7 tareas en los cinco estados y una tarea reabierta;
   - iniciativa 4 con 10 tareas no canceladas y 1 cancelada (tope de 10 y paginado);
   - iniciativa 5 con 9 tareas no canceladas (el alta que la deja en 10 y el reintento de un alta);
   - iniciativas Finalizada (6) y Cancelada (8) sin tareas, e iniciativas 2 y 3 sin tareas;
   - una iniciativa de otra VP con 1 tarea.
3. Con las listas de desarrollo, además: las columnas y los índices de los preparativos P1 a P7 (más abajo) y los datos de P8.

## Preparativos en SharePoint

Los hace la usuaria en el sitio de desarrollo y se repiten en cada sitio antes de desplegar. El código no los hace. Para cada paso: lista > Configuración (engranaje) > Configuración de la lista.

**Lista `Tarea`** (P1 a P4):

1. Crear la columna `QueHabilita`: Crear columna > Varias líneas de texto > texto sin formato; no obligatoria. Verificar que el nombre interno sea `QueHabilita` (crearla sin espacios ni tildes y renombrar después, si hace falta).
2. Columna `Area`: abrirla y activar "Permitir varios valores". Antes, confirmar que no hay tareas cargadas que dependan del valor único y qué comportamiento tiene la relación al borrar un área ("Restringir la eliminación" o "Eliminar en cascada"); avisar cuál es.
3. Crear `ComentarioEjecutivo` (varias líneas de texto, texto sin formato), `ComentarioEjecutivoFecha` (fecha y hora), `ComentarioEjecutivoAutor` (persona, un solo valor) y `FechaUltimaActualizacion` (fecha y hora). Ninguna obligatoria. Verificar los nombres internos.
4. Columna `RequiereInversion`: dejarla con valor por defecto "No", o no obligatoria. La aplicación no la envía ni la muestra.

**Índices** (P5): debajo de las columnas, "Columnas indizadas" > "Crear un nuevo índice" y elegir la columna principal.

- Lista `Tarea`: `Iniciativa`, `Responsable` y `Objetivo` (tres índices).
- Lista `Avance tarea`: `Tarea`.

Verificar que aparecen en la lista de columnas indizadas.

**Lista `Avance tarea`** (P6): revisar que existan, con estos nombres internos, `Tarea` (búsqueda a `Tarea`), `Avance` (número, 0 decimales), `Estado` (opciones iguales a `EstadoTarea`) y `Comentario`; y que `Comentario` y `Title` no estén marcados como obligatorios. En `Tarea`, que `Estado` tenga las cinco opciones y `Prioridad` las tres. Si algo difiere, avisar antes de seguir.

**Permisos** (P7): confirmar que el grupo que usa la aplicación puede agregar y editar en `Tarea` y agregar en `Avance tarea`, y que puede borrar en `Tarea` (solo para deshacer un alta fallida). La aplicación no edita ni borra entradas del historial.

**Datos de prueba** (P8): cargar, en el sitio de desarrollo y con autorización, una iniciativa con 9 tareas no canceladas y otra con 10, una iniciativa Finalizada y otra Cancelada, y tareas en cada estado.

## Escenarios

| # | Historia | Pasos | Resultado esperado |
|---|----------|-------|--------------------|
| 1 | US5 | Home > "Mis tareas" | Se abre la bandeja en la solapa "Mis tareas", con título "Mis tareas", búsqueda, "Filtros" y "Cargar tarea"; sin botón "Actualizar". |
| 2 | US5 | Mirar solapas y subsolapas | Solapas "Mis tareas (n)" y "Todas (n)" con su total; subsolapas En curso, Frenadas, No iniciadas, Finalizadas y Canceladas con su cantidad, "En curso" elegida; "N tareas en esta vista". |
| 3 | US5 | Solapa "Todas", subsolapa En curso | 11 tareas En curso: se muestran 10, con "Mostrando 1–10 de 11" a la izquierda y el paginador centrado y fijo. Pasar a la página 2; cambiar de subsolapa vuelve a la página 1. Los contadores no cambian al paginar. |
| 4 | US5 | Subsolapa sin tareas, sin filtros | "No hay tareas en este estado.". Con un filtro sin coincidencias: "No hay tareas con estos filtros.". |
| 5 | US5 | Columnas | ID, Tarea, Iniciativa (INI-nn · nombre), Responsable, Compromiso, Actualizada, Avance (porcentaje con color), Estado (chip) y Ver. |
| 6 | US6 | Buscar "tar-03" y parte de un nombre en otra capitalización | Se listan solo las tareas que coinciden. |
| 7 | US6 | Filtros | Panel con Departamento, Objetivo, Iniciativa, Responsable y Año (sin Estado), "Limpiar filtros" y "Aplicar". Combinar con la búsqueda: el contador, las subsolapas y el paginado reflejan el resultado y las solapas no cambian. |
| 8 | US1 | "Cargar tarea" desde la bandeja | Panel "Cargar tarea" con, en una columna: Iniciativa, Objetivo (lectura), Nombre, Responsable, Descripción, ¿Qué habilita?, Áreas involucradas, Prioridad, y lado a lado Fecha de inicio y Fecha de compromiso. Sin Estado, Avance, Fecha de finalización ni Requiere inversión. |
| 9 | US1 | Abrir el campo Iniciativa | Todas menos la Finalizada (6) y la Cancelada (8), incluidas las de otra VP. |
| 10 | US1 | Responsable | Solo personas activas del directorio; admite una. |
| 11 | US1 | Guardar con campos vacíos | No guarda; cada campo faltante muestra "Este campo es obligatorio." (incluida Áreas sin ninguna). |
| 12 | US1 | Compromiso anterior al inicio; fechas fuera de las de la iniciativa | Error en el campo de fecha; el de rango indica las fechas de la iniciativa. |
| 13 | US1 | Elegir la iniciativa 4 (10 tareas no canceladas) y guardar | No guarda; error en el campo Iniciativa: la iniciativa ya tiene 10 tareas no canceladas. Con la iniciativa 5 (9 no canceladas) el alta sí se guarda y la iniciativa queda con 10: "Cargar tarea" del pie se deshabilita. |
| 14 | US1 | Alta válida en la iniciativa 1 | Modal "Estás por cargar la tarea y asignarla a [responsable]. ¿Querés continuar?"; al aceptar, se ve «La tarea "[nombre]" se ha cargado correctamente.», sigue en la bandeja, con estado No iniciada y 0 %. |
| 15 | US3 | Abrir la tarea recién cargada y el historial | Historial con una entrada: fecha de hoy, No iniciada, 0 %, autor, "Tarea cargada."; Comentario ejecutivo: "Todavía no hay comentario ejecutivo.". |
| 16 | US7 | Detalle de la iniciativa 1 | Secciones "Indicadores de las tareas" (No iniciadas, En curso, Frenadas, Finalizadas, Canceladas; los números coinciden con las tareas) y "Tareas (6 de 10 no canceladas)" con las 7 filas (canceladas incluidas), expandidas; avance de la iniciativa sin cambios. |
| 17 | US7 | Detalle de la iniciativa 4 | "Tareas (10 de 10 no canceladas)"; 11 filas, de a 10 por página, con el paginador al final de la sección; "Cargar tarea" del pie deshabilitado. |
| 18 | US7 | Detalle de las iniciativas 2, 6 y 8 | Iniciativa 2: "Esta iniciativa todavía no tiene tareas.", indicadores en 0 y "Cargar tarea" habilitado. Iniciativas 6 y 8: "Cargar tarea" deshabilitado. |
| 19 | US7 | "Cargar tarea" desde la iniciativa 1 | Se abre el panel con la iniciativa elegida y deshabilitada. Al guardar, la sección y los indicadores se actualizan. |
| 20 | US3 | "Ver" una tarea desde la sección | Migas Inicio › Palancas › palanca › objetivo › iniciativa › tarea (la iniciativa es enlace); encabezado "TAR-nn · nombre", estado y "Avance: X %" con color. Volver regresa al detalle de la iniciativa. Para una tarea de otra VP, sin el nivel de palanca. |
| 21 | US3 | Mirar el detalle | "Información de la tarea" expandida (Iniciativa, Objetivo, Responsable, Áreas involucradas, Prioridad, Fecha de inicio, Fecha de compromiso, Fecha de finalización —"—" si no está Finalizada—, Descripción y ¿Qué habilita?) y "Comentario ejecutivo" contraída; cada una con chevron y lápiz. Pie: Cancelar · Editar · Registrar avance · Historial de avance. Sin "Ubicación en la estrategia", Presupuesto, Riesgos ni "Requiere inversión". |
| 22 | US2 | "Registrar avance" en una tarea No iniciada | Panel "Registrar avance" con Estado y Avance lado a lado, Comentario ejecutivo precargado; Estado ofrece No iniciada, En curso y Cancelada. |
| 23 | US2 | En curso, 40 %, comentario nuevo > Aceptar | Se cierra el panel; el detalle muestra En curso, 40 % y el comentario ejecutivo con fecha y autor; se ve «El avance de la tarea "[nombre]" se ha actualizado correctamente.». "Actualizada" cambia; el historial tiene una entrada nueva con el comentario. El avance de la iniciativa no cambia. |
| 24 | US2 | Registrar avance sin tocar el comentario precargado | El comentario ejecutivo no cambia y la entrada nueva queda sin comentario (sin esa línea en el historial). |
| 25 | US2 | Estado Finalizada | El avance pasa a 100 y no se edita; aparece la Fecha de finalización obligatoria. Sin fecha: error. Fecha anterior al inicio o futura: error. Con fecha válida > Aceptar: confirmación "Finalizar tarea" y, al aceptar, queda Finalizada con esa fecha. |
| 26 | US2 | Avance "abc", 150 o 40,5 | Error "Ingresá un número entero entre 0 y 100.". |
| 27 | US2 | Estado Cancelada | Confirmación "Cancelar tarea" (sin mención al presupuesto); al aceptar, la tarea deja de contar en "N de 10", se mantiene en la lista y en la subsolapa Canceladas. En su detalle no hay Editar, Registrar avance ni lápices; sí Historial. |
| 28 | US2 | Registrar avance en una Finalizada | Estado ofrece solo En curso (precargado), Avance 100 modificable, sin Fecha de finalización; al aceptar, no hay confirmación; la tarea queda En curso, sin fecha de finalización, con una entrada nueva. |
| 29 | US2 | Volver a finalizar con otra fecha | Se pide la fecha y la confirmación de Finalizar; el historial conserva las entradas de la reapertura y de la nueva finalización. |
| 30 | US3 | "Historial de avance" | Panel con las entradas del más reciente al más antiguo; cada una con fecha dd/mm/aaaa, estado, avance, autor y comentario (sin la línea si no hay); sin acciones de edición ni borrado. A igual fecha, primero la registrada más tarde. |
| 31 | US4 | "Editar" una tarea | Panel "Editar tarea TAR-nn", Iniciativa y Objetivo en lectura, sin Estado, Avance ni Fecha de finalización; las mismas validaciones del alta. |
| 32 | US4 | Cambiar nombre y responsable > confirmar | Modal "Estás por guardar los cambios de la tarea. ¿Querés continuar?"; se ve «La tarea "[nombre]" se ha actualizado correctamente.»; estado, avance, historial, comentario ejecutivo y "Actualizada" no cambian; la tarea pasa a "Mis tareas" del nuevo responsable. |
| 33 | US4 | Tarea Cancelada | "Editar" no está disponible. Tarea Finalizada: se edita, sin poder cambiar la fecha de finalización. |
| 34 | US1/US2 | Forzar el error del guardado (mock con falla o red cortada) | Una línea "No se pudo guardar la tarea." o "No se pudo registrar el avance de la tarea."; el panel conserva lo ingresado; al reintentar no se duplica la tarea ni la entrada. Alta con la iniciativa 5 (9 no canceladas) y el deshacer también fallando: el reintento completa solo la entrada, sin error de tope. "Registrar avance" con la segunda escritura fallando: Estado, Avance y Comentario ejecutivo quedan bloqueados y el reintento no duplica la entrada. |
| 35 | FR-049 | Forzar un error de carga de la bandeja, del detalle de una tarea y de las tareas del detalle de una iniciativa | En cada caso, aviso de una línea con "Reintentar" que vuelve a cargar; no se muestra el estado vacío como si no hubiera datos. En la iniciativa, el resto del detalle se sigue viendo. |

## Mediciones de los criterios de éxito

Con cronómetro, a mano, con una persona que conozca la aplicación. Con mocks se anotan como referencia; las que cuentan son las del sitio de desarrollo (T079 de `tasks.md`).

| # | Criterio | Cómo se mide | Resultado esperado |
|---|---|---|---|
| M1 | SC-001 | Desde el detalle de una iniciativa, "Cargar tarea", completar el panel, confirmar y ver el mensaje de éxito. | Menos de 2 minutos. |
| M2 | SC-002 | Desde el detalle de una tarea, "Registrar avance", elegir estado, avance y comentario, y ver el mensaje de éxito. | Menos de 1 minuto. |
| M3 | SC-007 | Desde la home, "Mis tareas", encontrar una tarea por parte de su ID o nombre o con un filtro, y abrir su detalle. | Menos de 30 segundos, con el volumen que tenga el sitio de desarrollo (anotar cuántas tareas hay). |
| M4 | SC-008 | Abrir la bandeja y el detalle de una tarea y cronometrar hasta que se ve el contenido. | Menos de 3 segundos cada uno. |

## Verificación final

- No hay ninguna pantalla con presupuesto, inversión, riesgos, decisiones ni alertas de vencimiento (SC-009).
- `npm run build` sin errores.
- Los cambios de `src/core` fuera de `src/core/ui` están registrados en `docs/plantilla-cambios.md`.
- Comparación visual con el prototipo (`scr.tareas`, `scr.tarea`, `sideTar`, `tarUpd`, historial y `i_ind` / `i_tar`) y confirmación de las aproximaciones A1 a A6 del plan.
