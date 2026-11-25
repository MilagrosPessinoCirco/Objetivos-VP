# Feature Specification: Ubicación en la estrategia

**Feature Branch**: `009-ubicacion-en-la-estrategia`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "Botón 'Ubicación en la estrategia' en el header de los detalles de Palanca, Objetivo, Iniciativa y Tarea, que abre un panel lateral de solo lectura con el recorrido Palanca → Objetivo → Iniciativas → Tareas de la entidad actual, con links a cada detalle. Cada nivel muestra hasta 3 ítems y 'y N más', que despliega el resto." (ver Clarifications)

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`. Botón `.ubiBtn` en los headers de palanca (línea 653), objetivo (758), iniciativa (818) y tarea (898). Drawer `aside.drawer.side` (líneas 1188–1206), estilos `.ubi*` (503–512) y lógica del recorrido (2264–2282). `LEEME.md`, líneas 116, 122, 137 y 151.

**Modifica**: revierte la exclusión del botón "Ubicación en la estrategia" que hicieron las specs anteriores:

- `specs/002-palancas-estrategicas/spec.md` FR-020;
- `specs/003-objetivos/spec.md` FR-030;
- `specs/004-iniciativas/spec.md` FR-034;
- `specs/005-objetivos-pesos/spec.md` FR-017 (las migas se mantienen además del botón);
- `specs/007-tareas/spec.md` US3, escenario 14, y `checklists/calidad-requisitos.md` CHK033.

También cambia el botón Volver (y el botón Cancelar del pie) de `PalancaDetalle` y `ObjetivoDetalle`, para que el escenario 9 se cumpla también al llegar a esas vistas desde el panel: ahora vuelven a la vista de origen guardada en `from` del estado de navegación y, si no hay `from`, a la lista de palancas, como ya hacen Iniciativa y Tarea (004 FR-031, 007 FR-037). Hasta ahora siempre volvían a la lista de palancas (002 FR-006, 003 FR-027).

El resto del header no cambia. Volver, título "ID · Nombre", chip de estado, "Avance: X %" y migas siguen como los definen 002 FR-006, 003 FR-027, 004 FR-031, 006 FR-032/FR-034/FR-036 y 007 FR-037. No se reescriben esas specs.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el recorrido estratégico de una entidad (Priority: P1)

Desde el detalle de una palanca, objetivo, iniciativa o tarea, la persona abre "Ubicación en la estrategia". Ve en un panel lateral dónde se ubica esa entidad dentro de la estrategia y puede ir al detalle de cualquier elemento del recorrido.

**Why this priority**: Es la feature completa. Las migas solo muestran los niveles superiores; el panel muestra también lo que cuelga de la entidad.

**Independent Test**: Abrir el panel en cada una de las cuatro vistas, verificar los cuatro niveles y su contenido, y navegar desde un link.

**Acceptance Scenarios**:

1. **Given** el detalle de una palanca, objetivo, iniciativa o tarea, con cualquier rol, **When** se observa el header, **Then** aparece el botón violeta "Ubicación en la estrategia" con un ícono de doble chevron hacia abajo, alineado a la derecha y a la derecha de "Avance: X %" donde ese texto exista.
2. **Given** el botón, **When** la persona lo usa, **Then** se abre un panel lateral desde la derecha con el título "Ubicación en la estrategia" y el subtítulo "{ID} · recorrido desde la palanca hasta las tareas", donde {ID} es el de la entidad actual (ej. "TAR-01").
3. **Given** el panel abierto, **When** se observa el cuerpo, **Then** hay cuatro niveles unidos por una línea vertical, en este orden: "Palanca estratégica (n)", "Objetivo (n)", "Iniciativas (n)" y "Tareas (n)". Cada nivel lista sus ítems como "{ID} · {Nombre}".
4. **Given** el detalle de una tarea, **When** se abre el panel, **Then** se muestran su palanca, su objetivo, su iniciativa y la tarea misma, con "Tareas (1)". No se muestran las tareas hermanas.
5. **Given** el detalle de una iniciativa, **When** se abre el panel, **Then** se muestran su palanca, su objetivo, la iniciativa misma y todas sus tareas.
6. **Given** el detalle de un objetivo, **When** se abre el panel, **Then** se muestran su palanca, el objetivo mismo, todas sus iniciativas y todas las tareas de esas iniciativas.
7. **Given** el detalle de una palanca, **When** se abre el panel, **Then** se muestran la palanca misma, los objetivos que lista el detalle de la palanca con el filtro de vista activo, todas las iniciativas de esos objetivos y todas las tareas de esas iniciativas.
8. **Given** el panel abierto, **When** se observa el nivel de la entidad actual, **Then** su nodo es hueco con borde oscuro y su ítem está en negrita, color oscuro y sin link. El resto de los nodos son rellenos celeste y sus ítems son links azules.
9. **Given** un link del panel, **When** la persona lo usa, **Then** el panel se cierra y se abre el detalle de ese elemento, con su propio botón "Ubicación en la estrategia". Volver regresa a la vista de origen.
10. **Given** un nivel con más de 3 ítems, **When** se abre el panel, **Then** se muestran los 3 primeros y debajo "y N más" como acción.
11. **Given** "y N más", **When** la persona lo usa, **Then** se despliegan los ítems restantes de ese nivel y la acción pasa a "Ver menos", que vuelve a mostrar 3. Cada nivel se expande por separado.
12. **Given** niveles expandidos, **When** se cierra y se vuelve a abrir el panel, **Then** todos los niveles aparecen colapsados.
13. **Given** el panel abierto, **When** la persona usa la X, el botón "Cerrar" del pie, Esc o hace clic fuera del panel, **Then** el panel se cierra.
14. **Given** un recorrido largo, **When** se desplaza el contenido, **Then** el cuerpo del panel scrollea y el pie con "Cerrar" queda fijo.

---

### Edge Cases

- **Objetivo de otra VP** (la palanca solo aplica a la VP RRII): en las vistas de ese objetivo y de sus iniciativas y tareas, el primer nivel se titula "Otra VP" y muestra el nombre de la VP como texto, sin link (FR-006).
- **Nivel sin ítems** (iniciativa sin tareas, objetivo sin iniciativas, palanca sin objetivos): se muestra el nivel con "(0)" y el texto "Sin elementos cargados".
- **Estados**: las tareas canceladas y las iniciativas finalizadas se incluyen. El recorrido no filtra por estado.
- **Carga**: mientras se obtienen los datos, el panel muestra un indicador de carga en el cuerpo.
- **Error**: si la carga falla, el panel muestra un mensaje de error de una línea con la acción "Reintentar".
- **Reapertura**: cerrar y volver a abrir el panel en la misma vista no vuelve a consultar los datos.

## Clarifications

### Session 2026-11-25

- Q: ¿Cómo se ve el primer nivel para un objetivo de otra VP? → A: Como el prototipo: nivel "Otra VP" con el nombre de la VP, sin link.
- Q: ¿Qué objetivos entran en el recorrido de una palanca? → A: Los mismos que lista el detalle de la palanca, con el filtro de vista activo.
- Q: ¿Se incluyen tareas canceladas e iniciativas finalizadas? → A: Sí, se incluye todo; el recorrido no filtra por estado.
- Q: ¿El label del segundo nivel se pluraliza cuando hay varios objetivos (vista Palanca)? → A: No, queda "Objetivo (n)".
- Q: ¿Se registra el cambio en `docs/especificacion-funcional.md`? → A: No; se declara en "Modifica".
- Q: El "y N más" del prototipo es texto estático. ¿Qué hace? → A: Es una acción que despliega inline el resto del nivel y pasa a "Ver menos" (cambio pedido respecto de la maqueta).

## Requirements *(mandatory)*

### Functional Requirements

**Botón**

- **FR-001**: Los detalles de Palanca, Objetivo, Iniciativa y Tarea DEBEN mostrar el botón "Ubicación en la estrategia" en el header, alineado a la derecha y a la derecha de "Avance: X %" cuando ese texto se muestre.
- **FR-002**: El botón DEBE ser primario violeta, con un ícono de doble chevron hacia abajo a la izquierda del texto (maqueta `.ubiBtn`).
- **FR-003**: El botón DEBE estar visible para todos los roles. La feature es de solo lectura.

**Panel**

- **FR-004**: El botón DEBE abrir un panel lateral desde la derecha, sobre la vista, con el título "Ubicación en la estrategia" y el subtítulo "{ID} · recorrido desde la palanca hasta las tareas".
- **FR-005**: El panel DEBE cerrarse con la X, con el botón "Cerrar" del pie, con Esc y con un clic fuera del panel. El pie DEBE quedar fijo y el cuerpo DEBE scrollear.
- **FR-006**: El panel DEBE mostrar cuatro niveles en este orden, unidos por una línea vertical: "Palanca estratégica (n)" (o "Otra VP" con el nombre de la VP cuando el objetivo no es de la VP RRII), "Objetivo (n)", "Iniciativas (n)" y "Tareas (n)".
- **FR-007**: Cada ítem DEBE mostrarse como "{ID} · {Nombre}", con los mismos ID que el resto de la aplicación (PAL-, OBJ-, INI-, TAR-).
- **FR-008**: El contenido de cada vista DEBE ser el linaje de la entidad actual, como se describe en los escenarios 4 a 7.
- **FR-009**: El nivel de la entidad actual DEBE mostrarse con nodo hueco de borde oscuro y su ítem en negrita, color oscuro y sin link. Los demás nodos DEBEN ser rellenos celeste y sus ítems, links que cierran el panel y abren el detalle correspondiente.
- **FR-010**: Cada nivel DEBE mostrar como máximo 3 ítems. Si hay más, DEBE mostrar debajo la acción "y N más", que despliega el resto y cambia a "Ver menos" para volver a colapsar. El estado expandido DEBE ser independiente por nivel y reiniciarse al cerrar el panel.
- **FR-011**: Un nivel sin ítems DEBE mostrar "(0)" y el texto "Sin elementos cargados".
- **FR-012**: El panel DEBE mostrar un indicador de carga mientras obtiene los datos y, si la carga falla, un mensaje de error de una línea con la acción "Reintentar".

**Datos**

- **FR-013**: Los datos del recorrido DEBEN obtenerse recién al abrir el panel por primera vez y conservarse mientras la vista esté abierta. Reabrir el panel NO DEBE volver a consultarlos.
- **FR-014**: Obtener los hijos de una palanca o de un objetivo NO DEBE requerir una consulta por cada ítem.

**Accesibilidad**

- **FR-015**: El panel DEBE ser un diálogo con el foco atrapado mientras está abierto. Los links DEBEN tener texto descriptivo ("{ID} · {Nombre}"). "y N más" / "Ver menos" DEBE ser un control accesible por teclado que informe si el nivel está expandido.

### Key Entities

Sin cambios en el modelo de datos. Se leen Palanca, Objetivo, Iniciativa y Tarea con sus relaciones existentes (Objetivo → Palanca, Iniciativa → Objetivo, Tarea → Iniciativa).

## Success Criteria *(mandatory)*

- **SC-001**: Desde cualquiera de las cuatro vistas de detalle, la persona llega al detalle de cualquier elemento de su recorrido con dos clics (botón y link).
- **SC-002**: El panel muestra su contenido en menos de 3 s (RNF-05) y la reapertura en la misma vista es inmediata.
- **SC-003**: La cantidad de consultas para armar el recorrido no crece con la cantidad de objetivos, iniciativas o tareas, salvo por lotes acotados.

## Assumptions

- Las relaciones Objetivo → Palanca, Iniciativa → Objetivo y Tarea → Iniciativa son las mismas que usan las migas.
- **Documentación**: `docs/especificacion-funcional.md` no se modifica. Este cambio se declara en "Modifica".
- **Fuera de alcance**: edición desde el panel, filtros por estado y el recorrido completo del árbol (solo se muestra el linaje de la entidad actual).
