# Cambios respecto de la plantilla SPFx

Modificaciones hechas en el código de la plantilla (`src/core` fuera de `src/core/ui`) que no vienen de la plantilla original. Reaplicarlas al actualizar la plantilla.

| Fecha | Archivo | Cambio | Motivo | Feature |
|---|---|---|---|---|
| 2026-11-11 | `src/core/api/useDatasource.ts` | `editItem` y `getById` relanzan el error (helper `handleAsyncAndRethrow`); `addItem` despacha `ERROR` antes de relanzar; el reductor `ERROR` pasa `isLoading` a `false`. | Sin el cambio, la pantalla no distingue un guardado fallido de uno exitoso y el indicador de carga queda encendido tras un error. | 002-palancas-estrategicas |
| 2026-11-24 | `src/core/entities/Tarea.ts` | Suma `QueHabilita`, `ComentarioEjecutivo`, `ComentarioEjecutivoFecha`, `ComentarioEjecutivoAutor` y `FechaUltimaActualizacion`; `Area` pasa a lista; `Prioridad` admite `null`; `toListItem` envía `Title`, omite `Estado` y `Prioridad` sin definir y deja de enviar `RequiereInversion`. | Que la entidad guarde lo que pide la spec con objetos parciales. | 007-tareas |
| 2026-11-24 | `src/core/api/Tarea/TareaDataSource.ts` | El `select` suma `QueHabilita`, `ComentarioEjecutivo`, `ComentarioEjecutivoFecha`, `ComentarioEjecutivoAutor` (con su `expand`) y `FechaUltimaActualizacion`, y pide solo `Area/Id` (no `Area/Title`). `add` y `edit` escriben con `toListItem()`, incluidas todas las áreas. | Leer y guardar lo que la entidad ahora mapea. `Area/Title` no se puede proyectar porque el campo mostrado de la lookup es `Nombre`; los nombres de las áreas se resuelven con el maestro, como en `IniciativaDataSource`. | 007-tareas |
| 2026-11-24 | `src/core/api/Tarea/useTareaDataSource.ts`, `useItemTareaDataSource.ts` | Pasan `TareaMock` como segundo argumento. | Principio III: construir pantallas sin las listas. | 007-tareas |
| 2026-11-24 | `src/core/api/AvanceTarea/useAvanceTareaDataSource.ts`, `useItemAvanceTareaDataSource.ts` | Pasan `AvanceTareaMock` como segundo argumento. | Ídem. | 007-tareas |
| 2026-11-24 | `src/core/api/Tarea/TareaMock.ts`, `useTareasIniciativa.ts`; `src/core/api/AvanceTarea/AvanceTareaMock.ts`, `useAvancesTarea.ts` | Archivos nuevos: mocks y lecturas filtradas. | Principio III y consultas por iniciativa y por tarea. | 007-tareas |
| 2026-11-24 | `src/core/utils/Mappers.ts` | `toLookupValueArray` acepta un lookup único (un objeto con `Id`) además de una lista o `{ results }`. | La columna `Area` de la lista `Tarea` sigue siendo de valor único mientras no se cumplan los preparativos P1 a P3. Afecta a toda entidad que use esa función. | 007-tareas |
