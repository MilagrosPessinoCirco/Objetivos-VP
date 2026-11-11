---

description: "Tareas de implementación de Palancas estratégicas (ABM y vista)"
---

# Tasks: Palancas estratégicas (ABM y vista)

**Input**: `specs/002-palancas-estrategicas/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**: `plan.md` sin consultas abiertas; merge de la rama `Router` (`ce61724`) y T000 (`8ebcbd1`) ya hechos; `npm ci` ejecutado (instala `react-router-dom 6.30.6`); prototipo `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`; `docs/design-system-catalog.md`.

**Tests**: no se solicitan. El repo no declara runner de pruebas. La validación es `npm run build`, los escenarios de `quickstart.md` y la comparación visual con el prototipo.

**Organization**: tareas agrupadas por historia de usuario. Cada tarea indica el archivo exacto, los componentes del Design System (DS), su **Referencia** en el prototipo y su criterio de terminado.

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: historia de `spec.md` (US1 ver grilla y detalle, US2 crear, US3 editar, US4 inactivar).

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores, lo que incluye lint y tipos. Es parte del criterio de terminado.
- **Referencia al prototipo (constitución II)**: las clases CSS citadas están en el `<style>` de `index.html`. El markup está en los bloques `<sc-if value="{{scr.palancas}}">` (grilla), `<sc-if value="{{scr.palanca}}">` (detalle), `<sc-if value="{{m.is.palanca}}">` (formulario) y `<nav class="crumb">` del bloque `scr.objetivo` (estilo de las migas). **No reproducir** (FR-020): columna Expandir, columna Objetivos, "Pesos VP RRII", "Filtros", "Cargar objetivo", la línea `.lCount`, la sección "Objetivos de la palanca", "Ubicación en la estrategia" ni el selector "Objetivos del VP / Todos".
- **`src/core/ui` es de solo lectura.**
- **Imports por capa, nunca el índice de `core` ni de `core/ui`**:
  - DS: `…/core/ui/components` (`Button`, `Dropdown`, `Input`, `Multiline`, `Table`, `Tooltip`), `…/core/ui/patterns` (`Chip`, `MessageBar`, `Modal`, `SearchBox`, `Spinner`, `Surface`, `Toast`), `…/core/ui/foundations` (`FigmaIcon`, `colorScales`, `colors`, `spacing`, `typography`).
  - Datos: `…/core/entities` (`Palanca`), `…/core/api/Palanca/usePalancaDataSource` (default), `…/core/utils` (`Utils`).
  - Profundidad: desde `components/<Pantalla>/<Archivo>.tsx` → `../../../../core/…`; desde `components/<Pantalla>/<Pieza>/<Archivo>.tsx` → `../../../../../core/…`.
- **Excepción aprobada (C1)**: `Breadcrumb` de `@fluentui/react` solo en `PalancaBreadcrumb.tsx`. Ningún otro import directo de Fluent UI en código nuevo.
- **Navegación**: solo con `useNavigate` y `useParams` de `react-router-dom` y las constantes de `components/ObjetivosVp/routes.ts`. Prohibido `window.location`, `window.open`, `history.pushState`, anclas manuales, `Utils.openInSelfTab`/`openInNewTab` y rutas escritas como texto fuera de `routes.ts`.
- **Tokens**: colores, tipografías y espaciados solo desde `colors`, `colorScales`, `spacing` y `typography`, aplicados con `style`/`styles`. Los `.module.scss` llevan solo estructura (display, flex/grid, alineación, anchos relativos). **Prohibido escribir hexadecimales o px de espaciado o tipografía en código nuevo.** Para `colorScales`, buscar el paso igual que `getColorStep` en `components/Home/AccessList/AccessList.tsx`.
- **Textos**: siempre desde `import * as strings from 'ObjetivosVpWebPartStrings';` (claves de T006). Los textos con `{0}`/`{1}` se completan con `Utils.replaceAll(texto, '{0}', valor)`. Ningún texto visible escrito en el código.
- **TypeScript estricto, sin `any`, sin comentarios de código, sin literales mágicos** (los números sueltos, como la duración del aviso, van a constantes locales con nombre).
- **Hooks**: `useEffect` solo para cargar datos (sincronizar con la lista). Las filas visibles, los filtros y los estados vacíos se calculan durante el render, sin estado duplicado.
- **Permisos (FR-018)**: "Nueva palanca", "Editar palanca" y "Editar" se muestran solo si la prop `canManage` es `true`. Ninguna pantalla ofrece eliminar (FR-015): no se usa `deleteItem`.
- **Errores**: no registrar errores en las pantallas (ya los registra `useDatasource`); solo mostrarlos. Nunca mostrar un éxito si la operación falló.
- **No editar** archivos `*.module.scss.ts` (artefactos). **No modificar** `spec.md` ni `plan.md`; si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo.

## Path Conventions

Raíz del webpart: `src/webparts/objetivosVp/`. Pantallas: `components/Palancas/` (grilla), `components/PalancaDetalle/` (detalle) y `components/PalancaForm/` (formulario compartido).

---

## Phase 1: Setup

- [x] T001 Integrar el router y limpiar la base. **Ya realizado**: merge de la rama `Router` en el commit `ce61724`, que trae `react-router-dom 6.30.6` y `HashRouter` en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`, borra `components/Home/Home/` y conserva el `.vscode/launch.json` de 002; luego `npm ci`; T000 en el commit `8ebcbd1`, que borra `assets/assets/backgroundHome.png` y la entrada vacía de la raíz. `npm run build` pasa. No requiere acción.

