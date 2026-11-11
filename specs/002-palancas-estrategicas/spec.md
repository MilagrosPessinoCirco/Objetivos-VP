# Feature Specification: Palancas estratégicas (ABM y vista)

**Feature Branch**: `002-palancas-estrategicas`

**Created**: 2026-11-11

**Status**: Draft

**Input**: User description: "Feature: Palancas estratégicas (ABM y vista). Fuente: docs/especificacion-funcional.md, RF-01 y RF-02. Glosario en la sección 3. Crear, editar e inactivar palancas (nombre, descripción, activa); grilla de palancas activas con su descripción y detalle de cada una con migas de pan (Inicio → Palancas → nombre) y botón Volver. Fuera de alcance: roles y permisos (RF-19), cantidad y lista de objetivos y su avance, selector Objetivos del VP / Todos, despliegue de objetivos en la grilla y creación de la lista de SharePoint."

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, pantallas "Galería de palancas estratégicas" (`scr.palancas`), detalle de palanca (`scr.palanca`) y modal "Nueva palanca / Editar palanca" (`m.is.palanca`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver la grilla de palancas y entrar al detalle (Priority: P1)

Desde el acceso de palancas de la home, la persona llega a la "Galería de palancas estratégicas". Ve una grilla con las palancas activas de la VP RRII, cada una con su ID, su nombre y su descripción. Desde cada fila puede entrar al detalle de la palanca, donde ve su ID, nombre, si está activa y su descripción, con migas de pan (Inicio → Palancas → nombre de la palanca) y un botón para volver.

**Why this priority**: Es la puerta de entrada a la estrategia de la VP y la base sobre la que se apoyan las demás historias (crear, editar e inactivar se hacen desde esta grilla o desde el detalle). Con datos ya cargados en la lista, sola ya permite consultar las palancas vigentes.

**Independent Test**: Con palancas activas e inactivas cargadas, entrar desde la home, verificar que la grilla muestra solo las activas con su descripción, abrir el detalle de una y volver por cada link de las migas de pan y por el botón Volver.

**Acceptance Scenarios**:

1. **Given** la home abierta, **When** la persona activa el acceso de palancas, **Then** se abre la "Galería de palancas estratégicas".
2. **Given** palancas activas e inactivas registradas, **When** se abre la grilla, **Then** se listan solo las activas, cada una con su ID, nombre y descripción.
3. **Given** la grilla abierta, **When** la persona elige "Ver palanca" en una fila, **Then** se abre el detalle de esa palanca con su ID, nombre, estado (Activa / Inactiva) y descripción.
4. **Given** el detalle de una palanca, **When** la persona observa la parte superior, **Then** ve las migas de pan "Inicio → Palancas → [nombre de la palanca]", donde "Inicio" y "Palancas" son links y el último nivel es el actual.
5. **Given** el detalle de una palanca, **When** la persona activa "Inicio", "Palancas" o el botón Volver, **Then** llega respectivamente a la home, a la grilla de palancas o a la pantalla anterior.
6. **Given** la grilla abierta, **When** la persona activa el botón Volver, **Then** vuelve a la home.
7. **Given** la grilla abierta, **When** la persona escribe en la búsqueda rápida parte del ID o del nombre de una palanca, **Then** la grilla muestra solo las palancas activas cuyo ID o nombre contienen el texto, sin distinguir mayúsculas de minúsculas.
8. **Given** una búsqueda sin coincidencias, **When** se aplica, **Then** la grilla muestra el estado vacío "No hay palancas con esta búsqueda."
10. **Given** ninguna palanca activa registrada y la búsqueda vacía, **When** se abre la grilla, **Then** se muestra el estado vacío "No hay palancas cargadas." y "Nueva palanca" sigue disponible.
9. **Given** la grilla abierta, **When** la persona activa "Actualizar", **Then** la grilla vuelve a cargar las palancas registradas, incluidos los cambios hechos fuera de la pantalla, y conserva el texto de búsqueda.

---

### User Story 2 - Crear una palanca (Priority: P1)

La persona elige "Nueva palanca", completa nombre y descripción (la palanca queda activa por defecto) y la guarda. La palanca aparece en la grilla, lista para que después se le asocien objetivos.

**Why this priority**: Sin palancas no se pueden cargar objetivos de la VP RRII; es la condición previa de la carga del año (entrega 1).

**Independent Test**: Crear una palanca nueva desde la grilla, verificar el mensaje de confirmación, que aparece en la grilla con un ID asignado por el sistema y que el formulario no permite guardar sin nombre o sin descripción.

**Acceptance Scenarios**:

1. **Given** la grilla abierta, **When** la persona elige "Nueva palanca", **Then** se abre el formulario "Nueva palanca" con Nombre y Descripción vacíos, Activa en "Sí" y la aclaración "Las palancas no se eliminan: se marcan como inactivas."
2. **Given** el formulario de alta con nombre y descripción completos, **When** la persona guarda, **Then** la palanca se registra con un ID asignado por el sistema, se muestra el mensaje «La palanca "[nombre]" se ha cargado correctamente.» y aparece en la grilla.
3. **Given** el formulario de alta con el nombre o la descripción vacíos, **When** la persona intenta guardar, **Then** no se guarda y cada campo obligatorio vacío muestra su error en línea.
4. **Given** el formulario de alta con datos cargados, **When** la persona cancela, **Then** no se registra nada y la grilla queda como estaba.
5. **Given** el formulario de alta con Activa en "No", **When** la persona guarda, **Then** la palanca se registra inactiva y no aparece en la grilla.

---

### User Story 3 - Editar una palanca (Priority: P2)

La persona edita el nombre y la descripción de una palanca existente, desde la grilla o desde su detalle.

**Why this priority**: Las palancas se mantienen durante el año, pero sus textos pueden necesitar ajustes; es secundario frente a tenerlas cargadas.

**Independent Test**: Editar el nombre y la descripción de una palanca desde la grilla y desde el detalle, verificar el mensaje de confirmación y que los cambios se ven en ambas pantallas.

**Acceptance Scenarios**:

1. **Given** la grilla abierta, **When** la persona elige "Editar palanca" en una fila, **Then** se abre el formulario "Editar palanca [ID]" con el nombre, la descripción y el estado actuales.
2. **Given** el detalle de una palanca, **When** la persona elige "Editar", **Then** se abre el mismo formulario con los datos actuales.
3. **Given** el formulario de edición con nombre y descripción completos, **When** la persona guarda, **Then** se actualizan los datos, se muestra el mensaje «La palanca "[nombre]" se ha actualizado correctamente.» y la pantalla de origen refleja los cambios.
4. **Given** el formulario de edición, **When** la persona deja vacío el nombre o la descripción e intenta guardar, **Then** no se guarda y se muestra el error en línea del campo.
5. **Given** el formulario de edición con cambios, **When** la persona cancela, **Then** la palanca queda sin cambios.

---

### User Story 4 - Inactivar una palanca (Priority: P2)

Cuando una palanca deja de usarse, la persona la marca como inactiva desde el formulario de edición. La palanca no se elimina: deja de mostrarse en la grilla y conserva sus datos.

**Why this priority**: Las palancas se replantean al inicio de cada año; inactivar las que dejan de usarse mantiene la grilla vigente sin perder la historia de los objetivos que las usan.

**Independent Test**: Editar una palanca activa, pasar Activa a "No", guardar y verificar que deja de aparecer en la grilla, que sus datos se conservan y que en ninguna pantalla existe una acción de eliminar.

**Acceptance Scenarios**:

1. **Given** el formulario de edición de una palanca activa, **When** la persona cambia Activa a "No" y guarda, **Then** la palanca queda inactiva y conserva su ID, nombre y descripción.
2. **Given** una palanca inactivada desde la grilla, **When** se cierra el formulario, **Then** la palanca ya no aparece en la grilla.
3. **Given** una palanca inactivada desde su detalle, **When** se cierra el formulario, **Then** el detalle sigue abierto y muestra el estado "Inactiva".
4. **Given** cualquier pantalla de esta feature, **When** la persona busca una acción para eliminar una palanca, **Then** no la encuentra.
5. **Given** una palanca inactiva, **When** la persona la busca en la aplicación (grilla o búsqueda rápida), **Then** no aparece: en esta feature no hay forma de llegar a una palanca inactiva desde la aplicación, y su reactivación se hace directamente en la lista de SharePoint.

---

### Edge Cases

- No hay palancas activas y la búsqueda está vacía: la grilla muestra "No hay palancas cargadas." y "Nueva palanca" sigue disponible.
- Se inactiva una palanca que coincide con la búsqueda activa: deja de mostrarse en el resultado.
- Nombre o descripción compuestos solo por espacios: se consideran vacíos y no se puede guardar.
- Descripciones largas: la grilla y el detalle las muestran completas, sin romper la disposición.
- Falla al cargar, guardar o editar: se informa a la persona que la operación no pudo completarse, no se muestra un éxito falso y, en el formulario, se conservan los datos ingresados para reintentar.
- Se pide el detalle de una palanca que ya no existe: se informa que no se encontró y se ofrece volver a la grilla.
- Nombres repetidos: RF-01 no exige que el nombre sea único, por lo que se permite guardar dos palancas con el mismo nombre.

## Clarifications

### Session 2026-11-11

- Q: ¿Cómo se llega a una palanca inactiva? → A: En esta feature no se llega; se reactiva desde la lista de SharePoint. La pantalla "Configuración" queda fuera de alcance.
- Q: ¿Qué herramientas lleva la grilla? → A: "Nueva palanca", búsqueda rápida por ID y nombre, y "Actualizar". Sin panel de Filtros.
- Q: ¿Se agregan migas de pan al detalle aunque el prototipo no las tenga? → A: Sí, como desvío aprobado, con el estilo de migas del detalle de objetivo.

## Requirements *(mandatory)*

### Functional Requirements

**Grilla de palancas**

- **FR-001**: El acceso "Palancas y objetivos" de la home DEBE abrir la "Galería de palancas estratégicas". Los demás accesos de la home no cambian su comportamiento.
- **FR-002**: La grilla DEBE mostrar solo las palancas activas, con las columnas ID, Palanca (nombre) y Descripción, y en cada fila las acciones "Editar palanca" y "Ver palanca".
- **FR-003**: La grilla DEBE ofrecer la acción "Nueva palanca" y un botón Volver que lleva a la home.
- **FR-004**: La grilla DEBE ofrecer, además de "Nueva palanca", una búsqueda rápida con el texto de ayuda "Buscar palanca", que filtra las palancas activas por coincidencia parcial con su ID o su nombre, sin distinguir mayúsculas de minúsculas, y un botón "Actualizar" que vuelve a cargar las palancas conservando la búsqueda. El panel de Filtros del prototipo NO forma parte de esta feature.
- **FR-004a**: Si la búsqueda no tiene coincidencias, la grilla DEBE mostrar solo el texto "No hay palancas con esta búsqueda.". Si no hay ninguna palanca activa y la búsqueda está vacía, DEBE mostrar solo el texto "No hay palancas cargadas." y mantener disponible "Nueva palanca". Ningún estado vacío lleva textos de ayuda ni aclaraciones adicionales.

**Detalle de palanca**

- **FR-005**: El detalle DEBE mostrar el ID y el nombre como título, el estado (Activa / Inactiva) como indicador, y una sección "Información general" con ID, Palanca, Activa (Sí / No) y Descripción.
- **FR-006**: El detalle DEBE mostrar migas de pan "Inicio → Palancas → [nombre de la palanca]", con "Inicio" enlazado a la home, "Palancas" enlazado a la grilla y el nombre como nivel actual, no enlazado. Es un desvío aprobado respecto del prototipo, cuyo detalle de palanca no tiene migas de pan: se reproduce el estilo de migas del detalle de objetivo del prototipo (`nav.crumb`), y el plan DEBE registrar el desvío.
- **FR-007**: El detalle DEBE ofrecer un botón Volver que lleva a la pantalla anterior, y un pie con "Cancelar" (vuelve a la pantalla anterior) y "Editar" (abre el formulario de edición).

**Alta, edición e inactivación**

- **FR-008**: Alta y edición DEBEN usar el mismo formulario, con los campos Nombre (obligatorio), Descripción (obligatoria, texto largo) y Activa (obligatorio, Sí / No), titulado "Nueva palanca" o "Editar palanca [ID]", con la aclaración "Las palancas no se eliminan: se marcan como inactivas." y las acciones Cancelar y Guardar.
- **FR-009**: En el alta, Activa DEBE venir en "Sí" por defecto.
- **FR-010**: El sistema NO DEBE guardar una palanca sin nombre o sin descripción (vacíos o solo espacios); cada campo obligatorio faltante DEBE mostrar su error en línea.
- **FR-011**: El ID DEBE asignarlo el sistema al registrar la palanca y NO DEBE poder editarse.
- **FR-012**: Al guardar con éxito, el sistema DEBE mostrar «La palanca "[nombre]" se ha cargado correctamente.» en el alta o «La palanca "[nombre]" se ha actualizado correctamente.» en la edición, y la pantalla de origen DEBE reflejar el cambio.
- **FR-013**: Cancelar el formulario NO DEBE registrar ningún cambio.
- **FR-014**: Marcar Activa en "No" y guardar DEBE dejar la palanca inactiva conservando todos sus datos; la palanca deja de mostrarse en la grilla.
- **FR-015**: La aplicación NO DEBE ofrecer ninguna acción para eliminar una palanca.
- **FR-016**: Si una operación de carga o guardado falla, el sistema DEBE informar a la persona que no pudo completarse, sin mostrar un éxito falso y conservando lo ingresado en el formulario.

**Preparación para permisos**

- **FR-017**: En esta feature, cualquier persona que use la aplicación DEBE poder crear, editar e inactivar palancas.
- **FR-018**: Las acciones "Nueva palanca", "Editar palanca" (grilla) y "Editar" (detalle) DEBEN estar identificadas como acciones de administración de palancas, de modo que una feature posterior (RF-19) pueda ocultarlas a quienes no sean Administrador sin rehacer las pantallas. La inactivación se hace desde el formulario de edición, por lo que queda alcanzada por la misma restricción.

**Alcance visual**

- **FR-019**: Todos los textos visibles DEBEN estar en español (Argentina) y coincidir con los del prototipo, salvo los que esta spec define.
- **FR-020**: Las pantallas NO DEBEN mostrar los elementos del prototipo que pertenecen a otras features: columna "Objetivos" y cantidad de objetivos, botón de despliegue de objetivos en la fila, "Pesos VP RRII", "Cargar objetivo", la línea de resumen con objetivos y avance de la VP, la sección "Objetivos de la palanca", el botón "Ubicación en la estrategia", el botón y el panel de "Filtros", y el selector "Objetivos del VP / Todos".

### Key Entities

- **Palanca estratégica**: prioridad estratégica de la VP RRII que agrupa objetivos con un mismo propósito de negocio. Es enunciativa: no tiene estado de avance ni porcentaje. Atributos: ID (autonumérico, asignado por el sistema), Nombre (texto, obligatorio), Descripción (texto largo, obligatoria), Activa (Sí / No, obligatorio, por defecto Sí). Solo existe para la VP RRII. Más adelante agrupará 0..N objetivos (feature de objetivos); nunca se elimina.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona puede crear una palanca nueva, desde la grilla, en menos de 1 minuto.
- **SC-002**: El 100 % de los intentos de guardar sin nombre o sin descripción se rechazan, con el error indicado en el campo.
- **SC-003**: El 100 % de las palancas listadas en la grilla están activas, y ninguna palanca activa falta en ella.
- **SC-004**: Después de inactivar una palanca, su ID, nombre y descripción siguen registrados sin cambios; en ninguna pantalla existe una acción de eliminar.
- **SC-005**: Desde el detalle de una palanca, la persona llega a la home o a la grilla en un solo clic, mediante las migas de pan.
- **SC-006**: Con el volumen previsto (decenas de palancas), la grilla y el detalle se muestran en menos de 3 segundos.
- **SC-007**: En una comparación lado a lado con el prototipo, una persona revisora no encuentra diferencias de disposición ni de textos en la grilla, el detalle y el formulario, fuera de los elementos excluidos por FR-020 y los desvíos aprobados en esta spec y en el plan.

## Assumptions

- El acceso de la home que menciona el pedido como "Palancas" es el acceso "Palancas y objetivos" de la feature 001. Esta feature lo habilita para navegar, y deja sin cambios el comportamiento de los otros cuatro accesos y del "Manual de usuario" (feature 001, FR-010).
- La lista de palancas en SharePoint ya existe; su creación está fuera de alcance. Sus nombres internos se relevan en el plan.
- Lo que se ve en pantalla sale del prototipo: el formulario es un modal con Nombre, Descripción y Activa; los mensajes de éxito, la aclaración del formulario y las etiquetas de las acciones son los del prototipo. Las reglas de negocio salen de RF-01 y RF-02.
- El formato visible del ID (el prototipo muestra "PAL-1") se define en el plan; el valor lo asigna siempre el sistema.
- La inactivación se hace con el campo Activa del formulario de edición, como en el prototipo; no hay una acción "Inactivar" separada.
- No se pide confirmación antes de guardar (el prototipo guarda la palanca sin confirmación).
- No se valida que el nombre sea único, porque RF-01 no lo exige.
- Que las palancas inactivas no se ofrezcan al cargar objetivos y sigan visibles en los objetivos que ya las usan lo implementa la feature de objetivos.
- El filtro por año de RF-02 ("Solo muestra palancas activas, salvo que se filtre por año") depende de los objetivos del año y queda para la feature de objetivos, junto con el panel de Filtros y la búsqueda por objetivo.
- En esta feature una palanca inactiva no es accesible desde la aplicación; se reactiva en la lista de SharePoint. La pantalla "Configuración" del prototipo queda fuera de alcance.
- Los textos "Buscar palanca" y "No hay palancas con esta búsqueda." adaptan los del prototipo, que mencionan objetivos y filtros. "No hay palancas cargadas." lo define esta spec, porque el prototipo no tiene ese estado vacío.
- Criterio de diseño: no se agregan textos de ayuda ni aclaraciones que no estén en el prototipo; los estados vacíos llevan una sola línea.
- Fuera de alcance: la pantalla "Configuración", el panel de Filtros, roles y permisos (RF-19), la cantidad y la lista de objetivos y su avance (C-04), el selector "Objetivos del VP / Todos", el despliegue de objetivos en la grilla, la "Ubicación en la estrategia", la adaptación a pantallas angostas y la creación de la lista de SharePoint.
