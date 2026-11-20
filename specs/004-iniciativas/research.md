# Research: Iniciativas

Resuelve las consultas del plan contra el repo, el prototipo v10 y las respuestas de la usuaria. No quedan pendientes abiertos.

## Verificaciones en el repo

| # | Consulta | Resultado |
|---|----------|-----------|
| R1 | Datos existentes | `core/entities` y `core/api` ya tienen `Iniciativa`, `ComentarioIniciativa`, `Area` y `Usuario`, con datasource, interfaz y los dos hooks (`use<E>DataSource`, `useItem<E>DataSource`), generados con la skill `data-source`. Ninguno tiene mock. |
| R2 | `Iniciativa` | Lee y escribe `Nombre`, `Descripcion`, `Objetivo` (lookup), `Responsables` (personas, varias), `Peso`, `Estado`, `FechaInicio`, `FechaCompromiso` y `Area` (lookup **de un valor**). `toListItem` no envía `Title`. |
| R3 | `EstadoIniciativa` | `Constants.EstadoIniciativa` = No iniciada · En curso · Frenada · Finalizada · Cancelada. Coincide con FR-006. |
| R4 | Columna `Area` | La usuaria confirmó el 2026-11-18 que ya admite varios valores y conserva el nombre interno `Area`. La entidad todavía la mapea como un solo valor (`toLookupValue`, `AreaId: this.Area?.Id`). |
| R5 | `ComentarioIniciativa` | `Iniciativa` (lookup) y `Comentario`. `Created` y `Author` vienen en el `select`: son la fecha y el autor que muestra el detalle (spec, Assumptions). No envía `Title`. |
| R6 | `Usuario` | Lista `Usuario` con `Usuario` (persona), `Departamento`, `Gerencia`, `Area`, `Activo` y `Rol`. `Usuario.Id` (de la persona) es el Id de usuario del sitio, el mismo que guarda `Responsables`. |
| R7 | Usuario actual | No hay en el código ningún acceso al usuario actual. `pnpjs-presets.ts` ya importa `@pnp/sp/site-users/web`, que habilita `sp.web.currentUser()`. |
| R8 | Hook genérico | `useDatasource` devuelve `[state, getItems, addItem, editItem, deleteItem, getById]` y elige el mock fuera de SharePoint. `IIniciativaDataSource.getFilteredItems` existe pero el hook no lo expone. |
| R9 | Mappers | `toLookupValueArray` y `toPersonIds` existen. No hay helper para escribir los Id de un lookup múltiple. |
| R10 | Rutas | `routes.ts` tiene `HOME_PATH`, `PALANCAS_PATH`, `PALANCA_DETAIL_PATH` y `OBJETIVO_DETAIL_PATH`. No hay rutas de iniciativas. El acceso "Mis iniciativas" de la home no tiene `route`. |
| R11 | Detalle del objetivo | `ObjetivoDetalle` muestra migas, encabezado, `ObjetivoInfo` (secciones "Información del objetivo" y "Planificación") y el pie Cancelar · Editar. No tiene sección de iniciativas. |
| R12 | Migas | `PalancaBreadcrumb` recibe `palancaNombre`, `palancaId` y `objetivoNombre`. El objetivo es siempre el último nivel, sin enlace. |
| R13 | Secciones | `SectionBand` (`shared/`) tiene título, `action` y `collapsible`, y arranca siempre expandida (`useState(true)`). |
| R14 | Panel de formulario | `ObjetivoFormPanel` + `ObjetivoFormBody`: `Panel` del DS de 480 px, campos en una columna, errores en línea al intentar guardar, fechas con `Picker` y el error en un `span` (aproximación A2 de la 003). Los formularios actuales **no** piden confirmación. |
| R15 | Mensaje de éxito | `SuccessNotice` (`shared/`), `MessageBar` de éxito que se cierra solo. |
| R16 | Tablas | `ObjetivosTable` usa `Table` del DS, `Chip` para el estado y un botón `iconOnly` con `chevronCirclePrimary` para "Ver". El peso de tabla se muestra `${n}%` y el del detalle `${n} %` (H6 de la 005). |
| R17 | Búsqueda y solapas | `Palancas` usa `SearchBox` en el encabezado y `Tabs` (`variant="transparent"`) con la cantidad entre paréntesis. El botón "Filtros" de palancas no abre nada. |
| R18 | Estado compartido entre pantallas | El filtro de palancas vive en `ObjetivosVpRoutes` y baja por props (D4 de la 003). |
| R19 | Localización | Un solo archivo de idioma, `loc/en-us.js`, más `loc/mystrings.d.ts`. `AccessMyInitiatives` = "Mis iniciativas" ya existe. |

