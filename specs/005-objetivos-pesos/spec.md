# Feature Specification: Ajustes de objetivos de la reunión 6 (pesos por departamento y por VP)

**Feature Branch**: `005-objetivos-pesos`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Feature: Ajustes de objetivos de la reunión 6 (pesos por departamento y por VP). Fuente: docs/especificacion-funcional.md v1.9, RF-03, RF-06 y C-05. Modifica la feature 003 (objetivos), ya implementada. El peso del objetivo pasa a tener dos niveles: peso en el departamento (obligatorio, 0 a 100, solo VP RRII) y peso en la VP (solo si el objetivo está marcado como objetivo de la VP RRII, obligatorio en ese caso, 0 a 100). El campo 'Objetivo del VP' pasa a llamarse 'Es objetivo de la VP RRII'. No se valida que los pesos sumen 100 %. Se sigue el prototipo v5 tal cual en el formulario y el detalle del objetivo, con los desvíos ya aprobados. Fuera de alcance: avance de la VP (C-05) y tablero ejecutivo." (ver Clarifications)

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, formulario de objetivo (`scr.form`, rama `fm.isObj`, y su versión en panel lateral, campos `so*`) y detalle de objetivo (`scr.objetivo`, secciones "Información del objetivo" y "Planificación").

**Modifica**: `specs/003-objetivos/spec.md`. Todo lo que esta spec no cambia sigue rigiendo como lo define la 003.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cargar los dos pesos de un objetivo de la VP RRII (Priority: P1)

Al cargar o editar un objetivo de la VP RRII, la persona completa el peso del objetivo dentro de su departamento. Si además el VP eligió ese objetivo como propio, activa la marca de objetivo de la VP RRII y completa el peso que el VP le asignó a nivel VP, que puede ser distinto del peso en el departamento.

**Why this priority**: Es el cambio central acordado en la reunión 6: sin los dos pesos no se puede reflejar cómo el comité reparte el peso dentro de cada departamento y cómo el VP lo reparte entre los objetivos que sigue.

**Independent Test**: Cargar un objetivo de la VP RRII con peso en el departamento 20 %, marcarlo como objetivo de la VP RRII con peso en la VP 15 %, guardar y verificar que el detalle muestra los dos valores; luego desmarcarlo, guardar y verificar que el peso en la VP ya no se muestra ni queda registrado.

**Acceptance Scenarios**:

1. **Given** el formulario con la VP RRII elegida, **When** la persona observa la sección "Planificación (VP RRII)", **Then** ve, en este orden: Palanca, Duración, Peso del objetivo en el Departamento (%), el interruptor de objetivo de la VP y Fecha de inicio y Fecha de compromiso; el campo "Peso del objetivo para el VP (%)" no se muestra.
2. **Given** el interruptor de objetivo de la VP desactivado, **When** la persona lo activa, **Then** aparece, inmediatamente después del interruptor, el campo "Peso del objetivo para el VP (%)", marcado como obligatorio.
3. **Given** el interruptor activado y el peso en la VP vacío, **When** la persona intenta guardar, **Then** no se guarda y el campo indica que es obligatorio.
4. **Given** el interruptor activado con un peso en la VP cargado, **When** la persona lo desactiva y guarda, **Then** el campo se oculta y el objetivo queda registrado como no objetivo de la VP RRII y sin peso en la VP.
5. **Given** el peso en el departamento vacío, **When** la persona intenta guardar, **Then** no se guarda y el campo indica que es obligatorio.
6. **Given** un peso en el departamento fuera de 0 a 100 o un peso en la VP fuera de 1 a 100, **When** la persona intenta guardar, **Then** no se guarda y el campo correspondiente indica el error.
7. **Given** un peso en el departamento de 20 % y un peso en la VP de 15 %, **When** la persona guarda, **Then** ambos quedan registrados con sus valores, sin que uno condicione al otro.
8. **Given** pesos ya cargados que no suman 100 %, ni dentro del departamento ni a nivel VP, **When** la persona guarda un objetivo con pesos válidos, **Then** se guarda sin advertencias sobre la suma.
9. **Given** el formulario de un objetivo de otra VP, **When** la persona lo observa, **Then** no ve la sección de planificación, ni pesos, ni el interruptor de objetivo de la VP, y el objetivo se registra sin pesos y sin la marca.

