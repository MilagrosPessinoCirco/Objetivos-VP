# Cambios propuestos a docs/especificacion-funcional.md (v1.9 → v1.10)

**Aplicado** a `docs/especificacion-funcional.md` v1.10 en el commit `5980331`. Se conserva como registro de lo propuesto y revisado. Tiene dos grupos: los cambios de esta feature (008) y los ya decididos en las features 004 y 006, que el documento todavía no tiene. Cada cambio del segundo grupo se verificó contra las specs y el código (tabla al final).

## Encabezado

- Versión: `1.9 · 16/11/2026` → `1.10 · 24/11/2026`.
- Archivo: `Especificacion_Funcional_Gestion_Portfolio_VP_v1.9.docx` → `..._v1.10.docx`.

---

# Grupo A · Feature 008 (ajustes de vistas)

## RF-01 · Alta y edición de palanca

Agregar en Criterios de aceptación:

- Antes de guardar, el sistema pide confirmación. Al crear: "Estás por agregar la palanca "[nombre]". ¿Querés continuar?". Al editar: "Estás por guardar los cambios de la palanca "[nombre]". ¿Querés continuar?". La validación de campos ocurre antes de la confirmación; al cancelar, el formulario conserva lo ingresado.

## RF-02 · Vista de palancas

Descripción: agregar al final: "Arriba de la grilla, una línea de resumen indica la cantidad de palancas activas y de objetivos."

Reemplazar el criterio "Arriba de la grilla hay dos opciones: Objetivos de la VP RRII ... y Todos." por (el documento quedó atrás de lo implementado, que ya tiene tres solapas):

- Arriba de la grilla hay cuatro solapas, cada una con su cantidad: Todas las palancas, Objetivos de la VP RRII (solo los marcados con "¿Es objetivo de la VP RRII?", RF-03), Objetivos de otras VP y Todos los objetivos. La cantidad es el total, sin búsqueda ni filtros.
- Todos los objetivos reúne en una grilla los de la VP RRII y los de otras VP, con ID, Objetivo, VP, Palanca, Departamento, Gerencia, Peso (en el departamento), Avance, Estado y Ver. Para un objetivo de otra VP, Palanca y Peso muestran "—" y Avance "No aplica". Las grillas de objetivos se paginan de a 10.
- El botón Filtros abre un panel con Palanca, Departamento, Gerencia, Estado y Año; los botones del pie son Limpiar y Aplicar. Los filtros se combinan con la búsqueda, se aplican sobre la solapa elegida y se mantienen al cambiar de solapa. En Todas las palancas, Palanca limita las palancas y los demás limitan los objetivos de cada una; las palancas sin objetivos que cumplan se ocultan. Un objetivo cumple el filtro Año si el año está entre el de su fecha de inicio y el de su fecha de compromiso, incluidos; un objetivo permanente, desde el año de inicio en adelante. Los objetivos de otras VP, que no tienen palanca ni fechas, se excluyen cuando se filtra por Palanca o por Año.
- La línea de resumen no muestra el avance de la VP.

## RF-03 · Alta de objetivo

- Agregar criterio: "Antes de guardar, el sistema pide confirmación: "Estás por cargar el objetivo aprobado en el comité. Una vez guardado, sólo el Administrador podrá modificarlo. ¿Querés continuar?". La validación de campos ocurre antes."
- Estado: la tabla dice "No iniciada · En curso · Finalizada"; lo implementado (feature 003) y la maqueta tienen cuatro: No iniciada · En curso · Finalizado cumplido · Finalizado incumplido. Alinear el documento.

## RF-04 · Edición de objetivo

Agregar criterio: "Antes de guardar, el sistema pide confirmación: "Estás por modificar el objetivo. Todo cambio requiere el visto bueno del VP. ¿Querés continuar?"."

## RNF-06 · Usabilidad (sección 7)

Texto actual: "Formularios cortos, con campos condicionales y ayudas en línea. Actualizar una tarea lleva menos de un minuto."

Agregar al final: "En las vistas que tienen el botón Actualizar (vista de palancas y objetivos y bandeja de iniciativas), al usarlo se recargan los datos y se muestra "La vista se ha actualizado correctamente."; se mantienen la solapa, la búsqueda, los filtros y la página. Si la recarga falla, se muestra el mensaje de error de la vista y no el de éxito."

---

# Grupo B · Decisiones de las features 004 y 006 que el documento no tiene

## RF-07 · Alta de iniciativa (feature 004)

- Descripción, segundo párrafo: "Si el objetivo es de la VP RRII, en el alta se carga al menos un resultado clave (RF-09)." → "Si el objetivo es de la VP RRII, en el mismo panel del alta se cargan sus resultados clave, al menos uno (RF-09)."
- Tabla, fila Accountable: `Usuarios (uno o más)` / `Por defecto, quien la carga. Sin límite de cantidad.` → `Usuario (uno)` / `Por defecto, quien la carga. Admite una sola persona: si se elige otra, reemplaza a la anterior.`
- Tabla, fila Estado, observación: `No iniciada al crearse. Lo cambia un accountable (RF-11).` → `No iniciada al crearse. Lo cambia el accountable solo desde "Cambiar estado" (RF-11); el panel de edición no muestra el campo.`
- Criterios: agregar "La iniciativa se edita en el mismo panel del alta, con el objetivo en modo lectura y sin el Estado."
- Glosario, fila Accountable: `Persona que responde por una iniciativa. Una iniciativa puede tener uno o más.` → `Persona que responde por una iniciativa. Cada iniciativa tiene una.`