---

## Phase 2: Foundational (bloquea todas las historias)

**Purpose**: capa de datos, textos, rutas y utilidades que todas las historias necesitan.

**⚠️ CRITICAL**: ninguna historia empieza antes de terminar esta fase.

- [ ] T002 [P] Ajustar el manejo de errores en `src/core/api/useDatasource.ts` (plan C2, research D4). No cambiar `DatasourceHook`, `IDatasourceState`, las constantes de acción ni `deleteItem`/`getItems`:
  1. Reductor `[ERROR]`: `(state) => ({ ...state, isLoading: false, error: true })`.
  2. Agregar, junto a `handleAsync`, un helper `handleAsyncAndRethrow` con el mismo cuerpo que `handleAsync` (mismo registro con `console.log`/`console.error` y `dispatch({ type: ERROR })`) que además hace `throw error;` al final del `catch`.
  3. `editItem` y `getById` pasan a usar `handleAsyncAndRethrow` en lugar de `handleAsync`.
  4. `addItem` envuelve su cuerpo en `try { … } catch (error) { console.error(error); dispatch({ type: ERROR }); throw error; }` y sigue devolviendo `Promise<TItem>`.
  **Terminado**: `editItem` y `getById` rechazan cuando el datasource falla; después de cualquier fallo, `isLoading` es `false` y `error` es `true`; build OK.
- [ ] T003 [P] Crear `docs/plantilla-cambios.md` con el mismo formato que `docs/design-system-cambios.md`: título `# Cambios respecto de la plantilla SPFx`, el párrafo "Modificaciones hechas en el código de la plantilla (`src/core` fuera de `src/core/ui`) que no vienen de la plantilla original. Reaplicarlas al actualizar la plantilla." y la tabla `| Fecha | Archivo | Cambio | Motivo | Feature |` con una fila: `2026-11-11` · `src/core/api/useDatasource.ts` · "`editItem` y `getById` relanzan el error (helper `handleAsyncAndRethrow`); `addItem` despacha `ERROR` antes de relanzar; el reductor `ERROR` pasa `isLoading` a `false`." · "Sin el cambio, la pantalla no distingue un guardado fallido de uno exitoso y el indicador de carga queda encendido tras un error." · `002-palancas-estrategicas`. **Terminado**: archivo creado; build OK.
- [ ] T004 [P] En `src/core/entities/Palanca.ts`, `toListItem()` agrega `Title: this.Nombre` después de `...super.toListItem()`, de modo que pise el `Title` heredado (plan C4, data-model). No cambiar `mapItem` ni las propiedades. **Terminado**: al crear y al editar, la columna `Title` recibe el valor de `Nombre`; build OK.
- [ ] T005 [P] Crear `src/core/api/Palanca/PalancaMock.ts`: clase `PalancaMock` (export default) que implementa `IPalancaDataSource` en memoria, con el patrón de `src/core/api/ItemMock.ts` (research D2).
  - `listTitle = Lista.Palanca` (de `../../utils/Constants`).
  - Arreglo a nivel de módulo (compartido entre instancias) inicializado con `new Palanca({...})` para estos cinco elementos del prototipo (`index.html`, `D.pals`), con `Id`, `Title` = `Nombre`, `Nombre`, `Descripcion` y `Activa`:
    1. `Excelencia comercial` · "Crecer en clientes y ventas con una propuesta comercial competitiva en todos los canales." · `true`
    2. `Experiencia de cliente` · "Que cada contacto del cliente con YPF sea simple, ágil y consistente." · `true`
    3. `Nuevos negocios` · "Abrir nuevas fuentes de ingreso y usar los datos como ventaja competitiva." · `true`
    4. `Marca y portfolio` · "Fortalecer la marca YPF y ordenar el portfolio de productos y servicios." · `true`
    5. `Eficiencia en el canal` · "Palanca del período anterior." · `false`
  - `getItems()`: copia del arreglo ordenada por `Nombre`. `getActiveItems()`: solo `Activa === true`.
  - `add(item)`: asigna `Id` = mayor Id + 1, agrega una nueva `Palanca` construida desde `item.toListItem()` con ese `Id` y la devuelve.
  - `edit(item)`: reemplaza la de igual `Id` por una nueva `Palanca` desde `item.toListItem()` y la devuelve. Si no existe, rechaza con el error de no encontrada.
  - `getById(id)`: devuelve la palanca o rechaza con `Object.assign(new Error(MENSAJE), { status: NOT_FOUND_STATUS })`, donde `NOT_FOUND_STATUS = 404` y `MENSAJE` es una constante local como "No existe la palanca solicitada en el mock." (texto técnico, no visible).
  - `delete(id)`: la quita del arreglo (lo exige la interfaz; la UI no lo usa).
  **Terminado**: implementa todos los métodos de `IPalancaDataSource`; build OK.
