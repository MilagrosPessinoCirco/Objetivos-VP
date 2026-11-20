# Feature Specification: Tareas (alta, edición, seguimiento de avance, bandeja y sección en la iniciativa)

**Feature Branch**: `007-tareas`

**Created**: 2026-11-20

**Status**: Clarified

**Input**: User description: "Feature: Tareas (alta, edición, seguimiento de avance con historial, bandeja Mis tareas y sección Tareas en la iniciativa). Fuente: docs/especificacion-funcional.md v1.9, RF-12, RF-13, RF-16 (solo la bandeja Mis tareas / Todas) y C-08 (solo la cantidad de tareas por estado). Continúa la 004-iniciativas y la 006-resultados-clave, que dejaron fuera las tareas. Cualquier usuario de la VP carga una tarea siempre dentro de una iniciativa, la asigna a cualquier persona, actualiza su avance (estado, porcentaje y comentario) dejando un historial que no se edita ni se borra, y sigue las tareas desde la bandeja y desde el detalle de la iniciativa."

**Fuente vigente**: `docs/especificacion-funcional.md` v1.9 (RF-12, RF-13, RF-16 y C-08, con la figura 2 de RF-13 para los estados). Las reglas de negocio salen de ahí; el prototipo aporta el diseño de las pantallas.

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, que contiene el prototipo v11 (19/11/2026) aunque el nombre de la carpeta diga v5. Pantallas tomadas: "Mis tareas" (bandeja), detalle de la tarea, panel lateral "Cargar tarea" / "Editar tarea", panel "Registrar avance", panel "Historial de avance" y sección "Tareas" del detalle de la iniciativa. Donde el prototipo difiere de lo ya implementado en palancas, objetivos, iniciativas y resultados clave (features 002 a 006), manda lo implementado.

**Modifica**: `specs/004-iniciativas/spec.md` (FR-034, que excluía del detalle de la iniciativa las tareas, sus indicadores y "Cargar tarea": el detalle suma la sección "Tareas", los indicadores de tareas por estado y "Cargar tarea" en el pie fijo; y el acceso "Mis tareas" de la home deja de estar sin pantalla). Todo lo que esta spec no cambia sigue rigiendo como lo define la 004 y la 006.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cargar una tarea en una iniciativa (Priority: P1)

La persona carga una tarea desde la bandeja "Mis tareas", eligiendo la iniciativa, o desde el detalle de una iniciativa, con la iniciativa ya fija. Completa nombre, descripción, qué habilita, responsable, áreas involucradas, fechas y demás datos. Confirma y la tarea queda registrada como "No iniciada" y con 0 % de avance, dentro de su iniciativa.

**Why this priority**: La tarea es la unidad de ejecución. Sin tareas cargadas no hay bandeja, seguimiento ni sección en la iniciativa.

**Independent Test**: Cargar una tarea desde la bandeja y otra desde el detalle de una iniciativa; verificar el modal de confirmación, el mensaje de éxito, que la tarea aparece en la bandeja y en la sección Tareas de la iniciativa con estado "No iniciada", 0 % y un ID asignado, y que no se puede guardar con campos obligatorios vacíos.

**Acceptance Scenarios**:

1. **Given** la bandeja "Mis tareas", **When** la persona elige "Cargar tarea", **Then** se abre el panel de alta con la Iniciativa sin elegir.
2. **Given** el detalle de una iniciativa que admite tareas, **When** la persona elige "Cargar tarea" en el pie fijo, **Then** se abre el panel de alta con esa iniciativa elegida y sin poder cambiarla.
3. **Given** el panel de alta, **When** la persona lo observa, **Then** ve, en una columna y en este orden, la Iniciativa, el Objetivo en modo lectura, el Nombre de la tarea, el Responsable, la Descripción, ¿Qué habilita?, las Áreas involucradas, la Prioridad y, lado a lado, la Fecha de inicio y la Fecha de compromiso; el panel se titula "Cargar tarea" con el objetivo como subtítulo y su pie fijo muestra Cancelar y "Cargar tarea"; no ve Estado, Avance, Fecha de finalización ni ningún dato de presupuesto o inversión.
4. **Given** el campo Iniciativa, **When** la persona lo abre, **Then** puede buscar y elige entre las iniciativas que no están Finalizadas ni Canceladas, de objetivos de la VP RRII y de otras VP.
5. **Given** una iniciativa elegida, **When** se muestra el campo Objetivo, **Then** muestra el objetivo de esa iniciativa en modo lectura (ID · nombre) y no se puede editar.
6. **Given** el campo Responsable, **When** la persona lo abre, **Then** puede elegir a cualquier persona activa del directorio, de cualquier departamento, no ofrece personas inactivas y admite una sola.
7. **Given** el panel con un campo obligatorio vacío, **When** la persona elige "Cargar tarea", **Then** no se guarda y cada campo faltante muestra en línea "Este campo es obligatorio.".
8. **Given** una Fecha de compromiso anterior a la Fecha de inicio, **When** la persona elige "Cargar tarea", **Then** no se guarda y el campo de la fecha de compromiso indica el error.
9. **Given** una iniciativa con fechas y una fecha de la tarea fuera de ellas, **When** la persona elige "Cargar tarea", **Then** no se guarda y el campo de la fecha fuera de rango indica el error con las fechas de la iniciativa.
10. **Given** una iniciativa que ya tiene 10 tareas no canceladas, **When** la persona intenta cargar otra, **Then** no se guarda y el campo Iniciativa indica que la iniciativa ya tiene 10 tareas no canceladas.
11. **Given** el panel completo y válido, **When** la persona elige "Cargar tarea", **Then** se muestra el modal "Estás por cargar la tarea y asignarla a [responsable]. ¿Querés continuar?" con Cancelar y Aceptar.
12. **Given** el modal de confirmación, **When** la persona elige Aceptar, **Then** la tarea se registra en estado "No iniciada", con 0 % de avance y un ID asignado, el panel se cierra, la persona sigue en la pantalla de origen y ve «La tarea "[nombre]" se ha cargado correctamente.». Además, el historial de avance de la tarea queda con una primera entrada (historia 3, escenario 9).
13. **Given** el modal de confirmación, **When** la persona elige Cancelar, **Then** el modal se cierra, no se registra nada y el panel conserva lo ingresado.
14. **Given** el panel con datos cargados, **When** la persona elige Cancelar en el pie, **Then** el panel se cierra y no se registra nada.
15. **Given** el campo Áreas involucradas, **When** la persona lo abre, **Then** ofrece las mismas áreas que la iniciativa (todas las del maestro), permite elegir varias y exige al menos una: sin ninguna, no se guarda y el campo muestra "Este campo es obligatorio.". No hay campo Subgerencia.
16. **Given** el panel, **When** la persona deja vacío Descripción o ¿Qué habilita?, **Then** no se guarda y el campo vacío muestra "Este campo es obligatorio."; son dos campos separados y ambos son obligatorios.

---

### User Story 2 - Registrar el avance de una tarea (Priority: P1)

Desde el detalle de la tarea, la persona abre "Registrar avance" y, en un panel lateral, elige el estado, indica el porcentaje y deja un comentario. Si el estado es Finalizada, el avance pasa a 100 % y se pide la fecha de finalización. El comentario ejecutivo de la tarea se carga o actualiza desde el mismo panel. Cada actualización queda en el historial.

**Why this priority**: El seguimiento es el uso recurrente de la feature y lo que da valor a las tareas cargadas.

**Independent Test**: Registrar avance en una tarea nueva (No iniciada → En curso, 40 %, con comentario), luego Frenada, luego En curso y por último Finalizada con fecha; verificar el detalle, el historial con una entrada por actualización, la fecha de última actualización, y que Finalizada fuerza 100 % y exige la fecha.

**Acceptance Scenarios**:

