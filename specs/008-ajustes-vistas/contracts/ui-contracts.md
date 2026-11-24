# Contratos de interfaz: Ajustes de vistas

Interfaces de los componentes y hooks nuevos o modificados. Todos en `src/webparts/objetivosVp/components`.

## `shared/FiltrosPanel/FiltrosPanel.tsx` (nuevo)

```ts
interface IFiltroOption { key: string; text: string }
interface IFiltroField<TFiltros> { key: keyof TFiltros; label: string; options: IFiltroOption[] }
interface IFiltrosPanelProps<TFiltros extends Record<string, string>> {
  filtros: TFiltros;
  fields: (borrador: TFiltros) => IFiltroField<TFiltros>[];
  normalize?: (borrador: TFiltros, changedKey: keyof TFiltros) => TFiltros;
  onApply: (filtros: TFiltros) => void;
  onClear: () => void;
  onClose: () => void;
}
```

- Título `Filtros`; pie: `Limpiar` (secundario) y `Aplicar` (primario). `onClear` y `onApply` cierran el panel desde el padre; la X llama a `onClose` sin aplicar. Cada opción de "sin filtro" tiene clave `''`.

## `Objetivo/ObjetivosFiltros/ObjetivosFiltros.tsx` (nuevo)

Campos en orden: Palanca, Departamento, Gerencia, Estado, Año. Props: `filtros`, `palancas` (activas), `departamentos`, `gerencias`, `anios`, `onApply`, `onClear`, `onClose`. `normalize` limpia `gerenciaId` si el departamento elegido no es el de esa gerencia. Las opciones de Gerencia se acotan por `departamentoId` del borrador.

## `Objetivo/objetivoFiltros.ts` (nuevo)

```ts
interface IObjetivosFiltros { palancaId: string; departamentoId: string; gerenciaId: string; estado: string; anio: string }
const EMPTY_OBJETIVOS_FILTROS: IObjetivosFiltros;
matchesObjetivoFiltros(objetivo: Objetivo, filtros: IObjetivosFiltros): boolean;
hasObjetivoFilter(filtros: IObjetivosFiltros): boolean; // Departamento, Gerencia, Estado o Año
getAniosObjetivos(objetivos: Objetivo[]): number[];
```

## `Objetivo/ObjetivosTable/ObjetivosTable.tsx` (modificado)

`variant: 'palanca' | 'delVp' | 'otrasVp' | 'todos'`. Para `'todos'`: columnas ID, Objetivo, VP, Palanca, Departamento, Gerencia, Peso, Avance, Estado y Ver. Otra VP: Palanca "—", Peso "—", Avance "No aplica".

## `core/api/useDatasource.ts` (modificado)

`getItems` relanza el error: despacha `ERROR` y vuelve a lanzarlo (`handleAsyncAndRethrow`). La firma no cambia (`() => Promise<void>`).

## `shared/settleLoads.ts` y `shared/RefreshButton/RefreshButton.tsx` (nuevos)

```ts
settleLoads(...loads: Array<Promise<unknown>>): Promise<void>; // espera todas; nunca rechaza
// RefreshButton: botón iconOnly con Tooltip "Actualizar" e ícono `reload`
interface IRefreshButtonProps { onClick: () => void }
```

En `refresh`, `Promise.all([...cargas])`: si se resuelve, se muestra `ViewRefreshed` ("La vista se ha actualizado correctamente.") con `SuccessNotice`; si rechaza, no se muestra y la vista pinta su error.

## Cambios en componentes existentes

| Componente | Cambio |
|---|---|
| `PalancasHeader` | Prop `onOpenFilters`; usa `RefreshButton`. |
| `IniciativasHeader` | Prop `onRefresh`; botón `RefreshButton` antes de Filtros. |
| `Palancas` | Filtros, solapa `todosObjetivos`, página, resumen sin avance, mensaje de Actualizar; cargas con `settleLoads`. |
| `IniciativaDetalle`, `ObjetivoDetalle`, `PalancaDetalle`, `useIniciativaFormMasters`, `useObjetivoFormMasters`, `useObjetivoNames` | Sus cargas con `getItems` pasan por `settleLoads` (sin cambio visible). |
| `IniciativasBandeja` | `refresh` con `Promise.all` y mensaje; `Promise.all(...).then(setReady)` pasa a `settleLoads`. |
| `IniciativasFiltros` | Envoltorio de `FiltrosPanel`; mismo contrato público. |
| `PalancaForm`, `ObjetivoFormBody` | `ConfirmacionModal` entre la validación y `onSave`. |
| `objetivoUtils` | `ObjetivosFiltro` suma `'todosObjetivos'`; se quita `DEFAULT_PROGRESS`. |

## Textos

Nuevos: `ViewRefreshed`, `ObjetivosAllEmpty`, `ObjetivosFilterTodos`, `PalancasFiltersEmpty`, `PalancaConfirmCreate`, `PalancaConfirmEdit`, `ObjetivoConfirmCreate`, `ObjetivoConfirmEdit`, `ObjetivoConfirmEditTitle`. Modificados: `PalancasSummary`, `IniciativasFiltersClear`.
