# Implementation Plan: Ajustes de vistas

**Branch**: `008-ajustes-vistas` | **Date**: 2026-11-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-ajustes-vistas/spec.md`. Modifica pantallas de las features 002, 003, 004, 005 y 006; no agrega rutas ni datos.

## Summary

Cinco ajustes sobre el webpart `objetivosVp`, todos de interfaz:

- **Filtros** en la vista de palancas y objetivos, con el panel lateral que ya usa la bandeja de iniciativas. Se extrae su base a un componente compartido (`FiltrosPanel`) y la bandeja pasa a usarlo, sin duplicar ni tocar `src/core/ui`.
- **Solapa "Todos los objetivos"**, con una variante nueva de `ObjetivosTable`, y paginado de 10 en las tres grillas de objetivos con el paginador existente.
- **Resumen** sin el avance de la VP: se cambia una cadena y se quita el cálculo.
- **Actualizar**: mensaje de éxito en la vista de palancas y en la bandeja de iniciativas (que gana el botón). `getItems` de `useDatasource` pasa a relanzar el error, y el botón usa el resultado de la promesa para decidir entre éxito y error.
- **Confirmación al guardar** en `PalancaForm` y `ObjetivoForm`, con el `ConfirmacionModal` de iniciativas.

## Technical Context

**Language/Version**: TypeScript `~5.8.0` (configuración heredada de `@microsoft/spfx-web-build-rig`), igual que las features anteriores.

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`, Fluent UI v8, PnPjs `@pnp/sp 4.18.0`, `react-router-dom 6.30.6`. No se agregan dependencias.

**Storage**: ninguno nuevo. Se leen las listas ya cargadas por las pantallas (Palanca, Objetivo, Iniciativa, Resultado clave, Departamento, Gerencia, Vicepresidencia). **Sin cambios en listas ni columnas de SharePoint.**

**Testing**: no hay runner de pruebas. Validación: `npm run build` (principio V) y los escenarios de [quickstart.md](./quickstart.md) con mocks y en el workbench del sitio de desarrollo.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft).

**Performance Goals**: las vistas siguen cargando en menos de 3 s (RNF-05). Los filtros y el paginado se calculan en memoria sobre datos ya cargados (hasta unos 50 objetivos por año, RNF-04).

**Constraints**: `src/core/ui` de solo lectura; sin colores, tipografías ni espaciados fuera del DS; textos en español (AR) con `loc/`; mensajes de error y estados vacíos de una línea; sin rutas nuevas; roles todavía no implementados.

**Scale/Scope**: 1 componente compartido nuevo (`FiltrosPanel`), 1 botón compartido (`RefreshButton`), 1 helper (`settleLoads`), 1 cambio en el hook de la plantilla (`useDatasource.getItems`, con 6 `Promise.all` y 19 llamadas sueltas ajustadas), 1 archivo de lógica de filtros, 1 variante nueva de grilla, 1 botón agregado a la bandeja y 2 formularios con modal. Sin pantallas nuevas.

## Hallazgos del repo

