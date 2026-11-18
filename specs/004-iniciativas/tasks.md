---

description: "Tareas de implementación de Iniciativas (bandeja, alta, edición, cambio de estado y vista)"
---

# Tasks: Iniciativas (bandeja, alta, edición, cambio de estado y vista)

**Input**: `specs/004-iniciativas/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**:

- las features 003 y 005 completas y compilando (`npm run build` sin errores);
- `npm ci` ejecutado;
- prototipo v10 en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (la carpeta dice v5, el contenido es v10);
- `docs/design-system-catalog.md`;
- en el sitio de desarrollo: columna `Area` de `Iniciativa` con valores múltiples (confirmado) y columna `Iniciativa` de `Comentario iniciativa` indexada (plan, P1; la indexa la usuaria).

**Tests**: no se piden. El repo no tiene runner de pruebas. Se valida con `npm run build`, con los escenarios de `quickstart.md` y comparando con el prototipo.

**Organization**: las tareas se agrupan por historia de usuario. Cada tarea indica el archivo exacto, los componentes del Design System (DS), su **Referencia** en el prototipo y su criterio de terminado. Las dos historias P1 se implementan en este orden: primero US2 (la bandeja) y después US1 (cargar), porque el botón "Cargar iniciativa" vive en la bandeja y sin ella US1 no se puede probar.

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: historia de `spec.md`:
  - US1: cargar una iniciativa;
  - US2: ver y recorrer la bandeja;
  - US3: buscar y filtrar en la bandeja;
  - US4: ver el detalle de una iniciativa;
  - US5: ver las iniciativas en el detalle del objetivo;
  - US6: editar una iniciativa;
  - US7: cambiar el estado y el comentario ejecutivo.

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores, lo que incluye lint y tipos.
- **Referencia al prototipo (constitución II)**, en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`:
  - bandeja: `<sc-if value="{{scr.iniciativas}}">`;
  - panel de filtros: `<sc-if value="{{showFilters}}">`, rama `notAbm`;
  - panel de cargar/editar: `<sc-if value="{{sideIni}}">`;
  - detalle: `<sc-if value="{{scr.iniciativa}}">`, secciones `sec.i_info` y `sec.i_com`;
  - cambiar estado: `<sc-if value="{{m.is.iniUpd}}">` (en esta feature es un panel lateral, no un modal);
  - detalle del objetivo: sección `sec.o_inis` de `<sc-if value="{{scr.objetivo}}">`.
  - **No reproducir**: avance, columna Avance, botón Actualizar, "Ubicación en la estrategia", "Carga parcial", resultados clave, indicadores, tareas, presupuesto, riesgos, el subtítulo "Completá los datos y sus resultados clave", la sección de peso del panel, la nota de objetivos de otra VP, la línea "Probá cambiar o limpiar los filtros." ni el ícono del estado vacío (FR-034, FR-039).
- **Textos**: siempre desde `import * as strings from 'ObjetivosVpWebPartStrings';`. Las plantillas con `{0}`, `{1}` y `{2}` se completan con `Utils.replaceAll`. Ningún texto visible escrito en el código. Se usan las claves de [contracts/ui-contracts.md](./contracts/ui-contracts.md), §5, incluidas las que se reutilizan.
- **`src/core/ui` es de solo lectura.** Imports por capa (`core/ui/components`, `core/ui/patterns`, `core/ui/foundations`), nunca del índice de `core` ni de `core/ui`, con la profundidad de rutas relativa que corresponda al archivo.
- **TypeScript estricto**: sin `any` nuevos, sin comentarios de código y sin literales mágicos (los números van a constantes locales con nombre al inicio del archivo). En `core`, las entidades y datasources ya usan `any` para el item de SharePoint: se sigue ese patrón sin agregar otros.
- **Estilos**: solo tokens del DS (`spacing`, `typography`, `colors`, `getColorStep`). Sin hexadecimales. Cada `.module.scss` nuevo, junto a su componente. No editar ni versionar `*.module.scss.ts`.
- **Hooks de React**: `useEffect` solo para cargar datos al montar o cuando cambia un Id. Lo derivado (listas filtradas, contadores, pesos, errores, opciones) se calcula durante el render, sin `useMemo`.
- **Identidad del usuario**: el usuario actual se compara con los accountable **por `Id`** (`IPersonValue.Id`), nunca por `Title` (plan, D5a).
- **Datos de SharePoint**: no se crean ni modifican listas, columnas, índices ni permisos desde código. Se escribe solo en las listas del sitio de desarrollo, en T039, con autorización. No se versionan URLs del sitio.
- **No modificar** `spec.md` ni `plan.md`. Si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo.

## Path Conventions

- Raíz del webpart: `src/webparts/objetivosVp/`. Las piezas nuevas van en `components/Iniciativa/` (estructura completa en plan, "Estructura de carpetas").
- `core`: `src/core/utils/Mappers.ts`, `src/core/entities/Iniciativa.ts` y `src/core/api/{Iniciativa, ComentarioIniciativa, Area, Usuario, Objetivo}/`.
- Rutas de import de `core` desde `components/Iniciativa/<Pantalla>/<Archivo>.tsx`: `'../../../../../core/...'` (igual que `components/Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx`).

---

## Phase 1: Setup

- [X] T001 Verificar las precondiciones, sin código. Registrar el resultado en el mensaje de la tarea, sin tocar archivos:
  1. `npm run build` pasa antes de empezar.
  2. La columna `Area` de la lista `Iniciativa` admite varios valores y su nombre interno es `Area` (confirmado por la usuaria el 2026-11-18: solo se registra).
  3. La columna `Iniciativa` de la lista `Comentario iniciativa` está indexada (plan, P1). Si no se puede verificar o no lo está, informarlo: las fases 2 a 9 se avanzan con mocks, pero la validación en SharePoint (T039) espera a que la usuaria cree el índice (quickstart, "Índice de la columna Iniciativa").

  **Criterio de terminado**: el build da verde y los puntos 2 y 3 quedan confirmados o informados.

  **Estado**: build base OK. Punto 2 confirmado por la usuaria. Punto 3 informado, no verificado: la sesión no tiene acceso al sitio de desarrollo (queda en T038).

---

## Phase 2: Foundational (bloquea todas las historias)

**Propósito**: datos, mocks, usuario actual, textos, rutas y piezas compartidas.

