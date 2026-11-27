# Implementation Plan: Avance de la iniciativa por interpolación entre mínimo, meta y máximo

**Branch**: `013-avance-iniciativa` | **Date**: 2026-11-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-avance-iniciativa/spec.md`. Modifica el cálculo de la [006-resultados-clave](../006-resultados-clave/plan.md) (FR-026 y FR-028), ya implementada.

## Summary

Cambiar el aporte de cada resultado clave al avance de la iniciativa: deja de ser `máx(0, mín(cumplimiento, 100 %))` y pasa a ser la interpolación por tramos de la spec (0 % bajo el mínimo, 60–80 % entre mínimo y meta, 80–100 % entre meta y máximo, 100 % desde el máximo). Se agrega el cálculo proyectado (con el valor proyectado) para iniciativa y objetivo, sin mostrarlo.

Enfoque técnico:

- **Un solo archivo**: `src/webparts/objetivosVp/components/Iniciativa/resultadoClaveUtils.ts`, donde ya viven todos los cálculos (D1).
- **Firmas públicas intactas**: `getAvanceIniciativa` y `getAvanceObjetivo` siguen recibiendo lo mismo y devolviendo el avance real, así que las cuatro pantallas que las usan no cambian (D2).
- **Proyectado**: dos funciones exportadas nuevas, `getAvanceIniciativaProyectado` y `getAvanceObjetivoProyectado`, sobre la misma lógica interna parametrizada por el valor (D3).
- Sin cambios de datos, pantallas, textos ni Design System.

## Technical Context

**Language/Version**: TypeScript `~5.8.0`, con la configuración heredada de `@microsoft/spfx-web-build-rig`, igual que las features anteriores.

**Primary Dependencies**: SPFx `1.22.2`, React `17.0.1`. Esta feature no agrega dependencias.

**Storage**: N/A. Lee los campos existentes de `ResultadoClave` (`Minimo`, `Meta`, `Maximo`, `ValorActual`, `ValorProyectado`). Nada del avance se guarda.

**Testing**: no hay runner de pruebas. Validación: `npm run build` (principio V, incluye `npm run lint`) y los escenarios de [quickstart.md](./quickstart.md) en el workbench hospedado del sitio de desarrollo.

**Target Platform**: SharePoint Online, navegador de escritorio.

**Project Type**: webpart SPFx (Heft, según los scripts de `package.json`).

**Performance Goals**: sin impacto: el cálculo sigue siendo en memoria, O(n) sobre los resultados clave ya cargados.

**Constraints**: sin cambios de interfaz (FR-010, SC-004); aritmética de punto flotante normalizada con el `normalizeAvance` existente (instrucciones de TypeScript, precisión numérica).

**Scale/Scope**: 1 archivo modificado. 0 archivos nuevos de código.

## Hallazgos del repo

Detalle en [research.md](./research.md).

| # | Hallazgo | Consecuencia |
|---|---|---|
| H1 | `getAporte` (privada) es el único punto donde el cumplimiento entra al avance; `getAvanceIniciativa` la usa y `getAvanceObjetivo` usa `getAvanceIniciativa`. | Basta con cambiar el aporte y parametrizar por valor (D1, D3). |
| H2 | `getCumplimiento` también lo usa la tabla de resultados clave (`IniciativaResultadosClave.tsx`). | `getCumplimiento` no se toca (FR-006). |
| H3 | `getAvanceIniciativa` se usa en `IniciativaDetalle.tsx` e `IniciativasTable.tsx`; `getAvanceObjetivo` en `ObjetivoDetalle.tsx` y `ObjetivosTable.tsx`. | Se conservan sus firmas (D2). |
| H4 | La validación del formulario ya exige mínimo ≤ meta ≤ máximo y máximo > 0 (`getDraftIssues`). | Los tramos con umbrales iguales no se alcanzan: no hay división por cero (D4). |
| H5 | `AVANCE_UMBRAL_AMARILLO` (60) y `AVANCE_UMBRAL_VERDE` (80) son los umbrales de color (C-07). | No se reutilizan para el aporte aunque coincidan los números: son otro concepto (D5). |
| H6 | `normalizeAvance` redondea a 6 decimales para estabilizar los cálculos. | Se aplica también al aporte interpolado. |

## Constitution Check

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Plataforma | ✅ Cumple | Mismo stack; sin dependencias nuevas. |
| II. La interfaz no se inventa | ✅ Cumple | No cambia ninguna pantalla; el prototipo sigue mostrando un solo dato "Avance" y el proyectado no se muestra (FR-010). |
| II. `core/ui` de solo lectura | ✅ Cumple | No se toca. |
| II. Textos en español (AR) | ✅ Cumple | Sin textos nuevos. |
| III. Datos desacoplados | ✅ Cumple | Sin cambios de datos ni de servicios. |
| IV. Simplicidad y cambios acotados | ✅ Cumple | Un archivo; firmas públicas intactas; sin comentarios de código. Las dos funciones proyectadas quedan exportadas sin uso en pantalla por decisión del usuario (FR-003, FR-004, FR-010). |
| V. Validación | ✅ Cumple | La tarea cierra con `npm run build`. |

**Re-check post-diseño**: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/013-avance-iniciativa/
├── spec.md
├── cambios-especificacion-funcional.md   # aplicado a docs/especificacion-funcional.md v1.12
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── calculo-avance.md
├── checklists/
│   └── requirements.md
└── tasks.md                               # /speckit-tasks
```

