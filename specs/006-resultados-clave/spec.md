# Feature Specification: Resultados clave y cálculo de avance

**Feature Branch**: `006-resultados-clave`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Feature: Resultados clave y cálculo de avance. Fuente: docs/especificacion-funcional.md v1.9, RF-08 (peso de los resultados clave), RF-09, RF-10 y la sección 5 (cálculos C-01 a C-04 y C-07), y el prototipo (bloque 'Resultados clave' del panel de cargar/editar iniciativa, sección 'Resultados clave' del detalle de la iniciativa y panel 'Seguimiento del resultado clave'). Continúa la 004-iniciativas, que dejó fuera los resultados clave y el avance. Cada iniciativa de un objetivo de la VP RRII se mide con uno o más resultados clave; el avance se calcula de resultado clave → iniciativa → objetivo y se muestra en la bandeja, el detalle de la iniciativa, el detalle del objetivo y el detalle de la palanca."

**Fuente vigente**: `docs/especificacion-funcional.md` v1.9. Donde la v1.9 dice que el resultado clave tiene Responsable o Descripción, manda esta spec: las usuarias decidieron que no los tiene.

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, que contiene el prototipo v10 aunque el nombre de la carpeta diga v5: bloque "Resultados clave" del panel de cargar/editar iniciativa, sección "Resultados clave" del detalle de la iniciativa, panel "Seguimiento del resultado clave" (`krUpd`), avance en encabezados y grillas, y columna Avance de la bandeja. Donde el prototipo difiere de lo ya implementado en palancas, objetivos e iniciativas (features 002, 003, 004 y 005), manda lo implementado.

**Modifica**: `specs/004-iniciativas/spec.md` (FR-034, que excluía avance y resultados clave del detalle, y la bandeja, el panel y el detalle de objetivo). Todo lo que esta spec no cambia sigue rigiendo como lo define la 004.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cargar los resultados clave al cargar una iniciativa (Priority: P1)

Al cargar una iniciativa de un objetivo de la VP RRII, la persona completa en el mismo panel los resultados clave que la miden: nombre, tipo de medición, unidad, mínimo, meta y máximo. Arranca con un resultado clave y puede agregar más con "+". Al confirmar, la iniciativa y sus resultados clave se guardan juntos.

**Why this priority**: Sin resultados clave no hay avance. Es la base de todos los cálculos de la feature.

**Independent Test**: Elegir un objetivo de la VP RRII en "Cargar iniciativa", completar la iniciativa y dos resultados clave, confirmar; verificar que ambos quedan asociados a la iniciativa, que no se puede guardar sin ninguno ni con mínimo > meta o meta > máximo, y que con un objetivo de otra VP el bloque no aparece.

**Acceptance Scenarios**:

1. **Given** el panel de alta con un objetivo de la VP RRII elegido, **When** se muestra el panel, **Then** aparece el bloque "Resultados clave" después de los campos de la iniciativa, con un resultado clave y un "+" para agregar más, y sin botón para quitar el primero.
2. **Given** dos o más resultados clave en el panel, **When** la persona quita uno con su botón, **Then** desaparece del panel y los restantes se renumeran.
3. **Given** un resultado clave con Mínimo 10, Meta 5 y Máximo 100, **When** la persona intenta guardar, **Then** no se guarda y el error aparece en el campo correspondiente.
4. **Given** un resultado clave sin nombre, tipo, unidad, mínimo, meta o máximo, **When** la persona intenta guardar, **Then** no se guarda y cada campo faltante muestra su error.
5. **Given** un objetivo de otra VP elegido, **When** se muestra el panel, **Then** el bloque "Resultados clave" no se muestra y la iniciativa se guarda sin ellos.
6. **Given** el panel de alta completo y válido, **When** la persona confirma, **Then** se muestra la misma confirmación de la 004, y al aceptar se registran la iniciativa y todos sus resultados clave, con el mismo mensaje de éxito de la 004.
7. **Given** un resultado clave recién creado, **When** se consulta su valor proyectado, **Then** es igual a su meta y su valor actual está vacío.

