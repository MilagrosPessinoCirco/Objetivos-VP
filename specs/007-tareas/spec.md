# Feature Specification: Tareas (alta, edición, seguimiento de avance, bandeja y sección en la iniciativa)

**Feature Branch**: `007-tareas`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Feature: Tareas (alta, edición, seguimiento de avance con historial, bandeja Mis tareas y sección Tareas en la iniciativa). Fuente: docs/especificacion-funcional.md v1.9, RF-12, RF-13, RF-16 (solo la bandeja Mis tareas / Todas) y C-08 (solo la cantidad de tareas por estado). Continúa la 004-iniciativas y la 006-resultados-clave, que dejaron fuera las tareas. Cualquier usuario de la VP carga una tarea siempre dentro de una iniciativa, la asigna a cualquier persona, actualiza su avance (estado, porcentaje y comentario) dejando un historial que no se edita ni se borra, y sigue las tareas desde la bandeja y desde el detalle de la iniciativa."

**Fuente vigente**: `docs/especificacion-funcional.md` v1.9 (RF-12, RF-13, RF-16 y C-08, con la figura 2 de RF-13 para los estados). Las reglas de negocio salen de ahí; el prototipo aporta el diseño de las pantallas.

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, que contiene el prototipo v11 (19/11/2026) aunque el nombre de la carpeta diga v5. Pantallas tomadas: "Mis tareas" (bandeja), detalle de la tarea, panel lateral "Cargar tarea" / "Editar tarea", panel "Registrar avance", panel "Historial de avance" y sección "Tareas" del detalle de la iniciativa. Donde el prototipo difiere de lo ya implementado en palancas, objetivos, iniciativas y resultados clave (features 002 a 006), manda lo implementado.

**Modifica**: `specs/004-iniciativas/spec.md` (el detalle de la iniciativa suma la sección "Tareas" y los indicadores de tareas por estado, y el acceso "Mis tareas" de la home deja de estar sin pantalla). Todo lo que esta spec no cambia sigue rigiendo como lo define la 004 y la 006.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cargar una tarea en una iniciativa (Priority: P1)

La persona carga una tarea desde la bandeja "Mis tareas", eligiendo la iniciativa, o desde el detalle de una iniciativa, con la iniciativa ya fija. Completa nombre, descripción, responsable, fechas y demás datos. Confirma y la tarea queda registrada como "No iniciada" y con 0 % de avance, dentro de su iniciativa.

**Why this priority**: La tarea es la unidad de ejecución. Sin tareas cargadas no hay bandeja, seguimiento ni sección en la iniciativa.

**Independent Test**: Cargar una tarea desde la bandeja y otra desde el detalle de una iniciativa; verificar el modal de confirmación, el mensaje de éxito, que la tarea aparece en la bandeja y en la sección Tareas de la iniciativa con estado "No iniciada", 0 % y un ID asignado, y que no se puede guardar con campos obligatorios vacíos.

**Acceptance Scenarios**:

1. **Given** la bandeja "Mis tareas", **When** la persona elige "Cargar tarea", **Then** se abre el panel de alta con la Iniciativa sin elegir.
2. **Given** el detalle de una iniciativa que admite tareas, **When** la persona elige la acción para cargar una tarea, **Then** se abre el panel de alta con esa iniciativa elegida y sin poder cambiarla.
3. **Given** el panel de alta, **When** la persona lo observa, **Then** ve la Iniciativa como primer campo, el Objetivo en modo lectura, el Responsable, el Nombre de la tarea, la Descripción, los campos que resuelva la pregunta abierta de la sección Clarifications (¿Qué habilita? y Subgerencia o Áreas involucradas), la Prioridad, la Fecha de inicio y la Fecha de compromiso; no ve Estado, Avance, Fecha de finalización ni ningún dato de presupuesto o inversión.
4. **Given** el campo Iniciativa, **When** la persona lo abre, **Then** puede buscar y elige entre las iniciativas que no están Finalizadas ni Canceladas, de objetivos de la VP RRII y de otras VP.
5. **Given** una iniciativa elegida, **When** se muestra el campo Objetivo, **Then** muestra el objetivo de esa iniciativa en modo lectura (ID · nombre) y no se puede editar.
6. **Given** el campo Responsable, **When** la persona lo abre, **Then** puede elegir a cualquier persona del directorio, de cualquier departamento, y admite una sola.
7. **Given** el panel con un campo obligatorio vacío, **When** la persona elige "Cargar tarea", **Then** no se guarda y cada campo faltante muestra en línea "Este campo es obligatorio.".
8. **Given** una Fecha de compromiso anterior a la Fecha de inicio, **When** la persona elige "Cargar tarea", **Then** no se guarda y el campo de la fecha de compromiso indica el error.
9. **Given** una iniciativa con fechas y una fecha de la tarea fuera de ellas, **When** la persona elige "Cargar tarea", **Then** no se guarda y el campo de la fecha fuera de rango indica el error con las fechas de la iniciativa.
10. **Given** una iniciativa que ya tiene 10 tareas no canceladas, **When** la persona intenta cargar otra, **Then** no se guarda y el campo Iniciativa indica que la iniciativa ya tiene 10 tareas activas.
11. **Given** el panel completo y válido, **When** la persona elige "Cargar tarea", **Then** se muestra el modal "Estás por cargar la tarea y asignarla a [responsable]. ¿Querés continuar?" con Cancelar y Aceptar.
12. **Given** el modal de confirmación, **When** la persona elige Aceptar, **Then** la tarea se registra en estado "No iniciada", con 0 % de avance y un ID asignado, el panel se cierra, la persona sigue en la pantalla de origen y ve «La tarea "[nombre]" se ha cargado correctamente.».
13. **Given** el modal de confirmación, **When** la persona elige Cancelar, **Then** el modal se cierra, no se registra nada y el panel conserva lo ingresado.
14. **Given** el panel con datos cargados, **When** la persona elige Cancelar en el pie, **Then** el panel se cierra y no se registra nada.