1. **Given** el detalle de una tarea, **When** la persona elige "Registrar avance", **Then** se abre un panel lateral con Estado, Avance (%) y Comentario ejecutivo, precargados con los valores vigentes de la tarea (el comentario ejecutivo, con el último vigente), salvo en una tarea Finalizada (escenario 14). El panel se titula "Registrar avance", con "ID · nombre" como subtítulo, muestra Estado y Avance (%) lado a lado, la Fecha de finalización cuando corresponde y el Comentario ejecutivo, y su pie tiene Cancelar y Aceptar.
2. **Given** una tarea en un estado dado, **When** la persona abre el campo Estado, **Then** ofrece el estado actual y los estados a los que se puede pasar según la figura 2 de RF-13 (tabla de FR-019a); en una tarea Finalizada ofrece únicamente En curso (reapertura).
3. **Given** el panel con el estado Finalizada elegido, **When** se muestra, **Then** el Avance pasa a 100 % y no se puede modificar, y aparece el campo obligatorio Fecha de finalización.
4. **Given** el panel con un estado distinto de Finalizada, **When** se muestra, **Then** no aparece la Fecha de finalización.
5. **Given** el estado Finalizada sin Fecha de finalización, **When** la persona intenta guardar, **Then** no se guarda y el campo indica el error.
5a. **Given** una Fecha de finalización anterior a la fecha de inicio de la tarea o futura, **When** la persona intenta guardar, **Then** no se guarda y el campo indica el error.
6. **Given** un Avance vacío, fuera de 0 a 100, no entero o no numérico, **When** la persona intenta guardar, **Then** no se guarda y el campo indica el error.
7. **Given** un avance válido, **When** la persona elige Aceptar, **Then** el panel se cierra, el detalle muestra el estado, el avance y la fecha de última actualización nuevos, y se ve «El avance de la tarea "[nombre]" se ha actualizado correctamente.».
8. **Given** un cambio de estado a Finalizada o a Cancelada, **When** la persona elige Aceptar, **Then** se pide una confirmación previa antes de guardar: para Finalizada, que el avance pasa a 100 % y que se puede reabrir más adelante; para Cancelada, que la tarea deja de contar en la iniciativa.
9. **Given** una tarea Finalizada, **When** la persona registra el estado En curso, **Then** la tarea se reabre, ya no muestra la Fecha de finalización, el avance se conserva en 100 % y la persona puede modificarlo, no se pide confirmación y queda una entrada nueva en el historial.
10. **Given** un comentario ejecutivo nuevo o modificado, **When** la persona guarda, **Then** el comentario queda registrado en el historial junto con el estado y el avance, y pasa a ser el comentario ejecutivo de la tarea, con su fecha y su autor.
11. **Given** el registro de un avance, **When** se guarda, **Then** el avance de la tarea no modifica el avance de la iniciativa, que sigue calculándose solo con sus resultados clave (C-03).
12. **Given** una tarea Cancelada, **When** se muestra su detalle, **Then** "Registrar avance" no está disponible.
13. **Given** un comentario ejecutivo vacío o sin cambios respecto del precargado, **When** la persona guarda, **Then** el comentario ejecutivo vigente no cambia (nunca se borra, solo se reemplaza por uno nuevo) y la entrada del historial queda sin comentario.
14. **Given** una tarea Finalizada, **When** la persona elige "Registrar avance", **Then** el campo Estado ofrece únicamente En curso (precargado), el Avance se muestra en 100 % y se puede modificar, no aparece la Fecha de finalización y al guardar no se repite la confirmación de Finalizada.
15. **Given** una tarea Finalizada con una Fecha de finalización mal cargada, **When** la persona la reabre a En curso y vuelve a finalizarla con la fecha correcta, **Then** la tarea queda Finalizada con la nueva fecha, con la confirmación de Finalizada al volver a finalizar, y el historial conserva las dos entradas nuevas. La fecha de finalización no se edita de otra forma.

---

### User Story 3 - Ver el detalle de la tarea y su historial de avance (Priority: P1)

La persona abre el detalle de una tarea y ve las migas de pan (palanca › objetivo › iniciativa › tarea), el encabezado con ID, nombre, estado y avance, la información de la tarea y su comentario ejecutivo, con fecha, autor y texto. Desde un botón abre el historial de avance, con una entrada por cada actualización.

**Why this priority**: Es donde se lee el estado de la tarea y todo lo que pasó con ella.

**Independent Test**: Abrir el detalle de una tarea con tres actualizaciones y verificar migas, encabezado, datos, comentario ejecutivo y que el historial lista las tres entradas de la más reciente a la más antigua, sin ninguna acción para editarlas o borrarlas.

**Acceptance Scenarios**:

1. **Given** el detalle de una tarea de un objetivo de la VP RRII, **When** se abre, **Then** las migas de pan muestran palanca › objetivo › iniciativa › tarea, y cada tramo menos el último navega a su detalle.
2. **Given** el detalle de una tarea de un objetivo de otra VP, **When** se abre, **Then** las migas de pan muestran, en lugar de la palanca, el mismo texto que ya usa el detalle de la iniciativa para ese caso, y siguen con objetivo › iniciativa › tarea.
3. **Given** el detalle de la tarea, **When** se muestra el encabezado, **Then** ve "[ID] · [nombre]", el estado como chip y "Avance: X %" con su color.
4. **Given** el detalle de la tarea, **When** se muestra la sección "Información de la tarea", **Then** ve Iniciativa (ID · nombre), Objetivo (ID · nombre), Responsable, Áreas involucradas, Prioridad, Fecha de inicio, Fecha de compromiso, Fecha de finalización, la Descripción y "¿Qué habilita?".
5. **Given** una tarea que no está Finalizada, **When** se muestra su información, **Then** la Fecha de finalización muestra "—".
6. **Given** el detalle de la tarea, **When** se muestra, **Then** hay una sección "Comentario ejecutivo" con el último comentario ejecutivo (texto, fecha y autor), o "Todavía no hay comentario ejecutivo." si no hay.
7. **Given** el detalle de la tarea, **When** la persona elige "Historial de avance", **Then** se abre un panel lateral con una entrada por actualización, de la más reciente a la más antigua, con fecha, estado, porcentaje, autor y comentario.
8. **Given** el panel de historial, **When** se muestra, **Then** no ofrece ninguna acción para editar o eliminar una entrada.
9. **Given** una tarea recién cargada, **When** se abre el historial, **Then** muestra una única entrada con la fecha del alta, 0 %, el estado "No iniciada", el comentario "Tarea cargada." y como autor la persona que la cargó.
10. **Given** el detalle de la tarea, **When** la persona elige "Editar", **Then** se abre el panel de edición (historia 4).
11. **Given** el detalle de la tarea, **When** la persona elige Volver, **Then** vuelve a la pantalla de origen (bandeja o detalle de la iniciativa).
12. **Given** el detalle de la tarea, **When** se observa, **Then** el detalle se organiza en secciones independientes, de modo que agregar una nueva no obliga a modificar las existentes, y no muestra Presupuesto, Riesgos, "Cargar riesgo" ni "Requiere inversión".
13. **Given** el detalle de la tarea, **When** se abre, **Then** "Información de la tarea" está expandida y "Comentario ejecutivo" contraída; cada una tiene título, chevron y lápiz; el lápiz de "Información de la tarea" abre el panel de edición y el de "Comentario ejecutivo" abre "Registrar avance".
14. **Given** el detalle de la tarea, **When** se observa el pie fijo, **Then** muestra Cancelar · Editar · Registrar avance · Historial de avance, y no hay botón "Ubicación en la estrategia".
15. **Given** una tarea Cancelada, **When** se muestra su detalle, **Then** no se ofrecen Editar, Registrar avance ni los lápices de las secciones; sí Historial de avance.
16. **Given** una tarea sin entradas en el historial, **When** se abre el historial, **Then** se muestra un estado vacío de una sola línea.
17. **Given** una entrada del historial sin comentario, **When** se muestra, **Then** se muestra sin la línea del comentario.
18. **Given** dos entradas del historial con la misma fecha (sin hora), **When** se muestra el historial, **Then** va primero la registrada más tarde.

