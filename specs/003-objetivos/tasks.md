---

description: "Tareas de implementación de Objetivos (alta, edición, vista y su lugar dentro de palancas)"
---

# Tasks: Objetivos (alta, edición, vista y su lugar dentro de palancas)

**Input**: `specs/003-objetivos/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**: feature 002 completa y compilando (`npm run build` sin errores); `npm ci` ejecutado; prototipo `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`; `docs/design-system-catalog.md`; listas `Objetivo`, `Vicepresidencia` (con una VP llamada "VP RRII"), `Departamento` y `Gerencia` ya existentes en el sitio de desarrollo, y la columna `Estado` de `Objetivo` con los valores de `Constants.Estado` (ver T001).

**Tests**: no se solicitan. El repo no declara runner de pruebas. La validación es `npm run build`, los escenarios de `quickstart.md` y la comparación visual con el prototipo.

**Organization**: tareas agrupadas por historia de usuario. Cada tarea indica el archivo exacto, los componentes del Design System (DS), su **Referencia** en el prototipo y su criterio de terminado.

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: historia de `spec.md` (US1 cargar objetivo de la VP RRII, US2 cargar objetivo de otra VP, US3 objetivos dentro de palancas, US4 detalle de objetivo, US5 editar objetivo).

## Orden de las fases

Las fases siguen la dependencia, no la prioridad: el detalle de objetivo (US4, P2) va primero porque el alta (US1), la edición (US5) y las listas (US3) navegan a él. Las prioridades de `spec.md` no cambian.

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores, lo que incluye lint y tipos. Es parte del criterio de terminado.
- **Referencia al prototipo (constitución II)**: el markup está en los bloques `<sc-if value="{{scr.form}}">` (formulario, rama `fm.isObj`/`fm.isRrii`), `<sc-if value="{{scr.objetivo}}">` (detalle) y `<sc-if value="{{scr.palancas}}">` (grilla). **No reproducir** (FR-033): avance, "Ubicación en la estrategia", iniciativas, columnas "Dirección" y "Responsable" por persona, "Cantidad de años", la leyenda "Asignado en … sin este objetivo", el botón de despliegue de objetivos en la grilla ni los botones de edición por sección del detalle.
- **`src/core/ui` es de solo lectura.**
- **Imports por capa, nunca el índice de `core` ni de `core/ui`**:
  - DS: `…/core/ui/components` (`Button`, `Callout`, `Dropdown`, `Input`, `Multiline`, `SpinButton`, `Switch`, `Table`, `Tooltip`), `…/core/ui/patterns` (`Chip`, `MessageBar`, `Picker`, `Spinner`, `Surface`, `Tabs`, `Toast`), `…/core/ui/foundations` (`FigmaIcon`, `colors`, `spacing`, `typography`).
  - Datos: `…/core/entities` (`Objetivo`, `Palanca`, …), hooks `…/core/api/<Entidad>/use<Entidad>DataSource` (default), constantes `…/core/utils/Constants`, `…/core/utils` (`Utils`).
  - Profundidad: desde `components/<Pantalla>/<Archivo>.tsx` → `../../../../core/…`; desde `components/<Pantalla>/<Pieza>/<Archivo>.tsx` → `../../../../../core/…`.
- **Excepción aprobada (002, C1)**: `Breadcrumb` de `@fluentui/react` solo en `PalancaBreadcrumb.tsx`. Ningún otro import directo de Fluent UI en código nuevo.
- **Navegación**: solo con `useNavigate`, `useParams`, `useLocation` y `useSearchParams` de `react-router-dom` y las constantes de `components/ObjetivosVp/routes.ts`. Prohibido `window.location`, `window.open`, `history.pushState`, anclas manuales, `Utils.openInSelfTab`/`openInNewTab` y rutas escritas como texto fuera de `routes.ts`.
- **Tokens**: colores, tipografías y espaciados solo desde `colors`, `spacing` y `typography`, aplicados con `style`. Los `.module.scss` llevan solo estructura (display, flex/grid, alineación, anchos relativos). **Prohibido escribir hexadecimales o px de espaciado o tipografía en código nuevo.** Para el título de pantalla usar `PAGE_TITLE_STYLE` de `components/shared/pageTitleStyle.ts`.
- **Textos**: siempre desde `import * as strings from 'ObjetivosVpWebPartStrings';` (claves de T008). Los textos con `{0}`/`{1}` se completan con `Utils.replaceAll(texto, '{0}', valor)`. Las etiquetas de Estado y Duración son los valores de los enums `Estado` y `Duracion` de `Constants.ts` (ya están en español). Ningún otro texto visible escrito en el código.
- **TypeScript estricto, sin `any`, sin comentarios de código, sin literales mágicos** (números sueltos como la duración del aviso o el rango del peso van a constantes locales con nombre).
- **Hooks**: `useEffect` solo para cargar datos al montar. Filas visibles, conteos, filtros, opciones de los desplegables y estados vacíos se calculan durante el render, sin estado duplicado ni `useMemo`.
- **Permisos (FR-031, FR-032)**: "Cargar objetivo" se muestra solo si `canCreateObjetivo` es `true`; "Editar" del detalle de objetivo solo si `canEditObjetivo` es `true`. Son dos props separadas. Ninguna pantalla ofrece eliminar (FR-019): no se usa `deleteItem`.
- **Errores**: no registrar errores en las pantallas (ya los registra `useDatasource`); solo mostrarlos en una línea (`MessageBar type="error"`), sin el error técnico. Nunca mostrar un éxito si la operación falló.
- **No editar** archivos `*.module.scss.ts` (artefactos). **No modificar** `spec.md` ni `plan.md`; si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo.

## Path Conventions

Raíz del webpart: `src/webparts/objetivosVp/`. Pantallas nuevas: `components/Objetivo/ObjetivoForm/` y `components/Objetivo/ObjetivoDetalle/`. Compartido: `components/Objetivo/ObjetivosTable/` y `components/Objetivo/objetivoUtils.ts`. Pantallas de la 002 que se extienden: `components/Palanca/Palancas/` y `components/Palanca/PalancaDetalle/`.

---

## Phase 1: Setup

- [ ] T001 Verificar las precondiciones de datos (sin código) y la base de compilación. Registrar el resultado en el mensaje de la tarea, sin tocar archivos:
  1. `npm run build` pasa antes de empezar.
  2. En el sitio de desarrollo: la lista `Vicepresidencia` tiene una VP con `Nombre` "VP RRII"; la columna `Estado` de la lista `Objetivo` tiene "En curso", "Finalizado cumplido" y "Finalizado incumplido" (valores de `Estado` en `src/core/utils/Constants.ts`) y la opción "No iniciada" (que T002 suma al enum): si falta, agregarla en la columna con autorización o informarlo; la lista `Objetivo` tiene las columnas `Nombre`, `Descripcion`, `Palanca`, `Duracion`, `Peso`, `FechaInicio`, `FechaCompromiso`, `Estado`, `EsDeVp`, `VP`, `Departamento` y `Gerencia`, como las selecciona `src/core/api/Objetivo/ObjetivoDataSource.ts`.
  3. Si algo difiere, **detenerse** e informar el dato y el archivo afectado; no continuar.
  **Criterio de terminado**: build verde y las tres verificaciones confirmadas o informadas.
  **Estado**: pendiente. El build base pasó; las verificaciones de SharePoint no se pudieron hacer desde la sesión (sin acceso al sitio de desarrollo).

---

## Phase 2: Foundational (bloquea todas las historias)

**Purpose**: constantes, entidad, mocks, textos, utilidades, rutas y migas que todas las historias necesitan.

**⚠️ CRITICAL**: ninguna historia empieza antes de terminar esta fase.

- [X] T002 [P] Agregar a `src/core/utils/Constants.ts`, al final del archivo, `export const VP_RRII_NOMBRE: string = 'VP RRII';`. Además, agregar `NoIniciada = "No iniciada"` como primer valor del enum `Estado` (hoy solo lo usa `src/core/entities/Objetivo.ts`) sin cambiar los demás valores. No tocar `Duracion` ni ningún otro enum o constante. **Criterio de terminado**: `npm run build` sin errores.

- [X] T003 [P] Ajustar `src/core/entities/Objetivo.ts`, método `toListItem`. Mantener el resto de la clase igual:
  1. Agregar `Title: this.Nombre,` justo después de `...super.toListItem(),` (FR-018, mismo patrón que `src/core/entities/Palanca.ts`).
  2. Reemplazar `Duracion: assertChoiceValue(Duracion, this.Duracion, 'Duracion'),` por `Duracion: this.Duracion === undefined ? undefined : assertChoiceValue(Duracion, this.Duracion, 'Duracion'),`. Motivo: `assertChoiceValue` lanza con `undefined` y un objetivo de otra VP no tiene duración.
  3. No cambiar `Estado` (sigue con `assertChoiceValue(Estado, this.Estado, 'Estado')`) ni `CantidadAnios`.
  **Criterio de terminado**: `npm run build` sin errores.

- [X] T004 [P] Crear `src/core/api/Vicepresidencia/VicepresidenciaMock.ts` y pasar el mock en `src/core/api/Vicepresidencia/useVicepresidenciaDataSource.ts`. Seguir exactamente el patrón de `src/core/api/Palanca/PalancaMock.ts` (arreglo a nivel de módulo, `notFoundError` con `status` 404, promesas resueltas, `listTitle = Lista.Vicepresidencia`) e implementar `IVicepresidenciaDataSource` (`getItems`, `add`, `edit`, `delete`, `getById`). Datos, creados con `new Vicepresidencia({ Id, Title: nombre, Nombre: nombre, Activo })`: `1 "VP RRII" activa`, `2 "VP Upstream" activa`, `3 "VP Downstream" activa`, `4 "VP Finanzas" activa`, `5 "VP Anterior" inactiva`. El `Nombre` del Id 1 debe salir de `VP_RRII_NOMBRE` (T002). En el hook: `return useDatasource<Vicepresidencia>(new VicepresidenciaDataSource(), new VicepresidenciaMock());` (como `usePalancaDataSource.ts`). No tocar `useItemVicepresidenciaDataSource.ts`. **Criterio de terminado**: `npm run build` sin errores.

- [X] T005 [P] Crear `src/core/api/Departamento/DepartamentoMock.ts` y pasar el mock en `src/core/api/Departamento/useDepartamentoDataSource.ts`, con el mismo patrón que T004 (`IDepartamentoDataSource`, `Lista.Departamento`). Datos: `1 "Marketing"`, `2 "Alianzas"`, `3 "Fidelización"`, creados con `new Departamento({ Id, Title: nombre, Nombre: nombre })`. No tocar `useItemDepartamentoDataSource.ts`. **Criterio de terminado**: `npm run build` sin errores.

- [X] T006 [P] Crear `src/core/api/Gerencia/GerenciaMock.ts` y pasar el mock en `src/core/api/Gerencia/useGerenciaDataSource.ts`, con el mismo patrón que T004 (`IGerenciaDataSource`, `Lista.Gerencia`). Datos, creados con `new Gerencia({ Id, Title: nombre, Nombre: nombre, Departamento: { Id: departamentoId, Title: nombreDepartamento } })`: `1 "B2B"`, `2 "B2C"`, `3 "Growth"` (departamento 1 Marketing); `4 "Convenios"` (departamento 2 Alianzas); `5 "Programas"` (departamento 3 Fidelización). No tocar `useItemGerenciaDataSource.ts`. **Criterio de terminado**: `npm run build` sin errores.

- [X] T007 [P] Crear `src/core/api/Objetivo/ObjetivoMock.ts` y pasar el mock en `src/core/api/Objetivo/useObjetivoDataSource.ts`, con el patrón de `PalancaMock.ts`. Implementa `IObjetivoDataSource` (`getItems`, `getFilteredItems(palancaId)`, `add`, `edit`, `delete`, `getById`; `listTitle = Lista.Objetivo`). Diferencias respecto de `PalancaMock`: `add` y `edit` guardan el objetivo recibido tal cual (copia con `Object.assign(new Objetivo(), item)`, asignando el siguiente Id en `add`), **sin** pasar por `toListItem`, para conservar los lookups (`VP`, `Departamento`, `Gerencia`, `Palanca`); `edit` y `getById` rechazan con `status` 404 si el Id no existe. Datos, creados con `new Objetivo({ Id, Title, Nombre, Descripcion, VP: { Id, Title }, Departamento: { Id, Title }, Gerencia: { Id, Title }, Estado, … })` (los lookups usan los Id y nombres de T004 a T006 y las palancas de `PalancaMock`: 1 Excelencia comercial, 2 Experiencia de cliente, 3 Nuevos negocios, 4 Marca y portfolio, 5 Eficiencia en el canal inactiva):
  | Id | Nombre | VP | Dpto / Gerencia | Palanca | Duración | Peso | EsDeVp | Inicio / Compromiso | Estado |
  |---|---|---|---|---|---|---|---|---|---|
  | 1 | Convertir datos e insights en ventaja competitiva | VP RRII | Marketing / B2B | 1 | Anual | 20 | sí | 2026-01-01 / 2026-12-31 | En curso |
  | 2 | Nuevo motor de crecimiento a través de YPF Store | VP RRII | Marketing / B2C | 2 | Plurianual | 30 | no | 2026-01-01 / 2027-12-31 | En curso |
  | 3 | Duplicar la cantidad de clientes YPF | VP RRII | Marketing / Growth | 2 | Anual | 25 | sí | 2026-03-01 / 2026-12-31 | No iniciada |
  | 4 | Consolidar alianzas estratégicas | VP RRII | Alianzas / Convenios | 5 | Permanente | 25 | no | 2026-01-01 / 2026-12-31 | Finalizado cumplido |
  | 5 | Habilitar la movilidad eléctrica | VP Downstream | Fidelización / Programas | sin | sin | sin | sin | sin | En curso |
  | 6 | Integrar los canales de atención | VP Finanzas | Alianzas / Convenios | sin | sin | sin | sin | sin | Finalizado incumplido |
  Las palancas 3 y 4 quedan sin objetivos (para probar el estado vacío). Descripciones: una frase corta cada una. Los valores de `Estado` y `Duracion` salen de los enums de `Constants.ts`, no de literales. En el hook: `useDatasource<Objetivo>(new ObjetivoDataSource(), new ObjetivoMock())`. No tocar `useItemObjetivoDataSource.ts`. **Criterio de terminado**: `npm run build` sin errores.

- [X] T008 [P] Agregar las claves de texto a `src/webparts/objetivosVp/loc/mystrings.d.ts` (dentro de `IObjetivosVpWebPartStrings`, como `string`) y a `src/webparts/objetivosVp/loc/en-us.js` (con el valor en español), sincronizadas y sin tocar las claves existentes. No crear otro idioma. Claves y valores:
  | Clave | Valor |
  |---|---|
  | `ObjetivoNew` | Cargar objetivo |
  | `ObjetivosFilterAriaLabel` | Objetivos a mostrar |
  | `ObjetivosFilterVp` | Objetivos del VP |
  | `ObjetivosFilterAll` | Todos |
  | `PalancaColumnObjectives` | Objetivos |
  | `ObjetivoColumnId` | ID |
  | `ObjetivoColumnName` | Objetivo |
  | `ObjetivoColumnVp` | VP |
  | `ObjetivoColumnDepartment` | Departamento |
  | `ObjetivoColumnManagement` | Gerencia |
  | `ObjetivoColumnWeight` | Peso |
  | `ObjetivoColumnStatus` | Estado |
  | `ObjetivoColumnActions` | Acciones |
  | `ObjetivoViewTooltip` | Ver objetivo |
  | `ObjetivoViewAriaLabel` | Abrir objetivo {0} |
  | `PalancaObjectivesSection` | Objetivos de la palanca |
  | `PalancaObjectivesEmpty` | Esta palanca no tiene objetivos cargados. |
  | `OtherVpObjectivesSection` | Objetivos de otras VP |
  | `OtherVpObjectivesEmpty` | No hay objetivos de otras VP cargados. |
  | `ObjetivosLoadError` | No se pudieron cargar los objetivos. |
  | `ObjetivoDetailTitle` | {0} · {1} |
  | `ObjetivoInfoSection` | Información del objetivo |
  | `ObjetivoPlanningSection` | Planificación |
  | `ObjetivoFieldName` | Nombre |
  | `ObjetivoFieldDescription` | Descripción |
  | `ObjetivoFieldVp` | VP |
  | `ObjetivoFieldDepartment` | Departamento |
  | `ObjetivoFieldManagement` | Gerencia |
  | `ObjetivoFieldLever` | Palanca |
  | `ObjetivoFieldVpObjective` | Objetivo del VP |
  | `ObjetivoFieldDuration` | Duración |
  | `ObjetivoFieldWeight` | Peso en la VP |
  | `ObjetivoFieldStartDate` | Fecha de inicio |
  | `ObjetivoFieldCommitmentDate` | Fecha de compromiso |
  | `ObjetivoNotFound` | No se encontró el objetivo. |
  | `ObjetivoLoadError` | No se pudo cargar el objetivo. |
  | `ObjetivoFormNewTitle` | Nuevo objetivo |
  | `ObjetivoFormEditTitle` | Editar objetivo {0} |
  | `ObjetivoFormGeneralSection` | Información general |
  | `ObjetivoFormPlanningSection` | Planificación (VP RRII) |
  | `ObjetivoFormVp` | VP |
  | `ObjetivoFormDepartment` | Departamento |
  | `ObjetivoFormManagement` | Gerencia |
  | `ObjetivoFormName` | Nombre del objetivo |
  | `ObjetivoFormNamePlaceholder` | Ej. Duplicar la cantidad de clientes YPF |
  | `ObjetivoFormDescription` | Descripción |
  | `ObjetivoFormDescriptionPlaceholder` | Qué se busca lograr con este objetivo |
  | `ObjetivoFormLever` | Palanca |
  | `ObjetivoFormDuration` | Duración |
  | `ObjetivoFormWeight` | Peso en la VP (%) |
  | `ObjetivoFormVpObjective` | Objetivo del VP |
  | `ObjetivoFormStartDate` | Fecha de inicio |
  | `ObjetivoFormCommitmentDate` | Fecha de compromiso |
  | `ObjetivoFormStatus` | Estado |
  | `ObjetivoFormSelect` | Seleccionar |
  | `ObjetivoGuideAriaLabel` | Ver guía de redacción |
  | `ObjetivoGuideTitle` | Guía de redacción |
  | `ObjetivoGuideText` | Empezá con un verbo en infinitivo y decí qué se quiere lograr. Ej.: «Duplicar la cantidad de clientes activos de la App YPF». Evitá siglas y detalles de ejecución: esos van en las iniciativas. |
  | `ObjetivoWeightRange` | El peso debe estar entre 0 y 100. |
  | `ObjetivoDateOrder` | La fecha de compromiso no puede ser anterior a la de inicio. |
  | `ObjetivoSaveError` | No se pudo guardar el objetivo. |
  | `ObjetivoFormLoadError` | No se pudo cargar el formulario. |
  | `ObjetivoCreated` | El objetivo "{0}" se ha cargado correctamente. (con comillas escapadas en el `.js`, como `PalancaCreated`) |
  | `ObjetivoUpdated` | El objetivo "{0}" se ha actualizado correctamente. (ídem) |
  **Criterio de terminado**: `npm run build` sin errores; cada clave está en los dos archivos.

- [X] T009 [P] Crear `src/webparts/objetivosVp/components/Objetivo/objetivoUtils.ts` (a nivel de `components/`, junto a `getColorStep.ts`). Funciones y tipos exportados, sin dependencias de React:
  - `OBJETIVO_ID_PREFIX = 'OBJ-'` y `formatObjetivoId(id: number | undefined): string` → `OBJ-` + id con al menos dos dígitos (`OBJ-01`, `OBJ-12`); `''` si `undefined`.
  - `isVpRrii(nombre: string | undefined): boolean` → `nombre === VP_RRII_NOMBRE` (import desde `../../../core/utils/Constants`).
  - `export type ObjetivosFiltro = 'todos' | 'delVp';`
  - `filterObjetivos(objetivos: Objetivo[], filtro: ObjetivosFiltro): Objetivo[]` → todos si `'todos'`; solo `EsDeVp === true` si `'delVp'`.
  - `getEstadoChipColor(estado: Estado | undefined): ChipColor` → `No iniciada` `'neutral'`, `En curso` `'brand'`, `Finalizado cumplido` `'success'`, `Finalizado incumplido` `'danger'`, otro `'neutral'` (`ChipColor` de `…/core/ui/patterns`; `Estado` de `Constants.ts`).
  - `isNotFoundError(error: unknown): boolean` → `true` si el objeto tiene `status === 404` (misma lógica que el helper local de `PalancaDetalle.tsx`).
  - Fechas: `toDateInput(date: Date | null | undefined): string` (`AAAA-MM-DD` con componentes locales, `''` si no hay), `fromDateInput(value: string): Date | undefined` (medianoche local, `undefined` si vacío) y `formatDate(date: Date | null | undefined): string` (`toLocaleDateString('es-AR')`, `''` si no hay).
  Constantes con nombre para el prefijo, el relleno de dos dígitos, el código 404 y el locale. **Criterio de terminado**: `npm run build` sin errores.

- [X] T010 [P] Agregar a `src/webparts/objetivosVp/components/ObjetivosVp/routes.ts`, sin tocar lo existente: `OBJETIVO_PATH = '/objetivo'`, `OBJETIVO_NEW_PATH = \`${OBJETIVO_PATH}/new\``, `OBJETIVO_DETAIL_PATH = \`${OBJETIVO_PATH}/:id\``, `OBJETIVO_EDIT_PATH = \`${OBJETIVO_PATH}/:id/edit\``, `PALANCA_QUERY_PARAM = 'palanca'`, `getObjetivoPath(id: number): string`, `getObjetivoEditPath(id: number): string` y `getObjetivoNewPath(palancaId?: number): string` (con `?palanca=<id>` solo si hay `palancaId`). **Criterio de terminado**: `npm run build` sin errores.

