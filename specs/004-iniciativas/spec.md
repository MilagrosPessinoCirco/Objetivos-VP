# Feature Specification: Iniciativas (bandeja, alta, edición, cambio de estado y vista)

**Feature Branch**: `004-iniciativas`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "Feature: Iniciativas (bandeja, alta, edición, cambio de estado y vista). Fuente: docs/especificacion-funcional.md, RF-07, RF-08 (solo el peso de las iniciativas), RF-11 y RF-16 (solo la bandeja de iniciativas), y el prototipo v9 (pantallas Iniciativas, detalle de objetivo y detalle de iniciativa, y panel de cargar/editar iniciativa). Continúa la 003-objetivos, que dejó fuera la lista de iniciativas. Bandeja Mis iniciativas / Todas con búsqueda, filtros y paginado; alta desde la bandeja o desde el detalle del objetivo; edición; cambio de estado con comentario ejecutivo; detalle de iniciativa con migas de pan; sección Iniciativas en el detalle del objetivo; peso calculado en partes iguales para objetivos de la VP RRII. Fuera de alcance: resultados clave y avance (C-01 a C-04, C-07), tareas, riesgos, decisiones y presupuesto (RF-12 a RF-15), peso junto al objetivo en la bandeja, filtros por departamento del usuario (RF-20), peso en el departamento, bandeja de tareas y roles (RF-19)." (ver Clarifications)

**Fuente vigente**: `docs/especificacion-funcional.md` v1.9, con lo decidido en la reunión 6, y la feature 005 (pesos del objetivo por departamento y por VP), ya implementada. Ver Clarifications, sesión 2026-11-18.

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, que contiene el prototipo v10 aunque el nombre de la carpeta diga v5, pantallas "Iniciativas" (bandeja), detalle de objetivo, detalle de iniciativa y panel de cargar/editar iniciativa. Donde el prototipo difiere de lo ya implementado en palancas y objetivos (features 002 y 003), manda lo implementado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cargar una iniciativa (Priority: P1)

La persona carga una iniciativa desde la bandeja, eligiendo el objetivo, o desde el detalle de un objetivo, con el objetivo ya elegido. Completa nombre, descripción / impacto esperado, accountable (por defecto, ella misma), áreas involucradas y fechas. Confirma y la iniciativa queda registrada como "No iniciada", asociada a su objetivo.

**Why this priority**: La iniciativa es la principal unidad de gestión. Sin iniciativas cargadas no hay bandeja, detalle ni pesos.

**Independent Test**: Cargar una iniciativa desde la bandeja y otra desde el detalle de un objetivo; verificar el modal de confirmación, el mensaje de éxito, que se queda en la pantalla de origen, que la iniciativa aparece en la bandeja y en el detalle de su objetivo con estado "No iniciada" y un ID asignado, y que no se puede guardar con campos obligatorios vacíos.

**Acceptance Scenarios**:

1. **Given** la bandeja, **When** la persona elige "Cargar iniciativa", **Then** se abre el panel de alta con el Objetivo sin elegir y Accountable con la persona que carga.
2. **Given** el detalle de un objetivo, **When** la persona elige el "+" de la sección Iniciativas, **Then** se abre el panel de alta con ese objetivo elegido.
3. **Given** el panel de alta, **When** la persona lo observa, **Then** ve, en una columna: Objetivo, Nombre de la iniciativa, Descripción / impacto esperado, Accountable, Áreas involucradas y, lado a lado, Fecha de inicio y Fecha de compromiso; no ve Estado ni Peso; el pie fijo muestra Cancelar y "Cargar iniciativa".
4. **Given** el panel con un campo obligatorio vacío, **When** la persona elige "Cargar iniciativa", **Then** no se guarda y cada campo faltante muestra en línea "Este campo es obligatorio.".
5. **Given** una Fecha de compromiso anterior a la Fecha de inicio, **When** la persona elige "Cargar iniciativa", **Then** no se guarda y el campo de la fecha de compromiso indica el error.
6. **Given** un objetivo con fechas y una fecha de la iniciativa fuera de ellas, **When** la persona elige "Cargar iniciativa", **Then** no se guarda y el campo de la fecha fuera de rango indica el error.
7. **Given** el panel completo y válido, **When** la persona elige "Cargar iniciativa", **Then** se muestra el modal "Estás por cargar la iniciativa. ¿Querés continuar?" con Cancelar y Aceptar.
8. **Given** el modal de confirmación, **When** la persona elige Aceptar, **Then** la iniciativa se registra en estado "No iniciada" con un ID asignado, el panel se cierra, la persona sigue en la pantalla de origen y ve «La iniciativa "[nombre]" se ha cargado correctamente.».
9. **Given** el modal de confirmación, **When** la persona elige Cancelar, **Then** el modal se cierra, no se registra nada y el panel conserva lo ingresado.
10. **Given** el panel con datos cargados, **When** la persona elige Cancelar en el pie, **Then** el panel se cierra y no se registra nada.
11. **Given** el campo Accountable, **When** la persona agrega o quita usuarios, **Then** admite uno o más, sin límite de cantidad.
12. **Given** el campo Áreas involucradas, **When** la persona lo abre, **Then** ofrece todas las áreas del maestro, incluidas las de otra VP o de otro departamento que el del objetivo, y permite elegir varias o ninguna.

---

### User Story 2 - Ver y recorrer la bandeja de iniciativas (Priority: P1)

Desde el acceso "Mis iniciativas" de la home, la persona entra a la bandeja en la solapa "Mis iniciativas", con las iniciativas en las que es accountable. En la solapa "Todas" ve todas las iniciativas. Desde cada fila entra al detalle.

