# Implementation Plan: Resultados clave y cálculo de avance

**Branch**: `006-resultados-clave` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-resultados-clave/spec.md`. Continúa la [004-iniciativas](../004-iniciativas/plan.md) (que dejó fuera los resultados clave y el avance) y se apoya en la [003-objetivos](../003-objetivos/plan.md) y la [005-objetivos-pesos](../005-objetivos-pesos/plan.md), ya implementadas.

## Summary

Sumar al webpart `objetivosVp` los resultados clave de las iniciativas de objetivos de la VP RRII y el avance que se calcula desde ellos: el bloque "Resultados clave" del panel de cargar y editar iniciativa, la sección "Resultados clave (N)" del detalle de la iniciativa, el panel lateral "Seguimiento del resultado clave", y el avance (iniciativa y objetivo) en la bandeja, el detalle de la iniciativa, el detalle del objetivo, el detalle de la palanca y la grilla de objetivos.

Enfoque técnico:

- **Datos**: ya existen la entidad `ResultadoClave`, su datasource y la entidad y el datasource de `ComentarioResultadoClave`. Faltan sus mocks (principio III) y el hook de comentarios filtrados. `ResultadoClave` pasa a escribir `Title` y admite `null` para vaciar valor actual, fuente y evidencia. No se crean listas ni columnas.
- **Cálculos**: funciones puras en un archivo nuevo, `Iniciativa/resultadoClaveUtils.ts` (cumplimiento, estado, peso, avance de iniciativa y de objetivo, color y formato). Las pantallas cargan iniciativas y resultados clave con `getItems` y calculan durante el render, como los pesos de la 004 (D12). Nada del avance se guarda.
- **Pantallas**: sin rutas nuevas. El bloque del panel, la sección del detalle y el panel de seguimiento son piezas nuevas. El avance reemplaza el 0 % fijo (`DEFAULT_PROGRESS`) que hoy muestran las grillas y el encabezado del objetivo.
- **Guardado conjunto**: la iniciativa y sus resultados clave se guardan en una secuencia de escrituras con deshacer compensatorio (D9); SharePoint no ofrece una transacción entre listas. Ver el riesgo R1.
- **Componentes**: todo con piezas del DS. Estados del resultado clave con `Chip`; el avance, con un componente chico compartido que solo aplica color por tokens.
- **Permisos**: dos constantes separadas (`CAN_LOAD_RESULTADOS_CLAVE`, `CAN_TRACK_RESULTADO_CLAVE`), en `true` hasta RF-19.

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, con la configuración heredada de `@microsoft/spfx-web-build-rig`, igual que las features anteriores.

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`, Fluent UI v8 (`@fluentui/react ^8.106.4`), PnPjs `@pnp/sp 4.18.0`, `react-router-dom 6.30.6`. Esta feature no agrega dependencias.

**Storage**: listas de SharePoint `Resultado clave` y `Comentario resultado clave` (`Lista.ResultadoClave` y `Lista.ComentarioResultadoClave` en `src/core/utils/Constants.ts`), que ya existen, más `Iniciativa` y `Objetivo`. No se crean ni modifican listas ni columnas. Dos verificaciones a cargo de la usuaria antes de probar con SharePoint (P1 y P2, más abajo).

**Testing**: no hay runner de pruebas. Validación: `npm run build` (principio V), escenarios de [quickstart.md](./quickstart.md) con mocks y en el workbench hospedado del sitio de desarrollo, y comparación visual con el prototipo. Se escribe solo en las listas de desarrollo y con autorización explícita.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft, según los scripts de `package.json`).

**Performance Goals**: bandeja, detalles y paneles en menos de 3 s con cientos de iniciativas y unos pocos miles de resultados clave (SC-001, SC-002, SC-005). Cada pantalla con avance hace una consulta más (todos los resultados clave): la bandeja pasa a 5, el detalle de la iniciativa a 5 (iniciativas, objetivos, áreas, comentarios de la iniciativa y resultados clave; los comentarios del seguimiento se traen solo al abrir el panel), el detalle del objetivo a 4 (objetivo, nombres, iniciativas y resultados clave) y las palancas a 5. Búsqueda, filtros, pesos y cálculos son en memoria.

**Constraints**: `src/core/ui` de solo lectura; sin colores, tipografías ni espaciados fuera del DS; textos en español (AR) con `loc/`; sin acción de eliminar fuera del panel de edición (FR-010); no se crean ni modifican listas ni columnas.

**Scale/Scope**: sin rutas ni pantallas nuevas. 3 piezas nuevas de pantalla (bloque del panel, sección del detalle, panel de seguimiento), 1 componente compartido de avance, 1 archivo de cálculos, 2 mocks y 1 hook nuevos en `core`, 4 archivos de `core` modificados (`ResultadoClave.ts`, `useDatasource.ts`, hook de `ResultadoClave`, hook de `ComentarioResultadoClave`) más `IniciativaMock.ts` y `ObjetivoMock.ts` si hace falta cubrir casos, y 12 piezas existentes del webparts ampliadas (ver "Estructura de carpetas").

## Hallazgos del repo

Detalle en [research.md](./research.md).