---

### User Story 4 - Editar los datos de una tarea (Priority: P2)

La persona abre el panel "Editar tarea" desde el detalle de la tarea, modifica sus datos y los guarda. La iniciativa y el objetivo no se pueden cambiar. El estado, el avance y la fecha de finalización se cambian solo con "Registrar avance".

**Why this priority**: Corrige y completa lo cargado, pero la carga y el seguimiento ya aportan valor sin la edición.

**Independent Test**: Editar el nombre, el responsable y la fecha de compromiso de una tarea con avances registrados; verificar el detalle, que el historial y el estado se conservan, que se aplican las mismas validaciones del alta y que la iniciativa se ve en modo lectura.

**Acceptance Scenarios**:

1. **Given** el detalle de una tarea, **When** la persona elige "Editar", **Then** se abre el panel "Editar tarea" con los datos actuales, y la Iniciativa y el Objetivo en modo lectura; el panel se titula "Editar tarea [ID]", muestra el objetivo como subtítulo y su pie tiene Cancelar y "Guardar cambios".
2. **Given** el panel de edición, **When** se muestra, **Then** no ofrece Estado, Avance ni Fecha de finalización.
3. **Given** el panel de edición con un campo obligatorio vacío, **When** la persona intenta guardar, **Then** no se guarda y cada campo faltante muestra "Este campo es obligatorio.".
4. **Given** fechas anteriores, posteriores o invertidas respecto de las reglas del alta, **When** la persona intenta guardar, **Then** no se guarda y el campo indica el error.
5. **Given** una edición válida, **When** la persona confirma, **Then** se muestra el modal "Estás por guardar los cambios de la tarea. ¿Querés continuar?", y al aceptar se guardan, el panel se cierra y se ve «La tarea "[nombre]" se ha actualizado correctamente.».
6. **Given** una tarea con avances registrados, **When** se edita y guarda, **Then** el estado, el avance, la fecha de finalización, el historial, el comentario ejecutivo y la fecha de última actualización ("Actualizada") no cambian.
7. **Given** una edición que cambia el responsable, **When** se guarda, **Then** la tarea aparece en "Mis tareas" del nuevo responsable y deja de aparecer en la del anterior.
8. **Given** una tarea Cancelada, **When** se muestra su detalle, **Then** "Editar" no está disponible y sus datos no se pueden modificar.
9. **Given** una tarea Finalizada, **When** se muestra su detalle, **Then** permite editar sus datos como cualquier otra tarea no cancelada, salvo la fecha de finalización, que no se edita.
10. **Given** una tarea con un área que ya no existe en el maestro, **When** se abre el panel de edición, **Then** esa área sigue mostrándose entre las elegidas hasta que la persona la cambie.

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
10. **Given** más de 10 tareas en la subsolapa, **When** se observa la bandeja, **Then** se muestran de a 10 por página, con "Mostrando X–Y de N" a la izquierda y el paginador centrado, fijos al pie de la pantalla.
11. **Given** 10 o menos tareas en la subsolapa, **When** se observa la bandeja, **Then** no se muestra paginado.
12. **Given** ninguna tarea cargada, **When** se abre la bandeja, **Then** se muestra "No hay tareas cargadas.".
13. **Given** la bandeja, **When** la persona elige Volver, **Then** vuelve a la home.
14. **Given** una subsolapa con varias páginas, **When** la persona cambia de página, **Then** los contadores de las solapas y de las subsolapas no cambian: cuentan todas las tareas, no solo las de la página visible.
15. **Given** una página distinta de la primera, **When** la persona cambia de subsolapa, de solapa, la búsqueda o un filtro, **Then** la bandeja vuelve a la página 1.
16. **Given** una solapa con tareas, **When** la persona elige una subsolapa de estado sin tareas y no hay búsqueda ni filtros aplicados, **Then** se muestra el estado vacío de una línea "No hay tareas en este estado.".

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

En el detalle de la iniciativa la persona ve la sección "Tareas (N de 10 no canceladas)" con cada tarea, su responsable, su compromiso, su avance y su estado, y los indicadores con la cantidad de tareas por estado. Desde ahí carga una tarea nueva en esa iniciativa o abre una existente. Si hay más de 10 tareas, la sección se pagina de a 10.

**Why this priority**: Es la vista de la ejecución de una iniciativa y el segundo punto de entrada para cargar tareas.

**Independent Test**: Abrir el detalle de una iniciativa con tareas en varios estados y verificar que los indicadores coinciden con las tareas listadas, que las canceladas no cuentan en "N de 10 no canceladas", que "Cargar tarea" del pie fijo se deshabilita en iniciativas Finalizadas o Canceladas y al llegar a 10, y que el avance de la iniciativa no cambia al registrar avances de tareas.

**Acceptance Scenarios**:

1. **Given** el detalle de una iniciativa, **When** se muestra, **Then** tiene la sección "Tareas (N de 10 no canceladas)", con N igual a las tareas no canceladas, y una fila por tarea (también las canceladas) con las columnas ID, Tarea, Responsable, Compromiso, Avance, Estado y Ver.
2. **Given** el detalle de una iniciativa, **When** se muestra la sección "Indicadores de las tareas", **Then** muestra, en este orden, la cantidad de tareas por estado (No iniciadas, En curso, Frenadas, Finalizadas y Canceladas), y esas cantidades coinciden con las tareas listadas.
3. **Given** una iniciativa sin tareas, **When** se abre su detalle, **Then** la sección muestra "Esta iniciativa todavía no tiene tareas." y los indicadores muestran 0 en cada estado.
4. **Given** una fila, **When** la persona elige "Ver", **Then** se abre el detalle de la tarea y, al volver, regresa al detalle de la iniciativa.
5. **Given** una iniciativa en estado distinto de Finalizada y Cancelada y con menos de 10 tareas no canceladas, **When** la persona observa el detalle, **Then** el pie fijo (Cancelar · Editar · Cambiar estado · Cargar tarea) ofrece "Cargar tarea" habilitado, que abre el panel de alta con esa iniciativa elegida (historia 1).
6. **Given** una iniciativa Finalizada o Cancelada, **When** la persona observa el detalle, **Then** "Cargar tarea" está deshabilitado, y se habilita de nuevo si la iniciativa se reabre.
7. **Given** una iniciativa con 10 tareas no canceladas, **When** la persona observa el detalle, **Then** "Cargar tarea" está deshabilitado.
8. **Given** una iniciativa con 10 tareas no canceladas, **When** se cancela una, **Then** "Cargar tarea" se habilita de nuevo.
9. **Given** una iniciativa de un objetivo de la VP RRII con resultados clave, **When** se registra el avance de una de sus tareas, **Then** el avance de la iniciativa y del objetivo no cambian.
10. **Given** una iniciativa de un objetivo de otra VP, **When** se abre su detalle, **Then** la sección Tareas y sus indicadores se muestran igual que en una de la VP RRII.
11. **Given** el detalle de la iniciativa, **When** se observa la sección Tareas, **Then** no muestra riesgos activos, riesgos escalados, decisiones pendientes, presupuesto ni alertas de vencimiento.
12. **Given** una iniciativa con más de 10 tareas listadas (canceladas incluidas), **When** se observa la sección Tareas, **Then** se muestran de a 10 por página, con "Mostrando X–Y de N" a la izquierda y el paginador centrado, al final de la sección y no fijos al pie de la pantalla, porque el detalle ya tiene su barra de acciones fija; con 10 o menos, no se muestra paginado.
13. **Given** la sección Tareas con varias páginas, **When** la persona cambia de página, **Then** los indicadores por estado y "N de 10 no canceladas" no cambian: cuentan todas las tareas de la iniciativa, no solo las de la página visible.
14. **Given** el detalle de la iniciativa, **When** se abre, **Then** las secciones "Indicadores de las tareas" y "Tareas (N de 10 no canceladas)" tienen título y chevron para contraer y expandir, y están expandidas al entrar.

