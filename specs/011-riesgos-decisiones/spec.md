# Feature Specification: Riesgos y decisiones (carga y edición desde la tarea, y vista en la iniciativa)

**Feature Branch**: `011-riesgos-decisiones`

**Created**: 2026-11-25

**Status**: Clarified

**Input**: User description: "Módulo Riesgos y decisiones (RF-14 de la especificación funcional v1.10 de Gestión de Portfolio VP). Los riesgos se cargan en la tarea, porque quien la ejecuta es quien detecta el problema. Una tarea puede tener varios riesgos. Un riesgo puede requerir una decisión, que se describe en texto (qué se necesita y de quién) y siempre se eleva al accountable de la iniciativa de la tarea. El objetivo es que un bloqueo llegue a quien puede destrabarlo y que quede registrado hasta resolverse."

**Fuente vigente**: `docs/especificacion-funcional.md` (RF-14, con la figura 3 para los estados del riesgo; RF-11 para la vista de la iniciativa). Las reglas de negocio salen de ahí y de esta descripción; el prototipo aporta el diseño de las pantallas. Ante una diferencia entre el prototipo y esta spec, prevalece esta spec.

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, que contiene el prototipo v11 (19/11/2026) aunque el nombre de la carpeta diga v5 (es la misma cita que usa la spec 007 y la que figura en las instrucciones del repositorio). Pantallas tomadas: sección colapsable "Riesgos (N)" del detalle de la tarea, panel lateral "Cargar riesgo", panel "Editar riesgo RSK-NN" y sección "Riesgos de sus tareas" del detalle de la iniciativa.

**Modifica**:
- `specs/007-tareas/spec.md`, historia 3, escenario 12 (el detalle de la tarea no mostraba Riesgos ni "Cargar riesgo": ahora suma la sección "Riesgos"), escenario 14 (el pie fijo del detalle de la tarea suma "Cargar riesgo" a continuación de "Registrar avance") y escenario 15 (en una tarea Cancelada siguen sin ofrecerse Editar, Registrar avance ni los lápices de las secciones; los riesgos existentes se ven en solo lectura, FR-011).
- `specs/007-tareas/spec.md`, FR-042 y SC-009 y la historia 7, escenarios 2 y 3 (el detalle de la iniciativa no mostraba riesgos, decisiones ni los demás indicadores de C-08: ahora suma la sección "Riesgos de sus tareas" y, en "Indicadores de las tareas", los contadores de riesgos activos, riesgos escalados y decisiones pendientes, que valen 0 cuando no hay).
- `specs/004-iniciativas/spec.md`, FR-034, solo en la parte de **riesgos** (la 007 ya la modificó para las tareas y sus indicadores): el detalle de la iniciativa deja de excluir los riesgos.

Todo lo que esta spec no cambia sigue rigiendo como lo definen esas specs.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cargar un riesgo en una tarea, con su decisión si la requiere (Priority: P1)

La persona que ejecuta una tarea detecta un problema y abre "Cargar riesgo" desde el pie fijo del detalle de la tarea. En un panel lateral con la tarea como subtítulo, describe el riesgo e indica si requiere una decisión. Si la requiere, describe qué decisión se necesita y de quién, y la fecha límite para tomarla. Guarda una sola vez y el riesgo queda registrado como Activo, con su decisión.

**Why this priority**: Es el objetivo de la feature: que un bloqueo quede registrado y llegue al accountable de la iniciativa. Sin la carga no hay nada que seguir ni mostrar.

**Independent Test**: Desde el detalle de una tarea, cargar un riesgo sin decisión y otro con decisión; verificar el mensaje de éxito, que ambos aparecen en la grilla con ID RSK-NN y estado Activo, que el contador de la sección sube y que no se puede guardar con campos obligatorios vacíos.

**Acceptance Scenarios**:

1. **Given** el pie fijo del detalle de una tarea, **When** la persona con permiso elige "Cargar riesgo", **Then** se abre un panel lateral titulado "Cargar riesgo", con el ID y el nombre de la tarea como subtítulo, con los botones Cancelar y Guardar.
2. **Given** el panel de alta, **When** se muestra, **Then** ve Descripción, Estado en solo lectura con el valor "Activo" y Requiere decisión con el valor "No" por defecto; no ve Decisión necesaria ni Fecha límite.
3. **Given** el panel de alta, **When** la persona cambia Requiere decisión a "Sí", **Then** aparecen Decisión necesaria y Fecha límite de la decisión; si lo vuelve a "No", desaparecen.
4. **Given** el panel con campos obligatorios vacíos, **When** la persona elige Guardar, **Then** no se guarda y cada campo vacío muestra "Este campo es obligatorio."; Decisión necesaria y Fecha límite son obligatorias solo si Requiere decisión es "Sí".
5. **Given** el panel completo y válido, **When** la persona elige Guardar, **Then** el riesgo se registra con estado "Activo", con un ID RSK-NN asignado por el sistema, vinculado a la tarea del contexto; si requiere decisión, la decisión se registra junto con él, en la misma operación; el panel se cierra y la persona ve «El riesgo "[descripción]" se ha cargado correctamente.».
6. **Given** el panel de alta, **When** la persona elige Cancelar, **Then** el panel se cierra y no se registra nada.
7. **Given** la fecha límite de la decisión, **When** se carga o se muestra, **Then** usa el formato dd/mm/aaaa.
8. **Given** un guardado que falla, **When** el sistema no puede registrar el riesgo o su decisión, **Then** no queda registrado un riesgo sin su decisión (o una decisión sin su riesgo) y la persona ve un aviso con la opción de reintentar; el panel conserva lo ingresado.
9. **Given** el detalle de una tarea Finalizada o Cancelada, o de una tarea de una iniciativa Finalizada o Cancelada, **When** se observa el pie fijo, **Then** no se ve "Cargar riesgo" y, si se intenta el alta por otra vía, el sistema la rechaza.
10. **Given** el panel de alta con Requiere decisión en "Sí", **When** la Fecha límite de la decisión es anterior a hoy, **Then** no se guarda y el campo muestra «La fecha límite no puede ser anterior a hoy.». El propio día de hoy se acepta.

