# Quickstart: validación de Resultados clave y cálculo de avance

Guion de QA manual. Prerrequisitos y condiciones iguales a los del [quickstart de la 004](../004-iniciativas/quickstart.md): `npm ci`, workbench hospedado del sitio de desarrollo, escritura solo en las listas de desarrollo y con autorización. Datos en [data-model.md](./data-model.md) y pantallas en [contracts/ui-contracts.md](./contracts/ui-contracts.md).

## Preparación

1. `npm run build` termina sin errores (corre `eslint` y `heft build`).
2. Con mocks (`npm start`, workbench local): los escenarios se pueden recorrer sin SharePoint. Los datos de prueba cubren los casos de D1 del plan:
   - objetivo 1: tres iniciativas con avance 70 %, 90 % y 60 % (objetivo 73 %, amarillo);
   - un objetivo de la VP RRII con una iniciativa cancelada con resultados clave, una iniciativa sin resultados clave y una finalizada;
   - resultados clave en los cinco estados (Sin dato, No cumple, Mínimo, Meta, Máximo), uno con sobrecumplimiento y uno con mínimo = meta = máximo;
   - una iniciativa de otra VP.
3. Con las listas de desarrollo:
   - la lista `Resultado clave` tiene las columnas del data model y ni `Responsable`, ni `Peso`, ni `Descripcion` son obligatorias (plan, P2; pasos abajo);
   - la columna `ResultadoClave` de `Comentario resultado clave` está indexada (plan, P1; pasos abajo);
   - hay un objetivo de la VP RRII con iniciativas, una iniciativa de la VP RRII sin resultados clave (cargada con la 004) y una iniciativa de un objetivo de otra VP;
   - los links de evidencia de prueba son de `sharepoint.com` u otro dominio de confianza (plan, P3).

## Verificar las columnas de Resultado clave (plan, P2)

1. Abrir la lista `Resultado clave` > Configuración (engranaje) > Configuración de la lista.
2. Revisar en Columnas que existan, con estos nombres internos: `Nombre`, `TipoMedicion`, `UnidadMedida`, `Minimo`, `Meta`, `Maximo`, `ValorActual`, `Fuente`, `Evidencia`, `ValorProyectado` e `Iniciativa`.
3. Revisar que `Responsable`, `Peso` y `Descripcion` no estén marcadas como obligatorias. Si alguna lo está o falta una columna, avisar antes de seguir: no se cambia ninguna columna sin consulta.

## Índice de la columna ResultadoClave (plan, P1)

Lo hace la usuaria en el sitio de desarrollo y se repite en cada sitio antes de desplegar.

1. Abrir la lista `Comentario resultado clave` > Configuración (engranaje) > Configuración de la lista.
2. Debajo de las columnas, "Columnas indizadas" > "Crear un nuevo índice".
3. Columna principal: la columna de búsqueda `ResultadoClave`. Crear.
4. Verificar que aparece en la lista de columnas indizadas.

## Escenarios

