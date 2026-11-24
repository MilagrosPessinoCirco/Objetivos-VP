# Quickstart: validación de Roles y permisos

Guion de QA manual. Prerrequisitos iguales a los del [quickstart de la 004](../004-iniciativas/quickstart.md): `npm ci`, workbench hospedado del sitio de desarrollo, escritura solo en las listas de desarrollo y con autorización. Datos en [data-model.md](./data-model.md); decisiones en el [plan](./plan.md); contratos en [contracts/](./contracts/).

## Preparación con mocks

1. `npm run build` termina sin errores (corre `eslint` y `heft build`).
2. `npm start` y abrir el workbench local. El usuario actual es `USUARIO_PRUEBA` (Id 10).
3. Elegir el rol del mock con la consola del navegador y recargar la página:

   ```js
   localStorage.setItem('rolMock', 'Usuario');   // Visualizador | Usuario | CargadorObjetivo | Administrador | sin-rol | falla
   ```

   Sin la clave el rol es Administrador. `localStorage.removeItem('rolMock')` la quita. No hay selector en pantalla. La clave se lee solo en el mock (modo local, fuera de SharePoint); en el workbench hospedado y en producción no tiene ningún efecto.

## Preparativos en SharePoint

Los hace la usuaria en el sitio de desarrollo y se repiten en cada sitio antes de desplegar. El código no los hace.

**P1. Columna `Rol` de la lista `Usuario`.** Confirmada por la usuaria en desarrollo: nombre interno `Rol`, tipo Opción, con los valores `Administrador`, `CargadorObjetivo`, `Usuario` y `Visualizador`. En cada sitio nuevo, crearla igual.

**P2. Grupos.** Configuración del sitio > Permisos del sitio > Crear grupo, cuatro veces, con **exactamente los mismos nombres que los valores de `Rol`**: `Administrador`, `CargadorObjetivo`, `Usuario` y `Visualizador`. Un rol no puede tener un nombre en la columna y otro en el grupo. En cada uno: "Quién puede ver la pertenencia" = miembros del grupo; "Quién puede editar la pertenencia" = propietario del grupo.

**P3. Lectura en el sitio.** En Permisos del sitio, dar "Lectura" a los cuatro grupos (o confirmar que ya la tienen por otro grupo del sitio), para que puedan abrir la página.

**P4. Propietario de los cuatro grupos.** En cada uno de los cuatro grupos: Configuración del grupo > "Propietario del grupo" = `Administrador`. Agregar a una persona de prueba por grupo y una persona sin grupo.

**P5. Permisos de las listas.** Para cada lista de la tabla: Configuración de la lista > Permisos para esta lista > "Detener la herencia de permisos" (copia los del sitio) > quitar a todos los grupos salvo Propietarios (que conservan Control total) > "Conceder permisos" a los cuatro grupos con el nivel de la tabla.

| Lista | Visualizador | Usuario | CargadorObjetivo | Administrador |
|---|---|---|---|---|
| `Palanca` | Lectura | Lectura | Lectura | Colaborar |
| `Vicepresidencia`, `Departamento`, `Gerencia`, `Area` | Lectura | Lectura | Lectura | Colaborar |
| `Usuario` | Lectura | Lectura | Lectura | Colaborar |
| `Objetivo` | Lectura | Lectura | Colaborar | Colaborar |
| `Iniciativa`, `Resultado clave`, `Tarea` | Lectura | Colaborar | Colaborar | Colaborar |
| `Comentario iniciativa`, `Comentario resultado clave`, `Avance tarea` | Lectura | Colaborar | Colaborar | Colaborar |
| `Riesgo`, `Decision`, `Presupuesto tarea` (aún sin pantallas) | Lectura | Colaborar | Colaborar | Colaborar |

Se usan solo los niveles estándar: "Lectura" y "Colaborar" (Contribute: agregar, editar y borrar); no se crean niveles personalizados. Usuario y CargadorObjetivo necesitan borrar en `Iniciativa`, `Resultado clave` y `Tarea` porque la aplicación deshace un alta fallida borrando lo creado. Los permisos por elemento (Accountable, responsable) no se configuran: los controla la aplicación. Limitación conocida: CargadorObjetivo tiene "Colaborar" en `Objetivo`, así que SharePoint no le impide editar un objetivo fuera de la aplicación; la aplicación no le ofrece la edición y rechaza el guardado.

