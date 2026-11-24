# Data Model: Ajustes de vistas

**Sin cambios.** Esta feature no agrega listas, columnas ni entidades, y no cambia las existentes.

## Datos que usan los filtros y la solapa nueva

| Dato | Entidad | Uso |
|---|---|---|
| `Palanca.Id`, `Palanca.Activa` | Palanca | Opciones y filtro Palanca (solo activas) |
| `Departamento.Id`, `Nombre` | Departamento | Opciones y filtro Departamento |
| `Gerencia.Id`, `Nombre`, `Departamento` | Gerencia | Opciones del filtro Gerencia, acotadas por el departamento elegido |
| `Objetivo.Estado` | Objetivo | Filtro Estado (cuatro valores del enum `Estado`) |
| `Objetivo.Duracion`, `FechaInicio`, `FechaCompromiso` | Objetivo | Filtro Año y lista de años |
| `Objetivo.Palanca`, `Departamento`, `Gerencia`, `VP`, `Peso`, `EsDeVp` | Objetivo | Filtros y columnas de "Todos los objetivos" |
| Resultados clave e iniciativas | Resultado clave, Iniciativa | Avance en la grilla (sin cambios) |

## Estado de pantalla (no persistente)

- `IObjetivosFiltros`: `palancaId`, `departamentoId`, `gerenciaId`, `estado`, `anio` (texto; vacío = sin filtro). Vive en memoria en `Palancas`.
- Página actual de las grillas de objetivos (entero, desde 1).