## Verificaciones en el Design System

| # | Consulta | Resultado |
|---|----------|-----------|
| R20 | Selector de personas | `Picker` (`core/ui/patterns`) tiene `mode="people"`: un `NormalPeoplePicker` de Fluent que busca **sobre la lista `people` que recibe**, con `selectedPeople` y `onSelectedPeopleChange`. No tiene `errorMessage`. Sirve para Accountable con los usuarios de la lista `Usuario` sin salir del DS. |
| R21 | Selección múltiple | `Dropdown` admite `multiple`, `value: string[]` y `errorMessage`. |
| R22 | Confirmación | `Modal` (`core/ui/patterns`) con `title`, `description`, `primaryAction` y `secondaryAction`. Si no se pasan acciones, pone botones propios en inglés: hay que pasar siempre las dos. |
| R23 | Paginado | No hay paginador en `core/ui`. `FigmaIcon` tiene `chevronRight` y `chevronRightPrimary`, pero no flecha izquierda ni doble flecha. |
| R24 | Panel de filtros | `Filters` es una barra horizontal con título y ayuda fijos y botones de ícono; no es un panel lateral. `TableFilters` tampoco. El panel lateral se arma con `Panel`, `Dropdown` y `Button`. |
| R25 | Chips | `ChipColor` = neutral · brand · secondary · success · warning · danger. No hay violeta (el prototipo usa violeta para Cancelada). |

## Prototipo v10 (`docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`)

| # | Pantalla | Lo que se toma |
|---|---|---|
| R26 | `scr.iniciativas` | Encabezado (Volver, título, búsqueda "Buscar ID o iniciativa", Filtros, "Cargar iniciativa"), contador `lCount` "N iniciativas en esta vista", solapas `uTabs` con cantidad, grilla `c-ib` y paginador `pager` fijo al pie (información a la izquierda, botones centrados). La columna Avance y el botón Actualizar quedan fuera (spec, FR-016 y FR-018). |
| R27 | Panel de filtros (`showFilters`) | Panel lateral "Filtros" con Departamento, Objetivo, Responsable, Estado y Año, cada uno con una opción "Todos/Todas", y el pie Limpiar · Aplicar. |
| R28 | `sideIni` | Panel lateral de cargar/editar iniciativa: Objetivo (deshabilitado al editar), Nombre ("Ej. Promo vaso coleccionable"), Descripción / impacto esperado ("Qué se va a hacer y qué se espera lograr"), Accountable, Áreas involucradas, fechas lado a lado y Estado solo al editar. Se excluyen el subtítulo `iniSub` y la sección de peso (spec, FR-039 y RF-08). |
| R29 | `scr.iniciativa` | Migas, encabezado (Volver, "ID · nombre", chip), "Información de la iniciativa" (grilla de 4 con Objetivo, Accountable, Áreas involucradas, Estado, Fecha de inicio, Fecha de compromiso, Peso en el objetivo, Peso en el departamento y, debajo, Descripción / impacto esperado), "Comentario ejecutivo" (fecha, autor, texto) y el pie Cancelar · Editar · Cambiar estado. Se excluyen avance, "Ubicación en la estrategia", resultados clave, tareas, indicadores, presupuesto y riesgos (FR-034). |
| R30 | `m.is.iniUpd` | Estado y Comentario ejecutivo ("Situación de la iniciativa en tus palabras"), título "Cambiar estado de la iniciativa", subtítulo "ID · nombre", botón "Cambiar estado". En el prototipo es un modal; la spec lo pide en panel lateral (FR-028). |
| R31 | `scr.objetivo`, sección `o_inis` | Banda "Iniciativas" con "+" ("Agregar iniciativa") y grilla `c-oiP` (con Peso) o `c-oi` (sin Peso). |
| R32 | Confirmaciones | Títulos "Cargar iniciativa", "Guardar cambios" y "Cambiar estado"; textos según FR-025 y FR-029. |
| R33 | Formato | ID `INI-01`. Estados: No iniciada gris, En curso azul, Frenada rojo, Finalizada verde, Cancelada violeta. |

