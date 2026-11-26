# Feature Specification: Roles y permisos

**Feature Branch**: `010-permisos-roles`

**Created**: 2026-11-24

**Status**: Draft

**Input**: User description: "Feature: Roles y permisos. Fuente: docs/especificacion-funcional.md v1.10, RF-19 (Roles y permisos) y RF-20 (Usuarios), y el prototipo. Aplica permisos a las features 002, 003, 005, 004, 006, 007 y 008, que dejaron los permisos como valores siempre activos. El rol de cada persona sale de su pertenencia a uno de cuatro grupos de SharePoint (Visualizador, Usuario, CargadorObjetivo, Administrador); una persona sin rol no accede a la aplicación. Incluye el servicio que da de alta, cambia de rol y da de baja personas en la lista Usuario y en los grupos (sin pantalla), el rechazo del guardado sin permiso y los permisos de las listas de SharePoint."

**Fuente vigente**: `docs/especificacion-funcional.md` v1.10 (RF-19 y RF-20). Las reglas de negocio de esta feature salen de ahí y de lo decidido por las usuarias en el pedido de la feature; donde difieren, manda el pedido (por ejemplo, la eliminación de tareas, que RF-19 menciona y la 007 descartó).

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, que contiene el prototipo v11 (19/11/2026) aunque el nombre de la carpeta diga v5. Se toma qué botones, lápices, "+" y acciones de fila ve cada rol en la galería de palancas, el detalle de palanca, objetivo, iniciativa y tarea, la bandeja de iniciativas y la de tareas. La pantalla de acceso denegado no está en el prototipo: se construye con el patrón de estado vacío del Design System. El selector "Ver como (simulación de rol)" del prototipo no se implementa.

**Modifica**: las pantallas de las features 002, 003, 004, 005, 006, 007 y 008, cuyas acciones pasan de estar siempre habilitadas a depender del rol (FR-045 de la 007 y los valores equivalentes de la 002, 003, 004, 005 y 006). Todo lo que esta spec no cambia sigue rigiendo como lo definen esas features.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar a la aplicación según el rol (Priority: P1)

Al abrir la aplicación, el sistema determina el rol de la persona a partir de los grupos de SharePoint a los que pertenece. Con rol, entra a la aplicación; sin rol, o si no se pudo obtener su rol, ve una pantalla de acceso denegado en lugar de la aplicación, sin ningún dato.

**Why this priority**: Es la base de todo lo demás: sin saber quién es la persona y qué rol tiene, no se pueden calcular los permisos ni proteger la información.

**Independent Test**: Con una persona de cada rol, una persona sin rol, una persona en varios grupos y una falla simulada al obtener el rol, abrir la aplicación por la home y por un link directo y verificar qué se muestra.

**Acceptance Scenarios**:

1. **Given** una persona en el grupo de un solo rol, **When** abre la aplicación, **Then** entra a la home y su rol es el de ese grupo.
2. **Given** una persona en más de un grupo de rol, **When** abre la aplicación, **Then** su rol es el de más permisos según Administrador > CargadorObjetivo > Usuario > Visualizador.
3. **Given** una persona que no está en ninguno de los cuatro grupos, **When** abre la aplicación, **Then** ve la pantalla de acceso denegado con "No tenés acceso a esta aplicación." y no ve la home, el menú, los accesos ni ningún dato.
4. **Given** una persona sin rol, **When** entra por un link directo a un detalle o a una bandeja, **Then** ve esa misma pantalla de acceso denegado.
5. **Given** que se está obteniendo el rol, **When** la aplicación carga, **Then** se muestra el indicador de carga ya implementado y no se muestra la aplicación, de modo que no aparezcan datos ni botones que luego haya que ocultar.
6. **Given** que falla la obtención del rol, **When** la aplicación termina de intentarlo, **Then** no se da acceso y se muestra la pantalla de acceso denegado con "No se pudieron cargar tus permisos.".
7. **Given** la pantalla de acceso denegado, **When** se observa, **Then** muestra, con el patrón de estado vacío del Design System (`EmptyState`), un ícono y una línea de texto, sin descripción, botón ni textos de ayuda adicionales.

