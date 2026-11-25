---

description: "Tareas de implementación de Ubicación en la estrategia"
---

# Tasks: Ubicación en la estrategia

**Input**: `specs/009-ubicacion-en-la-estrategia/` (`spec.md`, `plan.md`)

**Prerequisites**:

- features 002 a 008 completas y compilando (`npm run build` sin errores);
- `npm ci` ejecutado;
- prototipo en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`: botón `.ubiBtn` (líneas 653, 758, 818 y 898), drawer (1188–1206), estilos `.ubi*` (503–512) y lógica (2264–2282);
- `docs/design-system-catalog.md`.

Sin prerrequisitos de SharePoint.

**Tests**: no se piden. El repo no tiene runner de pruebas. Se valida con `npm run build` y con la sección Verificación del plan.

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo.
- **[Story]**: US1, que es la única historia.

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores.
- **Textos**: desde `import * as strings from 'ObjetivosVpWebPartStrings';`, con `Utils.replaceAll` para `{0}`. Ningún texto visible escrito en el código.
- **`src/core/ui`**: solo se toca en T001 (plan, D3).
- **TypeScript estricto**: sin `any` nuevos, sin comentarios de código, sin literales mágicos.
- **Estilos**: solo tokens del DS, `spacing`, `typography` y `getColorStep`. Sin hexadecimales en SCSS. No editar ni versionar `*.module.scss.ts`.
- **Hooks**: `useEffect` solo para cargar datos; lo derivado se calcula en el render.
- **Datos**: sin cambios en listas ni columnas.
- **No modificar** `spec.md` ni `plan.md`. Si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo.

## Path Conventions

- Webpart: `src/webparts/objetivosVp/` (componentes en `components/`, textos en `loc/`).
- Core: `src/core/api/`, `src/core/ui/foundations/icons/`.

---

## Phase 1: Foundational

- [X] T001 [P] Ícono `chevronDoubleDown` (plan, D3).
  - Crear `src/core/ui/foundations/icons/assets/general/chevron-double-down.svg` (16×16, `fill="none"`, trazo `#0D0D0D`, dos chevrons como la maqueta `M7 6l5 5 5-5M7 13l5 5 5-5`, escalados a 16).
  - Registrarlo como `chevronDoubleDown` en `generalIcons` de `iconRegistry.ts`, junto a `chevronDown`.
  - Agregar una fila en `docs/design-system-cambios.md` (fecha 2026-11-25, `foundations/icons`, "ícono `chevronDoubleDown`", motivo, feature `009-ubicacion-en-la-estrategia`) en su propia línea, sin tocar la fila existente.
  - Agregar el nombre a la lista `generalIcons` de `docs/design-system-catalog.md`.
  - **Criterio de terminado**: build sin errores; `<FigmaIcon name="chevronDoubleDown" />` tipa.

- [X] T002 [P] Cadenas de D11 en `loc/mystrings.d.ts` y `loc/en-us.js`, con los textos exactos del plan. **Criterio de terminado**: build sin errores.

- [X] T003 [P] Métodos por lotes (plan, D8).
  - `getItemsByObjetivoIds(ids: number[]): Promise<Iniciativa[]>` en `src/core/api/Iniciativa/IIniciativaDataSource.ts`, `IniciativaDataSource.ts` e `IniciativaMock.ts`.
  - `getItemsByIniciativaIds(ids: number[]): Promise<Tarea[]>` en `src/core/api/Tarea/ITareaDataSource.ts`, `TareaDataSource.ts` y `TareaMock.ts`.
  - Chunks de 40 con una constante con nombre, `Promise.all`, y `[]` sin consulta cuando no hay ids.
  - Reutilizar `selectProperties`, `expand` y `TOP_DEFAULT`.
  - **Criterio de terminado**: build sin errores; los usos existentes de `getFilteredItems` no cambian.

- [X] T004 Hook `src/core/api/UbicacionEstrategia/useUbicacionEstrategia.ts` (plan, D7).
  - Firma: `(tipo: TipoEntidad, id: number, opciones: { enabled: boolean; filtrarObjetivos?: (o: Objetivo[]) => Objetivo[]; omitirPalanca?: boolean })` → `{ data?: IUbicacionEstrategiaData; isLoading: boolean; error: boolean; reload: () => void }`.
  - Exportar `TipoEntidad` (`'palanca' | 'objetivo' | 'iniciativa' | 'tarea'`) e `IUbicacionEstrategiaData { palancas; objetivos; iniciativas; tareas }`.
  - Seguir la tabla de consultas de D7 y elegir datasource o mock como `useTareasIniciativa`.
  - En la vista Tarea y en la vista Iniciativa, la palanca se arma desde `objetivo.Palanca` (`Id` y `Title`) sin consultarla.
  - En la vista Palanca, la palanca sale de `getById`.
  - Cache con la clave `${tipo}-${id}`.
  - Ante un error: `console.error` con la operación y el tipo, sin payload.
  - Depende de T003.
  - **Criterio de terminado**: build sin errores.

**Checkpoint**: datos, textos e ícono listos.

---

## Phase 2: User Story 1 - Ver el recorrido estratégico (P1)

- [X] T005 `LocationButton` en `components/shared/LocationButton/LocationButton.tsx` (plan, D5): prop `onClick: () => void`, ícono `chevronDoubleDown` y la clase `whiteIcon` actual. Depende de T001. Verificar además que el ícono se vea blanco sobre el botón violeta igual que el `chevronDown` actual (`.whiteIcon` aplica `filter: brightness(0) invert(1)`; si `FigmaIcon` no reemplaza el `#0D0D0D` del SVG, resolverlo como los otros íconos usados sobre botones primarios) y revisar el grosor del trazo (maqueta: 2.4 sobre viewBox 24 a 16px). **Criterio de terminado**: build sin errores y ícono blanco y legible en el botón.

