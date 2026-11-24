---

description: "Tareas de implementación de Ajustes de vistas"
---

# Tasks: Ajustes de vistas

**Input**: `specs/008-ajustes-vistas/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**:

- las features 002 a 006 completas y compilando (`npm run build` sin errores);
- `npm ci` ejecutado;
- prototipo en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (pantalla `scr.palancas`, `dFoot`, modal `obj`);
- `docs/design-system-catalog.md`.

Sin prerrequisitos de SharePoint: no hay listas, columnas ni permisos nuevos.

**Tests**: no se piden. El repo no tiene runner de pruebas. Se valida con `npm run build` y con los escenarios de `quickstart.md` (mocks y workbench del sitio de desarrollo).

**Organization**: las tareas se agrupan por historia de usuario. Orden recomendado: Foundational → US1 → US2 → US3 → US4 → US5 → Polish.

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: US1 filtros; US2 solapa "Todos los objetivos" y paginado; US3 resumen sin avance; US4 Actualizar con mensaje; US5 confirmación al guardar.

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores.
- **Textos**: desde `import * as strings from 'ObjetivosVpWebPartStrings';`, con `Utils.replaceAll` para `{0}`. Ningún texto visible escrito en el código.
- **`src/core/ui` es de solo lectura.** Imports por capa, con la profundidad de rutas relativa que corresponda (copiar el patrón de un archivo vecino).
- **TypeScript estricto**: sin `any` nuevos, sin comentarios de código, sin literales mágicos (constantes con nombre).
- **Estilos**: solo tokens del DS. Sin hexadecimales. No editar ni versionar `*.module.scss.ts`.
- **Hooks**: `useEffect` solo para cargar datos; lo derivado se calcula en el render.
- **Mensajes de error y estados vacíos de una línea**, sin textos de ayuda.
- **Datos**: sin cambios en listas ni columnas.
- **No modificar** `spec.md` ni `plan.md`. Si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo.

## Path Conventions

- Webpart: `src/webparts/objetivosVp/` (componentes en `components/`, textos en `loc/`).
- Core: `src/core/api/useDatasource.ts`. Plantilla: `docs/plantilla-cambios.md`.

---

## Phase 1: Foundational (bloquea las historias)

- [X] T001 Agregar y modificar las cadenas en `loc/en-us.js` y `loc/mystrings.d.ts` (plan, D10): nuevas `ViewRefreshed`, `ObjetivosAllEmpty`, `ObjetivosFilterTodos`, `PalancasFiltersEmpty`, `PalancaConfirmCreate`, `PalancaConfirmEdit`, `ObjetivoConfirmCreate`, `ObjetivoConfirmEdit`, `ObjetivoConfirmEditTitle`; modificadas `PalancasSummary` ("{0} palancas activas · {1} objetivos") e `IniciativasFiltersClear` ("Limpiar"). Textos exactos en spec FR-008, FR-013, FR-016, FR-017, FR-020, FR-021. Verificar con `Grep` qué claves de etiqueta del panel ya existen (`ObjetivoFieldDepartment`, `ObjetivoFieldManagement`, `PalancaColumnName`, `ObjetivoFormStatus`, `IniciativasFilterYear`) y agregar solo las que falten. **Criterio de terminado**: build sin errores.

- [X] T002 Agregar `reloadItems` a `src/core/api/useDatasource.ts` (plan, D4):
  - método nuevo, igual que `getItems` (`dispatch(LOAD)`, `datasource.getItems()`, `dispatch(GET_ALL, ...)`) pero con `handleAsyncAndRethrow`; no tocar `getItems` ni sus usos;
  - agregar `() => Promise<void>` como **séptimo** elemento del tipo `DatasourceHook` y del arreglo devuelto, después de `getById`;
  - verificar con `Grep` que los hooks de entidad (`useXxxDataSource`) devuelven el `DatasourceHook` sin redefinir la tupla; si alguno la redefine, ajustarlo;
  - `docs/plantilla-cambios.md`: fila nueva (fecha de hoy, `src/core/api/useDatasource.ts`, "método nuevo `reloadItems`: recarga como `getItems` pero despacha `ERROR` y relanza (`handleAsyncAndRethrow`); `getItems` no cambia", motivo: "el botón Actualizar decide éxito o error con el resultado de la promesa", feature `008-ajustes-vistas`).
  - **Criterio de terminado**: build sin errores; ningún desestructurado existente cambia de significado; la fila está en la plantilla de cambios.

**Checkpoint**: textos y método de recarga listos.

---

## Phase 2: User Story 1 - Filtrar palancas y objetivos (P1) 🎯 MVP

**Goal**: botón Filtros funcional en la vista de palancas y objetivos, con el panel compartido.

**Independent Test**: escenarios 1 a 10 y 9b del quickstart.

- [X] T003 [US1] Crear `components/shared/FiltrosPanel/FiltrosPanel.tsx` y `.module.scss` (plan, D1; contracts): mover desde `IniciativasFiltros` el `Panel`, el borrador local, "Limpiar" (`primaryAction`) y "Aplicar" (`secondaryAction`) y los estilos `.panel` y `.fields`. Props `filtros`, `fields`, `normalize?`, `onApply`, `onClear`, `onClose`. La X no aplica. **Criterio de terminado**: build sin errores.

- [X] T004 [US1] Reescribir `Iniciativa/IniciativasBandeja/IniciativasFiltros/IniciativasFiltros.tsx` como envoltorio de `FiltrosPanel` (depende de T003), con el mismo contrato público; quitar sus estilos movidos. **Criterio de terminado**: la bandeja se ve y se comporta igual, con "Limpiar" (escenario 9b).

- [X] T005 [P] [US1] Crear `components/Objetivo/objetivoFiltros.ts` (plan, D2): `IObjetivosFiltros`, `EMPTY_OBJETIVOS_FILTROS`, `matchesObjetivoFiltros`, `hasObjetivoFilter`, `getAniosObjetivos`. Reglas de FR-007 y FR-009 (otra VP sin palanca ni fechas queda fuera si hay Palanca o Año). **Criterio de terminado**: build sin errores.

- [X] T006 [US1] Crear `components/Objetivo/ObjetivosFiltros/ObjetivosFiltros.tsx` (depende de T003 y T005): campos Palanca (activas), Departamento, Gerencia (acotada por el departamento del borrador, con `normalize`), Estado y Año, en ese orden, con "Todas"/"Todos" primero. **Criterio de terminado**: build sin errores.

- [X] T007 [US1] `Palanca/Palancas/PalancasHeader/PalancasHeader.tsx` y `Palanca/Palancas/Palancas.tsx` (plan, D3; depende de T006): prop `onOpenFilters`; estado de filtros aplicados y de página en `Palancas`; abrir, aplicar (cierra), limpiar (cierra) y cerrar con X; la página vuelve a 1 al buscar, aplicar o cambiar de solapa. **Criterio de terminado**: el panel abre y aplica/limpia/descarta (escenarios 1, 8, 9).

- [X] T008 [US1] `Palancas.tsx` (plan, D7; depende de T007): aplicar los filtros en "Todas las palancas" (Palanca limita palancas; el resto limita objetivos y oculta palancas vacías con `hasObjetivoFilter`) y en "Objetivos de la VP RRII" y "Objetivos de otras VP" (`matchesObjetivoFiltros` completo, con la búsqueda). Estado vacío con filtros: `PalancasFiltersEmpty`. Las cantidades de las solapas no cambian. **Criterio de terminado**: escenarios 2 a 7 y 10.

**Checkpoint**: US1 funciona con las solapas existentes.

---

## Phase 3: User Story 2 - Todos los objetivos y paginado (P1)

**Goal**: cuarta solapa y paginado de 10 en las tres grillas de objetivos.

**Independent Test**: escenarios 11 a 16.

- [X] T009 [US2] `Objetivo/objetivoUtils.ts` y `Objetivo/ObjetivosTable/ObjetivosTable.tsx` (plan, D5): `ObjetivosFiltro` suma `'todosObjetivos'` (`filterObjetivos` lo trata como "todos", `PalancaDetalle` no cambia); variante `'todos'` con columnas ID, Objetivo, VP, Palanca, Departamento, Gerencia, Peso, Avance, Estado, Ver; otra VP: Palanca "—", Peso "—", Avance "No aplica". **Criterio de terminado**: build sin errores; `PalancaDetalle` sin cambios visibles.

- [X] T010 [US2] `Palancas.tsx` (depende de T008 y T009): solapa "Todos los objetivos" después de "Objetivos de otras VP", con cantidad = total sin búsqueda ni filtros; `ObjetivosTable variant="todos"`; búsqueda y `matchesObjetivoFiltros` completo; estados vacíos `ObjetivosAllEmpty` y `PalancasFiltersEmpty`. **Criterio de terminado**: escenarios 11, 12, 13 y 15.

- [X] T011 [US2] `Palancas.tsx` (plan, D6; depende de T010): cortar las filas de las tres grillas de objetivos en páginas de 10 y mostrar `IniciativasPaginador` debajo, con el espacio inferior `96px` de la bandeja; "Todas las palancas" no pagina; la página se acota al último disponible. **Criterio de terminado**: escenario 14.

**Checkpoint**: US1 y US2 funcionan.

---

## Phase 4: User Story 3 - Resumen sin avance (P2)

**Independent Test**: escenario 17.

- [X] T012 [US3] `Palancas.tsx` y `Objetivo/objetivoUtils.ts` (plan, D8): usar el nuevo `PalancasSummary` con solo `{0}` y `{1}`; quitar el cálculo de `{2}` y `{3}` y la constante `DEFAULT_PROGRESS` y su import. **Criterio de terminado**: la línea dice "N palancas activas · N objetivos"; `Grep` de `DEFAULT_PROGRESS` sin resultados; build sin errores.

---

## Phase 5: User Story 4 - Confirmar que la vista se actualizó (P2)

**Independent Test**: escenarios 18, 19, 19b y 19c.

- [ ] T013 [P] [US4] Crear `components/shared/RefreshButton/RefreshButton.tsx` (prop `onClick`; `Button` `iconOnly` con `Tooltip` "Actualizar" e ícono `reload`, mismos estilos que hoy en `PalancasHeader`) y usarlo en `PalancasHeader.tsx`. **Criterio de terminado**: el botón de palancas se ve igual.

- [ ] T014 [US4] `Palancas.tsx` (plan, D4; depende de T002 y T013): `refresh` usa `Promise.all` con el séptimo elemento (`reloadItems`) de `usePalancaDataSource`, `useObjetivoDataSource`, `useIniciativaDataSource` y `useResultadoClaveDataSource`, con `.catch(() => undefined)`; al resolverse muestra `ViewRefreshed` con `SuccessNotice`; al rechazar no muestra nada propio (la vista pinta su error). El efecto inicial y `loadObjetivos` siguen con `getItems` y los getters. Solapa, búsqueda, filtros y página se mantienen. **Criterio de terminado**: escenarios 18 y 19.

- [ ] T015 [US4] `Iniciativa/IniciativasBandeja/IniciativasHeader/IniciativasHeader.tsx` e `IniciativasBandeja.tsx` (depende de T002 y T013): prop `onRefresh`, `RefreshButton` antes de Filtros; `refresh` con `Promise.all` de los `reloadItems` de iniciativas, objetivos, departamentos y resultados clave (`.catch(() => undefined)`) y el mismo mensaje; vista, búsqueda, filtros y página se mantienen. **Criterio de terminado**: escenarios 19b y 19c.

---

## Phase 6: User Story 5 - Confirmar antes de guardar (P2)

**Independent Test**: escenarios 20 a 26.

- [ ] T016 [P] [US5] `Palanca/PalancaForm/PalancaForm.tsx` (plan, D9): `save()` valida y abre `ConfirmacionModal` (`isConfirmOpen`); Aceptar ejecuta el guardado actual, con `isSaving` deshabilitándolo; Cancelar cierra sin tocar el formulario; el modal se cierra al terminar, con éxito o error. Alta: título `PalancaNew`, texto `PalancaConfirmCreate`; edición: `SaveChanges` y `PalancaConfirmEdit`, con `{0}` = nombre. **Criterio de terminado**: escenarios 20, 21, 22, 25 y 26.

- [ ] T017 [P] [US5] `Objetivo/ObjetivoForm/ObjetivoForm.tsx` (`ObjetivoFormBody`), igual que T016: alta con `ObjetivoNew` y `ObjetivoConfirmCreate`; edición con `ObjetivoConfirmEditTitle` y `ObjetivoConfirmEdit`. **Criterio de terminado**: escenarios 23, 24 y 25.

---

## Phase 7: Polish

- [ ] T018 Recorrer `quickstart.md` completo (con mocks y, con autorización, en el sitio de desarrollo) y registrar los resultados. Incluir la comparación visual de la bandeja antes y después (escenario 9b).
- [ ] T019 `Grep` final: sin `useRefreshNotice` ni `DEFAULT_PROGRESS`; `git diff` de `useDatasource.ts` sin cambios en `getItems`; `docs/plantilla-cambios.md` con la fila de T002.
- [ ] T020 Verificar que `docs/especificacion-funcional.md` (v1.10, ya aplicada en `5980331`) coincide con lo implementado: filtros, solapa, resumen, confirmaciones y RNF-06 (Actualizar). Si algo difiere, proponer el ajuste a la usuaria.

---

## Dependencies & Execution Order

- **Phase 1** bloquea todo; T001 y T002 son independientes entre sí y pueden ir en paralelo (archivos distintos).
- **US1**: T003 → T004 y T006; T005 en paralelo con T003; T006 después de T003 y T005; T007 → T008.
- **US2** depende de US1 (T008) por `Palancas.tsx`: T009 → T010 → T011.
- **US3** (T012) después de US2 (mismo archivo).
- **US4**: T013 en paralelo; T014 y T015 dependen de T002 y T013.
- **US5**: T016 y T017 en paralelo; independientes de las demás historias.
- Archivos compartidos que exigen orden (no paralelo): `Palancas.tsx` (T007, T008, T010, T011, T012, T014); `PalancasHeader.tsx` (T007, T013); `IniciativasBandeja.tsx` (T015).

### Parallel Opportunities

- T003 con T005; T013 con cualquier tarea de US1 a US3 que no toque `PalancasHeader.tsx`; T016 con T017.

## Implementation Strategy

- **MVP**: Phase 1 + US1 + US2 (las dos P1).
- **Entrega incremental**: US3, US4 y US5 se pueden mostrar cada una sola.
- Cada tarea cierra con `npm run build`; la T002 es aditiva y va primero porque T014 y T015 dependen de ella.
