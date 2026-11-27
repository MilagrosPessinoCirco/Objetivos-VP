# Implementation Plan: Ubicación en la estrategia

**Branch**: `009-ubicacion-en-la-estrategia` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-ubicacion-en-la-estrategia/spec.md`. Modifica los headers de los detalles de las features 002, 003, 004 y 007. No agrega rutas ni datos.

## Summary

El botón "Ubicación en la estrategia" se activa en los cuatro detalles. Hoy `LocationButton` se renderiza en Palanca y Objetivo sin `onClick`, y en Iniciativa y Tarea no aparece. El botón abre un panel de solo lectura con el linaje de la entidad actual.

Lo arma un único componente compartido, `UbicacionEstrategia`, que reúne botón, panel y datos. Los datos se cargan con un hook en `core/api` que consulta al abrir el panel por primera vez, conserva el resultado mientras la vista está montada y obtiene los hijos por lotes (sin N+1).

## Technical Context

**Language/Version**: TypeScript `~5.8.0` (`@microsoft/spfx-web-build-rig`).

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`, Fluent UI v8, PnPjs `@pnp/sp 4.18.0`, `react-router-dom 6.30.6`. No se agregan dependencias.

**Storage**: se leen las listas Palanca, Objetivo, Iniciativa y Tarea. **Sin cambios en listas ni columnas de SharePoint.**

**Testing**: no hay runner de pruebas. Validación: `npm run build` (principio V) y los escenarios manuales de la sección Verificación, con mocks y en el workbench del sitio de desarrollo.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft).

**Performance Goals**: contenido del panel en menos de 3 s (RNF-05); de 3 a 4 consultas por vista más los lotes, y reapertura sin consultas.

**Constraints**: `src/core/ui` de solo lectura, salvo el ícono de D3; sin colores, tipografías ni espaciados fuera del DS; textos en `loc/`; mensajes de error y estados vacíos de una línea.

**Scale/Scope**: 1 componente compartido con 2 subcomponentes, 1 hook de datos, 2 métodos nuevos en datasources (con sus mocks), 1 ícono nuevo en el DS y 4 vistas integradas.

## Hallazgos del repo

- **Vistas.**
  - `Palanca/PalancaDetalle/PalancaDetalle.tsx` (header 159–175) y `Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx` (125–149) ya renderizan `<LocationButton/>`. En Objetivo está dentro de `.headerEnd`.
  - `Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` (188–212) no tiene el botón, y su `.headerEnd` solo existe cuando `isRrii && loaded`.
  - `Tarea/TareaDetalle/TareaDetalle.tsx` (174–196) tampoco tiene el botón.
  - El id sale de `useParams`.
- **Botón.** `shared/LocationButton/LocationButton.tsx`: DS `Button` primario, violeta Tertiary 600/700 por variables CSS, `FigmaIcon "chevronDown"` con `.whiteIcon`. Sin props.
- **Panel DS.** `core/ui/patterns/Panel` (Panel de Fluent v8) trae Esc, clic afuera, foco atrapado, `role=dialog`, pie fijo y cuerpo con scroll. `shared/panelTitle.tsx` `buildPanelTitle` agrega el subtítulo. Patrón de panel de solo lectura: `Tarea/TareaHistorialPanel`, con `primaryAction` "Cerrar" `secondary` y `secondaryAction={<></>}`.
- **Faltantes en el DS.** No hay Link, Skeleton, timeline ni ícono de doble chevron.
- **Datos.** Las relaciones son lookups: `Objetivo.Palanca`, `Iniciativa.Objetivo` y `Tarea.Iniciativa`, todos `ILookupValue {Id, Title}` con Title = Nombre. Los hijos se obtienen con `getFilteredItems(parentId)` (`eq`). No hay filtros por varios ids, ni batching, ni cache.
- **IDs.** `formatPalancaId`, `formatObjetivoId`, `formatIniciativaId`, `formatTareaId`; `formatIdNombre` arma "ID · Nombre".
- **VP.** Las vistas de Objetivo, Iniciativa y Tarea ya tienen el objetivo resuelto con `useObjetivoNames` y usan `isVpRrii(objetivo.VP?.Title)`.
- **Objetivos de la palanca.** `PalancaDetalle.tsx:105`: `filterObjetivos(…, filtro).filter(o => o.Palanca?.Id === palancaId)`.
- **Navegación.** `ObjetivosVp/routes.ts` (`getXPath`). Convención: `navigate(path, { state: { from } })`.
- **Migas.** `PalancaBreadcrumb` solo muestra lo que recibe. No existe lógica de jerarquía compartida para reutilizar.