---

### User Story 2 - Ver solo las acciones que el rol permite (Priority: P1)

Cada persona ve, en cada pantalla, únicamente los botones, lápices, "+" y acciones de fila que su rol le permite usar. Lo que no puede hacer no se muestra. Consultar (ver, buscar, filtrar, actualizar y navegar) está disponible para los cuatro roles.

**Why this priority**: Es el efecto visible de la feature y el criterio de aceptación central de RF-19.

**Independent Test**: Para cada rol, recorrer la galería de palancas, el detalle de palanca, objetivo, iniciativa y tarea, y las bandejas de iniciativas y de tareas, y comparar los botones visibles con la matriz de FR-010.

**Acceptance Scenarios**:

1. **Given** un Visualizador, **When** recorre cualquier pantalla, **Then** no ve ningún botón, lápiz, "+" ni acción de fila de carga o edición, pero sí "Ver", la búsqueda, los filtros, Actualizar y la navegación.
2. **Given** un Usuario, **When** abre la galería de palancas y el detalle de una palanca, **Then** no ve "Nueva palanca", Editar, "Cargar objetivo" ni el "+" de la sección de objetivos.
3. **Given** un CargadorObjetivo, **When** abre la galería y el detalle de una palanca, **Then** ve "Cargar objetivo" y el "+" de la sección de objetivos, pero no "Nueva palanca" ni Editar de la palanca.
4. **Given** un CargadorObjetivo, **When** abre el detalle de un objetivo, **Then** no ve Editar ni los lápices del objetivo; un Administrador sí los ve.
5. **Given** un Usuario, **When** abre el detalle de un objetivo, **Then** ve "Cargar iniciativa" y el "+" de la sección Iniciativas.
6. **Given** un Usuario que es el Accountable de una iniciativa, **When** abre su detalle, **Then** ve Editar, "Cambiar estado", los lápices, "Cargar tarea" y la acción de seguimiento de cada resultado clave.
7. **Given** un Usuario que no es el Accountable de una iniciativa, **When** abre su detalle, **Then** no ve Editar, "Cambiar estado", los lápices ni la acción de seguimiento de los resultados clave, pero sí ve "Cargar tarea".
8. **Given** un CargadorObjetivo o un Administrador, **When** abre el detalle de cualquier iniciativa, **Then** ve todas esas acciones aunque no sea su Accountable.
9. **Given** un Usuario que es el responsable de una tarea, o el Accountable de su iniciativa, **When** abre el detalle de la tarea, **Then** ve Editar, "Registrar avance" y los lápices; si no es ninguno de los dos, no los ve.
10. **Given** una acción que el rol no permite, **When** la persona observa la pantalla, **Then** no hay un botón deshabilitado en su lugar: la acción directamente no se muestra.

---

### User Story 3 - Ver los pesos solo con permiso (Priority: P2)

El peso de las iniciativas se muestra únicamente a CargadorObjetivo y Administrador. Los demás roles ven la información sin esos datos.

**Why this priority**: Es una regla de visibilidad de RF-19 y del prototipo, de menor alcance que ocultar las acciones.

**Independent Test**: Con un Usuario y con un CargadorObjetivo, abrir la bandeja de iniciativas y el detalle de una iniciativa de un objetivo de la VP RRII y comparar lo que se ve.

**Acceptance Scenarios**:

1. **Given** un CargadorObjetivo o un Administrador, **When** abre la bandeja de iniciativas, **Then** la columna se titula "Objetivo (peso)" y muestra el peso junto a cada objetivo.
2. **Given** un Visualizador o un Usuario, **When** abre la bandeja de iniciativas, **Then** la columna se titula "Objetivo" y no muestra ningún peso.
3. **Given** un CargadorObjetivo o un Administrador, **When** abre "Información de la iniciativa" de un objetivo de la VP RRII, **Then** ve el peso en el objetivo y el peso en el departamento.
4. **Given** un Visualizador o un Usuario, **When** abre "Información de la iniciativa", **Then** no ve esos dos datos.
5. **Given** un CargadorObjetivo o un Administrador, **When** abre el detalle de un objetivo de la VP RRII, **Then** la lista de iniciativas muestra la columna de peso; un Visualizador o un Usuario no la ve.

