# Feature Specification: Avance de la iniciativa por interpolación entre mínimo, meta y máximo

**Feature Branch**: `013-avance-iniciativa`

**Created**: 2026-11-27

**Status**: Draft

**Input**: User description: "Cambiar la regla de cálculo del avance de la iniciativa a partir de sus resultados clave (C-03 de docs/especificacion-funcional.md v1.10), según el mail del usuario de la VP RRII y su Excel de seguimiento. Cada resultado clave aporta 0 % por debajo del mínimo, entre 60 % y 80 % (interpolado) entre el mínimo y la meta, entre 80 % y 100 % (interpolado) entre la meta y el máximo, y 100 % desde el máximo; el aporte nunca supera 100 %. Se calcula con el valor actual (real) y con el valor proyectado (proyectado). Los resultados clave siguen pesando en partes iguales; el % de cumplimiento y el estado del resultado clave no cambian; el avance proyectado se calcula pero no se muestra."

**Fuente vigente**: `docs/especificacion-funcional.md` v1.10 (§5 Cálculos: C-01 a C-04 y C-07; RF-08 para los pesos). El cambio de regla viene del mail del usuario de la VP RRII y de las columnas T y U de su Excel de seguimiento ("% Cumplimiento" y "% Cumplimiento proyectado"), con el tope de 100 % que el mismo mail pide al consolidar por iniciativa. Las diferencias con la v1.10 se registran en `cambios-especificacion-funcional.md` de esta carpeta.

**Diseño de referencia**: `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/` (LEEME.md, "Avance": un solo dato "Avance" coloreado en grillas y detalles, sin real ni proyectado). Esta feature no cambia pantallas.

**Modifica**:
- `specs/006-resultados-clave/spec.md`, FR-028 (C-03): el aporte de cada resultado clave deja de ser máx(0 %, mín(cumplimiento, 100 %)) y pasa a ser el de FR-001 de esta spec.
- `specs/006-resultados-clave/spec.md`, FR-026 (C-01): el cumplimiento se sigue calculando y mostrando igual, pero deja de alimentar el avance de la iniciativa.
- `specs/006-resultados-clave/spec.md`, caso borde "Valor actual o proyectado negativo": sigue aportando 0 %, ahora porque es menor que el mínimo (o, si el mínimo es negativo, según el tramo que le toque).

Todo lo que esta spec no cambia sigue rigiendo como lo definen esas specs.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - El avance de la iniciativa refleja cuánto se acerca cada resultado clave a su meta (Priority: P1)

El accountable de una iniciativa carga el valor actual de sus resultados clave en el seguimiento. La iniciativa muestra un avance que respeta la escala que usa la VP: alcanzar el mínimo vale 60 %, la meta 80 % y el máximo 100 %, con valores intermedios proporcionales. Así, quien mira el avance en la aplicación ve el mismo número que la VP calcula hoy en su planilla, sin que un resultado sobrecumplido compense a otro incumplido.

**Why this priority**: Es el único objetivo de la feature: que el avance de la aplicación coincida con el criterio de la VP. Sin esto, el avance que muestra la herramienta no es el que se reporta.

**Independent Test**: En una iniciativa con un único resultado clave (mínimo 8, meta 10, máximo 12), cargar sucesivamente los valores 7, 8, 9, 10, 11, 12 y 15 y verificar que el avance de la iniciativa muestra 0 %, 60 %, 70 %, 80 %, 90 %, 100 % y 100 %, con el color correspondiente.

**Acceptance Scenarios**:

1. **Given** un resultado clave con mínimo 8, meta 10 y máximo 12, **When** el valor actual es 7 (menor que el mínimo), **Then** aporta 0 % al avance de la iniciativa.
2. **Given** el mismo resultado clave, **When** el valor actual es 8 (igual al mínimo), **Then** aporta 60 %.
3. **Given** el mismo resultado clave, **When** el valor actual es 9 (entre el mínimo y la meta), **Then** aporta 70 % (60 % + (9 − 8) ÷ (10 − 8) × 20 %).
4. **Given** el mismo resultado clave, **When** el valor actual es 10 (igual a la meta), **Then** aporta 80 %.
5. **Given** el mismo resultado clave, **When** el valor actual es 11 (entre la meta y el máximo), **Then** aporta 90 % (80 % + (11 − 10) ÷ (12 − 10) × 20 %).
6. **Given** el mismo resultado clave, **When** el valor actual es 12 (igual al máximo) o 15 (mayor que el máximo), **Then** aporta 100 %; nunca más de 100 %.
7. **Given** el mismo resultado clave sin valor actual, **When** se calcula el avance, **Then** aporta 0 %.
8. **Given** una iniciativa con dos resultados clave que aportan 90 % y 100 %, **When** se muestra su avance en el detalle de la iniciativa y en la bandeja de iniciativas, **Then** ambos muestran 95 %, en verde.
9. **Given** una iniciativa con un resultado clave con valor actual 15 (aporta 100 %) y otro con valor actual 7 (aporta 0 %), con los umbrales del escenario 1, **When** se calcula el avance, **Then** es 50 %: el sobrecumplimiento del primero no compensa el incumplimiento del segundo.