---

### Edge Cases

- Iniciativa con 9 tareas no canceladas en la que dos personas cargan una tarea a la vez: el tope de 10 tareas no canceladas se valida al guardar; si la segunda carga excede el máximo, no se guarda y se informa el error en el campo Iniciativa.
- Tarea Cancelada: no cuenta en el tope de 10 tareas no canceladas, se mantiene en el listado y en la bandeja (subsolapa Canceladas), no admite registrar avance ni editar sus datos, y no se elimina.
- Iniciativa que pasa a Finalizada o Cancelada con tareas abiertas: las tareas se conservan sin cambios (el estado de la iniciativa no se deriva del de sus tareas, RF-11) y se pueden seguir actualizando; solo se impide cargar tareas nuevas.
- Iniciativa Finalizada o Cancelada que se reabre: vuelve a admitir tareas nuevas mientras tenga menos de 10 no canceladas.
- Fechas de la tarea iguales a las de la iniciativa: son válidas (el rango incluye ambos extremos).
- Fecha de compromiso igual a la de inicio: es válida.
- Se cambian las fechas de una iniciativa dejando fuera de rango las de tareas ya cargadas: las tareas existentes no se modifican; la regla se aplica cuando se guarda o edita la tarea.
- Editar una tarea cuyas fechas quedaron fuera de las de su iniciativa: no se guarda hasta corregirlas.
- Tarea Finalizada que se reabre: la fecha de finalización deja de mostrarse, el avance se conserva en 100 % y se puede modificar; si se vuelve a finalizar, se pide de nuevo la fecha y queda una entrada nueva en el historial; así se corrige una fecha de finalización mal cargada.
- Registrar avance sin cambiar nada (mismo estado, mismo avance, comentario vacío): se acepta y deja una nueva entrada en el historial con la fecha y el autor.
- Comentario ejecutivo con solo espacios: se trata como vacío.
- Responsable sin tareas o persona de otro departamento: es válido; la tarea aparece en su "Mis tareas".
- Tarea o iniciativa que no existe al abrir el detalle o los paneles: se aplica el comportamiento de la 004 para iniciativas inexistentes (FR-033a), llevando a la bandeja de tareas.
- Falla el guardado del avance, de la entrada del historial o del alta de la tarea con su primera entrada: se informa en una línea que la operación no pudo completarse, el panel conserva lo ingresado y reintentar no duplica lo ya guardado (ver FR-026).
- Un avance como 59,6 % (si se aceptaran decimales) se muestra redondeado y con el color calculado con el valor sin redondear: ver Assumptions sobre el avance entero.
- Bandeja con más de 10 tareas en una subsolapa y un cambio de subsolapa, de solapa, de búsqueda o de filtros: el paginado vuelve a la página 1. La sección Tareas del detalle de la iniciativa no tiene búsqueda ni filtros.
- La persona que carga o actualiza la tarea no es la responsable: esta spec no lo restringe; rigen los permisos que ya existen en la aplicación.
- Fecha de finalización futura, o anterior a la fecha de inicio de la tarea: no se guarda y el campo indica el error.
- Falla la carga de la bandeja, del detalle de la tarea o de la sección Tareas de la iniciativa: se informa en una línea y se ofrece reintentar; no se muestra el estado vacío como si no hubiera datos.
- Responsable que pasó a inactivo después de asignar la tarea: la tarea conserva su responsable; al editarla se sigue mostrando elegido hasta que se cambie, igual que las áreas, y no se puede elegir a un usuario inactivo nuevo.

## Clarifications

### Session 2026-11-20

- Q: ¿La tarea tiene una Subgerencia o Áreas involucradas? → A: Áreas involucradas, con selección múltiple, de la misma lista que la iniciativa, obligatoria (al menos una). No hay campo Subgerencia. Difiere de la v1.9 (RF-12), que pedía una Subgerencia, y coincide con el prototipo.
- Q: ¿Descripción y qué habilita son un campo o dos? → A: Dos campos separados, "Descripción" y "¿Qué habilita?", ambos obligatorios. Difiere de la v1.9 (RF-12), que tenía un solo campo, y coincide con el prototipo.
- Q: ¿La tarea tiene una sección Comentario ejecutivo propia? → A: Sí. Se carga o actualiza desde "Registrar avance" (precargado con el último) y se muestra con fecha, autor y texto. Se suma al comentario opcional de cada entrada del historial de la v1.9.
- Q: ¿Se pueden editar los datos de una tarea Cancelada? → A: No. Una tarea Finalizada sí se puede editar.
- Q: ¿El alta de la tarea deja una entrada en el historial? → A: Sí: una primera entrada con la fecha, 0 %, estado "No iniciada", comentario "Tarea cargada." y como autor quien la carga. La fecha de última actualización de una tarea recién cargada es la del alta.
- Q: ¿Qué pasa con el avance al reabrir una tarea Finalizada a En curso? → A: Se conserva en 100 % y se puede modificar.
- Q: ¿El "10" del supuesto sobre el máximo se refiere al tope de tareas? → A: No, se refiere al paginado: la bandeja (Mis tareas y Todas) y la sección Tareas del detalle de la iniciativa paginan de 10 registros por página, fijo (no es un parámetro configurable). El paginador solo se muestra con más de 10 registros, con "Mostrando X–Y de N" a la izquierda y el paginador centrado, fijo al pie de la pantalla. Los contadores de las solapas cuentan todas las tareas, no solo las de la página visible, y al cambiar un filtro o la búsqueda se vuelve a la página 1. [Reemplazada por la sesión posterior en lo que dice del paginador de la sección Tareas: ver la respuesta sobre dónde va ese paginador.]
- Q: ¿Sigue vigente el máximo de 10 tareas no canceladas por iniciativa? → A: Sí, sin cambios (RF-12). Es un tope de negocio distinto del paginado, fijo porque los parámetros (RF-22) quedan fuera de alcance. Ambas reglas se separan en los requerimientos y en Assumptions.
- Q: ¿Se confirman los demás supuestos de Assumptions? → A: Sí, con las excepciones y precisiones anteriores. Presupuesto, riesgos, alertas y roles siguen fuera de alcance.

### Session 2026-11-20 (decisiones de la checklist de calidad)

