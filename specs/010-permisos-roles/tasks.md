---

description: "Tareas de implementación de Roles y permisos"
---

# Tasks: Roles y permisos

**Input**: `specs/010-permisos-roles/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)

**Prerequisites**:

- las features 002 a 008 completas y compilando (`npm run build` sin errores);
- `npm ci` ejecutado;
- prototipo v11 en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (la carpeta dice v5, el contenido es v11);
- `docs/design-system-catalog.md`;
- **requisito previo de cualquier prueba contra el sitio de desarrollo (P1 y P1b del quickstart)**: la columna `Rol` de la lista `Usuario` tiene que tener el valor `CargadorObjetivo` sin espacio (si está como `Cargador objetivo`, la usuaria lo cambia antes de probar: con el enum ya corregido por T002, ese valor se lee como sin rol y escribir esa persona falla), y no deben existir grupos llamados `Administrador`, `CargadorObjetivo`, `Usuario` ni `Visualizador` antes de crearlos. Con mocks no hace falta nada del sitio; los grupos y los permisos de las listas (P2 a P5) son a cargo de la usuaria y solo se necesitan para las fases US5 (parte contra el sitio) y US6.

**Tests**: no se piden. El repo no tiene runner de pruebas y no se agrega ningún framework. Se valida con `npm run build`, con los escenarios de `quickstart.md` y comparando con el prototipo.

**Organization**: las tareas se agrupan por historia de usuario. Cada tarea indica el archivo exacto, los componentes del Design System (DS) cuando es de pantalla, y su criterio de terminado. El orden de las fases sigue las dependencias entre historias y no el número: primero **US1** (entrar según el rol), de la que dependen **US2** (ver solo las acciones permitidas) y **US4** (rechazar el guardado sin permiso); después **US3** (pesos), **US5** (servicio de personas) y **US6** (permisos en las listas de SharePoint).

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: historia de `spec.md`:
  - US1: entrar a la aplicación según el rol;
  - US2: ver solo las acciones que el rol permite;
  - US3: ver los pesos solo con permiso;
  - US4: rechazar el guardado sin permiso;
  - US5: dar de alta, cambiar de rol y dar de baja personas (servicio);
  - US6: permisos en las listas de SharePoint.

## Diferencias respecto de la spec y del plan

Decisiones posteriores al plan, ya incorporadas en `plan.md`, `research.md`, `data-model.md`, `contracts/` y `quickstart.md`. Esos documentos no se modifican durante la implementación: si hay que actualizarlos, se hace del lado de la especificación y se regeneran las tareas.

- **Nombres de los grupos**: iguales a los valores de la columna `Rol` (`Administrador`, `CargadorObjetivo`, `Usuario`, `Visualizador`). No hay constante `GRUPO_ROL`: el título del grupo es el valor del enum `Rol` (plan, D1).
- **Valor del enum**: `Rol.CargadorObjetivo` pasa de `"Cargador objetivo"` a `"CargadorObjetivo"` (plan, D2).
- **Permisos de listas**: solo niveles estándar (Lectura y Colaborar), sin nivel personalizado; CargadorObjetivo tiene Colaborar en `Objetivo` y la aplicación controla la edición (plan, D12).
- **Pantalla de acceso denegado**: `EmptyState` con valores vacíos (A1, aprobada). Si al verla queda con espacio vacío, se arma un componente propio con tokens del DS y se registra como desvío (T037).
- **`rolMock`**: la clave de `localStorage` se lee solo dentro de `UsuarioMock`, solo en modo mock, nunca contra SharePoint (plan, D11; verificado en T038).

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores, lo que incluye lint y tipos.
- **Referencia al prototipo (constitución II)**, en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`: la lógica de roles está en `power` (Administrador o CargadorObjetivo), `isVis` (Visualizador), `canEditIni`, `canKR`, `canTar`, `od.canIni`, `od.showW`, `idt.showW` y `objHdr`. **No reproducir**: el selector "Ver como (simulación de rol)", el menú del usuario con cambio de rol, `k.resp === me` en `canKR` (el resultado clave no tiene responsable desde la 006), ni nada del ABM.
- **Textos**: siempre desde `import * as strings from 'ObjetivosVpWebPartStrings';`. Ningún texto visible escrito en el código. Las claves nuevas son las de T004.
- **`src/core/ui` es de solo lectura.** Imports por capa (`core/ui/components`, `core/ui/patterns`, `core/ui/foundations`), nunca del índice de `core` ni de `core/ui`, con la profundidad de rutas relativa que corresponda al archivo.
- **TypeScript estricto**: sin `any` nuevos (en `core`, las entidades y datasources ya usan `any` para el item de SharePoint: se sigue ese patrón sin agregar otros), sin comentarios de código y sin literales mágicos.
- **Estilos**: solo tokens del DS (`spacing`, `typography`, `colors`, `getColorStep`). Sin hexadecimales. No editar ni versionar `*.module.scss.ts`.
- **Hooks de React**: `useEffect` solo para cargar datos al montar. Lo derivado se calcula durante el render, sin `useMemo`.
- **Un único lugar para los permisos**: ninguna pantalla escribe una condición de rol propia (por ejemplo, comparar con `Rol.Administrador`). Todo sale de `getPermisos` (T003) a través de `usePermisos()`.
- **Fuera de alcance**: la pantalla ABM de usuarios, el resto de M9 y el botón "ABM" de la home, la reasignación de elementos al dejar la VP y el tablero ejecutivo. No se crean rutas nuevas ni se invoca el servicio de personas desde ninguna pantalla.
- **Datos de SharePoint**: el código no crea ni modifica listas, columnas, grupos ni permisos. Se escribe en el sitio de desarrollo solo en T035 y T036, con autorización expresa. No se versionan URLs del sitio.

---

## Phase 1: Setup

**Purpose**: confirmar el punto de partida.

