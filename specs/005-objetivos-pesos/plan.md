# Implementation Plan: Ajustes de objetivos de la reunión 6 (pesos por departamento y por VP)

**Branch**: `005-objetivos-pesos` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-objetivos-pesos/spec.md`. Modifica la feature [003-objetivos](../003-objetivos/plan.md), ya implementada.

## Summary

Separar el peso del objetivo en dos: el peso en el departamento, que usa la columna `Peso` que ya existe, y el peso en la VP, que necesita una columna nueva y solo aplica a los objetivos marcados como "¿Es objetivo de la VP RRII?". Además, agregar "Cantidad de años" para la duración Plurianual, alinear el formulario y el detalle con el prototipo v5, renombrar la pestaña "Objetivos del VP" y sumarle la columna "Peso VP".

Enfoque técnico:

- **Datos**: se agrega `PesoVP` a la entidad `Objetivo`, a su datasource y al mock. `CantidadAnios` ya está en la entidad y en el datasource: solo se empieza a usar. La usuaria aprobó la columna nueva y la crea en el sitio de desarrollo (P1). Además, se corrigen en la lista de desarrollo los objetivos de otras VP que quedaron marcados (P3).
- **Formulario**: los cambios están en `ObjetivoForm.tsx`. El interruptor pasa a la sección de planificación. Se agregan dos campos condicionales: el peso en la VP y la cantidad de años. Cambian las reglas de validación y de guardado.
- **Detalle**: en `ObjetivoInfo.tsx` cambian la etiqueta de la marca, el texto de la marca con el peso en la VP y la duración con la cantidad de años.
- **Lista**: `ObjetivosTable.tsx` suma la columna "Peso VP" solo en la variante `delVp`.
- **Textos**: se cambian y se agregan claves en `loc/`.

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, con la configuración heredada de `@microsoft/spfx-web-build-rig`, igual que la 003.

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`, Fluent UI v8, PnPjs `@pnp/sp 4.18.0`, `react-router-dom 6.30.6`. Esta feature no agrega dependencias.

**Storage**: lista `Objetivo` de SharePoint (`Lista.Objetivo`). Se usan las columnas que ya existen `Peso`, `EsDelVp` y `CantidadAnios`, más una columna nueva `PesoVP`, aprobada el 2026-11-16 (P1). El detalle está en [data-model.md](./data-model.md).

**Testing**: el proyecto no tiene runner de pruebas. Se valida con `npm run build` (principio V), con los escenarios de [quickstart.md](./quickstart.md) en el workbench hospedado del sitio de desarrollo y comparando con el prototipo.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft).

**Performance Goals**: los mismos de la 003. No se agregan consultas: `PesoVP` viaja en el mismo `select`.

**Constraints**: `src/core/ui` es de solo lectura. No se usan colores, tipografías ni espaciados fuera del Design System. Los textos van en español (Argentina), con `loc/`. No se renombran columnas ni datos de SharePoint. No se crean columnas sin autorización.

**Scale/Scope**: 2 archivos de `core` (`Objetivo.ts`, `ObjetivoDataSource.ts`), 1 mock, 3 componentes (`ObjetivoForm.tsx`, `ObjetivoInfo.tsx`, `ObjetivosTable.tsx`) y `loc/` (2 archivos). No hay pantallas ni rutas nuevas.

## Hallazgos del repo

