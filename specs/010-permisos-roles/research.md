# Research: Roles y permisos

Hallazgos del repo y decisiones previas al diseño. Referencias a la [spec](./spec.md) y al [plan](./plan.md).

## R1. Lo que ya existe del rol y del usuario actual

- `Rol` ya es un `enum` en `src/core/utils/Constants.ts` (Administrador, `CargadorObjetivo = "Cargador objetivo"` con espacio, Usuario, Visualizador). La columna de la lista usa `CargadorObjetivo` sin espacio (confirmado por la usuaria): se corrige el valor del enum.
- La entidad `Usuario` ya mapea `Rol` como opción (`toChoiceValue`) y la escribe con `assertChoiceValue`; `UsuarioDataSource` ya lo pide en el `select`. Es decir, el código **ya usa** una columna `Rol` de la lista Usuario: si no existiera en el sitio, `getItems` fallaría hoy. Hay que confirmar con la usuaria que la columna existe en dev y qué valores tiene (P1).
- `IUsuarioDataSource.getCurrentUser()` devuelve `{ Id, Title, EMail }` del usuario actual (`web.currentUser`). `useCurrentUser` elige datasource o mock según `Environment.type`. No hay lectura de grupos.
- `pnpjs-presets.ts` ya importa `@pnp/sp/site-groups`, `site-groups/web`, `site-users` y `security`: no hace falta importar módulos nuevos ni agregar dependencias.

**Decisión**: reutilizar `Rol`, la entidad y el datasource; sumar solo la lectura de los grupos del usuario actual.

## R2. Los permisos "preparados" de las features anteriores

`ObjetivosVp.tsx` define 11 constantes `CAN_*` en `true` y las pasa por propiedades a las pantallas (`canManage`, `canCreateObjetivo`, `canEditObjetivo`, `canCreate`, `canLoadResultadosClave`, `canEdit`, `canChangeEstado`, `canTrackResultadoClave`, `canCreateTarea`, `canRegisterProgress`). Las pantallas ya ocultan lo que no se permite (`canX && <Botón/>`, `onEdit={canX ? … : undefined}`), pero **ninguna verifica al guardar**.

- Permisos **de rol** (no dependen del elemento): `canManage`, `canCreateObjetivo`, `canEditObjetivo`, `canCreate` (iniciativa y tarea), `canLoadResultadosClave`, `canCreateTarea`.
- Permisos **por elemento**: `canEdit`, `canChangeEstado`, `canTrackResultadoClave` (Accountable de la iniciativa) y `TareaDetalle.canEdit` / `canRegisterProgress` (responsable de la tarea o Accountable de su iniciativa). Hoy son booleanos globales; no pueden expresar la regla.

**Decisión**: los de rol siguen siendo booleanos con el mismo nombre, calculados en un único lugar. Los por elemento pasan a ser funciones que reciben a la persona del elemento (D6 del plan).

## R3. Dónde se guarda (para la verificación previa al guardado)

Siete grupos de puntos de escritura, todos con un `catch` que muestra un mensaje fijo de error de guardado:

| Punto | Escribe | Hoy verifica |
|---|---|---|
| `Palancas.tsx` (alta y edición) y `PalancaDetalle.tsx` (edición, inactivar) | Palanca | No |
| `ObjetivoFormPanel.tsx` | Objetivo (alta y edición, pesos, marca VP RRII) | No |
| `IniciativaFormPanel.tsx` (`saveAlta`, `saveEdicion`) | Iniciativa y resultados clave | No |
| `IniciativaEstadoPanel.tsx` | Estado y comentario de la iniciativa | No |
| `ResultadoClaveSeguimientoPanel.tsx` | Seguimiento del resultado clave | No |
| `TareaFormPanel.tsx` | Tarea y su primera entrada | No |
| `TareaAvancePanel.tsx` | Avance y comentario de la tarea | No |

El rollback del alta de iniciativa y de tarea **borra** el elemento creado: quien crea necesita permiso de borrar en esas listas (afecta la tabla de permisos de SharePoint, D12).

## R4. El prototipo frente a la matriz