## RF-08 y RF-09 · Resultados clave en el panel de la iniciativa (feature 006)

- RF-08, criterios: sin cambios de fondo (el peso se recalcula al agregar un resultado clave; no se pueden quitar).
- RF-09, descripción: agregar: "Los resultados clave se cargan y se editan en el mismo panel que la iniciativa, en el bloque "Resultados clave", y se guardan juntos con una sola confirmación. Al editar se pueden agregar y modificar, pero no quitar los ya guardados."
- RF-09, criterios: agregar "El valor actual, la fuente, la evidencia y el comentario no se cargan en el panel de la iniciativa: se completan en el seguimiento (RF-10)." y "La aplicación no ofrece eliminar un resultado clave ya guardado."

## RF-09 y RF-10 · Sin Responsable ni Descripción; evidencia (feature 006)

- RF-09, tabla: **quitar** las filas Descripción y Responsable.
- RF-09, tabla, fila Evidencia: `Link` / `Un único link.` → `Link` / `Un único link de SharePoint u Office 365.` (ver pregunta 1).
- RF-10, descripción: `Los accountable de la iniciativa o el responsable del resultado clave actualizan ...` → `El accountable de la iniciativa actualiza el valor actual, la fuente, la evidencia, el valor proyectado y el comentario del resultado clave. El seguimiento y cualquier aviso sobre el resultado clave corresponden al accountable de la iniciativa.`
- RF-10, criterios: agregar "El valor actual puede quedar vacío o borrarse; el resultado clave vuelve a "Sin dato" (C-02)."

## C-01 y C-02 · Sin valor actual (feature 006)

- C-01: `Sin valor actual, el cumplimiento real es 0%.` → `Sin valor actual, el cumplimiento real se muestra como "—" y aporta 0% al avance de la iniciativa.`
- C-02: agregar `• sin valor actual → Sin dato (gris)`.
- C-03: agregar "Un resultado clave sin valor actual aporta 0%." (la 006 usa máx(0%, mín(cumplimiento, 100%)): cada uno aporta entre 0% y 100%.)

## Sección 5 · Redondeo (feature 006)

Agregar al párrafo inicial: "Los porcentajes de cumplimiento, avance y peso se muestran redondeados a entero; el redondeo es solo de presentación: los promedios y los colores se calculan con el valor sin redondear."

Ajustar el ejemplo: el avance del objetivo "73,3%" se muestra como "73%".

## RF-19 y glosario · Sin responsable del resultado clave

- RF-19, tabla de acciones, fila "Actualizar valores de resultados clave", columna Usuario: `Accountable de la iniciativa o resp. del resultado clave` → `Accountable de la iniciativa`.
- Glosario, fila Evidencia: `Link a un sitio de SharePoint o Teams, o a un tablero, que respalda el valor actual.` → `Link a un sitio de SharePoint u Office 365 que respalda el valor actual.` (ver pregunta 1).
- No hay otra mención al responsable del resultado clave en el glosario (se revisó).

---

## Verificación del grupo B

| Cambio | Spec | Código |
|---|---|---|
| Un solo Accountable | 004: Clarifications ("Uno solo, obligatorio"), FR-003 y FR-010 | `IniciativaForm`: `setAccountable(next.slice(-1))` |
| Estado fuera del panel de edición | 004: FR-006, FR-024 y FR-028; US de edición | `IniciativaForm`: en edición conserva `iniciativa.Estado`; el cambio es desde el panel de estado |
| Resultados clave en el mismo panel | 006: FR-012 a FR-016 | `IniciativaForm/ResultadosClaveBloque` |
| Sin Responsable ni Descripción | 006: FR-006 y Clarifications | La entidad `ResultadoClave` no tiene Responsable; Descripción solo se mapea con la columna de SharePoint, sin usarse en pantalla |
| Evidencia | 006: FR-009 | `core/utils/Utils.ts`: dominios sharepoint.com, office.com, microsoft.com, powerbi.com, outlook.com y onedrive.com |
| Sin dato: "—" y 0 % | 006: FR-026 y FR-027 | `resultadoClaveUtils`: `getCumplimiento` devuelve 0 y `getEstadoResultadoClave` devuelve `SinDato`; la tabla muestra "—" |
| Redondeo a entero | 006: FR-031 | `resultadoClaveUtils`: `Math.round` en la presentación |

## Accountable en singular (decidido el 2026-11-24)

Frases pasadas al singular: §1.2 (alertas), §1.3 (tareas y decisiones), RF-11, RF-13, RF-14 (decisión, mail de escalado y diagrama) y RF-18 (alerta de riesgo escalado). En RF-16 y RF-19 ya estaban en singular.

## Decisiones tomadas

- Evidencia: "SharePoint u Office 365 (dominios aceptados: sharepoint.com, office.com, microsoft.com, powerbi.com, outlook.com y onedrive.com)"; el mensaje de error no cambia.
- Requisito de Actualizar: criterio nuevo de RNF-06.
- Versión v1.10 con fecha 24/11/2026 (la del día de la aplicación).

**Aplicada** a `docs/especificacion-funcional.md`.