---

### User Story 2 - Ver los riesgos de una tarea en su detalle (Priority: P1)

En el detalle de la tarea, la persona ve una sección colapsable "Riesgos (N)" y una grilla con los riesgos de la tarea, sus decisiones, fechas límite y estados. Si no hay riesgos, ve un estado vacío.

**Why this priority**: Es donde toda la VP lee los riesgos de una tarea y donde nace el seguimiento; sin esta lectura la carga no tiene retorno.

**Independent Test**: Abrir el detalle de una tarea con tres riesgos (uno sin decisión, uno con decisión y uno Resuelto) y de otra sin riesgos; verificar el contador, las columnas, los valores "—" donde corresponde y el estado vacío.

**Acceptance Scenarios**:

1. **Given** el detalle de una tarea, **When** se muestra, **Then** hay una sección colapsable "Riesgos (N)", donde N es la cantidad de riesgos de la tarea (de cualquier estado), sin leyenda sobre el mail al escalar (esa leyenda se agrega con la spec de Alertas, cuando el mail exista). La sección tiene título "Riesgos (N)" y chevron para contraer y expandir, está expandida al entrar y no tiene lápiz de sección: los riesgos se cargan con "Cargar riesgo" del pie fijo y se editan con el lápiz de cada fila. N incluye los riesgos de cualquier estado, también los de una tarea Cancelada, que se siguen viendo en su detalle.
2. **Given** una tarea con riesgos, **When** se muestra la sección, **Then** la grilla tiene las columnas ID (RSK-NN), Riesgo, Requiere decisión (Sí/No), Decisión necesaria, Fecha límite, Estado (badge) y Acción (lápiz para editar).
3. **Given** un riesgo que no requiere decisión, **When** se muestra en la grilla, **Then** Decisión necesaria y Fecha límite muestran "—".
4. **Given** una tarea sin riesgos, **When** se muestra la sección, **Then** el contador es 0 y se ve «Esta tarea no tiene riesgos cargados. Cuando se carguen, van a aparecer acá.».
5. **Given** cualquier usuario de la VP, incluido el Visualizador, **When** abre el detalle de una tarea, **Then** ve los riesgos y las decisiones de la tarea.
6. **Given** una persona sin permiso para cargar o editar, **When** se muestra el detalle de la tarea, **Then** no ve el botón "Cargar riesgo" ni los lápices de edición (su efectivo bloqueo por rol se verifica con RF-19, FR-019).
7. **Given** un riesgo Resuelto, o cualquier riesgo de una tarea Cancelada, **When** se muestra en la grilla, **Then** no muestra el lápiz de edición, aunque la persona tenga permiso.
8. **Given** una tarea con muchos riesgos, **When** se muestra la sección, **Then** la grilla los lista todos, sin paginación.
9. **Given** la sección de riesgos, **When** se observa, **Then** es una sección independiente del detalle, en línea con el escenario 12 de la historia 3 de la spec 007: agregarla no obliga a modificar las secciones existentes.

---

### User Story 3 - Editar un riesgo y su decisión, incluido el cambio de estado (Priority: P1)

La persona abre el lápiz de un riesgo y, en el panel "Editar riesgo RSK-NN", modifica la descripción, el estado, si requiere decisión y los datos de la decisión. El riesgo y su decisión se editan juntos, con un solo Guardar. Al pasar el riesgo a Resuelto, el sistema registra la fecha de resolución.

**Why this priority**: Un riesgo vive hasta resolverse: sin poder escalarlo y resolverlo, el registro pierde su razón de ser.

**Independent Test**: Editar un riesgo Activo: cambiar la descripción, escalarlo y luego resolverlo; verificar cada cambio en la grilla, la fecha de resolución registrada al resolver, que las transiciones fuera de las permitidas no se pueden registrar y que el estado, la decisión y la fecha de última modificación se actualizan.

**Acceptance Scenarios**:

