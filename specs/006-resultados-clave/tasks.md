---

description: "Tareas de implementación de Resultados clave y cálculo de avance"
---

# Tasks: Resultados clave y cálculo de avance

**Input**: `specs/006-resultados-clave/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**:

- las features 003, 004 y 005 completas y compilando (`npm run build` sin errores);
- `npm ci` ejecutado;
- prototipo v10 en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (la carpeta dice v5, el contenido es v10);
- `docs/design-system-catalog.md`;
- en el sitio de desarrollo, a cargo de la usuaria y solo para probar con SharePoint (T028): columnas de `Resultado clave` verificadas (plan, P2) y columna `ResultadoClave` de `Comentario resultado clave` indexada (plan, P1). Con mocks no hace falta nada de esto.

**Tests**: no se piden. El repo no tiene runner de pruebas. Se valida con `npm run build`, con los escenarios de `quickstart.md` y comparando con el prototipo.

**Organization**: las tareas se agrupan por historia de usuario. Cada tarea indica el archivo exacto, los componentes del Design System (DS), su **Referencia** en el prototipo y su criterio de terminado. Las tres historias P1 se implementan en este orden: primero US2 (ver el detalle), después US1 (cargar) y después US3 (seguimiento), porque cargar y hacer el seguimiento se verifican en el detalle. Después van las dos P2: US4 (avance en bandeja, objetivo y palanca) y US5 (editar).

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: historia de `spec.md`:
  - US1: cargar los resultados clave al cargar una iniciativa;
  - US2: ver el resultado clave y el avance en el detalle de la iniciativa;
  - US3: actualizar el seguimiento de un resultado clave;
  - US4: ver el avance en bandeja, detalle del objetivo y detalle de la palanca;
  - US5: agregar o editar resultados clave al editar la iniciativa (los ya guardados no se quitan).

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores, lo que incluye lint y tipos.
- **Referencia al prototipo (constitución II)**, en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`:
  - bloque del panel: `<sc-if value="{{sideIni}}">`, rama `fm.objRrii` (buscar `Resultados clave` y `rowKr2`);
  - sección del detalle: `<sc-if value="{{scr.iniciativa}}">`, sección `sec.i_kr` (filas `c-kr2`);
  - seguimiento: `<sc-if value="{{m.is.krUpd}}">` (en esta feature es un panel lateral, no un modal);
  - avance en los encabezados: `hAv` de `scr.objetivo` y `scr.iniciativa`;
  - columna Avance: `scr.iniciativas` (`c-ib`), sección `sec.o_inis` de `scr.objetivo` (`c-oiP` y `c-oi`), grillas de objetivos (`c-gno`, `c-vpo`).
  - **No reproducir**: el campo de peso del resultado clave, el responsable y la descripción del resultado clave, la línea "Al menos uno · los pesos suman 100 % · Mínimo ≤ Meta ≤ Máximo", la fórmula `bandNote` de la sección Resultados clave, la nota "El objetivo es de otra VP…", el lápiz de edición de la sección Resultados clave, ni nada de tareas, indicadores, riesgos o presupuesto (FR-006, FR-011, FR-017, FR-037).
- **Textos**: siempre desde `import * as strings from 'ObjetivosVpWebPartStrings';`. Las plantillas con `{0}` y `{1}` se completan con `Utils.replaceAll`. Ningún texto visible escrito en el código. Se usan las claves de [contracts/ui-contracts.md](./contracts/ui-contracts.md), §5, incluidas las que se reutilizan.
- **`src/core/ui` es de solo lectura.** Imports por capa (`core/ui/components`, `core/ui/patterns`, `core/ui/foundations`), nunca del índice de `core` ni de `core/ui`, con la profundidad de rutas relativa que corresponda al archivo.
- **TypeScript estricto**: sin `any` nuevos, sin comentarios de código y sin literales mágicos (los números van a constantes locales con nombre al inicio del archivo). En `core`, las entidades y datasources ya usan `any` para el item de SharePoint: se sigue ese patrón sin agregar otros.
- **Estilos**: solo tokens del DS (`spacing`, `typography`, `colors`, `getColorStep`). Sin hexadecimales. Cada `.module.scss` nuevo, junto a su componente. No editar ni versionar `*.module.scss.ts`.
- **Hooks de React**: `useEffect` solo para cargar datos al montar o cuando cambia un Id. Lo derivado (listas filtradas, avances, errores, opciones) se calcula durante el render, sin `useMemo`.
- **Números y precisión (plan, D4)**: ningún resultado de punto flotante se compara con `===`. El avance se normaliza a 6 decimales antes de compararlo con los umbrales de color; el redondeo a entero es solo de presentación y el color y los promedios usan el valor sin redondear a entero.
- **Datos de SharePoint**: no se crean ni modifican listas, columnas, índices ni permisos desde código. Se escribe solo en las listas del sitio de desarrollo, en T028, con autorización. No se versionan URLs del sitio: las URLs de los datos de prueba son genéricas (`ejemplo`).
- **No modificar** `spec.md` ni `plan.md`. Si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo.

## Path Conventions

- Raíz del webpart: `src/webparts/objetivosVp/`. Las piezas nuevas van en `components/Iniciativa/` y `components/shared/` (estructura completa en plan, "Estructura de carpetas").
- `core`: `src/core/entities/ResultadoClave.ts`, `src/core/api/useDatasource.ts` y `src/core/api/{ResultadoClave, ComentarioResultadoClave}/`.
- Rutas de import de `core` según la carpeta del archivo: desde `components/Iniciativa/*.ts` → `'../../../../core/...'`; desde `components/Iniciativa/<Carpeta>/*.tsx` y `components/shared/<Carpeta>/*.tsx` → `'../../../../../core/...'`; desde `components/Iniciativa/<Carpeta>/<Subcarpeta>/*.tsx` → `'../../../../../../core/...'`. Copiar el patrón de un archivo vecino ya existente.

---

## Phase 1: Foundational (bloquea todas las historias)

**Purpose**: capa de datos, cálculos, textos y componente de avance que usan todas las historias.

- [X] T001 Ajustar la entidad en `src/core/entities/ResultadoClave.ts` (plan, D2):
  - en `toListItem`, agregar `Title: this.Nombre` (después de `...super.toListItem()`, antes de `Nombre`), como `src/core/entities/Iniciativa.ts`;
  - cambiar los tipos de `ValorActual` a `number | null | undefined`, de `Fuente` a `string | null | undefined` y de `Evidencia` a `IUrlValue | null | undefined`. `null` vaciará el campo en SharePoint; `undefined` no lo envía;
  - no cambiar `mapItem` (sigue convirtiendo `null` en `undefined` con `?? undefined`), ni los demás campos, ni `Descripcion`, `Responsable` o `Peso`;
  - revisar con `Grep` los usos de `ResultadoClave` en `src/` y arreglar solo lo que el cambio de tipos rompa.
  - **Criterio de terminado**: `toListItem` devuelve `Title` con el nombre; `npm run build` sin errores.

- [X] T002 Hacer que `deleteItem` relance el error en `src/core/api/useDatasource.ts` (plan, H4, D9): cambiar `const deleteItem = handleAsync(...)` por `handleAsyncAndRethrow(...)`, sin tocar el cuerpo. Nadie usa `deleteItem` hoy (verificar con `Grep` en `src/`). **Criterio de terminado**: `deleteItem` marca `error` en el estado y relanza; `npm run build` sin errores.