- **Panel de filtros.** `IniciativasFiltros` arma el panel con `Panel` y `Dropdown` del DS, con un borrador local, "Limpiar" (`primaryAction`) y "Aplicar" (`secondaryAction`); cerrar con la X no aplica. Es específico de iniciativas solo por sus campos.
- **Botón Filtros de palancas.** `PalancasHeader` ya tiene el botón, sin `onClick`.
- **Actualizar.** Solo `PalancasHeader` lo tiene. `refresh()` en `Palancas.tsx` recarga palancas, objetivos, iniciativas y resultados clave, sin mensaje. `IniciativasHeader` no lo tiene.
- **Errores de carga.** `useDatasource.getItems` usa `handleAsync`: captura el error, lo deja en `state.error` y **no lo relanza**, así que su promesa siempre se resuelve y no se puede distinguir un éxito de un fallo. `editItem`, `deleteItem` y `getById` ya relanzan (`handleAsyncAndRethrow`, features 002 y 006); `getItems` es el único que falta (D4).
- **Usos de `getItems`** (los hooks de entidad lo exponen con distintos nombres; todos pasan por `useDatasource`; `Palancas.tsx` es el único que lo llama con el nombre `getItems`). Con el cambio, un fallo rechaza la promesa, y hoy nadie la atiende:
  - *6 `Promise.all([...]).then(() => setReady(true))`* en `IniciativaDetalle`, `useIniciativaFormMasters`, `IniciativasBandeja`, `ObjetivoDetalle`, `useObjetivoFormMasters` y `useObjetivoNames`. Si una carga falla, `Promise.all` rechaza y `setReady(true)` no se ejecuta: la pantalla quedaría cargando para siempre en lugar de mostrar su error (que sale de `state.error`). **Rompe sin ajuste.**
  - *19 llamadas sin esperar el resultado*: `IniciativaDetalle` (4, en `onEdited`, `onEstadoSaved` y `onTracked`), `IniciativasBandeja` (2, en `onCreated`), `ObjetivoDetalle` (2, en `reloadIniciativas`), `PalancaDetalle` (6, en la carga inicial y en `onObjetivoCreated`) y `Palancas` (5: `loadObjetivos` con 3, más `getItems()` en el efecto y en `refresh`). Un fallo daría un rechazo sin atender (aviso en consola); la pantalla sigue mostrando su error. **No rompen la pantalla, pero se atienden.**
  - Las llamadas a `getById` y a `editItem` no cambian.
- **Grillas de objetivos.** `ObjetivosTable` tiene variantes `palanca`, `delVp` y `otrasVp`, sin paginado. El paginador (`IniciativasPaginador`) es una pieza chica y reutilizable (`page`, `pageSize`, `total`, `onPageChange`); en la bandeja el contenedor deja `96px` de espacio inferior para él.
- **Solapas.** El estado `filtro: ObjetivosFiltro` (`'todos' | 'delVp' | 'otrasVp'`) vive en `ObjetivosVp.tsx` y también lo recibe `PalancaDetalle`, que lo pasa a `filterObjetivos` (solo `'delVp'` filtra; los demás valores no).
- **Resumen.** `PalancasSummary` usa `{2}` (año) y `{3}` (avance con `DEFAULT_PROGRESS`); `DEFAULT_PROGRESS` solo lo usa ese texto.
- **Confirmación.** `ConfirmacionModal` (`title`, `message`, `isSaving`, `onAccept`, `onCancel`) lo usa `IniciativaForm` con `isConfirmOpen`/`isSaving`, validando antes. `PalancaForm` y `ObjetivoForm` guardan directo. Los dos formularios se abren desde la vista de palancas, el detalle de palanca y el detalle de objetivo.
- **Datos disponibles.** `Objetivo` ya trae `VP`, `Palanca`, `Departamento`, `Gerencia`, `Estado`, `Duracion`, `FechaInicio`, `FechaCompromiso`, `Peso`, `PesoVP` y `EsDeVp`. `Gerencia` trae su `Departamento` (para filtrar el desplegable).

## Constitution Check

| Principio | Resultado |
|---|---|
| I. Plataforma | Cumple. Sin dependencias nuevas. |
| II. La interfaz no se inventa | **Desvío registrado** (Complexity Tracking): la solapa "Todos los objetivos" y el filtro Gerencia no están en la maqueta; los pidió la usuaria. El resto sale de la maqueta (Filtros, Actualizar, confirmaciones) o de pantallas ya implementadas. `src/core/ui` no se modifica, así que no hay entrada en `docs/design-system-cambios.md`. |
| III. Datos desacoplados | Cumple. Todo sobre los hooks y mocks existentes; no se accede a SharePoint desde componentes. `getItems` solo cambia cómo informa el error (lo relanza), no de dónde lee. |
| IV. Simplicidad | Cumple. Cada pieza nueva existe porque dos pantallas la usan (panel, hook de Actualizar) o por una regla propia (filtros de objetivos). |
| V. Validación | Cada tarea cierra con `npm run build`. El cambio en `useDatasource` se registra en `docs/plantilla-cambios.md` y en Complexity Tracking. |

