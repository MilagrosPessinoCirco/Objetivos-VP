# Research: Objetivos

Resuelve las consultas del plan contra el repo. Los dos pendientes de datos (P1 y P2) se resolvieron por decisión de la usuaria.

## Verificaciones en el repo

| # | Consulta | Resultado |
|---|----------|-----------|
| R1 | Datos existentes | `core/entities` y `core/api` ya tienen `Objetivo`, `Vicepresidencia`, `Departamento`, `Gerencia` y `Palanca`, con datasource, interfaz y dos hooks cada uno (`use<E>DataSource`, `useItem<E>DataSource`). Solo `Palanca` tiene mock. |
| R2 | Hook genérico | `useDatasource` devuelve `[state, getItems, addItem, editItem, deleteItem, getById]`. No expone `getFilteredItems`. `addItem` y `editItem` relanzan el error (cambio de la 002, registrado en `docs/plantilla-cambios.md`). |
| R3 | `ObjetivoDataSource` | Selecciona `Palanca`, `VP`, `Departamento` y `Gerencia` como lookups (`Id`, `Title`). `getItems` no ordena. |
| R4 | `GerenciaDataSource` | Expande `Departamento`, así que cada gerencia trae `Departamento.Id`: alcanza para filtrar en pantalla. |
| R5 | `Vicepresidencia` | Campos `Nombre` y `Activo`. Sin campo que marque a la VP RRII. |
| R6 | Estado | `Constants.Estado` = En curso / Finalizado cumplido / Finalizado incumplido. RF-03 pedía No iniciada / En curso / Finalizada. Se sigue el código y se suma "No iniciada" (P1). |
| R7 | Duración | `Constants.Duracion` = Anual / Plurianual / Permanente: coincide con la spec. |
| R8 | `CantidadAnios` | Existe en entidad, datasource y lista. La spec no lo incluye: no se muestra ni se envía. |
| R9 | Title | `Objetivo.toListItem` no lo envía. `Palanca.toListItem` ya lo hace con `Title: this.Nombre`. |
| R10 | Router | `HashRouter`, `routes.ts` con `HOME_PATH`, `PALANCAS_PATH`, `PALANCA_DETAIL_PATH`. `useSearchParams` y `useLocation` de `react-router-dom` 6.30 están disponibles. |
| R11 | Migas | `PalancaBreadcrumb` (`Breadcrumb` de Fluent v8, excepción aprobada en la 002) recibe `palancaNombre`. |
| R12 | `Tabs` y `Pivot` | Existen en `core/ui/patterns`. Ninguna pantalla los usa. |
| R13 | `Picker` | `mode="date"`, `value` y `onChange` en formato `AAAA-MM-DD`. No tiene `errorMessage`. |
| R14 | `SpinButton`, `Switch`, `Callout`, `Surface`, `Chip`, `Table` | Existen. `Callout` recibe `title`, `description` y `children`. `FigmaIcon` tiene `info`, `infoPrimary`, `add`, `edit`, `arrowForward` y `arrowCircle`. |
| R15 | Prototipo | `scr.form` es una pantalla con "Volver", título y secciones "Información general" y "Planificación (VP RRII)"; `scr.objetivo` tiene migas, encabezado, "Información del objetivo" y "Planificación". IDs `OBJ-01`. |
| R16 | "Cargar objetivo" | No existe en el código: la 002 lo excluyó (FR-020 de la 002). |
| R17 | Mock de objetivos | `D.objs` del prototipo tiene objetivos de la VP RRII y de otras VP para el mock. |

## Decisiones

Las decisiones D1 a D14 están en [plan.md](./plan.md#decisiones). Resumen de lo que se evaluó:

- **Servicios nuevos vs hooks existentes**: se descartan los servicios nuevos (duplicarían `core/api`).
- **VP RRII por Id vs por Nombre**: por `Nombre`. El Id cambia entre sitios y sería un identificador del tenant en el código; además el objetivo ya trae `VP.Title`.
- **Selector en `Tabs` vs `Pivot`**: `Tabs`, `variant="filled"`. Ninguna pantalla usa uno u otro, y `Tabs` ofrece la variante visual de botones, más cercana a dos opciones excluyentes arriba de una grilla.
- **Estado del selector**: en `ObjetivosVp.tsx` por props, no en un contexto ni en la URL: lo comparten solo dos pantallas hermanas y no hay otro consumidor.
- **Formulario como pantalla vs modal**: pantalla con ruta, porque así está en el prototipo (`scr.form`) y el formulario tiene secciones y muchos campos.
- **Filtrar en pantalla vs `getFilteredItems`**: en pantalla. Con decenas de objetivos es una sola consulta y los conteos y el bloque de otras VP necesitan todos los objetivos igual.

## Pendientes resueltos

- **P1. Valores de Estado (resuelto).** Se usan los de `Constants.Estado` más "No iniciada", que se agrega al enum (solo lo usa `Objetivo`). Valor inicial en el alta: "No iniciada". Agregar la opción en la columna `Estado` de SharePoint.
- **P2. Nombre de la VP RRII (resuelto).** "VP RRII", como el prototipo. Verificar en la lista `Vicepresidencia`.