---

### User Story 2 - Ver el resultado clave y el avance en el detalle de la iniciativa (Priority: P1)

Al abrir el detalle de una iniciativa de un objetivo de la VP RRII, la persona ve el avance de la iniciativa en el encabezado, como un porcentaje con su color, y la sección "Resultados clave (N)" con cada resultado clave, su peso, sus valores, su cumplimiento y su estado.

**Why this priority**: Es donde se lee el resultado del trabajo cargado; sin esta vista la carga no tiene valor visible.

**Independent Test**: Abrir el detalle de una iniciativa con los dos resultados clave del ejemplo de validación y verificar avance 70 % en amarillo, pesos 50 % y 50 %, cumplimientos 40 % y 110 %, y los estados; abrir el de una iniciativa de otra VP y verificar que no hay sección ni avance.

**Acceptance Scenarios**:

1. **Given** una iniciativa con resultados clave, **When** se abre su detalle, **Then** el encabezado muestra "Avance: X %" con su color y la sección "Resultados clave (N)" lista una fila por resultado clave con las columnas Resultado clave (nombre, unidad y fuente), Tipo, Mín., Meta, Máx., Peso, Actual, Proyect., Cumplim., Estado y Acción.
2. **Given** dos resultados clave, uno con máximo 100 y valor actual 40 y otro con máximo 210 y valor actual 230, **When** se abre el detalle, **Then** los cumplimientos son 40 % y 110 %, el avance de la iniciativa es 70 % y se muestra en amarillo.
3. **Given** un resultado clave sin valor actual, **When** se abre el detalle, **Then** Cumplim. muestra "—" y Estado muestra "Sin dato" como chip gris; para el avance de la iniciativa, ese resultado clave aporta 0 %.
4. **Given** un resultado clave con valor proyectado, **When** se abre el detalle, **Then** la columna Proyect. muestra solo el valor proyectado, y Cumplim. y Estado se calculan con el valor actual, no con el proyectado.
5. **Given** una iniciativa de un objetivo de otra VP, **When** se abre su detalle, **Then** no se muestran la sección "Resultados clave" ni el avance.
6. **Given** una iniciativa con N resultados clave, **When** se muestra el peso, **Then** cada uno pesa 100 % ÷ N, en modo lectura.

---

### User Story 3 - Actualizar el seguimiento de un resultado clave (Priority: P1)

Desde el detalle de la iniciativa, la persona abre la acción de una fila y, en un panel lateral "Seguimiento del resultado clave", actualiza el valor actual, el valor proyectado al 31/12, la fuente, la evidencia y el comentario. Al guardar, el cumplimiento, el estado y los avances se recalculan.

**Why this priority**: El avance solo cambia con el seguimiento; es el uso recurrente de la feature.

**Independent Test**: Abrir el seguimiento de un resultado clave, cargar valor actual 40 con máximo 100, guardar; verificar que la fila muestra 40 %, que el avance de la iniciativa, del objetivo y de la bandeja se actualizan, y que el comentario queda con fecha y autor.

**Acceptance Scenarios**:

1. **Given** el detalle de una iniciativa con resultados clave, **When** la persona usa la acción de una fila, **Then** se abre el panel "Seguimiento del resultado clave" con "Unidad · tipo" y "Mínimo · Meta · Máximo" en modo lectura y los campos Valor actual, Valor proyectado al 31/12, Fuente, Evidencia (link) y Comentario.
2. **Given** el panel abierto, **When** la persona intenta modificar mínimo, meta o máximo, **Then** no puede: solo se ven en modo lectura.
3. **Given** el panel abierto, **When** la persona deja vacío el valor proyectado o ingresa un valor no numérico en el valor actual o proyectado, **Then** no se guarda y el error aparece en el campo.
4. **Given** un seguimiento válido, **When** la persona guarda, **Then** el panel se cierra, la fila muestra los valores nuevos y los cumplimientos, estados y avances se recalculan.
5. **Given** un comentario ingresado, **When** la persona guarda, **Then** el comentario queda registrado con la fecha y el autor.
6. **Given** el panel de un resultado clave ya actualizado, **When** se abre, **Then** muestra los valores vigentes de valor actual, valor proyectado, fuente y evidencia, y el último comentario con su fecha y autor.