---

### User Story 2 - Registrar el avance de una tarea (Priority: P1)

Desde el detalle de la tarea, la persona abre "Registrar avance" y, en un panel lateral, elige el estado, indica el porcentaje y deja un comentario. Si el estado es Finalizada, el avance pasa a 100 % y se pide la fecha de finalización. Cada actualización queda en el historial.

**Why this priority**: El seguimiento es el uso recurrente de la feature y lo que da valor a las tareas cargadas.

**Independent Test**: Registrar avance en una tarea nueva (No iniciada → En curso, 40 %, con comentario), luego Frenada, luego En curso y por último Finalizada con fecha; verificar el detalle, el historial con una entrada por actualización, la fecha de última actualización, y que Finalizada fuerza 100 % y exige la fecha.

**Acceptance Scenarios**:

1. **Given** el detalle de una tarea, **When** la persona elige "Registrar avance", **Then** se abre un panel lateral con Estado, Avance (%) y Comentario, precargados con los valores vigentes de la tarea (el comentario, vacío).
2. **Given** una tarea en un estado dado, **When** la persona abre el campo Estado, **Then** ofrece solo el estado actual y los estados a los que se puede pasar según la figura 2 de RF-13: desde No iniciada, En curso o Cancelada; desde En curso, Frenada, Finalizada o Cancelada; desde Frenada, En curso o Cancelada; desde Finalizada, solo En curso (reapertura); desde Cancelada, ninguno.
3. **Given** el panel con el estado Finalizada elegido, **When** se muestra, **Then** el Avance pasa a 100 % y no se puede modificar, y aparece el campo obligatorio Fecha de finalización.
4. **Given** el panel con un estado distinto de Finalizada, **When** se muestra, **Then** no aparece la Fecha de finalización.
5. **Given** el estado Finalizada sin Fecha de finalización, **When** la persona intenta guardar, **Then** no se guarda y el campo indica el error.
6. **Given** un Avance vacío, fuera de 0 a 100 o no numérico, **When** la persona intenta guardar, **Then** no se guarda y el campo indica el error.
7. **Given** un avance válido, **When** la persona elige Aceptar, **Then** el panel se cierra, el detalle muestra el estado, el avance y la fecha de última actualización nuevos, y se ve «El avance de la tarea "[nombre]" se ha actualizado correctamente.».
8. **Given** un cambio de estado a Finalizada o a Cancelada, **When** la persona elige Aceptar, **Then** se pide una confirmación previa antes de guardar: para Finalizada, que el avance pasa a 100 % y que se puede reabrir más adelante; para Cancelada, que la tarea deja de contar en la iniciativa.
9. **Given** una tarea Finalizada, **When** la persona registra el estado En curso, **Then** la tarea se reabre, ya no muestra la Fecha de finalización y el avance toma el valor ingresado.
10. **Given** un comentario ingresado, **When** la persona guarda, **Then** el comentario queda registrado en el historial junto con el estado y el avance, y pasa a ser el comentario ejecutivo de la tarea (ver pregunta abierta sobre el comentario ejecutivo en Clarifications).
11. **Given** el registro de un avance, **When** se guarda, **Then** el avance de la tarea no modifica el avance de la iniciativa, que sigue calculándose solo con sus resultados clave (C-03).
12. **Given** una tarea Cancelada, **When** se muestra su detalle, **Then** "Registrar avance" no está disponible.

---

### User Story 3 - Ver el detalle de la tarea y su historial de avance (Priority: P1)

La persona abre el detalle de una tarea y ve las migas de pan (palanca › objetivo › iniciativa › tarea), el encabezado con ID, nombre, estado y avance, la información de la tarea y su comentario ejecutivo. Desde un botón abre el historial de avance, con una entrada por cada actualización.

**Why this priority**: Es donde se lee el estado de la tarea y todo lo que pasó con ella.

**Independent Test**: Abrir el detalle de una tarea con tres actualizaciones y verificar migas, encabezado, datos, comentario ejecutivo y que el historial lista las tres entradas de la más reciente a la más antigua, sin ninguna acción para editarlas o borrarlas.

**Acceptance Scenarios**:

1. **Given** el detalle de una tarea de un objetivo de la VP RRII, **When** se abre, **Then** las migas de pan muestran palanca › objetivo › iniciativa › tarea, y cada tramo menos el último navega a su detalle.
2. **Given** el detalle de una tarea de un objetivo de otra VP, **When** se abre, **Then** las migas de pan muestran, en lugar de la palanca, el mismo texto que ya usa el detalle de la iniciativa para ese caso, y siguen con objetivo › iniciativa › tarea.
3. **Given** el detalle de la tarea, **When** se muestra el encabezado, **Then** ve "[ID] · [nombre]", el estado como chip y "Avance: X %" con su color.
4. **Given** el detalle de la tarea, **When** se muestra la sección "Información de la tarea", **Then** ve Iniciativa (ID · nombre), Objetivo (ID · nombre), Responsable, los campos que resuelva la pregunta abierta sobre Subgerencia o Áreas involucradas, Prioridad, Fecha de inicio, Fecha de compromiso, Fecha de finalización y la descripción (y "¿Qué habilita?", según la pregunta abierta).
5. **Given** una tarea que no está Finalizada, **When** se muestra su información, **Then** la Fecha de finalización muestra "—".
6. **Given** el detalle de la tarea, **When** se muestra, **Then** hay una sección "Comentario ejecutivo" con el último comentario, su fecha y su autor, o "Todavía no hay comentario ejecutivo." si no hay.
7. **Given** el detalle de la tarea, **When** la persona elige "Historial de avance", **Then** se abre un panel lateral con una entrada por actualización, de la más reciente a la más antigua, con fecha, estado, porcentaje, autor y comentario.
8. **Given** el panel de historial, **When** se muestra, **Then** no ofrece ninguna acción para editar o eliminar una entrada.
9. **Given** una tarea nunca actualizada, **When** se abre el historial, **Then** se muestra un estado vacío de una sola línea.
10. **Given** el detalle de la tarea, **When** la persona elige "Editar", **Then** se abre el panel de edición (historia 4).
11. **Given** el detalle de la tarea, **When** la persona elige Volver, **Then** vuelve a la pantalla de origen (bandeja o detalle de la iniciativa).
12. **Given** el detalle de la tarea, **When** se observa, **Then** el diseño deja lugar para sumar más secciones debajo de la información y del comentario sin cambiar lo existente, y no muestra Presupuesto, Riesgos, "Cargar riesgo" ni "Requiere inversión".

