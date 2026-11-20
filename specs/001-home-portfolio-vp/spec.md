# Feature Specification: Home de Gestión de Portfolio VP

**Feature Branch**: `001-home-portfolio-vp`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Home de Gestión de Portfolio VP: solo el diseño visual de la pantalla de entrada, sin navegación ni lógica. Diseño de referencia: docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html, pantalla Home."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver la pantalla de entrada con su bienvenida y sus accesos (Priority: P1)

Una persona que ingresa a la aplicación Gestión de Portfolio VP ve la pantalla de entrada tal como está diseñada: a la izquierda, una tarjeta de bienvenida con el título "Gestión de Objetivos VP RRII", el texto "Te damos la bienvenida a la app donde la VP RRII baja su estrategia a iniciativas, resultados clave y tareas" y una ilustración; a la derecha, cinco accesos apilados, cada uno con su título, ícono y color, en este orden: "Mis tareas", "Mis iniciativas", "Palancas y objetivos", "Tablero VP" y "ABM".

**Why this priority**: Es la pantalla de entrada de la aplicación y el núcleo de esta feature. Sin ella no hay nada que mostrar; con ella sola ya se obtiene una pantalla reconocible y fiel al diseño aprobado.

**Independent Test**: Abrir la pantalla y compararla lado a lado con `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (pantalla Home): deben coincidir los textos, el orden de los accesos, los íconos, los colores y la disposición en dos columnas.

**Acceptance Scenarios**:

1. **Given** la pantalla de entrada abierta, **When** la persona la observa, **Then** ve a la izquierda la tarjeta de bienvenida con el título, el texto de bienvenida y la ilustración, y a la derecha cinco accesos apilados verticalmente.
2. **Given** la pantalla de entrada abierta, **When** la persona lee los accesos de arriba hacia abajo, **Then** los títulos aparecen en este orden: "Mis tareas", "Mis iniciativas", "Palancas y objetivos", "Tablero VP", "ABM".
3. **Given** la pantalla de entrada abierta, **When** la persona observa cada acceso, **Then** cada uno muestra su título a la izquierda, su ícono a la derecha y su color de fondo propio, distinto del de los demás, según el diseño.
4. **Given** cualquier persona que abre la pantalla, **When** se renderiza, **Then** los cinco accesos se muestran siempre, sin variar según rol ni datos.

---

### User Story 2 - Ver la marca y el acceso al manual de usuario (Priority: P2)

Debajo de la tarjeta de bienvenida, la persona ve la marca "by Plataformas 365 | IngSoft" a la izquierda y un acceso "Manual de usuario" con su ícono a la derecha, alineado con el borde derecho de la tarjeta.

**Why this priority**: Completa la fidelidad con el diseño, pero la pantalla ya es útil como bienvenida y como índice de accesos sin estos elementos.

**Independent Test**: Abrir la pantalla y verificar, debajo de la tarjeta, la marca y el acceso "Manual de usuario" con su ícono, en la posición del diseño.

**Acceptance Scenarios**:

1. **Given** la pantalla de entrada abierta, **When** la persona mira debajo de la tarjeta de bienvenida, **Then** ve la marca "by Plataformas 365 | IngSoft" y el acceso "Manual de usuario" con su ícono.

---

### User Story 3 - Reconocer los accesos como elementos clickeables (Priority: P3)

Los cinco accesos y el "Manual de usuario" se ven y se comportan visualmente como elementos clickeables (por ejemplo, el cursor cambia al pasar sobre ellos y se pueden alcanzar con el teclado), pero al activarlos no ocurre ninguna navegación ni acción.

**Why this priority**: Prepara la pantalla para la navegación futura sin implementarla. No agrega valor por sí sola, por eso es la de menor prioridad.

**Independent Test**: Pasar el cursor sobre cada acceso y sobre el "Manual de usuario", y activarlos con el mouse y con el teclado: se perciben como interactivos y no cambian de pantalla ni abren nada.

**Acceptance Scenarios**:

1. **Given** la pantalla de entrada abierta, **When** la persona pasa el cursor sobre un acceso o sobre el "Manual de usuario", **Then** el elemento se percibe como clickeable.
2. **Given** la pantalla de entrada abierta, **When** la persona hace clic en cualquiera de los cinco accesos o en el "Manual de usuario", **Then** no se navega a ninguna otra pantalla, no se abre ninguna pestaña y la pantalla permanece sin cambios.
3. **Given** la pantalla de entrada abierta, **When** la persona recorre los elementos clickeables con el teclado y los activa, **Then** se comportan igual que con el mouse: sin navegación.

---

### Edge Cases

- Los textos del diseño son fijos: no hay datos variables que puedan quedar vacíos, ser muy largos o fallar al cargar.
- Las pantallas angostas (por ejemplo, móviles) quedan fuera de alcance: no se define cómo se ve la home por debajo del ancho del diseño.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pantalla DEBE mostrar una tarjeta de bienvenida con el título "Gestión de Objetivos VP RRII".
- **FR-002**: La tarjeta de bienvenida DEBE mostrar el texto "Te damos la bienvenida a la app donde la VP RRII baja su estrategia a iniciativas, resultados clave y tareas".
- **FR-003**: La tarjeta de bienvenida DEBE incluir la ilustración del diseño (dos personas dándose la mano frente a un globo terráqueo con engranajes).
- **FR-004**: Debajo de la tarjeta, la pantalla DEBE mostrar la marca "by Plataformas 365 | IngSoft".
- **FR-005**: Debajo de la tarjeta, la pantalla DEBE mostrar un acceso "Manual de usuario" con su ícono.
- **FR-006**: La pantalla DEBE mostrar cinco accesos apilados verticalmente, en este orden: "Mis tareas", "Mis iniciativas", "Palancas y objetivos", "Tablero VP" y "ABM".
- **FR-007**: Cada acceso DEBE mostrar su título, su ícono y un color de fondo propio, distinto del de los demás, según el diseño de referencia. Los colores e íconos se resuelven con el Design System según las aproximaciones aprobadas en el plan.
- **FR-008**: La pantalla DEBE organizarse en dos columnas: la tarjeta de bienvenida (con la marca y el "Manual de usuario" debajo) a la izquierda y los cinco accesos a la derecha.
- **FR-009**: Los cinco accesos y el "Manual de usuario" DEBEN verse y poder enfocarse como elementos clickeables.
- **FR-010**: Activar un acceso o el "Manual de usuario", con mouse o teclado, NO DEBE navegar, abrir ni ejecutar nada.
- **FR-011**: Los cinco accesos DEBEN mostrarse siempre, sin depender del rol de la persona ni de datos.
- **FR-012**: Todos los textos visibles DEBEN estar en español (Argentina) y coincidir literalmente con los del diseño.
- **FR-013**: La pantalla NO DEBE reproducir los elementos de la barra superior del sitio del prototipo.
- **FR-014**: La pantalla NO DEBE incluir elementos, disposiciones ni pantallas que no figuren en el diseño de referencia.

### Key Entities

No aplica: la pantalla no maneja datos ni entidades.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los textos del diseño (título, texto de bienvenida, marca, "Manual de usuario" y los cinco títulos de accesos) aparecen idénticos al prototipo de referencia.
- **SC-002**: Los cinco accesos aparecen siempre, en el orden del diseño, para el 100 % de las personas que abren la pantalla.
- **SC-003**: En una comparación visual lado a lado con el prototipo de referencia, a un mismo ancho de escritorio, una persona revisora no encuentra diferencias de disposición, orden ni textos. Los colores, íconos y el estilo del "Manual de usuario" corresponden a las aproximaciones aprobadas en el plan.
- **SC-004**: El 100 % de las activaciones (clic o teclado) sobre los cinco accesos y el "Manual de usuario" dejan la pantalla sin cambios y sin navegación.


## Assumptions

- El diseño de referencia es `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (pantalla Home).
- El prototipo es la única fuente de los íconos, los colores y la ilustración; la resolución de esos elementos con los recursos del Design System de YPF (constitución, principio II) se define en el plan.
- Colores de los accesos, según el prototipo: "Mis tareas" azul marino, "Mis iniciativas" violeta oscuro, "Palancas y objetivos" violeta claro, "Tablero VP" azul acero y "ABM" azul petróleo. Íconos: tarea con tilde, cuadrícula de cuatro módulos, diana, gráfico de barras y persona con signo más; el "Manual de usuario" lleva un ícono de persona dentro de un recuadro.
- Los colores de los accesos (paleta del Design System), los tamaños tipográficos y espaciados (los tokens más cercanos del Design System), el alto de la tarjeta (determinado por su contenido), los íconos (provisorios, blancos por filtro) y el "Manual de usuario" (`Button` secondary) son aproximaciones aprobadas respecto del prototipo.
- En el prototipo, "ABM" solo se muestra al rol Administrador (el rol por defecto, con el que se ven los cinco accesos). Esta feature lo muestra siempre porque los roles están fuera de alcance: desvío aprobado.
- El efecto hover del prototipo (desplazamiento y sombra de los accesos) no se reproduce: los accesos no navegan y el fondo no cambia al pasar el cursor.
- La pantalla se diseña para ancho de escritorio, como el prototipo.
- Fuera de alcance: navegación, permisos por rol, datos y adaptación a pantallas angostas.
