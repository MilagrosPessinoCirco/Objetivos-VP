# Implementation Plan: Palancas estratégicas (ABM y vista)

**Branch**: `002-palancas-estrategicas` | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-palancas-estrategicas/spec.md`

## Summary

Agregar dos pantallas al webpart `objetivosVp`: la "Galería de palancas estratégicas" (grilla de palancas activas, búsqueda por ID y nombre, Actualizar y Nueva palanca) y el detalle de una palanca (migas de pan, información general, Editar). Alta, edición e inactivación comparten un formulario modal. El acceso "Palancas y objetivos" de la home pasa a navegar a la grilla.

Enfoque técnico:

- **Datos**: se reutilizan la entidad `Palanca` y `PalancaDataSource`, que ya existen. Se agrega `PalancaMock` (principio III). `Palanca.toListItem()` copia `Nombre` en `Title` (C4).
- **Errores**: `useDatasource` pasa a relanzar los errores de `editItem` y `getById`, para que ninguna pantalla muestre un éxito falso (C2). El cambio se registra en `docs/plantilla-cambios.md`.
- **Navegación**: el `HashRouter` de `react-router-dom` que trajo el merge de la rama `Router`. Rutas `/palanca` (grilla) y `/palanca/:id` (detalle), definidas en `components/ObjetivosVp/routes.ts`. La home vuelve a los cinco accesos de la 001 y solo "Palancas y objetivos" navega.
- **Interfaz**: componentes del Design System, más dos desvíos registrados: `Breadcrumb` de Fluent UI v8 para las migas (C1) y el encabezado de la grilla compuesto a mano, porque `TableFilters` no se puede usar.
- **Permisos**: una prop `canManage` agrupa las acciones de administración, para restringirlas en RF-19.

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, configuración heredada de `@microsoft/spfx-web-build-rig` (`tsconfig.json` solo hace `extends`)

**Primary Dependencies**: SPFx `1.22.2` (`@microsoft/sp-*`), React `17.0.1`, Fluent UI v8 (`@fluentui/react ^8.106.4`), PnPjs `@pnp/sp 4.18.0` (modelo `spfi` de `core/pnp/sp/pnpjs-presets.ts`), `react-router-dom 6.30.6`. Esta feature no agrega dependencias. `react-router-dom` llegó con el merge de la rama `Router` (commit `ce61724`), por decisión de la usuaria; es compatible con React 17 (`peerDependency` `react >=16.8`) y se instaló con `npm ci` desde el `package-lock.json`.

**Storage**: lista de SharePoint `Palanca` (`Lista.Palanca`), que ya existe. Columnas `Title`, `Nombre`, `Descripcion` y `Activa` (ver [data-model.md](./data-model.md)). Mock en memoria fuera de SharePoint.

**Testing**: no hay runner de pruebas declarado. Validación: `npm run build` (= `npm run lint && heft build --clean`, principio V), los escenarios de [quickstart.md](./quickstart.md) con el mock (`npm start`) y contra la lista real, y comparación visual con el prototipo.

**Target Platform**: SharePoint Online, navegador de escritorio

**Project Type**: webpart SPFx (toolchain Heft, según los scripts de `package.json`)

**Performance Goals**: la grilla y el detalle se muestran en menos de 3 s con decenas de palancas (SC-006, RNF-05). Una sola consulta por pantalla.

**Constraints**: ancho de escritorio; sin colores, tipografías ni espaciados fuera del Design System; `src/core/ui` de solo lectura; textos en español (Argentina) con el mecanismo de localización existente; sin acción de eliminar.

**Scale/Scope**: 2 pantallas nuevas y 1 formulario compartido, 1 mock nuevo, 1 módulo de rutas nuevo, 3 archivos de `core` modificados, `ObjetivosVp.tsx` y 3 archivos de la home modificados, 44 claves de texto nuevas.

## Precondición (resuelta)

La compilación base fallaba con 13 errores de TypeScript por `components/Home/Home/`, una copia anidada de la Home con imports rotos. Se resolvió así:

1. Merge de la rama `Router` (commit `ce61724`). Borra la copia anidada y pasa su contenedor de página a la Home real. Se conservó el `.vscode/launch.json` de 002.
2. `npm ci` para instalar `react-router-dom` desde el `package-lock.json`.
3. **T000** (commit `8ebcbd1`, separado): borra `assets/assets/backgroundHome.png`, idéntica a la que usa `WelcomeCard`, y la entrada vacía `srcwebpartsobjetivosVpassets` de la raíz.

`npm run build` pasa sin errores después de los tres pasos.

**Pendiente de la usuaria, fuera de esta feature**: el merge dejó los accesos de la home más juntos (`rowGap: spacing.sm` y `justify-content: center` en `AccessList`), mientras que el plan de la 001 aprobó `spacing.lg` (Q7). Esta feature no toca esos estilos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | SPFx 1.22.2, React 17.0.1, Fluent UI v8 y PnPjs 4.18 ya declarados. `react-router-dom 6.30.6` llegó con el merge de `Router`, por decisión explícita registrada en este plan (Technical Context). Esta feature no agrega dependencias: `Breadcrumb` es parte de `@fluentui/react`. |
| II. La interfaz no se inventa | ✅ Cumple, con desvíos aprobados | Pantallas tomadas de `scr.palancas`, `scr.palanca` y `m.is.palanca` del prototipo, sin los elementos de otras features (FR-020). Desvíos aprobados: las migas de pan (spec, P3-A), `Breadcrumb` de Fluent UI v8 (C1) y el encabezado de la grilla compuesto a mano. Las aproximaciones visuales están listadas en "Aproximaciones". |
| II. `core/ui` de solo lectura | ✅ Cumple | No se modifica el Design System. |
| II. Estructura de pantalla | ✅ Cumple | `Palancas/` y `PalancaDetalle/`, cada una con su `.tsx` y `.module.scss` y las piezas en subcarpetas. El formulario `PalancaForm/` lo usan las dos pantallas, por eso va al mismo nivel. |
| II. Textos en español (AR) | ✅ Cumple | 44 claves nuevas en `loc/` ([contracts](./contracts/ui-contracts.md#4-textos-locmystringsdts-y-locen-usjs)). |
| III. Datos desacoplados | ✅ Cumple | Las pantallas usan solo `usePalancaDataSource`. Se agrega `PalancaMock`. Tipos en `core/entities/Palanca.ts` (existe). |
| IV. Simplicidad y cambios acotados | ✅ Cumple, con un cambio en `core` | Cambios en `core`: `useDatasource.ts` (C2), `Palanca.ts` (C4) y `usePalancaDataSource.ts` (mock). Son necesarios y están aprobados. Sin capas nuevas: el filtro de activas, la búsqueda y la validación viven en las piezas que los usan. |
| V. Validación | ✅ Cumple | La compilación base pasa después del merge y de T000 (ver Precondición). Cada tarea termina con `npm run build` sin errores. |

**Desvíos justificados** (también en Complexity Tracking):

1. Migas de pan en el detalle, que el prototipo no tiene (spec, P3-A), con `Breadcrumb` de Fluent UI v8 (C1).
2. Encabezado de la grilla compuesto a mano (`div` flex con piezas del DS) en lugar del patrón `TableFilters` del DS.
3. Cambio en `src/core/api/useDatasource.ts`, la plantilla compartida (C2), registrado en `docs/plantilla-cambios.md`.

**Re-check post-diseño**: sin cambios en la evaluación. C1–C4, T000 y el router están resueltos.

## Descripción de las pantallas por regiones

Referencias del CSS de `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`. Los px son los del prototipo; en la implementación se usa el token más cercano del Design System, igual que en la feature 001 (Q7).

### Grilla (`scr.palancas`)

| # | Región | Referencia y medidas | Contenido |
|---|---|---|---|
| G1 | Encabezado izquierdo | `.lHead` > `.lTitle`: "Volver" (`.volver`: texto `#0451DD` 16 px, círculo azul de 24 px con flecha) y `h1` 21 px, peso 400, `#1c3d72` | "Volver" · "Galería de palancas estratégicas" |
| G2 | Herramientas | `.lTools`, 10 px entre piezas, alineadas a la derecha | Búsqueda "Buscar palanca", botón "Actualizar" (solo ícono, con tooltip), "Nueva palanca" (`.tTer`: fondo `#015F7F`, texto blanco, ícono "+"). **Excluidos** (FR-020): "Pesos VP RRII", "Filtros", "Cargar objetivo". |
| G3 | Línea de resumen | `.lCount` | **Excluida** (FR-020). |
| G4 | Tabla | `.lt` / `.lr` (13 px, filas de 42 px, borde `#DBDBDB`), encabezado `.lh` (12 px, 600, fondo `#F1F1F1`) | Columnas ID (`PAL-n`), Palanca, Descripción y Acciones (alineada a la derecha: lápiz "Editar palanca" y flecha "Ver palanca", con tooltip). **Excluidas**: Expandir y Objetivos. |
| G5 | Estado vacío | `.emptyT` (centrado, `#999`, 18 px) | "No hay palancas cargadas." o "No hay palancas con esta búsqueda." |
| G6 | Aviso | `notify`: aviso temporal de 7 s | Mensaje de éxito (FR-012). |