| # | Hallazgo | Consecuencia |
|---|---|---|
| H1 | `Objetivo.ts`, `ObjetivoDataSource.ts` y la lista ya tienen `CantidadAnios`. La 003 lo dejó sin usar (R8 de la 003). | "Cantidad de años" no necesita una columna nueva. La columna es de tipo Número (P2, confirmado). |
| H2 | En `ObjetivoForm.tsx`, el `Switch` está en la primera sección, junto a Gerencia, y se muestra para cualquier VP. `toSave.EsDeVp = esDeVp` se asigna fuera del `if (isRrii)`. | Es un desvío de la 003 (FR-004). Se corrige con FR-002 y FR-009: el `Switch` va dentro de la planificación y la marca se guarda solo para la VP RRII. |
| H3 | `toListItem` envía `undefined` en los campos que no aplican. PnPjs serializa con `JSON.stringify`, que omite esos campos, así que al **editar** no se borra el valor anterior. | Al editar, desactivar la marca o dejar de elegir Plurianual no borraría `PesoVP` ni `CantidadAnios`. Por eso se envía `null` explícito (D3). |
| H4 | La sección de palancas tiene tres pestañas (`todos`, `delVp`, `otrasVp`) en `Palancas.tsx`. `ObjetivosTable` tiene las variantes `palanca`, `delVp` y `otrasVp`. La pestaña `delVp` ya filtra por `isVpRrii`. | La columna "Peso VP" se agrega solo en la variante `delVp`. Los objetivos de otras VP que quedaron marcados por H2 no aparecen en esa pestaña. |
| H5 | Las etiquetas "Peso en el departamento", "¿Es objetivo del VP?" y "Peso del objetivo en el departamento (%)" ya están en `en-us.js`. Es el único archivo de idioma. | Se cambian solo las claves que la spec modifica. No se agrega ningún idioma. |
| H6 | Las tablas muestran el peso como `${Peso}%`, sin espacio, y el detalle como `${Peso} %`, con espacio. | Se respeta el formato de cada lugar: "Peso VP" usa el de la tabla y el detalle usa el del detalle. |

## Constitution Check

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | No cambian ni el stack ni las dependencias. |
| II. La interfaz no se inventa | ✅ Cumple, con los desvíos que aprobó la spec | El formulario y el detalle salen de `scr.form` (rama `fm.isObj` y panel `so*`) y de `scr.objetivo`. Desvíos aprobados en la spec (Clarifications): la etiqueta "¿Es objetivo de la VP RRII?", el peso en el departamento obligatorio y sin la ayuda "Definido de antemano", el texto "peso en la VP" y la columna "Peso VP" dentro de la pestaña que ya existe. Todo se arma con piezas que ya usa la 003. |
| II. `core/ui` de solo lectura | ✅ Cumple | No se modifica el Design System. |
| II. Estructura de pantalla | ✅ Cumple | No hay carpetas nuevas. |
| II. Textos en español (AR) | ✅ Cumple | Se cambian y se agregan claves en `loc/mystrings.d.ts` y `loc/en-us.js`. |
| III. Datos desacoplados | ✅ Cumple | `PesoVP` se agrega en `core/entities` y `core/api`, y el mock también lo carga. |
| IV. Simplicidad y cambios acotados | ✅ Cumple | No hay archivos, hooks ni capas nuevas. Se tocan solo los archivos que nombra la spec. |
| V. Validación | ✅ Cumple | Cada tarea termina con `npm run build`. |

**Re-check post-diseño**: no hay cambios. P1 y P2 quedaron resueltos. P3 es una corrección de datos autorizada por la usuaria, solo en el sitio de desarrollo.

## Decisiones de datos

- **P1. Columna nueva para el peso en la VP (aprobada el 2026-11-16).** Columna de la lista `Objetivo`:
  - nombre interno `PesoVP` (con "VP" en mayúsculas, exactamente así) y nombre visible "Peso en la VP";
  - tipo Número, mínimo 1, máximo 100, no obligatoria en la lista, con la misma cantidad de decimales que la columna `Peso`.
  - La obligatoriedad la controla el formulario, porque depende de la marca.
  - En el sitio de desarrollo la crea la usuaria. Para los demás sitios, los pasos están en [quickstart.md](./quickstart.md), "Creación de la columna PesoVP". El agente no crea columnas.
  - Hasta que exista, con los mocks se puede construir y validar todo, pero en SharePoint `select` y `update` fallan.
- **P2. Tipo de `CantidadAnios`.** La usuaria confirmó que es de tipo Número. No hay que cambiar nada.
- **P3. Corrección de los objetivos de otras VP que quedaron marcados (autorizada el 2026-11-16, solo en el sitio de desarrollo).**
  - Alcance: en la lista `Objetivo`, los elementos cuya VP no es "VP RRII" y que tienen `EsDelVp` = Sí.
  - Corrección: `EsDelVp` pasa a No y `PesoVP` queda vacío.
  - Se informa cuántos elementos se corrigieron, con sus ID. No se tocan otras columnas, otros elementos, otras listas ni otros sitios.
  - Se hace a mano, desde la vista de la lista (filtro y edición en cuadrícula), sin scripts ni dependencias nuevas.
  - Se hace después de crear `PesoVP` y antes de validar con el quickstart.

