# Implementation Plan: Riesgos y decisiones (carga y edición desde la tarea, y vista en la iniciativa)

**Branch**: `011-riesgos-decisiones` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-riesgos-decisiones/spec.md`. Continúa la [007-tareas](../007-tareas/plan.md), que dejó fuera los riesgos y las decisiones (RF-14), y reutiliza sus patrones: secciones independientes del detalle, guardado con deshacer y reintento, constantes `CAN_*`, localización en un solo archivo, mocks y piezas del Design System.

## Summary

Sumar al detalle de la tarea la sección "Riesgos (N)", el botón "Cargar riesgo" en el pie fijo y el panel lateral "Cargar riesgo" / "Editar riesgo RSK-NN" (riesgo y decisión juntos, un solo Guardar), y al detalle de la iniciativa la sección "Riesgos de sus tareas (N)" y tres contadores (riesgos activos, riesgos escalados y decisiones pendientes) dentro de "Indicadores de las tareas".

Enfoque técnico:

- **Datos**: ya existen las entidades, los datasources y los hooks de `Riesgo` y `Decision` sobre las dos listas de SharePoint, pero sin mocks, sin lecturas por varias tareas o por varios riesgos y con dos columnas de `Decision` que esta feature no usa (H2). No se crean ni modifican listas ni columnas (H1).
- **Capa de servicio nueva** (`RiesgoService`, en `core/api/Riesgo`): único punto por el que la interfaz escribe riesgos y decisiones. Vuelve a leer lo guardado y valida **antes de escribir** las reglas de estado, de fecha límite, de tarea o iniciativa cerradas y de solo lectura (FR-009, FR-009a, FR-010, FR-010a, FR-011), de modo que no dependen solo de la interfaz (H8). Resuelve el todo o nada entre las dos listas (D3). Las reglas puras viven en `riesgoReglas.ts` y las usan el servicio y las pantallas, para no duplicarlas.
- **Todo o nada** (FR-008b): SharePoint no tiene transacciones. El alta guarda el riesgo y después la decisión; si falla la decisión, borra el riesgo recién creado. La edición escribe primero la decisión y al final el riesgo; si falla el segundo guardado, vuelve a escribir los valores anteriores del primero. Si la reversión también falla, el servicio informa el error y la pantalla lo avisa; un reintento retoma solo lo pendiente (D3).
- **Consultas** (FR-013, FR-023): el detalle de la tarea hace 2 lecturas (riesgos de la tarea y sus decisiones); el de la iniciativa suma 2 (riesgos activos y escalados de las tareas no canceladas y sus decisiones). Ninguna es por tarea o por riesgo, y ninguna usa `getItems` sin filtrar (D5).
- **Pantallas**: ninguna ruta nueva (FR-046 de la 007: no se crean rutas). Una pieza compartida de tabla, una sección en cada detalle y un panel lateral. Todo con piezas del Design System; sin modificar `src/core/ui`.
- **Permisos**: dos constantes `CAN_*` nuevas, todas en `true` hasta RF-19, como la 007 (FR-019). No definen roles.
- **Fuera de este plan**: mail y leyenda de escalado, alertas, bandejas, tablero, presupuesto e historial del riesgo (spec, "Fuera de alcance").

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, con la configuración heredada de `@microsoft/spfx-web-build-rig`, igual que las features anteriores.

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`, Fluent UI v8 (`@fluentui/react ^8.106.4`), PnPjs `@pnp/sp 4.18.0`, `react-router-dom 6.30.6` (`HashRouter`). Esta feature no agrega dependencias.

**Storage**: listas de SharePoint `Riesgo` y `Decision` (`Lista.Riesgo` = "Riesgo" y `Lista.Decision` = "Decision" en `src/core/utils/Constants.ts`), que ya existen, más `Tarea` e `Iniciativa` (solo lectura, para validar). El código no crea ni modifica listas ni columnas. Hay verificaciones e índices a cargo de la usuaria (V1 a V8, más abajo).

**Testing**: no hay runner de pruebas. Validación: `npm run build` (principio V), escenarios de [quickstart.md](./quickstart.md): §1 a §6 con mocks y §7 y §8 (fallos parciales, reversión y estados desactualizados) solo en el workbench hospedado del sitio de desarrollo, y comparación visual con el prototipo. Se escribe solo en las listas de desarrollo y con autorización explícita.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft, según los scripts de `package.json`).

**Performance Goals**: detalle de la tarea y de la iniciativa en menos de 3 s con el volumen de un año (RNF-04 y RNF-05). Lecturas nuevas: tarea, 2 (riesgos de la tarea; decisiones, una consulta por tandas de hasta 40 riesgos); iniciativa, 2 (riesgos activos y escalados; decisiones de los que requieren decisión). Sin riesgos, la consulta de decisiones no se hace. Contadores, tablas y cuenta "(N)" se calculan en memoria. Guardado: alta limpia, 2 lecturas de validación más 1 o 2 escrituras, sin consulta de decisiones; reintento del alta (con un pendiente), 1 consulta de decisiones más; edición, 4 lecturas (riesgo, decisión, tarea e iniciativa) más 1 o 2 escrituras (las que cambiaron).

**Constraints**: `src/core/ui` de solo lectura; sin colores, tipografías ni espaciados fuera del DS; textos en español (AR) en `loc/`; sin acción de eliminar riesgos ni decisiones (FR-007); sin mail, alertas, bandejas, tablero, presupuesto ni historial del riesgo; sin roles (RF-19); no se crean ni modifican listas ni columnas desde el código; sin rutas nuevas.

**Scale/Scope**: 0 rutas nuevas; 1 panel lateral; 1 sección en cada detalle; 1 pieza de tabla compartida; 7 archivos nuevos en `core/api` (contrato y errores del servicio, servicio, reglas, 2 mocks y 2 hooks de lectura) y 5 archivos de `core` modificados (ver "Estructura de carpetas" y "Registro en `docs/plantilla-cambios.md`").