- [X] T002 [P] Modificar `src/core/utils/Mappers.ts` (plan, D3): agregar, debajo de `toLookupValueArray`,

  ```ts
  export function toLookupIds(values: ILookupValue[] | undefined): number[] | undefined
  ```

  con el mismo cuerpo que `toPersonIds` (`undefined` si recibe `undefined`; si no, `values.map(value => value.Id)`). No cambiar nada más.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T003 Modificar `src/core/entities/Iniciativa.ts` (plan, D2 y D3; contracts §2). Depende de T002.
  - `mapItem`: `this.Area = toLookupValueArray(item.Area);`.
  - `toListItem`: agregar `Title: this.Nombre,` antes de `Nombre` y cambiar `AreaId: this.Area?.Id` por `AreaId: toLookupIds(this.Area)`.
  - Declaración: `public Area?: ILookupValue[] | undefined;`.
  - Agregar `toLookupIds` al import de `../utils/Mappers`. Lo demás (`Responsables`, `Peso`, `Estado`, fechas) no cambia.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T004 [P] Modificar `src/webparts/objetivosVp/loc/mystrings.d.ts` y `src/webparts/objetivosVp/loc/en-us.js`: agregar **todas** las claves nuevas de [contracts/ui-contracts.md](./contracts/ui-contracts.md), §5 (tabla "Claves nuevas"), con los textos exactos de esa tabla. En `mystrings.d.ts`, cada una como `string`, debajo de las claves `Objetivo*`. No cambiar claves existentes. `en-us.js` es el único archivo de idioma: no crear otros.

  **Criterio de terminado**: las claves están en los dos archivos y `npm run build` sin errores.

- [X] T005 [P] Modificar `src/core/api/Objetivo/ObjetivoMock.ts` (plan, D1: hace falta un objetivo de la VP RRII sin peso en el departamento):
  - En `createRrii`, cambiar el tipo del parámetro `peso` a `number | undefined`.
  - Agregar al final de `objetivos`: `createRrii(7, 'Ordenar el portfolio de marcas', 'Objetivo cargado antes de los pesos por departamento.', FIDELIZACION, { Id: 5, Title: 'Programas' }, { Id: 4, Title: 'Marca y portfolio' }, Duracion.Anual, undefined, false, '2026-01-01', '2026-12-31', Estado.EnCurso, undefined, undefined)`.
  - Los objetivos 1 a 6 no cambian.

  **Criterio de terminado**: `npm run build` sin errores; la grilla de palancas muestra el objetivo 7 con la columna Peso vacía.

