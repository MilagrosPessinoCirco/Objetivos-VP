# Research: Ajustes de vistas

Decisiones con alternativas. El detalle de cada una está en [plan.md](./plan.md).

## R1. Cómo compartir el panel de filtros

- **Decisión**: extraer `FiltrosPanel` (panel, borrador, botones, estilos) y hacer que `IniciativasFiltros` y `ObjetivosFiltros` sean envoltorios con sus campos.
- **Por qué**: el panel actual solo es específico de iniciativas por sus campos. El pedido exige reutilizarlo sin duplicarlo ni tocar `src/core/ui`.
- **Alternativas**: copiar `IniciativasFiltros` (duplica); generalizarlo en el lugar con una lista de campos opcional (mezcla dos dominios en un archivo de iniciativas).

## R2. Cómo saber si una recarga terminó bien

- **Hecho**: `useDatasource.getItems` usa `handleAsync`: captura el error, lo deja en `state.error` y resuelve la promesa igual; `Promise.all(...).then` no distingue éxito de fallo. `editItem`, `deleteItem` y `getById` ya relanzan (002, 006).
- **Decisión**: `getItems` pasa a `handleAsyncAndRethrow`. El botón Actualizar espera `Promise.all([...])`: si se resuelve, muestra el éxito; si rechaza, no lo muestra y la vista pinta su error de una línea desde `state.error`. Se registra en `docs/plantilla-cambios.md`.
- **Consecuencia revisada**: los 6 `Promise.all(...).then(setReady)` dejarían la pantalla cargando si una lista falla, y las 19 llamadas sueltas darían rechazos sin atender. Se resuelve con un helper `settleLoads` que espera sin rechazar (el error ya está en el estado) y se usa en todos esos puntos (plan, D4).
- **Alternativas**: hook `useRefreshNotice(isBusy, hasError, onSuccess)` que mira el estado cuando la carga termina (descartada: depende de que el primer render tras el clic ya muestre `isBusy`, y suma un hook con estado); contador propio de cargas en `refresh()` (más código, y no distingue el error de cada carga).

## R3. Dónde vive el estado de filtros

- **Decisión**: `useState` local en `Palancas`, como la búsqueda; se mantiene entre solapas porque el componente no se desmonta.
- **Alternativa**: subirlo a `ObjetivosVp.tsx` como la solapa y la bandeja de iniciativas, para que sobreviva a entrar a un detalle. Más cambios y no fue pedido; queda como supuesto de la spec.

## R4. Años del filtro

- **Decisión**: rango continuo del menor año de inicio al mayor año de compromiso de los objetivos con fechas; los permanentes aportan su año de inicio.
- **Por qué**: igual que la bandeja de iniciativas (`getAnios`), sin huecos. Un permanente cumple desde su año de inicio en adelante dentro de ese rango.

## R5. Paginado

- **Decisión**: paginar en `Palancas` con `IniciativasPaginador` y pasar a `ObjetivosTable` solo las filas de la página.
- **Alternativa**: paginar dentro de `ObjetivosTable`. Obligaría a cambiar su contrato en tres usos (`PalancaDetalle` y "Todas las palancas" no paginan).
