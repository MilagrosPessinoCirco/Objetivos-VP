---

description: "Tareas de implementación de la Home de Gestión de Portfolio VP"
---

# Tasks: Home de Gestión de Portfolio VP

**Input**: `specs/001-home-portfolio-vp/` (`spec.md`, `plan.md`, `research.md`, `quickstart.md`)

**Prerequisites**: `plan.md` (sin consultas abiertas), `spec.md`, `docs/pantallas/Home.png`, `docs/design-system-catalog.md`

**Tests**: no se solicitan. El repo no declara un runner de pruebas; la validación es `npm run build` y la comparación visual con `docs/pantallas/Home.png`.

**Organization**: tareas agrupadas por historia de usuario. Cada tarea indica el archivo exacto, los componentes del Design System (DS) que usa y su criterio de terminado.

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: historia de `spec.md` a la que pertenece (US1, US2, US3).

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores (incluye lint y tipos). Es parte del criterio de terminado de cada tarea.
- **`src/core/ui` es de solo lectura**: no se modifica nada del DS. La única excepción es T001 (mover `backgroundHome.png`, aprobado en Q1 del plan).
- **Imports del DS por capa, nunca el índice completo de `core` ni de `core/ui`**:
  - `…/core/ui/patterns` (`Surface`), `…/core/ui/components` (`Button`), `…/core/ui/foundations` (`BrandLogo`, `FigmaIcon`, `colorScales`, `colors`, `spacing`, `typography`).
  - Desde `Home/Home.tsx`: `../../../../core/ui/<capa>`. Desde `Home/<Pieza>/<Archivo>.tsx`: `../../../../../core/ui/<capa>`.
- **Colores, tipografías y espaciados solo desde tokens**: valores de `colors`, `colorScales`, `spacing` y `typography` (constantes TypeScript) aplicados con la prop `style` o `styles` del componente. Los `.module.scss` contienen solo estructura (display, flex/grid, proporciones, `cursor`, `filter`, anchos relativos). **Prohibido escribir colores hexadecimales o valores en px de espaciado/tipografía en código nuevo.** No fijar alturas en px: la altura sale del padding y del `lineHeight`.
- **Textos**: siempre desde `import * as strings from 'ObjetivosVpWebPartStrings';` (claves creadas en T002). Ningún texto visible escrito en el código.
- **TypeScript estricto, sin `any`, sin comentarios de código, sin literales mágicos**: los números sueltos van a constantes locales con nombre al inicio del archivo.
- **Sin navegación**: ningún componente de la Home recibe ni define `onClick`, `href`, `window.open`, `Utils.*` ni router (FR-010).
- **No editar** archivos `*.module.scss.ts` (artefactos de compilación, ignorados por git).
- **No modificar** `spec.md` ni `plan.md`. Si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo.

## Path Conventions

Raíz del webpart: `src/webparts/objetivosVp/`. Pantalla: `src/webparts/objetivosVp/components/Home/`.

---

## Phase 1: Setup

**Purpose**: dejar la ilustración en el lugar definido por el plan.

- [ ] T001 Mover la ilustración fuera del DS con `git mv src/core/ui/foundations/images/assets/backgroundHome.png src/webparts/objetivosVp/assets/backgroundHome.png` (crear antes la carpeta `src/webparts/objetivosVp/assets/`). No tocar `imageAssets.ts` ni ningún otro archivo de `core/ui` (ningún archivo de `src` referencia `backgroundHome`). **Hecho cuando**: el archivo está en `assets/` del webpart, ya no existe en `core/ui`, `git status` lo muestra como renombrado y `npm run build` pasa.

---

## Phase 2: Foundational (bloquea todas las historias)

**Purpose**: textos y esqueleto de la pantalla que todas las historias necesitan.

**⚠️ CRITICAL**: ninguna historia empieza antes de terminar esta fase.

