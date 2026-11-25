# Data Model: Roles y permisos

Esta feature no crea listas ni columnas. Usa la lista `Usuario`, que ya existe, y cuatro grupos de SharePoint que crea la usuaria ([plan](./plan.md), P1 y P2).

## Rol y grupo (`Rol` en `src/core/utils/Constants.ts`)

| Rol | Valor del enum / de la columna | Grupo de SharePoint | Precedencia (mayor = más permisos) |
|---|---|---|---|
| Administrador | `Administrador` | `Administrador` | 4 |
| CargadorObjetivo | `CargadorObjetivo` | `CargadorObjetivo` | 3 |
| Usuario | `Usuario` | `Usuario` | 2 |
| Visualizador | `Visualizador` | `Visualizador` | 1 |

- El nombre del grupo es el valor de `Rol`, sin tabla de correspondencia: un rol no puede tener un nombre en la columna y otro en el grupo.
- El enum `Rol` ya existe; solo se corrige el valor de `CargadorObjetivo` (era `"Cargador objetivo"`).
- Sin grupo de rol: no hay rol (`undefined`). No existe un valor "sin rol" en el enum ni en la columna.

## Usuario (`Lista.Usuario` = "Usuario")

La entidad y el datasource ya existen. Lo que cambia es el uso de `Rol` y de `Activo`.

| Atributo (entidad) | Columna (interna) | Tipo | Regla de esta feature |
|---|---|---|---|
| `Usuario` | `Usuario` (persona) | un valor | La persona del directorio. Clave de búsqueda del alta: si ya hay un elemento con esa persona, el alta lo reutiliza. |
| `Rol` | `Rol` | Opción | Una persona, un rol (FR-001). Valores del enum `Rol`. **Columna a confirmar (P1)**: el código ya la lee y la escribe. Debe coincidir con el grupo de la persona (FR-015). |
| `Activo` | `Activo` (sí/no) | — | La baja lo pone en `false` y conserva el elemento y su `Rol`. Una persona inactiva no está en ningún grupo de rol. |
| `Departamento`, `Gerencia`, `Area` | lookups | — | Los envía quien invoque el alta; esta feature no los valida (los valida el ABM, RF-20). |

### Invariante que mantiene el servicio

Para toda persona dada de alta o modificada por el servicio:

| Estado de la lista | Pertenencia a grupos de rol |
|---|---|
| `Activo = true`, `Rol = R` | Está en el grupo de `R` y en ningún otro grupo de rol. |
| `Activo = false` | No está en ningún grupo de rol. |

Si alguien edita la lista o los grupos por fuera de la aplicación, la invariante se rompe y no se repara sola (FR-022). El servicio la reconstruye en la siguiente operación sobre esa persona porque consulta la pertenencia real antes de quitar.

## Permisos (calculados, no se guardan)

Resultado de `getPermisos(rol, persona)`; contrato en [contracts/permisos.md](./contracts/permisos.md).

| Permiso | Visualizador | Usuario | CargadorObjetivo | Administrador | Propiedad que lo recibe hoy |
|---|---|---|---|---|---|
| `canManagePalancas` | no | no | no | sí | `canManage` |
| `canCreateObjetivo` | no | no | sí | sí | `canCreateObjetivo` |
| `canEditObjetivo` (incluye pesos y marca VP RRII) | no | no | no | sí | `canEditObjetivo` |
| `canCreateIniciativa` | no | sí | sí | sí | `canCreate` / `canCreateIniciativa` |
| `canLoadResultadosClave` (alta) | no | sí | sí | sí | `canLoadResultadosClave` |
| `canCreateTarea` | no | sí | sí | sí | `canCreate` / `canCreateTarea` |
| `canViewPesos` | no | no | sí | sí | nueva |
| `canEditIniciativa(accountable)` (editar, resultados clave y cambiar estado) | no | solo si `accountable.Id` es el usuario actual | sí | sí | `canEdit`, `canChangeEstado` |
| `canTrackResultadoClave(accountable)` | no | solo si `accountable.Id` es el usuario actual | sí | sí | `canTrackResultadoClave` |
| `canUpdateTarea(responsable, accountable)` (editar y registrar avance) | no | solo si `responsable.Id` o `accountable.Id` es el usuario actual | sí | sí | `canEdit`, `canRegisterProgress` |
| `canManageUsuarios` (servicio de personas) | no | no | no | sí | solo el servicio |

El estado de la tarea o de la iniciativa (por ejemplo, Cancelada) sigue regido por la 004 y la 007: el permiso de rol no lo salta (FR-017a y FR-027a de la 007).

## Estado de sesión (no se persiste)

| Estado | Valores | Quién lo guarda |
|---|---|---|
| Carga del rol | `loading` · `ready` (con rol o sin rol) · `error` | `PermisosProvider` |
| Usuario actual | `IPersonValue` (`Id`, `Title`, `EMail`) | `useCurrentUser` (existente) |
| Permisos vigentes | `IPermisos` | `PermisosProvider`; se recalculan en cada `verificar()` |

## Errores

| Error | Cuándo | Qué hace el llamador |
|---|---|---|
| `PermisoDenegadoError` | Una verificación previa al guardado, o el servicio de personas, detecta que la persona no tiene permiso | No guarda; muestra "No tenés permiso para realizar esta acción." |
| `UsuarioRolError` (`deshecho: boolean`) | Falla un paso del servicio de personas | Informa en una línea que la operación no pudo completarse |
| Cualquier otro error | Falla técnica | Mensaje de falla de guardado propio de cada pantalla, como hoy |

## Datos de los mocks

| Dato | Valor |
|---|---|
| Usuario actual | `USUARIO_PRUEBA` (Id 10), sin cambios |
| Rol del mock | `localStorage['rolMock']`: `Visualizador`, `Usuario`, `CargadorObjetivo`, `Administrador`, `sin-rol` o `falla`; sin clave, `Administrador` |
| Accountable | Iniciativas 1 y 4: `USUARIO_PRUEBA`; 2 y 5: Bárbara; 3 y 11: María |
| Responsable de tareas | Tarea 2 (iniciativa 1): `USUARIO_PRUEBA`; tarea 1 (iniciativa 1): Bárbara; **nueva**: una tarea de la iniciativa 5 con `USUARIO_PRUEBA` como responsable |
| Servicio de personas | Lista y grupos en memoria, con la lista `USUARIO_PRUEBA`, Bárbara, María y un inactivo, y una falla inyectable por paso |