- [X] T011 Ampliar `src/webparts/objetivosVp/components/Palanca/PalancaBreadcrumb/PalancaBreadcrumb.tsx` (contratos en `contracts/ui-contracts.md`, sección 3). Props nuevas, opcionales: `palancaId?: number` y `objetivoNombre?: string`. Comportamiento: sin `objetivoNombre`, igual que hoy (no cambiar el uso de `PalancaDetalle`). Con `objetivoNombre`: ítems Inicio, Palancas; si hay `palancaNombre` y `palancaId`, un ítem `palanca` con `onClick` → `navigate(getPalancaPath(palancaId))` (importar `getPalancaPath` de `../../ObjetivosVp/routes`); y al final el objetivo como `isCurrentItem`. Si hay `objetivoNombre` sin `palancaNombre` (objetivo de otra VP): Inicio > Palancas > objetivo. Mantener estilos y divisor. **Criterio de terminado**: `npm run build` sin errores; `PalancaDetalle` sigue mostrando Inicio > Palancas > nombre.

**Checkpoint**: la base está lista; las historias pueden empezar.

---

## Phase 3: User Story 4 - Ver el detalle de un objetivo (Priority: P2, se construye primero por dependencia)

**Goal**: la persona abre un objetivo y ve su información, planificación y estado, con migas y botón Volver.