## Constitution Check

| Principio | Resultado |
|---|---|
| I. Plataforma | Cumple. Sin dependencias nuevas. |
| II. La interfaz no se inventa | **Desvíos registrados** (Complexity Tracking): el ícono nuevo en `core/ui`, registrado en `docs/design-system-cambios.md`; `Link` de Fluent v8 y el timeline con SCSS local, aprobados; "y N más" como acción en lugar de texto estático, pedido por la usuaria. |
| III. Datos desacoplados | Cumple. Los componentes usan el hook `core/api/UbicacionEstrategia`. Los métodos nuevos tienen mock. |
| IV. Simplicidad | Cumple. Un único componente para las 4 vistas, sin duplicar markup. |
| V. Validación | Cada tarea cierra con `npm run build`. |

## Interfaz y Design System

| Elemento | Origen | Componente |
|---|---|---|
| Botón "Ubicación en la estrategia" | Maqueta `.ubiBtn` | `LocationButton` existente (DS `Button` primario) + `FigmaIcon "chevronDoubleDown"` (nuevo, D3) |
| Panel lateral, X, pie fijo | Maqueta `aside.drawer.side` | DS `Panel` + `buildPanelTitle` |
| "Cerrar" | Maqueta `.fb.fbOut` | DS `Button variant="secondary"` |
| Carga | Spec | DS `Spinner` |
| Error + Reintentar | Spec | DS `MessageBar type="error"` con acción, patrón de `TareaDetalle` |
| Línea y nodos del timeline | Maqueta `.ubi`, `.ubiDot` | **Sin componente DS**: markup y SCSS local con `getColorStep` (D4) |
| Ítems con link, "y N más" / "Ver menos" | Maqueta `.ubiL`, `.ubiMore` | **Sin componente DS**: `Link` de Fluent v8 (D4) |
| Texto vacío | Maqueta "Sin elementos cargados" | Texto, Neutral 600, `typography.size[12]` |

**Colores** (`getColorStep`): línea y borde del nodo actual Primary 800; nodo relleno Primary 100; links Primary 500; ítem actual Primary 800 en negrita; labels de nivel y texto vacío Neutral 600.

## Decisiones

