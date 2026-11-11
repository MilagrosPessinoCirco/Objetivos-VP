# Implementation Plan: Objetivos (alta, edición, vista y su lugar dentro de palancas)

**Branch**: `003-objetivos` | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-objetivos/spec.md`. Continúa la feature [002-palancas-estrategicas](../002-palancas-estrategicas/plan.md).

## Summary

Agregar al webpart `objetivosVp` el formulario de objetivo (alta y edición, con campos según la VP), el detalle de objetivo con migas de pan, y completar la sección de palancas y objetivos de la 002: cantidad de objetivos por palanca, lista de objetivos en el detalle de palanca, selector "Objetivos del VP / Todos" y el bloque "Objetivos de otras VP". No incluye avance, iniciativas, roles ni ABM de maestros.

Enfoque técnico:

- **Datos**: ya existen las entidades (`Objetivo`, `Vicepresidencia`, `Departamento`, `Gerencia`) y sus datasources y hooks en `core`, generados con la skill `data-source`. No se crean servicios nuevos. Se agrega un mock por cada uno (principio III) y se ajustan `Objetivo.ts` (Title = Nombre) y el enum de estado.
- **Pantallas**: el prototipo resuelve el formulario de objetivo como una pantalla (`scr.form`), no como un modal. Se agregan tres rutas: `/objetivo/new`, `/objetivo/:id` y `/objetivo/:id/edit`.
- **Filtro y conteos**: los hooks solo exponen `getItems`, así que las pantallas cargan todos los objetivos y filtran, cuentan y agrupan durante el render, como la 002 con las palancas activas.
- **Selector**: el valor "Objetivos del VP / Todos" vive en `ObjetivosVp.tsx` y baja por props a la grilla y al detalle de palanca.
- **Migas**: se reutiliza `PalancaBreadcrumb`, ampliado con dos props opcionales.
- **Permisos**: dos props separadas, `canCreateObjetivo` y `canEditObjetivo`, fijas en `true` hasta RF-19.

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, configuración heredada de `@microsoft/spfx-web-build-rig`.

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`, Fluent UI v8, PnPjs `@pnp/sp 4.18.0` (`core/pnp/sp/pnpjs-presets.ts`), `react-router-dom 6.30.6`. Esta feature no agrega dependencias.

**Storage**: listas de SharePoint `Objetivo`, `Vicepresidencia`, `Departamento`, `Gerencia` y `Palanca` (`Lista.*` en `src/core/utils/Constants.ts`), que ya existen. Columnas en [data-model.md](./data-model.md). Mocks en memoria fuera de SharePoint.

**Testing**: no hay runner de pruebas. Validación: `npm run build` (principio V), escenarios de [quickstart.md](./quickstart.md) en el workbench hospedado del sitio de desarrollo y comparación visual con el prototipo. Mismas condiciones que la 002: se escribe solo en la lista de desarrollo y con autorización explícita.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft, según los scripts de `package.json`).

**Performance Goals**: pantallas en menos de 3 s con decenas de objetivos (SC-008). Una consulta de objetivos por pantalla; el formulario suma una por cada maestro.

**Constraints**: ancho de escritorio; sin colores, tipografías ni espaciados fuera del DS; `src/core/ui` de solo lectura; textos en español (AR) con el mecanismo de localización existente; sin acción de eliminar.

**Scale/Scope**: 2 pantallas nuevas (formulario y detalle de objetivo), 2 pantallas de 002 extendidas, 4 mocks nuevos, 3 archivos de `core` modificados, 3 rutas nuevas, claves de texto nuevas en `loc/`.

## Hallazgos del repo que cambian el borrador del plan

