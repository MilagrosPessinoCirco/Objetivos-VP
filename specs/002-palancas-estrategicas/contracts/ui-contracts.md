# Contratos de interfaz: Palancas estratégicas

Contratos internos entre las pantallas, la navegación y la capa de datos. No hay APIs públicas nuevas.

## 1. Navegación (router de `react-router-dom`, research D8)

`HashRouter` y `Routes` ya están en `ObjetivosVp.tsx` (merge de la rama `Router`). Las rutas de palancas usan constantes de `components/ObjetivosVp/routes.ts`:

```ts
export const HOME_PATH = '/';
export const PALANCAS_PATH = '/palanca';
export const PALANCA_DETAIL_PATH = '/palanca/:id';          // patrón de la ruta
export const getPalancaPath = (id: number): string => `${PALANCAS_PATH}/${id}`;
```

| Ruta | Elemento | Cambio respecto de la rama `Router` |
|---|---|---|
| `HOME_PATH` | `<Home />` | — |
| `PALANCAS_PATH` | `<Palancas canManage />` | Reemplaza la pantalla provisoria "Palanca: Bandeja". |
| `PALANCA_DETAIL_PATH` | `<PalancaDetalle canManage />` | Reemplaza la pantalla provisoria "Palanca: Detalle". |
| `/palanca/new`, `/palanca/edit/:id` | — | **Se quitan**: el formulario es un modal. |
| Rutas de objetivo, iniciativa y tarea | — | **Se quitan** completas, con sus comentarios y textos fijos. Cada feature agrega la suya. |

- Se navega con `useNavigate()` de `react-router-dom`. Nunca con `window.location`, `history.pushState` ni `Utils.openInSelfTab`/`openInNewTab`.
- `canManage` se pasa en `true` desde las rutas (research D9).

| Desde | Acción | `navigate(…)` |
|---|---|---|
| Home | acceso "Palancas y objetivos" (el único que navega) | `PALANCAS_PATH` |
| Grilla | "Volver" | `HOME_PATH` |
| Grilla | "Ver palanca" en una fila | `getPalancaPath(id)` |
| Detalle | miga "Inicio" | `HOME_PATH` |
| Detalle | miga "Palancas", "Volver" o "Cancelar" | `PALANCAS_PATH` |

Detalle: lee `id` con `useParams<{ id: string }>()` y lo convierte con `Number()`. Si el resultado no es un entero positivo, muestra "No se encontró la palanca." sin consultar la lista.

## 2. Props de las piezas

```ts
// Home: vuelve a los cinco accesos de la spec 001; solo "Palancas y objetivos" recibe onClick
interface IAccessButtonProps {
	title: string;
	iconName: FigmaIconName;
	backgroundColor: string;
	textColor: string;
	onClick?: () => void;   // vuelve a ser opcional (la rama Router lo hizo obligatorio); sin onClick el acceso no tiene acción
}
// AccessList: cada ítem tiene una ruta opcional (`route?: string`); solo "Palancas y objetivos" la tiene (PALANCAS_PATH).
// Home no cambia sus props.

// Grilla (ruta PALANCAS_PATH)
interface IPalancasProps {
	canManage: boolean;
}

// Detalle (ruta PALANCA_DETAIL_PATH; el Id sale de useParams)
interface IPalancaDetalleProps {
	canManage: boolean;
}

// Migas del detalle
interface IPalancaBreadcrumbProps {
	palancaNombre: string;
}

// Formulario (alta y edición), compartido por grilla y detalle
interface IPalancaFormProps {
	palanca?: Palanca;                         // sin palanca = alta
	onSave: (palanca: Palanca) => Promise<void>; // rechaza si falla el guardado
	onCancel: () => void;
}
```

Reglas del formulario:

- Al guardar valida Nombre y Descripción (`trim()` no vacío). Si falta alguno, muestra el error en línea y no llama a `onSave`.
- Arma una `Palanca` con `Id` (solo en edición), `Nombre` y `Descripcion` recortados y `Activa`, y llama a `onSave`.
- Mientras `onSave` está pendiente, deshabilita "Guardar" para evitar dobles envíos.
- Si `onSave` rechaza, el formulario sigue abierto con los datos ingresados y muestra "No se pudo guardar la palanca." (FR-016).
- Si `onSave` resuelve, la pantalla que lo abrió cierra el formulario y muestra el aviso de éxito.

## 3. Capa de datos

Las pantallas usan solo `usePalancaDataSource()` (`src/core/api/Palanca/usePalancaDataSource.ts`), que devuelve:

```ts
[state, getItems, addItem, editItem, deleteItem, getById]
// state: { items: Palanca[]; item?: Palanca; isLoading: boolean; error: boolean }
```