**Why this priority**: Es el punto de entrada para encontrar y seguir las iniciativas.

**Independent Test**: Con iniciativas donde la persona es accountable y otras donde no, entrar desde la home, verificar la solapa inicial, los contadores, las columnas, el paginado y la navegación a un detalle desde "Ver".

**Acceptance Scenarios**:

1. **Given** la home, **When** la persona elige "Mis iniciativas", **Then** se abre la bandeja en la solapa "Mis iniciativas", con el título "Mis iniciativas".
2. **Given** la bandeja, **When** se abre, **Then** el encabezado muestra el botón Volver, el título, la búsqueda, el botón Filtros y el botón "Cargar iniciativa".
3. **Given** la solapa "Mis iniciativas", **When** se abre, **Then** lista solo las iniciativas en las que la persona actual figura entre los accountable.
4. **Given** la bandeja, **When** la persona elige la solapa "Todas", **Then** el título pasa a "Todas las iniciativas" y se listan todas las iniciativas.
5. **Given** la bandeja, **When** se observa, **Then** cada solapa muestra su cantidad total, que no depende de la búsqueda ni de los filtros, y arriba de la grilla se lee "N iniciativas en esta vista", con N igual a las iniciativas de la vista actual con la búsqueda y los filtros aplicados.
6. **Given** la grilla, **When** se observa, **Then** sus columnas son ID, Iniciativa, Objetivo (ID · nombre), Accountable, Estado y Ver, con Estado como anteúltima columna y el estado como chip.
7. **Given** una fila, **When** la persona elige "Ver", **Then** se abre el detalle de esa iniciativa.
8. **Given** más de 10 iniciativas en la vista, **When** se observa la bandeja, **Then** se muestran de a 10, con "Mostrando X–Y de N" a la izquierda y el paginador centrado, fijos al pie de la pantalla.
9. **Given** 10 o menos iniciativas en la vista, **When** se observa la bandeja, **Then** no se muestra paginado.
10. **Given** ninguna iniciativa cargada, **When** se abre la bandeja, **Then** se muestra "No hay iniciativas cargadas.".
11. **Given** la bandeja, **When** la persona elige Volver, **Then** vuelve a la home.

---

### User Story 3 - Buscar y filtrar en la bandeja (Priority: P2)

La persona busca por parte del ID o del nombre, y filtra por departamento del objetivo, objetivo, accountable, estado y año desde un panel lateral. Búsqueda y filtros se combinan.

**Why this priority**: Con el volumen del año, la bandeja sin búsqueda ni filtros deja de ser útil, pero la bandeja básica ya aporta valor sin ellos.

**Independent Test**: Buscar por parte de un ID y de un nombre en distinta capitalización, aplicar cada filtro, combinarlos con la búsqueda y verificar contadores y estado vacío.

**Acceptance Scenarios**:

1. **Given** la bandeja, **When** la persona escribe parte de un ID o de un nombre, sin importar mayúsculas, **Then** se listan solo las iniciativas que coinciden.
2. **Given** la bandeja, **When** la persona elige Filtros, **Then** se abre un panel lateral con Departamento, Objetivo, Accountable, Estado y Año, cada uno con un solo valor elegible, y los botones "Aplicar" y "Limpiar filtros".
3. **Given** un filtro de departamento, **When** se aplica, **Then** se listan las iniciativas cuyo objetivo pertenece a ese departamento.
4. **Given** una búsqueda y uno o más filtros, **When** se aplican, **Then** se listan solo las iniciativas que cumplen todo a la vez, el contador "N iniciativas en esta vista" y el paginado reflejan ese resultado, y las cantidades de las solapas no cambian.
5. **Given** una búsqueda o filtros sin coincidencias, **When** se aplican, **Then** se muestra "No hay iniciativas con estos filtros.".
6. **Given** búsqueda y filtros aplicados, **When** la persona cambia de solapa, **Then** se mantienen aplicados sobre la nueva solapa.
7. **Given** una iniciativa con fecha de inicio en 2026 y fecha de compromiso en 2028, **When** la persona filtra por 2026, 2027 o 2028, **Then** la iniciativa aparece en los tres casos, y no aparece al filtrar por 2025 o 2029.
8. **Given** el panel de filtros con valores elegidos, **When** la persona todavía no eligió "Aplicar", **Then** la grilla no cambia; al elegir "Aplicar", la grilla se filtra.
9. **Given** filtros aplicados, **When** la persona elige "Limpiar filtros", **Then** se quitan todos los filtros y la grilla muestra la solapa con solo la búsqueda aplicada.

---

### User Story 4 - Ver el detalle de una iniciativa (Priority: P2)

La persona abre una iniciativa y ve su encabezado (ID · nombre y estado), las migas de pan hasta la iniciativa, la sección "Información de la iniciativa" y la sección "Comentario ejecutivo".

**Why this priority**: Permite consultar la iniciativa completa y es el lugar desde donde se edita y se cambia el estado.

**Independent Test**: Abrir el detalle de una iniciativa de un objetivo de la VP RRII y de una de otra VP; verificar datos, peso, secciones contraídas y expandidas, migas, Volver y pie fijo.

**Acceptance Scenarios**:

