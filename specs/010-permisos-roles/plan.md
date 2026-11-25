# Implementation Plan: Roles y permisos

**Branch**: `010-permisos-roles` | **Date**: 2026-11-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-permisos-roles/spec.md`. Aplica permisos a las pantallas de las features 002 a 008, que dejaron constantes `CAN_*` en `true` (ver [research.md](./research.md), R2).

## Summary

Calcular el rol de la persona a partir de los grupos de SharePoint, mostrar solo las acciones que el rol permite, verificar el permiso otra vez antes de guardar, bloquear la aplicación a quien no tiene rol, y construir el servicio que mantiene la lista Usuario y los grupos alineados (sin pantalla).

Enfoque técnico:

- **Dominio** (`core/utils/Permisos.ts`, funciones puras): deducir el rol de una lista de grupos y devolver los permisos de un rol, incluidos los que dependen del elemento (Accountable, responsable). Es el único lugar donde se calculan permisos (FR-005).
- **Datos** (`core/api/Usuario`): lectura de los grupos del usuario actual en el datasource y el mock (hook `useCurrentRol`), y el servicio de personas (`UsuarioRolService`) con su mock.
- **Acceso**: un `PermisosProvider` envuelve el `Router`. Muestra el indicador de carga mientras obtiene el rol, la pantalla de acceso denegado si no hay rol o falla, y la aplicación en los demás casos. Cubre todas las rutas, incluidos los links directos.
- **Permisos en pantallas**: `ObjetivosVp.tsx` reemplaza las constantes `CAN_*` por los valores del proveedor. Los permisos de rol siguen siendo booleanos con el mismo nombre. Los de elemento (editar iniciativa, cambiar estado, seguimiento, actualizar tarea) pasan de booleano a función (D6).
- **Verificación al guardar**: cada punto de escritura vuelve a leer los grupos del usuario y recalcula el permiso antes de guardar; si no lo tiene, no guarda y muestra "No tenés permiso para realizar esta acción." (D7).
- **Pesos**: se muestran solo a CargadorObjetivo y Administrador en la bandeja (el "Objetivo (peso)" del prototipo todavía no está implementado), en "Información de la iniciativa" y en la lista de iniciativas del detalle del objetivo (D8).
- **SharePoint**: la usuaria crea los grupos y configura los permisos; el quickstart deja la tabla, los pasos y las pruebas. El código no crea ni modifica listas, columnas, grupos ni permisos.

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, con la configuración heredada de `@microsoft/spfx-web-build-rig`.

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`, Fluent UI v8, PnPjs `@pnp/sp 4.18.0` (módulos `site-groups`, `site-users` y `security` ya importados en `pnpjs-presets.ts`), `react-router-dom 6.30.6` (`HashRouter`). Sin dependencias nuevas.

**Storage**: cuatro grupos de SharePoint del sitio (nuevos, a cargo de la usuaria), la lista `Usuario` (existente; columna `Rol`, que el código ya declara, ver P1) y los permisos de todas las listas de la aplicación.

**Testing**: no hay runner de pruebas. Validación: `npm run build` (principio V) y los escenarios de [quickstart.md](./quickstart.md) con mocks y en el sitio de desarrollo.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft, según los scripts de `package.json`).

**Performance Goals**: pantalla inicial (o acceso denegado) en menos de 3 s (SC-010). Suma 1 consulta al abrir (grupos del usuario; el usuario actual ya se pide) y 1 por cada guardado (verificación, D7).

**Constraints**: `src/core/ui` de solo lectura; sin dependencias nuevas; el código no crea ni modifica listas, columnas, grupos ni permisos (el servicio de personas escribe elementos y membresías solo cuando se lo invoca, y ninguna pantalla lo invoca); sin selector de rol en pantalla; sin rutas nuevas; textos en español (AR) en `loc/`.

**Scale/Scope**: 0 rutas nuevas; 1 pantalla nueva (acceso denegado) y 1 proveedor; 1 archivo de dominio; 1 servicio con interfaz y mock, 1 acceso a grupos con interfaz y mock y 1 hook en `core`; 6 archivos de `core` modificados; unos 20 componentes del webpart ajustados (ver "Estructura de carpetas").

## Hallazgos del repo

Detalle en [research.md](./research.md).