**Independent Test**: con el mock, abrir `#/objetivo/1` (VP RRII) y `#/objetivo/5` (otra VP) y recorrer los escenarios 16, 17 y 18 de `quickstart.md`. El botón "Editar" queda operativo al terminar US5.

- [X] T012 [US4] Exportar `Field` en `src/webparts/objetivosVp/components/Palanca/PalancaDetalle/PalancaInfo/PalancaInfo.tsx`: cambiar `const Field` por `export const Field` y exportar también `IFieldProps` (`export interface IFieldProps`). No cambiar nada más (evita duplicar el componente de etiqueta y valor). **Criterio de terminado**: `npm run build` sin errores.

- [X] T013 [US4] Crear `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoInfo/ObjetivoInfo.tsx` y `ObjetivoInfo.module.scss` (modelo: `PalancaInfo.tsx` y su `.module.scss`; solo estructura: `.content` flex en columna, `.grid` con `display: grid` y `grid-template-columns: repeat(3, 1fr)`). Prop: `objetivo: Objetivo`. Reutiliza `Field` de T012 (import `../../PalancaDetalle/PalancaInfo/PalancaInfo`). DS: `Surface` con `variant="outline"`, `padding="comfortable"`. **Referencia**: `scr.objetivo`, secciones `o_info` y `o_plan`.
  1. `Surface` con `header={strings.ObjetivoInfoSection}`: grilla con Nombre, VP, Departamento, Gerencia; si el objetivo es de la VP RRII (`isVpRrii(objetivo.VP?.Title)`), también Palanca (`objetivo.Palanca?.Title`) y Objetivo del VP (`strings.Yes`/`strings.No`); después Descripción a todo el ancho.
  2. Solo si es de la VP RRII, un segundo `Surface` con `header={strings.ObjetivoPlanningSection}` con Duración, Peso en la VP (`${objetivo.Peso}%`), Fecha de inicio y Fecha de compromiso (`formatDate`).
  Un objetivo con palanca inactiva muestra su nombre igual (FR-029). Sin avance ni iniciativas (FR-030). **Criterio de terminado**: `npm run build` sin errores.

