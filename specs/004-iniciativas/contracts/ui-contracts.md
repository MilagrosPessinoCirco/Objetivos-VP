# Contratos de interfaz: Iniciativas

Rutas, props de las piezas nuevas o ampliadas, cambios de contrato en `core` y textos de `loc/`. El comportamiento detallado está en [plan.md](../plan.md#decisiones) y los datos en [data-model.md](../data-model.md).

## 1. Rutas (`components/ObjetivosVp/routes.ts`)

```ts
export const INICIATIVAS_PATH = '/iniciativa';
export const INICIATIVA_DETAIL_PATH = `${INICIATIVAS_PATH}/:id`;
export const INICIATIVAS_VISTA_PARAM = 'vista';
export const INICIATIVAS_VISTA_TODAS = 'todas';
export const getIniciativaPath = (id: number): string => `${INICIATIVAS_PATH}/${id}`;
```

| Ruta | Pantalla |
|---|---|
| `/iniciativa` | Bandeja, solapa "Mis iniciativas" |
| `/iniciativa?vista=todas` | Bandeja, solapa "Todas" |
| `/iniciativa/:id` | Detalle de la iniciativa |

- El acceso "Mis iniciativas" de la home navega a `/iniciativa` (FR-015).
- Al abrir un detalle desde la bandeja o desde el detalle del objetivo se navega con `navigate(getIniciativaPath(id), { state: { from } })`, donde `from` es `location.pathname + location.search` de la pantalla de origen (FR-033a).

## 2. Cambios en `core`

### `entities/Iniciativa.ts`

```ts
// lectura
this.Area = toLookupValueArray(item.Area);

// escritura
Title: this.Nombre,
AreaId: toLookupIds(this.Area),   // [] borra todas; undefined se omite

public Area?: ILookupValue[] | undefined;
```

El resto de la entidad no cambia.

### `utils/Mappers.ts`

```ts
export function toLookupIds(values: ILookupValue[] | undefined): number[] | undefined;
```

Mismo contrato que `toPersonIds`, para lookups.

### `api/Usuario`

```ts
// IUsuarioDataSource
getCurrentUser(): Promise<IPersonValue>;

// useCurrentUser.ts (nuevo)
export interface ICurrentUserState { user?: IPersonValue; error: boolean; }
function useCurrentUser(): ICurrentUserState;
```

`UsuarioDataSource.getCurrentUser` lee `sp.web.currentUser` (`Id`, `Title`, `Email`) y lo devuelve como `IPersonValue`. `UsuarioMock.getCurrentUser` devuelve el usuario de prueba del mock. `useCurrentUser` elige datasource o mock con el mismo criterio que `useDatasource` y consulta una vez al montar.

### `api/ComentarioIniciativa`

```ts
// IComentarioIniciativaDataSource
getFilteredItems(iniciativaId: number): Promise<ComentarioIniciativa[]>;   // del más nuevo al más viejo

// useComentariosIniciativa.ts (nuevo)
export interface IComentariosIniciativaState {
  items: ComentarioIniciativa[];
  isLoading: boolean;
  error: boolean;
  reload: () => Promise<void>;
}
function useComentariosIniciativa(iniciativaId: number | undefined): IComentariosIniciativaState;
```

`ComentarioIniciativaDataSource.getFilteredItems` filtra `IniciativaId eq <id>` en la consulta y ordena por `Created` y `Id` descendentes. Requiere la columna `Iniciativa` indexada (plan, P1). Con `iniciativaId` `undefined`, el hook no consulta.

### Mocks nuevos

| Archivo | Implementa | Datos |
|---|---|---|
| `api/Iniciativa/IniciativaMock.ts` | `IIniciativaDataSource` | Plan, D1 |
| `api/ComentarioIniciativa/ComentarioIniciativaMock.ts` | `IComentarioIniciativaDataSource` | Plan, D1 |
| `api/Area/AreaMock.ts` | `IAreaDataSource` | Plan, D1 |
| `api/Usuario/UsuarioMock.ts` | `IUsuarioDataSource` | Plan, D1 |

`useIniciativaDataSource`, `useComentarioIniciativaDataSource`, `useAreaDataSource` y `useUsuarioDataSource` pasan su mock como segundo argumento de `useDatasource`, igual que `useObjetivoDataSource`.

## 3. Piezas nuevas (`src/webparts/objetivosVp/components/Iniciativa/`)

### `iniciativaUtils.ts`

```ts
export type IniciativasVista = 'mis' | 'todas';

export interface IIniciativasFiltros {
  departamentoId: string;   // '' = sin filtro
  objetivoId: string;
  accountableId: string;
  estado: string;
  anio: string;
}
export const EMPTY_FILTROS: IIniciativasFiltros;

export interface IIniciativaPesos {
  enObjetivo?: number;              // undefined = no corresponde
  enDepartamento?: number | null;   // undefined = no corresponde; null = el objetivo no tiene peso
}

export const formatIniciativaId: (id: number | undefined) => string;              // 'INI-01'
export const getEstadoIniciativaChipColor: (estado: EstadoIniciativa | undefined) => ChipColor;
export const getPesosIniciativa: (iniciativa: Iniciativa, delObjetivo: Iniciativa[], objetivo: Objetivo | undefined) => IIniciativaPesos;
export const formatPeso: (valor: number) => string;                               // '33,33'
export const formatAccountable: (iniciativa: Iniciativa) => string;               // nombres separados por ', '
export const isAccountable: (iniciativa: Iniciativa, userId: number | undefined) => boolean;   // compara Id de usuario del sitio, nunca Title
export const getAniosIniciativa: (iniciativa: Iniciativa) => number[];
export const getUltimoComentario: (comentarios: ComentarioIniciativa[], iniciativaId: number) => ComentarioIniciativa | undefined;
```

### `IniciativasBandeja/IniciativasBandeja.tsx`

```ts
export interface IIniciativasBandejaState {
  searchText: string;
  filtros: IIniciativasFiltros;
  page: number;
}

export interface IIniciativasBandejaProps {
  canCreate: boolean;
  state: IIniciativasBandejaState;
  onStateChange: (state: IIniciativasBandejaState) => void;
}
```

La solapa sale de `?vista=` (D8). El estado de búsqueda, filtros y página vive en `ObjetivosVpRoutes`.

| Subpieza | Props |
|---|---|
| `IniciativasHeader/IniciativasHeader.tsx` | `title`, `searchText`, `onSearchChange`, `onBack`, `onOpenFilters`, `canCreate`, `onNew` |
| `IniciativasFiltros/IniciativasFiltros.tsx` | `filtros` (aplicados), `departamentos: Departamento[]`, `objetivos: Objetivo[]`, `accountables: IPersonValue[]`, `anios: number[]`, `onApply(filtros)`, `onClear()`, `onClose()` |
| `IniciativasPaginador/IniciativasPaginador.tsx` | `page`, `pageSize`, `total`, `onPageChange(page)` |

### `IniciativasTable/IniciativasTable.tsx`

```ts
export interface IIniciativasTableProps {
  iniciativas: Iniciativa[];
  variant: 'bandeja' | 'objetivo';
  objetivos?: Objetivo[];          // bandeja: para "ID · nombre" del objetivo
  objetivo?: Objetivo;             // objetivo: para el peso
  emptyText: string;
  onView: (id: number) => void;
}
```

| Variante | Columnas |
|---|---|
| `bandeja` | ID, Iniciativa, Objetivo (ID · nombre), Accountable, Estado, Ver |
| `objetivo`, objetivo de la VP RRII | ID, Iniciativa, Accountable, Peso, Estado, Ver |
| `objetivo`, objetivo de otra VP | ID, Iniciativa, Accountable, Estado, Ver |

### `IniciativaForm/`

```ts
// IniciativaFormPanel.tsx
export interface IIniciativaFormPanelProps {
  iniciativa?: Iniciativa;          // presente = edición
  initialObjetivoId?: number;       // alta desde el detalle del objetivo
  onSaved: (iniciativa: Iniciativa) => void;
  onCancel: () => void;
}

// IniciativaForm.tsx
export interface IIniciativaFormBodyProps {
  objetivos: Objetivo[];
  areas: Area[];
  usuarios: Usuario[];
  currentUser?: IPersonValue;
  initialObjetivoId?: number;
  iniciativa?: Iniciativa;
  onSave: (iniciativa: Iniciativa) => Promise<void>;
  onCancel: () => void;
}

// useIniciativaFormMasters.ts
export interface IIniciativaFormMasters {
  objetivos: Objetivo[]; areas: Area[]; usuarios: Usuario[]; currentUser?: IPersonValue;
  ready: boolean; error: boolean;
}
```

### `IniciativaEstadoPanel/IniciativaEstadoPanel.tsx`

```ts
export interface IIniciativaEstadoPanelProps {
  iniciativa: Iniciativa;
  ultimoComentario?: ComentarioIniciativa;
  onSaved: () => void;
  onCancel: () => void;
}
```

### `ConfirmacionModal/ConfirmacionModal.tsx`

```ts
export interface IConfirmacionModalProps {
  title: string;
  message: string;
  isSaving: boolean;
  onAccept: () => void;
  onCancel: () => void;
}
```

`Modal` del DS con `primaryAction` = Aceptar y `secondaryAction` = Cancelar, ambos `Button` del DS.

### `IniciativaDetalle/`

```ts
// IniciativaDetalle.tsx
export interface IIniciativaDetalleProps {
  canEdit: boolean;
  canChangeEstado: boolean;
}

// IniciativaInfo/IniciativaInfo.tsx
export interface IIniciativaInfoProps {
  iniciativa: Iniciativa;
  objetivo?: Objetivo;
  areaNames: string;
  pesos: IIniciativaPesos;
  onEdit?: () => void;
}

// IniciativaComentario/IniciativaComentario.tsx
export interface IIniciativaComentarioProps {
  comentario?: ComentarioIniciativa;
  onEdit?: () => void;
}
```

## 4. Piezas ampliadas

| Pieza | Cambio |
|---|---|
| `ObjetivosVp.tsx` | Rutas de bandeja y detalle; estado de la bandeja (`IIniciativasBandejaState`); constantes `CAN_CREATE_INICIATIVA`, `CAN_EDIT_INICIATIVA` y `CAN_CHANGE_ESTADO_INICIATIVA`, en `true`; `ObjetivoDetalle` recibe `canCreateIniciativa`. |
| `ObjetivoDetalle.tsx` | Prop `canCreateIniciativa: boolean`. Renderiza `ObjetivoIniciativas` debajo de `ObjetivoInfo`. |
| `ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx` (nuevo) | `objetivo: Objetivo`, `canCreate: boolean`, `onCreated: (iniciativa: Iniciativa) => void`. Sección "Iniciativas (N)" con "+" y `IniciativasTable` variante `objetivo`. |
| `PalancaBreadcrumb.tsx` | Props opcionales `objetivoId?: number` e `iniciativaNombre?: string`. Con `iniciativaNombre`, el objetivo pasa a ser enlace (si hay `objetivoId`) y la iniciativa es el último nivel. Sin `iniciativaNombre`, igual que hoy. |
| `SectionBand.tsx` | Prop opcional `defaultCollapsed?: boolean` (por defecto `false`). |
| `AccessList.tsx` | El acceso "Mis iniciativas" suma `route: INICIATIVAS_PATH`. |

## 5. Textos (`loc/mystrings.d.ts` y `loc/en-us.js`)

Claves nuevas:

| Clave | Texto |
|---|---|
| `IniciativasMine` | Mis iniciativas |
| `IniciativasAllTitle` | Todas las iniciativas |
| `IniciativasTabAll` | Todas |
| `IniciativasTabsAriaLabel` | Iniciativas a mostrar |
| `IniciativasSearchPlaceholder` | Buscar ID o iniciativa |
| `IniciativasCount` | {0} iniciativas en esta vista |
| `IniciativasEmpty` | No hay iniciativas cargadas. |
| `IniciativasEmptyFilters` | No hay iniciativas con estos filtros. |
| `IniciativasLoadError` | No se pudieron cargar las iniciativas. |
| `IniciativasPagerAriaLabel` | Paginado |
| `IniciativasPageInfo` | Mostrando {0}–{1} de {2} |
| `IniciativasPageFirst` | Primera página |
| `IniciativasPagePrevious` | Página anterior |
| `IniciativasPageNext` | Página siguiente |
| `IniciativasPageLast` | Última página |
| `IniciativasPageNumber` | Página {0} |
| `IniciativasFilterYear` | Año |
| `IniciativasFilterAll` | Todos |
| `IniciativasFiltersApply` | Aplicar |
| `IniciativasFiltersClear` | Limpiar filtros |
| `IniciativaNew` | Cargar iniciativa |
| `IniciativaColumnName` | Iniciativa |
| `IniciativaAccountable` | Accountable |
| `IniciativaAreas` | Áreas involucradas |
| `IniciativaViewTooltip` | Ver iniciativa |
| `IniciativaViewAriaLabel` | Abrir iniciativa {0} |
| `IniciativaFormEditTitle` | Editar iniciativa {0} |
| `IniciativaFormName` | Nombre de la iniciativa |
| `IniciativaFormNamePlaceholder` | Ej. Promo vaso coleccionable |
| `IniciativaDescription` | Descripción / impacto esperado |
| `IniciativaFormDescriptionPlaceholder` | Qué se va a hacer y qué se espera lograr |
| `IniciativaDateOutOfRange` | La fecha debe estar entre el {0} y el {1}, las fechas del objetivo. |
| `IniciativaSaveError` | No se pudo guardar la iniciativa. |
| `SaveChanges` | Guardar cambios |
| `Accept` | Aceptar |
| `IniciativaConfirmCreate` | Estás por cargar la iniciativa. ¿Querés continuar? |
| `IniciativaConfirmEdit` | Estás por guardar los cambios de la iniciativa. ¿Querés continuar? |
| `IniciativaConfirmStatus` | Estás por cambiar el estado de la iniciativa "{0}" de {1} a {2}. ¿Querés continuar? |
| `IniciativaCreated` | La iniciativa "{0}" se ha cargado correctamente. |
| `IniciativaUpdated` | La iniciativa "{0}" se ha actualizado correctamente. |
| `IniciativaInfoSection` | Información de la iniciativa |
| `IniciativaFieldWeightObjective` | Peso en el objetivo |
| `IniciativaCommentSection` | Comentario ejecutivo |
| `IniciativaCommentEmpty` | Todavía no hay comentario ejecutivo. |
| `IniciativaCommentPlaceholder` | Situación de la iniciativa en tus palabras |
| `IniciativaNotFound` | No se encontró la iniciativa. |
| `IniciativaLoadError` | No se pudo cargar la iniciativa. |
| `IniciativaChangeStatus` | Cambiar estado |
| `IniciativaStatusPanelTitle` | Cambiar estado de la iniciativa |
| `IniciativaStatusSaveError` | No se pudo cambiar el estado de la iniciativa. |
| `IniciativaStatusUpdated` | El estado de la iniciativa "{0}" se ha actualizado correctamente. |
| `ObjetivoInitiativesSection` | Iniciativas ({0}) |
| `ObjetivoInitiativesEmpty` | Este objetivo no tiene iniciativas cargadas. |
| `IniciativaAddTooltip` | Agregar iniciativa |

Claves que se reutilizan porque representan el mismo concepto:

| Uso | Clave existente |
|---|---|
| Botón y panel "Filtros" | `PalancasFilters` |
| Columnas ID, Objetivo, Peso, Estado, Ver | `ObjetivoColumnId`, `ObjetivoColumnName`, `ObjetivoColumnWeight`, `ObjetivoColumnStatus`, `ObjetivoColumnView` |
| Filtro y dato Departamento | `ObjetivoFieldDepartment` |
| Campo y dato Estado | `ObjetivoFormStatus` |
| Fechas | `ObjetivoFormStartDate`, `ObjetivoFormCommitmentDate`, `ObjetivoFieldStartDate`, `ObjetivoFieldCommitmentDate` |
| "Peso en el departamento" | `ObjetivoFieldWeight` |
| "—" | `ObjetivoNoValue` |
| Placeholder "Seleccionar" | `ObjetivoFormSelect` |
| Compromiso anterior al inicio | `ObjetivoDateOrder` |
| Error al cargar el panel | `ObjetivoFormLoadError` |
| Título "ID · nombre" | `ObjetivoDetailTitle` |
| Obligatorio, Volver, Cancelar, Editar | `RequiredField`, `Back`, `Cancel`, `Edit` |
| Migas | `BreadcrumbHome`, `BreadcrumbPalancas`, `BreadcrumbAriaLabel` |
