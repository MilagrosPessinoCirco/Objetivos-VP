# Data Model: Palancas estratégicas

## Entidad `Palanca`

Definida una sola vez en `src/core/entities/Palanca.ts` (existe). Lista de SharePoint: `Lista.Palanca` (`"Palanca"`, en `src/core/utils/Constants.ts`). La lista ya existe (fuera de alcance crearla).

| Campo (spec) | Propiedad | Columna SPO (internal name) | Tipo | Oblig. | Regla |
|---|---|---|---|---|---|
| ID | `Id` | `Id` | número | Sí | Lo asigna SharePoint al crear. No se edita (FR-011). Se muestra como `PAL-<Id>` (research D6). |
| Nombre | `Nombre` | `Nombre` | texto (una línea) | Sí | No vacío ni solo espacios (FR-010). Se guarda sin espacios al inicio ni al final. Sin validación de unicidad. |
| Descripción | `Descripcion` | `Descripcion` | texto largo | Sí | No vacía ni solo espacios (FR-010). Se guarda sin espacios al inicio ni al final. |
| Activa | `Activa` | `Activa` | Sí / No (boolean) | Sí | En el alta, `true` por defecto (FR-009). |
| — | `Titulo` | `Title` | texto | — | Copia de `Nombre` al crear y al editar (research D5). No se muestra. |
| — | `Created`, `Modified`, `Author`, `Editor` | columnas del sistema | — | — | Solo lectura (RNF-09). No se muestran en esta feature. |

### Cambio en la entidad

`toListItem()` envía `Title: this.Nombre` en lugar del `Title` vacío heredado de `BaseEntity`. El resto del mapeo no cambia.

## Estados

La palanca no tiene estado de avance. El único atributo de ciclo de vida es `Activa`:

```text
           alta (Activa = Sí por defecto)
                      │
                      ▼
   ┌──────────────► Activa ──── editar: Activa = No ───► Inactiva
   │                                                         │
   └──── reactivar: solo en la lista de SharePoint ◄─────────┘
```

- **Activa**: aparece en la grilla y se puede editar e inactivar.
- **Inactiva**: no aparece en la grilla ni en la búsqueda. Si se inactivó desde el detalle, el detalle sigue abierto mostrando "Inactiva" hasta salir. No hay forma de volver a abrirla desde la app (spec, aclaración P1-A).
- **Eliminada**: no existe. La app no ofrece eliminar (FR-015).

## Relaciones

- Una palanca agrupará 0..N objetivos de la VP RRII. La relación la implementa la feature de objetivos; esta feature no la lee ni la muestra.

## Validaciones del formulario

| Campo | Cuándo | Mensaje en línea |
|---|---|---|
| Nombre | Al intentar guardar, si está vacío o solo tiene espacios | "Este campo es obligatorio." |
| Descripción | Ídem | "Este campo es obligatorio." |

Activa siempre tiene valor (Sí / No), así que no necesita validación.
