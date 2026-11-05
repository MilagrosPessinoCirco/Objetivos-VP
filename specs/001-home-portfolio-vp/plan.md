# Implementation Plan: Home de Gestión de Portfolio VP

**Branch**: `001-home-portfolio-vp` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-home-portfolio-vp/spec.md`

## Summary

Construir la pantalla de entrada (Home) como una pantalla puramente visual: tarjeta de bienvenida con ilustración a la izquierda, marca y "Manual de usuario" debajo, y cinco accesos apilados a la derecha. No hay datos, servicios ni navegación. La pantalla se monta en el único webpart existente (`objetivosVp`) y se resuelve con piezas del Design System de YPF (`src/core/ui`), salvo dos excepciones aprobadas:

- los cinco accesos son un componente local sobre un botón de Fluent UI v8, con colores tomados de `colorScales` del Design System (Q2);
- la ilustración vive en `src/webparts/objetivosVp/assets/`, fuera de `core/ui` (Q1).

Los íconos y el color de varios accesos son **provisorios o aproximados, aprobados**, hasta que UX entregue los definitivos. Los íconos se muestran blancos con un filtro CSS desde `AccessButton.module.scss` (Q6). No quedan consultas abiertas.

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, configuración heredada de `@microsoft/spfx-web-build-rig` (`tsconfig.json` solo hace `extends`)

**Primary Dependencies**: SPFx `1.22.2` (`@microsoft/sp-*`), React `17.0.1`, Fluent UI v8 (`@fluentui/react ^8.106.4`), PnPjs (no se usa en esta feature). Sin dependencias nuevas.

**Storage**: N/A (textos fijos, sin datos)

**Testing**: no hay runner de pruebas declarado en el repo. La validación disponible es `npm run build` (= `npm run lint && heft build --clean`, principio V) más comparación visual con `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (pantalla Home).

**Target Platform**: SharePoint Online, navegador de escritorio

**Project Type**: webpart SPFx (toolchain Heft, según los scripts de `package.json`)

**Performance Goals**: N/A

**Constraints**: ancho de escritorio únicamente; sin colores, tipografías ni espaciados fuera del Design System; `src/core/ui` de solo lectura; textos en español (Argentina) mediante el mecanismo de localización existente

**Scale/Scope**: 1 pantalla, 1 webpart, 11 elementos visibles (tarjeta, título y texto, ilustración, marca, "Manual de usuario" y 5 accesos)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | SPFx 1.22.2, React 17.0.1, Fluent UI v8, TS 5.8 ya declarados. Sin dependencias nuevas. |
| II. La interfaz no se inventa | ✅ Cumple, con una aprobación explícita | Pantalla construida solo desde la pantalla Home del prototipo, sin elementos extra. Cada elemento se resuelve con el Design System salvo los accesos, que usan un componente local sobre Fluent UI v8: el catálogo lo permite "solo con aprobación" y Q2 la otorga. Los colores salen de `colorScales`; no se define ningún hexadecimal propio. |
| II. `core/ui` de solo lectura | ✅ Cumple | No se modifica el Design System. Se retira de `core/ui` un archivo que no pertenece al DS (`backgroundHome.png`, resto de la plantilla anterior) con `git mv` a `assets/` del webpart; aprobado en Q1. |
| II. Estructura de pantalla | ✅ Cumple | Carpeta `Home/` con `Home.tsx`, `Home.module.scss` y subcarpetas por pieza. |
| II. Textos en español (AR) | ✅ Cumple | Textos en `loc/` (ver "Dónde vive la pantalla"). |
| III. Datos desacoplados | ✅ N/A | Sin datos, servicios ni entidades: no aplican interfaces ni mocks. |
| IV. Simplicidad y cambios acotados | ✅ Cumple | Se agrega la carpeta `Home/` y la carpeta `assets/`; se toca `ObjetivosVp.tsx` (necesario para montar) y los archivos `loc/` (textos). Un solo componente local nuevo (`AccessButton`). |
| V. Validación | ✅ Cumple | Cada tarea termina con `npm run build` sin errores. |

**Desvíos justificados** (también en Complexity Tracking):