- [ ] T001 Ejecutar `npm run build` en la raíz y confirmar que termina sin errores. Con `git grep -n "Cargador objetivo" -- src` confirmar que el único uso es `src/core/utils/Constants.ts` (el enum `Rol`) y con `git grep -n "rolMock" -- src` que no hay ninguno. Si hay otros usos, detenerse y avisar. Terminado cuando el build pasa y los dos resultados están confirmados.

---

## Phase 2: Foundational (bloquea todas las historias)

**Purpose**: dominio de permisos, textos, lectura de grupos del usuario actual y datos de prueba.

- [ ] T002 Editar `src/core/utils/Constants.ts`: en el enum `Rol`, cambiar el valor `CargadorObjetivo = "Cargador objetivo"` por `CargadorObjetivo = "CargadorObjetivo"`. No cambiar el identificador ni los otros tres valores. Terminado cuando `git grep -n "Cargador objetivo" -- src` no devuelve nada y el build pasa.
- [ ] T003 [P] Crear `src/core/utils/Permisos.ts` con el dominio puro de [contracts/permisos.md](./contracts/permisos.md) (sin React ni acceso a datos; no importar desde `./index` ni `./Error`, para no tapar el `Error` global):
  - `IPermisos` con exactamente: `rol: Rol`, `canManagePalancas`, `canCreateObjetivo`, `canEditObjetivo`, `canCreateIniciativa`, `canLoadResultadosClave`, `canCreateTarea`, `canViewPesos`, `canManageUsuarios` (todos `boolean`) y `canEditIniciativa(accountable?: IPersonValue)`, `canTrackResultadoClave(accountable?: IPersonValue)`, `canUpdateTarea(responsable?: IPersonValue, accountable?: IPersonValue)` (todas devuelven `boolean`).
  - `getRolFromGroups(groupTitles: string[]): Rol | undefined`: cruza los títulos con los **valores** del enum `Rol` (el grupo se llama igual que el rol) y devuelve el de más permisos según la precedencia `Administrador` (4) > `CargadorObjetivo` (3) > `Usuario` (2) > `Visualizador` (1), definida como una constante local tipada. Sin coincidencias, `undefined`.
  - `getPermisos(rol: Rol, currentUser: IPersonValue): IPermisos` con la matriz de [data-model.md](./data-model.md) ("Permisos"): Administrador todo `true`; CargadorObjetivo todo `true` salvo `canManagePalancas`, `canEditObjetivo` y `canManageUsuarios` en `false`; Usuario solo `canCreateIniciativa`, `canLoadResultadosClave` y `canCreateTarea` en `true`, `canEditIniciativa` y `canTrackResultadoClave` verdaderos solo si `accountable?.Id === currentUser.Id`, `canUpdateTarea` verdadero solo si `responsable?.Id === currentUser.Id` o `accountable?.Id === currentUser.Id`; Visualizador todo `false`. Con la persona del elemento `undefined`, un Usuario no tiene permiso.
  - `PermisoDenegadoError` (clase que extiende el `Error` global, con `name = 'PermisoDenegadoError'` y `Object.setPrototypeOf(this, PermisoDenegadoError.prototype)` para que funcione con el target del build), `isPermisoDenegadoError(error: unknown): boolean` (compara por `name`, no por `instanceof`) y `assertPermiso(allowed: boolean): void` que lanza `PermisoDenegadoError` si `allowed` es `false`.
  - Terminado cuando compila, con los nombres exactos anteriores, sin `any` y sin importar React ni nada de `core/api`.
- [ ] T004 [P] Agregar las claves de texto en `src/webparts/objetivosVp/loc/mystrings.d.ts` (al final de la interfaz `IObjetivosVpWebPartStrings`) y en `src/webparts/objetivosVp/loc/en-us.js` (al final del objeto, antes del cierre), con la misma clave en ambos y sin duplicar las existentes: `AccesoDenegado` = `No tenés acceso a esta aplicación.`, `PermisosLoadError` = `No se pudieron cargar tus permisos.`, `PermisoDenegado` = `No tenés permiso para realizar esta acción.` y `ObjetivoColumnNameWeight` = `Objetivo (peso)`. Terminado cuando el build pasa y las cuatro claves están en los dos archivos.
- [ ] T005 Editar la lectura de los grupos del usuario actual, en un solo cambio para que el build quede en verde: `src/core/api/Usuario/IUsuarioDataSource.ts` agrega `getCurrentUserGroups(): Promise<string[]>;` (títulos de los grupos del usuario actual); `src/core/api/Usuario/UsuarioDataSource.ts` lo implementa con `this._sp.web.currentUser.groups.select('Id', 'Title')()` devolviendo los `Title`, sin imports de PnPjs nuevos (`site-groups` y `site-users` ya están en `src/core/pnp/sp/pnpjs-presets.ts`); y `src/core/api/Usuario/UsuarioMock.ts` lo implementa leyendo `window.localStorage.getItem('rolMock')` **solo dentro de ese método** (único lugar del código que conoce esa clave), dentro de un `try/catch` que ante almacenamiento bloqueado usa el valor por defecto. Valores del mock: `Visualizador`, `Usuario`, `CargadorObjetivo`, `Administrador` (devuelve `[valor]`, porque el grupo se llama igual que el rol), `sin-rol` (devuelve `[]`) y `falla` (rechaza con un `Error`); sin clave o con un valor desconocido, `Administrador`. Los valores van como constantes locales tipadas a partir del enum `Rol`. Terminado cuando el build pasa y `git grep -n "rolMock" -- src` solo aparece en `UsuarioMock.ts`. Depende de T002.
- [ ] T006 Crear `src/core/api/Usuario/useCurrentRol.ts`: hook `useCurrentRol(): { rol?: Rol; isLoading: boolean; error: boolean }`, con el mismo criterio de elección de `useCurrentUser.ts`: el datasource real solo si `Environment.type === EnvironmentType.SharePoint` y `listTitle` no está vacío, y en cualquier otro caso `UsuarioMock`. Llama a `getCurrentUserGroups()` una vez al montar (`useEffect`), deduce el rol con `getRolFromGroups` (T003) y ante un rechazo registra con `console.error('No se pudieron obtener los grupos del usuario actual.', error)` y devuelve `error: true`. Expone también `reload(): Promise<Rol | undefined>` que vuelve a pedir los grupos y rechaza si falla (lo usará `verificar()` del proveedor). Terminado cuando compila. Depende de T003 y T005.
- [ ] T007 [P] Editar `src/core/api/Tarea/TareaMock.ts` (datos de prueba, decisión D14 del plan): agregar una tarea en la iniciativa 5 (`INICIATIVA_CATALOGO`, Accountable Bárbara) con `responsable: USUARIO_PRUEBA`, estado En curso, fechas dentro de las de esa iniciativa y un `id` nuevo, siguiendo el formato de las filas existentes. Si ya existe una tarea de la iniciativa 5 con `USUARIO_PRUEBA` como responsable, no agregar nada y dejarlo asentado en el criterio. En `src/core/api/Iniciativa/IniciativaMock.ts` confirmar que en un mismo objetivo de la VP RRII hay una iniciativa con `USUARIO_PRUEBA` como Accountable y otra con otra persona (hoy: iniciativas 1 y 2 en el objetivo 1); no modificar si ya se cumple. Terminado cuando el build pasa y los escenarios U3 y U4 del quickstart tienen datos.