- Q: ¿Qué acciones admite cada estado? → A: Se edita en No iniciada, En curso, Frenada y Finalizada; no en Cancelada. Registrar avance está en todos menos Cancelada. Reabrir solo existe de Finalizada a En curso (tabla de FR-019a).
- Q: ¿Qué ofrece Registrar avance en una tarea Finalizada? → A: Solo reabrir a En curso. No se pide de nuevo la fecha de finalización ni se repite la confirmación.
- Q: ¿Hay regla entre estado y avance? → A: No. El avance es declarativo; solo Finalizada fija 100 %.
- Q: ¿Cómo se corrige una fecha de finalización mal cargada? → A: No se edita: se reabre la tarea y se vuelve a finalizar, lo que deja una entrada nueva en el historial.
- Q: ¿Qué cuenta "activas" en el rótulo de la sección Tareas? → A: Las tareas no canceladas, incluidas las Finalizadas, igual que el tope de FR-010. El rótulo pasa a "Tareas (N de 10 no canceladas)".
- Q: ¿Qué color tiene el avance de una tarea? → A: Los umbrales y colores de C-07, fijos como en la 006.
- Q: ¿Qué comentario ejecutivo tiene una tarea recién cargada? → A: Ninguno: queda vacío. "Tarea cargada." es solo el comentario de la primera entrada del historial.
- Q: ¿Se puede borrar el comentario ejecutivo? → A: No, se reemplaza por uno nuevo.
- Q: ¿Cómo se muestra una entrada del historial sin comentario? → A: Sin la línea del comentario.
- Q: ¿La fecha del historial lleva hora y cómo se ordena? → A: No lleva hora; de la más reciente a la más antigua y, a igual fecha, por orden de registro (la registrada más tarde primero).
- Q: ¿Editar los datos cambia "Actualizada"? → A: No; solo la actualiza el registro de avance.
- Q: ¿Hay tareas cargadas antes de esta feature? → A: Se asume que no. El estado vacío del historial se mantiene solo como defensa.
- Q: ¿El avance admite decimales? → A: No, es un entero de 0 a 100.
- Q: ¿Qué rango tiene la fecha de finalización? → A: No puede ser anterior al inicio de la tarea ni futura.
- Q: ¿Quién puede ser responsable y qué pasa con un área que ya no existe? → A: Solo usuarios activos. Al editar, un área que ya no existe en el maestro se sigue mostrando hasta que se cambie.
- Q: ¿Se carga "Requiere inversión"? → A: No: no se carga ni se muestra en ninguna pantalla. El plan debe resolver el valor por defecto o la obligatoriedad de esa columna en la lista.
- Q: ¿El botón "Actualizar" de la bandeja y el contador de Mis tareas en la home y el menú? → A: Quedan fuera.
- Q: ¿Qué se replica del detalle de la iniciativa (004 y 006) en el detalle de la tarea? → A: Secciones con título, chevron y lápiz (la primera expandida y la segunda contraída), el lápiz de comentario que abre el mismo panel que la acción del pie, pie fijo con Cancelar y las acciones, Volver y Cancelar a la pantalla de origen, y sin el botón "Ubicación en la estrategia" (las migas ya muestran el recorrido).
- Q: ¿Cómo se ordenan los paneles y dónde está "Cargar tarea" en la iniciativa? → A: Según el prototipo: orden de campos de FR-014a, título "Registrar avance" con "ID · nombre", y "Cargar tarea" en el pie fijo del detalle de la iniciativa, deshabilitado si no se puede cargar.
- Q: ¿Qué dice FR-045 sobre permisos? → A: Las acciones respetan los permisos que ya existen en la aplicación; esta spec no define roles.
- Q: ¿Cómo se describe la preparación del detalle para sumar secciones? → A: "El detalle se organiza en secciones independientes, de modo que agregar una nueva no obliga a modificar las existentes."
- Q: ¿Dónde viven los textos de errores y confirmaciones? → A: Se toman del prototipo y viven en la localización; la spec no los lista.
- Q: ¿Qué se muestra en una subsolapa sin tareas cuando la solapa sí tiene? → A: "No hay tareas en este estado.".
- Q: ¿Qué se muestra si falla la carga? → A: Un aviso de una línea con opción de reintentar.
- Q: ¿Dónde va el paginador de la sección Tareas del detalle de la iniciativa? → A: Al final de la sección, no fijo al pie de la pantalla, porque el detalle ya tiene su barra de acciones fija en ese lugar. El paginador de la bandeja Mis tareas / Todas sigue fijo al pie. Reemplaza lo dicho sobre el paginador de la sección en la sesión anterior.
- Q: ¿Qué pasa con un Responsable inactivo al editar una tarea? → A: Se sigue mostrando elegido hasta que se cambie, igual que las áreas que ya no existen. No se puede elegir a un usuario inactivo nuevo.
- Q: ¿Cómo se implementan los permisos de las acciones de tareas (FR-045)? → A: Como tres constantes (cargar, editar y registrar avance), todas habilitadas hasta RF-19, siguiendo la 004 y la 006. La spec no define roles.

## Requirements *(mandatory)*

### Functional Requirements

**Tarea**

- **FR-001**: Toda tarea DEBE pertenecer a una única iniciativa. NO DEBE poder crearse una tarea sin iniciativa ni asociarla después a otra. El ID lo asigna el sistema y NO DEBE poder editarse.
- **FR-002**: Son obligatorios Iniciativa, Nombre, Descripción, ¿Qué habilita?, Responsable, Áreas involucradas (al menos una), Fecha de inicio y Fecha de compromiso. Prioridad es opcional. NO DEBE poder guardarse una tarea si falta un campo obligatorio.
- **FR-003**: Descripción y ¿Qué habilita? DEBEN ser dos campos separados de texto largo. Áreas involucradas DEBE admitir varias áreas de la misma lista que usa la iniciativa. La tarea NO DEBE tener campo Subgerencia. Al editar, un área que ya no existe en el maestro DEBE seguir mostrándose entre las elegidas hasta que se cambie.
- **FR-004**: Prioridad DEBE ofrecer Alta, Media y Baja, o quedar sin prioridad.
- **FR-005**: El Responsable DEBE ser una única persona activa del directorio, de cualquier departamento; las personas inactivas NO DEBEN ofrecerse, salvo, al editar, el responsable actual de la tarea, que se sigue mostrando elegido hasta que se cambie. Cualquier usuario DEBE poder asignar la tarea a cualquier persona activa.
- **FR-006**: El Objetivo DEBE mostrarse a partir de la iniciativa, en modo lectura, y NO DEBE poder editarse.
- **FR-007**: Al crearse, la tarea DEBE quedar con estado "No iniciada" y 0 % de avance. El alta NO DEBE pedir el estado, el avance ni la fecha de finalización.
- **FR-007a**: Al crearse, el sistema DEBE agregar al historial una primera entrada con la fecha, 0 %, el estado "No iniciada", el comentario "Tarea cargada." y como autor la persona que carga la tarea. La fecha de última actualización de la tarea recién cargada DEBE ser la del alta. El comentario ejecutivo de la tarea DEBE quedar vacío: "Tarea cargada." es solo el comentario de esa entrada del historial.
- **FR-008**: La Fecha de compromiso NO DEBE ser anterior a la Fecha de inicio.
- **FR-009**: Las fechas de la tarea DEBEN quedar dentro de las de su iniciativa, incluidos los extremos. Si no, el sistema NO DEBE guardar y DEBE mostrar el error en el campo de la fecha, con las fechas de la iniciativa.
- **FR-010 (tope de tareas)**: Una iniciativa DEBE admitir como máximo 10 tareas no canceladas (RF-12). Es un tope de negocio fijo, porque los parámetros (RF-22) quedan fuera de alcance, y NO tiene relación con el paginado (FR-034 y FR-041a). Al cargar una tarea que lo supere, el sistema NO DEBE guardar y DEBE mostrar el error en el campo Iniciativa. Las tareas Canceladas NO DEBEN contar en el tope.
- **FR-011**: El sistema NO DEBE permitir cargar tareas en iniciativas Finalizadas o Canceladas. El campo Iniciativa del alta NO DEBE ofrecerlas, y el detalle de la iniciativa NO DEBE ofrecer cargar una tarea, hasta que la iniciativa se reabra.
- **FR-012**: Una tarea que deja de tener sentido DEBE cancelarse; la aplicación NO DEBE ofrecer ninguna acción para eliminar una tarea.
- **FR-012a**: Nombre DEBE tener un máximo de 100 caracteres y Comentario ejecutivo, 500. Descripción y ¿Qué habilita? no tienen largo máximo propio, como la descripción de la iniciativa. Al superar un máximo, el sistema NO DEBE guardar y DEBE mostrar el error en el campo, en una sola línea.
- **FR-013**: NO DEBE existir en ninguna pantalla de esta feature el campo Requiere inversión, el CECO, el presupuesto aprobado ni el ejecutado, las secciones Presupuesto y Riesgos de la tarea, el botón "Cargar riesgo", ni los riesgos activos, los riesgos escalados o las decisiones pendientes. El formulario NO DEBE cargar ni mostrar Requiere inversión (ver Assumptions por la columna de la lista).

**Alta y edición**