- [ ] T006 [P] Textos en `src/webparts/objetivosVp/loc/mystrings.d.ts` (interfaz `IObjetivosVpWebPartStrings`, tipo `string`) y `src/webparts/objetivosVp/loc/en-us.js`, con las mismas claves en ambos:
  - **Home**: agregar `AccessLeversObjectives`: "Palancas y objetivos" entre `AccessMyInitiatives` y `AccessVpDashboard`. `AccessLevers` y `AccessObjectives` se quedan por ahora (`AccessList.tsx` todavía las usa); las quita T010.
  - **Nuevas**: las 44 claves de `contracts/ui-contracts.md` sección 4, con sus valores literales. Los mensajes de éxito usan comillas rectas: `La palanca "{0}" se ha cargado correctamente.` (en `en-us.js`, escaparlas como `\"`).
  - Conservar todas las demás claves. No crear idiomas.
  **Terminado**: claves sincronizadas en los dos archivos; build OK.
- [ ] T007 [P] Crear `src/webparts/objetivosVp/components/ObjetivosVp/routes.ts` con `export const HOME_PATH = '/';`, `export const PALANCAS_PATH = '/palanca';`, `export const PALANCA_DETAIL_PATH = \`${PALANCAS_PATH}/:id\`;` y `export const getPalancaPath = (id: number): string => \`${PALANCAS_PATH}/${id}\`;` (research D8). **Terminado**: build OK.
- [ ] T008 [P] Crear `src/webparts/objetivosVp/components/Palancas/formatPalancaId.ts`: `export const formatPalancaId = (id: number | undefined): string`, que devuelve `` `${PALANCA_ID_PREFIX}${id}` `` con `PALANCA_ID_PREFIX = 'PAL-'` (constante local), o cadena vacía si `id` es `undefined` (research D6). **Terminado**: build OK.
- [ ] T009 Pasar el mock en `src/core/api/Palanca/usePalancaDataSource.ts`: `useDatasource<Palanca>(new PalancaDataSource(), new PalancaMock())`. No tocar `useItemPalancaDataSource.ts`. Depende de T005. **Terminado**: el hook recibe el mock (se usa solo fuera de un entorno SharePoint, en pruebas sin conexión; el workbench hospedado usa la lista real); build OK.

**Checkpoint**: datos, textos y rutas listos.

---

## Phase 3: User Story 1 — Ver la grilla de palancas y entrar al detalle (Priority: P1) 🎯 MVP

**Goal**: desde "Palancas y objetivos" se llega a la grilla de palancas activas, con búsqueda y Actualizar, y desde cada fila al detalle con migas de pan y Volver.

**Independent Test**: quickstart, pasos 1–6, 14–16 y 19–22, contra la lista del sitio de desarrollo (con la autorización de T024).

- [ ] T010 [US1] Home: volver a los cinco accesos de la 001 y hacer navegar solo "Palancas y objetivos".
  - En `src/webparts/objetivosVp/components/Home/AccessList/AccessButton.tsx`, `onClick` pasa a ser opcional (`onClick?: () => void`) y se sigue pasando a `DefaultButton`.
  - En `src/webparts/objetivosVp/components/Home/AccessList/AccessList.tsx`, `IAccessItem.route` pasa a ser opcional y `ACCESS_ITEMS` queda exactamente así, en este orden: `AccessMyTasks` · `checkmark` · Primary 800; `AccessMyInitiatives` · `applications` · Tertiary 800; `AccessLeversObjectives` · `flag` · Tertiary 500 · `route: PALANCAS_PATH`; `AccessVpDashboard` · `list` · Primary 600; `AccessAbm` · `users` · Secondary 700. Sin comentarios ni ítems comentados.
  - `onClick` se pasa solo si el ítem tiene `route`: `onClick={item.route ? () => navigate(item.route) : undefined}`, con la variable estrechada para el tipo.
  - No cambiar `rowGap`, `getColorStep` ni los estilos: la separación ya se restauró en el commit `1689f29` (plan, "Ajustes a la Home que vinieron con el merge del router").
  - Quitar `AccessLevers` y `AccessObjectives` de `src/webparts/objetivosVp/loc/mystrings.d.ts` y `src/webparts/objetivosVp/loc/en-us.js`, que quedan sin uso.
  **Referencia**: spec 001 FR-006 y su plan ("Mapa de componentes", R7–R11). **Terminado**: cinco accesos; solo "Palancas y objetivos" navega a `#/palanca`; los demás no hacen nada; build OK.