**Checkpoint**: dominio, textos, lectura de grupos (real y mock) y datos de prueba listos.

---

## Phase 3: User Story 1 - Entrar a la aplicación según el rol (Priority: P1) 🎯 MVP

**Goal**: la aplicación obtiene el rol; sin rol o con falla muestra el acceso denegado en cualquier ruta; con rol entra.

**Independent Test**: escenarios A1 a A5 del quickstart, con `localStorage.setItem('rolMock', …)` y recarga.

**Referencia**: no está en el prototipo; sigue el diseño de los estados vacíos (spec, FR-006a).

- [ ] T008 [P] [US1] Crear `src/webparts/objetivosVp/components/Permisos/AccesoDenegado/AccesoDenegado.tsx`: componente `AccesoDenegado: React.FC<{ message: string }>`. Usa `EmptyState` de `core/ui/patterns` con `title={message}`, `description=""`, `action={<></>}` (para que no aparezcan la descripción ni el botón por defecto: aproximación A1, aprobada) e `icon={<FigmaIcon name="lock" />}` de `core/ui/foundations`. Sin Volver, sin menú, sin migas de pan, sin botón de reintento, sin textos de ayuda. Terminado cuando compila y, con un mensaje de prueba, muestra el ícono y una línea de texto centrados. Si queda con espacio vacío, ver T037.
- [ ] T009 [US1] Crear `src/webparts/objetivosVp/components/shared/PermisosProvider.tsx` según [contracts/permisos.md](./contracts/permisos.md) ("Proveedor"): contexto de React con `PermisosProvider` y `usePermisos(): { permisos: IPermisos; verificar: () => Promise<IPermisos> }`. Usa `useCurrentUser` (existente) y `useCurrentRol` (T006). Estados: obteniendo usuario o grupos → `Spinner` de `core/ui/patterns` (el ya implementado) y nada más; falla de cualquiera de las dos lecturas → `AccesoDenegado` con `strings.PermisosLoadError`; sin rol → `AccesoDenegado` con `strings.AccesoDenegado`; con rol → los hijos, con `permisos = getPermisos(rol, user)`. `verificar()` llama a `reload()` de `useCurrentRol`, recalcula con el mismo usuario y devuelve los permisos; si no hay rol rechaza con `PermisoDenegadoError`, y si la lectura falla rechaza con ese error. `usePermisos()` fuera del proveedor lanza un `Error` claro. Terminado cuando compila. Depende de T003, T004, T006 y T008.
- [ ] T010 [US1] Editar `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`: envolver `<Router>` con `<PermisosProvider>`, dentro de `ThemeProvider` y fuera de `Router`, de modo que ninguna ruta, incluidos los links directos, se resuelva antes de conocer el rol. Mantener por ahora las constantes `CAN_*` (T014 las reemplaza). Terminado cuando, con el rol `sin-rol`, `#/`, `#/iniciativa` y `#/tarea` muestran el acceso denegado, y con `Usuario` la home se ve igual que antes. Depende de T009.
- [ ] T011 [US1] Validar con `npm start` los escenarios A1 a A5 del quickstart (rol `sin-rol`, `falla`, carga con red lenta, cada rol entra a la home sin selector "Ver como"). Terminado cuando coinciden los resultados esperados; anotar cualquier diferencia. Depende de T010.

**Checkpoint**: la aplicación bloquea a quien no tiene rol en todas las rutas. MVP.

---

## Phase 4: User Story 2 - Ver solo las acciones que el rol permite (Priority: P1)

**Goal**: cada rol ve únicamente los botones, lápices, "+" y acciones de fila que puede usar, con los permisos calculados en un único lugar.

**Independent Test**: escenarios R1 a R11 y U1 a U7 del quickstart para cada rol.

**Referencia**: `power`, `isVis`, `canEditIni`, `canKR`, `canTar`, `od.canIni` del prototipo.

