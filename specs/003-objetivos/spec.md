# Feature Specification: Objetivos (alta, edición, vista y su lugar dentro de palancas)

**Feature Branch**: `003-objetivos`

**Created**: 2026-11-11

**Status**: Draft

**Input**: User description: "Feature: Objetivos (alta, edición, vista y su lugar dentro de palancas). Fuente: docs/especificacion-funcional.md, RF-02 (la parte de objetivos), RF-03, RF-04, RF-05 y RF-06. Continúa la 002-palancas-estrategicas. Cargar objetivos de la VP RRII y de otras VP, editarlos, ver la lista de objetivos en el detalle de la palanca y su cantidad en la grilla, elegir entre Objetivos del VP y Todos, y ver el detalle de un objetivo con migas de pan. Fuera de alcance: roles y permisos (RF-19), avance y color (C-04, C-05, C-07), iniciativas, despliegue de objetivos en la grilla, ABM de maestros, tablero ejecutivo y bandejas."

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, pantallas "Galería de palancas estratégicas" (`scr.palancas`), detalle de palanca (`scr.palanca`), formulario de objetivo (`scr.form`, rama de objetivo) y detalle de objetivo (`scr.objetivo`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cargar un objetivo de la VP RRII (Priority: P1)

La persona elige cargar un objetivo, elige la VP RRII y completa departamento, gerencia, nombre, descripción, palanca, duración, peso, si es objetivo del VP y las fechas de inicio y de compromiso. Al guardar, el objetivo queda registrado como "No iniciada" y asociado a su palanca.

**Why this priority**: Es el dato central de la estrategia. Sin objetivos cargados no hay detalle de objetivo, ni cantidad por palanca, ni base para las iniciativas posteriores.

**Independent Test**: Cargar un objetivo de la VP RRII completo, verificar el mensaje de confirmación, que aparece en el detalle de su palanca con un ID asignado por el sistema y que el formulario no deja guardar con campos obligatorios vacíos.

**Acceptance Scenarios**:

1. **Given** una palanca activa, **When** la persona elige cargar un objetivo, **Then** se abre el formulario con VP como primer campo y Estado en "No iniciada".
2. **Given** el formulario con la VP RRII elegida, **When** la persona lo observa, **Then** ve, en este orden: VP, Departamento, Gerencia, Nombre, Descripción, Palanca, Duración, Peso en la VP (%), Objetivo del VP (en "No" por defecto), Fecha de inicio, Fecha de compromiso y Estado.
3. **Given** el formulario con todos los campos obligatorios completos y válidos, **When** la persona guarda, **Then** el objetivo se registra con un ID asignado por el sistema, se muestra su detalle con el aviso de que se cargó correctamente y el objetivo aparece en la lista de objetivos de su palanca.
4. **Given** el formulario con uno o más campos obligatorios vacíos, **When** la persona intenta guardar, **Then** no se guarda y cada campo faltante muestra su error en línea.
5. **Given** una fecha de compromiso anterior a la de inicio, **When** la persona intenta guardar, **Then** no se guarda y el campo de la fecha de compromiso indica el error.
6. **Given** un peso fuera del rango de 0 a 100, **When** la persona intenta guardar, **Then** no se guarda y el campo de peso indica el error.
7. **Given** el desplegable de palanca, **When** se abre, **Then** ofrece solo las palancas activas.
8. **Given** el formulario con datos cargados, **When** la persona cancela, **Then** no se registra nada.
9. **Given** pesos ya cargados que no suman 100 %, **When** la persona guarda un objetivo con cualquier peso entre 0 y 100, **Then** se guarda sin advertencias sobre la suma.

---

### User Story 2 - Cargar un objetivo de otra VP (Priority: P1)

La persona elige una VP distinta de la VP RRII. El formulario muestra solo los campos que aplican: VP, Departamento y Gerencia de la VP RRII que colaboran, Nombre, Descripción y Estado. Al guardar, el objetivo queda disponible para asociarle después las iniciativas con las que la VP RRII colabora.

**Why this priority**: Sin estos objetivos no se pueden registrar las iniciativas de colaboración con otras VP; la carga del año los necesita junto con los de la VP RRII.

**Independent Test**: Elegir una VP distinta de la VP RRII, verificar que el formulario oculta palanca, duración, peso, objetivo del VP y fechas, guardar y verificar que el objetivo queda registrado sin esos datos.

**Acceptance Scenarios**:

1. **Given** el formulario, **When** la persona elige una VP distinta de la VP RRII, **Then** se ocultan Palanca, Duración, Peso en la VP, Objetivo del VP, Fecha de inicio y Fecha de compromiso.
2. **Given** campos de la VP RRII ya completados, **When** la persona cambia a otra VP y guarda, **Then** el objetivo se registra sin palanca, duración, peso, fechas ni marca de objetivo del VP.
3. **Given** el formulario de otra VP con VP, Departamento, Gerencia, Nombre, Descripción y Estado completos, **When** la persona guarda, **Then** el objetivo se registra y se informa que se cargó correctamente.
4. **Given** el formulario de otra VP con un campo obligatorio vacío, **When** la persona intenta guardar, **Then** no se guarda y se indica el campo.

---

### User Story 3 - Ver los objetivos dentro de palancas y entrar a su detalle (Priority: P1)

En la grilla de palancas, cada palanca muestra cuántos objetivos tiene. Al entrar al detalle de una palanca, la persona ve la lista de sus objetivos y, desde cada uno, entra al detalle del objetivo. Arriba de la grilla elige entre "Objetivos del VP" (solo los marcados como del VP) y "Todos".

**Why this priority**: Es la forma de llegar a los objetivos cargados: palancas y objetivos son una misma sección. Completa lo que dejó pendiente la feature 002.

**Independent Test**: Con objetivos cargados en distintas palancas, verificar que la cantidad de cada palanca coincide con los objetivos de su detalle, alternar "Objetivos del VP" y "Todos" y abrir el detalle de un objetivo desde la lista.

**Acceptance Scenarios**:

1. **Given** la grilla de palancas con "Todos" elegido, **When** se abre, **Then** cada palanca muestra la cantidad de sus objetivos.
2. **Given** el detalle de una palanca, **When** se abre, **Then** muestra la lista de sus objetivos y esa lista coincide con la cantidad de la grilla.
3. **Given** la lista de objetivos de una palanca, **When** la persona elige un objetivo, **Then** se abre su detalle.
4. **Given** objetivos marcados y no marcados como del VP, **When** la persona elige "Objetivos del VP", **Then** las cantidades y las listas incluyen solo los objetivos marcados.
5. **Given** "Objetivos del VP" elegido, **When** la persona elige "Todos", **Then** las cantidades y las listas vuelven a incluir todos los objetivos.
6. **Given** una palanca sin objetivos, **When** se abre su detalle, **Then** se muestra el estado vacío "Esta palanca no tiene objetivos cargados." y la cantidad en la grilla es cero.
7. **Given** el detalle de una palanca, **When** la persona elige cargar un objetivo, **Then** se abre el formulario con esa palanca preseleccionada si la VP elegida es la VP RRII.
11. **Given** la grilla de palancas con una palanca contraída, **When** la persona activa el control de despliegue de esa palanca, **Then** debajo de ella se listan sus objetivos y, al activarlo de nuevo, se contraen.
8. **Given** la grilla de palancas con "Todos" elegido y objetivos de otras VP cargados, **When** se abre, **Then** debajo de la grilla aparece el bloque "Objetivos de otras VP" con su lista, y desde cada fila se entra al detalle del objetivo.
9. **Given** el bloque "Objetivos de otras VP", **When** la persona elige "Objetivos del VP", **Then** el bloque se oculta.
10. **Given** ningún objetivo de otra VP cargado y "Todos" elegido, **When** se abre la grilla, **Then** el bloque muestra "No hay objetivos de otras VP cargados.".

---

### User Story 4 - Ver el detalle de un objetivo (Priority: P2)

La persona abre un objetivo y ve su información (nombre, descripción, VP, departamento, gerencia, palanca y si es objetivo del VP), su planificación (duración, peso y fechas) y su estado, con migas de pan "Inicio → Palancas → [palanca] → [objetivo]" y un botón para volver.

**Why this priority**: Permite consultar un objetivo completo; la lista de palanca ya muestra lo básico, por eso es secundaria frente a poder cargarlos.

**Independent Test**: Abrir el detalle de un objetivo de la VP RRII y de uno de otra VP, verificar los datos mostrados, y recorrer cada link de las migas de pan y el botón Volver.

**Acceptance Scenarios**:

1. **Given** un objetivo de la VP RRII, **When** se abre su detalle, **Then** se ven nombre, descripción, VP, departamento, gerencia, palanca, si es objetivo del VP, duración, peso, fecha de inicio, fecha de compromiso y estado.
2. **Given** un objetivo de otra VP, **When** se abre su detalle, **Then** se ven nombre, descripción, VP, departamento, gerencia y estado, sin sección de planificación ni palanca ni marca de objetivo del VP.
3. **Given** el detalle de un objetivo de la VP RRII, **When** la persona observa la parte superior, **Then** ve las migas "Inicio → Palancas → [nombre de la palanca] → [nombre del objetivo]", con los tres primeros niveles como links y el último como nivel actual.
4. **Given** el detalle de un objetivo, **When** la persona activa "Inicio", "Palancas" o el nombre de la palanca, **Then** va respectivamente a la home, a la grilla de palancas o al detalle de esa palanca.
5. **Given** el detalle de un objetivo, **When** la persona activa el botón Volver, **Then** vuelve a la grilla de palancas.
6. **Given** un objetivo que usa una palanca inactiva, **When** se abre su detalle, **Then** muestra el nombre de esa palanca igual que si estuviera activa.

---

### User Story 5 - Editar un objetivo (Priority: P2)

La persona edita un objetivo ya cargado desde su detalle. El formulario trae los datos actuales y permite cambiar cualquier campo, incluido el estado.

**Why this priority**: Los objetivos cambian de estado durante el año y pueden necesitar correcciones; es secundario frente a tenerlos cargados.

**Independent Test**: Editar un objetivo, cambiar su estado y su peso, guardar y verificar que el detalle y las listas reflejan los cambios; verificar que el ID no se puede modificar y que en ninguna pantalla existe una acción para eliminar.

**Acceptance Scenarios**:

1. **Given** el detalle de un objetivo, **When** la persona elige "Editar", **Then** se abre el formulario con los datos actuales y el ID visible en el título.
2. **Given** el formulario de edición con cambios válidos, **When** la persona guarda, **Then** se actualizan los datos, se informa que se actualizó correctamente y el detalle refleja los cambios.
3. **Given** el formulario de edición con un campo obligatorio vacío, **When** la persona intenta guardar, **Then** no se guarda y se indica el campo.
4. **Given** el formulario de edición con cambios, **When** la persona cancela, **Then** el objetivo queda sin cambios.
5. **Given** un objetivo que usa una palanca inactiva, **When** se abre su edición, **Then** el desplegable de palanca muestra esa palanca elegida, además de las activas.
6. **Given** el formulario de edición, **When** la persona cambia el Estado entre "No iniciada", "En curso", "Finalizado cumplido" y "Finalizado incumplido" y guarda, **Then** el nuevo estado queda registrado.
7. **Given** el formulario de edición, **When** la persona observa el campo VP, **Then** lo ve en modo lectura y no puede cambiarlo.
8. **Given** cualquier pantalla de esta feature, **When** la persona busca una acción para eliminar un objetivo, **Then** no la encuentra.

---

### Edge Cases

- Se cambia el departamento después de elegir la gerencia: la gerencia se limpia y debe elegirse de nuevo entre las del nuevo departamento.
- Se elige un departamento sin gerencias cargadas: Gerencia no ofrece opciones y no se puede guardar.
- Se cambia la VP en el alta después de completar campos: los que dejan de aplicar a la VP elegida no se guardan.
- Se necesita pasar un objetivo a otra VP: no se puede editar; se carga un objetivo nuevo.
- Nombre o descripción compuestos solo por espacios: se consideran vacíos.
- Nombre de más de 255 caracteres: el formulario no admite más de 255.
- Peso con valores decimales: se admite cualquier número entre 0 y 100 incluidos los extremos.
- Fecha de compromiso igual a la de inicio: se admite; solo se rechaza si es anterior.
- Un objetivo de la VP RRII sin objetivos del VP marcados y "Objetivos del VP" elegido: las cantidades de todas las palancas son cero y sus listas están vacías.
- Falla al cargar, guardar o editar: se informa que la operación no pudo completarse, no se muestra un éxito falso y el formulario conserva los datos ingresados.
- Se pide el detalle de un objetivo que ya no existe: se informa que no se encontró y se ofrece volver.
- Nombres repetidos: no se exige unicidad; se pueden guardar dos objetivos con el mismo nombre.
- Dos objetivos con la misma gerencia y distinta VP: se admite; el sistema no cruza datos entre ambos.
- Las listas de VP, departamentos o gerencias vacías: el formulario no ofrece opciones y no se puede guardar; cargarlas es tarea de la administración de las listas.

## Clarifications

### Session 2026-11-11

- Q: En la edición de un objetivo ya cargado, ¿se puede cambiar la VP? → A: No. La VP se elige solo en el alta y en la edición se muestra en modo lectura.
- Q: ¿Qué valores de Estado usa el objetivo, si el código y RF-03 no coinciden? → A: Los del código ("En curso", "Finalizado cumplido" y "Finalizado incumplido") más "No iniciada", que se suma al código. Valor inicial en el alta: "No iniciada"; se puede cambiar a cualquier otro estado.
- Q: ¿Con qué nombre se reconoce a la VP RRII en el maestro de VP? → A: "VP RRII".

## Requirements *(mandatory)*

### Functional Requirements

**Formulario de objetivo (alta y edición)**

- **FR-001**: La aplicación DEBE ofrecer un formulario de objetivo, usado para el alta y para la edición, titulado "Nuevo objetivo" o "Editar objetivo [ID]", con las acciones Cancelar y Guardar.
- **FR-002**: El formulario DEBE mostrar los campos en este orden: VP, Departamento, Gerencia, Nombre, Descripción, Palanca, Duración, Peso en la VP (%), Objetivo del VP, Fecha de inicio, Fecha de compromiso y Estado. VP DEBE ser el primer campo.
- **FR-003**: Si la VP elegida es la VP RRII, el formulario DEBE mostrar todos los campos. Si es otra VP, DEBE mostrar solo VP, Departamento, Gerencia, Nombre, Descripción y Estado.
- **FR-004**: Al cambiar la VP en el alta, los campos que dejan de aplicar NO DEBEN guardarse: un objetivo de otra VP se registra sin palanca, duración, peso, fechas ni marca de objetivo del VP.
- **FR-004a**: Una vez guardado el objetivo, la VP NO DEBE poder modificarse: en la edición el campo VP se muestra en modo lectura y el formulario muestra los campos que corresponden a esa VP.
- **FR-005**: Todos los campos mostrados son obligatorios, salvo Objetivo del VP, que es Sí / No con "No" por defecto. El sistema NO DEBE guardar con un campo obligatorio vacío (o solo espacios) y DEBE indicar en línea cuáles faltan.
- **FR-006**: Gerencia DEBE ofrecer solo las gerencias del departamento elegido. Al cambiar el departamento, DEBE limpiarse la gerencia elegida.
- **FR-007**: El sistema NO DEBE validar que la persona que carga pertenezca a la gerencia elegida: cualquier gerencia puede asignarse.
- **FR-008**: Nombre DEBE admitir hasta 255 caracteres y mostrar un ícono de ayuda que despliega la guía de redacción del objetivo, con el texto del prototipo.
- **FR-009**: Descripción DEBE admitir texto largo.
- **FR-010**: Duración DEBE ofrecer Anual (1 año), Plurianual (de 1 a 5 años) y Permanente. Un objetivo plurianual o permanente se carga una sola vez; no hay que volver a cargarlo cada año.
- **FR-011**: Peso en la VP (%) DEBE aceptar números de 0 a 100 incluidos. El sistema NO DEBE validar que los pesos de los objetivos sumen 100 %, ni mostrar el total asignado. El peso se interpreta sobre el total de objetivos de la VP RRII del año, sin importar el departamento ni la gerencia.
- **FR-012**: La Fecha de compromiso NO DEBE ser anterior a la Fecha de inicio; en ese caso, el sistema NO DEBE guardar e indicar el error en el campo.
- **FR-013**: En el alta, Estado DEBE venir en "No iniciada" y la persona puede cambiarlo a cualquier otro. Estado DEBE ofrecer "No iniciada", "En curso", "Finalizado cumplido" y "Finalizado incumplido", y solo cambia manualmente.
- **FR-014**: El desplegable de Palanca DEBE ofrecer solo palancas activas. En la edición de un objetivo que ya usa una palanca inactiva, DEBE mostrar esa palanca como elegida además de las activas.
- **FR-015**: El ID DEBE asignarlo el sistema al registrar el objetivo y NO DEBE poder editarse.
- **FR-016**: Al guardar con éxito, el sistema DEBE informar que el objetivo se cargó (alta) o se actualizó (edición) correctamente, mostrando el detalle del objetivo guardado con ese aviso, y el detalle DEBE reflejar los datos guardados. Cancelar NO DEBE registrar ningún cambio.
- **FR-017**: Si una operación de carga o guardado falla, el sistema DEBE informar que no pudo completarse, sin mostrar un éxito falso y conservando lo ingresado en el formulario.
- **FR-018**: Al guardar un objetivo, la columna Title de la lista recibe el mismo valor que Nombre, tanto al crear como al editar.
- **FR-019**: La aplicación NO DEBE ofrecer ninguna acción para eliminar un objetivo.

**Palancas y objetivos como una misma sección**

- **FR-020**: La grilla de palancas DEBE mostrar, en cada palanca, la cantidad de sus objetivos. Esa cantidad DEBE coincidir con los objetivos listados en el detalle de la palanca.
- **FR-021**: El detalle de la palanca DEBE incluir la lista de sus objetivos (ID, nombre, departamento, gerencia, peso y estado) y permitir entrar al detalle de cada uno.
- **FR-022**: Arriba de la grilla de palancas DEBE haber dos opciones: "Objetivos del VP", que considera solo los objetivos marcados como del VP, y "Todos". La opción elegida DEBE aplicarse a las cantidades de la grilla y a las listas del detalle de palanca. El valor inicial es "Todos".
- **FR-023**: El detalle de la palanca y la grilla DEBEN ofrecer una acción para cargar un objetivo que abre el formulario de alta.
- **FR-024**: Un objetivo de otra VP no pertenece a ninguna palanca: no cuenta en la grilla ni aparece en las listas de palancas. La sección de palancas DEBE mostrar debajo de la grilla un bloque "Objetivos de otras VP" con la lista de esos objetivos (ID, nombre, VP, departamento, gerencia y estado), desde la cual se entra al detalle de cada uno. Con "Todos" elegido el bloque se muestra; con "Objetivos del VP" se oculta, porque los objetivos de otra VP no tienen esa marca. Si no hay ninguno, el bloque muestra "No hay objetivos de otras VP cargados.".
- **FR-034**: Cada fila de palanca de la grilla DEBE tener un control para desplegar y contraer sus objetivos. Las palancas arrancan contraídas. Al desplegar, debajo de la palanca se listan sus objetivos (según el selector "Objetivos del VP / Todos") con ID, nombre, departamento y gerencia, peso, estado y una acción para abrir su detalle. Si la palanca no tiene objetivos, se muestra "Esta palanca no tiene objetivos cargados.".
- **FR-025**: Los estados vacíos y los mensajes de error DEBEN ser de una sola línea, sin textos de ayuda adicionales.

**Detalle de objetivo**

- **FR-026**: El detalle DEBE mostrar el ID y el nombre como título, el estado como indicador, la sección "Información del objetivo" (nombre, descripción, VP, departamento, gerencia, palanca y si es objetivo del VP) y, solo para objetivos de la VP RRII, la sección "Planificación" (duración, peso y fechas de inicio y de compromiso).
- **FR-027**: El detalle de un objetivo de la VP RRII DEBE mostrar las migas "Inicio → Palancas → [nombre de la palanca] → [nombre del objetivo]", con los tres primeros niveles enlazados (home, grilla de palancas y detalle de la palanca) y el último como nivel actual. DEBE usar el mismo componente de migas del detalle de palanca.
- **FR-027a**: El detalle de un objetivo de otra VP DEBE mostrar las migas "Inicio → Palancas → [nombre del objetivo]", sin nivel de palanca, con "Inicio" y "Palancas" enlazados.
- **FR-028**: El detalle DEBE ofrecer un botón Volver y la acción "Editar", que abre el formulario de edición.
- **FR-029**: Un objetivo con una palanca inactiva DEBE mostrar esa palanca en su detalle.
- **FR-030**: El detalle NO DEBE mostrar avance, color de avance, lista de iniciativas, pesos de iniciativas ni el botón "Ubicación en la estrategia".

**Preparación para permisos**

- **FR-031**: En esta feature, cualquier persona que use la aplicación DEBE poder crear y editar objetivos.
- **FR-032**: La acción de crear (formulario de alta) y la de editar (formulario de edición) DEBEN estar identificadas como dos permisos de administración separados, para que una feature posterior (RF-19) pueda restringirlas de forma independiente sin rehacer las pantallas (crear: CargadorObjetivo y Administrador; editar: solo Administrador).

**Alcance visual**

- **FR-033**: Todos los textos visibles DEBEN estar en español (Argentina) y coincidir con los del prototipo, salvo los que esta spec define. Los elementos del prototipo que dependen de otras features (avance, iniciativas, "Ubicación en la estrategia", campos "Dirección" y "Responsable" por persona, la leyenda de peso asignado) NO DEBEN mostrarse.

### Key Entities

- **Objetivo**: resultado estratégico que una VP busca alcanzar, aprobado por el comité de la VP. Atributos: ID (autonumérico, asignado por el sistema); VP; Departamento; Gerencia; Nombre (hasta 255 caracteres); Descripción; Estado (No iniciada, En curso, Finalizado cumplido, Finalizado incumplido); y, solo si es de la VP RRII, Palanca, Duración (Anual, Plurianual, Permanente), Peso en la VP (0 a 100), Objetivo del VP (Sí / No) y fechas de inicio y de compromiso. El responsable es una gerencia, no una persona. Nunca se elimina. Más adelante tendrá 0..N iniciativas.
- **VP**: vicepresidencia de YPF, entre ellas la VP RRII. Maestro cargado directamente en SharePoint.
- **Departamento**: unidad de primera línea de la VP RRII. Se divide en gerencias. Maestro cargado directamente en SharePoint.
- **Gerencia**: subdivisión de un departamento y unidad responsable de un objetivo. Maestro cargado directamente en SharePoint.
- **Palanca estratégica**: definida por la feature 002. Un objetivo de la VP RRII pertenece a exactamente una; una palanca agrupa 0..N objetivos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona puede cargar un objetivo completo de la VP RRII en menos de 3 minutos, y uno de otra VP en menos de 2 minutos.
- **SC-002**: El 100 % de los intentos de guardar con un campo obligatorio vacío, una fecha de compromiso anterior a la de inicio o un peso fuera de 0 a 100 se rechazan, con el error indicado en el campo.
- **SC-003**: En el 100 % de las palancas, la cantidad que muestra la grilla coincide con los objetivos listados en su detalle, tanto con "Todos" como con "Objetivos del VP".
- **SC-004**: El 100 % de los objetivos guardados de otra VP quedan sin palanca, peso, duración, fechas ni marca de objetivo del VP.
- **SC-005**: Ninguna palanca inactiva se ofrece al cargar un objetivo, y todo objetivo que usa una palanca inactiva la sigue mostrando en su detalle y en su edición.
- **SC-006**: En ninguna pantalla existe una acción para eliminar un objetivo.
- **SC-007**: Desde el detalle de un objetivo, la persona llega a la home, a la grilla de palancas o al detalle de su palanca en un solo clic, mediante las migas de pan.
- **SC-008**: Con el volumen previsto (decenas de objetivos), la grilla, los detalles y el formulario se muestran en menos de 3 segundos.
- **SC-009**: En una comparación lado a lado con el prototipo, una persona revisora no encuentra diferencias de disposición ni de textos en el formulario, el detalle de objetivo y la lista de objetivos, fuera de los elementos excluidos por FR-033 y los desvíos aprobados.

## Assumptions

- Las listas Objetivo, VP, Departamentos y Gerencias ya existen en SharePoint; sus nombres internos se relevan en el plan. Su creación y el ABM de VP, departamentos y gerencias están fuera de alcance.
- Se identifica la VP RRII como una VP particular del maestro; cómo se la reconoce (por nombre o por identificador) se define en el plan.
- Lo que se ve en pantalla sale del prototipo; las reglas de negocio salen de RF-02 a RF-06. El prototipo agrupa "Dirección" y "Responsable por persona", que quedaron reemplazados por Departamento y Gerencia; se siguen la disposición y los componentes del prototipo, con las etiquetas de esta spec.
- El prototipo pide además "Cantidad de años" para un objetivo plurianual y muestra un "Peso asignado sin este objetivo". Ninguno está en los campos de RF-03, por lo que no se muestran: la duración plurianual se registra solo como "Plurianual".
- El prototipo muestra Estado solo al editar. Esta spec lo hace obligatorio con valor inicial "No iniciada" y lo muestra también en el alta. Los valores son los que ya define el código (`Constants.Estado`: "En curso", "Finalizado cumplido" y "Finalizado incumplido") más "No iniciada", que se agrega al enum por decisión de la usuaria. Difieren de los de RF-03 ("No iniciada", "En curso", "Finalizada"): "Finalizada" se reemplaza por los dos estados finales del código. La columna Estado de la lista Objetivo debe tener los cuatro valores.
- Los textos de confirmación y de error siguen el patrón de la feature 002: «El objetivo "[nombre]" se ha cargado correctamente.» y «El objetivo "[nombre]" se ha actualizado correctamente.»; el estado vacío de la lista de objetivos de una palanca es "Esta palanca no tiene objetivos cargados.".
- No se pide confirmación antes de guardar, como en el resto de la aplicación.
- El año del objetivo se deduce de sus fechas; no hay selector de año ni filtros por año en esta feature.
- El bloque "Objetivos de otras VP" es un desvío aprobado respecto del prototipo, que no define dónde se listan esos objetivos; el plan DEBE registrarlo. Se resuelve con el componente de lista ya usado en el detalle de palanca.
- La opción "Objetivos del VP / Todos" se aplica a la sección de palancas y objetivos; no afecta a otras pantallas.
- La lista de iniciativas, el avance del objetivo (C-04), su color (C-07), el avance de la VP (C-05) y los pesos de las iniciativas los agregan features posteriores.
- El despliegue de objetivos dentro de la grilla de palancas, que RF-02 dejaba para una entrega posterior, se incluye en esta feature por pedido de la usuaria (2026-11-11). Se resuelve con filas de objetivo debajo de la palanca en la misma tabla, porque el Design System no tiene tabla anidada.
- Fuera de alcance: roles y permisos (RF-19), ABM de maestros, tablero ejecutivo (RF-17), bandejas (RF-16) y la adaptación a pantallas angostas.
