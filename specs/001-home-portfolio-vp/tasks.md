---

description: "Tareas de implementación de la Home de Gestión de Portfolio VP"
---

# Tasks: Home de Gestión de Portfolio VP

**Input**: `specs/001-home-portfolio-vp/` (`spec.md`, `plan.md`, `research.md`, `quickstart.md`)

**Prerequisites**: `plan.md` (sin consultas abiertas), `spec.md`, el prototipo `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (pantalla Home, `<section class="home">`), `docs/design-system-catalog.md`

**Tests**: no se solicitan. El repo no declara un runner de pruebas; la validación es `npm run build` y la comparación visual con la pantalla Home del prototipo.

**Organization**: tareas agrupadas por historia de usuario. Cada tarea indica el archivo exacto, los componentes del Design System (DS) que usa, su **Referencia** en el prototipo (archivo `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` y clases CSS / sección) y su criterio de terminado.

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: historia de `spec.md` a la que pertenece (US1, US2, US3).

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores (incluye lint y tipos). Es parte del criterio de terminado de cada tarea.
- **Referencia al prototipo (constitución II)**: la interfaz se construye a partir de la pantalla Home del prototipo. Las clases CSS citadas en cada **Referencia** están en el bloque `<style>` de `index.html` y su markup en `<section class="home">`. Solo se reproducen elementos que figuren ahí (FR-014).
- **`src/core/ui` es de solo lectura**: no se modifica nada del DS.
- **Imports del DS por capa, nunca el índice completo de `core` ni de `core/ui`**:
  - `…/core/ui/patterns` (`Surface`), `…/core/ui/components` (`Button`), `…/core/ui/foundations` (`BrandLogo`, `FigmaIcon`, `colorScales`, `colors`, `spacing`, `typography`).
  - Desde `Home/Home.tsx`: `../../../../core/ui/<capa>`. Desde `Home/<Pieza>/<Archivo>.tsx`: `../../../../../core/ui/<capa>`.
- **Colores, tipografías y espaciados solo desde tokens**: valores de `colors`, `colorScales`, `spacing` y `typography` (constantes TypeScript) aplicados con la prop `style` o `styles` del componente. Los `.module.scss` contienen solo estructura (display, flex/grid, proporciones, `cursor`, `filter`, `mix-blend-mode`, anchos relativos). **Prohibido escribir colores hexadecimales o valores en px de espaciado/tipografía en código nuevo.** No fijar alturas en px: la altura sale del padding y del `lineHeight`.
- **Tokens más cercanos del prototipo (plan, Q7)**: el CSS del prototipo usa valores sin token. Se usan los más cercanos del DS: título 40 px → `typography.size[42]`; texto 26 px → `typography.size[28]` (regular, el DS no tiene peso 300); texto de los accesos 31 px → `typography.size[32]` (bold); separación entre columnas 42 px → `spacing.xxxl`; separación entre accesos 16 px → `spacing.lg`; radio de los accesos 16 px → `spacing.lg`; padding de los accesos → `spacing.xl`. Única excepción: el radio de la tarjeta (18 px) va como constante local.
- **Textos**: siempre desde `import * as strings from 'ObjetivosVpWebPartStrings';` (claves creadas en T002). Ningún texto visible escrito en el código.
- **TypeScript estricto, sin `any`, sin comentarios de código, sin literales mágicos**: los números sueltos van a constantes locales con nombre al inicio del archivo.
- **Sin navegación ni hover del prototipo**: ningún componente de la Home recibe ni define `onClick`, `href`, `window.open`, `Utils.*` ni router (FR-010). No se reproducen los `onClick` del prototipo (`go.*`) ni su efecto hover (`translateY` y sombra).
- **ABM siempre visible (plan, Q8)**: el prototipo lo muestra solo al rol Administrador (`isAdm`); aquí se muestra siempre (FR-011), sin condiciones por rol.
- **No editar** archivos `*.module.scss.ts` (artefactos de compilación, ignorados por git).
- **No modificar** `spec.md` ni `plan.md`. Si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo.

## Path Conventions

Raíz del webpart: `src/webparts/objetivosVp/`. Pantalla: `src/webparts/objetivosVp/components/Home/`.

---

## Phase 1: Setup

- [x] T001 Mover la ilustración fuera de `core/ui` a `src/webparts/objetivosVp/assets/backgroundHome.png` (plan, Q1). **Ya realizado** en el commit `193dbb0`; no requiere acción. Referencia: `bienvenida.jpg` del prototipo es la misma ilustración (verificado visualmente).

---

## Phase 2: Foundational (bloquea todas las historias)

**Purpose**: textos y esqueleto de la pantalla que todas las historias necesitan.

**⚠️ CRITICAL**: ninguna historia empieza antes de terminar esta fase.

- [x] T002 Agregar los textos de la Home con las mismas claves en `src/webparts/objetivosVp/loc/mystrings.d.ts` (interfaz `IObjetivosVpWebPartStrings`, tipo `string`) y en `src/webparts/objetivosVp/loc/en-us.js` (único idioma existente; no crear idiomas nuevos; conservar las claves actuales). Claves y valores, literales y en español (Argentina):
  - `HomeTitle`: "Gestión de Objetivos VP RRII"
  - `HomeWelcomeText`: "Te damos la bienvenida a la app donde la VP RRII baja su estrategia a iniciativas, resultados clave y tareas"
  - `AccessMyTasks`: "Mis tareas"
  - `AccessMyInitiatives`: "Mis iniciativas"
  - `AccessLeversObjectives`: "Palancas y objetivos"
  - `AccessVpDashboard`: "Tablero VP"
  - `AccessAbm`: "ABM"
  - `UserManual`: "Manual de usuario"
  - `BrandLogoAlt`: "by Plataformas 365 | IngSoft"

  **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `<section class="home">`: `.wTitle`, `.wText`, los `<span>` de `.bigBtn` (`bb1`–`bb5`), `.manualBtn` y el `alt` de `.p365Img`.

  **Hecho cuando**: ambos archivos tienen exactamente las mismas claves nuevas, los valores coinciden literalmente con los textos de la **Referencia** y `npm run build` pasa.

- [x] T003 Habilitar los tokens del DS y crear el esqueleto de la pantalla:
  - `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.module.scss` (`.module.scss` raíz del webpart): agregar al inicio `@use '../../../../core/ui/foundations/theme/tokens' as designTokens;` y, dentro de la clase raíz `.objetivosVp`, `@include designTokens.design-system-theme();` (mismo patrón que usa el DS en `DesignSystem.module.scss`). Conservar la regla `.title` existente. Así las variables `--ds-*` quedan disponibles para todas las pantallas; sin ellas, `colors.*` (que devuelven `var(--ds-…)`) no se resuelven.
  - `src/webparts/objetivosVp/components/Home/Home.module.scss`: clase `.home` con `display: grid`, dos columnas con `grid-template-columns: 6fr 5fr` (≈ 620 : 520 px del prototipo), `align-items: stretch`. Clases `.leftColumn` y `.rightColumn` con `display: flex; flex-direction: column`. Sin incluir el mixin de tokens.
  - `src/webparts/objetivosVp/components/Home/Home.tsx`: `export default` del componente `Home` (`React.FC`, sin props) que renderiza `<div className={styles.home}>` con `<div className={styles.leftColumn}>` y `<div className={styles.rightColumn}>` vacíos. Espaciado entre columnas: `style={{ columnGap: spacing.xxxl }}` con `spacing` de `foundations` (prototipo 42 px, Q7).

  **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `.homeGrid` (columnas 620 px y 520 px, `column-gap: 42px`) y `.homeRight` (columna derecha que ocupa las dos filas).

  **Hecho cuando**: `ObjetivosVp.module.scss` incluye el mixin, los archivos de `Home/` existen y `npm run build` pasa.

**Checkpoint**: textos, tokens y esqueleto listos; las historias pueden empezar.

---

## Phase 3: User Story 1 - Ver la pantalla con su bienvenida y sus accesos (Priority: P1) 🎯 MVP

**Goal**: tarjeta de bienvenida con ilustración a la izquierda y cinco accesos apilados a la derecha, montados en el webpart.

**Independent Test**: abrir el webpart y compararlo con la pantalla Home del prototipo (`docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `<section class="home">`, rol Administrador): mismos textos, orden de accesos, íconos (provisorios), colores (aproximados) y disposición en dos columnas.

