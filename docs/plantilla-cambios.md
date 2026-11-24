# Cambios respecto de la plantilla SPFx

Modificaciones hechas en el código de la plantilla (`src/core` fuera de `src/core/ui`) que no vienen de la plantilla original. Reaplicarlas al actualizar la plantilla.

| Fecha | Archivo | Cambio | Motivo | Feature |
|---|---|---|---|---|
| 2026-11-11 | `src/core/api/useDatasource.ts` | `editItem` y `getById` relanzan el error (helper `handleAsyncAndRethrow`); `addItem` despacha `ERROR` antes de relanzar; el reductor `ERROR` pasa `isLoading` a `false`. | Sin el cambio, la pantalla no distingue un guardado fallido de uno exitoso y el indicador de carga queda encendido tras un error. | 002-palancas-estrategicas |
| 2026-11-24 | `src/core/api/useDatasource.ts` | Método nuevo `reloadItems` (séptimo elemento de `DatasourceHook`): recarga como `getItems`, pero despacha `ERROR` y relanza (`handleAsyncAndRethrow`). `getItems` no cambia. | El botón Actualizar decide si muestra el mensaje de éxito con el resultado de la promesa; `getItems` no relanza y sus usos dependen de eso. | 008-ajustes-vistas |