---

### User Story 4 - Ver el avance en bandeja, detalle del objetivo y detalle de la palanca (Priority: P2)

La persona ve el avance de las iniciativas en la bandeja y en la sección Iniciativas del detalle del objetivo, y el avance de los objetivos en el encabezado del detalle del objetivo, en la grilla de objetivos del detalle de la palanca y en la grilla de objetivos. Siempre es un único porcentaje con su color.

**Why this priority**: Da la lectura agregada del avance, pero depende de que existan resultados clave y seguimiento.

**Independent Test**: Con un objetivo de tres iniciativas con avance 70 %, 90 % y 60 %, verificar que el objetivo muestra 73 %; verificar la columna Avance en la bandeja (con "No aplica" para otra VP), en el detalle del objetivo y en la palanca, y que una iniciativa cancelada no entra en el promedio.

**Acceptance Scenarios**:

1. **Given** la bandeja de iniciativas, **When** se muestra, **Then** tiene la columna Avance, con el porcentaje y su color para iniciativas de objetivos de la VP RRII y "No aplica" para las de otra VP.
2. **Given** un objetivo de la VP RRII con tres iniciativas no canceladas de avance 70 %, 90 % y 60 %, **When** se abre su detalle, **Then** el encabezado muestra "Avance: 73 %" en amarillo.
3. **Given** el detalle del objetivo, **When** se muestra la sección Iniciativas, **Then** tiene la columna Avance con el porcentaje y su color de cada iniciativa.
4. **Given** una iniciativa cancelada en el objetivo, **When** se calcula el avance del objetivo, **Then** esa iniciativa no cuenta en el promedio.
5. **Given** el detalle de una palanca o la grilla de objetivos, **When** se muestra, **Then** cada objetivo de la VP RRII muestra su avance con su color.
6. **Given** un objetivo de otra VP, **When** se muestra en cualquier vista, **Then** no tiene avance calculado.
7. **Given** un avance menor a 60 %, de 60 % a menos de 80 %, o de 80 % en adelante, **When** se muestra, **Then** el color es rojo, amarillo o verde respectivamente.

---

### User Story 5 - Agregar, editar o quitar resultados clave al editar la iniciativa (Priority: P2)

Al editar una iniciativa de un objetivo de la VP RRII, la persona puede agregar resultados clave, modificar los existentes o quitarlos, siempre que quede al menos uno. Los pesos se recalculan.

**Why this priority**: Corrige y completa lo cargado; es secundario frente a la carga y el seguimiento.

**Independent Test**: Editar una iniciativa con dos resultados clave, quitar uno, agregar otro y modificar la meta de un tercero; guardar y verificar el detalle, los pesos y el avance; verificar que no se puede quitar el único resultado clave.

**Acceptance Scenarios**:

1. **Given** el panel de edición de una iniciativa de la VP RRII, **When** se abre, **Then** muestra el bloque "Resultados clave" con los resultados clave actuales precargados.
2. **Given** un solo resultado clave, **When** se muestra el panel, **Then** no ofrece quitarlo.
3. **Given** el panel de edición con cambios en los resultados clave, **When** la persona confirma, **Then** la iniciativa y los resultados clave agregados, modificados y quitados se guardan juntos, con la misma confirmación y el mismo mensaje de éxito de la 004.
4. **Given** un resultado clave con seguimiento cargado, **When** se modifica su nombre, tipo, unidad, mínimo, meta o máximo en la edición, **Then** su valor actual, valor proyectado, fuente, evidencia y comentario se conservan.
5. **Given** un resultado clave quitado, **When** se guarda, **Then** deja de mostrarse y de contar en los pesos y en el avance.