1. **Componente local `AccessButton` sobre Fluent UI v8** en lugar de un componente del Design System. Motivo: `HomeCard` y `Card` no admiten color propio ni son clickeables. Aprobado en Q2.
2. **Ilustración fuera de `core/ui`**, importada con `require` en lugar de `getImageSource`. Motivo: la ilustración no es parte del Design System. Aprobado en Q1.
3. **Íconos y colores aproximados.** Aprobados en Q2 y Q4, provisorios hasta recibir los definitivos de UX.
4. **Tamaños tipográficos y espaciados del Design System más cercanos a los del prototipo.** Aprobado en Q7.

**Re-check post-diseño**: sin cambios. Q1–Q4 y Q6 están resueltas; no quedan consultas abiertas.

## Descripción de la pantalla por regiones

Medidas tomadas del CSS del prototipo `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (pantalla Home, `<section class="home">`), con el rol Administrador (cinco accesos). La barra superior del prototipo pertenece al sitio y no se reproduce (FR-013). El contenido va centrado en la página, con fondo blanco. Los valores en px son los del prototipo; en la implementación se reemplazan por el token más cercano del Design System (Q7).

| # | Región | Referencia en `index.html` y medidas | Colores en el prototipo | Textos |
|---|--------|--------------------------------------|-------------------------|--------|
| R1 | Columna izquierda | `.homeGrid`, columna 1 (620 px): tarjeta y debajo la fila marca + manual (`.homeFoot`, separación 20 px) | — | — |
| R2 | Columna derecha | `.homeGrid` columna 2 (520 px), 42 px de separación con la izquierda; `.homeRight` ocupa las dos filas, accesos con 16 px entre sí | — | — |
| R3 | Tarjeta de bienvenida | `.welcome`: 520 px de alto (no se fija, ver Q7), radio 18 px, sombra `0 2 14 rgba(0,0,0,.12)`, padding 40/28/24, flex en columna | fondo `#fdfdfd` | Título `.wTitle`: 40 px, peso 600, interlineado 1,15, `#7f7f7f`. Texto `.wText`: 26 px, peso 300, interlineado 1,45, ancho máx. 520 px, 20 px bajo el título, `#7f7f7f` |
| R4 | Ilustración | `.wArt` (`margin-top: auto`, queda abajo a la izquierda), `.wImg`: ancho 360 px (máx. 100 %), `mix-blend-mode: multiply` | multicolor (globo azul/violeta, engranajes y personas en coral) | — (decorativa) |
| R5 | Marca | `.homeFoot` a la izquierda, `.p365Img`: alto 19 px | píldora azul marino con texto turquesa y blanco | "by Plataformas 365 \| IngSoft" (parte de la imagen) |
| R6 | "Manual de usuario" | `.manualBtn`: 332 × 92 px (mín.), radio 12 px, contenido centrado con 18 px entre texto e ícono | fondo `#f2f2f2`, texto `#333`, ícono `#0078D4` (34 px) | "Manual de usuario" (26 px, peso 300), ícono a la derecha |
| R7 | Acceso "Mis tareas" | `.bigBtn.bb1`: 96 px de alto (con cinco accesos), radio 16 px, padding 0 30 0 22, texto 31 px bold blanco | `#03226B` | "Mis tareas" a la izquierda; ícono a la derecha |
| R8 | Acceso "Mis iniciativas" | `.bigBtn.bb2`, mismo tamaño | `#2D0050` | "Mis iniciativas"; ícono a la derecha |
| R9 | Acceso "Palancas y objetivos" | `.bigBtn.bb3`, mismo tamaño | `#7E57A8` | "Palancas y objetivos"; ícono a la derecha |
| R10 | Acceso "Tablero VP" | `.bigBtn.bb4`, mismo tamaño | `#2B6A9E` | "Tablero VP"; ícono a la derecha |
| R11 | Acceso "ABM" | `.bigBtn.bb5` (solo rol Administrador en el prototipo; aquí siempre visible), mismo tamaño | `#015F7F` | "ABM"; ícono a la derecha |

El bloque de accesos (`.homeRight`) se estira a la altura de las dos filas de la izquierda (tarjeta + fila marca/manual), por lo que la fila marca + manual termina a la altura del último acceso.