## Respuestas de la usuaria (2026-11-18)

| # | Consulta | Respuesta |
|---|---|---|
| U1 | Personas que ofrece Accountable | Los usuarios activos de la lista `Usuario`, sin salir del DS. Por defecto, la persona actual; si no está en la lista, se agrega igual como opción. |
| U2 | Paginado | Armado con botones del DS, **con** primera y última página (dos chevrons juntos). |
| U3 | Opciones del filtro Año | Los años de las iniciativas cargadas: desde el año de la fecha de inicio más antigua hasta el de la fecha de compromiso más lejana, sin huecos. |
| U4 | Columna `Area` | Ya es de valores múltiples, con el nombre interno `Area`. |
| U5 | Mensaje al cambiar el estado | «El estado de la iniciativa "[nombre]" se ha actualizado correctamente.», como el prototipo (verificado en el v10, `notify` de `iniUpd`). |
| U6 | Título de la sección del detalle del objetivo | "Iniciativas (N)", con N = todas las iniciativas del objetivo, incluidas las canceladas (verificado en el v10: `Iniciativas ({{od.nIni}})`, `nIni = C.inisOf(o.id).length`). |
| U7 | Identificación del usuario actual | Por un identificador único, no por el nombre que se muestra. Se usa el Id de usuario del sitio (plan, D5a). |
| U8 | Comentarios | Traer solo los de la iniciativa, filtrando en la consulta, con la columna `Iniciativa` indexada (plan, D24 y P1). |

Versión del prototipo: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/LEEME.md` dice «Prototipo navegable · v10» y marca la v10 (16/11/2026) como "(esta)". Todas las referencias de este plan son a esa versión.

Nota sobre U1: al preguntar se describió el campo como un `Dropdown` múltiple. Al revisar el catálogo apareció `Picker` con `mode="people"`, que también es del DS, busca sobre una lista dada y muestra las personas elegidas como chips, igual que el prototipo. El plan usa `Picker` (D7) con la misma fuente de datos que se aprobó.

## Decisiones

Las decisiones D1 a D24 están en [plan.md](./plan.md#decisiones). Alternativas evaluadas:

| Tema | Elegido | Descartado |
|---|---|---|
| Usuario actual | Método `getCurrentUser` en el datasource de `Usuario` y hook `useCurrentUser` | Pasar el `pageContext` del webpart por props: lo tendría que atravesar todo el árbol y no tiene mock. |
| Comentarios de una iniciativa | `getFilteredItems(iniciativaId)` en el datasource y un hook propio (U8) | `getItems` y filtrar en pantalla: trae comentarios de todas las iniciativas, crece sin límite y supera el umbral de 5000 elementos. |
| Detalle de la iniciativa | `getItems` de iniciativas y buscar la del Id | `getById` más `getItems`: dos consultas, y el peso necesita igual todas las del objetivo. |
| Orden de escritura en "Cambiar estado" | Primero el comentario, después el estado | Primero el estado: si falla el comentario, reintentar es seguro, pero si falla el estado tras guardar el comentario, el reintento lo duplica salvo que se compare con el último. Con el comentario primero, el reintento lo compara con el último y no lo repite (D16). |
| Estilos del panel de iniciativa | Archivo `.module.scss` propio | Extraer los de `ObjetivoForm` a `shared/`: modifica código de la 003 y la 005 sin necesidad funcional (Complexity Tracking). |
