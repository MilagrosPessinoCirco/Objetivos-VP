# Research: Riesgos y decisiones

Resuelve las consultas del plan contra el repo, el prototipo v11 y la spec. Lo que no se pudo determinar queda como punto a decidir por la usuaria en el [plan](./plan.md#puntos-que-requieren-una-decisión-de-la-usuaria); lo que depende del sitio de SharePoint, en las [verificaciones a cargo de la usuaria](#verificaciones-pendientes-a-cargo-de-la-usuaria).

Rutas relativas a `src/`. `WP` = `webparts/objetivosVp/components`.

## Qué se reutiliza y qué se cambia

### `core/entities`

| Archivo | Estado | Detalle |
|---|---|---|
| `Riesgo.ts` | **Se reutiliza sin cambios** | Mapea `Tarea` (lookup), `Estado` (`toChoiceValue` con `EstadoRiesgo`), `RequiereDecision` (sí/no), `FechaResolucion`, `Descripcion`, `Created`, `Modified`, `Author`, `Editor`. `toListItem` envía `TareaId`, `Estado` (`assertChoiceValue`), `RequiereDecision`, `FechaResolucion`, `Descripcion` y, por `BaseEntity`, `Id` y `Title` (`Titulo`). Los campos `undefined` no se envían; `null` vacía la columna. Alcanza para todo lo que la feature escribe, porque el servicio siempre guarda el riesgo con `Estado` definido. |
| `Decision.ts` | **Se cambia** | Hoy mapea y envía `Responsable` y `FechaResolucion`. Se quitan (D1): la app no las lee ni las escribe (FR-015, FR-016). Quedan `DecisionNecesaria`, `Riesgo` (lookup), `FechaLimite`, `Created`, `Modified`, `Author`, `Editor`. |
| `BaseEntity.ts` | Se reutiliza | `Titulo` ↔ `Title`. |
| `index.ts` | Se reutiliza | Ya reexporta `Riesgo` y `Decision`. |

### `core/api`

| Archivo | Estado | Detalle |
|---|---|---|
| `Riesgo/IRiesgoDataSource.ts`, `Riesgo/RiesgoDataSource.ts` | **Se amplían** | Tienen `listTitle`, `getItems()` (sin filtro, `top(5000)`), `getFilteredItems(tareaId)` (`TareaId eq n`), `add`, `edit`, `delete`, `getById`. El `select` ya pide los campos de la spec. Falta una lectura por varias tareas con los estados Activo y Escalado: `getActivosEscaladosByTareas(tareaIds)` (D5). |
| `Decision/IDecisionDataSource.ts`, `Decision/DecisionDataSource.ts` | **Se amplían y se recortan** | Mismos métodos; `getFilteredItems(riesgoId)` (`RiesgoId eq n`) sirve para "¿ya tiene decisión?" (D3). El `select` deja de pedir `Responsable` y `FechaResolucion`. Falta una lectura por varios riesgos: `getFilteredItemsByRiesgos(riesgoIds)`, por tandas de 40. |
| `Riesgo/useRiesgoDataSource.ts`, `useItemRiesgoDataSource.ts`, `Decision/useDecisionDataSource.ts`, `useItemDecisionDataSource.ts` | **No se tocan** | Devuelven `useDatasource` **sin mock**: fuera de SharePoint lanzan "Datasource o mock no validos". Como la feature no los usa (usa el servicio), no se modifican (principio IV). |
| `Tarea/TareaMock.ts`, `Iniciativa/IniciativaMock.ts` | Se reutilizan | El servicio lee `getById` de tarea e iniciativa; los mocks ya existen. |
| `useDatasource.ts` | Se reutiliza como referencia | `deleteItem` relanza el error; el servicio no lo usa (no es un hook): llama a `delete` del datasource. |

### Lo nuevo en `core/api/Riesgo` y `core/api/Decision`

`RiesgoMock`, `DecisionMock`, `IRiesgoService`, `RiesgoService` (con `getRiesgoService`), `riesgoReglas.ts`, errores tipados, `useRiesgosTarea`, `useRiesgosIniciativa`. Ver [contracts/service-contracts.md](./contracts/service-contracts.md).

### Constantes de listas

`Lista.Riesgo = "Riesgo"` y `Lista.Decision = "Decision"` (en `core/utils/Constants.ts`) ya existen y son las que usan los datasources. `EstadoRiesgo` (Activo, Escalado, Resuelto) también. No se agrega ninguna constante a `Constants.ts` (las de dominio de la feature son locales de `riesgoReglas.ts`, como `TAREAS_MAX_NO_CANCELADAS`).

### Cómo resolvió la 007 las secciones y los indicadores

| Tema | Cómo está hecho en la 007 | Qué hace esta feature |
|---|---|---|
| Secciones del detalle de la tarea | `WP/Tarea/TareaDetalle/TareaDetalle.tsx` carga tarea, iniciativa, objetivo y áreas, y compone secciones hermanas: `TareaInfo` (expandida, con lápiz) y `TareaComentario` (`defaultCollapsed`, con lápiz). Cada sección usa `WP/shared/SectionBand` (`collapsible`, estado inicial `!defaultCollapsed`) y recibe solo sus datos por props. | Un componente hermano más, `TareaRiesgos`, expandido y sin lápiz de sección, sin tocar los existentes. |
| Pie fijo | `DetailFooter` (contenedor con `children`): Cancelar, Editar (con `canEdit` y `canEditTarea`), Registrar avance (con `canRegisterProgress` y `canRegistrarAvance`) y Historial. | "Cargar riesgo" a continuación de Registrar avance, con `canCreateRiesgo` y `canCargarRiesgo`. |
| Indicadores en la iniciativa | `IniciativaTareasIndicadores`: `SectionBand` `collapsible` con una grilla `grid5` (5 columnas) de `Field`, uno por estado, contados sobre las tareas ya cargadas. | Tres `Field` más en el mismo grupo (caen en la segunda fila de la misma grilla), con un prop opcional `riesgos`. |
| Sección Tareas en la iniciativa | `IniciativaTareas`: `SectionBand` `collapsible` (expandida), `TareasTable` variante `iniciativa`, `emptyText`, paginador `inline`. Carga con `useTareasIniciativa` (filtra por iniciativa; `reload`). Si falla, `MessageBar` de error con "Reintentar" y el resto del detalle se muestra. | `IniciativaRiesgos`: `SectionBand` `collapsible` `defaultCollapsed`, `RiesgosTable` variante `iniciativa`, sin paginador. Carga con `useRiesgosIniciativa`; mismo tratamiento del error. |
| Permisos | Constantes `CAN_*` en `WP/ObjetivosVp/ObjetivosVp.tsx` (`CAN_CREATE_TAREA`, `CAN_EDIT_TAREA`, `CAN_REGISTER_PROGRESS_TAREA`, todas `true`), pasadas por props. | Dos constantes más. |
| Guardado con deshacer y reintento | `TareaFormPanel.save`: dos `useRef` (`tareaCreada`, `entradaCreada`); si falla la entrada, borra la tarea (`deshacerAlta`) y relanza; el reintento no duplica lo ya creado. `TareaAvancePanel`: guarda la entrada y después la tarea, con `useRef` y bloqueo de campos entre intentos. Error en `MessageBar` sin botón; se reintenta pulsando de nuevo. | Mismo patrón, pero la lógica de orden, reversión y reintento vive en el servicio, no en el panel (el panel retiene solo el `pendiente`). |
| Localización | Un solo idioma: `loc/en-us.js` (con textos en español) y `loc/mystrings.d.ts`, claves `Tarea*` y `Tareas*`, `{0}` / `{1}` con `Utils.replaceAll`. | Claves `Riesgo*`. |
| Mocks | `TareaMock` y `AvanceTareaMock`: estado a nivel de módulo, `add` con próximo Id, `edit` que mezcla solo lo definido, `delete`, `getById` con 404; `useTareasIniciativa` y `useAvancesTarea` eligen datasource real o mock según `Environment.type` y el `listTitle`. | `RiesgoMock`, `DecisionMock` y `getRiesgoService`, con la misma selección. |
| Reglas de dominio | `WP/Tarea/tareaUtils.ts`: funciones puras (`getEstadosDisponibles`, `canEditTarea`, `canCargarTarea`, `getFechasIssues`, `formatTareaId`, `getEstadoTareaChipColor`). | `riesgoReglas.ts` (en `core/api/Riesgo`, porque lo usa el servicio) y `riesgoUtils.ts` (solo pantallas). |
| Fechas | `WP/Objetivo/objetivoUtils.ts`: `toDateInput`, `fromDateInput`, `formatDate` (dd/mm/aaaa). No hay una función "hoy": `TareaAvancePanel` usa `toDateInput(new Date())`. | Igual; "hoy" es `new Date()` local comparado por día (FR-010a). |
| Rutas | `WP/ObjetivosVp/routes.ts`; el detalle de la tarea es `/tarea/:id` y el de la iniciativa `/iniciativa/:id`. | Sin rutas nuevas; "Ver" usa `getTareaPath`. |

## Verificaciones en el repo

| # | Consulta | Resultado |
|---|----------|-----------|
| R1 | Listas y columnas | Los `select` de `RiesgoDataSource` (`Id`, `Title`, `Tarea/Id`, `Tarea/Title`, `Estado`, `RequiereDecision`, `FechaResolucion`, `Descripcion`, `Created`, `Modified`, `Author`, `Editor`) y de `DecisionDataSource` (`Id`, `Title`, `DecisionNecesaria`, `FechaResolucion`, `Riesgo/Id`, `Riesgo/Title`, `Responsable`, `FechaLimite`, `Created`, `Modified`, `Author`, `Editor`) coinciden con las dos listas descritas. La spec no necesita ninguna otra columna: autor y fecha de creación y de modificación salen de las columnas del sistema. **No falta nada.** |
| R2 | `Responsable` y `FechaResolucion` de `Decision` | Se leen (`select`), se mapean (`mapItem`) y se envían (`toListItem`, si están definidas). La spec las descarta (FR-015, FR-016). Se quitan de la app (D1). |
| R3 | `Title` | `BaseEntity.toListItem` envía `Title` desde `Titulo`; `Riesgo` y `Decision` no completan `Titulo` al guardar. El ID `RSK-NN` no existe en ningún archivo (`formatRiesgoId` no está). El patrón de IDs es `prefijo + padStart(2, '0')`, que devuelve vacío si no hay Id. |
| R4 | `delete` | `IRiesgoDataSource` y `IDecisionDataSource` lo declaran y las clases lo implementan; `useDatasource` lo expone como `deleteItem`. Ninguna pantalla los usa hoy (no hay pantallas de riesgos). |
| R5 | Mocks de `Riesgo` y `Decision` | No existen. Los hooks existentes de ambas listas llaman a `useDatasource(new XDataSource())` sin mock, así que fuera de SharePoint fallan. |
| R6 | Uso de `Riesgo` y `Decision` fuera de su capa | Ninguna referencia en `webparts/`. `core/entities/index.ts` las reexporta; `core/utils/Constants.ts` define `Lista.Riesgo`, `Lista.Decision` y `EstadoRiesgo`; `ObjetivoMock.ts` y `ResultadoClaveMock.ts` solo tienen las palabras "decisiones" y "riesgo" en textos de ejemplo. Quitar las dos propiedades de `Decision` no rompe nada. |
| R7 | Lecturas filtradas | Solo existen `getFilteredItems(tareaId)` en `Riesgo` y `getFilteredItems(riesgoId)` en `Decision` (un Id), y `getItems()` sin filtro. No hay lectura por varios Id. |
| R8 | `toChoiceValue` / `assertChoiceValue` (`core/utils/Mappers.ts`) | `toChoiceValue` es tolerante: si el valor no está en el enum, avisa con `console.warn` y devuelve `undefined`. `assertChoiceValue` lanza `Error` al escribir un valor que no está en el enum. |
| R9 | Permisos | Las constantes `CAN_*` están en `ObjetivosVp.tsx` (líneas 26 a 36), todas en `true`; las de tareas (`CAN_CREATE_TAREA`, `CAN_EDIT_TAREA`, `CAN_REGISTER_PROGRESS_TAREA`) bajan por props. No hay constantes de riesgos. |
| R10 | Localización | Un idioma (`en-us.js` con textos en español) y `mystrings.d.ts`. Reutilizables: `Cancel`, `Edit`, `Accept`, `SaveChanges`, `RequiredField`, `SectionCollapse`, `SectionExpand`, `TareasRetry`. |
| R11 | Prototipo v11: secciones de riesgos | La sección de la tarea (`Riesgos ({td.nRsks})`) no define lápiz de sección (`secEd.t_rsk` no existe) y no está en `DEF_CL`, así que arranca expandida. La de la iniciativa (`Riesgos de sus tareas ({idt.nRsks})`) está en `DEF_CL.i_rsk`: arranca contraída; tampoco define lápiz (`secEd.i_rsk` no existe). El `LEEME` del prototipo lo confirma ("Riesgos contraídas"). La grilla de la tarea usa `c-rk` y la de la iniciativa `c-ri2` con un botón "Ver" por fila. "Cargar riesgo" está en `acts` (el pie), a continuación de "Registrar avance". |
| R12 | Prototipo v11: textos | Alta: `El riesgo "{desc}" se ha cargado correctamente.`; edición: `…se ha actualizado correctamente.`; escalar: `…se ha escalado correctamente. Se notificó por mail a los responsables de la iniciativa.` (la spec conserva la descripción entre comillas y quita solo la mención al mail). Vacíos: `Esta tarea no tiene riesgos cargados.` / `Las tareas de esta iniciativa no tienen riesgos cargados.` con `Cuando se carguen, van a aparecer acá.`. Placeholders: `Ej.: Aduana retiene el cargamento` y `Qué decisión se necesita y de quién (área o persona)`. Error obligatorio: `Este campo es obligatorio.`. Chips: Activo `c-warn`, Escalado `c-bad`, Resuelto `c-ok`. |
| R13 | Prototipo v11: carpeta | `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` contiene el prototipo v11 (19/11/2026); `docs/Gestion-Objetivos-VP-RRII-prototipo_v11/` es una copia idéntica (mismo `index.html`) todavía sin versionar. La cita de las specs es la de `v5`. |

## H9. Estado de la lista `Riesgo`

**No se pudo validar contra SharePoint**: el repo no incluye el esquema de las listas ni hay acceso al tenant desde esta sesión (y las acciones contra entornos reales requieren autorización explícita). Lo que **sí** se verificó en el código:

- `EstadoRiesgo` en `core/utils/Constants.ts`: `Activo = "Activo"`, `Escalado = "Escalado"`, `Resuelto = "Resuelto"`, exactamente los tres de la spec (FR-004).
- Al **leer**, `toChoiceValue` devuelve `undefined` ante un valor distinto (con `console.warn`); el plan trata ese riesgo como no editable y no lo cuenta como activo ni escalado.
- Al **escribir**, `assertChoiceValue` lanza antes de enviar si el valor no es uno de los tres del enum. Si la lista tuviera otro texto para una opción (por ejemplo, con una tilde o con otro nombre), SharePoint rechazaría el guardado.

**Pendiente**: V1 (a cargo de la usuaria). Resultado a anotar acá: ______________________.

## Decisiones técnicas y alternativas

| # | Pregunta | Decisión | Alternativas descartadas |
|---|---|---|---|
| Q1 | ¿Dónde viven las reglas y el guardado? | `RiesgoService` y `riesgoReglas.ts` en `core/api/Riesgo`. | Panel con `useDatasource` (como la 007): las reglas quedarían solo en la interfaz y se repetirían. Servicio en `webparts`: `core` no puede depender de `webparts`. |
| Q2 | ¿Qué se escribe primero en una edición? | Primero la decisión y al final el riesgo. | Riesgo primero: el estado (fecha de resolución, y el mail futuro de Alertas) podría quedar escrito y revertido. |
| Q3 | ¿Cómo se lee sin N+1? | Filtro `TareaId eq a or …` (máximo 10 por el tope de tareas no canceladas) con `Estado ne 'Resuelto'`, y decisiones por `RiesgoId eq a or …` en tandas de 40. | Una consulta por tarea o por riesgo (prohibido); `getItems()` sin filtro (prohibido); lotes `batched` de PnPjs (siguen siendo una petición por Id); filtro por `Tarea/IniciativaId` (SharePoint no filtra por campos de un lookup que no están proyectados). |
| Q4 | ¿Cómo se registra la fecha de resolución? | `new Date()` local del navegador al guardar el paso a Resuelto; nunca se sobrescribe. | Fecha del servidor (`Modified`): exige un segundo guardado. Columna calculada en la lista: no se modifican listas. |
| Q5 | ¿Cómo se trata un riesgo cuya lectura de `Estado` falla? | No editable (falla cerrado). | Tratarlo como Activo: permitiría escalar o resolver algo que no se pudo leer. |
| Q6 | ¿Qué `Title` lleva `Decision`? | `DecisionNecesaria` recortada a 255. | `RSK-NN`: exige conocer el Id al armar el objeto y se pierde al leer. |
| Q7 | ¿Qué pasa con los contadores de riesgos de una iniciativa cuya carga falla? | La sección y los contadores no se muestran y se ve un error con "Reintentar". | Mostrar 0: parecería que no hay riesgos. |
| Q8 | ¿Los permisos van al servicio? | No: `CAN_*` en la interfaz, como la 007; el servicio aplica solo reglas de estado. El bloqueo por rol llega con RF-19. | Pasar los permisos al servicio hoy: sería código que no se puede verificar (FR-019). |

## Textos de localización

Ver [contracts/ui-contracts.md](./contracts/ui-contracts.md#textos-de-localización).

## Verificaciones pendientes a cargo de la usuaria

Lista V1 a V8 del [plan](./plan.md#verificaciones-a-cargo-de-la-usuaria). Resultado a anotar:

| # | Verificación | Resultado |
|---|---|---|
| V1 | `Riesgo.Estado` tiene exactamente Activo, Escalado y Resuelto | |
| V2 | `Decision.Responsable`, `Decision.FechaResolucion` y `Riesgo.FechaResolucion` no son obligatorias | |
| V3 | Nombres internos de las columnas | |
| V4 | Índices en `Riesgo.Tarea` y `Decision.Riesgo` | |
| V5 | Tipos de `Decision.FechaLimite` y `Riesgo.FechaResolucion` | |
| V6 | `Descripcion` y `DecisionNecesaria` en texto sin formato | |
| V7 | `Riesgo.RequiereDecision` sí/no con valor por defecto | |
| V8 | `Riesgo.Tarea` y `Decision.Riesgo` de un solo valor, sin restricción de borrado que impida la reversión; y quien carga riesgos y decisiones puede eliminar los elementos que creó (la reversión interna depende de eso) | |
