# Instrucciones globales del repositorio

## Contexto general

- El repositorio contiene una solución de SharePoint Online desarrollada con SPFx, React, TypeScript y SCSS.
- No asumas versiones ni herramientas de compilación determinadas.
- Obtené siempre las versiones y configuraciones de los archivos reales del repositorio y, cuando sea posible, contrastalas con el entorno de ejecución.
- Las fuentes técnicas del proyecto son `package.json`, `package-lock.json`, `tsconfig.json`, `.yo-rc.json`, los scripts declarados y los archivos de configuración del toolchain.
- Todo código generado o modificado debe ser compatible con las versiones declaradas en `package.json`, resueltas en `package-lock.json` y con la configuración efectiva del proyecto.
- Nunca uses como referencia una versión prefijada ni automáticamente la última versión disponible de una dependencia o API.

## Bloqueo ante dudas funcionales

- No realices cambios ni generes implementaciones cuando existan dudas funcionales sobre lo que debe construirse.
- Antes de editar, identificá requerimientos ausentes, ambiguos, contradictorios o insuficientes que puedan modificar el comportamiento esperado.
- Ante una duda funcional, detenete, explicá concretamente qué no está definido, formulá las preguntas necesarias y esperá una respuesta explícita antes de continuar.
- No infieras reglas de negocio, estados, permisos, obligatoriedad de datos, comportamientos, validaciones ni relaciones entre entidades a partir de nombres, el prototipo, documentación parcial o código existente.
- El prototipo navegable de `docs/Gestion-Objetivos-VP-RRII-prototipo_v5/` es la referencia visual de cada pantalla (disposición, componentes y textos); cada tarea cita el archivo y la sección del prototipo. Las reglas de negocio surgen de `spec.md` y `plan.md`, no del prototipo.
- No consideres el silencio, una suposición probable ni una implementación previa como confirmación de un requerimiento funcional.
- Resolvé sin consulta solamente las decisiones técnicas que no alteren el comportamiento funcional y que respeten la arquitectura y las convenciones existentes.

## Análisis previo

- Inspeccioná la estructura del repositorio, los archivos directamente relacionados y las implementaciones equivalentes antes de proponer o modificar código.
- Buscá implementaciones análogas antes de crear archivos, servicios, entidades, modelos o utilidades.
- No asumas que un archivo, tipo, servicio, entidad, constante o utilidad no existe sin haberlo buscado previamente.
- Determiná el alcance, las dependencias y los posibles efectos laterales antes de editar.
- Si falta información técnica que pueda cambiar materialmente la solución, detenete, indicá qué dato falta y solicitá confirmación.

## Arquitectura y código existente

- Mantené consistencia con el entorno, la configuración, el toolchain, la arquitectura y las convenciones existentes.
- Conservá la implementación actual cuando sea correcta y compatible.
- No reemplaces código solamente porque exista una alternativa diferente o más nueva.
- Justificá técnicamente toda creación de archivos, capas, estructuras o abstracciones; además debe ser estrictamente necesaria.
- Si la arquitectura existente debe modificarse por un requerimiento, defecto, incompatibilidad o riesgo técnico, explicá previamente el motivo, el impacto y las alternativas consideradas.
- Realizá cambios mínimos, cohesivos y enfocados en el requerimiento.
- No refactorices código ajeno al requerimiento.
- No dupliques funcionalidades, servicios, modelos, tipos, constantes ni utilidades.
- Preservá el comportamiento existente salvo que el requerimiento indique expresamente cambiarlo.
- Respetá la nomenclatura, la organización de carpetas, el estilo y el idioma utilizados por el código existente. No traduzcas ni renombres identificadores sin una necesidad funcional o técnica.
- Aplicá KISS, DRY y SOLID de manera pragmática, priorizando la simplicidad y evitando abstracciones cuyo costo supere su beneficio.
- Favorecé alta cohesión, bajo acoplamiento y encapsulamiento.
- Exponé únicamente los contratos necesarios y ocultá los detalles internos.
- Evitá código duplicado, código muerto, abstracciones innecesarias y funciones o clases con responsabilidades múltiples.

## Design System

