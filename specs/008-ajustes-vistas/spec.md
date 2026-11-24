# Feature Specification: Ajustes de vistas (filtros y solapa "Todos los objetivos", resumen sin avance, mensaje de Actualizar y confirmación al guardar)

**Feature Branch**: `008-ajustes-vistas`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Feature: Ajustes de vistas (filtros y solapa "Todos los objetivos" en palancas y objetivos, línea de resumen sin avance, mensaje de Actualizar y confirmación al guardar palancas y objetivos). Fuente: prototipo de docs/Gestion-Objetivos-VP-RRII-prototipo_v5 (versión v10), pantalla "Galería de palancas estratégicas", panel "Filtros" y modales de confirmación; y pedidos de las usuarias." (ver Clarifications)

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`: pantalla `scr.palancas` (botones Actualizar y Filtros, estado sin resultados), panel de filtros (`dFoot`: Limpiar / Aplicar) y modales de confirmación del formulario (`obj`, línea 1769).

**Modifica**: `src/core/api/useDatasource.ts` (agrega el método `reloadItems`, que recarga y relanza el error, solo para el botón Actualizar; `getItems` no cambia; se registra en `docs/plantilla-cambios.md`), `specs/002-palancas-estrategicas/spec.md`, `specs/003-objetivos/spec.md`, `specs/005-objetivos-pesos/spec.md` y `specs/004-iniciativas/spec.md` (reutiliza su panel de filtros y su modal; cambia el texto de su botón "Limpiar filtros" a "Limpiar" y suma el botón Actualizar a su bandeja). No se reescriben: todo lo que esta spec no cambia sigue rigiendo como lo definen. La maqueta es la referencia de diseño; donde no tiene algo, esta spec lo define.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filtrar palancas y objetivos (Priority: P1)

Desde la vista de palancas y objetivos, la persona abre el panel "Filtros" y acota lo que ve por palanca, departamento, gerencia, estado y año, combinando los filtros con la búsqueda, en cualquiera de las solapas.

**Why this priority**: Hoy el botón Filtros no hace nada; con muchos objetivos cargados es la forma de llegar a lo que se busca.

**Independent Test**: Abrir el panel, elegir un departamento y un estado, aplicar y verificar que cada solapa muestra solo lo que cumple; limpiar y verificar que vuelve todo.

**Acceptance Scenarios**:

1. **Given** la vista de palancas y objetivos, **When** la persona usa el botón Filtros, **Then** se abre el panel lateral "Filtros" con Palanca, Departamento, Gerencia, Estado y Año, en ese orden, cada uno un desplegable de un solo valor; el primer valor de cada uno es "Todas" (Palanca, Departamento y Gerencia) o "Todos" (Estado y Año).
2. **Given** el panel abierto, **When** observa las opciones, **Then** Palanca lista las palancas activas, Departamento los departamentos del maestro, Gerencia las gerencias del maestro (solo las del departamento elegido, si hay uno), Estado los estados de objetivo de la 003 y Año los años con objetivos cargados.
3. **Given** filtros elegidos en el panel, **When** usa "Aplicar", **Then** el panel se cierra y la vista queda filtrada.
4. **Given** filtros aplicados, **When** usa "Limpiar", **Then** el panel se cierra y se quitan todos los filtros.
5. **Given** filtros elegidos sin aplicar, **When** cierra el panel con la X, **Then** lo elegido se descarta y los filtros aplicados antes no cambian.
6. **Given** la solapa "Todas las palancas" y un filtro de Palanca, **When** se aplica, **Then** se muestran solo las palancas elegidas.
7. **Given** la solapa "Todas las palancas" y un filtro de Departamento, Gerencia, Estado o Año, **When** se aplica, **Then** en cada palanca se muestran solo los objetivos que cumplen, y las palancas que quedan sin objetivos se ocultan.
8. **Given** la solapa "Objetivos de la VP RRII" o "Todos los objetivos", **When** se aplican filtros, **Then** la grilla muestra solo las filas que cumplen.
9. **Given** una búsqueda escrita y filtros aplicados, **When** se observa la vista, **Then** se cumplen ambos a la vez.
10. **Given** filtros y búsqueda aplicados, **When** la persona cambia de solapa, **Then** los filtros y la búsqueda siguen aplicados.
11. **Given** filtros y búsqueda que no dejan nada, **When** se observa la vista, **Then** se lee "No hay palancas ni objetivos con estos filtros." en una sola línea.
12. **Given** el filtro Año 2027 y un objetivo con inicio en 2026 y compromiso en 2028, **When** se aplica, **Then** el objetivo cumple (el año está entre ambos, incluidos); con un objetivo Permanente iniciado en 2026 cumple 2026, 2027 y los años siguientes, pero no 2025.

---

### User Story 2 - Ver todos los objetivos en una solapa (Priority: P1)

La persona ve en una sola grilla los objetivos de la VP RRII y los de otras VP.

**Why this priority**: Hoy hay que alternar entre "Objetivos de la VP RRII" y "Objetivos de otras VP" para buscar un objetivo cuya VP no se recuerda.

**Independent Test**: Con objetivos de la VP RRII y de otra VP cargados, abrir "Todos los objetivos" y verificar que aparecen todos, con "—" y "No aplica" donde corresponde.

**Acceptance Scenarios**:

1. **Given** la vista de palancas y objetivos, **When** se observan las solapas, **Then** hay una cuarta solapa "Todos los objetivos" después de "Objetivos de otras VP", con su cantidad entre paréntesis.
2. **Given** búsqueda o filtros aplicados, **When** se observa la cantidad de la solapa, **Then** es el total de objetivos, sin búsqueda ni filtros, como en las demás.
3. **Given** la solapa abierta, **When** se observa la grilla, **Then** las columnas son ID, Objetivo, VP, Palanca, Departamento, Gerencia, Peso, Avance, Estado y Ver, en ese orden, con el mismo encabezado, la columna Ver y los chips de estado de la solapa "Objetivos de la VP RRII".
4. **Given** un objetivo de la VP RRII, **When** se observa su fila, **Then** muestra su palanca, su peso en el departamento, su avance con su color y su estado.
5. **Given** un objetivo de otra VP, **When** se observa su fila, **Then** Palanca y Peso muestran "—" y Avance muestra "No aplica".
6. **Given** más de 10 objetivos, **When** se observa la grilla, **Then** se pagina de a 10, igual que en "Objetivos de la VP RRII" y "Objetivos de otras VP" (que pasan a paginar, FR-012).
7. **Given** ningún objetivo cargado, **When** se abre la solapa, **Then** se lee "No hay objetivos cargados.".
8. **Given** una fila, **When** la persona usa Ver, **Then** navega al detalle del objetivo.

---

### User Story 3 - Resumen de la vista sin el avance de la VP (Priority: P2)

La línea de resumen de arriba de las solapas deja de mostrar el avance de la VP.

**Why this priority**: Pedido de las usuarias; es un cambio de texto.

**Independent Test**: Abrir la vista y leer la línea: "N palancas activas · N objetivos".

**Acceptance Scenarios**:

1. **Given** la vista de palancas y objetivos, **When** se lee la línea de resumen, **Then** dice "N palancas activas · N objetivos", sin "Avance de la VP AAAA: X %".
2. **Given** las grillas, **When** se observan, **Then** los porcentajes de avance y sus colores no cambiaron.

---

### User Story 4 - Confirmar que la vista se actualizó (Priority: P2)

Al usar el botón Actualizar de la vista de palancas y objetivos o de la bandeja de iniciativas, la persona ve un mensaje que confirma que los datos se recargaron.

**Why this priority**: Hoy el botón recarga sin dar señal; la maqueta lo confirma con un mensaje.

**Independent Test**: Usar Actualizar con la red normal y ver el mensaje; repetirlo con la carga fallando y ver el error en su lugar.

**Acceptance Scenarios**:

1. **Given** una vista con el botón Actualizar, **When** la persona lo usa y la recarga termina bien, **Then** se muestra "La vista se ha actualizado correctamente." con el mismo componente de los demás mensajes de éxito.
2. **Given** una solapa, búsqueda, filtros y página, **When** se usa Actualizar, **Then** todos se mantienen.
3. **Given** que la recarga falla, **When** termina, **Then** no se muestra el mensaje de éxito y se muestra el mensaje de error de una línea que ya tiene la vista.

---

### User Story 5 - Confirmar antes de guardar palancas y objetivos (Priority: P2)

Antes de guardar una palanca o un objetivo, la persona confirma en un modal, igual que con las iniciativas.

**Why this priority**: Unifica el comportamiento de los tres formularios y evita guardados por error; los textos del objetivo vienen de la maqueta.

**Independent Test**: Completar un formulario válido, guardar, cancelar en el modal y verificar que no se guardó y que el formulario conserva lo cargado; repetir y aceptar.

**Acceptance Scenarios**:

1. **Given** el formulario de palanca con un campo obligatorio vacío, **When** intenta guardar, **Then** se muestran los errores en los campos y no se abre el modal.
2. **Given** el alta de una palanca válida, **When** usa Guardar, **Then** el modal "Nueva palanca" dice: Estás por agregar la palanca "[nombre]". ¿Querés continuar?
3. **Given** la edición de una palanca válida, **When** usa Guardar, **Then** el modal "Guardar cambios" dice: Estás por guardar los cambios de la palanca "[nombre]". ¿Querés continuar?
4. **Given** el alta de un objetivo válido, **When** usa Guardar, **Then** el modal "Cargar objetivo" dice: Estás por cargar el objetivo aprobado en el comité. Una vez guardado, sólo el Administrador podrá modificarlo. ¿Querés continuar?
5. **Given** la edición de un objetivo válido, **When** usa Guardar, **Then** el modal "Guardar cambios del objetivo" dice: Estás por modificar el objetivo. Todo cambio requiere el visto bueno del VP. ¿Querés continuar?
6. **Given** un modal abierto, **When** usa Aceptar, **Then** se guarda y se muestra el mensaje de éxito que ya existe.
7. **Given** un modal abierto, **When** usa Cancelar, **Then** el modal se cierra sin guardar y el formulario conserva lo ingresado.

---

### Edge Cases

- Todos los filtros de objetivo aplicados en "Todas las palancas" y ninguna palanca con objetivos que cumplan: se ve el estado sin resultados.
- Filtro Palanca sin filtros de objetivo: las palancas elegidas se muestran aunque no tengan objetivos.
- Una palanca inactiva con objetivos: no figura en el desplegable Palanca ni en "Todas las palancas" (RF-02); sus objetivos sí figuran en las otras solapas y se pueden filtrar por año, estado y departamento.
- Año: la lista incluye los años de las fechas de inicio y compromiso de los objetivos cargados; de un objetivo Permanente, solo el de su fecha de inicio y los posteriores hasta el último año de la lista. Sin objetivos con fechas, el desplegable queda solo con "Todos".
- Filtros que dejan de existir tras Actualizar (por ejemplo, una palanca inactivada): se mantienen aplicados; si dejan la vista vacía se ve el estado sin resultados.
- Un formulario abierto desde el detalle de la palanca o del objetivo usa el mismo modal de confirmación, porque el modal es del formulario, no de la pantalla.
- Falla al guardar tras Aceptar: se informa como hoy ("la operación no pudo completarse"), sin éxito falso, y el formulario conserva lo ingresado.
- Doble clic en Aceptar: se guarda una sola vez (Aceptar se deshabilita mientras guarda, como en iniciativas).

## Clarifications

### Session 2026-11-20

Resueltas por la usuaria:

- Q: ¿El panel incluye "Responsable" (maqueta)? → A: No: el objetivo no tiene persona responsable. En su lugar va **Gerencia**, antes de Estado (FR-002), como filtro de objetivo.
- Q: En "Todos los objetivos", ¿qué pasa con los objetivos de otras VP al filtrar por Palanca o por Año? → A: Se excluyen, porque no tienen esos datos. Departamento, Gerencia y Estado sí los filtran (FR-009). Cambia lo propuesto antes.
- Q: ¿Columnas de "Todos los objetivos"? → A: Confirmadas: ID, Objetivo, VP, Palanca, Departamento, Gerencia, Peso, Avance, Estado y Ver (FR-014).
- Q: ¿Qué grillas de objetivos se paginan (hoy "Objetivos de la VP RRII" no pagina)? → A: Las tres, con el paginador de iniciativas (FR-012).
- Q: ¿Texto del botón de limpiar? → A: "Limpiar" en los dos paneles, como la maqueta; se cambia también la bandeja de iniciativas (FR-003).
- Q: ¿Gerencia filtrada por el departamento elegido? → A: Sí (FR-002).
- Q: ¿Se agrega Actualizar a otras pantallas? → A: Sí, a la bandeja de iniciativas, como en la maqueta, con el mismo mensaje (FR-018). Cambia lo respondido antes (solo palancas y objetivos).
- Revisión del avance en otros textos (pedido de US3): se buscó "avance de la VP" en el código y en los textos; el avance aparece solo en la línea de resumen (cadena `PalancasSummary`, con año y porcentaje). No hay otra leyenda ni texto con el avance en esa vista. Se resuelve sin decisión adicional.
- Estados (pedido: "los estados del objetivo implementados en la 003"): son cuatro: No iniciada, En curso, Finalizado cumplido y Finalizado incumplido. RF-03 del documento funcional v1.9 dice tres; se alinea en la actualización del documento (ver Documentación).

## Requirements *(mandatory)*

### Functional Requirements

**Panel de filtros**

- **FR-001**: El botón Filtros de la vista de palancas y objetivos DEBE abrir el panel lateral "Filtros", reutilizando el panel y el patrón de la bandeja de iniciativas (feature 004: desplegables de un valor, borrador que se aplica con el botón, X que descarta). NO DEBE crearse otro panel; si el componente actual de la bandeja es específico de iniciativas, se generaliza o se reutiliza su base sin duplicarlo ni tocar `src/core/ui`.
- **FR-002**: Los campos DEBEN ser, en este orden: Palanca ("Todas" más las palancas activas), Departamento ("Todas" más los departamentos del maestro), Gerencia ("Todas" más las gerencias del maestro; si hay un departamento elegido en el panel, solo las de ese departamento), Estado ("Todos" más los estados del objetivo) y Año ("Todos" más los años con objetivos cargados). Gerencia ocupa el lugar del "Responsable" de la maqueta, que no se incluye porque el objetivo no tiene persona responsable (ver Clarifications).
- **FR-003**: Al pie DEBEN estar "Limpiar" (quita todos los filtros). La bandeja de iniciativas (feature 004) también pasa de "Limpiar filtros" a "Limpiar", para que los dos paneles digan lo mismo, como la maqueta y "Aplicar" (los aplica); ambos cierran el panel. Cerrar con la X NO DEBE aplicar ni cambiar los filtros ya aplicados.
- **FR-004**: Los filtros DEBEN combinarse con la búsqueda (ambos se cumplen a la vez) y aplicarse sobre la solapa elegida.
- **FR-005**: En "Todas las palancas", Palanca DEBE limitar qué palancas se muestran; Departamento, Gerencia, Estado y Año DEBEN limitar los objetivos de cada palanca. Con algún filtro de objetivo (Departamento, Gerencia, Estado o Año) aplicado, las palancas que quedan sin objetivos DEBEN ocultarse.
- **FR-006**: En "Objetivos de la VP RRII", "Objetivos de otras VP" y "Todos los objetivos", los filtros DEBEN limitar las filas de la grilla. En "Objetivos de la VP RRII" y "Objetivos de otras VP" se aplican a las filas que ya muestran (Palanca y Año excluyen a los objetivos de otras VP, como en FR-009: en "Objetivos de otras VP" quedan vacías con alguno de los dos elegido).
- **FR-007**: Año: un objetivo DEBE cumplir el filtro si el año elegido está entre el año de su fecha de inicio y el de su fecha de compromiso, incluidos ambos (el criterio del filtro Año de la bandeja de iniciativas). Un objetivo Permanente DEBE cumplirlo desde el año de su fecha de inicio en adelante.
- **FR-008**: Sin resultados, DEBE leerse "No hay palancas ni objetivos con estos filtros." en una sola línea, sin segunda línea. En las grillas se usan los estados vacíos de cada solapa si no hay filtros ni búsqueda, y ese mismo texto si los hay.
- **FR-009**: Un objetivo de otra VP no tiene palanca ni fechas: con un filtro de Palanca o de Año elegido, DEBE excluirse (en "Todos los objetivos" y en "Objetivos de otras VP"). Departamento, Gerencia y Estado sí lo filtran (ver Clarifications).
- **FR-010**: Al cambiar de solapa, los filtros y la búsqueda DEBEN mantenerse aplicados.

**Solapa "Todos los objetivos"**

- **FR-011**: DEBE agregarse la solapa "Todos los objetivos" después de "Objetivos de otras VP", con su cantidad entre paréntesis. La cantidad es el total de objetivos, sin búsqueda ni filtros, como en las demás solapas.
- **FR-012**: La grilla DEBE seguir el diseño de la grilla de "Objetivos de la VP RRII": mismo encabezado, columna Ver, chips de estado y estados vacíos; y paginado de 10. Las tres grillas de objetivos ("Objetivos de la VP RRII", "Objetivos de otras VP" y "Todos los objetivos") DEBEN paginar de a 10, reutilizando el paginador de la bandeja de iniciativas. Al aplicar filtros, buscar o cambiar de solapa se vuelve a la página 1. Se reutiliza `ObjetivosTable` con una variante nueva; no se duplica.
- **FR-013**: Sin objetivos cargados DEBE leerse "No hay objetivos cargados.". Con búsqueda o filtros sin resultados, el texto de FR-008.
- **FR-014**: Las columnas DEBEN ser, en este orden: ID, Objetivo, VP, Palanca, Departamento, Gerencia, Peso, Avance, Estado y Ver. Peso es el peso en el departamento; Avance se muestra como en las otras grillas, con su color. Para un objetivo de otra VP: Peso "—", Palanca "—" y Avance "No aplica".
- **FR-015**: Ver DEBE navegar al detalle del objetivo. No se crean rutas nuevas.

**Resumen y Actualizar**

- **FR-016**: La línea de resumen DEBE decir "N palancas activas · N objetivos". NO DEBE mostrar el avance de la VP ni el año. Los porcentajes y colores de avance de las grillas NO cambian. "N objetivos" sigue contando todos los objetivos, como hoy.
- **FR-017**: Al usar el botón Actualizar DEBEN recargarse los datos de la vista y, si todas las cargas terminan bien, mostrarse "La vista se ha actualizado correctamente." con `SuccessNotice` (el componente de los mensajes de éxito existentes). Se mantienen la solapa, la búsqueda, los filtros y la página. Si alguna carga falla, NO DEBE mostrarse el mensaje de éxito y DEBE mostrarse el mensaje de error de una línea que ya tiene la vista.
- **FR-018**: Vistas con botón Actualizar hoy (revisado en el código): únicamente **la vista de palancas y objetivos** ([PalancasHeader.tsx](../../src/webparts/objetivosVp/components/Palanca/Palancas/PalancasHeader/PalancasHeader.tsx), botón con tooltip "Actualizar"). La maqueta lo muestra además en tareas e iniciativas. Esta feature lo **agrega a la bandeja de iniciativas** (`IniciativasHeader`, antes de Filtros, con el mismo ícono, estilo y tooltip), como en la maqueta; ahí recarga iniciativas, objetivos, departamentos y resultados clave, y mantiene la vista (Mis iniciativas / Todas), la búsqueda, los filtros y la página. Su error es "No se pudieron cargar las iniciativas.". Quedan sin el botón los detalles de palanca, objetivo e iniciativa, y tareas, que no está implementada.

**Confirmación al guardar**

- **FR-019**: Antes de guardar una palanca o un objetivo, DEBE mostrarse `ConfirmacionModal` (el de iniciativas, feature 004), con Cancelar y Aceptar. La validación de campos DEBE ocurrir antes del modal: con errores no se abre.
- **FR-020**: Textos de palanca: al crear, título "Nueva palanca" y texto `Estás por agregar la palanca "[nombre]". ¿Querés continuar?`; al editar, título "Guardar cambios" y texto `Estás por guardar los cambios de la palanca "[nombre]". ¿Querés continuar?`. La maqueta no tiene confirmación de palanca: sigue el patrón de iniciativas.
- **FR-021**: Textos de objetivo (de la maqueta): al crear, título "Cargar objetivo" y texto "Estás por cargar el objetivo aprobado en el comité. Una vez guardado, sólo el Administrador podrá modificarlo. ¿Querés continuar?"; al editar, título "Guardar cambios del objetivo" y texto "Estás por modificar el objetivo. Todo cambio requiere el visto bueno del VP. ¿Querés continuar?".
- **FR-022**: Aceptar DEBE guardar y mostrar el mensaje de éxito que ya existe. Cancelar DEBE cerrar el modal sin guardar y el formulario DEBE conservar lo ingresado.
- **FR-023**: El modal DEBE vivir en cada formulario (`PalancaForm`, `ObjetivoForm`), de modo que aplique a todas las entradas: alta de palanca y edición desde la vista de palancas y desde el detalle de la palanca; alta de objetivo desde la vista de palancas y desde el detalle de la palanca; edición desde el detalle del objetivo.

**Lo que se mantiene**

- **FR-024**: Roles: todavía no se implementan. Los mensajes de error y los estados vacíos son de una sola línea, sin textos de ayuda. No se modifica `src/core/ui`: los componentes compartidos (panel de filtros, modal de confirmación, grilla y mensajes) se reutilizan y no se duplican. No se crean rutas para pantallas que no estén implementadas.

### Key Entities

Sin cambios en el modelo de datos ni en las listas de SharePoint. Los filtros y la solapa leen los datos que ya cargan Palanca, Objetivo (VP, palanca, departamento, gerencia, peso, estado, fechas y duración), Departamento, Iniciativa y Resultado clave (para el avance).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con cualquier combinación de filtros y búsqueda, el 100 % de lo que se muestra cumple todas las condiciones, y el 100 % de lo que las cumple se muestra.
- **SC-002**: La persona llega a un objetivo conocido (por departamento y estado) en menos de 30 segundos desde que abre el panel de Filtros.
- **SC-003**: El total de "Todos los objetivos" es igual a la cantidad de objetivos cargados; ninguno queda sin listar en esa solapa.
- **SC-004**: El 100 % de los usos de Actualizar con carga exitosa muestran el mensaje, y el 0 % de los que fallan lo muestran.
- **SC-005**: El 100 % de los guardados de palanca y objetivo pasan por el modal de confirmación, y el 0 % de los que se cancelan modifican datos.
- **SC-006**: La línea de resumen no muestra el avance de la VP en ningún estado de la vista.

## Assumptions

- **Filtros como la búsqueda**: los filtros se mantienen mientras se está en la vista (incluido el cambio de solapa); como la búsqueda de hoy, no sobreviven a navegar a un detalle y volver. Si se quiere que sobrevivan (como en la bandeja de iniciativas), se indica en el clarify.
- **Paginado**: en "Todas las palancas" no se agrega (la maqueta no lo tiene).
- **Lista de años**: de los años de inicio y compromiso de los objetivos cargados, de menor a mayor y sin huecos, como en la bandeja de iniciativas; los de otras VP no aportan años.
- **Orden de los desplegables**: Palanca, Departamento y Gerencia por nombre; Estado en el orden del catálogo; Año ascendente.
- **Mensaje de Actualizar**: el texto es nuevo y se agrega a los textos de la web part junto a los demás mensajes de éxito.
- **Documentación**: `docs/especificacion-funcional.md` ya está en v1.10 con estos cambios (commit `5980331`); el detalle de lo aplicado está en [cambios-especificacion-funcional.md](./cambios-especificacion-funcional.md).
- **Fuera de alcance**: roles y permisos (RF-19), y cualquier cambio al avance, a los pesos o al modelo de datos.