- [ ] T011 [P] [US1] Crear `src/webparts/objetivosVp/components/Palancas/PalancasHeader/PalancasHeader.tsx` y `PalancasHeader.module.scss` (región G1 + G2; desvío registrado: no usar `TableFilters`). Props: `searchText: string`, `onSearchChange: (value: string) => void`, `onBack: () => void`, `onRefresh: () => void`, `canManage: boolean`, `onNew?: () => void`.
  - Izquierda: `Button variant="secondary" size="small" iconLeft={<FigmaIcon name="arrowCircle" />}` con `strings.Back` y `onClick={onBack}`; `h1` con `strings.PalancasTitle`, estilado con `typography.family.base`, `typography.size[20]`, `typography.lineHeight[20]`, `typography.weight.regular` y el color Primary 800 de `colorScales`, `margin: 0`.
  - Derecha: `SearchBox` (`placeholder={strings.PalancasSearchPlaceholder}`, `value={searchText}`, `onValueChange={onSearchChange}`); `Tooltip content={strings.PalancasRefresh}` con un `Button iconOnly variant="secondary" iconLeft={<FigmaIcon name="reloadPrimary" />} aria-label={strings.PalancasRefresh} onClick={onRefresh}`; si `canManage && onNew`, `Button variant="primary" iconLeft={<FigmaIcon name="add" />}` con `strings.PalancaNew`.
  - SCSS: `.header` flex, `justify-content: space-between`, `align-items: center`, `flex-wrap: wrap`; `.left` y `.tools` flex con `align-items: center`. Los `gap` se aplican desde el TSX con `spacing.md`.
  **Referencia**: `.lHead`, `.lTitle`, `.lTitle h1`, `.volver`, `.lTools`, `.qSearch`, `.tRefresh`, `.tTer`. Aproximaciones A1, A2 y A5 del plan. **Terminado**: build OK.
- [ ] T012 [P] [US1] Crear `src/webparts/objetivosVp/components/Palancas/PalancasTable/PalancasTable.tsx` (región G4 + G5). Props: `palancas: Palanca[]` (ya filtradas y ordenadas), `emptyText: string`, `canManage: boolean`, `onView: (id: number) => void`, `onEdit?: (palanca: Palanca) => void`.
  - Filas: `type PalancaRow = { id: string; nombre: string; descripcion: string; palanca: Palanca }` (un alias `type`, no `interface`, para cumplir `Record<string, unknown>` de `Table`), con `id = formatPalancaId(p.Id)`.
  - `Table` con `getRowKey={(row) => row.id}`, `emptyText={emptyText}` y las columnas `id` (`strings.PalancaColumnId`), `nombre` (`strings.PalancaColumnName`), `descripcion` (`strings.PalancaColumnDescription`) y `acciones` (`strings.PalancaColumnActions`, con `render`).
  - `acciones`: si `canManage && onEdit`, `Tooltip content={strings.PalancaEditTooltip}` + `Button iconOnly variant="secondary" size="small" iconLeft={<FigmaIcon name="edit" />}` con `aria-label` = `PalancaEditAriaLabel` y `{0}` = id. Siempre, `Tooltip content={strings.PalancaViewTooltip}` + `Button iconOnly … iconLeft={<FigmaIcon name="arrowForward" />}` con `aria-label` = `PalancaViewAriaLabel` y `{0}` = id, `onClick={() => onView(row.palanca.Id as number)}`.
  - La descripción se muestra completa, sin truncar (edge case de descripciones largas).
  **Referencia**: `.lt`, `.lr`, `.lh`, `.c-gal`, `.icoBtn`, `.goBtn`, `.emptyT`. **Terminado**: build OK.
- [ ] T013 [US1] Crear `src/webparts/objetivosVp/components/Palancas/Palancas.tsx` y `Palancas.module.scss` (pantalla grilla). Props: `canManage: boolean`. Depende de T009, T011 y T012.
  - `const [state, getItems] = usePalancaDataSource();` y `const navigate = useNavigate();`.
  - Estado local: `searchText` (string) y `lastOperation: 'load' | 'save'`, que se usa en US2 y US3.
  - `useEffect(() => { getItems(); }, [])`. "Actualizar" → `setLastOperation('load')` + `getItems()`, conservando `searchText`.
  - Filas visibles, calculadas en el render: `state.items` con `Activa === true`; si `searchText.trim()` no está vacío, solo las que en minúsculas contienen el texto recortado y en minúsculas, en `formatPalancaId(Id)` o en `Nombre`; ordenadas con `(a.Nombre ?? '').localeCompare(b.Nombre ?? '', 'es')`.
  - `emptyText`: `strings.PalancasEmptySearch` si hay búsqueda; si no, `strings.PalancasEmpty`.
  - Render: `PalancasHeader` (`onBack={() => navigate(HOME_PATH)}`; sin `onNew` en esta historia); si `state.isLoading && state.items.length === 0` → `Spinner`; si `state.error && lastOperation === 'load'` → `MessageBar type="error" message={strings.PalancasLoadError}`; si no → `PalancasTable` con `onView={(id) => navigate(getPalancaPath(id))}` (sin `onEdit` en esta historia).
  - SCSS: `.palancas` flex en columna; el `gap` y el padding de página se aplican desde el TSX con `spacing.lg`/`spacing.xl`.
  **Referencia**: bloque `scr.palancas`. **Terminado**: build OK.