---

### User Story 2 - Ver los dos pesos en el detalle del objetivo (Priority: P1)

Al abrir un objetivo de la VP RRII, la persona ve su peso en el departamento en la sección de planificación y, si es objetivo de la VP RRII, el peso que tiene a nivel VP junto a esa marca.

**Why this priority**: Los pesos cargados solo sirven si se pueden consultar; el detalle es donde el VP y los departamentos verifican lo que aprobó el comité.

**Independent Test**: Abrir un objetivo marcado como objetivo de la VP RRII y uno sin marcar, y verificar qué peso se muestra en cada caso.

**Acceptance Scenarios**:

1. **Given** un objetivo de la VP RRII, **When** se abre su detalle, **Then** la sección "Planificación" muestra "Peso en el departamento" con su valor y el signo %.
2. **Given** un objetivo de la VP RRII marcado como objetivo de la VP RRII con peso en la VP 15 %, **When** se abre su detalle, **Then** el campo "¿Es objetivo de la VP RRII?" en "Información del objetivo" muestra "Sí · peso en la VP: 15 %".
3. **Given** un objetivo de la VP RRII no marcado, **When** se abre su detalle, **Then** el campo de la marca muestra "No" y no aparece ningún peso en la VP.
4. **Given** un objetivo de otra VP, **When** se abre su detalle, **Then** no se muestran pesos, ni la marca, ni la sección de planificación, como define la feature 003.

---

### User Story 3 - Indicar la cantidad de años de un objetivo plurianual (Priority: P2)

Al elegir la duración "Plurianual", el formulario pide la cantidad de años del objetivo. El detalle muestra la duración junto con esa cantidad.

**Why this priority**: Está en el prototipo y no se había implementado; completa la duración del objetivo pero no cambia los pesos, que son el centro de esta feature.

**Independent Test**: Cargar un objetivo plurianual de 3 años, verificar que no se guarda sin la cantidad de años, guardar y ver "Plurianual · 3 años" en el detalle; luego cambiarlo a Anual y verificar que la cantidad deja de mostrarse y de registrarse.

**Acceptance Scenarios**:

1. **Given** el formulario de un objetivo de la VP RRII, **When** la persona elige la duración "Plurianual", **Then** aparece, inmediatamente después de Duración, el campo obligatorio "Cantidad de años" con las opciones 2, 3, 4 y 5.
2. **Given** duración "Plurianual" sin cantidad de años, **When** la persona intenta guardar, **Then** no se guarda y el campo indica que es obligatorio.
3. **Given** duración "Anual" o "Permanente", **When** la persona observa el formulario, **Then** no ve el campo "Cantidad de años" y el objetivo se registra sin esa cantidad.
4. **Given** un objetivo plurianual de 3 años, **When** se abre su detalle, **Then** el campo Duración muestra "Plurianual · 3 años".

---

### Edge Cases

- Objetivos cargados antes de esta feature: su peso actual pasa a leerse como peso en el departamento, sin migración. Los que ya estaban marcados como objetivos del VP quedan sin peso en la VP: el detalle muestra la marca sin valor ("Sí · peso en la VP: —") y, al editarlos, el formulario exige cargarlo antes de guardar.
- Objetivos plurianuales cargados antes de esta feature: no tienen cantidad de años; el detalle muestra solo "Plurianual" y, al editarlos, el formulario exige elegirla.
- Objetivos de otra VP que ya tienen la marca guardada (por el formulario anterior, que la guardaba para cualquier VP): se corrigen en la lista del sitio de desarrollo, con la marca en No y sin peso en la VP.
- Se cambia la duración de "Plurianual" a otra: el campo "Cantidad de años" se oculta y su valor no se guarda.
- Se cambia la VP en el alta de la VP RRII a otra después de cargar pesos, la marca o la cantidad de años: ninguno de esos valores se guarda.
- Peso en el departamento y peso en la VP con valores decimales: se admiten dentro del rango permitido.
- Peso en la VP mayor que el peso en el departamento: se admite; los dos pesos son independientes.
- Peso en el departamento de 0 %: se admite. Peso en la VP de 0 %: se rechaza, porque su rango es de 1 a 100.
- Falla al guardar: se informa que la operación no pudo completarse, sin éxito falso, y el formulario conserva los dos pesos, la marca y la cantidad de años ingresados.