- [X] T006 Crear `src/core/api/Iniciativa/IniciativaMock.ts` y modificar `src/core/api/Iniciativa/useIniciativaDataSource.ts` (plan, D1). Depende de T003 y T005.
  - El mock implementa `IIniciativaDataSource` con el mismo patrón que `ObjetivoMock`: estado a nivel de módulo, `listTitle = Lista.Iniciativa`, `getItems` devuelve una copia, `getFilteredItems(objetivoId)` filtra por `Objetivo.Id`, `add` asigna el siguiente Id, `edit` rechaza con `status: 404` si no existe, `getById` rechaza con `status: 404` si no existe, `delete` filtra.
  - Constantes locales para personas: `USUARIO_PRUEBA = { Id: 10, Title: 'Usuario de prueba', EMail: 'usuario.prueba@ejemplo.com' }`, `BARBARA = { Id: 11, Title: 'Bárbara Adán', EMail: 'barbara.adan@ejemplo.com' }`, `MARIA = { Id: 12, Title: 'María Martha Grotz', EMail: 'maria.grotz@ejemplo.com' }` (los mismos de T008). Áreas: los Id 1 a 4 de T007.
  - Datos (función local `createIniciativa(id, nombre, objetivo, responsables, areas, estado, fechaInicio, fechaCompromiso)` que arma `new Iniciativa({ Id, Title: nombre, Nombre: nombre, Descripcion, Objetivo, Responsables, Area, Estado, FechaInicio, FechaCompromiso })`):

    | Id | Objetivo (Id) | Accountable | Áreas | Estado | Fechas |
    |---|---|---|---|---|---|
    | 1 | 1 | Usuario de prueba, Bárbara | 1, 2 | En curso | 2026-01-15 a 2026-06-30 |
    | 2 | 1 | Bárbara | 1 | No iniciada | 2026-03-01 a 2026-12-31 |
    | 3 | 1 | María | — | Frenada | 2026-02-01 a 2026-09-30 |
    | 4 | 2 | Usuario de prueba, María | 2, 3 | En curso | 2026-01-01 a 2027-12-31 |
    | 5 | 2 | Bárbara | 3 | En curso | 2026-04-01 a 2027-06-30 |
    | 6 | 2 | María | — | Finalizada | 2026-01-01 a 2026-06-30 |
    | 7 | 2 | Bárbara | 2 | No iniciada | 2027-01-01 a 2027-12-31 |
    | 8 | 2 | María | — | Cancelada | 2026-01-01 a 2026-12-31 |
    | 9 | 3 | Usuario de prueba | 3 | En curso | 2026-03-01 a 2026-12-31 |
    | 10 | 3 | Bárbara | — | No iniciada | 2026-05-01 a 2026-11-30 |
    | 11 | 5 | Usuario de prueba | 4 | En curso | 2026-01-01 a 2028-12-31 |
    | 12 | 6 | María | 4 | Frenada | 2026-02-01 a 2026-10-31 |
    | 13 | 7 | Bárbara | 1 | En curso | 2026-02-01 a 2026-11-30 |

    Nombres y descripciones breves en español; los `Objetivo.Title` son los nombres de `ObjetivoMock`.
  - En el hook, pasar `new IniciativaMock()` como segundo argumento de `useDatasource`, igual que `useObjetivoDataSource`.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T007 [P] Crear `src/core/api/Area/AreaMock.ts` y modificar `src/core/api/Area/useAreaDataSource.ts` (plan, D1). Mock que implementa `IAreaDataSource` con el patrón de `DepartamentoMock`; datos: `1 Análisis de mercado` (gerencia 1 B2B), `2 Canal digital` (gerencia 2 B2C), `3 Promociones` (gerencia 3 Growth), `4 Gestión de convenios` (gerencia 4 Convenios). El hook pasa el mock como segundo argumento.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T008 [P] Usuario actual en `core` (plan, D5; contracts §2):
  - `src/core/api/Usuario/IUsuarioDataSource.ts`: agregar `getCurrentUser(): Promise<IPersonValue>;` (import de `IPersonValue` desde `../../utils/Mappers`).
  - `src/core/api/Usuario/UsuarioDataSource.ts`: implementarlo con `this._sp.web.currentUser.select('Id', 'Title', 'Email')()` y devolver `{ Id: user.Id, Title: user.Title ?? '', EMail: user.Email ?? '' }`.
  - Crear `src/core/api/Usuario/UsuarioMock.ts` (patrón de `DepartamentoMock`, `listTitle = Lista.Usuario`). Datos: `Usuario` 1 con persona `{ Id: 10, Title: 'Usuario de prueba', ... }` activo; 2 con Bárbara (Id 11) activa; 3 con María (Id 12) activa; 4 con `{ Id: 13, Title: 'Usuario inactivo', ... }` inactivo. `getCurrentUser` devuelve la persona Id 10. Mismas constantes de persona que T006.
  - `src/core/api/Usuario/useUsuarioDataSource.ts`: pasar `new UsuarioMock()` como segundo argumento.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T009 Crear `src/core/api/Usuario/useCurrentUser.ts` (plan, D5; contracts §2). Depende de T008.
  - Exporta `ICurrentUserState { user?: IPersonValue; error: boolean }` y `useCurrentUser(): ICurrentUserState` (default export, como los demás hooks).
  - Elige `new UsuarioDataSource()` o `new UsuarioMock()` con el mismo criterio que `useDatasource` (`Environment.type === EnvironmentType.SharePoint` y `listTitle` no vacío).
  - Un `useEffect` con `[]` llama `getCurrentUser()` y guarda el resultado en `useState`; en el `catch`, `console.error` con un mensaje que diga que no se pudo obtener el usuario actual (sin datos personales) y `error = true`.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T010 [P] Comentarios filtrados en `core` (plan, D24; contracts §2):
  - `src/core/api/ComentarioIniciativa/IComentarioIniciativaDataSource.ts`: agregar `getFilteredItems(iniciativaId: number): Promise<ComentarioIniciativa[]>;`.
  - `src/core/api/ComentarioIniciativa/ComentarioIniciativaDataSource.ts`: implementarlo como `getFilteredItems` de `IniciativaDataSource`, con el filtro `IniciativaId eq <id>` en `.filter(...)`, `.orderBy('Created', false)`, `.orderBy('Id', false)` y `.top(TOP_DEFAULT)`.
  - Crear `src/core/api/ComentarioIniciativa/ComentarioIniciativaMock.ts`: implementa la interfaz; datos: iniciativa 1 con dos comentarios ("Arrancamos con la definición del alcance.", 2026-02-01, autor María Id 12; "Se acordó el calendario con las áreas.", 2026-03-10, autor Usuario de prueba Id 10) e iniciativa 4 con uno ("Primera etapa en curso.", 2026-02-15, Bárbara Id 11). `getFilteredItems` devuelve los de esa iniciativa del más nuevo al más viejo. `add` asigna el siguiente Id, `Created = new Date()` y `Author` = persona Id 10.
  - `src/core/api/ComentarioIniciativa/useComentarioIniciativaDataSource.ts`: pasar el mock como segundo argumento.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T011 Crear `src/core/api/ComentarioIniciativa/useComentariosIniciativa.ts` (plan, D24; contracts §2). Depende de T010.
  - `useComentariosIniciativa(iniciativaId: number | undefined): IComentariosIniciativaState` con `{ items, isLoading, error, reload }`.
  - Elige datasource o mock como T009. `reload` llama `getFilteredItems(iniciativaId)` si el Id está definido; guarda `items` o pone `error` y hace `console.error` con un mensaje que nombre la operación ("no se pudieron cargar los comentarios de la iniciativa") y el error original.
  - Un `useEffect` con `[iniciativaId]` llama `reload`.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T012 Crear `src/webparts/objetivosVp/components/Iniciativa/iniciativaUtils.ts` (plan, D9, D12, D13, D14; contracts §3). Depende de T003.
  - `IniciativasVista`, `IIniciativasFiltros`, `EMPTY_FILTROS` (todos `''`), `IIniciativaPesos`.
  - `formatIniciativaId`: prefijo `'INI-'` y Id con `padStart(2, '0')`, como `formatObjetivoId`.
  - `getEstadoIniciativaChipColor`: No iniciada `neutral`, En curso `brand`, Frenada `danger`, Finalizada `success`, Cancelada `secondary` (plan, A1).
  - `getPesosIniciativa(iniciativa, delObjetivo, objetivo)`: si `!isVpRrii(objetivo?.VP?.Title)` o `iniciativa.Estado === EstadoIniciativa.Cancelada`, `{}`. Si no, `n` = `delObjetivo` no canceladas; `enObjetivo = 100 / n`; `enDepartamento = objetivo.Peso === undefined || objetivo.Peso === null ? null : objetivo.Peso / n`. **Calcular `Peso / n` directamente, sin redondear `100 / n` antes** (spec, FR-014a).
  - `formatPeso(valor)`: `valor.toLocaleString('es-AR', { maximumFractionDigits: 2 })`.
  - `formatAccountable`: `Title` de `Responsables` unidos por `', '`.
  - `isAccountable(iniciativa, userId)`: `userId !== undefined && Responsables.some(r => r.Id === userId)`. **Por Id, nunca por `Title`.**
  - `getAniosIniciativa`: años desde `FechaInicio.getFullYear()` hasta `FechaCompromiso.getFullYear()`, incluidos; `[]` si falta alguna fecha.
  - `getUltimoComentario(comentarios, iniciativaId)`: de los de esa iniciativa, el de mayor `Created`; ante igualdad, el de mayor `Id`.
  - Constantes locales con nombre para `'INI-'`, `2`, `100`, `'es-AR'` y `', '`. Importar `isVpRrii` de `../Objetivo/objetivoUtils`.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T013 [P] Modificar `src/webparts/objetivosVp/components/ObjetivosVp/routes.ts` (plan, D6; contracts §1): agregar `INICIATIVAS_PATH`, `INICIATIVA_DETAIL_PATH`, `INICIATIVAS_VISTA_PARAM`, `INICIATIVAS_VISTA_TODAS` y `getIniciativaPath` con los valores de contracts §1. No cambiar las existentes.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T014 [P] Modificar `src/webparts/objetivosVp/components/shared/SectionBand/SectionBand.tsx` (plan, D19): prop opcional `defaultCollapsed?: boolean`; el estado arranca en `!defaultCollapsed` en lugar de `true`. Nada más cambia; los usos actuales no pasan la prop.

  **Criterio de terminado**: `npm run build` sin errores; los detalles de palanca y objetivo se ven igual.

- [X] T015 [P] Modificar `src/webparts/objetivosVp/components/Palanca/PalancaBreadcrumb/PalancaBreadcrumb.tsx` (plan, D11; contracts §4):
  - Props opcionales nuevas `objetivoId?: number` e `iniciativaNombre?: string`.
  - Si hay `iniciativaNombre` y `objetivoNombre`: Inicio › Palancas › [palanca, enlace, solo si hay `palancaNombre` y `palancaId`] › [objetivo, enlace a `getObjetivoPath(objetivoId)` si hay `objetivoId`] › [iniciativa, `isCurrentItem`].
  - Sin `iniciativaNombre`: exactamente como hoy.

  **Criterio de terminado**: `npm run build` sin errores; las migas de palanca y objetivo no cambian.

