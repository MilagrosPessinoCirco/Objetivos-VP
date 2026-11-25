# Contratos de interfaz: Riesgos y decisiones

Props de las piezas nuevas o ampliadas del webpart, constantes de permiso y textos de `loc/`. El comportamiento detallado está en [plan.md](../plan.md#decisiones) y el servicio en [service-contracts.md](./service-contracts.md). No hay rutas nuevas.

Rutas relativas a `src/webparts/objetivosVp/components`.

## 1. Piezas nuevas

### `Riesgo/riesgoUtils.ts`

| Función | Contrato |
|---|---|
| `formatRiesgoId(id?)` | `RSK-` + `Id` con dos dígitos; vacío si no hay Id (como `formatTareaId`). |
| `getEstadoRiesgoChipColor(estado?)` | Activo → `warning`, Escalado → `danger`, Resuelto → `success`, otro → `neutral`. |
| `getEstadoRiesgoLabel(estado?)` | Texto del estado para el chip y el desplegable. |
| `getRiesgoRuleMessage(regla)` | Clave de `loc/` de cada regla de `riesgoReglas.ts`. |

### `Riesgo/RiesgosTable/RiesgosTable.tsx`

| Prop | Tipo | Uso |
|---|---|---|
| `variant` | `'tarea' \| 'iniciativa'` | Define columnas y vacío. |
| `items` | `IRiesgoConDecision[]` | Filas. En la variante `tarea`, todos los riesgos; en `iniciativa`, los activos y escalados. |
| `emptyText` | `string` | Texto del estado vacío. |
| `canEdit` | `boolean` | Solo `tarea`. Con `true`, el lápiz aparece en las filas editables. |
| `isEditable` | `(item) => boolean` | Solo `tarea`. Resuelve `isRiesgoEditable` con la tarea; en la fila no editable, "—". |
| `onEdit` | `(item) => void` | Solo `tarea`. |
| `onView` | `(tareaId: number) => void` | Solo `iniciativa`. Abre el detalle de la tarea. |

Columnas: **tarea** = ID, Riesgo, Requiere decisión, Decisión necesaria, Fecha límite, Estado, Acción. **iniciativa** = ID, Riesgo, Tarea (`TAR-nn · nombre`), Decisión necesaria, Fecha límite, Estado, Ver. La fecha con `formatDate`; "—" en decisión y fecha cuando no requiere decisión. Estado con `Chip` `size="small"`. Sin paginación. Acción: `Tooltip` «Editar riesgo» (`RiesgoEdit`) y aria-label «Editar riesgo RSK-nn» (la plantilla `RiesgoFormEditTitle` con `{0}` = el ID). Ver: `Tooltip` `TareaViewTooltip` («Ver tarea») y aria-label `TareaViewAriaLabel` con `{0}` = el ID de la tarea.

**Orden de las filas** (decidido el 2026-11-25): la tabla muestra `items` en el orden recibido y no reordena. El servicio los entrega con `ordenarRiesgos`: Escalados primero, después Activos y al final Resueltos, y dentro de cada grupo por ID ascendente; en la variante `iniciativa`, el mismo criterio sin Resueltos. Se resuelve en memoria, no en la consulta.

### `Riesgo/RiesgoForm/RiesgoFormPanel.tsx`

| Prop | Tipo | Uso |
|---|---|---|
| `tarea` | `Tarea` | Contexto: ID y nombre en el subtítulo y `tareaId` del alta. |
| `item` | `IRiesgoConDecision \| undefined` | Sin valor = alta; con valor = edición. |
| `onSaved` | `(escalado: boolean, descripcion: string) => void` | Tras un guardado exitoso. `escalado` indica el paso de Activo a Escalado para elegir el mensaje; `descripcion` es la descripción guardada (recortada), que completa el `{0}` del mensaje. El detalle recarga y muestra `SuccessNotice`. |
| `onCancel` | `() => void` | Cierra sin guardar. |

Comportamiento: ver [plan.md](../plan.md#mapeo-elemento--componente) (panel) y los escenarios de la spec. Sin modal de confirmación. Valida con las reglas puras y llama al servicio; muestra el error de cada campo, `RiesgoRuleError` si el servicio rechaza por una regla, y `RiesgoSaveError` o `RiesgoSaveIncompleteError` ante un fallo del guardado. Retiene `pendiente` en un `useRef`. Mientras hay un `pendiente` (la reversión del alta falló) bloquea todos los campos (`isLocked`) para que el reintento no cambie lo ya creado; como el `Picker` del DS no tiene `disabled`, la fecha límite se muestra entonces como `Input` deshabilitado. El Estado de la edición ofrece `getEstadosDisponibles`; Requiere decisión queda deshabilitado en "Sí" si hay decisión guardada (`isRequiereDecisionFijo`).

### `Riesgo/RiesgoForm/RiesgoForm.tsx`

Cuerpo del panel; no guarda.

| Prop | Tipo | Uso |
|---|---|---|
| `values` | `IRiesgoFormValues` | **Obligatoria.** Descripción, estado, requiere decisión, decisión y fecha límite. |
| `issues` | `IRiesgoFormIssues` | **Obligatoria.** Error de cada campo. |
| `isLocked` | `boolean` | **Obligatoria.** Bloquea los campos (hay un `pendiente` del alta). |
| `onChange` | `(values) => void` | **Obligatoria.** |
| `isEdit` | `boolean` | Opcional, por defecto `false`. Con `true`, Estado es un `Dropdown`; sin él, un `Input` deshabilitado con "Activo". |
| `estadosDisponibles` | `EstadoRiesgo[]` | Opcional, por defecto `[]`. Opciones del `Dropdown` de Estado. |
| `isRequiereDecisionFijo` | `boolean` | Opcional, por defecto `false`. Deshabilita Requiere decisión (decisión ya guardada). |

### `Tarea/TareaDetalle/TareaRiesgos/TareaRiesgos.tsx`

| Prop | Tipo | Uso |
|---|---|---|
| `items` | `IRiesgoConDecision[]` | Riesgos de la tarea. |
| `isLoading` | `boolean` | Muestra `Spinner`. |
| `error` | `boolean` | Muestra `MessageBar` de error con "Reintentar". |
| `onRetry` | `() => void` | Recarga. |
| `tarea` | `Tarea` | Para `isRiesgoEditable`. |
| `canEdit` | `boolean` | `canEditRiesgo` de `TareaDetalle`. |
| `onEdit` | `(item) => void` | Abre el panel en edición. |

`SectionBand` `collapsible`, título `RiesgoSection` con N, sin `defaultCollapsed`, sin lápiz de sección. El botón "Cargar riesgo" del pie es `secondary`.

### `Iniciativa/IniciativaDetalle/IniciativaRiesgos/IniciativaRiesgos.tsx`

| Prop | Tipo | Uso |
|---|---|---|
| `items` | `IRiesgoConDecision[]` | Riesgos activos y escalados de las tareas no canceladas. |
| `onView` | `(tareaId: number) => void` | Abre `/tarea/:id` con `state.from` = la iniciativa. |

`SectionBand` `collapsible` `defaultCollapsed`, título `RiesgoIniciativaSection` con N, sin lápiz.

## 2. Piezas ampliadas

| Pieza | Cambio |
|---|---|
| `Tarea/TareaDetalle/TareaDetalle.tsx` | Props nuevas `canCreateRiesgo` y `canEditRiesgo`. Usa `useRiesgosTarea(tareaId)`; renderiza `TareaRiesgos` después de `TareaComentario`; suma "Cargar riesgo" al pie a continuación de "Registrar avance" (visible con `canCreateRiesgo && canCargarRiesgo(tarea, iniciativa)`, que usa la iniciativa que ya carga); abre `RiesgoFormPanel`; al guardar, recarga la sección y muestra `SuccessNotice`. |
| `Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` | Usa `useRiesgosIniciativa(tareas.items, …)`; renderiza `IniciativaRiesgos` al final; si falla la carga de riesgos, `MessageBar` de error con "Reintentar" en lugar de la sección y de los tres contadores. |
| `Iniciativa/IniciativaDetalle/IniciativaTareasIndicadores/IniciativaTareasIndicadores.tsx` | Prop opcional nueva `riesgos?: { activos: number; escalados: number; decisionesPendientes: number }`. Con valor, suma tres `Field` a continuación de los cinco estados. El estilo `grid5` no cambia: los tres caen en la segunda fila. |
| `ObjetivosVp/ObjetivosVp.tsx` | Dos constantes nuevas (abajo) y los props a `TareaDetalle`. |

## 3. Constantes de permiso

En `ObjetivosVp/ObjetivosVp.tsx`, junto a las demás `CAN_*`, ambas en `true` hasta RF-19 (FR-019):

| Constante | Controla |
|---|---|
| `CAN_CREATE_RIESGO` | "Cargar riesgo" en el pie del detalle de la tarea. |
| `CAN_EDIT_RIESGO` | El lápiz de edición de cada riesgo editable. |

No definen roles. El servicio no las recibe.

## Textos de localización

Un solo idioma (`loc/en-us.js`, con textos en español) más `loc/mystrings.d.ts`. Las claves se agregan al contrato y al archivo de idioma. Se **reutilizan** las existentes (texto confirmado en `loc/en-us.js`): `Cancel`, `Save`, `Yes`, `No`, `RequiredField`, `SectionCollapse`, `SectionExpand`, `TareasRetry`, `Edit`, `ObjetivoNoValue` («—»), `ObjetivoColumnId` («ID»), `TareaColumnName` («Tarea»), `ObjetivoColumnStatus` («Estado»), `ResultadoClaveColumnAction` («Acción»), `ObjetivoColumnView` («Ver»), `ObjetivoFormStatus` («Estado», campo), `ObjetivoFieldDescription` («Descripción», campo), `TareaViewTooltip` («Ver tarea») y `TareaViewAriaLabel` («Abrir tarea {0}»), como `TareasTable`. No se crean claves `Riesgo*` para esos textos. Origen: **P** = prototipo v11; **S** = spec; **N** = texto propio de esta feature (no está en el prototipo).

| Clave | Texto | Origen |
|---|---|---|
| `RiesgoSection` | «Riesgos ({0})» | P |
| `RiesgoIniciativaSection` | «Riesgos de sus tareas ({0})» | P |
| `RiesgoNew` | «Cargar riesgo» | P |
| `RiesgoFormEditTitle` | «Editar riesgo {0}» | P |
| `RiesgoFieldDescriptionPlaceholder` | «Ej.: Aduana retiene el cargamento» | P |
| `RiesgoFieldRequiresDecision` | «Requiere decisión» | P |
| `RiesgoFieldDecision` | «Decisión necesaria» | P |
| `RiesgoFieldDecisionPlaceholder` | «Qué decisión se necesita y de quién (área o persona)» | P |
| `RiesgoFieldDueDate` | «Fecha límite de la decisión» | P |
| `RiesgoColRisk`, `RiesgoColDueDate` | «Riesgo», «Fecha límite» | P |
| `RiesgoStateActive`, `RiesgoStateEscalated`, `RiesgoStateResolved` | «Activo», «Escalado», «Resuelto» | P |
| `RiesgoEdit` (tooltip) | «Editar riesgo» | P |
| `RiesgoSectionEmpty` | «Esta tarea no tiene riesgos cargados. Cuando se carguen, van a aparecer acá.» | P, S |
| `RiesgoIniciativaEmpty` | «Las tareas de esta iniciativa no tienen riesgos cargados. Cuando se carguen, van a aparecer acá.» | P |
| `RiesgoIndicatorActive`, `RiesgoIndicatorEscalated`, `RiesgoIndicatorPendingDecisions` | «Riesgos activos», «Riesgos escalados», «Decisiones pendientes» | P |
| `RiesgoCreated` | «El riesgo "{0}" se ha cargado correctamente.» | P |
| `RiesgoUpdated` | «El riesgo "{0}" se ha actualizado correctamente.» | P |
| `RiesgoEscalated` | «El riesgo "{0}" se ha escalado correctamente.» | P (excepción a FR-024: sin la mención al mail del prototipo) |
| `RiesgoDueDatePast` | «La fecha límite no puede ser anterior a hoy.» | S |
| `RiesgoSaveError` | «No se pudo guardar el riesgo. Volvé a intentarlo.» | N |
| `RiesgoSaveIncompleteError` | «No se pudo completar el guardado: el riesgo y su decisión pueden haber quedado a medias. Volvé a intentarlo.» | N |
| `RiesgoRuleError` | «No se pudo guardar: el riesgo ya no admite este cambio.» | N |
| `RiesgosLoadError` | «No se pudieron cargar los riesgos.» | N |

Los textos **N** no existen en el prototipo; los define esta feature (como la 007, D11) y se confirman en la revisión visual. Las claves no incluyen ningún texto sobre el mail (FR-012).