---

### Edge Cases

- Iniciativas de la VP RRII ya cargadas con la 004, que todavía no tienen resultados clave: ver FR-024.
- Objetivo de la VP RRII sin iniciativas no canceladas: ver FR-025.
- Iniciativa cancelada: conserva sus resultados clave y su avance en su propio detalle y bandeja, pero no cuenta en el avance del objetivo.
- Mínimo, meta y máximo iguales entre sí (por ejemplo 100, 100, 100): es válido; el estado con valor igual al máximo es "Máximo".
- Máximo menor o igual que 0: no se guarda y el error aparece en el campo Máximo.
- Mínimo o meta negativos: son números válidos mientras se cumpla Mínimo ≤ Meta ≤ Máximo.
- Valor actual mayor que el máximo: el cumplimiento supera 100 % y se muestra tal cual, pero suma como 100 % en el avance de la iniciativa.
- Valor actual o proyectado negativo: es numérico y se acepta; el cumplimiento resultante se muestra tal cual.
- Evidencia que no es un link válido, o que no es de un dominio de confianza (por ejemplo, un link de otro sitio): no se guarda y el error aparece en el campo.
- Se modifica el mínimo, la meta o el máximo de un resultado clave con seguimiento cargado: el valor proyectado no se modifica; cumplimiento y estado se recalculan con los nuevos límites.
- Se guarda un seguimiento sin cambios: se acepta y no altera los valores.
- Comentario del seguimiento vacío: no registra un comentario nuevo.
- Falla el alta de la iniciativa o de alguno de sus resultados clave: el sistema deshace lo que alcanzó a guardar; si el deshacer también falla, se informa en una línea que la operación no pudo completarse.
- Falla la edición de la iniciativa o de alguno de sus resultados clave: lo que se alcanzó a guardar queda y se informa en una línea que la operación no pudo completarse.
- Después de un fallo del alta o de la edición, el panel conserva lo ingresado y, al reintentar, no se duplica lo que ya se guardó.
- Iniciativa, resultado clave o seguimiento que no existe al abrir el detalle o el panel: se aplica el comportamiento de la 004 para iniciativas inexistentes (FR-033a).

## Clarifications

### Session 2026-11-18