- [ ] T012 [US2] Editar `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx`: cambiar las propiedades `canEdit`, `canChangeEstado` y `canTrackResultadoClave` de `boolean` a `(accountable?: IPersonValue) => boolean` (importar `IPersonValue` de `core/utils/Mappers`; dejar `canLoadResultadosClave` y `canCreateTarea` como `boolean`). Evaluarlas con `iniciativa?.Accountable`: crear tres constantes derivadas durante el render (`canEditar`, `canCambiarEstado`, `canSeguir`) y usarlas donde hoy se usan las propiedades (`onEdit` de `IniciativaInfo`, `onEdit` de `IniciativaComentario`, `onTrack` de `IniciativaResultadosClave`, y los botones Editar y "Cambiar estado" del pie, que no se muestran si es `false`, sin deshabilitarlos). No cambiar nada más. Para que el build siga en verde, editar en la misma tarea la ruta de `IniciativaDetalle` en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx` y pasar `canEdit={() => CAN_EDIT_INICIATIVA}`, `canChangeEstado={() => CAN_CHANGE_ESTADO_INICIATIVA}` y `canTrackResultadoClave={() => CAN_TRACK_RESULTADO_CLAVE}` (las constantes siguen hasta T014). Terminado cuando compila; la pantalla se ve igual con funciones que devuelven `true`.
- [ ] T013 [US2] Editar `src/webparts/objetivosVp/components/Tarea/TareaDetalle/TareaDetalle.tsx`: cambiar `canEdit` y `canRegisterProgress` de `boolean` a `(responsable?: IPersonValue, accountable?: IPersonValue) => boolean`. Evaluarlas con `tarea?.Responsable` e `iniciativa?.Accountable` en las constantes `canRegister` y `canEditar` (hoy `canRegisterProgress && tarea !== undefined && canRegistrarAvance(tarea)` y `canEdit && tarea !== undefined && canEditTarea(tarea)`), conservando las reglas de estado de la 007 (`canRegistrarAvance`, `canEditTarea`). Para que el build siga en verde, editar en la misma tarea la ruta de `TareaDetalle` en `ObjetivosVp.tsx` y pasar `canEdit={() => CAN_EDIT_TAREA}` y `canRegisterProgress={() => CAN_REGISTER_PROGRESS_TAREA}`. Terminado cuando compila y una tarea Cancelada sigue sin ofrecer Editar ni "Registrar avance". Depende de T012 (mismo archivo `ObjetivosVp.tsx`).
- [ ] T014 [US2] Editar `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`: eliminar las once constantes `CAN_*` y, dentro de `ObjetivosVpRoutes`, leer `const { permisos } = usePermisos();` (T009) y pasar a cada pantalla, con los mismos nombres de propiedad que hoy: `canManage={permisos.canManagePalancas}`; `canCreateObjetivo={permisos.canCreateObjetivo}`; `canEditObjetivo={permisos.canEditObjetivo}`; `canCreate` / `canCreateIniciativa={permisos.canCreateIniciativa}` (bandeja de iniciativas y detalle del objetivo); `canLoadResultadosClave={permisos.canLoadResultadosClave}`; `canCreateTarea={permisos.canCreateTarea}` y `canCreate={permisos.canCreateTarea}` (bandeja de tareas); `canEdit` y `canChangeEstado={permisos.canEditIniciativa}` y `canTrackResultadoClave={permisos.canTrackResultadoClave}` en `IniciativaDetalle`; y `canEdit` y `canRegisterProgress={permisos.canUpdateTarea}` en `TareaDetalle`. Terminado cuando `git grep -n "CAN_" -- src` no devuelve nada, compila, y Administrador ve todo como antes. Depende de T010, T012 y T013.
- [ ] T015 [US2] Revisar, sin cambiar si ya cumplen, que cada pantalla oculte (no deshabilite) la acción cuando su propiedad es `false`, comparando con FR-011: `Palanca/Palancas/PalancasHeader/PalancasHeader.tsx` ("Nueva palanca" y "Cargar objetivo"), `Palanca/Palancas/PalancasTable/PalancasTable.tsx` (lápiz de la fila), `Palanca/PalancaDetalle/PalancaDetalle.tsx` ("+" de objetivos y Editar del pie), `Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx` (Editar y lápices), `Objetivo/ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx` ("+" de Iniciativas), `Iniciativa/IniciativasBandeja/IniciativasHeader/IniciativasHeader.tsx` ("Cargar iniciativa" y "Cargar tarea"). Si alguna muestra la acción deshabilitada o la deja visible con la propiedad en `false`, corregirla con el cambio mínimo. Terminado cuando el Visualizador no ve en ninguna de esas pantallas un botón, lápiz o "+" de carga o edición, y sí ve "Ver", la búsqueda, los filtros, Actualizar y la navegación.
- [ ] T016 [US2] Validar con `npm start` los escenarios R1 a R11 y U1 a U7 del quickstart con cada uno de los cuatro roles del mock (Usuario con `USUARIO_PRUEBA`: Accountable de las iniciativas 1 y 4, responsable de la tarea 2 y de la tarea agregada en T007). Terminado cuando todos coinciden; anotar cualquier diferencia. Depende de T007, T014 y T015.

**Checkpoint**: la interfaz muestra solo lo permitido por rol y por elemento.

---

## Phase 5: User Story 4 - Rechazar el guardado sin permiso (Priority: P1)

**Goal**: antes de guardar, la aplicación vuelve a verificar el permiso; sin permiso no guarda y muestra en una línea "No tenés permiso para realizar esta acción.".

**Independent Test**: escenarios G1 a G8 (incluidos G6b y G8) del quickstart (cambiar `rolMock` sin recargar y guardar).

**Patrón común de todas las tareas**: en el punto de escritura, dentro del `try` que ya existe, antes de escribir:

```ts
const { verificar } = usePermisos();
// …
const permisos = await verificar();
assertPermiso(permisos.canXxx(...));
```

y en el `catch`, `setSaveError(isPermisoDenegadoError(error) ? strings.PermisoDenegado : <mensaje de falla de esa pantalla>)` (o la variante equivalente con el estado que ya use la pantalla) en lugar del mensaje fijo, sin cambiar el comportamiento de los demás errores. Se evalúa con el elemento **tal como se cargó** (la propiedad), no con el valor editado en el formulario. `usePermisos`, `assertPermiso` e `isPermisoDenegadoError` vienen de T009 y T003. El panel conserva lo ingresado y no se cierra.

- [ ] T017 [P] [US4] Palancas. Editar `src/webparts/objetivosVp/components/Palanca/PalancaForm/PalancaForm.tsx`: el `catch` de `save` muestra `strings.PermisoDenegado` si `isPermisoDenegadoError(error)` y `strings.PalancaSaveError` en el resto (hoy `saveFailed` es un booleano: pasar a un estado con el texto a mostrar, manteniendo el `MessageBar` de error). Editar `Palanca/Palancas/Palancas.tsx`: al inicio de `createPalanca` y de `updatePalanca`, verificar `canManagePalancas`. Editar `Palanca/PalancaDetalle/PalancaDetalle.tsx`: al inicio de `updatePalanca`, verificar `canManagePalancas`. Terminado cuando el escenario G1 del quickstart (editar palanca con el rol cambiado a `Visualizador`) se rechaza con el mensaje y no escribe nada, y alta y edición válidas siguen guardando.
- [ ] T018 [P] [US4] Objetivos. Editar `src/webparts/objetivosVp/components/Objetivo/ObjetivoForm/ObjetivoForm.tsx` (el `catch` de `save`, con `strings.ObjetivoSaveError` en el resto) y `Objetivo/ObjetivoForm/ObjetivoFormPanel.tsx`: al inicio de `save`, verificar `canEditObjetivo` si hay `objetivo` (edición) y `canCreateObjetivo` si no (alta). Terminado cuando los escenarios G6 (edición con `CargadorObjetivo`) y G6b (alta con `Usuario`) se rechazan, y un CargadorObjetivo puede crear un objetivo.
- [ ] T019 [P] [US4] Iniciativas. Editar `src/webparts/objetivosVp/components/Iniciativa/IniciativaForm/IniciativaForm.tsx` (el `catch` de `save`, con `strings.IniciativaSaveError` en el resto) e `Iniciativa/IniciativaForm/IniciativaFormPanel.tsx`: al inicio de `save` (antes de `saveAlta` y `saveEdicion`, de modo que un rechazo no cree nada ni dispare el rollback), verificar `canCreateIniciativa` si no hay `iniciativa` y `canEditIniciativa(iniciativa.Accountable)` si hay (con la iniciativa de la propiedad, no la editada: el escenario G3 cambia el Accountable en el formulario y debe seguir guardando). Terminado cuando G3 y G4 se comportan como indica el quickstart y el alta con resultados clave sigue funcionando.
- [ ] T020 [P] [US4] Cambio de estado. Editar `src/webparts/objetivosVp/components/Iniciativa/IniciativaEstadoPanel/IniciativaEstadoPanel.tsx`: dentro del `try` de `save`, antes del primer `addComentario`, verificar `canEditIniciativa(iniciativa.Accountable)`; el `catch` muestra `strings.PermisoDenegado` o `strings.IniciativaStatusSaveError`. Terminado cuando con el rol cambiado a `Visualizador` el guardado se rechaza sin registrar el comentario ni cambiar el estado.
- [ ] T021 [US4] Seguimiento de resultados clave. Editar `src/webparts/objetivosVp/components/Iniciativa/ResultadoClaveSeguimientoPanel/ResultadoClaveSeguimientoPanel.tsx`: agregar la propiedad opcional `accountable?: IPersonValue`; dentro del `try` de `save`, antes de `addComentario`, verificar `canTrackResultadoClave(accountable)`; el `catch` muestra `strings.PermisoDenegado` o `strings.ResultadoClaveSaveError` (cambiar el booleano `saveFailed` por un estado con el texto). Editar `Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` (después de T012) para pasar `accountable={iniciativa?.Accountable}` al panel. Terminado cuando el seguimiento se rechaza sin permiso y funciona para el Accountable, CargadorObjetivo y Administrador.
- [ ] T022 [P] [US4] Tareas, alta y edición. Editar `src/webparts/objetivosVp/components/Tarea/TareaForm/TareaFormPanel.tsx`: agregar la propiedad opcional `accountable?: IPersonValue` (solo se usa al editar); al inicio de `save` (alta) verificar `canCreateTarea`, antes de consultar el tope de tareas, y al inicio de `saveEdicion` verificar `canUpdateTarea(tarea.Responsable, accountable)`. Editar `Tarea/TareaForm/TareaForm.tsx`: el `catch` de `save` distingue tres casos: error de tope (como hoy), `isPermisoDenegadoError` (muestra `strings.PermisoDenegado` en el mismo lugar que el mensaje de falla de guardado) y el resto (`strings.TareaSaveError`). Terminado cuando el alta y la edición se rechazan sin permiso y el tope de 10 tareas sigue mostrando su error en el campo Iniciativa.
- [ ] T023 [P] [US4] Tareas, avance. Editar `src/webparts/objetivosVp/components/Tarea/TareaAvancePanel/TareaAvancePanel.tsx`: agregar la propiedad opcional `accountable?: IPersonValue`; dentro del `try` de `save`, antes de `addEntrada`, verificar `canUpdateTarea(tarea.Responsable, accountable)`; el `catch` muestra `strings.PermisoDenegado` o `strings.TareaProgressSaveError` (cambiar el booleano `saveFailed` por un estado con el texto). Terminado cuando, con el rol cambiado a `Visualizador`, no queda ninguna entrada nueva en el historial.
- [ ] T024 [US4] Editar `src/webparts/objetivosVp/components/Tarea/TareaDetalle/TareaDetalle.tsx` (después de T013): pasar `accountable={iniciativa?.Accountable}` a `TareaFormPanel` y a `TareaAvancePanel`. Terminado cuando compila y el Usuario responsable (no Accountable) puede guardar un avance, mientras que un Usuario ajeno a la tarea no ve la acción. Depende de T013, T022 y T023.
- [ ] T025 [US4] Validar con `npm start` los escenarios G1 a G8 (incluidos G6b y G8) del quickstart (cambiando `localStorage['rolMock']` sin recargar). Terminado cuando todos coinciden y en cada rechazo no se escribió nada. Depende de T017 a T024.

**Checkpoint**: ningún guardado se hace sin permiso, aunque la interfaz lo permitiera.

---

## Phase 6: User Story 3 - Ver los pesos solo con permiso (Priority: P2)

**Goal**: los pesos de las iniciativas se muestran solo a CargadorObjetivo y Administrador.

**Independent Test**: escenarios W1 a W7 del quickstart.

**Referencia**: `objHdr` (encabezado "Objetivo (peso)" y texto del objetivo con el peso), `idt.showW` y `od.showW` del prototipo.

- [ ] T026 [P] [US3] Editar `src/webparts/objetivosVp/components/Iniciativa/IniciativasTable/IniciativasTable.tsx`: agregar las propiedades `canViewPesos?: boolean` y `todasLasIniciativas?: Iniciativa[]`. Variante `bandeja` con `canViewPesos`: el encabezado de la columna Objetivo es `strings.ObjetivoColumnNameWeight` y la celda agrega al texto el peso entre paréntesis, con el formato `OBJ-nn · nombre (12,5%)` (usar `getPesosIniciativa(iniciativa, todasLasIniciativas filtradas por el mismo objetivo, objetivo encontrado)` y `formatPeso(...)` + `%`, igual que `pesoText`), solo cuando el peso existe (objetivos de la VP RRII, iniciativa no cancelada); sin `canViewPesos`, queda como hoy ("Objetivo", sin peso). Variante `objetivo`: `showWeight` pasa a exigir también `canViewPesos`. Terminado cuando compila, los dos casos se ven como indica W1, W2, W5 y W6, y el peso de una iniciativa no cambia con la búsqueda ni los filtros (W7).
- [ ] T027 [US3] Editar `src/webparts/objetivosVp/components/Iniciativa/IniciativasBandeja/IniciativasBandeja.tsx` para pasar a `IniciativasTable` `canViewPesos` y `todasLasIniciativas={iniciativas}` (la lista completa que el componente ya tiene, no `pageItems` ni la vista filtrada); agregar la propiedad opcional `canViewPesos?: boolean` al componente (opcional para que el build siga en verde hasta T029). Editar `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx` y `Objetivo/ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx` para recibir `canViewPesos?: boolean` (opcional) y pasarlo a `IniciativasTable`. Terminado cuando compila. Depende de T026.
- [ ] T028 [US3] Editar `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx`: agregar la propiedad opcional `canViewPesos?: boolean` y pasar a `IniciativaInfo` `pesos={canViewPesos ? pesos : {}}` (con `{}` la sección omite peso en el objetivo y peso en el departamento sin tocar `IniciativaInfo`). Terminado cuando W3 y W4 se cumplen. Depende de T012 y T021.
- [ ] T029 [US3] Editar `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`: pasar `canViewPesos={permisos.canViewPesos}` a `IniciativasBandeja`, `ObjetivoDetalle` e `IniciativaDetalle`. Terminado cuando compila. Depende de T014, T027 y T028.
- [ ] T030 [US3] Validar con `npm start` los escenarios W1 a W7 del quickstart con los cuatro roles del mock. Terminado cuando todos coinciden. Depende de T029.

**Checkpoint**: los pesos solo los ven CargadorObjetivo y Administrador.

---

## Phase 7: User Story 5 - Dar de alta, cambiar de rol y dar de baja personas (Priority: P2)

**Goal**: servicio que mantiene la lista Usuario y los grupos alineados, solo para Administrador, con deshacer y reintento sin duplicados. Sin pantalla.

**Independent Test**: escenarios S1 a S10 del quickstart con el mock; después, contra el sitio de desarrollo.

**Contrato**: [contracts/usuario-rol-service.md](./contracts/usuario-rol-service.md). Archivos en `src/core/api/Usuario/`.

- [ ] T031 [P] [US5] Crear `IGrupoRolDataSource.ts` (`getGruposDe(personaId: number): Promise<Rol[]>`, `agregar(personaId: number, rol: Rol): Promise<void>` idempotente, `quitar(personaId: number, rol: Rol): Promise<void>`), `GrupoRolDataSource.ts` (implementación con PnPjs: `getGruposDe` = `this._sp.web.siteUsers.getById(personaId).groups.select('Title')()` filtrando los títulos que sean valores del enum `Rol`; `agregar` = `LoginName` de `siteUsers.getById(personaId).select('LoginName')()` y `siteGroups.getByName(rol).users.add(loginName)`; `quitar` = `siteGroups.getByName(rol).users.removeById(personaId)`; el nombre del grupo es el valor del rol; `getSP()` de `core/pnp/sp/pnpjs-presets`, sin imports de PnPjs nuevos) y `GrupoRolMock.ts` (pertenencias en memoria por persona, con la misma interfaz; el estado inicial es el de los usuarios de `UsuarioMock`: `USUARIO_PRUEBA` en `Usuario`, Bárbara en `Usuario`, María en `CargadorObjetivo`, el inactivo en ninguno). Terminado cuando compila.
- [ ] T032 [US5] Crear `IUsuarioRolService.ts` (interfaz y `UsuarioRolError` con la propiedad `deshecho: boolean`, ambos según el contrato; `UsuarioRolError` con `name` fijo y `Object.setPrototypeOf`, como `PermisoDenegadoError`) y `UsuarioRolService.ts` (clase `UsuarioRolService` con constructor `(usuarios: IUsuarioDataSource, grupos: IGrupoRolDataSource)` y valores por defecto `new UsuarioDataSource()` y `new GrupoRolDataSource()`). Cada operación (`altaUsuario(usuario)`, `cambiarRol(usuarioId, rol)`, `bajaUsuario(usuarioId)`):
  1. verifica que la persona actual sea Administrador: `getRolFromGroups(await usuarios.getCurrentUserGroups())` y `getPermisos(...).canManageUsuarios`; si no, `assertPermiso(false)`, sin tocar nada;
  2. ejecuta los pasos en el orden del contrato, **guardando en variables lo necesario para deshacer** (el elemento previo, los grupos a los que se agregó, los grupos de los que se quitó);
  3. si un paso falla, deshace en orden inverso intentando cada paso aunque falle uno; termina con `UsuarioRolError` con `deshecho: true` si todo se deshizo y `false` si algún paso de deshacer falló;
  4. alta: busca por persona en `usuarios.getItems()` (clave `Usuario.Id`); si existe, la reactiva con `edit` (`Activo = true`, el rol y los datos que llegan) en lugar de crear otro elemento; si no, `add` con `Activo = true`. Luego `grupos.agregar`;
  5. cambio de rol: consulta `getGruposDe` antes de quitar y quita de todo grupo de rol distinto del nuevo en el que esté, después de agregar al nuevo; mismo rol y grupo correcto, sin cambios;
  6. baja: `Activo = false` conservando `Rol`, y quita de todos sus grupos de rol (consultados con `getGruposDe`).
  Terminado cuando compila, sin `any` y sin importar React. Depende de T003, T005 y T031.
- [ ] T033 [US5] Crear `UsuarioRolServiceMock.ts` con `createUsuarioRolServiceMock(falla?: { paso: 'lista' | 'grupo-agregar' | 'grupo-quitar'; veces?: number; deshacer?: boolean }): IUsuarioRolService`: el mismo `UsuarioRolService`, construido con `UsuarioMock` y `GrupoRolMock` envueltos para inyectar la falla: `lista` hace fallar `add` y `edit` de la lista, `grupo-agregar` hace fallar `agregar`, `grupo-quitar` hace fallar `quitar`; `veces` (1 por defecto) es la cantidad de llamadas de ese paso que fallan antes de volver a andar; con `deshacer: true`, cuando ocurre la falla, la primera escritura posterior (el deshacer) también falla una vez. En el mock, `getCurrentUserGroups()` del `UsuarioMock` ya decide el rol actual (`rolMock`). Terminado cuando compila y los diez escenarios S1 a S10 del quickstart son ejecutables.
- [ ] T034 [US5] Validar con el mock los escenarios S1 a S10 del quickstart, con una invocación temporal que **no se commitea**: en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`, un `React.useEffect` de una sola vez que crea el servicio con `createUsuarioRolServiceMock(...)` y escribe cada resultado con `console.log`; con `rolMock` en `Administrador` (y en `Usuario`, `CargadorObjetivo` y `Visualizador` para S10). Retirar la invocación al terminar y confirmar con `git diff` que `ObjetivosVp.tsx` no la conserva. Terminado cuando todos los escenarios coinciden, incluido que reintentar con la falla agotada completa la operación sin duplicados. Depende de T033.
- [ ] T035 [US5] **A cargo de la usuaria** (requiere P1, P1b y P2 a P4 del plan aplicados y autorización expresa para escribir en la lista `Usuario` y en los grupos del sitio de desarrollo): ejecutar la sección "Servicio de personas, contra el sitio de desarrollo" del quickstart con el servicio real y personas de prueba. Terminado cuando S1, S2, S3, S5 y S10 coinciden en la lista y en Permisos del sitio, el paso 3 (quitar de un grupo a mano y repetir S3) deja a la persona solo en el grupo nuevo, la limitación de FR-022 quedó verificada y registrada, y se retiraron la invocación temporal y las personas de prueba. Depende de T034.