**Papelera de reciclaje.** Si algo se borra por error (por ejemplo, un elemento de `Iniciativa`, `Resultado clave` o `Tarea`), se recupera desde la papelera de reciclaje del sitio: Contenido del sitio > Papelera de reciclaje > seleccionar el elemento > Restaurar. Se conserva por el plazo de retención del sitio.

**P6. Pertenencia al quitar.** El servicio consulta los grupos de la persona antes de quitarla, así que no depende de cómo responda SharePoint al quitar a un no miembro. Confirmar en dev, con una persona de prueba, que quitarla de un grupo del que no es miembro no rompe nada (paso 3 del servicio contra el sitio de desarrollo).

## Escenarios de acceso

| # | Historia | Pasos | Resultado esperado |
|---|---|---|---|
| A1 | US1 | Rol `sin-rol`, abrir la home | Solo ícono y "No tenés acceso a esta aplicación."; sin home, menú, accesos ni datos. |
| A2 | US1 | Rol `sin-rol`, abrir directamente `#/iniciativa`, `#/tarea`, un detalle de palanca, objetivo, iniciativa y tarea | La misma pantalla en todas; ninguna muestra un dato ni "no encontrado". |
| A3 | US1 | Rol `falla`, abrir la home | Ícono y "No se pudieron cargar tus permisos."; sin acceso. |
| A4 | US1 | Recargar con el rol `Usuario` y observar el arranque (red lenta en el navegador) | Solo el indicador de carga hasta conocer el rol; nunca aparece la home, un dato ni un botón que luego se oculte. |
| A5 | US1 | Cada rol, abrir la home | Entra a la home. No se ve ningún selector "Ver como". |
| A6 | US1 | Con SharePoint real, una persona en dos grupos (Usuario y CargadorObjetivo) | Se comporta como CargadorObjetivo. Con Visualizador y Administrador, como Administrador. |
| A7 | US1 | Con SharePoint real, un propietario del sitio sin grupo de rol | Pantalla de acceso denegado. |

## Escenarios por rol y por acción

Pantallas: galería de palancas (G), detalle de palanca (P), detalle de objetivo (O), bandeja de iniciativas (BI), detalle de iniciativa (I), bandeja de tareas (BT), detalle de tarea (T). "Sí" = se ve y funciona; "—" = no se muestra (ni deshabilitado).

Para los casos de Usuario con elementos propios y ajenos: Accountable de la iniciativa 1 y 4 = `USUARIO_PRUEBA`; de la 2 y 5 = otra persona. Responsable de la tarea 2 (iniciativa 1) = `USUARIO_PRUEBA`; tarea de la iniciativa 5 con `USUARIO_PRUEBA` responsable = la tarea agregada a los mocks.

| # | Acción (FR-010) | Dónde | Visualizador | Usuario | CargadorObjetivo | Administrador |
|---|---|---|---|---|---|---|
| R1 | Ver, buscar, filtrar, Actualizar, navegar, Ver | todas | Sí | Sí | Sí | Sí |
| R2 | "Nueva palanca", Editar palanca (lápiz de la fila y Editar del pie) | G, P | — | — | — | Sí |
| R3 | "Cargar objetivo" y "+" de objetivos de la palanca | G, P | — | — | Sí | Sí |
| R4 | Editar y lápices del objetivo (pesos, marca VP RRII) | O | — | — | — | Sí |
| R5 | "Cargar iniciativa" y "+" de Iniciativas del objetivo | O, BI | — | Sí | Sí | Sí |
| R6 | Editar, "Cambiar estado" y lápices de la iniciativa | I | — | Solo iniciativa 1 y 4 | Sí, todas | Sí, todas |
| R7 | Seguimiento del resultado clave | I | — | Solo iniciativa 1 y 4 | Sí, todas | Sí, todas |
| R8 | "Cargar tarea" | BT, I | — | Sí | Sí | Sí |
| R9 | Editar tarea, lápices y "Registrar avance" | T | — | Tarea 2 (responsable) y tareas de la iniciativa 1 y 4 (Accountable) y la tarea agregada (responsable); no en el resto | Sí, todas | Sí, todas |
| R10 | "Historial de avance" | T | Sí | Sí | Sí | Sí |
| R11 | Ninguna pantalla ofrece eliminar una tarea | T, BT, I | — | — | — | — |