1. **Given** un riesgo en la grilla, **When** la persona con permiso elige el lápiz, **Then** se abre el panel "Editar riesgo RSK-NN" con los mismos campos que el alta, con los valores actuales y el Estado editable.
2. **Given** el panel de edición, **When** la persona modifica la descripción y guarda, **Then** el cambio queda registrado y se ve en la grilla, con el mensaje «El riesgo "[descripción]" se ha actualizado correctamente.».
3. **Given** un riesgo Activo, **When** la persona lo pasa a Escalado y guarda, **Then** el estado queda Escalado y la persona ve «El riesgo "[descripción]" se ha escalado correctamente.», sin mención al mail; este módulo solo registra el cambio de estado (el mail está fuera de alcance).
4. **Given** un riesgo Activo o Escalado, **When** la persona lo pasa a Resuelto y guarda, **Then** el estado queda Resuelto y el sistema registra la fecha de resolución, que es la del guardado y no cambia después.
4a. **Given** el panel de edición, **When** la persona modifica otros campos y a la vez pasa el riesgo a Resuelto, **Then** se guardan juntos, en un solo Guardar.
5. **Given** el panel de edición de un riesgo, **When** la persona abre el campo Estado, **Then** ofrece solo el estado actual y los permitidos: un riesgo Activo ofrece Activo, Escalado y Resuelto; uno Escalado ofrece Escalado y Resuelto.
5a. **Given** un guardado con una transición no permitida (Escalado → Activo o cualquier salida de Resuelto), **When** el sistema lo recibe por cualquier vía, **Then** lo rechaza y no se modifica nada.
5b. **Given** un riesgo Resuelto, **When** se muestra su fila, **Then** queda en solo lectura: no hay lápiz ni panel de edición, y el sistema rechaza cualquier guardado sobre él, junto con su decisión.
6. **Given** el panel de edición de un riesgo que no requería decisión, **When** la persona cambia Requiere decisión a "Sí", completa Decisión necesaria y Fecha límite y guarda, **Then** se registra la decisión vinculada al riesgo.
6a. **Given** un riesgo que ya tiene una decisión guardada, **When** se abre el panel de edición, **Then** Requiere decisión queda fijo en "Sí" y no se puede cambiar, mientras Decisión necesaria y Fecha límite siguen editables; si la decisión ya no hace falta, el riesgo se resuelve.
6b. **Given** una edición en la que la Fecha límite se carga o se modifica, **When** es anterior a hoy, **Then** no se guarda y el campo muestra «La fecha límite no puede ser anterior a hoy.»; si la fecha no se toca, se acepta aunque ya esté vencida. "Hoy" es la fecha local del navegador, la comparación es por día y el propio día de hoy se acepta. La fecha no se valida contra las fechas de la tarea.
6c. **Given** una tarea Finalizada, o una tarea de una iniciativa Finalizada o Cancelada, **When** se muestran sus riesgos Activos o Escalados, **Then** siguen editables (para escalarlos o resolverlos), pero no se admiten altas.
6d. **Given** una tarea Cancelada, **When** se muestran sus riesgos, **Then** quedan en solo lectura, sin lápiz, y el sistema rechaza cualquier guardado sobre ellos, coherente con la spec 007 (una tarea Cancelada no admite modificaciones).
7. **Given** el panel con campos obligatorios vacíos, **When** la persona elige Guardar, **Then** no se guarda y cada campo vacío muestra "Este campo es obligatorio.".
8. **Given** una edición guardada, **When** se registra, **Then** quedan actualizadas la fecha y el autor de última modificación del riesgo y, si se modificó, de su decisión. Tras una reversión por un fallo del guardado, la fecha y el autor de última modificación reflejan la reversión.
9. **Given** el panel de edición, **When** la persona elige Cancelar, **Then** se cierra y no se modifica nada.
10. **Given** el riesgo en edición, **When** se muestra el panel, **Then** la Tarea no se puede cambiar.
11. **Given** un guardado que falla, **When** el sistema no puede registrar el cambio, **Then** el riesgo y su decisión no quedan a medias y la persona ve un aviso con la opción de reintentar; el panel conserva lo ingresado.

---

### User Story 4 - Ver los riesgos de las tareas en el detalle de la iniciativa (Priority: P2)

En el detalle de la iniciativa (RF-11), el accountable y toda la VP ven los riesgos activos y escalados de sus tareas, con la tarea a la que pertenece cada uno, y los contadores de riesgos activos, riesgos escalados y decisiones pendientes, para saber qué bloqueos y decisiones esperan al accountable.

**Why this priority**: Cierra el objetivo de que el bloqueo llegue a quien puede destrabarlo. La carga y el seguimiento en la tarea ya aportan valor sin esta vista, por eso va después.

**Independent Test**: Abrir el detalle de una iniciativa con tareas que tienen riesgos Activos, Escalados y Resueltos; verificar que se listan solo los activos y escalados, cada uno con su tarea, y el estado vacío cuando no hay.

**Acceptance Scenarios**:

1. **Given** el detalle de una iniciativa, **When** se muestra, **Then** ve la sección "Riesgos de sus tareas (N)", con los riesgos activos y escalados de sus tareas, donde N es la cantidad de riesgos listados; la sección tiene chevron, está contraída al entrar (como en el prototipo) y no tiene lápiz de sección. La lista no se pagina.
2. **Given** la sección, **When** se muestra la grilla, **Then** cada riesgo muestra ID (RSK-NN), Riesgo, la Tarea a la que pertenece (ID · nombre), Decisión necesaria, Fecha límite y Estado, y un botón "Ver" que abre el detalle de la tarea.
3. **Given** riesgos Resueltos de sus tareas, **When** se muestra la sección, **Then** no se listan.
3a. **Given** riesgos de una tarea Cancelada, **When** se muestra la sección, **Then** no se listan ni se cuentan; los de una tarea Finalizada sí (si están Activos o Escalados).
4. **Given** una iniciativa cuyas tareas no tienen riesgos activos ni escalados, **When** se muestra la sección, **Then** se ve «Las tareas de esta iniciativa no tienen riesgos cargados. Cuando se carguen, van a aparecer acá.».
5. **Given** un riesgo de la sección, **When** la persona elige "Ver", **Then** navega al detalle de su tarea.
6. **Given** cualquier usuario de la VP, **When** abre el detalle de la iniciativa, **Then** ve la sección; la carga y la edición solo se hacen desde la tarea.
7. **Given** la sección "Indicadores de las tareas" del detalle de la iniciativa, **When** se muestra, **Then** suma, a continuación de las cantidades por estado, los contadores Riesgos activos, Riesgos escalados y Decisiones pendientes, que valen 0 si no hay.
8. **Given** los contadores, **When** se calculan, **Then** Riesgos activos y Riesgos escalados coinciden con la lista de la sección (suman la cantidad de riesgos listados), y Decisiones pendientes es el subconjunto de esos riesgos con Requiere decisión = Sí, por lo que no coincide con la lista. Ningún contador incluye riesgos Resueltos ni de tareas Canceladas.

---

### User Story 5 - Permisos sobre riesgos y decisiones (Priority: P1)

Toda la VP ve los riesgos y las decisiones. Cargan y editan riesgos el responsable de la tarea y el accountable de su iniciativa (rol Usuario), y los roles CargadorObjetivo y Administrador. El Visualizador solo consulta, aunque sea responsable de la tarea o accountable de la iniciativa. Esta feature usa el mismo mecanismo de permisos que la 007 (constantes `CAN_*`, hoy todas habilitadas): las reglas quedan definidas como regla de negocio y su bloqueo efectivo por rol, con el rechazo del guardado para quien no tiene permiso, se verifican cuando se implemente RF-19 (entrega 2).

**Why this priority**: Es una regla de negocio transversal a la carga y la edición, que RF-19 hará efectiva.

**Independent Test**: Hoy: verificar que las acciones de riesgos se rigen por constantes de permiso de la misma forma que las de tareas. Con RF-19: con un Visualizador, un Usuario ajeno a la tarea, el responsable de la tarea, el accountable de la iniciativa, un CargadorObjetivo y un Administrador, abrir la misma tarea y verificar quién ve los botones y que un guardado sin permiso es rechazado.

**Acceptance Scenarios**:

1. **Given** el responsable de la tarea, el accountable de su iniciativa, un CargadorObjetivo o un Administrador, **When** abren el detalle de la tarea, **Then** ven "Cargar riesgo" y el lápiz de edición de cada riesgo.
2. **Given** un Visualizador, o un Usuario que no es responsable de la tarea ni accountable de su iniciativa, **When** abre el detalle de la tarea, **Then** ve los riesgos y las decisiones pero no ve "Cargar riesgo" ni los lápices.
3. **Given** una persona sin permiso, **When** intenta guardar un riesgo o su edición, **Then** el sistema rechaza el guardado y no se registra ni modifica nada. Se verifica cuando se implemente RF-19; hoy no se exige (FR-019).
4. **Given** un Visualizador que es además responsable de la tarea o accountable de la iniciativa, **When** abre el detalle de la tarea, **Then** solo consulta: no ve "Cargar riesgo" ni los lápices.

---

### Edge Cases

- ¿Qué pasa si la tarea tiene muchos riesgos? La grilla del detalle de la tarea los lista todos, sin paginación.
- ¿Qué pasa si el responsable de la tarea o el accountable de la iniciativa cambian después de cargado un riesgo? Los permisos se evalúan con los vigentes al momento de ver o guardar (cuando RF-19 los haga efectivos); el riesgo no se reasigna.
- ¿Qué pasa si en el alta la persona completa Decisión necesaria y Fecha límite y vuelve Requiere decisión a "No" antes de guardar? Los campos desaparecen y no se registra una decisión. Una vez guardada la decisión, Requiere decisión ya no se puede volver a "No" (FR-010).
- ¿Qué pasa si dos personas editan el mismo riesgo a la vez? Prevalece el último guardado, igual que en el resto de las ediciones de la aplicación; esta feature no define bloqueo de edición. Si otra persona ya lo resolvió, el guardado se rechaza (FR-009a) y la fecha de resolución no cambia (FR-005).
- ¿Qué pasa con un riesgo cuya tarea o iniciativa se cierra? Si la tarea se Finaliza o la iniciativa se Finaliza o Cancela, los riesgos Activos y Escalados siguen editables y no se admiten riesgos nuevos. Si la tarea se Cancela, sus riesgos quedan en solo lectura, dejan de verse en la iniciativa y de contarse en sus contadores, y se siguen viendo en el detalle de la tarea (FR-011, FR-013).
- ¿Qué pasa si una tarea o iniciativa cerrada se reabre? Vuelve a mostrarse "Cargar riesgo" y, en una tarea Finalizada reabierta, todo sigue como antes; una tarea Cancelada no se reabre (007).

## Clarifications

### Session 2026-11-25