| # | Hallazgo | Consecuencia |
|---|---|---|
| H1 | `Rol` (enum), la entidad `Usuario` y `UsuarioDataSource` ya leen y escriben una columna `Rol` (R1). | Se reutilizan; la columna existe en desarrollo y el valor de CargadorObjetivo se verifica antes de probar (P1). El valor del enum difiere de la columna (`"Cargador objetivo"` con espacio): se corrige (D2). |
| H2 | No hay lectura de los grupos del usuario actual; `pnpjs-presets.ts` ya trae `site-groups`, `site-users` y `security` (R1, R8). | Método nuevo en `IUsuarioDataSource`, sin dependencias nuevas. |
| H3 | Las 11 constantes `CAN_*` de `ObjetivosVp.tsx` se pasan por propiedades y las pantallas ya ocultan lo no permitido (R2). | Solo cambia el origen del valor; las pantallas casi no se tocan. |
| H4 | Los permisos de elemento no se pueden expresar con un booleano global (R2). | Pasan a funciones (D6). |
| H5 | Ningún punto de guardado verifica permisos; todos muestran un mensaje fijo de error (R3). | Verificación previa y mensaje propio (D7). |
| H6 | La bandeja no muestra pesos a nadie; "Información de la iniciativa" y la lista del detalle del objetivo los muestran a todos (R5). | Agregar el peso a la bandeja para quien corresponde y condicionar los otros dos (D8). |
| H7 | El prototipo da el seguimiento al responsable del resultado clave, que no existe desde la 006 (R4). | Manda la matriz (Accountable). |
| H8 | `EmptyState` está en el catálogo, no se usa y no deja ocultar su descripción ni su botón sin pasarles valores vacíos (R6). | Aproximación A1. |
| H9 | Los mocks no tienen una tarea con `USUARIO_PRUEBA` como responsable en una iniciativa ajena (R9). | Se agrega una (D14). |
| H10 | El rollback del alta de iniciativa y de tarea borra elementos (R3). | Los roles que crean necesitan permiso de borrar en esas listas (D12). |

## Constitution Check

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | Mismo stack y versiones; sin dependencias nuevas. |
| II. La interfaz no se inventa | ✅ Cumple, con una pantalla sin diseño | Lo visible sale del prototipo v11 (`docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`): `power`, `canEditIni`, `canKR`, `canTar`, `objHdr`, `od.showW`, `idt.showW`. La pantalla de acceso denegado no está en el diseño: la spec la define con el patrón de estados vacíos (FR-006a) y se resuelve con `EmptyState` (A1). El selector "Ver como" del prototipo no se implementa (FR-009). |
| II. `core/ui` de solo lectura | ✅ Cumple | No se modifica; nada que anotar en `docs/design-system-cambios.md`. |
| II. Estructura de pantalla | ✅ Cumple | `Permisos/AccesoDenegado/` con su `.tsx`; el proveedor en `shared/`. |
| II. Textos en español (AR) | ✅ Cumple | Claves nuevas en `loc/mystrings.d.ts` y `loc/en-us.js` (D13). |
| III. Datos desacoplados | ✅ Cumple | Las pantallas usan hooks de `core/api`; el servicio de personas tiene interfaz y mock; los tipos van en `core`. |
| IV. Simplicidad y cambios acotados | ✅ Cumple, con cambios justificados | Cambios en `core`: `Constants.ts`, `IUsuarioDataSource.ts`, `UsuarioDataSource.ts`, `UsuarioMock.ts`, `IniciativaMock.ts` y `TareaMock.ts` (se registran en `docs/plantilla-cambios.md`). En el webpart: ver Complexity Tracking. |
| V. Validación | ✅ Cumple | Cada tarea cierra con `npm run build`. |

**Re-check post-diseño**: sin cambios. Un único desvío con costo: la verificación en cada guardado (1 consulta extra) frente a confiar en el rol cargado al abrir; se justifica en D7.

## Decisiones

**D1. Nombres de los grupos.** Un grupo por rol, con **exactamente el mismo nombre que el valor de la columna `Rol`** (decisión de la usuaria, 2026-11-24): `Administrador`, `CargadorObjetivo`, `Usuario` y `Visualizador`. No hay prefijo ni tabla de correspondencia: el título del grupo es el valor de `Rol`, de modo que un rol no puede tener un nombre en la columna y otro en el grupo. Si un sitio ya tuviera un grupo con alguno de esos nombres, hay que resolverlo en el sitio, no con otro nombre.