- **FR-014**: El panel de alta DEBE abrirse desde la bandeja (con la Iniciativa por elegir) o desde el detalle de la iniciativa (con la Iniciativa elegida y fija), con el pie fijo con Cancelar y "Cargar tarea".
- **FR-014a**: Los paneles de alta y edición DEBEN ordenar los campos en una columna: Iniciativa, Objetivo (lectura), Nombre de la tarea, Responsable, Descripción, ¿Qué habilita?, Áreas involucradas y Prioridad, y debajo, lado a lado, Fecha de inicio y Fecha de compromiso. El título DEBE ser "Cargar tarea" o "Editar tarea [ID]", con el objetivo como subtítulo, y el pie DEBE tener Cancelar y "Cargar tarea" (alta) o "Guardar cambios" (edición).
- **FR-015**: El campo Iniciativa DEBE ser el primer campo del formulario, con buscador, y DEBE ofrecer las iniciativas no Finalizadas ni Canceladas de objetivos de la VP RRII y de otras VP.
- **FR-016**: El alta y la edición DEBEN pedir confirmación antes de guardar, con los textos "Estás por cargar la tarea y asignarla a [responsable]. ¿Querés continuar?" y "Estás por guardar los cambios de la tarea. ¿Querés continuar?", y mostrar «La tarea "[nombre]" se ha cargado correctamente.» o «La tarea "[nombre]" se ha actualizado correctamente.» al terminar. Los errores de validación DEBEN mostrarse en el campo, en una sola línea, y "Este campo es obligatorio." DEBE ser el error de un campo obligatorio vacío.
- **FR-017**: El panel de edición DEBE mostrar la Iniciativa y el Objetivo en modo lectura y NO DEBE ofrecer Estado, Avance ni Fecha de finalización. La edición NO DEBE alterar el estado, el avance, la fecha de finalización, la fecha de última actualización, el historial ni el comentario ejecutivo, y DEBE aplicar las mismas validaciones que el alta.
- **FR-017a**: Los datos de una tarea Cancelada NO DEBEN poder editarse: el detalle NO DEBE ofrecer "Editar". Una tarea Finalizada sí puede editarse.
- **FR-018**: Después de cargar o editar, la persona DEBE quedar en la pantalla de origen. Cancelar, en el pie o en el modal, NO DEBE registrar nada.

**Estados y avance**

- **FR-019**: El estado de la tarea DEBE ser uno de No iniciada, En curso, Frenada, Finalizada y Cancelada, y las transiciones permitidas son las de la figura 2 de RF-13: No iniciada → En curso o Cancelada; En curso → Frenada, Finalizada o Cancelada; Frenada → En curso o Cancelada; Finalizada → En curso (reapertura). Cancelada NO tiene transiciones de salida. Cualquier otra transición NO DEBE poder registrarse.
- **FR-019a (acciones por estado)**: Cada estado DEBE admitir exclusivamente estas acciones:

| Estado | Editar datos | Registrar avance | Pasa a |
|---|---|---|---|
| No iniciada | Sí | Sí | En curso, Cancelada |
| En curso | Sí | Sí | Frenada, Finalizada, Cancelada |
| Frenada | Sí | Sí | En curso, Cancelada |
| Finalizada | Sí | Sí, solo para reabrir | En curso (reapertura) |
| Cancelada | No | No | Ninguno |

Reabrir solo existe de Finalizada a En curso (FR-020).
- **FR-020**: Con estado Finalizada el avance DEBE pasar a 100 %, sin poder modificarse, y la Fecha de finalización DEBE ser obligatoria. Con otro estado la Fecha de finalización NO DEBE mostrarse. Al reabrir una tarea Finalizada a En curso, la Fecha de finalización DEBE quedar vacía y el avance DEBE conservarse en 100 %, pudiendo modificarse. En una tarea Finalizada, "Registrar avance" SOLO DEBE ofrecer reabrirla a En curso (Estado precargado con En curso y Avance en 100 %): NO DEBE pedir de nuevo la Fecha de finalización ni repetir la confirmación de FR-023, y DEBE dejar una entrada nueva en el historial. La Fecha de finalización NO DEBE poder editarse: una fecha mal cargada se corrige reabriendo la tarea y volviendo a finalizarla, lo que deja otra entrada en el historial.
- **FR-020a**: La Fecha de finalización NO DEBE ser anterior a la fecha de inicio de la tarea ni futura. Si no, el sistema NO DEBE guardar y DEBE mostrar el error en el campo.
- **FR-021**: "Registrar avance" DEBE abrir un panel lateral titulado "Registrar avance", con "ID · nombre" como subtítulo, con Estado y Avance (%) lado a lado, Fecha de finalización (solo con Finalizada) y Comentario ejecutivo opcional, y pie con Cancelar y Aceptar, precargados con el estado, el avance y el último comentario ejecutivo vigentes (en una Finalizada, ver FR-020). Un comentario nuevo o modificado DEBE quedar registrado en el historial y como comentario ejecutivo de la tarea, con su fecha y su autor. Un comentario vacío o sin cambios respecto del precargado NO DEBE modificar el comentario ejecutivo vigente, y la entrada del historial DEBE quedar sin comentario. El comentario ejecutivo solo se reemplaza por uno nuevo: NO DEBE poder borrarse.
- **FR-022**: Avance DEBE ser un número entero entre 0 y 100, obligatorio. El avance es declarativo: fuera de Finalizada (100 %) NO hay regla entre estado y avance.
- **FR-023**: Cambiar el estado a Finalizada o a Cancelada DEBE pedir una confirmación previa que explique la consecuencia (Finalizada: el avance pasa a 100 % y se puede reabrir; Cancelada: deja de contar en la iniciativa). Solo se pide al entrar en Finalizada o en Cancelada: NO DEBE pedirse al reabrir ni al guardar sin cambiar de estado.
- **FR-024**: Al guardar un avance, el sistema DEBE registrar la fecha de última actualización (momento de guardar) y mostrar «El avance de la tarea "[nombre]" se ha actualizado correctamente.». Editar los datos de la tarea NO DEBE modificar esa fecha: solo la actualiza el registro de avance.
- **FR-025**: Cada actualización de avance, además de la del alta (FR-007a), DEBE agregar una entrada al historial con la fecha, el autor (quien la guarda), el avance, el estado y el comentario opcional. Las entradas NO DEBEN poder editarse ni eliminarse. Solo se agregan. La fecha NO lleva hora (dd/mm/aaaa).
- **FR-026**: Si falla el guardado del avance o del alta (la tarea o su primera entrada del historial), el sistema DEBE informar en una línea que la operación no pudo completarse, conservar lo ingresado en el panel y no duplicar lo ya guardado al reintentar.
- **FR-027**: El avance de las tareas NO DEBE sumar al avance de la iniciativa ni al del objetivo (C-03 y C-04): es informativo.
- **FR-027a**: "Registrar avance" NO DEBE estar disponible en una tarea Cancelada.

**Bandeja**

