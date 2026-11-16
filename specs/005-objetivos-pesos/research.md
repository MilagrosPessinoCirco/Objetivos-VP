# Research: Ajustes de objetivos de la reunión 6

No quedaron NEEDS CLARIFICATION en el Technical Context. Las decisiones se basan en el código de la 003 y en el prototipo v5.

| # | Tema | Decisión | Motivo | Alternativas descartadas |
|---|---|---|---|---|
| R1 | Dónde guardar el peso en la VP | En una columna nueva `PesoVP` (Número, 1 a 100), en la lista `Objetivo`. Requiere aprobación (plan, P1). | La spec establece que `Peso` pasa a ser el peso en el departamento y que el peso en la VP es independiente (FR-006). | Reutilizar `Peso` y calcular el otro: contradice FR-006. Guardar los dos en un texto: rompe el tipo y los cálculos de C-05. |
| R2 | Cantidad de años | Se usa `CantidadAnios`, que ya existe en la entidad, el datasource y la lista. | Evita una columna nueva. La 003 la dejó sin usar (R8 de la 003). | Columna nueva: duplica un dato que ya existe. |
| R3 | Borrar valores al editar | Se envía `null` en `PesoVP` y `CantidadAnios` cuando no aplican. | PnPjs serializa el cuerpo con `JSON.stringify`, que omite `undefined`: al editar, el valor anterior quedaría guardado. | Leer y comparar antes de guardar: más complejo y con el mismo resultado. |
| R4 | Marca en objetivos de otra VP | Se guarda `EsDeVp = false`. | El formulario actual guarda la marca para cualquier VP (H2), y FR-009 lo prohíbe. | Enviar `undefined`: en el alta deja la columna con su valor por defecto. Es equivalente, pero `false` es explícito. |
| R5 | Datos que ya existían con la marca y sin peso en la VP | No se migran. El detalle muestra "—" y el formulario exige el peso al editar. | Lo indica la spec (Edge Cases). Migrar sin el valor del comité sería inventar datos. | Asignar un peso por defecto: no hay un valor válido. |
| R6 | Objetivos de otra VP que quedaron marcados por el error del formulario | Se corrigen en la lista de desarrollo: `EsDelVp` pasa a No y `PesoVP` queda vacío, informando cuántos se corrigieron (plan, P3). Lo pidió y lo autorizó la usuaria el 2026-11-16. | Deja los datos de acuerdo con FR-009. Además, evita que C-05 o el tablero los cuenten en el futuro si filtran solo por la marca. | Dejarlos como están: no se ven hoy, pero quedan datos incoherentes. Corregirlos con un script: requiere una herramienta que el repo no tiene. |
| R7 | Componente para cantidad de años | `Dropdown` del DS, con opciones 2 a 5. | El prototipo usa un `select`, igual que Duración y Palanca. | `SpinButton`: permitiría valores fuera de 2 a 5. |
| R8 | Componente para el peso en la VP | `SpinButton` del DS, igual que el peso en el departamento, con `min=1`. | Mantiene la consistencia entre los dos pesos. | — |
| R9 | Formato de los pesos | En las tablas, `N%`; en el detalle, `N %`. | Es el formato que ya usa cada lugar (H6 del plan). | Unificarlos: cambiaría pantallas que la spec no toca. |