- Q: FR-012 (leyenda del mail) → A: Esta feature no muestra ninguna leyenda sobre el mail. Se agrega con la spec de Alertas, cuando el mail exista.
- Q: FR-009 (transiciones) → A: El desplegable de Estado ofrece solo el estado actual y los permitidos (Activo: Activo, Escalado, Resuelto; Escalado: Escalado, Resuelto). No hay reaperturas; Escalado → Activo y cualquier salida de Resuelto se rechazan también al guardar.
- Q: FR-009a (riesgo Resuelto) → A: Queda en solo lectura; la grilla no muestra el lápiz en los Resueltos.
- Q: FR-010 (Requiere decisión de Sí a No) → A: Una vez guardado un riesgo con decisión, Requiere decisión queda fijo en Sí. Decisión necesaria y Fecha límite siguen editables. Si la decisión ya no hace falta, el riesgo se resuelve. De No a Sí se permite.
- Q: FR-010a (Fecha límite) → A: No puede ser anterior a hoy al cargarse o modificarse; si no se toca en la edición, se acepta aunque esté vencida. No se valida contra las fechas de la tarea.
- Q: FR-011 (tarea o iniciativa cerradas) → A: En tarea Finalizada o Cancelada, o de iniciativa Finalizada o Cancelada, no se muestra "Cargar riesgo" y se rechaza el alta. Los riesgos existentes de una tarea Finalizada o de una iniciativa Finalizada o Cancelada se siguen pudiendo editar para escalarlos o resolverlos; los de una tarea Cancelada quedan en solo lectura (ver la sesión de las decisiones del checklist).
- Q: FR-013 (contadores C-08) → A: Se revisó `specs/007-tareas/spec.md`: la iniciativa **ya muestra** indicadores de tareas (FR-042, sección "Indicadores de las tareas" con la cantidad por estado). Aplicó el primer caso: esta feature les suma los contadores de riesgos activos, riesgos escalados y decisiones pendientes.
- Q: FR-014 (fecha de resolución) → A: No se muestra en esta feature; queda registrada para el tablero y los reportes de etapas siguientes.
- Q: FR-015 ("de quién") → A: Texto libre dentro de Decisión necesaria; no hay campo aparte.
- Q: FR-016 (resolución de la decisión) → A: La decisión no tiene estado ni fecha de resolución propios; deja de estar pendiente cuando el riesgo pasa a Resuelto.
- Q: ¿Se resalta la decisión pendiente en la grilla? → A: No. El prototipo no lo define y no entra en esta feature (se quitó el escenario).
- Q: ¿La grilla del detalle de la tarea se pagina? → A: No, lista todos los riesgos.

### Session 2026-11-25 (decisiones del checklist de calidad)

- Q: ¿Los riesgos de una tarea Cancelada entran en la lista de la iniciativa y en los contadores? → A: No. Los de una tarea Finalizada sí. Los de una tarea Cancelada se siguen viendo en el detalle de esa tarea.
- Q: ¿Se pueden editar los riesgos de una tarea Cancelada? → A: No: quedan en solo lectura, sin lápiz, y el sistema rechaza cualquier guardado sobre ellos (coherente con la 007). En tarea Finalizada, o en iniciativa Finalizada o Cancelada, los riesgos Activos y Escalados siguen editables y no se admiten altas.
- Q: ¿Qué significan los contadores respecto de la lista? → A: Riesgos activos y Riesgos escalados coinciden con la lista; Decisiones pendientes es el subconjunto con Requiere decisión = Sí y no coincide con la lista.
- Q: ¿Cómo se hacen efectivos los permisos (FR-018, FR-019, SC-004)? → A: Con el mismo mecanismo de la 007 (constantes `CAN_*`, hoy habilitadas). FR-018 queda como regla de negocio; el bloqueo efectivo por rol y el rechazo del guardado para quien no tiene permiso se verifican con RF-19 (entrega 2).
- Q: ¿Qué mensaje se muestra al escalar? → A: «El riesgo "[descripción]" se ha escalado correctamente.», con la descripción entre comillas como en el alta y la edición. La única excepción a FR-024 es que no menciona el mail (el prototipo agrega «Se notificó por mail a los responsables de la iniciativa.»); el resto de los textos se toma del prototipo.
- Q: ¿Qué es "hoy" en la Fecha límite? → A: La fecha local del navegador, comparada por día; el propio día de hoy se acepta.
- Q: ¿La lista de riesgos de la iniciativa se pagina? → A: No.
- Q: ¿Cómo son las secciones de riesgos según el prototipo v11? → A: En la tarea: "Riesgos (N)", con chevron, expandida al entrar y sin lápiz de sección. En la iniciativa: "Riesgos de sus tareas (N)", con chevron, contraída al entrar y sin lápiz de sección; su acción por fila es "Ver". "Cargar riesgo" está en el pie fijo del detalle de la tarea.
- Q: ¿Qué línea "Modifica" faltaba? → A: La parte de riesgos de FR-034 de la 004, más los escenarios 14 y 15 de la historia 3 y 2 y 3 de la historia 7 de la 007.
- Q: ¿Qué textos de éxito y de error se usan? → A: Alta: «El riesgo "[descripción]" se ha cargado correctamente.»; edición: «El riesgo "[descripción]" se ha actualizado correctamente.»; fecha vencida: «La fecha límite no puede ser anterior a hoy.».
- Q: ¿Cuál es la cita del prototipo? → A: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, que contiene el v11, como la 007.
- Q: ¿Qué pasa con un Visualizador que es responsable de la tarea o accountable de la iniciativa? → A: Solo consulta.
- Q: ¿Se puede editar y resolver en el mismo guardado? → A: Sí. La fecha de resolución es la del guardado y no cambia después.