- **FR-028**: El acceso "Mis tareas" de la home DEBE abrir la bandeja en la solapa "Mis tareas". La bandeja DEBE tener el botón Volver (a la home), el título, la búsqueda, el botón Filtros y el botón "Cargar tarea". La bandeja NO DEBE tener botón "Actualizar" ni mostrar un contador de tareas en el acceso de la home ni en el menú.
- **FR-029**: La solapa "Mis tareas" DEBE listar las tareas en las que la persona actual es la responsable; la solapa "Todas", todas las tareas de la VP. Cada solapa DEBE mostrar su cantidad total, que no depende de la búsqueda ni de los filtros. El filtro por defecto por el departamento del usuario (RF-20) NO se aplica en esta feature.
- **FR-030**: La bandeja DEBE agrupar las tareas por estado mediante subsolapas (En curso, Frenadas, No iniciadas, Finalizadas, Canceladas), cada una con su cantidad, que DEBEN coincidir con el listado. La subsolapa inicial es "En curso".
- **FR-031**: La grilla DEBE tener las columnas ID, Tarea, Iniciativa (ID · nombre), Responsable, Compromiso, Actualizada, Avance, Estado y Ver. Las fechas DEBEN mostrarse como dd/mm/aaaa y el avance como porcentaje entero con su color, con los umbrales y colores de C-07 (menos de 60 % rojo; de 60 % a menos de 80 % amarillo; 80 % o más verde), fijos como en la 006.
- **FR-032**: Arriba de la grilla DEBE leerse "N tareas en esta vista", con N igual a las tareas de la solapa actual con la búsqueda y los filtros aplicados.
- **FR-033**: La búsqueda DEBE aplicarse sobre el ID y el nombre, sin distinguir mayúsculas. El panel de filtros DEBE tener Departamento, Objetivo, Iniciativa, Responsable y Año, con un solo valor por filtro, "Aplicar" y "Limpiar filtros". Búsqueda y filtros DEBEN combinarse. El departamento y el año se toman del objetivo de la iniciativa de la tarea, con la regla de año de la 004.
- **FR-034 (paginado de la bandeja)**: La bandeja DEBE paginar de a 10 tareas por página, valor fijo (no es un parámetro configurable). El pie, con "Mostrando X–Y de N" a la izquierda y el paginador centrado, DEBE quedar fijo al pie de la pantalla y mostrarse solo cuando la subsolapa tiene más de 10 tareas. Los contadores de las solapas y de las subsolapas DEBEN contar todas las tareas, no solo las de la página visible. Al cambiar de subsolapa, de solapa, la búsqueda o un filtro, DEBE volver a la página 1.
- **FR-035**: Los estados vacíos DEBEN ser de una sola línea: "No hay tareas cargadas." cuando no hay ninguna tarea, "No hay tareas con estos filtros." cuando la búsqueda o los filtros no coinciden con ninguna, y "No hay tareas en este estado." cuando la subsolapa elegida no tiene tareas pero la solapa sí, sin búsqueda ni filtros.
- **FR-036**: La bandeja NO DEBE mostrar las vencidas, las próximas a vencer, los riesgos activos ni las decisiones pendientes, ni los indicadores de alertas.

**Detalle de la tarea**

- **FR-037**: El detalle DEBE mostrar las migas de pan palanca › objetivo › iniciativa › tarea (o su equivalente de la 004 para un objetivo de otra VP), el encabezado con ID, nombre, estado y avance con su color, la sección "Información de la tarea", la sección "Comentario ejecutivo", y el pie fijo con Cancelar · Editar · Registrar avance · Historial de avance (Editar y Registrar avance no se ofrecen en una tarea Cancelada).
- **FR-037a**: Como el detalle de la iniciativa (004 y 006), las secciones "Información de la tarea" y "Comentario ejecutivo" DEBEN tener título, chevron y lápiz; al entrar, la primera está expandida y la segunda contraída. El lápiz de "Información de la tarea" y "Editar" DEBEN abrir el panel de edición; el lápiz de "Comentario ejecutivo" y "Registrar avance" DEBEN abrir el mismo panel de avance. En una tarea Cancelada NO DEBEN ofrecerse los lápices.
- **FR-037b**: El detalle NO DEBE mostrar el botón "Ubicación en la estrategia": las migas de pan ya muestran el recorrido, como en el detalle de la iniciativa (FR-034 de la 004).
- **FR-037c**: Volver y Cancelar del detalle DEBEN llevar a la pantalla de origen (bandeja o detalle de la iniciativa). Si se entró por link directo o no hay origen, al detalle de la iniciativa de la tarea; si la tarea no existe, a la bandeja de tareas.
- **FR-038**: La sección "Información de la tarea" DEBE mostrar Iniciativa, Objetivo, Responsable, Áreas involucradas, Prioridad, Fecha de inicio, Fecha de compromiso, Fecha de finalización, Descripción y ¿Qué habilita?. Los datos vacíos DEBEN mostrarse como "—".
- **FR-039**: El panel "Historial de avance" DEBE listar las entradas de la más reciente a la más antigua, cada una con fecha, estado, avance, autor y comentario, y NO DEBE ofrecer acciones sobre ellas. Las entradas con igual fecha DEBEN ordenarse por orden de registro, la registrada más tarde primero. Una entrada sin comentario DEBE mostrarse sin la línea del comentario. Toda tarea nueva tiene al menos la entrada del alta; si una tarea no tuviera entradas, DEBE mostrarse un estado vacío de una sola línea.
- **FR-039a**: La sección "Comentario ejecutivo" DEBE mostrar el texto, la fecha y el autor del último comentario ejecutivo, o "Todavía no hay comentario ejecutivo." si no hay.
- **FR-040**: El detalle DEBE organizarse en secciones independientes, de modo que agregar una nueva no obligue a modificar las existentes.

**Detalle de la iniciativa**

- **FR-041**: El detalle de la iniciativa DEBE mostrar la sección "Tareas (N de 10 no canceladas)", con N igual a las tareas no canceladas, incluidas las Finalizadas (el 10 es el tope de FR-010), y una fila por tarea, incluidas las canceladas, con ID, Tarea, Responsable, Compromiso, Avance, Estado y Ver. Sin tareas, DEBE mostrar "Esta iniciativa todavía no tiene tareas.".
- **FR-041a (paginado de la sección Tareas)**: La sección Tareas del detalle de la iniciativa DEBE paginar de a 10 tareas por página, valor fijo, con "Mostrando X–Y de N" a la izquierda y el paginador centrado, ubicados al final de la sección y NO fijos al pie de la pantalla, porque el detalle de la iniciativa ya tiene su barra de acciones fija. Las demás reglas son las de FR-034 (sin búsqueda ni filtros). Los indicadores por estado (FR-042) y "N de 10 no canceladas" DEBEN contar todas las tareas de la iniciativa, no solo las de la página visible.
- **FR-042 (C-08)**: El detalle de la iniciativa DEBE mostrar la sección "Indicadores de las tareas" con la cantidad de tareas por estado, en este orden: No iniciadas, En curso, Frenadas, Finalizadas y Canceladas, que DEBEN coincidir con las tareas listadas. Los demás indicadores de C-08 NO se muestran.
- **FR-042a**: Las secciones "Indicadores de las tareas" y "Tareas (N de 10 no canceladas)" DEBEN tener título y chevron, y estar expandidas al entrar, como "Resultados clave" (006).
- **FR-043**: El pie fijo del detalle de la iniciativa DEBE ofrecer "Cargar tarea" (junto a Cancelar, Editar y Cambiar estado), que abre el panel de alta con esa iniciativa elegida; DEBE quedar deshabilitado si la iniciativa está Finalizada o Cancelada o ya tiene 10 tareas no canceladas.
- **FR-044**: La sección Tareas y sus indicadores DEBEN mostrarse en las iniciativas de objetivos de la VP RRII y de otras VP.

**Permisos y diseño**

- **FR-045**: Las acciones de esta feature DEBEN respetar los permisos que ya existen en la aplicación. Se implementan como tres constantes de permiso (cargar, editar y registrar avance), todas habilitadas hasta que otra feature defina los roles (RF-19). Esta spec no define roles.
- **FR-046**: La bandeja, el detalle y los paneles DEBEN usar los componentes del Design System de la aplicación y seguir el diseño ya implementado en iniciativas y resultados clave. NO DEBEN crearse rutas para pantallas que no estén implementadas.
- **FR-047**: Todos los textos visibles DEBEN estar en español (Argentina), con fechas dd/mm/aaaa. Los mensajes de error y los estados vacíos DEBEN ser de una sola línea.
- **FR-048**: Los textos de los errores de validación, las confirmaciones y los estados vacíos DEBEN tomarse del prototipo y gestionarse en la localización de la aplicación; esta spec fija solo los que ya cita.
- **FR-049**: Si falla la carga de la bandeja, del detalle de la tarea o de la sección Tareas de la iniciativa, el sistema DEBE informar en una línea que la operación no pudo completarse y ofrecer reintentar, sin mostrar el estado vacío como si no hubiera datos.