| # | Hallazgo | Consecuencia |
|---|---|---|
| H1 | No hay capa de servicios: `core/api/<Entidad>/` ya tiene datasource, interfaz y hooks para Objetivo, Vicepresidencia, Departamento y Gerencia. | No se crean `ObjetivoService` ni similares. Se reutilizan los hooks. |
| H2 | El maestro de VP se llama `Vicepresidencia` (entidad, lista y hook), con `Nombre` y `Activo`. | Se usa ese nombre. El formulario ofrece solo las activas. |
| H3 | `Constants.Estado` vale "En curso", "Finalizado cumplido", "Finalizado incumplido", y `Objetivo.Estado` lo usa. La spec (RF-03) pide "No iniciada", "En curso", "Finalizada". | Se sigue el código y se le suma "No iniciada" (P1). Solo `Objetivo` usa el enum. |
| H4 | Ningún hook expone `getFilteredItems`; el hook genérico solo da `getItems`, `addItem`, `editItem`, `deleteItem` y `getById`. | Filtros y conteos en las pantallas. |
| H5 | No hay mocks de Objetivo, Vicepresidencia, Departamento ni Gerencia. | Cuatro mocks nuevos, como `PalancaMock`. |
| H6 | `Objetivo.toListItem` no envía `Title`. | `Title` = `Nombre` (patrón de la 002, C4). |
| H7 | La lista y la entidad tienen `CantidadAnios`; la spec no tiene ese campo. | No se muestra ni se envía. La entidad no se toca. |
| H8 | Ni la 002 ni el resto del webpart usan `Tabs` ni `Pivot`. La 002 excluyó "Cargar objetivo". | `Tabs` para el selector; "Cargar objetivo" es nuevo. |
| H9 | `PalancaBreadcrumb` recibe solo `palancaNombre`. | Se amplía con props opcionales, sin crear otro componente. |
| H10 | El maestro `Vicepresidencia` no tiene un campo que marque a la VP RRII, y los Id cambian entre sitios. | Se identifica por `Nombre` (ver D2). |

## Constitution Check

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | Mismo stack y versiones que la 002, sin dependencias nuevas. |
| II. La interfaz no se inventa | ✅ Cumple, con desvíos aprobados por la spec | Pantallas tomadas de `scr.form`, `scr.objetivo` y `scr.palancas` del prototipo. Desvíos: bloque "Objetivos de otras VP" y selector "Objetivos del VP / Todos", que el prototipo no define (spec, Clarifications y Assumptions); lista de objetivos en el detalle de palanca, que la 002 excluyó. Todo se resuelve con piezas del catálogo. |
| II. `core/ui` de solo lectura | ✅ Cumple | No se modifica el Design System. |
| II. Estructura de pantalla | ✅ Cumple | `ObjetivoForm/` y `ObjetivoDetalle/`, cada una con su `.tsx` y `.module.scss` y piezas en subcarpetas. |
| II. Textos en español (AR) | ✅ Cumple | Claves nuevas en `loc/mystrings.d.ts` y `loc/en-us.js`. |
| III. Datos desacoplados | ✅ Cumple | Las pantallas usan solo hooks de `core/api`. Mocks nuevos para los cuatro datasources. Tipos en `core/entities`. |
| IV. Simplicidad y cambios acotados | ✅ Cumple, con cambios en `core` | `Objetivo.ts`, `Constants.ts` y los cuatro hooks reciben su mock. Sin capas ni hooks nuevos. `Objetivo.toListItem` también deja de exigir `Duracion` (un objetivo de otra VP no la tiene). |
| V. Validación | ✅ Cumple | Cada tarea cierra con `npm run build`. |

**Re-check post-diseño**: sin cambios. Sin pendientes abiertos.

## Pendientes resueltos

- **P1. Valores de Estado.** Decisión de la usuaria: se sigue el código y se agrega "No iniciada" al enum `Estado` de `Constants.ts`, que solo usa `Objetivo`. Valores: No iniciada, En curso, Finalizado cumplido, Finalizado incumplido. Valor inicial del alta: "No iniciada", modificable. Hay que agregar "No iniciada" a las opciones de la columna `Estado` de la lista `Objetivo` en SharePoint: la lectura tolera valores desconocidos, pero la escritura (`assertChoiceValue`) exige los del enum.
- **P2. Nombre de la VP RRII.** "VP RRII", como el prototipo. Verificar en la lista `Vicepresidencia`.

## Mapa de componentes

Fuentes: `docs/design-system-catalog.md` y el prototipo (`scr.form`, `scr.objetivo`, `scr.palancas`).

### Formulario de objetivo (`scr.form`, rama de objetivo)