### Session 2026-11-25 (correcciones del análisis de consistencia)

- Q: C-3. ¿Qué pasa con un riesgo que requiere decisión y quedó sin ella (la reversión también falló)? → A: Solo el aviso del momento del fallo y poder completar la decisión al editar el riesgo. No hay marca nueva en la grilla.
- Q: C-4. ¿Qué pasa con la fecha y el autor de última modificación tras una reversión? → A: Se acepta que `Modified` y `Editor` queden con los datos de la reversión.
- Q: ¿En qué orden se muestran las filas de riesgos? → A: Escalado, Activo y Resuelto, y por ID ascendente dentro de cada grupo. En la iniciativa, el mismo criterio sin Resueltos. Se resuelve en memoria, no en la consulta.
- Q: ¿Qué significa "opción de reintentar" ante un error de guardado? → A: Volver a pulsar Guardar: el panel conserva lo ingresado y no hay un botón nuevo.

## Requirements *(mandatory)*

### Functional Requirements

**Riesgo**

- **FR-001**: Todo riesgo DEBE pertenecer a una única tarea, tomada del contexto desde donde se carga, y NO DEBE poder cambiarse. El ID lo asigna el sistema, se muestra como RSK-NN y NO DEBE poder editarse. Una tarea PUEDE tener varios riesgos.
- **FR-002**: La Descripción del riesgo DEBE ser un texto largo y es obligatoria. Requiere decisión DEBE ser Sí o No, es obligatoria y vale "No" por defecto. NO DEBE poder guardarse un riesgo si falta un campo obligatorio.
- **FR-003**: Al crearse, el riesgo DEBE quedar en estado "Activo". En el alta el Estado se muestra en solo lectura.
- **FR-004**: El estado del riesgo DEBE ser Activo, Escalado o Resuelto, con las transiciones Activo → Escalado, Activo → Resuelto y Escalado → Resuelto.
- **FR-005**: Al pasar el riesgo a Resuelto, el sistema DEBE registrar la fecha de resolución. La fecha DEBE ser la del guardado que pasa el riesgo a Resuelto y NO DEBE cambiar después. La persona NO DEBE poder cargarla ni editarla, y no se muestra (FR-014).
- **FR-006**: El sistema DEBE registrar la fecha y el autor de creación y de última modificación del riesgo.
- **FR-007**: Los riesgos y las decisiones NO DEBEN poder eliminarse desde la aplicación.

**Decisión**

- **FR-008**: La decisión DEBE ser una entidad propia, vinculada al riesgo. Un riesgo DEBE tener como máximo una decisión, y solo la tiene si Requiere decisión es "Sí"; el sistema NO DEBE registrar una segunda decisión para el mismo riesgo. La decisión tiene Decisión necesaria (texto largo, obligatorio: qué decisión se necesita y de quién, área o persona), Fecha límite de la decisión (fecha, obligatoria) y fecha y autor de creación y de última modificación. La decisión se eleva siempre al accountable de la iniciativa de la tarea, sin posibilidad de elegir otro destinatario.
- **FR-008a**: Los campos de la decisión SOLO DEBEN mostrarse y habilitarse si el riesgo requiere decisión. Una decisión está pendiente mientras el riesgo requiera decisión y no esté Resuelto.
- **FR-008b**: El riesgo y su decisión DEBEN cargarse y editarse juntos, en el mismo panel y con un solo Guardar. El guardado DEBE ser todo o nada: no puede quedar un riesgo que requiere decisión sin su decisión, ni una decisión sin su riesgo. Ante un fallo del guardado, DEBE revertirse lo ya escrito; si la reversión también falla, DEBE informarse a la persona y el riesgo sigue editable para completar la decisión.

**Edición, estados y reglas de cierre**