- [X] T016 Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativasTable/IniciativasTable.tsx` y `IniciativasTable.module.scss` (plan, mapeo "Bandeja" y "Detalle del objetivo"; contracts §3). Depende de T004 y T012. **Referencia**: grillas `c-ib` (bandeja) y `c-oiP` / `c-oi` (detalle del objetivo).
  - Mismo patrón que `ObjetivosTable`: `Table` del DS, filas ordenadas por Id ascendente, `getRowKey` por ID.
  - Columnas por variante: tabla de contracts §3. Encabezados: `ObjetivoColumnId`, `IniciativaColumnName`, `ObjetivoColumnName`, `IniciativaAccountable`, `ObjetivoColumnWeight`, `ObjetivoColumnStatus`, `ObjetivoColumnView`.
  - Objetivo (bandeja): `${formatObjetivoId(o.Id)} · ${o.Nombre}` con el objetivo de `objetivos` por `Iniciativa.Objetivo.Id`; si no está, el `Title` del lookup.
  - Peso (variante `objetivo`, solo si `isVpRrii(objetivo.VP?.Title)`): `getPesosIniciativa(fila, iniciativas, objetivo).enObjetivo`, mostrado como `${formatPeso(x)}%`; vacío si no corresponde.
  - Estado: `Chip` `size="small"` `clickable={false}` con `getEstadoIniciativaChipColor`.
  - Ver: `Button` `iconOnly` `variant="secondary"` `size="small"` con `FigmaIcon` `chevronCirclePrimary`, `Tooltip` `IniciativaViewTooltip`, `aria-label` `IniciativaViewAriaLabel` con el ID; llama `onView(id)`.
  - Anchos fijos como constantes locales, con los mismos valores que `ObjetivosTable` para ID, Estado y Ver.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T017 [P] Crear `src/webparts/objetivosVp/components/Iniciativa/ConfirmacionModal/ConfirmacionModal.tsx` (plan, D17; contracts §3). Depende de T004.
  - `Modal` de `core/ui/patterns` con `open`, `variant="default"`, `title`, `description={message}`, `closeOnOverlayClick={false}`, `onClose={onCancel}`.
  - `secondaryAction`: `Button` `variant="secondary"` `strings.Cancel` → `onCancel`. `primaryAction`: `Button` `variant="primary"` `strings.Accept`, `disabled={isSaving}` → `onAccept`. Siempre se pasan las dos (research, R22).

  **Criterio de terminado**: `npm run build` sin errores.

**Checkpoint**: datos, mocks, usuario actual, textos, rutas y piezas compartidas listos.

---

## Phase 3: User Story 2 - Ver y recorrer la bandeja de iniciativas (Priority: P1) 🎯 MVP

**Goal**: desde la home se llega a la bandeja, con solapas, contadores, grilla y paginado.

**Independent Test**: quickstart, escenarios 1 a 7 (con mocks: el usuario de prueba es accountable de las iniciativas 1, 4, 9 y 11).

- [X] T018 [P] [US2] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativasBandeja/IniciativasHeader/IniciativasHeader.tsx` y `IniciativasHeader.module.scss` (plan, mapeo "Bandeja"; contracts §3). **Referencia**: `lHead` de `scr.iniciativas`.
  - Props de contracts §3. Mismo armado y mismos estilos que `PalancasHeader`, sin el botón Actualizar ni "Nueva palanca".
  - Izquierda: `BackButton` (`onBack`) y `h1` con `HEADER_TITLE_STYLE` (`title`).
  - Derecha: `SearchBox` (placeholder `IniciativasSearchPlaceholder`, `value`, `onValueChange`), `Button` Filtros (`PalancasFilters`, `FigmaIcon` `list`, mismo estilo `FILTER_STYLE` que `PalancasHeader`, `onClick={onOpenFilters}`) y, si `canCreate && onNew`, `Button` "Cargar iniciativa" (`IniciativaNew`, `FigmaIcon` `add`, mismo estilo que "Cargar objetivo").

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T019 [P] [US2] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativasBandeja/IniciativasPaginador/IniciativasPaginador.tsx` y `IniciativasPaginador.module.scss` (plan, D21, A4; contracts §3). **Referencia**: `nav.pager` y estilos `.pager`, `.pgB`, `.pgN`.
  - Props `page`, `pageSize`, `total`, `onPageChange`. No renderiza nada si `total <= pageSize`.
  - `nav` con `aria-label` `IniciativasPagerAriaLabel`. Grilla de tres columnas: a la izquierda "Mostrando X–Y de N" (`IniciativasPageInfo` con `X = (page - 1) * pageSize + 1`, `Y = min(page * pageSize, total)`); al centro los botones.
  - Botones `Button` del DS `iconOnly` `variant="secondary"` `size="small"`, cada uno con `aria-label` (`IniciativasPageFirst`, `IniciativasPagePrevious`, `IniciativasPageNext`, `IniciativasPageLast`) y `Tooltip` con el mismo texto: primera (dos `FigmaIcon` `chevronRightPrimary` espejados con una clase de `transform: scaleX(-1)`), anterior (uno espejado), siguiente (uno), última (dos).
  - Un `Button` por página con el número; la actual `variant="primary"` y `aria-current="page"`, las demás `secondary`; `aria-label` `IniciativasPageNumber`.
  - Primera y anterior `disabled` en la página 1; siguiente y última en la última.
  - Fijo al pie: mismas reglas de `DetailFooter.module.scss` (`position: fixed`, bordes y sombra con las variables del DS).

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T020 [US2] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativasBandeja/IniciativasBandeja.tsx` y `IniciativasBandeja.module.scss` (plan, D6, D8, D14, D21; contracts §3). Depende de T006, T009, T012, T013, T016, T018, T019. **Referencia**: `scr.iniciativas`.
  - Props `IIniciativasBandejaProps` (contracts §3). Exportar también `IIniciativasBandejaState`.
  - Datos: `useIniciativaDataSource` y `useObjetivoDataSource` (`getItems` en un `useEffect` con `[]`) y `useCurrentUser`.
  - Vista: `useSearchParams`; `todas` si `INICIATIVAS_VISTA_PARAM` vale `INICIATIVAS_VISTA_TODAS`, si no `mis`. Cambiar de solapa: `setSearchParams` con `{ replace: true }` y `onStateChange({ ...state, page: 1 })`.
  - Listas: `mis` = `isAccountable(i, user?.Id)`; `todas` = todas. Título `IniciativasMine` o `IniciativasAllTitle`.
  - `Tabs` `variant="transparent"`, `ariaLabel` `IniciativasTabsAriaLabel`, ítems `${IniciativasMine} (${nMis})` y `${IniciativasTabAll} (${nTodas})`, con la misma clase de color seleccionado que `Palancas.module.scss`.
  - Contador: `IniciativasCount` con la cantidad de la vista, estilo igual al resumen de `Palancas` (`SUMMARY_STYLE`).
  - Página: `PAGE_SIZE = 10`; la página efectiva es `min(state.page, cantidad de páginas)` (mínimo 1). Grilla con la porción de la página. `IniciativasPaginador` con `onPageChange={(page) => onStateChange({ ...state, page })}`.
  - `IniciativasTable` variante `bandeja` con `objetivos`; `emptyText`: `IniciativasEmpty` si la solapa no tiene iniciativas, si no `IniciativasEmptyFilters` (D14).
  - Ver: `navigate(getIniciativaPath(id), { state: { from: location.pathname + location.search } })` (D10).
  - Carga: `Spinner` mientras cargan iniciativas u objetivos. Si falla alguno de los dos: `MessageBar` `type="error"` `IniciativasLoadError`, sin grilla ni contadores. Si falla solo `useCurrentUser`: se muestra el mismo `MessageBar` arriba de las solapas, "Mis iniciativas" queda en 0 y vacía, y "Todas" funciona normalmente (plan, D14).
  - Volver: `navigate(HOME_PATH)`. En esta tarea, `onOpenFilters` y `onNew` todavía no hacen nada (los conectan T026 y T024).
  - Contenedor con `padding` y un margen inferior suficiente para el paginador fijo (constante con nombre).

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T021 [US2] Conectar la bandeja (plan, D6, D8, D18; contracts §4). Depende de T020.
  - `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`: constantes `CAN_CREATE_INICIATIVA`, `CAN_EDIT_INICIATIVA` y `CAN_CHANGE_ESTADO_INICIATIVA` en `true`; `useState<IIniciativasBandejaState>` con `{ searchText: '', filtros: EMPTY_FILTROS, page: 1 }` en `ObjetivosVpRoutes`; `<Route path={INICIATIVAS_PATH} element={<IniciativasBandeja canCreate={CAN_CREATE_INICIATIVA} state={...} onStateChange={...} />} />`.
  - `src/webparts/objetivosVp/components/Home/AccessList/AccessList.tsx`: el ítem `AccessMyInitiatives` suma `route: INICIATIVAS_PATH`.

  **Criterio de terminado**: `npm run build` sin errores; quickstart, escenarios 1 a 7, con mocks.