| Región | Componente | Variante / props | Observaciones |
|---|---|---|---|
| "Volver" y título | `Button` y `h1` con tokens | `variant="secondary"`, `size="small"`, `iconLeft={<FigmaIcon name="arrowCircle" />}`; `PAGE_TITLE_STYLE` de la 002 | El formulario no lleva migas (el prototipo no las tiene). Título "Nuevo objetivo" o "Editar objetivo OBJ-nn". |
| Sección "Información general" | `Surface` (`core/ui/patterns`) | `variant="outline"`, `padding="comfortable"`, `header` | Igual que la 002 (aproximación A4). |
| VP | `Dropdown` | `required`, `options` = VP activas, `disabled` en edición (FR-004a) | `key` = Id como texto. |
| Departamento | `Dropdown` | `required` | — |
| Gerencia | `Dropdown` | `required`, `options` = gerencias del departamento elegido | Se limpia al cambiar el departamento (FR-006). |
| Nombre | `Input` | `required`, `maxLength={255}`, `errorMessage` | — |
| Ícono de ayuda | `Button` `iconOnly` con `FigmaIcon` `info` + `Callout` | El botón alterna el `Callout` (`title` "Guía de redacción", `description` con el texto del prototipo) debajo del label | Composición de dos piezas del DS. |
| Descripción | `Multiline` | `required`, `errorMessage` | — |
| Sección "Planificación (VP RRII)" | `Surface` | Solo si la VP es la VP RRII | — |
| Palanca | `Dropdown` | `required`; activas más la ya elegida, aunque esté inactiva (FR-014) | — |
| Duración | `Dropdown` | Anual / Plurianual / Permanente | Sin "Cantidad de años" (spec, Assumptions). |
| Peso en la VP (%) | `SpinButton` (`core/ui/components`) | `min={0}`, `max={100}`, `required`, `errorMessage` | Sin leyenda de peso asignado. |
| Objetivo del VP | `Switch` | `active`, `labelPosition="top"`, `onChange` | Por defecto apagado. |
| Fecha de inicio / de compromiso | `Picker` (`core/ui/patterns`) | `mode="date"`, `required`; valor `AAAA-MM-DD` | Sin `errorMessage` en el componente: ver "Aproximaciones" A2. |
| Estado | `Dropdown` | `required`; en el alta arranca en "No iniciada" y se puede cambiar | — |
| Pie | `Footer` o `Button` x2 | "Cancelar" `variant="secondary"`, "Guardar" `variant="primary"` | Mismo criterio que el pie del detalle de palanca (botones, no `Footer`). |
| Error al guardar / de carga | `MessageBar` | `type="error"`, una línea | Datos conservados (FR-017). |
| Carga | `Spinner` | sin texto | Mientras cargan los maestros. |

### Detalle de objetivo (`scr.objetivo`)

| Región | Componente | Variante / props | Observaciones |
|---|---|---|---|
| Migas | `PalancaBreadcrumb` ampliado | Ver D5 | Inicio > Palancas > palanca > objetivo; otra VP: Inicio > Palancas > objetivo. |
| Encabezado | `Button` "Volver" + `h1` + `Chip` | Igual que `PalancaDetalle` | "OBJ-nn · Nombre". |
| Chip de estado | `Chip` | `size="small"`, `clickable={false}`; `neutral` (No iniciada), `brand` (En curso), `success` (Finalizado cumplido), `danger` (Finalizado incumplido) | Aproximación A1. |
| "Información del objetivo" | `Surface` + datos etiqueta/valor | Mismo patrón que `PalancaInfo` | Nombre, descripción, VP, departamento, gerencia, palanca, objetivo del VP. Las de otra VP omiten palanca y objetivo del VP. |
| "Planificación" | `Surface` + datos | Solo VP RRII | Duración, peso, fechas. |
| Pie | `Button` x2 | "Volver" `variant="secondary"`, "Editar" `variant="primary"` solo si `canEditObjetivo` | Igual que el detalle de palanca. |
| Error / carga / no encontrado | `MessageBar` / `Spinner` | Igual que `PalancaDetalle` | — |

### Palancas y objetivos (extensión de la 002)

| Región | Componente | Variante / props | Observaciones |
|---|---|---|---|
| Selector "Objetivos del VP / Todos" | `Tabs` (`core/ui/patterns`) | `variant="filled"`, `size="small"`, dos `ITabItem`, `ariaLabel`; valor inicial "Todos" | Arriba de la grilla (FR-022). |
| Columna "Objetivos" | `Table` de la 002 | Columna `objetivos` con la cantidad | — |
| "Cargar objetivo" | `Button` | `variant="primary"`, `iconLeft={<FigmaIcon name="add" />}`; solo si `canCreateObjetivo` | En `PalancasHeader` y en el pie de `PalancaDetalle` (FR-023). |
| "Objetivos de la palanca" | `Surface` + `Table` | Columnas ID, Objetivo, Departamento, Gerencia, Peso, Estado, acciones; `emptyText` | En `PalancaDetalle`, entre la información y el pie. |
| "Objetivos de otras VP" | `Surface` + `Table` | Columnas ID, Objetivo, VP, Departamento, Gerencia, Estado, acciones; `emptyText` | Debajo de la grilla; oculto con "Objetivos del VP" (FR-024). |
| Acción "Ver objetivo" | `Button` `iconOnly` + `Tooltip` | `arrowForward` | Igual que "Ver palanca". |

