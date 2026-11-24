# Validación: Ajustes de vistas

Registro de la validación final (T018 a T020). Los escenarios son los de [quickstart.md](./quickstart.md). Fecha: 2026-11-24.

## Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `npm run build` (tipos, lint, webpack) al cierre de cada fase y al final | Sin errores |
| `Grep` de `useRefreshNotice`, `settleLoads` y `DEFAULT_PROGRESS` en `src/` | Sin resultados |
| Diff de `src/core/api/useDatasource.ts` contra `main` | Solo agrega `reloadItems` (séptimo elemento de `DatasourceHook`); `getItems` y los otros métodos no cambian |
| `docs/plantilla-cambios.md` | Fila nueva del método `reloadItems` (feature 008) |
| Lógica de filtros (`objetivoFiltros.ts`) ejecutada con datos del mock, antes y después de agregar objetivos | Años 2026–2027; Año 2027 = objetivos 2 y 4; Año 2025 vacío; otras VP excluidas con Palanca o Año |
| `useDatasource` real ejecutado con un datasource que falla | `reloadItems` rechaza con error y `getItems` resuelve como antes; el refresh muestra el mensaje solo si todas las cargas se resuelven |
| Aritmética del paginado (25 filas, página 3, filtro a 8 filas, 0 filas, 10 filas) | Correcta |
| Textos de los cuatro modales y del resumen contra FR-016, FR-020 y FR-021 | Coinciden exactamente |

## Escenarios verificados por la usuaria

| Escenarios | Dónde | Observación |
|---|---|---|
| 1 a 10 y 9b (US1) | Workbench | La bandeja de iniciativas se comporta como antes, con "Limpiar". |
| 11 a 16 (US2) | Workbench | El 14 se probó con el mock ampliado a 18 objetivos (11 de la VP RRII, 4 de otras VP). |
| 17, 18 y 19b (US3 y US4) | Workbench con mocks | |
| 19 y 19c (US4) | Sitio de desarrollo, con la red cortada | Solo lecturas; sin escrituras. |
| 20 a 26 (US5) | Workbench | |

## Pendiente

- **Escenario 3b** (filtro por Gerencia en "Todas las palancas"): la usuaria informó "1 a 10", pero no lo nombró aparte. Confirmar que se probó.
- **Escenarios de US1, US2 y US5 contra datos reales de SharePoint**: se informaron en el workbench, sin aclarar si con mocks o con el sitio de desarrollo. No hay escrituras de la feature que requieran autorización especial: los guardados de US5 usan los métodos de siempre.
- **Documento funcional**: una diferencia de la v1.10, ver abajo.

## T020: documento funcional v1.10 contra lo implementado

`docs/especificacion-funcional.md` (v1.10, commit `5980331`) coincide con lo implementado en: solapas y cantidades, columnas y "—" / "No aplica" de "Todos los objetivos", paginado de 10, panel de filtros y su comportamiento, resumen sin avance, confirmaciones de RF-01, RF-03 y la edición de objetivo, y el criterio de Actualizar de RNF-06.

**Diferencia encontrada (heredada de la v1.9, no introducida por esta feature):** RF-02 dice "Solo muestra palancas activas, salvo que se filtre por año". Lo implementado, y lo que dice la spec de esta feature (casos límite), es que "Todas las palancas" nunca muestra palancas inactivas, ni siquiera filtrando por Año; los objetivos de una palanca inactiva sí aparecen en las otras solapas. La spec 002 ya había dejado esa frase pendiente ("queda para la feature de objetivos"). Propuesta, sin aplicar: reemplazarla por "Solo muestra palancas activas; los objetivos de una palanca inactiva se ven en las solapas de objetivos."