## Clarifications

### Session 2026-11-16

- Q: ¿El peso en el departamento es obligatorio, o opcional como en el prototipo (sin asterisco y con la ayuda "Definido de antemano")? → A: Obligatorio, sin texto de ayuda.
- Q: ¿Qué etiqueta lleva la marca: "Es objetivo de la VP RRII" o "¿Es objetivo del VP?" del prototipo? → A: "¿Es objetivo de la VP RRII?", en el formulario y en el detalle.
- Q: ¿El peso en la VP acepta de 0 a 100 o de 1 a 100 como el prototipo? → A: De 1 a 100, con el mensaje del prototipo "Ingresá un valor entre 1 y 100.".
- Q: ¿El detalle muestra el peso en la VP como campo propio en Planificación (RF-05) o dentro de la marca (prototipo)? → A: Dentro de la marca, con el texto "Sí · peso en la VP: 15 %". RF-05 v1.9 se actualizó en el mismo sentido.
- Q: ¿Se renombra la pestaña "Objetivos del VP" de la sección de palancas a "Objetivos de la VP RRII" (RF-02 v1.9)? → A: Sí.
- Q: Con "Objetivos de la VP RRII" elegido, ¿qué peso muestran las listas de objetivos? → A: Las dos columnas, "Peso" (en el departamento) y "Peso VP", solo en esa vista; en las listas de palancas, solo "Peso".

## Requirements *(mandatory)*

### Functional Requirements

**Formulario de objetivo (alta y edición)**

- **FR-001**: El formulario DEBE seguir la disposición del prototipo: una sección inicial con VP, Departamento, Gerencia, Nombre del objetivo, Descripción y Estado, y, solo para la VP RRII, la sección "Planificación (VP RRII)" con Palanca, Duración, Cantidad de años (solo si la duración es Plurianual), Peso del objetivo en el Departamento (%), el interruptor de objetivo de la VP, Peso del objetivo para el VP (%) (solo si el interruptor está activado), Fecha de inicio y Fecha de compromiso, en ese orden.
- **FR-002**: El interruptor de objetivo de la VP DEBE mostrarse solo para objetivos de la VP RRII, dentro de la sección "Planificación (VP RRII)" y a continuación del peso en el departamento. Es Sí / No, con "No" por defecto. Su etiqueta DEBE ser "¿Es objetivo de la VP RRII?", en el formulario y en el detalle, en lugar de "¿Es objetivo del VP?" del prototipo.
- **FR-003**: El campo "Peso del objetivo en el Departamento (%)" reemplaza al peso actual del objetivo. DEBE aceptar números de 0 a 100, incluidos los extremos, y representa el peso del objetivo dentro de su departamento. Es obligatorio para los objetivos de la VP RRII, se marca con asterisco y no lleva la ayuda "Definido de antemano" del prototipo.
- **FR-004**: Al activar el interruptor, el formulario DEBE mostrar el campo "Peso del objetivo para el VP (%)", obligatorio, con valores de 1 a 100, incluidos los extremos; fuera de ese rango, el campo DEBE indicar "Ingresá un valor entre 1 y 100.", como el prototipo. Al desactivarlo, el campo DEBE ocultarse y su valor NO DEBE guardarse.
- **FR-005**: El sistema NO DEBE validar que los pesos sumen 100 %, ni los pesos en el departamento de un mismo departamento ni los pesos en la VP de los objetivos marcados, ni mostrar totales asignados.
- **FR-006**: El peso en el departamento y el peso en la VP DEBEN ser independientes: ninguno se calcula ni se limita a partir del otro.
- **FR-007**: Al elegir la duración "Plurianual", el formulario DEBE mostrar el campo obligatorio "Cantidad de años", con las opciones 2, 3, 4 y 5. Con otra duración, el campo NO DEBE mostrarse y su valor NO DEBE guardarse.
- **FR-008**: Para un objetivo de otra VP, la etiqueta del departamento DEBE ser "Departamento que colabora", como en el prototipo; para la VP RRII sigue siendo "Departamento".
- **FR-009**: Un objetivo de otra VP NO DEBE registrar peso en el departamento, peso en la VP, marca de objetivo de la VP RRII ni cantidad de años, aunque se hayan completado antes de cambiar la VP en el alta.
- **FR-010**: Los errores de rango y de obligatoriedad de los nuevos campos DEBEN mostrarse en línea en el campo, como el resto del formulario, en una sola línea y sin textos de ayuda adicionales.