- Q: ¿Cumplim. y Estado de la tabla de resultados clave se calculan con el valor actual o con el proyectado? → A: Con el valor actual (como la maqueta); Proyect. muestra solo el valor proyectado. Sin valor actual, Cumplim. muestra "—" y Estado "Sin dato" (chip gris); para el avance de la iniciativa ese resultado clave aporta 0 %. Difiere de la v1.9 (C-01 y C-02), que mostraba 0 % y "No cumple".
- Q: ¿El resultado clave tiene Responsable o Descripción? → A: No. Lo decidieron las usuarias; manda esta spec sobre la v1.9. El seguimiento y cualquier aviso sobre el resultado clave corresponden al Accountable de la iniciativa. La columna Descripción de la lista se mantiene en SharePoint, pero esta feature no la usa: no se muestra ni se escribe.
- Q: ¿Cómo se carga el peso del resultado clave? → A: No se carga: lo calcula el sistema como 100 % ÷ la cantidad de resultados clave de la iniciativa y se muestra en modo lectura. Difiere del prototipo, que tiene un campo de peso.
- Q: ¿Se muestran los textos de ayuda del prototipo? → A: No: ni "Al menos uno · los pesos suman 100 % · Mínimo ≤ Meta ≤ Máximo" del panel, ni la fórmula del avance en la sección Resultados clave, ni la nota sobre objetivos de otra VP.
- Q: ¿Qué pasa si se cambia el objetivo de una iniciativa entre la VP RRII y otra VP? → A: No aplica: la 004 no permite cambiar el objetivo al editar (FR-024 de la 004).
- Q: ¿Qué avance muestra una iniciativa de la VP RRII sin resultados clave? → A: 0 %, en rojo, y cuenta en el promedio del objetivo (como la maqueta).
- Q: ¿Qué avance muestra un objetivo sin iniciativas no canceladas? → A: 0 %, en rojo (como la maqueta).
- Q: ¿Qué pasa si falla el guardado conjunto de la iniciativa y sus resultados clave? → A: En el alta, el sistema deshace lo que alcanzó a guardar; si el deshacer también falla, se informa en una línea que la operación no pudo completarse. En la edición no se deshace: lo que se alcanzó a guardar queda (como "Cambiar estado" de la 004) y se informa en una línea que la operación no pudo completarse. En los dos casos el panel conserva lo ingresado y reintentar no duplica lo ya guardado. SharePoint no ofrece transacciones entre listas, por eso "todos o ninguno" no se puede garantizar (decisión del 2026-11-18).
- Q: ¿Qué links admite la evidencia? → A: Solo los de dominios de confianza de la plantilla (validación centralizada del proyecto); el error dice «Ingresá un link de SharePoint u Office 365.» para que se entienda por qué se rechaza un link de otro sitio (decisión del 2026-11-18).
- Q: ¿Cómo se muestra el comentario del último seguimiento en el panel? → A: Precargado en el campo Comentario con una línea de solo lectura con la fecha y el autor del último (la maqueta lo abre vacío y sin fecha ni autor; decisión de la usuaria del 2026-11-18).
- Q: ¿Se puede registrar el seguimiento según el estado de la iniciativa? → A: Sí, en cualquier estado, incluidas Finalizada y Cancelada (como la maqueta).
- Q: ¿Cómo se redondean los porcentajes de cumplimiento y de avance? → A: A entero, en todas las vistas (como la maqueta); el redondeo es solo de presentación.
- Q: ¿Quién puede cargar resultados clave y actualizar su seguimiento? → A: Cualquier persona que use la aplicación, porque los roles todavía no se implementan. Más adelante (RF-19), el seguimiento lo hará el Accountable de la iniciativa; por eso cargar y hacer el seguimiento quedan como permisos separados.

## Requirements *(mandatory)*

### Functional Requirements

**Resultado clave**

- **FR-001**: Todo resultado clave DEBE pertenecer a una única iniciativa. El ID lo asigna el sistema y NO DEBE poder editarse.
- **FR-002**: Son obligatorios Nombre, Tipo de medición, Unidad, Mínimo, Meta, Máximo y Valor proyectado al 31/12. Valor actual, Fuente, Evidencia y Comentario son opcionales.
- **FR-003**: Tipo de medición DEBE ofrecer Cantidad, Porcentaje, Moneda e Indicador. Un resultado de hitos se expresa como Cantidad.
- **FR-004**: Mínimo, Meta, Máximo, Valor actual y Valor proyectado DEBEN ser numéricos. Máximo DEBE ser mayor que 0.
- **FR-005**: DEBE cumplirse Mínimo ≤ Meta ≤ Máximo; si no se cumple, el sistema NO DEBE guardar y DEBE mostrar el error en el campo correspondiente.
- **FR-006**: El resultado clave NO DEBE tener Responsable ni Descripción: no se muestran, no se cargan ni se escriben.
- **FR-007**: Al crearse, el Valor proyectado DEBE tomar el valor de la Meta y el Valor actual DEBE quedar vacío. Ambos NO se cargan en el panel de cargar y editar iniciativa.
- **FR-008**: Al guardar, la columna Title de la lista DEBE recibir el mismo valor que el nombre del resultado clave, al crear y al editar.
- **FR-009**: Evidencia DEBE admitir un único link válido, de un dominio de confianza de la plantilla (sharepoint.com, office.com, microsoft.com, powerbi.com, outlook.com u onedrive.com). Si el link no es válido o no es de uno de esos dominios, el error del campo DEBE decir «Ingresá un link de SharePoint u Office 365.».
- **FR-010**: La aplicación NO DEBE ofrecer ninguna acción para eliminar un resultado clave por fuera del panel de edición de la iniciativa (FR-016).

