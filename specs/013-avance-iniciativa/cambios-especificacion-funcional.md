# Cambios propuestos a docs/especificacion-funcional.md (v1.11 → v1.12)

**Aplicado** a `docs/especificacion-funcional.md` v1.12 (aprobado por el usuario el 27/11/2026). Se propuso sobre la v1.10 y se renumeró como v1.12 porque la feature 010 (roles y permisos) ya había publicado la v1.11. Se conserva como registro de lo propuesto y revisado. Cambia la regla del avance de la iniciativa (C-03) según el mail del usuario de la VP RRII y su Excel de seguimiento (columnas T y U), con tope de 100 %. Spec de la feature: `specs/013-avance-iniciativa/spec.md`.

## Encabezado

- Versión: `1.11 · 24/11/2026` → `1.12 · 27/11/2026`.
- Archivo: `Especificacion_Funcional_Gestion_Portfolio_VP_v1.11.docx` → `..._v1.12.docx`.

## 1.3 Modelo de gestión · Figura 1

En el diagrama, el nodo del resultado clave deja de mostrar el % de cumplimiento, que ya no sube al avance:

- `RC["Resultado clave<br>% cumplimiento (C-01)"]` → `RC["Resultado clave<br>aporte (C-03)"]`

El párrafo de la sección no cambia: "El avance se calcula desde los resultados clave hacia arriba" sigue siendo cierto.

## 2.3 No incluye · Pesos manuales

Agregar al final de la observación de "Pesos manuales de iniciativas y resultados clave":

- `Se evaluará después de la primera etapa de uso.` → `Se evaluará después de la primera etapa de uso. El usuario de la VP RRII pidió ponderar los resultados clave por un peso asignado; queda para esa evaluación.`

## 5. Cálculos · Párrafo inicial

- `Los porcentajes se expresan entre 0% y 100%, salvo el % de cumplimiento del resultado clave, que puede superar 100% para mostrar sobrecumplimiento.` → `Los porcentajes se expresan entre 0% y 100%, salvo el % de cumplimiento del resultado clave, que puede superar 100% para mostrar sobrecumplimiento y no interviene en el avance.`

El resto del párrafo (real y proyectado, redondeo solo de presentación) no cambia.

## C-01 · % de cumplimiento del resultado clave

- `Sin valor actual, el cumplimiento real se muestra como "—" y aporta 0% al avance de la iniciativa.` → `Sin valor actual, el cumplimiento real se muestra como "—".<br>Es informativo: el avance de la iniciativa sale del aporte (C-03), no del cumplimiento.`

## C-02 · Estado del resultado clave

Agregar al final de la celda:

- `<br>Los umbrales mínimo, meta y máximo equivalen a un aporte de 60%, 80% y 100% al avance de la iniciativa (C-03).`

## C-03 · Avance de la iniciativa

Reemplazar la celda completa:

- Actual: `Avance = promedio simple de máx(0%, mín(% cumplimiento, 100%)) de sus resultados clave, porque pesan en partes iguales (RF-08). Un resultado clave sin valor actual aporta 0%.<br>El avance de las tareas no interviene.`
- Nuevo: `Avance = promedio simple del aporte de sus resultados clave, porque pesan en partes iguales (RF-08). El aporte de cada uno se calcula con su valor (actual para el real, proyectado para el proyectado):<br>• sin valor → 0%<br>• valor < mínimo → 0%<br>• mínimo ≤ valor < meta → 60% + (valor − mínimo) ÷ (meta − mínimo) × 20%<br>• meta ≤ valor < máximo → 80% + (valor − meta) ÷ (máximo − meta) × 20%<br>• valor ≥ máximo → 100%<br>El aporte nunca supera 100%, para que un resultado sobrecumplido no compense a otro incumplido.<br>El avance de las tareas no interviene.`

## Ejemplo (al pie de la tabla de cálculos)

Reemplazar el párrafo completo:

- Actual: `Ejemplo. Una iniciativa tiene dos resultados clave: "Implementar YPF Store en 100 estaciones" (máximo 100, valor actual 40 → 40%) y "Alcanzar USD 193 K de facturación" (máximo 210, valor actual 230 → 110%, que suma como 100%). Cada uno pesa 50%, así que el avance de la iniciativa = (40% + 100%) ÷ 2 = 70% (amarillo). Si el objetivo tiene tres iniciativas, cada una pesa 1/3; si las otras dos tienen 90% y 60%, el avance del objetivo es (70% + 90% + 60%) ÷ 3 = 73,3% (se muestra como 73%).`
- Nuevo: `Ejemplo. Una iniciativa tiene dos resultados clave: "Generar 12 estudios estratégicos" (mínimo 8, meta 10, máximo 12, valor actual 11 → aporte 80% + (11 − 10) ÷ (12 − 10) × 20% = 90%; cumplimiento 92%, estado Meta) y "Alcanzar USD 193 K de facturación" (mínimo 150, meta 193, máximo 210, valor actual 230 → aporte 100%; cumplimiento 110%, estado Máximo). Cada uno pesa 50%, así que el avance de la iniciativa = (90% + 100%) ÷ 2 = 95% (verde). Si el objetivo tiene tres iniciativas, cada una pesa 1/3; si las otras dos tienen 70% y 60%, el avance del objetivo es (95% + 70% + 60%) ÷ 3 = 75% (amarillo).`

## Sin cambios

- C-04, C-05, C-06, C-07 y C-08: mismas fórmulas; solo cambia el valor de entrada que viene de C-03.
- RF-08 (pesos en partes iguales), RF-09 (umbrales mínimo ≤ meta ≤ máximo) y RF-10 (seguimiento).
- El prototipo (`docs/Gestion-Objetivos-VP-RRII-prototipo_v5/`) y las specs de features cerradas. La 013 deja registrado qué partes de la 006 reemplaza (FR-026, FR-028 y el caso borde de valores negativos).

## Verificación contra la spec 013

| Cambio | Spec 013 |
|---|---|
| C-03, aporte por tramos y tope de 100% | FR-001, FR-002, FR-003; historia 1 |
| C-01 informativo | FR-006 |
| C-02 sin cambios de estado | FR-007 |
| Ejemplo | Historia 1, escenarios 5, 6 y 8 |
| Pesos manuales pendientes | Assumptions |