## Interfaz y Design System

| Elemento | Origen | Componente |
|---|---|---|
| Panel "Filtros" | Maqueta (panel de filtros, `dFoot`) y bandeja de iniciativas | `Panel` + `Dropdown` del DS, dentro de `FiltrosPanel` |
| Botones Limpiar / Aplicar | Maqueta | `Button` `secondary` / `primary`, como en la bandeja |
| Botón Actualizar de la bandeja | Maqueta y `PalancasHeader` | `Button` `iconOnly` con `Tooltip` e ícono `reload`, mismos estilos que `PalancasHeader` |
| Mensaje de éxito | Existente | `SuccessNotice` |
| Solapa "Todos los objetivos" | Spec (no está en la maqueta) | `Tabs` existente |
| Grilla de la solapa | `ObjetivosTable` | `Table` del DS, columnas con chips de estado y `AvanceText` |
| Paginador | Bandeja de iniciativas | `IniciativasPaginador` |
| Modal de confirmación | Iniciativas (004) y maqueta | `ConfirmacionModal` sobre `Modal` |

No hay elementos sin componente en el DS. Los contratos de pantalla están en [contracts/ui-contracts.md](./contracts/ui-contracts.md).

## Decisiones

**D1. Panel de filtros compartido.** Se crea `shared/FiltrosPanel/FiltrosPanel.tsx`, con el `Panel`, el borrador local, los botones y los estilos que hoy tiene `IniciativasFiltros`. Recibe una lista de campos (`key`, `label`, opciones) y el valor inicial, y expone `onApply`, `onClear` y `onClose`. Admite un `normalize(borrador, claveCambiada)` opcional, para que Gerencia se limpie si ya no pertenece al departamento elegido. `IniciativasFiltros` queda como un envoltorio que arma sus cinco campos y sigue exportando la misma interfaz, así que la bandeja no cambia. `ObjetivosFiltros` es el segundo envoltorio. Se mueven los estilos `.panel` y `.fields` al componente compartido. Los textos "Aplicar" y "Todos" siguen en las cadenas existentes; "Limpiar filtros" pasa a "Limpiar" (valor de `IniciativasFiltersClear`, sin renombrar la clave).

**D2. Filtros de objetivos.** Archivo nuevo `Objetivo/objetivoFiltros.ts` con funciones puras:

- `IObjetivosFiltros` (`palancaId`, `departamentoId`, `gerenciaId`, `estado`, `anio`, todos texto, `''` = sin filtro) y `EMPTY_OBJETIVOS_FILTROS`.
- `matchesObjetivoFiltros(objetivo, filtros)`: compara ids y estado; `anio` se cumple si el año de `FechaInicio` ≤ año ≤ el de `FechaCompromiso`, o, con `Duracion.Permanente`, si el año ≥ el de inicio. Sin fechas (otra VP) no cumple cuando hay año elegido; sin palanca no cumple cuando hay palanca elegida (FR-009).
- `hasObjetivoFilter(filtros)`: Departamento, Gerencia, Estado o Año (no Palanca; FR-005).
- `getAniosObjetivos(objetivos)`: de menor a mayor y sin huecos, desde el menor año de inicio hasta el mayor año de compromiso (los permanentes aportan solo su año de inicio).

**D3. Estado de la vista.** Los filtros aplicados viven en `Palancas.tsx` como `useState`, igual que `searchText`: sobreviven al cambio de solapa y no a navegar a un detalle (supuesto de la spec). Con un `page` por solapa único: se reinicia a 1 al buscar, aplicar filtros o cambiar de solapa. El botón Filtros de `PalancasHeader` recibe `onOpenFilters`.