`index.html` define: `power = Administrador o CargadorObjetivo`; `createObj = power`; `createIni`/`createTar = !Visualizador`; `canEditIni = !Visualizador && (power || es responsable de la iniciativa)`; `canTar = !Visualizador && (power || resp. de la tarea || resp. de la iniciativa)`; `canKR` suma además `k.resp === me` (responsable del resultado clave). La 006 decidió que el resultado clave no tiene responsable, así que ese caso no existe: el seguimiento queda para el Accountable, como pide la matriz.

Pesos en el prototipo (`power`): columna "Objetivo (peso)" de la bandeja (`objTxt` suma ` (peso)`), los dos pesos de "Información de la iniciativa" (`idt.showW`) y la columna de peso de las iniciativas en el detalle del objetivo (`od.showW`). Esta última se agregó a la spec con la decisión de la usuaria (2026-11-24).

## R5. Pesos en lo implementado

- `IniciativasTable` (variante `bandeja`) muestra la columna "Objetivo" como `OBJ-nn · nombre`, **sin peso para nadie**: el "Objetivo (peso)" del prototipo no está implementado. Para CargadorObjetivo y Administrador hay que agregarlo (spec, US3 y FR-013); para los demás queda como hoy.
- La variante `objetivo` muestra la columna Peso (`showWeight`, solo si el objetivo es de la VP RRII) a todos los roles: hay que condicionarla.
- `IniciativaInfo` muestra peso en el objetivo y peso en el departamento a todos los roles: hay que condicionarlo.
- `getPesosIniciativa(iniciativa, delObjetivo, objetivo)` calcula el peso con **todas** las iniciativas del objetivo: la bandeja debe pasarle la lista completa, no la vista filtrada.

## R6. Estados vacíos y pantalla de acceso denegado

Los estados vacíos implementados son una línea de texto dentro de `Table` (`emptyText`), sin ícono. El Design System tiene el patrón `EmptyState` (ícono, título, descripción y botón), que no se usa en ninguna pantalla todavía. Para "ícono y una línea de texto" se usa `EmptyState` con el ícono `lock`; el patrón trae una descripción y un botón por defecto que solo se anulan pasando `description=""` y un `action` vacío (aproximación A1, a confirmar). No se modifica `src/core/ui`.

## R7. Qué puede imponer SharePoint en una lista

Con los niveles de permiso estándar, una lista no distingue "agregar" de "editar": "Colaborar" (Contribute) permite agregar, editar y borrar; "Lectura" solo leer. La matriz sí los distingue en Objetivo (CargadorObjetivo crea, no edita). La usuaria decidió no crear niveles personalizados: CargadorObjetivo tiene "Colaborar" en Objetivo y la edición la controla la aplicación (D12). Los permisos por elemento (Accountable, responsable) no se pueden imponer sin permisos por elemento, que la spec descarta (FR-025): los controla la aplicación.

## R8. Grupos y pertenencia con PnPjs 4.18

- Grupos del usuario actual: `sp.web.currentUser.groups.select('Id','Title')()` (cualquier usuario puede leer los suyos). Incluye los grupos a los que pertenece a través de grupos de seguridad.
- Alta en el grupo: `sp.web.siteGroups.getByName(nombre).users.add(loginName)`; el `loginName` sale de `sp.web.siteUsers.getById(personaId).select('LoginName')()`. Agregar a quien ya es miembro no falla.
- Baja del grupo: `.users.removeById(personaId)`. Si la persona no es miembro puede devolver error según el caso: por eso el servicio consulta antes `sp.web.siteUsers.getById(id).groups` y quita solo de los grupos de rol donde está (D10, y se verifica en dev: P5).
- Agregar y quitar miembros exige ser propietario del grupo (FR-026).

## R9. Mocks existentes

`UsuarioMock` devuelve siempre `USUARIO_PRUEBA` (Id 10), que es Accountable de las iniciativas 1 y 4; responsable de tareas de las iniciativas 1 y 4; y no es responsable de ninguna tarea de una iniciativa ajena. Bárbara (11) es Accountable de las 2 y 5; María (12), de la 3 y la 11. Para probar "responsable de la tarea pero no Accountable" falta una tarea con `USUARIO_PRUEBA` como responsable en una iniciativa de otra persona (D14).