- [ ] T014 [P] [US1] Crear `src/webparts/objetivosVp/components/PalancaDetalle/PalancaBreadcrumb/PalancaBreadcrumb.tsx` (región D0; excepción C1). Props: `palancaNombre?: string`. Usa `useNavigate`.
  - `Breadcrumb` de `@fluentui/react` con `items`: `{ key: 'home', text: strings.BreadcrumbHome, onClick: () => navigate(HOME_PATH) }`, `{ key: 'palancas', text: strings.BreadcrumbPalancas, onClick: () => navigate(PALANCAS_PATH) }`, y, solo si `palancaNombre` no está vacío, `{ key: 'current', text: palancaNombre, isCurrentItem: true }` (sin nombre, por ejemplo con una palanca no encontrada, se omite la última miga); `ariaLabel={strings.BreadcrumbAriaLabel}`; `onRenderDivider` que devuelve `<span aria-hidden="true">›</span>`; `overflowIndex` no se usa.
  - `styles` con tokens: texto `typography.size[12]` y `colors.neutral.textMuted`; links (`itemLink`) `typography.weight.semibold`, `colors.brand.primary`, `textDecoration: 'underline'`; nivel actual en `typography.weight.bold` y el color Primary 800 de `colorScales`.
  - Los `onClick` reciben `(event?, item?)`: ignorar los parámetros.
  **Referencia**: `nav.crumb`, `.crumb`, `.crumb b`, `.linkBtn` (bloque `scr.objetivo`). **Terminado**: build OK.
- [ ] T015 [P] [US1] Crear `src/webparts/objetivosVp/components/PalancaDetalle/PalancaInfo/PalancaInfo.tsx` y `PalancaInfo.module.scss` (región D2). Props: `palanca: Palanca`.
  - `Surface variant="outline" padding="comfortable" header={strings.PalancaGeneralInfo}` (aproximación A4).
  - Dentro, una fila de tres columnas con ID (`formatPalancaId`), Palanca (`Nombre`) y Activa (`strings.Yes`/`strings.No` según `Activa`). Debajo, a todo el ancho, Descripción. Cada dato es una etiqueta (`typography.size[12]`, `colors.neutral.textMuted`) y un valor (`typography.size[14]`, `typography.weight.semibold`, `colors.neutral.text`). Etiquetas: `strings.PalancaFieldId`, `PalancaFieldName`, `PalancaFieldActive` y `PalancaFieldDescription`.
  - SCSS: `.grid3` con `display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));` y `.field` flex en columna. Los `gap` se aplican desde el TSX con `spacing`.
  **Referencia**: `.fSec`, `.fBand`, `.fGrid`, `.g3`, `.g1`, `.ro span`, `.ro b`. **Terminado**: build OK.
- [ ] T016 [US1] Crear `src/webparts/objetivosVp/components/PalancaDetalle/PalancaDetalle.tsx` y `PalancaDetalle.module.scss` (pantalla detalle). Props: `canManage: boolean`. Depende de T009, T014 y T015.
  - `const { id } = useParams<{ id: string }>();`, `const palancaId = Number(id);` y `const isValidId = Number.isInteger(palancaId) && palancaId > 0;`.
  - `const [state, , , , , getById] = usePalancaDataSource();`. Estado local `loadError: 'notFound' | 'error' | undefined`.
  - `useEffect` según `palancaId`: primero `setLoadError(undefined)`; después, si `!isValidId`, `setLoadError('notFound')`; si no, `getById(palancaId).catch((error: unknown) => setLoadError(isNotFoundError(error) ? 'notFound' : 'error'))`. `isNotFoundError` es una función local que estrecha `unknown` (`typeof error === 'object' && error !== null && 'status' in error`) y compara `status` con la constante local `NOT_FOUND_STATUS = 404`.
  - `palanca` visible = `state.item` solo si `state.item?.Id === palancaId` y no hay `loadError`; si no, `undefined`.
  - Render, en orden: `PalancaBreadcrumb` (con `palancaNombre` = `palanca?.Nombre`); encabezado (flex, `align-items: center`) con `Button variant="secondary" size="small" iconLeft={<FigmaIcon name="arrowCircle" />}` "Volver" → `navigate(PALANCAS_PATH)`, **siempre visible** (también con palanca no encontrada o con error), y, solo si hay `palanca`, el `h1` con `PalancaDetailTitle` (`{0}` = `formatPalancaId(Id)`, `{1}` = `Nombre`), con los mismos estilos que el título de T011, y `Chip size="small" clickable={false}` con `color="success"` y `strings.PalancaActiveChip` si está activa, o `color="neutral"` y `strings.PalancaInactiveChip` si no (A3).
  - Cuerpo: con `loadError === 'notFound'` → `MessageBar type="error" message={strings.PalancaNotFound}`; con `'error'` → `MessageBar type="error" message={strings.PalancaLoadError}`; con carga en curso y sin `palanca` → `Spinner` (desvío aprobado: componente de carga del DS); con `palanca` → `PalancaInfo`. El título y el chip solo se muestran si hay `palanca`; "Volver" se muestra siempre.
  - Pie (región D4, flex con `spacing.lg`): `Button variant="secondary"` con `strings.Cancel` → `navigate(PALANCAS_PATH)`. El botón "Editar" se agrega en US3.
  **Referencia**: bloque `scr.palanca` (`.detailHead`, `.detailHead h1`, `.chip`, `.c-ok`, `.c-none`, `.fFoot`), sin "Ubicación en la estrategia" ni "Objetivos de la palanca". **Terminado**: build OK.