- Toda la interfaz se construye con el Design System de YPF ubicado en `src/core/ui`.
- Antes de construir o modificar cualquier elemento visual, leé `docs/design-system-catalog.md` y seguí su sección "Reglas de uso".
- No modifiques `src/core/ui` salvo que la tarea lo indique explícitamente. Si creés que un componente del Design System necesita un cambio, detenete y consultá. No reexportes `ui` desde `core/index.ts`.
- Si ningún componente del catálogo corresponde a un elemento del diseño, detenete y consultá. No crees componentes ad hoc ni uses HTML nativo en su lugar.

## Conflictos entre fuentes y alternativas

- No corrijas silenciosamente una inconsistencia que pueda cambiar contratos, datos, permisos o comportamiento existente. Exponela antes de modificar.
- Cuando existan varias soluciones válidas con impactos diferentes, presentá las alternativas y solicitá una decisión antes de realizar un cambio estructural.
- Si detectás una incompatibilidad técnica, no continúes como si fuera válida: informá los componentes afectados, el impacto y las alternativas posibles.
- No asumas compatibilidad entre proyectos con versiones o toolchains diferentes. Evaluala siempre en función de la configuración y las dependencias de cada repositorio.

## Dependencias, seguridad y entornos

- Utilizá primero las librerías, servicios, helpers y configuraciones existentes.
- No instales, elimines, reemplaces ni actualices dependencias sin autorización explícita.
- Toda dependencia nueva debe tener una necesidad concreta, ser compatible con el stack detectado y no duplicar capacidades existentes.
- No modifiques archivos de configuración globales como solución rápida para un problema localizado sin justificar su impacto sobre todo el proyecto.
- No expongas secretos, tokens, credenciales, datos personales, payloads sensibles, URLs sensibles ni identificadores privados del tenant en código, ejemplos o registros.
- Tratá los lineamientos de seguridad del proyecto y los hallazgos de AppScan como criterios de aceptación del código generado o modificado. Las reglas operativas correspondientes están en `.github/instructions/security.instructions.md`.
- Utilizá los mecanismos de configuración existentes para URLs, nombres de listas, grupos, permisos y demás valores dependientes del entorno.
- No crees, modifiques ni elimines listas, columnas, vistas, permisos, grupos, archivos o datos reales de SharePoint sin autorización explícita.
- No despliegues paquetes ni ejecutes acciones contra entornos reales sin autorización explícita.
- Aplicá el principio de mínimo privilegio.

## Spec Kit

- El proyecto se rige por `.specify/memory/constitution.md`, que prevalece sobre cualquier spec, plan o tarea.
- Al implementar, seguí `tasks.md` de la feature activa en el orden indicado, una tarea por vez, usando los componentes del Design System que cada tarea nombra.
- Durante la implementación no modifiques `spec.md` ni `plan.md`. Si una tarea no puede cumplirse como está escrita, detenete y explicá el motivo.

## Validación y entrega

- Antes de declarar una tarea terminada, identificá y ejecutá los controles realmente disponibles en el proyecto, como compilación, lint y verificación de tipos.
- Utilizá los scripts definidos en el repositorio.
- No inventes comandos ni sustituyas el toolchain configurado sin justificación.
- No afirmes que una solución funciona si no pudo compilarse o validarse.
- Si una validación no puede ejecutarse o falla por una causa preexistente, informá el comando, el resultado y el riesgo pendiente.
- Informá de forma concisa qué cambió, por qué fue necesario, cómo fue validado y qué riesgos permanecen.
- Enumerá las suposiciones realizadas y las validaciones no ejecutadas.
- Diferenciá claramente entre cambios realizados, recomendaciones opcionales y trabajo pendiente.

## Instrucciones especializadas

- Identificá y aplicá las instrucciones de `.github/instructions` cuyo `applyTo` corresponda a los archivos involucrados.
- Si una tarea involucra varias tecnologías, aplicá conjuntamente todas las instrucciones coincidentes.
- Las instrucciones aplicables deben ser compatibles entre sí. No dependas de un orden de precedencia entre archivos `.instructions.md`.
- Una regla especializada que restringe, precisa o acota un principio general no constituye una contradicción, sino su aplicación al contexto correspondiente.
- Si dos instrucciones aplicables resultan efectivamente contradictorias, detenete, exponé el conflicto y solicitá su resolución antes de modificar código.
- Ante un conflicto entre cualquier regla y la arquitectura, la nomenclatura o las convenciones ya aplicadas de forma consistente en el repositorio, prevalece el código existente, salvo que exista una necesidad funcional o técnica justificada para cambiarlo.