- **FR-009**: En la edición, el desplegable de Estado DEBE ofrecer solo el estado actual y los permitidos: Activo ofrece Activo, Escalado y Resuelto; Escalado ofrece Escalado y Resuelto. NO hay reaperturas: Escalado → Activo y cualquier salida de Resuelto DEBEN rechazarse también al guardar, por cualquier vía. Se PUEDE editar otros campos y resolver en el mismo guardado.
- **FR-009a**: Un riesgo Resuelto, junto con su decisión, DEBE quedar en solo lectura. La grilla NO DEBE mostrar el lápiz en los riesgos Resueltos y el sistema DEBE rechazar cualquier guardado sobre ellos.
- **FR-010**: Una vez guardado un riesgo con decisión, Requiere decisión DEBE quedar fijo en "Sí" en la edición (se muestra en "Sí", sin poder cambiarse). Decisión necesaria y Fecha límite DEBEN seguir siendo editables. Si la decisión ya no hace falta, el riesgo se resuelve. El cambio de "No" a "Sí" DEBE permitirse. Así, ninguna decisión se elimina ni queda huérfana (FR-007).
- **FR-010a**: La Fecha límite de la decisión NO DEBE ser anterior a hoy cuando se carga o cuando se modifica. "Hoy" es la fecha local del navegador, la comparación es por día y el propio día de hoy se acepta. Si en una edición no se toca (su valor es igual al guardado), DEBE aceptarse aunque ya esté vencida. El error DEBE ser «La fecha límite no puede ser anterior a hoy.». NO DEBE validarse contra las fechas de la tarea.
- **FR-011**: En una tarea Finalizada o Cancelada, o de una iniciativa Finalizada o Cancelada, NO DEBE mostrarse "Cargar riesgo" y el sistema DEBE rechazar el alta. Los riesgos Activos y Escalados de una tarea Finalizada, o de una iniciativa Finalizada o Cancelada, DEBEN seguir pudiendo editarse, para poder escalarlos o resolverlos. Los riesgos de una tarea Cancelada DEBEN quedar en solo lectura, sin lápiz, y el sistema DEBE rechazar cualquier guardado sobre ellos (coherente con la spec 007: una tarea Cancelada no admite modificaciones). Los riesgos de una tarea Cancelada se siguen viendo en el detalle de esa tarea.
- **FR-012**: Esta feature NO DEBE mostrar ninguna leyenda sobre el mail al escalar. La leyenda se agrega con la spec de Alertas, cuando el mail exista. Al escalar, el mensaje de éxito DEBE ser «El riesgo "[descripción]" se ha escalado correctamente.», sin la mención al mail del prototipo (excepción a FR-024).
- **FR-013**: El detalle de la iniciativa ya muestra los indicadores de tareas (C-08, spec 007, FR-042), por lo que DEBE sumarles tres contadores a continuación de las cantidades por estado: Riesgos activos, Riesgos escalados y Decisiones pendientes, que valen 0 si no hay. Riesgos activos y Riesgos escalados DEBEN coincidir con la lista de FR-023. Decisiones pendientes DEBE ser el subconjunto de esos riesgos con Requiere decisión = Sí y NO coincide con la lista (la definición general de decisión pendiente de FR-008a no cambia; el contador solo cuenta las de tareas no Canceladas). Los contadores DEBEN calcularse sobre todas las tareas de la iniciativa, no solo sobre las de la página visible de la sección Tareas. Los contadores NO DEBEN incluir riesgos Resueltos ni de tareas Canceladas; los de tareas Finalizadas sí.
- **FR-014**: La Fecha de resolución NO DEBE mostrarse en esta feature. DEBE quedar registrada para el tablero y los reportes de etapas siguientes.
- **FR-015**: El "de quién" de la decisión DEBE escribirse dentro de Decisión necesaria, como texto libre. NO DEBE haber un campo aparte de responsable de la decisión.
- **FR-016**: La decisión NO DEBE tener estado ni fecha de resolución propios. Deja de estar pendiente cuando el riesgo pasa a Resuelto.

**Permisos**

- **FR-017**: Toda la VP DEBE poder ver los riesgos y las decisiones.
- **FR-018**: DEBEN poder cargar y editar riesgos el responsable de la tarea y el accountable de su iniciativa (rol Usuario), y los roles CargadorObjetivo y Administrador. El Visualizador SOLO DEBE consultar.
- **FR-018a**: El Visualizador SOLO DEBE consultar, aunque sea responsable de la tarea o accountable de la iniciativa.
- **FR-019**: Los permisos de esta feature DEBEN usar el mismo mecanismo que la spec 007 (constantes `CAN_*`, hoy todas habilitadas). FR-018 y FR-018a son regla de negocio; el bloqueo efectivo por rol, la ocultación de los botones y el rechazo del guardado para quien no tiene permiso se verifican cuando se implemente RF-19 (entrega 2). Esta feature NO exige hoy ese bloqueo. Siguen vigentes, y se rechazan por cualquier vía, las reglas de estado (FR-009, FR-009a, FR-011).

**Presentación**

- **FR-020**: Las fechas DEBEN mostrarse y cargarse en formato dd/mm/aaaa.
- **FR-021**: El detalle de la tarea DEBE incluir una sección colapsable "Riesgos (N)", sin leyenda sobre el mail (FR-012), con título "Riesgos (N)" (N incluye los riesgos de cualquier estado), chevron, expandida al entrar y sin lápiz de sección, con la grilla de FR-022, que lista todos los riesgos sin paginación y ordenados en memoria: Escalado, Activo y Resuelto, y por ID ascendente dentro de cada grupo, y, sin riesgos, el estado vacío «Esta tarea no tiene riesgos cargados. Cuando se carguen, van a aparecer acá.».
- **FR-021a**: El pie fijo del detalle de la tarea DEBE ofrecer "Cargar riesgo" a continuación de "Registrar avance", sin cambiar el resto del pie (spec 007, historia 3, escenario 14). No hay "Cargar riesgo" dentro de la sección.
- **FR-022**: La grilla del detalle de la tarea DEBE tener las columnas ID (RSK-NN), Riesgo, Requiere decisión, Decisión necesaria, Fecha límite, Estado (badge) y Acción (lápiz, que no se muestra en los riesgos Resueltos). Donde el riesgo no requiere decisión, Decisión necesaria y Fecha límite DEBEN mostrar "—".
- **FR-023**: El detalle de la iniciativa DEBE mostrar la sección "Riesgos de sus tareas (N)", con chevron, contraída al entrar, sin lápiz de sección y sin paginación, con los riesgos activos y escalados de sus tareas (N es la cantidad de riesgos listados), ordenados en memoria con el mismo criterio que FR-021 (Escalado y Activo, y por ID ascendente dentro de cada grupo; sin Resueltos), y los contadores de FR-013. Cada fila DEBE mostrar ID (RSK-NN), Riesgo, Tarea (ID · nombre), Decisión necesaria, Fecha límite, Estado y un botón "Ver" que abre el detalle de la tarea. NO DEBE listar los Resueltos ni los de tareas Canceladas. Sin riesgos, DEBE mostrar «Las tareas de esta iniciativa no tienen riesgos cargados. Cuando se carguen, van a aparecer acá.».
- **FR-024**: Los textos visibles (títulos, etiquetas, errores y mensajes) DEBEN salir de la localización del proyecto y tomarse del prototipo v11, salvo lo que esta spec cambie. Se suman a las claves de localización y a todos los idiomas existentes, sin duplicar claves ya existentes. Los textos de éxito son: alta, «El riesgo "[descripción]" se ha cargado correctamente.»; edición, «El riesgo "[descripción]" se ha actualizado correctamente.»; y escalar, «El riesgo "[descripción]" se ha escalado correctamente.», que es el del prototipo sin la mención al mail (única excepción a este requisito). Los campos obligatorios vacíos DEBEN mostrar en línea "Este campo es obligatorio.".