- [ ] T002 Agregar los textos de la Home con las mismas claves en `src/webparts/objetivosVp/loc/mystrings.d.ts` (interfaz `IObjetivosVpWebPartStrings`, tipo `string`) y en `src/webparts/objetivosVp/loc/en-us.js` (único idioma existente; no crear idiomas nuevos; conservar las claves actuales). Claves y valores, literales y en español (Argentina):
  - `HomeTitle`: "Gestión de Objetivos VP RRII"
  - `HomeWelcomeText`: "Te damos la bienvenida a la app donde la VP RRII baja su estrategia a iniciativas, resultados clave y tareas"
  - `AccessMyTasks`: "Mis tareas"
  - `AccessMyInitiatives`: "Mis iniciativas"
  - `AccessLeversObjectives`: "Palancas y objetivos"
  - `AccessVpDashboard`: "Tablero VP"
  - `AccessAbm`: "ABM"
  - `UserManual`: "Manual de usuario"
  - `BrandLogoAlt`: "by Plataformas 365 | IngSoft"

  **Hecho cuando**: ambos archivos tienen exactamente las mismas claves nuevas y `npm run build` pasa.

- [ ] T003 Habilitar los tokens del DS y crear el esqueleto de la pantalla:
  - `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.module.scss` (`.module.scss` raíz del webpart): agregar al inicio `@use '../../../../core/ui/foundations/theme/tokens' as designTokens;` y, dentro de la clase raíz `.objetivosVp`, `@include designTokens.design-system-theme();` (mismo patrón que usa el DS en `DesignSystem.module.scss`). Conservar la regla `.title` existente. Así las variables `--ds-*` quedan disponibles para todas las pantallas; sin ellas, `colors.*` (que devuelven `var(--ds-…)`) no se resuelven.
  - `src/webparts/objetivosVp/components/Home/Home.module.scss`: clase `.home` con `display: grid`, dos columnas con `grid-template-columns: 6fr 5fr`, `align-items: start`. Clases `.leftColumn` y `.rightColumn` con `display: flex; flex-direction: column`. Sin incluir el mixin de tokens.
  - `src/webparts/objetivosVp/components/Home/Home.tsx`: `export default` del componente `Home` (`React.FC`, sin props) que renderiza `<div className={styles.home}>` con `<div className={styles.leftColumn}>` y `<div className={styles.rightColumn}>` vacíos. Espaciado entre columnas: `style={{ columnGap: spacing.xxl }}` con `spacing` de `foundations`.

  **Hecho cuando**: `ObjetivosVp.module.scss` incluye el mixin, los archivos de `Home/` existen y `npm run build` pasa.

**Checkpoint**: textos, tokens y esqueleto listos; las historias pueden empezar.

---

## Phase 3: User Story 1 - Ver la pantalla con su bienvenida y sus accesos (Priority: P1) 🎯 MVP

**Goal**: tarjeta de bienvenida con ilustración a la izquierda y cinco accesos apilados a la derecha, montados en el webpart.

**Independent Test**: abrir el webpart y compararlo con `docs/pantallas/Home.png`: mismos textos, orden de accesos, íconos (provisorios), colores (aproximados) y disposición en dos columnas.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Crear `src/webparts/objetivosVp/components/Home/WelcomeCard/WelcomeCard.tsx` y `WelcomeCard.module.scss`. Componente `WelcomeCard` (`export default`, sin props) que usa **`Surface`** de `core/ui/patterns` con `variant="raised"`, `padding="spacious"` y `borderRadius={WELCOME_CARD_BORDER_RADIUS}` (constante local `= 12`). Dentro:
  - `<h2>` con `strings.HomeTitle`: `style` con `typography.size[28]`, `typography.lineHeight[28]`, `typography.weight.semibold`, `color: colors.neutral.textMuted`, `fontFamily: typography.family.base`, `margin: 0`.
  - `<p>` con `strings.HomeWelcomeText`: `typography.size[20]`, `typography.lineHeight[20]`, `typography.weight.regular`, `color: colors.neutral.textMuted`, `margin: 0`.
  - `<img>` con `src` obtenido por `const backgroundHome: string = require('../../../assets/backgroundHome.png');`, `alt=""` (decorativa), ancho `50%` de la tarjeta (en `WelcomeCard.module.scss`, `height: auto`), alineada abajo a la izquierda, con `marginTop: spacing.xl`.

  **Hecho cuando**: el componente existe, importa del DS solo por capas, no contiene hexadecimales ni textos literales y `npm run build` pasa.