| # | Historia | Pasos | Resultado esperado |
|---|----------|-------|--------------------|
| 1 | US1 | Bandeja > "Cargar iniciativa", sin elegir objetivo | No aparece el bloque "Resultados clave". |
| 2 | US1 | Elegir un objetivo de la VP RRII | Después de los campos de la iniciativa aparece la banda "Resultados clave" con "+", y un resultado clave ("Resultado clave 1") sin botón de quitar: nombre a todo el ancho, Tipo de medición \| Unidad, Mínimo \| Meta \| Máximo. Sin campo de peso, sin responsable, sin descripción y sin textos de ayuda. |
| 3 | US1 | Elegir un objetivo de otra VP | El bloque desaparece. Volver a uno de la VP RRII: reaparece con lo cargado. |
| 4 | US1 | "+" dos veces | Aparecen "Resultado clave 2" y "3", cada uno con su botón de quitar. Quitar el 2: el 3 pasa a ser el 2. |
| 5 | US1 | "Cargar iniciativa" con el resultado clave vacío | No guarda; cada campo del resultado clave muestra "Este campo es obligatorio.". |
| 6 | US1 | Mínimo 10, Meta 5, Máximo 100 | Error en Meta: "La meta no puede ser menor que el mínimo.". |
| 7 | US1 | Mínimo 10, Meta 50, Máximo 20 | Error en Máximo: "El máximo no puede ser menor que la meta.". |
| 8 | US1 | Máximo 0 (con mínimo y meta en 0) | Error en Máximo: "El máximo debe ser mayor que 0.". |
| 9 | US1 | Mínimo = Meta = Máximo = 100 | Se admite. |
| 10 | US1 | Escribir texto en un campo numérico | Error "Ingresá un valor numérico." (o el campo no admite el texto). |
| 11 | US1 | Datos válidos con dos resultados clave > "Cargar iniciativa" > Aceptar | Modal "Estás por cargar la iniciativa. ¿Querés continuar?" (el de la 004); luego el panel se cierra, se ve «La iniciativa "[nombre]" se ha cargado correctamente.» y la iniciativa aparece en la bandeja. En la lista `Resultado clave`: dos elementos con `Title` = `Nombre`, `ValorProyectado` = `Meta`, `ValorActual` vacío, sin `Responsable`, `Peso` ni `Descripcion`. |
| 12 | US1 | Forzar un error en el segundo resultado clave (mock que rechaza el segundo `add`) | Una línea de error, el panel conserva lo ingresado y no queda la iniciativa ni el primer resultado clave (se deshizo). Si además falla el deshacer, la iniciativa queda y, al reintentar, no se duplica: se completan solo los resultados clave que faltan. |
| 13 | US2 | Abrir el detalle de la iniciativa 1 (ejemplo de validación) | Encabezado "Avance: 70 %" en amarillo. Sección "Resultados clave (2)" con las columnas Resultado clave (nombre, unidad y fuente), Tipo, Mín., Meta, Máx., Peso, Actual, Proyect., Cumplim., Estado y Acción. Pesos 50% y 50%; cumplimientos 40% y 110%; estados Mínimo y Máximo. |
| 14 | US2 | Resultado clave sin valor actual | Cumplim. "—", Estado "Sin dato" en chip gris; Proyect. muestra el valor proyectado. |
| 15 | US2 | Un resultado clave por estado | No cumple rojo, Mínimo naranja, Meta amarillo, Máximo verde. |
| 16 | US2 | Iniciativa de un objetivo de otra VP | Sin sección "Resultados clave" y sin avance en el encabezado. |
| 17 | US2 | Iniciativa de la VP RRII sin resultados clave | Avance "0 %" en rojo; la sección muestra "Esta iniciativa no tiene resultados clave.". |
| 18 | US3 | Acción "Registrar seguimiento" de una fila | Panel "Seguimiento del resultado clave", subtítulo "KR-nn · nombre". "Unidad · tipo" y "Mínimo · Meta · Máximo" en modo lectura; campos Valor actual, Valor proyectado al 31/12, Fuente, Evidencia (link) y Comentario. Pie Cancelar · Guardar. |
| 19 | US3 | Intentar editar mínimo, meta o máximo | No se puede: son solo lectura. |
| 20 | US3 | Vaciar el valor proyectado y guardar | No guarda: "Este campo es obligatorio.". |
| 21 | US3 | Valor actual con texto, o evidencia que no es un link | Error en el campo ("Ingresá un valor numérico." / "Ingresá un link de SharePoint u Office 365."). Un link de un dominio que no es de confianza (por ejemplo `https://example.com/x`) también se rechaza. |
| 22 | US3 | Valor actual 40 (máximo 100), fuente, evidencia y comentario > Guardar | Sin modal de confirmación. El panel se cierra, se ve «El resultado clave "[nombre]" se ha actualizado correctamente.», la fila muestra 40, cumplimiento 40% y el estado que corresponda, y el avance del encabezado se recalcula. En la lista: `ValorActual`, `ValorProyectado`, `Fuente` y `Evidencia` actualizados; en `Comentario resultado clave`, un elemento con el comentario, la fecha y el autor. |
| 23 | US3 | Reabrir el panel | Valor actual, valor proyectado, fuente y evidencia vigentes; el comentario precargado con el último, y debajo "dd/mm/aaaa · Autor". |
| 24 | US3 | Guardar sin cambiar nada, o con el comentario igual al último o vacío | No se registra un comentario nuevo. |
| 25 | US3 | Vaciar valor actual, fuente y evidencia en un resultado clave que los tenía > Guardar | Quedan vacíos en la lista. La fila vuelve a "—" y "Sin dato". |
| 26 | US3 | Seguimiento de un resultado clave de una iniciativa Finalizada o Cancelada | Se puede registrar. |
| 27 | US3 | Forzar un error al guardar | Una línea de error; el panel conserva lo ingresado. |
| 28 | US4 | Bandeja de iniciativas | Columna Avance antes de Estado: porcentaje con su color para las de la VP RRII y "No aplica" para las de otra VP. |
| 29 | US4 | Detalle de un objetivo de la VP RRII con tres iniciativas de 70 %, 90 % y 60 % | Encabezado "Avance: 73 %" en amarillo. Sección "Iniciativas (N)" con las columnas ID, Iniciativa, Accountable, Avance, Peso, Estado, Ver; cada avance con su color. |
| 30 | US4 | Objetivo con una iniciativa cancelada que tiene resultados clave | La cancelada no cuenta en el promedio del objetivo; su propio avance sigue visible en su detalle y en la bandeja. |
| 31 | US4 | Objetivo con una iniciativa sin resultados clave | Esa iniciativa muestra 0 % y cuenta en el promedio. |
| 32 | US4 | Objetivo de la VP RRII sin iniciativas no canceladas | Avance "0 %" en rojo. |
| 33 | US4 | Detalle de un objetivo de otra VP | Sin avance en el encabezado; en "Iniciativas (N)", columna Avance con "No aplica" y sin Peso. |
| 34 | US4 | Detalle de la palanca y grilla de objetivos (solapa "Objetivos de la VP RRII") | Cada objetivo de la VP RRII muestra su avance con color, calculado igual que en su detalle. |
| 35 | US4 | Avance de 59, 60, 79 y 80 % (ajustar valores) | Rojo, amarillo, amarillo y verde. Un avance de 79,6 % se muestra "80 %" y sigue en amarillo. |
| 36 | US4 | Guardar un seguimiento y volver a la bandeja, al objetivo y a la palanca | El avance nuevo se ve en las cuatro pantallas. |
| 37 | US5 | Detalle > Editar de una iniciativa con dos resultados clave | Panel con los datos actuales y los dos resultados clave precargados; Objetivo en modo lectura. |
| 38 | US5 | Quitar uno, agregar otro y cambiar la meta de un tercero > Guardar cambios > Aceptar | Modal "Estás por guardar los cambios de la iniciativa. ¿Querés continuar?"; luego el detalle refleja los cambios, los pesos se recalculan (100 ÷ cantidad) y se ve «La iniciativa "[nombre]" se ha actualizado correctamente.». El quitado ya no está en la lista. |
| 39 | US5 | Un resultado clave con seguimiento: cambiar su unidad en la edición | Valor actual, valor proyectado, fuente, evidencia y comentario se conservan. |
| 40 | US5 | Con un resultado clave que ya tiene seguimiento, editar su meta desde el panel de la iniciativa y guardar | `ValorActual`, `ValorProyectado`, `Fuente` y `Evidencia` no se tocan en la lista (el panel envía solo sus campos, D2). El valor proyectado no cambia aunque cambie la meta. |
| 41 | US5 | Iniciativa con un solo resultado clave | La edición no ofrece quitarlo. |
| 42 | US5 | Editar una iniciativa de la VP RRII sin resultados clave | El panel arranca con un resultado clave vacío y exige completarlo para guardar. |
| 43 | US5 | Quitar un resultado clave que tiene comentarios | Se quita; los comentarios no se borran. Si la lista lo impide, una línea de error (plan, D15). |
| 44 | US5 | Forzar un error al guardar un resultado clave en la edición (por ejemplo, que falle el segundo paso) | Una línea de error; lo que se alcanzó a guardar queda (no se deshace); el panel conserva lo ingresado; reintentar hace solo lo que faltaba y no duplica lo ya guardado. |
| 45 | — | Revisar todas las pantallas | No hay acción para eliminar resultados clave fuera del panel de edición (FR-010). Ninguna pantalla muestra responsable ni descripción de un resultado clave. |
| 46 | — | Revisar los permisos | `CAN_LOAD_RESULTADOS_CLAVE` y `CAN_TRACK_RESULTADO_CLAVE` están separadas y en `true`. Con la primera en `false`, el panel no muestra el bloque; con la segunda en `false`, la acción de cada fila muestra "—". |
| 47 | — | Comparar con palancas, objetivos e iniciativas | Mismo encabezado, grilla, chips, carga, vacíos, errores, secciones, pie y panel que las features anteriores. |
| 48 | — | En el sitio de desarrollo, con el volumen que haya en las listas, abrir bandeja, detalles y paneles | Cada pantalla en menos de 3 s; cálculos y filtros sin consultas adicionales. |

## Revisión visual

Comparar con el prototipo (`sideIni`, `i_kr`, `m.is.krUpd`, `hAv`, `c-ib`, `c-oiP`, `c-gno`) las aproximaciones A1 a A4 del plan y anotar las diferencias para decidir en la revisión.