---

### User Story 4 - Rechazar el guardado sin permiso (Priority: P1)

Además de ocultar las acciones, antes de guardar la aplicación vuelve a verificar el permiso. Si la persona no lo tiene, no se guarda nada.

**Why this priority**: Ocultar botones no es seguridad; RF-19 exige que el sistema rechace el guardado.

**Independent Test**: Simular que el rol cambia o que se fuerza una acción no permitida (por ejemplo, abrir un panel y guardar con un rol sin permiso) y verificar que no se escribe nada y que se informa en una línea.

**Acceptance Scenarios**:

1. **Given** una persona sin permiso para una acción, **When** intenta guardarla, **Then** no se guarda nada y se muestra en una línea "No tenés permiso para realizar esta acción.".
2. **Given** un Usuario que no es el Accountable de una iniciativa, **When** intenta guardar un cambio de esa iniciativa, **Then** el guardado se rechaza con ese mismo mensaje.
3. **Given** el servicio de alta, cambio de rol y baja de personas, **When** lo invoca alguien que no es Administrador, **Then** no hace ningún cambio y devuelve "No tenés permiso para realizar esta acción.".

---

### User Story 5 - Dar de alta, cambiar de rol y dar de baja personas (Priority: P2)

Existe un servicio que mantiene a la persona en la lista Usuario y en el grupo de su rol, para que ambos queden siempre alineados. Solo lo puede usar un Administrador. No tiene pantalla en esta feature: lo usará el ABM de usuarios, que es una feature posterior.

**Why this priority**: Es el mecanismo para asignar roles sin hacerlo a mano en dos lugares, pero no bloquea la aplicación de permisos, que puede probarse con grupos cargados manualmente.

**Independent Test**: Con el mock y con el sitio de desarrollo, ejecutar alta, cambio de rol y baja, y forzar una falla en cada paso, verificando la lista, los grupos y los mensajes.

**Acceptance Scenarios**:

1. **Given** una persona que no está en la lista Usuario, **When** se la da de alta con un rol, **Then** queda en la lista con su rol y en el grupo de ese rol.
2. **Given** una persona con un rol, **When** se le cambia el rol, **Then** la lista muestra el rol nuevo, la persona está en el grupo nuevo y ya no está en el anterior.
3. **Given** una persona activa, **When** se la da de baja, **Then** sale de su grupo y su elemento de la lista se conserva como inactivo.
4. **Given** una falla en cualquiera de los pasos, **When** el servicio la detecta, **Then** deshace lo que alcanzó a hacerse.
5. **Given** una falla en un paso y otra al deshacer, **When** el servicio termina, **Then** informa en una línea que la operación no pudo completarse.
6. **Given** una operación que falló, **When** se reintenta, **Then** no se duplica ningún elemento de la lista ni ninguna pertenencia a un grupo.
7. **Given** una persona agregada o modificada directamente en la lista de SharePoint, sin pasar por la aplicación, **When** se consultan los grupos, **Then** el grupo no cambió: esta limitación es conocida y está documentada.

---

### User Story 6 - Permisos en las listas de SharePoint (Priority: P2)

Las listas de la aplicación dejan de heredar los permisos del sitio y dan lectura solo a los cuatro grupos de roles; la escritura se configura por grupo según la tabla del quickstart, de modo que SharePoint imponga los permisos aunque alguien edite fuera de la aplicación. La configuración la hace la usuaria; esta feature la documenta.

**Why this priority**: Cierra la seguridad fuera de la interfaz (RNF-03), pero depende de configuración manual en el sitio y no cambia lo que se ve en la aplicación.

