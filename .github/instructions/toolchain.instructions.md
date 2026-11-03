---
description: Validar y preservar el toolchain, las versiones y la compatibilidad de una solución SPFx.
applyTo: "package.json,package-lock.json,tsconfig.json,.yo-rc.json,gulpfile.js,.eslintrc.js,config/**/*"
---

# Toolchain, versiones y compatibilidad

## Identificación de versiones

- Identificá las versiones declaradas, resueltas e instaladas antes de trabajar.
- Usá `.yo-rc.json` como evidencia de la versión del generador con la que se creó el proyecto, no como fuente de la versión vigente.
- Determiná la versión efectiva de SPFx mediante los paquetes `@microsoft/sp-*` declarados en `package.json` y resueltos en `package-lock.json`.
- Si `.yo-rc.json`, `package.json` y `package-lock.json` difieren, informá la inconsistencia y priorizá las dependencias efectivamente declaradas y resueltas para evaluar el código actual.

## Compatibilidad

- Verificá la compatibilidad entre SPFx, Node.js, npm, React, React DOM, TypeScript, Sass, PnPjs, Fluent UI y los paquetes `@microsoft/*` involucrados.
- Usá la versión de SPFx como referencia principal para evaluar la compatibilidad del toolchain, incluidas las versiones de Node.js, React y TypeScript.
- Verificá que los paquetes `@microsoft/*` relacionados con SPFx mantengan versiones compatibles entre sí.
- No actualices React, React DOM ni TypeScript de forma independiente de la versión de SPFx, porque el template los condiciona.

## Detección del toolchain

- Detectá el toolchain efectivo mediante los scripts, las dependencias y los archivos de configuración del repositorio.
- No infieras el toolchain únicamente a partir de la versión de Node.js o de SPFx.
- Si el proyecto utiliza Heft, respetá sus scripts y su configuración.
- Si el proyecto utiliza Gulp, respetá el `gulpfile` y el build rig existentes.
- No mezcles comandos, configuraciones, paquetes ni convenciones de Heft y Gulp dentro de un mismo proyecto, salvo que se solicite y justifique explícitamente una migración.

## Manifiestos y árbol instalado

- Diferenciá las versiones declaradas en `package.json`, las resueltas en `package-lock.json` y las disponibles en el entorno de ejecución.
- Considerá `package.json` como declaración de dependencias y `package-lock.json` como resolución reproducible.
- No consideres una inconsistencia que `package.json` declare un rango semántico y `package-lock.json` resuelva una versión exacta permitida por ese rango.
- Utilizá `node_modules` únicamente como evidencia secundaria del estado local, nunca como fuente principal de verdad.
- Si `package.json`, `package-lock.json` y `node_modules` presentan una inconsistencia real, inspeccioná el árbol instalado antes de modificar dependencias.
- Cuando el árbol instalado compile y ejecute correctamente el proyecto, incluido su modo de desarrollo con recarga, usalo como evidencia técnica para proponer una reconciliación reproducible entre `package.json` y `package-lock.json`, sin introducir actualizaciones o degradaciones ajenas a esa corrección.
- Después de reconciliar una inconsistencia, verificá que los manifiestos representen de forma reproducible el árbol funcional y volvé a ejecutar las validaciones del toolchain detectado.

## Configuración de lint

- No desactives, relajes ni elimines reglas de ESLint en la configuración del proyecto sin autorización explícita y una justificación técnica.
- No amplíes los patrones de exclusión del lint ni deshabilites su ejecución para que una compilación o un empaquetado pasen.
- Si una regla de lint bloquea un cambio legítimo, informá la regla, el archivo y el motivo, y proponé corregir el código antes que modificar la configuración.
- Las supresiones puntuales dentro del código se rigen por `.github/instructions/typescript.instructions.md`.

## Cambios de dependencias

- Si se autoriza un cambio de dependencias, mantené sincronizados `package.json` y `package-lock.json`.
- No actualices ni degrades dependencias arbitrariamente.
- No modifiques versiones ni dependencias sin autorización explícita. La reconciliación de una inconsistencia real y verificada se limita a reproducir el estado funcional existente.
- Utilizá siempre los scripts y comandos reales del proyecto.