---

### User Story 4 - Editar los datos de una tarea (Priority: P2)

La persona abre el panel "Editar tarea" desde el detalle de la tarea, modifica sus datos y los guarda. La iniciativa y el objetivo no se pueden cambiar. El estado, el avance y la fecha de finalización se cambian solo con "Registrar avance".

**Why this priority**: Corrige y completa lo cargado, pero la carga y el seguimiento ya aportan valor sin la edición.

**Independent Test**: Editar el nombre, el responsable y la fecha de compromiso de una tarea con avances registrados; verificar el detalle, que el historial y el estado se conservan, que se aplican las mismas validaciones del alta y que la iniciativa se ve en modo lectura.

**Acceptance Scenarios**:

1. **Given** el detalle de una tarea, **When** la persona elige "Editar", **Then** se abre el panel "Editar tarea" con los datos actuales, y la Iniciativa y el Objetivo en modo lectura.
2. **Given** el panel de edición, **When** se muestra, **Then** no ofrece Estado, Avance ni Fecha de finalización.
3. **Given** el panel de edición con un campo obligatorio vacío, **When** la persona intenta guardar, **Then** no se guarda y cada campo faltante muestra "Este campo es obligatorio.".
4. **Given** fechas anteriores, posteriores o invertidas respecto de las reglas del alta, **When** la persona intenta guardar, **Then** no se guarda y el campo indica el error.
5. **Given** una edición válida, **When** la persona confirma, **Then** se muestra el modal "Estás por guardar los cambios de la tarea. ¿Querés continuar?", y al aceptar se guardan, el panel se cierra y se ve «La tarea "[nombre]" se ha actualizado correctamente.».
6. **Given** una tarea con avances registrados, **When** se edita y guarda, **Then** el estado, el avance, la fecha de finalización, el historial y el comentario ejecutivo no cambian.
7. **Given** una edición que cambia el responsable, **When** se guarda, **Then** la tarea aparece en "Mis tareas" del nuevo responsable y deja de aparecer en la del anterior.
8. **Given** una tarea Cancelada o Finalizada, **When** se muestra su detalle, **Then** permite editar sus datos como cualquier otra (ver Assumptions).

---

### User Story 5 - Ver y recorrer la bandeja de tareas (Priority: P1)

Desde el acceso "Mis tareas" de la home, la persona entra a la bandeja en la solapa "Mis tareas", con las tareas de las que es responsable. En la solapa "Todas" ve todas las tareas de la VP. Las tareas se agrupan por estado y desde cada fila se entra al detalle.

**Why this priority**: Es el punto de entrada para encontrar y seguir las tareas, y hoy el acceso de la home no lleva a ninguna pantalla.

**Independent Test**: Con tareas propias y ajenas en distintos estados, entrar desde la home, verificar la solapa inicial, los contadores por solapa y por estado, las columnas, el paginado y la navegación a un detalle desde "Ver".

**Acceptance Scenarios**:

1. **Given** la home, **When** la persona elige "Mis tareas", **Then** se abre la bandeja en la solapa "Mis tareas", con el título "Mis tareas".
2. **Given** la bandeja, **When** se abre, **Then** el encabezado muestra el botón Volver, el título, la búsqueda, el botón Filtros y el botón "Cargar tarea".
3. **Given** la solapa "Mis tareas", **When** se abre, **Then** lista solo las tareas en las que la persona actual es la responsable.
4. **Given** la bandeja, **When** la persona elige la solapa "Todas", **Then** el título pasa a "Todas las tareas" y se listan todas las tareas.
5. **Given** la bandeja, **When** se observa, **Then** cada solapa muestra su cantidad total, que no depende de la búsqueda ni de los filtros, y arriba de la grilla se lee "N tareas en esta vista", con N igual a las tareas de la solapa actual con la búsqueda y los filtros aplicados.
6. **Given** la solapa actual, **When** se observan las subsolapas de estado, **Then** hay una por cada estado (En curso, Frenadas, No iniciadas, Finalizadas, Canceladas), cada una con la cantidad de tareas de esa solapa con la búsqueda y los filtros aplicados, y está elegida "En curso" al abrir.
7. **Given** una subsolapa de estado, **When** se elige, **Then** la grilla muestra solo las tareas de ese estado.
8. **Given** la grilla, **When** se observa, **Then** sus columnas son ID, Tarea, Iniciativa (ID · nombre), Responsable, Compromiso, Actualizada, Avance, Estado y Ver, con el avance como porcentaje con su color y el estado como chip.
9. **Given** una fila, **When** la persona elige "Ver", **Then** se abre el detalle de esa tarea.
10. **Given** más de 10 tareas en la subsolapa, **When** se observa la bandeja, **Then** se muestran de a 10, con "Mostrando X–Y de N" a la izquierda y el paginador centrado, fijos al pie de la pantalla.
11. **Given** 10 o menos tareas en la subsolapa, **When** se observa la bandeja, **Then** no se muestra paginado.
12. **Given** ninguna tarea cargada, **When** se abre la bandeja, **Then** se muestra "No hay tareas cargadas.".
13. **Given** la bandeja, **When** la persona elige Volver, **Then** vuelve a la home.