### Detalle (`scr.palanca`)

| # | Región | Referencia y medidas | Contenido |
|---|---|---|---|
| D0 | Migas de pan (desvío) | Estilo de `nav.crumb` del detalle de objetivo: 12 px, `#5C5C5C`, links 600 `#0451DD` subrayados, separador "›", nivel actual en negrita `#02225D`, arriba del encabezado | "Inicio" › "Palancas" › [nombre] |
| D1 | Encabezado | `.detailHead`: "Volver", `h1` 21 px "PAL-n · Nombre" y el chip de estado (`.chip`: 20 px de alto, 10 px, mayúsculas; `c-ok` verde para Activa, `c-none` gris para Inactiva) | **Excluido**: "Ubicación en la estrategia". |
| D2 | Información general | `.fSec` > `.fBand` (banda `#E7EFFF`, título 14 px 600 `#02225D`); `.fGrid.g3` con ID, Palanca y Activa; debajo, Descripción a todo el ancho. Cada dato `.ro`: etiqueta 12 px `#5b5b5b` y valor 14 px 600 | ID · Palanca · Activa (Sí / No) · Descripción |
| D3 | Objetivos de la palanca | `.fSec` con la tabla de objetivos | **Excluida** (FR-020). |
| D4 | Pie | `.fFoot`: borde superior, 18 px entre botones | "Cancelar" (contorno) · "Editar" (sólido) |