- **D1 Otra VP.** Cuando el objetivo no es de la VP RRII, el primer nivel es "Otra VP" con el nombre de la VP, sin link, como en la maqueta (2277). La vista pasa `otraVp` porque ya lo resuelve con `isVpRrii`; en ese caso el hook no consulta la palanca.
- **D2 Objetivos de la palanca.** Son los mismos que lista `PalancaDetalle`. La vista pasa `filtrarObjetivos = (o) => filterObjetivos(o, filtro)`.
- **D3 Ícono.** Se agrega `chevronDoubleDown` a `generalIcons` en `core/ui/foundations/icons/iconRegistry.ts`, con el asset `assets/general/chevron-double-down.svg` (16×16, trazo `#0D0D0D` como los demás, path de la maqueta `M7 6l5 5 5-5M7 13l5 5 5-5` escalado). Se registra en `docs/design-system-cambios.md` y en la lista de `generalIcons` de `docs/design-system-catalog.md`.
- **D4 Sin componente DS.** Se usan `Link` de Fluent v8 (`@fluentui/react`), con el precedente de `PalancaBreadcrumb`, y el timeline con SCSS local. Aprobado por la usuaria el 2026-11-25.
- **D5 Botón.** Se reutiliza `LocationButton` con una prop nueva `onClick`.
- **D6 Nombres.** Se usan nombres en español, siguiendo la convención del webpart: `UbicacionEstrategia`, `UbicacionEstrategiaPanel` y `UbicacionNivel`.
- **D7 Carga.** `useUbicacionEstrategia(tipo, id, { enabled, filtrarObjetivos, omitirPalanca })` vive en `src/core/api/UbicacionEstrategia/` y elige datasource o mock como `useTareasIniciativa`. Es lazy: la primera consulta ocurre con `enabled === true`. Guarda el resultado con la clave `${tipo}-${id}`; si la clave cambia, lo descarta. El estado lo conserva `UbicacionEstrategia`, que vive mientras la vista está montada. Los niveles se ordenan por `Id` ascendente. Consultas:

  | Vista | Consultas |
  |---|---|
  | Tarea | `getById(tarea)`, luego `getById(iniciativa)`, luego `getById(objetivo)`. La palanca sale de `Objetivo.Palanca`. Total: 3. |
  | Iniciativa | `getById(iniciativa)` en paralelo con `Tarea.getFilteredItems(id)`, luego `getById(objetivo)`. Total: 3. |
  | Objetivo | `getById(objetivo)` en paralelo con `Iniciativa.getFilteredItems(id)`, luego `Tarea.getItemsByIniciativaIds(ids)`. Total: 3. |
  | Palanca | `getById(palanca)` en paralelo con `Objetivo.getFilteredItems(id)`, luego `filtrarObjetivos`, luego `Iniciativa.getItemsByObjetivoIds`, luego `Tarea.getItemsByIniciativaIds`. Total: 4. |

- **D8 Lotes.** `getItemsByObjetivoIds(ids)` y `getItemsByIniciativaIds(ids)` arman `(XId eq a or XId eq b …)` en chunks de 40 ids (constante con nombre), ejecutados con `Promise.all`. Con 0 ids devuelven `[]` sin hacer la consulta. Reutilizan `selectProperties` y `expand`. El mock filtra en memoria.
- **D9 Navegación.** Los links usan `useNavigate` con `{ state: { from: location.pathname + location.search } }` para que Volver funcione, y cierran el panel antes de navegar. No se usa `Utils.openIn*` porque es navegación interna de la SPA.
- **D10 Estado expandido.** Cada `UbicacionNivel` guarda su estado expandido localmente. El panel se monta solo cuando está abierto (como `TareaHistorialPanel`), así que al cerrarlo el estado se reinicia.
- **D11 Strings** (en `mystrings.d.ts` y `en-us.js`):
  - `UbicacionTitulo` "Ubicación en la estrategia"
  - `UbicacionSubtitulo` "{0} · recorrido desde la palanca hasta las tareas"
  - `UbicacionNivelPalanca` "Palanca estratégica ({0})"
  - `UbicacionNivelOtraVp` "Otra VP"
  - `UbicacionNivelObjetivo` "Objetivo ({0})"
  - `UbicacionNivelIniciativas` "Iniciativas ({0})"
  - `UbicacionNivelTareas` "Tareas ({0})"
  - `UbicacionVerMas` "y {0} más"
  - `UbicacionVerMenos` "Ver menos"
  - `UbicacionVacio` "Sin elementos cargados"
  - `UbicacionCerrar` "Cerrar"
  - `UbicacionErrorCarga` "No se pudo cargar la ubicación en la estrategia."
  - `UbicacionReintentar` "Reintentar"
- **D12 Accesibilidad.** Los nodos del timeline son decorativos (`aria-hidden`). Cada nivel es un grupo con su label y una `<ul>` de ítems. El toggle es un `Link` (renderizado como `button`) con `aria-expanded`.

## Estructura de carpetas