---

### User Story 6 - Buscar y filtrar en la bandeja de tareas (Priority: P2)

La persona busca por parte del ID o del nombre, y filtra por departamento, objetivo, iniciativa, responsable y año desde un panel lateral. Búsqueda y filtros se combinan.

**Why this priority**: Con el volumen del año (hasta 1.000 tareas) la bandeja sin búsqueda ni filtros deja de ser útil, pero la bandeja básica aporta valor sin ellos.

**Independent Test**: Buscar por parte de un ID y de un nombre en distinta capitalización, aplicar cada filtro, combinarlos con la búsqueda y verificar contadores y estado vacío.

**Acceptance Scenarios**:

1. **Given** la bandeja, **When** la persona escribe parte de un ID o de un nombre, sin importar mayúsculas, **Then** se listan solo las tareas que coinciden.
2. **Given** la bandeja, **When** la persona elige Filtros, **Then** se abre un panel lateral con Departamento, Objetivo, Iniciativa, Responsable y Año, cada uno con un solo valor elegible, y los botones "Aplicar" y "Limpiar filtros". El estado se elige con las subsolapas, no en el panel.
3. **Given** un filtro de departamento, **When** se aplica, **Then** se listan las tareas cuya iniciativa pertenece a un objetivo de ese departamento.
4. **Given** un filtro de año, **When** se aplica, **Then** se listan las tareas cuya iniciativa pertenece a un objetivo comprendido en ese año, con la misma regla de año que la 004.
5. **Given** una búsqueda y uno o más filtros, **When** se aplican, **Then** se listan solo las tareas que cumplen todo a la vez, el contador "N tareas en esta vista", las subsolapas de estado y el paginado reflejan ese resultado, y las cantidades de las solapas Mis tareas y Todas no cambian.
6. **Given** una búsqueda o filtros sin coincidencias, **When** se aplican, **Then** se muestra "No hay tareas con estos filtros.".

---

### User Story 7 - Ver las tareas en el detalle de la iniciativa (Priority: P1)

En el detalle de la iniciativa la persona ve la sección "Tareas (N de 10 activas)" con cada tarea, su responsable, su compromiso, su avance y su estado, y los indicadores con la cantidad de tareas por estado. Desde ahí carga una tarea nueva en esa iniciativa o abre una existente.

**Why this priority**: Es la vista de la ejecución de una iniciativa y el segundo punto de entrada para cargar tareas.

**Independent Test**: Abrir el detalle de una iniciativa con tareas en varios estados y verificar que los indicadores coinciden con las tareas listadas, que las canceladas no cuentan en "N de 10 activas", que "Cargar tarea" se deshabilita en iniciativas Finalizadas o Canceladas y al llegar a 10, y que el avance de la iniciativa no cambia al registrar avances de tareas.

**Acceptance Scenarios**:

1. **Given** el detalle de una iniciativa, **When** se muestra, **Then** tiene la sección "Tareas (N de 10 activas)", con N igual a las tareas no canceladas, y una fila por tarea (también las canceladas) con las columnas ID, Tarea, Responsable, Compromiso, Avance, Estado y Ver.
2. **Given** el detalle de una iniciativa, **When** se muestran los indicadores de las tareas, **Then** muestran la cantidad de tareas por estado (No iniciadas, En curso, Frenadas, Finalizadas y Canceladas), y esas cantidades coinciden con las tareas listadas.
3. **Given** una iniciativa sin tareas, **When** se abre su detalle, **Then** la sección muestra "Esta iniciativa todavía no tiene tareas." y los indicadores muestran 0 en cada estado.
4. **Given** una fila, **When** la persona elige "Ver", **Then** se abre el detalle de la tarea y, al volver, regresa al detalle de la iniciativa.
5. **Given** una iniciativa en estado distinto de Finalizada y Cancelada y con menos de 10 tareas no canceladas, **When** la persona observa el detalle, **Then** puede cargar una tarea, que queda asociada a esa iniciativa (historia 1).
6. **Given** una iniciativa Finalizada o Cancelada, **When** la persona observa el detalle, **Then** la acción de cargar una tarea no está disponible, y vuelve a estarlo si la iniciativa se reabre.
7. **Given** una iniciativa con 10 tareas no canceladas, **When** la persona observa el detalle, **Then** la acción de cargar una tarea no está disponible.
8. **Given** una iniciativa con 10 tareas no canceladas, **When** se cancela una, **Then** la acción de cargar una tarea vuelve a estar disponible.
9. **Given** una iniciativa de un objetivo de la VP RRII con resultados clave, **When** se registra el avance de una de sus tareas, **Then** el avance de la iniciativa y del objetivo no cambian.
10. **Given** una iniciativa de un objetivo de otra VP, **When** se abre su detalle, **Then** la sección Tareas y sus indicadores se muestran igual que en una de la VP RRII.
11. **Given** el detalle de la iniciativa, **When** se observa la sección Tareas, **Then** no muestra riesgos activos, riesgos escalados, decisiones pendientes, presupuesto ni alertas de vencimiento.

---

