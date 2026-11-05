# Constitución · Gestión de Portfolio VP

## Principios Fundamentales

### I. Plataforma

- La solución DEBE usar SharePoint Framework 1.22.2 con React 17, TypeScript, Fluent UI v8
  y PnPjs, sobre la plantilla SPFx de YPF.
- Las versiones DEBEN ser las fijadas en el `package.json` del repo. No se agregan, quitan ni
  actualizan dependencias sin una decisión explícita registrada en el plan.
- `src/core` concentra lo compartido (actions, api, entities, pnp, ui, utils) y `src/webparts`
  lo consume.

### II. La interfaz no se inventa (NO NEGOCIABLE)

- Cada pantalla DEBE construirse a partir de su diseño provisto: el prototipo de
  `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/`, citando archivo y sección. No se
  agregan pantallas, disposiciones ni elementos que no estén en el diseño.
- Los elementos de la pantalla DEBEN resolverse con el Design System de YPF, ubicado en
  `src/core/ui`, siguiendo `docs/design-system-catalog.md`. Si ningún componente corresponde,
  se detiene y se consulta; no se crean componentes ad hoc.
- `src/core/ui` DEBE mantenerse alineado con el Design System de YPF. Solo se modifica
  cuando el plan lo decide explícitamente y lo registra en Complexity Tracking; el agente
  no lo modifica por iniciativa propia. Toda modificación se anota en
  `docs/design-system-cambios.md` para poder reaplicarla al actualizar el DS.
- NO se definen colores, tipografías ni espaciados propios por fuera del Design System.
- Estructura de cada pantalla: una carpeta por pantalla con su componente principal
  (`NombrePantalla.tsx`) y sus estilos (`NombrePantalla.module.scss`); las piezas que la
  componen van en subcarpetas y se importan desde el componente principal.
- Textos de interfaz en español (Argentina).

### III. Datos desacoplados

- Los componentes NO acceden a SharePoint directamente: usan servicios con interfaces
  definidas, sobre el Datasource de `core/api` y el contexto de `core/pnp`.
- Cada servicio DEBE tener una implementación mock, para poder construir pantallas sin
  depender de las listas ni del tenant.
- Los tipos de cada entidad se definen una sola vez en `core/entities` y se comparten.

### IV. Simplicidad y cambios acotados

- Se implementa lo que pide la tarea, nada más. Sin sobreingeniería.
- No se modifica código existente que la tarea no requiera tocar.
- Dominio, servicios y componentes NO se mezclan.
- TypeScript en modo estricto. Sin `any` salvo justificación explícita.
- Sin comentarios de código, salvo para explicar una incompatibilidad concreta entre el
  diseño y Fluent UI.

### V. Validación

- Cada tarea termina con `npm run build` sin errores.

## Contexto

Gestión de Portfolio VP es una aplicación interna de la VP de Relaciones Institucionales de
YPF para seguir palancas, objetivos, iniciativas, resultados clave y tareas.

## Flujo de desarrollo

- Una feature de Spec Kit por rama: specify → clarify → plan → tasks → analyze → implement.
- La especificación, el plan y las tareas se generan con Claude Code; la implementación
  puede hacerse con GitHub Copilot. Por eso `tasks.md` DEBE ser autosuficiente: cada tarea
  indica el archivo exacto que toca, los componentes del Design System que usa y su criterio
  de terminado.
- El plan de cada pantalla DEBE incluir un mapa de componentes: región del diseño →
  componente del Design System y variante, o "consultar" si no hay correspondencia.
- Durante la implementación NO se modifican `spec.md` ni `plan.md`. Si aparece un problema,
  se corrige del lado de la especificación y se regeneran las tareas.

## Gobernanza

- Esta constitución prevalece sobre cualquier spec, plan o tarea.
- Revisión de cumplimiento: el plan DEBE verificar su conformidad con estos principios y
  justificar cualquier desvío antes de generar las tareas.

**Versión**: 0.4.0 | **Ratificada**: 2026-11-04 | **Última modificación**: 2026-11-05