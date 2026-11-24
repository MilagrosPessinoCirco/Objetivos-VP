# Data Model: Tareas

Usa listas que ya existen (`Tarea` y `Avance tarea`). Los nombres internos son los que usan los datasources de `core/api`. El código no crea ni modifica listas ni columnas: las columnas nuevas y los índices son los [preparativos a cargo de la usuaria](./plan.md#preparativos-a-cargo-de-la-usuaria) (P1 a P8).

## Tarea (`Lista.Tarea` = "Tarea")

| Atributo (entidad) | Columna (interna) | Tipo | Obligatorio | Regla |
|---|---|---|---|---|
| `Id` | `Id` | autonumérico | sistema | Se muestra como `TAR-<Id con dos dígitos>`. No se edita (FR-001). |
| `Titulo` | `Title` | texto | sistema | Se escribe igual que `Nombre` al crear y al editar. **Cambio**: hoy no se envía (D2). |
| `Nombre` | `Nombre` | texto, hasta 100 | sí | Sin espacios al inicio y al final. Más de 100: no se guarda (FR-012a). |
| `Descripcion` | `Descripcion` | varias líneas | sí | Sin largo máximo propio. |
| `QueHabilita` | `QueHabilita` | varias líneas | sí | **Columna nueva** (P1). Sin largo máximo propio. |
| `Iniciativa` | `Iniciativa` (lookup a `Iniciativa`) | un valor | sí | No cambia después del alta (FR-001). Solo iniciativas no Finalizadas ni Canceladas al cargar (FR-011). Indexada (P5). |
| `Objetivo` | `Objetivo` (lookup a `Objetivo`) | un valor | sí | El de la iniciativa, escrito en el alta. La interfaz lo muestra a partir de la iniciativa, nunca de esta columna (FR-006). Indexada (P5). |
| `Responsable` | `Responsable` (persona) | un valor | sí | Persona activa del directorio (FR-005). Indexada (P5). |
| `Area` | `Area` (lookup a `Area`) | **varios valores** | sí (al menos una, lo valida la aplicación) | **Cambio** (P2): hoy un solo valor. Mismas áreas que la iniciativa (FR-003). |
| `Prioridad` | `Prioridad` (opción) | `Prioridad` | no | Alta · Media · Baja; vacío = sin prioridad. Se vacía con `null` (D2). |
| `FechaInicio` | `FechaInicio` | fecha | sí | Dentro de las fechas de la iniciativa (FR-009). |
| `FechaCompromiso` | `FechaCompromiso` | fecha | sí | No anterior al inicio (FR-008) y dentro de las fechas de la iniciativa (FR-009). |
| `Avance` | `Avance` | número sin decimales | sí | Entero de 0 a 100 (FR-022). 0 al crear. |
| `Estado` | `Estado` (opción) | `EstadoTarea` | sí | No iniciada · En curso · Frenada · Finalizada · Cancelada. No iniciada al crear. Transiciones de FR-019a. |
| `FechaFinalizacion` | `FechaFinalizacion` | fecha | condicional | Obligatoria con Finalizada; no anterior al inicio ni futura (FR-020a); vacía con otro estado. Se vacía con `null` al reabrir. No se edita (FR-020). |
| `FechaUltimaActualizacion` | `FechaUltimaActualizacion` | fecha y hora | no obligatoria en la lista; la escribe la aplicación | **Columna nueva** (P3). En el alta, la fecha del alta; en "Registrar avance", el `Created` de la entrada nueva. Editar los datos no la modifica (FR-024). Se muestra como "Actualizada". |
| `ComentarioEjecutivo` | `ComentarioEjecutivo` | varias líneas | no | **Columna nueva** (P3). Hasta 500 caracteres (FR-012a). Vacío en el alta. Se reemplaza, nunca se borra (FR-021). |
| `ComentarioEjecutivoFecha` | `ComentarioEjecutivoFecha` | fecha y hora | no | **Columna nueva** (P3). `Created` de la entrada que lo registró. |
| `ComentarioEjecutivoAutor` | `ComentarioEjecutivoAutor` (persona) | un valor | no | **Columna nueva** (P3). `Author` de la entrada que lo registró. |
| `RequiereInversion` | `RequiereInversion` (sí/no) | — | — | **No se usa**: no se carga, la entidad no lo envía y no se muestra (FR-013). La lista la resuelve con valor por defecto "No" o no obligatoria (P4). |
| `Created`, `Author`, `Modified`, `Editor` | — | sistema | — | Sin uso en esta feature. |

### Columnas nuevas y cambios en SharePoint

Contraste de la entidad actual con lo que pide la spec. Lo hace la usuaria (plan, P1 a P4); el código no los crea.

| Columna | Acción | Tipo | Por qué | Preparativo |
|---|---|---|---|---|
| `QueHabilita` | Crear | Varias líneas de texto, texto sin formato, no obligatoria | FR-003: campo separado de Descripción | P1 |
| `Area` | Cambiar | Permitir varios valores (se mantiene el nombre interno) | FR-003: áreas involucradas múltiples | P2 |
| `ComentarioEjecutivo` | Crear | Varias líneas de texto, texto sin formato, no obligatoria | FR-021: comentario ejecutivo propio | P3 |
| `ComentarioEjecutivoFecha` | Crear | Fecha y hora, no obligatoria | FR-039a: fecha del último comentario | P3 |
| `ComentarioEjecutivoAutor` | Crear | Persona, un solo valor, no obligatoria | FR-039a: autor del último comentario | P3 |
| `FechaUltimaActualizacion` | Crear | Fecha y hora, no obligatoria en la lista (la escribe la aplicación) | FR-024: columna "Actualizada" | P3 |
| `RequiereInversion` | Ajustar | Sí/no con valor por defecto "No", o no obligatoria | RF-12 la pide obligatoria; la feature no la envía (FR-013) | P4 |

El tipo de fecha y hora de las columnas nuevas es una propuesta del plan: la spec solo pide mostrar dd/mm/aaaa.

### Quién escribe cada campo

| Campo | Alta | Edición de datos | Registrar avance |
|---|---|---|---|
| `Title`, `Nombre`, `Descripcion`, `QueHabilita`, `Area`, `Prioridad`, `FechaInicio`, `FechaCompromiso` | Sí | Sí | No |
| `Iniciativa`, `Objetivo` | Sí | No (solo lectura) | No |
| `Responsable` | Sí | Sí | No |
| `Estado`, `Avance` | Sí (No iniciada, 0) | No | Sí |
| `FechaFinalizacion` | No | No | Sí (la fecha, o `null` al reabrir) |
| `FechaUltimaActualizacion` | Sí (fecha del alta) | No | Sí |
| `ComentarioEjecutivo`, `ComentarioEjecutivoFecha`, `ComentarioEjecutivoAutor` | No (vacíos) | No | Solo si el comentario es nuevo o modificado |
| `RequiereInversion` | No | No | No |

Los objetos que se guardan son parciales: solo llevan los campos de su columna. Los demás no se envían y SharePoint los conserva.

## AvanceTarea (`Lista.AvanceTarea` = "Avance tarea")

Sin columnas nuevas. Solo se agregan registros: la aplicación nunca los edita ni los borra (FR-025).

| Atributo (entidad) | Columna (interna) | Tipo | Obligatorio | Regla |
|---|---|---|---|---|
| `Id` | `Id` | autonumérico | sistema | Desempata el orden de dos entradas con la misma fecha: la de mayor `Id` es la registrada más tarde (FR-039). |
| `Tarea` | `Tarea` (lookup a `Tarea`) | un valor | sí | Indexada (P5). |
| `Avance` | `Avance` | número sin decimales | sí | Entero de 0 a 100. |
| `Estado` | `Estado` (opción) | `EstadoTarea` | sí | El estado de la tarea después de esa actualización. |
| `Comentario` | `Comentario` | varias líneas | no | Hasta 500 caracteres. En la primera entrada: "Tarea cargada.". En las demás, solo si el comentario ejecutivo fue nuevo o modificado. |
| fecha | `Created` | sistema | — | Se muestra dd/mm/aaaa, sin hora (FR-025). |
| autor | `Author` | sistema | — | Quien guardó la entrada (FR-025). |
| `Titulo` | `Title` | texto | sistema | Queda vacío, como en `Comentario iniciativa`. No debe ser obligatorio (P6). |

## Relaciones

```text
Iniciativa 1 ── 0..10 no canceladas ── N Tarea (las canceladas no cuentan en el tope)
Tarea      1 ── 1..N ── AvanceTarea (la primera se crea con la tarea)
Objetivo   1 ── N Iniciativa            (la tarea muestra el objetivo a través de su iniciativa)
```

## Estados, transiciones y acciones (FR-019a)

| Estado | Editar datos | Registrar avance | Pasa a | Chip |
|---|---|---|---|---|
| No iniciada | Sí | Sí | En curso, Cancelada | `neutral` |
| En curso | Sí | Sí | Frenada, Finalizada, Cancelada | `brand` |
| Frenada | Sí | Sí | En curso, Cancelada | `danger` |
| Finalizada | Sí | Sí, solo para reabrir a En curso | En curso | `success` |
| Cancelada | No | No | — | `secondary` |

La confirmación previa (FR-023) se pide solo al entrar en Finalizada o Cancelada. En una Finalizada, "Registrar avance" ofrece únicamente En curso, no pide fecha de finalización ni confirmación, conserva el avance en 100 y deja una entrada nueva.

## Valores calculados (no se guardan)

| Valor | Regla | Se muestra en |
|---|---|---|
| Objetivo de la tarea | El de su iniciativa. | Panel, detalle y migas. |
| `N de 10 no canceladas` | Tareas de la iniciativa cuyo estado no es Cancelada, incluidas las Finalizadas. | Rótulo de la sección Tareas. |
| Indicadores por estado | Cantidad de tareas de la iniciativa en cada estado (todas, canceladas incluidas), sin paginar. | Sección "Indicadores de las tareas". |
| Contadores de solapas | Total de la solapa, sin búsqueda ni filtros, sin paginar. | Bandeja. |
| Contadores de subsolapas | Tareas de la solapa con búsqueda y filtros aplicados, sin paginar. | Bandeja. |
| Color del avance | C-07: menos de 60 rojo; de 60 a menos de 80 amarillo; 80 o más verde (`getAvanceColor`, reutilizado). | Grillas y encabezado del detalle. |
| Año de la tarea | Los años entre la fecha de inicio y la de compromiso del objetivo de su iniciativa, ambos incluidos. | Filtro Año. |

El avance de la tarea no interviene en el avance de la iniciativa ni en el del objetivo (FR-027, C-03, C-04).

## Datos de los mocks

`TareaMock` y `AvanceTareaMock` (plan, D1) con Ids y personas de `IniciativaMock` y `UsuarioMock`. Composición:

| Iniciativa | Tareas | Para probar |
|---|---|---|
| 1 · Tablero de insights comerciales (15/01/2026–30/06/2026) | 7: 3 En curso, 1 Frenada, 1 No iniciada, 1 Finalizada, 1 Cancelada | Los cinco estados, prioridad vacía, varias áreas, comentario ejecutivo con y sin valor, una tarea reabierta (5 entradas de historial), "Mis tareas" del usuario de prueba |
| 4 · YPF Store en estaciones (01/01/2026–31/12/2027) | 11: 10 no canceladas (8 En curso, 1 Frenada, 1 Finalizada) y 1 Cancelada | Tope de 10 (US1 esc. 10, US7 esc. 7), paginado de la sección (11 filas), paginado de la bandeja (11 En curso en total) |
| 5 · Catálogo online de YPF Store (01/04/2026–30/06/2027) | 9, todas no canceladas: 5 No iniciada, 2 Frenada, 2 Finalizada | El alta con una iniciativa de 9 tareas (queda en 10) y el reintento de un alta con la tarea huérfana, que no debe bloquearse por el tope |
| 6 (Finalizada) y 8 (Cancelada) | 0 | Que no aparezcan en el campo Iniciativa y que "Cargar tarea" esté deshabilitado |
| 2 y 3 | 0 | Estado vacío de la sección y 0 en los indicadores |
| Una de otra VP (objetivo 5) | 1 | Sección Tareas en iniciativas de otra VP (FR-044) |

Cada tarea tiene como mínimo su entrada de alta ("Tarea cargada.", 0 %, No iniciada). Todas las fechas de las tareas quedan dentro de las de su iniciativa.