Casos puntuales:

| # | Pasos | Resultado esperado |
|---|---|---|
| U1 | Usuario: entrar a la iniciativa 2 (de Bárbara) | Sin Editar, "Cambiar estado", lápices ni seguimiento; sí "Cargar tarea". |
| U2 | Usuario: tarea de la iniciativa 1 con otra responsable (tarea 1) | Puede editarla y registrar avance (es Accountable de la iniciativa). |
| U3 | Usuario: tarea de la iniciativa 5 con él como responsable | Puede editarla y registrar avance (es responsable, no Accountable). |
| U4 | Usuario: tarea de la iniciativa 5 con otra responsable | Sin Editar, lápices ni "Registrar avance". |
| U5 | Usuario: tarea Cancelada de una iniciativa propia | Sin Editar ni "Registrar avance" (regla de la 007, no del rol). |
| U6 | Usuario: cargar una iniciativa dejando a otra persona como Accountable | Se guarda; al abrirla, ya no ve Editar. |
| U7 | Usuario: cargar una tarea y asignarla a otra persona | Se guarda; al abrirla, sin Editar si no es Accountable de la iniciativa. |

## Pesos

| # | Rol | Pasos | Resultado esperado |
|---|---|---|---|
| W1 | CargadorObjetivo o Administrador | Bandeja de iniciativas, iniciativa de un objetivo de la VP RRII | Encabezado "Objetivo (peso)"; la celda muestra `OBJ-nn · nombre (xx%)`. Objetivos de otras VP, sin peso. |
| W2 | Visualizador o Usuario | Misma bandeja | Encabezado "Objetivo", sin peso. |
| W3 | CargadorObjetivo o Administrador | "Información de la iniciativa" de una iniciativa de la VP RRII | Peso en el objetivo y peso en el departamento. |
| W4 | Visualizador o Usuario | Misma sección | Ninguno de los dos datos. |
| W5 | CargadorObjetivo o Administrador | Detalle de un objetivo de la VP RRII | La lista de iniciativas muestra la columna Peso. |
| W6 | Visualizador o Usuario | Mismo detalle | Sin la columna Peso. |
| W7 | CargadorObjetivo | Bandeja con búsqueda o filtro activo | El peso de cada iniciativa no cambia: se calcula con todas las del objetivo. |

## Rechazo del guardado

| # | Pasos | Resultado esperado |
|---|---|---|
| G1 | Rol `Administrador`; abrir el panel de editar palanca; en la consola `localStorage.setItem('rolMock', 'Visualizador')` (sin recargar); guardar | No se guarda; una línea "No tenés permiso para realizar esta acción."; el panel conserva lo ingresado. |
| G2 | Lo mismo con editar objetivo, editar iniciativa, "Cambiar estado", seguimiento de un resultado clave, editar tarea y "Registrar avance" | Igual que G1 en cada uno. |
| G3 | Rol `Usuario`; abrir el panel de editar la iniciativa 1; cambiar el Accountable en el formulario a otra persona; guardar | Se guarda (el permiso se evalúa con el Accountable cargado, no con el editado). |
| G4 | Rol `Usuario`, panel de editar la iniciativa 1; cambiar el rol a `Visualizador` sin recargar; guardar | Rechazado como G1. |
| G5 | Rol `Administrador`, panel de alta de tarea abierto; cambiar a `Usuario` sin recargar; guardar | Se guarda (Usuario puede crear tareas). |
| G6 | Rol `Administrador`, panel de edición de objetivo; cambiar a `CargadorObjetivo` sin recargar; guardar | Rechazado (CargadorObjetivo solo crea objetivos). |
| G6b | Rol `Administrador`, panel de alta de objetivo; cambiar a `Usuario` sin recargar; guardar | Rechazado. |
| G7 | Cambiar a `falla` sin recargar y guardar | No se guarda; el mensaje de falla de guardado propio de la pantalla. |

## Servicio de personas, con el mock

Como ninguna pantalla lo invoca, se prueba con una invocación temporal, que no se commitea: en `ObjetivosVp.tsx`, un `React.useEffect` de una sola vez que crea el servicio con `createUsuarioRolServiceMock(falla)` y escribe el resultado en `console`. Con el rol del mock en `Administrador`.

