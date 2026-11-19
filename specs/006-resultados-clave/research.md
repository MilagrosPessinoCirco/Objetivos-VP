# Research: Resultados clave y cálculo de avance

Resuelve las consultas del plan contra el repo, el prototipo v10 y las respuestas de la usuaria. No quedan pendientes abiertos de diseño; los prerrequisitos de SharePoint (P1 a P3) están en el [plan](./plan.md#prerrequisitos-de-sharepoint-a-cargo-de-la-usuaria).

## Verificaciones en el repo

| # | Consulta | Resultado |
|---|----------|-----------|
| R1 | Datos existentes | `core/entities` y `core/api` ya tienen `ResultadoClave` y `ComentarioResultadoClave`, con datasource, interfaz y los dos hooks (`use<E>DataSource`, `useItem<E>DataSource`), generados con la skill `data-source`. Ninguno tiene mock. |
| R2 | `ResultadoClave` | Lee y escribe `Nombre`, `Descripcion`, `Responsable`, `TipoMedicion`, `UnidadMedida`, `Minimo`, `Meta`, `Maximo`, `Peso`, `ValorActual`, `Fuente`, `Evidencia` (link), `ValorProyectado` e `Iniciativa` (lookup). `toListItem` no envía `Title`. Un campo `undefined` se omite al guardar, así que no se puede vaciar un valor ya cargado. |
| R3 | Lista y enum | `Lista.ResultadoClave` = "Resultado clave"; `Lista.ComentarioResultadoClave` = "Comentario resultado clave"; `TipoMedicion` = Cantidad · Porcentaje · Moneda · Indicador. Coincide con FR-003. |
| R4 | `useDatasource` | Devuelve `[state, getItems, addItem, editItem, deleteItem, getById]`. `addItem` y `editItem` relanzan el error; `deleteItem` lo traga (`handleAsync`) y solo marca `state.error`. Ninguna pantalla usa `deleteItem` (búsqueda en `src/`). |
| R5 | `ComentarioResultadoClave` | `ResultadoClave` (lookup) y `Comentario`; `Created` y `Author` vienen en el `select`. El datasource ya implementa `getFilteredItems(resultadoClaveId)` con `ResultadoClaveId eq <id>`; la interfaz lo declara. No hay mock ni hook que lo exponga. |
| R6 | `ComentarioIniciativa` (referencia) | Patrón de la 004: `getFilteredItems`, `ComentarioIniciativaMock`, hook `useComentariosIniciativa`, comentario nuevo en cada cambio (D24, D16 de la 004). |
| R7 | Avance actual | `DEFAULT_PROGRESS = 0` en `objetivoUtils.ts`. `ObjetivosTable` lo muestra en la columna Avance (variantes `palanca` y `delVp`) con `PROGRESS_STYLE` (rojo fijo, Red 600). `ObjetivoDetalle` lo muestra en el encabezado con `PROGRESS_VALUE_STYLE` si el objetivo es de la VP RRII. |
| R8 | Panel de iniciativa | `IniciativaFormBody` (campos: objetivo, nombre, descripción, accountable, áreas, fechas) y `IniciativaFormPanel` (maestros y guardado con `addItem` o `editItem`). `useIniciativaFormMasters` carga objetivos, áreas, usuarios y usuario actual; no conoce los resultados clave. El panel pide confirmación con `ConfirmacionModal`. |
| R9 | Detalle del objetivo | `ObjetivoDetalle` carga el objetivo con `getById`; `ObjetivoIniciativas` carga todas las iniciativas con `useIniciativaDataSource().getItems`, las filtra por objetivo y las muestra con `IniciativasTable` (variante `objetivo`). |
| R10 | Chips | `Chip` acepta `neutral`, `brand`, `secondary`, `success`, `warning` (naranja `#ffe5cb`) y `danger`; `style` pasa a Fluent. No hay amarillo. `colorScales` tiene la escala `Yellow`, con `100` = `#fffbcb` y `800` = `#554e00`, los colores de `c-yel` de la maqueta. |
| R11 | Íconos | El registro de `FigmaIcon` incluye `add`, `addPrimary`, `delete`, `deletePrimary`, `edit`, `editPrimary`. No hay ícono de tendencia. |
| R12 | Validación de links | `Utils.validateAndSanitizeUrl(url)` devuelve `''` si la URL es inválida o su dominio no está entre los de confianza (sharepoint.com, office.com, microsoft.com, powerbi.com, outlook.com, onedrive.com). La regla de seguridad del repo manda usarla y no ampliar la lista. |
| R13 | Criterio "VP RRII" | `isVpRrii(objetivo.VP?.Title)` se usa sin resolver nombres en `getPesosIniciativa` y en `IniciativaDetalle` (004). Con `useObjetivoNames` se resuelven solo los de las pantallas de objetivos y palancas. |
| R14 | Permisos | Constantes `CAN_*` en `ObjetivosVp.tsx`, bajadas por props (004, D18). |
| R15 | Mocks de apoyo | `IniciativaMock` tiene 13 iniciativas: objetivo 1 con 3, objetivo 2 con 4 no canceladas y 1 cancelada, objetivo 3 con 2, objetivos 5 y 6 (otra VP) y 7. `UsuarioMock` exporta `USUARIO_PRUEBA`, `BARBARA` y `MARIA`. |
| R16 | Lectura de pantallas con avance | `Palancas` y `PalancaDetalle` cargan objetivos con `useObjetivoDataSource` y `useObjetivoNames`; `IniciativasBandeja` carga iniciativas, objetivos y departamentos en un `Promise.all`. |
| R17 | Localización | Un solo archivo de idioma, `loc/en-us.js`, más `loc/mystrings.d.ts`. Ya existen `ObjetivoColumnProgress` ("Avance"), `ObjetivoDetailProgress` ("Avance:"), `ObjetivoNoValue` ("—"), `RequiredField`, `Cancel`, `SaveChanges`, `IniciativaConfirmCreate`, `IniciativaConfirmEdit` e `IniciativaSaveError`. |

## Verificaciones en el prototipo (v10)

| # | Consulta | Resultado |
|---|----------|-----------|
| M1 | Bloque del panel | `fm.objRrii`: banda "Resultados clave" con "+", cada resultado clave en `rowKr2` con nombre, tipo, unidad, mínimo, meta, máximo, **peso** (no se implementa) y papelera salvo en el primero. |
| M2 | Sección del detalle | `i_kr`: columnas Resultado clave, Tipo, Mín., Meta, Máx., Peso, Actual, Proyect., Cumplim., Estado, Acción. Cumplim. muestra "—" sin valor actual y, si no, el entero redondeado con " %". Estado "Sin dato" con chip gris. Acción: ícono si la persona puede, "—" si no. |
| M3 | Seguimiento | `m.is.krUpd`: "Unidad · tipo" y "Mínimo · Meta · Máximo" en lectura; Valor actual, Valor proyectado (obligatorio), Fuente, Evidencia (`type="url"`) y Comentario. Valida valor proyectado obligatorio y numéricos. Guarda sin confirmar y avisa «El resultado clave "…" se ha actualizado correctamente.». Abre con el comentario vacío. |
| M4 | Estados | `KRCLS`: No cumple `c-bad`, Mínimo `c-warn`, Meta `c-yel`, Máximo `c-ok`, Sin dato `c-none`. |
| M5 | Avance | `pctC` con rojo `#AB0017`, amarillo `#807500`, verde `#00802B`, gris. `hAv` en los encabezados del objetivo y de la iniciativa. "No aplica" en las columnas Avance de otra VP. Una iniciativa o un objetivo sin datos da 0. |
| M6 | Columnas Avance | Bandeja (`c-ib`): ID, Iniciativa, Objetivo, Accountable, **Avance**, Estado, Ver. Detalle del objetivo (`c-oiP`): ID, Iniciativa, Accountable, **Avance**, Peso, Estado, Ver; para otra VP (`c-oi`) sin Peso. |

## Decisiones tomadas con la usuaria

| # | Pregunta | Respuesta |
|---|----------|-----------|
| U1 | ¿Cómo se muestra el comentario del último seguimiento? La maqueta lo abre vacío y sin fecha ni autor; la spec pide ver el último con fecha y autor. | Precargado en el campo Comentario, con una línea de solo lectura con la fecha y el autor del último (2026-11-18). |

## Decisiones técnicas sin consulta

- **Cálculo en memoria, sin consultas filtradas.** Los hooks solo exponen `getItems` y la 004 ya filtra y calcula durante el render (H4 de la 003). Para los resultados clave se hace lo mismo: no hace falta un índice en `Resultado clave` ni un hook nuevo. Los comentarios son la excepción, porque crecen con cada seguimiento (D10).
- **Objetos parciales al guardar.** SharePoint ignora los campos que no se envían. Guardar solo los campos que cada pantalla gestiona evita pisar lo que carga la otra y evita escribir `Descripcion`, `Responsable` y `Peso` (FR-006).
- **Sin cambios en `Constants.ts`.** Los umbrales y los estados del resultado clave son de dominio y quedan en su módulo; no son transversales.
- **Sin ruta nueva.** El seguimiento es un panel del detalle (FR-040).