### Edge Cases

- Iniciativa con 9 tareas no canceladas en la que dos personas cargan una tarea a la vez: la regla de las 10 tareas se valida al guardar; si la segunda carga excede el máximo, no se guarda y se informa el error en el campo Iniciativa.
- Tarea Cancelada: no cuenta en el máximo de 10, se mantiene en el listado y en la bandeja (solapa de estado Canceladas), no admite registrar avance y no se elimina.
- Iniciativa que pasa a Finalizada o Cancelada con tareas abiertas: las tareas se conservan sin cambios (el estado de la iniciativa no se deriva del de sus tareas, RF-11) y se pueden seguir actualizando; solo se impide cargar tareas nuevas.
- Iniciativa Finalizada o Cancelada que se reabre: vuelve a admitir tareas nuevas mientras tenga menos de 10 no canceladas.
- Fechas de la tarea iguales a las de la iniciativa: son válidas (el rango incluye ambos extremos).
- Fecha de compromiso igual a la de inicio: es válida.
- Se cambian las fechas de una iniciativa dejando fuera de rango las de tareas ya cargadas: las tareas existentes no se modifican; la regla se aplica cuando se guarda o edita la tarea.
- Editar una tarea cuyas fechas quedaron fuera de las de su iniciativa: no se guarda hasta corregirlas.
- Tarea Finalizada que se reabre: la fecha de finalización deja de mostrarse; si se vuelve a finalizar, se pide de nuevo.
- Registrar avance sin cambiar nada (mismo estado, mismo avance, comentario vacío): se acepta y deja una nueva entrada en el historial con la fecha y el autor.
- Comentario con solo espacios: se trata como vacío.
- Responsable sin tareas o persona de otro departamento: es válido; la tarea aparece en su "Mis tareas".
- Tarea o iniciativa que no existe al abrir el detalle o los paneles: se aplica el comportamiento de la 004 para iniciativas inexistentes (FR-033a), llevando a la bandeja de tareas.
- Falla el guardado del avance o del historial: se informa en una línea que la operación no pudo completarse, el panel conserva lo ingresado y reintentar no duplica lo ya guardado (ver FR-026).
- Un avance como 59,6 % (si se aceptaran decimales) se muestra redondeado y con el color calculado con el valor sin redondear: ver Assumptions sobre el avance entero.
- Bandeja con más de 10 tareas en una subsolapa y un cambio de subsolapa o de filtros: el paginado vuelve a la página 1.
- La persona que carga o actualiza la tarea no es la responsable: es válido, cualquier usuario puede hacerlo (ver Assumptions).

## Clarifications

### Preguntas abiertas para el clarify

Las tres diferencias entre la especificación v1.9 y el prototipo se dejan abiertas; hasta responderlas no se elige ninguna de las dos versiones:

- **[NEEDS CLARIFICATION: Subgerencia o Áreas involucradas]** La especificación (RF-12) pide una Subgerencia, una sola, obligatoria, tomada del maestro Subgerencias, que puede diferir de las de la iniciativa. El prototipo pide "Áreas involucradas", obligatorio, con selección múltiple, tomado de las áreas del maestro. ¿Cuál se carga y se muestra en el panel, el detalle y la bandeja? Impacta el alta, la edición, el detalle y el modelo de datos de la tarea.
- **[NEEDS CLARIFICATION: Descripción y ¿Qué habilita?]** La especificación tiene un solo campo obligatorio "Descripción / qué habilita". El prototipo los separa en dos campos obligatorios: "Descripción" y "¿Qué habilita?". ¿Se mantiene un campo o dos? Impacta el panel, el detalle y las validaciones.
- **[NEEDS CLARIFICATION: Comentario ejecutivo de la tarea]** El prototipo tiene en la tarea una sección "Comentario ejecutivo" que se actualiza desde "Registrar avance" (el último comentario, con fecha y autor). La especificación solo tiene el comentario opcional de cada entrada del historial. ¿La tarea tiene una sección Comentario ejecutivo propia, separada del historial, o el comentario existe solo dentro del historial? Impacta el detalle, el panel Registrar avance y el modelo de datos.

Hasta que se resuelvan, los requerimientos que dependen de ellas (FR-002, FR-003 y FR-021) están redactados para cubrir las dos alternativas y se ajustan después.

## Requirements *(mandatory)*

### Functional Requirements

**Tarea**