**Checkpoint**: el servicio está probado con el mock y, cuando la usuaria lo autorice, contra el sitio.

---

## Phase 8: User Story 6 - Permisos en las listas de SharePoint (Priority: P2)

**Goal**: las listas dan lectura solo a los cuatro grupos y la escritura por rol se impone en SharePoint. Todo es configuración en el sitio, a cargo de la usuaria: el código no cambia.

**Independent Test**: escenarios L1 a L7 del quickstart.

- [ ] T036 [US6] **A cargo de la usuaria**: aplicar en el sitio de desarrollo los preparativos P1, P1b y P2 a P5 de la sección "Preparativos en SharePoint" del quickstart (verificar el valor `CargadorObjetivo` de la columna `Rol` y que los nombres de grupo estén libres; crear los cuatro grupos con los nombres `Administrador`, `CargadorObjetivo`, `Usuario` y `Visualizador`; dar Lectura a los grupos en el sitio; dejar al grupo `Administrador` como propietario de los cuatro; cortar la herencia y asignar los niveles estándar por lista según la tabla). Terminado cuando los escenarios L1 a L7 y A6 y A7 del quickstart coinciden con el sitio real, y la usuaria confirmó la nota sobre la papelera de reciclaje. Si el quickstart tiene un paso que no se puede seguir tal cual, anotar la corrección para regenerar el documento del lado de la especificación.

