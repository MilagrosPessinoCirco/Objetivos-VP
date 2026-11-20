# Research: Tareas

Resuelve las consultas del plan contra el repo, el prototipo v11 y la spec. Lo que no se pudo determinar queda como "A confirmar" en el [plan](./plan.md#a-confirmar); lo que depende del sitio de SharePoint, en los [preparativos a cargo de la usuaria](./plan.md#preparativos-a-cargo-de-la-usuaria).

## Verificaciones en el repo

| # | Consulta | Resultado |
|---|----------|-----------|
| R1 | Datos existentes | `core/entities` y `core/api` ya tienen `Tarea` y `AvanceTarea`, con datasource, interfaz (con `getFilteredItems(iniciativaId)` y `getFilteredItems(tareaId)`) y los dos hooks (`use<E>DataSource`, `useItem<E>DataSource`). Ninguno pasa un mock a `useDatasource`, así que en el workbench local (`EnvironmentType` distinto de SharePoint) lanzan "Datasource o mock no validos". `Riesgo`, `PresupuestoTarea` y `Decision` tienen entidad y datasource, sin uso. |
| R2 | `Tarea.toListItem` | Llama a `assertChoiceValue(Prioridad, this.Prioridad, …)` y `assertChoiceValue(EstadoTarea, this.Estado, …)`: con un campo `undefined` lanza una excepción, así que no se pueden guardar objetos parciales ni una tarea sin prioridad (que es opcional). No envía `Title` (usa `...super.toListItem()` con el `Titulo` heredado). Los demás campos `undefined` se omiten al serializar. |
| R3 | Columnas que usa la entidad | `Nombre`, `Descripcion`, `Iniciativa`, `Objetivo`, `Responsable`, `Prioridad`, `FechaInicio`, `FechaCompromiso`, `Avance`, `Estado`, `FechaFinalizacion`, `RequiereInversion` y `Area` (un solo valor: `toLookupValue` y `AreaId` simple). No tiene "¿Qué habilita?", comentario ejecutivo ni fecha de última actualización. `Iniciativa.Area`, en cambio, ya es múltiple (`toLookupValueArray`, `toLookupIds`). |
| R4 | `useDatasource` | Devuelve `[state, getItems, addItem, editItem, deleteItem, getById]`. `addItem`, `editItem`, `deleteItem` y `getById` relanzan el error (los dos últimos desde la 006). Alcanza para un deshacer: no hay que modificar `useDatasource`. |
| R5 | Lecturas filtradas | `useDatasource` no expone consultas filtradas. El patrón vigente es `useComentariosIniciativa`: elige datasource o mock según `Environment.type`, consulta al montar y al cambiar el Id, y devuelve `{ items, isLoading, error, reload }`. Los dos datasources de esta feature ya implementan `getFilteredItems` con `IniciativaId eq n` y `TareaId eq n`. |
| R6 | Home | `AccessList` define `ACCESS_ITEMS`; "Mis tareas" (`AccessMyTasks`) no tiene `route`, los de iniciativas y palancas sí. Los demás accesos (Tablero VP y ABM) tampoco. |
| R7 | Rutas y estado | `routes.ts` define los paths y `INICIATIVAS_VISTA_PARAM` / `_TODAS`. `ObjetivosVpRoutes` guarda `bandejaState` (búsqueda, filtros y página) y se lo pasa a `IniciativasBandeja`; la solapa vive en el parámetro `vista`. El router es `HashRouter`. |
| R8 | Paginador y pie fijo | `IniciativasPaginador` (`.pager`) y `DetailFooter` (`.footer`) tienen la misma posición: `position: fixed; right: 0; bottom: 0; left: 0; z-index: 12`. `IniciativasBandeja` reserva `96px` abajo (`PAGER_SPACE`); `IniciativaDetalle` también reserva `96px` (`PAGE_PADDING`). Dos barras fijas a la vez se superponen. El paginador devuelve `null` si `total <= pageSize`. |
| R9 | `IniciativasHeader` | Fija el placeholder del buscador (`IniciativasSearchPlaceholder`) y el rótulo del botón nuevo (`IniciativaNew`); el título viene por props. El botón de filtros usa `PalancasFilters` ("Filtros"). No tiene botón "Actualizar". |
| R10 | `Dropdown` del DS | `IDropdownProps`: `label`, `options`, `placeholder`, `value`, `multiple`, `required`, `errorMessage`, `disabled`, `onChange`. Sin buscador. `Picker` tiene `mode="date"` y `mode="people"` (este con buscador y selección múltiple, que la 004 limita a uno con `slice(-1)`). |
| R11 | Guardado conjunto de la 006 | `IniciativaFormPanel` guarda con `useRef` la iniciativa y los resultados clave ya creados; `saveAlta` crea lo pendiente y, si falla, llama `deshacerAlta` (borra los resultados clave creados y después la iniciativa) y relanza el error original; el reintento retoma desde lo que quedó. El cuerpo del formulario (`IniciativaFormBody`) captura el error, muestra `IniciativaSaveError` y deja de guardar. |
| R12 | Avance y color | `resultadoClaveUtils.ts` exporta `getAvanceColor` (rojo < 60, amarillo < 80, verde), `formatAvance` y `AvanceColor`; `shared/AvanceText` los usa con `spaced` opcional. Los umbrales son constantes de dominio de ese archivo. |
| R13 | Presupuesto y riesgos | `Tarea.RequiereInversion` se lee y se escribe (`toListItem` lo incluye) pero ninguna pantalla lo usa. `Riesgo` y `PresupuestoTarea` no tienen mock ni hooks usados. |
| R14 | `AvanceTarea` | Mapea `Tarea` (lookup), `Avance`, `Estado`, `Comentario`, `Created`, `Modified`, `Author`, `Editor`. No tiene `Fecha` ni `Autor` propios: salen de `Created` y `Author`. `toListItem` no pasa `Title` (queda `''`), como `ComentarioIniciativa`. |
| R15 | Orden de las secciones | El detalle de la iniciativa implementado (004 y 006) ordena Información (expandida), Resultados clave (si es de la VP RRII) y Comentario ejecutivo (contraído). El prototipo ordena Información, Comentario, Resultados clave, Indicadores de las tareas y Tareas, con Presupuesto y Riesgos al final. |
| R16 | `PalancaBreadcrumb` | Props `palancaNombre`, `palancaId`, `objetivoNombre`, `objetivoId`, `iniciativaNombre`. Arma Inicio › Palancas › palanca (si hay) › objetivo; si hay `iniciativaNombre`, el objetivo es un enlace y la iniciativa es el último nivel sin enlace. No tiene nivel de tarea. |
| R17 | `ActivityItems` | `IActivityItem`: `key`, `variant` (`comment`, `deletion`, `notice`, `photoComment`), `author`, `verb`, `description?`, `subject?`, `time?`, `avatarSrc?`; el contenedor tiene `title?` y `emptyMessage?`. Sin campos de estado ni de avance. |
| R18 | Datos de apoyo | `IniciativaMock` tiene 13 iniciativas (Id 1 a 13): la 1 ("Tablero de insights comerciales", 15/01/2026–30/06/2026, En curso), la 4 ("YPF Store en estaciones", 01/01/2026–31/12/2027, En curso), la 6 Finalizada, la 8 Cancelada y las de objetivos 5 y 6 de otra VP. `UsuarioMock` exporta `USUARIO_PRUEBA`, `BARBARA` y `MARIA`, y tiene un usuario inactivo. `AreaMock` tiene las áreas 1 a 4 que usa `IniciativaMock`. |
| R19 | Localización | Un solo archivo de idioma, `loc/en-us.js`, más `loc/mystrings.d.ts`. Ya existen, entre otros: `Cancel`, `Accept`, `SaveChanges`, `Edit`, `RequiredField`, `ObjetivoNoValue` ("—"), `ObjetivoDateOrder`, `ObjetivoDetailProgress` ("Avance:"), `ObjetivoFieldStartDate`, `ObjetivoFieldCommitmentDate`, `ObjetivoFormStatus`, `ObjetivoFieldDepartment`, `ObjetivoColumnName`, `ObjetivoColumnId`, `ObjetivoColumnProgress`, `ObjetivoColumnStatus`, `ObjetivoColumnView`, `IniciativaColumnName`, `IniciativaAreas`, `IniciativaDescription`, `IniciativaCommentSection`, `IniciativaCommentEmpty`, `IniciativaCommentMeta`, `IniciativasFilterYear`, `IniciativasFilterAll`, `IniciativasFiltersApply`, `IniciativasFiltersClear`, `IniciativasPage*`, `PalancasFilters`, `SectionCollapse`, `SectionExpand`. |
| R20 | `Usuario.getCurrentUser` | Devuelve `{ Id, Title, EMail }` de `web.currentUser`: el `Id` es el de usuario del sitio, el que usan las columnas de persona. |

## Decisiones investigadas

### Q1. Dónde viven las reglas de estados y avance

Se necesita una sola fuente para la tabla FR-019a, el avance entero, la fecha de finalización y el tope, que reutilicen las specs de riesgos y presupuesto.

- **Elegida**: `Tarea/tareaUtils.ts`, funciones puras de dominio. Los riesgos y el presupuesto cuelgan de la tarea, así que importar desde `Tarea/` es natural, como `Objetivo/` importa de `Iniciativa/`.
- **Descartada**: `src/core/utils`. Ahí va lo transversal (`Constants.ts` lo reserva para constantes verdaderamente compartidas) y cualquier cambio hay que registrarlo en `docs/plantilla-cambios.md`.
- **Descartada**: dentro de cada pantalla. Duplica la tabla de transiciones entre el panel de avance, el detalle y la bandeja.

El color del avance no es una regla nueva: `getAvanceColor` y `formatAvance` ya implementan C-07 y se reutilizan.

### Q2. Áreas involucradas múltiples en la lista `Tarea`

La entidad tiene `Area` con un solo valor y la spec pide varias (FR-003).

- **Elegida**: permitir varios valores en la columna `Area` existente (mismo nombre interno). La entidad lee y escribe una lista, igual que `Iniciativa.Area`. No hay datos que migrar si no hay tareas cargadas (spec, Assumptions).
- **Descartada**: columna nueva `Areas`. Deja dos columnas casi iguales y una sin uso.
- **A confirmar** (P2): que no haya tareas cargadas que dependan del valor único y cómo está configurado el comportamiento de la relación al borrar un área.

### Q3. Columna `RequiereInversion`

RF-12 la define obligatoria; el formulario no la carga ni la muestra (FR-013).

- **Elegida**: la lista la resuelve con valor por defecto "No" (o no obligatoria): lo hace la usuaria (P4). La entidad no la envía, porque un campo `undefined` se omite al guardar y SharePoint aplica el valor por defecto al crear.
- **Descartada**: que el código la envíe en `false`. Es lo que el pedido evita: no se carga desde esta feature, y la spec de presupuesto decidirá su uso.

### Q4. Dónde se guarda el comentario ejecutivo vigente

La spec lo define como una propiedad de la tarea (texto, fecha y autor) que se reemplaza, y al mismo tiempo cada entrada del historial tiene su comentario opcional.

| Opción | Cómo funciona | Evaluación |
|---|---|---|
| A. Columnas en `Tarea` (**elegida**) | `ComentarioEjecutivo`, `ComentarioEjecutivoFecha` y `ComentarioEjecutivoAutor`; cada comentario nuevo se copia también en la entrada del historial. | Un solo acceso para el detalle. Fecha y autor propios, que no cambian con otras ediciones de la tarea. La copia es redundante, pero se escribe en la misma operación, y el vigente siempre puede reconstruirse desde el historial. Costo: 3 columnas nuevas. |
| B. Derivarlo del historial | El vigente es el último `AvanceTarea` con comentario. | Sin columnas nuevas, pero la primera entrada ("Tarea cargada.") también es un comentario y habría que excluirla comparando texto; y obliga a leer el historial en cada detalle. |
| C. Marca en `AvanceTarea` | Columna booleana "es comentario ejecutivo" en el historial. | Una columna, pero acopla el historial (que no se reescribe) con un estado vigente. |

`Modified` y `Editor` de la tarea no sirven para fecha y autor del comentario: cambian con cualquier edición o avance.

### Q5. Orden de guardado del alta (FR-007a)

La tarea se crea antes que su entrada, porque la entrada necesita el Id de la tarea. El deshacer borra la tarea (el único borrado de la feature, interno) y el reintento no la vuelve a crear si el deshacer falló. Es el mismo diseño que el alta de la iniciativa con sus resultados clave (006, D9).

- **Descartada**: crear la entrada primero. No existe tarea a la que asociarla.
- **Descartada**: no deshacer y marcar la tarea como Cancelada si falla la entrada. Deja una tarea Cancelada que nadie pidió y que sigue contando en las listas.

### Q6. Índices y volumen (RNF-04)

Volumen anual estimado: 1.000 tareas y, con unas 5 entradas por tarea, unas 5.000 entradas de historial por año. El umbral de vistas de SharePoint es de 5.000 elementos.

| Lista | Columna | Por qué |
|---|---|---|
| `Tarea` | `Iniciativa` | `getFilteredItems` consulta `IniciativaId eq n` (detalle de la iniciativa y control del tope). |
| `Tarea` | `Responsable` | RNF-04. Es el criterio de "Mis tareas" (en memoria hoy, y consulta posible mañana). |
| `Tarea` | `Objetivo` | RNF-04. Se escribe en el alta con el objetivo de la iniciativa. |
| `Avance tarea` | `Tarea` | `getFilteredItems` consulta `TareaId eq n` y la lista alcanza el umbral en el primer año. Es la más importante. |

No se indexa el año: `Tarea` no tiene columna de año y se calcula en memoria con las fechas del objetivo (P-C5). Las columnas de varias líneas de texto y las de valores múltiples (`Area`) no se pueden indexar, y no hace falta.

### Q7. Tope de 10 tareas y paginado de 10

Dos números iguales con significados distintos (spec, FR-010, FR-034, FR-041a). Cada uno vive en su archivo (`tareaUtils.ts` el tope y `tareaPaginado.ts` el paginado) y ninguno se importa desde el otro. Los conteos se hacen siempre sobre la lista completa y el paginado se aplica al final.

### Q8. Permisos

La spec 007 (FR-045) exige respetar los permisos existentes y no define roles. Hoy se expresan con constantes `CAN_*` por acción de iniciativa; ninguna corresponde a tareas. Se decidió agregar tres constantes (`CAN_CREATE_TAREA`, `CAN_EDIT_TAREA` y `CAN_REGISTER_PROGRESS_TAREA`), como la 004 y la 006, todas en `true` hasta RF-19 (plan, D9 y P-C1).

### Q9. Origen de la fecha de última actualización

- **Alta**: la fecha del alta (`new Date()` del cliente), porque la tarea se crea antes que su entrada.
- **Registrar avance**: el `Created` de la entrada del historial recién creada, para que coincida con el historial.
- **Edición de datos**: no la modifica (FR-024).

Se guarda en una columna de la tarea (`FechaUltimaActualizacion`) y no se deriva del historial: la bandeja necesitaría leer todo el historial (hasta 5.000 elementos por año) solo para mostrar una fecha.

## Textos de localización

Claves nuevas de `loc/mystrings.d.ts` y `loc/en-us.js`. Los textos vienen del prototipo (FR-048) salvo los marcados con (*), que no existen en él y define la spec o el plan.

| Clave | Texto |
|---|---|
| `TareasMine` | Mis tareas |
| `TareasAllTitle` | Todas las tareas |
| `TareasTabAll` | Todas |
| `TareasTabsAriaLabel` | Tareas a mostrar |
| `TareasStateTabsAriaLabel` | Estado de la tarea |
| `TareasStateNotStarted` / `TareasStateInProgress` / `TareasStateStopped` / `TareasStateFinished` / `TareasStateCancelled` | No iniciadas / En curso / Frenadas / Finalizadas / Canceladas |
| `TareasSearchPlaceholder` | Buscar ID o tarea |
| `TareasCount` | {0} tareas en esta vista |
| `TareasEmpty` | No hay tareas cargadas. |
| `TareasEmptyFilters` | No hay tareas con estos filtros. |
| `TareasEmptyState` (*) | No hay tareas en este estado. |
| `TareasLoadError` | No se pudieron cargar las tareas. |
| `TareasRetry` (*) | Reintentar |
| `TareaNew` | Cargar tarea |
| `TareaColumnName` | Tarea |
| `TareaColumnResponsible` | Responsable |
| `TareaColumnCommitment` | Compromiso |
| `TareaColumnUpdated` | Actualizada |
| `TareaViewTooltip` / `TareaViewAriaLabel` | Ver tarea / Abrir tarea {0} |
| `TareaFormEditTitle` | Editar tarea {0} |
| `TareaFormName` / `TareaFormNamePlaceholder` | Nombre de la tarea / Ej. Firma de contrato |
| `TareaFormDescriptionPlaceholder` | Qué se hace en esta tarea |
| `TareaEnables` / `TareaEnablesPlaceholder` | ¿Qué habilita? / Qué destraba o permite esta tarea |
| `TareaPriority` / `TareaNoPriority` | Prioridad / Sin prioridad |
| `TareaConfirmCreate` | Estás por cargar la tarea y asignarla a {0}. ¿Querés continuar? |
| `TareaConfirmEdit` | Estás por guardar los cambios de la tarea. ¿Querés continuar? |
| `TareaCreated` | La tarea "{0}" se ha cargado correctamente. |
| `TareaUpdated` | La tarea "{0}" se ha actualizado correctamente. |
| `TareaSaveError` | No se pudo guardar la tarea. |
| `TareaLimitReached` (*) | La iniciativa ya tiene {0} tareas no canceladas (máximo {0}). (el prototipo dice "activas") |
| `TareaDateOutOfRange` | La fecha debe estar entre el {0} y el {1}, las fechas de la iniciativa. (*) Sigue el texto implementado de la 004; el del prototipo es "Las fechas deben quedar dentro de las de la iniciativa ({0} a {1})." |
| `TareaNameTooLong` / `TareaCommentTooLong` (*) | El nombre no puede superar {0} caracteres. / El comentario no puede superar {0} caracteres. |
| `TareaDescription` | Descripción |
| `TareaFinishDate` | Fecha de finalización |
| `TareaInfoSection` | Información de la tarea |
| `TareaNotFound` / `TareaLoadError` | No se encontró la tarea. / No se pudo cargar la tarea. |
| `TareaRegisterProgress` | Registrar avance |
| `TareaHistory` | Historial de avance |
| `TareaHistoryClose` | Cerrar |
| `TareaHistoryEmpty` (*) | Esta tarea todavía no tiene avances registrados. |
| `TareaHistoryVerb` | Actualizó la tarea |
| `TareaHistorySubject` | {0} · {1} % |
| `TareaHistoryLoadError` (*) | No se pudo cargar el historial de avance. |
| `TareaFirstEntryComment` | Tarea cargada. (es el comentario que se guarda en la primera entrada) |
| `TareaProgressField` | Avance (%) |
| `TareaProgressInvalid` (*) | Ingresá un número entero entre 0 y 100. |
| `TareaFinishDateBeforeStart` (*) | La fecha de finalización no puede ser anterior al inicio de la tarea. |
| `TareaFinishDateFuture` (*) | La fecha de finalización no puede ser futura. |
| `TareaCommentPlaceholder` | Situación de la tarea en tus palabras |
| `TareaConfirmFinishTitle` / `TareaConfirmFinish` | Finalizar tarea / Estás por finalizar la tarea {0}. El avance pasa a 100 %. Podés reabrirla más adelante. ¿Querés continuar? |
| `TareaConfirmCancelTitle` / `TareaConfirmCancel` (*) | Cancelar tarea / Estás por cancelar la tarea {0}. Deja de contar en la iniciativa. ¿Querés continuar? (el prototipo agrega "y en su presupuesto", fuera de alcance) |
| `TareaProgressUpdated` | El avance de la tarea "{0}" se ha actualizado correctamente. |
| `TareaProgressSaveError` | No se pudo registrar el avance de la tarea. |
| `TareaIndicatorsSection` | Indicadores de las tareas |
| `TareaSection` (*) | Tareas ({0} de {1} no canceladas) |
| `TareaSectionEmpty` | Esta iniciativa todavía no tiene tareas. |

Se reutilizan sin duplicar: `Cancel`, `Accept`, `SaveChanges`, `Edit`, `RequiredField`, `ObjetivoNoValue`, `ObjetivoDateOrder`, `ObjetivoDetailProgress`, `IniciativaColumnName` (Iniciativa), `IniciativaAreas` (Áreas involucradas), `IniciativaCommentSection` (Comentario ejecutivo), `IniciativaCommentEmpty`, `IniciativaCommentMeta`, `ObjetivoFieldStartDate`, `ObjetivoFieldCommitmentDate`, `ObjetivoFormStartDate`, `ObjetivoFormCommitmentDate`, `ObjetivoFormStatus`, `ObjetivoFieldDepartment`, `ObjetivoColumnName` (Objetivo), `ObjetivoColumnId`, `ObjetivoColumnProgress`, `ObjetivoColumnStatus`, `ObjetivoColumnView`, `IniciativasFilter*`, `IniciativasFilters*` y `IniciativasPage*`. `TareaColumnResponsible` sirve también como rótulo del campo y del filtro.

## Aproximaciones y decisiones de diseño

- Subsolapas de estado: `Tabs` `subtle` `small` (A1).
- Indicadores: `Field` en grilla (A2).
- Campo Iniciativa sin buscador (A4, P-C3).
- Historial con `ActivityItems` (A5).
- Paginador de la sección Tareas no fijo (P-C2).
- Permisos (P-C1).
