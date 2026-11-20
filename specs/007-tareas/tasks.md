---

description: "Tareas de implementación de Tareas (alta, edición, seguimiento de avance, bandeja y sección en la iniciativa)"
---

# Tasks: Tareas (alta, edición, seguimiento de avance, bandeja y sección en la iniciativa)

**Input**: `specs/007-tareas/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`)

**Prerequisites**:

- las features 002 a 006 completas y compilando (`npm run build` sin errores);
- `npm ci` ejecutado;
- prototipo v11 en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (la carpeta dice v5, el contenido es v11);
- `docs/design-system-catalog.md`;
- en el sitio de desarrollo, a cargo de la usuaria y solo para probar con SharePoint (T079): los preparativos P1 a P8 de la sección "Preparativos a cargo de la usuaria". Con mocks no hace falta nada de esto.

**Tests**: no se piden. El plan no define un framework de pruebas y el repo no tiene runner. Se valida con `npm run build`, con los escenarios de `quickstart.md` y comparando con el prototipo. No se agrega ningún framework.

**Organization**: las tareas se agrupan por historia de usuario. Cada tarea indica el archivo exacto, los componentes del Design System (DS), su **Referencia** en el prototipo cuando es de pantalla y su criterio de terminado. Dentro de las historias P1, el orden de las fases sigue las dependencias entre pantallas y no el número de la historia: primero **US7** (ver las tareas en la iniciativa), después **US3** (detalle de la tarea), **US1** (cargar), **US2** (registrar avance) y **US5** (bandeja); después las P2: **US4** (editar) y **US6** (buscar y filtrar).

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: historia de `spec.md`:
  - US1: cargar una tarea en una iniciativa;
  - US2: registrar el avance de una tarea;
  - US3: ver el detalle de la tarea y su historial de avance;
  - US4: editar los datos de una tarea;
  - US5: ver y recorrer la bandeja de tareas;
  - US6: buscar y filtrar en la bandeja de tareas;
  - US7: ver las tareas en el detalle de la iniciativa.

## Diferencias respecto de la spec y del plan

Decisiones posteriores a `plan.md`, ya incorporadas en `plan.md`, `research.md` y `spec.md`. Esos documentos no se modifican durante la implementación: si hay que actualizarlos, se hace del lado de la especificación y se regeneran las tareas.

- **Permisos**: tres constantes `CAN_*` para tareas (`CAN_CREATE_TAREA`, `CAN_EDIT_TAREA`, `CAN_REGISTER_PROGRESS_TAREA`), siguiendo el patrón de la 004 y la 006, todas en `true` hasta RF-19 (plan, D9 y P-C1; spec, FR-045). No definen roles.
- **Campo Iniciativa**: usa el `Dropdown` actual, sin buscador. **Diferencia con RF-12**, que pide "selección con buscador integrado": el DS no tiene un `Dropdown` con buscador (plan, A4 y P-C3).
- **Paginador de la sección Tareas** del detalle de la iniciativa: va al final de la sección, no fijo al pie, porque el detalle ya tiene su barra de acciones fija (spec, FR-041a; plan, D13 y P-C2). El paginador de la bandeja sigue fijo al pie.

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores, lo que incluye lint y tipos.
- **Referencia al prototipo (constitución II)**, en `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`:
  - bandeja: `<sc-if value="{{scr.tareas}}">` (filas `c-tb`, `uTabs`, `sTabs`);
  - detalle de la tarea: `<sc-if value="{{scr.tarea}}">`, secciones `sec.t_info` y `sec.t_com`;
  - panel de alta y edición: `<sc-if value="{{sideTar}}">` (el panel lateral, no el formulario de página `fm.isTar`);
  - registrar avance: `<sc-if value="{{m.is.tarUpd}}">` (en esta feature es un panel lateral, no un modal);
  - historial: `<sc-if value="{{histOpen}}">`;
  - iniciativa: secciones `sec.i_ind` (indicadores) y `sec.i_tar` (tareas, filas `c-ti2`) de `scr.iniciativa`.
  - **No reproducir**: todo lo de presupuesto (el campo "Requiere inversión", CECO, aprobado, ejecutado, saldo; las secciones `t_bud` e `i_bud`), todo lo de riesgos (`t_rsk`, `i_rsk`, "Cargar riesgo"), los indicadores de vencidas, próximas a vencer, sin actualizar, riesgos y decisiones (`st(...)` de `i_ind` más allá de los cinco estados, `hi` de la bandeja), el botón "Actualizar" de la bandeja, el contador de Mis tareas del menú y de la home, el botón "Ubicación en la estrategia" del detalle de la tarea, el filtro por departamento por defecto (`defDir`), y los textos "activas", "y en su presupuesto" y "Probá cambiar o limpiar los filtros.".