### Aproximaciones (a confirmar en la revisión visual)

| # | Elemento | Resolución | Motivo |
|---|---|---|---|
| A1 | Chip de estado del objetivo | Colores semánticos del DS | Igual criterio que A3 de la 002. |
| A2 | Error en las fechas | Texto de error en una línea debajo del `Picker`, con tokens (`typography.size[12]`, `colors`), porque `Picker` no tiene `errorMessage` | Un campo de fecha con error sin `Picker`: la alternativa sería `Input type="date"`, que sí tiene `errorMessage` pero no es la pieza de fecha del DS. A decidir en revisión. |
| A3 | Sección "Planificación (VP RRII)" | `Surface outline` con header | El DS no tiene banda de sección (A4 de la 002). |
| A4 | Tipografías | Tokens 20, 14 y 12 px | Criterio de la 001 (Q7). |
| A6 | Objetivos desplegables en la grilla | Filas de objetivo debajo de la palanca, en la misma `Table`, con control de despliegue (`chevronRight` / `chevronDown`) en la primera columna | El DS no tiene tabla anidada ni filas expandibles (`groups` solo admite texto en el encabezado). Pedido de la usuaria el 2026-11-11, que reemplaza la exclusión de RF-02. |
| A5 | Ícono de ayuda del nombre | A la derecha del campo, no junto a la etiqueta | El `Input` del DS trae su propia etiqueta; no se compone una etiqueta ad hoc (principio II). |

## Decisiones

**D1. Capa de datos.** Se usan `useObjetivoDataSource`, `useVicepresidenciaDataSource`, `useDepartamentoDataSource`, `useGerenciaDataSource` y `usePalancaDataSource`. A cada hook de objetivo, VP, departamento y gerencia se le pasa su mock como segundo argumento, igual que `usePalancaDataSource`. Los mocks viven junto a su datasource y guardan el estado a nivel de módulo, con datos del prototipo (`D.objs`). `useItem<Entidad>DataSource` no se toca.

**D2. Identificación de la VP RRII.** Por `Nombre`, con la constante `VP_RRII_NOMBRE` en `Constants.ts` (transversal: la usan formulario, detalle, grilla y mocks). Motivo: el `Objetivo` ya trae `VP.Title`, así que las pantallas distinguen objetivos de la VP RRII sin cargar el maestro, y los Id de las listas difieren entre el sitio de desarrollo y el de producción, por lo que un `VP_RRII_ID` fijo sería un identificador de tenant en el código. Riesgo: si se renombra la VP, hay que actualizar la constante. Valor a confirmar (P2). `isVpRrii(nombre)` vive en `components/objetivoUtils.ts`.

**D3. Filtro, conteo y listas.** Las pantallas llaman a `getItems()` de objetivos y calculan durante el render: objetivos con palanca = los de la VP RRII; "Objetivos del VP" = `EsDeVp === true`; cantidad por palanca = coincidencia por `Palanca.Id`; otras VP = los que no son de la VP RRII. Sin estado duplicado. Una sola consulta de objetivos por pantalla.

**D4. Selector "Objetivos del VP / Todos".** `useState` en `ObjetivosVpRoutes` (`ObjetivosVp.tsx`), con valor inicial "Todos", pasado por props a `Palancas` y `PalancaDetalle`. Sobrevive a la navegación dentro de la sesión y se reinicia al recargar. Aplica a las cantidades y a las listas (FR-022); el bloque de otras VP se oculta con "Objetivos del VP".

**D5. Migas.** `PalancaBreadcrumb` suma `palancaId?` y `objetivoNombre?`. Con `objetivoNombre`, el nivel final es el objetivo; si además hay `palancaNombre` y `palancaId`, la palanca es un link a su detalle. Sin `objetivoNombre`, se comporta como hoy. Se actualiza el uso del componente solo si cambia su contrato (no cambia). Desvío menor sobre código de la 002, necesario para FR-027 y FR-027a.