---

### User Story 2 - El avance del objetivo y de la VP se actualizan con la nueva regla (Priority: P1)

Quien consulta un objetivo o la palanca ve el avance del objetivo calculado con el avance de sus iniciativas, que ahora sale de la regla nueva. La fórmula del objetivo no cambia: solo cambia el valor de entrada.

**Why this priority**: El avance del objetivo es el que se reporta al comité; si quedara con la regla anterior, la aplicación mostraría dos criterios distintos.

**Independent Test**: Con un objetivo de dos iniciativas no canceladas, una con avance 95 % y otra con 70 % según la regla nueva, y una tercera cancelada, verificar que el objetivo muestra 83 % (82,5 % redondeado) en la bandeja de objetivos, en el detalle del objetivo y en la palanca.

**Acceptance Scenarios**:

1. **Given** un objetivo con iniciativas no canceladas, **When** cambia el valor actual de un resultado clave de una de ellas, **Then** el avance del objetivo se recalcula como el promedio simple del avance de esas iniciativas (C-04 sin cambios).
2. **Given** una iniciativa cancelada en el objetivo, **When** se calcula el avance del objetivo, **Then** esa iniciativa no cuenta.
3. **Given** un avance de iniciativa u objetivo, **When** se colorea, **Then** se aplican los mismos umbrales que hoy: menos de 60 % rojo, de 60 % a menos de 80 % amarillo, 80 % o más verde (C-07 sin cambios).

---

### User Story 3 - El avance proyectado se calcula con la misma regla (Priority: P2)

La aplicación calcula también el avance proyectado de cada iniciativa y de cada objetivo con el valor proyectado de sus resultados clave y la misma regla. Por ahora no se muestra en ninguna pantalla, como en el prototipo, pero queda disponible para la vista de seguimiento o los reportes que lo pidan.

**Why this priority**: La especificación funcional pide hacer todos los cálculos con el valor real y con el proyectado, pero ninguna pantalla actual lo muestra; no bloquea el valor de la historia 1.

**Independent Test**: Con el resultado clave de la historia 1 y valor proyectado 11, verificar en una revisión del cálculo (no en pantalla) que el avance proyectado de la iniciativa es 90 %, y que ninguna pantalla cambió.

**Acceptance Scenarios**:

1. **Given** un resultado clave con valor proyectado, **When** se calcula su aporte proyectado, **Then** se aplica la regla de FR-001 al valor proyectado.
2. **Given** una iniciativa, **When** se calcula su avance proyectado, **Then** es el promedio simple de los aportes proyectados de sus resultados clave.
3. **Given** un objetivo, **When** se calcula su avance proyectado, **Then** es el promedio simple del avance proyectado de sus iniciativas no canceladas.
4. **Given** cualquier pantalla de la aplicación, **When** se muestra, **Then** no aparece ningún dato nuevo de avance proyectado.

---

### Edge Cases

- **Valor igual a un umbral**: el mínimo exacto aporta 60 %, la meta exacta 80 % y el máximo exacto 100 % (cada tramo incluye su límite inferior).
- **Valor mayor que el máximo**: aporta 100 %; el % de cumplimiento de la tabla sigue mostrando el sobrecumplimiento (por ejemplo, 125 %).
- **Sin valor actual**: aporta 0 % al avance real; la tabla sigue mostrando "—" en Cumplim. y "Sin dato" en Estado.
- **Sin valor proyectado**: aporta 0 % al avance proyectado.
- **Iniciativa sin resultados clave**: su avance es 0 %, en rojo, y cuenta en el promedio del objetivo (como hoy).
- **Mínimo igual a la meta**: el tramo de 60 % a 80 % no se alcanza; un valor igual al mínimo ya está en el tramo de la meta y aporta 80 %.
- **Meta igual al máximo**: el tramo de 80 % a 100 % no se alcanza; un valor igual a la meta aporta 100 %.
- **Mínimo, meta y máximo iguales**: por debajo aporta 0 %; igual o por encima, 100 %.
- **Valores negativos**: se aplican los mismos tramos; si el valor es menor que el mínimo, aporta 0 %. El aporte nunca es negativo ni mayor que 100 %.
- **Valores decimales**: el aporte se calcula sin redondear; solo se redondea a entero al mostrar el avance (como hoy).
- **Iniciativa de un objetivo de otra VP**: sigue sin resultados clave ni avance.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 (C-03, aporte)**: El aporte de cada resultado clave al avance de su iniciativa DEBE calcularse con un valor V y los umbrales del resultado clave así:
  - sin valor → 0 %;
  - V < mínimo → 0 %;
  - mínimo ≤ V < meta → 60 % + (V − mínimo) ÷ (meta − mínimo) × 20 %;
  - meta ≤ V < máximo → 80 % + (V − meta) ÷ (máximo − meta) × 20 %;
  - V ≥ máximo → 100 %.
  El aporte DEBE estar siempre entre 0 % y 100 %.
