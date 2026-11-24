# Implementation Plan: Tareas (alta, edición, seguimiento de avance, bandeja y sección en la iniciativa)

**Branch**: `007-tareas` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-tareas/spec.md`. Continúa la [004-iniciativas](../004-iniciativas/plan.md) y la [006-resultados-clave](../006-resultados-clave/plan.md), que dejaron fuera las tareas, y reutiliza sus patrones de bandeja, panel lateral, detalle con secciones y guardado conjunto.

## Summary

Sumar al webpart `objetivosVp` las tareas de las iniciativas: la bandeja "Mis tareas" / "Todas" (con subsolapas por estado, búsqueda, filtros y paginado), el panel lateral "Cargar tarea" / "Editar tarea", el detalle de la tarea (información, comentario ejecutivo, historial de avance), el panel "Registrar avance" y, en el detalle de la iniciativa, las secciones "Indicadores de las tareas" y "Tareas (N de 10 no canceladas)" con "Cargar tarea" en el pie fijo. El acceso "Mis tareas" de la home deja de estar sin ruta.

Enfoque técnico:

- **Datos**: ya existen las entidades, los datasources y los hooks de `Tarea` y `AvanceTarea`, pero sin mock y sin varias columnas que pide la spec. Se agregan los dos mocks (principio III), un hook filtrado por iniciativa y otro por tarea, y se amplía la entidad `Tarea` (áreas múltiples, "¿Qué habilita?", comentario ejecutivo con fecha y autor, fecha de última actualización). Las columnas nuevas de SharePoint las crea la usuaria (ver "Preparativos a cargo de la usuaria"); el código no crea ni modifica listas.
- **Reglas de dominio**: funciones puras en `Tarea/tareaUtils.ts` (estados y transiciones de FR-019a, avance entero, fecha de finalización, tope de 10 tareas no canceladas, nombres, chips). Sin acceso a datos ni a pantallas, para que las specs de riesgos y presupuesto las importen. El paginado de 10 por página vive aparte, en `Tarea/tareaPaginado.ts`: son dos reglas distintas.
- **Guardado**: el alta guarda la tarea y después su primera entrada de historial; si falla la entrada, se deshace la tarea, y un reintento retoma solo lo pendiente (igual que el alta de la 006). "Registrar avance" guarda primero la entrada del historial y después la tarea, como "Cambiar estado" de la 004. SharePoint no ofrece transacciones.
- **Comentario ejecutivo**: el vigente se guarda en la propia tarea (texto, fecha y autor); cada comentario nuevo se copia también en la entrada del historial. El historial no se reescribe.
- **Pantallas**: dos rutas nuevas (`/tarea` y `/tarea/:id`). El detalle de la tarea se compone de secciones independientes. La bandeja reutiliza `IniciativasHeader` e `IniciativasPaginador` con propiedades opcionales nuevas.
- **Componentes**: todo con piezas del Design System. Dos piezas sin correspondencia exacta (tarjeta de indicador y buscador del campo Iniciativa) se resuelven con aproximaciones a confirmar (A2 y A4).
- **Permisos**: tres constantes `CAN_*` para tareas (`CAN_CREATE_TAREA`, `CAN_EDIT_TAREA` y `CAN_REGISTER_PROGRESS_TAREA`), como la 004 y la 006, todas en `true` hasta RF-19. No definen roles (FR-045). Ver D9.

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, con la configuración heredada de `@microsoft/spfx-web-build-rig`, igual que las features anteriores.

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`, Fluent UI v8 (`@fluentui/react ^8.106.4`), PnPjs `@pnp/sp 4.18.0`, `react-router-dom 6.30.6` (`HashRouter`). Esta feature no agrega dependencias.

**Storage**: listas de SharePoint `Tarea` y `Avance tarea` (`Lista.Tarea` y `Lista.AvanceTarea` en `src/core/utils/Constants.ts`), que ya existen, más `Iniciativa`, `Objetivo`, `Area` y `Usuario`. Faltan columnas en `Tarea` y hay que indexar columnas de las dos listas: lo hace la usuaria (P1 a P8, más abajo). El código no crea ni modifica listas.

**Testing**: no hay runner de pruebas. Validación: `npm run build` (principio V), escenarios de [quickstart.md](./quickstart.md) con mocks y en el workbench hospedado del sitio de desarrollo, y comparación visual con el prototipo. Se escribe solo en las listas de desarrollo y con autorización explícita.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft, según los scripts de `package.json`).

**Performance Goals**: bandeja y detalles en menos de 3 s con el volumen de un año (RNF-04: hasta 1.000 tareas y 150 iniciativas; RNF-05). La bandeja hace 7 consultas (tareas, iniciativas, objetivos, departamentos y, por `useObjetivoNames`, VP, departamentos y gerencias); el detalle de la iniciativa suma 1 consulta filtrada (tareas de la iniciativa); el detalle de la tarea hace 5 (tarea, iniciativa, objetivo, nombres de objetivo y áreas); el historial se trae solo al abrir el panel. Búsqueda, filtros, subsolapas, conteos y paginado son en memoria.

**Constraints**: `src/core/ui` de solo lectura; sin colores, tipografías ni espaciados fuera del DS; textos en español (AR) en `loc/`; sin acción de eliminar una tarea ni de editar o borrar una entrada del historial (FR-012, FR-025); sin presupuesto, riesgos, alertas, roles ni filtro por departamento del usuario; no se crean ni modifican listas ni columnas desde el código.

**Scale/Scope**: 2 rutas nuevas; 6 pantallas o paneles nuevos (bandeja, panel de alta y edición, detalle de la tarea, "Registrar avance", "Historial de avance", sección de la iniciativa) y 2 secciones del detalle de la iniciativa; 2 archivos de dominio; 2 mocks, 2 hooks de lectura filtrada (4 archivos nuevos en `core`) y 6 archivos de `core` modificados; 4 piezas existentes del webparts ampliadas (ver "Estructura de carpetas").

## Hallazgos del repo

Detalle en [research.md](./research.md).