| # | Hallazgo | Consecuencia |
|---|---|---|
| H1 | `ResultadoClave` y `ComentarioResultadoClave` tienen entidad, datasource, interfaz y hooks, pero no mock (R1). | Dos mocks nuevos (D1). No se crean servicios. |
| H2 | `ResultadoClave.toListItem` no envía `Title` y no puede vaciar un valor ya cargado: un campo `undefined` se omite (R2). | `Title = Nombre` (FR-008) y `null` explícito para vaciar valor actual, fuente y evidencia (D2). |
| H3 | La entidad ya lee y escribe `Descripcion`, `Responsable` y `Peso` (R2). | No se tocan: los objetos que se guardan son parciales, así que esos campos no se envían (FR-006, D2). |
| H4 | `useDatasource.deleteItem` traga el error, y nadie lo usa (R4). | Pasa a relanzarlo, para detectar el fallo al quitar un resultado clave o al deshacer un alta (D9). |
| H5 | `ComentarioResultadoClaveDataSource` ya implementa `getFilteredItems`, pero no hay mock ni hook que lo exponga (R5). | `ComentarioResultadoClaveMock` y `useComentariosResultadoClave`, como `useComentariosIniciativa` (D10). |
| H6 | Las grillas de objetivos y el encabezado del objetivo muestran `DEFAULT_PROGRESS` (0 %) en rojo fijo (R7). | Se reemplaza por el avance calculado, con el color de C-07 (D5, D6). |
| H7 | `IniciativaFormBody` no conoce los resultados clave y sus maestros no los cargan (R8). | `useIniciativaFormMasters` suma los resultados clave de la iniciativa al editar (D7). |
| H8 | `ObjetivoDetalle` no carga iniciativas: lo hace `ObjetivoIniciativas` (R9). | Pasa a cargarlas `ObjetivoDetalle`, que necesita el avance en el encabezado, y se las da a `ObjetivoIniciativas` por props (D11). |
| H9 | El DS no tiene chip amarillo ni ícono de seguimiento (R10, R11). | Chip `warning` con colores de la escala Yellow para "Meta" y `editPrimary` para la acción (A1, A2). |
| H10 | El registro de íconos del DS incluye `delete` y `deletePrimary` (R11). | Botón de quitar con `deletePrimary`. |
| H11 | `Utils.validateAndSanitizeUrl` solo acepta dominios de confianza (R12). | La evidencia se valida con esa utilidad; un dominio rechazado muestra el error del campo y no se amplía la lista (P3). |

## Constitution Check

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | Mismo stack y versiones; sin dependencias nuevas. |
| II. La interfaz no se inventa | ✅ Cumple, con los desvíos que aprobó la spec | Pantallas tomadas del prototipo v10: bloque `fm.objRrii` / `krs` de `sideIni`, sección `i_kr` de `scr.iniciativa`, `m.is.krUpd`, `hAv` de los encabezados y columna Avance de `scr.iniciativas`, `scr.objetivo` y las grillas de objetivos. Desvíos aprobados: sin campo de peso (calculado), sin responsable ni descripción, sin textos de ayuda (FR-006, FR-011, FR-017, FR-037), Cumplim. y Estado con el valor actual y "—" / "Sin dato" sin valor (spec, Clarifications), comentario del seguimiento precargado con fecha y autor (U1 de [research.md](./research.md)). |
| II. `core/ui` de solo lectura | ✅ Cumple | No se modifica el DS. |
| II. Estructura de pantalla | ✅ Cumple | Las piezas nuevas van en subcarpetas de `IniciativaForm/`, `IniciativaDetalle/` e `Iniciativa/`, cada una con su `.tsx` y su `.module.scss` cuando necesita estilos. |
| II. Textos en español (AR) | ✅ Cumple | Claves nuevas en `loc/mystrings.d.ts` y `loc/en-us.js`, reutilizando las que ya existen para el mismo concepto (Cancelar, Guardar cambios, Campo obligatorio, "—"). |
| III. Datos desacoplados | ✅ Cumple | Las pantallas usan solo hooks de `core/api`. Dos mocks nuevos. Tipos en `core/entities`. |
| IV. Simplicidad y cambios acotados | ✅ Cumple, con cambios justificados | En `core`: `ResultadoClave.ts`, `useDatasource.ts` (`deleteItem`), los hooks de `ResultadoClave` y `ComentarioResultadoClave` y un hook nuevo. En el webparts: ver Complexity Tracking. |
| V. Validación | ✅ Cumple | Cada tarea cierra con `npm run build`. |

**Re-check post-diseño**: sin cambios. Los pendientes de diseño se resolvieron con la usuaria el 2026-11-18 (research, U1). Quedan tres prerrequisitos de SharePoint a cargo de la usuaria (P1, P2 y P3).

## Interfaz y Design System

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (prototipo v10):

- bloque de resultados clave del panel: `sideIni`, rama `fm.objRrii`, con `rowKr2` (en la maqueta incluye un campo de peso que no se implementa);
- sección del detalle: `scr.iniciativa`, `i_kr`, filas `c-kr2`;
- seguimiento: modal `m.is.krUpd` (en esta feature, panel lateral, como "Cambiar estado" de la 004);
- avance en encabezados: `hAv` de `scr.objetivo` y `scr.iniciativa`;
- columna Avance: `scr.iniciativas` (`c-ib`), sección `o_inis` de `scr.objetivo` (`c-oi` y `c-oiP`), detalle de la palanca y grilla de objetivos (`c-gno`, `c-vpo`).

**Design System**: `src/core/ui`, según `docs/design-system-catalog.md`.

**Estructura de la pantalla**: ver "Estructura de carpetas".

### Mapeo elemento → componente

**Bloque "Resultados clave" del panel (`ResultadosClaveBloque`, `fm.objRrii`)**, dentro del panel de 480 px de la 004:

| Elemento | Componente | Observaciones |
|---|---|---|
| Banda "Resultados clave" con "+" | `SectionBand` (`shared/`) con `action` | Sin `collapsible`. "+" = `Button` `iconOnly` + `FigmaIcon` `addPrimary` + `Tooltip` "Agregar resultado clave", como el de `ObjetivoIniciativas`. |
| Nombre ("Resultado clave N") | `Input` | `required`, `maxLength={255}`, placeholder "Ej. Implementar YPF Store en 40 EESS". A todo el ancho. |
| Tipo de medición | `Dropdown` (`core/ui/components`) | `required`, opciones del enum `TipoMedicion`, placeholder "Seleccionar". |
| Unidad | `Input` | `required`, placeholder "Ej. estaciones". Lado a lado con Tipo. |
| Mínimo, Meta, Máximo | `Input` `type="number"` | `required`, los tres lado a lado. Error en el propio campo (`errorMessage`). |
| Quitar | `Button` `iconOnly` + `FigmaIcon` `deletePrimary` + `Tooltip` | Solo en los resultados clave que no son el primero. |
| Error "al menos uno" | no hace falta | El primero no se puede quitar, así que el bloque siempre tiene uno. |

