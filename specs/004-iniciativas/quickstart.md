# Quickstart: validación de Iniciativas

Guion de QA manual. Prerrequisitos y condiciones iguales a los del [quickstart de la 003](../003-objetivos/quickstart.md): `npm ci`, workbench hospedado del sitio de desarrollo, escritura solo en las listas de desarrollo y con autorización. Datos en [data-model.md](./data-model.md) y pantallas en [contracts/ui-contracts.md](./contracts/ui-contracts.md).

## Preparación

1. `npm run build` termina sin errores (corre `eslint` y `heft build`).
2. Con mocks (`npm start`, workbench local): los escenarios se pueden recorrer sin SharePoint. Los datos de prueba cubren los casos de D1 del plan.
3. Con las listas de desarrollo:
   - la columna `Area` de `Iniciativa` admite varios valores (confirmado por la usuaria el 2026-11-18);
   - la columna `Iniciativa` de `Comentario iniciativa` está indexada (plan, P1; pasos abajo);
   - la lista `Usuario` tiene al menos dos usuarios activos, uno inactivo, y la persona que prueba;
   - la lista `Area` tiene áreas de más de una gerencia;
   - hay un objetivo de la VP RRII con peso en el departamento, uno de la VP RRII sin peso en el departamento (cargado antes de la 005), uno de otra VP, y uno de la VP RRII con fechas.

## Índice de la columna Iniciativa (plan, P1)

Lo hace la usuaria en el sitio de desarrollo y se repite en cada sitio antes de desplegar.

1. Abrir la lista `Comentario iniciativa` > Configuración (engranaje) > Configuración de la lista.
2. Debajo de las columnas, "Columnas indizadas" > "Crear un nuevo índice".
3. Columna principal: la columna de búsqueda `Iniciativa`. Crear.
4. Verificar que aparece en la lista de columnas indizadas.

## Escenarios

