# Quickstart: validación de los pesos de objetivos

Guion de QA manual. Los prerrequisitos son los mismos que en el [quickstart de la 003](../003-objetivos/quickstart.md). Los datos están en [data-model.md](./data-model.md) y las pantallas en [contracts/ui-contracts.md](./contracts/ui-contracts.md).

## Preparación

1. `npm run build` termina sin errores.
2. Con mocks: los escenarios 1 a 14 se pueden recorrer sin SharePoint.
3. Con la lista de desarrollo:
   - la usuaria creó la columna `PesoVP` (plan, P1), con los pasos de abajo;
   - se hizo la corrección de datos de otras VP (plan, P3), con los pasos de abajo;
   - se escribe solo en la lista de desarrollo y con autorización.

## Creación de la columna PesoVP

En el sitio de desarrollo la crea la usuaria. En cada sitio siguiente (prueba y producción) se repite antes de desplegar el paquete que la usa, con la autorización que corresponda a ese sitio.

1. Abrir la lista `Objetivo` > Configuración (engranaje) > Configuración de la lista.
2. Ver la columna `Peso` y anotar su cantidad de decimales.
3. Columnas > "Crear columna" (no "Agregar columna" desde la vista moderna: ahí el nombre interno sale del nombre visible y no se puede elegir).
4. Nombre: `PesoVP`, escrito exactamente así. Ese texto queda como nombre interno.
5. Tipo: Número.
6. "Requiere que esta columna contenga información": No.
7. Mínimo: 1. Máximo: 100. Decimales: los mismos que `Peso` (paso 2). Sin valor predeterminado. No mostrar como porcentaje.
8. Guardar. Volver a editar la columna y cambiar el nombre visible a "Peso en la VP". El nombre interno no cambia.
9. Verificar: en la configuración de la columna, la URL termina en `Field=PesoVP`.

## Corrección de datos de otras VP (solo en el sitio de desarrollo)

1. En la lista `Objetivo`, filtrar VP distinta de "VP RRII" y la columna de la marca (nombre interno `EsDelVp`) = Sí.
2. Anotar la cantidad de elementos y sus ID.
3. "Editar en vista de cuadrícula": en cada uno, la marca = No y "Peso en la VP" vacío. No tocar otras columnas.
4. Volver a aplicar el filtro del paso 1: no tiene que quedar ninguno.
5. Informar la cantidad de elementos corregidos y sus ID (si no había ninguno, informar 0).

## Escenarios

| # | Historia | Pasos | Resultado esperado |
|---|----------|-------|--------------------|
| 1 | US1 | "Cargar objetivo" > VP RRII | La primera sección muestra VP, Departamento, Gerencia, Nombre, Descripción y Estado, sin el interruptor. La planificación muestra Palanca, Duración, "Peso del objetivo en el Departamento (%)", "¿Es objetivo de la VP RRII?" (apagado) y las fechas. |
| 2 | US1 | Activar el interruptor | Aparece "Peso del objetivo para el VP (%)", obligatorio, después del interruptor. |
| 3 | US1 | Guardar con el interruptor activo y el peso en la VP vacío | No guarda. El campo indica que es obligatorio. |
| 4 | US1 | Peso en la VP 0, 101 y 0,5 | No guarda: "Ingresá un valor entre 1 y 100.". Con 1, 100 y 15,5 guarda. |
| 5 | US1 | Peso en el departamento vacío, -1 y 101 | No guarda: obligatorio o "El peso debe estar entre 0 y 100.". Con 0 y 100 guarda. |
| 6 | US1 | Peso en el departamento 20 y en la VP 15, guardar | El detalle muestra "Peso en el departamento: 20 %" y "Sí · peso en la VP: 15 %". |
| 7 | US1 | Editar ese objetivo, apagar el interruptor y guardar | El campo se oculta. El detalle muestra "No". En la lista, `PesoVP` queda vacío. |
| 8 | US1 | Pesos que no suman 100 | Guarda sin advertencias. |
| 9 | US1 / FR-008 | Elegir otra VP | Desaparece la planificación con el interruptor. La etiqueta pasa a ser "Departamento que colabora". |
| 10 | US1 / FR-009 | En el alta: VP RRII, activar la marca, peso en la VP, Plurianual y 3 años; cambiar a otra VP y guardar | En la lista, el objetivo queda con `EsDelVp` falso y sin `Peso`, `PesoVP` ni `CantidadAnios`. |
| 11 | US3 | Duración Plurianual | Aparece "Cantidad de años", con las opciones 2 a 5, después de Duración. Si se guarda sin elegir, indica que es obligatorio. |
| 12 | US3 | Plurianual 3 años, guardar | El detalle muestra "Plurianual · 3 años". |
| 13 | US3 | Editar, cambiar a Anual y guardar | El campo se oculta. El detalle muestra "Anual". En la lista, `CantidadAnios` queda vacío. |
| 14 | FR-014 / FR-015 | Pestañas de la sección de palancas | La pestaña dice "Objetivos de la VP RRII (n)". Su tabla tiene "Peso" y "Peso VP", y "—" en los objetivos marcados sin peso en la VP. Las listas por palanca (desplegadas y en el detalle) tienen solo "Peso". Sin objetivos marcados: "No hay objetivos de la VP RRII cargados.". |
| 15 | Edge | Objetivo marcado sin peso en la VP, cargado antes de esta feature | El detalle muestra "Sí · peso en la VP: —". Al editarlo, el formulario no guarda hasta que se carga el peso. |
| 16 | Errores | Falla al guardar | Mensaje de una línea. Se conservan los dos pesos, la marca y la cantidad de años. |
| 17 | SC-006 | Comparar con `scr.form` y `scr.objetivo` del prototipo | Sin diferencias, salvo los desvíos de la spec (Clarifications) y de la 003. |