**Peso**

- **FR-011**: Cada resultado clave DEBE pesar 100 % ÷ la cantidad de resultados clave de su iniciativa. El peso DEBE recalcularse al agregar o quitar un resultado clave y DEBE mostrarse siempre en modo lectura, en la sección Resultados clave del detalle. El panel NO DEBE tener campo de peso.

**Panel de cargar y editar iniciativa**

- **FR-012**: Si el objetivo elegido es de la VP RRII, el panel DEBE mostrar el bloque "Resultados clave" después de los campos de la iniciativa, con un primer resultado clave y un "+" para agregar más. Si el objetivo es de otra VP, o todavía no hay objetivo elegido, el bloque NO DEBE mostrarse.
- **FR-013**: Cada resultado clave DEBE cargarse en un bloque con el nombre ("Resultado clave N") a todo el ancho, Tipo de medición | Unidad, y Mínimo | Meta | Máximo. Cada resultado clave, salvo el primero, DEBE tener un botón para quitarlo.
- **FR-014**: Una iniciativa de un objetivo de la VP RRII DEBE tener al menos un resultado clave; el sistema NO DEBE permitir guardarla sin uno.
- **FR-015**: La iniciativa y sus resultados clave DEBEN guardarse juntos, con la misma confirmación y el mismo mensaje de éxito de la 004 (FR-025 y FR-026): si falla el alta, el sistema DEBE deshacer lo que alcanzó a guardar; si el deshacer también falla, DEBE informar en una línea que la operación no pudo completarse. Si falla la edición, lo que se alcanzó a guardar queda y el sistema DEBE informar en una línea que la operación no pudo completarse. En los dos casos el panel DEBE conservar lo ingresado y reintentar NO DEBE duplicar lo que ya se guardó.
- **FR-016**: Al editar, la persona DEBE poder agregar resultados clave, modificar los existentes o quitarlos, siempre que quede al menos uno. Modificar un resultado clave NO DEBE alterar su valor actual, valor proyectado, fuente, evidencia ni comentario.
- **FR-017**: Los errores de validación DEBEN mostrarse en el campo que los origina, en una sola línea, y NO DEBE mostrarse el texto de ayuda del prototipo.

**Seguimiento**

- **FR-018**: La acción de cada fila de la sección Resultados clave del detalle DEBE abrir un panel lateral "Seguimiento del resultado clave", que muestra en modo lectura "Unidad · tipo" y "Mínimo · Meta · Máximo", y los campos editables Valor actual, Valor proyectado al 31/12, Fuente, Evidencia (link) y Comentario.
- **FR-018a**: Al guardar el seguimiento, el sistema DEBE mostrar «El resultado clave "[nombre]" se ha actualizado correctamente.» sin pedir confirmación previa, como la maqueta.
- **FR-019**: En el seguimiento SOLO DEBEN poder modificarse el valor actual, el valor proyectado, la fuente, la evidencia y el comentario. Valor proyectado es obligatorio; el valor actual puede quedar vacío.
- **FR-020**: Al guardar el seguimiento, el comentario DEBE registrarse con su fecha y su autor. Solo se muestra el último; NO se ofrece historial de seguimientos. Un comentario vacío NO DEBE registrar uno nuevo.
- **FR-021**: Al guardar el seguimiento, el sistema DEBE recalcular el cumplimiento y el estado del resultado clave y el avance de la iniciativa y del objetivo.
- **FR-022**: El valor es declarativo: NO DEBE depender de las tareas.

**Iniciativas de otra VP y datos existentes**

- **FR-023**: Las iniciativas de objetivos de otra VP NO DEBEN tener resultados clave ni avance. Como una iniciativa guardada no puede cambiar de objetivo (FR-024 de la 004), una iniciativa nunca pasa entre un objetivo de la VP RRII y uno de otra VP.
- **FR-024**: Una iniciativa de un objetivo de la VP RRII sin resultados clave (cargada con la 004) DEBE mostrar 0 % como avance, en rojo, y DEBE contar en el promedio del avance del objetivo. Al editarla, DEBE exigirse al menos un resultado clave (FR-014).
- **FR-025**: Un objetivo de la VP RRII sin iniciativas no canceladas DEBE mostrar 0 % como avance, en rojo.