1. **Given** una iniciativa, **When** se abre su detalle, **Then** el encabezado muestra Volver, "ID · nombre" y el estado como chip.
2. **Given** una iniciativa de un objetivo de la VP RRII, **When** se abre su detalle, **Then** las migas muestran "Inicio → Palancas → [palanca] → [objetivo] → [iniciativa]", con todos los niveles enlazados salvo el último.
3. **Given** el detalle, **When** la persona activa un nivel de las migas, **Then** va a la home, a la grilla de palancas, al detalle de la palanca o al detalle del objetivo, según corresponda.
4. **Given** el detalle, **When** se abre, **Then** "Información de la iniciativa" está expandida y "Comentario ejecutivo" contraída; cada una tiene chevron para contraer y expandir y lápiz de edición.
5. **Given** una iniciativa de un objetivo de la VP RRII, **When** se expande "Información de la iniciativa", **Then** muestra objetivo, accountable, áreas involucradas, estado, fecha de inicio, fecha de compromiso, peso en el objetivo, peso en el departamento y descripción / impacto esperado.
6. **Given** una iniciativa de un objetivo de otra VP, **When** se expande "Información de la iniciativa", **Then** muestra los mismos datos sin el peso en el objetivo ni el peso en el departamento.
7. **Given** una iniciativa no cancelada que pesa 25 % en un objetivo de la VP RRII que pesa 40 % en su departamento, **When** se expande "Información de la iniciativa", **Then** "Peso en el departamento" muestra 10 %, inmediatamente después de "Peso en el objetivo".
8. **Given** una iniciativa no cancelada de un objetivo de la VP RRII sin peso en el departamento cargado, **When** se expande "Información de la iniciativa", **Then** "Peso en el departamento" muestra "—".
9. **Given** un objetivo de la VP RRII que pesa 40 % en su departamento, con 3 iniciativas no canceladas, **When** se expande "Información de la iniciativa" de una de ellas, **Then** "Peso en el objetivo" muestra 33,33 % y "Peso en el departamento" muestra 13,33 %, calculado con el peso exacto en el objetivo (100 % ÷ 3) y redondeado solo al mostrarlo.
10. **Given** una iniciativa con comentario ejecutivo, **When** se expande esa sección, **Then** muestra la fecha y el autor de la última modificación y el texto.
11. **Given** una iniciativa sin comentario ejecutivo, **When** se expande esa sección, **Then** muestra "Todavía no hay comentario ejecutivo.".
12. **Given** el detalle, **When** se observa el pie fijo, **Then** muestra Cancelar, Editar y "Cambiar estado".
13. **Given** el detalle abierto desde la bandeja o desde el detalle de un objetivo, **When** la persona elige Volver o Cancelar, **Then** vuelve a esa pantalla de origen.
14. **Given** el detalle abierto por link directo o sin pantalla de origen, **When** la persona elige Volver o Cancelar, **Then** va al detalle del objetivo de la iniciativa.

---

### User Story 5 - Ver las iniciativas en el detalle del objetivo (Priority: P2)

En el detalle de un objetivo, la persona ve la sección Iniciativas con la lista de sus iniciativas y entra al detalle de cada una.

**Why this priority**: Completa el detalle del objetivo, que la feature 003 dejó sin iniciativas, y es el camino natural palanca → objetivo → iniciativa.

**Independent Test**: Abrir el detalle de un objetivo de la VP RRII con varias iniciativas (alguna cancelada) y el de un objetivo de otra VP; verificar columnas, pesos y navegación.

**Acceptance Scenarios**:

1. **Given** el detalle de un objetivo de la VP RRII, **When** se observa la sección Iniciativas, **Then** se titula "Iniciativas (N)", con N igual a la cantidad de iniciativas del objetivo (incluidas las canceladas), tiene un "+" en el título y una grilla con ID, Iniciativa, Accountable, Peso, Estado y Ver, con Estado como anteúltima columna.
2. **Given** el detalle de un objetivo de otra VP, **When** se observa la sección Iniciativas, **Then** la grilla muestra sus iniciativas sin la columna Peso.
3. **Given** una fila, **When** la persona elige "Ver", **Then** se abre el detalle de esa iniciativa.
4. **Given** un objetivo de la VP RRII con 5 iniciativas no canceladas, **When** se observa la grilla, **Then** cada una muestra 20 % de peso.
5. **Given** un objetivo de la VP RRII con 4 iniciativas no canceladas y 1 cancelada, **When** se observa la grilla, **Then** las 4 muestran 25 % y la cancelada no muestra peso.
6. **Given** un objetivo sin iniciativas, **When** se observa la sección, **Then** se muestra el estado vacío de una línea "Este objetivo no tiene iniciativas cargadas.".
7. **Given** una iniciativa cargada desde el "+", **When** se guarda, **Then** la persona sigue en el detalle del objetivo y la grilla la incluye con los pesos recalculados.

---

### User Story 6 - Editar una iniciativa (Priority: P2)

Desde el detalle, la persona edita una iniciativa en el mismo panel del alta, que trae los datos actuales e incluye el Estado.

**Why this priority**: Las iniciativas cambian durante el año y requieren correcciones; es secundario frente a cargarlas y verlas.

**Independent Test**: Editar una iniciativa, cambiar nombre, accountable, fechas y estado, confirmar y verificar mensaje, detalle actualizado y pesos recalculados si pasó a o desde Cancelada.

**Acceptance Scenarios**:

1. **Given** el detalle, **When** la persona elige Editar o el lápiz de "Información de la iniciativa", **Then** se abre el panel de edición con los datos actuales, el Estado visible y el pie Cancelar · "Guardar cambios".
2. **Given** el panel de edición, **When** la persona observa el Objetivo, **Then** lo ve en modo lectura y no puede cambiarlo.
3. **Given** cambios válidos, **When** la persona elige "Guardar cambios", **Then** se muestra el modal "Estás por guardar los cambios de la iniciativa. ¿Querés continuar?" con Cancelar y Aceptar.
4. **Given** el modal, **When** la persona elige Aceptar, **Then** se guardan los cambios, el panel se cierra, la persona sigue en el detalle, que refleja los cambios, y ve «La iniciativa "[nombre]" se ha actualizado correctamente.».
5. **Given** el panel de edición con un campo obligatorio vacío o fechas inválidas, **When** la persona elige "Guardar cambios", **Then** no se guarda y el error se muestra en el campo.
6. **Given** el panel de edición con cambios, **When** la persona elige Cancelar, **Then** la iniciativa queda sin cambios.
7. **Given** una iniciativa de un objetivo de la VP RRII, **When** su estado pasa a Cancelada o deja de ser Cancelada, **Then** el peso de las demás iniciativas no canceladas del objetivo se recalcula.

---

### User Story 7 - Cambiar el estado y el comentario ejecutivo (Priority: P2)

Desde el detalle, la persona elige "Cambiar estado" o el lápiz de "Comentario ejecutivo" y, en un panel lateral, cambia el estado y actualiza el comentario ejecutivo.

**Why this priority**: Es el seguimiento cotidiano de la iniciativa por parte de sus accountable.

**Independent Test**: Cambiar el estado de una iniciativa con un comentario nuevo, confirmar y verificar chip, comentario con fecha y autor, y pesos recalculados al cancelar.

**Acceptance Scenarios**:

1. **Given** el detalle, **When** la persona elige "Cambiar estado" o el lápiz de "Comentario ejecutivo", **Then** se abre un panel lateral con Estado (el actual) y Comentario ejecutivo precargado con el último.
2. **Given** el panel, **When** la persona abre Estado, **Then** ofrece No iniciada, En curso, Frenada, Finalizada y Cancelada, y cualquier estado puede pasar a cualquier otro.
3. **Given** un estado nuevo elegido, **When** la persona guarda, **Then** se muestra el modal "Estás por cambiar el estado de la iniciativa "[nombre]" de [estado actual] a [estado nuevo]. ¿Querés continuar?" con Cancelar y Aceptar.
4. **Given** el modal, **When** la persona elige Aceptar, **Then** se registra el estado, el detalle muestra el chip nuevo y, si el comentario cambió, se registra como un comentario ejecutivo nuevo y el detalle muestra ese texto con su fecha y su autor; el panel se cierra y la persona ve «El estado de la iniciativa "[nombre]" se ha actualizado correctamente.».
5. **Given** el modal o el panel, **When** la persona elige Cancelar, **Then** no se registra ningún cambio.
6. **Given** varios comentarios ejecutivos registrados, **When** se abre el detalle, **Then** se muestra solo el último; los anteriores se conservan como historial, sin mostrarse.

---

### Edge Cases

- Nombre, descripción o comentario compuestos solo por espacios: nombre y descripción se consideran vacíos.
- Fecha de compromiso igual a la de inicio: se admite.
- Objetivo sin fechas (objetivo de otra VP): solo se valida que la fecha de compromiso no sea anterior a la de inicio.
- Fechas de la iniciativa iguales a las del objetivo: se admiten; quedan dentro del rango.
- Cambian las fechas del objetivo después de cargar iniciativas: las iniciativas existentes no se modifican; la regla se vuelve a validar cuando se edita la iniciativa.
- Al elegir un objetivo en el alta después de cargar fechas: la validación de rango se hace contra las fechas del objetivo elegido al guardar.
- Persona que se quita a sí misma de Accountable: se admite si queda al menos un accountable; la iniciativa deja de aparecer en su solapa "Mis iniciativas".
- Todas las iniciativas de un objetivo de la VP RRII canceladas: ninguna muestra peso.
- Peso que no es un número exacto (3 iniciativas): se muestra redondeado, aunque la suma visible no dé exactamente 100 %.
- Iniciativa cancelada de un objetivo de la VP RRII: no muestra peso en el objetivo ni peso en el departamento.
- Objetivo de la VP RRII sin peso en el departamento cargado (por ejemplo, cargado antes de la feature 005): el peso en el departamento de sus iniciativas se muestra como "—".
- Cambio de estado sin cambiar el estado, solo el comentario: se registra el comentario nuevo con su fecha y autor.
- Cambio de estado sin modificar el comentario: no se registra un comentario nuevo; se sigue mostrando el anterior con su fecha y autor.
- Comentario ejecutivo vacío o solo con espacios en "Cambiar estado": no se registra; se sigue mostrando el anterior.
- "Cambiar estado" sin cambiar el estado ni el comentario: al aceptar, el panel se cierra sin registrar nada y sin mensaje de éxito.
- Se necesita pasar una iniciativa a otro objetivo: no se puede editar; se cancela y se carga una nueva en el otro objetivo.
- Iniciativa contenida en un solo año: aparece solo al filtrar por ese año.
- Nombres repetidos: no se exige unicidad.
- Se pide el detalle de una iniciativa que no existe: se informa en una línea que no se encontró y se ofrece Volver.
- Falla al cargar la bandeja, el detalle o el panel, o al guardar: se informa en una línea que la operación no pudo completarse, no se muestra un éxito falso y el panel conserva lo ingresado.
- Maestro de áreas vacío: Áreas involucradas no ofrece opciones y la iniciativa se puede guardar igual, porque es opcional.
- Ningún objetivo cargado: el campo Objetivo no ofrece opciones y no se puede cargar una iniciativa desde la bandeja.
- Página actual vacía tras aplicar un filtro: la bandeja vuelve a la primera página.
- Falla "Cambiar estado" después de registrar el comentario: se informa en una línea que la operación no pudo completarse; el comentario queda registrado y, al reintentar, no se vuelve a registrar porque coincide con el último.