**D6. Rutas.** En `routes.ts`: `OBJETIVO_NEW_PATH = '/objetivo/new'`, `OBJETIVO_DETAIL_PATH = '/objetivo/:id'`, `OBJETIVO_EDIT_PATH = '/objetivo/:id/edit'`, `getObjetivoPath(id)`, `getObjetivoEditPath(id)` y `getObjetivoNewPath(palancaId?)` (query `?palanca=<id>` para preseleccionar la palanca desde el detalle, FR-023). La spec dice que no se crean rutas de pantallas sin implementar: las tres se implementan en esta feature. "Volver" del detalle va a la grilla y el de la edición al detalle del objetivo (o a donde se vino); son destinos fijos, no `navigate(-1)`, por la misma razón que en la 002 (enlace directo).

**D7. Navegación posterior al guardado.** Alta y edición terminan en el detalle del objetivo guardado, con el aviso de éxito, que se pasa con `navigate(..., { state })` y lo muestra un `Toast`. Es lo mismo para objetivos de la VP RRII y de otra VP, porque el detalle existe para ambos. Alternativa descartada: dejar el formulario abierto, porque el prototipo lo cierra al guardar. "Cancelar" vuelve al detalle en la edición y a la grilla de palancas en el alta.

**D8. Rutas con destinos fijos.** "Volver" del detalle de objetivo va a la grilla de palancas, no a `navigate(-1)`, porque el detalle también se abre con un enlace directo.

**D9. Formato del ID.** `OBJ-<Id con dos dígitos>` (ej.: `OBJ-01`), como el prototipo, en `formatObjetivoId` de `objetivoUtils.ts`.

**D10. Title y escritura.** `Objetivo.toListItem` envía `Title: this.Nombre` (FR-018), igual que `Palanca`, y escribe `Duracion` solo si tiene valor, porque `assertChoiceValue` lanza con `undefined` y un objetivo de otra VP no tiene duración.

**D11. Permisos (FR-032).** Props `canCreateObjetivo` (alta: botón "Cargar objetivo" y ruta `/objetivo/new`) y `canEditObjetivo` (botón "Editar" y ruta `/objetivo/:id/edit`), fijas en `true` en `ObjetivosVp.tsx`. Las rutas de alta y edición no se protegen en esta feature (cualquier usuario puede crear y editar, FR-031); RF-19 decidirá cómo restringirlas.

**D12. Errores.** Se reutiliza el cambio de `useDatasource` de la 002 (relanza en `editItem` y `getById`; `addItem` relanza). No se modifica `useDatasource` en esta feature. Las pantallas muestran un `MessageBar` de una línea, sin el error técnico.

**D13. Palanca inactiva ya usada (FR-014, FR-029).** El detalle muestra `Objetivo.Palanca.Title`. El formulario de edición carga las palancas con `getItems()` y arma las opciones con las activas más la palanca del objetivo, aunque esté inactiva. En el alta, solo las activas.

**D14. Validación del formulario.** Los errores en línea aparecen al intentar guardar y se limpian cuando el campo deja de estar inválido, igual que `PalancaForm`. Reglas: obligatorios (recortando espacios), peso entre 0 y 100 incluidos, compromiso no anterior al inicio. Al cambiar la VP en el alta, los campos que dejan de aplicar se descartan al armar el `Objetivo`. Peso decimal: se guarda el número tal cual lo ingresa la persona; no se hacen operaciones aritméticas con él en esta feature, por lo que no hay riesgo de precisión.

## Comportamiento

- **Grilla (`Palancas.tsx`)**: carga palancas y objetivos con dos hooks. Con objetivos filtrados por el selector, agrega la columna de cantidad a las filas y renderiza debajo el bloque de otras VP. Un error al cargar objetivos muestra el `MessageBar` de carga y no deja la columna en cero.
- **Detalle de palanca (`PalancaDetalle.tsx`)**: carga también los objetivos y muestra los de la palanca (filtrados por el selector) en la nueva sección.
- **Formulario (`ObjetivoForm.tsx`)**: modo alta o edición según la ruta; en edición carga el objetivo con `getById`. Carga VP, departamentos, gerencias y palancas al montar.
- **Detalle (`ObjetivoDetalle.tsx`)**: `getById`, con los mismos estados de error que `PalancaDetalle`.

## Estructura de carpetas