### Implementation for User Story 1

- [x] T004 [P] [US1] Crear `src/webparts/objetivosVp/components/Home/WelcomeCard/WelcomeCard.tsx` y `WelcomeCard.module.scss`. Componente `WelcomeCard` (`export default`, sin props) que usa **`Surface`** de `core/ui/patterns` con `variant="raised"`, `padding="spacious"` y `borderRadius={WELCOME_CARD_BORDER_RADIUS}` (constante local `= 18`, el radio no tiene token). Dentro, un `<div className={styles.content}>` (`display: flex; flex-direction: column` en el SCSS) con:
  - `<h2>` con `strings.HomeTitle`: `style` con `typography.size[42]`, `typography.lineHeight[42]`, `typography.weight.semibold`, `color: colors.neutral.textMuted`, `fontFamily: typography.family.base`, `margin: 0`.
  - `<p>` con `strings.HomeWelcomeText`: `typography.size[28]`, `typography.lineHeight[28]`, `typography.weight.regular`, `color: colors.neutral.textMuted`, `margin: 0`, `marginTop: spacing.lg`.
  - `<img>` dentro de `<div className={styles.art}>` (`margin-top: auto` en el SCSS, para que quede abajo a la izquierda), con `src` obtenido por `const backgroundHome: string = require('../../../assets/backgroundHome.png');`, `alt=""` (decorativa). En `WelcomeCard.module.scss`, clase `.illustration`: `display: block; width: 58%; max-width: 100%; height: auto; mix-blend-mode: multiply;` (360 / 620 px del prototipo). Separación mínima respecto del texto: `marginTop: spacing.xl` en el `<div>` de la ilustración.

  Si ESLint marca el `require`, se detiene y se reporta; no se suprime la regla.

  **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `.welcome` (tarjeta, radio 18 px, sombra suave), `.wTitle` (40 px, peso 600), `.wText` (26 px, peso 300), `.wArt` (`margin-top: auto`) y `.wImg` (360 px, `mix-blend-mode: multiply`).

  **Hecho cuando**: el componente existe, importa del DS solo por capas, no contiene hexadecimales ni textos literales y `npm run build` pasa.