## Hallazgos del repo

Los nueve hallazgos del encargo, confirmados contra el código. Detalle en [research.md](./research.md).

| # | Hallazgo | Estado | Consecuencia |
|---|---|---|---|
| H1 | Las listas son dos: `Riesgo` (`Title`, `Tarea`, `Estado`, `RequiereDecision`, `FechaResolucion`, `Descripcion`) y `Decision` (`Title`, `DecisionNecesaria`, `Riesgo`, `Responsable`, `FechaLimite`, `FechaResolucion`). | **Confirmado** (`select` de ambos datasources y `toListItem` de ambas entidades). Las columnas alcanzan: autor y fecha de creación y de modificación (FR-006, FR-008) salen de `Created`, `Modified`, `Author` y `Editor`. No falta ninguna columna. | No se crea ni modifica nada. Quedan verificaciones y índices a cargo de la usuaria (V1 a V8). |
| H2 | `Decision.Responsable` y `Decision.FechaResolucion` no se usan (FR-015, FR-016). | **Confirmado**: hoy el `select` las lee, `mapItem` las mapea y `toListItem` las envía si están definidas. | La app deja de leerlas y de escribirlas (D1). Verificación V2: que no sean obligatorias en la lista. |
| H3 | `Title` de `Riesgo` = descripción recortada a 255; el ID RSK-NN sale del `Id`. | **Confirmado**: `BaseEntity.toListItem` envía `Title` desde `Titulo`; `Riesgo` no lo completa. No existe `formatRiesgoId`. | El servicio completa `Titulo` (D2). `formatRiesgoId` nuevo, como `formatTareaId`. |
| H4 | Todo o nada entre las dos listas. | **Sin resolver en el código**: hoy cada guardado es independiente. | Orden y reversión en D3. |
| H5 | Los `DataSource` tienen `delete`. | **Confirmado** (interfaces y clases de ambas listas; `useDatasource.deleteItem`). | La aplicación no ofrece eliminar; el borrado solo lo usa el servicio como reversión interna (D4). |
| H6 | Una decisión por riesgo. | **Sin resolver en el código**: `add` no consulta. | El servicio consulta las decisiones del riesgo antes de agregar una, en el reintento del alta y en la edición; en el alta limpia el riesgo es nuevo y no puede tener decisión (D3). |
| H7 | Consultas de la iniciativa sin N+1 ni `getItems` sin filtrar. | **Confirmado**: solo hay `getFilteredItems(tareaId)` y `getFilteredItems(riesgoId)` (uno por vez) y `getItems()` sin filtro. | Dos lecturas nuevas por varios Id (D5). |
| H8 | Las reglas se validan en la capa de servicio. | **No existe capa de servicio**: las pantallas usan los hooks del datasource; la 007 valida en funciones puras de `webparts` y en el panel. | Servicio nuevo y reglas puras en `core/api/Riesgo` (D2, D6). |
| H9 | El campo `Estado` de `Riesgo` tiene exactamente Activo, Escalado y Resuelto. | **No verificable desde el repo**: no hay esquema de listas. Lo único comprobable es el enum `EstadoRiesgo` (Activo, Escalado, Resuelto), que coincide con la spec, y `assertChoiceValue` rechaza al escribir cualquier otro valor. | Verificación V1 a cargo de la usuaria. Resultado anotado en [research.md](./research.md#h9-estado-de-la-lista-riesgo). |

Hallazgos adicionales del repo (en [research.md](./research.md)):

| # | Hallazgo | Consecuencia |
|---|---|---|
| H10 | `Riesgo` y `Decision` no tienen mock ni los hooks existentes pasan uno; `useDatasource` falla fuera de SharePoint si no hay mock. | Dos mocks nuevos (principio III). Los hooks existentes de ambas listas no se tocan: la feature no los usa. |
| H11 | `Riesgo.toListItem` llama a `assertChoiceValue` con `Estado`: con un objeto parcial lanzaría. | No hace falta cambiarlo: el servicio siempre guarda el riesgo con `Estado` definido. |
| H12 | Los guardados de la 007 muestran un `MessageBar` sin botón de reintentar; se reintenta volviendo a pulsar el botón del panel, y el panel retoma con `useRef` lo ya creado. | Mismo patrón, sin botón nuevo (D7). |
| H13 | `IniciativaTareasIndicadores` usa una grilla de 5 columnas (`grid5`) con los 5 estados. | Los 3 contadores nuevos se suman al mismo grupo y fluyen a una segunda fila, sin tocar el estilo (D9). |
| H14 | El detalle de la tarea (`TareaDetalle`) ya carga la tarea y la iniciativa y compone secciones hermanas (`TareaInfo`, `TareaComentario`). | La sección de riesgos es un componente hermano más (D8). |
| H15 | Los datos de fechas (`FechaInicio`, etc.) de la 007 se tratan con `toDateInput` / `fromDateInput` / `formatDate` de `objetivoUtils.ts`. | La fecha límite usa las mismas funciones. |

## Constitution Check

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | Mismo stack y versiones; sin dependencias nuevas. |
| II. La interfaz no se inventa | ✅ Cumple, con los desvíos que aprobó la spec | Pantallas tomadas del prototipo v11 (`docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`): sección "Riesgos ({n})" de `scr.tarea` (`c-rk`), pie con "Cargar riesgo" (`A('Cargar riesgo', …)`), modal `m.is.riesgo` (aquí, panel lateral, como los demás flujos de la 007), sección "Riesgos de sus tareas" de `scr.iniciativa` (`c-ri2`) y `idt.stats`. Desvíos aprobados en la spec: sin leyenda del mail, mensaje de escalado sin mail, sin lápiz de sección, sección de la iniciativa contraída al entrar (como el prototipo), lápiz ausente en riesgos de solo lectura, sin Fecha de resolución. Aproximaciones del DS: A1 a A3. |
| II. `core/ui` de solo lectura | ✅ Cumple | No se modifica el DS; no hay nada que anotar en `docs/design-system-cambios.md`. |
| II. Estructura de pantalla | ✅ Cumple | Carpeta `Riesgo/` con una subcarpeta por pantalla o pieza (`.tsx` y `.module.scss` cuando hace falta). Las secciones de cada detalle van en `Tarea/TareaDetalle/` e `Iniciativa/IniciativaDetalle/`. |
| II. Textos en español (AR) | ✅ Cumple | Claves nuevas `Riesgo*` en `loc/mystrings.d.ts` y `loc/en-us.js` (D10), reutilizando las existentes. |
| III. Datos desacoplados | ✅ Cumple | Las pantallas usan solo el servicio y los hooks de lectura de `core/api`; nunca los datasources. Dos mocks nuevos. Tipos en `core/entities`. |
| IV. Simplicidad y cambios acotados | ✅ Cumple, con cambios justificados | La capa de servicio la pide el encargo (H8, FR-008b). Cambios en `core`: ver Complexity Tracking y el registro de `docs/plantilla-cambios.md`. |
| V. Validación | ✅ Cumple | Cada tarea cierra con `npm run build`. |

**Re-check post-diseño**: sin cambios. Los puntos a decidir (C-1 a C-6) se resolvieron el 2026-11-25 y están incorporados al diseño.

## Interfaz y Design System

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (prototipo v11):

- detalle de la tarea: sección "Riesgos ({td.nRsks})" con la grilla `c-rk`, estado vacío `td.noRsks` y botón "Cargar riesgo" en `acts`;
- panel: modal `m.is.riesgo` (campos `desc`, `estado`, `reqDec`, `dec`, `flim`) y su guardado (`m.type === 'riesgo'`);
- detalle de la iniciativa: sección "Riesgos de sus tareas ({idt.nRsks})" con la grilla `c-ri2` y `idt.stats`.

**Design System**: `src/core/ui`, según `docs/design-system-catalog.md`.

### Mapeo elemento → componente

**Sección de la tarea (`TareaRiesgos`)**

| Elemento | Componente | Observaciones |
|---|---|---|
| Sección "Riesgos (N)" | `SectionBand` `collapsible` | Expandida al entrar (el prototipo no la contrae), sin lápiz de sección (el prototipo no define `sec.t_rsk.edit`). Sin `bandNote`: no hay leyenda del mail (FR-012). N = todos los riesgos de la tarea. |
| Grilla | `Table` del DS (misma pieza `RiesgosTable`, variante `tarea`) | Columnas ID (`RSK-NN`), Riesgo, Requiere decisión (Sí/No), Decisión necesaria, Fecha límite, Estado, Acción. "—" en decisión y fecha cuando no requiere decisión. |
| Estado | `Chip` `size="small"` | Activo `warning`, Escalado `danger`, Resuelto `success` (prototipo: `c-warn`, `c-bad`, `c-ok`). |
| Acción | `Button` `iconOnly` + `FigmaIcon` `editPrimary` + `Tooltip` "Editar riesgo" | Solo si `canEditRiesgo` y el riesgo es editable (D6). Si no, "—", como el prototipo. |
| Vacío | `emptyText` de `Table` | «Esta tarea no tiene riesgos cargados. Cuando se carguen, van a aparecer acá.» |
| Carga y error | `Spinner` y `MessageBar` `type="error"` con `Button` "Reintentar" | Una línea, como `TareasLoadError`. La sección falla sola; el resto del detalle se muestra. |
| Pie fijo | `Button` "Cargar riesgo" en `DetailFooter` | A continuación de "Registrar avance". Variante `secondary` (A1, decidido el 2026-11-25). Visible solo con `canCreateRiesgo` y `canCargarRiesgo` (FR-011). |

**Panel de alta y edición (`RiesgoFormPanel`)**, panel de 480 px de la 007, en una columna:

| Elemento | Componente | Observaciones |
|---|---|---|
| Panel | `Panel` | Título "Cargar riesgo" o "Editar riesgo RSK-NN", con "TAR-nn · nombre" como subtítulo (`buildPanelTitle`). Pie: Cancelar `secondary` · Guardar `primary`. Sin modal de confirmación (el prototipo no lo tiene). |
| Descripción | `Multiline` `required` | Placeholder «Ej.: Aduana retiene el cargamento». |
| Estado | alta: `Input` `disabled` con "Activo"; edición: `Dropdown` `required` | Edición: solo el estado actual y los permitidos (FR-009). |
| Requiere decisión | `Dropdown` `required` | "No" (por defecto) · "Sí". Deshabilitado en "Sí" si el riesgo ya tiene una decisión guardada (FR-010). |
| Decisión necesaria | `Multiline` `required` | Solo con "Sí". Placeholder «Qué decisión se necesita y de quién (área o persona)». |
| Fecha límite de la decisión | `Picker` `mode="date"` `required` | Solo con "Sí". Error «La fecha límite no puede ser anterior a hoy.» en el campo. |
| Error al guardar | `MessageBar` `type="error"` | Una línea; el panel conserva lo ingresado (Story 1 §8, Story 3 §11). |

**Sección de la iniciativa (`IniciativaRiesgos`) e indicadores**

| Elemento | Componente | Observaciones |
|---|---|---|
| Sección "Riesgos de sus tareas (N)" | `SectionBand` `collapsible` `defaultCollapsed` | Contraída al entrar, como el prototipo (`DEF_CL.i_rsk`). Sin lápiz de sección. |
| Grilla | `RiesgosTable` variante `iniciativa` | Columnas ID, Riesgo, Tarea (ID · nombre), Decisión necesaria, Fecha límite, Estado, Ver. Sin paginación (FR-023). "Ver" = `Button` `iconOnly` + `FigmaIcon` `chevronCirclePrimary` + `Tooltip` `TareaViewTooltip` («Ver tarea») y aria-label `TareaViewAriaLabel`, como `TareasTable`; abre `/tarea/:id` con `state.from` = la iniciativa. |
| Vacío | `emptyText` de `Table` | «Las tareas de esta iniciativa no tienen riesgos cargados. Cuando se carguen, van a aparecer acá.» |
| Contadores | `Field` en la grilla de `IniciativaTareasIndicadores` | Riesgos activos, Riesgos escalados, Decisiones pendientes, a continuación de los 5 estados (Story 4 §7). Valen 0 si no hay. Aproximación A2. |
| Error de carga | `MessageBar` `type="error"` con "Reintentar" | La sección y los contadores no se muestran como si no hubiera datos (D9). |

### Elementos sin componente en el Design System

Ninguno. `Multiline`, `Picker` `mode="date"`, `Dropdown`, `Panel`, `Table`, `Chip`, `SectionBand`, `Field`, `DetailFooter` y `MessageBar` ya los usa la 007.

### Aproximaciones (a confirmar en la revisión visual)

| # | Elemento | Aproximación |
|---|---|---|
| A1 | Estilo del botón "Cargar riesgo" | El prototipo le da una variante propia (`ter70`); el DS ofrece `primary` y `secondary`. Se usa `secondary` para no competir con "Registrar avance" (decidido el 2026-11-25). |
| A2 | Contadores de riesgos | El prototipo muestra tarjetas (`stats`); el DS no tiene tarjeta de indicador. Mismo `Field` de la 007 (A2 de la 007). |
| A3 | Requiere decisión como lista desplegable | El prototipo usa `select`; el DS no tiene selector Sí/No de otro tipo, y `Dropdown` cubre el caso. |

## Decisiones

**D1. Entidad `Decision` sin `Responsable` ni `FechaResolucion` (H2).**

- `DecisionDataSource` deja de pedir `Responsable` y `FechaResolucion` en el `select`; `Decision.mapItem` deja de mapearlas; `Decision.toListItem` deja de enviarlas; se quitan las dos propiedades de la clase. Ninguna otra parte del repo las usa (verificado por búsqueda, [research.md](./research.md#r6-uso-de-riesgo-y-decision-fuera-de-su-capa)).
- `Riesgo` no cambia: ya lee y escribe solo lo que usa esta feature (`Tarea`, `Estado`, `RequiereDecision`, `FechaResolucion`, `Descripcion`).
- La lista de SharePoint no se toca: las dos columnas quedan sin valor. Verificación V2.

**D2. Capa de servicio (`core/api/Riesgo`) y `Title` (H3, H8).**

- `IRiesgoService` / `RiesgoService` es el único camino de escritura y de lectura combinada (riesgo con su decisión). Se construye con las interfaces de los datasources de `Riesgo`, `Decision`, `Tarea` e `Iniciativa` (los dos últimos, solo `getById`). `getRiesgoService()` elige datasources reales o mocks según `Environment.type`, igual que `getDatasource` de `useTareasIniciativa`.
- Antes de escribir, el servicio vuelve a leer del origen lo que necesita (el riesgo y su decisión, la tarea y la iniciativa) y aplica las reglas puras de `riesgoReglas.ts` (D6). **No confía en lo que muestra la pantalla.** Si una regla falla, lanza `RiesgoValidationError` con los campos y los códigos de regla incumplidos y no escribe nada.
- `Title` de `Riesgo`: el servicio fija `Titulo` = `Descripcion` recortada a 255 caracteres (`recortarTitulo`). La descripción completa va a la columna `Descripcion`; la grilla muestra siempre `Descripcion`. El ID `RSK-NN` se arma con `formatRiesgoId` (`riesgoUtils.ts`, `RSK-` + `Id` con dos dígitos, como `formatTareaId`).
- `Title` de `Decision`: decisión técnica, sin efecto funcional: el servicio fija `Titulo` = `DecisionNecesaria` recortada a 255 (misma regla). Evita una columna obligatoria vacía y no usa `Responsable`.
- Los servicios no tienen textos: devuelven errores tipados y códigos; las pantallas los traducen con `loc/`.

**D3. Guardado todo o nada entre las dos listas (FR-008b, H4, H6).** SharePoint no ofrece transacciones.

*Alta* (`RiesgoService.crear`):

1. Valida (tarea y iniciativa no cerradas, FR-011; descripción, decisión y fecha límite, FR-002 y FR-010a). Si falla: `RiesgoValidationError`, nada escrito.
2. `add` del riesgo: `Titulo` (D2), `Tarea`, `Estado` = Activo, `RequiereDecision`, `Descripcion`; sin `FechaResolucion`.
3. Si `RequiereDecision` es Sí: `add` de la decisión (`Titulo`, `DecisionNecesaria`, `Riesgo`, `FechaLimite`). **En el alta limpia no se consulta**: el riesgo acaba de crearse y no puede tener decisión. **Solo en el reintento** (cuando hay un `pendiente`) se consultan antes las decisiones del riesgo (H6) y, si ya hay una, se edita en lugar de crear otra.
4. Si falla el paso 3, **borra el riesgo recién creado** (reversión interna, D4) y lanza `RiesgoGuardadoError` (`revertido: true`). Si el borrado también falla, lanza `RiesgoGuardadoError` (`revertido: false`) con `pendiente` = el riesgo ya creado.
5. **Reintento**: el panel guarda en `useRef` el `pendiente` y se lo pasa al servicio en el siguiente Guardar; con `pendiente`, el servicio no vuelve a crear el riesgo ni repite la validación de cierre sobre él, y retoma el paso 3. Si la reversión salió bien, el reintento arranca limpio. Nunca se duplica el riesgo ni la decisión.

*Edición* (`RiesgoService.editar`):

1. Lee riesgo, decisión, tarea e iniciativa. Valida: el riesgo no está Resuelto ni su tarea Cancelada (FR-009a, FR-011); la transición de estado es permitida (FR-009); Requiere decisión no vuelve de Sí a No con la decisión guardada (FR-010); la fecha límite, solo si cambió, no es anterior a hoy (FR-010a); campos obligatorios. Si falla: `RiesgoValidationError`, nada escrito.
2. Calcula **qué cambió** y escribe solo eso, **primero la decisión y al final el riesgo**:
   - decisión: `edit` con los valores nuevos, o `add` si ahora corresponde (de No a Sí, o riesgo que requiere decisión sin decisión);
   - riesgo: `edit` con `Titulo`, `Descripcion`, `Estado`, `RequiereDecision` y, al pasar a Resuelto, `FechaResolucion` = ahora (la fecha del guardado; nunca se sobrescribe si ya existe).
3. Si falla el segundo guardado (el riesgo), **vuelve a escribir los valores anteriores del primero** (leídos en el paso 1): si la decisión se había editado, la restaura; si se había creado en este guardado, la borra (D4). Lanza `RiesgoGuardadoError` (`revertido: true`).
4. Si la reversión también falla, lanza `RiesgoGuardadoError` (`revertido: false`): la decisión puede quedar con los valores nuevos y el riesgo con los anteriores. La pantalla lo avisa con un texto distinto del error simple (D7).
5. **Reintento**: volver a pulsar Guardar repite la edición completa. Como cada escritura es de valores absolutos, el resultado converge al estado pedido; la validación se repite sobre lo guardado (el riesgo sigue en su estado anterior porque su guardado falló).

*Por qué ese orden de escritura*: en la edición, el cambio de **estado** es el efecto con consecuencias (fecha de resolución, y el mail de escalado que agregará la spec de Alertas, que puede dispararse al ver un riesgo Escalado). Escribiéndolo al final, un fallo de la decisión nunca lo deja escrito; y un fallo del riesgo solo obliga a restaurar la decisión. Con el orden inverso, el estado Escalado o Resuelto podría quedar guardado y revertido, con fecha de resolución y posibles avisos espurios. En el alta el orden es obligatorio: la decisión necesita el `Id` del riesgo.

*Un riesgo que quedó sin su decisión* (la reversión del alta también falló y se cerró el panel) no lleva ninguna marca en la grilla: solo el aviso del momento del fallo y la posibilidad de completar la decisión al editarlo (el riesgo sigue editable y los campos de la decisión aparecen vacíos y obligatorios). Decidido el 2026-11-25.

*Límites conocidos* (se documentan, no se ocultan): las reversiones restauran valores de columnas, no los metadatos del sistema (`Modified`, `Editor`), que quedan con la fecha y el autor de la reversión (aceptado el 2026-11-25); y el orden validar-leer-escribir no es atómico: dos personas que editan a la vez siguen el criterio de la spec ("el último guardado gana"), con el rechazo de FR-009a solo si el riesgo ya se leyó como Resuelto.

**D4. Borrado solo como reversión interna (FR-007, H5).** `IRiesgoDataSource.delete` e `IDecisionDataSource.delete` se conservan sin cambios. Solo los llama `RiesgoService`, y únicamente para deshacer un registro **creado en ese mismo guardado** (el riesgo del alta, o la decisión creada en una edición). Ninguna pantalla, hook ni acción de la persona los usa, ni hay botón ni opción de eliminar riesgos o decisiones. Es el mismo criterio que el deshacer de la 007 (D4 de la 007). El mock tiene el mismo comportamiento.

**D5. Consultas (FR-013, FR-021, FR-023, H7).**

- Tarea: `RiesgoService.getByTarea(tareaId)` hace `getFilteredItems(tareaId)` (existente) y, si hay riesgos que requieren decisión, **una** consulta de decisiones por varios riesgos.
- Iniciativa: `RiesgoService.getActivosEscaladosByTareas(tareas)` toma las tareas que ya cargó el detalle (`useTareasIniciativa`), **descarta las Canceladas** (regla en el servicio: FR-013, FR-023) y hace **una** consulta de riesgos con `TareaId` en el conjunto y `Estado ne 'Resuelto'`, más **una** de decisiones para los que requieren decisión. Como la iniciativa admite como máximo 10 tareas no canceladas (007, FR-010), el filtro tiene como máximo 10 condiciones.
- Dos métodos nuevos en los datasources: `RiesgoDataSource.getActivosEscaladosByTareas(tareaIds)` y `DecisionDataSource.getFilteredItemsByRiesgos(riesgoIds)`. La segunda divide en tandas de 40 Id para no pasar el largo de URL: el costo es una consulta por tanda, nunca una por riesgo. Se agregan a las interfaces y a los mocks.
- Los datos que se piden están acotados por el filtro; no se usa `getItems()` sin filtrar ni `getById` en bucle. Índices: V4.
- **Orden de las filas** (decidido el 2026-11-25): Escalados primero, después Activos y al final Resueltos, y dentro de cada grupo por ID ascendente. En la grilla de la iniciativa, el mismo criterio sin Resueltos. Se resuelve **en memoria**, con `ordenarRiesgos` (D6), y no en la consulta; lo aplica el servicio en `getByTarea` y en `getActivosEscaladosByTareas`, y las grillas muestran las filas en el orden recibido.
- Contadores: se calculan en memoria sobre el resultado de la iniciativa (`getIndicadoresRiesgos`, D6): activos y escalados por estado; decisiones pendientes = los que requieren decisión. Coinciden con la lista por construcción (Story 4 §8).

**D6. Reglas puras (`core/api/Riesgo/riesgoReglas.ts`).** Funciones sin acceso a datos ni a pantallas, que usan el servicio y las pantallas (un solo lugar):

- `TRANSICIONES_RIESGO` y `getEstadosDisponibles(estado)`: el actual más los permitidos (Activo: Activo, Escalado, Resuelto; Escalado: Escalado, Resuelto; Resuelto: ninguno); `isTransicionPermitida(desde, hasta)`.
- `isRiesgoEditable(riesgo, tarea)`: falso si el riesgo está Resuelto o su tarea Cancelada; **falso también si el estado no se pudo leer** (falla cerrado). En tarea Finalizada o iniciativa cerrada sigue editable.
- `canCargarRiesgo(tarea, iniciativa)`: tarea ni Finalizada ni Cancelada e iniciativa ni Finalizada ni Cancelada.
- `isRequiereDecisionFijo(decision)`: hay decisión guardada.
- `getFechaLimiteIssue(fecha, fechaGuardada, hoy)`: obligatoria con Sí; no anterior a hoy salvo que sea igual a la guardada (FR-010a). "Hoy" es la fecha local del navegador, comparada por día, y hoy se acepta.
- `getDescripcionIssue`, `getDecisionIssue`: obligatorios.
- `isDecisionPendiente(riesgo)`: `RequiereDecision` y no Resuelto (FR-008a).
- `getIndicadoresRiesgos(riesgos)`: `{ activos, escalados, decisionesPendientes }`.
- `ordenarRiesgos(items)`: Escalado, Activo, Resuelto (un estado no leído, al final) y, dentro de cada grupo, por `Id` ascendente (D5).
- `recortarTitulo(texto)`: máximo 255.
- `getEstadoRiesgoChipColor(estado)` y `formatRiesgoId` van en `webparts/.../Riesgo/riesgoUtils.ts` (solo pantallas), como `getEstadoTareaChipColor` y `formatTareaId`.

El archivo está en `core/api/Riesgo` y no en `webparts` porque el servicio no puede depender de `webparts`. No se modifica `Constants.ts` (el enum `EstadoRiesgo` ya existe; las constantes son locales del módulo).

**D7. Errores de guardado y reintento (Story 1 §8, Story 3 §11).**

- Validación en la pantalla: los mismos issues de `riesgoReglas.ts` muestran el error en el campo antes de llamar al servicio. Si el servicio rechaza igual (porque el estado cambió desde que se abrió el panel), el panel muestra el texto de la regla incumplida (`RiesgoRuleError`) y no guarda.
- Error de guardado: `MessageBar` `type="error"` de una línea (`RiesgoSaveError`), el panel conserva lo ingresado y la persona reintenta volviendo a pulsar **Guardar**, igual que los paneles de la 007. Si el servicio informa `revertido: false`, el texto cambia (`RiesgoSaveIncompleteError`): avisa que el riesgo y su decisión pueden haber quedado a medias y pide reintentar. El `pendiente` del alta se retiene en `useRef`. No hay botón nuevo en el panel (decidido el 2026-11-25).
- Después de un guardado exitoso: `onSaved` recarga la sección y la pantalla muestra `SuccessNotice` con el mensaje de FR-024; al pasar de Activo a Escalado, «El riesgo "[descripción]" se ha escalado correctamente.» (el del prototipo sin la mención al mail).

**D8. Detalle de la tarea (FR-021, FR-021a, FR-022).** `TareaDetalle` suma `useRiesgosTarea(tareaId)` y un componente hermano `TareaRiesgos` después de `TareaComentario`; no se tocan `TareaInfo` ni `TareaComentario`. El pie suma "Cargar riesgo" a continuación de "Registrar avance". `TareaDetalle` recibe `canCreateRiesgo` y `canEditRiesgo`. Abre `RiesgoFormPanel` para el alta y para la edición. Al guardar recarga la sección.

**D9. Detalle de la iniciativa (FR-013, FR-023).** `IniciativaDetalle` suma `useRiesgosIniciativa(tareas)`, que depende de las tareas ya cargadas (no repite esa consulta), y renderiza al final `IniciativaRiesgos`. `IniciativaTareasIndicadores` recibe `riesgos?` (los tres contadores) y los muestra a continuación de los estados. Si la carga de riesgos falla, `MessageBar` de error con "Reintentar" en lugar de la sección y los contadores (no se muestra 0 como si no hubiera datos), igual que `TareasLoadError`. Ver una fila navega al detalle de la tarea.

**D10. Localización.** Un solo archivo de idioma, `loc/en-us.js`, más `loc/mystrings.d.ts` (como la 007, D11). Textos tomados del prototipo (FR-024) con las excepciones de la spec (escalado sin mail, error de fecha) y los textos propios que el prototipo no tiene (errores de guardado y de regla, error de carga de riesgos). Lista de claves en [contracts/ui-contracts.md](./contracts/ui-contracts.md#textos-de-localización).

**D11. Permisos (FR-018, FR-019).** Dos constantes en `ObjetivosVp.tsx`, todas en `true` hasta RF-19, como la 007 (D9): `CAN_CREATE_RIESGO` (cargar: pie del detalle de la tarea) y `CAN_EDIT_RIESGO` (lápiz de edición de cada riesgo). Bajan por props a `TareaDetalle` (`canCreateRiesgo`, `canEditRiesgo`). No definen roles ni se verifican hoy (FR-019, SC-004). `RiesgoService` **no** las recibe: las reglas de estado y de cierre valen siempre, para cualquier persona. El bloqueo por rol y el rechazo del guardado sin permiso se agregan cuando RF-19 exista; el servicio es el lugar donde se sumará.

**D12. Mocks (principio III).** `RiesgoMock` y `DecisionMock` (estado a nivel de módulo, como `TareaMock`) implementan las interfaces, incluidos los métodos nuevos. Datos en [data-model.md](./data-model.md#datos-de-los-mocks) para recorrer los escenarios de la spec sin SharePoint. Los fallos parciales del guardado no se simulan con código de prueba: se verifican en el workbench bloqueando la petición a una de las dos listas (ver [quickstart.md](./quickstart.md)).

*Nota*: `RiesgoService` no tiene mock propio; se prueba con los mocks de sus datasources (`RiesgoMock`, `DecisionMock`, `TareaMock` e `IniciativaMock`), que `getRiesgoService()` elige fuera de SharePoint.

## Estructura de carpetas

```text
src/core/
├── api/
│   ├── Riesgo/
│   │   ├── IRiesgoDataSource.ts          (modifica: +getActivosEscaladosByTareas)
│   │   ├── RiesgoDataSource.ts           (modifica: implementa el método nuevo)
│   │   ├── RiesgoMock.ts                 (nuevo)
│   │   ├── IRiesgoService.ts             (nuevo: contrato, tipos y errores)
│   │   ├── RiesgoService.ts              (nuevo: servicio y getRiesgoService)
│   │   ├── riesgoReglas.ts               (nuevo: reglas puras)
│   │   ├── useRiesgosTarea.ts            (nuevo)
│   │   └── useRiesgosIniciativa.ts       (nuevo)
│   └── Decision/
│       ├── IDecisionDataSource.ts        (modifica: +getFilteredItemsByRiesgos)
│       ├── DecisionDataSource.ts         (modifica: select sin Responsable ni FechaResolucion; método nuevo)
│       └── DecisionMock.ts               (nuevo)
└── entities/
    └── Decision.ts                       (modifica: sin Responsable ni FechaResolucion)

src/webparts/objetivosVp/
├── components/
│   ├── ObjetivosVp/ObjetivosVp.tsx       (modifica: CAN_CREATE_RIESGO y CAN_EDIT_RIESGO; props a TareaDetalle)
│   ├── Riesgo/
│   │   ├── riesgoUtils.ts                (nuevo: formatRiesgoId, color de chip, textos de estado)
│   │   ├── RiesgoForm/RiesgoFormPanel.tsx y RiesgoForm.tsx (+ .module.scss si hace falta)  (nuevo)
│   │   └── RiesgosTable/RiesgosTable.tsx (+ .module.scss)   (nuevo, variantes tarea e iniciativa)
│   ├── Tarea/TareaDetalle/
│   │   ├── TareaDetalle.tsx              (modifica: hook, sección, pie y panel)
│   │   └── TareaRiesgos/TareaRiesgos.tsx (nuevo)
│   └── Iniciativa/IniciativaDetalle/
│       ├── IniciativaDetalle.tsx         (modifica: hook, sección y error)
│       ├── IniciativaRiesgos/IniciativaRiesgos.tsx   (nuevo)
│       └── IniciativaTareasIndicadores/IniciativaTareasIndicadores.tsx   (modifica: prop riesgos)
└── loc/mystrings.d.ts y en-us.js         (modifica: claves Riesgo*)
```

Sin rutas nuevas. Los hooks existentes `useRiesgoDataSource`, `useItemRiesgoDataSource`, `useDecisionDataSource` y `useItemDecisionDataSource` no se tocan: ninguna pantalla los usa (H10).

## Orden de implementación

| Paso | Qué | Depende de |
|---|---|---|
| 1 | `Decision.ts` y `DecisionDataSource.ts` (D1) y métodos nuevos de lectura en las dos interfaces y datasources (D5). | — |
| 2 | `riesgoReglas.ts` (D6). | — |
| 3 | `RiesgoMock` y `DecisionMock` (D12). | 1 |
| 4 | `IRiesgoService`, `RiesgoService` y errores (D2, D3, D4). | 1, 2, 3 |
| 5 | `useRiesgosTarea` y `useRiesgosIniciativa`. | 4 |
| 6 | `riesgoUtils.ts` y claves `Riesgo*` de `loc/` (D10). | 2 |
| 7 | `RiesgosTable`. | 5, 6 |
| 8 | `RiesgoFormPanel` (alta y edición). | 4, 6 |
| 9 | Constantes `CAN_*` y sección + pie + panel en `TareaDetalle` (D8, D11). | 7, 8 |
| 10 | Sección y contadores en `IniciativaDetalle` (D9). | 7 |
| 11 | Registrar los cambios de `core` en `docs/plantilla-cambios.md` y correr el [quickstart](./quickstart.md). | todos |

Cada paso cierra con `npm run build` (principio V).

## Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | Fallo parcial entre las dos listas sin posibilidad de revertir. | Reversión con reintento y aviso distinto (D3, D7); un riesgo que requiere decisión y quedó sin ella sigue editable para completarla; solo el aviso, sin marca en la grilla (D3). |
| R2 | Las reglas se validan sobre una lectura previa, no de forma atómica. | Aceptado, como en la 007 (R2): la spec establece "último guardado gana" (Edge Cases). |
| R3 | URL larga o tope de lista con muchos riesgos. | Filtros acotados a 10 tareas; decisiones en tandas de 40; índices V4. |
| R4 | Valores de la lista `Riesgo.Estado` distintos de los del enum. | `assertChoiceValue` rechaza al escribir; `toChoiceValue` avisa y devuelve vacío al leer y el riesgo se trata como no editable. Verificación V1. |
| R5 | Fecha límite de solo fecha con corrimiento por zona horaria. | Mismo tratamiento que las fechas de la 007 (`toDateInput` / `fromDateInput`); verificación V5. |
| R6 | `Descripcion` como texto enriquecido (HTML). | Verificación V6: debe ser texto sin formato; la aplicación lo muestra como texto, nunca como HTML. |

## A confirmar

| # | Punto | Propuesta del plan |
|---|---|---|
| A1 | Variante visual del botón "Cargar riesgo". | `secondary` (decidido el 2026-11-25). |
| A2 | Tarjeta de indicadores con `Field`. | Mismo criterio de la 007. |
| A3 | Lista desplegable para Sí/No. | `Dropdown` del DS. |

## Puntos que requieren una decisión de la usuaria

Resueltos el 2026-11-25.

## Verificaciones a cargo de la usuaria

El código no crea ni modifica listas ni columnas. Antes de la primera prueba en el sitio de desarrollo, y de nuevo en cada sitio antes de desplegar, la usuaria verifica en SharePoint (lista > Configuración de la lista) y anota el resultado en [research.md](./research.md#verificaciones-pendientes-a-cargo-de-la-usuaria):

| # | Verificación | Por qué |
|---|---|---|
| V1 | `Riesgo.Estado` (opción) tiene **exactamente** los valores `Activo`, `Escalado` y `Resuelto`, sin otros ni variantes (H9). | `assertChoiceValue` solo comprueba contra el enum del código. |
| V2 | En `Decision`, `Responsable` y `FechaResolucion` **no son obligatorias**; `Title` sí puede serlo (lo escribe el servicio). En `Riesgo`, `FechaResolucion` no es obligatoria. | La app no escribe esas columnas (D1). |
| V3 | Nombres internos: `Riesgo`: `Tarea`, `Estado`, `RequiereDecision`, `FechaResolucion`, `Descripcion`; `Decision`: `DecisionNecesaria`, `Riesgo`, `FechaLimite`. | Los datasources los usan tal cual. |
| V4 | Índices: `Riesgo.Tarea` y `Decision.Riesgo`. | Los filtros de D5 usan esas columnas. |
| V5 | Tipo de `Decision.FechaLimite` (solo fecha) y de `Riesgo.FechaResolucion` (fecha y hora o solo fecha). | La regla "no anterior a hoy" compara por día. |
| V6 | `Riesgo.Descripcion` y `Decision.DecisionNecesaria` son texto sin formato (no texto enriquecido), de varias líneas. | Evita HTML en datos; seguridad. |
| V7 | `Riesgo.RequiereDecision` es sí/no, con valor por defecto "No" o no obligatoria. | El alta siempre lo envía; protege los datos de otras vías. |
| V8 | `Riesgo.Tarea` y `Decision.Riesgo` son un único valor (no múltiple) y la relación no elimina en cascada ni restringe borrados de forma que impida la reversión interna. **Además, quien carga riesgos y decisiones debe poder eliminar los elementos que creó** (los permisos de la lista y del sitio lo permiten a ese grupo de personas). | La reversión borra el registro recién creado (D4) y depende de ese permiso: sin él, un fallo parcial dejaría datos a medias. |

## Complexity Tracking

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|-----------|----------------------|-------------------------------------------|
| Capa de servicio nueva (`RiesgoService`, `riesgoReglas.ts`, errores) y 7 archivos nuevos en `core/api` (principio IV) | El encargo exige que las reglas de estado, de fecha, de cierre y de solo lectura se validen fuera de la interfaz, y FR-008b exige el todo o nada entre dos listas, que no se puede resolver en un panel. | Validar en el panel y guardar con los hooks del datasource: las reglas dependerían de la pantalla y cada pantalla repetiría la reversión. |
| `Decision.ts`, `DecisionDataSource.ts`, `IDecisionDataSource.ts`, `IRiesgoDataSource.ts` y `RiesgoDataSource.ts` modificados (principio IV) | Dejar de leer y escribir `Responsable` y `FechaResolucion` (H2) y leer por varios Id sin N+1 (H7). | Dejar la entidad y consultar por tarea o por riesgo: viola FR-015, FR-016 y el pedido de no hacer N+1. |
| Reglas puras en `core/api/Riesgo` en vez de `webparts` (principio IV) | El servicio no puede importar de `webparts`. | Duplicar las reglas en la pantalla y en el servicio. |
| Pieza `RiesgosTable` con dos variantes (principio IV) | Mismas filas y chips con columnas distintas, como `TareasTable`. | Dos componentes casi iguales. |
| `Field` como tarjeta de indicador y `Dropdown` para Sí/No (principio II) | El DS no tiene esas piezas (A2, A3). | Piezas propias: viola el principio II. |
| Se mantienen los desvíos de la 007 que alcanzan a estas pantallas (panel lateral para un flujo que el prototipo resuelve con modal, error de fecha bajo `Picker`) | FR-046 de la 007. | — |

## Registro en `docs/plantilla-cambios.md`

Filas que debe agregar la implementación (paso 11), con la fecha del día en que se haga el cambio:

| Fecha | Archivo | Cambio | Motivo | Feature |
|---|---|---|---|---|
| (fecha del cambio) | `src/core/entities/Decision.ts` | Quita `Responsable` y `FechaResolucion` (propiedades, `mapItem` y `toListItem`). | La app no las usa (FR-015, FR-016). | 011-riesgos-decisiones |
| (fecha del cambio) | `src/core/api/Decision/DecisionDataSource.ts`, `IDecisionDataSource.ts` | El `select` deja de pedir `Responsable` y `FechaResolucion`; suma `getFilteredItemsByRiesgos` (por tandas). | Ídem y leer decisiones de varios riesgos sin N+1. | 011-riesgos-decisiones |
| (fecha del cambio) | `src/core/api/Riesgo/RiesgoDataSource.ts`, `IRiesgoDataSource.ts` | Suma `getActivosEscaladosByTareas`. | Riesgos activos y escalados de varias tareas con una consulta. | 011-riesgos-decisiones |
| (fecha del cambio) | `src/core/api/Riesgo/*` y `src/core/api/Decision/DecisionMock.ts` | Archivos nuevos: mocks, servicio, reglas, errores y lecturas. | Principio III, FR-008b y reglas fuera de la interfaz. | 011-riesgos-decisiones |
