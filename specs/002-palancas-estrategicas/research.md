# Research: Palancas estratégicas (ABM y vista)

No quedan `NEEDS CLARIFICATION`. Las cuatro consultas técnicas (C1–C4) se resolvieron con la usuaria el 2026-11-11. Este documento registra qué se verificó en el repo y qué se decidió.

## Decisiones

### D1. Capa de datos: reutilizar `PalancaDataSource`

- **Decisión**: usar la entidad `src/core/entities/Palanca.ts` y el datasource `src/core/api/Palanca/` existentes (generados con la skill `data-source`), a través de `usePalancaDataSource`.
- **Motivo**: ya cubren lectura, alta, edición y lectura por Id sobre la lista `Lista.Palanca` (`src/core/utils/Constants.ts`), con los internal names `Nombre`, `Descripcion` y `Activa` confirmados al generarlos. No se duplica nada.
- **Alternativas**: un servicio nuevo (descartada: duplicaría el existente).

### D2. Mock de palancas (principio III)

- **Decisión**: agregar `src/core/api/Palanca/PalancaMock.ts`, que implementa `IPalancaDataSource` en memoria, y pasarlo como segundo argumento en `usePalancaDataSource`.
- **Motivo**: la constitución exige un mock por servicio. `useDatasource` ya elige el mock cuando la app no corre en SharePoint (workbench local); hoy, sin mock, el hook lanza `Datasource o mock no validos.` fuera de SharePoint.
- **Datos**: las cinco palancas del prototipo (`index.html`, `D.pals`), cuatro activas y una inactiva (`Eficiencia en el canal`), para poder probar el filtro de activas.
- **Estado compartido**: el arreglo vive a nivel de módulo, de modo que la grilla y el detalle ven los mismos cambios durante la sesión. Se reinicia al recargar, como el prototipo.
- **Patrón**: igual que `ItemMock.ts` (promesas resueltas, sin dependencias).

### D3. Palancas activas: filtro en la pantalla

- **Decisión**: la grilla llama a `getItems()` del hook y muestra solo las palancas con `Activa === true`.
- **Motivo**: `useDatasource` solo expone `getItems`; `getActiveItems()` existe en el datasource pero no en el hook. Con decenas de palancas (RNF-04), filtrar en la pantalla es lo más simple, y además permite que una palanca inactivada desde la grilla desaparezca sin volver a consultar la lista.
- **Alternativas**: exponer `getActiveItems` en el hook (descartada: cambia el contrato genérico `DatasourceHook` para un solo caso). `getActiveItems()` queda sin uso; no se elimina porque es código existente.

### D4. Errores de `useDatasource` (C2)

- **Problema verificado**: en `src/core/api/useDatasource.ts`, `editItem` y `getById` pasan por `handleAsync`, que atrapa el error, lo registra y marca `error: true`, sin relanzarlo. La pantalla no puede distinguir un guardado exitoso de uno fallido y mostraría un éxito falso (contradice FR-016). Además, el reductor `ERROR` no apaga `isLoading`, así que el indicador de carga quedaría encendido después de un fallo; y `addItem`, que sí relanza, no despacha `ERROR`.
- **Decisión (C2)**: `editItem` y `getById` relanzan el error, igual que `addItem`, además de marcarlo en el estado. Para que el estado quede coherente, en el mismo cambio:
  - el reductor `ERROR` pasa `isLoading` a `false`;
  - `addItem` despacha `ERROR` antes de relanzar.
  `getItems` y `deleteItem` no cambian: la grilla informa los errores de carga con `state.error`.
- **Registro**: el cambio se anota en un archivo nuevo, `docs/plantilla-cambios.md`, con el mismo formato que `docs/design-system-cambios.md`, para reaplicarlo si se actualiza la plantilla SPFx.
- **Impacto**: ninguna pantalla consume hoy `useDatasource` (verificado con búsqueda en `src`), así que el cambio no rompe consumidores. Las futuras pantallas deben atrapar el error de `editItem` y `getById`.
- **Alternativas**: un hook propio de la pantalla (descartada: duplica el estado del hook compartido); deducir el fallo de `state.error` (descartada: frágil).

### D5. Title de la lista (C4)