- [X] T003 [P] Crear `src/core/api/ResultadoClave/ResultadoClaveMock.ts` y hacer que los dos hooks lo usen (plan, D1, principio III). Copiar el patrón de `src/core/api/Iniciativa/IniciativaMock.ts`: `implements IResultadoClaveDataSource`, `listTitle = Lista.ResultadoClave`, estado a nivel de módulo, `notFoundError` con estado 404, `export default class ResultadoClaveMock`.
  - Datos (todos con `Iniciativa: { Id, Title }` igual al nombre de la iniciativa del mock; `TipoMedicion` con los valores del enum `TipoMedicion`; `Title` = `Nombre`; `Evidencia` como `{ Url, Description: '' }`):

    | Id | Iniciativa | Nombre | Tipo | Unidad | Mín. | Meta | Máx. | Actual | Proyect. | Fuente | Evidencia |
    |---|---|---|---|---|---|---|---|---|---|---|---|
    | 1 | 1 | Informes comerciales publicados | Cantidad | informes | 20 | 80 | 100 | 40 | 85 | Tablero de gestión | `https://ejemplo.sharepoint.com/sites/ejemplo/evidencia-1.pdf` |
    | 2 | 1 | Ahorro generado por decisiones basadas en datos | Moneda | KUSD | 100 | 200 | 210 | 230 | 230 | — | — |
    | 3 | 2 | Segmentos de clientes definidos | Cantidad | segmentos | 5 | 9 | 10 | 9 | 10 | — | — |
    | 4 | 3 | Modelos de propensión en producción | Cantidad | modelos | 20 | 40 | 50 | 30 | 40 | — | — |
    | 5 | 4 | Implementar YPF Store en 40 EESS | Cantidad | estaciones | 10 | 30 | 40 | (sin valor) | 30 | — | — |
    | 6 | 5 | Productos publicados en el catálogo | Cantidad | productos | 100 | 300 | 400 | 50 | 300 | — | — |
    | 7 | 5 | Conversión del canal online | Porcentaje | % | 1 | 3 | 5 | 3 | 4 | — | — |
    | 8 | 5 | Ventas online | Moneda | KUSD | 50 | 100 | 150 | 150 | 160 | — | — |
    | 9 | 6 | Tiendas piloto operativas | Cantidad | tiendas | 1 | 3 | 3 | 3 | 3 | — | — |
    | 10 | 8 | Catálogos impresos distribuidos | Cantidad | catálogos | 100 | 500 | 1000 | 1000 | 1000 | — | — |
    | 11 | 9 | Clientes nuevos con la promo | Cantidad | clientes | 1000 | 2000 | 2500 | 3000 | 3000 | — | — |
    | 12 | 10 | Referidos activos | Cantidad | referidos | 100 | 100 | 100 | 100 | 100 | — | — |

    Las iniciativas 7, 11, 12 y 13 y los objetivos 4, 5, 6 y 7 quedan sin resultados clave (cubren "iniciativa sin resultados clave" y "otra VP"). Avances que resultan: iniciativa 1 = 70, 2 = 90, 3 = 60 (objetivo 1 = 73,3); objetivo 2 = (0 + 57,5 + 100 + 0) ÷ 4 con la iniciativa 8 cancelada fuera.
  - `getItems`: `Promise.resolve(resultados.slice())`. `add`: próximo Id (máximo + 1), `Created` = ahora, `Author` = `USUARIO_PRUEBA` (de `../Usuario/UsuarioMock`). `edit`: rechaza con `notFoundError()` si no existe; combina con el existente **solo los campos definidos** del item recibido (recorrer con `Object.keys`, omitir los `undefined`) y convierte un `null` en `undefined` (así se vacía el campo), devolviendo `Object.assign(new ResultadoClave(), existente, definidos)`. `delete`: quita el elemento. `getById`: rechaza con `notFoundError()` si no existe.
  - Hooks: en `src/core/api/ResultadoClave/useResultadoClaveDataSource.ts` y `useItemResultadoClaveDataSource.ts`, pasar `new ResultadoClaveMock()` como segundo argumento de `useDatasource`, como `useIniciativaDataSource.ts`.
  - **Criterio de terminado**: fuera de SharePoint, `useResultadoClaveDataSource` devuelve los 12 elementos; `npm run build` sin errores.

- [X] T004 [P] Crear los comentarios de resultado clave en `src/core/api/ComentarioResultadoClave/` (plan, D1, D10):
  - `ComentarioResultadoClaveMock.ts`: copiar `src/core/api/ComentarioIniciativa/ComentarioIniciativaMock.ts` adaptando nombres y tipos a `IComentarioResultadoClaveDataSource` (que ya declara `getFilteredItems(resultadoClaveId)`), `ResultadoClave` en lugar de `Iniciativa` y `Lista.ComentarioResultadoClave`. Datos: resultado clave 1 con dos comentarios (`'Se relevaron los primeros informes.'`, `2026-03-05T12:00:00`, autor `BARBARA`; `'Quedan pendientes los informes del interior.'`, `2026-04-20T12:00:00`, autor `USUARIO_PRUEBA`); resultado clave 2 sin comentarios. `getFilteredItems` devuelve los del resultado clave, del más nuevo al más viejo. `add` asigna `Created` = ahora y `Author` = `USUARIO_PRUEBA`.
  - `useComentarioResultadoClaveDataSource.ts` y `useItemComentarioResultadoClaveDataSource.ts`: pasar `new ComentarioResultadoClaveMock()` como segundo argumento de `useDatasource`.
  - `useComentariosResultadoClave.ts` (nuevo): copiar `src/core/api/ComentarioIniciativa/useComentariosIniciativa.ts` con `ComentarioResultadoClave`, `ComentarioResultadoClaveDataSource`, `ComentarioResultadoClaveMock`, `IComentarioResultadoClaveDataSource`, la interfaz `IComentariosResultadoClaveState` y el parámetro `resultadoClaveId`; el mensaje de `console.error` dice "No se pudieron cargar los comentarios del resultado clave.".
  - **Criterio de terminado**: `useComentariosResultadoClave(1)` devuelve 2 comentarios, el más nuevo primero; `npm run build` sin errores.

- [X] T005 [P] Agregar los textos en `src/webparts/objetivosVp/loc/mystrings.d.ts` (propiedades `string` en `IObjetivosVpWebPartStrings`) y `src/webparts/objetivosVp/loc/en-us.js` (clave: texto, con el mismo formato y escapes de comillas que las claves vecinas), con las 53 claves de [contracts/ui-contracts.md](./contracts/ui-contracts.md), §5 (incluida `ResultadoClaveTooLong`, «No puede superar {0} caracteres.»), **sin repetir** `RequiredField`, `Cancel`, `SaveChanges`, `ObjetivoNoValue`, `ObjetivoColumnProgress`, `ObjetivoDetailProgress`, `IniciativaConfirmCreate`, `IniciativaConfirmEdit` ni `IniciativaSaveError`, que ya existen. Agregarlas al final, después de `IniciativaAddTooltip`. **Criterio de terminado**: todas las claves de la tabla de §5 existen en los dos archivos con el texto exacto; `npm run build` sin errores.