- [X] T014 [US4] Crear `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx` y `ObjetivoDetalle.module.scss` (modelo: `PalancaDetalle.tsx` y su `.module.scss`: `.detalle` columna, `.header` y `.footer` flex con `align-items: center`). Props: `{ canEditObjetivo: boolean }`. DS: `Button`, `Chip`, `MessageBar`, `Spinner`, `Toast`, `FigmaIcon`, `spacing`. **Referencia**: `scr.objetivo` (`nav.crumb`, `detailHead`). Comportamiento:
  - Id con `useParams`; si no es un entero positivo, "No se encontró el objetivo." sin consultar (igual que `PalancaDetalle`).
  - `useObjetivoDataSource()`; al montar `getById(id)` en `try/catch`; error 404 (`isNotFoundError`) → `strings.ObjetivoNotFound`; otro error → `strings.ObjetivoLoadError`, ambos con `MessageBar type="error"`. Las migas y "Volver" siguen visibles.
  - Muestra `state.item` solo si `state.item?.Id === id` y no hay `loadError`; si no, `Spinner` mientras `state.isLoading`.
  - Migas: `<PalancaBreadcrumb palancaNombre={objetivo.Palanca?.Title} palancaId={objetivo.Palanca?.Id} objetivoNombre={objetivo.Nombre} />`.
  - Encabezado: `Button` "Volver" (`variant="secondary"`, `size="small"`, `iconLeft={<FigmaIcon name="arrowCircle" />}`, `strings.Back`) → `navigate(PALANCAS_PATH)`; `h1` con `PAGE_TITLE_STYLE` y `Utils.replaceAll(Utils.replaceAll(strings.ObjetivoDetailTitle, '{0}', formatObjetivoId(id)), '{1}', nombre)`; `Chip size="small" clickable={false} color={getEstadoChipColor(estado)} label={estado ?? ''}`.
  - Cuerpo: `<ObjetivoInfo objetivo={objetivo} />`.
  - Pie: `Button variant="secondary"` `strings.Back` → `navigate(PALANCAS_PATH)`; y, si `canEditObjetivo` y hay objetivo, `Button variant="primary"` `strings.Edit` → `navigate(getObjetivoEditPath(id))`.
  - Aviso: `useLocation().state` con forma `{ toast?: string }`; si hay `toast`, mostrar `Toast variant="success"` con `duration` de 7000 ms (constante con nombre) y `onClose` que lo oculta (estado local inicializado con ese valor).
  **Criterio de terminado**: `npm run build` sin errores.

