---
description: Crear o modificar código, manifiestos, localización y configuración de soluciones SPFx y SharePoint.
applyTo: "src/**/*.ts,src/**/*.tsx,src/**/*.manifest.json,src/**/loc/**/*,config/package-solution.json,config/serve.json"
---

# SPFx y SharePoint

## APIs y contexto

- Respetá la versión real de SPFx y utilizá únicamente APIs y patrones compatibles con ella.
- Obtené el contexto de SharePoint mediante el contexto que provee SPFx al componente.
- No introduzcas jQuery.

## Acceso al DOM

- Evitá el acceso directo al DOM desde componentes, hooks y servicios. Cuando sea estrictamente necesario, como en gestión de foco, mediciones, observers o integración con APIs del navegador, utilizá referencias de React o el mecanismo compatible con la arquitectura existente, limitá el acceso al componente responsable y justificalo técnicamente.
- No consultes ni modifiques nodos fuera del subárbol del propio componente, porque una misma página de SharePoint puede alojar varias instancias del mismo componente.
- Para aperturas programáticas de enlaces, aplicá `.github/instructions/security.instructions.md` y reutilizá la utilidad centralizada existente, sin replicar su acceso al DOM desde los componentes.

## Librerías del ecosistema

- Reutilizá la configuración, los servicios, los helpers y las instancias existentes.
- Respetá las versiones instaladas de PnPjs, Fluent UI y demás librerías, sin asumirlas.
- Detectá qué línea de Fluent UI utiliza el proyecto y no mezcles APIs ni imports de líneas distintas dentro del mismo proyecto.
- Detectá qué versión mayor de PnPjs utiliza el proyecto y respetá su modelo de inicialización y sus APIs, sin combinar patrones de versiones distintas.
- No introduzcas APIs pertenecientes a otra versión de SPFx, PnPjs o Fluent UI.
- Cuando el proyecto ya utilice los subconjuntos de utilidades que provee SPFx, preferilos frente a importar la librería completa equivalente.

## Configuración y entorno

- No hardcodees URLs de sitios, nombres dependientes del ambiente, grupos ni identificadores privados del tenant. Usá los mecanismos de configuración existentes.
- No versiones URLs de tenant ni datos de entorno en los archivos de configuración de desarrollo.

## Manifiestos y empaquetado

- Preservá los identificadores existentes de los componentes en `*.manifest.json` y de la solución en `config/package-solution.json`.
- No regeneres esos identificadores sin una necesidad explícita ni copies el mismo identificador entre componentes o soluciones diferentes.
- Incrementá la versión de la solución en `config/package-solution.json` únicamente cuando el empaquetado lo requiera y se haya solicitado, teniendo en cuenta que ese valor puede leerse en tiempo de ejecución.
- No versiones artefactos de compilación ni paquetes generados.

## Modelo de datos de SharePoint

- No infieras internal names de listas o columnas únicamente a partir de sus display names.
- Si la documentación, el código y la configuración real de SharePoint difieren, informá la inconsistencia antes de modificar el proyecto.
- Mantené compatibilidad con los elementos históricos cuando cambien modelos o columnas.

## Localización

- Utilizá el mecanismo de localización existente para todos los textos visibles al usuario.
- No dupliques leyendas si ya existe un recurso de localización correspondiente.
- Mantené sincronizadas las claves entre el contrato de tipos de localización del componente y todos los archivos de idioma existentes bajo su carpeta `loc`. Al agregar, renombrar o eliminar una clave, actualizá el contrato y cada archivo de idioma presente.
- No crees idiomas nuevos ni asumas una estrategia regional a partir de los idiomas ya declarados. Si un requerimiento exige un idioma que el componente no declara, informalo y solicitá confirmación antes de agregarlo.