**Independent Test**: Con el quickstart aplicado en el sitio de desarrollo, entrar a las listas con una persona sin rol, con un Visualizador y con un Usuario, y verificar la lectura y la escritura permitidas.

**Acceptance Scenarios**:

1. **Given** una persona sin rol, **When** intenta abrir una lista de la aplicación desde SharePoint, **Then** no puede ver sus datos.
2. **Given** un Visualizador, **When** intenta escribir en cualquier lista, **Then** SharePoint lo impide.
3. **Given** un Usuario, **When** intenta escribir en la lista Palanca o en la lista Usuario, **Then** SharePoint lo impide.
4. **Given** el quickstart, **When** se lo sigue en otro sitio, **Then** permite crear los grupos, la columna Rol, cortar la herencia, asignar los permisos de la tabla y dejar al grupo Administrador como propietario de los cuatro grupos.

---

### Edge Cases

- Persona en varios grupos: vale el rol con más permisos (FR-003). El rol Visualizador nunca se asigna por defecto.
- Persona sin rol que entra por una ruta de detalle o de bandeja: ve la pantalla de acceso denegado, no el detalle ni "no encontrado" (FR-006).
- Falla al obtener el rol: acceso denegado con "No se pudieron cargar tus permisos." y no el mensaje de falta de rol (FR-007).
- Usuario cuyo rol permite crear tareas en cualquier iniciativa, pero que no es responsable de la tarea ni Accountable de su iniciativa: puede crearla y asignarla a otra persona, pero luego no puede editarla ni registrar su avance (FR-010).
- Usuario que crea una iniciativa y deja a otra persona como Accountable: pierde el permiso de editarla desde ese momento (FR-010).
- Persona dada de baja con una sesión abierta: conserva la visualización hasta que recargue la aplicación, pero cualquier guardado se rechaza con "No tenés permiso para realizar esta acción.", porque antes de guardar se vuelven a leer los grupos (FR-014); las listas también le impiden escribir (FR-023 y FR-024).
- Tarea Cancelada: aunque el rol permita actualizar, siguen sin ofrecerse Editar ni "Registrar avance" (FR-017a y FR-027a de la 007).
- Falla de un paso del servicio de personas, con o sin falla al deshacer (FR-019 y FR-020).
- Cambio de rol hacia el mismo rol que ya tiene: no hace cambios ni duplica pertenencias.

## Requirements *(mandatory)*

### Functional Requirements

**Rol de la persona**

- **FR-001**: Cada persona DEBE tener a lo sumo un rol, que es independiente de su puesto: Visualizador, Usuario, CargadorObjetivo o Administrador.
- **FR-002**: Cada rol DEBE corresponder a un grupo de SharePoint del sitio. La aplicación DEBE obtener los grupos de la persona actual y deducir su rol a partir de ellos. Cada grupo DEBE llamarse exactamente igual que el valor de la columna Rol (Administrador, CargadorObjetivo, Usuario y Visualizador): un rol no puede tener un nombre en la columna y otro en el grupo.
- **FR-003**: Si una persona está en más de un grupo de rol, DEBE valer el rol con más permisos: Administrador > CargadorObjetivo > Usuario > Visualizador.
- **FR-004**: Si una persona no está en ninguno de los cuatro grupos, NO DEBE tener rol. El rol Visualizador es solo para el VP y NO DEBE asignarse por defecto.
- **FR-005**: Los permisos DEBEN calcularse en un único lugar a partir del rol y de la relación de la persona con cada elemento (Accountable de la iniciativa, responsable de la tarea). Las pantallas DEBEN reutilizar los valores de permiso que dejaron las features anteriores, sin duplicar cálculos de permisos en cada pantalla.

**Acceso a la aplicación**