- **Decisión (C4)**: `Palanca.toListItem()` envía `Title` con el valor de `Nombre`, al crear y al editar.
- **Motivo**: la app no tiene campo título; si `Title` fuera obligatoria en la lista, el alta fallaría. Además deja legible la lista en SharePoint, donde se reactivan las palancas inactivas (spec, aclaración P1-A).
- **Patrón**: se aplica también a las demás entidades con campo nombre cuando sus features lo implementen.

### D6. Formato del ID (C3)

- **Decisión (C3)**: el ID se muestra como `PAL-<Id>` (ej.: `PAL-3`), como en el prototipo, en la grilla, el título del detalle, el formulario ("Editar palanca PAL-3") y las etiquetas accesibles. La búsqueda compara contra ese texto, así que "PAL-3", "pal-3" y "3" encuentran la palanca 3.
- **Ubicación**: una función local de presentación, `formatPalancaId`, en la carpeta de la pantalla de la grilla, importada por el detalle y el formulario. No es un dato de dominio ni una constante transversal.

### D7. Migas de pan (C1)

- **Decisión (C1)**: `Breadcrumb` de Fluent UI v8 (`@fluentui/react`, ya instalado), estilado con tokens del Design System mediante `styles`. Excepción aprobada, como `AccessButton` en la feature 001.
- **Motivo**: el Design System no tiene breadcrumb ni link. `Breadcrumb` resuelve links, separadores, nivel actual (`isCurrentItem`) y accesibilidad sin código propio.
- **Alternativas**: botones del DS (descartada: se ven como botones); agregar el componente al DS (descartada: modifica `core/ui`).

### D8. Navegación entre pantallas: router de la rama `Router`

- **Contexto**: la rama `Router` (commit `81ed85f`, de otro integrante del equipo) se mergeó en `002-palancas-estrategicas` (commit `ce61724`) por pedido de la usuaria. Agrega `react-router-dom 6.30.6` (en `package.json` y `package-lock.json`; compatible con React 17, cuyo `peerDependency` es `>=16.8`) y define en `ObjetivosVp.tsx` un `HashRouter` con `Routes` y pantallas provisorias por entidad.
- **Decisión**: usar ese router con dos rutas de palancas:
  - `/palanca`: grilla (`Palancas`);
  - `/palanca/:id`: detalle (`PalancaDetalle`), que lee el Id con `useParams`.
  Las rutas `/palanca/new` y `/palanca/edit/:id` de la rama se **quitan**, porque el formulario es un modal sobre la grilla o el detalle, como el prototipo (decisión de la usuaria).
- **Navegación**: con `useNavigate` de `react-router-dom`, la API del router, como pide la regla de seguridad para rutas administradas por un router. No se usan `Utils.openInSelfTab`/`openInNewTab`, que son para documentos y enlaces.
- **Rutas en un único lugar**: `components/ObjetivosVp/routes.ts` define `HOME_PATH`, `PALANCAS_PATH` y `getPalancaPath(id)`. Lo usan las rutas, la home, la grilla, el detalle y las migas, para no repetir textos de ruta. Las rutas de las demás entidades quedan como están en la rama (fuera de alcance).
- **"Volver"**: en la grilla va a `HOME_PATH` y en el detalle a `PALANCAS_PATH`. Son destinos fijos, no `navigate(-1)`, porque el detalle también se puede abrir con un enlace directo (`#/palanca/3`) y "atrás" saldría de la app.
- **Id inválido** (por ejemplo `#/palanca/abc`): el detalle muestra "No se encontró la palanca." sin consultar la lista.
- **Home**: la rama cambió la home a cuatro accesos que navegan todos. La usuaria decidió que vale la spec de la 001: se vuelven a los cinco accesos ("Mis tareas", "Mis iniciativas", "Palancas y objetivos", "Tablero VP", "ABM", con sus íconos y colores aprobados) y solo "Palancas y objetivos" navega, a `PALANCAS_PATH`. `AccessButton.onClick` vuelve a ser opcional. En `loc/` se restaura `AccessLeversObjectives` y se quitan `AccessLevers` y `AccessObjectives`, que la rama agregó y quedan sin uso.
- **`.vscode/launch.json`**: el merge conserva la versión de 002, porque la rama versionaba URLs de un tenant, algo que el repo no permite.

