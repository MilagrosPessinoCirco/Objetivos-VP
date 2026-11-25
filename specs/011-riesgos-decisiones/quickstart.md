# Quickstart: validación de Riesgos y decisiones

Guion de QA manual. Prerrequisitos y condiciones iguales a los del [quickstart de la 007](../007-tareas/quickstart.md): `npm ci`, workbench hospedado del sitio de desarrollo, escritura solo en las listas de desarrollo y con autorización. Esta feature no usa mocks: todo se prueba contra las listas del sitio de desarrollo. Los contratos están en [contracts/](./contracts/).

## Preparación

1. `npm run build` termina sin errores (corre `eslint` y `heft build`).
2. Con las listas de desarrollo (workbench hospedado) y autorización explícita para escribir en ellas: preparar riesgos y decisiones de cada tipo que usan los escenarios (los nombres RSK-nn y TAR-nn de abajo son ilustrativos): tarea En curso con un riesgo Escalado con decisión de fecha límite ya vencida y un riesgo Activo sin decisión; tarea En curso con un riesgo Activo con decisión; tarea Frenada con un riesgo Resuelto; tarea Finalizada con un riesgo Activo sin decisión; tarea Cancelada con un riesgo Activo con decisión; una tarea sin riesgos; una iniciativa sin riesgos.
3. Antes de cualquier prueba: haber hecho las verificaciones V1 a V8 del [plan](./plan.md#verificaciones-a-cargo-de-la-usuaria) y anotado el resultado en [research.md](./research.md#verificaciones-pendientes-a-cargo-de-la-usuaria).

## Escenarios (§1 a §6)

Cada uno se contrasta con la spec y el prototipo v11 (`docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`). Cada escenario que escribe deja datos en las listas de desarrollo: anotar qué se creó o cambió para dejarlo como estaba.

### 1. Ver los riesgos de la tarea (Story 2)

- TAR-02: sección "Riesgos (2)" expandida, sin lápiz de sección, sin leyenda del mail. Orden: primero RSK-02 (Escalado) y después RSK-01 (Activo). Columnas ID, Riesgo, Requiere decisión, Decisión necesaria, Fecha límite, Estado, Acción. RSK-01 con "—" en decisión y fecha; RSK-02 con decisión y fecha 01/10/2026 en formato dd/mm/aaaa.
- TAR-04: «Esta tarea no tiene riesgos cargados. Cuando se carguen, van a aparecer acá.» y contador en 0.
- TAR-05: RSK-04 Resuelto sin lápiz (en su lugar, "—").
- TAR-07 (Cancelada): RSK-06 visible, sin lápiz y sin "Cargar riesgo" en el pie.

### 2. Cargar un riesgo (Story 1)

- En TAR-04, "Cargar riesgo" en el pie, como botón `secondary` (a continuación de "Registrar avance"): panel "Cargar riesgo", subtítulo "TAR-04 · nombre", Estado "Activo" en solo lectura, Requiere decisión "No", sin campos de decisión.
- Guardar vacío: «Este campo es obligatorio.» en Descripción. Con "Sí": aparecen Decisión necesaria y Fecha límite, obligatorias. Volver a "No": desaparecen.
- Fecha límite del día de ayer: «La fecha límite no puede ser anterior a hoy.». Con la fecha de hoy: se acepta.
- Guardar válido sin decisión y otro con decisión: «El riesgo "…" se ha cargado correctamente.»; dos IDs `RSK-NN` consecutivos, estado Activo; contador "Riesgos (2)".

### 3. Editar y cambiar de estado (Story 3)

- RSK-01 (Activo): el desplegable ofrece Activo, Escalado y Resuelto. Pasarlo a Escalado: «El riesgo "…" se ha escalado correctamente.» (con la descripción entre comillas y sin mención al mail). Reabrirlo: ofrece Escalado y Resuelto (no Activo).
- Resolverlo: queda Resuelto, sin lápiz. Editar la descripción y resolver en el mismo guardado: se aplican los dos cambios.
- RSK-02 (decisión con fecha vencida): editar solo la descripción y guardar: se acepta aunque la fecha esté vencida. Cambiar la fecha a una anterior a hoy: «La fecha límite no puede ser anterior a hoy.». Requiere decisión aparece en "Sí" y no se puede cambiar. Decisión necesaria y Fecha límite son editables.
- RSK-05 (sin decisión, en TAR-01): pasar Requiere decisión a "Sí", completar y guardar: se crea la decisión (aparece en la grilla). Verificar que no se puede volver a "No".

### 4. Cierre de la tarea o de la iniciativa (FR-011)

- TAR-01 (Finalizada): sin "Cargar riesgo"; RSK-05 sigue editable (escalar o resolver).
- TAR-07 (Cancelada): RSK-06 sin lápiz.
- Cambiar la iniciativa 1 a Finalizada ("Cambiar estado") y abrir TAR-02: sin "Cargar riesgo"; RSK-01, RSK-02 y RSK-03 siguen editables. Reabrir la iniciativa y verificar que vuelve "Cargar riesgo" en las tareas abiertas.

### 5. Detalle de la iniciativa (Story 4)

- Iniciativa 1: "Indicadores de las tareas" con los 5 estados y, a continuación, **Riesgos activos 3**, **Riesgos escalados 1**, **Decisiones pendientes 2**. "Riesgos de sus tareas (4)" **contraída** al entrar, sin lápiz; al expandir, en este orden: RSK-02 (Escalado), RSK-01, RSK-03 y RSK-05 (Activos, por ID), cada uno con su tarea (ID · nombre); no figuran RSK-04 (Resuelto) ni RSK-06 (tarea Cancelada). "Ver" abre la tarea y Volver regresa.
- Resolver RSK-02 desde su tarea y volver: Riesgos escalados 0, Decisiones pendientes 1, lista de 3.
- Iniciativa 4: contadores de riesgos en 0 y «Las tareas de esta iniciativa no tienen riesgos cargados. Cuando se carguen, van a aparecer acá.».
- La lista no tiene paginador.

### 6. Permisos (Story 5, FR-019)

- Con `CAN_CREATE_RIESGO` y `CAN_EDIT_RIESGO` en `true` (valor entregado) todo lo anterior se ve. Cambiar temporalmente una a `false` y verificar que se oculta "Cargar riesgo" o el lápiz. **Volver a `true`**: no se entregan cambios en esas constantes. El bloqueo efectivo por rol y el rechazo del guardado sin permiso **no se verifican** en esta feature (RF-19).

## Escenarios (§7 y §8: fallos parciales y reglas del servicio)

No se pueden forzar desde la interfaz: hace falta bloquear una de las listas o cambiar un estado desde otra pestaña. Exigen la precondición V1 a V8 del plan, autorización explícita y escribir solo en las listas de desarrollo. Son los de T044.

### 7. Fallos parciales y todo o nada (FR-008b)

Se verifican en el workbench hospedado, sin código de prueba: en las herramientas del navegador, bloquear la URL de la lista `Decision` (por ejemplo, con "Block request URL" sobre `…/lists/getbytitle('Decision')/items`).

- **Alta con decisión, con `Decision` bloqueada**: aparece `RiesgoSaveError`; en la lista `Riesgo` no queda el riesgo (el servicio lo borró). Desbloquear y volver a Guardar: se crea el riesgo y la decisión, sin duplicados.
- **Alta con decisión, bloqueando también el borrado del riesgo**: aparece `RiesgoSaveIncompleteError`; el riesgo queda sin decisión. Desbloquear y Guardar de nuevo sin cerrar el panel: el servicio consulta las decisiones del riesgo, crea solo la decisión y no crea un segundo riesgo. Si se cierra el panel en lugar de reintentar, el riesgo queda sin decisión y sin marca en la grilla: al editarlo aparecen los campos de la decisión vacíos y obligatorios.
- **Edición de riesgo y decisión, con la lista `Riesgo` bloqueada**: la decisión vuelve a sus valores anteriores y el riesgo no cambia.
- Verificar que, tras una reversión, `Modified` y `Editor` del registro quedan con la fecha y el autor de la reversión (límite aceptado).
- Con una cuenta que carga riesgos, verificar que puede eliminar los elementos que creó (V8); sin ese permiso, la reversión no funciona.
- Anotar en cada caso qué quedó en cada lista.

### 8. Reglas en el servicio, no solo en la interfaz (FR-009, FR-009a, FR-011, SC-007)

Junto a los fallos parciales de §7:

- Con el panel de edición de un riesgo abierto, cambiar su estado desde otra pestaña y volver a guardar: el servicio rechaza con `RiesgoRuleError` y no escribe.
- Con el panel de "Cargar riesgo" abierto, finalizar la tarea o la iniciativa desde otra pestaña y guardar: se rechaza el alta.
- Verificar en las listas que la `FechaResolucion` queda escrita al resolver y no cambia en ediciones posteriores (V5 por el tipo de columna). No se muestra en ninguna pantalla (FR-014).

## Comprobaciones transversales

- Sin acción de eliminar riesgos o decisiones en ninguna pantalla (FR-007); el servicio solo borra para deshacer.
- Rendimiento (T044): detalle de la tarea y de la iniciativa en menos de 3 s con el volumen de un año; en la pestaña Red, riesgos y decisiones suman 2 consultas por detalle (sin una por riesgo).
- Ningún texto con la palabra "mail" ni leyenda sobre el mail (FR-012).
- Sin colores, tipografías ni espaciados fuera del Design System.
- Textos de `loc/` coinciden con [contracts/ui-contracts.md](./contracts/ui-contracts.md#textos-de-localización).
