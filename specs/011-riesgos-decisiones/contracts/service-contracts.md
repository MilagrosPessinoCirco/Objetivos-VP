# Contratos de datos y servicio: Riesgos y decisiones

Contratos de `core/api`: cambios en los datasources, reglas puras, servicio, errores y hooks de lectura. El comportamiento detallado está en [plan.md](../plan.md#decisiones) y los datos en [data-model.md](../data-model.md). Son firmas y reglas, no implementación.

## 1. Cambios en `core`

### `entities/Decision.ts`

- Se quitan las propiedades `Responsable` y `FechaResolucion`, su lectura en `mapItem` y su envío en `toListItem`.
- `toListItem` envía `Id`, `Title` (`Titulo`), `DecisionNecesaria`, `RiesgoId` y `FechaLimite`. Un campo `undefined` no se envía; `null` vacía la columna.
- Sin otros cambios.

### `entities/Riesgo.ts`

Sin cambios. `toListItem` envía `TareaId`, `Estado` (siempre definido en los flujos de esta feature), `RequiereDecision`, `FechaResolucion` (`null` la vacía), `Descripcion`, `Id` y `Title`.

### `api/Decision/IDecisionDataSource.ts` y `DecisionDataSource.ts`

| Método | Cambio | Contrato |
|---|---|---|
| `select` | Se quitan `Responsable` y `FechaResolucion`. | — |
| `getFilteredItemsByRiesgos(riesgoIds: number[]): Promise<Decision[]>` | **Nuevo** | Con lista vacía devuelve `[]` sin consultar. Divide los Id en tandas de 40 y hace una consulta por tanda (`RiesgoId eq a or RiesgoId eq b …`). Devuelve la unión. Nunca una consulta por riesgo. |
| `getFilteredItems(riesgoId)`, `add`, `edit`, `delete`, `getById`, `getItems` | Sin cambios | `delete` solo lo usa el servicio para deshacer (D4). |

### `api/Riesgo/IRiesgoDataSource.ts` y `RiesgoDataSource.ts`

| Método | Cambio | Contrato |
|---|---|---|
| `getActivosEscaladosByTareas(tareaIds: number[]): Promise<Riesgo[]>` | **Nuevo** | Con lista vacía devuelve `[]` sin consultar. Una consulta: `(TareaId eq a or …) and Estado ne 'Resuelto'`, con `select` y `expand` iguales a los existentes. Hasta 10 Id (tope de tareas no canceladas de la 007). |
| `getFilteredItems(tareaId)`, `add`, `edit`, `delete`, `getById`, `getItems` | Sin cambios | — |

### Hooks existentes

`useRiesgoDataSource`, `useItemRiesgoDataSource`, `useDecisionDataSource` y `useItemDecisionDataSource` **no se tocan**.

## 2. Reglas puras (`api/Riesgo/riesgoReglas.ts`)

Sin acceso a datos ni a pantallas. Las usan el servicio y las pantallas.

| Función / constante | Contrato | Spec |
|---|---|---|
| `TRANSICIONES_RIESGO` | Activo → Escalado, Resuelto; Escalado → Resuelto; Resuelto → ninguno. | FR-004 |
| `getEstadosDisponibles(estado)` | El estado actual más los permitidos. Para Resuelto o no leído, `[]`. | FR-009 |
| `isTransicionPermitida(desde, hasta)` | Verdadero si `desde === hasta` (sin cambio) o está en la tabla. | FR-009 |
| `isRiesgoEditable(riesgo, tarea)` | Falso si el riesgo está Resuelto, su estado no se pudo leer o la tarea está Cancelada. Verdadero en tarea Finalizada y en iniciativa cerrada. | FR-009a, FR-011 |
| `isMismoDia(a, b)` | Verdadero si las dos fechas son el mismo día local (año, mes y día). Lo usan `getDecisionIssue` y el servicio. | FR-010a |
| `compararRiesgos(a, b)` | Comparador de `ordenarRiesgos`. | C-1 |
| `canCargarRiesgo(tarea, iniciativa)` | Falso si la tarea o la iniciativa están Finalizadas o Canceladas. | FR-011 |
| `isRequiereDecisionFijo(decision)` | Verdadero si hay decisión guardada. | FR-010 |
| `getDescripcionIssue(texto)` | Obligatoria (sin espacios sobrantes). Devuelve un código de regla o nada. | FR-002 |
| `getDecisionIssue(requiere, texto, fecha, fechaGuardada, hoy)` | Con Sí: texto y fecha obligatorios; fecha no anterior a hoy salvo igual a `fechaGuardada`. "Hoy" = día local del navegador; hoy se acepta. Devuelve `{ decision?, fecha? }` con códigos. | FR-002, FR-010a |
| `isDecisionPendiente(riesgo)` | `RequiereDecision` y estado distinto de Resuelto. | FR-008a, FR-016 |
| `getIndicadoresRiesgos(riesgos)` | `{ activos, escalados, decisionesPendientes }` sobre la lista recibida (que ya excluye Resueltos y tareas Canceladas). | FR-013 |
| `ordenarRiesgos(items)` | Escalado, Activo, Resuelto (estado no leído, al final) y, dentro de cada grupo, por `Id` ascendente. En memoria. | C-1 resuelto el 2026-11-25 |
| `recortarTitulo(texto)` | Los primeros 255 caracteres. | D2 |
| `RIESGO_TITULO_MAX = 255`, `DECISIONES_POR_TANDA = 40` | Constantes locales del módulo. | D2, D5 |

Los códigos de regla (`RiesgoRegla`) son un conjunto cerrado (por ejemplo: descripción obligatoria, decisión obligatoria, fecha obligatoria, fecha anterior a hoy, transición no permitida, riesgo Resuelto, tarea Cancelada, tarea o iniciativa cerrada, requiere decisión fijo, estado no leído y cambio en el reintento (`CambioEnReintento`)). Las pantallas los traducen a textos de `loc/`; el servicio no tiene textos.

## 3. Servicio (`api/Riesgo/IRiesgoService.ts`, `RiesgoService.ts`)

```ts
interface IRiesgoConDecision { riesgo: Riesgo; decision?: Decision }

interface IRiesgoInput {
  descripcion: string;
  requiereDecision: boolean;
  decisionNecesaria?: string;
  fechaLimite?: Date;
}
interface IRiesgoAltaInput extends IRiesgoInput { tareaId: number }
interface IRiesgoEdicionInput extends IRiesgoInput { riesgoId: number; estado: EstadoRiesgo }

interface IRiesgoService {
  getByTarea(tareaId: number): Promise<IRiesgoConDecision[]>;
  getActivosEscaladosByTareas(tareas: Tarea[]): Promise<IRiesgoConDecision[]>;
  crear(input: IRiesgoAltaInput, pendiente?: IAltaPendiente): Promise<IRiesgoConDecision>;
  editar(input: IRiesgoEdicionInput): Promise<IRiesgoConDecision>;
}
```

`getRiesgoService(): IRiesgoService` crea el servicio con los datasources reales (`RiesgoDataSource`, `DecisionDataSource`, `TareaDataSource` e `IniciativaDataSource`); no hay mocks ni consulta de `Environment.type`.

| Método | Qué hace | Errores |
|---|---|---|
| `getByTarea(tareaId)` | `getFilteredItems(tareaId)` de riesgos y, para los que requieren decisión, una consulta `getFilteredItemsByRiesgos`. Une cada riesgo con su decisión. Devuelve las filas ordenadas con `ordenarRiesgos` (en memoria). | Relanza el error de lectura. |
| `getActivosEscaladosByTareas(tareas)` | Descarta las tareas Canceladas, llama a `getActivosEscaladosByTareas` con los Id restantes, descarta además todo riesgo cuyo `Estado` no sea Activo ni Escalado (el filtro del datasource es `Estado ne 'Resuelto'`) y une las decisiones. Si no quedan tareas, devuelve `[]` sin consultar. Devuelve las filas ordenadas con `ordenarRiesgos` (sin Resueltos). | Relanza el error de lectura. |
| `crear(input, pendiente?)` | Flujo del alta de [plan.md D3](../plan.md#decisiones): lee tarea e iniciativa, valida, `add` del riesgo y `add` de la decisión, sin consultar decisiones; si falla la decisión, borra el riesgo. Con `pendiente` (reintento): no lee tarea ni iniciativa ni omite la validación de campos; consulta antes las decisiones del riesgo, retoma la decisión (la edita si ya existe) y no recrea el riesgo. Si `requiereDecision` o la descripción recortada difieren de las del riesgo ya creado, rechaza con `RiesgoRegla.CambioEnReintento` sin escribir. | `RiesgoValidationError` (nada escrito) · `RiesgoGuardadoError` |
| `editar(input)` | Flujo de la edición de [plan.md D3](../plan.md#decisiones): lee 3 veces (riesgo, decisiones de ese riesgo y tarea; no lee la iniciativa porque ninguna regla de edición la usa); valida; escribe lo que cambió, primero la decisión y al final el riesgo; si falla el segundo, restaura el primero. `FechaResolucion` = ahora solo al pasar a Resuelto y nunca se sobrescribe. | Ídem |

### Errores (`RiesgoErrors` en el mismo contrato)

| Error | Cuándo | Contenido |
|---|---|---|
| `RiesgoValidationError` | Una regla de `riesgoReglas.ts` no se cumple al volver a leer lo guardado. No se escribió nada. | `reglas: RiesgoRegla[]` y, si corresponde, `campos` (`RiesgoCampo`: `descripcion`, `requiereDecision`, `decisionNecesaria`, `fechaLimite`, `estado` o `tarea`, cada uno con su regla). |
| `RiesgoGuardadoError` | Falló una escritura o una lectura durante el guardado. | `revertido: boolean` (`true` si se pudo dejar todo como estaba), `pendiente?: IAltaPendiente` (en el alta, el riesgo ya creado cuando la reversión falló) y `causa: unknown` (el error original, para el diagnóstico). |

`IAltaPendiente` = `{ riesgo: Riesgo; decision?: Decision }`: lo ya creado en el alta cuando no se pudo deshacer. El panel lo guarda en un `useRef` y lo reenvía en el siguiente Guardar.

**Nota de nombres**: `getActivosEscaladosByTareas` existe en dos niveles con parámetros distintos. El del **datasource** (`IRiesgoDataSource`) recibe `number[]` (Id de tareas ya filtrados). El del **servicio** (`IRiesgoService`) recibe `Tarea[]`: descarta las Canceladas, obtiene los Id restantes y llama al del datasource.

### Garantías del servicio

1. Ninguna escritura sin pasar antes por la validación de los campos. El reintento con `pendiente` omite solo la lectura y la validación de cierre de tarea e iniciativa sobre el riesgo ya creado, y rechaza cualquier cambio de `requiereDecision` o de la descripción.
2. Nunca más de una decisión por riesgo: en el reintento del alta y en la edición se consulta antes de agregar y, si existe, se edita; en el alta limpia el riesgo es nuevo y no puede tener decisión.
3. Nunca queda un riesgo creado por este guardado sin su decisión si la requería, salvo que la reversión falle (y entonces se informa: `revertido: false`).
4. `delete` solo se llama sobre un registro creado en el mismo guardado.
5. Nunca se envían `Responsable` ni `FechaResolucion` de la decisión.
6. Sin permisos: el servicio no recibe `CAN_*` (FR-019). Las reglas de estado y de cierre valen para cualquier persona.
7. Si una lista trae más de una decisión para el mismo riesgo (datos que violan FR-008), las lecturas toman la de menor `Id`.
8. Los errores se registran una sola vez, en la capa de pantalla, con un mensaje claro y sin datos sensibles (convención de logging del repo); el servicio los relanza sin registrarlos.

## 4. Hooks de lectura

| Hook | Parámetros | Devuelve |
|---|---|---|
| `useRiesgosTarea(tareaId?)` | Id de la tarea (undefined = no consulta) | `{ items: IRiesgoConDecision[]; isLoading: boolean; error: boolean; reload: () => Promise<IRiesgoConDecision[]> }`; consulta al montar y al cambiar el Id, como `useTareasIniciativa`. |
| `useRiesgosIniciativa(tareas, tareasListas)` | Las tareas ya cargadas de la iniciativa y si ya terminó su carga | Igual forma. No consulta hasta que `tareasListas` es verdadero; vuelve a consultar al cambiar el conjunto de tareas no canceladas. `isLoading` arranca en `true` y es verdadero también mientras las tareas no están listas y hasta terminar la carga para el conjunto actual de tareas (para no mostrar un vacío falso). Además devuelve `indicadores: { activos, escalados, decisionesPendientes }` calculados con `getIndicadoresRiesgos`. |

Ambos usan `getRiesgoService()`. Los errores de lectura se registran con `console.error` y un mensaje claro, y marcan `error` (patrón de `useTareasIniciativa`).