**Checkpoint**: la bandeja se ve completa (sin búsqueda, filtros ni alta).

---

## Phase 4: User Story 1 - Cargar una iniciativa (Priority: P1)

**Goal**: cargar una iniciativa desde la bandeja, con validación, confirmación y mensaje de éxito.

**Independent Test**: quickstart, escenarios 16 a 24 (desde la bandeja; el alta desde el objetivo se prueba en US5).

- [X] T022 [P] [US1] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/useIniciativaFormMasters.ts` (plan, D15; contracts §3). Depende de T006, T007, T008, T009. Mismo patrón que `useObjetivoFormMasters`: carga objetivos (`useObjetivoDataSource`), áreas (`useAreaDataSource`) y usuarios (`useUsuarioDataSource`) con `Promise.all` en un `useEffect` con `[]`, y suma `useCurrentUser`. Devuelve `IIniciativaFormMasters`. `ready` cuando terminaron las tres listas; `error` si falla alguna (el usuario actual no bloquea el panel: D7).

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T023 [US1] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/IniciativaForm.tsx` (exporta `IniciativaFormBody`) e `IniciativaForm.module.scss`, en modo **alta** (plan, D4, D7, D15, D17, A2; data-model, "Validaciones"; contracts §3). Depende de T012, T017, T022. **Referencia**: `sideIni`.
  - `Panel` del DS, `open`, título `buildPanelTitle(strings.IniciativaNew)` (sin subtítulo), `onClose={onCancel}`, `primaryAction` = Cancelar (`secondary`), `secondaryAction` = "Cargar iniciativa" (`IniciativaNew`, `primary`, `disabled` mientras guarda).
  - Campos en una columna, en este orden:
    1. Objetivo: `Dropdown` `required`, placeholder `ObjetivoFormSelect`, opciones `${formatObjetivoId(Id)} · ${Nombre}` ordenadas por Id, valor inicial `initialObjetivoId` si existe.
    2. Nombre de la iniciativa: `Input` `required`, `maxLength={255}`, placeholder `IniciativaFormNamePlaceholder`.
    3. Descripción / impacto esperado: `Multiline` `required`, placeholder `IniciativaFormDescriptionPlaceholder`.
    4. Accountable: `Picker` `mode="people"` `required`, `label` `IniciativaAccountable`. `people` = usuarios con `Activo === true` (clave `String(Usuario.Id)`, nombre `Usuario.Title`), más el usuario actual si no está, sin duplicados por clave, ordenados por nombre. Valor inicial: el usuario actual (por `String(currentUser.Id)`, **no por nombre**); vacío si no hay usuario actual. Error en un `span` `role="alert"` debajo.
    5. Áreas involucradas: `Dropdown` `multiple`, `label` `IniciativaAreas`, opciones del maestro por `Nombre`, valor `string[]`. Opcional.
    6. Fecha de inicio y Fecha de compromiso: `Picker` `mode="date"` `required`, lado a lado (grilla de dos columnas), etiquetas `ObjetivoFormStartDate` y `ObjetivoFormCommitmentDate`; error en `span` `role="alert"` debajo de cada una.
  - Sin Estado ni Peso en el alta (FR-005).
  - Validación al elegir "Cargar iniciativa" (D15; mensajes de data-model): obligatorios con texto recortado (`RequiredField`); compromiso anterior a inicio (`ObjetivoDateOrder`); si el objetivo elegido tiene fechas, inicio anterior o compromiso posterior a las del objetivo (`IniciativaDateOutOfRange` con las dos fechas del objetivo en `formatDate`). Comparar fechas como texto `AAAA-MM-DD` (`toDateInput`). Prioridad por campo: obligatorio, orden, rango. Los errores se ven solo después del primer intento y se limpian cuando el campo deja de ser inválido.
  - Si es válido, abrir `ConfirmacionModal` con título `IniciativaNew` y mensaje `IniciativaConfirmCreate`. Cancelar cierra el modal y conserva lo ingresado.
  - Aceptar: armar `new Iniciativa()` con `Nombre` y `Descripcion` recortados, `Objetivo` (lookup con `Title` = nombre), `Responsables` (`Id`, `Title`, `EMail` de los elegidos), `Area` (lookups de las elegidas, `[]` si ninguna), fechas con `fromDateInput`, `Estado = EstadoIniciativa.NoIniciada`; `await onSave(...)`. Si falla, cerrar el modal y mostrar `MessageBar` `type="error"` `IniciativaSaveError`, conservando lo ingresado.
  - `IniciativaForm.module.scss`: ancho del panel 480 px y las reglas de campo e inválido que necesitan estos campos, tomando como modelo `ObjetivoForm.module.scss` (plan, Complexity Tracking). Color de error con `getColorStep('Red', '600')` por variable CSS, como `ObjetivoForm`.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T024 [US1] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/IniciativaFormPanel.tsx` y conectar el alta en la bandeja (plan, D15; contracts §3). Depende de T021 y T023.
  - Panel: mismo patrón que `ObjetivoFormPanel`: con `useIniciativaFormMasters`; mientras carga, `Panel` con `Spinner`; si hay error, `Panel` con `MessageBar` `ObjetivoFormLoadError` y Cancelar. `save` usa `addItem` de `useIniciativaDataSource` y llama `onSaved` con la guardada.
  - `IniciativasBandeja.tsx`: `onNew` abre `IniciativaFormPanel` sin `initialObjetivoId`; `onSaved` cierra el panel, recarga iniciativas (`getItems`) y muestra `SuccessNotice` con `IniciativaCreated` y el nombre.

  **Criterio de terminado**: `npm run build` sin errores; quickstart, escenarios 16 a 24, con mocks.

**Checkpoint**: MVP (US2 + US1): se ve la bandeja y se cargan iniciativas.

---

## Phase 5: User Story 3 - Buscar y filtrar en la bandeja (Priority: P2)

**Goal**: búsqueda por ID o nombre y filtros por departamento, objetivo, accountable, estado y año.

**Independent Test**: quickstart, escenarios 8 a 15.

- [X] T025 [P] [US3] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativasBandeja/IniciativasFiltros/IniciativasFiltros.tsx` (plan, D13; contracts §3). Depende de T012. **Referencia**: `showFilters`, rama `notAbm`.
  - `Panel` del DS `open`, título `PalancasFilters`, `onClose={onClose}` (descarta el borrador).
  - Borrador en `useState`, inicializado con `filtros`.
  - Cinco `Dropdown` de un valor, en este orden, con la primera opción `{ key: '', text: IniciativasFilterAll }`:
    1. `ObjetivoFieldDepartment`: `departamentos` por `Nombre`.
    2. `ObjetivoColumnName`: `objetivos` como `${formatObjetivoId(Id)} · ${Nombre}`, por Id.
    3. `IniciativaAccountable`: `accountables` por `Title`, clave `String(Id)`.
    4. `ObjetivoFormStatus`: los cinco de `EstadoIniciativa`.
    5. `IniciativasFilterYear`: `anios`.
  - `primaryAction`: `Button` `secondary` `IniciativasFiltersClear` → `onClear()`. `secondaryAction`: `Button` `primary` `IniciativasFiltersApply` → `onApply(borrador)`.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T026 [US3] Agregar búsqueda y filtros a `src/webparts/objetivosVp/components/Iniciativa/IniciativasBandeja/IniciativasBandeja.tsx` (plan, D8, D13, D14; FR-019, FR-020). Depende de T020 y T025.
  - Cargar también `useDepartamentoDataSource` (`getItems` en el mismo `useEffect`).
  - Búsqueda: `searchText` de `state`; coincide si `formatIniciativaId(Id).toLowerCase()` o `Nombre.toLowerCase()` contienen el texto recortado en minúsculas. Cambiarla: `onStateChange({ ...state, searchText, page: 1 })`.
  - Filtros aplicados de `state.filtros`, combinados con la búsqueda: Departamento por `objetivo.Departamento.Id` (objetivo de la lista por `Iniciativa.Objetivo.Id`); Objetivo por `Objetivo.Id`; Accountable por algún `Responsables[i].Id`; Estado; Año con `getAniosIniciativa(i).indexOf(Number(anio)) >= 0`.
  - Opciones del panel: `accountables` = personas de `Responsables` de todas las iniciativas, sin duplicados por `Id`; `anios` = de `min(año de FechaInicio)` a `max(año de FechaCompromiso)` de todas las iniciativas, sin huecos (U3).
  - `onOpenFilters` abre `IniciativasFiltros`; `onApply(f)` → `onStateChange({ ...state, filtros: f, page: 1 })` y cierra; `onClear()` → `filtros: EMPTY_FILTROS, page: 1` y cierra.
  - Las cantidades de las solapas no dependen de búsqueda ni filtros; el contador y el paginado sí.
  - Error al cargar departamentos: el mismo `MessageBar` de carga.

  **Criterio de terminado**: `npm run build` sin errores; quickstart, escenarios 8 a 15, con mocks.