**Detalle de objetivo**

- **FR-011**: La sección "Planificación" del detalle de un objetivo de la VP RRII DEBE mostrar "Peso en el departamento" con el valor del peso en el departamento y el signo %.
- **FR-012**: En "Información del objetivo", el campo de la marca DEBE mostrar "Sí · peso en la VP: [peso] %" si el objetivo es de la VP RRII y está marcado, y "No" si no lo está. Si está marcado y no tiene peso en la VP, DEBE mostrar "Sí · peso en la VP: —". El texto difiere del prototipo ("peso para el VP") para coincidir con el nombre del campo "Peso en la VP (%)" de RF-03.
- **FR-013**: El campo Duración del detalle DEBE mostrar "Plurianual · [N] años" para un objetivo plurianual con cantidad de años cargada, y solo la duración en los demás casos.

**Listas y filtros existentes**

- **FR-014**: En las listas de objetivos por palanca (detalle de palanca y despliegue en la pestaña "Todas las palancas"), la columna "Peso" DEBE mostrar el peso en el departamento y NO DEBE mostrarse la columna "Peso VP". Solo en la lista de la pestaña "Objetivos de la VP RRII", a continuación de "Peso" (peso en el departamento), DEBE mostrarse además la columna "Peso VP" con el peso en la VP. Un objetivo marcado sin peso en la VP muestra "—" en esa columna.
- **FR-015**: La pestaña de la sección de palancas "Objetivos del VP" DEBE pasar a llamarse "Objetivos de la VP RRII" (RF-02 v1.9), con la cantidad entre paréntesis como hoy, y seguir listando solo los objetivos de la VP RRII marcados con "¿Es objetivo de la VP RRII?". Las pestañas "Todas las palancas" y "Objetivos de otras VP" no cambian. El estado vacío de esa pestaña pasa a decir "No hay objetivos de la VP RRII cargados.".

**Lo que se mantiene**

- **FR-016**: El objetivo NO DEBE tener área: su ubicación organizativa es solo departamento y gerencia.
- **FR-017**: Se mantienen todas las decisiones de la feature 003 que esta spec no modifica, y los desvíos ya aprobados: migas de pan en lugar del botón "Ubicación en la estrategia", el componente de migas, el encabezado de grilla y el indicador de carga registrados en Complexity Tracking.

### Key Entities