- [X] T006 Crear `src/webparts/objetivosVp/components/Iniciativa/resultadoClaveUtils.ts` con las funciones de [contracts/ui-contracts.md](./contracts/ui-contracts.md), §2, y las de borradores. Depende de T001 y T005. Estilo de `iniciativaUtils.ts` (constantes con nombre al inicio, `export const` de funciones puras, textos de `strings`, `getColorStep` desde `'../shared/getColorStep'`).
  - Constantes locales: `AVANCE_UMBRAL_AMARILLO = 60`, `AVANCE_UMBRAL_VERDE = 80`, `FULL_PERCENT = 100`, `NORMALIZE_FACTOR = 1000000` (6 decimales), `NUMBER_LOCALE = 'es-AR'`, `NUMBER_MAX_DECIMALS = 4`, `RESULTADO_CLAVE_ID_PREFIX = 'KR-'`, `ID_MIN_DIGITS = 2`, y la constante exportada `RESULTADO_CLAVE_MAX_LENGTH = { nombre: 100, unidad: 20, fuente: 100, evidencia: 255, comentario: 500 }` (FR-002b). Exportar también `getLengthIssue(valor: string, max: number): string | undefined`, que devuelve `Utils.replaceAll(strings.ResultadoClaveTooLong, '{0}', String(max))` si `valor.trim().length > max`, y `undefined` si no.
  - `normalizeAvance(valor)`: `Math.round(valor * NORMALIZE_FACTOR) / NORMALIZE_FACTOR` (interno).
  - `hasValorActual(resultado)`: `resultado.ValorActual !== undefined && resultado.ValorActual !== null`.
  - `getCumplimiento(resultado)`: si no tiene valor actual o `Maximo` no es un número mayor que 0, `0`; si no, `normalizeAvance(ValorActual * 100 ÷ Maximo)`. Puede superar 100 (FR-026).
  - `enum EstadoResultadoClave { SinDato, NoCumple, Minimo, Meta, Maximo }` y `getEstadoResultadoClave(resultado)` (FR-027): sin valor actual → `SinDato`; `valor < Minimo` → `NoCumple`; `valor < Meta` → `Minimo`; `valor < Maximo` → `Meta`; si no, `Maximo`. Compara los números tal como están, sin cuentas intermedias.
  - `getEstadoResultadoClaveLabel(estado)`: `strings.ResultadoClaveStatusNoData`, `...NotMet`, `...Minimum`, `...Goal`, `...Maximum`.
  - `getEstadoResultadoClaveChip(estado)`: devuelve `{ color: ChipColor; style?: CSSProperties }` (importar `ChipColor` de `'../../../../core/ui/patterns'` como en `iniciativaUtils.ts`): `NoCumple` → `danger`; `Minimo` → `warning`; `Meta` → `warning` con `style: { backgroundColor: getColorStep('Yellow', '100').value, color: getColorStep('Yellow', '800').value }`; `Maximo` → `success`; `SinDato` → `neutral` (plan, A1).
  - `getPesoResultadoClave(cantidad)`: `FULL_PERCENT / cantidad` (FR-011).
  - `getAvanceIniciativa(resultados)`: sin resultados `0`; si no, `normalizeAvance` del promedio simple de `Math.max(0, Math.min(getCumplimiento(r), FULL_PERCENT))`, es decir, cada resultado clave aporta entre 0 % y 100 % (FR-024, FR-028).
  - `getAvanceObjetivo(objetivoId, iniciativas, resultados)`: toma las iniciativas con `Objetivo?.Id === objetivoId` y `Estado !== EstadoIniciativa.Cancelada` (`EstadoIniciativa` de `core/utils/Constants`); sin ninguna `0`; si no, `normalizeAvance` del promedio de `getAvanceIniciativa(resultados.filter((r) => r.Iniciativa?.Id === iniciativa.Id))` (FR-025, FR-029).
  - `getAvanceColor(avance)`: con `normalizeAvance(avance)`, `< AVANCE_UMBRAL_AMARILLO` → `'rojo'`, `< AVANCE_UMBRAL_VERDE` → `'amarillo'`, si no `'verde'`; exportar el tipo `AvanceColor` (FR-030).
  - `formatAvance(avance)`: `const redondeado = Math.round(avance); return redondeado === 0 ? 0 : redondeado;` (sin `-0`, FR-031).
  - `formatResultadoClaveId(id)`: `KR-` + Id con `padStart(2, '0')`; `''` si `id` es `undefined`.
  - `formatResultadoClaveNumero(valor)`: `strings.ObjetivoNoValue` si es `undefined` o `null`; si no, `valor.toLocaleString(NUMBER_LOCALE, { maximumFractionDigits: NUMBER_MAX_DECIMALS })`.
  - Borradores (plan, D7): exportar `interface IResultadoClaveDraft { key: number; id?: number; nombre: string; tipo: string; unidad: string; minimo: string; meta: string; maximo: string }` e `interface IResultadoClaveIssues { nombre?: string; tipo?: string; unidad?: string; minimo?: string; meta?: string; maximo?: string }`; `createEmptyDraft(key)` (todo `''`); `toDraft(resultado, key)` (`id` = `resultado.Id`, números a texto con `String`, `''` si faltan); `parseNumero(texto)` interna: `texto.trim() === ''` → `undefined`; si no `Number(texto)`, y `undefined` si no es finito; `getDraftIssues(draft)`:
    - `nombre`, `tipo` y `unidad` vacíos (recortando espacios) → `strings.RequiredField`;
    - `nombre` y `unidad` con más caracteres que `RESULTADO_CLAVE_MAX_LENGTH` → `getLengthIssue` (FR-002b);
    - `minimo`, `meta` y `maximo` vacíos → `strings.RequiredField`; con texto no numérico → `strings.ResultadoClaveNotNumber`;
    - si `maximo` es numérico y `<= 0` → `strings.ResultadoClaveMaxPositive`;
    - si `meta` y `minimo` son numéricos y `meta < minimo` → error de `meta`: `strings.ResultadoClaveGoalBelowMin`;
    - si `maximo` y `meta` son numéricos, `maximo > 0` y `maximo < meta` → error de `maximo`: `strings.ResultadoClaveMaxBelowGoal`;
    - cada campo muestra a lo sumo un error (el primero que corresponda en el orden de arriba); los campos sin error no tienen la propiedad.
  - `isDraftChanged(draft, original)`: `true` si cambia `nombre` o `unidad` (recortados), `tipo`, o `Number(minimo)`, `Number(meta)`, `Number(maximo)` respecto de `original.Minimo`, `original.Meta`, `original.Maximo`.
  - **Criterio de terminado**: con los datos de T003, `getAvanceIniciativa` da 70 para la iniciativa 1 y `getAvanceObjetivo(1, …)` da 73,33…; un resultado clave con valor actual negativo aporta 0 % (nunca avance negativo); `getAvanceColor` da rojo para 59,9, amarillo para 60 y 79,9 y verde para 80; `formatAvance(-0.2)` da `0`; `getEstadoResultadoClave` da los cinco estados con los datos del mock; `npm run build` sin errores.

- [X] T007 [P] Crear `src/webparts/objetivosVp/components/shared/AvanceText/AvanceText.tsx` (plan, D6; contrato en §3). Depende de T006. **DS**: ninguno (solo tokens). `React.FC<IAvanceTextProps>` con `value: number` y `spaced?: boolean`; devuelve `<b style={{ fontWeight: typography.weight.bold, color }}>` con `` `${formatAvance(value)}${spaced ? ' %' : '%'}` ``, donde `color` es `getColorStep('Red', '600').value` para `'rojo'`, `getColorStep('Yellow', '700').value` para `'amarillo'` y `getColorStep('Green', '700').value` para `'verde'` según `getAvanceColor(value)`; las claves y valores del mapa de colores en una constante al inicio. Estilo de `shared/HeaderChip` y `shared/Field`. **Criterio de terminado**: `<AvanceText value={70} />` muestra "70%" en amarillo y `spaced` "70 %"; 59,5 muestra "60%" en rojo; `npm run build` sin errores.

**Checkpoint**: la capa de datos, los cálculos y el componente compilan; ninguna pantalla cambió todavía.

---

## Phase 2: User Story 2 - Ver el resultado clave y el avance en el detalle de la iniciativa (Priority: P1)

**Goal**: el detalle de la iniciativa de un objetivo de la VP RRII muestra el avance en el encabezado y la sección "Resultados clave (N)".

**Independent Test**: abrir el detalle de la iniciativa 1 del mock (avance 70 %, amarillo; dos resultados clave con pesos 50 % y cumplimientos 40 % y 110 %) y el de una iniciativa de otra VP (sin sección ni avance). Escenarios 13 a 17 de `quickstart.md`.