**Sección del detalle (`IniciativaResultadosClave`, `i_kr`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Sección | `SectionBand` `collapsible` | Título "Resultados clave (N)". Sin lápiz de edición de sección: no existe en el detalle implementado (la edición es Editar del pie). |
| Grilla | `Table` del DS | Columnas Resultado clave, Tipo, Mín., Meta, Máx., Peso, Actual, Proyect., Cumplim., Estado, Acción. El nombre lleva debajo la unidad y la fuente, como `<small class="sub">`, con tokens de tipografía. |
| Estado | `Chip` `size="small"` | Ver A1. |
| Acción | `Button` `iconOnly` + `FigmaIcon` `editPrimary` + `Tooltip` "Registrar seguimiento" | Solo si `canTrack`. Sin permiso, "—" como la maqueta (`k.cant`). Ver A2. |
| Vacío | `emptyText` de `Table` | Una línea: "Esta iniciativa no tiene resultados clave." |

**Panel "Seguimiento del resultado clave" (`ResultadoClaveSeguimientoPanel`, `m.is.krUpd`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Panel | `Panel` | Ancho 480 px (estilos de `IniciativaForm.module.scss`, como `IniciativaEstadoPanel`). Título "Seguimiento del resultado clave", subtítulo "KR-nn · nombre" con `buildPanelTitle`. |
| "Unidad · tipo" y "Mínimo · Meta · Máximo" | `Field` (`shared/`) | Modo lectura, uno al lado del otro, como `IniciativaInfo`. |
| Valor actual, Valor proyectado al 31/12 | `Input` `type="number"` | El proyectado es `required`. |
| Fuente | `Input` | Placeholder "De dónde sale el dato". |
| Evidencia (link) | `Input` `type="url"` | Placeholder "https://ypf.sharepoint.com/…". Error de link en el campo. |
| Comentario | `Multiline` | Precargado con el último, placeholder "Novedad de este seguimiento"; debajo, una línea de solo lectura con fecha y autor del último (U1). |
| Pie | `Button` x2 | Cancelar `secondary` · Guardar `primary`. Sin modal de confirmación: la maqueta no lo tiene. |
| Error al guardar | `MessageBar` `type="error"` | Una línea. |

**Avance**

| Elemento | Componente | Observaciones |
|---|---|---|
| Porcentaje con color | `AvanceText` (`shared/`, nuevo) | `<b>` con color por tokens: rojo Red 600, amarillo Yellow 700, verde Green 700 (los mismos colores de la maqueta). Ver D6. |
| "No aplica" | texto de la celda | Texto simple de `loc/`, sin color, como el resto de las celdas de la grilla. |
| Encabezados | `AvanceText` con "Avance:" (`ObjetivoDetailProgress`) | Ya existe el rótulo; solo cambia el valor. En el detalle de la iniciativa se agrega, igual que en el del objetivo. |
| Columna Avance | `Table` del DS | Se agrega a `IniciativasTable` (bandeja y objetivo) y se reemplaza el valor fijo en `ObjetivosTable`. |

### Elementos sin componente en el Design System

- **Chip amarillo ("Meta")**: el DS tiene `warning` (naranja), pero no un amarillo. Se usa `warning` con los colores de la escala Yellow del DS (A1). No se crea un componente.
- **Ícono de seguimiento**: la maqueta usa una flecha de tendencia que el DS no tiene. Se usa `editPrimary` (A2).

**Imágenes e íconos**: `FigmaIcon` `addPrimary`, `deletePrimary`, `editPrimary` (todos en el registro del DS). No hay imágenes nuevas.

### Aproximaciones (a confirmar en la revisión visual)

| # | Elemento | Resolución | Motivo |
|---|---|---|---|
| A1 | Chip de estado del resultado clave | No cumple `danger`, Mínimo `warning`, Meta `warning` con fondo Yellow 100 y texto Yellow 800, Máximo `success`, Sin dato `neutral` | El DS no tiene chip amarillo. Los colores salen de `colorScales`, no son valores propios, y coinciden con los de la maqueta (`c-yel`). |
| A2 | Ícono de la acción "Registrar seguimiento" | `editPrimary` | No hay ícono de tendencia en el registro del DS. |
| A3 | Porcentajes de la tabla de resultados clave | Peso y Cumplim. como `40%` (sin espacio), como las tablas ya implementadas (`ObjetivosTable`, `IniciativasTable`) | Manda lo implementado (H6 de la 005); la maqueta usa `40 %`. En encabezados y campos del detalle, con espacio. |
| A4 | Columna Avance de las grillas del detalle del objetivo y de la bandeja para otra VP | "No aplica" | La maqueta lo muestra así en la bandeja y en el detalle del objetivo (`it.noAv`). |

## Decisiones

**D1. Capa de datos y mocks.** Se usan `useResultadoClaveDataSource`, `useComentarioResultadoClaveDataSource`, `useIniciativaDataSource` y `useObjetivoDataSource`. Los dos primeros pasan su mock como segundo argumento de `useDatasource`. Los mocks guardan el estado a nivel de módulo, como `IniciativaMock`, y usan los Id de `IniciativaMock` y `ObjetivoMock`.

- `ResultadoClaveMock`: cubre los casos de la spec con las iniciativas ya existentes:
  - iniciativa 1 con el ejemplo de validación (máximo 100 y actual 40; máximo 210 y actual 230): avance 70 %, amarillo;
  - iniciativas 2 y 3 con un resultado clave cada una, para avances 90 % y 60 % (el objetivo 1 da 73 %, amarillo);
  - un objetivo de la VP RRII con una iniciativa cancelada que tiene resultados clave con avance alto (no cuenta), una iniciativa sin resultados clave (cuenta como 0 %) y una iniciativa finalizada;
  - resultados clave en cada estado: sin valor actual ("Sin dato"), No cumple, Mínimo, Meta y Máximo; uno con sobrecumplimiento (110 %), uno con mínimo = meta = máximo, uno con valor actual igual a la meta y uno con valor proyectado distinto del actual;
  - uno con fuente, evidencia y comentario, y otro sin ellos;
  - ninguna iniciativa de otra VP tiene resultados clave.
  `getItems` devuelve todos. `add` asigna el próximo Id. `edit` combina solo los campos definidos con el elemento existente, igual que SharePoint al ignorar los campos omitidos, y un `null` explícito vacía el campo. `delete` quita el elemento. `getById` rechaza con estado 404 si no existe.
- `ComentarioResultadoClaveMock`: un resultado clave con dos comentarios (el último se precarga) y otro sin comentarios. `getFilteredItems(resultadoClaveId)` devuelve los de ese resultado clave, del más nuevo al más viejo. `add` asigna `Created` = ahora y `Author` = usuario de prueba.
- `IniciativaMock` y `ObjetivoMock` solo se tocan si falta algún caso de los anteriores (por ejemplo, una iniciativa de la VP RRII sin resultados clave).

**D2. Entidad `ResultadoClave`.**

- `toListItem` envía `Title: this.Nombre` (FR-008), como `Iniciativa`, `Objetivo` y `Palanca`.
- `ValorActual`, `Fuente` y `Evidencia` pasan a admitir `null` (`number | null | undefined`, `string | null | undefined`, `IUrlValue | null | undefined`). `null` vacía el campo en SharePoint; `undefined` lo omite. La lectura sigue convirtiendo `null` en `undefined` (`?? undefined`).
- Los objetos que se guardan son parciales: el alta y la edición desde el panel de iniciativa envían solo `Nombre`, `Title`, `TipoMedicion`, `UnidadMedida`, `Minimo`, `Meta`, `Maximo` e `IniciativaId`, más `ValorProyectado` (= Meta) en el alta; el seguimiento envía solo `ValorActual`, `ValorProyectado`, `Fuente` y `Evidencia`. Así `Descripcion`, `Responsable` y `Peso` no se escriben nunca (FR-006), y editar desde el panel no pisa lo cargado en el seguimiento ni al revés, aunque otra persona lo haya cambiado mientras tanto.
- El `select` y la lectura del datasource no cambian.

**D3. Constantes.** `TipoMedicion` ya existe en `Constants.ts`. El estado del resultado clave y los umbrales de color (60 y 80) son constantes de dominio y viven en `resultadoClaveUtils.ts` (módulo de dominio). `src/core/utils/Constants.ts` no cambia. Los umbrales pasan a ser parámetros en RF-22.

**D4. Cálculos (`Iniciativa/resultadoClaveUtils.ts`).** Funciones puras, sin acceso a datos:

- `getCumplimiento(resultado)`: `ValorActual × 100 ÷ Maximo`. Sin valor actual o con máximo menor o igual que 0, devuelve 0 (C-01, para el avance). Puede superar 100.
- `hasValorActual(resultado)`: `ValorActual` distinto de `undefined` y `null`. La tabla muestra "—" en Cumplim. cuando es falso.
- `getEstadoResultadoClave(resultado)`: "Sin dato" sin valor actual; si no, No cumple, Mínimo, Meta o Máximo según C-02, comparando el valor con `Minimo`, `Meta` y `Maximo` tal como se ingresaron.
- `getPesoResultadoClave(cantidad)`: `100 ÷ cantidad` (FR-011). Se muestra con `formatPeso` de `iniciativaUtils`.
- `getAvanceIniciativa(resultados)`: promedio simple de `mín(cumplimiento, 100)`. Sin resultados clave, 0 (FR-024).
- `getAvanceObjetivo(objetivoId, iniciativas, resultados)`: promedio simple del avance de las iniciativas del objetivo que no están canceladas. Sin ninguna, 0 (FR-025).
- `getAvanceColor(avance)`: rojo si es menor que 60, amarillo si es menor que 80, verde si no (FR-030).
- `formatAvance(valor)`: entero redondeado (FR-031), sin `-0`.
- Precisión: el cumplimiento es una división y el avance, un promedio, así que pueden arrastrar error de punto flotante (por ejemplo `0,07 × 100`). Antes de comparar con los umbrales de color, y antes de limitar a 100, el valor se redondea a 6 decimales (`normalizeAvance`). No se compara ningún resultado de punto flotante con `===`. El redondeo a entero es solo de presentación: el color y los promedios usan el valor sin redondear a entero, así que 79,6 % se muestra "80 %" y sigue en amarillo (FR-031). Los estados comparan los números ingresados entre sí, sin cuentas intermedias. No se agrega ninguna dependencia.
- La iniciativa y el objetivo de otra VP no llaman a estas funciones: la pantalla decide con `isVpRrii(objetivo.VP?.Title)`, el mismo criterio que usan los pesos de la 004 (R13).

**D5. Dónde se calcula cada avance.** Las pantallas cargan iniciativas y resultados clave con `getItems` y pasan los arreglos a las tablas, que calculan al renderizar:

- `IniciativasTable`: nuevos props `resultados` y, en la variante `objetivo`, el `objetivo` que ya recibe; en la variante `bandeja`, `objetivos` que ya recibe. Muestra "No aplica" para una iniciativa de otra VP.
- `ObjetivosTable`: nuevos props `iniciativas` y `resultados`. Calcula `getAvanceObjetivo` por fila.
- `IniciativaDetalle`: carga los resultados clave de la iniciativa y calcula su avance para el encabezado.
- `ObjetivoDetalle`: calcula el avance del objetivo para el encabezado (D11).
- Mientras las iniciativas o los resultados clave no terminaron de cargar, las grillas no se muestran (spinner), para no mostrar 0 % por falta de datos. Si alguna de las dos cargas falla, la pantalla muestra su mensaje de error de carga de una línea, sin grilla.

**D6. Componente de avance.** `shared/AvanceText/AvanceText.tsx`: recibe `value: number` y `spaced?: boolean` y devuelve un `<b>` con el texto (`70%` o `70 %`) y el color de `getAvanceColor`, usando `getColorStep` (Red 600, Yellow 700, Green 700). Se usa en las dos grillas, los dos encabezados y no en la columna Cumplim. (sin color). Reemplaza el color fijo `PROGRESS_STYLE` de `ObjetivosTable` y `PROGRESS_VALUE_STYLE` de `ObjetivoDetalle`. `DEFAULT_PROGRESS` de `objetivoUtils.ts` se mantiene solo para el resumen "Avance de la VP" de `Palancas`, que es el avance de la VP (C-05) y queda fuera de alcance. "No aplica" no pasa por este componente: las tablas lo muestran como texto simple con el texto de `loc/` (`AvanceNotApplicable`).

**D7. Bloque del panel (FR-012 a FR-017).**

- `IniciativaFormBody` suma el prop `resultadosClave: ResultadoClave[]` (los de la iniciativa que se edita; vacío en el alta) y `canLoadResultadosClave: boolean`. El bloque se muestra si el objetivo elegido es de la VP RRII (`isVpRrii(objetivo?.VP?.Title)`) y `canLoadResultadosClave` es verdadero.
- Estado: lista de borradores `{ key, id?, nombre, tipo, unidad, minimo, meta, maximo }` con los números como texto. Alta y edición de una iniciativa sin resultados clave arrancan con un borrador vacío. `key` es un contador local, estable al quitar. "+" agrega un borrador vacío al final; quitar elimina el borrador (no el primero).
- Si se cambia el objetivo elegido (solo en el alta) a uno de otra VP, el bloque se oculta y los borradores no se envían ni validan; al volver a uno de la VP RRII reaparecen con lo cargado.
- Validación (al elegir "Cargar iniciativa" o "Guardar cambios", como los demás campos): nombre, tipo y unidad obligatorios recortando espacios; mínimo, meta y máximo obligatorios y numéricos; `Maximo > 0`; `Minimo ≤ Meta ≤ Maximo`. El error de orden se muestra en el campo que lo rompe: en Meta si `Meta < Minimo`, en Máximo si `Maximo < Meta` (si ambos, se muestra el de Meta). Los errores se limpian cuando el campo deja de ser inválido. Mensajes de una línea: `RequiredField`, "Ingresá un valor numérico.", "El máximo debe ser mayor que 0.", "La meta no puede ser menor que el mínimo.", "El máximo no puede ser menor que la meta." (`ResultadoClave*` en `loc/`).
- Un número válido es el que `Number(texto)` convierte en finito y el texto, recortado, no está vacío.
- Los resultados clave y la iniciativa comparten la misma confirmación (`IniciativaConfirmCreate` o `IniciativaConfirmEdit`) y el mismo mensaje de éxito (FR-015): no se agregan textos.

**D8. Maestros del panel.** `useIniciativaFormMasters` recibe `iniciativaId?: number` y suma `resultadosClave: ResultadoClave[]`, que carga con `getItems` y filtra en memoria por `Iniciativa.Id` cuando hay `iniciativaId`; sin él, devuelve vacío y no consulta. Entra en `ready` y en `error`, igual que los demás maestros. `IniciativaFormPanel` pasa `iniciativa?.Id` al hook.

**D9. Guardado conjunto (FR-015, riesgo R1).** `IniciativaFormPanel.save` recibe la iniciativa y los borradores y hace lo siguiente, con `useIniciativaDataSource` y `useResultadoClaveDataSource` (`addItem`, `editItem` y `deleteItem`, este último relanzando el error por H4):

- **Alta**: (1) `addItem` de la iniciativa; (2) `addItem` de cada resultado clave, en orden, con `Iniciativa` = la nueva, `Title`/`Nombre`, tipo, unidad, mínimo, meta, máximo y `ValorProyectado` = meta (FR-007). Si falla un resultado clave, se deshace: primero se quitan los resultados clave ya creados y después la iniciativa (`deleteItem`); el panel muestra `IniciativaSaveError` ("No se pudo guardar la iniciativa.") y conserva lo ingresado. El borrado del deshacer es interno: no es una acción de la persona y no contradice FR-007 de la 004 (R1). Si el deshacer también falla, el error queda registrado por `useDatasource`, se conservan las referencias de lo que sigue guardado y el reintento retoma lo pendiente: no vuelve a crear la iniciativa ni los resultados clave ya creados (el panel guarda en `useRef` la iniciativa creada y los resultados clave creados por `key` de borrador).
- **Edición**: (1) `editItem` de la iniciativa; (2) `addItem` de los borradores nuevos; (3) `editItem` de los existentes que cambiaron (se comparan los seis campos con el original); (4) `deleteItem` de los originales que ya no están. Agregar va antes que quitar, para que nunca quede una iniciativa sin resultados clave. Si un paso falla, el panel muestra `IniciativaSaveError` y conserva lo ingresado. Al reintentar, `IniciativaFormPanel` toma como original lo ya guardado en el intento anterior (un `useRef` con la lista vigente y otro con los Id creados por `key` de borrador, que se actualizan después de cada paso), así que los pasos completados no se repiten. `onSave` devuelve los borradores con los Id asignados (`Promise<IResultadoClaveDraft[]>`).
- Solo con `canLoadResultadosClave` y un objetivo de la VP RRII; si no, la iniciativa se guarda como en la 004.
- Al terminar, `onSaved` recibe la iniciativa, como hoy; las pantallas recargan iniciativas y resultados clave.

**D10. Comentarios del seguimiento.**

- Se agrega `ComentarioResultadoClaveMock` (D1) y `useComentarioResultadoClaveDataSource` lo pasa como segundo argumento.
- Hook nuevo `core/api/ComentarioResultadoClave/useComentariosResultadoClave.ts`, igual a `useComentariosIniciativa` (datasource o mock según el entorno, consulta al montar y cuando cambia el Id, devuelve `{ items, isLoading, error, reload }`). Se necesita porque `useDatasource` no expone consultas filtradas. Se usa solo cuando se abre el panel de seguimiento, con el Id del resultado clave; el detalle de la iniciativa no carga comentarios.
- **P1. Índice.** La columna `ResultadoClave` (lookup) de la lista `Comentario resultado clave` tiene que estar indexada, porque el filtro `ResultadoClaveId eq <id>` consulta una lista que crece con cada seguimiento. Crear el índice cambia la configuración de la lista: lo hace la usuaria, en cada sitio, antes de probar con SharePoint (pasos en [quickstart.md](./quickstart.md)). El agente no lo crea.

**D11. Datos de las pantallas con avance.**

- **Bandeja** (`IniciativasBandeja`): suma `useResultadoClaveDataSource().getItems` al `Promise.all` existente; pasa `resultados` a `IniciativasTable`.
- **Detalle del objetivo** (`ObjetivoDetalle`): carga iniciativas y resultados clave y se los pasa a `ObjetivoIniciativas` (`iniciativas`, `resultados`, `ready`, `error`, `onReload`). `ObjetivoIniciativas` deja de cargar por su cuenta; al crear una iniciativa llama `onReload`. El encabezado muestra `getAvanceObjetivo` si el objetivo es de la VP RRII (FR-034).
- **Palancas y detalle de la palanca** (`Palancas`, `PalancasTable`, `PalancaDetalle`): `Palancas` y `PalancaDetalle` suman iniciativas y resultados clave a la carga de objetivos y pasan `iniciativas` y `resultados` a `ObjetivosTable` (FR-035); `Palancas` también se los pasa a `PalancasTable`, que los reenvía a la grilla de objetivos de cada palanca expandida. Se recargan junto con los objetivos. El resumen "Avance de la VP" de `Palancas` no cambia (C-05, fuera de alcance).
- **Detalle de la iniciativa** (`IniciativaDetalle`): suma los resultados clave al `Promise.all` y filtra los de la iniciativa. Muestra el avance en el encabezado y `IniciativaResultadosClave` si el objetivo es de la VP RRII.
- Los mensajes de error de carga son los que cada pantalla ya tiene (una línea); no se agregan textos.

**D12. Sección del detalle (FR-032, FR-037).** `IniciativaResultadosClave` recibe los resultados clave de la iniciativa y `onTrack?: (resultado) => void` (ausente = sin permiso). Orden de la grilla: por Id ascendente. Formatos:

- números (`Mín.`, `Meta`, `Máx.`, `Actual`, `Proyect.`): `toLocaleString('es-AR')` sin tope de decimales útil (máximo 4); vacío → "—";
- Peso y Cumplim.: `${n}%` con el entero de `formatAvance` para Cumplim. y `formatPeso` para Peso (A3);
- nombre con debajo "unidad" y, si hay, " · Fuente: texto" (como la maqueta);
- Estado: `Chip` de A1.

**D13. Panel de seguimiento (FR-018 a FR-022, FR-037a).** `ResultadoClaveSeguimientoPanel`:

- Props: `resultado`, `onSaved`, `onCancel`. Estado local con los campos como texto; Valor actual vacío = sin valor.
- Validación al guardar: Valor proyectado obligatorio y numérico; Valor actual, si no está vacío, numérico; Evidencia, si no está vacía, válida con `Utils.validateAndSanitizeUrl(valor) !== ''`, que solo acepta dominios de confianza (FR-009, P3). Errores de una línea en el campo: `RequiredField`, "Ingresá un valor numérico.", "Ingresá un link de SharePoint u Office 365.".
- Comentario precargado con el último (`useComentariosResultadoClave`, mientras carga se muestra el campo deshabilitado) y, debajo, una línea de solo lectura "dd/mm/aaaa · Autor" del último, si existe (U1). Sin comentarios previos: campo vacío y sin línea.
- Al guardar: (1) si el comentario recortado no está vacío y es distinto del último, `addItem` de un `ComentarioResultadoClave` (el servidor completa fecha y autor); (2) `editItem` del resultado clave con `ValorActual` (o `null`), `ValorProyectado`, `Fuente` (o `null`), `Evidencia` (o `null`). Primero el comentario y después los valores, como "Cambiar estado" (D16 de la 004): si falla el segundo paso, el reintento ve el comentario ya guardado y no lo repite. Un comentario vacío o igual al último no registra uno nuevo.
- Sin confirmación previa (la maqueta no la tiene). Al terminar, el detalle muestra con `SuccessNotice` «El resultado clave "[nombre]" se ha actualizado correctamente.» (`ResultadoClaveUpdated`, texto de la maqueta; ver FR-018a de la spec) y recarga los resultados clave.
- Error: `ResultadoClaveSaveError`; el panel conserva lo ingresado.

**D14. Permisos (FR-038, FR-039).** `CAN_LOAD_RESULTADOS_CLAVE` controla el bloque del panel de iniciativa; `CAN_TRACK_RESULTADO_CLAVE`, la acción de cada fila y el panel de seguimiento. Las dos en `true` en `ObjetivosVp.tsx`. `canLoadResultadosClave` baja por props a `IniciativasBandeja`, `ObjetivoDetalle` (→ `ObjetivoIniciativas`) e `IniciativaDetalle`, que abren el panel de iniciativa. Con el valor en `false`, el panel no muestra el bloque, no valida los resultados clave y no los toca al guardar; cómo se resuelve entonces FR-014 lo decide la feature que implemente los roles (RF-19).

**D15. Quitar un resultado clave.** `deleteItem` borra el elemento de `Resultado clave`; los comentarios de la lista `Comentario resultado clave` no se borran. Si esa lista impide quitar un resultado clave con comentarios (relación de la columna de búsqueda), el paso falla y se informa con `IniciativaSaveError`. Se verifica en el quickstart (P2).

**D16. Errores.** Una línea con `MessageBar`, sin el error técnico (FR-041). El registro de errores queda en `useDatasource`; las pantallas no vuelven a registrarlos. Los errores de validación se muestran en el campo, sin texto de ayuda (FR-017).

**D17. Recarga.** Tras guardar iniciativa y resultados clave, cada pantalla de origen recarga iniciativas y resultados clave, además de lo que ya recargaba. Así el avance y el peso se actualizan sin acciones de la persona (SC-005).

## Estructura de carpetas

```text
specs/006-resultados-clave/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-contracts.md
├── checklists/requirements.md
└── tasks.md                                   # lo genera /speckit-tasks

src/core/
├── entities/ResultadoClave.ts                 # Title = Nombre; null para vaciar (D2)
└── api/
    ├── useDatasource.ts                       # deleteItem relanza el error (H4)
    ├── ResultadoClave/
    │   ├── ResultadoClaveMock.ts              # nuevo (D1)
    │   ├── useResultadoClaveDataSource.ts     # pasa el mock
    │   └── useItemResultadoClaveDataSource.ts # pasa el mock
    └── ComentarioResultadoClave/
        ├── ComentarioResultadoClaveMock.ts    # nuevo (D1)
        ├── useComentarioResultadoClaveDataSource.ts      # pasa el mock
        ├── useItemComentarioResultadoClaveDataSource.ts  # pasa el mock
        └── useComentariosResultadoClave.ts    # nuevo (D10)

src/webparts/objetivosVp/
├── loc/{en-us.js, mystrings.d.ts}             # claves nuevas
└── components/
    ├── ObjetivosVp/ObjetivosVp.tsx            # permisos nuevos (D14)
    ├── shared/AvanceText/AvanceText.tsx       # nuevo (D6)
    ├── Objetivo/
    │   ├── ObjetivosTable/ObjetivosTable.tsx  # avance calculado (D5)
    │   ├── ObjetivoDetalle/ObjetivoDetalle.tsx            # carga datos, avance en el encabezado (D11)
    │   └── ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx  # recibe datos por props
    ├── Palanca/
    │   ├── Palancas/Palancas.tsx              # carga iniciativas y resultados clave
    │   ├── Palancas/PalancasTable/PalancasTable.tsx   # pasa iniciativas y resultados clave a ObjetivosTable
    │   └── PalancaDetalle/PalancaDetalle.tsx  # ídem
    └── Iniciativa/
        ├── resultadoClaveUtils.ts             # nuevo: cálculos y formatos (D4)
        ├── IniciativasTable/IniciativasTable.tsx          # columna Avance
        ├── IniciativasBandeja/IniciativasBandeja.tsx      # carga resultados clave
        ├── IniciativaForm/
        │   ├── IniciativaForm.tsx, IniciativaFormPanel.tsx, useIniciativaFormMasters.ts   # bloque y guardado (D7 a D9)
        │   └── ResultadosClaveBloque/{ResultadosClaveBloque.tsx, ResultadosClaveBloque.module.scss}   # nuevo
        ├── ResultadoClaveSeguimientoPanel/ResultadoClaveSeguimientoPanel.tsx   # nuevo (D13)
        └── IniciativaDetalle/
            ├── IniciativaDetalle.tsx          # carga, avance en el encabezado, sección, seguimiento
            └── IniciativaResultadosClave/IniciativaResultadosClave.tsx   # nuevo (D12)
```

**Structure Decision**: los componentes siguen agrupados por dominio. `resultadoClaveUtils.ts` queda junto a `iniciativaUtils.ts` porque los resultados clave pertenecen a la iniciativa y lo usan también `Objetivo/` y `Palanca/` (como `ObjetivoIniciativas` ya usa `Iniciativa/`). `ResultadoClaveSeguimientoPanel` queda en la raíz de `Iniciativa/`, junto a `IniciativaEstadoPanel`. `AvanceText` va en `shared/` porque lo usan tres dominios.

## Orden de implementación

| # | Paso | Depende de |
|---|------|-----------|
| 1 | `ResultadoClave.ts` (Title, `null`) y `useDatasource.ts` (`deleteItem`) | — |
| 2 | Mocks y hooks de `ResultadoClave` y `ComentarioResultadoClave`; `useComentariosResultadoClave` | 1 |
| 3 | Claves de texto en `loc/` | — |
| 4 | `resultadoClaveUtils.ts`, `AvanceText`, permisos en `ObjetivosVp.tsx` | 3 |
| 5 | Sección del detalle de la iniciativa y avance en su encabezado (US2, solo lectura) | 2, 4 |
| 6 | Bloque del panel y guardado conjunto: alta (US1) | 2, 4 |
| 7 | Edición con resultados clave (US5) | 6 |
| 8 | Panel de seguimiento (US3) | 5 |
| 9 | Avance en la bandeja y en la sección Iniciativas del detalle del objetivo, con la carga subida a `ObjetivoDetalle` (US4) | 4 |
| 10 | Avance en el encabezado del objetivo, el detalle de la palanca y la grilla de objetivos (US4) | 9 |
| 11 | La usuaria indexa la columna `ResultadoClave` de `Comentario resultado clave` y verifica las columnas de `Resultado clave` (P1, P2) | — |
| 12 | Validación con [quickstart.md](./quickstart.md) | 7, 8, 10, 11 |

## Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | FR-015 pide que la iniciativa y los resultados clave se guarden "todos o ninguno", pero SharePoint no tiene transacciones entre listas. | Todo se valida antes de escribir. El alta se deshace si falla un resultado clave (D9); la edición escribe en un orden seguro y se puede reintentar sin repetir pasos. Un fallo del propio deshacer puede dejar datos parciales: se informa en una línea que la operación no pudo completarse, el panel conserva lo ingresado y reintentar retoma lo pendiente sin duplicar lo ya guardado (FR-015). Es una limitación de la plataforma. |
| R2 | El criterio de "objetivo de la VP RRII" es `objetivo.VP.Title === 'VP RRII'` sobre el lookup sin resolver, igual que los pesos de la 004. Si el título del lookup difiriera del nombre de la VP, el bloque y el avance no aparecerían. | Se mantiene el criterio ya validado en la 004 (los registros de la lista se crean con Title = Nombre). Si se detectara la diferencia, es una inconsistencia de la 004 y se informa antes de tocarla. |
| R3 | Las listas leen hasta 5000 elementos (`TOP_DEFAULT`). Con muchos más resultados clave, el avance sería incorrecto. | Está muy por encima del volumen esperado (cientos de iniciativas). Si se superara, hay que paginar o consultar por filtro. |
| R4 | La lista `Resultado clave` puede tener `Responsable` o `Peso` como obligatorias. En ese caso, el alta fallaría porque esta feature no los envía. | P2: verificación previa de la usuaria. No se planifica ningún cambio de columnas sin avisar (spec, Assumptions). |

## Prerrequisitos de SharePoint (a cargo de la usuaria)

| # | Prerrequisito | Cuándo |
|---|---|---|
| P1 | Indexar la columna `ResultadoClave` de la lista `Comentario resultado clave` (D10). | Antes de probar el seguimiento en SharePoint, en cada sitio. |
| P2 | Verificar que en la lista `Resultado clave` ni `Responsable`, ni `Peso`, ni `Descripcion` sean obligatorias, y que existan las columnas que usa el datasource (`Nombre`, `TipoMedicion`, `UnidadMedida`, `Minimo`, `Meta`, `Maximo`, `ValorActual`, `Fuente`, `Evidencia`, `ValorProyectado`, `Iniciativa`). Si alguna difiere, se avisa antes de planificar un cambio. | Antes de probar el alta en SharePoint. |
| P3 | Confirmar que los links de evidencia que se van a usar están en los dominios que acepta `Utils.validateAndSanitizeUrl` (sharepoint.com, office.com, microsoft.com, powerbi.com, outlook.com, onedrive.com). Si hace falta otro dominio, se detiene y se consulta; no se amplía la lista. | Antes de la revisión funcional. |

## Complexity Tracking

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|-----------|----------------------|-------------------------------------------|
| Guardado conjunto con deshacer compensatorio y `useRef` de lo ya guardado, en lugar de un guardado simple (principio IV) | FR-015 pide guardar la iniciativa y los resultados clave juntos, y SharePoint no ofrece transacciones (R1). | Guardar la iniciativa y después los resultados clave sin deshacer: deja iniciativas de la VP RRII sin resultados clave, que FR-014 no admite. |
| Cambio en `core/api/useDatasource.ts` (`deleteItem` relanza el error) (principio IV) | Hace falta detectar el fallo al quitar un resultado clave y al deshacer un alta (D9). Nadie usa `deleteItem` hoy. | Llamar al datasource sin pasar por el hook: viola el principio III. |
| `ObjetivoDetalle` pasa a cargar iniciativas y resultados clave y `ObjetivoIniciativas` los recibe por props (principio IV) | El encabezado del objetivo necesita el avance y la sección necesita los mismos datos (FR-034). | Que ambos carguen por su cuenta: duplica dos consultas de hasta 5000 elementos en la misma pantalla. |
| Componente nuevo `AvanceText` en `shared/` (principio II) | El mismo porcentaje con color se usa en cinco lugares y reemplaza dos estilos duplicados que hoy lo muestran fijo en rojo. | Repetir el estilo en cada lugar: duplica la regla de color de C-07. |
| Chip `warning` con colores de la escala Yellow para "Meta" (principio II) | El DS no tiene chip amarillo y la maqueta distingue Mínimo (naranja) de Meta (amarillo). | Usar `warning` para los dos: pierde la distinción de C-02. |
| Acción "Registrar seguimiento" con `editPrimary` en lugar del ícono de tendencia de la maqueta (principio II) | El registro del DS no tiene un ícono de tendencia. | Un ícono propio: viola el principio II. |
| Cumplim. y Estado con el valor actual, y "—" / "Sin dato" sin valor, cuando la v1.9 (C-01, C-02) define 0 % y "No cumple" (principio II) | Decisión de la usuaria del 2026-11-18, registrada en la spec (FR-026, FR-027). | Seguir la v1.9: contradice la spec. |
| Comentario del seguimiento precargado y con fecha y autor, cuando la maqueta lo abre vacío (principio II) | Decisión de la usuaria del 2026-11-18 (U1). | Seguir la maqueta: el último comentario no se vería en ninguna pantalla. |
| Se mantienen los desvíos de la 003 y la 004 que alcanzan a estas pantallas (migas, error de fecha bajo `Picker`, "Cambiar estado" como panel) | FR-040 de la spec. | — |