Íconos del prototipo (referencia del diseño final, no se reproducen todavía): tarea con tilde (R7), cuadrícula de cuatro módulos (R8), diana (R9), gráfico de barras (R10), persona con signo más (R11) y persona dentro de recuadro (R6).

## Mapa de componentes

Fuentes consultadas: `docs/design-system-catalog.md`, los `.types.ts` y fuentes de `Surfaces`, `HomeCards`, `Card` y `Button`, más `foundations/brand`, `foundations/images`, `foundations/icons` y `foundations/colors`.

| Región del diseño | Componente del Design System | Variante / props | Asset (ícono, imagen o logo) | Observaciones |
|-------------------|------------------------------|------------------|------------------------------|---------------|
| R3 Tarjeta de bienvenida | `Surface` (`core/ui/patterns`) | `variant="raised"`, `padding="spacious"`, `borderRadius` = constante local 18 (el radio del prototipo no tiene token) | — | Contenedor con fondo blanco y sombra suave. El fondo del prototipo (`#fdfdfd`) es prácticamente el blanco de `raised`. |
| R3 Título y texto | Sin componente (texto sobre `Surface`) | título `typography.size[42]` semibold (prototipo 40 px) / texto `typography.size[28]` regular (prototipo 26 px, peso 300: el DS no tiene peso 300), `colors.neutral.textMuted` | — | El DS no tiene componente de texto; se estilan con tokens en `WelcomeCard.module.scss`. |
| R4 Ilustración | Sin componente (`<img>`) | `alt=""` (decorativa), ancho ≈ 58 % de la tarjeta (360 / 620 px) | `src/webparts/objetivosVp/assets/backgroundHome.png`, importada con `require`. Es la misma ilustración que `bienvenida.jpg` del prototipo (verificado visualmente) | **Resuelto en Q1**: la ilustración no es parte del DS; vive en el webpart. El original en `core/ui` no se toca. |
| R5 Marca | `BrandLogo` (`core/ui/foundations`) | `name="plataformas365"`, `alt="by Plataformas 365 \| IngSoft"`, `height` ≈ 13–20 | `foundations/brand/assets/plataformas365.png` (existe) | Es exactamente la píldora del prototipo. |
| R6 "Manual de usuario" | `Button` (`core/ui/components`) | `variant="secondary"`, `iconRight={<FigmaIcon name="user" />}` | `FigmaIcon` `user` | **Resuelto en Q3**: se acepta que se vea transparente con borde azul en lugar de caja gris. Es una diferencia visual con el prototipo aprobada. |
| R7 "Mis tareas" | **Componente local** `AccessButton` (en `Home/AccessList/`), sobre `DefaultButton`/`ActionButton` de Fluent UI v8 | color: Primary 800 | `FigmaIcon` `checkmark` | **Resuelto en Q2 y Q4.** Ícono provisorio. |
| R8 "Mis iniciativas" | `AccessButton` | color: Tertiary 800 | `FigmaIcon` `applications` | **Resuelto en Q2 y Q4.** El ícono coincide con el prototipo (cuadrícula de cuatro módulos). |
| R9 "Palancas y objetivos" | `AccessButton` | color: Tertiary 500 | `FigmaIcon` `flag` | **Resuelto en Q2 y Q4.** Ícono provisorio. Color aproximado. |
| R10 "Tablero VP" | `AccessButton` | color: Primary 600 | `FigmaIcon` `list` | **Resuelto en Q2 y Q4.** Ícono provisorio. Color aproximado. |
| R11 "ABM" | `AccessButton` | color: Secondary 700 | `FigmaIcon` `users` | **Resuelto en Q2 y Q4.** Ícono provisorio. |

### `AccessButton` (componente local aprobado en Q2)

