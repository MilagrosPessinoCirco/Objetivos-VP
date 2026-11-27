# Data Model: Avance de la iniciativa por interpolación

No se crean ni modifican entidades, listas ni columnas.

## Campos que se leen

**ResultadoClave** (`src/core/entities/ResultadoClave.ts`, existente):

| Campo | Uso |
|---|---|
| `Minimo` | Umbral del 60 %. |
| `Meta` | Umbral del 80 %. |
| `Maximo` | Umbral del 100 %. Mayor que 0. |
| `ValorActual` | Valor para el aporte real. Puede faltar. |
| `ValorProyectado` | Valor para el aporte proyectado. |
| `Iniciativa.Id` | Agrupa los resultados clave por iniciativa. |

Reglas de validación existentes, sin cambios: mínimo ≤ meta ≤ máximo y máximo > 0 (`getDraftIssues`).

**Iniciativa** (existente): `Id`, `Objetivo.Id` y `Estado` (las canceladas no cuentan en el objetivo).

## Valores calculados (no se guardan)

| Valor | Fórmula | Rango |
|---|---|---|
| Aporte de un resultado clave | Tramos de FR-001 sobre `ValorActual` (real) o `ValorProyectado` (proyectado) | 0–100 |
| Avance de la iniciativa | Promedio simple de los aportes; 0 sin resultados clave | 0–100 |
| Avance del objetivo | Promedio simple del avance de las iniciativas no canceladas; 0 sin iniciativas | 0–100 |
