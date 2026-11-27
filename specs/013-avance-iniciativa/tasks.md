---

description: "Tareas de implementación del avance de la iniciativa por interpolación entre mínimo, meta y máximo"
---

# Tasks: Avance de la iniciativa por interpolación entre mínimo, meta y máximo

**Input**: `specs/013-avance-iniciativa/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/calculo-avance.md`, `quickstart.md`)

**Prerequisites**:

- la feature 006 implementada y compilando (`npm run build` sin errores);
- `docs/especificacion-funcional.md` v1.12 (C-03 actualizado).

**Tests**: no se piden. El repo no tiene runner de pruebas. Se valida con `npm run build` y los escenarios de `quickstart.md`. No se agrega ningún framework.

**Organization**: todas las tareas tocan un único archivo, [resultadoClaveUtils.ts](../../src/webparts/objetivosVp/components/Iniciativa/resultadoClaveUtils.ts), así que son secuenciales (sin [P]). US2 no necesita código propio: el avance del objetivo cambia porque usa el de la iniciativa (FR-004, FR-005).

## Format: `[ID] [P?] [Story] Descripción con ruta de archivo`

- **[Story]**: historia de `spec.md`:
  - US1: el avance de la iniciativa refleja cuánto se acerca cada resultado clave a su meta (P1);
  - US2: el avance del objetivo y de la VP se actualizan con la nueva regla (P1);
  - US3: el avance proyectado se calcula con la misma regla (P2).

## Reglas que aplican a TODAS las tareas

- No modificar ningún otro archivo de `src/`. Las pantallas que consumen las funciones (`IniciativaDetalle.tsx`, `IniciativasTable.tsx`, `ObjetivoDetalle.tsx`, `ObjetivosTable.tsx`, `IniciativaResultadosClave.tsx`) NO cambian.
- No cambiar la firma ni el comportamiento de `getCumplimiento`, `getEstadoResultadoClave`, `getEstadoResultadoClaveLabel`, `getEstadoResultadoClaveChip`, `getPesoResultadoClave`, `getAvanceColor`, `formatAvance` ni de las funciones de borrador y validación (Plan D6).
- Sin comentarios de código (constitución, principio IV). Sin `any`. Sin textos visibles nuevos.
- Toda tarea termina con `npm run build` sin errores.

---

## Phase 1: Setup

Sin tareas: no hay dependencias, configuración ni archivos nuevos.

---

## Phase 2: Foundational

- [x] T001 Agregar el aporte por tramos en `src/webparts/objetivosVp/components/Iniciativa/resultadoClaveUtils.ts`.
  - **Spec**: FR-001. **Plan**: D1, D4, D5.
  - Constantes locales nuevas, junto a las existentes, con `UPPER_SNAKE_CASE`: base del tramo mínimo `60`, base del tramo meta `80` y amplitud del tramo `20`. No reutilizar `AVANCE_UMBRAL_AMARILLO` ni `AVANCE_UMBRAL_VERDE`, porque son umbrales de color (C-07). Reutilizar `FULL_PERCENT` (100) como tope.
  - Función privada (no exportada) `getAportePorValor(resultado: ResultadoClave, valor: number | null | undefined): number`:
    - `valor` `undefined` o `null`, o `Minimo`, `Meta` o `Maximo` `undefined` → `0`;
    - `valor < Minimo` → `0`;
    - `valor < Meta` → `60 + (valor − Minimo) ÷ (Meta − Minimo) × 20`;
    - `valor < Maximo` → `80 + (valor − Meta) ÷ (Maximo − Meta) × 20`;
    - si no → `FULL_PERCENT`.
    Los tramos se evalúan en ese orden. Así, con umbrales iguales nunca se divide por cero (D4). El resultado de los tramos interpolados se pasa por `normalizeAvance`.
  - Reemplazar el cuerpo de `getAporte` para que devuelva `getAportePorValor(resultado, resultado.ValorActual)`. Ya no usa `getCumplimiento` ni el clamp `Math.max(0, Math.min(...))`.
  - **Terminado**: con mínimo 8, meta 10 y máximo 12, `getAporte` devuelve 0, 60, 70, 80, 90, 100 y 100 para 7, 8, 9, 10, 11, 12 y 15, y 0 sin valor actual (tabla de verdad de [contracts/calculo-avance.md](./contracts/calculo-avance.md)). `npm run build` sin errores.

**Checkpoint**: el aporte real ya sigue la regla nueva. `getAvanceIniciativa` y `getAvanceObjetivo` todavía no están parametrizados.

---

## Phase 3: User Story 1 - Avance de la iniciativa (Priority: P1) 🎯 MVP

**Goal**: el avance que muestran el detalle y la bandeja de iniciativas es el promedio de los aportes de FR-001 con el valor actual.

**Independent Test**: escenarios de [quickstart.md](./quickstart.md) §3, tabla principal y escenarios adicionales 1 y 2.

