# Implementation Plan: Iniciativas (bandeja, alta, edición, cambio de estado y vista)

**Branch**: `004-iniciativas` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-iniciativas/spec.md`. Continúa la [003-objetivos](../003-objetivos/plan.md) y se apoya en la [005-objetivos-pesos](../005-objetivos-pesos/plan.md), ya implementada (peso del objetivo en el departamento).

## Summary

Agregar al webpart `objetivosVp` la bandeja de iniciativas ("Mis iniciativas" / "Todas", con búsqueda, filtros y paginado), el panel lateral de cargar y editar iniciativa, el panel "Cambiar estado" con el comentario ejecutivo, el detalle de la iniciativa con migas, y la sección "Iniciativas" en el detalle del objetivo. Los pesos en el objetivo y en el departamento se calculan al mostrarlos; no se guardan.

Enfoque técnico:

- **Datos**: ya existen las entidades y los datasources de `Iniciativa`, `ComentarioIniciativa`, `Area` y `Usuario` (skill `data-source`). Se agrega un mock a cada uno (principio III). `Iniciativa` pasa a escribir `Title` y a leer y escribir `Area` como lookup múltiple. `Usuario` suma `getCurrentUser` y un hook `useCurrentUser`, porque la app todavía no conoce al usuario actual y lo necesitan "Mis iniciativas" y el Accountable por defecto.
- **Pantallas**: dos rutas nuevas, `/iniciativa` (bandeja, con la solapa en `?vista=`) y `/iniciativa/:id` (detalle). El alta, la edición y el cambio de estado son paneles laterales, como el formulario de objetivo; cada guardado pasa por un modal de confirmación.
- **Listas y cálculos**: los hooks solo exponen `getItems`, así que las pantallas cargan iniciativas y objetivos y filtran, cuentan, paginan y calculan pesos durante el render (H4 de la 003). Los comentarios son la excepción: se traen solo los de la iniciativa que se ve, filtrando en la consulta (D24).
- **Componentes**: todo con piezas del DS. Accountable con `Picker` `mode="people"` sobre los usuarios de la lista `Usuario`; Áreas con `Dropdown` múltiple; paginador armado con `Button` y `FigmaIcon` (aprobado por la usuaria); panel de filtros con `Panel`, `Dropdown` y `Button`.
- **Permisos**: tres constantes separadas (`CAN_CREATE_INICIATIVA`, `CAN_EDIT_INICIATIVA`, `CAN_CHANGE_ESTADO_INICIATIVA`), en `true` hasta RF-19.

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, con la configuración heredada de `@microsoft/spfx-web-build-rig`, igual que la 003 y la 005.

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`, Fluent UI v8 (`@fluentui/react ^8.106.4`), PnPjs `@pnp/sp 4.18.0` (`core/pnp/sp/pnpjs-presets.ts`, que ya importa `site-users`), `react-router-dom 6.30.6`. Esta feature no agrega dependencias.

**Storage**: listas de SharePoint `Iniciativa`, `Comentario iniciativa`, `Area`, `Usuario` y `Objetivo` (`Lista.*` en `src/core/utils/Constants.ts`), que ya existen. La columna `Area` de `Iniciativa` ya es de valores múltiples (research, U4). La columna `Iniciativa` de `Comentario iniciativa` tiene que estar **indexada**, porque el detalle filtra por ella (D24, P1). Detalle en [data-model.md](./data-model.md). Mocks en memoria fuera de SharePoint.

**Testing**: no hay runner de pruebas. Validación: `npm run build` (principio V), escenarios de [quickstart.md](./quickstart.md) con mocks y en el workbench hospedado del sitio de desarrollo, y comparación visual con el prototipo. Se escribe solo en las listas de desarrollo y con autorización explícita.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft, según los scripts de `package.json`).

**Performance Goals**: bandeja, detalles y paneles en menos de 3 s con cientos de iniciativas (SC-008). La bandeja hace 4 consultas (iniciativas, objetivos, departamentos, usuario actual); el detalle de la iniciativa, 4 (iniciativas, objetivos, áreas y los comentarios de esa iniciativa, filtrados en la consulta); búsqueda, filtros y paginado son en memoria.

**Constraints**: `src/core/ui` de solo lectura; sin colores, tipografías ni espaciados fuera del DS; textos en español (AR) con `loc/`; sin acción de eliminar; no se crean ni modifican listas o columnas.

**Scale/Scope**: 2 rutas y 2 pantallas nuevas (bandeja y detalle), 2 paneles y 1 modal, 1 sección nueva en el detalle del objetivo, 4 mocks y 1 hook en `core`, 3 archivos de `core` modificados, 5 piezas existentes ampliadas, claves nuevas en `loc/`.

## Hallazgos del repo

Detalle en [research.md](./research.md).