- **FR-006**: Si la persona no tiene rol, la aplicación DEBE mostrar, en lugar de su contenido, una pantalla de acceso denegado con el mensaje de una línea "No tenés acceso a esta aplicación.". NO DEBE mostrar la home, el menú, los accesos ni ningún dato. Lo mismo DEBE ocurrir en cualquier ruta, incluidos los links directos a un detalle o a una bandeja.
- **FR-006a**: La pantalla de acceso denegado DEBE construirse con el patrón de estado vacío del Design System (`EmptyState`): un ícono y una línea de texto, sin descripción, botón ni textos de ayuda adicionales, centrada y ocupando toda la pantalla, sin bordes. Si el patrón no se ve bien con esa configuración, se admite un componente propio armado con tokens del Design System, registrado como desvío en el plan.
- **FR-006b**: El botón "ABM" de la home DEBE mostrarse solo al Administrador. Para los demás roles NO DEBE mostrarse, pero los demás botones DEBEN conservar su posición y separación (el lugar queda vacío). El botón sigue sin destino: la pantalla ABM es una feature posterior.
- **FR-007**: Si falla la obtención del rol, la aplicación NO DEBE dar acceso y DEBE mostrar la pantalla de acceso denegado con el mensaje de una línea "No se pudieron cargar tus permisos.".
- **FR-008**: Mientras se obtiene el rol, la aplicación DEBE mostrar el indicador de carga ya implementado y NO DEBE mostrar ninguna pantalla de la aplicación.
- **FR-009**: NO DEBE mostrarse el selector "Ver como (simulación de rol)" del prototipo.

**Matriz de permisos**

- **FR-010**: Las acciones DEBEN estar permitidas según esta matriz:

  | Acción | Visualizador | Usuario | CargadorObjetivo | Administrador |
  |---|---|---|---|---|
  | Acceder a la aplicación y ver toda la información | Sí | Sí | Sí | Sí |
  | Crear, editar e inactivar palancas | — | — | — | Sí |
  | Crear objetivos | — | — | Sí | Sí |
  | Editar objetivos, sus pesos y la marca de objetivo de la VP RRII | — | — | — | Sí |
  | Crear iniciativas (con sus resultados clave) | — | Sí | Sí | Sí |
  | Editar una iniciativa y sus resultados clave, y cambiar su estado | — | Solo si es su Accountable | Sí | Sí |
  | Hacer el seguimiento de un resultado clave | — | Solo si es Accountable de la iniciativa | Sí | Sí |
  | Crear tareas | — | Sí | Sí | Sí |
  | Actualizar una tarea (editar sus datos y registrar su avance) | — | Solo si es responsable de la tarea o Accountable de su iniciativa | Sí | Sí |
  | Dar de alta, cambiar el rol y dar de baja personas | — | — | — | Sí |

  Una persona sin rol no puede hacer nada de lo anterior, ni siquiera acceder.
- **FR-010a**: Las acciones de tareas que existen según la 007 DEBEN ubicarse así: "Cargar tarea" (bandeja y detalle de la iniciativa) es "Crear tareas"; "Editar" y los lápices de "Información de la tarea" son "Actualizar una tarea"; "Registrar avance" y el lápiz de "Comentario ejecutivo" son "Actualizar una tarea"; "Historial de avance" es consulta y se ofrece a los cuatro roles. No existe la acción de eliminar tareas y NO DEBE agregarse a la matriz. Todas las acciones de tareas encajan en la matriz.
- **FR-010b**: "Cambiar estado" de la iniciativa y el lápiz del comentario de la iniciativa DEBEN seguir el permiso de "Editar una iniciativa". "Crear iniciativas" DEBE abarcar la carga de sus resultados clave en el alta; la edición de los resultados clave sigue el permiso de editar la iniciativa.
- **FR-010c**: El permiso de editar o seguir una iniciativa de un Usuario DEBE depender de ser su Accountable; el de actualizar una tarea, de ser su responsable o el Accountable de su iniciativa. El resultado clave no tiene responsable propio (006): su seguimiento corresponde al Accountable de la iniciativa.
- **FR-011**: Una acción sin permiso NO DEBE mostrarse: ni su botón, ni su lápiz, ni su "+", ni su acción de fila, y NO DEBE reemplazarse por un botón deshabilitado. Esto aplica, como mínimo, a: "Nueva palanca" y Editar en la palanca; "Cargar objetivo" y el "+" de la sección de objetivos de la palanca; Editar y los lápices del objetivo; "Cargar iniciativa" y el "+" de la sección Iniciativas del objetivo; Editar, "Cambiar estado" y los lápices de la iniciativa; la acción de seguimiento de cada resultado clave; y las acciones de tareas (incluido "Cargar tarea").
- **FR-012**: "Ver", la búsqueda, los filtros, Actualizar y la navegación DEBEN mostrarse a los cuatro roles.
- **FR-013**: La columna "Objetivo (peso)" de la bandeja de iniciativas, los pesos de "Información de la iniciativa" (peso en el objetivo y peso en el departamento) y la columna de peso de la lista de iniciativas del detalle del objetivo DEBEN mostrarse solo a CargadorObjetivo y Administrador. Los demás roles DEBEN ver la columna de la bandeja como "Objetivo", sin peso, y NO DEBEN ver esos tres datos. (Decisión de la usuaria del 2026-11-24: la columna del detalle del objetivo sigue al prototipo.)