**Cálculos** (se calculan con el valor actual; el valor proyectado no interviene en ninguno)

- **FR-026 (C-01)**: El cumplimiento del resultado clave DEBE ser valor actual ÷ máximo. Sin valor actual, el cumplimiento real vale 0 % para el avance de la iniciativa (FR-028), pero la columna Cumplim. DEBE mostrar "—". PUEDE superar 100 %.
- **FR-027 (C-02)**: El estado del resultado clave DEBE ser: valor < mínimo → No cumple (rojo); mínimo ≤ valor < meta → Mínimo (naranja); meta ≤ valor < máximo → Meta (amarillo); valor ≥ máximo → Máximo (verde). Sin valor actual, el estado DEBE ser "Sin dato", como chip gris. Las columnas Cumplim. y Estado de la tabla de resultados clave DEBEN calcularse con el valor actual; el valor proyectado se muestra solo como valor en la columna Proyect.
- **FR-028 (C-03)**: El avance de la iniciativa DEBE ser el promedio simple de mín(cumplimiento, 100 %) de sus resultados clave. Las tareas NO intervienen.
- **FR-029 (C-04)**: El avance del objetivo DEBE ser el promedio simple del avance de sus iniciativas no canceladas. NO DEBE calcularse para objetivos de otra VP.
- **FR-030 (C-07)**: El color del avance de iniciativas y objetivos DEBE ser: menos de 60 % → rojo; de 60 % a menos de 80 % → amarillo; 80 % o más → verde. Los umbrales son fijos en esta feature.
- **FR-031**: Todos los porcentajes de cumplimiento y de avance DEBEN mostrarse redondeados a entero (por ejemplo "70 %" y "73 %"), en la tabla, el encabezado, la bandeja y los detalles del objetivo y de la palanca. El redondeo es solo de presentación: los promedios y los colores se calculan con los valores sin redondear.

**Vistas**

- **FR-032**: El detalle de la iniciativa DEBE mostrar el avance en el encabezado, como "Avance: X %" con su color, y la sección "Resultados clave (N)" con las columnas Resultado clave (nombre, unidad y fuente), Tipo, Mín., Meta, Máx., Peso, Actual, Proyect., Cumplim., Estado y Acción. Una iniciativa de un objetivo de otra VP NO DEBE mostrar la sección ni el avance.
- **FR-033**: La bandeja de iniciativas DEBE sumar la columna Avance, que muestra el porcentaje con su color o "No aplica" para iniciativas de objetivos de otra VP.
- **FR-034**: El detalle del objetivo DEBE mostrar el avance del objetivo con su color en el encabezado y sumar la columna Avance en la sección Iniciativas.
- **FR-035**: El detalle de la palanca y la grilla de objetivos DEBEN mostrar el avance de cada objetivo de la VP RRII.
- **FR-036**: En las grillas y los encabezados DEBE mostrarse un único porcentaje de avance, con su color. El valor proyectado SOLO DEBE aparecer en la tabla de resultados clave del detalle de la iniciativa.
- **FR-037**: La sección "Resultados clave" del detalle NO DEBE mostrar la fórmula del avance ni otro texto de ayuda. Sin resultados clave, DEBE mostrar un estado vacío de una sola línea.

**Permisos y diseño**