### Source Code (repository root)

```text
src/webparts/objetivosVp/components/
└── Iniciativa/
    └── resultadoClaveUtils.ts   # MODIFICADO: aporte por tramos, cálculo real y proyectado
```

Sin cambios (consumidores que siguen usando las mismas firmas):

```text
src/webparts/objetivosVp/components/
├── Iniciativa/IniciativaDetalle/IniciativaDetalle.tsx
├── Iniciativa/IniciativaDetalle/IniciativaResultadosClave/IniciativaResultadosClave.tsx
├── Iniciativa/IniciativasTable/IniciativasTable.tsx
├── Objetivo/ObjetivoDetalle/ObjetivoDetalle.tsx
└── Objetivo/ObjetivosTable/ObjetivosTable.tsx
```

**Structure Decision**: se modifica solo el módulo de cálculos existente de la 006 (`resultadoClaveUtils.ts`), que ya concentra cumplimiento, estado y avance. No se crea ningún archivo de código.

## Diseño

| # | Decisión |
|---|---|
| D1 | Función privada `getAportePorValor(resultado, valor)` con los tramos de FR-001. Devuelve 0 si `valor` es `undefined` o `null` o si falta algún umbral; si no, aplica los tramos y normaliza con `normalizeAvance`. |
| D2 | `getAvanceIniciativa(resultados)` y `getAvanceObjetivo(objetivoId, iniciativas, resultados)` mantienen firma y semántica (avance real). |
| D3 | La lógica de promedio se parametriza por un selector de valor (`(resultado) => resultado.ValorActual` o `ValorProyectado`) en funciones privadas; las públicas real y proyectada solo eligen el selector. Sin lógica duplicada. |
| D4 | Los tramos se evalúan en orden (`< mínimo`, `< meta`, `< máximo`, resto). Con umbrales iguales, el tramo vacío nunca se evalúa, así que las divisiones `meta − mínimo` y `máximo − meta` siempre tienen denominador positivo. |
| D5 | Constantes locales nuevas para el aporte: base del tramo mínimo (60), base del tramo meta (80) y amplitud del tramo (20). `FULL_PERCENT` (100) se reutiliza como tope, porque es el mismo concepto (100 %). |
| D6 | `getCumplimiento`, `getEstadoResultadoClave`, `getAvanceColor` y `formatAvance` no cambian. |

## Interfaz y Design System

N/A: la feature no cambia pantallas. **Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/LEEME.md`, "Avance" (un solo dato coloreado), que se respeta sin cambios.

### Elementos sin componente en el Design System

Ninguno.

## Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | Los avances que ya ven los usuarios cambian de valor al desplegar (por ejemplo, un valor igual a la meta pasaba a aportar meta ÷ máximo y ahora aporta 80 %). | Es el objetivo de la feature; avisar a la VP RRII en el despliegue. |
| R2 | El Excel de la VP tiene una hoja ("Avance Iniciativas") con otra fórmula. | La spec fija las columnas T y U como referencia (Assumptions). |
| R3 | Las funciones proyectadas no tienen consumidor. | Decisión del usuario; quedan listas para la vista de seguimiento o los reportes. |

## Complexity Tracking

Sin violaciones.