- [X] T008 [US2] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaResultadosClave/IniciativaResultadosClave.tsx` (plan, D12; contrato en §3). **Referencia**: `scr.iniciativa`, sección `sec.i_kr`. **DS**: `Table` (`core/ui/components`, tipo `ITableColumn`), `Chip` (`core/ui/patterns`), `Button` `iconOnly` + `FigmaIcon` `editPrimary` + `Tooltip`, `SectionBand` (`shared/`) con `collapsible`. Copiar el patrón de `Iniciativa/IniciativasTable/IniciativasTable.tsx` (filas tipadas, `renderEstado`, `renderActions`, `ICON_BUTTON_STYLE`, `ACTION_BUTTON_STYLE`).
  - Props: `resultados: ResultadoClave[]` y `onTrack?: (resultado: ResultadoClave) => void`.
  - `SectionBand` `title={Utils.replaceAll(strings.ResultadoClaveSection, '{0}', String(resultados.length))}` `collapsible`, sin `action` (no hay lápiz de sección).
  - `Table` con `emptyText={strings.ResultadoClaveEmpty}`, `getRowKey` por Id, filas ordenadas por Id ascendente (orden de carga, FR-013) y las columnas, en este orden (encabezados `strings.ResultadoClaveColumnName`, `...Type`, `...Min`, `...Goal`, `...Max`, `...Weight`, `...Current`, `...Projected`, `...Compliance`, `...Status`, `...Action`):
    1. Resultado clave: el nombre y debajo, en una segunda línea de `typography.size[12]` con `colors.neutral.textMuted`, la unidad y, si hay fuente, `" · "` + `Utils.replaceAll(strings.ResultadoClaveSource, '{0}', fuente)`;
    2. Tipo: `TipoMedicion`;
    3. Mín., Meta, Máx.: `formatResultadoClaveNumero`;
    4. Peso: `` `${formatAvance(getPesoResultadoClave(resultados.length))}%` `` (entero redondeado: con tres resultados clave, "33%" cada uno, FR-031);
    5. Actual: `formatResultadoClaveNumero(ValorActual)`, en negrita (`typography.weight.bold`);
    6. Proyect.: `formatResultadoClaveNumero(ValorProyectado)`;
    7. Cumplim.: `strings.ObjetivoNoValue` si `!hasValorActual`; si no, `` `${formatAvance(getCumplimiento(r))}%` ``, **sin color**;
    8. Estado: `Chip` `size="small"` `clickable={false}` con `label={getEstadoResultadoClaveLabel(estado)}` y `color`/`style` de `getEstadoResultadoClaveChip(estado)`;
    9. Acción: si hay `onTrack`, botón `iconOnly` `variant="secondary"` `size="small"` con `FigmaIcon` `editPrimary`, `Tooltip` y `aria-label` `strings.ResultadoClaveTrackTooltip`, que llama `onTrack(resultado)`; si no, `strings.ObjetivoNoValue`.
  - **Criterio de terminado**: renderizada con los resultados clave 1 y 2 del mock muestra dos filas con Peso 50%, Cumplim. 40% y 110%, Estado "Mínimo" (naranja) y "Máximo" (verde); renderizada con tres resultados clave (por ejemplo, los del mock de las iniciativas 1 y 2 juntos) cada peso muestra "33%"; sin resultados, "Esta iniciativa no tiene resultados clave."; `npm run build` sin errores.

- [X] T009 [US2] Ampliar `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` y su `.module.scss` (plan, D11, D17). **Referencia**: `hAv` de `scr.iniciativa`. **DS**: `AvanceText`, `IniciativaResultadosClave`. Depende de T006, T007 y T008.
  - Importar `useResultadoClaveDataSource` (`core/api/ResultadoClave/useResultadoClaveDataSource`) y `getAvanceIniciativa` de `../resultadoClaveUtils`. Agregar `const [resultadoState, getResultados] = useResultadoClaveDataSource();` y sumar `getResultados()` al `Promise.all` del `useEffect` existente.
  - `const resultados = resultadoState.items.filter((item) => item.Iniciativa?.Id === iniciativaId);` y `loadError` suma `resultadoState.error`.
  - Encabezado: dentro de `styles.header`, después del `HeaderChip`, si `isRrii` y `iniciativa`, un `<div className={styles.headerEnd}>` con `<span style={PROGRESS_LABEL_STYLE}>{strings.ObjetivoDetailProgress} <AvanceText value={getAvanceIniciativa(resultados)} spaced /></span>`. Copiar `PROGRESS_LABEL_STYLE` y la estructura de `Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx` (sin el `LocationButton`) y agregar la clase `.headerEnd` (`display: flex; align-items: center; margin-left: auto;`) a `IniciativaDetalle.module.scss`, igual que en `ObjetivoDetalle.module.scss`; el `gap` con `spacing.md` por estilo en línea.
  - Cuerpo (`renderBody`): después de `IniciativaInfo` y antes de `IniciativaComentario`, si `isRrii`, `<IniciativaResultadosClave resultados={resultados} />` (todavía sin `onTrack`).
  - En `onEdited`, recargar también `getResultados()` (el panel de edición podrá cambiarlos).
  - **Criterio de terminado**: `#/iniciativa/1` muestra "Avance: 70 %" en amarillo y la sección "Resultados clave (2)" debajo de "Información de la iniciativa"; una iniciativa de otra VP (`#/iniciativa/11`) no muestra ni sección ni avance; la 7 (VP RRII sin resultados clave) muestra "Avance: 0 %" en rojo y la línea vacía; `npm run build` sin errores.

**Checkpoint**: el detalle de la iniciativa muestra resultados clave y avance. Verificar escenarios 13 a 17.

---

## Phase 3: User Story 1 - Cargar los resultados clave al cargar una iniciativa (Priority: P1)

**Goal**: el panel de cargar iniciativa de un objetivo de la VP RRII incluye el bloque "Resultados clave" y guarda la iniciativa y sus resultados clave juntos.

**Independent Test**: escenarios 1 a 12 de `quickstart.md`.

