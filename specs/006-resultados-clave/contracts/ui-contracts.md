# Contratos de interfaz: Resultados clave y cálculo de avance

Props de las piezas nuevas o ampliadas, cambios de contrato en `core`, funciones de cálculo y textos de `loc/`. El comportamiento detallado está en [plan.md](../plan.md#decisiones) y los datos en [data-model.md](../data-model.md). No hay rutas nuevas (FR-040).

## 1. Cambios en `core`

### `entities/ResultadoClave.ts`

```ts
// escritura
Title: this.Nombre,

// tipos (null vacía el campo; undefined no lo envía)
public ValorActual?: number | null | undefined;
public Fuente?: string | null | undefined;
public Evidencia?: IUrlValue | null | undefined;
```

La lectura no cambia. Las demás propiedades y `toListItem` no cambian.

### `api/useDatasource.ts`

`deleteItem` pasa de `handleAsync` a `handleAsyncAndRethrow`: marca `error` en el estado, igual que hoy, y además relanza el error. Ninguna pantalla lo usa todavía.

### `api/ResultadoClave`

```ts
// useResultadoClaveDataSource.ts y useItemResultadoClaveDataSource.ts
useDatasource<ResultadoClave>(new ResultadoClaveDataSource(), new ResultadoClaveMock());
```

`ResultadoClaveMock` (nuevo) implementa `IResultadoClaveDataSource` con estado a nivel de módulo: `getItems`, `add` (próximo Id), `edit` (combina solo los campos definidos; `null` vacía el campo), `delete` y `getById` (rechaza con estado 404). Casos de datos en [plan, D1](../plan.md#decisiones).

### `api/ComentarioResultadoClave`

```ts
// useComentarioResultadoClaveDataSource.ts y useItemComentarioResultadoClaveDataSource.ts
useDatasource<ComentarioResultadoClave>(new ComentarioResultadoClaveDataSource(), new ComentarioResultadoClaveMock());

// useComentariosResultadoClave.ts (nuevo)
export interface IComentariosResultadoClaveState {
	items: ComentarioResultadoClave[];
	isLoading: boolean;
	error: boolean;
	reload: () => Promise<void>;
}
function useComentariosResultadoClave(resultadoClaveId: number | undefined): IComentariosResultadoClaveState;
```

El hook elige datasource o mock con el mismo criterio que `useDatasource`, consulta con `getFilteredItems(resultadoClaveId)` al montar y cuando cambia el Id, y devuelve los comentarios del más nuevo al más viejo. `ComentarioResultadoClaveMock` (nuevo) implementa también `getFilteredItems`; `add` asigna `Created` = ahora y `Author` = usuario de prueba.

## 2. Cálculos (`components/Iniciativa/resultadoClaveUtils.ts`, nuevo)

```ts
export enum EstadoResultadoClave { SinDato, NoCumple, Minimo, Meta, Maximo }
export type AvanceColor = 'rojo' | 'amarillo' | 'verde';

export const getCumplimiento = (resultado: ResultadoClave): number;                    // C-01, 0 sin valor actual o con máximo <= 0
export const hasValorActual = (resultado: ResultadoClave): boolean;
export const getEstadoResultadoClave = (resultado: ResultadoClave): EstadoResultadoClave;   // C-02
export const getEstadoResultadoClaveChip = (estado: EstadoResultadoClave): { color: ChipColor; style?: CSSProperties };   // A1
export const getEstadoResultadoClaveLabel = (estado: EstadoResultadoClave): string;
export const getPesoResultadoClave = (cantidad: number): number;                       // 100 / cantidad
export const getAvanceIniciativa = (resultados: ResultadoClave[]): number;             // C-03, 0 sin resultados
export const getAvanceObjetivo = (objetivoId: number | undefined, iniciativas: Iniciativa[], resultados: ResultadoClave[]): number;   // C-04, 0 sin iniciativas no canceladas
export const getAvanceColor = (avance: number): AvanceColor;                           // C-07, umbrales 60 y 80
export const formatAvance = (avance: number): number;                                  // entero, sin -0
export const formatResultadoClaveId = (id: number | undefined): string;                // KR-nn
export const formatResultadoClaveNumero = (valor: number | null | undefined): string;  // es-AR, máx. 4 decimales; vacío = "—"
```

- Las funciones de avance no reciben el objetivo: la pantalla decide con `isVpRrii(objetivo.VP?.Title)` si llamarlas o mostrar "No aplica".
- `getAvanceObjetivo` usa las iniciativas con `Objetivo.Id === objetivoId` que no están canceladas y, de ellas, `getAvanceIniciativa` con los resultados clave cuyo `Iniciativa.Id` coincide.
- Los umbrales (60 y 80), el decimal de normalización (6) y los colores de la escala son constantes locales del archivo.

## 3. Piezas nuevas

### `shared/AvanceText/AvanceText.tsx`

```ts
export interface IAvanceTextProps {
	value: number;      // avance sin redondear
	spaced?: boolean;   // "70 %" en encabezados; "70%" en tablas (por defecto)
}
```

Muestra `<b>` con el entero de `formatAvance(value)` y el color de `getAvanceColor(value)`: rojo Red 600, amarillo Yellow 700, verde Green 700 (`getColorStep`).

### `IniciativaForm/ResultadosClaveBloque/ResultadosClaveBloque.tsx`

Los tipos `IResultadoClaveDraft` e `IResultadoClaveIssues` y las funciones de borradores (`createEmptyDraft`, `toDraft`, `getDraftIssues`, `isDraftChanged`) viven en `resultadoClaveUtils.ts`; el bloque los importa.

```ts
// resultadoClaveUtils.ts
export interface IResultadoClaveDraft {
	key: number;
	id?: number;        // existente
	nombre: string;
	tipo: string;       // '' o un TipoMedicion
	unidad: string;
	minimo: string;
	meta: string;
	maximo: string;
}

export interface IResultadoClaveIssues {   // por borrador, solo los campos con error
	nombre?: string; tipo?: string; unidad?: string;
	minimo?: string; meta?: string; maximo?: string;
}

```

```ts
// ResultadosClaveBloque.tsx
export interface IResultadosClaveBloqueProps {
	drafts: IResultadoClaveDraft[];
	issues: IResultadoClaveIssues[];       // mismo orden que drafts, ya filtrados por "submitted"
	onChange: (drafts: IResultadoClaveDraft[]) => void;
}
```

Muestra `SectionBand` "Resultados clave" con "+" y un bloque por borrador (nombre "Resultado clave N" a todo el ancho; Tipo de medición | Unidad; Mínimo | Meta | Máximo). Papelera en todos menos el primero. La validación vive en `IniciativaFormBody` (D7).

### `ResultadoClaveSeguimientoPanel/ResultadoClaveSeguimientoPanel.tsx`

```ts
export interface IResultadoClaveSeguimientoPanelProps {
	resultado: ResultadoClave;
	onSaved: (resultado: ResultadoClave) => void;
	onCancel: () => void;
}
```

Panel lateral "Seguimiento del resultado clave" (D13). Usa `useResultadoClaveDataSource` (`editItem`), `useComentarioResultadoClaveDataSource` (`addItem`) y `useComentariosResultadoClave`.

### `IniciativaDetalle/IniciativaResultadosClave/IniciativaResultadosClave.tsx`

```ts
export interface IIniciativaResultadosClaveProps {
	resultados: ResultadoClave[];                          // los de la iniciativa
	onTrack?: (resultado: ResultadoClave) => void;         // ausente = sin permiso, la acción muestra "—"
}
```

`SectionBand` `collapsible` "Resultados clave (N)" y `Table` (D12).

## 4. Piezas ampliadas

| Pieza | Cambio |
|---|---|
| `ObjetivosVp.tsx` | `CAN_LOAD_RESULTADOS_CLAVE = true` y `CAN_TRACK_RESULTADO_CLAVE = true`; los pasa como `canLoadResultadosClave` a `IniciativasBandeja`, `ObjetivoDetalle` e `IniciativaDetalle`, y `canTrackResultadoClave` a `IniciativaDetalle`. |
| `IniciativasBandeja.tsx` | Prop `canLoadResultadosClave`. Carga los resultados clave junto con lo que ya carga y se los pasa a `IniciativasTable` y al panel. |
| `IniciativasTable.tsx` | Prop `resultados: ResultadoClave[]`. Columna **Avance** antes de Estado en la variante `bandeja` y antes de Peso en la variante `objetivo` (después de Accountable). Iniciativa de otra VP: "No aplica". |
| `ObjetivosTable.tsx` | Props `iniciativas: Iniciativa[]` y `resultados: ResultadoClave[]`. La columna Avance existente muestra `AvanceText` con `getAvanceObjetivo`, en lugar del 0 % fijo. |
| `ObjetivoDetalle.tsx` | Prop `canLoadResultadosClave`. Carga iniciativas y resultados clave; encabezado con `AvanceText` (`spaced`) si el objetivo es de la VP RRII; pasa los datos a `ObjetivoIniciativas`. |
| `ObjetivoIniciativas.tsx` | Props nuevas: `iniciativas`, `resultados`, `ready`, `error`, `canLoadResultadosClave` y `onReload`. Deja de cargar por su cuenta. |
| `Palancas.tsx`, `PalancaDetalle.tsx` | Cargan iniciativas y resultados clave junto con los objetivos y se los pasan a `ObjetivosTable`; `Palancas.tsx` también a `PalancasTable`. |
| `PalancasTable.tsx` | Props `iniciativas` y `resultados`, que reenvía a `ObjetivosTable` (variante `palanca`) de cada palanca expandida. |
| `IniciativaDetalle.tsx` | Props `canLoadResultadosClave` y `canTrackResultadoClave`. Carga los resultados clave; encabezado con `AvanceText` (`spaced`) si es de la VP RRII; `IniciativaResultadosClave` debajo de "Información de la iniciativa"; abre el panel de seguimiento; avisa con `SuccessNotice`. |
| `IniciativaForm.tsx`, `IniciativaFormPanel.tsx`, `useIniciativaFormMasters.ts` | `IniciativaFormBody` suma `resultadosClave` y `canLoadResultadosClave`, el estado de borradores, la validación y el bloque; `IniciativaFormPanel` hace el guardado conjunto (D9) y recibe `canLoadResultadosClave`; los maestros suman `resultadosClave` (D8). `onSave` pasa a `(iniciativa: Iniciativa, drafts: IResultadoClaveDraft[]) => Promise<IResultadoClaveDraft[]>` y devuelve los borradores con los Id asignados. |
| `objetivoUtils.ts` | Sin cambios: `DEFAULT_PROGRESS` se mantiene para el resumen "Avance de la VP" de `Palancas` (C-05, fuera de alcance). |

## 5. Textos (`loc/mystrings.d.ts` y `loc/en-us.js`)

Claves nuevas. Se reutilizan `RequiredField`, `Cancel`, `SaveChanges`, `ObjetivoNoValue`, `ObjetivoColumnProgress`, `ObjetivoDetailProgress`, `IniciativaConfirmCreate`, `IniciativaConfirmEdit` e `IniciativaSaveError`.

| Clave | Texto |
|---|---|
| `ResultadoClaveFormSection` | Resultados clave |
| `ResultadoClaveFormName` | Resultado clave {0} |
| `ResultadoClaveFormNamePlaceholder` | Ej. Implementar YPF Store en 40 EESS |
| `ResultadoClaveFormType` | Tipo de medición |
| `ResultadoClaveFormUnit` | Unidad |
| `ResultadoClaveFormUnitPlaceholder` | Ej. estaciones |
| `ResultadoClaveFieldMin` | Mínimo |
| `ResultadoClaveFieldGoal` | Meta |
| `ResultadoClaveFieldMax` | Máximo |
| `ResultadoClaveSelect` | Seleccionar |
| `ResultadoClaveAddTooltip` | Agregar resultado clave |
| `ResultadoClaveRemoveTooltip` | Quitar resultado clave {0} |
| `ResultadoClaveNotNumber` | Ingresá un valor numérico. |
| `ResultadoClaveMaxPositive` | El máximo debe ser mayor que 0. |
| `ResultadoClaveGoalBelowMin` | La meta no puede ser menor que el mínimo. |
| `ResultadoClaveMaxBelowGoal` | El máximo no puede ser menor que la meta. |
| `ResultadoClaveInvalidLink` | Ingresá un link de SharePoint u Office 365. |
| `ResultadoClaveSection` | Resultados clave ({0}) |
| `ResultadoClaveColumnName` | Resultado clave |
| `ResultadoClaveColumnType` | Tipo |
| `ResultadoClaveColumnMin` | Mín. |
| `ResultadoClaveColumnGoal` | Meta |
| `ResultadoClaveColumnMax` | Máx. |
| `ResultadoClaveColumnWeight` | Peso |
| `ResultadoClaveColumnCurrent` | Actual |
| `ResultadoClaveColumnProjected` | Proyect. |
| `ResultadoClaveColumnCompliance` | Cumplim. |
| `ResultadoClaveColumnStatus` | Estado |
| `ResultadoClaveColumnAction` | Acción |
| `ResultadoClaveSource` | Fuente: {0} |
| `ResultadoClaveEmpty` | Esta iniciativa no tiene resultados clave. |
| `ResultadoClaveStatusNoData` | Sin dato |
| `ResultadoClaveStatusNotMet` | No cumple |
| `ResultadoClaveStatusMinimum` | Mínimo |
| `ResultadoClaveStatusGoal` | Meta |
| `ResultadoClaveStatusMaximum` | Máximo |
| `ResultadoClaveTrackTooltip` | Registrar seguimiento |
| `ResultadoClaveTrackPanelTitle` | Seguimiento del resultado clave |
| `ResultadoClaveTrackUnitType` | Unidad · tipo |
| `ResultadoClaveTrackRange` | Mínimo · Meta · Máximo |
| `ResultadoClaveFieldCurrent` | Valor actual |
| `ResultadoClaveFieldProjected` | Valor proyectado al 31/12 |
| `ResultadoClaveFieldSource` | Fuente |
| `ResultadoClaveFieldSourcePlaceholder` | De dónde sale el dato |
| `ResultadoClaveFieldEvidence` | Evidencia (link) |
| `ResultadoClaveFieldEvidencePlaceholder` | https://ypf.sharepoint.com/… |
| `ResultadoClaveFieldComment` | Comentario |
| `ResultadoClaveFieldCommentPlaceholder` | Novedad de este seguimiento |
| `ResultadoClaveLastComment` | {0} · {1} (fecha · autor del último comentario) |
| `ResultadoClaveUpdated` | El resultado clave "{0}" se ha actualizado correctamente. |
| `ResultadoClaveSaveError` | No se pudo guardar el seguimiento del resultado clave. |
| `AvanceNotApplicable` | No aplica |

Los nombres de las opciones de Tipo de medición salen de `TipoMedicion`. Los textos de los placeholders se toman de la maqueta.