- [x] T005 [P] [US1] Crear `src/webparts/objetivosVp/components/Home/AccessList/AccessButton.tsx` y `AccessButton.module.scss`. Componente local aprobado (Q2) sobre **`DefaultButton` de `@fluentui/react`** (Fluent UI v8). Props: `title: string`, `iconName: FigmaIconName` (tipo exportado por `core/ui/foundations`), `backgroundColor: string`, `textColor: string`. Sin `onClick` ni ningún handler. Render:
  - `DefaultButton` con `styles={{ root, rootHovered, rootPressed, rootFocused, flexContainer, label }}`: en `root`, `rootHovered`, `rootPressed` y `rootFocused` usar siempre el mismo `backgroundColor` y `color` recibidos (para que Fluent no cambie el fondo al pasar el mouse; el prototipo tiene un efecto hover que NO se reproduce), `border: 'none'`, `borderRadius: spacing.lg`, `width: '100%'`, `height: 'auto'`, `padding: \`${spacing.xl} ${spacing.xl}\``; `flexContainer`: `justifyContent: 'space-between'`, `width: '100%'`; `label`: `margin: 0`, `fontFamily: typography.family.base`, `fontSize: typography.size[32]`, `lineHeight: typography.lineHeight[32]`, `fontWeight: typography.weight.bold`.
  - Contenido: `<span>{title}</span>` a la izquierda y `<FigmaIcon name={iconName} size="xxl" className={styles.icon} />` (de `core/ui/foundations`) a la derecha.
  - En `AccessButton.module.scss`, clase `.icon` con `filter: brightness(0) invert(1);` (aprobado en Q6: los íconos del DS son casi negros y los fondos son oscuros).

  **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `.bigBtn` (radio 16 px, `justify-content: space-between`, texto 31 px bold blanco, padding `0 30px 0 22px`, 96 px de alto con cinco accesos).

  **Hecho cuando**: el componente existe, no tiene `onClick`, no hay hexadecimales y `npm run build` pasa.