**D2. Columna `Rol` de la lista Usuario.** Existe en desarrollo: nombre interno `Rol`, tipo Opción. Debe tener los valores `Administrador`, `CargadorObjetivo`, `Usuario` y `Visualizador`; el de CargadorObjetivo se verifica y, si está con espacio, la usuaria lo corrige antes de probar (P1). El enum `Rol` tenía `CargadorObjetivo = "Cargador objetivo"` (con espacio): se corrige el valor a `"CargadorObjetivo"` para que coincida con la columna y con el grupo. Es el único cambio en el enum (el identificador no cambia) y no hay otros usos del valor con espacio en el código.

**D3. Deducción del rol.** `getRolFromGroups(títulos)` cruza los títulos de los grupos del usuario con los valores de `Rol` y devuelve el rol de más permisos según `Administrador > CargadorObjetivo > Usuario > Visualizador`; sin coincidencias, `undefined` (sin rol). Los grupos propios de SharePoint (Propietarios, etc.) no dan rol: un propietario del sitio sin grupo de rol no accede.

**D4. Un único lugar para los permisos.** `Permisos.ts` (en `core/utils`, sin acceso a datos ni React) expone `getPermisos(rol, persona)` con la matriz de FR-010 y devuelve el objeto de [contracts/permisos.md](./contracts/permisos.md): booleanos de rol y funciones de elemento. Las pantallas no escriben condiciones de rol propias.

**D5. Proveedor y bloqueo.** `PermisosProvider` (en `components/shared/`) usa `useCurrentUser` y el hook nuevo `useCurrentRol`. Estados: cargando → `Spinner` ya implementado y nada más; error al obtener el rol → acceso denegado con "No se pudieron cargar tus permisos."; sin rol → acceso denegado con "No tenés acceso a esta aplicación."; con rol → los hijos. Se coloca dentro de `ThemeProvider` y fuera de `Router`: ninguna ruta, ni un link directo, se resuelve antes. Los componentes leen los permisos con `usePermisos()`.

**D6. Permisos de elemento.** Las propiedades `canEdit`, `canChangeEstado` y `canTrackResultadoClave` de `IniciativaDetalle` pasan de `boolean` a `(accountable?: IPersonValue) => boolean`, y `canEdit` y `canRegisterProgress` de `TareaDetalle` a `(responsable?: IPersonValue, accountable?: IPersonValue) => boolean`. El detalle las evalúa con los datos que ya cargó. `ObjetivosVp.tsx` les pasa las funciones del proveedor. La persona se compara por `Id` (el `Id` de usuario del sitio, el mismo que trae `currentUser` y los campos de persona). Los demás permisos siguen siendo booleanos con el mismo nombre. `canLoadResultadosClave` equivale a crear iniciativa (quien edita una iniciativa también pudo crearla).

**D7. Verificación al guardar.** El proveedor expone `verificar()`, que vuelve a pedir los grupos y devuelve los permisos recalculados. Cada punto de escritura (R3) hace, antes de guardar:

1. `const permisos = await verificar()`.
2. Si la acción no está permitida para el elemento tal como se cargó (no el valor que se está editando en el formulario, para que cambiar el Accountable en pantalla no otorgue permiso), lanza `PermisoDenegadoError` y no guarda nada.
3. El `catch` del formulario distingue `PermisoDenegadoError` y muestra `strings.PermisoDenegado` en una línea; cualquier otro error sigue mostrando su mensaje de siempre.

Si falla la propia verificación, no se guarda y se muestra el mensaje de falla de guardado de ese formulario. Alternativa descartada: confiar en el rol cargado al abrir, porque no detecta a quien salió del grupo con la aplicación abierta y no se puede probar con el mock.

**D8. Pesos.** `canViewPesos` (CargadorObjetivo y Administrador): en `IniciativasBandeja` / `IniciativasTable`, el encabezado de la columna Objetivo pasa a "Objetivo (peso)" y la celda agrega el peso entre paréntesis (por ejemplo `OBJ-01 · nombre (12,5%)`) para objetivos de la VP RRII cuando el peso existe, como `objTxt` del prototipo; para los demás roles queda como hoy. `IniciativaInfo` omite peso en el objetivo y peso en el departamento. `IniciativasTable` (variante `objetivo`) omite la columna Peso. `getPesosIniciativa` recibe todas las iniciativas del objetivo, no la vista filtrada (R5).

