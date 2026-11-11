# Quickstart: validación de Objetivos

Guion de QA manual. Prerrequisitos y condiciones iguales a los del [quickstart de la 002](../002-palancas-estrategicas/quickstart.md): `npm ci`, workbench hospedado del sitio de desarrollo, escritura solo en las listas de desarrollo y con autorización. Detalles de datos en [data-model.md](./data-model.md) y de pantallas en [contracts/ui-contracts.md](./contracts/ui-contracts.md).

## Preparación

1. `npm run build` sin errores.
2. Listas de desarrollo con al menos: dos palancas activas y una inactiva, la VP RRII y otra VP activa, dos departamentos con gerencias distintas.
3. La lista `Vicepresidencia` tiene una VP llamada "VP RRII" y la columna `Estado` de `Objetivo` tiene "No iniciada", "En curso", "Finalizado cumplido" y "Finalizado incumplido".

## Escenarios

| # | Historia | Pasos | Resultado esperado |
|---|----------|-------|--------------------|
| 1 | US1 | Grilla de palancas > "Cargar objetivo" > elegir VP RRII | Aparecen los 12 campos en el orden de la spec; Estado en "No iniciada" (se puede cambiar); Objetivo del VP apagado. |
| 2 | US1 | Guardar vacío | No guarda; cada obligatorio muestra su error en línea. |
| 3 | US1 | Compromiso anterior a inicio; peso 101 y -1 | No guarda; error en el campo. Compromiso igual a inicio y pesos 0 y 100 sí guardan. |
| 4 | US1 | Departamento > Gerencia; cambiar de departamento | Gerencia muestra solo las del departamento y se limpia al cambiar. |
| 5 | US1 | Desplegable de Palanca | Solo palancas activas. |
| 6 | US1 | Completar y guardar | Detalle del objetivo con ID asignado y aviso de éxito; el objetivo aparece en su palanca. El valor de `Title` en la lista es el Nombre. |
| 7 | US1 | Ícono de ayuda junto a Nombre | Se muestra y se oculta la guía de redacción. Nombre admite 255 caracteres. |
| 8 | US1 | Pesos que no suman 100 | Guarda sin advertencias. |
| 9 | US2 | Elegir otra VP | Se ocultan Palanca, Duración, Peso, Objetivo del VP y fechas. |
| 10 | US2 | Completar campos de la VP RRII, cambiar a otra VP y guardar | El objetivo queda sin palanca, duración, peso, fechas ni marca de objetivo del VP. |
| 11 | US3 | Grilla con "Todos" | Cada palanca muestra su cantidad; coincide con la lista de su detalle. |
| 12 | US3 | "Objetivos del VP" y "Todos" | Cantidades y listas se ajustan; el bloque "Objetivos de otras VP" se oculta con "Objetivos del VP". |
| 13 | US3 | Bloque "Objetivos de otras VP" | Lista los de otras VP; sin ninguno, "No hay objetivos de otras VP cargados."; abre su detalle. |
| 14 | US3 | Palanca sin objetivos | Cantidad cero y "Esta palanca no tiene objetivos cargados.". |
| 15 | US3 | "Cargar objetivo" desde el detalle de una palanca | El formulario abre con esa palanca elegida (VP RRII). |
| 16 | US4 | Detalle de un objetivo de la VP RRII | Información, planificación y estado; migas Inicio > Palancas > palanca > objetivo, con los tres primeros enlazados; Volver. |
| 17 | US4 | Detalle de uno de otra VP | Sin palanca, planificación ni objetivo del VP; migas Inicio > Palancas > objetivo. |
| 18 | US4 | Objetivo con palanca inactiva | El detalle muestra su nombre. |
| 19 | US5 | "Editar" desde el detalle | Formulario con los datos actuales; VP en solo lectura; título con el ID. |
| 20 | US5 | Cambiar estado y peso, guardar | El detalle refleja los cambios. |
| 21 | US5 | Editar un objetivo con palanca inactiva | La palanca figura elegida junto a las activas. |
| 22 | US5 | Cancelar | Sin cambios. |
| 23 | US5 | Buscar una acción de eliminar en todas las pantallas | No existe. |
| 24 | Errores | Falla de carga o de guardado (red cortada) | Mensaje de una línea; sin éxito falso; el formulario conserva lo ingresado. |
| 25 | Errores | `#/objetivo/abc` y un Id inexistente | "No se encontró el objetivo.". |
| 26 | SC-009 | Comparar con el prototipo | Sin diferencias de disposición ni textos, salvo exclusiones de FR-033 y desvíos del plan. |

Sin conexión a SharePoint, los mismos escenarios se recorren con los mocks.