| Uso | Pantalla | Comportamiento tras el cambio de research D4 |
|---|---|---|
| `getItems()` | Grilla, al montar y con "Actualizar" | No relanza; si falla, `state.error = true` y `isLoading = false`. |
| `addItem(p)` | Grilla | Relanza el error y deja `error = true`, `isLoading = false`. |
| `editItem(p)` | Grilla y detalle | **Relanza** el error (cambio) y deja `error = true`, `isLoading = false`. |
| `getById(id)` | Detalle, al montar | **Relanza** el error (cambio) y deja `error = true`, `isLoading = false`. |
| `deleteItem` | — | No se usa (FR-015). |

- `usePalancaDataSource` pasa `new PalancaMock()` como mock: fuera de un entorno SharePoint (pruebas sin conexión) se usan los datos en memoria. En el workbench hospedado se usa la lista real.
- Detalle: si `getById` falla con estado HTTP 404, muestra "No se encontró la palanca."; con cualquier otro error, "No se pudo cargar la palanca.". En ambos casos el usuario puede volver con las migas o "Volver".

## 4. Textos (`loc/mystrings.d.ts` y `loc/en-us.js`)

Claves de la home (research D8): se restaura `AccessLeversObjectives` = "Palancas y objetivos" y se quitan `AccessLevers` y `AccessObjectives`, que agregó la rama `Router` y quedan sin uso.

Claves nuevas, en los dos archivos y en el mismo orden. Los valores salen del prototipo salvo los marcados como definidos en la spec o en el plan.

| Clave | Valor | Origen |
|---|---|---|
| `Back` | Volver | prototipo |
| `Cancel` | Cancelar | prototipo |
| `Save` | Guardar | prototipo |
| `Edit` | Editar | prototipo |
| `Yes` | Sí | prototipo |
| `No` | No | prototipo |
| `RequiredField` | Este campo es obligatorio. | prototipo |
| `PalancasTitle` | Galería de palancas estratégicas | prototipo |
| `PalancasSearchPlaceholder` | Buscar palanca | spec (FR-004) |
| `PalancasRefresh` | Actualizar | prototipo |
| `PalancaNew` | Nueva palanca | prototipo |
| `PalancaColumnId` | ID | prototipo |
| `PalancaColumnName` | Palanca | prototipo |
| `PalancaColumnDescription` | Descripción | prototipo |
| `PalancaColumnActions` | Acciones | prototipo |
| `PalancaEditTooltip` | Editar palanca | prototipo |
| `PalancaEditAriaLabel` | Editar palanca {0} | prototipo |
| `PalancaViewTooltip` | Ver palanca | prototipo |
| `PalancaViewAriaLabel` | Abrir palanca {0} | prototipo |
| `PalancasEmpty` | No hay palancas cargadas. | spec (FR-004a) |
| `PalancasEmptySearch` | No hay palancas con esta búsqueda. | spec (FR-004a) |
| `PalancasLoadError` | No se pudieron cargar las palancas. | plan |
| `BreadcrumbHome` | Inicio | spec (FR-006) |
| `BreadcrumbPalancas` | Palancas | spec (FR-006) |
| `BreadcrumbAriaLabel` | Ubicación en la estrategia | prototipo |
| `PalancaDetailTitle` | {0} · {1} | prototipo |
| `PalancaGeneralInfo` | Información general | prototipo |
| `PalancaFieldId` | ID | prototipo |
| `PalancaFieldName` | Palanca | prototipo |
| `PalancaFieldActive` | Activa | prototipo |
| `PalancaFieldDescription` | Descripción | prototipo |
| `PalancaActiveChip` | Activa | prototipo |
| `PalancaInactiveChip` | Inactiva | prototipo |
| `PalancaNotFound` | No se encontró la palanca. | plan (edge case de la spec) |
| `PalancaLoadError` | No se pudo cargar la palanca. | plan |
| `PalancaFormNewTitle` | Nueva palanca | prototipo |
| `PalancaFormEditTitle` | Editar palanca {0} | prototipo |
| `PalancaFormNote` | Las palancas no se eliminan: se marcan como inactivas. | prototipo |
| `PalancaFormName` | Nombre | prototipo |
| `PalancaFormDescription` | Descripción | prototipo |
| `PalancaFormActive` | Activa | prototipo |
| `PalancaSaveError` | No se pudo guardar la palanca. | plan |
| `PalancaCreated` | La palanca "{0}" se ha cargado correctamente. | prototipo |
| `PalancaUpdated` | La palanca "{0}" se ha actualizado correctamente. | prototipo |

Los textos definidos en el plan son de una sola línea, sin ayudas adicionales. Los marcadores `{0}` y `{1}` se reemplazan con `Utils.replaceAll` (research D10).
