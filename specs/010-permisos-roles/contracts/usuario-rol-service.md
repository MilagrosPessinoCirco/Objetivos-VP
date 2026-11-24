# Contrato: servicio de personas, lista Usuario y grupos

Firmas de referencia para las tareas; no son código final. Decisión en el [plan](../plan.md) (D10) y reglas en la [spec](../spec.md) (FR-014 a FR-022 y FR-029). Sin pantalla ni hook en esta feature.

## Interfaz (`src/core/api/Usuario/IUsuarioRolService.ts`)

```ts
import { Usuario } from '../../entities';
import { Rol } from '../../utils/Constants';

export interface IUsuarioRolService {
	altaUsuario(usuario: Usuario): Promise<Usuario>;                // usuario.Usuario y usuario.Rol obligatorios
	cambiarRol(usuarioId: number, rol: Rol): Promise<Usuario>;
	bajaUsuario(usuarioId: number): Promise<Usuario>;                // Activo = false, conserva el elemento
}

export class UsuarioRolError extends Error {
	deshecho: boolean;   // true: lo hecho se deshizo; false: el deshacer también falló
}
```

Todas las operaciones rechazan con `PermisoDenegadoError` si la persona actual no es Administrador (verificado con una lectura propia de los grupos), sin tocar nada.

## Operaciones sobre los grupos (`IGrupoRolDataSource`)

```ts
interface IGrupoRolDataSource {
	getGruposDe(personaId: number): Promise<Rol[]>;      // grupos de rol en los que está la persona
	agregar(personaId: number, rol: Rol): Promise<void>; // idempotente
	quitar(personaId: number, rol: Rol): Promise<void>;
}
```

La implementación real usa PnPjs (`siteGroups`, `siteUsers`) con el valor del rol como nombre del grupo; la del mock es en memoria.

## Pasos y deshacer

| Operación | Pasos, en orden | Si falla el paso… | Se deshace |
|---|---|---|---|
| Alta | 1. Guardar en la lista (alta, o reactivar con `Activo = true` y el rol nuevo si la persona ya está). 2. Agregar al grupo del rol. | 1 | Nada |
| | | 2 | Borrar el elemento si lo creó esta operación; si ya existía, restaurar sus valores anteriores |
| Cambio de rol | 1. Actualizar `Rol`. 2. Agregar al grupo nuevo. 3. Quitar de los otros grupos de rol donde esté. | 1 | Nada |
| | | 2 | Restaurar el `Rol` anterior |
| | | 3 | Volver a agregar a los grupos de los que ya se la quitó; quitarla del grupo nuevo si no estaba; restaurar el `Rol` |
| Baja | 1. Actualizar `Activo = false`. 2. Quitar de todos sus grupos de rol. | 1 | Nada |
| | | 2 | Volver a agregar a los grupos de los que ya se la quitó; restaurar `Activo = true` |

- Cambio de rol hacia el mismo rol que ya tiene, estando en el grupo correcto: no hace cambios.
- Reintentar una operación que falló no duplica nada: el alta reusa el elemento por persona y agregar a un grupo es idempotente.
- El deshacer se intenta paso por paso: si uno falla, sigue con los demás y la operación termina con `UsuarioRolError` con `deshecho: false`.

## Resultado

| Caso | Resultado |
|---|---|
| Todo bien | Resuelve con el elemento de la lista actualizado |
| Sin permiso | Rechaza con `PermisoDenegadoError` |
| Falla y se deshizo | Rechaza con `UsuarioRolError` (`deshecho: true`) |
| Falla y el deshacer también falló | Rechaza con `UsuarioRolError` (`deshecho: false`) |

El llamador (el ABM, en una feature posterior) informa en una línea que la operación no pudo completarse en los dos últimos casos.

## Mock (`UsuarioRolServiceMock.ts`)

El mismo orquestador, construido con `UsuarioMock` y un `GrupoRolMock` en memoria, y con una falla inyectable:

```ts
type PasoFallido = 'lista' | 'grupo-agregar' | 'grupo-quitar';
createUsuarioRolServiceMock(falla?: { paso: PasoFallido; veces?: number; deshacer?: boolean }): IUsuarioRolService
```

- `paso`: qué operación falla: escribir la lista, agregar a un grupo o quitar de un grupo.
- `veces` (por defecto 1): cantidad de llamadas de ese paso que fallan antes de volver a andar, para probar el reintento.
- `deshacer` (por defecto `false`): si es `true`, cuando ocurre la falla del paso, la primera escritura posterior (el deshacer) también falla una vez.
