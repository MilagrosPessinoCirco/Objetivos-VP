# Contrato: permisos en la aplicación

Firmas de referencia para las tareas; no son código final. Decisiones en el [plan](../plan.md) (D3 a D8) y reglas en la [spec](../spec.md) (FR-010 a FR-014).

## Dominio (`src/core/utils/Permisos.ts`)

```ts
import { Rol } from './Constants';
import { IPersonValue } from './Mappers';

export interface IPermisos {
	rol: Rol;
	canManagePalancas: boolean;
	canCreateObjetivo: boolean;
	canEditObjetivo: boolean;
	canCreateIniciativa: boolean;
	canLoadResultadosClave: boolean;
	canCreateTarea: boolean;
	canViewPesos: boolean;
	canManageUsuarios: boolean;
	canEditIniciativa: (accountable?: IPersonValue) => boolean;
	canTrackResultadoClave: (accountable?: IPersonValue) => boolean;
	canUpdateTarea: (responsable?: IPersonValue, accountable?: IPersonValue) => boolean;
}

export const getRolFromGroups = (groupTitles: string[]): Rol | undefined;
export const getPermisos = (rol: Rol, currentUser: IPersonValue): IPermisos;

export class PermisoDenegadoError extends Error {}
```

Reglas:

- `getRolFromGroups` devuelve el rol de más permisos entre los grupos cuyo título coincide con un valor de `Rol` (el grupo se llama igual que el rol); `undefined` si ninguno coincide.
- Los permisos de elemento comparan por `Id` de persona. Con la persona del elemento ausente (`undefined`), un Usuario no tiene permiso; CargadorObjetivo y Administrador sí lo tienen, y Visualizador nunca.
- Un Visualizador devuelve `false` en todos los permisos, y `canViewPesos` también.

## Lectura de los grupos (`src/core/api/Usuario`)

```ts
interface IUsuarioDataSource {
	getCurrentUserGroups(): Promise<string[]>;   // títulos de los grupos del usuario actual
}

function useCurrentRol(): {
	rol?: Rol;
	isLoading: boolean;
	error: boolean;
	reload: () => Promise<Rol | undefined>;   // vuelve a leer los grupos; rechaza si falla
};
```

- El datasource real lee los grupos del usuario actual; el mock los devuelve según `localStorage['rolMock']` (plan, D11), y falla con el valor `falla`.
- `useCurrentRol` usa el datasource en SharePoint y el mock fuera de él, como `useCurrentUser`.

## Proveedor (`components/shared/PermisosProvider.tsx`)

```tsx
<PermisosProvider>   {/* dentro de ThemeProvider, fuera de Router */}
	<Router>…</Router>
</PermisosProvider>

function usePermisos(): { permisos: IPermisos; verificar: () => Promise<IPermisos> };
```

| Estado | Qué renderiza |
|---|---|
| Obteniendo usuario o grupos | `Spinner`, nada más |
| Falla alguna de las dos lecturas | `AccesoDenegado` con "No se pudieron cargar tus permisos." |
| Sin rol | `AccesoDenegado` con "No tenés acceso a esta aplicación." |
| Con rol | Los hijos; `usePermisos()` devuelve los permisos |

`verificar()` vuelve a leer los grupos y devuelve los permisos recalculados con el mismo usuario. Si no hay rol o la lectura falla, rechaza con `PermisoDenegadoError` o con el error de lectura.

## Propiedades de las pantallas

Se mantienen los nombres de las features anteriores; cambia el origen del valor y, en los de elemento, el tipo.

| Pantalla | Propiedad | Tipo hoy | Tipo con esta feature | Origen en `ObjetivosVp.tsx` |
|---|---|---|---|---|
| `Palancas`, `PalancaDetalle` | `canManage` | `boolean` | `boolean` | `permisos.canManagePalancas` |
| `Palancas`, `PalancaDetalle` | `canCreateObjetivo` | `boolean` | `boolean` | `permisos.canCreateObjetivo` |
| `ObjetivoDetalle` | `canEditObjetivo` | `boolean` | `boolean` | `permisos.canEditObjetivo` |
| `ObjetivoDetalle` | `canCreateIniciativa`, `canLoadResultadosClave` | `boolean` | `boolean` | `canCreateIniciativa`, `canLoadResultadosClave` |
| `IniciativasBandeja` | `canCreate`, `canLoadResultadosClave` | `boolean` | `boolean` | ídem |
| `IniciativasBandeja`, `ObjetivoDetalle`, `IniciativaDetalle` | `canViewPesos` | — | `boolean` (nueva) | `permisos.canViewPesos` |
| `IniciativaDetalle` | `canEdit`, `canChangeEstado` | `boolean` | `(accountable?) => boolean` | `permisos.canEditIniciativa` |
| `IniciativaDetalle` | `canTrackResultadoClave` | `boolean` | `(accountable?) => boolean` | `permisos.canTrackResultadoClave` |
| `IniciativaDetalle` | `canLoadResultadosClave`, `canCreateTarea` | `boolean` | `boolean` | ídem |
| `TareasBandeja` | `canCreate` | `boolean` | `boolean` | `permisos.canCreateTarea` |
| `TareaDetalle` | `canEdit`, `canRegisterProgress` | `boolean` | `(responsable?, accountable?) => boolean` | `permisos.canUpdateTarea` |

## Verificación al guardar

| Punto de escritura | Permiso que se verifica | Elemento |
|---|---|---|
| `Palancas.tsx` (alta y edición), `PalancaDetalle.tsx` (edición e inactivar) | `canManagePalancas` | — |
| `ObjetivoFormPanel.tsx` alta | `canCreateObjetivo` | — |
| `ObjetivoFormPanel.tsx` edición | `canEditObjetivo` | — |
| `IniciativaFormPanel.tsx` alta | `canCreateIniciativa` | — |
| `IniciativaFormPanel.tsx` edición, `IniciativaEstadoPanel.tsx` | `canEditIniciativa(iniciativa.Accountable)` | la iniciativa tal como se cargó |
| `ResultadoClaveSeguimientoPanel.tsx` | `canTrackResultadoClave(iniciativa.Accountable)` | la iniciativa del resultado clave |
| `TareaFormPanel.tsx` alta | `canCreateTarea` | — |
| `TareaFormPanel.tsx` edición, `TareaAvancePanel.tsx` | `canUpdateTarea(tarea.Responsable, iniciativa.Accountable)` | la tarea y su iniciativa tal como se cargaron |

Sin permiso: no se escribe nada y el formulario muestra `strings.PermisoDenegado` en una línea. El panel conserva lo ingresado.