## Clarifications

### Session 2026-11-13

- Q: ¿A dónde llevan Volver y Cancelar del detalle de la iniciativa? → A: A la pantalla de origen (bandeja o detalle del objetivo). Si se entró por link directo o no hay origen, al detalle del objetivo de la iniciativa.
- Q: ¿Se puede cambiar el objetivo al editar una iniciativa? → A: No. Se muestra en modo lectura, igual que la VP en la edición del objetivo (feature 003).
- Q: ¿Qué dato decide el año de una iniciativa en el filtro Año? → A: La iniciativa aparece en todos los años entre su fecha de inicio y su fecha de compromiso, incluidos ambos. La feature 003 no definió una regla de año para objetivos.
- Q: ¿Las cantidades de las solapas dependen de la búsqueda y los filtros? → A: No. Son el total de cada solapa, como en el prototipo; solo el contador "N iniciativas en esta vista" refleja la búsqueda y los filtros.
- Q: ¿Qué prototipo se usa como referencia? → A: El de la carpeta `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/` (corregido en la sesión 2026-11-18: esa carpeta contiene el v10).
- Q: En el panel de filtros de la bandeja, ¿cada filtro permite un solo valor o varios, y se aplican al momento o con un botón? → A: Un solo valor por filtro; se aplican con "Aplicar" y hay "Limpiar filtros".

### Session 2026-11-18

Cambios por la reunión 6 (`docs/especificacion-funcional.md` v1.9) y la feature 005, ya implementada.