- [X] T010 [P] [US1] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/ResultadosClaveBloque/ResultadosClaveBloque.tsx` y `ResultadosClaveBloque.module.scss` (contrato en §3). **Referencia**: `sideIni`, rama `fm.objRrii` (sin el campo de peso ni la línea de ayuda). **DS**: `SectionBand` (`shared/`), `Input` y `Dropdown` (`core/ui/components`), `Button` `iconOnly` + `FigmaIcon` `addPrimary` / `deletePrimary` + `Tooltip`. Los estilos de error se reutilizan de `'../IniciativaForm.module.scss'` (`styles.invalid`, igual que `IniciativaEstadoPanel`). Depende de T005 y T006.
  - Props: `drafts: IResultadoClaveDraft[]`, `issues: IResultadoClaveIssues[]` (mismo orden que `drafts`, ya filtrados por `submitted`) y `onChange: (drafts: IResultadoClaveDraft[]) => void`. Un contador local de `key` para los borradores nuevos: `Math.max(...drafts.map(d => d.key)) + 1` (o `0` si no hay).
  - `SectionBand` `title={strings.ResultadoClaveFormSection}` con `action` = botón "+" (`Button` `iconOnly` `variant="secondary"` `size="small"` `style={ICON_BUTTON_STYLE}` + `FigmaIcon` `addPrimary` + `Tooltip` `strings.ResultadoClaveAddTooltip`, `aria-label` igual), como `Objetivo/ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx`; "+" llama `onChange([...drafts, createEmptyDraft(nextKey)])`.
  - Un bloque por borrador, con `gap: spacing.md` y `.module.scss` con grillas de 2 y 3 columnas iguales (`display: grid; grid-template-columns: repeat(2, minmax(0, 1fr))` y `repeat(3, ...)`, como `.gridPair` de `IniciativaForm.module.scss`) y un contenedor por campo con `width: 100%; box-sizing: border-box`:
    1. `Input` `label={Utils.replaceAll(strings.ResultadoClaveFormName, '{0}', String(index + 1))}` `required` `placeholder={strings.ResultadoClaveFormNamePlaceholder}`, a todo el ancho;
    2. fila de dos: `Dropdown` `label={strings.ResultadoClaveFormType}` `required` `placeholder={strings.ResultadoClaveSelect}` con opciones `Object.values(TipoMedicion).map((value) => ({ key: value, text: value }))` y `value={draft.tipo}`; `Input` `label={strings.ResultadoClaveFormUnit}` `required` `placeholder={strings.ResultadoClaveFormUnitPlaceholder}`;
    3. fila de tres: tres `Input` `type="number"` `step="any"` `required` con `label` `strings.ResultadoClaveFieldMin`, `...Goal`, `...Max`.
    - Cada campo con `errorMessage={issues[index]?.<campo>}` y `className={styles.invalid}` cuando hay error (como `IniciativaFormBody`: `invalid(...)`; aquí basta `issues[index]?.<campo> ? styles.invalid : undefined`).
  - Botón de descartar solo si `index > 0` **y** `draft.id === undefined` (un resultado clave ya guardado no se puede quitar, FR-010; solo se descartan los bloques todavía sin guardar): `Button` `iconOnly` `variant="secondary"` `size="small"` + `FigmaIcon` `deletePrimary` + `Tooltip` y `aria-label` `Utils.replaceAll(strings.ResultadoClaveRemoveTooltip, '{0}', String(index + 1))`, que llama `onChange(drafts.filter((item) => item.key !== draft.key))`; ubicado a la derecha del encabezado de su bloque (el nombre ocupa todo el ancho; el botón va en una fila propia alineada a la derecha, sobre el nombre).
  - **Criterio de terminado**: con `drafts` de un elemento no muestra botón de quitar; "+" agrega bloques numerados "Resultado clave 2", "3"; descartar uno nuevo renumera; los borradores con `id` no ofrecen quitarse; los errores salen en el campo; sin textos de ayuda; `npm run build` sin errores.

- [X] T011 [US1] Cargar los resultados clave en los maestros del panel, en `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/useIniciativaFormMasters.ts` (plan, D8). Depende de T003. Cambiar la firma a `useIniciativaFormMasters = (iniciativaId?: number): IIniciativaFormMasters`; agregar `resultadosClave: ResultadoClave[]` a `IIniciativaFormMasters`; `const [resultadoState, getResultados] = useResultadoClaveDataSource();`; en el `useEffect` sumar `getResultados()` al `Promise.all` **solo si** `iniciativaId !== undefined` (`iniciativaId === undefined ? Promise.resolve() : getResultados()`); devolver `resultadosClave: resultadoState.items.filter((item) => item.Iniciativa?.Id === iniciativaId)` y sumar `resultadoState.error` a `error`. **Criterio de terminado**: con `iniciativaId` devuelve sus resultados clave; sin él, `[]` y sin consulta; `npm run build` sin errores.

- [X] T012 [US1] Integrar el bloque en el formulario y propagar el permiso, en un solo cambio que deja compilando a todos los llamadores (plan, D7, D8, D14; contrato en §4). Depende de T005, T006, T010 y T011.
  - `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/IniciativaForm.tsx`:
    - props nuevos de `IIniciativaFormBodyProps`: `resultadosClave: ResultadoClave[]` y `canLoadResultadosClave: boolean`; `onSave` pasa a `(iniciativa: Iniciativa, drafts: IResultadoClaveDraft[]) => Promise<IResultadoClaveDraft[]>` (el formulario espera el resultado y no lo usa);
    - estado `const [drafts, setDrafts] = React.useState<IResultadoClaveDraft[]>(...)` inicializado con `resultadosClave` ordenados por Id y mapeados con `toDraft(resultado, index)`, o `[createEmptyDraft(0)]` si no hay (la edición con resultados clave existentes funciona desde acá; su guardado es T020);
    - `const showResultadosClave = canLoadResultadosClave && isVpRrii(objetivo?.VP?.Title);` (`isVpRrii` de `../../Objetivo/objetivoUtils`). Si es verdadero, mostrar `<ResultadosClaveBloque drafts={drafts} issues={draftIssues} onChange={setDrafts} />` después del par de fechas y antes del `MessageBar` de error de guardado;
    - validación: `const draftIssues = drafts.map((draft) => getDraftIssues(draft))`, que solo cuenta en `hasIssues` si `showResultadosClave`; al bloque se le pasan los issues filtrados por `submitted` (`submitted ? issues : {}`). No hay campo "al menos uno": el primer borrador no se puede quitar (FR-014);
    - `save`: `await onSave(buildIniciativa(), showResultadosClave ? drafts : [])`;
    - sin textos de ayuda; no cambiar el modal de confirmación ni sus textos.
  - `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/IniciativaFormPanel.tsx` (el llamador de `IniciativaFormBody`): prop nueva `canLoadResultadosClave: boolean`; llamar `useIniciativaFormMasters(iniciativa?.Id)`; pasar `resultadosClave={masters.resultadosClave}` y `canLoadResultadosClave`; adaptar `save` a `(toSave, drafts): Promise<IResultadoClaveDraft[]>` con el mismo comportamiento de hoy (alta con `addItem`, edición con `editItem`, luego `onSaved`) y `return drafts`. La lógica de resultados clave llega en T013 y T020.
  - Permiso (FR-038, FR-039): en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx` agregar `const CAN_LOAD_RESULTADOS_CLAVE = true;` junto a las demás `CAN_*` y pasar `canLoadResultadosClave={CAN_LOAD_RESULTADOS_CLAVE}` a `IniciativasBandeja`, `ObjetivoDetalle` e `IniciativaDetalle`. Agregar la prop `canLoadResultadosClave: boolean` a `IIniciativasBandejaProps` (`Iniciativa/IniciativasBandeja/IniciativasBandeja.tsx`), `IObjetivoDetalleProps` (`Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx`), `IObjetivoIniciativasProps` (`Objetivo/ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx`; `ObjetivoDetalle` se la pasa) e `IIniciativaDetalleProps` (`Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx`), y pasarla a cada `<IniciativaFormPanel ... canLoadResultadosClave={canLoadResultadosClave} />`.
  - **Criterio de terminado**: `npm run build` sin errores; en el alta, sin objetivo o con uno de otra VP no hay bloque; con uno de la VP RRII aparece con un resultado clave; los errores de T006 salen al intentar guardar; si se cambia el objetivo de uno de la VP RRII a otro de otra VP los borradores se ocultan y no se validan, y al volver reaparecen; el panel de alta (bandeja y detalle del objetivo) y el de edición (detalle de la iniciativa) muestran el bloque para un objetivo de la VP RRII; con la constante en `false` no lo muestran y la iniciativa se guarda como en la 004.

- [X] T013 [US1] Guardado conjunto del alta, retomable, en `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/IniciativaFormPanel.tsx` (plan, D9, riesgo R1, FR-015). Depende de T002, T003 y T012. No cambia ningún contrato: es lógica interna del panel.
  - Agregar `const [, , addResultado, , deleteResultado] = useResultadoClaveDataSource();` y tomar `deleteItem` de `useIniciativaDataSource()` (`const [, , addItem, editItem, deleteItem] = ...`).
  - Dos referencias (`useRef`): `iniciativaCreada: Iniciativa | undefined` y `resultadosCreados: Record<number, ResultadoClave>` (por `key` de borrador), para que un reintento retome lo pendiente sin duplicar.
  - `save(toSave, drafts)` para el **alta** (`iniciativa` indefinida): (1) si no hay `iniciativaCreada`, `addItem(toSave)` y guardarla en la referencia; (2) para cada borrador cuyo `key` no esté en `resultadosCreados`, en orden, `addResultado` de un `ResultadoClave` **parcial** armado con `Object.assign(new ResultadoClave(), { ... })` con solo `Nombre` (recortado), `TipoMedicion` (validado como `TipoMedicion`), `UnidadMedida` (recortada), `Minimo`, `Meta`, `Maximo` (con `Number`), `ValorProyectado` igual a `Meta` (FR-007) e `Iniciativa: { Id, Title }` de la iniciativa creada; no se envían `Descripcion`, `Responsable`, `Peso`, `ValorActual`, `Fuente` ni `Evidencia`; guardar cada uno en `resultadosCreados` apenas se crea; (3) si algún paso falla, **deshacer**: `deleteResultado` de cada resultado clave creado y, solo si todos se borraron, `deleteItem` de la iniciativa; limpiar las referencias de lo que se borró y conservar las de lo que siga guardado (si el deshacer falla, `useDatasource` registra el error y el reintento retoma lo pendiente); en todos los casos relanzar el error original para que `IniciativaFormBody` muestre `IniciativaSaveError` y conserve lo ingresado; (4) si todo sale bien, `onSaved(iniciativaCreada)` y devolver los borradores con `id` = Id del resultado clave creado.
  - Si `drafts` está vacío (objetivo de otra VP o `canLoadResultadosClave` falso), el alta funciona como hoy: solo `addItem` y `onSaved`.
  - La edición queda como hoy hasta T020.
  - **Criterio de terminado**: con mocks, cargar una iniciativa del objetivo 1 con dos resultados clave crea 1 iniciativa y 2 resultados clave con `ValorProyectado` = `Meta`, sin `Responsable`, `Peso` ni `Descripcion`; si se fuerza que el segundo `add` falle (cambio temporal local, no versionar) no queda ni la iniciativa ni el primer resultado clave; si además se fuerza que falle el borrado, el reintento no duplica la iniciativa ni el primer resultado clave y crea solo el que faltaba; `npm run build` sin errores.

- [X] T014 [US1] Verificar el permiso de carga (FR-038, FR-039), sin código nuevo. Depende de T012 y T013. Con `Grep`, confirmar que `canLoadResultadosClave` llega a los tres lugares que abren `IniciativaFormPanel` (`IniciativasBandeja.tsx`, `ObjetivoIniciativas.tsx` y `IniciativaDetalle.tsx`) y que `CAN_LOAD_RESULTADOS_CLAVE` existe solo en `ObjetivosVp.tsx`. Probar con la constante en `false` (cambio temporal local, no versionar) y volverla a `true`. **Criterio de terminado**: con `false` ninguno de los tres paneles muestra el bloque ni toca los resultados clave al guardar; `npm run build` sin errores.

**Checkpoint**: se puede cargar una iniciativa con resultados clave y verla en el detalle. Verificar escenarios 1 a 12 (el 12 con el cambio temporal descripto en T013).

---

## Phase 4: User Story 3 - Actualizar el seguimiento de un resultado clave (Priority: P1)