| # | Hallazgo | Consecuencia |
|---|---|---|
| H1 | `Iniciativa`, `ComentarioIniciativa`, `Area` y `Usuario` tienen datasource, interfaz y hooks, pero no mock (R1). | Cuatro mocks nuevos (D1). No se crean servicios. |
| H2 | `Iniciativa.toListItem` no envía `Title` y mapea `Area` como un solo valor (R2, R4). | `Title = Nombre` (FR-009) y `Area` como `ILookupValue[]` (D2, D3). |
| H3 | No hay acceso al usuario actual (R7). | `getCurrentUser` en el datasource de `Usuario`, con mock, y `useCurrentUser` (D5). |
| H4 | `SectionBand` arranca siempre expandida (R13). | Prop `defaultCollapsed` para "Comentario ejecutivo" (FR-032, D19). |
| H5 | `PalancaBreadcrumb` termina siempre en el objetivo (R12). | Se amplía con `objetivoId` e `iniciativaNombre` (FR-031, D11). |
| H6 | Los formularios actuales no piden confirmación (R14). | Modal de confirmación nuevo, con `Modal` del DS (FR-025, FR-029, D17). |
| H7 | No hay paginador en el DS ni íconos de flecha izquierda o doble (R23). | Paginador con `Button` y `chevronRight` espejado y duplicado, aprobado por la usuaria (U2, D21). |
| H8 | `Picker` tiene `mode="people"` sobre una lista dada, sin `errorMessage` (R20). | Accountable con `Picker`; el error se muestra como en las fechas (A2 de la 003, D7). |
| H9 | `Modal` pone botones propios en inglés si no recibe acciones (R22). | `ConfirmacionModal` pasa siempre Aceptar y Cancelar (D17). |
| H10 | No hay chip violeta (R25). | Cancelada con `secondary` (aproximación A1). |
| H11 | El acceso "Mis iniciativas" de la home no navega (R10). | Se le agrega la ruta (FR-015). |
| H12 | `ComentarioIniciativaDataSource` solo trae todos los comentarios (R5) y el hook genérico no expone consultas filtradas (R8). | `getFilteredItems(iniciativaId)` en el datasource y el mock, y un hook `useComentariosIniciativa` (D24). |

## Constitution Check

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | Mismo stack y versiones; sin dependencias nuevas. `sp.web.currentUser` ya está habilitado por `pnpjs-presets.ts`. |
| II. La interfaz no se inventa | ✅ Cumple, con los desvíos que aprobó la spec | Pantallas tomadas de `scr.iniciativas`, `showFilters`, `sideIni`, `scr.iniciativa`, `m.is.iniUpd` y la sección `o_inis` de `scr.objetivo` del prototipo v10. Desvíos aprobados: "Cambiar estado" en panel en vez de modal (FR-028), sin avance, "Ubicación en la estrategia", resultados clave, tareas ni el resto de secciones (FR-034), sin columna Avance ni botón Actualizar (FR-016, FR-018), migas en lugar de "Ubicación en la estrategia" (FR-031). Todo se arma con piezas del catálogo. |
| II. `core/ui` de solo lectura | ✅ Cumple | No se modifica el DS. |
| II. Estructura de pantalla | ✅ Cumple | `IniciativasBandeja/` e `IniciativaDetalle/`, cada una con su `.tsx` y `.module.scss` y las piezas en subcarpetas. |
| II. Textos en español (AR) | ✅ Cumple | Claves nuevas en `loc/mystrings.d.ts` y `loc/en-us.js`, reutilizando las que ya existen para el mismo concepto. |
| III. Datos desacoplados | ✅ Cumple | Las pantallas usan solo hooks de `core/api`. Cuatro mocks nuevos y el mock del usuario actual. Tipos en `core/entities`. |
| IV. Simplicidad y cambios acotados | ✅ Cumple, con cambios justificados | En `core`: `Iniciativa.ts`, `Mappers.ts` (`toLookupIds`), `Usuario` (`getCurrentUser`) y los cuatro hooks. En el webpart: `ObjetivoDetalle`, `PalancaBreadcrumb`, `SectionBand`, `AccessList`, `ObjetivosVp` y `routes.ts`, con props opcionales que no cambian su uso actual. |
| V. Validación | ✅ Cumple | Cada tarea cierra con `npm run build`. |

**Re-check post-diseño**: sin cambios. Los pendientes de diseño se resolvieron con la usuaria el 2026-11-18 (research, U1 a U8). Queda P1, un prerrequisito de SharePoint a cargo de la usuaria.

## Interfaz y Design System

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (prototipo v10):

- bandeja: `scr.iniciativas`;
- panel de filtros: bloque `showFilters` (rama `notAbm`);
- panel de cargar/editar: bloque `sideIni`;
- detalle: `scr.iniciativa`, secciones `i_info` e `i_com`;
- cambiar estado: modal `m.is.iniUpd` (en esta feature, como panel lateral);
- detalle del objetivo: `scr.objetivo`, sección `o_inis`;
- textos de confirmación: función de confirmaciones (`ini: ['Cargar iniciativa', …]`) y `confirm` de "Cambiar estado".

**Design System**: `src/core/ui`, según `docs/design-system-catalog.md`.

**Estructura de la pantalla**: ver "Estructura de carpetas".

### Mapeo elemento → componente

