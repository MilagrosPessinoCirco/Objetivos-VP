# Gestión de Objetivos VP RRII · Prototipo navegable · v5

Prototipo interactivo de la app SharePoint (SPFx) de la VP RRII, alineado a la Especificación Funcional v1.7 y al DS SharePoint / Fluent UI v8.

| Versión | Fecha | Archivo |
|---|---|---|
| v1 | 27/10/2026 | Gestion-Objetivos-VP-RRII-prototipo.zip |
| v2 | 29/10/2026 | Gestion-Objetivos-VP-RRII-prototipo_v2.zip |
| v3 | 29/10/2026 | Gestion-Objetivos-VP-RRII-prototipo_v3.zip |
| v4 | 29/10/2026 | Gestion-Objetivos-VP-RRII-prototipo_v4.zip |
| v5 | 03/11/2026 | Gestion-Objetivos-VP-RRII-prototipo_v5.zip (esta) |

## Cómo abrirlo
El prototipo necesita un servidor local (no funciona con doble clic en index.html por restricciones del navegador sobre file://).

- Windows: doble clic en `iniciar-windows.bat`
- Mac / Linux: `./iniciar-mac-linux.sh`
- Manual: desde esta carpeta, `python -m http.server 8765` o `npx serve -l 8765 .` y abrir http://localhost:8765/index.html

Requiere Python 3 o Node.js instalado.

## Uso
- Cambiá de rol desde el menú del usuario (arriba a la derecha): Visualizador (VP), Usuario responsable de iniciativas, Usuario responsable de tareas, CargadorObjetivo y Administrador.
- Los datos son de ejemplo y viven en memoria: al recargar la página se reinician.
- La fecha de referencia para alertas y vencimientos es 26/10/2026.

## Cambios en v5
- Nuevo ABM (solo Administrador): botón "ABM" en la home, debajo de Tablero VP (ícono de ABM de FARO), y entrada "ABM" en el menú lateral.
- Pantalla ABM con solapas Vicepresidencias, Gerencias, Departamentos, Áreas y Usuarios. Jerarquía: VP › Gerencia › Departamento › Área.
  - Encabezado: Volver + "ABM de …", búsqueda, Filtros (panel lateral: nivel superior, rol en usuarios, estado) y botón Agregar (terciario).
  - Grillas con el nivel superior, cantidad de dependientes, Estado (Activo / Inactivo, anteúltima columna) y Acciones con íconos editar / eliminar y tooltip. Paginado de 10 con paginador fijo al pie.
  - Usuarios: Nombre, Correo, Gerencia, Departamento, Área, Rol, Estado. Gerencia → Departamento → Área en cascada. El rol y el estado son los que usa la app para los permisos.
- Agregar / Editar en panel lateral con pie fijo (Cancelar · Agregar / Guardar cambios). Obligatorios con error en línea; valida nombres y correos repetidos. "Activo" es un toggle (sin texto Sí / No).
- Confirmación en modal central (Cancelar / Aceptar) antes de agregar, guardar cambios o eliminar. Mensaje de éxito: «La gerencia "Nombre" se ha cargado / actualizado / eliminado correctamente.»
- No se puede eliminar un registro con dependientes (gerencias, departamentos, áreas o usuarios asociados) ni el propio usuario: el ícono queda deshabilitado con tooltip que sugiere desactivarlo.
- Datos de ejemplo: 5 VP, 9 gerencias, 11 departamentos, 12 áreas y 12 usuarios.

## Cambios en v4
- Palanca estratégica: no tiene estado ni avance. Se quitaron las columnas Avance y Estado de la galería de palancas (quedan ID, Palanca, Descripción, Objetivos, Acciones), el avance del encabezado del detalle y la nota "El avance de la palanca es el promedio…". El badge ACTIVA refleja el campo Activa (Sí/No).
- Resumen de la galería: "Avance de la VP 2026: XX %" (sin real / proyectado).
- Detalle de objetivo: sin bloque Resumen; contenido a ancho completo. En el encabezado, alineado con el título y el badge: "Avance: XX %" coloreado y el botón Ubicación en la estrategia al extremo derecho.
- Detalle de tarea: el encabezado ya no muestra alertas (vencida, riesgo escalado, decisión pendiente, etc.), solo el estado. Se quitó la línea Responsable · Avance (barra) · Última actualización; el responsable sigue en Información de la tarea y el avance se muestra en el encabezado como "Avance: XX %" coloreado.
- Avance en todo el prototipo: siempre como % coloreado (< 60 % rojo, 60–80 % amarillo, ≥ 80 % verde); sin barras ni puntos de semáforo.

## Cambios en v3
- Avance: en todas las grillas y detalles se muestra una sola columna/dato "Avance" con el % coloreado (< 60 % rojo, 60–80 % amarillo, ≥ 80 % verde). Se quitaron "Avance real" y "Proyectado" de grillas, encabezados y bloques Resumen (el proyectado sigue cargándose en los resultados clave).
- Encabezado de iniciativa: "Avance: XX %" a la izquierda del botón Ubicación en la estrategia, alineado con el título y el badge de estado.
- Detalle de palanca: sin bloque Resumen; Información general y Objetivos de la palanca a ancho completo.
- Breadcrumbs: todos los niveles anteriores son links (Palanca › Objetivo › Iniciativa › Tarea); el nivel actual va en bold sin link. "Otra VP" queda sin link.
- Secciones de los detalles de Objetivo, Iniciativa y Tarea: en el título, lápiz de edición (solo si el rol puede editar esa sección) y chevron para contraer/expandir (círculo azul oscuro #02225D). Sin lápiz en secciones calculadas o listados.
- Detalle de iniciativa: al entrar, Indicadores de las tareas y Tareas abiertas; Información, Comentario ejecutivo, Resultados clave, Presupuesto y Riesgos contraídas. Presupuesto va debajo de Tareas.
- Indicadores de las tareas: 11 tarjetas en una fila a ancho completo (título arriba bold, número 36 px bold azul, radio 4 px, sombra suave); las de alerta con valor > 0 en rojo.
- Presupuesto (iniciativa y tarea): tarjetas con el mismo estilo, valores en 24 px color terciario (#015F7F).
- Paginador (Tareas e Iniciativas, más de 10 registros): fijo al pie de la pantalla, "Mostrando X–Y de N" a la izquierda y paginador centrado.
- Se quitaron las columnas Alertas y Semáforo de todas las grillas, las tarjetas KPI de Mis tareas y el contador del botón Filtros.
- Cargar iniciativa: sin botón Guardar (no hay guardado parcial); pie Cancelar · Cargar iniciativa.
- Peso de la iniciativa en el objetivo: solo lo carga el Administrador (formulario de iniciativa y Editar pesos). Usuario y CargadorObjetivo no lo cargan; las iniciativas que crean entran con 0 % (100 % si es la primera del objetivo).

## Cambios en v2
- Galería de palancas estratégicas: grilla con cada palanca y sus objetivos anidados (chevron para desplegar), acceso al detalle de palanca y de objetivo; Filtros en panel lateral (palanca, dirección, responsable, estado, año). Botón Nueva palanca en color terciario.
- Nuevo detalle de palanca: información general, objetivos de la palanca con "+" para agregar, bloque Resumen.
- Ubicación en la estrategia: botón violeta (doble chevron) sobre el Resumen en palanca y objetivo, y en el encabezado de iniciativa y tarea. Abre un panel lateral con el recorrido Palanca → Objetivos → Iniciativas → Tareas, con links a cada detalle.
- Detalle de objetivo con bloque Resumen y "+" en el título de Iniciativas.
- Cargar / Editar objetivo pasa a panel lateral (solo Cancelar y Cargar).
- Cargar tarea: sin guardado parcial (solo Cancelar y Cargar tarea). El guardado parcial queda solo en la iniciativa.
- Mis tareas: segunda fila de solapas por estado (En curso, Frenadas, No iniciadas, Finalizadas, Canceladas) y paginado de 10 registros.
- Iniciativas: columnas ID, Iniciativa, Objetivo (peso), Responsables, Avance (% con color), Estado.
- Detalle de tarea: sin historial ni eliminar; pie Cancelar · Editar · Registrar avance (terciario) · Cargar riesgo (terciario 70 %).
- Detalle de iniciativa: pie Cancelar · Editar · Cambiar estado (secundario azul oscuro) · Cargar tarea (terciario). Cambiar estado se hace en panel lateral y confirma en modal central.
- Barra de acciones fija al pie de la pantalla en detalles y formularios.
- Botones con border-radius 4 px. Estados vacíos con ícono "i" gris.

## Convenciones de UX a respetar
- Cargas y actualizaciones (registrar avance, seguimiento de resultado clave, riesgos, pesos, cambiar estado, cargar objetivo/palanca, cargar tarea desde la iniciativa) van en panel lateral con pie fijo; los botones siempre visibles.
- Los modales centrales son solo para confirmaciones: cambios de estado, cierres, cancelaciones y, en el ABM, agregar / editar / eliminar. Siempre Cancelar / Aceptar, título y Aceptar en azul.
- Colores de botones: primario azul (#0451DD), secundario azul oscuro (#02225D), terciario (#015F7F), Ubicación en la estrategia violeta (#5B00AB). Radio 4 px.
- Pie de detalle: Cancelar · Editar (primario) · acciones secundarias/terciarias. Fijo al pie de la pantalla.
- Campos obligatorios: error en línea (borde rojo + "Este campo es obligatorio.").
- Tablas: Estado siempre anteúltima columna; acciones de fila con ícono y tooltip. Avance en una sola columna con % coloreado.
- Secciones de detalle: lápiz de edición (según rol) y chevron para contraer en el título.
- Breadcrumbs siempre con links a los niveles anteriores.
- Listados: botón Filtros con panel lateral.
- Mensajes de éxito: «La iniciativa "Nombre" se ha cargado correctamente.»

## Cálculos (C-01 a C-08)
Avance desde los resultados clave hacia arriba (iniciativa → objetivo → VP), real y proyectado; color: < 60 % rojo, 60–80 % amarillo, ≥ 80 % verde (parámetros). Las tareas no suman al avance: generan alertas (vencida, próxima a vencer, sin actualizar, riesgo escalado, decisión pendiente) que se ven en los Indicadores de las tareas de la iniciativa.

## Contenido
- `index.html` — prototipo (markup + lógica)
- `assets/dc-runtime.js` — runtime (incluye React 18.3.1)
- `assets/*.png|svg|jpg` — logo, firma e ilustración de la home