- [ ] T005 [P] [US1] Crear `src/webparts/objetivosVp/components/Home/AccessList/AccessButton.tsx` y `AccessButton.module.scss`. Componente local aprobado (Q2) sobre **`DefaultButton` de `@fluentui/react`** (Fluent UI v8). Props: `title: string`, `iconName: FigmaIconName` (tipo exportado por `core/ui/foundations`), `backgroundColor: string`, `textColor: string`. Sin `onClick` ni ningún handler. Render:
  - `DefaultButton` con `styles={{ root, rootHovered, rootPressed, rootFocused, flexContainer, label }}`: en `root`, `rootHovered`, `rootPressed` y `rootFocused` usar siempre el mismo `backgroundColor` y `color` recibidos (para que Fluent no cambie el fondo al pasar el mouse), `border: 'none'`, `borderRadius: spacing.xs`, `width: '100%'`, `height: 'auto'`, `padding: \`${spacing.lg} ${spacing.xl}\``; `flexContainer`: `justifyContent: 'space-between'`, `width: '100%'`; `label`: `margin: 0`, `fontFamily: typography.family.base`, `fontSize: typography.size[20]`, `lineHeight: typography.lineHeight[20]`, `fontWeight: typography.weight.bold`.
  - Contenido: `<span>{title}</span>` a la izquierda y `<FigmaIcon name={iconName} size="xxl" className={styles.icon} />` (de `core/ui/foundations`) a la derecha.
  - En `AccessButton.module.scss`, clase `.icon` con `filter: brightness(0) invert(1);` (aprobado en Q6: los íconos del DS son casi negros y los fondos son oscuros).

  **Hecho cuando**: el componente existe, no tiene `onClick`, no hay hexadecimales y `npm run build` pasa.

- [ ] T006 [US1] Crear `src/webparts/objetivosVp/components/Home/AccessList/AccessList.tsx` y `AccessList.module.scss` (depende de T002 y T005). Componente `AccessList` (`export default`, sin props, sin datos ni condiciones por rol: FR-011) que renderiza los cinco `AccessButton` en este orden, a partir de un arreglo tipado local (no va a `core/entities` ni a `Constants.ts`):

  | Orden | Texto (`strings.…`) | `iconName` | Grupo / `scale` de `colorScales` |
  |-------|---------------------|------------|----------------------------------|
  | 1 | `AccessMyTasks` | `checkmark` | `Primary` / `800` |
  | 2 | `AccessMyInitiatives` | `applications` | `Tertiary` / `800` |
  | 3 | `AccessLeversObjectives` | `flag` | `Tertiary` / `500` |
  | 4 | `AccessVpDashboard` | `list` | `Primary` / `600` |
  | 5 | `AccessAbm` | `users` | `Secondary` / `700` |

  Función local `getColorStep(group: string, scale: string): IColorScaleStep` que busca en `colorScales` (de `core/ui/foundations`) por `name` y `scale` y, si no lo encuentra, lanza `Error` con mensaje claro (grupo y paso buscados). `backgroundColor = step.value` y `textColor = step.textColor`. Contenedor `<div className={styles.list}>` (`display: flex; flex-direction: column` en el SCSS) con `style={{ rowGap: spacing.xl }}`.

  **Hecho cuando**: los cinco accesos salen en ese orden, con esos colores e íconos, sin hexadecimales en el código y `npm run build` pasa.

