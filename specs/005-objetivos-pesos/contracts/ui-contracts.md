# Contratos de interfaz: Ajustes de objetivos de la reunión 6

No cambian las rutas ni las props públicas de las pantallas de la 003. Cambian el contrato de la entidad, lo que muestran los campos y los textos de `loc/`.

## 1. Entidad `Objetivo` (`src/core/entities/Objetivo.ts`)

```ts
// lectura (mapItem)
this.PesoVP = item.PesoVP ?? undefined;
// escritura (toListItem), además de lo que ya existe
PesoVP: this.PesoVP,             // null borra; undefined se omite
CantidadAnios: this.CantidadAnios, // ya existe; ahora puede valer null

public PesoVP?: number | null | undefined;
public CantidadAnios?: number | null | undefined;   // amplía el tipo actual para admitir null
```

`ObjetivoDataSource.selectProperties` suma `'PesoVP'`. `IObjetivoDataSource` no cambia.

## 2. Props

| Pieza | Cambio de props |
|---|---|
| `ObjetivoFormBody` | Ninguno. |
| `ObjetivoInfo` | Ninguno. |
| `ObjetivosTable` | Ninguno. La variante `delVp` suma la columna "Peso VP" (fila `pesoVp: string`). |

## 3. Comportamiento del formulario (`ObjetivoFormBody`)

| Condición | Campos visibles en "Planificación (VP RRII)" |
|---|---|
| VP RRII, duración distinta de Plurianual, marca apagada | Palanca, Duración, Peso del objetivo en el Departamento (%), ¿Es objetivo de la VP RRII?, Fecha de inicio, Fecha de compromiso |
| + duración Plurianual | se agrega Cantidad de años después de Duración |
| + marca encendida | se agrega Peso del objetivo para el VP (%) después del interruptor |
| Otra VP | la sección no se muestra; la etiqueta de Departamento es "Departamento que colabora" |

Objeto que se guarda: plan, D2. Validación: plan, D4.

## 4. Textos del detalle (`ObjetivoInfo`)

| Caso | "¿Es objetivo de la VP RRII?" | "Duración" |
|---|---|---|
| Marcado, `PesoVP` = 15 | `Sí · peso en la VP: 15 %` | — |
| Marcado, sin `PesoVP` | `Sí · peso en la VP: —` | — |
| No marcado | `No` | — |
| Plurianual, `CantidadAnios` = 3 | — | `Plurianual · 3 años` |
| Plurianual sin cantidad, Anual o Permanente | — | solo la duración |

## 5. Columnas de `ObjetivosTable`

| Variante | Columnas |
|---|---|
| `palanca` | sin cambios: ID, Objetivo, Departamento, Gerencia, Peso, Avance, Estado, Ver |
| `delVp` | ID, Objetivo, Palanca, Departamento, Gerencia, Peso, **Peso VP**, Avance, Estado, Ver |
| `otrasVp` | sin cambios |

## 6. Claves de `loc/`

Están en el plan, D9. Cada clave nueva o modificada se actualiza a la vez en `mystrings.d.ts` y en `en-us.js`.
