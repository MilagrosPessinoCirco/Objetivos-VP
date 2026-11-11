# Contratos de interfaz: Objetivos

Rutas, props de las piezas y mocks. Las claves de texto se definen en las tareas, en `loc/mystrings.d.ts` y `loc/en-us.js`, con la misma sincronía que en la 002.

## 1. Rutas (`components/ObjetivosVp/routes.ts`)

| Constante / función | Valor | Pantalla |
|---|---|---|
| `OBJETIVO_NEW_PATH` | `/objetivo/new` | `ObjetivoForm` (alta). Acepta `?palanca=<id>`. |
| `OBJETIVO_DETAIL_PATH` | `/objetivo/:id` | `ObjetivoDetalle` |
| `OBJETIVO_EDIT_PATH` | `/objetivo/:id/edit` | `ObjetivoForm` (edición) |
| `getObjetivoNewPath(palancaId?)` | `/objetivo/new` o `/objetivo/new?palanca=<id>` | — |
| `getObjetivoPath(id)` | `/objetivo/<id>` | — |
| `getObjetivoEditPath(id)` | `/objetivo/<id>/edit` | — |

Las rutas existentes no cambian.

## 2. Props de las piezas

```ts
// ObjetivosVp.tsx: nuevas constantes y estado
const CAN_CREATE_OBJETIVO = true;
const CAN_EDIT_OBJETIVO = true;
type ObjetivosFiltro = 'todos' | 'delVp';   // useState, valor inicial 'todos'

// Palancas
interface IPalancasProps { canManage: boolean; canCreateObjetivo: boolean; filtro: ObjetivosFiltro; onFiltroChange: (f: ObjetivosFiltro) => void; }
// PalancaDetalle
interface IPalancaDetalleProps { canManage: boolean; canCreateObjetivo: boolean; filtro: ObjetivosFiltro; }
// ObjetivoDetalle
interface IObjetivoDetalleProps { canEditObjetivo: boolean; }
// ObjetivoForm: sin props, el modo sale de la ruta (useParams)
// ObjetivosTable: tabla compartida
interface IObjetivosTableProps {
  objetivos: Objetivo[];
  variant: 'palanca' | 'otrasVp';   // columnas Peso o VP
  emptyText: string;
  onView: (id: number) => void;
}
// PalancaBreadcrumb: props nuevas, opcionales
interface IPalancaBreadcrumbProps { palancaNombre?: string; palancaId?: number; objetivoNombre?: string; }
// NombreAyuda
interface INombreAyudaProps { open: boolean; onToggle: () => void; }
```

## 3. Comportamiento de `PalancaBreadcrumb`

| Props | Resultado |
|---|---|
| ninguna | Inicio > Palancas |
| `palancaNombre` | Inicio > Palancas > palancaNombre (actual). Igual que hoy. |
| `palancaNombre`, `palancaId`, `objetivoNombre` | Inicio > Palancas > palancaNombre (link al detalle de la palanca) > objetivoNombre (actual). |
| `objetivoNombre` | Inicio > Palancas > objetivoNombre (actual). Objetivo de otra VP. |

## 4. Mocks (principio III)

| Archivo | Datos |
|---|---|
| `core/api/Objetivo/ObjetivoMock.ts` | Objetivos de la VP RRII (con y sin `EsDeVp`, uno con palanca inactiva) y de otras VP, del prototipo (`D.objs`). Estado a nivel de módulo. `add` asigna el siguiente Id; `edit` y `getById` rechazan con `status: 404` si no existe. |
| `core/api/Vicepresidencia/VicepresidenciaMock.ts` | VP RRII y tres VP más, activas, y una inactiva. |
| `core/api/Departamento/DepartamentoMock.ts` | Departamentos del prototipo. |
| `core/api/Gerencia/GerenciaMock.ts` | Gerencias con su `Departamento`. |

Cada hook (`use<E>DataSource`) pasa su mock como segundo argumento.

## 5. Datos de un objetivo al guardar

| VP | Se envían | No se envían (sin valor) |
|---|---|---|
| VP RRII | Todos los campos de la spec | — |
| Otra VP | VP, Departamento, Gerencia, Nombre, Descripción, Estado | Palanca, Duración, Peso, Fechas, Objetivo del VP |