- [ ] T007 [US1] Completar `src/webparts/objetivosVp/components/Home/Home.tsx` (depende de T003, T004, T006): importar `WelcomeCard` y `AccessList` y renderizarlos, `WelcomeCard` dentro de `leftColumn` y `AccessList` dentro de `rightColumn`. **Hecho cuando**: ambas piezas se renderizan en su columna y `npm run build` pasa.

- [ ] T008 [US1] Montar la Home en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx` (depende de T007): importar `Home` desde `../Home/Home` y renderizar `<Home />` dentro del `ThemeProvider` existente, reemplazando el `<div>` con título y `description`. Conservar `IObjetivosVpProps` y el `ThemeProvider className={styles.objetivosVp}`; el componente deja de usar `description` (no desestructurarla, para no dejar variables sin uso que rompan el lint). No tocar `ObjetivosVpWebPart.ts`; `ObjetivosVp.module.scss` ya se modificó en T003 y no se vuelve a tocar aquí. **Hecho cuando**: el webpart muestra la Home y `npm run build` pasa.

**Checkpoint**: US1 funcional y comprobable de forma independiente (tarjeta + cinco accesos). Comparar con `docs/pantallas/Home.png`.

---

## Phase 4: User Story 2 - Ver la marca y el acceso al manual de usuario (Priority: P2)

**Goal**: debajo de la tarjeta, la marca a la izquierda y el botón "Manual de usuario" a la derecha, alineado con el borde derecho de la tarjeta.

**Independent Test**: verificar, debajo de la tarjeta, la marca "by Plataformas 365 | IngSoft" y el botón "Manual de usuario" con su ícono.

### Implementation for User Story 2

- [ ] T009 [P] [US2] Crear `src/webparts/objetivosVp/components/Home/HomeFooter/HomeFooter.tsx` y `HomeFooter.module.scss` (depende de T002). Componente `HomeFooter` (`export default`, sin props):
  - Contenedor con `display: flex; justify-content: space-between; align-items: center` (SCSS) y `style={{ marginTop: spacing.lg }}`.
  - A la izquierda, **`BrandLogo`** de `core/ui/foundations` con `name="plataformas365"`, `alt={strings.BrandLogoAlt}` y `height={BRAND_LOGO_HEIGHT}` (constante local `= 13`).
  - A la derecha, **`Button`** de `core/ui/components` con `variant="secondary"` (aprobado en Q3; se acepta que se vea transparente con borde azul y no como la caja gris de la captura), texto `strings.UserManual` e `iconRight={<FigmaIcon name="user" size="md" />}` (`core/ui/foundations`; sin filtro, el fondo es claro). Sin `onClick` ni `href`.

  **Hecho cuando**: el componente existe, no hay hexadecimales ni textos literales, el botón no tiene handler y `npm run build` pasa.

- [ ] T010 [US2] Agregar `HomeFooter` a `src/webparts/objetivosVp/components/Home/Home.tsx` (depende de T009 y T007): renderizarlo dentro de `leftColumn`, debajo de `WelcomeCard`. **Hecho cuando**: la marca y el manual aparecen debajo de la tarjeta, marca a la izquierda y manual a la derecha, y `npm run build` pasa.

**Checkpoint**: US1 y US2 funcionan sin romperse entre sí.

---

## Phase 5: User Story 3 - Reconocer los accesos como elementos clickeables (Priority: P3)

**Goal**: los cinco accesos y el "Manual de usuario" se perciben y se alcanzan como elementos clickeables, pero activarlos no hace nada.

**Independent Test**: pasar el cursor y recorrer con Tab los seis elementos; activar con clic, Enter y Espacio: ninguno navega, abre pestañas ni cambia la pantalla.

### Implementation for User Story 3

- [ ] T011 [US3] En `src/webparts/objetivosVp/components/Home/AccessList/AccessButton.module.scss` agregar la clase `.button` con `cursor: pointer` y su regla `:focus-visible` con `outline: 2px solid var(--ds-color-neutral-white)` y `outline-offset: -4px` (la variable la define el mixin incluido en T003 sobre `.objetivosVp`), y pasarla al `DefaultButton` de `AccessButton.tsx` con `className={styles.button}`. No usar hexadecimales. **Hecho cuando**: el cursor cambia a mano sobre cada acceso, el foco con teclado se ve sobre los cinco fondos y `npm run build` pasa.

- [ ] T012 [US3] Verificar que no hay acción en ninguno de los seis elementos, sin modificar la lógica si ya cumple: buscar en `src/webparts/objetivosVp/components/Home/` las cadenas `onClick`, `href`, `window.`, `Utils`, `location` y `history`; no debe haber ninguna coincidencia. Probar en el navegador Tab (recorre los cinco accesos y el manual), Enter y Espacio sobre cada uno: la pantalla no cambia y no se abre ninguna pestaña. **Hecho cuando**: la búsqueda no devuelve coincidencias, la prueba manual confirma FR-009 y FR-010 y `npm run build` pasa. Si hay coincidencias, eliminarlas en el archivo correspondiente.

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish

- [ ] T013 Buscar en `src/webparts/objetivosVp/components/Home/` colores hexadecimales (`#[0-9a-fA-F]{3,8}`), valores en px de espaciado o tipografía en los `.module.scss` y textos de interfaz escritos en el código: no debe quedar ninguno. Corregir lo que aparezca usando tokens y `strings`. **Hecho cuando**: la búsqueda no encuentra coincidencias y `npm run build` pasa.