## Interfaz y Design System

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html`:

- formulario: `scr.form`, rama `fm.isObj`, y panel lateral con campos `soVp`…`soComp`;
- detalle: `scr.objetivo`, secciones "Información del objetivo" y "Planificación";
- reglas del prototipo: `fieldMsgs` (validación de `pesoVp` y `anios`), y armado de `od.esVpTxt` y `od.dur`.

**Design System**: `src/core/ui`, según `docs/design-system-catalog.md`.

**Estructura de la pantalla**: no cambia. Archivos que se tocan:

- `components/Objetivo/ObjetivoForm/ObjetivoForm.tsx`, que se renderiza dentro del `Panel` de `ObjetivoFormPanel.tsx`;
- `components/Objetivo/ObjetivoDetalle/ObjetivoInfo/ObjetivoInfo.tsx`;
- `components/Objetivo/ObjetivosTable/ObjetivosTable.tsx`.

### Mapeo elemento → componente

**Formulario, sección "Planificación (VP RRII)"**, en el orden de FR-001:

| Elemento | Componente | Observaciones |
|---|---|---|
| Palanca | `Dropdown` (ya existe) | Sin cambios. |
| Duración | `Dropdown` (ya existe) | Al cambiar a otra duración que no sea Plurianual, el valor de "Cantidad de años" se descarta al guardar. |
| Cantidad de años | `Dropdown` | `required`, `placeholder` "Seleccionar", opciones `2`, `3`, `4`, `5`. Solo si `duracion === Plurianual`. Error en línea con `errorMessage`. |
| Peso del objetivo en el Departamento (%) | `SpinButton` (ya existe) | Cambia el texto de la etiqueta. Sigue con `required`, `min=0`, `max=100` y placeholder "Ej. 15". |
| ¿Es objetivo de la VP RRII? | `Switch` (ya existe) | Se mueve de la primera sección a esta, después del peso. Mantiene `labelPosition="top"` y `textOff`. Solo para la VP RRII. |
| Peso del objetivo para el VP (%) | `SpinButton` | `required`, `min=1`, `max=100`, placeholder "Ej. 10", con los mismos steppers que el peso en el departamento. Solo si el interruptor está activo. Error de rango: "Ingresá un valor entre 1 y 100." |
| Fecha de inicio y Fecha de compromiso | `Picker` (ya existe) | Sin cambios. |

**Formulario, primera sección**:

| Elemento | Componente | Observaciones |
|---|---|---|
| Departamento | `Dropdown` (ya existe) | La etiqueta es "Departamento" para la VP RRII o si todavía no se eligió VP, y "Departamento que colabora" para otra VP (prototipo `fm.dirLbl`). |
| `Switch` | — | Sale de esta sección. La grilla `gridPanel` queda con VP, Departamento y Gerencia. |

**Detalle (`ObjetivoInfo`)**:

| Elemento | Componente | Observaciones |
|---|---|---|
| "¿Es objetivo de la VP RRII?" | `Field` (ya existe) | Muestra "Sí · peso en la VP: {peso} %", o "Sí · peso en la VP: —" si no hay peso, o "No". |
| Duración | `Field` (ya existe) | Muestra "Plurianual · {N} años" si hay cantidad de años. Si no, solo la duración. |
| Peso en el departamento | `Field` (ya existe) | Sin cambios. |

**Lista de la pestaña "Objetivos de la VP RRII" (`ObjetivosTable`, variante `delVp`)**:

| Elemento | Componente | Observaciones |
|---|---|---|
| Columna "Peso VP" | `ITableColumn` de `Table` (ya existe) | Va después de "Peso", con el mismo ancho fijo (`WEIGHT_WIDTH`). Muestra `${PesoVP}%`, o "—" si no hay peso. |
| Pestaña | `Tabs` (ya existe) | Solo cambia el texto (`ObjetivosFilterVp`). |

### Elementos sin componente en el Design System

Ninguno.

**Imágenes e íconos**: ninguno nuevo.

## Decisiones

**D1. Columna y propiedad del peso en la VP.** En la entidad, la propiedad se llama `PesoVP` (`number | null | undefined`). Se lee de `item.PesoVP` y se escribe como `PesoVP`. Se agrega `'PesoVP'` a `selectProperties`. `Peso` conserva su nombre y pasa a representar el peso en el departamento (spec, Assumptions: no se renombran columnas).

**D2. Reglas de guardado en `ObjetivoForm.save`.**

- VP RRII:
  - `EsDeVp = esDeVp`;
  - `PesoVP` = el valor numérico si `esDeVp`, y si no, `null`;
  - `CantidadAnios` = el número si `duracion === Plurianual`, y si no, `null`;
  - el resto, como en la 003.
- Otra VP:
  - `EsDeVp = false`, `PesoVP = null`, `CantidadAnios = null`;
  - el resto, como en la 003.

  Esto corrige H2 y cumple FR-004, FR-007 y FR-009.

**D3. Borrado explícito con `null`.** `Objetivo.toListItem` envía `PesoVP` y `CantidadAnios` tal como están en la entidad, y `null` se serializa y borra el valor de la columna. `undefined` se sigue omitiendo, así que una entidad leída que no se tocó no pisa nada. Alternativa descartada: dejar `undefined`, porque al editar el valor anterior queda guardado (H3).

**D4. Validación.**

| Campo | Regla | Mensaje |
|---|---|---|
| Peso en el departamento | Obligatorio y entre 0 y 100 para la VP RRII. Sin cambios respecto de la 003. | `RequiredField` / `ObjetivoWeightRange` |
| Peso en la VP | Si la marca está activa: obligatorio y `1 ≤ valor ≤ 100`. Se admiten decimales, igual que el peso en el departamento. | `RequiredField` / `ObjetivoVpWeightRange` "Ingresá un valor entre 1 y 100." |
| Cantidad de años | Si la duración es Plurianual: obligatoria. | `RequiredField` |

- Los errores se muestran al intentar guardar, igual que el resto del formulario (D14 de la 003).
- Los valores ocultos no se validan.
- Las comparaciones de rango se hacen sobre el número que ingresa la persona, sin aritmética, así que no hay riesgo de precisión.

**D5. Estado inicial en la edición.**

- `esDeVp` se toma de `objetivo.EsDeVp`.
- El peso en la VP se toma de `objetivo.PesoVP`. Si no tiene valor, el campo arranca vacío. Por eso un objetivo marcado que se cargó antes de esta feature exige el peso para guardarse (spec, Edge Cases).
- La cantidad de años se toma de `objetivo.CantidadAnios`, como texto, solo si es 2, 3, 4 o 5. Si es otro valor, el campo arranca vacío y es obligatorio.

**D6. Opciones de cantidad de años.** Se usa una constante local en `ObjetivoForm.tsx`: `ANIOS_PLURIANUAL = [2, 3, 4, 5]`. Es una regla del formulario, no transversal, así que no va en `Constants.ts`.

**D7. Textos del detalle.** Se arman con plantillas de `loc/` y `Utils.replaceAll`, el patrón que ya existe:

- `ObjetivoVpObjectiveYes` = "Sí · peso en la VP: {0}", donde `{0}` es `"{PesoVP} %"` o `ObjetivoNoValue` ("—");
- `ObjetivoDurationYears` = "{0} · {1} años".

`strings.No` ya existe.

**D8. Lista `delVp`.**

- `ObjetivoRow` suma `pesoVp`.
- La columna `vpWeightColumn` (encabezado `ObjetivoColumnVpWeight` = "Peso VP") se agrega a `columns` solo en la variante `delVp`, después de `weightColumn`.
- Las variantes `palanca` y `otrasVp` no cambian (FR-014).

**D9. Textos.**

| Clave | Hoy | Pasa a |
|---|---|---|
| `ObjetivoFormVpObjective` | "¿Es objetivo del VP?" | "¿Es objetivo de la VP RRII?" |
| `ObjetivoFieldVpObjective` | "¿Es objetivo del VP?" | "¿Es objetivo de la VP RRII?" |
| `ObjetivoFormWeight` | "Peso del objetivo en el departamento (%)" | "Peso del objetivo en el Departamento (%)" (como el prototipo) |
| `ObjetivosFilterVp` | "Objetivos del VP" | "Objetivos de la VP RRII" |
| `ObjetivosVpEmpty` | "No hay objetivos del VP cargados." | "No hay objetivos de la VP RRII cargados." |

Claves nuevas:

- `ObjetivoFormVpWeight` = "Peso del objetivo para el VP (%)";
- `ObjetivoFormVpWeightPlaceholder` = "Ej. 10";
- `ObjetivoVpWeightRange` = "Ingresá un valor entre 1 y 100.";
- `ObjetivoFormYears` = "Cantidad de años";
- `ObjetivoFormDepartmentCollab` = "Departamento que colabora";
- `ObjetivoVpObjectiveYes`, `ObjetivoDurationYears` (D7);
- `ObjetivoColumnVpWeight` = "Peso VP".
- `ObjetivoNoValue` = "—" (valor vacío del peso en la VP, en el detalle y en la tabla).

**D10. Mock.** En `ObjetivoMock.ts`, `createRrii` suma los parámetros `pesoVp` y `cantidadAnios` (`PesoVP`, `CantidadAnios`). Los datos de ejemplo tienen que cubrir estos casos:

- un objetivo marcado con peso en la VP distinto del peso en el departamento;
- uno marcado sin peso en la VP, para simular el dato que ya existía antes de esta feature;
- uno no marcado;
- uno plurianual con cantidad de años.

## Estructura de carpetas

```text
specs/005-objetivos-pesos/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-contracts.md
├── checklists/requirements.md
└── tasks.md                          # lo genera /speckit-tasks