```text
specs/003-objetivos/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-contracts.md
├── checklists/requirements.md
└── tasks.md                                  # lo genera /speckit-tasks

src/core/
├── utils/Constants.ts                        # + VP_RRII_NOMBRE; Estado + NoIniciada
├── entities/Objetivo.ts                      # Title = Nombre
└── api/
    ├── Objetivo/{ObjetivoMock.ts, useObjetivoDataSource.ts}                    # nuevo mock; hook lo pasa
    ├── Vicepresidencia/{VicepresidenciaMock.ts, useVicepresidenciaDataSource.ts}
    ├── Departamento/{DepartamentoMock.ts, useDepartamentoDataSource.ts}
    └── Gerencia/{GerenciaMock.ts, useGerenciaDataSource.ts}

src/webparts/objetivosVp/
├── loc/{en-us.js, mystrings.d.ts}            # claves nuevas
└── components/
    ├── objetivoUtils.ts                      # nuevo: formatObjetivoId, isVpRrii
    ├── ObjetivosVp/{ObjetivosVp.tsx, routes.ts}   # rutas, selector y flags de permiso
    ├── Palancas/                             # PalancasHeader (Cargar objetivo, selector), PalancasTable (columna), Palancas.tsx (bloque otras VP)
    ├── PalancaDetalle/                       # PalancaBreadcrumb ampliado, sección de objetivos
    ├── ObjetivoForm/
    │   ├── ObjetivoForm.tsx
    │   ├── ObjetivoForm.module.scss
    │   └── NombreAyuda/NombreAyuda.tsx       # ícono de ayuda + Callout
    ├── ObjetivosTable/                       # Table de objetivos compartida por el detalle de palanca y el bloque de otras VP
    │   └── ObjetivosTable.tsx
    └── ObjetivoDetalle/
        ├── ObjetivoDetalle.tsx
        ├── ObjetivoDetalle.module.scss
        └── ObjetivoInfo/ObjetivoInfo.tsx     # información y planificación
```

**Structure Decision**: una carpeta por pantalla nueva (`ObjetivoForm/`, `ObjetivoDetalle/`). `ObjetivosTable/` se comparte entre el detalle de palanca y el bloque de otras VP, por lo que va al mismo nivel (principio DRY, sin una tabla distinta por pantalla; admite columnas Palanca/VP según el caso). `objetivoUtils.ts` queda junto a `getColorStep.ts`, a nivel de componentes, porque lo usan varias pantallas.

## Orden de implementación

| # | Paso | Depende de |
|---|------|-----------|
| 1 | `Constants.ts` (VP_RRII_NOMBRE, Estado.NoIniciada), `Objetivo.ts` (Title) | — |
| 2 | Mocks y hooks de Objetivo, Vicepresidencia, Departamento y Gerencia | 1 |
| 3 | Claves de texto en `loc/` | — |
| 4 | `objetivoUtils.ts`, rutas, selector y flags en `ObjetivosVp.tsx`, `PalancaBreadcrumb` ampliado | 3 |
| 5 | `ObjetivosTable`, grilla extendida (columna, selector, bloque otras VP, "Cargar objetivo") (US3) | 2, 4 |
| 6 | Detalle de palanca extendido (lista de objetivos, "Cargar objetivo") (US3) | 5 |
| 7 | `ObjetivoDetalle` e `ObjetivoInfo` (US4) | 4 |
| 8 | `ObjetivoForm`: alta VP RRII y otra VP (US1, US2) | 2, 4 |
| 9 | `ObjetivoForm`: edición (US5) | 7, 8 |
| 10 | Validación con [quickstart.md](./quickstart.md) | 6, 9 |

## Complexity Tracking

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|-----------|----------------------|-------------------------------------------|
| Bloque "Objetivos de otras VP" y selector "Objetivos del VP / Todos", sin referencia en el prototipo (principio II) | Pedidos en la spec (FR-022, FR-024), aprobados en Clarifications. Se arman con `Tabs`, `Surface` y `Table` del DS. | Seguir el prototipo: los objetivos de otras VP quedarían sin acceso. |
| Lista de objetivos en el detalle de palanca (principio II) | Pedida por RF-02; la 002 la dejó fuera. Se reutiliza `Table` y `Surface`. | — |
| Ampliar `PalancaBreadcrumb` (principio IV) | FR-027 exige el mismo componente de migas. | Crear otro componente: duplica código y contradice la spec. |
| Cambios en `core` (`Constants.ts`, `Objetivo.ts`, hooks) (principio IV) | `VP_RRII_NOMBRE` lo usan varias pantallas y los mocks; `Estado` suma "No iniciada" (P1); `Title` es necesario para la lista legible (FR-018); los mocks los exige el principio III. | Constante local en cada pantalla: la duplicaría. |
| Error de las fechas con texto propio bajo `Picker` (aproximación A2) | `Picker` no admite `errorMessage` y FR-005/FR-012 piden el error en el campo. | `Input type="date"`: no es la pieza de fecha del DS. |