- **Textos**: siempre desde `import * as strings from 'ObjetivosVpWebPartStrings';`. Las plantillas con `{0}` y `{1}` se completan con `Utils.replaceAll`. Ningún texto visible escrito en el código. Las claves son las de la tabla "Textos de localización" de [research.md](./research.md#textos-de-localización), incluidas las que se reutilizan.
- **`src/core/ui` es de solo lectura.** Imports por capa (`core/ui/components`, `core/ui/patterns`, `core/ui/foundations`), nunca del índice de `core` ni de `core/ui`, con la profundidad de rutas relativa que corresponda al archivo.
- **TypeScript estricto**: sin `any` nuevos, sin comentarios de código y sin literales mágicos (los números van a constantes locales con nombre al inicio del archivo). En `core`, las entidades y datasources ya usan `any` para el item de SharePoint: se sigue ese patrón sin agregar otros.
- **Estilos**: solo tokens del DS (`spacing`, `typography`, `colors`, `getColorStep`). Sin hexadecimales. Cada `.module.scss` nuevo, junto a su componente. No editar ni versionar `*.module.scss.ts`.
- **Hooks de React**: `useEffect` solo para cargar datos al montar o cuando cambia un Id. Lo derivado (listas filtradas, conteos, opciones, errores) se calcula durante el render, sin `useMemo`.
- **Dos reglas separadas**: el tope de 10 tareas no canceladas vive solo en `tareaUtils.ts` y el paginado de 10 por página, solo en `tareaPaginado.ts`. Ningún archivo usa uno en lugar del otro (plan, D7).
- **Fuera de alcance**: presupuesto, riesgos, alertas de vencimiento, roles (RF-19) y filtro por departamento del usuario. Ninguna tarea los toca. El formulario y las pantallas no cargan ni muestran "Requiere inversión", y el código nunca escribe `RequiereInversion`.
- **Datos de SharePoint**: no se crean ni modifican listas, columnas, índices ni permisos desde código. Se escribe solo en las listas del sitio de desarrollo, en T079, con autorización. No se versionan URLs del sitio.
- **No modificar** `spec.md` ni `plan.md`. Si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo.
- **Cambios en `src/core` fuera de `src/core/ui`**: se registran en `docs/plantilla-cambios.md` en T072.

## Path Conventions

- Raíz del webpart: `src/webparts/objetivosVp/`. Las piezas nuevas van en `components/Tarea/` y, las dos secciones de la iniciativa, en `components/Iniciativa/IniciativaDetalle/` (estructura completa en plan, "Estructura de carpetas").
- `core`: `src/core/entities/Tarea.ts` y `src/core/api/{Tarea, AvanceTarea}/`.
- Rutas de import de `core` según la carpeta del archivo: desde `components/Tarea/*.ts` → `'../../../../core/...'`; desde `components/Tarea/<Carpeta>/*.tsx` → `'../../../../../core/...'`; desde `components/Tarea/<Carpeta>/<Subcarpeta>/*.tsx` y `components/Iniciativa/IniciativaDetalle/<Carpeta>/*.tsx` → `'../../../../../../core/...'`. Rutas a piezas hermanas: desde `Tarea/<Carpeta>` a `shared`, `Objetivo` e `Iniciativa` → `'../../shared/...'`, `'../../Objetivo/...'`, `'../../Iniciativa/...'`; desde `Tarea/<Carpeta>/<Subcarpeta>` → `'../../../...'`.

## Datos de los mocks (los usan T006 a T017)

Ids de `IniciativaMock`, `ObjetivoMock`, `UsuarioMock` (`USUARIO_PRUEBA`, `BARBARA`, `MARIA`) y áreas 1 a 4 de `IniciativaMock` (Análisis de mercado, Canal digital, Promociones, Gestión de convenios). Total: 28 tareas.

**Iniciativa 1** ("Tablero de insights comerciales", 15/01/2026–30/06/2026), Ids 1 a 7. Con prioridad `null` = sin prioridad. "Actualizada" = fecha de la última entrada de `AvanceTareaMock`:

| Id | Nombre | Estado | Avance | Prio. | Responsable | Áreas | Inicio | Compromiso | Finalización | Actualizada | Comentario ejecutivo (texto · fecha · autor) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Estrategia Portfolio Management | Finalizada | 100 | Alta | BARBARA | Mercado | 2026-01-15 | 2026-02-02 | 2026-02-02 | 2026-02-02 | — |
| 2 | Diseño de Prototipo de Imagen y Experiencia BLACK/FULL - Nordelta | En curso | 95 | Alta | USUARIO_PRUEBA | Mercado, Digital, Promociones | 2026-01-20 | 2026-06-15 | — | 2026-05-20 | Se validó el prototipo con Comercial Retail. · 2026-05-20 · USUARIO_PRUEBA |
| 3 | Diseño de la Propuesta de Valor BLACK en Playa, FULL y BOXES | En curso | 50 | Media | USUARIO_PRUEBA | Digital | 2026-02-01 | 2026-06-30 | — | 2026-04-10 | — |
| 4 | Plan de Comunicación e Inauguración BLACK Nordelta | En curso | 20 | `null` | BARBARA | Promociones | 2026-03-01 | 2026-06-30 | — | 2026-03-15 | — |
| 5 | Adecuación y Desarrollo de Prototipo BLACK para Despliegue 2026 | Frenada | 40 | Alta | MARIA | Convenios, Mercado | 2026-02-15 | 2026-06-30 | — | 2026-04-25 | El proveedor demora la entrega de materiales. · 2026-04-25 · MARIA |
| 6 | Relevamiento de estaciones piloto | No iniciada | 0 | Baja | USUARIO_PRUEBA | Mercado | 2026-04-01 | 2026-06-15 | — | 2026-03-20 | — |
| 7 | Piloto en estación de Rosario | Cancelada | 10 | Media | BARBARA | Digital | 2026-02-10 | 2026-06-30 | — | 2026-03-05 | Se cancela: el piloto pasa a Nordelta. · 2026-03-05 · BARBARA |

**Iniciativa 4** ("YPF Store en estaciones", 01/01/2026–31/12/2027), Ids 8 a 18: Ids 8 a 15 "Despliegue YPF Store, etapa 1" a "etapa 8", En curso, avance `10 × (Id − 7)`, prioridad Media, áreas Canal digital, inicio 2026-02-01, compromiso 2026-12-31, Actualizada 2026-03-01, responsables que rotan `USUARIO_PRUEBA` (8, 11, 14), `BARBARA` (9, 12, 15), `MARIA` (10, 13); Id 16 "Puesta en marcha en estaciones del interior" Frenada 35 %, Actualizada 2026-04-01; Id 17 "Relevamiento inicial de estaciones" Finalizada 100 %, inicio 2026-01-15, compromiso 2026-06-30, finalización 2026-06-30, Actualizada 2026-06-30; Id 18 "Catálogo en papel para estaciones" Cancelada 5 %, Actualizada 2026-02-15. Las Ids 16 a 18: prioridad Media, áreas Canal digital, responsable `MARIA`, `BARBARA` y `USUARIO_PRUEBA`, inicio 2026-02-01 y compromiso 2026-12-31 (la 17 con las fechas indicadas). Sin comentario ejecutivo. 10 no canceladas (8 En curso, 1 Frenada, 1 Finalizada) y 1 Cancelada.

**Iniciativa 11** (objetivo de otra VP, 01/01/2026–31/12/2028), Id 19 "Instalar cargadores en estaciones piloto": No iniciada, 0 %, Media, `MARIA`, Gestión de convenios, inicio 2026-03-01, compromiso 2026-12-31, Actualizada 2026-02-20.

**Iniciativa 5** ("Catálogo online de YPF Store", 01/04/2026–30/06/2027), Ids 20 a 28, **9 tareas no canceladas** (para el alta que la deja en 10 y para el reintento con la tarea huérfana): Ids 20 a 24 "Catálogo online, etapa 1" a "etapa 5", No iniciada, 0 %, Media, Promociones, inicio 2026-05-01, compromiso 2026-12-31, Actualizada 2026-04-10; Ids 25 y 26 "Integración de pagos, etapa 1" y "etapa 2", Frenada 30 %, Media, Promociones, inicio 2026-05-01, compromiso 2026-12-31, Actualizada 2026-06-01; Ids 27 y 28 "Relevamiento de catálogo 1" y "2", Finalizada 100 %, Media, Promociones, inicio 2026-04-01, compromiso 2026-06-15, finalización 2026-06-15, Actualizada 2026-06-15. Responsables que rotan `USUARIO_PRUEBA`, `BARBARA` y `MARIA`. Sin comentario ejecutivo. No cambia la cantidad de tareas En curso (11).

**Entradas de `AvanceTareaMock`** (Ids correlativos; autor = el responsable de la tarea, salvo la entrada de alta, cuyo autor es `USUARIO_PRUEBA`; `Tarea.Title` = `Tarea <Id>`; las entradas sin comentario no llevan `Comentario`):

- Entrada de alta de **cada** tarea: Avance 0, Estado No iniciada, `Comentario` "Tarea cargada.", `Created` 2026-01-14T10:00:00 (tareas 1 a 5 y 7), 2026-03-20T10:00:00 (tarea 6), 2026-01-05T10:00:00 (tareas 8 a 18), 2026-02-20T10:00:00 (tarea 19).
- Tarea 1: En curso 50 el 2026-01-25 ("Se definió el alcance."); Finalizada 100 el 2026-02-02 ("Estrategia aprobada.").
- Tarea 2 (reabierta, 5 entradas en total): En curso 30 el 2026-02-10; Finalizada 100 el 2026-04-30 ("Prototipo entregado."); En curso 90 el 2026-05-10 ("Se reabre por ajustes de Comercial Retail."); En curso 95 el 2026-05-20 ("Se validó el prototipo con Comercial Retail.").
- Tarea 3: En curso 50 el 2026-04-10, sin comentario. Tarea 4: En curso 20 el 2026-03-15, sin comentario.
- Tarea 5: En curso 40 el 2026-03-20, sin comentario; Frenada 40 el 2026-04-25 ("El proveedor demora la entrega de materiales.").
- Tarea 6: solo la entrada de alta. Tarea 19: solo la entrada de alta.
- Tarea 7: En curso 10 el 2026-02-20, sin comentario; Cancelada 10 el 2026-03-05 ("Se cancela: el piloto pasa a Nordelta.").
- Tareas 8 a 15: En curso con el avance de la tarea el 2026-03-01, sin comentario.
- Tareas 20 a 24: solo la entrada de alta (Created 2026-04-10T10:00:00). Tareas 25 y 26: alta (2026-04-10T10:00:00); En curso 30 el 2026-05-10, sin comentario; Frenada 30 el 2026-06-01, sin comentario. Tareas 27 y 28: alta (2026-04-10T10:00:00); Finalizada 100 el 2026-06-15, sin comentario.
- Tarea 16: En curso 35 el 2026-03-01, sin comentario; Frenada 35 el 2026-04-01, sin comentario. Tarea 17: Finalizada 100 el 2026-06-30, sin comentario. Tarea 18: Cancelada 5 el 2026-02-15, sin comentario.

---

## Phase 1: Setup

**Purpose**: confirmar el punto de partida.

- [X] T001 Confirmar el punto de partida: `git branch --show-current` devuelve `007-tareas`; ejecutar `npm ci` y `npm run build` y anotar el resultado y las advertencias preexistentes (no se corrigen). **Criterio de terminado**: build base sin errores, o la lista de advertencias preexistentes.

- [X] T002 [P] Confirmar el prototipo: la primera línea de `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/LEEME.md` dice "v11"; localizar en `index.html` (con `Grep`) `scr.tareas`, `scr.tarea`, `sideTar`, `tarUpd`, `histOpen`, `i_ind` e `i_tar` y anotar el número de línea de cada uno para las tareas de interfaz. No se modifica ningún archivo. **Criterio de terminado**: lista de las siete referencias con su línea.

---

## Phase 2: Foundational (bloquea todas las historias)

**Purpose**: entidad, mocks, hooks, reglas de dominio, paginado, textos y rutas que usan todas las historias.

### Entidad y datasource

- [X] T003 Ampliar la entidad en `src/core/entities/Tarea.ts` (plan, D2; data-model, "Tarea"), solo atributos y `mapItem`:
  - agregar `QueHabilita?: string | undefined` (`item.QueHabilita ?? undefined`), `ComentarioEjecutivo?: string | undefined`, `ComentarioEjecutivoFecha?: Date | null | undefined` (`toDateValue`), `ComentarioEjecutivoAutor?: IPersonValue | undefined` (`toPersonValue`) y `FechaUltimaActualizacion?: Date | null | undefined` (`toDateValue`);
  - `Area` pasa a `ILookupValue[] | undefined` y se lee con `toLookupValueArray(item.Area)`, como `src/core/entities/Iniciativa.ts`;
  - `Prioridad` pasa a `Prioridad | null | undefined`; `mapItem` no cambia (`toChoiceValue` ya devuelve `undefined`);
  - no tocar `RequiereInversion` ni los demás campos;
  - revisar con `Grep` los usos de `Tarea` y de `.Area` en `src/` y arreglar solo lo que el cambio de tipos rompa.
  - **Criterio de terminado**: `new Tarea({ ..., Area: [{ Id: 1, Title: 'x' }] }).Area` es una lista; `npm run build` sin errores.

- [X] T004 Ajustar `toListItem` en `src/core/entities/Tarea.ts` (plan, D2, H2). Depende de T003:
  - enviar `Title: this.Nombre` (después de `...super.toListItem()`, como `Iniciativa`);
  - `AreaId: toLookupIds(this.Area)`;
  - `QueHabilita`, `ComentarioEjecutivo`, `ComentarioEjecutivoFecha`, `FechaUltimaActualizacion` y `ComentarioEjecutivoAutorId: this.ComentarioEjecutivoAutor?.Id`;
  - `Estado: this.Estado === undefined ? undefined : assertChoiceValue(EstadoTarea, this.Estado, 'Estado')` y `Prioridad` igual, pero devolviendo `null` tal cual cuando es `null` (así vacía el campo); un campo `undefined` se omite, de modo que los objetos parciales no lanzan;
  - `FechaFinalizacion` ya admite `null`;
  - quitar de `toListItem` la línea `RequiereInversion: this.RequiereInversion`: la entidad nunca envía ese campo (FR-013), aunque alguien copie un objeto leído de la lista; el atributo y su lectura en `mapItem` quedan como están (no se muestra en ninguna pantalla).
  - **Criterio de terminado**: `Object.assign(new Tarea(), { Id: 1, Avance: 50 }).toListItem()` no lanza y no incluye `Estado` ni `Prioridad`; `Prioridad = null` se serializa `null`; `toListItem()` no incluye `RequiereInversion` ni siquiera si se asigna a la instancia; `npm run build` sin errores.

- [X] T005 [P] Ampliar el `select` de `src/core/api/Tarea/TareaDataSource.ts` (plan, D2): agregar `'QueHabilita'`, `'ComentarioEjecutivo'`, `'ComentarioEjecutivoFecha'`, `'ComentarioEjecutivoAutor/Id'`, `'ComentarioEjecutivoAutor/Title'`, `'ComentarioEjecutivoAutor/EMail'` y `'FechaUltimaActualizacion'` a `selectProperties`, y `'ComentarioEjecutivoAutor'` a `expand`. Dejar `Area/Id` y `Area/Title` y todo lo demás como está. **Criterio de terminado**: `selectProperties` y `expand` incluyen lo nuevo; `npm run build` sin errores.

### Mocks y hooks de `core`

- [X] T006 [P] Crear `src/core/api/Tarea/TareaMock.ts` con la clase y sin datos (plan, D1, principio III). Copiar el patrón de `src/core/api/ResultadoClave/ResultadoClaveMock.ts`: `implements ITareaDataSource`, `listTitle = Lista.Tarea`, `export default class TareaMock`, estado a nivel de módulo (`let tareas: Tarea[] = []`), `notFoundError` con estado 404.
  - `getItems`: `Promise.resolve(tareas.slice())`. `getFilteredItems(iniciativaId)`: las de `Iniciativa?.Id === iniciativaId`.
  - `add`: próximo Id (máximo + 1), `Created` = ahora, `Author` = `USUARIO_PRUEBA` (de `../Usuario/UsuarioMock`); devuelve el elemento.
  - `edit`: rechaza con `notFoundError()` si no existe; combina con el existente **solo los campos definidos** del item recibido (recorrer con `Object.keys`, omitir los `undefined`) y convierte un `null` en `undefined` (así se vacía el campo); devuelve `Object.assign(new Tarea(), existente, definidos)`.
  - `delete`: quita el elemento. `getById`: rechaza con `notFoundError()` si no existe.
  - Una función auxiliar `createTarea(datos)` que arma `new Tarea({...})` con `Title` = `Nombre`, `Iniciativa` como `{ Id, Title }`, `Objetivo` como `{ Id, Title }` del objetivo de la iniciativa y `Area` como lista.
  - **Criterio de terminado**: la clase compila y `getItems` devuelve una lista vacía; `npm run build` sin errores.

- [X] T007 Cargar en `src/core/api/Tarea/TareaMock.ts` las tareas 1 a 7 de la iniciativa 1, con los valores de la tabla "Iniciativa 1" de "Datos de los mocks". Las áreas son `{ Id, Title }` de las áreas 1 a 4 de `IniciativaMock` (definirlas como constantes locales con los mismos Id y título). El comentario ejecutivo se arma con `ComentarioEjecutivo`, `ComentarioEjecutivoFecha` y `ComentarioEjecutivoAutor`. Depende de T006. **Criterio de terminado**: `getFilteredItems(1)` devuelve 7 tareas, una por estado más dos En curso extra; `npm run build` sin errores.

- [X] T008 Cargar en `src/core/api/Tarea/TareaMock.ts` las tareas 8 a 18 de la iniciativa 4 y la 19 de la iniciativa 11, según "Iniciativa 4" e "Iniciativa 11" de "Datos de los mocks". Depende de T007. **Criterio de terminado**: `getFilteredItems(4)` devuelve 11 tareas (10 no canceladas); `getItems()` devuelve 19 y 11 de ellas están En curso; `npm run build` sin errores.

- [X] T009 Cargar en `src/core/api/Tarea/TareaMock.ts` las tareas 20 a 28 de la iniciativa 5, según "Iniciativa 5" de "Datos de los mocks" (plan, D1). Depende de T008. **Criterio de terminado**: `getFilteredItems(5)` devuelve 9 tareas, todas no canceladas; `getItems()` devuelve 28 y 11 de ellas siguen En curso; `npm run build` sin errores.

- [X] T010 [P] Hacer que `src/core/api/Tarea/useTareaDataSource.ts` pase `new TareaMock()` como segundo argumento de `useDatasource`, como `src/core/api/Iniciativa/useIniciativaDataSource.ts`. Depende de T006. **Criterio de terminado**: fuera de SharePoint, `useTareaDataSource` devuelve las tareas del mock; `npm run build` sin errores.

- [X] T011 [P] Hacer lo mismo en `src/core/api/Tarea/useItemTareaDataSource.ts`. Depende de T006. **Criterio de terminado**: compila y usa el mock fuera de SharePoint.

- [X] T012 [P] Crear `src/core/api/Tarea/useTareasIniciativa.ts` (plan, D1). Copiar `src/core/api/ComentarioIniciativa/useComentariosIniciativa.ts` con `Tarea`, `TareaDataSource`, `TareaMock`, `ITareaDataSource`, la interfaz `ITareasIniciativaState` y el parámetro `iniciativaId`, con una diferencia: `reload` devuelve `Promise<Tarea[]>` con las tareas leídas (lista vacía si falla o si `iniciativaId` es `undefined`), para que el alta cuente sobre datos frescos. El `console.error` dice "No se pudieron cargar las tareas de la iniciativa.". Depende de T006. **Criterio de terminado**: `useTareasIniciativa(1).items` devuelve las 7 tareas y `reload()` resuelve con ellas; `npm run build` sin errores.

- [X] T013 [P] Crear `src/core/api/AvanceTarea/AvanceTareaMock.ts` con la clase y sin datos (plan, D1). Mismo patrón que T006: `implements IAvanceTareaDataSource`, `listTitle = Lista.AvanceTarea`, estado a nivel de módulo, `notFoundError`. `getFilteredItems(tareaId)` devuelve las de `Tarea?.Id === tareaId` **del registro más nuevo al más viejo** (por `Created` descendente y, a igual fecha, `Id` descendente). `add`: próximo Id, `Created` = ahora, `Author` = `USUARIO_PRUEBA`. `edit`, `delete` y `getById` como en T006. **Criterio de terminado**: la clase compila; `npm run build` sin errores.

- [X] T014 Cargar en `src/core/api/AvanceTarea/AvanceTareaMock.ts` las entradas de "Entradas de `AvanceTareaMock`" de "Datos de los mocks", con `Tarea` como `{ Id, Title: 'Tarea <Id>' }`, `Created` como cadena ISO y `Author` según la regla indicada. Depende de T013. **Criterio de terminado**: `getFilteredItems(2)` devuelve 5 entradas, la más reciente primero (En curso 95); `getFilteredItems(6)` devuelve 1 ("Tarea cargada."); `getFilteredItems(26)` devuelve 3 (la más reciente, Frenada 30); `npm run build` sin errores.

- [X] T015 [P] Hacer que `src/core/api/AvanceTarea/useAvanceTareaDataSource.ts` pase `new AvanceTareaMock()` como segundo argumento de `useDatasource`. Depende de T013. **Criterio de terminado**: compila y usa el mock fuera de SharePoint.

- [X] T016 [P] Hacer lo mismo en `src/core/api/AvanceTarea/useItemAvanceTareaDataSource.ts`. Depende de T013. **Criterio de terminado**: compila y usa el mock fuera de SharePoint.

- [X] T017 [P] Crear `src/core/api/AvanceTarea/useAvancesTarea.ts` (plan, D1), igual a `useTareasIniciativa` (T012) pero con `AvanceTarea`, `AvanceTareaDataSource`, `AvanceTareaMock`, `IAvanceTareaDataSource`, la interfaz `IAvancesTareaState`, el parámetro `tareaId` y `reload(): Promise<void>` como `useComentariosIniciativa`. El `console.error` dice "No se pudo cargar el historial de avance de la tarea.". **Ordena `items` por `Created` descendente y, a igual fecha, por `Id` descendente antes de devolverlos** (el datasource real no ordena; FR-025, FR-039). Depende de T013. **Criterio de terminado**: `useAvancesTarea(2).items` devuelve 5 entradas, la de 2026-05-20 primero; con el datasource real, que no ordena, el hook devuelve el mismo orden (Created descendente, luego Id descendente); `npm run build` sin errores.

### Reglas de dominio y paginado

- [X] T018 [P] Crear `src/webparts/objetivosVp/components/Tarea/tareaUtils.ts`, parte 1: tipos, constantes y formatos (plan, D6). Sin acceso a datos ni a pantallas:
  - `TAREA_ID_PREFIX = 'TAR-'`, `formatTareaId(id)` (`TAR-` y el Id con dos dígitos como mínimo, como `formatIniciativaId` en `Iniciativa/iniciativaUtils.ts`);
  - `TAREA_MAX_LENGTH = { nombre: 100, comentario: 500 }` (FR-012a);
  - `getEstadoTareaChipColor(estado)`: No iniciada `neutral`, En curso `brand`, Frenada `danger`, Finalizada `success`, Cancelada `secondary` (tipo `ChipColor` de `core/ui/patterns`);
  - `getAniosObjetivo(objetivo)`: los años entre `FechaInicio` y `FechaCompromiso` del objetivo, ambos incluidos; lista vacía si falta alguna (misma regla que `getAniosIniciativa` de `Iniciativa/iniciativaUtils.ts`, sobre el objetivo);
  - `TareasVista = 'mis' | 'todas'`, `ITareasFiltros { departamentoId, objetivoId, iniciativaId, responsableId, anio: string }` y `EMPTY_TAREAS_FILTROS` con todo `''`.
  - **Criterio de terminado**: `formatTareaId(3) === 'TAR-03'`; `npm run build` sin errores.

- [X] T019 En `src/webparts/objetivosVp/components/Tarea/tareaUtils.ts`, parte 2: estados y transiciones (plan, D6; spec, FR-019a, FR-020, FR-023). Depende de T018:
  - `TRANSICIONES_TAREA: Record<EstadoTarea, EstadoTarea[]>`: No iniciada → En curso, Cancelada; En curso → Frenada, Finalizada, Cancelada; Frenada → En curso, Cancelada; Finalizada → En curso; Cancelada → ninguno;
  - `getEstadosDisponibles(estado)`: el estado actual más sus destinos; en Finalizada, solo En curso; en Cancelada, lista vacía;
  - `canEditTarea(tarea)` y `canRegistrarAvance(tarea)`: verdadero si el estado no es Cancelada;
  - `isReapertura(desde, hacia)`: de Finalizada a En curso;
  - `requiereConfirmacion(desde, hacia)`: verdadero solo si `hacia` es Finalizada o Cancelada y `desde` es distinto de `hacia`.
  - **Criterio de terminado**: `getEstadosDisponibles(EstadoTarea.Finalizada)` es `[EnCurso]`; `requiereConfirmacion(Finalizada, EnCurso)` es falso; `npm run build` sin errores.

- [X] T020 En `src/webparts/objetivosVp/components/Tarea/tareaUtils.ts`, parte 3: validaciones (plan, D6; spec, FR-008, FR-009, FR-020a, FR-022). Depende de T018. Cada función devuelve el texto del error (de `strings`) o `undefined`:
  - `getAvanceIssue(texto)`: obligatorio y entero de 0 a 100, con `TareaProgressInvalid`; `Number(texto)` finito, `Number.isInteger` y texto recortado no vacío;
  - `getFechaFinalizacionIssue(fecha, fechaInicio, hoy)`: `RequiredField` si falta; `TareaFinishDateBeforeStart` si es anterior a `fechaInicio`; `TareaFinishDateFuture` si es posterior a `hoy` (comparar como cadenas `YYYY-MM-DD`, sin cuentas de punto flotante);
  - `getFechasIssues(fechaInicio, fechaCompromiso, iniciativa)`: `{ inicio?, compromiso? }` con `RequiredField` si falta, `ObjetivoDateOrder` si el compromiso es anterior al inicio y `TareaDateOutOfRange` (con `{0}` y `{1}` completados con `formatDate` de las fechas de la iniciativa) si queda fuera de ellas, igual que `startIssue` y `commitmentIssue` de `Iniciativa/IniciativaForm/IniciativaForm.tsx`;
  - `getLengthIssue(valor, max, mensaje)`: el mensaje con `{0}` = máximo si el texto supera `max`.
  - **Criterio de terminado**: `getAvanceIssue('40,5')` y `getAvanceIssue('150')` devuelven error; `getAvanceIssue('40')` es `undefined`; `npm run build` sin errores.

- [X] T021 En `src/webparts/objetivosVp/components/Tarea/tareaUtils.ts`, parte 4: tope de tareas (plan, D6 y D7; spec, FR-010, FR-011, FR-043). Depende de T018:
  - `TAREAS_MAX_NO_CANCELADAS = 10` (el **tope de negocio** de RF-12; no tiene relación con el paginado);
  - `countNoCanceladas(tareas)`: las que no están Canceladas, incluidas las Finalizadas;
  - `getTopeIssue(tareas)`: `TareaLimitReached` con `{0}` = el tope si `countNoCanceladas(tareas) >= TAREAS_MAX_NO_CANCELADAS`;
  - `canCargarTarea(iniciativa, tareas)`: verdadero si la iniciativa no está Finalizada ni Cancelada y `countNoCanceladas(tareas)` es menor que el tope.
  - **Criterio de terminado**: con 10 tareas no canceladas, `canCargarTarea` es falso; al cancelar una, es verdadero; `npm run build` sin errores.

- [X] T022 [P] Crear `src/webparts/objetivosVp/components/Tarea/tareaPaginado.ts` (plan, D7; spec, FR-034, FR-041a). Es el **paginado**, separado del tope:
  - `TAREAS_PAGE_SIZE = 10` (fijo, no configurable) y `FIRST_PAGE = 1`;
  - `paginarTareas<T>(items: T[], page: number)` que devuelve `{ page, pageItems, total }` con la página acotada entre 1 y la última;
  - no importa nada de `tareaUtils.ts`.
  - **Criterio de terminado**: con 11 elementos y `page = 2`, `pageItems` tiene 1 y `page` es 2; con `page = 9`, se acota a 2; `npm run build` sin errores.

### Textos y rutas

- [X] T023 [P] Agregar las claves nuevas a `src/webparts/objetivosVp/loc/mystrings.d.ts`, una por cada fila de la tabla "Textos de localización" de [research.md](./research.md#textos-de-localización) que no se reutilice, con el mismo orden y estilo que las existentes (`TareasMine: string;`, etc.). Incluye `TareaDescription`, `TareaFinishDate` y `TareaFirstEntryComment`. **Criterio de terminado**: todas las claves nuevas declaradas; `npm run build` sin errores.

- [X] T024 [P] Agregar las mismas claves, con sus textos, a `src/webparts/objetivosVp/loc/en-us.js` (archivo de idioma que ya usa español), respetando las comillas escapadas (`\"{0}\"`). No traducir ni cambiar los textos de la tabla. Las claves de T023 y T024 deben coincidir una a una. **Criterio de terminado**: cada clave de `mystrings.d.ts` nueva está en `en-us.js`; `npm run build` sin errores.

- [X] T025 [P] Agregar a `src/webparts/objetivosVp/components/ObjetivosVp/routes.ts` (plan, D9): `TAREAS_PATH = '/tarea'`, `TAREA_DETAIL_PATH = \`${TAREAS_PATH}/:id\``, `getTareaPath(id)`, `TAREAS_VISTA_PARAM = 'vista'` y `TAREAS_VISTA_TODAS = 'todas'`, con el mismo estilo que `INICIATIVAS_PATH`, `INICIATIVA_DETAIL_PATH`, `INICIATIVAS_VISTA_PARAM` e `INICIATIVAS_VISTA_TODAS`. **Criterio de terminado**: las cinco exportaciones existen; `npm run build` sin errores.

**Checkpoint**: la capa de datos, las reglas de dominio, los textos y las rutas existen y compilan. Ninguna pantalla cambió todavía.

---

## Phase 3: User Story 7 - Ver las tareas en el detalle de la iniciativa (Priority: P1)

**Goal**: el detalle de la iniciativa muestra los indicadores por estado y la sección "Tareas (N de 10 no canceladas)", con paginado al final de la sección.

**Independent Test**: con mocks, abrir el detalle de las iniciativas 1, 2, 4 y de una de otra VP. Quickstart, escenarios 16, 17 (sin el botón del pie) y 18 (sin el botón del pie). Los escenarios con "Cargar tarea" (US7 esc. 5 a 8) se verifican en la fase de US1.

- [X] T026 [P] [US7] Agregar el prop opcional `inline?: boolean` a `src/webparts/objetivosVp/components/Iniciativa/IniciativasBandeja/IniciativasPaginador/IniciativasPaginador.tsx` (plan, D13; spec, FR-041a) y la clase `.inline` en `IniciativasPaginador.module.scss`. Con `inline`, el `<nav>` usa `position: static` (sin `fixed`, sin `z-index` ni sombra superior), con el mismo grid de tres columnas, y se muestra al final de la sección. Sin `inline`, nada cambia. **Criterio de terminado**: el uso actual de la bandeja de iniciativas se ve igual; con `inline`, el paginador no está fijo; `npm run build` sin errores.

- [X] T027 [P] [US7] Crear `src/webparts/objetivosVp/components/Tarea/TareasTable/TareasTable.tsx` y `TareasTable.module.scss` con la variante `iniciativa` (plan, "Sección de la iniciativa"; referencia: `sec.i_tar`, filas `c-ti2`). Copiar la estructura de `Iniciativa/IniciativasTable/IniciativasTable.tsx`:
  - props: `tareas: Tarea[]`, `variant: 'iniciativa' | 'bandeja'`, `emptyText: string`, `onView: (id: number) => void`, y `iniciativas?: Iniciativa[]` (solo `bandeja`, T056);
  - fila: `{ id: formatTareaId(Id), nombre, responsable: Responsable?.Title, compromiso: formatDate(FechaCompromiso), avance, estado, tarea }`, ordenada por Id ascendente;
  - columnas de `iniciativa`: ID (ancho 70), Tarea, Responsable, Compromiso, Avance, Estado (ancho 104) y Ver (ancho 48); en `bandeja` (T056) se suman Iniciativa y Actualizada;
  - Avance: `AvanceText` (`../../shared/AvanceText/AvanceText`) con `tarea.Avance ?? 0`; Estado: `Chip` `size="small"` `clickable={false}` con `getEstadoTareaChipColor`; Ver: `Button` `iconOnly` `variant="secondary"` `size="small"` con `FigmaIcon` `chevronCirclePrimary`, `Tooltip` `TareaViewTooltip` y `aria-label` `TareaViewAriaLabel`;
  - `Table` del DS con `getRowKey` por ID y `emptyText`.
  - Encabezados con claves reutilizadas (`ObjetivoColumnId`, `ObjetivoColumnProgress`, `ObjetivoColumnStatus`, `ObjetivoColumnView`) y nuevas (`TareaColumnName`, `TareaColumnResponsible`, `TareaColumnCommitment`, `TareaColumnUpdated`).
  - **Criterio de terminado**: renderiza las 7 tareas de la iniciativa 1 con las siete columnas; `npm run build` sin errores.

- [X] T028 [P] [US7] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaTareasIndicadores/IniciativaTareasIndicadores.tsx` (spec, FR-042, FR-042a; plan, A2; referencia: `sec.i_ind`). Props: `tareas: Tarea[]`. `SectionBand` (`../../../shared/SectionBand/SectionBand`) `collapsible`, título `TareaIndicatorsSection`, con una grilla de cinco `Field` (`../../../shared/Field/Field`) en este orden: No iniciadas, En curso, Frenadas, Finalizadas y Canceladas (rótulos `TareasStateNotStarted`, `TareasStateInProgress`, `TareasStateStopped`, `TareasStateFinished`, `TareasStateCancelled`), cada uno con la cantidad de tareas en ese estado sobre **todas** las de la iniciativa, sin paginar. Grilla de cinco columnas con tokens de `spacing`, como `IniciativaInfo.module.scss`. **Criterio de terminado**: para la iniciativa 1 muestra 1, 3, 1, 1 y 1 (No iniciada 1, En curso 3, Frenada 1, Finalizada 1, Cancelada 1); sin tareas, todo en 0; `npm run build` sin errores.

- [X] T029 [US7] Crear `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaTareas/IniciativaTareas.tsx` (spec, FR-041, FR-041a; plan, D13; referencia: `sec.i_tar`). Props: `tareas: Tarea[]`, `onView: (id: number) => void`. `SectionBand` `collapsible`, título `TareaSection` con `{0}` = `countNoCanceladas(tareas)` y `{1}` = `TAREAS_MAX_NO_CANCELADAS` (de `tareaUtils.ts`), y dentro `TareasTable` variante `iniciativa` con las tareas de la página que devuelve `paginarTareas(tareas, page)` (de `tareaPaginado.ts`; el estado `page` es local) y `emptyText` `TareaSectionEmpty`. Debajo de la tabla, `IniciativasPaginador` con `inline`, `pageSize={TAREAS_PAGE_SIZE}` y `total` = todas las tareas (canceladas incluidas), que solo se muestra con más de 10. El título y los indicadores no dependen de la página. Depende de T021, T022, T026 y T027. **Criterio de terminado**: la iniciativa 4 muestra "Tareas (10 de 10 no canceladas)", 10 filas en la página 1 y 1 en la 2, con el paginador al final de la sección (no fijo); la iniciativa 1, 7 filas sin paginador; `npm run build` sin errores.

- [X] T030 [US7] En `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` (plan, D13), cargar las tareas y mostrar las dos secciones. Depende de T012, T028 y T029:
  - `const tareas = useTareasIniciativa(isValidId ? iniciativaId : undefined);` (como `comentarios`); **no** sumar `tareas.error` a `loadError`: el resto del detalle se debe seguir viendo;
  - si `tareas.error`, mostrar en lugar de las dos secciones un `MessageBar` `type="error"` `TareasLoadError` (una línea) con un `Button` `secondary` `TareasRetry` que llama a `tareas.reload()` (FR-049), sin mostrar el estado vacío como si no hubiera tareas;
  - al final de `renderBody`, después de `IniciativaComentario`, renderizar `<IniciativaTareasIndicadores tareas={tareas.items} />` y `<IniciativaTareas tareas={tareas.items} onView={openTarea} />`, para iniciativas de la VP RRII y de otras VP (FR-044);
  - `openTarea(id)`: `navigate(getTareaPath(id), { state: { from: location.pathname + location.search } })` (import de `getTareaPath` desde `../../ObjetivosVp/routes`);
  - no tocar el pie, ni el encabezado, ni los demás paneles.
  - **Criterio de terminado**: el detalle de la iniciativa 1 muestra las dos secciones nuevas al final y las existentes sin cambios; con la carga de tareas forzada a fallar, aparece el aviso con "Reintentar" y el resto del detalle se sigue viendo; `npm run build` sin errores.

- [ ] T031 [US7] Verificar US7 con mocks (`npm start`, workbench local): quickstart, escenarios 16, 17 (hasta "11 filas, de a 10") y 18 (sección vacía e indicadores en 0 en las iniciativas 2 y 3), y la sección en la iniciativa de otra VP (iniciativa 11). Comprobar que el avance de la iniciativa no cambia. **Criterio de terminado**: los escenarios pasan, o queda anotado cuáles no y por qué.

**Checkpoint**: se puede leer lo cargado en las tareas desde el detalle de la iniciativa.

---

## Phase 4: User Story 3 - Ver el detalle de la tarea y su historial de avance (Priority: P1)

**Goal**: el detalle de la tarea, con migas, secciones independientes, pie fijo y panel de historial.

**Independent Test**: con mocks, abrir una tarea desde la sección de la iniciativa. Quickstart, escenarios 15 (con una tarea del mock), 20, 21 y 30.

- [X] T032 [P] [US3] Agregar los props opcionales `iniciativaId?: number` y `tareaNombre?: string` a `src/webparts/objetivosVp/components/Palanca/PalancaBreadcrumb/PalancaBreadcrumb.tsx` (plan, D8, D14). Cuando hay `tareaNombre`: la iniciativa pasa a ser un enlace (`onClick: () => navigate(getIniciativaPath(iniciativaId))`, importando `getIniciativaPath` de `../../ObjetivosVp/routes`) y la tarea es el último nivel (`isCurrentItem: true`). Sin `tareaNombre`, el comportamiento actual no cambia. **Criterio de terminado**: el detalle de la iniciativa y el del objetivo muestran las mismas migas que antes; con `tareaNombre` aparece "… › iniciativa › tarea"; `npm run build` sin errores.

- [X] T033 [P] [US3] Crear `src/webparts/objetivosVp/components/Tarea/TareaDetalle/TareaInfo/TareaInfo.tsx` y `TareaInfo.module.scss` (spec, FR-038; plan, D8; referencia: `sec.t_info`). Copiar la estructura de `Iniciativa/IniciativaDetalle/IniciativaInfo/IniciativaInfo.tsx`. Props: `tarea: Tarea`, `iniciativaText: string`, `objetivoText: string`, `areaNames: string`, `onEdit?: () => void`. `SectionBand` `collapsible` (expandida), título `TareaInfoSection`, con un `Field` (de `shared/Field`) por dato: Iniciativa, Objetivo, Responsable, Áreas involucradas, Prioridad, Fecha de inicio, Fecha de compromiso, Fecha de finalización, y debajo Descripción y ¿Qué habilita?, cada una a todo el ancho. Los datos vacíos muestran `ObjetivoNoValue` ("—"); la Fecha de finalización solo tiene valor con Finalizada. Lápiz de edición como `IniciativaInfo` (`Button` `iconOnly` `FigmaIcon` `editPrimary` + `Tooltip`) solo si hay `onEdit`. **Criterio de terminado**: para la tarea 1 muestra todos los datos; para la 3, la Fecha de finalización en "—"; `npm run build` sin errores.

- [X] T034 [P] [US3] Crear `src/webparts/objetivosVp/components/Tarea/TareaDetalle/TareaComentario/TareaComentario.tsx` (spec, FR-039a; plan, D8; referencia: `sec.t_com`). Copiar `Iniciativa/IniciativaDetalle/IniciativaComentario/IniciativaComentario.tsx`. Props: `tarea: Tarea`, `onEdit?: () => void`. `SectionBand` `collapsible` `defaultCollapsed`, título `IniciativaCommentSection` ("Comentario ejecutivo"). Con `ComentarioEjecutivo`: `Field` con rótulo `IniciativaCommentMeta` (`{0}` = `formatDate(ComentarioEjecutivoFecha)`, `{1}` = `ComentarioEjecutivoAutor?.Title`) y el texto como valor; sin comentario, `IniciativaCommentEmpty`. Lápiz solo si hay `onEdit`. **Criterio de terminado**: la tarea 2 muestra su comentario con fecha y autor; la 3, "Todavía no hay comentario ejecutivo."; `npm run build` sin errores.

- [X] T035 [P] [US3] Crear `src/webparts/objetivosVp/components/Tarea/TareaHistorialPanel/TareaHistorialPanel.tsx` (spec, FR-039; plan, A5; referencia: `histOpen`). Props: `tarea: Tarea`, `onClose: () => void`. Usa `useAvancesTarea(tarea.Id)` (T017). `Panel` del DS con el ancho de 480 px de `IniciativaForm.module.scss` (copiar las reglas `.panel` a un `TareaHistorialPanel.module.scss` propio), título `buildPanelTitle(strings.TareaHistory, formatIdNombre(formatTareaId(Id), Nombre))` (`../../shared/panelTitle` y `formatIdNombre` de `../../Iniciativa/iniciativaUtils`), pie con `Button` `secondary` `TareaHistoryClose`. Cuerpo: `Spinner` mientras carga; `MessageBar` `type="error"` `TareaHistoryLoadError` si falla; sin entradas, un texto de una línea `TareaHistoryEmpty`; si no, `ActivityItems` (`core/ui/patterns`, variante `comment`) con una `IActivityItem` por entrada, en el orden que devuelve el hook (T017 las ordena por `Created` descendente y, a igual fecha, por `Id` descendente, también con el datasource real): `author` = `Author?.Title`, `verb` = `TareaHistoryVerb`, `subject` = `TareaHistorySubject` con `{0}` = estado y `{1}` = avance, `description` = `Comentario` (vacío = sin la línea), `time` = `formatDate(Created)` (dd/mm/aaaa, sin hora). Sin acciones sobre las entradas. **Criterio de terminado**: la tarea 2 muestra 5 entradas, la más reciente primero y, a igual fecha, la registrada más tarde (mayor `Id`) primero, también con el datasource real; la 6 muestra 1 ("Tarea cargada."); sin acciones de edición ni borrado; `npm run build` sin errores.

- [X] T036 [US3] Crear `src/webparts/objetivosVp/components/Tarea/TareaDetalle/TareaDetalle.tsx` y `TareaDetalle.module.scss` (spec, FR-037, FR-037b, FR-037c, FR-040; plan, D8; referencia: `scr.tarea`). Copiar la estructura de `Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` (`useParams`, `useNavigate`, `useLocation`, `getFrom`, `PAGE_PADDING`, `SuccessNotice`). Depende de T032 a T035:
  - carga: `useTareaDataSource` (`getById`), `useIniciativaDataSource` (`getById`), `useObjetivoDataSource` (`getById`) y `useAreaDataSource` (`getItems`), más `useObjetivoNames`; `getById(tareaId).catch(...)` con `isNotFoundError` (de `Objetivo/objetivoUtils`) → `notFound` o `error`, como `ObjetivoDetalle`; después `getById` de la iniciativa de la tarea y del objetivo de esa iniciativa;
  - `Spinner` mientras carga; `MessageBar` `TareaNotFound` o `TareaLoadError` (una línea) según el caso; con `TareaLoadError` se muestra además un `Button` `secondary` `TareasRetry` que vuelve a ejecutar la carga de la pantalla (FR-049), y `TareaNotFound` no lleva reintento;
  - migas: `PalancaBreadcrumb` con `palancaNombre`/`palancaId` solo si el objetivo es de la VP RRII (`isVpRrii`), `objetivoNombre`, `objetivoId`, `iniciativaNombre`, `iniciativaId` y `tareaNombre`;
  - encabezado: `BackButton`, `h1` con `HEADER_TITLE_STYLE` y "TAR-nn · nombre", `HeaderChip` con `getEstadoTareaChipColor`, y "Avance:" (`ObjetivoDetailProgress`) con `AvanceText` `spaced` con el avance de la tarea;
  - cuerpo: **secciones independientes y hermanas**: `<TareaInfo … />` y `<TareaComentario … />`, sin que una conozca a la otra; el objetivo y la iniciativa se muestran como "OBJ-nn · nombre" (`formatObjetivoLabel`) e "INI-nn · nombre" (`formatIdNombre` + `formatIniciativaId`);
  - pie fijo con `DetailFooter`: `Button` `secondary` `Cancelar` (vuelve a la pantalla de origen) y `Button` `secondary` `TareaHistory` que abre `TareaHistorialPanel`;
  - Volver y Cancelar: a `state.from` si existe; si no, al detalle de la iniciativa de la tarea (`getIniciativaPath`); si la tarea no existe, a `TAREAS_PATH`;
  - **no** mostrar "Ubicación en la estrategia" ni nada de presupuesto, riesgos o inversión.
  - Props: ninguna por ahora (los permisos se agregan en T052 y T065).
  - **Criterio de terminado**: el detalle de la tarea 2 se ve completo con las dos secciones y el pie; con la carga forzada a fallar, aparece `TareaLoadError` con "Reintentar"; `npm run build` sin errores.

- [X] T037 [US3] Agregar la ruta del detalle en `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`: `<Route path={TAREA_DETAIL_PATH} element={<TareaDetalle />} />`, con los imports de `TareaDetalle` y de `TAREA_DETAIL_PATH`. Depende de T036. **Criterio de terminado**: `#/tarea/2` abre el detalle de la tarea 2; `#/tarea/999` muestra `TareaNotFound`; `npm run build` sin errores.

- [ ] T038 [US3] Verificar US3 con mocks: quickstart, escenarios 20, 21 y 30, y el 15 con una tarea del mock (la tarea 6: una sola entrada y comentario ejecutivo vacío). Comprobar con una tarea de la iniciativa 11 que las migas omiten la palanca. **Criterio de terminado**: los escenarios pasan, o queda anotado cuáles no y por qué.

**Checkpoint**: se puede navegar de la iniciativa a la tarea y leer su información, su comentario ejecutivo y su historial.

---

## Phase 5: User Story 1 - Cargar una tarea en una iniciativa (Priority: P1)

**Goal**: el panel lateral "Cargar tarea", abierto desde el pie del detalle de la iniciativa (y, en US5, desde la bandeja), con el alta guardada en dos pasos y reintento sin duplicar.

**Independent Test**: con mocks, cargar una tarea desde el pie del detalle de la iniciativa 1 y verla en la sección y en su detalle. Quickstart, escenarios 8 a 14 (el 8 se completa con la bandeja en US5), 15 y 34 (alta).

- [X] T039 [P] [US1] Crear `src/webparts/objetivosVp/components/Tarea/TareaForm/TareaForm.module.scss` con las mismas reglas que `Iniciativa/IniciativaForm/IniciativaForm.module.scss` (`.panel` de 480 px, `.panelContent`, `.gridPair`, `.field`, `.invalid`, `.multiline`), sin agregar reglas nuevas ni valores propios. **Criterio de terminado**: el archivo existe con esas clases; `npm run build` sin errores.

- [X] T040 [P] [US1] Crear `src/webparts/objetivosVp/components/Tarea/TareaForm/useTareaFormMasters.ts` (plan, D12). Copiar `Iniciativa/IniciativaForm/useIniciativaFormMasters.ts` con: `useIniciativaDataSource` (iniciativas), `useObjetivoDataSource` + `useObjetivoNames` (objetivos con nombres), `useAreaDataSource`, `useUsuarioDataSource`, `useCurrentUser`. Devuelve `{ iniciativas, objetivos, areas, usuarios, currentUser, ready, error }` con `ready` y `error` calculados como en el original. **Criterio de terminado**: devuelve las 13 iniciativas del mock; `npm run build` sin errores.

- [X] T041 [US1] Crear `src/webparts/objetivosVp/components/Tarea/TareaForm/TareaForm.tsx` con el cuerpo del panel: campos y estado (plan, "Panel de alta y edición"; referencia: `sideTar`). Copiar la estructura de `Iniciativa/IniciativaForm/IniciativaForm.tsx` (`IniciativaFormBody`). Exportar `TareaFormBody` con props: `iniciativas`, `objetivos`, `areas`, `usuarios`, `currentUser`, `iniciativaFijaId?: number`, `tarea?: Tarea`, `onSave: (tarea: Tarea) => Promise<void>`, `onCancel`. Depende de T039 y T040. Campos, en una columna y en este orden, con `Panel` del DS (`className={styles.panel}`), título `buildPanelTitle(strings.TareaNew)` (alta) y pie `Cancelar` `secondary` · `TareaNew` `primary`:
  - **Iniciativa**: `Dropdown` `required` `placeholder={strings.ObjetivoFormSelect}`; opciones: las iniciativas cuyo estado no es Finalizada ni Cancelada, de cualquier VP, ordenadas por Id, texto `formatIdNombre(formatIniciativaId(Id), Nombre)`; `disabled` si hay `iniciativaFijaId` (valor inicial) o `tarea`. **Sin buscador: diferencia con RF-12** (plan, A4);
  - **Objetivo**: `Input` `disabled` con `formatObjetivoLabel` del objetivo de la iniciativa elegida (vacío si no hay);
  - **Nombre de la tarea**: `Input` `required` `maxLength={TAREA_MAX_LENGTH.nombre}` `placeholder={strings.TareaFormNamePlaceholder}`;
  - **Responsable**: `Picker` `mode="people"` `required`, `people` = usuarios activos (`Activo === true` y `Usuario`) más el usuario actual, ordenados por nombre; `onSelectedPeopleChange={(next) => setResponsable(next.slice(-1))}`, como el Accountable de `IniciativaForm`; valor inicial: el usuario actual;
  - **Descripción** y **¿Qué habilita?**: `Multiline` `required`, con `TareaFormDescriptionPlaceholder` y `TareaEnablesPlaceholder`;
  - **Áreas involucradas**: `Dropdown` `multiple` `required`, mismas áreas que `IniciativaForm` (todas las del maestro, ordenadas por nombre);
  - **Prioridad**: `Dropdown` con la opción vacía `TareaNoPriority` y Alta, Media, Baja (`Prioridad`);
  - **Fecha de inicio** y **Fecha de compromiso**: `Picker` `mode="date"` `required`, lado a lado en `.gridPair`.
  - Los errores se muestran en el campo (`errorMessage` o `renderFieldError`) solo después del primer intento de guardar (`submitted`), una línea.
  - No hay campo Estado, Avance, Fecha de finalización ni Requiere inversión.
  - **Criterio de terminado**: el panel muestra los campos en ese orden con el pie correcto, sin validar todavía; `npm run build` sin errores.

- [X] T042 [US1] En `src/webparts/objetivosVp/components/Tarea/TareaForm/TareaForm.tsx`, agregar las validaciones (spec, FR-002, FR-008, FR-009, FR-012a). Depende de T020 y T041:
  - obligatorios con `strings.RequiredField`: Iniciativa, Nombre (recortado), Responsable, Descripción (recortada), ¿Qué habilita? (recortada), Áreas (al menos una), Fecha de inicio y Fecha de compromiso;
  - Nombre: `getLengthIssue(nombre, TAREA_MAX_LENGTH.nombre, strings.TareaNameTooLong)`;
  - fechas: `getFechasIssues(fechaInicio, fechaCompromiso, iniciativa)` con la iniciativa elegida;
  - un campo `invalid(...)` y `shown(...)` como en `IniciativaForm` (borde de error con la clase `.invalid` y `--field-error`);
  - `requestSave` hace `setSubmitted(true)` y, si no hay errores, abre la confirmación (T043).
  - **Criterio de terminado**: guardar con campos vacíos muestra "Este campo es obligatorio." en cada uno, y con compromiso anterior al inicio o fuera de rango, el error del campo de fecha; `npm run build` sin errores.

- [X] T043 [US1] En `src/webparts/objetivosVp/components/Tarea/TareaForm/TareaForm.tsx`, agregar la confirmación y el guardado (spec, FR-016, FR-018). Depende de T042:
  - `ConfirmacionModal` (`../../Iniciativa/ConfirmacionModal/ConfirmacionModal`) con título `TareaNew` y mensaje `TareaConfirmCreate` con `{0}` = el nombre del responsable elegido;
  - `buildTarea()`: `new Tarea()` con `Nombre`, `Descripcion`, `QueHabilita` (recortados), `Iniciativa` (`{ Id, Title }`), `Objetivo` (el de la iniciativa, `{ Id, Title }`), `Responsable`, `Area` (lista de `{ Id, Title }`), `Prioridad` (o `undefined` sin prioridad), `FechaInicio` y `FechaCompromiso` (con `fromDateInput`), `Estado = EstadoTarea.NoIniciada` y `Avance = 0`; **sin** `RequiereInversion`, `FechaFinalizacion`, comentario ni `FechaUltimaActualizacion` (los completa el guardado, T045);
  - `save()`: `setIsSaving(true)`, `await onSave(buildTarea())`; si lanza, `setSaveFailed(true)`, `setIsSaving(false)`, cierra la confirmación y muestra `MessageBar` `type="error"` `TareaSaveError` (una línea) conservando lo ingresado; Cancelar en el pie o en el modal no registra nada.
  - **Criterio de terminado**: con datos válidos se abre la confirmación con el nombre del responsable; Cancelar la cierra sin guardar; `npm run build` sin errores.

- [X] T044 [US1] Crear `src/webparts/objetivosVp/components/Tarea/TareaForm/TareaFormPanel.tsx` con la carga y el control del tope (plan, D4 y D12). Copiar la estructura de `Iniciativa/IniciativaForm/IniciativaFormPanel.tsx`. Props: `tarea?: Tarea`, `iniciativaFijaId?: number`, `onSaved: (tarea: Tarea) => void`, `onCancel: () => void`. Depende de T012, T040 y T043:
  - `useTareaFormMasters(...)`; mientras no están listos, un `Panel` con `Spinner`; si fallan, `MessageBar` `type="error"` `ObjetivoFormLoadError`;
  - renderiza `TareaFormBody` con los maestros y `onSave`;
  - declarar la referencia de reintento `const tareaCreada = React.useRef<Tarea | undefined>(undefined)` (la completa T045);
  - control del **tope** (spec, FR-010): **solo si `tareaCreada.current` es `undefined`** (una tarea huérfana de un intento anterior contaría en el conteo y bloquearía el reintento), `useTareasIniciativa(...).reload()` se llama al guardar con el Id de la iniciativa elegida; si `getTopeIssue(tareasFrescas)` devuelve un error, `onSave` lanza un error propio que `TareaFormBody` muestra en el campo Iniciativa (agregar a `TareaFormBody` el estado `topeIssue` y su `errorMessage`) sin mostrar `TareaSaveError`, y no se escribe nada.
  - Este componente todavía no guarda (T045).
  - **Criterio de terminado**: elegir la iniciativa 4 y guardar muestra en el campo Iniciativa "La iniciativa ya tiene 10 tareas no canceladas (máximo 10)."; con otra iniciativa pasa al guardado; `npm run build` sin errores.

- [X] T045 [US1] En `src/webparts/objetivosVp/components/Tarea/TareaForm/TareaFormPanel.tsx`, implementar el guardado del alta en dos pasos con deshacer y reintento sin duplicar (plan, D4, R1; spec, FR-007a, FR-026). Copiar el mecanismo de `saveAlta` y `deshacerAlta` de `IniciativaFormPanel.tsx`, con `useTareaDataSource` y `useAvanceTareaDataSource` (`addItem`, `deleteItem`):
  - `useRef` para la tarea creada (`tareaCreada`, declarada en T044) y para la entrada creada;
  - **orden**: (1) `addItem` de la tarea con `FechaUltimaActualizacion = new Date()` (completando sobre lo que arma `buildTarea`), sin comentario ejecutivo; (2) `addItem` de la primera entrada: `AvanceTarea` con `Tarea` = `{ Id, Title }` de la tarea creada, `Avance = 0`, `Estado = EstadoTarea.NoIniciada` y `Comentario = strings.TareaFirstEntryComment`;
  - si falla el paso 2: `deleteItem` de la tarea creada y relanzar el error original; si el borrado también falla, la tarea queda en la referencia y se relanza el error;
  - **reintento**: si la referencia de la tarea existe, no se vuelve a crear y solo se agrega la entrada que falta; si la entrada ya existe, no se repite; nunca se duplica la tarea ni la entrada; el reintento **no** vuelve a controlar el tope (T044);
  - el `deleteItem` es un deshacer interno: no es una acción de la persona (FR-012);
  - al terminar bien, `onSaved(tareaCreada)`.
  - **Criterio de terminado**: un alta válida crea la tarea y exactamente una entrada ("Tarea cargada.", 0 %, No iniciada) y llama a `onSaved`; `npm run build` sin errores.

- [X] T046 [US1] En `src/webparts/objetivosVp/components/Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx` y `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`, agregar "Cargar tarea" al pie fijo y su permiso (plan, D9 y D13; spec, FR-043, FR-045). Depende de T045:
  - nuevo prop obligatorio `canCreateTarea: boolean`;
  - en `DetailFooter`, después de "Cambiar estado", `Button` `primary` con el rótulo `TareaNew`, estilo con `getColorStep('Tertiary', '900')` como `NEW_INICIATIVA_STYLE` de `IniciativasHeader` (plan, A3), `disabled` cuando `!canCargarTarea(iniciativa, tareas.items)`, visible solo con `canCreateTarea && iniciativa`;
  - estado `isTareaOpen` y, si está abierto, `<TareaFormPanel iniciativaFijaId={iniciativa.Id} onSaved={onTareaCreated} onCancel={() => setIsTareaOpen(false)} />`;
  - `onTareaCreated(tarea)`: cierra el panel, `tareas.reload()` y `setNoticeMessage(Utils.replaceAll(strings.TareaCreated, '{0}', tarea.Nombre ?? ''))`;
  - en `ObjetivosVp.tsx`, agregar `const CAN_CREATE_TAREA = true;` junto a las demás constantes `CAN_*` y pasar `canCreateTarea={CAN_CREATE_TAREA}` al `<IniciativaDetalle … />` (en el mismo cambio, para que compile).
  - **Criterio de terminado**: el pie muestra "Cargar tarea" habilitado en la iniciativa 1, deshabilitado en la 4 (10 no canceladas), la 6 (Finalizada) y la 8 (Cancelada); `npm run build` sin errores.

- [ ] T047 [US1] Verificar US1 con mocks: quickstart, escenarios 9 a 14 desde el pie del detalle de la iniciativa 1 (campos y orden, opciones del campo Iniciativa sin las iniciativas 6 y 8, Responsable solo activos, obligatorios, fechas, tope con la iniciativa 4, alta válida con la confirmación y el mensaje), y 15. Con la tarea creada: aparece en la sección, el indicador del estado No iniciada sube en 1, "N de 10 no canceladas" sube en 1, y su historial tiene una entrada. Además, con las iniciativas 6 y 8 abiertas: "Cargar tarea" deshabilitado (US7, esc. 6), y al cancelar una tarea de la iniciativa 4 el botón se habilita (se vuelve a probar en T053). **Criterio de terminado**: los escenarios pasan, o queda anotado cuáles no y por qué.

- [ ] T048 [US1] Probar el escenario de falla del alta, con cambios **temporales** que no se versionan y se revierten al terminar (spec, FR-007a, FR-026; quickstart, escenario 34, alta). En el workbench local:
  1. Con `AvanceTareaMock.add` forzado a rechazar una vez (un indicador de módulo temporal), cargar una tarea en la iniciativa 1. **Esperado**: una línea "No se pudo guardar la tarea.", el panel conserva lo ingresado, y al cerrar y mirar la iniciativa no hay una tarea nueva (se borró). Reintentar con el indicador apagado: queda **una** tarea y **una** entrada.
  2. Con `AvanceTareaMock.add` y `TareaMock.delete` forzados a rechazar una vez, cargar otra tarea. **Esperado**: el mismo error de una línea y el panel abierto con lo ingresado; la tarea quedó creada sin entrada. Reintentar con los indicadores apagados: **no** se crea una segunda tarea, solo se agrega la entrada que faltaba; queda una tarea y una entrada.
  3. **Iniciativa con 9 tareas no canceladas** (iniciativa 5): con `AvanceTareaMock.add` y `TareaMock.delete` forzados a rechazar una vez, cargar una tarea en la iniciativa 5. **Esperado**: el mismo error de una línea y la tarea creada sin entrada; la iniciativa pasó a tener 10 tareas no canceladas con la huérfana. Reintentar con los indicadores apagados: el reintento **no** muestra el error de tope, no crea una segunda tarea y agrega solo la entrada que faltaba; la iniciativa queda con 10 tareas y "Cargar tarea" del pie, deshabilitado.
  Revertir los cambios temporales y confirmar con `git diff` que los mocks quedaron como en T014, T008 y T009. **Criterio de terminado**: los tres escenarios registrados con su resultado y los mocks revertidos.

**Checkpoint**: se pueden cargar tareas desde la iniciativa, con tope, validaciones y alta consistente.

---

## Phase 6: User Story 2 - Registrar el avance de una tarea (Priority: P1)

**Goal**: el panel lateral "Registrar avance", con estados según la tabla de transiciones, comentario ejecutivo, historial y reapertura.

**Independent Test**: con mocks, registrar avance en tareas de la iniciativa 1. Quickstart, escenarios 22 a 29 y 34 (avance).

- [ ] T049 [US2] Crear `src/webparts/objetivosVp/components/Tarea/TareaAvancePanel/TareaAvancePanel.tsx` con la estructura y los campos (spec, FR-021 a FR-023; plan, "Panel Registrar avance"; referencia: `m.is.tarUpd`). Copiar la estructura de `Iniciativa/IniciativaEstadoPanel/IniciativaEstadoPanel.tsx` (`Panel`, estilos de `../TareaForm/TareaForm.module.scss`). Props: `tarea: Tarea`, `onSaved: () => void`, `onCancel: () => void`. Depende de T019:
  - título `buildPanelTitle(strings.TareaRegisterProgress, formatIdNombre(formatTareaId(Id), Nombre))`; pie `Cancelar` `secondary` · `Accept` `primary`;
  - **Estado** (`Dropdown` `required`) y **Avance (%)** (`Input` `type="number"`, rótulo `TareaProgressField`) lado a lado (`.gridPair`); las opciones de Estado salen de `getEstadosDisponibles(tarea.Estado)`; en una **Finalizada** hay solo En curso, precargado, y el Avance se muestra en 100 y se puede modificar; en las demás, el estado actual y el avance actuales;
  - con Estado Finalizada elegido: el Avance pasa a 100 y queda `disabled`, y aparece **Fecha de finalización** (`Picker` `mode="date"` `required`, rótulo `TareaFinishDate`); con otro estado no aparece;
  - **Comentario ejecutivo**: `Multiline` (rótulo `IniciativaCommentSection`, `placeholder` `TareaCommentPlaceholder`) precargado con `tarea.ComentarioEjecutivo`;
  - sin Estado vacío posible: en una Cancelada el panel no se abre (T052).
  - **Criterio de terminado**: el panel abre con los valores vigentes; en una No iniciada, Estado ofrece No iniciada, En curso y Cancelada; en una Finalizada, solo En curso; `npm run build` sin errores.

- [ ] T050 [US2] En `src/webparts/objetivosVp/components/Tarea/TareaAvancePanel/TareaAvancePanel.tsx`, agregar las validaciones (spec, FR-020, FR-020a, FR-022, FR-012a). Depende de T020 y T049:
  - Avance: `getAvanceIssue(avance)` (no se valida con Finalizada, que lo fija en 100);
  - con Finalizada: `getFechaFinalizacionIssue(fecha, toDateInput(tarea.FechaInicio), hoy)` con `hoy` = `toDateInput(new Date())`;
  - Comentario: `getLengthIssue(comentario, TAREA_MAX_LENGTH.comentario, strings.TareaCommentTooLong)`;
  - errores en el campo y una línea, solo después del primer intento de guardar.
  - **Criterio de terminado**: avance "abc", "150" y "40,5" muestran "Ingresá un número entero entre 0 y 100."; Finalizada sin fecha, con fecha futura o anterior al inicio muestra el error del campo; `npm run build` sin errores.

- [ ] T051 [US2] En `src/webparts/objetivosVp/components/Tarea/TareaAvancePanel/TareaAvancePanel.tsx`, agregar la confirmación y el guardado en dos escrituras con reintento sin duplicar la entrada (plan, D4, R4; spec, FR-021, FR-023, FR-024, FR-025, FR-026). Depende de T050. Copiar el mecanismo de `IniciativaEstadoPanel.save` (primero el comentario/entrada, después la edición), con `useAvanceTareaDataSource` y `useTareaDataSource`:
  - al elegir Aceptar: si `requiereConfirmacion(tarea.Estado, estado)`, `ConfirmacionModal` con título y mensaje `TareaConfirmFinishTitle`/`TareaConfirmFinish` (Finalizada) o `TareaConfirmCancelTitle`/`TareaConfirmCancel` (Cancelada), con `{0}` = "TAR-nn"; si no, guarda directo (incluida la reapertura, sin confirmación y sin pedir de nuevo la fecha);
  - `registraComentario` = el comentario recortado no está vacío y es distinto del precargado (recortado); un comentario vacío o igual al precargado no registra nada nuevo;
  - **paso 1**: `addItem` de un `AvanceTarea` con `Tarea` = `{ Id, Title }`, `Avance` (100 si Finalizada), `Estado` y `Comentario` solo si `registraComentario` (si no, sin esa propiedad); la entrada se guarda en una referencia (`useRef`) apenas se crea;
  - **paso 2**: `editItem` de un `Tarea` parcial (`Object.assign(new Tarea(), { Id, Estado, Avance, FechaFinalizacion: fecha o null, FechaUltimaActualizacion: entrada.Created })`) y, solo si `registraComentario`, `ComentarioEjecutivo` = el texto, `ComentarioEjecutivoFecha` = `entrada.Created` y `ComentarioEjecutivoAutor` = `entrada.Author`; con estado distinto de Finalizada, `FechaFinalizacion: null`;
  - si falla el paso 2, `MessageBar` `type="error"` `TareaProgressSaveError` (una línea), el panel conserva lo ingresado y la entrada queda en la referencia: **el reintento solo repite el paso 2**, sin duplicar la entrada;
  - **bloqueo**: una vez escrita la entrada y hasta completar el paso 2, el panel deshabilita Estado, Avance y Comentario ejecutivo (`disabled`), para que el reintento use los mismos valores que la entrada; Cancelar sigue disponible;
  - al terminar bien, `onSaved()`.
  - **Criterio de terminado**: registrar En curso 40 % con comentario nuevo deja una entrada (con el comentario) y actualiza la tarea; con comentario sin cambios, la entrada queda sin comentario y el vigente no cambia; con la segunda escritura fallando, Estado, Avance y Comentario ejecutivo quedan deshabilitados hasta que el reintento se complete; `npm run build` sin errores.

- [ ] T052 [US2] En `src/webparts/objetivosVp/components/Tarea/TareaDetalle/TareaDetalle.tsx` y `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`, agregar "Registrar avance" y su permiso (spec, FR-037, FR-037a, FR-027a, FR-045). Depende de T051:
  - nuevo prop obligatorio `canRegisterProgress: boolean`;
  - en el pie, `Button` `primary` `TareaRegisterProgress` (entre Cancelar y Historial), visible solo con `canRegisterProgress && canRegistrarAvance(tarea)`;
  - `onEdit` del lápiz de `TareaComentario` abre el mismo panel, con la misma condición;
  - estado `isAvanceOpen` y `<TareaAvancePanel tarea={tarea} onSaved={onAvanceSaved} onCancel={…} />`;
  - `onAvanceSaved`: cierra el panel, recarga la tarea (`getById`) y `setNoticeMessage(Utils.replaceAll(strings.TareaProgressUpdated, '{0}', tarea.Nombre ?? ''))`;
  - en `ObjetivosVp.tsx`, agregar `const CAN_REGISTER_PROGRESS_TAREA = true;` y pasar `canRegisterProgress={CAN_REGISTER_PROGRESS_TAREA}` al `<TareaDetalle />` (en el mismo cambio, para que compile).
  - **Criterio de terminado**: en una tarea En curso aparecen el botón y el lápiz; en una Cancelada no aparecen; `npm run build` sin errores.

- [ ] T053 [US2] Verificar US2 con mocks: quickstart, escenarios 22 a 29 (estados disponibles según la tabla, En curso 40 % con comentario nuevo, comentario sin tocar, Finalizada con fecha y su confirmación, avance inválido, Cancelada con su confirmación sin la mención al presupuesto, reapertura de una Finalizada, volver a finalizar). Comprobar en cada caso: el detalle, "Actualizada" (solo cambia aquí), el historial, el comentario ejecutivo, y que el avance de la iniciativa 1 no cambia (US2 esc. 11). **Criterio de terminado**: los escenarios pasan, o queda anotado cuáles no y por qué.

- [ ] T054 [US2] Probar el escenario de falla de "Registrar avance", con un cambio **temporal** que no se versiona y se revierte (spec, FR-026; quickstart, escenario 34, avance). Con `TareaMock.edit` forzado a rechazar una vez, registrar En curso 60 % con un comentario nuevo en la tarea 3. **Esperado**: una línea "No se pudo registrar el avance de la tarea.", el panel conserva lo ingresado; el historial ya tiene la entrada nueva (se escribió primero). Mientras el reintento está pendiente, Estado, Avance y Comentario ejecutivo del panel están **deshabilitados** (no se pueden cambiar). Reintentar con el indicador apagado: la tarea queda actualizada con los mismos valores de la entrada y el historial tiene **una sola** entrada nueva (no dos). Revertir y confirmar con `git diff` que `TareaMock.ts` quedó como en T009. **Criterio de terminado**: escenario registrado y mock revertido.

**Checkpoint**: se puede registrar avance con estados, fecha de finalización, comentario ejecutivo e historial consistentes.

---

## Phase 7: User Story 5 - Ver y recorrer la bandeja de tareas (Priority: P1)

**Goal**: la bandeja "Mis tareas" / "Todas", con subsolapas por estado, grilla y paginado, y el acceso de la home conectado.

**Independent Test**: con mocks, entrar desde la home. Quickstart, escenarios 1 a 5. La búsqueda y los filtros del encabezado se conectan en US6.

- [ ] T055 [P] [US5] Agregar los props opcionales `searchPlaceholder?: string` y `newLabel?: string` a `src/webparts/objetivosVp/components/Iniciativa/IniciativasBandeja/IniciativasHeader/IniciativasHeader.tsx` (plan, D10, D14), con los textos actuales como valor por defecto (`strings.IniciativasSearchPlaceholder` y `strings.IniciativaNew`). Sin cambio para sus usos actuales. **Criterio de terminado**: la bandeja de iniciativas se ve igual; `npm run build` sin errores.

- [ ] T056 [US5] Agregar la variante `bandeja` a `src/webparts/objetivosVp/components/Tarea/TareasTable/TareasTable.tsx` (T027; referencia: filas `c-tb`). Con `variant="bandeja"` las columnas son ID, Tarea, Iniciativa (texto "INI-nn · nombre" de la iniciativa de la tarea, buscada en `iniciativas`, o `Iniciativa?.Title` si no está), Responsable, Compromiso, Actualizada (`formatDate(FechaUltimaActualizacion)`), Avance, Estado y Ver. Depende de T027. **Criterio de terminado**: con `variant="bandeja"` se ven las nueve columnas; la variante `iniciativa` sigue igual; `npm run build` sin errores.

- [ ] T057 [US5] Crear `src/webparts/objetivosVp/components/Tarea/TareasBandeja/TareasBandeja.tsx` y `TareasBandeja.module.scss` con la carga, las solapas y el estado (spec, FR-028 a FR-030, FR-049; plan, D10). Copiar la estructura de `Iniciativa/IniciativasBandeja/IniciativasBandeja.tsx` (`useSearchParams`, `useNavigate`, `PAGER_SPACE`, `SUMMARY_STYLE`, `SuccessNotice`). Depende de T018, T022, T056 y T055:
  - exportar `ITareasBandejaState { searchText: string; filtros: ITareasFiltros; estado: EstadoTarea; page: number }` y props `canCreate`, `state`, `onStateChange`;
  - carga: `useTareaDataSource`, `useIniciativaDataSource`, `useObjetivoDataSource`, `useDepartamentoDataSource`, `useObjetivoNames` y `useCurrentUser`, en un `Promise.all`; `Spinner` mientras carga; si algo falla, `MessageBar` `type="error"` `TareasLoadError` con un botón `TareasRetry` que vuelve a cargar (FR-049), sin mostrar el estado vacío;
  - solapa: parámetro `TAREAS_VISTA_PARAM` (`'mis'` por defecto, `TAREAS_VISTA_TODAS`); `Tabs` `variant="transparent"` con `TareasMine (n)` y `TareasTabAll (n)`, cada n el total de la solapa sin búsqueda ni filtros; "Mis tareas" filtra por `Responsable?.Id === currentUser.user?.Id`;
  - al cambiar de solapa, `onStateChange({ ...state, page: FIRST_PAGE })` (de `tareaPaginado.ts`);
  - contador `TareasCount` ("N tareas en esta vista") = tareas de la solapa (todos los estados);
  - título del encabezado `TareasMine` o `TareasAllTitle`; `IniciativasHeader` con `searchPlaceholder={strings.TareasSearchPlaceholder}` y `newLabel={strings.TareaNew}`, `onBack` a `HOME_PATH`; sin botón "Actualizar".
  - **Criterio de terminado**: la bandeja carga con mocks y muestra solapas, título, contador y encabezado; `npm run build` sin errores.

- [ ] T058 [US5] En `src/webparts/objetivosVp/components/Tarea/TareasBandeja/TareasBandeja.tsx`, agregar las subsolapas, la grilla, el paginado y los estados vacíos (spec, FR-030 a FR-035; plan, D10). Depende de T057:
  - subsolapas: segundo `Tabs` `variant="subtle"` `size="small"` con En curso, Frenadas, No iniciadas, Finalizadas y Canceladas (rótulos `TareasState*`, valores `EstadoTarea`), cada una con la cantidad de la solapa; `state.estado` arranca en En curso; al cambiarla, `page` vuelve a 1;
  - grilla: `TareasTable` `variant="bandeja"` con `paginarTareas(tareasDeLaSubsolapa, state.page).pageItems`;
  - `IniciativasPaginador` (sin `inline`, fijo al pie) con `pageSize={TAREAS_PAGE_SIZE}` y `total` = las de la subsolapa; los contadores de solapas y subsolapas no dependen de la página;
  - estados vacíos (`emptyText`): `TareasEmpty` si la solapa no tiene ninguna tarea; `TareasEmptyFilters` si hay búsqueda o filtros; `TareasEmptyState` si no hay filtros y la subsolapa está vacía;
  - `openTarea(id)`: `navigate(getTareaPath(id), { state: { from: location.pathname + location.search } })`.
  - **Criterio de terminado**: "Todas" > En curso muestra "Mostrando 1–10 de 11" y paginador fijo; cambiar de subsolapa vuelve a la página 1; una subsolapa vacía muestra "No hay tareas en este estado."; `npm run build` sin errores.

- [ ] T059 [US5] En `src/webparts/objetivosVp/components/Tarea/TareasBandeja/TareasBandeja.tsx`, agregar "Cargar tarea" (spec, FR-014; plan, D10). Depende de T045 y T058:
  - `IniciativasHeader` recibe `canCreate` y `onNew={() => setIsFormOpen(true)}`;
  - si `isFormOpen`, `<TareaFormPanel onSaved={onCreated} onCancel={() => setIsFormOpen(false)} />` (sin iniciativa fija);
  - `onCreated(tarea)`: cierra el panel, recarga las tareas y muestra `SuccessNotice` con `TareaCreated`.
  - **Criterio de terminado**: desde la bandeja se carga una tarea eligiendo la iniciativa y aparece en la grilla; `npm run build` sin errores.

- [ ] T060 [US5] En `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`, agregar la ruta y el estado de la bandeja (plan, D9). Depende de T057 a T059:
  - constante `DEFAULT_TAREAS_BANDEJA_STATE: ITareasBandejaState = { searchText: '', filtros: EMPTY_TAREAS_FILTROS, estado: EstadoTarea.EnCurso, page: 1 }` y `useState` en `ObjetivosVpRoutes`, como `bandejaState`;
  - `<Route path={TAREAS_PATH} element={<TareasBandeja canCreate={CAN_CREATE_TAREA} state={tareasBandejaState} onStateChange={setTareasBandejaState} />} />`.
  - **Criterio de terminado**: `#/tarea` abre la bandeja; volver desde un detalle restaura solapa, subsolapa y página; `npm run build` sin errores.

- [ ] T061 [P] [US5] En `src/webparts/objetivosVp/components/Home/AccessList/AccessList.tsx`, agregar `route: TAREAS_PATH` al acceso `AccessMyTasks` (importando `TAREAS_PATH` de `../../ObjetivosVp/routes`), como los de iniciativas y palancas. No tocar los demás accesos. **Criterio de terminado**: "Mis tareas" de la home abre la bandeja; `npm run build` sin errores.

- [ ] T062 [US5] Verificar US5 con mocks: quickstart, escenarios 1 a 5, y el 8 completo (el panel desde la bandeja). Comprobar las columnas, los contadores que no cambian al paginar, el paginado fijo y que "Cargar tarea" desde la bandeja crea la tarea. **Criterio de terminado**: los escenarios pasan, o queda anotado cuáles no y por qué.

**Checkpoint**: se puede entrar a las tareas desde la home y recorrerlas por solapa y estado.

---

## Phase 8: User Story 4 - Editar los datos de una tarea (Priority: P2)

**Goal**: el panel "Editar tarea", con la iniciativa y el objetivo en lectura, sin estado ni avance.

**Independent Test**: con mocks, editar tareas de la iniciativa 1. Quickstart, escenarios 31 a 33.

- [ ] T063 [US4] Agregar el modo edición a `src/webparts/objetivosVp/components/Tarea/TareaForm/TareaForm.tsx` y `TareaFormPanel.tsx` (spec, FR-017, FR-017a; plan, D12). Depende de T045:
  - título `buildPanelTitle(Utils.replaceAll(strings.TareaFormEditTitle, '{0}', formatTareaId(tarea.Id)), tarea.Nombre)`; pie `Cancelar` · `SaveChanges`; confirmación con `TareaConfirmEdit`;
  - valores iniciales de `tarea`: Iniciativa y Objetivo en solo lectura (el `Dropdown` de Iniciativa `disabled`), Nombre, Responsable (el actual se sigue mostrando elegido hasta que se cambie, aunque esté inactivo, igual que las áreas; las opciones son solo los usuarios activos, así que no se puede elegir a un inactivo nuevo; plan, P-C4), Descripción, ¿Qué habilita?, Áreas, Prioridad, fechas;
  - un área de `tarea.Area` que no está en el maestro se agrega a las opciones para seguir mostrándose elegida hasta que se cambie (spec, FR-003);
  - las mismas validaciones del alta; **no** hay control del tope en la edición;
  - sin Estado, Avance ni Fecha de finalización.
  - **Criterio de terminado**: el panel abre con los datos de la tarea 2 y la iniciativa en lectura; `npm run build` sin errores.

- [ ] T064 [US4] En `src/webparts/objetivosVp/components/Tarea/TareaForm/TareaFormPanel.tsx`, implementar `saveEdicion` (plan, D4; spec, FR-017). Depende de T063: `editItem` de un `Tarea` parcial con `Id`, `Nombre`, `Descripcion`, `QueHabilita`, `Responsable`, `Area`, `Prioridad` (o `null` si se eligió "Sin prioridad"), `FechaInicio` y `FechaCompromiso`; **sin** `Estado`, `Avance`, `FechaFinalizacion`, `FechaUltimaActualizacion`, comentario ejecutivo, `Iniciativa` ni `Objetivo`. Un solo paso, sin referencias. Al terminar, `onSaved(tarea)`. **Criterio de terminado**: editar nombre y responsable deja intactos el estado, el avance, "Actualizada", el comentario ejecutivo y el historial; `npm run build` sin errores.

- [ ] T065 [US4] En `src/webparts/objetivosVp/components/Tarea/TareaDetalle/TareaDetalle.tsx` y `src/webparts/objetivosVp/components/ObjetivosVp/ObjetivosVp.tsx`, agregar "Editar" y su permiso (spec, FR-017a, FR-037a, FR-045; plan, D8). Depende de T064:
  - nuevo prop obligatorio `canEdit: boolean`;
  - en el pie, `Button` `primary` `Edit` (después de Cancelar), y el lápiz de `TareaInfo` (`onEdit`), visibles solo con `canEdit && canEditTarea(tarea)`;
  - estado `isFormOpen` y `<TareaFormPanel tarea={tarea} onSaved={onEdited} onCancel={…} />`;
  - `onEdited`: cierra el panel, recarga la tarea y `setNoticeMessage(Utils.replaceAll(strings.TareaUpdated, '{0}', tarea.Nombre ?? ''))`;
  - en `ObjetivosVp.tsx`, agregar `const CAN_EDIT_TAREA = true;` y pasar `canEdit={CAN_EDIT_TAREA}` al `<TareaDetalle />` (en el mismo cambio, para que compile).
  - **Criterio de terminado**: una tarea En curso o Finalizada muestra "Editar" y el lápiz; una Cancelada no; `npm run build` sin errores.

- [ ] T066 [US4] Verificar US4 con mocks: quickstart, escenarios 31 a 33. Comprobar en la edición de la tarea 3: nombre y responsable cambian, la tarea pasa a "Mis tareas" del nuevo responsable, y el estado, el avance, el historial, el comentario ejecutivo y "Actualizada" no cambian; en la tarea 7 (Cancelada) no hay "Editar" ni lápiz; en la tarea 1 (Finalizada) se edita sin poder cambiar la fecha de finalización. **Criterio de terminado**: los escenarios pasan, o queda anotado cuáles no y por qué.

**Checkpoint**: las tareas se pueden corregir sin tocar su seguimiento.

---

## Phase 9: User Story 6 - Buscar y filtrar en la bandeja de tareas (Priority: P2)

**Goal**: búsqueda por ID o nombre y panel de filtros (Departamento, Objetivo, Iniciativa, Responsable, Año).

**Independent Test**: con mocks, buscar y filtrar en la bandeja. Quickstart, escenarios 6 y 7.

- [ ] T067 [P] [US6] Crear `src/webparts/objetivosVp/components/Tarea/TareasBandeja/TareasFiltros/TareasFiltros.tsx` y `TareasFiltros.module.scss` (spec, US6 esc. 2; referencia: `dDir`, `dObj`, `dIni`, `dResp`, `dAnio` de `scr.tareas`). Copiar `Iniciativa/IniciativasBandeja/IniciativasFiltros/IniciativasFiltros.tsx` y su `.module.scss`. Props: `filtros: ITareasFiltros`, `departamentos`, `objetivos`, `iniciativas`, `responsables: IPersonValue[]`, `anios: number[]`, `onApply`, `onClear`, `onClose`. `Panel` (título `PalancasFilters`; pie `IniciativasFiltersClear` `secondary` · `IniciativasFiltersApply` `primary`) con cinco `Dropdown` con la opción "Todos" (`IniciativasFilterAll`): Departamento (`ObjetivoFieldDepartment`), Objetivo (`ObjetivoColumnName`), Iniciativa (`IniciativaColumnName`), Responsable (`TareaColumnResponsible`) y Año (`IniciativasFilterYear`); un solo valor por filtro. **Sin** filtro de Estado. **Criterio de terminado**: el panel muestra los cinco filtros; `npm run build` sin errores.

- [ ] T068 [P] [US6] Agregar a `src/webparts/objetivosVp/components/Tarea/tareaUtils.ts` la búsqueda y los filtros (spec, FR-033; plan, D10). Depende de T018:
  - `matchesTareaSearch(tarea, search)`: coincide con `formatTareaId(Id)` o `Nombre`, sin distinguir mayúsculas (`search` ya viene en minúsculas y recortado);
  - `matchesTareasFiltros(tarea, filtros, iniciativas, objetivos)`: toma la iniciativa de la tarea y el objetivo de la iniciativa; Departamento = `objetivo.Departamento?.Id`; Objetivo = `iniciativa.Objetivo?.Id`; Iniciativa = `tarea.Iniciativa?.Id`; Responsable = `tarea.Responsable?.Id`; Año = `getAniosObjetivo(objetivo)` incluye el año; los filtros vacíos no restringen.
  - **Criterio de terminado**: `matchesTareaSearch` encuentra "tar-03" y un nombre en otra capitalización; `npm run build` sin errores.

- [ ] T069 [US6] En `src/webparts/objetivosVp/components/Tarea/TareasBandeja/TareasBandeja.tsx`, conectar la búsqueda y los filtros (spec, FR-032, FR-033; plan, D10). Depende de T067 y T068:
  - `IniciativasHeader`: `searchText={state.searchText}` y `onSearchChange` (`onStateChange({ ...state, searchText, page: FIRST_PAGE })`), `onOpenFilters` abre `TareasFiltros` con las opciones calculadas (departamentos del maestro, objetivos con nombres, iniciativas, responsables únicos de las tareas, años);
  - `onApply`/`onClear` actualizan `state.filtros` y vuelven a la página 1;
  - `visibles` = tareas de la solapa que cumplen `matchesTareaSearch` y `matchesTareasFiltros`; el contador "N tareas en esta vista", los conteos de las subsolapas y el paginado se calculan sobre `visibles`; los totales de las solapas no cambian.
  - **Criterio de terminado**: buscar y filtrar actualiza el contador, las subsolapas y el paginado sin cambiar los totales de las solapas; `npm run build` sin errores.

- [ ] T070 [US6] Verificar US6 con mocks: quickstart, escenarios 6 y 7, y el 4 con un filtro sin coincidencias. Comprobar que el departamento y el año se toman del objetivo de la iniciativa de la tarea. **Criterio de terminado**: los escenarios pasan, o queda anotado cuáles no y por qué.

**Checkpoint**: la bandeja se puede acotar por búsqueda y filtros.

---

## Phase 10: Pulido

**Purpose**: reglas transversales, registro de cambios de `core` y confirmaciones finales.

- [ ] T071 Revisión de reglas transversales con `Grep` en los archivos tocados por la feature: sin hexadecimales de color, sin `any` nuevos, sin comentarios de código, sin textos escritos en el código (todo desde `strings`), sin `RequiereInversion`, "Requiere inversión", presupuesto, riesgos ni alertas en el código nuevo (salvo la propiedad que ya tenía la entidad `Tarea`, sin tocar), sin `window.open` ni navegación nueva fuera de `useNavigate`, `deleteItem` usado solo en `TareaFormPanel.tsx` y solo para deshacer un alta fallida (T045), ninguna pantalla con una acción para eliminar una tarea ni editar o borrar una entrada del historial, `TAREAS_MAX_NO_CANCELADAS` usado solo en `tareaUtils.ts` y sus llamadores del tope, `TAREAS_PAGE_SIZE` usado solo en `tareaPaginado.ts` y sus llamadores del paginado, y sin `useMemo`. Corregir lo que aparezca. **Criterio de terminado**: `Grep` sin coincidencias indebidas.

- [ ] T072 Registrar en `docs/plantilla-cambios.md` los cambios de `src/core` fuera de `src/core/ui` (plan, "Registro en `docs/plantilla-cambios.md`"). Agregar al final de la tabla, con la fecha del día en que se haga y la feature `007-tareas`, estas filas (mismo formato de columnas que la fila existente):
  - `src/core/entities/Tarea.ts` — suma `QueHabilita`, `ComentarioEjecutivo`, `ComentarioEjecutivoFecha`, `ComentarioEjecutivoAutor` y `FechaUltimaActualizacion`; `Area` pasa a lista; `Prioridad` admite `null`; `toListItem` envía `Title`, omite `Estado` y `Prioridad` sin definir y deja de enviar `RequiereInversion` — motivo: que la entidad guarde lo que pide la spec con objetos parciales;
  - `src/core/api/Tarea/TareaDataSource.ts` — el `select` suma las columnas nuevas — motivo: leer lo que la entidad ahora mapea;
  - `src/core/api/Tarea/useTareaDataSource.ts` y `useItemTareaDataSource.ts` — pasan `TareaMock` como segundo argumento — motivo: principio III;
  - `src/core/api/AvanceTarea/useAvanceTareaDataSource.ts` y `useItemAvanceTareaDataSource.ts` — pasan `AvanceTareaMock` como segundo argumento — motivo: ídem;
  - `src/core/api/Tarea/TareaMock.ts`, `useTareasIniciativa.ts` y `src/core/api/AvanceTarea/AvanceTareaMock.ts`, `useAvancesTarea.ts` — archivos nuevos: mocks y lecturas filtradas — motivo: principio III y consultas por iniciativa y por tarea.
  - **Criterio de terminado**: `docs/plantilla-cambios.md` tiene las cinco filas nuevas con fecha y feature.

- [ ] T073 [P] Confirmar que no se modificó `src/core/ui` (`git diff --stat src/core/ui` vacío) y que no hace falta anotar nada en `docs/design-system-cambios.md`. **Criterio de terminado**: sin cambios en `src/core/ui`.

- [ ] T074 [P] Confirmar la localización: las claves de `src/webparts/objetivosVp/loc/mystrings.d.ts` y de `loc/en-us.js` coinciden una a una, todas las claves nuevas se usan al menos en un archivo de `src/` y no queda ninguna sin uso ni ninguna duplicada con un texto ya existente (`Grep` de cada clave nueva). **Criterio de terminado**: lista de claves nuevas con su uso; ninguna huérfana.

- [ ] T075 Revisar que ninguna pantalla nueva muestre presupuesto, inversión, riesgos, decisiones ni alertas de vencimiento (SC-009) y que la entidad nunca envíe `RequiereInversion`: buscar con `Grep` `RequiereInversion` en `src/` (solo debe quedar el atributo y su lectura en `src/core/entities/Tarea.ts`, y no en `toListItem`), y buscar el patrón `Object.assign(new Tarea(), tarea` (y variantes con otro nombre de variable) en `src/webparts/`, que copiaría un objeto leído de la lista y lo reenviaría. **Criterio de terminado**: sin coincidencias indebidas; resultado anotado.

---

## Phase 11: Validación final

**Purpose**: build, lint, recorrido del quickstart y revisión visual.

- [ ] T076 Ejecutar `npm run build` completo y registrar el resultado (lint + `heft build`). **Criterio de terminado**: sin errores; si hay advertencias preexistentes, listarlas.

- [ ] T077 Ejecutar `npm run lint` por separado y registrar el resultado. **Criterio de terminado**: sin errores ni advertencias nuevas respecto de T001.

- [ ] T078 Recorrer con mocks (`npm start`, workbench local) los escenarios 1 a 35 de [quickstart.md](./quickstart.md) y anotar cuáles pasan y cuáles no, con el motivo. Los que dependen de SharePoint (guardado real, tope con datos reales, índices, permisos de borrado) quedan para T079. Medir con cronómetro, como referencia, M1 a M4 de "Mediciones de los criterios de éxito" del quickstart (SC-001, SC-002, SC-007 y SC-008). **Criterio de terminado**: informe con el resultado de cada escenario y los cuatro tiempos medidos.

- [ ] T079 Validar en el workbench hospedado del sitio de desarrollo los escenarios que dependen de SharePoint, escribiendo solo en las listas de desarrollo y con autorización explícita de la usuaria antes de crear, editar o borrar cualquier elemento. **Depende de P1 a P8** (más abajo). Cubrir: alta con su primera entrada, tope de 10 con datos reales (P8), "Registrar avance" con comentario ejecutivo (fecha y autor), reapertura, historial, "Mis tareas" por responsable, y que el deshacer de un alta fallida borra la tarea (P7). Los datos de prueba que se creen se borran al final solo con autorización. Medir con cronómetro, en el sitio, M1 a M4 de "Mediciones de los criterios de éxito" del quickstart (SC-001 menos de 2 minutos, SC-002 menos de 1 minuto, SC-007 menos de 30 segundos y SC-008 menos de 3 segundos), anotando cuántas tareas hay en las listas. **Criterio de terminado**: escenarios 8 a 15, 17, 22 a 29 y 31 a 35 registrados con su resultado, los cuatro tiempos medidos, y ningún elemento ajeno a la prueba modificado.

- [ ] T080 Revisión visual contra el prototipo: comparar `scr.tareas`, `scr.tarea`, `sideTar`, `tarUpd`, `histOpen`, `i_ind` e `i_tar` y anotar las diferencias de las aproximaciones A1 a A6 del plan (subsolapas, indicadores con `Field`, color de "Cargar tarea", campo Iniciativa sin buscador, historial con `ActivityItems`, "Sin prioridad") para decidir en la revisión. No corregir por iniciativa propia: informar. **Criterio de terminado**: lista de diferencias entregada a la usuaria.

---

## Preparativos a cargo de la usuaria

No son tareas de código y las **no ejecuta el agente**. Todo depende del acceso al sitio de SharePoint. Pasos en [quickstart.md](./quickstart.md#preparativos-en-sharepoint) y detalle de columnas en [data-model.md](./data-model.md#columnas-nuevas-y-cambios-en-sharepoint). Se hacen en el sitio de desarrollo y se repiten en cada sitio antes de desplegar. Con mocks no hacen falta.

- [ ] P1 Lista `Tarea`: crear la columna `QueHabilita` (varias líneas de texto, texto sin formato, no obligatoria) y verificar su nombre interno. *Bloquea: T079 (alta y lectura de "¿Qué habilita?").*
- [ ] P2 Lista `Tarea`: cambiar la columna `Area` para permitir varios valores (mismo nombre interno). Confirmar antes que no hay tareas cargadas que dependan del valor único y qué comportamiento tiene la relación al borrar un área. *Bloquea: T079 (áreas múltiples).*
- [ ] P3 Lista `Tarea`: crear `ComentarioEjecutivo` (varias líneas de texto, texto sin formato), `ComentarioEjecutivoFecha` (fecha y hora), `ComentarioEjecutivoAutor` (persona, un solo valor) y `FechaUltimaActualizacion` (fecha y hora); ninguna obligatoria. *Bloquea: T079 (comentario ejecutivo y "Actualizada").*
- [ ] P4 Lista `Tarea`: dejar `RequiereInversion` (sí/no) con valor por defecto "No", o no obligatoria. La aplicación no la envía ni la muestra. *Bloquea: T079 (alta; sin esto, el alta puede fallar).*
- [ ] P5 Indexar columnas: en `Tarea`, `Iniciativa`, `Responsable` y `Objetivo`; en `Avance tarea`, `Tarea`. *Bloquea: T079 (consultas filtradas con volumen).*
- [ ] P6 Verificar la lista `Avance tarea` (columnas `Tarea`, `Avance` sin decimales, `Estado` con las opciones de `EstadoTarea`, `Comentario`; `Comentario` y `Title` no obligatorios) y en `Tarea` las opciones de `Estado` y `Prioridad`. Si algo difiere, avisar antes de seguir. *Bloquea: T079 (historial).*
- [ ] P7 Verificar permisos: agregar y editar en `Tarea`, borrar en `Tarea` (solo para deshacer un alta fallida) y agregar en `Avance tarea`. *Bloquea: T079 (deshacer del alta).*
- [ ] P8 Cargar los datos de prueba del quickstart en las listas de desarrollo, con autorización: una iniciativa con 9 tareas no canceladas, otra con 10, una iniciativa Finalizada y otra Cancelada, y tareas en cada estado. *Bloquea: T079 (tope y estados reales).*

**Tareas de validación que dependen de estos preparativos**: **T079** (depende de P1 a P8). T078 y T080 no dependen de ellos (se hacen con mocks). Ninguna tarea de código (T003 a T075) depende de los preparativos.

---

## Dependencies & Execution Order

- **Phase 1** (T001, T002): sin dependencias. **Phase 2** (T003 a T025) bloquea todo. Dentro de ella: T003 antes de T004; T005 en paralelo con T003 y T004; **T003 antes de T006 y T007** (los datos del mock usan los campos nuevos de la entidad); T006 antes de T007, T008 y T009 (T009 después de T008); T010, T011 y T012 después de T006; T013 antes de T014; T015, T016 y T017 después de T013; T018 antes de T019, T020 y T021; T022, T023, T024 y T025 en paralelo con lo anterior.
- **Orden de las historias** (por dependencias dentro de las P1): US7 → US3 → US1 → US2 → US5, y después las P2: US4 → US6. Phase 3 (US7) depende de la Phase 2. Phase 4 (US3) depende de la Phase 2 y se verifica con US7. Phase 5 (US1) depende de las Phases 2 y 3 (el pie de la iniciativa) y se verifica con US7 y US3. Phase 6 (US2) depende de US3. Phase 7 (US5) depende de US1 (T059) y de la Phase 2. Phase 8 (US4) depende de US1 y US3. Phase 9 (US6) depende de US5.
- Las tareas que cambian un contrato (props obligatorias) incluyen en la misma tarea a todos sus llamadores, para que cada una termine con `npm run build` sin errores: T046, T052 y T065 (cada una también agrega su constante `CAN_*` en `ObjetivosVp.tsx`).
- Archivos que tocan varias tareas, que deben hacerse en orden y no en paralelo: `tareaUtils.ts` (T018, T019, T020, T021, T068); `TareaMock.ts` (T006, T007, T008, T009); `AvanceTareaMock.ts` (T013, T014); `TareasTable.tsx` (T027, T056); `TareaForm.tsx` (T041, T042, T043, T044, T063); `TareaFormPanel.tsx` (T044, T045, T063, T064); `TareaAvancePanel.tsx` (T049, T050, T051); `TareaDetalle.tsx` (T036, T052, T065); `IniciativaDetalle.tsx` (T030, T046); `TareasBandeja.tsx` (T057, T058, T059, T069); `ObjetivosVp.tsx` (T037, T046, T052, T060, T065); `PalancaBreadcrumb.tsx` (T032).
- **Phase 10** depende de todas las historias que se vayan a entregar; **Phase 11** es la última. T079 depende además de P1 a P8.

### Parallel Opportunities

- Phase 2: T005 con T003 y T004; T010, T011 y T012 juntas; T015, T016 y T017 juntas; T006 (después de T003) con T013 y con T018 y T022; T023, T024 y T025 juntas.
- US7: T026, T027 y T028 en paralelo (archivos distintos).
- US3: T032, T033, T034 y T035 en paralelo.
- US1: T039 y T040 en paralelo.
- US5: T055 y T061 en paralelo con el resto de su fase.
- US6: T067 con T068 (T068 también tiene la marca `[P]`).
- Phase 10: T073 y T074 en paralelo.
- Los Preparativos P1 a P8 los hace la usuaria en paralelo a todo el código.

## Implementation Strategy

- **MVP**: Phase 1 + Phase 2 + US7 + US3 + US1 + US2: las tareas se cargan desde la iniciativa, se ven en ella, se lee su detalle e historial y se registra su avance. Es el camino de las historias P1 sin la bandeja.
- **Entrega incremental**: después, US5 (bandeja y acceso de la home), y las P2: US4 (edición) y US6 (búsqueda y filtros). Cada historia se puede demostrar sola con los mocks.
- Antes de cualquier prueba contra SharePoint, la usuaria debe resolver P1 a P8; T079 no se hace sin ellos.