**D9. Pantalla de acceso denegado.** Componente `AccesoDenegado` con `EmptyState` (ícono `lock`, el mensaje como título, sin descripción ni botón, ver A1). Sin Volver, sin menú, sin migas de pan, sin reintento.

**D10. Servicio de personas.** `UsuarioRolService` (interfaz `IUsuarioRolService`) con `altaUsuario(usuario)`, `cambiarRol(usuarioId, rol)` y `bajaUsuario(usuarioId)`; contrato en [contracts/usuario-rol-service.md](./contracts/usuario-rol-service.md).

- Primero verifica que la persona actual sea Administrador (vuelve a leer los grupos, como D7).
- Orden de pasos, con deshacer en orden inverso: **alta** = guardar el elemento en la lista (alta, o reactivación si la persona ya existe, para que reintentar no duplique) y luego agregarla al grupo de su rol; **cambio de rol** = actualizar `Rol`, agregarla al grupo nuevo y luego quitarla de los otros grupos de rol donde esté (así nunca queda sin acceso a mitad de camino); **baja** = marcar `Activo = false` (conserva `Rol`) y luego quitarla de sus grupos de rol.
- "Quitarla del anterior" se aplica como "quitarla de todo grupo de rol distinto del nuevo en el que esté": se consulta la pertenencia real antes de quitar (R8). Cubre también a quien estaba en dos grupos.
- Si un paso falla, deshace los anteriores; si el deshacer también falla, termina con `UsuarioRolError` con `deshecho: false`; con deshacer correcto, con `deshecho: true`. En ambos casos el llamador informa en una línea que la operación no pudo completarse. Reintentar no duplica nada: agregar a un grupo es idempotente y el alta reusa el elemento existente.
- Las operaciones sobre los grupos están detrás de una interfaz propia (`IGrupoRolDataSource`: `getGruposDe`, `agregar`, `quitar`), igual que la lista está detrás de `IUsuarioDataSource`, para que el mock use el mismo orquestador.
- **El mock es el mismo orquestador con la lista y los grupos en memoria** y una falla inyectable por paso (`UsuarioRolServiceMock.ts`): permite probar alta, cambio de rol, baja y falla en cada paso (FR-029) sin SharePoint.
- No hay hook ni pantalla: los construirá la feature del ABM. Como nada lo invoca, el quickstart usa una invocación temporal que no se commitea.

**D11. Mock del usuario actual.** `UsuarioMock.getCurrentUserGroups()` devuelve el grupo del rol elegido, nada (sin rol) o falla, según la clave `localStorage['rolMock']` (`Visualizador`, `Usuario`, `CargadorObjetivo`, `Administrador`, `sin-rol`, `falla`); sin clave, `Administrador`. **La clave se lee solo en el mock y nunca contra SharePoint**: la lectura está únicamente dentro de `UsuarioMock`, y `useCurrentRol` (igual que `useCurrentUser`) usa el datasource real cuando `Environment.type` es SharePoint y solo en cualquier otro caso instancia el mock. Una tarea verifica con una búsqueda que `rolMock` no aparezca fuera de `UsuarioMock.ts`. No hay selector en pantalla. Cambiar la clave y recargar prueba cada rol; cambiarla sin recargar prueba el rechazo del guardado (D7).