- [ ] T017 [US1] Rutas de palancas en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`. Depende de T007, T013 y T016.
  - Reemplazar el `Route` `"/palanca"` (pantalla provisoria "Palanca: Bandeja") por `<Route path={PALANCAS_PATH} element={<Palancas canManage={CAN_MANAGE_PALANCAS} />} />`.
  - Reemplazar el `Route` `"/palanca/:id"` (provisoria "Palanca: Detalle") por `<Route path={PALANCA_DETAIL_PATH} element={<PalancaDetalle canManage={CAN_MANAGE_PALANCAS} />} />`.
  - Eliminar los `Route` `"/palanca/new"` y `"/palanca/edit/:id"`.
  - Eliminar completas las rutas provisorias de objetivo, iniciativa y tarea (`/objetivo`, `/objetivo/new`, `/objetivo/edit/:id`, `/objetivo/:id` y las equivalentes de `/iniciativa` y `/tarea`), con sus comentarios y textos fijos (plan, "Dónde vive"; research D8).
  - Eliminar todos los comentarios `{/* … */}` del archivo.
  - Eliminar lo que queda sin uso: `pageStyle`, `titleStyle`, `goHome`, `useNavigate` y los imports de `Button`, `colors`, `spacing` y `typography`.
  - `const CAN_MANAGE_PALANCAS = true;`, constante local al inicio del archivo (research D9; RF-19 la reemplazará).
  - Resultado: `Routes` con exactamente tres `Route`: `HOME_PATH` → `<Home />`, `PALANCAS_PATH` y `PALANCA_DETAIL_PATH`.
  **Terminado**: `#/palanca` muestra la grilla, `#/palanca/<id>` el detalle y `#/objetivo` ya no muestra la pantalla provisoria; build OK.

**Checkpoint**: US1 completa y verificable contra la lista de desarrollo.

---

## Phase 4: User Story 2 — Crear una palanca (Priority: P1)

**Goal**: "Nueva palanca" abre el formulario, valida los obligatorios y registra la palanca.

**Independent Test**: quickstart, pasos 7–11.

- [ ] T018 [US2] Crear `src/webparts/objetivosVp/components/PalancaForm/PalancaForm.tsx` y `PalancaForm.module.scss` (formulario compartido; contrato en `contracts/ui-contracts.md` sección 2). Props: `palanca?: Palanca`, `onSave: (palanca: Palanca) => Promise<void>`, `onCancel: () => void`.
  - Estado local: `nombre`, `descripcion` y `activa` (inicializados desde `palanca` o con `''`, `''`, `true`), más `submitted`, `isSaving` y `saveFailed`.
  - Validación (data-model, "Validaciones"): Nombre "obligatorio, no vacío ni solo espacios"; Descripción "obligatoria, no vacía ni solo espacios". El error es `strings.RequiredField` y se muestra solo si `submitted` y el valor recortado está vacío, así que se limpia solo al completar el campo.
  - Guardar: `setSubmitted(true)`; si hay errores, no hace nada más. Si no: `new Palanca()` con `Id` = `palanca?.Id` (solo en edición), `Nombre` = nombre recortado (el `Title` de la lista lo completa `toListItem`, T004), `Descripcion` = descripción recortada y `Activa`; `setIsSaving(true)`; `setSaveFailed(false)`; `await onSave(p)` dentro de `try/catch`. Si falla, `setSaveFailed(true)` y se conservan los datos. Siempre `setIsSaving(false)`.
  - `Modal open variant="oneSlot" closeOnOverlayClick={false}`, con `title` = `strings.PalancaFormNewTitle` o `PalancaFormEditTitle` (`{0}` = `formatPalancaId(palanca.Id)`), `description={strings.PalancaFormNote}` y `onClose={onCancel}`; `primaryAction` = `Button variant="primary" disabled={isSaving}` con `strings.Save`; `secondaryAction` = `Button variant="secondary"` con `strings.Cancel` → `onCancel`.
  - Contenido: si `saveFailed`, `MessageBar type="error" message={strings.PalancaSaveError}`; `Input label={strings.PalancaFormName} required value onChange errorMessage`; `Multiline label={strings.PalancaFormDescription} required value onChange errorMessage`; `Dropdown label={strings.PalancaFormActive} required options={[{ key: ACTIVE_KEY, text: strings.Yes }, { key: INACTIVE_KEY, text: strings.No }]} value onChange`, con `ACTIVE_KEY`/`INACTIVE_KEY` como constantes locales. El `onChange` del `Dropdown` recibe `string | string[]`: estrechar a `string`.
  - SCSS: `.fields` flex en columna (el `gap` con `spacing.lg` desde el TSX); Nombre y Descripción al 100 % de ancho.
  **Referencia**: `<sc-if value="{{m.is.palanca}}">` (`.mGrid`, `.wide`, `mPn`, `mPd`, `mPa`); botones "Cancelar"/"Guardar" (`var close`, `save`) y error "Este campo es obligatorio." (`R`). **Terminado**: build OK.