---

## Phase 6: User Story 4 - Ver el detalle de una iniciativa (Priority: P2)

**Goal**: detalle con migas, información, los dos pesos y el comentario ejecutivo.

**Independent Test**: quickstart, escenarios 25 a 33 (con mocks: iniciativa 1 → 33,33 % y 6,67 %; 4 → 25 % y 7,5 %; 8 cancelada sin pesos; 11 de otra VP; 13 → "—").

- [X] T027 [P] [US4] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaInfo/IniciativaInfo.tsx` e `IniciativaInfo.module.scss` (plan, mapeo "Detalle", D12; contracts §3). Depende de T012 y T014. **Referencia**: `sec.i_info`.
  - `SectionBand` `title={IniciativaInfoSection}` `collapsible`; `action` = lápiz como en `ObjetivoInfo` (`Tooltip` `Edit`, `FigmaIcon` `editPrimary`) solo si `onEdit`.
  - Grilla de 4 columnas con `Field`, mismo estilo que `ObjetivoInfo`, en este orden: Objetivo (`ObjetivoColumnName`, `${formatObjetivoId} · ${Nombre}`), Accountable (`IniciativaAccountable`, `formatAccountable`), Áreas involucradas (`IniciativaAreas`, `areaNames`), Estado (`ObjetivoFormStatus`), Fecha de inicio y Fecha de compromiso (`ObjetivoFieldStartDate`, `ObjetivoFieldCommitmentDate`, con `formatDate`) y, **solo si `pesos.enObjetivo !== undefined`**, Peso en el objetivo (`IniciativaFieldWeightObjective`, `${formatPeso(x)} %`) e inmediatamente después Peso en el departamento (`ObjetivoFieldWeight`, `${formatPeso(x)} %` o `ObjetivoNoValue` si es `null`).
  - Debajo, en una fila: Descripción / impacto esperado (`IniciativaDescription`).

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T028 [P] [US4] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaComentario/IniciativaComentario.tsx` (plan, D19; contracts §3). Depende de T014. **Referencia**: `sec.i_com`.
  - `SectionBand` `title={IniciativaCommentSection}` `collapsible` `defaultCollapsed`; lápiz como en T027 solo si `onEdit`.
  - Con comentario: fecha (`formatDate(Created)`) y autor (`Author.Title`) en una línea arriba, con el estilo de etiqueta de `Field`, y el texto debajo, con el estilo de valor de `Field`. Sin comentario: `IniciativaCommentEmpty` en una línea.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T029 [US4] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` e `IniciativaDetalle.module.scss` y su ruta (plan, D10, D11, D20, D23; contracts §3 y §4). Depende de T006, T007, T011, T015, T021, T027, T028. **Referencia**: `scr.iniciativa`.
  - Props `canEdit`, `canChangeEstado`. Id de `useParams`; Id inválido → no encontrada.
  - Datos: `useIniciativaDataSource`, `useObjetivoDataSource` y `useAreaDataSource` (`getItems` en un `useEffect` con `[]`), y `useComentariosIniciativa(id)`.
  - Iniciativa = la del Id en `items`; si las iniciativas cargaron y no está: `MessageBar` `IniciativaNotFound`. Error de carga: `IniciativaLoadError`. Mientras carga: `Spinner`.
  - Objetivo = el de la lista por `Iniciativa.Objetivo.Id`. Pesos = `getPesosIniciativa(iniciativa, iniciativas del mismo objetivo, objetivo)`. Áreas = nombres del maestro por Id (si no está, el `Title` del lookup), unidos por `', '`. Último comentario = `getUltimoComentario(comentarios.items, id)`.
  - Migas: `PalancaBreadcrumb` con `palancaNombre`/`palancaId` solo si el objetivo es de la VP RRII, `objetivoNombre`, `objetivoId` e `iniciativaNombre`.
  - Encabezado como `ObjetivoDetalle`: `BackButton`, `h1` `HEADER_TITLE_STYLE` con `ObjetivoDetailTitle` (`INI-nn` y nombre) y `HeaderChip` con `getEstadoIniciativaChipColor`. Sin avance ni `LocationButton`.
  - Cuerpo: `IniciativaInfo` y `IniciativaComentario` (sin `onEdit` en esta tarea; los conectan T034 y T036).
  - Pie: `DetailFooter` con Cancelar (`secondary`). Editar y "Cambiar estado" los agregan T034 y T036.
  - Volver y Cancelar: `location.state?.from` si es un texto; si no, `getObjetivoPath(objetivoId)` si hay iniciativa; si no (no encontrada), `INICIATIVAS_PATH` (FR-033a, plan D10).
  - Mismo `PAGE_PADDING` y estructura de `ObjetivoDetalle.module.scss`.
  - `ObjetivosVp.tsx`: `<Route path={INICIATIVA_DETAIL_PATH} element={<IniciativaDetalle canEdit={CAN_EDIT_INICIATIVA} canChangeEstado={CAN_CHANGE_ESTADO_INICIATIVA} />} />`.

  **Criterio de terminado**: `npm run build` sin errores; quickstart, escenarios 25 a 33, con mocks.

---

## Phase 7: User Story 5 - Ver las iniciativas en el detalle del objetivo (Priority: P2)

**Goal**: sección "Iniciativas (N)" con "+", grilla con pesos y navegación.

**Independent Test**: quickstart, escenarios 34 a 37 (con mocks: objetivo 2 → "Iniciativas (5)", cuatro con 25 % y la cancelada sin peso; objetivo 5 sin columna Peso; objetivo 4 sin iniciativas).

- [X] T030 [US5] Crear `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx` (plan, D22; contracts §4). Depende de T016, T024. **Referencia**: `sec.o_inis`.
  - Props `objetivo`, `canCreate`, `onCreated`.
  - `useIniciativaDataSource` con `getItems` en un `useEffect` con `[]`; iniciativas del objetivo = las de `Objetivo.Id === objetivo.Id`.
  - `SectionBand` `collapsible` con título `ObjetivoInitiativesSection` y `{0}` = cantidad de iniciativas del objetivo, **incluidas las canceladas**. `action` (si `canCreate`): `Button` `iconOnly` `secondary` `size="small"` con `FigmaIcon` `addPrimary`, `Tooltip` y `aria-label` `IniciativaAddTooltip`, que abre `IniciativaFormPanel` con `initialObjetivoId={objetivo.Id}`.
  - `IniciativasTable` variante `objetivo` con `objetivo`, `emptyText` `ObjetivoInitiativesEmpty`; Ver con `navigate(getIniciativaPath(id), { state: { from: location.pathname } })`.
  - Al guardar: cerrar el panel, `getItems()` y `onCreated(iniciativa)`. Error de carga: `MessageBar` `IniciativasLoadError`.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T031 [US5] Modificar `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx` y `ObjetivosVp.tsx` (contracts §4). Depende de T030.
  - `ObjetivoDetalle`: prop `canCreateIniciativa: boolean`; debajo de `ObjetivoInfo`, `<ObjetivoIniciativas objetivo={objetivo} canCreate={canCreateIniciativa} onCreated={...} />`; `onCreated` muestra el `SuccessNotice` existente con `IniciativaCreated` y el nombre.
  - `ObjetivosVp.tsx`: pasar `canCreateIniciativa={CAN_CREATE_INICIATIVA}` a `ObjetivoDetalle`.
  - No cambiar nada más de `ObjetivoDetalle`.

  **Criterio de terminado**: `npm run build` sin errores; quickstart, escenarios 34 a 37, con mocks.

---

## Phase 8: User Story 6 - Editar una iniciativa (Priority: P2)

**Goal**: editar desde el detalle en el mismo panel, con el objetivo en modo lectura y el estado.

**Independent Test**: quickstart, escenarios 38 a 40.

- [X] T032 [US6] Agregar el modo **edición** a `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/IniciativaForm.tsx` (plan, D7, D15; FR-024). Depende de T023.
  - Con `iniciativa`: título `buildPanelTitle(IniciativaFormEditTitle con formatIniciativaId(Id), Nombre)`; botón "Guardar cambios" (`SaveChanges`); confirmación con título `SaveChanges` y mensaje `IniciativaConfirmEdit`.
  - Valores iniciales: los de la iniciativa (objetivo, nombre, descripción, `Responsables` por `String(Id)`, áreas por `String(Id)`, fechas con `toDateInput`, estado).
  - Objetivo: `Dropdown` `disabled`.
  - `people` del `Picker` suma los accountable actuales aunque no estén activos o no estén en la lista `Usuario` (D7).
  - Estado: `Dropdown` `required` con los cinco valores de `EstadoIniciativa`, después de las fechas.
  - Al guardar: misma validación; la entidad lleva `Id`, el `Objetivo` original, el `Estado` elegido y `Area` como lista (`[]` si se quitaron todas).

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T033 [US6] Completar `IniciativaFormPanel.tsx` para edición: si recibe `iniciativa`, `save` usa `editItem` (plan, D15). Depende de T032.

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T034 [US6] Conectar la edición en `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` (FR-033). Depende de T029 y T033.
  - Si `canEdit`: botón Editar (`Edit`, `primary`) en el pie, después de Cancelar, y `onEdit` en `IniciativaInfo`; ambos abren `IniciativaFormPanel` con la iniciativa.
  - `onSaved`: cerrar el panel, `getItems()` de iniciativas (los pesos se recalculan si cambió a o desde Cancelada) y `SuccessNotice` con `IniciativaUpdated` y el nombre.

  **Criterio de terminado**: `npm run build` sin errores; quickstart, escenarios 38 a 40, con mocks.

---

## Phase 9: User Story 7 - Cambiar el estado y el comentario ejecutivo (Priority: P2)

**Goal**: panel "Cambiar estado" con confirmación, comentario con historial y mensaje de éxito.

**Independent Test**: quickstart, escenarios 41 a 45b.

- [X] T035 [US7] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaEstadoPanel/IniciativaEstadoPanel.tsx` (plan, D16, D17; FR-028 a FR-030; contracts §3). Depende de T010, T017. **Referencia**: `m.is.iniUpd`.
  - `Panel` del DS con título `buildPanelTitle(IniciativaStatusPanelTitle, ${formatIniciativaId} · ${Nombre})`; Cancelar · "Cambiar estado" (`IniciativaChangeStatus`, `primary`).
  - Campos: Estado (`Dropdown` `required`, cinco valores, el actual) y Comentario ejecutivo (`Multiline`, `label` `IniciativaCommentSection`, placeholder `IniciativaCommentPlaceholder`, precargado con `ultimoComentario?.Comentario`). Mismo `.module.scss` de `IniciativaForm` para el ancho del panel.
  - "Cambiar estado" abre `ConfirmacionModal` con título `IniciativaChangeStatus` y mensaje `IniciativaConfirmStatus` (`{0}` nombre, `{1}` estado actual, `{2}` estado elegido).
  - Aceptar, en este orden:
    1. `comentario = texto.trim()`. Si no está vacío y es distinto de `ultimoComentario?.Comentario` recortado, `addItem` de `useComentarioIniciativaDataSource` con `Iniciativa = { Id, Title: Nombre }` y `Comentario = comentario`.
    2. Si el estado cambió, `editItem` de `useIniciativaDataSource` con una copia de la iniciativa (`Object.assign(new Iniciativa(), iniciativa, { Estado })`).
    3. Si se registró algo, `onSaved()`; si no cambió nada, `onCancel()` (cierra sin mensaje).
  - Error en cualquiera de los pasos: cerrar el modal y mostrar `MessageBar` `IniciativaStatusSaveError`, conservando lo ingresado. El orden (primero el comentario) permite reintentar sin duplicarlo (D16).

  **Criterio de terminado**: `npm run build` sin errores.