- [X] T015 [US4] Registrar la ruta en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`: constante `CAN_EDIT_OBJETIVO = true` (junto a `CAN_MANAGE_PALANCAS`) y `<Route path={OBJETIVO_DETAIL_PATH} element={<ObjetivoDetalle canEditObjetivo={CAN_EDIT_OBJETIVO} />} />`, importando de `../ObjetivoDetalle/ObjetivoDetalle` y `./routes`. No tocar las demás rutas. **Criterio de terminado**: `npm run build` sin errores; con el mock, `#/objetivo/1` y `#/objetivo/5` muestran los detalles (quickstart 16, 17 y 18).

**Checkpoint**: el detalle de objetivo funciona de forma independiente.

---

## Phase 4: User Story 1 - Cargar un objetivo de la VP RRII (Priority: P1) 🎯 MVP

**Goal**: la persona carga un objetivo de la VP RRII con todos sus campos y queda registrado "No iniciada" asociado a su palanca.

**Independent Test**: escenarios 1 a 8 de `quickstart.md`.

- [X] T016 [P] [US1] Crear `src/webparts/objetivosVp/components/Objetivo/ObjetivoForm/NombreAyuda/NombreAyuda.tsx`. Props: `{ open: boolean; onToggle: () => void }`. DS: `Button` (`iconOnly`, `variant="secondary"`, `size="small"`, `iconLeft={<FigmaIcon name="info" />}`, `aria-label={strings.ObjetivoGuideAriaLabel}`, `aria-expanded={open}`) y, si `open`, `Callout` (`title={strings.ObjetivoGuideTitle}`, `description={strings.ObjetivoGuideText}`). Renderiza el botón y, debajo, el `Callout` en un contenedor en columna con `style={{ gap: spacing.xs }}`. **Referencia**: `scr.form`, `.lblRow` con `.helpIc` y `.callout`. **Criterio de terminado**: `npm run build` sin errores.
  **Nota de implementación**: el `Callout` del DS trae su propio botón disparador y el cuadro flotante; no admite un ícono ni un estado abierto externo. `NombreAyuda` lo usa tal cual, con el texto del botón "Ver guía de redacción" y sin props (desvío respecto de lo escrito arriba: no hay ícono `info`).

