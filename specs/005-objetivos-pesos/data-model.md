# Data Model: Ajustes de objetivos de la reunión 6

Cambia solo la entidad `Objetivo` (`src/core/entities/Objetivo.ts`) y su lista (`Lista.Objetivo`). Los nombres internos son los que ya usa el datasource. La única columna nueva es `PesoVP`, aprobada el 2026-11-16 (plan, P1). El resto del modelo sigue el de la [003](../003-objetivos/data-model.md).

## Objetivo: atributos que cambian

| Atributo (entidad) | Columna (interna) | Tipo | Aplica a | Obligatorio | Regla |
|---|---|---|---|---|---|
| `Peso` | `Peso` (ya existe) | número 0 a 100 | VP RRII | sí | Pasa a ser el **peso en el departamento**. No se renombra ni se migra. |
| `EsDeVp` | `EsDelVp` (ya existe) | sí/no | VP RRII | no (por defecto No) | Se muestra como "¿Es objetivo de la VP RRII?". En otra VP se guarda `false`. |
| `PesoVP` | `PesoVP` (**nueva**, aprobada) | número 1 a 100, con los mismos decimales que `Peso` | VP RRII marcado | sí, si `EsDeVp` | **Peso en la VP**. Se guarda `null` si no está marcado o si es de otra VP. |
| `CantidadAnios` | `CantidadAnios` (ya existe, tipo Número) | número 2 a 5 | VP RRII con `Duracion = Plurianual` | sí, si es Plurianual | Se guarda `null` con otra duración o en otra VP. |

## Reglas por tipo de objetivo

| Caso | `Peso` | `EsDeVp` | `PesoVP` | `CantidadAnios` |
|---|---|---|---|---|
| VP RRII, sin marca, Anual o Permanente | 0–100 | `false` | `null` | `null` |
| VP RRII, marcado, Plurianual | 0–100 | `true` | 1–100 | 2–5 |
| Otra VP | sin valor (como en la 003) | `false` | `null` | `null` |

- Los dos pesos son independientes: ninguno se calcula ni se limita a partir del otro.
- No se valida la suma de los pesos (FR-005).
- **Escritura**: `toListItem` envía `PesoVP` y `CantidadAnios` aunque valgan `null`, porque `null` borra el valor (research R3). `undefined` se sigue omitiendo.
- **Datos que ya existían**:
  - los objetivos de otra VP con `EsDelVp` = Sí se corrigen en la lista de desarrollo: `EsDelVp` pasa a No y `PesoVP` queda vacío (plan, P3);
  - `Peso` se interpreta como el peso en el departamento;
  - los objetivos marcados sin `PesoVP` muestran "—" y piden el peso al editarlos;
  - los plurianuales sin `CantidadAnios` muestran solo "Plurianual" y piden la cantidad al editarlos.

## Mock (`ObjetivoMock.ts`)

Datos que tiene que tener el mock:

- un objetivo marcado con `Peso` 20 y `PesoVP` 15;
- uno marcado sin `PesoVP`;
- uno sin marcar;
- uno plurianual con `CantidadAnios` 2 (el que ya existe, de 2026 a 2027);
- los de otra VP que ya tiene, con `EsDelVp` en `false`.