- **FR-001**: Toda tarea DEBE pertenecer a una única iniciativa. NO DEBE poder crearse una tarea sin iniciativa ni asociarla después a otra. El ID lo asigna el sistema y NO DEBE poder editarse.
- **FR-002**: Son obligatorios Iniciativa, Nombre, Responsable, Fecha de inicio, Fecha de compromiso y la Descripción (y, según la pregunta abierta, ¿Qué habilita? y la Subgerencia o las Áreas involucradas). Prioridad es opcional. NO DEBE poder guardarse una tarea si falta un campo obligatorio.
- **FR-003**: Descripción, ¿Qué habilita? (si el clarify lo confirma) y Subgerencia o Áreas involucradas DEBEN seguir lo que resuelvan las preguntas abiertas de la sección Clarifications; hasta entonces, la spec no fija cuál de las dos versiones rige.
- **FR-004**: Prioridad DEBE ofrecer Alta, Media y Baja, o quedar sin prioridad.
- **FR-005**: El Responsable DEBE ser una única persona del directorio, de cualquier departamento. Cualquier usuario DEBE poder asignar la tarea a cualquier persona.
- **FR-006**: El Objetivo DEBE mostrarse a partir de la iniciativa, en modo lectura, y NO DEBE poder editarse.
- **FR-007**: Al crearse, la tarea DEBE quedar con estado "No iniciada" y 0 % de avance. El alta NO DEBE pedir el estado, el avance ni la fecha de finalización.
- **FR-008**: La Fecha de compromiso NO DEBE ser anterior a la Fecha de inicio.
- **FR-009**: Las fechas de la tarea DEBEN quedar dentro de las de su iniciativa, incluidos los extremos. Si no, el sistema NO DEBE guardar y DEBE mostrar el error en el campo de la fecha, con las fechas de la iniciativa.
- **FR-010**: Una iniciativa DEBE admitir como máximo 10 tareas no canceladas. Al cargar una tarea que lo supere, el sistema NO DEBE guardar y DEBE mostrar el error en el campo Iniciativa. Las tareas Canceladas NO DEBEN contar en el máximo.
- **FR-011**: El sistema NO DEBE permitir cargar tareas en iniciativas Finalizadas o Canceladas. El campo Iniciativa del alta NO DEBE ofrecerlas, y el detalle de la iniciativa NO DEBE ofrecer cargar una tarea, hasta que la iniciativa se reabra.
- **FR-012**: Una tarea que deja de tener sentido DEBE cancelarse; la aplicación NO DEBE ofrecer ninguna acción para eliminar una tarea.
- **FR-012a**: Los textos DEBEN tener largos máximos definidos en el clarify; hasta entonces se aplican los mismos criterios que la 006 (error en el campo, en una sola línea, y sin guardar). Ver Assumptions.
- **FR-013**: NO DEBE existir en ninguna pantalla de esta feature el campo Requiere inversión, el CECO, el presupuesto aprobado ni el ejecutado, las secciones Presupuesto y Riesgos de la tarea, el botón "Cargar riesgo", ni los riesgos activos, los riesgos escalados o las decisiones pendientes.

**Alta y edición**

- **FR-014**: El panel de alta DEBE abrirse desde la bandeja (con la Iniciativa por elegir) o desde el detalle de la iniciativa (con la Iniciativa elegida y fija), con el pie fijo con Cancelar y "Cargar tarea".
- **FR-015**: El campo Iniciativa DEBE ser el primer campo del formulario, con buscador, y DEBE ofrecer las iniciativas no Finalizadas ni Canceladas de objetivos de la VP RRII y de otras VP.
- **FR-016**: El alta y la edición DEBEN pedir confirmación antes de guardar, con los textos "Estás por cargar la tarea y asignarla a [responsable]. ¿Querés continuar?" y "Estás por guardar los cambios de la tarea. ¿Querés continuar?", y mostrar «La tarea "[nombre]" se ha cargado correctamente.» o «La tarea "[nombre]" se ha actualizado correctamente.» al terminar. Los errores de validación DEBEN mostrarse en el campo, en una sola línea, y "Este campo es obligatorio." DEBE ser el error de un campo obligatorio vacío.
- **FR-017**: El panel de edición DEBE mostrar la Iniciativa y el Objetivo en modo lectura y NO DEBE ofrecer Estado, Avance ni Fecha de finalización. La edición NO DEBE alterar el estado, el avance, la fecha de finalización, el historial ni el comentario ejecutivo, y DEBE aplicar las mismas validaciones que el alta.
- **FR-018**: Después de cargar o editar, la persona DEBE quedar en la pantalla de origen. Cancelar, en el pie o en el modal, NO DEBE registrar nada.

**Estados y avance**

- **FR-019**: El estado de la tarea DEBE ser uno de No iniciada, En curso, Frenada, Finalizada y Cancelada, y las transiciones permitidas son las de la figura 2 de RF-13: No iniciada → En curso o Cancelada; En curso → Frenada, Finalizada o Cancelada; Frenada → En curso o Cancelada; Finalizada → En curso (reapertura). Cancelada NO tiene transiciones de salida. Cualquier otra transición NO DEBE poder registrarse.
- **FR-020**: Con estado Finalizada el avance DEBE pasar a 100 %, sin poder modificarse, y la Fecha de finalización DEBE ser obligatoria. Con otro estado la Fecha de finalización NO DEBE mostrarse. Al reabrir una tarea Finalizada, la Fecha de finalización DEBE quedar vacía.
- **FR-021**: "Registrar avance" DEBE abrir un panel lateral con Estado, Avance (%), Fecha de finalización (solo con Finalizada) y Comentario opcional, y DEBE mostrar el estado y el avance vigentes. El comentario DEBE quedar registrado en el historial, y como comentario ejecutivo de la tarea según lo que resuelva la pregunta abierta de la sección Clarifications.
- **FR-022**: Avance DEBE ser un número entre 0 y 100, obligatorio.
- **FR-023**: Cambiar el estado a Finalizada o a Cancelada DEBE pedir una confirmación previa que explique la consecuencia (Finalizada: el avance pasa a 100 % y se puede reabrir; Cancelada: deja de contar en la iniciativa).
- **FR-024**: Al guardar un avance, el sistema DEBE registrar la fecha de última actualización (momento de guardar) y mostrar «El avance de la tarea "[nombre]" se ha actualizado correctamente.».
- **FR-025**: Cada actualización de avance DEBE agregar una entrada al historial con la fecha, el autor (quien la guarda), el avance, el estado y el comentario opcional. Las entradas NO DEBEN poder editarse ni eliminarse. Solo se agregan.
- **FR-026**: Si el guardado del avance falla, el sistema DEBE informar en una línea que la operación no pudo completarse, conservar lo ingresado en el panel y no duplicar lo ya guardado al reintentar.
- **FR-027**: El avance de las tareas NO DEBE sumar al avance de la iniciativa ni al del objetivo (C-03 y C-04): es informativo.
- **FR-027a**: "Registrar avance" NO DEBE estar disponible en una tarea Cancelada.