- [X] T017 [US1] Crear `src/webparts/objetivosVp/components/Objetivo/ObjetivoForm/ObjetivoForm.tsx` y `ObjetivoForm.module.scss` (solo estructura: `.form` columna; `.grid` con `display: grid`, `grid-template-columns: repeat(3, 1fr)`; `.full` para campos de ancho completo; `.footer` flex). **Referencia**: `scr.form`, rama `fm.isObj`, secciones "Información general" y "Planificación (VP RRII)". En esta tarea el formulario es solo de **alta**. Estructura en el mismo archivo, para inicializar el estado sin `useEffect`: `ObjetivoForm` (carga) y un componente interno `ObjetivoFormBody` con props `{ vps, departamentos, gerencias, palancas, initialPalancaId?, onSave }` (en T025 se le suma `objetivo?`).
  **Carga (`ObjetivoForm`)**: hooks `useVicepresidenciaDataSource`, `useDepartamentoDataSource`, `useGerenciaDataSource` y `usePalancaDataSource`; un `useEffect` al montar llama a los cuatro `getItems()`. Mientras alguno `isLoading` y no hay datos, `Spinner`; si alguno tiene `error`, `MessageBar type="error"` con `strings.ObjetivoFormLoadError`. `initialPalancaId` sale de `useSearchParams().get(PALANCA_QUERY_PARAM)` (entero positivo o `undefined`).
  **Campos (`ObjetivoFormBody`)**, en este orden y con `strings.ObjetivoForm*`; estado local por campo; claves de los desplegables = `String(Id)`; el `text` de las opciones es `Nombre`:
  1. Encabezado: `Button` "Volver" (igual que en T014) y `h1` con `PAGE_TITLE_STYLE` = `strings.ObjetivoFormNewTitle`. "Volver" y "Cancelar" navegan a `PALANCAS_PATH`.
  2. `Surface variant="outline" padding="comfortable" header={strings.ObjetivoFormGeneralSection}` con la grilla de tres columnas: `Dropdown` VP (`required`; opciones = VP con `Activo === true`), `Dropdown` Departamento (`required`), `Dropdown` Gerencia (`required`; opciones = gerencias cuyo `Departamento?.Id` es el departamento elegido; sin departamento, sin opciones). Al cambiar el departamento, `gerenciaId` vuelve a `''` (FR-006). Placeholder de los desplegables: `strings.ObjetivoFormSelect`.
  3. Ancho completo: `Input` Nombre (`required`, `maxLength={255}`, `label={strings.ObjetivoFormName}`, placeholder `strings.ObjetivoFormNamePlaceholder`) dentro de `.nameRow` (flex, `align-items: flex-end`, `gap: spacing.xs`), con `NombreAyuda` a la derecha del campo (el `Input` conserva su etiqueta del DS: aproximación A5 del plan). Cuando `guideOpen` (estado local), la guía aparece debajo de `.nameRow` a todo el ancho. Luego `Multiline` Descripción (`required`, placeholder `strings.ObjetivoFormDescriptionPlaceholder`).
  4. `Dropdown` Estado (`required`; opciones = valores de `Estado` de `Constants.ts`; valor inicial `Estado.NoIniciada`, que la persona puede cambiar), en una fila propia de la grilla.
  5. Si la VP elegida es la VP RRII (`isVpRrii(nombre de la VP elegida)`), un segundo `Surface` con `header={strings.ObjetivoFormPlanningSection}`: `Dropdown` Palanca (`required`; opciones = palancas con `Activa === true`; valor inicial `initialPalancaId` si es de una palanca activa), `Dropdown` Duración (`required`; opciones = valores de `Duracion`), `SpinButton` Peso en la VP (%) (`required`, `min={0}`, `max={100}`, `value` como texto), `Switch` Objetivo del VP (`label={strings.ObjetivoFormVpObjective}`, `labelPosition="top"`, `textOff` no, valor inicial apagado), `Picker mode="date"` Fecha de inicio y `Picker mode="date"` Fecha de compromiso (`required`, `value` en `AAAA-MM-DD`, `label`).
  **Validación (al intentar guardar; los errores se limpian cuando el campo deja de ser inválido)**: obligatorios vacíos o solo espacios → `strings.RequiredField` en `errorMessage` del campo; peso fuera de 0 a 100 o no numérico → `strings.ObjetivoWeightRange`; compromiso anterior al inicio → `strings.ObjetivoDateOrder` (FR-012: igual al inicio es válido). Como `Picker` no tiene `errorMessage`, mostrar el error de las fechas debajo del componente con un `span` (`role="alert"`) con `typography.size[12]` y `colors.semantic.error`. Los pesos decimales se guardan tal cual (`Number(peso)`); no se suman ni se comparan.
  **Guardar**: arma `new Objetivo()` con `Nombre` y `Descripcion` recortados, `VP`, `Departamento`, `Gerencia` como `{ Id, Title: Nombre }` de la opción elegida, `Estado`; si la VP es la RRII, además `Palanca` (`{ Id, Title }`), `Duracion`, `Peso`, `EsDeVp`, `FechaInicio` y `FechaCompromiso` (`fromDateInput`); si no lo es, esos seis quedan sin valor (FR-004). `onSave` llama a `addItem` del hook de objetivos (`useObjetivoDataSource`, relanza si falla) y, si sale bien, `navigate(getObjetivoPath(creado.Id), { state: { toast: Utils.replaceAll(strings.ObjetivoCreated, '{0}', nombre) } })`. Si falla: `MessageBar type="error"` con `strings.ObjetivoSaveError`, sin cerrar ni perder lo ingresado (FR-017); mientras guarda, el botón Guardar queda `disabled`.
  Pie: `Button variant="secondary"` Cancelar y `Button variant="primary"` Guardar. Sin acción de eliminar. **Criterio de terminado**: `npm run build` sin errores.

- [X] T018 [US1] Conectar el alta. (a) En `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`: constante `CAN_CREATE_OBJETIVO = true`, `<Route path={OBJETIVO_NEW_PATH} element={<ObjetivoForm />} />` (importar de `../ObjetivoForm/ObjetivoForm`) y pasar `canCreateObjetivo={CAN_CREATE_OBJETIVO}` a `<Palancas>`. (b) En `components/Palanca/Palancas/PalancasHeader/PalancasHeader.tsx`: props nuevas `canCreateObjetivo: boolean` y `onNewObjetivo?: () => void`; si `canCreateObjetivo && onNewObjetivo`, `Button variant="primary"` con `iconLeft={<FigmaIcon name="add" />}` y `strings.ObjetivoNew`, a continuación de "Nueva palanca". (c) En `components/Palanca/Palancas/Palancas.tsx`: prop `canCreateObjetivo`, pasada al header con `onNewObjetivo={() => navigate(getObjetivoNewPath())}`. **Referencia**: `scr.palancas`, botón "Cargar objetivo" del encabezado (excluido en 002, ahora incluido). **Criterio de terminado**: `npm run build` sin errores; con el mock, escenarios 1 a 8 de `quickstart.md`; al guardar se llega al detalle del objetivo con el aviso (T014).

**Checkpoint**: US1 funciona de forma independiente (con US4 ya construida).

---

## Phase 5: User Story 2 - Cargar un objetivo de otra VP (Priority: P1)

**Goal**: la persona carga un objetivo de otra VP, sin los campos de planificación.

**Independent Test**: escenarios 9 y 10 de `quickstart.md`.

Nota: la rama de otra VP del formulario (ocultar la sección de planificación, no validarla y no guardarla) se implementó en T017 porque comparte el formulario. Esta fase la verifica y corrige.

- [ ] T019 [US2] Verificar y, si hace falta, corregir `src/webparts/objetivosVp/components/Objetivo/ObjetivoForm/ObjetivoForm.tsx` contra FR-003, FR-004 y FR-005: (1) al elegir una VP que no es "VP RRII" desaparece la sección "Planificación (VP RRII)" y sus campos no se validan; (2) con campos de planificación ya completados, cambiar a otra VP y guardar produce un objetivo sin `Palanca`, `Duracion`, `Peso`, `FechaInicio`, `FechaCompromiso` ni `EsDeVp`; (3) volver a elegir la VP RRII muestra la sección con lo que se había completado; (4) con la VP sin elegir, no se muestra la sección de planificación; (5) guardar con otra VP no lanza error de `assertChoiceValue` (T003). Con el mock, recorrer los escenarios 9 y 10 de `quickstart.md` y anotar el resultado. **Criterio de terminado**: `npm run build` sin errores y los dos escenarios verificados.

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 6: User Story 3 - Ver los objetivos dentro de palancas y entrar a su detalle (Priority: P1)

**Goal**: cantidad de objetivos en la grilla, lista en el detalle de palanca, selector "Objetivos del VP / Todos" y bloque "Objetivos de otras VP".

**Independent Test**: escenarios 11 a 15 de `quickstart.md`.