**D4. Actualizar y su mensaje.** Dos piezas:

1. `useDatasource.getItems` pasa de `handleAsync` a `handleAsyncAndRethrow`, igual que `editItem` y `getById` en la 002: despacha `ERROR` (así `state.error` sigue funcionando) y relanza. El tipo del hook (`() => Promise<void>`) no cambia. Se registra en `docs/plantilla-cambios.md` (fila nueva, feature 008).
2. Los usos actuales se ajustan para que nada dependa de que la promesa nunca rechace (ver Hallazgos). Se agrega `shared/settleLoads.ts`: `settleLoads(...loads: Array<Promise<unknown>>): Promise<void>` espera todas las cargas (`Promise.all`) y **nunca rechaza**, porque el error ya quedó en `state.error`. Los 6 `Promise.all(...).then(setReady)` pasan a `settleLoads(...).then(setReady)` (mismo comportamiento que hoy: la pantalla sale de "cargando" y muestra su error). Las llamadas sueltas también pasan por `settleLoads`. `Palancas.loadObjetivos` devuelve su promesa para que `refresh` la espere.

`refresh` no necesita ningún hook con estado: llama a las cargas con `Promise.all([...])`; si se resuelve, muestra `ViewRefreshed` con `SuccessNotice`; si rechaza, no muestra nada propio (el error de una línea ya lo pinta la vista desde `state.error`, FR-017). Si se pulsa Actualizar otra vez antes de que termine, vale el último resultado (el mensaje se reemplaza).

- Vista de palancas: `refresh` = `Promise.all([getItems(), getObjetivos(), getIniciativas(), getResultados()])`. El error que se ve es el que ya tiene (`PalancasLoadError` / `ObjetivosLoadError`).
- Bandeja: `refresh` = `Promise.all([getIniciativas(), getObjetivos(), getDepartamentos(), getResultados()])`; el error visible es `IniciativasLoadError`. El botón va antes de Filtros en `IniciativasHeader`, con la misma pieza y estilos que `PalancasHeader` (se comparten en un componente chico `shared/RefreshButton` para no copiar el bloque con `Tooltip`).
- Texto nuevo: `ViewRefreshed` = "La vista se ha actualizado correctamente.".
- La solapa, la búsqueda, los filtros y la página no se tocan en `refresh`; la página se acota al último disponible, como ya hace la bandeja.

**D5. Solapa "Todos los objetivos".** `ObjetivosFiltro` suma `'todosObjetivos'`. `PalancaDetalle` no cambia: `filterObjetivos` lo trata como "todos". `Palancas.tsx` suma la solapa (cantidad = `objetivos.length`, sin filtros) y `renderBody` muestra `ObjetivosTable` con `variant="todos"`. `ObjetivosTable` suma esa variante: columnas `[id, nombre, vp, palanca, departamento, gerencia, peso, avance, estado, acciones]`, con `peso` y `palanca` en "—" para otra VP (`peso` pasa a "—" si no es de la VP RRII) y `renderAvance` ya devuelve "No aplica". Estados vacíos: `ObjetivosAllEmpty` = "No hay objetivos cargados." (sin filtros ni búsqueda) y `PalancasFiltersEmpty` = "No hay palancas ni objetivos con estos filtros." con filtros; con solo búsqueda, `ObjetivosEmptySearch` como hoy.

**D6. Paginado.** `Palancas.tsx` corta las filas de las tres grillas de objetivos en páginas de 10 y muestra `IniciativasPaginador` debajo, con el espacio inferior de la bandeja (`96px`). `ObjetivosTable` no cambia por el paginado: recibe ya las filas de la página. "Todas las palancas" no pagina.

**D7. Reglas de filtrado en cada solapa.**