- [x] T006 [US1] Crear `src/webparts/objetivosVp/components/Home/AccessList/AccessList.tsx` y `AccessList.module.scss` (depende de T002 y T005). Componente `AccessList` (`export default`, sin props, sin datos ni condiciones por rol: FR-011 y Q8) que renderiza los cinco `AccessButton` en este orden, a partir de un arreglo tipado local (no va a `core/entities` ni a `Constants.ts`):

  | Orden | Texto (`strings.…`) | `iconName` | Grupo / `scale` de `colorScales` | Color del prototipo (referencia) |
  |-------|---------------------|------------|----------------------------------|----------------------------------|
  | 1 | `AccessMyTasks` | `checkmark` | `Primary` / `800` | `.bb1` `#03226B` |
  | 2 | `AccessMyInitiatives` | `applications` | `Tertiary` / `800` | `.bb2` `#2D0050` |
  | 3 | `AccessLeversObjectives` | `flag` | `Tertiary` / `500` | `.bb3` `#7E57A8` |
  | 4 | `AccessVpDashboard` | `list` | `Primary` / `600` | `.bb4` `#2B6A9E` |
  | 5 | `AccessAbm` | `users` | `Secondary` / `700` | `.bb5` `#015F7F` |

  Función local `getColorStep(group: string, scale: string): IColorScaleStep` que busca en `colorScales` (de `core/ui/foundations`) por `name` y `scale` y, si no lo encuentra, lanza `Error` con mensaje claro (grupo y paso buscados). `backgroundColor = step.value` y `textColor = step.textColor`. Contenedor `<div className={styles.list}>` (`display: flex; flex-direction: column; flex: 1; justify-content: space-between` en el SCSS, para que el último acceso quede a la altura de la fila marca + manual) con `style={{ rowGap: spacing.lg }}`.

  **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `.homeRight` (`justify-content: space-between`, `gap: 16px` con cinco accesos) y `.bb1`–`.bb5` (el hexadecimal es solo referencia visual: no se escribe en el código).

  **Hecho cuando**: los cinco accesos salen en ese orden, con esos colores e íconos, sin hexadecimales en el código y `npm run build` pasa.

- [x] T007 [US1] Completar `src/webparts/objetivosVp/components/Home/Home.tsx` (depende de T003, T004, T006): importar `WelcomeCard` y `AccessList` y renderizarlos, `WelcomeCard` dentro de `leftColumn` y `AccessList` dentro de `rightColumn`. **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `.homeGrid` (`.welcome` en la columna 1 y `.homeRight` en la columna 2). **Hecho cuando**: ambas piezas se renderizan en su columna y `npm run build` pasa.