- [ ] T019 [US2] Alta desde la grilla en `src/webparts/objetivosVp/components/Palancas/Palancas.tsx`. Depende de T013 y T018.
  - Tomar `addItem` del hook (`const [state, getItems, addItem] = …`).
  - Estado local `form: { mode: 'new' } | { mode: 'edit'; palanca: Palanca } | undefined` y `successMessage: string | undefined`.
  - Pasar `onNew={() => setForm({ mode: 'new' })}` a `PalancasHeader`.
  - Si `form` está definido, renderizar `PalancaForm` (sin `palanca` en modo `new`). `onSave`: `setLastOperation('save')`; `await addItem(p)` (si rechaza, el error sube al formulario); luego `setForm(undefined)` y `setSuccessMessage(Utils.replaceAll(strings.PalancaCreated, '{0}', p.Nombre ?? ''))`. `onCancel` → `setForm(undefined)`.
  - `Toast variant="success" open={successMessage !== undefined} message={successMessage ?? ''} duration={TOAST_DURATION_MS} onClose={() => setSuccessMessage(undefined)}`, con `TOAST_DURATION_MS = 7000` como constante local (prototipo: `notify`, 7 s).
  - Una palanca creada con Activa = No no aparece, por el filtro de T013.
  **Terminado**: quickstart, pasos 7–11; build OK.

**Checkpoint**: US1 + US2 = MVP de la entrega 1 (cargar las palancas del año).

---

## Phase 5: User Story 3 — Editar una palanca (Priority: P2)

**Goal**: editar nombre y descripción desde la grilla y desde el detalle.

**Independent Test**: quickstart, pasos 12 y 17 (solo la edición), y S2 contra SharePoint.

- [ ] T020 [US3] Edición desde la grilla en `src/webparts/objetivosVp/components/Palancas/Palancas.tsx`. Depende de T019.
  - Tomar `editItem` del hook (cuarto elemento).
  - Pasar `onEdit={(palanca) => setForm({ mode: 'edit', palanca })}` a `PalancasTable`.
  - En modo `edit`, `PalancaForm palanca={form.palanca}`. `onSave`: `setLastOperation('save')`; `await editItem(p)` (relanza si falla, T002); luego `setForm(undefined)` y `setSuccessMessage(Utils.replaceAll(strings.PalancaUpdated, '{0}', p.Nombre ?? ''))`.
  **Terminado**: quickstart, paso 12; build OK.
- [ ] T021 [US3] Edición desde el detalle en `src/webparts/objetivosVp/components/PalancaDetalle/PalancaDetalle.tsx`. Depende de T016 y T018.
  - Tomar `editItem` del hook (`const [state, , , editItem, , getById] = …`).
  - Estado local `isFormOpen` y `successMessage`.
  - Pie: si `canManage` y hay palanca, agregar después de "Cancelar" `Button variant="primary"` con `strings.Edit` → `setIsFormOpen(true)`.
  - Con `isFormOpen`, `PalancaForm palanca={state.item}`. `onSave`: `await editItem(p)`; luego `setIsFormOpen(false)` y aviso `PalancaUpdated`. `onCancel` → `setIsFormOpen(false)`.
  - `Toast` igual que en T019, con su propia constante `TOAST_DURATION_MS = 7000`.
  - El detalle muestra `state.item`, que el hook actualiza después de `editItem`.
  **Terminado**: quickstart, paso 17 (edición del nombre o la descripción); build OK.

---

## Phase 6: User Story 4 — Inactivar una palanca (Priority: P2)

**Goal**: marcar Activa = No desde la edición, sin eliminar.

**Independent Test**: quickstart, pasos 6, 13, 17, 18 y 22.

