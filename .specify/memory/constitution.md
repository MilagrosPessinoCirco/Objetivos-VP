<!--
Sync Impact Report (temporal; eliminar antes del commit)
- Cambio de versión: (plantilla sin completar) → 0.1.0
- Principios agregados: I. Plataforma; II. La interfaz no se inventa (NO NEGOCIABLE);
  III. Datos desacoplados; IV. Simplicidad y cambios acotados
- Secciones agregadas: Contexto; Flujo de desarrollo; Gobernanza (con enmiendas, versionado y revisión)
- Secciones eliminadas: ninguna (se reemplazaron los slots PRINCIPLE_5 y SECTION_* de la plantilla)
- Pendientes: ninguno. Ratificación fijada en la fecha de adopción de esta versión.
- Plantillas dependientes: no se modifican aquí; leen la constitución en tiempo de ejecución.
-->

# Constitución · Gestión de Portfolio VP

## Principios Fundamentales

### I. Plataforma

- La solución MUST usar SharePoint Framework (SPFx) con React y TypeScript.
- Las versiones MUST ser las fijadas en el `package.json` del repo. No se actualizan ni se
  agregan dependencias sin una decisión explícita registrada en el plan.

### II. La interfaz no se inventa (NO NEGOCIABLE)

- Cada pantalla MUST construirse a partir de su diseño provisto, en `docs/pantallas/`. No se
  agregan pantallas, disposiciones ni elementos que no estén en el diseño.
- Los elementos de la pantalla MUST resolverse con componentes del Design System, ubicado en
  `DESIGN-SYSTEM-SHP-TEMPLATE/`. Si no hay un componente que corresponda, se consulta antes de
  crear uno propio.
- Para lo que el Design System no cubra, se usa Fluent UI React.
- NO se definen colores, tipografías ni espaciados propios por fuera del Design System.
- Si falta una imagen o un ícono, se usa un placeholder con nombre descriptivo.
- Primero funcionalidad correcta, con la pantalla lo más cercana posible al diseño.
- Estructura de cada pantalla: una carpeta por pantalla con su componente principal
  (`NombrePantalla.tsx`) y sus estilos (`NombrePantalla.module.scss`); las piezas que la componen
  van en subcarpetas y se importan desde el componente principal.
- Las imágenes se toman de `src/core/ui/img/` y los íconos de `src/core/ui/img/svg/`.

### III. Datos desacoplados

- Los componentes NO acceden a SharePoint directamente: usan servicios con interfaces definidas.
- Cada servicio MUST tener una implementación mock, para poder construir pantallas sin depender
  de las listas ni del tenant.
- Los tipos de cada entidad se definen una sola vez y se comparten.

### IV. Simplicidad y cambios acotados

- Se implementa lo que pide la tarea, nada más. Sin sobreingeniería.
- No se modifica código existente que la tarea no requiera tocar.
- Dominio, servicios y componentes NO se mezclan.
- TypeScript en modo estricto. Sin `any` salvo justificación explícita.

## Contexto

Gestión de Portfolio VP es una aplicación interna de la VP de Relaciones Institucionales de YPF
para seguir palancas, objetivos, iniciativas, resultados clave y tareas.

## Flujo de desarrollo

- Una feature de Spec Kit por rama: specify → clarify → plan → tasks → analyze → implement.
- La especificación, el plan y las tareas se generan con Claude Code; la implementación puede
  hacerse con GitHub Copilot. Por eso `tasks.md` MUST ser autosuficiente: cada tarea indica el
  archivo exacto que toca y su criterio de terminado.
- Durante la implementación NO se modifican `spec.md` ni `plan.md`. Si aparece un problema, se
  corrige del lado de la especificación y se regeneran las tareas.

## Gobernanza

- Esta constitución prevalece sobre cualquier spec, plan o tarea.
- Enmiendas: se proponen por cambio versionado en este archivo, indicando el motivo, y rigen una
  vez incorporadas a la rama principal.
- Versionado (semántico): MAJOR por eliminación o redefinición incompatible de principios;
  MINOR por principio o sección nuevos o ampliación material; PATCH por aclaraciones o redacción.
- Revisión de cumplimiento: el plan MUST verificar su conformidad con estos principios y
  justificar cualquier desvío antes de generar las tareas.

**Versión**: 0.1.0 | **Ratificada**: 2026-11-04 | **Última modificación**: 2026-11-04