| # | Operación | Resultado esperado |
|---|---|---|
| S1 | Alta de una persona nueva con rol `Usuario` | Aparece en la lista mock con `Rol = Usuario` y `Activo = true`; está en el grupo `Usuario` y en ningún otro. |
| S2 | Alta de una persona inactiva ya existente | Se reactiva el mismo elemento (no se crea otro) con el rol nuevo y en su grupo. |
| S3 | Cambio de rol `Usuario` → `CargadorObjetivo` | Lista con el rol nuevo; en el grupo nuevo; fuera del anterior. |
| S4 | Cambio de rol hacia el mismo rol | Sin cambios; nada duplicado. |
| S5 | Baja de una persona activa | `Activo = false`, `Rol` conservado, elemento conservado; fuera de su grupo. |
| S6 | Falla en `lista` en cada operación | Rechaza con `UsuarioRolError` (`deshecho: true`); lista y grupos como antes. |
| S7 | Falla en `grupo-agregar` en alta y en cambio de rol | Se deshace lo de la lista (el elemento creado se borra; el `Rol` anterior se restaura). |
| S8 | Falla en `grupo-quitar` en cambio de rol y en baja | Se deshace: vuelve a estar en los grupos de los que se la había quitado y se restaura la lista. |
| S9 | Falla en el paso y en `deshacer` | Rechaza con `UsuarioRolError` (`deshecho: false`). Reintentar con la falla ya agotada completa la operación sin duplicar elementos ni pertenencias. |
| S10 | Con rol `Usuario`, `CargadorObjetivo` o `Visualizador` en el mock, cualquier operación | Rechaza con `PermisoDenegadoError`; no cambia nada. |

## Servicio de personas, contra el sitio de desarrollo

Requiere P1, P2 y P4, y autorización expresa para escribir en la lista `Usuario` y en los grupos del sitio de desarrollo. Usar personas de prueba, nunca personas reales.

1. Con el workbench hospedado y la persona actual en el grupo `Administrador`, hacer la misma invocación temporal pero con el servicio real (sin mock).
2. Repetir S1, S2, S3, S5 y S10 (con una persona del grupo `Usuario`). Verificar cada resultado en la lista y en Permisos del sitio.
3. Quitar a la persona de prueba de un grupo a mano y repetir S3: el servicio tiene que dejarla solo en el grupo nuevo.
4. Limitación a verificar y registrar: agregar a una persona directamente en la lista, sin el servicio, no la agrega al grupo (FR-022).
5. Retirar la invocación temporal y las personas de prueba.

## Permisos de las listas (con P1 a P5 aplicados)

| # | Pasos | Resultado esperado |
|---|---|---|
| L1 | Una persona sin grupo abre una lista de la aplicación desde SharePoint | Sin acceso a los datos. |
| L2 | Visualizador intenta agregar o editar un elemento en cualquier lista | SharePoint lo impide. |
| L7 | Borrar por error un elemento de prueba de `Tarea` y recuperarlo | Se restaura desde la papelera de reciclaje. |
| L3 | Usuario intenta agregar o editar en `Palanca` y en `Usuario` | SharePoint lo impide. |
| L4 | CargadorObjetivo agrega un elemento en `Objetivo` desde la aplicación; abre un objetivo existente | Agrega; no ve Editar ni lápices; con el rol cambiado a CargadorObjetivo, el guardado de una edición se rechaza (G6). Desde SharePoint sí podría editarlo (limitación conocida). |
| L5 | Usuario carga una iniciativa con resultados clave desde la aplicación | Se guarda; si se fuerza una falla en un resultado clave, el alta se deshace (puede borrar). |
| L6 | Cada rol abre la aplicación y recorre las pantallas con los datos reales | Todos los roles leen los datos; las acciones siguen la matriz. |

## Documentación

| # | Pasos | Resultado esperado |
|---|---|---|
| D1 | Abrir `docs/especificacion-funcional.md` | Versión 1.11; RF-19 y RF-20 con los cambios aprobados; sin eliminación de tareas en RF-19. |
| D2 | Revisar `docs/plantilla-cambios.md` | Una fila por cada archivo de `core` modificado por esta feature. |