### Formulario (`m.is.palanca`)

| # | Región | Contenido |
|---|---|---|
| F1 | Encabezado | Título "Nueva palanca" o "Editar palanca PAL-n"; debajo, "Las palancas no se eliminan: se marcan como inactivas." |
| F2 | Campos | Nombre * (a todo el ancho), Descripción * (área de texto a todo el ancho), Activa * (lista Sí / No) |
| F3 | Acciones | "Cancelar" · "Guardar" |

## Mapa de componentes

Fuentes consultadas: `docs/design-system-catalog.md` y las fuentes de `Table`, `TableFilters`, `Modal`, `Toast`, `Button`, `SearchBox` y `Chips`.

| Región | Componente | Variante / props | Asset | Observaciones |
|---|---|---|---|---|
| G1, D1 "Volver" | `Button` (`core/ui/components`) | `variant="secondary"`, `size="small"`, `iconLeft={<FigmaIcon name="arrowCircle" />}` | `arrowCircle` (el mismo que usa `TableFilters` para volver) | Aproximación A1. |
| G1 título, D1 título | Sin componente: `h1` con tokens | `typography.size[20]`, `weight.regular`, `colorScales` Primary 800 vía `style` (mismo método que `AccessList` en la 001) | — | El DS no tiene componente de texto (igual que la 001). 21 px → 20 px. |
| G2 Búsqueda | `SearchBox` (`core/ui/patterns`) | `placeholder={strings.PalancasSearchPlaceholder}`, `value`, `onValueChange` | ícono propio del componente | Filtra mientras se escribe. |
| G2 "Actualizar" | `Button` + `Tooltip` (`core/ui/components`) | `iconOnly`, `variant="secondary"`, `iconLeft={<FigmaIcon name="reloadPrimary" />}`, `aria-label={strings.PalancasRefresh}`; `Tooltip content={strings.PalancasRefresh}` | `reloadPrimary` | — |
| G2 "Nueva palanca" | `Button` | `variant="primary"`, `iconLeft={<FigmaIcon name="add" />}` | `add` | Aproximación A2. Solo si `canManage`. |
| G1 + G2 contenedor | **Desvío registrado**: `div` flex en `PalancasHeader.module.scss` que compone `Button`, el título, `SearchBox` y `Tooltip` | `gap` con `spacing.md`; el título a la izquierda y las herramientas a la derecha | — | El patrón del DS para este encabezado es `TableFilters`, pero no se puede usar: siempre muestra un botón "Filtrar" (fuera de alcance) y un ícono de información con texto, y rotula "Recargar" en vez de "Actualizar". Ver Complexity Tracking. |
| G4 Tabla | `Table` (`core/ui/components`) | `columns`: `id`, `nombre`, `descripcion`, `acciones` (con `render`); `getRowKey` = Id; `emptyText` = estado vacío G5 | — | Las filas son objetos planos derivados de `Palanca` (`Table` exige `Record<string, unknown>`). |
| G4 acciones | `Button` + `Tooltip` | `iconOnly`, `variant="secondary"`, `size="small"`; `edit` con `aria-label` "Editar palanca PAL-n"; `arrowForward` con `aria-label` "Abrir palanca PAL-n" | `edit`, `arrowForward` | "Editar palanca" solo si `canManage`. |
| G5 Estado vacío | `emptyText` de `Table` | texto de una línea | — | Sin ayuda adicional (criterio de diseño). |
| G6, D aviso | `Toast` (`core/ui/patterns`) | `variant="success"`, `duration={7000}`, `open` controlado, `onClose` | — | Uno por pantalla. |
| Carga | `Spinner` (`core/ui/patterns`) | sin texto | — | Mientras `isLoading` y todavía no hay datos. |
| Errores de carga | `MessageBar` (`core/ui/patterns`) | `type="error"`, `message` | — | "No se pudieron cargar las palancas.", "No se pudo cargar la palanca." o "No se encontró la palanca.". |
| D0 Migas | **`Breadcrumb` de Fluent UI v8** (C1) | `items`: Inicio (`onClick` → home), Palancas (`onClick` → grilla), nombre (`isCurrentItem`); `ariaLabel={strings.BreadcrumbAriaLabel}`; `onRenderDivider` con "›"; `styles` con tokens (`typography.size[12]`, `colors.neutral.textMuted`, `colors.brand.primary`) | — | Excepción aprobada. |
| D1 Chip | `Chip` (`core/ui/patterns`) | `size="small"`, `clickable={false}`, `color="success"` (Activa) o `"neutral"` (Inactiva) | — | Aproximación A3. |
| D2 Sección | `Surface` (`core/ui/patterns`) | `variant="outline"`, `padding="comfortable"`, `header` = "Información general" | — | Aproximación A4. |
| D2 Datos | Sin componente: etiqueta y valor con tokens en `PalancaInfo.module.scss` | etiqueta `typography.size[12]` `colors.neutral.textMuted`; valor `typography.size[14]` semibold; grilla de 3 columnas con `spacing` | — | El DS no tiene campo de solo lectura que no parezca un input. |
| D4 Pie | `Button` ×2 | "Cancelar" `variant="secondary"`; "Editar" `variant="primary"` (solo si `canManage`) | — | — |
| F Formulario | `Modal` (`core/ui/patterns`) | `variant="oneSlot"`, `title`, `description={strings.PalancaFormNote}`, `closeOnOverlayClick={false}`, `primaryAction` = `Button` "Guardar" (`disabled` mientras guarda), `secondaryAction` = `Button variant="secondary"` "Cancelar", `onClose` = cancelar | — | Hay que pasar las dos acciones: el `Modal` trae "Send" y "Don't send" por defecto. |
| F2 Nombre | `Input` (`core/ui/components`) | `label`, `required`, `value`, `errorMessage` | — | — |
| F2 Descripción | `Multiline` (`core/ui/components`) | `label`, `required`, `value`, `errorMessage` | — | — |
| F2 Activa | `Dropdown` (`core/ui/components`) | `label`, `required`, `options` Sí / No, `value` | — | En el alta arranca en Sí. |
| F error al guardar | `MessageBar` | `type="error"`, `message={strings.PalancaSaveError}`, dentro del `Modal` | — | FR-016: los datos se conservan. |
| Home: acceso | `AccessButton` (local de la 001) | `onClick` opcional nuevo | — | Solo "Palancas y objetivos" lo recibe. |