**Bandeja (`IniciativasBandeja`, `scr.iniciativas`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Volver | `BackButton` (`shared/`) | Va a la home (FR-016). |
| Título | `h1` con `HEADER_TITLE_STYLE` | "Mis iniciativas" o "Todas las iniciativas". |
| Búsqueda | `SearchBox` (`core/ui/patterns`) | Placeholder "Buscar ID o iniciativa". |
| Filtros | `Button` `variant="primary"` + `FigmaIcon` `list` | Mismo estilo que el botón Filtros de `PalancasHeader`. Abre `IniciativasFiltros`. |
| Cargar iniciativa | `Button` `variant="primary"` + `FigmaIcon` `add` | Solo si `canCreate`. Mismo estilo que "Cargar objetivo". |
| "N iniciativas en esta vista" | `p` con tokens | Mismo estilo que el resumen de `Palancas`. |
| Solapas | `Tabs` (`core/ui/patterns`) | `variant="transparent"`, "Mis iniciativas (n)" y "Todas (n)", igual que en `Palancas`. |
| Grilla | `IniciativasTable` (`Table` del DS) | Variante `bandeja`. Estado con `Chip` `size="small"`. "Ver" con `Button` `iconOnly` + `chevronCirclePrimary` + `Tooltip`. |
| Estado vacío | `emptyText` de `Table` | Una línea (FR-022). |
| Error de carga | `MessageBar` `type="error"` | Una línea. |
| Carga | `Spinner` | Sin texto. |
| Paginador | `IniciativasPaginador`: `Button` `iconOnly` + `FigmaIcon` `chevronRight` y texto con tokens | Fijo al pie, como `DetailFooter`. Ver D21. |

**Panel de filtros (`IniciativasFiltros`, `showFilters`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Panel | `Panel` (`core/ui/patterns`) | Título "Filtros". |
| Departamento, Objetivo, Accountable, Estado, Año | `Dropdown` (`core/ui/components`), un valor | Primera opción "Todos" (clave `''`). Opciones: D13. |
| Pie | `Button` x2 | "Limpiar filtros" `variant="secondary"`, "Aplicar" `variant="primary"`. |

**Panel de cargar y editar (`IniciativaFormBody`, `sideIni`)**, en una columna (FR-024):

| Elemento | Componente | Observaciones |
|---|---|---|
| Panel | `Panel` | Ancho 480 px, como el de objetivo. Título "Cargar iniciativa" o "Editar iniciativa INI-nn", con el nombre como subtítulo al editar (`buildPanelTitle`). |
| Objetivo | `Dropdown` | `required`, opciones "OBJ-nn · nombre" ordenadas por Id; `disabled` al editar (FR-024). |
| Nombre de la iniciativa | `Input` | `required`, `maxLength={255}`, placeholder del prototipo. |
| Descripción / impacto esperado | `Multiline` | `required`, placeholder del prototipo. |
| Accountable | `Picker` `mode="people"` | `required`, `people` = usuarios (D7), `selectedPeople`, `onSelectedPeopleChange`. Error en `span` bajo el campo. |
| Áreas involucradas | `Dropdown` `multiple` | Opciones del maestro `Area`, por `Nombre`. Opcional. |
| Fecha de inicio / de compromiso | `Picker` `mode="date"`, lado a lado | `required`; error en `span` (A2 de la 003). |
| Estado (solo edición) | `Dropdown` | `required`, cinco estados. |
| Error al guardar | `MessageBar` `type="error"` | Una línea; el panel conserva lo ingresado. |
| Pie | `Button` x2 | Cancelar `secondary` · "Cargar iniciativa" o "Guardar cambios" `primary`. |
| Carga de maestros | `Spinner` / `MessageBar` | Como `ObjetivoFormPanel`. |

**Panel "Cambiar estado" (`IniciativaEstadoPanel`, `m.is.iniUpd`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Panel | `Panel` | Título "Cambiar estado de la iniciativa", subtítulo "INI-nn · nombre". |
| Estado | `Dropdown` | `required`, el actual preseleccionado. |
| Comentario ejecutivo | `Multiline` | Precargado con el último; placeholder del prototipo. |
| Pie | `Button` x2 | Cancelar · "Cambiar estado". |
| Error al guardar | `MessageBar` `type="error"` | Una línea. |

**Confirmación (`ConfirmacionModal`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Modal | `Modal` (`core/ui/patterns`) | `variant="default"`, `title` (D17), `description` = texto de FR-025 o FR-029, `closeOnOverlayClick={false}`. |
| Acciones | `Button` x2 | Cancelar `secondary`, Aceptar `primary` (deshabilitado mientras guarda). |

**Detalle (`IniciativaDetalle`, `scr.iniciativa`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Migas | `PalancaBreadcrumb` ampliado | D11. |
| Encabezado | `BackButton` + `h1` + `HeaderChip` | "INI-nn · nombre" y el estado. Sin avance ni "Ubicación en la estrategia". |
| "Información de la iniciativa" | `SectionBand` `collapsible` + `Field` (grilla de 4, como `ObjetivoInfo`) | Objetivo, Accountable, Áreas involucradas, Estado, Fecha de inicio, Fecha de compromiso, Peso en el objetivo, Peso en el departamento; debajo, Descripción / impacto esperado. Lápiz `editPrimary` si `canEdit`. |
| "Comentario ejecutivo" | `SectionBand` `collapsible` `defaultCollapsed` | Fecha y autor (`Field`-like con tokens) y texto, o la línea vacía. Lápiz si `canChangeEstado`. |
| Pie | `DetailFooter` + `Button` x3 | Cancelar `secondary`, Editar `primary` (si `canEdit`), "Cambiar estado" `primary` con el color de la escala Secondary (si `canChangeEstado`); ver A3. |
| Mensaje de éxito | `SuccessNotice` | Tras editar (`IniciativaUpdated`) y tras cambiar el estado (`IniciativaStatusUpdated`). |
| No encontrada / error / carga | `MessageBar` / `Spinner` | Como `ObjetivoDetalle`. |

**Detalle del objetivo, sección Iniciativas (`ObjetivoIniciativas`, `o_inis`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Sección | `SectionBand` `collapsible` | Título "Iniciativas (N)", con N = todas las iniciativas del objetivo, incluidas las canceladas (FR-035). |
| "+" | `Button` `iconOnly` + `FigmaIcon` `addPrimary` + `Tooltip` "Agregar iniciativa" | En `action` de la banda; solo si `canCreate`. |
| Grilla | `IniciativasTable` variante `objetivo` | Con Peso solo para la VP RRII. |
| Vacío | `emptyText` | "Este objetivo no tiene iniciativas cargadas." |

### Elementos sin componente en el Design System

- **Paginador**: no existe. Se arma con `Button` y `FigmaIcon` del DS, aprobado por la usuaria el 2026-11-18 (U2). Ver D21 y Complexity Tracking.

**Imágenes e íconos**: `FigmaIcon` `list`, `add`, `addPrimary`, `editPrimary`, `chevronCirclePrimary`, `chevronRightPrimary`, `arrowCircle` (ya usados en la app). No hay imágenes nuevas.

### Aproximaciones (a confirmar en la revisión visual)

| # | Elemento | Resolución | Motivo |
|---|---|---|---|
| A1 | Chip de estado | No iniciada `neutral`, En curso `brand`, Frenada `danger`, Finalizada `success`, Cancelada `secondary` | El DS no tiene violeta para Cancelada. |
| A2 | Error de Accountable y de las fechas | `span` de una línea bajo el `Picker`, con los tokens del error de `ObjetivoForm` | `Picker` no tiene `errorMessage` (igual que A2 de la 003). |
| A3 | Botón "Cambiar estado" del pie | `Button` `primary` con el color de la escala Secondary del DS | El prototipo lo muestra con otro estilo que Editar (`fbSec`). |
| A4 | Botones primera y última página | Dos `chevronRight` juntos (espejados para "primera") | No hay ícono de doble flecha (U2). |

## Decisiones

**D1. Capa de datos y mocks.** Se usan `useIniciativaDataSource`, `useComentarioIniciativaDataSource`, `useAreaDataSource`, `useUsuarioDataSource`, `useObjetivoDataSource` y `useDepartamentoDataSource`. Cada hook nuevo pasa su mock como segundo argumento de `useDatasource`. Los mocks guardan el estado a nivel de módulo, como `ObjetivoMock`, y usan los Id de `ObjetivoMock`, `DepartamentoMock` y `GerenciaMock`. Tienen que cubrir:

- `IniciativaMock`: un objetivo de la VP RRII con 3 iniciativas no canceladas (pesos no exactos) y otro con 4 no canceladas y 1 cancelada; una iniciativa de un objetivo de otra VP; un objetivo de la VP RRII sin peso en el departamento (para "—"); iniciativas con fechas en un solo año y en varios años; más de 10 iniciativas en total (paginado); iniciativas del usuario de prueba y de otros; varias con dos accountable y con dos áreas. `getFilteredItems(objetivoId)` filtra por objetivo. `getById` de un Id inexistente rechaza con `status: 404`.
- `ComentarioIniciativaMock`: una iniciativa con dos comentarios (para el historial) y otra sin comentarios. `getFilteredItems(iniciativaId)` devuelve los de esa iniciativa, del más nuevo al más viejo. `add` asigna `Created` = ahora y `Author` = usuario de prueba.
- `AreaMock`: áreas de más de una gerencia.
- `UsuarioMock`: usuarios activos e inactivos; `getCurrentUser` devuelve el usuario de prueba, que es accountable de algunas iniciativas.

**D2. Title.** `Iniciativa.toListItem` envía `Title: this.Nombre` (FR-009), como `Objetivo` y `Palanca`.

**D3. Áreas múltiples.** `Iniciativa.Area` pasa a `ILookupValue[]`: se lee con `toLookupValueArray` y se escribe `AreaId: toLookupIds(this.Area)`. `toLookupIds` se agrega en `Mappers.ts`, con el mismo contrato que `toPersonIds`. Al editar, el panel siempre arma la lista (vacía si no hay áreas), así que quitar todas las áreas envía `[]` y borra el valor. El `select` y el `expand` del datasource no cambian: `Area/Id` y `Area/Title` sirven igual para un lookup múltiple. Los nombres que se muestran salen del maestro `Area` por Id (como `useObjetivoNames`), porque el `Title` del lookup puede no ser el `Nombre`.

**D4. Accountable en SharePoint.** Se sigue escribiendo `ResponsablesId: toPersonIds(this.Responsables)`. Los Id son los de usuario del sitio, los mismos que trae la persona `Usuario` de la lista `Usuario` y `sp.web.currentUser`.

**D5. Usuario actual.** `IUsuarioDataSource.getCurrentUser(): Promise<IPersonValue>`; `UsuarioDataSource` lo implementa con `this._sp.web.currentUser.select('Id', 'Title', 'Email')()`, devolviendo `{ Id, Title, EMail: Email }`. Hook nuevo `core/api/Usuario/useCurrentUser.ts`: elige datasource o mock con el mismo criterio que `useDatasource`, consulta una vez al montar y devuelve `{ user, error }`. Se justifica un hook propio porque `useDatasource` solo expone el CRUD.

**D5a. Identificación del usuario actual.** El usuario actual se compara con los accountable **por el Id de usuario del sitio** (`IPersonValue.Id`), nunca por el nombre que se muestra (`Title`):

- "Mis iniciativas": `isAccountable(iniciativa, currentUser.Id)` = algún `Responsables[i].Id === currentUser.Id`.
- Accountable por defecto en el alta: se busca en las opciones del `Picker` la clave `String(currentUser.Id)`; si no está, se agrega el usuario actual como opción (D7).
- El Id es un identificador único dentro del sitio y es el mismo valor en los tres orígenes: `sp.web.currentUser`, la columna `Responsables` (que se escribe con `ResponsablesId`) y la persona `Usuario` de la lista `Usuario`. Se elige frente al email porque es lo que guarda la columna y porque el email puede venir vacío en algunas cuentas y no distingue mayúsculas de forma consistente; frente al login, porque no hace falta sumar `Name` al `select`.

**D6. Rutas y acceso desde la home.** Ver [contracts](./contracts/ui-contracts.md#1-rutas-componentsobjetivosvproutests). La solapa vive en la URL (`?vista=todas`; sin el parámetro, "Mis iniciativas"), así el acceso de la home siempre abre "Mis iniciativas" (FR-015) y Volver desde el detalle vuelve a la solapa de origen. Cambiar de solapa usa `setSearchParams` con `replace`.

**D7. Campo Accountable.** `Picker` `mode="people"`:

- `people`: los usuarios de la lista `Usuario` con `Activo === true`, más los accountable actuales de la iniciativa que se edita y el usuario actual, aunque no estén en la lista o estén inactivos (U1). Clave = `String(Usuario.Id)`, nombre = `Usuario.Title`. Sin duplicados por Id; ordenados por nombre.
- Alta: arranca con el usuario actual (FR-010). Si `useCurrentUser` falla, arranca vacío y el campo es obligatorio.
- Edición: arranca con `iniciativa.Responsables`.
- Al guardar, `Responsables` se arma con los elegidos (`Id`, `Title`, `EMail`).

**D8. Estado de la bandeja.** La búsqueda, los filtros aplicados y la página viven en `ObjetivosVpRoutes` y bajan por props, como el filtro de palancas (D4 de la 003): se conservan al ir al detalle y volver, y al cambiar de solapa (US3, escenario 6). La página vuelve a 1 cuando cambia la solapa, la búsqueda o los filtros; si queda fuera de rango, se lleva a la última (edge case "página vacía").

**D9. Formato del ID.** `INI-<Id con dos dígitos>` (`INI-01`), como el prototipo, en `formatIniciativaId`.

**D10. Origen y Volver (FR-033a).** Bandeja y detalle del objetivo navegan al detalle con `state.from`. En el detalle, Volver y Cancelar van a `state.from` si existe; si no, al detalle del objetivo de la iniciativa (`getObjetivoPath`). Las migas navegan siempre a su nivel, sin `from`.

**D11. Migas.** `PalancaBreadcrumb` suma `objetivoId?` e `iniciativaNombre?`. Con `iniciativaNombre`: Inicio › Palancas › [palanca, enlace, solo VP RRII] › [objetivo, enlace a `getObjetivoPath(objetivoId)`] › [iniciativa, sin enlace]. Para un objetivo de otra VP, el detalle no pasa `palancaNombre` y se omite el nivel de palanca (FR-031). Sin `iniciativaNombre`, igual que hoy.

**D12. Pesos.** En `iniciativaUtils.ts`:

- `getPesosIniciativa(iniciativa, delObjetivo, objetivo)`: si `objetivo` no es de la VP RRII (`isVpRrii`) o la iniciativa está Cancelada, devuelve `{}`. Si no, `n` = iniciativas de `delObjetivo` no canceladas; `enObjetivo = 100 / n`; `enDepartamento = objetivo.Peso === undefined || objetivo.Peso === null ? null : objetivo.Peso / n`.
- `objetivo.Peso / n` es algebraicamente igual a `(100 / n) × Peso / 100` y evita redondear un resultado intermedio: se calcula con el peso exacto en el objetivo (spec, Clarifications 2026-11-18).
- `formatPeso(valor)` = `valor.toLocaleString('es-AR', { maximumFractionDigits: 2 })`. Solo se redondea al mostrar. Ejemplos: 20, 33,33, 13,33, 10.
- Formato con unidad: tabla `${formatPeso(x)}%` y detalle `${formatPeso(x)} %` (H6 de la 005). Peso en el departamento `null` → `ObjetivoNoValue` ("—").
- Precisión: el único error posible es el de punto flotante de una división, muy por debajo de los dos decimales que se muestran. No se compara ningún resultado con `===`.

**D13. Filtros.** `IniciativasFiltros` guarda un borrador; la grilla no cambia hasta "Aplicar" (US3, escenario 8).

- Aplicar: copia el borrador a los filtros aplicados y cierra el panel.
- Limpiar filtros: deja todos en "Todos", aplica y cierra el panel (US3, escenario 9).
- Cerrar el panel con la X descarta el borrador.
- Opciones: Departamento = maestro `Departamento` por `Nombre`; Objetivo = objetivos "OBJ-nn · nombre" por Id; Accountable = accountable de todas las iniciativas cargadas, sin duplicados, por nombre; Estado = los cinco; Año = de `min(año de FechaInicio)` a `max(año de FechaCompromiso)` de todas las iniciativas, sin huecos (U3).
- Reglas: Departamento compara `objetivo.Departamento.Id`; Objetivo, `iniciativa.Objetivo.Id`; Accountable, algún `Responsables[i].Id`; Estado, `iniciativa.Estado`; Año, `getAniosIniciativa` (FR-020).
- La búsqueda compara `formatIniciativaId(id)` y `Nombre` en minúsculas con el texto recortado (FR-019).

**D14. Contadores y vacíos de la bandeja.**

- Solapas: "Mis iniciativas" = iniciativas donde el usuario actual es accountable; "Todas" = todas. Sin búsqueda ni filtros (FR-017).
- "N iniciativas en esta vista" = la solapa con búsqueda y filtros.
- Orden de la grilla: por Id ascendente.
- Vacíos: si la solapa no tiene iniciativas, "No hay iniciativas cargadas."; si las tiene pero la búsqueda o los filtros no dejan ninguna, "No hay iniciativas con estos filtros." (FR-022).
- Si `useCurrentUser` falla, la solapa "Mis iniciativas" queda vacía y se muestra el error de carga.

**D15. Panel de cargar y editar.**

- Los maestros (objetivos, áreas, usuarios, usuario actual) se cargan con `useIniciativaFormMasters`, como `useObjetivoFormMasters`.
- Validación al elegir "Cargar iniciativa" o "Guardar cambios" (D14 de la 003): obligatorios recortando espacios, compromiso no anterior al inicio, fechas dentro de las del objetivo elegido si las tiene (FR-004). Los errores se limpian cuando el campo deja de ser inválido. Si hay dos errores de fecha en el mismo campo, se muestra el de obligatorio, después el de orden y por último el de rango.
- Si todo es válido, se abre `ConfirmacionModal` (FR-025). Cancelar en el modal lo cierra y conserva lo ingresado. Aceptar guarda: alta con `addItem` y `Estado = No iniciada` (FR-005); edición con `editItem`, con el `Objetivo` original.
- Si falla, se cierra el modal, el panel muestra `IniciativaSaveError` y conserva lo ingresado. Si sale bien, se llama `onSaved`, que cierra el panel, muestra el mensaje de éxito y recarga la lista de la pantalla de origen (FR-026).
- `initialObjetivoId` preselecciona el objetivo en el alta desde el detalle del objetivo (FR-027); se puede cambiar.

**D16. Cambiar estado (FR-028 a FR-030).**

- El panel arranca con el estado actual y el texto del último comentario.
- Al elegir "Cambiar estado" se abre el modal con `IniciativaConfirmStatus` (estado actual y estado elegido; pueden ser iguales).
- Al aceptar:
  1. Si el comentario, recortado, no está vacío y es distinto del último, se registra un `ComentarioIniciativa` nuevo.
  2. Si el estado cambió, se edita la iniciativa con el estado nuevo.
  3. Se recargan iniciativa y comentarios, y se cierra el panel.
- Orden: primero el comentario y después el estado. Si falla el estado, el reintento ve el comentario ya guardado como el último y no lo repite.
- Un comentario vacío o solo con espacios no se registra: queda el anterior.
- Si no cambió nada, Aceptar cierra el panel sin escribir.
- Si se registró algo, el detalle muestra «El estado de la iniciativa "[nombre]" se ha actualizado correctamente.» (`IniciativaStatusUpdated`) con su `SuccessNotice` (FR-029, como el prototipo v10). Si no cambió nada, no hay mensaje.
- Error: `IniciativaStatusSaveError`; el panel conserva lo ingresado.

**D17. Confirmación.** `ConfirmacionModal` envuelve `Modal` del DS y siempre le pasa Cancelar y Aceptar. Títulos del prototipo: "Cargar iniciativa" (alta), "Guardar cambios" (edición) y "Cambiar estado". Mientras guarda, Aceptar queda deshabilitado.

**D18. Permisos (FR-036, FR-037).** `CAN_CREATE_INICIATIVA` controla "Cargar iniciativa" de la bandeja y el "+" del detalle del objetivo; `CAN_EDIT_INICIATIVA`, Editar y el lápiz de "Información de la iniciativa"; `CAN_CHANGE_ESTADO_INICIATIVA`, "Cambiar estado" y el lápiz de "Comentario ejecutivo". Las tres en `true` en `ObjetivosVp.tsx`. Los pesos se muestran a todos (FR-014c).

**D19. Secciones del detalle.** `SectionBand` suma `defaultCollapsed?: boolean`, que inicializa el estado abierto. "Información de la iniciativa" arranca expandida y "Comentario ejecutivo" contraída (FR-032). El resto de los usos no cambia.

**D20. Datos del detalle.** Se cargan iniciativas (`getItems`), objetivos, áreas y los comentarios de la iniciativa (`useComentariosIniciativa`, D24). La iniciativa es la del Id de la ruta; si las iniciativas cargaron y no está, se muestra `IniciativaNotFound`. El objetivo sale de la lista de objetivos por `Iniciativa.Objetivo.Id`; los pesos usan las iniciativas del mismo objetivo; el último comentario, el primero que devuelve `useComentariosIniciativa` (`getUltimoComentario` lo confirma por `Created` y `Id`).

**D21. Paginador (FR-021).** `IniciativasPaginador` dentro de la carpeta de la bandeja:

- Se muestra solo si el total supera 10 (`PAGE_SIZE = 10`, constante local).
- A la izquierda, "Mostrando X–Y de N"; centrados, primera, anterior, un botón por página, siguiente y última, todos `Button` del DS con `aria-label`.
- Anterior y siguiente usan `chevronRightPrimary`, espejado con CSS para anterior; primera y última, dos íconos juntos (A4).
- La página actual usa `variant="primary"` y `aria-current="page"`. Primera y anterior se deshabilitan en la página 1, y siguiente y última en la última.
- Fijo al pie, con los estilos de `DetailFooter`; la bandeja agrega margen inferior para que no tape la última fila.

**D22. Sección Iniciativas del detalle del objetivo (FR-035).** `ObjetivoIniciativas` carga las iniciativas y muestra las del objetivo. El título es "Iniciativas (N)" (`ObjetivoInitiativesSection` con `{0}`), con N = todas las iniciativas del objetivo, incluidas las canceladas, como `od.nIni` del prototipo v10. El "+" abre `IniciativaFormPanel` con `initialObjetivoId`. Al guardar, recarga la lista (pesos recalculados), cierra el panel y avisa a `ObjetivoDetalle` para mostrar `IniciativaCreated` con su `SuccessNotice`. "Ver" navega al detalle con `state.from`.

**D23. Errores.** Una línea con `MessageBar`, sin el error técnico (FR-039). Los errores de carga no muestran contadores ni grillas parciales. El registro de errores queda en `useDatasource`, que ya lo hace; las pantallas no vuelven a registrarlos.

**D24. Comentarios de una iniciativa.** Se traen solo los de la iniciativa que se ve, filtrando en la consulta:

- `IComentarioIniciativaDataSource.getFilteredItems(iniciativaId: number): Promise<ComentarioIniciativa[]>`, con el filtro `IniciativaId eq <id>` y `.orderBy('Created', false).orderBy('Id', false)`, igual que `IniciativaDataSource.getFilteredItems`. El mock lo implementa.
- Hook nuevo `core/api/ComentarioIniciativa/useComentariosIniciativa.ts`: recibe el Id, elige datasource o mock con el mismo criterio que `useDatasource`, consulta al montar y cuando cambia el Id, y devuelve `{ items, isLoading, error, reload }`. Hace falta un hook propio porque `useDatasource` no expone consultas filtradas.
- Para registrar un comentario se sigue usando `addItem` de `useComentarioIniciativaDataSource`; después se llama `reload`.
- La bandeja y el detalle del objetivo no cargan comentarios.
- **P1. Índice.** La columna `Iniciativa` (lookup) de la lista `Comentario iniciativa` tiene que estar indexada, para que el filtro no dependa del umbral de vista de lista (5000 elementos). Crear el índice cambia la configuración de la lista: lo hace la usuaria, en cada sitio, antes de probar con SharePoint (pasos en [quickstart.md](./quickstart.md)). El agente no lo crea.

## Estructura de carpetas

```text
specs/004-iniciativas/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-contracts.md
├── checklists/requirements.md
└── tasks.md                                   # lo genera /speckit-tasks

src/core/
├── utils/Mappers.ts                           # + toLookupIds (D3)
├── entities/Iniciativa.ts                     # Title = Nombre; Area múltiple (D2, D3)
└── api/
    ├── Iniciativa/{IniciativaMock.ts, useIniciativaDataSource.ts}                         # mock nuevo; hook lo pasa
    ├── ComentarioIniciativa/
    │   ├── IComentarioIniciativaDataSource.ts, ComentarioIniciativaDataSource.ts   # + getFilteredItems (D24)
    │   ├── ComentarioIniciativaMock.ts                                             # nuevo
    │   ├── useComentarioIniciativaDataSource.ts                                    # pasa el mock
    │   └── useComentariosIniciativa.ts                                             # nuevo (D24)
    ├── Area/{AreaMock.ts, useAreaDataSource.ts}
    └── Usuario/
        ├── IUsuarioDataSource.ts, UsuarioDataSource.ts   # + getCurrentUser (D5)
        ├── UsuarioMock.ts                                # nuevo
        ├── useUsuarioDataSource.ts                       # pasa el mock
        └── useCurrentUser.ts                             # nuevo (D5)

src/webparts/objetivosVp/
├── loc/{en-us.js, mystrings.d.ts}             # claves nuevas
└── components/
    ├── ObjetivosVp/{ObjetivosVp.tsx, routes.ts}         # rutas, estado de la bandeja, permisos (D6, D8, D18)
    ├── Home/AccessList/AccessList.tsx                   # ruta de "Mis iniciativas"
    ├── Palanca/PalancaBreadcrumb/PalancaBreadcrumb.tsx  # ampliado (D11)
    ├── shared/SectionBand/SectionBand.tsx               # + defaultCollapsed (D19)
    ├── Objetivo/ObjetivoDetalle/
    │   ├── ObjetivoDetalle.tsx                          # + sección Iniciativas y aviso
    │   └── ObjetivoIniciativas/ObjetivoIniciativas.tsx  # nuevo (D22)
    └── Iniciativa/
        ├── iniciativaUtils.ts                           # ID, chip, pesos, filtros, años, último comentario
        ├── IniciativasTable/{IniciativasTable.tsx, IniciativasTable.module.scss}
        ├── ConfirmacionModal/ConfirmacionModal.tsx
        ├── IniciativasBandeja/
        │   ├── IniciativasBandeja.tsx, IniciativasBandeja.module.scss
        │   ├── IniciativasHeader/{IniciativasHeader.tsx, IniciativasHeader.module.scss}
        │   ├── IniciativasFiltros/IniciativasFiltros.tsx
        │   └── IniciativasPaginador/{IniciativasPaginador.tsx, IniciativasPaginador.module.scss}
        ├── IniciativaForm/
        │   ├── IniciativaFormPanel.tsx
        │   ├── IniciativaForm.tsx
        │   ├── IniciativaForm.module.scss
        │   └── useIniciativaFormMasters.ts
        ├── IniciativaEstadoPanel/IniciativaEstadoPanel.tsx
        └── IniciativaDetalle/
            ├── IniciativaDetalle.tsx, IniciativaDetalle.module.scss
            ├── IniciativaInfo/{IniciativaInfo.tsx, IniciativaInfo.module.scss}
            └── IniciativaComentario/IniciativaComentario.tsx
```

**Structure Decision**: los componentes se agrupan por dominio, como `Palanca/` y `Objetivo/`, con una carpeta por pantalla (`IniciativasBandeja/`, `IniciativaDetalle/`) y las piezas en subcarpetas. `IniciativasTable`, `IniciativaForm`, `IniciativaEstadoPanel` y `ConfirmacionModal` quedan en la raíz de `Iniciativa/` porque los usan la bandeja, el detalle de la iniciativa y el detalle del objetivo. El paginador queda dentro de la bandeja porque es su único uso. La sección del detalle del objetivo vive en `ObjetivoDetalle/`, que es la pantalla que la muestra.

## Orden de implementación

| # | Paso | Depende de |
|---|------|-----------|
| 1 | `Mappers.ts` (`toLookupIds`) e `Iniciativa.ts` (Title, Area múltiple) | — |
| 2 | Mocks y hooks de Iniciativa, ComentarioIniciativa, Area y Usuario; `getCurrentUser` y `useCurrentUser`; `getFilteredItems` de comentarios y `useComentariosIniciativa` | 1 |
| 3 | Claves de texto en `loc/` | — |
| 4 | `iniciativaUtils.ts`, rutas, permisos, `SectionBand` (`defaultCollapsed`), `PalancaBreadcrumb` ampliado | 3 |
| 5 | `IniciativasTable` y `ConfirmacionModal` | 4 |
| 6 | `IniciativaFormPanel`, `IniciativaForm` y `useIniciativaFormMasters`: alta (US1) | 2, 5 |
| 7 | Bandeja: encabezado, solapas, grilla, contador, acceso de la home y alta desde la bandeja (US2) | 2, 5, 6 |
| 8 | Bandeja: búsqueda, panel de filtros y paginador (US3) | 7 |
| 9 | `IniciativaDetalle`, `IniciativaInfo` (con los dos pesos) e `IniciativaComentario` (US4) | 2, 4, 5 |
| 10 | `ObjetivoIniciativas` en el detalle del objetivo (US5) | 5, 6 |
| 11 | Edición desde el detalle (US6) | 6, 9 |
| 12 | `IniciativaEstadoPanel` (US7) | 9 |
| 13 | La usuaria indexa la columna `Iniciativa` de `Comentario iniciativa` (P1) | — |
| 14 | Validación con [quickstart.md](./quickstart.md) | 8, 10, 11, 12, 13 |

## Complexity Tracking

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|-----------|----------------------|-------------------------------------------|
| Paginador compuesto con piezas del DS, sin componente propio en el catálogo (principio II) | FR-021 pide paginado; el DS no tiene paginador. Aprobado por la usuaria el 2026-11-18 (U2), con primera y última página. | Sin paginado: contradice FR-021. Fluent v8 no tiene paginador. |
| "Cambiar estado" como panel lateral, cuando el prototipo usa un modal (principio II) | FR-028 de la spec. | Seguir el prototipo: contradice la spec. |
| Cambios en `core` (`Iniciativa.ts`, `Mappers.ts`, `Usuario`, `ComentarioIniciativa`, hooks) y hooks nuevos `useCurrentUser` y `useComentariosIniciativa` (principio IV) | Title y áreas múltiples (FR-009, FR-011); mocks (principio III); usuario actual para "Mis iniciativas" y Accountable por defecto (FR-010, FR-017); comentarios filtrados en la consulta, pedido de la usuaria el 2026-11-18. | Pasar el contexto de SPFx por props: atraviesa todo el árbol y no tiene mock. Traer todos los comentarios y filtrar en pantalla: crece sin límite y supera el umbral de 5000. |
| Ampliar `PalancaBreadcrumb` y `SectionBand` (principio IV) | FR-031 exige el mismo componente de migas; FR-032 pide una sección contraída al entrar. Props opcionales: los usos actuales no cambian. | Crear otro componente: duplica código. |
| Estilos de campos del panel de iniciativa en su propio `.module.scss`, parecidos a los de `ObjetivoForm.module.scss` | El panel de iniciativa necesita el mismo ancho y el mismo marcado de error. | Extraer los estilos de `ObjetivoForm` a `shared/`: modifica código de la 003 y la 005 que la tarea no necesita tocar. |
| Se mantienen los desvíos de la 003: migas en lugar de "Ubicación en la estrategia", `Breadcrumb` de Fluent, error de fecha bajo `Picker` | FR-031 y FR-038 de la spec. | — |
