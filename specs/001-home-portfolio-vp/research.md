# Research: Home de Gestión de Portfolio VP

No quedaban `NEEDS CLARIFICATION` en el Technical Context. Esta investigación registra qué se verificó en el repo y qué decisiones quedaron abiertas.

## Decisiones

### D1. Dónde se monta la Home

- **Decisión**: dentro del webpart existente `objetivosVp`, en `components/Home/`, renderizada desde `ObjetivosVp.tsx`.
- **Motivo**: es el único webpart del repo; la constitución pide una carpeta por pantalla con su componente principal, estilos y piezas en subcarpetas.
- **Alternativas**: crear un segundo webpart (descartada: sin necesidad funcional, agrega manifiesto, GUID y empaquetado).

### D2. Contenedor de la tarjeta de bienvenida

- **Decisión**: `Surface variant="raised"`.
- **Motivo**: es la única superficie del catálogo con fondo blanco y sombra suave, como la tarjeta de la captura.
- **Alternativas**: `Card` (descartada: pensada para contenido con acciones y fondos fijos azules).

### D3. Marca "by Plataformas 365 | IngSoft"

- **Decisión**: `BrandLogo name="plataformas365"`.
- **Motivo**: se verificó `foundations/brand/assets/plataformas365.png`; es la píldora completa de la captura.

### D4. Textos

- **Decisión**: claves nuevas en `loc/mystrings.d.ts` y `loc/en-us.js`, en español (Argentina).
- **Motivo**: el repo solo declara un idioma y exige usar el mecanismo de localización existente, sin crear idiomas nuevos.
- **Riesgo**: el nombre `en-us.js` contiene español. Se mantiene para no crear un idioma nuevo; se puede cambiar si lo indican.

### D5. Contenido de los accesos

- **Decisión**: arreglo tipado local en `AccessList.tsx`.
- **Motivo**: contenido fijo y propio de la pieza; evita crear entidades, constantes transversales o servicios (principios III y IV).

## Verificaciones en el repo

| Qué | Resultado |
|-----|-----------|
| Ilustración de la tarjeta | Existe `foundations/images/assets/backgroundHome.png`, **no registrada** en `imageAssets.ts` (nombres: `coverBackground`, `homeCover`, `avatarPhoto`, `activityAvatar`). `home-cover.png` es un banner "Design System Sharepoint On Line V1", no sirve. |
| Marca "by Plataformas 365" | Existe y registrada: `BrandLogoName = 'plataformas365'`. |
| `HomeCard` | Colores fijos en SCSS (`simple`: fondo `#e7efff`, borde/título `#0451dd`; `bandeja`: fondo `#015f7f`). Sin prop de color. Sin handler ni foco en `simple`. `bandeja` siempre muestra "Ver detalle". |
| `Card` | Mismos fondos fijos; las variantes `simple`/`bandeja` usan `!important`. |
| `Button` | `secondary` es transparente con borde azul; sin variante neutral gris. |
| Íconos | `applications` (4 módulos) existe. No existen tarea con tilde, diana, gráfico de barras, persona con signo más ni persona en recuadro. |
| Colores | `colorScales.ts` define paletas como datos; no hay variables CSS por escala. Primary 800 `#02225d`, Tertiary 800 `#2d0055` y Secondary 700 `#015f7f` se aproximan a tres accesos; violeta claro y azul acero no tienen equivalente. |
| Toolchain | Heft (`heft build --clean`), sin Gulp; `npm run build` = `npm run lint && heft build --clean`. |
| Router | No hay router en el repo. |
| Pruebas | No hay runner de pruebas declarado. |

## Limitación

No se midieron píxeles de la captura (no hay herramienta de análisis de imagen disponible en el entorno). Las posiciones, tamaños y colores del plan son estimaciones visuales; la equivalencia con tokens es aproximada y por eso se consulta (Q2).

## Decisiones aprobadas posteriormente

- Q1: `backgroundHome.png` (resto de la plantilla anterior, no pertenece al DS) se mueve con `git mv` a `src/webparts/objetivosVp/assets/` y se importa con `require`.
- Q2: componente local `AccessButton` sobre un botón de Fluent UI v8; colores desde `colorScales` (aproximaciones aprobadas).
- Q3: `Button variant="secondary"` para "Manual de usuario".
- Q4: íconos provisorios del DS hasta que UX entregue los definitivos.

- Q6: íconos de los accesos en blanco con `filter: brightness(0) invert(1)` desde `AccessButton.module.scss`.
- "Palancas y objetivos" pasa a Tertiary 500 (texto blanco en los cinco accesos).

## Abierto

Nada.