**Bandeja**

- **FR-028**: El acceso "Mis tareas" de la home DEBE abrir la bandeja en la solapa "Mis tareas". La bandeja DEBE tener el botón Volver (a la home), el título, la búsqueda, el botón Filtros y el botón "Cargar tarea".
- **FR-029**: La solapa "Mis tareas" DEBE listar las tareas en las que la persona actual es la responsable; la solapa "Todas", todas las tareas de la VP. Cada solapa DEBE mostrar su cantidad total, que no depende de la búsqueda ni de los filtros. El filtro por defecto por el departamento del usuario (RF-20) NO se aplica en esta feature.
- **FR-030**: La bandeja DEBE agrupar las tareas por estado mediante subsolapas (En curso, Frenadas, No iniciadas, Finalizadas, Canceladas), cada una con su cantidad, que DEBEN coincidir con el listado. La subsolapa inicial es "En curso".
- **FR-031**: La grilla DEBE tener las columnas ID, Tarea, Iniciativa (ID · nombre), Responsable, Compromiso, Actualizada, Avance, Estado y Ver. Las fechas DEBEN mostrarse como dd/mm/aaaa y el avance como porcentaje entero con su color, con los mismos umbrales de color que el resto de la aplicación.
- **FR-032**: Arriba de la grilla DEBE leerse "N tareas en esta vista", con N igual a las tareas de la solapa actual con la búsqueda y los filtros aplicados.
- **FR-033**: La búsqueda DEBE aplicarse sobre el ID y el nombre, sin distinguir mayúsculas. El panel de filtros DEBE tener Departamento, Objetivo, Iniciativa, Responsable y Año, con un solo valor por filtro, "Aplicar" y "Limpiar filtros". Búsqueda y filtros DEBEN combinarse. El departamento y el año se toman del objetivo de la iniciativa de la tarea, con la regla de año de la 004.
- **FR-034**: El paginado DEBE mostrar de a 10 tareas, con "Mostrando X–Y de N" y el paginador, solo cuando hay más de 10 en la subsolapa.
- **FR-035**: Los estados vacíos DEBEN ser de una sola línea: "No hay tareas cargadas." y "No hay tareas con estos filtros.".
- **FR-036**: La bandeja NO DEBE mostrar las vencidas, las próximas a vencer, los riesgos activos ni las decisiones pendientes, ni los indicadores de alertas.

**Detalle de la tarea**

- **FR-037**: El detalle DEBE mostrar las migas de pan palanca › objetivo › iniciativa › tarea (o su equivalente de la 004 para un objetivo de otra VP), el encabezado con ID, nombre, estado y avance con su color, la sección "Información de la tarea", la sección "Comentario ejecutivo" (según la pregunta abierta), y las acciones Editar, Registrar avance e Historial de avance.
- **FR-038**: La sección "Información de la tarea" DEBE mostrar Iniciativa, Objetivo, Responsable, Subgerencia o Áreas involucradas (según el clarify), Prioridad, Fecha de inicio, Fecha de compromiso, Fecha de finalización y la descripción (y ¿Qué habilita?, según el clarify). Los datos vacíos DEBEN mostrarse como "—".
- **FR-039**: El panel "Historial de avance" DEBE listar las entradas de la más reciente a la más antigua, cada una con fecha, estado, avance, autor y comentario, y NO DEBE ofrecer acciones sobre ellas. Sin entradas, DEBE mostrar un estado vacío de una sola línea.
- **FR-040**: El detalle DEBE dejar el diseño preparado para sumar después las secciones de presupuesto y riesgos, sin describirlas ni mostrar contenedores vacíos.

**Detalle de la iniciativa**

- **FR-041**: El detalle de la iniciativa DEBE mostrar la sección "Tareas (N de 10 activas)", con N igual a las tareas no canceladas, y una fila por tarea, incluidas las canceladas, con ID, Tarea, Responsable, Compromiso, Avance, Estado y Ver. Sin tareas, DEBE mostrar "Esta iniciativa todavía no tiene tareas.".
- **FR-042 (C-08)**: El detalle de la iniciativa DEBE mostrar los indicadores con la cantidad de tareas por estado, que DEBEN coincidir con las tareas listadas. Los demás indicadores de C-08 NO se muestran.
- **FR-043**: El detalle de la iniciativa DEBE permitir cargar una tarea ya asociada a ella, salvo que la iniciativa esté Finalizada o Cancelada o ya tenga 10 tareas no canceladas.
- **FR-044**: La sección Tareas y sus indicadores DEBEN mostrarse en las iniciativas de objetivos de la VP RRII y de otras VP.

**Permisos y diseño**

- **FR-045**: En esta feature, cualquier persona que use la aplicación DEBE poder cargar tareas, editarlas, registrar su avance y verlas, porque los roles todavía no se implementan (RF-19 queda fuera). Cargar y editar, y registrar avance, DEBEN quedar como permisos separados e identificables, para poder restringirlos después de forma independiente.
- **FR-046**: La bandeja, el detalle y los paneles DEBEN usar los componentes del Design System de la aplicación y seguir el diseño ya implementado en iniciativas y resultados clave. NO DEBEN crearse rutas para pantallas que no estén implementadas.
- **FR-047**: Todos los textos visibles DEBEN estar en español (Argentina), con fechas dd/mm/aaaa. Los mensajes de error y los estados vacíos DEBEN ser de una sola línea.

### Key Entities