- **Ubicación**: `src/webparts/objetivosVp/components/Home/AccessList/AccessButton.tsx` (+ `.module.scss`).
- **Base**: botón de Fluent UI v8 (`@fluentui/react`), de modo que sea clickeable y enfocable con teclado sin código propio de accesibilidad.
- **Sin acción** (FR-010): no recibe `onClick`; activar el botón con mouse o teclado no navega ni abre nada. No se usa `Utils.openInNewTab` ni `openInSelfTab`.
- **Props mínimas**: `title`, `icon`, `backgroundColor`, `textColor`.
- **Colores**: se obtienen en la pieza `AccessList` buscando el paso en `colorScales` (`foundations/colors`) por nombre de grupo y `scale`. `colorScales` es un dato de TypeScript, no una variable CSS, por eso el color se aplica con `style` y no desde SCSS. No se escribe ningún hexadecimal en el código.
- **Texto**: el `textColor` de cada paso de `colorScales`.
- **Estilos fijos** (tipografía `size[32]` bold según Q7, padding `spacing.xl`, esquinas `spacing.lg`): `AccessButton.module.scss`, solo con tokens (`spacing`, `typography`).

### Colores de los accesos: aproximaciones aprobadas

Valores y `textColor` tomados de `foundations/colors/colorScales.ts`. **Son aproximaciones aprobadas** de los colores del prototipo (valores reales en la tabla); no son equivalencias exactas.

| Acceso | Paso del DS | Valor | `textColor` | Color en el prototipo | Calidad de la aproximación |
|--------|-------------|-------|-------------|---------------------|----------------------------|
| Mis tareas | Primary 800 | `#02225d` | `#fcfcfc` | `#03226B` | cercana |
| Mis iniciativas | Tertiary 800 | `#2d0055` | `#fcfcfc` | `#2D0050` | cercana |
| Palancas y objetivos | Tertiary 500 | `#8902ff` | `#fcfcfc` | `#7E57A8` | más saturado y más intenso que el prototipo; se eligió por mantener texto blanco en los cinco accesos, como en el prototipo |
| Tablero VP | Primary 600 | `#03399c` | `#fcfcfc` | `#2B6A9E` | más saturado que el prototipo |
| ABM | Secondary 700 | `#015f7f` | `#fcfcfc` | `#015F7F` | cercana |

Aproximación adicional aprobada (Q6): los íconos de los cinco accesos se muestran blancos con `filter: brightness(0) invert(1)` aplicado desde `AccessButton.module.scss`, porque los íconos del DS son casi negros. Es una transformación CSS del asset, no un color propio.

### Íconos provisorios aprobados

Provisorios hasta que UX entregue los definitivos (Q4). Todos con `FigmaIcon`.

| Región | Ícono provisorio | Ícono del prototipo |
|--------|------------------|---------------------|
| R7 Mis tareas | `checkmark` | tarea con tilde |
| R8 Mis iniciativas | `applications` | cuadrícula de cuatro módulos (coincide) |
| R9 Palancas y objetivos | `flag` | diana |
| R10 Tablero VP | `list` | gráfico de barras |
| R11 ABM | `users` | persona con signo más |
| R6 Manual de usuario | `user` | persona dentro de recuadro |

## Decisiones sobre las consultas

**Q1 · Ilustración (resuelta).** `backgroundHome.png` no pertenece al Design System: no existe en el repo original del DS y es un resto de la plantilla anterior. Se mueve con `git mv src/core/ui/foundations/images/assets/backgroundHome.png src/webparts/objetivosVp/assets/backgroundHome.png`, lo que también la elimina de `core/ui`; no cuenta como modificación del DS. Verificado: ningún archivo de `src` referencia `backgroundHome` (no está en `imageAssets.ts`), así que la eliminación no rompe imports. Se importa con `require` desde `WelcomeCard`. `src/spfx-env.d.ts` ya declara el módulo `*.png`, así que `require` compila como en el DS. El movimiento ya se realizó (commit `193dbb0`); no genera tarea.

**Q2 · Accesos (resuelta).** Componente local `AccessButton` en `Home/AccessList/`, sobre un botón de Fluent UI v8, clickeable, enfocable y sin acción. Colores y `textColor` desde `colorScales` (tabla arriba). Son aproximaciones aprobadas.

**Q3 · "Manual de usuario" (resuelta).** `Button variant="secondary"` del Design System. Se acepta la diferencia visual con el prototipo (caja gris sin borde frente a botón transparente con borde azul). SC-003 se cumple con esta excepción.

