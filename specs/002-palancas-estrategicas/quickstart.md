# Quickstart: validación de Palancas estratégicas

Guía para comprobar la feature de punta a punta. Los contratos están en [contracts/ui-contracts.md](./contracts/ui-contracts.md) y el modelo en [data-model.md](./data-model.md).

## Requisitos

- Node `>=22.14.0 <23.0.0` (`engines` de `package.json`) y dependencias instaladas con `npm ci`, que incluye `react-router-dom 6.30.6`.
- Rama `002-palancas-estrategicas` con el merge de `Router` (`ce61724`) y T000 (`8ebcbd1`).
- Para la prueba contra SharePoint: un sitio de desarrollo con la lista `Palanca` y sus columnas `Title`, `Nombre`, `Descripcion` y `Activa`, y permiso de escritura en ella. No se usa un sitio de producción.

## 1. Compilación

```powershell
npm run build
```

Esperado: lint y `heft build --clean` sin errores.

## 2. Con el mock (workbench local)

```powershell
npm start
```

Abrir el workbench que indica la consola. Fuera de SharePoint, `usePalancaDataSource` usa `PalancaMock` con cuatro palancas activas y una inactiva ("Eficiencia en el canal").

| # | Paso | Resultado esperado | Requisito |
|---|---|---|---|
| 1 | En la home, activar "Palancas y objetivos" | Se abre "Galería de palancas estratégicas" y la URL termina en `#/palanca` | FR-001 |
| 1b | Ver la home | Cinco accesos: "Mis tareas", "Mis iniciativas", "Palancas y objetivos", "Tablero VP" y "ABM" | spec 001 FR-006 |
| 2 | Activar los otros cuatro accesos y "Manual de usuario" | No pasa nada | FR-001 (001 FR-010) |
| 3 | Mirar la grilla | Cuatro palancas, ordenadas por nombre, con ID `PAL-n`, Palanca, Descripción y Acciones. "Eficiencia en el canal" no aparece. No hay columna Objetivos, ni Filtros, ni Pesos, ni "Cargar objetivo". | FR-002, FR-020 |
| 4 | Buscar "experiencia", después "pal-2" y después "2" | Se filtra por nombre o ID, sin importar mayúsculas | FR-004 |
| 5 | Buscar "zzz" | "No hay palancas con esta búsqueda." (una sola línea) | FR-004a |
| 6 | Buscar "eficiencia" | Sin resultados: las inactivas no aparecen en la búsqueda | US4-5 |
| 7 | "Nueva palanca" | Modal "Nueva palanca", con la nota "Las palancas no se eliminan: se marcan como inactivas.", campos vacíos y Activa = Sí | FR-008, FR-009 |
| 8 | "Guardar" con los campos vacíos y después con solo espacios | No se guarda; "Este campo es obligatorio." en Nombre y en Descripción | FR-010 |
| 9 | Completar los campos y "Cancelar" | No se agrega nada | FR-013 |
| 10 | Completar los campos y "Guardar" | Aviso «La palanca "X" se ha cargado correctamente.»; la palanca aparece con un ID nuevo | FR-011, FR-012 |
| 11 | Alta con Activa = No | Se guarda y no aparece en la grilla | US2-5 |
| 12 | "Editar palanca" en una fila | Modal "Editar palanca PAL-n" con los datos actuales; al guardar, aviso «… se ha actualizado correctamente.» y la fila actualizada | US3, FR-012 |
| 13 | Editar con Activa = No | La palanca desaparece de la grilla | FR-014 |
| 14 | "Actualizar" con una búsqueda escrita | Se recarga la grilla y la búsqueda se conserva | FR-004 |
| 15 | "Ver palanca" | La URL termina en `#/palanca/<Id>`. Detalle con migas "Inicio › Palancas › nombre", "Volver", título "PAL-n · nombre", chip "Activa", "Información general" (ID, Palanca, Activa, Descripción) y pie "Cancelar" · "Editar" | FR-005 a FR-007 |
| 16 | Miga "Inicio" / miga "Palancas" / "Volver" / "Cancelar" | Home / grilla / grilla / grilla | US1-5 |
| 17 | En el detalle, "Editar", Activa = No, "Guardar" | Aviso de éxito; el detalle sigue abierto con el chip "Inactiva" y Activa = No. Al volver a la grilla, la palanca ya no aparece. | US4-3 |
| 18 | Revisar todas las pantallas | No hay acción para eliminar | FR-015 |
| 19 | Grilla con "Volver" | Vuelve a la home (`#/`) | US1-6 |
| 20 | Escribir a mano `#/palanca/abc` y `#/palanca/999` | "No se encontró la palanca." (con 999, después de consultar el mock) | edge case |
| 21 | Escribir a mano `#/palanca/new` y `#/palanca/edit/1` | Ya no aparecen las pantallas provisorias de la rama `Router`. `#/palanca/new` cae en el detalle y muestra "No se encontró la palanca.". `#/palanca/edit/1` no coincide con ninguna ruta y la pantalla queda vacía, igual que cualquier ruta inexistente del router. | plan, rutas |
| 22 | Escribir a mano `#/palanca/5` (la inactiva del mock) | Detalle con el chip "Inactiva" (research D8b) | — |

Estado vacío sin palancas activas ("No hay palancas cargadas."): se ve inactivando las cuatro palancas del mock (paso 13). Para volver al estado inicial, recargar el workbench.

## 3. Contra SharePoint (sitio de desarrollo)

Requiere autorización explícita para escribir en la lista del sitio de desarrollo. Repetir los pasos 1 y 3 a 19 sobre la lista real y verificar además:

| # | Verificación | Resultado esperado |
|---|---|---|
| S1 | Abrir la lista `Palanca` después del paso 10 | Nuevo ítem con `Nombre`, `Descripcion`, `Activa` = Sí y `Title` igual a `Nombre` (C4) |
| S2 | Después del paso 12 | `Title` acompaña el cambio de nombre |
| S3 | Reactivar en la lista una palanca inactiva (`Activa` = Sí) y usar "Actualizar" | Vuelve a aparecer en la grilla |
| S4 | Simular un fallo de guardado (por ejemplo, con permisos de solo lectura en la lista) | El modal sigue abierto con los datos y muestra "No se pudo guardar la palanca."; no aparece el aviso de éxito (FR-016, C2) |
| S5 | Simular un fallo de carga (lista sin permiso de lectura) | "No se pudieron cargar las palancas." |
| S6 | Con la grilla abierta, eliminar un ítem desde la lista de SharePoint y elegir "Ver palanca" en esa fila sin actualizar | "No se encontró la palanca." |
| S7 | Tiempos con el volumen real | Grilla y detalle en menos de 3 s (SC-006) |

## 4. Revisión visual

Comparar lado a lado con `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/index.html` (servidor local según su `LEEME.md`): grilla (`Palancas y objetivos`), detalle de una palanca y modal de edición. Las únicas diferencias admitidas son los elementos excluidos por FR-020, las migas de pan (desvío aprobado) y las aproximaciones A1–A5 del plan.