- [X] T020 [P] [US3] Crear `src/webparts/objetivosVp/components/Objetivo/ObjetivosTable/ObjetivosTable.tsx` y `ObjetivosTable.module.scss` (solo `.actions`: flex con `justify-content: flex-end`, como `PalancasTable.module.scss`). Tabla compartida por el detalle de palanca y el bloque de otras VP; props `{ objetivos: Objetivo[]; variant: 'palanca' | 'otrasVp'; emptyText: string; onView: (id: number) => void }`. DS: `Table`, `Button`, `Tooltip`, `Chip`, `FigmaIcon`, `spacing`. Modelo: `PalancasTable.tsx` (filas planas `ObjetivoRow` con la entidad guardada, `getRowKey` = id). Columnas: `id` (`formatObjetivoId`), `nombre`, y según `variant`: `palanca` → `departamento`, `gerencia`, `peso` (`${Peso}%`, vacío si no hay), `estado`; `otrasVp` → `vp`, `departamento`, `gerencia`, `estado`; y `acciones`. `estado` se renderiza con `Chip size="small" clickable={false} color={getEstadoChipColor(estado)}`. Acción: `Button iconOnly variant="secondary" size="small" iconLeft={<FigmaIcon name="arrowForward" />}` con `Tooltip content={strings.ObjetivoViewTooltip}` y `aria-label={Utils.replaceAll(strings.ObjetivoViewAriaLabel, '{0}', id)}`. Orden de filas: por Id ascendente. Encabezados con `strings.ObjetivoColumn*`. **Criterio de terminado**: `npm run build` sin errores.

- [X] T021 [P] [US3] Agregar la columna "Objetivos" a `src/webparts/objetivosVp/components/Palanca/Palancas/PalancasTable/PalancasTable.tsx`: prop nueva `objetivosCount?: Record<number, number>` (cantidad por Id de palanca; `undefined` mientras no se cargaron o si falló la carga). Columna `objetivos` entre `descripcion` y `acciones`, encabezado `strings.PalancaColumnObjectives`; valor `String(objetivosCount[palanca.Id] ?? 0)` si hay `objetivosCount`, y `''` si no. No tocar las demás columnas ni las acciones. **Criterio de terminado**: `npm run build` sin errores.

- [X] T022 [US3] Extender `src/webparts/objetivosVp/components/Palanca/Palancas/Palancas.tsx` (y `Palancas.module.scss` solo si hace falta estructura). Props nuevas: `filtro: ObjetivosFiltro` y `onFiltroChange: (filtro: ObjetivosFiltro) => void` (tipo de `../objetivoUtils`). DS: `Tabs`, `Surface`, `MessageBar`. Cambios:
  - `useObjetivoDataSource()`; el `useEffect` de montaje llama también a `getItems()` de objetivos; "Actualizar" recarga ambos.
  - Debajo del encabezado y arriba de la tabla: `Tabs` (`variant="filled"`, `size="small"`, `ariaLabel={strings.ObjetivosFilterAriaLabel}`, `items` = `delVp` con `strings.ObjetivosFilterVp` y `todos` con `strings.ObjetivosFilterAll`, `value={filtro}`, `onChange={(key) => onFiltroChange(key as ObjetivosFiltro)}`).
  - Conteo por palanca durante el render: sobre `filterObjetivos(objetivos, filtro)` tomando solo los que tienen `Palanca?.Id` (los de la VP RRII), acumulado en `Record<number, number>`; se pasa a `PalancasTable` como `objetivosCount`, o `undefined` si los objetivos todavía no cargaron o fallaron.
  - Si los objetivos fallaron, `MessageBar type="error"` con `strings.ObjetivosLoadError` encima de la tabla.
  - Si `filtro === 'todos'`, debajo de la tabla un `Surface variant="outline" padding="comfortable" header={strings.OtherVpObjectivesSection}` con `ObjetivosTable variant="otrasVp"` (objetivos cuyo `VP?.Title` no es la VP RRII, `!isVpRrii(...)`), `emptyText={strings.OtherVpObjectivesEmpty}` y `onView={(id) => navigate(getObjetivoPath(id))}`. Con `'delVp'` el bloque no se muestra (FR-024).
  En el mismo cambio, en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`, dentro de `ObjetivosVpRoutes`: `const [filtro, setFiltro] = React.useState<ObjetivosFiltro>(DEFAULT_FILTRO);` (con `DEFAULT_FILTRO: ObjetivosFiltro = 'todos'` como constante con nombre) y pasar a `<Palancas>` `filtro={filtro}` y `onFiltroChange={setFiltro}`.
  **Criterio de terminado**: `npm run build` sin errores.

- [X] T023 [US3] Extender `src/webparts/objetivosVp/components/Palanca/PalancaDetalle/PalancaDetalle.tsx` (modelo de estructura: lo ya existente). Props nuevas: `canCreateObjetivo: boolean` y `filtro: ObjetivosFiltro`. DS: `Surface`, `Button`, `MessageBar`. Cambios:
  - `useObjetivoDataSource()`; un `useEffect` de montaje llama `getItems()`.
  - Entre `renderBody()` y el pie, un `Surface variant="outline" padding="comfortable" header={strings.PalancaObjectivesSection}` con `ObjetivosTable variant="palanca"`, objetivos = `filterObjetivos(...)` de los que tienen `Palanca?.Id === palancaId`, `emptyText={strings.PalancaObjectivesEmpty}`, `onView={(id) => navigate(getObjetivoPath(id))}`. Solo cuando la palanca ya cargó. Si la carga de objetivos falló, `MessageBar type="error"` con `strings.ObjetivosLoadError` dentro del bloque en lugar de la tabla.
  - En el pie, junto a "Cancelar"/"Editar": si `canCreateObjetivo && palanca`, `Button variant="primary"` con `iconLeft={<FigmaIcon name="add" />}` y `strings.ObjetivoNew` → `navigate(getObjetivoNewPath(palancaId))`.
  - Reemplazar el helper local `isNotFoundError` por el import de `../objetivoUtils` (T009), sin cambiar su comportamiento.
  En el mismo cambio, en `ObjetivosVp.tsx`, pasar a `<PalancaDetalle>` `canCreateObjetivo={CAN_CREATE_OBJETIVO}` y `filtro={filtro}`.
  **Criterio de terminado**: `npm run build` sin errores.

- [ ] T024 [US3] Verificar la sección de palancas y objetivos con el mock, sin cambios de código salvo correcciones: escenarios 11 a 15 de `quickstart.md`. La cantidad de cada palanca coincide con su lista, el selector filtra cantidades y listas, el bloque de otras VP se oculta con "Objetivos del VP", la palanca 3 muestra cero y el estado vacío. **Criterio de terminado**: `npm run build` sin errores y los cinco escenarios verificados.

**Checkpoint**: US3 funciona; la sección de palancas y objetivos está completa.

---

## Phase 7: User Story 5 - Editar un objetivo (Priority: P2)

**Goal**: la persona edita un objetivo desde su detalle, con la VP en solo lectura.

**Independent Test**: escenarios 19 a 23 de `quickstart.md`.

- [X] T025 [US5] Extender `src/webparts/objetivosVp/components/Objetivo/ObjetivoForm/ObjetivoForm.tsx` para la **edición** (FR-001, FR-004a, FR-014, FR-015, FR-016):
  - `useParams` con `id`: si hay `id` es edición. Id inválido (no entero positivo) → `MessageBar` con `strings.ObjetivoNotFound`. Carga además el objetivo con `getById(id)` en `try/catch` (`isNotFoundError` → `strings.ObjetivoNotFound`; otro error → `strings.ObjetivoLoadError`); el cuerpo se monta solo cuando el objetivo cargado coincide con el Id.
  - `ObjetivoFormBody` recibe `objetivo?: Objetivo` y usa sus valores como estado inicial (`useState(objetivo?.…)`): VP, Departamento, Gerencia, Nombre, Descripción, Estado, y si es de la VP RRII, Palanca, Duración, Peso (como texto), `EsDeVp`, fechas (`toDateInput`).
  - Título `Utils.replaceAll(strings.ObjetivoFormEditTitle, '{0}', formatObjetivoId(id))`.
  - El `Dropdown` VP va `disabled` en edición y sus opciones incluyen la VP del objetivo aunque esté inactiva (`Activo === true` o Id igual al del objetivo).
  - Las opciones de Palanca son las activas más la del objetivo aunque esté inactiva (FR-014); en el alta, solo las activas.
  - Guardar: el objetivo armado conserva `Id`; llama a `editItem` (relanza si falla) y, si sale bien, `navigate(getObjetivoPath(id), { state: { toast: Utils.replaceAll(strings.ObjetivoUpdated, '{0}', nombre) } })`. Cancelar y Volver → `navigate(getObjetivoPath(id))` en edición; en el alta siguen yendo a `PALANCAS_PATH`.
  **Criterio de terminado**: `npm run build` sin errores.

- [X] T026 [US5] Registrar la ruta de edición en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`: `<Route path={OBJETIVO_EDIT_PATH} element={<ObjetivoForm />} />`, sin tocar lo demás. No se agregan guardas de permiso en la ruta (FR-031; RF-19 las definirá). **Criterio de terminado**: `npm run build` sin errores; con el mock, "Editar" del detalle abre el formulario con los datos actuales y VP en solo lectura (escenarios 19 a 23 de `quickstart.md`): se guardan los cambios, el detalle los refleja, Cancelar no cambia nada, un objetivo con palanca inactiva (Id 4) la muestra elegida y no existe acción de eliminar.