### Aproximaciones (a confirmar en la revisión visual)

| # | Elemento | Prototipo | Resolución | Motivo |
|---|---|---|---|---|
| A1 | "Volver" | Texto azul sin borde, con círculo azul y flecha blanca | `Button secondary small` con `arrowCircle` a la izquierda | El DS no tiene botón de texto; el único "volver" del DS está dentro de `TableFilters`, que no se puede usar. |
| A2 | "Nueva palanca" | Botón azul petróleo (`#015F7F`) | `Button primary` (azul de marca) | El DS no tiene variante terciaria. |
| A3 | Chip ACTIVA / INACTIVA | Verde claro / gris, mayúsculas | `Chip success` / `Chip neutral`, texto "Activa" / "Inactiva" | Se usan los colores semánticos del DS. |
| A4 | Banda "Información general" | Banda celeste `#E7EFFF` | `header` de `Surface outline` | El DS no tiene banda de sección. |
| A5 | Tipografías | 21, 13 y 12 px | Tokens 20, 14 y 12 px | Mismo criterio que la feature 001 (Q7). |

## Decisiones sobre las consultas

**C1 · Migas de pan (resuelta).** `Breadcrumb` de Fluent UI v8, estilado con tokens. Excepción aprobada (research D7).

**C2 · Errores de `useDatasource` (resuelta).** `editItem` y `getById` relanzan el error además de marcarlo en el estado. En el mismo cambio, el reductor `ERROR` apaga `isLoading` y `addItem` despacha `ERROR` antes de relanzar. Así el estado queda coherente y no hay un indicador de carga eterno. Se registra en `docs/plantilla-cambios.md` (archivo nuevo, mismo formato que `docs/design-system-cambios.md`) (research D4).

