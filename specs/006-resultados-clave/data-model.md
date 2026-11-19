# Data Model: Resultados clave y cálculo de avance

Usa listas que ya existen (spec, Assumptions). Los nombres internos son los que ya usan los datasources de `core/api`. No se crean listas ni columnas; los prerrequisitos de SharePoint (P1 a P3) están en el [plan](./plan.md#prerrequisitos-de-sharepoint-a-cargo-de-la-usuaria).

## ResultadoClave (`Lista.ResultadoClave` = "Resultado clave")

| Atributo (entidad) | Columna (interna) | Tipo | Obligatorio | Regla |
|---|---|---|---|---|
| `Id` | `Id` | autonumérico | sistema | Se muestra como `KR-<Id con dos dígitos>`. No se edita (FR-001). |
| `Titulo` | `Title` | texto | sistema | Se escribe igual que `Nombre` al crear y al editar (FR-008). |
| `Nombre` | `Nombre` | texto, hasta 255 | sí | Se guarda sin espacios al inicio y al final. Solo espacios = vacío. |
| `Iniciativa` | `Iniciativa` (lookup a `Iniciativa`) | lookup, un valor | sí | No cambia después del alta. Solo iniciativas de objetivos de la VP RRII. |
| `TipoMedicion` | `TipoMedicion` (opción) | `TipoMedicion` | sí | Cantidad · Porcentaje · Moneda · Indicador (FR-003). |
| `UnidadMedida` | `UnidadMedida` | texto | sí | Se guarda sin espacios al inicio y al final. |
| `Minimo` | `Minimo` | número | sí | `Minimo ≤ Meta` (FR-005). |
| `Meta` | `Meta` | número | sí | `Minimo ≤ Meta ≤ Maximo` (FR-005). |
| `Maximo` | `Maximo` | número | sí | Mayor que 0 (FR-004) y `Meta ≤ Maximo`. |
| `ValorActual` | `ValorActual` | número | no | Vacío hasta el primer seguimiento. Se vacía enviando `null` (D2). |
| `ValorProyectado` | `ValorProyectado` | número | sí | Al crear = `Meta` (FR-007). Se actualiza solo desde el seguimiento. |
| `Fuente` | `Fuente` | texto | no | Se vacía enviando `null`. |
| `Evidencia` | `Evidencia` (link) | URL | no | Un único link, válido según `Utils.validateAndSanitizeUrl` (FR-009). Se vacía enviando `null`. |
| `Descripcion`, `Responsable`, `Peso` | `Descripcion`, `Responsable`, `Peso` | — | — | **No se usan**: no se muestran ni se escriben (FR-006, FR-011). Se mantienen en SharePoint. |
| `Created`, `Author`, `Modified`, `Editor` | — | sistema | — | Sin uso en esta feature. |

### Quién escribe cada campo

| Campo | Alta y edición de la iniciativa | Seguimiento |
|---|---|---|
| `Nombre`, `Title`, `TipoMedicion`, `UnidadMedida`, `Minimo`, `Meta`, `Maximo`, `Iniciativa` | Sí | No (solo lectura) |
| `ValorProyectado` | Solo al crear (= `Meta`) | Sí |
| `ValorActual`, `Fuente`, `Evidencia` | No | Sí |

Los objetos que se guardan son parciales: solo llevan los campos de su columna. Los demás no se envían y SharePoint los conserva.

### Valores calculados (no se guardan)

| Valor | Regla | Se muestra en |
|---|---|---|
| Peso en la iniciativa | `100 ÷ n`, con `n` = cantidad de resultados clave de la iniciativa (FR-011). | Sección Resultados clave del detalle de la iniciativa. |
| Cumplimiento | `ValorActual × 100 ÷ Maximo`. Sin valor actual o con máximo ≤ 0, 0 para el avance; la columna Cumplim. muestra "—" cuando no hay valor actual. Puede superar 100 (FR-026). | Columna Cumplim. |
| Estado | Sin valor actual → Sin dato (gris). Con valor: `< Minimo` No cumple (rojo); `< Meta` Mínimo (naranja); `< Maximo` Meta (amarillo); si no, Máximo (verde) (FR-027). | Columna Estado. |

El valor proyectado no interviene en ningún cálculo (FR-026, FR-027).

## Avance (calculado, no se guarda)

| Valor | Regla | Se muestra en |
|---|---|---|
| Avance de la iniciativa | Promedio simple de `mín(cumplimiento, 100)` de sus resultados clave. Sin resultados clave, 0 % (FR-024). Solo iniciativas de objetivos de la VP RRII; las de otra VP no tienen avance (FR-023). Las tareas no intervienen (FR-028). | Encabezado del detalle de la iniciativa, columna Avance de la bandeja y de la sección Iniciativas del detalle del objetivo. |
| Avance del objetivo | Promedio simple del avance de las iniciativas del objetivo que no están canceladas. Sin ninguna, 0 % (FR-025). Solo objetivos de la VP RRII (FR-029). | Encabezado del detalle del objetivo, columna Avance del detalle de la palanca y de la grilla de objetivos. |
| Color | Menos de 60 → rojo; de 60 a menos de 80 → amarillo; 80 o más → verde (FR-030). Se calcula con el avance sin redondear a entero. | Todos los porcentajes de avance. No se aplica a Cumplim. |
| Presentación | Entero redondeado, sin `-0` (FR-031). | Todos los porcentajes. |

Ejemplos de validación (spec, SC-003):

- Iniciativa con dos resultados clave, uno con máximo 100 y valor actual 40 (40 %) y otro con máximo 210 y valor actual 230 (110 %, suma como 100 %): avance `(40 + 100) ÷ 2 = 70`, amarillo.
- Objetivo con tres iniciativas de avance 70, 90 y 60: `(70 + 90 + 60) ÷ 3 = 73,33…`, se muestra "73 %", amarillo.
- Una iniciativa cancelada del mismo objetivo no entra en el promedio.

## ComentarioResultadoClave (`Lista.ComentarioResultadoClave` = "Comentario resultado clave")

| Atributo | Columna | Tipo | Regla |
|---|---|---|---|
| `ResultadoClave` | `ResultadoClave` (lookup) | lookup | Resultado clave al que pertenece. |
| `Comentario` | `Comentario` | texto largo | Texto del comentario del seguimiento. |
| `Created` | `Created` | fecha | Fecha que se muestra. |
| `Author` | `Author` | persona | Autor que se muestra. |

- Cada seguimiento con un comentario nuevo crea un elemento nuevo. Nunca se editan ni se eliminan.
- El "último comentario" de un resultado clave es el de mayor `Created`; ante igualdad, el de mayor `Id`. Solo se muestra el último (FR-020); no hay historial.
- Se leen solo los del resultado clave cuyo panel se abre, filtrando `ResultadoClaveId` en la consulta (plan, D10). La entidad no cambia.
- **Índice requerido**: la columna `ResultadoClave` de esta lista tiene que estar indexada (plan, P1).

## Cambios en las entidades de `core`

`ResultadoClave`:

```ts
// escritura
Title: this.Nombre,

// tipos (null = vaciar; undefined = no enviar)
public ValorActual?: number | null | undefined;
public Fuente?: string | null | undefined;
public Evidencia?: IUrlValue | null | undefined;
```

La lectura no cambia (`?? undefined`). `ComentarioResultadoClave` no cambia.

## Relaciones

```text
Objetivo (VP RRII) 1 ── N Iniciativa 1 ── N ResultadoClave 1 ── N ComentarioResultadoClave
```

- Las iniciativas de objetivos de otra VP no tienen resultados clave.
- Quitar un resultado clave desde el panel de edición no borra sus comentarios (plan, D15).