### Key Entities

- **Tarea** (la lista y la entidad ya existen): unidad de ejecución de una iniciativa. Atributos de esta feature: ID, iniciativa, objetivo (calculado a partir de la iniciativa), nombre, descripción, qué habilita, responsable, áreas involucradas (una o varias), prioridad, fecha de inicio, fecha de compromiso, avance, estado, fecha de finalización (solo Finalizada), fecha de última actualización y comentario ejecutivo (último texto, con fecha y autor). Pertenece a una única iniciativa. No se elimina.
- **Avance de tarea** (la lista y la entidad ya existen): cada actualización de una tarea. Atributos: tarea, fecha, autor, avance, estado y comentario opcional. Solo se agregan registros. El alta de la tarea deja el primero.
- **Iniciativa** (ya existente, 004 y 006): suma su sección Tareas y los indicadores con la cantidad de tareas por estado. Admite hasta 10 tareas no canceladas (tope de negocio, distinto del paginado de 10 por página).
- **Objetivo** (ya existente): se muestra a partir de la iniciativa de la tarea, sin edición.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona puede cargar una tarea desde el detalle de la iniciativa, con una sola confirmación, en menos de 2 minutos.
- **SC-002**: Una persona puede registrar el avance de una tarea (estado, porcentaje y comentario) en menos de 1 minuto desde su detalle (RNF-06).
- **SC-003**: El 100 % de los intentos de cargar una tarea con campos obligatorios vacíos, fechas fuera de las de la iniciativa, en una iniciativa Finalizada o Cancelada, o en una iniciativa con 10 tareas no canceladas (o sin al menos un área involucrada), son rechazados con el error en el campo.
- **SC-004**: El 100 % de las actualizaciones de avance queda en el historial con fecha, autor, avance, estado y el comentario, si lo hubo, y ninguna entrada del historial se puede editar ni eliminar.
- **SC-005**: Los contadores por solapa, por subsolapa de estado y por estado en la iniciativa coinciden con los listados en el 100 % de los casos.
- **SC-005a**: En el 100 % de los casos, la bandeja y la sección Tareas muestran de a 10 tareas por página y el paginador aparece solo con más de 10 (fijo al pie en la bandeja y al final de la sección en el detalle de la iniciativa), sin que cambien los contadores al cambiar de página.
- **SC-006**: El avance de la iniciativa y del objetivo no cambia en ningún caso al registrar el avance de una tarea.
- **SC-007**: La persona encuentra una tarea por parte de su ID o nombre, o por filtros, y llega a su detalle en menos de 30 segundos con el volumen de un año (hasta 1.000 tareas).
- **SC-008**: La bandeja y el detalle cargan en menos de 3 segundos con el volumen de un año (RNF-05).
- **SC-009**: Ninguna pantalla de esta feature muestra presupuesto, inversión, riesgos, decisiones ni indicadores de alertas.

## Assumptions

- Se reutiliza lo que ya existe: la lista y la entidad Tarea y la lista y la entidad Avance de tarea (con sus datos, su acceso y los estados y prioridades ya definidos), el acceso "Mis tareas" de la home (hoy sin pantalla), el detalle de la iniciativa (al que esta feature le suma la sección Tareas y los indicadores), las migas de pan, la ubicación en la estrategia, los paneles laterales, la confirmación y el mensaje de éxito de la 004 y la 006, y el directorio de usuarios.
- Si el plan detecta que a la lista de tareas o a la de avance les faltan columnas para lo resuelto en Clarifications (por ejemplo, "¿Qué habilita?", Áreas involucradas con selección múltiple, comentario ejecutivo con fecha y autor, o fecha de última actualización), DEBE avisarse antes de planificar el cambio. Esta feature no crea, modifica ni elimina listas ni columnas por iniciativa propia.
- La carpeta `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/` contiene el prototipo v11. Según su LEEME, los cambios de la v11 son el switch «¿Es objetivo de VP?» y el Accountable único de la iniciativa; no tocan las pantallas de tareas.
- Son dos reglas distintas y no deben confundirse: (1) el tope de negocio de RF-12, máximo 10 tareas no canceladas por iniciativa, fijo en esta feature porque el prototipo lo maneja como parámetro (RF-22), que queda fuera; (2) el paginado de 10 registros por página de la bandeja y de la sección Tareas del detalle de la iniciativa, también fijo y no configurable.
- La Fecha de última actualización la registra el sistema al guardar un avance; para una tarea recién cargada es la del alta, que además deja la primera entrada del historial ("Tarea cargada.").
- El avance es declarativo: es un entero de 0 a 100 que carga quien lo registra. Fuera de Finalizada (100 %) no hay regla entre estado y avance (por ejemplo, una No iniciada puede tener avance mayor que 0 y una En curso, 0 %). Decisión de las usuarias.
- La Fecha de finalización no puede ser anterior a la fecha de inicio de la tarea ni futura (FR-020a); no se le impone rango respecto de la fecha de compromiso ni de las fechas de la iniciativa.
- Se editan los datos en No iniciada, En curso, Frenada y Finalizada; no en Cancelada, que tampoco admite registrar avance porque no tiene transiciones de salida (FR-019a). El acceso a cada acción respeta los permisos que ya existen en la aplicación; esta spec no define roles (RF-19 queda fuera).
- Los largos máximos de los textos (nombre 100 y comentario ejecutivo 500 caracteres) no están definidos en la especificación; se tomaron de la 006 y las usuarias los confirmaron. Descripción y ¿Qué habilita? no tienen máximo propio, como la descripción de la iniciativa en la 004.
- Los filtros de la bandeja son los del prototipo (departamento, objetivo, iniciativa, responsable y año, más el estado por subsolapas). RF-16 menciona además gerencia y "objetivo de la VP RRII", que no están en el prototipo ni en los filtros de la bandeja de iniciativas ya implementada; quedan fuera hasta que se pidan.
- El departamento, la gerencia y el año de una tarea se toman de la iniciativa y del objetivo al que pertenece. La tarea no tiene departamento propio.
- Quedan fuera de alcance: riesgos y decisiones (RF-14) y presupuesto (RF-15), que tendrán specs propias asociadas a este módulo; las alertas de vencimiento, próxima a vencer y sin actualizar y sus indicadores (RF-18 y el resto de C-08) y el envío de mails; la eliminación de tareas por el administrador, los roles y permisos (RF-19) y el filtro por defecto por el departamento del usuario (RF-20); el botón "Actualizar" de la bandeja y el contador de Mis tareas en la home y el menú del prototipo; y la bandeja Mis iniciativas (ya hecha en la 004).
- RF-13 menciona al responsable de la tarea y a los accountable de su iniciativa como quienes actualizan el avance; esta spec no lo restringe: rige lo que ya existe en la aplicación.
- Se asume que no hay tareas cargadas antes de esta feature, por eso toda tarea nueva tiene la entrada del alta. El estado vacío del historial se mantiene solo como defensa.
- El formulario no carga "Requiere inversión" y ninguna pantalla lo muestra. Como RF-12 lo define obligatorio, el plan DEBE resolver el valor por defecto o la obligatoriedad de esa columna en la lista antes de planificar el alta.
- El prototipo no conecta ningún botón con el panel "Historial de avance"; en esta spec se abre desde "Historial de avance" en el pie fijo del detalle de la tarea. A confirmar con las usuarias.
- Los umbrales de color de C-07 (60 % y 80 %) son fijos, como en la 006, hasta la feature que implemente RF-22.
- Los textos de errores, confirmaciones y estados vacíos se toman del prototipo y viven en la localización; "No hay tareas en este estado." y el aviso de falla de carga con reintento no existen en el prototipo y los define esta spec.