- [x] T008 [US1] Montar la Home en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx` (depende de T007): importar `Home` desde `../Home/Home` y renderizar `<Home />` dentro del `ThemeProvider` existente, reemplazando el `<div>` con título y `description`. Conservar `IObjetivosVpProps` y el `ThemeProvider className={styles.objetivosVp}`; el componente deja de usar `description` (no desestructurarla, para no dejar variables sin uso que rompan el lint). No tocar `ObjetivosVpWebPart.ts`; `ObjetivosVp.module.scss` ya se modificó en T003 y no se vuelve a tocar aquí. **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `<section class="home">` (la pantalla Home completa es lo único que se monta). **Hecho cuando**: el webpart muestra la Home y `npm run build` pasa.

**Checkpoint**: US1 funcional y comprobable de forma independiente (tarjeta + cinco accesos). Comparar con la pantalla Home del prototipo (`<section class="home">`).

---

## Phase 4: User Story 2 - Ver la marca y el acceso al manual de usuario (Priority: P2)

**Goal**: debajo de la tarjeta, la marca a la izquierda y el botón "Manual de usuario" a la derecha, alineado con el borde derecho de la tarjeta.

**Independent Test**: verificar, debajo de la tarjeta, la marca "by Plataformas 365 | IngSoft" y el botón "Manual de usuario" con su ícono, como en `.homeFoot` del prototipo.

### Implementation for User Story 2

- [x] T009 [P] [US2] Crear `src/webparts/objetivosVp/components/Home/HomeFooter/HomeFooter.tsx` y `HomeFooter.module.scss` (depende de T002). Componente `HomeFooter` (`export default`, sin props):
  - Contenedor con `display: flex; justify-content: space-between; align-items: flex-start` (SCSS) y `style={{ marginTop: spacing.lg }}`.
  - A la izquierda, **`BrandLogo`** de `core/ui/foundations` con `name="plataformas365"`, `alt={strings.BrandLogoAlt}` y `height={BRAND_LOGO_HEIGHT}` (constante local `= 19`).
  - A la derecha, **`Button`** de `core/ui/components` con `variant="secondary"` (aprobado en Q3; se acepta que se vea transparente con borde azul y no como la caja gris `#f2f2f2` del prototipo), texto `strings.UserManual` e `iconRight={<FigmaIcon name="user" size="md" />}` (`core/ui/foundations`; sin filtro, el fondo es claro). Sin `onClick` ni `href`.

  **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `.homeFoot` (`justify-content: space-between`, `align-items: flex-start`), `.p365Img` (alto 19 px) y `.manualBtn` (caja gris, texto e ícono a la derecha).

  **Hecho cuando**: el componente existe, no hay hexadecimales ni textos literales, el botón no tiene handler y `npm run build` pasa.

- [x] T010 [US2] Agregar `HomeFooter` a `src/webparts/objetivosVp/components/Home/Home.tsx` (depende de T009 y T007): renderizarlo dentro de `leftColumn`, debajo de `WelcomeCard`. **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `.homeFoot` (columna 1, fila 2 de `.homeGrid`). **Hecho cuando**: la marca y el manual aparecen debajo de la tarjeta, marca a la izquierda y manual a la derecha, y `npm run build` pasa.

**Checkpoint**: US1 y US2 funcionan sin romperse entre sí.

---

## Phase 5: User Story 3 - Reconocer los accesos como elementos clickeables (Priority: P3)

**Goal**: los cinco accesos y el "Manual de usuario" se perciben y se alcanzan como elementos clickeables, pero activarlos no hace nada.

**Independent Test**: pasar el cursor y recorrer con Tab los seis elementos; activar con clic, Enter y Espacio: ninguno navega, abre pestañas ni cambia la pantalla.

### Implementation for User Story 3

- [x] T011 [US3] En `src/webparts/objetivosVp/components/Home/AccessList/AccessButton.module.scss` agregar la clase `.button` con `cursor: pointer` y su regla `:focus-visible` con `outline: 2px solid var(--ds-color-neutral-white)` y `outline-offset: calc(-1 * var(--ds-space-xs))` (la variable la define el mixin incluido en T003 sobre `.objetivosVp`), y pasarla al `DefaultButton` de `AccessButton.tsx` con `className={styles.button}`. No usar hexadecimales. **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `.bigBtn` (`cursor: pointer`); su `:hover` (`translateY(-2px)` y sombra) NO se reproduce. **Hecho cuando**: el cursor cambia a mano sobre cada acceso, el foco con teclado se ve sobre los cinco fondos y `npm run build` pasa.

- [ ] T012 [US3] Verificar que no hay acción en ninguno de los seis elementos, sin modificar la lógica si ya cumple: buscar en `src/webparts/objetivosVp/components/Home/` las cadenas `onClick`, `href`, `window.`, `Utils`, `location` y `history`; no debe haber ninguna coincidencia. Probar en el navegador Tab (recorre los cinco accesos y el manual), Enter y Espacio sobre cada uno: la pantalla no cambia y no se abre ninguna pestaña. **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `<section class="home">`: los `onClick="{{go.*}}"` de los `.bigBtn` del prototipo no se replican. **Hecho cuando**: la búsqueda no devuelve coincidencias, la prueba manual confirma FR-009 y FR-010 y `npm run build` pasa. Si hay coincidencias, eliminarlas en el archivo correspondiente.

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish

- [x] T013 Buscar en `src/webparts/objetivosVp/components/Home/` colores hexadecimales (`#[0-9a-fA-F]{3,8}`), valores en px de espaciado o tipografía en los `.module.scss` y textos de interfaz escritos en el código: no debe quedar ninguno. La prohibición de px aplica a espaciado y tipografía, no a anchos de borde (por ejemplo, el `2px` del `outline` de T011) ni a la constante local `WELCOME_CARD_BORDER_RADIUS` (T004) y `BRAND_LOGO_HEIGHT` (T009). Corregir lo que aparezca usando tokens y `strings`. **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `<section class="home">` (sus hexadecimales y px son solo referencia visual, no se copian). **Hecho cuando**: la búsqueda no encuentra coincidencias y `npm run build` pasa.

- [ ] T014 Ejecutar la validación de `specs/001-home-portfolio-vp/quickstart.md` completa: `npm run build`, `npm run start` (Heft, sin desplegar) y comparación lado a lado con la pantalla Home del prototipo a un mismo ancho de escritorio (SC-003). Abrir el prototipo con `iniciar-windows.bat` (o `./iniciar-mac-linux.sh`) dentro de `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/`, en `http://localhost:8765/index.html`, con el rol por defecto (Administrador, cinco accesos). Verificar que no hay diferencias de disposición, orden ni textos. Los colores (paleta del DS), los tamaños tipográficos y espaciados (tokens más cercanos, Q7), los íconos (provisorios, blancos por filtro), el estilo del "Manual de usuario" (`Button` secondary), la ausencia de hover y la visibilidad permanente de ABM (Q8) corresponden a las aproximaciones aprobadas en el plan; informarlos como tales. **Referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`, `<section class="home">`. **Hecho cuando**: todas las filas de la tabla de `quickstart.md` están verificadas o documentadas como aproximación aprobada.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: T001 ya realizada.
- **Foundational (Fase 2)**: T002 y T003 pueden hacerse en paralelo (archivos distintos); bloquean todas las historias.
- **US1 (Fase 3)**: depende de la Fase 2. T004 y T005 en paralelo; T006 depende de T002 y T005; T007 de T003, T004 y T006; T008 de T007.
- **US2 (Fase 4)**: T009 depende de T002 y puede empezar en paralelo con US1; T010 depende de T009 y T007.
- **US3 (Fase 5)**: T011 depende de T005; T012 depende de T009.
- **Polish (Fase 6)**: depende de todas las historias.

### Within Each User Story

- Piezas (archivos propios) antes de la composición en `Home.tsx`.
- `Home.tsx` se modifica secuencialmente (T003 → T007 → T010): no paralelizar esas tareas.

### Parallel Opportunities

- T002 ∥ T003
- T004 ∥ T005 ∥ T009 (archivos distintos)

---

## Parallel Example: User Story 1

```text
Task: "T004 WelcomeCard en src/webparts/objetivosVp/components/Home/WelcomeCard/WelcomeCard.tsx"
Task: "T005 AccessButton en src/webparts/objetivosVp/components/Home/AccessList/AccessButton.tsx"
Task: "T009 HomeFooter en src/webparts/objetivosVp/components/Home/HomeFooter/HomeFooter.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Fase 2 (T002–T003).
2. Fase 3 (T004–T008).
3. **Detenerse y validar**: comparar con la pantalla Home del prototipo (`<section class="home">`).

### Incremental Delivery

1. Foundational.
2. US1 → validar (MVP).
3. US2 → validar.
4. US3 → validar.
5. Polish.

---

## Notes

- Una tarea por vez, en el orden indicado, con `npm run build` al final de cada una.
- Commits sugeridos: uno por tarea o por grupo lógico.
- Diferencias aprobadas con el prototipo (no son defectos): "Manual de usuario" como botón secundario, íconos provisorios hasta que UX entregue los definitivos, colores de accesos aproximados con `colorScales` e íconos blancos por filtro CSS, tamaños tipográficos y espaciados del DS más cercanos (Q7), ABM siempre visible (Q8), sin efecto hover y alto de la tarjeta determinado por su contenido (Q7).
- Alto de la tarjeta: el prototipo la fija en 520 px; aquí toma el alto de su contenido, porque la regla de tokens prohíbe fijar alturas en px. Aprobado en Q7.