**Rechazo del guardado**

- **FR-014**: Antes de guardar cualquier alta o edición, la aplicación DEBE volver a verificar el permiso. Si la persona no lo tiene, NO DEBE guardar nada y DEBE mostrar en una línea "No tenés permiso para realizar esta acción.". Esto incluye el servicio de personas (FR-015 a FR-020).

**Servicio de personas, lista Usuario y grupos**

- **FR-015**: La lista Usuario DEBE guardar el rol de cada persona (Visualizador, Usuario, CargadorObjetivo o Administrador). La columna (nombre interno `Rol`, tipo Opción, con los valores del enum de roles) ya existe en el sitio de desarrollo y la usa el código; en cada sitio nuevo la crea la usuaria.
- **FR-016**: El sistema DEBE ofrecer un servicio que escriba a la persona en la lista Usuario y, en la misma operación, la agregue al grupo de SharePoint de su rol.
- **FR-017**: Alta: el servicio DEBE agregar a la persona a la lista y al grupo de su rol. Cambio de rol: DEBE actualizar la columna Rol, agregarla al grupo nuevo y quitarla del anterior. Baja: DEBE quitarla de su grupo y conservar su elemento de la lista como inactivo.
- **FR-018**: Solo el Administrador DEBE poder usar el servicio (FR-014).
- **FR-019**: Si falla alguno de los pasos, el servicio DEBE deshacer lo que alcanzó a hacerse.
- **FR-020**: Si el deshacer también falla, el servicio DEBE informar en una línea que la operación no pudo completarse. Reintentar NO DEBE duplicar nada. Es el mismo criterio que el guardado de iniciativas con resultados clave (006).
- **FR-021**: El servicio NO DEBE tener pantalla en esta feature: lo usará el ABM de usuarios, que es una feature posterior. NO DEBEN crearse rutas ni botones para invocarlo.
- **FR-022**: Si alguien agrega o cambia a una persona directamente en la lista de SharePoint, sin pasar por la aplicación, el grupo NO se actualiza. Esa limitación DEBE quedar documentada, y hasta que exista el ABM las altas y los cambios se hacen a mano en los dos lugares.

**Permisos en las listas de SharePoint**