**Checkpoint**: SharePoint impone la lectura y la escritura por rol; los permisos por elemento los controla la aplicación.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T037 Verificar visualmente la pantalla de acceso denegado (rol `sin-rol`) contra la intención de la spec (FR-006a: ícono y una línea de texto, sin textos de ayuda, centrada). Si queda con espacio vacío o desalineada por la estructura de `EmptyState`, reemplazarla en `Permisos/AccesoDenegado/AccesoDenegado.tsx` por un componente propio con ícono `lock` y una línea de texto armados solo con tokens del DS (`spacing`, `typography`, `colors`), sin tocar `src/core/ui`, y agregar el desvío en la fila condicional de Complexity Tracking de `plan.md` (único cambio permitido en ese documento durante la implementación, aprobado por la usuaria). Si queda bien, no cambiar nada. Terminado cuando la pantalla coincide con FR-006a.
- [ ] T038 Verificar que `rolMock` se lee solo en modo mock y nunca contra SharePoint: `git grep -n "rolMock" -- src` solo aparece en `src/core/api/Usuario/UsuarioMock.ts`; `useCurrentRol.ts` instancia `UsuarioMock` únicamente cuando `Environment.type !== EnvironmentType.SharePoint` o `listTitle` está vacío; ningún otro archivo importa `UsuarioMock` para decidir el rol. Terminado cuando las tres comprobaciones se cumplen; anotar el resultado en el mensaje de entrega.
- [ ] T039 [P] Editar `docs/plantilla-cambios.md`: una fila (fecha 2026-11-24, feature 010-permisos-roles) por cada archivo de `src/core` modificado o creado fuera de `src/core/ui`: `Constants.ts` (valor de `Rol.CargadorObjetivo`), `Permisos.ts` (nuevo), `IUsuarioDataSource.ts`, `UsuarioDataSource.ts`, `UsuarioMock.ts` (lectura de grupos y `rolMock`), `useCurrentRol.ts`, `IGrupoRolDataSource.ts`, `GrupoRolDataSource.ts`, `GrupoRolMock.ts`, `IUsuarioRolService.ts`, `UsuarioRolService.ts`, `UsuarioRolServiceMock.ts`, y `TareaMock.ts` (dato de prueba, si se modificó en T007). Cada fila con su cambio y su motivo, en el formato de la tabla existente. Terminado cuando la tabla refleja el `git diff` de `src/core`.
- [ ] T040 Ejecutar `npm run build` completo y recorrer los escenarios del quickstart que no se validaron en las fases anteriores (A6, A7, D1 y D2; los de SharePoint dependen de T035 y T036). Medir el tiempo hasta ver la home (o el acceso denegado) y hasta abrir cada pantalla principal con el volumen que haya en el sitio de desarrollo (SC-010: menos de 3 s) e informar la cantidad de elementos usada (palancas, objetivos, iniciativas, tareas y personas); si no hay acceso al sitio, informarlo. Confirmar con `git grep -n "CAN_" -- src` y `git grep -n "Cargador objetivo" -- src` que no quedan restos, con `git status` que no hay archivos temporales, y que `src/core/ui` no tiene cambios. Terminado cuando el build pasa y todo lo anterior se cumple.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias. Dentro de la fase: T002 → T005; T003, T004 y T007 en paralelo; T006 depende de T003 y T005.
- **US1 (Phase 3)**: depende de Foundational. Bloquea US2, US3 y US4 (usan el proveedor).
- **US2 (Phase 4)**: depende de US1.
- **US4 (Phase 5)**: depende de US1; las tareas T021 y T024 tocan archivos que también edita US2 (T012 y T013), por lo que van después.
- **US3 (Phase 6)**: depende de US2 (comparte `ObjetivosVp.tsx`) y de T021 (comparte `IniciativaDetalle.tsx`).
- **US5 (Phase 7)**: depende solo de Foundational (T003 y T005); puede hacerse en paralelo con US2, US3 y US4, salvo T034, que edita temporalmente `ObjetivosVp.tsx` y debe hacerse cuando ese archivo esté libre.
- **US6 (Phase 8)**: sin código; puede hacerse en cualquier momento, en paralelo.
- **Polish (Phase 9)**: depende de todas las anteriores.