- Q: ¿Cómo se llama en pantalla a quien responde por la iniciativa? → A: "Accountable", en lugar de "Líderes": campo del panel, columna de la bandeja y de la sección Iniciativas del detalle del objetivo, dato de "Información de la iniciativa" y filtro (antes "Líder"). La solapa "Mis iniciativas" lista las iniciativas en las que la persona actual figura como accountable. La columna de SharePoint sigue siendo Responsables; solo cambia la etiqueta en pantalla.
- Q: ¿El detalle de la iniciativa muestra el peso en el departamento? → A: Sí. "Peso en el departamento" va en "Información de la iniciativa", inmediatamente después de "Peso en el objetivo", como en el prototipo. Vale peso de la iniciativa en el objetivo × peso del objetivo en el departamento ÷ 100 (por ejemplo, 25 % en un objetivo que pesa 40 % da 10 %). Solo para iniciativas no canceladas de objetivos de la VP RRII; si el objetivo no tiene peso en el departamento cargado, se muestra "—". Es calculado, no se guarda y se muestra a todos mientras no estén los roles, igual que el peso en el objetivo. Deja de estar fuera de alcance.
- Q: ¿El peso en el departamento se calcula con el peso en el objetivo exacto o con el redondeado? → A: Con el exacto; se redondea solo al mostrarlo, con el mismo formato que el peso en el objetivo.
- Q: ¿Qué prototipo se usa como referencia? → A: El v10 (16/11/2026), que está en la carpeta `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/` aunque su nombre diga v5. Para iniciativas, su único cambio respecto del v9 es "Líderes" → "Accountable". Reemplaza la respuesta de la sesión 2026-11-13.
- Q: ¿Cuál es la fuente funcional? → A: `docs/especificacion-funcional.md` v1.9.
- Q: ¿Qué versión del prototipo hay en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/`? → A: El v10 (16/11/2026), confirmado en su `LEEME.md`. Las respuestas siguientes se verificaron contra esa versión.
- Q: ¿"Cambiar estado" muestra un mensaje de éxito? → A: Sí, como en el prototipo: «El estado de la iniciativa "[nombre]" se ha actualizado correctamente.».
- Q: En "Cambiar estado", ¿qué pasa con un comentario vacío o si no cambió nada? → A: Un comentario vacío o solo con espacios no se registra. Si no cambió ni el estado ni el comentario, Aceptar cierra el panel sin registrar nada.
- Q: ¿FR-008 (sin guardado parcial) rige para "Cambiar estado"? → A: No. Rige para el panel de cargar y editar. En "Cambiar estado", comentario y estado se registran por separado, primero el comentario, y el reintento no lo duplica.
- Q: Si se pide el detalle de una iniciativa que no existe y no hay pantalla de origen, ¿adónde llevan Volver y Cancelar? → A: A la bandeja de iniciativas.
- Q: ¿Cómo se titula la sección del detalle del objetivo? → A: "Iniciativas (N)", como en el prototipo, con N igual a la cantidad de iniciativas del objetivo, incluidas las canceladas.

## Requirements *(mandatory)*

### Functional Requirements

**Iniciativa y reglas**

- **FR-001**: Toda iniciativa DEBE pertenecer a un único objetivo; el sistema NO DEBE permitir guardar una iniciativa sin objetivo.
- **FR-002**: El ID DEBE asignarlo el sistema al registrar la iniciativa y NO DEBE poder editarse.
- **FR-003**: Son obligatorios Objetivo, Nombre de la iniciativa, Descripción / impacto esperado, Accountable (uno o más, sin límite), Fecha de inicio y Fecha de compromiso. Áreas involucradas y Comentario ejecutivo son opcionales. El sistema NO DEBE guardar con un obligatorio vacío o solo con espacios, y DEBE mostrar "Este campo es obligatorio." en línea, en cada campo faltante.
- **FR-004**: La Fecha de compromiso NO DEBE ser anterior a la Fecha de inicio. Si el objetivo tiene fechas, la Fecha de inicio NO DEBE ser anterior a la del objetivo y la Fecha de compromiso NO DEBE ser posterior a la del objetivo. En cada caso el error se muestra en el campo de la fecha inválida.
- **FR-005**: Al crearse, la iniciativa DEBE quedar en estado "No iniciada"; el alta NO DEBE mostrar el campo Estado.
- **FR-006**: Estado DEBE ofrecer No iniciada, En curso, Frenada, Finalizada y Cancelada. Cualquier estado puede pasar a cualquier otro, solo por acción manual en la edición o en "Cambiar estado"; el sistema NO DEBE derivarlo de ningún otro dato.
- **FR-007**: La aplicación NO DEBE ofrecer ninguna acción para eliminar una iniciativa; se cancela con el estado Cancelada.
- **FR-008**: Al guardar una iniciativa desde el panel de cargar o editar, el sistema DEBE registrar todos sus datos o ninguno: no hay guardado parcial. En "Cambiar estado", el comentario y el estado se registran por separado: si falla uno, se informa el error, el panel conserva lo ingresado y reintentar no duplica el comentario.
- **FR-009**: Al guardar, la columna Title de la lista DEBE recibir el mismo valor que el nombre de la iniciativa, al crear y al editar.
- **FR-010**: Accountable DEBE venir completado en el alta con la persona que carga, que puede quitarse o agregar a otros.
- **FR-011**: Áreas involucradas DEBE ofrecer todas las áreas del maestro Áreas, sin limitarlas a la VP o al departamento del objetivo, y admitir varias.
- **FR-012**: El campo Objetivo DEBE ofrecer los objetivos cargados, mostrados como "ID · nombre".

**Peso en el objetivo**

- **FR-013**: Cada iniciativa no cancelada de un objetivo de la VP RRII DEBE pesar 100 % ÷ la cantidad de iniciativas no canceladas de ese objetivo. Las iniciativas canceladas y las de objetivos de otras VP NO DEBEN tener peso.
- **FR-014**: El peso DEBE recalcularse cuando se agrega una iniciativa al objetivo o cuando una iniciativa pasa a Cancelada o deja de estarlo, y DEBE mostrarse siempre en modo lectura; no se carga ni se edita.

**Peso en el departamento**

- **FR-014a**: Cada iniciativa no cancelada de un objetivo de la VP RRII DEBE tener un peso en el departamento igual a su peso en el objetivo × el peso del objetivo en el departamento ÷ 100. Por ejemplo, una iniciativa que pesa 25 % en un objetivo que pesa 40 % en su departamento tiene 10 %. El cálculo DEBE usar el peso exacto en el objetivo, sin redondear; el resultado se redondea solo al mostrarlo, con el mismo formato que el peso en el objetivo. Las iniciativas canceladas y las de objetivos de otras VP NO DEBEN tener peso en el departamento.
- **FR-014b**: Si el objetivo no tiene peso en el departamento cargado, el peso en el departamento de sus iniciativas DEBE mostrarse como "—".
- **FR-014c**: El peso en el departamento DEBE calcularse al mostrarlo, NO DEBE guardarse y DEBE mostrarse en modo lectura a cualquier persona que use la aplicación mientras no existan los roles (RF-19), igual que el peso en el objetivo.

**Bandeja de iniciativas**

- **FR-015**: El acceso "Mis iniciativas" de la home DEBE navegar a la bandeja con la solapa "Mis iniciativas" elegida.
- **FR-016**: El encabezado de la bandeja DEBE mostrar Volver (a la home), el título "Mis iniciativas" o "Todas las iniciativas" según la solapa, la búsqueda, el botón Filtros y el botón "Cargar iniciativa".
- **FR-017**: La bandeja DEBE tener las solapas "Mis iniciativas" (iniciativas en las que la persona actual es accountable) y "Todas", cada una con su cantidad total, que NO depende de la búsqueda ni de los filtros. El contador "N iniciativas en esta vista" DEBE coincidir con las iniciativas de la solapa elegida con la búsqueda y los filtros aplicados.
- **FR-018**: La grilla DEBE tener las columnas ID, Iniciativa, Objetivo (ID · nombre), Accountable, Estado (chip, anteúltima) y Ver; Ver abre el detalle.
- **FR-019**: La búsqueda DEBE encontrar iniciativas por parte del ID o del nombre, sin distinguir mayúsculas.
- **FR-020**: Filtros DEBE abrir un panel lateral con Departamento (el del objetivo), Objetivo, Accountable, Estado y Año. Cada filtro admite un solo valor. Los filtros elegidos se aplican a la grilla solo al elegir "Aplicar"; "Limpiar filtros" quita todos los filtros. Una iniciativa DEBE cumplir el filtro Año si el año elegido está entre el año de su fecha de inicio y el de su fecha de compromiso, incluidos ambos. Búsqueda y filtros DEBEN combinarse.
- **FR-021**: Con más de 10 iniciativas en la vista, la bandeja DEBE paginar de a 10, con "Mostrando X–Y de N" a la izquierda y el paginador centrado, fijos al pie de la pantalla.
- **FR-022**: Sin iniciativas cargadas, la bandeja DEBE mostrar "No hay iniciativas cargadas."; sin resultados para la búsqueda o los filtros, "No hay iniciativas con estos filtros.".
- **FR-023**: "Cargar iniciativa" DEBE abrir el panel de alta con el objetivo sin elegir; al guardar, la persona se queda en la bandeja y la nueva iniciativa aparece en la vista que corresponda.

**Panel de cargar y editar**

- **FR-024**: El alta y la edición DEBEN hacerse en un panel lateral de una columna, con Fecha de inicio y Fecha de compromiso lado a lado, los campos desplazables dentro del panel y el pie fijo: Cancelar · "Cargar iniciativa" (alta) o Cancelar · "Guardar cambios" (edición). La edición muestra además el Estado y el Objetivo en modo lectura: una vez guardada, la iniciativa NO DEBE poder cambiar de objetivo. El Comentario ejecutivo no forma parte de este panel.
- **FR-025**: Antes de guardar, el sistema DEBE pedir confirmación: "Estás por cargar la iniciativa. ¿Querés continuar?" (alta) o "Estás por guardar los cambios de la iniciativa. ¿Querés continuar?" (edición), con Cancelar y Aceptar. La validación de campos ocurre antes del modal.
- **FR-026**: Al guardar, la persona DEBE quedar en la pantalla de origen y ver «La iniciativa "[nombre]" se ha cargado correctamente.» o «La iniciativa "[nombre]" se ha actualizado correctamente.».
- **FR-027**: Desde el detalle de un objetivo, el alta DEBE abrirse con ese objetivo elegido.

**Cambiar estado**

- **FR-028**: "Cambiar estado" y el lápiz de "Comentario ejecutivo" DEBEN abrir el mismo panel lateral con Estado y Comentario ejecutivo, precargados con los valores actuales.
- **FR-029**: Antes de guardar, el sistema DEBE pedir confirmación con "Estás por cambiar el estado de la iniciativa "[nombre]" de [estado actual] a [estado nuevo]. ¿Querés continuar?", con Cancelar y Aceptar. Al guardar, el panel se cierra, la persona sigue en el detalle y ve «El estado de la iniciativa "[nombre]" se ha actualizado correctamente.».
- **FR-030**: Cada vez que se modifica el comentario ejecutivo, el sistema DEBE registrarlo como un comentario nuevo, con su fecha y su autor, conservando los anteriores como historial. El detalle y el panel DEBEN mostrar solo el último. Si el comentario no cambió, o queda vacío o solo con espacios, NO DEBE registrarse uno nuevo. Si no cambió ni el estado ni el comentario, NO DEBE registrarse nada.

**Detalle de la iniciativa**

- **FR-031**: El detalle DEBE mostrar Volver, "ID · nombre" y el estado como chip; las migas "Inicio → Palancas → [palanca] → [objetivo] → [iniciativa]", con enlaces a cada nivel superior y el último sin enlace, con el mismo componente de migas de los detalles de palanca y objetivo. Para un objetivo de otra VP, las migas omiten el nivel de palanca, como en el detalle de ese objetivo.
- **FR-032**: El detalle DEBE tener las secciones "Información de la iniciativa" (objetivo, accountable, áreas involucradas, estado, fechas, peso en el objetivo y, inmediatamente después, "Peso en el departamento", ambos solo para iniciativas no canceladas de la VP RRII, y descripción / impacto esperado) y "Comentario ejecutivo" (fecha, autor y texto, o "Todavía no hay comentario ejecutivo."), cada una con título, chevron y lápiz. Al entrar, la primera está expandida y la segunda contraída.
- **FR-033**: El detalle DEBE tener el pie fijo Cancelar · Editar · "Cambiar estado". Editar y el lápiz de "Información de la iniciativa" abren el panel de edición.
- **FR-033a**: Volver y Cancelar del detalle DEBEN llevar a la pantalla de origen (bandeja o detalle del objetivo). Si se entró por link directo o no hay pantalla de origen, DEBEN llevar al detalle del objetivo de la iniciativa.
- **FR-034**: El detalle NO DEBE mostrar el botón "Ubicación en la estrategia", avance, resultados clave, tareas, indicadores de tareas, riesgos, presupuesto ni "Cargar tarea".

**Detalle del objetivo**

- **FR-035**: El detalle del objetivo DEBE sumar la sección "Iniciativas (N)", con N igual a la cantidad de iniciativas del objetivo, incluidas las canceladas, con un "+" en el título que abre el alta con ese objetivo elegido, y una grilla con ID, Iniciativa, Accountable, Peso (solo objetivos de la VP RRII), Estado (chip, anteúltima) y Ver, que abre el detalle de la iniciativa.

**Preparación para permisos**

- **FR-036**: En esta feature, cualquier persona que use la aplicación DEBE poder crear, editar y cambiar el estado de cualquier iniciativa.
- **FR-037**: Crear, editar y cambiar el estado DEBEN quedar como tres permisos separados e identificables, para que una feature posterior (RF-19) pueda restringirlos de forma independiente sin rehacer las pantallas.

**Alcance visual**

- **FR-038**: La bandeja, el detalle y el panel DEBEN seguir el diseño ya implementado en palancas y objetivos (encabezado, encabezado de grilla, columna "Ver", chips de estado, indicador de carga, estados vacíos, mensajes de error, migas, secciones, pie fijo, ancho y disposición del panel, modal y mensaje de éxito). Si el prototipo difiere de lo implementado, manda lo implementado.
- **FR-039**: Los mensajes de error y los estados vacíos DEBEN ser de una sola línea, sin textos de ayuda. NO DEBEN mostrarse el subtítulo "Completá los datos y sus resultados clave" del panel, la nota sobre objetivos de otra VP ni la línea "Probá cambiar o limpiar los filtros.".
- **FR-040**: Todos los textos visibles DEBEN estar en español (Argentina).

### Key Entities

- **Iniciativa**: conjunto coordinado de acciones para lograr un objetivo; principal unidad de gestión. Atributos: ID (autonumérico); Objetivo (uno); Nombre; Descripción / impacto esperado; Accountable (uno o más usuarios); Áreas involucradas (0..N); Fecha de inicio; Fecha de compromiso; Estado (No iniciada, En curso, Frenada, Finalizada, Cancelada); Comentario ejecutivo con fecha y autor de la última modificación; Peso en el objetivo (calculado, solo VP RRII); Peso en el departamento (calculado a partir del peso en el objetivo y del peso del objetivo en el departamento, solo VP RRII). Nunca se elimina.
- **Objetivo**: definido en la feature 003. Tiene 0..N iniciativas. Sus fechas, si las tiene, acotan las de sus iniciativas; su VP decide si las iniciativas tienen peso; su peso en el departamento (feature 005) se usa para el peso en el departamento de sus iniciativas; su departamento es el que usa el filtro de la bandeja.
- **Área**: maestro de áreas (subgerencias) que participan en una iniciativa. Puede ser de cualquier VP o departamento.
- **Comentario ejecutivo**: situación de la iniciativa en palabras de sus accountable. Una iniciativa tiene 0..N comentarios, cada uno con su texto, fecha y autor; se muestra el último y los anteriores quedan como historial.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona puede cargar una iniciativa completa en menos de 3 minutos.
- **SC-002**: El 100 % de los intentos de guardar con un obligatorio vacío, una fecha de compromiso anterior a la de inicio o fechas fuera de las del objetivo se rechazan, con el error en el campo.
- **SC-003**: En el 100 % de los objetivos de la VP RRII, los pesos de sus iniciativas no canceladas son iguales entre sí y suman 100 % (salvo redondeo), y las canceladas no tienen peso.
- **SC-004**: En el 100 % de los casos, la cantidad de cada solapa coincide con el total de iniciativas de esa solapa, y el contador "N iniciativas en esta vista" coincide con las iniciativas listadas con la búsqueda y los filtros aplicados.
- **SC-005**: Desde la home, la persona llega a una iniciativa propia en 2 clics (acceso "Mis iniciativas" y "Ver").
- **SC-006**: Desde el detalle de una iniciativa, la persona llega a la home, la grilla de palancas, el detalle de la palanca o el del objetivo en un clic, mediante las migas.
- **SC-007**: En ninguna pantalla existe una acción para eliminar una iniciativa.
- **SC-008**: Con el volumen previsto (cientos de iniciativas), la bandeja, los detalles y el panel se muestran en menos de 3 segundos, y la búsqueda y los filtros actualizan la grilla sin demora perceptible.
- **SC-009**: En una comparación lado a lado con las pantallas de palancas y objetivos, una persona revisora no encuentra diferencias de estructura ni de componentes entre la bandeja, el detalle y el panel de iniciativas y sus equivalentes ya implementados.

## Assumptions

- Las listas Iniciativa, Áreas y ComentarioIniciativa ya existen en SharePoint; su creación está fuera de alcance. El plan releva sus nombres internos.
- Áreas involucradas es una búsqueda de valores múltiples sobre la lista Áreas. La usuaria cambia la columna de la lista Iniciativa en SharePoint para que admita varios valores; el plan se basa en esa columna ya modificada.
- "Accountable" es el nombre en pantalla de la columna Responsables de la lista Iniciativa, que no se renombra. "Áreas involucradas" equivale a "Subgerencias involucradas" de RF-07.
- El peso en el objetivo y el peso en el departamento se calculan al mostrarlos y no se guardan; la columna Peso de la lista Iniciativa no se usa. El peso del objetivo en el departamento es el que registra la feature 005.
- El comentario ejecutivo vive en la lista ComentarioIniciativa: cada modificación es un elemento nuevo, y la fecha y el autor que se muestran son los de creación del último elemento.
- El prototipo de referencia es el v10, que está en la carpeta `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/` aunque su nombre diga v5.
- La VP RRII se reconoce como en la feature 003 (nombre "VP RRII").
- El panel de edición muestra los mismos campos del alta más Estado, con el Objetivo en modo lectura; el Comentario ejecutivo se edita solo desde el panel "Cambiar estado" (confirmado por la usuaria).
- El estado vacío de la sección Iniciativas del detalle del objetivo es "Este objetivo no tiene iniciativas cargadas." (confirmado por la usuaria).
- El mensaje de error de fechas fuera de las del objetivo es una línea que indica el rango del objetivo; el de compromiso anterior a inicio reutiliza el de la feature 003. Los textos exactos los define el plan.
- El peso se muestra redondeado (por ejemplo, 33,33 %); el formato exacto sigue al del peso del objetivo en la feature 003.
- El campo Objetivo ofrece todos los objetivos cargados, de cualquier estado y VP, en el orden en que la aplicación ya los lista; el orden con los del departamento del usuario primero queda fuera de alcance (RF-20).
- La solapa "Todas" muestra todas las iniciativas, sin filtro por defecto por departamento (RF-20 fuera de alcance).
- Las opciones del filtro Accountable salen de los accountable de las iniciativas cargadas; las de Departamento y Objetivo, de los maestros y objetivos cargados; las de Estado, de los cinco estados.
- Cambiar el estado de la iniciativa no impide nada en esta feature; la regla de no admitir tareas nuevas con Finalizada o Cancelada llega con las tareas.
- Fuera de alcance: resultados clave, su seguimiento y pesos, cálculos de avance (C-01 a C-04, C-07) y la regla de al menos un resultado clave para la VP RRII; tareas, riesgos, decisiones y presupuesto (RF-12 a RF-15) y sus secciones, botones y chips; el peso junto al objetivo en la bandeja; la vista por departamento del usuario (RF-20); la bandeja de tareas; roles y permisos (RF-19). No se crean rutas para pantallas no implementadas.