- **Objetivo** (modificado): se reemplaza "Peso en la VP (0 a 100)" por **Peso en el departamento** (0 a 100, obligatorio, solo VP RRII), que se guarda en la columna de peso existente. Se agrega **Peso en la VP** (1 a 100, obligatorio solo si está marcado como objetivo de la VP RRII), que se guarda en una columna nueva de la lista Objetivo. La marca "Objetivo del VP" pasa a llamarse "¿Es objetivo de la VP RRII?" y sigue en la columna existente. Se empieza a usar **Cantidad de años** (2 a 5, solo para duración Plurianual), que ya existe en la lista Objetivo pero no se mostraba. El resto de los atributos no cambia.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los objetivos de la VP RRII guardados después de esta feature tienen peso en el departamento entre 0 y 100, y el 100 % de los marcados como objetivo de la VP RRII tienen además peso en la VP entre 1 y 100.
- **SC-002**: El 100 % de los objetivos guardados sin la marca de objetivo de la VP RRII quedan sin peso en la VP, y el 100 % de los no plurianuales, sin cantidad de años.
- **SC-003**: El 100 % de los objetivos de otra VP guardados quedan sin pesos, sin marca y sin cantidad de años.
- **SC-004**: El 100 % de los intentos de guardar con un peso fuera de rango, con la marca activada y sin peso en la VP, o con duración plurianual y sin cantidad de años se rechazan, con el error indicado en el campo.
- **SC-005**: Una persona puede cargar un objetivo de la VP RRII con sus dos pesos en menos de 3 minutos.
- **SC-006**: En una comparación lado a lado con el prototipo, una persona revisora no encuentra diferencias de disposición, campos, textos ni campos condicionales en el formulario y el detalle de objetivo, fuera de los desvíos aprobados (FR-017) y de las decisiones de la feature 003 que se mantienen.

## Assumptions

- La fuente es `docs/especificacion-funcional.md` v1.9 (16/11/2026), RF-03, RF-05, RF-06 y C-05.
- **Agregado desde el prototipo (pedido de la usuaria)**: el campo "Cantidad de años" para la duración Plurianual (US3, FR-007 y FR-013) y la etiqueta "Departamento que colabora" para objetivos de otra VP (FR-008). La 003 los había dejado fuera. La cantidad de años usa las opciones 2 a 5, como el prototipo y RF-03 v1.9.
- **Reubicado desde el prototipo**: el interruptor de objetivo de la VP pasa de la primera sección, donde está hoy junto a Gerencia y visible para cualquier VP, a la sección de planificación, solo para la VP RRII, como en el prototipo y en la regla de la 003 (la marca es solo de la VP RRII).
- **Datos**: la columna actual de peso pasa a representar el peso en el departamento, sin renombrarla ni migrar valores. El peso en la VP requiere una columna nueva en la lista Objetivo, que el plan debe proponer y la usuaria aprobar antes de crearla. La cantidad de años usa la columna que ya existe en la lista Objetivo. No se planifica ningún otro cambio en la lista Objetivo sin avisar antes.
- El detalle muestra el peso en la VP dentro del campo de la marca ("Sí · peso en la VP: 15 %"), como el prototipo y RF-05 v1.9, en lugar de un campo propio en Planificación.
- Los textos de los nuevos campos, sus placeholders ("Ej. 15" y "Ej. 10") y su disposición salen del prototipo, salvo la etiqueta de la marca, la obligatoriedad del peso en el departamento y la ayuda "Definido de antemano", que se omite (Clarifications).
- El valor inicial del Estado en el alta sigue siendo "No iniciada", como decidió la 003, aunque el prototipo use "No iniciado".
- La sección de palancas ya se organiza en tres pestañas ("Todas las palancas", "Objetivos del VP" y "Objetivos de otras VP"); esta feature solo renombra la segunda y le agrega la columna "Peso VP" (FR-014, FR-015).
- Los objetivos de otra VP siguen ocultando la palanca y la marca en el detalle, como decidió la 003, aunque el prototipo muestre "No aplica" y "No".
- El prototipo incluye datos de área y de responsable por persona en el objetivo; no se incorporan (FR-016).
- Fuera de alcance: el avance de la VP (C-05) y el tablero ejecutivo, que cuando se construyan usan el peso en la VP de los objetivos marcados; roles y permisos (RF-19); avance, color, iniciativas y "Ubicación en la estrategia" en el detalle.