**D12. Permisos de las listas.** Tabla en el [quickstart](./quickstart.md#preparativos-en-sharepoint). Solo niveles estándar (decisión de la usuaria, 2026-11-24): "Lectura" y "Colaborar" (agregar, editar y borrar); no se crean niveles personalizados. CargadorObjetivo tiene "Colaborar" en `Objetivo`: SharePoint no puede impedirle editar un objetivo desde fuera de la aplicación, y la edición la controla la aplicación (la oculta y la rechaza al guardar). Usuario y CargadorObjetivo tienen "Colaborar" (incluido borrar) en `Iniciativa`, `Resultado clave` y `Tarea`, porque el rollback del alta borra lo creado. Los permisos por elemento no se configuran (FR-025). Lo borrado por error se recupera desde la papelera de reciclaje del sitio (nota en el quickstart). Los cuatro grupos también necesitan al menos "Lectura" en el sitio para abrir la página.

**D13. Textos.** Claves nuevas en `loc/mystrings.d.ts` y `loc/en-us.js` (único idioma): `AccesoDenegado` ("No tenés acceso a esta aplicación."), `PermisosLoadError` ("No se pudieron cargar tus permisos."), `PermisoDenegado` ("No tenés permiso para realizar esta acción.") y `ObjetivoColumnNameWeight` ("Objetivo (peso)"). Sin duplicar las existentes.

**D14. Datos de los mocks.** Se suma a `TareaMock.ts` una tarea con `USUARIO_PRUEBA` como responsable en una iniciativa de otra persona (la 5, de Bárbara), y se verifica que `IniciativaMock.ts` tenga, en un mismo objetivo de la VP RRII, iniciativas de `USUARIO_PRUEBA` y de otra persona. Solo datos de prueba, registrado en `docs/plantilla-cambios.md`.

## Interfaz y Design System

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (prototipo v11): lo que ve cada rol en las pantallas de palancas, detalle de palanca, objetivo (`od.canIni`, `od.showW`), iniciativa (`canEditIni`, `canKR`, `idt.showW`), bandeja de iniciativas (`objHdr`), tareas y detalle de tarea (`canTar`). La pantalla de acceso denegado no está en el diseño.

**Design System**: `src/core/ui`, según `docs/design-system-catalog.md`.

**Estructura de la pantalla**: ver "Estructura de carpetas".

### Mapeo elemento → componente

| Elemento | Componente | Observaciones |
|---|---|---|
| Acceso denegado (ícono y una línea) | `EmptyState` (`patterns`) con `FigmaIcon name="lock"` en `icon` | Título = mensaje; `description=""` y `action={<></>}` para no mostrar la descripción ni el botón por defecto (A1). |
| Indicador de carga del rol | `Spinner` (`patterns`) | El ya implementado. |
| Botones, lápices, "+", acciones de fila | Los ya implementados | No cambian; se muestran u ocultan con los permisos (FR-011). |
| Columna "Objetivo (peso)" | `Table` (columna existente) | Cambian el encabezado y el texto de la celda con `canViewPesos`. |

### Elementos sin componente en el Design System

Ninguno. Una aproximación a confirmar:

- **A1** (aprobada por la usuaria): `EmptyState` no deja ocultar su descripción ni su botón; se anulan con `description=""` y `action={<></>}`. Sin eso aparecen "Prueba con otro filtro o vuelve más tarde." y "Ver más". Si al verla la pantalla queda con espacio vacío, se arma un componente propio `AccesoDenegado` con tokens del Design System y se registra como desvío (fila condicional de Complexity Tracking).

**Imágenes e íconos**: `lock` de `src/core/ui/foundations/icons`.

## Estructura de carpetas

```text
src/core/
├── utils/
│   ├── Constants.ts              # Rol.CargadorObjetivo = "CargadorObjetivo" (D2)
│   └── Permisos.ts               # nuevo: dominio puro (D3, D4) y PermisoDenegadoError
└── api/Usuario/
    ├── IUsuarioDataSource.ts     # + getCurrentUserGroups()
    ├── UsuarioDataSource.ts      # + getCurrentUserGroups()
    ├── UsuarioMock.ts            # + getCurrentUserGroups() según localStorage (D11)
    ├── useCurrentRol.ts          # nuevo
    ├── IGrupoRolDataSource.ts    # nuevo
    ├── GrupoRolDataSource.ts     # nuevo
    ├── GrupoRolMock.ts           # nuevo (en memoria)
    ├── IUsuarioRolService.ts     # nuevo
    ├── UsuarioRolService.ts      # nuevo: orquestador (D10)
    └── UsuarioRolServiceMock.ts  # nuevo: orquestador con lista y grupos en memoria y fallas inyectables

src/core/api/Iniciativa/IniciativaMock.ts, src/core/api/Tarea/TareaMock.ts   # datos de prueba (D14)

src/webparts/objetivosVp/components/
├── shared/PermisosProvider.tsx   # nuevo: proveedor, usePermisos(), verificar()
├── Permisos/AccesoDenegado/AccesoDenegado.tsx   # nuevo
├── ObjetivosVp/ObjetivosVp.tsx   # proveedor y permisos en lugar de CAN_*
├── Palanca/Palancas/Palancas.tsx, Palanca/PalancaDetalle/PalancaDetalle.tsx, Palanca/PalancaForm/PalancaForm.tsx
├── Objetivo/ObjetivoForm/ObjetivoFormPanel.tsx, ObjetivoForm.tsx
├── Objetivo/ObjetivoDetalle/ObjetivoIniciativas/ObjetivoIniciativas.tsx
├── Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx, IniciativaInfo/IniciativaInfo.tsx
├── Iniciativa/IniciativaForm/IniciativaFormPanel.tsx, IniciativaForm.tsx
├── Iniciativa/IniciativaEstadoPanel/IniciativaEstadoPanel.tsx
├── Iniciativa/ResultadoClaveSeguimientoPanel/ResultadoClaveSeguimientoPanel.tsx
├── Iniciativa/IniciativasBandeja/IniciativasBandeja.tsx, IniciativasTable/IniciativasTable.tsx
└── Tarea/TareaDetalle/TareaDetalle.tsx, TareaForm/TareaFormPanel.tsx, TareaForm.tsx, TareaAvancePanel/TareaAvancePanel.tsx
```

**Structure Decision**: el dominio de permisos va en `core/utils`, el acceso a grupos y el servicio en `core/api/Usuario`, y el proveedor y la pantalla en el webpart, siguiendo la separación dominio / servicios / componentes del principio IV. No hay carpetas por encima de las existentes salvo `Permisos/AccesoDenegado/`, que sigue "una carpeta por pantalla".

## Preparativos a cargo de la usuaria

Los hace la usuaria en el sitio de desarrollo y se repiten en cada sitio. El paso a paso y la tabla de permisos están en el [quickstart](./quickstart.md#preparativos-en-sharepoint).

| # | Preparativo | Antes de |
|---|---|---|
| P1 | Columna `Rol` de la lista Usuario: existe en desarrollo; verificar que el valor sea `CargadorObjetivo` (sin espacio) y, si está como `Cargador objetivo`, cambiarlo antes de las pruebas. | Probar con la aplicación |
| P1b | Verificar en cada sitio que no existan grupos con los nombres `Administrador`, `CargadorObjetivo`, `Usuario` y `Visualizador` antes de crearlos. | P2 |
| P2 | Crear los cuatro grupos con los mismos nombres que los valores de `Rol` (D1). | Probar con SharePoint |
| P3 | Dar "Lectura" a los cuatro grupos en el sitio. | P5 |
| P4 | El grupo Administrador, propietario de los cuatro grupos; agregar a las personas de prueba. | Probar el servicio |
| P5 | Cortar la herencia y asignar permisos en cada lista (tabla del quickstart, solo niveles estándar). | Probar permisos de listas |
| P6 | Verificar en dev que quitar de un grupo a alguien que no es miembro no falla, o dejar confirmado que el servicio consulta antes la pertenencia (R8). | Probar el servicio |

## Complexity Tracking

| Violación / punto | Por qué hace falta | Alternativa más simple descartada |
|---|---|---|
| Propiedades de elemento como funciones en `IniciativaDetalle` y `TareaDetalle` (D6) | La regla depende de la iniciativa o la tarea abierta, que solo se conoce después de cargarla. | Un booleano global no puede expresar "solo si es su Accountable". |
| Verificación con consulta propia en cada guardado (D7) | FR-014 pide verificar antes de guardar y el quickstart necesita probarlo. | Reusar el rol cargado al abrir: no detecta cambios de grupo y no se puede probar. |
| Interfaz `IGrupoRolDataSource` (D10) | El servicio necesita un mock de los grupos para probar las fallas por paso (FR-029). | Llamar a PnPjs dentro del servicio: obliga a probar contra SharePoint. |
| `EmptyState` con valores vacíos (A1) | Es el único componente del catálogo con ícono y texto. | Un componente ad hoc: lo prohíbe el principio II. |
| **Condicional**: componente propio de acceso denegado con tokens del Design System | Solo si, al verla, la pantalla con `EmptyState` queda con espacio vacío (decisión de la usuaria, 2026-11-24). Se registra aquí como desvío; no toca `src/core/ui`. | Seguir con `EmptyState`. |