- [ ] T014 Ejecutar la validación de `specs/001-home-portfolio-vp/quickstart.md` completa: `npm run build`, `npm run start` (Heft, sin desplegar) y comparación lado a lado con `docs/pantallas/Home.png` a ancho de escritorio. Informar las diferencias esperadas y aprobadas: botón "Manual de usuario" secundario (Q3), íconos provisorios (Q4), colores aproximados (Q2) e íconos en blanco por filtro (Q6). **Hecho cuando**: todas las filas de la tabla de `quickstart.md` están verificadas o documentadas como diferencia aprobada.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: T002 y T003 pueden hacerse en paralelo con T001 (archivos distintos); bloquean todas las historias.
- **US1 (Fase 3)**: depende de la Fase 2. T004 y T005 en paralelo; T006 depende de T005; T007 de T003, T004 y T006; T008 de T007.
- **US2 (Fase 4)**: T009 depende de T002 y puede empezar en paralelo con US1; T010 depende de T009 y T007.
- **US3 (Fase 5)**: depende de T005 (T011) y de T009 (T012).
- **Polish (Fase 6)**: depende de todas las historias.

### Within Each User Story

- Piezas (archivos propios) antes de la composición en `Home.tsx`.
- `Home.tsx` se modifica secuencialmente (T003 → T007 → T010): no paralelizar esas tareas.

### Parallel Opportunities

- T001 ∥ T002 ∥ T003
- T004 ∥ T005, y T009 ∥ T004 ∥ T005 (archivos distintos)

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

1. Fase 1 y Fase 2 (T001–T003).
2. Fase 3 (T004–T008).
3. **Detenerse y validar**: comparar con `docs/pantallas/Home.png`.

### Incremental Delivery

1. Setup + Foundational.
2. US1 → validar (MVP).
3. US2 → validar.
4. US3 → validar.
5. Polish.

---

## Notes

- Una tarea por vez, en el orden indicado, con `npm run build` al final de cada una.
- Commits sugeridos: uno por tarea o por grupo lógico.
- Diferencias aprobadas con la captura (no son defectos): "Manual de usuario" como botón secundario, íconos provisorios hasta que UX entregue los definitivos, colores de accesos aproximados con `colorScales` e íconos blancos por filtro CSS.
