# Quickstart: validar la Home

Guía de validación de la feature. No contiene implementación.

## Prerrequisitos

- Node.js compatible con SPFx 1.22.2 y dependencias instaladas (`npm install`).
- Implementación completa según `tasks.md`.

## Pasos

1. Compilar: `npm run build`. Debe terminar sin errores de lint ni de TypeScript.
2. Levantar el entorno de desarrollo: `npm run start` (Heft, sin abrir navegador) y abrir el workbench o la página de prueba con el webpart `objetivosVp`. No se despliega ni se toca el tenant.
3. Comparar la pantalla con `docs/pantallas/Home.png` a ancho de escritorio.

## Resultados esperados

| Verificación | Resultado | Requisito |
|--------------|-----------|-----------|
| Título y texto de la tarjeta | Idénticos a la captura | FR-001, FR-002 |
| Ilustración | Presente dentro de la tarjeta | FR-003 |
| Marca y "Manual de usuario" | Debajo de la tarjeta, marca a la izquierda y manual a la derecha | FR-004, FR-005 |
| Accesos | Cinco, apilados, en el orden Mis tareas, Mis iniciativas, Palancas y objetivos, Tablero VP, ABM | FR-006 |
| Cada acceso | Título a la izquierda, ícono a la derecha, color propio | FR-007 |
| Disposición | Dos columnas: tarjeta (con marca y manual) a la izquierda, accesos a la derecha | FR-008 |
| Cursor y teclado | Los accesos y el manual se perciben clickeables y se alcanzan con Tab | FR-009 |
| Activación (clic, Enter, Espacio) | No navega, no abre pestañas, la pantalla no cambia | FR-010 |
| Sin elementos extra | Sin barra superior del sitio, sin marca de agua, sin botones "Ver detalle" | FR-013, FR-014 |
| Colores, tipografías y espaciados | Solo desde tokens del Design System (colores de los accesos desde `colorScales`) | Constitución II |
| Excepciones aprobadas | "Manual de usuario" se ve como botón secundario; íconos y dos colores de accesos son aproximados y provisorios | plan.md, Q2–Q4 |

## Fuera de esta validación

Adaptación a pantallas angostas, roles, datos y navegación (fuera de alcance según la spec).