- [ ] T022 [US4] Verificar la inactivación, que ya implementan T018, T020 y T021 a través del campo Activa del formulario (no hay una acción "Inactivar" aparte; spec, supuestos):
  - Desde la grilla, Activa = No: la palanca desaparece de la grilla y de la búsqueda (filtro de T013).
  - Desde el detalle: el detalle sigue abierto y muestra el chip "Inactiva" y Activa = No.
  - Ninguna pantalla tiene acción de eliminar.
  Si algún punto falla, corregirlo en el archivo de la tarea que lo implementa (`Palancas/Palancas.tsx` o `PalancaDetalle/PalancaDetalle.tsx`), sin agregar código nuevo. **Terminado**: quickstart, pasos 6, 13, 17, 18 y 22 contra la lista de desarrollo (autorización de T024); build OK.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T023 Revisión de reglas sobre los archivos nuevos y modificados (`src/core/api/useDatasource.ts`, `src/core/api/Palanca/`, `src/core/entities/Palanca.ts`, `src/webparts/objetivosVp/components/`): sin hexadecimales ni px en código nuevo; sin `any`; sin comentarios; sin `window.`, `history.` ni `Utils.open*`; sin rutas escritas como texto fuera de `routes.ts`; sin imports del índice de `core` ni de `core/ui`; `Breadcrumb` de Fluent solo en `PalancaBreadcrumb.tsx`; textos solo desde `strings`. Corregir lo que aparezca. **Terminado**: `npm run build` OK.
- [ ] T024 **Requiere autorización explícita para escribir solo en la lista `Palanca` del sitio de desarrollo, nunca en producción** (la misma de T026): ejecutar `specs/002-palancas-estrategicas/quickstart.md`, secciones 1 y 2 (pasos 1–22), en el workbench hospedado del sitio de desarrollo, y anotar el resultado. No forzar el mock ni tocar la condición de `useDatasource`. **Observación (SC-001)**: medir a mano, en el paso 10, que crear una palanca desde la grilla lleve menos de 1 minuto, y anotar el tiempo. **Terminado**: todos los pasos dan el resultado esperado y el alta lleva menos de 1 minuto; si no se autoriza, informarlo como validación pendiente.
- [ ] T025 Revisión visual (quickstart, sección 4) lado a lado con el prototipo: grilla, detalle y modal. Admitidos solo los elementos excluidos por FR-020, las migas de pan, el indicador de carga y las aproximaciones A1–A5. **Terminado**: sin diferencias no admitidas.
- [ ] T026 **Requiere la misma autorización que T024 (solo la lista de desarrollo, nunca producción)**: quickstart, sección 3 (S1–S7) contra la lista `Palanca` real. **Terminado**: S1–S7 dan el resultado esperado; si no se autoriza, informarlo como validación pendiente.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: hecho.
- **Foundational (Phase 2)**: T002, T003, T004, T005, T006, T007 y T008 en paralelo (archivos distintos); T009 después de T005.
- **US1 (Phase 3)**: después de la Phase 2. T010, T011, T012, T014 y T015 en paralelo; T013 (necesita T011 y T012); T016 (necesita T014 y T015); T017 (necesita T013 y T016).
- **US2 (Phase 4)**: T018 después de la Phase 2 (se puede adelantar en paralelo con US1); T019 después de T013 y T018.
- **US3 (Phase 5)**: T020 después de T019; T021 después de T016 y T018. T020 y T021 son archivos distintos: en paralelo.
- **US4 (Phase 6)**: después de T020 y T021.
- **Polish (Phase 7)**: al final. T024 y T026 dependen de la autorización.

### User Story Dependencies

- **US1**: solo la Phase 2.
- **US2**: necesita la grilla de US1 (T013) para tener dónde abrir el alta.
- **US3**: necesita el formulario (T018), la grilla (US1) y el detalle (US1).
- **US4**: se apoya en la edición (US3).

### Parallel Opportunities

```text
Phase 2:  T002 · T003 · T004 · T005 · T006 · T007 · T008   (después: T009)
US1:      T010 · T011 · T012 · T014 · T015 · T018 (US2)
          → T013, T016 → T017
US3:      T020 · T021
```

---

## Implementation Strategy

### MVP (US1 + US2)

1. Phase 2 completa.
2. US1 (T010–T017): verificar contra la lista de desarrollo la navegación desde la home, la grilla, la búsqueda, Actualizar y el detalle.
3. US2 (T018–T019): verificar el alta.
4. **Parar y validar**: con esto ya se pueden cargar las palancas del año (entrega 1).

### Incremental

1. US3 (T020–T021): edición desde la grilla y desde el detalle.
2. US4 (T022): verificación de la inactivación.
3. Polish (T023–T026).

---

## Notes

- Los ajustes a la Home que vinieron con el merge ya están resueltos (plan, "Ajustes a la Home que vinieron con el merge del router"; commit `1689f29`).
- No correr `npm audit fix`: puede subir versiones incompatibles con SPFx 1.22.2.
- Hacer un commit por tarea o por grupo lógico, sin mezclar con T000.