- [X] T006 [P] `components/shared/UbicacionEstrategia/ubicacionUtils.ts`: `buildNiveles(data, tipo, id, otraVp?) => INivel[]`, con `INivel` e `IItemUbicacion` del plan.
  - Labels con D11.
  - Ítems con `formatIdNombre(formatXId(Id), Nombre)`.
  - Rutas con `getXPath`.
  - El ítem actual va sin `path`.
  - Con `otraVp`, el primer nivel es "Otra VP" con un único ítem sin `path` (spec FR-006).
  - Orden por `Id` ascendente.
  - Depende de T002 y T004.
  - **Criterio de terminado**: build sin errores.

- [X] T007 `components/shared/UbicacionEstrategia/UbicacionNivel/UbicacionNivel.tsx` + `.module.scss` (spec FR-009 a FR-011; plan, D4, D10 y D12; maqueta `.ubiN`, `.ubiDot`, `.ubiT`, `.ubiL`, `.ubiMore`).
  - Nodo decorativo: relleno o hueco si el nivel es el actual.
  - Label del nivel.
  - `<ul>` con hasta 3 ítems, o todos si está expandido.
  - Ítems con link: `Link` de `@fluentui/react` que llama a `onNavigate(path)`.
  - Ítem actual: texto en negrita sin link.
  - Toggle `Link` con `aria-expanded`: "y N más" ↔ "Ver menos".
  - Texto vacío para 0 ítems.
  - Colores del plan con `getColorStep`.
  - **Criterio de terminado**: build sin errores.

- [X] T008 `components/shared/UbicacionEstrategia/UbicacionEstrategiaPanel/UbicacionEstrategiaPanel.tsx` + `.module.scss` y `components/shared/UbicacionEstrategia/UbicacionEstrategia.tsx` (spec FR-004, FR-005, FR-012 y FR-013; plan, D7 y D9). Nota: `TareaHistorialPanel.module.scss` ya fuerza el ancho a 480px con `!important` (igual que la maqueta); usar el mismo precedente. El contenedor de niveles es un `<ol>` con `padding-left: 34px` y la línea vertical (`::before`, 3px, `--ubi-dark`) como `.ubi` de la maqueta, usando `UBICACION_COLOR_VARS` de `UbicacionNivel.tsx`; `UbicacionNivel` renderiza un `<li>`. Cerrar y reintentar reutilizan `TareaHistoryClose` y `TareasRetry`.
  - **Panel**: DS `Panel open` con `buildPanelTitle(strings.UbicacionTitulo, subtítulo)`, como en `TareaHistorialPanel`.
    - Cuerpo: `Spinner` mientras carga; `MessageBar type="error"` con la acción Reintentar si falla; si no, la línea vertical del timeline y los `UbicacionNivel`.
    - Pie: `primaryAction` "Cerrar" `secondary` y `secondaryAction={<></>}`.
  - **Contenedor**: props `{ tipo; id; otraVp?; filtrarObjetivos? }`.
    - Estado `open`; `LocationButton onClick` lo abre.
    - El hook recibe `enabled: open` y `omitirPalanca: otraVp !== undefined`.
    - Monta el panel solo si `open`.
    - `onNavigate`: cierra y llama a `navigate(path, { state: { from } })`.
  - **Criterio de terminado**: build sin errores.

- [X] T009 Integración en `Palanca/PalancaDetalle/PalancaDetalle.tsx` y `Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx`. Además, volver obligatoria la prop `onClick` de `LocationButton` (hoy opcional, para que PalancaDetalle y ObjetivoDetalle compilen hasta esta tarea).
  - Reemplazar `<LocationButton />` por `<UbicacionEstrategia />`, en el mismo lugar.
  - Palanca: `tipo="palanca"` y `filtrarObjetivos={(o) => filterObjetivos(o, filtro)}` (D2).
  - Objetivo: `tipo="objetivo"` y `otraVp={isVpRrii(objetivo.VP?.Title) ? undefined : objetivo.VP?.Title}`.
  - Quitar el import de `LocationButton` que deja de usarse.
  - **Criterio de terminado**: build sin errores; escenarios 6 y 7 de la spec con mocks.

- [X] T010 Integración en `Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` y `Tarea/TareaDetalle/TareaDetalle.tsx` (spec FR-001).
  - Agregar `<UbicacionEstrategia />` al final de `.headerEnd`, con `tipo="iniciativa"`/`"tarea"` y `otraVp` como en T009, usando el objetivo que la vista ya tiene.
  - En Iniciativa, `.headerEnd` se renderiza siempre y el avance queda condicionado adentro (`isRrii && loaded`), sin cambiar su comportamiento.
  - **Criterio de terminado**: build sin errores; escenarios 4 y 5 de la spec con mocks; el avance se muestra igual que antes.

---

## Phase 3: Polish

- [ ] T011 Validación final: `npm run build` y la sección Verificación del plan en las cuatro vistas (otra VP, niveles en 0, expandir y colapsar, scroll, formas de cierre, teclado, error y Reintentar, Network sin reconsultas). **Criterio de terminado**: todo cumple, o se informa qué no pudo validarse.

## Dependencies & Execution Order

- T001, T002 y T003 en paralelo.
- T004 requiere T003.
- T005 requiere T001.
- T006 requiere T002 y T004.
- T007 requiere T006.
- T008 requiere T005, T006 y T007.
- T009 y T010 requieren T008.
- T011 al final.

## Implementation Strategy

Una sola historia (MVP = la feature completa). Conviene integrar primero en Tarea (T010), que tiene el recorrido más corto, para validar el panel antes de los casos con lotes.