- **FR-023**: Las listas de la aplicación DEBEN dar lectura solo a los cuatro grupos de roles y dejar de heredar los permisos del sitio, para que una persona sin rol tampoco vea los datos desde SharePoint.
- **FR-024**: La escritura por rol DEBE configurarse en las listas, por grupo (por ejemplo, ninguna lista admite escritura de un Visualizador; solo el Administrador escribe en Palanca y en Usuario), para que SharePoint la imponga aunque alguien edite fuera de la aplicación. Se usan solo los niveles de permiso estándar de SharePoint (Lectura y Colaborar): como no separan crear de editar, CargadorObjetivo tiene Colaborar en Objetivo y la edición de objetivos la controla la aplicación (decisión de la usuaria, 2026-11-24).
- **FR-025**: Los permisos por elemento (un Usuario solo edita las iniciativas de las que es Accountable y las tareas de las que es responsable) DEBE controlarlos la aplicación. NO DEBEN configurarse permisos por elemento en SharePoint.
- **FR-026**: Para que el Administrador pueda agregar y quitar personas de los grupos, el grupo Administrador DEBE ser propietario de los cuatro grupos.
- **FR-027**: La creación de los grupos, de la columna Rol y de la configuración de permisos la hace la usuaria. El quickstart DEBE dejar los pasos, la tabla de permisos de cada grupo en cada lista (lectura y escritura), cómo cortar la herencia y cómo dejar al grupo Administrador como propietario de los cuatro grupos, para repetirlo en cada sitio. Esta feature NO DEBE crear, modificar ni eliminar listas, columnas, grupos ni permisos reales de SharePoint por iniciativa propia.

**Pruebas y documentación**

- **FR-028**: El mock del usuario actual DEBE permitir elegir el rol, incluido "sin rol", para probar los cuatro roles y la pantalla de acceso denegado sin cambiar grupos. Es solo para pruebas: NO DEBE existir un selector de rol en pantalla.
- **FR-029**: El servicio de personas DEBE tener mock y probarse con alta, cambio de rol, baja y falla en cada paso.
- **FR-030**: El quickstart DEBE incluir un escenario por rol y por acción de la matriz, los casos de Usuario siendo y no siendo Accountable o responsable, una persona sin rol entrando por la home y por un link directo, la falla al obtener el rol y la prueba del servicio contra el sitio de desarrollo.
- **FR-031**: Se DEBEN proponer los cambios a RF-19 y RF-20 de `docs/especificacion-funcional.md` como v1.11, y mostrarlos a la usuaria antes de aplicarlos. Los cambios son: nombres de grupos, que una persona sin rol no accede a la aplicación, rol con más de un grupo, permisos por lista y por elemento, quién ve los pesos, la columna Rol de la lista Usuario y su sincronización con los grupos desde código, y que no existe la eliminación de tareas (se quita de RF-19 y de su matriz).

**Alcance y diseño**

- **FR-032**: NO DEBE modificarse `src/core/ui`. NO DEBEN crearse rutas para pantallas que no estén implementadas. Los mensajes de error y los estados vacíos DEBEN ser de una sola línea, sin textos de ayuda, en español (Argentina).
- **FR-033**: Si el prototipo difiere de lo ya implementado en algo que esta spec no menciona, se DEBE consultar antes de decidir.

### Key Entities