**Goal**: desde el detalle, la acción de cada fila abre el panel de seguimiento y al guardar se recalculan cumplimiento, estado y avance.

**Independent Test**: escenarios 18 a 27 de `quickstart.md`.

- [X] T015 [US3] Crear `src/webparts/objetivosVp/components/Iniciativa/ResultadoClaveSeguimientoPanel/ResultadoClaveSeguimientoPanel.tsx` (plan, D13; contrato en §3). **Referencia**: `m.is.krUpd`. **DS**: `Panel`, `MessageBar` (`core/ui/patterns`), `Input`, `Multiline` (`core/ui/components`), `Button`, `Field` (`shared/`). Copiar el patrón de `Iniciativa/IniciativaEstadoPanel/IniciativaEstadoPanel.tsx` (panel de 480 px con `styles` de `'../IniciativaForm/IniciativaForm.module.scss'`, `buildPanelTitle`, `saveFailed`, `isSaving`) **sin** `ConfirmacionModal`. Depende de T003, T004, T005 y T006.
  - Props: `resultado: ResultadoClave`, `onSaved: (resultado: ResultadoClave) => void`, `onCancel: () => void`.
  - Datos: `const [, , addComentario] = useComentarioResultadoClaveDataSource();`, `const [, , , editResultado] = useResultadoClaveDataSource();`, `const comentarios = useComentariosResultadoClave(resultado.Id);` y `const ultimo = comentarios.items[0];` (ya vienen del más nuevo al más viejo).
  - Título: `buildPanelTitle(strings.ResultadoClaveTrackPanelTitle, `${formatResultadoClaveId(resultado.Id)} · ${resultado.Nombre ?? ''}`)`.
  - Solo lectura, en una grilla de dos columnas con `Field`: `strings.ResultadoClaveTrackUnitType` = `` `${resultado.UnidadMedida} · ${resultado.TipoMedicion}` `` y `strings.ResultadoClaveTrackRange` = `` `${formatResultadoClaveNumero(Minimo)} · ${formatResultadoClaveNumero(Meta)} · ${formatResultadoClaveNumero(Maximo)}` ``.
  - Campos (estado local como texto, inicializado con los valores vigentes: `String(ValorActual)` o `''`; `String(ValorProyectado)`; `Fuente ?? ''`; `Evidencia?.Url ?? ''`): `Input` `type="number"` `step="any"` Valor actual (`strings.ResultadoClaveFieldCurrent`); `Input` `type="number"` `step="any"` `required` Valor proyectado (`...FieldProjected`); `Input` Fuente con `placeholder={strings.ResultadoClaveFieldSourcePlaceholder}`; `Input` `type="url"` Evidencia (`...FieldEvidence`, `placeholder={strings.ResultadoClaveFieldEvidencePlaceholder}`); `Multiline` Comentario (`...FieldComment`, `placeholder={strings.ResultadoClaveFieldCommentPlaceholder}`, `className={styles.multiline}`), precargado con `ultimo?.Comentario ?? ''` cuando terminan de cargar los comentarios (estado inicial vacío; cuando `comentarios.isLoading` pasa a falso y el campo no fue tocado, completarlo; mientras carga, `disabled`) y, debajo, si hay `ultimo`, una línea de solo lectura con `Utils.replaceAll(Utils.replaceAll(strings.ResultadoClaveLastComment, '{0}', formatDate(ultimo.Created)), '{1}', ultimo.Author?.Title ?? '')` (`formatDate` de `../../Objetivo/objetivoUtils`) con `typography.size[12]` y `colors.neutral.textMuted`.
  - Validación al elegir Guardar (errores en el campo, una línea, `className={styles.invalid}` y `errorMessage`): fuente o comentario que superan `RESULTADO_CLAVE_MAX_LENGTH` → `getLengthIssue` (FR-002b); evidencia con más de 255 caracteres → `getLengthIssue`, pero solo si el link es válido (el error de link va primero); proyectado vacío → `strings.RequiredField`; proyectado o actual (si no está vacío) no numérico → `strings.ResultadoClaveNotNumber`; evidencia (si no está vacía, recortada) con `Utils.validateAndSanitizeUrl(valor) === ''` → `strings.ResultadoClaveInvalidLink` («Ingresá un link de SharePoint u Office 365.»; `Utils` de `core/utils` solo acepta dominios de confianza, FR-009; no ampliar la lista de dominios, no crear otra validación). Un número válido es el que `Number(texto)` convierte en finito con el texto no vacío.
  - Guardar (sin modal): `isSaving` verdadero; (1) si `comentario.trim() !== ''` y distinto del texto del `ultimo` (o no hay `ultimo`) y distinto del último registrado en este panel (`useState` como `comentarioRegistrado` en `IniciativaEstadoPanel`), `await addComentario(Object.assign(new ComentarioResultadoClave(), { ResultadoClave: { Id: resultado.Id as number, Title: resultado.Nombre ?? '' }, Comentario: texto }))` y guardar `comentarioRegistrado`; (2) `await editResultado(Object.assign(new ResultadoClave(), { Id: resultado.Id, ValorActual: actual === '' ? null : Number(actual), ValorProyectado: Number(proyectado), Fuente: fuente.trim() === '' ? null : fuente.trim(), Evidencia: evidencia.trim() === '' ? null : { Url: evidencia.trim(), Description: '' } }))` — **solo estos campos** (objeto parcial, plan D2); (3) `onSaved(editado)`. Si falla: `saveFailed` verdadero, `isSaving` falso, `MessageBar` `type="error"` con `strings.ResultadoClaveSaveError`, el panel conserva lo ingresado.
  - Pie: Cancelar `secondary` (`strings.Cancel`) · Guardar `primary` (`strings.Save`), deshabilitado mientras guarda.
  - **Criterio de terminado**: abre con valores vigentes, mínimo/meta/máximo en solo lectura, comentario precargado con el último y su fecha y autor debajo; valida como se describe; al guardar edita solo los cuatro campos y agrega un comentario nuevo solo si cambió; `npm run build` sin errores.

- [X] T016 [US3] Conectar el seguimiento en `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` y `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx` (plan, D13, D14). Depende de T009 y T015.
  - `ObjetivosVp.tsx`: `const CAN_TRACK_RESULTADO_CLAVE = true;` y `canTrackResultadoClave={CAN_TRACK_RESULTADO_CLAVE}` en `IniciativaDetalle`; agregar `canTrackResultadoClave: boolean` a `IIniciativaDetalleProps`.
  - `IniciativaDetalle.tsx`: estado `const [trackingResultado, setTrackingResultado] = React.useState<ResultadoClave | undefined>(undefined);`; `<IniciativaResultadosClave resultados={resultados} onTrack={canTrackResultadoClave ? setTrackingResultado : undefined} />`; al final del JSX, `{trackingResultado && <ResultadoClaveSeguimientoPanel resultado={trackingResultado} onSaved={onTracked} onCancel={() => setTrackingResultado(undefined)} />}`; `onTracked = (saved) => { setTrackingResultado(undefined); getResultados(); setNoticeMessage(Utils.replaceAll(strings.ResultadoClaveUpdated, '{0}', saved.Nombre ?? '')); }`. El `Nombre` del resultado clave editado puede no venir en el objeto parcial: usar `trackingResultado.Nombre` en lugar de `saved.Nombre`.
  - **Criterio de terminado**: la acción de cada fila abre el panel; al guardar el panel se cierra, aparece «El resultado clave "[nombre]" se ha actualizado correctamente.», la fila muestra los valores nuevos, el cumplimiento, el estado y el avance del encabezado se recalculan; con la constante en `false` la acción muestra "—"; `npm run build` sin errores.

**Checkpoint**: seguimiento completo. Verificar escenarios 18 a 27.

---

## Phase 5: User Story 4 - Ver el avance en bandeja, detalle del objetivo y detalle de la palanca (Priority: P2)

**Goal**: el avance de iniciativas y de objetivos se ve en la bandeja, el detalle del objetivo, el detalle de la palanca y la grilla de objetivos.

**Independent Test**: escenarios 28 a 36 de `quickstart.md`.