**C3 · Formato del ID (resuelta).** `PAL-<Id>` (research D6).

**C4 · Title (resuelta).** `Title` = `Nombre` al crear y al editar. Es el patrón para las demás entidades con nombre (research D5).

## Comportamiento

### Grilla (`Palancas.tsx`)

- Al montar llama a `getItems()`. Es un `useEffect` que sincroniza con la lista, así que es un uso permitido.
- **Filas visibles**: se calculan durante el render, sin estado duplicado. Se toman las palancas con `Activa === true`. Si hay búsqueda, se queda con las que tienen el texto (recortado y en minúsculas) dentro de `PAL-<Id>` o del nombre, también en minúsculas. Se ordenan por nombre con `localeCompare(…, 'es')`.
- **Estado vacío**: con búsqueda, "No hay palancas con esta búsqueda."; sin búsqueda, "No hay palancas cargadas.".
- **"Actualizar"**: vuelve a llamar a `getItems()` y conserva el texto de búsqueda.
- **Error de carga**: si `state.error` está activo y no hay un formulario abierto, muestra el `MessageBar` de error en lugar de la tabla.
- **Navegación**: "Volver" → `navigate(HOME_PATH)`; "Ver palanca" → `navigate(getPalancaPath(id))`.
- **Formulario**: el estado local `form` es `{ mode: 'new' }`, `{ mode: 'edit', palanca }` o `null`. `onSave` llama a `addItem` o `editItem`, que relanzan si fallan. Si salen bien, cierra el formulario y muestra el aviso de éxito con el nombre guardado. Si la palanca quedó inactiva, desaparece de la grilla por el filtro.