```text
src/core/api/
├── Iniciativa/{IIniciativaDataSource,IniciativaDataSource,IniciativaMock}.ts   # + getItemsByObjetivoIds
├── Tarea/{ITareaDataSource,TareaDataSource,TareaMock}.ts                       # + getItemsByIniciativaIds
└── UbicacionEstrategia/useUbicacionEstrategia.ts                              # nuevo (D7)
src/core/ui/foundations/icons/
├── iconRegistry.ts                                                            # + chevronDoubleDown (D3)
└── assets/general/chevron-double-down.svg                                     # nuevo
src/webparts/objetivosVp/
├── loc/{mystrings.d.ts,en-us.js}                                              # D11
└── components/
    ├── shared/LocationButton/LocationButton.tsx                               # onClick + ícono
    ├── shared/UbicacionEstrategia/
    │   ├── UbicacionEstrategia.tsx                                            # botón + estado open + hook
    │   ├── ubicacionUtils.ts                                                  # buildNiveles
    │   ├── UbicacionEstrategiaPanel/UbicacionEstrategiaPanel.{tsx,module.scss}
    │   └── UbicacionNivel/UbicacionNivel.{tsx,module.scss}
    ├── Palanca/PalancaDetalle/PalancaDetalle.tsx                              # integra
    ├── Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx                           # integra
    ├── Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx                     # integra, .headerEnd siempre
    └── Tarea/TareaDetalle/TareaDetalle.tsx                                    # integra
docs/design-system-cambios.md, docs/design-system-catalog.md                   # D3
```

## Orden de implementación

Ícono y botón → datasources → hook → strings → utilidades → nivel → panel y contenedor → integración en Palanca y Objetivo → integración en Iniciativa y Tarea → validación. El detalle está en `tasks.md`.

## Verificación

- `npm run build` después de cada tarea.
- Con mocks (`npm start`) y en el workbench del sitio de desarrollo:
  - escenarios 1–14 de la spec en las cuatro vistas;
  - otra VP;
  - niveles en (0);
  - expandir y colapsar por nivel, y reinicio al cerrar;
  - scroll con el pie fijo;
  - X, Cerrar, Esc y clic afuera;
  - foco atrapado;
  - error y Reintentar;
  - en Network: reabrir no consulta, y la palanca no genera una consulta por ítem.

## Preguntas resueltas (2026-11-25)

1. Tareas canceladas e iniciativas finalizadas: se incluyen todas.
2. "Objetivo (n)" queda fijo, sin pluralizar (la maqueta pluraliza a "Objetivos").
3. `docs/especificacion-funcional.md` no se modifica; el cambio se declara en "Modifica" de la spec.

## Riesgos

- Si Iniciativa o Tarea superan los 5000 ítems, los filtros por lookup necesitan la columna indexada (`ObjetivoId`, `IniciativaId`). Hay que verificarlo en SharePoint; esta feature no lo cambia.
- El ancho del Panel DS (583px) difiere del de la maqueta (480px). Se acepta el del DS.
- `docs/design-system-cambios.md` tiene la primera fila pegada al separador de la tabla. El error es preexistente; la fila nueva se agrega en su propia línea sin tocar la existente.

## Prerrequisitos de SharePoint (a cargo de la usuaria)

Ninguno. No hay listas, columnas ni permisos nuevos.

## Complexity Tracking

| Desvío | Motivo | Alternativa descartada |
|---|---|---|
| Ícono `chevronDoubleDown` agregado a `src/core/ui` (registrado en `docs/design-system-cambios.md`) | La maqueta y el pedido usan doble chevron y el registro no lo tiene; aprobado (D3) | Ícono de fuente de Fluent; mantener el chevron simple |
| `Link` de Fluent v8 usado directamente | El catálogo no tiene link; aprobado (D4), con el precedente de `PalancaBreadcrumb` | `Button` del DS (no se ve como link) |
| Timeline con markup y SCSS local | El catálogo no tiene timeline; aprobado (D4) | Componente nuevo en `core/ui` |
| "y N más" como acción que despliega | Pedido de la usuaria, distinto de la maqueta | Texto estático |
| Métodos nuevos en `IIniciativaDataSource` y `ITareaDataSource` | Evitar N+1 al cargar los hijos de varios padres (FR-014) | Una consulta por padre; traer la lista completa y filtrar en memoria |