- **Tarea** (la lista y la entidad ya existen): unidad de ejecución de una iniciativa. Atributos de esta feature: ID, iniciativa, objetivo (calculado a partir de la iniciativa), nombre, descripción, responsable, subgerencia o áreas involucradas (según el clarify), prioridad, fecha de inicio, fecha de compromiso, avance, estado, fecha de finalización (solo Finalizada), fecha de última actualización y comentario ejecutivo (según el clarify). Pertenece a una única iniciativa. No se elimina.
- **Avance de tarea** (la lista y la entidad ya existen): cada actualización de una tarea. Atributos: tarea, fecha, autor, avance, estado y comentario opcional. Solo se agregan registros.
- **Iniciativa** (ya existente, 004 y 006): suma su sección Tareas y los indicadores con la cantidad de tareas por estado. Admite hasta 10 tareas no canceladas.
- **Objetivo** (ya existente): se muestra a partir de la iniciativa de la tarea, sin edición.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona puede cargar una tarea desde el detalle de la iniciativa, con una sola confirmación, en menos de 2 minutos.
- **SC-002**: Una persona puede registrar el avance de una tarea (estado, porcentaje y comentario) en menos de 1 minuto desde su detalle (RNF-06).
- **SC-003**: El 100 % de los intentos de cargar una tarea con campos obligatorios vacíos, fechas fuera de las de la iniciativa, en una iniciativa Finalizada o Cancelada, o en una iniciativa con 10 tareas no canceladas, son rechazados con el error en el campo.
- **SC-004**: El 100 % de las actualizaciones de avance queda en el historial con fecha, autor, avance, estado y comentario, y ninguna entrada del historial se puede editar ni eliminar.
- **SC-005**: Los contadores por solapa, por subsolapa de estado y por estado en la iniciativa coinciden con los listados en el 100 % de los casos.
- **SC-006**: El avance de la iniciativa y del objetivo no cambia en ningún caso al registrar el avance de una tarea.
- **SC-007**: La persona encuentra una tarea por parte de su ID o nombre, o por filtros, y llega a su detalle en menos de 30 segundos con el volumen de un año (hasta 1.000 tareas).
- **SC-008**: La bandeja y el detalle cargan en menos de 3 segundos con el volumen de un año (RNF-05).
- **SC-009**: Ninguna pantalla de esta feature muestra presupuesto, inversión, riesgos, decisiones ni indicadores de alertas.

## Assumptions

- Se reutiliza lo que ya existe: la lista y la entidad Tarea y la lista y la entidad Avance de tarea (con sus datos, su acceso y los estados y prioridades ya definidos), el acceso "Mis tareas" de la home (hoy sin pantalla), el detalle de la iniciativa (al que esta feature le suma la sección Tareas y los indicadores), las migas de pan, la ubicación en la estrategia, los paneles laterales, la confirmación y el mensaje de éxito de la 004 y la 006, y el directorio de usuarios.
- Si el plan detecta que a la lista de tareas o a la de avance les faltan columnas para lo que resuelvan las preguntas abiertas (por ejemplo, subgerencia, "¿Qué habilita?", comentario ejecutivo o fecha de última actualización), DEBE avisarse antes de planificar el cambio. Esta feature no crea, modifica ni elimina listas ni columnas por iniciativa propia.
- La carpeta `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/` contiene el prototipo v11. Según su LEEME, los cambios de la v11 son el switch «¿Es objetivo de VP?» y el Accountable único de la iniciativa; no tocan las pantallas de tareas.
- El máximo de 10 tareas no canceladas por iniciativa es fijo en esta feature. El prototipo lo maneja como parámetro (RF-22), que queda fuera.
- La Fecha de última actualización la registra el sistema al guardar un avance; hasta el primer avance se asume la fecha de alta. El alta no deja entrada en el historial. Si las usuarias prefieren que el alta quede como primera entrada, se define en el clarify.
- El avance es un número entero entre 0 y 100. La spec no relaciona el avance con los demás estados, salvo Finalizada (100 %): por ejemplo, una tarea En curso o Frenada puede tener cualquier avance entre 0 y 100, y una No iniciada puede tener un avance distinto de 0. Se acepta así hasta que las usuarias indiquen otra regla.
- La Fecha de finalización solo se exige y valida como fecha obligatoria; no se le impone ningún rango respecto de las fechas de la tarea o de la iniciativa.
- Cualquier persona puede editar los datos de cualquier tarea, también si está Finalizada o Cancelada, hasta que RF-19 defina roles. Registrar avance no está disponible en las canceladas, porque no tienen transiciones de salida.
- Los largos máximos de los textos de la tarea (nombre, descripción, comentario) no están definidos en la especificación; se proponen los de la 004 y la 006 (nombre 100 y comentario 500 caracteres) y se confirman en el clarify.
- Los filtros de la bandeja son los del prototipo (departamento, objetivo, iniciativa, responsable y año, más el estado por subsolapas). RF-16 menciona además gerencia y "objetivo de la VP RRII", que no están en el prototipo ni en los filtros de la bandeja de iniciativas ya implementada; quedan fuera hasta que se pidan.
- El departamento, la gerencia y el año de una tarea se toman de la iniciativa y del objetivo al que pertenece. La tarea no tiene departamento propio.
- Quedan fuera de alcance: riesgos y decisiones (RF-14) y presupuesto (RF-15), que tendrán specs propias asociadas a este módulo; las alertas de vencimiento, próxima a vencer y sin actualizar y sus indicadores (RF-18 y el resto de C-08) y el envío de mails; la eliminación de tareas por el administrador, los roles y permisos (RF-19) y el filtro por defecto por el departamento del usuario (RF-20); y la bandeja Mis iniciativas (ya hecha en la 004).
- Hasta que existan los roles, "el responsable de la tarea, o los accountable de su iniciativa" (RF-13) no restringe quién puede actualizar el avance: puede hacerlo cualquier persona.
