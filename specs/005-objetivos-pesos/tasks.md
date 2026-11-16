---

description: "Tareas de implementación de los ajustes de objetivos de la reunión 6 (pesos por departamento y por VP)"
---

# Tasks: Ajustes de objetivos de la reunión 6 (pesos por departamento y por VP)

**Input**: `specs/005-objetivos-pesos/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**:

- la feature 003 completa y compilando (`npm run build` sin errores);
- `npm ci` ejecutado;
- prototipo `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`;
- `docs/design-system-catalog.md`;
- en el sitio de desarrollo, la columna `PesoVP` creada por la usuaria en la lista `Objetivo` (plan, P1).

**Tests**: no se piden. El repo no tiene runner de pruebas. Se valida con `npm run build`, con los escenarios de `quickstart.md` y comparando con el prototipo.

**Organization**: las tareas se agrupan por historia de usuario. Cada tarea indica el archivo exacto, los componentes del Design System (DS), su **Referencia** en el prototipo y su criterio de terminado.

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: historia de `spec.md`:
  - US1: cargar los dos pesos;
  - US2: ver los dos pesos;
  - US3: cantidad de años de un objetivo plurianual.

## Reglas que aplican a TODAS las tareas

- **Validación (constitución V)**: cada tarea termina con `npm run build` sin errores, lo que incluye lint y tipos.
- **Referencia al prototipo (constitución II)**:
  - formulario: el bloque `<sc-if value="{{scr.form}}">`, rama `fm.isObj`, y el panel lateral con los campos `soVp`…`soComp`;
  - detalle: `<sc-if value="{{scr.objetivo}}">`;
  - reglas: `fieldMsgs` (validación de `pesoVp` y `anios`) y el armado de `od.esVpTxt` y `od.dur`.
  - **No reproducir**:
    - la ayuda "Definido de antemano";
    - la etiqueta "¿Es objetivo del VP?" (va "¿Es objetivo de la VP RRII?");
    - el texto "peso para el VP" del detalle (va "peso en la VP");
    - avance, "Ubicación en la estrategia", iniciativas, área ni responsable por persona.
- **Textos**: siempre desde `import * as strings from 'ObjetivosVpWebPartStrings';`. Las plantillas con `{0}` y `{1}` se completan con `Utils.replaceAll`. Ningún texto visible escrito en el código. Cada clave se agrega o cambia a la vez en `loc/mystrings.d.ts` y `loc/en-us.js`, el único archivo de idioma.
- **`src/core/ui` es de solo lectura.** Imports por capa, nunca del índice de `core` ni de `core/ui`, con la misma profundidad de rutas que ya usa cada archivo.
- **TypeScript estricto**: sin `any` nuevos, sin comentarios de código y sin literales mágicos (los números van a constantes locales con nombre al inicio del archivo).
- **Hooks**: no se agregan `useEffect` ni `useMemo`. Los valores que dependen de otros (visibilidad, opciones, errores) se calculan durante el render.
- **Datos de SharePoint**:
  - no se renombran columnas ni se crean columnas desde código;
  - solo se escribe en la lista `Objetivo` del sitio de desarrollo: en T011, con la autorización del 2026-11-16, y en T013, en los escenarios del quickstart;
  - no se versionan URLs del sitio.
- **No modificar** `spec.md` ni `plan.md`. Si una tarea no puede cumplirse como está escrita, detenerse y explicar el motivo. No editar archivos `*.module.scss.ts`.

## Path Conventions

Raíz del webpart: `src/webparts/objetivosVp/`. Se modifican tres archivos de componentes:

- `components/Objetivo/ObjetivoForm/ObjetivoForm.tsx`;
- `components/Objetivo/ObjetivoDetalle/ObjetivoInfo/ObjetivoInfo.tsx`;
- `components/Objetivo/ObjetivosTable/ObjetivosTable.tsx`.

En `core`, se modifican `src/core/entities/Objetivo.ts` y `src/core/api/Objetivo/{ObjetivoDataSource.ts, ObjetivoMock.ts}`. No se crean archivos de código.

---

## Phase 1: Setup

- [ ] T001 Verificar las precondiciones, sin código. Registrar el resultado en el mensaje de la tarea, sin tocar archivos:
  1. `npm run build` pasa antes de empezar.
  2. En el sitio de desarrollo, la lista `Objetivo` tiene la columna con nombre interno exactamente `PesoVP`: en su configuración, la URL termina en `Field=PesoVP`. Es de tipo Número, con mínimo 1, máximo 100 y no obligatoria.
  3. `CantidadAnios` es de tipo Número. La usuaria ya lo confirmó: solo se registra.

  Si la columna no existe o su nombre interno es distinto, **detenerse** e informarlo. T002 a T010 se pueden avanzar con los mocks, pero T011 y la parte de SharePoint de T013 no.

  **Criterio de terminado**: el build da verde y los puntos 2 y 3 quedan confirmados o informados.

---

## Phase 2: Foundational (bloquea todas las historias)

- [ ] T002 Modificar `src/core/entities/Objetivo.ts` (plan, D1 y D3; [contracts/ui-contracts.md](./contracts/ui-contracts.md), §1):
  - En `mapItem`, agregar `this.PesoVP = item.PesoVP ?? undefined;` después de `this.Peso`.
  - En `toListItem`, agregar `PesoVP: this.PesoVP,` después de `Peso`. `CantidadAnios: this.CantidadAnios` ya existe y no cambia.
  - Declarar `public PesoVP?: number | null | undefined;` después de `Peso`, y cambiar el tipo de `CantidadAnios` a `number | null | undefined`.
  - Lo demás no cambia: `null` se envía y borra la columna, `undefined` se omite.

  **Criterio de terminado**: `npm run build` sin errores.

- [ ] T003 [P] Modificar `src/core/api/Objetivo/ObjetivoDataSource.ts`: agregar `'PesoVP'` en `selectProperties`, después de `'Peso'`. No cambiar nada más.

  **Criterio de terminado**: `npm run build` sin errores.

- [ ] T004 Modificar `src/core/api/Objetivo/ObjetivoMock.ts` (plan, D10; depende de T002):
  - `createRrii` suma dos parámetros al final, `pesoVp: number | undefined` y `cantidadAnios: number | undefined`, que se asignan como `PesoVP` y `CantidadAnios` en el objeto que recibe `new Objetivo({...})`.
  - `createOtraVp` suma `EsDelVp: false` al objeto.
  - Datos (los demás valores no cambian):

    | Id | Cambio |
    |---|---|
    | 1 | `pesoVp` 15. Ya está marcado, con peso 20. |
    | 2 | `cantidadAnios` 2. Ya es Plurianual, de 2026 a 2027. |
    | 3 | `pesoVp` `undefined`. Queda marcado sin peso en la VP, como un dato anterior a esta feature. |
    | 4 | `undefined` y `undefined`. |

  - Los parámetros que la tabla no indica van en `undefined`.
  - Usar constantes locales con nombre para 15 y 2.

  **Criterio de terminado**: `npm run build` sin errores.

- [ ] T005 [P] Modificar `src/webparts/objetivosVp/loc/mystrings.d.ts` y `src/webparts/objetivosVp/loc/en-us.js` (plan, D9). Para cada clave nueva, declararla `string` en `mystrings.d.ts`, junto a las claves `Objetivo*` que ya existen.

  Claves que cambian:

  | Clave | Valor nuevo |
  |---|---|
  | `ObjetivoFormVpObjective` | ¿Es objetivo de la VP RRII? |
  | `ObjetivoFieldVpObjective` | ¿Es objetivo de la VP RRII? |
  | `ObjetivoFormWeight` | Peso del objetivo en el Departamento (%) |
  | `ObjetivosFilterVp` | Objetivos de la VP RRII |
  | `ObjetivosVpEmpty` | No hay objetivos de la VP RRII cargados. |

  Claves nuevas:

  | Clave nueva | Valor |
  |---|---|
  | `ObjetivoFormVpWeight` | Peso del objetivo para el VP (%) |
  | `ObjetivoFormVpWeightPlaceholder` | Ej. 10 |
  | `ObjetivoVpWeightRange` | Ingresá un valor entre 1 y 100. |
  | `ObjetivoFormYears` | Cantidad de años |
  | `ObjetivoFormDepartmentCollab` | Departamento que colabora |
  | `ObjetivoVpObjectiveYes` | Sí · peso en la VP: {0} |
  | `ObjetivoDurationYears` | {0} · {1} años |
  | `ObjetivoColumnVpWeight` | Peso VP |
  | `ObjetivoNoValue` | — |

  **Criterio de terminado**: las claves están en los dos archivos y `npm run build` sin errores.

**Checkpoint**: la entidad, el datasource, el mock y los textos están listos. El renombre de la pestaña y de su estado vacío ya se ve en la sección de palancas.

---

## Phase 3: User Story 1 - Cargar los dos pesos de un objetivo de la VP RRII (Priority: P1) 🎯 MVP

**Goal**: el formulario carga el peso en el departamento y, si el objetivo está marcado, el peso en la VP. Además, guarda la marca solo para la VP RRII.

**Independent Test**: quickstart, escenarios 1 a 10.

- [ ] T006 [US1] Modificar `src/webparts/objetivosVp/components/Objetivo/ObjetivoForm/ObjetivoForm.tsx` (spec FR-001 a FR-006, FR-008 a FR-010; plan D2, D4 y D5). DS: `Switch`, `SpinButton` y `Dropdown`, que ya se importan.

  1. **Constantes**: agregar `VP_WEIGHT_MIN = 1`. `WEIGHT_MAX` se reutiliza como máximo de los dos pesos.
  2. **Estado**: `const [pesoVp, setPesoVp] = React.useState<string>(objetivo?.PesoVP === undefined || objetivo?.PesoVP === null ? '' : String(objetivo.PesoVP));`. El estado `esDeVp` que ya existe no cambia.
  3. **Steppers**: generalizar `stepWeight` para que reciba el setter y el mínimo, y usarlo para los dos pesos:
     - peso en el departamento: `setPeso`, `WEIGHT_MIN`;
     - peso en la VP: `setPesoVp`, `VP_WEIGHT_MIN`.

     Sin duplicar la función.
  4. **Validación** (se calcula en el render, igual que `weightIssue`):
     - `pesoVpValue = parseWeight(pesoVp)`;
     - `vpWeightIssue`: si `pesoVp.trim() === ''`, `strings.RequiredField`; si `pesoVpValue` es `undefined`, menor que `VP_WEIGHT_MIN` o mayor que `WEIGHT_MAX`, `strings.ObjetivoVpWeightRange`; si no, `undefined`.
     - En `issues`, agregar `pesoVp: isRrii && esDeVp ? vpWeightIssue : undefined`.
  5. **Primera sección**:
     - Quitar el `Switch` del `gridPanel` de VP, Departamento y Gerencia.
     - La etiqueta del `Dropdown` de Departamento pasa a ser `isRrii || vpId === '' ? strings.ObjetivoFormDepartment : strings.ObjetivoFormDepartmentCollab`.
  6. **Sección `ObjetivoFormPlanningSection`**: dentro del `gridPanel` que contiene Palanca, Duración y el `SpinButton` del peso, después de ese `SpinButton`, en este orden:
     - el `Switch` que estaba en la primera sección, con las mismas props (`label={strings.ObjetivoFormVpObjective}`, `labelPosition="top"`, `textOff`, `active={esDeVp}`, `onChange={setEsDeVp}`);
     - si `esDeVp`, un `SpinButton` con: `className={invalid(issues.pesoVp, styles.weight)}`, `label={strings.ObjetivoFormVpWeight}`, `placeholder={strings.ObjetivoFormVpWeightPlaceholder}`, `required`, `min={VP_WEIGHT_MIN}`, `max={WEIGHT_MAX}`, `value={pesoVp}`, `errorMessage={shown(issues.pesoVp)}`, los steppers del peso en la VP y el mismo `onChange` (`HTMLInputElement`) que el peso en el departamento, con `setPesoVp`.
  7. **`save`**:
     - Reemplazar `toSave.EsDeVp = esDeVp;` por `toSave.EsDeVp = isRrii && esDeVp;`.
     - Agregar `toSave.PesoVP = isRrii && esDeVp ? pesoVpValue : null;`, fuera del `if (isRrii)`, para que la otra VP también reciba `null`.
     - Lo demás no cambia.
  8. No agregar el texto de ayuda "Definido de antemano".

  **Referencia**: `scr.form`, bloque `fm.isRrii`: `oPeso`/`soPeso`, `.tglF` con `oEvL`/`soEvL`, `fm.esVpSi` con `oPvp`/`soPvp`, y `fm.dirLbl`.

  **Criterio de terminado**: `npm run build` sin errores. Con los mocks:
  - el interruptor se ve solo con la VP RRII, después del peso;
  - al activarlo aparece el peso en la VP;
  - 0 y 101 dan "Ingresá un valor entre 1 y 100.";
  - al desactivarlo y guardar, el objetivo queda sin peso en la VP.

**Checkpoint**: US1 funciona con los mocks.

---

## Phase 4: User Story 2 - Ver los dos pesos (Priority: P1)

**Goal**: el detalle muestra la marca con el peso en la VP, y la pestaña "Objetivos de la VP RRII" muestra "Peso" y "Peso VP".

**Independent Test**: quickstart, escenarios 6, 14 y 15.

- [ ] T007 [P] [US2] Modificar `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoInfo/ObjetivoInfo.tsx` (spec FR-011 y FR-012; plan D7). DS: `Field`, que ya existe.
  - Calcular en el render:
    - `const pesoVpText = objetivo.PesoVP === undefined || objetivo.PesoVP === null ? strings.ObjetivoNoValue : `${objetivo.PesoVP} %`;`
    - `const vpObjectiveText = objetivo.EsDeVp ? Utils.replaceAll(strings.ObjetivoVpObjectiveYes, '{0}', pesoVpText) : strings.No;`
  - El `Field` de `strings.ObjetivoFieldVpObjective` pasa a usar `value={vpObjectiveText}`. Sigue mostrándose solo si `isRrii`.
  - Importar `Utils` desde `…/core/utils`, con la profundidad del archivo.
  - "Peso en el departamento" (`ObjetivoFieldWeight`) no cambia.

  **Referencia**: `scr.objetivo`, `od.esVpTxt`.

  **Criterio de terminado**: `npm run build` sin errores. Con los mocks:
  - OBJ-01 muestra "Sí · peso en la VP: 15 %";
  - OBJ-03 muestra "Sí · peso en la VP: —";
  - OBJ-02 muestra "No".

- [ ] T008 [P] [US2] Modificar `src/webparts/objetivosVp/components/Objetivo/ObjetivosTable/ObjetivosTable.tsx` (spec FR-014; plan D8).
  - `ObjetivoRow` suma `pesoVp: string`, con este valor: `objetivo.PesoVP === undefined || objetivo.PesoVP === null ? strings.ObjetivoNoValue : `${objetivo.PesoVP}%``.
  - Nueva columna `vpWeightColumn`: `{ key: 'pesoVp', header: strings.ObjetivoColumnVpWeight, width: fixedWidths ? WEIGHT_WIDTH : undefined }`.
  - En la rama `delVp` de `columns`, insertarla después de `weightColumn`.
  - Las variantes `palanca` y `otrasVp` no cambian.

  **Referencia**: bloque `<sc-if value="{{vpo.showMine}}">`, fila `.c-vpo` (columna "Peso VP").

  **Criterio de terminado**: `npm run build` sin errores. Con los mocks:
  - la pestaña "Objetivos de la VP RRII" muestra "Peso" y "Peso VP" (15% y — en OBJ-01 y OBJ-03);
  - las listas por palanca muestran solo "Peso".

**Checkpoint**: US1 y US2 funcionan con los mocks.

---

## Phase 5: User Story 3 - Cantidad de años de un objetivo plurianual (Priority: P2)

**Goal**: el formulario pide la cantidad de años para la duración Plurianual y el detalle la muestra.

**Independent Test**: quickstart, escenarios 11 a 13.

- [ ] T009 [US3] Modificar `src/webparts/objetivosVp/components/Objetivo/ObjetivoForm/ObjetivoForm.tsx` (spec FR-007; plan D2, D4, D5 y D6; depende de T006). DS: `Dropdown`.
  1. **Constante local**: `ANIOS_PLURIANUAL = [2, 3, 4, 5]`.
  2. **Estado**: `cantidadAnios: string`. El valor inicial es `String(objetivo.CantidadAnios)` si ese número está en `ANIOS_PLURIANUAL`, y `''` en cualquier otro caso.
  3. **Opciones**: `aniosOptions = ANIOS_PLURIANUAL.map((n) => ({ key: String(n), text: String(n) }))`.
  4. **Validación**: `isPlurianual = duracion === Duracion.Plurianual`. En `issues`, agregar `cantidadAnios: isRrii && isPlurianual && cantidadAnios === '' ? strings.RequiredField : undefined`.
  5. **Render**: en el `gridPanel` de planificación, inmediatamente después del `Dropdown` de Duración y solo si `isPlurianual`, un `Dropdown` con: `label={strings.ObjetivoFormYears}`, `required`, `placeholder={strings.ObjetivoFormSelect}`, `options={aniosOptions}`, `value={cantidadAnios}`, `className={invalid(issues.cantidadAnios)}`, `errorMessage={shown(issues.cantidadAnios)}`, `onChange={(value) => setCantidadAnios(toKey(value))}`.
  6. **`save`**: agregar `toSave.CantidadAnios = isRrii && isPlurianual ? Number(cantidadAnios) : null;`, fuera del `if (isRrii)`.

  **Referencia**: `scr.form`, `fm.isPluri` con `oAn`/`soAn`.

  **Criterio de terminado**: `npm run build` sin errores. Con los mocks:
  - con Plurianual aparece "Cantidad de años" (2 a 5) después de Duración y es obligatoria;
  - al cambiar a Anual se oculta y el objetivo se guarda sin cantidad.

- [ ] T010 [US3] Modificar `src/webparts/objetivosVp/components/Objetivo/ObjetivoDetalle/ObjetivoInfo/ObjetivoInfo.tsx` (spec FR-013; plan D7; depende de T007, porque es el mismo archivo).
  - Calcular `durationText`:
    - si `objetivo.Duracion === Duracion.Plurianual` y `CantidadAnios` tiene valor (ni `undefined` ni `null`): `Utils.replaceAll(Utils.replaceAll(strings.ObjetivoDurationYears, '{0}', objetivo.Duracion), '{1}', String(objetivo.CantidadAnios))`;
    - si no: `objetivo.Duracion ?? ''`.
  - Usarlo en el `Field` de `strings.ObjetivoFieldDuration`.
  - Importar `Duracion` desde `…/core/utils/Constants`.

  **Referencia**: `scr.objetivo`, `od.dur`.

  **Criterio de terminado**: `npm run build` sin errores. Con los mocks, OBJ-02 muestra "Plurianual · 2 años" y OBJ-01, "Anual".

**Checkpoint**: las tres historias funcionan con los mocks.

---

## Phase 6: Datos, revisión y validación

- [ ] T011 Corregir en la lista `Objetivo` del **sitio de desarrollo** los objetivos de otras VP que tienen la marca guardada (plan, P3; research R6). Depende de T001 (la columna `PesoVP` tiene que existir).
  - Autorización de la usuaria del 2026-11-16, limitada a lo siguiente:
    - solo esa lista y solo en ese sitio;
    - solo los elementos con VP distinta de "VP RRII" y `EsDelVp` = Sí;
    - solo las columnas `EsDelVp` (pasa a No) y `PesoVP` (queda vacía).
  - Procedimiento: [quickstart.md](./quickstart.md), "Corrección de datos de otras VP", pasos 1 a 5, a mano desde la vista de la lista. Sin scripts, sin código y sin dependencias nuevas.
  - Si quien ejecuta la tarea no tiene acceso al sitio, la hace la usuaria y se registra el resultado que ella informe.

  **Criterio de terminado**:
  - el filtro del paso 1 no devuelve elementos;
  - el mensaje de la tarea informa **cuántos objetivos se corrigieron y sus ID** (0 si no había ninguno);
  - ningún otro elemento ni columna se modificó;
  - `npm run build` sin errores.

- [ ] T012 Revisar las reglas en los archivos que se modificaron (los de T002 a T010):
  - sin hexadecimales ni px de espaciado o tipografía;
  - sin `any` nuevos y sin comentarios;
  - sin textos visibles escritos en el código (incluido "—", que sale de `strings.ObjetivoNoValue`);
  - sin literales mágicos (1, 2, 3, 4, 5 van en las constantes de T006 y T009);
  - claves de `loc/` sincronizadas entre `mystrings.d.ts` y `en-us.js`, sin claves sin uso (búsqueda con Grep);
  - el `Switch` aparece una sola vez en `ObjetivoForm.tsx`.

  Corregir lo que aparezca en el archivo de la tarea que lo introdujo.

  **Criterio de terminado**: la búsqueda no encuentra coincidencias y `npm run build` sin errores.

- [ ] T013 Validar con [quickstart.md](./quickstart.md):
  - escenarios 1 a 17, primero con los mocks y después contra la lista de desarrollo (con `PesoVP` creada y T011 hecha);
  - con los mocks, los escenarios 7, 10 y 13 se verifican solo en pantalla; lo que se guarda en la lista (`EsDelVp`, `Peso`, `PesoVP`, `CantidadAnios`) se controla en el sitio de desarrollo;
  - comparación lado a lado con `scr.form` y `scr.objetivo` (SC-006);
  - en la lista de desarrollo se escriben solo objetivos de prueba de estos escenarios.

  Si algo falla, corregirlo en el archivo de la tarea que lo implementa. Informar los escenarios que no se pudieron ejecutar y por qué.

  **Criterio de terminado**: escenarios en verde o informados, y `npm run build` sin errores.

---

## Dependencies & Execution Order

| Tarea | Depende de |
|---|---|
| T001 | — |
| T002 | T001 (build base) |
| T003, T005 | T001 (en paralelo con T002) |
| T004 | T002 |
| T006 | T002, T005 |
| T007, T008 | T002, T005 (en paralelo entre sí y con T006) |
| T009 | T006 (mismo archivo) |
| T010 | T007 (mismo archivo) |
| T011 | T001 (columna `PesoVP` creada). Se puede hacer en cualquier momento después. |
| T012 | T002 a T010 |
| T013 | T004, T011, T012 |

**MVP**: Phases 1 a 3 (US1) más T007. Con eso se cargan los dos pesos y se ven en el detalle.

### Parallel Example

```text
Después de T002:  T003 · T004 · T005
Después de T005:  T006 · T007 · T008
Después de T006/T007:  T009 · T010
```
