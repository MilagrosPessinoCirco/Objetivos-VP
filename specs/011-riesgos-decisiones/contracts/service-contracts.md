# Contratos de datos y servicio: Riesgos y decisiones

Contratos de `core/api`: cambios en los datasources, mocks, reglas puras, servicio, errores y hooks de lectura. El comportamiento detallado está en [plan.md](../plan.md#decisiones) y los datos en [data-model.md](../data-model.md). Son firmas y reglas, no implementación.

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

### Mocks (nuevos)

`RiesgoMock` implementa `IRiesgoDataSource` y `DecisionMock` implementa `IDecisionDataSource`, con estado a nivel de módulo (`listTitle` = `Lista.Riesgo` / `Lista.Decision`), `add` con próximo Id y `Created` y `Author` de prueba, `edit` que mezcla solo lo definido (`null` vacía), `delete`, `getById` (404 si no existe) y los métodos nuevos. Datos: [data-model.md](../data-model.md#datos-de-los-mocks).

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
| `canCargarRiesgo(tarea, iniciativa)` | Falso si la tarea o la iniciativa están Finalizadas o Canceladas. | FR-011 |
| `isRequiereDecisionFijo(decision)` | Verdadero si hay decisión guardada. | FR-010 |
| `getDescripcionIssue(texto)` | Obligatoria (sin espacios sobrantes). Devuelve un código de regla o nada. | FR-002 |
| `getDecisionIssue(requiere, texto, fecha, fechaGuardada, hoy)` | Con Sí: texto y fecha obligatorios; fecha no anterior a hoy salvo igual a `fechaGuardada`. "Hoy" = día local del navegador; hoy se acepta. Devuelve `{ decision?, fecha? }` con códigos. | FR-002, FR-010a |
| `isDecisionPendiente(riesgo)` | `RequiereDecision` y estado distinto de Resuelto. | FR-008a, FR-016 |
| `getIndicadoresRiesgos(riesgos)` | `{ activos, escalados, decisionesPendientes }` sobre la lista recibida (que ya excluye Resueltos y tareas Canceladas). | FR-013 |
| `ordenarRiesgos(items)` | Escalado, Activo, Resuelto (estado no leído, al final) y, dentro de cada grupo, por `Id` ascendente. En memoria. | C-1 resuelto el 2026-11-25 |
| `recortarTitulo(texto)` | Los primeros 255 caracteres. | D2 |
| `RIESGO_TITULO_MAX = 255`, `DECISIONES_POR_TANDA = 40` | Constantes locales del módulo. | D2, D5 |

Los códigos de regla (`RiesgoRegla`) son un conjunto cerrado (por ejemplo: descripción obligatoria, decisión obligatoria, fecha obligatoria, fecha anterior a hoy, transición no permitida, riesgo Resuelto, tarea Cancelada, tarea o iniciativa cerrada, requiere decisión fijo). Las pantallas los traducen a textos de `loc/`; el servicio no tiene textos.

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

`getRiesgoService(): IRiesgoService` crea el servicio con los datasources reales si `Environment.type` es SharePoint y los mocks si no.

| Método | Qué hace | Errores |
|---|---|---|
| `getByTarea(tareaId)` | `getFilteredItems(tareaId)` de riesgos y, para los que requieren decisión, una consulta `getFilteredItemsByRiesgos`. Une cada riesgo con su decisión. Devuelve las filas ordenadas con `ordenarRiesgos` (en memoria). | Relanza el error de lectura. |
| `getActivosEscaladosByTareas(tareas)` | Descarta las tareas Canceladas, llama a `getActivosEscaladosByTareas` con los Id restantes y une las decisiones. Si no quedan tareas, devuelve `[]` sin consultar. Devuelve las filas ordenadas con `ordenarRiesgos` (sin Resueltos). | Relanza el error de lectura. |
| `crear(input, pendiente?)` | Flujo del alta de [plan.md D3](../plan.md#decisiones): lee tarea e iniciativa, valida, `add` del riesgo y `add` de la decisión, sin consultar decisiones; si falla la decisión, borra el riesgo. Con `pendiente` (reintento), consulta antes las decisiones del riesgo, retoma la decisión (la edita si ya existe) y no recrea el riesgo. | `RiesgoValidationError` (nada escrito) · `RiesgoGuardadoError` |
| `editar(input)` | Flujo de la edición de [plan.md D3](../plan.md#decisiones): lee riesgo, decisión, tarea e iniciativa; valida; escribe lo que cambió, primero la decisión y al final el riesgo; si falla el segundo, restaura el primero. `FechaResolucion` = ahora solo al pasar a Resuelto y nunca se sobrescribe. | Ídem |

### Errores (`RiesgoErrors` en el mismo contrato)

| Error | Cuándo | Contenido |
|---|---|---|
| `RiesgoValidationError` | Una regla de `riesgoReglas.ts` no se cumple al volver a leer lo guardado. No se escribió nada. | `reglas: RiesgoRegla[]` y, si corresponde, el campo (`descripcion`, `requiereDecision`, `decisionNecesaria`, `fechaLimite`, `estado`). |
| `RiesgoGuardadoError` | Falló una escritura o una lectura durante el guardado. | `revertido: boolean` (`true` si se pudo dejar todo como estaba), `pendiente?: IAltaPendiente` (en el alta, el riesgo ya creado cuando la reversión falló) y `causa: unknown` (el error original, para el diagnóstico). |

`IAltaPendiente` = `{ riesgo: Riesgo; decision?: Decision }`: lo ya creado en el alta cuando no se pudo deshacer. El panel lo guarda en un `useRef` y lo reenvía en el siguiente Guardar.

**Nota de nombres**: `getActivosEscaladosByTareas` existe en dos niveles con parámetros distintos. El del **datasource** (`IRiesgoDataSource`) recibe `number[]` (Id de tareas ya filtrados). El del **servicio** (`IRiesgoService`) recibe `Tarea[]`: descarta las Canceladas, obtiene los Id restantes y llama al del datasource.

### Garantías del servicio

1. Ninguna escritura sin pasar antes por la validación (excepto el reintento con `pendiente`, que solo retoma la decisión).
2. Nunca más de una decisión por riesgo: en el reintento del alta y en la edición se consulta antes de agregar y, si existe, se edita; en el alta limpia el riesgo es nuevo y no puede tener decisión.
3. Nunca queda un riesgo creado por este guardado sin su decisión si la requería, salvo que la reversión falle (y entonces se informa: `revertido: false`).
4. `delete` solo se llama sobre un registro creado en el mismo guardado.
5. Nunca se envían `Responsable` ni `FechaResolucion` de la decisión.
6. Sin permisos: el servicio no recibe `CAN_*` (FR-019). Las reglas de estado y de cierre valen para cualquier persona.
7. Los errores se registran una sola vez, en la capa de pantalla, con un mensaje claro y sin datos sensibles (convención de logging del repo); el servicio los relanza sin registrarlos.

## 4. Hooks de lectura

| Hook | Parámetros | Devuelve |
|---|---|---|
| `useRiesgosTarea(tareaId?)` | Id de la tarea (undefined = no consulta) | `{ items: IRiesgoConDecision[]; isLoading: boolean; error: boolean; reload: () => Promise<IRiesgoConDecision[]> }`; consulta al montar y al cambiar el Id, como `useTareasIniciativa`. |
| `useRiesgosIniciativa(tareas, tareasListas)` | Las tareas ya cargadas de la iniciativa y si ya terminó su carga | Igual forma. No consulta hasta que `tareasListas` es verdadero; vuelve a consultar al cambiar el conjunto de tareas no canceladas. Además devuelve `indicadores: { activos, escalados, decisionesPendientes }` calculados con `getIndicadoresRiesgos`. |

Ambos usan `getRiesgoService()`. Los errores de lectura se registran con `console.error` y un mensaje claro, y marcan `error` (patrón de `useTareasIniciativa`).