- [x] T002 [US1] Parametrizar el promedio de la iniciativa por valor en `src/webparts/objetivosVp/components/Iniciativa/resultadoClaveUtils.ts`.
  - **Spec**: FR-002, FR-011. **Plan**: D2, D3. **Depende de**: T001.
  - Definir un tipo local para el selector del valor: `(resultado: ResultadoClave) => number | null | undefined`.
  - Función privada `getAvanceIniciativaPorValor(resultados: ResultadoClave[], getValor: <selector>): number`, con el cuerpo actual de `getAvanceIniciativa`: 0 si la lista está vacía; si no, promedio simple de `getAportePorValor(resultado, getValor(resultado))`, normalizado con `normalizeAvance`.
  - `getAvanceIniciativa(resultados)` conserva su firma exportada y delega con el selector de `ValorActual`. Eliminar `getAporte` si queda sin uso (no dejar código muerto).
  - **Terminado**: dos resultados clave con aportes 90 y 100 dan 95; uno en 15 y otro en 7 (umbrales 8/10/12) dan 50; una lista vacía da 0. `IniciativaDetalle.tsx` e `IniciativasTable.tsx` compilan sin cambios. `npm run build` sin errores.

**Checkpoint**: US1 completa y verificable en el workbench.

---

## Phase 4: User Story 2 - Avance del objetivo (Priority: P1)

**Goal**: el avance del objetivo promedia el avance real nuevo de sus iniciativas no canceladas.

**Independent Test**: [quickstart.md](./quickstart.md) §3, escenario adicional 3.

- [x] T003 [US2] Parametrizar el promedio del objetivo por valor en `src/webparts/objetivosVp/components/Iniciativa/resultadoClaveUtils.ts`.
  - **Spec**: FR-004, FR-005. **Plan**: D2, D3. **Depende de**: T002.
  - Función privada `getAvanceObjetivoPorValor(objetivoId: number | undefined, iniciativas: Iniciativa[], resultados: ResultadoClave[], getValor: <selector>): number`, con el cuerpo actual de `getAvanceObjetivo`: filtra las iniciativas del objetivo con `Estado !== EstadoIniciativa.Cancelada`, 0 si no hay, y promedia `getAvanceIniciativaPorValor` de los resultados clave de cada una, normalizado con `normalizeAvance`.
  - `getAvanceObjetivo(objetivoId, iniciativas, resultados)` conserva su firma exportada y delega con el selector de `ValorActual`.
  - **Terminado**: un objetivo con iniciativas de 95 % y 70 % más una cancelada da 82,5 (se muestra 83 %). `ObjetivoDetalle.tsx` y `ObjetivosTable.tsx` compilan sin cambios. `npm run build` sin errores.

**Checkpoint**: US1 y US2 completas.

---

## Phase 5: User Story 3 - Avance proyectado (Priority: P2)

**Goal**: avance proyectado de iniciativa y objetivo disponible con la misma regla, sin mostrarse.

**Independent Test**: revisión del cálculo: un resultado clave (8/10/12) con valor proyectado 11 da 90 de avance proyectado de la iniciativa; ninguna pantalla cambia.

- [x] T004 [US3] Exportar las funciones proyectadas en `src/webparts/objetivosVp/components/Iniciativa/resultadoClaveUtils.ts`.
  - **Spec**: FR-003, FR-004, FR-010. **Plan**: D3. **Contrato**: [contracts/calculo-avance.md](./contracts/calculo-avance.md), "Exportadas nuevas". **Depende de**: T003.
  - `export const getAvanceIniciativaProyectado = (resultados: ResultadoClave[]): number`, que delega en `getAvanceIniciativaPorValor` con el selector de `ValorProyectado`.
  - `export const getAvanceObjetivoProyectado = (objetivoId: number | undefined, iniciativas: Iniciativa[], resultados: ResultadoClave[]): number`, que delega en `getAvanceObjetivoPorValor` con el selector de `ValorProyectado`.
  - No importarlas desde ninguna pantalla.
  - **Terminado**: las dos funciones existen con esas firmas, ninguna pantalla las usa y `npm run build` sin errores.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T005 Validar end-to-end según [quickstart.md](./quickstart.md).
  - **Spec**: SC-001, SC-003, SC-004. **Depende de**: T004.
  - `npm run build` sin errores (incluye `npm run lint`).
  - En el workbench del sitio de desarrollo, con autorización para editar resultados clave de prueba: recorrer la tabla de §3 y los escenarios adicionales 1 a 4; verificar que Cumplim. y Estado de la tabla de resultados clave no cambiaron y que no aparece ningún dato de avance proyectado. Restaurar los valores originales.
  - **Terminado**: todos los escenarios dan lo esperado, o se informa cuál falla con el valor obtenido.

---

## Dependencies & Execution Order

- T001 → T002 (US1) → T003 (US2) → T004 (US3) → T005.
- Todas tocan el mismo archivo: no hay paralelismo.

## Implementation Strategy

- **MVP**: T001 + T002 (US1). Ya cambia el avance visible de las iniciativas y, por arrastre, el del objetivo con la regla vieja de promedio, que no cambia.
- T003 solo reorganiza `getAvanceObjetivo` para reutilizar la parametrización; el valor que muestra el objetivo ya es el nuevo desde T002.
- T004 agrega el proyectado sin efectos en pantalla.
- T005 cierra la validación.