**Checkpoint**: las cinco historias funcionan.

---

## Phase 8: Polish & Cross-Cutting

- [X] T029 [US3] (agregada tras la revisión del 2026-11-11) Despliegue de objetivos en la grilla (FR-034) y nombres de VP, departamento y gerencia: `src/webparts/objetivosVp/components/Palanca/Palancas/PalancasTable/PalancasTable.tsx` (columna de despliegue y filas de objetivo), `src/webparts/objetivosVp/components/Palanca/Palancas/Palancas.tsx` (mapa de objetivos por palanca) y `src/webparts/objetivosVp/components/Objetivo/useObjetivoNames.ts` (nuevo: completa `VP`, `Departamento` y `Gerencia` con el `Nombre` de sus listas, porque los lookups de SharePoint llegan con `Title` vacío). Usado también en `PalancaDetalle.tsx` y `ObjetivoDetalle.tsx`. **Criterio de terminado**: `npm run build` sin errores.
- [X] T027 Revisión de reglas sobre todo el código nuevo y modificado de la feature (`git diff` de `src/`): sin hexadecimales, sin px de espaciado o tipografía, sin textos visibles fuera de `loc/` (salvo valores de enums), sin `any`, sin comentarios de código, sin literales mágicos, sin imports de los índices de `core` ni de `core/ui`, sin `window.*` de navegación, sin uso de `deleteItem` ni acción de eliminar, sin elementos excluidos por FR-033, un solo `useEffect` de carga por pantalla y sin estado derivado duplicado. Corregir lo que aparezca. **Criterio de terminado**: `npm run build` sin errores y revisión sin hallazgos abiertos.

- [ ] T028 Validación completa con `specs/003-objetivos/quickstart.md`: escenarios 1 a 26, primero con los mocks y después, con autorización explícita, en el workbench hospedado del sitio de desarrollo contra las listas de desarrollo (nunca producción). Incluye la comparación visual con el prototipo (escenario 26, SC-009) y verificar que `Title` de la lista `Objetivo` queda igual a `Nombre`. Informar escenarios aprobados, fallidos y no ejecutados. **Criterio de terminado**: `npm run build` sin errores y el informe de escenarios entregado.

---

## Dependencies & Execution Order

- **Phase 1** (T001) primero; si falla, no seguir.
- **Phase 2** (T002 a T011) bloquea todas las historias. T002 a T011 son casi todas [P]; dependencias internas: T004 usa `VP_RRII_NOMBRE` de T002; T007 usa los datos de T004 a T006.
- **Phase 3 US4** (T012 a T015): depende de la Phase 2. Es la base de navegación de US1, US3 y US5.
- **Phase 4 US1** (T016 a T018): depende de la Phase 2 y de T014/T015 para el destino del guardado. T017 depende de T016.
- **Phase 5 US2** (T019): depende de T017.
- **Phase 6 US3** (T020 a T024): depende de la Phase 2 y de T015. T022 y T023 dependen de T020 y T021; T024 depende de T022 y T023 (solo verificación). T018, T022 y T023 editan `ObjetivosVp.tsx` y `Palancas.tsx` en secuencia: hacerlas en orden.
- **Phase 7 US5** (T025, T026): depende de T017 y T014.
- **Phase 8** (T027, T028): al final.

## Parallel Opportunities

- Phase 2: T002, T003, T004, T005, T006, T008, T009 y T010 en paralelo (archivos distintos); T007 después de T004 a T006; T011 después de T010.
- US4: T013 va después de T012 (usa el `Field` exportado); T014 después de T013.
- US3: T020 y T021 en paralelo.

## Implementation Strategy

- **MVP**: Phases 1 a 4 (cargar un objetivo de la VP RRII y verlo en su detalle). Se valida con los mocks.
- **Entrega incremental**: US2 (otra VP) → US3 (sección de palancas y objetivos completa) → US5 (edición) → Polish.
- Cada fase termina en un checkpoint que se valida con los escenarios de `quickstart.md` antes de seguir.