### Fuera de alcance

- El mail al accountable al pasar a Escalado: va en la spec de Alertas (entrega 2). Este módulo solo registra el cambio de estado.
- Las alertas de decisión pendiente y los riesgos en bandejas y tablero.
- El presupuesto de la tarea.
- El historial de cambios del riesgo.

### Key Entities

- **Riesgo**: situación que pone en peligro una tarea. Pertenece a una única tarea (obligatoria, no editable). Atributos: ID (autonumérico, RSK-NN), Descripción, Estado (Activo, Escalado, Resuelto), Requiere decisión (Sí/No), Fecha de resolución (la registra el sistema; no se muestra en esta feature), fecha y autor de creación y de última modificación. Una tarea tiene 0..N riesgos; un riesgo tiene 0..1 decisión.
- **Decisión**: decisión que un riesgo necesita para destrabarse. Es una entidad propia, vinculada a un único riesgo (obligatorio), y solo existe si el riesgo requiere decisión. Atributos: Decisión necesaria (qué se necesita y de quién), Fecha límite de la decisión, fecha y autor de creación y de última modificación. Se eleva al accountable de la iniciativa de la tarea. No tiene estado ni fecha de resolución propios. El "de quién" va dentro de Decisión necesaria. Está pendiente mientras el riesgo requiera decisión y no esté Resuelto.
- **Tarea** e **Iniciativa**: existentes (specs 007 y 004). La tarea aporta el contexto del riesgo y su responsable; la iniciativa aporta el accountable que recibe la decisión.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona con permiso carga un riesgo con su decisión desde el detalle de la tarea en menos de 2 minutos, con un solo Guardar.
- **SC-002**: El 100 % de los riesgos y decisiones registrados quedan vinculados a una tarea (y las decisiones a un riesgo); no queda ningún riesgo que requiera decisión sin su decisión, ni siquiera ante un fallo del guardado, que se revierte; si la reversión también falla, se informa a la persona y el riesgo sigue editable para completar la decisión.
- **SC-003**: Todo riesgo activo o escalado de una tarea no Cancelada se ve en el detalle de su iniciativa, con su tarea, y todo riesgo resuelto o de una tarea Cancelada no se ve en esa sección ni se cuenta en sus contadores.
- **SC-004**: Las acciones de cargar y editar riesgos se rigen por constantes de permiso, como las de la spec 007. El bloqueo efectivo por rol (botones ocultos y rechazo del guardado para quien no tiene permiso) se verifica cuando se implemente RF-19 (entrega 2).
- **SC-005**: Ningún riesgo ni decisión puede eliminarse desde la aplicación.
- **SC-006**: En las pruebas con un riesgo que pasa de Activo a Escalado y a Resuelto, el 100 % de los cambios se ven en la grilla de la tarea y de la iniciativa, y la fecha de resolución queda registrada en los datos (no se muestra en pantalla, FR-014).
- **SC-007**: El 100 % de los guardados con una transición de estado no permitida, sobre un riesgo Resuelto o de una tarea Cancelada, o que den de alta un riesgo en una tarea o iniciativa cerrada, son rechazados.

## Assumptions

- Los permisos usan el mismo mecanismo que la spec 007: constantes `CAN_*`, hoy todas habilitadas. Esta spec define quién puede cargar y editar riesgos (FR-018, FR-018a) como regla de negocio, pero no crea roles ni verifica hoy su bloqueo efectivo, que depende de RF-19 (entrega 2).
- El responsable de la tarea y el accountable de la iniciativa se toman de la tarea y de la iniciativa existentes (specs 007 y 004).
- Los estados de la tarea y de la iniciativa (Finalizada, Cancelada) los define la spec 007 y 004; esta spec no los cambia.
- Esta feature no crea, modifica ni elimina listas ni columnas de SharePoint por iniciativa propia; si el plan detecta que faltan estructuras para Riesgo o Decisión (por ejemplo, una lista de riesgos, otra de decisiones y la vinculación entre ellas), DEBE avisarse antes de planificar el cambio.
- El mail de escalado y su leyenda, las alertas, las bandejas, el tablero y los reportes (que usarán la fecha de resolución) se resuelven en otras features.