| # | Hallazgo | Consecuencia |
|---|---|---|
| H1 | `Tarea` y `AvanceTarea` tienen entidad, datasource, interfaz (con `getFilteredItems`) y hooks, pero ni mocks ni hooks que pasen un mock (R1). | Dos mocks nuevos y los cuatro hooks existentes pasan su mock (D1). |
| H2 | `Tarea.toListItem` llama a `assertChoiceValue` con `Estado` y `Prioridad`: con un objeto parcial o sin prioridad lanza una excepción, y no envía `Title` (R2). | `toListItem` pasa a omitir lo no definido, a vaciar `Prioridad` con `null` y a enviar `Title = Nombre` (D2). |
| H3 | La entidad tiene una sola `Area` y no conoce "¿Qué habilita?", el comentario ejecutivo ni la fecha de última actualización (R3). | Entidad ampliada y cinco columnas nuevas más un cambio de `Area` en SharePoint (D2, D3). |
| H4 | `useDatasource.deleteItem` ya relanza el error (cambio de la 006) (R4). | Se usa para deshacer un alta fallida sin tocar `useDatasource` (D4). |
| H5 | No hay hook de lectura filtrada para tareas ni para entradas de avance; el patrón es `useComentariosIniciativa` (R5). | `useTareasIniciativa` y `useAvancesTarea` (D1). |
| H6 | El acceso "Mis tareas" de `AccessList` no tiene `route` (R6). | Se conecta a la nueva ruta `/tarea` (D9). |
| H7 | El estado de la bandeja de iniciativas (búsqueda, filtros, página) se sube a `ObjetivosVpRoutes` y la solapa va en el parámetro `vista` (R7). | La bandeja de tareas hace lo mismo y suma la subsolapa de estado (D10). |
| H8 | `IniciativasPaginador` y `DetailFooter` son los dos `position: fixed; bottom: 0; z-index: 12` (R8). | Resuelto en D13: el paginador de la sección Tareas va al final de la sección (FR-041a). |
| H9 | `IniciativasHeader` trae fijos el texto del buscador y el del botón "Cargar iniciativa" (R9). | Dos props opcionales nuevas (D10). |
| H10 | El `Dropdown` del DS no tiene buscador (R10). | Aproximación A4 (decisión P-C3). |
| H11 | `IniciativaFormPanel` resuelve el guardado conjunto y el reintento con `useRef` (R11). | Mismo mecanismo para el alta de la tarea (D4). |
| H12 | `resultadoClaveUtils.ts` ya tiene `getAvanceColor` (C-07) y `formatAvance`, y `AvanceText` los usa (R12). | El avance de la tarea reutiliza `AvanceText`; no se escribe otra lógica de color (D6). |
| H13 | `Tarea` ya lee `RequiereInversion`; `Riesgo` y `PresupuestoTarea` tienen entidad y datasource (R13). | No se tocan. `RequiereInversion` no se envía ni se muestra (D3). |
| H14 | `AvanceTarea` guarda `Title` vacío (como `ComentarioIniciativa`); fecha y autor salen de `Created` y `Author` (R14). | Verificación P6; sin columnas nuevas en esa lista. |
| H15 | El detalle de la iniciativa implementado ordena Información, Resultados clave y Comentario ejecutivo; el prototipo ordena Información, Comentario, Resultados clave, Indicadores y Tareas (R15). | Indicadores y Tareas se agregan al final, después del comentario (D13). |

## Constitution Check

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | Mismo stack y versiones; sin dependencias nuevas. |
| II. La interfaz no se inventa | ✅ Cumple, con los desvíos que aprobó la spec | Pantallas tomadas del prototipo v11 (`docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`): `scr.tareas` (bandeja), `scr.tarea` (detalle), `sideTar` (panel de alta y edición), `m.is.tarUpd` (Registrar avance), `histOpen` (historial) y `i_ind` / `i_tar` de `scr.iniciativa`. Desvíos aprobados en la spec: sin presupuesto ni riesgos, Áreas involucradas múltiples, Descripción y ¿Qué habilita? separados, comentario ejecutivo propio, historial desde el pie del detalle, sin "Ubicación en la estrategia", sin botón "Actualizar" ni contador de la home. Aproximaciones del DS: A1 a A6. |
| II. `core/ui` de solo lectura | ✅ Cumple | No se modifica el DS; no hay nada que anotar en `docs/design-system-cambios.md`. |
| II. Estructura de pantalla | ✅ Cumple | Carpeta `Tarea/` con una subcarpeta por pantalla o pieza (`.tsx` y `.module.scss` cuando hace falta). Las secciones de la iniciativa van en `Iniciativa/IniciativaDetalle/`. |
| II. Textos en español (AR) | ✅ Cumple | Claves nuevas `Tarea*` en `loc/mystrings.d.ts` y `loc/en-us.js` (D11), reutilizando las existentes (Cancelar, Guardar cambios, Aceptar, Campo obligatorio, "—", paginado). |
| III. Datos desacoplados | ✅ Cumple | Las pantallas usan solo hooks de `core/api`. Dos mocks nuevos. Tipos en `core/entities`. |
| IV. Simplicidad y cambios acotados | ✅ Cumple, con cambios justificados | En `core`: `Tarea.ts`, `TareaDataSource.ts`, y los cuatro hooks de `Tarea` y `AvanceTarea` (se registran en `docs/plantilla-cambios.md`). En el webparts: ver Complexity Tracking. |
| V. Validación | ✅ Cumple | Cada tarea cierra con `npm run build`. |

**Re-check post-diseño**: sin cambios. Los cinco puntos que estaban a confirmar (P-C1 a P-C5) quedaron resueltos: ver "Decisiones tomadas tras el análisis".

## Interfaz y Design System

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (prototipo v11):

- bandeja: `scr.tareas` (`c-tb`), con `uTabs` y `sTabs`;
- detalle: `scr.tarea` (`t_info`, `t_com`), con pie de `acts`;
- panel de alta y edición: `sideTar` (el panel lateral, no el formulario de página);
- Registrar avance: `m.is.tarUpd` (modal en el prototipo; en esta feature, panel lateral, como "Cambiar estado" de la 004);
- historial: panel `histOpen`;
- iniciativa: `i_ind` e `i_tar` de `scr.iniciativa` (`c-ti2`).

**Design System**: `src/core/ui`, según `docs/design-system-catalog.md`.

**Estructura de la pantalla**: ver "Estructura de carpetas".

### Mapeo elemento → componente