**Q4 · Íconos (resuelta).** Los del Design System más cercanos, tabla arriba. Provisorios hasta recibir los definitivos de UX.

**Q5 · Navegación futura (informativa).** FR-010 pide que activar un acceso no haga nada. Los accesos y el manual no reciben `onClick`. La feature de navegación los conectará más adelante con `Utils.openInNewTab`/`openInSelfTab`.

**Q6 · Contraste de los íconos sobre los accesos (resuelta).** Los íconos generales del DS se renderizan como `<img>` con relleno fijo: `checkmark`, `flag`, `list`, `users` y `user` son casi negros (`#0D0D0D`) y `applications` es claro (`#E6F9FF`). Sobre los cinco fondos de los accesos, que ahora son todos oscuros, los íconos casi negros no se verían. Aprobado: aplicar `filter: brightness(0) invert(1)` al ícono desde `AccessButton.module.scss` (vía `className` de `FigmaIcon`), de modo que los cinco se vean blancos. Es un filtro CSS sobre el asset, no un color nuevo, y no modifica `core/ui`. El filtro se aplica solo a los íconos de los accesos; el ícono `user` del botón "Manual de usuario" (fondo claro) no lo lleva. Se registra en la tabla de aproximaciones.

**Q7 · Tamaños tipográficos y espaciados (resuelta).** El CSS del prototipo usa valores que no existen en los tokens del Design System. Aprobado: usar el token más cercano. Título de la tarjeta 40 px → `size[42]`; texto 26 px (peso 300) → `size[28]` regular; texto de los accesos 31 px → `size[32]` bold; separación entre columnas 42 px → `spacing.xxxl`; separación entre accesos 16 px → `spacing.lg`; radio de los accesos 16 px → `spacing.lg`; padding de los accesos → `spacing.xl`. Excepción: el radio de la tarjeta (18 px) no tiene token y va como constante local. El alto de la tarjeta (520 px en el prototipo) no se reproduce: toma el alto de su contenido y se estira con la columna derecha (`align-items: stretch`). El padding de la tarjeta (40/28/24 px en el prototipo) se resuelve con `padding="spacious"` de `Surface`, y el `padding-top` de 15 px de `.homeRight` no se reproduce. Se registra como aproximación aprobada.

**Q8 · "ABM" siempre visible (resuelta).** En el prototipo solo lo ve el rol Administrador. Aprobado: mostrarlo siempre (FR-011), porque los roles están fuera de alcance.

Nota: `FigmaIcon` ignora `size` y `variant` para estos íconos (solo escala el `<img>` por CSS), así que `variant="filled"` no los cambia.

## Dónde vive la pantalla

- **Webpart**: `objetivosVp` es el único webpart del repo (`src/webparts/objetivosVp/`). La Home se monta ahí.
- **Montaje**: hoy `ObjetivosVp.tsx` muestra un título y la prop `description` (contenido de plantilla). La Home lo reemplaza: `ObjetivosVp.tsx` renderiza `<Home />`. Esto toca `ObjetivosVp.tsx` y deja sin uso la prop `description` (el webpart y el panel de propiedades no se modifican en esta feature). Se registra aquí porque cambia el comportamiento existente del webpart.
- **Sin router**: el repo no incorpora un router; no se agrega (la navegación está fuera de alcance).
- **Textos**: el webpart tiene un solo idioma, `loc/en-us.js`, con su contrato `loc/mystrings.d.ts`. Los textos de la Home se agregan como claves nuevas en ambos archivos, manteniéndolos sincronizados. Los valores van en español (Argentina) aunque el archivo se llame `en-us.js`; no se crea ningún idioma nuevo.
- **Estilos**: `ThemeProvider` de `ObjetivosVp.tsx` se conserva. `ObjetivosVp.module.scss` se modifica en T003 para incluir el mixin `design-system-theme` en `.objetivosVp`, de modo que las variables `--ds-*` queden disponibles para toda la Home.

### Estructura de carpetas