### Archivos compartidos (no editar en paralelo)

- `ObjetivosVp.tsx`: T010 → T012 → T013 → T014 → T029 → (T034, temporal).
- `IniciativaDetalle.tsx`: T012 → T021 → T028.
- `TareaDetalle.tsx`: T013 → T024.

### Parallel Opportunities

- Foundational: T003, T004, T005 y T007.
- US4: T017, T018, T019, T020 y T022 y T023 (archivos distintos); T021 y T024 después de sus dependencias.
- US5 (T031) en paralelo con US2 a US4.

## Parallel Example: User Story 4

```text
Task: "T017 Palancas en PalancaForm.tsx, Palancas.tsx y PalancaDetalle.tsx"
Task: "T018 Objetivos en ObjetivoForm.tsx y ObjetivoFormPanel.tsx"
Task: "T019 Iniciativas en IniciativaForm.tsx e IniciativaFormPanel.tsx"
Task: "T020 Cambio de estado en IniciativaEstadoPanel.tsx"
Task: "T022 Tareas, alta y edición en TareaFormPanel.tsx y TareaForm.tsx"
Task: "T023 Tareas, avance en TareaAvancePanel.tsx"
```

## Implementation Strategy

### MVP primero (US1)

1. Setup y Foundational (T001 a T007).
2. US1 (T008 a T011): la aplicación ya bloquea a quien no tiene rol.
3. **Validar** A1 a A5.

### Entrega incremental

1. US2: la interfaz respeta el rol (T012 a T016).
2. US4: el guardado verifica el permiso (T017 a T025). Con US1 + US2 + US4 el criterio de aceptación de RF-19 está completo.
3. US3: pesos (T026 a T030).
4. US5: servicio de personas, con el mock (T031 a T034) y después contra el sitio (T035).
5. US6: permisos de listas en el sitio (T036).
6. Polish (T037 a T040).

## Notes

- Una tarea por vez, en el orden indicado; commitear después de cada tarea o grupo lógico.
- Si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo: no se modifican `spec.md` ni `plan.md`.
- La lista `Usuario` ya tiene la columna `Rol`: no hace falta crearla. Los grupos y los permisos de las listas los configura la usuaria (T035 y T036).