- **Rol**: Visualizador, Usuario, CargadorObjetivo o Administrador. Se deduce de los grupos de SharePoint de la persona; con más de uno, vale el de más permisos. Puede no existir (sin rol).
- **Grupo de rol**: grupo de SharePoint del sitio, uno por rol. Aplica los permisos en la aplicación y en las listas. El grupo Administrador es propietario de los cuatro.
- **Usuario de la VP** (la lista y la entidad ya existen): persona del directorio con su departamento, gerencia y subgerencia. Suma el rol (columna Rol) y su estado activo o inactivo. Si está inactiva, no pertenece a ningún grupo de rol.
- **Permiso**: valor identificable (por ejemplo gestionar palancas, crear objetivo, editar iniciativa, cambiar estado, cargar resultados clave, seguir un resultado clave, crear o actualizar tareas, ver pesos) que se calcula una sola vez a partir del rol y, en las acciones por elemento, de ser Accountable o responsable.
- **Iniciativa** y **Tarea** (ya existentes): aportan la relación de la persona con el elemento: el Accountable de la iniciativa y el responsable de la tarea.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para cada uno de los cuatro roles y cada acción de la matriz de FR-010, el 100 % de las pantallas muestra la acción si y solo si el rol la permite.
- **SC-002**: El 100 % de las personas sin rol, entrando por la home o por cualquier link directo, ve la pantalla de acceso denegado y ningún dato ni acceso de la aplicación.
- **SC-003**: En ningún momento de la carga se muestra una pantalla de la aplicación, un dato o un botón antes de conocer el rol de la persona.
- **SC-004**: El 100 % de los intentos de guardar sin permiso (en la aplicación o mediante el servicio de personas) es rechazado sin escribir nada y con el mensaje de una línea.
- **SC-005**: Un Usuario con el mismo conjunto de elementos ve acciones de edición solo en las iniciativas de las que es Accountable y en las tareas de las que es responsable (o de cuya iniciativa es Accountable), en el 100 % de los casos probados.
- **SC-006**: El peso de las iniciativas no aparece en ninguna pantalla para Visualizador ni Usuario.
- **SC-007**: Una persona con rol Administrador puede dar de alta, cambiar de rol y dar de baja a una persona en menos de 1 minuto, y en el 100 % de los casos de falla probados la lista y los grupos quedan alineados o se informa que la operación no pudo completarse.
- **SC-008**: Reintentar un alta, un cambio de rol o una baja fallidos no duplica elementos de la lista ni pertenencias a grupos en ningún caso probado.
- **SC-009**: Una persona puede dejar un sitio nuevo con grupos, columna Rol y permisos de las listas configurados siguiendo solo el quickstart, sin consultar a quien lo escribió.
- **SC-010**: El tiempo hasta ver la home (o la pantalla de acceso denegado) no supera los 3 segundos con el volumen de un año (RNF-05).

## Assumptions

- Se reutiliza lo que ya existe: la lista y la entidad Usuario, el usuario actual de la aplicación (y su mock), el indicador de carga, el diseño de los estados vacíos, y los valores de permiso que dejaron las features 002 a 008 (gestionar palancas, crear objetivo, editar objetivo, crear y editar iniciativa, cambiar estado, cargar y seguir resultados clave, crear tarea, editar tarea y registrar avance).
- Esta feature no crea listas ni columnas por iniciativa propia: la columna Rol y los grupos los crea la usuaria. El plan DEBE avisar antes de usar la columna Rol.
- La relación "Accountable de la iniciativa" y "responsable de la tarea" se establece comparando a la persona actual con la persona registrada en el elemento. El plan define con qué identificador se compara.
- Una persona inactiva en la lista Usuario no pertenece a ningún grupo de rol y, por lo tanto, no tiene rol.
- El prototipo permite hacer el seguimiento de un resultado clave a un "responsable del resultado clave"; la 006 decidió que el resultado clave no tiene responsable, y la matriz de la usuaria lo reserva al Accountable de la iniciativa. Manda la matriz.
- El prototipo permite editar y cargar según rol de forma equivalente a la matriz (Usuario crea iniciativas y tareas; CargadorObjetivo y Administrador ven pesos). Donde el prototipo muestre otra cosa, manda esta spec.
- "Actualizar una tarea" abarca editar sus datos y registrar su avance, porque la matriz de RF-19 no los separa. "Sus riesgos y su presupuesto" no aplica todavía, porque riesgos y presupuesto no están implementados.
- La eliminación de tareas no existe (007) y se saca de RF-19 y de su matriz (v1.11).
- Quedan fuera de alcance: la pantalla ABM de usuarios, que usará el servicio de esta feature; el resto del ABM de maestros y parámetros (M9) y la pantalla a la que lleva el botón "ABM" de la home; reasignar elementos cuando una persona deja la VP (RF-20); y el tablero ejecutivo (RF-17).
- Persona dada de baja con la aplicación abierta: el rol se obtiene al abrir la aplicación, por lo que lo ya cargado puede seguir visible hasta que recargue; como cada guardado vuelve a leer los grupos, cualquier guardado se rechaza con el mensaje de falta de permiso, y los permisos de las listas lo refuerzan.