### Detalle (`PalancaDetalle.tsx`)

- Al montar llama a `getById(id)` dentro de `try/catch`. Si falla con estado HTTP 404, muestra "No se encontró la palanca."; con cualquier otro error, "No se pudo cargar la palanca.". Las migas y "Volver" siguen disponibles.
- Muestra `state.item`. Después de `editItem`, el hook actualiza `state.item`, así que el detalle refleja el cambio. Si la palanca quedó inactiva, el chip pasa a "Inactiva" y la pantalla sigue abierta.
- El Id sale de `useParams`. Si no es un entero positivo, muestra "No se encontró la palanca." sin consultar la lista.
- Migas: Inicio → `navigate(HOME_PATH)`; Palancas → `navigate(PALANCAS_PATH)`; el nombre es el nivel actual. "Volver" y "Cancelar" → `navigate(PALANCAS_PATH)`.
- Con el router, el detalle también se abre con un enlace directo (`#/palanca/<Id>`), incluso para una palanca inactiva, que se muestra con el chip "Inactiva" (research D8b).

### Formulario (`PalancaForm.tsx`)

Ver [contracts](./contracts/ui-contracts.md#2-props-de-las-piezas). Los errores en línea aparecen al intentar guardar y se limpian cuando el campo deja de estar vacío.

### Errores y registro

- `useDatasource` ya registra los errores con `console.error` (logging existente). Las pantallas no los vuelven a registrar: solo los muestran.
- No se muestran datos sensibles ni el error técnico en pantalla.

## Dónde vive

- **Webpart**: `objetivosVp`, el único del repo.
- **Rutas**: en `ObjetivosVp.tsx` (`HashRouter`, del merge de `Router`) se cambian solo las rutas de palancas. `PALANCAS_PATH` → `<Palancas canManage />` y `PALANCA_DETAIL_PATH` → `<PalancaDetalle canManage />`, que reemplazan las pantallas provisorias "Palanca: Bandeja" y "Palanca: Detalle" con sus comentarios `TODO`. Se quitan `/palanca/new` y `/palanca/edit/:id`. Las rutas provisorias de objetivo, iniciativa y tarea no se tocan.
- **Home**: vuelve a los cinco accesos de la spec 001, con los títulos, íconos y colores aprobados en su plan. Solo "Palancas y objetivos" navega (`PALANCAS_PATH`). Los demás no reciben `onClick` y no tienen acción, como en la 001. El contenedor de página que trajo el merge se conserva.
- **Textos**: 44 claves nuevas en `loc/mystrings.d.ts` y `loc/en-us.js`, sincronizadas y con valores en español (Argentina). Además se restaura `AccessLeversObjectives` y se quitan `AccessLevers` y `AccessObjectives`, que quedan sin uso. No se crea ningún idioma nuevo.

### Estructura de carpetas

```text
specs/002-palancas-estrategicas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contracts.md
└── tasks.md                          # lo genera /speckit-tasks

docs/
└── plantilla-cambios.md              # nuevo: registro de cambios a la plantilla (C2)

src/core/
├── api/
│   ├── useDatasource.ts              # editItem y getById relanzan; ERROR apaga isLoading; addItem despacha ERROR (C2)
│   └── Palanca/
│       ├── PalancaMock.ts            # nuevo: IPalancaDataSource en memoria (D2)
│       └── usePalancaDataSource.ts   # pasa new PalancaMock()
└── entities/
    └── Palanca.ts                    # toListItem: Title = Nombre (C4)

src/webparts/objetivosVp/
├── loc/
│   ├── en-us.js                      # + 44 claves; restaura AccessLeversObjectives
│   └── mystrings.d.ts                # + 44 claves; restaura AccessLeversObjectives
└── components/
    ├── ObjetivosVp/
    │   ├── ObjetivosVp.tsx           # rutas de palancas: grilla y detalle; quita new y edit
    │   └── routes.ts                 # nuevo: HOME_PATH, PALANCAS_PATH, PALANCA_DETAIL_PATH, getPalancaPath (D8)
    ├── Home/
    │   └── AccessList/
    │       ├── AccessList.tsx        # cinco accesos de la 001; solo "Palancas y objetivos" navega
    │       └── AccessButton.tsx      # onClick vuelve a ser opcional
    ├── Palancas/                     # pantalla: grilla
    │   ├── Palancas.tsx              # carga, filtro, búsqueda, formulario y aviso
    │   ├── Palancas.module.scss
    │   ├── formatPalancaId.ts        # PAL-<Id> (D6)
    │   ├── PalancasHeader/
    │   │   ├── PalancasHeader.tsx    # Volver, título, búsqueda, Actualizar, Nueva palanca (G1, G2)
    │   │   └── PalancasHeader.module.scss
    │   └── PalancasTable/
    │       └── PalancasTable.tsx     # Table con columnas y acciones (G4, G5)
    ├── PalancaDetalle/               # pantalla: detalle
    │   ├── PalancaDetalle.tsx        # carga por Id, encabezado, pie, formulario y aviso
    │   ├── PalancaDetalle.module.scss
    │   ├── PalancaBreadcrumb/
    │   │   └── PalancaBreadcrumb.tsx # Breadcrumb Fluent v8 (D0)
    │   └── PalancaInfo/
    │       ├── PalancaInfo.tsx       # Información general (D2)
    │       └── PalancaInfo.module.scss
    └── PalancaForm/                  # formulario compartido por las dos pantallas
        ├── PalancaForm.tsx
        └── PalancaForm.module.scss
```

**Structure Decision**: una carpeta por pantalla (`Palancas/`, `PalancaDetalle/`) con sus piezas en subcarpetas, más `PalancaForm/` al mismo nivel porque lo usan las dos. No se crean hooks, servicios ni constantes transversales nuevas. `routes.ts` concentra las rutas que comparten las pantallas, la home y el router, para no repetir textos de ruta (research D8). Vive junto al router, no en `core`, porque las rutas son del webpart. `formatPalancaId` es una función de presentación que usan las dos pantallas y el formulario, y vive junto a la grilla. Los `.module.scss.ts` son artefactos de compilación (`*.scss.ts` está en `.gitignore`).

## Orden de implementación

| # | Paso | Depende de |
|---|---|---|
| T000 | **Hecho** (commit `8ebcbd1`): limpieza de la imagen duplicada y de la entrada vacía de la raíz | merge de `Router` (commit `ce61724`) |
| 1 | `useDatasource.ts` (C2) y `docs/plantilla-cambios.md` | — |
| 2 | `Palanca.ts` (C4), `PalancaMock.ts` y `usePalancaDataSource.ts` | 1 |
| 3 | Claves de texto en `loc/` | — |
| 4 | Navegación: `routes.ts`, rutas de palancas en `ObjetivosVp.tsx` (con pantallas mínimas), `AccessList.tsx` y `AccessButton.tsx` | 3 |
| 5 | Grilla: `formatPalancaId`, `PalancasHeader`, `PalancasTable` y `Palancas` (US1) | 2, 4 |
| 6 | `PalancaForm` y alta desde la grilla (US2) | 5 |
| 7 | Edición e inactivación desde la grilla (US3, US4) | 6 |
| 8 | Detalle: `PalancaBreadcrumb`, `PalancaInfo`, `PalancaDetalle` y edición desde el detalle | 6 |
| 9 | Validación con [quickstart.md](./quickstart.md) | 7, 8 |

## Interfaz y Design System

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`: `scr.palancas` (grilla), `scr.palanca` (detalle), `m.is.palanca` (formulario) y `nav.crumb` del detalle de objetivo (estilo de las migas).

**Design System**: `src/core/ui` (solo lectura). Imports selectivos por capa:

```ts
import { Button, Dropdown, Input, Multiline, Table, Tooltip } from '<ruta>/core/ui/components';
import { Chip, MessageBar, Modal, SearchBox, Spinner, Surface, Toast } from '<ruta>/core/ui/patterns';
import { FigmaIcon, colorScales, colors, spacing, typography } from '<ruta>/core/ui/foundations';
import { Breadcrumb } from '@fluentui/react'; // C1, excepción aprobada
```

**Estructura de la pantalla**: ver "Estructura de carpetas".

**Imágenes e íconos**: `FigmaIcon` `arrowCircle` (Volver), `reloadPrimary` (Actualizar), `add` (Nueva palanca), `edit` (Editar palanca), `arrowForward` (Ver palanca). Sin imágenes.

### Elementos sin componente en el Design System

- Migas de pan: `Breadcrumb` de Fluent UI v8 (C1). Desvío registrado en Complexity Tracking.
- Encabezado de la grilla: compuesto a mano con piezas del DS, porque `TableFilters` no se puede usar. Desvío registrado en Complexity Tracking.
- Títulos de pantalla y datos de solo lectura: texto con tokens (mismo criterio que la feature 001).

## Complexity Tracking

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|-----------|----------------------|-------------------------------------------|
| Migas de pan que el prototipo no tiene (principio II) | Pedidas en la spec y en RF-02. Aprobadas en P3-A. | Seguir el prototipo: no cumple RF-02 ni la spec. |
| `Breadcrumb` de Fluent UI v8 fuera del DS (principio II) | El DS no tiene breadcrumb ni link. Aprobado en C1; el catálogo permite Fluent UI v8 "solo con aprobación". | Botones del DS: se ven como botones, no como migas. Agregar el componente al DS: modifica `core/ui`. |
| Encabezado de la grilla compuesto a mano (`PalancasHeader`: `div` flex con `Button`, `SearchBox`, `Tooltip` y el título con tokens) en lugar del patrón `TableFilters` del DS (principio II) | `TableFilters` siempre renderiza un botón "Filtrar" (fuera de alcance, FR-020) y un ícono de información con texto que no está en el diseño, y rotula "Recargar" en vez de "Actualizar". No se puede configurar sin modificar `core/ui`. Aprobado por la usuaria. | Usar `TableFilters` igual: muestra elementos excluidos. Modificar `TableFilters` en `core/ui`: cambia el Design System. |
| Cambio en `src/core/api/useDatasource.ts`, código de la plantilla (principio IV) | Sin él, un fallo al editar se mostraría como éxito (FR-016) y el indicador de carga no se apagaría. Aprobado en C2. Registrado en `docs/plantilla-cambios.md`. | Hook propio de la pantalla: duplica la lógica del hook compartido. Observar `state.error`: es frágil. |
| Aproximaciones visuales A1–A5 | El DS no tiene botón de texto, variante terciaria, banda de sección ni los tamaños exactos del prototipo. | Valores propios: violan el principio II. |