- [X] T017 [US4] Agregar la columna Avance a `IniciativasTable` y actualizar en el mismo cambio a todos sus llamadores (plan, D5; contrato en §4). **Referencia**: `scr.iniciativas` (`c-ib`) y `sec.o_inis` (`c-oiP`, `c-oi`). **DS**: `AvanceText`, `Table`. Depende de T003, T006 y T007.
  - `src/webparts/objetivosVp/components/Iniciativa/IniciativasTable/IniciativasTable.tsx`: prop nueva `resultados: ResultadoClave[]` en `IIniciativasTableProps` (la columna renderiza desde `row.iniciativa`, sin agregar un campo a la fila). Para cada fila, determinar si es de la VP RRII: variante `bandeja`, con `objetivos.filter((item) => item.Id === iniciativa.Objetivo?.Id)[0]` y `isVpRrii(objetivo?.VP?.Title)`; variante `objetivo`, con `isVpRrii(objetivo?.VP?.Title)` del prop `objetivo`. Si lo es, la celda muestra `<AvanceText value={getAvanceIniciativa(resultados.filter((r) => r.Iniciativa?.Id === iniciativa.Id))} />`; si no, `strings.AvanceNotApplicable`. `const progressColumn: ITableColumn<IniciativaRow> = { key: 'avance', header: strings.ObjetivoColumnProgress, width: PROGRESS_WIDTH, render: (_value, row) => ... }` con `PROGRESS_WIDTH = 90`. Orden de columnas: `bandeja` -> `[idColumn, nameColumn, objectiveColumn, accountableColumn, progressColumn, statusColumn, actionsColumn]`; `objetivo` con peso -> `[idColumn, nameColumn, accountableColumn, progressColumn, weightColumn, statusColumn, actionsColumn]`; `objetivo` sin peso (otra VP) -> `[idColumn, nameColumn, accountableColumn, progressColumn, statusColumn, actionsColumn]`.
  - Llamador 1, `src/webparts/objetivosVp/components/Iniciativa/IniciativasBandeja/IniciativasBandeja.tsx` (plan, D11, D17): agregar `const [resultadoState, getResultados] = useResultadoClaveDataSource();`, sumar `getResultados()` al `Promise.all` del `useEffect`, sumar `resultadoState.error` a `loadError`, pasar `resultados={resultadoState.items}` a `IniciativasTable` y llamar también `getResultados()` en `onCreated`.
  - Llamador 2, `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx`: de forma transitoria (T019 lo reemplaza), agregar `useResultadoClaveDataSource`, cargar los resultados clave junto con las iniciativas en su `useEffect` (`Promise.all([getItems(), getResultados()])`), sumar su `error` al mensaje de error de carga, pasar `resultados={resultadoState.items}` a `IniciativasTable` y recargarlos en `onSaved`.
  - **Criterio de terminado**: `npm run build` sin errores; la bandeja muestra Avance antes de Estado: iniciativa 1 = 70 % amarillo, 7 = 0 % rojo, y "No aplica" en las de otra VP (11, 12); la sección Iniciativas del detalle del objetivo muestra Avance antes de Peso; mientras cargan los datos solo se ve el `Spinner`.

- [X] T018 [US4] Calcular el avance en `ObjetivosTable` y actualizar en el mismo cambio a todos sus llamadores (plan, D5, D6, D11). **Referencia**: `c-gno` y `c-vpo`. **DS**: `AvanceText`. Depende de T003, T006 y T007.
  - `src/webparts/objetivosVp/components/Objetivo/ObjetivosTable/ObjetivosTable.tsx`: props nuevas `iniciativas: Iniciativa[]` y `resultados: ResultadoClave[]`. Quitar `avance: `${DEFAULT_PROGRESS}%`` de la fila, `PROGRESS_STYLE` y el import de `DEFAULT_PROGRESS`; la `progressColumn` renderiza `isVpRrii(row.objetivo.VP?.Title) ? <AvanceText value={getAvanceObjetivo(row.objetivo.Id, iniciativas, resultados)} /> : strings.AvanceNotApplicable` (sacar `avance` de `ObjetivoRow`; limpiar los imports que dejen de usarse: `CSSProperties`, `typography`, `getColorStep`, solo si ya no se usan).
  - Llamador 1, `src/webparts/objetivosVp/components/Palanca/Palancas/Palancas.tsx`: agregar `useIniciativaDataSource` y `useResultadoClaveDataSource`; en el `useEffect`, en `refresh` y en `onObjetivoCreated` llamar también `getIniciativas()` y `getResultados()`; `objetivosError` suma `iniciativaState.error` y `resultadoState.error`; `objetivosReady` suma `!iniciativaState.isLoading && !resultadoState.isLoading`; pasar `iniciativas={iniciativaState.items}` y `resultados={resultadoState.items}` a los dos `ObjetivosTable` y a `PalancasTable`. **No tocar** el resumen "Avance de la VP" (`DEFAULT_PROGRESS`, C-05 fuera de alcance).
  - Llamador 2, `src/webparts/objetivosVp/components/Palanca/Palancas/PalancasTable/PalancasTable.tsx`: props nuevas `iniciativas` y `resultados`, reenviadas al `ObjetivosTable` de la variante `palanca`.
  - Llamador 3, `src/webparts/objetivosVp/components/Palanca/PalancaDetalle/PalancaDetalle.tsx`: agregar `useIniciativaDataSource` y `useResultadoClaveDataSource`; llamar `getIniciativas()` y `getResultados()` junto a `getObjetivos()` en el `useEffect` y en `onObjetivoCreated`; mostrar `ObjetivosLoadError` también si fallan; pasar `iniciativas` y `resultados` a `ObjetivosTable`; no mostrar la grilla (spinner) mientras `isLoading` de alguno de los dos.
  - **Criterio de terminado**: `npm run build` sin errores; en la solapa "Objetivos de la VP RRII", en las palancas expandidas y en el detalle de la palanca cada objetivo muestra su avance con color (objetivo 1 = 73 % amarillo, objetivo 2 = 39 % rojo, objetivo 3 = 100 % verde, objetivo 4 sin iniciativas = 0 % rojo); la solapa de otras VP no cambia.

- [X] T019 [US4] Subir la carga al detalle del objetivo y mostrar su avance, actualizando `ObjetivoIniciativas` y su llamador en el mismo cambio (plan, D11; contrato en §4). **Referencia**: `hAv` de `scr.objetivo`. **DS**: `AvanceText`. Depende de T003, T006, T007 y T017.
  - `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx`: agregar `useIniciativaDataSource` y `useResultadoClaveDataSource`; en el `useEffect` que carga el objetivo, llamar también `getIniciativas()` y `getResultados()` (con un `ready` de `Promise.all(...).then(() => setReady(true))`); `const dataError = iniciativaState.error || resultadoState.error;`, que se suma a la condición del `MessageBar` de error de carga de `renderBody`. En el encabezado, reemplazar `PROGRESS_VALUE_STYLE` y `` `${DEFAULT_PROGRESS} %` `` por `<AvanceText value={getAvanceObjetivo(objetivo.Id, iniciativaState.items, resultadoState.items)} spaced />` (solo si `isVpRrii` y `ready`); quitar `PROGRESS_VALUE_STYLE` y el import de `DEFAULT_PROGRESS` (queda `getColorStep` solo si se usa en otra parte del archivo). Pasar a `ObjetivoIniciativas`: `iniciativas={iniciativaState.items}`, `resultados={resultadoState.items}`, `ready={ready}`, `error={dataError}` y `onReload={() => { getIniciativas(); getResultados(); }}`, además de lo que ya recibe.
  - `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx`: agregar las props `iniciativas`, `resultados`, `ready`, `error` y `onReload`; **eliminar** su carga transitoria de T017 (`useIniciativaDataSource`, `useResultadoClaveDataSource`, el `useEffect` y el estado `ready`); filtrar `iniciativas.filter((item) => item.Objetivo?.Id === objetivo.Id)`; usar `error` y `ready` en lugar de los estados propios; pasar `resultados` a `IniciativasTable`; en `onSaved`, llamar `onReload()`.
  - **Criterio de terminado**: `npm run build` sin errores; el detalle del objetivo 1 muestra "Avance: 73 %" en amarillo y la sección "Iniciativas (3)" con la columna Avance (70 %, 90 %, 60 %, cada una con su color) antes de Peso; el objetivo 2 no cuenta la iniciativa cancelada en su avance (39 %); el objetivo 5 (otra VP) no muestra avance y su grilla muestra "No aplica" y no tiene Peso; crear una iniciativa con "+" recarga las dos listas.

**Checkpoint**: el avance se ve en las cuatro pantallas. Verificar escenarios 28 a 36.