**Bandeja (`TareasBandeja`, `scr.tareas`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Encabezado: Volver, título, búsqueda, Filtros, "Cargar tarea" | `IniciativasHeader` (ampliado con `searchPlaceholder` y `newLabel`) | Mismas piezas que la bandeja de iniciativas: `BackButton`, `SearchBox`, `Button`. Sin botón "Actualizar" (FR-028). |
| Contador "N tareas en esta vista" | `<p>` con estilo de `SUMMARY_STYLE` de la bandeja de iniciativas | Mismos tokens de tipografía y color. |
| Solapas Mis tareas / Todas | `Tabs` `variant="transparent"` | Igual que la bandeja de iniciativas; el valor va en el parámetro `vista`. |
| Subsolapas de estado | `Tabs` `variant="subtle"` `size="small"` | Aproximación A1. |
| Grilla | `Table` del DS | Columnas ID, Tarea, Iniciativa (ID · nombre), Responsable, Compromiso, Actualizada, Avance, Estado, Ver. Avance con `AvanceText`; Estado con `Chip` `size="small"`; Ver con `Button` `iconOnly` + `FigmaIcon` `chevronCirclePrimary` + `Tooltip`, como `IniciativasTable`. |
| Vacío | `emptyText` de `Table` | Tres textos de una línea (FR-035). |
| Paginado | `IniciativasPaginador` | Sin cambios; solo se muestra con más de 10 tareas en la subsolapa. |
| Panel de filtros | `Panel` + 5 `Dropdown` + `Button` x2 | Departamento, Objetivo, Iniciativa, Responsable y Año; "Limpiar filtros" · "Aplicar". Sin Estado (lo cubren las subsolapas). |
| Carga y error | `Spinner` y `MessageBar` `type="error"` | Error con opción de reintentar (FR-049, D12). |

**Panel de alta y edición (`TareaFormPanel`, `sideTar`)**, panel de 480 px de la 004, en una columna:

| Elemento | Componente | Observaciones |
|---|---|---|
| Panel | `Panel` | Título "Cargar tarea" o "Editar tarea TAR-nn" con el objetivo como subtítulo (`buildPanelTitle`). Pie: Cancelar `secondary` · "Cargar tarea" / "Guardar cambios" `primary`. |
| Iniciativa | `Dropdown` `required` | Opciones: iniciativas no Finalizadas ni Canceladas, "INI-nn · nombre". Deshabilitado desde el detalle de la iniciativa y en la edición. Aproximación A4. |
| Objetivo | `Input` `disabled` | "OBJ-nn · nombre" de la iniciativa elegida, en modo lectura. |
| Nombre de la tarea | `Input` `required` | Hasta 100 caracteres, placeholder "Ej. Firma de contrato". |
| Responsable | `Picker` `mode="people"` | Una persona activa; `onSelectedPeopleChange` conserva la última, como el Accountable de la 004. |
| Descripción | `Multiline` `required` | Placeholder "Qué se hace en esta tarea". |
| ¿Qué habilita? | `Multiline` `required` | Placeholder "Qué destraba o permite esta tarea". |
| Áreas involucradas | `Dropdown` `multiple` `required` | Mismas áreas que la iniciativa; al menos una. |
| Prioridad | `Dropdown` | "Sin prioridad" · Alta · Media · Baja. |
| Fecha de inicio, Fecha de compromiso | `Picker` `mode="date"` x2, lado a lado | Errores de rango y de orden en el campo, como la 004. |
| Confirmación | `ConfirmacionModal` | Textos de FR-016. |
| Error al guardar | `MessageBar` `type="error"` | Una línea; el panel conserva lo ingresado. |

**Detalle de la tarea (`TareaDetalle`, `scr.tarea`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Migas | `PalancaBreadcrumb` (+ nivel Tarea) | Inicio › Palancas › palanca › objetivo › iniciativa › tarea; para otra VP omite la palanca (FR-037). Ver D8 por el nivel nuevo. |
| Encabezado | `BackButton`, `h1` con `HEADER_TITLE_STYLE`, `HeaderChip`, "Avance: X %" con `AvanceText spaced` | Igual que el detalle de la iniciativa. |
| Información de la tarea | `SectionBand` `collapsible` + `Field` en grilla + `Button` `iconOnly` `editPrimary` | Expandida al entrar. Sin el lápiz en una tarea Cancelada (FR-037a). |
| Comentario ejecutivo | `SectionBand` `collapsible` `defaultCollapsed` + `Field` + lápiz | Texto, fecha y autor (`IniciativaCommentMeta`). Contraída al entrar. |
| Pie fijo | `DetailFooter` + `Button` | Cancelar `secondary` · Editar `primary` · Registrar avance `primary` · Historial de avance `secondary`. Editar y Registrar avance no se ofrecen en una Cancelada. |

**Panel "Registrar avance" (`TareaAvancePanel`, `m.is.tarUpd`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Panel | `Panel` | Título "Registrar avance", subtítulo "TAR-nn · nombre". Pie: Cancelar · Aceptar. |
| Estado y Avance (%) | `Dropdown` y `Input` `type="number"`, lado a lado | Estados según FR-019a; en una Finalizada solo En curso. Avance deshabilitado con Finalizada (100). |
| Fecha de finalización | `Picker` `mode="date"` | Solo con Finalizada; obligatoria. |
| Comentario ejecutivo | `Multiline` | Hasta 500 caracteres, precargado con el último; sin línea de fecha y autor (esa información está en el detalle). |
| Confirmación | `ConfirmacionModal` | Solo al entrar en Finalizada o Cancelada (FR-023). |

**Panel "Historial de avance" (`TareaHistorialPanel`, `histOpen`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Panel | `Panel` | Título "Historial de avance", subtítulo "TAR-nn · nombre". Pie: Cerrar. |
| Entradas | `ActivityItems` (`patterns/`), variante `comment` | Una `IActivityItem` por entrada: `author` = autor, `verb` = "Actualizó la tarea", `subject` = "estado · avance %", `description` = comentario (vacío = sin esa línea) y `time` = fecha dd/mm/aaaa. Aproximación A5. |
| Vacío | texto de una línea | Defensa (FR-039). |

**Sección de la iniciativa (`IniciativaTareasIndicadores`, `IniciativaTareas`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Sección "Indicadores de las tareas" | `SectionBand` `collapsible` + `Field` en grilla de 5 | Un `Field` por estado, en el orden de FR-042. Aproximación A2. |
| Sección "Tareas (N de 10 no canceladas)" | `SectionBand` `collapsible` + `Table` | Columnas ID, Tarea, Responsable, Compromiso, Avance, Estado, Ver (variante `iniciativa` de `TareasTable`). |
| Paginado de la sección | `IniciativasPaginador` con `inline` | Ver D13. |
| "Cargar tarea" | `Button` en `DetailFooter` | Deshabilitado según FR-043. |

### Elementos sin componente en el Design System

- **Tarjeta de indicador** (número grande con rótulo): el DS no la tiene. Se usa `Field` en una grilla (A2).
- **Dropdown con buscador**: no existe en el DS. Se usa `Dropdown` sin buscador (A4).

**Imágenes e íconos**: `FigmaIcon` `chevronCirclePrimary`, `editPrimary` (en el registro del DS). No hay imágenes nuevas.

### Aproximaciones (a confirmar en la revisión visual)

| # | Elemento | Resolución | Motivo |
|---|---|---|---|
| A1 | Subsolapas de estado | `Tabs` `subtle` `small` | El prototipo usa pastillas (`sTab`); el DS no tiene una variante idéntica. |
| A2 | Indicadores de las tareas | `Field` en grilla de 5 columnas, sin tarjeta | No hay componente de indicador. |
| A3 | Color del botón "Cargar tarea" del pie de la iniciativa | Tertiary 900, como "Cargar iniciativa" de la bandeja | El prototipo usa la clase `fbTer`; se toma el token equivalente del DS. |
| A4 | Campo Iniciativa "con buscador integrado" (RF-12) | `Dropdown` sin buscador, igual que el Objetivo en la 004 | El DS no tiene un `Dropdown` con buscador. Decisión P-C3: diferencia con RF-12. |
| A5 | Entradas del historial | `ActivityItems` con el estado y el avance en `subject` | El prototipo muestra "fecha · estado · avance" como título y el autor debajo; `ActivityItems` no tiene campos para estado ni avance. A confirmar en la revisión visual; si no se ve bien, hay que consultar antes de crear un componente. |
| A6 | Estado "Sin prioridad" | Opción vacía en el `Dropdown` | El prototipo usa un `select` con "Sin prioridad". |

## Decisiones

**D1. Capa de datos, mocks y hooks.** Se usan `useTareaDataSource`, `useAvanceTareaDataSource`, `useIniciativaDataSource`, `useObjetivoDataSource`, `useAreaDataSource` y `useUsuarioDataSource`. Los de `Tarea` y `AvanceTarea` (los cuatro hooks existentes: `use<E>DataSource` y `useItem<E>DataSource`) pasan su mock como segundo argumento de `useDatasource`. Los mocks guardan el estado a nivel de módulo, como `IniciativaMock`.

- `TareaMock` (iniciativas, objetivos y personas de `IniciativaMock`, `ObjetivoMock` y `UsuarioMock`):
  - **iniciativa 1** ("Tablero de insights comerciales", 15/01/2026 a 30/06/2026), con 7 tareas modeladas sobre TAR-01 a TAR-05 del prototipo: 3 En curso, 1 Frenada, 1 No iniciada, 1 Finalizada (fecha de finalización cargada) y 1 Cancelada, con prioridades distintas (una sin prioridad), una con varias áreas, responsables `USUARIO_PRUEBA`, `BARBARA` y `MARIA`, y comentario ejecutivo en unas y no en otras;
  - **iniciativa 4** ("YPF Store en estaciones", 01/01/2026 a 31/12/2027), con 11 tareas: 10 no canceladas (8 En curso, 1 Frenada, 1 Finalizada) y 1 Cancelada, para ejercitar el tope de 10, el paginado de la sección (11 filas) y el paginado de la bandeja (11 tareas En curso en total);
  - **iniciativa 5** ("Catálogo online de YPF Store", 01/04/2026 a 30/06/2027), con 9 tareas, todas no canceladas (5 No iniciada, 2 Frenada, 2 Finalizada), para ejercitar el alta con 9 tareas (queda en 10) y el reintento de un alta con la tarea huérfana (D4);
  - iniciativas 2 y 3 sin tareas; iniciativa 6 (Finalizada) y 8 (Cancelada) sin tareas, para ejercitar FR-011; una iniciativa de otra VP (objetivo 5) con 1 tarea.
  Todas las fechas de las tareas están dentro de las de su iniciativa. `getItems` devuelve todas; `getFilteredItems(iniciativaId)` las de la iniciativa; `add` asigna el próximo Id; `edit` combina solo los campos definidos con el elemento existente y un `null` explícito vacía el campo (como SharePoint); `delete` quita el elemento; `getById` rechaza con estado 404 si no existe.
- `AvanceTareaMock`: historial coherente con `TareaMock`: la entrada del alta de cada tarea ("Tarea cargada.", 0 %, No iniciada), las actualizaciones intermedias de las que están En curso, Frenada o Finalizada, y una tarea reabierta (Finalizada → En curso → Finalizada) con 5 entradas. `getFilteredItems(tareaId)` devuelve las de esa tarea del registro más nuevo al más viejo. `add` asigna `Created` = ahora y `Author` = usuario de prueba, como `ComentarioResultadoClaveMock`.
- `useTareasIniciativa(iniciativaId)` (`core/api/Tarea/`): igual a `useComentariosIniciativa` (datasource o mock según el entorno), con `reload(): Promise<Tarea[]>` que devuelve las tareas leídas, para que el panel de alta pueda contar sobre datos frescos al guardar (D4).
- `useAvancesTarea(tareaId)` (`core/api/AvanceTarea/`): igual al anterior, para el panel de historial; se usa solo al abrirlo. **Ordena las entradas por `Created` descendente y, a igual fecha, por `Id` descendente antes de devolverlas**, porque `AvanceTareaDataSource.getFilteredItems` no ordena (FR-025, FR-039); el mock ordena igual.
- `IniciativaMock` y `ObjetivoMock` solo se tocan si falta algún caso de los anteriores.

**D2. Entidades.**

- `Tarea`: se suman `QueHabilita`, `ComentarioEjecutivo`, `ComentarioEjecutivoFecha`, `ComentarioEjecutivoAutor` y `FechaUltimaActualizacion`; `Area` pasa a `ILookupValue[]` (`toLookupValueArray` / `toLookupIds`, como `Iniciativa`); `Prioridad` admite `null`. El `select` del datasource suma las columnas nuevas (incluida `Area/Id` y `Area/Title` como hoy).
- **Estado actual de las columnas nuevas**: las columnas nuevas de `Tarea` y el `Area` multivalor se crearon en el sitio de desarrollo (P1 a P3); el workaround `COLUMNAS_NUEVAS_DISPONIBLES` se eliminó. `TareaDataSource` lee y escribe `QueHabilita`, `ComentarioEjecutivo`, `ComentarioEjecutivoFecha`, `ComentarioEjecutivoAutor` y `FechaUltimaActualizacion`, y escribe todas las áreas elegidas. La validación contra SharePoint real se hace en T079.
- `toListItem` envía `Title: this.Nombre` y, para `Estado` y `Prioridad`, solo lo definido (`Estado` con `assertChoiceValue`; `Prioridad` `null` vacía). Todo campo `undefined` se omite al guardar, así que los objetos que se guardan son parciales (D4). `RequiereInversion` se quita de `toListItem`: la entidad nunca lo envía (spec, FR-013), aunque alguien copie un objeto leído de la lista.
- `AvanceTarea`: sin cambios de estructura. Fecha y autor salen de `Created` y `Author`.
- Quién escribe cada campo de `Tarea`: ver [data-model.md](./data-model.md#quién-escribe-cada-campo).

**D3. Columnas de la lista `Tarea`.** Contraste completo en [data-model.md](./data-model.md#columnas-nuevas-y-cambios-en-sharepoint). Resumen: columnas nuevas `QueHabilita`, `ComentarioEjecutivo`, `ComentarioEjecutivoFecha`, `ComentarioEjecutivoAutor` y `FechaUltimaActualizacion`; cambio de `Area` a valores múltiples; `RequiereInversion` queda con valor por defecto "No" (o no obligatoria) y no se muestra en ninguna pantalla. Nada de esto lo hace el código: es el bloque "Preparativos a cargo de la usuaria".

**D4. Guardado (alta, edición y avance).**

- **Alta** (`TareaFormPanel.saveAlta`, con `useTareaDataSource` y `useAvanceTareaDataSource`):
  1. Antes de escribir: con `useTareasIniciativa(iniciativaId).reload()` se cuentan las tareas no canceladas de la iniciativa. Si son 10 o más, no se guarda y el campo Iniciativa muestra el error (FR-010). Es una validación al guardar, no atómica (R2). **Solo se controla si no hay una tarea ya creada en este panel** (referencia de reintento): una tarea huérfana, creada por un intento anterior cuyo deshacer falló, contaría en el conteo y bloquearía el reintento con una iniciativa de 9 tareas.
  2. `addItem` de la tarea (Estado No iniciada, Avance 0, `FechaUltimaActualizacion` = ahora, `Objetivo` = el de la iniciativa, sin comentario ejecutivo).
  3. `addItem` de la primera entrada del historial (`Tarea` = la nueva, Avance 0, Estado No iniciada, Comentario "Tarea cargada.").
  4. Si falla el paso 3, se deshace: `deleteItem` de la tarea creada. El panel muestra `TareaSaveError` y conserva lo ingresado.
  5. **Reintento**: el panel guarda en `useRef` la tarea creada y la entrada creada. Si el deshacer del paso 4 también falló, la tarea sigue creada: el reintento no vuelve a crearla, solo agrega la entrada que falta. Si el deshacer resultó bien, el reintento arranca limpio. Si la entrada ya estaba creada, no se repite. Nunca se duplica la tarea ni la entrada.
  El borrado es un deshacer interno de un alta fallida; no es una acción de la persona y no contradice FR-012. Mismo mecanismo que el alta de la 006 (D9).
- **Edición**: `editItem` de la tarea con un objeto parcial (Nombre, Title, Descripción, ¿Qué habilita?, Responsable, Áreas, Prioridad, fechas). No toca estado, avance, fecha de finalización, `FechaUltimaActualizacion`, comentario ejecutivo ni historial (FR-017). Un solo paso: no hay estado intermedio.
- **Registrar avance** (`TareaAvancePanel.save`):
  1. `addItem` de la entrada del historial (estado, avance, comentario solo si es nuevo o modificado; si no, sin comentario).
  2. `editItem` de la tarea (Estado, Avance, `FechaFinalizacion` o `null`, `FechaUltimaActualizacion` y, si el comentario cambió, `ComentarioEjecutivo`, `ComentarioEjecutivoFecha` y `ComentarioEjecutivoAutor`). La fecha, el autor y `FechaUltimaActualizacion` salen de la entrada recién creada (`Created` y `Author`), para que coincidan con el historial.
  3. Si falla el paso 2, la entrada ya existe: el panel la guarda en `useRef` y el reintento solo repite el paso 2, sin duplicar la entrada. Es el orden de "Cambiar estado" (004, D16). **Mientras la entrada esté escrita y el paso 2 no se haya completado, el panel bloquea Estado, Avance y Comentario ejecutivo**, para que el reintento use los mismos valores que la entrada. Si la persona cierra el panel tras un fallo, la entrada queda sin reflejarse en la tarea: ver R4.
- Todo lo que se guarda se valida antes de escribir. Errores de validación en el campo; errores de guardado, una línea con `MessageBar` y el panel conserva lo ingresado (FR-026).

**D5. Comentario ejecutivo.** El vigente vive en la lista `Tarea`: `ComentarioEjecutivo` (texto), `ComentarioEjecutivoFecha` y `ComentarioEjecutivoAutor`. Cada "Registrar avance" con un comentario nuevo o modificado:

- copia el texto en `AvanceTarea.Comentario` de la entrada nueva (el historial queda completo);
- reemplaza el texto, la fecha y el autor vigentes en la tarea.

Un comentario vacío o igual al precargado no toca el vigente y la entrada queda sin comentario (FR-021). Nunca se borra. La tarea recién cargada tiene el comentario vacío; "Tarea cargada." es solo el comentario de su primera entrada. Fecha y autor del vigente se toman de la entrada creada (no de las columnas `Modified` / `Editor` de la tarea, que cambian con cada edición). Alternativas descartadas en [research.md](./research.md) (Q4).

**D6. Reglas de dominio reutilizables (`Tarea/tareaUtils.ts`).** Funciones puras, sin acceso a datos ni a pantallas; las specs de riesgos y presupuesto las importan desde ahí:

- `TRANSICIONES_TAREA: Record<EstadoTarea, EstadoTarea[]>`: la tabla de FR-019a.
- `getEstadosDisponibles(estado)`: el estado actual más los destinos; en Finalizada, solo En curso; en Cancelada, vacío.
- `canEditTarea(tarea)` (no Cancelada) y `canRegistrarAvance(tarea)` (no Cancelada).
- `isReapertura(desde, hacia)`, `requiereConfirmacion(desde, hacia)` (solo al entrar en Finalizada o Cancelada, FR-023).
- `getAvanceIssue(texto)`: entero de 0 a 100 (FR-022), con el error en el campo.
- `getFechaFinalizacionIssue(fecha, fechaInicio, hoy)`: obligatoria con Finalizada; no anterior al inicio ni futura (FR-020a).
- `getFechasIssues(...)`: orden y rango dentro de la iniciativa (FR-008, FR-009).
- `TAREAS_MAX_NO_CANCELADAS = 10`, `countNoCanceladas(tareas)`, `getTopeIssue(tareas)` (FR-010) y `canCargarTarea(iniciativa, tareas)` (FR-011, FR-043).
- `formatTareaId(id)` (`TAR-nn`), `getEstadoTareaChipColor(estado)`, `getAniosObjetivo(objetivo)` (misma regla de año que la 004, sobre el objetivo).
- Largos máximos (FR-012a): nombre 100 y comentario 500.
- El color del avance **no** vive acá: se reutiliza `getAvanceColor` de `resultadoClaveUtils.ts` a través de `AvanceText` (H12, FR-031). Ninguna regla de C-07 se duplica.

El archivo es de dominio de `Tarea/`, no de `core`: así no se modifica `src/core/utils/Constants.ts` y no hay que registrar nada en `docs/plantilla-cambios.md` por esto.

**D7. Dos reglas separadas (FR-010 y FR-034 / FR-041a).**

- **Tope de tareas**: `TAREAS_MAX_NO_CANCELADAS = 10`, en `tareaUtils.ts`. Lo usan el panel de alta (error al guardar), el rótulo "Tareas (N de 10 no canceladas)" y el botón "Cargar tarea" del pie. Nunca se usa para paginar.
- **Paginado**: `TAREAS_PAGE_SIZE = 10` y `paginarTareas(tareas, page)`, en `Tarea/tareaPaginado.ts`. Lo usan la bandeja y la sección Tareas. Nunca se usa para limitar la carga de tareas.
Los dos valores no se importan entre sí y cada archivo lo dice en su nombre. Los conteos (solapas, subsolapas, indicadores, "N de 10") se calculan sobre la lista completa, antes de paginar.

**D8. Detalle de la tarea en secciones independientes (FR-040).** `TareaDetalle.tsx` carga los datos y compone sus piezas en una lista de elementos hermanos:

```text
<TareaInfo … />            // sección Información de la tarea
<TareaComentario … />      // sección Comentario ejecutivo
```

Cada sección es un componente con su propio `SectionBand`, recibe solo sus datos por props y no conoce a las demás. Sumar Riesgos o Presupuesto después es crear un componente nuevo y agregar una línea en `TareaDetalle.tsx`, sin tocar `TareaInfo` ni `TareaComentario`. No hay registro de secciones ni abstracción genérica. El pie fijo y los paneles son piezas aparte. Las migas necesitan el nivel "tarea": `PalancaBreadcrumb` recibe hoy hasta la iniciativa, que es el último nivel sin enlace; se agregan los props opcionales `iniciativaId` y `tareaNombre`, de modo que con `tareaNombre` la iniciativa pasa a ser un enlace y la tarea el último nivel, sin cambiar a los demás usos (D14). Si falla la carga del detalle de la tarea, se muestra `TareaLoadError` con un `Button` `TareasRetry` que vuelve a cargar la pantalla (FR-049); `TareaNotFound` no lleva reintento.

**D9. Rutas, home y permisos.**

- `routes.ts`: `TAREAS_PATH = '/tarea'`, `TAREA_DETAIL_PATH = '/tarea/:id'`, `getTareaPath(id)`, `TAREAS_VISTA_PARAM = 'vista'` y `TAREAS_VISTA_TODAS = 'todas'` (mismo mecanismo que `INICIATIVAS_VISTA_*`).
- `ObjetivosVp.tsx`: dos `<Route>` nuevas y el estado de la bandeja de tareas (`ITareasBandejaState`: búsqueda, filtros, subsolapa y página) subido a `ObjetivosVpRoutes` para que Volver desde el detalle la restaure, como en la 004.
- `AccessList.tsx`: el acceso `AccessMyTasks` recibe `route: TAREAS_PATH`.
- Permisos (FR-045): tres constantes `CAN_*` en `ObjetivosVp.tsx`, todas en `true` hasta RF-19, como la 004 y la 006: `CAN_CREATE_TAREA` (cargar: pie del detalle de la iniciativa y bandeja), `CAN_EDIT_TAREA` (Editar y lápiz de información del detalle de la tarea) y `CAN_REGISTER_PROGRESS_TAREA` (Registrar avance y lápiz del comentario). Bajan por props a `IniciativaDetalle` (`canCreateTarea`), `TareasBandeja` (`canCreate`) y `TareaDetalle` (`canEdit`, `canRegisterProgress`). No definen roles. Ver P-C1.

**D10. Bandeja (FR-028 a FR-036).**

- Carga: `useTareaDataSource`, `useIniciativaDataSource`, `useObjetivoDataSource`, `useDepartamentoDataSource` y `useObjetivoNames`, en un `Promise.all`; usuario actual con `useCurrentUser`. Mientras cargan, `Spinner`; si alguna falla, `MessageBar` de error con "Reintentar" (FR-049).
- Solapa: parámetro `vista` (`mis` por defecto, `todas`). "Mis tareas" filtra por `Responsable.Id` = usuario actual.
- Subsolapa: `En curso`, `Frenada`, `No iniciada`, `Finalizada`, `Cancelada`, en ese orden, con la cantidad de la solapa con búsqueda y filtros aplicados. Arranca en "En curso".
- Búsqueda por ID (`TAR-nn`) y nombre; filtros Departamento, Objetivo, Iniciativa, Responsable y Año, tomados del objetivo de la iniciativa de la tarea (FR-033). El año usa `getAniosObjetivo`.
- Contador de solapas: total sin búsqueda ni filtros. Contador "N tareas en esta vista": solapa actual con búsqueda y filtros (todos los estados).
- Paginado: `paginarTareas` sobre las tareas de la subsolapa; cualquier cambio de solapa, subsolapa, búsqueda o filtros vuelve a la página 1 (FR-034).
- Estados vacíos: "No hay tareas cargadas." si la solapa no tiene ninguna; "No hay tareas con estos filtros." si hay búsqueda o filtros; "No hay tareas en este estado." si no hay filtros y la subsolapa está vacía.
- `IniciativasHeader` recibe `searchPlaceholder?` y `newLabel?` (por defecto, los textos de iniciativas actuales: sin cambio para sus usos). `IniciativasPaginador` no cambia en la bandeja.

**D11. Localización.** Un solo archivo de idioma, `loc/en-us.js`, más `loc/mystrings.d.ts`. Textos tomados del prototipo (FR-048), con estas excepciones, que no existen en él: "Tareas (N de 10 no canceladas)" (el prototipo dice "activas"), la confirmación de Cancelada sin la mención al presupuesto (fuera de alcance), "No hay tareas en este estado.", los errores de fecha de finalización, de avance entero y de longitud, y el aviso de falla de carga con reintento. Lista completa de claves en [research.md](./research.md#textos-de-localización).

**D12. Panel de alta y edición (FR-014 a FR-018).**

- `useTareaFormMasters(tarea?)`: carga iniciativas, objetivos (con nombres resueltos), áreas, usuarios y usuario actual. Opciones de Iniciativa: las que no están Finalizadas ni Canceladas, de cualquier VP. Responsable: usuarios activos; en una edición, el responsable actual de la tarea se sigue mostrando elegido hasta que se cambie (igual que las áreas), aunque esté inactivo, y no se puede elegir a un usuario inactivo nuevo (P-C4).
- Desde la bandeja, Iniciativa libre; desde el detalle de la iniciativa (`iniciativaFija`), elegida y deshabilitada; en la edición, solo lectura.
- Validación al guardar: obligatorios con "Este campo es obligatorio." (Iniciativa, Nombre, Responsable, Descripción, ¿Qué habilita?, Áreas, fechas); Nombre hasta 100; Fecha de compromiso no anterior al inicio; las dos fechas dentro de las de la iniciativa (error con el rango); tope de tareas (D4).
- Un área de la tarea que ya no está en el maestro se agrega como opción para seguir mostrándola hasta que se cambie (FR-003, R6).
- El alta pide confirmación con el responsable en el texto; la edición, la suya (`ConfirmacionModal`).
- Al terminar: `onSaved(tarea)`; la pantalla de origen recarga y muestra `SuccessNotice`.

**D13. Detalle de la iniciativa (FR-041 a FR-044).**

- `IniciativaDetalle` suma `useTareasIniciativa(iniciativaId)` (consulta filtrada) y, con las tareas, renderiza al final, después del comentario ejecutivo, `IniciativaTareasIndicadores` y `IniciativaTareas` (H15). Las dos secciones se muestran en iniciativas de la VP RRII y de otras VP.
- Indicadores: cantidad por estado en el orden No iniciadas, En curso, Frenadas, Finalizadas, Canceladas, sobre todas las tareas de la iniciativa.
- Sección Tareas: `TareasTable` variante `iniciativa`, todas las tareas (canceladas incluidas), título con `countNoCanceladas`.
- Pie fijo: se agrega "Cargar tarea" (`canCargarTarea`), que abre `TareaFormPanel` con la iniciativa fija. Al guardar recarga las tareas.
- **Paginado de la sección (decisión tomada, FR-041a)**: el paginador de la bandeja es `position: fixed; bottom: 0` y el pie del detalle también (H8): no pueden convivir. Por eso se agrega a `IniciativasPaginador` el prop opcional `inline`, que lo muestra al final de la sección en lugar de fijo. La spec (FR-041a) quedó corregida en ese sentido; el paginador de la bandeja sigue fijo al pie.
- **Falla de la carga de tareas (FR-049)**: si falla `useTareasIniciativa`, la sección muestra un `MessageBar` `type="error"` de una línea (`TareasLoadError`) con un `Button` `TareasRetry` que vuelve a cargar; el resto del detalle de la iniciativa se muestra igual y no se muestra el estado vacío como si no hubiera datos.
- Ver una fila abre `/tarea/:id` con `state.from` = la iniciativa, y Volver regresa (FR-037c).

**D14. Piezas existentes que se amplían.**

| Pieza | Cambio |
|---|---|
| `IniciativasHeader` | Props opcionales `searchPlaceholder` y `newLabel`. |
| `IniciativasPaginador` | Prop opcional `inline` (D13). |
| `PalancaBreadcrumb` | Props opcionales `iniciativaId` y `tareaNombre` para el nivel de la tarea. |
| `IniciativaDetalle` | Carga de tareas, dos secciones, "Cargar tarea" en el pie y `TareaFormPanel`. |
| `AccessList` | `route` del acceso `AccessMyTasks`. |
| `ObjetivosVp.tsx`, `routes.ts` | Rutas y estado de la bandeja (D9). |

**D15. No se elimina ninguna tarea ni entrada.** La aplicación no ofrece borrar una tarea ni editar o borrar una entrada del historial. `deleteItem` solo se usa para deshacer un alta fallida (D4).

**D16. Errores.** Una línea con `MessageBar`, sin el error técnico (FR-047). El registro queda en `useDatasource`; las pantallas no vuelven a registrarlo. Las lecturas filtradas (`useTareasIniciativa`, `useAvancesTarea`) registran con `console.error` y devuelven `error`.

## Estructura de carpetas

```text
specs/007-tareas/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/{requirements.md, calidad-requisitos.md}
└── tasks.md                                   # lo genera /speckit-tasks

src/core/
├── entities/Tarea.ts                          # columnas nuevas, Area múltiple, toListItem (D2)
└── api/
    ├── Tarea/
    │   ├── TareaDataSource.ts                 # select con las columnas nuevas
    │   ├── TareaMock.ts                       # nuevo (D1)
    │   ├── useTareaDataSource.ts              # pasa el mock
    │   ├── useItemTareaDataSource.ts          # pasa el mock
    │   └── useTareasIniciativa.ts             # nuevo (D1)
    └── AvanceTarea/
        ├── AvanceTareaMock.ts                 # nuevo (D1)
        ├── useAvanceTareaDataSource.ts        # pasa el mock
        ├── useItemAvanceTareaDataSource.ts    # pasa el mock
        └── useAvancesTarea.ts                 # nuevo (D1)

src/webparts/objetivosVp/
├── loc/{en-us.js, mystrings.d.ts}             # claves nuevas
└── components/
    ├── ObjetivosVp/{ObjetivosVp.tsx, routes.ts}       # rutas y estado de la bandeja (D9)
    ├── Home/AccessList/AccessList.tsx                 # route de "Mis tareas"
    ├── Palanca/PalancaBreadcrumb/PalancaBreadcrumb.tsx # iniciativaId y tareaNombre opcionales
    ├── Tarea/
    │   ├── tareaUtils.ts                      # nuevo: dominio (D6)
    │   ├── tareaPaginado.ts                   # nuevo: paginado (D7)
    │   ├── TareasBandeja/
    │   │   ├── TareasBandeja.tsx, TareasBandeja.module.scss     # nuevo (D10)
    │   │   └── TareasFiltros/{TareasFiltros.tsx, TareasFiltros.module.scss}
    │   ├── TareasTable/{TareasTable.tsx, TareasTable.module.scss}
    │   ├── TareaForm/
    │   │   ├── TareaFormPanel.tsx, TareaForm.tsx, useTareaFormMasters.ts, TareaForm.module.scss   # nuevo (D12)
    │   ├── TareaDetalle/
    │   │   ├── TareaDetalle.tsx, TareaDetalle.module.scss       # nuevo (D8)
    │   │   ├── TareaInfo/{TareaInfo.tsx, TareaInfo.module.scss}
    │   │   └── TareaComentario/TareaComentario.tsx
    │   ├── TareaAvancePanel/TareaAvancePanel.tsx                # nuevo: Registrar avance
    │   └── TareaHistorialPanel/TareaHistorialPanel.tsx          # nuevo
    └── Iniciativa/
        ├── IniciativasBandeja/IniciativasHeader/IniciativasHeader.tsx          # props opcionales
        ├── IniciativasBandeja/IniciativasPaginador/IniciativasPaginador.tsx    # prop inline
        └── IniciativaDetalle/
            ├── IniciativaDetalle.tsx                            # tareas, secciones, pie
            ├── IniciativaTareasIndicadores/IniciativaTareasIndicadores.tsx   # nuevo
            └── IniciativaTareas/IniciativaTareas.tsx            # nuevo
```

**Structure Decision**: los componentes siguen agrupados por dominio y `Tarea/` es una carpeta de dominio nueva, como `Iniciativa/` y `Objetivo/`. Las dos secciones de la iniciativa quedan en `IniciativaDetalle/` porque pertenecen a esa pantalla. `tareaUtils.ts` y `tareaPaginado.ts` quedan en `Tarea/` y no en `core`, porque son reglas de dominio de esta feature y de las que vengan después (riesgos y presupuesto cuelgan de la tarea).

## Orden de implementación

| # | Paso | Depende de |
|---|------|-----------|
| 1 | `Tarea.ts` y `TareaDataSource.ts` (D2) | — |
| 2 | Mocks, hooks que pasan el mock y los dos hooks filtrados (D1) | 1 |
| 3 | Claves de texto en `loc/` (D11) | — |
| 4 | `tareaUtils.ts` y `tareaPaginado.ts` (D6, D7) | 3 |
| 5 | Rutas, `AccessList` y `PalancaBreadcrumb` (D9, D14) | — |
| 6 | Sección Tareas e indicadores en el detalle de la iniciativa, solo lectura, con `IniciativasPaginador` `inline` (US7) | 2, 4 |
| 7 | Detalle de la tarea: información, comentario ejecutivo, pie e historial (US3) | 2, 4, 5 |
| 8 | Panel de alta y edición, con el alta guardada en dos pasos (US1, US4) | 2, 4, 6 |
| 9 | Panel "Registrar avance" (US2) | 7 |
| 10 | Bandeja: encabezado, solapas, subsolapas, grilla y paginado (US5) | 2, 4, 5 |
| 11 | Búsqueda y filtros de la bandeja (US6) | 10 |
| 12 | "Cargar tarea" en el pie de la iniciativa y en la bandeja | 6, 8, 10 |
| 13 | Registrar en `docs/plantilla-cambios.md` los cambios de `core` | 1, 2 |
| 14 | La usuaria prepara las listas (P1 a P6) | — |
| 15 | Validación con [quickstart.md](./quickstart.md) | 9, 11, 12, 14 |

## Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | La tarea y su primera entrada del historial se guardan en listas distintas y SharePoint no tiene transacciones: el alta puede quedar a medias. | Todo se valida antes de escribir. Si falla la entrada, se deshace la tarea; si el deshacer también falla, se informa en una línea, el panel conserva lo ingresado y el reintento solo agrega lo que falta, sin duplicar y sin volver a controlar el tope (D4). Si la persona cierra el panel en ese estado, la tarea queda sin entrada: el historial muestra su estado vacío defensivo (FR-039). Es una limitación de la plataforma. |
| R2 | El tope de 10 tareas no canceladas se valida al guardar sobre una lectura reciente, no con un bloqueo: dos altas simultáneas en una iniciativa con 9 tareas pueden dejar 11. | Es la validación posible en SharePoint (FR-010, caso límite de la spec). La segunda alta se rechaza si la primera ya terminó de guardarse. El exceso, si ocurriera, no rompe nada: las pantallas muestran todas las tareas y "Cargar tarea" queda deshabilitado. |
| R3 | Las listas leen hasta 5000 elementos (`TOP_DEFAULT`). Con unas 1.000 tareas por año, la bandeja y `Avance tarea` alcanzan el tope en unos 5 años. | Fuera del volumen del primer año. Si se acercara, hay que consultar por filtro o paginar en el servidor. La lectura del historial va filtrada por `Tarea` (índice en P5). |
| R4 | "Registrar avance" escribe la entrada y después la tarea. Si falla la segunda escritura y la persona cierra el panel, el historial queda con una entrada que la tarea no refleja; al reintentar desde un panel nuevo se agrega otra entrada. | Mientras el panel sigue abierto, el reintento no duplica y Estado, Avance y Comentario ejecutivo quedan bloqueados para que el reintento use los mismos valores que la entrada (D4). Las pantallas leen el estado vigente de la tarea, no del historial, así que no se muestra información inconsistente más allá de una entrada de más. Se informa en una línea. |
| R5 | El criterio de "objetivo de la VP RRII" es `objetivo.VP.Title === 'VP RRII'` sobre el lookup sin resolver (004, R2). Aquí se usa para las migas y no para cálculos. | Se mantiene el criterio validado en la 004. |
| R6 | Si la columna `Area` de `Tarea` pasa a valores múltiples y SharePoint elimina el valor de un área borrada del maestro, un "área que ya no existe" no se puede seguir mostrando desde los datos. | La opción de mostrarla funciona cuando el lookup todavía la conserva. A confirmar con la usuaria cómo está configurado el comportamiento de la relación del lookup (P2). |
| R7 | Un usuario con permiso de agregar y editar, pero sin borrar, en `Tarea`, no podría deshacer un alta fallida. | Verificación P7: confirmar el nivel de permiso sobre `Tarea`. Si no tiene borrado, el deshacer falla y queda lo descrito en R1. |
| R8 | `Avance tarea` guarda `Title` vacío: si la columna `Title` fuera obligatoria, el alta fallaría. | P6: verificar que `Title` no sea obligatorio (igual que `Comentario iniciativa`). |
| R9 | `RequiereInversion` es obligatoria según RF-12 y esta feature no la envía: si la columna es obligatoria sin valor por defecto, el alta fallaría. | P4: valor por defecto "No" o no obligatoria. |

## A confirmar

Ninguno pendiente. Los puntos P-C1 a P-C5 quedaron resueltos (ver abajo). Lo que sigue abierto no es una decisión de diseño: las verificaciones de SharePoint de la usuaria (P2, P6 y P7, más R6) y la revisión visual de las aproximaciones A1 a A6.

## Decisiones tomadas tras el análisis

Antes eran los puntos "A confirmar" P-C1 a P-C5.

| # | Punto | Decisión |
|---|---|---|
| P-C1 | Permisos (FR-045). | Tres constantes `CAN_*` para tareas (cargar, editar y registrar avance), como la 004 y la 006, todas en `true` hasta RF-19 (D9). No definen roles. |
| P-C2 | Paginador de la sección Tareas del detalle de la iniciativa (FR-041a). | Va al final de la sección, no fijo, porque el detalle ya tiene su barra de acciones fija (D13). El de la bandeja sigue fijo. |
| P-C3 | Campo Iniciativa "con buscador integrado" (RF-12). | `Dropdown` actual, sin buscador (A4): diferencia con RF-12, porque el DS no tiene un `Dropdown` con buscador. |
| P-C4 | Responsable inactivo al editar. | Se sigue mostrando elegido hasta que se cambie, igual que las áreas; no se puede elegir un usuario inactivo nuevo (D12, FR-005). |
| P-C5 | Regla de año del filtro. | Se calcula en memoria con las fechas del objetivo (D10); no se indexa. |
| P-C6 | Registrar avance sin cambios. | Escribe igual una entrada de historial, porque renueva "Actualizada" (base de la alerta de tarea sin actualizar de la Entrega 2). |
| P-C7 | Bloqueo posterior a escribir la entrada de Registrar avance. | La Fecha de finalización queda editable: el `Picker` del DS no tiene `disabled` y esa fecha no forma parte de la entrada del historial. Estado, Avance y Comentario ejecutivo sí se deshabilitan. |
| P-C8 | Campo Iniciativa del alta (RF-12). | `Dropdown` actual, sin buscador (A4): diferencia con RF-12. |
| P-C9 | Claves de localización con texto ya existente. | Se reutilizan y figuran como reutilizadas: "Descripción" con `ObjetivoFieldDescription` (detalle) y `ObjetivoFormDescription` (formulario), "Mis tareas" con `AccessMyTasks` y "Todas" con `IniciativasTabAll`. |

## Preparativos a cargo de la usuaria

Todo lo que depende del acceso al sitio de SharePoint. No son tareas de código. Pasos en [quickstart.md](./quickstart.md#preparativos-en-sharepoint).

| # | Preparativo | Cuándo |
|---|---|---|
| P1 | Lista `Tarea`: crear la columna `QueHabilita` (varias líneas de texto, texto sin formato, no obligatoria). | Antes de probar el alta en SharePoint. |
| P2 | Lista `Tarea`: cambiar la columna `Area` para permitir varios valores (se mantiene el nombre interno `Area`). A confirmar: no hay tareas cargadas que dependan del valor único, y cómo está configurado el comportamiento de la relación al borrar un área (R6). | Antes de probar el alta. |
| P3 | Lista `Tarea`: crear `ComentarioEjecutivo` (varias líneas de texto, texto sin formato), `ComentarioEjecutivoFecha` (fecha y hora), `ComentarioEjecutivoAutor` (persona, un solo valor) y `FechaUltimaActualizacion` (fecha y hora), ninguna obligatoria. | Antes de probar el alta. |
| P4 | Lista `Tarea`: la columna `RequiereInversion` (sí/no) con valor por defecto "No", o no obligatoria. La aplicación no la envía ni la muestra. | Antes de probar el alta. |
| P5 | Indexar columnas. En `Tarea`: `Iniciativa`, `Responsable` y `Objetivo`. En `Avance tarea`: `Tarea`. | Antes de probar con SharePoint, en cada sitio. |
| P6 | Verificar la lista `Avance tarea`: columnas `Tarea` (búsqueda), `Avance` (número sin decimales), `Estado` (opciones iguales a `EstadoTarea`) y `Comentario`; que `Comentario` y `Title` no sean obligatorios. Verificar también en `Tarea` que `Estado` y `Prioridad` tengan las opciones del enum. | Antes de probar el alta y el seguimiento. |
| P7 | Verificar los permisos sobre `Tarea` (agregar, editar y borrar, este último para deshacer un alta fallida) y sobre `Avance tarea` (agregar). El código no edita ni borra entradas del historial. | Antes de probar con SharePoint. |
| P8 | Cargar los datos de prueba del quickstart en las listas de desarrollo (iniciativas con 9 y 10 tareas no canceladas, iniciativas Finalizada y Cancelada, tareas en cada estado). | Antes de la revisión funcional. |

**Estado actual de P1 a P3**: creadas en el sitio de desarrollo; el workaround se eliminó. `TareaDataSource` ya lee y escribe las columnas de P1 y P3 y todas las áreas de P2. T079 las valida contra SharePoint real.

## Complexity Tracking

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|-----------|----------------------|-------------------------------------------|
| Alta con deshacer compensatorio y `useRef` de lo ya guardado (principio IV) | FR-007a pide que el alta deje la tarea y su primera entrada, y SharePoint no tiene transacciones (R1). | Guardar la tarea y después la entrada sin deshacer: deja tareas sin historial. |
| `Tarea.ts`, `TareaDataSource.ts` y los cuatro hooks de `Tarea` y `AvanceTarea` modificados, y cuatro archivos nuevos en `core` (principio IV) | La spec exige columnas y mocks que la entidad no tiene (H1 a H3, H5). Se registran en `docs/plantilla-cambios.md`. | Dejar la entidad como está: no puede guardar áreas múltiples ni comentario ejecutivo. |
| Props opcionales nuevas en `IniciativasHeader`, `IniciativasPaginador` y `PalancaBreadcrumb` (principio IV) | Evitan duplicar tres piezas completas para la bandeja y el detalle de la tarea (H8, H9). | Copiar cada pieza: duplica estilos y comportamiento del paginado. |
| `TareasBandeja` sube su estado a `ObjetivosVpRoutes` (principio IV) | Volver desde el detalle debe restaurar solapa, filtros y página, como la 004. | Estado local: la bandeja arrancaría de cero al volver. |
| Dos grillas en una (`TareasTable` con variantes `bandeja` e `iniciativa`) (principio IV) | Mismas filas y chips con columnas distintas, como `IniciativasTable`. | Dos componentes casi iguales. |
| Tarjeta de indicadores con `Field` y `Dropdown` sin buscador (principio II) | El DS no tiene esas piezas (A2, A4). | Piezas propias: viola el principio II. |
| Cambio de `Area` y columnas nuevas en una lista existente (principio IV) | Lo pide la spec (FR-003, FR-021, FR-024). Lo hace la usuaria, no el código. | Guardar el comentario ejecutivo solo en el historial: ver [research.md](./research.md), Q4. |
| Se mantienen los desvíos de la 003, la 004 y la 006 que alcanzan a estas pantallas (migas, error de fecha bajo `Picker`, paneles laterales para flujos que el prototipo resuelve con modal) | FR-046 de la spec. | — |

## Registro en `docs/plantilla-cambios.md`

Filas que debe agregar la implementación (tarea del paso 13), con la fecha del día en que se haga el cambio:

| Fecha | Archivo | Cambio | Motivo | Feature |
|---|---|---|---|---|
| (fecha del cambio) | `src/core/entities/Tarea.ts` | Suma `QueHabilita`, `ComentarioEjecutivo`, `ComentarioEjecutivoFecha`, `ComentarioEjecutivoAutor` y `FechaUltimaActualizacion`; `Area` pasa a lista; `Prioridad` admite `null`; `toListItem` envía `Title`, omite `Estado` y `Prioridad` sin definir y deja de enviar `RequiereInversion`. | Que la entidad guarde lo que pide la spec con objetos parciales. | 007-tareas |
| (fecha del cambio) | `src/core/api/Tarea/TareaDataSource.ts` | El `select` suma las columnas nuevas. | Leer lo que la entidad ahora mapea. | 007-tareas |
| (fecha del cambio) | `src/core/api/Tarea/useTareaDataSource.ts`, `useItemTareaDataSource.ts` | Pasan `TareaMock` como segundo argumento. | Principio III: construir pantallas sin las listas. | 007-tareas |
| (fecha del cambio) | `src/core/api/AvanceTarea/useAvanceTareaDataSource.ts`, `useItemAvanceTareaDataSource.ts` | Pasan `AvanceTareaMock` como segundo argumento. | Ídem. | 007-tareas |
| (fecha del cambio) | `src/core/api/Tarea/TareaMock.ts`, `useTareasIniciativa.ts`; `src/core/api/AvanceTarea/AvanceTareaMock.ts`, `useAvancesTarea.ts` | Archivos nuevos: mocks y lecturas filtradas. | Principio III y consultas por iniciativa y por tarea. | 007-tareas |