- **FR-037a**: El seguimiento DEBE poder registrarse en cualquier estado de la iniciativa, incluidas Finalizada y Cancelada.
- **FR-038**: En esta feature, cualquier persona que use la aplicación DEBE poder cargar resultados clave (al crear o editar la iniciativa) y actualizar su seguimiento.
- **FR-039**: Cargar resultados clave y hacer el seguimiento DEBEN quedar como dos permisos separados e identificables, para que una feature posterior (RF-19) pueda restringirlos de forma independiente sin rehacer las pantallas.
- **FR-040**: La bandeja, el detalle y los paneles DEBEN seguir el diseño ya implementado en palancas, objetivos e iniciativas. NO DEBEN crearse rutas para pantallas que no estén implementadas.
- **FR-041**: Los mensajes de error y los estados vacíos DEBEN ser de una sola línea. Todos los textos visibles DEBEN estar en español (Argentina).

### Key Entities

- **Resultado clave**: medida de logro de una iniciativa. Atributos: ID, iniciativa, nombre, tipo de medición, unidad, mínimo, meta, máximo, peso (calculado), valor actual, valor proyectado al 31/12, fuente, evidencia y último comentario con fecha y autor. Pertenece a una única iniciativa de un objetivo de la VP RRII. No tiene responsable ni descripción.
- **Iniciativa** (ya existente, 004): suma sus resultados clave y su avance calculado. Las de objetivos de otra VP no los tienen.
- **Objetivo** (ya existente, 003 y 005): suma su avance calculado a partir de sus iniciativas no canceladas. Solo los objetivos de la VP RRII lo tienen.
- **Seguimiento del resultado clave**: acto de actualizar valor actual, valor proyectado, fuente, evidencia y comentario de un resultado clave. Solo se conserva el último.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona puede cargar una iniciativa de la VP RRII con tres resultados clave, en el mismo panel y con una sola confirmación, en menos de 5 minutos.
- **SC-002**: Una persona puede actualizar el seguimiento de un resultado clave en menos de 1 minuto desde el detalle de la iniciativa.
- **SC-003**: El ejemplo de validación (resultados clave 40 % y 110 %) da avance de iniciativa 70 % en amarillo, y el de tres iniciativas con 70 %, 90 % y 60 % da avance de objetivo 73 %, en el 100 % de las pruebas.
- **SC-004**: El 100 % de los intentos de guardar una iniciativa de la VP RRII sin resultados clave, o con Mínimo ≤ Meta ≤ Máximo incumplido, son rechazados con el error en el campo.
- **SC-005**: Tras guardar un seguimiento, el nuevo avance se ve en el detalle de la iniciativa, la bandeja, el detalle del objetivo y el detalle de la palanca sin necesidad de acciones adicionales de la persona.
- **SC-006**: En el 100 % de las vistas, las iniciativas y objetivos de otra VP no muestran avance calculado ni resultados clave.

## Assumptions

- Se asume que la lista de resultados clave y la de comentarios de resultado clave ya existen. Esta feature no cambia sus columnas; si el plan detecta que hace falta, DEBE avisarse antes de planificar el cambio.
- La columna Descripción de la lista de resultados clave se mantiene en SharePoint, pero esta feature no la usa. Si la lista exigiera Responsable como obligatorio, el plan DEBE avisarlo antes de planificar, porque esta feature no lo carga.
- Los valores numéricos admiten decimales. Los porcentajes de cumplimiento y de avance se redondean a entero (FR-031).
- Los cumplimientos pueden superar 100 % y se muestran sin tope; solo el avance de la iniciativa los limita a 100 % por resultado clave.
- La fecha del comentario es la del momento de guardar el seguimiento y el autor es la persona que lo guarda.
- Los umbrales de color de C-07 son fijos (60 % y 80 %) hasta la feature que implemente RF-22.
- Quedan fuera de alcance: el avance de la VP (C-05) y el tablero ejecutivo (RF-17); los umbrales como parámetros (RF-22); el historial de seguimientos; tareas, riesgos y presupuesto (RF-12 a RF-15); roles y permisos (RF-19); y los cambios del prototipo v10 sobre objetivos (estado Finalizado cumplido / incumplido y solapa "Objetivos de otras VP"), que van en otra feature.
- Hasta que existan los roles, el aviso al Accountable sobre un resultado clave no tiene mecanismo: solo se define que le corresponde.