- *Todas las palancas*: se parte de `objetivosOfPalanca` y se agregan los filtros de objetivo; `palancaId` filtra las palancas; con `hasObjetivoFilter` se ocultan las palancas sin objetivos. La búsqueda sigue como hoy.
- *Objetivos de la VP RRII*, *otras VP* y *Todos los objetivos*: búsqueda y luego `matchesObjetivoFiltros` completo (incluida Palanca y Año).
- La cantidad de las solapas no depende de búsqueda ni filtros (FR-011). El estado vacío con filtros usa la cadena de FR-008.

**D8. Resumen.** `PalancasSummary` = "{0} palancas activas · {1} objetivos"; se quitan `{2}`, `{3}`, `DEFAULT_PROGRESS` en `Palancas.tsx` y la constante `DEFAULT_PROGRESS` si no queda otro uso.

**D9. Confirmación al guardar.** En `PalancaForm` y `ObjetivoFormBody`: `save()` valida (`setSubmitted(true)`) y, si es válido, abre el modal (`isConfirmOpen`); `onAccept` ejecuta el guardado actual, y `onCancel` cierra el modal sin tocar el formulario. `isSaving` deshabilita Aceptar (un solo guardado con doble clic); al terminar, éxito o error, se cierra el modal, como `IniciativaForm`. Textos nuevos en `loc/`: `PalancaConfirmCreate`, `PalancaConfirmEdit`, `ObjetivoConfirmCreate`, `ObjetivoConfirmEdit`, `ObjetivoConfirmEditTitle` ("Guardar cambios del objetivo"); los títulos "Nueva palanca", "Cargar objetivo" y "Guardar cambios" reutilizan `PalancaNew`, `ObjetivoNew` y `SaveChanges`. Como el modal vive en el formulario, aplica a las tres entradas (FR-023). No se tocan `Palancas`, `PalancaDetalle` ni `ObjetivoDetalle` por este motivo.

**D10. Textos.** Nuevos: `ViewRefreshed`, `ObjetivosAllEmpty`, `ObjetivosFilterTodos` (solapa "Todos los objetivos"), `PalancasFiltersEmpty`, los cinco de D9 y las etiquetas del panel ya existentes (`ObjetivoFieldDepartment`, `ObjetivoFieldManagement`, `PalancaColumnName`, `ObjetivoFormStatus`, `IniciativasFilterYear`). Modificados: `PalancasSummary`, `IniciativasFiltersClear` ("Limpiar"). Se actualizan `loc/en-us.js` y `loc/mystrings.d.ts`.

## Estructura de carpetas

```text
specs/008-ajustes-vistas/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md
├── contracts/ui-contracts.md
├── cambios-especificacion-funcional.md   # aplicado a docs/especificacion-funcional.md
└── checklists/requirements.md

src/core/api/useDatasource.ts                       # getItems relanza el error (D4)
docs/plantilla-cambios.md                              # fila nueva (D4)

src/webparts/objetivosVp/
├── loc/                                   # cadenas nuevas y modificadas (D10)
└── components/
    ├── shared/
    │   ├── FiltrosPanel/FiltrosPanel.tsx + .module.scss   # nuevo (D1)
    │   ├── RefreshButton/RefreshButton.tsx                # nuevo (D4)
    │   └── settleLoads.ts                                 # nuevo (D4)
    ├── Objetivo/
    │   ├── objetivoFiltros.ts                             # nuevo (D2)
    │   ├── objetivoUtils.ts                               # 'todosObjetivos'; sin DEFAULT_PROGRESS
    │   ├── ObjetivosTable/ObjetivosTable.tsx              # variante 'todos'
    │   ├── ObjetivosFiltros/ObjetivosFiltros.tsx          # nuevo (D1)
    │   └── ObjetivoForm/ObjetivoForm.tsx                  # modal (D9)
    ├── Palanca/
    │   ├── Palancas/Palancas.tsx                          # filtros, solapa, página, Actualizar, resumen
    │   ├── Palancas/PalancasHeader/PalancasHeader.tsx     # onOpenFilters; RefreshButton
    │   └── PalancaForm/PalancaForm.tsx                    # modal (D9)
    └── Iniciativa/IniciativasBandeja/
        ├── IniciativasBandeja.tsx                         # Actualizar
        ├── IniciativasHeader/IniciativasHeader.tsx        # RefreshButton
        └── IniciativasFiltros/IniciativasFiltros.tsx      # envoltorio de FiltrosPanel
```