- [X] T036 [US7] Conectar "Cambiar estado" en `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` (FR-028, FR-029). Depende de T029 y T035.
  - Si `canChangeEstado`: botón "Cambiar estado" en el pie, después de Editar, `primary` con el color de la escala Secondary del DS (`getColorStep('Secondary', '700')` en `backgroundColor` y `borderColor`, como `NEW_PALANCA_STYLE` de `PalancasHeader`; plan, A3), y `onEdit` en `IniciativaComentario`; ambos abren `IniciativaEstadoPanel` con la iniciativa y el último comentario.
  - `onSaved`: cerrar el panel, `getItems()` de iniciativas, `comentarios.reload()` y `SuccessNotice` con `IniciativaStatusUpdated` y el nombre.

  **Criterio de terminado**: `npm run build` sin errores; quickstart, escenarios 41 a 45b, con mocks.

---

## Phase 10: Polish, datos y validación

- [X] T037 Revisar las reglas en todos los archivos creados o modificados en T002 a T036:
  - sin hexadecimales ni px de tipografía o espaciado fuera de constantes del DS;
  - sin `any` nuevos, sin comentarios y sin literales mágicos;
  - sin textos visibles escritos en el código ("—" sale de `ObjetivoNoValue`);
  - claves de `loc/` sincronizadas entre `mystrings.d.ts` y `en-us.js`, y sin claves nuevas sin uso (buscar cada una con Grep);
  - ningún uso de `window.open`, `location` para navegar, `dangerouslySetInnerHTML` ni acceso directo al DOM;
  - ninguna comparación del usuario actual por `Title`;
  - ninguna acción para eliminar iniciativas (SC-007).

  Corregir lo que aparezca en el archivo de la tarea que lo introdujo.

  **Criterio de terminado**: las búsquedas no encuentran coincidencias y `npm run build` sin errores.

  **Estado**: búsquedas sin coincidencias tras corregir los separadores "·" escritos en el código (ahora salen de `ObjetivoDetailTitle` y de la clave nueva `IniciativaCommentMeta`). `npm run build` OK.