- **FR-002 (C-03, real)**: El avance real de la iniciativa DEBE ser el promedio simple de los aportes de sus resultados clave calculados con el valor actual. Los resultados clave pesan en partes iguales (RF-08 sin cambios). Las tareas NO intervienen.
- **FR-003 (C-03, proyectado)**: El avance proyectado de la iniciativa DEBE ser el promedio simple de los aportes de sus resultados clave calculados con el valor proyectado.
- **FR-004 (C-04)**: El avance real y el proyectado del objetivo DEBEN ser el promedio simple del avance real o proyectado de sus iniciativas no canceladas. NO DEBEN calcularse para objetivos de otra VP.
- **FR-005 (C-05)**: El avance de la VP DEBE seguir calculándose con su fórmula actual, ahora a partir del avance del objetivo de FR-004.
- **FR-006 (C-01)**: El % de cumplimiento del resultado clave DEBE seguir siendo valor actual ÷ máximo y mostrarse como hoy en la tabla de resultados clave (puede superar 100 %, "—" sin valor actual). NO DEBE intervenir en el avance.
- **FR-007 (C-02)**: El estado del resultado clave (No cumple, Mínimo, Meta, Máximo, Sin dato) y su chip NO DEBEN cambiar.
- **FR-008 (C-07)**: Los colores del avance y sus umbrales NO DEBEN cambiar.
- **FR-009**: El avance que se muestra hoy (detalle y bandeja de iniciativas; detalle, bandeja y palanca para objetivos) DEBE pasar a mostrar el avance real de FR-002 y FR-004, con el mismo formato, redondeo y color.
- **FR-010**: El avance proyectado de la iniciativa y del objetivo NO DEBE mostrarse en ninguna pantalla en esta feature.
- **FR-011**: Los cálculos DEBEN hacerse sin redondear; el redondeo a entero es solo de presentación (como hoy).

### Key Entities *(include if feature involves data)*

- **Resultado clave**: existente (spec 006). Aporta mínimo, meta, máximo, valor actual y valor proyectado. No se agregan ni cambian campos.
- **Iniciativa** y **Objetivo**: existentes. Su avance se calcula; no se guarda.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para los siete valores de la historia 1 (7, 8, 9, 10, 11, 12 y 15, con mínimo 8, meta 10 y máximo 12), el avance mostrado coincide en el 100 % de los casos con el resultado esperado: 0 %, 60 %, 70 %, 80 %, 90 %, 100 % y 100 %.
- **SC-002**: Para cualquier resultado clave con un valor entre el mínimo y el máximo, el aporte coincide con la columna "% Cumplimiento" del Excel de seguimiento de la VP (redondeado a entero).
- **SC-003**: Ninguna iniciativa ni objetivo muestra un avance mayor que 100 % ni menor que 0 %.
- **SC-004**: Ninguna pantalla cambia su disposición ni sus textos; solo cambian los valores de avance.

## Assumptions

- La regla vale igual para todos los tipos de medición (cantidad, porcentaje, moneda, indicador). Mayor valor siempre es mejor, porque la validación existente exige mínimo ≤ meta ≤ máximo.
- El peso por resultado clave que menciona el mail ("promedio ponderado ... utilizando el peso asignado") queda fuera de alcance: se mantienen las partes iguales de RF-08, como en el Excel adjunto (1/3 cada uno).
- La hoja "Avance Iniciativas" del Excel, que usa mín(valor ÷ máximo, 100 %), no es la referencia: prevalece la regla de las columnas T y U del mail, con el tope de 100 % al consolidar.
- No cambian listas de SharePoint, columnas, entidades, permisos ni textos visibles.
- El prototipo no se modifica: sigue mostrando un solo dato "Avance".