```text
specs/001-home-portfolio-vp/
├── plan.md
├── research.md
├── quickstart.md
└── tasks.md            # lo genera /speckit-tasks

src/webparts/objetivosVp/
├── assets/
│   └── backgroundHome.png            # ilustración (Q1)
├── loc/
│   ├── en-us.js                      # + claves de la Home
│   └── mystrings.d.ts                # + claves de la Home
└── components/
    ├── ObjetivosVp/
    │   └── ObjetivosVp.tsx           # monta <Home />
    └── Home/
        ├── Home.tsx                  # layout de dos columnas, compone las piezas
        ├── Home.module.scss          # solo grilla y estructura; los tokens se aplican desde el TSX
        ├── WelcomeCard/
        │   ├── WelcomeCard.tsx       # Surface + título + texto + ilustración (R3, R4)
        │   └── WelcomeCard.module.scss
        ├── AccessList/
        │   ├── AccessList.tsx        # los cinco accesos, en orden (R7–R11)
        │   ├── AccessButton.tsx      # componente local aprobado (Q2)
        │   ├── AccessButton.module.scss
        │   └── AccessList.module.scss
        └── HomeFooter/
            ├── HomeFooter.tsx        # marca + "Manual de usuario" (R5, R6)
            └── HomeFooter.module.scss
```

Cada subcarpeta es una pieza que `Home.tsx` importa; no se crean capas adicionales (hooks, servicios, entidades, constantes transversales). La lista de accesos (título, ícono, grupo y paso de color) se define como un arreglo tipado local en `AccessList.tsx` porque es contenido fijo de esa pieza (no es un dato de dominio, así que no va en `core/entities` ni en `Constants.ts`).

**Structure Decision**: una carpeta `Home/` por pantalla con tres piezas, dentro del webpart existente, más `assets/` para la ilustración. Los `.module.scss` generan tipados (`*.module.scss.ts`) como artefacto de compilación: no se editan ni se versionan si el repo los ignora.

## Interfaz y Design System

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (pantalla Home)

**Design System**: `src/core/ui` (solo lectura). Imports selectivos por capa, nunca el índice completo:

```ts
import { Surface } from '<ruta>/core/ui/patterns';
import { Button } from '<ruta>/core/ui/components';
import { BrandLogo, FigmaIcon, colorScales, spacing, typography } from '<ruta>/core/ui/foundations';
```

**Estructura de la pantalla**: ver "Estructura de carpetas".

**Imágenes e íconos**: `plataformas365` (marca, DS). Ilustración propia del webpart (`assets/backgroundHome.png`). Íconos `FigmaIcon`: `checkmark`, `applications`, `flag`, `list`, `users` (accesos) y `user` (manual), provisorios.

### Elementos sin componente en el Design System

- Acceso con color propio y estado clickeable: resuelto con `AccessButton` (Q2).
- Ilustración: resuelta fuera del DS (Q1).

## Complexity Tracking

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|-----------|----------------------|-------------------------------------------|
| Componente local `AccessButton` sobre Fluent UI v8 (principio II: "no se crean componentes ad hoc") | Ningún componente del DS cubre cinco accesos con color propio, texto claro/oscuro según paso y comportamiento clickeable y enfocable. Aprobado explícitamente en Q2; el catálogo permite Fluent UI v8 "solo con aprobación". | `HomeCard`/`Card` con `className` que sobrescriba colores: introduciría colores por fuera de los tokens y no resuelve el foco. |
| Ilustración movida a `assets/` del webpart e importada con `require` en lugar de `getImageSource` | La ilustración no es parte del DS (resto de la plantilla anterior). Aprobado en Q1. | Registrarla en `imageAssets.ts`: la incorporaría al DS algo que no le pertenece. |
| Tamaños tipográficos y espaciados aproximados al token más cercano (Q7) | El prototipo usa valores sin token (40, 26, 31 px, gap 42 px). La constitución prohíbe valores propios. Aprobado en Q7. | Fijar los px exactos: viola el principio II. |
| Íconos y colores aproximados, con filtro CSS en los íconos | Los definitivos no existen todavía. Aprobado en Q2, Q4 y Q6, provisorio hasta recibirlos de UX. | Placeholders vacíos: la pantalla quedaría sin íconos reconocibles. Íconos negros sin filtro: invisibles sobre fondos oscuros. |