| # | Historia | Pasos | Resultado esperado |
|---|----------|-------|--------------------|
| 1 | US2 | Home > "Mis iniciativas" | Bandeja en la solapa "Mis iniciativas", título "Mis iniciativas", con Volver, búsqueda, Filtros y "Cargar iniciativa". Solo las iniciativas donde la persona es accountable. |
| 2 | US2 | Solapa "Todas" | Título "Todas las iniciativas"; todas las iniciativas. La URL suma `?vista=todas`. |
| 3 | US2 | Observar solapas y contador | Cada solapa muestra su total; "N iniciativas en esta vista" coincide con las filas de la vista. |
| 4 | US2 | Observar la grilla | Columnas ID, Iniciativa, Objetivo (OBJ-nn · nombre), Accountable, Estado (chip, anteúltima) y Ver. IDs `INI-nn`, ordenados. |
| 5 | US2 | Más de 10 iniciativas en la vista | Se ven de a 10; al pie, "Mostrando 1–10 de N" a la izquierda y el paginador centrado (primera, anterior, números, siguiente, última). En la página 1, primera y anterior deshabilitadas. |
| 6 | US2 | Vista con 10 o menos | Sin paginador. |
| 7 | US2 | Lista vacía (mock o lista sin datos) | "No hay iniciativas cargadas." |
| 8 | US3 | Buscar "ini-0" y parte de un nombre en mayúsculas | Solo las que coinciden; el contador cambia; las cantidades de las solapas no. |
| 9 | US3 | Filtros > elegir valores sin "Aplicar" | La grilla no cambia. Con "Aplicar", se filtra y el panel se cierra. |
| 10 | US3 | Filtro Departamento | Solo iniciativas cuyo objetivo es de ese departamento. |
| 11 | US3 | Iniciativa 2026–2028; filtrar 2026, 2027, 2028, 2025, 2029 | Aparece en los tres primeros, no en los dos últimos. Las opciones de Año van del año de inicio más antiguo al de compromiso más lejano, sin huecos. |
| 12 | US3 | Filtros sin coincidencias | "No hay iniciativas con estos filtros.", sin la línea "Probá cambiar o limpiar los filtros." |
| 13 | US3 | Con búsqueda y filtros, cambiar de solapa | Se mantienen aplicados. |
| 14 | US3 | Estar en la página 3 y aplicar un filtro | Vuelve a la página 1. |
| 15 | US3 | "Limpiar filtros" | Quedan solo la búsqueda y la solapa. |
| 16 | US1 | Bandeja > "Cargar iniciativa" | Panel de una columna: Objetivo sin elegir, Nombre, Descripción / impacto esperado, Accountable con la persona actual, Áreas involucradas, fechas lado a lado. Sin Estado ni Peso. Pie Cancelar · "Cargar iniciativa". Sin subtítulo. |
| 17 | US1 | "Cargar iniciativa" con todo vacío | No guarda; cada obligatorio dice "Este campo es obligatorio." en línea. |
| 18 | US1 | Compromiso anterior a inicio | Error en la fecha de compromiso. Igual a inicio: se admite. |
| 19 | US1 | Objetivo con fechas; inicio anterior o compromiso posterior a las del objetivo | Error en la fecha fuera de rango, con el rango del objetivo. Fechas iguales a las del objetivo: se admiten. |
| 20 | US1 | Accountable: agregar tres personas y quitar a la persona actual | Se admite; ofrece los usuarios activos de la lista `Usuario`. |
| 21 | US1 | Áreas involucradas | Ofrece todas las áreas del maestro; admite varias o ninguna. |
| 22 | US1 | Datos válidos > "Cargar iniciativa" | Modal "Estás por cargar la iniciativa. ¿Querés continuar?" con Cancelar y Aceptar. Cancelar: vuelve al panel con los datos. |
| 23 | US1 | Aceptar | El panel se cierra, la persona sigue en la bandeja, ve «La iniciativa "[nombre]" se ha cargado correctamente.» y la iniciativa aparece en "No iniciada". En la lista, `Title` = Nombre y `Area` con varios valores. |
| 24 | US1 | Error al guardar (mock que rechaza o sin permisos) | Una línea de error; no hay éxito; el panel conserva lo ingresado. |
| 25 | US4 | Abrir una iniciativa de un objetivo de la VP RRII desde la bandeja | Migas Inicio › Palancas › palanca › objetivo › iniciativa (enlaces menos el último). Encabezado Volver, "INI-nn · nombre", chip. Sin avance ni "Ubicación en la estrategia". "Información de la iniciativa" expandida y "Comentario ejecutivo" contraída. Pie Cancelar · Editar · Cambiar estado. |
| 26 | US4 | Objetivo de la VP RRII que pesa 40 % con 4 iniciativas no canceladas | Peso en el objetivo 25 %, Peso en el departamento 10 %, en ese orden. |
| 27 | US4 | Objetivo de la VP RRII que pesa 40 % con 3 no canceladas | 33,33 % y 13,33 %. |
| 28 | US4 | Objetivo de la VP RRII sin peso en el departamento | Peso en el departamento "—". |
| 29 | US4 | Iniciativa cancelada, o de un objetivo de otra VP | Sin ninguno de los dos pesos. Otra VP: migas sin el nivel de palanca. |
| 30 | US4 | Expandir "Comentario ejecutivo" sin comentarios | "Todavía no hay comentario ejecutivo." |
| 31 | US4 | Volver y Cancelar, entrando desde la bandeja en "Todas" | Vuelven a la bandeja en "Todas", con la búsqueda y los filtros que tenía. |
| 32 | US4 | Abrir `#/iniciativa/<id>` directo y elegir Volver | Va al detalle del objetivo de la iniciativa. |
| 33 | US4 | `#/iniciativa/99999` | "No se encontró la iniciativa." y Volver. |
| 34 | US5 | Detalle de un objetivo de la VP RRII con 4 no canceladas y 1 cancelada | Sección "Iniciativas (5)" con "+" y grilla ID, Iniciativa, Accountable, Peso, Estado, Ver. Las 4 con 25 %; la cancelada sin peso. |
| 35 | US5 | Detalle de un objetivo de otra VP | Grilla sin la columna Peso. |
| 36 | US5 | Objetivo sin iniciativas | "Este objetivo no tiene iniciativas cargadas." |
| 37 | US5 | "+" > cargar | Panel con el objetivo elegido; al aceptar, sigue en el detalle del objetivo, ve el mensaje de éxito y la grilla la incluye con los pesos recalculados (de 4 a 5 no canceladas: 20 % cada una). |
| 38 | US6 | Detalle > Editar (y el lápiz de la información) | Panel con los datos actuales, Objetivo en modo lectura, Estado visible, pie Cancelar · "Guardar cambios". |
| 39 | US6 | Cambiar nombre, accountable, áreas (quitar todas) y fechas > Guardar cambios > Aceptar | Modal "Estás por guardar los cambios de la iniciativa. ¿Querés continuar?"; luego el detalle refleja los cambios y se ve «La iniciativa "[nombre]" se ha actualizado correctamente.». En la lista, `Title` = nombre nuevo y `Area` vacía. |
| 40 | US6 | Editar el estado a Cancelada | Las demás iniciativas no canceladas del objetivo suben de peso. Volver a "En curso": bajan. |
| 41 | US7 | "Cambiar estado" o el lápiz del comentario | Panel con Estado (el actual) y Comentario ejecutivo precargado con el último. |
| 42 | US7 | Elegir Frenada, escribir un comentario, "Cambiar estado" | Modal "Estás por cambiar el estado de la iniciativa "[nombre]" de En curso a Frenada. ¿Querés continuar?". Aceptar: el panel se cierra, se ve «El estado de la iniciativa "[nombre]" se ha actualizado correctamente.», chip Frenada y el comentario con fecha y autor; en `Comentario iniciativa` hay un elemento nuevo y el anterior sigue. En la red, la consulta de comentarios filtra por `IniciativaId`. |
| 43 | US7 | Cambiar solo el comentario | Se registra el comentario nuevo; el estado no cambia. |
| 44 | US7 | Cambiar solo el estado | No se registra un comentario nuevo; se sigue viendo el anterior. |
| 45 | US7 | Cancelar en el modal o en el panel | No se registra nada. |
| 45a | US7 | Borrar el comentario (dejarlo vacío) y aceptar sin cambiar el estado | No se registra nada; el panel se cierra sin mensaje y se sigue viendo el comentario anterior. |
| 45b | US2 | Usuario de prueba con el mismo nombre visible que otro accountable | "Mis iniciativas" lista solo las del usuario actual (se compara por Id, no por nombre). |
| 46 | — | Revisar todas las pantallas | No hay acción para eliminar iniciativas (SC-007). |
| 47 | — | Comparar con palancas y objetivos | Mismo encabezado, grilla, columna Ver, chips, carga, vacíos, errores, migas, secciones, pie y panel (SC-009). |

## Revisión visual

Comparar con el prototipo (`scr.iniciativas`, `showFilters`, `sideIni`, `scr.iniciativa`, `o_inis`) las aproximaciones A1 a A4 del plan y anotar las diferencias para decidir en la revisión.