## Orden de implementación

1. Cadenas de `loc/` (D10) y resumen sin avance (D8): cambio chico que valida el build.
2. `FiltrosPanel` y `IniciativasFiltros` sobre él, sin cambio visible (D1); verificar la bandeja.
3. `objetivoFiltros.ts` y `ObjetivosFiltros` (D2); botón Filtros conectado (D3).
4. Variante `todos` de `ObjetivosTable`, solapa y reglas por solapa (D5, D7); paginado (D6).
5. `getItems` relanza + `settleLoads` + ajuste de los 25 usos, en un solo cambio para que ninguna pantalla quede a medias; después `RefreshButton` y Actualizar en palancas y en la bandeja (D4).
6. Modales de confirmación en `PalancaForm` y `ObjetivoForm` (D9).
7. Recorrido del [quickstart.md](./quickstart.md).

## Riesgos

- **Usos de `getItems` sin ajustar.** Un `Promise.all(...).then(setReady)` que se olvide deja una pantalla cargando para siempre si falla una lista. Se mitiga con la lista exacta de los 25 usos (Hallazgos), con una búsqueda final con `Grep` de los getters sin `settleLoads` ni `.catch`, y con los escenarios 19, 19c y 19d (pantallas con la red cortada).
- **Cambio en la plantilla.** `getItems` lo comparten todas las pantallas; una feature futura podría asumir que no rechaza. Queda en `docs/plantilla-cambios.md` para reaplicarlo al actualizar la plantilla.
- **Parpadeo al actualizar en palancas.** `objetivosReady` es falso mientras recarga, así que las solapas de objetivos muestran el spinner un momento; es el comportamiento actual de Actualizar y no se cambia.
- **Estilos del panel.** Mover `.panel` y `.fields` a `FiltrosPanel` no debe cambiar la bandeja; se compara visualmente antes y después (escenario 9b).
- **Doble modal.** El formulario es un `Panel` y el modal se abre encima, como en `IniciativaForm`; se verifica el foco y el cierre con Cancelar.

## Prerrequisitos de SharePoint (a cargo de la usuaria)

Ninguno: no hay listas, columnas ni permisos nuevos.

## Complexity Tracking

| Desvío | Motivo | Alternativa descartada |
|---|---|---|
| Solapa "Todos los objetivos" fuera de la maqueta (principio II) | Pedido de la usuaria; sigue el diseño de la grilla existente | No hacerla |
| Filtro Gerencia en lugar de Responsable de la maqueta | El objetivo no tiene persona responsable; decidido en el clarify | Omitir el campo |
| Paginado en "Objetivos de la VP RRII" y "Objetivos de otras VP", que hoy no paginan | Decidido en el clarify, para que las tres grillas sean iguales | Paginar solo la nueva |
| `useDatasource.getItems` relanza el error (cambio en `src/core`, fuera de `src/core/ui`; se registra en `docs/plantilla-cambios.md`) | El botón Actualizar decide éxito o error con el resultado de la promesa, sin depender del orden de renders de `isLoading` ni de un hook con estado; mismo patrón que `editItem` y `getById` (002) y `deleteItem` (006) | Hook `useRefreshNotice` que mira `isBusy`/`error` (frágil por el momento del render y más código); contador propio de cargas |
| Se ajustan 6 `Promise.all` y 19 llamadas sueltas por el cambio anterior | Sin el ajuste, una carga fallida deja la pantalla cargando o produce rechazos sin atender | Dejar `getItems` como está |
| `IniciativasFiltros` se reescribe sobre `FiltrosPanel` | Evitar dos paneles casi iguales (pedido de reutilizar, sin duplicar) | Copiar el panel |