### D8b. Enlace directo a una palanca inactiva (aprobado por la usuaria)

Con el router, el detalle se puede abrir escribiendo la URL (`#/palanca/<Id>`), también para una palanca inactiva. La spec (aclaración P1-A) dice que la app no ofrece forma de llegar a una inactiva: la grilla y la búsqueda no la muestran y ningún elemento de la interfaz lleva a ella. El enlace escrito a mano no es un camino que ofrezca la interfaz, así que el detalle se muestra igual, con el chip "Inactiva". No se oculta nada, porque toda la VP ve toda la información (RF-19).

### D9. Preparación para permisos (FR-018)

- **Decisión**: las pantallas reciben una prop `canManage: boolean` que controla "Nueva palanca", "Editar palanca" y "Editar". `ObjetivosVp.tsx` la pasa en `true`. RF-19 solo tendrá que calcularla.
- **Motivo**: deja las tres acciones identificadas en un único punto, sin rehacer las pantallas.

### D10. Textos con datos

- **Decisión**: los textos con un valor variable (mensajes de éxito, título del formulario, etiquetas accesibles) usan el marcador `{0}` en `loc/en-us.js` y se completan con `Utils.replaceAll` (existente en `src/core/utils/Utils.ts`).

## Verificaciones en el repo

| Qué | Resultado |
|-----|-----------|
| Entidad `Palanca` | `Nombre`, `Descripcion`, `Activa` (boolean), más `Created`, `Modified`, `Author`, `Editor`. `toListItem` hereda `Title: this.Titulo` de `BaseEntity` (vacío). |
| Datasource | `getItems` ordena por `Nombre` ascendente; `getActiveItems` filtra `Activa eq 1`; `add` y `edit` devuelven la palanca releída con `getById`. Tiene `delete` porque lo exige `IDatasource`; la UI no lo usa (FR-015). |
| Hooks | `usePalancaDataSource` y `useItemPalancaDataSource` son equivalentes y ninguno pasa mock. Se usa `usePalancaDataSource`; el otro no se toca. |
| Consumidores de `useDatasource` | Ninguno en `src/webparts` (también después del merge de `Router`). |
| Router | `HashRouter` de `react-router-dom 6.30.6`, mergeado desde la rama `Router` (ver D8). Antes del merge no había. |
| Localización | Un solo archivo de idioma, `loc/en-us.js` (con textos en español), y su contrato `loc/mystrings.d.ts`. |
| Design System | `Table` (con `render` por columna y `emptyText`), `SearchBox`, `Button` (incluye `iconOnly`), `Tooltip`, `Modal` (`oneSlot`), `Input`, `Multiline`, `Dropdown`, `Chip`, `Surface`, `Spinner`, `MessageBar`, `Toast`. No hay breadcrumb ni link. |
| `TableFilters` | No sirve para el encabezado de la grilla: siempre muestra un ícono de información y un botón "Filtrar" (fuera de alcance), y rotula "Recargar" en vez de "Actualizar". |
| `Modal` | Con `variant="oneSlot"` muestra título, descripción, contenido y acciones. Requiere pasar `primaryAction` y `secondaryAction` (si no, muestra "Send" y "Don't send"). |
| Prototipo | Botones del formulario "Cancelar" y "Guardar"; error de obligatorio "Este campo es obligatorio."; aviso de éxito durante 7 s; migas del detalle de objetivo con separador "›" y el nivel actual en negrita, arriba del encabezado. |
| Pruebas | No hay runner de pruebas declarado; la validación es `npm run build` (= `npm run lint && heft build --clean`). |

## Restos de la feature 001 (resueltos)

- `components/Home/Home/`, una copia anidada de la Home con imports rotos que hacía fallar la compilación con 13 errores, la eliminó el merge de la rama `Router`. Ese merge también pasó a la Home real el contenedor de página de la copia.
- T000 (commit `8ebcbd1`) eliminó `assets/assets/backgroundHome.png`, idéntica a `assets/backgroundHome.png` (la que usa `WelcomeCard`), y la entrada vacía y no versionada `srcwebpartsobjetivosVpassets` de la raíz.
- Después del merge y de T000, `npm run build` pasa sin errores.

## Abierto

Nada.