- [ ] T038 Índice de la columna `Iniciativa` de `Comentario iniciativa` en el sitio de desarrollo (plan, P1). Lo hace la usuaria con los pasos de quickstart, "Índice de la columna Iniciativa". El agente no lo crea; registrar lo que ella informe.

  **Criterio de terminado**: la columna aparece en "Columnas indizadas" o queda informado como pendiente.

  **Estado**: pendiente. La sesión no tiene acceso al sitio de desarrollo; lo hace la usuaria (quickstart, "Índice de la columna Iniciativa").

- [ ] T039 Validar con [quickstart.md](./quickstart.md):
  - escenarios 1 a 48, primero con los mocks y después contra las listas de desarrollo (con T038 hecha);
  - en SharePoint, verificar además que `Title` = Nombre, que `Area` guarda varios valores y se vacía al quitar todas, que se crea un elemento en `Comentario iniciativa` por cada cambio de comentario y que la consulta de comentarios filtra por `IniciativaId`;
  - comparar lado a lado con el prototipo y anotar las aproximaciones A1 a A4 (SC-009);
  - SC-008: en el sitio de desarrollo, con el volumen que haya en las listas (no se cargan iniciativas para la medición), medir con las herramientas del navegador (pestaña Red, tiempo hasta la última respuesta) la apertura de la bandeja, del detalle de la iniciativa, del detalle del objetivo y de los paneles: menos de 3 s cada una. La búsqueda y los filtros no hacen consultas nuevas. **Informar la cantidad de iniciativas y de comentarios usada en la medición**;
  - en las listas de desarrollo se escriben solo iniciativas y comentarios de prueba de estos escenarios.

  Si algo falla, corregirlo en el archivo de la tarea que lo implementa. Informar los escenarios que no se pudieron ejecutar y por qué.

  **Criterio de terminado**: escenarios en verde o informados, y `npm run build` sin errores.

  **Estado**: pendiente. `npm run build` OK. Los escenarios requieren el workbench hospedado (con mocks o con las listas de desarrollo), al que la sesión no tiene acceso.

---

## Dependencies & Execution Order

| Tarea | Depende de |
|---|---|
| T001 | — |
| T002, T004, T005, T007, T008, T010, T013, T014, T015 | T001 (en paralelo entre sí) |
| T003 | T002 |
| T006 | T003, T005 |
| T009 | T008 |
| T011 | T010 |
| T012 | T003 |
| T016 | T004, T012 |
| T017 | T004 |
| T018, T019 | Phase 2 |
| T020 | T006, T009, T012, T013, T016, T018, T019 |
| T021 | T020 |
| T022 | T006, T007, T008, T009 |
| T023 | T012, T017, T022 |
| T024 | T021, T023 |
| T025 | T012 |
| T026 | T020, T025 |
| T027, T028 | T012, T014 |
| T029 | T006, T007, T011, T015, T021, T027, T028 |
| T030 | T016, T024 |
| T031 | T030 |
| T032 | T023 |
| T033 | T032 |
| T034 | T029, T033 |
| T035 | T010, T017 |
| T036 | T029, T035 |
| T037 | T002 a T036 |
| T038 | — (la hace la usuaria en cualquier momento) |
| T039 | T037, T038 |

**Orden de historias**: Phase 2 → US2 → US1 (MVP) → US3, US4 y US5 (independientes entre sí; US5 usa el panel de US1) → US6 (necesita US4) → US7 (necesita US4).

**MVP**: Phases 1 a 4 (US2 + US1): la bandeja con solapas, contadores y paginado, y la carga de iniciativas desde la bandeja.

### Parallel Example

```text
Después de T001:  T002 · T004 · T005 · T007 · T008 · T010 · T013 · T014 · T015
Después de Phase 2:  T018 · T019 · T022 · T025 · T027 · T028 · T035
Después de T024:  T026 (US3) · T029 (US4) · T030 (US5)
Después de T029:  T032-T034 (US6) · T036 (US7)
```