src/core/
├── entities/Objetivo.ts              # + PesoVP (lectura y escritura); null explícito (D3)
└── api/Objetivo/
    ├── ObjetivoDataSource.ts         # + 'PesoVP' en selectProperties
    └── ObjetivoMock.ts               # + PesoVP y CantidadAnios en los datos (D10)

src/webparts/objetivosVp/
├── loc/{mystrings.d.ts, en-us.js}    # D9
└── components/Objetivo/
    ├── ObjetivoForm/ObjetivoForm.tsx                 # D2, D4, D5, D6; reubicación del Switch; etiqueta de Departamento
    ├── ObjetivoDetalle/ObjetivoInfo/ObjetivoInfo.tsx # D7
    └── ObjetivosTable/ObjetivosTable.tsx             # D8
```

**Structure Decision**: no se crean archivos de código. Los cambios quedan en las piezas que ya implementan cada pantalla en la 003.

## Orden de implementación

| # | Paso | Depende de |
|---|------|-----------|
| 1 | `Objetivo.ts` (`PesoVP`, `null` explícito) y `ObjetivoDataSource.ts` (`select`) | — |
| 2 | `ObjetivoMock.ts` (D10) | 1 |
| 3 | Claves en `loc/` (D9) | — |
| 4 | `ObjetivoForm.tsx`: reubicar el `Switch`, peso en la VP condicional y reglas de guardado (US1) | 1, 3 |
| 5 | `ObjetivoForm.tsx`: cantidad de años y etiqueta de Departamento (US3, FR-008) | 4 |
| 6 | `ObjetivoInfo.tsx` (US2, US3) | 1, 3 |
| 7 | `ObjetivosTable.tsx`, columna "Peso VP" (FR-014). El renombre de la pestaña ya sale del paso 3. | 1, 3 |
| 8 | La usuaria crea la columna `PesoVP` en la lista de desarrollo (P1) | — |
| 9 | Corrección de datos de otras VP marcadas en la lista de desarrollo (P3) | 8 |
| 10 | Validación con [quickstart.md](./quickstart.md) | 2, 4–9 |

## Complexity Tracking

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|-----------|----------------------|-------------------------------------------|
| Columna nueva `PesoVP` en la lista `Objetivo` | La spec pide un segundo peso, independiente del peso en el departamento, y la columna `Peso` queda para este último. | Reutilizar `Peso` o derivar un peso del otro contradice FR-006. |
| Desvíos del prototipo en los textos y en la obligatoriedad (etiqueta de la marca, "peso en la VP", peso en el departamento obligatorio sin ayuda) y columna "Peso VP" en la pestaña que ya existe | Son decisiones de la usuaria registradas en la spec (Clarifications 2026-11-16). | Seguir el prototipo literal: contradice RF-02, RF-03 y RF-06 de la v1.9. |
| Se mantienen los desvíos de la 003: migas en lugar de "Ubicación en la estrategia", `Breadcrumb` de Fluent, encabezado de grilla e indicador de carga | FR-017 de la spec. | — |
