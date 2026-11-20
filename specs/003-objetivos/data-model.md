# Data Model: Objetivos

Las entidades ya existen en `src/core/entities`. Esta feature cambia solo `Objetivo` (Title). Los internal names de las columnas son los que ya usan los datasources; no se infieren de los display names.

## Objetivo (`Lista.Objetivo`)

| Atributo (entidad) | Tipo | Oblig. en la spec | Notas |
|---|---|---|---|
| `Id` | número | sí, asignado por la lista | Se muestra como `OBJ-<dos dígitos>`. No editable. |
| `Title` | texto | no se pide al usuario | Recibe el valor de `Nombre` al crear y al editar (FR-018). |
| `Nombre` | texto, 255 | sí | — |
| `Descripcion` | texto largo | sí | — |
| `VP` | lookup a Vicepresidencia (`Id`, `Title`) | sí | Se elige solo en el alta; solo lectura al editar (FR-004a). |
| `Departamento` | lookup a Departamento | sí | — |
| `Gerencia` | lookup a Gerencia | sí | Debe pertenecer al departamento elegido (filtro en pantalla). |
| `Estado` | opción | sí | "No iniciada" al crear, modificable. Valores de `Constants.Estado`: No iniciada, En curso, Finalizado cumplido, Finalizado incumplido. |
| `Palanca` | lookup a Palanca | solo VP RRII | Vacío en otra VP. |
| `Duracion` | opción (Anual, Plurianual, Permanente) | solo VP RRII | Vacío en otra VP. |
| `Peso` | número 0 a 100 | solo VP RRII | Sin validar la suma entre objetivos. |
| `EsDeVp` (columna interna `EsDelVp`) | sí/no | solo VP RRII | Por defecto No. Vacío o falso en otra VP. |
| `FechaInicio` | fecha | solo VP RRII | — |
| `FechaCompromiso` | fecha | solo VP RRII | No anterior a `FechaInicio`. |
| `CantidadAnios` | número | no (fuera de la spec) | No se muestra ni se envía. |

**Reglas por tipo**: un objetivo de otra VP se guarda con `Palanca`, `Duracion`, `Peso`, `FechaInicio`, `FechaCompromiso` y `EsDeVp` sin valor. Un objetivo es de la VP RRII si `VP.Title` es `VP_RRII_NOMBRE` (plan, D2).

**Estados**: No iniciada, En curso, Finalizado cumplido, Finalizado incumplido. Cambian manualmente, sin restricción de orden (la spec no define transiciones).

**Eliminación**: no existe. El datasource tiene `delete` porque lo exige `IDatasource`; la UI no lo usa.

## Maestros (solo lectura en esta feature)

| Entidad | Lista | Atributos usados |
|---|---|---|
| Vicepresidencia | `Lista.Vicepresidencia` | `Id`, `Nombre`, `Activo` (el formulario ofrece las activas) |
| Departamento | `Lista.Departamento` | `Id`, `Nombre` |
| Gerencia | `Lista.Gerencia` | `Id`, `Nombre`, `Departamento` (lookup) |
| Palanca | `Lista.Palanca` | `Id`, `Nombre`, `Activa` (ver feature 002) |

## Relaciones

- Una Gerencia pertenece a un Departamento; un Objetivo apunta a una VP, un Departamento y una Gerencia.
- Un Objetivo de la VP RRII apunta a exactamente una Palanca; una Palanca agrupa 0..N objetivos.
- Un Objetivo de otra VP no apunta a ninguna Palanca.
- Las iniciativas (feature posterior) apuntarán a un Objetivo.

## Cambios a las entidades y constantes

| Archivo | Cambio |
|---|---|
| `src/core/utils/Constants.ts` | `VP_RRII_NOMBRE` = "VP RRII". `Estado` suma `NoIniciada = "No iniciada"` (solo lo usa `Objetivo`); la columna `Estado` de la lista debe tener ese valor. |
| `src/core/entities/Objetivo.ts` | `toListItem` envía `Title: this.Nombre` y escribe `Duracion` solo si tiene valor: hoy `assertChoiceValue` falla con `undefined`, y un objetivo de otra VP no tiene duración. |