---

## Phase 6: User Story 5 - Agregar o editar resultados clave al editar la iniciativa (Priority: P2)

**Goal**: el panel de edición permite agregar y modificar resultados clave; los ya guardados no se pueden quitar (FR-010, FR-016).

**Independent Test**: escenarios 37 a 44 de `quickstart.md` (el 43 es de pesos).

- [X] T020 [US5] Guardado conjunto de la edición, retomable, en `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/IniciativaFormPanel.tsx` (plan, D9, FR-015). Depende de T013. No cambia ningún contrato: es lógica interna del panel.
  - `save(toSave, drafts)` para la **edición** (`iniciativa` definida). Referencias (`useRef`): `vigentes: ResultadoClave[]`, inicializada con `masters.resultadosClave` cuando los maestros están listos, y `resultadosCreados: Record<number, ResultadoClave>` (por `key` de borrador, la misma de T013). Ambas se actualizan después de cada paso, así que un reintento retoma lo pendiente sin duplicar.
  - Pasos: (1) `await editItem(toSave)`; (2) `addResultado` de los borradores sin `id` cuyo `key` no esté en `resultadosCreados` (mismos campos parciales y `ValorProyectado` = `Meta` que en T013, `Iniciativa` = la de la edición), guardando cada uno en `resultadosCreados` y en `vigentes`; (3) `editResultado` de los borradores con `id` y `isDraftChanged(draft, original)`, con `original` tomado de `vigentes`, enviando solo `Id`, `Nombre`, `Title`, `TipoMedicion`, `UnidadMedida`, `Minimo`, `Meta`, `Maximo` e `Iniciativa` (objeto parcial; nunca `ValorActual`, `ValorProyectado`, `Fuente`, `Evidencia`, `Descripcion`, `Responsable` ni `Peso`), y actualizar `vigentes`. No hay paso de borrado: un resultado clave guardado no se quita (FR-010).
  - Si un paso falla, relanzar el error: `IniciativaFormBody` muestra `IniciativaSaveError` y conserva lo ingresado. La edición no borra la iniciativa (ya existía), así que no hay deshacer: lo hecho queda hecho y el reintento hace solo lo que falta.
  - Al terminar, `onSaved(toSave)` y devolver los borradores con `id` = Id del resultado clave (existente o creado).
  - **Criterio de terminado**: con mocks, agregar un resultado clave y cambiar la meta de uno existente edita lo correcto y deja los demás campos intactos (el valor proyectado no cambia al cambiar la meta); si un paso falla (cambio temporal local, no versionar), el reintento no duplica lo ya creado; `npm run build` sin errores.

- [X] T021 [US5] Recargar los resultados clave después de editar, en las pantallas que abren el panel de edición: `IniciativaDetalle.tsx` ya lo hace (T009). Verificar con `Grep` que `onEdited` llama `getResultados()` y que el panel de edición del detalle recibe `canLoadResultadosClave` (T014). **Criterio de terminado**: tras editar, el detalle refleja los resultados clave, los pesos (100 ÷ cantidad) y el avance sin recargar la página; `npm run build` sin errores.

**Checkpoint**: edición completa. Verificar escenarios 37 a 44.

---

## Phase 7: Polish & validación

- [X] T022 Revisión de reglas transversales con `Grep` en los archivos tocados: sin hexadecimales de color, sin `any` nuevos, sin comentarios de código, sin textos escritos en el código (todo desde `strings`), sin `Descripcion`, `Responsable` ni `Peso` en el código nuevo de resultados clave, sin `window.open` ni navegación nueva, `deleteItem` y `deleteResultado` usados solo en `IniciativaFormPanel.tsx` y solo para deshacer un alta fallida (T013), y ninguna pantalla con una acción de eliminar o quitar un resultado clave ya guardado (FR-010), sin `DEFAULT_PROGRESS` fuera de `Palancas.tsx` y `objetivoUtils.ts`, y sin `PROGRESS_STYLE` ni `PROGRESS_VALUE_STYLE`. Corregir lo que aparezca. **Criterio de terminado**: sin hallazgos.

- [X] T023 Ejecutar `npm run build` completo y registrar el resultado (lint + `heft build`). **Criterio de terminado**: sin errores; si hay advertencias preexistentes, listarlas.

- [ ] T024 Recorrer con mocks (`npm start`, workbench local) los escenarios 1 a 51 de [quickstart.md](./quickstart.md) y anotar cuáles pasan y cuáles no, con el motivo. Los escenarios que dependen de SharePoint (11, 22 y 25 en la lista, 48) quedan para T028. **Criterio de terminado**: informe con el resultado de cada escenario.

- [ ] T025 Revisión visual contra el prototipo: comparar `sideIni`, `i_kr`, `m.is.krUpd`, `hAv`, `c-ib`, `c-oiP` y `c-gno` y anotar las diferencias de las aproximaciones A1 a A4 del plan para decidir en la revisión. No corregir por iniciativa propia: informar. **Criterio de terminado**: lista de diferencias entregada a la usuaria.

- [X] T026 [P] Confirmar que no se modificó `src/core/ui` (`git diff --stat src/core/ui` vacío) y que no hace falta anotar nada en `docs/design-system-cambios.md`. **Criterio de terminado**: sin cambios en `src/core/ui`.

- [ ] T027 Prerrequisitos de SharePoint **a cargo de la usuaria** (no los ejecuta el agente): verificar las columnas de `Resultado clave` (plan, P2), indexar la columna `ResultadoClave` de `Comentario resultado clave` (plan, P1) y confirmar los dominios de los links de evidencia (plan, P3), con los pasos de [quickstart.md](./quickstart.md). **Criterio de terminado**: la usuaria confirma P1, P2 y P3 en el sitio de desarrollo.

- [ ] T028 Validar en el workbench hospedado del sitio de desarrollo los escenarios que dependen de SharePoint, escribiendo solo en las listas de desarrollo y con autorización explícita de la usuaria antes de crear, editar o borrar cualquier elemento. Depende de T027. Los datos de prueba que se creen se borran al final solo con autorización. **Criterio de terminado**: escenarios 11, 22, 25 y 48 registrados con su resultado; ningún elemento ajeno a la prueba modificado.

---

## Dependencies & Execution Order

- **Phase 1** (T001 a T007) bloquea todo. Dentro de ella: T001 y T002 primero; T003, T004 y T005 en paralelo; T006 después de T001 y T005; T007 después de T006.
- **US2** (T008, T009) depende de la Phase 1. **US1** (T010 a T014) depende de la Phase 1; se verifica con US2. **US3** (T015, T016) depende de US2 y de la Phase 1. **US4** (T017 a T019) depende de la Phase 1; es independiente de US1, US3 y US5. **US5** (T020, T021) depende de US1.
- Orden recomendado: Phase 1 -> US2 -> US1 -> US3 -> US4 -> US5 -> Polish.
- Todas las tareas que cambian un contrato (props obligatorias o firmas) actualizan en el mismo cambio a todos sus llamadores (T012, T016, T017, T018, T019), para que cada tarea termine con `npm run build` sin errores.
- Archivos que tocan varias tareas, que deben hacerse en orden y no en paralelo: `IniciativaFormPanel.tsx` (T012, T013, T020); `IniciativaForm.tsx` (T012); `IniciativaDetalle.tsx` (T009, T012, T016); `IniciativasBandeja.tsx` (T012, T017); `ObjetivoDetalle.tsx` (T012, T019); `ObjetivoIniciativas.tsx` (T012, T017, T019); `ObjetivosVp.tsx` (T012, T016).

### Parallel Opportunities

- Phase 1: T003, T004 y T005 en paralelo.
- US1: T010 y T011 en paralelo (archivos distintos).
- US4: T017 y T018 en paralelo (tablas y pantallas distintas, sin archivos compartidos); T019 después de T017, porque reemplaza la carga transitoria que T017 deja en `ObjetivoIniciativas.tsx`.

## Implementation Strategy

- **MVP**: Phase 1 + US2 + US1 + US3 (resultados clave cargados, vistos y con seguimiento, con el avance de la iniciativa en su detalle). Es el camino de las tres historias P1.
- **Entrega incremental**: después, US4 (avance agregado en las otras pantallas) y US5 (edición). Cada historia se puede demostrar sola con los mocks.
- Antes de cualquier prueba contra SharePoint, la usuaria debe resolver P1, P2 y P3 (T027).
